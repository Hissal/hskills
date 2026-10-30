'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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

module.exports = { git, write };
