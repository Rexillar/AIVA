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
   ⟁  DOMAIN       : API CONTROLLERS

   ⟁  PURPOSE      : Handle Google Drive API requests

   ⟁  WHY          : Drive file management and operations

   ⟁  WHAT         : Drive endpoints for file CRUD operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : OAuth 2.0
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/controllers.md

   ⟁  USAGE RULES  : Validate inputs • Handle errors • Log activities

        "Files managed. Operations handled. Requests processed."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import googleDriveService from '../services/googleDriveService.js';
import DriveFile from '../models/driveFile.js';
import { Workspace } from '../models/workspace.js';
import multer from 'multer';

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

/**
 * @desc    Upload file to Google Drive
 * @route   POST /api/drive/upload/:workspaceId/:googleAccountId
 * @access  Private
 */
export const uploadFile = [
  upload.single('file'),
  async (req, res) => {
    try {
      const { workspaceId, googleAccountId } = req.params;
      const { parentFolderId } = req.body;
      const userId = req.user._id.toString();

      // Verify workspace access
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }

      if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileData = {
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        buffer: req.file.buffer,
        parentFolderId
      };

      const result = await googleDriveService.uploadFile(workspaceId, googleAccountId, fileData);

      res.json(result);
    } catch (error) {
      console.error('Error uploading file to Drive:', error);
      res.status(500).json({ error: error.message || 'Failed to upload file' });
    }
  }
];

/**
 * @desc    Download file from Google Drive
 * @route   GET /api/drive/download/:workspaceId/:googleAccountId/:driveFileId
 * @access  Private
 */
export const downloadFile = async (req, res) => {
  try {
    const { workspaceId, googleAccountId, driveFileId } = req.params;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await googleDriveService.downloadFile(workspaceId, googleAccountId, driveFileId);

    // Set appropriate headers
    res.setHeader('Content-Type', result.metadata.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.metadata.name}"`);

    // Pipe the stream to response
    result.stream.pipe(res);
  } catch (error) {
    console.error('Error downloading file from Drive:', error);
    res.status(500).json({ error: error.message || 'Failed to download file' });
  }
};

/**
 * @desc    Delete file from Google Drive
 * @route   DELETE /api/drive/files/:workspaceId/:googleAccountId/:driveFileId
 * @access  Private
 */
export const deleteFile = async (req, res) => {
  try {
    const { workspaceId, googleAccountId, driveFileId } = req.params;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await googleDriveService.deleteFile(workspaceId, googleAccountId, driveFileId);

    res.json(result);
  } catch (error) {
    console.error('Error deleting file from Drive:', error);
    res.status(500).json({ error: error.message || 'Failed to delete file' });
  }
};

/**
 * @desc    Create folder in Google Drive
 * @route   POST /api/drive/folders
 * @access  Private
 */
export const createFolder = async (req, res) => {
  try {
    const { workspaceId, googleAccountId } = req.params;
    const { folderName, parentFolderId } = req.body;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!folderName) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const result = await googleDriveService.createFolder(
      workspaceId,
      googleAccountId,
      folderName,
      parentFolderId
    );

    res.json(result);
  } catch (error) {
    console.error('Error creating folder in Drive:', error);
    res.status(500).json({ error: error.message || 'Failed to create folder' });
  }
};

/**
 * @desc    List files and folders from Google Drive
 * @route   GET /api/drive/files/:workspaceId/:googleAccountId
 * @access  Private
 */
export const listFiles = async (req, res) => {
  try {
    const { workspaceId, googleAccountId } = req.params;
    const { folderId, pageSize, pageToken, searchQuery } = req.query;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const options = {
      folderId,
      pageSize: pageSize ? parseInt(pageSize) : 50,
      pageToken,
      searchQuery
    };

    const result = await googleDriveService.listFiles(workspaceId, googleAccountId, options);

    res.json(result);
  } catch (error) {
    console.error('Error listing files from Drive:', error);
    res.status(500).json({ error: error.message || 'Failed to list files' });
  }
};

/**
 * @desc    Search files in Google Drive
 * @route   GET /api/drive/search/:workspaceId/:googleAccountId
 * @access  Private
 */
