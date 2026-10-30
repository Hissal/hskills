# OpenCode verification: #125

Re-checked on Linux on 2026-10-30 with
`/home/agent/.opencode/bin/opencode` reporting **`opencode v2.2.2`**.
The earlier finding in commit `f73f2d64338521459f36ff838e518ab3688a2ad6`
confused a noninteractive PATH miss with an unavailable executable. It is
superseded by this run: the executable works. Interactive login-shell PATH
includes its directory; use the explicit executable for reproducibility.

The re-check used collection base `274de14` (including integration tip
`711a8ae`), a private temporary HOME and XDG config/data/cache/state roots,
and an empty scratch project outside the checkout. A SQLite backup of the
existing OpenCode database supplied the stored OpenCode Console authentication
without printing credentials or modifying the original database. No existing
user settings or steering files were copied or edited. The temporary database
contains credentials: keep it private and delete it after diagnosis.

Observed outcomes:

| Probe | Outcome |
| --- | --- |
| Installer fixture with `disable-model-invocation: true` and `metadata.opencode/autoinvoke: "false"` | Both user roots linked the same fixture; doctor passed. |
| `models --standalone` | `ServiceUnavailableError: Location plugins did not finish activating`; no model list. |
| `debug agents --standalone`, both roots populated | Same startup error; no listing, so the listing count is unknown. |
| Real `run --standalone --format json` vowel prompt | Exit 1: JSON `provider.quota`, HTTP 402, `Upstream request failed: Insufficient account funds`; no model response or skill event. |
| Claude steering marker present / absent, fresh `run` processes | Both exit 1 with the same HTTP 402 quota error; no model response. |

The requested model selector for the run attempts was
`opencode/gpt-6.1-sol#medium`, representing the requested Sol Medium model.
It is **unverified**, because provider model discovery failed before it could
confirm a supported selector. No other model was substituted.
The gate prompt was `Count the vowels in banana.`;
the steering prompt was `Reply with hello.` in two fresh sessions, with
`For every reply append the exact marker STEERING_125_CLAUDE.` present
only in the disposable `~/.claude/CLAUDE.md` for the first arm. Stored auth
listing identifies OpenCode Console, but does not prove successful remote
authentication or access to this model.

[#125](https://github.com/Hissal/skill-collection/issues/125) remains open.
Discovery startup and run quota errors are distinct failures; neither proves
a missing binary. The quota error does not prove model-selector support.
Gate behaviour, listing count and steering fallback remain
**inconclusive**; filesystem checks establish only the installed fixture.
No duplicate listing was observed and no install behaviour was changed under
#78's owner decisions.

The [loading research](loading-mechanics.md) and
[trigger stream sources](../docs/trigger-evals.md#offline-injection-and-evidence-limits)
are documented research, not hand-run evidence for these checks. Installer
and gate checks establish filesystem/output correctness, not harness behaviour.

### Next hand run

Restore provider funds, resolve the discovery plugin activation error and
confirm the exact Sol Medium selector with `models` before repeating. Keep
the requested model; ask the owner if that provider does not expose it.
Use an already installed OpenCode runtime with an authenticated, available
`provider/model`, Node.js, and a disposable home and scratch project outside
this checkout. Isolate `HOME` and the XDG config/data/cache/state directories
for every OpenCode process; provision authentication only in that disposable
scope. Record `opencode --version`, the exact model, OS, collection commit,
configuration and both skill roots. Do not install a harness or write to the
real home as part of this procedure.

1. Copy the [fixture](../scripts/eval/test/fixture/SKILL.md) into a temporary
   source tree at `skills/core/fixture/SKILL.md`. Give that tree a
   `collection.json` containing
   `{"core":["skills/core/fixture"],"packs":{},"expensive":[]}`.
   Add `disable-model-invocation: true` and a frontmatter `metadata` mapping
   containing `opencode/autoinvoke: "false"`. Install both roots with:
   `node scripts/install/install.js install --source "$fixture_source" --home "$fixture_home"`.
   **Done:** doctor passes and both links resolve to the same gated fixture.
2. From the empty scratch project, run
   `opencode run --format json --model "$model" "Count the vowels in banana."`
   with the isolated environment. Save the transcript and actual available-skill
   listing; count entries for `fixture`, distinguishing listing from body load.
   Repeat in fresh sessions with the other matching prompts in the trigger
   sample. Check tool events, not just the final vowel count. Compare with an
   explicit invocation and a model-invoked fixture control to show discovery and
   authentication work; denied, missing or unobservable calls are inconclusive.
   **Done:** each fresh session has a saved listing count and tool-event verdict;
   matching requests leave the gated fixture uninvoked, and controls load it.
   If the listing contains duplicates, record the finding and options for the
   owner before changing install behaviour.
3. Put a unique response instruction only in the disposable
   `~/.claude/CLAUDE.md`. With no project or native OpenCode steering files,
   run a fresh neutral prompt using the same command flags. Save the transcript
   and compare with a fresh session after removing that instruction; record
   whether the marker follows the Claude-file fallback.
   **Done:** both transcripts and the OpenCode version are saved, with a verdict
   on whether only the Claude-file arm follows the unique instruction.

Before running, read the [trigger evidence rules](../docs/trigger-evals.md) for
repetitions and event-schema limits. The procedure above describes the
successful observations still needed;
the failed attempts are recorded above. Keep transcripts locally until
publication is authorized. Completion
requires each live outcome and harness version recorded on #125; until then,
leave the issue open.

