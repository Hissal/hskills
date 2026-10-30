# Recovery search: the two personal tooling notes

Researched 2026-10-30. Result: **the wording of neither note was recovered**. No policy is inferred from generic tool instructions or unrelated project rules.

## What the primary record establishes

The earliest explicit source found is the October 10, 2026 resolution of #14:
https://github.com/Hissal/skill-collection/issues/14#issuecomment-6096108259

Exact relevant wording:

> Today's file is the base: the commit / PR / issue / branch naming convention (added because fresh repos got messy names without it, and observed to fix that) plus the two tooling notes, the same on both harnesses.

The preceding sentence identifies the files as user-scope `~/.claude/CLAUDE.md` and `~/.codex/AGENTS.md`. This establishes existence and intended location at that date, but supplies neither note's contents.

The same missing content is carried forward by:
- #78, “Personal steering text and attribution”, story 67, and “Source content”: https://github.com/Hissal/skill-collection/issues/78
- #118, “What to build” and first acceptance criterion: https://github.com/Hissal/skill-collection/issues/118
- Collection history, commit 2556ee3, research/ledgers/hook-collections.md, entry 12 “claudemd-guard”, currently line 286: “The owner's always-on text is three items (naming convention, two tooling notes).” This is another count, not a transcription.
- Collection history, commit 9adc800, docs/catalog.md, personal steering source row (currently line 135): names naming convention and tooling notes without quoting them.

Installation resolution changes the delivery mechanism, not their content:
https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944

## Search coverage

- Retrieved all currently available repository issue/PR bodies via paginated GitHub REST: 180 records, and all repository issue comments: 195 records. Searched these for tooling, two notes, naming convention, personal steering and user-scope references. Only #14/#78/#118 explicitly identify the missing pair. Ordinary unrelated mentions of tooling were not treated as evidence of their content.
- Extracted the complete current bodies and comments for #1, #14, #18, #32 and #42 (15 records), including the early map and resolutions. None transcribes the pair.
- #42's resolution adds attribution; it does not identify the tooling notes:
  https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887
  Attribution was subsequently removed from steering by:
  https://github.com/Hissal/skill-collection/issues/88#issuecomment-6512311352
- Searched local collection docs/research and all locally available Git refs. Collection has 335 reachable commits and is not shallow. Inspected history of AGENTS.md, CLAUDE.md and steering.md; searched Markdown history for tooling-note references and related terms.
- Found an earlier attempt at recovery in collection commit **1b141e2b3ab6cc8f4fc4c2845bf99e12bae44411**, research/steering-source-118.md (“Sources and limits”). It explicitly says the requirement is unresolved; steering.md in that commit contains only naming. This is corroboration of an earlier failed search, not recovered owner wording.
- Searched /home/agent/mattpocock-skills-unity history across all local refs: 630 reachable commits, not shallow. Read the AGENTS.md / CLAUDE.md change history; checked the additional historical CLAUDE.local.md path. These contain repository guidance, linking instructions and project conventions, with no identified historical personal pair.
- The fork's CLAUDE.local.md at **98e74a294d6cc695d28354cefeffdcb20d0f1614** (also checkpoint commits 48b28ef and eef493f) has a branch freshness rule plus issue-tracker, labels and domain pointers. It is dated October 30 and project-scoped; it cannot establish the contents of October 10's two personal notes.
- Re-read current /home/agent/.claude/CLAUDE.md and /home/agent/.codex/AGENTS.md: both 985 bytes, byte-identical, naming section only. Filename-only search two levels beneath those directories found no other CLAUDE.md* / AGENTS.md* backup candidates.

No credentials, secret files, settings stores, or session transcript archives were inspected. No remote fetch, repository edits, commits, issue edits or subagents were used. History coverage is all **locally available refs**, not a claim about deleted/unfetched remote objects. GitHub issue edit histories and deleted comments were not available through the REST bodies/comments fetched.

## Likely recovery location

The strongest next lead is the owner's **original Windows machine**, rather than either repo. #1 explicitly identifies the working fork there as `C:\dev\skills\mattpocock-skills-unity`:
https://github.com/Hissal/skill-collection/issues/1

Since #14 identifies the missing material as user-scope files on October 10, a backup or file-version history of that machine's user-profile `.claude\CLAUDE.md` or `.codex\AGENTS.md` from **on or before 2026-10-10** is the most plausible authoritative recovery source. This location is an inference from the record, not a verified surviving backup. The October 10 grilling session's captured initial instruction context is a secondary recovery lead, if retained and inspected narrowly with secret handling. No such archive was inspected here.

## Reproducible evidence captures outside the repository

- /tmp/steering-issues.jsonl — paginated issue/PR bodies
- /tmp/steering-comments.jsonl — paginated issue comments with exact comment URLs
- /tmp/steering-early-issues.txt — full selected early bodies/comments
- /tmp/steering-collection-history.txt — collection steering-file patch history
- /tmp/steering-fork-history.txt — fork AGENTS.md / CLAUDE.md patch history

Conclusion: existence, count, date and original storage locations are supported; exact tooling-note wording remains missing. No guessed replacement is justified.
