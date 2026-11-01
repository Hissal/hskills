# Personal delegation policy

The owner's standing choices of harness, model and effort, read at every dispatch. One optional JSON file per person, at `~/.config/skill-collection/delegation.json` (`~` is the home directory on every system). Each person's own file is read the same way, and nothing in it is shared. The [schema](policy.schema.json) is the authority on what is valid; this guide says how a valid file selects. The owner writes or changes the file by answering questions with `/delegating setup`, whose [procedure](SETUP.md) is read only in that mode.

A file is **invalid** when it cannot be read, is not plain JSON (comments and trailing commas count), or breaks the schema: an unknown field, a rule with both `order` and `pool` or neither, a choice naming both `model` and `family` or neither `harness` nor `provider`, an effort off the scale, or a `version` other than `1`.

## Fields

- `version`: `1`. Required.
- `rules`: rules for every workflow, in order.
- `workflows`: per-workflow overrides. Each key is a workflow's callable name (`code-review`, `implement-spec`); its value is a list of rules shaped like `rules`.
- `effortDefaults`: personal effort for `simple`, `normal` and `difficult` work, replacing the collection's low, medium and high for any difficulty set.
- `autoFallback`: `true` lets a suitable model outside a rule's choices run, unasked, once its choices are exhausted. Default `false`.

A rule holds:

- `role` and `difficulty`: matchers, each a list. An omitted matcher matches any agent.
- `order` (ordered choices) or `pool` (unordered choices): exactly one.
- `effort`: optional, for every choice in the rule.
- `autoFallback`: optional, overriding the top-level flag for this rule.

## Matching

For each agent, try the dispatching workflow's rules under `workflows` in file order, then the top-level `rules` in file order. The first rule whose matchers all match is the agent's rule; later rules are never merged into it. With no matching rule, select automatically, still using `effortDefaults`.

- **Role**: a listed name matches when the caller's role equals it or ends in it as whole words, ignoring case. `reviewer` matches `reviewer`, `spec reviewer` and `Standards reviewer`; `spec reviewer` matches only that. A helper's role is `helper`.
- **Difficulty**: the agent's difficulty is in the list. When the caller left difficulty out, match the one you inferred in step 1 and say so.
- A dispatch no workflow asked for (the user asking directly) has no workflow, so only `rules` apply.

## Choices

A choice says where the model runs and which model it is:

- `harness` (the runtime: `claude-code`, `codex`, `opencode`) or `provider` (who serves the model: `anthropic`, `openai`, `zai`), or both. A provider alone accepts any harness and transport that reaches that provider's model.
- `model`: an exact ID as the harness or provider takes it (OpenCode: `provider/model-id`). Used exactly or not at all; it may name a preview.
- `family`: a version-independent name (`opus`, `sol`, `glm`). It matches a model whose ID or display name holds every hyphen-separated part of the family as a whole word, ignoring case (words split at any character that is not a letter or digit). Resolve it in the harness or provider's live catalog to the newest suitable stable version, by advertised IDs and reliable version information; a preview, beta or experimental model is reached only through an exact `model`. When two candidates cannot be ordered, ask the owner; unattended, skip that choice and report the ambiguity.

Each choice must still be suitable for the role's difficulty and available (skill step 3). Record why each skipped choice was skipped.

- **Order**: take the first suitable available choice.
- **Pool**: choose among the suitable available members, by fit to the task. A pool supplies choices, never extra agents or work.
- **Diversity group**: select its agents together from the one rule. An ordered rule supplies different families in its order, then different lines within a family; a pool supplies distinct suitable members. Taking the first choice for every agent of a diversity group is never the selection. When the rule holds too few distinct choices, diversity preferred reuses one and reports it; diversity required looks outside the list only as [Fallback](#fallback) allows, and the dispatch is blocked when it still cannot be met.

## Effort

The rule's `effort`, else `effortDefaults` for the difficulty, else the collection's defaults. Map it through [effort mappings](EFFORT.md).

- A rule's `effort` is the owner's stated choice: it may be `xhigh` or `max`, and a choice with no supported equivalent for it is unavailable.
- An `effortDefaults` value is a default: an approximation is allowed and reported, and it never lands upward on max unless max is the value.

## Fallback

When every choice of the matching rule is unsuitable or unavailable, the rule's `autoFallback` (else the top-level one) decides:

- `true`: select automatically outside the list, and report it.
- `false` or unset: ask the owner before using anything outside the list. Unattended, preserve the brief in a file and report the blocked dispatch.

## Examples

Each shows a selector shape. They are not anyone's assignments, and no provider in them is assumed to be present; the check validates each against the schema.

- [Ordered lines](policy-examples/ordered.json): a Codex GPT Sol line, then a Claude Opus line, for difficult review and implementation; Opus first for everything else.
- [Pool](policy-examples/pool.json): an OpenCode pool of GLM, DeepSeek and Kimi for simple and normal helpers and researchers, with automatic fallback.
- [Workflow override](policy-examples/workflow-override.json): a provider-only pool for `code-review`'s reviewers at `xhigh`, an exact model ID for simple work, and a personal effort default.
