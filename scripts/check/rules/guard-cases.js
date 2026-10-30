'use strict';
// The command guard's block and allow cases run in the same gate as the skill
// rules (#91). The harness belongs to the guard (spec 8) and runs unchanged:
// each of its FAIL lines is a failure here, and so is any non-zero exit.
// A passing run prints only the harness's summary line.

const path = require('path');
const { spawnSync } = require('child_process');

const HARNESS = 'hooks/command-guard/test/run.js';

module.exports = {
  id: 'guard-cases',
  level: 'fail',
  check(c) {
    if (!c.exists(HARNESS)) return [];
    const res = spawnSync(process.execPath, [path.join(c.root, HARNESS)], { cwd: c.root, encoding: 'utf8', timeout: 300000 });
    const lines = (res.stdout || '').split('\n').filter(Boolean);
    const out = lines.filter((l) => l.startsWith('FAIL ')).map((l) => ({ file: HARNESS, message: 'guard case failed: ' + l.slice(5) + '; run node ' + HARNESS }));
    if (res.status !== 0 && !out.length) {
      const why = res.error ? res.error.message : 'exited ' + res.status + ': ' + ((res.stderr || '').trim().split('\n').pop() || lines.pop() || 'no output');
      out.push({ file: HARNESS, message: 'the guard harness ' + why + '; run node ' + HARNESS });
    }
    if (!out.length) console.log('guard: ' + (lines.pop() || 'no output'));
    return out;
  },
};
