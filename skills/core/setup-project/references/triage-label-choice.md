# Triage label choice

Ask exactly one question, showing the defaults:

> Do you want to keep the default triage labels? (recommended: **yes**) `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`.

These are the five canonical roles, each label string equal to its name. On **yes**, write no table: no `docs/agents/triage-labels.md` and no `### Triage labels` sub-block, because a missing table means these defaults. Only if the user says no, usually because their tracker already uses other names (e.g. `bug:triage` for `needs-triage`), collect the overrides so `triage` applies existing labels instead of creating duplicates.

With overrides, write `docs/agents/triage-labels.md` from its seed, keeping a row only for each role whose label differs, and add the `### Triage labels` sub-block.

When this section ran on GitHub or GitLab, take all five roles under their configured strings, overrides and defaults alike, and find which the tracker lacks (`gh label list` / `glab label list`). List those in the draft, and once it is approved, create them (`gh label create` / `glab label create`).
