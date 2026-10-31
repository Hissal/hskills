# OpenCode verification: #125

Linux, 2026-10-30/31, under [#78](https://github.com/Hissal/skill-collection/issues/78).
Status: discovery controls verified on OpenCode v2.2.3; the owner approved native global
steering at `~/.config/opencode/AGENTS.md` through `--owner-steering`.
The native global present/absent control passed; see the approval section below.
The earlier v2.2.2 runs, including a paid Console quota failure, are [history](#history-v222-2026-10-30).

## Isolated fixture probes

Reproduce with:

```sh
python3 scripts/install/evidence/opencode-125.py --model opencode-go/claude-haiku-5-5
```

This is manual, authenticated and potentially token-spending. It prints the
temporary evidence directory. HOME, XDG roots, provider/model configuration and
auth stay inherited. `OPENCODE_TEST_HOME` redirects OpenCode's home-scoped skills
and steering to a scratch tree; each isolated probe uses `--standalone` so an
existing service cannot ignore the process override. This runtime-specific test
override was located in the installed binary's embedded Global implementation;
it leaves XDG config/data paths unchanged. No secret-bearing database is copied.

The installer and doctor pass. Both `.claude/skills/fixture` and
`.agents/skills/fixture` resolve to the same source. The source contains
`disable-model-invocation: true` and `metadata.opencode/autoinvoke: "false"`.
The fixture runner also provides an ungated discovery control, an explicit
invocation control, and the six trigger sample prompts repeated twice when the
first model request succeeds. Errors stop that matrix rather than manufacture
negative firing results. Inspect completed skill events under the
[trigger evidence rules](../docs/trigger-evals.md); this runner saves observations,
not automatic acceptance verdicts.

The model argument is required and includes the provider; an absent model or
failed neutral request stops the runner without selecting a replacement.
Steering arms write the unique instruction `For every reply append the exact marker
STEERING_125_CLAUDE.` only in the scratch `.claude/CLAUDE.md`, then rerun in a fresh
process after removing that file. CLI fixture tests cover required model selection,
exact Go selection with failed neutral access, and empty discovery (each
substantive change observed red first).

## Resolved discovery controls (2026-10-31)

Merged prerequisite `446a9fb1607922ff7bb8bec5600ed9997edb8822` and integration
`7a0cfedbda417dd10bcb39f5cb0fb51388e4db7d` into the task branch, then
merged integration correction `de1ae445` after reading its positive ungated
transcript. Its completed tool event uses `part.tool == "skill"` and
`part.state.status == "completed"`; the earlier summary already counted one.
The error was the blanket prose conclusion, not that event schema. Installed
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
**Historical policy gap (superseded by the approval below):** the collection's Claude-fallback steering assumption
must be replaced by a separately approved OpenCode V2 native instruction target
or explicit instruction configuration. This task records the exact contract gap;
it does not change installation policy. Funds are not a blocker. Discovery,
gate suppression, explicit body loading and one-versus-two-root counts are now
verified for this installed version; Claude steering fallback is unsupported.

Validation: `npm ci`; `python3 scripts/install/evidence/test-opencode-125.py`
(4 passed); `node scripts/install/test/run.js` (36 cases, zero failures);
`node scripts/check/test/run.js` (218 passed); `node scripts/check/check.js`
(304 files, zero failures, four existing agnix fixture/marketplace warnings).
The final offline `--discovery-only` runtime control also exited zero. No gate
writer, installed harness, live settings, Codex authentication guidance or Windows
handoff was changed. No agents, PR, push or merge into integration was performed.


## Approved native global steering (2026-10-31)

Owner decision: in the implementation request for this work, the user explicitly
approved extending `--owner-steering` to OpenCode V2's native
`~/.config/opencode/AGENTS.md`. Default install still has no steering. This
supersedes #119's original Claude-fallback assumption and the pending decision
above; the approval came from the user request, not a GitHub owner comment.
The earlier failed fallback observations remain evidence of the old path.

Implementation starts at integration `096a9ea`, with ancestry confirmed. The
existing selected-home OpenCode config mapping is retained, with recorded
ownership, remembered opt-in, conflict preservation and copy drift checks.
Old two-target records acquire the third destination on a no-flag rerun.

Executed a separate global control on Linux, OpenCode v2.2.3, exact model
`opencode-go/claude-haiku-5-5`, without a variant. Both fresh standalone
requests used the neutral prompt `Reply with hello.`, an empty scratch project,
`OPENCODE_TEST_HOME` pointing to scratch home and `OPENCODE_CONFIG_DIR` pointing
to scratch config. Only scratch config's `AGENTS.md` contained the instruction
to append `NATIVE_GLOBAL_119_PRESENT`. With it present the reply was
`Hello! NATIVE_GLOBAL_119_PRESENT`; after removal it was `Hello!`.
Both exited zero. [Sanitized outcomes](evidence/opencode-125/native-global/summary.json).
Authentication stayed inherited; no auth files were read or copied, and no real
user config or home steering was modified. Global config override was confirmed
in the installed binary's embedded Global service mapping before execution.
The prior project-native result and this global result are distinct controls.
Windows native link/copy behavior remains untested here.

Reproduce in an empty scratch project with inherited authentication: set
`OPENCODE_CONFIG_DIR` to a scratch config directory and `OPENCODE_TEST_HOME`
to a scratch home, then run `opencode run --standalone --format json --model
opencode-go/claude-haiku-5-5 'Reply with hello.'` in a fresh process for each
arm, adding then removing only scratch config's `AGENTS.md` between arms.


Validation for the native-target change: `npm ci` completed (Node v20.19.2
reported engine warnings for dependencies requesting Node 22); installer CLI
38 cases, zero failures; collection fixtures 218 passed, zero failed; OpenCode
probe CLI fixtures 4 passed. The native destination failed a CLI filesystem
assertion before implementation. The first expanded default-rerun test had an
incorrect zero exit expectation; it was corrected to the existing pending
Codex trust status while retaining all file-preservation assertions.

Final collection check: 305 files, zero failures, four existing agnix
fixture/marketplace warnings; its nested installer cases also passed 38/38.
Guard cases passed 611/611. `git diff --check` passed. Integration tip
`096a9ea4a01ad77d62236d541fbf00aac191444e` was already included; merging
`feat/implement-issue-78` reported already up to date. No agents, PR, push or
merge into integration was performed.

## History (v2.2.2, 2026-10-30)

Superseded by the controls above; these runs do not establish v2.2.3 behavior.
Pruned records are at [`a640892`](https://github.com/Hissal/skill-collection/tree/a640892606c001b1ab1ddbe8e1232948dc67f66c/research/evidence/opencode-125).

- **Paid Console selection.** From `a37ed41`, `opencode/gpt-6.1-sol#medium` (active and enabled
  with a `medium` variant, per `api GET /api/model`) failed every request with exit 1,
  `provider.quota`, HTTP 402 `Upstream request failed: Insufficient account funds`: the
  neutral control, the gated request and both steering arms. That diagnosed this one paid
  selection only, not the user's Go subscription. The first standalone `/api/skill`
  listings, gated and ungated, returned `data: []`.
- **Go rerun.** From `3a50d50`, exactly `opencode-go/claude-haiku-5-5` (a Go model per the
  [Go documentation](https://opencode.ai/v2/docs/console/go/), read 2026-10-30): all 18 requests
  exited 0. Both listings still returned `data: []`; the 13 gated requests had zero completed
  skill events; explicit invocation reported it could not find `fixture`; the ungated control
  loaded the body (`FIXTURE_125_LOADED`); the Claude steering marker was absent in both arms.
  [Per-request counts](evidence/opencode-125/go/summary.json). Follow-up scratch copies under
  project `.agents/skills` and `.opencode/skills`, and `git init`, still listed nothing, and a
  native-scope explicit request completed no skill event. The
  [resolved controls](#resolved-discovery-controls-2026-10-31) later traced the empty listings to
  the probe reading an unactivated registry.
