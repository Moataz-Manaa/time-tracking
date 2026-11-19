import React from 'react';

export default function TaskFilters({
  projects, project, search, status, priority, deadline,
  onProject, onSearch, onStatus, onPriority, onDeadline, onClear, completedPage,
}) {
  return <section aria-label="Search and filter tasks" className="task-controls task-filters">
    <label className="task-control-wide">
      Search tasks
      <input type="search" value={search} onChange={e => onSearch(e.target.value)} placeholder="Search titles and descriptions…"/>
    </label>
    <label>
      Project
      <select aria-label="Filter projects" value={project} onChange={e => onProject(e.target.value)}>
        <option value="all">All projects</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name}{p.archived ? ' (archived)' : ''}</option>)}
      </select>
    </label>
    <label>
      Status
      <select value={completedPage ? 'done' : status} disabled={completedPage} onChange={e => onStatus(e.target.value)}>
        <option value="all">All statuses</option>
        <option value="todo">To do</option>
        <option value="in-progress">In progress</option>
        <option value="done">Done</option>
      </select>
    </label>
    <label>
      Priority
      <select value={priority} onChange={e => onPriority(e.target.value)}>
        <option value="all">All priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </label>
    <label>
      Deadline
      <select value={deadline} onChange={e => onDeadline(e.target.value)}>
        <option value="all">All deadlines</option>
        <option value="overdue">Overdue (unfinished)</option>
        <option value="today">Due today</option>
        <option value="upcoming">Upcoming</option>
        <option value="none">No deadline</option>
      </select>
    </label>
    <button type="button" className="secondary" onClick={onClear}>Clear filters</button>
  </section>;
}
