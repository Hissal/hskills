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
