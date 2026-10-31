'use strict';
// Expensive workflows are user-invoked, so a costly workflow never starts
// unasked (#77 owner answer 7, #111). The manifest's `expensive` list marks
// them; only the allow-listed workflows may stay model-invoked. An invalid
// manifest is collection-manifest's finding; this rule waits for it.

const gates = require('../../gates/gates');

// Expensive workflows other skills call through the Skill tool (#77 spec).
const ALLOWED = new Set(['code-review', 'research']);

module.exports = {
  id: 'expensive-workflow',
  level: 'fail',
  check(c) {
    const data = c.manifest.data;
    if (!data) return [];
    const expensive = new Set(data.expensive);
    const out = [];
    for (const s of c.skills) {
      if (!expensive.has(s.dir) || ALLOWED.has(s.name) || !s.frontmatter) continue;
      const src = gates.source(s.frontmatter);
      if (src.error || src.userInvoked) continue;
      out.push({ file: s.skillMd, line: s.fmLine + (src.line === undefined ? 0 : src.line),
        message: 'expensive workflow ' + s.name + ' is model-invoked and not on the allow-list (' + [...ALLOWED].join(', ') +
          '); set `' + gates.SOURCE + ': true`, then run `' + gates.WRITER + '`' });
    }
    return out;
  },
};
