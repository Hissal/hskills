'use strict';
// agnix, on trial (#93): a maintained linter for harness format mechanics,
// run beside the collection's own rules. It runs pinned (package.json, so
// `npm ci` installs it), scoped and with rules off by the collection's
// .agnix.toml, and never with an autofix flag, so it never rewrites a skill.
// While on trial every finding is a warning; the owner promotes it to failing
// or drops it after its first run over the first real batch of skills.
//
// agnix errors and warnings are reported; its info-level advice is not. A
// missing install, a version other than the pin, or a failed run is one
// warning on package.json: the trial never fails the check.
// HSKILLS_CHECK_AGNIX names another agnix script to run (the fixture
// runner's stub).

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.join(__dirname, '..', '..', '..');
const CONFIG = path.join(REPO, '.agnix.toml');
const PIN = require(path.join(REPO, 'package.json')).devDependencies.agnix;

const trouble = (message) => [{ file: 'package.json', message: message + '; agnix was not run (on trial, so this never fails)' }];

module.exports = {
  id: 'agnix',
  level: 'warn',
  check(c) {
    const bin = process.env.HSKILLS_CHECK_AGNIX || path.join(REPO, 'node_modules', 'agnix', 'bin', 'agnix');
    if (!fs.existsSync(bin)) return trouble('agnix ' + PIN + ' is not installed: run `npm ci`');

    const res = spawnSync(process.execPath, [bin, '--config', CONFIG, '--format', 'json', '.'], { cwd: c.root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    let out;
    try {
      out = JSON.parse(res.stdout);
    } catch (e) {
      const said = ((res.stderr || '') + (res.stdout || '')).trim().split('\n')[0];
      return trouble('agnix did not report (exit ' + res.status + (said ? ': ' + said : '') + ')');
    }
    if (out.version !== PIN) return trouble('agnix ' + out.version + ' is installed, not the pinned ' + PIN + ': run `npm ci`');

    const files = new Set(c.files);
    const findings = [];
    for (const d of out.diagnostics || []) {
      if (d.level !== 'error' && d.level !== 'warning') continue;
      const file = path.relative(c.root, path.resolve(c.root, d.file)).split(path.sep).join('/');
      if (!files.has(file)) continue;
      findings.push({ file, line: d.line, message: d.rule + ' (agnix ' + d.level + '): ' + d.message + (d.suggestion ? ' ' + d.suggestion : '') });
    }
    return findings;
  },
};
