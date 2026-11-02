# Check commands

A missing field means the owning skill's default.

The commands that check a change in this project, cheapest tier first. `verifying` chooses from them, `implement` takes its cadence from their tiers, and `constraints` adds and updates rows here.

| Command | What it checks | Cost tier |
| ------- | -------------- | --------- |
| `<command>` | `<what a pass shows>` | `<tier>` |

## Cost tiers

- **edit loop**: seconds to run, repeated while editing: a typecheck, a lint, one test file.
- **task end**: once before the work is called done: the full suite, a full build.
- **CI**: left to continuous integration, because it is too slow or needs an environment an agent lacks: a device run, a release build.

## Floor guard

A floor guard is a `task end` row whose "What it checks" starts with `Floor guard`. `verifying` runs it after the last edit: exit 0 is clean, exit 1 is a violation, exit 2 means it could not run. No such row means no floor guard is configured.
