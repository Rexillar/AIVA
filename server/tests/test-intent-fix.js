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


import { classifyIntent, INTENT_TYPES } from '../services/intentClassifier.js';

const testCases = [
  { message: 'Create a new task', expected: INTENT_TYPES.CREATE_TASK },
  { message: 'purchase water', expected: INTENT_TYPES.CREATE_TASK },
  { message: 'add the task to test the code', expected: INTENT_TYPES.CREATE_TASK },
  { message: 'add task called review PR', expected: INTENT_TYPES.CREATE_TASK },
  { message: 'add habit called exercise', expected: INTENT_TYPES.CREATE_HABIT },
  { message: 'track meditation daily', expected: INTENT_TYPES.CREATE_HABIT },
  { message: 'buy groceries tomorrow', expected: INTENT_TYPES.CREATE_TASK }
];

console.log('\n🧪 Testing Intent Classification Fix\n');
console.log('='.repeat(70));

testCases.forEach(({ message, expected }, index) => {
  const result = classifyIntent(message);
  const isCorrect = result.type === expected;
  const icon = isCorrect ? '✅' : '❌';
  
  console.log(`\n${icon} Test ${index + 1}: "${message}"`);
  console.log(`   Expected: ${expected}`);
  console.log(`   Got: ${result.type}`);
  console.log(`   Confidence: ${result.confidence.toFixed(2)}`);
});

console.log('\n' + '='.repeat(70) + '\n');