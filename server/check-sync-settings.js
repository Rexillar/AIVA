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
* Check Google Sync Settings
*=================================================================*/

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const WORKSPACE_ID = '695f7e33fd49e1c3254a6bce';

async function checkSettings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const GoogleIntegration = mongoose.model('GoogleIntegration', new mongoose.Schema({}, { strict: false }));
    const integration = await GoogleIntegration.findOne({ workspace: WORKSPACE_ID });
    
    if (!integration) {
      console.log('No integration found');
      process.exit(1);
    }
    
    console.log('\n=== GOOGLE INTEGRATION SETTINGS ===\n');
    console.log('Workspace:', WORKSPACE_ID);
    console.log('Integration ID:', integration._id);
    console.log('\nAccounts:', integration.accounts.length);
    
    integration.accounts.forEach((acc, i) => {
      console.log(`\n--- Account ${i + 1} ---`);
      console.log('Email:', acc.googleEmail);
      console.log('Status:', acc.status);
      console.log('Account ID:', acc.accountId);
      console.log('\nCalendar Sync:');
      console.log('  Enabled:', acc.syncSettings?.calendar?.enabled);
      console.log('\nTasks Sync:');
      console.log('  Enabled:', acc.syncSettings?.tasks?.enabled);
      console.log('  Show in AIVA:', acc.syncSettings?.tasks?.showInAIVA);
      console.log('  Sync Direction:', acc.syncSettings?.tasks?.syncDirection);
      console.log('  Selected Lists:', JSON.stringify(acc.syncSettings?.tasks?.selectedLists));
      console.log('\nMeet Settings:');
      console.log('  Detect Links:', acc.syncSettings?.meet?.detectLinks);
      console.log('\nLast Synced:', acc.lastSyncedAt);
    });
    
    // Check external tasks
    const ExternalTask = mongoose.model('ExternalTask', new mongoose.Schema({}, { strict: false }));
    const tasks = await ExternalTask.countDocuments({ workspaceId: WORKSPACE_ID });
    console.log('\n=== DATABASE ===');
    console.log('External Tasks Count:', tasks);
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSettings();
