'use strict';
// Floor-guard case runner (#201): node scripts/floor-guard/test/run.js
// Runs every case in cases.js against a fresh git repository built from the
// case, with the guard from the constraints skill folder installed into it
// the way the skill installs it. The guard is a black box: only its exit
// code and printed lines are compared. node scripts/check/test/run.js runs
// this file too; a failed case makes that run fail.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { git, write, tempDir } = require('../../test-util');
const cases = require('./cases');

const BUNDLED = path.resolve(__dirname, '../../../skills/core/constraints/scripts/floor-guard.mjs');
const COPY = 'tools/floor-guard.mjs';
const DATA = 'tools/floor-guard.json';

const scratch = tempDir('floor-guard-cases-');
let variants = 0;

function guardPath(dir, which) {
  if (!which || which === 'copy') return path.join(dir, COPY);
  if (which === 'bundled') return BUNDLED;
  return which;
}

function run(dir, which, args, cwd) {
  return spawnSync(process.execPath, [guardPath(dir, which), ...args], { cwd: cwd ? path.join(dir, cwd) : dir, encoding: 'utf8' });
}

function apply(dir, files) {
  for (const [file, content] of Object.entries(files || {})) {
    if (content === null) fs.rmSync(path.join(dir, file), { force: true });
    else write(dir, { [file]: content });
  }
}

// Fixture tools a case's prepare and after hooks may use.
const tools = {
  assert,
  git,
  run,
  read: (dir, file) => fs.readFileSync(path.join(dir, file), 'utf8'),
  edit: (dir, file, change) => fs.writeFileSync(path.join(dir, file), change(fs.readFileSync(path.join(dir, file), 'utf8'))),
  removeGit: (dir) => fs.rmSync(path.join(dir, '.git'), { recursive: true, force: true }),
  // Commit `content` at `file` through the index alone, marked skip-worktree,
  // so a path no file system can hold (a newline on Windows) still works.
  commitPath(dir, file, content, message) {
    const blob = path.join(scratch, 'blob-' + variants++);
    fs.writeFileSync(blob, content);
    const oid = git(dir, ['hash-object', '-w', blob]);
    // Git for Windows refuses such a path, in this and the guard's later git
    // calls, unless the repository turns NTFS protection off.
    git(dir, ['config', 'core.protectNTFS', 'false']);
    git(dir, ['update-index', '--add', '--cacheinfo', '100644,' + oid + ',' + file]);
    git(dir, ['update-index', '--skip-worktree', file]);
    git(dir, ['commit', '-q', '-m', message]);
  },
  // Install a guard built from a changed bundled guard, stamped as `version`,
  // as an older release of the guard would have installed it.
  installVariant(dir, change, version) {
    const folder = path.join(scratch, 'variant-' + variants++);
    fs.mkdirSync(folder);
    fs.writeFileSync(path.join(folder, 'floor-guard.mjs'), change(fs.readFileSync(BUNDLED, 'utf8')));
    fs.writeFileSync(path.join(folder, 'version.json'), JSON.stringify({ version }) + '\n');
    const r = run(dir, path.join(folder, 'floor-guard.mjs'), ['--install', COPY, '--replace']);
    assert.equal(r.status, 0, 'variant install failed: ' + r.stdout + r.stderr);
  },
  // The guard lists each category's default patterns one per line, as
  // `  category: [` followed by quoted regex sources.
  dropDefault(source, category, marker) {
    const block = blockOf(source, category);
    const kept = block.split('\n').filter((l) => !l.includes(marker)).join('\n');
    assert.notEqual(kept, block, 'no default ' + category + ' pattern holds ' + marker);
    return source.replace(block, kept);
  },
  addDefault(source, category, literal) {
    const block = blockOf(source, category);
    return source.replace(block, block.replace('[\n', "[\n    '" + literal + "',\n"));
  },
};

function blockOf(source, category) {
  const start = source.indexOf('  ' + JSON.stringify(category).replace(/^"|"$/g, '') + ': [\n');
  const quoted = source.indexOf("  '" + category + "': [\n");
  const at = start >= 0 ? start : quoted;
  assert.ok(at >= 0, 'the guard has no default ' + category + ' block');
  return source.slice(at, source.indexOf('],', at) + 2);
}

function build(c, dir) {
  git(dir, ['init', '-q']);
  if (c.install !== false) {
    const r = run(dir, 'bundled', ['--install', COPY]);
    assert.equal(r.status, 0, 'install failed: ' + r.stdout + r.stderr);
  }
  write(dir, c.base || {});
  if (c.data) write(dir, { [DATA]: JSON.stringify(c.data, null, 2) + '\n' });
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-q', '--allow-empty', '-m', 'base']);
  git(dir, ['checkout', '-q', '-b', 'work']);
  if (c.branch) {
    apply(dir, c.branch);
    git(dir, ['add', '-A']);
    git(dir, ['commit', '-q', '-m', 'branch']);
  }
  apply(dir, c.work);
  if (c.stage) git(dir, ['add', '-A']);
  if (c.prepare) c.prepare(dir, tools);
}

function verify(c, dir) {
  const spec = c.run || {};
  const r = run(dir, spec.guard, spec.args || ['--base', 'trunk'], spec.cwd);
  const output = r.stdout + r.stderr;
  const problems = [];
  if (r.status !== c.exit) problems.push('expected exit ' + c.exit + ', got ' + r.status);
  if (c.violations) {
    const got = r.stdout.split('\n').filter((l) => l.startsWith('VIOLATION: ')).map((l) => l.slice(11)).sort();
    const want = c.violations.slice().sort();
    if (JSON.stringify(got) !== JSON.stringify(want)) problems.push('expected violations ' + JSON.stringify(want) + ', got ' + JSON.stringify(got));
  }
  for (const [key, value] of Object.entries(c.keys || {})) {
    const line = r.stdout.split('\n').find((l) => l.startsWith(key + ': '));
    if (line === undefined || line.slice(key.length + 2) !== value) problems.push('expected ' + key + ': ' + value + ', got ' + JSON.stringify(line));
  }
  for (const re of c.out || []) if (!re.test(output)) problems.push('output does not match ' + re);
  for (const text of c.absent || []) if (output.includes(text)) problems.push('output contains ' + JSON.stringify(text));
  if (!problems.length && c.after) c.after(dir, tools);
  if (problems.length) problems.push('stdout: ' + r.stdout.trim().replace(/\n/g, '\n       '), 'stderr: ' + r.stderr.trim().replace(/\n/g, '\n       '));
  return problems;
}

let passed = 0;
const failures = [];
try {
  cases.forEach((c, i) => {
    const dir = path.join(scratch, 'case-' + i);
    fs.mkdirSync(dir);
    let problems;
    try {
      build(c, dir);
      problems = verify(c, dir);
    } catch (e) {
      problems = [e.stack || String(e)];
    }
    if (problems.length) failures.push('FAIL floor guard: ' + c.name + '\n     ' + problems.join('\n     '));
    else passed++;
  });
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

for (const f of failures) console.log(f);
console.log('floor guard: ' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) {
  if (require.main === module) process.exit(1);
  throw new Error(failures.length + ' floor-guard case(s) failed; run node scripts/floor-guard/test/run.js');
}
