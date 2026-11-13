# Review, round 3: add maxLength to slugify

Automated review of the round 2 head. Five findings.

## 1. Minor: an exclusion tag loses its dash

`src/tags.js:6`: `parseTag` cleans a tag with `trimDashes`, which now removes
dashes from both ends. `parseTag('-draft')` returns `draft`, so a post tagged
`-draft` is no longer hidden.

Suggested fix: trim only trailing dashes in `parseTag`.

## 2. Major: the limit error does not say which value was bad

`src/limits.js:8`: `parseMaxLength` throws `Bad maxSlugLength.` and leaves out
the value it rejected, so whoever reads the log has to open the site config.

Suggested fix: put the rejected value in the message.

## 3. Minor: a site with `maxSlugLength: null` fails to load

`src/limits.js:6`: `Number(null)` is `0`, so `parseMaxLength(null)` throws,
though the README gives `null` as the way to set no limit.

Suggested fix: treat `null` like an unset limit.

## 4. Major: two titles that share their first 40 characters get one slug

`src/cut.js:5`: `cut` keeps the first `max` characters, so titles such as
`Release notes for the spring platform update, part 1` and
`Release notes for the spring platform update, part 2` get the same slug. The blog refuses the second post and asks its author for another
title, though the titles differ.

Suggested fix: add an optional `unique` argument to `slugify` that appends a
short hash of the full title to a cut slug.

## 5. Major: a title with no letters or digits gives an empty slug

`src/slug.js:6`: every character of a title like `!!!` or `???` is replaced,
so `slugify('!!!')` returns an empty string. `parseTitle` accepts such a
title, since it is not blank, and the post then gets an empty URL slug.

Suggested fix: return `'post'` when the slug comes out empty.
