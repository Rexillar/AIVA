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
   ⟁  DOMAIN       : BUSINESS LOGIC

   ⟁  PURPOSE      : Implement complex functionality with object-oriented design

   ⟁  WHY          : Organized code structure and reusability

   ⟁  WHAT         : Class-based implementation with methods and state

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Classes designed. Methods implemented. Functionality delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { User, Achievement } from '../models/index.js';

class GamificationService {
  // XP required for each level (cumulative)
  static LEVEL_THRESHOLDS = {
    1: 0,
    2: 100,
    3: 250,
    4: 500,
    5: 1000,
    6: 1750,
    7: 2750,
    8: 4000,
    9: 5500,
    10: 7500,
    // Add more as needed
  };

  // Tier thresholds based on level
  static TIER_THRESHOLDS = {
    'Novice': 1,
    'Investor': 5,
    'Architect': 10,
    'Visionary': 15
  };

  // Award XP for completing a task
  static async awardTaskCompletionXP(userId, taskDifficulty = 'medium') {
    const xpAmounts = {
      'easy': 10,
      'medium': 25,
      'hard': 50
    };

    const xp = xpAmounts[taskDifficulty] || 25;
    const coins = Math.floor(xp / 5); // 1 coin per 5 XP

    await this.addXP(userId, xp);
    await this.addCoins(userId, coins);

    return { xp, coins };
  }

  // Award XP for habit completion
  static async awardHabitCompletionXP(userId, streakMultiplier = 1) {
    const baseXP = 15;
    const xp = baseXP * streakMultiplier;
    const coins = Math.floor(xp / 5);

    await this.addXP(userId, xp);
    await this.addCoins(userId, coins);

    return { xp, coins };
  }

  // Award XP for focus session
  static async awardFocusSessionXP(userId, durationMinutes) {
    const xpPerMinute = 2; // 2 XP per minute of focused work
    const xp = durationMinutes * xpPerMinute;
    const coins = Math.floor(xp / 10); // 1 coin per 10 XP for focus

    await this.addXP(userId, xp);
    await this.addCoins(userId, coins);
    await this.addFocusTime(userId, durationMinutes);

    return { xp, coins };
  }

  // Award XP for reflection
  static async awardReflectionXP(userId) {
    const xp = 20;
    const coins = 4;

    await this.addXP(userId, xp);
    await this.addCoins(userId, coins);

    // Update last reflection date
    await User.findByIdAndUpdate(userId, {
      'gamification.lastReflectionDate': new Date()
    });

    return { xp, coins };
  }

  // Add XP and check for level up
  static async addXP(userId, amount) {
    const user = await User.findById(userId);
    if (!user) return;

    user.gamification.xp += amount;

    // Check for level up
    const newLevel = this.calculateLevel(user.gamification.xp);
    if (newLevel > user.gamification.level) {
      user.gamification.level = newLevel;
      // Award level up bonus
      user.gamification.coins += newLevel * 10; // 10 coins per level
    }

    // Check for tier promotion
    const newTier = this.calculateTier(newLevel);
    if (newTier !== user.gamification.tier) {
      user.gamification.tier = newTier;
      // Award tier promotion bonus
      user.gamification.coins += 50;
    }

    await user.save();
    return user.gamification;
  }

  // Add coins
  static async addCoins(userId, amount) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { 'gamification.coins': amount } },
      { new: true }
    );
    return user.gamification.coins;
  }

  // Add focus time
  static async addFocusTime(userId, minutes) {
    await User.findByIdAndUpdate(
      userId,
      { $inc: { 'gamification.totalFocusTime': minutes } }
    );
  }

  // Calculate level based on XP
  static calculateLevel(xp) {
    let level = 1;
    for (const [lvl, threshold] of Object.entries(this.LEVEL_THRESHOLDS)) {
      if (xp >= threshold) {
        level = parseInt(lvl);
      } else {
        break;
      }
    }
    return level;
  }

  // Calculate tier based on level
  static calculateTier(level) {
    if (level >= this.TIER_THRESHOLDS.Visionary) return 'Visionary';
    if (level >= this.TIER_THRESHOLDS.Architect) return 'Architect';
    if (level >= this.TIER_THRESHOLDS.Investor) return 'Investor';
    return 'Novice';
  }

  // Check and award achievements
  static async checkAchievements(userId) {
    const user = await User.findById(userId).populate('gamification.achievements');
    if (!user) return;

    const achievements = await Achievement.find({ isActive: true });
    const newAchievements = [];

    for (const achievement of achievements) {
      // Skip if already earned
      if (user.gamification.achievements.some(a => a._id.equals(achievement._id))) {
        continue;
      }

      let earned = false;

      switch (achievement.criteria.type) {
        case 'count':
          if (achievement.category === 'task') {
            // Would need to count completed tasks - implement based on task model
            earned = false; // Placeholder
          }
          break;
        case 'streak':
          if (achievement.category === 'habit' && user.gamification.streakData.currentStreak >= achievement.criteria.target) {
            earned = true;
          }
          break;
        case 'time':
          if (achievement.category === 'focus' && user.gamification.totalFocusTime >= achievement.criteria.target) {
            earned = true;
          }
          break;
        case 'level':
          if (user.gamification.level >= achievement.criteria.target) {
            earned = true;
          }
          break;
      }

      if (earned) {
        user.gamification.achievements.push(achievement._id);
        await this.addXP(userId, achievement.xpReward);
        await this.addCoins(userId, achievement.coinReward);
        newAchievements.push(achievement);
      }
    }

    await user.save();
    return newAchievements;
  }

  // Get user gamification stats
  static async getUserStats(userId) {
    const user = await User.findById(userId).select('gamification');
    if (!user) return null;

    const currentLevelXP = this.LEVEL_THRESHOLDS[user.gamification.level] || 0;
    const nextLevelXP = this.LEVEL_THRESHOLDS[user.gamification.level + 1] || (currentLevelXP + 1000);
    const xpProgress = user.gamification.xp - currentLevelXP;
    const xpToNext = nextLevelXP - currentLevelXP;

    return {
      ...user.gamification.toObject(),
      xpProgress,
      xpToNext,
      progressPercent: xpToNext > 0 ? (xpProgress / xpToNext) * 100 : 100
    };
  }

  // Calculate focus ROI (example: tasks completed per focus hour)
  static async calculateFocusROI(userId) {
    // This would require tracking tasks completed during focus sessions
    // Placeholder implementation
    return {
      tasksPerHour: 2.5,
      xpPerHour: 120,
      efficiency: 85 // percentage
    };
  }
}

export default GamificationService;