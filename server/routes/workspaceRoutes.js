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
   ⟁  DOMAIN       : API ROUTES

   ⟁  PURPOSE      : Define API endpoints and route handlers

   ⟁  WHY          : Organized API structure and request routing

   ⟁  WHAT         : Express route definitions and middleware application

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/routes.md

   ⟁  USAGE RULES  : Define endpoints • Apply middleware • Handle routing

        "Routes defined. Endpoints organized. API structured."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import express from "express";
import { protect, checkWorkspaceAccess } from "../middlewares/authMiddleware.js";
import { requireRole, requirePermission } from "../middlewares/roleMiddleware.js";
import asyncHandler from "express-async-handler";
import rateLimit from 'express-rate-limit';
import upload from '../utils/upload.js';
import {
  workspaceCreationLimiter,
  fileUploadLimiter
} from '../middlewares/advancedRateLimitMiddleware.js';
import { validateFileSize } from '../middlewares/requestSizeMiddleware.js';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
  getWorkspaceStats,
  getWorkspaceMembers,
  updateMemberStatus,
  getPrivateWorkspace,
  getPublicWorkspaces,
  getAllUsers,
  updateMemberRole,
  getMemberPermissions,
  updateMemberPermissions,
  getAllPrivateWorkspaces
} from '../controllers/workspaceController.js';
import {
  sendInvitation,
  getPendingInvitations,
  handleInvitation,
  getInvitationDetails,
  getReferralLeaderboard
} from '../controllers/invitationController.js';
import { Workspace, WorkspaceInvitation } from "../models/index.js";
import { File } from "../models/index.js";
import {
  getTrashedWorkspaces,
  moveWorkspaceToTrash,
  restoreWorkspaceFromTrash,
  permanentlyDeleteWorkspace
} from '../controllers/workspaceTrashController.js';

// Rate limiters
const inviteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 invites per windowMs
  message: { message: 'Too many invites, please try again later' }
});

const createWorkspaceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 workspace creations per hour
  message: { message: 'Workspace creation limit reached, please try again later' }
});

const router = express.Router();

// Public routes
router.get('/invitation/:token', getInvitationDetails);

// Protect all other routes
router.use(protect);

// Get all users for member selection
router.get('/users/all', getAllUsers);

// Private and Public workspace routes
router.get('/private/all', getAllPrivateWorkspaces);
router.get('/private', getPrivateWorkspace);
router.get('/public', getPublicWorkspaces);

// Invitation and gamification routes
router.get('/invitations', getPendingInvitations);
router.get('/invitations/leaderboard', getReferralLeaderboard);
router.post('/:workspaceId/invitations', handleInvitation);
router.post('/:workspaceId/invite', inviteLimiter, requirePermission('canInviteMembers'), sendInvitation);

// Trash management routes (place these before parameterized routes)
router.get('/trash', protect, getTrashedWorkspaces);

// Workspace routes
router.route("/")
  .get(getWorkspaces)
  .post(workspaceCreationLimiter, createWorkspace);

router.route("/:id")
  .get(checkWorkspaceAccess, getWorkspaceById)
  .put(requirePermission('canEditWorkspace'), updateWorkspace)
  .delete(requireRole('owner'), deleteWorkspace);

// Member management routes
router.get("/:id/members", protect, async (req, res, next) => {
  try {
    const workspaceId = req.params.id;
    const workspace = await Workspace.findById(workspaceId)
      .populate('members.user', 'name email avatar')
      .populate('owner', 'name email avatar');

    if (!workspace) {
      return res.status(404).json({
        status: false,
        message: 'Workspace not found'
      });
    }

    // Check if user is a member or owner
    const isMember = workspace.members.some(
      m => m.user._id.toString() === req.user._id.toString()
    );
    const isOwner = workspace.owner._id.toString() === req.user._id.toString();

    if (!isOwner && !isMember) {
      return res.status(403).json({
        status: false,
        message: 'You do not have permission to view team members'
      });
    }

    // Get user's role
    const member = workspace.members.find(
      m => m.user._id.toString() === req.user._id.toString()
    );
    const userRole = member ? member.role : (isOwner ? 'owner' : null);

    // Process members
    const processedMembers = workspace.members.map(member => ({
      _id: member._id,
      user: {
        _id: member.user._id,
        name: member.user.name,
        email: member.user.email,
        avatar: member.user.avatar
      },
      role: member.role,
      isActive: member.isActive
    }));

    res.json({
      status: true,
      data: {
        members: processedMembers,
        owner: {
          _id: workspace.owner._id,
          name: workspace.owner.name,
          email: workspace.owner.email,
          avatar: workspace.owner.avatar
        },
        userRole
      }
    });
  } catch (error) {
    //.error('Error fetching workspace members:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to load team members'
    });
  }
});
router.post("/:id/members", inviteLimiter, requirePermission('canInviteMembers'), addWorkspaceMember);
router.delete("/:id/members/:memberId", requirePermission('canRemoveMembers'), removeWorkspaceMember);
router.patch("/:id/members/:memberId", requireRole('admin'), updateMemberStatus);

