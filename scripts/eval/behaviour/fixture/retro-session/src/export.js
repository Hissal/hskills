import { writeFile } from 'node:fs/promises';

export async function exportRows(path, rows) {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 15000));
  await writeFile(path, JSON.stringify(rows));
}
