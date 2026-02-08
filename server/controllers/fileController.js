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

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/controllers.md

   ⟁  USAGE RULES  : Validate inputs • Handle errors • Log activities

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import asyncHandler from 'express-async-handler';
import File from '../models/file.js';
import AuditLog from '../models/auditLog.js';
import { gcsFileService } from '../services/gcsFileService.js';
import { Workspace } from '../models/index.js';
import { emitToWorkspace } from '../config/socket.js';

// @desc    Upload file to GCS
// @route   POST /api/files/upload
// @access  Private (workspace security middleware applied)
export const uploadFile = asyncHandler(async (req, res) => {
  const { workspaceId, category, description, tags } = req.body;
  const uploadedFile = req.file; // From multer middleware

  if (!uploadedFile) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  // Workspace validation is done by middleware (req.workspace exists)
  if (!req.workspace) {
    res.status(403);
    throw new Error('Workspace access not validated');
  }

  try {
    // Upload to GCS
    const gcsResult = await gcsFileService.uploadFile(uploadedFile.buffer, {
      originalFilename: uploadedFile.originalname,
      workspaceId,
      category: category || 'other',
      contentType: uploadedFile.mimetype,
      uploadedBy: req.user._id
    });

    // Save metadata to database
    const fileDoc = await File.create({
      fileName: gcsResult.fileName,
      originalFileName: uploadedFile.originalname,
      fileType: uploadedFile.mimetype.split('/')[0],
      mimeType: uploadedFile.mimetype,
      size: gcsResult.size,
      gcsPath: gcsResult.gcsPath,
      gcsUrl: gcsResult.publicUrl,
      bucketName: gcsResult.bucketName,
      workspace: workspaceId,
      category: category || 'other',
      uploadedBy: req.user._id,
      description: description || '',
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });

    // Populate user data
    await fileDoc.populate('uploadedBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: fileDoc
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500);
    throw new Error(`File upload failed: ${error.message}`);
  }
});

// @desc    Get files for a workspace
// @route   GET /api/files/workspace/:workspaceId
// @access  Private (workspace security middleware applied)
export const getWorkspaceFiles = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { category, search, limit = 50 } = req.query;

  const query = {
    workspace: workspaceId,
    isDeleted: false
  };

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { fileName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const files = await File.find(query)
    .populate('uploadedBy', 'name email avatar')
    .sort({ uploadDate: -1 })
    .limit(parseInt(limit));

  res.json({
    success: true,
    count: files.length,
    data: files
  });
});

