---
name: prune-landed
description: Delete the local branches, worktrees and stashes whose work has landed on the default branch, and keep everything not proven landed.
disable-model-invocation: true
argument-hint: "Nothing, or a remote other than origin"
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.hskills/prune-landed"
  opencode/autoinvoke: "false"
---

# Prune landed

Clean a local clone: delete each local branch, worktree and stash whose work has **landed** on the default branch, and keep the rest. Landed means proven by the plan script or, for an unresolved branch, by the merged PR or target commits you name. Remote branches are out of scope.

Done when every record in the plan is deleted, kept, skipped or left unresolved as the user confirmed, and your report gives each one's outcome and the restore list's path.

## Guardrails

These hold for every step:

- **Keep what is not proven landed.** Delete only what the plan marks `landed`, or an unresolved branch you settled in step 3. The default branch and any branch an open PR uses are never touched; the plan keeps them.
- **Confirm before each destructive step.** Each of step 6's three deletions waits for the user's yes to the exact list it removes. With no way to ask, or no answer, delete nothing and end with the question.
- **Save before you delete.** Write the restore list (step 5) before the first deletion.
- **Stop without the pull requests.** When the remote has pull requests you cannot read, stop and say what access is missing: without them the open-PR guard cannot hold.

## 1. Gather the facts

- **Target.** Fetch the remote (`origin` unless the user names another), then run `git remote set-head <remote> --auto`, so `<remote>/HEAD` names its current default branch. That branch is the target.
- **Pull requests.** On GitHub, list the PRs of the remote's own repository (its `host/owner/repo`, from `git remote get-url <remote>`; without the host, `gh` reads its default host) to a file: `gh pr list --repo <host/owner/repo> --state all --limit <n> --json number,state,headRefName,headRefOid,baseRefName`. Start with a limit of 10000 and raise it until the list comes back shorter than the limit, so no open PR is missing. When the remote is a fork (`gh repo view <host/owner/repo> --json isFork,parent`), add to the file every open PR of its parent whose head is in the fork: list the parent's open PRs the same way with `headRepositoryOwner` added, and keep those whose `headRepositoryOwner.login` is the fork's owner. Leave out the parent's merged PRs: they landed on the parent, not on the fork's default branch. Then fetch each merged PR's head by name, with no destination, so no ref is created: `git fetch <remote> refs/pull/<n>/head ...`, a few hundred per command. On another forge, write the same JSON from its API. When the remote has no pull requests at all, the plan runs with `--no-prs`.

## 2. Plan

Run [`prune-plan.py`](scripts/prune-plan.py) by its absolute path with `--help` first; never read it. It needs Python 3 (`python3`, or `python` on Windows) and git 2.38 or later. It reads the repository and prints one record per branch, worktree and stash with its verdict (`landed`, `keep`, `unresolved` or `skipped`) and the check or reason that decided it. It changes nothing.

A `warning:` about missing PR heads means step 1's fetch did not bring them: fetch them and plan again.

## 3. Settle the unresolved branches

For each `unresolved` branch, compare its unique commits (`git log <target>..<branch>`, and their diffs) with what landed: the PR its record names, later squash commits on the target, and the target's current content of each file the branch changes. It has landed when a merged PR or commits on the target hold every change it makes, the same or later; name that PR or commit. Otherwise keep it, saying what has not landed. A worktree whose only reason is `branch-unresolved` follows its branch.

## 4. Check the worktrees still in use

Every worktree to remove may belong to a running session. Where the harness lets you ask whether a thread or session still uses a worktree, ask it, and keep each worktree in use. Otherwise the confirmation in step 6 lists each worktree by path, and the user answers for each.

## 5. Save the restore list

Write a restore list to `prune-<date-time>.txt` in the repository's common git directory (`git rev-parse --git-common-dir`): every local branch's name and SHA, each worktree to remove with its path and HEAD, and each stash to drop with its SHA and message. Tell the user its path and the restore commands:

- a branch: `git branch <name> <sha>`
- a worktree: `git worktree add <path> <branch or sha>`
- a stash: `git stash store -m "<message>" <sha>`

These work until `git gc` prunes the commits nothing else reaches, two weeks by default (`gc.pruneExpire`). Say so with the path.

## 6. Delete, one confirmed step at a time

Show the plan's outcome as three lists (worktrees, branches, stashes), each record with its verdict and the check, reason or PR that decided it, then the kept, skipped and unresolved records with their reasons. Ask for each list before acting on it, in this order:

1. **Worktrees.** With each, list its ignored files (`git -C <path> status --ignored --short`): removal deletes them, and no stash keeps them. Just before removing one, check that its HEAD is still the planned one and its status still matches the plan; when either changed, keep it and plan again. When it has uncommitted changes, `git -C <path> stash push -u -m "prune: <path>"` and add the stash to the restore list. Then `git worktree remove <path>`. Clear `missing` worktrees with `git worktree prune` only when `git worktree prune --dry-run --verbose` names exactly the confirmed ones; otherwise leave them. A removal git refuses stays, with git's reason in the report.
2. **Branches.** Leave out each branch still checked out in a worktree (`git worktree list`): one the user kept, or one git refused to remove. Delete the rest with `git update-ref -d refs/heads/<name> <planned sha>`, so a branch that moved since the plan stays.
3. **Stashes.** Run the plan again, and drop only stashes it marks `landed`, the stashes step 6.1 made included. Drop by SHA, finding each one's current `stash@{n}` just before its drop, highest index first.

## 7. Report

Give each record's outcome: deleted, kept, skipped or left unresolved, with its reason, and each unresolved branch settled in step 3 with the PR or commit that holds its work. End with the restore list's path.
