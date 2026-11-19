import React, { useState } from 'react';
import { format } from '../utils/time';
const local = value => new Date(value - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export default function TimeEntryRow({ entry, title, onSave }) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function submit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const start = new Date(values.get('start')), end = new Date(values.get('end'));
    if (!Number.isFinite(+start) || !Number.isFinite(+end) || end <= start || +end > Date.now()) { setError('End must be after start and cannot be in the future.'); return; }
    setPending(true); setError(''); setMessage('');
    try { if (await onSave(entry.id, { start: start.toISOString(), end: end.toISOString() })) { setEditing(false); setMessage('Time entry updated.'); } }
    finally { setPending(false); }
  }
  return <div className="border-t border-slate-100">
    <div className="task-row flex-wrap" style={{ borderTop: 0 }}><div className="flex-1 min-w-0"><p className="break-words">{title}</p><small>{entry.projectName} · {new Date(entry.start).toLocaleString()} → {new Date(entry.end).toLocaleString()}</small></div><span className="font-mono">{format(entry.end - entry.start)}</span><button className="secondary" disabled={pending} onClick={() => { setEditing(!editing); setMessage(''); setError(''); }}>Edit time</button></div>
    {editing && <form onSubmit={submit} className="px-6 pb-5 flex flex-wrap gap-3 items-end"><p className="w-full text-xs text-slate-500">Times use your browser’s local timezone.</p><label className="grid gap-2 text-sm">Start<input type="datetime-local" step="0.001" name="start" defaultValue={local(entry.start) + new Date(entry.start).toISOString().slice(16, 23)} required disabled={pending}/></label><label className="grid gap-2 text-sm">End<input type="datetime-local" step="0.001" name="end" defaultValue={local(entry.end) + new Date(entry.end).toISOString().slice(16, 23)} required disabled={pending}/></label><button className="primary" disabled={pending}>{pending ? 'Saving…' : 'Save changes'}</button><button className="secondary" type="button" disabled={pending} onClick={() => setEditing(false)}>Cancel</button>{error && <p role="alert" className="w-full text-sm text-red-700">{error}</p>}</form>}
    {message && <p role="status" className="px-6 pb-3 text-sm text-emerald-800">{message}</p>}
  </div>;
}
