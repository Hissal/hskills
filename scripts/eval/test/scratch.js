'use strict';
// Shared by the required cases' prepare scripts: scratch Git projects with
// skills installed at project scope, and the frontier models wrapped by the
// evidence capture. Writes only where it is told to.
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const capture = path.resolve(__dirname, 'plugin-fixture/capture.js');

function write(file, text) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, text);
}
function git(cwd, ...args) {
  const run = spawnSync('git', ['-c', 'user.name=fixture', '-c', 'user.email=fixture@example.invalid', ...args], {cwd, encoding: 'utf8'});
  if (run.status !== 0) throw new Error(`git ${args[0]} failed: ${run.stderr}`);
}
// Copies each skill folder into the project's Claude and Codex skill scopes.
function install(project, skills) {
  for (const scope of ['.claude/skills', '.agents/skills'])
    for (const [name, source] of Object.entries(skills))
      fs.cpSync(source, path.join(project, scope, name), {recursive: true});
}
function commit(project) {
  git(project, 'init', '-q');
  git(project, 'add', '-A');
  git(project, 'commit', '-q', '-m', 'baseline');
}
// Reads anywhere and writes in the project are granted, so a run that starts
// no workflow does so by choice; check the tree after the runs. Raw sessions
// go to `evidence`. With `reset`, each session's project changes are recorded
// in its evidence metadata, then undone, so sessions cannot see each other's.
function frontierModels(evidence, {reset = false} = {}) {
  const models = [
    {label: 'Opus', harness: 'claude', model: 'opus', tier: 'frontier', command: [process.env.CLAUDE_BIN || 'claude', '--permission-mode', 'acceptEdits', '--allowedTools', 'Read', 'Bash']},
    {label: 'Sol', harness: 'codex', model: process.env.SOL_MODEL || 'gpt-6.1-sol', tier: 'frontier', command: [process.env.CODEX_BIN || 'codex', '-c', 'sandbox_mode="workspace-write"']},
  ];
  for (const model of models) model.command = [process.execPath, capture, ...(reset ? ['--reset'] : []), evidence, model.harness, ...model.command];
  return models;
}

module.exports = {write, install, commit, frontierModels};
