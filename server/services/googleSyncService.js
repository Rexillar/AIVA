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

   ⟁  PURPOSE      : Synchronize data with Google services

   ⟁  WHY          : Real-time external data integration

   ⟁  WHAT         : Google API client and sync operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : OAuth 2.0 • AES-256-GCM
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Data synchronized. Services integrated. Real-time updated."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


import { google } from 'googleapis';
import GoogleIntegration from '../models/googleIntegration.js';
import ExternalCalendarEvent from '../models/externalCalendarEvent.js';
import ExternalTask from '../models/externalTask.js';
import googleAuthService from './googleAuthService.js';

class GoogleSyncService {
  constructor() {
    this.meetLinkPatterns = [
      /https:\/\/meet\.google\.com\/[a-z\-]+/gi,
      /https:\/\/hangouts\.google\.com\/[^\s]+/gi
    ];
  }

  /**
   * Sync calendar events for a specific Google account
   */
  async syncCalendarEvents(workspaceId, googleAccountId) {
    try {
      const integration = await GoogleIntegration.findByWorkspace(workspaceId);
      if (!integration) {
        throw new Error('No Google integration found for workspace');
      }

      const account = integration.getAccountById(googleAccountId);
      if (!account || account.status !== 'active') {
        throw new Error('Google account not active');
      }

      if (!account.syncSettings.calendar.enabled) {
        return { success: true, message: 'Calendar sync disabled' };
      }

      // Check and refresh token if needed
      if (googleAuthService.isTokenExpired(account.tokenExpiry)) {
        const refreshed = await googleAuthService.refreshAccessToken(account.refreshToken);
        account.accessToken = googleAuthService.encrypt(refreshed.accessToken);
        account.tokenExpiry = refreshed.expiryDate;
        await integration.save();
      }

      // Get authenticated client
      const auth = googleAuthService.getAuthenticatedClient(
        account.accessToken,
        account.refreshToken
      );

      const calendar = google.calendar({ version: 'v3', auth });

      // Determine sync window
      const now = new Date();
      const syncFrom = account.lastSync || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days back
      const syncTo = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days ahead (1 year)

      let syncedCount = 0;
      const calendarsToSync = account.syncSettings.calendar.selectedCalendars || [{ id: 'primary' }];

      // Sync each selected calendar
      for (const cal of calendarsToSync) {
        const events = await calendar.events.list({
          calendarId: cal.id,
          timeMin: syncFrom.toISOString(),
          timeMax: syncTo.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 250
        });

        if (events.data.items) {
          for (const event of events.data.items) {
            await this.storeCalendarEvent(workspaceId, googleAccountId, cal.id, event, account);
            syncedCount++;
          }
        }
      }

      // Update last sync time
      await integration.updateLastSync(googleAccountId);

      return {
        success: true,
        syncedCount,
        message: `Synced ${syncedCount} events`
      };
    } catch (error) {
      console.error('Calendar sync error:', error);

      // Update account status if auth error
      if (error.code === 401 || error.code === 403) {
        const integration = await GoogleIntegration.findByWorkspace(workspaceId);
        if (integration) {
          await integration.updateAccountStatus(googleAccountId, 'expired', error);
        }
      }

      throw error;
    }
  }

  /**
   * Store or update calendar event
   */
  async storeCalendarEvent(workspaceId, googleAccountId, calendarId, event, account) {
    try {
      const meetLink = this.extractMeetLink(event);
      const meetProvider = meetLink ? this.detectMeetProvider(meetLink) : null;

      const eventData = {
        workspaceId,
        source: 'google',
        googleAccountId,
        googleEventId: event.id,
        googleCalendarId: calendarId,

        title: event.summary || 'Untitled Event',
        description: event.description || '',
        location: event.location || '',

        startTime: event.start.dateTime || event.start.date,
        endTime: event.end.dateTime || event.end.date,
        allDay: !event.start.dateTime || (event.start.dateTime && event.end.dateTime &&
          new Date(event.end.dateTime).getTime() - new Date(event.start.dateTime).getTime() === 24 * 60 * 60 * 1000 &&
          event.start.dateTime.includes('T00:00:00') && event.end.dateTime.includes('T00:00:00')),
        timeZone: event.start.timeZone || 'UTC',

        meetingLink: meetLink,
        meetingProvider: meetProvider,

        attendees: this.formatAttendees(event.attendees),
        organizer: event.organizer ? {
          email: event.organizer.email,
          name: event.organizer.displayName || event.organizer.email
        } : null,

        isRecurring: !!event.recurrence,
        recurrenceRule: event.recurrence ? event.recurrence[0] : null,
        recurringEventId: event.recurringEventId,

        isReadOnly: account.syncSettings.calendar.syncDirection === 'read-only',
        canEdit: account.syncSettings.calendar.syncDirection === 'bidirectional',
        canDelete: account.syncSettings.calendar.syncDirection === 'bidirectional',

        colorCode: account.syncSettings.calendar.colorCode || '#4285F4',

        lastSyncedAt: new Date(),
        syncStatus: 'synced'
      };

      // Upsert event
      await ExternalCalendarEvent.findOneAndUpdate(
        {
          workspaceId,
          googleEventId: event.id,
          googleCalendarId: calendarId
        },
        eventData,
        { upsert: true, new: true }
      );

      return true;
    } catch (error) {
      console.error('Error storing calendar event:', error);
      return false;
    }
  }

