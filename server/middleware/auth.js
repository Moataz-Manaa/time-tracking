import User from '../models/User.js';
export async function requireAuth(req, res, next) {
  try {
    if (!req.session.userId) return res.status(401).json({ error: 'Please sign in.' });
    req.user = await User.findById(req.session.userId);
    if (!req.user) return res.status(401).json({ error: 'Please sign in again.' });
    if ((req.session.version || 0) !== (req.user.sessionVersion || 0)) return res.status(401).json({ error: 'Password changed. Please sign in again.' });
    next();
  } catch (error) { next(error); }
}
