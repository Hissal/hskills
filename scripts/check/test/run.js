'use strict';
// Fixture runner: node scripts/check/test/run.js
// Each case in cases.js is written to a scratch git repository (untracked
// unless the case stages files), the check runs on it as a child process, and
// the exit code and the FAIL/WARN lines are compared with the case's
// expectation. Message wording is never compared. The check must leave every
// fixture file as written: it never rewrites the tree.
//
// agnix: a case runs against agnix-stub.js unless it sets `agnix`:
//   { diagnostics, version, raw }  the stub's reply (see agnix-stub.js)
//   'missing'                      no agnix installed
//   'real'                         the pinned agnix from node_modules; the case
//                                  is skipped, and said so, when it is absent

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const cases = require('./cases');

const CHECK = path.join(__dirname, '..', 'check.js');
const STUB = path.join(__dirname, 'agnix-stub.js');
const REAL_AGNIX = path.join(__dirname, '..', '..', '..', 'node_modules', 'agnix', 'bin', 'agnix');
const FINDING = /^(FAIL|WARN) (.+?)(?::\d+)? \[([\w-]+)\] /;
let failed = 0;
let passed = 0;
let skipped = 0;

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
    if (c.agnix === 'real' && !fs.existsSync(REAL_AGNIX)) {
      skipped++;
      console.log('SKIP ' + c.name + ' (agnix not installed: npm ci)');
      return;
    }
    const dir = path.join(scratch, String(i));
    fs.mkdirSync(dir);
    git(dir, ['init', '-q']);
    if (c.committed) {
      write(dir, c.committed);
      git(dir, ['add', '-A']);
      git(dir, ['commit', '-q', '-m', 'fixture']);
    }
    write(dir, c.files || {});

    const env = Object.assign({}, process.env, { COLLECTION_ALWAYS_ON_PATH: c.alwaysOnPath || '', COLLECTION_CHECK_AGNIX: STUB, AGNIX_STUB: '' });
    if (c.agnix === 'real') delete env.COLLECTION_CHECK_AGNIX;
    else if (c.agnix === 'missing') env.COLLECTION_CHECK_AGNIX = path.join(dir, 'no-agnix-here.js');
    else if (c.agnix) env.AGNIX_STUB = JSON.stringify(c.agnix);

    const res = spawnSync(process.execPath, [CHECK, dir], { encoding: 'utf8', env });
    const got = res.stdout.split('\n').map((l) => l.match(FINDING)).filter(Boolean).map((m) => key(m[1], m[3], m[2])).sort();
    const want = (c.expect || []).slice().sort();
    const exit = want.some((w) => w.startsWith('fail ')) ? 1 : 0;
    const other = res.stdout.split('\n').filter((l) => l && !FINDING.test(l) && !l.startsWith('TRIPWIRE '));
    const outputOk = (c.output || []).every((expected) => typeof expected === 'string'
      ? res.stdout.includes(expected)
      : other.some((line) => expected.test(line))) &&
      (!(c.output || []).some((expected) => expected instanceof RegExp) || other.length === c.output.length);
    const written = Object.assign({}, c.committed, c.files);
    const changed = Object.keys(written).filter((f) => !fs.readFileSync(path.join(dir, ...f.split('/'))).equals(Buffer.from(written[f])));
    const ok = outputOk && res.status === exit && JSON.stringify(got) === JSON.stringify(want) && !changed.length;
    if (ok) { passed++; return; }
    failed++;
    console.log('FAIL ' + c.name);
    console.log('     expected exit ' + exit + ': ' + JSON.stringify(want));
    console.log('     got exit ' + res.status + ': ' + JSON.stringify(got));
    if (!outputOk) console.log('     stdout: ' + res.stdout);
    if (changed.length) console.log('     the check changed: ' + changed.join(', '));
    if (res.stderr) console.log('     stderr: ' + res.stderr.trim().split('\n').slice(0, 6).join('\n     '));
  });
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

console.log((failed ? 'FAILED' : 'ok') + ': ' + passed + ' passed, ' + failed + ' failed' + (skipped ? ', ' + skipped + ' skipped' : ''));
process.exit(failed ? 1 : 0);
