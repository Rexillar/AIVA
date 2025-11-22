import mongoose from 'mongoose';

const completionSchema = new mongoose.Schema({
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Completion = mongoose.models.Completion || mongoose.model('Completion', completionSchema);

export default Completion;
