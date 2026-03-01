/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  E X E C U T I O N   I N T E L L I G E N C E  ──◈──

   ◉  Proactive • Predictive • Orchestration-First
   ◉  Behavior Analytics • Drift Detection • Burnout Signals

   ⟁  SYSTEM LAYER : INTELLIGENCE ENGINE
   ⟁  DOMAIN       : EXECUTION ANALYTICS

   ⟁  PURPOSE      : Transform reactive CRUD into proactive execution intelligence
   ⟁  WHY          : Future-of-Work systems optimize behavior, not just execute commands
   ⟁  WHAT         : Drift detection, focus windows, burnout signals, workload prediction

   ⟁  TECH STACK   : Node.js • MongoDB Aggregation
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS         : /docs/intelligence/execution-engine.md

   ⟁  USAGE RULES  : All analytics are deterministic • No AI calls • Pure data analysis

        "Behavior analyzed. Patterns detected. Execution optimized."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import Task from '../models/task.js';
import Habit from '../models/habit.js';
import { FieldEncryption } from '../utils/encryption.js';

// ═══════════════════════════════════════════════════════════════════
//  SECTION A: EXECUTION DRIFT DETECTION
//  Detects stagnation, postponing, overloading, and inactivity
// ═══════════════════════════════════════════════════════════════════

/**
 * Detect tasks that have drifted — created but untouched for too long
 */
const detectStaleTasks = async (userId, workspaceId, thresholdDays = 5) => {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - thresholdDays);

  const staleTasks = await Task.find({
    workspace: workspaceId,
    $or: [{ creator: userId }, { assignees: userId }],
    isDeleted: false,
    isTrash: false,
    stage: { $in: ['todo', 'in_progress'] },
    createdAt: { $lt: threshold },
    updatedAt: { $lt: threshold }
  }).select('title stage priority dueDate createdAt updatedAt').lean();

  return staleTasks.map(t => ({
    ...t,
    title: FieldEncryption.decrypt(t.title || ''),
    staleDays: Math.floor((Date.now() - new Date(t.updatedAt).getTime()) / (1000 * 60 * 60 * 24)),
    risk: Math.floor((Date.now() - new Date(t.updatedAt).getTime()) / (1000 * 60 * 60 * 24)) > 10 ? 'high' : 'medium'
  }));
};

/**
 * Detect overloaded days — too many tasks due on the same day
 */
const detectOverloadedDays = async (userId, workspaceId, lookAheadDays = 7) => {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + lookAheadDays);

  const upcomingTasks = await Task.find({
    workspace: workspaceId,
    $or: [{ creator: userId }, { assignees: userId }],
    isDeleted: false,
    isTrash: false,
    stage: { $ne: 'completed' },
    dueDate: { $gte: now, $lte: future }
  }).select('title dueDate priority stage').lean();

  // Group by date
  const dayLoad = {};
  upcomingTasks.forEach(t => {
    const dateKey = new Date(t.dueDate).toISOString().split('T')[0];
    if (!dayLoad[dateKey]) dayLoad[dateKey] = { date: dateKey, tasks: [], count: 0 };
    dayLoad[dateKey].tasks.push({
      title: FieldEncryption.decrypt(t.title || ''),
      priority: t.priority,
      stage: t.stage
    });
    dayLoad[dateKey].count++;
  });

  // Flag overloaded days (more than 5 active tasks)
  const overloaded = Object.values(dayLoad)
    .filter(d => d.count > 5)
    .sort((a, b) => b.count - a.count);

  return {
    dailyLoad: Object.values(dayLoad).sort((a, b) => a.date.localeCompare(b.date)),
    overloadedDays: overloaded,
    totalUpcoming: upcomingTasks.length,
    averageDailyLoad: upcomingTasks.length / lookAheadDays
  };
};

/**
 * Detect completion drought — no completed tasks in N days
 */
