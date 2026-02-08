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
import multer from 'multer';
import { protect } from '../middlewares/authMiddleware.js';
import {
  validateWorkspaceAccess,
  validateFileAccess
} from '../middlewares/workspaceSecurityMiddleware.js';
import {
  uploadFile,
  getWorkspaceFiles,
  downloadFile,
  deleteFile,
  restoreFile,
  getFileDetails,
  updateFileMetadata,
  getTrashFiles
} from '../controllers/fileController.js';

const router = express.Router();

// Configure multer for file uploads (memory storage for GCS)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Add file type restrictions if needed
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mp3|webm|zip/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: images, PDFs, documents, videos, audio, zip'));
    }
  }
});

// Apply authentication to all routes
router.use(protect);

// Upload file (workspace security middleware validates workspace access)
router.post('/upload',
  validateWorkspaceAccess,
  upload.single('file'),
  uploadFile
);

// Get workspace files
router.get('/workspace/:workspaceId',
  validateWorkspaceAccess,
  getWorkspaceFiles
);

// Get trash files
router.get('/trash/:workspaceId',
  validateWorkspaceAccess,
  getTrashFiles
);

// File-specific operations (file access middleware validates both file and workspace)
router.route('/:id')
  .get(validateFileAccess, getFileDetails)
  .put(validateFileAccess, updateFileMetadata)
  .delete(validateFileAccess, deleteFile);

router.get('/:id/download', validateFileAccess, downloadFile);
router.post('/:id/restore', validateFileAccess, restoreFile);

export default router;
