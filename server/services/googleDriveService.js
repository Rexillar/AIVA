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

   ⟁  PURPOSE      : Synchronize data with Google services

   ⟁  WHY          : Real-time external data integration

   ⟁  WHAT         : Google API client and sync operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : OAuth 2.0 • AES-256-GCM
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Data synchronized. Services integrated. Real-time updated."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


import { google } from 'googleapis';
import GoogleIntegration from '../models/googleIntegration.js';
import DriveFile from '../models/driveFile.js';
import googleAuthService from './googleAuthService.js';
import { Readable } from 'stream';
import path from 'path';

class GoogleDriveService {
  constructor() {
    this.AIVA_FOLDER_NAME = 'AIVA Workspace';
    this.mimeTypes = {
      folder: 'application/vnd.google-apps.folder',
      document: 'application/vnd.google-apps.document',
      spreadsheet: 'application/vnd.google-apps.spreadsheet',
      presentation: 'application/vnd.google-apps.presentation',
      form: 'application/vnd.google-apps.form'
    };
  }

  /**
   * Get authenticated Drive client
   */
  async getDriveClient(workspaceId, googleAccountId) {
    const integration = await GoogleIntegration.findByWorkspace(workspaceId);
    if (!integration) {
      throw new Error('No Google integration found for workspace');
    }

    const account = integration.getAccountById(googleAccountId);
    if (!account || account.status !== 'active') {
      throw new Error('Google account not active');
    }

    // Check and refresh token if needed
    if (googleAuthService.isTokenExpired(account.tokenExpiry)) {
      const refreshed = await googleAuthService.refreshAccessToken(account.refreshToken);
      account.accessToken = googleAuthService.encrypt(refreshed.accessToken);
      account.tokenExpiry = refreshed.expiryDate;
      await integration.save();
    }

    const auth = googleAuthService.getAuthenticatedClient(
      account.accessToken,
      account.refreshToken
    );

    return google.drive({ version: 'v3', auth });
  }

