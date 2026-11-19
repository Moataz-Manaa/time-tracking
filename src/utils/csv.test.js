import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reportCsv } from './csv.js';

test('CSV preserves report amounts, Unicode, quotes and protects spreadsheet formulas', () => {
  const result = { projects: [{ id: 'a', name: 'Old', duration: 5400000 }], tasks: [{ name: '=SUM(1,2)', projectName: 'Projet "Été", site\nweb', duration: 5400000 }] };
  const project = reportCsv(result, 'projects', '2026-11-01', '2026-11-14', [{ id: 'a', name: 'New name' }], 'Africa/Lagos');
  assert.ok(project.startsWith('\uFEFF'));
  assert.ok(project.includes('"New name","01:30:00","1.5000","5400.000"'));
  assert.ok(project.includes('"Africa/Lagos"'));
  assert.ok(project.endsWith('\r\n'));
  const task = reportCsv(result, 'tasks', '2026-11-01', '2026-11-14', [], 'Africa/Lagos');
  assert.ok(task.includes('"Projet ""Été"", site\nweb"'));
  assert.ok(task.includes('"\'=SUM(1,2)"'));
  const empty = reportCsv({ tasks: [] }, 'tasks', '2026-11-01', '2026-11-14', [], 'UTC');
  assert.equal(empty.split('\r\n').length, 2);
});
