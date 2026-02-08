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

   ⟁  PURPOSE      : Manage workspace operations and team collaboration

   ⟁  WHY          : Organized multi-user environments

   ⟁  WHAT         : Workspace CRUD and member management

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/controllers.md

   ⟁  USAGE RULES  : Validate inputs • Handle errors • Log activities

        "Workspaces organized. Teams collaborated. Productivity enhanced."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import asyncHandler from 'express-async-handler';
import { Workspace } from '../models/workspace.js';
import User from '../models/user.js';
import Task from '../models/task.js';
import WorkspaceInvitation from '../models/workspaceInvitation.js';
import {
  createNotification
} from '../services/notificationService.js';
import TaskModel from '../models/task.js';
import mongoose from 'mongoose';
import {
  emailService
} from '../services/emailService.js';
import crypto from 'crypto';

// @desc    Get user's workspaces
// @route   GET /api/workspaces
// @access  Private
export const getWorkspaces = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const workspaces = await Workspace.find({
    isDeleted: false,
    $or: [
      { owner: userId },
      { 'members.user': userId, 'members.isActive': true }
    ]
  }).populate('owner', 'name email')
    .populate('members.user', 'name email');

  res.json({
    status: true,
    data: workspaces
  });
});

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
export const createWorkspace = asyncHandler(async (req, res) => {
  const { name, description, visibility = 'private', invitations = [] } = req.body;
  const userId = req.user._id;

  try {
    // Validate email format for all invitations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = invitations.filter(inv => !emailRegex.test(inv.email));
    if (invalidEmails.length > 0) {
      res.status(400);
      throw new Error(`Invalid email format for: ${invalidEmails.map(inv => inv.email).join(', ')}`);
    }

    // Validate roles
    const validRoles = ['admin', 'member'];
    const invalidRoles = invitations.filter(inv => !validRoles.includes(inv.role));
    if (invalidRoles.length > 0) {
      res.status(400);
      throw new Error(`Invalid role for: ${invalidRoles.map(inv => inv.email).join(', ')}. Valid roles are: admin, member`);
    }

    // Create the workspace
    const workspace = await Workspace.create({
      name,
      description,
      owner: userId,
      visibility,
      type: visibility === 'private' ? 'PrivateWorkspace' : 'PublicWorkspace',
      members: [{ user: userId, role: 'owner', isActive: true }],
      permissions: {
        memberInvite: true,
        taskCreate: true,
        noteCreate: true
      },
      projectStatus: 'active'
    });

    // Process invitations
    const invitationResults = await Promise.all(
      invitations.map(async ({ email, role }) => {
        try {
          // Check if user already exists
          const existingUser = await User.findOne({ email });

          // Create invitation token
          const token = crypto.randomBytes(32).toString('hex');

          // Create invitation
          const invitation = await WorkspaceInvitation.create({
            workspace: workspace._id,
            email: email.toLowerCase(),
            role: role || 'member',
            invitedBy: userId,
            token,
            perks: ['early_access'], // Start with basic perk
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          });

          // Send invitation email
          await emailService.sendInvitationEmail({
            email,
            inviterName: req.user.name,
            workspaceId: workspace._id,
            workspaceName: workspace.name,
            invitationToken: token,
            isExistingUser: !!existingUser,
            tier: invitation.tier,
            perks: invitation.perks,
            achievements: invitation.achievements
          });

          return {
            email,
            status: existingUser ? 'invited_existing' : 'invited_new',
            userId: existingUser?._id,
            role: role || 'member'
          };
        } catch (error) {
          console.error('Error processing invitation:', error);
          return {
            email,
            status: 'failed',
            error: error.message
          };
        }
      })
    );

    // Add workspace to user's workspaces
    await User.findByIdAndUpdate(userId, {
      $addToSet: { workspaces: workspace._id }
    });

    const populatedWorkspace = await workspace.populate([
      { path: 'owner', select: 'name email' },
      { path: 'members.user', select: 'name email' }
    ]);

    res.status(201).json({
      status: true,
      data: {
        workspace: populatedWorkspace,
        invitationResults
      }
    });
  } catch (error) {
    console.error('Workspace creation error:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Failed to create workspace'
    });
  }
});

