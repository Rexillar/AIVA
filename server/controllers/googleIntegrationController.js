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
   ⟁  DOMAIN       : API CONTROLLERS

   ⟁  PURPOSE      : Integrate with Google services and sync data

   ⟁  WHY          : Unified external service integration

   ⟁  WHAT         : Google API integration and data synchronization

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : OAuth 2.0
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/controllers.md

   ⟁  USAGE RULES  : Validate inputs • Handle errors • Log activities

        "Services integrated. Data synchronized. Ecosystems unified."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import GoogleIntegration from '../models/googleIntegration.js';
import ExternalCalendarEvent from '../models/externalCalendarEvent.js';
import ExternalTask from '../models/externalTask.js';
import { Workspace } from '../models/workspace.js';
import googleAuthService from '../services/googleAuthService.js';
import googleSyncService from '../services/googleSyncService.js';
import mongoose from 'mongoose';
import { google } from 'googleapis';
import fetch from 'node-fetch';

/**
 * @desc    Get Google OAuth URL
 * @route   POST /api/google/auth-url
 * @access  Private
 */
export const getAuthUrl = async (req, res) => {
  try {
    const { workspaceId, scopes } = req.body;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      console.log('Workspace not found:', workspaceId);
      return res.status(404).json({ error: 'Workspace not found' });
    }

    console.log('Checking access - userId:', userId, 'workspace members:', workspace.members.map(m => ({ userId: m.userId, role: m.role })));

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      console.log('Access denied - user not found in members');
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate scopes
    const requestedScopes = scopes || ['calendar', 'tasks', 'meet'];
    if (!googleAuthService.validateScopes(requestedScopes)) {
      return res.status(400).json({ error: 'Invalid scopes' });
    }

    const scopeUrls = googleAuthService.getScopeUrls(requestedScopes);
    const authUrl = googleAuthService.getAuthUrl(workspaceId, userId, scopeUrls);

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
};

/**
 * @desc    Handle OAuth callback
 * @route   GET /api/google/callback
 * @access  Public (called by Google)
 */
