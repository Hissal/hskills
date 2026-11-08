'use strict';
// Fixture cases for copied skills (#102): vendor.lock.json, baselines under
// vendor/, the licence area and each copied skill's generated NOTICE.md.
// cases.js appends these, passing its skill() and skillMd() helpers so a new
// required field reaches these fixtures too.

const { renderNotice } = require('../../vendor/notice');

const SHA = '0123456789abcdef0123456789abcdef01234567';
const MIT = 'MIT License\n\nCopyright (c) 2026 Acme\n\nPermission is hereby granted, free of charge, ...\n';

module.exports = ({ skill, skillMd }) => {
  const tree = (...parts) => Object.assign({}, ...parts);

  // An entry as the lock records it; `o` overrides fields.
  const entry = (dir, o) => Object.assign({ skill: dir, source: 'acme/skills', path: 'skills/' + dir.split('/').pop(), sha: SHA, license: 'MIT', changes: 'none' }, o || {});
  const lock = (...entries) => ({ 'vendor.lock.json': JSON.stringify({ skills: entries }, null, 2) + '\n' });
  const baselineDir = (e) => 'vendor/' + e.source + '/' + e.skill.split('/').pop();
  const licenceFile = (e) => 'licenses/' + e.source + '.txt';
  // A hand-written provenance notice for a skill adapted in its own words.
  const adapted = (...urls) => '# Notice\n\nAdapted in our own words from:\n\n' + urls.map((u) => '- [source](' + u + ')\n').join('');

  // A copied skill that passes every rule: its folder (with NOTICE.md), its
  // baseline and its source's licence. `omit` drops one part:
  // 'baseline' | 'licence' | 'notice'. The lock is added separately.
  function copied(e, o) {
    o = o || {};
    const name = e.skill.split('/').pop();
    const licence = o.licence || MIT;
    const out = skill(e.skill);
    if (o.omit !== 'notice') out[e.skill + '/NOTICE.md'] = renderNotice(e, licence);
    if (o.omit !== 'baseline') out[baselineDir(e) + '/SKILL.md'] = skillMd(name);
    if (o.omit !== 'licence') out[licenceFile(e)] = licence;
    return out;
  }

  const a = entry('skills/core/alpha');
  const b = entry('skills/packs/web/beta');

  return [
    // ---- a copied skill, whole -------------------------------------------------
    { name: 'a copied skill with lock, baseline, licence and NOTICE.md passes (NOTICE.md needs no link)', files: tree(lock(a), copied(a)), expect: [] },
    { name: 'two copied skills from one source share its licence', files: tree(lock(a, b), copied(a), copied(b)), expect: [] },
    { name: 'a tree with no lock and no copies passes', files: skill('skills/core/alpha'), expect: [] },
    { name: 'a baseline holding several files passes', files: tree(lock(a), copied(a), { 'vendor/acme/skills/alpha/REF.md': '# Ref\n', 'vendor/acme/skills/alpha/scripts/x.js': 'x\n' }), expect: [] },
    { name: 'a baseline is checked as LF like every file', files: tree(lock(a), copied(a), { 'vendor/acme/skills/alpha/REF.md': '# Ref\r\n' }), expect: ['fail crlf-line-ending vendor/acme/skills/alpha/REF.md'] },

    // ---- the lock --------------------------------------------------------------
    { name: 'a lock that is not JSON fails', files: tree({ 'vendor.lock.json': '{ skills: [' }, copied(a)), expect: ['fail vendor-lock vendor.lock.json'] },
    { name: 'a lock with no skills list fails', files: { 'vendor.lock.json': '{}\n' }, expect: ['fail vendor-lock vendor.lock.json'] },
    { name: 'a lock entry with a short SHA fails', files: tree(lock(entry(a.skill, { sha: '0123abc' })), copied(entry(a.skill, { sha: '0123abc' }))), expect: ['fail vendor-lock vendor.lock.json'] },
    { name: 'a lock entry with no licence field fails', files: tree(lock(entry(a.skill, { license: undefined })), copied(a)), expect: ['fail vendor-lock vendor.lock.json'] },
    { name: 'a lock entry with a two-line reason fails', files: tree(lock(entry(a.skill, { changes: 'one\ntwo' })), copied(a)), expect: ['fail vendor-lock vendor.lock.json'] },
    { name: 'a lock entry with a source that is not owner/repo fails', files: tree(lock(entry(a.skill, { source: 'https://github.com/acme/skills' })), copied(a)), expect: ['fail vendor-lock vendor.lock.json'] },
    { name: 'a lock entry naming a folder that is not a skill fails', files: tree(lock(a, entry('skills/core/gone')), copied(a)), expect: ['fail vendor-lock vendor.lock.json', 'fail vendor-baseline vendor.lock.json'] },
    { name: 'two lock entries for one skill fail', files: tree(lock(a, a), copied(a)), expect: ['fail vendor-lock vendor.lock.json'] },
    { name: 'two copied skills that would share a baseline folder fail', files: tree(lock(a, entry('skills/packs/web/alpha')), copied(a), skill('skills/packs/web/alpha', { fm: { metadata: '\n  agent-skills-sync.schema: "1"\n  agent-skills-sync.id: "hissal.hskills/web-alpha"' } })), expect: ['fail vendor-lock vendor.lock.json'] },

    // ---- baselines -------------------------------------------------------------
    { name: 'a lock entry with no baseline fails', files: tree(lock(a), copied(a, { omit: 'baseline' })), expect: ['fail vendor-baseline vendor.lock.json'] },
    { name: 'a baseline with no SKILL.md fails', files: tree(lock(a), copied(a, { omit: 'baseline' }), { 'vendor/acme/skills/alpha/REF.md': '# Ref\n' }), expect: ['fail vendor-baseline vendor.lock.json'] },
    { name: 'a baseline with no lock entry fails', files: tree(lock(a), copied(a), { 'vendor/acme/skills/beta/SKILL.md': skillMd('beta') }), expect: ['fail vendor-baseline vendor/acme/skills/beta/SKILL.md'] },
    { name: 'a vendor file with no lock at all fails', files: { 'vendor/acme/skills/alpha/SKILL.md': skillMd('alpha') }, expect: ['fail vendor-baseline vendor/acme/skills/alpha/SKILL.md'] },

    // ---- licences --------------------------------------------------------------
    { name: 'a lock entry with no licence file fails', files: tree(lock(a), copied(a, { omit: 'licence' })), expect: ['fail vendor-licence vendor.lock.json'] },

    // ---- NOTICE.md -------------------------------------------------------------
    { name: 'a copied skill with no NOTICE.md fails', files: tree(lock(a), copied(a, { omit: 'notice' })), expect: ['fail vendor-notice skills/core/alpha/NOTICE.md'] },
    { name: 'a hand-edited NOTICE.md is stale', files: tree(lock(a), copied(a), { 'skills/core/alpha/NOTICE.md': renderNotice(a, MIT) + 'edited\n' }), expect: ['fail vendor-notice skills/core/alpha/NOTICE.md'] },
    { name: 'a NOTICE.md older than its lock entry is stale', files: tree(lock(entry(a.skill, { sha: 'f'.repeat(40) })), copied(entry(a.skill, { sha: 'f'.repeat(40) }), { omit: 'notice' }), { 'skills/core/alpha/NOTICE.md': renderNotice(a, MIT) }), expect: ['fail vendor-notice skills/core/alpha/NOTICE.md'] },
    { name: 'a NOTICE.md older than its licence file is stale', files: tree(lock(a), copied(a), { 'licenses/acme/skills.txt': MIT + 'more terms\n' }), expect: ['fail vendor-notice skills/core/alpha/NOTICE.md'] },
    { name: 'a NOTICE.md with no lock entry fails', files: skill('skills/core/alpha', { files: { 'NOTICE.md': '# Notice\n' } }), expect: ['fail vendor-notice skills/core/alpha/NOTICE.md'] },
    { name: 'an adapted skill NOTICE.md with pinned source links passes', files: skill('skills/core/alpha', { files: { 'NOTICE.md': adapted('https://github.com/acme/skills/blob/' + SHA + '/skills/x/SKILL.md') } }), expect: [] },
    { name: 'an adapted skill NOTICE.md with an unpinned source link fails', files: skill('skills/core/alpha', { files: { 'NOTICE.md': adapted('https://github.com/acme/skills/blob/' + SHA + '/a.md', 'https://github.com/acme/skills/blob/main/b.md') } }), expect: ['fail vendor-notice skills/core/alpha/NOTICE.md'] },
    { name: 'a generated NOTICE.md left after its lock entry is removed fails', files: skill('skills/core/alpha', { files: { 'NOTICE.md': renderNotice(a, MIT) } }), expect: ['fail vendor-notice skills/core/alpha/NOTICE.md'] },

    // ---- the generator ---------------------------------------------------------
    { name: 'the generator writes a missing NOTICE.md', files: tree(lock(a, b), copied(a, { omit: 'notice' }), copied(b, { omit: 'notice' })), before: ['scripts/vendor/notice.js'], expect: [] },
    { name: 'the generator rewrites a stale NOTICE.md', files: tree(lock(a), copied(a), { 'skills/core/alpha/NOTICE.md': '# old\n' }), before: ['scripts/vendor/notice.js'], expect: [] },
    { name: 'the generator leaves a current NOTICE.md byte for byte', committed: tree(lock(a), copied(a)), before: ['scripts/vendor/notice.js'], clean: true, expect: [] },
  ];
};
