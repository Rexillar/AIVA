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

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : CRITICAL
   ⟁  DOCS : /docs/architecture/data-flow.md

   ⟁  USAGE RULES  : Validate schemas • Encrypt sensitive fields • Index properly

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


/*=================================================================
* Project: AIVA-WEB
* File: file.js
* Author: Mohitraj Jadeja
* Date Created: October 21, 2025
* Last Modified: October 21, 2025
*=================================================================
* Description:
* File model for storing file metadata with GCS integration
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  // File identification
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  
  originalFileName: {
    type: String,
    required: true,
    trim: true
  },

  // File properties
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    trim: true
  },

  mimeType: {
    type: String,
    required: true
  },

  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: 0
  },

  // GCS references
  gcsPath: {
    type: String,
    required: [true, 'GCS path is required'],
    unique: true
  },

  gcsUrl: {
    type: String,
    required: true
  },

  bucketName: {
    type: String,
    default: 'aiva_docs'
  },

  // GridFS references
  gridfsId: {
    type: String,
    sparse: true // Allow null values
  },

  // Google Drive references
  driveId: {
    type: String,
    sparse: true // Allow null values but ensure uniqueness when present
  },

  driveDownloadUrl: {
    type: String
  },

  // Workspace association
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: [true, 'Workspace is required'],
    index: true
  },

  // Category for organization
  category: {
    type: String,
    enum: ['document', 'image', 'video', 'audio', 'chat', 'ai_model', 'other'],
    default: 'other',
    index: true
  },

  // Upload metadata
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required'],
    index: true
  },

  uploadDate: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Optional description
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // Tags for searching
  tags: [{
    type: String,
    trim: true
  }],

  // Version control
  version: {
    type: Number,
    default: 1
  },

  previousVersions: [{
    versionNumber: Number,
    fileName: String,
    gcsPath: String,
    gcsUrl: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changeLog: String
  }],

  // Thumbnail support
  thumbnail: {
    gcsPath: String,
    gcsUrl: String,
    generated: {
      type: Boolean,
      default: false
    },
    generatedAt: Date
  },

  // Preview support
  preview: {
    available: {
      type: Boolean,
      default: false
    },
    gcsPath: String,
    gcsUrl: String
  },

  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },

  deletedAt: {
    type: Date
  },

  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Access control
  isPublic: {
    type: Boolean,
    default: false
  },

  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      type: String,
      enum: ['view', 'download', 'edit'],
      default: 'view'
    }
  }],

  // Metadata
  metadata: {
    width: Number,        // For images
    height: Number,       // For images
    duration: Number,     // For audio/video
    pageCount: Number,    // For PDFs
    encoding: String,     // For text files
    hash: String,         // File hash for deduplication
    exif: mongoose.Schema.Types.Mixed,  // EXIF data for images
    language: String,     // For text documents
    author: String,       // Document author
    createdDate: Date     // Original creation date
  },

  // Processing status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },

  processingError: String,

  // Download tracking
  downloadCount: {
    type: Number,
    default: 0
  },

  lastDownloaded: {
    type: Date
  },

  // AI/Chat integration
  relatedTo: {
    resourceType: {
      type: String,
      enum: ['task', 'note', 'chat', 'workspace', 'habit', 'ai_model']
    },
    resourceId: mongoose.Schema.Types.ObjectId
  }

}, {
  timestamps: true
});

// Indexes for performance
fileSchema.index({ workspace: 1, isDeleted: 1 });
fileSchema.index({ uploadedBy: 1, uploadDate: -1 });
fileSchema.index({ workspace: 1, category: 1 });
fileSchema.index({ workspace: 1, fileType: 1 });
fileSchema.index({ tags: 1 });
fileSchema.index({ 'relatedTo.resourceType': 1, 'relatedTo.resourceId': 1 });

// Virtual for file extension
fileSchema.virtual('extension').get(function() {
  return this.fileName.split('.').pop();
});

// Method to soft delete
fileSchema.methods.softDelete = function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

// Method to restore from trash
fileSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

// Method to increment download count
fileSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  this.lastDownloaded = new Date();
  return this.save();
};

// Method to create new version
fileSchema.methods.createVersion = function(newFileData, userId, changeLog = '') {
  // Save current version to history
  this.previousVersions.push({
    versionNumber: this.version,
    fileName: this.fileName,
    gcsPath: this.gcsPath,
    gcsUrl: this.gcsUrl,
    size: this.size,
    uploadedBy: userId,
    changeLog: changeLog
  });

  // Update to new version
  this.version += 1;
  this.fileName = newFileData.fileName || this.fileName;
  this.gcsPath = newFileData.gcsPath;
  this.gcsUrl = newFileData.gcsUrl;
  this.size = newFileData.size || this.size;
  this.mimeType = newFileData.mimeType || this.mimeType;
  
  return this.save();
};

// Method to revert to previous version
fileSchema.methods.revertToVersion = function(versionNumber) {
  const targetVersion = this.previousVersions.find(v => v.versionNumber === versionNumber);
  
  if (!targetVersion) {
    throw new Error('Version not found');
  }

  // Save current as a version
  this.previousVersions.push({
    versionNumber: this.version,
    fileName: this.fileName,
    gcsPath: this.gcsPath,
    gcsUrl: this.gcsUrl,
    size: this.size,
    uploadedBy: this.uploadedBy,
    changeLog: `Reverted from version ${this.version}`
  });

  // Revert to target
  this.fileName = targetVersion.fileName;
  this.gcsPath = targetVersion.gcsPath;
  this.gcsUrl = targetVersion.gcsUrl;
  this.size = targetVersion.size;
  this.version += 1;

  return this.save();
};

// Static method to get workspace files
fileSchema.statics.getWorkspaceFiles = function(workspaceId, options = {}) {
  const query = {
    workspace: workspaceId,
    isDeleted: false
  };

  if (options.category) {
    query.category = options.category;
  }

  if (options.uploadedBy) {
    query.uploadedBy = options.uploadedBy;
  }

  return this.find(query)
    .populate('uploadedBy', 'name email avatar')
    .sort({ uploadDate: -1 })
    .limit(options.limit || 100);
};

const File = mongoose.model('File', fileSchema);

export default File;
