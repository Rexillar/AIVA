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

   ⟁  PURPOSE      : Define API endpoints and route handlers

   ⟁  WHY          : Organized API structure and request routing

   ⟁  WHAT         : Express route definitions and middleware application

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/routes.md

   ⟁  USAGE RULES  : Define endpoints • Apply middleware • Handle routing

        "Routes defined. Endpoints organized. API structured."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createCompletion, getCompletions } from '../controllers/completionController.js';

const router = express.Router();

router.route('/').get(protect, getCompletions).post(protect, createCompletion);

export default router;
