# Vendor sources

What [Recommendations](recommendations.md) delivered stays known and current through one prose file, `docs/agents/vendor-sources.md`. It covers vendor skills and plugins, skills copied from a dependency, documentation pointers, hooks and always-on instructions. Skills and packs from `Hissal/hskills` stay with `skills-lock.json` and the `### Packs` list.

Done when every delivered or waiting pick has its entry, every entry has a one-line result in the run's report, each change is delivered or named as declined or not checked, and anything setup did not write is byte-for-byte as it was.

## Contents

- [The file](#the-file)
- [Record](#record)
- [Check on a re-run](#check-on-a-re-run)
- [Remove](#remove)

## The file

Write it from this seed. The block's `### Vendor sources` sub-block links it. The dependency check sits in the file because an agent changing a dependency may not have this skill.

```markdown
# Vendor sources

> A missing field means the owning skill's default.

Guidance this project selected through `/setup-project`. Versions live in `skills-lock.json`, the package locks and plugin settings, so none are written here.

## When you change a dependency

For each entry whose **Follows** names it, within your task's authority, and otherwise report what you left:

- **Docs**: the path in the line still exists at the new version. When it moved, correct the line in `### Vendor docs` and here together, in one word-for-word edit.
- **Skills**: compare each copy with the package's own folder, `diff -r .agents/skills/<name> <package folder>/<skill folder>`. When they differ, run the entry's **Route** again.
- **Dependency removed**: delete the `### Vendor docs` line that matches **Docs** word for word, and nothing else; a similar line stays and goes in your report. Run `npx skills remove <names> --yes` for those of its **Skills** whose `skills-lock.json` entry names the source in **Route**; a folder whose lock entry names another source, or that the lock does not list, is not this entry's and stays. Then delete the entry.

Run `/setup-project` for anything else. On Node 20 the `skills` CLI fails with a `glob` SyntaxError; run it as `npx -p node@22 -p skills -c 'skills <arguments>'`, dropping the command's own `npx`.

## <source>

- **Workspace**: <repo-relative folder>
- **Follows**: <dependency, as its manifest names it>
- **Skills**: <skill names>
- **Whole set**: yes
- **Docs**: <the `### Vendor docs` line, word for word>
- **Route**: <the delivery command, leaving out any ref>
- **Remove**: <the vendor's command for a hook or always-on instruction>
- **Waiting**: <what the pick waits for>
```

One entry per source and workspace, headed by `<owner>/<repo>`, `<plugin>@<marketplace>`, the dependency's name, or the host of a documentation pointer that has none of these. Keep only the fields an entry needs:

| Missing field | Means |
|---|---|
| **Workspace** | the repo root |
| **Follows** | the source updates on its own, whatever the dependencies do |
| **Skills** | no skill picks: documentation, or a plugin that enables itself whole |
| **Whole set** | only the skills named. `yes, except <names>` keeps the owner's standing choice minus those, and **Skills** still names what is installed today |
| **Docs** | no pointer of setup's |
| **Remove** | the [removal](#remove) the pick's kind already has |
| **Waiting** | delivered |

**Whole set** is the owner's answer "every skill, now and as that source adds more". Record it whenever they gave that answer, because a pinned `--skill '*'` keeps no trace of it.

## Record

For each pick delivered or named as waiting, add or update its entry in the draft, then write it with the delivery. A failed install takes no entry.

Copy a new pointer into **Docs** exactly as the draft writes it in `### Vendor docs`. That word-for-word match is what makes a line setup's own, so the user's file carries no marker. A line already in `### Vendor docs` before this pick stays the owner's, and its entry takes no **Docs**.

## Check on a re-run

This runs in [Recommend](../SKILL.md#2-recommend), so what it finds joins the draft. Check each entry against its source of truth, and report one line per entry: current, changed (with the installed version, and the earlier one when the lock's git history shows it), missing, or not checked (with the next step). Entries are settled choices; these checks change nothing until the owner approves a draft line. A run that finds nothing to change has no draft.

Say before each download why it runs: `git ls-remote` reads refs only, `--list` and `skills add` clone the source. A source you cannot reach is `not checked` and its entry stays. Read a restored dependency from disk; restoring one is the owner's step, so an unrestored dependency is `not checked` with its restore command as the next step.

| Entry has | Check | When it differs |
|---|---|---|
| **Follows** | Installed version from the package lock. Any dependency gone from its manifest goes to [Remove](#remove). | Run the file's dependency check; its edits join the draft. |
| **Docs** | The line is in `### Vendor docs` word for word, and its path or URL still resolves. | A dead path on an entry with **Follows** goes through the dependency check; ask when the new version shows no clear successor, or for a dead URL. With the line missing or changed, ask once: keep the current text as setup's, restore the recorded line, or drop the entry. |
| **Skills** | Folders in `.claude/skills/` and `.agents/skills/`, and each in `skills-lock.json` under this source. | Offer the **Route** again to restore what is missing. |
| A pinned `ref` in `skills-lock.json` | The source's newest ref, resolved as [Deliver](recommendations.md#6-deliver) resolves it. `skills update` reports a pinned install up to date however far behind it is, so compare the refs yourself. | Report both refs and offer the **Route** at the newer ref; on a yes it joins the draft. |
| No pinned `ref` | Nothing to compare: `npx skills update <names> --project --yes` is the updater, offered like a pinned refresh. | |
| A plugin | `.claude/settings.json` still enables it. | Offer `claude plugin update <plugin>@<marketplace> --scope project`. |
| **Whole set**, with **Skills** | `npx skills add <owner>/<repo>#<newest ref> --list` against **Skills** and the exceptions. | See below. |
| **Waiting** | Whether the dependency is restored now. | Deliver the pick through [Deliver](recommendations.md#6-deliver) and clear the field. |

**A whole set acts on its record.** New skills are the owner's standing choice: read each one's folder at that ref, put it in the draft unprompted with its idle cost and the **Route** at the newer ref, and add it to **Skills**. That **Route** moves the set's other skills to the same ref too, so the draft names which of them change. A hook or always-on instruction in one still takes the separate yes from [Take the choice](recommendations.md#5-take-the-choice). Skills the source dropped stay installed after a newer `add`, so put each in the draft for [removal](#remove). A set with exceptions lists its skills after `--skill` in the **Route** in place of `'*'`, so an exception stays out. A plugin brings its own additions, so its check is the plugin row.

A pointer to bundled documents follows its dependency by itself: a bump with the path intact needs no edit, only the report line.

## Remove

Fires when the owner deselects a pick, or a followed dependency leaves its manifest. Separate installs with no **Follows** stay, reported as a question when they no longer fit the stack. List exactly what goes in the draft. After approval, working in the entry's workspace:

| What | Removal |
|---|---|
| **Docs** | Delete the `### Vendor docs` line that matches word for word, and nothing else. A similar line stays and is named in the report. Remove the sub-block only when no line remains. |
| **Skills** | `npx skills remove <names> --yes` for those whose lock entry names the source in **Route**, then confirm both folders and the lock entries are gone. A folder whose lock entry names another source, or that the lock does not list, is not this entry's and stays. |
| A plugin | `claude plugin uninstall <plugin>@<marketplace> --scope project`. The marketplace stays registered. |
| Hook or always-on instruction | **Remove**. A block the vendor's tool generated belongs to that tool: edit it only through that command, and otherwise name it for the owner. |

Deselecting one skill from a whole set removes that skill and adds it to the exceptions. Then delete what the removal emptied: the field, the entry, and with the last entry the file and its sub-block. A file holding text setup did not write stays, with that text.
