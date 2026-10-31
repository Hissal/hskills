# The adding-a-dependency rule

The stack-neutral rule for a dependency that is new, or that moves to another version. Apply all five checks to each one. An ecosystem's own rule, from the project's pack guides, adds to these checks and replaces none of them.

Each check ends in one result, with its evidence:

- **Pass**: the evidence was read and shows no concern.
- **Flag**: the evidence shows a concern; name it, and whether it needs the owner's decision.
- **Unassessable**: the data could not be reached or does not exist for this ecosystem; name the reason. Missing data is not a flag, and not a pass.

## Install-script gate

Does the package, or anything new it pulls in, run code when it is installed: lifecycle scripts, build hooks, native compilation, or a download during install? Read the published package's metadata for each one.

A new install script, or one that appears in a version bump where the previous version had none, is flagged for the owner's decision. Record what the script runs, whether the project needs it, and whether the project still installs and works with install scripts turned off.

## Maintainer and activity

- Who can publish new versions: the registry's publish rights, which are often a different set of people from the source repository's contributors.
- A single publisher, or a recent change of publisher or owner.
- The date of the last release, and whether the package or its repository is deprecated or archived.
- Security reports left open without an answer.

## Typosquatting

- Compare the name with well-known packages: one-letter edits, swapped or dropped separators, a changed scope or namespace, and suffixes that look official.
- Confirm the package is the one its upstream project's documentation tells users to install.
- Treat a young package with few dependents and a name close to a popular one as a flag until shown otherwise.

## Provenance

- A source repository is linked, and the published artifact can be tied to it: a build provenance statement, a signed release, or a tag matching the version, where the ecosystem supports them.
- The published contents match the repository: no unexpected binaries, minified bundles or files absent from the source.
- The registry it resolves from is the one intended. A private package name that a public registry can also serve invites dependency confusion.

## Lockfile diff

Read the lockfile diff for the change itself, entry by entry:

- Every added or changed entry is explained by the dependency being added or changed.
- Unexplained churn is flagged: entries moving that the change did not touch.
- A changed resolved URL or registry, an integrity hash that changes while the version stays the same, or a source switching from a registry version to a git URL or tarball is flagged.
