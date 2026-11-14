'use strict';
// Runs node child processes in parallel, at most `jobs` at once, in the given order.
// Nearly all harness time is node process startup, so independent units run side by side.
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

const JOBS_ENV = 'HSKILLS_INSTALL_CASES_JOBS';
// Half the cores by default, so several check runs sharing a machine leave
// each other room; HSKILLS_INSTALL_CASES_JOBS (a positive whole number) sets it.
function jobCount(env = process.env, cores = typeof os.availableParallelism === 'function' ? os.availableParallelism() : os.cpus().length) {
  const raw = env[JOBS_ENV];
  if (raw === undefined || raw === '') return Math.max(1, Math.ceil(cores / 2));
  const n = Number(raw);
  if (!/^\d+$/.test(raw.trim()) || !Number.isSafeInteger(n) || n < 1) throw new Error(JOBS_ENV + ' must be a positive whole number, not ' + JSON.stringify(raw));
  return n;
}

// A unit marks the start of each of its stages with stage(name), so a unit
// that fails or times out reports how far it got. The mark is written
// synchronously, so it survives the kill.
const MARK = 'STAGE ';
const stage = name => fs.writeSync(1, MARK + name + '\n');

// unit: { args, timeout? }. Resolves to one result per unit, in unit order:
// { status, stdout, stderr, timedOut, error, ms, stages }, where stdout holds no
// stage marks and stages is [{ name, ms }], each stage's time until the next
// one started or the unit ended.
function runAll(units, jobs = jobCount()) {
  const results = new Array(units.length);
  let next = 0;
  function start() {
    if (next >= units.length) return Promise.resolve();
    const index = next++;
    const unit = units[index];
    return new Promise(resolve => {
      const result = { status: null, stdout: '', stderr: '', timedOut: false, error: null, ms: 0, stages: [] };
      const began = Date.now();
      const marks = [];
      let pending = '';
      const child = spawn(process.execPath, unit.args);
      child.stdout.setEncoding('utf8').on('data', d => {
        // Marks are timed as they arrive; a partial last line waits for its end.
        const lines = (pending + d).split('\n');
        pending = lines.pop();
        for (const l of lines) {
          if (l.startsWith(MARK)) marks.push({ name: l.slice(MARK.length), at: Date.now() - began });
          else result.stdout += l + '\n';
        }
      });
      child.stderr.setEncoding('utf8').on('data', d => { result.stderr += d; });
      const timer = unit.timeout && setTimeout(() => { result.timedOut = true; child.kill(); }, unit.timeout);
      const settle = status => {
        clearTimeout(timer);
        result.stdout += pending;
        result.status = status;
        result.ms = Date.now() - began;
        result.stages = marks.map((m, i) => ({ name: m.name, ms: (i + 1 < marks.length ? marks[i + 1].at : result.ms) - m.at }));
        results[index] = result;
        resolve();
      };
      // A process that never starts reports only 'error'; one that ran reports 'close'.
      child.on('error', e => { result.error = e; if (child.pid === undefined) settle(null); });
      child.on('close', settle);
    }).then(start);
  }
  return Promise.all(Array.from({ length: Math.min(jobs, units.length) }, start)).then(() => results);
}

const seconds = ms => (ms / 1000).toFixed(1) + 's';
// A case process that failed without printing its own FAIL line still reports one.
// It starts on a fresh line even when a killed process left a partial one. A
// failed unit lists the stages it reached, each with its time; the last
// listed is where a timed-out unit was killed.
function report(unit, result, label = unit.name) {
  const failed = result.timedOut || result.status !== 0;
  const stages = failed && result.stages.length ? '; ran ' + seconds(result.ms) + ', stages: ' + result.stages.map(s => s.name + ' ' + seconds(s.ms)).join(', ') : '';
  const line = text => (result.stdout && !result.stdout.endsWith('\n') ? '\n' : '') + 'FAIL ' + label + ': ' + text + stages + '\n';
  if (result.timedOut) return line('timed out after ' + unit.timeout / 1000 + 's');
  if (result.status !== 0 && !/^FAIL /m.test(result.stdout)) return line('exited ' + result.status + (result.error ? ' (' + result.error.message + ')' : ''));
  if (stages) return line('failed');
  return '';
}
module.exports = { runAll, report, stage, jobCount, JOBS_ENV };
