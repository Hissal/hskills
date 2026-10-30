# OpenCode verification: #125

Rechecked 2026-10-30 on Linux, OpenCode **v2.2.2**, starting from
`a37ed41` (the integration branch included the authenticated #120 evidence).
Status: Go access and fixture installation pass; live gate and steering
verdicts remain inconclusive because discovery/body-load controls fail.
The paid Console observation below is historical, not a Go account diagnosis.

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

Reproduce with `python3 scripts/install/evidence/opencode-125.py --model <provider/model>` (manual,
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

## Go correction and rerun (2026-10-30)

The earlier funds diagnosis applied only to paid Console
`opencode/gpt-6.1-sol#medium`. It did not test the user's Go subscription.
[Official Go documentation](https://opencode.ai/v2/docs/console/go/) (read
2026-10-30) lists Claude Haiku 5.5 among Go models. Installed `models` lists
`opencode-go/claude-haiku-5-5`. These are separate provider selections;
restoring Console funds is not a prerequisite for this Go test.

Reran from integration `3a50d50` on Linux, OpenCode v2.2.2, using exactly
`opencode-go/claude-haiku-5-5`, provider `opencode-go`, without a variant.
The neutral normal-runtime request returned exit 0 and `Hello!`.
All 18 model requests returned exit 0: neutral, initial gated request,
six prompts repeated twice, explicit and ungated controls, and two steering
arms. [Exact selection](evidence/opencode-125/go/selection.json),
[transcripts and counts](evidence/opencode-125/go/summary.json).
No authentication, real settings or subscription changes were made.

Both gated and ungated API listings still returned `data: []`.
All 13 gated requests had zero completed skill events. Explicit invocation
reported it could not find `fixture`; the ungated control did not load its
body either. These are failed discovery controls, not gate passes.
The steering marker was absent in both successful replies; this does not
establish successful Claude-file fallback.

Discovery diagnosis: `debug paths home` with the override resolves to the
scratch home, and standalone server trace watches that scratch path. Thus the
override is recognized; zero entries cannot be attributed to Console funds.
Adding real project `.agents/skills/fixture` and `.opencode/skills/fixture`
copies, then initializing the scratch project with Git, still returned zero
entries. A native-scope explicit request also produced no completed skill
event. These diagnostic copies were added after the saved matrix and changed
only scratch files. Root cause of registration remains unresolved; investigate
configuration compatibility/plugin activation before interpreting suppression.
No install policy was changed and no meaningful duplicate count was obtained.

Reproduce with:

```sh
python3 scripts/install/evidence/opencode-125.py --model opencode-go/claude-haiku-5-5
```

The model argument is required and includes the provider; an absent model or
failed neutral request stops the runner without selecting a replacement.
An empty ungated discovery control makes the runner exit nonzero after saving
the matrix, explicitly marking gate and duplicate verdicts inconclusive.
CLI fixture tests cover required model selection, exact Go selection with failed
neutral access, and empty discovery (each substantive change observed red first).
#125 remains open for successful body-load/discovery controls, gate enforcement,
once-versus-twice discovery, and Claude steering fallback. The historical paid
Sol 402 above remains evidence about that specific request only.
