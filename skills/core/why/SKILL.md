---
name: why
description: Explain why code ended up this way, from git history and the issue tracker.
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/why"
  opencode/autoinvoke: "false"
---

# Why

Answer why code ended up the way it is, from the record: commits, pull requests, issues, and the docs and discussions they link. The owner asks so as not to undo a decision they no longer remember, so what the record says and what you infer stay visibly apart. You read the record; you change nothing.

Done when the anchor is named, every layer of step 2 has been searched or carries its reason for being skipped, every claim in the answer carries a tier and a citation, and the answer names what stays unknown and where you looked.

## 1. Anchor on the code

Name the target: file paths, line ranges, key symbols. When the request has no clear referent, take the likeliest one from the conversation (open files, recent edits, what was just discussed), state it in one line so the owner can redirect, and carry on.

A guess inside the question ("I assume it's for performance?") is one hypothesis to test against the record, never the answer to confirm.

## 2. Dig through the record, git first

Work outward from the anchor; each layer seeds the next. A shallow clone hides the origin: when `git rev-parse --is-shallow-repository` prints `true`, fetch the full history (`git fetch --unshallow`), or name the cut-off commit in the answer. Fetching only adds history and changes none of the repository's files, so it stays within reading the record.

1. **Blame** the target lines: `git blame -L <start>,<end> -- <file>`. Blame shows the last touch, not the origin: when that commit is a move, rename, reformat or refactor, blame its parent (`git blame -L <range> <commit>^ -- <old path>`) and keep going until you reach the commit that introduced the shape.
2. **History through renames**: `git log --follow -p -- <file>`.
3. **Pickaxe** the text itself, across the whole repository when it may have moved between files: `git log -S '<exact string>'` for commits that added or removed it, `git log -G '<regex>'` for commits whose diff matches a pattern.
4. **Commits**: `git show <commit>` for each substantive one. Read the diff as well as the message; a "small refactor" can carry a behaviour change. Collect pull request numbers (such as `(#123)` in a squash subject, or a merge commit) and issue references.
5. **Pull requests and issues** in the project's tracker: body, review threads, comments and linked issues. On GitHub: `gh pr view <n> --comments` and `gh issue view <n> --comments`, or the REST API through `gh api repos/<owner>/<repo>/pulls/<n>` (and `/issues/<n>/comments`) when those fail. A squash-merged repository keeps its rationale here, not in the branch commits. When a pull request closes many issues, search the tracker for the anchor's terms to find the one that asked for it.
6. **Linked rationale**: docs and discussions the record links directly (an ADR, a design note, the issue a PR closes), plus code comments, tests and changelog entries in the commits found. Follow links out of the record; the record decides where you read.

Skip bot commits such as dependency bumps: they carry no intent. When a pattern looks copied from elsewhere in the codebase, trace the original's history too.

When no route to the tracker works (no CLI, no API, no access), say so and answer from git alone.

Done when the trail reaches the commit that introduced the shape, or you can say what stopped it.

## 3. Grade every claim

Each claim sits in exactly one tier:

1. **Direct**: someone wrote down why. A commit message, pull request, issue, code comment or linked doc answers the question in words. Say "because" and cite it.
2. **Supported**: no source says it outright, but independent pieces converge, such as a performance-labelled issue, a benchmark added in the same commit and a pull request title about speed. Name every piece.
3. **Inferred**: a reasonable reading that nothing in the record states. Hedge it ("likely", "consistent with") and show the chain: given A and B, C.
4. **Speculative**: plausible, but the evidence is thin and other explanations fit as well. Call it a guess and list the rivals.
5. **Unknown**: you looked and the record does not say. Name the sources searched and the terms used.

- The code is not evidence of its own intent: a name or a shape never lifts a claim above Inferred.
- "Because", "the reason is" and "was designed to" belong to Direct and Supported claims, with the citation beside them.
- When sources disagree, give both with their citations and leave the call to the owner.
- Finding nothing is Unknown, never evidence that a concern was absent.
- Every summary keeps every tier, the one-line answer included: a summary never merges tiers or lifts a claim into a higher one.

## 4. Answer

- **Question**: one line, with the anchor (paths, lines, symbols).
- **Answer**: one to three sentences, each claim with its tier.
- **Findings**: grouped by tier from Direct to Speculative, each claim with its citation (short commit SHA, pull request or issue number, `file:line`) and the author and date where the record gives them. Leave out an empty tier.
- **Unknown**: what stays open, what was searched for it, and who in the record could answer (the commit or pull request author).
- **Record searched**: one line per layer of step 2: what was run or read, and any layer skipped or unreachable with the reason.
