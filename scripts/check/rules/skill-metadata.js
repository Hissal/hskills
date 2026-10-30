'use strict';
module.exports = {
  id: 'skill-metadata',
  level: 'fail',
  check(c) {
    const out = [];
    for (const s of c.skills) if (s.metadata.errors.length) out.push({ file: s.skillMd, message: s.metadata.errors.join('; ') });
    for (const s of c.resolved.duplicates) out.push({ file: s.skillMd, message: 'duplicate skill ID ' + s.metadata.id });
    return out;
  },
};
