'use strict';
// Fixture collection trees for the collection check. Add a case here; the
// runner (run.js) needs no change. Each case:
//   name:      what the case proves
//   files:     { 'repo/relative/path': content } written untracked
//   committed: same shape, written and committed before `files` (optional)
//   before:    repository scripts run as `node <script> <fixture>` before the
//              check (optional); clean: true also requires they change no
//              committed file
//   history:   [{ files, tag? }] whole trees committed (and tagged) in order
//              before `committed`, which replaces the last one (optional)
//   expect:    every finding the check must print, as '<fail|warn> <rule> <file>';
//              the exit code must be 1 when any 'fail' is expected, else 0.
//              Findings not listed fail the case, so a passing neighbour
//              proves the tree is clean.
//   output:    regexes the check's other stdout lines (not findings) must
//              match one to one, in order (optional)
// Build skills with skill() so every fixture starts from a skill that passes
// every rule; a ticket that adds a required field adds it there once.

const lines = (n, prefix) => Array.from({ length: n }, (_, i) => (prefix || 'line') + ' ' + (i + 1)).join('\n') + '\n';

// A SKILL.md that passes every rule. `fm` replaces or adds frontmatter lines
// (key -> raw text after "key:"), `body` replaces the body.
// `gate` replaces the OpenCode gate line(s) appended to `metadata` (default:
// what the gate writer generates from `disable-model-invocation`); `null`
// leaves the gate out. A `null` fm value drops that frontmatter key.
function skillMd(name, o) {
  o = o || {};
  const fm = Object.assign({ name: ' ' + name, description: ' Use when testing the collection check.', metadata: '\n  agent-skills-sync.schema: "1"\n  agent-skills-sync.id: "hissal.skill-collection/' + name + '"' }, o.fm || {});
  const gate = o.gate !== undefined ? o.gate : '\n  opencode/autoinvoke: "' + !userInvoked(o) + '"';
  if (fm.metadata !== null && gate !== null) fm.metadata += gate;
  const head = Object.entries(fm).filter(([, v]) => v !== null).map(([k, v]) => k + ':' + v).join('\n');
  return '---\n' + head + '\n---\n\n' + (o.body !== undefined ? o.body : '# ' + name + '\n\nDo the work.\n');
}

