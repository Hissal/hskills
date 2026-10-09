# Ledger: Unity workflow skill repos

Ticket: [Ledger: Unity workflow skill repos](https://github.com/Hissal/skill-collection/issues/10), part of [Wayfinder: personal skill collection blueprint](https://github.com/Hissal/skill-collection/issues/1).

Read on 2026-10-09 from shallow clones in the session scratchpad. Nothing from any source was installed or executed. Every link is pinned to the commit read:

| Key | Source | Commit read | Commit date |
|---|---|---|---|
| **A** | `tipoLi5890/unity-dev-skills` | [`68eb299`](https://github.com/tipoLi5890/unity-dev-skills/tree/68eb299d15ffe581fe3f8c156b609087515b0f1e) | 2026-10-09 |
| **B** | `Nice-Wolf-Studio/unity-claude-skills` | [`a149d3e`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/tree/a149d3e995420432f52b0899092daa4b069f441f) | 2026-09-15 |
| **C** | `AUN-PN/unity-agent-workflows` | [`4193d84`](https://github.com/AUN-PN/unity-agent-workflows/tree/4193d84176e80fc38ee0252b0fa327119ef96d01) | 2026-10-03 |
| **D** | `tea-x-random/unity-game-skills` | [`dafb97e`](https://github.com/tea-x-random/unity-game-skills/tree/dafb97ef00f94e64e42e6260bc6b3af74cc83dad) | 2026-07-10 |

Conventions:

- Vocabulary is [GLOSSARY.md](../../GLOSSARY.md): **core**, **pack**, **always-on**, **model-invoked**, **user-invoked**, **address**, **candidate**, **mechanism**.
- **Every recommendation is proposed.** The owner decides in theme sessions. Per-project skills are likely picked one at a time, so each entry is judged on its own, even inside a grouped entry.
- *Inference:* marks a claim reasoned from the sources rather than stated by them.
- **Exclusion reference** is [research/unity-baseline.md](../unity-baseline.md). "Baseline §2" means its inventory table; "gap #n" means item n of its §5 gap list (1 animation, 2 Input System, 3 asset loading, 4 scene management, 5 async, 6 runtime performance, 7 DOTS, 8 rendering beyond URP, 9 netcode, 10 save systems, 11 UPM authoring, 12 build/player config, 13 C# style, 14 editor tooling, 15 terrain/physics beyond collisions). Anything the baseline covers is proposed **reject**.
- **Fork overlap** is against the fork's `unity-*` skills as described in [research/ledgers/mattpocock-skills-unity.md](mattpocock-skills-unity.md) ("Unity skills").
- **Idle context cost**: description characters / 4, plus about 5 tokens for the name (the same rough heuristic as the other ledgers; *inference*, not a tokenizer count). Measured from each `SKILL.md` frontmatter at the pinned SHA. **None of the four sources sets `disable-model-invocation`** (grep of all `SKILL.md`). No `agents/openai.yaml` sets `allow_implicit_invocation: false`. C's four copies and A's single file (`comfyui-asset-generation`) set it `true`; D's 27 files set no `policy` at all. So every skill as published is model-invoked on Claude Code. On Codex, only an explicit `false` hides a skill ([research/loading-mechanics.md](../loading-mechanics.md)), so *inference*: they are model-invoked there too.
- Many source skills are written for a specific setup (macOS shells, MCP for Unity, paid generation APIs). Where a skill cannot be copied, the entry says why.

## Overview

### Counts and quality signals

| Source | Skills | Mechanisms worth an entry | Idle cost as published (est.) | Unity version assumed | Maintenance signals (GitHub API, 2026-10-09) |
|---|---|---|---|---|---|
| **A** tipoLi5890 | 36 (one plugin `unity-dev` 0.18.0) | 1 (router/scope convention + lint gates) | ~6.2k tokens (36 x ~170) | Unity 6 (cites 6000.0-6000.4 behaviour) | Created 2026-09-12, 6 commits, 0 stars, CI lint on every push ([A README](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/README.md) "Working on this repo"). Very active: a long, numbers-heavy [CHANGELOG](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/CHANGELOG.md) |
| **B** Nice-Wolf-Studio | 35 (plugin `unity` 1.4.0) + 2 WIP in `unity-ops/` | 2 (shadow-mode hook, overlap-audit method) | ~2.9k tokens (37 x ~78) | Unity 6.3 LTS (6000.3), "sourced from... official documentation as of March 2026" ([B README](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/README.md)) | Created 2026-03-10, 65 commits, 40 stars, 40 open issues (mostly `unity-ops` WIP). Its own audit's accuracy findings (issues #4-#8, 2026-09-14) are **still unfixed at HEAD** (checked below) |
| **C** AUN-PN | 1 (plus three identical copies of it for packaging) | 3 (evals, Bee/Roslyn compile check, structure maps) | ~205 tokens | Not stated; Unity 2D focus ([C README](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/README.md)) | Created 2026-05-12, 88 commits, npm-published `0.5.0`, 1 star |
| **D** tea-x-random | 27 | 1 (shared canonical skills + per-host metadata + installer) | ~4.6k tokens (27 x ~170) | Unity 6, **casual iOS games**, driven through CoplayDev MCP for Unity ([D README](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/README.md)) | Created 2026-06-27, 32 commits, 3 stars, **no push since 2026-07-10** |

`C`'s single skill ships at the root, under `skills/`, `.claude/skills/` and `plugins/.../skills/`; `diff -r` showed the copies identical.

**How the four differ** (*inference* from reading them side by side):

- **A** is a method-heavy plugin: each `SKILL.md` is a router with a symptom table plus copyable C#/Python. 22 of its 36 skills mirror the baseline's catalog topic for topic (UI, 2D, URP, audio, localization, UGS, IAP, LevelPlay, Vivox, multiplayer services, web, navigation, physics, search). The other half is new and strong: making a game drivable by an agent, measuring frames, a brief-first game kickoff, device testing.
- **B** is a documentation digest (Unity 6.3 docs condensed into 20 "guide" skills) plus three newer tiers: Tier 1 "correctness" (WRONG/RIGHT/GOTCHA), Tier 2 "architecture decisions" and Tier 3 "design intent → code". The tiers carry the game-dev ideas; the guides mostly restate docs. `unity-ops` is an over-engineered WIP tied to one person's machine.
- **C** is one large, form-heavy "proof before edit" contract for 2D UI work. A few ideas inside are sharp; the whole is too heavy to install.
- **D** is a "studio in a box" for casual iOS games built through MCP and paid generation APIs. It has the most explicit **game design** knowledge (economy, juice, card-game rules, mechanic scoping) and is otherwise the furthest from the owner's toolchain.

### Standout candidates (proposed)

1. **A `unity-play-harness`** (entry A1): GameProbe, named situations that wait on a readiness *set*, journey tests, and "feel complaint → repeatable test". Nothing in the baseline or the fork does this; it is the best game-dev idea in the four sources.
2. **A `unity-profiling`** (A3): frame windows (median/p95/worst), counters listed rather than recalled, work counters (scheduled/completed/discarded), refusal to compare across instruments. It fills gap #6 with method rather than recipes.
3. **A `unity-game-brief`** (A2) and **D's mechanic-scoping gate** (D1): a brief-first, measure-the-make-or-break-property-first kickoff for a game or a feature. They compete for one job with the fork's `prototype`/`unity-prototyping`.
4. **B Tier 1 correctness skills** (B3), above all `unity-async-patterns` (gap #5) and `unity-input-correctness` (gap #2): small descriptions and the right format. Accuracy needs checking before any copy.
5. **Game-design idea material** to adapt into a Unity pack "game design" reference rather than install as is: D's game-feel combat stack (D3), card-game rules (D4), grid single-source-of-truth (D5) and economy model (D2); B's Tier 3 design-intent skills (B5); C's state-step guard (C3).

### Biggest open questions

1. **Does the Unity pack want game *design* material at all**, or only engineering discipline? The fork's Unity skills are all engineering. The richest new material here (A1, A2, D1-D5, B5) is design or production method. If yes, as a few model-invoked skills, or as one router plus references (A's own shape)?
2. **Which execution surface is assumed?** The fork drives Unity through the `unity` CLI and `com.unity.pipeline`. A matches that. D assumes CoplayDev MCP for Unity, C assumes "Unity MCP" or file inspection, and B's guides assume a human at the Editor. Anything taken from B, C or D needs its Editor-driving steps rewritten.
3. **A's debugging and verification material vs the fork's.** A's `unity-debug` overlaps the fork's `unity-debugging`/`unity-verification` heavily but adds traps the fork may lack (A4). Merge into the fork's skills, or leave them?
4. **Accuracy budget.** B's own audit found wrong or misleading lines, and they were still present at HEAD. D states uncited industry numbers as fact. Any adopted text needs the fork's "sandbox-check before stating a mechanic" pass.
5. **Mobile and shipping scope.** A and D carry substantial Android/iOS device, release and store material that neither the baseline nor the fork covers. Is mobile shipping in the owner's scope?

---

## A: `tipoLi5890/unity-dev-skills`

Plugin `unity-dev` 0.18.0, MIT. 36 skills, all model-invoked; descriptions are long (~650-725 characters each, ~170 tokens). Layout rule: "`SKILL.md` is a router with a symptom table; `reference/` holds the depth it names; `resources/`, `scripts/` and `templates/` hold what you run or copy" ([A CHANGELOG 0.15.0](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/CHANGELOG.md)). Its 36 skills do not cite the baseline, and it states "Skills route to each other, never out of the repo" (same). That 22 of them (A10) match baseline topics is *inference* from the names and descriptions; whether A derived from the baseline is unknown.

Quality signals: claims are concrete and often measured, and the scripts encode them as gates (e.g. the 0.18.0 entry reports exact before/after numbers on 21 sprite sheets). Several commands assume macOS/BSD tools (`sed -i ''` in [unity-debug L137-L138](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-debug/SKILL.md#L137-L138); zsh quoting notes in `unity-game-ui`). The owner is on Windows, so those need porting.

### A1. `unity-play-harness`

- **What it is**: Design the game so an agent can drive it and read it. Four parts, each with a "done when" check ([SKILL.md](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-play-harness/SKILL.md)):
  - a **GameProbe**: one line of JSON state (`state`, `pos`, `ready{}`, `allReady`, counts, custom values), readable from `unity command eval`, a project command, `Editor.log` or a PlayMode test;
  - **Situations**: named moments that boot straight into a scene state and wait on a **readiness set** with a timeout that names the missing members ("Readiness is a set, not a flag", [L36](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-play-harness/SKILL.md#L36));
  - **journey tests** that sample the probe into `timeline.jsonl` and assert invariants;
  - **complaint → test**: a five-question method that turns "it comes in too fast" into a situation, a sampled quantity, a sourced threshold, a before/after table, and a closing question to the human ([reference/complaint-to-test.md](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-play-harness/reference/complaint-to-test.md)).

  Ships `GameProbe.cs` (507 lines), `Situations.cs`, `JourneyRecorder.cs`, `ProbeCommands.cs`, two templates and two Python report scripts.
- **Kind**: skill (+ C# resources, Python scripts)
- **Proposed address**: Unity pack model-invoked
- **Why it could fit**:
  - It fills the gap between the fork's `unity-debugging` (how to run a loop) and real game work: the game itself must expose state and reachable moments.
  - The discipline matches the fork's style. Examples: "The probe reads. It never writes"; "Assert the sample count first" ([L117](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-play-harness/SKILL.md#L117)); "The human keeps the feel verdict" ([L121](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-play-harness/SKILL.md#L121)).
  - Its Unity claims agree with the fork's research. "`WaitForEndOfFrame` never resumes in batch mode" ([L113](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-play-harness/SKILL.md#L113)) is independently stated by B's `unity-async-patterns` §"WaitForEndOfFrame in Batch Mode". The resources reset their statics from `SubsystemRegistration` for domain-reload-off ([GameProbe.cs L235](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-play-harness/resources/GameProbe.cs#L235)), as the fork's `unity-code-lifecycle` requires.
- **Why it might not**:
  - It is opinionated about game architecture (the probe's `state` must come from the game's own state machine).
  - The C# needs a review against the fork's lifecycle rules (6.5+ `[AutoStaticsCleanup]`), and its routes point at A's sibling skills (`unity-debug`, `unity-profiling`, `unity-game-brief`).
  - ~175-token description.
- **Copy / adapt / idea-only**: **Adapt.** Keep the method and the C#. Change:
  - re-point the routes to fork skills (`unity-debugging` for run mechanics, `unity-testing` for PlayMode tests);
  - port the Python scripts' invocation for Windows;
  - shorten the description.

  It cannot be copied directly because its scope table routes into A's sibling skills, which would not be installed.
- **Overlap**:
  - Fork `unity-debugging` (Play loop, `wait_for` on frame count) and `unity-testing` (PlayMode tests). The probe/situation/journey layer is new.
  - Baseline: none. Unity's Play-mode verification loop drives the Editor but does not make the game observable (baseline §2.1).
  - Gap #6 adjacent.
- **Idle context cost**: ~175 tokens as published; a rewrite could reach ~70.
- **Recommendation (proposed)**: **Adopt-adapted, high priority.** The single best candidate in this ledger.

### A2. `unity-game-brief`

- **What it is**: "The first hour of a game or a new feature, before any Unity work" ([SKILL.md](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-game-brief/SKILL.md)):
  - §1 five questions, one at a time, rewritten as sentences with numbers;
  - §2 lock the look (palette roles, contrast ratio, three silhouettes, camera, one anchor image) in at most 2 correction rounds;
  - §3 an architecture proposal **derived** from constraints, each row naming "Forced decision / Rules out" ("Derive, never prefer", [L178](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-game-brief/SKILL.md#L178)), with a simulation/presentation split where the rules assembly sets `noEngineReferences: true` ([L96](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-game-brief/SKILL.md#L96));
  - §4 six invariant shapes (ready together, never, always within, reachable, ordering, budget), each an ID plus a test;
  - §5 build ONE interaction the human can play this session;
  - §6 a role contract (the human owns look, feel, priority and done).

  Ships a compiling two-assembly skeleton with tests and three templates.
- **Kind**: skill (+ C# skeleton, templates)
- **Proposed address**: Unity pack user-invoked (it is a session-long workflow, which the map says should be gated)
- **Why it could fit**:
  - It is a game-dev counterpart to the fork's `grill-with-docs` → `to-spec` flow: it ends in "a human playing something, not reading something".
  - The invariant shapes and "no number, no invariant" rule tie into A1 and the fork's `tdd`/`unity-testing`.
  - The sim/presentation split with an engine-free assembly is the same seam the fork's `unity-testing` (humble MonoBehaviour) and `unity-assemblies` argue for.
- **Why it might not**:
  - It overlaps the fork's flow skills (`grilling`, `to-spec`, `prototype`) and D's director gate (D1); three kickoff flows would compete.
  - §2 routes art generation to A's `codex-visual`.
  - The worked example (a "courier run") is one game shape.
- **Copy / adapt / idea-only**: **Adapt.**
  - Make it user-invoked.
  - Route questioning to the fork's `grilling`, art to "the owner's art process", and assemblies to `unity-assemblies`.
  - Keep §3 (derived proposal table), §4 (invariant shapes) and §5 (first-interaction rules) nearly verbatim.

  It cannot be copied because of its sibling routes and its `codex-visual` dependency.
- **Overlap**:
  - Fork: `prototype`/`unity-prototyping`, `to-spec`, `grilling`.
  - D1 (`unity-game-director` Step 2.5) is the same idea, puzzle-flavoured.
  - Baseline `new-unity-project` asks concept/platform/monetization questions (baseline §2), but creates a project rather than a brief. Partial at most.
- **Idle context cost**: 0 if user-invoked (~175 as published).
- **Recommendation (proposed)**: **Adopt-adapted, user-invoked.** Decide together with D1 in a "game kickoff" theme.

### A3. `unity-profiling`

- **What it is**: Measure a slow or uneven frame as comparable numbers ([SKILL.md](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-profiling/SKILL.md)):
  - list the build's `ProfilerRecorder` counters, never recall them, because "a wrong name produces a recorder that reads `0`" ([L116](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-profiling/SKILL.md#L116));
  - sample 90-frame windows after 30 warm-up frames into a greppable `[PERF]` line and JSONL;
  - change one thing; compare three windows a side ([L128](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-profiling/SKILL.md#L128));
  - add work counters (scheduled/completed/discarded) for streaming and pooling;
  - "A driven run is not a hardware benchmark", with a compare script that refuses to subtract across instruments ([L23](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-profiling/SKILL.md#L23)).

  Ships `CounterCatalog.cs`, `FrameSampler.cs`, `WorkCounters.cs`, `ProfilerRawCapture.cs` and `compare_windows.py`.
- **Kind**: skill (+ C# resources, Python script)
- **Proposed address**: Unity pack model-invoked
- **Why it could fit**:
  - It fills baseline gap #6 with method rather than optimization tips.
  - It is the Unity row that pstack's `benchmark-checklist` entry asks for ([pstack ledger #9](pstack.md): "the 'tuned' question needs Player builds... which belong in the Unity pack").
  - "Check whether the candidate is faster because it does less" ([L134](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-profiling/SKILL.md#L134)) is a rare, valuable rule.
- **Why it might not**:
  - It routes "where the time goes" rows to ~10 A siblings (URP, atlas, audio, web, android).
  - The fork's `unity-debugging` already has "baseline-first performance and `ProfilerRecorder`" (fork ledger), so part of it is a merge, not an addition.
- **Copy / adapt / idea-only**: **Adapt.**
  - Keep the loop, the discipline list and the C#.
  - Replace the sibling routes with pointers to the baseline's `optimize-*` skills where they exist.
  - Decide whether it stands alone or merges into the fork's `unity-debugging` performance section.
- **Overlap**:
  - Fork `unity-debugging` (performance baseline), pstack `benchmark-checklist`.
  - Baseline: `optimize-audio`, `optimize-text-mesh-pro` and `optimize-web` cover specific assets, not frame measurement (baseline §2, gap #6).
  - B `unity-performance` (B2) is a docs digest of the same area.
- **Idle context cost**: ~175 tokens as published.
- **Recommendation (proposed)**: **Adopt-adapted.** High priority if the owner wants perf work in the pack.

### A4. `unity-debug`

- **What it is**: Verify and diagnose a game the agent cannot see. The core rule is "A number is worthless until you know the run that produced it happened" ([SKILL.md](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-debug/SKILL.md)). It defines four loops (live Editor, log, CLI, visual), with eight references (harness trust, test verdicts, CLI harness, editor control, visual checks, motion and timing, log triage, Unity gotchas). Traps it states:
  - `Assert.Inconclusive` leaves `failed="0"` ([L90](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-debug/SKILL.md#L90));
  - piping a test driver into `tail` hides its exit code ([L88](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-debug/SKILL.md#L88));
  - PlayerPrefs survive between PlayMode runs ([L93](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-debug/SKILL.md#L93));
  - the test framework flips `runInBackground` to 1 in `ProjectSettings.asset` and does not restore it, so restore that one line and never the whole file ([L126-L138](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-debug/SKILL.md#L126-L138));
  - a crashed run leaves `InitTestScene*.unity` and `mono_crash.*` files.
- **Kind**: skill (+ `DevDebug.cs`)
- **Proposed address**: none as a skill; mine for the fork's Unity skills
- **Why it could fit**: The listed traps are the kind the fork's `unity-verification` collects ("exit codes lie"). Each is a one-line addition.
- **Why it might not**:
  - It largely duplicates the fork's `unity-verification` and `unity-debugging`, and partially the baseline's `unity-cli` Play-mode loop (baseline §3).
  - Two Unity debugging skills would collide on triggers (*inference*).
  - The `sed -i ''` fix is macOS-only.
- **Copy / adapt / idea-only**: **Idea-only.** Check each trap against the fork's research and sandbox. Add the ones not already there (`runInBackground` flip, `Inconclusive` reading, PlayerPrefs reset, crash leftovers, the pipe-exit trap) to the fork's `unity-verification` READING-RESULTS or `unity-debugging`.
- **Overlap**: Fork `unity-verification`, `unity-debugging` (high). Baseline `unity-cli` (partial). D `unity-debug-profiler`.
- **Idle context cost**: ~170 tokens if installed (not proposed).
- **Recommendation (proposed)**: **Reject as a skill; harvest the traps** into the fork's Unity skills after verification.

### A5. `unity-device-testing`

- **What it is**: Acceptance tests on a real Android or iOS device from a terminal ([SKILL.md](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-device-testing/SKILL.md)):
  - three parties (app, driver, human), any of which can fail ([L18](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-device-testing/SKILL.md#L18));
  - a probe scene logging one tagged line per state change;
  - `adb`/`devicectl` drivers with exit codes 0/2/3 (pass / app failed / harness failed);
  - a human protocol with physical steps detected from the device;
  - a pre-flight of "five things that look like bugs and are not": dozing screen, stale install, hardware held by another app, adb restarted by a headless build, history-reading state checks ([L39](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-device-testing/SKILL.md#L39)).
- **Kind**: skill (+ drivers, probe scene)
- **Proposed address**: Unity pack user-invoked (only where mobile is in scope)
- **Why it could fit**: Neither the baseline nor the fork covers device acceptance (gap list; fork `unity-debugging` covers "players, logs and Development Builds" only). The three-exit-code split extends the fork's "harness failure is not a verdict" idea.
- **Why it might not**: Only matters if the owner ships to phones. It is tied to A's probe design and to `adb`/`devicectl` specifics that age fast.
- **Copy / adapt / idea-only**: **Adapt if mobile is in scope**, otherwise idea-only. It cannot be copied directly because it routes to A's `unity-android-release`/`unity-ios-build`.
- **Overlap**: A1 (same probe idea in the Editor). D `unity-qa-release` (device-resolution checks, shallower).
- **Idle context cost**: 0 if user-invoked (~180 as published).
- **Recommendation (proposed)**: **Owner's call** on mobile scope (open question 5); adapt if yes.

### A6. Shipping: `unity-android-release`, `unity-ios-build`

- **What it is**:
  - [`unity-android-release`](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-android-release/SKILL.md): "build it, then prove it". It covers settings that are expensive to change later (IL2CPP+ARM64, locked package name, monotonic `versionCode`, keystore, the minSdk floor and 16 KB-page `targetSdk` ceiling), secrets on stdin, and a BuildScript plus driver that "refuse rather than warn" and read the artifact back with `aapt`/`apksigner`.
  - [`unity-ios-build`](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-ios-build/SKILL.md): headless iOS build, an unsigned compile gate, signing from what the Mac holds, `devicectl` install, the console as the only log, and native `.mm` plugin iteration.
- **Kind**: skills (+ build scripts, templates)
- **Proposed address**: Unity pack user-invoked (if mobile is in scope)
- **Why it could fit**: They fill gap #12 (build and player configuration, IL2CPP stripping) for two platforms with evidence-first verification. "Read the artifact back" matches the fork's verification stance.
- **Why it might not**: Platform-specific and fast-ageing. The iOS skill needs a Mac. Version facts such as "Unity 6000.4 would not take `minSdkVersion` below 25" ([L41](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-android-release/SKILL.md#L41)) need re-checking per editor.
- **Copy / adapt / idea-only**: **Idea-only unless mobile is in scope.** The transferable idea is "read the artifact back, refuse rather than warn". It could become one line in the fork's `unity-verification` player-build rung.
- **Overlap**:
  - Baseline: `optimize-web` covers web only. Its IL2CPP/stripping mentions are incidental (gap #12).
  - Fork `unity-verification` covers *running* a build.
  - D `unity-qa-release` (iOS/TestFlight/fastlane).
- **Idle context cost**: ~175 each as published.
- **Recommendation (proposed)**: **Owner's call** (mobile scope). Otherwise harvest the "read the artifact back" idea.

### A7. `unity-live-services`

- **What it is**: Provider-agnostic discipline for putting a game on a backend ([SKILL.md](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-live-services/SKILL.md)):
  - the environment name visible in every non-release build, and a release build that refuses to start against non-production ([L52-L57](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-live-services/SKILL.md#L52-L57));
  - where each credential may live;
  - "what the client is not allowed to be believed about" ([L74](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-live-services/SKILL.md#L74));
  - designing the offline path first ([L95](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-live-services/SKILL.md#L95));
  - idempotent grants; player-supplied API keys.
- **Kind**: skill
- **Proposed address**: Unity pack user-invoked, or idea-only into a general backend note
- **Why it could fit**: The baseline's `build-live-game` covers the UGS *API* (baseline §2). This covers the operational decisions that are painful to reverse, and most of it is provider-agnostic.
- **Why it might not**: The skill itself says "Provider-agnostic backend discipline... belongs to a backend skill that is not tied to a provider". The owner may never ship a live backend.
- **Copy / adapt / idea-only**: **Idea-only**, unless the owner builds online games. Its UGS Cloud Save access-class table belongs to the baseline's territory.
- **Overlap**: Baseline `build-live-game` (API layer, partial). D `unity-ios-secure-backend` (anti-cheat leaderboards).
- **Idle context cost**: ~180 as published.
- **Recommendation (proposed)**: **Idea-only.** Owner's call if online play enters scope.

### A8. `unity-new-project`

- **What it is**: Day-one decisions ([SKILL.md](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-new-project/SKILL.md)):
  - pin the editor;
  - `.meta`/LFS, proving the first binary commit used LFS;
  - UPM git dependencies "pinned to an annotated tag, never a branch" ([L67-L69](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-new-project/SKILL.md#L67-L69));
  - IL2CPP/ARM64, asmdef boundaries, a single input funnel;
  - "a template is not a working configuration" (a 6000.4 `universal-2d` template that does not compile).
- **Kind**: skill
- **Proposed address**: none (reject); harvest two ideas
- **Why it could fit**: UPM tag pinning is relevant to the owner's UPM package work (gap #11 adjacent).
- **Why it might not**: The baseline's `new-unity-project` (project, source control, packages) and `unity-cli` (`projects`, `vcs`) cover most of this (baseline §2). Asmdef boundaries are the fork's `unity-assemblies`.
- **Copy / adapt / idea-only**: **Idea-only**: UPM annotated-tag pinning and "prove the first LFS commit" could become lines in a UPM-authoring skill if one is written for gap #11.
- **Overlap**: Baseline `new-unity-project` (high), `unity-cli` (partial). Fork `unity-assemblies`. D `unity-project-setup`.
- **Idle context cost**: ~175 as published.
- **Recommendation (proposed)**: **Reject** (baseline). Harvest the tag-pinning rule.

### A9. `unity-game-ui`

- **What it is**: "START HERE for a UI request" ([SKILL.md](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-game-ui/SKILL.md)):
  - detect the UI system by scanning assets, not `manifest.json`;
  - route to uGUI or UI Toolkit, and own the runtime IMGUI HUD;
  - add game-UI design rules: type sized from viewing distance per role ([L144](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-game-ui/SKILL.md#L144)), contrast, HUD placement, "cut words, never shrink them";
  - "There is no automated Figma import in this toolchain" ([L57](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-game-ui/SKILL.md#L57)).
- **Kind**: skill
- **Proposed address**: none as a skill; idea-only
- **Why it could fit**: The viewing-distance type scale and readability rules are game-design knowledge the baseline's UI skills (framework mechanics) lack.
- **Why it might not**: The routing half duplicates the baseline's `ui` router ("Consult before writing any UI code", baseline §2), and two UI routers would fight (*inference*).
- **Copy / adapt / idea-only**: **Idea-only**: the readability rules could go into a game-UI design reference (see the cluster with B5 `unity-ui-patterns` and D `unity-ui-designer`).
- **Overlap**: Baseline `ui`, `ui-ugui`, `ui-uitk`, `ui-imgui` (high on the routing half). B `unity-ui`/`unity-ui-patterns`. D `unity-ui-designer`. C (UI owner proof).
- **Idle context cost**: ~180 as published.
- **Recommendation (proposed)**: **Reject as a skill**; keep the readability rules as idea material for a game-UI theme.

### A10. Baseline-covered feature skills (22, grouped)

- **What it is**: Skills whose topic is one the baseline already covers (baseline §2). All are well written, with symptom tables and scripts:

| A skill | Baseline counterpart |
|---|---|
| `unity-cli` | `unity-cli` |
| `unity-search` | `generate-editor-search-query` |
| `unity-ui-ugui`, `unity-ui-toolkit` | `ui-ugui`, `ui-uitk`, `ui-imgui` |
| `unity-2d-pixel-perfect` | `2d-pixel-perfect` |
| `unity-2d-sprites` | `sprite-editor` |
| `unity-sprite-atlas` | `manage-sprite-atlas` |
| `unity-tilemap` | `create-tile-palette-or-rule-tiles` |
| `unity-physics-3d` | `physics-3d-collision` |
| `unity-navigation` | `initialize-ai-navigation` |
| `unity-render-urp` | `urp-postprocessing`, `validate-urp-render-graph-renderer-feature`, `shader-graph-create-custom-node` |
| `unity-urp-migration` | `migrate-birp-to-urp` |
| `unity-audio` | `optimize-audio`, `audio-setup-mixers` |
| `unity-localization` | `localization`, `optimize-text-mesh-pro` |
| `unity-ugs` | `build-live-game` |
| `unity-iap`, `unity-monetization` | `implement-in-app-purchases` |
| `unity-ads-levelplay` | `levelplay-unity-integration` |
| `unity-multiplayer`, `unity-multiplayer-services` | `setup-multiplayer-services` |
| `unity-vivox` | `setup-vivox-voice-chat` |
| `unity-web-release` | `optimize-web` |

  Links: `https://github.com/tipoLi5890/unity-dev-skills/tree/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/<name>`.
- **Kind**: skills
- **Proposed address**: none
- **Why it could fit**: Some go deeper than the baseline (e.g. `unity-urp-migration`'s five gated phases "read back from the saved project"). The owner picks baseline skills one by one, so an A skill could replace a baseline skill the owner did not pick.
- **Why it might not**: The map says never duplicate the baseline. Each adds ~170 idle tokens, and installing both would collide on triggers.
- **Copy / adapt / idea-only**: Not proposed. If the owner prefers one of these over its baseline counterpart for a specific project, it is a per-project install of an unmodified A skill, not a collection piece. *Inference*: that would also need its sibling routes, since A's skills route only to each other.
- **Overlap**: Baseline (by definition).
- **Idle context cost**: ~170 each.
- **Recommendation (proposed)**: **Reject** (baseline covers them).

### A11. AI asset generation: `codex-visual`, `comfyui-asset-generation`, `unity-3d-models`, `unity-rigged-character`

- **What it is**:
  - [`codex-visual`](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/codex-visual/SKILL.md): 2D art through the `codex` CLI image model, held on-style by one art bible (`ART_DIRECTION.md`) and anchor images. "This skill decides no art" ([L21](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/codex-visual/SKILL.md#L21)). Grid-sheet sets, chroma key, and geometry gates that measure centre and size back from shipped files. The 0.18.0 changelog's rule is "position and size are never the model's job".
  - [`comfyui-asset-generation`](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/comfyui-asset-generation/SKILL.md): music, SFX and video through a self-hosted ComfyUI.
  - [`unity-3d-models`](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-3d-models/SKILL.md): decimate AI meshes before import (glTFast).
  - [`unity-rigged-character`](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/unity-rigged-character/SKILL.md): image-to-3D → Mixamo → Humanoid Avatar → Animator (FBX route, because glTFast cannot build an Avatar).
- **Kind**: skills (+ Python image scripts)
- **Proposed address**: none by default; owner's call
- **Why it could fit**: Solo game dev needs placeholder-to-real art. The art-bible-plus-anchor discipline and the "measure, don't trust the model" gates are transferable ideas. `unity-rigged-character` touches gap #1 (animation).
- **Why it might not**: Each depends on a specific external tool (codex image model, ComfyUI server, Tripo/Meshy/Mixamo). They are production pipelines, not Unity engineering, and they are heavy (`codex-visual` is 14 files and 1.4k lines of markdown).
- **Copy / adapt / idea-only**: **Idea-only**: the art bible plus anchor plus measured gate pattern. It recurs in D's art cluster (D6), so decide them together.
- **Overlap**: D `unity-art-direction`, `unity-asset-designer`, `unity-pixel-art`, `unity-3d-generator`, `unity-animation` (same job, different tools). Baseline: none.
- **Idle context cost**: ~165-180 each as published.
- **Recommendation (proposed)**: **Owner's call** in an "art pipeline" theme. Default reject; keep the ideas.

### A12. Mechanism: router-with-symptom-table layout, "Scope — what this skill does NOT do", and lint gates

- **What it is**:
  - Every A skill has a `## Scope — what this skill does NOT do` table that hands off to the right sibling, and a "Load what the situation needs" table pointing into `reference/`.
  - [`tools/check-consistency.py`](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/tools/check-consistency.py) fails CI when a skill routes outside the repo without a declared `COMPANIONS` entry.
  - [`tools/lint-skills.py`](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/tools/lint-skills.py) checks frontmatter, the name/dir match, size limits and that shipped scripts parse.
  - Codex manifests are generated from the Claude ones ([A README](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/README.md)).
- **Kind**: convention doc + CI-eval
- **Proposed address**: maintenance machinery (repo-level)
- **Why it could fit**:
  - A "declared external routes" check answers a real collection problem: core skills that point at pack skills (the fork's delta lines) must not dangle.
  - The negative-scope table is a trigger-collision mitigation.
- **Why it might not**: The fork already has `scripts/check.mjs` and the delta-line convention (fork ledger, mechanisms). The negative-scope table lengthens every body.
- **Copy / adapt / idea-only**: **Idea-only**: add a "routes resolve to installed or declared skills" check to whatever validator the collection adopts.
- **Overlap**: Fork `scripts/check.mjs`, Unity delta line pattern. Addy's eval machinery.
- **Idle context cost**: 0 (repo tooling).
- **Recommendation (proposed)**: **Idea-only**, for the maintenance theme.

---

## B: `Nice-Wolf-Studio/unity-claude-skills`

Plugin `unity` 1.4.0, MIT. 35 skills, all model-invoked, plus a WIP second plugin root `unity-ops/` with 2 of its 6 planned skills and a hook. The README states the skills "auto-invoke" and are based on "Unity 6.3 LTS (6000.3) official documentation as of March 2026" ([B README](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/README.md)). Descriptions are short (~250-380 characters, ~75 tokens).

Frontmatter uses a `globs:` field (e.g. [unity-3d-math](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-3d-math/SKILL.md)). Claude Code documents `paths:` for path-scoped rules, not `globs:` ([research/loading-mechanics.md](../loading-mechanics.md)), so *inference*: `globs:` is probably ignored and gives no scoping.

**Accuracy signals.** The repo's own overlap audit ([audit/2026-09-13-cli-overlap-audit.md](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/audit/2026-09-13-cli-overlap-audit.md)) flagged CONFUSES findings, filed as issues #4-#8 on 2026-09-14. At HEAD they are still present:

- `unity-physics` L257 "At least one dynamic (non-kinematic) Rigidbody is required for collision events" ([link](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-physics/SKILL.md#L257)). Issue #6 says "kinematic trigger pairs do fire OnTriggerEnter".
- `unity-packages-services` still says "Edit `Packages/manifest.json` directly" ([L40-L42](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-packages-services/SKILL.md#L40-L42)).
- `unity-testing` still teaches raw `Unity -runTests -batchmode` ([L395](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-testing/SKILL.md#L395)).

The scaffolds also show copy-paste habits:

- an empty `static void ResetStatics() { }` stub ([unity-game-loop L107](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-game-loop/SKILL.md#L107));
- `private async void Start()` ([L109](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-game-loop/SKILL.md#L109)) in a repo whose own `unity-async-patterns` has a pattern against `async void`.

### B1. Baseline- or fork-covered guides (11, grouped)

- **What it is**: Doc-digest "guide" skills: `unity-foundations`, `unity-scripting`, `unity-physics`, `unity-graphics`, `unity-ui`, `unity-audio`, `unity-2d`, `unity-ai-navigation`, `unity-xr`, `unity-testing`, `unity-packages-services`. Each has Core Concepts, Common Patterns, Anti-Patterns, an API table and references (README "What Each Skill Provides"). Links: `https://github.com/Nice-Wolf-Studio/unity-claude-skills/tree/a149d3e995420432f52b0899092daa4b069f441f/skills/<name>`.
- **Kind**: skills
- **Proposed address**: none
- **Why it could fit**: Cheap descriptions; `unity-xr` covers XR, which neither the baseline nor the fork has.
- **Why it might not**:
  - They restate Unity docs the model largely knows.
  - UI, 2D, audio, navigation, packages and graphics/URP are baseline topics (baseline §2). Testing is the fork's `unity-testing`, and B's version teaches the raw `-runTests` recipe its own audit rejected.
  - Two of the three accuracy findings above sit in this group.
- **Copy / adapt / idea-only**: None proposed. `unity-xr` is the only gap-filler, and only matters if the owner does XR.
- **Overlap**: Baseline §2 (UI, 2D, audio, navigation, packages, URP). Fork `unity-testing`, `unity-code-lifecycle`.
- **Idle context cost**: ~70-90 each.
- **Recommendation (proposed)**: **Reject.** `unity-xr` is the owner's call if XR enters scope.

### B2. Gap-area guides (9, grouped)

- **What it is**: Guide skills on topics in the baseline's gap list: `unity-animation` (Animator, blend trees, Timeline; gap #1), `unity-cinemachine` (Cinemachine 3.x; gap #1), `unity-input` (Input System; gap #2), `unity-lighting-vfx` (lighting, APV, VFX Graph; gap #8), `unity-ecs-dots` (Entities, Jobs, Burst; gap #7), `unity-multiplayer` (Netcode for GameObjects; gap #9), `unity-performance` (Profiler, Memory Profiler; gap #6), `unity-editor-tools` (inspectors, `EditorWindow`, `PropertyDrawer`; gap #14) and `unity-platforms` (build profiles, IL2CPP; gap #12). Each is ~430-500 lines plus references.
- **Kind**: skills
- **Proposed address**: Unity pack model-invoked, if any are wanted
- **Why it could fit**: They cover areas the baseline leaves empty, at ~70-80 idle tokens each. Cinemachine 3.x API naming is a classic place where models use stale 2.x names (*inference*).
- **Why it might not**:
  - They are doc restatement, not discipline: the fork's bar is "cited, sandbox-checked mechanics".
  - The repo's audit recommends amending `unity-editor-tools`: one line telling a connected agent to prefer `unity command eval` over menu items.
  - Version-bound to 6.3; accuracy unverified.
- **Copy / adapt / idea-only**: **Idea-only / owner's call per skill.** If the owner works heavily in one area (e.g. Input System or Cinemachine), a short correctness skill (B3 format) is likely more valuable than these digests (*inference*). Use these as source text for writing it.
- **Overlap**: A `unity-profiling` (A3) beats `unity-performance` on method. A `unity-rigged-character` and D `unity-animation` touch gap #1. B3 `unity-input-correctness` partners `unity-input`.
- **Idle context cost**: ~70-80 each.
- **Recommendation (proposed)**: **Owner's call per area.** Default idea-only.

### B3. Tier 1 correctness skills (5, grouped)

- **What it is**: Short PATTERN catalogues ("WHEN / WRONG (Claude default) / RIGHT / GOTCHA") targeting "wrong code that compiles and looks correct" (README "Correctness Skills"):

| Skill | Patterns (headings) | Gap / fork |
|---|---|---|
| [`unity-async-patterns`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-async-patterns/SKILL.md) | Awaitable double-await, missing `destroyCancellationToken`, thread context after `BackgroundThreadAsync`, coroutine error swallowing, `WaitForEndOfFrame` in batch mode, nested coroutine cancellation, `async void` vs `async Awaitable`, concurrent Awaitable races, Addressables handle leaks, UniTask vs Awaitable | gap #5 |
| [`unity-input-correctness`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-input-correctness/SKILL.md) | `triggered` vs `IsPressed` vs `WasPressedThisFrame`, action map switching, processor vs interaction, `InputValue` lifetime, PassThrough vs Value, enable scope, device prompts, local multiplayer devices, control scheme switching | gap #2 |
| [`unity-lifecycle`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-lifecycle/SKILL.md) | fake-null with `?.`/`??`, deferred `Destroy`, disabled component still gets `Awake`, `OnEnable`/`OnDisable` subscription, `OnValidate` editor-only, `[ExecuteAlways]`, `RuntimeInitializeOnLoadMethod` order, execution order, quit vs destroy, async + destruction | fork `unity-code-lifecycle` (partial: the fork covers statics/reload, not fake-null or destruction) |
| [`unity-3d-math`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-3d-math/SKILL.md) | `TransformPoint` vs `TransformDirection`, quaternion order, Euler lerp, `LookRotation` zero, float compare, `Vector3.Angle` sign, cross-product handedness, `ScreenToWorldPoint` z, `Plane.Raycast`, AABB `Bounds`, scale inheritance | gap #13 adjacent |
| [`unity-physics-queries`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-physics-queries/SKILL.md) | query selection, cast origin inside collider, hit ordering, NonAlloc counts, LayerMask bitshift, `QueryTriggerInteraction`, SphereCast radius, CapsuleCast points, backfaces | baseline `physics-3d-collision` (partial: collision triage, not query API) |

- **Kind**: skills
- **Proposed address**: Unity pack model-invoked (or folded as references behind the fork's `unity` router)
- **Why it could fit**:
  - Exactly the "compiles, looks right, is wrong" class an agent produces. Each is ~340-540 lines; descriptions ~80-95 tokens.
  - Async (gap #5) and Input System (gap #2) are named gaps.
  - The WRONG/RIGHT/GOTCHA shape is easy to verify one pattern at a time.
- **Why it might not**:
  - "WRONG (Claude default)" ([unity-lifecycle L24](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-lifecycle/SKILL.md#L24)) is asserted, not evidenced.
  - Some GOTCHAs need checking. The double-await fix recommends `Awaitable...AsTask()` ([unity-async-patterns L36-L37](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-async-patterns/SKILL.md#L36-L37)); whether Unity 6.3's `Awaitable` exposes `AsTask()` was not verified here.
  - Same repo whose audit findings went unfixed.
- **Copy / adapt / idea-only**: **Adapt** `unity-async-patterns` and `unity-input-correctness`:
  - verify each pattern in the fork's `unity-sandbox`;
  - drop the "Claude default" labels;
  - align statics guidance with the fork's `unity-code-lifecycle` (6.5+ `[AutoStaticsCleanup]`).

  For `unity-lifecycle`, merge its fake-null/destroy patterns into the fork's `unity-code-lifecycle` rather than add a second lifecycle skill. `unity-3d-math` and `unity-physics-queries` are idea-only / owner's call.

  They cannot be copied because the content is unverified and the fork's bar is sandbox-checked.
- **Overlap**: Fork `unity-code-lifecycle` (lifecycle), C's coordinate-space reference (3d-math), baseline `physics-3d-collision` (physics queries).
- **Idle context cost**: ~80-95 each.
- **Recommendation (proposed)**: **Adopt-adapted: `unity-async-patterns`, `unity-input-correctness`.** Merge `unity-lifecycle`'s non-statics patterns into the fork's lifecycle skill. Others are owner's call.

### B4. Tier 2 architecture decision skills (5, grouped)

- **What it is**: DECISION-format skills ("WHEN / DECISION → Options / SCAFFOLD / GOTCHA"), each ~320-400 lines:

| Skill | Patterns | Gap |
|---|---|---|
| [`unity-save-system`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-save-system/SKILL.md) | format selection, save DTOs, file location, PlayerPrefs scoping, versioning + sequential migrators on raw JSON, cloud save, auto-save | gap #10 |
| [`unity-scene-assets`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-scene-assets/SKILL.md) | additive scene architecture, Addressables vs Resources, group strategy, loading screens, asset lifecycle, Resources→Addressables checklist | gaps #3, #4 |
| [`unity-game-architecture`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-game-architecture/SKILL.md) | global service access (locator/singleton/DI), MonoBehaviour vs plain C#, composition, event architecture, bootstrap sequence | gap #13 |
| [`unity-state-machines`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-state-machines/SKILL.md) | selection, class FSM, HFSM, behaviour trees, stack machines, testing | game-dev |
| [`unity-data-driven`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-data-driven/SKILL.md) | config storage, SO inheritance vs composition, JSON pipeline, designer handoff, data versioning | gap #13 |

- **Kind**: skills
- **Proposed address**: Unity pack model-invoked (save, scene-assets), or a Unity pack reference reached through the router
- **Why it could fit**:
  - Save systems and scene/asset loading are named gaps (#10, #3, #4) and recurring game-dev decisions.
  - The save versioning pattern ([unity-save-system L204-L265](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-save-system/SKILL.md#L204-L265)) — migrate raw JSON step by step, keep test fixtures per version — is sound and connects to the fork's `unity-serialization` expand/contract thinking.
  - Architecture choices are framed as trade-offs, not one answer.
- **Why it might not**:
  - Architecture defaults are taste. The owner's own conventions (and the fork's `codebase-design`) should win.
  - Scaffolds need review (copy-paste habits noted above). The migration scaffold pulls in Newtonsoft without saying it is a package dependency.
- **Copy / adapt / idea-only**: **Adapt `unity-save-system` and `unity-scene-assets`** after verification; route versioning to the fork's `unity-serialization` vocabulary. The other three are **idea-only** inputs for a C# style / architecture theme (gap #13). They cannot be copied because their scaffolds need correctness review and the owner's own conventions.
- **Overlap**: Fork `codebase-design`, `unity-serialization`. D `unity-gameplay-systems` ("prefer full runtime construction"). A2 sim/presentation split.
- **Idle context cost**: ~70-85 each.
- **Recommendation (proposed)**: **Adopt-adapted: save-system, scene-assets.** The architecture trio is idea-only.

### B5. Tier 3 design-intent skills (5, grouped)

- **What it is**: "DESIGN INTENT / WRONG / RIGHT / SCAFFOLD / DESIGN HOOK" skills, framed as translating "what the game SHOULD feel like into how it SHOULD be built" (README "Domain Translation Skills"). Large: 618-1,271 lines each.
  - [`unity-game-loop`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-game-loop/SKILL.md): core loop phases, session lifecycle, win/lose architecture, meta loop hooks, tunable difficulty, pacing. Its premise: Claude builds "features in isolation without a unifying loop structure" (L17).
  - [`unity-npc-behavior`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-npc-behavior/SKILL.md): pluggable perception senses, decision layers, action pipeline, factions, memory and forgetting, squads.
  - [`unity-level-design`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-level-design/SKILL.md): trigger/event architecture, encounter contracts, checkpoints, cinematics, environmental storytelling hooks, streaming seams.
  - [`unity-procedural-gen`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-procedural-gen/SKILL.md): noise, grids, dungeons, seeds and reproducibility, content budgets, runtime vs baked.
  - [`unity-ui-patterns`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/skills/unity-ui-patterns/SKILL.md): screen flow, View/ViewModel, HUD architecture, feedback/juice, dynamic lists, transitions (UI Toolkit only).
- **Kind**: skills
- **Proposed address**: Unity pack, as user-invoked references or a "game design" reference set behind a router, not as model-invoked skills
- **Why it could fit**: This is the game-dev material the ticket asks for. Seeds and reproducibility, designer tuning surfaces, and perception separated from decision are ideas a solo dev reuses across games.
- **Why it might not**:
  - Very long, scaffold-heavy, and opinionated (e.g. phase types resolved by `Type.GetType` from an SO string field).
  - Scaffold quality is uneven (the empty `ResetStatics` and `async void Start` above).
  - Model-invoked with `.cs` triggers, they would fire on unrelated C# edits (*inference*).
- **Copy / adapt / idea-only**: **Idea-only.** Mine the pattern lists (headings) as a checklist of game-system concerns; rewrite any adopted pattern in the owner's architecture. The scaffolds cannot be copied because they encode a particular architecture and have the defects noted.
- **Overlap**: D `unity-gameplay-systems`, `unity-game-economy` (game loop, difficulty); A2 (seeded generation, invariants); A1 (situations as level moments).
- **Idle context cost**: ~80-85 each as published; 0 if user-invoked.
- **Recommendation (proposed)**: **Idea-only.** Feed a "game design reference" theme together with D2-D5 and C3.

### B6. `unity-ops` skills: `unity-surface-preflight`, `unity-cli-contract`

- **What it is**: WIP skills of a second plugin, designed in a 1,115-line DESIGN.md with five review revisions and a 5,809-line PLAN.md ([unity-ops/DESIGN.md](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/unity-ops/DESIGN.md)).
  - [`unity-surface-preflight`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/unity-ops/skills/unity-surface-preflight/SKILL.md): "'NO EDITOR' IS A CONCLUSION, NOT A COMMAND OUTPUT". It resolves live / batch / Safe Mode / unknown from probe evidence before any scene/prefab/asset edit, and notes that a sandboxed agent shell can report "no instances" against a running Editor.
  - [`unity-cli-contract`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/unity-ops/skills/unity-cli-contract/SKILL.md): installed CLI docs, GitHub docs and the binary "drift in both directions", so probe `--help` first; a mandatory env envelope; parse stdout `success`/`errors[0].code`.
- **Kind**: skills
- **Proposed address**: none; idea-only
- **Why it could fit**:
  - Both ideas are real and match the fork's own: `unity-verification` treats the CLI as beta and defers to `unity skill show`.
  - The sandbox false negative on "no instances" is a trap the baseline's `unity-cli` lacks in its installed copy (per B's own audit).
- **Why it might not**:
  - Tied to one machine and person: paths like `~/Dev/Unity/ai_test` ([preflight L51-L52](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/unity-ops/skills/unity-surface-preflight/SKILL.md#L51-L52)), `~/.zshrc`, a required `wolf-core:wolf-verification` skill (L81).
  - It chains to four skills that do not exist at this SHA.
  - A "known version gaps" table its own text says to never cite.
  - 40 open issues, many reporting its own instruments broken.
- **Copy / adapt / idea-only**: **Idea-only.** Check whether the fork's `unity-verification` ENVIRONMENTS.md already covers "a sandboxed shell cannot see a running Editor" and "probe `--help`, never trust docs"; add a line if not.
- **Overlap**: Fork `unity-verification` (high on intent), baseline `unity-cli` (Safe Mode, editor targeting).
- **Idle context cost**: ~95 each as published.
- **Recommendation (proposed)**: **Reject**; harvest the sandbox-false-negative rule.

### B7. Mechanism: `unity-ops-guard` shadow-mode PreToolUse hook, restatement budget, overlap audit

- **What it is**:
  - [`unity-ops/hooks/unity-ops-guard`](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/unity-ops/hooks/unity-ops-guard) (382 lines of bash) is wired by [hooks.json](https://github.com/Nice-Wolf-Studio/unity-claude-skills/blob/a149d3e995420432f52b0899092daa4b069f441f/unity-ops/hooks/hooks.json) on `Bash|Write|Edit|MultiEdit|NotebookEdit|Skill`. "v1 NEVER denies. It logs, and for three patterns emits one advisory sentence. Promotion to a hard gate = replacing one pattern's emit_advisory with emit_deny" (L2-L4). It records which skill was invoked, as a trigger-measurement signal.
  - DESIGN.md sets a **restatement budget**: "≤25% of a skill's body rows may restate the installed dependency, and every restating row must carry the enforcement it adds" (Revision 2, B4).
  - The audit file grades each of its 35 skills against the official baseline as CONFUSES / NEUTRAL / keep.
- **Kind**: hook + convention doc + CI-eval
- **Proposed address**: maintenance machinery; possibly Unity pack always-on (hook) later
- **Why it could fit**:
  - "Shadow first, promote per pattern on evidence" is a sound way to introduce guard hooks without blocking work.
  - Logging `Skill` tool calls gives a cheap trigger-rate measurement, which the maintenance theme needs (compare superpowers' triggering tests, Addy's routing evals).
  - The restatement budget formalizes the map's "never duplicate the baseline".
- **Why it might not**: The hook itself is fragile by its own issue tracker (#15-#18, #38) and assumes `python3` and bash 3.2 quirks. Its always-on cost is hook output only (loading-mechanics ticket), but it runs on every matching tool call.
- **Copy / adapt / idea-only**: **Idea-only**: (1) shadow-mode-then-promote for any collection hook; (2) a `Skill`-invocation logger as a trigger metric; (3) the restatement budget as a rule when adapting skills that overlap the baseline.
- **Overlap**: Superpowers ledger (skill-triggering tests), Addy ledger (routing evals), fork `git-guardrails-claude-code`.
- **Idle context cost**: 0 descriptions; output-only when it advises.
- **Recommendation (proposed)**: **Idea-only**, for the maintenance theme.

---

## C: `AUN-PN/unity-agent-workflows`

One skill, MIT, npm installer (`npx unity-agent-workflows`), Codex plugin manifests. Its core rule is "No proof, no edit." ([C README](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/README.md)). `SKILL.md` is 249 lines plus 21 references (~2.2k lines). It is written for Codex first (`$unity-agent-workflows` invocation, Codex JSONL session parsing).

### C1. `unity-agent-workflows` (the skill as a whole)

- **What it is**: An "AI contract for Unity work" ([SKILL.md](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/SKILL.md)):
  - a 10-step core loop and a 20-row Task Gate;
  - a 15-row required-references table;
  - proof gates: an owner chain `visible object -> scene/prefab/reference -> script/component -> mutating method -> serialized/runtime override`, a "Runtime Visible Output Hard Stop", and "Runtime numeric proof" with IoU thresholds;
  - a sub-agent permission guard, a 25-field Routing Card and a closeout schema.
- **Kind**: skill
- **Proposed address**: none as a whole
- **Why it could fit**: It targets real agent failures in Unity UI work: editing the nearest-named script, trusting scene YAML that runtime code overwrites, picking the wrong duplicate object.
- **Why it might not**:
  - The description is ~820 characters (~205 tokens) and model-invoked.
  - The body is form-filling heavy (Routing Card, numeric proof lists). Its thresholds are arbitrary: "spatial IoU < 0.95 for UI / < 0.85 for HUD is FAIL" ([L138](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/SKILL.md#L138)) has no stated source.
  - The latest commit adds "physics math benchmark and advanced kinematics formulas" to a workflow skill (git log), a sign of scope creep (*inference*).
- **Copy / adapt / idea-only**: **Idea-only.** C2-C5 extract the parts worth keeping. The whole cannot be copied: it is one monolith whose ceremony conflicts with the map's idle-context budget and the fork's leaner verification ladder.
- **Overlap**: Fork `diagnosing-bugs`, `unity-debugging`, `unity-verification`, `unity-serialization`. Pstack `blast-radius`. A1 (runtime state as evidence).
- **Idle context cost**: ~205 tokens.
- **Recommendation (proposed)**: **Reject as a whole**; harvest C2-C5.

### C2. Idea: visible-owner proof, screenshot-text owner, shared-caller blast radius

- **What it is**: Three gates from C1's references:
  - **Owner chain** before any visible/runtime edit: find the visible object's real creator and the writer that sets it at runtime, not the scene YAML value ([references/runtime-owner-proof.md](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/references/runtime-owner-proof.md)).
  - **Screenshot text owner**: search the exact visible text or localization key, then prove its creator and refresh writer ([references/screenshot-text-owner.md](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/references/screenshot-text-owner.md)).
  - **Shared caller blast radius**: before changing a shared factory/helper for one surface, list all callers; if any sit outside the target, add a surface-local path instead ([references/shared-caller-blast-radius.md](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/references/shared-caller-blast-radius.md)).
  - **Anti-anchoring**: when feature name, asset and visible object disagree, list competing owners and reject each with file evidence ([references/visible-object-identity.md](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/references/visible-object-identity.md)).
- **Kind**: convention doc (idea)
- **Proposed address**: a few lines in the fork's `unity-debugging` symptom table, or a Unity row in an adapted `blast-radius`
- **Why it could fit**: "Scene YAML is not runtime truth until startup/layout/animation writers are checked" is a Unity-specific diagnosis trap the fork's `unity-debugging` bug-class table could carry. The shared-caller rule is pstack `blast-radius` with a Unity UI face.
- **Why it might not**: Most of it is general debugging discipline the fork's `diagnosing-bugs` already teaches.
- **Copy / adapt / idea-only**: **Idea-only**: one or two lines each, written in the fork's voice.
- **Overlap**: Pstack `blast-radius` (high), fork `diagnosing-bugs`, `unity-debugging`.
- **Idle context cost**: 0 (lines inside existing skills).
- **Recommendation (proposed)**: **Idea-only**: add "runtime writer beats serialized value" and "list callers before changing a shared helper" where the fork's Unity diagnosis lives.

### C3. Idea: state-step guard (`shown != clicked != opened != selected != applied != completed != persisted`)

- **What it is**: For tutorials, onboarding, objectives, unlocks and guided flows, "Never collapse these states into one boolean" ([references/content-and-systems.md L69](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/references/content-and-systems.md#L69)). Prove each step separately, including the old-save path, the already-done path, the reset/new-install path and the analytics-only path. The same file has a **data-first rule**: add content as definitions/config first, and C# only when a definition needs a handler that does not exist.
- **Kind**: convention doc (game-dev idea)
- **Proposed address**: Unity pack reference (game design / gameplay systems), reached through the router
- **Why it could fit**: A precise, reusable game-dev bug class: "tutorial step marked done when the panel opened" and "unlock lost on old saves". It pairs with A2's invariant shapes ("Ordering") and B4's save versioning.
- **Why it might not**: Small. It belongs inside a larger game-systems reference, not alone.
- **Copy / adapt / idea-only**: **Adapt** the seven-state line and the proof checklist into whichever game-systems reference the owner adopts.
- **Overlap**: A2 §4 (ordering invariants), B5 `unity-game-loop` (session lifecycle), B4 `unity-save-system`.
- **Idle context cost**: 0 as a reference.
- **Recommendation (proposed)**: **Adopt-adapted as reference text.**

### C4. Mechanism: Bee `.rsp` + bundled Roslyn compile check outside the Editor

- **What it is**: A compile rung that needs no Editor. Reuse Unity's generated Bee `.rsp` response files for the touched asmdef and compile with Unity-bundled Roslyn. If the `.rsp` files are stale after moves, copy them to `Temp/`, rewrite only the stale paths, and report that Unity must regenerate them ([references/unity-validation.md L10-L14](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/references/unity-validation.md#L10-L14) and "Roslyn/Bee Pattern", [L56-L67](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/references/unity-validation.md#L56-L67)).
- **Kind**: script (technique)
- **Proposed address**: a candidate line or helper in the fork's `unity-verification` compile rung
- **Why it could fit**: The fork's ladder has a "compile" rung that needs a connected or headless Editor. A Roslyn-over-`.rsp` check could give a fast compile signal when the Editor is busy or locked — exactly the case the fork's skill handles by asking (*inference*).
- **Why it might not**: Unverified here. `.rsp` paths are machine- and version-specific, and a stale `.rsp` silently checks the wrong file set. Analyzers and source generators (which the fork's `unity-code-lifecycle` depends on) may behave differently (*inference*).
- **Copy / adapt / idea-only**: **Idea-only until sandbox-tested** in the fork's `unity-sandbox`.
- **Overlap**: Fork `unity-verification` (compile rung), baseline `unity-cli` (`unity recompile`).
- **Idle context cost**: 0.
- **Recommendation (proposed)**: **Owner's call**: worth a sandbox experiment, not an adoption.

### C5. Mechanisms: `UNITY_STRUCTURE*.md` maps ("Teach"), trigger evals, semantic-contract check, session mining

- **What it is**:
  - **Teach**: create a short `UNITY_STRUCTURE.md` plus focused maps (`.ui`, `.runtime`, `.content`, `.assemblies`, `.cleanup`), then read only the matching map per task (SKILL.md "Teach"; [references/project-structure-discovery.md](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/references/project-structure-discovery.md)).
  - [`evals/skill-trigger-cases.json`](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/evals/skill-trigger-cases.json): prompt → `expected_skill` cases.
  - [`evals/skill-semantic-contract.json`](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/evals/skill-semantic-contract.json) with [`scripts/check_skill_semantics.js`](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/scripts/check_skill_semantics.js): "checks meaning and intent by concept coverage, not full text equality". This guards against compressing a skill and losing a rule.
  - [`references/session-mining.md`](https://github.com/AUN-PN/unity-agent-workflows/blob/4193d84176e80fc38ee0252b0fa327119ef96d01/references/session-mining.md): turn past sessions into durable rules; never include raw prompts or secrets.
- **Kind**: convention doc + CI-eval
- **Proposed address**: maintenance machinery (evals, semantic check); the fork's Unity config for maps
- **Why it could fit**:
  - The semantic-contract check is a cheap guard for the collection's own edits when adapting and shortening skills (required concepts must survive).
  - Focused per-area maps fit the "idle context is a budget" rule.
- **Why it might not**:
  - The fork already has a Unity config file (`docs/agents/unity.md`) and domain docs, so a third map convention would compete.
  - Session mining overlaps the fork's `retro`.
- **Copy / adapt / idea-only**: **Idea-only**: the semantic-contract (concept coverage) check for the maintenance theme.
- **Overlap**: Fork Unity config and `domain-modeling`, fork `retro`, Addy trigger evals, superpowers triggering tests.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: **Idea-only**, maintenance theme.

---

## D: `tea-x-random/unity-game-skills`

27 skills, MIT, aimed at "casual / hyper-casual iOS games on Unity 6 (6000.x)" ([D README](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/README.md)). Editor work goes through CoplayDev MCP for Unity; asset generation through Tripo, Gemini, PixelLab and ElevenLabs API keys ([.env.example](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/.env.example)). Descriptions are long (~590-770 characters, ~160-195 tokens).

Quality signals:

- Much "field notes & lessons" text from real projects ("Lane Duel", a "Cube" puzzle), which makes it practical.
- Industry numbers are stated without sources. Example: "Only **~1.8% of F2P players ever make an IAP**" ([unity-game-economy L18](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-game-economy/SKILL.md#L18)).
- Other parts cite design sources, e.g. the director's Step 2.5 links Rami Ismail and others.
- Stale since 2026-07-10.

### D1. `unity-game-director`, Step 2.5 "Scope a novel or ambiguous mechanic BEFORE building it"

- **What it is**: The repo's entry router (Unity version detection, MCP bring-up, phase DAG, verification, "ledger") ([SKILL.md](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-game-director/SKILL.md)). Its transferable part is **Step 2.5** ([L103-L119](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-game-director/SKILL.md#L103-L119)):
  1. write a one-paragraph spec plus a **worked example** and get it agreed;
  2. **name the make-or-break property and measure it with a throwaway prototype first** (for a puzzle: the solution count, via a backtracking solver capped at 2);
  3. decompose into independently verifiable pure-logic pieces;
  4. surface rule forks to the user with measured trade-offs.

  The motivating failure: a rule set with "~14,000 solutions — only *measured* after building". Its doctrine also says "Ship a verified playable slice early, not documents" and "Edit Unity through the Editor, not raw YAML" (L10-L16).
- **Kind**: skill (router) with an embedded workflow
- **Proposed address**: the Step 2.5 gate as Unity pack user-invoked content (with A2), or as a line in the fork's `prototype`/`unity-prototyping`
- **Why it could fit**: "Name the one property that decides whether the mechanic works, and measure it in an engine-free test before any art" is a strong, general game-dev rule. It complements the fork's `unity-prototyping`, which covers *how* to prototype in Unity but not *what* to measure.
- **Why it might not**: The rest of the director is MCP-, iOS- and generator-specific, and as a default-for-any-Unity-work model-invoked router ("Use by default for any Unity work") it would collide with the fork's `unity` router.
- **Copy / adapt / idea-only**: **Adapt Step 2.5 only**, as a section of A2 or of the fork's `unity-prototyping`. Reject the director itself.
- **Overlap**: A2 (same kickoff job), fork `prototype`/`unity-prototyping`/`grilling`, baseline `new-unity-project` (concept questions).
- **Idle context cost**: ~190 as published; 0 if folded into a user-invoked skill.
- **Recommendation (proposed)**: **Adopt-adapted (Step 2.5)**, decided with A2. **Reject** the director router.

### D2. `unity-game-economy`

- **What it is**: Economy and meta-progression design ([SKILL.md](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-game-economy/SKILL.md)):
  - design the core → reward → meta loop before the numbers;
  - few legible currencies (soft/hard);
  - every currency has balanced faucets and sinks, with inflation and dead economy as the two failure poles;
  - progression slightly ahead of difficulty (churn walls);
  - reward schedules, session gating "handle with care", IAP catalog tiers and anchoring, rewarded-ad hooks as faucets, no pay-to-win;
  - "model it in a sheet, ship soft, tune live". Ships `references/economy-model.md`.
- **Kind**: skill
- **Proposed address**: Unity pack reference or user-invoked (owner's call; engine-agnostic design)
- **Why it could fit**: Pure game-design knowledge, structured as checks (faucet/sink balance, time-to-afford). No engine dependency, so it would survive any toolchain change.
- **Why it might not**:
  - Aimed at free-to-play casual monetization, which may not match the owner's games.
  - Uncited statistics (L18).
  - Not Unity-specific, so arguably not a *Unity* pack piece at all.
- **Copy / adapt / idea-only**: **Owner's call.** If the owner makes progression-heavy games, adapt (drop F2P/IAP specifics, keep loop/faucet/sink/pacing) into a game-design reference; otherwise idea-only. It cannot be copied because of the uncited numbers and the iOS-F2P framing.
- **Overlap**: B5 `unity-game-loop` (meta loop hooks, difficulty).
- **Idle context cost**: ~180 as published.
- **Recommendation (proposed)**: **Owner's call**; default idea-only.

### D3. `unity-gameplay-systems`: game feel / juice and the combat impact stack

- **What it is**: First-playable-slice scaffolding, C# rules, Input System touch, pooling, three casual templates, camera follow and verification ([SKILL.md](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-gameplay-systems/SKILL.md)). Its distinctive part is **game feel** ([L245-L262](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-gameplay-systems/SKILL.md#L245-L262)):
  - a "combat impact stack" of hit-stop with concrete durations (light 0.08 s, heavy 0.15 s), per-entity rather than global `timeScale`, attacker lunge, defender knockback and squash;
  - hit flash via shader and `MaterialPropertyBlock`, because "`SpriteRenderer.color` is a multiplicative tint — setting it white does NOTHING" (L256);
  - trauma-based screen shake quantized for pixel art (L257);
  - button press feedback; composable juice on unscaled time.

  Plus a game-feel checklist reference.
- **Kind**: skill (+ checklists)
- **Proposed address**: Unity pack reference (game feel), reached through the router or a user-invoked game-feel skill
- **Why it could fit**: Concrete, reusable feel numbers and traps that no baseline or fork skill has. A game-dev idea in the strongest sense, and it pairs with A1's complaint → test method (tune a feel number, then measure it).
- **Why it might not**:
  - The rest of the skill is MCP-driven assembly (`batch_execute`, `manage_gameobject`) and casual-iOS templates.
  - "Empirically... make-or-break" (L253) is asserted from their own projects, not cited.
- **Copy / adapt / idea-only**: **Adapt the juice section** into a game-feel reference (engine-API parts verified). Drop the MCP assembly and templates. The whole cannot be copied because its execution layer is MCP for Unity.
- **Overlap**: B5 `unity-ui-patterns` (feedback/juice), A1 (feel complaints), baseline: none.
- **Idle context cost**: ~150 as published; 0 as a reference.
- **Recommendation (proposed)**: **Adopt-adapted (game-feel section) as reference text.**

### D4. `unity-card-games`

- **What it is**: A genre layer "field-verified on a shipped portrait 1v1 lane battler" ([SKILL.md](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-card-games/SKILL.md)):
  - a **rules-spec gate** (retaliation, summoning sickness, targeting);
  - a **TERMINATION property**: prove every game ends with seeded AI-vs-AI over 50 seeds as an EditMode test before visuals ([L19](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-card-games/SKILL.md#L19));
  - an engine-free rules core;
  - an **attack EVENT LOG** so the view can animate what pure logic resolved instantly ([L31](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-card-games/SKILL.md#L31));
  - AI through the public engine API only; stale hand indexes.
- **Kind**: skill
- **Proposed address**: idea-only (or a genre reference if the owner makes card games)
- **Why it could fit**: The ideas generalize beyond cards: a termination or liveness property proven by seeded simulation; an event log as the seam between instant rules and animated presentation (the same split as A2's sim/presentation). Both are reusable for any turn-based or rules-heavy game.
- **Why it might not**: Genre-specific; most of the text (card frames, hand fans, drag ghosts) only matters for card games.
- **Copy / adapt / idea-only**: **Idea-only**: lift "seeded simulation proves a liveness property" and "rules emit an event log the view replays" into a game-architecture reference.
- **Overlap**: A2 (sim/presentation split, "Reachable" invariant over 1000 seeds), B4 `unity-state-machines` (testing), fork `unity-testing`.
- **Idle context cost**: ~160 as published.
- **Recommendation (proposed)**: **Idea-only.**

### D5. `unity-game-layout`

- **What it is**: Board/grid coordinate discipline ([SKILL.md](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-game-layout/SKILL.md)):
  - "Define **exactly one** function `CellToWorld(cell)`" and derive grid lines, piece positions and the inverse for picking from it ([L12](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-game-layout/SKILL.md#L12));
  - a validation gate: a marker dot at every cell centre plus a screenshot before gameplay ([L19](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-game-layout/SKILL.md#L19));
  - Tilemap corner-vs-centre trap, centre vs foot pivots, Y-sorting, PPU consistency, end-to-end input picking, responsive framing. It has a Sources section.
- **Kind**: skill
- **Proposed address**: Unity pack reference (gameplay/2D), or model-invoked if the owner does grid games
- **Why it could fit**: One root cause ("four computations of where cell (x,y) is") with many symptoms is exactly the kind of diagnosis knowledge that saves agent loops. Mostly engine-API-light and correct on its face. Its MCP use is limited to the screenshot step.
- **Why it might not**: Genre-specific (boards, grids, 2.5D). It partially overlaps the baseline's tile skill on Tilemap API detail.
- **Copy / adapt / idea-only**: **Adapt** (replace MCP screenshot steps with the fork's `unity-debugging` capture) if grid games are in scope; otherwise idea-only.
- **Overlap**: Baseline `create-tile-palette-or-rule-tiles` and `2d-pixel-perfect` (partial), C `coordinate-space-conversion.md`, B3 `unity-3d-math`.
- **Idle context cost**: ~155 as published.
- **Recommendation (proposed)**: **Owner's call**; adapt if grid/board games are in scope.

### D6. Art pipeline cluster: `unity-art-direction`, `unity-asset-designer`, `unity-aaa-graphics`, `unity-asset-pipeline`, `unity-scene-composition`

- **What it is**: An art-production system.
  - [`unity-art-direction`](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-art-direction/SKILL.md): a locked `art-spec.yaml`, style presets, mobile art budgets, golden asset → family production.
  - [`unity-asset-designer`](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-asset-designer/SKILL.md): turnarounds, style guides and consistency QA.
  - [`unity-aaa-graphics`](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-aaa-graphics/SKILL.md): a scorecard that fails "programmer art".
  - [`unity-asset-pipeline`](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-asset-pipeline/SKILL.md): per-asset `asset-contract.yaml`, an approved-asset registry that "scene builders must use... instead of raw generated files".
  - [`unity-scene-composition`](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-scene-composition/SKILL.md): `composition.yaml`, focal path, shape rhythm, occlusion budget.
- **Kind**: skills
- **Proposed address**: none by default
- **Why it could fit**: An "approved registry between generated art and the scene" and "golden asset first, then families" are solid production ideas. They echo A's art bible plus anchor (A11).
- **Why it might not**: A heavy studio process for a solo dev, tied to D's generators and MCP. About 900 idle tokens for five descriptions. Composition and art direction are judgement work the map gives to the human (A2's role contract says the same).
- **Copy / adapt / idea-only**: **Idea-only**, decided with A11 in an art-pipeline theme.
- **Overlap**: A11 (`codex-visual` art bible), A2 §2 (lock the look). Baseline: `urp-postprocessing` touches render polish.
- **Idle context cost**: ~170-195 each.
- **Recommendation (proposed)**: **Reject** as skills; keep the registry and golden-asset ideas for the art theme.

### D7. Generators and authored animation: `unity-image-generator`, `unity-pixel-art`, `unity-3d-generator`, `unity-audio-generator`, `unity-animation`

- **What it is**: Each wraps a paid generation API and imports into Unity: Gemini images, PixelLab pixel art with an anchor-first workflow, Tripo text/image-to-3D with rigging, ElevenLabs audio with loopify/LUFS post-processing. [`unity-animation`](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-animation/SKILL.md) adds per-role clip catalogues (idle/move/attack/hit/death) and Animation Events firing gameplay "on the contact frame".
- **Kind**: skills (+ scripts and tests in `tests/`)
- **Proposed address**: none by default
- **Why it could fit**: `unity-animation`'s per-role clip catalogue and "fire damage from the strike-frame event" rule are game-dev ideas in gap #1.
- **Why it might not**: Paid external APIs, keys in shell env, iOS/casual framing; ~165-195 idle tokens each.
- **Copy / adapt / idea-only**: **Idea-only**: the clip catalogue and the event-timing rule could join D3's game-feel reference.
- **Overlap**: A11 (`codex-visual`, `comfyui-asset-generation`, `unity-rigged-character`). B2 `unity-animation` (Animator docs).
- **Idle context cost**: ~165-195 each.
- **Recommendation (proposed)**: **Reject**; harvest the animation timing ideas.

### D8. MCP execution layer: `unity-mcp-bridge`, `unity-mcp-skill`

- **What it is**: [`unity-mcp-bridge`](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-mcp-bridge/SKILL.md) is a wrapper for CoplayDev MCP for Unity: setup, domain-reload reconnects, `no_unity_session` recovery, headless iOS builds; ~5.1k lines of references. [`unity-mcp-skill`](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-mcp-skill/SKILL.md) is a generic operator guide to the same server's tools. *Inference* from its generic tone and `references/upstream-workflows.md`: it derives from CoplayDev's own skill; provenance is not stated.
- **Kind**: skills
- **Proposed address**: none
- **Why it could fit**: Only if the owner adopts MCP for Unity as the execution layer.
- **Why it might not**: The fork and baseline drive Unity through the `unity` CLI and `com.unity.pipeline`; the baseline also offers `unity mcp configure` (baseline §1). A second execution layer would split every Unity skill's instructions.
- **Copy / adapt / idea-only**: Not proposed.
- **Overlap**: Baseline `unity-cli`/`unity-pipeline` (same job, different server). Fork `unity-verification`.
- **Idle context cost**: ~95 (`unity-mcp-skill`) and ~145 (`unity-mcp-bridge`).
- **Recommendation (proposed)**: **Reject.**

### D9. Baseline- or platform-covered and business skills (10, grouped)

- **What it is**:
  - Baseline-overlapping: `unity-graphics` (URP, lighting, post), `unity-ui-designer` (HUD, safe area, TMP via MCP), `unity-localization`, `unity-monetization` (AdMob/Unity Ads), `unity-project-setup`.
  - Overlapping A and the fork: `unity-debug-profiler`, `unity-qa-release` (tests, iOS build, TestFlight, fastlane).
  - iOS business skills: `unity-analytics-liveops` (retention KPIs, A/B), `unity-aso-growth` (App Store optimization), `unity-ios-secure-backend` (Game Center + App Attest + NestJS).

  Links: `https://github.com/tea-x-random/unity-game-skills/tree/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/<name>`.
- **Kind**: skills
- **Proposed address**: none
- **Why it could fit**: `unity-ui-designer`'s 44 pt touch targets and thumb zones, and `unity-qa-release`'s release-risk report, are small ideas worth noting for mobile.
- **Why it might not**: The baseline covers UI, URP, localization, ads, IAP and project setup (baseline §2). The fork covers testing and verification. The business skills are iOS-F2P-specific and outside the owner's stated stack.
- **Copy / adapt / idea-only**: Not proposed.
- **Overlap**: Baseline §2. Fork `unity-verification`/`unity-testing`. A6, A9, A10.
- **Idle context cost**: ~150-195 each.
- **Recommendation (proposed)**: **Reject**; mobile ideas go to the owner's mobile-scope decision (open question 5).

### D10. Mechanism: canonical host-neutral skills + per-skill `agents/openai.yaml` + installer and validator

- **What it is**:
  - One `skills/` tree is the source of truth for both Claude and Codex.
  - Each skill carries `agents/openai.yaml` for Codex discovery, and `platforms/claude.json`/`openai.json` describe install roots.
  - [`scripts/install_skills.py`](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/scripts/install_skills.py) copies or symlinks per platform; [`scripts/validate_repository.py`](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/scripts/validate_repository.py) validates.
  - `CLAUDE.md` says "do not create a Claude-only copy" ([CLAUDE.md](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/CLAUDE.md)).
- **Kind**: manifest-packaging
- **Proposed address**: input to the install-architecture decision
- **Why it could fit**: The same shape the fork already uses (per-skill `agents/openai.yaml`, fork ledger "Codex parity"). It confirms that approach is common.
- **Why it might not**: Nothing new beyond the fork's mechanism.
- **Copy / adapt / idea-only**: Idea-only (confirmation).
- **Overlap**: Fork `agents/openai.yaml`, `link-skills.sh`; vendoring research.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: **Idea-only.**

---

## Cross-source themes (for clustering)

*Inference*: grouping for the clustering ticket, not a decision.

| Theme | Candidates here | Also elsewhere |
|---|---|---|
| Agent-observable game (drive, read, measure) | A1, A3, A5 | Fork `unity-debugging`; pstack `benchmark-checklist` |
| Game kickoff (brief, measure the make-or-break first) | A2, D1 | Fork `prototype`/`unity-prototyping`, `grilling`, `to-spec` |
| Game-design reference (loop, feel, state steps, layout, economy) | B5, C3, D2, D3, D4, D5, D7 (ideas), A9 (UI readability) | none |
| Unity correctness gaps (async, input, saves, scenes/assets) | B3, B4 | Baseline gaps #2-#5, #10 |
| Traps to merge into the fork's verification/debugging | A4, B6, C2, C4 | Fork `unity-verification`, `unity-debugging` |
| Mobile shipping and device testing | A5, A6, D9 (ideas) | none |
| Art pipeline | A11, D6, D7 | none |
| Maintenance machinery | A12, B7, C5, D10 | Addy evals, superpowers triggering tests, fork `check.mjs` |
