import React, { useRef, useState } from 'react';
import ProjectTeam from '../components/ProjectTeam';

export default function Projects({ projects, tasks, loading, onCreate, onUpdate, onMemberChange, onOpenTasks }) {
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('active');
  const [busy, setBusy] = useState(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const nameInput = useRef(null);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const name = values.get('name').trim();
    if (!name) { nameInput.current.setCustomValidity('Enter a project name.'); nameInput.current.reportValidity(); return; }
    setPending(true);
    setMessage('');
    try {
      const valuesToSave = { name, description: values.get('description').trim() };
      if (await (editing ? onUpdate(editing.id, valuesToSave) : onCreate(valuesToSave))) {
        form.reset();
        setMessage(editing ? 'Project updated.' : 'Project created.');
        setEditing(null);
        nameInput.current.focus();
      }
    } finally { setPending(false); }
  }

  return <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
    <section className="card p-6">
      <h2>{editing ? 'Edit project' : 'Create a project'}</h2>
      <p className="text-sm text-slate-500 mt-2 mb-6">Give your next idea a place to grow.</p>
      <form key={editing?.id || 'new'} onSubmit={submit} className="grid gap-4">
        <label className="grid gap-2 text-sm">Project name
          <input ref={nameInput} name="name" defaultValue={editing?.name || ''} required maxLength={120} placeholder="e.g. Website redesign" onInput={e => e.target.setCustomValidity('')} disabled={pending}/>
        </label>
        <label className="grid gap-2 text-sm">Description <span className="text-xs text-slate-400">Optional</span>
          <textarea name="description" defaultValue={editing?.description || ''} rows={4} maxLength={2000} placeholder="What is this project about?" disabled={pending}/>
        </label>
        <button className="primary" disabled={pending || loading || busy !== null}>{pending ? 'Saving…' : editing ? 'Save changes' : '+ Create project'}</button>
        {editing && <button type="button" className="secondary" disabled={pending} onClick={() => { setEditing(null); setMessage(''); }}>Cancel editing</button>}
        <p role="status" className="text-sm text-emerald-800">{message}</p>
      </form>
    </section>
    <section aria-label="Project list">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2>Projects <span className="count">{projects.filter(p => filter === 'all' || p.archived === (filter === 'archived')).length}</span></h2>
        <select className="ml-auto shrink-0" aria-label="Project status" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All projects</option>
        </select>
      </div>
      {loading ? <p className="card p-8 text-slate-500" role="status">Loading projects…</p> : projects.filter(p => filter === 'all' || p.archived === (filter === 'archived')).length === 0 ?
        <div className="card empty"><span className="empty-icon">▦</span><h3>No {filter === 'all' ? '' : filter} projects.</h3><p>{filter === 'archived' ? 'Archived projects will appear here.' : 'Create a project using the form.'}</p></div> :
        <div className="grid sm:grid-cols-2 gap-4">{projects.filter(p => filter === 'all' || p.archived === (filter === 'archived')).map(project => {
          const projectTasks = tasks.filter(task => task.projectId === project.id);
          const completed = projectTasks.filter(task => task.done).length;
          return <article className="card p-6 flex flex-col items-start" key={project.id}>
            <div className="flex items-center justify-between w-full gap-3 mb-4"><span className="project-icon">{project.name.charAt(0).toUpperCase()}</span><span className="text-xs text-slate-500">{project.archived ? 'Archived' : 'Active'}</span></div>
            <h3 className="font-semibold break-words max-w-full">{project.name}</h3>
            <p className="text-sm text-slate-500 whitespace-pre-wrap break-words mt-2 mb-5 flex-1">{project.description || 'No description yet.'}</p>
            <p className="text-xs text-slate-500 mb-3">{completed} of {projectTasks.length} tasks completed</p>
            <progress className="w-full h-2 accent-emerald-800 mb-5" aria-label={`${project.name} task completion`} value={completed} max={projectTasks.length || 1}/>
            <button className="secondary w-full" onClick={() => onOpenTasks(project.id)}>View tasks →</button>
            <div className="flex gap-3 mt-3 w-full">
              <button className="secondary flex-1" disabled={project.role === 'member' || pending || busy !== null} onClick={() => { setEditing(project); setMessage(''); }}>Edit</button>
              <button className="secondary flex-1" disabled={project.role === 'member' || pending || busy !== null} onClick={async () => {
                if (!project.archived && !window.confirm(`Archive “${project.name}”? Its tasks and tracked time will be kept. You can restore it later.`)) return;
                setBusy(project.id); setMessage('');
                try { if (await onUpdate(project.id, { archived: !project.archived })) { setMessage(project.archived ? 'Project restored.' : 'Project archived.'); if (editing?.id === project.id) setEditing(null); } }
                finally { setBusy(null); }
              }}>{busy === project.id ? 'Saving…' : project.archived ? 'Restore' : 'Archive'}</button>
            </div>
            <ProjectTeam project={project} onMemberChange={onMemberChange}/>
          </article>;
        })}</div>}
    </section>
  </div>;
}