// @desc    Get workspace by ID
// @route   GET /api/workspaces/:id
// @access  Private
export const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id)
    .populate('owner', 'name email')
    .populate('members.user', 'name email');

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  res.json({
    status: true,
    data: workspace
  });
});

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private
export const updateWorkspace = asyncHandler(async (req, res) => {
  try {
    // Validate workspace ID
    if (!req.params.id) {
      res.status(400);
      throw new Error('Workspace ID is required');
    }

    // Find workspace and populate necessary fields
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }

    // Check if user is owner or admin
    const isOwner = workspace.owner._id.toString() === req.user._id.toString();
    const isAdmin = workspace.members.some(member =>
      member.user._id.toString() === req.user._id.toString() &&
      member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to update this workspace');
    }

    // Validate required fields
    if (!req.body.name?.trim()) {
      res.status(400);
      throw new Error('Workspace name is required');
    }

    // Only allow updating specific fields
    const allowedFields = ['name', 'description', 'workingHours', 'workingDays', 'notifications'];
    const updateData = {};

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // Update workspace with validated data
    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    ).populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!updatedWorkspace) {
      res.status(404);
      throw new Error('Workspace not found after update');
    }

    res.json({
      status: true,
      message: 'Workspace updated successfully',
      data: updatedWorkspace
    });
  } catch (error) {
    console.error('Error updating workspace:', error);
    res.status(error.status || 500).json({
      status: false,
      message: error.message || 'Failed to update workspace'
    });
  }
});

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private
export const deleteWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Only owner can delete workspace
  if (workspace.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this workspace');
  }

  await workspace.remove();

  res.json({
    status: true,
    message: 'Workspace deleted successfully'
  });
});

// @desc    Get workspace members
// @route   GET /api/workspaces/:id/members
// @access  Private
export const getWorkspaceMembers = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id)
    .populate('members.user', 'name email avatar');

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  res.json({
    status: true,
    data: workspace.members
  });
});

// @desc    Add member to workspace
// @route   POST /api/workspaces/:id/members
// @access  Private
export const addWorkspaceMember = asyncHandler(async (req, res) => {
  const { id: workspaceId } = req.params;
  const { email, role = 'member' } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  // Validate role
  const validRoles = ['admin', 'member'];
  if (!validRoles.includes(role)) {
    res.status(400);
    throw new Error('Invalid role. Valid roles are: admin, member');
  }

  const workspace = await Workspace.findById(workspaceId)
    .populate('owner', 'name email')
    .populate('members.user', 'name email');

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Check if user is owner or admin
  const isOwner = workspace.owner._id.toString() === req.user._id.toString();
  const requester = workspace.members.find(m => m.user._id.toString() === req.user._id.toString());
  const isAdmin = requester?.role === 'admin';

  // Only owners can add admins
  if (role === 'admin' && !isOwner) {
    res.status(403);
    throw new Error('Only workspace owners can add admin members');
  }

  // Check if user has permission to invite members
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('You do not have permission to invite members');
  }

  // Check if user is already a member
  const existingMember = workspace.members.find(m =>
    m.user.email === email || (m.user.toString && m.user.toString() === email)
  );
  if (existingMember) {
    res.status(400);
    throw new Error('User is already a member of this workspace');
  }

  // Set appropriate permissions based on role
  const permissions = {
    canViewTeam: true,
    canViewTasks: true,
    canViewNotes: true,
    canManageTasks: true
  };

  if (role === 'admin') {
    permissions.canEditWorkspace = true;
    permissions.canInviteMembers = true;
    permissions.canRemoveMembers = true;
    permissions.canManageRoles = true;
    permissions.canMoveToTrash = true;
  }

  // Add the new member
  workspace.members.push({
    user: email,
    role,
    permissions,
    isActive: true
  });

  await workspace.save();

  res.status(201).json({
    status: true,
    message: 'Member added successfully',
    data: {
      email,
      role,
      permissions
    }
  });
});

// @desc    Remove member from workspace
// @route   DELETE /api/workspaces/:id/members/:memberId
// @access  Private
export const removeWorkspaceMember = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Only owner can remove members
  if (workspace.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to remove members');
  }

  workspace.members = workspace.members.filter(
    member => member.user.toString() !== req.params.memberId
  );

  await workspace.save();

  res.json({
    status: true,
    message: 'Member removed successfully'
  });
});

// @desc    Update member status
// @route   PATCH /api/workspaces/:id/members/:memberId
// @access  Private (Owner and Admin)
export const updateMemberStatus = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Get the requesting user's member object
  const requester = workspace.members.find(
    member => member.user.toString() === req.user._id.toString()
  );

  // Get the target member object
  const targetMember = workspace.members.find(
    member => member.user.toString() === req.params.memberId
  );

  if (!targetMember) {
    res.status(404);
    throw new Error('Member not found');
  }

  // Check permissions
  const isOwner = workspace.owner.toString() === req.user._id.toString();
  const isAdmin = requester.role === 'admin';
  const targetIsOwner = workspace.owner.toString() === req.params.memberId;
  const targetIsAdmin = targetMember.role === 'admin';

  // Prevent modification of owner
  if (targetIsOwner) {
    res.status(403);
    throw new Error('Cannot modify workspace owner\'s status');
  }

  // Only owner can modify admin status
  if (targetIsAdmin && !isOwner) {
    res.status(403);
    throw new Error('Only workspace owner can modify admin status');
  }

  // Allow update if user is owner or admin (and not modifying an admin)
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to update member status');
  }

  // Update the member status
  if (typeof isActive === 'boolean') {
    targetMember.isActive = isActive;
  }

  // Only owner can update roles
  if (role && isOwner) {
    targetMember.role = role;
  }

  await workspace.save();

  res.json({
    status: true,
    data: targetMember
  });
});

