# Releases and commit convention

The [owner decision](https://github.com/Hissal/skill-collection/issues/78#issuecomment-6510537918)
sets one version for the collection, including pack-only changes. Use
Conventional Commits: `<type>(<optional scope>): <lowercase imperative description>`,
with no trailing period and at most 72 characters. Scopes are free-form; use the
pack name for pack-only changes, for example `feat(unity-pack): add guidance`.
Use the same title convention for PRs and issues and `type/kebab-case-description`
for branches.

Before 1.0, breaking changes (`!` or a `BREAKING CHANGE:` footer) bump minor;
`feat` and `fix` bump patch. The first release is `0.1.0`. The owner chooses
when to move to 1.0. Release-please groups unreleased commits into a release PR;
each releasable commit contributes to the single next version, rather than
creating one release per commit. Default changelog sections include Features,
Bug Fixes and breaking-change notes. Other types alone may not trigger a release.

## Maintaining release inputs

When adding a Claude or Codex plugin manifest, add a typed `json` entry to the
root package's `extra-files` in `release-please-config.json`, with its repository
path and `jsonpath: "$.version"`. The `release-config` check catches omissions.
The marketplace lists sources and has no version field to stamp. Version/tag
equality is #112's separate check; coverage here does not implement it.

Keep the release manifest empty until the first release PR: seeding it with
`0.1.0` would describe an existing release and could skip the first version.
`version.txt` is the simple strategy's version file. All plugin stamps happen
inside the release PR, alongside the changelog and release manifest update.

Before merging a release PR, run:

```
npm ci
node scripts/release/dry-run.js
node scripts/check/test/run.js
node scripts/check/check.js
```

Use Node 22 or newer (also used by CI). The offline dry run builds release-please
candidates from synthetic Conventional Commits and applies the actual proposed
manifest updaters in memory. It verifies the initial version, pack feature, fix
and breaking bumps, plus preservation of other manifest fields. It makes no
GitHub requests and writes no release artifacts.

## GitHub operation

The workflow runs on pushes to the default branch, currently `main`, with
repository contents and pull-request write permissions. It uses the repository
GITHUB_TOKEN. Enable Actions' permission to create pull requests in repository
settings before relying on it. GitHub does not trigger ordinary PR workflows
from PRs opened with GITHUB_TOKEN; run the collection checks independently on
the proposed release head before merging. Update the workflow branch filter if
the default branch changes.

Merging a release PR allows the next workflow run to create its GitHub release
and `v<version>` tag. A tag identifies the committed catalog at that revision;
verify generated catalog and automatic guide outputs before approving the PR.
The automatic guide remains dependent on its separate implementation. Guard
plugin registration remains partial under #121; release stamping does not
establish that plugin installation works in a harness.

Implementation evidence: [#122 offline dry run](../research/release-122.md).
Configuration semantics: [release-please manifest documentation](https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md)
and [action token behavior](https://github.com/googleapis/release-please-action#other-actions-on-release-please-prs)
(read 2026-10-30).

Skill plugin manifests under `skills/core` and `skills/packs/<pack>` are generated
with the current `version.txt`. The plugin generator also maintains their typed
JSON `extra-files` entries, preserving guard stamps. After changing membership,
run `node scripts/plugins/generate.js` and commit all outputs together. Release
PRs stamp those manifests with the same next version as `version.txt`; regeneration
at that version must stay byte-identical. Empty groups have no versioned manifest.
The offline dry run accepts an optional collection root for temporary fixture
verification; the plugin CLI fixture exercises actual release-please updaters on
its generated core, pack and onboarding manifests through that seam.
