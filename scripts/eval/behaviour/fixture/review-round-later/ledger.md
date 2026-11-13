# Review ledger: add maxLength to slugify

The change adds the `maxLength` argument to `slugify` in `src/slug.js`.

## Round 1 (full review of the change)

- R1-1 `src/slug.js`: a cut slug can end in a dash (`slugify('Hello World', 6)`
  gave `hello-`). **Fixed**: trailing dashes are trimmed again after the cut.
- R1-2 `src/slug.js`: `slugify(null)` throws. **Declined**: the README requires
  a string title, and `parseTitle` checks every title from the post form.

## Round 2 (full review of the round 1 head)

- R2-1 `src/slug.js`: the round 1 fix repeated the trim expression in two
  places. **Fixed**: `slugify` now calls `trimDashes` from `src/text.js` for
  both trims, and `trimDashes` trims both ends. The diff of that fix is
  `round-2.diff`.

## Round 3

The findings are in `review-3.md`: a full review of the round 2 head.
