#!/usr/bin/env node
'use strict';
// The collection check: node scripts/check/check.js [root]
// Checks the tree at root (default: this repository) against
// docs/skill-format.md. Prints one line per finding:
//   FAIL <file>[:<line>] [<rule>] <message>
//   WARN <file>[:<line>] [<rule>] <message>
// and exits 1 on any FAIL. Warnings never fail the run.

const path = require('path');
const { load } = require('./collection');
const rules = require('./rules');

const root = path.resolve(process.argv[2] || path.join(__dirname, '..', '..'));

let collection;
try {
  collection = load(root);
} catch (e) {
  console.log('FAIL ' + root + ' [check] ' + e.message);
  process.exit(1);
}

const findings = require('./tripwires').report(collection);
for (const rule of rules) {
  for (const f of rule.check(collection)) findings.push(Object.assign({ rule: rule.id, level: rule.level }, f));
}

let fails = 0;
let warns = 0;
for (const f of findings) {
  if (f.level === 'fail') fails++;
  else warns++;
  console.log((f.level === 'fail' ? 'FAIL ' : 'WARN ') + f.file + (f.line ? ':' + f.line : '') + ' [' + f.rule + '] ' + f.message);
}
console.log((fails ? 'FAILED' : 'ok') + ': ' + collection.skills.length + ' skills, ' + collection.files.length + ' files, ' + fails + ' failures, ' + warns + ' warnings');
process.exit(fails ? 1 : 0);
