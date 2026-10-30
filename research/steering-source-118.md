# Personal steering source: #118 evidence

Read and implemented 2026-10-30 for [#118](https://github.com/Hissal/skill-collection/issues/118)
under [spec 2 (#78)](https://github.com/Hissal/skill-collection/issues/78).
Status at this implementation snapshot: evidenced naming policy implemented;
tooling-note requirement unresolved. For the subsequent search and recovery
lead, read [Recovery search](steering-notes-recovery.md).
This is implementation evidence for a later issue comment, not a new owner policy.
No issue comment was posted.

## Sources and limits

- Read #118 (no comments), #78 and its comments, #14 and #18 and their
  resolution comments. The [#14 decision](https://github.com/Hissal/skill-collection/issues/14#issuecomment-6096108259)
  admits the current naming convention because fresh repositories got messy
  names without it and the instruction was observed to fix them.
- Read the [superseding #88 answer 19 and answer 20](https://github.com/Hissal/skill-collection/issues/88#issuecomment-6512311352):
  attribution moves to the comment skill (#156) and PR skill (#130); the
  issue-body footer is dropped. The older #78 body saying attribution belongs
  in steering is superseded. No attribution instruction is in `steering.md`.
- Inspected the owner's current `~/.codex/AGENTS.md` and `~/.claude/CLAUDE.md`.
  Both contain only the naming section. Both have SHA-256
  `b9bfe981b28102afc7bf116f62fd531762122fbc4dd0c115f8acebb024ba0f2a`.
  Root [`steering.md`](../steering.md) is a byte-for-byte copy of that section.
- Searched repository docs and research for tooling notes, naming conventions
  and personal steering, and searched all local Git refs with
  `git log --all -G 'tooling notes|two tooling' -- research docs`.
  Inspected the matching changes: `2556ee3` in
  [`research/ledgers/hook-collections.md`](ledgers/hook-collections.md) and
  `9adc800` in [`docs/catalog.md`](../docs/catalog.md). Both mention the notes
  without preserving their wording. The [loading-mechanics research](loading-mechanics.md)
  describes steering loading, not the missing owner instructions.

**Missing requirement:** neither current owner file nor the inspected decision,
repo, history or research evidence supplies the content of the two tooling
notes. They are omitted rather than guessed. #118's first acceptance criterion
is therefore only partially satisfied; recovering the notes requires an
additional authoritative owner source. No claim is made that the historical
notes were revoked or that unrelated harness tool instructions replace them.

## Always-on admission reasons

The following accounts for every nonblank line of `steering.md`. The observed
failure evidence is the naming convention as a whole in #14; there is no
separate experiment for each syntax clause. Applicability and vehicle reasons
below explain that admitted policy, rather than claiming new observations.

| Source lines | Applies across sessions | Observed need | Why a skill or hook does not carry it instead |
|---|---|---|---|
| 1: naming heading | Identifies all four naming operations in the owner's repository work | #14 admits this naming policy | Organises the standing policy; no separate behaviour |
| 3: discover repo convention, then fallback | Every naming operation must honour the target repo first | #14's fresh-repo naming failures | Policy must reach ordinary git work and issue/branch naming outside a particular skill; a commit hook cannot choose all four names across repos |
| 5: subject syntax, case, punctuation, length | Common fallback for commit, PR and issue titles | Same admitted naming policy | A repository hook can validate some commits but cannot supply the owner's cross-repo fallback for all titles |
| 6: branch syntax and example | Fallback when creating branches | Same admitted naming policy | Branch creation can occur outside delivery skills and repository hooks |
| 7: allowed types | Defines the fallback vocabulary used by lines 5–6 | Same admitted naming policy | Needed to interpret the standing syntax; moving only this list to a skill leaves the fallback incomplete |
| 8: breaking-change syntax and footer | Conditional clause of the same fallback | Same admitted naming policy | Keeps meaning consistent when ordinary work creates a breaking-change title or commit |
| 9: optional body purpose and wrapping | Conditional clause when writing a commit body | Same admitted naming policy | Applies outside any particular commit skill; hooks cannot choose a useful explanation of why |

Conditional syntax clauses belong to the admitted convention; they are not
claims that every session creates a branch, breaking change or commit body.
No tooling-note admission reasons can be supplied without the notes themselves.

## Historical size and verification

The exact source is **985 Unicode characters / 4 = 246.25 estimated tokens**,
including Markdown and final newline, below the 500-token tripwire. This is
the specified character estimate, not a tokenizer measurement. Reproduce with:

```sh
node -e "const s=require('fs').readFileSync('steering.md','utf8'); console.log(Array.from(s).length / 4)"
COLLECTION_ALWAYS_ON_PATH=steering.md node scripts/check/check.js
```

At the implementation snapshot, verification passed: `npm ci` (0 vulnerabilities),
`node scripts/check/check.js` (0 failures, 0 warnings; guard 611 passed),
and `node scripts/check/test/run.js` (195 passed, 0 failed). The explicit
steering-path check above also passed with the 246.25-token figure.
Installation, harness loading and drift checking were not executed; they belong
to separate install work. No owner user-scope file was changed.

Starting branch: `feat/implement-issue-118`. Starting HEAD and integration
`feat/implement-issue-78` both resolved to
`930e499709682b97228a3d8a142e3997f515ff3c`; ancestry was confirmed with
`git merge-base --is-ancestor 930e499 HEAD`. These revisions identify the historical implementation baseline; they are not
instructions for later branches.
