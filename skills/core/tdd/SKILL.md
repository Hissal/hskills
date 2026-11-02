---
name: tdd
description: Use when writing, changing or fixing any test, including building features or fixing bugs test-first (red-green-refactor). Not for reviewing a test suite's quality.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/tdd"
  opencode/autoinvoke: "true"
---

# Test-Driven Development

TDD is the red → green loop, and this skill governs all test work, test-first or not: every test you write, change or fix earns its place, goes red for the right reason, and is shown able to fail. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle: consult them before and during the loop, not after.

When exploring the codebase, read `GLOSSARY.md` (if it exists; follow `GLOSSARY-MAP.md` to the right one when the repo has several) so test names and interface vocabulary match the project's domain language, and respect ADRs in the area you're touching.

For *writing, setting up and running tests for this stack*, ask the pack guides this project lists; the answer is knowledge for this work, and when none answers, carry on silently. A pack lookup never starts authoring: a review that consults this stack's test idioms stays a review.

The calls below to `codebase-design` and `refactoring` are process calls, not requirements: when one is not installed, say so once and carry on with this skill's own rules.

## Tests are code

Tests follow the same architecture, naming and standards as production code. Project facts come from project configuration: the files linked from the `## Agent skills` block in `AGENTS.md` or `CLAUDE.md`. Read the project's selected coding guidance and its applicable tooling configuration (linter, formatter, compiler and analyzer settings) through the guidance pointer there, and apply them to test files exactly as to production files. When the behaviour a test covers changes, the test changes with it.

Reach green by changing the code under test: never weaken, skip or delete a test to get there. Add a test to protect a behaviour, never only to show green.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification: "user can checkout with valid cart" tells you exactly what capability exists, and it survives refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines. When a test generates its inputs (property-based or model-based), read [generated-inputs.md](generated-inputs.md) before writing it.

## Seams: where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them with the user. No test is written at an unconfirmed seam. You can't test everything, so agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case.

Ask: "What's the public interface, and which seams should we test?" Give each proposed seam a one-line note on what it catches and what it misses.

When the shape of that interface is itself in question (how deep the module is, where the seam belongs, what the interface should expose), call the Skill tool with "codebase-design" for the vocabulary. It is the shared source of the module, interface, depth, seam, adapter, leverage and locality terms, and it is a reference to consult, not a session to run.

**Authoring gate.** Before writing any test, answer four questions in your reasoning (a gate to pass, not a card to fill in per test):

1. Which behaviour or contract does it protect?
2. Which credible regression makes it fail?
3. Why does existing coverage not catch that regression? If it does, extend the existing test or drop this one.
4. Does it need a production seam that no production caller needs? Then test at the real boundary instead.

## Anti-patterns

- **Implementation-coupled**: mocks internal collaborators, tests private methods, or verifies through a side channel (querying the database instead of using the interface). The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological**: the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`, a snapshot derived by hand the same way, a constant asserted equal to itself), so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth: a known-good literal, a worked example, the spec.
- **Fixture-supplied result**: a mock or fixture supplies the very result the code under test should produce, so the test checks its own setup. The code under test must compute what the assertion checks.
- **Vacuous**: a guard, filter or loop in the test excludes the case the test claims to cover, so the assertion never sees it. Make sure the named case reaches the assertion.
- **New absence assertion**: a new assertion that something is absent (a field, a call, an output, a feature) records a behaviour removal. It needs a spec line that authorises the removal.
- **Horizontal slicing**: writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead: one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or add speculative features.
- **Red for the right reason.** Red is the test's own assertion failing. A compile, import, fixture or environment failure is not red: get past it with a stub (the signature, no logic) and nothing more, then run again until the failure is the assertion.
- **Prove the test can fail.** After green, name one plausible wrong implementation the test rejects (wrong constant, wrong branch, missing side effect, default return). When the test looks suspect (you struggle to name one, it went green sooner than expected, or it was never red in its own assertion), apply that wrong implementation, re-run to see red, then revert it.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** It happens after green, under the `refactoring` skill's rules, not inside the red → green implementation cycle.

## Suggest at handback

Offer `/test-review` only on evidence of a broader test-quality problem outside the current task, naming the area and an example. Touching tests, adding a regression test or low coverage alone is not that evidence, and a test problem inside the current task is handled directly. The offer runs nothing; with no such evidence, offer nothing.

When you run for a parent agent, make no offer: return the observed follow-up need, and the parent decides what to offer the user.
