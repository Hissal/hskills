# Test assemblies

A test assembly is any asmdef that references NUnit. Tests cannot reference `Assembly-CSharp`, so the code under test must sit in its own asmdef.

## Templates

Write test assemblies in the explicit form below. The Editor's templates and the Manual still use the legacy shorthand `"optionalUnityReferences": ["TestAssemblies"]`; writing the references out says what the file depends on.

**EditMode**, `<Module>.Tests.EditMode.asmdef`:

```json
{
    "name": "<Module>.Tests.EditMode",
    "rootNamespace": "<Module>.Tests",
    "references": ["<module reference>", "UnityEngine.TestRunner", "UnityEditor.TestRunner"],
    "includePlatforms": ["Editor"],
    "overrideReferences": true,
    "precompiledReferences": ["nunit.framework.dll"],
    "autoReferenced": false,
    "defineConstraints": ["UNITY_INCLUDE_TESTS"]
}
```

**PlayMode**, `<Module>.Tests.PlayMode.asmdef`: the same without `includePlatforms` (empty means every platform, which lets its tests run in Play mode and in a Player) and without `UnityEditor.TestRunner`, which only EditMode assemblies can reference. Editor API calls inside it go in `#if UNITY_EDITOR`.

**Test helpers** shared by several test assemblies (builders, fakes, wait helpers, custom constraints): their own asmdef, shaped like the test assembly of the mode they serve, with no tests in it; each test assembly references it.

- `precompiledReferences` takes effect only with `"overrideReferences": true`.
- `UNITY_INCLUDE_TESTS` in `defineConstraints` keeps the assembly out of normal Player builds, which is also why production code in a test assembly vanishes from the Player.
- For the form of the module reference and the `.meta`, ask `unity-guide` for assembly references.

## The test framework package

`com.unity.test-framework` is a core package with its version fixed to the Editor's, but a project can still lack it: a project created with bare `-batchmode -createProject` has no entry, and its test assemblies fail to compile. Before the first test assembly, read `Packages/manifest.json`. When the entry is missing, propose adding it at the version the Editor bundles and wait: adding a package is the owner's call.

## Setting up the first test assembly

1. **Code in `Assembly-CSharp`:** tests cannot see it, so it needs its own asmdef first. Ask `unity-guide` for assembly boundaries and make the move it describes.
2. **Check the manifest**, as above.
3. **Place it** in the project's test assembly layout.
4. **Write the asmdef and its `.meta`.**
5. **Add one test** and run it.

A new test assembly's checks: every reference resolves, its `.meta` exists, and a run reports a nonzero test count from it. A count of zero means the runner never saw the assembly, however green the run looks.
