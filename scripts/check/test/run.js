'use strict';
// Fixture runner: node scripts/check/test/run.js
// Each case in cases.js is written to a scratch git repository (untracked
// unless the case stages files), the check runs on it as a child process, and
// the exit code and the FAIL/WARN lines are compared with the case's
// expectation. Message wording is never compared.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const cases = require('./cases');
require('./catalog');

const CHECK = path.join(__dirname, '..', 'check.js');
const FINDING = /^(FAIL|WARN) (.+?)(?::\d+)? \[([\w-]+)\] /;
let failed = 0;
let passed = 0;

function git(dir, args) {
  const res = spawnSync('git', ['-c', 'user.name=fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'core.autocrlf=false', ...args], { cwd: dir, encoding: 'utf8' });
  if (res.status !== 0) throw new Error('git ' + args.join(' ') + ' failed: ' + res.stderr);
}

function write(dir, files) {
  for (const [file, content] of Object.entries(files)) {
    const full = path.join(dir, ...file.split('/'));
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
}

// An expectation line is "<fail|warn> <rule> <file>".
const key = (level, rule, file) => level.toLowerCase() + ' ' + rule + ' ' + file;

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'collection-check-test-'));
try {
  cases.forEach((c, i) => {
    const dir = path.join(scratch, String(i));
    fs.mkdirSync(dir);
    git(dir, ['init', '-q']);
    if (c.committed) {
      write(dir, c.committed);
      git(dir, ['add', '-A']);
      git(dir, ['commit', '-q', '-m', 'fixture']);
    }
    write(dir, c.files || {});

    const res = spawnSync(process.execPath, [CHECK, dir], { encoding: 'utf8', env: Object.assign({}, process.env, { COLLECTION_ALWAYS_ON_PATH: c.alwaysOnPath || '' }) });
    const got = res.stdout.split('\n').map((l) => l.match(FINDING)).filter(Boolean).map((m) => key(m[1], m[3], m[2])).sort();
    const want = (c.expect || []).slice().sort();
    const exit = want.some((w) => w.startsWith('fail ')) ? 1 : 0;
    const outputOk = (c.output || []).every((line) => res.stdout.includes(line));
    const ok = outputOk && res.status === exit && JSON.stringify(got) === JSON.stringify(want);
    if (ok) { passed++; return; }
    failed++;
    console.log('FAIL ' + c.name);
    console.log('     expected exit ' + exit + ': ' + JSON.stringify(want));
    console.log('     got exit ' + res.status + ': ' + JSON.stringify(got));
    if (!outputOk) console.log('     stdout: ' + res.stdout);
    if (res.stderr) console.log('     stderr: ' + res.stderr.trim().split('\n').slice(0, 6).join('\n     '));
  });
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

console.log((failed ? 'FAILED' : 'ok') + ': ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
