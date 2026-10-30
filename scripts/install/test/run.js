'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');
const cli = path.resolve(__dirname, '../install.js');
const cases = [
  ['refuses an empty ownership record without installing', (f) => {
    fs.mkdirSync(path.dirname(f.record), { recursive: true });
    fs.writeFileSync(f.record, '');
    f.run(1);
    assert.equal(fs.readFileSync(f.record, 'utf8'), '');
    assert.equal(fs.existsSync(f.targets[0]), false);
  }],
  ['prints absolute Read rules for links and targets without settings writes', (f) => {
    f.run(0);
    const rule = file => 'Read(/' + file.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, drive) => '/' + drive.toLowerCase()) + '/**)';
    for (const file of [path.join(f.targets[0], 'alpha'), path.join(f.targets[1], 'alpha'), path.join(f.repo, 'skills/core/alpha')]) assert.ok(f.last.stdout.includes(JSON.stringify(rule(file))));
    assert.deepEqual(fs.readdirSync(f.home), ['.skill-collection']);
  }],
  ...['file', 'directory', 'link', 'dangling link'].map(kind => ['preserves unrecorded ' + kind, (f) => {
    fs.mkdirSync(f.targets[0], { recursive: true });
    const dest = path.join(f.targets[0], 'alpha');
    if (kind === 'file') fs.writeFileSync(dest, 'personal');
    else if (kind === 'directory') fs.mkdirSync(dest);
    else fs.symlinkSync(path.join(f.repo, kind === 'link' ? 'skills/core/alpha' : 'missing'), dest, process.platform === 'win32' ? 'junction' : 'dir');
    const before = fs.lstatSync(dest);
    f.run(1);
    assert.match(f.last.stdout, /CONFLICT unrecorded/);
    assert.equal(fs.lstatSync(dest).ino, before.ino);
    if (kind === 'file') assert.equal(fs.readFileSync(dest, 'utf8'), 'personal');
    assert.equal(JSON.parse(fs.readFileSync(f.record)).links.length, 1);
  }]),
  ['reconciles additions, renames and moves to packs', (f) => {
    f.run(0);
    fs.renameSync(path.join(f.repo, 'skills/core/alpha'), path.join(f.repo, 'skills/core/renamed'));
    fs.mkdirSync(path.join(f.repo, 'skills/core/beta'));
    f.manifest(['skills/core/renamed', 'skills/core/beta']);
    f.run(0);
    for (const root of f.targets) {
      assert.equal(fs.existsSync(path.join(root, 'alpha')), false);
      assert.deepEqual(fs.readdirSync(root).sort(), ['beta', 'renamed']);
    }
    fs.mkdirSync(path.join(f.repo, 'skills/packs/example'), { recursive: true });
    fs.renameSync(path.join(f.repo, 'skills/core/renamed'), path.join(f.repo, 'skills/packs/example/renamed'));
    f.manifest(['skills/core/beta'], { example: ['skills/packs/example/renamed'] });
    f.run(0);
    for (const root of f.targets) assert.deepEqual(fs.readdirSync(root), ['beta']);
  }],
  ['unchanged rerun leaves record and links unchanged', (f) => {
    f.run(0);
    const files = [f.record, ...f.targets.map(root => path.join(root, 'alpha'))];
    const before = files.map(file => fs.lstatSync(file));
    const content = fs.readFileSync(f.record, 'utf8');
    f.run(0);
    assert.equal(fs.readFileSync(f.record, 'utf8'), content);
    files.forEach((file, i) => {
      assert.equal(fs.lstatSync(file).mtimeMs, before[i].mtimeMs);
      assert.equal(fs.lstatSync(file).ino, before[i].ino);
    });
    assert.doesNotMatch(f.last.stdout, /LINK |REMOVE:/);
  }],
  ['doctor reports dangling links without writes', (f) => {
    f.run(0);
    const record = fs.readFileSync(f.record, 'utf8');
    fs.rmSync(path.join(f.repo, 'skills/core/alpha'), { recursive: true });
    f.run(1, 'doctor');
    assert.match(f.last.stdout, /DOCTOR dangling/);
    assert.equal(fs.readFileSync(f.record, 'utf8'), record);
  }],
  ...['file', 'link'].map(kind => ['doctor and reconcile preserve replaced ' + kind, (f) => {
    f.run(0);
    const dest = path.join(f.targets[0], 'alpha');
    fs.unlinkSync(dest);
    if (kind === 'file') fs.writeFileSync(dest, 'replacement');
    else fs.symlinkSync(f.repo, dest, process.platform === 'win32' ? 'junction' : 'dir');
    f.run(1, 'doctor');
    assert.match(f.last.stdout, /DOCTOR replaced/);
    f.manifest([]);
    f.run(1);
    assert.match(f.last.stdout, /CONFLICT recorded entry replaced/);
    assert.equal(kind === 'file' ? fs.readFileSync(dest, 'utf8') : fs.realpathSync(dest), kind === 'file' ? 'replacement' : f.repo);
  }]),
  ['restores a missing recorded link', (f) => {
    f.run(0);
    fs.unlinkSync(path.join(f.targets[0], 'alpha'));
    f.run(0);
    assert.equal(fs.realpathSync(path.join(f.targets[0], 'alpha')), path.join(f.repo, 'skills/core/alpha'));
  }],
  ['installs core in both roots and records links', (f) => {
    f.run(0);
    for (const root of f.targets) assert.equal(fs.realpathSync(path.join(root, 'alpha')), path.join(f.repo, 'skills/core/alpha'));
    assert.equal(JSON.parse(fs.readFileSync(f.record)).links.length, 2);
    assert.match(f.last.stdout, /Read\(/);
  }],
];
let failures = 0;
for (const [name, test] of cases) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'collection-install-'));
  try {
    const repo = path.join(temp, 'repo');
    const home = path.join(temp, 'home');
    const targets = [path.join(temp, 'claude'), path.join(temp, 'agents')];
    fs.mkdirSync(path.join(repo, 'skills/core/alpha'), { recursive: true });
    const f = { repo, home, targets, record: path.join(home, '.skill-collection/install.json'),
      manifest(core, packs = {}) { fs.writeFileSync(path.join(repo, 'collection.json'), JSON.stringify({ core, packs, expensive: [] })); },
      run(status, command = 'install') {
        this.last = spawnSync(process.execPath, [cli, command, '--home', home, '--source', repo, '--claude-root', targets[0], '--agents-root', targets[1]], { encoding: 'utf8' });
        assert.equal(this.last.status, status, this.last.stdout + this.last.stderr);
      },
    };
    f.manifest(['skills/core/alpha']);
    test(f);
  } catch (e) { console.log('FAIL ' + name + ': ' + e.message); failures++; }
  finally { fs.rmSync(temp, { recursive: true, force: true }); }
}
console.log(`${cases.length} install cases, ${failures} failures`);
process.exitCode = failures ? 1 : 0;
