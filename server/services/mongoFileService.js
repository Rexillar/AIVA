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
   ⟁  DOMAIN       : BUSINESS LOGIC

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


/*=================================================================
* Project: AIVA-WEB
* File: mongoFileService.js
* Author: Mohitraj Jadeja
* Date Created: October 22, 2025
* Last Modified: October 22, 2025
*=================================================================
* Description:
* MongoDB GridFS service for file storage in Atlas database.
*=================================================================
* Copyright (c) 2025 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';

let gfs;

export const initializeGridFS = () => {
  try {
    const db = mongoose.connection.db;
    gfs = new GridFSBucket(db, {
      bucketName: 'uploads'
    });
    console.log('✅ GridFS initialized');
    return true;
  } catch (error) {
    console.error('❌ GridFS initialization failed:', error.message);
    return false;
  }
};

export const uploadFileToMongo = async (fileBuffer, fileName, mimeType, metadata = {}) => {
  try {
    if (!gfs) {
      throw new Error('GridFS not initialized');
    }

    const uploadStream = gfs.openUploadStream(fileName, {
      contentType: mimeType,
      metadata: {
        ...metadata,
        uploadDate: new Date(),
        originalName: fileName
      }
    });

    const bufferStream = Readable.from(fileBuffer);
    bufferStream.pipe(uploadStream);

    return new Promise((resolve, reject) => {
      uploadStream.on('finish', () => {
        const fileUrl = `/api/uploads/${uploadStream.id}`;
        resolve({
          fileId: uploadStream.id.toString(),
          filename: fileName,
          path: `/uploads/${uploadStream.id}`,
          url: fileUrl,
          size: fileBuffer.length,
          mimetype: mimeType,
          gridfsId: uploadStream.id
        });
      });

      uploadStream.on('error', reject);
    });
  } catch (error) {
    console.error('❌ Error uploading to MongoDB:', error.message);
    throw error;
  }
};

export const getFileFromMongo = async (fileId) => {
  try {
    if (!gfs) {
      throw new Error('GridFS not initialized');
    }

    const downloadStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    return downloadStream;
  } catch (error) {
    console.error('❌ Error getting file from MongoDB:', error.message);
    throw error;
  }
};

export const deleteFileFromMongo = async (fileId) => {
  try {
    if (!gfs) {
      throw new Error('GridFS not initialized');
    }

    await gfs.delete(new mongoose.Types.ObjectId(fileId));
  } catch (error) {
    console.error('❌ Error deleting file from MongoDB:', error.message);
    throw error;
  }
};

export const getFileInfo = async (fileId) => {
  try {
    if (!gfs) {
      throw new Error('GridFS not initialized');
    }

    const files = await gfs.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
    return files[0] || null;
  } catch (error) {
    console.error('❌ Error getting file info from MongoDB:', error.message);
    throw error;
  }
};

export { gfs };