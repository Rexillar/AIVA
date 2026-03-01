import Task from '../models/task.js';
import ExternalCalendarEvent from '../models/externalCalendarEvent.js';
import { FieldEncryption } from '../utils/encryption.js';

/**
 * Cross-System Orchestration Service
 * Provides calendar-aware scheduling, conflict detection,
 * unified day planning, and cross-entity linking.
 */

/**
 * Detect scheduling conflicts — tasks due on days with heavy meetings
 */
export const detectScheduleConflicts = async (userId, workspaceId, lookAheadDays = 7) => {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + lookAheadDays);

  const [tasks, events] = await Promise.all([
    Task.find({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      isDeleted: false,
      isTrash: false,
      stage: { $ne: 'completed' },
      dueDate: { $gte: now, $lte: future }
    }).select('title dueDate priority estimatedHours stage').lean(),

    ExternalCalendarEvent.find({
      workspaceId,
      startTime: { $gte: now, $lte: future },
      syncStatus: 'synced'
    }).select('title startTime endTime allDay').lean()
  ]);

  // Group by date
  const dayMap = {};
  const toDateKey = d => new Date(d).toISOString().split('T')[0];

  tasks.forEach(t => {
    if (!t.dueDate) return;
    const key = toDateKey(t.dueDate);
    if (!dayMap[key]) dayMap[key] = { date: key, tasks: [], events: [], totalMeetingHours: 0, totalTaskHours: 0 };
    dayMap[key].tasks.push({
      id: t._id,
      title: FieldEncryption.decrypt(t.title || ''),
      priority: t.priority,
      estimatedHours: t.estimatedHours || 1
    });
    dayMap[key].totalTaskHours += (t.estimatedHours || 1);
  });

  events.forEach(e => {
    const key = toDateKey(e.startTime);
    if (!dayMap[key]) dayMap[key] = { date: key, tasks: [], events: [], totalMeetingHours: 0, totalTaskHours: 0 };
    // Deduplicate events by title + startTime
    const dedupKey = `${e.title}|${new Date(e.startTime).toISOString()}`;
    if (dayMap[key].events.some(ev => `${ev.title}|${new Date(ev.start).toISOString()}` === dedupKey)) return;
    const duration = e.allDay ? 8 : (new Date(e.endTime) - new Date(e.startTime)) / (1000 * 60 * 60);
    dayMap[key].events.push({
      title: e.title,
      start: e.startTime,
      end: e.endTime,
      hours: Math.round(duration * 10) / 10
    });
    dayMap[key].totalMeetingHours += duration;
  });

  // Detect conflicts (>8 scheduled hours in a day)
  const conflicts = [];
  const WORK_HOURS = 8;
  Object.values(dayMap).forEach(day => {
    const totalHours = day.totalMeetingHours + day.totalTaskHours;
    if (totalHours > WORK_HOURS) {
      conflicts.push({
        date: day.date,
        totalHours: Math.round(totalHours * 10) / 10,
        meetingHours: Math.round(day.totalMeetingHours * 10) / 10,
        taskHours: Math.round(day.totalTaskHours * 10) / 10,
        overflowHours: Math.round((totalHours - WORK_HOURS) * 10) / 10,
        tasks: day.tasks,
        events: day.events,
        severity: totalHours > 12 ? 'critical' : totalHours > 10 ? 'high' : 'medium'
      });
    }
  });

  return {
    lookAheadDays,
    totalConflicts: conflicts.length,
    conflicts: conflicts.sort((a, b) => a.date.localeCompare(b.date)),
    dailySummary: Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date))
  };
};

/**
 * Smart schedule suggestion — find the best day to schedule a new task
 */
