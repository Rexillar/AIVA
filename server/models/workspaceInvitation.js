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

   ⟁  PURPOSE      : Define workspace and team data structures

   ⟁  WHY          : Organized multi-tenant architecture

   ⟁  WHAT         : MongoDB schema for workspaces and memberships

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : CRITICAL
   ⟁  DOCS : /docs/architecture/data-flow.md

   ⟁  USAGE RULES  : Validate schemas • Encrypt sensitive fields • Index properly

        "Workspaces defined. Teams structured. Collaboration enabled."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import mongoose from "mongoose";
import crypto from 'crypto';

const workspaceInvitationSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member"
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "expired", "revoked"],
      default: "pending"
    },
    token: {
      type: String,
      required: true
    },
    // Gamification elements
    invitationLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    },
    perks: [{
      type: String,
      enum: [
        "early_access",
        "custom_theme",
        "priority_support",
        "beta_features",
        "custom_emoji"
      ]
    }],
    achievements: [{
      name: String,
      unlockedAt: Date,
      icon: String
    }],
    streakCount: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date
    },
    // Time-sensitive elements
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000)
    },
    remindersSent: [{
      type: Date
    }],
    // Tracking
    clicks: {
      type: Number,
      default: 0
    },
    lastClicked: {
      type: Date
    },
    // Social elements
    referralCode: {
      type: String,
      // sparse: true // Removed to prevent duplicate index warning
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkspaceInvitation",
      sparse: true
    },
    referralCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
workspaceInvitationSchema.index({ workspace: 1, email: 1 }, { unique: true });
workspaceInvitationSchema.index({ token: 1 }, { unique: true });
workspaceInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
workspaceInvitationSchema.index({ referralCode: 1 }, { sparse: true });

// Virtual for checking if invitation is expired
workspaceInvitationSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expiresAt;
});

// Virtual for time remaining
workspaceInvitationSchema.virtual('timeRemaining').get(function () {
  return Math.max(0, this.expiresAt - Date.now());
});

// Virtual for invitation tier based on perks count
workspaceInvitationSchema.virtual('tier').get(function () {
  const perksCount = this.perks?.length || 0;
  if (perksCount >= 4) return 'diamond';
  if (perksCount >= 3) return 'gold';
  if (perksCount >= 2) return 'silver';
  return 'bronze';
});

// Pre-save middleware
workspaceInvitationSchema.pre('save', function (next) {
  // Handle expired invitations
  if (this.isExpired) {
    this.status = 'expired';
  }

  // Generate referral code if not exists
  if (!this.referralCode && this.status === 'accepted') {
    this.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  // Update streak count
  if (this.lastActive) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (this.lastActive < oneDayAgo) {
      this.streakCount = 0;
    }
  }

  next();
});

// Instance methods
workspaceInvitationSchema.methods.incrementClicks = async function () {
  this.clicks += 1;
  this.lastClicked = new Date();
  return this.save();
};

workspaceInvitationSchema.methods.addAchievement = async function (achievement) {
  if (!this.achievements.some(a => a.name === achievement.name)) {
    this.achievements.push({
      ...achievement,
      unlockedAt: new Date()
    });
    return this.save();
  }
  return this;
};

workspaceInvitationSchema.methods.updateLevel = async function () {
  const baseScore = this.referralCount * 10 + this.streakCount * 5;
  this.invitationLevel = Math.min(5, Math.floor(baseScore / 50) + 1);
  return this.save();
};

// Static methods
workspaceInvitationSchema.statics.findValidInvitation = async function (token) {
  return this.findOne({
    token,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  })
    .populate('workspace')
    .populate('invitedBy');
};

workspaceInvitationSchema.statics.getPendingInvitations = async function (email) {
  return this.find({
    email: email.toLowerCase(),
    status: 'pending',
    expiresAt: { $gt: new Date() }
  })
    .populate('workspace')
    .populate('invitedBy')
    .sort('-createdAt');
};

workspaceInvitationSchema.statics.getReferralLeaderboard = async function () {
  return this.aggregate([
    { $match: { status: 'accepted' } },
    {
      $group: {
        _id: '$invitedBy',
        totalReferrals: { $sum: '$referralCount' },
        successfulInvites: { $sum: 1 }
      }
    },
    { $sort: { totalReferrals: -1, successfulInvites: -1 } },
    { $limit: 10 }
  ]);
};

const WorkspaceInvitation = mongoose.models.WorkspaceInvitation ||
  mongoose.model("WorkspaceInvitation", workspaceInvitationSchema);

export default WorkspaceInvitation; 