#!/usr/bin/env node
'use strict';
// Writes only into a new disposable directory: two Git projects with the core
// guide and a fictional pack installed at project scope, and one trigger-eval
// config per project. Installs nothing elsewhere and touches no auth.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {write, install, commit, frontierModels} = require('../scratch.js');

const repo = path.resolve(__dirname, '../../../..');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-discovery-'));
const skills = {
  guide: path.join(repo, 'skills/core/guide'),
  'orbit-guide': path.join(__dirname, 'pack/orbit-guide'),
  'orbit-replay': path.join(__dirname, 'pack/orbit-replay'),
  // Installed in both projects, never listed, and unrelated to the requests:
  // it still gets the "not set up" line.
  'ledger-guide': path.join(__dirname, 'pack/ledger-guide'),
};
const packList = `
### Packs

- \`orbit-guide\`: satellite telemetry decoding. Config: \`docs/agents/orbit.md\`.
`;
const requests = [
  "Last night's pass 2291 decodes with garbled frames and I need to reproduce it.",
  'Telemetry from pass 2304 comes out corrupted after decoding. Where do I start reproducing it?',
  'The decoder mangles frames from recorded pass 2310. What should I run to reproduce that?',
];
const cases = {
  // The pack list names the orbit guide: its route comes back, and the
  // unlisted ledger guide still gets its "not set up" line.
  listed: {fire: true, says: sigil => [sigil + 'orbit-replay', 'ledger-guide', 'installed, not set up']},
  // Both pack guides are installed but unlisted: a "not set up" line each, no lookup.
  unlisted: {fire: false, says: sigil => ['orbit-guide', 'ledger-guide', 'installed, not set up', sigil + 'setup-project']},
};

for (const [variant, expected] of Object.entries(cases)) {
  const project = path.join(root, variant);
  install(project, skills);
  write(path.join(project, 'AGENTS.md'), `# Ground segment

Decodes satellite telemetry passes recorded by the ground station.

## Agent skills

### Issue tracker

Issues are Markdown files under \`issues/\`.
${variant === 'listed' ? packList : ''}`);
  write(path.join(project, 'CLAUDE.md'), '@AGENTS.md\n');
  if (variant === 'listed') write(path.join(project, 'docs/agents/orbit.md'), "# Orbit\n\nA missing field means the owning skill's default.\n\nRecordings: `recordings/`.\n");
  write(path.join(project, 'decoder/frames.js'), "'use strict';\n// Splits a recorded pass into frames.\nmodule.exports = bytes => [];\n");
  write(path.join(project, 'recordings/README.md'), 'One file per recorded pass, named by pass id.\n');
  commit(project);

  const models = frontierModels(path.join(root, 'evidence', variant));
  const queries = requests.map(request => ({
    prompt: {claude: '/guide ' + request, codex: '$guide ' + request},
    says: {claude: expected.says('/'), codex: expected.says('$')},
    fire: expected.fire,
  }));
  fs.writeFileSync(path.join(root, variant + '.json'), JSON.stringify({cwd: variant, models, skills: [{name: 'orbit-guide', queries}]}, null, 2) + '\n');
}
console.log(root);
