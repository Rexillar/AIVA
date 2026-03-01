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

// Virtual for checking if invitation is expired
workspaceInvitationSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expiresAt;
});

// Virtual for time remaining
workspaceInvitationSchema.virtual('timeRemaining').get(function () {
  return Math.max(0, this.expiresAt - Date.now());
});

// Pre-save middleware
workspaceInvitationSchema.pre('save', function (next) {
  // Handle expired invitations
  if (this.isExpired) {
    this.status = 'expired';
  }

  next();
});

// Instance methods
workspaceInvitationSchema.methods.incrementClicks = async function () {
  this.clicks += 1;
  this.lastClicked = new Date();
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

const WorkspaceInvitation = mongoose.models.WorkspaceInvitation ||
  mongoose.model("WorkspaceInvitation", workspaceInvitationSchema);

export default WorkspaceInvitation; 