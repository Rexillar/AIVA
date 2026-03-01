import mongoose from 'mongoose';

const decisionLogSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title: { type: String, required: true, trim: true },
  description: String,

  type: {
    type: String,
    enum: ['decision', 'retrospective', 'learning', 'process_change', 'risk_log'],
    default: 'decision'
  },

  // For retrospectives
  wentWell: [String],
  couldImprove: [String],
  actionItems: [String],

  // For decisions
  context: String,
  options: [{
    label: String,
    pros: [String],
    cons: [String]
  }],
  outcome: String,
  rationale: String,

  // For learnings
  keyTakeaways: [String],
  relatedProject: String,

  // Relations
  relatedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  relatedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],

  // Metadata
  tags: [String],
  visibility: { type: String, enum: ['private', 'workspace'], default: 'workspace' },
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

decisionLogSchema.index({ workspace: 1, type: 1, isArchived: 1 });
decisionLogSchema.index({ workspace: 1, tags: 1 });
decisionLogSchema.index({ title: 'text', description: 'text', 'keyTakeaways': 'text' });

const DecisionLog = mongoose.model('DecisionLog', decisionLogSchema);
export default DecisionLog;
