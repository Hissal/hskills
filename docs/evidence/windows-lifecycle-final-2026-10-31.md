# Native Windows trusted lifecycle acceptance (2026-10-31)

Native Windows acceptance of the repairs listed in the
[guard follow-up rerun](windows-guard-followup-2026-10-31.md#repairs-after-this-rerun-native-rerun-pending)
for [#120](https://github.com/Hissal/skill-collection/issues/120) and
[#121](https://github.com/Hissal/skill-collection/issues/121). It reuses the human-trusted fixture from the
[original Windows run](windows-install-2026-10-31.md#guard-lifecycle-and-live-plugin-probes-120-121).
Retained files are in [windows-lifecycle-final-2026-10-31](windows-lifecycle-final-2026-10-31/); every path
below is relative to it.

**Outcome.** The trusted lifecycle **passes** natively with Codex-written preference tables present:
install, doctor, `hooks/list` trusted, reinstall, doctor, uninstall, same-snapshot install, doctor,
`hooks/list` trusted and uninstall all exit 0, twice in a row, with no directory cleanup between
measured steps. Trust is recognized without new approval. Each uninstall leaves no owned files and no
snapshot entries, and it keeps the preference tables, both trust tables and the fixture's personal settings.
No model calls were made: the live block/allow probes and branch switches are already proven on both
hosts ([rerun](windows-guard-followup-2026-10-31.md#live-probes)), and the guard snapshot content is unchanged.

## Environment

| Item | Value |
| --- | --- |
| Commit | Installer, tests and runner: `ea843fc`. Fixture source: disposable clone detached at its recorded base `3a50d50`; guard snapshot `0.1.0-b6f7f1ce…`, unchanged |
| OS | Windows 11 Home, build 10.0.26200, x86_64 |
| Shell / runtime | PowerShell 7.6.9; Node v22.23.2; git 2.56.0.windows.3 |
| Host CLIs | Claude Code 2.1.314; Codex CLI 0.166.0 (registration, `hooks/list` and `config/batchWrite` only) |

## Native checks

Logs are in `checks/`. All exit 0.

| Command | Result |
| --- | --- |
| `npm ci` | 0 |
| `node scripts/check/test/run.js` | 218 passed, 0 failed |
| `node scripts/check/check.js` | 0 failures, 4 agnix warnings (pre-existing fixture and marketplace fields) |
| `node scripts/install/test/run.js` | 40 install cases, 0 failures; plugin and trust suites pass; 9 lifecycle cases pass |

How the new lifecycle cases ran on Windows:

- **Ancestor links**: creates real NTFS **junctions** in place of the snapshot `adapters` directory and
  `.claude/plugins`, each pointing at a moved-out directory with matching files. Install and uninstall
  both refuse, leaving the junction, the external bytes and the journal unchanged.
- **Busy removal**: an `EBUSY` **injected** by a `--require` preload that replaces `fs.rmdirSync`. This is not
  a real OS lock.
- The user-entries case skips its directory-symlink substep on `win32`. The dangling ownership-record link
  case returns early on `win32`, so it runs nothing there.

## Method

- **Fixture.** Root `%TEMP%\plugin-live-win-AN63RN`: the original home, host caches, definitions, trust keys
  and hashes. Records went to a new `followup-ea843fc\` through `live-plugins-windows.js <step> <root> --out
  <dir> --label <name>` (`install`, `doctor`, `hooks-list`, `trust-state`, `uninstall`), then were sanitized
  here with its `sanitize` step. Earlier records and logs were left untouched.
- **Trust.** Nothing wrote `hooks.state` or approved a hook. No `/hooks` review was needed.
- **Auth.** No step needed host credentials, so no auth reference was created. The fixture home holds no
  credential file or link afterwards.
- **Source.** `install` detaches the clone at `state.json`'s base before each run.

### One-time fixture preparation (not acceptance)

The previous diagnostic left an unrecorded empty snapshot tree; by design, production still refuses such
trees. Before the measured steps, `fixture-preparation.json` records:

- **Checks**: the tree held 7 real directories, 0 files and 0 reparse points (PowerShell `Attributes`/`LinkType`
  and `lstat`), and the journal had no writes, no hosts and no `directories` field.
- **Removal**: non-recursive `rmdir` of exactly those directories, deepest first; the `plugin-cache` parent
  stayed.

This happened once. No cleanup ran between or during the measured steps.

### Native writer-input variant (Codex preferences after registration)

Earlier diagnostic work had removed the fixture's 77-byte `[tui]`/`[windows]` chunk. To reproduce Codex
writing it after registration, the real Codex 0.166.0 app-server (`codex app-server --stdio`,
`CODEX_HOME` set to the disposable home) received one `config/batchWrite` right after the first install
(`c1-pref-write.json`). It held only:

```json
[{ "keyPath": "tui.screen_reader_detection_done", "value": true, "mergeStrategy": "replace" },
 { "keyPath": "windows.sandbox", "value": "unelevated", "mergeStrategy": "replace" }]
```

`animations` was not written: Codex sets it only when it detects a screen reader, which no session observed.
This is an **authorized writer-input variant**, not the untouched original human config. Codex returned
`status: ok` and added exactly 77 bytes (854 → 931), placing `[tui]` and `[windows]` after the trust tables.
The hook-state lines were unchanged.

## Measured lifecycle

Starting state (`trust-state-pre-preparation.json`): uninstalled, `.codex/config.toml` 549 bytes holding the
fixture line and both trust tables (`trustSha256` `55f80e…`, as in the earlier rerun).

| Step | Exit | Observation | Record |
| --- | --- | --- | --- |
| Install | 0 | `REGISTERED` Claude and Codex; journal records 46 writes and 7 snapshot directories | `c1-install`, `c1-journal-installed.json` |
| Codex `config/batchWrite` | n/a | Preferences added; journal `record.after` has no `[tui]`/`[windows]` | `c1-pref-write.json`, `c1-journal-after-pref.json` |
| Doctor | 0 | `REGISTERED` both | `c1-doctor` |
| `hooks/list` | 0 | Plugin hook and unrelated user hook `trusted`, enabled | `c1-hooks-list` |
| Reinstall | 0 | `REGISTERED` both; config byte-identical (`1c68d9…`) | `c1-reinstall`, `c1-trust-state-reinstalled.json` |
| Doctor | 0 | `REGISTERED` both | `c1-doctor-reinstalled` |
| Uninstall | 0 | [Summary below](#uninstall-summaries) | `c1-uninstall-summary.json` |
| Same-snapshot install | 0 | `REGISTERED` both, no conflict on the snapshot directory | `c1-install-same` |
| Doctor, `hooks/list` | 0, 0 | `REGISTERED` both; both hooks `trusted` | `c1-doctor-same`, `c1-hooks-list-same` |
| Uninstall | 0 | Same final config as the first uninstall | `c1-uninstall-same-summary.json` |
| Repeat (`c2-*`) | all 0 | Same ten steps, with preferences present before registration; identical outcomes and final bytes | `c2-*` |

No output from any measured step contains `FAIL`, `CONFLICT`, `PENDING` or `UNPROTECTED`.

### Uninstall summaries

All four summaries (`c1-uninstall`, `c1-uninstall-same`, `c2-uninstall`, `c2-uninstall-same`) agree:

| Field | Value |
| --- | --- |
| `status` | 0 |
| `remainingOwned`, `snapshotEntriesRemaining` | `[]`, `[]` |
| `.claude/settings.json`, `.codex/hooks.json` | `identical: true` to the fixture, unrelated hook kept |
| `preferenceTables.before` = `.after` | `[tui] screen_reader_detection_done = true`, `[windows] sandbox = "unelevated"` |
| `trustBytesIdentical`, `trustLinesPreserved` | `true`, `true` (separate claims; both hold) |
| Config after | 626 bytes, `4179e4…`: the 549-byte start plus the 77 preference bytes |
| `nonTrustConfigMatchesMinimalFixture` | `false`. **Informational only**: the comparison counts the preserved preference tables |

The config's `guardRemaining: true` refers to the plugin's own hook-state key, which is kept trust.
Each summary's `userConfigUnchanged: false` compares against the original run's `state.json` baseline. See
[user configuration](#user-configuration).

**Trust continuity** (`trust-continuity-final.json`). The final hook-state section is the original one plus
one blank separator line before `[tui]`; without that line it hashes to the starting `55f80e…`. All five
key/value lines and their hashes are unchanged.

**Journal provenance.** In the first cycle, `record.before` and `record.after` hold no preference keys, while
the live config does (`c1-journal-after-pref.json`, `equalsRecordAfter: false`). Reinstall and uninstall
still pass, so the preferences were accepted as current metadata, not taken from the record. In later
installs the preferences predate registration, so the record contains them (`c1-journal-install-same.json`).

## User configuration

Before and after (`user-fingerprints-before.json`, `-after.json`), four of the five real configuration files
are byte-unchanged: `.claude/settings.json`, `installed_plugins.json`, `.codex/config.toml` and `.codex/hooks.json`.
The fifth, `~/.claude/plugins/known_marketplaces.json`, changed at 13:59:58 local time, while the native
check suites ran and before any fixture step. Only the `lastUpdated` stamps of two real marketplaces changed
(the official one and one with `autoUpdate`). The file holds no fixture or `skill-collection-guard`
reference, and the suites use CLI doubles with disposable homes. This matches Claude Code's own marketplace
auto-update from another session on the machine; this run did not prove the cause. The file had also changed
before the earlier rerun.

## Limits

| Item | Status |
| --- | --- |
| Live block/allow probes, branch switch | Not rerun; proven in the [rerun](windows-guard-followup-2026-10-31.md#live-probes), guard content unchanged |
| Preferences from an untouched human session | Not observed; this run used the real Codex writer (`config/batchWrite`), labelled as a variant |
| `animations` preference | Not written natively; covered only by Linux regressions |
| Real OS lock during directory removal | Not tested; the busy case injects `EBUSY` |
| Dangling ownership-record link | Skipped on `win32` by the test |
| Empty directories outside the snapshot cache | Zero-file directories remain under `.claude/plugins/cache/skill-collection-guard/…/0.1.0` (Claude host cache) and `.agents/command-guard/` (legacy copy). Both predate this run, are touched on each cycle and never blocked a step. Directory provenance covers only `plugin-cache` |
| Claude negative control without the exact grant | Not run |
| OpenCode on Windows, actual OS symlink refusal, macOS | Outside this follow-up |
