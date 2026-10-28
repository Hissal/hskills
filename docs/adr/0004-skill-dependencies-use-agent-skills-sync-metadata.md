---
status: accepted
---

# Skill dependencies use Agent Skills Sync metadata

The [core review](https://github.com/Hissal/skill-collection/issues/45) decides that a skill's identity and hard skill requirements are authored in its `SKILL.md` metadata. Use the tooling-owned namespace `agent-skills-sync.*`, so other repositories can adopt the same contract, with publisher-qualified IDs for the skills themselves. Generate the dependency portion of the collection catalog from these declarations rather than maintain a second authored graph.

This is an installation contract to implement, not a capability of current installers. The [research note](../../research/2026-10-16-skill-dependency-metadata.md) distinguishes existing behavior from proposals; this ADR records the owner's adopted subset.

## Declaration and identity

The Agent Skills specification defines metadata as string keys and string values. Keep structured values as JSON inside a YAML string. The selected declaration shape is:

```yaml
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/example-skill"
  agent-skills-sync.requires: '["hissal.skill-collection/refactoring"]'
```

The example illustrates the fields, not a decided dependency edge. The full schema and validation belong to the implementation specification. `agent-skills-sync.*` identifies the metadata contract; `hissal.skill-collection/` identifies this collection's publisher-qualified skill identities. Other publishers use their own identities under the same keys.

An ID is independent of the callable name, repository path, core/pack address and installation scope. Moving `teach` from core to study must not change its ID. A release-local catalog maps IDs to source paths. Optional pack lookups, suggestions and related reading are not hard requirements; making them requirements would defeat optional installation.

## Resolution and synchronization

First support requirements within this repository, resolved at the exact same repository commit as the selected skill. One collection release remains coherent. External requirements need a later explicit locator/version contract; an ID alone is not a source to fetch.

Resolution expands the selected roots into their full required set and records it in the project lock. Keep identity, source/path, requested ref, resolved immutable commit and integrity information distinct. Ordinary synchronization reproduces that resolved set; updating is a separate resolution operation. The dependency portion of the catalog is generated, while locks record resolution results and project selections.

The sync tooling owns dependency discovery, dependency-aware selection and installation. Metadata itself performs none of these actions. Existing Unity sync can consume a pre-expanded flat lock, subject to its current format and source limits, but that alone does not enforce dependencies when a contributor deselects individual entries. The Unity package needs the corresponding resolver/selection integration. Normal `npx skills` does not currently resolve these fields; another installer would need to implement or consume this contract. This decision does not introduce a new collection-owned project installer or build one during the blueprint effort.

## Existing installations

A user-scope or plugin copy satisfies a pinned requirement only when its identity and required content are verified and it is effectively available to each intended harness. A matching folder or skill name alone is insufficient.

Report differing or unverifiable personal copies as unresolved conflicts rather than silently substituting them or overwriting them. Installing a project copy is not proof that a higher-precedence personal copy stopped being used. Verify effective harness selection during the build.

Installation requirements establish availability, not invocation authority. A user-invoked workflow stays user-invoked even when installed as a dependency; [ADR 0003](0003-core-reaches-packs-through-the-pack-list.md) governs execution.

## When a requirement is missing at runtime

The [closing review](https://github.com/Hissal/skill-collection/issues/51) decides how a skill behaves while no installer enforces this contract. A skill that declares a hard requirement loads it before doing any work. If the required skill, or the reference file it needs from that skill, cannot be loaded, the skill stops without partial work. It names the missing skill by callable name and ID, and says that ordinary installers such as `npx skills` do not install requirements while the Unity sync resolves them from this metadata. The runtime check is loadable or not; verifying identity and content stays with the installer.

The collection's check script validates hard requirements against the resolved set, not as files local to the calling skill folder.

## Considered options

- Collection-specific metadata keys: rejected in favor of the reusable tooling namespace requested by the owner.
- `ass.*`: rejected in favor of the clearer full `agent-skills-sync.*` name.
- Mutable addresses such as `core:refactoring` as permanent IDs: rejected because moving a skill between core and a pack should not break identity.
- Raw nested YAML under metadata: rejected for the portable string-value contract.
- Independently floating same-repository requirements: rejected in favor of a coherent resolved collection revision.
- Name-only user-scope substitution: rejected for pinned requirements because it does not establish publisher, identity, content or effective visibility.
