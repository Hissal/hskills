'use strict';
// Install harness pool cases: node scripts/install/test/pool-cases.js
// The job count, its HSKILLS_INSTALL_CASES_JOBS override, a unit's limit
// restarting at each stage, and the stages a failed or timed-out unit
// reports (#387). node scripts/check/test/run.js
// runs this file too; a failed case makes that run fail.
const assert = require('assert/strict');
const path = require('path');
const { spawnSync } = require('child_process');
const { jobCount, report, JOBS_ENV } = require('./pool');

const POOL = path.join(__dirname, 'pool.js');
// Runs one unit through the pool in a child and returns its result, report
// line and timeout. The unit reads its timeout from process.argv[1]. A loaded
// machine can start a unit slowly, so while `again` (an expression over
// `result`) holds, the unit is run once more with the next, longer timeout.
function pooled(body, timeouts = [null], again = 'result.stages.length < 2') {
  const driver = `const { runAll, report, stage } = require(${JSON.stringify(POOL)});
(async () => {
  const timeouts = ${JSON.stringify(timeouts)};
  for (const [i, timeout] of timeouts.entries()) {
    const unit = { name: 'probe unit', timeout, args: ['-e', ${JSON.stringify('const { stage } = require(' + JSON.stringify(POOL) + ');\n' + body)}, String(timeout)] };
    const [result] = await runAll([unit], 1);
    if (${again} && i + 1 < timeouts.length) continue;
    console.log(JSON.stringify({ result, line: report(unit, result), timeout }));
    return;
  }
})();`;
  const r = spawnSync(process.execPath, ['-e', driver], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  return JSON.parse(r.stdout);
}

const cases = [
  ['the pool takes every core by default, and at least one', () => {
    assert.equal(jobCount({}, 4), 4);
    assert.equal(jobCount({}, 1), 1);
    assert.equal(jobCount({}, 0), 1);
    assert.equal(jobCount({ [JOBS_ENV]: '' }, 8), 8);
  }],
  [JOBS_ENV + ' sets the job count', () => {
    assert.equal(jobCount({ [JOBS_ENV]: '1' }, 8), 1);
    assert.equal(jobCount({ [JOBS_ENV]: '16' }, 2), 16);
  }],
  [JOBS_ENV + ' refuses a value that is not a positive whole number', () => {
    for (const bad of ['0', '-2', '1.5', 'two', ' ', '1e3', '0x4']) {
      assert.throws(() => jobCount({ [JOBS_ENV]: bad }, 4), new RegExp(JOBS_ENV + ' must be a positive whole number'), bad);
    }
  }],
  ['a harness given an invalid job count fails with a FAIL line and runs nothing', () => {
    const r = spawnSync(process.execPath, [path.join(__dirname, 'lifecycle.js')], { encoding: 'utf8', env: { ...process.env, [JOBS_ENV]: 'many' } });
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, new RegExp('^FAIL ' + JOBS_ENV + ' must be a positive whole number, not "many"$', 'm'));
    assert.doesNotMatch(r.stdout, /regressions:/);
  }],
  ['a passing unit reports nothing and its stage marks stay out of its output', () => {
    const { result, line } = pooled("stage('one'); console.log('said'); stage('two');");
    assert.equal(line, '');
    assert.equal(result.stdout, 'said\n');
    assert.deepEqual(result.stages.map(s => s.name), ['one', 'two']);
  }],
  ['a failing unit lists the stages it reached with their times', () => {
    const { line } = pooled("stage('setup'); stage('assert'); process.exit(3);");
    assert.match(line, /^FAIL probe unit: exited 3; ran \d+\.\ds, stages: setup \d+\.\ds, assert \d+\.\ds\n$/);
  }],
  ['a timed-out unit lists its stages, the last running until the kill', () => {
    const { result, line } = pooled("stage('setup'); stage('stuck'); setTimeout(() => {}, 60000);", [1500, 6000, 20000]);
    assert.equal(result.timedOut, true);
    assert.match(line, /^FAIL probe unit: timed out after \d+(\.\d+)?s in one stage; ran \d+\.\ds, stages: setup \d+\.\ds, stuck \d+\.\ds\n$/);
  }],
  ['a unit that keeps starting stages runs past its limit', () => {
    // Six stages a third of the limit apart: twice the limit in all.
    const body = "let n = 0; const t = setInterval(() => { stage('step ' + ++n); if (n === 6) clearInterval(t); }, process.argv[1] / 3);";
    const { result, line, timeout } = pooled(body, [900, 6000, 20000], 'result.timedOut');
    assert.equal(result.timedOut, false, line);
    assert.equal(result.status, 0);
    assert.equal(result.stages.length, 6);
    assert.ok(result.ms > timeout, result.ms + 'ms against a limit of ' + timeout + 'ms');
  }],
  ['a timed-out unit that marked no stage reports its limit alone', () => {
    const result = { status: null, stdout: '', stderr: '', timedOut: true, error: null, ms: 2000, stages: [] };
    assert.equal(report({ name: 'probe unit', timeout: 2000 }, result), 'FAIL probe unit: timed out after 2s\n');
  }],
];

let failures = 0;
for (const [name, test] of cases) {
  try { test(); }
  catch (e) { failures++; console.log('FAIL install pool: ' + name + ': ' + e.message); }
}
console.log('install pool: ' + (cases.length - failures) + ' passed, ' + failures + ' failed');
if (failures) {
  if (require.main === module) process.exit(1);
  throw new Error(failures + ' install pool case(s) failed; run node scripts/install/test/pool-cases.js');
}
