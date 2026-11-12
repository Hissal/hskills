# Splitting into a stack

When the tickets carry PR groups, the verified integration branch is delivered as a stack of PRs, one per group. This is that split: when it runs, how the branch is replayed, how the split is checked and how the stack opens. How a stack is stored, pushed and linked into the host's stack is `pr`'s stack reference; follow it there. Which tickets and spec each PR links is [Linking](#linking) here.

The run ends at the report. Waiting on the stack's PRs, watching them and tending them belong to the owner or a tending workflow, never to this run.

## When and who

The split runs once, in step 9: after its retries end and their last step 8 verification has run, just before step 9 handles the PR. The gaps that verification reports go on the **Not done** lines of the PRs they concern; they do not hold the split back. A **merger subagent** replays the branch; you check its result.

## Replay

The merger's brief points at the integration branch, the task graph with each ticket's PR group, each merged ticket's merge commit SHA (step 5 names the ticket in each merge message), and this section. The merger:

1. Branches from the commit the integration branch sits on, `git merge-base <default branch> <integration branch>`.
2. Replays the groups in position order, 1 first. Each ticket of the group is one commit, in the order its merge commit sits on the integration branch: the first-parent diff of that merge commit (`git diff <merge>^1 <merge>`), with a subject naming the ticket.
3. Splits by file every other commit on the integration branch's first-parent chain: the fix commits from steps 7 and 9, and any commit from a ticket whose group is `none`. Each file's change goes onto the lowest group whose tickets touched that file, as one commit after that group's ticket commits; a file no grouped ticket touched goes onto the top group. Each `none` ticket's commit is named in the return, with the groups its files went to.
4. Creates a branch at each group's last commit, named by the repo's branch convention, carrying the group's position and name (where the repo has no convention, `<integration branch>-<position>-<group name in kebab-case>`). A group with no merged ticket gets no commit, no branch and no PR. When no group has a merged ticket, nothing is split. Commits still on the integration branch (a `none` ticket's, or fixes) go out as the single integration-branch PR, by the fallback below; with none, open no PR. Either way, report each ticket's blocker.
5. Resolves a conflict while replaying like any merge conflict, keeping both sides' intent; the tree check below catches a wrong resolution. After a resolution, it checks that the group's commit carries only its own tickets' change (`git diff` of the new commit against that ticket's merge diff); work from a later group moved into it fails the split, like a failing boundary.

Its return names each group's branch and head SHA in order, and where each `none` ticket's commit went.

## Check

Check the split through `verifying`:

- **Tree.** `git rev-parse <top branch>^{tree}` equals `git rev-parse <integration branch>^{tree}`. With equal trees, step 8's verification of the integration tip, `task end` checks included, carries to the top branch.
- **Boundaries.** Each group's branch, checked out in its own worktree, passes the `edit loop` checks plus the checks named by every merged ticket in its group or a group below it. A check named by a ticket that did not merge is that ticket's gap, on its PR's **Not done** line (the top PR's, when its group has no PR), not a boundary failure. Each boundary's results become its PR's Evidence.

On a tree mismatch or a failing boundary, a fresh merger retries the split once, briefed with the failure. If it still fails, no stack opens: open the single integration-branch PR as a draft, with its body written through `pr` and the failed boundary on its **Not done** line, and step 9 handles it as its Draft PR. With no forge remote that takes PRs, open nothing: report the integration branch and the failed boundary, and close out by step 9's No PR path. Report the failed split.

## Open

Before the first push, check that no group branch already exists on the remote (`git ls-remote --heads <remote> <branch>` prints nothing); one that does is a name collision, so rename that group's branch and check again, never adopting the remote one. On this first push every group branch is recorded as absent, by `pr`'s stack reference, whatever a later fetch shows, and none is reset to a remote SHA. Then push the group branches, open one draft PR per group, bottom first, and link them into the host's stack where it has one, all by `pr`'s stack reference. Write each body through `pr`, with its links set by [Linking](#linking). What steps 7 and 9 left for a **Not done** line goes on the PR of the lowest group whose tickets touched the files it concerns, or on the top PR.

Step 9 then handles each PR as its Draft PR, for its own group's tickets: once every criterion of those tickets is verified, mark that PR ready for review; otherwise it stays a draft with what stays open on its **Not done** line. Where the tracker does not close work through PRs, also resolve tickets and the spec the tracker's way, as step 9's No PR path does.

With no forge remote that takes PRs, build the branches locally and open nothing; the report names the branches in order.

The report names the stack's PRs, or its branches, in order from the bottom, and where each `none` ticket's commit went.

## Linking

Each PR links its own group's tickets by `pr`'s issue links rule. A ticket that did not merge stays `Refs` in its group's PR. A group with no merged ticket gets no PR: its tickets are linked `Refs` on the top PR, with their gaps on its **Not done** line.

The spec is linked by position:

- **The top PR** also links every ticket whose group is `none`, by the same rule: `Closes` once its work is done, `Refs` otherwise. Those tickets produce no commits, and their evidence is about the code the stack lands; they are not members of the top group. The top PR closes the spec once every ticket, grouped or `none`, is `Closes` in some PR of the stack; until then it refs the spec.
- **Every other PR** refs the spec.
