---
status: accepted
supersedes: 0001
---

# Every skill lives in this repo

This repo is the only authoring home for every skill in the collection, Matt-derived skills included. The owner wants one place that holds the whole collection and can be vendored from, and ADR 0001's split made that place span two repos. The fork (`Hissal/mattpocock-skills-unity`) becomes a source like any other. It is frozen for now, not deleted, and what happens to it later is undecided.

A Matt-derived skill is copied here from the fork and recorded against `mattpocock/skills` at the commit the fork last merged. The fork's Unity changes become the recorded local changes.

Amended by [#244](https://github.com/Hissal/skill-collection/issues/244): a Matt-derived skill is now copied straight from `mattpocock/skills` at a chosen commit, which is also its pin. The fork differs from upstream only by Unity lines the collection removes, so copying from it added work and nothing else. The fork is no longer a source for core skills; its Unity material reaches the Unity pack through ordinary intake. Entries copied under the earlier rule keep their pins.

## Considered Options

- **Stay split** (ADR 0001): the fork remains a member repo and this repo holds no copies. Rejected: none of 0001's tripwires had fired, but the split kept adding cost (a manifest, CI and locks over two repos, a third harness gate to add inside the fork's files) and the collection was never in one place.
- **Copy here and keep the fork in step**: rejected as a commitment. Every Matt-derived change would be made twice. The fork may still merge from upstream on its own.

## Consequences

- Updates from `mattpocock/skills` no longer arrive by `git merge`. They arrive per skill, by hand, through the drift report and a three-way merge the owner asks for. Skipping an update is normal.
- The provenance machinery carries far more skills than the handful it was first sized for.
- Fork overrides, their count tripwire and the rule that the fork never references the collection no longer exist.
- The rule that split Unity skills between the fork and this repo is gone: all of them sit in the Unity pack here.
