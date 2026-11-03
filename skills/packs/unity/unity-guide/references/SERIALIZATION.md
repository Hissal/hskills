# Unity serialization rules

Changing serialized data: trace what is saved, choose a compatible migration, check preservation after import. Evidence and tested versions: `research/unity-serialization.md` and `research/unity-merging.md` in the skill-collection repo. Unless a line names a version, it comes from the Unity 6.0 docs; "observed" means run on the named version. When a version gate matters, read the version the guide's docs lookup names.

Load only the sections the need reaches.

- [Project field](#project-field)
- [Trace, migrate, check](#trace-migrate-check)
- [Identity](#identity)
- [Blast radius](#blast-radius)
- [What serializes](#what-serializes)
- [Renames and moves](#renames-and-moves)
- [The reserialize follow-up](#the-reserialize-follow-up)
- [Old-save fixtures](#old-save-fixtures)
- [Prefabs](#prefabs)
- [UnityYAML and editing order](#unityyaml-and-editing-order)
- [Merge conflicts](#merge-conflicts)
- [Check after import](#check-after-import)
- [Reviewing serialized changes](#reviewing-serialized-changes)
- [Slicing work into tickets](#slicing-work-into-tickets)
- [Hotspot scans and friction](#hotspot-scans-and-friction)

## Project field

**Serialization**, in `docs/agents/unity.md`: the third-party serializer. Default: none. These rules cover Unity's own serializer. Fields a named serializer (Odin and similar) owns follow its rules and the conventions the file points at.

## Trace, migrate, check

1. **Trace.** Name what is saved under the old identity: the field or type names, the GUIDs, and every file and save holding them ([Blast radius](#blast-radius)).
2. **Migrate.** Choose the compatible move, in the same change as the rename or move ([Renames and moves](#renames-and-moves)).
3. **Check.** Read the values back after import ([Check after import](#check-after-import)). Done when each traced kind of file was read back, or the Unity-side checks are reported as **unvalidated**.

## Identity

- **The `.meta` GUID is the asset**, not its path. A reference to another file is stored as `{fileID, guid, type}`, so a moved or renamed asset keeps every reference as long as its `.meta` travels with it. Move, rename and delete an asset together with its `.meta` (a folder with its folder `.meta`), and commit `.meta` files. A lost or regenerated `.meta` means a new GUID, and every reference to the asset breaks silently.
- **Scripts are assets.** A component stores `m_Script: {fileID: 11500000, guid: <the script's .meta GUID>, type: 3}`, never the class name. Renaming a MonoBehaviour or ScriptableObject class is safe when its file is renamed to match and keeps its `.meta`; deleting and recreating the file leaves a missing script everywhere it was used.
- **One class per script file, named after the file, in a block namespace.** Unity cannot map a class in a file-scoped namespace (`namespace X;`) to its script: `MonoScript.GetClass()` returns null, and the component saves as `m_Script: {fileID: 0}`, a missing script on the next load (observed on 6000.6.2f1).
- **ScriptableObject and `AssetReference` fields are GUID references**: they survive moves and renames like any reference.
- `Library/` is a per-machine cache Unity regenerates from `Assets/`, `Packages/` and `ProjectSettings/`: leave it out of edits and commits.

## Blast radius

What a rename, move or delete reaches beyond a symbol search:

- **Serialized consumers.** Every scene, prefab, variant and `.asset` using the host script, found by [the scope](#building-the-scope), plus nested instances that never name the script.
- **Meta GUIDs.** `grep -rlF 'guid: <guid>' Assets Packages` lists what references an asset, `.meta` files included (a script's default references, a model's remapped materials).
- **Fields bound by name.** An `.anim` curve binds a component field by its serialized name, `attribute: speed` (observed on 6000.3.20f1). Grep `.anim` files for the old name, and read an animated value back after the rename: whether `FormerlySerializedAs` reaches the binding is untested.
- **`UnityEvent` persistent calls** store strings in the file: `m_TargetAssemblyTypeName: Game.PlayerMover, Assembly-CSharp` and `m_MethodName: Jump` (observed on 6000.3.20f1). Renaming the class, namespace, assembly or method breaks the call with no compile error. Grep the scene and prefab text for the old name.
- **String lookups.** An Addressables address and a path passed to `Resources.Load` or `Shader.Find` are string contracts: renaming or moving the asset breaks them silently. Grep the code for the string.
- **Reflection and name-based calls.** `Type.GetType`, `SendMessage`, `BroadcastMessage`, `Invoke` and `StartCoroutine(string)` resolve by name at runtime. `link.xml` names types and assemblies too. Grep for the old name, namespace and assembly.

## What serializes

A field serializes when it is `public` or `[SerializeField]`, is not `static`, `const` or `readonly`, and has a serializable type:

- primitives, `string`, enums of 32 bits or less, fixed-size buffers;
- Unity built-ins (`Vector3`, `Color`, `Rect`, `AnimationCurve` and the like);
- `[Serializable]` custom classes and structs, including generic ones (`Wrapper<int>`);
- references to `UnityEngine.Object` subclasses: only the reference is stored, never the object;
- one-dimensional arrays and `List<T>` of the above.

Not serialized: properties (an auto-property's backing field is, with `[field: SerializeField]`, as `<Name>k__BackingField`), multidimensional and jagged arrays, nested containers (wrap the inner list in a `[Serializable]` class), and dictionaries before 6.6.

**Inline.** A `[Serializable]` class in a plain field is stored by value, as the field's declared type: a null field comes back as a new default instance, a derived instance in a base-typed field saves as the base and loses the derived data, two fields sharing one instance load as two copies, and self-reference cycles stop after 10 levels with a warning.

**`[SerializeReference]`** stores the object by reference, in a `references` block after the host's fields, one entry per object with its class, namespace and assembly. It allows null, polymorphism (interface, abstract or `System.Object` fields), shared references and cycles. The stored object must be a `[Serializable]` class, not a `UnityEngine.Object`, a value type or a dictionary. Sharing works only within one host object. It costs more storage and load time than inline, so use it only for what inline cannot do.

**Dictionaries, from 6.6.** A `Dictionary<TKey, TValue>` field serializes only with `[SerializeField]`, and the declared type must be exactly that. Keys cannot implement `IEnumerable` (`string` excepted); keys and values cannot be interfaces or abstract types (except `UnityEngine.Object` types). No `[SerializeReference]` on one, and none directly inside another collection. Prefab instances override single entries. Before 6.6 a dictionary silently does not serialize, attribute or not.

Unity 6.6 also ships a compile-time analyzer (rules UAC1000 to UAC1022): `[SerializeReference]` on a struct or dictionary, public fields skipped because their type lacks `[Serializable]`, cycles, unsupported collections, and a field name clashing with a `FormerlySerializedAs` argument (UAC1018). Its rule list is a useful review checklist on older versions too.

**Callbacks.** Constructors and field initializers of serializable types run on a loading thread: call no Unity API there. `ISerializationCallbackReceiver` is the pre-6.6 way to store an unsupported type, such as a dictionary as two lists; it runs off the main thread, so touch only the object's own fields. A script edit to a ScriptableObject in Edit mode is saved only after `EditorUtility.SetDirty` and a save. Play mode changes to a ScriptableObject asset persist in the Editor; in a player they are never saved.

## Renames and moves

Serialized data is keyed by name. Every rename below carries its attribute in the same change, or the stored value is lost.

- **A serialized field**, including one inside a `[Serializable]` class: `[FormerlySerializedAs("oldName")]` on the renamed field. Unity reads the old name everywhere on load, prefab overrides included, but files keep it on disk until reserialized.
- **A field turned into an auto-property** with `[field: SerializeField]` serializes as `<Name>k__BackingField`: add `[field: FormerlySerializedAs("oldName")]`. Back to a field: `[FormerlySerializedAs("<Name>k__BackingField")]`.
- **A `[SerializeReference]` type** renamed, or moved to another namespace or assembly: `[MovedFrom(false, sourceNamespace: ..., sourceAssembly: ..., sourceClassName: ...)]` on the type, naming only what changed. Without it the reference loads as null, and re-saving the host drops its data for good. Fix the type before any host is re-saved.
- **A serialized enum** stores its integer value: give it explicit values, append new members, and never reorder, remove or reuse a value.
- **A serialized field's type** changing is not a rename: treat it as data loss unless you check the conversion in the Editor.

Moving a script folder or an assembly definition keeps every GUID when the `.meta` files move too; a `[SerializeReference]` type that changes assembly needs `MovedFrom`, which keeps its polymorphic data through the move.

## The reserialize follow-up

A rename is **expand then contract**: two commits, the second only on the owner's okay.

1. **Expand**: the rename plus its attribute. Commit. The change is complete here; the attribute is harmless if it stays forever.
2. **Contract**: propose rewriting the files that still hold the old name, then removing the attribute. Always propose, even when the scope is small: build the scope, then show the file count and the path list and wait. When the scope is uncertain (built by the grep script, or the Editor script printed notes), offer two options: the scoped list, or the whole project.

On the okay:

- **Scoped**: run `SerializationScope.Reserialize` with the approved list. It calls `AssetDatabase.ForceReserializeAssets(paths)`, which rewrites only the listed files, then re-records the prefab instance overrides in each listed scene.
- **Whole project**: `ForceReserializeAssets()` with no arguments rewrites every asset: a large diff. Scene overrides still need the re-record pass, so then run `Reserialize` with every `.unity` file in the project.

**An incomplete scope stops the attribute's removal.** `scope.sh` exiting 3, or a `# scope incomplete` line from `Find`, names a file that could not be read. That file may hold the old name and would lose its value once the attribute goes. Name it in the proposal and keep the attribute: neither option above lifts this until a rerun comes back complete.

Then remove the attribute, compile, check, and commit. Prefab files keep a stale entry under the old `propertyPath` beside the new one; it no longer applies to anything and can stay.

### Building the scope

**Without an Editor**, list the scope with [the scope script](../scripts/scope.sh), which needs bash and grep. Run `bash <this skill's folder>/scripts/scope.sh --help` first and treat the script as a black box. Seed it with every script whose class declares the changed field or holds the changed type, and every subclass of those. It lists every text asset referencing them, following each matched prefab to what nests it. It covers only that grep, so the proposal states that hosts reached through subclasses, nested types or `[SerializeReference]` fields may be missing.

**With an Editor**, use [scripts/SerializationScope.cs](../scripts/SerializationScope.cs). Run `bash <this skill's folder>/scripts/scope.sh --help` first, which names each entry point and its arguments, and treat the `.cs` as a black box too. When `--help` prints nothing, bash cannot run in this shell: say so, skip both scripts and their source, and leave the scope to a shell that has bash. Copying the `.cs` into a project is a job, never part of a lookup; how to run C# in the Editor is `unity-verification`'s. `Find` walks every MonoBehaviour and ScriptableObject type that serializes the changed type at any depth, maps them to script GUIDs and greps to the same fixpoint. It over-reaches by type: every file using a host component is listed, whether or not that instance holds the changed type. Over-reaching only adds files to the rewrite; missing one loses data.

## Old-save fixtures

Before a migration changes saved shape, keep a sample saved under the old shape: a prefab, a variant, a scene instance with an override, an `.asset`, or a real save file. Commit it where the tests can load it, leave it unsaved by the new code, and assert the values after loading. How to write the test is `unity-testing`'s.

A player save file your code wrote follows the serializer that wrote it, which the attributes above may not reach: prove a rename against an old save fixture before relying on one.

## Prefabs

**Overrides.**

- An override on a prefab instance (a property value, an added or removed component or child) always wins over the prefab asset: changing the asset has no effect on an instance that overrides that property.
- Collection overrides are **by index**, so inserting or removing entries in the asset can move an override onto the wrong element.
- Default overrides are always present and not real overrides: the root's `m_Name`, the root Transform's `m_LocalPosition`, `m_LocalRotation` (with `m_LocalEulerAnglesHint`, `m_RootOrder`), and on a RectTransform root also `m_AnchoredPosition`, `m_SizeDelta`, `m_AnchorMin`, `m_AnchorMax` and `m_Pivot`. Apply All and Revert All skip them.

**Nesting and variants.** A nested instance keeps its link to its own prefab asset. A variant inherits from a base prefab, and its edits are overrides on the base; a variant made from an instance carries that instance's overrides. Apply All applies to the outermost prefab; applying to an inner prefab or a variant's base goes through the per-property menu or the `PrefabUtility.Apply*` APIs.

**Prefab YAML.**

- An instance is a `PrefabInstance` document (`--- !u!1001`) with `m_SourcePrefab: {fileID: 100100000, guid: <prefab GUID>, type: 3}` and an `m_Modification` block: `m_TransformParent`, `m_Modifications`, `m_RemovedComponents`, `m_RemovedGameObjects`, `m_AddedGameObjects`, `m_AddedComponents`.
- Each `m_Modifications` entry is `target`, `propertyPath` (such as `m_LocalPosition.x` or `a.inner.value`), `value` (a string) and `objectReference`.
- The instance's own objects are not written out. Where the file must point at one, Unity writes a `stripped` placeholder (`--- !u!4 &<id> stripped`) holding only `m_CorrespondingSourceObject`, `m_PrefabInstance` and `m_PrefabAsset`.
- A variant file is one `PrefabInstance` with `m_TransformParent: {fileID: 0}` whose `m_SourcePrefab` is the base.
- So a value seen on an instance may appear nowhere in the scene file, and editing the asset's YAML leaves every instance overriding that property unchanged.

**Renamed fields and overrides.** `FormerlySerializedAs` covers overrides: one whose `propertyPath` names the old field applies to the renamed field on load, in scenes, variants and nested prefabs alike. On disk the old path stays until the file is rewritten:

- `ForceReserializeAssets` on a prefab asset writes an entry under the new `propertyPath` and keeps the old entry beside it.
- `ForceReserializeAssets` on a scene rewrites the scene's own objects but leaves its prefab instance overrides on the old `propertyPath`. So does opening and saving the scene. `PrefabUtility.RecordPrefabInstancePropertyModifications` on the instance's component, then a save, writes the new path.
- Once the attribute is removed, an override that only exists under the old path is lost: the instance falls back to the prefab asset's value.

`SerializationScope.Reserialize` handles both; a surgical text edit of the `propertyPath` lines is the fallback without an Editor.

## UnityYAML and editing order

Edit through the first that can do the job:

1. **The Editor**: a connected editor or the `unity` CLI (`unity skill show` for its commands).
2. **A scripted API**: `AssetDatabase`, `SerializedObject`, `PrefabUtility`, run in the Editor.
3. **A surgical text edit**: line-level find-and-replace on known files, written straight to the text.

Structural text edits (adding or removing `--- !u!` documents, fileIDs, `m_Modifications` entries) prefer the Editor; without one they are allowed only when simple. Every surgical or structural edit ends with [the checks](#check-after-import).

**The format.** Scene, prefab, `.asset` and most other Unity asset files are text under Force Text, the default. Unity documents them as tool-readable and hand edits as unsupported. UnityYAML is a subset with its own tags: no comments, no complex mapping keys, no `|` or `+` block scalars, and `stripped` markers after document headers. A YAML library that loads and re-dumps a file corrupts it, so edit the text lines in place, keeping the file's line endings.

- Each object is one document, `--- !u!<classID> &<fileID>`; the fileID is unique within the file and arbitrary. Common class IDs: `1` GameObject, `4` Transform, `114` MonoBehaviour (a component script or a ScriptableObject), `1001` PrefabInstance. A ScriptableObject `.asset` holds its main object at `&11400000`.
- Serialized fields follow as keys under their serialized names. `m_EditorClassIdentifier` records the assembly and class name for the Editor; the script link is `m_Script`.
- A `[SerializeReference]` field holds `rid: <id>`, resolved in the host's `references:` block, where each entry carries `type: {class: ..., ns: ..., asm: ...}` and its `data`.
- Floats can be written as IEEE 754 hex (`0x...`); to edit one by hand, replace it with a decimal.

**References.**

- `{fileID: <id>, guid: <32 hex>, type: <n>}` points into another file. `{fileID: <id>}` points inside the same file. `{fileID: 0}` is null.
- `type: 2` loads directly from `Assets/` (materials, `.asset` files); `type: 3` loads through the import pipeline (prefabs, textures, models, scripts).
- Well-known fileIDs: `11500000` is a `.cs` script; `100100000` is a prefab's asset handle. A script inside a DLL has the DLL's GUID and its own fileID.
- The Editor blocks references across scenes by default (`EditorSceneManager.preventCrossSceneReferences`). The format implies a prefab or ScriptableObject cannot hold a reference to a scene object either, though no single doc sentence says so.

**`.meta` files.** A `.meta` holds `guid:` and its importer settings. Change import settings through the `AssetImporter` APIs; hand edits to them are not documented as supported. The `guid:` line changes only when adopting a known GUID is the point of the change. A new file needs no `.meta`: Unity generates one on import. Check `.gitattributes` for `filter=lfs` before trusting a binary file's bytes: without Git LFS installed, Git checks out pointer files silently, and Unity imports the pointers.

**Surgical recipes.**

- **GUID swap**, repairing references to an asset replaced by one with a new GUID: list the files first, then replace in place. Only a `.meta` whose own `guid:` line is the old GUID stays out. Also check the fileID: a script moved into a DLL, or a sub-asset, changes it too.
  ```bash
  grep -rlF 'guid: <old>' Assets Packages | grep -vxF '<old asset path>.meta'
  grep -rlF 'guid: <old>' Assets Packages | grep -vxF '<old asset path>.meta' | xargs sed -i 's/guid: <old>/guid: <new>/g'
  ```
- **`m_Script` repair**: the same swap on the `m_Script:` lines, with the script's `.meta` GUID and `fileID: 11500000`.
- **Renamed override**, without an Editor: in each file the scope lists, rewrite `propertyPath: <old>` (or `<parent>.<old>`) to the new name on the `m_Modifications` entries whose `target` points at the changed component.
- **A single value**: change the one `key: value` line; for an instance, the `value:` of its `m_Modifications` entry.

## Merge conflicts

Official tooling carries the mechanics: `unity vcs merge-setup` wires the driver; `unity vcs conflicts` lists and classifies; `unity vcs explain <path>` says what each side changed; `unity vcs resolve` merges or takes a side; `unity vcs diff <path>` reads a scene or prefab by object name. Read their `--help` and `unity skill show --path references/version-control.md`. What follows is what they leave to you.

**Pause, never abort.** A merge is always carried to its commit. These conflicts **pause** it instead: leave it in progress, ask, then resolve with the answer, unless the task or the merge's goal gives a rule (an upstream sync where their side owns the art; a `.meta` GUID only one side's files reference).

1. A binary or LFS file changed on both sides.
2. A structural scene or prefab conflict: reparenting (`m_Father`, `m_Children`), components added or removed (`m_Component`), or `m_Modifications` entries.
3. A `.meta` `guid:` add/add: the same path added on both sides, each with its own GUID.
4. A conflict on a lockable LFS path (`lockable` in `.gitattributes`). Report it even when a rule resolved it: the lock workflow was bypassed. Leave locks to their owners.
5. A GUID collision: two different assets whose `.meta` files share a `guid:`.

Stops are **batched**: resolve everything else first, then one ask listing each stopped path with what each side did and both sides' commits and authors (`git log --merge --format='%h %an %s' -- <path>`).

**What `unity vcs` leaves open** (observed on CLI 1.0.0-beta.15):

- **A `.meta`** reports `not-eligible` from `resolve` and nothing from `explain`. Line-merge it. Import-setting hunks resolve as YAML. For a `guid:` hunk, grep the tree for both GUIDs: keep the one only one side references, or stop when both are referenced. Resolve an asset and its `.meta` to the same side.
- **A contested property** reports `tool-declined` from `resolve`, exit 6, with the file still unmerged. Run [Smart Merge by hand](#smart-merge-by-hand) for the property list, and settle each by each side's intent.
- **Binary or LFS** (`git check-attr filter -- <path>` says `lfs`): only a side, the asset and its `.meta` together. The pointer text is never edited.
- `Packages/packages-lock.json`: take either side; the Package Manager regenerates it on the next Editor open.

**A driver that misfired.** Trust Git state over markers: `git diff --name-only --diff-filter=U` lists every unmerged path, and a Smart-Merged file carries no markers. `git check-attr merge -- <path>` names the file's driver and `git config --get merge.<driver>.driver` its command. Leave the config as it is and name a missing or broken driver in the final report.

- **Command defined, exe missing** (a stale editor path): Git marks every file with that attribute unmerged, each holding our side untouched with no markers (observed on Git 2.55). Nothing was merged: run Smart Merge by hand on each.
- **A `.meta` sent to the driver**: UnityYAMLMerge cannot parse it and exits 1, so every `.meta` both sides changed is unmerged, holding our side with no markers. Line-merge it from the index stages: `git merge-file ours base theirs` writes the merge into `ours`.
- **A command with no dest**: UnityYAMLMerge takes base, theirs, ours, dest, and Git reads only `%A`, so the command ends `%O %B %A %A`. Without a dest the tool prints to stdout and exits 0, and Git records our side as cleanly merged: their changes are gone with no conflict shown.
- **Rebase swaps the sides.** During a rebase, stage 2 (`--ours`) is the branch being rebased onto and stage 3 (`--theirs`) is your commit being replayed. Read which side the file holds before calling it resolved.

### Smart Merge by hand

The exe ships with the editor: `<editor>/Editor/Data/Tools/UnityYAMLMerge.exe` on Windows, `Unity.app/Contents/Tools/UnityYAMLMerge` on macOS; use the project's editor version.

```bash
git show :1:<path> > base; git show :2:<path> > ours; git show :3:<path> > theirs
'<UnityYAMLMerge>' merge -h --force --fallback none -o report.txt --describe base theirs ours merged
```

- Every call starts `merge -h`, in that order: with `-h` missing, or placed before `merge`, an argument error opens a modal dialog and the call blocks until a human closes it. `--fallback none` keeps a conflict from launching a GUI merge tool.
- Argument order is base, **theirs**, **ours**, dest. During a rebase, swap stages 2 and 3.
- **Exit 0**: clean; `merged` holds both sides. Copy it over the path and `git add`.
- **Exit 2**: conflicts. `report.txt` lists each as `Left <fileID>.<Class>.<property> change to <theirs>` and `Right ... change to <ours>`. `merged` holds everything else merged and the **base** value for each conflicted property, with no markers. Set each with a surgical edit, then copy it over the path and `git add`. A property on the structural list above is a stop.
- **Exit 1**: refused or failed (without `--force` it refuses anything but `.unity` and `.prefab`); `merged` is untouched. A failure such as `Could not determine the transform parent` means a structural conflict: stop. `--force` on `.controller` and `.anim` imported and loaded cleanly on 6000.6.2f1.

(Observed with the UnityYAMLMerge of 6000.3.20f1 and 6000.6.2f1; Unity does not document the exit codes or the dest contents.)

### Checking the merged result

Text checks, always, before the merge commit:

- `git diff --name-only --diff-filter=U` prints nothing.
- No markers in the resolved files: `git grep -nE '^(<<<<<<<|>>>>>>>)( |$)|^=======$' -- <paths>`.
- No `&fileID` anchor twice in one file, and no `{fileID: N}` (no GUID, N not 0) whose `&N` anchor is missing from that file:
  ```bash
  grep -o '^--- !u![0-9]* &-\?[0-9]*' <file> | sed 's/.*&//' | sort | uniq -d
  comm -23 <(grep -o '{fileID: -\?[0-9]*}' <file> | grep -o -- '-\?[0-9]*' | grep -vx 0 | sort -u) <(grep -o '^--- !u![0-9]* &-\?[0-9]*' <file> | sed 's/.*&//' | sort -u)
  ```
- No two `.meta` files share a `guid:`: `grep -rh --include='*.meta' '^guid:' Assets Packages | sort | uniq -d`. Settle any collision before Unity opens the project: Unity keeps the GUID on the asset it already imported and gives the other a new one, rewriting its `.meta`; when both are new to its `Library/`, both get new GUIDs (observed on 6000.6.2f1). Either way, references meant for the re-GUIDed asset now point elsewhere.
- When an `.asmdef` was conflicted, [the listing script](../scripts/asmdefs.sh) exits 0 and prints no reference as unresolved.

Then, when Unity can run, import the merged files and grep the Editor log for these strings, each seen on 6000.6.2f1:

- `seems to have merge conflicts`: a leftover marker.
- `Broken text PPtr`: a dangling `fileID` or GUID reference.
- `Unable to parse file`: broken YAML.
- `conflicts with:` then `Assigning a new guid.`: a GUID collision Unity just resolved on its own.

Finish with [the checks](#check-after-import). When Unity cannot run, commit the merge anyway and carry the Unity checks into the final report as **unvalidated**.

## Check after import

These name what to check; `unity-verification` owns how Unity runs it and how to report the result. Every check that applies to the change:

- **No lost values**: a renamed field's value read back through `SerializedObject` on a sample prefab, variant and scene instance matches the value before the change.
- **No missing scripts**: no new `m_Script: {fileID: 0}` in the changed files; in the Editor, `GameObjectUtility.GetMonoBehavioursWithMissingScriptCount` on each affected object is 0.
- **No missing references**: every `guid:` added in the diff resolves to a `.meta` in the repo or a package.
- **No managed references with missing types**: every `type: {class: ..., ns: ..., asm: ...}` line in the changed files' `references:` blocks names a type that exists. `SerializationUtility.HasManagedReferencesWithMissingTypes` is documented for this, but returned false on 6000.6.2f1 while a reference loaded as null, so treat a false as unconfirmed.
- **Every move kept its `.meta`**: `git status` or `git diff -M --name-status` pairs each moved or renamed asset with its `.meta`, and no `.meta` was deleted and re-added under a new GUID.
- **No old GUID left** after a GUID swap: a grep for it finds nothing.

Without Unity, run the text checks and report the Unity-side checks as **unvalidated** in Unity.

## Reviewing serialized changes

Start from `git diff --stat -- '*.unity' '*.prefab' '*.asset' '*.meta'`, and read a scene or prefab through `unity vcs diff <path>` rather than whole. Then grep the diff:

- `m_Script` lines: a changed script reference, or `{fileID: 0}`.
- `guid:` lines: references added, removed or swapped.
- `propertyPath` lines: overrides renamed or dropped.
- Meta churn: a `.meta` whose `guid:` changed, a `.meta` added or deleted without its asset, an asset moved without its `.meta`.

In the code: a serialized field renamed without `FormerlySerializedAs`, a field turned into an auto-property without it, an enum reordered or a value removed, a `[SerializeReference]` type renamed or moved without `MovedFrom`, a MonoBehaviour or ScriptableObject in a file-scoped namespace. A finding is hard when it loses data or breaks a reference; otherwise it is a judgement call.

A diff cannot establish that values survive import: name that as unverified until [the checks](#check-after-import) ran.

## Slicing work into tickets

- Tickets that touch the same `.unity` or `.prefab` block each other, even when their logic is independent: a structural merge conflict in one scene stops for a human.
- A serialized rename is two slices, expand then contract, with the contract waiting on the owner's okay.
- Authoring slices (building or rewiring scenes and prefabs) need a connected editor or a human.

## Hotspot scans and friction

- **Leave asset churn out of a churn or hotspot scan**: `*.unity`, `*.prefab`, `*.asset`, `*.meta`, `ProjectSettings/` and `Packages/packages-lock.json`. Scan `*.cs`, `*.asmdef` and `*.asmref`, and say in the scope announcement that asset churn was left out.
- **Friction: serialized fields as hidden interface.** Scenes and prefabs depend on a type's serialized field names and shapes, invisible from the code, so every rename is a data migration. Report where it shows (types whose serialized fields churn, or many prefabs overriding the same fields); what to do about it is the owner's call.
