#!/usr/bin/env node
'use strict';
// Installs a snapshot of the command guard at ~/.agents/command-guard and
// registers its hooks at user scope. A human runs this; agents do not.
//   node hooks/command-guard/install.js              install or update, then doctor
//   node hooks/command-guard/install.js --no-codex   skip Codex
//   node hooks/command-guard/install.js --no-opencode  skip OpenCode
//   node hooks/command-guard/install.js --doctor     fire each installed hook once
//   node hooks/command-guard/install.js --uninstall  remove hooks and snapshot

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { pathToFileURL } = require('url');

const SRC = __dirname;
const HOME = os.homedir();
const DEST = path.join(HOME, '.agents', 'command-guard');
const PARTS = ['engine', 'rules', 'adapters'];
const CLAUDE_SETTINGS = path.join(HOME, '.claude', 'settings.json');
const CODEX_DIR = path.join(HOME, '.codex');
const CODEX_HOOKS = path.join(CODEX_DIR, 'hooks.json');
const OPENCODE_DIR = path.join(HOME, '.config', 'opencode');
const OPENCODE_PLUGIN = path.join(OPENCODE_DIR, 'plugins', 'command-guard.js');
const MARK = 'command-guard/adapters/';
const args = new Set(process.argv.slice(2));
const fwd = (p) => p.replace(/\\/g, '/');

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  if (fs.existsSync(file) && !fs.existsSync(file + '.before-command-guard')) fs.copyFileSync(file, file + '.before-command-guard');
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function isOurs(group) {
  return (group.hooks || []).some((h) => fwd([h.command || ''].concat(h.args || []).join(' ')).includes(MARK));
}

// Replace our PreToolUse group, leaving every other hook as it is.
function setGroup(config, group) {
  config.hooks = config.hooks || {};
  const rest = (config.hooks.PreToolUse || []).filter((g) => !isOurs(g));
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
  const res = spawnSync('node', [path.join(DEST, 'adapters', adapter)], {
    input: JSON.stringify({ session_id: 'doctor', cwd: os.tmpdir(), hook_event_name: 'PreToolUse', tool_name: tool, tool_input: { command } }),
    encoding: 'utf8',
    shell: false,
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
  const claude = readJson(CLAUDE_SETTINGS, null);
  if (claude) { setGroup(claude, null); writeJson(CLAUDE_SETTINGS, claude); }
  const codex = readJson(CODEX_HOOKS, null);
  if (codex) {
    setGroup(codex, null);
    if (Object.keys(codex).every((k) => k === 'description')) fs.rmSync(CODEX_HOOKS);
    else writeJson(CODEX_HOOKS, codex);
  }
  fs.rmSync(OPENCODE_PLUGIN, { force: true });
  for (const part of PARTS.concat(['state', 'installed.json'])) fs.rmSync(path.join(DEST, part), { recursive: true, force: true });
  console.log('Command guard removed. New sessions have no guard protection.');
}

async function install() {
  const withOpenCode = !args.has('--no-opencode') && fs.existsSync(OPENCODE_DIR);
  const withCodex = !args.has('--no-codex') && fs.existsSync(CODEX_DIR);
  fs.mkdirSync(DEST, { recursive: true });
  for (const part of PARTS) {
    // Overwrite in place: a hook may be running from these files right now,
    // and a half-removed guard would stop every shell call.
    fs.cpSync(path.join(SRC, part), path.join(DEST, part), { recursive: true, force: true });
    for (const name of fs.readdirSync(path.join(DEST, part))) {
      if (!fs.existsSync(path.join(SRC, part, name))) fs.rmSync(path.join(DEST, part, name), { recursive: true, force: true });
    }
  }
  fs.writeFileSync(path.join(DEST, 'installed.json'), JSON.stringify({ source: fwd(SRC), installedAt: new Date().toISOString() }, null, 2) + '\n');
  console.log('Snapshot copied to ' + DEST);

  const adapters = ['claude-code.js'].concat(withCodex ? ['codex.js'] : []);
  if (!doctor(adapters)) {
    console.log('Doctor failed: hooks were NOT registered.');
    process.exit(1);
  }
  const claude = readJson(CLAUDE_SETTINGS, {});
  setGroup(claude, claudeGroup());
  writeJson(CLAUDE_SETTINGS, claude);
  console.log('Claude Code: PreToolUse hook registered in ' + CLAUDE_SETTINGS);
  if (withCodex) {
    const codex = readJson(CODEX_HOOKS, {});
    setGroup(codex, codexGroup());
    writeJson(CODEX_HOOKS, codex);
    console.log('Codex: PreToolUse hook written to ' + CODEX_HOOKS + '. It does not run until you trust it: open Codex and run /hooks.');
  }
  if (withOpenCode) {
    fs.mkdirSync(path.dirname(OPENCODE_PLUGIN), { recursive: true });
    fs.copyFileSync(path.join(SRC, 'adapters', 'opencode-plugin.js'), OPENCODE_PLUGIN);
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
    let ok = doctor(['claude-code.js'].concat(fs.existsSync(CODEX_HOOKS) ? ['codex.js'] : []));
    if (fs.existsSync(OPENCODE_PLUGIN)) ok = (await doctorOpenCode()) && ok;
    process.exit(ok ? 0 : 1);
  }
  await install();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
