# Cross-scope install evidence (#127)

Authenticated Linux evidence, 2026-10-30, for [#127](https://github.com/Hissal/skill-collection/issues/127)
under [#78](https://github.com/Hissal/skill-collection/issues/78).
Native Windows runs of both link types on both harnesses are in
[Windows install acceptance](windows-install-2026-10-31.md).

## Method

Read both issues and #78 owner comments, the prior evidence, and
[authenticated hook evidence](../../research/live-hooks-120.md).
The recovered run started at `a37ed41`; this continuation preserves integration
`6815c9627fe5ee83ea584c2acbb773e74b1fc698`. The earlier blank-HOME probes tested an empty
account, not the existing authentication; they were not a live-run blocker.

Run `python3 scripts/install/evidence/live-cross-scope.py` on Linux with mount
namespaces enabled and the installed authenticated CLIs. It first calls the
[filesystem builder](../../scripts/install/evidence/cross-scope.js), which invokes
the real installer and asserts link targets, reference bytes and clean project
baselines for three fresh scenarios. An optional existing fixture root argument
resumes unfinished runs. Successful status files are skipped. Retained successful transcripts were checked
again during recovery; the app-server listing was captured during this continuation.

Each CLI runs inside `unshare -Urm`: a private user/mount namespace, preserving
network access. Read-only bind mounts replace only the process-visible
`$HOME/.claude/skills` and `$HOME/.agents/skills` with the scenario's installed
user links. HOME and auth configuration stay at their normal locations. No secret
is copied, symlinked, printed or read by the fixture. No persistent user settings
are edited. Ordinary CLI runtime metadata may still be written in the normal
home. This method isolates skill directories, not the whole runtime home.

Claude uses `--model opus --effort medium`, resolving to **claude-opus-5-5**,
version **2.1.314**, normal permission checks, temporary Read permission,
`--setting-sources user,project`, no MCP servers, and temporary `disableAllHooks`.
Built-in skills/plugins remain visible; the prompt restricts work to the fixture.
Empty setting sources hide fixture skill discovery, so they are unsuitable here.
Codex **0.166.0** uses explicit **gpt-6.1-sol**, medium effort, ephemeral execution,
read-only sandbox and approval policy `never`, retaining existing auth and trust.
Linux was `6.12.113+deb13-amd64`, x86_64.

The successful fixture root was `/tmp/skill-scope-127-Y1mRqT`.
Earlier exploratory invocation mistakenly added `-n` (network namespace), causing
Claude API retries; it was stopped and corrected. An initial Codex selector
`gpt-6.1` lacked model metadata and failed; the successful runs explicitly select
`gpt-6.1-sol`. Neither failed attempt counts as reachability evidence.

## Results and retained transcripts

Transcripts in [issue-127](issue-127/) retain tool calls/results, skill body
injection, model identity and result usage. Assistant thinking and
unrelated initialization metadata are omitted. Its [manifest](issue-127/manifest.json)
retains exact arguments, mount mappings and exit statuses. These are actual host tool reads, distinct from
the builder's Node filesystem assertions.

| Scenario | Claude Code | Codex |
| --- | --- | --- |
| Duplicate caller | Skill tool injects user body, `USER-CALLER` | First caller body read is project `CALLER` |
| Project caller → user requirement | Project caller body, user rules body and user reference loaded | Project caller body, user rules body and user reference loaded |
| User caller → project requirement | User caller body, project rules body and project reference loaded | User caller body, project rules body and project reference loaded |

Each mixed-scope run reads `RULES` and `RULES-REFERENCE` before its final answer.
Caller and requirement are installed in different scopes, never sibling folders.
Both harnesses follow the installer-created Linux symlinks. Claude has no
permission denials in these successful runs. All six executions exit 0.

The actual Codex app-server `skills/list` response is retained separately as
[codex-list.jsonl](issue-127/codex-list.jsonl). It lists two enabled `scope-caller`
entries, one `repo` and one `user`, with distinct canonical source paths. The
model's claim about its listing is not the basis for this observation. Listing
both entries does not mean both bodies were automatically injected: the observed
Codex invocation reads the project body. Claude's actual Skill tool injects the
user body and reports its user-scope base directory. These findings support the
existing [installation guidance](../project-install.md#scopes-and-harnesses);
they do not establish deterministic Codex selection across versions or prompts.

## Windows boundary and automated checks

Linux namespace or filesystem results cannot establish Windows harness behavior.
The native Windows matrix (12 authenticated cells, actual symlinks and
fixture-injected junction fallback) is in [Windows install acceptance](windows-install-2026-10-31.md).

The installer test runner includes Windows-only cases for directory symlinks
and junction fallback after simulated `EPERM` on directory symlink creation.
Both exercise the real installer, independently inspect the Windows LinkType and
canonical target, resolve the installed destination, read a reference token
through both harness folders, and run doctor. Steering-copy coverage denies file
symlinks, checks copied bytes and detects drift. These run in the Windows
collection CI job without authentication; they are filesystem evidence only.
An actual OS refusal (rather than injected) remains open. Plugin reachability
is separate.

## Validation history

This report was recovered from the preserved `t3-351c8e18` checkout; its branch
`524c6fa0e6959bfffbea7b91b2ce3895a5144554` was merged into integration
`6815c9627fe5ee83ea584c2acbb773e74b1fc698`. At both steps `npm ci`, the collection
check (611 guard and 36 installer cases, four existing agnix warnings) and 218
check fixtures passed on Linux, and the retained transcripts were re-parsed; at
the merge they were also inspected for secrets and assistant thinking. Those were checks of
retained evidence, not new authenticated executions. The full validation log is in the
[report at `a640892`](https://github.com/Hissal/skill-collection/blob/a640892606c001b1ab1ddbe8e1232948dc67f66c/docs/evidence/issue-127-cross-scope.md#recovery-validation).
