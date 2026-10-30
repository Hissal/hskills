'use strict';
// vendor.lock.json records every copied skill: source, path, full commit SHA,
// licence and a one-line reason for local changes (#102). Each entry names a
// skill folder in the collection. While the lock has errors the other
// vendor-* rules stay silent: fix the lock first.

const { LOCK } = require('../../vendor/lock');

module.exports = {
  id: 'vendor-lock',
  level: 'fail',
  check(c) {
    const v = c.vendor;
    if (!v.exists) return [];
    const out = v.errors.map((m) => ({ file: LOCK, message: m }));
    const skills = new Set(c.skills.map((s) => s.dir));
    for (const e of v.entries) {
      if (!skills.has(e.skill)) out.push({ file: LOCK, message: e.skill + ' is not a skill folder (no ' + e.skill + '/SKILL.md)' });
    }
    return out;
  },
};
