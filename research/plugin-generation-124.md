# Generated skill plugins (#124)

Read and executed 2026-10-30 on Linux. The [#123 gate](plugin-guide-reach.md)
passed before this implementation. Production `collection.json` remains empty;
all runtime identities below are isolated fixtures, not proposed collection skills.

## Contract and implementation

[Claude's path rules](https://code.claude.com/docs/en/plugins-reference#containment-and-existence)
require component paths inside the plugin root. The
[Codex packaging contract](https://developers.openai.com/plugins/build/plugins#path-rules)
also uses plugin-relative paths. We use separate `.claude-plugin/plugin.json`
and `.codex-plugin/plugin.json` at `skills/core` and `skills/packs/<name>`.
Marketplace entries point at those roots, and both manifests list immediate skill
folders with `./` paths. No skill is copied or referenced outside a plugin root.
The guard remains rooted at `hooks/command-guard`. The writer rejects a selected
path outside its group's root rather than emit an unsupported traversal.

This is the compatibility manifest format exercised by installed Claude Code
2.1.314 and Codex 0.166.0, not a claim about every host or portable archive format.
We deliberately do not put inline skill lists into marketplace entries: a
Claude inline definition is not evidence that Codex consumes the same fields.
The generator sorts lists, stamps `version.txt`, preserves other marketplace
entries, and maintains release-please's generated manifest stamps. The check
compares bytes and detects removed-group leftovers without rewriting files.
Membership closure and inert `paths:` policy remain #110's work.

## Executed fixture

`KEEP_PLUGIN_FIXTURE=1 node scripts/plugins/test/run.js` produced
`/tmp/plugins-124-P9IFVY`. Its generated core plugin contains `fixture-required`,
which reads `references/token.md`. Its demo pack contains `fixture-work`, whose
metadata hard-requires `hissal.skill-collection/fixture-required` and whose body
loads that skill before work and stops if missing. A separate onboarding plugin
contains one fixture skill. No real skill identity was invented.

Claude validated the generated pack (author warning; directory-submission
README/license/icon diagnostics do not fail local validation). In a scratch
`CLAUDE_CONFIG_DIR`, marketplace installation of both core and demo with
`--scope project` succeeded. Project `.claude/settings.json` enabled both.
A normal authenticated `opus` session, resolving to `claude-opus-5-5`, invoked
`collection-pack-demo:fixture-work`, then `collection-core:fixture-required`,
read the core reference and returned `PLUGIN-124-IRIS`. The invocation used
`--setting-sources project --strict-mcp-config --no-session-persistence
--permission-mode bypassPermissions --output-format stream-json --verbose`.
This verifies reach, not interactive permission prompts.

Codex registered the same generated marketplace and installed both plugins at
version 0.1.0 into separate scratch cache roots. An authenticated `gpt-6.1-sol`
`--no-daemon exec --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox
--json` session read the pack entry point, core entry point and core reference
successfully and returned the token. A second session with user plugin entries
`enabled = false` and project `.codex/config.toml` entries `enabled = true`
also loaded all three files. Codex exec itself automatically added a scratch
project trust entry; it was removed after observation. This is a limitation of
this experiment under the requested no-trust-write constraint: project enablement
was observed with the host-created trust state, not in an untrusted project.
No real user trust or settings were changed. No trust was explicitly granted by
an agent command. A future reproduction must account for that exec behavior.

Authentication used existing credentials selected by symlink, never copied;
inherited runtime environment remained intact. Raw streams remain local at
`/tmp/124-claude.jsonl`, `/tmp/124-codex.jsonl`, and
`/tmp/124-codex-project.jsonl`. Scratch install configuration remains under the
fixture root. These are real CLI sessions, separate from offline parser fixtures.
Missing-requirement controls: Claude with core disabled stopped and named the
missing callable and ID without returning the token. Codex with core merely
disabled still read its cached files; that diagnostic is not a successful
missing-requirement control. After `codex plugin remove collection-core@fixture-124`,
a fresh session loaded the pack, found no installed required skill, named the
missing callable/ID and stopped without a token. Streams remain local at
`/tmp/124-claude-missing.jsonl`, `/tmp/124-codex-missing.jsonl`, and
`/tmp/124-codex-absent.jsonl`.

Only the generated core/demo route was runtime tested; onboarding separation is
covered by deterministic CLI fixtures. macOS and Windows remain untested.

## Remaining content dependencies

Production manifest entries belong to their content specifications (#79–#88).
The core guide depends on #144 (workflow routes), #145 (installed pack guide
discovery), and #146 (continuation advice). Pack guide content belongs to each
pack specification. #175 owns the onboarding automatic guide identity and
generator (spec 12). When onboarding's actual manifest
entry arrives, this machinery emits its one-skill plugin separately from core.
The empty manifest cannot demonstrate those real guides. #113 owns their later
reachability evidence. #110 owns membership and requirement-closure checks;
#112 owns version/tag equality. None is replaced by these fixtures.

Sanitized load-chain summaries are committed in
[evidence/plugin-generation/results.json](evidence/plugin-generation/results.json).
Offline verification passed: plugin writer/check fixtures (including missing and
stale output, version changes, onboarding cardinality, empty-list removal and
release-please updates to generated manifests), all 218 collection fixtures,
trigger evaluator cases, release dry run, syntax checks and `git diff --check`.
The full collection check passed with 611 guard cases, 36 installer cases,
zero failures and four existing agnix warnings. The generator fixture and release
dry run also passed under Node 22.23.4; the initial full suites ran under Node
20.19.2. Real content and cross-platform acceptance remain outside this evidence.
