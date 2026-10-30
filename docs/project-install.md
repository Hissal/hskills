# Project skills and the resolver contract

A project's committed skills lock is its opt-in to this collection. Use this
route when selecting project skills, reproducing them on another machine or
pinning a release. Resolver implementers use the [seven-step contract](#seven-step-resolver-contract).
For personal live links, use [Personal skill links](user-install.md).
This implements [#126](https://github.com/Hissal/skill-collection/issues/126)
under [#78](https://github.com/Hissal/skill-collection/issues/78), following
[ADR 0004](adr/0004-skill-dependencies-use-agent-skills-sync-metadata.md) and the
[owner answers](https://github.com/Hissal/skill-collection/issues/78#issuecomment-6510537918).

## Project route

Select individual skills or a whole named pack, then commit the project's
selection and full resolved set in its skills lock. Unity projects sync with
Agent Skills Sync (Unity); other projects use `npx skills`. Both routes must
place each selected skill folder in both project destinations:

- `.claude/skills/<callable-name>/` for Claude Code.
- `.agents/skills/<callable-name>/` for the shared agents route, including
  Codex and OpenCode.

On another machine, clone the project and use its sync tool to reproduce the
locked set. To pin stability, request a collection release tag and retain the
immutable commit it resolves to. Ordinary sync reproduces that commit and set;
changing the pin or selections is a separate resolution/update operation.
The route is complete when a clean clone reproduces every locked entry in both
destinations at the recorded commit with integrity verified; record any
unresolved conflicts instead of claiming completion.
Edit skills in this collection and resolve a new revision to adopt the change;
project copies are never edited in place. Personal extras belong at user scope
or in untracked local links, with one committed project lock and no per-person
lock.

These are the route's requirements, not a claim that current installers enforce
them. The collection ships neither a project installer nor a closure
pre-expansion tool. The resolver and dependency-aware selection integration
belong inside Agent Skills Sync (Unity), in its repository on its own schedule.
Its existing flat-lock installation alone does not meet this contract. Normal
`npx skills` does not resolve the dependency metadata or install requirements;
use the runtime fallback below while using that route.

## Release inputs and lock facts

At each release the collection supplies a tag, skill folders with
`agent-skills-sync.schema`, `agent-skills-sync.id` and
`agent-skills-sync.requires` metadata, and root
[`catalog.json`](../catalog.json). The JSON catalog at the **selected immutable
commit** is the resolver's ID-to-path source. Each stable ID maps to a
repository-relative skill-folder `path` and a `requires` array of direct IDs.
Read metadata and catalog from that same commit, rather than from the default
branch or a different release. An ID stays stable when a callable name or
folder changes; it is not itself a fetchable source.

The [skill format](skill-format.md#release-local-json-catalog) defines the JSON
shape and generator. The generated dependency graph comes from skill metadata;
[`docs/catalog.md`](catalog.md) remains the human catalog, including pack lists
and optional routes. Optional lookups, suggestions and related reading do not
become hard requirements.

The lock records the full resolved set, **core skills included**, even when a
contributor already has core at user scope. Teammates must be able to reproduce
requirement closure without that personal installation. Keep these facts
separate in the sync tool's lock representation:

| Fact | Meaning |
| --- | --- |
| Identity | Stable publisher-qualified skill ID |
| Source and path | Repository locator and skill folder at the resolved revision |
| Requested ref | The release tag or other ref the project asked for |
| Resolved commit | Immutable repository commit the request resolved to |
| Integrity | Evidence used to verify the locked content |
| Selection provenance | Direct selections distinguished from entries required by them |

Removing one root must retain a requirement still needed by another root.
Reuse existing package/skill-tool records for version evidence rather than
maintaining a second version list. This contract specifies the facts, not a new
lock filename, serialization schema or integrity algorithm.

## Seven-step resolver contract

A conforming resolver must:

1. **Expand roots.** Expand the project's direct skill selections (including
   skills selected through a pack) into their full transitive required set.
2. **Resolve coherently.** Resolve internal requirements at the exact repository
   commit of the selected skill, using that commit's `catalog.json` to locate
   each required ID. Same-repository requirements never float independently.
   External requirements are unsupported until an explicit locator/version
   contract exists; report them rather than guessing a source.
3. **Record resolution.** Write the full result into the committed project lock,
   with the distinct facts above and direct selections distinguishable from
   requirements.
4. **Reproduce on sync.** Install the locked set and verify its content using
   the recorded immutable commits and integrity evidence. Updating performs a
   separate resolution; an ordinary sync does not follow a moving ref.
5. **Report required-entry deselection.** If a contributor deselects an entry
   still required by a retained selection, report a conflict. Do not silently
   obey the deselection or silently override it.
6. **Verify cross-scope satisfaction.** Accept a user-scope or plugin copy for a
   pinned requirement only after verifying its identity, required content and
   effective visibility to every intended harness, including needed references.
   A matching folder or callable name alone is insufficient. Keep the full
   resolved entry in the lock even when a verified existing copy satisfies it.
7. **Report personal-copy conflicts.** Report differing or unverifiable personal
   copies as unresolved conflicts, without overwriting or silently substituting
   them. The owner decides how to resolve them.

Installation establishes availability, not invocation authority. A user-invoked
workflow remains user-invoked when installed as a requirement; loading its
knowledge grants no permission to start that workflow.

## Scopes and harnesses

Claude Code, Codex and OpenCode are supported targets. Cursor and Pi are
expected to work but untested. The route applies on Linux, macOS and Windows;
this document is not runtime verification of those platforms or harnesses.

Codex can list a same-named skill twice when installed at both user and project
scope. Keep core in the project lock despite that duplication. On Claude,
personal skills take precedence over project skills. Installing a project copy
does not prove that a higher-precedence personal copy stopped being used.
Verify effective selection and mixed-scope reachability in each intended
harness during build verification and record the results separately.

Resolve required skills and their bundled references through installed identity
and visibility, wherever installed, rather than assuming sibling folders or a
collection checkout. For Claude reads outside the working directory, including linked skills,
follow [Read permissions](user-install.md#read-permissions).

## Runtime fallback and the spec 3 fixture

When an installer omits a requirement, follow the
[runtime stop rule](skill-format.md#hard-requirements-at-runtime), including
its loadability check and installer explanation. Runtime loadability and
installer identity/content verification are separate checks.

For spec 3's missing-requirement case, prepare a scratch project through the
`npx skills` route with `code-review` installed in the two project destinations
above and `reviewing` deliberately absent. Also ensure no user-scope or plugin
copy can supply `reviewing` or its needed references. Invoke `code-review` and
expect it to stop before review work, naming `reviewing` and
`hissal.skill-collection/reviewing` with the installer explanation. Use the
[behavioural eval procedure](behavioural-evals.md) to record the run; spec 3 owns
that case. This is the install arrangement, not a claim that the case has run
or that those skills already ship at this revision.

When verifying effective selection or mixed-scope reference reads, consult the
[#127 evidence and remaining matrix](evidence/issue-127-cross-scope.md) before
claiming runtime support.
