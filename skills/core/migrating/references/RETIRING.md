# Retiring

Read when the change takes away something consumers rely on with no equivalent. A move (rename, relocation, replacement by an equivalent) skips this file: its old name goes in the contract stage.

## The retirement decision

Answer these five before planning, using the consumer list:

1. **Unique value**: does it still do something nothing else does? If yes, keep it and stop here.
2. **Reach**: how many consumers depend on it, and how heavily? This sizes the work.
3. **Replacement**: does an alternative exist that covers what consumers use it for? If not, the replacement is built first and retirement waits for it.
4. **Cost to each consumer**: what does moving cost each one? Do the cheap, mechanical moves yourself; weigh the expensive ones against the cost of keeping it.
5. **Cost of keeping it**: what does leaving it in place cost: security exposure, upkeep, complexity for everyone working nearby?

The outcome is **retire**, **keep** or **not yet** (with what must change first). Put the five answers and the outcome in the handback. Only **retire** continues to the plan.

## Advisory before compulsory

Start **advisory**: mark it deprecated where consumers will see it, name the replacement, document how to move, and let consumers move at their own pace. The old path keeps working with no end date.

Move to **compulsory** (a removal date) only when keeping it is a security risk, blocks other work, or costs more than the project can carry. A compulsory retirement comes with the means to move: a migration guide, tooling, or the migration done for consumers you can reach. Whoever owns the retired thing carries the cost of moving its consumers, rather than announcing a date and leaving them to it.

The choice and its reason go in the changelog entry and any consumer notice.

## Removal

Remove it only once usage is shown to be zero, by search and by whatever usage evidence the project has (logs, metrics, download counts). Remove the code with its tests, documentation, configuration and the deprecation markers themselves.
