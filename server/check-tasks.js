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


import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ExternalTask from './models/externalTask.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function checkTasks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    
    const workspaceId = '695f7e33fd49e1c3254a6bce';
    
    // Check all tasks
    const allTasks = await ExternalTask.find({ workspaceId });
    console.log('\n=== ALL TASKS ===');
    console.log('Total tasks:', allTasks.length);
    
    allTasks.forEach(task => {
      console.log(`\nTask: ${task.title}`);
      console.log(`  ID: ${task._id}`);
      console.log(`  googleAccountId: ${task.googleAccountId}`);
      console.log(`  googleTaskId: ${task.googleTaskId}`);
      console.log(`  isDeleted: ${task.isDeleted}`);
      console.log(`  showInTaskList: ${task.showInTaskList}`);
      console.log(`  lastSyncedAt: ${task.lastSyncedAt}`);
    });
    
    // Check non-deleted tasks
    const activeTasks = await ExternalTask.find({ 
      workspaceId,
      isDeleted: false 
    });
    console.log('\n=== ACTIVE TASKS (isDeleted: false) ===');
    console.log('Count:', activeTasks.length);
    
    // Check tasks with showInTaskList
    const visibleTasks = await ExternalTask.find({ 
      workspaceId,
      isDeleted: false,
      showInTaskList: true
    });
    console.log('\n=== VISIBLE TASKS (isDeleted: false, showInTaskList: true) ===');
    console.log('Count:', visibleTasks.length);
    
    visibleTasks.forEach(task => {
      console.log(`  - ${task.title} (${task.googleTaskId})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTasks();
