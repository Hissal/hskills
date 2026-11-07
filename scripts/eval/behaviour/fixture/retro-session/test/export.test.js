import { test } from 'node:test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exportRows } from '../src/export.js';

test('writes the export file', { timeout: 5000 }, async () => {
  await exportRows(join(tmpdir(), 'export.json'), [{ name: 'a', total: 1 }]);
});
