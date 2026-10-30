#!/usr/bin/env node
'use strict';
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { parse } = require('../check/manifest');

function stat(file) {
  try { return fs.lstatSync(file); } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
}
function owned(link) {
  const info = stat(link.path);
  return info && info.isSymbolicLink() && path.resolve(path.dirname(link.path), fs.readlinkSync(link.path)) === link.target;
}
function readRule(file, directory = true) {
  const normalized = file.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, drive) => '/' + drive.toLowerCase());
  return JSON.stringify('Read(/' + normalized + (directory ? '/**' : '') + ')');
}
function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node scripts/install/install.js [install|doctor|uninstall|prepare-plugin] [--owner-steering] [--home DIR] [--source DIR] [--claude-root DIR] [--agents-root DIR] [--pack NAME] [--skill NAME [--project DIR]]\nDefaults: local checkout; home ~/.claude/skills and ~/.agents/skills. Record: HOME/.skill-collection/install.json. Prints Claude Read rules; writes no permissions.');
    return;
  }
  const command = args[0] && !args[0].startsWith('--') ? args.shift() : 'install';
  if (!['install', 'doctor', 'uninstall', 'prepare-plugin'].includes(command)) throw new Error('unknown command: ' + command);
  const options = {};
  while (args.length) {
    const key = args.shift();
    if (key === '--owner-steering') { options[key] = true; continue; }
    if (!['--home', '--source', '--claude-root', '--agents-root', '--pack', '--skill', '--project'].includes(key) || !args.length || args[0].startsWith('--') || options[key]) throw new Error('invalid option: ' + key);
    options[key] = ['--pack', '--skill'].includes(key) ? args.shift() : path.resolve(args.shift());
  }
  const home = options['--home'] || os.homedir();
  if (command === 'prepare-plugin') {
    const ok = require('./plugin').registration(home, path.join(options['--source'] || path.resolve(__dirname, '../..'), 'hooks/command-guard'));
    process.exitCode = ok ? 0 : 1;
    return;
  }
  const source = options['--source'] || path.resolve(__dirname, '../..');
  const roots = [...new Set([options['--claude-root'] || path.join(home, '.claude/skills'), options['--agents-root'] || path.join(home, '.agents/skills')])];
  const record = path.join(home, '.skill-collection/install.json');
  const previous = stat(record);
  if (previous && !previous.isFile()) throw new Error('ownership record must be a regular file');
  const before = previous ? fs.readFileSync(record, 'utf8') : null;
  const data = previous ? JSON.parse(before) : { version: 1, links: [] };
  if (data.version !== 1 || !Array.isArray(data.links) || data.links.some(l => !l || typeof l.path !== 'string' || !path.isAbsolute(l.path) || typeof l.target !== 'string' || !path.isAbsolute(l.target) || !['symlink', 'junction'].includes(l.type)) || new Set(data.links.map(l => l.path)).size !== data.links.length) throw new Error('invalid ownership record');
  if (data.selections && (!Array.isArray(data.selections.packs) || data.selections.packs.some(p => typeof p !== 'string') || !Array.isArray(data.selections.projects) || data.selections.projects.some(p => !p || typeof p.root !== 'string' || !path.isAbsolute(p.root) || typeof p.skill !== 'string'))) throw new Error('invalid selections in ownership record');
  if (data.ownerSteering !== undefined && typeof data.ownerSteering !== 'boolean') throw new Error('invalid steering opt-in');
  if (data.steering !== undefined && (!Array.isArray(data.steering) || data.steering.some(l =>
    !l || !path.isAbsolute(l.path || '') || !path.isAbsolute(l.target || '') ||
    !['symlink', 'copy'].includes(l.type) || (l.type === 'copy' && !/^[a-f0-9]{64}$/.test(l.digest || ''))) ||
    new Set(data.steering.map(l => l.path)).size !== data.steering.length)) throw new Error('invalid steering record');
  const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  let failed = false;
  function problem(message) { console.log(message); failed = true; }
  function doctor() {
    for (const entry of data.steering || []) {
      try {
        if (entry.type === 'symlink') {
          if (!owned(entry) || !fs.statSync(entry.path).isFile() ||
              fs.realpathSync(entry.path) !== fs.realpathSync(entry.target)) throw new Error('missing or replaced link');
        } else {
          const info = stat(entry.path);
          if (!info || !info.isFile() || digest(entry.path) !== entry.digest ||
              digest(entry.path) !== digest(entry.target)) throw new Error('copy drift or replacement');
        }
        console.log('DOCTOR ok: ' + entry.path + ' (' + entry.type + ')');
      } catch (e) { problem('DOCTOR steering ' + e.message + ': ' + entry.path); }
    }
    for (const link of data.links) {
      if (!owned(link)) { problem('DOCTOR replaced or missing: ' + link.path); continue; }
      try {
        if (!fs.statSync(link.path).isDirectory() || fs.realpathSync(link.path) !== fs.realpathSync(link.target)) throw new Error('target mismatch');
        console.log('DOCTOR ok: ' + link.path + ' (' + link.type + ')');
      } catch (e) { problem('DOCTOR dangling or invalid target: ' + link.path); }
    }
  }
  if (command === 'install') {
    const manifest = parse(fs.readFileSync(path.join(source, 'collection.json'), 'utf8'));
    if (!manifest.data) throw new Error(manifest.errors.join('; '));
    const desired = new Map();
    const projectLinks = new Map();
    const selections = data.selections || { packs: [], projects: [] };
    if (options['--pack']) {
      if (!manifest.data.packs[options['--pack']]) throw new Error('unknown pack: ' + options['--pack']);
      if (!selections.packs.includes(options['--pack'])) selections.packs.push(options['--pack']);
    }
    if (options['--skill']) {
      const project = options['--project'] || process.cwd();
      if (!selections.projects.some(p => p.root === project && p.skill === options['--skill'])) selections.projects.push({ root: project, skill: options['--skill'] });
    } else if (options['--project']) throw new Error('--project requires --skill');
    function add(skill, destinations) {
      const target = path.join(source, skill);
      if (!fs.statSync(target).isDirectory()) throw new Error('not a skill directory: ' + target);
      for (const root of destinations) {
        const dest = path.join(root, path.basename(skill));
        if (desired.has(dest) && desired.get(dest) !== target) throw new Error('duplicate destination: ' + dest);
        desired.set(dest, target);
      }
    }
    for (const skill of manifest.data.core) add(skill, roots);
    for (const pack of selections.packs) {
      if (!manifest.data.packs[pack]) throw new Error('remembered pack missing: ' + pack);
      for (const skill of manifest.data.packs[pack]) add(skill, roots);
    }
    const skills = [...new Set([...manifest.data.core, ...Object.values(manifest.data.packs).flat()])];
    for (const project of selections.projects) {
      const matches = skills.filter(s => path.basename(s) === project.skill);
      if (matches.length !== 1) throw new Error('unknown or ambiguous skill: ' + project.skill);
      const destinations = [path.join(project.root, '.claude/skills'), path.join(project.root, '.agents/skills')];
      add(matches[0], destinations);
      for (const root of destinations) projectLinks.set(path.join(root, project.skill), project.root);
    }
    if (options['--pack'] || options['--skill'] || data.selections) data.selections = selections;
    function exclude(dest) {
      const project = projectLinks.get(dest);
      if (!project) return true;
      const git = (...args) => execFileSync('git', ['-C', project, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
      // Git supplies the repository prefix in its own spelling. Comparing its
      // absolute root with a caller path mixes short names or directory aliases.
      // Keep the final component lexical: an installed link points outside Git.
      const local = path.relative(project, dest);
      if (path.isAbsolute(local) || local === '..' || local.startsWith('..' + path.sep))
        throw new Error('project target is outside project: ' + dest);
      const relative = git('rev-parse', '--show-prefix') + local.split(path.sep).join('/');
      if (git('ls-files', '--', ':(top,literal)' + relative)) {
        problem('CONFLICT tracked project target: ' + dest);
        return false;
      }
      const file = git('rev-parse', '--path-format=absolute', '--git-path', 'info/exclude');
      if (stat(file) && !stat(file).isFile()) throw new Error('git exclude must be a regular file');
      const before = stat(file) ? fs.readFileSync(file, 'utf8') : '';
      // Exact literal pattern: never hide siblings or take ownership of existing rules.
      const pattern = '/' + relative.replace(/([\\*?\[\] !#])/g, '\\$1');
      if (!before.split(/\r?\n/).includes(pattern)) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        const text = (before && !before.endsWith('\n') ? '\n' : '') + pattern + '\n';
        fs.appendFileSync(file, text);
        data.excludes ||= [];
        data.excludes.push({ path: file, pattern });
      }
      return true;
    }
    const steeringEnabled = options['--owner-steering'] || data.ownerSteering;
    const steeringSource = path.join(source, 'steering.md');
    if (steeringEnabled && !fs.statSync(steeringSource).isFile()) throw new Error('steering source must be a file');
    // Validate the whole desired set before touching any installed link.
    try {
      if (steeringEnabled) {
        data.ownerSteering = true;
        data.steering ||= [];
        for (const dest of [path.join(home, '.claude/CLAUDE.md'), path.join(home, '.codex/AGENTS.md')]) {
          console.log('ALLOW: ' + readRule(dest, false));
          console.log('ALLOW: ' + readRule(steeringSource, false));
          const entry = data.steering.find(l => l.path === dest);
          if (entry && stat(dest)) {
            if (entry.target !== steeringSource) problem('CONFLICT steering source changed: ' + dest);
            continue;
          }
          if (stat(dest)) { problem('CONFLICT unrecorded steering target: ' + dest); continue; }
          if (entry) data.steering.splice(data.steering.indexOf(entry), 1);
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          let type = 'symlink';
          try { fs.symlinkSync(steeringSource, dest, 'file'); }
          catch (e) {
            if (!['EPERM', 'EACCES', 'ENOTSUP', 'EOPNOTSUPP'].includes(e.code)) throw e;
            fs.copyFileSync(steeringSource, dest, fs.constants.COPYFILE_EXCL);
            type = 'copy';
          }
          data.steering.push({ path: dest, target: steeringSource, type,
            ...(type === 'copy' ? { digest: digest(dest) } : {}) });
          console.log('STEERING ' + type + ': ' + dest + ' -> ' + steeringSource);
        }
      }
      for (const link of [...data.links]) {
        if (!stat(link.path)) { data.links.splice(data.links.indexOf(link), 1); continue; }
        if (!owned(link)) { problem('CONFLICT recorded entry replaced: ' + link.path); continue; }
        if (projectLinks.has(link.path) && !exclude(link.path)) continue;
        if (desired.get(link.path) === link.target) continue;
        fs.unlinkSync(link.path);
        data.links.splice(data.links.indexOf(link), 1);
        console.log('REMOVE: ' + link.path);
      }
      for (const [dest, target] of desired) {
        console.log('ALLOW: ' + readRule(dest));
        console.log('ALLOW: ' + readRule(target));
        const recorded = data.links.find(l => l.path === dest);
        if (recorded) continue;
        if (stat(dest)) { problem('CONFLICT unrecorded target: ' + dest); continue; }
        if (!exclude(dest)) continue;
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        let type = 'symlink';
        try { fs.symlinkSync(target, dest, 'dir'); }
        catch (e) {
          if (process.platform !== 'win32' || !['EPERM', 'EACCES', 'ENOTSUP'].includes(e.code)) throw e;
          fs.symlinkSync(target, dest, 'junction');
          type = 'junction';
        }
        data.links.push({ path: dest, target, type });
        console.log('LINK ' + type + ': ' + dest + ' -> ' + target);
      }
    } finally {
      const after = JSON.stringify(data, null, 2) + '\n';
      if (after !== before) {
        fs.mkdirSync(path.dirname(record), { recursive: true });
        fs.writeFileSync(record, after);
      }
    }
  }
  if (command !== 'uninstall') doctor();
  if (command === 'uninstall' && fs.existsSync(path.join(home, '.skill-collection/plugins.json'))) {
    if (!require('./plugin').registration(home, path.join(source, 'hooks/command-guard'), command)) { process.exitCode = 1; return; }
  }
  {
    // A skill conflict still needs guard diagnostics, without installing it.
    const guardCommand = failed ? 'doctor' : command;
    const result = spawnSync(process.execPath, [path.resolve(__dirname, '../../hooks/command-guard/install.js'), '--home', home, ...(fs.existsSync(path.join(source, 'hooks/command-guard/.claude-plugin/plugin.json')) ? ['--source', path.join(source, 'hooks/command-guard'), '--plugin-mode'] : []), ...(guardCommand === 'install' ? [] : ['--' + guardCommand])], { encoding: 'utf8', timeout: 60000 });
    process.stdout.write(result.stdout || ''); process.stderr.write(result.stderr || '');
    if (result.status !== 0) failed = true;
  }
  if (!failed && command === 'install' && fs.existsSync(path.join(source, 'hooks/command-guard/.claude-plugin/plugin.json'))) {
    if (!require('./plugin').registration(home, path.join(source, 'hooks/command-guard'))) failed = true;
  }
  if (command === 'doctor' && fs.existsSync(path.join(home, '.skill-collection/plugins.json'))) {
    if (!require('./plugin').registration(home, path.join(source, 'hooks/command-guard'), command)) failed = true;
  }
  if (failed) process.exitCode = 1;
}
try { main(); } catch (e) { console.error('FAIL install: ' + e.message); process.exitCode = 1; }
