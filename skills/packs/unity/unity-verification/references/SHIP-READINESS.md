# Ship-readiness

What "ready" means for a Unity project or package. Done when each item below has a result under the skill's [report](../SKILL.md#report), or a line saying why it has none.

This covers evidence only. Store submission, mobile devices, signing, versioning and release steps are outside this pack: name them as not covered and leave them to the project's own process.

## Project

1. **A Player build from a clean checkout, for each configured target.** Take the targets and method from **Build targets and method** in the project facts. Clean means a fresh checkout of the commit being called ready: tracked files only, so nothing depends on a local file. Its `Library/` follows [New checkout](../SKILL.md#new-checkout); say whether it was a warm copy or a cold import. Each target gets its own build and its own line, and a passing build on one says nothing about another.
2. **Tests green** under the [result-reading rule](../SKILL.md#reading-results), on that commit.
3. **The authoritative CI run**, from **Authoritative CI workflow**, read once the owner has pushed, for that commit. Until then it is `environment gap: CI not triggered`. See [CI](../SKILL.md#ci).
4. **Build-only risks named.** For each of platform defines, stripping and IL2CPP, say what the change touches and which build covered it on which backend. A risk no build reached stays unvalidated.

A build shows the Player compiles and completes. Behaviour in it needs someone or something to run it; say which checks ran it and which did not.

## Package

A package has no Player of its own. Ready means, in a consumer project:

1. **It imports and compiles at its declared minimum Unity version**: the `unity` field of `package.json`, with `unityRelease` when present. The consumer pins that Editor. A pass on a newer Editor says nothing about the minimum, and a minimum not installed here is `environment gap: Editor <version> not installed`.
2. **Its tests pass there**, under the [result-reading rule](../SKILL.md#reading-results). A package's tests run only when the consumer's `Packages/manifest.json` lists it under `testables`; without that the run is `total="0"`, exit 0, which is no verdict.

Reference the package from the consumer by a path or a version, the way a real consumer would, and name which in the report.

## Say in the report

Every ship-readiness report carries this line, whether or not a Player was built: **A Development Player does not establish release behaviour.** Name which kind each build was. Development builds keep debug code paths (`DEVELOPMENT_BUILD`, the script debugging and profiler hooks), so a result in one is evidence about that build only.