  /**
   * Sync Google Tasks for a specific account
   */
  async syncTasks(workspaceId, googleAccountId) {
    try {
      console.log(`[GoogleSync] Starting task sync for workspace: ${workspaceId}, account: ${googleAccountId}`);

      const integration = await GoogleIntegration.findByWorkspace(workspaceId);
      if (!integration) {
        console.log('[GoogleSync] No Google integration found');
        throw new Error('No Google integration found');
      }

      const account = integration.getAccountById(googleAccountId);
      if (!account || account.status !== 'active') {
        console.log('[GoogleSync] Account not active:', account?.status);
        throw new Error('Google account not active');
      }

      console.log('[GoogleSync] Task sync enabled:', account.syncSettings.tasks.enabled);
      console.log('[GoogleSync] Show in AIVA:', account.syncSettings.tasks.showInAIVA);

      if (!account.syncSettings.tasks.enabled) {
        console.log('[GoogleSync] Task sync is disabled');
        return { success: true, message: 'Task sync disabled' };
      }

      // Refresh token if needed
      if (googleAuthService.isTokenExpired(account.tokenExpiry)) {
        console.log('[GoogleSync] Token expired, refreshing...');
        const refreshed = await googleAuthService.refreshAccessToken(account.refreshToken);
        account.accessToken = googleAuthService.encrypt(refreshed.accessToken);
        account.tokenExpiry = refreshed.expiryDate;
        await integration.save();
        console.log('[GoogleSync] Token refreshed');
      }

      const auth = googleAuthService.getAuthenticatedClient(
        account.accessToken,
        account.refreshToken
      );

      const tasks = google.tasks({ version: 'v1', auth });

      let syncedCount = 0;
      const listsToSync = account.syncSettings.tasks.selectedLists || [];

      console.log('[GoogleSync] Selected lists:', listsToSync);

      // If no lists selected, get all lists
      if (listsToSync.length === 0) {
        console.log('[GoogleSync] No lists selected, fetching all lists...');
        const lists = await tasks.tasklists.list();
        console.log('[GoogleSync] Found', lists.data.items?.length || 0, 'task lists');

        if (lists.data.items) {
          for (const list of lists.data.items) {
            console.log(`[GoogleSync] Syncing list: ${list.title} (${list.id})`);
            const taskList = await tasks.tasks.list({
              tasklist: list.id,
              showCompleted: true,
              showHidden: false
            });

            console.log(`[GoogleSync] Found ${taskList.data.items?.length || 0} tasks in list ${list.title}`);

            if (taskList.data.items) {
              for (const task of taskList.data.items) {
                console.log(`[GoogleSync] Storing task: ${task.title}`);
                await this.storeTask(workspaceId, googleAccountId, list, task, account);
                syncedCount++;
              }
            }
          }
        }
      } else {
        // Sync selected lists
        for (const list of listsToSync) {
          const taskList = await tasks.tasks.list({
            tasklist: list.id,
            showCompleted: true,
            showHidden: false
          });

          if (taskList.data.items) {
            for (const task of taskList.data.items) {
              await this.storeTask(workspaceId, googleAccountId, list, task, account);
              syncedCount++;
            }
          }
        }
      }

      // Mark tasks as deleted if they no longer exist in Google
      const existingTasks = await ExternalTask.find({
        workspaceId,
        googleAccountId,
        isDeleted: false
      });

      const googleTaskIds = new Set();

      // Fetch all lists to check for deleted tasks
      const allLists = await tasks.tasklists.list();
      if (allLists.data.items) {
        for (const list of allLists.data.items) {
          try {
            const taskList = await tasks.tasks.list({
              tasklist: list.id,
              showCompleted: true,
              showHidden: false
            });
            if (taskList.data.items) {
              taskList.data.items.forEach(task => googleTaskIds.add(task.id));
            }
          } catch (error) {
            console.error(`[GoogleSync] Error fetching tasks for deletion check from list ${list.id}:`, error.message);
          }
        }
      }

      // Mark tasks that no longer exist in Google as deleted
      let deletedCount = 0;
      for (const existingTask of existingTasks) {
        if (existingTask.googleTaskId && !googleTaskIds.has(existingTask.googleTaskId)) {
          console.log(`[GoogleSync] Task deleted in Google: ${existingTask.title}`);
          existingTask.isDeleted = true;
          existingTask.deletedAt = new Date();
          existingTask.syncStatus = 'deleted';
          await existingTask.save();
          deletedCount++;
        }
      }

      await integration.updateLastSync(googleAccountId);

      console.log(`[GoogleSync] Task sync complete. Synced ${syncedCount} tasks, deleted ${deletedCount} tasks`);

      return {
        success: true,
        syncedCount,
        deletedCount,
        message: `Synced ${syncedCount} tasks, removed ${deletedCount} deleted tasks`
      };
    } catch (error) {
      console.error('[GoogleSync] Task sync error:', error.message);
      console.error('[GoogleSync] Stack:', error.stack);
      throw error;
    }
  }

