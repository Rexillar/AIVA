/*=================================================================
* Project: AIVA-WEB
* File: googleDriveService.js
* Author: Mohitraj Jadeja
* Date Created: October 22, 2025
* Last Modified: October 22, 2025
*=================================================================
* Description:
* Google Drive API service for file storage and management
*=================================================================
* Copyright (c) 2025 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Drive API credentials
const CREDENTIALS_PATH = process.env.GOOGLE_DRIVE_CREDENTIALS_PATH || path.join(__dirname, '../config/gcs-key.json');
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || null;

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.isAuthenticated = false;
  }

  async initialize() {
    try {
      console.log('🔄 Initializing Google Drive service...');

      // Load credentials
      const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));

      // Create OAuth2 client
      const { client_email, private_key } = credentials;
      this.auth = new google.auth.GoogleAuth({
        credentials: {
          client_email,
          private_key
        },
        scopes: ['https://www.googleapis.com/auth/drive.file']
      });

      // Create Drive API client
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.isAuthenticated = true;

      console.log('✅ Google Drive service initialized');
      return true;
    } catch (error) {
      console.error('❌ Google Drive initialization failed:', error.message);
      return false;
    }
  }

  async uploadFile(fileBuffer, fileName, mimeType, metadata = {}) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive service not initialized. Please check your credentials and ensure the Google Drive API is enabled.');
      }

      const fileMetadata = {
        name: fileName,
        parents: metadata.folderId ? [metadata.folderId] : (DRIVE_FOLDER_ID ? [DRIVE_FOLDER_ID] : undefined)
      };

      const media = {
        mimeType: mimeType,
        body: Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer)
      };

      console.log('Uploading file to Google Drive:', {
        name: fileName,
        mimeType: mimeType,
        size: fileBuffer.length
      });

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink,webContentLink,size,mimeType,createdTime'
      });

      const file = response.data;

      return {
        fileId: file.id,
        filename: file.name,
        driveUrl: file.webViewLink,
        downloadUrl: file.webContentLink,
        size: parseInt(file.size || 0),
        mimetype: file.mimeType,
        driveId: file.id,
        createdTime: file.createdTime
      };
    } catch (error) {
      console.error('❌ Error uploading to Google Drive:', error.message);
      
      // Provide more helpful error messages
      if (error.message.includes('API has not been used')) {
        throw new Error('Google Drive API is not enabled. Please enable it in Google Cloud Console.');
      }
      if (error.message.includes('access_denied')) {
        throw new Error('Google Drive access denied. Please check your service account permissions.');
      }
      
      throw error;
    }
  }

  async downloadFile(fileId) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive service not initialized');
      }

      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, {
        responseType: 'stream'
      });

      return response.data; // This is a readable stream
    } catch (error) {
      console.error('❌ Error downloading from Google Drive:', error.message);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive service not initialized');
      }

      await this.drive.files.delete({
        fileId: fileId
      });

      return true;
    } catch (error) {
      console.error('❌ Error deleting from Google Drive:', error.message);
      throw error;
    }
  }

  async getFileInfo(fileId) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive service not initialized');
      }

      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id,name,webViewLink,webContentLink,size,mimeType,createdTime,modifiedTime'
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error getting file info from Google Drive:', error.message);
      throw error;
    }
  }

  async createFolder(folderName, parentId = null) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive service not initialized');
      }

      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id,name'
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error creating folder in Google Drive:', error.message);
      throw error;
    }
  }

  async listFiles(folderId = null, pageSize = 100) {
    try {
      if (!this.drive) {
        throw new Error('Google Drive service not initialized');
      }

      const query = folderId ? `'${folderId}' in parents` : null;

      const response = await this.drive.files.list({
        q: query,
        pageSize: pageSize,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink)',
        orderBy: 'createdTime desc'
      });

      return response.data.files;
    } catch (error) {
      console.error('❌ Error listing files from Google Drive:', error.message);
      throw error;
    }
  }
}

const driveService = new GoogleDriveService();

export { driveService };
export default driveService;