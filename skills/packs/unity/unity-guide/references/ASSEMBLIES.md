# Assembly rules

Which assembly each script compiles into, what it can see, where it ships and when it compiles. For `.meta` identity and script renames, test assembly templates, statics and reloads, or how to run a compile or build, look up that need in the guide's needs table.

- [Project fields](#project-fields)
- [Trace before assessing](#trace-before-assessing)
- [List the assemblies](#list-the-assemblies)
- [Assembly boundaries](#assembly-boundaries)
- [Traps](#traps)
- [Editor and runtime code](#editor-and-runtime-code)
- [References and GUIDs](#references-and-guids)
- [Defines](#defines)
- [Recompiling](#recompiling)
- [Naming and language](#naming-and-language)
- [Answers for callers](#answers-for-callers)
- [File formats](#file-formats)
- [Analyzers and source generators](#analyzers-and-source-generators)

Lines marked *observed* were seen on Unity 6000.6.2f1. The rest comes from Unity's docs and source.

## Project fields

This reference owns the **Assemblies** section of `docs/agents/unity.md`.

| Field | Holds | When unset |
|---|---|---|
| **Naming convention** | The scheme a new assembly's name follows | Reverse-DNS, matching the existing asmdefs |
| **Project-wide defines** | Where the repo keeps project-wide symbols: `csc.rsp`, Player Settings or build profiles | Whichever of those already holds symbols |

## Trace before assessing

Assess a change only after tracing every script and asmdef it touches. Say the trace in the answer.

1. **List.** Run [the listing](#list-the-assemblies) first, on a small project too: it resolves every GUID and marks what a hand read of the asmdefs misses. Its lines feed the steps below.
2. **Ownership.** Walk up from the script to the nearest `.asmdef` or `.asmref`; that names its assembly. With neither, the folder names decide the predefined assembly: `Assembly-CSharp`, `Assembly-CSharp-Editor` in an `Editor` folder, `-firstpass` variants under `Plugins`. In a package, a script with neither compiles into nothing, and only the Editor log says so (*observed*).
3. **References.** From the listing, name what the owner references and what references the owner.
4. **Inclusion.** For the owner and each reference, read `includePlatforms`, `excludePlatforms`, `defineConstraints` and any test-runner references, and say which of the Editor and the Player compile each one.
5. **Defines.** Name every symbol gating the changed code: `#if` blocks, `defineConstraints`, `versionDefines` and project-wide symbols.
6. **Compilation effects.** Name what recompiles (the changed assemblies and their dependents) and the check the change needs:
   - A compile after any asmdef, reference or define change.
   - A Player build when the change touches the Editor/runtime split or defines. An Editor compile proves nothing about the Player, so without a build say the Player side is unvalidated.

The trace is done when the listing has run, each touched file has a named owner backed by the file that decides it, and each owner has a stated Editor and Player inclusion.

## List the assemblies

For the mechanics of inspecting a running project, use official tooling: an open Editor's Inspector shows a selected script's assembly, and `CompilationPipeline` lists them. Build no mapping of your own on top.

In a checkout, list every assembly with [the listing script](../scripts/asmdefs.sh), which needs bash and grep. Run `bash <this skill's folder>/scripts/asmdefs.sh --help` first and treat the script as a black box, then run it on the project or package root. Its `?` marks a reference that resolves to nothing, and `no-meta` an asmdef without its `.meta`. When `--help` prints nothing, bash cannot run in this shell, as in Codex's Windows sandbox: say so, skip the script and its source, and read each `.asmdef` and the `guid:` line of its `.meta` instead.

## Assembly boundaries

Add or change an assembly whenever the task would benefit: faster iteration, testable code leaving `Assembly-CSharp`, an Editor folder needing its own assembly, a tangle to undo. Existing structure is context, and a single assembly is never a goal in itself.

Before writing, work out:

- the folder and assembly name, following the naming convention;
- the affected code: every `Assembly-CSharp` type the moved code uses, since each must move too or be inverted, and the code that uses what moves;
- the assemblies that will reference the new one, and those it references.

Then make the change, compile, and tell the user what it made and why, with the points above. A script added to an existing folder joins its neighbours' assembly.

## Traps

- **Asmdef code never sees `Assembly-CSharp`.** A reference to it is dropped without a warning, `autoReferenced: false` included, and the code fails to compile (*observed*). The other way round, predefined assemblies see only asmdefs with `autoReferenced: true`.
- **An asmdef swallows nested `Editor` folders.** Under an asmdef, an `Editor` folder is an ordinary folder: its scripts join the runtime assembly, compile in the Editor and fail the Player build at the first `UnityEditor` call. The `using` line alone passes (*observed*).
- **A runtime asmdef referencing an Editor-only one passes the Editor compile and fails the Player build.** The Editor-only assembly is not compiled for Player targets, so the use site fails there, with CS0234 "are you missing an assembly reference?" where the parent namespace is visible (*observed*).
- **Test assemblies never ship.** An assembly referencing the test runner with `UNITY_INCLUDE_TESTS` in its `defineConstraints` stays out of normal builds, so production code placed there vanishes from the Player (*observed*). Test assemblies hold tests only.
- **Cycles are compile errors.** Move the shared types into one assembly, or split them into a third both reference. Only the console names the cycle ("cyclic dependencies detected between assemblies"), not the compile errors (*observed*).
- **A type that exists but "could not be found"** (CS0246, CS0234, CS0103) usually means a missing reference, not a missing type. Find the type's assembly and check whether this one lists it.
- **A reference that resolves to nothing is dropped silently**, with no error or warning: a typo'd name or stale GUID fails only where code uses a type from it (*observed*).
- **`defineConstraints` that fail remove the assembly entirely**: its source is never compiled, so broken code in it raises nothing (*observed*).
- **An unreferenced asmdef still ships.** `autoReferenced` and being referenced have no bearing on whether a runtime assembly reaches the build (*observed*).

## Editor and runtime code

Match the module's existing pattern. With no precedent:

- A few Editor-only lines in a runtime file: wrap them and their `using UnityEditor` in `#if UNITY_EDITOR`.
- Whole Editor files: an `Editor` folder. When a parent folder has an asmdef, that folder gets its own asmdef with `"includePlatforms": ["Editor"]`, or an asmref to an existing Editor-only assembly.

References point from Editor to runtime. When runtime code needs something from an Editor-only assembly, move the type into a runtime assembly or invert the call so the Editor side supplies it.

## References and GUIDs

- Write references as `"GUID:<guid>"`. Where the asmdef being edited already uses names, match the file. GUID references survive a rename; name references do not.
- A new `.asmdef` or `.asmref` gets a hand-written `.meta` with a fresh GUID ([template](#meta-for-a-new-asmdef-or-asmref)), so it can be referenced with no import round trip (*observed*). Every other new asset keeps the `.meta` Unity generates.
- Unity deletes a `.meta` whose asset is missing when it refreshes (*observed*). So write both files in one command, `.meta` first; re-read the `.meta`; if its GUID changed, adopt Unity's; only then write references to it.
- Registry and git packages live only in `Library/PackageCache/`, so a checkout never opened in Unity cannot resolve references into them. Treat those `?` marks as unknown, not broken.

## Defines

- **Optional-package integration**: give it its own asmdef with a `versionDefines` entry defining a symbol when the package is installed, and name that symbol in `defineConstraints`. The assembly compiles with the package and disappears without it (*observed*), with no project-wide symbol.
- **Project-wide symbols**: add one only when the user asks, in the location the **Project-wide defines** field names. Set symbols and build in separate steps: a symbol set from script reaches the compile only after the Editor regains control and recompiles, and batch mode never recompiles for new symbols, so a headless run takes them from `csc.rsp` or the saved settings at startup.

## Recompiling

Unity recompiles on an Asset Database refresh after a `.cs`, `.asmdef`, `.asmref`, `.rsp` or DLL change, after a define symbol change, and after switching the build target. A GUI Editor refreshes when it regains focus (with the default Auto Refresh), so files written from outside can sit uncompiled while it idles. Get a finished compile before trusting any result after such a change.

Only changed assemblies and their dependents recompile: that is what an asmdef buys.

## Naming and language

- One MonoBehaviour or ScriptableObject per file, the file named exactly like the class, one namespace per file. Mismatches give warnings or an unusable component.
- C# 9 on Roslyn, without init-only setters, covariant returns or module initializers. Records need a hand-declared `IsExternalInit` and are never serialized.

## Answers for callers

Use the entry for the caller's need, with only what the change touches.

- **`code-review`.** *Standards:* every reference resolves; no cycle among changed assemblies; no runtime asmdef references an `"includePlatforms": ["Editor"]` one; every `Editor` folder under an asmdef has its own Editor-only asmdef or asmref; every `using UnityEditor` in a runtime assembly sits inside `#if UNITY_EDITOR`; no production code in a test assembly; no `no-meta` on a new asmdef. *Failure:* [Traps](#traps). *Spec:* a diff cannot show that a Player build compiles, what a define resolves to on another target, or the contents of `Library/PackageCache/`.
- **`blast-radius`.** Dependents from the listing. Changing an assembly's `name` drops every name reference to it silently, while GUID references survive, and stops any `InternalsVisibleTo` string naming it from matching. Grep for both, `.asmref` files included. `[SerializeReference]` data stores the assembly name, so that data is at risk too: look up the serialization need in the guide's table. A platform, constraint or `autoReferenced` change reaches every dependent. Moving a script between assemblies changes what it can see, and which `internal` members it reaches.
- **`migrating`.** Moving a type to another assembly first traces the types it uses, as in [Assembly boundaries](#assembly-boundaries). What keeps its serialized data through the move is the serialization need in the guide's table.
- **`refactoring`.** Hazards: the `name` change above; renaming the `.asmdef` file leaves `name` unchanged; a class rename also renames its file. Validate with a compile, and a Player build when the Editor/runtime split moved.
- **`codebase-design`.** An assembly boundary is a seam with its own rules: `internal` stays inside the assembly, `[assembly: InternalsVisibleTo("<asmdef name>")]` in an `AssemblyInfo.cs` beside the asmdef opens it to one named assembly (*observed*), and references run one way. Deepening a module across a boundary changes references, so trace it as in [Assembly boundaries](#assembly-boundaries).
- **`architecture-review`.** *Declared modules:* list them with [the listing](#list-the-assemblies). *Friction signals:* gameplay in `Assembly-CSharp`, or several feature folders under one asmdef, so `internal` hides nothing between features; assemblies referencing nearly everything; near-cycles worked around with interfaces or events; Editor-only references from runtime code; one feature's types spread over many assemblies; a split forcing `public` on what should be `internal`.
- **`to-tickets`.** An asmdef's reference list and a split moving many files are surfaces two workers cannot change in parallel, so slice them on their own and first. Renaming an assembly used by name, or consumed outside this repo, needs expand-contract: move consumers to GUID references before the rename.

## File formats

### `.asmdef`

Plain JSON. Unity reads a missing field as its default, so a hand-written file holds only the fields that differ; match the shape of the repo's other asmdefs.

| Field | Default | Effect | Gotcha |
|---|---|---|---|
| `name` | required | The compiled assembly's name, unique in the project. | Name references and `InternalsVisibleTo` use it. |
| `rootNamespace` | empty | The namespace IDEs put in new scripts. | No effect at compile time. |
| `references` | `[]` | Assemblies this one may use, as `"GUID:<guid>"` or a name. | |
| `includePlatforms`, `excludePlatforms` | `[]` | Where it compiles. `["Editor"]` makes it Editor-only. | Only one may be non-empty, and only platforms with installed build support are valid. |
| `allowUnsafeCode` | `false` | Allows `unsafe` code. | |
| `autoReferenced` | `true` | Whether predefined assemblies see this one. | Never lets this one see `Assembly-CSharp`. |
| `overrideReferences` | `false` | When true, only `precompiledReferences` DLLs are referenced, instead of every precompiled DLL. | Test assemblies set it to list `nunit.framework.dll`. |
| `precompiledReferences` | `[]` | DLL file names, with extension. | Read only when `overrideReferences` is true. |
| `defineConstraints` | `[]` | Symbols that must all hold for the assembly to compile or be referenced. | Evaluated against the active build target. |
| `versionDefines` | `[]` | Symbols defined inside this assembly when a package, module or Unity version matches. | |
| `noEngineReferences` | `false` | Leaves out `UnityEngine` and `UnityEditor`. | |

Legacy `"optionalUnityReferences": ["TestAssemblies"]` still loads as a test assembly. Write new test assemblies explicitly.

### `.asmref`

Adds its folder, and subfolders without their own asmdef or asmref, to an existing assembly:

```json
{
  "reference": "GUID:0123456789abcdef0123456789abcdef"
}
```

### `.meta` for a new `.asmdef` or `.asmref`

```yaml
fileFormatVersion: 2
guid: 0123456789abcdef0123456789abcdef
AssemblyDefinitionImporter:
  externalObjects: {}
  userData: 
  assetBundleName: 
  assetBundleVariant: 
```

`guid` is 32 fresh lowercase hex characters, such as a UUID without dashes. An `.asmref` uses `AssemblyDefinitionReferenceImporter:` in place of `AssemblyDefinitionImporter:`.

### `versionDefines`

```json
"versionDefines": [
  { "name": "com.unity.inputsystem", "expression": "1.0.0", "define": "HAS_INPUT_SYSTEM" }
]
```

`name` is a package name, a module name, or `Unity` for the Editor version. `expression` has no spaces or wildcards: `1.0.0` means that version or later, `[1.3,3.4.1]` includes both ends, `(1.3.0,3.4)` excludes both, `[1.1,3.4)` includes only the first, and `[2.4.5]` means exactly that. For `Unity`, write versions such as `[6000.0,6000.2)`.

### `defineConstraints`

```json
"defineConstraints": ["HAS_INPUT_SYSTEM", "!UNITY_WEBGL", "UNITY_EDITOR || DEVELOPMENT_BUILD"]
```

Entries are ANDed. `!` negates, and `||` inside one entry means either. Built-in symbols, project symbols and this assembly's own `versionDefines` all count. An invalid entry fails with "Invalid Define Constraint".

### Project-wide symbol scopes

Three scopes add up:

- `Assets/csc.rsp` with `-define:A;B`: every assembly, Editor and Player, in every build profile. Takes effect after a recompile (reimport or touch one script).
- Player Settings, Scripting Define Symbols: per platform. Applying recompiles.
- A build profile's define list: per profile.

From script, `PlayerSettings.SetScriptingDefineSymbols` sets the Player Settings scope, and `BuildPlayerOptions.extraScriptingDefines` adds symbols to one Player build.

## Analyzers and source generators

From the 6.0 and 6.6 manuals, not reproduced in a sandbox: when a setup behaves differently, trust the compile output and say the docs did not match.

Both ship as a managed plugin DLL built against .NET Standard 2.0 and `Microsoft.CodeAnalysis.CSharp` 4.3. In its Plugin Inspector, every platform is unchecked. It carries the exact, case-sensitive asset label `RoslynAnalyzer`, without which it is an ordinary plugin.

| Where the DLL sits | Assemblies it runs on |
|---|---|
| Under `Assets/` with no asmdef above it | Every predefined assembly |
| Inside an asmdef's folder | That assembly and every assembly referencing it |

A generator emitting the same public type into several assemblies causes CS0436 wherever two copies are visible, so generated types stay `internal` or are named per assembly.

Rule sets: `Assets/Default.ruleset` covers every assembly, `Assets/<PredefinedAssemblyName>.ruleset` one predefined assembly, and a `.ruleset` beside an `.asmdef` that assembly.

Unity's own lifecycle analyzers and generator (6.5 and later), and `.globalconfig`, belong to the code lifecycle need in the guide's table.
