---
name: test-review
description: Report on the quality of existing tests, finding weak, cheating and missing tests.
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/test-review"
  agent-skills-sync.requires: '["hissal.skill-collection/reviewing"]'
  opencode/autoinvoke: "false"
---

# Test review

Judge whether the project's existing tests would catch the bugs they exist to catch, and report what you find. You read and report; the owner decides what changes. Your tool use is reading: project files, history, and reports the project already has. Deleting, editing or writing tests, and running tests, coverage, mutation tools or any other check, belong to other workflows; when one would settle a question, name it in the report as the owner's next step.

Before doing any work, load reviewing (hissal.skill-collection/reviewing) and its needed
reference files through the installed skill listing. Begin work only after all
requirements and needed references have loaded. If any cannot load, stop
without partial work and print:

Stopped: required skill reviewing (hissal.skill-collection/reviewing) could not be loaded
completely. Unavailable: <unloadable-material>. Ordinary installers such as
`npx skills` do not install requirements; `agent-skills-sync` resolves them
from this metadata. Install or repair the requirement, then retry.

Check only whether the required material loads; the installer verifies identity
and content. Loading this requirement grants no permission to invoke a
user-invoked workflow; wait for the human to invoke that workflow.

## 1. Resolve and announce the scope

Resolve the target through `reviewing`, which owns the precedence, the announcement and the [scope contract](../reviewing/references/SCOPE.md):

1. **The user's explicit scope.** A whole-codebase sweep is a valid scope: run it as asked, module by module, without steering toward a smaller one.
2. **An exact scope your caller supplies.**
3. **Pending work, local changes included.** The tests it adds or changes, and the tests that should cover the code it changes.
4. **Nothing pending:** the [hotspot survey](../reviewing/references/HOTSPOTS.md). Review the selected modules' tests and the gaps around them.

This review's concern is tests. Pending work bears on it when it touches tests or code that tests cover or should cover. When none of it does (nothing in it is tested or testable, say a few assets or a version bump), offer the hotspot survey as `reviewing` describes, and wait for the owner's choice.

Done when the scope is announced in `reviewing`'s shape.

## 2. Gather the yardsticks

Gather these before judging any test. Standards and idioms are read now; tool reports are only located now, and read in step 3 after your own judgement:

- **The project's standards**: every file that documents how code is written, including any project coding guide that project instructions point to. They apply to test files exactly as to production files.
- **This stack's test idioms.** Ask the project's listed pack guides for this stack's test idioms (skip markers, assertion forms, cheat patterns).
- **Coverage, if the project already has it.** Ask the project's listed pack guides for collecting test coverage for this stack, to find a report the project has already produced. Producing one is a check run, so a missing report stays missing.
- **Mutation results, if the project already has them**: a mutation tool's report of changes it made to production code and which ones the tests failed to catch.

A pack lookup answers a question inside this review; it never starts test authoring or runs a check.

Done when you know which standards files, idioms, coverage report and mutation results (or none) the review uses, with the reports located but not yet read.

## 3. Judge the tests

For every test in scope, read the test and the production code it exercises, then hold it against each yardstick below. Form your own judgement of each test first. Then read the coverage and mutation reports from step 2 and any existing test results, under `reviewing`'s evidence rules; a report stale against the snapshot or missing files counts as degraded.

Done when every test in scope has been held against every section of this step, and every gap you report names its bug.

### Standards

Naming, structure, duplication, magic values and every other rule the project documents apply to tests as written. A test that breaks a documented rule is a finding under that rule, quoted. Tooling-enforced rules are the tooling's job; skip them.

### Anti-patterns

Look for each of these, in this order of how much false confidence it buys:

- **Passes whatever the code does.** No assertion; an assertion that cannot fail (comparing a value with itself, asserting a constant, checking only that no error was raised); an asynchronous assertion that is never awaited, so the test ends first; a failure caught and discarded inside the test; a test that only executes code to touch coverage.
- **Proves itself, not the code.** The expected value is computed the way the code computes it, or a mock or fixture supplies the very result the code under test should produce.
- **Vacuous by construction.** A guard, filter or loop excludes the case the test names, so the assertion never sees it; a loop over an empty collection.
- **Fails or passes for reasons other than the behaviour.** Fixed sleeps standing in for a condition; dependence on test order, shared mutable state, the clock, randomness, the network or the machine.
- **Coupled to the implementation.** Mocks internal collaborators, inspects private state, verifies calls the outcome does not depend on, or reaches past the interface through a side channel; it breaks on a behaviour-preserving refactor.
- **Weak oracle.** Asserts presence, type or count where the behaviour is a value: "not null", "has 3 items", "contains", where the exact result is known.
- **Hard to maintain.** One test checking several unrelated behaviours; a name that does not say what behaviour is expected; setup so large the behaviour under test is lost; copy-pasted tests that differ in one value.

### Cheating

A cheat makes a check go green without making the behaviour work. Judge it by that effect, whatever its form:

- **Disabled tests**: skip or ignore markers, an expected-failure marker, conditional compilation or a platform filter that leaves the test out, a commented-out test or assertion, a test deleted while its behaviour remains.
- **Weakened assertions**: an exact expectation loosened (a value to "not null", equality to "contains", a tolerance widened), an expected value rewritten to match the current output with no reason given, a snapshot regenerated over a behaviour change, an assertion removed.
- **Silenced failure**: an empty catch or a catch that only logs, in a test or in the code it exercises; a retry that runs a test until it passes.
- **Silenced diagnostics**: compiler or analyser warnings suppressed in code, or turned off or downgraded in project configuration.
- **Arbitrary delays** in tests, waiting out a race instead of waiting for the condition.
- **Bypassed project controls**: a dependency version pinned locally against the project's central dependency management, a test-only branch in production code.