// @desc    Get workspace statistics
// @route   GET /api/workspaces/:id/stats
// @access  Private
export const getWorkspaceStats = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  const stats = await Task.aggregate([
    { $match: { workspace: workspace._id } },
    {
      $group: {
        _id: '$stage',
        count: { $sum: 1 }
      }
    }
  ]);

  const formattedStats = {
    total: 0,
    todo: 0,
    in_progress: 0,
    review: 0,
    completed: 0
  };

  stats.forEach(stat => {
    formattedStats[stat._id] = stat.count;
    formattedStats.total += stat.count;
  });

  res.json({
    status: true,
    data: formattedStats
  });
});

// @desc    Get all user's private workspaces
// @route   GET /api/workspaces/private/all
// @access  Private
export const getAllPrivateWorkspaces = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log('Fetching private workspaces for user:', userId);

  const workspaces = await Workspace.find({
    type: 'PrivateWorkspace',
    isDeleted: false,
    $or: [
      { owner: userId },
      { 'members.user': userId, 'members.isActive': true }
    ]
  })
    .populate('owner', 'name email')
    .populate('members.user', 'name email');

  console.log('Found private workspaces:', workspaces.length);

  res.json({
    status: true,
    data: workspaces
  });
});

// @desc    Get user's private workspace
// @route   GET /api/workspaces/private
// @access  Private
export const getPrivateWorkspace = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    let workspace = await Workspace.findOne({
      owner: userId,
      visibility: 'private',
      type: 'PrivateWorkspace'
    }).populate('owner', 'name email')
      .populate('members.user', 'name email');

    // Lazy migration: Fix legacy encrypted names
    if (workspace && (workspace.name.includes(':') || workspace.name.length > 50)) {
      console.log('Detected encrypted workspace name, fixing...');
      workspace.name = `${req.user.name}'s Private Workspace`; // Reset to plain text
      // Check length again in case user name is long
      if (workspace.name.length > 50) {
        workspace.name = "My Private Workspace";
      }
      workspace.description = `Private workspace`;
      await workspace.save();
    }

    // If no private workspace exists, create one
    if (!workspace) {
      // Handle potential legacy encrypted names or long names
      let workspaceName = `${req.user.name}'s Private Workspace`;
      if (req.user.name.length > 30 || req.user.name.includes(':')) {
        workspaceName = 'My Private Workspace';
      }

      workspace = await Workspace.create({
        name: workspaceName,
        description: `Private workspace for ${req.user.email}`,
        owner: userId,
        visibility: 'private',
        type: 'PrivateWorkspace',
        members: [{ user: userId, role: 'admin', isActive: true }],
        permissions: {
          memberInvite: false,
          taskCreate: true,
          noteCreate: true
        }
      });

      // Add workspace to user's workspaces
      await User.findByIdAndUpdate(userId, {
        $addToSet: { workspaces: workspace._id }
      });

      workspace = await workspace.populate([
        { path: 'owner', select: 'name email' },
        { path: 'members.user', select: 'name email' }
      ]);
    }

    res.json({
      status: true,
      data: workspace
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error fetching private workspace'
    });
  }
});

// @desc    Get public workspaces
// @route   GET /api/workspaces/public
// @access  Private
export const getPublicWorkspaces = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Fetching public workspaces for user:', userId);

    // Only return public workspaces where the user is a member or owner
    const workspaces = await Workspace.find({
      visibility: 'public',
      type: 'PublicWorkspace',
      isDeleted: false,
      $or: [
        { owner: userId },
        { 'members.user': userId, 'members.isActive': true }
      ]
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    console.log('Found public workspaces:', workspaces.length);

    res.json({
      status: true,
      data: workspaces
    });
  } catch (error) {
    console.error('Error fetching public workspaces:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch public workspaces'
    });
  }
});

// @desc    Get all users for workspace member selection
// @route   GET /api/workspaces/users/all
// @access  Private
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}, 'name email avatar');

  res.json({
    status: true,
    data: users
  });
});

