export function format(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor(seconds / 60) % 60).padStart(2, '0');
  return `${hours}:${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

export function trackedTime(entries, active, now) {
  const byTask = new Map();
  let total = 0;

  for (const entry of active ? [...entries, active] : entries) {
    const duration = Math.max(0, (entry.end ?? now) - entry.start);
    const task = byTask.get(entry.taskId) ?? { duration: 0, latestEntry: entry };
    task.duration += duration;
    if (entry.start >= task.latestEntry.start) task.latestEntry = entry;
    byTask.set(entry.taskId, task);
    total += duration;
  }

  return { total, byTask };
}
