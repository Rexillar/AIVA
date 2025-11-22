import express from 'express';
import {
  createReminder,
  getReminders,
  getRemindersByDate,
  updateReminder,
  deleteReminder,
} from '../controllers/reminderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getReminders);
router.route('/create').post(protect, createReminder);
router.route('/date/:date').get(protect, getRemindersByDate);
router.route('/:id')
  .put(protect, updateReminder)
  .delete(protect, deleteReminder);

export default router; 