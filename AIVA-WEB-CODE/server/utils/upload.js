/*=================================================================
* Project: AIVA-WEB
* File: upload.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: October 22, 2025
*=================================================================
* Description:
* File upload configuration using MongoDB GridFS for storage.
* Handles file uploads for avatars, attachments, and other media.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import multer from 'multer';
import path from 'path';
import { uploadFileToMongo } from '../services/mongoFileService.js';

// Configure multer to use memory storage (for GridFS)
const storage = multer.memoryStorage();

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Allowed file extensions
  const allowedExtensions = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xlsx|xls/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and documents are allowed.'));
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