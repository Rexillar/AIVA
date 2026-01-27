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
   ⟁  DOMAIN       : DEVELOPMENT TOOLS

   ⟁  PURPOSE      : Debug and test system functionality

   ⟁  WHY          : Ensure code quality and troubleshoot issues

   ⟁  WHAT         : Development utilities and testing scripts

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : LOW
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Run in development • Debug issues • Test functionality

        "Code tested. Issues debugged. Quality ensured."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


/*=================================================================
* Test Google Tasks Sync
*=================================================================*/

import mongoose from 'mongoose';
import GoogleIntegration from './models/googleIntegration.js';
import ExternalTask from './models/externalTask.js';
import googleSyncService from './services/googleSyncService.js';
import dotenv from 'dotenv';

dotenv.config();

const WORKSPACE_ID = '695f7e33fd49e1c3254a6bce';

async function testSync() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');
    
    // Get integration
    console.log('Fetching Google integration...');
    const integration = await GoogleIntegration.findOne({ workspace: WORKSPACE_ID });
    
    if (!integration) {
      console.log('✗ No integration found');
      process.exit(1);
    }
    
    console.log('✓ Integration found');
    console.log(`  - ID: ${integration._id}`);
    console.log(`  - Accounts: ${integration.accounts.length}`);
    
    // Check each account
    for (const account of integration.accounts) {
      console.log(`\n--- Account: ${account.googleEmail} ---`);
      console.log(`  - Status: ${account.status}`);
      console.log(`  - Account ID: ${account.accountId}`);
      console.log(`  - Token Expiry: ${account.tokenExpiry}`);
      console.log(`  - Tasks Sync Enabled: ${account.syncSettings.tasks.enabled}`);
      console.log(`  - Show in AIVA: ${account.syncSettings.tasks.showInAIVA}`);
      console.log(`  - Selected Lists: ${JSON.stringify(account.syncSettings.tasks.selectedLists)}`);
      
      if (account.status === 'active' && account.syncSettings.tasks.enabled) {
        console.log('\n  Attempting to sync tasks...');
        try {
          const result = await googleSyncService.syncTasks(WORKSPACE_ID, account.accountId);
          console.log('  ✓ Sync Result:', result);
        } catch (error) {
          console.log('  ✗ Sync Error:', error.message);
          console.log('  Stack:', error.stack);
        }
      }
    }
    
    // Check database for tasks
    console.log('\n--- Checking ExternalTask Collection ---');
    const tasks = await ExternalTask.find({ workspaceId: WORKSPACE_ID });
    console.log(`Total tasks: ${tasks.length}`);
    
    if (tasks.length > 0) {
      tasks.forEach((task, i) => {
        console.log(`\nTask ${i + 1}:`);
        console.log(`  - Title: ${task.title}`);
        console.log(`  - Status: ${task.status}`);
        console.log(`  - Show in AIVA: ${task.showInTaskList}`);
        console.log(`  - List: ${task.googleTaskListName}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
    process.exit(0);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

testSync();
