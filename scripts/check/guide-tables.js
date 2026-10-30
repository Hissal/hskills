'use strict';
// The guide contract uses two-column Markdown tables headed Need | Target.
// Keep parsing in the collection view so later guide rules can share it.
function needsTables(skill) {
  const rows = [];
  let table = false;
  let fence = null;
  skill.body.forEach((raw, i) => {
    const f = raw.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = null;
      table = false;
      return;
    }
    if (fence) return;
    const cells = raw.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((v) => v.trim());
    if (cells.length !== 2) { table = false; return; }
    if (/^need$/i.test(cells[0]) && /^target$/i.test(cells[1])) { table = true; return; }
    if (!table || cells.every((v) => /^:?-+:?$/.test(v))) return;
    rows.push({ need: cells[0], target: cells[1], line: skill.bodyLine + i });
  });
  return rows;
}
module.exports = { needsTables };
