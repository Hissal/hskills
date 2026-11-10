# PR stack

How a stack of PRs is stored, changed, pushed, re-checked, linked and merged. Any change to one PR of a stack follows it, with or without a workflow running, so the whole stack stays consistent. Every skill that writes to a stacked PR goes through these rules and keeps no copy of them.

- [Stored form](#stored-form)
- [Changing a lower PR](#changing-a-lower-pr)
- [Pushing](#pushing)
- [The default branch moved](#the-default-branch-moved)
- [Unchanged PRs](#unchanged-prs)
- [Linking](#linking)
- [Merging](#merging)

## Stored form

A stack is one linear branch with a branch ref at each group's end. Each ref is one PR's head, and each PR's base is the PR below it; the bottom PR's base is the default branch. Each ticket's change is one commit in its group's PR.

A PR is part of a stack when its base is another open PR's head, or its head is another open PR's base. Follow that chain both ways to find the whole stack (on GitHub, `gh pr list --state open --json number,headRefName,baseRefName`). Before changing anything:

1. Fetch, and have a local branch for every ref of the stack at its remote SHA.
2. Record each ref's remote SHA (`git ls-remote <remote> refs/heads/<ref>`). The fallback restack, the moved-refs check and the push leases all use these recorded SHAs.
3. Find each ref of the stack checked out in another worktree: `git worktree list --porcelain` prints `branch refs/heads/<ref>` under that worktree's path. A rebase cannot move such a ref: `--update-refs` skips it without failing, and `rebase --onto` refuses it. When the worktree is yours and `git -C <path> status --porcelain` prints nothing, detach it (`git -C <path> switch --detach`). Otherwise another session may be working there: leave it, rewrite nothing, and report the worktree's path and ref.

**Whose stack it is** decides what you may do, by the same rule as a single PR: history is rewritten (fixup, restack, force-push) only on the owner's own stack, and only under authority that covers force-pushing. On someone else's stack, push new commits only: never rebase, amend, squash or force-push. A new commit on one of their lower PRs leaves the PRs above it without it; report each of those as needing its author's restack.

## Changing a lower PR

On the owner's stack, a change to any PR below the top goes into the commit it belongs to, and every ref above follows in one command:

1. Find the commit of the ticket whose change the finding is in. When the finding is in no ticket's change, aim at the PR's last commit.
2. On the top ref, commit the fix as a fixup of it. A fixup committed on the lower ref is not in the top ref's history, and the rebase below never sees it.

   ```
   git switch <top ref>
   git commit --fixup=<that commit>
   ```

3. Rebase the whole stack in place, non-interactively:

   ```
   git rebase --autosquash --update-refs <stack base>
   ```

   `<stack base>` is `git merge-base <default branch> <top ref>`, the commit the stack sits on, so the stack moves nowhere but takes the fixup. `--update-refs` moves every other ref of the stack in the same command, once no other worktree holds one (step 3 of [Stored form](#stored-form)). With git older than 2.44, `--autosquash` acts only on an interactive rebase; run `GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash --update-refs <stack base>`, which opens no editor.

**Git older than 2.38** has no `--update-refs`. Restack branch by branch instead, and say so in the report. Here the fixup goes on the changed PR's own ref, never the top ref, so no ref above ever holds a copy of it:

1. Commit the fix as a fixup on the changed PR's ref:

   ```
   git switch <changed ref>
   git commit --fixup=<that commit>
   ```

2. Squash it in: `GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash <its base>`, where `<its base>` is the recorded SHA of the ref below, or `<stack base>` for the bottom ref.
3. Going up the stack, move each ref onto the new ref below it: `git rebase --onto <new lower ref> <recorded lower ref SHA> <ref>`. The recorded SHA predates the fixup, so each rebase replays only that ref's own commits.

A conflict during the rebase is resolved keeping both sides' intent, then the boundary checks of every PR whose patch changed run again (see [Unchanged PRs](#unchanged-prs)).

## Pushing

First check that the restack moved every ref it had to. A ref left behind fails one of these:

- Each ref is an ancestor of the ref above it: `git merge-base --is-ancestor <lower ref> <upper ref>` exits 0.
- Each ref at or above the lowest changed PR differs from its recorded SHA.

When one fails, push nothing. Free the ref by step 3 of [Stored form](#stored-form), point it at the commit of the rewritten top ref that replaced its old head, the one with the same subject in `git log --format='%H %s' <stack base>..<top ref>` (`git branch -f <ref> <that commit>`), and check again. Once both hold, push every ref of the stack in one atomic push, with an explicit lease per ref, each `<recorded sha>` being the remote SHA recorded before the rebase:

```
git push --atomic <remote> \
  --force-with-lease=<ref 1>:<recorded sha 1> \
  --force-with-lease=<ref 2>:<recorded sha 2> \
  <ref 1> <ref 2>
```

A bare `--force-with-lease` is not enough: a background fetch moves the remote-tracking ref and quietly defeats it. When a lease fails, the atomic push lands nothing: fetch, inspect the other pusher's commits and reconcile with them. Their work is never overwritten.

## The default branch moved

On the owner's stack, rebase the whole stack onto it in one command, under authority that covers force-pushing, then push as in [Pushing](#pushing):

```
git switch <top ref>
git rebase --update-refs <remote>/<default branch>
```

With git older than 2.38, restack branch by branch by step 3 of the fallback in [Changing a lower PR](#changing-a-lower-pr), starting with `git rebase --onto <remote>/<default branch> <stack base> <bottom ref>`.

On someone else's stack, only the bottom PR merges the default branch in, as a new commit. Report each PR above it as needing its author's restack.

## Unchanged PRs

A PR's patch-id is:

```
git diff <base> <head> | git patch-id --stable
```

Take it for every PR of the stack before and after a restack. A PR whose patch-id is unchanged keeps its boundary-check and `verifying` results, which are recorded in its body's Evidence section; it is not re-checked. A PR whose patch-id changed has lost them: its Evidence names the tree they ran on, and its checks run again before any result is claimed for the new head. Until they pass, the gap goes on its **Not done** line.

## Linking

Each PR body is written by the main skill's rules and links only its own group's tickets, by the [Issue links](../SKILL.md#issue-links) rule. A ticket that did not merge stays `Refs` in its group's PR; a group with no merged ticket gets no PR.

The spec is linked by position:

- **The top PR** closes the spec once every ticket with a group is `Closes` in some PR of the stack. It also closes every ticket whose group is `none`: those produce no commits, and their evidence is about the code the stack lands. They are not members of the top group.
- **Every other PR** refs the spec.

Every PR merges into the default branch when the stack merges, so each PR's keywords take effect. Where the tracker does not close work through PRs, tickets and the spec are resolved the tracker's way.

## Merging

The owner merges the whole stack in one go, once every PR is ready. No agent merges any PR of a stack, in any order, and nothing merges bottom-up as PRs settle. Before handing the stack over, set every PR's links by [Linking](#linking) and report each `Refs` and each human check still open.
