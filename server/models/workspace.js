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
import mongoose from 'mongoose';
import { encryptionPlugin } from '../utils/encryption.js';
const { Schema } = mongoose;

const workspaceSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    // Increased length to accommodate encrypted strings (salt:iv:tag:ciphertext)
    maxlength: [500, 'Name cannot exceed 500 characters']
  },
  description: {
    type: String,
    trim: true,
    // Increased length to accommodate encrypted strings
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  workingHours: {
    start: {
      type: String,
      default: '09:00'
    },
    end: {
      type: String,
      default: '17:00'
    }
  },
  workingDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  }],
  notifications: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['PrivateWorkspace', 'PublicWorkspace'],
    default: 'PrivateWorkspace'
  },
  visibility: {
    type: String,
    enum: ['private', 'public'],
    default: 'private'
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
      required: true,
      trim: true
    },
    permissions: {
      canEditWorkspace: { type: Boolean, default: false },
      canDeleteWorkspace: { type: Boolean, default: false },
      canInviteMembers: { type: Boolean, default: false },
      canRemoveMembers: { type: Boolean, default: false },
      canManageRoles: { type: Boolean, default: false },
      canMoveToTrash: { type: Boolean, default: false }
    },
    isActive: { type: Boolean, default: true }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  noteSequence: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });
workspaceSchema.index({ isDeleted: 1 });
workspaceSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // Auto-delete after 30 days

// Add custom validation method
workspaceSchema.methods.validateMembers = function () {
  const validRoles = ['owner', 'admin', 'member'];
  for (let i = 0; i < this.members.length; i++) {
    const member = this.members[i];
    if (!validRoles.includes(member.role)) {
      throw new Error(`Invalid role "${member.role}" for member at index ${i}. Must be one of: ${validRoles.join(', ')}`);
    }
  }
  return true;
};

// Middleware to handle member updates
workspaceSchema.pre('save', function (next) {
  try {
    // Ensure owner is always a member with owner role
    const ownerMemberIndex = this.members.findIndex(
      member => member.user && member.user.toString() === this.owner.toString()
    );

    if (ownerMemberIndex === -1) {
      // Add owner as member if not present
      this.members.push({
        user: this.owner,
        role: 'owner',
        permissions: {
          canEditWorkspace: true,
          canDeleteWorkspace: true,
          canInviteMembers: true,
          canRemoveMembers: true,
          canManageRoles: true,
          canMoveToTrash: true
        },
        isActive: true
      });
    } else {
      // Ensure existing owner member has correct role and permissions
      this.members[ownerMemberIndex].role = 'owner';
      this.members[ownerMemberIndex].permissions = {
        canEditWorkspace: true,
        canDeleteWorkspace: true,
        canInviteMembers: true,
        canRemoveMembers: true,
        canManageRoles: true,
        canMoveToTrash: true
      };
    }

    // Sanitize all member roles
    this.members.forEach(member => {
      if (member.role) {
        member.role = member.role.trim().toLowerCase();
        if (!['owner', 'admin', 'member'].includes(member.role)) {
          member.role = 'member';
        }
      } else {
        member.role = 'member';
      }
    });

    // Validate the document before saving
    const validationError = this.validateSync();
    if (validationError) {
      throw validationError;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for pending invitations
workspaceSchema.virtual('pendingInvitations', {
  ref: 'WorkspaceInvitation',
  localField: '_id',
  foreignField: 'workspace',
  match: { status: 'pending', expiresAt: { $gt: new Date() } }
});

// Add method to check if user has permission
workspaceSchema.methods.hasPermission = function (userId, permission) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (!member) return false;

  // Owner has all permissions
  if (member.role === 'owner') return true;

  // Admin has all permissions except those reserved for owner
  if (member.role === 'admin' && permission !== 'canTransferOwnership') return true;

  // All members have basic permissions regardless of active status
  if (permission === 'canViewTeam' || permission === 'canViewTasks' || permission === 'canViewNotes') return true;

  // Check specific permission for members
  return member.permissions[permission] || false;
};

// Add method to get member's role
workspaceSchema.methods.getMemberRole = function (userId) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

// Add method to check if user is a member
workspaceSchema.methods.isMember = function (userId) {
  return this.members.some(m => m.user.toString() === userId.toString());
};

// Add method to check if user is owner
workspaceSchema.methods.isOwner = function (userId) {
  return this.owner.toString() === userId.toString();
};

// Add method to get member
workspaceSchema.methods.getMember = function (userId) {
  return this.members.find(m => m.user.toString() === userId.toString());
};

// Add method to update member's role
workspaceSchema.methods.updateMemberRole = async function (userId, newRole, updatedBy) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (!member) throw new Error('Member not found');

  // Only owner can change roles to owner or admin
  const updater = this.members.find(m => m.user.toString() === updatedBy.toString());
  if (!updater || (updater.role !== 'owner' && (newRole === 'owner' || newRole === 'admin'))) {
    throw new Error('Insufficient permissions to update role');
  }

  member.role = newRole;

  // Set default permissions based on role
  const basePermissions = {
    canViewTeam: true,
    canViewTasks: true,
    canViewNotes: true,
    canManageTasks: true
  };

  if (newRole === 'owner') {
    member.permissions = {
      ...basePermissions,
      canInviteMembers: true,
      canRemoveMembers: true,
      canEditWorkspace: true,
      canManageRoles: true
    };
  } else if (newRole === 'admin') {
    member.permissions = {
      ...basePermissions,
      canInviteMembers: true,
      canRemoveMembers: true,
      canEditWorkspace: true,
      canManageRoles: false
    };
  } else {
    member.permissions = {
      ...basePermissions,
      canInviteMembers: false,
      canRemoveMembers: false,
      canEditWorkspace: false,
      canManageRoles: false
    };
  }

  return this.save();
};

// Apply encryption plugin for sensitive fields BEFORE creating model
workspaceSchema.plugin(encryptionPlugin, {
  encryptedFields: [
    'name',
    'description'
  ]
});

// Check if the model exists before creating it
const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', workspaceSchema);

export { Workspace }; 