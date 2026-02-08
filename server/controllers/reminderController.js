/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ◉  Deterministic Execution System
   ◉  Rule-Bound • State-Aware • Non-Emotive

   ⟁  SYSTEM LAYER : BACKEND CORE
   ⟁  DOMAIN       : API CONTROLLERS

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/controllers.md

   ⟁  USAGE RULES  : Validate inputs • Handle errors • Log activities

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


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

// @desc    Get today's reminders
// @route   GET /api/reminders/today
// @access  Private
export const getTodayReminders = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const reminders = await Reminder.find({
    user: req.user._id,
    date: {
      $gte: today,
      $lt: tomorrow
    }
  }).sort({ time: 1 });

  res.json({
    status: true,
    count: reminders.length,
    data: reminders,
  });
});

// @desc    Update reminder time
// @route   PUT /api/reminders/:id/time
// @access  Private
export const updateReminderTime = asyncHandler(async (req, res) => {
  const { time, date } = req.body;
  const reminder = await Reminder.findById(req.params.id);

  if (!reminder) {
    res.status(404);
    throw new Error('Reminder not found');
  }

  if (reminder.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this reminder');
  }

  if (time) reminder.time = time;
  if (date) reminder.date = new Date(date);

  await reminder.save();

  // Reschedule if email notifications are enabled
  if (reminder.email) {
    scheduleReminder({
      userId: req.user._id,
      reminderId: reminder._id,
      date: reminder.date,
      time: reminder.time,
      notifyBefore: reminder.notifyBefore,
    });
  }

  res.json({
    status: true,
    message: 'Reminder time updated successfully',
    data: reminder,
  });
});

// @desc    Delete all reminders on a specific date
// @route   DELETE /api/reminders/batch/delete-by-date
// @access  Private
export const deleteAllRemindersOnDate = asyncHandler(async (req, res) => {
  const { date } = req.body;

  if (!date) {
    res.status(400);
    throw new Error('Date is required');
  }

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const result = await Reminder.deleteMany({
    user: req.user._id,
    date: {
      $gte: targetDate,
      $lt: nextDay
    }
  });

  res.json({
    status: true,
    message: `Deleted ${result.deletedCount} reminder(s) for ${date}`,
    count: result.deletedCount,
  });
});
