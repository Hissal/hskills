# Generated-input tests

A generated-input test checks a rule across many machine-made inputs instead of a few hand-picked ones. These rules apply on top of the rest of this skill whenever a test's inputs come from a generator (a property-based or model-based library) instead of being written out by hand.

For *writing, setting up and running tests for this stack*, ask the pack guides this project lists, unless you already have: the answer gives this stack's generator library and the shape these examples take there. When none answers, carry on silently with the TypeScript shapes below.

## Expected answers come from outside the code

Generated inputs have no hand-worked literal to compare against, so the pull is to compute the expected value the way the code does. That is the tautological anti-pattern run a thousand times: every case passes by construction. Recording what the code returns today and asserting it back is the same trap. Take the expected answer from something the code under test never touched:

- a relation between input and output: the result is within bounds, keeps every item, or turns back into the input;
- a model: a separate, obviously correct representation (a `Map`, a plain list) that the test updates itself;
- a reference implementation that is not the code under test: the old version during a rewrite, a slow brute-force version.

```typescript
// BAD: the expected price uses discount()'s own formula, so a wrong formula still passes
fc.assert(
  fc.property(fc.integer({ min: 0, max: 10_000 }), fc.integer({ min: 0, max: 100 }), (cents, pct) => {
    expect(discount(cents, pct)).toBe(Math.round(cents * (1 - pct / 100)));
  }),
);

// GOOD: rules the result must obey, none of which recomputes it
fc.assert(
  fc.property(fc.integer({ min: 0, max: 10_000 }), fc.integer({ min: 0, max: 100 }), (cents, pct) => {
    const price = discount(cents, pct);
    expect(price).toBeGreaterThanOrEqual(0);
    expect(price).toBeLessThanOrEqual(cents);
    expect(discount(cents, 0)).toBe(cents);
  }),
);
```

## Aim for the strongest property that holds

From weakest to strongest:

1. It returns without throwing.
2. The result has the right type or shape.
3. An invariant holds: a bound, an ordering, a conserved total.
4. Applying it twice gives the same result as applying it once.
5. It round-trips (`decode(encode(x))` gives back `x`), or it agrees with a model or reference on every input.

Find the highest rung that is true of the code and assert that one. A test that stops at rung 1 or 2 when a roundtrip exists misses the bugs the generator is there to find. When rung 1 is the best the code offers, generated inputs rarely earn their cost: write example tests instead.

```typescript
test("a formatted query parses back to the same query", () => {
  fc.assert(
    fc.property(queryArb, (query) => {
      expect(parseQuery(formatQuery(query))).toEqual(query);
    }),
  );
});
```

## Generate operations, not scenarios

For code with state (a cart, a cache, an account, a queue), generate single operations with their arguments, and let the library compose them into sequences and shrink a failing one to the shortest. A hand-written whole scenario ("add two, remove one, check out") explores only the order you thought of: keep it as a regression example, and let the generator choose the orderings. Include the operations the code must refuse (removing a missing line, withdrawing more than the balance) whenever refusing is part of the contract, and let the model say what refusal looks like. Build a fresh real object and a fresh model for every generated sequence.

```typescript
type Op = { kind: "add"; sku: string; qty: number } | { kind: "remove"; sku: string };

const skus = ["apple", "pear", "fig"];
const sku = fc.constantFrom(...skus);
const op: fc.Arbitrary<Op> = fc.oneof(
  fc.record({ kind: fc.constant("add" as const), sku, qty: fc.integer({ min: 1, max: 5 }) }),
  fc.record({ kind: fc.constant("remove" as const), sku }),
);

test("cart quantities match a plain map under any sequence of operations", () => {
  fc.assert(
    fc.property(fc.array(op, { maxLength: 30 }), (ops) => {
      const cart = createCart();
      const model = new Map<string, number>();
      for (const o of ops) {
        if (o.kind === "add") {
          cart.add(o.sku, o.qty);
          model.set(o.sku, (model.get(o.sku) ?? 0) + o.qty);
        } else {
          expect(cart.remove(o.sku)).toBe(model.has(o.sku)); // refusing a missing line is the contract
          model.delete(o.sku);
        }
        for (const s of skus) expect(cart.quantityOf(s)).toBe(model.get(s) ?? 0);
      }
    }),
  );
});
```

## Example tests alone can be the answer

When the code has no rule worth stating across all its inputs (a handler that wires two calls together, a one-off mapping, a UI event), write example tests and say why in one line. That is a finished result, not a gap left for later.

## A new library: offer it once

When the project already has a generated-input library, write the test with it. When it has none, adding one is the user's call, like any new dependency: write example tests for the behaviour now, and at handback offer the library at most once in the task, naming the property it would let you assert and the install command (for example `npm install --save-dev fast-check`). The offer installs nothing, and the user's answer stands. When you run for a parent agent, make no offer: return the need, and the parent decides what to offer the user.
