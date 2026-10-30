#!/usr/bin/env node
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { parse } = require('../check/manifest');

function stat(file) {
  try { return fs.lstatSync(file); } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
}
function owned(link) {
  const info = stat(link.path);
  return info && info.isSymbolicLink() && path.resolve(path.dirname(link.path), fs.readlinkSync(link.path)) === link.target;
}
function readRule(file) {
  const normalized = file.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, drive) => '/' + drive.toLowerCase());
  return JSON.stringify('Read(/' + normalized + '/**)');
}
function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node scripts/install/install.js [install|doctor|uninstall] [--home DIR] [--source DIR] [--claude-root DIR] [--agents-root DIR]\nDefaults: local checkout; home ~/.claude/skills and ~/.agents/skills. Record: HOME/.skill-collection/install.json. Prints Claude Read rules; writes no permissions.');
    return;
  }
  const command = args[0] && !args[0].startsWith('--') ? args.shift() : 'install';
  if (!['install', 'doctor', 'uninstall'].includes(command)) throw new Error('unknown command: ' + command);
  const options = {};
  while (args.length) {
    const key = args.shift();
    if (!['--home', '--source', '--claude-root', '--agents-root'].includes(key) || !args.length || args[0].startsWith('--') || options[key]) throw new Error('invalid option: ' + key);
    options[key] = path.resolve(args.shift());
  }
  const home = options['--home'] || os.homedir();
  const source = options['--source'] || path.resolve(__dirname, '../..');
  const roots = [...new Set([options['--claude-root'] || path.join(home, '.claude/skills'), options['--agents-root'] || path.join(home, '.agents/skills')])];
  const record = path.join(home, '.skill-collection/install.json');
  const previous = stat(record);
  if (previous && !previous.isFile()) throw new Error('ownership record must be a regular file');
  const before = previous ? fs.readFileSync(record, 'utf8') : null;
  const data = previous ? JSON.parse(before) : { version: 1, links: [] };
  if (data.version !== 1 || !Array.isArray(data.links) || data.links.some(l => !l || typeof l.path !== 'string' || !path.isAbsolute(l.path) || typeof l.target !== 'string' || !path.isAbsolute(l.target) || !['symlink', 'junction'].includes(l.type)) || new Set(data.links.map(l => l.path)).size !== data.links.length) throw new Error('invalid ownership record');
  let failed = false;
  function problem(message) { console.log(message); failed = true; }
  function doctor() {
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
    for (const skill of manifest.data.core) {
      const target = path.join(source, skill);
      if (!fs.statSync(target).isDirectory()) throw new Error('not a skill directory: ' + target);
      for (const root of roots) {
        const dest = path.join(root, path.basename(skill));
        if (desired.has(dest)) throw new Error('duplicate core destination: ' + dest);
        desired.set(dest, target);
      }
    }
    // Validate the whole desired set before touching any installed link.
    try {
      for (const link of [...data.links]) {
        if (!stat(link.path)) { data.links.splice(data.links.indexOf(link), 1); continue; }
        if (!owned(link)) { problem('CONFLICT recorded entry replaced: ' + link.path); continue; }
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
  if (!failed) {
    const result = spawnSync(process.execPath, [path.resolve(__dirname, '../../hooks/command-guard/install.js'), '--home', home, ...(command === 'install' ? [] : ['--' + command])], { encoding: 'utf8', timeout: 60000 });
    process.stdout.write(result.stdout || ''); process.stderr.write(result.stderr || '');
    if (result.status !== 0) failed = true;
  }
  if (failed) process.exitCode = 1;
}
try { main(); } catch (e) { console.error('FAIL install: ' + e.message); process.exitCode = 1; }
