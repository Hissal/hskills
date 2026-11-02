---
name: implement
description: "Implement a piece of work based on a spec or set of tickets, then open a pull request for it."
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/implement"
  opencode/autoinvoke: "false"
---

Implement the work described by the user in the spec or tickets. Build what it asks for, in full, and nothing more.

Done when every requested behaviour is built, every acceptance criterion carries a status from `verifying`, every review finding has a disposition from `receiving-review`, and the work is pushed to a pull request (or the branch is reported when no PR applies).

Project facts come from project configuration: the files linked from the `## Agent skills` block in `AGENTS.md` or `CLAUDE.md`. Ask the project's listed pack guides for how often to run tests and checks; take the answer as this work's cadence, and carry on silently with the cadence in step 3 when none answers.

The calls below to `tdd`, `diagnosing-bugs`, `research`, `verifying`, `code-review`, `receiving-review` and `pr` are process calls, not requirements: when one is not installed, say so once and carry on doing its part as the step describes.

## 1. Read the work

If the user passes a ticket reference, fetch it from the issue tracker the project's configuration names and state its title before starting. If the reference is ambiguous, ask. When the project's configuration names no tracker, tell the user to run `/setup-project`, and work from what the user supplies.

## 2. Choose the branch

Work on the current branch when it fits: it is not the default branch, and its name or its commits ahead of the base relate to the ticket, or it is the ticket's existing PR branch. Otherwise fetch, and create a branch from the up-to-date default branch, named by the repo's branch convention.

- When the fit is unclear, ask once.
- When uncommitted changes unrelated to the ticket are present, stop and ask before switching branches.

## 3. Build

Before coding, read the project's selected coding guidance and its applicable tooling configuration (linter, formatter, compiler and analyzer settings) through the guidance pointer in project configuration. Where the two disagree, the tooling configuration wins; note each conflict for the report.

- **Reuse.** Before writing new code, look for what already does the job: the repo, then the standard library, then the platform, then the installed dependencies.
- **Sizing.** Build each mechanism nobody asked for (a cache, a retry, a fallback, an option, a layer of abstraction) only when a contract requires it, harm would land uncaught without it, or adding it later would be expensive. Otherwise leave it out and list it in the report as considered and not built, with the reason. The requested behaviour stays whole; a safeguard fits around it.
- **Tests.** Call the Skill tool with `tdd` where possible, at pre-agreed seams.
- **Cadence.** Run typechecking regularly, single test files regularly, and the full test suite once at the end. Take the commands and their cost tiers from the project's check commands in project configuration.
- **Two failed fixes.** After two failed fixes for the same check, stop patching: call the Skill tool with `diagnosing-bugs` and find the cause before the next change.
- **Research.** When the work turns on a fact only external primary sources settle, call the Skill tool with `research`.

## 4. Verify

Before claiming the work compiles, works or is done, call the Skill tool with `verifying`; it owns which checks run and what each claim needs. Check every acceptance criterion through it. A criterion it cannot verify is a gap, named with its reason.

## 5. Review

Once done, call the Skill tool with `code-review` to review the work. Handle its findings by calling the Skill tool with `receiving-review`, which judges each one and verifies every fix. When the fixes change the tree, rerun through `verifying` the criteria checks they made stale, so every status belongs to the tree you push.

## 6. Open the pull request

Commit by the repo's convention, push, and open a PR whose body you write by calling the Skill tool with `pr`.

- **Ready** and closing the ticket only when `verifying` verified every acceptance criterion.
- **Draft** otherwise: it links the ticket without closing it, and the gaps go on `pr`'s Not done line.
- **Existing PR.** When the branch already has a PR, push to it and update its body; never open a second one.
- **No PR.** With no remote, a project that does not close work through PRs, or the user saying no PR, skip the PR and report the branch.

## 7. Report

Give the branch and the PR link, or the branch and why no PR was opened; each acceptance criterion with its status from `verifying`; the review findings and their dispositions; what was considered and not built, with reasons; and any conflict between coding guidance and tooling configuration.
