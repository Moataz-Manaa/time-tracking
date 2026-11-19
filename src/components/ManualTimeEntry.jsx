import React, { useState } from 'react';
import { format } from '../utils/time';

export default function ManualTimeEntry({ tasks, projects, onSave }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const available = tasks.filter(t => projects.some(p => p.id === t.projectId && !p.archived));
  const duration = +new Date(end) - +new Date(start);
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage(''); setError('');
    if (!Number.isFinite(duration) || duration <= 0 || +new Date(end) > Date.now()) { setError('End time must be after start time and cannot be in the future.'); return; }
    setPending(true);
    try {
      if (await onSave({ taskId: new FormData(form).get('taskId'), start: new Date(start).toISOString(), end: new Date(end).toISOString() })) {
        form.reset(); setStart(''); setEnd(''); setMessage('Time entry added.');
      }
    } finally { setPending(false); }
  }
  return <section className="card p-6 mb-6">
    <h2>Add time manually</h2><p className="text-sm text-slate-500 mt-2 mb-5">Forgot the timer? Record your work here. Times use your browser’s local timezone.</p>
    {!available.length ? <p className="text-sm text-slate-500">Create a task in an active project to add time.</p> : <form onSubmit={submit} className="flex flex-wrap items-end gap-4">
      <label className="grid gap-2 text-sm min-w-0">Task<select name="taskId" required disabled={pending} defaultValue="" className="max-w-full"><option value="" disabled>Choose a task</option>{available.map(t => <option key={t.id} value={t.id}>{projects.find(p => p.id === t.projectId)?.name} — {t.title}</option>)}</select></label>
      <label className="grid gap-2 text-sm">Start<input type="datetime-local" required value={start} onChange={e => setStart(e.target.value)} disabled={pending}/></label>
      <label className="grid gap-2 text-sm">End<input type="datetime-local" required value={end} onChange={e => setEnd(e.target.value)} disabled={pending}/></label>
      <button className="primary" disabled={pending}>{pending ? 'Saving…' : '+ Add time'}</button>
      {Number.isFinite(duration) && duration > 0 && <p className="text-sm text-slate-500 w-full">Duration: {format(duration)}</p>}
    </form>}
    {error && <p role="alert" className="text-red-700 mt-3 text-sm">{error}</p>}
    <p role="status" className="text-emerald-800 mt-3 text-sm">{message}</p>
  </section>;
}
