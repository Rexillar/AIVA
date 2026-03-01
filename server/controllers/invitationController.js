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
import { Workspace } from '../models/workspace.js';
import User from '../models/user.js';
import WorkspaceInvitation from '../models/workspaceInvitation.js';
import {
  emailService
} from '../services/emailService.js';
import crypto from 'crypto';


// @desc    Send workspace invitation
// @route   POST /api/workspaces/:workspaceId/invite
// @access  Private
export const sendInvitation = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { email, role } = req.body;
  const userId = req.user._id;

  if (!workspaceId || !email || !role) {
    res.status(400);
    throw new Error('Missing required fields');
  }

  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Invalid email format');
    }

    // Validate role
    const validRoles = ['owner', 'admin', 'member'];
    if (!validRoles.includes(role)) {
      res.status(400);
      throw new Error('Invalid role. Must be owner, admin, or member');
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }

    // Check for existing invitation
    const existingInvitation = await WorkspaceInvitation.findOne({
      workspace: workspaceId,
      email: email.toLowerCase(),
      status: 'pending'
    });

    if (existingInvitation) {
      res.status(400);
      throw new Error('User already has a pending invitation');
    }

    // Create invitation token
    const token = crypto.randomBytes(32).toString('hex');


    // Create new invitation
    const invitation = await WorkspaceInvitation.create({
      workspace: workspaceId,
      email: email.toLowerCase(),
      role,
      invitedBy: userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });

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

    res.status(201).json({
      status: true,
      message: 'Invitation sent successfully',
      data: {
        invitation: {
          _id: invitation._id,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
          tier: invitation.tier,
          perks: invitation.perks,
          achievements: invitation.achievements,
          expiresAt: invitation.expiresAt
        }
      }
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(error.status || 500).json({
      status: false,
      message: error.message || 'Failed to send invitation'
    });
  }
});

// @desc    Get pending invitations for current user
// @route   GET /api/workspaces/invitations
// @access  Private
export const getPendingInvitations = asyncHandler(async (req, res) => {
  try {
    const invitations = await WorkspaceInvitation.find({
      email: req.user.email.toLowerCase(),
      status: 'pending',
      expiresAt: { $gt: new Date() }
    })
      .populate('workspace', 'name description')
      .populate('invitedBy', 'name email')
      .sort('-createdAt');

    res.json({
      status: true,
      data: invitations.map(inv => ({
        ...inv.toJSON(),
        timeRemaining: inv.timeRemaining
      }))
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch invitations'
    });
  }
});

// @desc    Handle invitation response (accept/reject)
// @route   POST /api/workspaces/:workspaceId/invitations
// @access  Private
export const handleInvitation = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { action, invitationId } = req.body;

  if (!['accept', 'reject'].includes(action)) {
    res.status(400);
    throw new Error('Invalid action');
  }

  try {
    const invitation = await WorkspaceInvitation.findOne({
      _id: invitationId,
      workspace: workspaceId,
      email: req.user.email.toLowerCase(),
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('workspace');

    if (!invitation) {
      res.status(404);
      throw new Error('Invalid or expired invitation');
    }

    if (action === 'accept') {
      // Add user to workspace members if not already a member
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        res.status(404);
        throw new Error('Workspace not found');
      }

      const existingMember = workspace.members.find(m =>
        m.user.toString() === req.user._id.toString()
      );

      if (!existingMember) {
        workspace.members.push({
          user: req.user._id,
          role: invitation.role,
          isActive: true,
          addedBy: invitation.invitedBy,
          addedAt: new Date()
        });

        // Add workspace to user's workspaces
        await User.findByIdAndUpdate(req.user._id, {
          $addToSet: { workspaces: workspaceId }
        });

        await workspace.save();
      } else if (!existingMember.isActive) {
        // Reactivate existing member
        existingMember.isActive = true;
        existingMember.role = invitation.role;
        await workspace.save();
      }

      // Update invitation status
      invitation.status = 'accepted';
    } else {
      invitation.status = 'rejected';
    }

    await invitation.save();

    // Get updated workspace data
    const updatedWorkspace = await Workspace.findById(workspaceId)
      .populate('members.user', 'name email')
      .populate('owner', 'name email');

    res.json({
      status: true,
      message: `Invitation ${action}ed successfully`,
      data: {
        workspace: updatedWorkspace,
        members: updatedWorkspace.members,
        status: invitation.status
      }
    });
  } catch (error) {
    console.error(`Error ${action}ing invitation:`, error);
    res.status(500).json({
      status: false,
      message: error.message || `Failed to ${action} invitation`
    });
  }
});

// @desc    Get invitation details
// @route   GET /api/workspaces/invitation/:token
// @access  Public
export const getInvitationDetails = asyncHandler(async (req, res) => {
  const { token } = req.params;

  try {
    const invitation = await WorkspaceInvitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    })
      .populate('workspace', 'name description')
      .populate('invitedBy', 'name email');

    if (!invitation) {
      res.status(404);
      throw new Error('Invalid or expired invitation');
    }

    // Track invitation click
    await invitation.incrementClicks();

    res.json({
      status: true,
      data: {
        workspace: invitation.workspace,
        invitedBy: invitation.invitedBy,
        role: invitation.role,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
        timeRemaining: invitation.timeRemaining
      }
    });
  } catch (error) {
    console.error('Error fetching invitation details:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch invitation details'
    });
  }
});

