export function filterTasks(tasks, filters, today) {
  const query = filters.search.trim().toLowerCase();
  return tasks.filter(task => {
    const due = task.dueDate?.slice(0, 10);
    if (filters.project !== 'all' && task.projectId !== filters.project) return false;
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (query && !`${task.title} ${task.description || ''}`.toLowerCase().includes(query)) return false;
    if (filters.deadline === 'overdue' && (!due || due >= today || task.done)) return false;
    if (filters.deadline === 'today' && due !== today) return false;
    if (filters.deadline === 'upcoming' && (!due || due <= today)) return false;
    if (filters.deadline === 'none' && due) return false;
    return true;
  });
}
