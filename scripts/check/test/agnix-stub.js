#!/usr/bin/env node
'use strict';
// A stand-in for agnix in the fixture runner, so cases do not depend on the
// real tool being installed. The runner points HSKILLS_CHECK_AGNIX here.
// AGNIX_STUB (JSON, optional) shapes the reply:
//   diagnostics: agnix JSON diagnostics, `file` relative to the checked root
//   version:     the version reported (default: the pin in package.json)
//   raw:         print this instead of JSON (a broken agnix)
// The stub refuses the calls the check must never make: any autofix flag, no
// `--format json`, or no `--config` file. It then prints non-JSON, which the
// check reports as a warning, so the case fails on the unexpected finding.

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = JSON.parse(process.env.AGNIX_STUB || '{}');
const config = args[args.indexOf('--config') + 1];
const refused =
  args.some((a) => /^--(fix|fix-safe|fix-unsafe|dry-run|show-fixes)$/.test(a)) ? 'autofix flag passed: ' + args.join(' ')
    : args[args.indexOf('--format') + 1] !== 'json' ? 'no --format json'
      : !args.includes('--config') || !fs.existsSync(config) ? 'no --config file'
        : null;
if (refused) {
  console.log('agnix-stub refused: ' + refused);
  process.exit(2);
}
if (opt.raw !== undefined) {
  console.log(opt.raw);
  process.exit(1);
}

const pin = require(path.join(__dirname, '..', '..', '..', 'package.json')).devDependencies.agnix;
const diagnostics = opt.diagnostics || [];
console.log(JSON.stringify({ version: opt.version || pin, files_checked: 0, diagnostics, summary: {} }));
process.exit(diagnostics.some((d) => d.level === 'error') ? 1 : 0);
