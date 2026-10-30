'use strict';
// Loads a collection tree into the read-only view every rule receives.
// Files are the working tree's tracked and untracked, non-ignored files, so a
// new skill is checked before it is staged. Paths are repository-relative with
// forward slashes on every platform.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const BOM = '\uFEFF';
// Markdown files in a skill folder that are not references: the entry point,
// and the generated licence notice (#77, owner answer 1).
const NOT_REFERENCES = new Set(['SKILL.md', 'NOTICE.md']);

function listFiles(root) {
  const ls = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' });
  if (ls.status !== 0) throw new Error('git ls-files failed in ' + root + ': ' + (ls.stderr || '').trim());
  // dropped: files deleted from the working tree, symlinks, submodules
  return ls.stdout.split('\0').filter((f) => {
    if (!f) return false;
    try { return fs.lstatSync(path.join(root, f)).isFile(); } catch (e) { return false; }
  }).sort();
}

// Splits a Markdown file into frontmatter lines and body. `bodyLine` is the
// 1-based line number where the body starts; `fmLine` that of the first
// frontmatter line. A BOM or CRLF does not stop the split (their own rules
// report them), so other rules still see the skill.
function splitFrontmatter(text) {
  const lines = text.replace(BOM, '').split(/\r?\n/);
  if (lines[0] !== '---') return { frontmatter: null, body: lines, bodyLine: 1 };
  const end = lines.indexOf('---', 1);
  if (end < 0) return { frontmatter: null, body: lines, bodyLine: 1 };
  return { frontmatter: lines.slice(1, end), fmLine: 2, body: lines.slice(end + 1), bodyLine: end + 2 };
}

// Relative Markdown link targets in a file: inline links, images and
// reference definitions. Fenced code blocks and code spans are skipped, so
// examples never count. URLs, absolute paths and in-page anchors are dropped;
// `#anchor` and `?query` are stripped. Returns [{ target, line }].
function links(text) {
  const out = [];
  let fence = null;
  text.split(/\r?\n/).forEach((raw, i) => {
    const f = raw.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      return;
    }
    if (fence) return;
    const line = raw.replace(/`[^`]*`/g, '');
    const found = [];
    for (const m of line.matchAll(/\]\(\s*(<[^>]*>|[^)\s]+)[^)]*\)/g)) found.push(m[1]);
    const def = line.match(/^\s{0,3}\[[^\]]+\]:\s*(<[^>]*>|\S+)/);
    if (def) found.push(def[1]);
    for (let t of found) {
      t = t.replace(/^<|>$/g, '').replace(/[#?].*$/, '');
      if (!t || /^[a-z][a-z0-9+.-]*:/i.test(t) || t.startsWith('/') || t.startsWith('\\')) continue;
      try { t = decodeURIComponent(t); } catch (e) { /* keep as written */ }
      out.push({ target: t, line: i + 1 });
    }
  });
  return out;
}

function load(root) {
  const files = listFiles(root);
  const known = new Set(files);
  for (const f of files) for (let d = path.posix.dirname(f); d !== '.'; d = path.posix.dirname(d)) known.add(d);
  const cache = new Map();
  const bytes = (file) => {
    if (!cache.has(file)) cache.set(file, fs.readFileSync(path.join(root, file)));
    return cache.get(file);
  };
  const isText = (file) => !bytes(file).includes(0);
  const text = (file) => bytes(file).toString('utf8');

  // A skill is a folder under skills/ holding a SKILL.md (layout: #18).
  const skills = files.filter((f) => /^skills\/(.+\/)?SKILL\.md$/.test(f)).map((skillMd) => {
    const dir = path.posix.dirname(skillMd);
    const own = files.filter((f) => f.startsWith(dir + '/'));
    return Object.assign({ dir, name: path.posix.basename(dir), skillMd, files: own }, splitFrontmatter(text(skillMd)));
  });

  return {
    root,
    files,
    skills,
    bytes,
    text,
    isText,
    // true when `file` (repository-relative) is in the collection: a listed
    // file, or a folder holding one
    exists: (file) => known.has(file.replace(/\/$/, '')),
    // a skill's reference files: its Markdown files other than NOT_REFERENCES
    references: (s) => s.files.filter((f) => f.endsWith('.md') && !NOT_REFERENCES.has(f.slice(s.dir.length + 1))),
    // a file's relative links resolved to repository-relative paths
    links: (file) => links(text(file)).map((l) => Object.assign(l, { path: path.posix.normalize(path.posix.join(path.posix.dirname(file), l.target.replace(/\\/g, '/'))) })),
  };
}

module.exports = { load, splitFrontmatter, links };
