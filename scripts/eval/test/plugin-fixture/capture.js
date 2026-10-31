#!/usr/bin/env node
'use strict';
// Fixture-only evidence capture. Raw streams stay in a private scratch directory.
// Usage: capture.js [--reset] <evidence dir> <host> <command> [args...]
// --reset: after the session, record the project's `git status --porcelain`
// lines as `changes` in the metadata, then restore the committed baseline,
// so sessions in one scratch project cannot see each other's writes. It runs
// only when the working directory is a Git work tree's top level.
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const argv = process.argv.slice(2);
const reset = argv[0] === '--reset';
if (reset) argv.shift();
const [directory, host, command, ...args] = argv;
fs.mkdirSync(directory, {recursive:true, mode:0o700});
const prefix = path.join(directory, `${host}-${Date.now()}-${process.pid}`);
const run = spawnSync(command, args, {encoding:'utf8', timeout:115000, maxBuffer:16*1024*1024});
for (const key of ['stdout','stderr']) fs.writeFileSync(prefix+'.'+key, run[key] || '', {mode:0o600});
const metadata = {command:[command,...args],cwd:process.cwd(),status:run.status,error:run.error?.message};
if (reset) {
  const git = (...gitArgs) => spawnSync('git', gitArgs, {encoding:'utf8'});
  const top = git('rev-parse', '--show-toplevel');
  if (top.status !== 0 || fs.realpathSync(top.stdout.trim()) !== fs.realpathSync(process.cwd())) throw new Error('--reset needs the working directory to be a Git work tree top level');
  metadata.changes = git('status', '--porcelain').stdout.split('\n').filter(Boolean);
  for (const step of [['reset', '-q', '--hard'], ['clean', '-q', '-fdx']]) {
    const done = git(...step);
    if (done.status !== 0) throw new Error('git ' + step[0] + ' failed: ' + done.stderr);
  }
}
fs.writeFileSync(prefix+'.json', JSON.stringify(metadata), {mode:0o600});
process.stdout.write(run.stdout || '');
process.stderr.write(run.stderr || '');
process.exitCode = run.status ?? 2;
