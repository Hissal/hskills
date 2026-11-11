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

A PR is part of a stack when the host has linked it into a native stack (on GitHub, a Stack), or when its base is another open PR's head, or its head is another open PR's base. The host's stack, where there is one, lists the whole stack in order; otherwise follow the chain both ways through the open PRs, with their head and base branches. Chaining makes any PR a member, whoever opened it and from whatever repository; which members' refs may be rewritten is decided PR by PR, under **Whose stack it is** below. Before changing anything:

1. Fetch once, with `--prune`, so a branch deleted on the remote leaves no stale remote-tracking ref. `<remote>` is where the stack's branches live; `<upstream>` is the repository the PRs merge into, which is the same remote unless the stack lives on a fork, and then is fetched too, so `<upstream>/<trunk>` is current. `<stack base>` is `git merge-base <upstream>/<trunk> <top ref>`, the commit the stack sits on. For every ref of the stack, record the SHA the fetch brought, `git rev-parse <remote>/<ref>`; a ref the remote does not have yet is recorded as absent. The branch-by-branch carry, the moved-refs check and the push leases all use these recorded SHAs; nothing reads the remote again for them, so a push landing after the fetch fails its lease instead of being overwritten.
2. Find each ref of the stack checked out in any worktree, this one included: `git worktree list --porcelain` prints `branch refs/heads/<ref>` under that worktree's path. A rebase cannot move a ref another worktree holds (`--update-refs` skips it without failing, and `rebase --onto` refuses it), and `git branch -f` refuses one any worktree holds. When the worktree is yours and `git -C <path> status --porcelain` prints nothing, detach it (`git -C <path> switch --detach`). Otherwise another session may be working there: leave it, rewrite nothing, and report the worktree's path and ref.
3. Create each missing local branch at its recorded SHA (`git branch <ref> <recorded sha>`). Set each existing local branch to its recorded SHA (`git branch -f <ref> <recorded sha>`) only when it holds nothing the remote lacks: it is that SHA, or `git merge-base --is-ancestor <ref> <recorded sha>` exits 0. A local branch with commits the recorded SHA lacks holds unpublished work: rewrite nothing, and reconcile it or report it first. A ref recorded as absent keeps its local branch.
4. Find the **outside branches**: local branches that are not refs of the stack but point at a commit in `<stack base>..<top ref>` (`git for-each-ref --points-at <commit> --format='%(refname:short)' refs/heads/` for each commit of `git rev-list <stack base>..<top ref>`). A `--update-refs` rebase would move them along with the stack. So when there is any, never use `--update-refs`: carry branch by branch as under [Changing a lower PR](#changing-a-lower-pr), which moves only the refs it names. Pass `--no-update-refs` to each of its rebases on git 2.38 or later, so a `rebase.updateRefs` setting moves nothing else.

**Whose stack it is** decides what you may do, PR by PR, by the same rule as a single PR. A PR's ref is rewritten (carried, force-pushed) only when its head lives in `<remote>`'s repository and is neither the trunk nor the default branch, the PR is the owner's own (on GitHub, `gh pr view <n> --json headRepositoryOwner,headRepository,author`), and authority covers force-pushing. A stack can mix authors: from the lowest PR that fails this rule upward, the stack is someone else's, and the carry, restack and force-push stop below it, so the top ref is the highest PR you may rewrite. Without force-push authority, treat the owner's whole stack like someone else's, and ask for it when a fix needs a restack. On someone else's stack, push new commits only, and only to a PR you may change: never rebase, amend, squash or force-push. A new commit on one of their lower PRs leaves the PRs above it without it; report each of those as needing its author's restack.

## Changing a lower PR

A fix goes onto the PR it belongs to as a new commit on that PR's own ref. Existing commits are never amended, squashed or reordered, so each push shows reviewers exactly what changed. A fix to the top PR is an ordinary commit and push. A fix to any PR below it also has to reach every ref above, which moves those refs onto the changed one: on the owner's stack only, as below.

1. Commit the fix on the changed PR's ref:

   ```
   git switch <changed ref>
   git commit
   ```

2. Note every ref's head (`git rev-parse <ref>`), so the carry can be undone without losing the fix.
3. Carry the refs above onto it, from the top ref:

   ```
   git switch <top ref>
   git rebase --update-refs <changed ref>
   ```

   The rebase replays every commit above the changed ref's old head onto its new one, and `--update-refs` moves each ref between them in the same command, once no other worktree holds one (step 2 of [Stored form](#stored-form)). The changed ref and every ref below it keep their commits.

When several PRs change, go bottom first: commit and carry for each changed PR in turn, then push once.

A commit someone else already pushed to a lower PR, leaving the refs above it behind, is carried the same way from step 2: [Stored form](#stored-form) has already put it on the changed ref. That ref then stands at its recorded SHA, so the moved-refs check under [Pushing](#pushing) applies only to the refs above it; carrying branch by branch, each ref's old lower head is its merge-base with the ref below it (`git merge-base <lower ref> <ref>`), taken before the carry.

**Branch by branch.** Carry this way, and say so in the report, when `--update-refs` cannot do it: with git older than 2.38, which lacks it; with outside branches (step 4 of [Stored form](#stored-form)); or when the stack holds merge commits (`git log --merges <stack base>..<top ref>` prints any), where the rebase drops the merges, reorders the commits around them and can leave a ref behind or put another PR's commits under it. Going up from the changed ref, move each ref above onto the new ref below it:

```
git rebase --no-update-refs --onto <new lower ref> <lower ref head noted in step 2> <ref>
```

Everything the noted head reaches is left out, so each rebase replays only that ref's own commits. Drop `--no-update-refs` on git older than 2.38. A stack with merge commits comes out linear.

After a conflict during the rebase, the checks of every PR whose patch changed run again (see [Unchanged PRs](#unchanged-prs)).

## Pushing

First check that the restack moved every ref it had to. A ref left behind fails one of these:

- Each ref is an ancestor of the ref above it: `git merge-base --is-ancestor <lower ref> <upper ref>` exits 0.
- After a restack, each ref at or above the lowest changed PR differs from its recorded SHA.

When one fails, push nothing, and undo the carry rather than repairing it: first free every ref a worktree holds, since `git branch -f` refuses those: detach this worktree (`git switch --detach`), and free the ref that stayed behind by step 2 of [Stored form](#stored-form), stopping to report it when that worktree is not yours to detach. Then put each ref back where it stood before the rebase (`git branch -f <ref> <head noted in step 2 of [Changing a lower PR](#changing-a-lower-pr)>`, which keeps the fix commit), and carry again. Never pick a ref's new head by its subject or diff: nothing in a rebase's result proves which new commit replaced an old one. Once both hold, push every ref of the stack in one atomic push, with an explicit lease per ref, each `<recorded sha>` being the remote SHA recorded before the rebase:

```
git push --atomic <remote> \
  --force-with-lease=<ref 1>:<recorded sha 1> \
  --force-with-lease=<ref 2>:<recorded sha 2> \
  <ref 1> <ref 2>
```

A ref recorded as absent, such as a new stack's first push, is leased as absent: `--force-with-lease=<ref>:`, with nothing after the colon, fails if someone created the ref meanwhile. A bare `--force-with-lease` is not enough: a background fetch moves the remote-tracking ref and quietly defeats it. When a lease fails, the atomic push lands nothing: fetch, inspect the other pusher's commits and reconcile with them. Their work is never overwritten.

On someone else's stack there is no restack, so the ancestry check does not apply: push only the PRs you added commits to, without force, each to the repository its head lives in (`git push <remote> <ref>` when that is `<remote>`), and report each PR above them as needing its author's restack.

## The default branch moved

This covers the stack's trunk, the bottom PR's base, moving. On the owner's stack, rebase it up to its top ref onto the trunk in one command, under authority that covers force-pushing, then push as in [Pushing](#pushing):

```
git switch <top ref>
git rebase --update-refs <upstream>/<trunk>
```

With outside branches, git older than 2.38, or a stack holding merge commits, restack branch by branch: first `git rebase --onto <upstream>/<trunk> <stack base> <bottom ref>`, then carry each ref above as in [Changing a lower PR](#changing-a-lower-pr).

On someone else's stack, change nothing when the trunk moves: report that the stack needs its author's restack.

## Unchanged PRs

A PR's patch-id is:

```
git diff <base> <head> | git patch-id --verbatim
```

`--verbatim` keeps whitespace, so an indentation change that alters behaviour changes the patch-id. Take it for every PR of the stack before and after a restack. A PR whose patch-id is unchanged keeps the results in its body's Evidence section that judge its own change alone, such as acceptance criteria checked against its diff: that change did not move. The checks its Evidence ran on its head (the project's checks, when it names none) still run again on its new head, because the code beneath it changed, and a changed value below can break an unchanged PR above. Run each head's checks in its own detached worktree (`git worktree add --detach <path> <ref>`), so this worktree stays free for the next fix. A PR whose patch-id changed has lost both: its Evidence names the tree they ran on, and its checks and criteria are checked again before any result is claimed for the new head. Until they pass, the gap goes on its **Not done** line.

## Linking

Each PR body is written by the main skill's rules and links only the issues its own change delivers, by the [Issue links](../SKILL.md#issue-links) rule. The workflow that built the stack may have linked more on one PR, such as a parent issue or work that produced no commits: keep each issue a body already links, and decide afresh only whether it is `Closes` or `Refs`.

Every PR merges into the trunk when the stack merges. When the trunk is the default branch, each PR's keywords take effect. When it is another branch, such as a release branch, a host may not apply them (GitHub does not): report that its issues need closing by hand, or close once that branch reaches the default branch. Where the tracker does not close work through PRs, issues are resolved the tracker's way.

**The host's stack.** Where the host has a native stack (on GitHub, a Stack, which the official `gh-stack` CLI extension links), link the stack's open PRs into it, bottom to top, once they are open and again when one is added. Until they are linked, such a host may treat each upper PR as aimed only at the branch below it: its closing keywords do not count, and review bots may skip it. Look up the tool's command for linking existing PRs in its own help. When the tool is not installed, install nothing: report that the stack needs linking, with its PRs in order.

## Merging

Before handing the stack over to the owner, set every PR's links by [Linking](#linking) and report each `Refs` and each human check still open.
