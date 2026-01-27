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


/*=================================================================
* Project: AIVA-WEB
* File: db.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Database configuration and connection setup for MongoDB using
* Mongoose with GridFS for file storage.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import express from "express";
import authRoutes from "./authRoutes.js";
import taskRoutes from "./taskRoutes.js";
import workspaceRoutes from "./workspaceRoutes.js";
import habitRoutes from "./habitRoutes.js";
import fileRoutes from "./fileRoutes.js";
import chatRoutes from "./chatRoutes.js";
import noteRoutes from "./noteRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import reminderRoutes from "./reminderRoutes.js";
import gamificationRoutes from "./gamificationRoutes.js";
import canvasRoutes from "./canvasRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/habits", habitRoutes);
router.use("/files", fileRoutes);
router.use("/chat", chatRoutes);
router.use("/notes", noteRoutes);
router.use("/notifications", notificationRoutes);
router.use("/reminders", reminderRoutes);
router.use("/gamification", gamificationRoutes);
router.use("/canvas", canvasRoutes);

export default router;