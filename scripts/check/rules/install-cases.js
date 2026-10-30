'use strict';
const path = require('path');
const { spawnSync } = require('child_process');
const HARNESS = 'scripts/install/test/run.js';
module.exports = {
  id: 'install-cases',
  level: 'fail',
  check(c) {
    if (!c.exists(HARNESS)) return c.exists('scripts/install/install.js') ? [{ file: HARNESS, message: 'missing install case harness' }] : [];
    const result = spawnSync(process.execPath, [path.join(c.root, HARNESS)], { cwd: c.root, encoding: 'utf8', timeout: 300000 });
    if (result.status !== 0 || /^(FAIL )/m.test(result.stdout || '')) return [{ file: HARNESS, message: 'install cases failed; run node ' + HARNESS + ': ' + (result.error ? result.error.message : (result.stdout + result.stderr).trim()) }];
    console.log('install: ' + result.stdout.trim());
    return [];
  },
};
