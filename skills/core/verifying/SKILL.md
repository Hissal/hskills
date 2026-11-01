---
name: verifying
description: Use before claiming work is done, fixed or passing, and when an agent's report or a measured number needs confirming.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/verifying"
  opencode/autoinvoke: "true"
---

# Verifying

A claim is what you say about the work; evidence is what you showed. Say only what the evidence shows, tie every result to the tree it ran on, and give every claim a status word.

Done when every claim you hand back carries its evidence and a status word, every check you ran has its command, tree and real exit code recorded, the floor guard has run on the final tree when the project configures one, and what you did not check is named with the reason.

## 1. List the claims

Write down each claim you are about to make (done, fixed, passing, faster, "the delegate finished") and the evidence the table asks for. Read [the definition of done](references/DEFINITION-OF-DONE.md) before any completion claim. Read [a reported number is a claim](references/NUMBERS.md) before you report, trust or act on any measured number.

| Claim | Needs | Never enough |
|---|---|---|
| It builds or compiles | the build's exit 0 on this tree | a clean lint, an editor showing no errors |
| Tests pass | the declared suite's exit 0 and its counts on this tree | an earlier run, a subset reported as the suite, an expectation |
| Lint or types are clean | the tool's exit 0 | parsed output that lists no findings |
| The bug is fixed | the original symptom reproduced before the fix and gone after it | changed code, an unrelated test going green |
| A test guards the fix | the test red without the fix and green with it | one green run of the test |
| A delegate finished | the real diff read against the task, then your own checks on the resulting tree | the delegate's report |
| The requirements are met | each requirement checked against the diff or a run | a green suite |
| It is faster or slower | a verdict from the number reference | one run, a projection |
| It works for a user | reproduced in the running app | unit tests alone |

A delegate's report is a claim on the lowest rung of the [evidence ladder](#evidence-ladder). Read the diff yourself (`git status`, `git diff` against the task's base) and look for what the task asked for and the diff lacks.

## 2. Choose the checks

`verifying` owns which checks run. Take the project's checks from its check-commands file, linked from the `## Agent skills` block in `AGENTS.md` or `CLAUDE.md`: each command, what it checks and its cost tier. With no such file, take the commands from the project's own build and CI configuration and say where they came from.

Start from the cheapest check that covers what the change can reach at runtime, and climb a tier only when the cheaper check cannot reach the failure mode in question. Enter an expensive gate (a full suite, a full build, a device or browser run, another agent's review) when the change needs it; a skill mentioning the gate is no reason to enter it. A rule kept for reproducibility, safety or irreversible cost is part of covering the change.

Ask the project's listed pack guides for checking a change compiles or works. Before a ship or release claim, ask them for ship-readiness for this kind of project. Before measuring, ask them for measuring performance for this stack. A pack answer is knowledge for this check and never starts a pack workflow; when no guide answers, carry on with these rules.

## 3. Run and capture

For each check:

- **Name the tree.** Record the commit (`git rev-parse --short HEAD`) and whether the tree is dirty (`git status --porcelain` prints anything). A dirty tree is written as dirty, `abc1234 + uncommitted changes`, never as the bare hash.
- **Exit code first.** Record the checker's real exit code before any parser, filter or pipe reads its output. A pipeline reports its last command's status (`| tail`, `| grep`), so run the checker alone with its output in a log, or set `pipefail`.
- **Non-zero is red.** A non-zero exit is a failure whatever the output says. Output that parses clean beside a non-zero exit is a failure with an open question, never a pass.
- **Missing is red.** A missing tool (command not found, exit 127, an absent binary) is a failure, not a skip. A declared check that cannot run is a blocker.
- **Capture is evidence too.** A log that was not written or a parser that failed is an error, never clean.

## 4. Keep results on their tree

A result belongs to the tree it ran on. Once the tree changes (an edit, a rebase, a delegate's commit), every earlier result is stale until it runs again. Report a stale result as stale with the tree it ran on, or rerun it. A commit that leaves the content unchanged keeps its results: the tree hash (`git rev-parse HEAD^{tree}`) is the same.

## 5. When a check is red

A failure is the branch's fault unless you show otherwise. Showing otherwise means running the same check on the base tree (the merge-base, in a separate checkout so the working tree stays as it is) and getting the same failure. Anything less is ambiguous, and ambiguous counts as in-branch.

- **In-branch failure:** stop the work that builds on it, then fix it or report it as a blocker.
- **A declared suite cannot run:** the claims it would back are unvalidated. Report the blocker in prose with its command, tree and exit code.
- **Pre-existing failure:** keep its fix out of the branch's change.
  - Unattended: put it on the PR's **Not done** line with the evidence that it is pre-existing (base commit, command, exit code, what failed), and carry on.
  - With the owner present: put the choice to them: fix it in a separate commit, record it, or knowingly skip it.

## 6. Floor guard at task end

When the check-commands file names a floor-guard command, run it at task end on the final tree, after the last edit. Exit 0 is clean. Exit 1 is a violation, a red in-branch failure. Exit 2 means the guard could not run: a blocker, never read as 0. With no floor guard configured, write "floor guard: none configured" in the report.

## 7. Report

Give each claim one status word:

- **verified**: ran on a named tree, the current one, with a passing exit.
- **stale**: ran on a tree that has since changed.
- **unvalidated**: no run backs it; it rests on reading or reasoning (ladder rungs 1 to 3).
- **inconclusive**: a run happened but cannot settle the claim, such as a number that fails the number reference or a result that does not reproduce.
- **not measured**: a performance or metric claim with no tool data; each such finding is labelled *potential impact*.

A red check is reported as failed, with its command, tree and exit code. A check that cannot run leaves its claims unvalidated, and the report names the blocker in prose. A claim the evidence contradicts, such as a delegate's "done" against a diff that lacks part of the task, is reported as failed with that evidence.

- List each check as command, tree, exit code and counts.
- Say what was not investigated, and why.
- Give observed numbers exactly as measured. Give projections as rough magnitudes ("tens of milliseconds", "a few times slower"), never as precise figures.

Running as a delegate, hand back the evidence and any follow-up needs; the parent owns the recommendations the user sees.

When changed installation, public entry points or quickstart behaviour leave a consequential consumer scenario unproven by these producer-side checks, ask the project's listed pack guides for ship-readiness for this kind of project, and at handback suggest the fresh-consumer review they name, with the package, version and scenario. The required checks still complete, or the report says plainly that verification is incomplete.

## Evidence ladder

Grade each claim about what code does by the highest rung it reached. Climb as far as the cost allows, and report the rung reached:

1. **"You said so."** An assertion with nothing behind it.
2. **"Pointed at the line."** You cited the exact place: a `file:line` in the project, or in the dependency's source at the version in use.
3. **"Showed the bad case can't happen."** You traced how the failure would have to happen and showed each route to it is closed.
4. **"Ran it."** You executed the real code in a test or throwaway script built to fail if the claim is false.
5. **"Reproduced it in the running app."**

The ladder grades claims about code behaviour only. Claims about sources, history or why code is shaped as it is take confidence tiers, a separate scale; the two never merge.
