// Explicit, one-time import into an existing empty account. Original JSON is preserved.
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import TimeEntry from './models/TimeEntry.js';
try {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error('Usage: npm run import:legacy -- account@example.com');
  const legacy = JSON.parse(await readFile(new URL('./data.json', import.meta.url), 'utf8'));
  if (legacy.active) throw new Error('Stop the old running timer before importing.');
  await connectDatabase();
  const user = await User.findOne({ email });
  if (!user) throw new Error('Register this account first.');
  const owner = user._id;
  if (await Project.exists({ owner }) || await Task.exists({ owner }) || await TimeEntry.exists({ owner })) throw new Error('Import requires an empty account.');
  const projects = new Map(), tasks = new Map();
  for (const p of legacy.projects) projects.set(p.id, new Project({ owner, name: p.name }));
  for (const t of legacy.tasks) {
    if (!projects.has(t.projectId)) throw new Error('Legacy task references an unknown project.');
    tasks.set(t.id, new Task({ owner, project: projects.get(t.projectId)._id, title: t.title, status: t.done ? 'done' : 'todo' }));
  }
  const entries = legacy.entries.map(e => {
    const task = tasks.get(e.taskId);
    if (!task || !Number.isFinite(e.start) || !Number.isFinite(e.end) || e.end < e.start) throw new Error('Invalid legacy time entry.');
    return new TimeEntry({ owner, task: task._id, project: task.project, taskTitle: task.title, projectName: [...projects.values()].find(p => p._id.equals(task.project)).name, start: new Date(e.start), end: new Date(e.end) });
  });
  const records = [...projects.values(), ...tasks.values(), ...entries];
  await Promise.all(records.map(record => record.validate()));
  // Use a MongoDB transaction to avoid partial imports. Atlas or a replica set is required.
  await mongoose.connection.transaction(async session => {
    for (const record of records) await record.save({ session });
  });
  console.log(`Imported ${projects.size} projects, ${tasks.size} tasks, ${entries.length} entries.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
