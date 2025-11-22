/*=================================================================
* Project: AIVA-WEB
* File: gamificationController.js
* Author: AI Integration - Gamification Module
* Date Created: October 25, 2025
* Last Modified: October 25, 2025
*=================================================================
* Description:
* Controller for gamification endpoints: stats, achievements, rewards.
*=================================================================
* Copyright (c) 2025 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import GamificationService from '../services/gamificationService.js';
import { Achievement } from '../models/index.js';

// Get user gamification stats
export const getUserStats = async (req, res) => {
  try {
    const stats = await GamificationService.getUserStats(req.user._id);
    if (!stats) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(stats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all available achievements
export const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ isActive: true });
    res.json(achievements);
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's earned achievements
export const getUserAchievements = async (req, res) => {
  try {
    const user = await req.user.populate('gamification.achievements');
    res.json(user.gamification.achievements);
  } catch (error) {
    console.error('Error getting user achievements:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Award XP manually (for testing/admin)
export const awardXP = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount required' });
    }

    const result = await GamificationService.addXP(req.user._id, amount);

    // Check for new achievements
    const newAchievements = await GamificationService.checkAchievements(req.user._id);

    res.json({
      message: 'XP awarded successfully',
      newXP: result.xp,
      newLevel: result.level,
      newTier: result.tier,
      newAchievements
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Award coins manually
export const awardCoins = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount required' });
    }

    const newBalance = await GamificationService.addCoins(req.user._id, amount);
    res.json({
      message: 'Coins awarded successfully',
      newBalance
    });
  } catch (error) {
    console.error('Error awarding coins:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Start focus session (Invest Mode)
export const startFocusSession = async (req, res) => {
  try {
    // This would typically start a timer/session
    // For now, just return success
    res.json({
      message: 'Focus session started',
      sessionId: Date.now().toString(),
      startTime: new Date()
    });
  } catch (error) {
    console.error('Error starting focus session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// End focus session and award rewards
export const endFocusSession = async (req, res) => {
  try {
    const { duration } = req.body; // duration in minutes
    if (!duration || duration <= 0) {
      return res.status(400).json({ message: 'Valid duration required' });
    }

    const rewards = await GamificationService.awardFocusSessionXP(req.user._id, duration);

    // Check for new achievements
    const newAchievements = await GamificationService.checkAchievements(req.user._id);

    res.json({
      message: 'Focus session completed',
      rewards,
      newAchievements
    });
  } catch (error) {
    console.error('Error ending focus session:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit reflection and award rewards
export const submitReflection = async (req, res) => {
  try {
    const rewards = await GamificationService.awardReflectionXP(req.user._id);

    // Check for new achievements
    const newAchievements = await GamificationService.checkAchievements(req.user._id);

    res.json({
      message: 'Reflection submitted successfully',
      rewards,
      newAchievements
    });
  } catch (error) {
    console.error('Error submitting reflection:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get focus ROI data
export const getFocusROI = async (req, res) => {
  try {
    const roi = await GamificationService.calculateFocusROI(req.user._id);
    res.json(roi);
  } catch (error) {
    console.error('Error getting focus ROI:', error);
    res.status(500).json({ message: 'Server error' });
  }
};