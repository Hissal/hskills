// Floor guard: fails a change that reaches green the cheap way.
// Run with --help for usage. Needs Node 18 or newer and git; nothing else.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const STAMP = /^\/\/ floor-guard stamp: version (\S+) sha256 ([0-9a-f]{64})\n/;
const BASES = ['origin/HEAD', 'origin/main', 'origin/master', 'main', 'master'];

const HELP = `floor-guard: fails a change that reaches green the cheap way.

Usage:
  node floor-guard.mjs [--base <ref>]          check the change
  node floor-guard.mjs --install <path.mjs> [--replace]
  node floor-guard.mjs --compare <path.mjs>
  node floor-guard.mjs --ratchet <name> <measured>
  node floor-guard.mjs --rules
  node floor-guard.mjs --help

Check (the default)
  Diffs the merge base of <ref> and HEAD against the working tree: commits,
  staged and unstaged changes and untracked files (ignored files are not
  read). Every changed file is read as text, whatever its attributes. With
  no --base, the first of ${BASES.join(', ')} that exists.
  Prints one "VIOLATION: <rule> <location>" line per finding, never the
  matched text. Exit 0 clean, 1 at least one violation, 2 could not run
  (not a git work tree, no merge base, an unreadable data file). Exit 2 is
  never a pass.

  Rules: ${'{RULES}'}

  The data file beside the guard (same name, .json) holds:
    ratchets    { "<name>": { "value": <number>, "better": "higher"|"lower" } }
    exceptions  [ { "id", "rule", "path" (glob), "reason", "owner", "expires" } ]
    patterns    { "<category>": [ "<regex>" ] }, extending the defaults;
                categories: ${'{CATEGORIES}'}
  It is compared with its state at the merge base. Tightening is silent:
  a ratchet moved the better way, a new ratchet or pattern, a removed
  exception. Loosening is a violation: a ratchet moved the worse way,
  flipped or removed, a removed pattern, a new or changed exception. An
  exception exempts its rule on its path only once it is in the merge base.
  The guard copy and its data file are not scanned as code; a copy in the
  work tree that was edited since it was stamped, or lost its stamp, is a
  violation (guard-edited).

--install <path.mjs>
  Copies this guard to <path.mjs>, stamped with its version and sha256, and
  creates the data file beside it when absent (never overwrites one).
  A copy that differs is left alone (exit 1) unless --replace is given.
  Prints GUARD, GUARD_STATE (created|unchanged|replaced|outdated|edited),
  UPDATE_LOOSENS, DATA, DATA_STATE (created|kept|invalid), VERSION and
  CHECK_COMMAND. Exit 0 done, 1 refused, 2 could not run.

--compare <path.mjs>
  Compares a copy with this guard. Prints GUARD, GUARD_STATE
  (missing|current|outdated|edited), COPY_VERSION, BUNDLED_VERSION,
  UPDATE_LOOSENS (no|yes|unknown), LOOSENED (when yes: each default rule
  or pattern the copy has and this guard lacks), DATA and DATA_STATE
  (missing|present|invalid). UPDATE_LOOSENS is no only when the update drops
  no rule or pattern and the copy is an unedited install of an older
  version; the same version with another body, a downgrade, an edited copy
  or a copy whose rules could not be read is unknown. Exit 0, or 2 when it
  could not compare.

--ratchet <name> <measured>
  Compares a value just measured with the value ratchets.<name> records in
  the data file beside this guard (the working tree's copy of it); <measured>
  is a plain number. Prints RATCHET, BETTER, RECORDED, MEASURED and
  RATCHET_STATE (held|improved|regressed). Held or improved exits 0;
  regressed prints "VIOLATION: ratchet-regressed <location>" and exits 1. A
  ratchet the data file does not record, a measurement that is not a plain
  number or no data file exits 2. It never writes the data file: record an
  improved value there yourself, which tightens the ratchet.

--rules
  Prints this guard's rules (RULE: <name>) and default patterns
  (PATTERN: <category> <regex>).
`;

