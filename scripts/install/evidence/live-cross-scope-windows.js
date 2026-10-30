'use strict';
// Manual Windows authenticated evidence for #127. Usage:
//   node live-cross-scope-windows.js symlink|junction [existing-root]
//   node live-cross-scope-windows.js --sanitize <root> <out-dir>
// Each host's config home is the scenario's disposable home: CLAUDE_CONFIG_DIR
// is <home>/.claude, CODEX_HOME is <home>/.agents (so Codex user skills are the
// installer's agents root). Windows Codex ignores HOME/USERPROFILE for skills.
// Existing auth is reached through a file symlink to the credential file, never
// a copy; the link is created per run and removed afterwards. No real settings,
// skill links or trust are written.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

const scenarios = ['duplicate', 'project-to-user', 'user-to-project'];
const prompt = 'Invoke {invoke}. Load the selected caller body and required skill body and reference using installed skill visibility. Report their exact paths, body markers and reference token. Also report every scope-caller entry visible in your installed skill listing with its path. Do not edit anything or invoke other skills.';
// Keep the parent harness session out of child processes.
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDECODE|CLAUDE_CODE_(?!GIT_BASH_PATH)|CLAUDE_AGENT_SDK|CLAUDE_PID|CODEX_)/.test(k)));
const which = name => {
  const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', `(Get-Command ${name}).Source`], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.trim();
};
const linkInfo = p => {
  const r = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
    '$i = Get-Item -LiteralPath $env:SCOPE_LINK; [pscustomobject]@{ LinkType = $i.LinkType; Target = @($i.Target) -join "," } | ConvertTo-Json -Compress'],
  { encoding: 'utf8', env: { ...process.env, SCOPE_LINK: p } });
  assert.equal(r.status, 0, r.stderr);
  return { path: p, ...JSON.parse(r.stdout), realpath: fs.realpathSync(p) };
};
const claudeRead = p => 'Read(//' + p.replace(/^([A-Za-z]):/, (_, d) => d.toLowerCase()).replace(/\\/g, '/') + '/**)';

if (process.argv[2] === '--list') {
  // Actual Codex app-server skills/list response; requests arrive on stdin.
  const { spawn } = require('node:child_process');
  const child = spawn(process.argv[3], ['app-server'], { stdio: ['pipe', 'pipe', 'ignore'] });
  let buffer = '';
  child.stdout.setEncoding('utf8').on('data', chunk => {
    buffer += chunk;
    let i;
    while ((i = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, i).trim();
      buffer = buffer.slice(i + 1);
      if (!line) continue;
      console.log(line);
      if (JSON.parse(line).id === 2) { child.kill(); return; }
    }
  });
  // Keep the app-server's stdin open: it exits at EOF before answering.
  process.stdin.pipe(child.stdin, { end: false });
  setTimeout(() => { child.kill(); process.exit(1); }, 60000).unref();
  return; // CommonJS module scope
}

if (process.argv[2] === '--sanitize') {
  const [root, out] = process.argv.slice(3).map(p => path.resolve(p));
  fs.mkdirSync(out, { recursive: true });
  // Replace only the account name, at any separator escaping depth, so drive
  // forms such as Claude's //c/ permission rules stay visible.
  const profile = new RegExp(`(Users(?:\\\\|/)+)${path.basename(os.homedir())}(?![\\w-])`, 'gi');
  const scrub = s => s.replace(profile, '$1<user>');
  for (const scenario of scenarios) {
    for (const name of fs.readdirSync(path.join(root, scenario))) {
      if (!/^(claude|codex|codex-list|links|install\.log)/.test(name) || name.endsWith('.stderr')) continue;
      const text = fs.readFileSync(path.join(root, scenario, name), 'utf8');
      let kept = text;
      if (name.endsWith('.jsonl')) {
        kept = text.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)).filter(e =>
          // Init, command listings and remote-control status carry unrelated account context.
          !(e.type === 'system' && ['init', 'commands_changed'].includes(e.subtype)) && e.type !== 'rate_limit_event' &&
          !/^remoteControl\//.test(e.method || '') &&
          !(e.item && e.item.type === 'reasoning')).map(e => {
          if (e.message && Array.isArray(e.message.content)) e.message.content = e.message.content.filter(c => !/thinking/.test(c.type));
          return JSON.stringify(e);
        }).join('\n') + '\n';
      }
      fs.writeFileSync(path.join(out, `${scenario}-${name}`), scrub(kept));
    }
  }
  console.log(`sanitized: ${out}`);
  process.exit(0);
}

const mode = process.argv[2];
assert.ok(['symlink', 'junction'].includes(mode), 'usage: symlink|junction [existing-root]');
assert.equal(process.platform, 'win32');
const builder = path.join(__dirname, 'cross-scope.js');
const built = process.argv[3] ? `ROOT: ${process.argv[3]}` :
  spawnSync(process.execPath, [builder, ...(mode === 'junction' ? ['--junction'] : [])], { encoding: 'utf8' }).stdout;
