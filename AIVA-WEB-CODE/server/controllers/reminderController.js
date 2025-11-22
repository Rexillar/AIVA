import asyncHandler from 'express-async-handler';
import Reminder from '../models/reminderModel.js';
import { scheduleReminder } from '../utils/scheduler.js';

// @desc    Create a new reminder
// @route   POST /api/reminders/create
// @access  Private
export const createReminder = asyncHandler(async (req, res) => {
  const { title, description, date, time, notifyBefore, email } = req.body;

  const reminder = await Reminder.create({
    user: req.user._id,
    title,
    description,
    date,
    time,
    notifyBefore,
    email,
  });

  if (reminder) {
    // Schedule the reminder notification
    if (email) {
      scheduleReminder({
        userId: req.user._id,
        reminderId: reminder._id,
        date,
        time,
        notifyBefore,
      });
    }

    res.status(201).json({
      status: true,
      data: reminder,
    });
  } else {
    res.status(400);
    throw new Error('Invalid reminder data');
  }
});

// @desc    Get all reminders for a user
// @route   GET /api/reminders
// @access  Private
export const getReminders = asyncHandler(async (req, res) => {
  const reminders = await Reminder.find({ user: req.user._id }).sort({ date: 1, time: 1 });
  
  res.json({
    status: true,
    data: reminders,
  });
});

// @desc    Get reminders for a specific date
// @route   GET /api/reminders/date/:date
// @access  Private
export const getRemindersByDate = asyncHandler(async (req, res) => {
  const { date } = req.params;
  
  const reminders = await Reminder.find({
    user: req.user._id,
    date: new Date(date),
  }).sort({ time: 1 });

  res.json({
    status: true,
    data: reminders,
  });
});

// @desc    Update a reminder
// @route   PUT /api/reminders/:id
// @access  Private
export const updateReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findById(req.params.id);

  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }

  // Check if the reminder belongs to the user
  if (reminder.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this reminder');
  }

  const updatedReminder = await Reminder.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  // Reschedule the reminder if date/time/notifyBefore changed
  if (updatedReminder.email) {
    scheduleReminder({
      userId: req.user._id,
      reminderId: updatedReminder._id,
      date: updatedReminder.date,
      time: updatedReminder.time,
      notifyBefore: updatedReminder.notifyBefore,
    });
  }

  res.json({
    status: true,
    data: updatedReminder,
  });
});

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
export const deleteReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findById(req.params.id);

  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }

  // Check if the reminder belongs to the user
  if (reminder.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this reminder');
  }

  await reminder.remove();

  res.json({
    status: true,
    message: 'Reminder removed',
  });
}); 