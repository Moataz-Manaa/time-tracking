import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { fail } from './errors.js';

export const projectAccess = user => ({ $or: [{ owner: user }, { members: user }] });
export async function accessibleTask(id, user) {
  const projects = await Project.find(projectAccess(user)).select('_id');
  return Task.findOne({ _id: id, project: { $in: projects.map(p => p._id) } });
}
export function assignment(value, project) {
  if (value === '' || value === null) return null;
  if (typeof value !== 'string' || ![project.owner, ...project.members].some(id => String(id) === value)) throw fail(400, 'Assign a project teammate or choose Unassigned.');
  return value;
}
