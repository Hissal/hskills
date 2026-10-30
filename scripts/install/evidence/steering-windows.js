'use strict';
// Manual Windows owner-steering evidence (#119). Real installer, disposable homes
// and a fixture source; never touches the real home. The copy arm injects EPERM
// for file symlinks (fixture-injected, not an actual OS refusal).
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const cli = path.resolve(__dirname, '../install.js');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'steering-win-'));
const source = path.join(root, 'source');
fs.mkdirSync(source);
fs.writeFileSync(path.join(source, 'collection.json'), JSON.stringify({ core: [], packs: {}, expensive: [] }));
fs.writeFileSync(path.join(source, 'steering.md'), 'fixture steering\n');
const preload = path.join(root, 'deny-file-links.cjs');
fs.writeFileSync(preload, `const fs = require('fs');
const original = fs.symlinkSync;
fs.symlinkSync = function(target, dest, type) {
  if (type === 'file') throw Object.assign(new Error('fixture-injected permission denied'), { code: 'EPERM' });
  return original.apply(this, arguments);
};
`);
const results = [];
function run(arm, home, args, nodeArgs = []) {
  const r = spawnSync(process.execPath, [...nodeArgs, cli, ...args, '--home', home, '--source', source], { encoding: 'utf8' });
  const steering = (r.stdout + r.stderr).split(/\r?\n/).filter(l => /steering|CLAUDE\.md|AGENTS\.md|CONFLICT|drift/i.test(l));
  results.push({ arm, args, status: r.status, steering });
  fs.appendFileSync(path.join(root, `${arm}.log`), `$ install.js ${args.join(' ')}${nodeArgs.length ? ' (preload deny-file-links)' : ''}\nexit ${r.status}\n${r.stdout}${r.stderr}\n`);
  return r;
}
const record = home => JSON.parse(fs.readFileSync(path.join(home, '.skill-collection/install.json'), 'utf8'));
// Targets come from the record, so added steering targets are covered unchanged.
const dests = home => record(home).steering.map(e => e.path);
const claudeTarget = home => path.join(home, '.claude/CLAUDE.md');
const linkType = p => spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', '(Get-Item -LiteralPath $env:STEER).LinkType'], { encoding: 'utf8', env: { ...process.env, STEER: p } }).stdout.trim() || 'File';

// 1. Actual file symlinks (Developer Mode permits them), then a rerun without the flag.
const linkHome = path.join(root, 'link-home');
run('link', linkHome, ['install', '--owner-steering']);
const linked = record(linkHome);
assert.ok(linked.steering.length >= 2 && linked.steering.every(e => e.type === 'symlink'));
for (const p of dests(linkHome)) {
  assert.equal(linkType(p), 'SymbolicLink');
  assert.equal(fs.realpathSync(p), fs.realpathSync(path.join(source, 'steering.md')));
}
run('link', linkHome, ['install']);
assert.equal(record(linkHome).ownerSteering, true);
assert.deepEqual(record(linkHome).steering, linked.steering);
run('link', linkHome, ['doctor']);

// 2. An unrecorded file is a conflict and survives.
const conflictHome = path.join(root, 'conflict-home');
fs.mkdirSync(path.join(conflictHome, '.claude'), { recursive: true });
fs.writeFileSync(claudeTarget(conflictHome), 'mine\n');
const conflict = run('conflict', conflictHome, ['install', '--owner-steering']);
assert.notEqual(conflict.status, 0);
assert.match(conflict.stdout, /CONFLICT unrecorded steering target/);
assert.equal(fs.readFileSync(claudeTarget(conflictHome), 'utf8'), 'mine\n');

// 3. Fixture-injected file-link refusal: exclusive copies, then drift on a copy edit.
const copyHome = path.join(root, 'copy-home');
run('copy', copyHome, ['install', '--owner-steering'], ['--require', preload]);
assert.ok(record(copyHome).steering.length >= 2 && record(copyHome).steering.every(e => e.type === 'copy'));
for (const p of dests(copyHome)) {
  assert.equal(linkType(p), 'File');
  assert.equal(fs.readFileSync(p, 'utf8'), 'fixture steering\n');
}
run('copy', copyHome, ['doctor']);
const edited = dests(copyHome)[1];
fs.writeFileSync(edited, 'local edit\n');
const drift = run('copy', copyHome, ['doctor']);
assert.notEqual(drift.status, 0);
assert.match(drift.stdout, /copy drift/);
run('copy', copyHome, ['install'], ['--require', preload]);
assert.equal(fs.readFileSync(edited, 'utf8'), 'local edit\n');

fs.writeFileSync(path.join(root, 'results.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
console.log(`ROOT: ${root}`);
