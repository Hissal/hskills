'use strict';
// Offline proof of the required cases' fixture: prepare.js builds the scratch
// projects with the real skills, and trigger.js grades fake sessions against
// each case's bar. No model tokens are spent.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const repo = path.resolve(__dirname, '../../../..');
const trigger = path.join(repo, 'scripts/eval/trigger.js');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'required-cases-test-'));
// A fake harness. In `bar` mode it acts as the cases require: on /guide it
// loads csharp-guide only when the project's pack list names it, and flags it
// as not set up otherwise. Other modes break one part of the bar.
const fake = path.join(dir, 'fake.js');
fs.writeFileSync(fake, `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
const harness = args.includes('exec') ? 'codex' : 'claude';
const prompt = args.at(-1);
const mode = process.env.FAKE_MODE;
const sigil = harness === 'codex' ? '$' : '/';
const guide = prompt.startsWith(sigil + 'guide ');
const listed = fs.readFileSync('AGENTS.md', 'utf8').includes('\`csharp-guide\`');
const start = JSON.parse(process.env.FAKE_TASK_START || '[]').includes(prompt);
const load = mode === 'always' ? true : mode === 'never' ? false : guide ? listed || mode === 'load-unlisted' : start;
const skill = guide ? 'csharp-guide' : 'onboarding-guide';
let answer = '**Recommended:** \`' + sigil + 'refactoring\`: fits.';
if (guide && !listed && mode !== 'drop-line') answer += '\\n\\n**Not set up:** \`csharp-guide\`: installed, not set up: run \`' + sigil + 'setup-project\`.';
// Every session writes a file, as a session that starts work would.
fs.writeFileSync('fake-write.txt', prompt);
const out = event => console.log(JSON.stringify(event));
if (harness === 'claude') {
  if (load) out({type:'assistant',message:{content:[{type:'tool_use',id:'t1',name:'Skill',input:{skill}}]}});
  out({type:'result',subtype:'success',is_error:false,result:answer});
} else {
  if (load) out({type:'item.completed',item:{type:'command_execution',command:'cat .agents/skills/'+skill+'/SKILL.md',aggregated_output:fs.readFileSync('.agents/skills/'+skill+'/SKILL.md','utf8'),exit_code:0,status:'completed'}});
  out({type:'item.completed',item:{type:'agent_message',text:answer}});
  out({type:'turn.completed'});
}
`, {mode: 0o755});

function prepare() {
  const run = spawnSync(process.execPath, [path.join(__dirname, 'prepare.js')], {encoding: 'utf8', env: {...process.env, CLAUDE_BIN: fake, CODEX_BIN: fake}});
  assert.equal(run.status, 0, run.stderr);
  return run.stdout.trim();
}
// The automatic case's queries, as the issue's bar: three task starts, then
// three requests that need no workflow.
const taskStarts = [
  'I want shoppers to keep their cart across devices, but I am not sure where to start.',
  'We should add discount codes to checkout. How should we approach it?',
  'Product search feels slow and clunky and I have a few vague ideas to fix it. Help me work out what to do first.',
];
const noWorkflow = [
  'What is two plus two?',
  'Keep going with the cart changes you already started; the tests are next.',
  'What does cartTotal in src/cart.js return for an empty cart?',
];
function evaluate(root, variant, mode) {
  return spawnSync(process.execPath, [trigger, path.join(root, variant + '.json')], {encoding: 'utf8', env: {...process.env, FAKE_MODE: mode, FAKE_TASK_START: JSON.stringify(taskStarts)}});
}
function files(base) {
  return fs.readdirSync(base, {recursive: true}).filter(name => fs.statSync(path.join(base, name)).isFile()).sort();
}

