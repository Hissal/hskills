# Policy setup

`/delegating setup` writes the owner's [personal delegation policy](POLICY.md) from their answers, so they never edit JSON by hand. It is a conversation with the owner and dispatches no agent. Run unattended, with no owner to answer, it stops and writes nothing.

Done when the owner confirmed the file shown to them and the file on disk is that file and validates against the [schema](policy.schema.json), or when the owner declined and the file on disk is unchanged.

## 1. Read what exists

Read `~/.config/skill-collection/delegation.json` (`~` is the home directory on every system). It is in one of three states:

- **Absent**: a fresh setup. Start from `{ "version": 1 }`.
- **Valid** against the schema: an edit. Summarise it for the owner in plain words, rule by rule and in file order (which agents each rule matches, its choices, effort and fallback), plus `effortDefaults`, `autoFallback` and each workflow override. Ask which parts to change, add, remove or reorder. Every part they leave stays exactly as it is.
- **Invalid**: a repair. List every problem with its location, as the policy guide defines invalid. When the file parses, start from it as an edit and put each problem to the owner as a question. When it does not parse, quote the parser's error with its line and ask whether to repair it (show the repair) or start fresh.

## 2. Find what is live

Offer only harnesses and models seen live on this machine. Collect them before asking anything:

- **Harnesses**: the one you are running in, each other harness CLI found on the `PATH` (`claude`, `codex`, `opencode`), and T3 Code's providers when its orchestration tools are present. Read each CLI's current `--help` for how it reports sign-in, and keep only those signed in.
- **Models**: each harness's own listing: T3's `orchestrator_capabilities`, `opencode models`, the host's model picker, its documented aliases, or what its `--help` names. The transport references say what was observed: [native subagents](NATIVE-SUBAGENTS.md), [T3 Code delegation](T3-CODE.md), [CLI transports](CLI-TRANSPORTS.md).
- **Families**: name each live model's family (`opus`, `sol`, `glm`), as the policy guide resolves it, and note which family is the newest stable frontier line of each provider.
- **Effort levels** each live model takes, from [effort mappings](EFFORT.md).
- **Workflows** in your skill listing that dispatch agents (`code-review`, `implement-spec`, `second-opinion`, `wayfinder`), for overrides.

Show the owner this inventory in a short list. A model the owner names that you did not see live goes in only after you tell them so: at dispatch it is skipped as unavailable until it is.

## 3. Ask in rounds

Ask one round at a time, all of its questions together and numbered. For an edit, ask only about the parts the owner chose in step 1, and skip a round none of them touches. Every question carries a **Recommended** answer with its reason, built from the inventory; with an existing file, it also shows the **Current** value, and keeping it is the recommendation unless it is invalid. The owner replies with the numbers they change; every other question takes its recommended answer. Each answer is a choice from the inventory (harness or provider, then family or exact model) or "automatic" for no rule.

1. **Coverage**: which agents get rules, by role and difficulty. Recommended: difficult work, normal work, and simple work with helpers, each as one rule for every role; reviewers as a rule of their own when the owner wants review diversity. Everything not covered selects automatically.
2. **Choices**, one question per rule from round 1:
   - Which models: recommend a family over an exact model, so the rule follows new releases. Difficult work: the frontier family of the harness you run in first, then a frontier family from another provider, so diversity groups can be met. Simple work and helpers: a small fast family.
   - Order or pool: recommend an order when one choice is preferred, a pool when the members are interchangeable.
   - `harness`, `provider` or both: recommend the harness the model was seen through; a provider alone when any harness reaching that provider will do.
3. **Effort and fallback**, per rule: recommend no `effort`, so the defaults apply. An effort the owner chooses is explicit: check that every choice in the rule takes it, and say which would become unavailable. Recommend `autoFallback` off, so the owner is asked before anything outside the list runs; on only for simple-work rules, where an interruption costs more than the choice.
4. **Workflow overrides**: per dispatching workflow, whether its agents need rules of their own. Recommended: none.
5. **Defaults**: `effortDefaults` (recommended: none, keeping low, medium and high) and the top-level `autoFallback` (recommended: off).

Put the rules in the order they must match: the first matching rule wins, so a narrower rule (role and difficulty) sits before a broader one (difficulty only), and a catch-all rule last. Tell the owner when a rule can never match because an earlier one covers it, and settle it before going on.

## 4. Validate

Build the file. For an edit, change only what the owner changed in the existing file, keeping every other rule, its position and its key order. For a fresh file, write `version` first, then `autoFallback`, `effortDefaults`, `workflows` and `rules` where set. Leave `$schema` out: the schema's path depends on where this skill is installed.

Validate it before showing it: parse it as plain JSON (no comments, no trailing commas), then check every field against the schema, rule by rule and choice by choice: no unknown field, exactly one of `order` and `pool`, exactly one of `model` and `family`, at least one of `harness` and `provider`, names lower case and hyphenated, roles lower-case words, efforts and difficulties from their lists, `version` exactly `1`. Fix any problem from the owner's answers, asking when an answer is needed, and validate again until the file passes.

## 5. Show, confirm and write

Show the whole file. With an existing file, show the changes as a diff against it as well, and confirm that every rule the owner did not change is untouched. Ask the owner to confirm, and write only on their explicit yes; a change request goes back to the round it belongs to.

On yes, create `~/.config/skill-collection/` when missing. Before replacing an existing file, copy it to `delegation.json.bak` beside it. Write the file as UTF-8 with LF line endings, two-space indentation and a final newline. Read it back and validate it again, then report its path, the backup's path when one was made, and that the next dispatch reads it.
