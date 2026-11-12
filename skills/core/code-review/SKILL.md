---
name: code-review
description: "Use when the user wants code changes reviewed for problems: a branch, a pull request, or their work in progress, such as before opening a PR."
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.hskills/code-review"
  agent-skills-sync.requires: '["hissal.hskills/reviewing"]'
  opencode/autoinvoke: "true"
---

Review a change along independent axes:

- **Standards**: does the code follow this project's documented coding standards?
- **Spec**: does the code do what the originating issue or spec asked for?
- **Failure**: where the code fails, does it fail loudly, or silently with a wrong result?

Each axis runs as its own **parallel sub-agent**, so none pollutes another's context; this skill then reports their findings side by side, apart and unranked.

The review is read-only. It changes nothing in the project, runs no check, and does not call `verifying`. Sorting and fixing findings belong to `receiving-review`.

Before doing any work, load reviewing (hissal.hskills/reviewing) and its needed
reference files through the installed skill listing. Begin work only after all
requirements and needed references have loaded. If any cannot load, stop
without partial work and print:

Stopped: required skill reviewing (hissal.hskills/reviewing) could not be loaded
completely. Unavailable: <unloadable-material>. Ordinary installers such as
`npx skills` do not install requirements; `agent-skills-sync` resolves them
from this metadata. Install or repair the requirement, then retry.

Check only whether the required material loads; the installer verifies identity
and content. Loading this requirement grants no permission to invoke a
user-invoked workflow; wait for the human to invoke that workflow.

## Process

### 1. Settle the scope

Resolve the scope through `reviewing` and announce its target, base and snapshot in `reviewing`'s shape before reviewing. An explicit or caller scope is reviewed as resolved. On a bare invocation, pending work is always reviewed when there is any, never swapped for the survey; with nothing pending, `reviewing`'s hotspot survey picks the areas. Its [scope contract](../reviewing/references/SCOPE.md) settles every case.

Done when the announcement is out.

### 2. Capture the patch once

Capture one patch and the commit list for the announced scope, once, and write both to files in the OS temp directory, outside the checkout:

- **A PR or a branch**: `git diff <merge-base> <head>` and `git log --oneline <merge-base>..<head>`.
- **A commit range**: exactly the revisions as named, read as written (`git diff A..B` and `git diff A...B` differ), with the matching `git log --oneline`.
- **Current work**: `git diff <merge-base>` for tracked files, plus each untracked file from `git ls-files --others --exclude-standard` as a new-file diff (`git diff --no-index /dev/null <file>`). Untracked files belong in every review of uncommitted work.
- **No base** (named files, a subsystem, survey areas): the file list at the recorded snapshot stands in for the patch.

Every reviewer gets these same files, unchanged; no reviewer captures its own. A git error or an empty patch stops the review here and is reported as what it is; a git error never reads as "no changes". Use plain git; no packaging script.

### 3. Find the spec

