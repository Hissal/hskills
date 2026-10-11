# Ledger: ideas-only skim (`game-studio`, `trailofbits/skills`, `finding-unknowns-skills`)

Ticket: [Ledger: ideas-only skim](https://github.com/Hissal/skill-collection/issues/31), part of [Wayfinder: personal skill collection blueprint](https://github.com/Hissal/skill-collection/issues/1).

Sources, each read on 2026-10-11 from a shallow clone outside this repo. Nothing from any source was installed or executed. Every source link below is pinned to the SHA read.

| Source | SHA read | Ticket SHA | Scope read | Licence |
|---|---|---|---|---|
| `openai/plugins` | [`0722921`][g-root] (committed 2026-10-08) | `0722921`, unchanged | only `plugins/game-studio`: all 9 skills in full and 13 of 16 reference files (the three starter-code files `gltf-loading-starter`, `rapier-integration-starter` and `react-three-fiber-starter` were not read); the 3 Python scripts not read | `plugin.json` says MIT ([plugin.json][g-manifest]); there is no licence file in the plugin folder or at the repo root |
| `trailofbits/skills` | [`442fc9d`][t-root] (committed 2026-10-09) | `82fe822`, **re-pinned**: 3 commits since, none touching the five plugins read (`gh api …/compare`, file list) | 5 of 44 plugins: each `SKILL.md` in full, plus only the reference files the entries link (most references, workflows, agents and evals were not read) | **CC-BY-SA-4.0** ([LICENSE][t-license]): ideas only |
| `Neeeophytee/finding-unknowns-skills` | [`ca5696a`][f-root] (committed 2026-09-28) | `ca5696a`, unchanged | 2 of 14 skills in full, plus `guidance/finding-unknowns.md` and the README head | MIT ([LICENSE][f-license]) |

Fork links point at the local fork `C:\dev\skills\mattpocock-skills-unity` @ `3d926c6`. Vocabulary follows [`GLOSSARY.md`](../../GLOSSARY.md). *Inference* marks a claim reasoned from the sources and not stated by them. Everything below is **proposed**. The owner decides in theme sessions.

**Idle cost method.** Description characters measured by script from each `SKILL.md` frontmatter; tokens estimated at 2.6 chars/token plus ~5 for the name, the ratio [loading-mechanics](../loading-mechanics.md) measured. An estimate, not a `claude plugin details` measurement.

## Overview

**13 entries**: 6 for `game-studio` (G1-G6), 5 for `trailofbits` (T1-T5), 2 for `finding-unknowns` (F1-F2). No skill is proposed for install as published. The weight of this ledger is the `game-studio` lens, answered in its own section before the entries.

**Standouts (proposed):**

- **A "playable" prototype shape for the fork's `prototype`** (G2, G3, G4, and the lens section). The fork has a logic branch and a UI branch. Neither is "play this mechanic and see if it works", which is what the owner's single-file card-game prototypes are.
- **An agent self-check before handing over an HTML prototype** (G4). `unity-prototyping` has one for Unity; `prototype` has none for HTML.
- **A sharper web-or-engine test** (lens section, question 3): decide by *which side owns the question*, simulation or renderer, using `game-studio`'s own ownership lists.
- **`context-audit`** (F1): a 29-line, MIT, judgment-based audit of the instruction layers. The only candidate here that could be taken close to as-is.
- **`reference-hunt`'s semantics summary** (F2): the missing step for carrying a validated HTML prototype's logic into C#.
- **`second-opinion`'s input and failure rules** (T1): joins the cross-model review theme as a fifth source, ideas only.

**What `game-studio` is not.** It never mentions Unity, any native engine, a single-file prototype or throwaway code (grep over the plugin: the only "prototype" hits are one example prompt and three lines of the Three.js skill). It is a guide to building *full browser games* on Phaser + TypeScript + Vite or Three.js. So it gives no web-versus-engine criteria directly. The answers below are built from what it says belongs to which layer, and each step beyond its text is marked.

---

## The `game-studio` lens: what is quicker on the web than in Unity

### Question 1: which game ideas are quicker to prototype on the web, and which are not

What the skills state:

- **The simulation and the renderer own different things.** "Simulation owns entities, turns, timers, collisions, progression, and saveable state. The renderer owns scene composition, animation playback, camera, particles, and input plumbing." ([web-game-foundations L31-L33][g-found-split])
- **DOM is the right surface for text-heavy UI.** "Canvas or WebGL should handle the playfield. DOM should handle text-heavy HUD, menus, settings, and accessibility-sensitive controls." ([L44-L47][g-found-dom]). "Canvas-only UI when DOM would be clearer and cheaper" is an anti-pattern ([game-ui-frontend L102][g-ui-anti]).
- **Deck and turn-based games are on its "covered well" list**: "Turn-based grids and tactics", "Lightweight management or deck-driven battle scenes" ([phaser-2d-game L40-L46][g-phaser-modes]).
- **Everything past that needs machinery.** Sprites need a pipeline with anchor and scale normalisation ([sprite-pipeline L10-L28][g-sprite]). 3D needs units, pivots, collision proxies, LODs and baked lighting decided "before runtime integration starts" ([web-game-foundations L48-L50][g-found-3d]), a GLB pipeline, a physics library, and handling for resize and WebGL context loss ([three-webgl-game L101-L107][g-three-safety]). The plugin says of itself: "Do not claim that this plugin offers equal 3D depth to the Phaser track" ([L109-L111][g-three-scope]).
- **Feel lives in the renderer**: "screen shake, hit-stop, and parallax" ([phaser-2d-game L52][g-phaser-feel]); "hit, hurt, and attack timing" is a playtest check ([playtest-checklist L15-L21][g-check-2d]).

*Inference* from those five points, as a test the fork could carry:

| The idea is quicker on the web when | The idea belongs in Unity when |
|---|---|
| The question is about something the **simulation** owns: rules, turns, progression, economy, what is legal now | The question is about something the **renderer** owns: animation, camera, particles, timing, feel |
| The whole playfield is DOM-shaped: cards, hands, lists, grids, bars, text. No canvas is needed at all | The playfield is spatial: movement, collision, depth, a camera |
| Player verbs are discrete: click, drag, select, confirm | Verbs are continuous: move, aim, jump, steer |
| Time is turns or steps | Time is frames |
| No art is needed beyond text, colour and CSS shapes | It needs sprites, models or audio to be judged |
| It needs nothing from an existing project | It needs existing scene content, prefabs or production code |

This matches the owner's own examples (a Hearthstone-like, most roguelike deckbuilders): every row lands on the left. It also names the grey zone. Grid tactics and top-down games are 2D and turn-based, but `game-studio` puts them on Phaser with a build step ([engine-selection L13-L19][g-engine-phaser]). *Inference*: a tactics grid drawn as DOM cells stays in single-file territory; once it wants sprites, tilemaps or a moving camera it has left it, and Unity's 2D tooling is the quicker route for this owner.

One cost the source does not cover and the fork does: HTML logic "will not lift into the C# code" ([unity-prototyping L16][fk-up-choice]). A web prototype answers a go/no-go or a rules question; it does not produce reusable Unity code. F2 offers a way to shrink that cost.

### Question 2: what would help an agent build such a prototype well

| Topic | What `game-studio` says | Fork today | Gap |
|---|---|---|---|
| Simulation / render split | State owned outside the renderer; "Treating the renderer as the source of truth for game state" is an anti-pattern ([foundations L78-L86][g-found-anti]). One bridge where the view reads state and emits actions back ([phaser-2d-game L35][g-phaser-impl]) | **Covered.** `LOGIC.md` step 2: a pure module with "no DOM, no `document`, no button handlers reaching inside it" ([LOGIC.md L22-L33][fk-logic-module]) | Small: the source adds that the simulation also owns *turns, timers and progression*, and that state is serializable ([foundations L41-L43][g-found-save]). *Inference*: for a game that also means the random seed, so a run can be replayed |
| Input model | "Define actions such as `move`, `confirm`, `cancel` … Map physical inputs to actions in one place" ([foundations L34-L36][g-found-input]) | **Partly covered.** Free-play buttons each dispatch an action ([LOGIC.md L45][fk-logic-layout]) | Drag, keyboard and click-on-card inputs are not mentioned. One action map keeps them out of the pure module |
| UI / HUD rules | Critical information first, secondary second, rare settings behind menus ([game-ui-frontend L23-L26][g-ui-hier]). "The initial screen should feel playable within a few seconds"; keep the centre of the playfield clear; long notes behind toggles ([L27-L33][g-ui-protect]). "Pointer, keyboard, and game-state feedback are obvious" ([L86][g-ui-good]); "input-state feedback and turn-state clarity" ([game-playtest L37][g-play-2d]) | **Not covered, and partly opposed.** `LOGIC.md` lays the page out as title, state panel, buttons, walkthrough tabs, with "No animations, no gimmicks" ([L41-L50][fk-logic-layout]). That is a debug panel by design | A playable prototype needs the board first and the state panel behind a toggle. See the proposal below |
| Browser playtest and screenshots | Boot and confirm the first actionable screen; exercise the main verbs; screenshot representative states; check the UI layer separately from the render layer ([game-playtest L12-L18][g-play-flow]). "Prefer Playwright or equivalent browser automation already available"; without it, "a structured manual pass" with evidence ([L20-L26][g-play-tools]) | **Not covered for HTML.** `LOGIC.md` step 4 hands the file over without the agent opening it ([L52-L54][fk-logic-handover]). `unity-prototyping` does have a self-check: compile, run the menu item, confirm Play, switch a variant ([L63-L65][fk-up-handover]) | The HTML side has no equivalent of the Unity hand-over check |
| State inspection | "Keep debug overlays and perf probes easy to toggle" ([foundations L41-L43][g-found-save]); a `diagnostics/` module for debug flags ([three-webgl-architecture][g-three-arch]) | **Covered for humans.** Rule 5, "Surface the state" ([prototype SKILL.md L27][fk-proto-rules]) | Nothing gives the *agent* a way to read state. The source does not either. abagames' `probing-web-game-mechanics` and tipoLi's GameProbe do ([gamedev ledger](gamedev-repos.md) A18, [unity-workflow ledger](unity-workflow-repos.md) A1) |

What in `game-studio` would *hurt* a throwaway prototype: its stack (Phaser, TypeScript, Vite: [phaser-2d-game L12-L17][g-phaser-stack]) breaks the fork's "no framework, no bundler, no server" ([LOGIC.md L37][fk-logic-layout]); "Establish visual direction before coding" and "Design for both desktop and mobile from the start" ([game-ui-frontend L16-L36][g-ui-standards]) break "Skip the polish" ([prototype SKILL.md L26][fk-proto-rules]); the asset manifest ([foundations L37-L40][g-found-assets]) has nothing to manage.

### Question 3: what would sharpen the fork's web-or-engine decision

Where the fork stands ([unity-prototyping L12-L19][fk-up-choice], [prototype SKILL.md L14-L19][fk-proto-branches]):

- The decision exists only inside `unity-prototyping`, and `prototype` routes there only "In a Unity repo".
- In Unity is the default. HTML is offered once, in one line, in two cases: a **logic** prototype when "the person judging it will not open the Unity editor", and a **flat screen layout** where in-engine fidelity does not matter yet. "Never for world-space UI, feel, or anything that needs real scene content."

Against the owner's stated practice, three gaps (*inference*, comparing those lines with the ticket's lens):

