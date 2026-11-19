import React, { useState } from 'react';
import { localDate, reportTotals } from '../utils/reports';
import { format } from '../utils/time';
import { reportCsv, downloadCsv } from '../utils/csv';

export default function Reports({ data, now, loading }) {
  const today = localDate(now);
  const week = new Date(now); week.setHours(0, 0, 0, 0); week.setDate(week.getDate() - (week.getDay() + 6) % 7);
  const [from, setFrom] = useState(localDate(week));
  const [to, setTo] = useState(today);
  const [project, setProject] = useState('all');
  const valid = from && to && from <= to;
  const calculate = (a, b) => reportTotals(data.entries, data.active, a, b, project, data.tasks, now);
  const result = valid ? calculate(from, to) : { total: 0, projects: [], tasks: [] };
  const names = new Map(data.projects.map(p => [p.id, p.name]));
  function exportReport(type) {
    downloadCsv(reportCsv(result, type, from, to, data.projects, Intl.DateTimeFormat().resolvedOptions().timeZone), `tempo-${type}-${from}-to-${to}.csv`);
  }
  return <section aria-label="Time reports">
    <div className="card p-6 mb-6 flex flex-wrap gap-4 items-end">
      <label className="grid gap-2 text-sm">From<input type="date" value={from} onChange={e => setFrom(e.target.value)}/></label>
      <label className="grid gap-2 text-sm">To<input type="date" value={to} onChange={e => setTo(e.target.value)}/></label>
      <label className="grid gap-2 text-sm">Project<select value={project} onChange={e => setProject(e.target.value)}><option value="all">All projects</option>{data.projects.map(p => <option key={p.id} value={p.id}>{p.name}{p.archived ? ' (archived)' : ''}</option>)}</select></label>
      <button className="secondary" onClick={() => { setFrom(today); setTo(today); }}>Today</button><button className="secondary" onClick={() => { setFrom(localDate(week)); setTo(today); }}>This week</button>
      <button className="primary" disabled={loading || !valid || !result.projects.length} onClick={() => exportReport('projects')}>Export projects CSV</button>
      <button className="primary" disabled={loading || !valid || !result.tasks.length} onClick={() => exportReport('tasks')}>Export tasks CSV</button>
    </div>
    {!valid && <p role="alert" className="text-red-700 mb-4">Choose a valid range with the end date on or after the start date.</p>}
    <p className="text-xs text-slate-500 mb-5">Dates use your browser’s timezone. Weeks start on Monday. Running timers are included; sessions crossing midnight are split across dates.</p>
    {loading ? <p role="status">Loading reports…</p> : <>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">{[['Today', calculate(today, today).total], ['This week', calculate(localDate(week), today).total], ['Selected range', result.total]].map(([label, duration]) => <div className="card stat" key={label}><p>{label}</p><strong>{format(duration)}</strong><small>{project === 'all' ? 'All projects' : names.get(project)}</small></div>)}</div>
      <div className="grid lg:grid-cols-2 gap-6">{[['By project', result.projects], ['By task', result.tasks]].map(([heading, rows]) => <section className="card" key={heading}><div className="section-heading"><h2>{heading}</h2><span className="text-xs text-slate-500">Selected range</span></div>{!rows.length && <p className="empty">No tracked time for this selection.</p>}{rows.map(row => <div className="task-row" key={row.id}><div className="flex-1 min-w-0"><p className="break-words">{heading === 'By project' ? names.get(row.id) || row.name : row.name}</p>{heading === 'By task' && <small>{row.projectName}</small>}<div className="h-1.5 bg-slate-100 rounded mt-3"><div className="h-full bg-emerald-700 rounded" style={{ width: `${result.total ? row.duration / result.total * 100 : 0}%` }}/></div></div><span className="font-mono text-sm">{format(row.duration)}</span></div>)}</section>)}</div>
    </>}
  </section>;
}
