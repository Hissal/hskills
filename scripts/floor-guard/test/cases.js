'use strict';
// Floor-guard contract cases (#201), run by ./run.js against real git
// repositories. Each case builds a fresh fixture:
//
//   base     files committed on the base branch `trunk`, after the guard
//            copy is installed there with `--install` (install: false skips
//            the install; then nothing but `base` is committed)
//   data     the committed data file beside the copy, as an object
//   branch   files committed on the work branch (null deletes a file)
//   work     working-tree changes after that, left unstaged (null deletes)
//   stage    true stages the working-tree changes (`git add -A`)
//   prepare  (dir, tools) => void, any other setup, run last
//   run      the command: { args, cwd, guard: 'copy' | 'bundled' | path };
//            default: the copy with `--base trunk`
//   exit     the exit code the run must end with
//   violations  every `VIOLATION: <rule> <location>` line, exactly (check runs)
//   keys     KEY: value lines the output must hold (install and compare runs)
//   out      regexes the combined output must match
//   absent   strings the combined output must never contain

const COPY = 'tools/floor-guard.mjs';
const DATA = 'tools/floor-guard.json';
const SECRET = 'AKIAZ7QXFLOORGUARD0K';
const json = (o) => JSON.stringify(o, null, 2) + '\n';
const lines = (...l) => l.join('\n') + '\n';

const app = lines('function add(a, b) {', '  return a + b;', '}', 'module.exports = { add };');
const test = lines(
  "const assert = require('assert');",
  "const { add } = require('../src/app');",
  "test('adds', () => {",
  '  assert.equal(add(1, 2), 3);',
  '  assert.equal(add(2, 2), 4);',
  '});',
);
const project = { 'src/app.js': app, 'test/app.test.js': test, 'README.md': '# Fixture\n' };
const ratchets = { coverage: { value: 62.4, better: 'higher' }, 'bundle-kb': { value: 184, better: 'lower' } };
const legacyException = { id: 'W1', rule: 'suppression-added', path: 'src/legacy/**', reason: 'rewrite tracked', owner: 'owner', expires: '2027-01-01' };

