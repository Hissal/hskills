'use strict';
// Each copied skill's folder carries the NOTICE.md that
// scripts/vendor/notice.js generates from the lock and the licence area, so
// the notice travels with plugin and folder installs. A NOTICE.md in a skill
// that is not copied has no lock entry to come from.

const { copiedSkillOf } = require('../../vendor/lock');
const { renderNotice } = require('../../vendor/notice');

const FIX = 'run node scripts/vendor/notice.js';

module.exports = {
  id: 'vendor-notice',
  level: 'fail',
  check(c) {
    const v = c.vendor;
    if (v.errors.length) return [];
    const out = [];
    for (const e of v.entries) {
      if (!c.skills.some((s) => s.dir === e.skill)) continue; // vendor-lock reports it
      if (!c.files.includes(e.notice)) {
        out.push({ file: e.notice, message: 'copied skill has no NOTICE.md: ' + FIX });
      } else if (c.files.includes(e.licence) && c.text(e.notice) !== renderNotice(e, c.text(e.licence))) {
        out.push({ file: e.notice, message: 'differs from the lock and ' + e.licence + ': ' + FIX + ' (never edit it by hand)' });
      }
    }
    for (const s of c.skills) {
      const notice = s.dir + '/NOTICE.md';
      if (s.files.includes(notice) && !copiedSkillOf(v.entries, s.skillMd)) {
        out.push({ file: notice, message: 'skill is not in vendor.lock.json: record the copy there, or delete the NOTICE.md' });
      }
    }
    return out;
  },
};
