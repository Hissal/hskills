#!/usr/bin/env node
'use strict';
// Fixture-only evidence capture. Raw streams stay in a private scratch directory.
// Usage: capture.js [--reset] <evidence dir> <host> <command> [args...]
// The command's output passes through as it arrives, so the trigger eval can
// stop the session once its firing is known.
// --reset: after the session, record the project's `git status --porcelain`
// lines as `changes` in the metadata, then restore the committed baseline,
// so sessions in one scratch project cannot see each other's writes. It runs
// only when the working directory is a Git work tree's top level.
// Stopping: when TRIGGER_EVAL_STOP names a file, the capture creates
// `<file>.wrapper` to say it stops itself, and once the file appears it kills
// the command's process tree, then still records and resets before exiting.
// SIGINT, SIGTERM and SIGHUP do the same. A stopped session's metadata has
// `stopped`.
const fs = require('node:fs');
const path = require('node:path');
const {spawn, spawnSync} = require('node:child_process');
const TIMEOUT_MS = 115000;
const CAP = 16 * 1024 * 1024;
const argv = process.argv.slice(2);
const reset = argv[0] === '--reset';
if (reset) argv.shift();
const [directory, host, command, ...args] = argv;
fs.mkdirSync(directory, {recursive:true, mode:0o700});
const prefix = path.join(directory, `${host}-${Date.now()}-${process.pid}`);
const windows = process.platform === 'win32';
const stopFile = process.env.TRIGGER_EVAL_STOP;
const env = {...process.env};
delete env.TRIGGER_EVAL_STOP;

const streams = {stdout: [], stderr: []};
const sizes = {stdout: 0, stderr: 0};
let error;
let stopped = '';
let killing = false;
let finished = false;
// The command leads its own process group on POSIX, so killing the group
// reaches everything it started; Windows kills the tree with taskkill.
const child = spawn(command, args, {stdio: ['pipe', 'pipe', 'pipe'], detached: !windows, windowsHide: true, env});
// `<file>.wrapper` holds this pid, then the command's process group, so the
// evaluator can still kill that group if this capture is killed first.
if (stopFile) fs.writeFileSync(stopFile + '.wrapper', `${process.pid} ${child.pid ?? ''}`.trim());
function signalTree(signal) {
  if (child.pid === undefined) return;
  if (windows) spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {stdio: 'ignore', windowsHide: true});
  else try { process.kill(-child.pid, signal); } catch { /* already gone */ }
}
function kill() {
  if (killing || finished) return;
  killing = true;
  signalTree('SIGTERM');
  if (!windows) setTimeout(() => signalTree('SIGKILL'), 5000).unref();
}
const timeout = setTimeout(() => { error ??= `timed out after ${TIMEOUT_MS} ms`; kill(); }, TIMEOUT_MS);
const poll = stopFile ? setInterval(() => { if (fs.existsSync(stopFile)) { stopped ||= 'stop file'; kill(); } }, 100) : null;
if (!windows) for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(signal, () => { stopped ||= signal; kill(); });

child.stdin.on('error', () => {});
child.stdin.end();
for (const key of ['stdout', 'stderr']) child[key].on('data', chunk => {
  sizes[key] += chunk.length;
  if (sizes[key] > CAP) { error ??= `${key} exceeded ${CAP} bytes`; kill(); return; }
  streams[key].push(chunk);
  process[key].write(chunk);
});
// Once the command has exited, kill what is left of its group.
child.on('exit', () => { if (killing && !windows) signalTree('SIGKILL'); });
child.on('error', spawnError => { error ??= spawnError.message; if (child.pid === undefined) finish(null); });
child.on('close', status => finish(status));

function finish(status) {
  if (finished) return;
  finished = true;
  clearTimeout(timeout);
  if (poll) clearInterval(poll);
  for (const key of ['stdout', 'stderr']) fs.writeFileSync(prefix + '.' + key, Buffer.concat(streams[key]), {mode:0o600});
  const metadata = {command:[command, ...args], cwd:process.cwd(), status, error};
  if (stopped) metadata.stopped = stopped;
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
  fs.writeFileSync(prefix + '.json', JSON.stringify(metadata), {mode:0o600});
  process.exitCode = status ?? 2;
}
