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
if (mode === 'codex') { console.log(JSON.stringify({type:'turn.completed'})); process.exit(0); }
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
 for (const mode of ['broken','error','codex']) {
   config.models[0].command = [process.execPath,fake,mode];
   config.models[0].harness = mode === 'codex' ? 'codex' : 'claude';
   assert.equal(run().status,2,mode);
 }
 config.models[0].harness = 'opencode';
 config.models[0].command = [process.execPath,fake,'opencode'];
 assert.equal(run().status,0);
 config.skills[0].queries[0].fire = false;
 config.skills[0].queries.pop();
 assert.equal(run().status,1);
 config.skills[0].queries.push({prompt:'extra',fire:false});
 assert.equal(run().status,2);
 console.log('ok: modes, advisory tiers, repeat noise, failures, OpenCode and validation');
} finally { fs.rmSync(dir,{recursive:true,force:true}); }
