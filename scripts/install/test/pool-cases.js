'use strict';
// Install harness pool cases: node scripts/install/test/pool-cases.js
// The job cap, its HSKILLS_INSTALL_CASES_JOBS override, and the stages a
// failed or timed-out unit reports (#387). node scripts/check/test/run.js
// runs this file too; a failed case makes that run fail.
const assert = require('assert/strict');
const path = require('path');
const { spawnSync } = require('child_process');
const { jobCount, JOBS_ENV } = require('./pool');

const POOL = path.join(__dirname, 'pool.js');
// Runs one unit through the pool in a child and returns its result and
// report line. A unit that marks its stages and then blocks is given longer
// timeouts until its marks arrive, since a loaded machine can start it slowly.
function pooled(body, timeouts = [null]) {
  const driver = `const { runAll, report, stage } = require(${JSON.stringify(POOL)});
(async () => {
  const timeouts = ${JSON.stringify(timeouts)};
  for (const [i, timeout] of timeouts.entries()) {
    const unit = { name: 'probe unit', timeout, args: ['-e', ${JSON.stringify('const { stage } = require(' + JSON.stringify(POOL) + ');\n' + body)}] };
    const [result] = await runAll([unit], 1);
    if (result.stages.length < 2 && i + 1 < timeouts.length) continue;
    console.log(JSON.stringify({ result, line: report(unit, result) }));
    return;
  }
})();`;
  const r = spawnSync(process.execPath, ['-e', driver], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  return JSON.parse(r.stdout);
}

const cases = [
  ['the pool takes half the cores by default, and at least one', () => {
    assert.equal(jobCount({}, 4), 2);
    assert.equal(jobCount({}, 3), 2);
    assert.equal(jobCount({}, 1), 1);
    assert.equal(jobCount({ [JOBS_ENV]: '' }, 8), 4);
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
    assert.match(line, /^FAIL probe unit: timed out after \d+(\.\d+)?s; ran \d+\.\ds, stages: setup \d+\.\ds, stuck \d+\.\ds\n$/);
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
