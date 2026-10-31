'use strict';
// Offline verification: only build candidates and apply their updaters in memory.
require('release-please');
const fs = require('fs');
const assert = require('assert/strict');
const { buildStrategy } = require('release-please/build/src/factory');
const { parseConventionalCommits } = require('release-please/build/src/commit');
const { Version } = require('release-please/build/src/version');
const { TagName } = require('release-please/build/src/util/tag-name');
const root = require('path').resolve(process.argv[2] || require('path').join(__dirname, '../..'));
const config = JSON.parse(fs.readFileSync(require('path').join(root, 'release-please-config.json'), 'utf8')).packages['.'];
const read = (file) => fs.readFileSync(require('path').join(root, file), 'utf8');
async function main() {
  const strategy = await buildStrategy({
    releaseType: config['release-type'],
    github: {
      repository: { owner: 'Hissal', repo: 'skill-collection' },
      findFilesByGlobAndRef: async (file) => { read(file); return [file]; },
    },
    targetBranch: 'main', path: '.',
    initialVersion: config['initial-version'],
    bumpMinorPreMajor: config['bump-minor-pre-major'],
    bumpPatchForMinorPreMajor: config['bump-patch-for-minor-pre-major'],
    includeComponentInTag: config['include-component-in-tag'],
    extraFiles: config['extra-files'],
  });
  const scenarios = [
    ['first release', 'feat(unity-pack): add guidance', null, '0.1.0'],
    ['pack feature', 'feat(unity-pack): add guidance', '0.1.0', '0.1.1'],
    ['fix', 'fix: repair guidance', '0.1.0', '0.1.1'],
    ['breaking', 'feat!: change contract\n\nBREAKING CHANGE: incompatible contract', '0.1.0', '0.2.0'],
  ];
  for (const [name, message, previous, expected] of scenarios) {
    const commits = parseConventionalCommits([{ sha: 'a'.repeat(40), message, files: ['skills/packs/unity/example/SKILL.md'] }]);
    const latest = previous ? { version: Version.parse(previous), tag: new TagName(Version.parse(previous)), sha: 'b'.repeat(40) } : undefined;
    const candidate = await strategy.buildReleasePullRequest(commits, latest);
    assert(candidate, name);
    assert.equal(candidate.version.toString(), expected, name);
    const stamped = [];
    for (const stamp of config['extra-files']) {
      const update = candidate.updates.find((u) => u.path === stamp.path);
      assert(update, stamp.path);
      const before = JSON.parse(read(stamp.path));
      const after = JSON.parse(update.updater.updateContent(read(stamp.path)));
      assert.equal(after.version, expected);
      delete before.version; delete after.version;
      assert.deepEqual(after, before);
      stamped.push(stamp.path + '=' + expected);
    }
    console.log(name + ': v' + expected + '; ' + stamped.join('; '));
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
