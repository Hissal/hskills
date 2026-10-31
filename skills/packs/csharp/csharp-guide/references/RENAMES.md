# C# renames and moves

What a rename or move can break in SDK-style .NET, and how to prove it did not. A rename of a shipped public member also follows the [compatibility rules](COMPATIBILITY.md).

- [Tool ladder](#tool-ladder)
- [Names the compiler cannot see](#names-the-compiler-cannot-see)
- [Validate every target](#validate-every-target)

## Tool ladder

Use the first rung the session has:

1. **The session's IDE or language-server tools**, when present (a C# language server or an IDE bridge such as Rider's): find references, go to definition, rename. Use only what the session already has; this pack ships no language server, and installing one is not part of a refactor.
2. **Otherwise, text search plus a full-solution build and tests.** Search the whole repository for the old name, then edit, then build the full solution (the `.sln` or `.slnx`, not only the project touched) and run the tests. The compiler catches the bindings the search missed; the search catches the names the compiler cannot see.

On either rung, include every `partial` declaration, and change a generator's input, never its generated (`*.g.cs`) output.

## Names the compiler cannot see

A compile-clean rename can still break a name that is reached as a string. Before renaming or moving a type or member, look for each of these; tests and string search are how they are found:

- **Reflection**: `Type.GetType("Namespace.Type, Assembly")`, `GetMethod("Name")`, `Activator.CreateInstance` with a type name. `nameof` is safe; a string literal is not.
- **Dependency injection**: assembly scanning or convention registration that matches type names, suffixes or namespaces; keyed services with string keys.
- **Configuration**: options classes bound by property name to `appsettings.json` keys, environment variables or command-line switches.
- **Source generators**: a generator that matches an attribute, type or member by name, and generated names derived from the renamed one.
- **Strong-name `InternalsVisibleTo`**: renaming an assembly breaks every `InternalsVisibleTo` that names it; a strong-named one (`InternalsVisibleTo("Old.Name, PublicKey=...")`) also breaks when the key changes.
- **Serialized names in a library Unity consumes**: Unity stores serialized field names in the consumer's scenes, prefabs and assets, and stores `[SerializeReference]` objects by assembly, namespace and class name. A rename silently drops that data in the consumer's project unless the old name is kept (`[FormerlySerializedAs]`, `[MovedFrom]`) or the field keeps its name.
- **Other serialized names**: JSON or XML property names, `[DataMember]` names, type discriminators stored in data.

For each name found:

- **Search** the whole repository for the old name as a string, including non-C# files (`.csproj`, `.props`, `.targets`, JSON, YAML, XML, `.resx`) and casing variants such as the camelCase a serializer writes.
- **Test** the path that reads the name: a DI resolution test, a configuration binding test, a serialization round trip over data written before the rename, a reflection lookup. Run it before and after.
- When neither a search hit nor a test covers the path, keep the old external name (a serializer attribute, a forwarding shim) or report the unverified boundary. Do not call the rename safe.

## Validate every target

- Read every declared target framework: `<TargetFramework>` and `<TargetFrameworks>` in each project and in `Directory.Build.props`.
- Before a rename that crosses a boundary (a public symbol, a multi-targeted project, `partial` or generated code, `#if` branches), build and test first to get a baseline. A baseline that is already red stops the refactor: report it.
- After the edit, build and test each target explicitly (`dotnet build -f <tfm>`, `dotnet test -f <tfm>`). A green default target proves nothing about the others or about `#if` branches only they compile.
- Prefer the repository's own documented build and test commands over these generic ones.
