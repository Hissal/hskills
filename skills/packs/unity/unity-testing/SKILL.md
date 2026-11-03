---
name: unity-testing
description: Use when writing, choosing or reviewing Unity tests, setting up a test assembly, choosing EditMode or PlayMode, sketching test seams for Unity code, or when a Unity test fails in a way plain C# would not.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/unity-testing"
  agent-skills-sync.requires: '["hissal.skill-collection/unity-guide"]'
  opencode/autoinvoke: "true"
---

# Unity testing

Unity's rules on top of core `tdd`, whose loop, test quality and seam agreement hold unchanged. When a workflow asks, you supply knowledge for its job: a review stays a review, and writes and runs no test.

Before doing any work, load unity-guide (hissal.skill-collection/unity-guide) and its needed
reference files through the installed skill listing. Begin work only after all
requirements and needed references have loaded. If any cannot load, stop
without partial work and print:

Stopped: required skill unity-guide (hissal.skill-collection/unity-guide) could not be loaded
completely. Unavailable: <unloadable-material>. Ordinary installers such as
`npx skills` do not install requirements; `agent-skills-sync` resolves them
from this metadata. Install or repair the requirement, then retry.

Check only whether the required material loads; the installer verifies identity
and content. Loading this requirement grants no permission to invoke a
user-invoked workflow; wait for the human to invoke that workflow.

Loaded as a requirement, `unity-guide` gives you detection, project facts and the docs lookup. Its row for test work points back here, so carry on with this skill. Ask it for any Unity API detail: the docs at this repo's versions beat the examples here.

## Project facts

The **Testing** section of `docs/agents/unity.md`; a missing field means the default.

| Field | Default |
|---|---|
| Test assembly layout | The repo's existing test assemblies; with none, `<Module folder>/Tests/EditMode/<Module>.Tests.EditMode.asmdef`, and `Tests/PlayMode/` when PlayMode tests are needed |
| Mocking library | Hand-written fakes |

## Mode

- **EditMode `[Test]`** whenever it can establish the behaviour. It runs synchronously, enters no Play mode, and is the fastest loop.
- **PlayMode** where the running engine is required: the MonoBehaviour lifecycle, frames passing, physics, a loaded scene. State what makes EditMode insufficient and the cost: a Play mode entry for the run and real time for each test.
- **Player tests** only on request.

The mode belongs to the test assembly: an asmdef with `"includePlatforms": ["Editor"]` holds EditMode tests, and any other holds PlayMode tests.

Test assemblies, their templates and setting up the first one: [ASSEMBLIES.md](references/ASSEMBLIES.md). `[UnityTest]`, yield instructions, async tests and scene tests: [UNITYTEST.md](references/UNITYTEST.md). NUnit shapes for these rules: [EXAMPLES.md](references/EXAMPLES.md).

## Seams

Find useful seams in the design that is there, and impose no architecture. Good seams already in Unity code:

- a plain C# class or static function holding the logic;
- a public or `internal` method on a component, called directly, when it uses no lifecycle state;
- a value passed in, such as `Tick(float deltaTime)`, in place of a read of `Time`;
- a ScriptableObject or other data the logic reads;
- an event or observable state the code already exposes.

Where logic is stuck in a MonoBehaviour and no seam exists, extracting a plain class is often the smallest move, and a component that only forwards to it needs no test of its own. An interface around an engine service earns its place only when production code gains from it or several reads make a passed value unwieldy; `tdd`'s question about a seam no production caller needs applies. What only the engine can show (a collision, a frame's ordering, a scene's wiring) goes to a PlayMode test against the real engine.

**Mocking** uses the project's library, else hand-written fakes. Put the repo's own interface at the seam and fake that. A UnityEngine type (`Transform`, `Rigidbody`, `Time`) is the engine: test it in PlayMode.

## Waiting on the engine

An engine-dependent test waits on the condition it cares about, polled each frame against a deadline. On expiry it fails with what it waited for, the timeout and the last state it saw.

- **The condition** is the state the assertion needs. A fixed `WaitForSeconds` or frame count followed by an assert guesses how long the engine takes: flaky on a slow machine and wasted time on a fast one.
- **The deadline** runs on real time, so `Time.timeScale` cannot stretch it, at several times the normal duration. Keep it well under the framework's own test timeout, whose failure says nothing about your condition.
- **A fixed wait** fits only when elapsed time is itself the behaviour under test; then assert on the time measured too.

