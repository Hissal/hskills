'use strict';
// Each copied skill's folder carries the NOTICE.md that
// scripts/vendor/notice.js generates from the lock and the licence area, so
// the notice travels with plugin and folder installs. A skill adapted in its
// own words has no lock entry; its NOTICE.md is hand-written and links each
// source pinned to a full commit SHA (#157).

const { copiedSkillOf } = require('../../vendor/lock');
const { renderNotice, GENERATED } = require('../../vendor/notice');

const FIX = 'run node scripts/vendor/notice.js';

// A skill adapted in its own words (no lock entry) may carry a hand-written
// NOTICE.md naming its sources. Returns why it is not one, or null.
const SOURCE_LINK = /\]\((https:\/\/github\.com\/[^/)\s]+\/[^/)\s]+\/(?:blob|tree)\/([^/)\s]+)[^)\s]*)\)/g;
function adaptedNoticeProblem(text) {
  if (text.startsWith(GENERATED)) return 'is a generated copy notice';
  const refs = [...text.matchAll(SOURCE_LINK)].map((m) => m[2]);
  if (!refs.length) return 'links no source pinned to a full commit SHA';
  if (refs.some((r) => !/^[0-9a-f]{40}$/.test(r))) return 'has a source link not pinned to a full commit SHA';
  return null;
}

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
      if (!s.files.includes(notice) || copiedSkillOf(v.entries, s.skillMd)) continue;
      const problem = adaptedNoticeProblem(c.text(notice));
      if (problem) {
        out.push({ file: notice, message: 'skill is not in vendor.lock.json and its NOTICE.md ' + problem + ': record a copy in the lock, link each adapted source pinned to a full commit SHA, or delete the NOTICE.md' });
      }
    }
    return out;
  },
};
