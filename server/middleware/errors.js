export const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
export const fail = (status, message) => Object.assign(new Error(message), { status });
export function errorHandler(error, req, res, next) {
  if (error.code === 11000) return res.status(409).json({ error: 'Record already exists or a timer is running.' });
  if (['ValidationError', 'CastError'].includes(error.name) || error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Please check the supplied values.' });
  if (!error.status) console.error(error);
  res.status(error.status || 500).json({ error: error.status ? error.message : 'Something went wrong. Please try again.' });
}
