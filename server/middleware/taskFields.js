import { fail } from './errors.js';

export function taskFields(body) {
  const fields = {};
  if (body.status !== undefined) {
    if (!['todo', 'in-progress', 'done'].includes(body.status)) throw fail(400, 'Choose a valid task status.');
    fields.status = body.status;
  }
  if (body.priority !== undefined) {
    if (!['low', 'medium', 'high'].includes(body.priority)) throw fail(400, 'Choose a valid priority.');
    fields.priority = body.priority;
  }
  if (body.dueDate !== undefined) {
    if (body.dueDate === '' || body.dueDate === null) fields.dueDate = null;
    else {
      if (typeof body.dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)) throw fail(400, 'Choose a valid deadline.');
      const date = new Date(body.dueDate + 'T00:00:00.000Z');
      if (!Number.isFinite(+date) || date.toISOString().slice(0, 10) !== body.dueDate) throw fail(400, 'Choose a valid deadline.');
      fields.dueDate = date;
    }
  }
  return fields;
}