1. **The owner's main case is not one of the two offers.** "This card-game idea is quicker to try in a browser" is neither "the judge won't open Unity" nor "a flat menu layout". As written, a new deckbuilder mechanic raised in a Unity repo is built as an EditorWindow driver.
2. **Outside a Unity repo there is no engine question at all, and no game shape.** A fresh idea in an empty folder reaches `prototype`, which offers logic (a state panel) or UI (variants on a route, React-flavoured). Neither is a playable game.
3. **The test is by audience and by surface, not by what the question is about.** `game-studio`'s ownership split gives a cleaner test: a question the simulation owns can be answered on the web; a question the renderer owns cannot. This is the same rule the [compound-engineering ledger](compound-engineering.md) (entry 25) lifted from `ce-prototype`, "Do not fake the dimension being tested", with `game-studio` supplying the list of which dimension is which.

### Proposed for the fork's `prototype` and `unity-prototyping`

All *proposed*; each is a merge into an existing fork skill body or reference, so idle cost is 0 except where noted.

| # | Proposal | Into | From |
|---|---|---|---|
| P1 | A third branch, **playable**: "is this mechanic or loop worth building?" One HTML file: the pure simulation module of `LOGIC.md`, a DOM board in front, the state panel behind a toggle, one action map for click, drag and keys, whose-turn and what-is-legal always visible. The description gains a few words ("or try a game mechanic") | `prototype` (new `PLAY.md`, or a section of `LOGIC.md`) | G2, G3 |
| P2 | A **hand-over check for HTML prototypes**: open it, reach the first actionable screen, press each main verb, run each walkthrough, screenshot, read the console; report "unvalidated" when no browser tool is present. Mirrors `unity-prototyping`'s hand-over | `prototype` | G4 |
| P3 | The simulation is **serializable and seeded**, with a state export the agent can read (*inference* beyond the source, which only says save simulation state and keep debug toggles) | `prototype` `LOGIC.md` step 2 | G2 |
| P4 | Replace the two narrow HTML offers with the **ownership test** and the six-row table above, keeping "never for feel, world-space UI or real scene content" and "offer at most once". Add the third HTML case: a self-contained rules-and-UI loop that needs nothing from the project | `unity-prototyping` "In Unity or in HTML" | lens Q1, Q3 |
| P5 | Move the web-or-engine test up into `prototype`, so it also fires outside a Unity repo; `unity-prototyping` keeps the Unity mechanics | `prototype` | lens Q3 |
| P6 | State the cost and the way out: HTML logic does not lift; if the answer is "build it", port by semantics summary (F2) | both | F2 |
| — | **Not** taken: Phaser/TypeScript/Vite, the asset manifest, visual direction and theming, mobile layouts, every 3D rule | — | G1, G5, G6 |

