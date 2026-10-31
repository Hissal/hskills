'use strict';
// Reads the skills at the last release tag from git history, for checks that
// compare the working tree with the last release (#77, owner answer 4), and
// the skill names every release tag carried (#112).
// A release tag is release-please's `v<version>`; the last one is the nearest
// reachable from HEAD. No tag (before the first release, or a checkout
// without tags) yields null.

const path = require('path');
const { spawnSync } = require('child_process');

const { splitFrontmatter } = require('./collection');
const { parseMetadata } = require('./metadata');

const RELEASE_TAG = 'v[0-9]*';

function git(root, args, input) {
  return spawnSync('git', args, { cwd: root, input, maxBuffer: 1 << 30 });
}

// Returns null, or { tag, skills: [{ dir, skillMd, id }] } for every skill at
// the tag carrying a valid ID.
function lastRelease(root) {
  const describe = git(root, ['describe', '--tags', '--abbrev=0', '--match', RELEASE_TAG, 'HEAD']);
  if (describe.status !== 0) return null;
  const tag = describe.stdout.toString('utf8').trim();

  const ls = git(root, ['ls-tree', '-r', '-z', '--name-only', tag + '^{commit}', '--', 'skills']);
  if (ls.status !== 0) throw new Error('git ls-tree failed at ' + tag + ': ' + ls.stderr.toString('utf8').trim());
  const paths = ls.stdout.toString('utf8').split('\0').filter((f) => /^skills\/(.+\/)?SKILL\.md$/.test(f));
  if (!paths.length) return { tag, skills: [] };

  // one cat-file process for every SKILL.md: "<oid> <type> <size>\n<content>\n"
  const cat = git(root, ['cat-file', '--batch'], paths.map((p) => tag + ':' + p).join('\n') + '\n');
  if (cat.status !== 0) throw new Error('git cat-file failed at ' + tag + ': ' + cat.stderr.toString('utf8').trim());
  const out = cat.stdout;
  const skills = [];
  let at = 0;
  for (const skillMd of paths) {
    const nl = out.indexOf(10, at);
    const header = out.toString('utf8', at, nl).split(' ');
    const size = Number(header[2]);
    const text = out.toString('utf8', nl + 1, nl + 1 + size);
    at = nl + 1 + size + 1;
    if (header[1] !== 'blob') continue;
    const { id, errors } = parseMetadata(splitFrontmatter(text).frontmatter);
    if (id && !errors.length) skills.push({ dir: path.posix.dirname(skillMd), skillMd, id });
  }
  return { tag, skills };
}

// Map of skill folder name to the latest release tag carrying it, over every
// release tag (not only the last), so a name removed in one release and
// reintroduced after the next is still known. Names only: one ls-tree per tag.
function releasedNames(root) {
  const names = new Map();
  const tags = git(root, ['tag', '--list', '--sort=v:refname', RELEASE_TAG]);
  if (tags.status !== 0) return names;
  for (const tag of tags.stdout.toString('utf8').split('\n').filter(Boolean)) {
    const ls = git(root, ['ls-tree', '-r', '-z', '--name-only', tag + '^{commit}', '--', 'skills']);
    if (ls.status !== 0) throw new Error('git ls-tree failed at ' + tag + ': ' + ls.stderr.toString('utf8').trim());
    for (const f of ls.stdout.toString('utf8').split('\0')) {
      if (/^skills\/(.+\/)?SKILL\.md$/.test(f)) names.set(path.posix.basename(path.posix.dirname(f)), tag);
    }
  }
  return names;
}

module.exports = { lastRelease, releasedNames };
