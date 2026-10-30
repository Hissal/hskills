# OpenCode verification: #125

Rechecked 2026-10-30 on Linux, OpenCode **v2.2.2**, starting from
`a37ed41` (the integration branch included the authenticated #120 evidence).
Status: superseded by the successful v2.2.3 discovery controls below.
The v2.2.2 observations remain historical evidence.
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

## Resolved discovery controls (2026-10-31)

Merged prerequisite `446a9fb1607922ff7bb8bec5600ed9997edb8822` and integration
`7a0cfedbda417dd10bcb39f5cb0fb51388e4db7d` into the task branch. Installed
OpenCode now reports **v2.2.3**, Linux; no upgrade was performed for this task.
[Runtime hash, exact model and matrix outcomes](evidence/opencode-125/discovery/summary.json)
pin the actual run. These results do not retroactively establish v2.2.2 behavior.

**Cause (probe bug):** a fresh standalone `/api/skill` reads the unactivated
registry. The tight native fixture loop returned `data: []` in under two seconds.
On the same scratch server, calling `/api/agent` first activates location plugins;
the next skill listing contains the fixture. Installed embedded implementation
inspection corroborated this: `server.skill` calls `Skill.list` directly, whereas
`server.agent` awaits activation. The native request also completed a skill load
([transcript](evidence/opencode-125/discovery/native.jsonl)). No installed binary,
live settings, credentials or provider configuration was modified or copied.

Ranked hypotheses were activation timing, disabled scan configuration, fixture
format, and wrong location. Same-server activation changed only the first variable
and resolved listing. Native and compatibility sources both load. The installer
links needed no change. The runner now starts a disposable loopback server,
activates via the public agent API, lists on that same server, and terminates it.
Its CLI regression failed before the fix and passed afterward. Empty or duplicate
ungated discovery now stops before the gate matrix. `--discovery-only` skips
model requests and catalog access for the short discovery loop.

Observed controls, using exactly `opencode-go/claude-haiku-5-5`:

- Both compatibility links: exactly **one** fixture, gated `autoinvoke: false`;
  ungated: exactly **one**, without that restriction. Removing the Claude link
  leaves exactly **one** entry through `.agents/skills`. These are actual fixture
  registry counts, not total skill counts or zero-entry suppression claims.
  [Gated](evidence/opencode-125/discovery/listing.json),
  [ungated](evidence/opencode-125/discovery/listing-model-control.json),
  [single root](evidence/opencode-125/discovery/listing-single-root.json).
- Initial gated prompt plus six prompts repeated twice: **13 successful requests,
  zero completed skill calls**. Explicit natural-language invocation: **one**
  completed fixture call and body marker. Ungated vowel request: **one** completed
  fixture call and body marker. All 18 matrix requests succeeded without errors.
  The follow-up `@fixture` CLI probe returned no skill event or body marker despite
  the documented mention syntax; explicit natural-language tool loading above
  succeeds. Mention handling at the raw CLI seam remains a contract gap, not
  proof of body loading. See
  [transcript](evidence/opencode-125/discovery/mention-gated.jsonl).
- Scratch Claude steering marker: absent both with and without `.claude/CLAUDE.md`.
  Native project `AGENTS.md`: marker present in a successful fresh request
  ([native steering](evidence/opencode-125/discovery/steering-native.jsonl)).

Current [V2 skill documentation](https://opencode.ai/v2/docs/skills/)
(read 2026-10-31) documents compatibility roots, ID deduplication, autoinvoke
suppression and explicit `@skill-id` loading, matching these controls.
Current [V2 instructions documentation](https://opencode.ai/v2/docs/instructions/)
(read 2026-10-31) explicitly recognizes only `AGENTS.md`, without Claude fallback.
**Owner decision pending:** the collection's Claude-fallback steering assumption
must be replaced by a separately approved OpenCode V2 native instruction target
or explicit instruction configuration. This task records the exact contract gap;
it does not change installation policy. Funds are not a blocker. Discovery,
gate suppression, explicit body loading and one-versus-two-root counts are now
verified for this installed version; Claude steering fallback is unsupported.
