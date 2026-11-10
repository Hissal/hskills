# Splitting into a stack

When the tickets carry PR groups, the verified integration branch is delivered as a stack of PRs, one per group. This is that split: when it runs, how the branch is replayed, how the split is checked and how the stack opens. How a stack is stored, pushed and linked is `pr`'s stack reference; follow it there.

## When and who

The split runs once, in step 9: after its retries end and their last step 8 verification passes, just before step 9 handles the PR. A **merger subagent** replays the branch; you check its result.

## Replay

The merger's brief points at the integration branch, the task graph with each ticket's PR group, and this section. The merger:

1. Branches from the commit the integration branch sits on, `git merge-base <default branch> <integration branch>`.
2. Replays the groups in position order, 1 first. Each ticket of the group is one commit, in the order its merge commit sits on the integration branch: the first-parent diff of that merge commit (`git diff <merge>^1 <merge>`), with a subject naming the ticket.
3. Splits by file every other commit on the integration branch's first-parent chain: the fix commits from steps 7 and 9, and any commit from a ticket whose group is `none`. Each file's change goes onto the lowest group whose tickets touched that file, as one commit after that group's ticket commits; a file no grouped ticket touched goes onto the top group. Each `none` ticket's commit is named in the return, with the groups its files went to.
4. Creates a branch at each group's last commit, named `<integration branch>-<position>-<group name in kebab-case>`. A group with no merged ticket gets no commit, no branch and no PR.
5. Resolves a conflict while replaying like any merge conflict, keeping both sides' intent; the tree check below catches a wrong resolution.

Its return names each group's branch and head SHA in order, and where each `none` ticket's commit went.

## Check

Check the split through `verifying`:

- **Tree.** `git rev-parse <top branch>^{tree}` equals `git rev-parse <integration branch>^{tree}`. With equal trees, step 8's verification of the integration tip, `task end` checks included, carries to the top branch.
- **Boundaries.** Each group's branch, checked out in its own worktree, passes the `edit loop` checks plus the checks named by every ticket in its group or a group below it. Each boundary's results become its PR's Evidence.

On a tree mismatch or a failing boundary, a fresh merger retries the split once, briefed with the failure. If it still fails, no stack opens: open the single integration-branch PR as a draft, with its body written through `pr` and the failed boundary on its **Not done** line, and step 9 handles it as its Draft PR. Report the failed split.

## Open

Push the group branches and open one draft PR per group, bottom first, by `pr`'s stack reference. Write each body through `pr`; its stack linking rule decides which tickets and spec each PR closes or refs, tickets that did not merge and `none` tickets included. What steps 7 and 9 left for a **Not done** line goes on the PR of the lowest group whose tickets touched the files it concerns, or on the top PR.

Step 9 then handles each PR as its Draft PR, for its own group's tickets: once every criterion of those tickets is verified, mark that PR ready for review; otherwise it stays a draft with what stays open on its **Not done** line. Where the tracker does not close work through PRs, also resolve tickets and the spec the tracker's way, as step 9's No PR path does.

With no forge remote that takes PRs, build the branches locally and open nothing; the report names the branches in order.

The run ends at the report. Waiting on the stack's PRs, watching them and tending them belong to the owner or a tending workflow, never to this run.

The report names the stack's PRs, or its branches, in order from the bottom, and where each `none` ticket's commit went.
