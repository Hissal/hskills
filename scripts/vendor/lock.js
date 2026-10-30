'use strict';
// Reads vendor.lock.json, the record of every copied skill (#102, format in
// docs/skill-format.md, "Copied skills"). Shared by the collection check, the
// NOTICE.md generator and the vendoring scripts, so the lock is parsed and
// its paths derived in one place. Paths are repository-relative with `/`.

const fs = require('fs');
const path = require('path');

const LOCK = 'vendor.lock.json';
const VENDOR = 'vendor';
const LICENSES = 'licenses';

const SOURCE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SHA = /^[0-9a-f]{40}$/;
const FIELDS = ['skill', 'source', 'path', 'sha', 'license', 'changes'];

// Where an entry's baseline and its source's licence live.
const baselineDir = (e) => VENDOR + '/' + e.source + '/' + path.posix.basename(e.skill);
const licenceFile = (e) => LICENSES + '/' + e.source + '.txt';
const noticeFile = (e) => e.skill + '/NOTICE.md';

const isRelPath = (p) => typeof p === 'string' && p !== '' && !/[\s`\\]/.test(p) && !p.startsWith('/') && !p.endsWith('/') && p.split('/').every((s) => s !== '' && s !== '.' && s !== '..');

// Parses the lock's text. Returns { entries, errors }: entries carry the six
// recorded fields plus `baseline`, `licence` and `notice` paths; errors are
// messages. An invalid entry is reported and left out of `entries`.
function parse(text) {
  let data;
  try { data = JSON.parse(text); } catch (e) { return { entries: [], errors: ['is not valid JSON: ' + e.message] }; }
  if (!data || !Array.isArray(data.skills)) return { entries: [], errors: ['needs a "skills" array'] };
  const entries = [];
  const errors = [];
  const seen = new Map();
  data.skills.forEach((raw, i) => {
    const at = 'skills[' + i + ']';
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) { errors.push(at + ' is not an object'); return; }
    const bad = [];
    for (const f of FIELDS) if (typeof raw[f] !== 'string' || raw[f].trim() === '') bad.push(f + ' is missing or empty');
    if (!bad.length) {
      if (!/^skills\//.test(raw.skill) || !isRelPath(raw.skill)) bad.push('skill must be a folder under skills/');
      if (!SOURCE.test(raw.source)) bad.push('source must be a GitHub owner/repo');
      if (!isRelPath(raw.path)) bad.push('path must be a relative path in the source');
      if (!SHA.test(raw.sha)) bad.push('sha must be a full 40-character commit SHA');
      if (/[\r\n]/.test(raw.changes)) bad.push('changes must be one line');
    }
    for (const k of Object.keys(raw)) if (!FIELDS.includes(k)) bad.push('unknown field ' + k);
    if (bad.length) { errors.push(at + ': ' + bad.join('; ')); return; }
    const e = {};
    for (const f of FIELDS) e[f] = raw[f];
    Object.assign(e, { baseline: baselineDir(e), licence: licenceFile(e), notice: noticeFile(e) });
    // one entry per skill, and one skill per baseline folder
    const clash = [e.skill, e.baseline].find((key) => seen.has(key));
    if (clash) { errors.push(at + ' has the same ' + (clash === e.skill ? 'skill' : 'baseline') + ' as skills[' + seen.get(clash) + '] (' + clash + ')'); return; }
    seen.set(e.skill, i).set(e.baseline, i);
    entries.push(e);
  });
  return { entries, errors };
}

// Reads the lock under `root`. `exists` is false when there is none (then
// nothing in the tree is a copy).
function read(root) {
  let text;
  try { text = fs.readFileSync(path.join(root, LOCK), 'utf8'); } catch (e) {
    if (e.code === 'ENOENT') return { exists: false, entries: [], errors: [] };
    throw e;
  }
  return Object.assign({ exists: true }, parse(text));
}

const inside = (dir, file) => file === dir || file.startsWith(dir + '/');

// The entry whose copied skill folder holds `file`, or null.
const copiedSkillOf = (entries, file) => entries.find((e) => inside(e.skill, file)) || null;
// The entry whose baseline holds `file`, or null.
const baselineOf = (entries, file) => entries.find((e) => inside(e.baseline, file)) || null;

module.exports = { LOCK, VENDOR, LICENSES, parse, read, baselineDir, licenceFile, noticeFile, copiedSkillOf, baselineOf };