// Statistics route
router.get("/:id/stats", checkWorkspaceAccess, getWorkspaceStats);

// Get workspace activity
router.get('/:workspaceId/activity', checkWorkspaceAccess, asyncHandler(async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId)
      .select('activity members')
      .populate('members.user', 'name email')
      .lean();

    if (!workspace) {
      return res.status(404).json({
        status: false,
        message: 'Workspace not found'
      });
    }

    res.json({
      status: true,
      activity: workspace.activity || []
    });
  } catch (error) {
    //console.error('Error fetching workspace activity:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch workspace activity'
    });
  }
}));

// Role management routes
router.route('/:workspaceId/members/:userId/role')
  .put(requireRole('owner'), updateMemberRole);

router.route('/:workspaceId/members/:userId/permissions')
  .get(requireRole('admin'), getMemberPermissions)
  .put(requirePermission('canManageRoles'), updateMemberPermissions);

// Other trash management routes
router.put('/:id/trash', protect, requirePermission('canMoveToTrash'), moveWorkspaceToTrash);
router.put('/:id/restore', protect, restoreWorkspaceFromTrash);
router.delete('/:id/delete-permanent', protect, permanentlyDeleteWorkspace);

// Get workspace files
router.get('/:workspaceId/files', protect, checkWorkspaceAccess, asyncHandler(async (req, res) => {
  try {
    const { category, limit = 50, skip = 0 } = req.query;

    const query = { workspace: req.params.workspaceId };
    if (category && category !== 'all') {
      query.category = category;
    }

    const files = await File.find(query)
      .populate('uploadedBy', 'name email avatar')
      .sort({ uploadDate: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await File.countDocuments(query);

    res.json({
      success: true,
      data: {
        files,
        total,
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// File upload routes for workspace with rate limiting
router.post('/:workspaceId/uploads', protect, checkWorkspaceAccess, fileUploadLimiter, validateFileSize(50 * 1024 * 1024), upload.single('file'), asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to configured storage service
    const { storageService, STORAGE_TYPE } = await import('../services/storageService.js');
    const fileData = await storageService.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, {
      workspaceId: req.params.workspaceId
    });

    // Save file metadata to database
    const fileDocData = {
      fileName: fileData.filename,
      originalFileName: req.file.originalname,
      fileType: req.file.mimetype.split('/')[0] || 'other',
      mimeType: req.file.mimetype,
      size: req.file.size,
      workspace: req.params.workspaceId,
      uploadedBy: req.user._id,
      category: req.body.category || 'other'
    };

    // Add storage-specific fields
    if (STORAGE_TYPE === 'google-drive') {
      fileDocData.driveId = fileData.driveId;
      fileDocData.driveDownloadUrl = fileData.downloadUrl;
      fileDocData.gcsUrl = fileData.driveUrl;
    } else if (STORAGE_TYPE === 'gridfs') {
      fileDocData.gcsPath = fileData.path;
      fileDocData.gcsUrl = fileData.url;
      fileDocData.gridfsId = fileData.fileId; // Store the GridFS file ID for deletion
    }

    const fileDoc = new File(fileDocData);
    await fileDoc.save();

    res.json({
      success: true,
      data: {
        ...fileData,
        fileId: fileDoc._id.toString(),
        workspaceId: req.params.workspaceId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

// File upload routes for task-specific uploads
router.post('/:workspaceId/task/:taskId/uploads', protect, checkWorkspaceAccess, upload.single('file'), asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to MongoDB GridFS
    const { uploadFileToMongo } = await import('../services/mongoFileService.js');
    const fileData = await uploadFileToMongo(req.file.buffer, req.file.originalname, req.file.mimetype, {
      workspaceId: req.params.workspaceId,
      taskId: req.params.taskId,
      uploadedBy: req.user._id
    });

    res.json({
      success: true,
      data: {
        ...fileData,
        workspaceId: req.params.workspaceId,
        taskId: req.params.taskId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}));

export default router; 