// Default patterns, one regex source per line. The data file's patterns add
// to these; they never replace them.
const DEFAULT_PATTERNS = {
  suppression: [
    '(?:[Ll]int|[Cc]heck|[Ww]arning|[Ii]nspection|[Aa]naly[sz]er)s?[-_ :]*(?:disable|ignore|off|suppress)',
    '\\b(?:noqa|nolint|NOLINT(?:NEXTLINE)?|nosec|nosemgrep)\\b',
    '\\bNOSONAR\\b',
    '\\b(?:gitleaks|trufflehog):allow\\b',
    '@ts-(?:ignore|nocheck|expect-error)\\b',
    '#\\s*type:\\s*ignore\\b',
    '\\b(?:istanbul|c8|v8)\\s+ignore\\b',
    'pragma:\\s*no\\s*cover\\b',
    '\\b[Ss]tryker\\s+disable\\b',
    '\\bExcludeFromCodeCoverage\\b',
    '\\b[Ss]uppress(?:Message|Warnings|ions?)\\b',
    '\\b[Rr]e[Ss]harper\\s+disable\\b',
  ],
  // The end of a block suppression: deleting one, but not its start, widens
  // the suppression with a removal alone.
  'suppression-end': [
    '(?:[Ll]int|[Cc]heck|[Ww]arning|[Ii]nspection|[Aa]naly[sz]er)s?[-_ :]*(?:enable|restore)\\b',
    '\\bNOLINTEND\\b',
    '\\b(?:istanbul|c8|v8)\\s+ignore\\s+(?:stop|end)\\b',
    '\\b[Ss]tryker\\s+restore\\b',
    '\\b[Rr]e[Ss]harper\\s+restore\\b',
  ],
  stub: [
    '\\b[Nn]ot\\s+[Ii]mplemented\\b',
    '\\bNotImplemented(?:Error|Exception)?\\b',
    '\\bunimplemented!',
    '\\btodo!\\s*\\(',
    '\\b(?:TODO|FIXME)\\b',
    '\\bcatch\\b[^{}]*\\{\\s*\\}',
    '\\bexcept\\b[^:]*:\\s*pass\\b',
  ],
  skip: [
    '\\.(?:skip|only|todo)\\s*\\(',
    '\\b(?:xit|xdescribe|xtest|xcontext)\\s*\\(',
    '@(?:\\w+\\.)*(?:skip|skipIf|skipif|skipUnless)\\b',
    '\\bpytest\\.skip\\s*\\(',
    '@(?:Ignore|Disabled)\\b',
    '\\[\\s*(?:Ignore|Explicit)\\b',
    '\\bSkip\\s*=\\s*"',
    '\\.Skip(?:Now|f)?\\s*\\(',
    '\\b[Aa]ssert\\.(?:Pass|Ignore|Inconclusive)\\s*\\(',
  ],
  'test-file': [
    '(?:^|/)(?:tests?|__tests__|specs?)/',
    '\\.(?:test|spec)\\.[^/]+$',
    '_(?:test|spec)\\.[^/]+$',
    '(?:^|/)test_[^/]+$',
    '[a-z0-9](?:Tests?|Spec)\\.[^/]+$',
  ],
  assertion: [
    '\\b(?:[Aa]ssert\\w*|expect\\w*|[Ss]hould\\w*|[Vv]erify\\w*)\\s*[.(!]',
    '^\\s*assert\\s',
    '\\bt\\.(?:Error|Fatal)f?\\s*\\(',
    '\\brequire\\.\\w+\\s*\\(',
  ],
};
// An empty handler, read from the changed file itself so that one emptied by
// a deletion alone is found: a catch whose braces hold only whitespace and
// comments, wherever its lines break; or an except whose block holds nothing
// but pass and comments.
const EXCEPT_OPEN = /^(\s*)except\b[^:]*:\s*(?:#.*)?$/;
const PASS = /^\s*pass\s*(?:#.*)?$/;
const COMMENT = /^\s*#/;
const BLANK = /^\s*$/;

const LINE_RULES = ['suppression-added', 'unfinished-work', 'test-skipped', 'test-deleted', 'assertion-removed'];
const DATA_RULES = ['ratchet-loosened', 'pattern-removed', 'exception-added'];
const RULES = [...LINE_RULES, ...DATA_RULES, 'guard-edited', 'ratchet-regressed'];

class CannotRun extends Error {}

// ---- small helpers -------------------------------------------------------

function git(args, options = {}) {
  const r = spawnSync('git', ['-c', 'core.quotePath=false', ...args], { encoding: 'utf8', maxBuffer: 1 << 30, cwd: options.cwd, env: options.env });
  if (r.error) throw new CannotRun('git did not start: ' + r.error.message);
  if (r.status !== 0) {
    if (options.allowFail) return null;
    throw new CannotRun('git ' + args.filter((a, i) => a !== '-c' && args[i - 1] !== '-c')[0] + ' failed: ' + (r.stderr || '').trim().split('\n')[0]);
  }
  return r.stdout;
}

const lf = (text) => text.replace(/\r\n/g, '\n');
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const slash = (p) => p.split(path.sep).join('/');
// A path as printed: quoted when it holds a control character or a quote, so
// that each finding stays one line.
const shown = (p) => (/[\x00-\x1f\x7f"]/.test(p) ? JSON.stringify(p) : p);
const dataPathOf = (guard) => guard.replace(/\.[^./\\]*$/, '') + '.json';

// A guard file's body (without its stamp, LF line endings) and its stamp.
function readGuard(file) {
  const text = lf(fs.readFileSync(file, 'utf8'));
  const m = text.match(STAMP);
  return { body: m ? text.replace(STAMP, '') : text, stamp: m ? { version: m[1], hash: m[2] } : null };
}

function ownVersion() {
  try {
    const v = JSON.parse(fs.readFileSync(path.join(path.dirname(SELF), 'version.json'), 'utf8')).version;
    if (typeof v === 'string' && /^\S+$/.test(v)) return v;
  } catch { /* fall through to the stamp */ }
  const { stamp } = readGuard(SELF);
  return stamp ? stamp.version : 'unknown';
}

function unquote(p) {
  if (!p.startsWith('"')) return p;
  const bytes = [];
  const s = p.slice(1, -1);
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '\\') { bytes.push(...Buffer.from(s[i], 'utf8')); continue; }
    const next = s[++i];
    if (/[0-7]/.test(next)) { bytes.push(parseInt(s.slice(i, i + 3), 8)); i += 2; }
    else bytes.push({ n: 10, t: 9, r: 13, b: 8, f: 12, v: 11, a: 7 }[next] || next.charCodeAt(0));
  }
  return Buffer.from(bytes).toString('utf8');
}

function globRegex(glob) {
  let out = '';
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === '*' && glob[i + 1] === '*') {
      if (glob[i + 2] === '/') { out += '(?:.*/)?'; i += 2; } else { out += '.*'; i += 1; }
    } else if (ch === '*') out += '[^/]*';
    else if (ch === '?') out += '[^/]';
    else out += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + out + '$');
}

