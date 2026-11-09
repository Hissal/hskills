'use strict';
// Shared manifest view for checks and install tooling. Membership policy:
// rules/pack-membership.js, plugin-paths.js and plugin-requirements.js (#110).
const FILE = 'collection.json';

function parse(text) {
  try {
    const data = JSON.parse(text);
    const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
    const slug = '[a-z0-9]+(?:-[a-z0-9]+)*';
    const skillPath = new RegExp('^skills/(?:core/|packs/' + slug + '/)' + slug + '$');
    const list = (v) => Array.isArray(v) && v.every((p) => typeof p === 'string' && skillPath.test(p));
    const valid = object(data) && Object.keys(data).sort().join(',') === 'core,expensive,packs' &&
      list(data.core) && object(data.packs) && list(data.expensive) &&
      Object.entries(data.packs).every(([name, paths]) => new RegExp('^' + slug + '$').test(name) && list(paths));
    if (!valid) return { data: null, errors: [
      'expected exactly core and expensive skill-path arrays and a packs object of named skill-path arrays; see docs/skill-format.md',
    ] };
    // Pack plugins are named hskills-<pack>, so a pack named core would share core's plugin name.
    if (Object.hasOwn(data.packs, 'core')) return { data: null, errors: [
      'pack name core is reserved: its plugin would share the core plugin name hskills-core; see docs/skill-format.md',
    ] };
    return { data, errors: [] };
  } catch (e) {
    return { data: null, errors: ['invalid JSON: ' + e.message] };
  }
}

module.exports = { FILE, parse };
