#!/usr/bin/env node
'use strict';
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const path = require('path');
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
    console.log('Usage: node scripts/install/install.js [install|doctor] [--owner-steering] [--home DIR] [--source DIR] [--claude-root DIR] [--agents-root DIR]\nDefaults: local checkout; home ~/.claude/skills and ~/.agents/skills. Record: HOME/.skill-collection/install.json. Prints Claude Read rules; writes no permissions.');
    return;
  }
  const command = args[0] && !args[0].startsWith('--') ? args.shift() : 'install';
  if (!['install', 'doctor'].includes(command)) throw new Error('unknown command: ' + command);
  const options = {};
  while (args.length) {
    const key = args.shift();
    if (key === '--owner-steering') { options[key] = true; continue; }
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
    for (const skill of manifest.data.core) {
      const target = path.join(source, skill);
      if (!fs.statSync(target).isDirectory()) throw new Error('not a skill directory: ' + target);
      for (const root of roots) {
        const dest = path.join(root, path.basename(skill));
        if (desired.has(dest)) throw new Error('duplicate core destination: ' + dest);
        desired.set(dest, target);
      }
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
  doctor();
  if (failed) process.exitCode = 1;
}
try { main(); } catch (e) { console.error('FAIL install: ' + e.message); process.exitCode = 1; }