const detectCompletionDrought = async (userId, workspaceId, thresholdDays = 3) => {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - thresholdDays);

  const recentCompletions = await Task.countDocuments({
    workspace: workspaceId,
    $or: [{ creator: userId }, { assignees: userId }],
    stage: 'completed',
    completedAt: { $gte: threshold }
  });

  const totalActive = await Task.countDocuments({
    workspace: workspaceId,
    $or: [{ creator: userId }, { assignees: userId }],
    isDeleted: false,
    isTrash: false,
    stage: { $ne: 'completed' }
  });

  return {
    completionsInPeriod: recentCompletions,
    activeTasks: totalActive,
    isDrought: recentCompletions === 0 && totalActive > 0,
    thresholdDays
  };
};

/**
 * Detect overdue task accumulation
 */
const detectOverdueAccumulation = async (userId, workspaceId) => {
  const now = new Date();

  const overdueTasks = await Task.find({
    workspace: workspaceId,
    $or: [{ creator: userId }, { assignees: userId }],
    isDeleted: false,
    isTrash: false,
    stage: { $ne: 'completed' },
    dueDate: { $lt: now }
  }).select('title dueDate priority stage createdAt').lean();

  // Calculate severity — how overdue
  const classified = overdueTasks.map(t => {
    const overdueDays = Math.floor((now.getTime() - new Date(t.dueDate).getTime()) / (1000 * 60 * 60 * 24));
    return {
      title: FieldEncryption.decrypt(t.title || ''),
      priority: t.priority,
      dueDate: t.dueDate,
      overdueDays,
      severity: overdueDays > 7 ? 'critical' : overdueDays > 3 ? 'warning' : 'mild'
    };
  }).sort((a, b) => b.overdueDays - a.overdueDays);

  return {
    total: overdueTasks.length,
    critical: classified.filter(t => t.severity === 'critical').length,
    warning: classified.filter(t => t.severity === 'warning').length,
    mild: classified.filter(t => t.severity === 'mild').length,
    tasks: classified
  };
};

// ═══════════════════════════════════════════════════════════════════
//  SECTION B: FOCUS WINDOW INTELLIGENCE
//  Tracks when tasks get completed, identifies productive patterns
// ═══════════════════════════════════════════════════════════════════

/**
 * Analyze completion time patterns — when does the user actually finish work
 */
export const analyzeCompletionPatterns = async (userId, workspaceId, lookBackDays = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - lookBackDays);

  const completed = await Task.find({
    workspace: workspaceId,
    $or: [{ creator: userId }, { assignees: userId }],
    stage: 'completed',
    completedAt: { $gte: since }
  }).select('completedAt priority dueDate createdAt').lean();

  // Hourly distribution
  const hourlyBuckets = new Array(24).fill(0);
  const dayBuckets = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  completed.forEach(t => {
    if (t.completedAt) {
      const d = new Date(t.completedAt);
      hourlyBuckets[d.getHours()]++;
      dayBuckets[dayNames[d.getDay()]]++;
    }
  });

  // Find peak productivity hours (top 3)
  const peakHours = hourlyBuckets
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .filter(h => h.count > 0);

  // Find most productive day
  const peakDay = Object.entries(dayBuckets)
    .sort(([, a], [, b]) => b - a)[0];

  // Calculate average task lifespan (creation→completion)
  const lifespans = completed
    .filter(t => t.createdAt && t.completedAt)
    .map(t => (new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60));
  const avgLifespanHours = lifespans.length > 0
    ? lifespans.reduce((s, v) => s + v, 0) / lifespans.length
    : 0;

  // On-time vs late completion rate
  const onTime = completed.filter(t => t.dueDate && new Date(t.completedAt) <= new Date(t.dueDate)).length;
  const late = completed.filter(t => t.dueDate && new Date(t.completedAt) > new Date(t.dueDate)).length;

  return {
    totalCompleted: completed.length,
    period: `${lookBackDays} days`,
    hourlyDistribution: hourlyBuckets,
    peakProductivityHours: peakHours.map(h => ({
      hour: h.hour,
      label: `${h.hour.toString().padStart(2, '0')}:00`,
      completions: h.count
    })),
    dailyDistribution: dayBuckets,
    mostProductiveDay: peakDay ? { day: peakDay[0], completions: peakDay[1] } : null,
    averageTaskLifespanHours: Math.round(avgLifespanHours * 10) / 10,
    punctuality: {
      onTime,
      late,
      onTimeRate: completed.length > 0 ? Math.round((onTime / completed.length) * 100) : 0
    }
  };
};

