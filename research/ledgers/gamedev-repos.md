# Ledger: engine-agnostic gamedev skill repos

Research for [#11](https://github.com/Hissal/skill-collection/issues/11), part of the wayfinder map [#1](https://github.com/Hissal/skill-collection/issues/1). Read 2026-10-09 from shallow clones in the session scratchpad. Nothing was installed or executed. Vocabulary follows `GLOSSARY.md`. Unity exclusions come from [`research/unity-baseline.md`](../unity-baseline.md) ("the baseline report"). Everything below is **proposed**; the owner decides in theme sessions.

**Sources (pinned):**

- **A**: `abagames/agentic-gamedev-skills` @ [`7230995`][a-root] (commit 2026-10-04). MIT ([LICENSE][a-license]).
- **J**: `jammyfu/open-game-skills` @ [`4ed0e22`][j-root] (commit 2026-10-02). MIT (README badge; [LICENSE][j-license]).
- **W**: `gamedev-skills/awesome-gamedev-agent-skills` @ [`0a70cfc`][w-root] (commit 2026-10-09). Apache-2.0 with a [NOTICE][w-notice] that has to travel with any copy.

**Idle-cost method.** Characters of `name` + `description` divided by 4, computed by a script over every `SKILL.md` frontmatter. This is an estimate (inference), the same method the baseline report used.

## Overview

### Counts per source

| Source | What it ships | Model-invoked as published | Est. idle cost if installed whole | Entries here |
|---|---|---|---|---|
| A | 37 skills under `.agents/skills/`, repackaged as 7 Claude/Codex plugins (39 memberships) ([README][a-readme]) | all 37 (no `disable-model-invocation` anywhere; grep) | ~4.6k tokens | 24 (A1–A24) |
| J | 191 `SKILL.md`: 169 `disciplines/`, 8 engine adapters, 6 `assets/`, 5 `2d/`, a `dispatcher`, a `router` stub and a pack entry `skills/SKILL.md`; plus ~40 Python contract tests and an A/B eval harness (file listing) | all 191 (grep) | ~9.3k tokens | 12 (J1–J12) |
| W | A router plus 74 skills: 16 Godot, 8 Unity, 6 Unreal, 6 web engines, 10 other engines, 15 disciplines, 9 genres, 4 workflows ([README][w-readme]) | all 75 | ~7.4k tokens | 10 (W1–W10) |

**W is not a list of repos.** Despite the "awesome" name it is itself a skill collection. Its Markdown links no other skill repos: a grep for `github.com/<owner>/<repo>` across its `.md` files finds only itself, `pygame-ce`, `three.js` and `oh-my-pi`. "Further repos" therefore come from A's README instead (section D).

**No source is Unity-first.** A has no Unity content at all: a case-insensitive grep for "unity" finds only substrings such as "opport*unity*". Its examples are Godot, crisp-game-lib and headless-browser games ([README][a-readme]). J has one 44-line Unity adapter ([J1 engines/unity][j-unity]). W has 8 Unity skills pinned to Unity 6.3 LTS ([VERSION-SUPPORT][w-version]).

### Standout candidates (proposed)

1. **A `refining-game-prototypes`** (A1). An autonomous playtest loop. It asks fixed, measurable questions in four stages (structure, difficulty, presentation, cleanup), changes one thing at a time, and keeps a revision log. Its decision rules choose a fix without waiting for a reviewer. This is the strongest game-dev-specific idea across all three sources. Proposed address: **gamedev pack, user-invoked**.
2. **A `implementing-gameplay-invariants`** (A3). Each design promise ("mashing is weak") becomes a testable invariant, and each invariant needs an on-screen **readout**. The skill reports that "four of nine shipped-and-fixed bugs" in one project were invisible rules. Small, sharp, engine-neutral.
3. **A `evaluating-gameplay-balance`** (A2) and **`stress-testing-game-concepts`** (A4). Balance is judged by comparing simple ("monotonous") policies with exploratory ones, with declared execution profiles (`oracle` / `precise` / `human-limited`), and **never from an LLM's judgment of fun**.
4. **A's gameplay-debugging pair** (A12, A13): localizing the first tick where a state invariant fails, and attacking a fix's *shape* (guard at the reader, clamp, special case, constant-only). These are game-flavoured extensions of the fork's `diagnosing-bugs`, and they fit Unity well.
5. **J `gameplay-validation` + `game-qa`** (J2, J3). Evidence classes (logic-regression / scripted-scene / real-input / new-player-watch), attribution buckets (game / player / setup / harness), and "a teleported or debug session is not a natural clear". These are cheap, sharp rules that carry over to Unity verification.
6. **W Unity skills that fill baseline gaps** (W2): `unity-input-system`, `unity-animation`, `unity-build-pipeline`, `unity-scriptableobjects`, `unity-csharp-scripting` cover baseline gap items 1, 2, 3 (partly), 12 and 13.

### Biggest open questions

1. **Gamedev pack or Unity pack?** Most game-dev ideas here are engine-neutral. The owner mostly works in Unity, so a separate gamedev pack would almost always be installed next to the Unity pack. One option is a gamedev pack (engine-neutral) plus thin Unity adapters inside the Unity pack. The other is to fold the chosen gamedev skills into the Unity pack. The addresses below say "gamedev pack" where the content is engine-neutral; that label is provisional.
2. **Simulated players in Unity.** A's balance and refinement skills assume a seeded, steppable game core with bot policies ([A2 L8-L18][a-balance-contract]). Godot/browser mini-games make this easy. In a Unity project it is real work (a pure-C# simulation core, or Play-mode drivers via the fork's `unity-debugging` play loop). Without it, many of A's checks fall back to the skill's own "weaker evidence" path. Whether the owner's games can host such a harness decides how much of A pays off.
3. **Agent-capture of frames.** A9/A10 (legibility, screen readability) need rendered frames at chosen game states. The baseline's CLI documents `capture_game_view` ([baseline report §2.1](../unity-baseline.md)). That route is not verified here.
4. **Router shape.** J (dispatcher + pack entry) and W (router) both put a router skill in front of a large model-invoked catalog. This is prior art for the router ticket. Both still pay the full catalog's idle cost, because every skill stays model-invoked.

## A. `abagames/agentic-gamedev-skills`

A is the output of an agent-driven mini-game factory. Its sibling repo holds the games ([README][a-readme]). The skills are long-form and evidence-minded. They repeatedly warn against running expensive gates "merely because a skill mentions it" ([AGENTS.md "Verification Scope"][a-agents]). Several skills leak the factory's pipeline vocabulary ("README invariants", "tag relationship", "Failure Report", "slug", `ratio.diagnostic`) ([A2 L51-L59][a-balance-triage]). Any adaptation must strip it.

### A1. `refining-game-prototypes` (+ `references/stage-checks.md`, `revision-log.md`)

- **What it is.** A staged refinement loop for a first playable build ([SKILL.md][a-refine]). Preconditions: a one-sentence intent statement and core interaction, a declared run structure, existing evidence, build copies and a revision log ([L31-L48][a-refine-pre]). In each stage the agent answers the questions in [stage-checks.md][a-stagechecks] as yes/no/unknown with evidence. It then picks the `no` with the largest effect on intent, writes 2–3 candidates, changes one thing, re-measures with the same seeds, and keeps or reverts ([L50-L83][a-refine-loop]). The six decision rules are, roughly: move play toward the core before adding anything; remove what cannot be seen; keep rewards the player already feels; fairness before difficulty; a display must earn its place; at most three attempts per finding ([L103-L130][a-refine-rules]). The stage-checks table pairs each question with the evidence and the reviewer remark it pre-empts, e.g. "Does simple play lose?" → "Just doing the obvious thing works" ([stage-checks][a-stagechecks]).
- **Kind**: skill (+ 2 references).
- **Proposed address**: gamedev pack, user-invoked (an expensive, multi-step workflow).
- **Why it could fit.** It names the problem every solo game dev has: the build has only been judged by its author. The questions apply to Unity games as well as mini-games. Its "Failure Modes" section (polishing first, proposing and waiting, several changes at once, running every gate) is also good general guidance ([L179-L203][a-refine-fail]).
- **Why it might not.** It assumes cheap telemetry and replay. Many questions name "action share and score share per mechanic, per ladder rung" as their strongest evidence ([stage-checks][a-stagechecks]). It is tuned to arcade score games: rounds, lives, extends. At 203 lines plus references it is heavy.
- **Copy / adapt / idea-only**: **adapt**. Drop the companion-skill table rows for skills not taken. Make the Unity evidence routes explicit (fork `unity-debugging` play loop, `unity-verification` for builds). Keep the stage questions, decision rules and failure modes close to the source. It can't be copied as-is because its companion table points at ~10 A skills and its evidence vocabulary assumes A's harness.
- **Overlap**: fork `prototype` / `unity-prototyping` cover *building* a throwaway prototype, not refining a playable one (fork ledger). No baseline overlap. W `prototype-fast` (W5) covers the earlier keep/kill decision.
- **Idle context cost**: 0 as user-invoked (~196 tokens if model-invoked, among the longest descriptions in A).
- **Recommendation** (*proposed*): **adapt** into the gamedev pack, user-invoked. It is the anchor of a possible "playtest/tune" theme.

### A2. `evaluating-gameplay-balance` (+ 5 references)

