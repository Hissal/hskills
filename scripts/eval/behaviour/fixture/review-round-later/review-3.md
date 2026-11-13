# Review, round 3: add maxLength to slugify

Automated review of the round 2 head. Three findings.

## 1. Minor: an exclusion tag loses its dash

`src/tags.js:6`: `parseTag` cleans a tag with `trimDashes`, which now removes
dashes from both ends. `parseTag('-draft')` returns `draft`, so a post tagged
`-draft` is no longer hidden.

Suggested fix: trim only trailing dashes in `parseTag`.

## 2. Major: slugify compiles its pattern on every call

`src/slug.js:5`: the `/[^a-z0-9]+/g` literal sits inside `slugify`, so every
call builds it again. An import of a few thousand posts calls `slugify` once
per post.

Suggested fix: hoist the pattern to a module constant.

## 3. Major: a title with no letters or digits gives an empty slug

`src/slug.js:5`: every character of a title like `!!!` or `???` is replaced,
so `slugify('!!!')` returns an empty string. `parseTitle` accepts such a
title, since it is not blank, and the post then gets an empty URL slug.

Suggested fix: return `'post'` when the slug comes out empty.