Already covered by the fork, so nothing to add: the pure liftable module, the single-file rule, state shown after every action, capture on a throwaway branch, HTML for a flat HUD or menu layout, the ban on HTML for feel.

---

## A. `openai/plugins` → `game-studio`

A Codex plugin (`.codex-plugin/plugin.json` only, no Claude manifest), version 0.1.2, "Design, prototype, and ship browser games" ([plugin.json][g-manifest]). 9 skills, all model-invoked (each `agents/openai.yaml` carries only `interface`, no `allow_implicit_invocation: false`), about **710 tokens** idle as published. Skills reach shared files through `../../references/`, so a single skill cannot be copied without them.

### G1. `game-studio` (router) and the plugin shape

- **What it is.** The entry skill. It classifies a request (2D default, 3D plain TS, 3D React, asset pipeline, alternative engine, shared) and routes to a specialist "immediately after classification" ([SKILL.md L33-L51][g-router-routing]). Default: "a 2D Phaser path unless the user explicitly asks for 3D" ([L10][g-router]). Workflow: lock the fantasy and player verbs, define the core loop, pick the track, "Define the UI surface early", decide assets, "Close with a playtest loop" ([L53-L67][g-router-flow]).
- **Kind**: skill (router) + manifest-packaging.
- **Proposed address**: none.
- **Why it could fit.** The six-step workflow is a tidy kickoff order for any game.
- **Why it might not.** It routes between web stacks. It has no "is the web the right place" step, which is the owner's actual question. Full web games are out of the owner's interest.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: jammyfu's dispatcher and awesome-gamedev's router ([gamedev ledger](gamedev-repos.md) J1, W1); tipoLi's game-kickoff skill ([unity-workflow ledger](unity-workflow-repos.md)).
- **Idle context cost**: ~76 tokens.
- **Recommendation (proposed)**: reject. The router pattern is already recorded from three other sources.

### G2. `web-game-foundations`

- **What it is.** Six architecture rules set before coding ([SKILL.md L29-L50][g-found-rules]): separate simulation from rendering; one explicit input action map; asset loading as a system; save, debug and perf boundaries "up front"; DOM overlays for HUD and menus; 3D conventions locked early. Then a pre-code checklist of eleven items ([L62-L76][g-found-check]) and seven anti-patterns ([L78-L86][g-found-anti]).
- **Kind**: skill.
- **Proposed address**: none as a skill; ideas into fork `prototype` (P1, P3) and `unity-prototyping` (P4).
- **Why it could fit.** The simulation/renderer ownership lists are the best evidence in this source for the web-or-engine test. The action map and "save serializable simulation state, not renderer objects" are two lines a playable prototype benefits from.
- **Why it might not.** The fork already has the central rule (pure module, page as a thin shell). Half the rules (asset manifest, 3D conventions, perf probes) are production concerns a throwaway prototype should skip.
- **Copy / adapt / idea-only**: idea-only. As a skill it describes a multi-module `src/` tree; the owner wants one file.
- **Overlap**: fork `prototype` `LOGIC.md` step 2 (covered); abagames' invariants and state-divergence skills, which assume the same split ([gamedev ledger](gamedev-repos.md) A3, A12).
- **Idle context cost**: ~80 tokens as published; 0 as a merge.
- **Recommendation (proposed)**: idea-only. Carry the ownership split into P4, the action map into P1, serializable state into P3.

### G3. `game-ui-frontend` (+ `frontend-prompts.md`, `three-hud-layout-patterns.md`)

- **What it is.** UI rules for a game screen ([SKILL.md L14-L39][g-ui-standards]): hierarchy (critical first), "Protect the playfield first", readable overlays, input boundaries between camera and menus. A 3D HUD budget ("no more than roughly 20-25% of the viewport covered by persistent HUD", [L51-L56][g-ui-budget]). Twelve anti-patterns, led by "Generic app dashboard layouts" ([L91-L104][g-ui-anti]). Two reference files give prompt templates and a low-chrome layout ([frontend-prompts][g-prompts], [three-hud-layout-patterns][g-hud]).
- **Kind**: skill + 2 references.
- **Proposed address**: none as a skill; three lines into the proposed playable branch (P1).
- **Why it could fit.** An agent asked for a card game in HTML tends to produce a dashboard: panels of equal weight round the edges. "The initial screen should feel playable within a few seconds", hierarchy, and visible turn and input state are the corrective, and they cost nothing in polish.
- **Why it might not.** Most of the skill is about a 3D camera fighting an overlay, which a DOM card game does not have. Theme, typography, motion and mobile rules are polish. In a card game the UI *is* the playfield, so "protect the playfield" needs rewording (*inference*).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: abagames' `auditing-game-screen-readability` and `gating-intent-legibility` ([gamedev ledger](gamedev-repos.md) A9, A10); baseline `ui` for in-engine UI ([unity-baseline](../unity-baseline.md)); fork `unity-prototyping`'s existing HTML offer for a flat HUD or menu.
- **Idle context cost**: ~67 tokens as published; 0 as a merge.
- **Recommendation (proposed)**: idea-only, into P1.

