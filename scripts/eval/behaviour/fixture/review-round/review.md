# Review: per-site slug limits

Automated review of the change that added the `maxLength` argument to
`slugify` in `src/slug.js`, the limits in `src/sites.js` and `slugFor` in
`src/publish.js`. Three findings.

## 1. Minor: a cut slug can end in a dash

`src/slug.js:9`: the slug is cut after the leading and trailing dashes are
trimmed, so a cut that lands just after a word leaves a dash at the end.
`slugify('Hello World', 6)` returns `hello-`.

Suggested fix: trim trailing dashes again after the cut.

## 2. Minor: a site with no limit gets an empty slug

`src/slug.js:8`: `slugFor` passes a site's `maxSlugLength` straight through,
and a site with no limit sets it to `null`. `null !== undefined`, so the slug
is cut with `slice(0, null)`, which returns an empty string. Only the docs
site has no limit today.

Suggested fix: skip the cut when `maxLength` is `null`.

## 3. Major: slugify crashes on a missing title

`src/slug.js:4`: `slugify` calls `title.toLowerCase()` without checking
`title`. `slugify(null)` and `slugify(undefined)` throw a `TypeError`, and
`slugify` is the package's public entry point, so any caller can pass them.

Suggested fix: return an empty string when `title` is not a string.
