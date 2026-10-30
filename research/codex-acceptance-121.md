# Codex post-review plugin acceptance (#121)

Executed/read 2026-10-31 on Linux, integration base `096a9ea`, Codex CLI
0.166.0, actual model `gpt-6.1-sol`, provider `openai`, requested effort low.
Status: Linux Codex live plugin acceptance and same-running-session source branch
switch passed. This completes the Codex follow-up to [#121](https://github.com/Hissal/skill-collection/issues/121)
under #78; macOS and Windows behavior remain unverified here.

## Authentication, trust and attribution

The user reported completing `/hooks` review for
`command-guard@skill-collection-guard`. Before model turns, the actual same
app-server process returned `accountType: chatgpt` and `hooks/list` with the
intended plugin enabled and trusted. Its effective definition is
`/home/agent/.codex/plugins/cache/skill-collection-guard/command-guard/0.1.0/hooks/codex.json`;
the command uses that cache's `adapters/codex.js`. The legacy user hook remains
trusted at `/home/agent/.codex/hooks.json` with its original hash.

[Sanitized events](evidence/codex-acceptance-121/events.jsonl) retain hook source,
sourcePath, run ID, status and feedback. Both hooks fire, but the plugin's own
`hook/completed` events independently show its decisions. This establishes plugin
behavior despite the legacy hook; aggregate command denial alone would not.
No legacy setting was disabled or edited. No trust API or trust write was used.

The supported `exec --ignore-user-config` flag skips `config.toml` while keeping
normal authentication. With the now installed registry, an invocation-only
plugin enablement and harmless `printf ISOLATION_121` completed successfully:
[argv](evidence/codex-acceptance-121/ignore-argv.json),
[events](evidence/codex-acceptance-121/ignore-events.json). Its JSON stream does
not expose hook provenance, so this is **inconclusive for isolation**. App-server
help does not expose that exec flag. Acceptance instead uses the paired
account/read + hooks/list configuration and source-labelled runtime events.
The earlier pre-registration overlay failure does not establish current plugin
loading behavior. This investigation neither changes nor bypasses legacy trust.

## Same-process branch switch

The [driver](evidence/codex-acceptance-121/driver.py) records exact
[argv](evidence/codex-acceptance-121/argv.json) and uses normal installed Codex,
normal authentication and no home override. Its project is a fresh non-Git
directory with no remote, with an additive `project.smoke` rule. Its independent
source clone comes from `/tmp/plugin-live-121-1pzs54rm/source`; the registered
plugin derives from that earlier fixture's immutable installer snapshot, rather
than this working checkout. Only the new clone is switched and committed.

One ephemeral thread, `01a18f27-814f-7e53-8331-a5587b3f2de9`, stays in the same
running app-server process across two completed turns:

1. `printf BEFORE_SWITCH_121` succeeds; plugin completes with empty feedback.
2. The driver switches the disposable source to `test/acceptance-switch` and
   removes its tracked `hooks/command-guard` tree. It lists hooks again before
   the next turn: cached plugin paths, hashes, enablement and trust are identical.
3. `git push --force origin main` is blocked by plugin feedback naming
   `git.force-push-default`; `printf ALLOW_120` succeeds with empty plugin feedback;
   `printf PROJECT_BLOCK_120` is blocked by plugin feedback naming `project.smoke`.

Each denied command is attempted once, with no alternate-tool retry. An earlier
exploratory session correctly refused a second-turn request repeating already
denied commands; the retained acceptance run uses an allow-only first turn so
all post-switch probes are distinct. It does not weaken the guard's retry rule.

The four plugin completions have statuses completed, blocked, completed, blocked;
assertions checked rule IDs, empty allow feedback, identical before/after hook
lists and two completed turns. [Summary](evidence/codex-acceptance-121/summary.json)
records unchanged normal TOML settings and legacy hooks. Stored events omit
reasoning and account identifiers; no credentials were inspected or copied.

## Verification and limits

`npm ci`, `node scripts/check/check.js`, `node scripts/check/test/run.js` and
`git diff --check` passed for this evidence change. The collection check passed
611 guard cases and 36 install cases with four existing agnix warnings; the
check fixture suite passed all 218 cases. Artifact syntax, session identity and
reasoning-event filtering were also checked. Integration tip `096a9ea` was
already included on this branch. No production code,
owner-steering implementation, user repository branch, normal settings or trust
was modified. No agents, PR, push or integration merge was performed.

This proves live cached-plugin continuity when its disposable source branch
loses guard files. It does not prove that uninstall stops an already running
session, nor supply macOS/Windows acceptance. It does not establish a working
plugin-only invocation overlay; source-specific host events supply attribution.
