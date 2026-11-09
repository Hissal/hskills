'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// The guard is the command-guard plugin in the checkout's own marketplace, so,
// like linked skills, it follows the checkout it was registered from.
const MARKETPLACE = 'hskills';
const PLUGIN = 'command-guard@' + MARKETPLACE;
const installed = list => Array.isArray(list) ? list : list.installed;
const marketplaces = list => Array.isArray(list) ? list : list.marketplaces || [];

// A regular file can still be redirected by a replaced parent directory.
// The caller-selected home is the boundary; every parent below it must be real.
function replacedParent(file, home) {
  const relative = path.relative(home, file);
  if (path.isAbsolute(relative) || relative === '..' || relative.startsWith('..' + path.sep)) return true;
  if (!relative) return false;
  for (let dir = path.dirname(file); path.relative(home, dir); dir = path.dirname(dir)) {
    try {
      const info = fs.lstatSync(dir);
      if (!info.isDirectory() || info.isSymbolicLink()) return true;
    } catch (e) {
      if (e.code === 'ENOTDIR') return true;
      if (e.code !== 'ENOENT') throw e;
    }
  }
  return false;
}

// The same directory by identity, not spelling: Codex records the resolved path,
// which can differ from the checkout's in case or Windows short names. A
// filesystem without file IDs falls back to resolved links. A missing path is
// never the same.
function samePath(a, b) {
  try {
    const [x, y] = [a, b].map(p => fs.statSync(p, { bigint: true }));
    return x.ino ? x.dev === y.dev && x.ino === y.ino : fs.realpathSync(a) === fs.realpathSync(b);
  } catch (e) { if (e.code === 'ENOENT') return false; throw e; }
}

