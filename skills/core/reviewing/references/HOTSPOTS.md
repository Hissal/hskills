# Hotspot survey

What a review covers when nothing is pending, when the user asks for recent hotspots, or when pending work is off the review's concern. History picks the areas; the review then reads those areas whole.

- [When the survey runs](#when-the-survey-runs)
- [Window](#window)
- [Selection](#selection)
- [Fallbacks](#fallbacks)
- [Announce](#announce)
- [Reviewing the areas](#reviewing-the-areas)

## When the survey runs

- **Nothing pending.** A bare invocation found no pending work ([scope contract](SCOPE.md#bare-invocation), step 5).
- **Explicit request.** The user asks for recent hotspots ("which modules changed most this month"). Go straight to the survey, even when work is pending.
- **Pending work off the concern.** The pending work clearly does not bear on the calling review's concern: a few assets changed by churn under an architecture review, say. Offer the survey instead of reviewing that work, name the pending work you are setting aside, and wait for the user's choice. A review of the change itself, such as `code-review`, always reviews pending work.

## Window

1. **Integration line**: the default branch, or the integration branch the project's conventions name.
2. **About 30 days** on it: `git log --since=30.days --no-merges -M --name-status <integration>`.
3. **No substantive change** in that window: the latest 20 non-merge commits instead (`git log -n 20 --no-merges -M --name-status <integration>`).

Both are starting points, not boundaries: lengthen or shorten the window when the history calls for it, and announce the window actually used. Check `git rev-parse --is-shallow-repository`; shallow or missing history goes in the announcement, since the selection rests on less.

## Selection

Select areas that each own a responsibility. Group changed paths into the directory, package or component they belong to, rather than listing that module's files one by one. A file that stands alone, such as a root glossary or a top-level config, is an area by itself.

- **Follow renames** (`-M`, `git log --follow`), so a moved or renamed module counts once, under its current path.
- **Weigh** repeated change (commits and distinct days touching the module), complexity (size, branching, callers) and the calling review's concern: an architecture review weighs module boundaries, a test review the modules whose tests changed or should have.
- **Exclude noise**: generated files, vendored code, lockfiles, build output and bulk mechanical commits (formatting, mass renames).
- **Domain guidance**: apply the guidance the calling review already reaches, such as guidance that keeps a stack's asset churn from dominating an architecture scan. The survey makes no lookups of its own.

Done when each selected area owns one responsibility and has a stated reason drawn from the history.

## Fallbacks

- **Scattered history**: no module stands out. Take a broader sample (more modules, or a longer window) and announce it as a sample.
- **No useful direction**: history is empty, all noise or too shallow to point anywhere. Offer a repository survey, or ask the user for an area. The focus comes from history or from the user.

## Announce

Replace the scope announcement with this:

```md
**Target:** hotspot survey: <module>, <module>
**Window:** <integration ref>, <since> to <sha>: <N> non-merge commits (or: latest 20 non-merge commits)
**History:** <full | shallow: depth N | unavailable>
**Selected:** <module>: <N> commits on <N> days, <reason>; <module>: ...
**Local changes:** <none | present, not in scope>
```

## Reviewing the areas

Review each selected area in its current state, as a whole: its responsibilities, interface, internals and callers. Historical diffs only pointed here; they never limit what is read. Existing problems found in a selected area are primary findings of the survey, since the area is the target.
