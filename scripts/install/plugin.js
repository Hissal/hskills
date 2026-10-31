'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Removes an installer-created tree only when it holds nothing but recorded,
// real, empty directories. Never follows a link or deletes another entry.
function reclaim(dest, directories) {
  const found = [];
  function walk(dir) {
    const info = fs.lstatSync(dir);
    if (!info.isDirectory() || info.isSymbolicLink() || !directories.includes(dir)) return false;
    found.push(dir);
    return fs.readdirSync(dir).every(name => walk(path.join(dir, name)));
  }
  if (!walk(dest)) return false;
  for (const dir of found.reverse()) fs.rmdirSync(dir);
  return true;
}

// Preparation is independent of registration: never remove a functioning hook
// merely because its replacement's files exist. Directories it creates are
// appended to `directories`, the journal's directory provenance.
function prepare(home, source = path.resolve(__dirname, '../../hooks/command-guard'), writes = [], directories = []) {
  const files = [];
  for (const dir of ['.claude-plugin', '.codex-plugin', 'hooks', 'engine', 'rules', 'adapters']) {
    for (const name of fs.readdirSync(path.join(source, dir)).sort()) {
      files.push([dir + '/' + name, fs.readFileSync(path.join(source, dir, name))]);
    }
  }
  const hash = crypto.createHash('sha256');
  for (const [name, content] of files) hash.update(name).update('\0').update(content).update('\0');
  const version = JSON.parse(fs.readFileSync(path.join(source, '.claude-plugin/plugin.json'))).version;
  const dest = path.join(home, '.skill-collection/plugin-cache', version + '-' + hash.digest('hex'));
  if (fs.existsSync(dest) && !reclaim(dest, directories)) {
    if (!fs.lstatSync(dest).isDirectory() || fs.lstatSync(dest).isSymbolicLink()) throw new Error('CONFLICT plugin snapshot entry: ' + dest);
    const expected = new Set(files.map(([name]) => path.join(dest, name)));
    const manifest = path.join(dest, '.claude-plugin/marketplace.json');
    if (writes.some(w => w.path === manifest)) expected.add(manifest);
    function verify(dir) {
      for (const name of fs.readdirSync(dir)) {
        const p = path.join(dir, name);
        const info = fs.lstatSync(p);
        if (info.isDirectory() && !info.isSymbolicLink()) verify(p);
        else if (!expected.has(p) || !writes.some(w => w.path === p)) throw new Error('CONFLICT unrecorded plugin snapshot entry: ' + p);
      }
    }
    verify(dest);
    for (const [name, content] of files) {
      if (!writes.some(w => w.path === path.join(dest, name))) throw new Error('CONFLICT unrecorded plugin snapshot: ' + dest);
      if (!fs.lstatSync(path.join(dest, name)).isFile() || fs.lstatSync(path.join(dest, name)).isSymbolicLink() || !fs.readFileSync(path.join(dest, name)).equals(content)) throw new Error('CONFLICT modified plugin snapshot: ' + dest);
    }
  } else {
    const cache = path.dirname(dest);
    if (fs.mkdirSync(cache, { recursive: true }) && !directories.includes(cache)) directories.push(cache);
    const stage = fs.mkdtempSync(path.join(cache, '.prepare-'));
    try {
      for (const [name, content] of files) {
        const target = path.join(stage, name);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content);
      }
      fs.renameSync(stage, dest);
    } finally { fs.rmSync(stage, { recursive: true, force: true }); }
    for (const dir of [dest, ...new Set(files.map(([name]) => path.dirname(path.join(dest, name))))]) {
      if (!directories.includes(dir)) directories.push(dir);
    }
  }
  console.log('Prepared plugin snapshot: ' + dest);
  return dest;
}
module.exports = { prepare };