// Key order does not change what an entry means.
function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  return JSON.stringify(value);
}

// ---- the data file -------------------------------------------------------

function parseData(text, where) {
  if (text === null) return { ratchets: {}, exceptions: [], patterns: {} };
  let data;
  try { data = JSON.parse(text); } catch (e) { throw new CannotRun(where + ' is not JSON: ' + e.message); }
  const bad = (what) => { throw new CannotRun(where + ': ' + what); };
  if (!data || typeof data !== 'object' || Array.isArray(data)) bad('must be a JSON object');
  const ratchets = data.ratchets === undefined ? {} : data.ratchets;
  if (!ratchets || typeof ratchets !== 'object' || Array.isArray(ratchets)) bad('ratchets must be an object');
  for (const [name, r] of Object.entries(ratchets)) {
    if (!r || typeof r !== 'object' || typeof r.value !== 'number' || !Number.isFinite(r.value)) bad('ratchet ' + name + ' needs a number value');
    if (r.better !== 'higher' && r.better !== 'lower') bad('ratchet ' + name + ' needs better: "higher" or "lower"');
  }
  const exceptions = data.exceptions === undefined ? [] : data.exceptions;
  if (!Array.isArray(exceptions)) bad('exceptions must be an array');
  const ids = new Set();
  for (const x of exceptions) {
    if (!x || typeof x !== 'object' || typeof x.id !== 'string' || !x.id) bad('each exception needs an id');
    if (ids.has(x.id)) bad('exception id ' + x.id + ' appears twice');
    ids.add(x.id);
    if (!LINE_RULES.includes(x.rule)) bad('exception ' + x.id + ' needs a rule, one of ' + LINE_RULES.join(', '));
    if (typeof x.path !== 'string' || !x.path) bad('exception ' + x.id + ' needs a path glob');
  }
  const patterns = data.patterns === undefined ? {} : data.patterns;
  if (!patterns || typeof patterns !== 'object' || Array.isArray(patterns)) bad('patterns must be an object');
  for (const [category, list] of Object.entries(patterns)) {
    if (!(category in DEFAULT_PATTERNS)) bad('unknown pattern category ' + category);
    if (!Array.isArray(list) || list.some((p) => typeof p !== 'string')) bad('patterns.' + category + ' must be an array of strings');
    for (const p of list) {
      try { new RegExp(p); } catch { bad('a patterns.' + category + ' entry is not a valid regex'); }
    }
  }
  return { ratchets, exceptions, patterns };
}

function compareData(base, now, where) {
  const findings = [];
  for (const [name, was] of Object.entries(base.ratchets)) {
    const is = now.ratchets[name];
    const worse = !is || is.better !== was.better || (was.better === 'higher' ? is.value < was.value : is.value > was.value);
    if (worse) findings.push({ rule: 'ratchet-loosened', at: where + ' ratchets.' + name });
  }
  for (const [category, list] of Object.entries(base.patterns)) {
    const kept = now.patterns[category] || [];
    if (list.some((p) => !kept.includes(p))) findings.push({ rule: 'pattern-removed', at: where + ' patterns.' + category });
  }
  for (const x of now.exceptions) {
    const was = base.exceptions.find((b) => b.id === x.id);
    if (!was || canonical(was) !== canonical(x)) findings.push({ rule: 'exception-added', at: where + ' exceptions.' + x.id });
  }
  return findings;
}

// ---- the diff ------------------------------------------------------------

