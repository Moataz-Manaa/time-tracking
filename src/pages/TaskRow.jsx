import React, { useState } from 'react';
import TaskFields from '../components/TaskFields';

const statusLabels = { todo: 'To do', 'in-progress': 'In progress', done: 'Done' };

export default function TaskRow({ task, project, running, duration, onChange, onTimer }) {
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const overdue = !task.done && task.dueDate && task.dueDate.slice(0, 10) < today;
  const status = task.status || (task.done ? 'done' : 'todo');
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  async function change(values, method = 'PATCH') {
    setPending(true); setMessage('');
    try { const ok = await onChange(task.id, values, method); if (ok) { setEditing(false); setMessage('Task updated.'); } return ok; }
    finally { setPending(false); }
  }
  async function save(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    await change({ title: fields.get('title').trim(), description: fields.get('description').trim(), status: fields.get('status'), priority: fields.get('priority'), dueDate: fields.get('dueDate') });
  }
  return <div className="border-t border-slate-100">
    <div className="flex flex-wrap items-center gap-3 px-6 pt-3 text-xs">
      <label className="flex items-center gap-2">Assigned to<select aria-label={'Assignee for ' + task.title} value={task.assignee || ''} disabled={running || pending} onChange={e => change({ assignee: e.target.value })}><option value="">Unassigned</option>{project?.teammates?.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
      <span className="task-status" data-status={status}>{statusLabels[status]}</span>
      <span className={'rounded px-2 py-1 ' + (task.priority === 'high' ? 'bg-red-50 text-red-700' : task.priority === 'low' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-800')}>{task.priority || 'medium'} priority</span>
      {task.dueDate && <span className={overdue ? 'text-red-700' : 'text-slate-500'}>Due {new Date(task.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}{overdue ? ' · Overdue' : ''}</span>}
    </div>
    <div className="task-row flex-wrap" style={{ borderTop: 0 }}>
      <input type="checkbox" aria-label={'Complete ' + task.title} checked={task.done} disabled={running || pending} onChange={() => change({})}/>
      <div className="flex-1 min-w-0"><p className={'break-words ' + (task.done ? 'line-through text-slate-400' : '')}>{task.title}</p><small>{project?.name}</small>{task.description && <p className="text-xs text-slate-500 whitespace-pre-wrap break-words mt-2">{task.description}</p>}</div>
      <span className="font-mono text-sm">{duration}</span>
      <button className="play" aria-label={running ? 'Stop timer' : 'Track ' + task.title} disabled={pending || task.done || (project?.archived && !running)} onClick={onTimer}>{running ? '■' : '▶'}</button>
      <button className="secondary" disabled={running || pending} onClick={() => { setEditing(!editing); setMessage(''); }}>Edit</button>
      <button className="secondary text-red-700" disabled={running || pending} onClick={() => { if (window.confirm(`Delete “${task.title}”? This cannot be undone. Tracked time will stay in your time log.`)) change({}, 'DELETE'); }}>Delete</button>
    </div>
    {editing && <form onSubmit={save} className="grid gap-3 px-6 pb-5">
      <label className="grid gap-2 text-sm">Task title<input name="title" defaultValue={task.title} required pattern=".*\S.*" maxLength={200} disabled={pending} autoFocus/></label>
      <label className="grid gap-2 text-sm">Description<textarea name="description" defaultValue={task.description || ''} rows={3} maxLength={5000} disabled={pending}/></label>
      <div className="task-controls"><TaskFields task={task} disabled={pending}/></div>
      <div className="flex gap-3"><button className="primary" disabled={pending}>{pending ? 'Saving…' : 'Save changes'}</button><button type="button" className="secondary" disabled={pending} onClick={() => setEditing(false)}>Cancel</button></div>
    </form>}
    {message && <p role="status" className="text-xs text-emerald-800 px-6 pb-3">{message}</p>}
  </div>;
}