let root;
try {
  root = prepare();
  const installs = {automatic: ['guide', 'onboarding-guide'], listed: ['guide', 'csharp-guide'], 'listed-control': ['guide', 'csharp-guide'], unlisted: ['guide', 'csharp-guide']};
  const sources = {guide: 'skills/core/guide', 'onboarding-guide': 'skills/packs/onboarding/onboarding-guide', 'csharp-guide': 'skills/packs/csharp/csharp-guide'};
  for (const [variant, names] of Object.entries(installs)) {
    const project = path.join(root, variant);
    // The real skills, byte for byte, at project scope on both harnesses.
    for (const scope of ['.claude/skills', '.agents/skills']) {
      assert.deepEqual(fs.readdirSync(path.join(project, scope)).sort(), [...names].sort(), `${variant} ${scope}`);
      for (const name of names) {
        const source = path.join(repo, sources[name]);
        const copy = path.join(project, scope, name);
        assert.deepEqual(files(copy), files(source), `${variant} ${scope}/${name}`);
        for (const file of files(source)) assert.ok(fs.readFileSync(path.join(copy, file)).equals(fs.readFileSync(path.join(source, file))), `${variant} ${name}/${file}`);
      }
    }
    // Committed and clean, so a session's changes show in git status.
    const status = spawnSync('git', ['status', '--porcelain'], {cwd: project, encoding: 'utf8'});
    assert.equal(status.status, 0);
    assert.equal(status.stdout, '', variant);
  }
  const listedAgents = fs.readFileSync(path.join(root, 'listed/AGENTS.md'), 'utf8');
  assert.match(listedAgents, /### Packs\n\n- `csharp-guide`:/);
  assert.doesNotMatch(fs.readFileSync(path.join(root, 'unlisted/AGENTS.md'), 'utf8'), /### Packs/);
  // The unlisted pack guide's own trigger (.NET work, choosing a C# workflow)
  // must not apply, so only the core guide's lookup could load it: no .NET
  // code in the project and no C# or .NET in its requests.
  assert.ok(files(path.join(root, 'listed')).some(name => name.endsWith('.csproj')));
  assert.ok(!files(path.join(root, 'unlisted')).some(name => /\.(cs|csproj|sln)$/.test(name)));
  const unlisted = JSON.parse(fs.readFileSync(path.join(root, 'unlisted.json'), 'utf8')).skills[0].queries;
  for (const q of unlisted) for (const prompt of Object.values(q.prompt)) assert.doesNotMatch(prompt, /C#|\.NET|NuGet|csharp/i, prompt);
  // listed-control is the listed project without its pack list, given the
  // same requests: csharp-guide must stay quiet there, so a load in listed
  // can only come from the core guide's lookup. Neither the requests nor the
  // project's description name C# or .NET, so its own trigger has no cue
  // before the project's files are read.
  const listedQueries = JSON.parse(fs.readFileSync(path.join(root, 'listed.json'), 'utf8')).skills[0].queries;
  const control = JSON.parse(fs.readFileSync(path.join(root, 'listed-control.json'), 'utf8')).skills[0];
  assert.equal(control.name, 'csharp-guide');
  assert.deepEqual(control.queries.map(q => q.prompt), listedQueries.map(q => q.prompt));
  assert.ok(control.queries.every(q => q.fire === false));
  assert.deepEqual(control.queries[0].says, {claude: ['Recommended:', 'csharp-guide', 'installed, not set up', '/setup-project'], codex: ['Recommended:', 'csharp-guide', 'installed, not set up', '$setup-project']});
  for (const q of listedQueries) for (const prompt of Object.values(q.prompt)) assert.doesNotMatch(prompt, /C#|\.NET|NuGet|csharp|MissingMethod/i, prompt);
  const controlAgents = fs.readFileSync(path.join(root, 'listed-control/AGENTS.md'), 'utf8');
  assert.doesNotMatch(controlAgents, /### Packs|C#|\.NET|NuGet/);
  assert.equal(listedAgents.replace(/\n### Packs\n[\s\S]*$/, ''), controlAgents);
  assert.deepEqual(files(path.join(root, 'listed-control')).filter(name => !name.startsWith('.git' + path.sep) && name !== 'AGENTS.md' && !name.startsWith('docs')), files(path.join(root, 'listed')).filter(name => !name.startsWith('.git' + path.sep) && name !== 'AGENTS.md' && !name.startsWith('docs')));
  // The automatic case's prompts are plain requests: nothing names or invokes a skill.
  const automatic = JSON.parse(fs.readFileSync(path.join(root, 'automatic.json'), 'utf8'));
  assert.deepEqual(automatic.skills.map(s => s.name), ['onboarding-guide']);
  const queries = automatic.skills[0].queries;
  assert.deepEqual(queries.map(q => [q.prompt, q.fire]), [...taskStarts.map(p => [p, true]), ...noWorkflow.map(p => [p, false])]);
  for (const q of queries) assert.doesNotMatch(q.prompt, /guide|skill|workflow/i, q.prompt);
  console.log('ok: required cases install the real skills in committed projects');

  for (const variant of ['automatic', 'listed', 'listed-control', 'unlisted']) {
    const run = evaluate(root, variant, 'bar');
    assert.equal(run.status, 0, variant + '\n' + run.stdout + run.stderr);
    assert.match(run.stdout, /MODEL: \S+ Opus pass/);
    assert.match(run.stdout, /MODEL: \S+ Sol pass/);
  }
  // Raw sessions are kept per case for the file and command checks. Each
  // session's writes are recorded with it, then undone, so no session sees
  // another's and the project ends at its baseline.
  for (const variant of ['automatic', 'listed', 'listed-control', 'unlisted']) {
    const kept = fs.readdirSync(path.join(root, 'evidence', variant));
    assert.ok(kept.some(name => name.startsWith('claude-') && name.endsWith('.stdout')), variant);
    assert.ok(kept.some(name => name.startsWith('codex-') && name.endsWith('.stdout')), variant);
    for (const name of kept.filter(name => name.endsWith('.json')))
      assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root, 'evidence', variant, name), 'utf8')).changes, ['?? fake-write.txt'], variant + ' ' + name);
    assert.equal(spawnSync('git', ['status', '--porcelain'], {cwd: path.join(root, variant), encoding: 'utf8'}).stdout, '', variant);
  }
  console.log('ok: sessions meeting the bar pass every case on both frontier models');

  // The automatic guide must fire on task start and stay quiet otherwise.
  assert.equal(evaluate(root, 'automatic', 'never').status, 1);
  assert.equal(evaluate(root, 'automatic', 'always').status, 1);
  // The core guide must ask the listed pack guide, and only flag an unlisted one.
  assert.equal(evaluate(root, 'listed', 'never').status, 1);
  assert.equal(evaluate(root, 'unlisted', 'load-unlisted').status, 1);
  // A pack guide that loads by its own trigger, without the lookup, fails the control.
  assert.equal(evaluate(root, 'listed-control', 'load-unlisted').status, 1);
  const dropped = evaluate(root, 'unlisted', 'drop-line');
  assert.equal(dropped.status, 1);
  assert.match(dropped.stdout, /says missing [^\n]*"installed, not set up"/);
  console.log('ok: missing, extra or unflagged pack guide loads fail the cases');
} finally {
  fs.rmSync(dir, {recursive: true, force: true});
  if (root) fs.rmSync(root, {recursive: true, force: true});
}
