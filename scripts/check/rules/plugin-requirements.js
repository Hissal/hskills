'use strict';
const { resolveSkills } = require('../metadata');

// A plugin is closed under requirements: core resolves within core, a pack
// within itself plus core (#77, owner answer 2). Requirements missing from the
// whole tree are skill-requirements' finding, not this one.
module.exports = {
  id: 'plugin-requirements',
  level: 'fail',
  check(c) {
    const data = c.manifest.data;
    if (!data) return [];
    const members = (paths) => c.skills.filter((s) => paths.includes(s.dir));
    const plugins = [['core', data.core, []], ...Object.entries(data.packs).map(([name, paths]) => ['pack ' + name, paths, data.core])];
    const out = [];
    for (const [name, paths, also] of plugins) {
      const resolved = resolveSkills(members([...paths, ...also])).byId;
      for (const s of members(paths)) {
        for (const id of s.metadata.requires) {
          if (c.resolved.byId.has(id) && !resolved.has(id)) {
            out.push({ file: s.skillMd, message: 'required ID ' + id + ' is outside the ' + name + ' plugin' + (also.length ? ' and core' : '') + '; move the requirement or the skill' });
          }
        }
      }
    }
    return out;
  },
};
