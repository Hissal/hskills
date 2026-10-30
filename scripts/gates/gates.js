'use strict';
// Harness gates (#77, #99): whether a skill is model-invoked, as each harness
// reads it. `disable-model-invocation` in SKILL.md is the single source; the
// Codex and OpenCode gates are generated from it by write-gates.js and
// compared with it by the check's harness-gates rule. Both use this module,
// so they cannot disagree about what a gate says.
//
//   Claude Code: SKILL.md `disable-model-invocation: true` (the source)
//   Codex:       agents/openai.yaml `policy.allow_implicit_invocation: false`
//   OpenCode:    SKILL.md `metadata` `opencode/autoinvoke: "false"`
//
// There is no YAML parser here: gates are read and written as lines of a
// block mapping, and any other shape (a flow mapping such as `policy: {...}`)
// is reported, never rewritten.

const SOURCE = 'disable-model-invocation';
const WRITER = 'node scripts/gates/write-gates.js';
const CODEX_FILE = 'agents/openai.yaml';

const CODEX = { harness: 'Codex', parent: 'policy', key: 'allow_implicit_invocation' };
const OPENCODE = { harness: 'OpenCode', parent: 'metadata', key: 'opencode/autoinvoke' };

const stripComment = (v) => v.replace(/(^|\s+)#.*$/, '').trim();
const keyPattern = (key) => new RegExp('^(\\s*)(?:' + key.replace(/[/]/g, '\\/') + '|"' + key + '"|\'' + key + '\'):(.*)$');

// Values each harness reads as the gate. Codex deserialises a YAML boolean;
// OpenCode documents the quoted string as the portable form and also accepts
// a YAML boolean (pinned skills.mdx, see research/loading-mechanics.md).
CODEX.parse = (v) => ({ true: true, false: false })[v];
CODEX.format = (b) => String(b);
OPENCODE.parse = (v) => ({ true: true, false: false, '"true"': true, '"false"': false, "'true'": true, "'false'": false })[v];
OPENCODE.format = (b) => '"' + b + '"';

// The source: { userInvoked, line? } or { error, line }. `line` is the index
// into `fm` (frontmatter lines without the --- fences).
function source(fm) {
  const at = fm.findIndex((l) => l.startsWith(SOURCE + ':'));
  if (at < 0) return { userInvoked: false };
  const v = stripComment(fm[at].slice(SOURCE.length + 1));
  if (v === 'true') return { userInvoked: true, line: at };
  if (v === 'false') return { userInvoked: false, line: at };
  return { error: SOURCE + ' is "' + v + '"; set it to true or false', line: at };
}

// The model-invoked value each generated gate holds: Codex's
// allow_implicit_invocation and OpenCode's autoinvoke both say "the model may
// pick this skill", the inverse of disable-model-invocation.
const expected = (src) => !src.userInvoked;

// Finds `gate.key` directly under the top-level block `gate.parent` in
// `lines`. Returns { state, ... } with state one of:
//   'ok'       { value, line }          the gate, read
//   'invalid'  { raw, line }            the gate, with a value it cannot be
//   'flow'     { line }                 the parent is not a block mapping
//   'nokey'    { parentLine, end, indent }  the parent holds no gate
//   'noparent'                          no parent block
function find(lines, gate) {
  const p = lines.findIndex((l) => l.startsWith(gate.parent + ':'));
  if (p < 0) return { state: 'noparent' };
  if (stripComment(lines[p].slice(gate.parent.length + 1)) !== '') return { state: 'flow', line: p };
  let end = p + 1;
  while (end < lines.length && (lines[end].trim() === '' || /^\s/.test(lines[end]))) end++;
  const children = lines.slice(p + 1, end);
  const first = children.find((l) => l.trim() !== '' && !/^\s*#/.test(l));
  const indent = first ? first.match(/^\s*/)[0] : '  ';
  const re = keyPattern(gate.key);
  for (let i = p + 1; i < end; i++) {
    const m = lines[i].match(re);
    if (!m || m[1] !== indent) continue;
    const raw = stripComment(m[2]);
    const value = gate.parse(raw);
    return value === undefined ? { state: 'invalid', raw, line: i } : { state: 'ok', value, line: i };
  }
  // trailing blank lines stay after the block
  while (end > p + 1 && lines[end - 1].trim() === '') end--;
  return { state: 'nokey', parentLine: p, end, indent };
}

// Returns `lines` with the gate set to `value`, touching only the gate line
// (or adding it, and its parent block if absent). Throws on a shape it will
// not rewrite.
function set(lines, gate, value, where) {
  const f = find(lines, gate);
  const out = lines.slice();
  const formatted = gate.format(value);
  if (f.state === 'flow') throw new Error(where + ': `' + gate.parent + ':` is not a block mapping; rewrite it as one, then rerun');
  if (f.state === 'ok' || f.state === 'invalid') {
    const m = out[f.line].match(keyPattern(gate.key));
    const comment = (m[2].match(/\s+#.*$/) || [''])[0];
    out[f.line] = out[f.line].slice(0, out[f.line].length - m[2].length) + ' ' + formatted + comment;
  } else if (f.state === 'nokey') {
    out.splice(f.end, 0, f.indent + gate.key + ': ' + formatted);
  } else {
    out.push(gate.parent + ':', '  ' + gate.key + ': ' + formatted);
  }
  return out;
}

// Splits a whole file into { bom, eol, lines, final } so a rewrite keeps its
// BOM, line ending and final newline as they were.
function splitFile(text) {
  const bom = text.startsWith('﻿') ? '﻿' : '';
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const body = text.slice(bom.length);
  const final = body === '' || body.endsWith('\n');
  const lines = body.split(/\r?\n/);
  if (final) lines.pop();
  return { bom, eol, lines, final };
}
const joinFile = (f) => f.bom + f.lines.join(f.eol) + (f.final || !f.lines.length ? f.eol : '');

// The generated SKILL.md and agents/openai.yaml texts for one skill, from
// their current texts (`codexText` null when the file is absent). Only the
// two gate values change. Throws when SKILL.md has no frontmatter or its
// source is unreadable.
function generate(skillText, codexText, where) {
  const md = splitFile(skillText);
  const end = md.lines[0] === '---' ? md.lines.indexOf('---', 1) : -1;
  if (end < 0) throw new Error(where + ': SKILL.md has no frontmatter');
  const fm = md.lines.slice(1, end);
  const src = source(fm);
  if (src.error) throw new Error(where + ': ' + src.error);
  const value = expected(src);
  md.lines = [md.lines[0], ...set(fm, OPENCODE, value, where + ' SKILL.md'), ...md.lines.slice(end)];
  const cx = codexText === null ? { bom: '', eol: '\n', lines: [], final: true } : splitFile(codexText);
  cx.lines = set(cx.lines, CODEX, value, where + ' ' + CODEX_FILE);
  return { skillMd: joinFile(md), codex: joinFile(cx) };
}

module.exports = { SOURCE, WRITER, CODEX_FILE, CODEX, OPENCODE, source, expected, find, generate, splitFile };
