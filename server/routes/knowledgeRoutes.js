import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getKnowledgeIndex,
  getRelated,
  search,
  exportKB,
  createDecisionLog,
  getDecisionLogs,
  getDecisionLog,
  updateDecisionLog,
  deleteDecisionLog,
} from '../controllers/knowledgeController.js';

const router = express.Router();

router.use(protect);

// Knowledge Hub
router.get('/index', getKnowledgeIndex);
router.get('/related', getRelated);
router.get('/search', search);
router.get('/export', exportKB);

// Decision Logs (Tacit Knowledge)
router.route('/decisions')
  .get(getDecisionLogs)
  .post(createDecisionLog);

router.route('/decisions/:id')
  .get(getDecisionLog)
  .put(updateDecisionLog)
  .delete(deleteDecisionLog);

export default router;
