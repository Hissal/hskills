---
name: unity-prototyping
description: Unity prototyping rules. Use when prototyping gameplay or other content of a Unity project; choosing between a browser sketch and Unity; running a Unity prototype or switching its variants; or capturing or removing a prototype from a Unity project.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/unity-prototyping"
  agent-skills-sync.requires: '["hissal.skill-collection/unity-guide"]'
  opencode/autoinvoke: "true"
---

# Unity prototyping

Before doing any work, load unity-guide (hissal.skill-collection/unity-guide) and its needed
reference files through the installed skill listing. Begin work only after all
requirements and needed references have loaded. If any cannot load, stop
without partial work and print:

Stopped: required skill unity-guide (hissal.skill-collection/unity-guide) could not be loaded
completely. Unavailable: <unloadable-material>. Ordinary installers such as
`npx skills` do not install requirements; `agent-skills-sync` resolves them
from this metadata. Install or repair the requirement, then retry.

Check only whether the required material loads; the installer verifies identity
and content. Loading this requirement grants no permission to invoke a
user-invoked workflow; wait for the human to invoke that workflow.

This skill is the Unity layer on core `prototype`, which keeps the brief, the branches, capture, the verdict and test-driving. Load `prototype` too when this skill fired first; when it is not installed, say so once and carry on with these rules. Where the two differ, this skill wins for Unity work: its folder replaces "near its code", and its checkout rule replaces core's worktree rule.

A prototype of something outside the Unity project, such as a web app in the same repo, is core's alone: leave this skill. Ask `unity-guide` for the other Unity knowledge named below, by need. A need no row answers leaves you with the rules here.

`docs/agents/unity.md` overrides these defaults, including its **Prototype folder** field.

## Choose the medium

Core's rule decides: the cheapest medium that does not fake the dimension under test. Name the brief's dimension, then:

| The dimension | Medium |
|---|---|
| Rules, state, turns, economy, progression | Browser sketch |
| Flat layout: a menu, a HUD, a settings screen | Browser sketch |
| Coarse gameplay: whether a real-time loop has a decision in it, arena scale, camera kind | Browser sketch |
| Physics, camera, rendering or input feel; scene or package behaviour; performance; fit with existing scenes, prefabs or code | Unity |

A browser sketch follows core's branches as written. State its limits in the brief and at hand-over:

- Its JavaScript does not lift into C#. What carries over is the verdict, the rules (through core's semantics summary before a port), the verb list, coarse spatial facts and content tables.
- Its constants, feel and performance are never validated Unity results. It can rule an idea out on feel, and only Unity can rule one in.

The rest of this skill is for a prototype built in Unity.

## Choose the folder

Each prototype gets `<prototype folder>/<name>/`, holding its scripts, scenes and assets and nothing outside it. The prototype folder is the **Prototype folder** field, or `Assets/_Prototypes/` in the Unity project. In a package-only repo, ask which project hosts it.

Run `git check-ignore -v <folder>/x` before writing:

- **Not ignored** (the default): the folder first appears on the throwaway branch, committed normally with its `.meta` files. Add no ignore rule and commit nothing to the default branch.
- **Ignored**: use the folder as found, and tell the user now: nothing in it reaches another machine until captured with `git add -f`.

## Choose the checkout

Do this before the first file. Ask `unity-guide` for checkout isolation, which gives the warm-copy and cold-import rules. Then take the first case that fits:

1. **A `Library/` is available**: a warm copy is possible, or a cold import is permitted or the user approved one. Create the throwaway branch in a separate worktree beside the checkout, and give it its `Library/` under those rules before Unity opens it.
2. **A cold import is declined, or no row answers and the user has not approved one**: ask once when the user can answer and has not already declined. A decline means a throwaway branch in the current checkout, except when unrelated uncommitted work is present or an Editor holds the project. In either of those cases **stop and ask** how to proceed, with no branch, no file and no Editor started, naming what you found.

## Isolate it

Ask `unity-guide` for assembly rules, then give the prototype its own asmdef with:

```json
"autoReferenced": false,
"defineConstraints": ["UNITY_EDITOR"]
```

- `autoReferenced: false`: `Assembly-CSharp` cannot see it and no production asmdef references it, so production code never depends on the prototype.
- `defineConstraints: ["UNITY_EDITOR"]`: it compiles only in the Editor and stays out of player builds, while its MonoBehaviours still attach to scene objects. It may use `UnityEditor` with no `#if`.
- The asmdef sits in an ordinary folder on all platforms: Unity refuses to attach a MonoBehaviour from an Editor-platform asmdef or an `Editor` folder.

