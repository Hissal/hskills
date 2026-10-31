#!/usr/bin/env node
'use strict';
// The onboarding guide writer: node scripts/onboarding/generate.js [root]
// Writes skills/packs/onboarding/onboarding-guide from skills/core/guide
// (docs/skill-format.md, "Automatic guide"). See guide.js for what changes.

const fs = require('fs');
const path = require('path');
const { load } = require('../check/collection');
const { CORE, DIR, outputs } = require('./guide');

if (process.argv.includes('--help')) {
  console.log('Usage: node scripts/onboarding/generate.js [root]\nRegenerate ' + DIR + ' from ' + CORE + '; only frontmatter and the Codex gate differ.\nFiles there that ' + CORE + ' does not bundle are removed. A second run changes nothing.');
} else {
  try {
    const root = path.resolve(process.argv[2] || path.join(__dirname, '../..'));
    const c = load(root);
    const { files, stale } = outputs(c);
    let changed = 0;
    for (const f of stale) {
      fs.unlinkSync(path.join(root, f));
      changed++;
    }
    for (const [f, bytes] of Object.entries(files)) {
      const full = path.join(root, f);
      if (fs.existsSync(full) && fs.readFileSync(full).equals(bytes)) continue;
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, bytes);
      changed++;
    }
    console.log('ok: ' + DIR + ' generated from ' + CORE + ' (' + changed + ' file' + (changed === 1 ? '' : 's') + ' changed)');
  } catch (e) {
    console.error('FAIL: ' + e.message);
    process.exitCode = 1;
  }
}
