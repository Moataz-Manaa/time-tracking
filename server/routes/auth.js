import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncRoute, fail } from '../middleware/errors.js';
const router = Router();
const limit = rateLimit({ windowMs: 900000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many attempts. Try again in 15 minutes.' } });
const publicUser = user => ({ id: String(user._id), name: user.name, email: user.email });
async function signIn(req, user) {
  await new Promise((resolve, reject) => req.session.regenerate(e => e ? reject(e) : resolve()));
  req.session.userId = String(user._id);
  req.session.version = user.sessionVersion || 0;
  await new Promise((resolve, reject) => req.session.save(e => e ? reject(e) : resolve()));
}
function credentials(body) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || password.length < 8 || Buffer.byteLength(password) > 72) throw fail(400, 'Enter a valid email and a password of 8–72 bytes.');
  return { email, password };
}
router.post('/register', limit, asyncRoute(async (req, res) => {
  const { email, password } = credentials(req.body);
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (!name || name.length > 100) throw fail(400, 'Enter a name up to 100 characters.');
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12) });
  await signIn(req, user); res.status(201).json({ user: publicUser(user) });
}));
router.post('/login', limit, asyncRoute(async (req, res) => {
  const { email, password } = credentials(req.body);
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !await bcrypt.compare(password, user.passwordHash)) throw fail(401, 'Email or password is incorrect.');
  await signIn(req, user); res.json({ user: publicUser(user) });
}));
router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
router.patch('/profile', requireAuth, asyncRoute(async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (!name || name.length > 100) throw fail(400, 'Enter a name up to 100 characters.');
  req.user.name = name;
  await req.user.save();
  res.json({ user: publicUser(req.user) });
}));
router.patch('/password', limit, requireAuth, asyncRoute(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string' || Buffer.byteLength(currentPassword) > 72 || typeof newPassword !== 'string' || newPassword.length < 8 || Buffer.byteLength(newPassword) > 72) throw fail(400, 'Enter your current password and a new password of 8–72 bytes.');
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!await bcrypt.compare(currentPassword, user.passwordHash)) throw fail(400, 'Current password is incorrect.');
  if (currentPassword === newPassword) throw fail(400, 'Choose a different new password.');
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.sessionVersion = (user.sessionVersion || 0) + 1;
  await user.save();
  await signIn(req, user);
  res.json({ message: 'Password changed.' });
}));
router.post('/logout', asyncRoute(async (req, res) => {
  await new Promise((resolve, reject) => req.session.destroy(e => e ? reject(e) : resolve()));
  res.clearCookie('tempo.sid', { path: '/' }); res.json({ message: 'Signed out.' });
}));
export default router;
