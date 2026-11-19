export function localDate(value) {
  const date = new Date(value);
  return new Date(+date - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function reportTotals(entries, active, from, to, projectId, tasks, now) {
  const start = +new Date(from + 'T00:00:00');
  const finish = new Date(to + 'T00:00:00');
  finish.setDate(finish.getDate() + 1);
  const projects = new Map(), taskTotals = new Map();
  let total = 0;
  for (const entry of [...entries, ...(active ? [{ ...active, end: now }] : [])]) {
    const task = tasks.find(t => t.id === entry.taskId);
    const id = task?.projectId || entry.projectId || entry.projectName;
    if (projectId !== 'all' && id !== projectId) continue;
    const duration = Math.max(0, Math.min(entry.end, +finish, now) - Math.max(entry.start, start));
    if (!duration) continue;
    total += duration;
    const project = projects.get(id) || { id, name: entry.projectName || 'Project', duration: 0 };
    project.duration += duration; projects.set(id, project);
    const row = taskTotals.get(entry.taskId) || { id: entry.taskId, name: task?.title || entry.taskTitle || 'Deleted task', projectName: entry.projectName, duration: 0 };
    row.duration += duration; taskTotals.set(entry.taskId, row);
  }
  return { total, projects: [...projects.values()].sort((a, b) => b.duration - a.duration), tasks: [...taskTotals.values()].sort((a, b) => b.duration - a.duration) };
}
