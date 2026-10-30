# Codex human review with existing authentication (#121)

Read/executed 2026-10-30, Linux, Codex 0.166.0, integration base `3a50d50`.
Updated 2026-10-31: normal-profile registration executed and paired authentication /
plugin provenance verified; human trust review and behavioral acceptance remain pending.
Authenticated attachment to the original isolated cache remains unresolved. This corrects the [live acceptance handoff](live-plugins-121.md),
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

## Executed minimal normal-profile registration

The parent executed the following commands with the normal environment, without a
temporary `CODEX_HOME`, under the user's authorization to reuse existing auth and
make a minimal reversible plugin addition. Both commands succeeded. The original
normal-profile plugin list contained no guard; registration added only the guard
marketplace and plugin. This **did write normal-profile marketplace/plugin settings**.
The legacy hooks and their original SHA were preserved; no credentials were read,
copied or linked, and no trust was written.

```sh
/home/agent/.npm-global/bin/codex plugin marketplace add /tmp/plugin-live-121-1pzs54rm/home/.skill-collection/plugin-cache/0.1.0-b6f7f1ce186c06e64c7516b2ba1c56970a064490436d73921927ede5470aa9a3 --json
/home/agent/.npm-global/bin/codex plugin add command-guard@skill-collection-guard --json
```

The parent's [sanitized paired-process evidence](evidence/live-plugins-121/normal-auth-verified.json)
from `/tmp/spec78-normal-auth-verified.json` retains only account type and hook
metadata (including read-probe scope flags). The same app-server process returned
`accountType: chatgpt` and both hooks:

- Legacy user hook: `/home/agent/.codex/hooks.json`, enabled and trusted, with
  unchanged original hash `sha256:b119ab19421608473ea4f4992b04ac6acee9f9df9e43a30447f6f15d8e4df8d1`.
- New plugin: `command-guard@skill-collection-guard`, enabled and untrusted,
  `source: plugin`, at
  `/home/agent/.codex/plugins/cache/skill-collection-guard/command-guard/0.1.0/hooks/codex.json`.

`normalSettingsUnchanged: true` describes only the before/after hashes during
this read probe. It does not describe the earlier registration operation.
The helper used the normal home with the recorded marketplace/plugin overrides;
its returned source is the normal installed cache, not the isolated cache.
The evidence copy omits invocation argv; the helper's invocation construction is
in [the read helper](../scripts/install/evidence/human-review-auth.py).

The tested human launch command uses the normal profile and existing auth:

```sh
/home/agent/.npm-global/bin/codex
```

Then open `/hooks` and review **only the new plugin definition** at the exact
normal cache path above. Preserve the legacy user hook and its trust. Human trust
approval and Codex behavioral acceptance remain pending. The earlier negative
overlay and unauthenticated temporary-home results above remain historical
evidence; registration does not establish authenticated attachment to that home.

## Verification

The original investigation passed `npm ci`, `node scripts/check/check.js`, and
`node scripts/check/test/run.js` (611 guard cases, 36 install cases, four existing
agnix warnings). Both original helper modes completed; Python compilation and
`git diff --check` passed. That investigation performed no normal registration;
the parent subsequently executed the authorized registration recorded above.
The correction merged `28bf81c7507eac806c33febba5c26e2801868771` with `--no-ff`
onto integration base `3a50d50`. For this correction, `npm ci`,
`node scripts/check/check.js` (611 guard cases, 36 install cases, zero failures,
four existing agnix warnings), `node scripts/check/test/run.js` (218 passed), and
`git diff --check` passed. No further user settings or trust changes are part of the correction.
