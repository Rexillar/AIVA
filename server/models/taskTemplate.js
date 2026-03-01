import mongoose from 'mongoose';

const templateSubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  estimatedDuration: { type: Number, default: 30 },
  category: { type: String, enum: ['research', 'writing', 'coding', 'reading', 'review', 'other'], default: 'other' }
});

const taskTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Template body
  taskTitle: { type: String, required: true },
  taskDescription: String,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  stage: { type: String, enum: ['todo', 'in_progress', 'review'], default: 'todo' },
  labels: [{ name: String, color: { type: String, default: '#3B82F6' } }],
  focusTag: { type: String, enum: ['deep-work', 'creative', 'planning', 'review', 'communication', 'learning', 'other'], default: null },
  estimatedHours: Number,
  subtasks: [templateSubtaskSchema],

  // Relative due date (e.g. "+3d" means 3 days from creation)
  relativeDueDays: { type: Number, default: 7 },

  // Usage tracking
  usageCount: { type: Number, default: 0 },
  lastUsedAt: Date,

  // Categorization
  category: { type: String, default: 'general' },
  tags: [String],
  isPublic: { type: Boolean, default: false },   // visible to all workspace members
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

taskTemplateSchema.index({ workspace: 1, isArchived: 1 });
taskTemplateSchema.index({ workspace: 1, category: 1 });

const TaskTemplate = mongoose.model('TaskTemplate', taskTemplateSchema);
export default TaskTemplate;
