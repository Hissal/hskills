'use strict';
// Runs node child processes in parallel, at most `jobs` at once, in the given order.
// Nearly all harness time is node process startup, so independent units run side by side.
const os = require('os');
const { spawn } = require('child_process');

const jobs = typeof os.availableParallelism === 'function' ? os.availableParallelism() : os.cpus().length;

// unit: { args, timeout? }. Resolves to one result per unit, in unit order:
// { status, stdout, stderr, timedOut, error }.
function runAll(units, limit = jobs) {
  const results = new Array(units.length);
  let next = 0;
  function start() {
    if (next >= units.length) return Promise.resolve();
    const index = next++;
    const unit = units[index];
    return new Promise(resolve => {
      const result = { status: null, stdout: '', stderr: '', timedOut: false, error: null };
      const child = spawn(process.execPath, unit.args);
      child.stdout.setEncoding('utf8').on('data', d => { result.stdout += d; });
      child.stderr.setEncoding('utf8').on('data', d => { result.stderr += d; });
      const timer = unit.timeout && setTimeout(() => { result.timedOut = true; child.kill(); }, unit.timeout);
      const settle = status => { clearTimeout(timer); result.status = status; results[index] = result; resolve(); };
      // A process that never starts reports only 'error'; one that ran reports 'close'.
      child.on('error', e => { result.error = e; if (child.pid === undefined) settle(null); });
      child.on('close', settle);
    }).then(start);
  }
  return Promise.all(Array.from({ length: Math.min(limit, units.length) }, start)).then(() => results);
}

// A case process that failed without printing its own FAIL line still reports one.
function report(unit, result, label = unit.name) {
  if (result.timedOut) return 'FAIL ' + label + ': timed out after ' + unit.timeout / 1000 + 's\n';
  if (result.status !== 0 && !/^FAIL /m.test(result.stdout)) return 'FAIL ' + label + ': exited ' + result.status + (result.error ? ' (' + result.error.message + ')' : '') + '\n';
  return '';
}
module.exports = { runAll, report };