const { spawnSync } = require('child_process');
function registration(home, source, action = 'install') {
  const file = path.join(home, '.skill-collection/plugins.json');
  if (fs.existsSync(file) && (!fs.lstatSync(file).isFile() || fs.lstatSync(file).isSymbolicLink())) throw new Error('CONFLICT plugin ownership record');
  const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : { hosts: [], writes: [] };
  // Journals from before directory provenance: a recorded snapshot file the
  // installer created proves it also created that snapshot's directories.
  const cache = path.join(home, '.skill-collection/plugin-cache');
  if (data.directories === undefined) {
    data.directories = [];
    for (const w of data.writes.filter(w => w.before === null)) {
      const parts = path.relative(cache, w.path).split(path.sep);
      if (parts.length < 2 || parts[0] === '..' || path.isAbsolute(parts[0])) continue;
      for (let i = 1; i < parts.length; i++) {
        const dir = path.join(cache, ...parts.slice(0, i));
        if (!data.directories.includes(dir)) data.directories.push(dir);
      }
    }
  }
  if (!Array.isArray(data.directories) || data.directories.some(d => typeof d !== 'string' || (d !== cache && !d.startsWith(cache + path.sep)))) throw new Error('CONFLICT plugin ownership record');
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
  // Deepest first; rmdir never removes a non-empty directory, and lstat never follows a link.
  function removeDirectories() {
    let ok = true;
    for (const dir of [...data.directories].sort((a, b) => b.length - a.length)) {
      let info;
      try { info = fs.lstatSync(dir); } catch (e) { if (e.code !== 'ENOENT') throw e; }
      if (info && (!info.isDirectory() || info.isSymbolicLink())) { console.log('CONFLICT replaced directory preserved: ' + dir); ok = false; continue; }
      if (info) {
        try { fs.rmdirSync(dir); } catch (e) {
          if (!['ENOTEMPTY', 'EEXIST'].includes(e.code)) throw e;
          console.log('CONFLICT non-empty directory preserved: ' + dir); ok = false; continue;
        }
      }
      data.directories.splice(data.directories.indexOf(dir), 1);
    }
    return ok;
  }
  if (action === 'uninstall') {
    data.writes = validatedWrites();
    const ok = restore(data.writes); if (ok) data.hosts = [];
    const removed = ok && removeDirectories(); save(); return removed;
  }
  const env = { ...process.env, HOME: home, USERPROFILE: home, CLAUDE_CONFIG_DIR: path.join(home, '.claude'), CODEX_HOME: path.join(home, '.codex'), XDG_CONFIG_HOME: path.join(home, '.config') };
  function call(host, args) {
    const binary = process.env['COMMAND_GUARD_' + host.toUpperCase()] || host;
    const r = spawnSync(binary.endsWith('.cjs') ? process.execPath : binary, binary.endsWith('.cjs') ? [binary, ...args] : args, { env, cwd: home, encoding: 'utf8', timeout: 60000 });
    if (r.status !== 0) throw new Error(binary + ' ' + args.join(' ') + '\n' + (r.error || '') + r.stdout + r.stderr);
    return JSON.parse(r.stdout);
  }
  function inspect(host, snapshot) {
    const settings = path.join(home, '.claude/settings.json');
    if (host === 'claude' && fs.existsSync(settings) && JSON.parse(fs.readFileSync(settings)).disableAllHooks) throw new Error('disabled Claude hooks');
    const list = call(host, ['plugin', 'list', '--json']);
    const entry = (Array.isArray(list) ? list : list.installed).find(p => (p.id || p.pluginId) === 'command-guard@skill-collection-guard');
    const effective = entry && (entry.readFromFolder || entry.source?.path || entry.installPath);
    if (!entry || !entry.enabled || !effective || fs.realpathSync(effective) !== fs.realpathSync(snapshot)) throw new Error('missing, disabled or overridden plugin: ' + host);
  }
  // The previous installer's record of its own settings handlers, if any.
  const legacyFile = path.join(home, '.skill-collection/guard.json');
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
        const hooks = group.hooks.filter(h => h.source === 'plugin' && h.pluginId === 'command-guard@skill-collection-guard');
        return !(group.errors || []).length && hooks.length > 0 && hooks.every(h => h.enabled && h.trustStatus === 'trusted');
      });
    } catch { codexGroups = null; return false; }
  }
  function probeSnapshot(snapshot) {
  const probeState = fs.mkdtempSync(path.join(require('os').tmpdir(), 'guard-probe-'));
  try {
    for (const adapter of ['claude-code.js', 'codex.js']) {
      for (const [command, deny] of [['git push --force origin main', true], ['git status', false]]) {
        const r = spawnSync(process.execPath, [path.join(snapshot, 'adapters', adapter)], { env: { ...env, COMMAND_GUARD_HOME: snapshot, COMMAND_GUARD_STATE: probeState }, input: JSON.stringify({ cwd: probeState, tool_name: 'Bash', tool_input: { command } }), encoding: 'utf8', timeout: 10000 });
        if (r.status !== 0 || (deny ? !r.stdout.includes('HUMAN-REQUIRED') : r.stdout !== '')) throw new Error('snapshot adapter probe failed: ' + adapter + ' ' + r.stdout + r.stderr);
      }
    }
  } finally { fs.rmSync(probeState, { recursive: true, force: true }); }

  }
  if (action === 'doctor') {
    for (const w of data.writes.filter(w => w.path.includes(path.sep + 'plugin-cache' + path.sep))) {
      if (!fs.existsSync(w.path) || fs.lstatSync(w.path).isSymbolicLink() || fs.readFileSync(w.path, 'base64') !== w.after) throw new Error('modified plugin snapshot: ' + w.path);
    }
    if (!data.hosts.length) throw new Error('missing plugin registration');
    let pending = false;
    for (const h of data.hosts) { inspect(h.host, h.snapshot); probeSnapshot(h.snapshot); console.log('REGISTERED ' + h.host + ': ' + h.snapshot); }
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
  // Validate the complete journal before preparation, backups or host commands.
  data.writes = validatedWrites();
  const snapshot = prepare(home, source, data.writes, data.directories);
  for (const dir of ['.claude-plugin', '.codex-plugin', 'hooks', 'engine', 'rules', 'adapters']) {
    for (const name of fs.readdirSync(path.join(snapshot, dir))) {
      const p = path.join(snapshot, dir, name);
      if (!data.writes.some(w => w.path === p)) data.writes.push({ path: p, before: null, after: fs.readFileSync(p, 'base64') });
    }
  }
  save();
  probeSnapshot(snapshot);
  const market = snapshot;
  const manifest = path.join(market, '.claude-plugin/marketplace.json');
  const content = JSON.stringify({ name: 'skill-collection-guard', owner: { name: 'Hissal' }, plugins: [{ name: 'command-guard', source: './', policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' } }] }, null, 2) + '\n';
  if (fs.existsSync(manifest) && (!fs.lstatSync(manifest).isFile() || fs.lstatSync(manifest).isSymbolicLink())) throw new Error('CONFLICT marketplace snapshot entry');
  if (fs.existsSync(manifest) && fs.readFileSync(manifest, 'utf8') !== content) throw new Error('CONFLICT marketplace snapshot');
  if (!fs.existsSync(manifest)) { fs.mkdirSync(path.dirname(manifest), { recursive: true }); fs.writeFileSync(manifest, content); data.writes.push({ path: manifest, before: null, after: Buffer.from(content).toString('base64') }); save(); }
  for (const host of ['claude', ...(fs.existsSync(path.join(home, '.codex')) ? ['codex'] : [])]) {
    data.backups ||= [];
    const settingsPath = path.join(home, host === 'claude' ? '.claude/settings.json' : '.codex/config.toml');
    if (fs.existsSync(settingsPath) && !fs.existsSync(settingsPath + '.before-command-guard')) {
      fs.copyFileSync(settingsPath, settingsPath + '.before-command-guard');
      data.backups.push(settingsPath + '.before-command-guard'); save();
    }
    const previous = inventory();
    try {
      const existing = data.hosts.find(h => h.host === host);
      if (!existing) {
        const list = call(host, ['plugin', 'list', '--json']);
        if (JSON.stringify(list).includes('command-guard@skill-collection-guard')) throw new Error('CONFLICT unrecorded plugin');
      }
      if (existing && existing.snapshot !== snapshot && host === 'codex') {
        inspect(host, existing.snapshot);
        call(host, ['plugin', 'marketplace', 'remove', 'skill-collection-guard', '--json']);
      }
      call(host, ['plugin', 'marketplace', 'add', market, '--json']);
      call(host, ['plugin', host === 'claude' ? 'install' : 'add', 'command-guard@skill-collection-guard', '--json']);
      inspect(host, snapshot);
      data.hosts = data.hosts.filter(h => h.host !== host).concat({ host, snapshot });
      console.log('REGISTERED ' + host + ': ' + snapshot);
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
  return registration(home, source, 'doctor');
}
module.exports.registration = registration;
