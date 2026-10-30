# Guard plugin delivery (#121)

Read and executed 2026-10-30 on Linux. Partial implementation under spec #78;
#121 remains open. Skill plugins remain gated on the live #123 result (#124).

## Packaging and support

The marketplace's sole entry is the hooks-only guard. Its Claude and Codex
compatibility manifests select separate hook files and adapters in the same
package. Rules and the engine remain shared. Project rules are discovered from
the hook payload's working directory, independently of the plugin location.

[Claude manifest reference](https://code.claude.com/docs/en/plugins-reference)
defines `.claude-plugin/plugin.json` and plugin-root paths.
[OpenAI packaging documentation](https://developers.openai.com/plugins/build/plugins)
defines `.codex-plugin/plugin.json` compatibility support and separate hook
selection. This is evidence for explicit Codex packaging, not an assumption that
Claude's manifest alone supplies every Codex capability.
[Codex hook trust](https://learn.chatgpt.com/docs/hooks) requires review of the
current definition; installation and direct adapter probes do not prove trust.
The doctor therefore reports Codex as pending human trust with a failing exit.

## Executed evidence and limits

Claude Code 2.1.312 validated the manifest, registered this local marketplace,
and installed `command-guard@skill-collection` at user scope in a disposable
home (`HOME` and `CLAUDE_CONFIG_DIR` overridden). Listing reported enabled,
version 0.1.0, a versioned cache install path, **and** `readFromFolder` pointing
to the checkout. This does not prove branch-switch isolation. Validation passed
with warnings; public-directory submission additionally reported missing licence
and icon metadata. No public-directory submission was attempted.

Codex is absent from PATH; no installed Codex registration/trust API was
available for execution. Local Codex configuration was inspected for topic
pointers before fetching official documentation. No real-home files were edited.
Claude `auth status --json` in another disposable home reported
`loggedIn: false` and `authMethod: none` (exit 1). No login or credential copy
was attempted. No model sessions were launched. Registration/listing is not hook
invocation. Claude registration APIs exist; effective loaded-hook behavior remains
unverified. The unsupported automatic switch is an implementation limit, not a
claim that Claude has no plugin API.

`prepare-plugin` creates a content-addressed version snapshot under the selected
home and verifies existing snapshot bytes on rerun. It exits unsuccessfully with
an explicit unsupported registration message. It preserves existing settings
and ownership records: replacement registration and effective host behavior
remain unverified. Normal installation retains #120's adapter delivery.

## Remaining acceptance

1. Implement host registration against the prepared snapshot. Complete when a
   host reports an enabled plugin whose effective source is the snapshot and
   adapter probes succeed. Until then preserve the working legacy registration.
2. Migrate only recorded adapter-marker groups in the corresponding settings
   file, retaining every unrelated handler. Complete when temporary-home cases
   show failed registration leaves the old guard and successful registration
   removes only owned handlers. This migration is not implemented here.
3. Run real Claude and Codex sessions. Complete when each records a block,
   silent allow, project-added block, and unchanged effective guard after a
   checkout branch switch. Record trust waiting as pending; verify trust through
   the host rather than writing approval state. These live tests were not run.
4. Record macOS and Windows results separately. Linux cases establish neither.

The prepared cache is not claimed as host branch-switch evidence. Keep #121
open until every acceptance criterion on the issue has evidence.
