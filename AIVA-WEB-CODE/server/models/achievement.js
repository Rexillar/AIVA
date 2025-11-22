/*=================================================================
* Project: AIVA-WEB
* File: achievement.js
* Author: AI Integration - Gamification Module
* Date Created: October 25, 2025
* Last Modified: October 25, 2025
*=================================================================
* Description:
* Achievement model schema defining achievement properties for gamification.
*=================================================================
* Copyright (c) 2025 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  category: {
    type: String,
    enum: ['task', 'habit', 'focus', 'collaboration', 'reflection', 'milestone'],
    required: true
  },
  xpReward: {
    type: Number,
    default: 0
  },
  coinReward: {
    type: Number,
    default: 0
  },
  criteria: {
    type: {
      type: String,
      enum: ['count', 'streak', 'time', 'level', 'completion'],
      required: true
    },
    target: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['tasks', 'habits', 'days', 'minutes', 'hours', 'level'],
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  }
}, {
  timestamps: true
});

const Achievement = mongoose.model('Achievement', achievementSchema);

export default Achievement;