On a diff, compare with the base: a weakened assertion shows only beside the line it replaced, and `reviewing`'s rule to blame removed lines applies. A marker with a written reason and a linked issue is still reported, as a smaller finding, quoting the reason.

### Missing tests

A missing test is reported only with the concrete bug it would catch: the input or sequence, the wrong result a plausible defect would produce, and who would see it. Rate it by that bug's consequence on the same scale as every other finding. A gap with no nameable bug is not a finding.

### Changes the tests would still pass

Ask of each behaviour in scope: which caller-visible changes to the production code would these tests still pass? Work through the plausible ones by reading: a wrong constant, a flipped or off-by-one condition, a removed guard, a dropped side effect, an early or default return, swapped arguments, an error path that goes quiet. A change some test would fail is caught. A change every test still passes is a finding: name the change, the line it would alter, the tests that would still pass and why (no assertion reaches it, the oracle is too weak, no input crosses that branch). Rate it by the bug it lets through.

Consider only changes a caller could observe; a behaviour-preserving refactor that no test notices is the tests doing their job. Reason it out from the code: applying a change and running the tests is a check run, so a change you cannot settle by reading goes in the declined-to-judge slot with the run that would settle it.

### Dead mocks

Trace every mock, stub and fake through the code path its test actually runs:

- **Unreached**: the setup is never called on that path (an argument the code ignores, a branch the inputs never take).
- **Ignored**: it is called, but nothing it returns or records reaches an assertion.
- **Overridden or duplicated**: a later setup replaces it, or two set up the same thing.
- **Incidental verification**: the test verifies a call the outcome does not depend on, coupling it to the implementation.

A dead mock misleads the reader about what the test depends on, and can hide that the real collaborator is never exercised. Rate it by that: Low when the assertion still stands on independent ground, higher when the test only appears to cover a path because of the mock. A mock that supplies the result the code should produce is the proves-itself anti-pattern, not a dead mock.

### Coverage

Use coverage only from a report the project already has, and only after forming your own view. Check the report against the snapshot: a report older than the code under review is stale, and the review says so.

- **Rank by risk.** Complex code with little coverage comes first: many branches or callers, consequential behaviour, few lines run by tests. Weigh complexity against coverage; compute no score.
- **Covered is not tested.** A line a test runs without any assertion depending on it is covered and untested. Check the highest-ranked areas with the two analyses above.
- **No targets.** A percentage is evidence of where to look, never a goal: report gaps by the bugs they would let through, and never recommend tests to reach a number.

### Prune findings

A finding that a test should be retired must clear the retention bar and carry a complete retirement card: read [pruning](references/PRUNING.md) before reporting one. Without a complete card, the test stays, and any doubt about its value is a declined-to-judge entry. Retiring a test is the owner's call; the review only makes the case.

### Mutation results

When the project already has mutation results for code in scope, read [mutation results](references/MUTATION.md) and triage their survivors. A survivor is a candidate, not yet a gap.

## 4. Calibrate severity honestly

Rate each finding on one scale:

- **Critical**: the test would pass while the behaviour it claims to check is broken. Passes-whatever, proves-itself, vacuous and cheating findings start here.
- **High**: the test misleads: it fails or passes for reasons other than the behaviour, or breaks on a behaviour-preserving change.
- **Medium**: the test works but costs: a weak oracle that still catches the likely bugs, maintainability trouble, a broken project standard.
- **Low**: a judgement call or a matter of taste.

Then check the ratings:

- **When in doubt, rate lower.** A rating is a claim; raise it only on a quoted consequence.
- **One systemic finding, many instances.** When one cause repeats across tests, report it once and count its instances ("1 finding, 6 tests affected"), listing them.
- **Gaps are not anti-patterns.** An ordinary missing case, a change the tests would still pass, a coverage gap or a mutation survivor is rated by the bug it lets through; it never inflates an anti-pattern's severity.
- **Not findings:** separate tests for distinct boundaries (they are not duplicates); explicit setup repeated in each test (it isolates them); a round-trip check, such as encode then decode, used as the oracle (it is real evidence); a test of pure logic without mocks.
- **Say when the tests are good.** If they are well written, say so first and plainly. Never inflate a finding to justify the review.

## 5. Report

`reviewing`'s evidence rules hold for every finding. Out-of-scope observations go in `reviewing`'s section.

```md
<scope announcement from step 1>

**Verdict:** <one or two sentences: are these tests catching the bugs they exist to catch?>

### Findings

#### <Critical | High | Medium | Low>: <short title> (<standards | anti-pattern | cheating | missing test | survives a change | dead mock | coverage gap | prune | mutation survivor>)
`<path>:<line>`: `<quoted line>`
<What is wrong, and the concrete bug or regression it lets through.> <Instances, when systemic.>

### Declined to judge
- <what you could not tell, and what evidence would settle it>

### Out-of-scope observations
<reviewing's format>

**Totals:** <N> findings: <N> Critical, <N> High, <N> Medium, <N> Low. <Tool inputs used, and any that degraded.>
```

With zero findings, report the verdict, the tests read, and the totals.

## Handback

When the review found a recurring or consequential quality requirement with evidence behind it, one that only an enforceable check would hold (skip markers keep appearing, say), offer `/constraints`, naming the requirement and the gap a check would close. When the owner chooses to defer or transfer concrete review work whose evidence would be costly to rebuild, offer `/handoff`; not every unfixed finding qualifies, and nothing already in the tracker is recorded again. Offer nothing else by default; the owner chooses what happens next.

Run for a caller, make no offer: return the evidenced check need or the work to transfer with your findings, and the caller decides what to offer the owner.