/**
 * Detect deep work vs shallow work windows
 */
export const analyzeFocusWindows = async (userId, workspaceId, lookBackDays = 14) => {
  const since = new Date();
  since.setDate(since.getDate() - lookBackDays);

  const completed = await Task.find({
    workspace: workspaceId,
    $or: [{ creator: userId }, { assignees: userId }],
    stage: 'completed',
    completedAt: { $gte: since }
  }).select('completedAt priority focusTag estimatedHours').lean();

  // Time block analysis (morning 6-12, afternoon 12-17, evening 17-22, night 22-6)
  const blocks = {
    morning: { label: '06:00–12:00', tasks: 0, highPriority: 0 },
    afternoon: { label: '12:00–17:00', tasks: 0, highPriority: 0 },
    evening: { label: '17:00–22:00', tasks: 0, highPriority: 0 },
    night: { label: '22:00–06:00', tasks: 0, highPriority: 0 }
  };

  completed.forEach(t => {
    if (!t.completedAt) return;
    const hour = new Date(t.completedAt).getHours();
    let block;
    if (hour >= 6 && hour < 12) block = 'morning';
    else if (hour >= 12 && hour < 17) block = 'afternoon';
    else if (hour >= 17 && hour < 22) block = 'evening';
    else block = 'night';

    blocks[block].tasks++;
    if (t.priority === 'high') blocks[block].highPriority++;
  });

  // Determine best focus window
  const sortedBlocks = Object.entries(blocks)
    .sort(([, a], [, b]) => b.tasks - a.tasks);

  const deepWorkWindow = sortedBlocks[0];
  const shallowWindow = sortedBlocks[sortedBlocks.length - 1];

  return {
    blocks,
    deepWorkWindow: deepWorkWindow ? {
      period: deepWorkWindow[0],
      label: deepWorkWindow[1].label,
      completions: deepWorkWindow[1].tasks
    } : null,
    leastActiveWindow: shallowWindow ? {
      period: shallowWindow[0],
      label: shallowWindow[1].label,
      completions: shallowWindow[1].tasks
    } : null,
    recommendation: deepWorkWindow && deepWorkWindow[1].tasks > 0
      ? `Schedule important tasks during ${deepWorkWindow[1].label} — that's your peak execution window.`
      : 'Not enough data yet to determine your focus window. Complete a few more tasks!'
  };
};

// ═══════════════════════════════════════════════════════════════════
//  SECTION C: BURNOUT SIGNAL DETECTION
//  Monitors workload trends for early warning signs
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate weekly workload comparison and detect burnout signals
 */
