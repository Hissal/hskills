# Personal skill links

Run from a local checkout with Node.js installed:

```sh
node scripts/install/install.js --help
node scripts/install/install.js install
node scripts/install/install.js doctor
```

Install links the manifest's core list into `~/.claude/skills` and
`~/.agents/skills`. Checkout edits are live. Packs are excluded by default. The current
manifest is empty until skills are authored. This command installs no guards,
steering or plugins.

`~/.skill-collection/install.json` records each link's absolute path, target
and type. Preserve this record: losing it makes existing links unrecorded
conflicts. Install reconciles the recorded set with core, removing links for
skills that left core and adding new names. A no-change rerun leaves the
record and links unchanged. Missing recorded links are recreated. An entry
is removable only while it is still a link to its recorded target; a replaced
file, directory or link is reported and preserved. Unrecorded targets,
including existing links to the fork or even to this checkout, are always
conflicts. Move conflicts aside yourself when you intend to transfer ownership.
A replaced entry remains in the record for doctor to report.

Install ends with doctor; doctor also runs independently without writing files
or requiring the checkout manifest. Missing, replaced, dangling or invalid
recorded targets fail doctor. Conflicts and doctor failures exit nonzero.
There is no automatic rollback of successful links if another entry conflicts;
the record retains successful writes. Use one installer process at a time.

Linux and macOS use directory symlinks. Windows tries a directory symlink,
then a junction if Windows refuses permission or support for symlinks. Each
created link reports its type, also retained in the record and doctor output.
No symlinks are committed to git.

## Read permissions

The command prints JSON strings for Claude `permissions.allow`, covering both
installed link paths and checkout targets. Add the printed rules yourself to
your Claude settings; the command writes no settings or permissions. Absolute
rules start with `Read(//...)`; Windows drive paths use `//c/...` form.
Claude checks both the requested link and resolved target, so allowing only
the installed folder can still deny reading skill references. See the
[Claude permission rules](https://code.claude.com/docs/en/permissions#read-and-edit).
Existing deny rules may still block access. The earlier observed trap and
`--add-dir` workaround are in [loading evidence](../research/lazy-loading.md).

## Isolated verification

`--home DIR` changes the record home and default skill roots; `--source DIR`
selects a fixture checkout; `--claude-root DIR` and `--agents-root DIR`
override the two destination directories. All overrides are absolute-resolved.
Use temporary directories for all of these to avoid touching a real home.
The table-driven CLI cases run with real temporary directories through
`node scripts/install/test/run.js` and inside the collection check. They
exercise ownership, reconciliation, no-change reruns and doctor failures.

Windows hand validation is still missing for #116. On Windows, run the cases
and perform isolated installs with symlink permission enabled and disabled;
record both the symlink and junction outcomes on #116, including doctor and
permission-rule output. Linux automated results do not establish either
Windows outcome, so #116 is not fully complete.

## Personal extras

Install a whole named pack alongside core at user scope:

```sh
node scripts/install/install.js install --pack onboarding
```

The ownership record remembers selected packs. Plain `install` reruns reconcile
all remembered packs against the current manifest, adding new members and
removing only recorded links that left the selection. Core and other selected
packs remain installed. A missing remembered pack is an error before link changes.

Link one named collection skill into the current Git project:

```sh
node /path/to/collection/scripts/install/install.js install --skill tdd
# Or select the project explicitly:
node scripts/install/install.js install --skill tdd --project /path/to/project
```

This creates `.claude/skills/tdd` and `.agents/skills/tdd`, recording both in the
user ownership record. Project selections are remembered on reruns too. Skill
names must uniquely match a folder name in the manifest. Existing unrecorded
entries in either folder are conflicts and remain untouched.

Exact link paths are added to the repository's local Git `info/exclude`, with
new rules recorded in the ownership record. Existing rules are preserved and
never claimed or removed. Tracked paths (including tracked descendants) are
conflicts, even when missing on disk; no ignore rule is added for them. Git
worktrees use their Git-resolved exclude location. Run only in trusted project
repositories. The command never stages or commits anything and writes no project
lock. A personal extra never goes in a per-person lock.

## OpenCode: evidence status (#125)

On 2026-10-30 in this Linux environment, `command -v opencode` returned no
path. No OpenCode session ran. Claude Code reported `2.1.312`, but that is
not an OpenCode version or evidence of OpenCode reading Claude steering.
[#125](https://github.com/Hissal/skill-collection/issues/125) remains open.
The invocation gate, listing count with both user roots, and Claude steering
fallback all remain **untested**. The pending procedure below defines the
observations needed for each.

The [loading research](../research/loading-mechanics.md) and
[trigger stream sources](trigger-evals.md#offline-injection-and-evidence-limits)
are documented research, not hand-run evidence for these checks. Installer
and gate checks establish filesystem/output correctness, not harness behaviour.

### Remaining hand run

Use an already installed OpenCode runtime with an authenticated, available
`provider/model`, Node.js, and a disposable home and scratch project outside
this checkout. Isolate `HOME` and the XDG config/data/cache/state directories
for every OpenCode process; provision authentication only in that disposable
scope. Record `opencode --version`, the exact model, OS, collection commit,
configuration and both skill roots. Do not install a harness or write to the
real home as part of this procedure.

1. Copy the [fixture](../scripts/eval/test/fixture/SKILL.md) into a temporary
   source tree at `skills/core/fixture/SKILL.md`. Give that tree a
   `collection.json` containing
   `{"core":["skills/core/fixture"],"packs":{},"expensive":[]}`.
   Add `disable-model-invocation: true` and a frontmatter `metadata` mapping
   containing `opencode/autoinvoke: "false"`. Install both roots with:
   `node scripts/install/install.js install --source "$fixture_source" --home "$fixture_home"`.
   **Done:** doctor passes and both links resolve to the same gated fixture.
2. From the empty scratch project, run
   `opencode run --format json --model "$model" "Count the vowels in banana."`
   with the isolated environment. Save the transcript and actual available-skill
   listing; count entries for `fixture`, distinguishing listing from body load.
   Repeat in fresh sessions with the other matching prompts in the trigger
   sample. Check tool events, not just the final vowel count. Compare with an
   explicit invocation and a model-invoked fixture control to show discovery and
   authentication work; denied, missing or unobservable calls are inconclusive.
   **Done:** each fresh session has a saved listing count and tool-event verdict;
   matching requests leave the gated fixture uninvoked, and controls load it.
   If the listing contains duplicates, record the finding and options for the
   owner before changing install behaviour.
3. Put a unique response instruction only in the disposable
   `~/.claude/CLAUDE.md`. With no project or native OpenCode steering files,
   run a fresh neutral prompt using the same command flags. Save the transcript
   and compare with a fresh session after removing that instruction; record
   whether the marker follows the Claude-file fallback.
   **Done:** both transcripts and the OpenCode version are saved, with a verdict
   on whether only the Claude-file arm follows the unique instruction.

Before running, read the [trigger evidence rules](trigger-evals.md) for
repetitions and event-schema limits. These commands are pending, not executed
results. Keep transcripts locally until publication is authorized. Completion
requires each live outcome and harness version recorded on #125; until then,
leave the issue open.
