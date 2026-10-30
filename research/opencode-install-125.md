# OpenCode verification: #125

Rechecked 2026-10-30 on Linux, OpenCode **v2.2.2**, starting from
`a37ed41` (the integration branch included the authenticated #120 evidence).
Status: fixture installation passes; live gate and steering verdicts remain
inconclusive. These are runtime/account blockers, not another-spec dependencies.

## Existing authenticated runtime

Normal `models` succeeds and lists `opencode/gpt-6.1-sol`. Normal `auth list`
reports stored OpenCode Console accounts. Safe `debug config` retains the
Personal / OpenCode provider configuration. No credential file was read or
copied, no login was attempted, and no real settings were changed.

The normal-runtime control, without any home override or standalone flag,
ran `run --format json --model opencode/gpt-6.1-sol#medium 'Reply with hello.'`.
It returned exit 1, `provider.quota`, HTTP **402**, and the exact message
`Upstream request failed: Insufficient account funds`.
[Saved error event](evidence/opencode-125/normal-control.jsonl).
The normal runtime `api GET /api/model` also confirms this exact active, enabled
model and its `medium` variant with `reasoningEffort: medium`
([sanitized model record](evidence/opencode-125/model.json)). Actual response
reasoning remains unobservable because the provider returns quota failure. No alternative model was substituted.

This supersedes the earlier copied-database experiment, whose selector and
account context were unverified. Claude/Codex's successful authenticated runs
in [#120 evidence](live-hooks-120.md) do not establish OpenCode Console funds.

## Isolated fixture probes

Reproduce with `python3 scripts/install/evidence/opencode-125.py` (manual,
authenticated and potentially token-spending). It prints the temporary evidence
directory. HOME, XDG roots, provider/model configuration and auth stay inherited.
`OPENCODE_TEST_HOME` redirects OpenCode's home-scoped skills and steering to a
scratch tree; each isolated probe uses `--standalone` so an existing service
cannot ignore the process override. This runtime-specific test override was
located in the installed binary's embedded Global implementation; it leaves
XDG config/data paths unchanged. No secret-bearing database is copied.

The installer and doctor pass. Both `.claude/skills/fixture` and
`.agents/skills/fixture` resolve to the same source. The source contains
`disable-model-invocation: true` and `metadata.opencode/autoinvoke: "false"`.
The fixture runner also provides an ungated discovery control, an explicit
invocation control, and the six trigger sample prompts repeated twice when the
first model request succeeds. Errors stop that matrix rather than manufacture
negative firing results. Inspect completed skill events under the
[trigger evidence rules](../docs/trigger-evals.md); this runner saves observations,
not automatic acceptance verdicts.

Observed on this run:

| Probe | Result |
| --- | --- |
| `api GET /api/skill --standalone`, both roots linked | Exit 0, `data: []`: zero registered entries, zero fixture entries. [API response](evidence/opencode-125/listing.json). |
| Ungated fixture, fresh standalone skill API | Exit 0, also `data: []`; discovery control fails, so zero gated entries cannot prove suppression. |
| `debug agents --standalone` | First diagnostic attempt failed with `ServiceUnavailableError: Location plugins did not finish activating`; fixture-run attempt succeeded. Intermittent startup failure. Agent listing is not a skill listing. |
| Gated vowel request | Exit 1, same HTTP 402 [error](evidence/opencode-125/gate-q1.jsonl); no completed skill invocation. |
| Claude steering present | Exit 1, same HTTP 402 [error](evidence/opencode-125/steering-present.jsonl). |
| Claude steering absent | Exit 1, same HTTP 402 [error](evidence/opencode-125/steering-absent.jsonl). |

Steering is the unique instruction `For every reply append the exact marker
STEERING_125_CLAUDE.` only in the scratch `.claude/CLAUDE.md`, followed by a
fresh process after removing that file. No project steering file is created.
Quota failures in both arms establish no fallback verdict.

## Completion boundary and human action

Restore funds on the **active OpenCode Console account** used by the normal
runtime, then rerun the fixture command. No Claude/Codex reauthentication or
credential migration is indicated by these results. The exact supported Medium variant is confirmed; successful model access beyond
the quota check remains unverified.

The empty registered-skill response cannot establish deduplication: a successful
ungated discovery/body-load control is required before interpreting absence as
user-only gate enforcement. If it remains empty after account recovery, diagnose
location plugin activation/skill registration with the saved fixture, without
changing the install policy. No duplicate was observed. If a valid control later
lists two entries, the owner options are: retain both roots and accept duplicate
listing, or adopt a harness-specific exclusion/install route. Put those options
to the owner before changing behavior, per #78.

#125 remains open: live gate behavior, meaningful once-versus-twice discovery,
and successful Claude-file fallback are not proven. Filesystem doctor success
and embedded-source support for the gate do not replace those runtime checks.