export const handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query; // GET request uses query params

    if (!code || !state) {
      return res.status(400).send('<h1>Error: Missing authorization code</h1>');
    }

    // Decode state
    const { workspaceId, userId } = JSON.parse(
      Buffer.from(state, 'base64').toString('utf-8')
    );

    console.log('OAuth callback - decoded state:', { workspaceId, userId, userIdType: typeof userId });

    // Exchange code for tokens
    const { tokens, userInfo } = await googleAuthService.handleCallback(code);

    // Encrypt tokens
    const encryptedTokens = {
      accessToken: googleAuthService.encrypt(tokens.accessToken),
      refreshToken: googleAuthService.encrypt(tokens.refreshToken),
      tokenExpiry: tokens.expiryDate
    };

    // Find or create integration
    let integration = await GoogleIntegration.findByWorkspace(workspaceId);

    if (!integration) {
      integration = new GoogleIntegration({
        workspaceId,
        connectedBy: new mongoose.Types.ObjectId(userId), // Required at integration level
        accounts: []
      });
    }

    // Check if account already exists
    const existingAccount = integration.accounts.find(
      acc => acc.googleEmail === userInfo.email
    );

    if (existingAccount) {
      // Update existing account
      existingAccount.accessToken = encryptedTokens.accessToken;
      existingAccount.refreshToken = encryptedTokens.refreshToken;
      existingAccount.tokenExpiry = encryptedTokens.tokenExpiry;
      existingAccount.status = 'active';
      existingAccount.googleDisplayName = userInfo.name;
      existingAccount.googleProfilePicture = userInfo.picture;
    } else {
      // Add new account
      const newAccount = {
        accountId: `google-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        googleEmail: userInfo.email,
        googleDisplayName: userInfo.name,
        googleProfilePicture: userInfo.picture,
        accessToken: encryptedTokens.accessToken,
        refreshToken: encryptedTokens.refreshToken,
        tokenExpiry: encryptedTokens.tokenExpiry,
        scopes: ['calendar', 'tasks', 'meet'],
        status: 'active',
        connectedBy: new mongoose.Types.ObjectId(userId),
        syncSettings: {
          calendar: {
            enabled: true,
            syncDirection: 'read-only',
            selectedCalendars: [{ id: 'primary', name: 'Primary' }],
            colorCode: '#4285F4'
          },
          tasks: {
            enabled: false,
            syncDirection: 'read-only',
            selectedLists: [],
            showInAIVA: false
          },
          meet: {
            enabled: true,
            autoJoinEnabled: false
          }
        }
      };

      console.log('Adding new account with connectedBy:', newAccount.connectedBy);
      integration.accounts.push(newAccount);
    }

    console.log('Before save - integration:', JSON.stringify(integration.toObject(), null, 2));
    await integration.save();

    // Trigger initial sync
    const accountId = existingAccount?.accountId || integration.accounts[integration.accounts.length - 1].accountId;

    // Don't await - run in background
    googleSyncService.syncCalendarEvents(workspaceId, accountId).catch(err => {
      console.error('Initial sync error:', err);
    });

    // Send HTML that closes the popup and notifies parent
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Google Account Connected</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
          .success-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 { margin: 0 0 10px 0; font-size: 28px; }
          p { margin: 10px 0; font-size: 16px; opacity: 0.9; }
          .email { font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Successfully Connected!</h1>
          <p class="email">${userInfo.email}</p>
          <p>This window will close automatically...</p>
        </div>
        <script>
          // Send success message to parent window
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'GOOGLE_AUTH_SUCCESS',
              account: {
                accountId: '${accountId}',
                email: '${userInfo.email}',
                name: '${userInfo.name}',
                picture: '${userInfo.picture}'
              }
            }, '${process.env.CLIENT_URL}');
          }
          // Close window after 2 seconds
          setTimeout(() => window.close(), 2000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Connection Failed</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
          }
          .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
          .error-icon { font-size: 64px; margin-bottom: 20px; }
          h1 { margin: 0 0 10px 0; font-size: 28px; }
          p { margin: 10px 0; font-size: 16px; opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">❌</div>
          <h1>Connection Failed</h1>
          <p>${error.message || 'Failed to connect Google account'}</p>
          <p>This window will close automatically...</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'GOOGLE_AUTH_ERROR',
              error: '${error.message || 'Connection failed'}'
            }, '${process.env.CLIENT_URL}');
          }
          setTimeout(() => window.close(), 3000);
        </script>
      </body>
      </html>
    `);
  }
};

/**
 * @desc    Get all connected Google accounts for workspace
 * @route   GET /api/google/accounts/:workspaceId
 * @access  Private
 */
