'use strict';
// The personal steering source (spec 2, #118) never points at nothing (#112).
// It is user-scope steering, linked into ~/.claude/CLAUDE.md and the global
// AGENTS.md and loaded in every project, so no path in it resolves against
// this repository: a relative or root-absolute Markdown link fails, because
// it breaks once loaded from there, and paths in code are left alone. A skill
// command (`/name` or Codex `$name`, optionally `<plugin>:`-qualified) fails
// when that skill was in any release and no skill carries the name now; other
// commands may be harness built-ins.

const { links } = require('../collection');

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

module.exports = {
  id: 'steering-paths', level: 'fail',
  check(c) {
    if (!c.exists(STEERING)) return [];
    const findings = links(c.text(STEERING), { rooted: true }).map((l) => ({ file: STEERING, line: l.line, message: 'links to ' + l.target + ' by a repository path, which breaks once steering loads from user scope; use an absolute URL' }));
    const released = c.releasedNames;
    const present = new Set(c.skills.map((s) => s.name));
    for (const { word, line } of codeWords(c.text(STEERING))) {
      const command = word.match(/^([/$](?:[a-z0-9]+(?:-[a-z0-9]+)*:)?)([a-z0-9]+(?:-[a-z0-9]+)*)[,.;:!?)]*$/);
      if (command && released.has(command[2]) && !present.has(command[2])) {
        findings.push({ file: STEERING, line, message: 'names the command ' + command[1] + command[2] + ', but that skill, last released in ' + released.get(command[2]) + ', is gone; fix the steering text' });
      }
    }
    return findings;
  },
};
