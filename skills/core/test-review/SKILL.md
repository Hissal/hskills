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
`npx skills` do not install requirements; the Unity sync resolves them from
this metadata. Install or repair the requirement, then retry.

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

Read, before judging any test:

- **The project's standards**: every file that documents how code is written, including any project coding guide that project instructions point to. They apply to test files exactly as to production files.
- **This stack's test idioms.** Ask the project's listed pack guides for this stack's test idioms (skip markers, assertion forms, cheat patterns).
- **Coverage, if the project already has it.** Ask the project's listed pack guides for collecting test coverage for this stack, to find and read a report the project has already produced. Producing one is a check run, so a missing report stays missing.

A pack lookup answers a question inside this review; it never starts test authoring or runs a check.

Done when you know which standards files, idioms and coverage report (or none) the review uses.

## 3. Judge the tests

For every test in scope, read the test and the production code it exercises, then hold it against each yardstick below. Form your own judgement first; read existing test results, coverage and other tool output only afterwards, as `reviewing`'s evidence rules require, and say when a report is partial, stale against the snapshot, or missing files.

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

A missing test is reported only with the concrete bug it would catch: the input or sequence, the wrong result a plausible defect would produce, and who would see it. Rate it by that bug's consequence on the same scale as every other finding. A gap with no nameable bug is not a finding. Coverage numbers point to where to look; the bug is what makes it a finding.

## 4. Calibrate severity honestly

Rate each finding on one scale:

- **Critical**: the test would pass while the behaviour it claims to check is broken. Passes-whatever, proves-itself, vacuous and cheating findings start here.
- **High**: the test misleads: it fails or passes for reasons other than the behaviour, or breaks on a behaviour-preserving change.
- **Medium**: the test works but costs: a weak oracle that still catches the likely bugs, maintainability trouble, a broken project standard.
- **Low**: a judgement call or a matter of taste.

Then check the ratings:

- **When in doubt, rate lower.** A rating is a claim; raise it only on a quoted consequence.
- **One systemic finding, many instances.** When one cause repeats across tests, report it once and count its instances ("1 finding, 6 tests affected"), listing them.
- **Gaps are not anti-patterns.** An ordinary missing case is a missing test, rated by its bug; it never inflates an anti-pattern's severity.
- **Not findings:** separate tests for distinct boundaries (they are not duplicates); explicit setup repeated in each test (it isolates them); a round-trip check, such as encode then decode, used as the oracle (it is real evidence); a test of pure logic without mocks.
- **Say when the tests are good.** If they are well written, say so first and plainly. Never inflate a finding to justify the review.

## 5. Report

`reviewing`'s evidence rules hold for every finding: quote the line, state how complete a search was, keep a declined-to-judge slot, and report a part you could not finish as missing coverage. Out-of-scope observations go in `reviewing`'s section.

```md
<scope announcement from step 1>

**Verdict:** <one or two sentences: are these tests catching the bugs they exist to catch?>

### Findings

#### <Critical | High | Medium | Low>: <short title> (<standards | anti-pattern | cheating | missing test>)
`<path>:<line>`: `<quoted line>`
<What is wrong, and the concrete bug or regression it lets through.> <Instances, when systemic.>

### Declined to judge
- <what you could not tell, and what evidence would settle it>

### Out-of-scope observations
<reviewing's format>

**Totals:** <N> findings: <N> Critical, <N> High, <N> Medium, <N> Low. <Tool inputs used, and any that degraded.>
```

Zero findings is a valid result: report the verdict, the tests read, and the totals.

## Handback

When the review found a recurring or consequential quality requirement with evidence behind it, one that only an enforceable check would hold (skip markers keep appearing, say), offer `/constraints`, naming the requirement and the gap a check would close. Offer nothing else by default; the owner chooses what happens next.
