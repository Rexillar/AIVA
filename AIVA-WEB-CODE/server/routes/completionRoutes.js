import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createCompletion, getCompletions } from '../controllers/completionController.js';

const router = express.Router();

router.route('/').get(protect, getCompletions).post(protect, createCompletion);

export default router;
