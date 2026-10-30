'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Preparation is independent of registration: never remove a functioning hook
// merely because its replacement's files exist.
function prepare(home) {
  const source = path.resolve(__dirname, '../../hooks/command-guard');
  const files = [];
  for (const dir of ['.claude-plugin', '.codex-plugin', 'hooks', 'engine', 'rules', 'adapters']) {
    for (const name of fs.readdirSync(path.join(source, dir)).sort()) {
      files.push([dir + '/' + name, fs.readFileSync(path.join(source, dir, name))]);
    }
  }
  const hash = crypto.createHash('sha256');
  for (const [name, content] of files) hash.update(name).update('\0').update(content).update('\0');
  const version = JSON.parse(fs.readFileSync(path.join(source, '.claude-plugin/plugin.json'))).version;
  const dest = path.join(home, '.skill-collection/plugin-cache', version + '-' + hash.digest('hex'));
  if (fs.existsSync(dest)) {
    for (const [name, content] of files) {
      if (!fs.readFileSync(path.join(dest, name)).equals(content)) throw new Error('CONFLICT modified plugin snapshot: ' + dest);
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const stage = fs.mkdtempSync(path.join(path.dirname(dest), '.prepare-'));
    try {
      for (const [name, content] of files) {
        const target = path.join(stage, name);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content);
      }
      fs.renameSync(stage, dest);
    } finally { fs.rmSync(stage, { recursive: true, force: true }); }
  }
  console.log('Prepared plugin snapshot: ' + dest);
  console.log('UNSUPPORTED automatic plugin registration switch: effective host hook loading and trust remain unverified. Existing guard registration preserved.');
  console.log('PENDING Codex human trust: review the installed hook in /hooks; adapter probes cannot establish trust.');
}
module.exports = { prepare };
