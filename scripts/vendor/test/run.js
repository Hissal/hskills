'use strict';
// Drift fixture runner: node scripts/vendor/test/run.js
// Each case in cases.js is a triple: a source git repository (a pinned commit
// and a later head on its default branch), a baseline and a local copy in a
// scratch collection. The drift script runs on it as a child process, with
// --source-base pointing at the scratch sources instead of GitHub, so the
// tests run offline. Only exit codes, KEY: value lines and the files a merge
// leaves are compared, never message wording.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const cases = require('./cases');

const DRIFT = path.join(__dirname, '..', 'drift.js');
const { SOURCE, SKILL, PATH } = cases;
let failed = 0;
let passed = 0;

function git(dir, args) {
  const res = spawnSync('git', ['-c', 'user.name=fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'core.autocrlf=false', '-c', 'init.defaultBranch=trunk', ...args], { cwd: dir, encoding: 'utf8' });
  if (res.status !== 0) throw new Error('git ' + args.join(' ') + ' failed: ' + res.stderr);
  return res.stdout.trim();
}

// Trees compare by content, not by key order.
const canon = (t) => JSON.stringify(t && Object.keys(t).sort().map((k) => [k, t[k]]));
const join = (dir, file) => path.join(dir, ...file.split('/'));

function write(dir, files) {
  for (const [file, content] of Object.entries(files || {})) {
    fs.mkdirSync(path.dirname(join(dir, file)), { recursive: true });
    fs.writeFileSync(join(dir, file), content);
  }
}

// Every file under `dir` as { relative/path: text }, or null when absent.
function readTree(dir) {
  if (!fs.existsSync(dir)) return null;
  const out = {};
  (function walk(rel) {
    for (const d of fs.readdirSync(join(dir, rel || '.'), { withFileTypes: true })) {
      const r = rel ? rel + '/' + d.name : d.name;
      if (d.isDirectory()) walk(r); else out[r] = fs.readFileSync(join(dir, r), 'utf8');
    }
  })('');
  return out;
}

// The source repository: the pinned folder in one commit, then the head
// folder plus an unrelated file in the next, so the head always moves.
function makeSource(dir, c) {
  fs.mkdirSync(dir, { recursive: true });
  git(dir, ['init', '-q']);
  write(dir, Object.fromEntries(Object.entries(c.pinned).map(([f, t]) => [PATH + '/' + f, t])));
  write(dir, { 'README.md': 'source\n' });
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', 'pinned']);
  const pinned = git(dir, ['rev-parse', 'HEAD']);
  fs.rmSync(join(dir, PATH), { recursive: true, force: true });
  write(dir, Object.fromEntries(Object.entries(c.head || c.pinned).map(([f, t]) => [PATH + '/' + f, t])));
  write(dir, { 'README.md': 'source, moved on\n' });
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '-m', 'head']);
  return { pinned, head: git(dir, ['rev-parse', 'HEAD']) };
}

function lockText(sha) {
  return JSON.stringify({ skills: [{ skill: SKILL, source: SOURCE, path: PATH, sha, license: 'MIT', changes: 'none' }] }, null, 2) + '\n';
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'vendor-drift-test-'));
try {
  cases.forEach((c, i) => {
    const dir = path.join(scratch, String(i));
    const sources = path.join(dir, 'sources');
    const root = path.join(dir, 'collection');
    const sha = makeSource(join(sources, SOURCE), c);
    const pin = c.pin === 'unknown' ? 'f'.repeat(40) : sha.pinned;
    const baseline = 'vendor/' + SOURCE + '/' + path.posix.basename(SKILL);
    write(root, { 'vendor.lock.json': lockText(pin), ['licenses/' + SOURCE + '.txt']: 'MIT licence text\n' });
    write(join(root, baseline), c.baseline || c.pinned);
    write(join(root, SKILL), c.local || c.pinned);

    const args = [DRIFT, '--root', root, '--source-base', sources].concat(c.merge ? ['--merge', SKILL] : []);
    const res = spawnSync(process.execPath, args, { encoding: 'utf8' });
    const problems = [];
    if (res.status !== c.exit) problems.push('exit ' + res.status + ', expected ' + c.exit);
    const lines = res.stdout.split(/\r?\n/).filter(Boolean);
    for (const want of c.lines || []) if (!lines.includes(want)) problems.push('no line ' + JSON.stringify(want));
    if (c.merge) {
      const m = c.merge;
      if (m.local) {
        const got = readTree(join(root, SKILL));
        delete got['NOTICE.md'];
        const want = typeof m.local === 'function' ? m.local(got) : canon(got) === canon(m.local);
        if (!want) problems.push('local copy is ' + JSON.stringify(got));
      }
      const wantPin = m.moves ? sha.head : pin;
      const lockNow = JSON.parse(fs.readFileSync(join(root, 'vendor.lock.json'), 'utf8')).skills[0].sha;
      if (lockNow !== wantPin) problems.push('lock sha ' + lockNow + ', expected ' + (m.moves ? 'head' : 'pinned'));
      const wantBase = m.moves ? (c.head || c.pinned) : (c.baseline || c.pinned);
      if (canon(readTree(join(root, baseline))) !== canon(m.moves ? normalised(wantBase) : wantBase)) problems.push('baseline is ' + JSON.stringify(readTree(join(root, baseline))));
      const notice = readTree(join(root, SKILL))['NOTICE.md'] || '';
      if (m.moves && !notice.includes(sha.head)) problems.push('NOTICE.md does not name the new pin');
    }
    if (!problems.length) { passed++; return; }
    failed++;
    console.log('FAIL ' + c.name);
    for (const p of problems) console.log('     ' + p);
    console.log('     stdout: ' + res.stdout.trim().split('\n').join('\n             '));
    if (res.stderr) console.log('     stderr: ' + res.stderr.trim().split('\n').slice(0, 6).join('\n     '));
  });
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

// Baselines are written LF and BOM-free.
function normalised(files) {
  return Object.fromEntries(Object.entries(files).map(([f, t]) => [f, t.replace(/^﻿/, '').replace(/\r\n/g, '\n')]));
}

console.log((failed ? 'FAILED: ' : 'ok: ') + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
