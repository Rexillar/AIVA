/*=================================================================
* Project: AIVA-WEB
* File: storageService.js
* Author: Mohitraj Jadeja
* Date Created: October 22, 2025
* Last Modified: October 22, 2025
*=================================================================
* Description:
* Unified storage service that can switch between different storage providers
*=================================================================
* Copyright (c) 2025 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import { driveService } from './googleDriveService.js';
import { uploadFileToMongo, getFileFromMongo, deleteFileFromMongo, getFileInfo } from './mongoFileService.js';

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'google-drive'; // google-drive, gridfs, gcs

class StorageService {
  constructor() {
    this.type = STORAGE_TYPE;
  }

  async uploadFile(fileBuffer, fileName, mimeType, metadata = {}) {
    switch (this.type) {
      case 'google-drive':
        return await driveService.uploadFile(fileBuffer, fileName, mimeType, metadata);

      case 'gridfs':
        return await uploadFileToMongo(fileBuffer, fileName, mimeType, metadata);

      case 'gcs':
        // TODO: Implement GCS upload
        throw new Error('GCS storage not implemented yet');

      default:
        throw new Error(`Unknown storage type: ${this.type}`);
    }
  }

  async downloadFile(fileId) {
    switch (this.type) {
      case 'google-drive':
        return await driveService.downloadFile(fileId);

      case 'gridfs':
        return await getFileFromMongo(fileId);

      case 'gcs':
        // TODO: Implement GCS download
        throw new Error('GCS storage not implemented yet');

      default:
        throw new Error(`Unknown storage type: ${this.type}`);
    }
  }

  async deleteFile(fileId) {
    switch (this.type) {
      case 'google-drive':
        return await driveService.deleteFile(fileId);

      case 'gridfs':
        return await deleteFileFromMongo(fileId);

      case 'gcs':
        // TODO: Implement GCS delete
        throw new Error('GCS storage not implemented yet');

      default:
        throw new Error(`Unknown storage type: ${this.type}`);
    }
  }

  async getFileInfo(fileId) {
    switch (this.type) {
      case 'google-drive':
        return await driveService.getFileInfo(fileId);

      case 'gridfs':
        return await getFileInfo(fileId);

      case 'gcs':
        // TODO: Implement GCS file info
        throw new Error('GCS storage not implemented yet');

      default:
        throw new Error(`Unknown storage type: ${this.type}`);
    }
  }
}

const storageService = new StorageService();

export { storageService, STORAGE_TYPE };
export default storageService;