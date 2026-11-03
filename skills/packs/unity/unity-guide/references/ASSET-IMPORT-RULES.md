# Asset-import rules

Rules for setting up or changing how a Unity project imports assets. Build only the mechanism the user asked for, each one on request. Folder names, the rule table and whether the approved-assets test exists are project configuration: take them from the user or the repo, and offer the other mechanisms in a line.

- [Choosing a mechanism](#choosing-a-mechanism)
- [Default presets with a glob filter](#default-presets-with-a-glob-filter)
- [Folder presets](#folder-presets)
- [Import rules](#import-rules)
- [Approved-assets test](#approved-assets-test)
- [Official skills](#official-skills)

Checked on Editor 6000.3, against its docs and a fixture project. For another version, confirm through [Docs lookup](../SKILL.md#docs-lookup).

## Choosing a mechanism

| The user wants | Use |
|---|---|
| New assets of a type or path to start with given settings | [Default preset with a glob filter](#default-presets-with-a-glob-filter) |
| A folder to govern its assets' settings, new and existing | [Folder presets](#folder-presets) |
| Settings or names that break a rule reported at import | [Import rules](#import-rules) |
| Scenes held to approved art | [Approved-assets test](#approved-assets-test) |
| A budget audit, integrity checks, audio or atlas settings | [Official skills](#official-skills) |

## Default presets with a glob filter

Set in **Edit > Project Settings > Preset Manager**, stored in `ProjectSettings/PresetManager.asset`. A filter reads `glob:"Art/UI/**.png"`: `**` crosses subfolders, matching is case-sensitive, and lower rows override higher ones.

**The trap: a default preset applies on first import only.** Assets already in the project keep their settings, and **Reimport** leaves them unchanged. To bring existing assets in line, use **Reset** on the importer in the Inspector, or apply it from an Editor script:

```csharp
var importer = AssetImporter.GetAtPath(path);
foreach (Preset preset in Preset.GetDefaultPresetsForObject(importer))
    preset.ApplyTo(importer);
importer.SaveAndReimport();
```

Later changes to the preset reach no existing asset either. When the user wants that, use folder presets.

## Folder presets

A `.preset` file in a folder governs the assets under it, through an `AssetPostprocessor` in an `Editor` folder. Every folder from `Assets` down to the asset contributes, outermost first, so the preset nearest the asset wins.

The import cache is why the dependencies matter. Without them, a changed, added or removed preset reaches only assets imported afterwards. Register both:

- `context.DependsOnArtifact(presetPath)` for each preset applied, so a change to its values reimports the asset.
- `context.DependsOnCustomDependency(key)` for each folder, with `AssetDatabase.RegisterCustomDependency(key, hash)` outside the import, so adding or removing a preset reimports the folder's assets.

```csharp
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEditor.Presets;
using UnityEngine;

public class FolderPresets : AssetPostprocessor
{
    const string KeyPrefix = "FolderPresets/";

    public override uint GetVersion() => 1;

    void OnPreprocessAsset()
    {
        if (!assetPath.StartsWith("Assets/") || AssetDatabase.IsValidFolder(assetPath)
            || assetPath.EndsWith(".cs") || assetPath.EndsWith(".preset"))
            return;
        ApplyFrom(FolderOf(assetPath));
    }

    // Outermost folder first, so the preset nearest the asset wins.
    void ApplyFrom(string folder)
    {
        string parent = FolderOf(folder);
        if (!string.IsNullOrEmpty(parent))
            ApplyFrom(parent);

        // Reimports the asset when a preset is added to or removed from this folder.
        context.DependsOnCustomDependency(KeyPrefix + folder);
        foreach (string path in PresetsIn(folder))
        {
            Preset preset = AssetDatabase.LoadAssetAtPath<Preset>(path);
            // Reimports the asset when the preset's values change or it first becomes loadable.
            if (preset == null || preset.ApplyTo(assetImporter))
                context.DependsOnArtifact(path);
        }
    }

    static void OnPostprocessAllAssets(string[] imported, string[] deleted, string[] moved,
        string[] movedFrom, bool didDomainReload)
    {
        var folders = new HashSet<string>();
        foreach (string[] paths in new[] { imported, deleted, moved, movedFrom })
            foreach (string path in paths)
                if (path.EndsWith(".preset"))
                    folders.Add(FolderOf(path));
        if (didDomainReload)
            foreach (string guid in AssetDatabase.FindAssets("glob:\"**.preset\"", new[] { "Assets" }))
                folders.Add(FolderOf(AssetDatabase.GUIDToAssetPath(guid)));
        if (folders.Count == 0)
            return;

        // RegisterCustomDependency throws during an import, so wait for the next Editor update.
        EditorApplication.delayCall += () =>
        {
            foreach (string folder in folders)
            {
                var hash = new Hash128();
                foreach (string path in PresetsIn(folder))
                    hash.Append(path);
                AssetDatabase.RegisterCustomDependency(KeyPrefix + folder, hash);
            }
            AssetDatabase.Refresh();
        };
    }

    // Reads the disk: an import can run in a worker process, where AssetDatabase searches fail.
    static string[] PresetsIn(string folder)
    {
        if (!Directory.Exists(folder))
            return new string[0];
        string[] paths = Directory.GetFiles(folder, "*.preset", SearchOption.TopDirectoryOnly);
        System.Array.Sort(paths);
        return paths;
    }

    static string FolderOf(string path) => Path.GetDirectoryName(path)?.Replace('\\', '/');
}
```

Say these to the user when setting it up:

- A hand edit to a governed setting is overwritten by the next import: the preset wins.
- Deleting a preset reimports the folder's assets, and they keep the settings it last gave them. Only new assets go back to defaults.
- A `.preset` is a Unity asset. Make it in the Editor (**Create Preset** on a configured importer in the Inspector) or from an Editor script with `new Preset(importer)` and `AssetDatabase.CreateAsset`, rather than writing its YAML by hand.
- A sprite preset made from a script needs `spriteImportMode = SpriteImportMode.Single` as well as `textureType = TextureImporterType.Sprite`.

## Import rules

Project rules on naming, size, compression, read/write and mipmaps live in an `AssetPostprocessor`, in an `Editor` folder. The project supplies the table; these values are examples.

```csharp
using UnityEditor;
using UnityEngine;

public class TextureImportRules : AssetPostprocessor
{
    const string Scope = "Assets/Art/";
    const int MaxSize = 2048;

    // Bump on every rule change: only then does Unity reimport and recheck the textures.
    public override uint GetVersion() => 1;

    void OnPostprocessTexture(Texture2D texture)
    {
        if (!assetPath.StartsWith(Scope))
            return;
        var importer = (TextureImporter)assetImporter;
        if (importer.maxTextureSize > MaxSize)
            context.LogImportError($"{assetPath}: max size {importer.maxTextureSize} is over {MaxSize}.", texture);
        if (importer.isReadable)
            context.LogImportError($"{assetPath}: read/write must be off.", texture);
    }
}
```

- **`GetVersion()` goes up whenever the rules change.** A changed rule with the same version reimports nothing, so assets imported earlier are never rechecked. The bump reimports every texture in the project, outside `Scope` too, so warn the user before bumping in a large project.
- **`LogImportError` reports; it blocks nothing.** The error is in the Console, linked to the asset, but the asset still imports and loads, and a batch-mode Editor run still exits 0. State this when the user expects enforcement. Rules that must stop a merge need a check of their own, which is the user's decision.
- **Rules run at import only.** An asset imported before the rule existed is checked after the version bump.

## Approved-assets test

Build this only when the user asks for it: it pays off when unapproved art keeps reaching scenes. An EditMode test kept in the project, with the folders as project configuration. Assembly setup and running it belong to `unity-testing`.

```csharp
using System.Linq;
using NUnit.Framework;
using UnityEditor;

public class ApprovedAssetsTest
{
    const string Governed = "Assets/Art/";
    static readonly string[] Approved = { "Assets/Art/Final/" };

    [Test]
    public void ScenesUseOnlyApprovedAssets()
    {
        string[] scenes = AssetDatabase.FindAssets("t:Scene", new[] { "Assets" })
            .Select(AssetDatabase.GUIDToAssetPath).ToArray();
        Assert.That(scenes, Is.Not.Empty, "No scenes found: this test checked nothing.");

        string[] offenders = scenes
            .SelectMany(scene => AssetDatabase.GetDependencies(scene, true)
                .Where(path => path.StartsWith(Governed) && !Approved.Any(path.StartsWith))
                .Select(path => $"{scene} uses {path}"))
            .ToArray();
        Assert.That(offenders, Is.Empty);
    }
}
```

It sees what a scene references directly or through prefabs. Assets loaded by path at runtime, through `Resources` or Addressables, are outside it.

## Official skills

Name the official one and what it covers, and leave its workflow to the user's request:

| Job | Official |
|---|---|
| Budget audit of memory, audio and mipmap settings, with fixes | `project-auditor-fixes` |
| Missing metas, duplicate GUIDs, conflict markers, manifest validity | `unity projects verify` |
| Pre-commit integrity hooks | `unity vcs hooks` |
| Audio import settings | `optimize-audio` |
| Texture settings for sprite atlases | `manage-sprite-atlas` |
