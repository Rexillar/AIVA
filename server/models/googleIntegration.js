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
import mongoose from 'mongoose';

const GoogleAccountSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true,
    trim: true
  },
  googleEmail: {
    type: String,
    required: true,
    trim: true
  },
  googleDisplayName: {
    type: String,
    trim: true
  },
  googleProfilePicture: {
    type: String
  },
  accountName: {
    type: String,
    trim: true
  },
  accountPhoto: {
    type: String
  },

  // OAuth credentials (will be encrypted)
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  tokenExpiry: {
    type: Date,
    required: true
  },

  // Permissions
  scopes: [{
    type: String,
    enum: ['calendar', 'tasks', 'meet']
  }],

  // Sync configuration
  syncSettings: {
    calendar: {
      enabled: {
        type: Boolean,
        default: true
      },
      selectedCalendars: [{
        id: String,
        name: String,
        colorId: String
      }],
      syncDirection: {
        type: String,
        enum: ['read-only', 'bidirectional'],
        default: 'read-only'
      },
      colorCode: {
        type: String,
        default: '#4285F4'
      }
    },
    tasks: {
      enabled: {
        type: Boolean,
        default: false
      },
      selectedLists: [{
        id: String,
        name: String
      }],
      syncDirection: {
        type: String,
        enum: ['read-only', 'bidirectional'],
        default: 'read-only'
      },
      showInAIVA: {
        type: Boolean,
        default: true
      }
    },
    meet: {
      enabled: {
        type: Boolean,
        default: true
      },
      autoDetect: {
        type: Boolean,
        default: true
      },
      createReminders: {
        type: Boolean,
        default: true
      },
      reminderMinutes: {
        type: Number,
        default: 15
      }
    },
    drive: {
      enabled: {
        type: Boolean,
        default: true
      },
      shareWithWorkspace: {
        type: Boolean,
        default: false
      },
      autoSync: {
        type: Boolean,
        default: false
      },
      workspaceFolderId: {
        type: String
      }
    }
  },

  // Status tracking
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'error'],
    default: 'active'
  },
  lastSync: {
    type: Date
  },
  syncErrors: [{
    timestamp: Date,
    error: String,
    context: String
  }],

  // Metadata
  connectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  connectedAt: {
    type: Date,
    default: Date.now
  },
  disconnectedAt: {
    type: Date
  }
});

const GoogleIntegrationSchema = new mongoose.Schema({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true
  },
  connectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Multiple accounts array
  accounts: [GoogleAccountSchema],

  // Workspace-level settings
  settings: {
    autoSync: {
      type: Boolean,
      default: true
    },
    syncIntervalMinutes: {
      type: Number,
      default: 15
    },
    conflictResolution: {
      type: String,
      enum: ['show-all', 'merge-duplicates', 'user-preference'],
      default: 'show-all'
    },
    notifyOnSyncErrors: {
      type: Boolean,
      default: true
    }
  },

  // Overall status
  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
GoogleIntegrationSchema.index({ workspaceId: 1, 'accounts.accountId': 1 });
GoogleIntegrationSchema.index({ workspaceId: 1, 'accounts.status': 1 });

// Methods
GoogleIntegrationSchema.methods.getAccountById = function (accountId) {
  return this.accounts.find(acc => acc.accountId === accountId);
};

GoogleIntegrationSchema.methods.removeAccount = function (accountId) {
  this.accounts = this.accounts.filter(acc => acc.accountId !== accountId);
  return this.save();
};

GoogleIntegrationSchema.methods.updateAccountStatus = function (accountId, status, error = null) {
  const account = this.getAccountById(accountId);
  if (account) {
    account.status = status;
    if (error) {
      account.syncErrors.push({
        timestamp: new Date(),
        error: error.message || error,
        context: 'status_update'
      });
    }
    return this.save();
  }
  return null;
};

GoogleIntegrationSchema.methods.updateLastSync = function (accountId) {
  const account = this.getAccountById(accountId);
  if (account) {
    account.lastSync = new Date();
    return this.save();
  }
  return null;
};

// Statics
GoogleIntegrationSchema.statics.findByWorkspace = function (workspaceId) {
  return this.findOne({ workspaceId, isActive: true });
};

GoogleIntegrationSchema.statics.getActiveAccounts = async function (workspaceId) {
  const integration = await this.findOne({ workspaceId, isActive: true });
  if (!integration) return [];
  return integration.accounts.filter(acc => acc.status === 'active');
};

const GoogleIntegration = mongoose.model('GoogleIntegration', GoogleIntegrationSchema);

export default GoogleIntegration;
