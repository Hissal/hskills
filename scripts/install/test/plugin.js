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
  const real = process.argv.includes('--real');
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
  const record = JSON.parse(fs.readFileSync(path.join(home, '.skill-collection/plugins.json')));
  assert.equal(record.hosts.length, 2);
  for (const host of record.hosts) assert.ok(host.snapshot.startsWith(home));
  assert.deepEqual(JSON.parse(fs.readFileSync(settings)).hooks.PreToolUse[0].hooks, [{ type: 'command', command: 'echo personal' }]);
  const again = run();
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
  const installedConfig = fs.readFileSync(config);
  fs.appendFileSync(config, '\n# personal change\n');
  const refused = spawnSync(process.execPath, [cli, 'uninstall', '--home', home], { encoding: 'utf8' });
  assert.equal(refused.status, 1);
  assert.match(fs.readFileSync(config, 'utf8'), /personal change/);
  fs.writeFileSync(config, installedConfig);
  const uninstall = spawnSync(process.execPath, [cli, 'uninstall', '--home', home], { encoding: 'utf8' });
  assert.equal(uninstall.status, 0, uninstall.stdout + uninstall.stderr);
  assert.ok(JSON.parse(fs.readFileSync(settings)).hooks.PreToolUse.every(g => g.hooks.every(h => h.command === 'echo personal')));
  console.log('plugin ' + (real ? 'real CLI' : 'CLI boundary') + ' registration, rollback, migration, update and uninstall passed');
} finally { fs.rmSync(home, { recursive: true, force: true }); }
