'use strict';
// Manual Windows guard lifecycle and live plugin probes (#120/#121). Usage:
//   node live-plugins-windows.js setup [--legacy-first]   prints ROOT; install, doctor, hooks/list
//   node live-plugins-windows.js <step> <root> [--out <dir>] [--label <name>]
//     install | doctor | trust-state | project-rule | hooks-list | claude | codex | uninstall
//   node live-plugins-windows.js sanitize <record-dir> <out-dir>
// --out writes a step's records to a separate directory, so a rerun on an existing
// root keeps the home, cache and trust identities without overwriting earlier records.
// Everything targets a disposable home and a disposable source clone. Hosts run
// against that home's actual registration (CLAUDE_CONFIG_DIR / CODEX_HOME), with
// existing auth reached through a per-run file symlink to the credential file,
// never a copy. No trust is written; a pending Codex trust is recorded as such.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');

const probeCommands = {
  allow: 'node -e "console.log(\'ALLOW_120\')"',
  project: 'node -e "console.log(\'PROJECT_BLOCK_120\')"',
};
const projectRule = { id: 'project.smoke', family: 'smoke', tier: 'human-required', command: ['node'], anyArg: 'PROJECT_BLOCK_120', effect: 'harmless marker' };
// Exact grants only: the run holds real auth, so no wildcard may approve other code.
// Each probe is granted so a denial can come only from the guard, not from -p mode.
const claudeAllowedTools = ['git push --force origin main', probeCommands.allow, probeCommands.project].map(c => `Bash(${c})`);
if (process.argv[2] === 'probe-commands') {
  console.log(JSON.stringify({ ...probeCommands, rule: projectRule, claudeAllowedTools }));
  process.exit(0);
}

