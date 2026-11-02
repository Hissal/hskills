'use strict';
// A skill that ships a JSON schema as `<dir>/<stem>.schema.json` keeps its
// examples in `<dir>/<stem>-examples/*.json` (#246). Every example must
// validate against the schema, and the schema may use only the keyword subset
// scripts/check/json-schema.js implements. An examples folder with no schema
// beside it fails, so renaming a schema cannot silently stop the validation.

const path = require('path');
const { unsupported, validate } = require('../json-schema');

const SCHEMA = /\.schema\.json$/;
const EXAMPLE = /^(.*)-examples\/[^/]+\.json$/;

function parse(c, file) {
  try { return { value: JSON.parse(c.text(file)) }; } catch (e) { return { error: e.message }; }
}

module.exports = {
  id: 'schema-examples',
  level: 'fail',
  check(c) {
    const out = [];
    const files = c.skills.flatMap((s) => s.files);
    const schemas = new Map();
    for (const file of files.filter((f) => SCHEMA.test(f))) {
      const parsed = parse(c, file);
      if (parsed.error) { out.push({ file, message: 'schema is not valid JSON: ' + parsed.error }); continue; }
      const problems = unsupported(parsed.value);
      if (problems.length) out.push({ file, message: 'schema not supported by the check: ' + problems.join('; ') });
      schemas.set(file, problems.length ? null : parsed.value);
    }
    for (const file of files) {
      const m = file.match(EXAMPLE);
      if (!m) continue;
      const schemaFile = m[1] + '.schema.json';
      if (!schemas.has(schemaFile)) {
        out.push({ file, message: 'example has no schema: expected ' + path.posix.basename(schemaFile) + ' beside its ' + path.posix.basename(path.posix.dirname(file)) + ' folder' });
        continue;
      }
      const schema = schemas.get(schemaFile);
      if (!schema) continue; // the schema's own finding says why
      const parsed = parse(c, file);
      if (parsed.error) { out.push({ file, message: 'example is not valid JSON: ' + parsed.error }); continue; }
      const problems = validate(schema, parsed.value);
      if (problems.length) out.push({ file, message: 'invalid against ' + path.posix.basename(schemaFile) + ': ' + problems.join('; ') });
    }
    return out;
  },
};
