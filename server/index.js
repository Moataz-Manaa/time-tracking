import 'dotenv/config';
import { connectDatabase } from './config/database.js';
import { createApp } from './app.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import TimeEntry from './models/TimeEntry.js';
try {
  await connectDatabase();
  await Promise.all([User.init(), Project.init(), Task.init(), TimeEntry.init()]);
  const port = process.env.PORT || 3001;
  createApp().listen(port, '127.0.0.1', () => console.log(`Tempo running at http://127.0.0.1:${port}`));
} catch (error) { console.error('Startup failed:', error.message); process.exitCode = 1; }
