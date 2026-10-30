'use strict';
const { FILE } = require('../manifest');

module.exports = {
  id: 'collection-manifest',
  level: 'fail',
  check(c) {
    const manifest = c.manifest;
    const out = manifest.errors.map((message) => ({ file: FILE, message }));
    if (!manifest.exists || out.length) return out;
    const skills = new Set(c.skills.map((s) => s.dir));
    const data = manifest.data;
    for (const entry of new Set([...data.core, ...Object.values(data.packs).flat(), ...data.expensive])) {
      if (!skills.has(entry)) out.push({ file: FILE, message: entry + ' is not a skill folder (no ' + entry + '/SKILL.md)' });
    }
    return out;
  },
};