export const detectBurnoutSignals = async (userId, workspaceId) => {
  const now = new Date();

  // This week
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  // Last week
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);

  // Parallel queries
  const [
    thisWeekCreated, lastWeekCreated,
    thisWeekCompleted, lastWeekCompleted,
    currentOverdue, currentActive
  ] = await Promise.all([
    Task.countDocuments({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      createdAt: { $gte: thisWeekStart }
    }),
    Task.countDocuments({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      createdAt: { $gte: lastWeekStart, $lt: lastWeekEnd }
    }),
    Task.countDocuments({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      stage: 'completed',
      completedAt: { $gte: thisWeekStart }
    }),
    Task.countDocuments({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      stage: 'completed',
      completedAt: { $gte: lastWeekStart, $lt: lastWeekEnd }
    }),
    Task.countDocuments({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      isDeleted: false,
      isTrash: false,
      stage: { $ne: 'completed' },
      dueDate: { $lt: now }
    }),
    Task.countDocuments({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      isDeleted: false,
      isTrash: false,
      stage: { $ne: 'completed' }
    })
  ]);

  // Calculate trends
  const creationTrend = lastWeekCreated > 0
    ? Math.round(((thisWeekCreated - lastWeekCreated) / lastWeekCreated) * 100)
    : thisWeekCreated > 0 ? 100 : 0;

  const completionTrend = lastWeekCompleted > 0
    ? Math.round(((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100)
    : thisWeekCompleted > 0 ? 100 : 0;

  // Burnout signal scoring (0-100)
  let burnoutScore = 0;
  const signals = [];

  // Signal 1: Creating more tasks but completing fewer
  if (creationTrend > 20 && completionTrend < -10) {
    burnoutScore += 30;
    signals.push({
      type: 'workload_imbalance',
      severity: 'high',
      message: `You added ${creationTrend}% more tasks this week but completed ${Math.abs(completionTrend)}% fewer.`
    });
  }

  // Signal 2: High overdue ratio
  const overdueRatio = currentActive > 0 ? (currentOverdue / currentActive) : 0;
  if (overdueRatio > 0.5) {
    burnoutScore += 25;
    signals.push({
      type: 'overdue_accumulation',
      severity: 'high',
      message: `${Math.round(overdueRatio * 100)}% of your active tasks are overdue.`
    });
  } else if (overdueRatio > 0.25) {
    burnoutScore += 15;
    signals.push({
      type: 'overdue_accumulation',
      severity: 'medium',
      message: `${Math.round(overdueRatio * 100)}% of your tasks are past their due date.`
    });
  }

  // Signal 3: Zero completions this week
  if (thisWeekCompleted === 0 && currentActive > 3) {
    burnoutScore += 20;
    signals.push({
      type: 'execution_stall',
      severity: 'high',
      message: `No tasks completed this week despite ${currentActive} active tasks.`
    });
  }

  // Signal 4: Excessive active task load
  if (currentActive > 20) {
    burnoutScore += 15;
    signals.push({
      type: 'task_overload',
      severity: 'medium',
      message: `You have ${currentActive} active tasks. Consider prioritizing or deferring some.`
    });
  } else if (currentActive > 10) {
    burnoutScore += 10;
    signals.push({
      type: 'task_overload',
      severity: 'low',
      message: `${currentActive} active tasks — stay focused on your top priorities.`
    });
  }

  // Determine overall status
  let status;
  if (burnoutScore >= 60) status = 'critical';
  else if (burnoutScore >= 40) status = 'warning';
  else if (burnoutScore >= 20) status = 'caution';
  else status = 'healthy';

  return {
    burnoutScore: Math.min(burnoutScore, 100),
    status,
    signals,
    weeklyComparison: {
      thisWeek: { created: thisWeekCreated, completed: thisWeekCompleted },
      lastWeek: { created: lastWeekCreated, completed: lastWeekCompleted },
      creationTrend: `${creationTrend >= 0 ? '+' : ''}${creationTrend}%`,
      completionTrend: `${completionTrend >= 0 ? '+' : ''}${completionTrend}%`
    },
    currentLoad: {
      active: currentActive,
      overdue: currentOverdue,
      overdueRatio: Math.round(overdueRatio * 100)
    }
  };
};

// ═══════════════════════════════════════════════════════════════════
//  SECTION D: HABIT EXECUTION ANALYTICS
//  Tracks habit performance patterns over time
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate habit execution health and streaks at risk
 */
export const analyzeHabitExecution = async (userId, workspaceId) => {
  const habits = await Habit.find({
    user: userId,
    workspace: workspaceId,
    isActive: true,
    isPaused: false,
    isTrash: false
  }).select('title currentStreak longestStreak completions statistics category').lean();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const analysis = habits.map(h => {
    const completedToday = (h.completions || []).some(c => {
      const cDate = new Date(c.date).toISOString().split('T')[0];
      return cDate === todayStr && c.completed;
    });

    // Recent completion rate (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentCompletions = (h.completions || []).filter(c =>
      new Date(c.date) >= weekAgo && c.completed
    ).length;

    return {
      title: FieldEncryption.decrypt(h.title || ''),
      category: h.category,
      currentStreak: h.currentStreak || 0,
      longestStreak: h.longestStreak || 0,
      completedToday,
      recentCompletionRate: Math.round((recentCompletions / 7) * 100),
      streakAtRisk: h.currentStreak >= 3 && !completedToday,
      overallCompletionRate: h.statistics?.completionRate || 0
    };
  });

  const streaksAtRisk = analysis.filter(h => h.streakAtRisk);
  const lowPerformers = analysis.filter(h => h.recentCompletionRate < 40);
  const highPerformers = analysis.filter(h => h.recentCompletionRate >= 80);

  return {
    totalActive: habits.length,
    completedToday: analysis.filter(h => h.completedToday).length,
    remainingToday: analysis.filter(h => !h.completedToday).length,
    streaksAtRisk,
    lowPerformers,
    highPerformers,
    habits: analysis
  };
};

