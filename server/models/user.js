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

   ⟁  PURPOSE      : Define user data structure and authentication

   ⟁  WHY          : Secure user data management

   ⟁  WHAT         : MongoDB schema for users with field encryption

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : AES-256-GCM
   ⟁  TRUST LEVEL  : CRITICAL
   ⟁  DOCS : /docs/architecture/data-flow.md

   ⟁  USAGE RULES  : Validate schemas • Encrypt sensitive fields • Index properly

        "User data protected. Privacy maintained. Trust established."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


/*=================================================================
* Project: AIVA-WEB
* File: user.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: January 16, 2026
*=================================================================
* Description:
* User model schema defining user properties, authentication methods,
* and relationships with other entities.
* Includes field-level encryption for sensitive user data.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { encryptionPlugin } from '../utils/encryption.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpiresAt: {
    type: Date
  },
  workspaces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace'
  }],
  lastActive: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    reminders: {
      taskDue: {
        enabled: { type: Boolean, default: true },
        advanceNotice: { type: Number, default: 24 } // hours before due date
      },
      dailyDigest: {
        enabled: { type: Boolean, default: true },
        time: { type: String, default: '09:00' } // 24-hour format
      },
      weeklyReport: {
        enabled: { type: Boolean, default: true },
        day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], default: 'monday' },
        time: { type: String, default: '09:00' } // 24-hour format
      }
    }
  },
  gamification: {
    xp: {
      type: Number,
      default: 0
    },
    coins: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    tier: {
      type: String,
      enum: ['Novice', 'Investor', 'Architect', 'Visionary'],
      default: 'Novice'
    },
    totalFocusTime: {
      type: Number,
      default: 0 // in minutes
    },
    lastReflectionDate: {
      type: Date
    },
    achievements: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    }],
    streakData: {
      currentStreak: {
        type: Number,
        default: 0
      },
      longestStreak: {
        type: Number,
        default: 0
      },
      lastActivityDate: {
        type: Date
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add virtual for active workspaces
userSchema.virtual('activeWorkspaces').get(function() {
  if (this.workspaces && this.workspaces.length > 0 && typeof this.workspaces[0] === 'object') {
    return this.workspaces.filter(workspace => workspace.isActive);
  }
  return this.workspaces || [];
});

const User = mongoose.model('User', userSchema);

// Apply encryption plugin for sensitive fields
userSchema.plugin(encryptionPlugin, {
  encryptedFields: [
    'name',
    'bio',
    'phone',
    'address',
    'preferences.notifications.email', 
    'preferences.notifications.push'
  ]
});

export default User;