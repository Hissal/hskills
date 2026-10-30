# Personal skill links

Use this route for live checkout links: core at user scope, optional packs, or
personal project extras. For a team's committed selection and release pinning,
read [Project skills and the resolver contract](project-install.md).

## Install core

From a local checkout with Node.js installed, run:

```sh
node scripts/install/install.js install
```

Install links the manifest's core list into `~/.claude/skills` and
`~/.agents/skills`. Checkout edits are live. Membership comes from
[`collection.json`](../collection.json); an empty selection creates no skill links.
For optional packs or project links, see [Personal extras](#personal-extras).
For personal steering, see [Owner-only personal steering](#owner-only-personal-steering).
The default install manages core skills and the command guard; skill plugins
remain separate. See [Command guard and recovery](#command-guard-and-recovery)
for registration, ownership and recovery.

Add the printed Claude allow rules as described under [Read permissions](#read-permissions).
Run `node scripts/install/install.js doctor`. Installation is complete when
install and doctor exit zero and Claude can read an installed skill and its
needed references. An empty selection verifies only the command and record,
not skill availability. Resolve any reported conflicts using
[Ownership and repair](#ownership-and-repair), then rerun.

## Read permissions

The command prints JSON strings for Claude `permissions.allow`, covering both
installed link paths and checkout targets. Add the printed rules yourself to
your Claude settings; the command writes hook registrations but no permission
rules. Absolute rules start with `Read(//...)`; Windows drive paths use `//c/...` form.
Claude checks both the requested link and resolved target, so allowing only
the installed folder can still deny reading skill references. See the
[Claude permission rules](https://code.claude.com/docs/en/permissions#read-and-edit).
Existing deny rules may still block access. The earlier observed trap and
`--add-dir` workaround are in [loading evidence](../research/lazy-loading.md).

## Personal extras

Install a whole named pack alongside core at user scope:

```sh
node scripts/install/install.js install --pack onboarding
```

The [ownership record](#ownership-and-repair) remembers selected packs. Plain `install` reruns reconcile
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
names must uniquely match a folder name in the manifest. The [ownership and repair rules](#ownership-and-repair) apply to both destinations.

Exact link paths are added to the repository's local Git `info/exclude`, with
new rules recorded in the ownership record. Existing rules are preserved and
never claimed or removed. Tracked paths (including tracked descendants) are
conflicts, even when missing on disk; no ignore rule is added for them. Git
worktrees use their Git-resolved exclude location. Run only in trusted project
repositories. The command never stages or commits anything and writes no project
lock. A personal extra never goes in a per-person lock.

For either extra, finish the permission and doctor steps under
[Install core](#install-core). Confirm the selected links exist in both
skill roots. For project links, `git ls-files` must list neither link nor
its descendants, and `git check-ignore` must confirm both link paths are ignored.

## Ownership and repair

`~/.skill-collection/install.json` records each link's absolute path, target
and type. Preserve this record: losing it makes existing links unrecorded
conflicts. Install reconciles the recorded set with core and remembered personal extras,
removing links that left the selection and adding new names. A no-change rerun leaves the
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

## Owner-only personal steering

Only the owner should opt in:

```sh
node scripts/install/install.js install --owner-steering
```

This links the checkout's root `steering.md` to `~/.claude/CLAUDE.md` and
`~/.codex/AGENTS.md`. OpenCode uses the Claude file as its fallback.
The ownership record remembers the opt-in; later installs without the flag
keep managing these two files. Without opt-in, no steering file is touched.
The current source is partial: two tooling notes remain unrecovered (#118).
Linking it does not establish that those notes have been restored.

An existing unrecorded entry is a conflict, even a link to this source.
Move it aside yourself once, preserving any text you need, then rerun.
The installer never replaces an unrecorded file, directory or dangling link.
A replaced recorded entry is preserved and fails doctor.

The installer tries a file symlink on every OS. If permission or support
prevents it, it creates an exclusive copy and records its content digest.
Doctor runs after install and on demand, reporting missing or replaced links
and any difference between a copy and its source. It also detects local copy
edits. Copies are not refreshed automatically: preserve local edits, move the
copy aside, then rerun install to recreate the missing recorded entry.
Switching checkouts with existing steering entries reports a source conflict;
keep using the recorded checkout or move the entries aside before reinstalling.

During migration, manually empty Claude Code's PR attribution setting
(`attribution.pr`) so the PR skill supplies the single attribution footer.
Keep commit co-author trailers (`attribution.commit`) enabled.
The installer does not change either setting.

Windows actual validation remains missing for #119. Run isolated installs on
Windows with file-symlink permission enabled and disabled, then record whether
a symlink or copy was made and verify doctor drift detection on the copy.
The automated permission-denial case uses real temporary files but does not
establish actual Windows behavior.

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

## OpenCode: evidence status (#125)

Re-checked on Linux on 2026-10-30 with
`/home/agent/.opencode/bin/opencode` reporting **`opencode v2.2.2`**.
The earlier finding in commit `f73f2d64338521459f36ff838e518ab3688a2ad6`
confused a noninteractive PATH miss with an unavailable executable. It is
superseded by this run: the executable works. Interactive login-shell PATH
includes its directory; use the explicit executable for reproducibility.

The re-check used collection base `274de14` (including integration tip
`711a8ae`), a private temporary HOME and XDG config/data/cache/state roots,
and an empty scratch project outside the checkout. A SQLite backup of the
existing OpenCode database supplied the stored OpenCode Console authentication
without printing credentials or modifying the original database. No existing
user settings or steering files were copied or edited. The temporary database
contains credentials: keep it private and delete it after diagnosis.

Observed outcomes:

| Probe | Outcome |
| --- | --- |
| Installer fixture with `disable-model-invocation: true` and `metadata.opencode/autoinvoke: "false"` | Both user roots linked the same fixture; doctor passed. |
| `models --standalone` | `ServiceUnavailableError: Location plugins did not finish activating`; no model list. |
| `debug agents --standalone`, both roots populated | Same startup error; no listing, so the listing count is unknown. |
| Real `run --standalone --format json` vowel prompt | Exit 1: JSON `provider.quota`, HTTP 402, `Upstream request failed: Insufficient account funds`; no model response or skill event. |
| Claude steering marker present / absent, fresh `run` processes | Both exit 1 with the same HTTP 402 quota error; no model response. |

The requested model selector for the run attempts was
`opencode/gpt-6.1-sol#medium`, representing the requested Sol Medium model.
It is **unverified**, because provider model discovery failed before it could
confirm a supported selector. No other model was substituted.
The gate prompt was `Count the vowels in banana.`;
the steering prompt was `Reply with hello.` in two fresh sessions, with
`For every reply append the exact marker STEERING_125_CLAUDE.` present
only in the disposable `~/.claude/CLAUDE.md` for the first arm. Stored auth
listing identifies OpenCode Console, but does not prove successful remote
authentication or access to this model.

[#125](https://github.com/Hissal/skill-collection/issues/125) remains open.
Discovery startup and run quota errors are distinct failures; neither proves
a missing binary. The quota error does not prove model-selector support.
Gate behaviour, listing count and steering fallback remain
**inconclusive**; filesystem checks establish only the installed fixture.
No duplicate listing was observed and no install behaviour was changed under
#78's owner decisions.

The [loading research](../research/loading-mechanics.md) and
[trigger stream sources](trigger-evals.md#offline-injection-and-evidence-limits)
are documented research, not hand-run evidence for these checks. Installer
and gate checks establish filesystem/output correctness, not harness behaviour.

### Next hand run

Restore provider funds, resolve the discovery plugin activation error and
confirm the exact Sol Medium selector with `models` before repeating. Keep
the requested model; ask the owner if that provider does not expose it.
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
repetitions and event-schema limits. The procedure above describes the
successful observations still needed;
the failed attempts are recorded above. Keep transcripts locally until
publication is authorized. Completion
requires each live outcome and harness version recorded on #125; until then,
leave the issue open.

## Cross-scope build evidence

When verifying duplicate selection, mixed-scope requirements or Windows links,
use the [#127 evidence and reproduction fixture](evidence/issue-127-cross-scope.md).
Installer/doctor success alone establishes no effective harness selection.
## Command guard and recovery

The same entry point delegates to the guard installer with the selected
`--home`; it never falls back to the real home for guard files or probe state.
Claude is installed by default; Codex and OpenCode are installed when their
configuration directories exist under that home. For plugin preparation or migration status, read
[guard plugin delivery](../research/guard-plugin-install.md).

| Harness | Delivery | Registration | Doctor |
| --- | --- | --- | --- |
| Claude Code | snapshot in `.agents/command-guard` | `.claude/settings.json` PreToolUse | installed adapter block + silent allow |
| Codex | same snapshot | `.codex/hooks.json` PreToolUse; human trust in `/hooks` | installed adapter block + silent allow |
| OpenCode | snapshot and copied adapter | `.config/opencode/plugins/command-guard.js` | tool block + allow and permission denial |

`HOME/.skill-collection/guard.json` records copied files and exact hook entries.
Existing unrecorded snapshot or plugin files are conflicts. Settings retain a
first-write `.before-command-guard` backup. Keep the ownership record and backups.
Uninstall removes recorded hook commands even when an unrelated command shares
their group, and removes only unchanged recorded files. Replaced files survive.

Doctor fails on missing registration, disabled Claude hooks, changed registration,
or wrong block/allow verdicts. A probe denial is a successful guard verdict;
missing or disabled hooks are absent protection, not a denial. Codex trust is **pending** and fails the doctor until host verification is available.
Host bypasses and project overrides are explicitly **unverified**:
direct adapter probes cannot establish effective host invocation. An explicit
`COMMAND_GUARD_HOME` override is reported if it differs from the installation.
A host may skip an untrusted hook or an unloadable plugin entirely.

For human recovery, stop sessions, repair and reinstall, or run:

```sh
node scripts/install/install.js uninstall
```

This removes the recorded guard; core, pack and project skill links and owner
steering remain installed. Restart sessions.
After uninstall there is no guard protection. Removal approves no individual
command. Agents must report failures, not disable or bypass the guard.

Automated Linux temporary-home CLI tests cover install, doctor and uninstall
with all three harness directories. Live per-harness hand runs are still missing
for #120, including trust, bypass, overrides and actual host invocation. The CLI
probes are not that evidence; #120 is not fully accepted until it is recorded.

## Prepare the guard plugin

Run `node scripts/install/install.js prepare-plugin --home /temporary/home` to
prepare a versioned snapshot. Completion is a printed snapshot path with verified
bytes on rerun. The command exits with an unsupported-registration error and
preserves working guard registration. For host support evidence and the remaining
migration criteria, read [guard plugin delivery](../research/guard-plugin-install.md).
