# slugkit

Turns post titles into URL slugs and cleans post tags for the blog.

## API

`slugify(title, maxLength)` returns the slug for `title`.

- `title` must be a non-empty string.
- `maxLength` is optional. When given, the slug is at most that many
  characters long.

`parseTag(raw)` returns a cleaned tag. A tag that starts with a dash, such as
`-draft`, is an exclusion tag: the blog hides posts that carry it.

Post titles are usually several words, and the blog cuts slugs to 40
characters.
