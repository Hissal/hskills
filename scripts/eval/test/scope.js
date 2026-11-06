'use strict';
// Offline tests for the eval scope helper: a fake collection, a fake Codex
// config and temp run directories. Nothing here reads the user's real config.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const cli = path.resolve(__dirname, '../scope.js');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eval-scope-'));
const scope = (...args) => spawnSync(process.execPath, [cli, ...args], {encoding: 'utf8'});
try {
  const help = scope('--help');
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /^USAGE: node scripts\/eval\/scope\.js <scope\.json> <queries\.json> <run dir>/m);
  assert.match(help.stdout, /^DOCS: docs\/trigger-evals\.md$/m);
  for (const args of [[], ['only-one.json'], ['a.json', 'b.json', 'run', '--bogus']]) {
    const usage = scope(...args);
    assert.equal(usage.status, 2, args.join(' '));
    assert.match(usage.stderr, /^ERROR: /);
  }
  console.log('ok: scope helper help and usage errors');

  // A fake collection: two core skills and a pack with a guide and a SETUP.md.
  const root = path.join(dir, 'collection');
  const skill = (rel, name, description) => {
    fs.mkdirSync(path.join(root, rel), {recursive: true});
    fs.writeFileSync(path.join(root, rel, 'SKILL.md'), `---\nname: ${name}\ndescription: ${description}\n---\nBody.\n`);
  };
  skill('skills/core/alpha', 'alpha', 'Use for alpha.');
  skill('skills/core/beta', 'beta', 'Use for beta.');
  skill('skills/packs/fake/fake-guide', 'fake-guide', 'Use when working on fake engines.');
  skill('skills/packs/fake/fake-tool', 'fake-tool', 'Use for the fake tool.');
  fs.writeFileSync(path.join(root, 'skills/packs/fake/fake-guide/SETUP.md'), '# Fake pack setup\n\n**Domain, for the pack line:** Fake engines and fake packages.\n');
  skill('skills/packs/other/other-guide', 'other-guide', 'Use for other.');
  fs.writeFileSync(path.join(root, 'collection.json'), JSON.stringify({
    core: ['skills/core/alpha', 'skills/core/beta'],
    packs: {fake: ['skills/packs/fake/fake-guide', 'skills/packs/fake/fake-tool'], other: ['skills/packs/other/other-guide']},
  }));
  // The owner's Codex toggles, fields in either order, and a table that is not one.
  const codexConfig = path.join(dir, 'codex-config.toml');
  fs.writeFileSync(codexConfig, `model = "x"

[[skills.config]]
name = "user:kept"
enabled = true

[[skills.config]]
enabled = false
name = "user:off"

[[skills.config]]
name="fork:old"
enabled=true

[[skills.config]]
name = "vendor:collide"
enabled = false

[other]
name = "not-a-skill"
enabled = true
`);
  const scopeFile = path.join(dir, 'scope.json');
  fs.writeFileSync(scopeFile, JSON.stringify({
    pack: 'fake',
    markers: {'Engine/Version.txt': 'engine: 1.2\n', 'Engine/Empty.txt': ''},
    hidden: ['fork:old', 'fork:never-configured'],
    colliding: ['vendor:collide'],
  }));
  const queriesFile = path.join(dir, 'queries.json');
  const skills = [{name: 'fake-guide', queries: [{prompt: 'Fix the fake engine build.', fire: true}]}];
  fs.writeFileSync(queriesFile, JSON.stringify({cwd: '.', models: [
    {label: 'Opus', harness: 'claude', model: 'opus-id', tier: 'frontier'},
    {label: 'Sol', harness: 'codex', model: 'sol-id', tier: 'frontier', command: ['/opt/codex']},
    {label: 'Go', harness: 'opencode', model: 'go-id', tier: 'lower'},
  ], skills}));
  const build = (run, ...extra) => scope(scopeFile, queriesFile, run, '--root', root, '--codex-config', codexConfig, ...extra);

  const run = path.join(dir, 'run');
  const built = build(run);
  assert.equal(built.status, 0, built.stderr);
  const project = path.join(run, 'project');
  const evidence = path.join(run, 'evidence');
  const files = spawnSync('git', ['ls-files'], {cwd: project, encoding: 'utf8'}).stdout.trim().split('\n').sort();
  assert.deepEqual(files, [
    '.agents/skills/alpha/SKILL.md', '.agents/skills/beta/SKILL.md',
    '.agents/skills/fake-guide/SETUP.md', '.agents/skills/fake-guide/SKILL.md', '.agents/skills/fake-tool/SKILL.md',
    '.claude/skills/alpha/SKILL.md', '.claude/skills/beta/SKILL.md',
    '.claude/skills/fake-guide/SETUP.md', '.claude/skills/fake-guide/SKILL.md', '.claude/skills/fake-tool/SKILL.md',
    'AGENTS.md', 'Engine/Empty.txt', 'Engine/Version.txt', 'docs/agents/fake.md',
  ]);
  assert.equal(spawnSync('git', ['status', '--porcelain'], {cwd: project, encoding: 'utf8'}).stdout, '');
  assert.equal(spawnSync('git', ['rev-list', '--count', 'HEAD'], {cwd: project, encoding: 'utf8'}).stdout, '1\n');
  assert.equal(spawnSync('git', ['config', '--local', 'user.email'], {cwd: project, encoding: 'utf8'}).stdout.trim(), 'eval-scope@example.invalid');
  assert.equal(fs.readFileSync(path.join(project, 'Engine/Version.txt'), 'utf8'), 'engine: 1.2\n');
  assert.equal(fs.readFileSync(path.join(project, 'AGENTS.md'), 'utf8'),
    '## Agent skills\n\n### Packs\n\n- `fake-guide`: Fake engines and fake packages. See `docs/agents/fake.md`.\n');
  assert.equal(fs.readFileSync(path.join(project, 'docs/agents/fake.md'), 'utf8'), "> A missing field means the owning skill's default.\n");

  // The queries file keeps labels, models, tiers and skills, runs in the
  // project, and wraps each model in the capture with a reset to the baseline.
  const out = JSON.parse(fs.readFileSync(path.join(run, 'queries.json'), 'utf8'));
  assert.equal(out.cwd, project);
  assert.deepEqual(out.skills, skills);
  assert.deepEqual(out.models.map(m => [m.label, m.harness, m.model, m.tier]),
    [['Opus', 'claude', 'opus-id', 'frontier'], ['Sol', 'codex', 'sol-id', 'frontier'], ['Go', 'opencode', 'go-id', 'lower']]);
  const capture = [process.execPath, path.resolve(__dirname, 'plugin-fixture/capture.js'), '--reset', evidence];
  assert.deepEqual(out.models[0].command, [...capture, 'claude', 'claude', '--setting-sources', 'project', '--permission-mode', 'acceptEdits',
    '--allowedTools', 'Read', 'Bash', 'PowerShell', 'Glob', 'Grep', 'Write', 'Edit', 'WebFetch', 'WebSearch', 'ToolSearch', 'Skill']);
  // Hidden skills are forced off, configured or not; a colliding skill keeps the owner's toggle.
  const toggles = 'skills.config=[{name="user:kept",enabled=true},{name="user:off",enabled=false},{name="fork:old",enabled=false},{name="vendor:collide",enabled=false},{name="fork:never-configured",enabled=false}]';
  assert.deepEqual(out.models[1].command, [...capture, 'codex', '/opt/codex', '-c', toggles, '-c', 'sandbox_mode="workspace-write"']);
  assert.deepEqual(out.models[2].command, [...capture, 'opencode', 'opencode']);
  // The manual check before the first query is printed, and its sessions run
  // in the project, so they list the scope that was built.
  assert.match(built.stdout, /--check/);
  const next = built.stdout.split('\n').filter(line => / -- "/.test(line));
  assert.equal(next.length, 2, built.stdout);
  // In a subshell, so pasting the block keeps the shell where it was, and the
  // lines after them name the scripts and files by absolute path.
  for (const line of next) assert.ok(line.startsWith(`  (cd '${project}' && `) && line.includes(') > '), line);
  const checkLine = built.stdout.split('\n').find(line => line.includes(' --check '));
  assert.ok(checkLine.startsWith(`  node ${cli} --check ${path.resolve(scopeFile)} `), checkLine);
  assert.match(built.stdout, new RegExp(`^RUN: node ${path.resolve(__dirname, '../trigger.js').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} `, 'm'));
  console.log('ok: scope helper builds the project and the queries file');

  // A global excludes file that ignores the skill folders cannot leave them
  // out of the baseline, where capture --reset's git clean would delete them.
  const ignored = path.join(dir, 'ignored');
  const excludes = path.join(dir, 'global-excludes');
  fs.writeFileSync(excludes, '.claude/\n.agents/\nEngine/\n');
  const globalConfig = path.join(dir, 'global-gitconfig');
  fs.writeFileSync(globalConfig, `[core]\n\texcludesFile = ${excludes}\n`);
  const ignoredBuild = spawnSync(process.execPath, [cli, scopeFile, queriesFile, ignored, '--root', root, '--codex-config', codexConfig],
    {encoding: 'utf8', env: {...process.env, GIT_CONFIG_GLOBAL: globalConfig}});
  assert.equal(ignoredBuild.status, 0, ignoredBuild.stderr);
  const ignoredFiles = spawnSync('git', ['ls-files'], {cwd: path.join(ignored, 'project'), encoding: 'utf8'}).stdout.trim().split('\n').sort();
  assert.deepEqual(ignoredFiles, files);
  console.log('ok: scope helper commits the skills despite global excludes');

  // --colliding turns the colliding skills on.
  const loud = path.join(dir, 'loud');
  assert.equal(build(loud, '--colliding').status, 0);
  const loudCodex = JSON.parse(fs.readFileSync(path.join(loud, 'queries.json'), 'utf8')).models[1].command;
  assert.equal(loudCodex[loudCodex.indexOf('-c') + 1],
    'skills.config=[{name="user:kept",enabled=true},{name="user:off",enabled=false},{name="fork:old",enabled=false},{name="vendor:collide",enabled=true},{name="fork:never-configured",enabled=false}]');
  console.log('ok: scope helper enables colliding skills only on request');

  // A non-empty run directory is refused and left as it was.
  const busy = path.join(dir, 'busy');
  fs.mkdirSync(busy);
  fs.writeFileSync(path.join(busy, 'keep.txt'), 'mine');
  const refused = build(busy);
  assert.equal(refused.status, 2);
  assert.match(refused.stderr, /not empty/);
  assert.deepEqual(fs.readdirSync(busy), ['keep.txt']);
  // Invalid scopes: an unknown pack, and a skill both hidden and colliding.
  for (const bad of [{pack: 'missing'}, {pack: 'fake', hidden: ['x:y'], colliding: ['x:y']}]) {
    fs.writeFileSync(scopeFile, JSON.stringify(bad));
    const invalid = build(path.join(dir, 'invalid'));
    assert.equal(invalid.status, 2, JSON.stringify(bad));
    assert.match(invalid.stderr, /^ERROR: /);
    assert.equal(fs.existsSync(path.join(dir, 'invalid')), false);
  }
  console.log('ok: scope helper refuses a non-empty run directory and invalid scopes');

  // --check reads a saved Claude init stream or a Codex listing and reports
  // any hidden skill it lists; a longer name that contains one is not it.
  fs.writeFileSync(scopeFile, JSON.stringify({pack: 'fake', hidden: ['fork:old', 'fork:never-configured']}));
  const init = skills => [JSON.stringify({type: 'system', subtype: 'init', skills}), JSON.stringify({type: 'assistant', message: {content: [{type: 'text', text: 'fork:old'}]}})].join('\n') + '\n';
  const cleanInit = path.join(dir, 'clean-init.jsonl');
  fs.writeFileSync(cleanInit, init(['alpha', 'fake-guide', 'fork:older']));
  const dirtyInit = path.join(dir, 'dirty-init.jsonl');
  fs.writeFileSync(dirtyInit, init(['alpha', 'fork:old']));
  const cleanListing = path.join(dir, 'clean-listing.txt');
  fs.writeFileSync(cleanListing, 'alpha\nfake-guide\nfork:old-extra\n');
  const dirtyListing = path.join(dir, 'dirty-listing.txt');
  fs.writeFileSync(dirtyListing, 'alpha\n- `fork:never-configured`\n');
  const clean = scope('--check', scopeFile, cleanInit, cleanListing);
  assert.equal(clean.status, 0, clean.stderr);
  assert.equal(clean.stdout, `CHECK: ${cleanInit} clean\nCHECK: ${cleanListing} clean\n`);
  const dirty = scope('--check', scopeFile, cleanInit, dirtyInit, dirtyListing);
  assert.equal(dirty.status, 1, dirty.stderr);
  assert.equal(dirty.stdout, `CHECK: ${cleanInit} clean\nCHECK: ${dirtyInit} lists fork:old\nCHECK: ${dirtyListing} lists fork:never-configured\n`);
  // An init event with no skills list proves nothing.
  const bare = path.join(dir, 'bare-init.jsonl');
  fs.writeFileSync(bare, JSON.stringify({type: 'system', subtype: 'init'}) + '\n');
  assert.equal(scope('--check', scopeFile, bare).status, 2);
  assert.equal(scope('--check', scopeFile).status, 2);
  console.log('ok: scope helper checks saved listings for hidden skills');

  // The shipped example scope builds against this collection with example.json's models.
  const example = path.join(dir, 'example');
  const fromExample = scope(path.resolve(__dirname, '../scope.example.json'), path.resolve(__dirname, '../example.json'), example, '--codex-config', path.join(dir, 'absent.toml'));
  assert.equal(fromExample.status, 0, fromExample.stderr);
  assert.match(fs.readFileSync(path.join(example, 'project/AGENTS.md'), 'utf8'), /^- `unity-guide`: Unity projects and UPM packages\. See `docs\/agents\/unity\.md`\.$/m);
  assert.ok(fs.existsSync(path.join(example, 'project/ProjectSettings/ProjectVersion.txt')));
  console.log('ok: scope helper example builds');
} finally { fs.rmSync(dir, {recursive: true, force: true}); }
