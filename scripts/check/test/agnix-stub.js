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

const PIN = require(path.join(__dirname, '..', '..', '..', 'package.json')).devDependencies.agnix;

// The stub's answer to one call: { stdout, status }. The fixture runner calls
// this directly for cases it runs in its own process.
function reply(args, stubJson) {
  const opt = JSON.parse(stubJson || '{}');
  const config = args[args.indexOf('--config') + 1];
  const refused =
    args.some((a) => /^--(fix|fix-safe|fix-unsafe|dry-run|show-fixes)$/.test(a)) ? 'autofix flag passed: ' + args.join(' ')
      : args[args.indexOf('--format') + 1] !== 'json' ? 'no --format json'
        : !args.includes('--config') || !fs.existsSync(config) ? 'no --config file'
          : null;
  if (refused) return { stdout: 'agnix-stub refused: ' + refused + '\n', status: 2 };
  if (opt.raw !== undefined) return { stdout: opt.raw + '\n', status: 1 };
  const diagnostics = opt.diagnostics || [];
  return {
    stdout: JSON.stringify({ version: opt.version || PIN, files_checked: 0, diagnostics, summary: {} }) + '\n',
    status: diagnostics.some((d) => d.level === 'error') ? 1 : 0,
  };
}

module.exports = { reply };

if (require.main === module) {
  const res = reply(process.argv.slice(2), process.env.AGNIX_STUB);
  process.stdout.write(res.stdout);
  process.exit(res.status);
}
