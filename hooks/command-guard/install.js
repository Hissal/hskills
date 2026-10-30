#!/usr/bin/env node
'use strict';
// Installs a snapshot of the command guard at ~/.agents/command-guard and
// registers its hooks at user scope. A human runs this; agents do not.
// Internal delegate of scripts/install/install.js; see docs/user-install.md.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { pathToFileURL } = require('url');

const SRC = __dirname;
const homeIndex = process.argv.indexOf('--home');
const HOME = homeIndex < 0 ? os.homedir() : path.resolve(process.argv[homeIndex + 1]);
process.env.COMMAND_GUARD_HOME = process.env.COMMAND_GUARD_HOME || path.join(HOME, '.agents', 'command-guard');
process.env.COMMAND_GUARD_STATE = path.join(HOME, '.agents', 'command-guard', 'state');
const DEST = path.join(HOME, '.agents', 'command-guard');
const PARTS = ['engine', 'rules', 'adapters'];
const CLAUDE_SETTINGS = path.join(HOME, '.claude', 'settings.json');
const CODEX_DIR = path.join(HOME, '.codex');
const CODEX_HOOKS = path.join(CODEX_DIR, 'hooks.json');
const OPENCODE_DIR = path.join(HOME, '.config', 'opencode');
const OPENCODE_PLUGIN = path.join(OPENCODE_DIR, 'plugins', 'command-guard.js');
const args = new Set(process.argv.slice(2));
const RECORD = path.join(HOME, '.skill-collection', 'guard.json');
let record = readJson(RECORD, { groups: [], files: [] });
function save() { fs.mkdirSync(path.dirname(RECORD), { recursive: true }); fs.writeFileSync(RECORD, JSON.stringify(record, null, 2) + '\n'); }
const fwd = (p) => p.replace(/\\/g, '/');

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  if (fs.existsSync(file) && !fs.existsSync(file + '.before-command-guard')) fs.copyFileSync(file, file + '.before-command-guard');
  record.settings = record.settings || [];
  if (!record.settings.some(s => s.path === file)) record.settings.push({ path: file, backup: fs.existsSync(file + '.before-command-guard') ? file + '.before-command-guard' : null });
  save();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

// Replace our PreToolUse group, leaving every other hook as it is.
function setGroup(config, group) {
  config.hooks = config.hooks || {};
  const rest = [];
  for (const existing of config.hooks.PreToolUse || []) {
    const hooks = (existing.hooks || []).filter(h => !record.groups.some(g => g.matcher === existing.matcher && g.hooks.some(owned => JSON.stringify(owned) === JSON.stringify(h))));
    if (hooks.length) rest.push({ ...existing, hooks });
    else if (!(existing.hooks || []).length) rest.push(existing);
  }
  if (group) rest.push(group);
  if (rest.length) config.hooks.PreToolUse = rest;
  else delete config.hooks.PreToolUse;
  if (!Object.keys(config.hooks).length) delete config.hooks;
}

function claudeGroup() {
  return {
    matcher: 'Bash|PowerShell|Monitor',
    hooks: [{ type: 'command', command: 'node', args: [fwd(path.join(DEST, 'adapters', 'claude-code.js'))], timeout: 15, onFailure: 'block' }],
  };
}

function codexGroup() {
  const command = 'node "' + fwd(path.join(DEST, 'adapters', 'codex.js')) + '"';
  return { matcher: 'Bash', hooks: [{ type: 'command', command, commandWindows: command, timeout: 15, statusMessage: 'Command guard' }] };
}

function probe(adapter, tool, command) {
  const res = spawnSync(process.execPath, [path.join(DEST, 'adapters', adapter)], {
    input: JSON.stringify({ session_id: 'doctor', cwd: os.tmpdir(), hook_event_name: 'PreToolUse', tool_name: tool, tool_input: { command } }),
    encoding: 'utf8',
    shell: false, timeout: 10000,
  });
  return { status: res.status, out: res.stdout || '', err: res.stderr || (res.error ? String(res.error) : '') };
}

