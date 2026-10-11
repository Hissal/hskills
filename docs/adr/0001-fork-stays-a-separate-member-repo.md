---
status: superseded by 0002
---

# The fork stays a separate member repo

The collection spans two repos: this one and the fork (`Hissal/mattpocock-skills-unity`), which stays the strict Unity edition of Matt Pocock's skills and the only place those skills are authored. This repo holds no copies of unmodified fork skills. We chose this because the fork's `git merge` from `mattpocock/skills` is the cheapest way to follow a fast-moving upstream, and a copy here would lag the fork the way the fork lags upstream.

A personal change too large for the fork becomes a fork override in this repo. References point from this repo to the fork, never the other way, so the fork stays usable alone.

## Considered Options

- **Absorb**: this repo is the single source and the fork is frozen or generated from it. Rejected: the upstream merges would move here without the git ancestry that keeps them cheap.
- **Upstream chain**: this repo merges the fork whole. Rejected: it brings in every fork skill unpicked and works per repo, not per skill.

## Consequences

The owner is not attached to the Unity edition as a product. Reconsider collapsing everything into this repo if any of these happens:

- Fork overrides stop being the exception (more than about five of the fork's generic skills carry one).
- The install design cannot serve two repos cleanly on both Claude Code and Codex.
- Upstream sync is skipped for months and the fork falls far behind.
