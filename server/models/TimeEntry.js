import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  taskTitle: { type: String, required: true },
  projectName: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, default: null },
}, { timestamps: true });
entrySchema.index({ owner: 1, start: -1 });
entrySchema.index({ owner: 1 }, { unique: true, partialFilterExpression: { end: null }, name: 'one_running_timer_per_user' });

export default mongoose.model('TimeEntry', entrySchema);
