'use strict';

const { value } = require('./frontmatter-value');
// The personal steering source (spec 2, #118); repository-relative.
// HSKILLS_ALWAYS_ON_PATH overrides it.
const alwaysOnPath = process.env.HSKILLS_ALWAYS_ON_PATH || 'steering.md';

function report(c) {
  const layers = new Map([['core', 0]]);
  for (const skill of c.skills) {
    const match = skill.dir.match(/^skills\/(core)\/[^/]+$|^skills\/packs\/([^/]+)\/[^/]+$/);
    if (!match) continue;
    const layer = match[1] || 'pack/' + match[2];
    if (!layers.has(layer)) layers.set(layer, 0);
    if (value(skill.frontmatter, 'disable-model-invocation') === 'true') continue;
    const text = value(skill.frontmatter, 'description') + value(skill.frontmatter, 'when_to_use');
    layers.set(layer, layers.get(layer) + Array.from(text).length / 4);
  }
  const findings = [];
  function figure(label, tokens, limit, file) {
    console.log('TRIPWIRE ' + label + ': ' + tokens + ' tokens (characters / 4; threshold ' + limit + ')');
    if (tokens > limit) findings.push({
      rule: 'idle-cost', level: 'warn', file,
      message: label + ' idle cost ' + tokens + ' tokens exceeds ' + limit + '; review the listing text.',
    });
  }
  for (const [layer, tokens] of [...layers].sort()) {
    figure(layer, tokens, 1000, layer === 'core' ? 'skills/core' : 'skills/packs/' + layer.slice(5));
  }
  if (!c.files.includes(alwaysOnPath)) console.log('TRIPWIRE always-on: not measured (file absent from collection: ' + alwaysOnPath + ')');
  else figure('always-on', Array.from(c.text(alwaysOnPath)).length / 4, 500, alwaysOnPath);
  return findings;
}

module.exports = { report };
