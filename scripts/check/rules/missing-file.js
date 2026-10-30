'use strict';
// A skill names its own files with relative Markdown links. Every link from a
// Markdown file in the skill folder that lands inside that folder must reach a
// file (or a folder holding one) in the collection. Ignored files do not
// count: they never ship.

const isInside = (dir, p) => p.startsWith(dir + '/');

module.exports = {
  id: 'missing-file',
  level: 'fail',
  check(c) {
    const out = [];
    for (const s of c.skills) {
      for (const file of s.files.filter((f) => f.endsWith('.md'))) {
        for (const l of [...c.links(file), ...c.ownPaths(file, s)]) {
          if (isInside(s.dir, l.path) && !c.exists(l.path)) {
            out.push({ file, line: l.line, message: 'links ' + l.target + ', which is not in the skill folder' });
          }
        }
      }
    }
    return out;
  },
};
