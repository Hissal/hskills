'use strict';
// Real host CLIs, disposable HOME only; no credentials or trust state.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');
const { tempDir } = require('../../test-util');
const { stage } = require('./pool');
const home = tempDir('guard-plugin-test-');
try {
  fs.mkdirSync(path.join(home, '.codex'));
  const personalConfig = 'hide_agent_reasoning = true\ndeveloper_instructions = """\n[hooks.state."fake"]\nenabled = true\n"""\n';
  fs.writeFileSync(path.join(home, '.codex/config.toml'), personalConfig);
  const real = process.argv.includes('--real');
  stage('probe commands');
  const commands = spawnSync(process.execPath, [path.resolve(__dirname, '../evidence/live-plugins-windows.js'), 'probe-commands'], { encoding: 'utf8' });
  assert.equal(commands.status, 0, commands.stderr);
  const probes = JSON.parse(commands.stdout);
  // Live Claude runs hold real auth: grant only the exact probe commands.
  assert.deepEqual(probes.claudeAllowedTools, ['git push --force origin main', probes.allow, probes.project].map(c => 'Bash(' + c + ')'));
  const allow = spawnSync(probes.allow, { shell: true, encoding: 'utf8' });
  assert.equal(allow.status, 0, allow.stderr);
  assert.equal(allow.stdout.trim(), 'ALLOW_120');
  const project = path.join(home, 'probe-project');
  fs.mkdirSync(path.join(project, '.agents/config'), { recursive: true });
  fs.writeFileSync(path.join(project, '.agents/config/command-guard.json'), JSON.stringify({ rules: [probes.rule] }));
  for (const [command, denied] of [[probes.allow, false], [probes.project, true], ['git push --force origin main', true]]) {
    const verdict = spawnSync(process.execPath, [path.resolve(__dirname, '../../../hooks/command-guard/adapters/codex.js')], {
      input: JSON.stringify({ cwd: project, tool_name: 'Bash', tool_input: { command } }), encoding: 'utf8',
      env: { ...process.env, COMMAND_GUARD_STATE: path.join(home, 'probe-state') }
    });
    assert.equal(verdict.status, 0, verdict.stderr);
    if (denied) assert.match(verdict.stdout, /HUMAN-REQUIRED/);
    else assert.equal(verdict.stdout, '');
  }


  stage('host doubles');
  const doubles = require('./doubles')(home);
  const { guardCheckout } = require('./doubles');
  const claude = real ? '/home/agent/.local/bin/claude' : doubles.claude;
  const codex = real ? '/home/agent/.npm-global/bin/codex' : doubles.codex;
  const cli = path.resolve(__dirname, '../install.js');
  const source = guardCheckout(path.join(home, 'source'));
  const guard = path.join(source, 'hooks/command-guard');
  const hostEnv = dir => ({ ...process.env, HOME: dir, USERPROFILE: dir, CLAUDE_CONFIG_DIR: path.join(dir, '.claude'), CODEX_HOME: path.join(dir, '.codex'), XDG_CONFIG_HOME: path.join(dir, '.config') });
  const host = (bin, args, dir) => spawnSync(bin.endsWith('.cjs') ? process.execPath : bin, bin.endsWith('.cjs') ? [bin, ...args] : args, { encoding: 'utf8', env: hostEnv(dir), cwd: dir });
  const run = (from = source) => spawnSync(process.execPath, [cli, 'register-guard', '--home', home, '--source', from], { encoding: 'utf8', env: { ...process.env, COMMAND_GUARD_CLAUDE: claude, COMMAND_GUARD_CODEX: codex } });
  stage('legacy install');
  const legacy = spawnSync(process.execPath, [path.resolve(__dirname, '../../../hooks/command-guard/install.js'), '--home', home], { encoding: 'utf8' });
  assert.equal(legacy.status, 1); // Codex trust remains pending
  const settings = path.join(home, '.claude/settings.json');
  const old = JSON.parse(fs.readFileSync(settings));
  old.hooks.PreToolUse[0].hooks.push({ type: 'command', command: 'echo personal' });
  fs.writeFileSync(settings, JSON.stringify(old));
  const before = fs.readFileSync(settings, 'utf8');
  const broken = path.join(home, 'broken-claude.cjs');
  fs.writeFileSync(broken, '#!/usr/bin/env node\nconst {spawnSync}=require("child_process"); const args=process.argv.slice(2); if(args[1]==="install")process.exit(9); const bin=' + JSON.stringify(claude) + '; const r=spawnSync(bin.endsWith(".cjs")?process.execPath:bin,bin.endsWith(".cjs")?[bin,...args]:args,{stdio:"inherit"});process.exit(r.status);\n', { mode: 0o755 });
  stage('failed registration rolls back');
  const fail = spawnSync(process.execPath, [cli, 'register-guard', '--home', home, '--source', source], { encoding: 'utf8', env: { ...process.env, COMMAND_GUARD_CLAUDE: broken } });
  assert.equal(fail.status, 1);
  assert.equal(fs.readFileSync(settings, 'utf8'), before);
  stage('first registration');
  const result = run();
  assert.equal(result.status, 1); // pending trust, rather than unsupported
  assert.doesNotMatch(result.stdout, /UNSUPPORTED/);
  assert.match(result.stdout, /REGISTERED claude/);
  assert.match(result.stdout, /PENDING Codex human trust/);
  assert.match(result.stdout, /UNPROTECTED: no verified trusted legacy fallback/);
  if (!real) assert.match(result.stdout, /legacy fallback: enabled\/untrusted/);
  const record = JSON.parse(fs.readFileSync(path.join(home, '.hskills/plugins.json')));
  assert.equal(record.hosts.length, 2);
  for (const h of record.hosts) assert.equal(h.source, guard);
  assert.deepEqual(JSON.parse(fs.readFileSync(settings)).hooks.PreToolUse[0].hooks, [{ type: 'command', command: 'echo personal' }]);
  const codexHooks = path.join(home, '.codex/hooks.json');
  const fallback = fs.readFileSync(codexHooks);
  assert.match(fallback.toString(), /command-guard/);
  stage('Claude-only registration');
  const claudeHome = path.join(home, 'claude-only');
  fs.mkdirSync(claudeHome);
  const claudeOnly = spawnSync(process.execPath, [cli, 'register-guard', '--home', claudeHome, '--source', source], {
    encoding: 'utf8', env: { ...process.env, COMMAND_GUARD_CLAUDE: claude }
  });
  assert.equal(claudeOnly.status, 0, claudeOnly.stdout + claudeOnly.stderr);
  // An hskills marketplace another checkout registered stays that checkout's.
  stage('occupied marketplace');
  const occupiedHome = path.join(home, 'occupied-home');
  fs.mkdirSync(path.join(occupiedHome, '.codex'), { recursive: true });
  const other = guardCheckout(path.join(home, 'other-checkout'));
  assert.equal(host(claude, ['plugin', 'marketplace', 'add', other, '--json'], occupiedHome).status, 0);
  const occupiedRun = spawnSync(process.execPath, [cli, 'register-guard', '--home', occupiedHome, '--source', source], { encoding: 'utf8', env: { ...process.env, COMMAND_GUARD_CLAUDE: claude, COMMAND_GUARD_CODEX: codex } });
  assert.equal(occupiedRun.status, 1, occupiedRun.stdout + occupiedRun.stderr);
  assert.match(occupiedRun.stderr, /CONFLICT claude marketplace hskills is registered from .*other-checkout/);
  const kept = JSON.parse(host(claude, ['plugin', 'marketplace', 'list', '--json'], occupiedHome).stdout).find(m => m.name === 'hskills');
  assert.equal(fs.realpathSync(kept.path), fs.realpathSync(other));
  assert.doesNotMatch(host(claude, ['plugin', 'list', '--json'], occupiedHome).stdout, /command-guard@hskills/);
  if (!real) {
    stage('legacy fallback states');
    fs.writeFileSync(path.join(home, '.codex/status-unavailable'), 'fixture status failure');
    const unavailable = run();
    assert.equal(unavailable.status, 1);
    assert.match(unavailable.stdout, /legacy fallback: status unavailable/);
    assert.match(unavailable.stdout, /UNPROTECTED/);
    fs.unlinkSync(path.join(home, '.codex/status-unavailable'));
    fs.writeFileSync(path.join(home, '.codex/legacy-trusted'), 'human fixture decision');
    const protectedPending = run();
    assert.equal(protectedPending.status, 1);
    assert.match(protectedPending.stdout, /PROTECTED by trusted legacy fallback/);
    fs.unlinkSync(path.join(home, '.codex/legacy-trusted'));
  }
  stage('rerun and trust');
  const again = run();
  assert.deepEqual(fs.readFileSync(codexHooks), fallback);
  if (!real) {
  fs.writeFileSync(path.join(home, '.codex/human-trusted'), 'human fixture decision');
  const trusted = run();
  assert.equal(trusted.status, 0, trusted.stdout + trusted.stderr);
  assert.ok(!fs.readFileSync(codexHooks, 'utf8').includes('/command-guard/adapters/'));
  }
  assert.match(again.stdout, /REGISTERED claude/, again.stderr);
  // Another spelling of this checkout is still this checkout: a link to it and,
  // where the filesystem ignores case, the same path in other case.
  stage('respelled checkout');
  const link = path.join(home, 'source-link');
  fs.symlinkSync(source, link, 'junction');
  const upper = path.join(home, 'SOURCE');
  for (const spelling of fs.existsSync(upper) ? [link, upper] : [link]) {
    const respelled = run(spelling);
    assert.doesNotMatch(respelled.stdout + respelled.stderr, /CONFLICT|FAIL/, spelling);
    assert.match(respelled.stdout, /REGISTERED claude/, respelled.stdout + respelled.stderr);
    assert.match(respelled.stdout, /REGISTERED codex/, respelled.stdout + respelled.stderr);
  }
  // The registration follows the checkout. Codex runs its copy until a rerun
  // refreshes it, and doctor reports the copy stale until then.
  stage('source update and doctor');
  fs.appendFileSync(path.join(guard, 'adapters/claude-code.js'), '\n// updated source\n');
  const doctor = () => spawnSync(process.execPath, [cli, 'doctor', '--home', home, '--source', source], { encoding: 'utf8', env: { ...process.env, COMMAND_GUARD_CLAUDE: claude, COMMAND_GUARD_CODEX: codex } });
  const stale = doctor();
  assert.equal(stale.status, 1, stale.stdout + stale.stderr);
  assert.match(stale.stderr, /stale Codex copy of the guard .*rerun install/, stale.stdout + stale.stderr);
  const updated = run();
  assert.match(updated.stdout, /REGISTERED claude/, updated.stderr);
  assert.match(updated.stdout, /REGISTERED codex/, updated.stdout + updated.stderr);
  assert.ok(JSON.parse(fs.readFileSync(path.join(home, '.hskills/plugins.json'))).hosts.every(h => h.source === guard), updated.stdout + updated.stderr);
  const copy = path.join(home, '.codex/plugins/cache/hskills/command-guard', JSON.parse(fs.readFileSync(path.join(guard, '.codex-plugin/plugin.json'))).version, 'adapters/claude-code.js');
  assert.deepEqual(fs.readFileSync(copy), fs.readFileSync(path.join(guard, 'adapters/claude-code.js')));
  const refreshed = doctor();
  assert.doesNotMatch(refreshed.stdout + refreshed.stderr, /stale Codex copy/);
  stage('normal install');
  fs.writeFileSync(path.join(source, 'collection.json'), JSON.stringify({core: [], packs: {}, expensive: []}));
  const normal = spawnSync(process.execPath, [cli, 'install', '--home', home, '--source', source], {encoding: 'utf8', env: {...process.env, COMMAND_GUARD_CLAUDE: claude, COMMAND_GUARD_CODEX: codex}});
  assert.match(normal.stdout, /REGISTERED codex/, normal.stdout + normal.stderr);
  const config = path.join(home, '.codex/config.toml');
  if (!real) {
    stage('native trust uninstall');
    const saved = tempDir('trust-baseline-');
    fs.cpSync(home, saved, { recursive: true });
    // Native Windows writer shape: bare parent, basic plugin key, literal backslash key.
    const trust = '[hooks.state]\n\n[hooks.state."command-guard@hskills:hooks/codex.json:pre_tool_use:0:0"]\ntrusted_hash = "sha256:' + 'a'.repeat(64) + '"\ntrusted_content_hash = "sha256:' + 'b'.repeat(64) + '"\nenabled = true\n'
      + "\n[hooks.state.'C:\\Users\\human\\.codex\\hooks.json:pre_tool_use:0:0']\ntrusted_hash = \"sha256:" + 'c'.repeat(64) + '"\nenabled = true\n';
    fs.appendFileSync(config, '\n' + trust);
    const trustedAgain = run();
    assert.doesNotMatch(trustedAgain.stdout + trustedAgain.stderr, /CONFLICT/);
    const removed = spawnSync(process.execPath, [cli, 'uninstall', '--home', home], { encoding: 'utf8' });
    assert.equal(removed.status, 0, removed.stdout + removed.stderr);
    assert.ok(fs.readFileSync(config, 'utf8').includes(trust));
    assert.doesNotMatch(fs.readFileSync(config, 'utf8'), /\[plugins\./);
    assert.ok(fs.readFileSync(config, 'utf8').startsWith(personalConfig));
    fs.rmSync(home, { recursive: true, force: true });
    fs.cpSync(saved, home, { recursive: true });
    fs.rmSync(saved, { recursive: true, force: true });
  }
  stage('changed registration and uninstall');
  const installedConfig = fs.readFileSync(config);
  fs.appendFileSync(config, '\n# personal change\n');
  const refused = spawnSync(process.execPath, [cli, 'uninstall', '--home', home], { encoding: 'utf8' });
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /^FAIL uninstall: CONFLICT changed registration preserved: /m);
  assert.match(fs.readFileSync(config, 'utf8'), /personal change/);
  const personal = fs.readFileSync(config);
  const journal = fs.readFileSync(path.join(home, '.hskills/plugins.json'));
  const reinstall = run();
  assert.match(reinstall.stdout + reinstall.stderr, /CONFLICT/);
  assert.deepEqual(fs.readFileSync(config), personal);
  assert.deepEqual(fs.readFileSync(path.join(home, '.hskills/plugins.json')), journal);
  spawnSync(process.execPath, [cli, 'uninstall', '--home', home]);
  assert.deepEqual(fs.readFileSync(config), personal);
  fs.writeFileSync(config, installedConfig);
  const uninstall = spawnSync(process.execPath, [cli, 'uninstall', '--home', home], { encoding: 'utf8' });
  assert.equal(uninstall.status, 0, uninstall.stdout + uninstall.stderr);
  for (const bin of [claude, codex]) assert.doesNotMatch(host(bin, ['plugin', 'list', '--json'], home).stdout, /command-guard@hskills/);
  assert.ok(JSON.parse(fs.readFileSync(settings)).hooks.PreToolUse.every(g => g.hooks.every(h => h.command === 'echo personal')));

  console.log('plugin ' + (real ? 'real CLI' : 'CLI boundary') + ' registration, rollback, migration, update and uninstall passed');
} finally { fs.rmSync(home, { recursive: true, force: true }); }
