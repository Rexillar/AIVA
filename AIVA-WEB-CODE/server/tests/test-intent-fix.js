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