export const searchFiles = async (req, res) => {
  try {
    const { workspaceId, googleAccountId } = req.params;
    const { q } = req.query;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const result = await googleDriveService.searchFiles(workspaceId, googleAccountId, q);

    res.json(result);
  } catch (error) {
    console.error('Error searching files in Drive:', error);
    res.status(500).json({ error: error.message || 'Failed to search files' });
  }
};

/**
 * @desc    Share file and get shareable link
 * @route   POST /api/drive/share
 * @access  Private
 */
export const shareFile = async (req, res) => {
  try {
    const { workspaceId, googleAccountId, driveFileId, role, type, emailAddress } = req.body;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const options = {
      role: role || 'reader',
      type: type || 'anyone',
      emailAddress
    };

    const result = await googleDriveService.shareFile(
      workspaceId,
      googleAccountId,
      driveFileId,
      options
    );

    res.json(result);
  } catch (error) {
    console.error('Error sharing file in Drive:', error);
    res.status(500).json({ error: error.message || 'Failed to share file' });
  }
};

/**
 * @desc    Get file metadata
 * @route   GET /api/drive/metadata/:workspaceId/:googleAccountId/:driveFileId
 * @access  Private
 */
export const getFileMetadata = async (req, res) => {
  try {
    const { workspaceId, googleAccountId, driveFileId } = req.params;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await googleDriveService.getFileMetadata(
      workspaceId,
      googleAccountId,
      driveFileId
    );

    res.json(result);
  } catch (error) {
    console.error('Error getting file metadata from Drive:', error);
    res.status(500).json({ error: error.message || 'Failed to get file metadata' });
  }
};

/**
 * @desc    Update file metadata
 * @route   PATCH /api/drive/metadata/:workspaceId/:googleAccountId/:driveFileId
 * @access  Private
 */
export const updateFileMetadata = async (req, res) => {
  try {
    const { workspaceId, googleAccountId, driveFileId } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;

    const result = await googleDriveService.updateFileMetadata(
      workspaceId,
      googleAccountId,
      driveFileId,
      updates
    );

    res.json(result);
  } catch (error) {
    console.error('Error updating file metadata in Drive:', error);
    res.status(500).json({ error: error.message || 'Failed to update file metadata' });
  }
};

/**
 * @desc    Move file to different folder
 * @route   POST /api/drive/move
 * @access  Private
 */
export const moveFile = async (req, res) => {
  try {
    const { workspaceId, googleAccountId, driveFileId, newParentFolderId } = req.body;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!newParentFolderId) {
      return res.status(400).json({ error: 'New parent folder ID is required' });
    }

    const result = await googleDriveService.moveFile(
      workspaceId,
      googleAccountId,
      driveFileId,
      newParentFolderId
    );

    res.json(result);
  } catch (error) {
    console.error('Error moving file in Drive:', error);
    res.status(500).json({ error: error.message || 'Failed to move file' });
  }
};

/**
 * @desc    Get storage quota information
 * @route   GET /api/drive/quota/:workspaceId/:googleAccountId
 * @access  Private
 */
export const getStorageQuota = async (req, res) => {
  try {
    const { workspaceId, googleAccountId } = req.params;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await googleDriveService.getStorageQuota(workspaceId, googleAccountId);

    res.json(result);
  } catch (error) {
    console.error('Error getting storage quota from Drive:', error);
    res.status(500).json({ error: error.message || 'Failed to get storage quota' });
  }
};

/**
 * @desc    Get workspace files from database
 * @route   GET /api/drive/workspace-files/:workspaceId
 * @access  Private
 */
export const getWorkspaceFiles = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { page, limit, fileType, sortBy } = req.query;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const options = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      fileType,
      sortBy: sortBy || '-lastModified'
    };

    const result = await googleDriveService.getWorkspaceFiles(workspaceId, options);

    res.json(result);
  } catch (error) {
    console.error('Error getting workspace files:', error);
    res.status(500).json({ error: error.message || 'Failed to get workspace files' });
  }
};

/**
 * @desc    Get storage statistics for workspace
 * @route   GET /api/drive/stats/:workspaceId
 * @access  Private
 */
export const getStorageStats = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await DriveFile.getStorageStats(workspaceId);

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting storage stats:', error);
    res.status(500).json({ error: error.message || 'Failed to get storage statistics' });
  }
};
