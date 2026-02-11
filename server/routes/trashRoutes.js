
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getTrashItems } from '../controllers/unifiedTrashController.js';

const router = express.Router();

router.route('/').get(protect, getTrashItems);

export default router;
