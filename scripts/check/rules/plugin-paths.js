'use strict';
const { keyIndex } = require('../frontmatter-value');

// Plugin installs ignore paths:, so a plugin-listed skill using it would be
// silently unlisted on that route (#110).
module.exports = {
  id: 'plugin-paths',
  level: 'fail',
  check(c) {
    const data = c.manifest.data;
    if (!data) return [];
    const listed = new Set([...data.core, ...Object.values(data.packs).flat()]);
    return c.skills.filter((s) => listed.has(s.dir)).flatMap((s) => {
      const i = keyIndex(s.frontmatter, 'paths');
      return i < 0 ? [] : [{ file: s.skillMd, line: s.fmLine + i, message: 'remove paths: from a skill listed in a plugin; plugin installs ignore it' }];
    });
  },
};
