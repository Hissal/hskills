# #122 release dry run

Ticket: [#122](https://github.com/Hissal/skill-collection/issues/122), under
[#78](https://github.com/Hissal/skill-collection/issues/78). Read and executed
2026-10-30 on Linux. Status: local offline evidence, ready for review.

The owner's answer 14 governs the version rules. Prerequisite
`d8f4e8c9cb407aa3b9dfaa4e6426287f07aa0278` (including `a9df868`) supplies the marketplace and the two
hook-only plugin manifests. #121 remains partial: automatic registration is
unsupported and the existing guard is preserved. Isolated plugin installs succeeded
on both hosts per [plugin evidence](guard-plugin-install.md); automatic migration
and live-session verification remain unfinished.

Executed `node scripts/release/dry-run.js` with pinned release-please 17.11.2
on Node 20.19.2 and repeated successfully on Node 22 (the supported runtime).
It builds candidates using the real release-please factory, Conventional Commit
parser, default changelog generator and JSON updaters, with local file discovery
in place of GitHub. Nothing is written or published. Synthetic commit scenarios
produce:

- Initial pack feature: `v0.1.0`.
- Pack feature after `0.1.0`: `v0.1.1`.
- Fix after `0.1.0`: `v0.1.1`.
- Breaking change after `0.1.0`: `v0.2.0`.

Every scenario stamps both manifests to its candidate version and preserves
all their other JSON fields:

- `hooks/command-guard/.claude-plugin/plugin.json`
- `hooks/command-guard/.codex-plugin/plugin.json`

The first candidate stamps both to `0.1.0`; checked-in versions stay `0.1.0`.
The approved collection-check fixture seam verifies coverage: a new plugin
without a configured stamp failed before the rule was implemented. A covered
plugin passes. This is distinct from #112's version/tag comparison.

Limits: no GitHub release, tag, release PR, remote workflow or installed harness
was exercised. This record is local because this task authorizes no publishing;
posting the dry-run evidence on #122 remains a handoff step. Catalog generation
is committed already; the automatic guide depends on its separate ticket and
must be generated and checked before a real release. GitHub token permissions
and PR-trigger behavior require repository-side verification.
