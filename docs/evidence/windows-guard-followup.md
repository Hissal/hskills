# Windows guard follow-up (#120/#121)

The [native Windows report](windows-install-2026-10-31.md#findings-for-owners) records three
findings. Its outcomes stand as observed. This note records the current repair state and
its evidence. Each claim is labelled by source: **native** (Windows observation),
**source** (pinned upstream code) or
**fixture** (synthetic test input).

## Preservation contract

This repair implements [#116's recorded-ownership contract](https://github.com/Hissal/skill-collection/issues/116)
and [#120's preservation of unrelated hooks](https://github.com/Hissal/skill-collection/issues/120).
Registration adopts only Codex hook-state tables, and only when every other byte still
matches the installation journal. It preserves syntactically validated hook-state tables, including tables for
unrelated user hooks, through uninstall and reinstall. Installation never grants trust.

## 1. Trust no longer makes uninstall conflict

[`codex-trust-delta.js`](../../scripts/install/codex-trust-delta.js) splits the config into
ordinary bytes and hook-state tables. Ordinary bytes must equal the journal exactly.
Uninstall preserves the pre-install ordinary sections verbatim, including EOF whitespace
and empty files. Current hook-state tables replace the first prior hook-state section,
or are appended when none existed; their placement can therefore change. The parser
checks table syntax, not who made a change. Installation never grants trust.

Accepted forms:

- **Native**: the retained run's `home\.codex\config.toml` (932 bytes, no BOM, LF only)
  after human `/hooks` approval, read on 2026-10-31 from the preserved disposable fixture
  `C:\Users\<user>\AppData\Local\Temp\plugin-live-win-AN63RN\home\.codex\config.toml`.
  [Retained observation](windows-trust-writer-observation.json) records the read-only
  delegate's report; it is a transcribed observation, not a raw config or hash capture.
  Sanitized excerpt:

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

  No `[hooks]` header was present. The backup taken before install had no hook tables.
  The full file also holds Codex-written `[tui]` and `[windows]` tables, which the repair
  treats as personal edits: the [native rerun](windows-guard-followup-2026-10-31.md#findings-for-owners)
  found that the whole file conflicts. A later repair accepts those two tables when they
  hold only known preference fields ([repairs after the rerun](windows-guard-followup-2026-10-31.md#repairs-after-this-rerun-native-rerun-pending)).
  Codex 0.166.0 is the version in the original report; the reading itself did not run
  `codex --version`.
- **Source**: at Codex [`6ff1e1ca`](https://github.com/openai/codex/blob/6ff1e1ca3b30fc8b914720681fcf5fe62e95f856/codex-rs/core/config.schema.json)
  (`rust-v0.166.0`), `HookStateToml` allows `enabled`, `trusted_hash` and
  `trusted_content_hash`. Its
  [`config_manager_service.rs`](https://github.com/openai/codex/blob/6ff1e1ca3b30fc8b914720681fcf5fe62e95f856/codex-rs/app-server/src/config_manager_service.rs)
  converts table values to explicit TOML tables. In toml_writer
  [`fcb84da5` `string.rs`](https://github.com/toml-rs/toml/blob/fcb84da544c2e191362452d0ae7b4ecb1d6fa5f7/crates/toml_writer/src/string.rs),
  `TomlKeyBuilder::as_default` picks a literal key when a basic key would need escapes.

Strings: header-looking text inside multiline strings is ignored. The scanner tracks
basic, literal and multiline strings, escapes, the closing run of up to five quotes, and
comments. Unchanged multiline values survive. Changed ones conflict, as do unterminated
strings. Inside trust tables, any other line conflicts: comments, other fields, inline
tables, duplicate keys and duplicate parents. Symlink replacements also conflict.
This is not a general TOML parser.

Not covered: lines inside a multiline array that start with `[` are read as table
headers. In valid Codex configuration they become ordinary bytes, so the ordinary
comparison still decides.

## 2. Pending trust is reported as unprotected

Doctor reports the actual enabled/trust state of retained legacy handlers from
`hooks/list`. Pending plugin trust with no trusted legacy handler prints `UNPROTECTED`.
Human review in `/hooks` is required while the current hook is untrusted. Preserved
trust records can be reused on reinstall if Codex accepts their hashes for the current
hook content; doctor checks the host-reported state. Preserving a record grants no new
approval. A trusted legacy fallback message describes `hooks/list` status, not a live
invocation test.

## 3. Probe portability

The allow probe is `node -e "console.log('ALLOW_120')"`. **Native**, recorded in the
[read-only observation](windows-trust-writer-observation.json): it printed the
marker and exited 0 in PowerShell. That shows portability only, not host guard acceptance.
`node scripts/install/evidence/live-plugins-windows.js probe-commands` prints the probes, the
project rule and the Claude grants. The Claude run grants only these exact commands, never
a wildcard. The plugin suite asserts that. **Native**: in the
[rerun](windows-guard-followup-2026-10-31.md#live-probes), Claude accepted the exact grants
with their inner parentheses, and both hosts ran the allow probe with exit 0.

## Verification

- `node scripts/install/test/trust.js`: public `registration()` with a disposable home and
  journal. Covers the native shape, writer-placed human tables, multiline strings with fake
  headers and quote/escape boundaries, personal-edit and unknown-syntax conflicts, and
  symlinks. It failed on e194534 at the native-shape uninstall (`false !== true`).
- `node scripts/install/test/plugin.js` (also `--real`): CLI reinstall and uninstall with
  the native shape and a personal multiline value. A refused uninstall reports
  `FAIL uninstall: CONFLICT …` and exits 1.
- `node scripts/install/test/run.js` runs the plugin suite and the trust suite separately.

These results come from Linux, Node 22.23.4. The authenticated native Windows rerun
is in [the follow-up rerun report](windows-guard-followup-2026-10-31.md). Live probes and
preserved-trust recognition pass there. Trusted reinstall and uninstall still **fail** on
the unmodified config, and reinstalling after uninstall conflicts on the empty snapshot
directory. macOS and the report's actual OS symlink-refusal cases are not covered.
