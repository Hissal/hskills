'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');
const cli = path.resolve(__dirname, '../install.js');
const cases = [
  ...['.claude', '.agents'].map(folder => ['preserves unrecorded project entry and exclude rules in ' + folder, (f) => {
    const project = path.join(f.home, 'project');
    const dest = path.join(project, folder, 'skills/alpha');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, 'personal');
    spawnSync('git', ['-C', project, 'init']);
    const exclude = path.join(project, '.git/info/exclude');
    fs.writeFileSync(exclude, '# personal rules\nother-file\n');
    f.run(1, 'install', ['--skill', 'alpha', '--project', project]);
    assert.equal(fs.readFileSync(dest, 'utf8'), 'personal');
    const text = fs.readFileSync(exclude, 'utf8');
    assert.ok(text.startsWith('# personal rules\nother-file\n'));
    assert.ok(!text.includes('/' + folder + '/skills/alpha'));
    f.run(1);
    assert.equal(fs.readFileSync(exclude, 'utf8'), text);
  }]),

  ['project extras are recorded, ignored and preserved on rerun', (f) => {
    const project = path.join(f.home, 'project');
    fs.mkdirSync(project, { recursive: true });
    const git = (...args) => spawnSync('git', ['-C', project, ...args], { encoding: 'utf8' });
    assert.equal(git('init').status, 0);
    fs.writeFileSync(path.join(project, 'skills-lock.json'), 'personal lock');
    f.run(0, 'install', ['--skill', 'alpha', '--project', project]);
    for (const folder of ['.claude', '.agents']) {
      const link = path.join(project, folder, 'skills/alpha');
      assert.equal(fs.realpathSync(link), path.join(f.repo, 'skills/core/alpha'));
      assert.equal(git('check-ignore', link).status, 0);
      assert.ok(JSON.parse(fs.readFileSync(f.record)).links.some(l => l.path === link));
    }
    const record = fs.readFileSync(f.record, 'utf8');
    f.run(0);
    assert.equal(fs.readFileSync(f.record, 'utf8'), record);
    assert.equal(fs.readFileSync(path.join(project, 'skills-lock.json'), 'utf8'), 'personal lock');
    assert.equal(git('ls-files').stdout, '');
  }],
  ...['.claude', '.agents'].map(folder => ['preserves tracked project entries in ' + folder, (f) => {
    const project = path.join(f.home, 'project');
    const dest = path.join(project, folder, 'skills/alpha');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, 'tracked');
    const git = (...args) => spawnSync('git', ['-C', project, ...args], { encoding: 'utf8' });
    git('init'); git('add', '.');
    f.run(1, 'install', ['--skill', 'alpha', '--project', project]);
    assert.equal(fs.readFileSync(dest, 'utf8'), 'tracked');
    assert.equal(git('check-ignore', '--no-index', dest).status, 1);
  }]),

  ['remembers packs and reconciles membership without losing core', (f) => {
    fs.mkdirSync(path.join(f.repo, 'skills/packs/study/beta'), { recursive: true });
    f.manifest(['skills/core/alpha'], { study: ['skills/packs/study/beta'] });
    f.run(0, 'install', ['--pack', 'study']);
    for (const root of f.targets) assert.deepEqual(fs.readdirSync(root).sort(), ['alpha', 'beta']);
    fs.mkdirSync(path.join(f.repo, 'skills/packs/study/gamma'));
    f.manifest(['skills/core/alpha'], { study: ['skills/packs/study/gamma'] });
    f.run(0);
    for (const root of f.targets) assert.deepEqual(fs.readdirSync(root).sort(), ['alpha', 'gamma']);
  }],

  ['installs guard and detects missing registration', (f) => {
    f.run(0);
    const settings = path.join(f.home, '.claude/settings.json');
    assert.ok(JSON.parse(fs.readFileSync(settings)).hooks.PreToolUse.length);
    fs.writeFileSync(settings, '{}');
    f.run(1, 'doctor');
    assert.match(f.last.stdout, /missing registration/);
  }],
  ['uninstall preserves unrelated hooks and first-write backups', (f) => {
    for (const dir of ['.claude', '.codex', '.config/opencode']) fs.mkdirSync(path.join(f.home, dir), { recursive: true });
    const settings = path.join(f.home, '.claude/settings.json');
    const other = { type: 'command', command: 'echo personal' };
    const original = JSON.stringify({ hooks: { PreToolUse: [{ hooks: [other] }] } });
    fs.writeFileSync(settings, original);
    f.run(0); f.run(0, 'doctor'); f.run(0);
    assert.equal(fs.readFileSync(settings + '.before-command-guard', 'utf8'), original);
    const config = JSON.parse(fs.readFileSync(settings));
    config.hooks.PreToolUse.at(-1).hooks.push(other);
    fs.writeFileSync(settings, JSON.stringify(config));
    f.run(0, 'uninstall');
    assert.ok(JSON.parse(fs.readFileSync(settings)).hooks.PreToolUse.every(g => g.hooks.every(h => h.command === 'echo personal')));
    assert.equal(fs.existsSync(path.join(f.home, '.config/opencode/plugins/command-guard.js')), false);
  }],
  ['doctor rejects a silent block probe and disabled registration', (f) => {
    f.run(0);
    const settings = path.join(f.home, '.claude/settings.json');
    const config = JSON.parse(fs.readFileSync(settings));
    config.disableAllHooks = true; fs.writeFileSync(settings, JSON.stringify(config));
    f.run(1, 'doctor'); assert.match(f.last.stdout, /disabled/);
    delete config.disableAllHooks; fs.writeFileSync(settings, JSON.stringify(config));
    fs.writeFileSync(path.join(f.home, '.agents/command-guard/adapters/claude-code.js'), '');
    f.run(1, 'doctor'); assert.match(f.last.stdout, /FAIL.*denies/);
  }],
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
    assert.deepEqual(fs.readdirSync(f.home), ['.agents', '.claude', '.skill-collection']);
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
      run(status, command = 'install', extra = []) {
        this.last = spawnSync(process.execPath, [cli, command, '--home', home, '--source', repo, '--claude-root', targets[0], '--agents-root', targets[1], ...extra], { encoding: 'utf8' });
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
