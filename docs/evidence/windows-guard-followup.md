# Windows guard follow-up (#120/#121)

The [native Windows report](windows-install-2026-10-31.md#findings-for-owners) records three
findings. Its outcomes stand as observed. This note records the current repair state and
its evidence. Each claim is labelled by source: **native** (Windows run), **writer** (the
actual Codex 0.166.0 writer on Linux, disposable home), **source** (pinned upstream code) or
**fixture** (synthetic test input).

## Policy

Fixing the unblocked findings implements the user's instruction to fix every unblocked
issue under the journal's preservation contract. It is not a separate owner decision.
Registration adopts only Codex hook-state tables, and only when every other byte still
matches the installation journal. It keeps all human trust tables, including tables for
unrelated user hooks, through uninstall and reinstall. Installation never grants trust.

## 1. Trust no longer makes uninstall conflict

[`codex-trust-delta.js`](../../scripts/install/codex-trust-delta.js) splits the config into
ordinary bytes and hook-state tables. Ordinary bytes must equal the journal exactly.
Uninstall restores the pre-install ordinary bytes followed by the current hook-state tables.

Accepted forms:

- **Native**: the retained run's `home\.codex\config.toml` (932 bytes, no BOM, LF only)
  after human `/hooks` approval, read later from the preserved fixture. Sanitized excerpt:

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
  Codex 0.166.0 is the version in the original report; the reading itself did not run
  `codex --version`.
- **Writer**: `config/batchWrite` on `hooks.state`, the request the TUI sends for `/hooks`,
  produced the same layout on Linux. That means a bare `[hooks.state]` parent, basic quotes for the plugin key,
  literal quotes for a key containing backslashes, and existing human tables kept in place.
  Personal multiline strings stayed byte-exact.
- **Source**: at Codex [`6ff1e1ca`](https://github.com/openai/codex/blob/6ff1e1ca3b30fc8b914720681fcf5fe62e95f856/codex-rs/core/config.schema.json)
  (`rust-v0.166.0`), `HookStateToml` allows `enabled`, `trusted_hash` and
  `trusted_content_hash`. `config_manager_service.rs` rewrites the whole `hooks.state`
  table as explicit tables. In toml_writer
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
Human review in `/hooks` remains required.

## 3. Probe portability

The allow probe is `node -e "console.log('ALLOW_120')"`. **Native**: it printed the
marker and exited 0 in PowerShell. That shows portability only, not host guard acceptance.
`node scripts/install/evidence/live-plugins-windows.js probe-commands` prints the probes, the
project rule and the Claude grants. The Claude run grants only these exact commands, never
a wildcard. The plugin suite asserts that. **Unverified**: whether Claude's `Bash(...)`
rule parser accepts the inner parentheses as an exact match. The native rerun shows it.

## Verification

- `node scripts/install/test/trust.js`: public `registration()` with a disposable home and
  journal. Covers the native shape, writer-placed human tables, multiline strings with fake
  headers and quote/escape boundaries, personal-edit and unknown-syntax conflicts, and
  symlinks. It failed on e194534 at the native-shape uninstall (`false !== true`).
- `node scripts/install/test/plugin.js` (also `--real`): CLI reinstall and uninstall with
  the native shape and a personal multiline value. A refused uninstall reports
  `FAIL uninstall: CONFLICT …` and exits 1.
- `node scripts/install/test/run.js` runs the plugin suite and the trust suite separately.

These results come from Linux, Node 22.23.4. **Pending, parent-coordinated:** an authenticated native
Windows rerun of trust, reinstall, uninstall and the live Claude/Codex probes. That rerun
must retain the sanitized post-`/hooks` TOML, without credentials or setting secrets.
macOS and the report's actual OS symlink-refusal cases are not covered.
