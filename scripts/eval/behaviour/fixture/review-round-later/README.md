# slugkit

Turns post titles into URL slugs and cleans post tags for the blog.

## API

`slugify(title, maxLength)` returns the slug for `title`.

- `title` must be a non-empty string.
- `maxLength` is optional. When given, the slug is at most that many
  characters long.

`parseMaxLength(raw)` reads `maxSlugLength` from the site config: a whole
number of 1 or more. A site that leaves it unset, or sets it to `null`, has no
limit.

`parseTag(raw)` returns a cleaned tag. A tag that starts with a dash, such as
`-draft`, is an exclusion tag: the blog hides posts that carry it.

Post titles are usually several words, and the blog cuts slugs to 40
characters. The blog refuses a post whose slug is already taken and asks the
author for another title.
