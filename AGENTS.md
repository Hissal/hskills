## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues on `Hissal/skill-collection` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one root `GLOSSARY.md` plus `docs/adr/`. See `docs/agents/domain.md`.

### Collection maintenance

Skill folders, frontmatter, references and the collection check: [Skill format](docs/skill-format.md). Run `node scripts/check/check.js` and `node scripts/check/test/run.js`; both must pass. After changing the gate writer, also run `node scripts/gates/test/run.js`. Run `npm ci` once first, so the check runs the pinned agnix.
Hook structure, failure policy and verification: [Hook house style](docs/agents/hook-house-style.md).
Research notes, citations and source ledgers: [Research area rules](docs/agents/research-rules.md).
