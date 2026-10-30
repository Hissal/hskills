'use strict';
// Warns, never fails: deleting a skill on purpose is legitimate (#77, owner
// answer 4). Silent until the first release tag exists.
const { lastRelease } = require('../release');

module.exports = {
  id: 'id-stability',
  level: 'warn',
  check(c) {
    const release = lastRelease(c.root);
    if (!release) return [];
    const byDir = new Map(c.skills.map((s) => [s.dir, s]));
    const out = [];
    for (const old of release.skills) {
      const gone = !c.resolved.byId.has(old.id);
      const now = byDir.get(old.dir);
      if (now && now.metadata.id && now.metadata.id !== old.id) {
        out.push({ file: now.skillMd, message: 'folder carried ID ' + old.id + ' at ' + release.tag + ', now ' + now.metadata.id + (gone ? '; ' + old.id + ' is gone' : '') });
      } else if (gone) {
        out.push({ file: old.skillMd, message: 'ID ' + old.id + ' at ' + release.tag + ' is gone' });
      }
    }
    return out;
  },
};
