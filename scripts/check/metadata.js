'use strict';
// Portable string-valued metadata subset: indented mapping entries with plain,
// single/double quoted, or literal/folded block scalar values. No YAML objects,
// aliases or implicit scalar coercion are accepted for contract fields.
const PREFIX = 'agent-skills-sync.';
const ID = /^hissal\.hskills\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

const { read: scalar, block: blockScalar } = require('./scalar');

function parseMetadata(frontmatter) {
  const values = Object.create(null);
  const errors = [];
  const lines = frontmatter || [];
  const start = lines.findIndex((l) => /^metadata:\s*(?:#.*)?$/.test(l));
  if (start >= 0) {
    let indent;
    for (let i = start + 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim() || /^\s*#/.test(line)) continue;
      if (!/^\s/.test(line)) break;
      const m = line.match(/^( +)([^:]+):\s*(.*)$/);
      if (!m) { errors.push('metadata must be a string mapping'); continue; }
      if (indent === undefined) indent = m[1].length;
      if (m[1].length !== indent) { errors.push('nested metadata is not supported'); continue; }
      const key = scalar(m[2]);
      let value;
      if (/^[|>][-+]?(?:\s+#.*)?$/.test(m[3])) {
        const block = [];
        while (i + 1 < lines.length && (/^\s*$/.test(lines[i + 1]) || lines[i + 1].search(/\S/) > indent)) block.push(lines[++i]);
        value = blockScalar(m[3], block);
      } else value = scalar(m[3]);
      if (key === null || value === null || typeof value !== 'string') errors.push('metadata values must be strings');
      else if (Object.hasOwn(values, key)) errors.push('duplicate metadata key ' + key);
      else values[key] = value;
    }
  }
  const schema = values[PREFIX + 'schema'];
  const id = values[PREFIX + 'id'];
  let requires = [];
  const raw = values[PREFIX + 'requires'];
  if (raw !== undefined && raw !== '') {
    try {
      requires = JSON.parse(raw);
      if (!Array.isArray(requires) || requires.some((v) => typeof v !== 'string' || !ID.test(v))) throw new Error();
    } catch (e) { errors.push('requires must be a JSON array of collection ID strings inside a string'); requires = []; }
  }
  if (schema !== '1') errors.push('declare agent-skills-sync.schema as "1"');
  if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id || '')) errors.push('ID is not publisher-qualified; use <publisher>/<lowercase-kebab-case-slug>');
  else if (!ID.test(id)) errors.push("another publisher's ID is not allowed in this collection; use hissal.hskills/");
  return { values, schema, id, requires, errors };
}

// The supplied skills alone define the resolved set. Never search the disk for
// a requirement: callers can also supply plugin subsets without changing this API.
function resolveSkills(skills) {
  const byId = new Map();
  const duplicates = [];
  for (const skill of skills) {
    const id = skill.metadata.id;
    if (!ID.test(id || '')) continue;
    if (byId.has(id)) duplicates.push(skill);
    else byId.set(id, skill);
  }
  return { byId, duplicates };
}
module.exports = { parseMetadata, resolveSkills };
