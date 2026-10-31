# Windows guard follow-up (#120/#121)

The [native Windows report](windows-install-2026-10-31.md) records three findings.
The follow-up accepts only Codex hook-state table deltas when all other
configuration still matches the installation journal. It preserves the human's
tables in both restoration and installed records. Personal edits, unknown
fields and symlink replacements remain conflicts. Reinstall uses the same
validation before invoking a host CLI.

The accepted fields come from Codex 0.166.0's
[HookStateToml schema](https://github.com/openai/codex/blob/rust-v0.166.0/codex-rs/core/config.schema.json):
enabled, trusted_hash and trusted_content_hash. Tests use the writer's quoted
per-hook TOML tables, including separate declaration and content SHA-256 hashes.
Other TOML representations fail closed rather than broadening ownership.

Doctor reports actual legacy handler enabled/trust states from hooks/list.
Pending plugin trust with no verified trusted legacy handler is explicitly
UNPROTECTED. Retaining an untrusted handler supplies no effective fallback.
Human review in /hooks remains required; installation never grants approval.

The Windows runner exposes its probe commands and additive rule through
`node scripts/install/evidence/live-plugins-windows.js probe-commands`.
The plugin CLI suite executes the Node allow command to exit 0 and sends all
three commands through the actual guard adapter, asserting core and project
denials. Dangerous commands are classified only, never executed.

Verification uses disposable homes. The focused public registration regression
(`node scripts/install/test/trust.js`) fails on the prerequisite with
`false !== true` at uninstall after trust, then passes with the fix.
The plugin CLI suite covers trust followed by reinstall/uninstall and preservation
of unrelated configuration, while retaining personal-edit conflict coverage.

These are automated Linux fixture results, not new authenticated native Windows
evidence. No real user configuration, credentials or trust were changed.
Parent-coordinated Windows /hooks approval and live command execution remain
necessary to confirm the native result. macOS and the historical report's actual
OS symlink-refusal cases remain outside this verification.

Validation on Node 22.23.4: npm ci; collection fixture suite (218 passed);
collection check (zero failures, four existing agnix warnings); installer suite
(38 cases); plugin CLI boundary suite; real Claude/Codex CLI lifecycle suite;
and the public trust regression. The collection check also runs the guard suite
(611 passed). Both pending/untrusted and pending/trusted legacy fallback states
have CLI-boundary assertions.
