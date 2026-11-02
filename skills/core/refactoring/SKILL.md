---
name: refactoring
description: "Use when restructuring code while its behaviour stays the same: a rename, move, extract or split, including tidying mid-task when nobody asked."
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/refactoring"
  opencode/autoinvoke: "true"
---

# Refactoring

You own the contract. The structure changes. The behaviour does not. Keep the effort proportional to the change: a one-line local rename does not need the ceremony a cross-module move does.

Done when every requested operation is classified, every structural step ran against a pin that was green before it and is green after it, every kept change lowers reader load, and the report gives Refactor, Preserved, Validation and Deferred.

The calls below to `verifying` are process calls, not requirements: when it is not installed, say so once and still run the pin and the project's own tests before and after, recording each command, tree and exit code.

Project facts come from project configuration: the files linked from the `## Agent skills` block in `AGENTS.md` or `CLAUDE.md`. Before editing, read the project's selected coding guidance and its applicable tooling configuration (linter, formatter, compiler and analyzer settings) through the guidance pointer there, and follow both.

For *this stack's rename and move hazards and how to validate a refactor*, ask the pack guides this project lists; take the hazards to check and the validation to run from the answer, and carry on silently when none answers.

## 1. Classify before any edit

Read only enough of the code to classify each requested operation, before building, testing or editing anything.

- **Refactor**: the change preserves behaviour and every affected consumer moves with it in this one change. That holds across a published interface too: a rename whose every caller is in this change is a refactor.
- **Not a refactor**: the request changes behaviour (a new capability, option or output, a threshold or rate, a bug's result). Say so in one line, naming the behaviour that changes, and leave this skill; that work is never reported or committed as a refactor.
- **Migration boundary**: a compatibility transition (old and new must both work for a while), a persisted-data transition (stored records, files, saves, caches or queued messages hold the old name or shape), a staged rollout, or a consumer updated separately (another repository, a published package's users, an installed older version). Stop the structural work at that boundary, defer the part that crosses it, and suggest `/migrating` at handback (step 6).
- **Mixed request**: do the separable structural part and defer the rest; the report names each deferred part. When the structural and behaviour-changing parts cannot be separated, change nothing and say why they are inseparable.

Tidying unasked in the middle of other work is the structural part of that work: do it in its own steps under these rules, kept apart from the task's behaviour changes, and report it.

Done when every operation has one class.

## 2. Pin the behaviour

Establish the baseline through `verifying`: run the tests that cover the code you will move, on the tree before any edit. When the baseline is already red, stop: report the failing command, tree and exit code, and change nothing; you cannot prove you preserved behaviour against a red baseline.

The pin is what proves the moved behaviour did not change:

- **Covered**: when an existing test would catch a change to the moved behaviour, those tests are the pin. Name each one and the change it catches.
- **Not covered**: when no existing test would catch a change, write a characterization pin first: a test, snapshot or equivalence harness that captures current behaviour, green on the baseline tree, before any structure moves.

A type-check, a lint or a clean build is never a pin.

Compilation proves bindings, not names reached at runtime. Before renaming or moving something, look for names observed by serialization, reflection, dependency injection, configuration binding or code generation. Pin each such path, or report it as an unverified boundary instead of claiming it preserved. A name already held in stored data is a persisted-data transition (step 1).

Done when the baseline is green and every moved behaviour has a named pin.

## 3. Plan the steps

Subtract before you add: delete dead code, collapse one-caller wrappers and remove orphan references before introducing the new shape. The smallest change that reaches the target shape ships.

Split the work into steps of one named operation each (rename, move, extract, inline, split, consolidate). Each step keeps the pin green; never mix a structural step and a behaviour change.

## 4. Edit by these rules

- **Bindings, not text.** A rename edits real bindings, never textual matches in comments, strings or unrelated overloads. Use the strongest tool the session has: IDE or language-server refactoring (rename, find references) first, then compiler-checked edits (edit the true bindings, build, let the compiler flag misses), then plain find-and-replace last, only when the scope is provably tiny and every hit is checked. Spot-check every rename against the actual files: renames silently miss usages in strings, prose and back-references. Change a generator's input, never its generated output.
- **Toward the existing owner.** When `B` duplicates logic already owned by `A`, keep `A` canonical and make `B` delegate to it. Never invert a dependency merely because either direction compiles.
- **Callers keep their differences.** Extract the shared algorithm and pass each caller's existing inputs through unchanged. Never collapse distinct inputs, evaluation order, rounding or side effects into one caller's version.
- **Move every caller, then delete.** With every consumer in this change, migrate every binding and remove the old path in the same change; leave no forwarder or parallel old-and-new path behind.
- **Tests stay honest.** A test changes only where it is a consumer of a renamed or moved binding; its assertions stay as they were. Never edit a test to make a behaviour change look preserved.

After each step, run the pin. On red, repair or revert only your own edit; never discard unrelated changes in the working tree.

## 5. Validate and keep

Through `verifying`, run the pin and the relevant tests on the final tree, and prove the behaviour on the real artifact, never on "it compiles". For a larger reshape, add an equivalence check: diff old and new outputs, or replay a recorded baseline against the new code.

Then confirm each change is worth keeping. The measure is reduced reader load: fewer branches or invalid states, one owner for a concept, a shorter path to understand the code. Revert a change that did not lower reader load somewhere, and report it as reverted.

## 6. Report

Keep the handoff concise and evidence-based:

- **Refactor:** name the structural operation and the symbols and files changed.
- **Preserved:** name the behaviour or compatibility boundary and the pin that preserved it.
- **Validation:** report the exact commands and observed results, with `verifying`'s status words. Never claim success after a failed build or test run.
- **Deferred:** name each behaviour change or migration boundary intentionally left undone, and each change reverted for not lowering reader load. Write `none` when nothing was deferred or reverted.

Then, only when step 1 found a migration boundary, offer `/migrating` with the boundary named (the old name or shape, and the stored data, rollout or separately updated consumer that holds it) and the invocation as this harness writes it. It is the human's to start; you never run it. With no boundary found, end at the report.

When you run for a parent agent, make no offer: return the observed follow-up needs, and the parent decides what to offer the user.