// ═══════════════════════════════════════════════════════════════════
//  SECTION E: FULL INTELLIGENCE REPORT
//  Aggregates all signals into a single executive summary
// ═══════════════════════════════════════════════════════════════════

/**
 * Generate comprehensive execution intelligence report
 */
export const generateIntelligenceReport = async (userId, workspaceId) => {
  const [
    staleTasks,
    workloadForecast,
    completionDrought,
    overdue,
    completionPatterns,
    focusWindows,
    burnout,
    habitHealth
  ] = await Promise.all([
    detectStaleTasks(userId, workspaceId),
    detectOverloadedDays(userId, workspaceId),
    detectCompletionDrought(userId, workspaceId),
    detectOverdueAccumulation(userId, workspaceId),
    analyzeCompletionPatterns(userId, workspaceId),
    analyzeFocusWindows(userId, workspaceId),
    detectBurnoutSignals(userId, workspaceId),
    analyzeHabitExecution(userId, workspaceId)
  ]);

  // Build proactive insights
  const insights = [];

  // Drift insights
  if (staleTasks.length > 0) {
    insights.push({
      type: 'drift',
      priority: 'high',
      title: 'Stale Tasks Detected',
      message: `${staleTasks.length} task(s) haven't been touched in 5+ days. Consider reviewing or removing them.`,
      data: staleTasks.slice(0, 5)
    });
  }

  // Overload insights
  if (workloadForecast.overloadedDays.length > 0) {
    insights.push({
      type: 'overload',
      priority: 'high',
      title: 'Workload Overload Predicted',
      message: `${workloadForecast.overloadedDays.length} day(s) this week have 6+ tasks scheduled. Consider redistributing.`,
      data: workloadForecast.overloadedDays
    });
  }

  // Drought insights
  if (completionDrought.isDrought) {
    insights.push({
      type: 'drought',
      priority: 'high',
      title: 'Completion Drought',
      message: `No tasks completed in the last ${completionDrought.thresholdDays} days despite ${completionDrought.activeTasks} active tasks. Time to break the cycle — start with one small task.`
    });
  }

  // Overdue insights
  if (overdue.critical > 0) {
    insights.push({
      type: 'overdue',
      priority: 'critical',
      title: 'Critical Overdue Tasks',
      message: `${overdue.critical} task(s) are 7+ days overdue. Decide: complete, reschedule, or remove.`,
      data: overdue.tasks.filter(t => t.severity === 'critical')
    });
  }

  // Burnout insights
  if (burnout.status === 'critical' || burnout.status === 'warning') {
    insights.push({
      type: 'burnout',
      priority: burnout.status === 'critical' ? 'critical' : 'high',
      title: 'Burnout Risk Detected',
      message: burnout.signals.map(s => s.message).join(' '),
      data: { score: burnout.burnoutScore, status: burnout.status }
    });
  }

  // Focus window insight
  if (focusWindows.deepWorkWindow && completionPatterns.totalCompleted >= 5) {
    insights.push({
      type: 'focus',
      priority: 'medium',
      title: 'Optimal Focus Window',
      message: focusWindows.recommendation
    });
  }

  // Habit insights
  if (habitHealth.streaksAtRisk.length > 0) {
    insights.push({
      type: 'habit_risk',
      priority: 'high',
      title: 'Streaks at Risk',
      message: `${habitHealth.streaksAtRisk.length} habit streak(s) will break if not completed today: ${habitHealth.streaksAtRisk.map(h => h.title).join(', ')}`
    });
  }

  // Punctuality insight
  if (completionPatterns.punctuality.onTimeRate < 50 && completionPatterns.totalCompleted >= 5) {
    insights.push({
      type: 'punctuality',
      priority: 'medium',
      title: 'Deadline Performance',
      message: `Only ${completionPatterns.punctuality.onTimeRate}% of tasks are completed on time. Consider setting more realistic deadlines or breaking tasks into smaller pieces.`
    });
  }

  // Calculate overall execution health score (0-100)
  let healthScore = 100;
  if (burnout.burnoutScore > 0) healthScore -= Math.min(burnout.burnoutScore * 0.3, 30);
  if (overdue.total > 0) healthScore -= Math.min(overdue.total * 3, 20);
  if (staleTasks.length > 0) healthScore -= Math.min(staleTasks.length * 2, 15);
  if (completionDrought.isDrought) healthScore -= 15;
  if (completionPatterns.punctuality.onTimeRate < 50) healthScore -= 10;
  healthScore = Math.max(0, Math.round(healthScore));

  let healthStatus;
  if (healthScore >= 80) healthStatus = 'excellent';
  else if (healthScore >= 60) healthStatus = 'good';
  else if (healthScore >= 40) healthStatus = 'needs_attention';
  else healthStatus = 'critical';

  return {
    generatedAt: new Date().toISOString(),
    executionHealth: {
      score: healthScore,
      status: healthStatus,
      label: healthStatus === 'excellent' ? 'Excellent' :
             healthStatus === 'good' ? 'Good' :
             healthStatus === 'needs_attention' ? 'Needs Attention' : 'Critical'
    },
    insights: insights.sort((a, b) => {
      const prio = { critical: 4, high: 3, medium: 2, low: 1 };
      return (prio[b.priority] || 0) - (prio[a.priority] || 0);
    }),
    details: {
      drift: { staleTasks: staleTasks.length, tasks: staleTasks.slice(0, 10) },
      workload: workloadForecast,
      completionDrought,
      overdue,
      burnout,
      habitHealth: {
        active: habitHealth.totalActive,
        completedToday: habitHealth.completedToday,
        remainingToday: habitHealth.remainingToday,
        streaksAtRisk: habitHealth.streaksAtRisk.length
      }
    },
    analytics: {
      completionPatterns,
      focusWindows
    }
  };
};

