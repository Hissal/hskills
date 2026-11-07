'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {tempDir, testRunDir} = require('../../test-util');
// KEEP_PLUGIN_FIXTURE keeps the fixture, so it goes beside the run folder,
// which is removed when the run ends.
const root = process.env.KEEP_PLUGIN_FIXTURE ? fs.mkdtempSync(path.join(path.dirname(testRunDir()), 'plugins-124-')) : tempDir('plugins-124-');
const repo = path.resolve(__dirname, '../../..');
function write(p, data) { fs.mkdirSync(path.dirname(path.join(root,p)), {recursive:true}); fs.writeFileSync(path.join(root,p), data); }
function run(p) { return spawnSync(process.execPath,[path.join(repo,p),root],{encoding:'utf8',env:{...process.env,COLLECTION_CHECK_AGNIX:path.join(repo,'scripts/check/test/agnix-stub.js')}}); }
function json(p) { return JSON.parse(fs.readFileSync(path.join(root,p),'utf8')); }
try {
 spawnSync('git',['init','-q',root]);
 write('version.txt','0.1.0\n');
 for (const host of ['claude','codex']) write('hooks/command-guard/.'+host+'-plugin/plugin.json',JSON.stringify({name:'fixture-guard',version:'0.1.0'}));
 write('collection.json',JSON.stringify({core:['skills/core/fixture-required'],packs:{demo:['skills/packs/demo/fixture-work'],onboarding:['skills/packs/onboarding/fixture-auto']},expensive:[]}));
 write('release-please-config.json',fs.readFileSync(path.join(repo,'release-please-config.json'),'utf8'));
 write('.claude-plugin/marketplace.json',JSON.stringify({name:'fixture-124',owner:{name:'Hissal'},plugins:[{name:'command-guard',source:'./hooks/command-guard'}]}));
 for (const [p,name,body] of [
 ['skills/core/fixture-required','fixture-required','Read references/token.md and return its token.'],
 ['skills/packs/demo/fixture-work','fixture-work','Before work, load fixture-required (hissal.skill-collection/fixture-required). Stop and name the missing requirement if unavailable. Otherwise return the required token.'],
 ['skills/packs/onboarding/fixture-auto','fixture-auto','Suggest fixture-work when asked about the fixture task.'],
 ]) {
 write(p+'/SKILL.md',`---\nname: ${name}\ndescription: Use when asked for the issue 124 fixture task.\nmetadata:\n  opencode/autoinvoke: "true"\n  agent-skills-sync.schema: "1"\n  agent-skills-sync.id: "hissal.skill-collection/${name}"\n  agent-skills-sync.requires: '${name === 'fixture-work' ? '["hissal.skill-collection/fixture-required"]' : '[]'}'\n---\n${body}\n`);
 write(p+'/agents/openai.yaml','policy:\n  allow_implicit_invocation: true\n');
 }
 write('skills/core/fixture-required/references/token.md','# Token\n\nPLUGIN-124-IRIS\n');
 assert.equal(run('scripts/plugins/generate.js').status,0);
 assert.deepEqual(json('skills/core/.claude-plugin/plugin.json').skills,['./fixture-required']);
 assert.deepEqual(json('skills/packs/onboarding/.codex-plugin/plugin.json').skills,['./fixture-auto']);
 assert.equal(json('skills/packs/demo/.codex-plugin/plugin.json').version,'0.1.0');
 assert.equal(json('.claude-plugin/marketplace.json').plugins.length,4);
 assert.deepEqual(json('.claude-plugin/marketplace.json').plugins[0],{name:'command-guard',source:'./hooks/command-guard'});
 const release=run('scripts/release/dry-run.js');
 assert.equal(release.status,0,release.stderr);
 assert.match(release.stdout,/skills\/packs\/demo\/\.codex-plugin\/plugin.json=0.1.1/);
 const before=fs.readFileSync(path.join(root,'.claude-plugin/marketplace.json'),'utf8');
 assert.equal(run('scripts/plugins/generate.js').status,0);
 assert.equal(fs.readFileSync(path.join(root,'.claude-plugin/marketplace.json'),'utf8'),before);
 if (process.env.KEEP_PLUGIN_FIXTURE) { console.log(root); process.exit(0); }
 const clean=run('scripts/check/check.js');
 assert.equal(clean.status,0,clean.stdout);
 assert.doesNotMatch(clean.stdout, /\[plugin-output\]/);
 write('skills/packs/demo/.codex-plugin/plugin.json','{}\n');
 const stale=run('scripts/check/check.js');
 assert.equal(stale.status,1);
 assert.match(stale.stdout,/\[plugin-output\]/);
 assert.equal(fs.readFileSync(path.join(root,'skills/packs/demo/.codex-plugin/plugin.json'),'utf8'),'{}\n');
 assert.equal(run('scripts/plugins/generate.js').status,0);
 assert.doesNotMatch(run('scripts/check/check.js').stdout,/\[plugin-output\]/);
 assert.ok(json('release-please-config.json').packages['.']['extra-files'].some(s=>s.path==='skills/packs/demo/.codex-plugin/plugin.json'));
 const good=fs.readFileSync(path.join(root,'.claude-plugin/marketplace.json'),'utf8');
 write('collection.json',JSON.stringify({core:[],packs:{onboarding:['skills/packs/onboarding/fixture-auto','skills/packs/demo/fixture-work']},expensive:[]}));
 assert.equal(run('scripts/plugins/generate.js').status,1);
 assert.equal(fs.readFileSync(path.join(root,'.claude-plugin/marketplace.json'),'utf8'),good);
 write('collection.json',JSON.stringify({core:['skills/core/fixture-required'],packs:{demo:['skills/packs/demo/fixture-work'],onboarding:['skills/packs/onboarding/fixture-auto']},expensive:[]}));
 write('version.txt','0.1.1\n');
 assert.match(run('scripts/check/check.js').stdout,/\[plugin-output\]/);
 assert.equal(run('scripts/plugins/generate.js').status,0);
 assert.equal(json('skills/core/.codex-plugin/plugin.json').version,'0.1.1');
 write('collection.json',JSON.stringify({core:[],packs:{},expensive:[]}));
 assert.equal(run('scripts/plugins/generate.js').status,0);
 assert.equal(json('.claude-plugin/marketplace.json').plugins.length,1);
 assert.equal(fs.existsSync(path.join(root,'skills/core/.codex-plugin/plugin.json')),false);
 assert.ok(!json('release-please-config.json').packages['.']['extra-files'].some(s=>s.path.startsWith('skills/')));
 console.log('ok: plugin generator/check fixture');
} finally { if (!process.env.KEEP_PLUGIN_FIXTURE) fs.rmSync(root,{recursive:true,force:true}); }
