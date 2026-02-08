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

   ⟁  PURPOSE      : Define Drive API endpoints

   ⟁  WHY          : Organized Drive file management

   ⟁  WHAT         : Express route definitions for Drive operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/routes.md

   ⟁  USAGE RULES  : Define endpoints • Apply middleware • Handle routing

        "Routes defined. Endpoints organized. Drive integrated."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import express from 'express';
import {
  uploadFile,
  downloadFile,
  deleteFile,
  createFolder,
  listFiles,
  searchFiles,
  shareFile,
  getFileMetadata,
  updateFileMetadata,
  moveFile,
  getStorageQuota,
  getWorkspaceFiles,
  getStorageStats
} from '../controllers/driveController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// File operations
router.post('/upload/:workspaceId/:googleAccountId', protect, uploadFile);
router.get('/download/:workspaceId/:googleAccountId/:driveFileId', protect, downloadFile);
router.delete('/files/:workspaceId/:googleAccountId/:driveFileId', protect, deleteFile);

// Folder operations
router.post('/folders/:workspaceId/:googleAccountId', protect, createFolder);

// List and search
router.get('/files/:workspaceId/:googleAccountId', protect, listFiles);
router.get('/search/:workspaceId/:googleAccountId', protect, searchFiles);

// Sharing
router.post('/share', protect, shareFile);

// Metadata
router.get('/metadata/:workspaceId/:googleAccountId/:driveFileId', protect, getFileMetadata);
router.patch('/metadata/:workspaceId/:googleAccountId/:driveFileId', protect, updateFileMetadata);

// File management
router.post('/move', protect, moveFile);

// Storage info
router.get('/quota/:workspaceId/:googleAccountId', protect, getStorageQuota);
router.get('/workspace-files/:workspaceId', protect, getWorkspaceFiles);
router.get('/stats/:workspaceId', protect, getStorageStats);

export default router;
