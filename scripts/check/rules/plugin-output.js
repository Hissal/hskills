'use strict';
const {outputs}=require('../../plugins/output');
module.exports={
 id:'plugin-output',level:'fail',
 check(c) {
  if (!c.exists('collection.json') || !c.exists('version.txt') || !c.exists('.claude-plugin/marketplace.json')) return [];
  try {
   const expected=outputs(c);
   const files=new Set([...Object.keys(expected),...c.files.filter(f=>/^skills\/(core|packs\/[^/]+)\/\.(claude|codex)-plugin\/plugin.json$/.test(f))]);
   return [...files].filter(f=>!Object.hasOwn(expected,f)||!c.exists(f)||c.text(f)!==expected[f]).map(file=>({file,message:'generated plugin output is missing or stale; run node scripts/plugins/generate.js'}));
  } catch(e) { return [{file:'collection.json',message:e.message+'; run node scripts/plugins/generate.js'}]; }
 }
};
