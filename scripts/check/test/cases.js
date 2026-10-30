'use strict';
// Fixture collection trees for the collection check. Add a case here; the
// runner (run.js) needs no change. Each case:
//   name:      what the case proves
//   files:     { 'repo/relative/path': content } written untracked
//   committed: same shape, written and committed before `files` (optional)
//   expect:    every finding the check must print, as '<fail|warn> <rule> <file>';
//              the exit code must be 1 when any 'fail' is expected, else 0.
//              Findings not listed fail the case, so a passing neighbour
//              proves the tree is clean.
// Build skills with skill() so every fixture starts from a skill that passes
// every rule; a ticket that adds a required field adds it there once.

const lines = (n, prefix) => Array.from({ length: n }, (_, i) => (prefix || 'line') + ' ' + (i + 1)).join('\n') + '\n';

// A SKILL.md that passes every rule. `fm` replaces or adds frontmatter lines
// (key -> raw text after "key:"), `body` replaces the body.
// The OpenCode gate (`metadata`) defaults to the value the gate writer
// generates from `disable-model-invocation`; a `null` fm value drops the line.
function skillMd(name, o) {
  o = o || {};
  const fm = Object.assign({ name: ' ' + name, description: ' Use when testing the collection check.' }, o.fm || {});
  if (!('metadata' in fm)) fm.metadata = '\n  opencode/autoinvoke: "' + !userInvoked(o) + '"';
  const head = Object.entries(fm).filter(([, v]) => v !== null).map(([k, v]) => k + ':' + v).join('\n');
  return '---\n' + head + '\n---\n\n' + (o.body !== undefined ? o.body : '# ' + name + '\n\nDo the work.\n');
}

const userInvoked = (o) => /^\s*true\s*$/.test((o.fm || {})['disable-model-invocation'] || '');

