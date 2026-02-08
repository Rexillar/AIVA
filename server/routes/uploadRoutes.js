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
import upload from '../utils/upload.js';
import { protect } from '../middlewares/authMiddleware.js';
import { fileUploadLimiter } from '../middlewares/advancedRateLimitMiddleware.js';
import { validateFileSize } from '../middlewares/requestSizeMiddleware.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get uploads directory path
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Upload file with rate limiting and size validation
router.post('/', protect, fileUploadLimiter, validateFileSize(50 * 1024 * 1024), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      data: {
        fileId: req.file.filename,
        filename: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get file by filename
router.get('/:filename', async (req, res) => {
  try {
    const { storageService } = await import('../services/storageService.js');

    // Extract file ID from filename
    const fileId = req.params.filename;

    // Get file info first
    const fileInfo = await storageService.getFileInfo(fileId);
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set appropriate headers
    const mimeType = fileInfo.mimeType || fileInfo.contentType || 'application/octet-stream';
    const fileName = fileInfo.name || fileInfo.filename || fileInfo.metadata?.originalName || 'file';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Stream the file
    const downloadStream = await storageService.downloadFile(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete file
router.delete('/:filename', protect, async (req, res) => {
  try {
    const { storageService, STORAGE_TYPE } = await import('../services/storageService.js');
    const { File } = await import('../models/index.js');

    // Find the file document
    const fileDoc = await File.findById(req.params.filename);
    if (!fileDoc) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Determine the correct file ID for deletion
    let fileIdToDelete;
    if (STORAGE_TYPE === 'google-drive') {
      fileIdToDelete = fileDoc.driveId;
    } else if (STORAGE_TYPE === 'gridfs') {
      // Try gridfsId first (for new uploads), then extract from URL (for old uploads)
      if (fileDoc.gridfsId) {
        fileIdToDelete = fileDoc.gridfsId;
      } else if (fileDoc.gcsUrl && fileDoc.gcsUrl.includes('/api/uploads/')) {
        // Extract GridFS ID from URL: /api/uploads/{id}
        const urlParts = fileDoc.gcsUrl.split('/api/uploads/');
        if (urlParts.length > 1) {
          fileIdToDelete = urlParts[1];
        } else {
          fileIdToDelete = req.params.filename; // Final fallback
        }
      } else {
        fileIdToDelete = req.params.filename; // Fallback
      }
    } else {
      fileIdToDelete = req.params.filename;
    }

    // Delete from storage
    await storageService.deleteFile(fileIdToDelete);

    // Remove from database
    await File.findByIdAndDelete(req.params.filename);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload multiple files
router.post('/multiple', protect, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      fileId: file.filename,
      filename: file.originalname,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
      success: true,
      data: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router; 