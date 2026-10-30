# User-scope core links

Run from a local checkout with Node.js installed:

```sh
node scripts/install/install.js --help
node scripts/install/install.js install
node scripts/install/install.js doctor
```

Install links the manifest's core list into `~/.claude/skills` and
`~/.agents/skills`. Checkout edits are live. Packs are excluded. The current
manifest is empty until skills are authored. This command installs no guards,
steering, plugins or project skills.

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
