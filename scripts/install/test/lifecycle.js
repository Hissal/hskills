'use strict';
// Repeated trusted lifecycles through the CLI: disposable HOME, CLI host doubles,
// real journal and filesystem. Shapes follow docs/evidence/windows-guard-followup.md.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');
const { tempDir, testRunDir } = require('../../test-util');
const { stage } = require('./pool');
const hostDoubles = require('./doubles');
const { guardCheckout } = hostDoubles;
const cli = path.resolve(__dirname, '../install.js');
const hash = c => '"sha256:' + c.repeat(64) + '"';
// Native writer output after human /hooks review: bare parent, basic plugin key, literal user key.
const trust = '\n[hooks.state]\n\n[hooks.state."command-guard@hskills:hooks/codex.json:pre_tool_use:0:0"]\n'
  + 'trusted_hash = ' + hash('a') + '\ntrusted_content_hash = ' + hash('b') + '\nenabled = true\n'
  + "\n[hooks.state.'C:\\Users\\human\\AppData\\Local\\Temp\\fixture\\home\\.codex\\hooks.json:pre_tool_use:0:0']\n"
  + 'trusted_hash = ' + hash('c') + '\nenabled = true\n';
// The 77-byte chunk Codex 0.166.0 wrote beside the trust tables.
const preferences = '\n[tui]\nscreen_reader_detection_done = true\n\n[windows]\nsandbox = "unelevated"\n';
const personal = 'hide_agent_reasoning = true\n';

function fixture(name) {
  const home = tempDir('guard-lifecycle-' + name + '-');
  fs.mkdirSync(path.join(home, '.codex'));
  fs.writeFileSync(path.join(home, '.codex/config.toml'), personal);
  const doubles = hostDoubles(home);
  const source = guardCheckout(path.join(home, 'source'));
  // The human already reviewed the plugin hook in /hooks.
  fs.writeFileSync(path.join(home, '.codex/human-trusted'), 'human fixture decision');
  let runs = 0;
  const env = { ...process.env, COMMAND_GUARD_CLAUDE: doubles.claude, COMMAND_GUARD_CODEX: doubles.codex };
  const f = {
    home, source,
    config: path.join(home, '.codex/config.toml'),
    journal: path.join(home, '.hskills/plugins.json'),
    run(command, extraEnv = {}, checkout = source) {
      stage('run ' + ++runs + ': ' + command);
      const args = command === 'install' ? ['register-guard', '--home', home, '--source', checkout] : [command, '--home', home];
      const r = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', env: { ...env, ...extraEnv } });
      return { status: r.status, output: r.stdout + r.stderr };
    },
    ok(command, checkout) { const r = f.run(command, {}, checkout); assert.equal(r.status, 0, command + '\n' + r.output); return r; },
  };
  return f;
}
const cases = [
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
      assert.deepEqual(JSON.parse(fs.readFileSync(f.journal)).writes, [], 'every recorded write removed');
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
  ['reinstall after uninstall, then doctor and uninstall', f => {
    f.ok('install');
    f.ok('uninstall');
    f.ok('install');
    f.ok('doctor');
    f.ok('uninstall');
    assert.deepEqual(JSON.parse(fs.readFileSync(f.journal)).writes, []);
  }],
  ['another checkout is a conflict until uninstall, then registers in its place', f => {
    f.ok('install');
    const other = guardCheckout(path.join(f.home, 'other'));
    const owned = () => { const { hosts, writes } = JSON.parse(fs.readFileSync(f.journal)); return { hosts, writes }; };
    const before = owned();
    const r = f.run('install', {}, other);
    assert.equal(r.status, 1, r.output);
    assert.match(r.output, /CONFLICT claude marketplace hskills is registered from .*source/);
    assert.deepEqual(owned(), before);
    f.ok('uninstall');
    f.ok('install', other);
    assert.ok(JSON.parse(fs.readFileSync(f.journal)).hosts.every(h => h.source === path.join(other, 'hooks/command-guard')));
    f.ok('doctor');
    f.ok('uninstall');
  }],
  ['ancestor directory links preserve matching external files and the journal', f => {
    f.ok('install');
    for (const original of [path.join(f.home, '.claude/plugins'), path.join(f.home, '.codex/plugins')]) {
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
];
// Cases run by name, so a repeated name would run one case twice and skip the other.
assert.equal(new Set(cases.map(([n]) => n)).size, cases.length, 'case names must be unique');
// One case in this process, against its own temporary home.
function runCase(name) {
  const [, test] = cases.find(([n]) => n === name);
  stage('fixture');
  const f = fixture(name.replace(/\W+/g, '-').slice(0, 24));
  try { test(f); console.log('ok ' + name); return 0; }
  catch (e) { console.log('FAIL ' + name + ': ' + e.message); return 1; }
  finally { fs.rmSync(f.home, { recursive: true, force: true }); }
}
// Each case runs in its own process so independent cases run in parallel.
const units = timeout => cases.map(([name]) => ({ name, timeout, args: [__filename, '--case', name] }));
const summary = failures => 'guard lifecycle CLI regressions: ' + failures + ' failures';
module.exports = { units, summary };

if (require.main === module) {
  const at = process.argv.indexOf('--case');
  if (at !== -1) process.exitCode = runCase(process.argv[at + 1]);
  else {
    // Made before the cases start, so each case process puts its home in this
    // run's folder, which goes with this process even when a case is killed.
    testRunDir();
    const all = units();
    const { runAll, report, jobCount } = require('./pool');
    let jobs;
    try { jobs = jobCount(); } catch (e) { console.log('FAIL ' + e.message); process.exit(1); }
    runAll(all, jobs).then(results => {
      let failures = 0;
      results.forEach((result, i) => {
        process.stdout.write(result.stdout + report(all[i], result)); process.stderr.write(result.stderr);
        if (result.status !== 0 || result.timedOut) failures++;
      });
      console.log(summary(failures));
      process.exitCode = failures ? 1 : 0;
    });
  }
}
