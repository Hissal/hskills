# C# compatibility

Rules for changing a .NET library's public surface and its persisted data without breaking the people who consume it.

- [Which compatibility is at stake](#which-compatibility-is-at-stake)
- [Changing a shipped surface](#changing-a-shipped-surface)
- [Retiring an API](#retiring-an-api)
- [Strong names](#strong-names)
- [netstandard consumers](#netstandard-consumers)
- [The public-API baseline](#the-public-api-baseline)
- [Migrating persisted data](#migrating-persisted-data)
- [For reviewers](#for-reviewers)
- [Sources of friction](#sources-of-friction)

## Which compatibility is at stake

- **Source**: consumer code still compiles against the new version. Every consumer needs it.
- **Binary**: consumer assemblies compiled against the old version still run against the new one without recompiling. Needed for anything shipped as a compiled assembly: a NuGet package, a DLL dropped into another project, a plugin host.
- **Data**: bytes written by one version (files, messages, caches, settings) still read in another.

A surface is **shipped** once a release has carried it: a published package, a tagged release, a shipped baseline file. Unshipped public API may still change freely; check the release history before treating a public member as a commitment.

## Changing a shipped surface

- **An optional parameter is a binary break.** The default value is compiled into each caller, and the method's signature changes, so an assembly built against the old signature fails at runtime with `MissingMethodException`. Keep the old signature and add the new parameter as a new overload, with the old method forwarding to it; the same holds for a new `CancellationToken`.
- **A changed default or `const` value** keeps compiling, but already-compiled callers keep the old value until they rebuild. Treat it as a behaviour change and call it out.
- **Breaking**: removing or renaming a public member; changing a parameter type, order, `ref`/`out`/`in`, or a return type; narrowing accessibility; adding a required parameter; adding a member to a public interface consumers may implement (a default interface member needs a runtime every target supports, which `netstandard2.0` and .NET Framework lack); adding an abstract member to an unsealed public class; sealing a public type; changing a public nullable annotation (source-breaking under warnings as errors).
- **Additive**: a new overload, type, or member on a class; a new optional feature behind a new entry point. These keep binary compatibility, but check source: a new overload can make an existing call ambiguous (a `null` argument, a lambda), and a new type can clash with a consumer's own name.
- Moving a public type to another assembly needs `[TypeForwardedTo]` in the original assembly. Renaming a public member needs the old name kept as an `[Obsolete]` shim that forwards to the new one.

## Retiring an API

Obsolete goes warning, then error, then removal, each step in its own release:

1. `[Obsolete("Use X instead.")]`: a warning, with the replacement already shipped in the same release.
2. `[Obsolete("Use X instead.", error: true)]` in a later release: callers fail to compile, but compiled callers still bind.
3. Remove it in a major version.

Never skip a step to tidy up, and never remove a shipped member because every in-repo caller has moved.

## Strong names

When an assembly is strong-named, its public key is part of its identity. Keep the key (`.snk`) stable. On .NET Framework, which binds by full strong name, a new key, or adding or removing strong naming, breaks every compiled consumer. On every runtime, a new key breaks each `InternalsVisibleTo` that names the old public key.

## netstandard consumers

A library that targets `netstandard` keeps source compatibility for the consumers who compile against that target. A member added only under a newer target (`#if NET8_0_OR_GREATER`) is additive; a member removed, or a signature changed, in the `netstandard` build alone breaks those consumers even when the newest target looks fine.

The reverse matters as much: a `netstandard` consumer compiled against the `netstandard` build can run inside an app that restores the library's newer target. Every newer target must therefore expose everything the `netstandard` build does, with the same signatures. Compare the public surface per target, not only the default one.

## The public-API baseline

A baseline is the repo's recorded public surface: `PublicAPI.Shipped.txt` and `PublicAPI.Unshipped.txt` (`Microsoft.CodeAnalysis.PublicApiAnalyzers`), package validation (`<EnablePackageValidation>` with a baseline version), or an approved public-API snapshot test.

- New public API goes into the unshipped list or the pending snapshot, as the repo's mechanism expects.
- Only the owner approves a change to a shipped baseline: a line removed or changed in `PublicAPI.Shipped.txt`, a moved package-validation baseline, a re-approved snapshot that drops or changes a member. Never edit one to make a build pass; show the diff and ask.
- A repo with no public-API baseline: propose `PublicApiAnalyzers` once, saying it turns an accidental surface change into a build diagnostic (an error under warnings as errors). Never add it unasked.

## Migrating persisted data

- Change a format in phases: ship a reader that understands the new form first; write the new form behind an opt-in once that reader is deployed where the data is read; make it the default only in a later release.
- Never let a .NET type or assembly name become part of stored data (`TypeNameHandling`, assembly-qualified `$type`): a rename or move then breaks old data. Use an explicit, stable discriminator.
- Renaming a serialized member keeps the old wire name with the serializer's own attribute (`[JsonPropertyName]`, `[DataMember(Name = ...)]`), proved by a round-trip test on old data.

## For reviewers

What a diff and a green build cannot prove:

- A binary break compiles: in-repo callers recompile, so the build and tests stay green. Read the baseline diff or package validation, or the signatures themselves.
- A target the build did not run: only the targets actually built are proven, along with only the `#if` branches they compile.
- External consumers: a changed default, `const` or nullable annotation reaches them only after their own rebuild.

## Sources of friction

What makes a .NET library's structure costly to change, for an architecture review: a wide public surface where `internal` with `InternalsVisibleTo` for tests would do; unsealed public types not designed for inheritance; public interfaces consumers implement, which freeze their member list; and a shipped surface with no baseline guarding it.