- **What it is.** Balance through policy comparison ([SKILL.md][a-balance]). Run monotonous and exploratory policies on the same seeds. Compute `exploratory_ratio` as a *detector*, not a target. Declare each policy's execution profile (`oracle`, `precise`, `human-limited`), and set difficulty only from `human-limited` runs ([L8-L18][a-balance-contract]). Without seeding, report min–max bands over n ≥ 3 runs, and claim a band moved only at n ≥ 5 with no overlap. "Retraction is a valid and expected output" ([L20-L27][a-balance-band]). Experience guardrails: score only in-game causal events; no hidden behaviour that helps test agents; don't tune a parameter with a policy defined by that parameter ([L29-L36][a-balance-guard]).
- **Kind**: skill + references (simulation harness, log contract, balance patterns, Godot notes).
- **Proposed address**: gamedev pack, user-invoked.
- **Why it could fit.** The profile labelling and the noise protocol are the best balance discipline in the three sources, and engine-neutral. Play reports are treated as calibration data for the human-limited profile, not overruled by bot data ([L35][a-balance-guard]).
- **Why it might not.** Same harness dependency as A1 (open question 2). The triage section is wired to A's checker output (`mono_dominant`, `tied`, `marginal`) and pipeline ([L51-L59][a-balance-triage]). The Godot reference is irrelevant to the owner.
- **Copy / adapt / idea-only**: **adapt**. Keep the contract, band protocol and guardrails. Rewrite the triage without A's checker. Replace the Godot notes with Unity notes if a Unity harness is chosen.
- **Overlap**: J `balance-design` (J8) is policy-level only (metric, denominator, asymmetry), with no simulation method. W has no balance skill.
- **Idle context cost**: 0 user-invoked (~85 if model-invoked).
- **Recommendation** (*proposed*): **adapt**, gamedev pack user-invoked. Decide together with A1, since A1 calls it.

### A3. `implementing-gameplay-invariants` (+ `invariant-patterns.md`)

- **What it is.** It turns design prose into testable invariants with scope and consequence, e.g. "A tap within 12 frames of the previous tap cannot score". It also prechecks each bad policy: does it die, time out, or survive with a capped score? ([SKILL.md][a-inv]). Its template adds a **Readout** field: "an invariant that changes what the player should do, and is not drawn, is indistinguishable from an unfair game" ([L92-L99][a-inv-readout]). The "Invisible rule" failure mode reports four of nine shipped-and-fixed bugs in one project as this defect ([SKILL.md "Common Failure Modes"][a-inv]).
- **Kind**: skill + reference.
- **Proposed address**: gamedev pack, model-invoked (fires while implementing mechanics), or a reference that A1 and the Unity testing skill point to.
- **Why it could fit.** It is engine-neutral and short (129 lines). It links design to tests, which the fork's `tdd`/`unity-testing` lack for gameplay. The readout rule is a gameplay-specific idea that none of the other ledgers have.
- **Why it might not.** It is framed around score-attack anti-exploit cases (idle, hold-only, mashing). Narrative or systemic Unity games use fewer of its patterns.
- **Copy / adapt / idea-only**: **adapt** lightly. Generalise the trigger beyond one-button/score games and drop the "Failure Report"/"tag relationship" pipeline terms.
- **Overlap**: fork `unity-testing` (test seams) is complementary. W `game-feel`/J `juice-vfx` don't address it.
- **Idle context cost**: ~77 tokens if model-invoked.
- **Recommendation** (*proposed*): **adapt**, gamedev pack model-invoked. The description needs rewriting so it triggers on "implementing a mechanic from a design", not only on anti-mashing.

### A4. `stress-testing-game-concepts` (+ failure taxonomy, policy library, report contract)

