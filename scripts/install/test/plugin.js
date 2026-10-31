'use strict';
// Real host CLIs, disposable HOME only; no credentials or trust state.
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');
const home = fs.mkdtempSync(path.join(os.tmpdir(), 'guard-plugin-test-'));
try {
  fs.mkdirSync(path.join(home, '.codex'));
  const trustRegression = spawnSync(process.execPath, [path.join(__dirname, 'trust.js')], { encoding: 'utf8' });
  assert.equal(trustRegression.status, 0, trustRegression.stdout + trustRegression.stderr);

  fs.writeFileSync(path.join(home, '.codex/config.toml'), 'hide_agent_reasoning = true\n');
  const real = process.argv.includes('--real');
  const commands = spawnSync(process.execPath, [path.resolve(__dirname, '../evidence/live-plugins-windows.js'), 'probe-commands'], { encoding: 'utf8' });
  assert.equal(commands.status, 0, commands.stderr);
  const probes = JSON.parse(commands.stdout);
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


  for (const host of ['claude', 'codex']) { fs.copyFileSync(path.join(__dirname, 'host.cjs'), path.join(home, host + '.cjs')); fs.chmodSync(path.join(home, host + '.cjs'), 0o755); }
  const claude = real ? '/home/agent/.local/bin/claude' : path.join(home, 'claude.cjs');
  const codex = real ? '/home/agent/.npm-global/bin/codex' : path.join(home, 'codex.cjs');
  const cli = path.resolve(__dirname, '../install.js');
  const source = path.join(home, 'source');
  fs.cpSync(path.resolve(__dirname, '../../../hooks/command-guard'), path.join(source, 'hooks/command-guard'), { recursive: true });
  const run = () => spawnSync(process.execPath, [cli, 'prepare-plugin', '--home', home, '--source', source], { encoding: 'utf8', env: { ...process.env, COMMAND_GUARD_CLAUDE: claude, COMMAND_GUARD_CODEX: codex } });
  const legacy = spawnSync(process.execPath, [path.resolve(__dirname, '../../../hooks/command-guard/install.js'), '--home', home], { encoding: 'utf8' });
  assert.equal(legacy.status, 1); // Codex trust remains pending
  const settings = path.join(home, '.claude/settings.json');
  const old = JSON.parse(fs.readFileSync(settings));
  old.hooks.PreToolUse[0].hooks.push({ type: 'command', command: 'echo personal' });
  fs.writeFileSync(settings, JSON.stringify(old));
  const before = fs.readFileSync(settings, 'utf8');
  const broken = path.join(home, 'broken-claude.cjs');
  fs.writeFileSync(broken, '#!/usr/bin/env node\nconst {spawnSync}=require("child_process"); const args=process.argv.slice(2); if(args[1]==="install")process.exit(9); const bin=' + JSON.stringify(claude) + '; const r=spawnSync(bin.endsWith(".cjs")?process.execPath:bin,bin.endsWith(".cjs")?[bin,...args]:args,{stdio:"inherit"});process.exit(r.status);\n', { mode: 0o755 });
  const fail = spawnSync(process.execPath, [cli, 'prepare-plugin', '--home', home, '--source', source], { encoding: 'utf8', env: { ...process.env, COMMAND_GUARD_CLAUDE: broken } });
  assert.equal(fail.status, 1);
  assert.equal(fs.readFileSync(settings, 'utf8'), before);
  const result = run();
  assert.equal(result.status, 1); // pending trust, rather than unsupported
  assert.doesNotMatch(result.stdout, /UNSUPPORTED/);
  assert.match(result.stdout, /REGISTERED claude/);
  assert.match(result.stdout, /PENDING Codex human trust/);
  assert.match(result.stdout, /UNPROTECTED: no verified trusted legacy fallback/);
  if (!real) assert.match(result.stdout, /legacy fallback: enabled\/untrusted/);
  const record = JSON.parse(fs.readFileSync(path.join(home, '.skill-collection/plugins.json')));
  assert.equal(record.hosts.length, 2);
  for (const host of record.hosts) assert.ok(host.snapshot.startsWith(home));
  assert.deepEqual(JSON.parse(fs.readFileSync(settings)).hooks.PreToolUse[0].hooks, [{ type: 'command', command: 'echo personal' }]);
  const codexHooks = path.join(home, '.codex/hooks.json');
  const fallback = fs.readFileSync(codexHooks);
  assert.match(fallback.toString(), /command-guard/);
  const claudeHome = path.join(home, 'claude-only');
  fs.mkdirSync(claudeHome);
  const claudeOnly = spawnSync(process.execPath, [cli, 'prepare-plugin', '--home', claudeHome, '--source', source], {
    encoding: 'utf8', env: { ...process.env, COMMAND_GUARD_CLAUDE: claude }
  });
  assert.equal(claudeOnly.status, 0, claudeOnly.stdout + claudeOnly.stderr);
  const occupiedHome = path.join(home, 'occupied-home');
  const occupied = path.join(occupiedHome, '.skill-collection/plugin-cache', path.basename(record.hosts[0].snapshot));
  fs.cpSync(record.hosts[0].snapshot, occupied, { recursive: true });
  fs.unlinkSync(path.join(occupied, '.claude-plugin/marketplace.json'));
  const existingAdapter = fs.readFileSync(path.join(occupied, 'adapters/codex.js'));
  const occupiedRun = spawnSync(process.execPath, [cli, 'prepare-plugin', '--home', occupiedHome, '--source', source], { encoding: 'utf8' });
  assert.match(occupiedRun.stdout + occupiedRun.stderr, /CONFLICT/);
  assert.equal(fs.existsSync(path.join(occupiedHome, '.skill-collection/plugins.json')), false);
  spawnSync(process.execPath, [cli, 'uninstall', '--home', occupiedHome]);
  assert.deepEqual(fs.readFileSync(path.join(occupied, 'adapters/codex.js')), existingAdapter);
  if (!real) {
    fs.writeFileSync(path.join(home, '.codex/legacy-trusted'), 'human fixture decision');
    const protectedPending = run();
    assert.equal(protectedPending.status, 1);
    assert.match(protectedPending.stdout, /PROTECTED by trusted legacy fallback/);
    fs.unlinkSync(path.join(home, '.codex/legacy-trusted'));
  }
  const again = run();
  assert.deepEqual(fs.readFileSync(codexHooks), fallback);
  if (!real) {
  fs.writeFileSync(path.join(home, '.codex/human-trusted'), 'human fixture decision');
  const trusted = run();
  assert.equal(trusted.status, 0, trusted.stdout + trusted.stderr);
  assert.ok(!fs.readFileSync(codexHooks, 'utf8').includes('/command-guard/adapters/'));
  }
  assert.match(again.stdout, /REGISTERED claude/, again.stderr);
  fs.appendFileSync(path.join(source, 'hooks/command-guard/adapters/claude-code.js'), '\n// updated source\n');
  const updated = run();
  assert.match(updated.stdout, /REGISTERED claude/, updated.stderr);
  assert.match(updated.stdout, /REGISTERED codex/, updated.stdout + updated.stderr);
  assert.ok(JSON.parse(fs.readFileSync(path.join(home, '.skill-collection/plugins.json'))).hosts.every(h => h.snapshot !== record.hosts[0].snapshot), updated.stdout + updated.stderr);
  fs.writeFileSync(path.join(source, 'collection.json'), JSON.stringify({core: [], packs: {}, expensive: []}));
  const normal = spawnSync(process.execPath, [cli, 'install', '--home', home, '--source', source], {encoding: 'utf8', env: {...process.env, COMMAND_GUARD_CLAUDE: claude, COMMAND_GUARD_CODEX: codex}});
  assert.match(normal.stdout, /REGISTERED codex/, normal.stdout + normal.stderr);
  const config = path.join(home, '.codex/config.toml');
  if (!real) {
    const saved = fs.mkdtempSync(path.join(os.tmpdir(), 'trust-baseline-'));
    fs.cpSync(home, saved, { recursive: true });
    const trust = '[hooks.state."command-guard@skill-collection-guard:hooks/codex.json:pre_tool_use:0:0"]\ntrusted_hash = "sha256:' + 'a'.repeat(64) + '"\ntrusted_content_hash = "sha256:' + 'b'.repeat(64) + '"\n';
    fs.appendFileSync(config, '\n' + trust);
    const trustedAgain = run();
    assert.doesNotMatch(trustedAgain.stdout + trustedAgain.stderr, /CONFLICT/);
    const removed = spawnSync(process.execPath, [cli, 'uninstall', '--home', home], { encoding: 'utf8' });
    assert.equal(removed.status, 0, removed.stdout + removed.stderr);
    assert.ok(fs.readFileSync(config, 'utf8').includes(trust));
    assert.doesNotMatch(fs.readFileSync(config, 'utf8'), /\[plugins\./);
    assert.match(fs.readFileSync(config, 'utf8'), /hide_agent_reasoning = true/);
    fs.rmSync(home, { recursive: true, force: true });
    fs.cpSync(saved, home, { recursive: true });
    fs.rmSync(saved, { recursive: true, force: true });
  }
  const installedConfig = fs.readFileSync(config);
  fs.appendFileSync(config, '\n# personal change\n');
  const refused = spawnSync(process.execPath, [cli, 'uninstall', '--home', home], { encoding: 'utf8' });
  assert.equal(refused.status, 1);
  assert.match(fs.readFileSync(config, 'utf8'), /personal change/);
  const personal = fs.readFileSync(config);
  const journal = fs.readFileSync(path.join(home, '.skill-collection/plugins.json'));
  const reinstall = run();
  assert.match(reinstall.stdout + reinstall.stderr, /CONFLICT/);
  assert.deepEqual(fs.readFileSync(config), personal);
  assert.deepEqual(fs.readFileSync(path.join(home, '.skill-collection/plugins.json')), journal);
  spawnSync(process.execPath, [cli, 'uninstall', '--home', home]);
  assert.deepEqual(fs.readFileSync(config), personal);
  fs.writeFileSync(config, installedConfig);
  const latest = JSON.parse(fs.readFileSync(path.join(home, '.skill-collection/plugins.json')));
  const extra = path.join(latest.hosts[0].snapshot, 'adapters/personal.txt');
  fs.writeFileSync(extra, 'personal snapshot addition');
  const extraRun = run();
  assert.match(extraRun.stdout + extraRun.stderr, /CONFLICT/);
  spawnSync(process.execPath, [cli, 'uninstall', '--home', home]);
  assert.equal(fs.readFileSync(extra, 'utf8'), 'personal snapshot addition');

  const uninstall = spawnSync(process.execPath, [cli, 'uninstall', '--home', home], { encoding: 'utf8' });
  assert.equal(uninstall.status, 0, uninstall.stdout + uninstall.stderr);
  assert.ok(JSON.parse(fs.readFileSync(settings)).hooks.PreToolUse.every(g => g.hooks.every(h => h.command === 'echo personal')));

  console.log('plugin ' + (real ? 'real CLI' : 'CLI boundary') + ' registration, rollback, migration, update and uninstall passed');
} finally { fs.rmSync(home, { recursive: true, force: true }); }