const userInvoked = (o) => /^\s*true\s*(?:#.*)?$/.test((o.fm || {})['disable-model-invocation'] || '');

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

// A stand-in guard harness that prints `out` and exits with `code`.
const guard = (out, code) => ({ 'hooks/command-guard/test/run.js': 'console.log(' + JSON.stringify(out.join('\n')) + ');\nprocess.exit(' + code + ');\n' });

const releaseConfig = (extra) => JSON.stringify({ packages: { '.': {
  'release-type': 'simple', 'initial-version': '0.1.0',
  'bump-minor-pre-major': true, 'bump-patch-for-minor-pre-major': true,
  'include-component-in-tag': false, 'extra-files': extra,
} } });
const pluginPath = 'plugins/example/.codex-plugin/plugin.json';
const stamp = { type: 'json', path: pluginPath, jsonpath: '$.version' };

module.exports = [
  { name: 'release covers every plugin', files: {
    'release-please-config.json': releaseConfig([stamp]),
    [pluginPath]: '{"version":"0.1.0"}\n',
  }, expect: [] },
  { name: 'new plugin needs a release stamp', files: {
    'release-please-config.json': releaseConfig([]),
    [pluginPath]: '{"version":"0.1.0"}\n',
  }, expect: ['fail release-config ' + pluginPath] },

  // ---- the check itself ------------------------------------------------------
  ...[['bare', 'ID is not publisher-qualified'], ['another.publisher/alpha', "another publisher's ID"]].map(([id, message]) => ({ name: 'invalid ID diagnostic ' + id, files: skill('skills/core/alpha', { fm: { metadata: '\n  agent-skills-sync.schema: "1"\n  agent-skills-sync.id: "' + id + '"' } }), expect: ['fail skill-metadata skills/core/alpha/SKILL.md'], output: [message] })),
  { name: 'core guide resolves core skills', files: tree(skill('skills/core/guide', { body: '| Need | Target |\n|---|---|\n| Tests | `skill: alpha` |\n' }), skill('skills/core/alpha')), expect: [] },
  { name: 'core guide cannot resolve pack skills', files: tree(skill('skills/core/guide', { body: '| Need | Target |\n|---|---|\n| Tests | `skill: alpha` |\n' }), skill('skills/packs/web/alpha')), expect: ['fail guide-needs-target skills/core/guide/SKILL.md'] },
  { name: 'missing explicit own code path fails', files: skill('skills/core/alpha', { body: 'Read `./missing.md`.\n' }), expect: ['fail missing-file skills/core/alpha/SKILL.md'] },
  { name: 'missing path in bundled directory fails', files: skill('skills/core/alpha', { body: 'Read `scripts/missing.js`.\n', files: { 'scripts/present.js': '// present\n' } }), expect: ['fail missing-file skills/core/alpha/SKILL.md'] },
  { name: 'project code paths pass', files: skill('skills/core/alpha', { body: 'Edit `package.json`.\n' }), expect: [] },
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
  { name: 'warnings alone exit zero', files: tree(skill('skills/core/alpha', { body: lines(501) }), skill('skills/core/beta', { files: { 'X.md': '# X\n' } })), expect: ['warn skill-body-length skills/core/alpha/SKILL.md', 'warn reference-unlinked skills/core/beta/X.md'] },
  // ---- guide needs targets (#100) -------------------------------------------
  { name: 'a missing guide reference fails', files: skill('skills/packs/web/web-guide', { body: '## Needs\n\n| Need | Target |\n|---|---|\n| Testing | [Tests](TESTS.md) |\n' }), expect: ['fail missing-file skills/packs/web/web-guide/SKILL.md', 'fail guide-needs-target skills/packs/web/web-guide/SKILL.md'] },
  { name: 'guide needs resolve own files and same-pack skills and defer vendor guidance', files: tree(skill('skills/packs/web/web-guide', { body: '## Needs\n\n| Need | Target |\n|---|---|\n| Tests | [Tests](TESTS.md) |\n| Review | `skill: web-review` |\n| API | vendor-guidance: project-selected API documentation |\n', files: { 'TESTS.md': '# Tests\n' } }), skill('skills/packs/web/web-review')), expect: [] },
  { name: 'a guide cannot resolve a skill in another pack', files: tree(skill('skills/packs/web/web-guide', { body: '| Need | Target |\n|---|---|\n| Tests | `skill: test-review` |\n' }), skill('skills/packs/unity/test-review')), expect: ['fail guide-needs-target skills/packs/web/web-guide/SKILL.md'] },
  { name: 'a pack guide with routes cannot use paths', files: skill('skills/packs/web/web-guide', { fm: { paths: ' ["**/*.js"]' }, body: 'When routes are requested, read [routes](ROUTES.md).\n', files: { 'ROUTES.md': '| Situation | Invocation |\n|---|---|\n| Review web code | `/web-review` |\n' } }), expect: ['fail guide-routes-paths skills/packs/web/web-guide/SKILL.md'] },
  { name: 'a pack guide with routes and no paths passes', files: skill('skills/packs/web/web-guide', { body: 'When routes are requested, read [routes](ROUTES.md).\n', files: { 'ROUTES.md': '| Situation | Invocation |\n|---|---|\n| Review web code | `/web-review` |\n' } }), expect: [] },
  { name: 'paths on a guide without routes is outside this rule', files: skill('skills/packs/web/web-guide', { fm: { paths: ' ["**/*.js"]' } }), expect: [] },
  { name: 'generic advice is not a guide target', files: skill('skills/packs/web/web-guide', { body: '| Need | Target |\n|---|---|\n| Tests | Follow good practices |\n' }), expect: ['fail guide-needs-target skills/packs/web/web-guide/SKILL.md'] },
  { name: 'a directory is not a guide reference target', files: skill('skills/packs/web/web-guide', { body: '| Need | Target |\n|---|---|\n| Tests | [Tests](refs/) |\n\nRead [tests](refs/TESTS.md).\n', files: { 'refs/TESTS.md': '# Tests\n' } }), expect: ['fail guide-needs-target skills/packs/web/web-guide/SKILL.md'] },
  { name: 'a fenced needs table is only an example', files: skill('skills/packs/web/web-guide', { body: '```md\n| Need | Target |\n|---|---|\n| Tests | missing |\n```\n' }), expect: [] },

  // ---- the command guard harness (#91) ---------------------------------------
  // A fixture stands in for hooks/command-guard/test/run.js: a script that
  // prints the real harness's FAIL lines and summary and exits the same way.
  { name: 'a failing guard case fails the check', files: guard(['FAIL [bash/linux] expected allow, got reflection: "ls"', '     detail', 'FAIL fs: a second case', 'FAILED: 1 passed, 2 failed'], 1), expect: ['fail guard-cases hooks/command-guard/test/run.js', 'fail guard-cases hooks/command-guard/test/run.js'] },
  { name: 'a guard harness that exits non-zero without a FAIL line fails the check', files: guard(['TypeError: boom'], 1), expect: ['fail guard-cases hooks/command-guard/test/run.js'] },
  { name: 'a passing guard harness adds only a summary line', files: guard(['note: could not create a directory link; link cases skipped (EPERM)', 'ok: 2 passed, 0 failed'], 0), expect: [], output: [/^guard: ok: 2 passed, 0 failed$/, /^ok: /] },
  { name: 'a tree without the guard runs no harness', files: { 'README.md': '# x\n' }, expect: [], output: [/^ok: /] },
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
  { name: 'an OpenCode gate mismatch fails', files: skill('skills/core/alpha', { fm: { 'disable-model-invocation': ' true' }, gate: '\n  opencode/autoinvoke: "true"' }), expect: ['fail harness-gates skills/core/alpha/SKILL.md'] },
  { name: 'an OpenCode gate set off on a model-invoked skill fails', files: skill('skills/core/alpha', { gate: '\n  opencode/autoinvoke: "false"' }), expect: ['fail harness-gates skills/core/alpha/SKILL.md'] },
  { name: 'a quoted OpenCode gate key beside other metadata passes', files: skill('skills/core/alpha', { fm: { 'disable-model-invocation': ' true' }, gate: '\n  "opencode/autoinvoke": "false"\n  audience: maintainers' }), expect: [] },
  { name: 'an unquoted OpenCode gate value agrees but is not a metadata string', files: skill('skills/core/alpha', { gate: '\n  opencode/autoinvoke: true' }), expect: ['fail skill-metadata skills/core/alpha/SKILL.md'] },
  { name: 'a missing OpenCode gate fails', files: skill('skills/core/alpha', { gate: null }), expect: ['fail harness-gates skills/core/alpha/SKILL.md'] },
  { name: 'a missing metadata block fails the OpenCode gate', files: skill('skills/core/alpha', { fm: { metadata: null } }), expect: ['fail harness-gates skills/core/alpha/SKILL.md', 'fail skill-metadata skills/core/alpha/SKILL.md'] },
  { name: 'an OpenCode gate outside metadata fails', files: skill('skills/core/alpha', { gate: null, fm: { 'opencode/autoinvoke': ' "true"' } }), expect: ['fail harness-gates skills/core/alpha/SKILL.md'] },
  { name: 'an unreadable disable-model-invocation fails', files: skill('skills/core/alpha', { fm: { 'disable-model-invocation': ' yes' } }), expect: ['fail harness-gates skills/core/alpha/SKILL.md'] },
  { name: 'both gates wrong fail once each', files: skill('skills/packs/web/beta', { fm: { 'disable-model-invocation': ' true' }, gate: null, openai: null }), expect: ['fail harness-gates skills/packs/web/beta/SKILL.md', 'fail harness-gates skills/packs/web/beta/agents/openai.yaml'] },

  // ---- agnix on trial (#93): its findings warn, never fail ------------------
  // Stubbed unless `agnix: 'real'`; see run.js.
  { name: 'agnix errors and warnings print as warnings and exit zero', files: tree(skill('skills/core/alpha'), { 'AGENTS.md': '# a\n' }),
    agnix: { diagnostics: [{ level: 'error', rule: 'AS-004', file: 'skills/core/alpha/SKILL.md', line: 2, message: 'bad name' }, { level: 'warning', rule: 'XP-007', file: 'AGENTS.md', line: 1, message: 'too big' }] },
    expect: ['warn agnix skills/core/alpha/SKILL.md', 'warn agnix AGENTS.md'] },
  { name: 'agnix info diagnostics are not printed', files: skill('skills/core/alpha'),
    agnix: { diagnostics: [{ level: 'info', rule: 'AS-020', file: 'skills/core/alpha/SKILL.md', line: 3, message: 'advice' }] }, expect: [] },
  { name: 'agnix findings on files outside the collection are dropped', files: tree(skill('skills/core/alpha'), { '.gitignore': 'scratch/\n', 'scratch/x.md': '# x\n' }),
    agnix: { diagnostics: [{ level: 'error', rule: 'AS-004', file: 'scratch/x.md', line: 1, message: 'bad' }] }, expect: [] },
  { name: 'agnix not installed warns and exits zero', files: skill('skills/core/alpha'), agnix: 'missing', expect: ['warn agnix package.json'] },
  { name: 'an agnix version other than the pin warns', files: skill('skills/core/alpha'), agnix: { version: '0.0.1' }, expect: ['warn agnix package.json'] },
  { name: 'agnix output that is not JSON warns and exits zero', files: skill('skills/core/alpha'), agnix: { raw: 'thread panicked' }, expect: ['warn agnix package.json'] },
  { name: 'real agnix: a clean skill passes', files: skill('skills/core/alpha'), agnix: 'real', expect: [] },
  { name: 'real agnix: a fixable error warns and the skill is left as written', files: skill('skills/core/alpha', { fm: { name: ' Alpha_Bad' } }), agnix: 'real',
    expect: ['warn agnix skills/core/alpha/SKILL.md', 'warn agnix skills/core/alpha/SKILL.md'] },
  { name: 'real agnix: a Claude Code skill rule warns', files: skill('skills/core/alpha', { fm: { 'allowed-tools': ' Read, Bash' } }), agnix: 'real', expect: ['warn agnix skills/core/alpha/SKILL.md'] },
  { name: 'real agnix: wording-opinion PE rules are off', files: tree(skill('skills/core/alpha'), { 'CLAUDE.md': '# Project\n\nWrite clean code. Be helpful and accurate.\n\nNever use var.\n' }), agnix: 'real', expect: [] },
];

// ---- idle-cost tripwires (#92) ----------------------------------------------
module.exports.push({
  name: 'tripwire figures print even for an empty collection',
  files: {}, expect: [],
  output: ['TRIPWIRE core: 0 tokens', 'TRIPWIRE always-on: not measured (COLLECTION_ALWAYS_ON_PATH unset)'],
});
module.exports.push({
  name: 'core description and when_to_use cross 1000 tokens and only warn',
  files: skill('skills/core/alpha', { fm: { description: ' ' + 'x'.repeat(4000), when_to_use: ' yyyy' } }),
  expect: ['warn idle-cost skills/core'],
  output: ['TRIPWIRE core: 1001 tokens'],
});
module.exports.push({
  name: 'always-on text crossing 500 tokens warns and exits zero',
  alwaysOnPath: 'fixture-steering.txt',
  files: { 'fixture-steering.txt': 'x'.repeat(2001) },
  expect: ['warn idle-cost fixture-steering.txt'],
  output: ['TRIPWIRE always-on: 500.25 tokens'],
});
module.exports.push({
  name: 'pack costs aggregate within each pack and warn independently',
  files: tree(
    skill('skills/packs/web/alpha', { fm: { description: ' ' + 'x'.repeat(2000) } }),
    skill('skills/packs/web/beta', { fm: { description: ' ' + 'x'.repeat(2004) } }),
    skill('skills/packs/unity/gamma', { fm: { description: ' xxxx' } })),
  expect: ['warn idle-cost skills/packs/web'],
  output: ['TRIPWIRE pack/web: 1001 tokens', 'TRIPWIRE pack/unity: 1 tokens'],
});
module.exports.push({
  name: 'exact thresholds pass and user-invoked and external skills do not count',
  alwaysOnPath: 'fixture-steering.txt',
  files: tree(
    { 'fixture-steering.txt': 'x'.repeat(2000) },
    skill('skills/core/alpha', { fm: { description: ' "' + 'x'.repeat(3996) + '"', when_to_use: " 'yyyy'" } }),
    skill('skills/core/beta', { fm: { description: ' ' + 'x'.repeat(8000), 'disable-model-invocation': ' true # explicit gate' } }),
    skill('skills/packs/web/gamma', { fm: { description: ' >-\n  ' + 'x'.repeat(4000), 'disable-model-invocation': ' false' } }),
    skill('fixtures/skills/core/external', { fm: { description: ' ' + 'x'.repeat(8000) } }),
    skill('skills/packs/empty/delta', { fm: { description: ' ' + 'x'.repeat(8000), 'disable-model-invocation': ' true' } })),
  expect: [],
  output: ['TRIPWIRE core: 1000 tokens', 'TRIPWIRE pack/web: 1000 tokens', 'TRIPWIRE pack/empty: 0 tokens', 'TRIPWIRE always-on: 500 tokens'],
});
module.exports.push({
  name: 'an absent configured always-on source is not measured and passes',
  alwaysOnPath: 'missing-steering.txt', files: {}, expect: [],
  output: ['TRIPWIRE always-on: not measured (file absent from collection: missing-steering.txt)'],
});
// #95: identity metadata, exercised through the collection CLI.
module.exports.push({ name: 'missing schema fails', files: skill('skills/core/alpha', { fm: { metadata: '\n  agent-skills-sync.id: "hissal.skill-collection/alpha"' } }), expect: ['fail skill-metadata skills/core/alpha/SKILL.md'] });

// #95: metadata validation neighbours.
const metadata = (id, requires, schema) => '\n  agent-skills-sync.schema: ' + (schema === undefined ? '"1"' : schema) + '\n  agent-skills-sync.id: "' + id + '"' + (requires === undefined ? '' : '\n  agent-skills-sync.requires: ' + requires);
for (const [name, value] of [
  ['numeric schema', metadata('hissal.skill-collection/alpha', undefined, '1')],
  ['wrong schema', metadata('hissal.skill-collection/alpha', undefined, '"2"')],
  ['missing ID', '\n  agent-skills-sync.schema: "1"'],
  ['external ID', metadata('other/alpha')],
  ['non JSON requirements', metadata('hissal.skill-collection/alpha', "'broken'")],
  ['object requirements', metadata('hissal.skill-collection/alpha', "'{}'")],
  ['non string requirement', metadata('hissal.skill-collection/alpha', "'[1]'")],
  ['external requirement', metadata('hissal.skill-collection/alpha', "'[\"other/beta\"]'")],
  ['raw array requirements', metadata('hissal.skill-collection/alpha', '["hissal.skill-collection/beta"]')],
]) module.exports.push({ name: name + ' fails', files: skill('skills/core/alpha', { fm: { metadata: value } }), expect: ['fail skill-metadata skills/core/alpha/SKILL.md'] });
module.exports.push(
  { name: 'duplicate ID fails', files: tree(skill('skills/core/alpha'), skill('skills/core/beta', { fm: { metadata: metadata('hissal.skill-collection/alpha') } })), expect: ['fail skill-metadata skills/core/beta/SKILL.md'] },
  { name: 'renamed folder retains identity', files: skill('skills/packs/web/renamed', { fm: { metadata: metadata('hissal.skill-collection/original', "'[]'") } }), expect: [] },
  { name: 'empty requirement string passes', files: skill('skills/core/alpha', { fm: { metadata: metadata('hissal.skill-collection/alpha', "''") } }), expect: [] },
  { name: 'unresolved requirement fails', files: skill('skills/core/alpha', { fm: { metadata: metadata('hissal.skill-collection/alpha', "'[\"hissal.skill-collection/beta\"]'") }, body: 'Load hissal.skill-collection/beta.\n' }), expect: ['fail skill-requirements skills/core/alpha/SKILL.md'] },
  { name: 'requirements cross scope', files: tree(skill('skills/core/alpha', { fm: { metadata: metadata('hissal.skill-collection/alpha', "'[\"hissal.skill-collection/beta\"]'") }, body: 'Load hissal.skill-collection/beta.\n' }), skill('skills/packs/web/beta')), expect: [] }
);

const needing = (dir, id, requirements, body) => skill(dir, { fm: { metadata: metadata('hissal.skill-collection/' + id, "'" + JSON.stringify(requirements.map((r) => 'hissal.skill-collection/' + r)) + "'") }, body: (body === undefined ? 'Do the work.\n' : body) + requirements.map((r) => 'Load hissal.skill-collection/' + r + '.\n').join('') });
module.exports.push(
  { name: 'self cycle fails', files: needing('skills/core/alpha', 'alpha', ['alpha']), expect: ['fail skill-requirements skills/core/alpha/SKILL.md'] },
  { name: 'multi skill cycle fails', files: tree(needing('skills/core/alpha', 'alpha', ['beta']), needing('skills/packs/web/beta', 'beta', ['alpha'])), expect: ['fail skill-requirements skills/packs/web/beta/SKILL.md'] },
  { name: 'diamond requirements pass', files: tree(needing('skills/core/alpha', 'alpha', ['beta', 'gamma']), needing('skills/core/beta', 'beta', ['delta']), needing('skills/core/gamma', 'gamma', ['delta']), skill('skills/core/delta')), expect: [] },
  { name: 'missing required reference fails', files: tree(needing('skills/core/alpha', 'alpha', ['beta'], 'Read [reference](../../packs/web/beta/REF.md).\n'), skill('skills/packs/web/beta')), expect: ['fail requirement-reference skills/core/alpha/SKILL.md'] },
  { name: 'existing required reference passes', files: tree(needing('skills/core/alpha', 'alpha', ['beta'], 'Read [reference](../../packs/web/beta/REF.md).\n'), skill('skills/packs/web/beta', { body: 'Read [reference](REF.md).\n', files: { 'REF.md': '# Reference\n' } })), expect: [] }
);

// #98: runtime requirement IDs belong in the body, not only metadata.
module.exports.push({
  name: 'a requiring body missing one of two IDs fails',
  files: tree(skill('skills/core/alpha', { fm: { metadata: metadata('hissal.skill-collection/alpha', '\'["hissal.skill-collection/beta","hissal.skill-collection/gamma"]\'') }, body: 'Load hissal.skill-collection/beta.\n' }), skill('skills/core/beta'), skill('skills/core/gamma')),
  expect: ['fail requirement-body-id skills/core/alpha/SKILL.md'],
});

module.exports.push({
  name: 'a body naming every required ID passes without prescribed wording',
  files: tree(needing('skills/core/alpha', 'alpha', ['beta', 'gamma']), skill('skills/core/beta'), skill('skills/core/gamma')),
  expect: [],
});
// ---- copied skills (#102) -----------------------------------------------------
module.exports.push(...require('./vendoring-cases')({ skill, skillMd }));
// ---- generated dependency catalog (#96) ------------------------------------
module.exports.push(
  { name: 'stale dependency catalog fails', files: { 'catalog.json': '{}\n', 'docs/catalog.md': '# Catalog\n' }, expect: ['fail dependency-catalog docs/catalog.md'] },
  { name: 'fresh empty dependency catalog passes', files: { 'catalog.json': '{}\n', 'docs/catalog.md': '# Catalog\n\n<!-- BEGIN GENERATED DEPENDENCIES -->\n| Skill ID | Callable / source | Hard requirements |\n|---|---|---|\n<!-- END GENERATED DEPENDENCIES -->\n' }, expect: [] }
);
// #97: ID stability against the last release tag (v<version>).
const withId = (dir, id) => skill(dir, { fm: { metadata: metadata('hissal.skill-collection/' + id) } });
const released = tree(skill('skills/core/alpha'), skill('skills/core/beta'));
module.exports.push(
  { name: 'with no release tag the rule is silent', history: [{ files: released }], committed: skill('skills/core/alpha'), files: withId('skills/core/beta', 'gamma'), expect: [] },
  { name: 'a non-release tag is not a baseline', history: [{ files: released, tag: 'experiment' }], committed: skill('skills/core/alpha'), expect: [] },
  { name: 'an ID at the last release that is gone warns', history: [{ files: released, tag: 'v1.0.0' }], committed: skill('skills/core/alpha'), expect: ['warn id-stability skills/core/beta/SKILL.md'] },
  { name: 'a folder now carrying a different ID warns', history: [{ files: released, tag: 'v1.0.0' }], committed: tree(skill('skills/core/alpha'), withId('skills/core/beta', 'gamma')), expect: ['warn id-stability skills/core/beta/SKILL.md'] },
  { name: 'an uncommitted ID change warns', history: [{ files: released, tag: 'v1.0.0' }], committed: released, files: withId('skills/core/alpha', 'gamma'), expect: ['warn id-stability skills/core/alpha/SKILL.md'] },
  { name: 'a moved skill keeping its ID passes', history: [{ files: released, tag: 'v1.0.0' }], committed: tree(skill('skills/core/alpha'), withId('skills/packs/web/beta', 'beta')), expect: [] },
  { name: 'a renamed skill keeping its ID passes', history: [{ files: released, tag: 'v1.0.0' }], committed: tree(skill('skills/core/alpha'), withId('skills/core/renamed', 'beta')), expect: [] },
  { name: 'a skill added since the release passes', history: [{ files: released, tag: 'v1.0.0' }], committed: tree(released, skill('skills/core/gamma')), expect: [] },
  { name: 'the latest release tag is the baseline', history: [{ files: released, tag: 'v1.0.0' }, { files: skill('skills/core/alpha'), tag: 'v1.1.0' }], committed: skill('skills/core/alpha'), expect: [] },
  { name: 'an ID warning alone exits zero', history: [{ files: released, tag: 'v1.0.0' }], committed: tree(withId('skills/core/alpha', 'beta'), withId('skills/core/beta', 'alpha')), expect: ['warn id-stability skills/core/alpha/SKILL.md', 'warn id-stability skills/core/beta/SKILL.md'] }
);
// ---- copied file safety (#103) ----------------------------------------------
module.exports.push(...require('./copied-safety-cases')({ skill, skillMd }));
module.exports.push(...require('./manifest-policy-cases')({ skill, tree }));

// #101: the automatic guide (the onboarding pack's skill) matches the core
// guide (skills/core/guide) outside frontmatter.
const coreGuide = (o) => skill('skills/core/guide', Object.assign({ fm: { 'disable-model-invocation': ' true' }, body: '# Guide\n\nRead [support](SUPPORT.md).\n', files: { 'SUPPORT.md': '# Support\n' } }, o));
const autoGuide = (o) => skill('skills/packs/onboarding/auto-guide', Object.assign({ fm: { description: ' Use at the start of a task to suggest a workflow.' }, body: '# Guide\n\nRead [support](SUPPORT.md).\n', files: { 'SUPPORT.md': '# Support\n' } }, o));
module.exports.push(
  { name: 'an automatic guide body differing from the core guide fails', files: tree(coreGuide(), autoGuide({ body: '# Guide\n\nRead [support](SUPPORT.md) first.\n' })), expect: ['fail automatic-guide-sync skills/packs/onboarding/auto-guide/SKILL.md'] },
  { name: 'an automatic guide differing only in frontmatter and description passes', files: tree(coreGuide(), autoGuide()), expect: [] },
  { name: 'an automatic guide without a core guide is silent', files: autoGuide({ body: '# Other\n', files: {} }), expect: [] },
  { name: 'a core guide without an automatic guide is silent', files: tree(coreGuide(), skill('skills/packs/web/web-review')), expect: [] },
  { name: 'an automatic guide bundled file differing from the core guide fails', files: tree(coreGuide(), autoGuide({ files: { 'SUPPORT.md': '# Support\n\nEdited.\n' } })), expect: ['fail automatic-guide-sync skills/packs/onboarding/auto-guide/SUPPORT.md'] },
  { name: 'an automatic guide missing a core guide file fails', files: tree(coreGuide({ body: '# Guide\n\nRead [support](SUPPORT.md) and [more](refs/MORE.md).\n', files: { 'SUPPORT.md': '# Support\n', 'refs/MORE.md': '# More\n' } }), autoGuide({ body: '# Guide\n\nRead [support](SUPPORT.md) and [more](refs/MORE.md).\n', files: { 'SUPPORT.md': '# Support\n' } })), expect: ['fail missing-file skills/packs/onboarding/auto-guide/SKILL.md', 'fail automatic-guide-sync skills/packs/onboarding/auto-guide/SKILL.md'] },
  { name: 'guides differing only in frontmatter and gate files pass', files: tree(coreGuide(), autoGuide({ openai: 'interface:\n  display_name: "Guide"\npolicy:\n  allow_implicit_invocation: true\n' })), expect: [] },
  { name: 'a stale automatic guide gate fails harness-gates, not the sync', files: tree(coreGuide(), autoGuide({ openai: 'policy:\n  allow_implicit_invocation: false\n' })), expect: ['fail harness-gates skills/packs/onboarding/auto-guide/agents/openai.yaml'] },
  { name: 'an automatic guide with an extra file fails', files: tree(coreGuide(), autoGuide({ files: { 'SUPPORT.md': '# Support\n', 'scripts/extra.js': 'x\n' } })), expect: ['fail automatic-guide-sync skills/packs/onboarding/auto-guide/scripts/extra.js'] }
);

// #114: the manifest's data contract, independent of membership policy (#110).
module.exports.push({
  name: 'a manifest with invalid JSON fails',
  files: { 'collection.json': '{' },
  expect: ['fail collection-manifest collection.json'],
});
for (const data of [
  null, [], {}, { core: [], packs: {}, expensive: [], requires: [] },
  { core: 'alpha', packs: {}, expensive: [] },
  { core: [], packs: [], expensive: [] },
  { core: [], packs: { web: 'alpha' }, expensive: [] },
  { core: [], packs: { 'Bad Pack': [] }, expensive: [] },
  { core: [], packs: {}, expensive: [7] },
  { core: ['../alpha'], packs: {}, expensive: [] },
  { core: ['skills/core/alpha/'], packs: {}, expensive: [] },
]) module.exports.push({
  name: 'a manifest outside its documented shape fails: ' + JSON.stringify(data),
  files: { 'collection.json': JSON.stringify(data) },
  expect: ['fail collection-manifest collection.json'],
});
module.exports.push({
  name: 'an empty manifest passes before skills are authored',
  files: { 'collection.json': '{"core":[],"packs":{},"expensive":[]}' },
  expect: [],
});
for (const data of [
  { core: ['skills/core/missing'], packs: {}, expensive: [] },
  { core: [], packs: { web: ['skills/packs/web/missing'] }, expensive: [] },
  { core: [], packs: {}, expensive: ['skills/core/missing'] },
]) module.exports.push({
  name: 'a manifest entry must name a skill in the tree: ' + JSON.stringify(data),
  files: { 'collection.json': JSON.stringify(data) },
  expect: ['fail collection-manifest collection.json'],
});
module.exports.push({
  name: 'a manifest names core, pack and expensive skills',
  files: tree(skill('skills/core/alpha', { fm: { 'disable-model-invocation': ' true' } }), skill('skills/packs/onboarding/beta'), {
    'collection.json': JSON.stringify({
      core: ['skills/core/alpha'],
      packs: { onboarding: ['skills/packs/onboarding/beta'] },
      expensive: ['skills/core/alpha'],
    }),
  }),
  expect: [],
});

for (const [name, body, expect] of [
  ['passing', 'console.log("1 install cases, 0 failures");', []],
  ['case failure', 'console.log("FAIL fixture"); process.exitCode = 1;', ['fail install-cases scripts/install/test/run.js']],
  ['crash', 'throw new Error("fixture");', ['fail install-cases scripts/install/test/run.js']],
]) module.exports.push({
  name: 'collection check runs install harness: ' + name,
  files: { 'scripts/install/test/run.js': body },
  expect,
});
module.exports.push({
  name: 'an installer without its case harness fails the collection check',
  files: { 'scripts/install/install.js': '// fixture installer' },
  expect: ['fail install-cases scripts/install/test/run.js'],
});
// ---- release versions and steering paths (#112) ------------------------------
module.exports.push(...require('./release-steering-cases')({ skill }));
