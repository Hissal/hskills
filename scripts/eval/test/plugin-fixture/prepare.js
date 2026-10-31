#!/usr/bin/env node
'use strict';
// Writes only into a new disposable directory. Does not install plugins or auth.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reach-123-'));
fs.cpSync(__dirname, path.join(root, 'marketplace'), {recursive:true});
for (const host of ['.claude-plugin','.codex-plugin']) {
 const manifest = path.join(root,'marketplace/pack',host,'plugin.json');
 fs.renameSync(manifest+'.fixture',manifest);
}
for (const variant of ['bare','qualified']) {
 const project = path.join(root, variant);
 const target = variant === 'bare' ? 'reach-token' : 'reach-fixture:reach-token';
 for (const scope of ['.claude/skills','.agents/skills']) {
  const guide = path.join(project, scope, 'reach-guide');
  fs.mkdirSync(guide, {recursive:true});
  fs.writeFileSync(path.join(guide,'SKILL.md'), fs.readFileSync(path.join(__dirname,'guide/SKILL.md'),'utf8').replace('TARGET',target));
 }
 const init = spawnSync('git',['init','-q',project],{encoding:'utf8'});
 if (init.status !== 0) throw new Error('scratch git init failed');
 const models = [
  {label:'Opus',harness:'claude',model:'opus',tier:'frontier',command:[process.env.CLAUDE_BIN || 'claude','--setting-sources','project','--plugin-dir',path.join(root,'marketplace/pack')]},
  {label:'Sol',harness:'codex',model:'gpt-6.1-sol',tier:'frontier',command:[process.env.CODEX_BIN || 'codex','--no-daemon']},
 ];
 for (const model of models) model.command = [process.execPath, path.join(__dirname,'capture.js'), path.join(root,'evidence',variant), model.harness, ...model.command];
 fs.writeFileSync(path.join(root, variant+'.json'),JSON.stringify({cwd:variant,models,skills:[{name:'reach-fixture:reach-token',readName:'reach-token',queries:[
  {prompt:'Obtain the issue 123 fixture token through the guide.',fire:true},
  {prompt:'Use the guide to obtain the issue 123 fixture token.',fire:true},
  {prompt:'Through the guide, retrieve the issue 123 fixture token.',fire:true},
  {prompt:'What is two plus two?',fire:false},
  {prompt:'Explain what a Git branch is.',fire:false},
  {prompt:'Write a greeting for a teammate.',fire:false},
 ]}]},null,2)+'\n');
}
for (const dir of ['home/.codex','home/.claude']) fs.mkdirSync(path.join(root,dir),{recursive:true});
console.log(root);
