# PR stack

How a stack of PRs is stored, changed, pushed, re-checked, linked and merged. Any change to one PR of a stack follows it, with or without a workflow running, so the whole stack stays consistent.

**The owner merges the whole stack in one go**, once every PR is ready. No agent merges any PR of a stack, in any order, and nothing merges bottom-up as PRs settle; [Merging](#merging) covers the handover.

- [Stored form](#stored-form)
- [Changing a lower PR](#changing-a-lower-pr)
- [Pushing](#pushing)
- [The default branch moved](#the-default-branch-moved)
- [Unchanged PRs](#unchanged-prs)
- [Linking](#linking)
- [Merging](#merging)

## Stored form

A stack is one linear branch with a branch ref at each PR's head. Each PR's base is the PR below it; the bottom PR's base is the stack's **trunk**, usually the default branch.

A PR is part of a stack when the host has linked it into a native stack (on GitHub, a Stack), or when its base is another open PR's head, or its head is another open PR's base. The host's stack, where there is one, lists the whole stack in order; otherwise follow the chain both ways through the open PRs, with their head and base branches. Chaining makes any PR a member, whoever opened it and from whatever repository; which members' refs may be rewritten is decided PR by PR, under **Whose stack it is** below. `<remote>` is where the stack's branches live; `<upstream>` is the repository the PRs merge into, which is the same remote unless the stack lives on a fork.

**Whose stack it is** decides what you may do, PR by PR, by the same rule as a single PR. A PR's ref is rewritten (carried, force-pushed) only when its head lives in `<remote>`'s repository and is neither the trunk nor the default branch, the PR is the owner's own (on GitHub, `gh pr view <n> --json headRepositoryOwner,headRepository,author`), and authority covers force-pushing. A stack can mix authors: from the lowest PR that fails this rule upward, the stack is someone else's, and the carry, restack and force-push stop below it, so the top ref is the highest PR you may rewrite. Without force-push authority, treat the owner's whole stack like someone else's, and ask for it when a fix needs a restack. On someone else's stack, push new commits only, and only to a PR you may change: never rebase, amend, squash or force-push. A new commit on one of their lower PRs leaves the PRs above it without it; report each of those as needing its author's restack.

**The commands.** On the owner's stack, every fetch, carry, check and push goes through [`pr-stack.py`](../scripts/pr-stack.py), never through hand-run git, and on GitHub too: `gh stack` overwrites pushes that land after your fetch, so it is used only for [linking](#linking). It needs Python 3 (`python3`, or `python` on Windows) and git. Run it by its absolute path with `--help` first; never read it. Name the stack's refs bottom to top, up to the top ref:

```
pr-stack.py sync [--remote <remote>] [--upstream <upstream>] [--trunk <trunk>] <bottom ref> ... <top ref>
```

Run `sync` before changing anything; it records each ref's remote SHA, and the carry and the push leases use that record, so a push landing after it fails instead of being overwritten. Its `safe: no` names what to settle first:

- `held: <ref> <path>`: another worktree has the ref checked out. When that worktree is yours and `git -C <path> status --porcelain` prints nothing, detach it (`git -C <path> switch --detach`) and sync again. Otherwise another session may be working there: leave it, rewrite nothing, and report the worktree's path and ref.
- `unpublished: <ref>`: the local branch holds commits the remote lacks. Rewrite nothing: reconcile it or report it, then sync again.

`outside:` and `merges:` lines need nothing from you: the carry goes branch by branch for them, and a stack with merge commits comes out linear. Say so in the report.

## Changing a lower PR

A fix goes onto the PR it belongs to as a new commit on that PR's own ref. Existing commits are never amended, squashed or reordered, so each push shows reviewers exactly what changed. A fix to the top PR is an ordinary commit and push. A fix to any PR below it also has to reach every ref above, which moves those refs onto the changed one: on the owner's stack only. After `sync`, commit the fix on the changed ref, then:

```
pr-stack.py carry <changed ref>
```

The changed ref and every ref below it keep their commits. When several PRs change, go bottom first: commit and carry for each changed PR in turn, then push once. A commit someone else already pushed to a lower PR, leaving the refs above it behind, is carried the same way: `sync` has already put it on the changed ref.

After a conflict, `carry` stops with the rebase in progress: resolve the files, `git add` them, and run `carry --continue`; or `carry --abort`, which puts every ref back. The checks of every PR whose patch changed then run again (see [Unchanged PRs](#unchanged-prs)).

## Pushing

```
pr-stack.py push
```

It checks that the carry moved every ref it had to, pushes every ref in one atomic push leased at the recorded SHAs, and on a failed check puts the refs back and pushes nothing; carry again. When a lease fails, nothing landed: sync, inspect the other pusher's commits and reconcile with them. Their work is never overwritten.

On someone else's stack there is no restack and no `pr-stack.py`: push only the PRs you added commits to, without force, each to the repository its head lives in (`git push <remote> <ref>` when that is `<remote>`), and report each PR above them as needing its author's restack.

## The default branch moved

This covers the stack's trunk, the bottom PR's base, moving. On the owner's stack, under authority that covers force-pushing, move the whole stack onto it after `sync`, then push:

```
pr-stack.py carry --trunk
```

On someone else's stack, change nothing when the trunk moves: report that the stack needs its author's restack.

## Unchanged PRs

A PR's patch-id is:

```
git diff <base> <head> | git patch-id --verbatim
```

`--verbatim` keeps whitespace, so an indentation change that alters behaviour changes the patch-id. Take it for every PR of the stack before and after a restack. A PR whose patch-id is unchanged keeps the results in its body's Evidence section that judge its own change alone, such as acceptance criteria checked against its diff: that change did not move. Its check results stay with its old head, because the code beneath it changed, and a changed value below can break an unchanged PR above. A PR whose patch-id changed has lost both: its Evidence names the tree they ran on, and its criteria are checked again on its new head.

Before the push, run the checks once, on the top ref, whose tree holds every PR's change: the checks the stack's Evidence ran (the project's checks, when it names none). After the push, each PR's own CI re-checks its head. A PR that gets no CI run of its own, such as a draft its CI skips or a PR in a project without CI, has its checks run on its head instead. A PR claims no check result for its new head until its checks pass there; until then the gap goes on its **Not done** line.

## Linking

Each PR body is written by the main skill's rules and links only the issues its own change delivers, by the [Issue links](../SKILL.md#issue-links) rule. The workflow that built the stack may have linked more on one PR, such as a parent issue or work that produced no commits: keep each issue a body already links, and decide afresh only whether it is `Closes` or `Refs`.

Every PR merges into the trunk when the stack merges. When the trunk is the default branch, each PR's keywords take effect. When it is another branch, such as a release branch, a host may not apply them (GitHub does not): report that its issues need closing by hand, or close once that branch reaches the default branch. Where the tracker does not close work through PRs, issues are resolved the tracker's way.

**The host's stack.** Where the host has a native stack (on GitHub, a Stack, which the official `gh-stack` CLI extension links), link the stack's open PRs into it, bottom to top, once they are open and again when one is added. Until they are linked, such a host may treat each upper PR as aimed only at the branch below it: its closing keywords do not count, and review bots may skip it. Look up the tool's command for linking existing PRs in its own help. When the tool is not installed, install nothing: report that the stack needs linking, with its PRs in order.

## Merging

Before handing the stack over to the owner, set every PR's links by [Linking](#linking) and report each `Refs` and each human check still open.
