# Codex human review with existing authentication (#121)

Read/executed 2026-10-30, Linux, Codex 0.166.0, integration base `3a50d50`.
Status: investigated; authenticated attachment to the exact isolated cache remains
unresolved. This corrects the [live acceptance handoff](live-plugins-121.md),
under [#78](https://github.com/Hissal/skill-collection/issues/78).

## Verified result

Run from this checkout:

```sh
python3 scripts/install/evidence/human-review-auth.py /tmp/plugin-live-121-1pzs54rm
python3 scripts/install/evidence/human-review-auth.py /tmp/plugin-live-121-1pzs54rm --cached-home
```

The helper issues `account/read` (without refresh) and `hooks/list` to the **same
app-server process** for each configuration. It records only account type, never
account identifiers or credentials. It hashes normal top-level TOML settings and
`hooks.json` before and after; both runs report unchanged. It never calls trust,
login, install or config-write APIs.

[Normal-home overlay evidence](evidence/live-plugins-121/normal-auth-overlay.json):
`accountType: chatgpt`, but only `source: user`, `pluginId: null`,
`/home/agent/.codex/hooks.json`, trusted. The enabled-plugin/marketplace `-c`
overrides therefore do not meet the review requirement.

[Isolated-home evidence](evidence/live-plugins-121/cached-home-auth.json):
`accountType: null`, with `source: plugin`,
`pluginId: command-guard@skill-collection-guard`, enabled and untrusted, at
`/tmp/plugin-live-121-1pzs54rm/home/.codex/plugins/cache/skill-collection-guard/command-guard/0.1.0/hooks/codex.json`.
Normal `codex login status` independently reports `Logged in using ChatGPT`.
Neither configuration establishes both required conditions.

## Supported configuration boundaries

The official [authentication documentation](https://learn.chatgpt.com/docs/auth)
stores file authentication under `CODEX_HOME`, or uses the configured OS credential
store. Changing the home is not a supported way to select only plugin storage.
No credentials were inspected, copied, linked, exported, or supplied to an API.

The [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
and installed CLI help expose invocation `-c` overrides and profile files layered
at `$CODEX_HOME/<name>.config.toml`. The reference exposes marketplace sources and
plugin enablement, but no installed-plugin-cache root selector. A profile can
layer those settings; it does not establish access to the other home's cache.
The CLI's remote TUI connects to an app-server: attaching it to the isolated
server does not supply that server with the normal home's authentication. A
remote attachment was not executed, and is not offered as a verified workaround.
These are evidence limits, not a claim that every possible future CLI lacks a solution.

## Proposed minimal change requiring user authorization

No tested invocation-only command satisfies the exact cached-path requirement.
Do not launch normal `codex /hooks` and approve the legacy user hook as a substitute.
The supported fallback is installing the **same content snapshot** in the normal
home. This creates a different cache path and writes marketplace/plugin settings;
it is a proposal, not an executed or verified acceptance command:

```sh
/home/agent/.npm-global/bin/codex plugin marketplace add /tmp/plugin-live-121-1pzs54rm/home/.skill-collection/plugin-cache/0.1.0-b6f7f1ce186c06e64c7516b2ba1c56970a064490436d73921927ede5470aa9a3 --json
/home/agent/.npm-global/bin/codex plugin add command-guard@skill-collection-guard --json
```

Run those with the normal environment, without the temporary `CODEX_HOME`.
Authorize this registration only if the changed cache path is acceptable. Preserve
existing settings and trust; do not grant hook trust during installation. After
registration, repeat the paired auth/provenance check against the normal home,
verify snapshot contents, and publish a launch command only when that same
configuration reports ChatGPT auth plus the intended plugin hook. The human then
reviews its definition in `/hooks`. The original exact isolated-cache attachment
remains unfulfilled; these commands do not pretend to solve it.

## Verification

`npm ci`, `node scripts/check/check.js`, and `node scripts/check/test/run.js`
passed. The collection check reported 611 guard cases, 36 install cases and zero
failures, with four existing agnix warnings. Both live helper modes completed;
Python compilation and `git diff --check` passed. No model turn, trust approval,
normal-home registration, PR, push, or merge into integration was performed.
The branch already starts at the requested integration tip `3a50d50`.
