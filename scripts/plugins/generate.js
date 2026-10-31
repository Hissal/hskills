#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {load} = require('../check/collection');
const {outputs} = require('./output');
try {
 const root=path.resolve(process.argv[2] || path.join(__dirname,'../..'));
 const c=load(root);
 const out=outputs(c);
 for (const file of c.files.filter(f=>/^skills\/(core|packs\/[^/]+)\/\.(claude|codex)-plugin\/plugin.json$/.test(f))) {
  if (!Object.hasOwn(out,file)) fs.unlinkSync(path.join(root,file));
 }
 for (const [file,text] of Object.entries(out)) {
  fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});
  fs.writeFileSync(path.join(root,file),text);
 }
} catch (e) { console.error(e.message); process.exitCode=1; }
