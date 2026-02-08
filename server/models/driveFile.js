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
   ⟁  DOMAIN       : DATA MODELS

   ⟁  PURPOSE      : Track synced Google Drive files

   ⟁  WHY          : Workspace Drive file management

   ⟁  WHAT         : Drive file metadata and sync status

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : CRITICAL
   ⟁  DOCS : /docs/architecture/data-models.md

   ⟁  USAGE RULES  : Validate schemas • Encrypt sensitive fields • Index properly

        "Files tracked. Metadata stored. Sync maintained."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


import mongoose from 'mongoose';

const driveFileSchema = new mongoose.Schema({
  // Workspace reference
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: [true, 'Workspace ID is required'],
    index: true
  },

  // Google account reference
  googleAccountId: {
    type: String,
    required: false,
    index: true
  },

  // Google Drive file information
  driveFileId: {
    type: String,
    required: [true, 'Drive file ID is required'],
    unique: true,
    index: true
  },

  // File details
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },

  fileType: {
    type: String,
    required: [true, 'File type is required'],
    enum: [
      'folder',
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'txt',
      'csv',
      'zip',
      'rar',
      'jpg',
      'jpeg',
      'png',
      'gif',
      'svg',
      'mp4',
      'mp3',
      'wav',
      'file',
      'other'
    ],
    default: 'file'
  },

  mimeType: {
    type: String,
    required: true
  },

  size: {
    type: Number,
    default: 0
  },

  // Drive links
  webViewLink: {
    type: String
  },

  webContentLink: {
    type: String
  },

  iconLink: {
    type: String
  },

  thumbnailLink: {
    type: String
  },

  // Folder structure
  parentFolderId: {
    type: String,
    index: true
  },

  // Sharing information
  isShared: {
    type: Boolean,
    default: false
  },

  sharedWith: {
    type: String // Email address or 'anyone'
  },

  sharedAt: {
    type: Date
  },

  // Sync status
  syncStatus: {
    type: String,
    enum: ['synced', 'pending', 'failed', 'conflict'],
    default: 'synced'
  },

  lastSyncedAt: {
    type: Date,
    default: Date.now
  },

  syncError: {
    type: String
  },

  // Deletion tracking
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },

  deletedAt: {
    type: Date
  },

  // Metadata
  description: {
    type: String
  },

  tags: [{
    type: String,
    trim: true
  }],

  // Timestamps
  lastModified: {
    type: Date,
    default: Date.now
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
driveFileSchema.index({ workspaceId: 1, isDeleted: 1 });
driveFileSchema.index({ workspaceId: 1, fileType: 1 });
driveFileSchema.index({ workspaceId: 1, parentFolderId: 1 });
driveFileSchema.index({ googleAccountId: 1, syncStatus: 1 });

// Instance methods
driveFileSchema.methods = {
  /**
   * Mark file as deleted
   */
  softDelete() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  },

  /**
   * Update sync status
   */
  updateSyncStatus(status, error = null) {
    this.syncStatus = status;
    this.lastSyncedAt = new Date();
    if (error) {
      this.syncError = error;
    }
    return this.save();
  },

  /**
   * Check if file is a folder
   */
  isFolder() {
    return this.fileType === 'folder';
  },

  /**
   * Get file size in human-readable format
   */
  getReadableSize() {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (this.size === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(this.size) / Math.log(1024)));
    return Math.round(this.size / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }
};

// Static methods
driveFileSchema.statics = {
  /**
   * Find files by workspace
   */
  async findByWorkspace(workspaceId, includeDeleted = false) {
    const query = { workspaceId };
    if (!includeDeleted) {
      query.isDeleted = false;
    }
    return this.find(query).sort({ createdAt: -1 });
  },

  /**
   * Find files by Google account
   */
  async findByGoogleAccount(googleAccountId) {
    return this.find({ googleAccountId, isDeleted: false }).sort({ createdAt: -1 });
  },

  /**
   * Find files by folder
   */
  async findByFolder(workspaceId, parentFolderId) {
    return this.find({
      workspaceId,
      parentFolderId,
      isDeleted: false
    }).sort({ fileType: -1, fileName: 1 }); // Folders first, then alphabetically
  },

  /**
   * Search files by name
   */
  async searchByName(workspaceId, searchQuery) {
    return this.find({
      workspaceId,
      fileName: { $regex: searchQuery, $options: 'i' },
      isDeleted: false
    }).sort({ lastModified: -1 });
  },

  /**
   * Get workspace storage stats
   */
  async getStorageStats(workspaceId) {
    const stats = await this.aggregate([
      {
        $match: {
          workspaceId: new mongoose.Types.ObjectId(workspaceId),
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$fileType',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      }
    ]);

    const totalFiles = stats.reduce((sum, stat) => sum + stat.count, 0);
    const totalSize = stats.reduce((sum, stat) => sum + stat.totalSize, 0);

    return {
      totalFiles,
      totalSize,
      byType: stats
    };
  },

  /**
   * Get files pending sync
   */
  async getPendingSync(googleAccountId) {
    return this.find({
      googleAccountId,
      syncStatus: { $in: ['pending', 'failed'] },
      isDeleted: false
    });
  },

  /**
   * Clean up deleted files older than specified days
   */
  async cleanupDeleted(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.deleteMany({
      isDeleted: true,
      deletedAt: { $lt: cutoffDate }
    });
  }
};

// Pre-save middleware
driveFileSchema.pre('save', function (next) {
  // Update lastModified on any change
  if (this.isModified()) {
    this.lastModified = new Date();
  }
  next();
});

const DriveFile = mongoose.model('DriveFile', driveFileSchema);

export default DriveFile;
