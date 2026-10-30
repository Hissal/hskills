'use strict';
// Strict YAML loaders such as `npx skills` skip a skill whose plain
// (unquoted) description contains ": ". Claude Code's loader tolerates it, so
// the break is silent. Quoted and block-scalar descriptions are fine.

module.exports = {
  id: 'description-colon',
  level: 'fail',
  check(c) {
    const out = [];
    for (const s of c.skills) {
      if (!s.frontmatter) continue;
      const at = s.frontmatter.findIndex((l) => /^description:/.test(l));
      if (at < 0) continue;
      const first = s.frontmatter[at].slice('description:'.length).trim();
      if (/^["'|>]/.test(first)) continue;
      // a plain scalar continues on following indented lines
      const value = [first];
      for (let i = at + 1; i < s.frontmatter.length && /^\s+\S/.test(s.frontmatter[i]); i++) value.push(s.frontmatter[i].trim());
      if (value.some((v) => v.includes(': '))) {
        out.push({ file: s.skillMd, line: s.fmLine + at, message: 'description contains an unquoted ": "; wrap the value in double quotes' });
      }
    }
    return out;
  },
};