/**
 * Generate a short proactive nudge for chat context
 * Returns the single most important insight to surface in a chat reply
 */
export const getProactiveNudge = async (userId, workspaceId) => {
  try {
    const [staleTasks, drought, overdue, burnout, habitHealth] = await Promise.all([
      detectStaleTasks(userId, workspaceId, 5),
      detectCompletionDrought(userId, workspaceId, 3),
      detectOverdueAccumulation(userId, workspaceId),
      detectBurnoutSignals(userId, workspaceId),
      analyzeHabitExecution(userId, workspaceId)
    ]);

    // Return the highest priority issue
    if (burnout.status === 'critical') {
      return {
        type: 'burnout',
        nudge: burnout.signals[0]?.message || 'Your workload metrics suggest burnout risk. Consider reviewing your commitments.'
      };
    }

    if (overdue.critical > 0) {
      return {
        type: 'overdue',
        nudge: `${overdue.critical} task(s) are critically overdue (7+ days). Address or remove them.`
      };
    }

    if (drought.isDrought) {
      return {
        type: 'drought',
        nudge: `No completions in ${drought.thresholdDays} days. Start with one small task to rebuild momentum.`
      };
    }

    if (habitHealth.streaksAtRisk.length > 0) {
      return {
        type: 'habit_risk',
        nudge: `Don't break your ${habitHealth.streaksAtRisk[0].title} streak (${habitHealth.streaksAtRisk[0].currentStreak} days)!`
      };
    }

    if (staleTasks.length > 3) {
      return {
        type: 'drift',
        nudge: `${staleTasks.length} tasks are stagnating. Review and decide: act, defer, or remove.`
      };
    }

    return null; // No urgent nudge
  } catch (error) {
    console.error('Proactive nudge error:', error);
    return null;
  }
};

// ═══════════════════════════════════════════════════════════════════
//  SECTION F: SMART ORCHESTRATION
//  Proactive task gap detection and workflow suggestions
// ═══════════════════════════════════════════════════════════════════

