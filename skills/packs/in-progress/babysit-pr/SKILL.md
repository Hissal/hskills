---
name: babysit-pr
description: Take over an existing PR's checks, conflicts and review feedback and bring it to ready, without merging.
disable-model-invocation: true
argument-hint: "A PR number or URL"
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/babysit-pr"
  opencode/autoinvoke: "false"
---

# Babysit PR

You own an existing PR from its current state until it is ready for the owner's merge. You never merge it. Done at the delivery procedure's done bar, with the PR unwatched and the report given; or at one of its stops, asked as it says.

Read the [delivery procedure](references/DELIVERY.md) before the first action: branch authority, scope, stop conditions, the tend loop and the done bar all live there, and this file only adds where the run starts and ends. Skip it and you will act without the rules that bound every push and reply.

## Start

1. **The PR.** Take it from the invocation. With none given, use the open PR for the current branch; with none there either, ask for it.
2. **Whose branch it is.** Fetch the PR's author and compare it with the account you act as (`gh api user --jq .login`).
   - **The owner's PR**: the author is that account, or the PR was opened by `/full-stop` or `/full-send`. Its branch is the run's own branch under the procedure's branch authority, rebase and force-push with lease included.
   - **Someone else's PR**: push new commits only. Resolve conflicts and a BEHIND branch by merging the base in. Never rebase, amend, squash or force-push: their history stays as they wrote it.
   - **No push access** to the head branch (a fork that disallows maintainer edits, say) is the procedure's missing-access stop.
3. **Check out the head branch**, then enter the tend loop: first the checks and comments already on the latest head, then wait.

## Authority this invocation adds

- **Testing.** To re-prove the fixes you make, use the test methods the proof needs (running the app, browser automation, computer use, screenshots) without asking, even where a project file says to ask first. Rules on how to test still apply. This covers only proving your own fixes: never production, data deletion, or a harness approval prompt.
- **No merge.** The PR stays unmerged whatever its state. A merge needs `/full-send` or an equally explicit instruction from the owner. Auto-merge or a merge queue the PR already uses is the owner's own setting: leave it as it is and name it in the report.

## End

At the done bar, unwatch, then report as the procedure says, opening with the PR link and the word **ready**, and say which human approval, if any, the merge still waits on.
