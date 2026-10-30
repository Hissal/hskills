#!/usr/bin/env node
'use strict';
// The gate writer: node scripts/gates/write-gates.js [--help] [root]
// Writes each skill's Codex and OpenCode gates from its
// disable-model-invocation (docs/skill-format.md, "Harness gates").

const fs = require('fs');
const path = require('path');
const { load } = require('../check/collection');
const gates = require('./gates');

const HELP = `Usage: node scripts/gates/write-gates.js [--help] [root]

Generates the harness gates of every skill under <root>/skills (default: this
repository) from SKILL.md's ${gates.SOURCE}, the single source:

  Codex     ${gates.CODEX_FILE}  policy.allow_implicit_invocation: true|false
  OpenCode  SKILL.md metadata    opencode/autoinvoke: "true"|"false"

Only those two values are written; every other line is left as it is, and a
second run changes nothing. Output is KEY: value lines:

  WROTE: <file>     a file this run changed
  ERROR: <message>  a skill left unwritten, and why
  SKILLS: <n>       skills seen
  WRITTEN: <n>      files changed
  ERRORS: <n>       skills left unwritten (only when any)

Exits 1 when any skill was left unwritten, else 0.
`;

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  process.stdout.write(HELP);
  process.exit(0);
}
const root = path.resolve(args[0] || path.join(__dirname, '..', '..'));

const c = load(root);
let written = 0;
let errors = 0;
for (const s of c.skills) {
  const codexFile = s.dir + '/' + gates.CODEX_FILE;
  const codexText = c.exists(codexFile) ? c.text(codexFile) : null;
  let next;
  try {
    next = gates.generate(c.text(s.skillMd), codexText, s.dir);
  } catch (e) {
    errors++;
    console.log('ERROR: ' + e.message);
    continue;
  }
  for (const [file, before, after] of [[s.skillMd, c.text(s.skillMd), next.skillMd], [codexFile, codexText, next.codex]]) {
    if (before === after) continue;
    const full = path.join(root, file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, after);
    written++;
    console.log('WROTE: ' + file);
  }
}
console.log('SKILLS: ' + c.skills.length);
console.log('WRITTEN: ' + written);
if (errors) console.log('ERRORS: ' + errors);
process.exit(errors ? 1 : 0);
