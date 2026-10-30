# Skill format

What a skill folder in this collection holds, and the check that keeps the tree sound. Specs and tickets that build skills use this format and do not restate it. Decided in [#42](https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887) (disclosure, modes, scripts), [#74](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759) (reachability) and [#18](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944) (layout); specified in [#77](https://github.com/Hissal/skill-collection/issues/77).

- [Skill tree](#skill-tree)
- [Skill folder](#skill-folder)
- [Frontmatter](#frontmatter)
- [Disclosed references](#disclosed-references)
- [Scripts](#scripts)
- [Portability](#portability)
- [Line endings](#line-endings)
- [The collection check](#the-collection-check)
- [Adding a rule](#adding-a-rule)
- [Adding a fixture](#adding-a-fixture)

## Skill tree

One skill tree serves both install routes (folder and plugin):

- core skills: `skills/core/<skill>/`
- pack skills: `skills/packs/<pack>/<skill>/`

Vendor baselines, licences and scripts sit outside the skill tree; the manifest and the always-on source sit at the root.

## Skill folder

One folder per skill, with `SKILL.md` at its root. The folder is the installed unit: everything the skill bundles lives inside it. The folder name is the skill's callable name.

## Frontmatter

`SKILL.md` opens with YAML frontmatter:

- `name`: the callable name, matching the folder.
- `description`: for a model-invoked skill, the trigger only: when to load it, never what it does step by step. Quote a description that contains `: ` (`description: "Use when: ..."`). Claude Code tolerates the unquoted form, but strict YAML loaders such as `npx skills` skip the skill without a word.
- `when_to_use` (optional): further trigger text, counted with the description.
- `disable-model-invocation` (optional): `true` makes the skill user-invoked. It is the single source for the gate on every harness; the Codex and OpenCode gates are written from it.

## Disclosed references

- What every branch of the skill needs stays in `SKILL.md`. Detail only some branches need goes in a reference file in the skill's own folder.
- Every reference is linked straight from `SKILL.md`, so none is reachable only through another reference.
- Mutually exclusive modes get one reference each, and `SKILL.md` says to read exactly one.
- A reference over 100 lines opens with a contents list: a list of in-page links (`- [Setup](#setup)`), or a list under a `Contents` heading, before its first section.
- Keep the `SKILL.md` body within 500 lines; past that, disclose.
- Name a bundled file with a relative Markdown link from the file that mentions it: `[FORMS.md](FORMS.md)`, `[detect](scripts/detect.js)`. A link is what the agent follows and what the check resolves; a path in a code span is neither.

## Scripts

- A bundled script is a black box: the skill tells the agent to run it with `--help` first, never to read it.
- Detection lives in a script that prints `KEY: value` lines; the prose branches on those keys.
- The skill names any dependency the script needs installed.
- Bundle any script an eval run showed the agent rebuilding each time.

## Portability

A skill's folder works wherever it is installed. It never assumes a sibling folder, a repository checkout or one installation scope (user, project or plugin). Knowledge a skill requires from another skill resolves through that skill's installed identity, not through a path.

## Line endings

The repository is LF everywhere, with no UTF-8 BOM: either breaks frontmatter and shebang detection on some Linux tools. `.gitattributes` makes every text checkout LF, Windows included; the check fails on a CRLF or a BOM in any collection text file.

## The collection check

```
node scripts/check/check.js
```

It checks the working tree's tracked and untracked, non-ignored files, so a new skill is checked before it is staged. Each finding is one line naming the file and the rule:

```
FAIL skills/core/alpha/SKILL.md:3 [description-colon] description contains an unquoted ": "; ...
WARN skills/core/alpha/REF.md [reference-unlinked] reference is not linked from ...
```

It exits 1 on any `FAIL`; warnings never fail the run. Rules:

| Rule | Level | Finding |
|---|---|---|
| `utf8-bom` | fail | a text file starts with a UTF-8 BOM |
| `crlf-line-ending` | fail | a text file has a CRLF line ending |
| `description-colon` | fail | an unquoted `description` contains `: ` |
| `missing-file` | fail | a Markdown file in a skill links a path inside the skill folder that is not in the collection |
| `skill-body-length` | warn | a `SKILL.md` body over 500 lines |
| `reference-contents` | warn | a reference over 100 lines with no contents list |
| `reference-unlinked` | warn | a reference not linked straight from `SKILL.md` (`NOTICE.md` excepted) |

Test the check with its fixture runner:

```
node scripts/check/test/run.js
```

Every change to the check keeps both green: the runner, and the check on the real tree.

## Adding a rule

1. Write `scripts/check/rules/<id>.js` exporting `{ id, level, check }`. `level` is `'fail'` or `'warn'`. `check(c)` returns findings `[{ file, line?, message }]`; `file` is repository-relative with `/`, and `message` says what to do.
2. List it in `scripts/check/rules/index.js`. The registry is the only list of rules: `check.js` runs whatever it holds.
3. Add its row to the table above.
4. Add its fixtures (next section).

`c` is the collection view from `scripts/check/collection.js`; read it there rather than re-listing files or re-parsing frontmatter in the rule. It carries every checked file (`files`, `bytes`, `text`, `isText`, `exists`), the skills under `skills/` (`dir`, `name`, `skillMd`, `files`, `frontmatter` lines, `body` lines and their line numbers), `references(skill)` and `links(file)`. A rule that needs another shared fact (the manifest, git history) adds it to the view so later rules reuse it.

## Adding a fixture

Add a case to `scripts/check/test/cases.js`; the runner needs no change. A case is a fixture collection tree and every finding the check must print:

```js
{ name: 'a reference not linked from SKILL.md warns',
  files: skill('skills/core/alpha', { body: 'Read [a](A.md).\n', files: { 'A.md': 'See [b](B.md).\n', 'B.md': '# B\n' } }),
  expect: ['warn reference-unlinked skills/core/alpha/B.md'] },
```

- `files` is written untracked into a scratch git repository; `committed` (same shape) is committed first.
- `expect` lists each finding as `<fail|warn> <rule> <file>`. A finding not listed fails the case, and the exit code must be 1 exactly when a `fail` is expected. Wording and line numbers are not compared.
- Each fail rule gets a failing fixture and a passing neighbour (`expect: []`); each warning gets a fixture that warns and exits zero.
- Build skills with `skill()` and `skillMd()`, which produce a skill that passes every rule. A rule that makes a new field required adds that field to `skillMd()` once, so every existing case stays a passing neighbour.
- Write CRLF, BOM and other bytes as escapes in the case (`'\r\n'`, `'﻿'`), so the repository itself stays LF and BOM-free.

<<<<<<< HEAD
## Skill identity and hard requirements (#95)

Author identity once, in string-valued `metadata` in `SKILL.md`:

```yaml
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/example"
  agent-skills-sync.requires: '["hissal.skill-collection/knowledge"]'
```

Schema is the string `"1"`, not the number `1`. IDs use the publisher prefix
`hissal.skill-collection/` and a lowercase kebab-case slug. Each ID is unique
and survives callable renames, folder moves, address and installation scope
changes. Other publishers can adopt the same metadata keys with their own
prefix; this collection currently rejects external IDs and requirements until
an external locator/version contract exists.

`requires` is a JSON array of ID strings inside a YAML string. Omit it, use an
empty string, or use `'[]'` for no requirements. Declare only knowledge the skill
cannot work without. Optional pack lookups, suggestions, related reading and
process calls are not hard requirements and grant no invocation authority.

Requirements resolve by ID against the whole collection tree at the same
revision, across core and pack folders, rather than relative to the caller's
installation scope. Every required ID must resolve; cycles, including self
requirements, fail. A reference in a required skill is named with a relative
Markdown link into that skill's folder, using the existing file-link convention;
the target must exist in the resolved requirement's folder. This applies to links
from both the calling `SKILL.md` and its Markdown references. Code spans and
fenced examples do not declare file links.

Metadata uses an indented YAML string mapping. Plain, single-quoted,
double-quoted and literal/folded block strings are supported; structured YAML
values, aliases and duplicate keys are rejected. Use quoted scalars for values
such as numbers or booleans that YAML would otherwise interpret as non-strings.

Additional fail rules:

| Rule | Level | Finding |
|---|---|---|
| `skill-metadata` | fail | missing or invalid schema/ID, malformed requirements or duplicate ID |
| `skill-requirements` | fail | a requirement outside the resolved set or a requirement cycle |
| `requirement-reference` | fail | a Markdown link names a missing file in a required skill's folder |
=======
## Continuous integration

[Collection check](../.github/workflows/collection-check.yml) runs the fixture runner
and the same collection check command on every push and pull request, on Windows
and Linux. Either command failing fails its job; both platforms run even if one
fails. Checkout includes history and tags for checks against the last release.
There is no pre-commit hook.

The workflow's `CLAUDE_CODE_VERSION` is the single Claude Code CLI pin, matching
the version inspected in [loading-mechanics research](../research/loading-mechanics.md).
Bumping it requires re-verifying that research. CI installs the CLI but does not
run the hand-run trigger evals or authenticate a model session.
>>>>>>> origin/ci/run-collection-check
