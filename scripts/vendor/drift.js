#!/usr/bin/env node
'use strict';
// Drift report for copied skills (#104). Report-only unless --merge names a
// skill. Compares each lock entry's local copy, its baseline and its source
// (the pinned commit and the default branch's head), normalising CRLF and a
// BOM here rather than through git settings, so Windows and Linux classify
// alike. Sources are read with git from <source-base>/<owner>/<repo>; tests
// point --source-base at local repositories.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const lock = require('./lock');
const { renderNotice } = require('./notice');

const HELP = `USAGE: node scripts/vendor/drift.js [--root DIR] [--source-base URL] [--merge SKILL]
Report: one line per vendor.lock.json entry, "<skill>: <class>":
  current           local copy, baseline and source head all match
  local-drift       the local copy differs from the baseline
  update-available  the source head differs from the baseline
  both              local-drift and update-available
  baseline-corrupt  the baseline differs from the source at the pinned commit
  error             not classified; the reason is on stderr
  No vendor.lock.json: no lines, exit 0.
  Files compare with CRLF and a leading BOM normalised; NOTICE.md in the copy is ignored.
  The source head is the default branch of the source repository.
Merge (--merge SKILL, a lock "skill" folder): three-way merge of the local
  copy (ours), the baseline (base) and the source head (theirs), per file.
  MERGED: <file>    taken from the source or merged cleanly
  CONFLICT: <file>  left for the owner, marked with <<<<<<< ======= >>>>>>>
  RESULT: clean | conflict | nothing-to-take
  PIN: <sha>        clean only: lock sha, baseline and NOTICE.md moved to the head
  Nothing is committed: review the result and commit copy, baseline, lock and
  NOTICE.md together. On a conflict the pin and baseline stay put.
EXIT: 0 report done or merge clean; 1 merge conflict; 2 error or invalid input
DEFAULTS: --root the repository; --source-base https://github.com`;

// ---- options

function options(argv) {
  const o = { root: path.join(__dirname, '..', '..'), base: 'https://github.com', merge: null, help: false };
  const args = argv.slice();
  while (args.length) {
    const a = args.shift();
    if (a === '--help') o.help = true;
    else if (a === '--root' || a === '--source-base' || a === '--merge') {
      const v = args.shift();
      if (!v) throw new Error(a + ' needs a value');
      if (a === '--root') o.root = v; else if (a === '--source-base') o.base = v; else o.merge = v;
    } else throw new Error('unknown option ' + a);
  }
  o.root = path.resolve(o.root);
  return o;
}

// ---- files and normalisation

// CRLF and a leading UTF-8 BOM read as LF and nothing. Binary files (a NUL
// byte) compare as bytes.
const isBinary = (buf) => buf.includes(0);
function normalise(buf) {
  if (isBinary(buf)) return buf;
  let s = buf.toString('utf8');
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  return Buffer.from(s.replace(/\r\n/g, '\n'), 'utf8');
}

// A folder on disk as Map(relative path -> normalised Buffer); empty if absent.
function readDir(dir, skip) {
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  (function walk(rel) {
    for (const d of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
      const r = rel ? rel + '/' + d.name : d.name;
      if (d.isDirectory()) walk(r);
      else if (d.isFile() && !(skip && skip(r))) out.set(r, normalise(fs.readFileSync(path.join(dir, r))));
    }
  })('');
  return out;
}

const same = (a, b) => a.size === b.size && [...a].every(([f, buf]) => b.has(f) && b.get(f).equals(buf));

// ---- sources

function run(cmd, args, opts) {
  const res = spawnSync(cmd, args, Object.assign({ maxBuffer: 64 * 1024 * 1024 }, opts));
  if (res.error) throw res.error;
  return res;
}

function gitIn(dir, args) {
  const res = run('git', ['-C', dir, ...args]);
  if (res.status !== 0) throw new Error('git ' + args.join(' ') + ': ' + res.stderr.toString().trim());
  return res.stdout;
}

