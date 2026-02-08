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

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

import connectDB from '../config/db.js';
import { getImprovedAIResponse } from '../services/improvedGeminiService.js';
import { getConversationState, clearConversationState } from '../services/conversationStateTracker.js';

const testUserId = '67200aa4e0f8991f9418d7c1';
const testWorkspaceId = '67200ac1e0f8991f9418d7c5';

async function testConversationState() {
  console.log('=== Testing Conversation State Tracking ===\n');

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('✓ MongoDB connected\n');

    // Clear any existing state
    await clearConversationState(testUserId, testWorkspaceId);
    console.log('✓ Cleared existing conversation state\n');

    // Test 1: Initial task creation request
    console.log('Test 1: User says "Create a new task"');
    const response1 = await getImprovedAIResponse(
      'Create a new task',
      testUserId,
      testWorkspaceId,
      {}
    );
    console.log('Response 1:', {
      intent: response1.intent,
      reply: response1.reply.substring(0, 100),
      conversationStateStarted: response1.conversationStateStarted
    });

    // Check if state was saved
    const state1 = await getConversationState(testUserId, testWorkspaceId);
    console.log('State after first message:', {
      type: state1.type,
      isIdle: state1.isIdle(),
      context: state1.context
    });
    console.log('');

    // Test 2: Follow-up with task name
    console.log('Test 2: User says "test"');
    const response2 = await getImprovedAIResponse(
      'test',
      testUserId,
      testWorkspaceId,
      {}
    );
    console.log('Response 2:', {
      intent: response2.intent,
      reply: response2.reply.substring(0, 100),
      data: response2.data
    });

    // Check if state was cleared
    const state2 = await getConversationState(testUserId, testWorkspaceId);
    console.log('State after second message:', {
      type: state2.type,
      isIdle: state2.isIdle()
    });

    if (response2.intent === 'create_task' && response2.data?.title === 'test') {
      console.log('\n✓ TEST PASSED: Task created successfully with multi-turn conversation');
    } else {
      console.log('\n✗ TEST FAILED: Task was not created properly');
      console.log('Expected: { intent: "create_task", data: { title: "test" } }');
      console.log('Got:', { intent: response2.intent, data: response2.data });
    }

  } catch (error) {
    console.error('✗ TEST ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Close MongoDB connection
    process.exit(0);
  }
}

testConversationState();