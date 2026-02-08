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
import { handleChatbotQuery } from '../services/unifiedChatbotService.js';
import Task from '../models/task.js';
import Habit from '../models/habit.js';
import User from '../models/user.js';
import { Workspace } from '../models/workspace.js';

dotenv.config();

// Test user ID (replace with actual user ID from your database)
const TEST_USER_ID = '507f1f77bcf86cd799439011';
let TEST_WORKSPACE_ID = null;

// Test prompts covering different scenarios
const TEST_PROMPTS = [
  // Simple queries (should bypass AI)
  'show my tasks',
  'list all habits',
  'show today\'s reminders',

  // Complex queries (should use AI)
  'summarize my productivity this week',
  'what tasks are blocking project X?',
  'give me recommendations to improve my habits',

  // Voice commands (with potential transcription errors)
  'complete the task called review code',
  'mark habit exercise as done',
  'create a new task for tomorrow',

  // Multi-intent queries
  'show my tasks and give me suggestions for today',
  'complete today\'s habits and tell me what to focus on next',

  // Workspace operations (should bypass AI)
  'create a new workspace called My Project',
  'create workspace for client work'
];

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aiva');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function setupTestData() {
  console.log('\n📝 Setting up test data...');

  try {
    // Create test user if doesn't exist
    let user = await User.findById(TEST_USER_ID);
    if (!user) {
      user = await User.create({
        _id: TEST_USER_ID,
        email: 'test@aiva.com',
        name: 'Test User',
        password: 'hashed_password_here'
      });
      console.log('✅ Created test user');
    }

    // Create test workspace if doesn't exist
    let workspace = await mongoose.models.Workspace?.findOne({ owner: TEST_USER_ID });
    if (!workspace) {
      const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', new mongoose.Schema({
        name: { type: String, required: true },
        description: String,
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
      }));
      workspace = await Workspace.create({
        name: 'Test Workspace',
        description: 'Workspace for testing chatbot functionality',
        owner: TEST_USER_ID
      });
      console.log('✅ Created test workspace');
    }
    TEST_WORKSPACE_ID = workspace._id;

    // Create sample tasks
    const existingTasks = await Task.find({ creator: TEST_USER_ID }).limit(1);
    if (existingTasks.length === 0) {
      await Task.insertMany([
        {
          title: 'Review code',
          description: 'Review PR #123',
          stage: 'in_progress',
          priority: 'high',
          dueDate: new Date(Date.now() + 86400000), // Tomorrow
          creator: TEST_USER_ID,
          workspace: workspace._id,
          assignees: [TEST_USER_ID]
        },
        {
          title: 'Update documentation',
          description: 'Update API docs',
          stage: 'todo',
          priority: 'medium',
          dueDate: new Date(Date.now() + 172800000), // 2 days
          creator: TEST_USER_ID,
          workspace: workspace._id,
          assignees: [TEST_USER_ID]
        },
        {
          title: 'Deploy to production',
          description: 'Deploy v2.0',
          stage: 'todo',
          priority: 'high',
          dueDate: new Date(Date.now() + 259200000), // 3 days
          creator: TEST_USER_ID,
          workspace: workspace._id,
          assignees: [TEST_USER_ID]
        }
      ]);
      console.log('✅ Created sample tasks');
    }

    // Create sample habits
    const existingHabits = await Habit.find({ user: TEST_USER_ID }).limit(1);
    if (existingHabits.length === 0) {
      await Habit.insertMany([
        {
          title: 'Exercise',
          description: '30 minutes workout',
          user: TEST_USER_ID,
          workspace: workspace._id,
          frequency: 'daily',
          category: 'fitness',
          goal: { type: 'duration', target: 30, unit: 'minutes' }
        },
        {
          title: 'Reading',
          description: 'Read 20 pages',
          user: TEST_USER_ID,
          workspace: workspace._id,
          frequency: 'daily',
          category: 'learning',
          goal: { type: 'count', target: 20, unit: 'pages' }
        }
      ]);
      console.log('✅ Created sample habits');
    }

    console.log('✅ Test data setup complete\n');
  } catch (error) {
    console.error('❌ Error setting up test data:', error.message);
  }
}

async function testPrompt(prompt, index) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Test ${index + 1}/${TEST_PROMPTS.length}: "${prompt}"`);
  console.log('='.repeat(70));

  const startTime = Date.now();

  try {
    const result = await handleChatbotQuery(
      prompt,
      TEST_USER_ID,
      TEST_WORKSPACE_ID,
      {
        isVoice: false,
        streamResponse: false,
        includeSuggestions: true
      }
    );

    const duration = Date.now() - startTime;

    console.log('\n📊 Result:');
    console.log('─'.repeat(70));
    console.log('Response:', result.reply || result.response);
    console.log('\n📈 Metadata:');
    console.log('  ⏱️  Duration:', `${duration}ms`);
    console.log('  🎯 Intent Type:', result.intent || 'N/A');
    console.log('  🤖 Used AI:', result.usedAI ? 'Yes' : 'No');
    console.log('  💾 Cache Hit:', result.fromCache ? 'Yes' : 'No');
    console.log('  📝 Tokens Used:', result.tokensUsed || 'N/A');

    if (result.action) {
      console.log('\n⚡ Action Executed:');
      console.log(`  ${result.action.type || 'Unknown'} - ${result.action.status || 'Completed'}`);
    }

    if (result.suggestions?.length > 0) {
      console.log('\n💡 Suggestions:');
      result.suggestions.forEach((suggestion, i) => {
        console.log(`  ${i + 1}. ${suggestion.text || suggestion}`);
      });
    }

    console.log('\n✅ Test passed');
    return { success: true, duration, result };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.log('\n❌ Test failed');
    console.log('Error:', error.message);
    console.log('Duration:', `${duration}ms`);
    return { success: false, duration, error: error.message };
  }
}

async function runTests() {
  console.log('\n🚀 Starting Real-time Chatbot Tests');
  console.log('='.repeat(70));

  await connectDatabase();
  await setupTestData();

  const results = [];
  let passedTests = 0;
  let failedTests = 0;
  let totalDuration = 0;

  for (let i = 0; i < TEST_PROMPTS.length; i++) {
    const result = await testPrompt(TEST_PROMPTS[i], i);
    results.push(result);
    totalDuration += result.duration;

    if (result.success) {
      passedTests++;
    } else {
      failedTests++;
    }

    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Print summary
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${TEST_PROMPTS.length}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`⏱️  Average Duration: ${Math.round(totalDuration / TEST_PROMPTS.length)}ms`);
  console.log(`📦 Total Duration: ${totalDuration}ms`);

  // Performance breakdown
  const simpleQueries = results.slice(0, 3);
  const complexQueries = results.slice(3, 6);

  const avgSimple = simpleQueries.reduce((sum, r) => sum + r.duration, 0) / simpleQueries.length;
  const avgComplex = complexQueries.reduce((sum, r) => sum + r.duration, 0) / complexQueries.length;

  console.log('\n📈 Performance Breakdown:');
  console.log(`  Simple Queries (bypassed AI): ${Math.round(avgSimple)}ms average`);
  console.log(`  Complex Queries (used AI): ${Math.round(avgComplex)}ms average`);
  console.log(`  Speed Improvement: ${Math.round(((avgComplex - avgSimple) / avgComplex) * 100)}%`);

  console.log('\n' + '='.repeat(70));

  await mongoose.connection.close();
  console.log('\n✅ Tests completed - Database connection closed');

  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});