console.log(built.trim());
const root = built.split('ROOT: ')[1].trim();
const bins = { claude: which('claude'), codex: which('codex') };
// A fresh CODEX_HOME has no Windows sandbox mode: read-only exec then rejects
// every command "by policy". Elevated needs Codex's one-time machine setup.
const codexSandbox = ['-c', 'windows.sandbox="elevated"'];
const credentials = { claude: path.join(os.homedir(), '.claude/.credentials.json'), codex: path.join(os.homedir(), '.codex/auth.json') };

function run(base, name, argv, cwd, childEnv, input) {
  fs.writeFileSync(path.join(base, `${name}-invocation.json`), JSON.stringify({ cwd, argv, env: Object.keys(childEnv).filter(k => !(k in env) || env[k] !== childEnv[k]).reduce((o, k) => ({ ...o, [k]: childEnv[k] }), {}) }, null, 2));
  const r = spawnSync(argv[0], argv.slice(1), { cwd, env: childEnv, input, encoding: 'utf8', timeout: 300000, maxBuffer: 64 << 20 });
  fs.writeFileSync(path.join(base, `${name}.jsonl`), r.stdout || '');
  fs.writeFileSync(path.join(base, `${name}.stderr`), r.stderr || '');
  const status = r.error ? String(r.error.code || r.error) : r.status;
  fs.writeFileSync(path.join(base, `${name}-status.json`), JSON.stringify(status));
  console.log(path.basename(base), name, status);
  return status;
}

// Auth reference: link, run, verify it stayed a link (no materialized copy), unlink.
function withAuth(host, dest, fn) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.symlinkSync(credentials[host], dest, 'file');
  try { return fn(); } finally {
    const ok = fs.lstatSync(dest).isSymbolicLink() && fs.readlinkSync(dest) === credentials[host];
    if (ok) fs.unlinkSync(dest);
    else throw new Error(`${dest} is no longer a link to the credential file; inspect and remove it by hand`);
  }
}

for (const scenario of scenarios) {
  const base = path.join(root, scenario);
  const home = path.join(base, 'home');
  const project = path.join(base, 'project');
  const links = [];
  for (const scope of [home, project]) {
    for (const folder of ['.claude', '.agents']) {
      const dir = path.join(scope, folder, 'skills');
      for (const name of fs.readdirSync(dir)) if (name.startsWith('scope-')) links.push(linkInfo(path.join(dir, name)));
    }
  }
  fs.writeFileSync(path.join(base, 'links.json'), JSON.stringify({ mode, links }, null, 2));

  const claudeHome = path.join(home, '.claude');
  if (!fs.existsSync(path.join(base, 'claude-status.json')) || JSON.parse(fs.readFileSync(path.join(base, 'claude-status.json'))) !== 0) {
    const settings = path.join(base, 'live-settings.json');
    fs.writeFileSync(settings, JSON.stringify({ disableAllHooks: true, permissions: { allow: [claudeRead(base)] } }));
    withAuth('claude', path.join(claudeHome, '.credentials.json'), () => run(base, 'claude',
      [bins.claude, '-p', '--model', 'opus', '--effort', 'medium', '--setting-sources', 'user,project', '--settings', settings, '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--no-session-persistence', '--tools', 'Read,Skill', '--output-format', 'stream-json', '--verbose', prompt.replace('{invoke}', '/scope-caller')],
      project, { ...env, CLAUDE_CONFIG_DIR: claudeHome }));
  }

  const codexHome = path.join(home, '.agents');
  if (!fs.existsSync(path.join(base, 'codex-status.json')) || JSON.parse(fs.readFileSync(path.join(base, 'codex-status.json'))) !== 0) {
    const codexEnv = { ...env, CODEX_HOME: codexHome };
    withAuth('codex', path.join(codexHome, 'auth.json'), () => {
      const list = [{ id: 1, method: 'initialize', params: { clientInfo: { name: 'scope-evidence', version: '1' } } }, { method: 'initialized' }, { id: 2, method: 'skills/list', params: { cwds: [project], forceReload: true } }];
      run(base, 'codex-list', [process.execPath, __filename, '--list', bins.codex], project, codexEnv, list.map(m => JSON.stringify(m)).join('\n') + '\n');
      return run(base, 'codex',
        [bins.codex, 'exec', '--ephemeral', '--skip-git-repo-check', '--model', 'gpt-6.1-sol', '-s', 'read-only', '-c', 'approval_policy="never"', '-c', 'model_reasoning_effort="medium"', ...codexSandbox, '--json', prompt.replace('{invoke}', '$scope-caller')],
        project, codexEnv);
    });
  }
}
console.log(`ROOT: ${root}`);