### G4. `game-playtest` (+ `playtest-checklist.md`)

- **What it is.** A browser QA pass ([SKILL.md L12-L18][g-play-flow]): boot to the first actionable screen, exercise the main verbs, screenshot representative states, check the UI layer apart from the render layer, report in severity order. "When the game is canvas or WebGL heavy, screenshots are mandatory because DOM assertions alone miss visual regressions" ([L23][g-play-tools]). Each finding states what the user sees, how to reproduce it, why it matters and which subsystem owns it ([L62-L69][g-play-report]). The checklist adds universal questions such as "Does the game boot into a useful first state?" and "Do pause, failure, and recovery states work?" ([playtest-checklist L5-L13][g-check-universal]).
- **Kind**: skill + reference.
- **Proposed address**: none as a skill; a hand-over check into fork `prototype` (P2).
- **Why it could fit.** It is short and tool-neutral, and its first two steps are exactly what the fork's HTML branch lacks. A DOM-only prototype is the easy case: DOM assertions *do* see the state, so screenshots are a bonus, not a requirement (*inference* from L23).
- **Why it might not.** It names Playwright "already available in the repo"; a single HTML file has no repo tooling, so the check depends on whatever browser tool the session has. It is a QA pass for a game meant to ship; a throwaway prototype needs perhaps five of its lines.
- **Copy / adapt / idea-only**: idea-only. It has no method beyond the list: no state injection, no scripted run.
- **Overlap**: abagames' `smoke-testing-web-games` and `probing-web-game-mechanics`, which are deeper on the same job and were proposed rejected for Unity work ([gamedev ledger](gamedev-repos.md) A18); the abagames playtest/tune loop, which starts *after* a playable build exists (A1); fork `unity-prototyping`'s hand-over.
- **Idle context cost**: ~83 tokens as published; 0 as a merge.
- **Recommendation (proposed)**: idea-only, into P2. Worth re-reading A18 in the same session: its rejection was for Unity, and the owner's web prototypes are the case it fits.

### G5. `phaser-2d-game` (+ `phaser-architecture.md`, `engine-selection.md`)

- **What it is.** The plugin's main path: Phaser, TypeScript, Vite, DOM HUD ([SKILL.md L12-L17][g-phaser-stack]). Gameplay state outside scenes, thin scenes, "renderer-facing objects disposable", "animation state derived from gameplay state" ([L19-L38][g-phaser-arch]). A `src/` tree splitting `simulation/`, `content/`, `input/`, `phaser/`, `ui/` ([phaser-architecture][g-phaser-ref]). The engine table says when each stack fits and lists mismatches to avoid ([engine-selection][g-engine]).
- **Kind**: skill + 2 references.
- **Proposed address**: none.
- **Why it could fit.** Its "2D Modes Covered Well" list is the one place deck-driven games are named, which supports question 1. The `content/` folder (authored data apart from rules) is a good habit for card definitions.
- **Why it might not.** A build chain and a framework: the opposite of a double-click file. The owner has Unity for anything that wants sprites, tilemaps or a camera.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: awesome-gamedev's web engine skills ([gamedev ledger](gamedev-repos.md) W9); baseline 2D skills.
- **Idle context cost**: ~77 tokens.
- **Recommendation (proposed)**: reject. Open question 5 asks whether a library by `<script>` tag is ever acceptable.

### G6. `three-webgl-game`, `react-three-fiber-game`, `web-3d-asset-pipeline`, `sprite-pipeline`

- **What it is.** One line each, as the ticket asks. [`three-webgl-game`][g-three]: plain Three.js with Rapier physics and SpectorJS. [`react-three-fiber-game`][g-r3f]: the same inside a React app. [`web-3d-asset-pipeline`][g-3dassets]: Blender to GLB with glTF Transform, compression and LODs. [`sprite-pipeline`][g-sprite]: whole-strip sprite generation from one approved frame, normalised by three bundled Python scripts, and it needs Codex's `imagegen` skill ([L54][g-sprite]).
- **Kind**: 4 skills, 3 scripts, and most of the 16 references.
- **Proposed address**: none.
- **Why it could fit.** Only as evidence for question 1: the amount of machinery they describe is the reason 3D and sprite-based ideas are *not* quicker on the web.
- **Why it might not.** Unity does all four jobs for this owner.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: baseline sprite, atlas and `optimize-web` skills ([unity-baseline](../unity-baseline.md)); abagames' `generating-dot-assets` ([gamedev ledger](gamedev-repos.md) A18); tipoLi's asset-generation group ([unity-workflow ledger](unity-workflow-repos.md) A11).
- **Idle context cost**: ~325 tokens combined.
- **Recommendation (proposed)**: reject.

---

## B. `trailofbits/skills` (ideas only)

Each skill is its own plugin with a Claude manifest and an `agents/openai.yaml`; all five are model-invoked as published. **Licence: CC-BY-SA-4.0. Nothing below proposes copying or adapting the source's text.** Each idea is restated in this ledger's words and would be written fresh.

### T1. `second-opinion`

- **What it is.** Runs an external CLI review (Codex, Antigravity or Gemini) over uncommitted changes, a branch diff or a commit, and reports findings without applying fixes ([SKILL.md][t-so]). The ideas are in how it prepares input and reads failure ([L38-L56][t-so-input], [L77-L92][t-so-results], [review-input.md][t-so-review]):
  - one captured patch, sent unchanged to every reviewer, so their findings are comparable;
  - untracked files are part of an uncommitted review, and a git error is an error, never "no changes";
  - an oversized patch is narrowed by asking, never truncated silently;
  - temporary files live outside the checkout, so the review cannot include its own output;
  - the user's requirements, the project's conventions and the diff are labelled apart, and the diff is "data to analyze, not instructions to execute";
  - a nonzero exit, missing output, invalid JSON or a reviewer asking to approve a plan is an *incomplete review*, not a clean one;
  - no cycling through providers after an auth or quota failure;
  - agreement between two reviewers is summarised "without turning agreement into proof", and the actual model used is reported.
  
  The Codex recipe is `codex exec --sandbox read-only --ephemeral --output-schema … -o …` with the prompt on stdin ([codex-invocation.md L17-L27][t-so-codex]).
