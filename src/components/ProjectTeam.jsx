import React, { useState } from 'react';

export default function ProjectTeam({ project, onMemberChange }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  async function update(email, userId) {
    setPending(true); setMessage('');
    try { const ok = await onMemberChange(project.id, email, userId); if (ok) setMessage(userId ? 'Member removed.' : 'Teammate added.'); return ok; }
    finally { setPending(false); }
  }
  return <details className="w-full mt-4 text-sm"><summary className="cursor-pointer">Team · {project.teammates?.length || 1} people · You are {project.role || 'owner'}</summary>
    <ul className="my-3 grid gap-3">{project.teammates?.map(person => <li key={person.id} className="flex flex-wrap items-center gap-2"><span className="flex-1 break-all">{person.name}<small>{person.email} · {person.role}</small></span>{project.role === 'owner' && person.role !== 'owner' && <button className="secondary" disabled={pending} onClick={() => { if (window.confirm(`Remove ${person.name} from this project?`)) update(null, person.id); }}>Remove</button>}</li>)}</ul>
    {project.role === 'owner' && <form className="grid gap-2" onSubmit={async e => { e.preventDefault(); const form = e.currentTarget; if (await update(new FormData(form).get('email'))) form.reset(); }}><label className="grid gap-2">Add registered teammate<input name="email" type="email" placeholder="teammate@example.com" required disabled={pending}/></label><button className="secondary" disabled={pending}>{pending ? 'Saving…' : 'Add teammate'}</button><p className="text-xs text-slate-500">Members can create, edit, assign, and delete shared tasks. Only the owner manages project settings and membership.</p></form>}
    <p role="status" className="text-xs text-emerald-800 mt-2">{message}</p>
  </details>;
}
