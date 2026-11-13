'use strict';
// The test temp helper (scripts/test-util.js tempDir) as a runner uses it:
// a child node process takes its folders from tempDir, and its temp dir must
// hold nothing of them once the child has gone, however it ended (#329).
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { tempDir } = require('../../test-util');
const UTIL = path.resolve(__dirname, '../../test-util.js');
const RUN_ENV = 'HSKILLS_TEST_TMP';

const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
// Runs `body` in a fresh runner whose os.tmpdir() is `tmp`. The runner
// prints each folder tempDir gives it, then runs `after` (e.g. a block that
// outlives the timeout).
function runner(tmp, body, options = {}) {
  const env = { ...process.env, TMPDIR: tmp, TEMP: tmp, TMP: tmp, ...options.env };
  if (!options.env || !(RUN_ENV in options.env)) delete env[RUN_ENV];
  const script = 'const { tempDir } = require(' + JSON.stringify(UTIL) + ');\n' + body;
  return spawnSync(process.execPath, ['-e', script], { encoding: 'utf8', env, timeout: options.timeout, killSignal: options.killSignal });
}
// Runs a runner that blocks after printing, killed at a timeout. A runner
// that starts slowly on a loaded machine is killed before it prints, so an
// empty stdout earns a fresh temp dir and a longer timeout, up to the last.
// Only the attempt that printed is checked for leftovers: one killed before it
// printed may have died between making its run folder and starting the
// watcher, a window test-util leaves to its day-old sweep.
const KILL_AFTER = [1500, 6000, 20000];
function killedRunner(tmp, body, options = {}) {
  let r;
  for (const [i, timeout] of KILL_AFTER.entries()) {
    const dir = i ? fs.mkdtempSync(tmp + '-retry-') : tmp;
    r = runner(dir, body, { ...options, timeout });
    r.tmp = dir;
    if (r.stdout.trim()) break;
  }
  return r;
}
// The runner's temp dir may take a moment to empty after a kill.
function leftovers(tmp) {
  for (let waited = 0; waited < 10000; waited += 100) {
    if (!fs.readdirSync(tmp).length) return [];
    pause(100);
  }
  return fs.readdirSync(tmp);
}
const block = 'Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 30000);';
const made = "const dir = tempDir('guard-lifecycle-x-'); require('fs').writeFileSync(dir + '/file', 'x'); console.log(dir);";

const scratch = tempDir('temp-cases-');
const cases = [
  ['a normal exit leaves no folder', (tmp) => {
    const r = runner(tmp, made);
    assert.equal(r.status, 0, r.stderr);
    assert.ok(r.stdout.trim().startsWith(tmp), r.stdout);
    assert.deepEqual(leftovers(tmp), []);
  }],
  ['a runner killed at its timeout leaves no folder', (tmp) => {
    const r = killedRunner(tmp, made + block);
    assert.equal(r.signal, 'SIGTERM');
    assert.ok(r.stdout.trim().startsWith(r.tmp), r.stdout);
    assert.deepEqual(leftovers(r.tmp), []);
  }],
  ['a runner killed outright leaves no folder', (tmp) => {
    const r = killedRunner(tmp, made + block, { killSignal: 'SIGKILL' });
    assert.equal(r.signal, 'SIGKILL');
    assert.ok(r.stdout.trim().startsWith(r.tmp), r.stdout);
    assert.deepEqual(leftovers(r.tmp), []);
  }],
  ['a folder the code under test makes in the temp dir goes with the run', (tmp) => {
    const probe = "tempDir('x-'); console.log(require('fs').mkdtempSync(require('path').join(require('os').tmpdir(), 'guard-probe-')));";
    const r = killedRunner(tmp, probe + block);
    assert.equal(r.signal, 'SIGTERM');
    assert.ok(r.stdout.trim().startsWith(r.tmp), r.stdout);
    assert.deepEqual(leftovers(r.tmp), []);
  }],
  ['a nested runner puts its folders in its parent run folder and leaves it there', (tmp) => {
    const run = path.join(tmp, 'parent-run');
    fs.mkdirSync(run);
    const r = runner(tmp, made, { env: { [RUN_ENV]: run } });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(path.dirname(r.stdout.trim()), run, r.stdout);
    pause(1000);
    assert.deepEqual(fs.readdirSync(tmp), ['parent-run']);
  }],
  ['a new run removes run folders over a day old and keeps recent ones', (tmp) => {
    const old = path.join(tmp, 'hskills-test-old');
    const recent = path.join(tmp, 'hskills-test-recent');
    fs.mkdirSync(old);
    fs.mkdirSync(recent);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    fs.utimesSync(old, twoDaysAgo, twoDaysAgo);
    const r = runner(tmp, made);
    assert.equal(r.status, 0, r.stderr);
    assert.deepEqual(fs.readdirSync(tmp), ['hskills-test-recent']);
  }],
];
let failures = 0;
cases.forEach(([name, test], i) => {
  const tmp = path.join(scratch, String(i));
  fs.mkdirSync(tmp);
  try { test(tmp); }
  catch (e) { failures++; console.log('FAIL temp helper: ' + name + ': ' + e.message); }
});
fs.rmSync(scratch, { recursive: true, force: true });
if (failures) throw new Error(failures + ' temp helper case(s) failed');
console.log('ok: temp helper cases');
