'use strict';
// The automatic guide is the core guide published model-invoked (#77, #101).
// It is generated from the core guide and committed, and may differ only in
// frontmatter (the gate and the description). The generated Codex gate file
// is frontmatter-derived, so it is skipped like frontmatter; harness-gates
// checks it against its source. The core guide is
// skills/core/guide; the automatic guide's callable name is not decided, so it
// is the onboarding pack's skill, which ships nothing else. Silent until both
// exist.

const gates = require('../../gates/gates');

const CORE = 'skills/core/guide';
const AUTOMATIC = /^skills\/packs\/onboarding\/[^/]+$/;

module.exports = {
  id: 'automatic-guide-sync',
  level: 'fail',
  check(c) {
    const core = c.skills.find((s) => s.dir === CORE);
    if (!core) return [];
    const fix = 'regenerate the automatic guide from ' + CORE + '; only frontmatter may differ';
    return c.skills.filter((s) => AUTOMATIC.test(s.dir)).flatMap((auto) => {
      const out = [];
      const i = firstDifference(core.body, auto.body);
      if (i >= 0) out.push({ file: auto.skillMd, line: auto.bodyLine + i, message: 'body differs from ' + core.skillMd + '; ' + fix });
      const coreFiles = bundled(core);
      const autoFiles = bundled(auto);
      for (const [rel, file] of coreFiles) {
        if (!autoFiles.has(rel)) out.push({ file: auto.skillMd, message: 'missing ' + rel + ' bundled by the core guide; ' + fix });
        else if (!c.bytes(file).equals(c.bytes(autoFiles.get(rel)))) out.push({ file: autoFiles.get(rel), message: 'differs from ' + file + '; ' + fix });
      }
      for (const [rel, file] of autoFiles) if (!coreFiles.has(rel)) out.push({ file, message: 'not bundled by the core guide; ' + fix });
      return out;
    });
  },
};

// a skill's files other than SKILL.md and its generated gate file, keyed by
// path inside its folder
function bundled(s) {
  return new Map(s.files.filter((f) => f !== s.skillMd).map((f) => [f.slice(s.dir.length + 1), f]).filter(([rel]) => rel !== gates.CODEX_FILE));
}

function firstDifference(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) return i;
  return -1;
}
