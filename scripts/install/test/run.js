'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');
const cli = path.resolve(__dirname, '../install.js');
const cases = [
  ...(process.platform === 'win32' ? [false, true].map(deny => [
    `Windows installer ${deny ? 'junction fallback' : 'directory symlink'} loads reference`, f => {
      const target = path.join(f.repo, 'skills/core/alpha');
      fs.mkdirSync(path.join(target, 'references'));
      fs.writeFileSync(path.join(target, 'references/token.md'), 'WINDOWS-REFERENCE');
      if (deny) {
        const preload = path.join(f.repo, 'deny-directory-links.cjs');
        fs.writeFileSync(preload, `const fs = require('fs');
const original = fs.symlinkSync;
fs.symlinkSync = function(target, dest, type) {
  if (type === 'dir') throw Object.assign(new Error('permission denied'), { code: 'EPERM' });
  return original.apply(this, arguments);
};
`);
        f.nodeArgs = ['--require', preload];
      }
      f.run(0);
      const links = JSON.parse(fs.readFileSync(f.record)).links;
      assert.equal(links.length, 2);
      for (const entry of links) {
        assert.equal(entry.type, deny ? 'junction' : 'symlink');
        assert.ok(fs.lstatSync(entry.path).isSymbolicLink());
        // Node reports both as symbolic links; inspect Windows' reparse type.
        const inspected = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
          '(Get-Item -LiteralPath $env:SCOPE_LINK).LinkType'], {
          encoding: 'utf8', env: { ...process.env, SCOPE_LINK: entry.path }
        });
        assert.equal(inspected.status, 0, inspected.stderr);
        assert.equal(inspected.stdout.trim(), deny ? 'Junction' : 'SymbolicLink');
        assert.equal(fs.realpathSync(entry.path), fs.realpathSync(target));
        assert.equal(fs.readFileSync(path.join(entry.path, 'references/token.md'), 'utf8'), 'WINDOWS-REFERENCE');
      }
      f.run(0, 'doctor');
    }
  ]) : []),
  ['preserves an unrecorded dangling guard symlink', f => {
    const dest = path.join(f.home, '.agents/command-guard/engine/index.js');
    const outside = path.join(f.repo, 'outside-missing');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.symlinkSync(outside, dest, 'file');
    f.run(1);
    assert.match(f.last.stderr, /CONFLICT/);
    assert.equal(fs.readlinkSync(dest), outside);
    assert.equal(fs.existsSync(outside), false);
  }],
  ['preserves a recorded guard file replaced by a matching symlink', f => {
    f.run(0);
    const record = path.join(f.home, '.skill-collection/guard.json');
    const dest = path.join(f.home, '.agents/command-guard/engine/index.js');
    const outside = path.join(f.repo, 'outside');
    const content = fs.readFileSync(dest);
    fs.writeFileSync(outside, content);
    fs.unlinkSync(dest);
    fs.symlinkSync(outside, dest, 'file');
    f.run(1);
    assert.match(f.last.stderr, /CONFLICT/);
    assert.deepEqual(fs.readFileSync(outside), content);
    assert.equal(fs.readlinkSync(dest), outside);
    f.run(1, 'uninstall');
    assert.match(f.last.stderr, /overridden installed file preserved/);
    assert.equal(fs.readlinkSync(dest), outside);
    assert.deepEqual(fs.readFileSync(outside), content);
    assert.ok(JSON.parse(fs.readFileSync(record)).files.some(e => e.path === dest));
  }],
  ['doctor reports broken skills and guard independently without writes', f => {
    f.run(0);
    fs.rmSync(path.join(f.repo, 'skills/core/alpha'), { recursive: true });
    const settings = path.join(f.home, '.claude/settings.json');
    fs.writeFileSync(settings, '{}');
    const record = fs.readFileSync(f.record, 'utf8');
    f.run(1, 'doctor');
    assert.match(f.last.stdout, /DOCTOR dangling/);
    assert.match(f.last.stdout, /FAIL missing registration/);
    assert.equal(fs.readFileSync(settings, 'utf8'), '{}');
    assert.equal(fs.readFileSync(f.record, 'utf8'), record);
  }],
  ['install conflicts still diagnose guard without installing it', f => {
    fs.mkdirSync(f.targets[0], { recursive: true });
    fs.writeFileSync(path.join(f.targets[0], 'alpha'), 'personal');
    f.run(1);
    assert.match(f.last.stdout, /CONFLICT unrecorded/);
    assert.match(f.last.stdout, /FAIL missing registration/);
    assert.equal(fs.existsSync(path.join(f.home, '.agents/command-guard')), false);
    assert.equal(fs.existsSync(path.join(f.home, '.claude/settings.json')), false);
  }],
  ['plugin preparation preserves working registration and snapshots', (f) => {
    f.run(0);
    const settings = path.join(f.home, '.claude/settings.json');
    const before = fs.readFileSync(settings, 'utf8');
    f.env = { ...process.env, COMMAND_GUARD_CLAUDE: '/does-not-exist' };
    fs.cpSync(path.resolve(__dirname, '../../../hooks/command-guard'), path.join(f.repo, 'hooks/command-guard'), { recursive: true });
    f.run(1, 'prepare-plugin');
    assert.match(f.last.stderr, /FAIL prepare-plugin/);
    assert.equal(fs.readFileSync(settings, 'utf8'), before);
    const cache = path.join(f.home, '.skill-collection/plugin-cache');
    const versions = fs.readdirSync(cache);
    assert.equal(versions.length, 1);
    const snapshot = path.join(cache, versions[0]);
    assert.ok(fs.existsSync(path.join(snapshot, 'adapters/codex.js')));
    const adapter = path.join(snapshot, 'adapters/claude-code.js');
    const probe = command => spawnSync(process.execPath, [adapter], {
      input: JSON.stringify({cwd: f.home, tool_name: 'Bash', tool_input: {command}}),
      env: {...process.env, COMMAND_GUARD_STATE: path.join(f.home, 'state')}, encoding: 'utf8'
    });
    assert.match(probe('git push --force origin main').stdout, /HUMAN-REQUIRED/);
    assert.equal(probe('git status').stdout, '');
    f.run(1, 'prepare-plugin');
    assert.deepEqual(fs.readdirSync(cache), versions);
    assert.equal(fs.readFileSync(settings, 'utf8'), before);
  }],
  ['combined selections and steering survive guard uninstall', f => {
    const project = path.join(f.home, 'project');
    fs.mkdirSync(project, { recursive: true });
    assert.equal(spawnSync('git', ['-C', project, 'init']).status, 0);
    fs.mkdirSync(path.join(f.repo, 'skills/packs/study/beta'), { recursive: true });
    f.manifest(['skills/core/alpha'], { study: ['skills/packs/study/beta'] });
    const settings = path.join(f.home, '.claude/settings.json');
    fs.mkdirSync(path.dirname(settings), { recursive: true });
    fs.writeFileSync(settings, '{}');
    f.run(1, 'install', ['--pack', 'study', '--skill', 'beta', '--project', project, '--owner-steering']);
    const before = fs.readFileSync(f.record, 'utf8');
    const guard = JSON.parse(fs.readFileSync(path.join(f.home, '.skill-collection/guard.json')));
    assert.ok(guard.settings.some(s => s.path === settings && s.backup === settings + '.before-command-guard'));
    f.run(1); f.run(1, 'doctor');
    assert.equal(fs.readFileSync(f.record, 'utf8'), before);
    f.run(0, 'uninstall');
    assert.equal(fs.readFileSync(f.record, 'utf8'), before);
    const record = JSON.parse(before);
    for (const entry of [...record.links, ...record.steering])
      assert.equal(fs.realpathSync(entry.path), fs.realpathSync(entry.target));
    assert.equal(fs.readFileSync(settings + '.before-command-guard', 'utf8'), '{}');
    assert.equal(fs.existsSync(path.join(f.home, '.agents/command-guard/adapters/codex.js')), false);
  }],
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

  ['project alias installs nested extras and preserves tracked missing targets', f => {
    f.run(0);
    const root = path.join(f.home, 'worktree');
    const nested = path.join(root, 'nested project');
    const alias = path.join(f.home, 'project-alias');
    fs.mkdirSync(nested, { recursive: true });
    const git = (...args) => spawnSync('git', ['-C', root, ...args], { encoding: 'utf8' });
    assert.equal(git('init').status, 0);
    fs.symlinkSync(nested, alias, process.platform === 'win32' ? 'junction' : 'dir');
    // A removed working-tree file is still owned by the index.
    const tracked = path.join(nested, '.claude/skills/alpha');
    fs.mkdirSync(path.dirname(tracked), { recursive: true });
    fs.writeFileSync(tracked, 'tracked content');
    assert.equal(git('add', '.').status, 0);
    fs.unlinkSync(tracked);
    f.run(1, 'install', ['--skill', 'alpha', '--project', alias]);
    assert.match(f.last.stdout, /CONFLICT tracked project target/);
    assert.equal(fs.existsSync(tracked), false);
    assert.equal(git('show', ':nested project/.claude/skills/alpha').stdout, 'tracked content');
    assert.equal(git('check-ignore', '--no-index', 'nested project/.claude/skills/alpha').status, 1);
    const link = path.join(nested, '.agents/skills/alpha');
    assert.equal(fs.realpathSync(link), fs.realpathSync(path.join(f.repo, 'skills/core/alpha')));
    assert.equal(git('check-ignore', 'nested project/.agents/skills/alpha').status, 0);
    const record = fs.readFileSync(f.record, 'utf8');
    const exclude = fs.readFileSync(path.join(root, '.git/info/exclude'), 'utf8');
    f.run(1);
    assert.match(f.last.stdout, /CONFLICT tracked project target/);
    assert.equal(fs.readFileSync(f.record, 'utf8'), record);
    assert.equal(fs.readFileSync(path.join(root, '.git/info/exclude'), 'utf8'), exclude);
    f.run(0, 'doctor');
  }],

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
    f.run(1); assert.match(f.last.stdout, /PENDING Codex human trust/); f.run(1, 'doctor'); f.run(1);
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
  ...['file', 'directory', 'link', 'dangling link'].map(kind => ['preserves unrecorded steering ' + kind, f => {
    const dest = path.join(f.home, '.claude/CLAUDE.md');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (kind === 'file') fs.writeFileSync(dest, 'mine');
    else if (kind === 'directory') fs.mkdirSync(dest);
    else fs.symlinkSync(path.join(f.repo, kind === 'link' ? 'steering.md' : 'missing'), dest, 'file');
    const before = fs.lstatSync(dest);
    f.run(1, 'install', ['--owner-steering']);
    assert.match(f.last.stdout, /CONFLICT unrecorded steering/);
    assert.equal(fs.lstatSync(dest).ino, before.ino);
    if (kind === 'file') assert.equal(fs.readFileSync(dest, 'utf8'), 'mine');
    if (kind.includes('link')) assert.equal(fs.readlinkSync(dest), path.join(f.repo, kind === 'link' ? 'steering.md' : 'missing'));
    assert.equal(JSON.parse(fs.readFileSync(f.record)).steering.length, 2);
  }]),
  ['copies when file symlinks are denied and doctor detects drift without repairing it', f => {
    // Deny the OS operation only; all installation and verification uses real files.
    const preload = path.join(f.repo, 'deny-file-links.cjs');
    fs.writeFileSync(preload, `const fs = require('fs');
const original = fs.symlinkSync;
fs.symlinkSync = function(target, dest, type) {
  if (type === 'file') throw Object.assign(new Error('permission denied'), { code: 'EPERM' });
  return original.apply(this, arguments);
};
`);
    f.nodeArgs = ['--require', preload];
    f.run(1, 'install', ['--owner-steering']);
    const record = fs.readFileSync(f.record, 'utf8');
    const entries = JSON.parse(record).steering;
    assert.deepEqual(entries.map(e => e.type), ['copy', 'copy', 'copy']);
    for (const e of entries) assert.equal(fs.readFileSync(e.path, 'utf8'), 'personal steering\n');
    f.run(1);
    assert.equal(fs.readFileSync(f.record, 'utf8'), record);
    fs.writeFileSync(path.join(f.repo, 'steering.md'), 'updated source');
    f.run(1, 'doctor');
    assert.match(f.last.stdout, /DOCTOR steering copy drift/);
    f.run(1);
    assert.equal(fs.readFileSync(entries[0].path, 'utf8'), 'personal steering\n');
    assert.equal(fs.readFileSync(f.record, 'utf8'), record);
    fs.writeFileSync(path.join(f.repo, 'steering.md'), 'personal steering\n');
    fs.writeFileSync(entries[2].path, 'local edit');
    f.run(1, 'doctor');
    assert.match(f.last.stdout, /copy drift/);
    f.run(1);
    assert.equal(fs.readFileSync(entries[2].path, 'utf8'), 'local edit');
  }],

  ['steering is untouched at all three destinations without opt-in', f => {
    const names = ['.claude/CLAUDE.md', '.codex/AGENTS.md', '.config/opencode/AGENTS.md'];
    f.run(0);
    for (const name of names) {
      const dest = path.join(f.home, name);
      assert.equal(fs.existsSync(dest), false);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, 'mine');
    }
    f.run(1);
    for (const name of names) assert.equal(fs.readFileSync(path.join(f.home, name), 'utf8'), 'mine');
  }],
  ['old two-target opt-in record gains native steering without changing existing targets', f => {
    const old = ['.claude/CLAUDE.md', '.codex/AGENTS.md'].map(name => {
      const dest = path.join(f.home, name);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.symlinkSync(path.join(f.repo, 'steering.md'), dest, 'file');
      return { path: dest, target: path.join(f.repo, 'steering.md'), type: 'symlink' };
    });
    const inodes = old.map(e => fs.lstatSync(e.path).ino);
    fs.mkdirSync(path.dirname(f.record), { recursive: true });
    fs.writeFileSync(f.record, JSON.stringify({ version: 1, links: [], ownerSteering: true, steering: old }));
    // An inherited XDG root must not redirect a selected --home.
    const external = path.join(f.repo, 'external-config');
    f.env = { ...process.env, XDG_CONFIG_HOME: external };
    f.run(1);
    const migrated = JSON.parse(fs.readFileSync(f.record));
    assert.deepEqual(migrated.steering.slice(0, 2), old);
    assert.deepEqual(old.map(e => fs.lstatSync(e.path).ino), inodes);
    assert.equal(migrated.steering.length, 3);
    assert.equal(fs.realpathSync(path.join(f.home, '.config/opencode/AGENTS.md')), path.join(f.repo, 'steering.md'));
    assert.equal(fs.existsSync(external), false);
    const before = fs.readFileSync(f.record, 'utf8');
    f.run(1);
    assert.equal(fs.readFileSync(f.record, 'utf8'), before);
  }],
  ['native personal steering survives opt-in and a remembered rerun', f => {
    const dest = path.join(f.home, '.config/opencode/AGENTS.md');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, 'native personal rules');
    for (const extra of [['--owner-steering'], []]) {
      f.run(1, 'install', extra);
      assert.match(f.last.stdout, /CONFLICT unrecorded steering target: .*opencode/);
      assert.equal(fs.readFileSync(dest, 'utf8'), 'native personal rules');
      assert.equal(JSON.parse(fs.readFileSync(f.record)).steering.length, 2);
    }
  }],
  ['steering opt-in links all three targets and survives a no-flag rerun', f => {
    f.run(1, 'install', ['--owner-steering']);
    for (const name of ['.claude/CLAUDE.md', '.codex/AGENTS.md', '.config/opencode/AGENTS.md'])
      assert.equal(fs.realpathSync(path.join(f.home, name)), path.join(f.repo, 'steering.md'));
    assert.match(f.last.stdout, /ALLOW: .*CLAUDE\.md/);
    assert.match(f.last.stdout, /ALLOW: .*steering\.md/);
    const before = fs.readFileSync(f.record, 'utf8');
    assert.equal(JSON.parse(before).ownerSteering, true);
    f.run(1);
    assert.equal(fs.readFileSync(f.record, 'utf8'), before);
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
const plugins = spawnSync(process.execPath, [path.join(__dirname, 'plugin.js')], { encoding: 'utf8', timeout: 180000 });
process.stdout.write(plugins.stdout || ''); process.stderr.write(plugins.stderr || '');
let failures = plugins.status === 0 ? 0 : 1;
const trust = spawnSync(process.execPath, [path.join(__dirname, 'trust.js')], { encoding: 'utf8', timeout: 60000 });
process.stdout.write(trust.stdout || ''); process.stderr.write(trust.stderr || '');
if (trust.status !== 0) { console.log('FAIL trust delta regression (trust.js)'); failures++; }
const lifecycle = spawnSync(process.execPath, [path.join(__dirname, 'lifecycle.js')], { encoding: 'utf8', timeout: 180000 });
process.stdout.write(lifecycle.stdout || ''); process.stderr.write(lifecycle.stderr || '');
if (lifecycle.status !== 0) { console.log('FAIL guard lifecycle regressions (lifecycle.js)'); failures++; }
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
        this.last = spawnSync(process.execPath, [...(this.nodeArgs || []), cli, command, '--home', home, '--source', repo, '--claude-root', targets[0], '--agents-root', targets[1], ...extra], { encoding: 'utf8', env: this.env || process.env });
        assert.equal(this.last.status, status, this.last.stdout + this.last.stderr);
      },
    };
    fs.writeFileSync(path.join(repo, 'steering.md'), 'personal steering\n');
    f.manifest(['skills/core/alpha']);
    test(f);
  } catch (e) { console.log('FAIL ' + name + ': ' + e.message); failures++; }
  finally { fs.rmSync(temp, { recursive: true, force: true }); }
}
console.log(`${cases.length} install cases, ${failures} failures`);
process.exitCode = failures ? 1 : 0;
