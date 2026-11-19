import React from 'react';
import ManualTimeEntry from '../components/ManualTimeEntry';
import TimeEntryRow from '../components/TimeEntryRow';
import { format } from '../utils/time';

export default function TimeLog({ data, totalsByTask, onAdd, onEdit }) {
  const { tasks, projects, entries, active } = data;
  const tasksById = new Map(tasks.map(task => [task.id, task]));
  const projectsById = new Map(projects.map(project => [project.id, project]));
  const titleFor = entry => tasksById.get(entry.taskId)?.title || entry.taskTitle || 'Deleted task';
  const totals = [...totalsByTask.values()].sort((a, b) => b.latestEntry.start - a.latestEntry.start);

  return <>
    <ManualTimeEntry tasks={tasks} projects={projects} onSave={onAdd}/>
    {totals.length > 0 && <section className="card mb-6" aria-labelledby="time-by-task">
      <div className="section-heading"><h2 id="time-by-task">Total time by task</h2></div>
      <ul>
        {totals.map(({ duration, latestEntry }) => {
          const { taskId, projectId, projectName } = latestEntry;
          const task = tasksById.get(taskId);
          const project = projectsById.get(task?.projectId || projectId);
          return <li className="task-row" key={taskId}>
            <div className="flex-1 min-w-0">
              <p className="break-words">{titleFor(latestEntry)}</p>
              <small className="break-words">{project?.name || projectName}</small>
            </div>
            <div className="shrink-0 text-right">
              <span className="font-mono font-semibold">{format(duration)}</span>
              {active?.taskId === taskId && <small className="text-emerald-800">Timer running</small>}
            </div>
          </li>;
        })}
      </ul>
    </section>}
    <section className="card">
      <div className="section-heading">
        <h2>Tracked sessions</h2>
        <span className="text-sm text-slate-500">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
      </div>
      {!entries.length && <p className="empty">Your finished timer sessions will appear here.</p>}
      {[...entries].sort((a, b) => b.start - a.start).map(entry =>
        <TimeEntryRow key={entry.id} entry={entry} title={titleFor(entry)} onSave={onEdit}/>
      )}
    </section>
  </>;
}
