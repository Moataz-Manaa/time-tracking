import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { format, trackedTime } from '../utils/time';
import Projects from './Projects';
import Reports from './Reports';
import Account from './Account';
import TaskRow from './TaskRow';
import TaskFields from '../components/TaskFields';
import TimeLog from './TimeLog';
import TaskFilters from '../components/TaskFilters';
import { filterTasks } from '../utils/taskFilters';

export default function Dashboard({ user, onLogout, onUserChanged }) {
  const [data, setData] = useState({ projects: [], tasks: [], entries: [], active: null });
  const [project, setProject] = useState('all');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [deadline, setDeadline] = useState('all');
  function clearFilters() { setProject('all'); setSearch(''); setStatus('all'); setPriority('all'); setDeadline('all'); }
  const [page, setPage] = useState(window.location.hash === '#projects' ? 'Projects' : 'Overview');
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    function navigate() {
      const pages = { '#account': 'Account', '#reports': 'Reports', '#projects': 'Projects', '#tasks': 'Tasks', '#completed': 'Completed', '#time-log': 'Time log' };
      setPage(pages[window.location.hash] || 'Overview');
    }
    navigate();
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  async function request(path, body, method = 'POST') {
    try { setError(''); const result = await api(path, body, method); setData(result); return true; } catch (e) { setError(e.message); return false; }
  }
  useEffect(() => { request('data').finally(() => setLoading(false)); const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const { total, byTask } = trackedTime(data.entries, data.active, now);
  const today = new Date(now - new Date(now).getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const tasks = filterTasks(data.tasks, { search, project, status: page === 'Completed' ? 'done' : status, priority, deadline }, today);
  const active = data.tasks.find(t => t.id === data.active?.taskId);
  async function addProject(e) { e.preventDefault(); const form = e.currentTarget; if (await request('projects', { name: new FormData(form).get('name') })) form.reset(); }
  async function addTask(e) { e.preventDefault(); const form = e.currentTarget; const fields = new FormData(form); if (await request('tasks', { title: fields.get('title'), projectId: fields.get('projectId'), status: fields.get('status'), priority: fields.get('priority'), dueDate: fields.get('dueDate') })) form.reset(); }
  return <div className="min-h-screen md:flex"><aside className="sidebar"><a className="brand" href="/">◷ <span>tempo<span className="text-lime-400">.</span></span></a><p className="nav-label">WORKSPACE</p>{['Overview', 'Projects', 'Tasks', 'Completed', 'Time log', 'Reports', 'Account'].map((name, i) => <button key={name} className={'nav-item ' + (page === name ? 'selected' : '')} onClick={() => { setPage(name); window.location.hash = name === 'Projects' ? 'projects' : name.toLowerCase().replace(' ', '-'); }}><span>{['▦', '▣', '☷', '✓', '◷', '▥', '⚙'][i]}</span>{name}</button>)}<div className="sidebar-bottom"><div className="avatar">{user.name.charAt(0).toUpperCase()}</div><div>{user.name}<small><button onClick={async () => { try { await onLogout(); } catch (e) { setError(e.message); } }}>Sign out</button></small></div></div></aside><main className="flex-1 min-w-0"><header><span>Workspace <span className="mx-3 text-slate-300">/</span> {page}</span><span className="text-slate-400">Keep your time meaningful.</span></header><div className="content"><div className="flex items-end justify-between gap-4 mb-8"><div><p className="eyebrow">A LITTLE FOCUS GOES A LONG WAY</p><h1>{page === 'Overview' ? 'Make room for good work.' : page}</h1><p className="text-slate-500 mt-2">Your projects, tasks, and time. All in one place.</p></div><span className="date">{new Date(now).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>{error && <p role="alert" className="bg-red-50 text-red-700 p-4 rounded-xl mb-4">{error}</p>}<section hidden={page !== 'Projects'}>{page === 'Projects' && <Projects projects={data.projects} tasks={data.tasks} loading={loading} onCreate={values => request('projects', values)} onUpdate={(id, values) => request('projects/' + id, values, 'PATCH')} onMemberChange={(id, email, userId) => request('projects/' + id + '/members' + (userId ? '/' + userId : ''), userId ? {} : { email }, userId ? 'DELETE' : 'POST')} onOpenTasks={id => { clearFilters(); setProject(id); setPage('Tasks'); window.location.hash = 'tasks'; }} onRetry={async () => { setLoading(true); await request('data'); setLoading(false); }}/>}</section>{page === 'Account' && <Account user={user} onUserChanged={onUserChanged}/>}
{page === 'Reports' && <Reports data={data} now={now} loading={loading}/>}
{page !== 'Projects' && page !== 'Reports' && page !== 'Account' && <><section className="grid sm:grid-cols-3 gap-4 mb-7">{[['Total tracked', format(total), 'Every minute adds up'], ['Active projects', data.projects.filter(p => !p.archived).length, 'Ideas moving forward'], ['Tasks completed', `${data.tasks.filter(t => t.done).length} / ${data.tasks.length}`, 'One step closer']].map(([label, value, note]) => <div className="card stat" key={label}><p>{label}</p><strong>{value}</strong><small>{note}</small></div>)}</section><section className="timer mb-8"><div><div className="flex items-center gap-2 text-sm"><span className={'dot ' + (active ? 'running' : '')}/>{active ? 'YOU’RE IN THE ZONE' : 'READY WHEN YOU ARE'}</div><h2>{active?.title || 'Great work starts with a little focus.'}</h2><p>{active ? data.projects.find(p => p.id === active.projectId)?.name : 'Press play on a task below to start tracking.'}</p></div><div className="flex items-center gap-5"><strong className="timer-number">{format(data.active ? now - data.active.start : 0)}</strong>{active && <button className="primary" onClick={() => request('timer', {})}>■ Stop timer</button>}</div></section>{page !== 'Time log' ? <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_280px]">
  <section className="card task-panel">
    <div className="section-heading">
      <h2>{page === 'Completed' ? 'Completed tasks' : 'Your tasks'} <span className="count" role="status">{tasks.length}<span className="sr-only"> matching {tasks.length === 1 ? 'task' : 'tasks'}</span></span></h2>
    </div>
    <TaskFilters
      projects={data.projects} project={project} search={search} status={status} priority={priority} deadline={deadline}
      onProject={setProject} onSearch={setSearch} onStatus={setStatus} onPriority={setPriority} onDeadline={setDeadline}
      onClear={clearFilters} completedPage={page === 'Completed'}
    />
    <form onSubmit={addTask} className="task-controls task-form">
      <label className="task-control-wide">
        Task title
        <input name="title" required placeholder="What needs to get done?"/>
      </label>
      <label>
        Project
        <select name="projectId" aria-label="Task project" required defaultValue="">
          <option value="" disabled>Select project</option>
          {data.projects.filter(p => !p.archived).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <TaskFields/>
      <button type="submit" className="primary" disabled={!data.projects.some(p => !p.archived)}>+ Add task</button>
    </form>
    {loading ? <p className="empty">Loading your workspace…</p> : !tasks.length ? <div className="empty"><span className="empty-icon">✓</span><h3>{data.tasks.length ? 'No matching tasks.' : 'A fresh start.'}</h3><p>{data.tasks.length ? 'Try another search or clear your filters.' : data.projects.length ? 'Add a task above and make your first move.' : 'Create your first project, then add a task.'}</p></div> : tasks.map(t => <TaskRow key={t.id} task={t} project={data.projects.find(p => p.id === t.projectId)} running={data.active?.taskId === t.id} duration={format(byTask.get(t.id)?.duration ?? 0)} onChange={(id, values, method) => request('tasks/' + id, values, method)} onTimer={() => request('timer', data.active?.taskId === t.id ? {} : { taskId: t.id })}/>)}</section><section className="card projects"><h2>Your projects</h2><p className="text-sm text-slate-500 mt-1 mb-5">Give your work a home.</p>{data.projects.map((p, i) => <button key={p.id} className="project-row" onClick={() => { clearFilters(); setProject(p.id); }}><span className="project-icon">{p.name.charAt(0).toUpperCase()}</span><span>{p.name}<small>{data.tasks.filter(t => t.projectId === p.id && !t.done).length} open tasks</small></span></button>)}<form onSubmit={addProject} className="mt-4"><input className="w-full mb-2" name="name" required aria-label="Project name" placeholder="New project name"/><button className="secondary w-full">+ Create project</button></form></section></div> : <TimeLog
  data={data} totalsByTask={byTask}
  onAdd={values => request('entries', values)}
  onEdit={(id, values) => request('entries/' + id, values, 'PATCH')}
/>}</>}<footer>A clear mind. A focused day. <span>Made for your everyday work.</span></footer></div></main></div>;
}