// @desc    Download file
// @route   GET /api/files/:id/download
// @access  Private (file access middleware applied)
export const downloadFile = asyncHandler(async (req, res) => {
  const fileDoc = req.file; // From middleware

  try {
    // Increment download count
    await fileDoc.incrementDownload();

    // Generate fresh signed URL
    const signedUrl = await gcsFileService.getSignedUrl(fileDoc.gcsPath);

    res.json({
      success: true,
      data: {
        url: signedUrl,
        fileName: fileDoc.fileName,
        size: fileDoc.size,
        mimeType: fileDoc.mimeType
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500);
    throw new Error(`File download failed: ${error.message}`);
  }
});

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private (file access middleware applied)
export const deleteFile = asyncHandler(async (req, res) => {
  const fileDoc = req.file; // From middleware
  const { permanent = false } = req.query;

  try {
    if (permanent === 'true') {
      // Permanent delete from GCS and database
      await gcsFileService.deleteFile(fileDoc.gcsPath, false);
      await fileDoc.remove();

      res.json({
        success: true,
        message: 'File permanently deleted'
      });
    } else {
      // Soft delete
      await fileDoc.softDelete(req.user._id);

      // Move to trash in GCS
      await gcsFileService.deleteFile(fileDoc.gcsPath, true);

      res.json({
        success: true,
        message: 'File moved to trash'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500);
    throw new Error(`File deletion failed: ${error.message}`);
  }
});

// @desc    Restore file from trash
// @route   POST /api/files/:id/restore
// @access  Private (file access middleware applied)
export const restoreFile = asyncHandler(async (req, res) => {
  const fileDoc = req.file; // From middleware

  if (!fileDoc.isDeleted) {
    res.status(400);
    throw new Error('File is not in trash');
  }

  try {
    // Restore in GCS
    const trashPath = fileDoc.gcsPath.replace(/^workspace\//, 'trash/');
    await gcsFileService.restoreFile(trashPath);

    // Restore in database
    await fileDoc.restore();

    res.json({
      success: true,
      message: 'File restored successfully',
      data: fileDoc
    });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500);
    throw new Error(`File restoration failed: ${error.message}`);
  }
});

// @desc    Get file details
// @route   GET /api/files/:id
// @access  Private (file access middleware applied)
export const getFileDetails = asyncHandler(async (req, res) => {
  const fileDoc = req.file; // From middleware

  // Generate fresh signed URL
  const signedUrl = await gcsFileService.getSignedUrl(fileDoc.gcsPath);

  res.json({
    success: true,
    data: {
      ...fileDoc.toObject(),
      signedUrl
    }
  });
});

// @desc    Update file metadata
// @route   PUT /api/files/:id
// @access  Private (file access middleware applied)
export const updateFileMetadata = asyncHandler(async (req, res) => {
  const fileDoc = req.file; // From middleware
  const { description, tags, category } = req.body;

  if (description !== undefined) fileDoc.description = description;
  if (tags) fileDoc.tags = tags.split(',').map(t => t.trim());
  if (category) fileDoc.category = category;

  await fileDoc.save();

  res.json({
    success: true,
    message: 'File metadata updated',
    data: fileDoc
  });
});

// @desc    Get trash files
// @route   GET /api/files/trash/:workspaceId
// @access  Private (workspace security middleware applied)
export const getTrashFiles = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const files = await File.find({
    workspace: workspaceId,
    isDeleted: true
  })
    .populate('uploadedBy', 'name email avatar')
    .populate('deletedBy', 'name email')
    .sort({ deletedAt: -1 });

  res.json({
    success: true,
    count: files.length,
    data: files
  });
});

// @desc    Create new file version
// @route   POST /api/files/:id/version
// @access  Private (file access middleware applied)
export const createFileVersion = asyncHandler(async (req, res) => {
  const fileDoc = req.file; // From middleware
  const uploadedFile = req.file; // New file from multer
  const { changeLog } = req.body;

  if (!uploadedFile) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  try {
    // Upload new version to GCS
    const gcsResult = await gcsFileService.uploadFile(uploadedFile.buffer, {
      originalFilename: uploadedFile.originalname,
      workspaceId: fileDoc.workspace,
      category: fileDoc.category,
      contentType: uploadedFile.mimetype,
      uploadedBy: req.user._id
    });

    // Create new version in database
    await fileDoc.createVersion({
      fileName: gcsResult.fileName,
      gcsPath: gcsResult.gcsPath,
      gcsUrl: gcsResult.publicUrl,
      size: gcsResult.size,
      mimeType: uploadedFile.mimetype
    }, req.user._id, changeLog || '');

    // Audit log
    await AuditLog.log({
      user: req.user._id,
      userEmail: req.user.email,
      action: 'file_version_created',
      category: 'file',
      severity: 'low',
      workspace: fileDoc.workspace,
      resourceType: 'file',
      resourceId: fileDoc._id,
      resourceName: fileDoc.fileName,
      details: {
        version: fileDoc.version,
        changeLog
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Emit to workspace
    emitToWorkspace(fileDoc.workspace, 'file:version_created', {
      fileId: fileDoc._id,
      fileName: fileDoc.fileName,
      version: fileDoc.version,
      updatedBy: req.user.name
    });

    res.status(201).json({
      success: true,
      message: 'New file version created',
      data: fileDoc
    });
  } catch (error) {
    console.error('Version creation error:', error);
    res.status(500);
    throw new Error(`Failed to create file version: ${error.message}`);
  }
});

// @desc    Get file version history
// @route   GET /api/files/:id/versions
// @access  Private (file access middleware applied)
export const getFileVersions = asyncHandler(async (req, res) => {
  const fileDoc = req.file; // From middleware

  res.json({
    success: true,
    currentVersion: fileDoc.version,
    versions: fileDoc.previousVersions.map(v => ({
      ...v.toObject(),
      isCurrent: false
    })),
    current: {
      version: fileDoc.version,
      fileName: fileDoc.fileName,
      gcsPath: fileDoc.gcsPath,
      size: fileDoc.size,
      uploadedBy: fileDoc.uploadedBy,
      uploadDate: fileDoc.uploadDate,
      isCurrent: true
    }
  });
});

// @desc    Revert to previous version
// @route   POST /api/files/:id/revert/:versionNumber
// @access  Private (file access middleware + admin check)
export const revertFileVersion = asyncHandler(async (req, res) => {
  const fileDoc = req.file; // From middleware
  const { versionNumber } = req.params;

  // Check if user is admin
  const workspace = await Workspace.findById(fileDoc.workspace);
  const member = workspace.members.find(m => m.user.toString() === req.user._id.toString());
  const isAdmin = member?.role === 'admin' || workspace.owner.toString() === req.user._id.toString();

  if (!isAdmin) {
    res.status(403);
    throw new Error('Only admins can revert file versions');
  }

  try {
    await fileDoc.revertToVersion(parseInt(versionNumber));

    // Audit log
    await AuditLog.log({
      user: req.user._id,
      userEmail: req.user.email,
      action: 'file_version_created',
      category: 'file',
      severity: 'medium',
      workspace: fileDoc.workspace,
      resourceType: 'file',
      resourceId: fileDoc._id,
      resourceName: fileDoc.fileName,
      details: {
        action: 'revert',
        fromVersion: fileDoc.version - 1,
        toVersion: versionNumber
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: `File reverted to version ${versionNumber}`,
      data: fileDoc
    });
  } catch (error) {
    console.error('Version revert error:', error);
    res.status(500);
    throw new Error(`Failed to revert file version: ${error.message}`);
  }
});

// @desc    Get signed URL for secure download
// @route   GET /api/files/:id/signed-url
// @access  Private (file access middleware applied)
export const getSignedUrl = asyncHandler(async (req, res) => {
  const fileDoc = req.file; // From middleware
  const { expiresIn = 3600 } = req.query; // Default 1 hour

  try {
    const signedUrl = await gcsFileService.getSignedUrl(fileDoc.gcsPath, {
      action: 'read',
      expires: Date.now() + parseInt(expiresIn) * 1000
    });

    // Audit log for sensitive files
    if (fileDoc.category === 'confidential') {
      await AuditLog.log({
        user: req.user._id,
        userEmail: req.user.email,
        action: 'file_downloaded',
        category: 'file',
        severity: 'medium',
        workspace: fileDoc.workspace,
        resourceType: 'file',
        resourceId: fileDoc._id,
        resourceName: fileDoc.fileName,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    res.json({
      success: true,
      data: {
        signedUrl,
        expiresAt: new Date(Date.now() + parseInt(expiresIn) * 1000),
        fileName: fileDoc.fileName,
        mimeType: fileDoc.mimeType
      }
    });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
});

// @desc    Share file with users
// @route   POST /api/files/:id/share
// @access  Private (file access middleware applied)
export const shareFile = asyncHandler(async (req, res) => {
  const fileDoc = req.file; // From middleware
  const { userIds, permission = 'view' } = req.body;

  if (!userIds || !Array.isArray(userIds)) {
    res.status(400);
    throw new Error('User IDs must be provided as an array');
  }

  // Add users to shared list
  userIds.forEach(userId => {
    const alreadyShared = fileDoc.sharedWith.find(
      s => s.user.toString() === userId.toString()
    );

    if (!alreadyShared) {
      fileDoc.sharedWith.push({
        user: userId,
        permissions: permission
      });
    }
  });

  await fileDoc.save();

  // Audit log
  await AuditLog.log({
    user: req.user._id,
    userEmail: req.user.email,
    action: 'file_shared',
    category: 'file',
    severity: 'low',
    workspace: fileDoc.workspace,
    resourceType: 'file',
    resourceId: fileDoc._id,
    resourceName: fileDoc.fileName,
    details: {
      sharedWith: userIds,
      permission
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: 'File shared successfully',
    data: fileDoc
  });
});

// @desc    Unshare file from users
// @route   DELETE /api/files/:id/share
// @access  Private (file access middleware applied)
export const unshareFile = asyncHandler(async (req, res) => {
  const fileDoc = req.file; // From middleware
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds)) {
    res.status(400);
    throw new Error('User IDs must be provided as an array');
  }

  // Remove users from shared list
  fileDoc.sharedWith = fileDoc.sharedWith.filter(
    s => !userIds.includes(s.user.toString())
  );

  await fileDoc.save();

  // Audit log
  await AuditLog.log({
    user: req.user._id,
    userEmail: req.user.email,
    action: 'file_unshared',
    category: 'file',
    severity: 'low',
    workspace: fileDoc.workspace,
    resourceType: 'file',
    resourceId: fileDoc._id,
    resourceName: fileDoc.fileName,
    details: {
      unsharedFrom: userIds
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: 'File unshared successfully',
    data: fileDoc
  });
});

export default {
  uploadFile,
  getWorkspaceFiles,
  downloadFile,
  deleteFile,
  restoreFile,
  getFileDetails,
  updateFileMetadata,
  getTrashFiles,
  createFileVersion,
  getFileVersions,
  revertFileVersion,
  getSignedUrl,
  shareFile,
  unshareFile
};
