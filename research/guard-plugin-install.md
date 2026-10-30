# Guard plugin delivery (#121)

Read and executed 2026-10-30 on Linux. Partial implementation under spec #78;
#121 remains open. Skill plugins remain gated on the live #123 result (#124).

## Packaging and support

The marketplace's sole entry is the hooks-only guard. Its Claude and Codex
compatibility manifests select separate hook files and adapters in the same
package. Rules and the engine remain shared. Project rules are discovered from
the hook payload's working directory, independently of the plugin location.
A disposable-home probe invoked both cached adapters with a project-added
`project.no-verify` rule; both denied `git commit --no-verify -m x` and named
that rule. This verifies adapter behavior from the snapshot, not host loading.

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

The installed `/home/agent/.local/bin/claude` (Claude Code 2.1.312 at the
time of the probe) validated the manifest, registered this local marketplace,
and installed `command-guard@skill-collection` at user scope in a disposable
home (`HOME` and `CLAUDE_CONFIG_DIR` overridden). Listing reported enabled,
version 0.1.0, a versioned cache install path, **and** `readFromFolder` pointing
to the checkout. This does not prove branch-switch isolation. Validation passed
with warnings; public-directory submission additionally reported missing licence
and icon metadata. No public-directory submission was attempted.

The noninteractive PATH omitted Codex. Rechecking the explicit installed binary
`/home/agent/.npm-global/bin/codex` found codex-cli 0.166.0. In a disposable
home (`HOME` and `CODEX_HOME` overridden), `plugin marketplace add`, `plugin add
command-guard@skill-collection --json`, and `plugin list --json` all exited zero.
The result reported version 0.1.0, a versioned cache path, and enabled true.
Listing still identified the checkout as the local source; this is not live
branch-switch or hook-trust evidence. The CLI warned that PATH helper aliases
cannot be created under `/tmp`; registration itself succeeded.
The installed API uses `plugin add`, not `plugin install` (the latter exited 2).
No real-home files were edited. OpenCode is installed at `/home/agent/.opencode/bin/opencode` (v2.2.2 in
the #125 recheck). Its discovery activation and HTTP 402 quota failures leave
#125 inconclusive; see [the corrected evidence](opencode-install-125.md).
OpenCode evaluation was not repeated here.
Claude `auth status --json` in another disposable home reported
`loggedIn: false` and `authMethod: none` (exit 1). No login or credential copy
was attempted. No model sessions were launched in that disposable-home investigation.
The later [authenticated live adapter smoke tests](live-hooks-120.md) pass on
both hosts; they do not establish plugin loading. Registration/listing is not hook
invocation. Both installed hosts provide registration APIs; effective plugin-loaded behavior remains
unverified. The later live evidence verifies adapter delivery only. Snapshot
registration and selective migration are implemented below; live plugin loading
remains unverified.

## Implemented registration and migration

`prepare-plugin` and normal installs now call the installed host plugin APIs
against a dedicated marketplace inside the content-addressed snapshot. The
listing must report enabled and an effective source equal to that snapshot.
Snapshot adapters pass block and allow probes before registration. Each host's
successful registration permits selective removal of its recorded legacy handlers;
a failed host registration rolls back configuration changes and retains its hooks.
The write journal preserves before/after bytes and refuses uninstall of changed
files. No credentials are copied and no trust is granted.

Disposable-home real CLI cases cover registration failure with rollback, selective
migration, rerun, source update, normal install and uninstall. Changed owned
configuration makes uninstall refuse all removal and preserve the change. Source overrides select the guard package as
well as skill links. These cases establish registration, not live loading.

## Remaining acceptance

1. Run real Claude and Codex sessions. Complete when each records a block,
   silent allow, project-added block, and unchanged effective guard after a
   checkout branch switch. Record trust waiting as pending; verify trust through
   the host rather than writing approval state. These live tests were not run.
2. Record macOS and Windows results separately. Linux cases establish neither.

The prepared cache is not claimed as host branch-switch evidence. Keep #121
open until every acceptance criterion on the issue has evidence.

## Automated verification

After merging integration commit `711a8ae`, Linux verification passed the 611-case
guard harness, 30 temporary-home installer cases, and seven gate cases. The
collection check passed with one agnix warning: Claude ignores the marketplace
entry's `policy` field, which Codex's documented marketplace schema requires.
This field supplies Codex install/auth policy rather than Claude behavior.

After merging `5031ae6`, all 31 installer cases and the collection check passed
(including all 611 guard cases), with the same marketplace-policy warning.
The check fixture suite previously passed all 216 cases; its code was unchanged
by subsequent integration merges. A redundant repeat was stopped after confirming
that unchanged scope. The later integration merge brought documentation and
evidence corrections; `git diff --check` passed and the working tree was clean.

### Integration warning recheck

The installed `/home/agent/.local/bin/claude` validator was rerun against the
merged marketplace. It passed with two warnings: `plugins[0].policy` is ignored
by Claude, and the plugin manifest lacks author information. The README install
suggestion is advice, not a validation warning; registration is now implemented; live loading remains pending validation. The collection's pinned agnix reports only the policy warning.
The [OpenAI marketplace contract](https://developers.openai.com/plugins/build/plugins)
requires `policy.installation` and `policy.authentication` on each entry, so
retain those fields for Codex. The Claude warning describes a real difference
between hosts, not failed registration or evidence of effective hook loading.

### Registration implementation verification (2026-10-30)

`node scripts/install/test/plugin.js --real` passed against the installed Claude
and Codex CLIs with fresh temporary HOME, CLAUDE_CONFIG_DIR and CODEX_HOME.
No credentials or trust state were copied. Enabled listings reported the prepared
snapshot as effective source. The deterministic CLI boundary double runs the same
migration and ownership cases inside the collection check; it supplies host
responses while the installer uses real temporary files. The 36 pre-existing
installer cases and 218 check fixtures also passed. Live plugin session loading,
branch-switch behavior and non-Linux hosts still require their separate evidence.
