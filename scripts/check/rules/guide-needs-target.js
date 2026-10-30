'use strict';

module.exports = {
  id: 'guide-needs-target',
  level: 'fail',
  check(c) {
    const out = [];
    for (const s of c.skills.filter((s) => s.name.endsWith('-guide') || s.name === 'guide')) {
      const pack = s.dir.match(/^skills\/packs\/([^/]+)\/[^/]+$/);
      const scope = pack ? 'skills/packs/' + pack[1] : /^skills\/core\/[^/]+$/.test(s.dir) ? 'skills/core' : null;
      for (const row of c.needsTables(s)) {
        const target = row.target.replace(/^`(.*)`$/, '$1');
        if (/^vendor-guidance:\s*\S.+/.test(target)) continue;
        const skill = target.match(/^skill:\s*([a-z0-9-]+)$/);
        if (skill && scope && c.skills.some((other) => other.dir === scope + '/' + skill[1])) continue;
        const links = c.links(s.skillMd).filter((l) => l.line === row.line);
        if (links.length === 1 && links[0].path.startsWith(s.dir + '/') && c.files.includes(links[0].path)) continue;
        out.push({ file: s.skillMd, line: row.line, message: 'needs target must resolve to a file in this guide or a skill in the same pack (or core for a core guide); mark project-selected vendor guidance with vendor-guidance:' });
      }
    }
    return out;
  },
};
