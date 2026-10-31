# Native Windows install acceptance (2026-10-30/31)

Authenticated native Windows evidence for [#116](https://github.com/Hissal/skill-collection/issues/116),
[#119](https://github.com/Hissal/skill-collection/issues/119),
[#120](https://github.com/Hissal/skill-collection/issues/120),
[#121](https://github.com/Hissal/skill-collection/issues/121) and
[#127](https://github.com/Hissal/skill-collection/issues/127) under [#78](https://github.com/Hissal/skill-collection/issues/78),
produced from the [Windows handoff](../handoffs/windows-install-acceptance.md).
Linux results and fixture identities are in [cross-scope evidence](issue-127-cross-scope.md).
Retained files are in [windows-install-2026-10-31](windows-install-2026-10-31/); every path below is relative to it.

## Environment

| Item | Value |
| --- | --- |
| Commit | Link matrix and guard: `3a50d50` (PR #180 head then). Steering: PR #180 `e0aa7ee` (native OpenCode target) merged into this branch |
| OS | Windows 11 Home 25H2, build 10.0.26200, x86_64; Developer Mode on; non-admin user |
| Shell / runtime | PowerShell 7.6.9; Node v22.23.2; git 2.56.0.windows.3 |
| Claude Code | 2.1.314, `--model opus --effort medium`, resolved **claude-opus-5-5** (init event and `modelUsage`) |
| Codex CLI | 0.166.0, `--model gpt-6.1-sol`, medium effort; app-server `thread/start` reports gpt-6.1-sol |

`npm ci`, `node scripts/check/test/run.js` (218 passed) and `node scripts/check/check.js`
(612 guard cases, 38 install cases, 0 failures, 4 existing agnix warnings) all exit 0 natively.

## Method

Three runners, each printing its temporary root; rerun them to reproduce:

- `node scripts/install/evidence/live-cross-scope-windows.js symlink|junction`, built on
  [`cross-scope.js`](../../scripts/install/evidence/cross-scope.js). Its `--junction` flag preloads a
  fixture-only `EPERM` for directory symlinks so the real installer takes its junction fallback.
- `node scripts/install/evidence/live-plugins-windows.js setup [--legacy-first]`, then `claude`, `codex`
  and `uninstall` steps against the printed root.
- `node scripts/install/evidence/steering-windows.js`.

**Host isolation.** Every host call points its config home at the disposable home: `CLAUDE_CONFIG_DIR=<home>/.claude`
and `CODEX_HOME=<home>/.agents` (guard: `<home>/.codex`). Windows Codex ignores `HOME`/`USERPROFILE` for user
skills and lists `$CODEX_HOME/skills` as user scope, so `<home>/.agents/skills` (the installer's agents root) is
the user root Codex scans. Production Codex scans `~/.agents/skills`; the link-following under test is the same.
Existing auth is reached through a file symlink to the real credential file, created per run and removed
after it; the runner fails if the link was replaced. No credential was copied, and no trust was written by an agent.
The parent session's `CLAUDE_CODE_*`/`CODEX_*` variables are stripped from child processes.

**Ambient skill context.** The retained `duplicate-codex-list.jsonl` files also list real user
skills outside the fixture, including `C:\dev\skills\mattpocock-skills-unity\...` and
`C:\Users\<user>\.agents\skills\find-skills`. The disposable config homes did not fully
isolate skill discovery. The matrix establishes reads of the fixture bodies and references
through installed paths within that ambient context.

**Codex sandbox.** A fresh `CODEX_HOME` has no Windows sandbox mode. Read-only exec then rejected every
shell command `blocked by policy` (retained as `*-codex-no-sandbox*`, failed attempts, not results).
`windows.sandbox="unelevated"` failed `CreateProcessAsUserW ... Access is denied` on the Store `pwsh.exe`.
The counted runs add the invocation-only override `-c windows.sandbox="elevated"`, matching the owner's real
config; each new `CODEX_HOME` triggers Codex's elevated sandbox setup, which the human approved through UAC.
An earlier Codex attempt hit the account usage limit and was overwritten; it is not evidence.

**Claude permissions.** Cross-scope runs allow only `Read(//c/.../<scenario>/**)`, covering the fixture links
and sources, with `--tools Read,Skill`, `--setting-sources user,project` and `disableAllHooks`. No permission
denials occurred. Exact argv and environment overrides are in each `*-invocation.json` / `*-argv.json`.

**Sanitizing.** Transcripts keep tool calls/results, skill injection, hook events, model identity and usage.
Assistant thinking, Codex reasoning items, init/command listings and remote-control status are omitted;
the account name is replaced with `<user>`. Trailing blank lines in the steering logs are trimmed.

## Cross-scope link matrix (#127, #116)

Link type per arm is the actual reparse type from `Get-Item ... LinkType` with `fs.realpathSync` targets,
in `*-links.json`; installer `LINK`, `ALLOW` and `DOCTOR` output is in `*-install.log`.
The symlink arm's directory symlinks are made by the OS without injection (Developer Mode). The junction
arm's refusal is **fixture-injected**; an actual OS refusal was not exercised. The duplicate scenario's
personal user caller is a fixture-made link of the arm's type.

All 12 cells **pass**: each loaded the caller body, the `RULES` body and `RULES-REFERENCE` through installed
paths before answering, and every run exited 0.

| Scenario | Host | Symlink arm (`cross-scope-symlink/`) | Junction arm (`cross-scope-junction/`) |
| --- | --- | --- | --- |
| Duplicate | Claude | Skill tool injects user `USER-CALLER`; reads user rules + reference | Same |
| Duplicate | Codex | Reads project `CALLER` first, then user rules + reference | Same |
| Project → user | Claude | Injects project `CALLER`; reads user rules + reference | Same |
| Project → user | Codex | Reads project caller, user rules + reference | Same |
| User → project | Claude | Injects user `CALLER` and project `RULES`; reads project reference | Same |
| User → project | Codex | Reads user caller, project rules + reference | Same |

Transcripts are `<scenario>-claude.jsonl` and `<scenario>-codex.jsonl`. Codex app-server `skills/list`
(`duplicate-codex-list.jsonl`) lists two enabled `scope-caller` entries, `repo` and `user`, with distinct
canonical source paths, in both arms. Windows precedence and listing match the Linux observations, so
[installation guidance](../project-install.md#scopes-and-harnesses) needs no change.

## Owner steering (#119)

Run root `steering/` at `e0aa7ee`; `results.json` holds each command, exit status and steering lines.
Targets: `.claude/CLAUDE.md`, `.codex/AGENTS.md` and native OpenCode `.config/opencode/AGENTS.md`,
read from the ownership record.

| Case | Observation |
| --- | --- |
| Actual file symlinks | All three targets `SymbolicLink`, realpath = fixture `steering.md`; `DOCTOR ok (symlink)` |
| Rerun without the flag | `ownerSteering` and the steering record unchanged; links kept |
| Unrecorded `CLAUDE.md` | `CONFLICT unrecorded steering target`; file content `mine` survives; the other two link |
| Fixture-injected file-link refusal | All three copied, `DOCTOR ok (copy)` |
| Edited Codex and OpenCode copies | `DOCTOR steering copy drift or replacement` for each; a rerun preserves both edits |

Every steering command exits 1 because the minimal fixture source installs the legacy guard, whose Codex
trust stays pending; steering verdicts come from the `DOCTOR` lines, not exit codes. Actual OS file-link
refusal was not exercised. No steering file is touched without the flag: the guard-only homes above
carry no steering entries.

## Guard lifecycle and live plugin probes (#120, #121)

Fresh home, `guard/`. Fixture `.claude/settings.json`, `.codex/config.toml` and `.codex/hooks.json` carry
an unrelated hook and setting. The project sits outside Git with no remote and an additive
`project.smoke` rule. Probes: `git push --force origin main`, `printf ALLOW_120`, `printf PROJECT_BLOCK_120`.

| Step | Exit | Observation |
| --- | --- | --- |
| `install`, `doctor` | 1, 1 | `REGISTERED` Claude and Codex at the content-addressed snapshot; `PENDING Codex human trust` |
| `hooks/list` before trust | 0 | Plugin hook from `.codex/plugins/cache/skill-collection-guard/command-guard/0.1.0`, `untrusted` (`codex-hooks-list-pending.jsonl`) |
| Human `/hooks` review | n/a | Done in `codex --no-daemon`; the daemon failed because its socket path under the temp home exceeds `SUN_LEN` |
| `hooks/list` after trust | 0 | Plugin hook `trusted`; the unrelated fixture user hook was also trusted in that review |
| `doctor` again | 0 | `doctor-again.jsonl` |
| `uninstall` | 1 | `CONFLICT changed registration preserved: .codex/config.toml`; everything stays registered (`uninstall-summary.json`) |

**Claude** (`claude-before`, `claude-session`, `claude-after`) runs the disposable home's actual registration.
Init reports `command-guard@skill-collection-guard` at `.skill-collection/plugin-cache/0.1.0-b6f7f1ce…`, the
installer snapshot, as the effective source. Real `PreToolUse:Bash` hook events deny `git.force-push-default`,
allow `ALLOW_120` silently (it executes) and deny `project.smoke`; the unrelated fixture hook also runs on every call.
The two-turn session keeps one session ID: turn 1 allows; between turns the disposable clone switches to
`test/claude-session-switch` without `hooks/command-guard`, and turn 2 still enforces all three probes.
A separate launch after the switch gives the same results.

**Codex** (`codex-before`, `codex-session`, `codex-after`) runs with trust granted. `hook/completed`
events from the cached plugin hook report `blocked` for `git.force-push-default` and `project.smoke`. The allow
probe passes both hooks and executes, but exits 1 because Codex's Windows shell is PowerShell, which has no
`printf`: that is a guard allow and a non-portable probe command. The app-server session keeps one thread ID
across both turns; turn 2 runs after the clone switches to `test/codex-session-switch` and still blocks both probes.

**Migration**, `guard-migration/` (`setup --legacy-first`): the legacy installer runs first. After `install`,
the Claude legacy handler is removed (Claude is ready) and the Codex legacy handler stays in `hooks.json` while
trust is pending. `hooks/list` reports that legacy handler **untrusted** too, so on this Codex version a pending
home has no effective Codex guard. Uninstall exits 0 with no owned files left; all three fixture files are
byte-identical, unrelated hooks kept.

**User configuration.** The runner fingerprints five real files: Claude `settings.json`,
`installed_plugins.json`, `known_marketplaces.json`, and Codex `config.toml`/`hooks.json`.
The retained `guard/uninstall-summary.json` reports only `known_marketplaces.json` changed;
`guard-migration/uninstall-summary.json` reports no changes to that set. These summaries
do not establish credential or skill-link preservation, changes to `~/.claude.json`,
or which process changed the marketplace file. Credential-file symlinks and disposable
homes describe the isolation method; they do not extend the retained hash evidence.

## Findings for owners

These are the outcomes observed in this run. For the current repair state, read the
[guard follow-up](windows-guard-followup.md).

1. **Codex trust makes uninstall conflict.** The required human `/hooks` approval rewrites the recorded
   `.codex/config.toml`, so `uninstall` refuses with a conflict and removes nothing. This matches the documented
   conflict rule but left trusted Codex installs needing manual recovery at the time of this run.
   The later [guard follow-up](windows-guard-followup.md) records the implementation repair
   and its separate acceptance status; these original observations are unchanged.
2. **Pending Codex trust leaves no effective Codex guard.** The retained legacy handler is itself untrusted.
3. **Codex probe portability.** `printf` does not exist in Codex's Windows PowerShell; a portable allow probe
   would make the allow cell exit 0.

## Not run or blocked

| Case | Required action |
| --- | --- |
| Actual OS directory-symlink refusal → junction | Human: turn Developer Mode off, then `node scripts/install/evidence/live-cross-scope-windows.js symlink` should record `Junction` without injection |
| Actual OS file-symlink refusal → steering copy | Same session: `node scripts/install/evidence/steering-windows.js` (its link arm expects symlinks and will stop at the first assertion; the copy is then in its log) |
| OpenCode host reading its steering file, OpenCode guard on Windows | Outside this handoff's Claude/Codex scope; the steering link/copy/drift rows above cover the OpenCode target's files only |
| Uninstall after Codex trust | Failed in this run; see the later [guard follow-up](windows-guard-followup.md) for the repair and rerun status |
