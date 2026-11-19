import { format } from './time.js';

function cell(value) {
  let text = String(value ?? '');
  // Keep user-supplied names as text when opened in spreadsheet applications.
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}

export function reportCsv(result, type, from, to, projects, timezone) {
  const names = new Map(projects.map(p => [p.id, p.name]));
  const rows = [['From', 'To', 'Timezone', 'Project', ...(type === 'tasks' ? ['Task'] : []), 'Duration (HH:MM:SS)', 'Hours', 'Seconds']];
  for (const row of result[type]) {
    rows.push([from, to, timezone, type === 'projects' ? names.get(row.id) || row.name : row.projectName,
      ...(type === 'tasks' ? [row.name] : []), format(row.duration), (row.duration / 3600000).toFixed(4), (row.duration / 1000).toFixed(3)]);
  }
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}

export function downloadCsv(csv, filename) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.appendChild(link);
  link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
