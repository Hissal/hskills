'use strict';
// The personal steering source (spec 2, #118) never points at nothing (#112).
// Checked against this repository: relative Markdown links, and each word of
// code (code spans and fenced blocks) that is a path under one of the
// repository's top-level folders, so a command running a removed script fails
// too. A skill command (`/name`, or Codex `$name`) fails when that skill was
// in the last release and no skill carries the name now; other commands may
// be harness built-ins. Other code (branch-name examples, paths in the
// project a session works in) is left alone.

const path = require('path');

const STEERING = 'steering.md';

// [{ word, line }] for every whitespace-separated word of code in the text
function codeWords(text) {
  const out = [];
  let fence = null;
  text.split(/\r?\n/).forEach((raw, i) => {
    const f = raw.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (f) { fence = fence === f[1][0] ? null : fence || f[1][0]; return; }
    const code = fence ? [raw] : [...raw.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    for (const span of code) for (const word of span.split(/\s+/)) if (word) out.push({ word, line: i + 1 });
  });
  return out;
}

// the repository path a word of code names, or null when it names none here
function repoPath(c, word) {
  const w = word.replace(/^["'(]+/, '').replace(/["'),.;:!?]+$/, '');
  if (!/^[\w.\/-]+$/.test(w) || !w.includes('/') || w.startsWith('/')) return null;
  const p = path.posix.normalize(w);
  const first = p.split('/')[0];
  return first !== '..' && first !== '.' && c.exists(first) && !c.files.includes(first) ? p : null;
}

module.exports = {
  id: 'steering-paths', level: 'fail',
  check(c) {
    if (!c.exists(STEERING)) return [];
    const missing = (target) => 'names ' + target + ', which does not exist; fix the steering text or restore it';
    const findings = c.links(STEERING).filter((l) => !c.exists(l.path))
      .map((l) => ({ file: STEERING, line: l.line, message: missing(l.target) }));
    const released = new Set((c.release ? c.release.skills : []).map((s) => path.posix.basename(s.dir)));
    const present = new Set(c.skills.map((s) => s.name));
    for (const { word, line } of codeWords(c.text(STEERING))) {
      const p = repoPath(c, word);
      if (p && !c.exists(p)) findings.push({ file: STEERING, line, message: missing(p) });
      const command = word.match(/^([/$])([a-z0-9]+(?:-[a-z0-9]+)*)[,.;:!?)]*$/);
      if (command && released.has(command[2]) && !present.has(command[2])) {
        findings.push({ file: STEERING, line, message: 'names the command ' + command[1] + command[2] + ', but that skill is gone since ' + c.release.tag + '; fix the steering text' });
      }
    }
    return findings;
  },
};
