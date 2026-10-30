'use strict';
module.exports = {
  id: 'requirement-body-id',
  level: 'fail',
  check(c) {
    const out = [];
    for (const s of c.skills) {
      const body = s.body.join('\n');
      for (const id of s.metadata.requires) {
        if (!body.includes(id)) {
          out.push({ file: s.skillMd, message: 'name required ID ' + id + ' in the SKILL.md body' });
        }
      }
    }
    return out;
  },
};
