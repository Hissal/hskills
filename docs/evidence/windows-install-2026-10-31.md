# Native Windows install acceptance (2026-10-30/31)

Authenticated native Windows evidence for [#116](https://github.com/Hissal/skill-collection/issues/116),
[#119](https://github.com/Hissal/skill-collection/issues/119),
[#120](https://github.com/Hissal/skill-collection/issues/120),
[#121](https://github.com/Hissal/skill-collection/issues/121) and
[#127](https://github.com/Hissal/skill-collection/issues/127) under [#78](https://github.com/Hissal/skill-collection/issues/78),
produced from the [Windows handoff](../handoffs/windows-install-acceptance.md). The guard lifecycle and live
plugin probes from this run, with their later reruns, are in [Windows guard acceptance](windows-guard-followup.md).
Linux results and fixture identities are in [cross-scope evidence](issue-127-cross-scope.md).
Retained files are in [windows-install-2026-10-31](windows-install-2026-10-31/); every path below is relative to it.
Each run folder's `manifest.json` holds exact argv, environment overrides and exit statuses ([layout](README.md#record-layout)).

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
  and `uninstall` steps against the printed root ([guard acceptance](windows-guard-followup.md)).
- `node scripts/install/evidence/steering-windows.js`.

**Host isolation.** Every host call points its config home at the disposable home: `CLAUDE_CONFIG_DIR=<home>/.claude`
and `CODEX_HOME=<home>/.agents` (guard: `<home>/.codex`). Windows Codex ignores `HOME`/`USERPROFILE` for user
skills and lists `$CODEX_HOME/skills` as user scope, so `<home>/.agents/skills` (the installer's agents root) is
the user root Codex scans. Production Codex scans `~/.agents/skills`; the link-following under test is the same.
Existing auth is reached through a file symlink to the real credential file, created per run and removed
after it; the runner fails if the link was replaced. No credential was copied, and no trust was written by an agent.
The parent session's `CLAUDE_CODE_*`/`CODEX_*` variables are stripped from child processes.

**Ambient skill context.** The Codex `skills/list` responses list 51 skills per arm, including real user
skills outside the fixture, including `C:\dev\skills\mattpocock-skills-unity\...` and
`C:\Users\<user>\.agents\skills\find-skills`. The disposable config homes did not fully
isolate skill discovery. The matrix establishes reads of the fixture bodies and references
through installed paths within that ambient context. The retained `duplicate-codex-list-extract.json`
files keep the fixture entries and count the rest; the full responses are at [`a640892`](https://github.com/Hissal/skill-collection/tree/a640892606c001b1ab1ddbe8e1232948dc67f66c/docs/evidence/windows-install-2026-10-31/cross-scope-symlink).

**Codex sandbox.** A fresh `CODEX_HOME` has no Windows sandbox mode. Read-only exec then rejected every
shell command `blocked by policy`; those failed attempts are not results (originals `*-codex-no-sandbox*` at [`a640892`](https://github.com/Hissal/skill-collection/tree/a640892606c001b1ab1ddbe8e1232948dc67f66c/docs/evidence/windows-install-2026-10-31/cross-scope-symlink)).
`windows.sandbox="unelevated"` failed `CreateProcessAsUserW ... Access is denied` on the Store `pwsh.exe`.
The counted runs add the invocation-only override `-c windows.sandbox="elevated"`, matching the owner's real
config; each new `CODEX_HOME` triggers Codex's elevated sandbox setup, which the human approved through UAC.
An earlier Codex attempt hit the account usage limit and was overwritten; it is not evidence.

**Claude permissions.** Cross-scope runs allow only `Read(//c/.../<scenario>/**)`, covering the fixture links
and sources, with `--tools Read,Skill`, `--setting-sources user,project` and `disableAllHooks`. No permission
denials occurred. Exact argv and environment overrides are in each arm's `manifest.json`.

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
(`duplicate-codex-list-extract.json`) lists two enabled `scope-caller` entries, `repo` and `user`, with distinct
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
refusal was not exercised. No steering file is touched without the flag: the guard-only homes
([`guard/`](windows-install-2026-10-31/guard/)) carry no steering entries.

## Guard lifecycle and live plugin probes (#120, #121)

This run's guard records are in `guard/` and `guard-migration/`. Its results, the later native reruns
that repaired its findings, and the current status are in [Windows guard acceptance](windows-guard-followup.md).

## Not run or blocked

| Case | Required action |
| --- | --- |
| Actual OS directory-symlink refusal → junction | Human: turn Developer Mode off, then `node scripts/install/evidence/live-cross-scope-windows.js symlink` should record `Junction` without injection |
| Actual OS file-symlink refusal → steering copy | Same session: `node scripts/install/evidence/steering-windows.js` (its link arm expects symlinks and will stop at the first assertion; the copy is then in its log) |
| OpenCode host reading its steering file, OpenCode guard on Windows | Outside this handoff's Claude/Codex scope; the steering link/copy/drift rows above cover the OpenCode target's files only |
| Guard cases | See [Windows guard acceptance](windows-guard-followup.md#limits) |
