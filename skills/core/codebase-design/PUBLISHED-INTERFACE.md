# Published interfaces

An interface is **published** once callers you do not control depend on it: a package others install, a documented file or config format, an endpoint or event others call or consume, data that another version of your own code reads back. You cannot find those callers or change them with yours, so whatever they relied on and you change breaks them silently, after you ship. Assumes the vocabulary in [SKILL.md](SKILL.md): **module**, **interface**, **seam**.

Contents:

- [Hyrum's Law](#hyrums-law)
- [Addition over modification](#addition-over-modification)
- [A changed default is a breaking change](#a-changed-default-is-a-breaking-change)
- [Consistent error semantics](#consistent-error-semantics)
- [Validate at the seam](#validate-at-the-seam)
- [The misuse probe](#the-misuse-probe)
- [No type names in persisted payloads](#no-type-names-in-persisted-payloads)

For *this stack's seam and compatibility rules* (binary compatibility, assembly boundaries, a public-API baseline), ask the pack guides this project lists; use the answer alongside these rules, and carry on silently when none answers.

## Hyrum's Law

> With a sufficient number of users of an API, all observable behaviors of your system will be depended on by somebody, regardless of what you promise in the contract.

This means: every public behavior, including undocumented quirks, error message text, timing, and ordering, becomes a de facto contract once users depend on it. The published interface is everything a caller can observe, not only what the documentation promises.

- **Be intentional about what you expose.** Every observable behavior is a potential commitment.
- **Don't leak implementation details.** If users can observe it, they will depend on it.
- **Tests are not enough.** Even with perfect contract tests, Hyrum's Law means "safe" changes can break real users who depend on undocumented behavior.

## Addition over modification

Extend interfaces without breaking existing consumers: never remove or modify, only extend.

1. **Previous functionality is immutable**: once released, behaviour and signatures are locked.
2. **New functionality through new constructs**: a new optional field, a new function, a new type, an opt-in option.
3. **Removal only after a deprecation period**, announced to the callers with what to use instead.

```typescript
// Good: Add optional fields
interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';  // Added later, optional
  labels?: string[];                       // Added later, optional
}

// Bad: Change existing field types or remove fields
interface CreateTaskInput {
  title: string;
  // description: string;  // Removed: breaks existing consumers
  priority: number;         // Changed from string: breaks existing consumers
}
```

Breaking, besides removing and retyping: renaming; making an optional input required; accepting less than before (tighter validation, a shorter limit); returning more than a caller can handle (a new value in an output union that callers switch over exhaustively); turning a returned result into a thrown error or the reverse. A new optional input whose absence keeps the old behaviour, and a new output field, are additive.

When the change cannot be additive, it is a migration. Unless you are already migrating, offer `/migrating` (as this harness writes the invocation) at the end of the design, naming the callers the change breaks, so the old path keeps working while they move; the human starts it.

## A changed default is a breaking change

Changing defaults breaks users who relied on old behavior. A caller that omits the argument sees no type change and no compile error; its behaviour just changes under it.

```typescript
// Breaks every caller that omitted `retries`
function fetchPage(url: string, { retries = 3 } = {}) {}  // Was: retries = 0

// Keep the old default; the new behaviour is opt-in
function fetchPage(url: string, { retries = 0 } = {}) {}
```

The same holds for an omitted field in a request, an unset config key, a sort order, a page size, a serializer setting. Flip a default only as a breaking change: announced, with callers told how to pin the old value first.

## Consistent error semantics

Pick one error strategy and use it everywhere:

```typescript
// Every error follows the same shape
interface APIError {
  error: {
    code: string;        // Machine-readable: "VALIDATION_ERROR"
    message: string;     // Human-readable: "Email is required"
    details?: unknown;   // Additional context when helpful
  };
}
```

**Don't mix patterns.** If some endpoints throw, others return null, and others return `{ error }`, the consumer can't predict behavior. Once published, the error codes are part of the interface: callers branch on `code`, so add new codes and keep each existing code's meaning. Callers match on message text too (Hyrum's Law); keep the `code` the documented thing to match on.

## Validate at the seam

Validate where input from callers you do not control crosses the published interface; trust it inside:

```typescript
// Validate at the published seam
app.post('/api/tasks', async (req, res) => {
  const result = CreateTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid task data',
        details: result.error.flatten(),
      },
    });
  }

  // After validation, internal code trusts the types
  const task = await taskService.create(result.data);
  return res.status(201).json(task);
});
```

Internal functions that share the validated types trust them. Validate strictly from the first release: loosening validation later is additive, tightening it breaks every caller that sent what you used to accept.

## The misuse probe

Before publishing a new interface or a change to one, probe it as a careless caller would use it. Answer each in one line; make the interface reject or rule out what it can (a type, a required option, a rejected value), and document only what is left.

- **Zero, empty, null and default.** For each input, what do `0`, `""`, `[]`, `null` and the omitted value mean? Each has one stated meaning, and none quietly switches a guarantee off: a `timeout: 0` that means "wait forever", an empty allow-list that allows everything. Where one value could mean two things, give each meaning its own value:

  ```typescript
  // Does 0 mean "no retries" or "retry forever"?
  function sync(retries: number) {}

  // Each meaning is spelled out
  type Retries = { kind: 'none' } | { kind: 'times'; count: number } | { kind: 'forever' };
  function sync(retries: Retries) {}
  ```

- **Swappable parameters.** Two neighbouring parameters of one type can be passed in the wrong order with no error. Name them in an options object, or give them distinct types:

  ```typescript
  type TaskId = string & { readonly __brand: 'TaskId' };
  type UserId = string & { readonly __brand: 'UserId' };

  // Prevents accidentally passing a UserId where a TaskId is expected
  function assign(task: TaskId, user: UserId): Promise<void> { ... }
  ```

- **The lazy caller** copies the first example it finds (README, docs, a test) and changes as little as it can. Is that example right as copied: the safe default, the error handled, no placeholder secret left in?
- **The confused caller** misreads a name or the docs. Does it get an error at the call site that names its mistake, or a silent wrong result?

## No type names in persisted payloads

Data that is stored, or sent between versions, outlives the code that wrote it. A class or module name written into the payload turns every rename or move into a break of the old data:

```typescript
// Bad: the class name is in the payload; renaming Order breaks every reader of old data
JSON.stringify({ $type: order.constructor.name, ...order });
// { "$type": "Order", "id": "123" }

// Good: an explicit discriminator, refactoring safe
JSON.stringify({ type: 'order', id: order.id });
// { "type": "order", "id": "123" }
```

The discriminator is published from its first write: choose it as carefully as a field name, and never reuse one for a different shape.
