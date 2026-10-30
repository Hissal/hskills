'use strict';
const { renderNotice } = require('../../vendor/notice');

module.exports = ({ skill, skillMd }) => {
  const e = { skill: 'skills/core/alpha', source: 'acme/skills', path: 'alpha', sha: 'a'.repeat(40), license: 'MIT', changes: 'none' };
  const base = () => Object.assign(skill(e.skill), {
    'vendor.lock.json': JSON.stringify({ skills: [e] }),
    'vendor/acme/skills/alpha/SKILL.md': skillMd('alpha'),
    'licenses/acme/skills.txt': 'MIT\n',
    'skills/core/alpha/NOTICE.md': renderNotice(e, 'MIT\n'),
  });
  const file = e.skill + '/scripts/example.txt';
  const fixture = (name, text, expect, output) => ({ name, files: Object.assign(base(), { [file]: text }), expect, output });
  const cases = [
    fixture('copied zero-width text fails with line and code point', 'safe\nhidden\u200Btext\n', ['fail copied-file-safety ' + file], ['FAIL ' + file + ':2 [copied-file-safety] hidden Unicode U+200B']),
    fixture('copied personal Linux path fails', 'safe\n/home/alice/project\n', ['fail copied-file-safety ' + file], ['FAIL ' + file + ':2 [copied-file-safety] personal absolute path']),
  ];
  for (const point of [0xE0000, 0xE0061, 0xE007F, 0x00AD, 0x034F, 0x061C, 0x180E, 0x200C, 0x200D, 0x200E, 0x200F, 0x202A, 0x202B, 0x202C, 0x202D, 0x202E, 0x2060, 0x2066, 0x2067, 0x2068, 0x2069, 0xFEFF]) {
    const code = point.toString(16).toUpperCase().padStart(4, '0');
    cases.push(fixture('copied control U+' + code + ' fails', 'safe\ntext' + String.fromCodePoint(point) + '\n', ['fail copied-file-safety ' + file], ['FAIL ' + file + ':2 [copied-file-safety] hidden Unicode U+' + code]));
  }
  for (const path of ['/Users/alice/project', '/root/private', 'C:\\Users\\Alice\\project', 'c:/users/Alice/project', 'D:\\Documents and Settings\\Alice\\project', 'C:\\\\Users\\\\Alice\\\\project']) {
    cases.push(fixture('copied home path fails: ' + path, 'safe\n`' + path + '`\n', ['fail copied-file-safety ' + file], ['FAIL ' + file + ':2 [copied-file-safety] personal absolute path']));
  }
  cases.push(
    fixture('copied ordinary Unicode and portable paths pass', 'café Ελληνικά 日本語 😀 ❤️\n$HOME/project ~/project %USERPROFILE%/project\n/usr/local/bin /homework/a /UsersGuide/a https://example.com/home/alice /srv/home/alice C:\\Program Files\\Tool\n', []),
    { name: 'copy safety does not scan own files or baseline or prefix neighbours', files: Object.assign(base(), skill('skills/core/alphabet'), { 'skills/core/alphabet/example.txt': '\u200B /home/alice/project\n', 'vendor/acme/skills/alpha/example.txt': '\u202E /Users/alice/project\n', 'README.md': '\u2066 C:\\Users\\Alice\\project\n' }), expect: [] },
    { name: 'copy safety waits for a valid lock', files: Object.assign(base(), { 'vendor.lock.json': '{', [file]: '\u200B /home/alice/project\n' }), expect: ['fail vendor-lock vendor.lock.json'] }
  );
  return cases;
};
