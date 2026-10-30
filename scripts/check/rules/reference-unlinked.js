'use strict';
// Every reference is linked straight from SKILL.md, so no file is reachable
// only through another reference. A code span naming the file is not a link.

module.exports = {
  id: 'reference-unlinked',
  level: 'warn',
  check(c) {
    const out = [];
    for (const s of c.skills) {
      const linked = new Set(c.links(s.skillMd).map((l) => l.path));
      for (const file of c.references(s)) {
        if (!linked.has(file)) out.push({ file, message: 'reference is not linked from ' + s.skillMd });
      }
    }
    return out;
  },
};
