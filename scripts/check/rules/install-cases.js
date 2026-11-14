'use strict';
const path = require('path');
const { spawnSync } = require('child_process');
const HARNESS = 'scripts/install/test/run.js';
// The harness runs its plugin and trust sub-harnesses, each lifecycle case and
// its own cases in parallel on half the cores (HSKILLS_INSTALL_CASES_JOBS sets
// how many), with 300s for plugin, 60s for trust and 300s per lifecycle case. A healthy serial run on a slow machine took 305s (#216); the
// parallel run takes far less (#241). The limit only stops a hung harness, so
// it sits well past that.
// HSKILLS_INSTALL_CASES_TIMEOUT_MS (a positive whole number) overrides it.
const DEFAULT_TIMEOUT_MS = 900000;
module.exports = {
  id: 'install-cases',
  level: 'fail',
  check(c) {
    if (!c.exists(HARNESS)) return c.exists('scripts/install/install.js') ? [{ file: HARNESS, message: 'missing install case harness' }] : [];
    const override = Number(process.env.HSKILLS_INSTALL_CASES_TIMEOUT_MS);
    const timeout = Number.isSafeInteger(override) && override > 0 ? override : DEFAULT_TIMEOUT_MS;
    const result = spawnSync(process.execPath, [path.join(c.root, HARNESS)], { cwd: c.root, encoding: 'utf8', timeout });
    if (result.error && result.error.code === 'ETIMEDOUT') return [{ file: HARNESS, message: 'install cases timed out after ' + timeout / 1000 + 's (HSKILLS_INSTALL_CASES_TIMEOUT_MS raises the limit); run node ' + HARNESS }];
    if (result.status !== 0 || /^(FAIL )/m.test(result.stdout || '')) return [{ file: HARNESS, message: 'install cases failed; run node ' + HARNESS + ': ' + (result.error ? result.error.message : (result.stdout + result.stderr).trim()) }];
    console.log('install: ' + result.stdout.trim());
    return [];
  },
};
