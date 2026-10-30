'use strict';

const fs = require('fs');
const path = require('path');
const { load } = require('../check/collection');
const { FILE, JSON_FILE, update, generateJson } = require('../check/dependency-catalog');

if (process.argv.includes('--help')) {
  console.log('Usage: node scripts/catalog/generate.js [root]\nRegenerate catalog.json and the marked dependency section in docs/catalog.md from skill metadata.');
} else {
  try {
    const root = path.resolve(process.argv[2] || path.join(__dirname, '../..'));
    const file = path.join(root, FILE);
    const collection = load(root);
    const human = update(fs.readFileSync(file, 'utf8'), collection);
    const json = generateJson(collection);
    fs.writeFileSync(file, human);
    fs.writeFileSync(path.join(root, JSON_FILE), json);
    console.log('ok: regenerated ' + FILE + ' and ' + JSON_FILE);
  } catch (e) {
    console.error('FAIL: ' + e.message);
    process.exitCode = 1;
  }
}