function doctor(adapters) {
  let ok = true;
  for (const adapter of adapters) {
    // harmless probes: outside a repository a push fails on its own
    const block = probe(adapter, 'Bash', 'git push --force origin main');
    const allow = probe(adapter, 'Bash', 'git status');
    const blocked = block.status === 0 && /"permissionDecision":"deny"/.test(block.out) && /HUMAN-REQUIRED/.test(block.out);
    const allowed = allow.status === 0 && allow.out === '';
    console.log((blocked ? 'ok  ' : 'FAIL') + ' ' + adapter + ' denies a force-push to main');
    console.log((allowed ? 'ok  ' : 'FAIL') + ' ' + adapter + ' is silent on git status');
    if (!blocked || !allowed) { ok = false; console.log(block.out + block.err + allow.out + allow.err); }
  }
  return ok;
}

// Load an OpenCode plugin file and return the hooks its setup registers.
async function openCodeHooks(file) {
  const copy = path.join(os.tmpdir(), 'command-guard-doctor-' + process.pid + '.mjs');
  fs.copyFileSync(file, copy);
  try {
    const plugin = (await import(pathToFileURL(copy).href)).default;
    const hooks = {};
    const domain = (name) => ({ hook: async (event, callback) => { hooks[name + '.' + event] = callback; } });
    await plugin.setup({ location: { directory: os.tmpdir() }, tool: domain('tool'), permission: domain('permission') });
    return hooks;
  } finally {
    fs.rmSync(copy, { force: true });
  }
}

async function doctorOpenCode() {
  let blocked = false;
  let allowed = false;
  let denied = false;
  let detail = '';
  try {
    const hooks = await openCodeHooks(OPENCODE_PLUGIN);
    const call = (command) => ({ tool: 'shell', sessionID: 'doctor', input: { command } });
    try { await hooks['tool.execute.before'](call('git push --force origin main')); } catch (e) { blocked = /HUMAN-REQUIRED/.test(e.message); detail = e.message; }
    try { await hooks['tool.execute.before'](call('git status')); allowed = true; } catch (e) { detail = e.message; }
    const evaluation = { sessionID: 'doctor', action: 'shell', resources: ['git push --force origin main'], effect: 'allow' };
    await hooks['permission.evaluate'](evaluation);
    denied = evaluation.effect === 'deny';
  } catch (e) {
    detail = String(e && e.stack ? e.stack : e);
  }
  console.log((blocked ? 'ok  ' : 'FAIL') + ' opencode plugin rejects a force-push to main');
  console.log((denied ? 'ok  ' : 'FAIL') + ' opencode plugin denies its shell permission');
  console.log((allowed ? 'ok  ' : 'FAIL') + ' opencode plugin is silent on git status');
  if (!(blocked && allowed && denied)) console.log(detail);
  return blocked && allowed && denied;
}

function uninstall() {
  for (const file of [CLAUDE_SETTINGS, CODEX_HOOKS]) {
    if (!record.groups.length) continue;
    const config = readJson(file, null);
    if (config) { setGroup(config, null); writeJson(file, config); }
  }
  for (const entry of record.files) {
    if (!fs.existsSync(entry.path)) continue;
    if (fs.readFileSync(entry.path, 'base64') === entry.content) fs.unlinkSync(entry.path);
    else throw new Error('overridden installed file preserved: ' + entry.path);
  }
  record = { groups: [], files: [] }; save();
  console.log('Command guard removed. New sessions have no guard protection. Removal is not approval for any command.');
}

