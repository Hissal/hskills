# Native Windows guard acceptance (#120/#121)

Authenticated native Windows evidence for the command guard's plugin registration, Codex
trust lifecycle and live host probes, for [#120](https://github.com/Hissal/skill-collection/issues/120)
and [#121](https://github.com/Hissal/skill-collection/issues/121) under
[#78](https://github.com/Hissal/skill-collection/issues/78). The link matrix and owner steering
from the same machine are in [Windows install acceptance](windows-install-2026-10-31.md).
Claims are labelled by source where it matters: **native** (Windows observation), **source**
(pinned upstream code) or **fixture** (synthetic test input).

**Status.** All three runs below share one human-trusted fixture. Native passes: registration
with pending trust and legacy-first migration (run A); live Claude and Codex block/allow probes
across a same-session source branch switch (run B); and two consecutive trusted lifecycle cycles
with no manual cleanup (run C). Earlier failures are kept as [history](#history); open cases
are under [limits](#limits).

## Runs

| Run | Code | Records (relative to this folder) | Established |
| --- | --- | --- | --- |
| A, 2026-10-30/31 | `3a50d50` | [`windows-install-2026-10-31/guard/`](windows-install-2026-10-31/guard/), [`guard-migration/`](windows-install-2026-10-31/guard-migration/) | Registration, pending trust, human `/hooks` review, migration. Its uninstall conflicted |
| B, 2026-10-31 | integration `97b9ca4` plus that commit's runner changes | [`windows-guard-followup-2026-10-31/`](windows-guard-followup-2026-10-31/) | Live probes on the trusted registration. Trusted reinstall and uninstall still conflicted |
| C, 2026-10-31 | `ea843fc` | [`windows-lifecycle-final-2026-10-31/`](windows-lifecycle-final-2026-10-31/) | Trusted lifecycle passes twice |

Each record folder's `manifest.json` holds every step's exact argv, environment overrides,
exit status and output file ([layout](README.md#record-layout)). Runs B and C use the guard
snapshot `0.1.0-b6f7f1ce…` that run A installed; their fixture source is a disposable clone
detached at its recorded base `3a50d50`.

## Environment

| Item | Value |
| --- | --- |
| OS | Windows 11 Home 25H2, build 10.0.26200, x86_64; non-admin user |
| Shell / runtime | PowerShell 7.6.9; Node v22.23.2; git 2.56.0.windows.3 |
| Claude Code | 2.1.314, `--model opus --effort medium`, resolved **claude-opus-5-5** (init event and `modelUsage`) |
| Codex CLI | 0.166.0, `--model gpt-6.1-sol`, medium effort; app-server `thread/start` reports gpt-6.1-sol |

Run C made no model calls; it used Codex only for registration, `hooks/list` and `config/batchWrite`.
Native checks exited 0 on every run: run A's are in the [install report](windows-install-2026-10-31.md#environment).
Run B also passed `node scripts/install/test/run.js` (40 install cases, plugin and trust suites).
Run C's logs are in `windows-lifecycle-final-2026-10-31/checks/`: `npm ci`; 218 check fixtures;
the collection check with 0 failures and 4 existing agnix warnings; 40 install cases, the plugin
and trust suites, and 9 lifecycle cases.

## Method

- **Fixture.** `node scripts/install/evidence/live-plugins-windows.js setup [--legacy-first]` prints a
  disposable root (`%TEMP%\plugin-live-win-AN63RN`; migration `…-SYQyoy`), then `claude`, `codex` and
  `uninstall` steps run against it. Fixture `.claude/settings.json`, `.codex/config.toml` and
  `.codex/hooks.json` carry an unrelated hook and setting. The project sits outside Git with no
  remote and an additive `project.smoke` rule. Runs B and C wrote new record folders under the same
  root with `<step> <root> --out <dir> --label <name>`, then sanitized them with the runner's
  `sanitize` step, leaving earlier records untouched.
- **Isolation and auth.** Hosts run with `CLAUDE_CONFIG_DIR=<home>\.claude` and `CODEX_HOME=<home>\.codex`.
  Auth is a per-run file symlink to the existing credential file, removed after each host step;
  nothing is copied. Run C needed no credentials and created no link. Parent `CLAUDE_CODE_*` and
  `CODEX_*` variables are stripped. Codex adds the invocation-only `-c windows.sandbox="elevated"`
  ([why](windows-install-2026-10-31.md#method)).
- **Trust.** The only approval was the human `/hooks` review in run A. No agent wrote `hooks.state`.
- **Sanitizing.** Transcripts keep tool calls and results, hook events, model identity and usage.
  Assistant thinking, Claude `thinking_tokens` events, Codex reasoning and moderation metadata are
  omitted; the account name is `<user>`. `trust-state-*.json` mask hashes. Fingerprint files hold
  only the five configuration-file hashes, not credentials.

## Pending trust and migration (run A)

| Step | Exit | Observation | Record (`windows-install-2026-10-31/guard/`) |
| --- | --- | --- | --- |
| `install`, `doctor` | 1, 1 | `REGISTERED` Claude and Codex at the content-addressed snapshot; `PENDING Codex human trust` | `install.log`, `doctor.log` |
| `hooks/list` before review | n/a | Plugin hook from `.codex/plugins/cache/skill-collection-guard/command-guard/0.1.0` and the fixture user hook, both `untrusted` | `codex-hooks-list-pending.jsonl` |
| Human `/hooks` review | n/a | Done in `codex --no-daemon`; the daemon failed because its socket path under the temp home exceeds `SUN_LEN` | n/a |
| `hooks/list` after review | 0 | Plugin hook `trusted`; the unrelated fixture user hook was also trusted in that review | `codex-hooks-list.jsonl` |

**Migration** (`guard-migration/`, `setup --legacy-first`): the legacy installer runs first. After
`install`, the Claude legacy handler is removed (Claude is ready) and the Codex legacy handler stays
in `hooks.json` while trust is pending. `hooks/list` reports that legacy handler **untrusted** too,
so on this Codex version a pending home has no effective Codex guard; doctor now reports that state
as `UNPROTECTED` ([repairs](#repairs-under-test)). Uninstall exits 0 with no owned files left; all
three fixture files are byte-identical and unrelated hooks are kept (`uninstall-summary.json`).

## Live probes (run B)

Probes, in order: `git push --force origin main`, `node -e "console.log('ALLOW_120')"`,
`node -e "console.log('PROJECT_BLOCK_120')"`. The project rule is the `node` rule printed by
`live-plugins-windows.js probe-commands` (`project-rule.json`). Both hosts ran against the registration
that doctor reported healthy (`doctor-before.log`) and `hooks/list` reported trusted (`hooks-list-after.jsonl`),
with no new approval. Each host step ran once and exited 0.

**Claude** (`claude-before`, `claude-session`, `claude-after`). Init reports `command-guard@skill-collection-guard`
at `.skill-collection/plugin-cache/0.1.0-b6f7f1ce…`, the installer snapshot. Real `PreToolUse:Bash` hook
responses deny `git.force-push-default` and `project.smoke`; the allow probe passes both hooks, executes
and prints `ALLOW_120`. The unrelated fixture hook runs on every call. `claude-session` keeps one session
ID: turn 1 allows, the clone then switches to `test/claude-session-switch` without `hooks/command-guard`,
and turn 2 still enforces all three probes. `claude-after` is a separate launch after the switch with
the same results. The runner grants only the three exact commands, never a wildcard; each result's
`permission_denials` lists only the two commands the hook denied. A control without the grant was not run.

**Codex** (`codex-before`, `codex-session`, `codex-after`). `codex-session` keeps thread `01a18f60-491e-…`
across both turns; turn 2 runs after the clone switches to `test/codex-session-switch`. `hook/completed`
events from `.codex/plugins/cache/skill-collection-guard/command-guard/0.1.0/hooks/codex.json` report
`blocked` for `git.force-push-default` and `project.smoke`; the user hook reports `completed`. The allow
probe runs through `pwsh.exe`, exits 0 and prints `ALLOW_120`. The `exec` runs show both blocks in
`codex-before.stderr`/`codex-after.stderr` as `Command blocked by PreToolUse hook`, and the allow exits 0.

## Trusted lifecycle acceptance (run C)

**Outcome: pass.** Install, doctor, `hooks/list`, reinstall, doctor, uninstall, same-snapshot install,
doctor, `hooks/list` and uninstall all exit 0, twice in a row, with no cleanup between measured steps.
Trust is recognized without new approval. Each uninstall leaves no owned files and no snapshot entries,
and keeps the preference tables, both trust tables and the fixture's personal settings. Records are in
`windows-lifecycle-final-2026-10-31/`; the manifest maps all 20 steps to their exit and output.
Byte-identical outputs of repeated steps are stored once and listed per step with their hash.

**Starting state** (`trust-state-pre-preparation.json`): uninstalled; `.codex/config.toml` is 549 bytes
holding the fixture line and both trust tables (`trustSha256` `55f80e…`, as in run B's `trust-state-before.json`).

**One-time fixture preparation (not acceptance).** Run B's diagnostic left an unrecorded empty snapshot
tree, which production still refuses by design. `fixture-preparation.json` records the checks (7 real
directories, 0 files, 0 reparse points by PowerShell `Attributes`/`LinkType` and `lstat`; journal with
no writes, no hosts and no `directories` field) and the removal: non-recursive `rmdir` of exactly those
directories, deepest first, keeping the `plugin-cache` parent. It ran once, before the measured steps.

**Native writer-input variant.** Run B's diagnostic had removed the 77-byte `[tui]`/`[windows]` chunk.
To reproduce Codex writing it after registration, the real Codex 0.166.0 app-server
(`codex app-server --stdio`, `CODEX_HOME` set to the disposable home) received one `config/batchWrite`
right after the first install (`c1-pref-write.json`), holding only:

```json
[{ "keyPath": "tui.screen_reader_detection_done", "value": true, "mergeStrategy": "replace" },
 { "keyPath": "windows.sandbox", "value": "unelevated", "mergeStrategy": "replace" }]
```

This is an **authorized writer-input variant, not the untouched original human config**. Codex returned
`status: ok` and added exactly 77 bytes (854 → 931), after the trust tables; hook-state lines were unchanged.
`animations` was not written: Codex sets it only when it detects a screen reader.

| Step | Exit | Observation | Record |
| --- | --- | --- | --- |
| Install | 0 | `REGISTERED` Claude and Codex; journal records 46 writes and 7 snapshot directories | `c1-install`, `c1-journal-installed.json` |
| Codex `config/batchWrite` | n/a | Preferences added; journal `record.after` has no `[tui]`/`[windows]` | `c1-pref-write.json`, `c1-journal-after-pref.json` |
| Doctor, `hooks/list` | 0, 0 | `REGISTERED` both; plugin and user hook `trusted`, enabled | `c1-doctor`, `c1-hooks-list` |
| Reinstall, doctor | 0, 0 | Config byte-identical (`1c68d9…`) | `c1-reinstall`, `c1-trust-state-prefs.json`, `c1-trust-state-reinstalled.json` |
| Uninstall | 0 | [Summaries below](#uninstall-summaries) | `c1-uninstall-summary.json` |
| Same-snapshot install, doctor, `hooks/list` | 0, 0, 0 | No conflict on the snapshot directory; both hooks `trusted` | `c1-install-same`, `c1-trust-state-same.json` |
| Uninstall | 0 | Same final config as the first uninstall | `c1-uninstall-same-summary.json` |
| Cycle 2 (`c2-*`) | all 0 | Same steps with preferences present before registration; same outcomes and final bytes | `c2-*` |

No output from any measured step contains `FAIL`, `CONFLICT`, `PENDING` or `UNPROTECTED`.

### Uninstall summaries

All four (`c1-uninstall`, `c1-uninstall-same`, `c2-uninstall`, `c2-uninstall-same`) agree:

| Field | Value |
| --- | --- |
| `status`; `remainingOwned`, `snapshotEntriesRemaining` | 0; `[]`, `[]` |
| `.claude/settings.json`, `.codex/hooks.json` | `identical: true` to the fixture, unrelated hook kept |
| `preferenceTables.before` = `.after` | `[tui] screen_reader_detection_done = true`, `[windows] sandbox = "unelevated"` |
| `trustBytesIdentical`, `trustLinesPreserved` | `true`, `true` (separate claims; both hold) |
| Config after | 626 bytes, `4179e4…`: the 549-byte start plus the 77 preference bytes |
| `nonTrustConfigMatchesMinimalFixture` | `false`, **informational only**: the comparison counts the preserved preference tables |

The config's `guardRemaining: true` is the plugin's own hook-state key, which is kept trust.
`userConfigUnchanged: false` compares against run A's `state.json` baseline ([user configuration](#user-configuration)).

**Trust continuity** (`trust-continuity-final.json`): the final hook-state section is the original plus
one blank separator line before `[tui]`; without it, it hashes to the starting `55f80e…`. All five
key/value lines and their hashes are unchanged.

**Journal provenance.** In cycle 1, `record.before` and `record.after` hold no preference keys while the
live config does (`c1-journal-after-pref.json`, `equalsRecordAfter: false`); reinstall and uninstall still
pass, so the preferences were accepted as current metadata, not taken from the record. In later installs
the preferences predate registration, so the record contains them (`c1-journal-install-same.json`).

**Windows test mechanics.** The ancestor-link case creates real NTFS **junctions** in place of the snapshot
`adapters` directory and `.claude/plugins`; install and uninstall both refuse, leaving the junction, the
external bytes and the journal unchanged. The busy-removal case **injects** `EBUSY` through a `--require`
preload replacing `fs.rmdirSync`; it holds no real OS lock. The user-entries case skips its
directory-symlink substep on `win32`, and the dangling ownership-record link case runs nothing there.

## Repairs under test

These implement [#116's recorded-ownership contract](https://github.com/Hissal/skill-collection/issues/116)
and [#120's preservation of unrelated hooks](https://github.com/Hissal/skill-collection/issues/120).
Installation never grants trust. Run C is their native acceptance; Linux regressions use CLI doubles.

1. **Trust tables.** [`codex-trust-delta.js`](../../scripts/install/codex-trust-delta.js) splits the config
   into ordinary bytes and hook-state tables. Ordinary bytes must equal the journal exactly; uninstall
   keeps the pre-install ordinary sections verbatim, including EOF whitespace and empty files. Current
   hook-state tables replace the first prior hook-state section, or are appended, so placement can change.
   The scanner tracks basic, literal and multiline strings, escapes, closing quote runs and comments;
   header-looking text inside strings is ignored. Changed multiline values, unterminated strings, other
   lines inside trust tables (comments, other fields, inline tables, duplicate keys or parents) and
   symlink replacements conflict. It is not a general TOML parser: lines in a multiline array starting
   with `[` read as headers, which in valid Codex config become ordinary bytes, so the ordinary comparison
   still decides.
   - **Native shape**: run A's `home\.codex\config.toml` after the human review (932 bytes, no BOM,
     LF only), transcribed by a read-only delegate in [this observation](windows-trust-writer-observation.json),
     not a raw capture. No `[hooks]` header; the pre-install backup had no hook tables:

     ```toml
     [hooks.state]

     [hooks.state."command-guard@skill-collection-guard:hooks/codex.json:pre_tool_use:0:0"]
     trusted_hash = "sha256:<64hex>"
     trusted_content_hash = "sha256:<64hex>"
     enabled = true

     [hooks.state.'C:\Users\<user>\AppData\Local\Temp\<fixture>\home\.codex\hooks.json:pre_tool_use:0:0']
     trusted_hash = "sha256:<64hex>"
     enabled = true
     ```

   - **Source**: at Codex [`6ff1e1ca`](https://github.com/openai/codex/blob/6ff1e1ca3b30fc8b914720681fcf5fe62e95f856/codex-rs/core/config.schema.json)
     (`rust-v0.166.0`), `HookStateToml` allows `enabled`, `trusted_hash` and `trusted_content_hash`;
     [`config_manager_service.rs`](https://github.com/openai/codex/blob/6ff1e1ca3b30fc8b914720681fcf5fe62e95f856/codex-rs/app-server/src/config_manager_service.rs)
     writes explicit TOML tables. In toml_writer [`fcb84da5` `string.rs`](https://github.com/toml-rs/toml/blob/fcb84da544c2e191362452d0ae7b4ecb1d6fa5f7/crates/toml_writer/src/string.rs),
     `TomlKeyBuilder::as_default` picks a literal key when a basic key would need escapes.
2. **Known Codex preference tables.** Reinstall and uninstall accept `[tui]` and `[windows]` beside the
   trust tables when every line is a known field with a valid value, keeping their current bytes; the
   installer never sets, resets or applies them and records no claim about who wrote them. Any other
   field, value form, comment or duplicate leaves the whole file a conflict. **Source** at `6ff1e1ca`:
   `Tui.screen_reader_detection_done` is a boolean that
   [`screen_reader.rs`](https://github.com/openai/codex/blob/6ff1e1ca3b30fc8b914720681fcf5fe62e95f856/codex-rs/tui/src/screen_reader.rs)
   sets after its one-time detection (and `animations = false` when it detects a screen reader);
   `WindowsToml.sandbox` is `elevated`, `unelevated` or `mxc`, set by `set_windows_sandbox_mode` in
   [`edit.rs`](https://github.com/openai/codex/blob/6ff1e1ca3b30fc8b914720681fcf5fe62e95f856/codex-rs/core/src/config/edit.rs).
3. **Snapshot directory provenance.** The journal records the snapshot directories the installer creates.
   Uninstall removes them deepest first with `rmdir` after `lstat` without following links; a non-empty
   or replaced directory is a conflict and kept. A recorded tree of empty directories is reused on the
   next install; a journal without directory records derives them from its recorded snapshot files.
   Completed removals are journaled even if a later operation throws, so a busy directory can be retried.
4. **Redirected parents.** Parents below the selected home are checked without following links before
   registration or cleanup; a symlinked or junctioned snapshot `adapters` parent or `.claude/plugins`
   conflicts before external files or the journal change.
5. **Pending trust is reported as unprotected.** Doctor reports the enabled/trust state of retained
   legacy handlers from `hooks/list`; pending plugin trust with no trusted legacy handler prints
   `UNPROTECTED`. Preserved trust records are reused on reinstall only if Codex accepts their hashes
   for the current hook content; preserving a record grants no new approval. A trusted legacy fallback
   message describes `hooks/list` status, not a live invocation test.
6. **Portable probe.** The allow probe is `node -e "console.log('ALLOW_120')"`; `probe-commands` prints the
   probes, project rule and Claude grants, and the plugin suite asserts the grants are exact.
7. **Runner summary.** Uninstall summaries report `trustBytesIdentical`, `trustLinesPreserved` (ignores
   blank lines), `preferenceTables` and `snapshotEntriesRemaining`. Run B's summary predates this and
   has `trustTablesPreserved` instead. Acceptance requires exit 0, no owned files or snapshot entries,
   preserved personal settings, and preserved trust and preference values; neither
   `nonTrustConfigMatchesMinimalFixture` nor trust byte identity alone decides a pass.

Regressions: `scripts/install/test/trust.js` (native shape, writer-placed tables, string boundaries,
personal-edit and unknown-syntax conflicts, symlinks, preference field and form edges; it failed on
`e194534` at the native-shape uninstall), `scripts/install/test/lifecycle.js` (run B's 77-byte chunk with both
trust key forms over three cycles; unknown `allow_mxc` conflicts; same-snapshot reinstall; user-added
entries; symlink and ancestor replacements; legacy journal; unrecorded empty tree; busy-removal retry) and
`scripts/install/test/plugin.js` (CLI reinstall and uninstall, `--real` too).

## User configuration

Every run fingerprints five real files: Claude `settings.json`, `installed_plugins.json`,
`known_marketplaces.json`, and Codex `config.toml`/`hooks.json`. These hashes do not cover credentials,
skill links or `~/.claude.json`, and they do not show that the whole user configuration was unchanged.

- **Run A**: its guard uninstall summary reported only `known_marketplaces.json` changed against the
  run's `state.json` baseline ([original](https://github.com/Hissal/skill-collection/blob/a640892606c001b1ab1ddbe8e1232948dc67f66c/docs/evidence/windows-install-2026-10-31/guard/uninstall-summary.json));
  the migration summary reports no changes. Which process changed the file was not established.
- **Run B**: `user-fingerprints-before.json` and `-after.json` are identical. Its summaries' `changed`
  entry compares against run A's baseline; the file had already changed before run B.
- **Run C**: four of five files are byte-unchanged (`user-fingerprints-before.json`, `-after.json`).
  `known_marketplaces.json` changed at 13:59:58 local time, while the native check suites ran and before
  any fixture step; only the `lastUpdated` stamps of two real marketplaces changed (the official one and
  one with `autoUpdate`). The file holds no fixture or `skill-collection-guard` reference, and the suites
  use CLI doubles with disposable homes. This is consistent with Claude Code's own marketplace auto-update
  from another session; the cause is **unproven**.

## History

Before-fix records kept to show what each repair answers:

1. **Run A: trust made uninstall conflict.** After the human review, `uninstall` exited 1 with
   `CONFLICT changed registration preserved: …\.codex\config.toml` and removed nothing (`guard/uninstall.log`).
   The repair then accepted Codex trust tables.
2. **Run B: Codex-written preferences still conflicted.** On the unmodified trusted config
   (`trust-state-before.json`: 932 bytes; bare `[hooks.state]`, the plugin table with a basic key, the
   user hook table with a literal backslash key; ordinary tables `marketplaces`, `plugins`, `[tui]`,
   `[windows]`), reinstall (`reinstall.log`, `reinstall.stderr`) and uninstall (`uninstall.stderr`,
   `uninstall-summary.json`) exited 1; all 44 owned paths and the config, trust tables and journal stayed
   unchanged. The cause was `[tui] screen_reader_detection_done = true` and `[windows] sandbox = "unelevated"`,
   absent from the journal. The config was last written at the same time as Codex's `.hook-trust`
   directory (23:36), consistent with the human `/hooks` session; the write itself was not observed. Repair 2.
3. **Run B diagnostic (fixture-adjusted, not acceptance).** Removing only that 77-byte chunk restored the
   journal's ordinary bytes with identical hook-state bytes. Uninstall then exited 0 with both trust tables
   preserved, but reinstall failed `CONFLICT unrecorded plugin snapshot` (`reinstall-variant.stderr`):
   uninstall had unlinked recorded files only, leaving empty directories that `prepare` treated as
   unrecorded ([`plugin.js` at `97b9ca4`](https://github.com/Hissal/skill-collection/blob/97b9ca40fd7ec61193f1403a05fd1ba418e0a75f/scripts/install/plugin.js#L19-L34)).
   After the empty tree was removed by hand, reinstall exited 0 and the preserved trust was recognized
   with no new approval. Repair 3. The diagnostic's other doctor, `hooks/list`, trust-state and uninstall
   records were pruned; originals are at [`a640892`](https://github.com/Hissal/skill-collection/tree/a640892606c001b1ab1ddbe8e1232948dc67f66c/docs/evidence/windows-guard-followup-2026-10-31).
4. **Run A probes.** Run A ran the same live probes with `printf ALLOW_120` as the allow probe and found
   the same denials, silent allow and same-session enforcement on both hosts. Codex's Windows shell is
   PowerShell, which has no `printf`, so that allow exited 1 after passing both hooks: a non-portable probe,
   not a guard decision. Repair 6; run B supersedes those transcripts, whose originals, with the failed
   read-only-sandbox Codex attempts, are at [`a640892`](https://github.com/Hissal/skill-collection/tree/a640892606c001b1ab1ddbe8e1232948dc67f66c/docs/evidence/windows-install-2026-10-31/guard).

The previous separate reports are at the same commit: [repair note](https://github.com/Hissal/skill-collection/blob/a640892606c001b1ab1ddbe8e1232948dc67f66c/docs/evidence/windows-guard-followup.md),
[run B](https://github.com/Hissal/skill-collection/blob/a640892606c001b1ab1ddbe8e1232948dc67f66c/docs/evidence/windows-guard-followup-2026-10-31.md),
[run C](https://github.com/Hissal/skill-collection/blob/a640892606c001b1ab1ddbe8e1232948dc67f66c/docs/evidence/windows-lifecycle-final-2026-10-31.md)
and [run A's guard section](https://github.com/Hissal/skill-collection/blob/a640892606c001b1ab1ddbe8e1232948dc67f66c/docs/evidence/windows-install-2026-10-31.md#guard-lifecycle-and-live-plugin-probes-120-121).

## Limits

| Item | Status |
| --- | --- |
| Live probes after the repairs | Not rerun in run C; run B's guard snapshot content is unchanged |
| Preferences from an untouched human session under the repaired installer | Not run: run C used the real Codex writer as a labelled variant |
| `animations` preference | Not written natively; Linux regressions only |
| Real OS lock during directory removal | Not tested; `EBUSY` is injected |
| Dangling ownership-record link; user-entries directory-symlink substep | Skipped on `win32` by the tests |
| Empty directories outside the snapshot cache | Zero-file directories remain under the Claude host cache `.claude/plugins/cache/skill-collection-guard/…/0.1.0` and the legacy copy `.agents/command-guard/`; they predate run C and never blocked a step. Directory provenance covers only `plugin-cache` |
| Claude run without the exact grant (negative control) | Not run |
| Actual OS symlink refusal, OpenCode guard on Windows, macOS | Not run |
