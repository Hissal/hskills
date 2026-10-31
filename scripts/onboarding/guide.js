'use strict';
// The onboarding guide (#175): the core guide published model-invoked as the
// onboarding pack's one skill. Everything is the core guide's except the
// frontmatter's name, description, ID and gate, and the Codex gate file's
// gate. generate.js writes these outputs; the check's automatic-guide-sync
// rule compares the committed files with them, so the two cannot disagree.

const gates = require('../gates/gates');

const CORE = 'skills/core/guide';
const NAME = 'onboarding-guide';
const DIR = 'skills/packs/onboarding/' + NAME;
const ID = 'hissal.skill-collection/' + NAME;
const DESCRIPTION = 'Use before starting work when no workflow has been invoked and a collection workflow could help, or when an invoked workflow is clearly a poor fit.';
const COMMAND = 'node scripts/onboarding/generate.js';

// Top-level frontmatter keys the onboarding guide rewrites (a string) or drops
// (null): the gate becomes model-invoked, and the description alone is its
// trigger.
const TOP = { name: 'name: ' + NAME, description: 'description: ' + DESCRIPTION, 'disable-model-invocation': null, when_to_use: null };
const TOP_KEY = /^([A-Za-z_][\w-]*):/;
const ID_LINE = /^(\s+)agent-skills-sync\.id:/;

// The onboarding guide's SKILL.md and Codex gate file from the core guide's.
// codexText is null when the core guide has no gate file.
function generate(skillText, codexText) {
  if (!skillText.startsWith('---\n')) throw new Error(CORE + '/SKILL.md has no LF frontmatter');
  const end = skillText.indexOf('\n---\n', 3);
  if (end < 0) throw new Error(CORE + '/SKILL.md has no LF frontmatter');
  const out = [];
  const found = new Set();
  let skipping = false;
  for (const line of skillText.slice(4, end).split('\n')) {
    const key = (line.match(TOP_KEY) || [])[1];
    if (key === undefined && skipping) continue; // a dropped value's continuation
    skipping = false;
    if (key !== undefined && Object.hasOwn(TOP, key)) {
      found.add(key);
      skipping = true;
      if (TOP[key] !== null) out.push(TOP[key]);
    } else if (ID_LINE.test(line)) {
      found.add('id');
      out.push(line.match(ID_LINE)[1] + 'agent-skills-sync.id: "' + ID + '"');
    } else out.push(line);
  }
  for (const key of ['name', 'description', 'id']) if (!found.has(key)) throw new Error(CORE + '/SKILL.md frontmatter has no ' + key);
  const text = '---\n' + out.join('\n') + skillText.slice(end);
  const next = gates.generate(text, codexText, DIR);
  return { skillMd: next.skillMd, codex: next.codex };
}

// Every file of the onboarding guide, from the core guide in collection `c`:
// { files: { path: Buffer }, stale: [path] }, where stale lists files in the
// onboarding guide's folder the generator does not write.
function outputs(c) {
  const skillMd = CORE + '/SKILL.md';
  if (!c.exists(skillMd)) throw new Error('missing ' + skillMd);
  const codexFile = CORE + '/' + gates.CODEX_FILE;
  const next = generate(c.text(skillMd), c.exists(codexFile) ? c.text(codexFile) : null);
  const files = {
    [DIR + '/SKILL.md']: Buffer.from(next.skillMd),
    [DIR + '/' + gates.CODEX_FILE]: Buffer.from(next.codex),
  };
  for (const f of c.files) {
    if (!f.startsWith(CORE + '/') || f === skillMd || f === codexFile) continue;
    files[DIR + f.slice(CORE.length)] = c.bytes(f);
  }
  const stale = c.files.filter((f) => f.startsWith(DIR + '/') && !Object.hasOwn(files, f));
  return { files, stale };
}

module.exports = { CORE, NAME, DIR, DESCRIPTION, COMMAND, generate, outputs };
