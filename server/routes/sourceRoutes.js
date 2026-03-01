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
   ⟁  DOMAIN       : API ROUTES

   ⟁  PURPOSE      : Define source endpoints

   ⟁  WHY          : Enable research copilot API

   ⟁  WHAT         : REST routes for source management

   ⟁  TECH STACK   : Node.js • Express
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH

   ⟁  USAGE RULES  : Use authentication middleware • Validate inputs

        "Routes defined. Endpoints accessible. Research enabled."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  createSource,
  getSources,
  getSource,
  updateSource,
  deleteSource,
  linkSourceToNote,
  unlinkSourceFromNote,
  getCitation,
  batchImportSources,
} from '../controllers/sourceController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Source CRUD operations
router.post('/', createSource);
router.get('/', getSources);
router.get('/:id', getSource);
router.patch('/:id', updateSource);
router.delete('/:id', deleteSource);

// Citation operations
router.get('/:id/citation', getCitation);

// Link/unlink sources to notes
router.post('/:sourceId/link/note/:noteId', linkSourceToNote);
router.delete('/:sourceId/link/note/:noteId', unlinkSourceFromNote);

// Batch operations
router.post('/batch/import', batchImportSources);

export default router;
