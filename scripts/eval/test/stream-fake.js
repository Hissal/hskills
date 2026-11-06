#!/usr/bin/env node
'use strict';
// A fake harness that streams a scripted session, for the early-stop tests.
// Usage: stream-fake.js <steps.json> [harness flags...] <prompt>
// Each step is one of:
//   {"type": ...}               print it as one JSONL event
//   {"wait": ms}                pause
//   {"touch": file}             write the file (relative to the working directory)
//   {"later": [ms, file]}       start a grandchild that writes the file after ms
//   {"exit": code}              exit now
// A step after a wait only happens if the session is still running, so a file
// written after a wait shows that nobody stopped it.
const fs = require('node:fs');
const {spawn} = require('node:child_process');
const steps = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

async function main() {
  for (const step of steps) {
    if (step.wait !== undefined) await new Promise(resolve => setTimeout(resolve, step.wait));
    else if (step.touch !== undefined) fs.writeFileSync(step.touch, 'touched\n');
    else if (step.later !== undefined) {
      const [ms, file] = step.later;
      spawn(process.execPath, ['-e', `setTimeout(() => require('fs').writeFileSync(${JSON.stringify(file)}, 'late\\n'), ${ms})`], {stdio: 'ignore'});
    } else if (step.exit !== undefined) process.exit(step.exit);
    else process.stdout.write(JSON.stringify(step) + '\n');
  }
}
main();
