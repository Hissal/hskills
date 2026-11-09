'use strict';
// Copies the claude and codex CLI doubles into a test home and returns their paths.
// POSIX gets host.py, which starts faster; Windows cannot start it directly and keeps host.cjs.
const fs = require('fs');
const path = require('path');
const double = process.platform === 'win32' ? 'host.cjs' : 'host.py';
const repo = path.resolve(__dirname, '../../..');

module.exports = function hostDoubles(home) {
  const paths = {};
  for (const host of ['claude', 'codex']) {
    paths[host] = path.join(home, host + path.extname(double));
    fs.copyFileSync(path.join(__dirname, double), paths[host]);
    fs.chmodSync(paths[host], 0o755);
  }
  return paths;
};

// A fixture checkout holding the guard and this repo's marketplace, cut to the
// guard's entry: the skill plugins it lists are not in the fixture.
module.exports.guardCheckout = function guardCheckout(dir) {
  fs.cpSync(path.join(repo, 'hooks/command-guard'), path.join(dir, 'hooks/command-guard'), { recursive: true });
  const market = JSON.parse(fs.readFileSync(path.join(repo, '.claude-plugin/marketplace.json')));
  market.plugins = market.plugins.filter(p => p.name === 'command-guard');
  fs.mkdirSync(path.join(dir, '.claude-plugin'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.claude-plugin/marketplace.json'), JSON.stringify(market, null, 2) + '\n');
  return dir;
};
