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
  node floor-guard.mjs --rules
  node floor-guard.mjs --help

Check (the default)
  Diffs the merge base of <ref> and HEAD against the working tree: commits,
  staged and unstaged changes and untracked files (ignored files are not
  read). With no --base, the first of ${BASES.join(', ')} that exists.
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
  The guard copy and its data file are not scanned as code; a copy edited
  since it was stamped is a violation (guard-edited).

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
  (missing|present|invalid). Exit 0, or 2 when it could not compare.

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
// An empty handler over several lines, read from the changed file itself so
// that one emptied by a deletion alone is found: a catch whose opening line
// ends in a brace, then only blank lines before a closing brace; or an except
// whose block holds nothing but pass.
const CATCH_OPEN = /\bcatch\b[^{}]*\{\s*$/;
const CLOSE = /^\s*\}/;
const EXCEPT_OPEN = /^(\s*)except\b[^:]*:\s*(?:#.*)?$/;
const PASS = /^\s*pass\s*(?:#.*)?$/;
const BLANK = /^\s*$/;

const LINE_RULES = ['suppression-added', 'unfinished-work', 'test-skipped', 'test-deleted', 'assertion-removed'];
const DATA_RULES = ['ratchet-loosened', 'pattern-removed', 'exception-added'];
const RULES = [...LINE_RULES, ...DATA_RULES, 'guard-edited'];

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
// through a throwaway index so the real one is never touched.
function readDiff(top, mergeBase) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'floor-guard-'));
  try {
    const index = path.join(tmp, 'index');
    const real = path.resolve(top, git(['rev-parse', '--git-path', 'index']).trim());
    if (fs.existsSync(real)) fs.copyFileSync(real, index);
    const env = Object.assign({}, process.env, { GIT_INDEX_FILE: index });
    git(['add', '-A', '--', '.'], { env });
    const tree = git(['write-tree'], { env }).trim();
    const diff = git(['-c', 'diff.relative=false', 'diff', '--cached', '-M', '--unified=0', '--no-color', '--no-ext-diff', '--no-textconv',
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
  for (const line of diff.split('\n')) {
    if (line.startsWith('diff --git ')) {
      cur = { old: null, new: null, added: [], removed: [], gaps: [] };
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
      const m = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
      oldLine = Number(m[1]);
      newLine = Number(m[2]);
      // A hunk that adds nothing removes lines after new line m[2].
      gap = m[3] === '0' ? { after: newLine, removed: [] } : null;
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
      cur.removed.push({ line: oldLine++, text: line.slice(1) });
      if (gap) gap.removed.push(line.slice(1));
    }
  }
  return files;
}

// The text of each path in a tree, by path; a path that is not a readable
// blob maps to null.
function readBlobs(tree, paths) {
  const out = new Map();
  if (!paths.length) return out;
  const r = spawnSync('git', ['cat-file', '--batch'], { input: paths.map((p) => tree + ':' + p).join('\n') + '\n', maxBuffer: 1 << 30 });
  if (r.error || r.status !== 0) throw new CannotRun('git cat-file failed: ' + (r.error ? r.error.message : String(r.stderr).trim().split('\n')[0]));
  const buf = r.stdout;
  let at = 0;
  for (const p of paths) {
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

// The empty handlers over several lines in a file's text, as 1-based
// { open, close } line spans; an except span also carries its indent, since
// its block has no closing line.
function emptyHandlers(text) {
  const src = text.split('\n').map((l) => l.replace(/\r$/, ''));
  const spans = [];
  src.forEach((l, i) => {
    if (CATCH_OPEN.test(l)) {
      let j = i + 1;
      while (j < src.length && BLANK.test(src[j])) j++;
      if (j < src.length && CLOSE.test(src[j])) spans.push({ open: i + 1, close: j + 1 });
      return;
    }
    const m = l.match(EXCEPT_OPEN);
    if (!m) return;
    let last = -1;
    let j = i + 1;
    for (; j < src.length; j++) {
      if (BLANK.test(src[j])) continue;
      if (src[j].match(/^\s*/)[0].length <= m[1].length) break;
      if (!PASS.test(src[j])) return;
      last = j;
    }
    if (last >= 0) spans.push({ open: i + 1, close: last + 1, indent: m[1].length });
  });
  return spans;
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
  const { body, stamp } = readGuard(SELF);
  if (stamp && sha256(body) !== stamp.hash) findings.push({ rule: 'guard-edited', at: selfRel || slash(SELF) });

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
  // A path holding a newline cannot be named to cat-file, so its empty
  // handlers over several lines go unread; single-line ones are still found.
  const blobs = readBlobs(tree, files.filter((f) => f.new !== null && !f.new.includes('\n') && (f.added.length || f.gaps.length)).map((f) => f.new));
  const deeper = (l, indent) => !BLANK.test(l) && l.match(/^\s*/)[0].length > indent;
  const removedFrom = (h, g) => g.after >= h.open && (g.after < h.close || (h.indent !== undefined && g.after === h.close && deeper(g.removed.find((l) => !BLANK.test(l)) || '', h.indent)));
  for (const f of files) {
    if (f.old !== null && isTest(f.old) && (f.new === null || !isTest(f.new))) lineFinding('test-deleted', f.old, f.old);
    if (f.new === null) continue;
    const addedText = new Map();
    f.added.forEach((a) => {
      addedText.set(a.text.trim(), (addedText.get(a.text.trim()) || 0) + 1);
      const at = f.new + ':' + a.line;
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
        if (f.added.some((a) => a.line >= h.open && a.line <= h.close) || f.gaps.some((g) => removedFrom(h, g))) lineFinding('unfinished-work', f.new, f.new + ':' + h.open);
      }
    }
    // A removed block-suppression end widens the block, unless a suppression
    // start went with it or the same end was added back.
    const ends = f.removed.filter((r) => any(re['suppression-end'], r.text));
    if (ends.length && !f.removed.some((r) => any(re.suppression, r.text) && !any(re['suppression-end'], r.text))) {
      const readded = new Map();
      for (const a of f.added) if (any(re['suppression-end'], a.text)) readded.set(a.text.trim(), (readded.get(a.text.trim()) || 0) + 1);
      for (const r of ends) {
        const left = readded.get(r.text.trim()) || 0;
        if (left > 0) { readded.set(r.text.trim(), left - 1); continue; }
        lineFinding('suppression-added', f.new, (f.old || f.new) + ':' + r.line);
      }
    }
    if (isTest(f.new)) {
      for (const r of f.removed) {
        if (!any(re.assertion, r.text)) continue;
        const left = addedText.get(r.text.trim()) || 0;
        if (left > 0) { addedText.set(r.text.trim(), left - 1); continue; }
        lineFinding('assertion-removed', f.new, (f.old || f.new) + ':' + r.line);
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

function printLoosens(file, state, out) {
  if (state === 'current' || state === 'missing') { out.push('UPDATE_LOOSENS: no'); return; }
  const lost = loosenedBy(file);
  if (lost === null) out.push('UPDATE_LOOSENS: unknown');
  else if (!lost.length) out.push('UPDATE_LOOSENS: no');
  else out.push('UPDATE_LOOSENS: yes', 'LOOSENED: ' + lost.join('; '));
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
  printLoosens(file, state, out);
  out.push('DATA: ' + slash(path.relative(process.cwd(), data)), 'DATA_STATE: ' + dataState(data));
  console.log(out.join('\n'));
  return 0;
}

function install(args) {
  const file = guardTarget(args.install);
  const rel = slash(path.relative(process.cwd(), file));
  const data = dataPathOf(file);
  const { state } = copyState(file);
  const out = ['GUARD: ' + rel];
  let result = state === 'missing' ? 'created' : state === 'current' ? 'unchanged' : args.replace ? 'replaced' : state;
  out.push('GUARD_STATE: ' + result);
  if (state !== 'missing' && state !== 'current') printLoosens(file, state, out);
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
