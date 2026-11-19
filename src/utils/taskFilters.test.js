import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterTasks } from './taskFilters.js';

test('search and combined task filters respect date boundaries and completion', () => {
  const tasks = [
    { id: 1, title: 'Build UI', description: 'Landing page', projectId: 'a', status: 'todo', priority: 'high', dueDate: '2026-11-13T00:00:00.000Z', done: false },
    { id: 2, title: 'Test API', projectId: 'a', status: 'done', priority: 'low', dueDate: '2026-11-14T00:00:00.000Z', done: true },
    { id: 3, title: 'Write docs', projectId: 'b', status: 'in-progress', priority: 'medium', dueDate: '2026-11-15T00:00:00.000Z', done: false },
    { id: 4, title: 'Ship', projectId: 'b', status: 'done', priority: 'high', dueDate: '2026-11-12T00:00:00.000Z', done: true },
    { id: 5, title: 'Plan', projectId: 'a', status: 'todo', priority: 'medium', done: false },
  ];
  const defaults = { search: '', project: 'all', status: 'all', priority: 'all', deadline: 'all' };
  const ids = filters => filterTasks(tasks, { ...defaults, ...filters }, '2026-11-14').map(t => t.id);
  assert.deepEqual(ids({}), [1, 2, 3, 4, 5]);
  assert.deepEqual(ids({ search: ' LANDING ' }), [1]);
  assert.deepEqual(ids({ search: 'api' }), [2]);
  assert.deepEqual(ids({ project: 'a', status: 'todo', priority: 'high', deadline: 'overdue', search: 'UI' }), [1]);
  assert.deepEqual(ids({ deadline: 'today' }), [2]);
  assert.deepEqual(ids({ deadline: 'upcoming' }), [3]);
  assert.deepEqual(ids({ deadline: 'overdue' }), [1]);
  assert.deepEqual(ids({ deadline: 'none' }), [5]);
  assert.deepEqual(ids({ status: 'done', deadline: 'overdue' }), []);
  assert.deepEqual(ids({ search: 'missing' }), []);
});
