'use strict';
// Each source a skill is copied from has its licence in full at
// licenses/<owner>/<repo>.txt.

const { LOCK } = require('../../vendor/lock');

module.exports = {
  id: 'vendor-licence',
  level: 'fail',
  check(c) {
    const v = c.vendor;
    if (v.errors.length) return [];
    const out = [];
    const reported = new Set();
    for (const e of v.entries) {
      if (c.files.includes(e.licence) || reported.has(e.licence)) continue;
      reported.add(e.licence);
      out.push({ file: LOCK, message: e.source + ' has no licence file: add its full licence text as ' + e.licence });
    }
    return out;
  },
};