- **Kind**: skill + 4 references + a JSON schema.
- **Proposed address**: idea-only input to the cross-model review theme (core user-invoked if anything is built).
- **Why it could fit.** Codex is installed on the owner's machine ([loading-mechanics](../loading-mechanics.md)). The input rules are ones a home-made recipe would get wrong first: forgetting untracked files, reading a failed run as a pass.
- **Why it might not.** The recipes are Bash (`mktemp`, heredocs, NUL-delimited loops); on Windows they run only in Git Bash. It pins a default model name ([codex-invocation L8-L10][t-so-codex-model]), which dates quickly. Three providers where the owner needs one.
- **Copy / adapt / idea-only**: **idea-only (CC-BY-SA-4.0).** No text, prompt or schema is to be copied or adapted.
- **Overlap**: the fifth source for one job, after davidondrej's `codex-subagent` and review skills ([davidondrej ledger](davidondrej-skills.md) 12, 13), gstack's `codex` with its pre-flight probe ([gstack ledger](gstack.md) 12), Addy's `doubt-driven-development` ([addy ledger](addy-agent-skills.md) 28), pstack's `interrogate` ([pstack ledger](pstack.md) 13) and compound-engineering's `ce-pov` panel ([compound-engineering ledger](compound-engineering.md) 23). What this one adds to those entries is the input side: one patch, untracked files, no silent truncation, labelled sections.
- **Idle context cost**: ~103 tokens as published; 0 user-invoked.
- **Recommendation (proposed)**: idea-only. Add the eight rules above as acceptance criteria for whichever cross-model review recipe the theme session picks.

### T2. `property-based-testing`

- **What it is.** When and how to write property tests ([SKILL.md][t-pbt]). A nine-row property catalog and a strength order, "no crash → type preservation → invariant → idempotence → roundtrip / oracle", with the rule to assert the strongest the code supports ([L19-L39][t-pbt-catalog]). Two ways a property test asserts nothing: restating the implementation, and filtering away nearly every input ([L41-L50][t-pbt-nothing]). "Code with no such shape gets example tests; saying so is a valid outcome" ([L9-L12][t-pbt-intro]). When no property is reachable, suggest extracting the pure core and let the author decide ([refactoring.md L1-L15][t-pbt-refactor]). Adding a PBT library "is a dependency decision that belongs to the user — offer it once" ([L64-L68][t-pbt-dep]). Its evals include negative cases that check the skill does *not* fire or pivot ([evals][t-pbt-evals]).
- **Kind**: skill + 5 references + evals.
- **Proposed address**: idea-only, for a C# pack testing candidate.
- **Why it could fit.** The owner's prototype simulations are pure reducers, which are natural property-test targets once ported (*inference*). "Offer the dependency once, with the specific property" is a good manners rule for any skill that wants a new package.
- **Why it might not.** C# gets one table cell, FsCheck ([libraries.md L14][t-pbt-libs]); the body is Python, TypeScript, Rust and Solidity. The description alone is ~330 tokens, the largest read here. Property-test packages inside Unity are unchecked.
- **Copy / adapt / idea-only**: **idea-only (CC-BY-SA-4.0).** No text or table is to be copied or adapted.
- **Overlap**: Aaronontheweb's `cscheck`, which is C#-native and makes the same "don't use the implementation's answer" point ([aaronontheweb ledger](aaronontheweb-dotnet-skills.md) 16); abagames' `implementing-gameplay-invariants` ([gamedev ledger](gamedev-repos.md) A3); fork `tdd`.
- **Idle context cost**: ~330 tokens as published.
- **Recommendation (proposed)**: reject as a skill. If `cscheck` or another C# property-testing candidate is taken, check it states the strength order, the two empty-test traps and the offer-once rule.

### T3. `mutation-testing`

- **What it is.** A router for Trail of Bits' own mutation tools, mewt and muton: configure a campaign, analyse survivors, hunt bugs in untested code ([SKILL.md][t-mut]). Portable ideas: a timeout is "inconclusive, not evidence of coverage" ([L89-L94][t-mut-results]); "Severity ranks the *mutation*, not the risk" ([L109][t-mut-severity]); a survivor is called equivalent only after five checks (types, reachability, downstream use, semantic comparison, an attempt to build a distinguishing input), and an uncertain one stays unresolved ([equivalent-mutants.md L7-L17][t-mut-equiv]).
- **Kind**: skill + 3 workflows + 6 references + a report validator.
- **Proposed address**: none.
- **Why it could fit.** Only if the owner starts running a mutation tool on C# libraries; the survivor-triage rules would apply to any tool's output.
- **Why it might not.** Tied to two tools. A grep of the plugin's skill files and README finds no C#, .NET or Stryker mention. Much of the reference material is blockchain-specific.
- **Copy / adapt / idea-only**: **idea-only (CC-BY-SA-4.0).** No text is to be copied or adapted.
- **Overlap**: dotnet/skills' `test-gap-analysis`, a tool-free "pseudo-mutation" question already proposed for a merged test-review skill ([dotnet-skills ledger](dotnet-skills.md) 30); abagames' semantic game mutants ([gamedev ledger](gamedev-repos.md) A14).
- **Idle context cost**: ~101 tokens as published.
- **Recommendation (proposed)**: reject. Keep the three triage rules as a note for the test-review candidate.

### T4. `sharp-edges`