async function install() {
  const withOpenCode = !args.has('--no-opencode') && fs.existsSync(OPENCODE_DIR);
  const withCodex = !args.has('--no-codex') && fs.existsSync(CODEX_DIR);
  // Refuse unrecorded destinations before copying or registering anything.
  function copy(file, dest) {
    const content = fs.readFileSync(file, 'base64');
    const previous = record.files.find(f => f.path === dest);
    if (fs.existsSync(dest) && (!previous || fs.readFileSync(dest, 'base64') !== previous.content)) throw new Error('CONFLICT unrecorded or overridden guard file: ' + dest);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(file, dest);
    record.files = record.files.filter(f => f.path !== dest);
    record.files.push({ path: dest, content }); save();
  }
  fs.mkdirSync(DEST, { recursive: true });
  for (const part of PARTS) {
    for (const name of fs.readdirSync(path.join(SRC, part))) copy(path.join(SRC, part, name), path.join(DEST, part, name));
  }
  console.log('Snapshot copied to ' + DEST);

  const adapters = ['claude-code.js'].concat(withCodex ? ['codex.js'] : []);
  if (!doctor(adapters)) {
    console.log('Doctor failed: hooks were NOT registered.');
    process.exit(1);
  }
  const claude = readJson(CLAUDE_SETTINGS, {});
  setGroup(claude, claudeGroup());
  record.groups = record.groups.filter(g => JSON.stringify(g) !== JSON.stringify(claudeGroup()));
  record.groups.push(claudeGroup()); save();
  writeJson(CLAUDE_SETTINGS, claude);
  console.log('Claude Code: PreToolUse hook registered in ' + CLAUDE_SETTINGS);
  if (withCodex) {
    const codex = readJson(CODEX_HOOKS, {});
    setGroup(codex, codexGroup());
    record.groups = record.groups.filter(g => JSON.stringify(g) !== JSON.stringify(codexGroup()));
    record.groups.push(codexGroup()); save();
    writeJson(CODEX_HOOKS, codex);
    console.log('Codex: PreToolUse hook written to ' + CODEX_HOOKS + '. It does not run until you trust it: open Codex and run /hooks.');
  }
  if (withOpenCode) {
    fs.mkdirSync(path.dirname(OPENCODE_PLUGIN), { recursive: true });
    copy(path.join(SRC, 'adapters', 'opencode-plugin.js'), OPENCODE_PLUGIN);
    if (!(await doctorOpenCode())) {
      fs.rmSync(OPENCODE_PLUGIN, { force: true });
      console.log('Doctor failed: the OpenCode plugin was NOT installed.');
      process.exit(1);
    }
    console.log('OpenCode: plugin installed at ' + OPENCODE_PLUGIN + '. Running OpenCode servers pick it up on restart.');
  }
}

async function main() {
  if (args.has('--uninstall')) return uninstall();
  if (args.has('--doctor')) {
    let ok = true;
    for (const [file, group, adapter] of [[CLAUDE_SETTINGS, claudeGroup(), 'claude-code.js'], [CODEX_HOOKS, codexGroup(), 'codex.js']]) {
      if (adapter === 'codex.js' && !record.groups.some(g => JSON.stringify(g) === JSON.stringify(group))) continue;
      const config = readJson(file, {});
      const groups = (config.hooks || {}).PreToolUse || [];
      if (config.disableAllHooks || config.enabled === false) { console.log('FAIL disabled: ' + file); ok = false; continue; }
      if (!groups.some(g => JSON.stringify(g) === JSON.stringify(group))) { console.log('FAIL missing registration or overridden: ' + file); ok = false; continue; }
      ok = doctor([adapter]) && ok;
      if (adapter === 'codex.js') { console.log('PENDING Codex human trust: review the current hook in /hooks; trust is unverified.'); ok = false; }
      console.log('Host invocation unverified; trust/untrusted, host bypass and project overrides require a live hand run: ' + adapter);
    }
    if (record.files.some(f => f.path === OPENCODE_PLUGIN)) ok = (await doctorOpenCode()) && ok;
    if (process.env.COMMAND_GUARD_HOME !== DEST) { console.log('FAIL override: COMMAND_GUARD_HOME'); ok = false; }
    process.exit(ok ? 0 : 1);
  }
  await install();
  args.add('--doctor');
  return main();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
