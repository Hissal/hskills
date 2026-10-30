'use strict';
// Drift fixture table, run by run.js. Each case is a triple for one lock entry
// (SKILL copied from SOURCE at PATH):
//   pinned   the source folder at the pinned commit ({ file: text })
//   head     the folder at the source's default-branch head (default: pinned)
//   baseline the committed baseline (default: pinned)
//   local    the local copy, without NOTICE.md (default: pinned)
//   pin      'unknown' pins a commit the source does not have
//   exit     the expected exit code; lines: KEY: value lines that must appear
//   merge    run --merge SKILL instead: { local, moves } where local is the
//            expected copy ({ file: text } or a predicate) and moves says the
//            pin and baseline must move to head (else stay put)
// Write CRLF and BOM as escapes, never raw: the collection check reads this file.

const SOURCE = 'acme/tools';
const SKILL = 'skills/core/demo';
const PATH = 'skills/demo';
const LINE = SKILL + ': ';

const skill = (body) => ({ 'SKILL.md': '---\nname: demo\n---\n' + body + '\n' });
const base = skill('one\ntwo\nthree');
const crlf = (files) => Object.fromEntries(Object.entries(files).map(([f, t]) => [f, t.replace(/\n/g, '\r\n')]));
const bom = (files) => Object.fromEntries(Object.entries(files).map(([f, t]) => [f, '\uFEFF' + t]));
const ref = { 'REFERENCE.md': '# Reference\n' };

module.exports = [
  // report: one class per triple
  { name: 'nothing changed is current (the head moved elsewhere in the source)', pinned: base, exit: 0, lines: [LINE + 'current'] },
  { name: 'an edited local copy is local-drift', pinned: base, local: skill('one\nTWO\nthree'), exit: 0, lines: [LINE + 'local-drift'] },
  { name: 'a file added to the local copy is local-drift', pinned: base, local: Object.assign({}, base, ref), exit: 0, lines: [LINE + 'local-drift'] },
  { name: 'a source edit after the pin is update-available', pinned: base, head: skill('one\ntwo\nthree\nfour'), exit: 0, lines: [LINE + 'update-available'] },
  { name: 'a file added at the source head is update-available', pinned: base, head: Object.assign({}, base, ref), exit: 0, lines: [LINE + 'update-available'] },
  { name: 'local and source edits are both', pinned: base, local: skill('zero\none\ntwo\nthree'), head: skill('one\ntwo\nthree\nfour'), exit: 0, lines: [LINE + 'both'] },
  { name: 'a baseline that differs from the pinned commit is baseline-corrupt', pinned: base, baseline: skill('one\ntwo'), exit: 0, lines: [LINE + 'baseline-corrupt'] },
  { name: 'a baseline missing a pinned file is baseline-corrupt', pinned: Object.assign({}, base, ref), baseline: base, local: base, exit: 0, lines: [LINE + 'baseline-corrupt'] },
  { name: 'a pin the source does not have is an error', pinned: base, pin: 'unknown', exit: 2, lines: [LINE + 'error'] },
  // report: CRLF and BOM differences alone read as current
  { name: 'a CRLF-only source is current', pinned: crlf(base), baseline: base, local: base, exit: 0, lines: [LINE + 'current'] },
  { name: 'a CRLF-only source head is current', pinned: base, head: crlf(base), exit: 0, lines: [LINE + 'current'] },
  { name: 'a CRLF-only local copy is current', pinned: base, local: crlf(base), exit: 0, lines: [LINE + 'current'] },
  { name: 'a BOM-only source is current', pinned: bom(base), baseline: base, local: base, exit: 0, lines: [LINE + 'current'] },
  { name: 'a BOM-only local copy is current', pinned: base, local: bom(base), exit: 0, lines: [LINE + 'current'] },
  // merge: three-way, per file
  { name: 'merge takes a source edit beside a local edit', pinned: base, local: skill('ONE\ntwo\nthree'), head: skill('one\ntwo\nTHREE'), exit: 0, lines: ['RESULT: clean', 'MERGED: SKILL.md'], merge: { local: skill('ONE\ntwo\nTHREE'), moves: true } },
  { name: 'merge adds a file the source added', pinned: base, head: Object.assign({}, base, ref), exit: 0, lines: ['RESULT: clean', 'MERGED: REFERENCE.md'], merge: { local: Object.assign({}, base, ref), moves: true } },
  { name: 'merge deletes a file the source deleted and the copy left alone', pinned: Object.assign({}, base, ref), head: base, exit: 0, lines: ['RESULT: clean'], merge: { local: base, moves: true } },
  { name: 'merge keeps a local-only file', pinned: base, local: Object.assign({}, skill('ONE\ntwo\nthree'), ref), head: skill('one\ntwo\nTHREE'), exit: 0, lines: ['RESULT: clean'], merge: { local: Object.assign({}, skill('ONE\ntwo\nTHREE'), ref), moves: true } },
  { name: 'merge writes a CRLF source head as LF', pinned: base, head: crlf(skill('one\ntwo\nTHREE')), exit: 0, lines: ['RESULT: clean'], merge: { local: skill('one\ntwo\nTHREE'), moves: true } },
  { name: 'merge marks a conflict and leaves the pin and baseline', pinned: base, local: skill('one\nlocal\nthree'), head: skill('one\nupstream\nthree'), exit: 1, lines: ['RESULT: conflict', 'CONFLICT: SKILL.md'], merge: { local: (t) => /^<{7} /m.test(t['SKILL.md']) && /^={7}$/m.test(t['SKILL.md']) && /^>{7} /m.test(t['SKILL.md']), moves: false } },
  { name: 'merge leaves a locally edited file the source deleted as a conflict', pinned: Object.assign({}, base, ref), local: Object.assign({}, base, { 'REFERENCE.md': '# Mine\n' }), head: base, exit: 1, lines: ['RESULT: conflict', 'CONFLICT: REFERENCE.md'], merge: { local: Object.assign({}, base, { 'REFERENCE.md': '# Mine\n' }), moves: false } },
  { name: 'merge with no source change takes nothing', pinned: base, local: skill('ONE\ntwo\nthree'), exit: 0, lines: ['RESULT: nothing-to-take'], merge: { local: skill('ONE\ntwo\nthree'), moves: false } },
  { name: 'merge refuses a corrupt baseline', pinned: base, baseline: skill('one\ntwo'), head: skill('one\ntwo\nTHREE'), exit: 2, merge: { local: base, moves: false } },
];

Object.assign(module.exports, { SOURCE, SKILL, PATH });