When the code the prototype needs lives in `Assembly-CSharp`, which asmdef code cannot reference, use no asmdef and wrap each file whole in `#if UNITY_EDITOR`.

Every file and folder gets a `.meta`, including `<folder>.meta` and `<folder>/<name>.meta` in their parents. Hand-written, each carries a fresh 32-hex GUID; Unity makes the rest on import.

A compile error in the prototype fails the whole project's compile, so it compiles clean before hand-over.

## Build the scenes

- **On an existing scene**, preferred when one hosts the question: a prototype scene in the subfolder holds the variants, the host opens additively beside it, and the prototype scene is active so run-time objects land in it.
- **Standalone**: a greybox scene in the subfolder, when nothing existing hosts the question.

Neither goes in the build profile's scene list, since `EditorSceneManager.OpenScene` needs no build entry.

**The host scene stays unsaved while the prototype is open.** It stays clean through Play and Play-mode edits, but any Edit-mode change dirties it and a save of all open scenes writes it. Save only the prototype scene, with `EditorSceneManager.SaveScene`, and tell the human the same at hand-over.

## Make it run

[TEMPLATES.md](TEMPLATES.md) has each of these. Fit them to the actual project.

- **One menu item, `Prototypes/<name>`.** A scene prototype offers to save modified scenes, opens the prototype scene, opens the host additively, sets the prototype scene active and enters Play. A logic prototype opens its EditorWindow driver with no Play.
- **Logic driver**: an EditorWindow over a pure class, laid out like core's logic page: the question, the current state in labelled fields, free-play buttons, one tab per scenario. The class uses no `UnityEngine` or `UnityEditor` type, so it lifts into real code as is.
- **Variant switcher**: a runtime overlay at the bottom centre with left and right arrows and the current variant's name, the arrow keys cycling too and ignored while a text field has focus. Variants are structurally different, not a tweaked number. Each is a GameObject subtree the switcher activates alone.

## Check it, then hand it over

Ask `unity-guide` for checking a change compiles or works. With an Editor already connected: compile clean, run `EditorApplication.ExecuteMenuItem("Prototypes/<name>")`, confirm Play started with the prototype scene active and a clean console, switch a variant, exit Play. Pass any Game view capture a path outside `Assets/`, or it creates an asset folder. With none connected, compile headless once and report the Play check as unvalidated: the user's own try covers it, so a prototype never earns opening an Editor or scripting a Play run. When Unity cannot run here, report the compile as unvalidated too.

These hold before hand-over, and any miss gets fixed first:

- Every file of the prototype is inside its subfolder, and the default branch has none of it.
- The isolation above holds, and no production asmdef references the prototype.
- No prototype scene is in the build profile, and the host scene is unmodified in the diff.

**Ready to try means this check is done and the question can be answered by using it.** Commit, including every `.meta`, then push the throwaway branch, with or without a draft PR as core settles it. Work in progress stays local unless core's draft PR applies. With an ignored folder there is nothing to push until capture, so say that instead. With no remote, say the branch is local only.

The reply names:

- the branch, and that it never merges;
- what to open: the project path and its Editor version from `ProjectVersion.txt`, then the `Prototypes/<name>` menu item;
- the variant names, and the host-scene rule above.

## Share it beyond the Editor

Sharing follows core: local by default, then the project's configured route. A teammate with the Editor uses the branch and menu item.

A teammate without the Editor needs a separate Player-capable artifact: playable code in runtime-compatible scripts, a runtime entry scene and variant controls, a dedicated build profile, and its own build and run check, all on the throwaway branch. Say plainly that the Editor-only prototype does not become runnable by choosing a Development Build, because its code is compiled out of every Player.

## Capture and remove

Core's capture rule applies: the prototype stays on its throwaway branch, and the default branch keeps only the validated decision, rewritten into production assemblies.

1. **Capture.** A committed folder is captured by its commits. With an ignored folder, run `git add -f <folder>/<name> <folder>/<name>.meta` on the throwaway branch and commit; the subfolder's own `.meta` sits in the ignored parent and has to be named.
2. **Find what remains.** A prototype committed only to its branch leaves nothing on the working branch beyond any worktree, which you remove when the user asks. Keep the branch as core's record. Carry on below only for a copy left in a checkout.
3. **Grep every GUID.** Ask `unity-guide` for serialization rules. Grep every `guid:` in the subfolder's `.meta` files across the project outside the subfolder. A hit means a validated piece was folded in by reference: move it out first, with its `.meta`, then grep again until nothing refers to the prototype.
4. **Delete** the subfolder and its `.meta`, with no prototype scene open.
5. **Compile**, and read the console for errors and missing-script warnings. When Unity cannot run here, report the removal as unvalidated.