/**
 * Detect execution gaps and suggest corrective actions
 */
export const detectExecutionGaps = async (userId, workspaceId) => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const [tomorrowTasks, allActive, recentCompleted] = await Promise.all([
    // Tasks due tomorrow
    Task.find({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      isDeleted: false,
      isTrash: false,
      stage: { $ne: 'completed' },
      dueDate: {
        $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
        $lte: new Date(tomorrow.setHours(23, 59, 59, 999))
      }
    }).select('title priority stage dueDate').lean(),

    // All active tasks
    Task.find({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      isDeleted: false,
      isTrash: false,
      stage: { $ne: 'completed' }
    }).select('title priority stage dueDate createdAt').lean(),

    // Recently completed (for velocity)
    Task.countDocuments({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      stage: 'completed',
      completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
  ]);

  const suggestions = [];

  // Gap 1: High-priority tasks with no due date
  const noDueDate = allActive.filter(t => !t.dueDate && t.priority === 'high');
  if (noDueDate.length > 0) {
    suggestions.push({
      type: 'missing_deadline',
      priority: 'high',
      message: `${noDueDate.length} high-priority task(s) have no due date. Set deadlines to stay on track.`,
      actionable: true,
      action: 'set_due_dates',
      tasks: noDueDate.map(t => ({ title: FieldEncryption.decrypt(t.title || ''), id: t._id }))
    });
  }

  // Gap 2: Tomorrow overload
  if (tomorrowTasks.length > 5) {
    suggestions.push({
      type: 'tomorrow_overload',
      priority: 'high',
      message: `${tomorrowTasks.length} tasks due tomorrow. That's more than your average daily completion rate of ${Math.round(recentCompleted / 7)}. Consider rescheduling some.`,
      actionable: true,
      action: 'reschedule_tasks'
    });
  }

  // Gap 3: No tasks for tomorrow (unplanned day)
  if (tomorrowTasks.length === 0 && allActive.length > 0) {
    suggestions.push({
      type: 'unplanned_day',
      priority: 'medium',
      message: `No tasks scheduled for tomorrow but you have ${allActive.length} active tasks. Want me to suggest a daily plan?`,
      actionable: true,
      action: 'suggest_daily_plan'
    });
  }

  // Gap 4: Tasks stuck in_progress too long
  const stuckInProgress = allActive.filter(t => {
    return t.stage === 'in_progress' &&
      t.createdAt &&
      (Date.now() - new Date(t.createdAt).getTime()) > 3 * 24 * 60 * 60 * 1000;
  });
  if (stuckInProgress.length > 0) {
    suggestions.push({
      type: 'stuck_tasks',
      priority: 'medium',
      message: `${stuckInProgress.length} task(s) have been "in progress" for 3+ days. Need to break them into smaller subtasks?`,
      actionable: true,
      action: 'break_down_tasks',
      tasks: stuckInProgress.map(t => ({ title: FieldEncryption.decrypt(t.title || ''), id: t._id }))
    });
  }

  // Gap 5: Completion velocity
  const weeklyVelocity = recentCompleted;
  const weeksToComplete = weeklyVelocity > 0
    ? Math.round((allActive.length / weeklyVelocity) * 10) / 10
    : null;

  return {
    suggestions,
    velocity: {
      weeklyCompletions: weeklyVelocity,
      activeTasks: allActive.length,
      weeksToComplete,
      interpretation: weeksToComplete
        ? weeksToComplete > 4
          ? 'At current pace, your backlog will take over a month to clear. Prioritize ruthlessly.'
          : weeksToComplete > 2
            ? 'Manageable backlog. Stay consistent.'
            : 'Great pace! Your backlog is under control.'
        : 'No completed tasks this week — start completing to build velocity.'
    }
  };
};

export default {
  generateIntelligenceReport,
  getProactiveNudge,
  detectExecutionGaps,
  // Individual analyzers (for targeted queries)
  detectStaleTasks,
  detectOverloadedDays,
  detectCompletionDrought,
  detectOverdueAccumulation,
  analyzeCompletionPatterns,
  analyzeFocusWindows,
  detectBurnoutSignals,
  analyzeHabitExecution
};