Take the first source that gives one:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`), fetched from the issue tracker the project's configuration names.
2. A path or issue the user passed as an argument.
3. A spec file under `docs/`, `specs/` or `.scratch/` matching the branch name or feature. A spec found this way is a guess: announce it as a guess, naming the file.
4. Ask the user where the spec is. If there is none, skip the Spec reviewer and report "no spec available".

### 4. Find the standards sources

List every file that documents how code is written in this project: `CODING_STANDARDS.md`, `CONTRIBUTING.md`, agent instructions, and the project coding guide and tooling configuration the project's instructions point to. Tooling configuration shows what linters and formatters already enforce, which the review skips.

On top of what the project documents, the Standards axis always carries the **smell baseline**: a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when the project documents nothing. Two rules bind it:

- **The project overrides.** A documented project standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code**: the same logic shape at two real call sites in the change, after checking the codebase for an existing helper that already does it. → call the existing helper; else extract the shared shape and call it from both.
- **Platform Already Provides This**: the change hand-rolls what the language, standard library, framework or an existing dependency already provides. → use the provided one.
- **Feature Envy**: a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps**: the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change**: one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 5. Spawn the reviewers in parallel

Issue every reviewer call together, in the foreground, each sub-agent starting with a fresh context window, and aggregate the reports they return. Dispatch them however small the patch: separate contexts are what keep the axes independent. The reviewers have no other access to this skill or to `reviewing`, so each brief carries in full:

- the announced scope, and the paths of the patch and commit-list files from step 2;
- the evidence rules and the out-of-scope observations format from `reviewing`, pasted in full;
- the reporting rules: findings only, never restate the diff; mark each finding **hard** or **judgement call**; no confidence scores or ratings;
- the security-finding procedure, when it is installed (see _Security findings_);
- the axis brief below, with its not-to-report list.

Before the first reviewer call, load `delegating` with the Skill tool, describing each reviewer's role: it reads the personal delegation policy, which may put reviewers on another harness than yours. Each reviewer's model, harness and effort come from it. When it is not installed, say so once and dispatch with the host's own subagent tool, honouring anything the user stated about model, harness or effort. The three roles may run on different models; each axis still gets exactly one reviewer.

**Standards brief**:

- The standards-source files from step 4, plus the smell baseline pasted in full.
- "Report, per file or hunk: (a) every place the change breaks a documented standard, citing the file and the rule; and (b) any baseline smell, named, quoting the hunk. A documented breach can be hard; a baseline smell is always a judgement call, and a documented project standard overrides the baseline. The project's standards apply to test files exactly as to production files."
- "Ask the project's listed pack guides for reviewing stack-specific code: serialized data, build and assembly setup, lifecycle, tests; use only what the change touches, cite the guide and its rule, and let the lookup start nothing else."
- Not to report: anything tooling enforces; preferences no documented standard or baseline smell backs; whether the change does what was asked (the Spec axis).

**Spec brief**:

- The spec's path or fetched contents, and whether it was found by guessing.
- "Report: (a) requirements missing or only partly met; (b) behaviour the spec did not ask for (scope creep); (c) requirements that look implemented but where the implementation looks wrong; (d) **changed**: the goal is met by a different approach than the spec describes; (e) **unverifiable**: the change cannot show whether the requirement is met, such as anything that must be run and observed. Quote the spec line for each finding."
- "Code that handles a deliverable is not the deliverable: plumbing for a feature does not meet a requirement for the feature."
- "A decision the spec records as settled ('chosen over') is challenged only on evidence that it cannot work, never on preference."
- "Ask the project's listed pack guides for what a diff cannot prove for this stack, and report those requirements as unverifiable; let the lookup start nothing else."
- Not to report: style or standards (the Standards axis); open questions the spec itself leaves open, as missing work.

**Failure brief**:

- Nothing from steps 3 and 4: no spec and no standards. The Failure reviewer runs on every review, a review with no spec included.
- "Walk each changed path through its happy, missing, empty and upstream-error cases, and report where a failure goes silent: a swallowed error; a silently wrong result; a side effect missed on one branch; an event or notification fired only on success; an empty handler; a handler that only logs and continues; a default returned in place of a failure; a silent skip."
- "Trace outside the diff wherever a failure leads. Three cases always prompt a trace: a new value or constant, traced through every consumer; shared state across an `await`, with both orders shown; a change that is itself a guard (a test, a mock, a CI gate), asked whether it fails loudly or passes silently. These prompt tracing and never limit it."
- "A finding is a judgement call unless its quoted line comes with a concrete consequence: the input, the path and the wrong outcome."
- "Ask the project's listed pack guides for failure modes specific to the stack; let the lookup start nothing else."
- Not to report: failures that already surface to the caller or user (a raised error, a failing exit code); style or standards (the Standards axis); whether the change does what was asked (the Spec axis).

With no spec available, skip the Spec reviewer; Standards and Failure still run.

**Security findings**: check the installed skill listing for `receiving-review` (`hissal.hskills/receiving-review`). When it is installed with its `references/SECURITY-FINDING.md`, paste that procedure into every brief, and have each reviewer assess any security finding with it before reporting, giving the finding its verdict. When it is not installed, proceed without it; it is never a requirement.

### 6. Aggregate

Present each axis under its own heading (`## Standards`, `## Spec`, `## Failure`), verbatim or lightly cleaned. Do **not** merge or rerank findings across axes, because the axes are deliberately separate (see _Why three axes_).

- Missing coverage, as `reviewing`'s evidence rules define it, goes under the heading of the axis it belongs to.
- A skipped Spec axis reads "no spec available".
- Gather every reviewer's out-of-scope observations into one **Out-of-scope observations** section after the axes, in `reviewing`'s format; pre-existing entries are not counted.

End with a one-line summary: findings per axis (Standards, Spec and Failure; hard and judgement call), and the worst issue _within each axis_, if any. Pick no single winner across axes: that is the reranking the separation exists to prevent.

### 7. Suggest at handback

After the report, offer a follow-up only when its condition was observed in this review, giving the concrete reason and the invocation. Each one offers; none runs:

- `/blast-radius` when a consequential downstream dependency or safety assumption, named, cannot be established through permitted inspection. Name the missing evidence.
- `/second-opinion` when a consequential claim stays disputed or uncertain after checking the evidence, and the answer could change acceptance. Explain the competing interpretations.
- `/test-review` on evidence of a broader test-quality problem outside the current task, naming the area and an example. Touching tests or low coverage alone is not that evidence. This review never runs `test-review` itself.
- `/constraints` when a recurring or consequential quality requirement, evidenced here, needs an enforceable check.
- `/dependency-audit` on a consequential supply-chain concern beyond the current task. A dependency change alone is not that concern.
- `/handoff` when the owner chooses to defer or hand over fixing findings whose evidence would be costly to rebuild.

Known concrete defects stay in the findings whether or not a suggestion is offered. With no condition observed, end at the summary.

Run for a caller (a workflow that started this review), make no offer: return the observed follow-up needs with the report, and the caller decides what to offer the owner.

## Why three axes

A change can pass some axes and fail another:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**
- Code that follows the standards and matches the spec but fails silently → **Standards pass, Spec pass, Failure fail.**

Reporting them separately stops one axis from masking another.
