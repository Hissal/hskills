# Triage Labels

A missing field means the owning skill's default.

The skills speak in terms of five canonical triage roles. Each role's label is its own name by default. This file maps a role to the actual label string used in this repo's issue tracker only where that differs; a role with no row uses the default.

| Role              | Label in our tracker | Meaning                                  |
| ----------------- | -------------------- | ---------------------------------------- |
| `needs-triage`    | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`      | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent` | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human` | `ready-for-human`    | Requires human implementation            |
| `wontfix`         | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Add a row for any other role whose label differs.
