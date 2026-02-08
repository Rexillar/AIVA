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

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import { getImprovedAIResponse } from './improvedGeminiService.js';
import { getContext } from './contextManager.js';

export const soundex = (str) => {
  const a = str.toLowerCase().split('');
  const f = a.shift();
  const r = [];
  const codes = {
    a: '', e: '', i: '', o: '', u: '', h: '', w: '', y: '',
    b: 1, f: 1, p: 1, v: 1,
    c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
    d: 3, t: 3,
    l: 4,
    m: 5, n: 5,
    r: 6
  };

  r.push(f);

  for (let i = 0; i < a.length; i++) {
    const code = codes[a[i]];
    if (code && code !== codes[a[i - 1]]) {
      r.push(code);
    }
  }

  return (r.join('') + '000').slice(0, 4).toUpperCase();
};

/**
 * Calculate Levenshtein distance
 */
const levenshteinDistance = (str1, str2) => {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  return track[str2.length][str1.length];
};

/**
 * Find best phonetic match
 */
const findPhoneticMatch = (spokenWord, candidateWords) => {
  const spokenSoundex = soundex(spokenWord);
  const matches = [];

  for (const candidate of candidateWords) {
    const candidateSoundex = soundex(candidate);
    const distance = levenshteinDistance(spokenWord.toLowerCase(), candidate.toLowerCase());

    // Score based on phonetic similarity and edit distance
    const phoneticMatch = spokenSoundex === candidateSoundex;
    const similarity = 1 - (distance / Math.max(spokenWord.length, candidate.length));

    matches.push({
      word: candidate,
      phoneticMatch,
      similarity,
      score: phoneticMatch ? similarity + 0.5 : similarity
    });
  }

  matches.sort((a, b) => b.score - a.score);
  return matches[0];
};

/**
 * Common voice transcription errors
 */
const COMMON_ERRORS = {
  'exercize': 'exercise',
  'excercise': 'exercise',
  'meditate': 'meditation',
  'wright': 'write',
  'rite': 'write',
  'red': 'read',
  'reed': 'read',
  'too': 'to',
  'to': 'do',
  'doo': 'do',
  'morning': 'mourning',
  'night': 'knight'
};

/**
 * Correct common transcription errors
 */
const correctTranscriptionErrors = (text) => {
  let corrected = text;

  for (const [error, correction] of Object.entries(COMMON_ERRORS)) {
    const regex = new RegExp(`\\b${error}\\b`, 'gi');
    corrected = corrected.replace(regex, correction);
  }

  return corrected;
};

/**
 * Extract action and target from voice command
 */
const parseVoiceCommand = (transcript, context) => {
  const normalized = transcript.toLowerCase().trim();

  // Common action verbs
  const actions = {
    complete: ['mark', 'complete', 'done', 'finish', 'finished', 'did'],
    create: ['add', 'create', 'new', 'start', 'begin'],
    delete: ['delete', 'remove', 'cancel', 'stop'],
    list: ['show', 'list', 'display', 'what', 'get'],
    update: ['change', 'update', 'modify', 'edit']
  };

  // Detect action
  let detectedAction = null;
  for (const [action, verbs] of Object.entries(actions)) {
    if (verbs.some(verb => normalized.includes(verb))) {
      detectedAction = action;
      break;
    }
  }

  // Extract target (habit/task name)
  let target = null;
  if (detectedAction) {
    // Get all possible targets from context
    const habits = context.todayHabits?.map(h => h.title) || [];
    const tasks = context.todayTasks?.map(t => t.title) || [];
    const allTargets = [...habits, ...tasks];

    // Try to find target in transcript
    for (const word of normalized.split(' ')) {
      const match = findPhoneticMatch(word, allTargets);
      if (match.score > 0.6) {
        target = match.word;
        break;
      }
    }
  }

  return { action: detectedAction, target };
};

/**
 * Build context-aware voice query
 */
const buildContextAwareQuery = (transcript, context, parsed) => {
  const { action, target } = parsed;

  // If we have high confidence in parsed command, use it
  if (action && target) {
    switch (action) {
      case 'complete':
        return `Mark ${target} as done`;
      case 'create':
        return `Add new ${transcript.includes('habit') ? 'habit' : 'task'}: ${target}`;
      case 'delete':
        return `Delete ${target}`;
      case 'update':
        return `Update ${target}`;
    }
  }

  // Use previous conversation context for disambiguation
  if (context.recentConversation?.length > 0) {
    const lastMessage = context.recentConversation[context.recentConversation.length - 1];
    if (lastMessage.role === 'assistant' && transcript.includes('yes')) {
      return 'Yes, proceed with that';
    }
  }

  // Fall back to original transcript
  return transcript;
};

/**
 * Process voice command with enhancements
 */
export const processEnhancedVoiceCommand = async (transcript, userId, workspaceId) => {
  try {
    // Step 1: Correct common transcription errors
    const corrected = correctTranscriptionErrors(transcript);

    // Step 2: Get context for phonetic matching
    const context = await getContext(userId, workspaceId);

    // Step 3: Parse command with phonetic matching
    const parsed = parseVoiceCommand(corrected, context);

    // Step 4: Build context-aware query
    const query = buildContextAwareQuery(corrected, context, parsed);

    // Step 5: Process with improved AI service
    const response = await getImprovedAIResponse(
      query,
      userId,
      workspaceId,
      { isVoice: true }
    );

    return {
      ...response,
      voiceMetadata: {
        originalTranscript: transcript,
        correctedTranscript: corrected,
        parsedAction: parsed.action,
        parsedTarget: parsed.target,
        finalQuery: query
      }
    };
  } catch (error) {
    console.error('Enhanced voice processing error:', error);
    return {
      intent: 'error',
      reply: "Sorry, I didn't catch that. Could you repeat?",
      action: null
    };
  }
};

/**
 * Batch process multiple voice commands
 */
export const processBatchVoiceCommands = async (transcripts, userId, workspaceId) => {
  const results = [];

  for (const transcript of transcripts) {
    const result = await processEnhancedVoiceCommand(transcript, userId, workspaceId);
    results.push(result);
  }

  return {
    results,
    summary: `Processed ${results.length} voice commands. ${results.filter(r => r.actionResult?.success).length} completed successfully.`
  };
};

export default {
  processEnhancedVoiceCommand,
  processBatchVoiceCommands,
  findPhoneticMatch,
  soundex
};