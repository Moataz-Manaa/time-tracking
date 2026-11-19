import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';
import workspaceRoutes from './routes/workspace.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/errors.js';
export function createApp() {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32 || process.env.SESSION_SECRET.startsWith('replace-')) throw new Error('Set a random SESSION_SECRET of at least 32 characters.');
  const production = process.env.NODE_ENV === 'production';
  const app = express();
  if (production) app.set('trust proxy', 1);
  app.disable('x-powered-by'); app.use(helmet()); app.use(express.json({ limit: '32kb' }));
  app.get('/api/health', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable' }));
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('origin') !== (process.env.APP_ORIGIN || 'http://127.0.0.1:5173')) return res.status(403).json({ error: 'Request origin is not allowed.' });
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) return res.status(400).json({ error: 'Send a JSON object.' });
    next();
  });
  app.use(session({ name: 'tempo.sid', secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false,
    store: MongoStore.create({ client: mongoose.connection.getClient(), collectionName: 'sessions' }),
    cookie: { httpOnly: true, secure: production, sameSite: 'lax', maxAge: 604800000 },
  }));
  app.use('/api/auth', authRoutes); app.use('/api', requireAuth, workspaceRoutes);
  app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
  const dist = fileURLToPath(new URL('../dist/', import.meta.url));
  app.use(express.static(dist)); app.get('*', (req, res) => res.sendFile(dist + '/index.html'));
  app.use(errorHandler); return app;
}
