'use strict';

const fs = require('fs');
const path = require('path');
const { load } = require('../check/collection');
const { FILE, update } = require('../check/dependency-catalog');

if (process.argv.includes('--help')) {
  console.log('Usage: node scripts/catalog/generate.js [root]\nRegenerate the marked dependency section in docs/catalog.md from skill metadata.');
} else {
  try {
    const root = path.resolve(process.argv[2] || path.join(__dirname, '../..'));
    const file = path.join(root, FILE);
    fs.writeFileSync(file, update(fs.readFileSync(file, 'utf8'), load(root)));
    console.log('ok: regenerated ' + FILE);
  } catch (e) {
    console.error('FAIL: ' + e.message);
    process.exitCode = 1;
  }
}
