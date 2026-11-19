import { Router } from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import TimeEntry from '../models/TimeEntry.js';
import { asyncRoute, fail } from '../middleware/errors.js';
import { taskFields } from '../middleware/taskFields.js';
import User from '../models/User.js';
import { projectAccess, accessibleTask, assignment } from '../middleware/projectAccess.js';
const router = Router();
async function send(req, res) {
  const owner = req.user._id;
  const projects = await Project.find(projectAccess(owner)).sort({ createdAt: 1 }).lean();
  const [tasks, entries, users] = await Promise.all([
    Task.find({ project: { $in: projects.map(p => p._id) } }).sort({ createdAt: 1 }).lean(),
    TimeEntry.find({ owner }).sort({ start: 1 }).lean(),
    User.find({ _id: { $in: projects.flatMap(p => [p.owner, ...(p.members || [])]) } }).select('name email').lean(),
  ]);

  const entry = e => ({ id: String(e._id), taskId: String(e.task), projectId: e.project ? String(e.project) : String(tasks.find(t => String(t._id) === String(e.task))?.project || projects.find(p => p.name === e.projectName)?._id || ''), start: +e.start, end: e.end ? +e.end : null, taskTitle: e.taskTitle, projectName: e.projectName });
  res.json({ projects: projects.map(p => ({ ...p, id: String(p._id), role: String(p.owner) === String(owner) ? 'owner' : 'member', teammates: users.filter(u => [p.owner, ...(p.members || [])].some(id => String(id) === String(u._id))).map(u => ({ id: String(u._id), name: u.name, email: u.email, role: String(p.owner) === String(u._id) ? 'owner' : 'member' })) })), tasks: tasks.map(t => ({ ...t, id: String(t._id), projectId: String(t.project), done: t.status === 'done' })), entries: entries.filter(e => e.end).map(entry), active: entries.find(e => !e.end) ? entry(entries.find(e => !e.end)) : null });
}
router.get('/data', asyncRoute(send));
router.post('/projects/:id/members', asyncRoute(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
  if (!project) throw fail(404, 'Owned project not found.');
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const user = email ? await User.findOne({ email }) : null;
  if (!user) throw fail(400, 'Ask this teammate to register first, then add their account email.');
  if (String(user._id) === String(project.owner)) throw fail(400, 'You already own this project.');
  await Project.updateOne({ _id: project._id }, { $addToSet: { members: user._id } });
  await send(req, res);
}));
router.delete('/projects/:id/members/:userId', asyncRoute(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
  if (!project) throw fail(404, 'Owned project not found.');
  if (!project.members.some(id => String(id) === req.params.userId)) throw fail(404, 'Member not found.');
  const tasks = await Task.find({ project: project._id }).select('_id');
  if (await TimeEntry.exists({ owner: req.params.userId, task: { $in: tasks.map(t => t._id) }, end: null })) throw fail(409, 'Ask this member to stop their timer first.');
  await Project.updateOne({ _id: project._id }, { $pull: { members: req.params.userId } });
  await Task.updateMany({ project: project._id, assignee: req.params.userId }, { $set: { assignee: null } });
  await send(req, res);
}));
router.patch('/projects/:id', asyncRoute(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
  if (!project) throw fail(404, 'Project not found.');
  const { name, description, archived } = req.body;
  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 120) throw fail(400, 'Enter a project name up to 120 characters.');
    project.name = name.trim();
  }
  if (description !== undefined) {
    if (typeof description !== 'string' || description.length > 2000) throw fail(400, 'Enter a description up to 2000 characters.');
    project.description = description.trim();
  }
  if (archived !== undefined) {
    if (typeof archived !== 'boolean') throw fail(400, 'Archived must be true or false.');
    if (archived) {
      const tasks = await Task.find({ project: project._id }).select('_id');
      if (await TimeEntry.exists({ task: { $in: tasks.map(t => t._id) }, end: null })) throw fail(409, 'Stop this project’s running timer before archiving.');
    }
    project.archived = archived;
  }
  await project.save();
  await send(req, res);
}));
router.post('/projects', asyncRoute(async (req, res) => {
  if (typeof req.body.name !== 'string' || !req.body.name.trim()) throw fail(400, 'Enter a project name.');
  await Project.create({ owner: req.user._id, name: req.body.name, description: req.body.description }); await send(req, res);
}));
router.post('/tasks', asyncRoute(async (req, res) => {
  if (typeof req.body.projectId !== 'string' || typeof req.body.title !== 'string' || !req.body.title.trim()) throw fail(400, 'Choose a project and enter a task title.');
  const project = await Project.findOne({ _id: req.body.projectId, ...projectAccess(req.user._id), archived: false });
  if (!project) throw fail(404, 'Project not found.');
  await Task.create({ owner: req.user._id, project: project._id, title: req.body.title, assignee: req.body.assignee === undefined ? null : assignment(req.body.assignee, project), ...taskFields(req.body) }); await send(req, res);
}));
router.patch('/tasks/:id', asyncRoute(async (req, res) => {
  const task = await accessibleTask(req.params.id, req.user._id);
  if (!task) throw fail(404, 'Task not found.');
  if (await TimeEntry.exists({ task: task._id, end: null })) throw fail(409, 'Stop the timer before changing this task.');
  if (Object.keys(req.body).length === 0) task.status = task.status === 'done' ? 'todo' : 'done';
  else {
    const { title, description } = req.body;
    const fields = taskFields(req.body);
    if (req.body.assignee !== undefined) fields.assignee = assignment(req.body.assignee, await Project.findById(task.project));
    if (title === undefined && description === undefined && Object.keys(fields).length === 0) throw fail(400, 'Provide task details to update.');
    Object.assign(task, fields);
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim() || title.trim().length > 200) throw fail(400, 'Enter a task title up to 200 characters.');
      task.title = title.trim();
    }
    if (description !== undefined) {
      if (typeof description !== 'string' || description.length > 5000) throw fail(400, 'Enter a description up to 5000 characters.');
      task.description = description.trim();
    }
  }
  await task.save(); await send(req, res);
}));
router.delete('/tasks/:id', asyncRoute(async (req, res) => {
  const task = await accessibleTask(req.params.id, req.user._id);
  if (!task) throw fail(404, 'Task not found.');
  if (await TimeEntry.exists({ task: task._id, end: null })) throw fail(409, 'Stop the timer before deleting this task.');
  await task.deleteOne();
  await send(req, res);
}));
router.post('/timer', asyncRoute(async (req, res) => {
  const owner = req.user._id;
  if (req.body.taskId) {
    if (typeof req.body.taskId !== 'string') throw fail(400, 'Choose a task.');
    const task = await accessibleTask(req.body.taskId, owner);
    if (!task || task.status === 'done') throw fail(404, 'Unfinished task not found.');
    const project = await Project.findOne({ _id: task.project, ...projectAccess(owner), archived: false });
    if (!project) throw fail(409, 'This project is archived.');
    if (await TimeEntry.exists({ owner, end: null })) throw fail(409, 'Stop your running timer first.');
    await TimeEntry.create({ owner, task: task._id, project: project._id, taskTitle: task.title, projectName: project.name, start: new Date() });
  } else await TimeEntry.findOneAndUpdate({ owner, end: null }, { $set: { end: new Date() } });
  await send(req, res);
}));
router.post('/entries', asyncRoute(async (req, res) => {
  const { taskId, start, end } = req.body;
  if (typeof taskId !== 'string') throw fail(400, 'Choose a task.');
  const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  if (typeof start !== 'string' || typeof end !== 'string' || !iso.test(start) || !iso.test(end)) throw fail(400, 'Choose valid start and end times.');
  const from = new Date(start), to = new Date(end);
  if (!Number.isFinite(+from) || !Number.isFinite(+to) || from.toISOString() !== start || to.toISOString() !== end || to <= from || +to > Date.now()) throw fail(400, 'End time must be after start time and cannot be in the future.');
  const owner = req.user._id;
  const task = await accessibleTask(taskId, owner);
  if (!task) throw fail(404, 'Task not found.');
  const project = await Project.findOne({ _id: task.project, ...projectAccess(owner), archived: false });
  if (!project) throw fail(409, 'Restore this project before adding time.');
  if (await TimeEntry.exists({ owner, start: { $lt: to }, $or: [{ end: null }, { end: { $gt: from } }] })) throw fail(409, 'This time overlaps an existing session or running timer.');
  await TimeEntry.create({ owner, task: task._id, project: project._id, taskTitle: task.title, projectName: project.name, start: from, end: to });
  await send(req, res);
}));
router.patch('/entries/:id', asyncRoute(async (req, res) => {
  const existing = await TimeEntry.findOne({ _id: req.params.id, owner: req.user._id });
  if (!existing) throw fail(404, 'Time entry not found.');
  if (!existing.end) throw fail(409, 'Stop the running timer before editing.');
  const { start, end } = req.body;
  const taskId = String(existing.task);
  if (typeof taskId !== 'string') throw fail(400, 'Choose a task.');
  const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  if (typeof start !== 'string' || typeof end !== 'string' || !iso.test(start) || !iso.test(end)) throw fail(400, 'Choose valid start and end times.');
  const from = new Date(start), to = new Date(end);
  if (!Number.isFinite(+from) || !Number.isFinite(+to) || from.toISOString() !== start || to.toISOString() !== end || to <= from || +to > Date.now()) throw fail(400, 'End time must be after start time and cannot be in the future.');
  const owner = req.user._id;
  if (await TimeEntry.exists({ _id: { $ne: existing._id }, owner, start: { $lt: to }, $or: [{ end: null }, { end: { $gt: from } }] })) throw fail(409, 'This time overlaps an existing session or running timer.');
  existing.start = from; existing.end = to;
  await existing.save();
  await send(req, res);
}));
export default router;
