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

This links the checkout's root `steering.md` to `~/.claude/CLAUDE.md`,
`~/.codex/AGENTS.md` and OpenCode V2's native
`~/.config/opencode/AGENTS.md`. All destinations use the selected `--home`;
the installer's existing OpenCode mapping is independent of `XDG_CONFIG_HOME`.
The ownership record remembers the opt-in; later installs without the flag
manage all three files, including adding the native target to an older two-target
record. Without opt-in, no steering file is touched.
The [approved native steering policy and global probe](../research/opencode-install-125.md#approved-native-global-steering-2026-10-31)
supersede the historical Claude fallback assumption.
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

Native Windows verification covers all three file-symlink targets, remembered
opt-in, conflicts, and copy drift after fixture-injected link refusal. For
retained results and the unrun actual OS-refusal case, read
[Windows owner-steering evidence](evidence/windows-install-2026-10-31.md#owner-steering-119).

## Isolated verification

To reproduce native Windows acceptance or run its remaining cases, follow the
[Windows agent handoff](handoffs/windows-install-acceptance.md).

`--home DIR` changes the record home and default skill roots; `--source DIR`
selects a fixture checkout; `--claude-root DIR` and `--agents-root DIR`
override the two destination directories. All overrides are absolute-resolved.
Use temporary directories for all of these to avoid touching a real home.
The table-driven CLI cases run with real temporary directories through
`node scripts/install/test/run.js` and inside the collection check. They
exercise ownership, reconciliation, no-change reruns and doctor failures.

Native Windows hosts read installed bodies and references through real directory
symlinks and installer-created junctions in all 12 matrix cells. Junction creation
used fixture-injected permission refusal; actual OS refusal remains unrun. Read
[Windows link evidence](evidence/windows-install-2026-10-31.md#cross-scope-link-matrix-127-116)
for the matrix, ambient skill context and reproduction limits.

## OpenCode verification

OpenCode v2.2.3 on Linux with `opencode-go/claude-haiku-5-5` verifies
one registered fixture through either one or both compatibility links, zero skill
loads across 13 gated requests, and successful explicit and ungated body loads.
The evidence runner activates location plugins before querying the skill registry;
a fresh standalone skill listing alone can return an unactivated empty registry.
Claude steering fallback is unsupported in V2. Native project and global
`AGENTS.md` steering passed separate controls; the owner approved the native global
installer destination through the existing opt-in. See
[OpenCode verification](../research/opencode-install-125.md).

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
| Claude Code | content-addressed plugin snapshot | user plugin API | enabled effective source; snapshot block + allow |
| Codex | same plugin snapshot | user plugin API; human trust in `/hooks` | enabled effective source; pending trust |
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

Automated temporary-home CLI tests cover installation, doctor and uninstall.
For actual Claude/Codex adapter invocation and installed OpenCode validation on
Linux, read [live hook evidence](../research/live-hooks-120.md);
for Claude plugin sessions, checkout independence and the Codex trust barrier,
read [live plugin evidence](../research/live-plugins-121.md). For actual Windows
Claude/Codex plugin events and checkout independence, read
[Windows guard evidence](evidence/windows-install-2026-10-31.md#guard-lifecycle-and-live-plugin-probes-120-121),
including the trusted uninstall conflict and nonportable allow command found there.
For repair regressions and remaining native acceptance, read the
[guard follow-up](evidence/windows-guard-followup.md).
OpenCode host acceptance on Windows remains unrun.

## Register the guard plugin

Normal installs register the guard with the installed `claude` and `codex` CLIs.
`prepare-plugin` runs that registration independently of skill links. Both use
`--source` for the guard as well as skills. CLI binaries can be selected with
`COMMAND_GUARD_CLAUDE` and `COMMAND_GUARD_CODEX` when absent from PATH.
Registration uses a dedicated `skill-collection-guard` marketplace rooted in the
prepared snapshot. Enabled listings must report that snapshot as effective source.

`HOME/.skill-collection/plugins.json` journals snapshot files and host configuration
writes. Failed host registration rolls back its writes and retains legacy hooks.
Before registration mutates host files, every recorded write must still match its
last installed bytes, except narrowly verified Codex hook trust-table changes.
Conflicts preserve current bytes and the journal. Existing
snapshots must contain only recorded files; byte-identical unrecorded snapshots
are conflicts, not adopted installations.

Once the replacement is ready, only exact recorded legacy handlers with the
adapter marker are removed from that host's settings; unrelated handlers survive.
Codex readiness is read through the host's app-server `hooks/list` API: enabled
plugin hooks must report trusted. Pending or unavailable trust retains the legacy
handler. Doctor reports its actual enabled/trust status: retaining an untrusted
handler leaves Codex UNPROTECTED until human review. The installer never grants
trust. Claude readiness requires an enabled
registration at the expected snapshot and successful adapter probes.
Settings keep their first-write backup. Uninstall restores recorded configuration
only while its bytes still match, allowing syntactically validated changes to Codex
`hooks.state` hash tables. Those tables survive reinstall and uninstall. Unknown
trust syntax and unrelated personal edits are conflicts and remain owned
for recovery. Resolve conflicts manually before retrying uninstall.

Doctor checks registration and snapshot block/allow probes. Claude-only
registration can pass these checks. Codex returns pending while its current hook
trust is unresolved; review Codex `/hooks` yourself. Uninstall preserves validated
hook-state tables, so Codex may reuse existing approval for matching hook content
on reinstall. Doctor reads the current host-reported state; the installer grants
no new approval. Direct snapshot probes
establish adapter behavior; live host acceptance evidence is recorded separately
in [the plugin investigation](../research/live-plugins-121.md).

## Whole-list skill plugins

Use the plugin route for a whole core or named pack; use the folder route above
for individual selection. Plugin skill lists are generated from `collection.json`
by `node scripts/plugins/generate.js`. Empty lists publish no plugin. Production
membership is currently empty; these commands become useful when the content
specs add manifest entries. Core never includes onboarding. When its actual
entry arrives, onboarding publishes as a separate one-skill plugin.

Register this checkout with `claude plugin marketplace add <checkout>` or
`codex plugin marketplace add <checkout>`. Install `collection-core@skill-collection`
and `collection-pack-<pack>@skill-collection` together at the same release when
the pack requires core. Plugins do not resolve metadata requirements. Other
required packs must likewise be installed explicitly; a missing requirement
causes the skill to stop. Keep the hooks-only guard at its own plugin root.

On Claude, `claude plugin install <plugin>@skill-collection --scope project`
records project enablement in `.claude/settings.json`. For a user install kept
disabled by default, install with `--scope user`, disable it at user scope, then
enable it with `claude plugin enable <plugin>@skill-collection --scope project`.
Claude enables whole plugins; individual skills cannot be disabled separately.

On Codex, `codex plugin add <plugin>@skill-collection` installs the cache copy.
Set `[plugins."<plugin>@skill-collection"]` with `enabled = false` in the user
config and `enabled = true` in the project's `.codex/config.toml` to opt in there.
Codex may skip project config in an untrusted project: review its normal project
trust prompt yourself, then verify effective plugin selection in a new session.
The collection generator grants no trust and edits no user settings.

Read permissions must cover installed plugin entry points and disclosed reference
files in the host's plugin cache, outside the project directory. On Claude,
review and add `Read(<absolute-cache-root>/**)` for each installed plugin as
needed. For linked folder skills, cover both the link and its source target.
Keep permission grants under human control; the generator writes none.

The fixture runtime evidence and platform limits are in
[plugin generation verification](../research/plugin-generation-124.md).