// One bare clone per source repository per run.
function sources(base, scratch) {
  const clones = new Map();
  function clone(source) {
    if (clones.has(source)) return clones.get(source);
    const dir = path.join(scratch, source.replace('/', '__'));
    const url = base.replace(/\/+$/, '') + '/' + source;
    const filter = /^https?:/.test(url) ? ['--filter=blob:none'] : [];
    const res = run('git', ['clone', '--bare', '--quiet', ...filter, url, dir]);
    const result = res.status === 0 ? { dir } : { error: 'cannot clone ' + url + ': ' + res.stderr.toString().trim() };
    clones.set(source, result);
    return result;
  }
  return {
    // The default branch's head commit.
    head(source) {
      const c = clone(source);
      if (c.error) throw new Error(c.error);
      return gitIn(c.dir, ['rev-parse', 'HEAD']).toString().trim();
    },
    // The folder `folder` at commit `sha` as Map(relative path -> normalised Buffer).
    // `missing` is true when the commit itself is not in the source.
    tree(source, sha, folder) {
      const c = clone(source);
      if (c.error) throw new Error(c.error);
      if (run('git', ['-C', c.dir, 'cat-file', '-e', sha + '^{commit}']).status !== 0) return { missing: true, files: new Map() };
      const files = new Map();
      const list = gitIn(c.dir, ['ls-tree', '-r', '-z', sha, '--', folder + '/']).toString().split('\0').filter(Boolean);
      for (const item of list) {
        const [meta, file] = [item.slice(0, item.indexOf('\t')), item.slice(item.indexOf('\t') + 1)];
        const [, type, blob] = meta.split(' ');
        if (type !== 'blob') continue;
        files.set(file.slice(folder.length + 1), normalise(gitIn(c.dir, ['cat-file', 'blob', blob])));
      }
      return { missing: false, files };
    },
  };
}

// ---- classification

const isNotice = (r) => r === 'NOTICE.md';

function classify(root, e, src) {
  const pinned = src.tree(e.source, e.sha, e.path);
  if (pinned.missing) throw new Error('pinned commit ' + e.sha + ' is not in ' + e.source);
  const baseline = readDir(path.join(root, e.baseline));
  if (!same(baseline, pinned.files)) return { cls: 'baseline-corrupt' };
  const head = src.head(e.source);
  const upstream = head === e.sha ? pinned.files : src.tree(e.source, head, e.path).files;
  const local = readDir(path.join(root, e.skill), isNotice);
  const drift = !same(local, baseline);
  const update = !same(upstream, baseline);
  return { cls: drift && update ? 'both' : drift ? 'local-drift' : update ? 'update-available' : 'current', head, local, baseline, upstream };
}

function report(root, entries, src) {
  let errors = 0;
  for (const e of entries) {
    let cls;
    try { cls = classify(root, e, src).cls; } catch (err) {
      cls = 'error';
      errors++;
      console.error('ERROR: ' + e.skill + ': ' + err.message);
    }
    console.log(e.skill + ': ' + cls);
  }
  return errors ? 2 : 0;
}

// ---- merge

const eq = (a, b) => (a === undefined ? b === undefined : b !== undefined && a.equals(b));

function writeFile(file, buf) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
}

function removeFile(dir, rel) {
  fs.rmSync(path.join(dir, rel), { force: true });
  // drop folders the removal left empty, up to the copy's root
  for (let d = path.dirname(rel); d !== '.'; d = path.dirname(d)) {
    const full = path.join(dir, d);
    if (fs.readdirSync(full).length) break;
    fs.rmdirSync(full);
  }
}

// git merge-file on normalised text: { text, conflict }.
function mergeText(scratch, ours, base, theirs, labels) {
  const [a, o, b] = ['ours', 'base', 'theirs'].map((n) => path.join(scratch, n));
  fs.writeFileSync(a, ours); fs.writeFileSync(o, base || Buffer.alloc(0)); fs.writeFileSync(b, theirs);
  const res = run('git', ['merge-file', '-p', '-L', labels[0], '-L', labels[1], '-L', labels[2], a, o, b]);
  if (res.status < 0 || res.status > 127) throw new Error('git merge-file failed: ' + res.stderr.toString().trim());
  return { text: res.stdout, conflict: res.status !== 0 };
}

