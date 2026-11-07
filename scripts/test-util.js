'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

function git(dir, args) {
  const res = spawnSync('git', ['-c', 'user.name=fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'core.autocrlf=false', '-c', 'init.defaultBranch=trunk', ...args], { cwd: dir, encoding: 'utf8' });
  if (res.status !== 0) throw new Error('git ' + args.join(' ') + ' failed: ' + res.stderr);
  return res.stdout.trim();
}

function write(dir, files) {
  for (const [file, content] of Object.entries(files || {})) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), content);
  }
}

// Test temp folders (#329). The first runner in a process tree to ask makes
// one run folder and passes it to its children through RUN_ENV; every runner
// below it makes its folders inside. The runners are synchronous, so a signal
// listener would only run once the whole run had finished: instead a detached
// watcher removes the run folder as soon as the runner that made it is gone,
// whether it exited, timed out or was killed. The run folder is also the
// tree's temp dir, so the code under test leaves nothing outside it either.
const RUN_ENV = 'SKILL_COLLECTION_TEST_TMP';
const RUN_PREFIX = 'skill-collection-test-';
// A run folder this old outlived its watcher too (e.g. both were killed).
const STALE_MS = 24 * 60 * 60 * 1000;
const WATCHER = "const fs = require('fs'); const [pid, dir] = process.argv.slice(1);"
  + " const alive = () => { try { process.kill(Number(pid), 0); return true; } catch (e) { return e.code === 'EPERM'; } };"
  + ' const timer = setInterval(() => { if (alive()) return; clearInterval(timer); fs.rmSync(dir, { recursive: true, force: true, maxRetries: 20, retryDelay: 500 }); }, 200);';
let runFolder;

function sweepStale(tmp) {
  let names;
  try { names = fs.readdirSync(tmp); } catch { return; }
  for (const name of names.filter((n) => n.startsWith(RUN_PREFIX))) {
    // Another user's folder in a shared temp dir is theirs to remove.
    try {
      if (Date.now() - fs.statSync(path.join(tmp, name)).mtimeMs > STALE_MS) fs.rmSync(path.join(tmp, name), { recursive: true, force: true });
    } catch { /* keep it */ }
  }
}

function runDir() {
  if (runFolder) return runFolder;
  const inherited = process.env[RUN_ENV];
  if (inherited && fs.existsSync(inherited)) return (runFolder = inherited);
  sweepStale(os.tmpdir());
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), RUN_PREFIX));
  spawn(process.execPath, ['-e', WATCHER, String(process.pid), dir], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
  process.on('exit', () => fs.rmSync(dir, { recursive: true, force: true }));
  process.env[RUN_ENV] = dir;
  // Folders the code under test makes in the temp dir land here too.
  for (const name of ['TMPDIR', 'TEMP', 'TMP']) process.env[name] = dir;
  return (runFolder = dir);
}

// A new folder for a test: its name starts with prefix, and it is removed
// with the run folder at the latest.
function tempDir(prefix) {
  return fs.mkdtempSync(path.join(runDir(), prefix));
}

module.exports = { git, write, tempDir, testRunDir: runDir };
