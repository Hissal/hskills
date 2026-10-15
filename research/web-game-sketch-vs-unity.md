# Research: web game sketch against Unity for early game prototypes

Ticket: [Research: web game sketch against Unity for early game prototypes](https://github.com/Hissal/skill-collection/issues/60), part of [Wayfinder: personal skill collection blueprint](https://github.com/Hissal/skill-collection/issues/1). Feeds Theme: game design and feel and Theme: Unity pack.

Author: Claude Opus 5.5 (`claude-opus-5-5`), as an AFK research agent, 2026-10-15. Planning only. Every recommendation here is *proposed*; the owner decides in the theme sessions.

Vocabulary follows [`GLOSSARY.md`](../GLOSSARY.md). Three labels mark how each claim is known:

- **Documented**: a primary source states it. The link is pinned to a commit SHA, or for a web page carries the access date.
- **Observed**: I ran it on this machine on 2026-10-15 (Windows 11 Home 10.0.26200, Google Chrome 155.0.8059.40 in `--headless=new`). These are pass/fail loading checks, never timings.
- **Inference**: reasoned from the above and not stated by any source.

No speed was measured. Nothing in this report says how many minutes either route takes.

## The question

Is a single-file web sketch (three.js through an import map, or a 2D library) quicker than Unity for an agent building a quick proof of concept of a game idea, before any Unity infrastructure exists? What does such a sketch's verdict carry over to the engine, and what does it not?

The owner's case: five game ideas, no Unity project for any of them yet, pick one to pursue. The sketch is for proof of concept only. Polish and feel tuning move to the engine.

## Short answer

1. **For questions the simulation owns, the documented mechanisms favour the sketch.** Rules, turns, economy, progression, spawn logic, what is legal now, and whether a loop has a decision in it are all simulation-owned. A sketch needs no project, no compile step and no domain reload. The agent edits one text file, reloads the page and reads state back through a debug handle. Unity needs a project, an Editor connection and a compile plus domain reload for each code change. Whether that makes the sketch *faster* by a margin that matters was not measured (inference, see [Section 1](#1-the-agents-iteration-loop)).
2. **For questions the renderer or the engine owns, a sketch fakes the dimension being tested** and breaks core's medium rule. That covers physics feel, input timing, camera feel and the look of lighting and materials. Unity's 3D physics is PhysX, its input runs through the Input System's update modes, and its camera package is Cinemachine. A web sketch uses other engines with other defaults. Numbers tuned in a sketch do not carry over (documented differences, inference on the consequence; see [Section 3](#3-what-transfers-to-unity-and-what-does-not)).
3. **What transfers is the verdict, not the code or the tuning.** A sketch can carry over a go/no-go on the core loop, the rules as a semantics summary, the verb list and action map, coarse spatial facts (grid size, arena scale, camera *kind*) and glTF models. Hand-written JS does not lift into C#: the fork already says so for HTML logic.
4. **One file and offline do not fit three.js today.** three.js r186 ships only ES modules, and `three.module.js` imports `./three.core.js`. A double-clicked `file://` page loads three.js from a pinned CDN but cannot load local module files. So a three.js sketch is either online (CDN, observed working from `file://`) or served from a local server. A 2D library that ships a classic script, such as Phaser 4's `phaser.min.js`, loads from `file://` and so can be offline (observed). This is why core keeps "no library, works offline" and the sketch is a pack medium.
5. **The sketch stops at assets and 3D pipelines.** Past primitives, text, CSS shapes and a few loaded models it needs the machinery `game-studio` describes (GLB pipeline, physics library, sprite normalisation). At that point it costs more than a Unity greybox for this owner (inference).

For the five-ideas case, the proposed shape is a triage. Write each idea's brief first. Name the dimension that decides it. Sketch the ideas whose deciding question is simulation-owned, one file each. Send the ideas whose deciding question is feel straight to a Unity greybox, or mark that the sketch can only rule them *out*, never *in*. See [Section 6](#6-proposed-for-the-theme-sessions).

## Sources and coverage

| Source | Pin | What was read |
|---|---|---|
| Local ledger `research/ledgers/ideas-skim.md` | this repo @ [`20995eb`][repo] | The `game-studio` lens section, G1 to G6, open questions, method and limits |
| Local ledger `research/ledgers/gamedev-repos.md` | this repo @ [`20995eb`][repo] | A18 |
| Local `research/unity-baseline.md` | this repo @ [`20995eb`][repo] | Grep for the Editor loop (`unity-cli`, `eval`, recompile, screenshots) |
| `openai/plugins` `game-studio` | [`0722921`][g-root], unchanged since: the last commit touching `plugins/game-studio` is `cd0fccd` (2026-06-08), before the ledger read | `references/engine-selection.md` in full; the rest through the ledger's quotes |
| `abagames/agentic-gamedev-skills` | [`7230995`][a-root] | `probing-web-game-mechanics` and `smoke-testing-web-games` `SKILL.md`, first 60 lines each |
| The fork `Hissal/mattpocock-skills-unity` | [`d5c5c97`][fk-root] (fork pass level, local HEAD) | `unity-prototyping/SKILL.md` in full; `prototype/LOGIC.md` lines 37 and 66 |
| [Theme: prototyping resolution](https://github.com/Hissal/skill-collection/issues/44#issuecomment-6195116678) | issue comment | In full |
| `mrdoob/three.js` r186 | [`9b4a2ac`][three-root] (tag `r186`, released 2026-09-24) | `manual/pages/installation.html` in full; `build/` file list |
| `phaserjs/phaser` v4.2.1 | [`41be1e4`][phaser-root] (latest release, 2026-07-09) | `src/physics/arcade/World.js` defaults (`fps`, `fixedStep`) |
| `dimforge/rapier` | [`475caa3`][rapier-root] (`master`) | `src/dynamics/integration_parameters.rs` default `dt` |
| `Unity-Technologies/skills` | [`9d28210`][u-root] (still `main` on 2026-10-15) | `unity-cli/SKILL.md` L221-L244 and L305-L330; `references/playmode-verification-loop.md` in full |
| `mdn/content` | [`4204940`][mdn-root] | `importmap` page; JavaScript modules guide (`file://` notes); `requestAnimationFrame`; Using the Gamepad API |
| `@mdn/browser-compat-data` 8.1.5 | jsDelivr, timestamp 2026-10-08 | `html.elements.script.type.importmap` and its subfeatures |
| `microsoft/playwright` | [`5ad202d`][pw-root] (`main`) | `docs/src/clock.md`; `class-keyboard.md` headings |
| Unity Manual 6000.6 (the version `docs.unity3d.com/Manual` resolves to on 2026-10-15) | web, accessed 2026-10-15 | Domain reloading; Configuring how Unity enters Play mode; Built-in 3D physics overview; Fixed updates; Text-based scene files; Time Manager |
| Unity package docs | web, accessed 2026-10-15 | Input System 1.14.2 Settings; Cinemachine 3.1 index; glTFast 6.14 index |
| [unity.com/products/unity-personal](https://unity.com/products/unity-personal) | web, accessed 2026-10-15 | Eligibility line |
| jsDelivr | `data.jsdelivr.com` package listings and response headers, 2026-10-15 | File sizes for `three@0.186.0` and `phaser@4.2.1`; `Cache-Control` and CORS headers |

Not read: `game-studio`'s three starter-code references (also unread in the ledger), Cinemachine and glTFast beyond their index pages, the Unity Input System's event-timing internals, jsDelivr's terms and uptime commitments, any Unity 2D physics reference page that names its engine (the 2D overview read does not name one).

## 1. The agent's iteration loop

### What each loop is made of

| Step | Single-file web sketch | Unity, no project yet |
|---|---|---|
| Start | Write one `.html` file. For a CDN library, add an import map or a `<script>` tag with a pinned version | Documented CLI path: confirm auth and licence, install an Editor and modules, pick a template, `unity projects create`, open it ([unity-cli L305-L330][u-setup]). Then a prototype folder, an asmdef with `defineConstraints: ["UNITY_EDITOR"]`, a scene and a menu item, per the fork's `unity-prototyping` ([fork][fk-up]) |
| Code change | Edit text; reload the page. three.js's own manual says the no-build route needs "no need to build or compile anything" ([installation.html L249][three-prod]) | Unity refreshes the Asset Database and reloads the domain when it detects script changes, "even when domain reload on entering Play mode is disabled" ([Manual: Domain reloading][u-domain], accessed 2026-10-15) |
| Enter the running state | The page runs on load | Entering Play reloads the domain and the scene by default; "the amount of time increases as your scripts and scenes become more complex" ([Manual: Configuring how Unity enters Play mode][u-epm], accessed 2026-10-15). `editor_play` "drops the Pipeline listener for a few seconds while the domain reloads" ([playmode loop L93-L97][u-pvl-play]) |
| Change content | Edit the same file (state is plain data in core's Behavior branch) | Through the live Editor's commands. "Never hand-edit `.unity`, `.prefab`, or `.asset` YAML while a live Editor is reachable": fileIDs and GUIDs are easy to get wrong and the edit is invisible until reimport ([unity-cli L221-L244][u-yaml]) |
| Read state | `window.prototype.getState()` through the browser tool, per the Theme: prototyping resolution. Module scripts do not expose top-level variables, so "bundled/module games" need "a deliberate debug handle" ([abagames probing L34][a-probe]) | `unity command eval` against the running instance ([playmode loop L187-L210][u-pvl-eval]) |
| Drive input | Playwright-style `keyboard.down`/`up`/`press` ([class-keyboard.md][pw-kbd]), or `dispatch(action)` on the debug handle | `eval`, or a custom command; the fork's variant switcher for structural variants |
| Control time | Playwright's clock overrides `requestAnimationFrame`, `setTimeout`, `performance` and `Event.timeStamp`, and can pause, fast-forward and run for a duration ([clock.md L20-L36][pw-clock]) | `eval "UnityEngine.Time.timeScale = 0.5f;"` ([playmode loop L193-L195][u-pvl-eval]) |
| See it | Page screenshot | `capture_game_view` ([playmode loop L150][u-pvl-cap]) |
| Background trap | `requestAnimationFrame` "calls are paused in most browsers when running in background tabs or hidden iframes" ([MDN rAF L18-L19][mdn-raf]) | The Editor throttles `EditorApplication.update` when unfocused, so Play can stick at frame 1; the fix is `set_autotick` ([playmode loop L44-L60][u-pvl-tick]) |
| Failure mode | A JS error stops the module; the page shows what ran | A compile error in the prototype "fails the whole project's compile" ([fork unity-prototyping][fk-up]); a broken project can open in Safe Mode, which looks like no Editor at all ([unity-cli L240-L244][u-yaml]) |

### What this says about speed

- **Documented**: the sketch loop has fewer mandatory stages per code change (no compile, no domain reload, no Play-mode entry). The Unity loop has documented ways to cut stages, chiefly `eval` against a live Play session in place of edit, recompile and re-enter ([playmode loop L187-L210][u-pvl-eval]), and disabling domain reload on entering Play (code changes still reload).
- **Inference**: before any Unity project exists, the setup row dominates for a one-off idea, and it is paid five times for five ideas unless one throwaway host project holds all five prototypes. With a host project already open and an agent-connected Editor, the per-change gap shrinks to compile plus domain reload, which the Manual describes as growing with project size. In an empty host project that cost is at its smallest.
- **Inference**: both loops are equally observable for an agent once the debug handle exists. The browser loop has one extra lever, scripted time through Playwright's clock, which makes timer- and frame-driven rules testable without waiting. Unity's `timeScale` slows or speeds time but does not step it from outside the way a fake clock does. I did not check whether `com.unity.pipeline` offers a frame-step command.
- **Not established**: the size of the difference. To settle it, the owner could run the same brief through both routes for one idea and record time to first playable and agent turns. Nothing in this report stands in for that number.

## 2. Which questions a sketch answers without faking the dimension

Core's medium rule, from the Theme: prototyping resolution: "do not fake the dimension being tested; use the cheapest medium that doesn't". The ideas-skim ledger's six-row ownership table (inference built on `game-studio`'s split: "Simulation owns entities, turns, timers, collisions, progression, and saveable state. The renderer owns scene composition, animation playback, camera, particles, and input plumbing", [web-game-foundations L31-L33][g-found-split]) was written for DOM-only HTML. A library-backed sketch moves some rows. The extended table (inference throughout):

| Deciding question | DOM-only HTML (core `prototype`) | Library sketch (2D canvas or three.js) | Must be Unity |
|---|---|---|---|
| Are the rules, turns, economy or progression interesting? | Yes | Yes, no gain over DOM | No |
| Does the core loop have a decision in it, played in real time at a coarse level (dodge or commit, spend or save)? | Weak: no continuous space | Yes, as a go/no-go | No |
| Is the spatial layout readable: arena size, sight lines, grid scale, enemy count on screen? | No | Yes, with primitives | No |
| Which camera *kind* (top-down, side, third-person, first-person)? | No | Yes, as a kind | No |
| Does the jump arc, hit-stop, knockback or steering feel right? | No | No: it would be tuned against a different physics step and input path | Yes |
| Does the camera feel right (damping, look-ahead, collision)? | No | No | Yes |
| Does it look right (lighting, materials, VFX)? | No | No | Yes |
| Does it run well on the target? | No | No | Yes |
| Does it fit existing scenes, prefabs or production code? | No | No | Yes |

The rule that falls out (inference): **a sketch can rule an idea out on feel but cannot rule it in.** If a real-time loop is dull with crude physics in a sketch, better physics rarely rescues the decision structure. If it feels good in the sketch, that good feel is evidence about the browser library's defaults, not about what Unity will give.

## 3. What transfers to Unity and what does not

### Documented differences between the two sides

- **3D physics engine.** "Unity's default built-in 3D physics system is an integration of the Nvidia PhysX engine" ([Manual: Built-in 3D physics][u-physx], accessed 2026-10-15). The web routes use other engines: `game-studio`'s three.js track uses Rapier ([ledger G6][ledger-g6]); Phaser ships its own Arcade physics ([World.js L162-L173][phaser-world]).
- **Physics step.** Rapier's default `dt` is `1.0 / 60.0` ([integration_parameters.rs L196 and L409][rapier-dt]). Phaser Arcade defaults to `fps` 60 with `fixedStep` true ([World.js L162, L173][phaser-world]). The Unity Manual's own fixed-update example uses 0.02 s, 50 updates per second ([Manual: Fixed updates][u-fixed], accessed 2026-10-15). The page I read gives that as an example, not as the stated default.
- **Input path.** Unity's Input System processes events in one of three update modes: dynamic update ("irregular intervals determined by the current framerate"), fixed update, or manually through `InputSystem.Update()` ([Input System 1.14.2 Settings][u-input], accessed 2026-10-15). In the browser, keyboard and pointer arrive as DOM events, and gamepads must be polled through `navigator.getGamepads()` each frame, typically inside a `requestAnimationFrame` loop ([MDN Using the Gamepad API L82, L113][mdn-gamepad]).
- **Camera.** Unity's package for procedural camera behaviour is Cinemachine ([Cinemachine 3.1][u-cine], accessed 2026-10-15). A three.js sketch has the `three/addons` controls such as `OrbitControls` ([installation.html L256-L271][three-addons]) or hand-written follow code.
- **Code.** The fork: HTML logic "will not lift into the C# code" ([unity-prototyping L16][fk-up-choice]). Core's porting step (Theme: prototyping resolution) handles this with a semantics summary that the user confirms and the rewrite follows.
- **Assets.** Unity imports glTF "at runtime or in the Editor" through glTFast ([glTFast 6.14][u-gltf], accessed 2026-10-15), so a GLB loaded in a three.js sketch can be reused.

### What that means for a verdict (inference)

| Carries over | Does not carry over |
|---|---|
| Go/no-go on the core loop and its decisions | Any tuned constant: gravity, jump velocity, drag, friction, damping, coyote time, input buffer windows |
| The rules, as a semantics summary for the C# rewrite | The JS code itself |
| The verb list and the action map (which input does what) | Input latency and timing judgements |
| Coarse spatial facts: grid or arena size, counts on screen, camera kind | Camera feel: follow lag, look-ahead, collision response |
| glTF models used in the sketch | The look: lighting, materials, post-processing, VFX |
| Content tables (cards, waves, upgrades) as data | Performance on the target platform |

The constants do not carry over because the physics engine, the step length and the input path all differ, and a feel judgement is a judgement about all three at once. A matching step length can be set on either side. That makes the numbers closer but does not make the engines the same. Polish spent on a sketch is the "wasted" case the ticket names.

## 4. Loading a library in one file

### Documented

- **Import maps.** Supported since Chrome and Edge 89, Firefox 108 and Safari 16.4; standard track, not experimental ([BCD 8.1.5][bcd]). The map "must be declared and processed before any `<script>` elements that import modules using specifiers declared in the map" ([MDN importmap L16][mdn-im]). An `integrity` key gives subresource-integrity hashes for mapped modules (Chrome 127, Firefox 138, Safari 18) ([MDN importmap L143-L150][mdn-im-int], [BCD][bcd]). More than one import map per page needs Chrome 133 or Safari 18.4; Firefox has it behind a preference ([BCD][bcd]).
- **three.js's no-build route.** An import map pointing `three` and `three/addons/` at jsDelivr with a pinned version ([installation.html L171-L186][three-cdn]). The manual still advises a local server: "important features that we'll later implement, do not work when the page is opened this way" ([L189][three-server]). It warns that a CDN outage stops the site and that all imports must come "from the same version of three.js, and from the same CDN" ([L249-L253][three-prod]).
- **three.js ships no classic build.** At r186, `build/` holds `three.cjs`, `three.core.js`, `three.module.js`, `three.tsl.js`, `three.webgpu.js` and `three.webgpu.nodes.js` ([tree at r186][three-build]). `three.module.js` imports from `./three.core.js` (read from the jsDelivr copy of `three@0.186.0`).
- **Modules from `file://`.** "If you try to load the HTML file locally (i.e., with a `file://` URL), you'll run into CORS errors due to JavaScript module security requirements" ([MDN modules guide L411][mdn-mod]).
- **Pinned CDN files are cacheable.** jsDelivr served `three@0.186.0/build/three.module.js` with `Cache-Control: public, max-age=31536000, s-maxage=31536000, immutable` and `Access-Control-Allow-Origin: *` (response headers, 2026-10-15).
- **Sizes** (jsDelivr package listing, unminified, 2026-10-15): `three.module.js` 662,772 bytes plus `three.core.js` 1,458,113 bytes. jsDelivr also served `three.module.min.js` (392,831 bytes) and `three.core.min.js` (415,816 bytes), which the package listing does not contain. That they are jsDelivr's own minified copies is inference. Phaser 4.2.1's classic `dist/phaser.min.js` is 1,375,976 bytes; `dist/phaser-arcade-physics.min.js` is 1,266,396 bytes.
- **Licences**: three.js MIT, Phaser MIT, Rapier Apache-2.0 (GitHub licence field, 2026-10-15).

### Observed (headless Chrome 155, Windows 11, 2026-10-15)

Each page wrote `OK` into the DOM on success. Pages and library copies sat in a scratch directory outside the repo.

| Page, opened as `file://` unless stated | Result |
|---|---|
| Import map to jsDelivr `three@0.186.0`, inline module reading `THREE.REVISION` | OK, r186 |
| Same, plus `new THREE.WebGLRenderer()` | OK, a WebGL context was created headless |
| Import map to a local `./three.module.js` (with `three.core.js` beside it) | Failed: the module did not load |
| The same local-module page over `http://127.0.0.1` (Python `http.server`) | OK, r186 |
| Classic `<script src="./phaser.min.js">`, local copy | OK, Phaser 4.2.1 |
| jsDelivr page with every host lookup blocked (`--host-resolver-rules="MAP * ~NOTFOUND"`), same profile as the first run | OK: served from the browser cache |
| Same, fresh profile | Failed |

The blocked-host runs simulate offline; I did not unplug the network. Cache eviction rules were not tested, so a warm cache is not a guarantee.

### What this means (inference)

- **The three.js sketch is "one file, needs network or a server".** It cannot be one file, offline and double-click at the same time without inlining a bundled copy, and producing that copy is a build step. Of the three, the agent's loop only needs network or a server: its browser tool can open `http://localhost` as easily as `file://`. Sharing the sketch by email is what loses.
- **A 2D classic-script library keeps all three properties** when its file sits next to the HTML or is pasted inline (about 1.4 MB for Phaser).
- **Pinning is cheap and should be mandatory**: an exact version in the URL, one CDN, and an `integrity` entry where the browsers in use support it.
- **This confirms core's line.** Core `prototype` stays "no library, works offline" (Theme: prototyping resolution); the library sketch belongs in a pack, with the network or server cost stated in the brief.

## 5. Where the sketch stops

- **Documented**, from `game-studio` via the ideas-skim ledger: 3D needs units, pivots, collision proxies, LODs and baked lighting decided "before runtime integration starts", a GLB pipeline, a physics library, and handling for resize and WebGL context loss. Sprites need a pipeline with anchor and scale normalisation. The plugin says of itself: "Do not claim that this plugin offers equal 3D depth to the Phaser track" ([ideas-skim lens Q1][ledger-q1]).
- **Documented**: `engine-selection.md` puts Three.js where "camera movement and depth are central to play" and "materials, lighting, or scene composition matter more than sprite tooling" ([engine-selection L21-L27][g-engine-three]), and Phaser where the game is "sprite- or tile-based", "top-down, side-view, or grid tactics" ([L13-L19][g-engine-phaser]). It warns: "Do not choose a 3D stack for a normal 2D tactics or platformer game" ([L50][g-engine-avoid]).
- **Inference**, the stop line for a proof-of-concept sketch: primitives (boxes, capsules, planes), flat colours, text, CSS or canvas shapes, and at most a few ready-made GLB models loaded with `GLTFLoader`. Once the idea needs authored animation, rigged characters, sprite sheets, tilemaps, lighting decisions, audio mixing or more than one asset pipeline, it has crossed into work that Unity does with built-in tooling the owner already knows. The sketch's cost then rises without the answer getting more transferable.
- **Inference**: agents can only judge a sketch's look from screenshots, and the Unity side has the same limit (`capture_game_view`). Neither route lets an agent judge feel. Feel needs a human at the controls, which is the other reason feel belongs in the engine where the human's judgement will hold.

## 6. Proposed for the theme sessions

All proposed. The owner decides.

**P1. A web game sketch medium, in a pack, never in core.** It layers on core `prototype`'s Behavior branch: the same pure seeded module, action map, debug panel behind a toggle, `window.prototype.getState()`/`dispatch()`, Copy state and the hand-over check. It adds only:
- one library, pinned to an exact version on one CDN, with `integrity` where supported;
- for three.js, the note that it needs network or `localhost` (no double-click offline), stated in the brief;
- for 2D, a classic-script library so the file still opens offline;
- primitives and at most a few GLB models; no asset pipeline;
- a stated stop: feel, look, camera tuning and performance are not judged here.

Possible addresses, for Theme: game design and feel to choose: a reference file under a game-design pack skill, or the Unity pack guide's answer to core's medium extension point. Either way it costs 0 idle tokens as a reference (inference from how references load).

**P2. The verdict format.** A sketch's verdict says which keep-if criteria were met, and marks each claim as simulation-owned (carries over) or renderer-owned (re-test in Unity). A feel-based verdict can only be "rule out".

**P3. The five-ideas triage.** For a batch of ideas with no engine project:
1. Write each brief: the question, the deciding dimension, keep-if and kill criteria.
2. Ideas decided by simulation-owned questions: one DOM-only `prototype` if the playfield is DOM-shaped, else one library sketch each.
3. Ideas decided by feel, camera or look: a Unity greybox, ideally in one shared throwaway host project so the setup is paid once (the fork's prototype folder already allows several prototypes side by side).
4. Survivors go to Unity, ported by semantics summary, with every tuned constant re-derived there.

**P4. For Theme: Unity pack**, the six-row ownership table gains the library-sketch column above. `unity-prototyping`'s rule "Never for world-space UI, feel, or anything that needs real scene content" ([fork L17][fk-up-choice]) stays as it is: the sketch leaves it untouched.

**P5. A measurement, if the owner wants a number.** One idea, the same brief, both routes, recording time to first playable and agent turns. Run it before relying on "quicker" as more than a mechanism argument.

## Unknowns and limits

- **No timings.** All speed statements are about the mechanisms, not measured durations.
- **One browser, one machine.** The loading checks ran only on Chrome 155 headless on Windows. Firefox and Safari `file://` behaviour was not tested; MDN states the CORS failure generally.
- **Unity loop claims are documented, not run.** I did not open a Unity Editor or call the `unity` CLI. The `unity-cli` skill notes the CLI is beta (per [unity-baseline](unity-baseline.md)).
- **Unity's default fixed timestep** is not stated on the pages I read; only the Manual's 0.02 s example is cited.
- **Unity 2D physics engine** not confirmed from a page read here.
- **jsDelivr availability and terms** not read. The three.js manual's outage warning is the only availability statement cited.
- **Whether `com.unity.pipeline` can step frames** from outside was not checked.
- **Unity licensing**: Unity Personal "is for individuals and small organizations with less than $200K USD of revenue", counting funds raised in the last 12 months ([unity.com, accessed 2026-10-15][u-personal]). The page lists no price beyond "free". Whether the owner's projects qualify is the owner's knowledge, not checked here.
- **game-studio** was read mostly through the ideas-skim ledger's quotes; only `engine-selection.md` was re-read at source for this report.

[repo]: https://github.com/Hissal/skill-collection/tree/20995ebb0528797798dddf6047f5413b908599db
[ledger-q1]: https://github.com/Hissal/skill-collection/blob/20995ebb0528797798dddf6047f5413b908599db/research/ledgers/ideas-skim.md#question-1-which-game-ideas-are-quicker-to-prototype-on-the-web-and-which-are-not
[ledger-g6]: https://github.com/Hissal/skill-collection/blob/20995ebb0528797798dddf6047f5413b908599db/research/ledgers/ideas-skim.md#g6-three-webgl-game-react-three-fiber-game-web-3d-asset-pipeline-sprite-pipeline
[g-root]: https://github.com/openai/plugins/tree/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio
[g-found-split]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/skills/web-game-foundations/SKILL.md#L31-L33
[g-engine-phaser]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/references/engine-selection.md#L13-L19
[g-engine-three]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/references/engine-selection.md#L21-L27
[g-engine-avoid]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/game-studio/references/engine-selection.md#L50
[a-root]: https://github.com/abagames/agentic-gamedev-skills/tree/72309959e3422acdcb95d30e3b0ffd9ed2bd149d
[a-probe]: https://github.com/abagames/agentic-gamedev-skills/blob/72309959e3422acdcb95d30e3b0ffd9ed2bd149d/plugins/web-mini-game-kit/skills/probing-web-game-mechanics/SKILL.md#L34
[fk-root]: https://github.com/Hissal/mattpocock-skills-unity/tree/d5c5c97b7cd55073587d315ae1ef83ee3fefeae8
[fk-up]: https://github.com/Hissal/mattpocock-skills-unity/blob/d5c5c97b7cd55073587d315ae1ef83ee3fefeae8/skills/unity/unity-prototyping/SKILL.md
[fk-up-choice]: https://github.com/Hissal/mattpocock-skills-unity/blob/d5c5c97b7cd55073587d315ae1ef83ee3fefeae8/skills/unity/unity-prototyping/SKILL.md#L16-L17
[three-root]: https://github.com/mrdoob/three.js/tree/9b4a2ac29c63ccb43fd51c5661f2f873ac2c39b8
[three-build]: https://github.com/mrdoob/three.js/tree/9b4a2ac29c63ccb43fd51c5661f2f873ac2c39b8/build
[three-cdn]: https://github.com/mrdoob/three.js/blob/9b4a2ac29c63ccb43fd51c5661f2f873ac2c39b8/manual/pages/installation.html#L171-L186
[three-server]: https://github.com/mrdoob/three.js/blob/9b4a2ac29c63ccb43fd51c5661f2f873ac2c39b8/manual/pages/installation.html#L189
[three-prod]: https://github.com/mrdoob/three.js/blob/9b4a2ac29c63ccb43fd51c5661f2f873ac2c39b8/manual/pages/installation.html#L249-L253
[three-addons]: https://github.com/mrdoob/three.js/blob/9b4a2ac29c63ccb43fd51c5661f2f873ac2c39b8/manual/pages/installation.html#L256-L271
[phaser-root]: https://github.com/phaserjs/phaser/tree/41be1e462bc600064e498cba370bfa8c5c055a22
[phaser-world]: https://github.com/phaserjs/phaser/blob/41be1e462bc600064e498cba370bfa8c5c055a22/src/physics/arcade/World.js#L162-L173
[rapier-root]: https://github.com/dimforge/rapier/tree/475caa3ff4646fd9a796b67d14116256f4962bc7
[rapier-dt]: https://github.com/dimforge/rapier/blob/475caa3ff4646fd9a796b67d14116256f4962bc7/src/dynamics/integration_parameters.rs#L196
[u-root]: https://github.com/Unity-Technologies/skills/tree/9d282100540601cfddc4bbd69f36a239d7a6f55c
[u-setup]: https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/SKILL.md#L305-L330
[u-yaml]: https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/SKILL.md#L221-L244
[u-pvl-tick]: https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/playmode-verification-loop.md#L44-L60
[u-pvl-play]: https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/playmode-verification-loop.md#L88-L97
[u-pvl-cap]: https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/playmode-verification-loop.md#L150
[u-pvl-eval]: https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/playmode-verification-loop.md#L187-L210
[u-domain]: https://docs.unity3d.com/6000.6/Documentation/Manual/domain-reloading.html
[u-epm]: https://docs.unity3d.com/6000.6/Documentation/Manual/configurable-enter-play-mode.html
[u-physx]: https://docs.unity3d.com/6000.6/Documentation/Manual/PhysicsOverview.html
[u-fixed]: https://docs.unity3d.com/6000.6/Documentation/Manual/fixed-updates.html
[u-input]: https://docs.unity3d.com/Packages/com.unity.inputsystem@1.14/manual/Settings.html
[u-cine]: https://docs.unity3d.com/Packages/com.unity.cinemachine@3.1/manual/index.html
[u-gltf]: https://docs.unity3d.com/Packages/com.unity.cloud.gltfast@6.14/manual/index.html
[u-personal]: https://unity.com/products/unity-personal
[mdn-root]: https://github.com/mdn/content/tree/4204940baf247289646a11f955a23a09640b685b
[mdn-im]: https://github.com/mdn/content/blob/4204940baf247289646a11f955a23a09640b685b/files/en-us/web/html/reference/elements/script/type/importmap/index.md?plain=1#L16
[mdn-im-int]: https://github.com/mdn/content/blob/4204940baf247289646a11f955a23a09640b685b/files/en-us/web/html/reference/elements/script/type/importmap/index.md?plain=1#L143-L150
[mdn-mod]: https://github.com/mdn/content/blob/4204940baf247289646a11f955a23a09640b685b/files/en-us/web/javascript/guide/modules/index.md?plain=1#L411
[mdn-raf]: https://github.com/mdn/content/blob/4204940baf247289646a11f955a23a09640b685b/files/en-us/web/api/window/requestanimationframe/index.md?plain=1#L16-L19
[mdn-gamepad]: https://github.com/mdn/content/blob/4204940baf247289646a11f955a23a09640b685b/files/en-us/web/api/gamepad_api/using_the_gamepad_api/index.md?plain=1#L82-L113
[bcd]: https://github.com/mdn/browser-compat-data/blob/v8.1.5/html/elements/script.json
[pw-root]: https://github.com/microsoft/playwright/tree/5ad202df4f484d593ab42a4a16e6c75f666fef38
[pw-clock]: https://github.com/microsoft/playwright/blob/5ad202df4f484d593ab42a4a16e6c75f666fef38/docs/src/clock.md?plain=1#L20-L36
[pw-kbd]: https://github.com/microsoft/playwright/blob/5ad202df4f484d593ab42a4a16e6c75f666fef38/docs/src/api/class-keyboard.md
