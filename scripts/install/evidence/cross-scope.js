'use strict';
// Manual evidence fixture only: never invokes a model or uses the real home.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
// --junction (Windows only): inject EPERM for directory symlinks so the real
// installer takes its junction fallback. This is not an actual OS refusal.
const junction = process.argv.includes('--junction');
if (junction && process.platform !== 'win32') throw new Error('--junction requires Windows');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-scope-127-'));
const cli = path.resolve(__dirname, '../install.js');
const nodeArgs = [];
if (junction) {
  const preload = path.join(root, 'deny-directory-links.cjs');
  fs.writeFileSync(preload, `const fs = require('fs');
const original = fs.symlinkSync;
fs.symlinkSync = function(target, dest, type) {
  if (type === 'dir') throw Object.assign(new Error('fixture-injected permission denied'), { code: 'EPERM' });
  return original.apply(this, arguments);
};
`);
  nodeArgs.push('--require', preload);
}
const id = name => `hissal.skill-collection/eval-scope-${name}`;
function skill(source, name, marker, requires = []) {
  const dir = path.join(source, 'skills', 'packs', 'fixture', name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\nname: ${name}\ndescription: Isolated cross-scope install evidence fixture.\nmetadata:\n  agent-skills-sync.schema: "1"\n  agent-skills-sync.id: "${id(name)}"\n  agent-skills-sync.requires: '${JSON.stringify(requires)}'\n---\n\n${requires.length ? 'Before answering, load scope-rules (' + id('scope-rules') + ') through the installed skill list, then read its references/token.md relative to that installed skill. Stop before answering if either cannot load; name the missing skill and ID and explain that npx skills does not install requirements. Never assume sibling folders.\n' : 'Read [the token](references/token.md) before answering.\n'}Report marker ${marker} and the reference token you actually read.\n`);
  if (!requires.length) {
    fs.mkdirSync(path.join(dir, 'references'));
    fs.writeFileSync(path.join(dir, 'references/token.md'), `Reference token: ${marker}-REFERENCE\n`);
  }
}
for (const scenario of ['duplicate', 'project-to-user', 'user-to-project']) {
  const base = path.join(root, scenario);
  const home = path.join(base, 'home');
  const project = path.join(base, 'project');
  const source = path.join(base, 'source');
  fs.mkdirSync(project, { recursive: true });
  const git = (...args) => {
    const r = spawnSync('git', ['-C', project, ...args], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
  };
  git('init', '-q');
  fs.writeFileSync(path.join(project, 'README.md'), 'Isolated scope fixture\n');
  git('add', 'README.md');
  git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'test: initialize isolated scope fixture');
  const callerUser = scenario === 'user-to-project';
  const userName = callerUser ? 'scope-caller' : 'scope-rules';
  const projectName = callerUser ? 'scope-rules' : 'scope-caller';
  skill(source, 'scope-caller', 'CALLER', [id('scope-rules')]);
  skill(source, 'scope-rules', 'RULES');
  fs.writeFileSync(path.join(source, 'collection.json'), JSON.stringify({ core: [], packs: { fixture: [`skills/packs/fixture/${userName}`], project: [`skills/packs/fixture/${projectName}`] }, expensive: [] }));
  const run = (...args) => {
    const r = spawnSync(process.execPath, [...nodeArgs, cli, 'install', '--home', home, '--source', source, ...args], { encoding: 'utf8' });
    fs.appendFileSync(path.join(base, 'install.log'), r.stdout + r.stderr);
    assert.equal(r.status, 0, r.stdout + r.stderr);
  };
  run('--pack', 'fixture');
  run('--skill', projectName, '--project', project);
  if (scenario === 'duplicate') {
    // Same identity/name, deliberately different content to expose selection.
    const personal = path.join(source, 'personal');
    skill(personal, 'scope-caller', 'USER-CALLER', [id('scope-rules')]);
    for (const folder of ['.claude', '.agents']) fs.symlinkSync(path.join(personal, 'skills/packs/fixture/scope-caller'), path.join(home, folder, 'skills/scope-caller'), junction ? 'junction' : 'dir');
    fs.appendFileSync(path.join(base, 'install.log'), `Duplicate user caller: manually created ${junction ? 'junctions' : 'symlinks'} (not installer-owned).\n`);
  }
  for (const [scope, name] of [[home, userName], [project, projectName]]) {
    for (const folder of ['.claude', '.agents']) {
      const link = path.join(scope, folder, 'skills', name);
      assert.ok(fs.lstatSync(link).isSymbolicLink());
      assert.equal(fs.realpathSync(link), path.join(source, 'skills', 'packs', 'fixture', name));
    }
  }
  const rulesScope = callerUser ? project : home;
  for (const folder of ['.claude', '.agents']) {
    const reference = path.join(rulesScope, folder, 'skills/scope-rules/references/token.md');
    assert.equal(fs.readFileSync(reference, 'utf8'), 'Reference token: RULES-REFERENCE\n');
    if (scenario === 'duplicate') {
      const duplicate = path.join(home, folder, 'skills/scope-caller');
      assert.ok(fs.lstatSync(duplicate).isSymbolicLink());
      assert.match(fs.readFileSync(path.join(duplicate, 'SKILL.md'), 'utf8'), /USER-CALLER/);
    }
  }
  assert.equal(spawnSync('git', ['-C', project, 'status', '--porcelain'], { encoding: 'utf8' }).stdout, '');
  if (junction) {
    const types = JSON.parse(fs.readFileSync(path.join(home, '.skill-collection/install.json'), 'utf8')).links.map(l => l.type);
    assert.ok(types.length && types.every(t => t === 'junction'), types.join());
  }
  console.log(`${scenario}: ${base} (installer exit 0; links resolve; clean baseline)`);
}
console.log(`ROOT: ${root}`);
