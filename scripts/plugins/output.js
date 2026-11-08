'use strict';
const {parse} = require('../check/manifest');
const encode = data => JSON.stringify(data,null,2)+'\n';
function outputs(c) {
 const parsed = parse(c.text('collection.json'));
 if (parsed.errors.length) throw new Error(parsed.errors.join('; '));
 const version = c.text('version.txt').trim();
 if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)) throw new Error('invalid version.txt');
 const market = JSON.parse(c.text('.claude-plugin/marketplace.json'));
 // This namespace is owned by the generator; guard and other entries survive.
 market.plugins = market.plugins.filter(p => !p.name.startsWith('hskills-'));
 const out = {};
 const groups = [['core',parsed.data.core,true],...Object.entries(parsed.data.packs).sort(([a],[b])=>a < b ? -1 : a > b ? 1 : 0)];
 for (const [group,paths,isCore] of groups) {
  if (!paths.length) continue;
  if (group === 'onboarding' && paths.length !== 1) throw new Error('onboarding must contain exactly one skill');
  const root = isCore ? 'skills/core' : 'skills/packs/'+group;
  for (const p of paths) {
   if (p.slice(0,p.lastIndexOf('/')) !== root) throw new Error(p+' must be inside plugin root '+root);
   if (!c.exists(p+'/SKILL.md')) throw new Error('missing '+p+'/SKILL.md');
  }
  const name = isCore ? 'hskills-core' : 'hskills-'+group;
  const manifest = {name,version,description:'Generated '+group+' skill list from collection.json.',skills:[...new Set(paths)].sort().map(p=>'./'+p.slice(root.length+1))};
  for (const host of ['claude','codex']) out[root+'/.'+host+'-plugin/plugin.json']=encode(manifest);
  market.plugins.push({name,source:'./'+root,description:manifest.description,policy:{installation:'AVAILABLE',authentication:'ON_INSTALL'},category:'Productivity'});
 }
 if (c.exists('release-please-config.json')) {
  const config=JSON.parse(c.text('release-please-config.json'));
  const pkg=config.packages['.'];
  pkg['extra-files']=(pkg['extra-files'] || []).filter(s=>!/^skills\/(core|packs\/[^/]+)\/\.(claude|codex)-plugin\/plugin.json$/.test(s.path));
  for (const file of Object.keys(out).sort()) pkg['extra-files'].push({type:'json',path:file,jsonpath:'$.version'});
  out['release-please-config.json']=encode(config);
 }
 out['.claude-plugin/marketplace.json']=encode(market);
 return out;
}
module.exports={outputs};
