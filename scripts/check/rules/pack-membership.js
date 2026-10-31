'use strict';
const { FILE } = require('../manifest');

// Each skill belongs to core or exactly one pack (#77, #110).
module.exports = {
  id: 'pack-membership',
  level: 'fail',
  check(c) {
    const data = c.manifest.data;
    if (!data) return [];
    const groups = [['core', data.core], ...Object.entries(data.packs).map(([name, paths]) => ['pack ' + name, paths])];
    const out = [];
    for (const s of c.skills) {
      const listed = groups.filter(([, paths]) => paths.includes(s.dir)).map(([name]) => name);
      if (!listed.length) out.push({ file: s.skillMd, message: 'skill is in neither core nor a pack; list ' + s.dir + ' in ' + FILE });
      else if (listed.length > 1) out.push({ file: FILE, message: s.dir + ' is listed in ' + listed.join(' and ') + '; list it in core or exactly one pack' });
    }
    return out;
  },
};
