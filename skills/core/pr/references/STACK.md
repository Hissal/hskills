# PR stack

How a stack of PRs is stored, changed, pushed, re-checked, linked and merged. Any change to one PR of a stack follows it, with or without a workflow running, so the whole stack stays consistent. Every skill that writes to a stacked PR goes through these rules and keeps no copy of them.

**The owner merges the whole stack in one go**, once every PR is ready. No agent merges any PR of a stack, in any order, and nothing merges bottom-up as PRs settle; [Merging](#merging) covers the handover.

- [Stored form](#stored-form)
- [Changing a lower PR](#changing-a-lower-pr)
- [Pushing](#pushing)
- [The default branch moved](#the-default-branch-moved)
- [Unchanged PRs](#unchanged-prs)
- [Linking](#linking)
- [Merging](#merging)

## Stored form

A stack is one linear branch with a branch ref at each group's end. Each ref is one PR's head, and each PR's base is the PR below it; the bottom PR's base is the stack's **trunk**, usually the default branch. Each ticket's change is one commit in its group's PR.

A PR is part of a stack when the host has linked it into a native stack (on GitHub, a Stack), or when its base is another open PR's head, or its head is another open PR's base. The host's stack, where there is one, lists the whole stack in order; otherwise follow the chain both ways through the open PRs, with their head and base branches. Before changing anything:

1. Fetch once, with `--prune`, so a branch deleted on the remote leaves no stale remote-tracking ref. `<remote>` is where the stack's branches live; `<upstream>` is the repository the PRs merge into, which is the same remote unless the stack lives on a fork, and then is fetched too, so `<upstream>/<trunk>` is current. For every ref of the stack, record the SHA the fetch brought, `git rev-parse <remote>/<ref>`; a ref the remote does not have yet is recorded as absent. The fallback restack, the moved-refs check and the push leases all use these recorded SHAs; nothing reads the remote again for them, so a push landing after the fetch fails its lease instead of being overwritten.
2. Find each ref of the stack checked out in any worktree, this one included: `git worktree list --porcelain` prints `branch refs/heads/<ref>` under that worktree's path. A rebase cannot move a ref another worktree holds (`--update-refs` skips it without failing, and `rebase --onto` refuses it), and `git branch -f` refuses one any worktree holds. When the worktree is yours and `git -C <path> status --porcelain` prints nothing, detach it (`git -C <path> switch --detach`). Otherwise another session may be working there: leave it, rewrite nothing, and report the worktree's path and ref.
3. Create each missing local branch at its recorded SHA (`git branch <ref> <recorded sha>`). Set each existing local branch to its recorded SHA (`git branch -f <ref> <recorded sha>`) only when it holds nothing the remote lacks: it is that SHA, or `git merge-base --is-ancestor <ref> <recorded sha>` exits 0. A local branch with commits the recorded SHA lacks holds unpublished work: rewrite nothing, and reconcile it or report it first. A ref recorded as absent keeps its local branch.
4. Find the **outside branches**: local branches that are not refs of the stack but point at a commit in `<stack base>..<top ref>` (`git for-each-ref --points-at <commit> --format='%(refname:short)' refs/heads/` for each commit of `git rev-list <stack base>..<top ref>`). A `--update-refs` rebase would move them along with the stack. So when there is any, never use `--update-refs`: restack branch by branch by the fallback under [Changing a lower PR](#changing-a-lower-pr), which moves only the refs it names. Pass `--no-update-refs` to each of its rebases on git 2.38 or later, so a `rebase.updateRefs` setting moves nothing else.

**Whose stack it is** decides what you may do, by the same rule as a single PR: history is rewritten (fixup, restack, force-push) only on the owner's own stack, and only under authority that covers force-pushing. Without that authority, treat the owner's stack like someone else's, and ask for it when a fix needs a restack. On someone else's stack, push new commits only: never rebase, amend, squash or force-push. A new commit on one of their lower PRs leaves the PRs above it without it; report each of those as needing its author's restack.

## Changing a lower PR

On the owner's stack, a change to any PR below the top goes into the commit it belongs to, and every ref above follows in one command:

1. Find the commit of the ticket whose change the finding is in. When the finding is in no ticket's change, aim at the PR's last commit.
2. On the top ref, commit the fix as a fixup of it, naming the commit by its full SHA. A fixup committed on the lower ref is not in the top ref's history, and the rebase below never sees it. `git commit --fixup` names the commit by its subject instead, and autosquash then picks the first commit with that subject, which lands the fix in the wrong PR when two commits share it.

   ```
   git switch <top ref>
   git commit -m "fixup! <full sha of that commit>"
   ```

3. Note every ref's head (`git rev-parse <ref>`), so the restack can be undone. Then rebase the whole stack in place, non-interactively:

   ```
   git rebase --autosquash --update-refs <stack base>
   ```

   `<stack base>` is `git merge-base <upstream>/<trunk> <top ref>`, from the fetched trunk, the commit the stack sits on, so the stack moves nowhere but takes the fixup. `--update-refs` moves every other ref of the stack in the same command, once no other worktree holds one (step 2 of [Stored form](#stored-form)). With outside branches, restack branch by branch instead (step 4). With git older than 2.44, `--autosquash` acts only on an interactive rebase; run `GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash --update-refs <stack base>`, which opens no editor.

**Branch by branch.** Restack this way with git older than 2.38, which has no `--update-refs`, or when outside branches exist (step 4 of [Stored form](#stored-form)), and say so in the report. Here the fixup goes on the changed PR's own ref, never the top ref, so no ref above ever holds a copy of it:

1. Commit the fix as a fixup on the changed PR's ref:

   ```
   git switch <changed ref>
   git commit -m "fixup! <full sha of that commit>"
   ```

2. Note every ref's head, as above, so the restack can be undone. Then squash the fixup in: `GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash <its base>`, where `<its base>` is the recorded SHA of the ref below, or `<stack base>` for the bottom ref.
3. Going up the stack, move each ref onto the new ref below it: `git rebase --onto <new lower ref> <recorded lower ref SHA> <ref>`. The recorded SHA predates the fixup, so each rebase replays only that ref's own commits.

A conflict during the rebase is resolved keeping both sides' intent, then the boundary checks of every PR whose patch changed run again (see [Unchanged PRs](#unchanged-prs)).

## Pushing

First check that the restack moved every ref it had to. A ref left behind fails one of these:

- Each ref is an ancestor of the ref above it: `git merge-base --is-ancestor <lower ref> <upper ref>` exits 0.
- After a restack, each ref at or above the lowest changed PR differs from its recorded SHA.

When one fails, push nothing, and undo the restack rather than repairing it: first free every ref a worktree holds, since `git branch -f` refuses those: detach this worktree (`git switch --detach`), and free the ref that stayed behind by step 2 of [Stored form](#stored-form), stopping to report it when that worktree is not yours to detach. Then put each ref back where it stood before the rebase (`git branch -f <ref> <head noted before the rebase>`, which keeps a fixup committed on any ref), and rebase again. Never pick a ref's new head by its subject or diff: nothing in a rebase's result proves which new commit replaced an old one. Once both hold, push every ref of the stack in one atomic push, with an explicit lease per ref, each `<recorded sha>` being the remote SHA recorded before the rebase:

```
git push --atomic <remote> \
  --force-with-lease=<ref 1>:<recorded sha 1> \
  --force-with-lease=<ref 2>:<recorded sha 2> \
  <ref 1> <ref 2>
```

A ref recorded as absent, such as a new stack's first push, is leased as absent: `--force-with-lease=<ref>:`, with nothing after the colon, fails if someone created the ref meanwhile. A bare `--force-with-lease` is not enough: a background fetch moves the remote-tracking ref and quietly defeats it. When a lease fails, the atomic push lands nothing: fetch, inspect the other pusher's commits and reconcile with them. Their work is never overwritten.

On someone else's stack there is no restack, so the ancestry check does not apply: push only the PR you added commits to, without force (`git push <remote> <ref>`), which lands only as a fast-forward, and report each PR above it as needing its author's restack.

## The default branch moved

This covers the stack's trunk, the bottom PR's base, moving. On the owner's stack, rebase the whole stack onto it in one command, under authority that covers force-pushing, then push as in [Pushing](#pushing):

```
git switch <top ref>
git rebase --update-refs <upstream>/<trunk>
```

With outside branches, restack branch by branch instead, by step 4 of [Stored form](#stored-form).

With git older than 2.38, restack branch by branch by step 3 of the fallback in [Changing a lower PR](#changing-a-lower-pr), starting with `git rebase --onto <upstream>/<trunk> <stack base> <bottom ref>`.

On someone else's stack, only the bottom PR merges the trunk in, as a new commit. Report each PR above it as needing its author's restack.

## Unchanged PRs

A PR's patch-id is:

```
git diff <base> <head> | git patch-id --verbatim
```

`--verbatim` keeps whitespace, so an indentation change that alters behaviour changes the patch-id; `--stable` would ignore it. With git older than 2.39, which lacks `--verbatim`, treat every PR's patch as changed. Take it for every PR of the stack before and after a restack. A PR whose patch-id is unchanged keeps the `verifying` results of its criteria, recorded in its body's Evidence section: they judge its own change, which did not move. Its boundary checks still run again on its new head, because the code beneath it changed, and a changed value below can break an unchanged PR above. A PR whose patch-id changed has lost both: its Evidence names the tree they ran on, and its checks and criteria are checked again before any result is claimed for the new head. Until they pass, the gap goes on its **Not done** line.

## Linking

Each PR body is written by the main skill's rules and links only its own group's tickets, by the [Issue links](../SKILL.md#issue-links) rule. A ticket that did not merge stays `Refs` in its group's PR. A group with no merged ticket gets no PR: its tickets are linked `Refs` on the top PR, with their gaps on its **Not done** line.

The spec is linked by position:

- **The top PR** also links every ticket whose group is `none`, by the same [Issue links](../SKILL.md#issue-links) rule: `Closes` once its work is done, `Refs` otherwise. Those tickets produce no commits, and their evidence is about the code the stack lands. They are not members of the top group. The top PR closes the spec once every ticket, grouped or `none`, is `Closes` in some PR of the stack; until then it refs the spec.
- **Every other PR** refs the spec.

Every PR merges into the trunk when the stack merges. When the trunk is the default branch, each PR's keywords take effect. When it is another branch, such as a release branch, a host may not apply them (GitHub does not): report that its tickets and the spec need closing by hand, or close once that branch reaches the default branch. Where the tracker does not close work through PRs, tickets and the spec are resolved the tracker's way.

**The host's stack.** Where the host has a native stack (on GitHub, a Stack, which the official `gh-stack` CLI extension links), link the stack's open PRs into it, bottom to top, once they are open and again when one is added. Until they are linked, such a host may treat each upper PR as aimed only at the branch below it: its closing keywords do not count, and review bots may skip it. Look up the tool's command for linking existing PRs in its own help. When the tool is not installed, install nothing: report that the stack needs linking, with its PRs in order.

## Merging

Before handing the stack over to the owner, set every PR's links by [Linking](#linking) and report each `Refs` and each human check still open.
