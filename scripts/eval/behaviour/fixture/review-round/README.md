# slugkit

Turns post titles into URL slugs for our sites.

## API

`slugify(title, maxLength)` returns the slug for `title`.

- `title` must be a non-empty string.
- `maxLength` is optional. When given, the slug is at most that many
  characters long.

`slugFor(site, rawTitle)` checks a title from the post form and returns its
slug under that site's limit. Each site sets its limit in `src/sites.js`; a
site with no limit sets `maxSlugLength: null`.

Post titles are usually several words.
