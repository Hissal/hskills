'use strict';
// Copies the claude and codex CLI doubles into a test home and returns their paths.
// POSIX gets host.py, which starts faster; Windows cannot start it directly and keeps host.cjs.
const fs = require('fs');
const path = require('path');
const double = process.platform === 'win32' ? 'host.cjs' : 'host.py';

module.exports = function hostDoubles(home) {
  const paths = {};
  for (const host of ['claude', 'codex']) {
    paths[host] = path.join(home, host + path.extname(double));
    fs.copyFileSync(path.join(__dirname, double), paths[host]);
    fs.chmodSync(paths[host], 0o755);
  }
  return paths;
};