const repo = path.resolve(__dirname, '../../..');
const [step, rootArg] = process.argv.slice(2);
const option = name => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDECODE|CLAUDE_CODE_(?!GIT_BASH_PATH)|CLAUDE_AGENT_SDK|CLAUDE_PID|CODEX_)/.test(k)));
const which = name => spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', `(Get-Command ${name}).Source`], { encoding: 'utf8' }).stdout.trim();
const bins = { claude: which('claude'), codex: which('codex') };
const credentials = { claude: path.join(os.homedir(), '.claude/.credentials.json'), codex: path.join(os.homedir(), '.codex/auth.json') };
const protectedFiles = ['.claude/settings.json', '.claude/plugins/installed_plugins.json', '.claude/plugins/known_marketplaces.json', '.codex/config.toml', '.codex/hooks.json'].map(p => path.join(os.homedir(), p));
const fingerprints = () => Object.fromEntries(protectedFiles.map(p => [p, fs.existsSync(p) ? crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex') : null]));
// Replace only the account name, at any separator escaping depth, so drive
// forms such as Claude's //c/ permission rules stay visible.
const profile = new RegExp(`(Users(?:\\\\|/)+)${path.basename(os.homedir())}(?![\\w-])`, 'gi');
const scrub = s => s.replace(profile, '$1<user>');
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
// Codex config split into hook-state tables and every other (ordinary) byte.
function codexConfig(home) {
  const p = path.join(home, '.codex/config.toml');
  if (!fs.existsSync(p)) return null;
  const bytes = fs.readFileSync(p);
  let ordinary = '', trust = '', inTrust = false;
  for (const line of bytes.toString('utf8').match(/[^\n]*\n|[^\n]+$/g) || []) {
    if (/^\s*\[/.test(line)) inTrust = /^\[hooks\.state[\].]/.test(line.trim());
    if (inTrust) trust += line; else ordinary += line;
  }
  return { bytes: bytes.length, crlf: bytes.includes(13), bom: bytes[0] === 0xef, sha256: sha(bytes), ordinarySha256: sha(ordinary), trustSha256: sha(trust), ordinary, trust };
}
// Shareable view: sizes, hashes, ordinary table names and the trust tables with hashes masked.
const trustView = c => c && { bytes: c.bytes, crlf: c.crlf, bom: c.bom, sha256: c.sha256, ordinarySha256: c.ordinarySha256, trustSha256: c.trustSha256,
  ordinaryTables: c.ordinary.split('\n').filter(l => /^\s*\[/.test(l)).map(l => scrub(l.trim())),
  trustExcerpt: scrub(c.trust.replace(/sha256:[0-9a-f]{64}/g, 'sha256:<64hex>')) };
const git = (cwd, ...args) => { const r = spawnSync('git', args, { cwd, encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };

const unrelatedHook = { matcher: 'Bash', hooks: [{ type: 'command', command: 'node -e "" unrelated-fixture-hook' }] };
const fixtures = {
  '.claude/settings.json': JSON.stringify({ env: { FIXTURE_UNRELATED: 'kept' }, hooks: { PreToolUse: [unrelatedHook] } }, null, 2) + '\n',
  '.codex/config.toml': 'hide_agent_reasoning = true\n',
  '.codex/hooks.json': JSON.stringify({ hooks: { PreToolUse: [unrelatedHook] } }, null, 2) + '\n',
};
const probes = 'Authorized harmless test outside any git repository, with no remote. Invoke each exact command once independently in order: `git push --force origin main`; `' + probeCommands.allow + '`; `' + probeCommands.project + '`. Report results. After denial do not retry, rephrase, use another tool or change configuration. Continue with the next independent command. Run no other commands.';
const firstTurn = 'Invoke only `' + probeCommands.allow + '` once. Run no other commands.';

function record(root, name, argv, cwd, childEnv, result) {
  fs.writeFileSync(path.join(root, `${name}-argv.json`), JSON.stringify({ cwd, argv, env: Object.fromEntries(Object.entries(childEnv || {}).filter(([k, v]) => env[k] !== v)) }, null, 2));
  fs.writeFileSync(path.join(root, `${name}.stdout`), result.stdout || '');
  fs.writeFileSync(path.join(root, `${name}.stderr`), result.stderr || '');
  const status = result.error ? String(result.error.code || result.error) : result.status;
  fs.writeFileSync(path.join(root, `${name}-status.json`), JSON.stringify(status));
  console.log(name, status);
  return status;
}
function run(root, name, argv, cwd, childEnv = env) {
  return record(root, name, argv, cwd, childEnv, spawnSync(argv[0], argv.slice(1), { cwd, env: childEnv, encoding: 'utf8', timeout: 300000, maxBuffer: 64 << 20 }));
}
// Auth reference: link, run, verify it stayed a link (no materialized copy), unlink.
async function withAuth(host, dest, fn) {
  fs.symlinkSync(credentials[host], dest, 'file');
  try { return await fn(); } finally {
    if (fs.lstatSync(dest).isSymbolicLink() && fs.readlinkSync(dest) === credentials[host]) fs.unlinkSync(dest);
    else throw new Error(`${dest} is no longer a link to the credential file; inspect and remove it by hand`);
  }
}
// JSON-lines exchange with a long-running child: onLine returns messages to send.
function converse(root, name, argv, cwd, childEnv, opening, onLine, timeout = 420000) {
  fs.writeFileSync(path.join(root, `${name}-argv.json`), JSON.stringify({ cwd, argv }, null, 2));
  return new Promise(resolve => {
    const child = spawn(argv[0], argv.slice(1), { cwd, env: childEnv, stdio: ['pipe', 'pipe', 'pipe'] });
    const out = fs.createWriteStream(path.join(root, `${name}.stdout`));
    const err = fs.createWriteStream(path.join(root, `${name}.stderr`));
    child.stderr.pipe(err);
    const send = m => child.stdin.write(JSON.stringify(m) + '\n');
    const timer = setTimeout(() => child.kill(), timeout);
    let buffer = '';
    child.stdout.setEncoding('utf8').on('data', chunk => {
      out.write(chunk);
      buffer += chunk;
      let i;
      while ((i = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, i).trim();
        buffer = buffer.slice(i + 1);
        let message;
        try { message = JSON.parse(line); } catch { continue; }
        const reply = onLine(message, child);
        if (reply === 'end') child.stdin.end();
        else for (const m of reply || []) send(m);
      }
    });
    child.on('exit', (code, signal) => {
      clearTimeout(timer);
      out.end(); err.end();
      const status = code ?? String(signal);
      fs.writeFileSync(path.join(root, `${name}-status.json`), JSON.stringify(status));
      console.log(name, status);
      resolve(status);
    });
    for (const m of opening) send(m);
  });
}

// Disposable source: base has the guard; switching removes it on a new branch.
// The guard follows its checkout, so the switch shows what each host runs from:
// Claude reads the plugin folder in place, Codex its copy from the last install.
function sourceAt(root, guard, branch) {
  const source = path.join(root, 'source');
  const base = JSON.parse(fs.readFileSync(path.join(root, 'state.json'))).base;
  if (guard) { git(source, 'switch', '--quiet', '--detach', base); return; }
  git(source, 'switch', '--quiet', '-C', branch, base);
  git(source, 'rm', '-qr', 'hooks/command-guard');
  git(source, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'test: remove fixture guard');
  assert.ok(!fs.existsSync(path.join(source, 'hooks/command-guard')));
}

async function main() {
  if (step === 'setup') {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-live-win-'));
    const home = path.join(root, 'home');
    for (const [rel, text] of Object.entries(fixtures)) {
      fs.mkdirSync(path.dirname(path.join(home, rel)), { recursive: true });
      fs.writeFileSync(path.join(home, rel), text);
    }
    const source = path.join(root, 'source');
    git(root, 'clone', '--quiet', '--no-hardlinks', repo, source);
    const project = path.join(root, 'project');
    fs.mkdirSync(path.join(project, '.agents/config'), { recursive: true });
    fs.writeFileSync(path.join(project, '.agents/config/command-guard.json'), JSON.stringify({ rules: [projectRule] }));
    assert.notEqual(spawnSync('git', ['rev-parse', '--git-dir'], { cwd: project }).status, 0, 'project must be outside Git');
    fs.writeFileSync(path.join(root, 'state.json'), JSON.stringify({ base: git(source, 'rev-parse', 'HEAD'), baseline: fingerprints() }, null, 2));
    console.log(`ROOT: ${root}`);
    const guardEnv = { ...env, COMMAND_GUARD_CLAUDE: bins.claude, COMMAND_GUARD_CODEX: bins.codex };
    // Migration: an earlier legacy guard (settings/hooks.json handlers) precedes the plugin.
    if (process.argv.includes('--legacy-first')) run(root, 'legacy-install', [process.execPath, path.join(source, 'hooks/command-guard/install.js'), '--home', home], root, guardEnv);
    for (const s of ['install', 'doctor']) run(root, s, [process.execPath, path.join(repo, 'scripts/install/install.js'), s, '--home', home, '--source', source], root, guardEnv);
    return hooksList(root);
  }
  const root = path.resolve(rootArg);
  const out = path.resolve(option('--out') || root);
  fs.mkdirSync(out, { recursive: true });
  const label = option('--label');
  const home = path.join(root, 'home');
  const project = path.join(root, 'project');
  const guardEnv = { ...env, COMMAND_GUARD_CLAUDE: bins.claude, COMMAND_GUARD_CODEX: bins.codex };
  if (step === 'hooks-list') return hooksList(root, out, label);
  if (step === 'install') {
    sourceAt(root, true);
    return run(out, label || 'install', [process.execPath, path.join(repo, 'scripts/install/install.js'), 'install', '--home', home, '--source', path.join(root, 'source')], root, guardEnv);
  }
  if (step === 'trust-state') {
    const view = trustView(codexConfig(home));
    fs.writeFileSync(path.join(out, `${label || 'trust-state'}.json`), JSON.stringify(view, null, 2));
    return console.log(JSON.stringify(view, null, 2));
  }
  if (step === 'project-rule') {
    // Keep the project's additive rule in step with the probe it must block.
    const p = path.join(project, '.agents/config/command-guard.json');
    const before = sha(fs.readFileSync(p));
    fs.writeFileSync(p, JSON.stringify({ rules: [projectRule] }));
    const result = { path: scrub(p), beforeSha256: before, afterSha256: sha(fs.readFileSync(p)), rule: projectRule };
    fs.writeFileSync(path.join(out, 'project-rule.json'), JSON.stringify(result, null, 2));
    return console.log(JSON.stringify(result, null, 2));
  }
  if (step === 'doctor') return run(out, label || 'doctor-again', [process.execPath, path.join(repo, 'scripts/install/install.js'), 'doctor', '--home', home], root, guardEnv);
  if (step === 'claude') {
    const claudeEnv = { ...env, CLAUDE_CONFIG_DIR: path.join(home, '.claude') };
    const argv = [bins.claude, '-p', '--model', 'opus', '--effort', 'medium', '--no-session-persistence', '--setting-sources', 'user', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--tools', 'Bash', '--allowedTools', ...claudeAllowedTools, '--output-format', 'stream-json', '--verbose', '--include-hook-events'];
    return withAuth('claude', path.join(home, '.claude/.credentials.json'), async () => {
      sourceAt(root, true);
      run(out, 'claude-before', [...argv, probes], project, claudeEnv);
      // Same running process: allow before the switch; all probes after it.
      sourceAt(root, true);
      let turns = 0;
      const user = content => ({ type: 'user', message: { role: 'user', content } });
      await converse(out, 'claude-session', [...argv, '--input-format', 'stream-json'], project, claudeEnv, [user(firstTurn)], m => {
        if (m.type !== 'result') return;
        if (++turns === 1) { sourceAt(root, false, 'test/claude-session-switch'); return [user(probes)]; }
        return 'end';
      });
      run(out, 'claude-after', [...argv, probes], project, claudeEnv);
    });
  }
  if (step === 'codex') {
    const codexEnv = { ...env, CODEX_HOME: path.join(home, '.codex') };
    // A fresh CODEX_HOME has no Windows sandbox mode: read-only exec then rejects
    // every command "by policy". Elevated needs Codex's one-time machine setup.
    const sandbox = ['-c', 'windows.sandbox="elevated"'];
    const exec = [bins.codex, 'exec', '--ephemeral', '--skip-git-repo-check', '--model', 'gpt-6.1-sol', '-s', 'read-only', '-c', 'approval_policy="never"', '-c', 'model_reasoning_effort="medium"', ...sandbox, '--json'];
    return withAuth('codex', path.join(home, '.codex/auth.json'), async () => {
      sourceAt(root, true);
      run(out, 'codex-before', [...exec, probes], project, codexEnv);
      sourceAt(root, true);
      let turns = 0, thread;
      const turn = text => ({ id: 10 + turns, method: 'turn/start', params: { threadId: thread, input: [{ type: 'text', text }] } });
      await converse(out, 'codex-session', [bins.codex, 'app-server', ...sandbox], project, codexEnv,
        [{ id: 1, method: 'initialize', params: { clientInfo: { name: 'guard-acceptance', version: '1' }, capabilities: { experimentalApi: true } } }], m => {
          if (m.id === 1) return [{ method: 'initialized' }, { id: 2, method: 'thread/start', params: { cwd: project, model: 'gpt-6.1-sol', approvalPolicy: 'never', sandbox: 'read-only', ephemeral: true } }];
          if (m.id === 2) { thread = m.result?.thread?.id; return thread ? [turn(firstTurn)] : 'end'; }
          if (m.error) return 'end';
          if (m.method !== 'turn/completed') return;
          if (++turns === 1) { sourceAt(root, false, 'test/codex-session-switch'); return [turn(probes)]; }
          return 'end';
        });
      run(out, 'codex-after', [...exec, probes], project, codexEnv);
    });
  }
  if (step === 'uninstall') {
    const journal = path.join(home, '.hskills/plugins.json');
    const journalBefore = sha(fs.readFileSync(journal));
    const writes = JSON.parse(fs.readFileSync(journal)).writes;
    const configBefore = codexConfig(home);
    const name = label || 'uninstall';
    const status = run(out, name, [process.execPath, path.join(repo, 'scripts/install/install.js'), 'uninstall', '--home', home], root, guardEnv);
    const configAfter = codexConfig(home);
    const trimmed = s => s.replace(/\n+$/, '');
    const lines = s => s.split('\n').filter(l => l.trim()).join('\n');
    // Codex runtime preference tables ([tui], [windows]), verbatim: they hold no secrets.
    const preferenceTables = c => c && (c.ordinary.match(/^\[(?:tui|windows)\]\n(?:[^\[\n].*\n|\n)*/gm) || []).map(t => t.trim());
    const remaining = writes.filter(w => w.before === null && fs.existsSync(w.path)).map(w => w.path);
    const unrelated = Object.fromEntries(Object.keys(fixtures).map(rel => {
      const p = path.join(home, rel);
      const text = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
      return [rel, { identical: text === fixtures[rel], unrelatedHookKept: !!text && text.includes('unrelated-fixture-hook'), guardRemaining: !!text && /command-guard/.test(text) }];
    }));
    const { baseline } = JSON.parse(fs.readFileSync(path.join(root, 'state.json')));
    const after = fingerprints();
    const codex = { before: trustView(configBefore), after: trustView(configAfter),
      // This includes preserved preferences; false can be correct after uninstall.
      nonTrustConfigMatchesMinimalFixture: !!configAfter && trimmed(configAfter.ordinary) === trimmed(fixtures['.codex/config.toml']),
      // Byte identity and the trust lines are separate claims: re-registration may move
      // one blank separator line while every key and hash stays the same.
      trustBytesIdentical: !!configAfter && configAfter.trust === configBefore.trust,
      trustLinesPreserved: !!configAfter && lines(configAfter.trust) === lines(configBefore.trust),
      preferenceTables: { before: preferenceTables(configBefore), after: preferenceTables(configAfter) } };
    const journalAfter = fs.existsSync(journal) ? sha(fs.readFileSync(journal)) : null;
    const summary = { status, remainingOwned: remaining.map(scrub), unrelated, codexConfig: codex, journal: { beforeSha256: journalBefore, afterSha256: journalAfter }, userConfigUnchanged: JSON.stringify(after) === JSON.stringify(baseline), changed: Object.keys(after).filter(k => after[k] !== baseline[k]) };
    fs.writeFileSync(path.join(out, `${name}-summary.json`), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary, null, 2));
    return;
  }
  if (step === 'sanitize') {
    const out = path.resolve(process.argv[4]);
    fs.mkdirSync(out, { recursive: true });
    for (const name of fs.readdirSync(root)) {
      if (!/\.(stdout|stderr|json|jsonl|log)$/.test(name) || fs.statSync(path.join(root, name)).isDirectory()) continue;
      let text = fs.readFileSync(path.join(root, name), 'utf8');
      const transcript = /^(claude|codex)-/.test(name) && name.endsWith('.stdout');
      if (transcript) {
        text = text.split(/\r?\n/).filter(Boolean).map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean).filter(e =>
          // Command listings, remote-control status and moderation results carry unrelated
          // account context; thinking-token estimates describe hidden reasoning.
          e.type !== 'rate_limit_event' && !/^(commands_changed|thinking_tokens)$/.test(e.subtype || '') && !(e.item && e.item.type === 'reasoning') && !/reasoning|account|rateLimits|mcpServer|remoteControl|moderation/.test(e.method || '')).map(e => {
          if (e.type === 'system' && e.subtype === 'init') e = { type: e.type, subtype: e.subtype, session_id: e.session_id, model: e.model, cwd: e.cwd, plugins: e.plugins, tools: e.tools };
          if (e.message && Array.isArray(e.message.content)) e.message.content = e.message.content.filter(c => !/thinking/.test(c.type));
          return JSON.stringify(e);
        }).join('\n') + '\n';
      }
      fs.writeFileSync(path.join(out, name.replace(/\.stdout$/, '.jsonl')), scrub(text));
    }
    console.log(`sanitized: ${out}`);
    return;
  }
  throw new Error('usage: setup | claude|codex|hooks-list|doctor|uninstall <root> | sanitize <root> <out>');
}

function hooksList(root, out = root, name = 'codex-hooks-list') {
  const r = spawnSync(process.execPath, [path.join(repo, 'scripts/install/codex-hook-status.js')], { cwd: path.join(root, 'project'), env: { ...env, CODEX_HOME: path.join(root, 'home/.codex'), COMMAND_GUARD_CODEX: bins.codex }, encoding: 'utf8', timeout: 30000 });
  record(out, name, ['node', 'scripts/install/codex-hook-status.js'], path.join(root, 'project'), {}, r);
  for (const g of JSON.parse(r.stdout).result.data) for (const h of g.hooks) console.log(h.source, h.pluginId || '', h.enabled, h.trustStatus, h.command || '');
}

main().catch(e => { console.error(e); process.exitCode = 1; });