// skill('skills/core/alpha', { fm, body, files: { 'REF.md': '...' }, openai })
// -> files for one skill folder. `openai` replaces the generated Codex gate
// file agents/openai.yaml; `null` leaves it out.
function skill(dir, o) {
  o = o || {};
  const out = { [dir + '/SKILL.md']: skillMd(dir.split('/').pop(), o) };
  const openai = o.openai !== undefined ? o.openai : 'policy:\n  allow_implicit_invocation: ' + !userInvoked(o) + '\n';
  if (openai !== null) out[dir + '/agents/openai.yaml'] = openai;
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
  { name: 'SKILL.md files outside skills/ are not skills', files: skill('vendor/src/alpha', { body: 'Read [x](X.md).\n' }), expect: [] },

  // ---- line endings and BOM (every non-ignored text file) --------------------
  { name: 'CRLF in a text file fails', files: { 'README.md': '# x\r\nbody\r\n' }, expect: ['fail crlf-line-ending README.md'] },
  { name: 'LF neighbour passes', files: { 'README.md': '# x\nbody\n' }, expect: [] },
  { name: 'CRLF in a skill file fails', files: skill('skills/core/alpha', { body: '# alpha\r\n' }), expect: ['fail crlf-line-ending skills/core/alpha/SKILL.md'] },
  { name: 'a UTF-8 BOM fails', files: tree(skill('skills/core/alpha'), { 'notes.txt': '\uFEFFhello\n' }), expect: ['fail utf8-bom notes.txt'] },
  { name: 'a BOM on SKILL.md fails', files: tree(skill('skills/core/alpha'), { 'skills/core/alpha/SKILL.md': '\uFEFF' + skillMd('alpha') }), expect: ['fail utf8-bom skills/core/alpha/SKILL.md'] },
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
  { name: 'NOTICE.md needs no link', files: skill('skills/core/alpha', { files: { 'NOTICE.md': '# Notice\n' } }), expect: [] },
  { name: 'warnings alone exit zero', files: tree(skill('skills/core/alpha', { body: lines(501) }), skill('skills/core/beta', { files: { 'X.md': '# X\n' } })), expect: ['warn skill-body-length skills/core/alpha/SKILL.md', 'warn reference-unlinked skills/core/beta/X.md'] },

  // ---- harness gates (#99): generated from disable-model-invocation ---------
  { name: 'model-invoked gates that match pass', files: skill('skills/core/alpha'), expect: [] },
  { name: 'user-invoked gates that match pass', files: skill('skills/core/alpha', { fm: { 'disable-model-invocation': ' true' } }), expect: [] },
  { name: 'disable-model-invocation: false gates that match pass', files: skill('skills/core/alpha', { fm: { 'disable-model-invocation': ' false' } }), expect: [] },
  { name: 'a Codex gate mismatch fails', files: skill('skills/core/alpha', { fm: { 'disable-model-invocation': ' true' }, openai: 'policy:\n  allow_implicit_invocation: true\n' }), expect: ['fail harness-gates skills/core/alpha/agents/openai.yaml'] },
  { name: 'a Codex gate set implicit on a model-invoked skill fails', files: skill('skills/core/alpha', { openai: 'policy:\n  allow_implicit_invocation: false\n' }), expect: ['fail harness-gates skills/core/alpha/agents/openai.yaml'] },
  { name: 'a Codex gate beside other openai.yaml keys passes', files: skill('skills/core/alpha', { fm: { 'disable-model-invocation': ' true' }, openai: 'interface:\n  display_name: "Alpha"\npolicy:\n  # generated\n  allow_implicit_invocation: false # from SKILL.md\n' }), expect: [] },
  { name: 'a quoted Codex gate value fails', files: skill('skills/core/alpha', { openai: 'policy:\n  allow_implicit_invocation: "true"\n' }), expect: ['fail harness-gates skills/core/alpha/agents/openai.yaml'] },
  { name: 'a missing Codex gate file fails', files: skill('skills/core/alpha', { openai: null }), expect: ['fail harness-gates skills/core/alpha/agents/openai.yaml'] },
  { name: 'an openai.yaml without the Codex gate fails', files: skill('skills/core/alpha', { openai: 'interface:\n  display_name: "Alpha"\n' }), expect: ['fail harness-gates skills/core/alpha/agents/openai.yaml'] },
  { name: 'a Codex gate outside policy fails', files: skill('skills/core/alpha', { openai: 'interface:\n  allow_implicit_invocation: true\n' }), expect: ['fail harness-gates skills/core/alpha/agents/openai.yaml'] },
  { name: 'an OpenCode gate mismatch fails', files: skill('skills/core/alpha', { fm: { 'disable-model-invocation': ' true', metadata: '\n  opencode/autoinvoke: "true"' } }), expect: ['fail harness-gates skills/core/alpha/SKILL.md'] },
  { name: 'an OpenCode gate set off on a model-invoked skill fails', files: skill('skills/core/alpha', { fm: { metadata: '\n  opencode/autoinvoke: "false"' } }), expect: ['fail harness-gates skills/core/alpha/SKILL.md'] },
  { name: 'an OpenCode gate beside other metadata passes', files: skill('skills/core/alpha', { fm: { 'disable-model-invocation': ' true', metadata: '\n  audience: maintainers\n  "opencode/autoinvoke": "false"' } }), expect: [] },
  { name: 'an unquoted OpenCode gate value passes (OpenCode reads YAML booleans)', files: skill('skills/core/alpha', { fm: { metadata: '\n  opencode/autoinvoke: true' } }), expect: [] },
  { name: 'a missing OpenCode gate fails', files: skill('skills/core/alpha', { fm: { metadata: null } }), expect: ['fail harness-gates skills/core/alpha/SKILL.md'] },
  { name: 'metadata without the OpenCode gate fails', files: skill('skills/core/alpha', { fm: { metadata: '\n  audience: maintainers' } }), expect: ['fail harness-gates skills/core/alpha/SKILL.md'] },
  { name: 'an OpenCode gate outside metadata fails', files: skill('skills/core/alpha', { fm: { metadata: null, 'opencode/autoinvoke': ' "true"' } }), expect: ['fail harness-gates skills/core/alpha/SKILL.md'] },
  { name: 'an unreadable disable-model-invocation fails', files: skill('skills/core/alpha', { fm: { 'disable-model-invocation': ' yes' } }), expect: ['fail harness-gates skills/core/alpha/SKILL.md'] },
  { name: 'both gates wrong fail once each', files: skill('skills/packs/web/beta', { fm: { 'disable-model-invocation': ' true', metadata: null }, openai: null }), expect: ['fail harness-gates skills/packs/web/beta/SKILL.md', 'fail harness-gates skills/packs/web/beta/agents/openai.yaml'] },
];