module.exports = [
  // ---- exit 0, 1 and 2 ---------------------------------------------------
  { name: 'an unchanged branch is clean', base: project, exit: 0, violations: [] },
  { name: 'an ordinary change is clean', base: project,
    work: { 'src/app.js': app.replace('return a + b;', 'return b + a;') }, exit: 0, violations: [] },
  { name: 'a new suppression in a tracked file is a violation', base: project,
    work: { 'src/app.js': app.replace('  return a + b;', '  // eslint-disable-next-line\n  return a + b;') },
    exit: 1, violations: ['suppression-added src/app.js:2'] },
  { name: 'a suppression committed on the branch is a violation', base: project,
    branch: { 'src/app.js': app.replace('  return a + b;', '  return a + b; # noqa') },
    exit: 1, violations: ['suppression-added src/app.js:2'] },
  { name: 'a stub is unfinished work', base: project,
    work: { 'src/sub.js': lines('function sub() {', "  throw new Error('not implemented');", '}') },
    exit: 1, violations: ['unfinished-work src/sub.js:2'] },
  { name: 'an empty catch is unfinished work', base: project,
    work: { 'src/load.js': lines('try {', '  load();', '} catch (e) {}') },
    exit: 1, violations: ['unfinished-work src/load.js:3'] },
  { name: 'an empty catch over two lines is unfinished work', base: project,
    work: { 'src/load.js': lines('try {', '  load();', '} catch (e) {', '}') },
    exit: 1, violations: ['unfinished-work src/load.js:3'] },
  { name: 'a skip marker added to a test is a test made easier', base: project,
    work: { 'test/app.test.js': test.replace("test('adds'", "test.skip('adds'") },
    exit: 1, violations: ['test-skipped test/app.test.js:3'] },
  { name: 'a deleted test file is a test made easier', base: project,
    work: { 'test/app.test.js': null }, exit: 1, violations: ['test-deleted test/app.test.js'] },
  { name: 'a staged deletion of a test file is a test made easier', base: project,
    work: { 'test/app.test.js': null }, stage: true, exit: 1, violations: ['test-deleted test/app.test.js'] },
  { name: 'an assertion removed from a kept test is a test made easier', base: project,
    work: { 'test/app.test.js': test.replace('  assert.equal(add(2, 2), 4);\n', '') },
    exit: 1, violations: ['assertion-removed test/app.test.js:5'] },
  { name: 'an assertion moved within a kept test is not removed', base: project,
    work: { 'test/app.test.js': test.replace('  assert.equal(add(1, 2), 3);\n  assert.equal(add(2, 2), 4);', '  assert.equal(add(2, 2), 4);\n  assert.equal(add(1, 2), 3);') },
    exit: 0, violations: [] },
  { name: 'a test file renamed whole is not deleted', base: project,
    work: { 'test/app.test.js': null, 'test/add.test.js': test }, stage: true, exit: 0, violations: [] },
  { name: 'a test file renamed out of the test pattern is deleted', base: project,
    branch: { 'test/app.test.js': null, 'attic/app.js.bak': test }, exit: 1, violations: ['test-deleted test/app.test.js'] },
  { name: 'a removed line that starts with -- is still read as content', base: Object.assign({}, project, { 'test/count.test.js': lines('let n = 1;', '--n; assert.equal(n, 0);') }),
    work: { 'test/count.test.js': lines('let n = 1;') }, exit: 1, violations: ['assertion-removed test/count.test.js:2'] },
  { name: 'an added line that starts with ++ is still read as content', base: project,
    work: { 'src/app.js': app.replace('  return a + b;', '++n; // NOSONAR\n  return a + b;') },
    exit: 1, violations: ['suppression-added src/app.js:2'] },

  // ---- untracked files ---------------------------------------------------
  { name: 'a violation in an untracked file is found', base: project,
    work: { 'src/new.js': lines('// @ts-ignore', 'module.exports = 1;') }, exit: 1, violations: ['suppression-added src/new.js:1'] },
  { name: 'a skip in an untracked test file is found', base: project,
    work: { 'test/new.test.js': lines("xit('later', () => {});") }, exit: 1, violations: ['test-skipped test/new.test.js:1'] },
  { name: 'an untracked file outside the folder the guard runs from is found and named from the top', base: project,
    work: { 'src/new.js': lines('// @ts-ignore'), 'docs/.keep': '' }, run: { cwd: 'docs' },
    exit: 1, violations: ['suppression-added src/new.js:1'] },
  { name: 'an ignored file is not read', base: Object.assign({}, project, { '.gitignore': 'build/\n' }),
    work: { 'build/out.js': lines('// @ts-ignore') }, exit: 0, violations: [] },

  // ---- never print the matched text --------------------------------------
  { name: 'a matched secret is never printed', base: project,
    work: { 'src/keys.js': lines(`const key = '${SECRET}'; // gitleaks:allow`) },
    exit: 1, violations: ['suppression-added src/keys.js:1'], absent: [SECRET, 'gitleaks:allow'] },
  { name: 'a removed assertion holding a secret is never printed', base: Object.assign({}, project, { 'test/key.test.js': lines(`assert.equal(read(), '${SECRET}');`, 'assert.ok(true);') }),
    work: { 'test/key.test.js': lines('assert.ok(true);') }, exit: 1, violations: ['assertion-removed test/key.test.js:1'], absent: [SECRET] },

  // ---- could not run: 2, never 0 -----------------------------------------
  { name: 'a base with no merge base exits 2', base: project, run: { args: ['--base', 'no-such-ref'] }, exit: 2, out: [/could not run/] },
  { name: 'no base given and none found exits 2', base: project, run: { args: [] }, exit: 2, out: [/could not run/] },
  { name: 'with no base given, a local main is the base', base: project,
    prepare: (dir, t) => t.git(dir, ['branch', 'main', 'trunk']),
    work: { 'src/new.js': lines('// @ts-ignore') }, run: { args: [] }, exit: 1, violations: ['suppression-added src/new.js:1'] },
  { name: 'outside a git work tree exits 2', install: false, base: {},
    prepare: (dir, t) => t.removeGit(dir), run: { guard: 'bundled', args: ['--base', 'trunk'] }, exit: 2, out: [/could not run/] },
  { name: 'a data file that is not JSON exits 2', base: project, work: { [DATA]: '{ "ratchets": ' }, exit: 2, out: [/could not run/] },
  { name: 'a ratchet with no number exits 2', base: project, work: { [DATA]: json({ ratchets: { coverage: { value: 'high', better: 'higher' } } }) }, exit: 2, out: [/could not run/] },
  { name: 'a data pattern that is not a regex exits 2', base: project, work: { [DATA]: json({ patterns: { suppression: ['('] } }) }, exit: 2, out: [/could not run/] },
  { name: 'an unknown option exits 2', base: project, run: { args: ['--bse', 'trunk'] }, exit: 2 },
  { name: 'an edited guard copy is a violation', base: project,
    prepare: (dir, t) => t.edit(dir, COPY, (s) => s.replace(/\n$/, '\n// edited\n')), exit: 1, violations: ['guard-edited ' + COPY] },
  { name: 'a guard copy checked out with CRLF line endings is not edited', base: project,
    prepare: (dir, t) => t.edit(dir, COPY, (s) => s.replace(/\n/g, '\r\n')), exit: 0, violations: [] },

  // ---- tightening silent, loosening loud ---------------------------------
  { name: 'raising a higher-is-better ratchet is silent', base: project, data: { ratchets },
    work: { [DATA]: json({ ratchets: Object.assign({}, ratchets, { coverage: { value: 70, better: 'higher' } }) }) },
    exit: 0, violations: [], absent: ['coverage'] },
  { name: 'lowering a lower-is-better ratchet is silent', base: project, data: { ratchets },
    work: { [DATA]: json({ ratchets: Object.assign({}, ratchets, { 'bundle-kb': { value: 150, better: 'lower' } }) }) },
    exit: 0, violations: [], absent: ['bundle-kb'] },
  { name: 'adding a ratchet is silent', base: project, data: { ratchets },
    work: { [DATA]: json({ ratchets: Object.assign({}, ratchets, { warnings: { value: 0, better: 'lower' } }) }) },
    exit: 0, violations: [], absent: ['warnings'] },
  { name: 'lowering a higher-is-better ratchet is loud', base: project, data: { ratchets },
    work: { [DATA]: json({ ratchets: Object.assign({}, ratchets, { coverage: { value: 55, better: 'higher' } }) }) },
    exit: 1, violations: ['ratchet-loosened ' + DATA + ' ratchets.coverage'] },
  { name: 'raising a lower-is-better ratchet is loud', base: project, data: { ratchets },
    work: { [DATA]: json({ ratchets: Object.assign({}, ratchets, { 'bundle-kb': { value: 200, better: 'lower' } }) }) },
    exit: 1, violations: ['ratchet-loosened ' + DATA + ' ratchets.bundle-kb'] },
  { name: 'flipping a ratchet direction is loud', base: project, data: { ratchets },
    work: { [DATA]: json({ ratchets: Object.assign({}, ratchets, { coverage: { value: 62.4, better: 'lower' } }) }) },
    exit: 1, violations: ['ratchet-loosened ' + DATA + ' ratchets.coverage'] },
  { name: 'removing a ratchet is loud', base: project, data: { ratchets },
    work: { [DATA]: json({ ratchets: { coverage: ratchets.coverage } }) },
    exit: 1, violations: ['ratchet-loosened ' + DATA + ' ratchets.bundle-kb'] },
  { name: 'deleting the data file is loud', base: project, data: { ratchets },
    work: { [DATA]: null }, exit: 1,
    violations: ['ratchet-loosened ' + DATA + ' ratchets.coverage', 'ratchet-loosened ' + DATA + ' ratchets.bundle-kb'] },
  { name: 'a new floor exception is loud and exempts nothing yet', base: project,
    work: { [DATA]: json({ exceptions: [legacyException] }), 'src/legacy/old.js': lines('// eslint-disable') },
    exit: 1, violations: ['exception-added ' + DATA + ' exceptions.W1', 'suppression-added src/legacy/old.js:1'] },
  { name: 'a changed floor exception is loud', base: project, data: { exceptions: [legacyException] },
    work: { [DATA]: json({ exceptions: [Object.assign({}, legacyException, { path: 'src/**' })] }) },
    exit: 1, violations: ['exception-added ' + DATA + ' exceptions.W1'] },
  { name: 'removing a floor exception is silent', base: project, data: { exceptions: [legacyException] },
    work: { [DATA]: json({ exceptions: [] }) }, exit: 0, violations: [], absent: ['W1'] },
  { name: 'a committed exception exempts its rule on its path', base: project, data: { exceptions: [legacyException] },
    work: { 'src/legacy/old.js': lines('// eslint-disable'), 'src/new.js': lines('// eslint-disable', 'module.exports = 1;') },
    exit: 1, violations: ['suppression-added src/new.js:1'] },
  { name: 'a committed exception exempts no other rule', base: project, data: { exceptions: [legacyException] },
    work: { 'src/legacy/old.js': lines("throw new Error('not implemented');") }, exit: 1, violations: ['unfinished-work src/legacy/old.js:1'] },
  { name: 'a data-file pattern extends the defaults', base: project, data: { patterns: { suppression: ['\\bSILENCE-CHECK\\b'] } },
    work: { 'src/app.js': app.replace('  return a + b;', '  return a + b; // SILENCE-CHECK') }, exit: 1, violations: ['suppression-added src/app.js:2'] },
  { name: 'a data-file test-file pattern makes its files tests', base: Object.assign({}, project, { 'checks/add.check.js': lines('verify(add(1, 2) === 3);', 'verify(add(2, 2) === 4);') }),
    data: { patterns: { 'test-file': ['\\.check\\.js$'] } },
    work: { 'checks/add.check.js': lines('verify(add(1, 2) === 3);') }, exit: 1, violations: ['assertion-removed checks/add.check.js:2'] },
  { name: 'adding a data-file pattern is silent', base: project, data: { patterns: { stub: ['\\bLATER\\b'] } },
    work: { [DATA]: json({ patterns: { stub: ['\\bLATER\\b', '\\bSOMEDAY\\b'] } }) }, exit: 0, violations: [] },
  { name: 'removing a data-file pattern is loud', base: project, data: { patterns: { stub: ['\\bLATER\\b'] } },
    work: { [DATA]: json({ patterns: { stub: [] } }) }, exit: 1, violations: ['pattern-removed ' + DATA + ' patterns.stub'] },

  // ---- install, stamp and update -----------------------------------------
  { name: 'install writes a stamped copy and an empty data file', install: false, base: project,
    run: { guard: 'bundled', args: ['--install', COPY] }, exit: 0,
    keys: { GUARD: COPY, GUARD_STATE: 'created', DATA: DATA, DATA_STATE: 'created', CHECK_COMMAND: 'node ' + COPY },
    after: (dir, t) => {
      t.assert(/^\/\/ floor-guard stamp: version \d+\.\d+\.\d+ sha256 [0-9a-f]{64}$/m.test(t.read(dir, COPY)), 'copy carries the stamp');
      t.assert.deepEqual(JSON.parse(t.read(dir, DATA)), { ratchets: {}, exceptions: [], patterns: {} });
    } },
  { name: 'a fresh install is clean on its own branch', install: false, base: project,
    prepare: (dir, t) => { t.run(dir, 'bundled', ['--install', COPY]); },
    exit: 0, violations: [] },
  { name: 'installing over the current copy changes nothing and keeps the data file', base: project, data: { ratchets },
    run: { guard: 'bundled', args: ['--install', COPY] }, exit: 0,
    keys: { GUARD_STATE: 'unchanged', DATA_STATE: 'kept' },
    after: (dir, t) => t.assert.deepEqual(JSON.parse(t.read(dir, DATA)).ratchets, ratchets) },
  { name: 'compare names a current copy', base: project, run: { guard: 'bundled', args: ['--compare', COPY] }, exit: 0,
    keys: { GUARD_STATE: 'current', UPDATE_LOOSENS: 'no', DATA_STATE: 'present' } },
  { name: 'compare names a missing copy', install: false, base: project, run: { guard: 'bundled', args: ['--compare', COPY] }, exit: 0,
    keys: { GUARD_STATE: 'missing', DATA_STATE: 'missing' } },
  { name: 'compare names a hand-edited copy', base: project,
    prepare: (dir, t) => t.edit(dir, COPY, (s) => s + '// edited\n'),
    run: { guard: 'bundled', args: ['--compare', COPY] }, exit: 0, keys: { GUARD_STATE: 'edited' } },
  { name: 'compare: an update that keeps every default pattern does not loosen', base: project,
    prepare: (dir, t) => t.installVariant(dir, (s) => t.dropDefault(s, 'suppression', 'NOSONAR'), '0.0.1'),
    run: { guard: 'bundled', args: ['--compare', COPY] }, exit: 0,
    keys: { GUARD_STATE: 'outdated', COPY_VERSION: '0.0.1', UPDATE_LOOSENS: 'no' } },
  { name: 'compare: an update that drops a default pattern loosens, loudly', base: project,
    prepare: (dir, t) => t.installVariant(dir, (s) => t.addDefault(s, 'suppression', '\\\\bHUSH\\\\b'), '0.0.1'),
    run: { guard: 'bundled', args: ['--compare', COPY] }, exit: 0,
    keys: { GUARD_STATE: 'outdated', UPDATE_LOOSENS: 'yes', LOOSENED: 'pattern suppression \\bHUSH\\b' } },
  { name: 'install refuses to replace a differing copy', base: project,
    prepare: (dir, t) => t.edit(dir, COPY, (s) => s + '// edited\n'),
    run: { guard: 'bundled', args: ['--install', COPY] }, exit: 1, keys: { GUARD_STATE: 'edited' },
    after: (dir, t) => t.assert(t.read(dir, COPY).endsWith('// edited\n'), 'the copy is left as it was') },
  { name: 'install --replace refreshes a differing copy and keeps the data file', base: project, data: { ratchets },
    prepare: (dir, t) => t.installVariant(dir, (s) => t.dropDefault(s, 'suppression', 'NOSONAR'), '0.0.1'),
    run: { guard: 'bundled', args: ['--install', COPY, '--replace'] }, exit: 0,
    keys: { GUARD_STATE: 'replaced', DATA_STATE: 'kept' },
    after: (dir, t) => {
      const r = t.run(dir, 'bundled', ['--compare', COPY]);
      t.assert(/^GUARD_STATE: current$/m.test(r.stdout), 'the copy is current after the refresh: ' + r.stdout);
      t.assert.deepEqual(JSON.parse(t.read(dir, DATA)).ratchets, ratchets);
    } },
  { name: '--help prints usage and exits 0', install: false, base: {}, run: { guard: 'bundled', args: ['--help'] }, exit: 0,
    out: [/--install/, /--compare/, /--base/, /exit/i] },
];
