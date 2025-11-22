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

import { adminStorage } from '../config/firebase.js';

export const uploadFileToFirebase = async (file, path) => {
  try {
    // Validate inputs
    if (!file?.buffer) {
      throw new Error('Invalid file object');
    }

    if (!path) {
      throw new Error('File path is required');
    }

    // Create file options
    const options = {
      destination: path,
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalname: file.originalname
        }
      }
    };

    // Upload file
    const [uploadedFile] = await adminStorage.upload(file.buffer, options);

    // Make file public
    await uploadedFile.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${adminStorage.name}/${path}`;

    return {
      filename: file.originalname,
      url: publicUrl,
      path: path,
      mimetype: file.mimetype,
      size: file.size
    };
  } catch (error) {
    //console.error('Firebase upload error:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

export const generateStoragePath = (workspaceId, taskId, filename) => {
  if (!workspaceId || !taskId || !filename) {
    throw new Error('Invalid storage path parameters');
  }
  
  // Sanitize the filename to remove special characters
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.]/g, '_');
  
  // Generate a unique path with timestamp
  return `workspaces/${workspaceId}/tasks/${taskId}/${Date.now()}_${sanitizedFilename}`;
}; 