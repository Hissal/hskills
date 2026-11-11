---
status: accepted
---

# PR stacks restack and push through the pr-stack script

The `pr` skill's stack reference had the agent run every restack step as hand-written git: fetch and record each ref's remote SHA, free or report held refs, line local branches up, find outside branches, carry, check, undo, and push atomically with a lease per ref. The spec [#368](https://github.com/Hissal/hskills/issues/368) review found 27 edge-case bugs in that prose. [#385](https://github.com/Hissal/hskills/issues/385) moves the steps into a tested tool, choosing between GitHub's `gh stack` extension and our own script by running both against the review's edge cases.

## Decision

The `pr` skill's bundled script, `skills/core/pr/scripts/pr-stack.py` (`sync`, `carry`, `push`), carries and pushes a stack everywhere: on GitHub too, whether or not `gh stack` is installed. `gh stack` stays only for linking a stack's PRs into a GitHub Stack (`gh stack link`).

`gh stack` would have been the default where installed only if it handled every case correctly. It overwrote other people's pushes, pushed a stack with a ref left behind, and rebased a branch inside a worktree another session held. A wrong push or a rewritten worktree is the harm the stack rules exist to prevent, so fewer steps for the agent do not outweigh it.

## Results

`gh stack` v0.3.0 (github/gh-stack) and `pr-stack.py`, run on 2026-11-11 against scratch repositories with local bare remotes, git 2.47.3. `gh stack` was driven with `gh stack init --base main s1 s2 s3`, `gh stack rebase --upstack` (or `--remote` for the fork) and `gh stack push`; its git calls were logged through a `git` wrapper on `PATH`. No case needed a GitHub remote, so no throwaway repository was created. The script's results are its tests, `scripts/pr-stack/test/run.py`.

| Case | `gh stack` v0.3.0 | `pr-stack.py` |
|---|---|---|
| Carry a new commit on a lower ref | Pass: every ref above moved; the changed ref's earlier commits kept their SHAs. | Pass. |
| A ref held by another worktree | **Fail.** A clean worktree's branch was rebased inside that worktree (`rebase: checkout s2` in its reflog), unreported; another session working there has its branch moved under it. A dirty one stops the rebase with a clear message. | Pass: `sync` reports `held: <ref> <path>` and `safe: no`; `carry` refuses and moves nothing. |
| A ref the rebase left behind | **Fail.** With `s2` set back after the rebase, `gh stack push` pushed all three branches; only `gh stack view` marked them as needing a rebase. | Pass: `push` fails the ancestry and moved checks, puts every ref back where it stood before the carry, and pushes nothing. |
| A stack on a fork (`<remote>` differs from `<upstream>`) | Pass, with judgement: with two remotes, `gh stack rebase` stops (`multiple remotes configured`); `rebase --remote upstream` then `push --remote origin` rebased onto the upstream trunk and pushed to the fork. | Pass: `sync --upstream upstream`, `carry --trunk`, `push` to the fork; upstream untouched. |
| A ref absent from the remote | **Partial.** It leases the ref as absent (`--force-with-lease=refs/heads/s3:`), but from a fetch it runs just before pushing, so a branch someone created after the agent's own fetch was overwritten. | Pass: `sync` records `absent`; `push` leases it as absent from that record, so a branch created meanwhile fails the lease and nothing lands; with no one racing, the push creates it. |
| A push landing after the fetch | **Fail.** `gh stack push` re-fetches each stack ref and leases at what that fetch brought, so a commit another clone pushed to `s2` after the agent's fetch was overwritten. | Pass: leases use the SHAs `sync` recorded, so the lease fails, the atomic push lands nothing, and a background fetch does not defeat it. |
| An outside branch pointing into the stack | Pass: it rebases branch by branch, so the outside branch stayed, even with `rebase.updateRefs=true`. | Pass: `sync` reports `outside: <branch>`; `carry` goes branch by branch with `--no-update-refs`, and the outside branch stays. |

The script's tests also cover git older than 2.38 (through `PR_STACK_GIT_VERSION`), a stack holding a merge commit, a middle ref changing, a commit someone else pushed to a lower ref, local work the remote lacks, and a conflict resolved with `carry --continue` or undone with `carry --abort`.

## Consequences

- The stack reference keeps what the agent judges (whose stack it is, force-push authority, when to stop and ask, linking, the patch-id rule) and points at the script for the commands.
- The script needs Python 3 and git; it runs on Linux, macOS and Windows, and its tests run in the collection check on both CI platforms.
- Revisit when `gh stack` leases from a recorded fetch, checks ancestry before pushing, and leaves other worktrees' branches alone: it would then cut the agent's steps on GitHub.
