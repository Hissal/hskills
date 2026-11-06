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

 // Early stop: each session ends as soon as its firing is known. A step after
 // a wait in the fake runs only if nobody stopped the session, so a missing
 // marker file proves the harness (and the grandchild it started) was killed.
 const streamFake = path.join(__dirname,'stream-fake.js');
 const captureJs = path.join(__dirname,'plugin-fixture/capture.js');
 const pause = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,ms);
 let markers = 0;
 const marker = () => path.join(dir,`marker-${++markers}`);
 const use = (id,name,input={},message=id) => ({type:'assistant',message:{id:message,content:[{type:'tool_use',id,name,input}]}});
 const output = (id,isError=false) => ({type:'user',message:{content:[{type:'tool_result',tool_use_id:id,is_error:isError,content:'ok'}]}});
 const load = id => [use(id,'Skill',{skill:'fixture'}),output(id)];
 const success = text => ({type:'result',subtype:'success',is_error:false,result:text || 'done'});
 // Runs one query on Opus with the scripted session; Sol is the quick fake.
 function scripted(harness,steps,{says,wrap,cwd}={}) {
  const scenario = path.join(dir,'scenario.json');
  fs.writeFileSync(scenario,JSON.stringify(steps));
  const command = [process.execPath,streamFake,scenario];
  config.models = [
   {label:'Opus',harness,model:'fake',tier:'frontier',command:wrap ? [process.execPath,captureJs,...wrap,...command] : command},
   {label:'Sol',harness:'claude',model:'fake',tier:'frontier',command:[process.execPath,fake]},
  ];
  config.skills = [{name:'fixture',queries:[{prompt:'yes',fire:true,...(says ? {says} : {})}]}];
  if (cwd) config.cwd = cwd; else delete config.cwd;
  const started = Date.now();
  const result = run();
  return {outcome:result.stdout.match(/RESULT: fixture Opus q1 (.*)/)?.[1],ms:Date.now()-started,result};
 }
 // Fired: the session stops at the load, and the harness and its grandchild die.
 {
  const late = marker(), orphan = marker();
  const fired = scripted('claude',[{later:[1500,orphan]},...load('s1'),{wait:1500},{touch:late},success()]);
  assert.equal(fired.outcome,'fired',fired.result.stdout+fired.result.stderr);
  pause(2500);
  assert.ok(!fs.existsSync(late),'the harness ran on after the load');
  assert.ok(!fs.existsSync(orphan),'the harness\'s child ran on after the load');
 }

 // Not fired: a write, edit, web call or mutating or long-running command
 // before any load stops the session, so a load after it is never seen.
 for (const [name,input] of [
  ['Write',{file_path:'notes.md'}],['Edit',{file_path:'a.js'}],['WebFetch',{url:'https://example.invalid'}],['WebSearch',{query:'x'}],
  ['Bash',{command:'npm test'}],['Bash',{command:'echo x > notes.md'}],['Bash',{command:'rm -rf build'}],['Bash',{command:'git commit -m wip'}],
  ['Bash',{command:'cd app && dotnet build'}],['Bash',{command:'curl -s https://example.invalid'}],['Bash',{command:'sed -i s/a/b/ x.txt'}],
  ['PowerShell',{command:'Set-Content notes.md x'}],['PowerShell',{command:'& "C:\\Program Files\\Unity\\Editor\\Unity.exe" -batchmode -quit'}],
 ]) {
  const stopped = scripted('claude',[use('t1',name,input),output('t1'),...load('s1'),success()]);
  assert.equal(stopped.outcome,'not fired',`${name} ${JSON.stringify(input)}\n${stopped.result.stdout}`);
 }
 // Reads, searches and lists go on, so a load after them counts.
 for (const [name,input] of [
  ['Read',{file_path:'AGENTS.md'}],['Grep',{pattern:'x'}],['Glob',{pattern:'**/*.md'}],['TodoWrite',{todos:[]}],
  ['Bash',{command:'rg -n cart src'}],['Bash',{command:'git log --oneline -5 && git status'}],['Bash',{command:'ls -la .claude/skills 2>/dev/null | head -5'}],
  ['Bash',{command:'find . -name "*.md" > /dev/null'}],['Bash',{command:'echo "a > b; rm x"'}],['Bash',{command:'npm ls --depth 0'}],
  ['PowerShell',{command:'Get-ChildItem -Recurse | Select-String cart'}],['PowerShell',{command:'Get-Content a.md *> $null'}],
 ]) {
  const went = scripted('claude',[use('t1',name,input),output('t1'),...load('s1'),success()]);
  assert.equal(went.outcome,'fired',`${name} ${JSON.stringify(input)}\n${went.result.stdout}`);
 }
 // A load sent in the same message as the write still counts.
 {
  const parallel = scripted('claude',[use('t1','Write',{file_path:'x'},'m1'),use('s1','Skill',{skill:'fixture'},'m1'),output('t1'),output('s1'),success()]);
  assert.equal(parallel.outcome,'fired',parallel.result.stdout);
 }
 // A long-running command with nothing after it stops after a short settle,
 // not when it finishes.
 {
  const late = marker();
  const settled = scripted('claude',[use('t1','Bash',{command:'npm test'}),{wait:6000},{touch:late},output('t1'),...load('s1'),success()]);
  assert.equal(settled.outcome,'not fired',settled.result.stdout);
  assert.ok(settled.ms < 5000,`stopped after ${settled.ms} ms`);
 }

 // Budget: a load among the first 25 tool calls counts (the latest real first
 // load was at index 17); the 25th call without a load stops the session.
 {
  const reads = n => Array.from({length:n},(_,i)=>[use('r'+i,['Read','Bash','Glob','Grep'][i%4],i%4===1?{command:'git log -1'}:{}),output('r'+i)]).flat();
  const last = scripted('claude',[...reads(24),...load('s1'),success()]);
  assert.equal(last.outcome,'fired',last.result.stdout);
  const late = marker();
  const over = scripted('claude',[...reads(25),{wait:1500},{touch:late},...load('s1'),success()]);
  assert.equal(over.outcome,'not fired',over.result.stdout);
  pause(2000);
  assert.ok(!fs.existsSync(late),'the session ran on past the budget');
 }
 // A query with says runs to the end for its answer.
 {
  const late = marker();
  const answered = scripted('claude',[...load('s1'),{wait:300},{touch:late},use('t1','Write',{file_path:'x'}),output('t1'),success('Recommended: x')],{says:['Recommended']});
  assert.equal(answered.outcome,'fired; says all',answered.result.stdout);
  assert.ok(fs.existsSync(late),'a says query was stopped early');
 }
 // An error before the stop leaves the session inconclusive.
 for (const steps of [
  [use('o1','Skill',{skill:'other'}),output('o1',true),use('t1','Write',{file_path:'x'}),output('t1'),success()],
  [{type:'permission_denied'},...load('s1'),success()],
  [use('t1','Read'),{type:'error',message:'overloaded'},...load('s1'),success()],
 ]) {
  const errored = scripted('claude',steps);
  assert.equal(errored.outcome,'inconclusive',JSON.stringify(steps)+'\n'+errored.result.stdout);
 }

 // Codex: started and completed items, under one id, are one tool call.
 {
  const exec = (phase,id,command,out='') => ({type:'item.'+phase,item:{id,type:'command_execution',command,aggregated_output:out,exit_code:phase==='completed'?0:null,status:phase==='completed'?'completed':'in_progress'}});
  const read = id => [exec('started',id,"/bin/bash -lc 'cat .agents/skills/fixture/SKILL.md'"),exec('completed',id,"/bin/bash -lc 'cat .agents/skills/fixture/SKILL.md'",'---\nname: fixture\n---\nCount vowels.')];
  const turn = {type:'turn.completed'};
  const remove = '"C:\\\\Program Files\\\\PowerShell\\\\7\\\\pwsh.exe" -Command \'Remove-Item -Recurse Temp\'';
  const late = marker();
  const fired = scripted('codex',[...read('r1'),{wait:1500},{touch:late},turn]);
  assert.equal(fired.outcome,'fired',fired.result.stdout);
  pause(2000);
  assert.ok(!fs.existsSync(late),'the Codex session ran on after the read');
  for (const steps of [
   [{type:'item.completed',item:{id:'f1',type:'file_change',changes:[{path:'x',kind:'add'}],status:'completed'}},...read('r1'),turn],
   [{type:'item.started',item:{id:'w1',type:'web_search',query:'x'}},{type:'item.completed',item:{id:'w1',type:'web_search',query:'x'}},...read('r1'),turn],
   [exec('started','c1',"/bin/bash -lc 'npm install'"),exec('completed','c1',"/bin/bash -lc 'npm install'"),...read('r1'),turn],
   [exec('started','c1',remove),exec('completed','c1',remove),...read('r1'),turn],
  ]) {
   const stopped = scripted('codex',steps);
   assert.equal(stopped.outcome,'not fired',JSON.stringify(steps[0])+'\n'+stopped.result.stdout);
  }
  // A long-running command stops when it starts, not when it ends.
  const running = scripted('codex',[exec('started','c1',"/bin/bash -lc 'dotnet test'"),{wait:6000},exec('completed','c1',"/bin/bash -lc 'dotnet test'"),...read('r1'),turn]);
  assert.equal(running.outcome,'not fired',running.result.stdout);
  assert.ok(running.ms < 5000,`stopped after ${running.ms} ms`);
  // A read of the skill still running when a mutating command starts counts.
  const overlap = scripted('codex',[read('r1')[0],exec('started','c1',"/bin/bash -lc 'rm -rf tmp'"),exec('completed','c1',"/bin/bash -lc 'rm -rf tmp'"),read('r1')[1],turn]);
  assert.equal(overlap.outcome,'fired',overlap.result.stdout);
  // 24 commands, each started and completed, stay within the budget.
  const commands = Array.from({length:24},(_,i)=>[exec('started','c'+i,"/bin/bash -lc 'rg -n cart src'"),exec('completed','c'+i,"/bin/bash -lc 'rg -n cart src'")]).flat();
  const budget = scripted('codex',[...commands,...read('r1'),turn]);
  assert.equal(budget.outcome,'fired',budget.result.stdout);
 }
 // OpenCode reports each call when it completes; a step's calls end with step_finish.
 {
  const tool = (id,name,state) => ({type:'tool_use',part:{id,tool:name,state:{status:'completed',...state}}});
  const skillLoad = tool('k1','skill',{input:{id:'fixture-id'},metadata:{metadata:{name:'fixture'}}});
  const step = {type:'step_finish'};
  const late = marker();
  const fired = scripted('opencode',[skillLoad,{wait:1500},{touch:late},step]);
  assert.equal(fired.outcome,'fired',fired.result.stdout);
  pause(2000);
  assert.ok(!fs.existsSync(late),'the OpenCode session ran on after the load');
  const write = scripted('opencode',[tool('w1','write',{input:{filePath:'x'}}),step,skillLoad,step]);
  assert.equal(write.outcome,'not fired',write.result.stdout);
  const command = scripted('opencode',[tool('b1','bash',{input:{command:'npm test'}}),step,skillLoad,step]);
  assert.equal(command.outcome,'not fired',command.result.stdout);
  const listing = scripted('opencode',[tool('b1','bash',{input:{command:'ls -la'}}),step,skillLoad,step]);
  assert.equal(listing.outcome,'fired',listing.result.stdout);
  const sameStep = scripted('opencode',[tool('w1','write',{input:{filePath:'x'}}),skillLoad,step]);
  assert.equal(sameStep.outcome,'fired',sameStep.result.stdout);
 }

 // Through the evidence capture: the stop reaches the harness and its child,
 // and the capture still records the session and resets the project.
 {
  const project = path.join(dir,'stop-project');
  fs.mkdirSync(project);
  fs.writeFileSync(path.join(project,'tracked.txt'),'baseline\n');
  const git = (...args) => spawnSync('git',['-c','user.name=t','-c','user.email=t@example.invalid',...args],{cwd:project,encoding:'utf8'});
  git('init','-q'); git('add','-A'); git('commit','-q','-m','baseline');
  const evidence = path.join(dir,'stop-evidence');
  const late = marker(), orphan = marker();
  const wrapped = scripted('claude',[{touch:'tracked.txt'},{later:[1500,orphan]},...load('s1'),{wait:1500},{touch:late},success()],{wrap:['--reset',evidence,'claude'],cwd:project});
  assert.equal(wrapped.outcome,'fired',wrapped.result.stdout+wrapped.result.stderr);
  pause(2500);
  assert.ok(!fs.existsSync(late),'the wrapped harness ran on after the load');
  assert.ok(!fs.existsSync(orphan),'the wrapped harness\'s child ran on after the load');
  const metadata = fs.readdirSync(evidence).find(name=>name.endsWith('.json'));
  const recorded = JSON.parse(fs.readFileSync(path.join(evidence,metadata),'utf8'));
  assert.ok(recorded.stopped,JSON.stringify(recorded));
  assert.deepEqual(recorded.changes,[' M tracked.txt']);
  assert.match(fs.readFileSync(path.join(evidence,metadata.slice(0,-5)+'.stdout'),'utf8'),/"name":"Skill"/);
  assert.equal(git('status','--porcelain').stdout,'');
 }
 console.log('ok: sessions stop once their firing is known');
} finally { fs.rmSync(dir,{recursive:true,force:true}); }
require('./required-cases/test.js');
