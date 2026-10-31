'use strict';
// Core reaches packs only through the project's pack list (ADR 0003, #77
// owner answer 11, #111): an extension point names the need, never a pack
// guide or pack skill. Any text in a core skill's folder that names a pack
// skill from the manifest fails. Setup and the core guide's discovery name
// packs by design (catalog S47). An invalid manifest is collection-manifest's
// finding; this rule waits for it.

const ALLOWED = new Set(['skills/core/setup-project', 'skills/core/guide']);

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = {
  id: 'core-names-pack',
  level: 'fail',
  check(c) {
    const data = c.manifest.data;
    if (!data) return [];
    const names = [...new Set(Object.values(data.packs).flat().map((p) => p.split('/').pop()))];
    if (!names.length) return [];
    // a callable name as a whole token: not inside a longer kebab-case name
    const named = new RegExp('(?<![A-Za-z0-9_-])(' + names.map(escape).join('|') + ')(?![A-Za-z0-9_-])', 'g');
    const out = [];
    for (const s of c.skills) {
      if (!s.dir.startsWith('skills/core/') || ALLOWED.has(s.dir)) continue;
      for (const file of s.files.filter(c.isText)) {
        c.text(file).split(/\r?\n/).forEach((line, i) => {
          for (const name of new Set([...line.matchAll(named)].map((m) => m[1]))) {
            out.push({ file, line: i + 1, message: 'core skill names pack skill ' + name +
              '; name the need and ask the project\'s listed pack guides instead (ADR 0003)' });
          }
        });
      }
    }
    return out;
  },
};
