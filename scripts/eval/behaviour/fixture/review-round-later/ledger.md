# Review ledger: add maxLength to slugify

The change adds the `maxLength` argument to `slugify` (`src/slug.js`,
`src/cut.js`) and reads the limit from the site config (`src/limits.js`).

## Round 1 (full review of the change)

- R1-1 `src/cut.js`: a cut slug can end in a dash (`slugify('Hello World', 6)`
  gave `hello-`). **Fixed**: `cut` drops a dash left at the end.
- R1-2 `src/slug.js`: `slugify(null)` throws. **Declined**: the README requires
  a string title, and `parseTitle` checks every title from the post form.

## Round 2 (full review of the round 1 head)

- R2-1 `src/slug.js`: `slugify` spelled out a dash-trimming expression that
  `src/text.js` already had a helper for. **Fixed**: `slugify` now calls
  `trimDashes`, and `trimDashes` trims both ends. The diff of that fix is
  `round-2.diff`.

## Round 3

The findings are in `review-3.md`: a full review of the round 2 head, by the
reviewer that made rounds 1 and 2.