export const getAccounts = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const integration = await GoogleIntegration.findByWorkspace(workspaceId);

    if (!integration) {
      return res.json({ accounts: [] });
    }

    // Remove sensitive data
    const accounts = integration.accounts.map(acc => ({
      accountId: acc.accountId,
      email: acc.googleEmail,
      displayName: acc.googleDisplayName,
      profilePicture: acc.googleProfilePicture,
      status: acc.status,
      scopes: acc.scopes,
      syncSettings: acc.syncSettings,
      lastSync: acc.lastSync,
      connectedAt: acc.connectedAt,
      syncErrors: acc.syncErrors.slice(-3) // Last 3 errors
    }));

    res.json({ accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

/**
 * @desc    Update account sync settings
 * @route   PATCH /api/google/accounts/:workspaceId/:accountId
 * @access  Private
 */
export const updateAccountSettings = async (req, res) => {
  try {
    const { workspaceId, accountId } = req.params;
    const { syncSettings } = req.body;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const member = workspace.members.find(m => m.user && m.user.toString() === userId);
    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const integration = await GoogleIntegration.findByWorkspace(workspaceId);
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const account = integration.getAccountById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Only owner/admin or the user who connected can modify
    const canModify = ['owner', 'admin'].includes(member.role) ||
      (account.connectedBy && account.connectedBy.toString() === userId);

    if (!canModify) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Update sync settings
    if (syncSettings) {
      account.syncSettings = {
        ...account.syncSettings,
        ...syncSettings
      };
    }

    await integration.save();

    res.json({
      success: true,
      message: 'Account settings updated',
      account: {
        accountId: account.accountId,
        syncSettings: account.syncSettings
      }
    });
  } catch (error) {
    console.error('Error updating account settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

/**
 * @desc    Disconnect Google account
 * @route   DELETE /api/google/accounts/:workspaceId/:accountId
 * @access  Private
 */
export const disconnectAccount = async (req, res) => {
  try {
    const { workspaceId, accountId } = req.params;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const member = workspace.members.find(m => m.user && m.user.toString() === userId);
    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const integration = await GoogleIntegration.findByWorkspace(workspaceId);
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    const account = integration.getAccountById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Only owner/admin or the user who connected can disconnect
    const canDisconnect = ['owner', 'admin'].includes(member.role) ||
      (account.connectedBy && account.connectedBy.toString() === userId);

    if (!canDisconnect) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Revoke token
    await googleAuthService.revokeToken(account.accessToken);

    // Remove account
    await integration.removeAccount(accountId);

    // Delete associated data
    await ExternalCalendarEvent.deleteMany({ workspaceId, googleAccountId: accountId });
    await ExternalTask.deleteMany({ workspaceId, googleAccountId: accountId });

    res.json({
      success: true,
      message: 'Google account disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
};

/**
 * @desc    Trigger manual sync
 * @route   POST /api/google/sync/:workspaceId/:accountId
 * @access  Private
 */
export const triggerSync = async (req, res) => {
  try {
    const { workspaceId, accountId } = req.params;
    const { syncType } = req.body; // 'calendar' | 'tasks' | 'both'
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const results = {};

    if (syncType === 'calendar' || syncType === 'both') {
      results.calendar = await googleSyncService.syncCalendarEvents(workspaceId, accountId);
    }

    if (syncType === 'tasks' || syncType === 'both') {
      results.tasks = await googleSyncService.syncTasks(workspaceId, accountId);
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Manual sync error:', error);
    res.status(500).json({ error: error.message || 'Sync failed' });
  }
};

/**
 * @desc    Get external calendar events
 * @route   GET /api/google/events/:workspaceId
 * @access  Private
 */
export const getExternalEvents = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { startDate, endDate, source } = req.query;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const query = {
      workspaceId,
      isDeleted: false
    };

    if (source) {
      query.source = source;
    }

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const events = await ExternalCalendarEvent.find(query)
      .sort({ startTime: 1 })
      .select('-__v');

    // Get Google integration to add account info
    const integration = await GoogleIntegration.findOne({ workspaceId });

    // Enrich events with Google account information
    const enrichedEvents = events.map(event => {
      const eventObj = event.toObject();

      if (eventObj.googleAccountId && integration) {
        const account = integration.getAccountById(eventObj.googleAccountId);
        if (account) {
          eventObj.accountEmail = account.googleEmail;
          eventObj.accountName = account.googleDisplayName || account.accountName;
          eventObj.accountAvatar = account.googleProfilePicture || account.accountPhoto;
        }
      }

      return eventObj;
    });

    res.json({ events: enrichedEvents });
  } catch (error) {
    console.error('Error fetching external events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

/**
 * @desc    Get sync status
 * @route   GET /api/google/sync-status/:workspaceId
 * @access  Private
 */
export const getSyncStatus = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const status = await googleSyncService.getSyncStatus(workspaceId);

    res.json(status);
  } catch (error) {
    console.error('Error fetching sync status:', error);
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
};

/**
 * @desc    Get external tasks directly from Google Tasks API
 * @route   GET /api/google/tasks/:workspaceId
 * @access  Private
 */
export const getExternalTasks = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { status, accountId } = req.query;
    const userId = req.user._id.toString();

    // This endpoint proxies live Google Tasks data; never serve from cache.
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'Surrogate-Control': 'no-store'
    });

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get Google integration for this workspace
    const integration = await GoogleIntegration.findOne({ workspaceId });
    if (!integration) {
      console.log('[getExternalTasks] No Google integration found');
      return res.json({ tasks: [] });
    }

    // Get all active accounts
    const activeAccounts = integration.accounts.filter(
      acc => acc.status === 'active' && acc.syncSettings.tasks.enabled
    );

    if (activeAccounts.length === 0) {
      console.log('[getExternalTasks] No active accounts with task sync enabled');
      return res.json({ tasks: [] });
    }

    const allTasks = [];

    // Fetch tasks directly from Google for each account
    for (const account of activeAccounts) {
      if (accountId && account.accountId !== accountId) {
        continue; // Skip if filtering by specific account
      }

      const accountLabel =
        account.email ||
        account.emailAddress ||
        account.userEmail ||
        account.accountEmail ||
        account.accountId;

      try {
        // Refresh token if expired
        if (googleAuthService.isTokenExpired(account.tokenExpiry)) {
          console.log('[getExternalTasks] Token expired, refreshing...');
          const refreshed = await googleAuthService.refreshAccessToken(account.refreshToken);
          account.accessToken = googleAuthService.encrypt(refreshed.accessToken);
          account.tokenExpiry = refreshed.expiryDate;
          await integration.save();
        }

        const auth = googleAuthService.getAuthenticatedClient(
          account.accessToken,
          account.refreshToken
        );

        const tasks = google.tasks({ version: 'v1', auth });

        // Get all task lists
        const listsResponse = await tasks.tasklists.list();

        if (listsResponse.data.items) {
          for (const list of listsResponse.data.items) {
            // Fetch tasks from this list
            const tasksResponse = await tasks.tasks.list({
              tasklist: list.id,
              showCompleted: true,
              showHidden: false
            });

            if (tasksResponse.data.items) {
              for (const task of tasksResponse.data.items) {
                // Apply status filter if provided
                const taskStatus = task.status === 'completed' ? 'completed' : 'needsAction';
                if (status && taskStatus !== status) {
                  continue;
                }

                // Transform Google task to our format
                allTasks.push({
                  _id: task.id, // Use Google task ID as _id
                  source: 'google-tasks',
                  googleAccountId: account.accountId,
                  googleTaskId: task.id,
                  googleTaskListId: list.id,
                  googleTaskListName: list.title,

                  // Google Account info for avatar display
                  googleAccount: {
                    accountId: account.accountId,
                    email: account.googleEmail,
                    name: account.googleDisplayName,
                    avatar: account.googleProfilePicture,
                    picture: account.googleProfilePicture // Alternative field name
                  },

                  title: task.title || 'Untitled Task',
                  description: task.notes || '',
                  dueDate: task.due ? new Date(task.due) : null,
                  completedDate: task.completed ? new Date(task.completed) : null,
                  status: taskStatus,

                  notes: task.notes || '',
                  parent: task.parent,
                  position: task.position,
                  links: task.links || [],

                  colorCode: account.syncSettings.calendar?.colorCode || '#4285F4',

                  isReadOnly: account.syncSettings.tasks.syncDirection === 'read-only',
                  canEdit: account.syncSettings.tasks.syncDirection === 'bidirectional',
                  canDelete: account.syncSettings.tasks.syncDirection === 'bidirectional',

                  workspaceId: workspaceId
                });
              }
            }
          }
        }

        console.log(`[getExternalTasks] Fetched ${allTasks.length} tasks from ${accountLabel}`);
      } catch (error) {
        console.error(`[getExternalTasks] Error fetching tasks for ${accountLabel}:`, error.message);
        // Continue with other accounts even if one fails
      }
    }

    // Sort tasks by due date
    allTasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    // Get linked AIVA task IDs to help frontend deduplication
    const syncedExternalTasks = await ExternalTask.find({
      workspaceId,
      aivaTaskId: { $exists: true, $ne: null }
    }).select('googleTaskId aivaTaskId');

    // Create a map of Google Task ID to AIVA Task ID
    const googleToAivaMap = new Map();
    syncedExternalTasks.forEach(et => {
      googleToAivaMap.set(et.googleTaskId, et.aivaTaskId);
    });

    // Add aivaTaskId to the tasks so frontend can hide the duplicate AIVA task
    const tasksWithLinks = allTasks.map(task => ({
      ...task,
      aivaTaskId: googleToAivaMap.get(task.googleTaskId) || null
    }));

    console.log(`[getExternalTasks] Returning ${tasksWithLinks.length} tasks from Google`);

    res.status(200).json({ tasks: tasksWithLinks });
  } catch (error) {
    console.error('Error fetching external tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

/**
 * @desc    Update external Google Task directly via API
 * @route   PUT /api/google/tasks/:workspaceId/:taskId
 * @access  Private
 */
export const updateExternalTask = async (req, res) => {
  try {
    const { workspaceId, taskId } = req.params;
    const { title, notes, dueDate, status, googleAccountId, googleTaskListId } = req.body;
    const userId = req.user._id.toString();

    console.log('[updateExternalTask] Updating task:', { taskId, googleAccountId, googleTaskListId });

    if (!googleAccountId || !googleTaskListId) {
      return res.status(400).json({
        error: 'Missing required fields: googleAccountId and googleTaskListId'
      });
    }

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get Google integration
    const integration = await GoogleIntegration.findOne({ workspaceId });
    if (!integration) {
      return res.status(404).json({ error: 'Google integration not found' });
    }

    // Find the account
    const account = integration.accounts.find(acc => acc.accountId === googleAccountId);
    if (!account) {
      return res.status(404).json({ error: 'Google account not found' });
    }

    // Refresh token if expired
    if (googleAuthService.isTokenExpired(account.tokenExpiry)) {
      console.log('[updateExternalTask] Token expired, refreshing...');
      const refreshed = await googleAuthService.refreshAccessToken(account.refreshToken);
      account.accessToken = googleAuthService.encrypt(refreshed.accessToken);
      account.tokenExpiry = refreshed.expiryDate;
      await integration.save();
    }

    const auth = googleAuthService.getAuthenticatedClient(
      account.accessToken,
      account.refreshToken
    );

    const tasks = google.tasks({ version: 'v1', auth });

    // Build update payload
    const updatePayload = {};
    if (title !== undefined) updatePayload.title = title;
    if (notes !== undefined) updatePayload.notes = notes;
    if (status !== undefined) updatePayload.status = status;
    if (dueDate !== undefined) {
      // Handle empty string, null, or valid date
      if (!dueDate || dueDate === '') {
        updatePayload.due = null;
      } else {
        updatePayload.due = new Date(dueDate).toISOString();
      }
    }

    console.log('[updateExternalTask] Update payload:', updatePayload);

    // Update task directly in Google Tasks using patch
    const updatedTask = await tasks.tasks.patch({
      tasklist: googleTaskListId,
      task: taskId,
      requestBody: updatePayload
    });

    console.log('[updateExternalTask] Task updated successfully in Google');

    // Return the updated task in our format
    const taskResponse = {
      _id: updatedTask.data.id,
      source: 'google-tasks',
      googleAccountId,
      googleTaskId: updatedTask.data.id,
      googleTaskListId,

      title: updatedTask.data.title || 'Untitled Task',
      description: updatedTask.data.notes || '',
      notes: updatedTask.data.notes || '',
      dueDate: updatedTask.data.due ? new Date(updatedTask.data.due) : null,
      completedDate: updatedTask.data.completed ? new Date(updatedTask.data.completed) : null,
      status: updatedTask.data.status === 'completed' ? 'completed' : 'needsAction',

      colorCode: '#4285F4',
      canEdit: true,
      canDelete: true,
      workspaceId
    };

    res.json({
      success: true,
      task: taskResponse,
      message: 'Task updated successfully in Google Tasks'
    });
  } catch (error) {
    console.error('Error updating external task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

/**
 * @desc    Delete external Google Task directly via API
 * @route   DELETE /api/google/tasks/:workspaceId/:taskId
 * @access  Private
 */
export const deleteExternalTask = async (req, res) => {
  try {
    const { workspaceId, taskId } = req.params;
    const { googleAccountId, googleTaskListId } = req.query;
    const userId = req.user._id.toString();

    console.log('[deleteExternalTask] Deleting task:', { taskId, googleAccountId, googleTaskListId });

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!googleAccountId || !googleTaskListId) {
      return res.status(400).json({ error: 'Missing required parameters: googleAccountId and googleTaskListId' });
    }

    // Get Google integration
    const integration = await GoogleIntegration.findOne({ workspaceId });
    if (!integration) {
      return res.status(404).json({ error: 'Google integration not found' });
    }

    // Find the account
    const account = integration.accounts.find(acc => acc.accountId === googleAccountId);
    if (!account) {
      return res.status(404).json({ error: 'Google account not found' });
    }

    // Refresh token if expired
    if (googleAuthService.isTokenExpired(account.tokenExpiry)) {
      console.log('[deleteExternalTask] Token expired, refreshing...');
      const refreshed = await googleAuthService.refreshAccessToken(account.refreshToken);
      account.accessToken = googleAuthService.encrypt(refreshed.accessToken);
      account.tokenExpiry = refreshed.expiryDate;
      await integration.save();
    }

    const auth = googleAuthService.getAuthenticatedClient(
      account.accessToken,
      account.refreshToken
    );

    const tasks = google.tasks({ version: 'v1', auth });

    // Delete task directly from Google Tasks
    await tasks.tasks.delete({
      tasklist: googleTaskListId,
      task: taskId
    });

    console.log('[deleteExternalTask] Task deleted from Google:', taskId);

    // Also mark the task as deleted/trashed in the local AIVA database
    try {
      const ExternalTask = (await import('../models/externalTask.js')).default;

      // Update with isTrash=true to ensure proper UI handling
      const updatedTask = await ExternalTask.findOneAndUpdate(
        {
          workspaceId,
          googleTaskId: taskId,
          googleAccountId
        },
        {
          isDeleted: true,
          isTrash: true, // Mark as trash so it can be recovered if needed
          deletedAt: new Date(),
          syncStatus: 'deleted',
          status: 'deleted' // Ensure status reflects deletion
        },
        { new: true }
      );

      if (updatedTask) {
        console.log('[deleteExternalTask] Task marked as trash in AIVA database:', updatedTask._id);
      } else {
        console.log('[deleteExternalTask] No local AIVA task found to mark as trash for Google Task:', taskId);
      }
    } catch (dbError) {
      console.warn('[deleteExternalTask] Failed to update local database:', dbError.message);
      // Don't fail the entire operation if local update fails
    }

    res.json({
      success: true,
      message: 'Task deleted successfully from Google Tasks'
    });
  } catch (error) {
    console.error('Error deleting external task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

/**
 * Helper function to get decrypted tokens for an integration
 */
const getTokensForIntegration = async (integration) => {
  const googleAuthService = (await import('../services/googleAuthService.js')).default;

  return {
    access_token: googleAuthService.decrypt(integration.accessToken),
    refresh_token: googleAuthService.decrypt(integration.refreshToken),
    scope: integration.scope,
    token_type: 'Bearer'
  };
};

/**
 * Helper function to get decrypted tokens for a specific account
 */
const getTokensForAccount = async (account) => {
  const googleAuthService = (await import('../services/googleAuthService.js')).default;

  return {
    access_token: googleAuthService.decrypt(account.accessToken),
    refresh_token: googleAuthService.decrypt(account.refreshToken),
    scope: account.scopes?.join(' ') || '',
    token_type: 'Bearer'
  };
};

/**
 * Helper function to push task updates back to Google Tasks
 */
const pushTaskUpdateToGoogle = async (task, integration, account) => {
  try {
    console.log('[pushTaskUpdateToGoogle] Syncing task to Google:', task.title);

    // ❌ CRITICAL VALIDATION - Fail fast if missing Google IDs
    if (!task.googleTaskId) {
      throw new Error(`Cannot sync task "${task.title}": missing Google task ID`);
    }
    if (!task.googleTaskListId) {
      throw new Error(`Cannot sync task "${task.title}": missing Google task list ID`);
    }

    console.log('[pushTaskUpdateToGoogle] Task IDs:', {
      googleTaskId: task.googleTaskId,
      googleTaskListId: task.googleTaskListId,
      title: task.title
    });

    // Get fresh tokens for this account
    const tokens = await getTokensForAccount(account);

    // Use the same OAuth2 client setup as the sync service
    const auth = googleAuthService.getAuthenticatedClient(
      tokens.access_token,
      tokens.refresh_token
    );
    const tasksService = google.tasks({ version: 'v1', auth });

    // Prepare task data for Google Tasks API
    const googleTaskData = {
      title: task.title,
      notes: task.description || task.notes || '',
      status: task.status === 'completed' ? 'completed' : 'needsAction'
    };

    // Add due date if present
    if (task.dueDate) {
      // Google Tasks expects RFC 3339 format for due date (date only, no time)
      const dueDate = new Date(task.dueDate);
      googleTaskData.due = dueDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
    }

    console.log('[pushTaskUpdateToGoogle] API call params:', {
      tasklist: task.googleTaskListId,
      task: task.googleTaskId,
      requestBody: googleTaskData
    });

    // ✅ Try both parameter structures for googleapis client
    let updateParams = {
      tasklist: task.googleTaskListId,
      task: task.googleTaskId,
      requestBody: googleTaskData  // First try 'requestBody'
    };

    console.log('[pushTaskUpdateToGoogle] Attempting update with googleapis client...');

    // Try both approaches - first with googleapis client, then with direct HTTP if needed
    let response;
    try {
      // Method 1: Standard googleapis client with requestBody
      console.log('[pushTaskUpdateToGoogle] Trying googleapis client method with requestBody...');
      response = await tasksService.tasks.update(updateParams);
      console.log('[pushTaskUpdateToGoogle] Client method succeeded!');
    } catch (clientError) {
      console.log('[pushTaskUpdateToGoogle] requestBody failed, trying resource...', clientError.message);

      // Try with 'resource' parameter instead
      updateParams = {
        tasklist: task.googleTaskListId,
        task: task.googleTaskId,
        resource: googleTaskData
      };

      try {
        response = await tasksService.tasks.update(updateParams);
        console.log('[pushTaskUpdateToGoogle] Client method with resource succeeded!');
      } catch (clientError2) {
        console.log('[pushTaskUpdateToGoogle] Both client methods failed, trying direct HTTP...');
        console.log('[pushTaskUpdateToGoogle] Last error:', clientError2.message);

        // Method 2: Direct HTTP request as fallback
        const taskListId = encodeURIComponent(task.googleTaskListId);
        const taskId = encodeURIComponent(task.googleTaskId);
        const updateUrl = `https://www.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`;

        console.log('[pushTaskUpdateToGoogle] Using URL:', updateUrl);
        console.log('[pushTaskUpdateToGoogle] Request body:', JSON.stringify(googleTaskData, null, 2));

        try {
          const response = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${tokens.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(googleTaskData)
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[pushTaskUpdateToGoogle] HTTP Error Response:', errorText);

            // Try with PATCH method instead of PUT
            console.log('[pushTaskUpdateToGoogle] Trying PATCH method...');
            const patchResponse = await fetch(updateUrl, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(googleTaskData)
            });

            if (patchResponse.ok) {
              const result = await patchResponse.json();
              console.log('[pushTaskUpdateToGoogle] PATCH method succeeded!');
              return result;
            } else {
              const patchErrorText = await patchResponse.text();
              console.error('[pushTaskUpdateToGoogle] PATCH also failed:', patchErrorText);
              throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
          }

          const result = await response.json();
          console.log('[pushTaskUpdateToGoogle] HTTP method succeeded!');
          return result;
        } catch (httpError) {
          console.error('[pushTaskUpdateToGoogle] HTTP method also failed:', httpError.message);
          throw httpError;
        }
      }
    }

    console.log('[pushTaskUpdateToGoogle] Google API response:', response.status);

    // Update sync status
    task.syncStatus = 'synced';
    task.lastSyncedAt = new Date();
    await task.save();

    console.log('[pushTaskUpdateToGoogle] Successfully synced to Google:', task.title);
  } catch (error) {
    console.error('[pushTaskUpdateToGoogle] Error:', error.message);
    throw error;
  }
};

/**
 * Helper function to fetch latest Google task data
 */
const fetchLatestGoogleTask = async (taskListId, taskId, account) => {
  try {
    const tokens = await getTokensForAccount(account);
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials(tokens);
    const tasksService = google.tasks({ version: 'v1', auth: oauth2Client });

    const response = await tasksService.tasks.get({
      tasklist: taskListId,
      task: taskId
    });

    return response.data;
  } catch (error) {
    console.error('[fetchLatestGoogleTask] Error:', error.message);
    return null;
  }
};

/**
 * Helper function to detect conflicts between AIVA and Google versions
 */
const hasConflict = (aivaTask, googleTask) => {
  // Check if Google task was modified after our last sync
  const googleUpdated = new Date(googleTask.updated);
  const lastSync = new Date(aivaTask.lastSyncedAt || 0);

  if (googleUpdated <= lastSync) {
    return false; // Google task hasn't changed since last sync
  }

  // Check for actual content differences
  const titleDiff = aivaTask.title !== googleTask.title;
  const notesDiff = (aivaTask.notes || aivaTask.description || '') !== (googleTask.notes || '');
  const statusDiff = aivaTask.status !== googleTask.status;
  const dueDiff = aivaTask.dueDate?.toISOString() !== googleTask.due;

  return titleDiff || notesDiff || statusDiff || dueDiff;
};

/**
 * Proxy Google profile images to bypass CORS restrictions
 */
export const proxyProfileImage = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || !url.startsWith('https://lh3.googleusercontent.com')) {
      return res.status(400).json({ error: 'Invalid image URL' });
    }

    // Fetch the image from Google
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch image' });
    }

    // Get the image buffer
    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Set appropriate headers
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Send the image
    res.send(buffer);
  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).json({ error: 'Failed to proxy image' });
  }
};

/**
 * Clean up stale calendar events that no longer exist in Google Calendar
 */
export const cleanupStaleEvents = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id.toString();

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    if (!workspace.members.some(m => m.user && m.user.toString() === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get Google integration
    const integration = await GoogleIntegration.findOne({ workspaceId });
    if (!integration) {
      return res.json({ message: 'No Google integration found', deletedCount: 0 });
    }

    const activeAccounts = integration.accounts.filter(
      acc => acc.status === 'active' && acc.syncSettings.calendar.enabled
    );

    if (activeAccounts.length === 0) {
      return res.json({ message: 'No active Google accounts', deletedCount: 0 });
    }

    let totalDeleted = 0;

    // For each account, fetch events from Google and compare with local DB
    for (const account of activeAccounts) {
      try {
        // Refresh token if expired
        if (googleAuthService.isTokenExpired(account.tokenExpiry)) {
          const refreshed = await googleAuthService.refreshAccessToken(account.refreshToken);
          account.accessToken = googleAuthService.encrypt(refreshed.accessToken);
          account.tokenExpiry = refreshed.expiryDate;
          await integration.save();
        }

        const auth = googleAuthService.getAuthenticatedClient(
          account.accessToken,
          account.refreshToken
        );

        const calendar = google.calendar({ version: 'v3', auth });

        // Get events from Google Calendar for the next 3 months
        const now = new Date();
        const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

        const response = await calendar.events.list({
          calendarId: 'primary',
          timeMin: now.toISOString(),
          timeMax: threeMonthsLater.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        });

        const googleEventIds = new Set(
          response.data.items?.map(event => event.id) || []
        );

        // Find local events for this account
        const localEvents = await ExternalCalendarEvent.find({
          workspaceId,
          googleAccountId: account.accountId,
          source: 'google_calendar',
          isDeleted: false
        });

        // Delete events that don't exist in Google anymore
        const eventsToDelete = localEvents.filter(
          event => !googleEventIds.has(event.googleEventId)
        );

        if (eventsToDelete.length > 0) {
          const deleteResult = await ExternalCalendarEvent.deleteMany({
            _id: { $in: eventsToDelete.map(e => e._id) }
          });

          totalDeleted += deleteResult.deletedCount;
          console.log(`[cleanupStaleEvents] Deleted ${deleteResult.deletedCount} stale events for account ${account.googleEmail}`);
        }
      } catch (accountError) {
        console.error(`[cleanupStaleEvents] Error processing account ${account.googleEmail}:`, accountError.message);
        // Continue with other accounts
      }
    }

    res.json({
      success: true,
      message: `Cleanup completed. Removed ${totalDeleted} stale event(s).`,
      deletedCount: totalDeleted
    });
  } catch (error) {
    console.error('Error cleaning up stale events:', error);
    res.status(500).json({ error: 'Failed to cleanup stale events' });
  }
};

export default {
  getAuthUrl,
  handleCallback,
  getAccounts,
  updateAccountSettings,
  disconnectAccount,
  triggerSync,
  getExternalEvents,
  getSyncStatus,
  getExternalTasks,
  updateExternalTask,
  deleteExternalTask,
  proxyProfileImage,
  cleanupStaleEvents
};
