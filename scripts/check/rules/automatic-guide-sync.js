'use strict';
// The automatic guide is the core guide published model-invoked (#77, #101):
// onboarding-guide, the onboarding pack's one skill (#175). It is generated
// from the core guide (skills/core/guide) by scripts/onboarding/generate.js
// and committed. Only frontmatter and the Codex gate file may differ from
// the core guide, and both must be what the generator writes. Every skill in
// the onboarding pack's folder is held to this, so a renamed or second skill
// there fails too. Silent until both guides exist.

const gates = require('../../gates/gates');
const guide = require('../../onboarding/guide');

const AUTOMATIC = /^skills\/packs\/onboarding\/[^/]+$/;

module.exports = {
  id: 'automatic-guide-sync',
  level: 'fail',
  check(c) {
    const core = c.skills.find((s) => s.dir === guide.CORE);
    if (!core) return [];
    const fix = 'run ' + guide.COMMAND + '; edit the core guide, never the automatic guide';
    const autos = c.skills.filter((s) => AUTOMATIC.test(s.dir));
    if (!autos.length) return [];
    let generated;
    try {
      generated = guide.outputs(c).files;
    } catch (e) {
      return [{ file: core.skillMd, message: 'cannot generate the automatic guide: ' + e.message }];
    }
    // The generator's SKILL.md and Codex gate file; every other file it
    // writes is a core guide file, compared byte for byte below.
    const expectedSkillMd = generated[guide.DIR + '/SKILL.md'];
    const expectedCodex = generated[guide.DIR + '/' + gates.CODEX_FILE];
    return autos.flatMap((auto) => {
      const out = [];
      const i = firstDifference(core.body, auto.body);
      if (i >= 0) out.push({ file: auto.skillMd, line: auto.bodyLine + i, message: 'body differs from ' + core.skillMd + '; ' + fix });
      else if (!c.bytes(auto.skillMd).equals(expectedSkillMd)) out.push({ file: auto.skillMd, message: 'frontmatter differs from what the generator writes; ' + fix });
      const autoCodex = auto.dir + '/' + gates.CODEX_FILE;
      if (c.exists(autoCodex) && !c.bytes(autoCodex).equals(expectedCodex)) out.push({ file: autoCodex, message: 'differs from what the generator writes; ' + fix });
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

// a skill's files other than SKILL.md and its Codex gate file (compared
// above), keyed by path inside its folder
function bundled(s) {
  return new Map(s.files.filter((f) => f !== s.skillMd).map((f) => [f.slice(s.dir.length + 1), f]).filter(([rel]) => rel !== gates.CODEX_FILE));
}

function firstDifference(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) return i;
  return -1;
}
