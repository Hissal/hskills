# Trigger evals

Hand-run only; never part of CI or the collection check. Real runs spend tokens
and need authenticated harnesses. Tests use injectable fake executables and spend
no model tokens.

Run `node scripts/eval/trigger.js --help` first. Copy
[sample queries](../scripts/eval/example.json), replace the Sol and Go IDs with
models available in your account, and set `cwd` relative to that JSON file to a
scratch project where the tested skills are installed in normal harness scopes.
The sample is a template, not a claim that those model IDs are available.
Use the [fixture skill](../scripts/eval/test/fixture/SKILL.md) for a smoke run.
Install it in `.claude/skills/fixture/`, `.agents/skills/fixture/` or
`.opencode/skills/fixture/` as appropriate. Keep any sibling skills present when
testing collisions. Record harness versions, model IDs and installation scopes.

```
node scripts/eval/trigger.js queries.json
node scripts/eval/trigger.js queries.json --full
node scripts/eval/trigger.js queries.json --repeat 2
node scripts/eval/test/run.js
```

Each skill has a callable `name` (including plugin namespace where applicable)
and at most six queries: up to three `fire: true` and three `fire: false`.
Use three of each for initial proof. Prompts are passed unchanged: no explicit
skill invocation, detection instruction or grading prompt is added. The sample
contains the fixture's six queries. Only use model-invoked skills as the observed
skill; a prompt may invoke a user-invoked skill that reaches it, as in the
[guide discovery case](#required-case-core-guide-discovery).

A query's `prompt` is one string, or an object with one per selected harness
(`{"claude": "/guide ...", "codex": "$guide ..."}`), since invocation forms
differ. An optional `says` lists texts the final answer must contain, as one
array or one array per harness; the query then passes only when its firing
matches and every text appears, and its result line adds `says all` or
`says missing "<text>"`. Claude's answer is the `result` event's text and
Codex's is the last `agent_message`; OpenCode's answer event is unverified, so
`says` is rejected for it.

Models have unique labels, a harness (`claude`, `codex`, `opencode`), an exact
model selector and tier (`frontier`, `lower`). Frontier labels `Opus` and `Sol`
are required. Default selects frontier models; `--full` also selects configured
lower tiers and OpenCode Go models. Populate the matrix for the tiers your
accounts expose rather than silently substituting a model. Every query and repeat
starts a fresh process/session; no continuation flags are used. Existing user
configuration still loads: use a controlled scratch project and record it.

The script prints `KEY: value` lines per query, model and skill. All queries must
match their expected firing for a model to pass. All frontier models must pass
for a skill to pass. Lower-tier misses are advisory. Repeats that disagree are
inconclusive, not majority-voted; errors, malformed/incomplete streams and
unobservable invocation are also inconclusive. Exit 0 means frontier pass, 1 means
frontier failure, 2 means inconclusive or invalid input. Inconclusive takes
precedence over failure, and never counts as a pass. One pass cannot estimate
noise: repeat a borderline result before changing the trigger. Add a sibling
exclusion to a description only after the eval demonstrates a collision, then
rerun both siblings' positive and negative queries.

## Offline injection and evidence limits

An optional model `command` is an argv array, e.g. `["node", "fake.js"]`. The
script appends the real harness flags and prompt, without a shell. The command
runs in `cwd`; use absolute fake paths. Offline tests always replace every command,
including models added to a full run. A two-minute per-process timeout and 16 MiB
output cap turn hung or oversized runs into inconclusive results. No raw model
response is recorded; the evaluator records only firing outcomes.

Primary sources inspected 2026-10-30; source reading, not a live runtime proof:

- [Loading mechanics](../research/loading-mechanics.md) establishes the distinction
  between a listed skill and its body being loaded, Claude's Skill tool and Codex's
  implicit-invocation gate. It does not establish headless output schemas.
- [Claude headless docs](https://code.claude.com/docs/en/headless) confirm `-p`,
  `--output-format stream-json --verbose`, streamed assistant tool-use blocks,
  Skill calls and final result/error handling. [Skills permissions](https://code.claude.com/docs/en/skills#restrict-claudes-skill-access)
  document the `skill` input parameter. We match `Skill` tool calls with that exact
  input, not prose mentioning a name. Denied calls and errored `Skill` calls are
  inconclusive; another tool's error (a failed `ls` of a missing folder) is not
  evidence either way and is ignored.
- [Codex non-interactive docs](https://developers.openai.com/codex/noninteractive/)
  confirm `exec --json --model`, JSONL command events and `turn.completed`.
  A live Codex CLI 0.166.0 fixture run on 2026-10-30 emitted an
  `item.completed` command execution with `status: completed`, exit code zero,
  a simple `cat` of the installed `skills/<name>/SKILL.md`, and the frontmatter
  body in `aggregated_output`. The evaluator counts this narrow read pattern
  with matching `name:` as fired. Live runs on 2026-10-31 (CLI 0.166.0) also
  read the entry point with other files in one `cat`, or in plain `cat`s joined
  by `;` or `&&`; those count too when the output carries the frontmatter.
  Mentions in prose or filename searches do not count; other commands naming
  that entry point, and failed commands naming its folder, are inconclusive.
  Other failed commands are ignored. This is observed CLI behavior, not a
  dedicated skill event guaranteed by the docs.
- [OpenCode CLI](https://opencode.ai/docs/cli/#run) confirms `run --format json
  --model` and provider/model selectors. [Agent Skills](https://opencode.ai/docs/skills/)
  confirms native `skill` loading. The pinned
  [JSON event emitter](https://github.com/anomalyco/opencode/blob/4d9e4de3871e08b39f7862782c46db95e8bdd43c/packages/cli/src/run/noninteractive.ts)
  emits `tool_use` with `part.tool`, completed `part.state.input`, and `step_finish`.
  The pinned
  [skill tool](https://github.com/anomalyco/opencode/blob/4d9e4de3871e08b39f7862782c46db95e8bdd43c/packages/core/src/tool/plugin/skill.ts)
  takes input `id` and returns the callable name in metadata. We match completed
  `skill` calls by `part.state.metadata.metadata.name`. This source snapshot does not
  prove that every installed OpenCode version emits the same schema.

Offline tests prove stream classification, not model trigger quality. Record
live eval dates, CLI versions, installation scope, model selectors, per-query
outcomes and spend separately; a single pass does not establish reliability.

For the isolated plugin guide gate, use the
[test-only marketplace and guide](../scripts/eval/test/plugin-fixture/README.md).
An optional skill `readName` specifies the bare Codex entry-point directory and
frontmatter name when `name` is plugin-qualified. Claude still matches the exact
`name` Skill input. This option does not resolve aliases or certify guide loads.

## Required case: core guide discovery

Proves that the core guide asks a listed pack guide for routes and flags every
unlisted one, relevant or not
([#145](https://github.com/Hissal/skill-collection/issues/145)).
Rerun it when the guide's discovery or skill lookup steps change, when a harness
pin is bumped, and when a new frontier model ships. The fixture pack is
[`orbit-guide`](../scripts/eval/test/guide-discovery/pack/orbit-guide/SKILL.md)
with routes, plus its user-invoked route
[`orbit-replay`](../scripts/eval/test/guide-discovery/pack/orbit-replay/SKILL.md).
A second pack guide,
[`ledger-guide`](../scripts/eval/test/guide-discovery/pack/ledger-guide/SKILL.md),
is never listed and touches none of the requests. Both packs are fictional, so
a route can only come from its guide.

```sh
node scripts/eval/test/guide-discovery/prepare.js
node scripts/eval/trigger.js <root>/listed.json --repeat 2
node scripts/eval/trigger.js <root>/unlisted.json --repeat 2
```

`prepare.js` prints a scratch root holding two committed projects, each with the
core guide and both packs at project scope (`.claude/skills/`, `.agents/skills/`),
and one config per project. `listed` names only `orbit-guide` in its `### Packs`
list; `unlisted` has no pack list. `CLAUDE_BIN`, `CODEX_BIN` and `SOL_MODEL`
override the defaults. Each prompt invokes the guide (`/guide` on Claude,
`$guide` on Codex) with a telemetry request. Both harnesses may read anywhere
and write in the project, so starting nothing is the agent's choice. Raw
sessions stay under `<root>/evidence/`, kept by the plugin fixture's `capture.js`.

- **listed**: `orbit-guide` fires, and the answer says the route's invocation
  (`/orbit-replay`; `$orbit-replay` on Codex), `ledger-guide` and
  `installed, not set up`.
- **unlisted**: `orbit-guide` does not fire, and the answer says `orbit-guide`,
  `ledger-guide`, `installed, not set up` and the setup invocation.
- **Both**: every frontier model passes; afterwards neither project has a
  changed or new file (no `replay/` folder); and no session enumerates an
  installation folder (listing or searching a skill, plugin or home folder,
  such as `ls .claude/skills` or `rg --files .agents`). Direct reads and
  existence checks of exact paths are expected. The script sees neither files
  nor commands: check both in the raw sessions, and record them with the
  results.

## Required cases: the two discovery paths on real skills

Proves both discovery paths with the collection's own skills
([#113](https://github.com/Hissal/skill-collection/issues/113)): the automatic
guide [`onboarding-guide`](../skills/packs/onboarding/onboarding-guide/SKILL.md)
fires at task start, and the core [`guide`](../skills/core/guide/SKILL.md)
finds the installed pack guide
[`csharp-guide`](../skills/packs/csharp/csharp-guide/SKILL.md). Rerun them when
either guide's description or discovery steps change, when `csharp-guide`'s
description changes, when a harness pin is bumped, and when a new frontier
model ships.

```sh
node scripts/eval/test/required-cases/prepare.js
node scripts/eval/trigger.js <root>/automatic.json --repeat 2
node scripts/eval/trigger.js <root>/listed.json --repeat 2
node scripts/eval/trigger.js <root>/listed-control.json --repeat 2
node scripts/eval/trigger.js <root>/unlisted.json --repeat 2
```

[`prepare.js`](../scripts/eval/test/required-cases/prepare.js) prints a
scratch root holding four committed projects with the skills copied from this
repo at project scope (`.claude/skills/`, `.agents/skills/`), and one config
per project. Overrides and permissions are as in the core guide discovery case.
Each session runs through the evidence capture with `--reset`: its raw
streams go to `<root>/evidence/<case>/`, its project changes (`git status
--porcelain`) are recorded as `changes` in its `.json`, and then the project
is restored to its commit. No session sees another's writes, so a write shows
up in that session's `changes` rather than in the tree after the run.

- **automatic**: a web shop with `guide` and `onboarding-guide`. The prompts
  are plain requests with no invocation. `onboarding-guide` fires, and the
  answer says `Recommended:`, on three task starts with no workflow chosen:
  - "I want shoppers to keep their cart across devices, but I am not sure where to start."
  - "We should add discount codes to checkout. How should we approach it?"
  - "Product search feels slow and clunky and I have a few vague ideas to fix it. Help me work out what to do first."

  It stays quiet on three requests that need no workflow:
  - "What is two plus two?"
  - "Keep going with the cart changes you already started; the tests are next."
  - "What does cartTotal in src/cart.js return for an empty cart?"
- **listed** and **unlisted**: `guide` and `csharp-guide` are installed, and
  each prompt invokes the guide (`/guide`, `$guide`) with a request.
  - **listed** is an SDK-style .NET library that names `csharp-guide` in its
    `### Packs` list. The requests rename a public type, add an optional
    parameter to a public method, and chase a crash in apps that were not rebuilt
    after a release. `csharp-guide` fires, and the answer says `Recommended:`.
  - **listed-control** is the same library before setup, with no pack list
    and no pack config, given the same requests. `csharp-guide` does not
    fire, and the answer says `Recommended:`, `csharp-guide`, `installed, not
    set up` and the setup invocation. `csharp-guide`'s own description
    fires on .NET work and on choosing a C# workflow. So in a .NET project, a
    firing in **listed** alone could be that trigger rather than the core
    guide's lookup. The control rules that out: the two projects differ only in
    the pack list, so passing both means the load needed the pack list.
    Neither the requests nor the project's description name C# or .NET, so
    the trigger has no cue before the project's files are read. If the
    control fires on a model, that model's **listed** pass does not show the
    lookup, and the pair fails.
  - **unlisted** is the web shop, with no pack list and requests outside C#:
    a double charge at checkout, splitting a module without changing results,
    and deciding how discount codes stack. `csharp-guide` does not fire, and
    the answer says `Recommended:`, `csharp-guide`, `installed, not set up`
    and the setup invocation (`/setup-project`, `$setup-project`). It is not a
    .NET project because `csharp-guide`'s own description fires on .NET work
    and on choosing a C# workflow, and its body handles being loaded unlisted.
    There, Sol reads it alongside the guide, so the firing would not show
    the guide's lookup. That an unlisted guide relevant to the request is not
    asked is the core guide discovery case's job.

    Known model limit: with the core guide at `46d3fa3`, Sol drops the
    **Not set up** line for an unrelated unlisted pack guide in about 1 of
    6 sessions (2026-10-31, Codex 0.166.0, `gpt-6.1-sol`), so expect
    `unlisted` to be borderline on Sol. Follow-up:
    [#215](https://github.com/Hissal/skill-collection/issues/215).
- **All**: every frontier model passes. In the raw sessions, no `onboarding-guide`
  session that fired, and no `guide` session, writes or edits a file, starts a
  recommended skill (a Skill call to anything but the guides), or enumerates
  an installation folder, as in the core guide discovery case. Record these
  checks with the results.
