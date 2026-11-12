# slugkit

Turns post titles into URL slugs for the blog.

## API

`slugify(title, maxLength)` returns the slug for `title`.

- `title` must be a non-empty string.
- `maxLength` is optional. When given, the slug is at most that many
  characters long.

Post titles are usually several words, and the blog cuts slugs to 40
characters.
