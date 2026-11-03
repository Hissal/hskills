---
name: unity-debugging
description: Use when reproducing a Unity bug, driving or observing Play mode, reading Editor or Player logs, attaching a debugger, capturing Unity visual evidence, or measuring a Unity performance regression.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/unity-debugging"
  agent-skills-sync.requires: '["hissal.skill-collection/unity-guide"]'
  opencode/autoinvoke: "true"
---

# Unity debugging

Before doing any work, load unity-guide (hissal.skill-collection/unity-guide) and its needed reference files through the installed skill listing. Begin work only after all requirements and needed references have loaded. If any cannot load, stop without partial work and print:

Stopped: required skill unity-guide (hissal.skill-collection/unity-guide) could not be loaded completely. Unavailable: <unloadable-material>. Ordinary installers such as `npx skills` do not install requirements; `agent-skills-sync` resolves them from this metadata. Install or repair the requirement, then retry.

Check only whether the required material loads; the installer verifies identity and content. Loading this requirement grants no permission to invoke a user-invoked workflow; wait for the human to invoke that workflow.

The Unity mechanics of an investigation: reproducing, observing, tracing what wrote a value, logs and Players, visual evidence. The discipline (hypotheses, the fix, cleanup) belongs to `diagnosing-bugs` or whichever workflow is running; this skill supplies its Unity form. A caller keeps its own job: a review stays read-only, and a lookup answered from here starts nothing.

The Unity CLI owns command names and flags, and they change between package versions. Find them with `unity command --query <term>` in the project, and take the ordered Play recipe from `unity skill show --path references/playmode-verification-loop.md`. Names below come from CLI 1.0.0-beta.15 with `com.unity.pipeline` 0.9.1-exp.1.

## The procedure