  /**
   * Store or update Google Task
   */
  async storeTask(workspaceId, googleAccountId, taskList, task, account) {
    try {
      const taskData = {
        workspaceId,
        source: 'google-tasks',
        googleAccountId,
        googleTaskId: task.id,
        googleTaskListId: taskList.id,
        googleTaskListName: taskList.name || taskList.title,

        title: task.title || 'Untitled Task',
        description: task.notes || '',
        dueDate: task.due ? new Date(task.due) : null,
        completedDate: task.completed ? new Date(task.completed) : null,
        status: task.status === 'completed' ? 'completed' : 'needsAction',

        notes: task.notes || '',
        parent: task.parent,
        position: task.position,
        links: task.links || [],

        showInTaskList: account.syncSettings.tasks.showInAIVA,
        colorCode: '#4285F4',

        isReadOnly: account.syncSettings.tasks.syncDirection === 'read-only',
        canEdit: account.syncSettings.tasks.syncDirection === 'bidirectional',
        canDelete: account.syncSettings.tasks.syncDirection === 'bidirectional',

        lastSyncedAt: new Date(),
        syncStatus: 'synced'
      };

      // ─── Corruption Guard ───────────────────────────────────────────────────
      // A previous bug sent encrypted cipher strings to Google (format: salt:iv:tag:cipher).
      // If the title coming FROM Google looks like our encrypted format, don't store it.
      // Instead, look up the linked AIVA task and use its decrypted title.
      const isCipherFormat = (val) =>
        typeof val === 'string' && /^[0-9a-f]{32,}:[0-9a-f]{24,}:[0-9a-f]{24,}:[0-9a-f]{6,}$/i.test(val);

      if (isCipherFormat(taskData.title)) {
        console.warn(`[GoogleSync] ⚠ Google returned an encrypted title for task ${task.id} — previous bug. Attempting to heal...`);
        // Try to find the linked AIVA task for the real title
        const linked = await ExternalTask.findOne({ googleTaskId: task.id, workspaceId });
        if (linked?.aivaTaskId) {
          const { default: Task } = await import('../models/task.js');
          const aivaTask = await Task.findById(linked.aivaTaskId).lean();
          if (aivaTask?.title) {
            const { decryptDocument } = await import('../utils/encryption.js');
            const decrypted = decryptDocument(aivaTask, ['title', 'description']);
            taskData.title = decrypted.title || 'Untitled Task';
            taskData.description = decrypted.description || '';
            taskData.notes = decrypted.description || '';
            console.log(`[GoogleSync] ✅ Healed title from AIVA task: "${taskData.title}"`);

            // Also patch Google Tasks so the cipher string gets replaced with real title
            try {
              const { google } = await import('googleapis');
              const googleAuthService = (await import('./googleAuthService.js')).default;
              const auth = googleAuthService.getAuthenticatedClient(account.accessToken, account.refreshToken);
              const tasksClient = google.tasks({ version: 'v1', auth });
              await tasksClient.tasks.patch({
                tasklist: taskList.id,
                task: task.id,
                requestBody: { title: taskData.title, notes: taskData.description || '' }
              });
              console.log(`[GoogleSync] ✅ Patched Google task with correct title: "${taskData.title}"`);
            } catch (patchErr) {
              console.warn(`[GoogleSync] Could not patch Google task title:`, patchErr.message);
            }
          }
        } else {
          // No linked AIVA task — skip storing this corrupted record
          console.warn(`[GoogleSync] No linked AIVA task found. Skipping corrupted record.`);
          return false;
        }
      }

      console.log(`[GoogleSync] Storing task data:`, {
        title: taskData.title,
        workspaceId: taskData.workspaceId,
        showInTaskList: taskData.showInTaskList,
        googleTaskId: taskData.googleTaskId
      });

      // Check if task already exists
      const existingTask = await ExternalTask.findOne({
        workspaceId,
        googleTaskId: task.id,
        googleTaskListId: taskList.id
      });

      let result;
      if (existingTask) {
        // Only update if task has actually changed
        const hasChanges =
          existingTask.title !== taskData.title ||
          existingTask.description !== taskData.description ||
          existingTask.status !== taskData.status ||
          (existingTask.dueDate?.toISOString() !== taskData.dueDate?.toISOString());

        if (hasChanges) {
          console.log(`[GoogleSync] Task has changes, updating: ${task.title}`);
          // Use Object.assign + save() so Mongoose pre-save encryption hooks fire
          Object.assign(existingTask, taskData);
          result = await existingTask.save();
        } else {
          console.log(`[GoogleSync] Task unchanged, updating sync time: ${task.title}`);
          existingTask.lastSyncedAt = new Date();
          result = await existingTask.save();
        }
      } else {
        console.log(`[GoogleSync] Creating new task: ${task.title}`);
        result = await ExternalTask.create(taskData);
      }

      console.log(`[GoogleSync] Task stored successfully:`, result._id);

      return true;
    } catch (error) {
      console.error('[GoogleSync] Error storing task:', error.message);
      console.error('[GoogleSync] Stack:', error.stack);
      return false;
    }
  }