export const suggestBestDay = async (userId, workspaceId, estimatedHours = 1, lookAheadDays = 14) => {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + lookAheadDays);

  const [tasks, events] = await Promise.all([
    Task.find({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      isDeleted: false,
      isTrash: false,
      stage: { $ne: 'completed' },
      dueDate: { $gte: now, $lte: future }
    }).select('dueDate estimatedHours').lean(),

    ExternalCalendarEvent.find({
      workspaceId,
      startTime: { $gte: now, $lte: future },
      syncStatus: 'synced'
    }).select('startTime endTime allDay').lean()
  ]);

  // Build day load map
  const WORK_HOURS = 8;
  const dayLoads = {};

  for (let d = 0; d < lookAheadDays; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    const key = date.toISOString().split('T')[0];
    // Skip weekends
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;
    dayLoads[key] = { date: key, meetingHours: 0, taskHours: 0 };
  }

  tasks.forEach(t => {
    if (!t.dueDate) return;
    const key = new Date(t.dueDate).toISOString().split('T')[0];
    if (dayLoads[key]) dayLoads[key].taskHours += (t.estimatedHours || 1);
  });

  events.forEach(e => {
    const key = new Date(e.startTime).toISOString().split('T')[0];
    const hours = e.allDay ? 8 : (new Date(e.endTime) - new Date(e.startTime)) / (1000 * 60 * 60);
    if (dayLoads[key]) dayLoads[key].meetingHours += hours;
  });

  // Find days with enough free hours
  const candidates = Object.values(dayLoads)
    .map(d => ({
      ...d,
      freeHours: Math.max(0, WORK_HOURS - d.meetingHours - d.taskHours)
    }))
    .filter(d => d.freeHours >= estimatedHours)
    .sort((a, b) => b.freeHours - a.freeHours);

  return {
    estimatedHours,
    suggestions: candidates.slice(0, 5),
    bestDay: candidates[0] || null
  };
};

/**
 * Generate a unified daily plan combining tasks + calendar events
 */
export const generateDailyPlan = async (userId, workspaceId, dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);

  const [tasks, events] = await Promise.all([
    Task.find({
      workspace: workspaceId,
      $or: [{ creator: userId }, { assignees: userId }],
      isDeleted: false,
      isTrash: false,
      dueDate: { $gte: dayStart, $lte: dayEnd }
    }).select('title priority stage estimatedHours dueDate subtasks focusTag').lean(),

    ExternalCalendarEvent.find({
      workspaceId,
      startTime: { $gte: dayStart, $lte: dayEnd },
      syncStatus: 'synced'
    }).select('title startTime endTime allDay meetingLink location attendees').lean()
  ]);

  // Build timeline (deduplicate events by title + startTime)
  const timeline = [];
  const eventKeys = new Set();

  events.forEach(e => {
    const key = `${e.title}|${new Date(e.startTime).toISOString()}`;
    if (eventKeys.has(key)) return; // skip duplicate
    eventKeys.add(key);
    timeline.push({
      type: 'event',
      title: e.title,
      start: e.startTime,
      end: e.endTime,
      allDay: e.allDay,
      meetingLink: e.meetingLink,
      location: e.location || null
    });
  });

  tasks.forEach(t => {
    timeline.push({
      type: 'task',
      title: FieldEncryption.decrypt(t.title || ''),
      priority: t.priority,
      stage: t.stage,
      estimatedHours: t.estimatedHours,
      focusTag: t.focusTag,
      subtaskCount: t.subtasks?.length || 0,
      subtasksCompleted: t.subtasks?.filter(s => s.completed).length || 0
    });
  });

  // Sort events by time, tasks by priority
  const sortedEvents = timeline.filter(i => i.type === 'event').sort((a, b) => new Date(a.start) - new Date(b.start));
  const sortedTasks = timeline.filter(i => i.type === 'task').sort((a, b) => {
    const p = { high: 3, medium: 2, low: 1 };
    return (p[b.priority] || 0) - (p[a.priority] || 0);
  });

  const totalMeetingHours = events.reduce((sum, e) => {
    return sum + (e.allDay ? 8 : (new Date(e.endTime) - new Date(e.startTime)) / 3600000);
  }, 0);

  const totalTaskHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 1), 0);

  return {
    date: dayStart.toISOString().split('T')[0],
    events: sortedEvents,
    tasks: sortedTasks,
    summary: {
      eventCount: events.length,
      taskCount: tasks.length,
      meetingHours: Math.round(totalMeetingHours * 10) / 10,
      taskHours: Math.round(totalTaskHours * 10) / 10,
      freeHours: Math.max(0, Math.round((8 - totalMeetingHours - totalTaskHours) * 10) / 10),
      isOverloaded: (totalMeetingHours + totalTaskHours) > 8
    }
  };
};

export default {
  detectScheduleConflicts,
  suggestBestDay,
  generateDailyPlan
};