- **What it is.** Adversarial review of concepts, rule specs or early prototypes ([SKILL.md][a-stress]). It extracts the causal model and lists falsifiable claims. It attacks them with simple policies and probes the key decision: "construct at least two reachable states where different actions should be preferred". Each claim is classified `fails`/`weak`/`unknown`/`survives`. There is a strict hard-reject policy ([L34][a-stress-hard]) and the rule "Never use an LLM's holistic fun judgment as evidence" ([L55][a-stress-55]).
- **Kind**: skill + references.
- **Proposed address**: gamedev pack, user-invoked.
- **Why it could fit.** It is the game-design counterpart of the fork's `grilling`, with gameplay-specific attacks (agency collapse, dominant simple policy, reward exploits). It works on prose alone, with no engine required.
- **Why it might not.** It produces a report, not a decision. It needs the owner to be in a design phase.
- **Copy / adapt / idea-only**: **copy with light edits**. Mostly engine-neutral; remove the stable-ID handoff ceremony if A5 is not taken.
- **Overlap**: fork `grilling` (stress-tests the *user's* plan by questioning). Addy `doubt-driven-development` (addy ledger entry 28) is general code doubt.
- **Idle context cost**: 0 user-invoked (~114 if model-invoked).
- **Recommendation** (*proposed*): **adopt/adapt**, gamedev pack user-invoked.

### A5. Concept workbench: `exploring-game-design-space` + `curating-game-concept-portfolio`

- **What it is.** Ideation as search ([explore][a-explore]). It generates ~18 structurally varied root concepts, removes only demonstrated failures or mechanism duplicates, mutates mechanisms rather than cosmetics, and returns 3–5 testable hypotheses, each with "the smallest prototype or playtest that could resolve it". Curation normalises a pile of concepts into mechanism signatures, clusters duplicates and selects for coverage, with a deterministic Python first pass ([curate][a-curate]).
- **Kind**: 2 skills (+ a script with tests in `curate`).
- **Proposed address**: gamedev pack, user-invoked.
- **Why it could fit.** Jam theme brainstorming and choosing among game ideas, with no fun-score ranking.
- **Why it might not.** It is heavy machinery (records, IDs, handoffs) for a solo dev. A jam needs one idea in 15 minutes (W `game-jam` step 3, [W4][w-jam]).
- **Copy / adapt / idea-only**: **idea-only** for curation. *Possibly adapt* explore as a slimmer brainstorm.
- **Overlap**: A4 (shares records). Addy's variation lenses (addy ledger, "a compact prompt for game-design brainstorming").
- **Idle context cost**: 0 user-invoked (~243 combined if model-invoked).
- **Recommendation** (*proposed*): **idea-only**. Keep "mutate a causal relationship, not a theme" and "each final concept names its smallest discriminating test" as a reference inside A4's adaptation.

### A6. Compact game design: `designing-mini-games`, `designing-minimal-game-rules`, `generating-retro-arcade-concepts`

- **What it is.** Rules for designing compact games ([designing-mini-games][a-design]): core experience in one sentence; game-over from a hazard, never from "did not press"; every monotonous policy strictly worse than skilled play; score in-world causes, never raw input; add state only for a new decision; pair safety with a readable cost. The other two cover discrete-state rule reduction with Rule Breaker / Strategy Breaker roles, and 1978–85 arcade concept slates ([README table][a-readme]).
- **Kind**: 3 skills.
- **Proposed address**: gamedev pack (if any), user-invoked.
- **Why it could fit.** The "Core Rules" list is a dense design checklist that applies beyond mini-games.
- **Why it might not.** The scope is one-button and arcade mini-games, and the procedure's seed/tag steps come from A's factory ([designing-mini-games "Design Procedure"][a-design]).
- **Copy / adapt / idea-only**: **idea-only**. Lift the Core Rules into A4/A3 references.
- **Overlap**: A3, A4.
- **Idle context cost**: ~289 combined if model-invoked.
- **Recommendation** (*proposed*): **reject as skills; idea-only** for the Core Rules list.

### A7. `maximizing-game-feel` (+ `technique-catalog.md`)

- **What it is.** Polish for a working but flat action game ([SKILL.md][a-feel]). Choose an expressive register (playful / minimal / tense) ([L16-L26][a-feel-register]). Map events to separate feedback vocabularies for danger, reward, state change, near miss and cause of failure ([L28-L38][a-feel-vocab]). Keep presentation off the rules: "Draw a hazard at least as large as its active hit area"; "Preserve buffered input during hit stop" ([L42-L50][a-feel-impl]). Apply effects in impact-per-effort order. Validate that seeded simulated players get identical results before and after a presentation-only pass ([L63-L75][a-feel-validate]).
- **Kind**: skill + reference.
- **Proposed address**: gamedev pack, model-invoked (short description, ~60 tokens). A Unity adapter note could live in the Unity pack.
- **Why it could fit.** Game feel is a frequent Unity task. The fork ledger notes "Game feel and UI questions are common in Unity work and need the engine". The "presentation must not change rules" checks are concrete and testable.
- **Why it might not.** The technique catalog targets crisp-game-lib/Godot/2D ([L77-L80][a-feel-validate]). Unity specifics (Cinemachine impulse, time scale versus per-actor freeze) are missing.
- **Copy / adapt / idea-only**: **adapt**. Keep the workflow and replace the catalog's engine section with Unity notes. J `engines/unity` (J7) already states "Do not use global `Time.timeScale` as a substitute for per-actor combat freeze" ([J unity][j-unity]).
- **Overlap**: W `game-feel` (W6) is a technique menu ("5–8 tiny responses within ~100 ms") without A's rules-safety checks. J `juice-vfx` (J6) covers lifecycle and cleanup. Choose one; A7 is proposed as primary, with J6's cleanup rules folded in.
- **Idle context cost**: ~60 tokens.
- **Recommendation** (*proposed*): **adapt**, gamedev pack model-invoked, merged with J6's cleanup rules. Theme: "game feel".

### A8. `directing-game-visuals`

- **What it is.** A 25-line visual direction skill: one protagonist, one primary danger, one primary reward; every palette colour has a gameplay role; feedback is readable without HUD text; validate in one still frame ([SKILL.md][a-visuals]).
- **Kind**: skill + reference.
- **Proposed address**: gamedev pack, model-invoked or folded into A7.
- **Why it could fit.** It is short and engine-neutral.
- **Why it might not.** It is aimed at procedural/AI-art mini-games ("reducing generic AI-looking game art"). Owner projects may have artists or asset packs.
- **Copy / adapt / idea-only**: **idea-only**. Its 5 core rules could form a section of A7 or A10.
- **Overlap**: W `create-game-assets` (art direction pipeline), J `art-bible`.
- **Idle context cost**: ~55 tokens.
- **Recommendation** (*proposed*): **idea-only**, folded into A7.

### A9. `gating-intent-legibility` (+ 5 references)

- **What it is.** Blind restoration applied to gameplay ([SKILL.md][a-legib]). Scenes are sampled from a recorded run, and an isolated agent that never saw the design names the goal, options and risk. To stop fluent invention, each grader must also **predict an unseen frame**, which is then revealed, "so the game supplies the ground truth" ([L17][a-legib-17], [L109-L117][a-legib-109]).
- **Kind**: skill + references.
- **Proposed address**: gamedev pack, user-invoked.
- **Why it could fit.** A novel, cheap, automatable playtest proxy for "can a new player read this?". Unusually rigorous about graders that make things up.
- **Why it might not.** It needs frame capture at chosen states (open question 3) and an isolated subagent. At 282 lines it is the longest skill in A.
- **Copy / adapt / idea-only**: **adapt** if a Unity capture route exists; otherwise **idea-only**.
- **Overlap**: A19 (`gating-by-blind-restoration`) is the general method. J `gameplay-validation`'s `new-player-watch` mode is the human version (J2).
- **Idle context cost**: 0 user-invoked (~170 if model-invoked).
- **Recommendation** (*proposed*): **owner's call**. Strong idea; whether it pays depends on Unity frame capture.

### A10. `auditing-game-screen-readability` (+ moments catalogue, frame-check script)

- **What it is.** It finds display defects that state tests can't see: a popup drawn under the HUD, two notices on one line, a warning dimmer than the background, a counter nobody can name ([SKILL.md][a-screen]). The audit is organised around **moments**, including forced coincidences (two notices in one frame) and extremes (world-anchored elements at screen edges).
- **Kind**: skill + reference + Node script (`check-screen-frames.mjs`).
- **Proposed address**: gamedev pack, user-invoked (before release, after HUD changes).
- **Why it could fit.** The moment list is a good pre-release UI checklist for any Unity game. It falls back to reading draw code when capture is impossible ([SKILL.md "When Not to Use"][a-screen]).
- **Why it might not.** Same capture dependency as A9. The script targets browser builds (inference from `.mjs` and A's web focus).
- **Copy / adapt / idea-only**: **adapt** the procedure and moments, and drop the script.
- **Overlap**: baseline `ui`/`ui-ugui`/`ui-uitk` teach *building* UI, not auditing it ([baseline report §2](../unity-baseline.md)).
- **Idle context cost**: 0 user-invoked (~195 if model-invoked).
- **Recommendation** (*proposed*): **adapt**, gamedev pack user-invoked, as a lower priority than A1.

### A11. `auditing-gameplay-implementation-coverage` (+ 2 references)

- **What it is.** It finds missing members of behaviour families: one phase without an input alias, one actor variant the freeze path skips, one saved field never restored ([SKILL.md][a-coverage]). It freezes the audit method, makes no repairs during the audit, and treats a clean result as "no confirmed gap found". Obligations come from five evidence classes (explicit, structural sibling, metamorphic, producer-consumer, boundary).
- **Kind**: skill + references.
- **Proposed address**: gamedev pack, user-invoked. The method is not game-only (inference): it would serve any stateful app, so a core variant is possible.
- **Why it could fit.** "Forgotten sibling" bugs are common in Unity (a new enemy type that skips pooling reset, a save field not restored). The obligation classes are a reusable lens.
- **Why it might not.** It is heavyweight (171 lines, ledgers with stable IDs). Its value needs a large enough game.
- **Copy / adapt / idea-only**: **adapt** (generic wording). The five obligation classes are the key idea.
- **Overlap**: pstack mistake-class mining (pstack ledger) is history-driven, not structural.
- **Idle context cost**: 0 user-invoked (~254 if model-invoked, the longest description in A).
- **Recommendation** (*proposed*): **owner's call**: gamedev pack user-invoked, or a reference inside A12.

### A12. `localizing-game-state-divergence`

- **What it is.** For semantic defects that throw nothing: write an **oracle predicate before reading the trace** ([L63][a-diverge-63]). Emit a per-transition observation trace from a replay, then scan for the lowest index where an oracle fails. If no oracle fails but the end state is wrong, the trace is too coarse ("a finding about instrumentation, not about the game"). Separate first violation from first cause ([L94][a-diverge-94]). It requires a `ReproCase` and a replayable `(state, event) -> state` core ([SKILL.md][a-diverge]).
- **Kind**: skill + reference.
- **Proposed address**: Unity pack as a section of the fork's `unity-debugging`, or core as a reference of `diagnosing-bugs`. Not a separate skill.
- **Why it could fit.** Score credited twice or a cooldown that never expires are classic Unity bugs. The oracle-first discipline fits the fork's diagnosis loop.
- **Why it might not.** The replayable core is rare in MonoBehaviour code; the skill itself says extracting one "has not yet been validated" ([SKILL.md "Required Inputs"][a-diverge]).
- **Copy / adapt / idea-only**: **idea-only / adapt into an existing skill**.
- **Overlap**: fork `diagnosing-bugs`, `unity-debugging` (fork ledger). Superpowers `systematic-debugging` (A's README explicitly declines it because it "claims every technical issue as its trigger" ([README][a-readme])).
- **Idle context cost**: 0 if merged.
- **Recommendation** (*proposed*): **merge the idea** into `unity-debugging` / `diagnosing-bugs` (oracle-first, first-violation vs first-cause, "coarse trace" stop).

### A13. `adversarially-validating-game-repairs` (+ 2 references)

- **What it is.** It attacks a fix that made the symptom go away ([SKILL.md][a-repair]). Restate the claim from the diff alone. Establish fail-to-pass and relevant pass-to-pass. Pick adversarial cases by what the patch can reach (seeds, tick rate, pause, save/load, pooling). Attack the fix's **shape**: guard at the reader rather than at the first bad write; output clamps; special-casing the reported input; a constant-only change for a logic bug; state that survives a pool or reload ([L82][a-repair-82]). Output is a PatchEvidence record.
- **Kind**: skill + references.
- **Proposed address**: Unity pack section (fork `unity-debugging` / `unity-verification`), or core reference for `diagnosing-bugs`.
- **Why it could fit.** The shape checklist applies directly to code review of game fixes, and to agent-written fixes in particular.
- **Why it might not.** It overlaps with code review and with the fork's TDD "prove the red" step.
- **Copy / adapt / idea-only**: **idea-only**. Lift the five shape questions.
- **Overlap**: fork `code-review`, `diagnosing-bugs`. Addy `doubt-driven-development` (addy ledger 28). Superpowers `receiving-code-review` (superpowers ledger).
- **Idle context cost**: 0 if merged (~171 as its own model-invoked skill).
- **Recommendation** (*proposed*): **idea-only**. Add the shape checklist to the Unity pack's debugging skill; pooling, domain reload and scene reload are Unity-specific lifetime boundaries that the fork's `unity-code-lifecycle` already owns.

### A14. `generating-semantic-game-mutants` (+ 13 fixture mutants)

- **What it is.** It plants **semantic, game-specific** defects (timing/order, identity/lifecycle, scoring, persistence, RNG, input buffering, animation sync, content) with a withheld manifest. This measures a test suite or an agent workflow. Four separate experiments: suite detection, workflow repair, with/without comparison, over-repair control ([SKILL.md][a-mutants]).
- **Kind**: skill + fixtures (maintenance / eval).
- **Proposed address**: maintenance machinery (not installed). Idea for evaluating the Unity pack's debugging/testing skills.
- **Why it could fit.** The collection needs evals (addy and superpowers ledgers). The "over-repair control" (does the agent leave a healthy build alone?) is a test idea the other ledgers lack.
- **Why it might not.** Building mutants for Unity projects is real work.
- **Copy / adapt / idea-only**: **idea-only**.
- **Overlap**: superpowers skill-testing method, pstack eval playbook (prior ledgers).
- **Idle context cost**: none (not installed).
- **Recommendation** (*proposed*): **idea-only**, feeding the maintenance/eval theme.

### A15. `verifying-turn-based-games`

- **What it is.** A pure-function engine contract (`init`, `step`, `getLegalActions`, `getObservation`, …) and bot-ladder / win-probability-tension metrics for two-player alternating-turn games. It refuses other scopes ([SKILL.md][a-turn]).
- **Kind**: skill.
- **Proposed address**: gamedev pack, user-invoked, only if the owner builds such games.
- **Why it could fit.** The contract is a clean seam that would also make a Unity card or board game testable in EditMode.
- **Why it might not.** Narrow scope.
- **Copy / adapt / idea-only**: **copy** if wanted (engine-neutral).
- **Overlap**: W `card-game` genre skill (W7).
- **Idle context cost**: ~98 if model-invoked.
- **Recommendation** (*proposed*): **owner's call**. Reject unless the owner has a turn-based project.

### A16. `arcadifying-mini-games`

- **What it is.** It wraps a working loop with rounds, ceremony screens, extends, a high-score table and attract mode. One `phase` variable is the source of truth, with invariants such as "a transition re-checks phase before later same-frame spawners, collisions, or scoring run" ([SKILL.md][a-arcade]).
- **Kind**: skill + reference.
- **Proposed address**: none.
- **Why it could fit.** The phase-machine invariants are useful for any game flow.
- **Why it might not.** Arcade-genre specific.
- **Copy / adapt / idea-only**: **idea-only** (phase invariants).
- **Overlap**: J `game-state-flow` (whole-game transitions owner, [J CONTRACT][j-contract]). Baseline gap 4 (scene management).
- **Idle context cost**: ~128.
- **Recommendation** (*proposed*): **reject**; keep the phase invariants as an idea for a future Unity scene/flow skill.

### A17. Retro audio group: `building-era-authentic-game-audio`, `designing-retro-arcade-sound-kits`, `creating-godot-procedural-audio`

- **What it is.** Procedural chip-style BGM/SE systems, event-to-sound mapping, and Godot `AudioStreamGenerator` SFX ([README table][a-readme]).
- **Kind**: 3 skills (+ a JS validator, a GDScript synth).
- **Proposed address**: none.
- **Why it could fit.** The "SE vs jingle vs no sound" decision per event is a useful idea ([sound kits description][a-readme]).
- **Why it might not.** Retro procedural audio is niche, and one is Godot-only. Baseline `audio-setup-mixers`/`optimize-audio` cover Unity audio mechanics ([baseline report §2](../unity-baseline.md)).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: W `audio-design`, J `audio-feel`.
- **Idle context cost**: ~370 combined.
- **Recommendation** (*proposed*): **reject**.

### A18. Engine/web-specific group: `scaffolding-godot-mini-games`, `running-headless-godot`, `developing-with-crisp-game-lib`, `smoke-testing-web-games`, `probing-web-game-mechanics`, `styling-web-game-typography`, `generating-dot-assets`

- **What it is.** Godot 4.2+ scaffolding and headless CLI; crisp-game-lib; Playwright smoke tests and state-injection mechanic probes for browser games; typography licensing; pixel-art generation through Codex `image_gen` and ImageMagick ([README table][a-readme], descriptions).
- **Kind**: 7 skills with scripts and templates.
- **Proposed address**: none for Unity. `smoke-testing-web-games` could suit a web pack if the owner ships WebGL builds (inference).
- **Why it could fit.** `probing-web-game-mechanics` (inject state, assert transitions) is the browser twin of driving Unity through `eval`/`run_script`, which the fork's `unity-verification` already covers ([baseline report §3](../unity-baseline.md)).
- **Why it might not.** Wrong engines. `generating-dot-assets` requires Codex's `image_gen`.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: baseline `optimize-web` (WebGL), `ui` (typography via TMP).
- **Idle context cost**: ~620 combined.
- **Recommendation** (*proposed*): **reject**.

### A19. `gating-by-blind-restoration` + `gating-expensive-batch-work`

- **What it is.** Two general agent-workflow gates. **Blind restoration**: an isolated subagent sees only the artifact (spec, design doc, schema) and must reconstruct the adjacent layer, which yields pass/weak-pass/fail; "the author never grades their own work" ([SKILL.md][a-blind]). **Batch gating**: run a cheap reversible pass over every item, freeze the method, then run the expensive irreversible pass. It names irreversible resources (fresh seeds, held-out data, a reviewer's first impression) ([SKILL.md][a-batch]).
- **Kind**: 2 skills.
- **Proposed address**: core user-invoked (both).
- **Why it could fit.** Blind restoration is a cheap check for the fork's `to-spec` and `writing-for-agents` output: "can a fresh agent rebuild the plan from this ticket?". Batch gating matches this very wayfinder process (many ledgers, one method).
- **Why it might not.** Not game-specific. It may duplicate pstack/addy review skills.
- **Copy / adapt / idea-only**: **adapt** (Claude Code / Codex subagent wording).
- **Overlap**: addy `doubt-driven-development` (fresh-context reviewer never shown the claim, addy ledger 28). pstack blind-eval rules (pstack ledger). A9 is the game-specific version.
- **Idle context cost**: 0 user-invoked (~291 combined if model-invoked).
- **Recommendation** (*proposed*): **adapt** blind restoration as core user-invoked, in a "review/doubt" theme with addy 28. Batch gating is the **owner's call**.

### A20. Skill-maintenance group: `migrating-agents-md-to-control-flow`, `refining-workflows-from-artifacts`, `extracting-agent-skills`

- **What it is.** (1) Move repeatable workflows from big instruction files into skills, and mandatory checks into scripts/hooks/CI, behind an applicability gate; it ships two validator scripts ([SKILL.md][a-migrate]). (2) Classify why a workflow run failed (task / execution / workflow / evaluation / capability-boundary / output-format / overconstraint) before proposing "the smallest workflow diff" ([SKILL.md][a-refinewf]). (3) Harvest skills from finished or failed projects, "prefer zero strong candidates to several weak ones", and label results Draft / Structurally reviewed / Empirically tuned ([SKILL.md][a-extract]).
- **Kind**: 3 skills.
- **Proposed address**: core user-invoked, or maintenance tooling for this repo.
- **Why it could fit.** This collection is itself a skill-maintenance project. The cause taxonomy and the honesty labels are directly useful.
- **Why it might not.** It overlaps with the fork's `writing-for-agents` and with skill-creator.
- **Copy / adapt / idea-only**: **idea-only / adapt**. The cause taxonomy and the three maturity labels are the reusable parts.
- **Overlap**: fork `writing-for-agents` (A's README also references Matt Pocock's version, [README][a-readme]). Superpowers skill-testing. Pstack `reflect` (prior ledgers).
- **Idle context cost**: 0 user-invoked (~341 combined if model-invoked).
- **Recommendation** (*proposed*): **idea-only**, feeding the maintenance theme. `refining-workflows-from-artifacts` is the strongest of the three.

### A21. `critiquing-own-response`, `dispatching-agent-work`, `extracting-spec-design-ladders`

- **What it is.** (1) A 34-line advisory self-critique, explicit use only, with a fixed output (core claim, assumptions, failure modes, counterexamples, evidence needed, revised confidence). It openly says it shares the original answer's blind spots ([SKILL.md][a-critique]). (2) Routing work to tasks/subagents with model role and effort; persistent "dispatch mode" ([SKILL.md][a-dispatch]). (3) Reverse-engineering code into a reproduction spec plus a separate design doc ([SKILL.md][a-ladder]).
- **Kind**: 3 skills.
- **Proposed address**: (1) core user-invoked; (2) none; (3) none.
- **Why it could fit.** (1) is tiny, honest about its limits, and zero idle cost if user-invoked.
- **Why it might not.** (2) is Codex Desktop-oriented and competes with the harness. (3) is niche.
- **Copy / adapt / idea-only**: (1) **copy**; (2), (3) reject.
- **Overlap**: (1) addy `doubt-driven-development`, pstack `why` confidence tiers (prior ledgers).
- **Idle context cost**: (1) 0 user-invoked.
- **Recommendation** (*proposed*): (1) **owner's call** in the review/doubt theme; (2) and (3) **reject**.

### A22. Mechanism: plugin-bundle builder (`tools/plugin-bundles/`, `plugin-bundles/*.json`, `PLUGIN_RELEASE.md`)

- **What it is.** One canonical `.agents/skills/` tree plus per-bundle JSON compositions generate seven self-contained plugin roots. Each root carries both `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`, plus Claude, Codex and Codex-API-key marketplace catalogs. `published.py --check` rejects stale payloads, drift, path escape and symlinks ([PLUGIN_RELEASE.md][a-release]). One skill can be in several bundles (39 memberships for 37 skills, [README][a-readme]).
- **Kind**: script + manifest-packaging.
- **Proposed address**: maintenance machinery for this repo.
- **Why it could fit.** It answers the map's install question directly: one source tree, many packs, both harnesses, and drift checked in CI. A skill shared by core and a pack would live once.
- **Why it might not.** Generated payload copies are committed, so every skill exists twice in git. It is Python tooling that would need porting or vendoring (MIT).
- **Copy / adapt / idea-only**: **adapt** (or idea-only for the install-architecture ticket).
- **Overlap**: the loading-mechanics and vendoring research (`research/loading-mechanics.md`, `research/vendoring.md`). The Unity plugin's dual manifests ([baseline report §1](../unity-baseline.md)).
- **Idle context cost**: none.
- **Recommendation** (*proposed*): **hand to the install-architecture ticket as prior art**. It is the most concrete "one tree → many Claude+Codex packs" generator seen so far.

### A23. Mechanism: curated external skills (`tools/install-external-skills.sh`, README "External Skill References", `check-readme-skills.sh`)

- **What it is.** External skills are listed in the README, each with a one-paragraph reason and pairing, and are gitignored. A script stages and validates each one before replacing the installed copy ("failed updates preserve the installed version"). Some entries are "reference-only", adapted individually rather than installed ([README][a-readme]). A README-drift check runs in CI.
- **Kind**: script + convention doc.
- **Proposed address**: maintenance machinery.
- **Why it could fit.** The per-entry rationale is a ledger in miniature, including *why not* (superpowers `systematic-debugging` is declined because its trigger outranks local skills).
- **Why it might not.** It tracks upstream `main`, not a pinned SHA (the README links point at `blob/main`).
- **Copy / adapt / idea-only**: **idea-only**.
- **Overlap**: vendoring ticket [#12](https://github.com/Hissal/skill-collection/issues/12) (copy-with-provenance; skills.sh pins no SHA).
- **Idle context cost**: none.
- **Recommendation** (*proposed*): **idea-only** for the vendoring/maintenance theme. The "declined, and why" note format is worth copying into the catalog.

### A24. Convention: "Verification Scope" in `AGENTS.md`

- **What it is.** Four rules. Choose verification by what the change can reach and what failure costs. Start from the cheapest covering check. Don't enter an expensive gate because a skill mentions it or because evidence is merely absent. Keep strict rules that exist for reproducibility ([AGENTS.md][a-agents]).
- **Kind**: convention doc.
- **Proposed address**: core always-on (a few lines), or folded into the fork's `unity-verification` rung rule.
- **Why it could fit.** It is the antidote to skill-induced over-verification, which matters once many user-invoked gates exist.
- **Why it might not.** Always-on text costs context every session. The fork's verification ladder may already imply it.
- **Copy / adapt / idea-only**: **copy** (short).
- **Overlap**: fork `unity-verification` ladder and rung rule (baseline report §3).
- **Idle context cost**: ~100 tokens always-on (inference from length).
- **Recommendation** (*proposed*): **owner's call**. Probably merge into the verification skill rather than always-on.

## J. `jammyfu/open-game-skills`

J is a large, contract-style catalog for action-game mechanics (fighters, platformers, action RPGs). Each skill is short (median ~35 lines; total 6,548 lines over 191 files, `wc`). Each opens with a "column" (mode) table and ends with an **Accept** section of replayable checks. Every skill reads [the shared contract][j-contract]. It has five "iron laws" ([README L68][j-readme]), e.g. "Hitstop ≠ hitstun" and "Do not balance a monster by stealing player i-frames". The pack is meant to be installed whole ("Keep the whole pack together"): 28 `SKILL.md` files use `../` links (grep).

### J1. Pack architecture: entry skill + `dispatcher` + `CONTRACT.md` + 191 model-invoked skills

- **What it is.** `skills/SKILL.md` is the pack entry and delegates to `dispatcher` ([entry][j-entry]). The dispatcher picks "at most three specialized skills … plus one necessary engine per phase", answers in a fixed `USE / ENGINE / ASK / DEFER` block, and maps symptoms in ZH/EN/JA/KO ([dispatcher][j-dispatch]). The shared contract sets evidence rules (pass/fail/blocked/not-run) and resource ownership ("Runtime instances … each have a named owner, an instance cap and a release point") ([CONTRACT][j-contract]).
- **Kind**: manifest-packaging + convention doc + router skill.
- **Proposed address**: none as installed (~9.3k idle tokens). The ideas go to the router ticket.
- **Why it could fit.** "≤3 skills + 1 engine per phase, DEFER the rest" is a concrete loading budget for a router.
- **Why it might not.** All 191 skills are model-invoked, so the router doesn't save idle context. Install is a custom `tools/install.py` that symlinks the whole pack ([README][j-readme]).
- **Copy / adapt / idea-only**: **idea-only**.
- **Overlap**: W router (W1); pstack `poteto-mode` (pstack ledger).
- **Idle context cost**: ~9.3k tokens whole.
- **Recommendation** (*proposed*): **reject the pack; idea-only** for the per-phase skill budget and the `DEFER` output.

### J2. `gameplay-validation`

- **What it is.** Four evidence modes with what each may and may not prove: logic-regression, scripted-scene, real-input, new-player-watch. "Teleport, wipe enemies, force boss phase, or unlock flags = scripted-scene" ([L12][j-gv-12]). A session pre-sheet (build, difficulty, gear, device, cheats). A walk chain (boot → teach → challenge → consequence → next goal → fail/retry → ending). Attribution kept separate: game defect / player strategy / setup / harness ([L52][j-gv-52]).
- **Kind**: skill (88 lines).
- **Proposed address**: Unity pack, merged into the fork's `unity-verification` reporting, or gamedev pack model-invoked.
- **Why it could fit.** Agents routinely claim "works" after a scripted or debug run. This gives the words to stop that. The attribution buckets match agent-driven Play-mode testing, where the harness itself often fails.
- **Why it might not.** It overlaps with the fork's verification report format (not compared line by line here).
- **Copy / adapt / idea-only**: **adapt** (merge the modes table and attribution buckets).
- **Overlap**: fork `unity-verification` report format; A1's evidence-strength labels; J3.
- **Idle context cost**: ~54 tokens if standalone.
- **Recommendation** (*proposed*): **adapt into `unity-verification`** (Unity pack), with no new skill.

### J3. `game-qa`

- **What it is.** A QA pass taxonomy (smoke, functional, regression, combination, playtest, soak, device-matrix, input-matrix, interrupt) and an evidence card per executed row. "A unit/static check, screenshot, capture, or telemetry counter cannot be substituted for a different evidence class" ([SKILL.md][j-qa]).
- **Kind**: skill (53 lines).
- **Proposed address**: gamedev pack, user-invoked (release prep), or a reference of J2's merge.
- **Why it could fit.** The "interrupt" pass (suspend/resume, focus loss, device loss) is often forgotten in Unity mobile work.
- **Why it might not.** Studio-scale. A solo dev rarely runs device matrices.
- **Copy / adapt / idea-only**: **idea-only**: the pass list as a release checklist.
- **Overlap**: J2; W `steam-publish` release checklist (W8).
- **Idle context cost**: ~42.
- **Recommendation** (*proposed*): **idea-only**, a candidate section of a release checklist.

### J4. `gameplay-harness`

- **What it is.** Drive and observe a build through a fixed adapter: `inject_input(frame, actions)`, `now_logical_frame()`, `advance_project_tick()`, `snapshot_state()`, `drain_events()`. It uses a versioned semantic JSONL input tape. Driver modes (logic, replay, scripted, soak, human) are "execution metadata, not a claim". "Do not invent a 60 Hz clock" ([SKILL.md][j-harness]).
- **Kind**: skill (151 lines) + a trace-compare Python script.
- **Proposed address**: Unity pack (as the design for a Unity input-replay harness) or gamedev pack reference.
- **Why it could fit.** It is the missing piece behind A1/A2/A12 (open question 2). It defines the minimal probe interface a Unity harness would need.
- **Why it might not.** It is a spec, not an implementation. The Unity work remains.
- **Copy / adapt / idea-only**: **idea-only**: the probe list and tape idea.
- **Overlap**: fork `unity-debugging` play loop; the baseline's `wait_for`/`eval` loop ([baseline report §2.1](../unity-baseline.md)).
- **Idle context cost**: ~75.
- **Recommendation** (*proposed*): **idea-only**, to inform a Unity harness decision in the playtest/tune theme.

### J5. `action-feel` + the README iron laws

- **What it is.** Choose a column (short-special, long-cancel, commit-whitelist, coyote-platformer) before tuning. Publish a logical tick rate ("render FPS is never the combat clock"), a deterministic phase order and stable hit-instance IDs. Hitstop freezes only the named actor clocks. Acceptance: replay the same trace at different render rates and with reversed entity iteration order ([SKILL.md][j-feel]).
- **Kind**: skill (46 lines).
- **Proposed address**: gamedev pack, model-invoked (combat projects only).
- **Why it could fit.** Frame-rate dependence and same-tick ordering are real Unity combat bugs. The acceptance tests are concrete.
- **Why it might not.** Only matters for action/combat games.
- **Copy / adapt / idea-only**: **adapt**, pairing it with J7's Unity mapping.
- **Overlap**: A7 (feel as presentation) versus J5 (feel as timing rules): complementary.
- **Idle context cost**: ~43.
- **Recommendation** (*proposed*): **owner's call**. Adopt if the owner makes action games; the iron laws are worth keeping as ideas in any case.

### J6. `juice-vfx` + `asset-runtime`

- **What it is.** Presentation effects bind to an authoritative event ID. Every effect declares lifetime, stacking, owner/cleanup, performance class and an accessibility fallback. Entity-bound effects end on *every* removal path, with an orphan reconciler as fallback. Instance caps and pooling apply. "After teardown, live effect/resource counts return to the warm-up baseline" ([juice-vfx][j-juice]). `asset-runtime` owns load/release lifetimes ("assets load twice, stale callbacks resurrect objects …") ([asset-runtime][j-asset]).
- **Kind**: 2 skills (45 + 42 lines).
- **Proposed address**: fold into A7's adaptation (gamedev pack). The Unity lifetime parts relate to the fork's `unity-code-lifecycle`.
- **Why it could fit.** The cleanup and orphan rules are exactly what agent-written VFX code gets wrong.
- **Why it might not.** It duplicates A7 at the presentation layer.
- **Copy / adapt / idea-only**: **idea-only**, merged into A7.
- **Overlap**: A7, W `game-feel`; baseline gap 3 (Addressables release) and gap 6 (pooling).
- **Idle context cost**: ~95 combined if standalone.
- **Recommendation** (*proposed*): **idea-only**, merged into the game-feel candidate.

### J7. `engines/unity` adapter

- **What it is.** 44 lines mapping J's contracts onto Unity. `Update` vs `FixedUpdate` ("a rendered frame may observe zero, one or multiple fixed updates"). No global `Time.timeScale` for per-actor hitstop. `OnApplicationPause`/`Focus` and `runInBackground`. Pool with `ObjectPool<T>`. `Renderer.material` creates a per-renderer copy, so use `sharedMaterial`/`MaterialPropertyBlock`. Addressables handles must be released explicitly ([SKILL.md][j-unity]).
- **Kind**: skill.
- **Proposed address**: Unity pack, as a reference of the game-feel skill or of a future Unity performance skill.
- **Why it could fit.** Every bullet is a real Unity pitfall, and several fall in baseline gaps 3 and 6.
- **Why it might not.** It assumes J's contracts as context.
- **Copy / adapt / idea-only**: **adapt** (rewrite standalone).
- **Overlap**: fork `unity-code-lifecycle` (static/lifecycle, not resources); W `unity-csharp-scripting`.
- **Idle context cost**: 0 as a reference.
- **Recommendation** (*proposed*): **adapt** as a Unity pack reference.

### J8. Design contracts: `game-planning`, `balance-design`, `difficulty-design`, `tutorial-design`

- **What it is.** Short "publish a contract" skills. `game-planning` publishes a slice contract (slice id/revision, pillars and exclusions, core challenge, start/end, failure policy, acceptance evidence) and states "Expansion follows demonstrated slice goals, not a genre checklist" ([game-planning][j-plan]). `balance-design` publishes a balance policy: objective, denominator, intentional asymmetry ([balance][j-balance]). Difficulty and tutorial skills follow the same pattern (descriptions read).
- **Kind**: 4 skills.
- **Proposed address**: gamedev pack, references or user-invoked.
- **Why it could fit.** The slice contract is a game-specific `to-spec` (vertical-slice scope, pillars, exclusions). It could be a Unity/gamedev variant of the fork's spec template.
- **Why it might not.** These are mostly templates. The fork's `to-spec` already structures specs.
- **Copy / adapt / idea-only**: **idea-only**: add the slice-contract fields to a gamedev spec template.
- **Overlap**: fork `to-spec`; A1 preconditions (intent statement, run structure); A2.
- **Idle context cost**: ~190 combined.
- **Recommendation** (*proposed*): **idea-only**.

### J9. Mechanic library (~150 disciplines): combat kit, traversal, camera, world/growth, genres, live-ops, monetization

- **What it is.** One skill per mechanic: `attack-tell`, `parry-guard`, `dodge-iframe`, `platform-jump`, `jump-leniency`, `moving-platform`, `camera-anti-clip`, `lock-on-target`, `cutscene-handoff`, `world-map`, `ability-gate`, `deck-build`, `rhythm-judge`, `iap-offers`, `pity-table` and so on ([README catalog][j-readme], [catalog.json][j-catalog]). For example, `platform-jump` derives gravity and launch speed from height and apex time, and validates gaps with forgiveness off and on ([platform-jump][j-jump]).
- **Kind**: ~150 skills.
- **Proposed address**: none as skills. A possible reference library read by path in a gamedev pack.
- **Why it could fit.** Dense, correct-looking mechanic rules, e.g. "Levels must work without coyote".
- **Why it might not.** ~7k+ idle tokens if model-invoked. They are written in a terse house style that needs J's contract. Monetization/live-ops/gacha skills are off-profile.
- **Copy / adapt / idea-only**: **idea-only**. Read individual skills when a project needs that mechanic.
- **Overlap**: W genres/disciplines (W7). Baseline navigation/physics recipes.
- **Idle context cost**: ~7k+ (inference: the 191-skill total minus non-discipline skills).
- **Recommendation** (*proposed*): **reject as installable**. Note in the catalog as an on-demand reference source.

### J10. Asset and 2D skills (`art-bible`, `character-rig`, `materials`, `model-pipeline`, `open-asset-fixture`, `vfx-generate`, `pixel-animation`, `spine-skeletal`, `sprite-atlas`, `sprite-catalog`, `sprite-skin`)

- **What it is.** Asset pipeline contracts. `open-asset-fixture` prepares licensed open assets for test scenarios with lock files and Python scripts (file listing; [gameplay-validation "Asset fixture preparation"][j-gv-52]).
- **Kind**: 11 skills + scripts + a separate `open-game-assets` plugin.
- **Proposed address**: none.
- **Why it could fit.** "Pinned open assets as test fixtures" is a clever idea for agent playtests.
- **Why it might not.** `sprite-atlas` overlaps baseline `manage-sprite-atlas` (excluded by the baseline report §4). Asset generation is off-profile.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: baseline `manage-sprite-atlas`, `sprite-editor`; W `create-game-assets`.
- **Idle context cost**: ~500 (inference, ~48/skill).
- **Recommendation** (*proposed*): **reject**.

### J11. Mechanism: behaviour A/B experiment, engineering-quality records, contract tests

- **What it is.** A pre-registered A/B pilot. The only input difference is the skill appended to the same task. Arms are randomised, the scorer is blinded, and failures are kept in the report, with "no API retries, manual source repairs, best-of-N selection". It uses OpenAI models ([BEHAVIOR_AB_EXPERIMENT][j-ab]). `engineering_quality.py` validates evaluation records with response hashes and per-criterion judgments, and is honest that "18 authored cases, not 18 measured passes" ([EVALUATION][j-eval]). About 40 pytest files check skill text contracts (file listing).
- **Kind**: CI-eval + scripts.
- **Proposed address**: maintenance machinery (idea-only).
- **Why it could fit.** It is the most rigorous skill-effect experiment design in the ledgers so far, and its record schema is reusable.
- **Why it might not.** OpenAI API runner. Heavy for a personal collection.
- **Copy / adapt / idea-only**: **idea-only**.
- **Overlap**: superpowers skill-testing, pstack blind eval, addy evals (prior ledgers); A14.
- **Idle context cost**: none.
- **Recommendation** (*proposed*): **idea-only** for the maintenance/eval theme, especially pre-registration and "not-run stays in the denominator".

### J12. Convention: `docs/cases/` ("cases, not rules")

- **What it is.** Project names, coordinates and one-off measurements live in `docs/cases/`. Skill bodies stay portable ([playtest-lessons][j-cases]; [gameplay-validation "Cases"][j-gv-52]).
- **Kind**: convention doc.
- **Proposed address**: collection convention (authoring rule).
- **Why it could fit.** It matches A's rule "Do not preserve project validation history in the executable skill body" ([README "Skill Authoring Conventions"][a-readme]). Two independent sources reached the same rule.
- **Why it might not.** The collection may already follow it through `writing-for-agents`.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `writing-for-agents`.
- **Idle context cost**: none.
- **Recommendation** (*proposed*): **idea-only**, into authoring conventions.

## W. `gamedev-skills/awesome-gamedev-agent-skills`

W is a cross-engine catalog with a router. Each skill is written "from primary docs" and pinned to a stated engine release ([NOTICE][w-notice], [VERSION-SUPPORT][w-version]). It installs through `npx skills add` or a Claude plugin marketplace with per-engine bundles (`router`, `unity`, …) ([README][w-readme]). Skills are 100–235 lines.

### W1. Router + whole-catalog install

- **What it is.** It detects one engine by fingerprint (Unity = `Assets/` + `ProjectSettings/ProjectVersion.txt`). It classifies the task into discipline + ≤1 genre + workflow, then reads only the chosen `SKILL.md` bodies in the order engine → discipline → genre → workflow ([router][w-router]).
- **Kind**: router skill + manifest-packaging.
- **Proposed address**: none.
- **Why it could fit.** It is prior art for the router ticket. The marketplace offers per-engine bundles.
- **Why it might not.** Its fallback is "default to Godot" ([router "Routing algorithm" step 6][w-router]). All 75 skills are model-invoked (~7.4k tokens whole; ~1k for `router` + `unity` bundle by the per-skill figures: 176 + 8 × ~95).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: J1, pstack router.
- **Idle context cost**: ~7.4k whole.
- **Recommendation** (*proposed*): **reject** the install.

### W2. Unity skills that fill baseline gaps: `unity-input-system`, `unity-animation`, `unity-build-pipeline`, `unity-scriptableobjects`, `unity-csharp-scripting`

- **What it is.** Unity 6.3 LTS API skills. Input System actions, maps, `PlayerInput`, rebinding ([input][w-input]). Animator controllers, blend trees, humanoid IK ([README][w-readme]). Build profiles, IL2CPP vs Mono, managed stripping, `BuildPipeline.BuildPlayer`, CI builds, Addressables mention ([build][w-build]). SO config, event channels, runtime sets ([SO][w-so]). MonoBehaviour lifecycle, coroutines, serialization ([README][w-readme]).
- **Kind**: 5 skills.
- **Proposed address**: Unity pack, model-invoked (each ~92–106 tokens).
- **Why it could fit.** They cover baseline gaps 1 (animation), 2 (Input System), 12 (build/stripping), 13 (C# style, SO architecture) and partly 3 (Addressables) ([baseline report §5](../unity-baseline.md)). They are version-pinned and stay within each skill's boundary (e.g. input skill → "rebindable-control architecture across engines → `input-systems`").
- **Why it might not.** These are recipe skills. The baseline report says a candidate in a covered area is "only worth taking if it brings a discipline the baseline lacks, not a recipe", but these areas are *uncovered*, so the rule doesn't exclude them. `unity-csharp-scripting` touches serialization and coroutines and could collide with the fork's `unity-serialization`/`unity-code-lifecycle` triggers (inference from descriptions, untested). `unity-scriptableobjects` recommends SO runtime state and event channels. That interacts with domain-reload rules the fork's `unity-code-lifecycle` owns (inference; read in full before adopting).
- **Copy / adapt / idea-only**: **adapt** each. Check facts against the Unity docs, remove cross-links to W skills not taken, and resolve trigger overlap with fork skills. Apache-2.0 requires keeping the license notice and NOTICE.
- **Overlap**: fork `unity-serialization`, `unity-code-lifecycle` (partial for csharp/SO); baseline `unity-cli` (build commands, not settings). No other ledger.
- **Idle context cost**: ~500 tokens for all five.
- **Recommendation** (*proposed*): **adapt `unity-input-system`, `unity-build-pipeline`, `unity-animation`** for the Unity pack. Make **`unity-scriptableobjects`** and **`unity-csharp-scripting`** the owner's call because of the fork overlap. Theme: "Unity pack gap-fill".

### W3. Unity skills that duplicate the baseline: `unity-navmesh`, `unity-tilemap-2d`, `unity-physics`

- **What it is.** NavMesh bake and agents; Tilemap and rule tiles; Rigidbody/colliders/joints ([README][w-readme]).
- **Kind**: 3 skills.
- **Proposed address**: none.
- **Why it could fit.** `unity-physics` covers joints and character movement, which is baseline gap 15.
- **Why it might not.** Baseline `initialize-ai-navigation`, `create-tile-palette-or-rule-tiles` and `physics-3d-collision` cover the rest ([baseline report §2](../unity-baseline.md)). "Never duplicate what it covers" (map Notes).
- **Copy / adapt / idea-only**: reject; `unity-physics` joints section idea-only.
- **Overlap**: baseline.
- **Idle context cost**: ~275.
- **Recommendation** (*proposed*): **reject**.

### W4. `game-jam`

- **What it is.** A jam playbook ([SKILL.md][w-jam]). Read the rules before the theme (length, reveal time, deadline with timezone, asset rules). Prep the boring parts in advance (a project that builds and exports, a title/end stub, a licensed font/SFX source). Express the theme in one sentence ("You [verb] to [goal] while [constraint]"). A scope budget table by jam length ([L51][w-jam-51]). Reserve the last ~20% for shipping ([L43][w-jam-43]). Submit early.
- **Kind**: skill (124 lines).
- **Proposed address**: gamedev pack, user-invoked.
- **Why it could fit.** It is the only jam workflow in the three sources. It is engine-neutral and costs nothing idle as user-invoked.
- **Why it might not.** It is generic advice an experienced jammer knows. Its value is the checklist, not insight.
- **Copy / adapt / idea-only**: **adapt** (strip W cross-links, add Unity WebGL export prep with a pointer to baseline `optimize-web`).
- **Overlap**: A5 (concept search) is a heavier alternative for jam ideation.
- **Idle context cost**: 0 user-invoked (~64 if model-invoked).
- **Recommendation** (*proposed*): **owner's call**. Adopt if the owner jams.

### W5. `prototype-fast`

- **What it is.** Answer one question per prototype, decide throwaway vs keep before coding, use a hard timebox, greybox, instrument for the question, playtest with someone who wasn't told the controls, and decide against pre-written KEEP IF / kill criteria. "Keep → … *rewrite*, don't promote the spike" ([SKILL.md][w-proto], [L43-L56][w-proto-43]).
- **Kind**: skill (119 lines).
- **Proposed address**: none as a skill. Its ideas go into the fork's `prototype`/`unity-prototyping`.
- **Why it could fit.** The pre-written kill criteria and "don't promote the spike" are good additions.
- **Why it might not.** The fork already has `prototype` and `unity-prototyping` for the same job (fork ledger). Two skills on the word "prototype" would collide (the baseline report already flags `new-unity-project` vs `unity-prototyping`).
- **Copy / adapt / idea-only**: **idea-only**.
- **Overlap**: fork `prototype`, `unity-prototyping`; baseline `new-unity-project`.
- **Idle context cost**: 0 if merged.
- **Recommendation** (*proposed*): **idea-only**. Merge the brief template (question, core verb, throwaway?, timebox, keep-if) into `unity-prototyping`.

### W6. Engine-neutral disciplines that touch Unity gaps: `game-feel`, `save-systems`, `performance-optimization`, `camera-systems`, `input-systems`

- **What it is.** `game-feel`: layered juice, "exaggerate briefly and return to rest", scale to event importance, keep feedback off the simulation ([SKILL.md][w-feel]). `save-systems`: what to save, crash-safe atomic writes, schema versioning and migration, autosave ([SKILL.md][w-save]). `performance-optimization`: profile-first frame budget, CPU/GPU triage, pooling, GC, with Unity 6.3 examples ([SKILL.md][w-perf]). Camera and input architecture per the README ([README][w-readme]).
- **Kind**: 5 skills.
- **Proposed address**: gamedev pack, model-invoked (`save-systems`, `performance-optimization`); `game-feel` merges into A7.
- **Why it could fit.** `save-systems` covers baseline gap 10 and `performance-optimization` gap 6 ([baseline report §5](../unity-baseline.md)), both engine-neutral with Unity snippets.
- **Why it might not.** These are broad tutorials rather than sharp disciplines (inference from skim). `performance-optimization` overlaps the fork's `unity-debugging` measurement method and addy's `performance-optimization`.
- **Copy / adapt / idea-only**: **adapt** `save-systems` (the strongest fit: versioning and atomic writes are discipline, not recipe). Merge `game-feel` into A7. The others are idea-only.
- **Overlap**: A7, J6 (feel); fork `unity-debugging` (perf measurement); addy `performance-optimization` (addy ledger).
- **Idle context cost**: ~87 (save) + ~143 (perf).
- **Recommendation** (*proposed*): **adapt `save-systems`** (Unity pack or gamedev pack); the rest idea-only.

### W7. Other disciplines and genres (`game-ai`, `ai-behavior-trees-utility-ai`, `procedural-gen`, `dialogue-systems`, `level-design`, `audio-design`, `shader-programming`, `physics-tuning`, `game-ui-ux`, `create-game-assets`; 9 genre skills)

- **What it is.** Cross-engine concept tutorials. The genre skills are "compositional templates that orchestrate engine + discipline skills" ([README][w-readme]).
- **Kind**: 19 skills.
- **Proposed address**: none.
- **Why it could fit.** They are reference reading when a project enters that genre.
- **Why it might not.** Tutorial-grade and generic. They cost ~1.9k idle tokens in total (inference from per-skill figures).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: J9.
- **Idle context cost**: ~1.9k.
- **Recommendation** (*proposed*): **reject**.

### W8. `steam-publish` + `itch-publish`

- **What it is.** Steamworks onboarding (app/depots, store page, builds, release checklist) and itch.io `butler` uploads ([README][w-readme]).
- **Kind**: 2 skills.
- **Proposed address**: gamedev pack, user-invoked.
- **Why it could fit.** Shipping steps are rare and easy to forget, which suits a zero-cost user-invoked checklist.
- **Why it might not.** Storefront details drift. A skill pinned "2026-09-25" will age.
- **Copy / adapt / idea-only**: **adapt** if wanted.
- **Overlap**: J3 release passes.
- **Idle context cost**: 0 user-invoked.
- **Recommendation** (*proposed*): **owner's call**.

### W9. Non-Unity engine skills (Godot 16, Unreal 6, web 6, other 10)

- **What it is.** Engine API skills pinned to Godot 4.7, UE 5.8, Phaser 4.2, PixiJS 8.21, three.js r186, Bevy 0.20, pygame-ce, LÖVE and Roblox ([VERSION-SUPPORT][w-version]).
- **Kind**: 38 skills.
- **Proposed address**: none (a three.js skill could suit a web pack; the owner's web apps are not games, inference).
- **Recommendation** (*proposed*): **reject**.

### W10. Mechanism: version-support policy + validator

- **What it is.** Each skill states its engine baseline. `VERSION-SUPPORT.md` records "checked" dates and rules: "Read the project version before proposing APIs … Never combine snippets from different engine majors" ([VERSION-SUPPORT][w-version]). `scripts/validate-skills.py` plus tests gate merges ([README][w-readme]).
- **Kind**: convention doc + CI script.
- **Proposed address**: maintenance machinery.
- **Why it could fit.** Unity pack skills will need exactly this: a stated Unity version per skill and a re-check date.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: the baseline's `required_editor_version` / `required_packages` frontmatter ([baseline report §2](../unity-baseline.md)).
- **Recommendation** (*proposed*): **idea-only** for maintenance: a version-pin field per Unity pack skill.

## D. Further repos (one-line pitches)

W lists no other repos (see Overview). These are referenced from A's README ([README "External Skill References"][a-readme]):

- **`abagames/agentic-gamedev-games`**: the games A's skills were extracted from. Evidence for how the skills behave in practice; worth a skim before adopting A1/A2 (not read here).
- **`mizchi/skills` `empirical-prompt-tuning`**: an iterative method for evaluating and improving prompts and skills. A candidate source for the maintenance/eval theme (not read here).
- A also references addy `source-driven-development`, `browser-testing-with-devtools`, `performance-optimization` and superpowers `systematic-debugging`. Those are covered by the addy and superpowers ledgers.

## Proposed placement summary

| Address | Candidates (proposed) |
|---|---|
| **Gamedev pack, user-invoked** | A1 refine prototypes, A2 balance, A4 stress-test concepts, A10 screen readability, W4 game-jam; owner's call: A9 legibility, A11 coverage, A15 turn-based, W8 store publishing |
| **Gamedev pack, model-invoked** | A3 invariants (~77), A7 game feel merged with J6/W6 (~60), W6 save-systems (~87) |
| **Unity pack** | W2 input/build/animation (~290) + owner's call SO/csharp (~190); J7 Unity adapter (reference); J2 merged into `unity-verification`; A12/A13 merged into `unity-debugging` |
| **Core** | A19 blind restoration (user-invoked); owner's call: A21 critique, A24 verification scope |
| **Maintenance / install architecture** | A22 plugin-bundle builder, A23 external-skill notes, A14 mutants, J11 A/B eval, W10 version pins, J12 cases-not-rules |
| **Reject** | A6, A16, A17, A18, A21 dispatch/ladders, J1 pack, J9, J10, W1, W3, W7, W9 |

Total idle cost of the proposed model-invoked picks: about 224 (gamedev pack) + about 290–480 (Unity pack), estimated as characters / 4 before any description rewrite.

## Method and limits

- **Read in full:** A `refining-game-prototypes` (+ the first half of `stage-checks.md`), `evaluating-gameplay-balance`, `maximizing-game-feel`, `implementing-gameplay-invariants`, `stress-testing-game-concepts`, `designing-mini-games`, `exploring-game-design-space`, `critiquing-own-response`; A's README, AGENTS.md, PLUGIN_RELEASE.md (head); J `action-feel`, `gameplay-validation`, `engines/unity`, `platform-jump`, `game-planning`, `game-qa`, `balance-design`, `juice-vfx`, the pack entry, CONTRACT.md, README; W README, VERSION-SUPPORT.md.
- **Read in part (first 20–70 lines):** A `localizing-game-state-divergence`, `adversarially-validating-game-repairs`, `auditing-gameplay-implementation-coverage`, `gating-intent-legibility`, `auditing-game-screen-readability`, `directing-game-visuals`, `verifying-turn-based-games`, `generating-semantic-game-mutants`, `arcadifying-mini-games`, `curating-game-concept-portfolio`, the agent-workflow skills; J `dispatcher`, `gameplay-harness`, EVALUATION.md, BEHAVIOR_AB_EXPERIMENT.md, `docs/cases/playtest-lessons.md`; W `router`, `game-jam`, `prototype-fast`, `game-feel`, `unity-input-system`, `unity-build-pipeline`, `unity-scriptableobjects`, `save-systems`.
- **Frontmatter only:** all other A skills; J's remaining ~175 skills (names from the file listing, descriptions sampled); W's remaining skills (README scope table).
- Claims about skills read only in part or by description are marked by their citation scope. Any judgment of quality beyond the text read is *inference*.

[a-root]: https://github.com/abagames/agentic-gamedev-skills/tree/72309959e3422acdcb95d30e3b0ffd9ed2bd149d
[a-license]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/LICENSE
[a-readme]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/README.md
[a-agents]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/AGENTS.md#verification-scope
[a-release]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/PLUGIN_RELEASE.md
[a-refine]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/refining-game-prototypes/SKILL.md
[a-refine-pre]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/refining-game-prototypes/SKILL.md?plain=1#L31-L48
[a-refine-loop]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/refining-game-prototypes/SKILL.md?plain=1#L50-L83
[a-refine-rules]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/refining-game-prototypes/SKILL.md?plain=1#L103-L130
[a-refine-fail]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/refining-game-prototypes/SKILL.md?plain=1#L179-L203
[a-stagechecks]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/refining-game-prototypes/references/stage-checks.md
[a-balance]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/evaluating-gameplay-balance/SKILL.md
[a-balance-contract]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/evaluating-gameplay-balance/SKILL.md?plain=1#L8-L18
[a-balance-band]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/evaluating-gameplay-balance/SKILL.md?plain=1#L20-L27
[a-balance-guard]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/evaluating-gameplay-balance/SKILL.md?plain=1#L29-L36
[a-balance-triage]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/evaluating-gameplay-balance/SKILL.md?plain=1#L51-L59
[a-inv]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/implementing-gameplay-invariants/SKILL.md
[a-inv-readout]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/implementing-gameplay-invariants/SKILL.md?plain=1#L92-L99
[a-stress]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/stress-testing-game-concepts/SKILL.md
[a-stress-hard]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/stress-testing-game-concepts/SKILL.md?plain=1#L34
[a-stress-55]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/stress-testing-game-concepts/SKILL.md?plain=1#L55
[a-explore]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/exploring-game-design-space/SKILL.md
[a-curate]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/curating-game-concept-portfolio/SKILL.md
[a-design]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/designing-mini-games/SKILL.md
[a-feel]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/maximizing-game-feel/SKILL.md
[a-feel-register]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/maximizing-game-feel/SKILL.md?plain=1#L16-L26
[a-feel-vocab]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/maximizing-game-feel/SKILL.md?plain=1#L28-L38
[a-feel-impl]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/maximizing-game-feel/SKILL.md?plain=1#L42-L50
[a-feel-validate]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/maximizing-game-feel/SKILL.md?plain=1#L63-L80
[a-visuals]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/directing-game-visuals/SKILL.md
[a-legib]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/gating-intent-legibility/SKILL.md
[a-legib-17]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/gating-intent-legibility/SKILL.md?plain=1#L17
[a-legib-109]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/gating-intent-legibility/SKILL.md?plain=1#L109-L117
[a-screen]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/auditing-game-screen-readability/SKILL.md
[a-coverage]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/auditing-gameplay-implementation-coverage/SKILL.md
[a-diverge]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/localizing-game-state-divergence/SKILL.md
[a-diverge-63]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/localizing-game-state-divergence/SKILL.md?plain=1#L63
[a-diverge-94]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/localizing-game-state-divergence/SKILL.md?plain=1#L94
[a-repair]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/adversarially-validating-game-repairs/SKILL.md
[a-repair-82]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/adversarially-validating-game-repairs/SKILL.md?plain=1#L82
[a-mutants]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/generating-semantic-game-mutants/SKILL.md
[a-turn]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/verifying-turn-based-games/SKILL.md
[a-arcade]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/arcadifying-mini-games/SKILL.md
[a-blind]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/gating-by-blind-restoration/SKILL.md
[a-batch]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/gating-expensive-batch-work/SKILL.md
[a-migrate]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/migrating-agents-md-to-control-flow/SKILL.md
[a-refinewf]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/refining-workflows-from-artifacts/SKILL.md
[a-extract]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/extracting-agent-skills/SKILL.md
[a-critique]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/critiquing-own-response/SKILL.md
[a-dispatch]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/dispatching-agent-work/SKILL.md
[a-ladder]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/.agents/skills/extracting-spec-design-ladders/SKILL.md
[j-root]: https://github.com/jammyfu/open-game-skills/tree/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1
[j-license]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/LICENSE
[j-readme]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/README.md
[j-entry]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/SKILL.md
[j-contract]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/CONTRACT.md
[j-dispatch]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/dispatcher/SKILL.md
[j-catalog]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/catalog.json
[j-gv-12]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/disciplines/gameplay-validation/SKILL.md?plain=1#L12
[j-gv-52]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/disciplines/gameplay-validation/SKILL.md?plain=1#L52
[j-qa]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/disciplines/game-qa/SKILL.md
[j-harness]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/disciplines/gameplay-harness/SKILL.md
[j-feel]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/disciplines/action-feel/SKILL.md
[j-juice]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/disciplines/juice-vfx/SKILL.md
[j-asset]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/disciplines/asset-runtime/SKILL.md
[j-unity]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/engines/unity/SKILL.md
[j-plan]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/disciplines/game-planning/SKILL.md
[j-balance]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/disciplines/balance-design/SKILL.md
[j-jump]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/skills/disciplines/platform-jump/SKILL.md
[j-ab]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/docs/BEHAVIOR_AB_EXPERIMENT.md
[j-eval]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/docs/EVALUATION.md
[j-cases]: https://github.com/jammyfu/open-game-skills/blob/4ed0e224e8d8f56c8222a3de6fd439aa7abad4e1/docs/cases/playtest-lessons.md
[w-root]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/tree/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd
[w-readme]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/README.md
[w-notice]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/NOTICE
[w-version]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/docs/VERSION-SUPPORT.md
[w-router]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/router/SKILL.md
[w-input]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/skills/unity/unity-input-system/SKILL.md
[w-build]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/skills/unity/unity-build-pipeline/SKILL.md
[w-so]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/skills/unity/unity-scriptableobjects/SKILL.md
[w-jam]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/skills/workflows/game-jam/SKILL.md
[w-jam-43]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/skills/workflows/game-jam/SKILL.md?plain=1#L43
[w-jam-51]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/skills/workflows/game-jam/SKILL.md?plain=1#L51
[w-proto]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/skills/workflows/prototype-fast/SKILL.md
[w-proto-43]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/skills/workflows/prototype-fast/SKILL.md?plain=1#L43-L56
[w-feel]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/skills/disciplines/game-feel/SKILL.md
[w-save]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/skills/disciplines/save-systems/SKILL.md
[w-perf]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/0a70cfc64672d512c5b5b6006b5dcb5cf90dbdbd/skills/disciplines/performance-optimization/SKILL.md
