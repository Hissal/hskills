'use strict';
// Every copied skill has a whole-folder baseline at
// vendor/<owner>/<repo>/<skill>/, outside every skill root and plugin
// directory, and everything under vendor/ belongs to a lock entry's baseline.

const { LOCK, VENDOR, baselineOf } = require('../../vendor/lock');

module.exports = {
  id: 'vendor-baseline',
  level: 'fail',
  check(c) {
    const v = c.vendor;
    if (v.errors.length) return [];
    const out = [];
    for (const e of v.entries) {
      if (!c.files.includes(e.baseline + '/SKILL.md')) {
        out.push({ file: LOCK, message: e.skill + ' has no baseline: copy the source folder at ' + e.sha + ' to ' + e.baseline + '/' });
      }
    }
    for (const file of c.files) {
      if (file.startsWith(VENDOR + '/') && !baselineOf(v.entries, file)) {
        out.push({ file, message: 'is under ' + VENDOR + '/ but in no baseline a ' + LOCK + ' entry names' });
      }
    }
    return out;
  },
};