The shape is in [EXAMPLES.md](references/EXAMPLES.md#waiting-on-a-condition). Ask the guide's docs lookup for the wait APIs at this repo's version.

## EditMode traps

- **No lifecycle.** A plain MonoBehaviour added in an EditMode test gets no `Awake`, `OnEnable`, `Start` or `Update`, even across `yield return null`. Call its public or `internal` methods directly, or test it in PlayMode, where `Awake` and `OnEnable` run inside `AddComponent`, and `Start` and `Update` after one `yield return null`.
- **`DestroyImmediate` in EditMode.** `Object.Destroy` there logs "Destroy may not be called from edit mode!", leaves the object alive and fails the test. In PlayMode `Destroy` is deferred: the object stays non-null until the next frame.
- **An unexpected error log fails the test**: `Debug.LogError`, an exception log and an assertion log alike. A test that expects one calls `LogAssert.Expect(LogType.Error, "<message or Regex>")` before the code that logs. The check runs at the end of each frame, so an expectation placed after a yield comes too late.
- **Cleanup beyond Undo.** The EditMode runner opens a fresh scene and afterwards reverts Undo-recorded changes, which covers little. Each test's `[TearDown]` destroys the GameObjects it created and deletes or restores the files, assets and settings it wrote.

## Static state in tests

Write tests as if domain reload is off, with no setting to say otherwise: reset every static the test touches in `[SetUp]`, and rely on no fresh domain between tests. Tests in one run share one domain, and a PlayMode run is one Play session, so a static set in one test is still set in the next. In an open Editor, statics also outlive the run until code recompiles. For static state on the production side, ask the guide for static state and reloads.

## What tests cannot judge

Feel, visuals, audio and perceived timing are out of a test's reach. Test the logic under them (the jump curve's numbers, the state that picks the sound), and hand the rest to the verification report as concrete manual checks: what to open, what to do, what to look or listen for.

## Choosing tests

Select by the contracts the change affects and their risk.

- **During the loop:** the test assemblies of the module being changed.
- **Before calling the work done:** the tests covering each affected contract. Widen for shared infrastructure (a base class, a helper, an asmdef others reference), uncertain impact or known coupling.
- **Project-required checks** always run, whatever the selection says.
- **PlayMode:** when an affected contract needs the running engine and EditMode cannot establish it. Existing PlayMode tests in the module are no reason on their own.
- **No behaviour change** (moving, restyling or rewording): no tests from this rule; ask the guide for the check that fits.
- **Read-only review:** runs nothing.

A selection is assistance, and a narrow one never proves complete impact: say what you left out and why.

Ask the guide for compile and work checks to launch the run and read its result; pass it the assemblies or fixtures you chose.

## Run cadence

`tdd`'s one slice at a time holds. What changes in Unity is how slices share a run.

- **With a connected Editor**, runs are cheap: plain one-slice red and green cycles.
- **When each run is a cold headless launch**, startup dominates. Batch independent slices, where neither touches the other's code or behaviour: one run shows the batch red, one shows it green, and a green run may carry the next batch's red tests.
- **The red run stays**, batched or not: it is what exposes a tautological test.
- **Dependent slices stay sequential:** a slice built on another waits for that one's green.

## Sketching test seams for a spec

For each behaviour, name the class that owns it and its EditMode `[Test]` seam; mark PlayMode only where the running engine is required; list what tests cannot judge as manual checks.

## Friction signals

When scanning Unity code for architectural friction: logic stuck in MonoBehaviours, out of EditMode's reach; and scene lookups (`Find*`, `FindObjectOfType`) standing in for dependencies that could be passed in. Report where they are; changing the design is the owner's call.

## Reviewing tests

Check each changed test against the traps, waiting, static and mocking rules above, and each changed test assembly for: an asmdef beside its tests with the mode they need, in the project's layout; and no production code in a test assembly, since it never reaches the Player.

For test-review, Unity's skip markers, assertion forms and cheat patterns, and how to read coverage: [REVIEW.md](references/REVIEW.md).
