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

// Achievement definitions
const ACHIEVEMENTS = {
  FIRST_INVITE: {
    name: 'First Steps',
    icon: '🌟',
    description: 'Sent your first workspace invitation'
  },
  POWER_INVITER: {
    name: 'Power Inviter',
    icon: '⚡',
    description: 'Successfully invited 5 members'
  },
  STREAK_MASTER: {
    name: 'Streak Master',
    icon: '🔥',
    description: 'Maintained a 7-day activity streak'
  },
  REFERRAL_KING: {
    name: 'Referral King',
    icon: '👑',
    description: 'Generated 10 successful referrals'
  }
};

// Perk unlock conditions
const PERK_UNLOCK_CONDITIONS = {
  early_access: { level: 2 },
  custom_theme: { level: 3 },
  priority_support: { level: 4 },
  beta_features: { level: 4 },
  custom_emoji: { level: 5 }
};

// @desc    Send workspace invitation
// @route   POST /api/workspaces/:workspaceId/invite
// @access  Private
export const sendInvitation = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { email, role, referralCode } = req.body;
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

    // Handle referral if provided
    let referredByInvitation = null;
    if (referralCode) {
      referredByInvitation = await WorkspaceInvitation.findOne({
        referralCode,
        status: 'accepted'
      });
      if (referredByInvitation) {
        referredByInvitation.referralCount += 1;
        await referredByInvitation.save();
      }
    }

    // Create new invitation with gamification elements
    const invitation = await WorkspaceInvitation.create({
      workspace: workspaceId,
      email: email.toLowerCase(),
      role,
      invitedBy: userId,
      token,
      referredBy: referredByInvitation?._id,
      perks: ['early_access'], // Start with basic perk
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Check for achievements
    const inviterStats = await WorkspaceInvitation.aggregate([
      { $match: { invitedBy: userId, status: 'accepted' } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    const successfulInvites = inviterStats[0]?.count || 0;

    // Award achievements
    if (successfulInvites === 0) {
      await invitation.addAchievement(ACHIEVEMENTS.FIRST_INVITE);
    }
    if (successfulInvites >= 5) {
      await invitation.addAchievement(ACHIEVEMENTS.POWER_INVITER);
    }

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    // Send invitation email with gamification elements
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

    // Update streak if user is checking invitations
    for (const invitation of invitations) {
      invitation.lastActive = new Date();
      invitation.streakCount += 1;
      await invitation.save();

      // Check for streak achievement
      if (invitation.streakCount >= 7) {
        await invitation.addAchievement(ACHIEVEMENTS.STREAK_MASTER);
      }
    }

    res.json({
      status: true,
      data: invitations.map(inv => ({
        ...inv.toJSON(),
        timeRemaining: inv.timeRemaining,
        tier: inv.tier
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
      invitation.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();

      // Check referral achievements
      if (invitation.referredBy) {
        const referrer = await WorkspaceInvitation.findById(invitation.referredBy);
        if (referrer && referrer.referralCount >= 10) {
          await referrer.addAchievement(ACHIEVEMENTS.REFERRAL_KING);
        }
      }
    } else {
      invitation.status = 'rejected';
    }

    // Update invitation level and perks
    await invitation.updateLevel();
    Object.entries(PERK_UNLOCK_CONDITIONS).forEach(([perk, condition]) => {
      if (invitation.invitationLevel >= condition.level && !invitation.perks.includes(perk)) {
        invitation.perks.push(perk);
      }
    });

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
        status: invitation.status,
        tier: invitation.tier,
        perks: invitation.perks,
        achievements: invitation.achievements,
        referralCode: invitation.referralCode
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
        tier: invitation.tier,
        perks: invitation.perks,
        achievements: invitation.achievements,
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

// @desc    Get referral leaderboard
// @route   GET /api/workspaces/invitations/leaderboard
// @access  Private
export const getReferralLeaderboard = asyncHandler(async (req, res) => {
  try {
    const leaderboard = await WorkspaceInvitation.getReferralLeaderboard();

    // Populate user details for the leaderboard
    const populatedLeaderboard = await User.populate(leaderboard, {
      path: '_id',
      select: 'name email'
    });

    res.json({
      status: true,
      data: populatedLeaderboard.map(entry => ({
        user: entry._id,
        totalReferrals: entry.totalReferrals,
        successfulInvites: entry.successfulInvites
      }))
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Failed to fetch leaderboard'
    });
  }
});