  /**
   * Extract Meet link from event
   */
  extractMeetLink(event) {
    // Check conferenceData first
    if (event.conferenceData?.entryPoints) {
      const videoEntry = event.conferenceData.entryPoints.find(
        ep => ep.entryPointType === 'video'
      );
      if (videoEntry) return videoEntry.uri;
    }

    // Check description and location
    const textToSearch = `${event.description || ''} ${event.location || ''}`;

    for (const pattern of this.meetLinkPatterns) {
      const match = textToSearch.match(pattern);
      if (match) return match[0];
    }

    return null;
  }

  /**
   * Detect meeting provider
   */
  detectMeetProvider(link) {
    if (link.includes('meet.google.com') || link.includes('hangouts.google.com')) {
      return 'google-meet';
    }
    if (link.includes('zoom.us')) {
      return 'zoom';
    }
    if (link.includes('teams.microsoft.com')) {
      return 'teams';
    }
    return 'other';
  }

  /**
   * Format attendees
   */
  formatAttendees(attendees) {
    if (!attendees) return [];

    return attendees.map(attendee => ({
      email: attendee.email,
      name: attendee.displayName || attendee.email,
      responseStatus: attendee.responseStatus || 'needsAction',
      isAIVAUser: false // Will be updated separately
    }));
  }

  /**
   * Delete a task from Google Tasks API
   */
  async deleteTaskFromGoogle(task, account) {
    try {
      console.log('[GoogleSync] Deleting task from Google:', task.googleTaskId);

      // Refresh token if needed
      if (googleAuthService.isTokenExpired(account.tokenExpiry)) {
        console.log('[GoogleSync] Token expired, refreshing...');
        const refreshed = await googleAuthService.refreshAccessToken(account.refreshToken);
        account.accessToken = googleAuthService.encrypt(refreshed.accessToken);
        account.tokenExpiry = refreshed.expiryDate;
        // Save the parent integration document
        const integration = await GoogleIntegration.findByWorkspace(task.workspaceId);
        if (integration) {
          await integration.save();
        }
        console.log('[GoogleSync] Token refreshed');
      }

      const auth = googleAuthService.getAuthenticatedClient(
        account.accessToken,
        account.refreshToken
      );

      const tasks = google.tasks({ version: 'v1', auth });

      // First, check if this task has subtasks and delete them
      const subtasks = await ExternalTask.find({
        workspaceId: task.workspaceId,
        googleAccountId: task.googleAccountId,
        parent: task.googleTaskId,
        isDeleted: { $ne: true }
      });

      console.log(`[GoogleSync] Found ${subtasks.length} subtasks to delete`);

      // Delete subtasks from Google first
      for (const subtask of subtasks) {
        try {
          console.log(`[GoogleSync] Deleting subtask: ${subtask.googleTaskId}`);
          await tasks.tasks.delete({
            tasklist: subtask.googleTaskListId,
            task: subtask.googleTaskId
          });

          // Mark subtask as deleted locally
          subtask.isDeleted = true;
          subtask.deletedAt = new Date();
          subtask.syncStatus = 'deleted';
          await subtask.save();
        } catch (error) {
          console.error(`[GoogleSync] Error deleting subtask ${subtask.googleTaskId}:`, error.message);
          // Continue with other subtasks even if one fails
        }
      }

      // Now delete the main task from Google
      await tasks.tasks.delete({
        tasklist: task.googleTaskListId,
        task: task.googleTaskId
      });

      console.log('[GoogleSync] Successfully deleted task from Google:', task.googleTaskId);
      return true;
    } catch (error) {
      console.error('[GoogleSync] Error deleting task from Google:', error.message);
      throw error;
    }
  }
}

export default new GoogleSyncService();
