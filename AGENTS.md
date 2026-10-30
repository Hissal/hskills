## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues on `Hissal/skill-collection` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one root `GLOSSARY.md` plus `docs/adr/`. See `docs/agents/domain.md`.

### Skill format and collection check

Before writing a skill or changing the check, read `docs/skill-format.md`. Run `node scripts/check/check.js` and `node scripts/check/test/run.js`; both must pass.
