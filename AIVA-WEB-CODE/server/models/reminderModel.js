import mongoose from 'mongoose';

const reminderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    notifyBefore: {
      type: Number,
      required: true,
      default: 30, // minutes
    },
    email: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
reminderSchema.index({ user: 1, date: 1 });
reminderSchema.index({ status: 1, date: 1 });

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder; 