  /**
   * Get or create AIVA workspace folder
   */
  async getOrCreateWorkspaceFolder(drive, workspaceId) {
    try {
      // Check if folder already exists in database
      const existingFolder = await DriveFile.findOne({
        workspaceId,
        fileName: this.AIVA_FOLDER_NAME,
        fileType: 'folder',
        isDeleted: false
      });

      if (existingFolder) {
        // Verify folder still exists in Drive
        try {
          await drive.files.get({
            fileId: existingFolder.driveFileId,
            fields: 'id, name'
          });
          return existingFolder.driveFileId;
        } catch (error) {
          // Folder doesn't exist in Drive, remove from DB and create new
          await DriveFile.findByIdAndDelete(existingFolder._id);
        }
      }

      // Search for existing folder in Drive
      const response = await drive.files.list({
        q: `name='${this.AIVA_FOLDER_NAME}' and mimeType='${this.mimeTypes.folder}' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.data.files && response.data.files.length > 0) {
        const folderId = response.data.files[0].id;

        // Save to database
        await DriveFile.create({
          workspaceId,
          driveFileId: folderId,
          fileName: this.AIVA_FOLDER_NAME,
          fileType: 'folder',
          mimeType: this.mimeTypes.folder,
          size: 0
        });

        return folderId;
      }

      // Create new folder
      const folderMetadata = {
        name: this.AIVA_FOLDER_NAME,
        mimeType: this.mimeTypes.folder
      };

      const folder = await drive.files.create({
        resource: folderMetadata,
        fields: 'id, name'
      });

      // Save to database
      await DriveFile.create({
        workspaceId,
        driveFileId: folder.data.id,
        fileName: this.AIVA_FOLDER_NAME,
        fileType: 'folder',
        mimeType: this.mimeTypes.folder,
        size: 0
      });

      return folder.data.id;
    } catch (error) {
      console.error('Error getting/creating workspace folder:', error);
      throw new Error('Failed to access workspace folder');
    }
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(workspaceId, googleAccountId, fileData) {
    try {
      const drive = await this.getDriveClient(workspaceId, googleAccountId);
      const folderId = await this.getOrCreateWorkspaceFolder(drive, workspaceId);

      const { fileName, mimeType, buffer, parentFolderId } = fileData;

      // Create readable stream from buffer
      const bufferStream = new Readable();
      bufferStream.push(buffer);
      bufferStream.push(null);

      const fileMetadata = {
        name: fileName,
        parents: [parentFolderId || folderId]
      };

      const media = {
        mimeType: mimeType,
        body: bufferStream
      };

      const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink'
      });

      const file = response.data;

      // Save to database
      const driveFile = await DriveFile.create({
        workspaceId,
        googleAccountId,
        driveFileId: file.id,
        fileName: file.name,
        fileType: path.extname(file.name).slice(1) || 'file',
        mimeType: file.mimeType,
        size: parseInt(file.size) || 0,
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
        parentFolderId: parentFolderId || folderId,
        createdAt: new Date(file.createdTime),
        lastModified: new Date(file.modifiedTime)
      });

      return {
        success: true,
        file: driveFile
      };
    } catch (error) {
      console.error('Error uploading file to Drive:', error);
      throw new Error('Failed to upload file to Google Drive');
    }
  }

  /**
   * Download file from Google Drive
   */
  async downloadFile(workspaceId, googleAccountId, driveFileId) {
    try {
      const drive = await this.getDriveClient(workspaceId, googleAccountId);

      // Get file metadata
      const metadata = await drive.files.get({
        fileId: driveFileId,
        fields: 'id, name, mimeType, size'
      });

      // Download file content
      const response = await drive.files.get(
        { fileId: driveFileId, alt: 'media' },
        { responseType: 'stream' }
      );

      return {
        success: true,
        stream: response.data,
        metadata: metadata.data
      };
    } catch (error) {
      console.error('Error downloading file from Drive:', error);
      throw new Error('Failed to download file from Google Drive');
    }
  }

  /**
   * Delete file from Google Drive
   */
  async deleteFile(workspaceId, googleAccountId, driveFileId) {
    try {
      const drive = await this.getDriveClient(workspaceId, googleAccountId);

      // Delete from Drive
      await drive.files.delete({
        fileId: driveFileId
      });

      // Mark as deleted in database
      await DriveFile.findOneAndUpdate(
        { workspaceId, driveFileId },
        { isDeleted: true, deletedAt: new Date() }
      );

      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('Error deleting file from Drive:', error);
      throw new Error('Failed to delete file from Google Drive');
    }
  }

  /**
   * Create folder in Google Drive
   */
  async createFolder(workspaceId, googleAccountId, folderName, parentFolderId = null) {
    try {
      const drive = await this.getDriveClient(workspaceId, googleAccountId);
      const workspaceFolderId = await this.getOrCreateWorkspaceFolder(drive, workspaceId);

      const folderMetadata = {
        name: folderName,
        mimeType: this.mimeTypes.folder,
        parents: [parentFolderId || workspaceFolderId]
      };

      const response = await drive.files.create({
        resource: folderMetadata,
        fields: 'id, name, mimeType, createdTime, modifiedTime, webViewLink'
      });

      const folder = response.data;

      // Save to database
      const driveFolder = await DriveFile.create({
        workspaceId,
        googleAccountId,
        driveFileId: folder.id,
        fileName: folder.name,
        fileType: 'folder',
        mimeType: folder.mimeType,
        size: 0,
        webViewLink: folder.webViewLink,
        parentFolderId: parentFolderId || workspaceFolderId,
        createdAt: new Date(folder.createdTime),
        lastModified: new Date(folder.modifiedTime)
      });

      return {
        success: true,
        folder: driveFolder
      };
    } catch (error) {
      console.error('Error creating folder in Drive:', error);
      throw new Error('Failed to create folder in Google Drive');
    }
  }

  /**
   * List files and folders
   */
  async listFiles(workspaceId, googleAccountId, options = {}) {
    try {
      const drive = await this.getDriveClient(workspaceId, googleAccountId);
      const { folderId, pageSize = 50, pageToken, searchQuery } = options;

      let q = 'trashed=false';

      if (folderId) {
        q += ` and '${folderId}' in parents`;
      } else {
        // List files in workspace folder
        const workspaceFolderId = await this.getOrCreateWorkspaceFolder(drive, workspaceId);
        q += ` and '${workspaceFolderId}' in parents`;
      }

      if (searchQuery) {
        q += ` and name contains '${searchQuery}'`;
      }

      const response = await drive.files.list({
        q,
        pageSize,
        pageToken,
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, iconLink, thumbnailLink)',
        orderBy: 'folder,name'
      });

      // Sync with database
      const files = response.data.files || [];
      for (const file of files) {
        await DriveFile.findOneAndUpdate(
          { workspaceId, driveFileId: file.id },
          {
            workspaceId,
            googleAccountId,
            driveFileId: file.id,
            fileName: file.name,
            fileType: file.mimeType === this.mimeTypes.folder ? 'folder' : path.extname(file.name).slice(1) || 'file',
            mimeType: file.mimeType,
            size: parseInt(file.size) || 0,
            webViewLink: file.webViewLink,
            webContentLink: file.webContentLink,
            iconLink: file.iconLink,
            thumbnailLink: file.thumbnailLink,
            lastModified: new Date(file.modifiedTime)
          },
          { upsert: true, new: true }
        );
      }

      return {
        success: true,
        files,
        nextPageToken: response.data.nextPageToken
      };
    } catch (error) {
      console.error('Error listing files from Drive:', error);
      throw new Error('Failed to list files from Google Drive');
    }
  }

  /**
   * Search files across Drive
   */
  async searchFiles(workspaceId, googleAccountId, searchQuery) {
    try {
      const drive = await this.getDriveClient(workspaceId, googleAccountId);

      const q = `fullText contains '${searchQuery}' and trashed=false`;

      const response = await drive.files.list({
        q,
        pageSize: 50,
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink)',
        orderBy: 'modifiedTime desc'
      });

      return {
        success: true,
        files: response.data.files || []
      };
    } catch (error) {
      console.error('Error searching files in Drive:', error);
      throw new Error('Failed to search files in Google Drive');
    }
  }

  /**
   * Share file and get shareable link
   */
  async shareFile(workspaceId, googleAccountId, driveFileId, options = {}) {
    try {
      const drive = await this.getDriveClient(workspaceId, googleAccountId);
      const { role = 'reader', type = 'anyone', emailAddress } = options;

      // Create permission
      const permission = {
        role,
        type
      };

      if (emailAddress && type === 'user') {
        permission.emailAddress = emailAddress;
      }

      await drive.permissions.create({
        fileId: driveFileId,
        resource: permission,
        sendNotificationEmail: !!emailAddress
      });

      // Get updated file metadata with share link
      const file = await drive.files.get({
        fileId: driveFileId,
        fields: 'id, name, webViewLink, webContentLink'
      });

      // Update database
      await DriveFile.findOneAndUpdate(
        { workspaceId, driveFileId },
        {
          isShared: true,
          sharedWith: emailAddress || 'anyone',
          sharedAt: new Date()
        }
      );

      return {
        success: true,
        shareLink: file.data.webViewLink,
        downloadLink: file.data.webContentLink
      };
    } catch (error) {
      console.error('Error sharing file in Drive:', error);
      throw new Error('Failed to share file in Google Drive');
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(workspaceId, googleAccountId, driveFileId) {
    try {
      const drive = await this.getDriveClient(workspaceId, googleAccountId);

      const response = await drive.files.get({
        fileId: driveFileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, owners, lastModifyingUser, webViewLink, webContentLink, iconLink, thumbnailLink, description'
      });

      return {
        success: true,
        metadata: response.data
      };
    } catch (error) {
      console.error('Error getting file metadata from Drive:', error);
      throw new Error('Failed to get file metadata from Google Drive');
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(workspaceId, googleAccountId, driveFileId, updates) {
    try {
      const drive = await this.getDriveClient(workspaceId, googleAccountId);

      const response = await drive.files.update({
        fileId: driveFileId,
        resource: updates,
        fields: 'id, name, description, modifiedTime'
      });

      // Update database
      if (updates.name) {
        await DriveFile.findOneAndUpdate(
          { workspaceId, driveFileId },
          {
            fileName: updates.name,
            lastModified: new Date(response.data.modifiedTime)
          }
        );
      }

      return {
        success: true,
        file: response.data
      };
    } catch (error) {
      console.error('Error updating file metadata in Drive:', error);
      throw new Error('Failed to update file metadata in Google Drive');
    }
  }

  /**
   * Move file to different folder
   */
  async moveFile(workspaceId, googleAccountId, driveFileId, newParentFolderId) {
    try {
      const drive = await this.getDriveClient(workspaceId, googleAccountId);

      // Get current parents
      const file = await drive.files.get({
        fileId: driveFileId,
        fields: 'parents'
      });

      const previousParents = file.data.parents.join(',');

      // Move file
      const response = await drive.files.update({
        fileId: driveFileId,
        addParents: newParentFolderId,
        removeParents: previousParents,
        fields: 'id, name, parents'
      });

      // Update database
      await DriveFile.findOneAndUpdate(
        { workspaceId, driveFileId },
        { parentFolderId: newParentFolderId }
      );

      return {
        success: true,
        file: response.data
      };
    } catch (error) {
      console.error('Error moving file in Drive:', error);
      throw new Error('Failed to move file in Google Drive');
    }
  }

  /**
   * Get storage quota information
   */
  async getStorageQuota(workspaceId, googleAccountId) {
    try {
      const drive = await this.getDriveClient(workspaceId, googleAccountId);

      const response = await drive.about.get({
        fields: 'storageQuota, user'
      });

      const quota = response.data.storageQuota;

      console.log('Raw Google Drive quota response:', quota);

      // Parse quota values safely - Google returns them as string numbers
      const parseQuotaValue = (value) => {
        if (!value) return 0;
        // Remove any non-digit characters and parse
        const numStr = String(value).replace(/[^\d]/g, '');
        return numStr ? Number(numStr) : 0;
      };

      const limit = parseQuotaValue(quota.limit);
      const usage = parseQuotaValue(quota.usage);
      const usageInDrive = parseQuotaValue(quota.usageInDrive);
      const usageInDriveTrash = parseQuotaValue(quota.usageInDriveTrash);

      console.log('Parsed quota values:', { limit, usage, usageInDrive, usageInDriveTrash });

      return {
        success: true,
        quota: {
          limit,
          usage,
          usageInDrive,
          usageInDriveTrash,
          available: limit - usage,
          percentUsed: limit > 0 ? ((usage / limit) * 100).toFixed(2) : 0
        },
        user: response.data.user
      };
    } catch (error) {
      console.error('Error getting storage quota from Drive:', error);
      throw new Error('Failed to get storage quota from Google Drive');
    }
  }

  /**
   * Get workspace files from database
   */
  async getWorkspaceFiles(workspaceId, options = {}) {
    try {
      const { page = 1, limit = 50, fileType, sortBy = '-lastModified' } = options;

      const query = {
        workspaceId,
        isDeleted: false
      };

      if (fileType && fileType !== 'all') {
        query.fileType = fileType;
      }

      const files = await DriveFile.find(query)
        .sort(sortBy)
        .limit(limit)
        .skip((page - 1) * limit);

      const total = await DriveFile.countDocuments(query);

      return {
        success: true,
        files,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting workspace files:', error);
      throw new Error('Failed to get workspace files');
    }
  }
}

export default new GoogleDriveService();