// @desc    Handle workspace invitation response
// @route   POST /api/workspaces/:id/invitations
// @access  Private (requires auth)
export const handleWorkspaceInvitation = asyncHandler(async (req, res) => {
  const { id: workspaceId } = req.params;
  const { action } = req.body; // 'accept' or 'reject'
  const userId = req.user._id;

  if (!['accept', 'reject'].includes(action)) {
    res.status(400);
    throw new Error('Invalid action. Must be either "accept" or "reject"');
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Find the pending invitation by email
  const invitationIndex = workspace.pendingInvitations.findIndex(
    inv => inv.email === req.user.email && inv.status === 'pending'
  );

  if (invitationIndex === -1) {
    res.status(404);
    throw new Error('No pending invitation found for your email address');
  }

  const invitation = workspace.pendingInvitations[invitationIndex];

  if (action === 'accept') {
    // Check if user is already a member
    const existingMemberIndex = workspace.members.findIndex(
      m => m.user.toString() === userId.toString()
    );

    if (existingMemberIndex !== -1) {
      // Update existing member's status
      workspace.members[existingMemberIndex].isActive = true;
      workspace.members[existingMemberIndex].role = invitation.role || workspace.members[existingMemberIndex].role;
    } else {
      // Add user as new member
      workspace.members.push({
        user: userId,
        role: invitation.role || 'member',
        isActive: true
      });
    }

    // Add workspace to user's workspaces
    await User.findByIdAndUpdate(userId, {
      $addToSet: { workspaces: workspace._id }
    });

    // Update invitation status
    workspace.pendingInvitations[invitationIndex].status = 'accepted';
    workspace.pendingInvitations[invitationIndex].respondedAt = new Date();
    workspace.pendingInvitations[invitationIndex].userId = userId;

    // Add to activity log
    workspace.activityLog.push(`${req.user.name} joined the workspace`);
  } else {
    // For reject action
    // Remove from members if present
    workspace.members = workspace.members.filter(
      m => m.user.toString() !== userId.toString()
    );

    // Update invitation status
    workspace.pendingInvitations[invitationIndex].status = 'rejected';
    workspace.pendingInvitations[invitationIndex].respondedAt = new Date();
    workspace.pendingInvitations[invitationIndex].userId = userId;

    // Add to activity log
    workspace.activityLog.push(`${req.user.name} declined to join the workspace`);
  }

  await workspace.save();

  // Send response with updated workspace data
  const populatedWorkspace = await workspace.populate([
    { path: 'owner', select: 'name email' },
    { path: 'members.user', select: 'name email' }
  ]);

  res.json({
    status: true,
    message: `Invitation ${action}ed successfully`,
    data: populatedWorkspace
  });
});

// @desc    Get workspace invitation details
// @route   GET /api/workspaces/invitation/:id
// @access  Public
export const getWorkspaceInvitationDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const workspace = await Workspace.findById(id)
    .populate('owner', 'name email')
    .select('name description owner visibility members.length pendingInvitations');

  if (!workspace) {
    res.status(404);
    throw new Error('Workspace not found');
  }

  // Check if the invitation exists and is still pending
  const hasPendingInvitations = workspace.pendingInvitations && workspace.pendingInvitations.length > 0;

  if (!hasPendingInvitations) {
    res.status(404);
    throw new Error('No pending invitations found for this workspace');
  }

  // Return limited workspace information for the invitation page
  res.json({
    status: true,
    data: {
      _id: workspace._id,
      name: workspace.name,
      description: workspace.description,
      owner: workspace.owner,
      visibility: workspace.visibility,
      memberCount: workspace.members?.length || 0
    }
  });
});

// Update member role
export const updateMemberRole = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;
    const { role } = req.body;

    if (!workspaceId || !userId || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if the target user is a member
    const targetMember = workspace.members.find(m => m.user.toString() === userId);
    if (!targetMember) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Update the role
    await workspace.updateMemberRole(userId, role, req.user._id);

    res.json({
      message: 'Member role updated successfully',
      member: {
        userId,
        role,
        permissions: targetMember.permissions
      }
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(error.message.includes('Insufficient permissions') ? 403 : 500)
      .json({ message: error.message || 'Error updating member role' });
  }
};

// Get member permissions
export const getMemberPermissions = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const member = workspace.members.find(m => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({
      role: member.role,
      permissions: member.permissions
    });
  } catch (error) {
    console.error('Error getting member permissions:', error);
    res.status(500).json({ message: 'Error getting member permissions' });
  }
};

// Update member permissions
export const updateMemberPermissions = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;
    const { permissions } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if the requester has permission to manage roles
    if (!workspace.hasPermission(req.user._id, 'canManageRoles')) {
      return res.status(403).json({ message: 'Insufficient permissions to manage roles' });
    }

    const member = workspace.members.find(m => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Update permissions while preserving role-based defaults
    member.permissions = {
      ...member.permissions,
      ...permissions
    };

    await workspace.save();

    res.json({
      message: 'Member permissions updated successfully',
      permissions: member.permissions
    });
  } catch (error) {
    console.error('Error updating member permissions:', error);
    res.status(500).json({ message: 'Error updating member permissions' });
  }
};