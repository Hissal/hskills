# Review mode

A second read of a change, told what the first review found and asked what it missed.

## Capture one patch

Capture the patch once, at the announced snapshot, into one file outside the checkout (the OS temp directory). Every reader of this target gets that same file, unchanged.

- **Committed pending work:** `git diff <merge-base> <head>`, or the reused `code-review` range as recorded.
- **Uncommitted work** is part of the patch: staged and unstaged changes (`git diff <base>`) plus untracked files (`git ls-files --others --exclude-standard`, each as `git diff --no-index /dev/null <file>`, whose exit status 1 means "differs").
- **A git error is an error.** A git command that fails stops the capture: report the command and its message. An empty patch is a result only when every command succeeded.
- **Oversized:** when the patch exceeds what the reader can take whole, ask the owner how to narrow it (paths, commits, a split into several reads) and capture again. Send it whole or narrowed by the owner, never cut.

Done when one complete patch file exists, its size and file count are known, and it matches the announced snapshot.

## The first review

Give the reader what the first review reported, as it reported it: each axis's findings, **Declined to judge**, missing coverage and out-of-scope observations. When no review ran, say: "No review of this change exists yet. You are its first reader."

## The ask

> Your job is not to repeat the first review. Find what it missed: defects, risks and wrong assumptions it passed over, and gaps between its axes. Then name one agreed premise you think is wrong (something the change and the first review both take for granted) and what evidence would prove you right.

The mode's required answer in the return shape is **Wrong premise:** the premise and its evidence, or "none found" with what was checked.
