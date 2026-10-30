'use strict';
const { copiedSkillOf } = require('../../vendor/lock');

// Keep emoji variation selectors and ordinary non-ASCII letters usable.
const HIDDEN = /[\u00AD\u034F\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF\uFFF9-\uFFFB\u{E0000}-\u{E007F}]/gu;

// Match home roots at path boundaries, including Windows paths in JSON.
const HOME = /(?:^|[^\p{L}\p{N}_./\\-])((?:[A-Za-z]:[\\/]+(?:Users|Documents and Settings)[\\/]+[^\\/\s"'`<>]+|\/(?:home|Users)\/[^/\s"'`<>]+|\/root)(?=$|[\\/\s"'`<>.,;:)}\]]))/iu;

module.exports = {
  id: 'copied-file-safety',
  level: 'fail',
  check(c) {
    const v = c.vendor;
    if (v.errors.length) return [];
    const out = [];
    for (const file of c.files) {
      if (!copiedSkillOf(v.entries, file) || !c.isText(file)) continue;
      c.text(file).split('\n').forEach((text, index) => {
        if (HOME.test(text)) out.push({ file, line: index + 1, message: 'personal absolute path; replace the home directory with a portable path or variable' });
        for (const match of text.matchAll(HIDDEN)) {
          const point = match[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
          out.push({ file, line: index + 1, message: 'hidden Unicode U+' + point + '; remove the control character' });
        }
      });
    }
    return out;
  },
};
