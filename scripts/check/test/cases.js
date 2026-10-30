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
//   output:    regexes the check's other stdout lines (not findings) must
//              match one to one, in order (optional)
// Build skills with skill() so every fixture starts from a skill that passes
// every rule; a ticket that adds a required field adds it there once.

const lines = (n, prefix) => Array.from({ length: n }, (_, i) => (prefix || 'line') + ' ' + (i + 1)).join('\n') + '\n';

// A SKILL.md that passes every rule. `fm` replaces or adds frontmatter lines
// (key -> raw text after "key:"), `body` replaces the body.
function skillMd(name, o) {
  o = o || {};
  const fm = Object.assign({ name: ' ' + name, description: ' Use when testing the collection check.', metadata: '\n  agent-skills-sync.schema: "1"\n  agent-skills-sync.id: "hissal.skill-collection/' + name + '"' }, o.fm || {});
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

// A stand-in guard harness that prints `out` and exits with `code`.
const guard = (out, code) => ({ 'hooks/command-guard/test/run.js': 'console.log(' + JSON.stringify(out.join('\n')) + ');\nprocess.exit(' + code + ');\n' });

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
  { name: 'NOTICE.md needs no link', files: skill('skills/core/alpha', { files: { 'NOTICE.md': '# Notice\n' } }), expect: [] },
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
    skill('vendor/skills/core/external', { fm: { description: ' ' + 'x'.repeat(8000) } }),
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
  { name: 'unresolved requirement fails', files: skill('skills/core/alpha', { fm: { metadata: metadata('hissal.skill-collection/alpha', "'[\"hissal.skill-collection/beta\"]'") } }), expect: ['fail skill-requirements skills/core/alpha/SKILL.md'] },
  { name: 'requirements cross scope', files: tree(skill('skills/core/alpha', { fm: { metadata: metadata('hissal.skill-collection/alpha', "'[\"hissal.skill-collection/beta\"]'") } }), skill('skills/packs/web/beta')), expect: [] }
);

const needing = (dir, id, requirements, body) => skill(dir, { fm: { metadata: metadata('hissal.skill-collection/' + id, "'" + JSON.stringify(requirements.map((r) => 'hissal.skill-collection/' + r)) + "'") }, ...(body === undefined ? {} : { body }) });
module.exports.push(
  { name: 'self cycle fails', files: needing('skills/core/alpha', 'alpha', ['alpha']), expect: ['fail skill-requirements skills/core/alpha/SKILL.md'] },
  { name: 'multi skill cycle fails', files: tree(needing('skills/core/alpha', 'alpha', ['beta']), needing('skills/packs/web/beta', 'beta', ['alpha'])), expect: ['fail skill-requirements skills/packs/web/beta/SKILL.md'] },
  { name: 'diamond requirements pass', files: tree(needing('skills/core/alpha', 'alpha', ['beta', 'gamma']), needing('skills/core/beta', 'beta', ['delta']), needing('skills/core/gamma', 'gamma', ['delta']), skill('skills/core/delta')), expect: [] },
  { name: 'missing required reference fails', files: tree(needing('skills/core/alpha', 'alpha', ['beta'], 'Read [reference](../../packs/web/beta/REF.md).\n'), skill('skills/packs/web/beta')), expect: ['fail requirement-reference skills/core/alpha/SKILL.md'] },
  { name: 'existing required reference passes', files: tree(needing('skills/core/alpha', 'alpha', ['beta'], 'Read [reference](../../packs/web/beta/REF.md).\n'), skill('skills/packs/web/beta', { body: 'Read [reference](REF.md).\n', files: { 'REF.md': '# Reference\n' } })), expect: [] }
);
