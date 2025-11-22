/*=================================================================
* Project: AIVA-WEB
* File: gcsFileService.js
* Author: Mohitraj Jadeja
* Date Created: October 21, 2025
* Last Modified: October 21, 2025
*=================================================================
* Description:
* Google Cloud Storage file operations service
* Handles upload, download, delete, list with signed URLs
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import { getBucket, isGCSConfigured } from '../config/gcs.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class GCSFileService {
  constructor() {
    this.bucket = null;
    if (isGCSConfigured()) {
      this.bucket = getBucket();
    }
  }

  /**
   * Generate a unique file path for GCS
   * Format: workspace/{workspaceId}/{category}/{timestamp}-{uuid}-{filename}
   */
  generateFilePath(workspaceId, category, originalFilename) {
    const timestamp = Date.now();
    const uuid = uuidv4().split('-')[0];
    const ext = path.extname(originalFilename);
    const basename = path.basename(originalFilename, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    
    return `workspace/${workspaceId}/${category}/${timestamp}-${uuid}-${basename}${ext}`;
  }

  /**
   * Upload file to GCS
   * @param {Buffer} fileBuffer - File data buffer
   * @param {Object} metadata - File metadata
   * @returns {Promise<Object>} Upload result with GCS URL
   */
  async uploadFile(fileBuffer, metadata) {
    if (!this.bucket) {
      throw new Error('GCS is not configured');
    }

    const { 
      originalFilename, 
      workspaceId, 
      category = 'general',
      contentType,
      uploadedBy
    } = metadata;

    const filePath = this.generateFilePath(workspaceId, category, originalFilename);
    const file = this.bucket.file(filePath);

    try {
      // Upload file with metadata
      await file.save(fileBuffer, {
        metadata: {
          contentType: contentType || 'application/octet-stream',
          metadata: {
            originalFilename,
            workspaceId,
            category,
            uploadedBy: uploadedBy.toString(),
            uploadDate: new Date().toISOString()
          }
        },
        resumable: false
      });

      // Make file publicly readable or generate signed URL
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      console.log(`✅ File uploaded to GCS: ${filePath}`);

      return {
        success: true,
        gcsPath: filePath,
        publicUrl: url,
        bucketName: this.bucket.name,
        fileName: originalFilename,
        size: fileBuffer.length,
        contentType
      };
    } catch (error) {
      console.error('❌ GCS upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Download file from GCS
   * @param {string} gcsPath - Path to file in GCS
   * @returns {Promise<Buffer>} File buffer
   */
  async downloadFile(gcsPath) {
    if (!this.bucket) {
      throw new Error('GCS is not configured');
    }

    try {
      const file = this.bucket.file(gcsPath);
      const [buffer] = await file.download();
      
      console.log(`✅ File downloaded from GCS: ${gcsPath}`);
      return buffer;
    } catch (error) {
      console.error('❌ GCS download error:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Delete file from GCS
   * @param {string} gcsPath - Path to file in GCS
   * @param {boolean} softDelete - Move to trash instead of permanent delete
   */
  async deleteFile(gcsPath, softDelete = false) {
    if (!this.bucket) {
      throw new Error('GCS is not configured');
    }

    try {
      const file = this.bucket.file(gcsPath);

      if (softDelete) {
        // Move to trash folder
        const trashPath = gcsPath.replace(/^workspace\//, 'trash/');
        await file.move(trashPath);
        console.log(`🗑️  File moved to trash: ${gcsPath} -> ${trashPath}`);
        return { success: true, action: 'soft_delete', newPath: trashPath };
      } else {
        // Permanent delete
        await file.delete();
        console.log(`✅ File permanently deleted from GCS: ${gcsPath}`);
        return { success: true, action: 'permanent_delete' };
      }
    } catch (error) {
      console.error('❌ GCS delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * List files in a workspace
   * @param {string} workspaceId - Workspace ID
   * @param {string} category - Optional category filter
   * @returns {Promise<Array>} List of files
   */
  async listFiles(workspaceId, category = null) {
    if (!this.bucket) {
      throw new Error('GCS is not configured');
    }

    try {
      const prefix = category 
        ? `workspace/${workspaceId}/${category}/`
        : `workspace/${workspaceId}/`;

      const [files] = await this.bucket.getFiles({ prefix });

      const fileList = await Promise.all(
        files.map(async (file) => {
          const [metadata] = await file.getMetadata();
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          });

          return {
            name: file.name,
            size: parseInt(metadata.size),
            contentType: metadata.contentType,
            created: metadata.timeCreated,
            updated: metadata.updated,
            url,
            metadata: metadata.metadata
          };
        })
      );

      console.log(`✅ Listed ${fileList.length} files from workspace ${workspaceId}`);
      return fileList;
    } catch (error) {
      console.error('❌ GCS list error:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Generate a signed URL for secure access
   * @param {string} gcsPath - Path to file in GCS
   * @param {number} expiresIn - Expiration time in milliseconds
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(gcsPath, expiresIn = 3600000) {
    if (!this.bucket) {
      throw new Error('GCS is not configured');
    }

    try {
      const file = this.bucket.file(gcsPath);
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn,
      });

      return url;
    } catch (error) {
      console.error('❌ GCS signed URL error:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Copy file within GCS (useful for AI model updates)
   * @param {string} sourcePath - Source file path
   * @param {string} destinationPath - Destination file path
   */
  async copyFile(sourcePath, destinationPath) {
    if (!this.bucket) {
      throw new Error('GCS is not configured');
    }

    try {
      const sourceFile = this.bucket.file(sourcePath);
      const destFile = this.bucket.file(destinationPath);

      await sourceFile.copy(destFile);
      console.log(`✅ File copied: ${sourcePath} -> ${destinationPath}`);
      
      return { success: true, newPath: destinationPath };
    } catch (error) {
      console.error('❌ GCS copy error:', error);
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }

  /**
   * Restore file from trash
   * @param {string} trashPath - Path to file in trash
   * @returns {Promise<Object>} Restore result
   */
  async restoreFile(trashPath) {
    if (!this.bucket) {
      throw new Error('GCS is not configured');
    }

    try {
      const originalPath = trashPath.replace(/^trash\//, 'workspace/');
      await this.copyFile(trashPath, originalPath);
      await this.deleteFile(trashPath, false);

      console.log(`✅ File restored from trash: ${trashPath} -> ${originalPath}`);
      return { success: true, restoredPath: originalPath };
    } catch (error) {
      console.error('❌ GCS restore error:', error);
      throw new Error(`Failed to restore file: ${error.message}`);
    }
  }
}

// Export singleton instance
export const gcsFileService = new GCSFileService();
export default gcsFileService;
