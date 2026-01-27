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
* File: auditLog.js
* Author: Mohitraj Jadeja
* Date Created: October 21, 2025
* Last Modified: October 21, 2025
*=================================================================
* Description:
* Audit log model for tracking sensitive actions and security events
* across the application for compliance and security monitoring.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  // Who performed the action
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  userEmail: {
    type: String,
    required: true
  },

  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      // Auth actions
      'login', 'logout', 'password_reset', 'password_change', 'account_created',
      
      // Workspace actions
      'workspace_created', 'workspace_deleted', 'workspace_updated',
      'member_added', 'member_removed', 'role_changed',
      
      // File actions
      'file_uploaded', 'file_downloaded', 'file_deleted', 'file_restored',
      'file_version_created', 'file_shared', 'file_unshared',
      
      // Chat actions
      'admin_message_sent', 'message_deleted', 'message_edited',
      'chat_exported', 'message_pinned', 'message_unpinned',
      
      // Task actions
      'task_created', 'task_deleted', 'task_assigned', 'task_completed',
      
      // Permission actions
      'permission_granted', 'permission_revoked', 'access_denied',
      
      // Security events
      'failed_login', 'suspicious_activity', 'data_export',
      'settings_changed', 'integration_added', 'integration_removed'
    ],
    index: true
  },

  // Action category for filtering
  category: {
    type: String,
    enum: ['auth', 'workspace', 'file', 'chat', 'task', 'permission', 'security'],
    required: true,
    index: true
  },

  // Severity level
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true
  },

  // Resource affected
  resourceType: {
    type: String,
    enum: ['user', 'workspace', 'task', 'file', 'chat', 'note', 'habit', 'system']
  },

  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },

  resourceName: String,

  // Workspace context
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    index: true
  },

  // Action details
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Changes made (for update actions)
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },

  // Request metadata
  ipAddress: {
    type: String,
    index: true
  },

  userAgent: String,

  location: {
    country: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  // Status
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success',
    index: true
  },

  errorMessage: String,

  // Compliance
  retentionDate: {
    type: Date,
    index: true
  },

  isArchived: {
    type: Boolean,
    default: false,
    index: true
  }

}, {
  timestamps: true
});

// Compound indexes for common queries
auditLogSchema.index({ workspace: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ category: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

// Set retention date on creation (default 90 days)
auditLogSchema.pre('save', function(next) {
  if (!this.retentionDate) {
    const retentionDays = this.severity === 'critical' ? 365 : 90;
    this.retentionDate = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);
  }
  next();
});

// Static method to create audit log entry
auditLogSchema.statics.log = async function(logData) {
  try {
    return await this.create(logData);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logs shouldn't break main functionality
    return null;
  }
};

// Static method to get logs with filters
auditLogSchema.statics.getLogs = async function(filters = {}, options = {}) {
  const {
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const query = { isArchived: false, ...filters };

  const logs = await this.find(query)
    .populate('user', 'name email avatar')
    .populate('workspace', 'name')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await this.countDocuments(query);

  return {
    logs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLogs: total,
      hasMore: page * limit < total
    }
  };
};

// Static method to get security alerts
auditLogSchema.statics.getSecurityAlerts = async function(workspaceId, hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return await this.find({
    workspace: workspaceId,
    severity: { $in: ['high', 'critical'] },
    createdAt: { $gte: since },
    isArchived: false
  })
  .populate('user', 'name email')
  .sort({ createdAt: -1 });
};

// Static method to archive old logs
auditLogSchema.statics.archiveOldLogs = async function() {
  const result = await this.updateMany(
    {
      retentionDate: { $lte: new Date() },
      isArchived: false
    },
    {
      $set: { isArchived: true }
    }
  );
  
  return result;
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