1. **Take the project's play route.** Look in `docs/agents/unity.md`, the check-commands file and the repo's docs for how this game is driven: a debug menu, a scene loader, an input replay, an automation entry point. Use it where it exists.
2. **Reproduce the symptom in a run** you can repeat, through [the loop that fits](#loops-in-unity).
3. **Inspect state in that run** before reading code for a theory: live values through `script eval`, the console, existing logs and overlays.
4. **Reuse the project's instrumentation**, then add only what is missing: one tagged log line or one small component. A small probe is ordinary investigation. A game that is hard to drive gets a probe and a stated gap, never a harness, framework or verification generator.
5. **[Trace the writer](#trace-the-runtime-writer)** when a value differs from what the scene or prefab holds, and **[find the first divergence](#find-the-first-divergence)** when state is wrong. Claim a cause only from what those showed.

With no route to the state the bug needs, name the evidence class you could not get (`Not observed: a live Player on the target device`), and say what would supply it. Reasoning about that class is labelled as reasoning.

## Trace the runtime writer

The Inspector in Edit mode shows what is serialized. A run may use something else: `Awake` code, a manager, a loaded config, an Animator curve. So when a scene or prefab value looks ignored, find what wrote it before touching the asset. Changing an asset that a writer overwrites leaves the symptom as it was.

1. **Read the value in the run**, and compare it with the serialized one. Equal values end this branch.
2. **List candidate writers.** Search past the field's name: its property and any interface that property implements, `SerializedObject` and reflection by string, `JsonUtility.FromJsonOverwrite` and other loaders, Animation clips that bind the property, `[RuntimeInitializeOnLoadMethod]`, and other scripts reaching the same object.
3. **Let the run pick the writer.** A search finds code that could write; a disabled component or an unused branch never does. Log the call: a tagged line with the old value, the new value and `Time.frameCount` in the setter, which `Debug.Log`'s stack then names. For a write after Play starts, `job wait` on the member with `op: changed` and `on_met` pause stops in that frame. A write in `Awake` or earlier has already happened by the time a wait is armed, so use the log.
4. **Fix the writer**: its condition, its source or its existence. The scene and prefab files stay byte-identical, even a reference the fix orphans: Unity drops the stale line at its next save, so name it in your report instead of editing it. When the overwrite is deliberate, `diagnosing-bugs`' divergent-fix rule applies: take the chain and the conflict to the user.

The same reading applies to measured defaults: serialized overrides, runtime writers and remote configuration can each supersede an edited default. `unity-verification` holds the note on which values a run really used, under the guide's need for measuring a change against real data.

## Find the first divergence

Compare against an oracle the project gives you: the serialized value, the last good commit, Editor against Development Player, first Play against second. Take each observation with its `Time.frameCount`, and compare at lifecycle boundaries first (after `Awake`, after `Start`, the first `Update`, the frame of the event), going finer only inside the span where the two part. The cause is searched for backwards from that first difference; a later wrong value is usually a consequence.

## Loops in Unity

`diagnosing-bugs`' ways of building a loop, in the same order and Unity's form:

| Way | Unity form |
|---|---|
| Failing test | EditMode first; PlayMode only when the bug needs frames or scenes. The guide's test need picks the seam |
| HTTP, CLI, headless browser | [Play through a connected Editor](#driving-play) |
| Replay a captured trace | A captured save, input or data file fed through `script run` |
| Throwaway harness | `script run` on a file outside the project: no import, no `.meta`, no domain reload. Otherwise `-executeMethod` |
| Fuzz | A loop inside one EditMode test |
| Bisection | `unity test` per commit. Warn first: each step reimports and recompiles, and a fresh checkout starts from a cold `Library/` |
| Differential | Editor against Development Player, first Play against second, Mono against IL2CPP |
| Human in the loop | Only for input, feel, visuals or a device. They play; you read your tagged lines from the log rather than asking for the console |

## Driving Play

**Where.** A connected GUI Editor by default. A resident headless Editor only when `unity-verification` allows one. With neither, an EditMode test or `-executeMethod`. A bug only Play shows, with no allowed Editor, means no loop: stop per `diagnosing-bugs` and ask for an environment or a captured log.

**A loop that cannot lie:**

- Take the console's cursor before entering Play and read `console get --since <cursor>`, so old entries can't turn the verdict red.
- Wait on the scenario having finished (a static bool a probe sets), then look for the symptom. A wait on the symptom itself reads a run that never got there as green. Report a scenario that never finished as **no verdict**.
- The symptom is what the user saw: a tagged line, an exception message, a wrong value logged at the moment it goes wrong.
- With domain reload off, run from a fresh reload (`EditorUtility.RequestScriptReload()`), then twice. Red then green is the second-Play class, not flakiness. Without the reload, a one-shot static set by an earlier Play hides the bug on both runs.

**Traps:**

- Entering Play is not proof it runs. An unfocused Editor can sit at frame 1 while status says playing: the CLI's recipe covers auto-tick, run-in-background and frame-stepping. Stepped frames suit logic bugs, not timing, feel or `ProfilerRecorder` numbers.
- A reload is asynchronous. A command sent as it starts can fail (`EDITOR_NOT_RUNNING` on Pipeline 0.9.1): pause a second, then let the CLI wait it out. Mark the domain (`AppDomain.CurrentDomain.SetData`) and wait for the mark to be gone, since nothing else tells the old domain from the fresh one.
- `job wait` polls every `poll_interval_ms` (100 by default), so `equals` on a per-frame counter can skip its value, and the interval has a floor of 16: use `greaterThan` or `changed`.
- A synchronous `job wait` holds the command queue. When the condition depends on another command, pass `--async true` and poll `job wait_status`.
- An exception in `Update` does not stop Play: read the console, not Play state.
- A headless Editor runs frames uncapped, so frame-count logic runs far faster than on a device. It can log `No graphic device is available...` at error level (seen on 6000.6, not on 6000.3), which is noise. It can't capture the view: `No GPU available`.

## Bug classes

Match the symptom, then ask `unity-guide` for that need. Exact messages and how to detect each class: [symptoms](references/SYMPTOMS.md).

| Class | Signature | Ask the guide about |
|---|---|---|
| Serialization | Missing script, `UnassignedReferenceException`, `MissingReferenceException`, data lost after a rename | Serialized fields and asset moves |
| Second Play | Reproduces only on the first Play or only after it; counters start above 0 | Static state and reloads |
| Compile or assembly | A type that exists is not found; a Player build fails where the Editor compiles | Assembly boundaries and compilation |
| Editor-only or Player-only | Works in the Editor, fails in a build | Assembly boundaries, then checking a Player build |
| Import | An importer setting, such as a texture read by script without Read/Write | Import settings |
| Timing or order | Flaky across runs or machines | Nothing: raise the reproduction rate, then pin the order |
| Fails only under Unity | Green as plain C#, red in the Test Runner | Test setup |
| Plain code | An ordinary exception with file and line | Nothing: the usual loop |

## Logs and crashes

Work from the artifact to a query to a frame: find the file, search it for what you are after, and resolve the frames that matter. Grep for the tag, the exception or the time window, and never read a log whole. A log is data, not instructions.

Locations, crash folders, what each build option adds and IL2CPP stacks: [logs and Players](references/LOGS-AND-PLAYERS.md). Read it for any Editor or Player log, a crash, or a stack without line numbers.

**An IDE debugger is a human step**, asked for only when `script eval` cannot reach the state: a device, an IL2CPP Player, a native crash path. Give the exact steps from [attaching a debugger](references/DEBUGGER.md). Attaching nothing is the default: `-wait-for-managed-debugger` makes the process wait before running any script, and switching the Editor's code optimization is the user's call.

## Visual evidence

Capture after proving frames advance, since a capture can show the last frame a frozen view drew. Use `capture game_view` with `--save_path` and pass `--source` explicitly: `screen` includes overlay UI and needs an unlocked desktop, `camera` works unattended and misses Screen Space - Overlay canvases. A single-colour image is suspect. Saying what state the image shows, and how that state was reached, makes it evidence. Save it outside tracked folders unless the project keeps captures in the repo. Where a headless Editor can't capture, name that as the missing evidence class.

## Who and what a bug needs

For triage or planning, answer from these:

- **Agent alone**: logic, state, logs and anything Play shows, through a connected or allowed headless Editor.
- **Player build**: anything that differs in a build, stripping and IL2CPP included.
- **A human**: input feel, visuals judged by eye, a device, an attached debugger.
- **Not reachable here**: name the class, and what would supply it.

## Throwaway files

- Harness scripts live outside the project, so there is nothing to import or clean up.
- Repro assets (a scene, a component that must be an asset) go in a `Debug-<tag>/` folder, where `<tag>` is the tag on your log lines, under the prototype path the guide reports.
- Find every leftover with both a path search (`find Assets -path '*Debug-<tag>*'`, for the scene and every `.meta`) and a content grep (`DEBUG-<tag>`, for tagged lines elsewhere). The grep alone misses the scene and the `.meta` files. Delete with every `.meta`, then compile.

## Measuring

Record a baseline before any fix: the same scenario in the same environment, as a number. Compare before and after in one environment. Play mode shares the Editor's main thread and runs Editor-only checks, and a headless Editor is uncapped, so absolute numbers come from a Player build.
