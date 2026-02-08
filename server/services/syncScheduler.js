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
   ⟁  DOCS : /docs/backend/scheduler.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Classes designed. Methods implemented. Functionality delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


import cron from 'node-cron';
import GoogleIntegration from '../models/googleIntegration.js';
import googleSyncService from './googleSyncService.js';

class SyncScheduler {
  constructor() {
    this.isRunning = false;
    this.syncJobs = new Map();
  }

  /**
   * Start the scheduler (runs every 15 minutes)
   */
  start() {
    if (this.isRunning) {
      console.log('Sync scheduler is already running');
      return;
    }

    console.log('Starting Google sync scheduler...');

    // Run immediately on startup
    this.runSyncCycle().catch(err => {
      console.error('Initial sync cycle error:', err);
    });

    // Schedule to run every 15 minutes
    this.job = cron.schedule('*/15 * * * *', async () => {
      await this.runSyncCycle();
    });

    this.isRunning = true;
    console.log('Google sync scheduler started (runs every 2 minutes)');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.isRunning = false;
      console.log('Google sync scheduler stopped');
    }
  }

  /**
   * Run a full sync cycle for all active accounts
   */
  async runSyncCycle() {
    try {
      console.log('[Sync Scheduler] Starting sync cycle...');
      const startTime = Date.now();

      // Get all integrations with active accounts
      const integrations = await GoogleIntegration.find({
        'accounts.status': 'active'
      });

      if (integrations.length === 0) {
        console.log('[Sync Scheduler] No active integrations found');
        return;
      }

      let totalSynced = 0;
      let totalErrors = 0;

      // Sync each integration's accounts
      for (const integration of integrations) {
        const activeAccounts = integration.accounts.filter(
          acc => acc.status === 'active'
        );

        for (const account of activeAccounts) {
          try {
            await this.syncAccount(integration.workspaceId, account.accountId);
            totalSynced++;
          } catch (error) {
            console.error(
              `[Sync Scheduler] Error syncing account ${account.googleEmail}:`,
              error.message
            );
            totalErrors++;
          }
        }
      }

      const duration = Date.now() - startTime;
      console.log(
        `[Sync Scheduler] Cycle complete: ${totalSynced} accounts synced, ` +
        `${totalErrors} errors, took ${(duration / 1000).toFixed(2)}s`
      );
    } catch (error) {
      console.error('[Sync Scheduler] Sync cycle error:', error);
    }
  }

  /**
   * Sync a single account
   */
  async syncAccount(workspaceId, accountId) {
    const integration = await GoogleIntegration.findByWorkspace(workspaceId);
    if (!integration) return;

    const account = integration.getAccountById(accountId);
    if (!account || account.status !== 'active') return;

    // Check if already syncing
    const syncKey = `${workspaceId}-${accountId}`;
    if (this.syncJobs.has(syncKey)) {
      console.log(`[Sync Scheduler] Account ${account.googleEmail} already syncing, skipping`);
      return;
    }

    this.syncJobs.set(syncKey, true);

    try {
      const results = {
        calendar: null,
        tasks: null
      };

      // Sync calendar if enabled
      if (account.syncSettings.calendar.enabled) {
        try {
          results.calendar = await googleSyncService.syncCalendarEvents(
            workspaceId,
            accountId
          );
        } catch (error) {
          console.error(
            `[Sync Scheduler] Calendar sync error for ${account.googleEmail}:`,
            error.message
          );
          results.calendar = { success: false, error: error.message };
        }
      }

      // Sync tasks if enabled
      if (account.syncSettings.tasks.enabled) {
        try {
          results.tasks = await googleSyncService.syncTasks(
            workspaceId,
            accountId
          );
        } catch (error) {
          console.error(
            `[Sync Scheduler] Tasks sync error for ${account.googleEmail}:`,
            error.message
          );
          results.tasks = { success: false, error: error.message };
        }
      }

      console.log(
        `[Sync Scheduler] Synced ${account.googleEmail}: ` +
        `Calendar: ${results.calendar?.syncedCount || 0} events, ` +
        `Tasks: ${results.tasks?.syncedCount || 0} tasks`
      );

      return results;
    } finally {
      this.syncJobs.delete(syncKey);
    }
  }

  /**
   * Trigger immediate sync for specific account
   */
  async syncNow(workspaceId, accountId) {
    console.log(`[Sync Scheduler] Triggering immediate sync for account ${accountId}`);
    return await this.syncAccount(workspaceId, accountId);
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeSyncs: this.syncJobs.size,
      syncKeys: Array.from(this.syncJobs.keys())
    };
  }
}

// Export singleton instance
const syncScheduler = new SyncScheduler();
export default syncScheduler;
