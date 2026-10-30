'use strict';

module.exports = {
  id: 'guide-routes-paths',
  level: 'fail',
  check(c) {
    return c.skills.filter((s) => /^skills\/packs\/[^/]+\/[^/]+-guide$/.test(s.dir)
      && c.files.includes(s.dir + '/ROUTES.md'))
      .flatMap((s) => {
        const i = (s.frontmatter || []).findIndex((line) => /^paths\s*:/.test(line));
        return i < 0 ? [] : [{ file: s.skillMd, line: s.fmLine + i, message: 'remove paths: from a pack guide with routes so discovery can always list it' }];
      });
  },
};
