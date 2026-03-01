import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  createRule,
  getRules,
  getRule,
  updateRule,
  deleteRule,
  toggleRule,
  triggerRule,
} from '../controllers/automationController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getRules)
  .post(createRule);

router.route('/:id')
  .get(getRule)
  .put(updateRule)
  .delete(deleteRule);

router.put('/:id/toggle', toggleRule);
router.post('/:id/trigger', triggerRule);

export default router;
