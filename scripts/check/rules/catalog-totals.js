'use strict';
// docs/catalog.md keeps its counts by hand: the `## Totals` table and the
// prose that restates it. They drifted from the catalog's own skill tables
// more than once (#335). This rule counts each part's skill table, the first
// table under `## <part>` with an Address column, and compares:
// - each part's Totals row with its table's model-invoked, user-invoked and
//   row counts, and every part section with a skill table has a Totals row;
// - the Collection total row with the sum of the part rows above it;
// - the prose totals: "the N collection skills", the closing figures of the
//   "Core reconstruction is" sentence, and "N decided packs, containing N
//   skills (N model-invoked, N user-invoked)".
// Silent when the catalog or its Totals section is absent. Once Totals
// exists, a count that is not a whole number, a part heading used twice, and
// a prose restatement reworded out of its pattern all fail rather than pass
// unchecked.

const FILE = 'docs/catalog.md';
const TOTAL = 'Collection total';
// A skill's Address in a part table: "core model-invoked", "web pack user-invoked".
const ADDRESS = /^(?:core|[a-z0-9-]+ pack) (?:model|user)-invoked$/;

const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((s) => s.trim());
const plain = (s) => s.replace(/[*`]/g, '').trim();
const isRow = (line) => /^\s*\|/.test(line);
const isRule = (line) => /^\s*\|[\s:|-]+\|\s*$/.test(line);

// Split the catalog into `## ` sections: { name, lines: [{ text, n }] }.
function sections(lines) {
  const out = [];
  let cur = null;
  lines.forEach((text, i) => {
    const h = /^## (.+?)\s*$/.exec(text);
    if (h) { cur = { name: h[1], lines: [] }; out.push(cur); return; }
    if (cur) cur.lines.push({ text, n: i + 1 });
  });
  return out;
}

// The tables in a section: { header, rows: [{ cells, n }] }.
function tables(section) {
  const out = [];
  const ls = section.lines;
  for (let i = 0; i < ls.length; i++) {
    if (!isRow(ls[i].text) || !ls[i + 1] || !isRule(ls[i + 1].text)) continue;
    const table = { header: cells(ls[i].text).map(plain), rows: [] };
    for (i += 2; i < ls.length && isRow(ls[i].text); i++) table.rows.push({ cells: cells(ls[i].text), n: ls[i].n });
    out.push(table);
  }
  return out;
}

function skillCounts(section) {
  const table = tables(section).find((t) => t.header.includes('Address'));
  if (!table) return null;
  const col = table.header.indexOf('Address');
  const address = (r) => plain(r.cells[col] || '');
  const has = (kind) => table.rows.filter((r) => ADDRESS.test(address(r)) && address(r).endsWith(kind)).length;
  const part = table.rows.length > 0 && table.rows.every((r) => ADDRESS.test(address(r)));
  return { model: has('model-invoked'), user: has('user-invoked'), skills: table.rows.length, part };
}

const show = (t) => t.model + ' model-invoked, ' + t.user + ' user-invoked, ' + t.skills + ' skills';
const same = (a, b) => a.model === b.model && a.user === b.user && a.skills === b.skills;
const sum = (list) => list.reduce((a, b) => ({ model: a.model + b.model, user: a.user + b.user, skills: a.skills + b.skills }), { model: 0, user: 0, skills: 0 });

module.exports = {
  id: 'catalog-totals',
  level: 'fail',
  check(c) {
    if (!c.exists(FILE)) return [];
    const lines = c.text(FILE).split(/\r?\n/);
    const all = sections(lines);
    const totalsSection = all.find((s) => s.name === 'Totals');
    if (!totalsSection) return [];
    const findings = [];
    const fail = (line, message) => findings.push({ file: FILE, line, message });

    // The Totals table: the first one in the section with a Part column.
    const table = tables(totalsSection).find((t) => t.header[0] === 'Part');
    if (!table) { fail(totalsSection.lines[0] && totalsSection.lines[0].n - 1, 'the Totals section has no Part table'); return findings; }
    const idx = (name) => table.header.findIndex((h) => h.toLowerCase() === name);
    const cols = { model: idx('model-invoked'), user: idx('user-invoked'), skills: idx('skills') };
    const lacking = Object.keys(cols).filter((k) => cols[k] < 0);
    if (lacking.length) { fail(totalsSection.lines[0] && totalsSection.lines[0].n - 1, 'the Totals table needs Model-invoked, User-invoked and Skills columns'); return findings; }
    // A row's three counts, or null (with a finding) when one is not a whole number.
    const read = (row) => {
      const raw = Object.fromEntries(Object.keys(cols).map((k) => [k, plain(row.cells[cols[k]] || '')]));
      if (Object.values(raw).every((v) => /^\d+$/.test(v))) return { model: Number(raw.model), user: Number(raw.user), skills: Number(raw.skills) };
      fail(row.n, 'Totals row "' + plain(row.cells[0]) + '" has a count that is not a whole number; fill in every count');
      return null;
    };

    const parts = [];
    let totalRow = null;
    const named = new Set();
    for (const row of table.rows) {
      const name = plain(row.cells[0]);
      if (named.has(name)) { fail(row.n, 'the Totals table has two "' + name + '" rows; keep one'); continue; }
      named.add(name);
      if (name === TOTAL) { totalRow = row; continue; }
      parts.push({ name, row, stated: read(row) });
    }

    // Each part row against its own section's skill table. A part is a
    // section the Totals table names, or one whose table holds only skill
    // addresses; other tables with an Address column (support, vendor
    // offers) are not parts.
    const counted = new Map();
    for (const s of all) {
      const counts = skillCounts(s);
      if (!counts || !(counts.part || parts.some((p) => p.name === s.name))) continue;
      if (counted.has(s.name)) fail(s.lines[0] && s.lines[0].n - 1, 'part "' + s.name + '" has two "## ' + s.name + '" sections; merge them');
      else counted.set(s.name, counts);
    }
    for (const p of parts) {
      const counts = counted.get(p.name);
      if (!counts) { fail(p.row.n, 'Totals names part "' + p.name + '" but the catalog has no "## ' + p.name + '" section with a skill table; fix the row or the heading'); continue; }
      if (p.stated && !same(p.stated, counts)) fail(p.row.n, 'Totals row "' + p.name + '" says ' + show(p.stated) + ', but its table has ' + show(counts) + '; update the row');
    }
    for (const name of counted.keys()) {
      if (!parts.some((p) => p.name === name)) {
        const s = all.find((x) => x.name === name);
        fail(s.lines[0] && s.lines[0].n - 1, 'part "' + name + '" has a skill table but no row in the Totals table; add one');
      }
    }

    // The Collection total against the part rows above it.
    if (!totalRow) fail(table.rows.length ? table.rows[table.rows.length - 1].n : undefined, 'the Totals table has no ' + TOTAL + ' row; add one');
    else {
      const stated = read(totalRow);
      const expected = parts.every((p) => p.stated) && sum(parts.map((p) => p.stated));
      if (stated && expected && !same(stated, expected)) fail(totalRow.n, TOTAL + ' says ' + show(stated) + ', but the part rows sum to ' + show(expected) + '; update the total');
    }

    // Prose that restates the counts, compared with the tables themselves.
    const core = counted.get('core');
    const packs = [...counted].filter(([name]) => name !== 'core').map(([, t]) => t);
    const whole = sum([...counted.values()]);
    const beyond = sum(packs);
    const seen = { collection: false, reconstruction: !core, packs: false };
    lines.forEach((text, i) => {
      const n = i + 1;
      for (const m of text.matchAll(/the \**(\d+)\** collection skills/g)) {
        seen.collection = true;
        if (Number(m[1]) !== whole.skills) fail(n, '"the ' + m[1] + ' collection skills" disagrees with the skill tables, which hold ' + whole.skills + '; update the figure');
      }
      if (core && /^Core reconstruction is /.test(text)) {
        // The bold reconstruction's closing figures follow its last "= "; an
        // earlier fragment never stands in for them.
        const bold = /^Core reconstruction is \*\*(.+?)\*\*/.exec(text);
        const at = bold ? bold[1].lastIndexOf('= ') : -1;
        const tail = at < 0 ? '' : bold[1].slice(at + 2);
        const last = /^(\d+) \((\d+) model \+ (\d+) user\)$/.exec(tail);
        if (last) {
          seen.reconstruction = true;
          const stated = { skills: Number(last[1]), model: Number(last[2]), user: Number(last[3]) };
          if (!same(stated, core)) fail(n, 'the core reconstruction ends at ' + show(stated) + ', but the core table has ' + show(core) + '; update the sentence');
        }
      }
      const p = /\**(\d+) decided packs\**, containing \**(\d+) skills\** \((\d+) model-invoked, (\d+) user-invoked\)/.exec(text);
      if (p) {
        seen.packs = true;
        const stated = { skills: Number(p[2]), model: Number(p[3]), user: Number(p[4]) };
        if (Number(p[1]) !== packs.length) fail(n, '"' + p[1] + ' decided packs" disagrees with the catalog, which has ' + packs.length + ' pack sections; update the figure');
        if (!same(stated, beyond)) fail(n, 'the packs sentence says ' + show(stated) + ' beyond core, but the pack tables have ' + show(beyond) + '; update the sentence');
      }
    });
    const wording = {
      collection: '"the N collection skills"',
      reconstruction: 'a "Core reconstruction is **…**" sentence whose bold part ends "= N (N model + N user)"',
      packs: '"N decided packs, containing N skills (N model-invoked, N user-invoked)"',
    };
    for (const k of Object.keys(seen)) {
      if (!seen[k]) fail(totalsSection.lines[0] && totalsSection.lines[0].n - 1, 'no prose restates the totals as ' + wording[k] + '; restore that wording, or change the catalog-totals rule with it');
    }
    return findings;
  },
};
