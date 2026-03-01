import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  createTaskFromTemplate,
} from '../controllers/templateController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTemplates)
  .post(createTemplate);

router.route('/:id')
  .get(getTemplate)
  .put(updateTemplate)
  .delete(deleteTemplate);

router.post('/:id/create-task', createTaskFromTemplate);

export default router;