- **What it is.** A review lens for APIs and configuration that are easy to misuse ([SKILL.md][t-se]). Principle: "Secure usage should be the path of least resistance" ([L29-L31][t-se-principle]). A table of excuses to refuse, such as "It's documented" ([L33-L42][t-se-rationalizations]). Probes per choice point: what do zero, empty, null and negative values mean, can two parameters be swapped without a type error, what happens on invalid input ([L207-L214][t-se-probe]). Three imagined users: the Scoundrel, the Lazy Developer who copies the first example, the Confused Developer who misreads the API ([L216-L233][t-se-adversaries]). Eleven per-language files; the C# one covers nullable types, default struct values, `IDisposable`, async, deferred LINQ, string comparison, equality, locks and event-handler leaks ([lang-csharp.md][t-se-csharp]).
- **Kind**: skill + agent + 16 references.
- **Proposed address**: idea-only, for the C# pack's API-design candidate or fork `codebase-design`.
- **Why it could fit.** The owner ships C# libraries. "What does `0`, `null` or `default(T)` mean for each parameter?" and "is the first example a user finds the right one?" are cheap questions about any public API. The default-struct point is live in Unity code, where structs are everywhere (*inference*).
- **Why it might not.** Its centre of gravity is security: crypto, auth, sessions, JWT. The categories and severity table are built for an audit. ~150 tokens as published.
- **Copy / adapt / idea-only**: **idea-only (CC-BY-SA-4.0).** No text, table or example is to be copied or adapted.
- **Overlap**: Aaronontheweb's `api-design` (compatibility, not misuse) and its nullable skill ([aaronontheweb ledger](aaronontheweb-dotnet-skills.md) 8, 12); Addy's api-design reference ([addy ledger](addy-agent-skills.md)); fork `codebase-design`; the silent-failure checklist offered to fork `code-review` ([anthropic-marketplace ledger](anthropic-marketplace-plugins.md) 9).
- **Idle context cost**: ~150 tokens as published; 0 as a merge.
- **Recommendation (proposed)**: reject as a skill. Offer a three-question misuse probe (edge values, swappable parameters, the lazy and the confused caller) to whichever API-design piece the C# theme takes.

### T5. `differential-review`

- **What it is.** A security review of a diff in seven phases ([SKILL.md][t-dr]). Ideas: classify a change "by RISK, not size" ([L21-L31][t-dr-rationalizations]); scale depth to codebase size ([L37-L43][t-dr-size]); run `git blame` on *removed* lines, because code removed from a commit that was itself a fix is a likely regression ([L181-L190][t-dr-redflags]); count callers of each changed function for a blast radius ([methodology.md][t-dr-method]); state coverage limits; always write the report to a file.
- **Kind**: skill + agent + command + 4 references.
- **Proposed address**: none; one line offered to fork `code-review`.
- **Why it could fit.** "Was this deleted line added by a fix?" is one cheap check no other ledger records.
- **Why it might not.** Smart-contract flavoured (`onlyOwner`, reentrancy, `.sol` in the examples). Its time estimates, 30 minutes to 8 hours, are a human auditor's. It refers to sibling skills not read here. ~188 tokens as published.
- **Copy / adapt / idea-only**: **idea-only (CC-BY-SA-4.0).** No text is to be copied or adapted.
- **Overlap**: pstack's `blast-radius`, which demands proof by running code and is the stronger version ([pstack ledger](pstack.md) 8); the shared-caller blast radius idea ([unity-workflow ledger](unity-workflow-repos.md) C2); fork `code-review`; Sentry's and Anthropic's review skills ([maintenance-tooling ledger](maintenance-tooling.md) 23, [anthropic-marketplace ledger](anthropic-marketplace-plugins.md) 8).
- **Idle context cost**: ~188 tokens as published; 0 as a merge.
- **Recommendation (proposed)**: reject. Offer "blame the removed lines" as one line for fork `code-review`.

---

## C. `Neeeophytee/finding-unknowns-skills`

A community plugin of 14 skills "distilled, with attribution, from public essays by Thariq Shihipar", "Not an official Anthropic repository" ([README][f-readme], [NOTICE.md][f-notice]). MIT. 13 of 14 are model-invoked. Only the two skills the ticket names were read.

### F1. `context-audit`

