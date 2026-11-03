# The `## Agent skills` block

One sub-block per section that writes one, in this order:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of how the labels differ from the defaults]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout: "single-context" or "multi-context"]. See `docs/agents/domain.md`.

### Check commands

[one-line summary of the commands and tiers]. See `docs/agents/check-commands.md`.

### Style guide

[the one conditional pointer line from Style guide below]

### Evidence

[one-line summary of how the evidence facts differ from the defaults]. See `docs/agents/evidence.md`.

### Guard extensions

[one-line summary of the added cases]. See `.agents/config/command-guard.json`.

### Packs

- `<guide's exact callable name>`: <its domain in a few words>. See `docs/agents/<pack>.md`.

### Vendor docs

[one line per selected document: when to read it and where].

### Vendor sources

[one-line summary of the sources]. [Only when any follow a dependency: "When changing <those dependencies>, follow the check there."] See `docs/agents/vendor-sources.md`.

### Setup handoff

[how many setup questions are open, only while any are]. See `docs/agents/setup-handoff.md`.
```
