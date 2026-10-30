'use strict';
module.exports = {
  id: 'requirement-reference',
  level: 'fail',
  check(c) {
    const out = [];
    for (const s of c.skills) {
      const requirements = s.metadata.requires.map((id) => c.resolved.byId.get(id)).filter(Boolean);
      for (const file of s.files.filter((f) => f.endsWith('.md'))) {
        for (const link of c.links(file)) {
          if (requirements.some((r) => link.path.startsWith(r.dir + '/')) && !c.exists(link.path)) {
            out.push({ file, line: link.line, message: 'required skill lacks ' + link.path });
          }
        }
      }
    }
    return out;
  },
};
