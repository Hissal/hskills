# Unity tests under review

Knowledge for a review of Unity tests. Reading these starts no test authoring and runs no check.

## Skip markers

Each hides a test from a run, so each needs a reason a reader can check:

- `[Ignore("reason")]`, and `Assert.Ignore`, `Assert.Inconclusive` in a body.
- `[Explicit]`: left out of a default run. Legitimate for a slow test with a `[Category]`; a finding when it hides a failing one.
- `[UnityPlatform(exclude = ...)]` and `[UnityPlatform(include = ...)]`: a skip by `RuntimePlatform`. Ask whether the excluded platform is one the project ships to.
- `[ConditionalIgnore("<key>", "reason")]`: skipped when the project sets that key, for example `IgnoreForCoverage`. Find where the key is set.
- `[Category]` with a filter in the project's run configuration: the test exists and CI never runs it.
- `#if` around a test or a fixture: it compiles away with no skip reported.

## Assertion and log-expectation forms

- `LogAssert.Expect` before the code that logs is the sound form. Multiple expectations must appear in order.
- `LogAssert.NoUnexpectedReceived()` fails on any message not expected so far, a plain `Debug.Log` included (observed on 6000.3.20f1 and 6000.6.5f1), so it is stricter than the end-of-frame check.
- `Is.EqualTo(...).Using(Vector3EqualityComparer.Instance)` and the other comparers in `UnityEngine.TestTools.Utils` give float tolerance; hand-rolled tolerances wide enough to swallow the behaviour do not.
- A test with no assertion that only proves "no exception, no error log" is weak unless that is the contract, and then its name says so.

## Cheat patterns

- `LogAssert.ignoreFailingMessages = true`: turns off the failure on an unexpected error log, often to quiet a real error. A leak too if it stays set past the test.
- `LogAssert.Expect` with a catch-all `Regex` such as `".*"`: swallows whichever error comes.
- `WaitForSeconds` or a counted run of `yield return null`, then an assert: a time-based wait where a [bounded condition](EXAMPLES.md#waiting-on-a-condition) belongs. It passes by luck and hides races.
- A deadline that expires without failing: a poll loop that falls through to the end of the test on timeout, or that asserts nothing afterwards.
- `[Timeout]` raised to outlast a hang, and `[Retry]`, `[Repeat]` or the command line's `-retry` used to pass a flaky test.
- A `MonoBehaviour` test in EditMode that calls its lifecycle method by hand and asserts the result, offered as proof of what the engine does.
- A green run with a count of zero, or a results file from an earlier run.

## Coverage

Unity's coverage package is `com.unity.testtools.codecoverage`, when the project has it (`Packages/manifest.json`). It is no core package, and adding it is the owner's call.

- **Where a report is:** the path in the run's `-coverageResultsPath` (see the project's run configuration or CI), holding OpenCover XML and optional HTML. Reading one is a review's job; producing one is a check run.
- **What it measures:** EditMode and PlayMode tests in the Editor, never a Player. By default only assemblies under `Assets`. Branch coverage is not implemented, so read line coverage only.
- **Producing one:** `-enableCodeCoverage -coverageResultsPath <dir> -coverageOptions "generateHtmlReport;assemblyFilters:+<Assembly>"` on a `-runTests` run with `-debugCodeOptimization`. EditMode and PlayMode are separate runs, and `dontClear` accumulates across them. Accurate numbers also need Burst compilation disabled. Check the flags in the package's docs at the project's version.
- **Reading it fairly:** low coverage is expected on gameplay code tests cannot judge (feel, visuals, scene wiring) and on humble components. Excluded code (`[ExcludeFromCoverage]`) does not count, so read what the project excludes. A low number on logic in plain classes is where to look.
