'use strict';
// Repeated trusted lifecycles through the CLI: disposable HOME, CLI host doubles,
// real journal and filesystem. Shapes follow docs/evidence/windows-guard-followup-2026-10-31.md.
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');
const cli = path.resolve(__dirname, '../install.js');
const hash = c => '"sha256:' + c.repeat(64) + '"';
// Native writer output after human /hooks review: bare parent, basic plugin key, literal user key.
const trust = '\n[hooks.state]\n\n[hooks.state."command-guard@skill-collection-guard:hooks/codex.json:pre_tool_use:0:0"]\n'
  + 'trusted_hash = ' + hash('a') + '\ntrusted_content_hash = ' + hash('b') + '\nenabled = true\n'
  + "\n[hooks.state.'C:\\Users\\human\\AppData\\Local\\Temp\\fixture\\home\\.codex\\hooks.json:pre_tool_use:0:0']\n"
  + 'trusted_hash = ' + hash('c') + '\nenabled = true\n';
// The 77-byte chunk Codex 0.166.0 wrote beside the trust tables.
const preferences = '\n[tui]\nscreen_reader_detection_done = true\n\n[windows]\nsandbox = "unelevated"\n';
const personal = 'hide_agent_reasoning = true\n';

function fixture(name) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'guard-lifecycle-' + name + '-'));
  fs.mkdirSync(path.join(home, '.codex'));
  fs.writeFileSync(path.join(home, '.codex/config.toml'), personal);
  for (const host of ['claude', 'codex']) fs.copyFileSync(path.join(__dirname, 'host.cjs'), path.join(home, host + '.cjs'));
  const source = path.join(home, 'source');
  fs.cpSync(path.resolve(__dirname, '../../../hooks/command-guard'), path.join(source, 'hooks/command-guard'), { recursive: true });
  // The human already reviewed the plugin hook in /hooks.
  fs.writeFileSync(path.join(home, '.codex/human-trusted'), 'human fixture decision');
  const env = { ...process.env, COMMAND_GUARD_CLAUDE: path.join(home, 'claude.cjs'), COMMAND_GUARD_CODEX: path.join(home, 'codex.cjs') };
  const f = {
    home, source,
    config: path.join(home, '.codex/config.toml'),
    journal: path.join(home, '.skill-collection/plugins.json'),
    cache: path.join(home, '.skill-collection/plugin-cache'),
    run(command, extraEnv = {}) {
      const args = command === 'install' ? ['prepare-plugin', '--home', home, '--source', source] : [command, '--home', home];
      const r = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', env: { ...env, ...extraEnv } });
      return { status: r.status, output: r.stdout + r.stderr };
    },
    ok(command) { const r = f.run(command); assert.equal(r.status, 0, command + '\n' + r.output); return r; },
    snapshot() { return JSON.parse(fs.readFileSync(f.journal)).hosts[0].snapshot; },
  };
  return f;
}
function cases(...list) {
  let failures = 0;
  for (const [name, test] of list) {
    const f = fixture(name.replace(/\W+/g, '-').slice(0, 24));
    try { test(f); console.log('ok ' + name); }
    catch (e) { console.log('FAIL ' + name + ': ' + e.message); failures++; }
    finally { fs.rmSync(f.home, { recursive: true, force: true }); }
  }
  return failures;
}

