# Style guide choice

The project picks one style guide, and the project's style tooling configuration takes precedence over it.

## Find what exists

- **Tooling configuration**: `.editorconfig`, compiler and type-checker settings, linter and formatter configuration, wherever this project keeps them.
- **A written guide**: `CODING_STANDARDS.md`, `CONTRIBUTING.md`, or a file that an instruction file already treats as the project's coding guide.
- **Offered templates**: the style offers in the `SETUP.md` of each pack selected for this project, or with an installed guide whose detection signals fit it. Templates are per pack, and a pack may offer none, so read each offer rather than expecting one.

## Offer the choice

Offer these three kinds, leading with the recommendation: an existing written guide first, otherwise a pack's light default where one is on offer, otherwise the project's own.

- **A pack's light default**: a short template the pack's `SETUP.md` names.
- **The owner's kit**: the owner's full style kit for this stack, from a pack's `SETUP.md` or a path or URL the user gives.
- **The project's own**: a guide already in the repo, or one the user will write.

Name what each kind resolves to here. A kind with nothing behind it is stated in one line ("no pack offers a light default for this stack", "the kit is not written yet") and stays visible as unavailable. A user may also choose no written guide; the pointer then names tooling configuration alone.

## Put the guide in the project

The selected guide lives in the project, so ordinary work reads it without the pack installed.

- **A template or kit**: copy it to the destination its `SETUP.md` names, else `docs/agents/style-guide.md`.
- **The project's own**: leave the file where it is. When the user will write it later, write no pointer to it yet, and name that as unresolved in the final report.

The guide is guidance, not a fact file, so it takes no missing-field header.

## Write the pointer

The pointer is one conditional line in the block, under `### Style guide`, naming only files that exist. On a run that scaffolds, step 4 writes it with what exists then, and step 6 adds the tooling paths the scaffolder created:

```markdown
When writing or reviewing code, read the coding guidance in `<guide path>` and the tooling configuration in `<tooling paths>`. Tooling configuration wins; flag any disagreement.
```

With no tooling configuration yet, the line is `When writing or reviewing code, read the coding guidance in <guide path>.` With no written guide, the line is `When writing or reviewing code, read the tooling configuration in <tooling paths>.` With neither guide nor tooling configuration, write no sub-block.

## Flag conflicts

Compare each rule the guide states against the tooling configuration on the same topic (indentation, quotes, line length, naming, nullability). For each disagreement, name the guide line and the tooling setting, and say that the tooling setting wins. A guide rule the tooling says nothing about is no disagreement. Put the list in the draft when there is one, and always in the final report.

The guide and the tooling stay as they are unless the user asks for one to change. Run this comparison in step 6, against the project as it then stands, on every run that has a guide, settled or not; a settled pointer with a new disagreement gets the flag and keeps its line.
