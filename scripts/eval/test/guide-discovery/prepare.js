#!/usr/bin/env node
'use strict';
// Writes only into a new disposable directory: two Git projects with the core
// guide and a fictional pack installed at project scope, and one trigger-eval
// config per project. Installs nothing elsewhere and touches no auth.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const repo = path.resolve(__dirname, '../../../..');
const capture = path.resolve(__dirname, '../plugin-fixture/capture.js');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guide-discovery-'));
const skills = {
  guide: path.join(repo, 'skills/core/guide'),
  'orbit-guide': path.join(__dirname, 'pack/orbit-guide'),
  'orbit-replay': path.join(__dirname, 'pack/orbit-replay'),
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
  // The pack list names the installed pack guide: its route comes back.
  listed: {fire: true, says: sigil => [sigil + 'orbit-replay']},
  // The pack guide is installed but unlisted: one "not set up" line, no lookup.
  unlisted: {fire: false, says: sigil => ['orbit-guide', 'installed, not set up', sigil + 'setup-project']},
};

function write(file, text) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, text);
}
function git(cwd, ...args) {
  const run = spawnSync('git', ['-c', 'user.name=fixture', '-c', 'user.email=fixture@example.invalid', ...args], {cwd, encoding: 'utf8'});
  if (run.status !== 0) throw new Error(`git ${args[0]} failed: ${run.stderr}`);
}

for (const [variant, expected] of Object.entries(cases)) {
  const project = path.join(root, variant);
  for (const scope of ['.claude/skills', '.agents/skills'])
    for (const [name, source] of Object.entries(skills))
      fs.cpSync(source, path.join(project, scope, name), {recursive: true});
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
  git(project, 'init', '-q');
  git(project, 'add', '-A');
  git(project, 'commit', '-q', '-m', 'baseline');

  // Reads anywhere and writes in the project are granted, so a run that starts
  // no workflow does so by choice; check the tree after the runs.
  const models = [
    {label: 'Opus', harness: 'claude', model: 'opus', tier: 'frontier', command: [process.env.CLAUDE_BIN || 'claude', '--permission-mode', 'acceptEdits', '--allowedTools', 'Read', 'Bash']},
    {label: 'Sol', harness: 'codex', model: process.env.SOL_MODEL || 'gpt-6.1-sol', tier: 'frontier', command: [process.env.CODEX_BIN || 'codex', '-c', 'sandbox_mode="workspace-write"']},
  ];
  for (const model of models) model.command = [process.execPath, capture, path.join(root, 'evidence', variant), model.harness, ...model.command];
  const queries = requests.map(request => ({
    prompt: {claude: '/guide ' + request, codex: '$guide ' + request},
    says: {claude: expected.says('/'), codex: expected.says('$')},
    fire: expected.fire,
  }));
  fs.writeFileSync(path.join(root, variant + '.json'), JSON.stringify({cwd: variant, models, skills: [{name: 'orbit-guide', queries}]}, null, 2) + '\n');
}
console.log(root);
