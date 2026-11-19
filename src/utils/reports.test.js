import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reportTotals, localDate } from './reports.js';

test('reports split sessions at local midnight and filter preserved project IDs', () => {
  const start = +new Date('2026-11-13T23:00:00');
  const end = +new Date('2026-11-14T01:00:00');
  const now = +new Date('2026-11-14T02:00:00');
  const entries = [{ taskId: 'deleted', projectId: 'a', projectName: 'Original project', taskTitle: 'Removed task', start, end }];
  const report = (from, to, project = 'all', active = null) => reportTotals(entries, active, from, to, project, [], now);
  assert.equal(report('2026-11-14', '2026-11-14').total, 3600000);
  assert.equal(report('2026-11-13', '2026-11-14').total, 7200000);
  assert.equal(report('2026-11-13', '2026-11-14', 'b').total, 0);
  assert.equal(report('2026-11-13', '2026-11-14', 'a').projects[0].id, 'a');
  assert.equal(report('2026-11-14', '2026-11-14').tasks[0].name, 'Removed task');
  assert.equal(report('2026-11-15', '2026-11-15').total, 0);
  assert.equal(report('2026-11-14', '2026-11-14', 'all', { taskId: 'active', projectId: 'a', start: end }).total, 7200000);
  assert.equal(localDate(now), '2026-11-14');
});
