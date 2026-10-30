'use strict';
module.exports = {
  id: 'skill-requirements',
  level: 'fail',
  check(c) {
    const out = [];
    for (const s of c.skills) {
      for (const id of s.metadata.requires) {
        if (!c.resolved.byId.has(id)) out.push({ file: s.skillMd, message: 'required ID is not in the resolved set: ' + id });
      }
    }
    const active = new Set();
    const done = new Set();
    function visit(s) {
      active.add(s);
      for (const id of s.metadata.requires) {
        const target = c.resolved.byId.get(id);
        if (!target) continue;
        if (active.has(target)) out.push({ file: s.skillMd, message: 'requirement cycle through ' + id });
        else if (!done.has(target)) visit(target);
      }
      active.delete(s);
      done.add(s);
    }
    for (const s of c.skills) if (!done.has(s)) visit(s);
    return out;
  },
};
