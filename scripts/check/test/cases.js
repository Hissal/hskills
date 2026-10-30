'use strict';
// Fixture collection trees for the collection check. Add a case here; the
// runner (run.js) needs no change. Each case:
//   name:      what the case proves
//   files:     { 'repo/relative/path': content } written untracked
//   committed: same shape, written and committed before `files` (optional)
//   before:    repository scripts run as `node <script> <fixture>` before the
//              check (optional); clean: true also requires they change no
//              committed file
//   expect:    every finding the check must print, as '<fail|warn> <rule> <file>';
//              the exit code must be 1 when any 'fail' is expected, else 0.
//              Findings not listed fail the case, so a passing neighbour
//              proves the tree is clean.
// Build skills with skill() so every fixture starts from a skill that passes
// every rule; a ticket that adds a required field adds it there once.

const lines = (n, prefix) => Array.from({ length: n }, (_, i) => (prefix || 'line') + ' ' + (i + 1)).join('\n') + '\n';

// A SKILL.md that passes every rule. `fm` replaces or adds frontmatter lines
// (key -> raw text after "key:"), `body` replaces the body.
function skillMd(name, o) {
  o = o || {};
  const fm = Object.assign({ name: ' ' + name, description: ' Use when testing the collection check.' }, o.fm || {});
  const head = Object.entries(fm).map(([k, v]) => k + ':' + v).join('\n');
  return '---\n' + head + '\n---\n\n' + (o.body !== undefined ? o.body : '# ' + name + '\n\nDo the work.\n');
}

// skill('skills/core/alpha', { fm, body, files: { 'REF.md': '...' } })
// -> files for one skill folder.
function skill(dir, o) {
  o = o || {};
  const out = { [dir + '/SKILL.md']: skillMd(dir.split('/').pop(), o) };
  for (const [f, content] of Object.entries(o.files || {})) out[dir + '/' + f] = content;
  return out;
}

const tree = (...parts) => Object.assign({}, ...parts);