- **What it is.** An audit of the instructions an agent already carries ([SKILL.md][f-ca], 29 lines). Steps ([L12-L21][f-ca-steps]): inventory every layer with its size (steering files, each skill's description and body, hooks, tool and MCP descriptions); read them *together*, since "Contradictions only exist between layers"; sort every instruction into Conflict, Duplicate, Obvious, Judgement-now or Gotcha; propose the cut as a diff, moving sometimes-needed material into an on-demand file; close with before/after counts and "the single deletion you are least confident about". Guardrails ([L23-L29][f-ca-guard]): propose, never apply; a rule "naming a specific failure gets asked about, not cut"; judge a line by "whether [it changes] behavior, not by whether [it sounds] wise".
- **Kind**: skill.
- **Proposed address**: core user-invoked.
- **Why it could fit.** The map's rule is "Idle context is a budget", with tripwires on always-on text and descriptions (ticket #14). This is the judgment half of keeping to them; the mechanical half (sums, validity, parity) is already proposed elsewhere. Its five classes line up with the admission gate for always-on text. Short, MIT, no tools, no platform assumptions.
- **Why it might not.** As published it is model-invoked at ~131 tokens, which would itself be idle cost. It knows nothing of the collection's vocabulary (core, pack, address, tripwire) or of Codex's layers. An occasional chore may not need a skill: a saved prompt would do.
- **Copy / adapt / idea-only**: adapt. MIT permits copying with the notice kept. Changes: make it user-invoked on both harnesses, add the Codex layers and the collection's tripwire figures, and point "relocate" at the lazy-loading routes this repo already documented ([lazy-loading](../lazy-loading.md)).
- **Overlap**: karanb192's `dead-rules-audit`, which *measures* whether rules are followed, and `context-hogs` ([hook-collections ledger](hook-collections.md) 11, 12); ECC's `context-budget` and `rules-distill` ([ecc ledger](ecc.md) 16); gstack's description-budget ratchet ([gstack ledger](gstack.md) 2); `prompt-audit` in `claude-api` ([anthropic-skills ledger](anthropic-skills.md) 11); agnix ([maintenance-tooling ledger](maintenance-tooling.md)); fork `writing-for-agents` for the authoring side.
- **Idle context cost**: 0 as user-invoked; ~131 tokens as published.
- **Recommendation (proposed)**: adapt as a core user-invoked skill, decided in the maintenance theme alongside the overlapping audit pieces.

### F2. `reference-hunt`

- **What it is.** Treat existing source code as the specification ([SKILL.md][f-rh], 25 lines). Steps ([L12-L19][f-rh-steps]): get the reference and ask *which dimension* to extract (behaviour, structure, visual system, API shape); write a **semantics summary** before any code, listing guarantees (timing, ordering, error handling, edge cases), which decisions look deliberate and which incidental, and what will not translate with a proposed equivalent; have the user confirm it; reimplement "same semantics, native idioms", not line by line; close by listing each behaviour and where the new code honours it. Guardrails: surface a bug in the reference instead of reproducing it; "extracting semantics is fine; copying incompatible code is not" ([L21-L25][f-rh-guard]).
- **Kind**: skill.
- **Proposed address**: idea-only into fork `prototype` / `unity-prototyping` (P6); owner's call as a standalone core user-invoked skill.
- **Why it could fit.** It is the procedure for the one cost the fork admits in a web prototype: the JavaScript module "will not lift into the C# code" ([unity-prototyping L16][fk-up-choice]). With a semantics summary and a behaviour checklist, the validated reducer becomes the spec for the C# class. "Deliberate versus incidental" matters most there, since prototype code is full of accidents (*inference*).
- **Why it might not.** When the owner says "a Hearthstone-like", the reference is a game, not readable source, so the skill does not apply to the idea stage. The fork's `grilling` and `research` already cover asking and reading. As published, ~94 tokens model-invoked.
- **Copy / adapt / idea-only**: idea-only for the merge. If taken standalone: copy (MIT, notice kept), made user-invoked.
- **Overlap**: fork `prototype` capture rule ("fold any validated decision into the real code", [SKILL.md L28][fk-proto-rules]), which says what to do but not how across languages; fork `research`; this collection's own idea-only practice.
- **Idle context cost**: 0 as a merge or user-invoked; ~94 tokens as published.
- **Recommendation (proposed)**: idea-only: add the semantics-summary port step to the fork's prototype capture (P6). Standalone skill is the owner's call.

---

## Summary of proposals

| Proposal | Entries | Address |
|---|---|---|
| Adapt | F1 (`context-audit`) | core user-invoked |
| Idea-only, into fork `prototype` / `unity-prototyping` | G2, G3, G4, F2 (proposals P1-P6) | fork skill bodies, 0 idle |
| Idea-only, into theme sessions | T1 (cross-model review), T2 and T3 (C# testing candidates), T4 (API design), T5 (one line for `code-review`) | none of their own |
| Reject as skills | G1, G5, G6 and all nine `game-studio` skills as installs; all five `trailofbits` skills as installs | — |

## Open questions for the owner

1. **A third `prototype` branch?** Is "playable" a new branch beside logic and UI (P1), a stretch of `LOGIC.md`, or a skill of its own in a possible gamedev pack?
2. **Where does the web-or-engine test live, and what is the default in a Unity repo?** Today it is in `unity-prototyping` with Unity as the default. P4 and P5 would move the test into `prototype` and add the owner's card-game case.
3. **Should the agent check an HTML prototype in a browser before handing it over (P2)?** If yes, with which tool; if the session has none, is "unvalidated" acceptable?
4. **Is a web prototype's logic ever ported to C#** (P6, F2), or is its answer only go/no-go?
5. **How strict is "single file"?** Is a library loaded by one `<script>` tag acceptable for a grid or sprite prototype, or is that the signal to move to Unity?
6. **`context-audit`: skill or saved prompt?** And does it belong with the maintenance tooling or in core?

## Method and limits

- Read from shallow clones under the session's temp directory; description sizes counted by a script kept outside the clones; nothing installed or executed.
- **Not verified**: any behaviour of the sources when run; `second-opinion`'s claims about Codex CLI flags and the model it pins (the source says it checked them against CLI 0.154.0 on 2026-09-14); whether the Bash recipes run under the owner's Git Bash; `finding-unknowns`' attribution of its techniques to the essays it names; `game-studio`'s licence beyond the `MIT` string in its manifest; which browser tools the owner's sessions offer for P2; whether any property-test or mutation tool works inside Unity.
- The other 39 `trailofbits` plugins and 12 `finding-unknowns` skills were out of scope and not read. `game-studio`'s three Python scripts and three starter-code references were listed, not read.
- Token figures are estimates by the method stated at the top.
- The `trailofbits` re-pin rests on the GitHub compare API's file list for `82fe822...442fc9d` (3 commits), which showed no path under the five plugins.

[g-root]: https://github.com/openai/plugins/tree/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio
[g-manifest]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/.codex-plugin/plugin.json
[g-router]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/game-studio/SKILL.md#L10
[g-router-routing]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/game-studio/SKILL.md#L33-L51
[g-router-flow]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/game-studio/SKILL.md#L53-L67
[g-found-rules]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/web-game-foundations/SKILL.md#L29-L50
[g-found-split]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/web-game-foundations/SKILL.md#L31-L33
[g-found-input]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/web-game-foundations/SKILL.md#L34-L36
[g-found-assets]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/web-game-foundations/SKILL.md#L37-L40
[g-found-save]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/web-game-foundations/SKILL.md#L41-L43
[g-found-dom]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/web-game-foundations/SKILL.md#L44-L47
[g-found-3d]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/web-game-foundations/SKILL.md#L48-L50
[g-found-check]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/web-game-foundations/SKILL.md#L62-L76
[g-found-anti]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/web-game-foundations/SKILL.md#L78-L86
[g-ui-standards]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/game-ui-frontend/SKILL.md#L14-L39
[g-ui-hier]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/game-ui-frontend/SKILL.md#L23-L26
[g-ui-protect]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/game-ui-frontend/SKILL.md#L27-L33
[g-ui-budget]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/game-ui-frontend/SKILL.md#L51-L56
[g-ui-good]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/game-ui-frontend/SKILL.md#L81-L89
[g-ui-anti]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/game-ui-frontend/SKILL.md#L91-L104
[g-prompts]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/references/frontend-prompts.md
[g-hud]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/references/three-hud-layout-patterns.md
[g-play-flow]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/game-playtest/SKILL.md#L12-L18
[g-play-tools]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/game-playtest/SKILL.md#L20-L26
[g-play-2d]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/game-playtest/SKILL.md#L30-L37
[g-play-report]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/game-playtest/SKILL.md#L62-L69
[g-check-universal]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/references/playtest-checklist.md#L5-L13
[g-check-2d]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/references/playtest-checklist.md#L15-L21
[g-phaser-stack]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/phaser-2d-game/SKILL.md#L12-L17
[g-phaser-arch]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/phaser-2d-game/SKILL.md#L19-L38
[g-phaser-impl]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/phaser-2d-game/SKILL.md#L35-L38
[g-phaser-modes]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/phaser-2d-game/SKILL.md#L40-L46
[g-phaser-feel]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/phaser-2d-game/SKILL.md#L52
[g-phaser-ref]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/references/phaser-architecture.md
[g-engine]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/references/engine-selection.md
[g-engine-phaser]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/references/engine-selection.md#L13-L19
[g-three]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/three-webgl-game/SKILL.md
[g-three-safety]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/three-webgl-game/SKILL.md#L101-L107
[g-three-scope]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/three-webgl-game/SKILL.md#L109-L111
[g-three-arch]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/references/three-webgl-architecture.md
[g-r3f]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/react-three-fiber-game/SKILL.md
[g-3dassets]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/web-3d-asset-pipeline/SKILL.md
[g-sprite]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/sprite-pipeline/SKILL.md

[t-root]: https://github.com/trailofbits/skills/tree/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4
[t-license]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/LICENSE
[t-so]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/second-opinion/skills/second-opinion/SKILL.md
[t-so-input]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/second-opinion/skills/second-opinion/SKILL.md#L38-L56
[t-so-results]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/second-opinion/skills/second-opinion/SKILL.md#L77-L92
[t-so-review]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/second-opinion/skills/second-opinion/references/review-input.md
[t-so-codex]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/second-opinion/skills/second-opinion/references/codex-invocation.md#L17-L27
[t-so-codex-model]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/second-opinion/skills/second-opinion/references/codex-invocation.md#L8-L10
[t-pbt]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/property-based-testing/skills/property-based-testing/SKILL.md
[t-pbt-intro]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/property-based-testing/skills/property-based-testing/SKILL.md#L9-L12
[t-pbt-catalog]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/property-based-testing/skills/property-based-testing/SKILL.md#L19-L39
[t-pbt-nothing]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/property-based-testing/skills/property-based-testing/SKILL.md#L41-L50
[t-pbt-dep]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/property-based-testing/skills/property-based-testing/SKILL.md#L64-L68
[t-pbt-refactor]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/property-based-testing/skills/property-based-testing/references/refactoring.md#L1-L15
[t-pbt-libs]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/property-based-testing/skills/property-based-testing/references/libraries.md#L14
[t-pbt-evals]: https://github.com/trailofbits/skills/tree/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/property-based-testing/evals
[t-mut]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/mutation-testing/skills/mutation-testing/SKILL.md
[t-mut-results]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/mutation-testing/skills/mutation-testing/SKILL.md#L89-L94
[t-mut-severity]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/mutation-testing/skills/mutation-testing/SKILL.md#L109
[t-mut-equiv]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/mutation-testing/skills/mutation-testing/references/equivalent-mutants.md#L7-L17
[t-se]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/sharp-edges/skills/sharp-edges/SKILL.md
[t-se-principle]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/sharp-edges/skills/sharp-edges/SKILL.md#L29-L31
[t-se-rationalizations]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/sharp-edges/skills/sharp-edges/SKILL.md#L33-L42
[t-se-probe]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/sharp-edges/skills/sharp-edges/SKILL.md#L207-L214
[t-se-adversaries]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/sharp-edges/skills/sharp-edges/SKILL.md#L216-L233
[t-se-csharp]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/sharp-edges/skills/sharp-edges/references/lang-csharp.md
[t-dr]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/differential-review/skills/differential-review/SKILL.md
[t-dr-rationalizations]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/differential-review/skills/differential-review/SKILL.md#L21-L31
[t-dr-size]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/differential-review/skills/differential-review/SKILL.md#L37-L43
[t-dr-redflags]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/differential-review/skills/differential-review/SKILL.md#L181-L190
[t-dr-method]: https://github.com/trailofbits/skills/blob/442fc9d6c89b1e937e6f7a477e7071ea75fcbea4/plugins/differential-review/skills/differential-review/methodology.md

[f-root]: https://github.com/Neeeophytee/finding-unknowns-skills/tree/ca5696a0f08d2de6b2997fff1d6cc05c3ed587cc
[f-license]: https://github.com/Neeeophytee/finding-unknowns-skills/blob/ca5696a0f08d2de6b2997fff1d6cc05c3ed587cc/LICENSE
[f-readme]: https://github.com/Neeeophytee/finding-unknowns-skills/blob/ca5696a0f08d2de6b2997fff1d6cc05c3ed587cc/README.md
[f-notice]: https://github.com/Neeeophytee/finding-unknowns-skills/blob/ca5696a0f08d2de6b2997fff1d6cc05c3ed587cc/NOTICE.md
[f-ca]: https://github.com/Neeeophytee/finding-unknowns-skills/blob/ca5696a0f08d2de6b2997fff1d6cc05c3ed587cc/skills/context-audit/SKILL.md
[f-ca-steps]: https://github.com/Neeeophytee/finding-unknowns-skills/blob/ca5696a0f08d2de6b2997fff1d6cc05c3ed587cc/skills/context-audit/SKILL.md#L12-L21
[f-ca-guard]: https://github.com/Neeeophytee/finding-unknowns-skills/blob/ca5696a0f08d2de6b2997fff1d6cc05c3ed587cc/skills/context-audit/SKILL.md#L23-L29
[f-rh]: https://github.com/Neeeophytee/finding-unknowns-skills/blob/ca5696a0f08d2de6b2997fff1d6cc05c3ed587cc/skills/reference-hunt/SKILL.md
[f-rh-steps]: https://github.com/Neeeophytee/finding-unknowns-skills/blob/ca5696a0f08d2de6b2997fff1d6cc05c3ed587cc/skills/reference-hunt/SKILL.md#L12-L19
[f-rh-guard]: https://github.com/Neeeophytee/finding-unknowns-skills/blob/ca5696a0f08d2de6b2997fff1d6cc05c3ed587cc/skills/reference-hunt/SKILL.md#L21-L25

[fk-proto-branches]: https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/prototype/SKILL.md#L14-L19
[fk-proto-rules]: https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/prototype/SKILL.md#L21-L28
[fk-logic-module]: https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/prototype/LOGIC.md#L22-L33
[fk-logic-layout]: https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/prototype/LOGIC.md#L35-L50
[fk-logic-handover]: https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/engineering/prototype/LOGIC.md#L52-L54
[fk-up-choice]: https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-prototyping/SKILL.md#L12-L19
[fk-up-handover]: https://github.com/Hissal/mattpocock-skills-unity/blob/3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515/skills/unity/unity-prototyping/SKILL.md#L63-L65