function resolveBase(explicit) {
  if (explicit) return explicit;
  for (const ref of BASES) if (git(['rev-parse', '--verify', '--quiet', ref + '^{commit}'], { allowFail: true }) !== null) return ref;
  throw new CannotRun('no base ref found (tried ' + BASES.join(', ') + '); pass --base <ref>');
}

// The merge base against the working tree, untracked files included, read
// through a throwaway index so the real one is never touched. Every file is
// diffed as text, so neither git's binary guess nor a -diff attribute leaves
// a changed file unread.
function readDiff(top, mergeBase) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'floor-guard-'));
  try {
    const index = path.join(tmp, 'index');
    const real = path.resolve(top, git(['rev-parse', '--git-path', 'index']).trim());
    // The copy keeps the index's mtime: git rereads a file changed in the
    // same instant the index was written only while the index looks that
    // old, so a fresh mtime would hide a same-size edit.
    if (fs.existsSync(real)) {
      fs.copyFileSync(real, index);
      const { atime, mtime } = fs.statSync(real);
      fs.utimesSync(index, atime, mtime);
    }
    const env = Object.assign({}, process.env, { GIT_INDEX_FILE: index });
    git(['add', '-A', '--', '.'], { env });
    const tree = git(['write-tree'], { env }).trim();
    const diff = git(['-c', 'diff.relative=false', 'diff', '--cached', '-M', '--unified=0', '--no-color', '--no-ext-diff', '--no-textconv', '--text',
      '--ignore-submodules', '--src-prefix=a/', '--dst-prefix=b/', mergeBase, '--'], { env });
    return { diff, tree };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function parseDiff(diff) {
  const files = [];
  let cur = null;
  let inHeader = false;
  let oldLine = 0;
  let newLine = 0;
  let gap = null;
  let at = 0;
  for (const line of diff.split('\n')) {
    if (line.startsWith('diff --git ')) {
      cur = { old: null, new: null, added: [], removed: [], gaps: [], hunks: [] };
      files.push(cur);
      gap = null;
      inHeader = true;
      const rest = line.slice(11);
      const half = (rest.length - 1) / 2;
      if (Number.isInteger(half) && rest[half] === ' ' && rest.slice(0, half).replace(/^"?a\//, '') === rest.slice(half + 1).replace(/^"?b\//, '')) {
        const p = unquote(rest.slice(0, half).replace(/^(")?a\//, '$1'));
        cur.old = p;
        cur.new = p;
      }
    } else if (!cur) continue;
    else if (line.startsWith('@@')) {
      inHeader = false;
      const m = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      oldLine = Number(m[1]);
      newLine = Number(m[3]);
      cur.hunks.push({ old: oldLine, oldCount: m[2] === undefined ? 1 : Number(m[2]), newCount: m[4] === undefined ? 1 : Number(m[4]) });
      // Where the hunk's removed lines sat, as the count of new lines before
      // them: a hunk lists its removed lines before its added ones.
      at = m[4] === '0' ? newLine : newLine - 1;
      // A hunk that adds nothing removes lines after its new start line.
      gap = m[4] === '0' ? { after: newLine, removed: [] } : null;
      if (gap) cur.gaps.push(gap);
    } else if (inHeader) {
      if (line.startsWith('new file mode')) cur.old = null;
      else if (line.startsWith('deleted file mode')) cur.new = null;
      else if (line.startsWith('rename from ')) cur.old = unquote(line.slice(12));
      else if (line.startsWith('rename to ')) cur.new = unquote(line.slice(10));
      else if (line.startsWith('--- ')) cur.old = line.slice(4) === '/dev/null' ? null : unquote(line.slice(4)).replace(/^a\//, '');
      else if (line.startsWith('+++ ')) cur.new = line.slice(4) === '/dev/null' ? null : unquote(line.slice(4)).replace(/^b\//, '');
    } else if (line.startsWith('+')) cur.added.push({ line: newLine++, text: line.slice(1) });
    else if (line.startsWith('-')) {
      cur.removed.push({ line: oldLine++, text: line.slice(1), at });
      if (gap) gap.removed.push(line.slice(1));
    }
  }
  return files;
}

// The text of each path in a tree, by path; a path that is not a readable
// blob maps to null. Blobs are named to cat-file by object id, found through
// ls-tree -z, so any path works, one holding a newline included.
function readBlobs(tree, paths) {
  const out = new Map();
  if (!paths.length) return out;
  const want = new Set(paths);
  const ids = new Map();
  for (const entry of git(['ls-tree', '-r', '-z', '--full-tree', tree]).split('\0')) {
    const tab = entry.indexOf('\t');
    const [, type, oid] = entry.slice(0, tab).split(' ');
    if (type === 'blob' && want.has(entry.slice(tab + 1))) ids.set(entry.slice(tab + 1), oid);
  }
  for (const p of paths) if (!ids.has(p)) out.set(p, null);
  const found = paths.filter((p) => ids.has(p));
  if (!found.length) return out;
  const r = spawnSync('git', ['cat-file', '--batch'], { input: found.map((p) => ids.get(p)).join('\n') + '\n', maxBuffer: 1 << 30 });
  if (r.error || r.status !== 0) throw new CannotRun('git cat-file failed: ' + (r.error ? r.error.message : String(r.stderr).trim().split('\n')[0]));
  const buf = r.stdout;
  let at = 0;
  for (const p of found) {
    const end = buf.indexOf(10, at);
    const header = buf.subarray(at, end).toString('utf8').split(' ');
    at = end + 1;
    if (header[1] !== 'blob') { out.set(p, null); continue; }
    const size = Number(header[2]);
    out.set(p, buf.subarray(at, at + size).toString('utf8'));
    at += size + 1;
  }
  return out;
}

// The index past whitespace and // or /* */ comments from s[i].
function skipTrivia(s, i) {
  for (;;) {
    while (i < s.length && /\s/.test(s[i])) i++;
    if (s.startsWith('//', i)) {
      const end = s.indexOf('\n', i);
      i = end < 0 ? s.length : end;
    } else if (s.startsWith('/*', i)) {
      const end = s.indexOf('*/', i + 2);
      i = end < 0 ? s.length : end + 2;
    } else return i;
  }
}

// The index past the balanced (...) group that opens at s[i], or -1.
function skipParens(s, i) {
  for (let depth = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')' && --depth === 0) return i + 1;
  }
  return -1;
}

// The empty handlers in a file's text, as 1-based { open, close } line spans;
// an except span also carries its indent, since its block has no closing line.
function emptyHandlers(text) {
  const spans = [];
  const starts = [0];
  for (let i = text.indexOf('\n'); i >= 0; i = text.indexOf('\n', i + 1)) starts.push(i + 1);
  const lineAt = (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid; else hi = mid - 1;
    }
    return lo + 1;
  };
  // catch, an optional (clause), an optional C# when (filter), then { }.
  for (const m of text.matchAll(/\bcatch\b/g)) {
    let i = skipTrivia(text, m.index + m[0].length);
    if (text[i] === '(') i = skipParens(text, i);
    if (i < 0) continue;
    i = skipTrivia(text, i);
    if (/^when\b/.test(text.slice(i, i + 5))) {
      i = skipTrivia(text, i + 4);
      if (text[i] !== '(' || (i = skipParens(text, i)) < 0) continue;
      i = skipTrivia(text, i);
    }
    if (text[i] !== '{') continue;
    const close = skipTrivia(text, i + 1);
    if (text[close] === '}') spans.push({ open: lineAt(m.index), close: lineAt(close) });
  }
  const src = text.split('\n').map((l) => l.replace(/\r$/, ''));
  src.forEach((l, i) => {
    const m = l.match(EXCEPT_OPEN);
    if (!m) return;
    // Comment lines count as blank, at any indent; one indented into the
    // block still extends the span.
    let last = -1;
    let passed = false;
    for (let j = i + 1; j < src.length; j++) {
      if (BLANK.test(src[j])) continue;
      const deeper = src[j].match(/^\s*/)[0].length > m[1].length;
      if (COMMENT.test(src[j])) { if (deeper) last = j; continue; }
      if (!deeper) break;
      if (!PASS.test(src[j])) return;
      passed = true;
      last = j;
    }
    if (passed) spans.push({ open: i + 1, close: last + 1, indent: m[1].length });
  });
  return spans;
}

// A taker over added lines: take(removed, fits) consumes one added line with
// the removed line's text, whitespace trimmed, that fits allows, and says
// whether it found one. Each added line is taken at most once.
function takeBack(added) {
  const byText = new Map();
  for (const a of added) {
    const key = a.text.trim();
    if (!byText.has(key)) byText.set(key, []);
    byText.get(key).push(a);
  }
  return (removed, fits = () => true) => {
    const list = byText.get(removed.text.trim()) || [];
    const i = list.findIndex(fits);
    if (i >= 0) list.splice(i, 1);
    return i >= 0;
  };
}

// The new line number of an old line the diff kept.
function newLineOf(f, oldLine) {
  let shift = 0;
  for (const h of f.hunks) {
    const before = h.oldCount === 0 ? h.old < oldLine : h.old + h.oldCount - 1 < oldLine;
    if (before) shift += h.newCount - h.oldCount;
  }
  return oldLine + shift;
}

// ---- check ---------------------------------------------------------------

function check(args) {
  const top = git(['rev-parse', '--show-toplevel'], { allowFail: true });
  if (top === null) throw new CannotRun('not inside a git work tree');
  const root = path.resolve(top.trim());
  process.chdir(root);
  const base = resolveBase(args.base);
  const mergeBase = git(['merge-base', base, 'HEAD'], { allowFail: true });
  if (mergeBase === null) throw new CannotRun('no merge base between ' + base + ' and HEAD (a shallow clone needs its full history)');
  const mb = mergeBase.trim();

  const inside = (abs) => { const r = path.relative(root, abs); return r && !r.startsWith('..') && !path.isAbsolute(r) ? slash(r) : null; };
  const selfRel = inside(SELF);
  const dataAbs = dataPathOf(SELF);
  const dataRel = inside(dataAbs);
  const where = dataRel || slash(dataAbs);
  const nowText = fs.existsSync(dataAbs) ? fs.readFileSync(dataAbs, 'utf8') : null;
  const now = parseData(nowText, 'the data file ' + where);
  const baseText = dataRel ? git(['show', mb + ':' + dataRel], { allowFail: true }) : nowText;
  const was = parseData(baseText, 'the data file ' + where + ' at the merge base');

  const findings = compareData(was, now, where);
  // A copy in the work tree must carry a stamp that matches it, so deleting
  // the stamp line is an edit too. A guard outside it (the bundled one, which
  // has no stamp) is not part of the change.
  const { body, stamp } = readGuard(SELF);
  if (stamp ? sha256(body) !== stamp.hash : selfRel !== null) findings.push({ rule: 'guard-edited', at: selfRel || slash(SELF) });

  const compile = (category) => [...new Set([...DEFAULT_PATTERNS[category], ...(was.patterns[category] || []), ...(now.patterns[category] || [])])].map((p) => new RegExp(p));
  const re = Object.fromEntries(Object.keys(DEFAULT_PATTERNS).map((c) => [c, compile(c)]));
  const any = (list, text) => list.some((r) => r.test(text));
  const isTest = (f) => f !== null && any(re['test-file'], f);
  // An exception counts only when the merge base already has it, unchanged.
  const exempt = was.exceptions.filter((x) => now.exceptions.some((y) => canonical(x) === canonical(y))).map((x) => ({ rule: x.rule, match: globRegex(x.path) }));
  const seen = new Set();
  const lineFinding = (rule, file, at) => {
    if (seen.has(rule + ' ' + at)) return;
    seen.add(rule + ' ' + at);
    if (!exempt.some((x) => x.rule === rule && x.match.test(file))) findings.push({ rule, at });
  };

  const { diff, tree } = readDiff(root, mb);
  const files = parseDiff(diff).filter((f) => ![selfRel, dataRel].includes(f.new || f.old));
  const blobs = readBlobs(tree, files.filter((f) => f.new !== null && (f.added.length || f.gaps.length)).map((f) => f.new));
  const isEnd = (text) => any(re['suppression-end'], text);
  const isStart = (text) => !isEnd(text) && any(re.suppression, text);
  const oldBlobs = readBlobs(mb, files.filter((f) => f.old !== null && f.new !== null && f.removed.some((r) => isEnd(r.text))).map((f) => f.old));
  const deeper = (l, indent) => !BLANK.test(l) && l.match(/^\s*/)[0].length > indent;
  const removedFrom = (h, g) => g.after >= h.open && (g.after < h.close || (h.indent !== undefined && g.after === h.close && deeper(g.removed.find((l) => !BLANK.test(l)) || '', h.indent)));
  for (const f of files) {
    if (f.old !== null && isTest(f.old) && (f.new === null || !isTest(f.new))) lineFinding('test-deleted', f.old, shown(f.old));
    if (f.new === null) continue;
    f.added.forEach((a) => {
      const at = shown(f.new) + ':' + a.line;
      if (any(re.suppression, a.text)) lineFinding('suppression-added', f.new, at);
      if (any(re.stub, a.text)) lineFinding('unfinished-work', f.new, at);
      if (isTest(f.new) && any(re.skip, a.text)) lineFinding('test-skipped', f.new, at);
    });
    // An empty handler the change made: one of its lines is added, or lines
    // were removed from inside it (for an except, also from just after its
    // last pass, when the first removed line sat inside its block).
    const text = blobs.get(f.new);
    if (text) {
      for (const h of emptyHandlers(text)) {
        if (f.added.some((a) => a.line >= h.open && a.line <= h.close) || f.gaps.some((g) => removedFrom(h, g))) lineFinding('unfinished-work', f.new, shown(f.new) + ':' + h.open);
      }
    }
    // A removed block-suppression end widens its block, unless the block's
    // starts went with it or the same end was added back no later. A block
    // is read from the old file: an end closes every suppression start since
    // the end before it, so a start removed from another block excuses
    // nothing.
    const ends = f.removed.filter((r) => isEnd(r.text));
    if (ends.length) {
      const removedLines = new Set(f.removed.map((r) => r.line));
      const addedLines = new Set(f.added.map((a) => a.line));
      const startsOf = new Map();
      let open = [];
      (oldBlobs.get(f.old) || '').split('\n').forEach((l, i) => {
        if (isEnd(l)) { startsOf.set(i + 1, open); open = []; } else if (isStart(l)) open.push(i + 1);
      });
      const takeEnd = takeBack(f.added.filter((a) => isEnd(a.text)));
      for (const r of ends) {
        const starts = startsOf.get(r.line) || [];
        if (starts.length && starts.every((s) => removedLines.has(s))) continue;
        const kept = starts.filter((s) => !removedLines.has(s)).map((s) => newLineOf(f, s));
        // Back after every kept start, and with only added lines, if any,
        // between the old place and the new one.
        const fits = (a) => kept.every((s) => s < a.line) && (a.line <= r.at + 1 || Array.from({ length: a.line - r.at - 1 }, (_, k) => r.at + 1 + k).every((l) => addedLines.has(l)));
        if (!takeEnd(r, fits)) lineFinding('suppression-added', f.new, shown(f.old || f.new) + ':' + r.line);
      }
    }
    if (isTest(f.new)) {
      const takeAssertion = takeBack(f.added);
      for (const r of f.removed) {
        if (!any(re.assertion, r.text)) continue;
        if (takeAssertion(r)) continue;
        lineFinding('assertion-removed', f.new, shown(f.old || f.new) + ':' + r.line);
      }
    }
  }

  const against = 'against ' + base + ' (merge base ' + mb.slice(0, 12) + ')';
  if (!findings.length) {
    console.log('floor-guard: clean ' + against);
    return 0;
  }
  console.log('floor-guard: ' + findings.length + ' violation(s) ' + against);
  for (const f of findings) console.log('VIOLATION: ' + f.rule + ' ' + f.at);
  console.log('Each lowers the bar. Fix the change, or ask the owner to decide; a floor exception goes in ' + where + '.');
  return 1;
}

// ---- install and compare -------------------------------------------------

function rulesOf(file) {
  const r = spawnSync(process.execPath, [file, '--rules'], { encoding: 'utf8' });
  if (r.status !== 0) return null;
  return r.stdout.split('\n').filter((l) => /^(RULE|PATTERN): /.test(l));
}

function ownRules() {
  return [...RULES.map((r) => 'RULE: ' + r), ...Object.entries(DEFAULT_PATTERNS).flatMap(([c, list]) => list.map((p) => 'PATTERN: ' + c + ' ' + p))];
}

// What replacing the copy with this guard would drop.
function loosenedBy(file) {
  const theirs = rulesOf(file);
  if (!theirs) return null;
  const mine = new Set(ownRules());
  return theirs.filter((l) => !mine.has(l)).map((l) => l.replace(/^RULE: /, 'rule ').replace(/^PATTERN: /, 'pattern '));
}

function copyState(file) {
  if (!fs.existsSync(file)) return { state: 'missing', version: 'none' };
  const copy = readGuard(file);
  const state = !copy.stamp || sha256(copy.body) !== copy.stamp.hash ? 'edited'
    : sha256(copy.body) === sha256(readGuard(SELF).body) ? 'current' : 'outdated';
  return { state, version: copy.stamp ? copy.stamp.version : 'none' };
}

function dataState(file) {
  if (!fs.existsSync(file)) return 'missing';
  try { parseData(fs.readFileSync(file, 'utf8'), file); return 'present'; } catch { return 'invalid'; }
}

// Whether release a is newer than release b, both MAJOR.MINOR.PATCH; any
// other form is never newer.
function newer(a, b) {
  const parse = (v) => (/^\d+\.\d+\.\d+$/.test(v) ? v.split('.').map(Number) : null);
  const x = parse(a);
  const y = parse(b);
  if (!x || !y) return false;
  const i = x.findIndex((n, k) => n !== y[k]);
  return i >= 0 && x[i] > y[i];
}

// The rule and pattern lists show only what an update drops, not a weaker
// check behind the same names. So "no" needs both: nothing dropped, and an
// unedited copy of an older release. The same version with another body,
// a downgrade or an edited copy is "unknown".
function printLoosens(file, state, version, out) {
  if (state === 'current' || state === 'missing') { out.push('UPDATE_LOOSENS: no'); return; }
  const lost = loosenedBy(file);
  if (lost && lost.length) out.push('UPDATE_LOOSENS: yes', 'LOOSENED: ' + lost.join('; '));
  else if (lost && state === 'outdated' && newer(ownVersion(), version)) out.push('UPDATE_LOOSENS: no');
  else out.push('UPDATE_LOOSENS: unknown');
}

function guardTarget(given) {
  if (!given.endsWith('.mjs')) throw new CannotRun('the copy path must end in .mjs, so Node runs it as a module in any project');
  return path.resolve(given);
}

function compare(args) {
  const file = guardTarget(args.compare);
  const { state, version } = copyState(file);
  const data = dataPathOf(file);
  const out = ['GUARD: ' + slash(path.relative(process.cwd(), file)), 'GUARD_STATE: ' + state, 'COPY_VERSION: ' + version, 'BUNDLED_VERSION: ' + ownVersion()];
  printLoosens(file, state, version, out);
  out.push('DATA: ' + slash(path.relative(process.cwd(), data)), 'DATA_STATE: ' + dataState(data));
  console.log(out.join('\n'));
  return 0;
}

function install(args) {
  const file = guardTarget(args.install);
  const rel = slash(path.relative(process.cwd(), file));
  const data = dataPathOf(file);
  const { state, version: copyVersion } = copyState(file);
  const out = ['GUARD: ' + rel];
  let result = state === 'missing' ? 'created' : state === 'current' ? 'unchanged' : args.replace ? 'replaced' : state;
  out.push('GUARD_STATE: ' + result);
  if (state !== 'missing' && state !== 'current') printLoosens(file, state, copyVersion, out);
  if (result === 'outdated' || result === 'edited') {
    out.push('Not replaced: the copy differs from this guard. Run --compare, then --install with --replace to refresh it.');
    console.log(out.join('\n'));
    return 1;
  }
  if (result !== 'unchanged') {
    const version = ownVersion();
    const body = readGuard(SELF).body;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '// floor-guard stamp: version ' + version + ' sha256 ' + sha256(body) + '\n' + body);
  }
  const dataRel = slash(path.relative(process.cwd(), data));
  let dstate = dataState(data);
  if (dstate === 'missing') {
    fs.writeFileSync(data, JSON.stringify({ ratchets: {}, exceptions: [], patterns: {} }, null, 2) + '\n');
    dstate = 'created';
  } else if (dstate === 'present') dstate = 'kept';
  out.push('DATA: ' + dataRel, 'DATA_STATE: ' + dstate, 'VERSION: ' + ownVersion(), 'CHECK_COMMAND: node ' + (/\s/.test(rel) ? JSON.stringify(rel) : rel));
  console.log(out.join('\n'));
  return 0;
}

// ---- ratchet -------------------------------------------------------------

// A measured value against the value its ratchet records in the data file.
function ratchet(args) {
  const file = dataPathOf(SELF);
  const where = slash(path.relative(process.cwd(), file));
  if (!fs.existsSync(file)) throw new CannotRun('no data file at ' + where + '; install the guard with --install first');
  const data = parseData(fs.readFileSync(file, 'utf8'), where);
  if (!Object.hasOwn(data.ratchets, args.ratchet)) throw new CannotRun(where + ' records no ratchet ' + args.ratchet + '; record a measured value there first');
  const recorded = data.ratchets[args.ratchet];
  if (!/^\s*[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?\s*$/.test(args.measured)) throw new CannotRun('the measurement for ' + args.ratchet + ' is not a plain number');
  const measured = Number(args.measured);
  if (!Number.isFinite(measured)) throw new CannotRun('the measurement for ' + args.ratchet + ' is not a finite number');
  const worse = recorded.better === 'higher' ? measured < recorded.value : measured > recorded.value;
  const better = recorded.better === 'higher' ? measured > recorded.value : measured < recorded.value;
  const out = ['RATCHET: ' + args.ratchet, 'BETTER: ' + recorded.better, 'RECORDED: ' + recorded.value, 'MEASURED: ' + measured,
    'RATCHET_STATE: ' + (worse ? 'regressed' : better ? 'improved' : 'held')];
  if (worse) out.push('VIOLATION: ratchet-regressed ' + where + ' ratchets.' + args.ratchet);
  console.log(out.join('\n'));
  return worse ? 1 : 0;
}

// ---- entry ---------------------------------------------------------------

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) throw new CannotRun(a + ' needs a value; see --help');
      return v;
    };
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--rules') args.rules = true;
    else if (a === '--replace') args.replace = true;
    else if (a === '--base') args.base = value();
    else if (a === '--install') args.install = value();
    else if (a === '--compare') args.compare = value();
    else if (a === '--ratchet') { args.ratchet = value(); args.measured = value(); }
    else throw new CannotRun('unknown argument ' + a + '; see --help');
  }
  return args;
}

function main(argv) {
  const args = parseArgs(argv);
  if (args.help) {
    console.log(HELP.replace('{RULES}', RULES.join(', ')).replace('{CATEGORIES}', Object.keys(DEFAULT_PATTERNS).join(', ')));
    return 0;
  }
  if (args.rules) { console.log(ownRules().join('\n')); return 0; }
  if (args.install) return install(args);
  if (args.compare) return compare(args);
  if (args.ratchet !== undefined) return ratchet(args);
  return check(args);
}

let code;
try {
  code = main(process.argv.slice(2));
} catch (e) {
  console.error('floor-guard: could not run: ' + (e instanceof CannotRun ? e.message : 'unexpected error: ' + (e && e.message)));
  code = 2;
}
process.exitCode = code;
