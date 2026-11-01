# Pruning

When a review may report that a test should be retired. A suite's value is the confidence it gives, not its size: no prune findings is a valid result, and a test that is weak but guards something that matters gets a finding to strengthen it, not one to retire it.

## Retention bar

A test clears the bar, and is never a prune finding, when it is the independent check on a contract that reaches beyond the code it calls:

- a public interface other code or other people build on;
- a protocol, wire format or file format;
- configuration the project reads;
- a data migration, or the shape of stored data;
- a security boundary;
- platform or environment behaviour the project depends on;
- generated output that something else consumes.

Being slow, old or a plain static check is no reason to retire a test. When a second test guards the same contract, the bar still holds for one of them: the card below must name the stronger one.

## Retirement card

A prune finding carries every field, each with its evidence. A card with any field empty or guessed is incomplete: the test stays, and the doubt goes in the declined-to-judge slot.

```md
- **Test:** `<path>:<line>` `<test name>`
- **Catches:** <the regression that makes it fail today, or "nothing": quote why it cannot fail>
- **Other users of the code it covers:** <non-test callers, or none> (<the search that found them, and how complete it was>)
- **Stronger proof:** <the test that catches the same regressions, quoted, or "the behaviour is gone": where it was removed>
- **History:** <why it was added, from `git log --follow` on the test file; a test added with a bug fix guards that bug>
- **Retiring it gains:** <run time, coupling removed, a refactor it blocks>
- **Validation:** <what the owner runs to confirm the retirement is safe; for code that would go with it, the build or type check passing without it, not text search alone>
```

The finding makes the case. Deleting the test, and running the validation, wait for the owner.
