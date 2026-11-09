# HTML Report Format

The architectural review is rendered as a single self-contained HTML file in the OS temp directory, on a dark theme. Tailwind and Mermaid both come from CDNs. Mermaid handles graph-shaped diagrams reliably; hand-built divs and inline SVG handle the more editorial visuals (mass diagrams, cross-sections). Mix the two: don't lean on Mermaid for everything, it'll start to look generic.

- [Scaffold](#scaffold)
- [Header](#header)
- [Candidate card](#candidate-card)
- [Diagram patterns](#diagram-patterns)
- [Style guidance](#style-guidance)
- [Also found](#also-found)
- [Out-of-scope observations](#out-of-scope-observations)
- [Coverage](#coverage)
- [Top recommendation section](#top-recommendation-section)
- [Tone](#tone)

## Scaffold

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Architecture review for {{repo name}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: true, theme: "dark", securityLevel: "loose" });
    </script>
    <style>
      /* small custom layer for things Tailwind doesn't cover cleanly:
         dashed seam lines, hand-drawn-feeling arrow heads, etc. */
      .seam { stroke-dasharray: 4 4; }
      .leak { stroke: #f87171; }
      .deep { background: linear-gradient(135deg, #334155, #475569); border: 3px solid #e2e8f0; }
    </style>
  </head>
  <body class="bg-slate-950 text-slate-100 font-sans">
    <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header>...</header>
      <section id="candidates" class="space-y-10">...</section>
      <section id="also-found">...</section>
      <section id="out-of-scope">...</section>
      <section id="coverage">...</section>
      <section id="top-recommendation">...</section>
    </main>
  </body>
</html>
```

## Header

Repo name, date, and a compact legend: solid box = module, dashed line = seam, red arrow = leakage, thick light-bordered box = deep module. No introduction paragraph. Straight into the candidates.

## Candidate card

The diagrams carry the weight. Prose is sparse, plain, and uses the glossary terms (from the `/codebase-design` skill) without ceremony.

Each candidate is one `<article>`:

- **Title**: short, names the deepening (e.g. "Collapse the Order intake pipeline").
- **Badge row**: recommendation strength (`Strong` = emerald, `Worth exploring` = amber, `Speculative` = slate, each as a light tint on a translucent fill so it reads on dark: `bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/40`), plus a tag for the dependency category (`in-process`, `local-substitutable`, `ports & adapters`, `mock`).
- **Files**: monospaced list, `font-mono text-sm`.
- **Before / After diagram**: the centrepiece. Two columns, side by side. See patterns below.
- **Problem**: one sentence. What hurts.
- **Solution**: one sentence. What changes.
- **Wins**: bullets, ≤6 words each. e.g. "Tests hit one interface", "Pricing logic stops leaking", "Delete 4 shallow wrappers".
- **Duplication** (duplication candidates only): a compact table: the callers (`font-mono text-sm`, file and line), lines removed and added excluding tests, the same including tests, and a one-line **Risk** (never "none").
- **Behaviour change** (if the card has one): one line in the ADR callout's amber box.
- **Risk** (if the card has one outside Duplication): one line under the wins.
- **ADR callout** (if applicable): one line in an amber-tinted box (`bg-amber-500/10 border border-amber-400/40 text-amber-200`).

No paragraphs of explanation. If the diagram needs a paragraph to be understood, redraw the diagram.

## Diagram patterns

Pick the pattern that fits the candidate. Mix them. Don't make every diagram look the same. Variety is part of the point.

### Mermaid graph (the workhorse for dependencies / call flow)

Use a Mermaid `flowchart` or `graph` when the point is "X calls Y calls Z, and look at the mess." Wrap it in a Tailwind-styled card so it doesn't feel parachuted in. Style with classDef to colour leakage edges red and give the deep module a heavy light border. Sequence diagrams work well for "before: 6 round-trips; after: 1."

```html
<div class="rounded-lg border border-slate-700 bg-slate-900 p-4">
  <pre class="mermaid">
    flowchart LR
      A[OrderHandler] --> B[OrderValidator]
      B --> C[OrderRepo]
      C -.leak.-> D[PricingClient]
      classDef leak stroke:#f87171,stroke-width:2px;
      class C,D leak
  </pre>
</div>
```

### Hand-built boxes-and-arrows (when Mermaid's layout fights you)

Modules as `<div>`s with borders and labels. Arrows as inline SVG `<line>` or `<path>` elements positioned absolutely over a relative container. Reach for this when you want the "after" diagram to feel like one thick-bordered deep module with greyed-out internals, since Mermaid won't render that with the right weight.

### Cross-section (good for layered shallowness)

Stack horizontal bands (`h-12 border-l-4`) to show layers a call passes through. Before: 6 thin layers each doing nothing. After: 1 thick band labelled with the consolidated responsibility.

### Mass diagram (good for "interface as wide as implementation")

Two rectangles per module: one for interface surface area, one for implementation. Before: interface rectangle is nearly as tall as the implementation rectangle (shallow). After: interface rectangle is short, implementation rectangle is tall (deep).

### Call-graph collapse

Before: a tree of function calls rendered as nested boxes. After: the same tree collapsed into one box, with the now-internal calls shown faded inside it.

## Style guidance

- Lean editorial, not corporate-dashboard. Generous whitespace. Serif optional for headings (`font-serif` works well on slate).
- Colour sparingly: one accent (emerald or indigo) plus red for leakage and amber for warnings, in their 300–400 shades so they hold contrast on the dark background. Keep text at `text-slate-100` to `text-slate-400`; anything darker disappears.
- Keep diagrams ~320px tall so before/after sits comfortably side by side without scrolling.
- Use `text-xs uppercase tracking-wider` for module labels inside diagrams, so they read as schematic, not as UI.
- The only scripts are the Tailwind CDN and the Mermaid ESM import. The report is otherwise static: no app code, no interactivity beyond Mermaid's own rendering.

## Also found

Present only when the cut left candidates out: one compact list below the cards, in rank order. Each entry is one line: title, strength badge, the main files (`font-mono`) and one sentence on the friction. No diagrams.

## Out-of-scope observations

Present only when the review recorded some: one compact list in reviewing's entry format, below the candidates and visually quieter than them (`text-sm text-slate-400`). Pre-existing entries keep their tag and are not counted.

## Coverage

Always present, as quiet as the out-of-scope list (`text-sm text-slate-400`): four short labelled lists, **Read**, **Left alone**, **Declined to judge** and **ADRs**, with the contents step 4 of `SKILL.md` names. A list with nothing in it says "none".

## Top recommendation section

One larger card. Candidate name, one sentence on why, anchor link to its card. That's it.

## Tone

Plain English, concise, but the architectural nouns and verbs come straight from the `/codebase-design` skill. Concision is not an excuse to drift.

**Use exactly:** module, interface, implementation, depth, deep, shallow, seam, adapter, leverage, locality.

**Never substitute:** component, service, unit (for module) · API, signature (for interface) · boundary (for seam) · layer, wrapper (for module, when you mean module).

**Phrasings that fit the style:**

- "Order intake module is shallow: interface nearly matches the implementation."
- "Pricing leaks across the seam."
- "Deepen: one interface, one place to test."
- "Two adapters justify the seam: HTTP in prod, in-memory in tests."

**Wins bullets** name the gain in glossary terms: *"locality: bugs concentrate in one module"*, *"leverage: one interface, N call sites"*, *"interface shrinks; implementation absorbs the wrappers"*. Don't write *"easier to maintain"* or *"cleaner code"*, because those terms aren't in the glossary and don't earn their place.

No hedging, no throat-clearing, no "it's worth noting that…". If a sentence could be a bullet, make it a bullet. If a bullet could be cut, cut it. If a term isn't in the `/codebase-design` glossary, reach for one that is before inventing a new one.
