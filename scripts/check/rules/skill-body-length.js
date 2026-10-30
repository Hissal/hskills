'use strict';
// A long SKILL.md thins the agent's attention: what only some branches need
// belongs in a disclosed reference. Counts body lines between the first and
// last non-blank line after the frontmatter.

const LIMIT = 500;

module.exports = {
  id: 'skill-body-length',
  level: 'warn',
  check(c) {
    const out = [];
    for (const s of c.skills) {
      const body = s.body.map((l) => l.trim() !== '');
      const first = body.indexOf(true);
      const count = first < 0 ? 0 : body.lastIndexOf(true) - first + 1;
      if (count > LIMIT) out.push({ file: s.skillMd, message: 'body is ' + count + ' lines (over ' + LIMIT + '); disclose branch-only detail in references' });
    }
    return out;
  },
};
