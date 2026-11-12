# Review: add maxLength to slugify

Automated review of the change that added the `maxLength` argument to
`slugify` in `src/slug.js`. Three findings.

## 1. Major: a cut slug can end in a dash

`src/slug.js:9`: the slug is cut after the leading and trailing dashes are
trimmed, so a cut that lands just after a word leaves a dash at the end.
`slugify('Hello World', 6)` returns `hello-`.

Suggested fix: trim trailing dashes again after the cut.

## 2. Major: slugify crashes on a missing title

`src/slug.js:4`: `slugify` calls `title.toLowerCase()` without checking
`title`. `slugify(null)` and `slugify(undefined)` throw a `TypeError`, and
`slugify` is the package's public entry point, so any caller can pass them.

Suggested fix: return an empty string when `title` is not a string.

## 3. Major: a title with no letters or digits gives an empty slug

`src/slug.js:7`: every character of a title like `!!!` or `???` is replaced,
so `slugify('!!!')` returns an empty string. `parseTitle` accepts such a
title, since it is not blank, and the post then gets an empty URL slug.

Suggested fix: return `'post'` when the slug comes out empty.
