# Native Windows guard follow-up rerun (2026-10-31)

Authenticated native Windows rerun of the [guard follow-up](windows-guard-followup.md) for
[#120](https://github.com/Hissal/skill-collection/issues/120) and
[#121](https://github.com/Hissal/skill-collection/issues/121), on the merged repair. It reuses the
human-trusted fixture from the [original Windows run](windows-install-2026-10-31.md#guard-lifecycle-and-live-plugin-probes-120-121).
Retained files are in [windows-guard-followup-2026-10-31](windows-guard-followup-2026-10-31/); every path
below is relative to it.

**Outcome.** The live Claude and Codex probes pass, the portable allow probe executes on both hosts, and
preserved trust is recognized with no new approval. The trusted lifecycle still **fails** on the unmodified
native config: reinstall and uninstall both refuse with a conflict. A labelled diagnostic variant isolates two
remaining defects ([findings](#findings-for-owners)).

## Environment

| Item | Value |
| --- | --- |
| Commit | Installer, tests and runner: integration `97b9ca4` plus this commit's runner changes. Fixture source: disposable clone at its recorded base `3a50d50`; guard snapshot `0.1.0-b6f7f1ce…`, unchanged from the original run |
| OS | Windows 11 Home 25H2, build 10.0.26200, x86_64 |
| Shell / runtime | PowerShell 7.6.9; Node v22.23.2; git 2.56.0.windows.3 |
| Claude Code | 2.1.314, `--model opus --effort medium`, resolved **claude-opus-5-5** (init event and `modelUsage`) |
| Codex CLI | 0.166.0, `--model gpt-6.1-sol`, medium effort; app-server `thread/start` reports gpt-6.1-sol |

`npm ci`, `node scripts/check/test/run.js` (218 passed), `node scripts/install/test/run.js`
(40 install cases, plugin and trust suites, 0 failures) and `node scripts/check/check.js` all exit 0 natively.

## Method

- **Fixture reuse.** Root `%TEMP%\plugin-live-win-AN63RN` keeps the original home, host caches, trust keys and
  hashes, and its original records are untouched. Follow-up records were written to `followup-97b9ca4\` with
  `live-plugins-windows.js <step> <root> --out <dir> --label <name>`, then sanitized here with its `sanitize` step.
- **Trust.** No agent wrote trust, and the run needed no new `/hooks` approval. `trust-state-*.json` hold sizes,
  hashes, ordinary table names and the hook-state tables, with hashes masked and the account name replaced.
- **Isolation and auth.** Hosts run with `CLAUDE_CONFIG_DIR`/`CODEX_HOME` in the disposable home. Auth is a
  per-run file symlink to the existing credential file, removed after each host step, with no copies made.
  Codex runs add the invocation-only `-c windows.sandbox="elevated"` used in the original run.
- **Project rule.** The project's additive rule was replaced with the `node` rule printed by `probe-commands`
  (`project-rule.json`); nothing else in the project changed.
- **Probes.** Unchanged runner prompts, run outside Git with no remote: force-push, then
  `node -e "console.log('ALLOW_120')"`, then `node -e "console.log('PROJECT_BLOCK_120')"`. Each host step ran once.
- **Sanitizing.** As in the original report; the runner now also drops Claude `thinking_tokens` estimates and
  Codex moderation metadata. Fingerprint files keep only the five configuration files, not credential hashes.

## Lifecycle on the unmodified trusted config

Starting state (`trust-state-before.json`): `.codex/config.toml` is 932 bytes, LF only, no BOM. Its hook-state
tables are the bare `[hooks.state]` parent, the plugin table with a basic key, and the unrelated user hook
table with a literal backslash key. Its ordinary tables are `marketplaces`, `plugins`, `[tui]` and `[windows]`.

| Step | Exit | Observation | Record |
| --- | --- | --- | --- |
| `doctor` | 0 | `REGISTERED` Claude and Codex at the snapshot | `doctor-before.jsonl` |
| Reinstall (`install --source <clone>`) | 1 | `FAIL install: CONFLICT changed registration preserved: …\.codex\config.toml`; config and journal byte-identical afterwards | `reinstall.jsonl` |
| `doctor` | 0 | Same as before | `doctor-after.jsonl` |
| `hooks/list` | 0 | Plugin hook and unrelated user hook both `trusted`, enabled | `hooks-list-after.jsonl` |
| Claude live | 0, 0, 0 | [below](#live-probes) | `claude-*.jsonl` |
| Codex live | 0, 0, 0 | [below](#live-probes) | `codex-*.jsonl` |
| `uninstall` | 1 | `FAIL uninstall: CONFLICT …\.codex\config.toml`; all 44 owned paths remain; config, trust tables and journal hashes unchanged | `uninstall.jsonl`, `uninstall-summary.json` |

## Live probes

Both hosts ran against the existing registration that doctor reported healthy and `hooks/list` trusted.

**Claude.** Init reports `command-guard@skill-collection-guard` at `.skill-collection/plugin-cache/0.1.0-b6f7f1ce…`.
In `claude-before`, `claude-session` turn 2 and `claude-after`, the plugin's `PreToolUse:Bash` hook responses deny
`git.force-push-default` and `project.smoke`. The allow probe passes both hooks, executes and prints `ALLOW_120`.
The unrelated fixture hook also runs on every call. `claude-session` keeps one session ID; turn 1 allows, the
clone then switches to `test/claude-session-switch` without `hooks/command-guard`, and turn 2 still enforces
all three probes.

**Exact Claude grants.** The runner grants only `Bash(git push --force origin main)` and the two
`Bash(node -e "console.log('…')")` commands, whose inner parentheses are part of the command. The allow probe
ran in `-p` mode without a permission refusal. Each result's `permission_denials` lists only the two commands
the hook denied, and their tool results carry the guard's message. This shows the grant matched; a control run
without the grant was not made.

**Codex.** `codex-session` keeps thread `01a18f60-491e-…` across both turns; turn 2 runs after the clone switches
to `test/codex-session-switch`. `hook/completed` events from `.codex/plugins/cache/skill-collection-guard/command-guard/0.1.0/hooks/codex.json`
report `blocked` for `git.force-push-default` and `project.smoke`. The user hook reports `completed`. The allow
probe runs through `pwsh.exe`, exits 0 and prints `ALLOW_120`. `codex-before` and `codex-after` (exec) show the
same: both blocks in stderr as `Command blocked by PreToolUse hook`, and the allow command exits 0.

## Diagnostic variant (fixture-adjusted, not acceptance)

To separate the trust-table handling from the conflict cause, the run removed only the 77-byte `[tui]` and
`[windows]` chunk from the config. That restored the journal's ordinary bytes; the hook-state bytes stayed
identical (`trustSha256` `55f80e…` in `trust-state-before.json` and `trust-state-variant.json`).

| Step | Exit | Observation | Record |
| --- | --- | --- | --- |
| `uninstall` | 0 | No owned files remain; Claude `settings.json` and `.codex/hooks.json` byte-identical to the fixture; config ordinary bytes equal the fixture; both trust tables preserved (549 bytes) | `uninstall-variant-summary.json` |
| Reinstall | 1 | `FAIL install: CONFLICT unrecorded plugin snapshot: …\plugin-cache\0.1.0-b6f7f1ce…` | `reinstall-variant.jsonl` |
| `doctor`, `hooks/list` | 1, 0 | `missing plugin registration`; only the user hook listed, `trusted` | `doctor-variant.jsonl`, `hooks-list-variant.jsonl` |
| Manual recovery | n/a | The snapshot directory held 0 files, only empty directories left by uninstall; the empty tree was removed | n/a |
| Reinstall | 0 | `REGISTERED` both, no `PENDING` line | `reinstall-recovered.jsonl` |
| `doctor`, `hooks/list` | 0, 0 | Plugin hook and user hook `trusted`, with no new approval; the trust lines and hash values are unchanged, placed before the re-registered tables | `trust-state-reinstalled.json`, `hooks-list-recovered.jsonl` |
| `uninstall` | 0 | No owned files remain; settings and `hooks.json` identical; ordinary bytes equal the fixture; trust section bytes equal the original (`55f80e…`) | `uninstall-recovered-summary.json` |

`uninstall-recovered-summary.json` reports `trustTablesPreserved: false` because its exact comparison counts one
trailing blank line that separated the trust section from the re-registered tables. `after.trustSha256` equals
the starting state. Each summary's `guardRemaining: true` for the config is the plugin's hook-state key.

## User configuration

`user-fingerprints-before.json`, `-after-main.json` and `-after.json` show the five real configuration files
unchanged throughout this run. The summaries' `changed` entry for `known_marketplaces.json` compares against the
original run's baseline in `state.json`. That file had already changed before this run started.

## Findings for owners

1. **Codex-written ordinary tables make the trusted lifecycle conflict.** Besides the hook-state tables, the
   trusted config holds `[tui] screen_reader_detection_done = true` and `[windows] sandbox = "unelevated"`. Neither
   is in the journal's post-install bytes. The config was last written at the same time as Codex's `.hook-trust`
   directory (23:36), consistent with the human `/hooks` session in `codex --no-daemon`; this run did not observe
   the write. Repair compares all other bytes exactly, so reinstall and
   uninstall refuse. Fail-closed behavior held: nothing changed. Owners must decide whether Codex-written
   non-trust state counts as a personal edit; the follow-up's native shape covered only the trust tables.
2. **Uninstall leaves the empty snapshot directory tree, so reinstalling the same snapshot conflicts.**
   Uninstall unlinks recorded files only ([`plugin.js:93`](../../scripts/install/plugin.js#L93)). `prepare` treats an
   existing snapshot directory without journal records as unrecorded ([`plugin.js:19-34`](../../scripts/install/plugin.js#L19-L34)).
   This reading is not Windows-specific. The fixture again holds an empty snapshot tree after the final uninstall.

## Not covered

| Case | Status |
| --- | --- |
| Trusted reinstall and uninstall on the unmodified native config | **Failed**, finding 1 |
| Reinstall of the same snapshot after uninstall without manual recovery | **Failed**, finding 2 |
| Claude run without the exact grant (negative control) | Not run |
| OpenCode on Windows, actual OS symlink refusal, macOS | Outside this follow-up |
