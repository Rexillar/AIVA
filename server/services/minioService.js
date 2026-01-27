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
* File: minioService.js
* Author: Mohitraj Jadeja
* Date Created: October 22, 2025
* Last Modified: October 22, 2025
*=================================================================
* Description:
* MinIO service for temporary file storage in Docker container.
*=================================================================
* Copyright (c) 2025 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import { Client } from 'minio';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MinIO client configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const bucketName = 'aiva-uploads';

export const checkMinIOConnection = async () => {
  try {
    console.log('🔄 Checking MinIO connection...');
    await minioClient.bucketExists(bucketName);
    console.log('✅ MinIO service ready');
    return true;
  } catch (error) {
    console.error('❌ MinIO connection failed:', error.message);
    return false;
  }
};

export const createBucketIfNotExists = async () => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Created bucket: ${bucketName}`);
    }
  } catch (error) {
    console.error('❌ Error creating bucket:', error.message);
  }
};

export const uploadFileToMinIO = async (fileBuffer, fileName, mimeType) => {
  try {
    const filePath = `uploads/${Date.now()}-${fileName}`;

    await minioClient.putObject(bucketName, filePath, fileBuffer, {
      'Content-Type': mimeType,
    });

    const fileUrl = `${minioClient.protocol}//${minioClient.host}:${minioClient.port}/${bucketName}/${filePath}`;

    return {
      fileId: path.basename(filePath),
      filename: fileName,
      path: `/${bucketName}/${filePath}`,
      url: fileUrl,
      size: fileBuffer.length,
      mimetype: mimeType,
    };
  } catch (error) {
    console.error('❌ Error uploading to MinIO:', error.message);
    throw error;
  }
};

export const getFileFromMinIO = async (filePath) => {
  try {
    return await minioClient.getObject(bucketName, filePath);
  } catch (error) {
    console.error('❌ Error getting file from MinIO:', error.message);
    throw error;
  }
};

export const deleteFileFromMinIO = async (filePath) => {
  try {
    await minioClient.removeObject(bucketName, filePath);
  } catch (error) {
    console.error('❌ Error deleting file from MinIO:', error.message);
    throw error;
  }
};

export { minioClient, bucketName };