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
* File: canvas.js
* Author: Mohitraj Jadeja
* Date Created: October 25, 2025
* Last Modified: October 25, 2025
*=================================================================
* Description:
* Canvas model schema definition for storing canvas data.
*=================================================================
* Copyright (c) 2025 Mohitraj Jadeja. All rights reserved.
*=================================================================*/
import mongoose from 'mongoose';
const { Schema } = mongoose;

const canvasSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Canvas name is required'],
    trim: true,
    minlength: [1, 'Name must be at least 1 character long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  data: {
    type: Schema.Types.Mixed,
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
canvasSchema.index({ owner: 1, isDeleted: 1 });
canvasSchema.index({ workspace: 1, isDeleted: 1 });
canvasSchema.index({ createdAt: -1 });

// Virtual for checking if canvas is active
canvasSchema.virtual('isActive').get(function() {
  return !this.isDeleted;
});

// Pre-save middleware
canvasSchema.pre('save', function(next) {
  if (this.isModified('isDeleted') && this.isDeleted) {
    this.deletedAt = new Date();
  }
  next();
});

// Static method to find active canvases by owner
canvasSchema.statics.findActiveByOwner = function(ownerId) {
  return this.find({ owner: ownerId, isDeleted: false });
};

// Static method to find active canvases by workspace
canvasSchema.statics.findActiveByWorkspace = function(workspaceId) {
  return this.find({ workspace: workspaceId, isDeleted: false });
};

const Canvas = mongoose.model('Canvas', canvasSchema);

export default Canvas;