function registration(home, checkout, action = 'install') {
  const guard = path.join(checkout, 'hooks/command-guard');
  const file = path.join(home, '.hskills/plugins.json');
  if (replacedParent(file, home)) throw new Error('CONFLICT plugin ownership record parent');
  let record;
  try { record = fs.lstatSync(file); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  if (record && (!record.isFile() || record.isSymbolicLink())) throw new Error('CONFLICT plugin ownership record');
  const data = record ? JSON.parse(fs.readFileSync(file)) : { hosts: [], writes: [] };
  const save = () => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n'); };
  const roots = ['.claude/plugins', '.codex/plugins', '.claude/settings.json', '.codex/config.toml'];
  function inventory() {
    const entries = {};
    function visit(p) {
      let info;
      try { info = fs.lstatSync(p); } catch (e) { if (e.code === 'ENOENT') return; throw e; }
      if (info.isSymbolicLink()) throw new Error('CONFLICT symlink in registration files: ' + p);
      if (info.isDirectory()) for (const n of fs.readdirSync(p)) visit(path.join(p, n));
      else if (info.isFile()) entries[p] = fs.readFileSync(p, 'base64');
    }
    roots.forEach(p => visit(path.join(home, p)));
    return entries;
  }
  function currentBytes(p) {
    if (replacedParent(p, home)) return undefined;
    let info;
    try { info = fs.lstatSync(p); } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
    return info.isFile() && !info.isSymbolicLink() ? fs.readFileSync(p, 'base64') : undefined;
  }
  function validatedWrites() {
    return data.writes.map(w => {
      const current = currentBytes(w.path);
      if (current === w.after) return w;
      const delta = w.path === path.join(home, '.codex/config.toml')
        ? require('./codex-trust-delta')(w, current) : null;
      if (!delta) throw new Error('CONFLICT changed registration preserved: ' + w.path);
      return delta;
    });
  }
  function restore(writes) {
    let ok = true;
    for (const w of [...writes].reverse()) {
      const current = currentBytes(w.path);
      if (current !== w.after) { console.log('CONFLICT changed registration preserved: ' + w.path); ok = false; continue; }
      if (w.before === null) fs.unlinkSync(w.path);
      else fs.writeFileSync(w.path, Buffer.from(w.before, 'base64'));
      writes.splice(writes.indexOf(w), 1);
    }
    return ok;
  }
  if (action === 'uninstall') {
    data.writes = validatedWrites();
    try {
      const ok = restore(data.writes); if (ok) data.hosts = [];
      return ok;
    } finally {
      // Persist completed removals even when a later filesystem operation fails.
      save();
    }
  }
  const env = { ...process.env, HOME: home, USERPROFILE: home, CLAUDE_CONFIG_DIR: path.join(home, '.claude'), CODEX_HOME: path.join(home, '.codex'), XDG_CONFIG_HOME: path.join(home, '.config') };
  function call(host, args) {
    const binary = process.env['COMMAND_GUARD_' + host.toUpperCase()] || host;
    const r = spawnSync(binary.endsWith('.cjs') ? process.execPath : binary, binary.endsWith('.cjs') ? [binary, ...args] : args, { env, cwd: home, encoding: 'utf8', timeout: 60000 });
    if (r.status !== 0) throw new Error(binary + ' ' + args.join(' ') + '\n' + (r.error || '') + r.stdout + r.stderr);
    return JSON.parse(r.stdout);
  }
  // Claude reads the plugin folder in place; Codex reports it as the plugin's
  // local source and runs the copy it made from it at `plugin add`.
  function inspect(host, folder) {
    const settings = path.join(home, '.claude/settings.json');
    if (host === 'claude' && fs.existsSync(settings) && JSON.parse(fs.readFileSync(settings)).disableAllHooks) throw new Error('disabled Claude hooks');
    const entry = installed(call(host, ['plugin', 'list', '--json'])).find(p => (p.id || p.pluginId) === PLUGIN);
    const effective = entry && (entry.readFromFolder || entry.source?.path || entry.installPath);
    if (!entry || !entry.enabled || !effective || !samePath(effective, folder)) throw new Error('missing, disabled or overridden plugin: ' + host);
  }
  // The previous installer's record of its own settings handlers, if any.
  const legacyFile = path.join(home, '.hskills/guard.json');
  function legacyRecord() { return fs.existsSync(legacyFile) ? JSON.parse(fs.readFileSync(legacyFile)) : null; }
  let codexGroups = null;
  function ready(host) {
    if (host === 'claude') return true; // inspect verifies enabled effective registration.
    const r = spawnSync(process.execPath, [path.join(__dirname, 'codex-hook-status.js')], { env, cwd: home, encoding: 'utf8', timeout: 15000 });
    try {
      if (r.status !== 0) throw new Error('Codex hook status unavailable');
      const groups = JSON.parse(r.stdout).result.data;
      if (!Array.isArray(groups)) throw new Error('Codex hook status unavailable');
      codexGroups = groups;
      return groups.length > 0 && groups.every(group => {
        const hooks = group.hooks.filter(h => h.source === 'plugin' && h.pluginId === PLUGIN);
        return !(group.errors || []).length && hooks.length > 0 && hooks.every(h => h.enabled && h.trustStatus === 'trusted');
      });
    } catch { codexGroups = null; return false; }
  }
  function probeGuard(folder) {
    const probeState = fs.mkdtempSync(path.join(require('os').tmpdir(), 'guard-probe-'));
    try {
      for (const adapter of ['claude-code.js', 'codex.js']) {
        for (const [command, deny] of [['git push --force origin main', true], ['git status', false]]) {
          const r = spawnSync(process.execPath, [path.join(folder, 'adapters', adapter)], { env: { ...env, COMMAND_GUARD_HOME: folder, COMMAND_GUARD_STATE: probeState }, input: JSON.stringify({ cwd: probeState, tool_name: 'Bash', tool_input: { command } }), encoding: 'utf8', timeout: 10000 });
          if (r.status !== 0 || (deny ? !r.stdout.includes('HUMAN-REQUIRED') : r.stdout !== '')) throw new Error('guard adapter probe failed: ' + adapter + ' ' + r.stdout + r.stderr);
        }
      }
    } finally { fs.rmSync(probeState, { recursive: true, force: true }); }
  }
  if (action === 'doctor') {
    if (!data.hosts.length) throw new Error('missing plugin registration');
    let pending = false;
    for (const h of data.hosts) { inspect(h.host, h.source); probeGuard(h.source); console.log('REGISTERED ' + h.host + ': ' + h.source); }
    for (const h of data.hosts) {
      if (!ready(h.host)) { console.log('PENDING Codex human trust: review the current hook in /hooks.');
        const commands = (legacyRecord()?.groups || []).flatMap(g => g.hooks || []).map(h => h.command);
        const fallback = (codexGroups || []).flatMap(g => g.hooks || []).filter(h => h.source === 'user' && commands.includes(h.command));
        const protectedFallback = !!codexGroups?.length && codexGroups.every(g => !(g.errors || []).length && g.hooks.some(h => fallback.includes(h) && h.enabled && h.trustStatus === 'trusted'));
        console.log('Codex legacy fallback: ' + (codexGroups === null ? 'status unavailable' : fallback.length ? fallback.map(h => (h.enabled ? 'enabled/' : 'disabled/') + h.trustStatus).join(', ') : 'absent'));
        console.log(protectedFallback ? 'PROTECTED by trusted legacy fallback while plugin trust is pending (hooks/list status; live invocation unverified).' : 'UNPROTECTED: no verified trusted legacy fallback; human /hooks review required.');
        pending = true; }
    }
    return !pending;
  }
  // Validate the complete journal before probes, backups or host commands.
  data.writes = validatedWrites();
  probeGuard(guard);
  for (const host of ['claude', ...(fs.existsSync(path.join(home, '.codex')) ? ['codex'] : [])]) {
    data.backups ||= [];
    const settingsPath = path.join(home, host === 'claude' ? '.claude/settings.json' : '.codex/config.toml');
    if (fs.existsSync(settingsPath) && !fs.existsSync(settingsPath + '.before-command-guard')) {
      fs.copyFileSync(settingsPath, settingsPath + '.before-command-guard');
      data.backups.push(settingsPath + '.before-command-guard'); save();
    }
    const previous = inventory();
    try {
      if (!data.hosts.some(h => h.host === host) && installed(call(host, ['plugin', 'list', '--json'])).some(p => (p.id || p.pluginId) === PLUGIN)) {
        throw new Error('CONFLICT unrecorded plugin: ' + PLUGIN);
      }
      // Another checkout's marketplace of the same name is not this one: Claude
      // would re-point it, plugins and all, and Codex refuses to.
      const market = marketplaces(call(host, ['plugin', 'marketplace', 'list', '--json'])).find(m => m.name === MARKETPLACE);
      const at = market && (market.path || market.root || market.installLocation);
      if (market && !(at && samePath(at, checkout))) throw new Error('CONFLICT ' + host + ' marketplace ' + MARKETPLACE + ' is registered from ' + (at || 'another source'));
      call(host, ['plugin', 'marketplace', 'add', checkout, '--json']);
      // Rerunning `plugin add` also refreshes Codex's copy from the checkout.
      call(host, ['plugin', host === 'claude' ? 'install' : 'add', PLUGIN, '--json']);
      inspect(host, guard);
      data.hosts = data.hosts.filter(h => h.host !== host).concat({ host, source: guard });
      console.log('REGISTERED ' + host + ': ' + guard);
    } catch (e) {
      const after = inventory();
      const changes = [...new Set([...Object.keys(previous), ...Object.keys(after)])].filter(p => previous[p] !== after[p]).map(p => ({ path: p, before: previous[p] ?? null, after: after[p] ?? null }));
      restore(changes); data.writes.push(...changes); save(); throw e;
    }
    const after = inventory();
    for (const p of new Set([...Object.keys(previous), ...Object.keys(after)])) {
      if (previous[p] === after[p]) continue;
      const w = data.writes.find(w => w.path === p);
      if (w) w.after = after[p] ?? null;
      else data.writes.push({ path: p, before: previous[p] ?? null, after: after[p] ?? null });
    }
    save();
    // Remove only handlers recorded by the old installer, and only for this host.
    const legacy = legacyRecord();
    if (legacy && ready(host)) {
      const settings = path.join(home, host === 'claude' ? '.claude/settings.json' : '.codex/hooks.json');
      if (fs.existsSync(settings)) {
        const config = JSON.parse(fs.readFileSync(settings));
        const before = JSON.stringify(config);
        if (config.hooks?.PreToolUse) config.hooks.PreToolUse = config.hooks.PreToolUse.map(g => ({ ...g, hooks: (g.hooks || []).filter(h => !(legacy.groups || []).some(old => old.matcher === g.matcher && old.hooks.some(o => JSON.stringify(o) === JSON.stringify(h)) && JSON.stringify(h).includes('/command-guard/adapters/'))) })).filter(g => g.hooks.length);
        if (JSON.stringify(config) !== before) {
          if (!fs.existsSync(settings + '.before-command-guard')) fs.copyFileSync(settings, settings + '.before-command-guard');
          legacy.settings ||= []; if (!legacy.settings.some(s => s.path === settings)) legacy.settings.push({ path: settings, backup: settings + '.before-command-guard' });
          fs.writeFileSync(legacyFile, JSON.stringify(legacy, null, 2) + '\n');
          fs.writeFileSync(settings, JSON.stringify(config, null, 2) + '\n');
          const w = data.writes.find(w => w.path === settings); if (w) w.after = fs.readFileSync(settings, 'base64');
          save();
        }
      }
    }
  }
  return registration(home, checkout, 'doctor');
}
module.exports = { registration };
