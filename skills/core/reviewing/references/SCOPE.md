# Scope contract

How each scope source resolves to a target, a base and a snapshot. The precedence (explicit request, then caller scope, then bare default) is in `SKILL.md`; this file resolves whichever source won.

- [Explicit scopes](#explicit-scopes)
- [Bare invocation](#bare-invocation)
- [Current work](#current-work)
- [Recording the snapshot](#recording-the-snapshot)

## Explicit scopes

A scope the user names, or one a caller supplies exactly, is used as named.

- **PR**: its recorded base and head (`gh pr view <n> --json baseRefName,baseRefOid,headRefName,headRefOid`). The diff runs from the merge base of base and head to the head. Local work stays out unless the user asks for it. When the checkout is not at the PR's head, review the PR's head and say so.
- **Branch**: the branch's commits over its merge target, found as in [Bare invocation](#bare-invocation) steps 2 and 3.
- **Commit range**: exactly the named revisions, read as written (`A..B` and `A...B` differ).
- **Files or a subsystem**: those files in their current state, whole. No base unless the user names one.
- **Session only**: needs reliable evidence of what this session changed: a starting snapshot (the commit, status or stash recorded when the session began) and the edits this session made, tracked in this conversation. A dirty tree alone is not that evidence: it may hold work from before the session. Without the evidence, offer a concrete alternative scope instead, such as "the 3 uncommitted files against `HEAD`" or "commits since `<sha>`", and wait for the user's choice.
- **Recent activity** ("what changed most lately"): the [hotspot survey](HOTSPOTS.md), even when work is pending.

## Bare invocation

With no explicit or caller scope, the review is a review of current work: the committed pending work plus every local change, judged as described in [Current work](#current-work). Find the base and the pending commits in this order. Stop at the first step that settles it.

1. **Open PR.** When the current head has an open PR (`gh pr view --json number,baseRefName,baseRefOid,headRefOid`, or `gh pr list --head <branch>`), compare against the PR's actual base from its merge base with the head. Local changes stay in: only an explicit PR scope leaves them out. Several open PRs for one head: ask which.
2. **Merge target.** With no PR, take the intended merge target from the request, the project's conventions (contributing docs, agent instructions, branch-naming rules), or reliable branch or PR context such as a stacked branch's recorded parent. The repository's default branch is the conventional target when nothing names another. A branch's own remote copy (`origin/<same-branch>`) tracks the branch and is never its merge target. Several plausible targets: ask one question naming them.
3. **Pending commits.** The head's commits over the merge base with the target. Establish them from history, never from branch names alone:
   - A PR from this branch that is confirmed merged (`gh pr list --head <branch> --state merged`) excludes its merged work, squash and rebase merges included; compare from the merged PR's head (`headRefOid`), so only later commits remain candidates.
   - When history cannot settle whether work has landed (rewritten commits, no PR record, `git cherry` unclear), ask rather than guess.
   - A detached checkout follows the same rules: find its PR or target from the commit itself (`gh pr list --search <sha>`, `git branch -a --contains <sha>`).
4. **Local changes.** On the default branch, or on a fully merged branch, the local changes are the pending work, against `HEAD`.
5. **Nothing pending.** Run the [hotspot survey](HOTSPOTS.md).

When the pending work clearly does not bear on the calling review's concern, the [hotspot survey](HOTSPOTS.md#when-the-survey-runs) says what to offer instead.

## Current work

A bare invocation is an implicit current-work review. It assesses the combined resulting state: committed pending work plus staged, unstaged and untracked source files, against the base. One way: `git diff <merge-base>` for tracked files and `git ls-files --others --exclude-standard` for untracked ones.

The announcement keeps the three kinds apart, with counts; findings judge the current code, never an intermediate staged state.

## Recording the snapshot

Record what was inspected before reviewing:

- the base, merge-base and head SHAs, or the range's revisions;
- the local state: `git status --porcelain` counts of staged, unstaged and untracked files, and whether they are in scope.

Before reporting, check `HEAD` and `git status` again. A new commit, a moved base or a changed in-scope file is a material change: say what changed and refresh the findings it touches.
