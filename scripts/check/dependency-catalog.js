'use strict';

const START = '<!-- BEGIN GENERATED DEPENDENCIES -->';
const END = '<!-- END GENERATED DEPENDENCIES -->';
const FILE = 'docs/catalog.md';

function generate(c) {
  if (c.resolved.duplicates.length || c.skills.some((s) => s.metadata.errors.length)) {
    throw new Error('fix invalid or duplicate skill metadata before generating the catalog');
  }
  const rows = ['| Skill ID | Callable / source | Hard requirements |', '|---|---|---|'];
  const link = (s) => '[`' + s.name + '`](../' + s.skillMd + ')';
  const sorted = c.skills.slice().sort((a, b) => a.metadata.id < b.metadata.id ? -1 : a.metadata.id > b.metadata.id ? 1 : 0);
  for (const s of sorted) {
    const requirements = s.metadata.requires.slice().sort().map((id) => {
      const target = c.resolved.byId.get(id);
      if (!target) throw new Error('unresolved requirement ' + id);
      return '`' + id + '` ' + link(target);
    });
    rows.push('| `' + s.metadata.id + '` | ' + link(s) + ' | ' + (requirements.join(', ') || '—') + ' |');
  }
  return START + '\n' + rows.join('\n') + '\n' + END;
}

function update(text, c) {
  const generated = generate(c);
  const start = text.indexOf(START);
  const end = text.indexOf(END);
  if (start < 0 && end < 0) return text + (text.endsWith('\n') ? '\n' : '\n\n') + generated + '\n';
  if (start < 0 || end < start || text.indexOf(START, start + START.length) >= 0 || text.indexOf(END, end + END.length) >= 0) {
    throw new Error('dependency catalog markers must occur once, in order');
  }
  return text.slice(0, start) + generated + text.slice(end + END.length);
}

module.exports = { FILE, generate, update };