module.exports = [
  // ---- the check itself ------------------------------------------------------
  { name: 'an empty tree passes', files: { 'README.md': '# x\n' }, expect: [] },
  { name: 'a new, unstaged skill is checked beside committed ones', committed: skill('skills/core/alpha'), files: skill('skills/core/beta', { body: 'Read [x](X.md).\n' }), expect: ['fail missing-file skills/core/beta/SKILL.md'] },
  { name: 'a committed skill is checked', committed: skill('skills/core/alpha', { body: 'Read [x](X.md).\n' }), expect: ['fail missing-file skills/core/alpha/SKILL.md'] },
  { name: 'ignored files are not checked', files: tree(skill('skills/core/alpha'), { '.gitignore': 'scratch/\n', 'scratch/a.txt': 'x\r\n' }, skill('scratch/skills/core/z', { body: 'Read [x](X.md).\n' })), expect: [] },
  { name: 'SKILL.md files outside skills/ are not skills', files: skill('docs/examples/alpha', { body: 'Read [x](X.md).\n' }), expect: [] },

  // ---- line endings and BOM (every non-ignored text file) --------------------
  { name: 'CRLF in a text file fails', files: { 'README.md': '# x\r\nbody\r\n' }, expect: ['fail crlf-line-ending README.md'] },
  { name: 'LF neighbour passes', files: { 'README.md': '# x\nbody\n' }, expect: [] },
  { name: 'CRLF in a skill file fails', files: skill('skills/core/alpha', { body: '# alpha\r\n' }), expect: ['fail crlf-line-ending skills/core/alpha/SKILL.md'] },
  { name: 'a UTF-8 BOM fails', files: tree(skill('skills/core/alpha'), { 'notes.txt': '\uFEFFhello\n' }), expect: ['fail utf8-bom notes.txt'] },
  { name: 'a BOM on SKILL.md fails', files: { 'skills/core/alpha/SKILL.md': '\uFEFF' + skillMd('alpha') }, expect: ['fail utf8-bom skills/core/alpha/SKILL.md'] },
  { name: 'binary files are skipped', files: { 'logo.png': Buffer.from([0xef, 0xbb, 0xbf, 0, 13, 10, 0]) }, expect: [] },

  // ---- frontmatter -----------------------------------------------------------
  { name: 'an unquoted ": " in description fails', files: skill('skills/core/alpha', { fm: { description: ' Use when: testing the check.' } }), expect: ['fail description-colon skills/core/alpha/SKILL.md'] },
  { name: 'an unquoted ": " on a description continuation line fails', files: skill('skills/packs/web/beta', { fm: { description: '\n  Use when testing\n  the check: always.' } }), expect: ['fail description-colon skills/packs/web/beta/SKILL.md'] },
  { name: 'a double-quoted description with ": " passes', files: skill('skills/core/alpha', { fm: { description: ' "Use when: testing the check."' } }), expect: [] },
  { name: 'a single-quoted description with ": " passes', files: skill('skills/core/alpha', { fm: { description: " 'Use when: testing the check.'" } }), expect: [] },
  { name: 'a block-scalar description with ": " passes', files: skill('skills/core/alpha', { fm: { description: ' >-\n  Use when: testing the check.' } }), expect: [] },
  { name: 'a ":" without a space passes', files: skill('skills/core/alpha', { fm: { description: ' Use for a:b mapping and https://example.com.' } }), expect: [] },
  { name: 'a ": " in another field is not this rule', files: skill('skills/core/alpha', { fm: { when_to_use: ' "When: x"' } }), expect: [] },

  // ---- files a skill names in its own folder ---------------------------------
  { name: 'a link to a missing file in the skill folder fails', files: skill('skills/core/alpha', { body: 'Read [the guide](GUIDE.md).\n' }), expect: ['fail missing-file skills/core/alpha/SKILL.md'] },
  { name: 'a link to an existing file passes', files: skill('skills/core/alpha', { body: 'Read [the guide](GUIDE.md#setup).\n', files: { 'GUIDE.md': '# Guide\n' } }), expect: [] },
  { name: 'a link to a missing script fails', files: skill('skills/core/alpha', { body: 'Run [detect](scripts/detect.js) first.\n' }), expect: ['fail missing-file skills/core/alpha/SKILL.md'] },
  { name: 'a link to an existing script and folder passes', files: skill('skills/core/alpha', { body: 'Run [detect](./scripts/detect.js); see [scripts](scripts/).\n', files: { 'scripts/detect.js': 'x\n' } }), expect: [] },
  { name: 'a reference definition to a missing file fails', files: skill('skills/core/alpha', { body: 'See [guide].\n\n[guide]: <GUIDE NOTES.md>\n' }), expect: ['fail missing-file skills/core/alpha/SKILL.md'] },
  { name: 'a reference linking a missing file fails', files: skill('skills/core/alpha', { body: 'Read [ref](REF.md).\n', files: { 'REF.md': '# Ref\n\nThen [more](sub/MORE.md).\n' } }), expect: ['fail missing-file skills/core/alpha/REF.md'] },
  { name: 'a link to an ignored file fails', files: tree(skill('skills/core/alpha', { body: 'Read [notes](NOTES.md).\n', files: { 'NOTES.md': '# n\n' } }), { '.gitignore': 'NOTES.md\n' }), expect: ['fail missing-file skills/core/alpha/SKILL.md'] },
  { name: 'URLs, anchors and code examples are not file names', files: skill('skills/core/alpha', { body: 'See [docs](https://example.com/x.md), [below](#below), `[x](MISSING.md)`.\n\n```md\n[x](ALSO-MISSING.md)\n```\n\n## below\n' }), expect: [] },
  { name: 'a link leaving the skill folder is not this rule', files: skill('skills/core/alpha', { body: 'See [other](../beta/SKILL.md).\n' }), expect: [] },

  // ---- warnings: size and disclosure -----------------------------------------
  { name: 'a SKILL.md body over 500 lines warns', files: skill('skills/core/alpha', { body: lines(501) }), expect: ['warn skill-body-length skills/core/alpha/SKILL.md'] },
  { name: 'a SKILL.md body of 500 lines passes', files: skill('skills/core/alpha', { body: lines(500) }), expect: [] },
  { name: 'a reference over 100 lines with no contents list warns', files: skill('skills/core/alpha', { body: 'Read [ref](REF.md).\n', files: { 'REF.md': '# Ref\n\n## One\n' + lines(98) } }), expect: ['warn reference-contents skills/core/alpha/REF.md'] },
  { name: 'a reference over 100 lines with a contents list passes', files: skill('skills/core/alpha', { body: 'Read [ref](REF.md).\n', files: { 'REF.md': '# Ref\n\n- [One](#one)\n- [Two](#two)\n\n## One\n' + lines(100) + '## Two\n' } }), expect: [] },
  { name: 'a contents list under a Contents heading passes', files: skill('skills/core/alpha', { body: 'Read [ref](REF.md).\n', files: { 'REF.md': '# Ref\n\n## Contents\n\n- One\n- Two\n\n## One\n' + lines(100) } }), expect: [] },
  { name: 'a reference of 100 lines needs no contents list', files: skill('skills/core/alpha', { body: 'Read [ref](REF.md).\n', files: { 'REF.md': '# Ref\n' + lines(99) } }), expect: [] },
  { name: 'a reference not linked from SKILL.md warns', files: skill('skills/core/alpha', { body: 'Read [a](A.md).\n', files: { 'A.md': 'See [b](B.md).\n', 'B.md': '# B\n' } }), expect: ['warn reference-unlinked skills/core/alpha/B.md'] },
  { name: 'a reference only named in a code span warns', files: skill('skills/core/alpha', { body: 'Read `REF.md`.\n', files: { 'REF.md': '# Ref\n' } }), expect: ['warn reference-unlinked skills/core/alpha/REF.md'] },
  { name: 'references in a subfolder linked from SKILL.md pass', files: skill('skills/core/alpha', { body: 'Read [a](references/A.md).\n', files: { 'references/A.md': '# A\n' } }), expect: [] },
  { name: 'warnings alone exit zero', files: tree(skill('skills/core/alpha', { body: lines(501) }), skill('skills/core/beta', { files: { 'X.md': '# X\n' } })), expect: ['warn skill-body-length skills/core/alpha/SKILL.md', 'warn reference-unlinked skills/core/beta/X.md'] },
];

// ---- copied skills (#102) -----------------------------------------------------
module.exports.push(...require('./vendoring-cases')({ skill, skillMd }));
