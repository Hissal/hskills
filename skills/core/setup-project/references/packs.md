# Packs

The `### Packs` list is how core skills reach pack knowledge: they read it to find which pack guides to ask. It says which packs apply to this project, one line per pack, and each line names the pack's guide, never its other skills.

Either run ends with the same [line](#the-pack-line) and [fact file](#the-fact-file). The draft, approval and write stay with [Deliver guidance](../SKILL.md#4-deliver-guidance): a pack's writes join that draft and land after the core files.

## Full run

After the core sections, take every pack guide you can [find](#find-the-guides), one at a time. A pack guide is named `<pack>-guide`, with a plugin prefix when a plugin installed it; `<pack>` throughout is that name without the prefix or `-guide`. Done when each one is listed, or ruled out with a one-line reason, and each listed guide you cannot find has been reported.

1. [Find its `SETUP.md`](#find-setupmd).
2. **Decide whether it applies.** Compare the `SETUP.md` detection signals with what exploration found and what the owner said they intend to build; with no `SETUP.md`, compare the guide's listing description. A clear match applies. A clear mismatch drops the pack, with one line saying why. When it is unclear, ask one question, leading with your recommendation. A pack the list already names is settled, under the same rule as any settled choice.
3. [Check its hard dependencies](#missing-hard-dependency).
4. **Run its section.** Follow its `SETUP.md` as a section of this skill: one answer at a time, the recommended answer first, every default shown with its value. A companion pack it names is a recommendation: pass it on in the report and carry on, whether or not it is installed. With no `SETUP.md`, the pack has nothing to configure, so this step is empty.
5. **Add the line** to the draft.

A listed guide you cannot find keeps its line. Report that core skills cannot reach it until it is installed again.

## One-pack run

`/setup-project <pack>` runs one pack's section and nothing else. `<pack>` means the guide `<pack>-guide`, or the guide's exact name.

- Naming the pack settles that it applies, so skip step 2 of the full run and run the others.
- Explore only what this section needs: the [instruction file](../SKILL.md#instruction-file), its `### Packs` list, the pack's fact file, and whatever its `SETUP.md` tells you to inspect.
- Ask no core section and touch no core file. Every other line of the block stays byte-for-byte; a project with no block gets one holding only `### Packs`.
- When no [installed guide](#find-the-guides) matches, name the ones you found, and end the run with nothing written.

Done when the pack's line and fact file are approved and written, or already match, and the report names anything the pack cannot do. When the block has no core sub-blocks, the report also says that `/setup-project` sets those up.

## Find the guides

A session's skill listing can predate this run's installs, so take the three places together:

- Your skill listing.
- The project's skill folders on disk: `.claude/skills/*-guide/` and `.agents/skills/*-guide/`. The folder name is the callable name.
- Packs picked in this run's recommendations and not yet delivered, which step 4 will install. A plugin pick's callable name is `<plugin>:<pack>-guide`; any other pick's is the folder name.

## Find `SETUP.md`

It sits beside the guide's `SKILL.md`. For a guide in your listing, load it by its exact listed name through the skill tool, which shows its folder; on a harness without one, take the folder from the path your skill listing gives. You load it only to find the folder: ask it nothing, and carry on past any line saying it is not set up, since this run is what sets it up.

For a guide on disk alone, read both files from its folder. For a pick not yet delivered, read them where [Recommendations](recommendations.md#2-discover) read them.

## The pack line

```markdown
### Packs

- `<guide's exact callable name>`: <its domain in a few words>. See `docs/agents/<pack>.md`.
```

Copy the callable name from [where you found the guide](#find-the-guides), plugin prefix included. Take the domain from the `SETUP.md` or the guide's description. A pack with no `SETUP.md` has no fact file, so its line ends at the domain.

Update the list in place. An existing line stays word for word unless its name or pointer is now wrong.

## The fact file

Each pack with a `SETUP.md` has one fact file, `docs/agents/<pack>.md`, written from the seed its `SETUP.md` gives, and always written so the line's pointer resolves. It opens with this line, and it may hold nothing else when no fact differs from a default:

> A missing field means the owning skill's default.

It holds facts with no default, and any other fact only where the project differs. Each one points at the repo's own docs by a repo-relative path, leaving their content where it is.

An existing fact file holds the user's edits: read it first, keep what it settles, and change only the lines a changed choice touches.

## Missing hard dependency

A pack's hard dependencies are the skill IDs in `agent-skills-sync.requires`, a JSON array in the frontmatter of its guide's `SKILL.md`. An ID is met when a skill carrying it is in [one of those places](#find-the-guides): look for the name in the ID's last segment, and read that skill's `agent-skills-sync.id` when its file can be read.

For each one unmet, state plainly when you find it, and again in the report:

> The `<pack>` pack will not work without `<dependency>`. Install it through the project's skill route, then re-run `/setup-project <pack>`.

`<dependency>` is the last segment of the ID.

Then carry on. The pack's own section still runs and its line is still written, so the facts are ready once the dependency arrives. The core sections and the other packs are untouched by it.

## Report

For each pack: applied, ruled out or kept, what its section wrote, each companion it recommends, and each unmet dependency with its statement.
