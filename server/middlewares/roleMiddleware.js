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
   ⟁  DOMAIN       : MIDDLEWARE

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Validate tokens • Check permissions • Log requests

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import asyncHandler from 'express-async-handler';
import { Workspace } from '../models/workspace.js';

const VALID_ROLES = ['owner', 'admin', 'member'];
const workspaceCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getWorkspaceFromCache = async (workspaceId) => {
  const cached = workspaceCache.get(workspaceId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.workspace;
  }
  const workspace = await Workspace.findById(workspaceId);
  if (workspace) {
    workspaceCache.set(workspaceId, { workspace, timestamp: Date.now() });
  }
  return workspace;
};

// Helper function to check if user has required role
const checkUserRole = async (workspaceId, userId, requiredRole) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return false;

  const member = workspace.members.find(m =>
    m.user.toString() === userId.toString()
  );
  if (!member) return false;

  const roles = {
    owner: 3,
    admin: 2,
    member: 1
  };

  return roles[member.role] >= roles[requiredRole];
};

// Middleware to check if user has required role
export const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!VALID_ROLES.includes(requiredRole)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }

      const workspaceId = req.params.workspaceId || req.body.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({ message: 'Workspace ID is required' });
      }

      const workspace = await getWorkspaceFromCache(workspaceId);
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }

      const member = workspace.members.find(m =>
        m.user.toString() === req.user._id.toString()
      );

      if (!member) {
        return res.status(403).json({ message: 'Not a member of this workspace' });
      }

      const roles = {
        owner: 3,
        admin: 2,
        member: 1
      };

      if (roles[member.role] >= roles[requiredRole]) {
        req.userRole = member.role;
        req.workspace = workspace;
        next();
      } else {
        res.status(403).json({
          message: 'Insufficient role permissions',
          required: requiredRole,
          current: member.role
        });
      }
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({ message: 'Server error in role verification' });
    }
  };
};

// Middleware to check if user has specific permission
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.id || req.params.workspaceId || req.body.workspaceId;

      if (!workspaceId) {
        return res.status(400).json({
          status: false,
          message: 'Workspace ID is required'
        });
      }

      const workspace = await Workspace.findById(workspaceId)
        .populate('owner', 'name email avatar')
        .populate('members.user', 'name email avatar');

      if (!workspace) {
        return res.status(404).json({
          status: false,
          message: 'Workspace not found'
        });
      }

      // Check if user is owner
      const isOwner = workspace.owner._id.toString() === req.user._id.toString();

      // If user is owner, they have all permissions
      if (isOwner) {
        req.workspace = workspace;
        req.userRole = 'owner';
        return next();
      }

      const member = workspace.members.find(m =>
        m.user._id.toString() === req.user._id.toString()
      );

      if (!member) {
        return res.status(403).json({
          status: false,
          message: 'Not a member of this workspace'
        });
      }

      // Special handling for admin permissions
      if (member.role === 'admin') {
        // Admins can do everything except add other admins and manage owner permissions
        if (permission === 'canInviteMembers' ||
          permission === 'canRemoveMembers' ||
          permission === 'canEditWorkspace' ||
          permission === 'canMoveToTrash') {
          req.workspace = workspace;
          req.userRole = 'admin';
          return next();
        }
      }

      // Check specific permission
      if (member.permissions && member.permissions[permission]) {
        req.workspace = workspace;
        req.userRole = member.role;
        return next();
      }

      res.status(403).json({
        status: false,
        message: 'Insufficient permissions',
        required: permission,
        userRole: member.role
      });
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({
        status: false,
        message: 'Server error in permission verification'
      });
    }
  };
};

// Helper middleware to attach user role to request
export const attachUserRole = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    if (workspaceId) {
      const workspace = await getWorkspaceFromCache(workspaceId);
      if (workspace) {
        const role = workspace.getMemberRole(req.user._id);
        if (role) {
          req.userRole = role;
          req.workspace = workspace;
        }
      }
    }
    next();
  } catch (error) {
    console.error('Error attaching user role:', error);
    next();
  }
}; 