import test from 'node:test';
import assert from 'node:assert/strict';
import { backupDue } from '../scripts/backup/due.mjs';

test('a manual afternoon backup does not skip the next daily 03:00 run', () => {
  const afternoon = new Date(2026, 9, 16, 16, 52).toISOString();
  assert.equal(backupDue(afternoon, new Date(2026, 9, 16, 23)), false);
  assert.equal(backupDue(afternoon, new Date(2026, 9, 17, 1)), false);
  assert.equal(backupDue(afternoon, new Date(2026, 9, 17, 3, 1)), true);
  const daily = new Date(2026, 9, 17, 3, 5).toISOString();
  assert.equal(backupDue(daily, new Date(2026, 9, 17, 8)), false);
  assert.equal(backupDue(undefined, new Date(2026, 9, 17, 8)), true);
});