const failures = cases(
  ['directory removal errors leave a journal that supports retry', f => {
    f.ok('install');
    const preload = path.join(f.home, 'busy-directory.cjs');
    fs.writeFileSync(preload, `const fs = require('fs'); const remove = fs.rmdirSync;
fs.rmdirSync = function(dir, ...args) {
  if (String(dir).includes('plugin-cache')) throw Object.assign(new Error('fixture directory busy'), { code: 'EBUSY' });
  return remove.call(this, dir, ...args);
};\n`);
    const result = f.run('uninstall', { NODE_OPTIONS: '--require ' + JSON.stringify(preload) });
    assert.equal(result.status, 1, result.output);
    assert.match(result.output, /fixture directory busy/);
    const record = JSON.parse(fs.readFileSync(f.journal));
    assert.deepEqual(record.writes, [], 'deleted files must no longer be recorded');
    assert.ok(record.directories.length, 'failed directory removal remains recorded');
    f.ok('uninstall');
    assert.equal(fs.existsSync(f.cache), false);
  }],
  ['native trust and Codex preferences survive repeated reinstall and uninstall', f => {
    for (let cycle = 0; cycle < 3; cycle++) {
      f.ok('install');
      // Codex writes trust and its runtime preferences after registration (first cycle only).
      if (cycle === 0) fs.appendFileSync(f.config, trust + preferences);
      const installed = fs.readFileSync(f.config, 'utf8');
      assert.ok(installed.includes(trust.trim()) && installed.includes(preferences.trim()), installed);
      const again = f.ok('install');
      assert.doesNotMatch(again.output, /CONFLICT/);
      assert.equal(fs.readFileSync(f.config, 'utf8'), installed);
      f.ok('doctor');
      f.ok('uninstall');
      const kept = fs.readFileSync(f.config, 'utf8');
      assert.ok(kept.startsWith(personal), kept);
      assert.ok(kept.includes(trust.trim()), kept);
      assert.ok(kept.includes(preferences.trim()), kept);
      assert.doesNotMatch(kept, /\[plugins\.|\[marketplaces\./);
      assert.equal(fs.existsSync(f.cache), false, 'installer-created snapshot tree removed');
    }
  }],
  ['an unknown Codex preference beside trust stays a whole-file conflict', f => {
    f.ok('install');
    fs.appendFileSync(f.config, trust + preferences.replace('sandbox = "unelevated"', 'sandbox = "unelevated"\nallow_mxc = true'));
    const config = fs.readFileSync(f.config), journal = fs.readFileSync(f.journal);
    for (const command of ['install', 'uninstall']) {
      const r = f.run(command);
      assert.equal(r.status, 1, r.output);
      assert.match(r.output, /CONFLICT changed registration preserved/);
      assert.deepEqual(fs.readFileSync(f.config), config);
      assert.deepEqual(fs.readFileSync(f.journal), journal);
    }
  }],
  ['same-snapshot reinstall after uninstall, then doctor and uninstall', f => {
    f.ok('install');
    const snapshot = f.snapshot();
    f.ok('uninstall');
    assert.equal(fs.existsSync(snapshot), false);
    f.ok('install');
    assert.equal(f.snapshot(), snapshot);
    f.ok('doctor');
    f.ok('uninstall');
    assert.equal(fs.existsSync(f.cache), false);
  }],
  ['user entries in the snapshot tree are preserved, never deleted', f => {
    f.ok('install');
    const snapshot = f.snapshot();
    fs.mkdirSync(path.join(snapshot, 'rules/personal-empty'));
    fs.writeFileSync(path.join(snapshot, 'adapters/personal.txt'), 'personal');
    const r = f.run('uninstall');
    assert.equal(r.status, 1, r.output);
    assert.match(r.output, /CONFLICT non-empty directory preserved: .*rules/);
    assert.equal(fs.readFileSync(path.join(snapshot, 'adapters/personal.txt'), 'utf8'), 'personal');
    assert.ok(fs.statSync(path.join(snapshot, 'rules/personal-empty')).isDirectory());
    assert.deepEqual(fs.readdirSync(path.join(snapshot, 'adapters')), ['personal.txt']);
    // Reinstall refuses the user's entries rather than adopting them.
    assert.match(f.run('install').output, /CONFLICT unrecorded plugin snapshot entry/);
    assert.equal(fs.readFileSync(path.join(snapshot, 'adapters/personal.txt'), 'utf8'), 'personal');
    // A recorded directory replaced by a symlink is preserved with its target.
    fs.rmSync(path.join(snapshot, 'rules/personal-empty'), { recursive: true });
    fs.unlinkSync(path.join(snapshot, 'adapters/personal.txt'));
    if (process.platform !== 'win32') {
      const outside = path.join(f.home, 'outside');
      fs.mkdirSync(outside);
      fs.writeFileSync(path.join(outside, 'kept.txt'), 'kept');
      fs.rmdirSync(path.join(snapshot, 'adapters'));
      fs.symlinkSync(outside, path.join(snapshot, 'adapters'));
      const replaced = f.run('uninstall');
      assert.equal(replaced.status, 1, replaced.output);
      assert.match(replaced.output, /CONFLICT replaced directory preserved: .*adapters/);
      assert.ok(fs.lstatSync(path.join(snapshot, 'adapters')).isSymbolicLink());
      assert.equal(fs.readFileSync(path.join(outside, 'kept.txt'), 'utf8'), 'kept');
      fs.unlinkSync(path.join(snapshot, 'adapters'));
    }
    // Once emptied, the recorded tree is the installer's again: same-snapshot reinstall works.
    f.ok('install');
    f.ok('doctor');
    f.ok('uninstall');
    assert.equal(fs.existsSync(snapshot), false);
  }],
  ['a legacy journal derives directory provenance from its recorded snapshot files', f => {
    f.ok('install');
    const snapshot = f.snapshot();
    const legacy = JSON.parse(fs.readFileSync(f.journal));
    delete legacy.directories;
    fs.writeFileSync(f.journal, JSON.stringify(legacy, null, 2) + '\n');
    f.ok('uninstall');
    assert.equal(fs.existsSync(snapshot), false);
    f.ok('install');
    f.ok('doctor');
    f.ok('uninstall');
  }],
  ['ancestor directory links preserve matching external files and the journal', f => {
    f.ok('install');
    const snapshot = f.snapshot();
    for (const original of [path.join(snapshot, 'adapters'), path.join(f.home, '.claude/plugins')]) {
      const outside = path.join(f.home, 'external-' + path.basename(original));
      fs.renameSync(original, outside);
      fs.symlinkSync(outside, original, process.platform === 'win32' ? 'junction' : 'dir');
      const bytes = new Map();
      function capture(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const p = path.join(dir, entry.name);
          if (entry.isDirectory()) capture(p); else bytes.set(p, fs.readFileSync(p));
        }
      }
      capture(outside);
      const journal = fs.readFileSync(f.journal);
      for (const command of ['install', 'uninstall']) {
        const result = f.run(command);
        assert.equal(result.status, 1, result.output);
        assert.match(result.output, /CONFLICT/);
        assert.ok(fs.lstatSync(original).isSymbolicLink());
        assert.deepEqual(fs.readFileSync(f.journal), journal);
        for (const [p, content] of bytes) assert.deepEqual(fs.readFileSync(p), content);
      }
      fs.unlinkSync(original);
      fs.renameSync(outside, original);
    }
    f.ok('uninstall');
  }],
  ['a dangling ownership-record link never creates its external target', f => {
    if (process.platform === 'win32') return;
    fs.mkdirSync(path.dirname(f.journal), { recursive: true });
    const outside = path.join(f.home, 'external-record');
    fs.symlinkSync(outside, f.journal);
    const result = f.run('install');
    assert.equal(result.status, 1, result.output);
    assert.match(result.output, /CONFLICT plugin ownership record/);
    assert.ok(fs.lstatSync(f.journal).isSymbolicLink());
    assert.equal(fs.existsSync(outside), false);
  }],
  ['an unrecorded empty snapshot tree is never adopted', f => {
    f.ok('install');
    const snapshot = f.snapshot();
    f.ok('uninstall');
    // The tree an earlier uninstall left behind, with no record of who made it.
    for (const dir of ['.claude-plugin', 'adapters', 'rules']) fs.mkdirSync(path.join(snapshot, dir), { recursive: true });
    const r = f.run('install');
    assert.equal(r.status, 1, r.output);
    assert.match(r.output, /CONFLICT unrecorded plugin snapshot/);
    assert.deepEqual(fs.readdirSync(snapshot).sort(), ['.claude-plugin', 'adapters', 'rules']);
    f.run('uninstall');
    assert.deepEqual(fs.readdirSync(snapshot).sort(), ['.claude-plugin', 'adapters', 'rules']);
  }],
);
console.log('guard lifecycle CLI regressions: ' + failures + ' failures');
process.exitCode = failures ? 1 : 0;
