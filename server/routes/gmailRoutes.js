import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getInbox,
  getEmailMessage,
  getEmailThread,
  getUnreadCount,
  getLabels,
  searchEmails,
} from '../controllers/gmailController.js';

const router = express.Router();

router.use(protect);

router.get('/inbox', getInbox);
router.get('/unread', getUnreadCount);
router.get('/labels', getLabels);
router.get('/search', searchEmails);
router.get('/messages/:id', getEmailMessage);
router.get('/threads/:id', getEmailThread);

export default router;
