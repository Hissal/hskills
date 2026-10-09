# Unity baseline: coverage, install routes, and overlap with the fork

Research for [#3](https://github.com/Hissal/skill-collection/issues/3), part of the wayfinder map [#1](https://github.com/Hissal/skill-collection/issues/1). Read 2026-10-09. This is the exclusion reference for every Unity/gamedev ledger.

## Summary

- **Two repos, one skill set.** `Unity-Technologies/skills` (34 skills) is the agent-neutral distribution, installed with `npx skills add`. `Unity-Technologies/unity-agent-plugin` (32 skills, v0.1.8-beta) is the same skills packaged as a Claude Code / Codex / Grok plugin named `unity`. The plugin leaves out `unity-pipeline` and `project-auditor-fixes`. In 8 of its skills, every `unity command` call adds `--caller plugin --skill <name>` labels. Nothing else differs.
- **What the baseline is.** It is almost all **feature skills**: UI (router plus UI Toolkit, uGUI, IMGUI), 2D (pixel perfect, tiles, sprites, atlases, 2D physics), URP (BiRP migration, post-processing, Render Graph review, Shader Graph custom nodes), audio, navigation, 3D collisions, localization, TextMeshPro, WebGL, IAP, LevelPlay ads, Unity Gaming Services, multiplayer, Vivox, Graph Toolkit, Pixyz, Editor search, project creation and packages. On top sits one large tooling skill, `unity-cli`: 628 lines plus 11 references covering Editor install, licences, live Editor driving, build, test, recompile, `vcs` and `mcp`. Its companion `unity-pipeline` documents the live-Editor command protocol.
- **How it reaches the agent.** Every baseline skill is **model-invoked** (none sets `disable-model-invocation`). In the plugin, each one can also be typed as `/unity:<name>`. The plugin ships only skills. It has no hooks and no MCP server of its own. The CLI adds mechanisms: `unity mcp configure`, managed git hooks (`unity vcs hooks`) and `unity skill install/disable`. Estimated idle cost of all 32 plugin descriptions: about 2.2k tokens (inference: characters / 4).
- **Overlap with the fork.** No fork skill is a **duplicate**. The fork covers engineering discipline: verification ladder, asmdefs, serialization safety, testing, statics lifecycle, prototyping, debugging loops. The baseline covers feature recipes plus CLI mechanics.
  - **Partial** overlap, all at the mechanics layer:
    - `unity-verification` overlaps the CLI's build/test/recompile commands, Safe Mode, the sandbox caveat, and `run_script`/`eval`.
    - `unity-debugging` overlaps the CLI's Play-mode verification loop.
    - `unity-serialization` overlaps `unity vcs merge-setup/conflicts/explain/resolve/diff/status/hooks`.
    - `unity` (the router) overlaps `unity docs --url`, and already delegates to it.
  - **None**: `unity-assemblies`, `unity-testing` (beyond `unity test --affected`), `unity-code-lifecycle`, `unity-prototyping`.
  - The fork already treats the CLI's own skill as the owner of command syntax (`unity skill show`). Its overlaps are mostly pointers, not copies.
- **Gaps neither covers** (seed list for the Unity pack): animation, Timeline and Cinemachine; Input System; Addressables and asset loading; scene loading; async (`Awaitable`, UniTask); performance (GC, Jobs, Burst, profiling); DOTS/ECS; HDRP, lighting and shaders beyond Shader Graph nodes; VFX Graph; Netcode for GameObjects code; save systems; UPM package authoring; build and player configuration (IL2CPP stripping, `link.xml`); C# style for Unity; editor tooling beyond UI. See section 5.
- **Local state.** `unity@unity-agent-plugin` 0.1.8-beta is installed at user scope at the same SHA this report pins (`cf6b2da`), and is disabled in `~/.claude/settings.json`. All 8 fork Unity skills are symlinked into `~/.claude/skills`.

## Sources (pinned)

- **S**: `Unity-Technologies/skills` @ [`9d28210`](https://github.com/Unity-Technologies/skills/tree/9d282100540601cfddc4bbd69f36a239d7a6f55c) (commit 2026-10-08). Links below are relative to `https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/`.
- **P**: `Unity-Technologies/unity-agent-plugin` @ [`cf6b2da`](https://github.com/Unity-Technologies/unity-agent-plugin/tree/cf6b2da24e424b0a60d560a57f39f676cb6f79f3) (commit 2026-10-06). Links are relative to `https://github.com/Unity-Technologies/unity-agent-plugin/blob/cf6b2da24e424b0a60d560a57f39f676cb6f79f3/`.
- **F**: the fork, local `C:\dev\skills\mattpocock-skills-unity` @ `3d926c6e1c2024ee2579f9f5fdb362d8dc5e6515`, `skills/unity/` (read locally. Whether this SHA is pushed was not checked).
- **D**: Unity docs, [About Unity's plugin](https://docs.unity.com/en-us/ai/unity-plugin/about-unity-plugin) (page "last updated a month ago", read 2026-10-09).
- Local machine state: `C:\Users\hissa\.claude\plugins\installed_plugins.json`, `C:\Users\hissa\.claude\settings.json` (read only).

Both repos were shallow-cloned into the session scratchpad. Nothing was executed from them.

## 1. How the two repos relate and how each installs

| | `Unity-Technologies/skills` (S) | `Unity-Technologies/unity-agent-plugin` (P) |
|---|---|---|
| Install | `npx skills add Unity-Technologies/skills` ([S README.md](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/README.md)) | Claude Code: `/plugin marketplace add Unity-Technologies/unity-agent-plugin` then `/plugin install unity@unity-agent-plugin`, or the same through `claude plugin ...`. Codex: `codex plugin marketplace add` / `codex plugin add`. Grok: `/marketplace`. Manual: symlink each `skills/*` into `~/.claude/skills` or `~/.agents/skills` ([P README.md](https://github.com/Unity-Technologies/unity-agent-plugin/blob/cf6b2da24e424b0a60d560a57f39f676cb6f79f3/README.md)) |
| Advised for | Any of "50+" agents through skills.sh. The README tells Claude Code and Codex users to install the plugin instead, "so they update together and appear in the agent's own plugin and slash-command menus" (S README) | Claude Code, Codex, Grok (P README) |
| Packaging | Bare `skills/` tree, CI frontmatter check ([S .github/workflows/validate-skills.yml](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/.github/workflows/validate-skills.yml)) | One plugin, `unity` v0.1.8-beta, `source: "./"` ([P .claude-plugin/plugin.json](https://github.com/Unity-Technologies/unity-agent-plugin/blob/cf6b2da24e424b0a60d560a57f39f676cb6f79f3/.claude-plugin/plugin.json), [marketplace.json](https://github.com/Unity-Technologies/unity-agent-plugin/blob/cf6b2da24e424b0a60d560a57f39f676cb6f79f3/.claude-plugin/marketplace.json)). Codex manifest sets `"skills": "./skills/"` and `requires_local_executor: true` ([P .codex-plugin/plugin.json](https://github.com/Unity-Technologies/unity-agent-plugin/blob/cf6b2da24e424b0a60d560a57f39f676cb6f79f3/.codex-plugin/plugin.json)) |
| Skills | 34 | 32: S minus `unity-pipeline` and `project-auditor-fixes` (directory diff of the two clones) |
| Content delta | baseline | 8 `SKILL.md` differ (`audio-setup-mixers`, `create-2d-physics`, `migrate-birp-to-urp`, `optimize-audio`, `optimize-web`, `sprite-editor`, `unity-cli`, `urp-postprocessing`). The diff shown for `unity-cli` and `optimize-web` adds `--caller plugin --skill <name>` to `unity command` calls; per the plugin text these flags "are inert to the command itself; they only label the invocation" ([P skills/unity-cli/SKILL.md L26-L29](https://github.com/Unity-Technologies/unity-agent-plugin/blob/cf6b2da24e424b0a60d560a57f39f676cb6f79f3/skills/unity-cli/SKILL.md#L26-L29)). That the other six differ the same way is *inference* (not every diff was read) |
| Contributions | "maintained by Unity and published here automatically", no PRs ([S CONTRIBUTING.md](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/CONTRIBUTING.md)) | same channel (Unity Discussions) |
| Requires | Unity 6+ (P README "Works with"); D: "Unity 6.0 or later" | same |

**Three more delivery routes, all through the Unity CLI** (documented in S `skills/unity-cli/references/integration-advanced.md`):

- `unity setup claude` runs the two `claude plugin` commands at **user scope**. The doc says "don't also run `unity skill install claude-code` — Claude Code would load two copies" ([L112-L135](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/integration-advanced.md#L112-L135)).
- `unity skill install <client> [--local]` writes the `unity-cli` skill, which "is embedded in the CLI binary at build time", into the client's skills directory. With `--local` it also mirrors the `unity-pipeline` skill from the project's `com.unity.pipeline` package, because `Library/PackageCache` is not read by any client. The package skill "never installs user-globally" ([L137-L175](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/integration-advanced.md#L137-L175)). This explains why `unity-pipeline` is absent from the plugin: it is versioned with the project's package. The plugin's `unity-cli` also points to it ([S skills/unity-cli/SKILL.md L45](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/SKILL.md#L45)).
- `unity skill disable/enable` turns a skill off by renaming `SKILL.md` to `SKILL.md.disabled`. The doc justifies this with idle cost: "Every installed skill's frontmatter is loaded in every session … so the cost scales with how many skills are installed" ([L197-L225](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/integration-advanced.md#L197-L225)).

**Address of the baseline**, in this collection's vocabulary:

- The plugin installs at user scope by default (P README; `unity setup claude` above). So unless it is scoped per project, it lands as **core model-invoked**, costing about 2.2k tokens of descriptions in every session.
- To make it behave as **Unity pack model-invoked**, enable it per project. *Inference*: Claude Code plugins can be enabled per project through `enabledPlugins` in a project's `.claude/settings.json`. This is not verified in this ticket, and it belongs to the install-architecture ticket.
- On this machine the plugin is installed at user scope (`installed_plugins.json`: `"scope": "user"`, `0.1.8-beta`, `gitCommitSha` `cf6b2da…`) and disabled (`settings.json` line 18: `"unity@unity-agent-plugin": false`).

**Mechanisms in the baseline** (not skills):

- **Plugin repo:** a frontmatter-check CI script ([S scripts/check-skill-frontmatter.mjs](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/scripts/check-skill-frontmatter.mjs)). The plugin has no hooks, no `.mcp.json` and no commands directory (file listing of P).
- **The CLI's own mechanisms**, which a skill tells the agent about:
  - `unity mcp` / `unity mcp configure <client>`: an MCP server exposing the connected Editor's commands. 16 clients are supported, including `claude-code` and `codex` ([integration-advanced.md L68-L110](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/integration-advanced.md#L68-L110)).
  - `unity vcs hooks install`: managed git `pre-commit`, `post-checkout` and `post-merge` hooks that run "the Unity integrity checks" ([version-control.md L147-L160](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/version-control.md#L147-L160)).
  - `unity ci init`, which scaffolds a CI workflow ([diagnostics-maintenance.md L53](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/diagnostics-maintenance.md#L53)).

## 2. Baseline inventory

Columns: lines = `SKILL.md` length at S; **in P** = shipped in the plugin. All skills are model-invoked; in P each is also user-typable as `/unity:<name>` (P README "Verify it worked"). Coverage is paraphrased from each skill's `description` frontmatter at `skills/<name>/SKILL.md`.

| Skill | Lines | In P | Coverage (from its description) | Notable frontmatter |
|---|---|---|---|---|
| `2d-pixel-perfect` | 208 | yes | PixelPerfectCamera setup and blur/jitter fixes, URP or Built-in | |
| `asset-transformer-toolkit` | 39 | yes | Pixyz / Asset Transformer imports, RuleSets, Actions, LODs | `required_packages: com.unity.industry.toolkit >=4.0.0` |
| `audio-setup-mixers` | 126 | yes | Routing Audio Sources into Mixer Groups | |
| `build-gtk` | 242 | yes | Graph Toolkit node editors, State Machine API, GraphView migration | `required_editor_version: >=6000.6` |
| `build-live-game` | 316 | yes | UGS backend: accounts, cloud save, leaderboards, achievements, battle pass, economy, cloud code, remote config | |
| `create-2d-physics` | 78 | yes | 2D Physics Core and legacy Rigidbody2D | `allowed-tools: WebFetch, WebSearch` |
| `create-tile-palette-or-rule-tiles` | 12 | yes | Tile palettes, rule tiles | |
| `generate-editor-search-query` | 117 | yes | Unity Search queries, opening the Search window | `modes: [agent, ask]` |
| `implement-in-app-purchases` | 157 | yes | Unity IAP, subscriptions, receipt validation, D2C, migration from RevenueCat/Adapty/etc. | |
| `initialize-ai-navigation` | 95 | yes | NavMesh surfaces, agents, obstacles, links | |
| `levelplay-unity-integration` | 442 | yes | LevelPlay ad mediation, ad privacy, Android/iOS dependency failures | |
| `localization` | 347 | yes | Unity Localization, String/Asset Tables, CJK fonts | |
| `manage-sprite-atlas` | 351 | yes | SpriteAtlas prebuild pipeline, variants, platform overrides | |
| `migrate-birp-to-urp` | 543 | yes | Built-in to URP migration, shader triage | |
| `new-unity-project` | 261 | yes | New game or prototype: concept, platforms, monetization, project, source control, packages | `allowed-tools: Bash, Read, Write, Edit, AskUserQuestion` |
| `optimize-audio` | 199 | yes | Audio import settings, Load Types, codecs, mixer CPU | |
| `optimize-text-mesh-pro` | 172 | yes | TMP font stacks, fallback atlases, SDF quality | |
| `optimize-web` | 429 | yes | WebGL/WebGPU size and load time, compression, stripping, shader variants | |
| `physics-3d-collision` | 442 | yes | PhysX collision/trigger/raycast diagnosis | |
| `project-auditor-fixes` | 64 | **no** | Run Project Auditor via `unity command audit` and fix the CSV | `version: 1.0.0` |
| `setup-multiplayer-services` | 36 | yes | Multiplayer Services topology, hosting, matchmaking, sessions/lobbies | |
| `setup-vivox-voice-chat` | 118 | yes | Vivox voice and text chat | `required_packages: com.unity.services.vivox >=16.4.0` |
| `shader-graph-create-custom-node` | 25 | yes | Custom Shader Graph nodes from HLSL | `required_packages: com.unity.shadergraph >=17.5.0` |
| `sprite-editor` | 66 | yes | Sprite rects, borders, pivots, slicing via generated C# | `modes: [agent, ask]` |
| `sprite-segment-3x3grid` | 136 | yes | 3x3 grid colour analysis of a sprite | |
| `ui` | 142 | yes | Router to UI Toolkit / uGUI / IMGUI; "Consult before writing any UI code" | |
| `ui-imgui` | 180 | yes | IMGUI EditorWindows, Inspectors, PropertyDrawers | |
| `ui-ugui` | 276 | yes | Canvas, RectTransform, Layout Groups, prefab UI | |
| `ui-uitk` | 229 | yes | UXML/USS, UIDocument, PanelSettings, custom elements, runtime binding | |
| `unity-cli` | 628 (+11 refs) | yes | The `unity` CLI: Editors, licences, projects, live Editor driving, build, test, recompile, VCS, MCP | `allowed-tools: Bash` |
| `unity-package-management` | 304 | yes | Headless UPM installs via the C# Client API | `allowed-tools: Bash, Read, Write, Edit` |
| `unity-pipeline` | 188 | **no** (ships in `com.unity.pipeline`) | Live Editor/dev Player control: recompile, tests, `run_script`, `eval`, method reload, audit | |
| `urp-postprocessing` | 188 | yes | URP Volume post-processing | `required_packages: com.unity.render-pipelines.universal >=14.0.0` |
| `validate-urp-render-graph-renderer-feature` | 269 | yes | Review of a Unity 6 URP ScriptableRendererFeature on Render Graph | |

### 2.1 What `unity-cli` covers (the part that matters for the fork)

From the `unity-cli` SKILL.md and its references at S:

- **Live Editor driving.**
  - `unity status`, `unity command <name>` and `unity command eval` go through the `com.unity.pipeline` package ([SKILL.md L15-L45](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/SKILL.md#L15-L45)).
  - Safe Mode and sandbox false negatives ([L47-L49](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/SKILL.md#L47-L49)).
  - A rule: "Never hand-edit `.unity`, `.prefab`, or `.asset` YAML while a live Editor is reachable" ([L221-L244](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/SKILL.md#L221-L244)).
- **Build, run, test, recompile.** `unity run`, `unity test`, `unity build` and `unity recompile` ([build-run-test.md](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/build-run-test.md)) cover:
  - JUnit reports, sharding, retries;
  - `--affected` test selection from a GUID impact graph, explicitly "a lower bound" ([L278-L300](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/build-run-test.md#L278-L300));
  - `unity watch test`;
  - `unity recompile` exit codes 0/6/7 ([L328-L355](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/build-run-test.md#L328-L355)).
- **Play-mode verification loop.** `set_autotick`, `editor_play`, `wait_for` on `Time.frameCount`, `capture_game_view`, `console`, `eval`, `editor_stop` ([playmode-verification-loop.md L217-L229](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/playmode-verification-loop.md#L217-L229)).
- **Unity-aware version control** ([version-control.md](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/version-control.md)):
  - `vcs status`, which flags `.meta` pairing problems ([L164-L176](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/version-control.md#L164-L176));
  - `vcs merge-setup`, which wires UnityYAMLMerge ([L115-L128](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/version-control.md#L115-L128));
  - `vcs diff` / `blame`, a semantic scene and prefab diff by object name ([L214-L240](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/version-control.md#L214-L240));
  - `vcs conflicts` / `explain` / `resolve` ([L333-L370](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/version-control.md#L333-L370));
  - `vcs affected`, `vcs doctor`, `vcs hooks`, `vcs git worktree`.
  - All of these are documented in the skill at this SHA and **not checked against a CLI binary** here. The CLI is beta ([SKILL.md "Notes"](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/SKILL.md#L615)).
- **Docs.** `unity docs --url <Class>` returns a version-matched docs URL ([diagnostics-maintenance.md L315-L346](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/diagnostics-maintenance.md#L315-L346)).
- **Also covered:** auth, licences, cloud, editors install, projects and templates, collaboration and Jira, Unity Cloud Build and Pipeline Automation reads.

`unity-pipeline` adds:

- the autonomous edit loop (`set_autotick`, `recompile`/`recompile_status`, `run_tests`);
- `reload_file` method reload;
- `run_script` "builder pattern";
- `eval`;
- `audit` (Project Auditor);
- gotchas: modal dialogs and `blocked_by_dialog` ([S skills/unity-pipeline/SKILL.md](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-pipeline/SKILL.md)).

`project-auditor-fixes` is a near-copy of `unity-pipeline` section 6 ([S skills/project-auditor-fixes/SKILL.md](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/project-auditor-fixes/SKILL.md)).

### 2.2 Unity's own usage advice (D)

Unity's docs say:

- Name the UI framework in requests (UI Toolkit for new projects, uGUI where already used).
- Ask the agent to read a skill's `references/` when a result looks wrong.
- Expect clarifying questions, which "can block automated pipelines".
- Name a skill explicitly when it does not trigger.

## 3. Fork skill overlap

Fork skills are read at F `skills/unity/<name>/SKILL.md`. The fork already defers to the CLI's own skill for command syntax: `unity-verification` says "search with `unity commands --grep <term>` first, then run `unity skill show`…: the CLI is beta and moves every few weeks". The router `unity` treats "the Unity CLI's own skill" as a route target read with `unity skill show` (F `unity/SKILL.md` §3, `unity-verification/SKILL.md` intro). So most overlaps below are **shared mechanics with pointers**, not duplicated prose.

| Fork skill | Verdict | Overlapping sections (fork ↔ baseline) | Fork-only content |
|---|---|---|---|
| `unity` | **partial** (small) | §4 "Unity docs" ↔ `unity docs --url` (diagnostics-maintenance.md L315-L346): the fork already calls it and adds a fallback URL scheme. §3 routes "capturing the Game or Scene view" to the CLI skill. Shape echo: baseline `ui` is also a router, but for a different domain | Repo detection (project / package / both), Unity config (`docs/agents/unity.md`), need→skill routing table, "No Unity skill covers" gap report |
| `unity-verification` | **partial** | "Where Unity runs" (connected editor via `unity recompile`/`unity command`, headless via `unity test`/`build`/`run`) ↔ unity-cli SKILL.md L15-L49 and build-run-test.md. ENVIRONMENTS.md "Safe Mode" and "Pending editor" ↔ unity-cli SKILL.md L47-L49 and integration-advanced.md "Recovering from Safe Mode" / `STATUS_PIPELINE_LOAD_PENDING` (unity-pipeline §1). RUNNING-CSHARP.md (`run_script`, `eval`) ↔ unity-pipeline §4-§5. "Reading results" ↔ build-run-test.md exit codes (`unity test` exit 8, `recompile` 6/7). The fork's reading is stricter: it treats exit 0 on an empty filter as not green | Verification ladder and rung rule, hard rules (never close the user's editor, leave licences alone), warm `Library/` copy for worktrees, cold-import ask, CI hand-off, report format, ticket slicing, issue classification |
| `unity-debugging` | **partial** | "The Play loop" traps (`set_autotick`, frame-1 stall, `wait_for` on frame count, console read, `eval` tuning) ↔ playmode-verification-loop.md (the fork cites it: "Unity's Play-mode verification loop recipe covers the same switches"). REPL (`eval`, `run_script`) ↔ unity-pipeline §4-§5. Method reload (unity-pipeline §3) is not used by the fork | Ten loop kinds in Unity form, `play-loop.sh` (red/green/no-verdict, double run with domain reload off), conditional breakpoint via `wait_for` + pause, bug-class table routing to sibling skills, throwaway-file hygiene, Player logs and Development Builds, performance baseline and `ProfilerRecorder` |
| `unity-testing` | **none** (mechanics touch only) | "Choosing tests" is close to `unity test --affected` (build-run-test.md L278-L300), but the fork chooses by module and the CLI by GUID graph. Run mechanics belong to `unity-verification`. No baseline skill gives test-writing guidance (`EditMode` appears only in `unity-cli`, as a run flag) | Mode rule, humble MonoBehaviour, engine-as-dependency ports, EditMode traps, static state in tests, run cadence with `tdd`, test seams for specs, review checklist |
| `unity-assemblies` | **none** | `asmdef` appears in the baseline only incidentally (2d-pixel-perfect, build-gtk, build-live-game, setup-multiplayer-services, unity-cli); `vcs affected` walks asmdefs but gives no rules | All of it: assembly traps, Editor/runtime split, GUID references, `versionDefines`, recompile triggers, C# language limits, analyzers, seams at assembly boundaries |
| `unity-serialization` | **partial** | "Merge conflicts"/MERGING.md ↔ `unity vcs merge-setup`, `conflicts`, `explain`, `resolve` (version-control.md L115-L128, L333-L370): the CLI automates the driver setup and resolution that MERGING.md does by hand and diagnoses. "Reviewing serialized changes" ↔ `vcs diff` (semantic, by object name), `vcs status` (meta pairing), `vcs hooks` (integrity checks). "Editing order" step 1 ↔ unity-cli's "never hand-edit YAML while a live Editor is reachable" (SKILL.md L221-L244): consistent, and the fork defers to it | Identity rules (file-scoped namespace trap), rename attributes (`FormerlySerializedAs`, `MovedFrom`, backing fields, enums), expand/contract reserialize with `SerializationScope`, surgical UnityYAML edits, validation checks, ticket slicing, hotspot exclusions. `FormerlySerializedAs`, `SerializeReference` rules, and MERGING.md's pause list and driver-misconfiguration diagnosis have no baseline counterpart (grep of S) |
| `unity-code-lifecycle` | **none** | No `AutoStaticsCleanup` or `RuntimeInitializeOnLoadMethod` anywhere in S. "Domain reload" appears only in passing (build-gtk, localization, migrate-birp-to-urp, unity-cli, unity-pipeline) | All of it |
| `unity-prototyping` | **none** | `new-unity-project`'s description says "Use when the user asks to start a new game or prototype". That means a new *project*, not a throwaway prototype inside an existing one. **Trigger risk** (inference): the word "prototype" may pull both skills | All of it |

**Trigger collisions to watch** (inference from the descriptions, not tested):

- `unity-cli`'s description ("build, test, … run any unity command") competes with `unity-verification` ("running Unity tests, building a player").
- Baseline `ui` says "Consult before writing any UI code", which no fork skill contests.
- `new-unity-project` vs `unity-prototyping`, on the word "prototype".

## 4. Implications for ledgers (proposed, not decided)

- **Exclude from Unity/gamedev ledgers.** Any candidate that teaches:
  - the feature areas in section 2's table (UI frameworks, 2D, URP migration and post-processing, audio optimization, navigation, 3D collisions, localization, TMP, WebGL, IAP, ads, UGS, multiplayer services, Vivox, Graph Toolkit, Pixyz, Editor search, project bootstrap, UPM installs);
  - `unity` CLI command syntax (including `vcs`, `test --affected`, `recompile`, `docs`, `mcp`).
  A candidate in these areas is only worth taking if it brings a discipline the baseline lacks, not a recipe.
- **The fork's partial overlaps are at the mechanics layer.** A later theme session could decide whether `unity-serialization`'s merge material should defer to `unity vcs resolve`/`merge-setup` where the CLI exists. The same question applies to whether `unity-verification`/`unity-debugging` should shrink further toward pointers. This report only flags it. The fork's research (`research/unity-verification.md`, `unity-merging.md`) is the place that holds the CLI-version evidence.
- **Idle cost.** At about 2.2k description tokens, the baseline is roughly four times the fork's 8 Unity descriptions (about 540 tokens; both estimated as characters / 4). Installing the plugin per project (Unity pack) rather than at user scope matters more than any single fork skill's description.

## 5. Gaps: Unity areas neither covers (seed list for the Unity pack)

Method: no baseline skill is dedicated to the topic (section 2 table), confirmed by grep of S, where hits are only passing mentions. Also, no fork skill covers it (F README and SKILL.md files). This is a list of absences, so the "neither covers" claim is *inference from search*, not a source statement.

1. **Animation**: Animator controllers, blend trees, Timeline, Cinemachine (S mentions are incidental: Cinemachine in 2d-pixel-perfect/build-live-game/unity-package-management).
2. **Input System**: actions, rebinding, multiple devices (incidental mentions only).
3. **Asset loading**: Addressables groups and loading, Resources, AssetBundles. `manage-sprite-atlas` touches Addressables delivery for atlases only.
4. **Scene management**: loading and unloading, additive scenes, bootstrap scenes (no `SceneManager.LoadScene` hit in S).
5. **Async in Unity**: `Awaitable`, coroutines vs async, UniTask (no hits).
6. **Runtime performance**: GC allocations, pooling, Jobs, Burst, Profiler and Memory Profiler workflows. Optimize-* skills cover audio, TMP and web only. The fork's `unity-debugging` covers measurement method, not optimization.
7. **DOTS/ECS**: Entities, Netcode for Entities (incidental "ECS" hits only).
8. **Rendering beyond URP setup**: HDRP, lighting and baking, writing HLSL/ShaderLab shaders (beyond a Shader Graph custom node), VFX Graph (no hits).
9. **Gameplay networking code**: Netcode for GameObjects (RPCs, NetworkVariables, ownership). `setup-multiplayer-services` covers services and topology, not netcode patterns.
10. **Save systems and persistence**: serialization to disk, versioned save data (PlayerPrefs hits are IAP/ads only).
11. **UPM package authoring**: `package.json`, samples, versioning, package tests. Relevant to the owner's C# library work. `unity-package-management` only *installs* packages; the fork's skills know the package *shape* but not how to author one.
12. **Build and player configuration**: IL2CPP code stripping and `link.xml`, build profiles, platform player settings (incidental mentions in optimize-web and physics-3d-collision). The fork's `unity-verification` covers *running* a build.
13. **C# and Unity code style**: `SerializeField` vs public, null checks on `UnityEngine.Object`, event patterns, ScriptableObject architecture. The fork holds only the lifecycle and serialization correctness slices.
14. **Editor tooling beyond UI**: custom importers and `AssetPostprocessor` (one sprite-editor hit), `[MenuItem]` tools, `SerializedObject` editing patterns. The fork's serialization skill uses them, but none teaches them.
15. **Terrain, ProBuilder, Splines, physics beyond collision triage** (character controllers, joints): mentions only.
