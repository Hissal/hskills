# Personal skill links

Run from a local checkout with Node.js installed:

```sh
node scripts/install/install.js --help
node scripts/install/install.js install
node scripts/install/install.js doctor
```

Install links the manifest's core list into `~/.claude/skills` and
`~/.agents/skills`. Checkout edits are live. For optional packs or project links,
see [Personal extras](#personal-extras). To install the owner's personal steering,
see [Owner-only personal steering](#owner-only-personal-steering). The default
install manages core skills only; it installs no guards or plugins.
Installation is complete when install and doctor both exit zero.

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

## Cross-scope build evidence

When verifying duplicate selection, mixed-scope requirements or Windows links,
use the [#127 evidence and reproduction fixture](evidence/issue-127-cross-scope.md).
Installer/doctor success alone establishes no effective harness selection.