// Per file: an unchanged side takes the other; two changed sides merge as
// text. Deleted-or-binary against a change is a conflict that keeps the copy.
function merge(root, e, src, scratch) {
  const r = classify(root, e, src);
  if (r.cls === 'baseline-corrupt') throw new Error('baseline ' + e.baseline + ' differs from ' + e.source + ' at ' + e.sha + '; restore it before merging');
  if (r.cls !== 'update-available' && r.cls !== 'both') { console.log('RESULT: nothing-to-take'); return 0; }
  const copy = path.join(root, e.skill);
  const labels = [e.skill, e.baseline, e.source + '@' + r.head.slice(0, 12)];
  const files = [...new Set([...r.local.keys(), ...r.baseline.keys(), ...r.upstream.keys()])].sort();
  const conflicts = [];
  for (const f of files) {
    const [ours, base, theirs] = [r.local.get(f), r.baseline.get(f), r.upstream.get(f)];
    if (eq(theirs, base) || eq(ours, theirs)) continue;
    if (eq(ours, base)) {
      if (theirs === undefined) removeFile(copy, f); else writeFile(path.join(copy, f), theirs);
      console.log('MERGED: ' + f);
      continue;
    }
    if (ours === undefined || theirs === undefined || isBinary(ours) || isBinary(theirs) || (base && isBinary(base))) {
      console.error('CONFLICT: ' + f + ': ' + (ours === undefined ? 'deleted in the copy, changed in the source' : theirs === undefined ? 'changed in the copy, deleted in the source' : 'binary file changed on both sides') + '; the copy is left as it was');
      conflicts.push(f);
      continue;
    }
    const m = mergeText(scratch, ours, base, theirs, labels);
    writeFile(path.join(copy, f), m.text);
    if (m.conflict) conflicts.push(f); else console.log('MERGED: ' + f);
  }
  for (const f of conflicts) console.log('CONFLICT: ' + f);
  if (conflicts.length) { console.log('RESULT: conflict'); return 1; }

  // clean: the baseline, the pin and NOTICE.md move to the head together
  const baseDir = path.join(root, e.baseline);
  fs.rmSync(baseDir, { recursive: true, force: true });
  for (const [f, buf] of r.upstream) writeFile(path.join(baseDir, f), buf);
  const lockFile = path.join(root, lock.LOCK);
  const data = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
  data.skills.find((x) => x.skill === e.skill).sha = r.head;
  fs.writeFileSync(lockFile, JSON.stringify(data, null, 2) + '\n');
  const moved = Object.assign({}, e, { sha: r.head });
  const licence = path.join(root, e.licence);
  if (fs.existsSync(licence)) fs.writeFileSync(path.join(root, e.notice), renderNotice(moved, fs.readFileSync(licence, 'utf8')));
  else console.error('ERROR: no licence file ' + e.licence + '; run node scripts/vendor/notice.js once it exists');
  console.log('RESULT: clean');
  console.log('PIN: ' + r.head);
  return 0;
}

// ---- main

function main() {
  const o = options(process.argv.slice(2));
  if (o.help) { console.log(HELP); return 0; }
  const { exists, entries, errors } = lock.read(o.root);
  if (!exists && !o.merge) { console.error('no ' + lock.LOCK + ': nothing to report'); return 0; }
  if (errors.length) { for (const m of errors) console.error('ERROR: ' + lock.LOCK + ' ' + m); return 2; }
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'vendor-drift-'));
  try {
    const src = sources(o.base, scratch);
    if (!o.merge) return report(o.root, entries, src);
    const e = entries.find((x) => x.skill === o.merge.replace(/\\/g, '/').replace(/\/+$/, ''));
    if (!e) { console.error('ERROR: ' + o.merge + ' is not a skill in ' + lock.LOCK); return 2; }
    return merge(o.root, e, src, scratch);
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

if (require.main === module) {
  try { process.exitCode = main(); } catch (err) { console.error('ERROR: ' + err.message); process.exitCode = 2; }
}
