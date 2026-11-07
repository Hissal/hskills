# Unity code-lifecycle rules

Keeping statics, singletons, static events and load-time code correct across Play sessions and code reloads. Test cleanup belongs to `unity-testing`, and running the checks to `unity-verification`, both through the guide's table. Evidence and tested versions: `research/unity-assemblies.md` section 8 in the `Hissal/skill-collection` GitHub repo.

Claims carry one of three labels. **Documented** means Unity's docs state it. **Observed** means it ran on the named versions, and a later version may differ. **Inference** follows from the two. An unlabelled rule is this guide's choice.

Load only the sections the need reaches.

- [Stance](#stance)
- [Picking the API](#picking-the-api)
- [Transition checks](#transition-checks)
- [Reset rules](#reset-rules)
- [Generator traps](#generator-traps)
- [Which callback for what](#which-callback-for-what)
- [Load-code hazards](#load-code-hazards)
- [The lifecycle attributes](#the-lifecycle-attributes)
- [What fires on a Play session](#what-fires-on-a-play-session)
- [Observed orders](#observed-orders)
- [Before 6.5](#before-65)
- [Reviews, blast radius and migrations](#reviews-blast-radius-and-migrations)
- [Validation](#validation)

## Stance

Build as if domain reload is off, whatever the project's Enter Play Mode setting. Every new or changed static has a reset path or a deliberate opt-out, with reload on too. There is no project setting that waives this.

**Documented:** with domain reload off, statics keep their values and static events keep their subscribers between Play sessions, and static constructors do not run again. The default is reload on through 6.5 and off from 6.6, and Unity's reason for off is the CoreCLR runtime, which has no domain reload. A project that keeps reload on today still gets a second-Play bug the day the setting changes.

With scene reload also off, scene objects are not recreated, so their non-serialized fields persist too.

## Picking the API

1. **Version.** Read `ProjectSettings/ProjectVersion.txt`; a UPM package uses the minimum in its `package.json` `unity` field. 6.5 or later has the lifecycle attributes and `[AutoStaticsCleanup]`. Earlier versions use [the fallback](#before-65), and so does a package whose minimum is below 6.5. A dual path under `#if UNITY_6000_5_OR_NEWER` only when the user asks.
2. **The module's pattern.** Match what the file or module you are touching already does. A file that resets by hand in `SubsystemRegistration` takes the new static in that same method. The newer attributes go into new code with no local precedent. Leave existing code on its API, and mention the newer one at most once.
3. **Old to new, by what fires each Play session.** A `SubsystemRegistration` reset maps to `[OnEnteringPlayMode]` or `[AutoStaticsCleanup]`. Unity's 6.6 page says "For new code, use OnCodeInitializingAttribute instead", a mapping by load timing, but `[OnCodeInitializing]` does not fire on a Play entry with reload off (observed: [What fires](#what-fires-on-a-play-session)), so moving a reset there brings the second-Play bug back. Code that needs a specific load point keeps its `RuntimeInitializeOnLoadMethod` load type.

## Transition checks

Find what the change touches and check only that row's transitions. A check on a lifetime the change does not touch is noise: leave it out of the reply and the review.

| The change touches | Check |
|---|---|
| A static field or property | **Repeated Play sessions:** the second Play starts from the same value as the first. **Static cleanup:** it has a reset path or a deliberate opt-out |
| A static event, or a subscription to one | **Repeated Play sessions:** last session's subscribers are gone. **Event subscriptions:** each subscriber removes itself when it dies, or the event is reset |
| A MonoBehaviour singleton | **Repeated Play sessions:** the instance field is cleared on Play entry. **Destruction:** see [the fake-null rule](#static-events-and-singletons) |
| Code that runs on load | **Reload settings:** where it runs with reload on and off. **Import workers:** it runs there too, so name them in the answer. The rest of [Load-code hazards](#load-code-hazards) |
| Code that runs on entering or leaving Play mode | **Reload settings:** it fires with both ([What fires](#what-fires-on-a-play-session)). Its order against what it reads ([Observed orders](#observed-orders)) |
| An object that dies or a scene that unloads while something holds it | **Destruction and unload:** the holder lets go in `OnDisable` or `OnDestroy` |
| An object returned to a pool and reused | **Pooled reuse:** see [Pooled reuse](#pooled-reuse) |

### Static events and singletons

- **Static event:** reset to `null` on entering Play mode: `[AutoStaticsCleanup]` on the event, or the fallback assigning `null`. Instance subscribers also unsubscribe in `OnDisable`, since the reset only helps across sessions.
- **MonoBehaviour singleton:** clear the static instance field on entering Play mode.

**Observed** on 6000.3.20f1, 6000.5.11f1, 6000.6.5f1 and 6000.7.0b2, reload off:

- After exit the instance field still holds the destroyed object: `== null` is true, but `is null` is false and `??` returns the destroyed object. Use `== null` on a Unity object.
- A subscriber destroyed without unsubscribing stays on a static event, and raising the event still runs its handler, where `this == null` is true. Touching `transform` throws `MissingReferenceException` in the Editor and `NullReferenceException` in a Windows player.
- The next Play session starts with that dead subscriber still on the event, so the handler count grows by one each session.

### Pooled reuse

**Observed** on 6000.3.20f1, 6000.5.11f1, 6000.6.5f1 and 6000.7.0b2, Editor and Windows player: reactivating an object runs `OnDisable` and `OnEnable` each cycle, while `Awake` and `Start` run once. Fields keep their values, and a coroutine running at deactivation does not resume.

So reset per-use state where the pool hands the object out or in `OnEnable`, subscribe in `OnEnable` and unsubscribe in `OnDisable`, and restart coroutines on reuse.

## Reset rules

For 6.5 and later.

- **`[AutoStaticsCleanup]` on the member** is the default for a static field, property or event that should return to its initializer. **Documented:** the initializer runs again (`= new()` builds a fresh instance), a member with no initializer gets `default`, and a `static readonly` collection or any type with a parameterless `Clear()` keeps its instance and gets `Clear()`. It needs no per-assembly opt-in.
- **`[OnEnteringPlayMode]`** on a static method is for what the generator cannot do: a reset that needs a method call, setup in a static constructor (the generator never re-runs one), and real work on the transition. It also runs once at Player startup. `[OnExitingPlayMode]` only for state nothing touches in Edit mode, because code running in Edit mode can dirty statics after exit.
- **One mechanism per static.** The reset is itself a lifecycle callback, so its place among other callbacks on the same transition is an observation, not a documented order.
- **Field-level by default.** `[AutoStaticsCleanup]` on the type only when every static in it is session state.
- **Deliberate persistence:** a static meant to survive Play sessions (a reflection cache, a lookup table) gets `[NoAutoStaticsCleanup]` on purpose, even where nothing else resets it, so the next reader and the text check see the choice. On a type-level `[AutoStaticsCleanup]`, it keeps that one member.

## Generator traps

**Observed** on 6000.5.11f1, 6000.6.5f1 and 6000.7.0b2, except where a line names another version.

- **A `static readonly` field whose type has no `Clear()`** resets in `[OnEnteringPlayMode]`, never under `[AutoStaticsCleanup]`. Under the attribute the generator throws, the compile passes with only warning `CS8785`, and the generator emits nothing for that whole assembly: every other `[AutoStaticsCleanup]` in it silently stops resetting. Another assembly's cleanup is unaffected.
- **`CS8785` shows only in the log of the run that compiled that assembly.** A later run with no recompile does not repeat it. `unity recompile --json` reported `compilationFailed: false` and no warnings for it (observed on 6000.6.2f1, not rechecked).
- **The declaring type is `partial`, always.** A lifecycle callback in a non-`partial` type fails with `UAC0031`, and `[AutoStaticsCleanup]` in one fails with `CS0260`. The 6.7 Manual also documents `UAL0012` for this when the analyzer is on; 6000.7.0b2 gave `CS0260`.
- **The initializer of a `static readonly` collection** must be omitted, `new()`, or the exact declared type (documented).
- **The attribute takes no arguments:** there is no enter-only or exit-only form. It reset on both entering and exiting Play mode, where the Manual says entering and the API page says entering or exiting.
- **The analyzer's default differs by version.** On 6.5 and 6.6 it is off (documented). On 6.7 it is on while domain reload is disabled (documented), and 6000.7.0b2 emitted `UAL0010` and `UAL0013` with no `.globalconfig`. `<asmdefName>.globalconfig` beside the asmdef overrides it per assembly with `build_property.UnityEnableAutoStaticsCleanupAnalysis`, and `build_property.UnityEnableAutoStaticsCleanupCodeGen` turns generation off (documented). Leave the analyzer and any `.globalconfig` as the repo has them, and mention the analyzer at most once, as an option.
- **`UAL0014`**, a static constructor next to cleaned members, is documented but did not appear on any of the three versions, with analysis enabled by `.globalconfig` after a second compile. So the static constructor rule rests on the docs: the generator never re-runs one.

## Which callback for what

For 6.5 and later.

- **Per-session state:** `[AutoStaticsCleanup]` for a plain reset, `[OnEnteringPlayMode]` for one that needs a method call.
- **Once per code load** (a registry built from types, a reflection cache): `[OnCodeInitializing]`. The setup must be safe to run again and hold across sessions, since it runs at Editor startup, after each recompile, on each Play entry with reload on, and at Player startup, and never on a Play entry with reload off. Import workers run it too. Use it rather than `[OnCodeLoaded]`, which runs before the engine is ready in a player: `Time.frameCount` read there crashed the Windows player, exit 139 (observed on 6000.5.11f1, 6000.6.5f1 and 6000.7.0b2).
- **The static that load code fills gets `[NoAutoStaticsCleanup]`.** The reset runs after `[OnCodeInitializing]` on every Play entry and at Player startup, so a cleaned static filled there is already empty when Play mode code reads it (observed on 6000.5.11f1, 6000.6.5f1 and 6000.7.0b2, reload on and off).

## Load-code hazards

- **Import workers run it too.** Asset import worker processes load the project's code and run `[OnCodeLoaded]`, `[OnCodeInitializing]`, `[InitializeOnLoad]` and `[InitializeOnLoadMethod]` (observed on 6000.5.11f1, 6000.6.5f1 and 6000.7.0b2; the two older attributes also on 6000.3.20f1), so a side effect there, such as a file write, a socket or a server, runs in several processes. Keep load code free of side effects, or skip them where `AssetDatabase.IsAssetImportWorkerProcess()` is true.
- **`[InitializeOnLoad]` runs before asset import completes**, so an asset load there can return null (documented). Asset work after a reload goes in `AssetPostprocessor.OnPostprocessAllAssets`.
- **Load callbacks are not Play callbacks.** The `OnCode*` attributes, `[InitializeOnLoad]`, `[InitializeOnLoadMethod]` and `AssemblyReloadEvents` fire only when code actually reloads, so with reload off they reset nothing between Play sessions.

## The lifecycle attributes

**Documented**, 6.5 and later; each goes on a static, parameterless, `void` method.

| Attribute | Namespace | Fires | Older API it replaces |
|---|---|---|---|
| `[OnCodeLoaded]` | `Unity.Scripting.LifecycleManagement` | After assemblies load: initial load (Editor and Player), and after each code reload (Editor) | None |
| `[OnCodeInitializing]` | `Unity.Scripting.LifecycleManagement` | After managed objects are deserialized, before `Awake`/`OnEnable`; on initial load, before the first scene loads | `[InitializeOnLoad]`, `[InitializeOnLoadMethod]` |
| `[OnCodeDeinitializing]` | `Unity.Scripting.LifecycleManagement` | Before managed objects are serialized for a code reload | None |
| `[OnCodeUnloading]` | `Unity.Scripting.LifecycleManagement` | Before assemblies unload for a code reload, and on shutdown | `AssemblyReloadEvents.beforeAssemblyReload` |
| `[OnEnteringPlayMode]` | `UnityEngine` | Entering Play mode, after a code reload in Play mode, and at Player startup | `PlayModeStateChange.EnteredPlayMode`; timing of `[InitializeOnEnterPlayMode]`; `SubsystemRegistration` as a per-Play reset |
| `[OnExitingPlayMode]` | `UnityEngine` | Exiting Play mode, before a code reload in Play mode, and before Player quit | `PlayModeStateChange.ExitingPlayMode` |
| `[OnEnteringEditMode]` | `UnityEditor.Scripting.LifecycleManagement` | Returning to Edit mode, and after a code reload in Edit mode | `PlayModeStateChange.EnteredEditMode` |
| `[OnExitingEditMode]` | `UnityEditor.Scripting.LifecycleManagement` | Before entering Play mode, and before a code reload in Edit mode | `PlayModeStateChange.ExitingEditMode` |

The Play mode pair lives in `UnityEngine`, so runtime scripts use it without `#if UNITY_EDITOR`, and it runs in players too. The Edit mode pair is Editor-only.

## What fires on a Play session

**Observed** on 6000.5.11f1, 6000.6.5f1 and 6000.7.0b2. The older APIs in this table were also observed on 6000.3.20f1.

| Fires on every Play entry, reload on or off | Fires only when code actually reloads |
|---|---|
| `[OnExitingEditMode]`, `[OnEnteringPlayMode]`, `[OnExitingPlayMode]`, `[OnEnteringEditMode]`, the `[AutoStaticsCleanup]` reset, `[InitializeOnEnterPlayMode]`, every `RuntimeInitializeOnLoadMethod` load type | `[OnCodeLoaded]`, `[OnCodeInitializing]`, `[OnCodeDeinitializing]`, `[OnCodeUnloading]`, `[InitializeOnLoad]`, `[InitializeOnLoadMethod]`, `AssemblyReloadEvents` |

Exiting Play mode never reloads code, with either setting.

## Observed orders

Run with a batch-mode Editor (`-batchmode -nographics`) on Windows with Mono, and a scene object carrying the probe. Unity documents none of these sequences as a guarantee, and the reset's place among callbacks on the same transition is observation only. Not run: a code reload during Play mode, IL2CPP, other platforms.

**Entering Play mode, reload off** (6000.5.11f1, 6000.6.5f1 and 6000.7.0b2; scene reload on or off gave the same order, and `Awake` and `OnEnable` ran each Play in both):

1. `[OnExitingEditMode]`, `playModeStateChanged(ExitingEditMode)`, `[InitializeOnEnterPlayMode]`
2. The `[AutoStaticsCleanup]` reset, the first with `Application.isPlaying` true
3. `[OnEnteringPlayMode]`
4. `SubsystemRegistration`, `AfterAssembliesLoaded`, `BeforeSplashScreen`, `BeforeSceneLoad`, `Awake`, `OnEnable`, `AfterSceneLoad`, `Start`, `playModeStateChanged(EnteredPlayMode)`

**Entering Play mode, reload on** adds a code reload after `playModeStateChanged(ExitingEditMode)`, with `[InitializeOnEnterPlayMode]` inside it, and steps 2 to 4 follow unchanged. The reset therefore clears what `[OnCodeInitializing]` just set up.

- 6000.6.5f1 and 6000.7.0b2: `beforeAssemblyReload`, `[OnCodeDeinitializing]`, `[OnCodeUnloading]`, `[InitializeOnLoad]`, `[OnCodeLoaded]`, `[InitializeOnEnterPlayMode]`, `[OnCodeInitializing]`, `[InitializeOnLoadMethod]`, `afterAssemblyReload`.
- 6000.5.11f1: the same, with `[OnCodeInitializing]` before `[InitializeOnEnterPlayMode]`. Code that needs one to run before the other breaks across these versions.

**Exiting Play mode** (6000.5.11f1, 6000.6.5f1 and 6000.7.0b2, either setting): `playModeStateChanged(ExitingPlayMode)`, `OnApplicationQuit`, `OnDisable`, `OnDestroy`, `[OnExitingPlayMode]`, the reset, `[OnEnteringEditMode]`, `playModeStateChanged(EnteredEditMode)`. Scene objects are already gone when `[OnExitingPlayMode]` runs.

**Windows release player, startup to quit** (6000.5.11f1, 6000.6.5f1 and 6000.7.0b2, `BuildOptions.None`, Mono): `[OnCodeLoaded]`, `[OnCodeInitializing]`, the reset, `[OnEnteringPlayMode]`, `SubsystemRegistration`, `AfterAssembliesLoaded`, `BeforeSplashScreen`, `BeforeSceneLoad`, `Awake`, `OnEnable`, `AfterSceneLoad`, `Start`. On `Application.Quit`: `OnApplicationQuit`, `OnDisable`, `OnDestroy`, `[OnExitingPlayMode]`, the reset, `[OnCodeDeinitializing]`, `[OnCodeUnloading]`.

**Editor startup** (6000.5.11f1, 6000.6.5f1 and 6000.7.0b2): `[InitializeOnLoad]`, `[OnCodeLoaded]`, `[OnCodeInitializing]`, `[InitializeOnLoadMethod]`, `afterAssemblyReload`, `[OnEnteringEditMode]`. It runs no reset.

**A recompile in Edit mode** (6000.5.11f1, 6000.6.5f1 and 6000.7.0b2): `beforeAssemblyReload`, `[OnExitingEditMode]`, `[OnCodeDeinitializing]`, `[OnCodeUnloading]`, then the Editor startup order. It runs no reset.

**Before 6.5** (6000.3.20f1), the older APIs keep the same relative order on each of these transitions: Play entry, exit, Editor startup, and a recompile.

## Before 6.5

| Need | Before 6.5 |
|---|---|
| Reset runtime statics on each Play entry | `[RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]` |
| Reset Editor statics on each Play entry | `[InitializeOnEnterPlayMode]`, Editor-only, optionally taking `EnterPlayModeOptions` |
| Run Editor code on load and after each recompile | `[InitializeOnLoad]` static constructor, `[InitializeOnLoadMethod]` |
| Run Editor code before a code reload | `AssemblyReloadEvents.beforeAssemblyReload` |
| React to Play and Edit mode changes in Editor code | `EditorApplication.playModeStateChanged` |

A fallback reset assigns every static back by hand, event fields included (`= null`). None of these is obsolete in 6.6 (documented), so a package with a minimum below 6.5 uses them throughout.

## Reviews, blast radius and migrations

- **`code-review`:** apply the text check under [Validation](#validation) to the diff. A diff cannot show a second Play session: say so in the Spec answer when the change depends on one.
- **`blast-radius`:** statics, static events and load callbacks reach callers no signature shows. Search for readers of the changed static, subscribers of the changed event, and code that assumes a fresh domain, such as a one-shot flag or a lazy `??=`.
- **`migrating`:** a Unity upgrade can turn reload off, since the default changed at 6.6, and CoreCLR removes it. Run the text check over the statics the migration reaches, and read the project's actual setting rather than the version's default.
- **`architecture-review`:** singletons and static events are friction signals, as global state a caller cannot see in a signature or swap in a test. Report where they are and how they reset; keeping or removing them is the user's call.

## Validation

Running these belongs to `unity-verification`, through the guide's table.

- **Text check**, on every new or changed static in the diff (fields, properties, events, singleton instance fields): each has a reset path (`[AutoStaticsCleanup]`, a callback or the fallback) or a deliberate `[NoAutoStaticsCleanup]`. Every type carrying a lifecycle attribute or `[AutoStaticsCleanup]` is `partial`.
- **Compile:** after adding `[AutoStaticsCleanup]`, grep the Editor log for `CS8785`, per [Generator traps](#generator-traps).
- **Runtime**, when the change alters cleanup or state that persists between Play sessions: check that state across two Play sessions, through PlayMode tests that cover it, else `unity-debugging`'s Play loop. Nothing unrelated to the changed state runs. When neither can run, report the change as unvalidated: not checked across two Play sessions.
