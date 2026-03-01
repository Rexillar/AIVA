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
   ⟁  DOMAIN       : UTILITIES

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Pure functions • Error handling • Documentation

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


import multer from 'multer';
import path from 'path';
import { uploadFileToMongo } from '../services/mongoFileService.js';

// Configure multer to use memory storage (for GridFS)
const storage = multer.memoryStorage();

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Allowed file extensions
  const allowedExtensions = /jpeg|jpg|png|gif|webp|svg|bmp|pdf|doc|docx|txt|csv|xlsx|xls|ppt|pptx|md|json|xml|zip|mp3|mp4|wav|ogg|webm/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  // Allowed MIME types
  const allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/csv', 'text/markdown',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/json', 'application/xml', 'text/xml',
    // Archives
    'application/zip', 'application/x-zip-compressed',
    // Audio/Video
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
    'video/mp4', 'video/webm', 'video/ogg',
    // Fallback for unknown binary
    'application/octet-stream',
  ];
  const mimeOk = allowedMimeTypes.includes(file.mimetype);

  if (extname || mimeOk) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype} (${path.extname(file.originalname)}). Images, documents, media, and archives are allowed.`));
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: fileFilter
});

export default upload; 