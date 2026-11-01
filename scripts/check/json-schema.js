'use strict';
// A dependency-free validator for the small JSON Schema (2020-12) subset the
// collection's schemas use (#246). It implements only the keywords in
// KEYWORDS; `unsupported(schema)` names any other keyword, so a schema never
// relies on a keyword this file would silently ignore. To use a new keyword,
// implement it in `validate` and add it here.

// Annotations: read by people and editors, no effect on validation.
const ANNOTATIONS = ['$schema', 'title', 'description'];
// Assertions and applicators this validator implements.
const ASSERTIONS = ['$defs', '$ref', 'type', 'const', 'enum', 'pattern', 'properties', 'required', 'additionalProperties', 'items', 'minItems', 'oneOf', 'anyOf'];
const KEYWORDS = new Set([...ANNOTATIONS, ...ASSERTIONS]);
const TYPES = new Set(['object', 'array', 'string', 'number', 'integer', 'boolean', 'null']);

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);
const equal = (a, b) => {
  if (typeOf(a) !== typeOf(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((x, i) => equal(x, b[i]));
  if (isObject(a)) {
    const ka = Object.keys(a);
    return ka.length === Object.keys(b).length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && equal(a[k], b[k]));
  }
  return a === b;
};
const REF = /^#\/\$defs\/([^/]+)$/;
const ptr = (base, key) => base + '/' + String(key).replace(/~/g, '~0').replace(/\//g, '~1');

// Problems with the schema itself: unsupported keywords, malformed keyword
// values and $refs that name no definition. Returns ['<pointer>: <problem>'].
function unsupported(root) {
  const out = [];
  const walk = (s, at) => {
    if (!isObject(s)) { out.push(at + ': a schema must be an object'); return; }
    for (const [k, v] of Object.entries(s)) {
      const here = ptr(at, k);
      if (!KEYWORDS.has(k)) { out.push(here + ': keyword "' + k + '" is outside the supported subset (' + [...KEYWORDS].join(', ') + ')'); continue; }
      if (k === '$defs' || k === 'properties') {
        if (!isObject(v)) out.push(here + ': must be an object');
        else for (const [n, sub] of Object.entries(v)) walk(sub, ptr(here, n));
      } else if (k === 'items') walk(v, here);
      else if (k === 'additionalProperties') { if (typeof v !== 'boolean') walk(v, here); }
      else if (k === 'oneOf' || k === 'anyOf') {
        if (!Array.isArray(v) || !v.length) out.push(here + ': must be a non-empty array');
        else v.forEach((sub, i) => walk(sub, ptr(here, i)));
      } else if (k === '$ref') {
        const m = typeof v === 'string' && v.match(REF);
        if (!m) out.push(here + ': only "#/$defs/<name>" references are supported');
        else if (!isObject(root.$defs) || !Object.prototype.hasOwnProperty.call(root.$defs, m[1])) out.push(here + ': ' + v + ' names no definition');
      } else if (k === 'type') {
        if (!TYPES.has(v)) out.push(here + ': type must be one of ' + [...TYPES].join(', '));
      } else if (k === 'required' || k === 'enum') {
        if (!Array.isArray(v)) out.push(here + ': must be an array');
      } else if (k === 'pattern') {
        try { new RegExp(v, 'u'); } catch (e) { out.push(here + ': not a valid pattern'); }
      } else if (k === 'minItems') {
        if (!Number.isInteger(v) || v < 0) out.push(here + ': must be a non-negative integer');
      }
    }
  };
  walk(root, '#');
  return out;
}

// Validates `value` against `schema` (assumed to pass `unsupported`).
// Returns ['<instance pointer>: <problem>'], empty when valid.
function validate(schema, value) {
  const run = (s, v, at) => {
    const out = [];
    if (s.$ref) out.push(...run(schema.$defs[s.$ref.match(REF)[1]], v, at));
    if (s.type) {
      const t = typeOf(v);
      const ok = s.type === t || (s.type === 'integer' && Number.isInteger(v)) || (s.type === 'number' && t === 'number');
      if (!ok) { out.push(at + ': expected ' + s.type + ', found ' + t); return out; }
    }
    if ('const' in s && !equal(s.const, v)) out.push(at + ': must be ' + JSON.stringify(s.const));
    if (s.enum && !s.enum.some((e) => equal(e, v))) out.push(at + ': must be one of ' + s.enum.map((e) => JSON.stringify(e)).join(', '));
    if (s.pattern !== undefined && typeof v === 'string' && !new RegExp(s.pattern, 'u').test(v)) out.push(at + ': does not match ' + s.pattern);
    if (isObject(v)) {
      const props = s.properties || {};
      for (const r of s.required || []) if (!Object.prototype.hasOwnProperty.call(v, r)) out.push(at + ': missing required "' + r + '"');
      for (const [k, sub] of Object.entries(v)) {
        if (Object.prototype.hasOwnProperty.call(props, k)) out.push(...run(props[k], sub, ptr(at, k)));
        else if (s.additionalProperties === false) out.push(ptr(at, k) + ': unknown field "' + k + '"');
        else if (isObject(s.additionalProperties)) out.push(...run(s.additionalProperties, sub, ptr(at, k)));
      }
    }
    if (Array.isArray(v)) {
      if (s.minItems !== undefined && v.length < s.minItems) out.push(at + ': needs at least ' + s.minItems + ' item(s)');
      if (s.items) v.forEach((item, i) => out.push(...run(s.items, item, ptr(at, i))));
    }
    if (s.anyOf && !s.anyOf.some((sub) => !run(sub, v, at).length)) out.push(at + ': matches none of anyOf ' + describe(s.anyOf));
    if (s.oneOf) {
      const n = s.oneOf.filter((sub) => !run(sub, v, at).length).length;
      if (n !== 1) out.push(at + ': must match exactly one of oneOf ' + describe(s.oneOf) + ', matches ' + n);
    }
    return out;
  };
  return run(schema, value, '#');
}

// A short form of the alternatives, for messages: {required:[x]} -> "x".
const describe = (subs) => '[' + subs.map((s) => (s.required ? s.required.join('+') : JSON.stringify(s))).join(' | ') + ']';

module.exports = { KEYWORDS, unsupported, validate };
