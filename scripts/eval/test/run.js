'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'trigger-eval-'));
const cli = path.resolve(__dirname, '../trigger.js');
const fake = path.join(dir, 'fake.js');
fs.writeFileSync(fake, `const prompt = process.argv.at(-1);
const mode = process.argv[2];
if (mode === 'broken') { console.log('bad json'); process.exit(0); }
if (mode === 'error') process.exit(1);
if (mode === 'codex-ambiguous' || mode === 'codex-failed') {
 console.log(JSON.stringify({type:'item.completed',item:{type:'command_execution',command:'echo /tmp/project/.agents/skills/fixture/SKILL.md',aggregated_output:'fixture',exit_code:mode === 'codex-failed'?1:0,status:mode === 'codex-failed'?'failed':'completed'}}));
 console.log(JSON.stringify({type:'turn.completed'})); process.exit(0);
}
if (mode === 'codex-multi') {
 // A failed command that does not name the entry point is not evidence either way.
 console.log(JSON.stringify({type:'item.completed',item:{type:'command_execution',command:"/bin/bash -lc 'ls missing'",aggregated_output:'',exit_code:2,status:'failed'}}));
 const files = prompt === 'yes 2' ? 'docs/agents/fixture.md .agents/skills/fixture/SKILL.md' : prompt === 'yes 3' ? 'docs/agents/fixture.md; cat .agents/skills/fixture/SKILL.md && cat x.md' : '.agents/skills/fixture/SKILL.md docs/agents/fixture.md';
 const output = prompt === 'yes 2' || prompt === 'yes 3' ? '# Facts\\n---\\nname: fixture\\n---\\nCount vowels.' : prompt.startsWith('yes') ? '---\\nname: fixture\\n---\\nCount vowels.\\n# Facts' : '# Facts';
 console.log(JSON.stringify({type:'item.completed',item:{type:'command_execution',command:"/bin/bash -lc 'cat "+files+"'",aggregated_output:output,exit_code:0,status:'completed'}}));
 console.log(JSON.stringify({type:'turn.completed'})); process.exit(0);
}
if (mode === 'codex-command') {
 // One command execution as Codex reports it: item.command is the argv joined
 // with POSIX shell quoting (shlex::try_join).
 console.log(JSON.stringify({type:'item.completed',item:{type:'command_execution',command:process.env.FAKE_COMMAND,aggregated_output:'---\\r\\nname: fixture\\r\\n---\\r\\nCount vowels.\\r\\n',exit_code:0,status:'completed'}}));
 console.log(JSON.stringify({type:'turn.completed'})); process.exit(0);
}
if (mode === 'claude-tool-error') {
 // An errored tool call other than Skill is not evidence either way; an errored Skill call is.
 const skill = prompt === 'skill error';
 console.log(JSON.stringify({type:'assistant',message:{content:[{type:'tool_use',id:'t1',name:skill?'Skill':'Bash',input:skill?{skill:'fixture'}:{command:'ls missing'}}]}}));
 console.log(JSON.stringify({type:'user',message:{content:[{type:'tool_result',tool_use_id:'t1',is_error:true,content:'Exit code 2'}]}}));
 if (prompt.startsWith('yes')) console.log(JSON.stringify({type:'assistant',message:{content:[{type:'tool_use',id:'t2',name:'Skill',input:{skill:'fixture'}}]}}));
 console.log(JSON.stringify({type:'result',subtype:'success',is_error:false}));
 process.exit(0);
}
if (mode === 'codex') {
 if (prompt.startsWith('yes')) console.log(JSON.stringify({type:'item.completed',item:{type:'command_execution',command:"cat /tmp/project/.agents/skills/fixture/SKILL.md",aggregated_output:'---\\nname: fixture\\n---\\nCount vowels.',exit_code:0,status:'completed'}}));
 console.log(JSON.stringify({type:'turn.completed'})); process.exit(0);
}
if (mode === 'opencode') {
 if (prompt.startsWith('yes')) console.log(JSON.stringify({type:'tool_use',part:{tool:'skill',state:{status:'completed',input:{id:'fixture-id'},metadata:{metadata:{name:'fixture'}}}}}));
 console.log(JSON.stringify({type:'step_finish'})); process.exit(0);
}
if (mode === 'noise') {
 const fs = require('node:fs'); const file = __filename + '.counter';
 const n = fs.existsSync(file) ? Number(fs.readFileSync(file)) : 0;
 fs.writeFileSync(file,String(n+1));
 if (n % 2) { console.log(JSON.stringify({type:'result',subtype:'success'})); process.exit(0); }
}
if (mode === 'says') {
 const fired = prompt.includes('yes');
 if (fired) console.log(JSON.stringify({type:'assistant',message:{content:[{type:'tool_use',name:'Skill',input:{skill:'fixture'}}]}}));
 console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:'Recommended: '+prompt}));
 process.exit(0);
}
if (mode === 'codex-says') {
 console.log(JSON.stringify({type:'item.completed',item:{type:'agent_message',text:'first draft'}}));
 console.log(JSON.stringify({type:'item.completed',item:{type:'agent_message',text:'Recommended: '+prompt}}));
 console.log(JSON.stringify({type:'turn.completed'})); process.exit(0);
}
const fired = prompt.startsWith('yes');
console.log(JSON.stringify({type:'assistant',message:{content:fired?[{type:'tool_use',name:'Skill',input:{skill:'fixture'}}]:[{type:'text',text:'fixture'}]}}));
console.log(JSON.stringify({type:'result',subtype:'success',is_error:false}));`);
const config = {models:[{label:'Opus',harness:'claude',model:'fake',tier:'frontier',command:[process.execPath,fake]},{label:'Sol',harness:'claude',model:'fake',tier:'frontier',command:[process.execPath,fake]}],skills:[{name:'fixture',queries:[...['yes 1','yes 2','yes 3'].map(prompt=>({prompt,fire:true})),...['no 1','no 2','no 3'].map(prompt=>({prompt,fire:false}))]}]};
function run(extra=[]) {
 fs.writeFileSync(path.join(dir,'cases.json'), JSON.stringify(config));
 return spawnSync(process.execPath,[cli,path.join(dir,'cases.json'),...extra],{encoding:'utf8'});
}
try {
 const result = run();
 assert.equal(result.status,0,result.stderr);
 assert.match(result.stdout,/RESULT: fixture Opus q1 fired/);
 assert.match(result.stdout,/RESULT: fixture Sol q6 not fired/);
 assert.match(result.stdout,/SKILL: fixture pass/);
 console.log('ok: six queries on two fake frontier models');
 config.models.push({label:'Go',harness:'opencode',model:'fake',tier:'lower',command:[process.execPath,fake,'error']});
 assert.equal(run().status,0);
 const full = run(['--full']);
 assert.equal(full.status,0);
 assert.match(full.stdout,/MODEL: fixture Go inconclusive \(advisory\)/);
 config.models[0].command = [process.execPath,fake,'noise'];
 const noise = run(['--repeat','2']);
 assert.equal(noise.status,2);
 assert.match(noise.stdout,/RESULT: fixture Opus q1 inconclusive/);
 for (const mode of ['broken','error']) {
   config.models[0].command = [process.execPath,fake,mode];
   config.models[0].harness = mode === 'codex' ? 'codex' : 'claude';
   assert.equal(run().status,2,mode);
 }
 config.models[0].harness = 'codex';
 config.models[0].command = [process.execPath,fake,'codex'];
 assert.equal(run().status,0);
 // Plain cats of several files, alone or joined by ; or &&, count when one
 // is the entry point and the output carries its name line; an unrelated
 // failed command is ignored.
 config.models[0].command = [process.execPath,fake,'codex-multi'];
 config.skills[0].queries = config.skills[0].queries.slice(0,3);
 const multi = run();
 assert.equal(multi.status,0,multi.stdout);
 assert.match(multi.stdout,/RESULT: fixture Opus q2 fired/);
 assert.match(multi.stdout,/RESULT: fixture Opus q3 fired/);
 config.skills[0].queries = [{prompt:'no 1',fire:false}];
 assert.equal(run().status,2);
 // Sol on Windows reads with PowerShell. Plain reads count: Get-Content and
 // its aliases gc, type and cat, of one or several plain paths, the entry
 // point among them, with or without -NoProfile and the executable's path.
 const pwsh = '"C:\\\\Program Files\\\\PowerShell\\\\7\\\\pwsh.exe"';
 config.models[0].command = [process.execPath,fake,'codex-command'];
 config.skills[0].queries = [{prompt:'yes 1',fire:true}];
 for (const command of [
  pwsh+" -Command 'Get-Content .agents/skills/fixture/SKILL.md'",
  pwsh+" -NoProfile -Command 'gc .agents/skills/fixture/SKILL.md'",
  "powershell.exe -c 'type .agents/skills/fixture/SKILL.md'",
  "pwsh -Command 'cat .agents/skills/fixture/SKILL.md'",
  pwsh+" -Command 'Get-Content .agents/skills/fixture/SKILL.md; Get-Content docs/agents/fixture.md; Get-Content ProjectSettings/ProjectVersion.txt'",
  pwsh+" -Command 'Get-Content docs/agents/fixture.md && Get-Content C:/project/.agents/skills/fixture/SKILL.md'",
  pwsh+' -Command "Get-Content .agents\\\\skills\\\\fixture\\\\SKILL.md"',
 ]) {
  process.env.FAKE_COMMAND = command;
  const read = run();
  assert.equal(read.status,0,command+'\n'+read.stdout);
  assert.match(read.stdout,/RESULT: fixture Opus q1 fired/,command);
 }
 // Lookalikes naming the entry point do not count: they are inconclusive.
 for (const command of [
  pwsh+" -Command 'Get-Content .agents/skills/fixture/SKILL.md | Select-String name'",
  pwsh+" -Command 'Get-ChildItem .agents/skills/fixture/SKILL.md'",
  pwsh+" -Command 'Get-Content -Path .agents/skills/fixture/SKILL.md'",
  pwsh+" -Command 'Get-Content .agents/skills/fixture/SKILL.md > copy.md'",
  pwsh+" -File 'Get-Content .agents/skills/fixture/SKILL.md'",
  "notpwsh.exe -Command 'Get-Content .agents/skills/fixture/SKILL.md'",
 ]) {
  process.env.FAKE_COMMAND = command;
  const lookalike = run();
  assert.equal(lookalike.status,2,command+'\n'+lookalike.stdout);
  assert.match(lookalike.stdout,/RESULT: fixture Opus q1 inconclusive/,command);
 }
 // A read through a variable names no path: it is no evidence either way.
 process.env.FAKE_COMMAND = pwsh+" -Command 'Get-Content -Path $x'";
 const variable = run();
 assert.equal(variable.status,1,variable.stdout);
 assert.match(variable.stdout,/RESULT: fixture Opus q1 not fired/);
 delete process.env.FAKE_COMMAND;
 config.models[0].harness = 'claude';
 config.models[0].command = [process.execPath,fake,'claude-tool-error'];
 config.skills[0].queries = [{prompt:'yes 1',fire:true},{prompt:'no 1',fire:false}];
 assert.equal(run().status,0);
 config.skills[0].queries = [{prompt:'skill error',fire:false}];
 assert.equal(run().status,2);
 config.models[0].harness = 'codex';
 config.skills[0].queries = [...['yes 1','yes 2','yes 3'].map(prompt=>({prompt,fire:true})),...['no 1','no 2','no 3'].map(prompt=>({prompt,fire:false}))];
 for (const mode of ['codex-ambiguous','codex-failed']) {
   config.models[0].command = [process.execPath,fake,mode];
   assert.equal(run().status,2,mode);
 }
 // Plugin callable names may differ from the entry point's bare name.
 config.models[0].command = [process.execPath,fake,'codex'];
 config.skills[0].name = 'fixture-pack:fixture';
 config.skills[0].readName = 'fixture';
 config.models[1].harness = 'codex';
 config.models[1].command = [process.execPath,fake,'codex'];
 const plugin = run();
 assert.equal(plugin.status,0,plugin.stdout);
 assert.match(plugin.stdout,/RESULT: fixture-pack:fixture Opus q1 fired/);
 config.skills[0].name = 'fixture';
 delete config.skills[0].readName;
 config.models[1].harness = 'claude';
 config.models[1].command = [process.execPath,fake];
 config.models[0].harness = 'opencode';
 config.models[0].command = [process.execPath,fake,'opencode'];
 assert.equal(run().status,0);
 config.skills[0].queries[0].fire = false;
 config.skills[0].queries.pop();
 assert.equal(run().status,1);
 config.skills[0].queries.push({prompt:'extra',fire:false});
 assert.equal(run().status,2);
 const evidence = path.join(dir,'evidence');
 const capture = spawnSync(process.execPath,[path.join(__dirname,'plugin-fixture/capture.js'),evidence,'probe',process.execPath,'-e',"console.log('stdout'); console.error('stderr'); process.exitCode=3"],{encoding:'utf8'});
 assert.equal(capture.status,3);
 assert.equal(capture.stdout,'stdout\n');
 assert.equal(capture.stderr,'stderr\n');
 const metadata = fs.readdirSync(evidence).find(name=>name.endsWith('.json'));
 const prefix = path.join(evidence,metadata.slice(0,-5));
 assert.equal(JSON.parse(fs.readFileSync(prefix+'.json','utf8')).status,3);
 assert.equal(fs.readFileSync(prefix+'.stdout','utf8'),'stdout\n');
 assert.equal(fs.readFileSync(prefix+'.stderr','utf8'),'stderr\n');
 assert.equal(fs.statSync(prefix+'.stdout').mode & 0o777,0o600);
 // With --reset, the session's changes to its committed Git project are
 // recorded, then undone, so the next session starts from the baseline.
 const project = path.join(dir,'reset-project');
 fs.mkdirSync(project);
 fs.writeFileSync(path.join(project,'tracked.txt'),'baseline\n');
 const git = (...args) => assert.equal(spawnSync('git',['-c','user.name=t','-c','user.email=t@example.invalid',...args],{cwd:project}).status,0);
 git('init','-q'); git('add','-A'); git('commit','-q','-m','baseline');
 const resetEvidence = path.join(dir,'reset-evidence');
 const session = spawnSync(process.execPath,[path.join(__dirname,'plugin-fixture/capture.js'),'--reset',resetEvidence,'probe',process.execPath,'-e',"const fs=require('fs'); fs.writeFileSync('tracked.txt','changed\\n'); fs.mkdirSync('src'); fs.writeFileSync('src/new.txt','x'); console.log('ran')"],{cwd:project,encoding:'utf8'});
 assert.equal(session.status,0,session.stderr);
 assert.equal(session.stdout,'ran\n');
 const resetMeta = fs.readdirSync(resetEvidence).find(name=>name.endsWith('.json'));
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(resetEvidence,resetMeta),'utf8')).changes,[' M tracked.txt','?? src/']);
 assert.equal(spawnSync('git',['status','--porcelain'],{cwd:project,encoding:'utf8'}).stdout,'');
 assert.equal(fs.readFileSync(path.join(project,'tracked.txt'),'utf8'),'baseline\n');
 // Without --reset, the project is left as the session left it.
 spawnSync(process.execPath,[path.join(__dirname,'plugin-fixture/capture.js'),resetEvidence,'probe',process.execPath,'-e',"require('fs').writeFileSync('kept.txt','x')"],{cwd:project});
 assert.ok(fs.existsSync(path.join(project,'kept.txt')));
 console.log('ok: modes, advisory tiers, repeat noise, failures, OpenCode and validation');
 // A user-invoked skill needs a per-harness prompt, and a case may require
 // text in the final answer as well as a firing outcome.
 config.models = [
  {label:'Opus',harness:'claude',model:'fake',tier:'frontier',command:[process.execPath,fake,'says']},
  {label:'Sol',harness:'codex',model:'fake',tier:'frontier',command:[process.execPath,fake,'codex-says']},
 ];
 const query = {prompt:{claude:'/ask yes',codex:'$ask no'},says:{claude:['/ask'],codex:['$ask']},fire:true};
 config.skills = [{name:'fixture',queries:[query]}];
 let says = run();
 assert.match(says.stdout,/RESULT: fixture Opus q1 fired; says all/);
 assert.match(says.stdout,/RESULT: fixture Sol q1 not fired; says all/);
 assert.equal(says.status,1,says.stdout);
 Object.assign(query,{prompt:{claude:'/ask',codex:'$ask'},fire:false});
 says = run();
 assert.equal(says.status,0,says.stdout);
 query.says = ['Recommended','absent text'];
 says = run();
 assert.equal(says.status,1,says.stdout);
 assert.match(says.stdout,/RESULT: fixture Opus q1 not fired; says missing "absent text"/);
 assert.match(says.stdout,/MODEL: fixture Sol fail/);
 // Only the last agent message is the answer.
 query.says = {claude:['/ask'],codex:['first draft']};
 assert.equal(run().status,1);
 query.prompt = {claude:'/ask'};
 says = run();
 assert.equal(says.status,2);
 assert.match(says.stderr,/no prompt for codex/);
 Object.assign(query,{prompt:'/ask',says:['/ask']});
 config.models.push({label:'Go',harness:'opencode',model:'fake',tier:'lower',command:[process.execPath,fake,'opencode']});
 assert.equal(run().status,0);
 says = run(['--full']);
 assert.equal(says.status,2);
 assert.match(says.stderr,/says is not supported for opencode/);
 console.log('ok: per-harness prompts and required answer text');
} finally { fs.rmSync(dir,{recursive:true,force:true}); }
require('./required-cases/test.js');
