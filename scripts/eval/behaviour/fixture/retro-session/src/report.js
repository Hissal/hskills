export function report(rows, { format = 'text' } = {}) {
  if (format === 'json') return JSON.stringify(rows);
  if (format === 'csv') return ['name,total', ...rows.map((r) => `${r.name},${r.total}`)].join('\n');
  return rows.map((r) => `${r.name}: ${r.total}`).join('\n');
}
