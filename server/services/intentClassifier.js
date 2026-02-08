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
export const INTENT_TYPES = {
  // Direct database queries (no AI needed)
  LIST_TASKS: 'list_tasks',
  LIST_HABITS: 'list_habits',
  LIST_NOTES: 'list_notes',
  LIST_WORKSPACES: 'list_workspaces',
  LIST_REMINDERS: 'list_reminders',
  LIST_NOTIFICATIONS: 'list_notifications',
  LIST_TODAY_TASKS: 'list_today_tasks',
  LIST_OVERDUE_TASKS: 'list_overdue_tasks',
  LIST_COMPLETED_TASKS: 'list_completed_tasks',
  LIST_SUBTASKS: 'list_subtasks',
  LIST_TODAY_HABITS: 'list_today_habits',

  // Simple actions (pattern-based, no AI needed)
  COMPLETE_HABIT: 'complete_habit',
  COMPLETE_TASK: 'complete_task',
  COMPLETE_SUBTASK: 'complete_subtask',
  CREATE_HABIT: 'create_habit',
  CREATE_TASK: 'create_task',
  CREATE_TASK_IN_WORKSPACE: 'create_task_in_workspace',
  CREATE_NOTE: 'create_note',
  CREATE_WORKSPACE: 'create_workspace',
  CREATE_SUBTASK: 'create_subtask',
  CREATE_REMINDER: 'create_reminder',

  DELETE_HABIT: 'delete_habit',
  DELETE_ALL_HABITS: 'delete_all_habits',
  DELETE_TASK: 'delete_task',
  DELETE_NOTE: 'delete_note',
  DELETE_ALL_NOTES: 'delete_all_notes',
  DELETE_WORKSPACE: 'delete_workspace',
  DELETE_SUBTASK: 'delete_subtask',
  DELETE_REMINDER: 'delete_reminder',

  REOPEN_TASK: 'reopen_task',
  RENAME_TASK: 'rename_task',
  RENAME_SUBTASK: 'rename_subtask',
  UPDATE_TASK_DUE_DATE: 'update_task_due_date',
  UPDATE_NOTE: 'update_note',
  UPDATE_REMINDER_TIME: 'update_reminder_time',

  MOVE_TASK_TO_WORKSPACE: 'move_task_to_workspace',
  DUPLICATE_TASK: 'duplicate_task',
  RESTORE_TASK_FROM_TRASH: 'restore_task_from_trash',
  SEARCH_TASKS: 'search_tasks',
  SEARCH_NOTES: 'search_notes',

  PAUSE_HABIT: 'pause_habit',
  RESUME_HABIT: 'resume_habit',
  ARCHIVE_HABIT: 'archive_habit',
  UNDO_HABIT_COMPLETION: 'undo_habit_completion',

  // Batch operations (require confirmation)
  COMPLETE_MULTIPLE_TASKS_BY_NAME: 'complete_multiple_tasks_by_name',
  COMPLETE_ALL_TASKS_DUE_TODAY: 'complete_all_tasks_due_today',
  COMPLETE_ALL_OVERDUE_TASKS: 'complete_all_overdue_tasks',
  COMPLETE_ALL_TASKS: 'complete_all_tasks',
  COMPLETE_MULTIPLE_HABITS_TODAY: 'complete_multiple_habits_today',
  COMPLETE_ALL_SUBTASKS: 'complete_all_subtasks',

  DELETE_MULTIPLE_TASKS: 'delete_multiple_tasks',
  DELETE_ALL_COMPLETED_TASKS: 'delete_all_completed_tasks',
  DELETE_ALL_TASKS_IN_WORKSPACE: 'delete_all_tasks_in_workspace',
  DELETE_ALL_TASKS: 'delete_all_tasks',
  DELETE_ALL_SUBTASKS: 'delete_all_subtasks',
  DELETE_MULTIPLE_NOTES: 'delete_multiple_notes',
  DELETE_MULTIPLE_HABITS: 'delete_multiple_habits',
  DELETE_ALL_REMINDERS_ON_DATE: 'delete_all_reminders_on_date',

  PAUSE_MULTIPLE_HABITS: 'pause_multiple_habits',
  ARCHIVE_MULTIPLE_HABITS: 'archive_multiple_habits',
  ARCHIVE_ALL_COMPLETED_TASKS: 'archive_all_completed_tasks',
  RESTORE_ALL_ARCHIVED_TASKS: 'restore_all_archived_tasks',
  RESTORE_ALL_TRASHED_TASKS: 'restore_all_trashed_tasks',

  CREATE_MULTIPLE_SUBTASKS: 'create_multiple_subtasks',

  // Workspace operations
  SWITCH_WORKSPACE: 'switch_workspace',

  // Complex queries (requires AI)
  ANALYTICS: 'analytics',
  SUMMARY: 'summary',
  RECOMMENDATION: 'recommendation',
  CLARIFICATION: 'clarification',
  MULTI_INTENT: 'multi_intent',

  // Unknown (fallback to AI)
  UNKNOWN: 'unknown'
};

/**
 * Intent patterns for quick classification
 */
const INTENT_PATTERNS = {
  // ==================== LIST INTENTS ====================
  [INTENT_TYPES.LIST_TASKS]: [
    /^(show|list|display|get|view)\s+(all\s+)?(my\s+)?tasks?$/i,
    /^what(\s+are)?\s+my\s+tasks?$/i,
    /^tasks?$/i,
    /^(show|list|display|get|view)\s+(all\s+)?tasks?\s+(in|from|of)\s+(workspace\s+)?(.+)$/i,
    /^tasks?\s+(in|from|of)\s+(workspace\s+)?(.+)$/i
  ],
  [INTENT_TYPES.LIST_TODAY_TASKS]: [
    /^(show|list|display|get|view)\s+(all\s+)?(my\s+)?tasks?\s+(for\s+)?(today|tonight)$/i,
    /^(today'?s?|tonight'?s?)\s+tasks?$/i,
    /^what\s+(tasks?|do\s+i\s+have)\s+(do\s+i\s+have\s+)?(for\s+)?(today|tonight)$/i
  ],
  [INTENT_TYPES.LIST_OVERDUE_TASKS]: [
    /^(show|list|display|get|view)\s+(all\s+)?(my\s+)?overdue\s+tasks?$/i,
    /^overdue\s+tasks?$/i,
    /^what\s+tasks?\s+(are\s+)?(overdue|late)$/i
  ],
  [INTENT_TYPES.LIST_COMPLETED_TASKS]: [
    /^(show|list|display|get|view)\s+(all\s+)?(my\s+)?completed\s+tasks?$/i,
    /^completed\s+tasks?$/i,
    /^what\s+tasks?\s+(have\s+i|did\s+i)\s+(complete|finish)$/i
  ],
  [INTENT_TYPES.LIST_SUBTASKS]: [
    /^(show|list|display|get|view)\s+subtasks?\s+(of|for|in)\s+(.+)$/i,
    /^(.+?)\s+subtasks?$/i
  ],
  [INTENT_TYPES.LIST_HABITS]: [
    /^(show|list|display|get|view)\s+(all\s+)?(my\s+)?habits?$/i,
    /^what(\s+are)?\s+my\s+habits?$/i,
    /^habits?$/i
  ],
  [INTENT_TYPES.LIST_TODAY_HABITS]: [
    /^(show|list|display|get|view)\s+(all\s+)?habits?\s+(due\s+)?(for\s+)?(today|tonight)$/i,
    /^(today'?s?|tonight'?s?)\s+habits?$/i,
    /^what\s+habits?\s+(do\s+i\s+have|are\s+left)\s+(for\s+)?(today|tonight)$/i
  ],
  [INTENT_TYPES.LIST_NOTES]: [
    /^(show|list|display|get|view)\s+(all\s+)?(my\s+)?notes?$/i,
    /^notes?$/i
  ],
  [INTENT_TYPES.LIST_WORKSPACES]: [
    /^(show|list|display|get|view)\s+(all\s+)?(my\s+)?workspaces?$/i,
    /^workspaces?$/i
  ],
  [INTENT_TYPES.LIST_REMINDERS]: [
    /^(show|list|display|get|view)\s+(all\s+)?(my\s+)?reminders?$/i,
    /^(today'?s?|tonight'?s?)\s+reminders?$/i,
    /^reminders?$/i
  ],

  // ==================== COMPLETION INTENTS ====================
  [INTENT_TYPES.COMPLETE_TASK]: [
    /^(mark|complete|done|finish|finished)\s+(.+?)\s+(task\s+)?(as\s+)?(done|complete|completed|finished)$/i,
    /^(.+?)\s+(task\s+)?(is\s+)?(done|complete|completed|finished)$/i,
    /^(completed|done\s+with|finished\s+with)\s+(.+?)(\s+task)?$/i
  ],
  [INTENT_TYPES.COMPLETE_HABIT]: [
    /^(mark|complete|done|finish|finished)\s+(.+?)\s+(habit\s+)?(as\s+)?(done|complete|completed|finished)$/i,
    /^(.+?)\s+(habit\s+)?(is\s+)?(done|complete|completed|finished)$/i,
    /^(completed|done\s+with|finished\s+with)\s+(.+?)(\s+habit)?$/i,
    /^(complete|mark|done)\s+(today'?s?\s+)?habit\s+(.+)$/i
  ],
  [INTENT_TYPES.COMPLETE_SUBTASK]: [
    /^(mark|complete|done|finish)\s+subtask\s+(.+?)$/i,
    /^subtask\s+(.+?)\s+(is\s+)?(done|complete|completed)$/i
  ],

  // ==================== BATCH COMPLETION INTENTS ====================
  [INTENT_TYPES.COMPLETE_MULTIPLE_TASKS_BY_NAME]: [
    /^(mark|complete|done|finish)\s+(tasks?|these\s+tasks?)\s+(.+?)\s+(and\s+.+?)+\s+(as\s+)?(done|complete)$/i,
    /^complete\s+tasks?\s+(.+?)\s*,\s*(.+?)$/i
  ],
  [INTENT_TYPES.COMPLETE_ALL_TASKS_DUE_TODAY]: [
    /^(mark|complete|finish)\s+all\s+tasks?\s+(due\s+)?(for\s+)?today$/i,
    /^complete\s+today'?s?\s+tasks?$/i,
    /^finish\s+(all\s+)?today'?s?\s+tasks?$/i
  ],
  [INTENT_TYPES.COMPLETE_ALL_OVERDUE_TASKS]: [
    /^(mark|complete|finish)\s+all\s+overdue\s+tasks?$/i,
    /^complete\s+(all\s+)?overdue\s+tasks?$/i
  ],
  [INTENT_TYPES.COMPLETE_ALL_TASKS]: [
    /^(mark|complete|finish)\s+all\s+tasks?$/i,
    /^complete\s+everything$/i
  ],
  [INTENT_TYPES.COMPLETE_MULTIPLE_HABITS_TODAY]: [
    /^(mark|complete|finish)\s+(multiple|several)\s+habits?\s+(for\s+)?today$/i,
    /^complete\s+habits?\s+(.+?)\s+(and\s+.+?)+$/i
  ],
  [INTENT_TYPES.COMPLETE_ALL_SUBTASKS]: [
    /^(mark|complete|finish)\s+all\s+subtasks?\s+(of|for|in)\s+(.+)$/i,
    /^complete\s+all\s+(.+?)\s+subtasks?$/i
  ],

  // ==================== CREATION INTENTS ====================
  [INTENT_TYPES.CREATE_TASK]: [
    /^(add|create|new)\s+(a\s+)?task\s+(called\s+|named\s+|for\s+|to\s+)?(.+)$/i,
    /^(add\s+the\s+task|create\s+task|new\s+task)\s+(to\s+)?(.+)$/i,
    /^(create|add|new)\s+(a\s+)?(new\s+)?task$/i,
    /^(remind\s+me\s+to|todo|task\s+to)\s+(.+)$/i,
    /^(purchase|buy|get|order|fetch|grab)\s+(.+)$/i,
    /^(.+?)\s+(by|for|on|before)\s+(tomorrow|today|tonight|next\s+\w+)$/i
  ],
  [INTENT_TYPES.CREATE_TASK_IN_WORKSPACE]: [
    /^(add|create|new)\s+(a\s+)?task\s+(.+?)\s+(in|to)\s+(workspace\s+)?(.+)$/i,
    /^create\s+task\s+(.+?)\s+(in|to)\s+(workspace\s+)?(.+)$/i
  ],
  [INTENT_TYPES.CREATE_HABIT]: [
    /^(add|create|new|start)\s+(a\s+)?habit\s+(called\s+|named\s+|for\s+)?(.+)$/i,
    /^(track|begin\s+tracking|start\s+tracking)\s+(.+?)(\s+as\s+a\s+habit|\s+habit)$/i,
    /^(track|monitor)\s+(.+?)(\s+daily|\s+regularly|\s+every\s+day)$/i
  ],
  [INTENT_TYPES.CREATE_NOTE]: [
    /^(add|create|new|write)\s+(a\s+)?note\s+(called\s+|named\s+|about\s+)?(.+)$/i,
    /^(note|jot\s+down|write\s+down)\s+(.+)$/i
  ],
  [INTENT_TYPES.CREATE_WORKSPACE]: [
    /^(create|new|add)\s+(?:a\s+)?workspace(?:\s+(?:called|named|for))?\s*(.+)?$/i,
    /^workspace\s+(create|new|add)\s*(.+)?$/i
  ],
  [INTENT_TYPES.CREATE_SUBTASK]: [
    /^(add|create|new)\s+subtask\s+(.+?)\s+(to|in|under|for)\s+(.+)$/i,
    /^add\s+(.+?)\s+as\s+subtask\s+(to|of)\s+(.+)$/i
  ],
  [INTENT_TYPES.CREATE_MULTIPLE_SUBTASKS]: [
    /^(add|create)\s+(multiple|several)\s+subtasks?\s+(to|in|under)\s+(.+)$/i,
    /^add\s+subtasks?\s+(.+?)\s*,\s*(.+?)\s+(to|in)\s+(.+)$/i
  ],
  [INTENT_TYPES.CREATE_REMINDER]: [
    /^(add|create|set|new)\s+(a\s+)?reminder\s+(for\s+|to\s+)?(.+)$/i,
    /^remind\s+me\s+(to\s+|about\s+)?(.+)$/i
  ],

  // ==================== UPDATE/RENAME INTENTS ====================
  [INTENT_TYPES.REOPEN_TASK]: [
    /^(reopen|uncomplete|undo)\s+(task\s+)?(.+)$/i,
    /^mark\s+(.+?)\s+(task\s+)?(as\s+)?(incomplete|not\s+done)$/i
  ],
  [INTENT_TYPES.RENAME_TASK]: [
    /^(rename|change\s+name\s+of)\s+(task\s+)?(.+?)\s+to\s+(.+)$/i,
    /^rename\s+(.+?)\s+(task\s+)?to\s+(.+)$/i
  ],
  [INTENT_TYPES.RENAME_SUBTASK]: [
    /^(rename|change)\s+subtask\s+(.+?)\s+to\s+(.+)$/i
  ],
  [INTENT_TYPES.UPDATE_TASK_DUE_DATE]: [
    /^(change|update|set|move)\s+(the\s+)?due\s+date\s+(of|for)\s+(.+?)\s+to\s+(.+)$/i,
    /^(change|update|set)\s+(.+?)\s+due\s+date\s+to\s+(.+)$/i
  ],
  [INTENT_TYPES.UPDATE_NOTE]: [
    /^(update|edit|change)\s+(note\s+)?(.+)$/i,
    /^edit\s+(.+?)\s+note$/i
  ],
  [INTENT_TYPES.UPDATE_REMINDER_TIME]: [
    /^(change|update|set|move)\s+(the\s+)?reminder\s+(time|date)\s+(for|of)\s+(.+?)\s+to\s+(.+)$/i,
    /^update\s+(.+?)\s+reminder\s+to\s+(.+)$/i
  ],

  // ==================== MOVE/DUPLICATE/RESTORE INTENTS ====================
  [INTENT_TYPES.MOVE_TASK_TO_WORKSPACE]: [
    /^(move|transfer|relocate)\s+(task\s+)?(.+?)\s+to\s+(workspace\s+)?(.+)$/i,
    /^move\s+(.+?)\s+(to|into)\s+(.+?)\s+workspace$/i
  ],
  [INTENT_TYPES.DUPLICATE_TASK]: [
    /^(duplicate|copy|clone)\s+(task\s+)?(.+)$/i,
    /^make\s+a\s+copy\s+of\s+(.+?)(\s+task)?$/i
  ],
  [INTENT_TYPES.RESTORE_TASK_FROM_TRASH]: [
    /^(restore|undelete|recover)\s+(task\s+)?(.+?)(\s+from\s+trash)?$/i,
    /^restore\s+(.+?)(\s+task)?$/i
  ],
  [INTENT_TYPES.RESTORE_ALL_TRASHED_TASKS]: [
    /^(restore|recover)\s+all\s+(trashed|deleted)\s+tasks?$/i,
    /^restore\s+all\s+tasks?\s+from\s+trash$/i
  ],

  // ==================== SEARCH INTENTS ====================
  [INTENT_TYPES.SEARCH_TASKS]: [
    /^(search|find|look\s+for)\s+(task|tasks)\s+(.+)$/i,
    /^(search|find)\s+(.+?)\s+(in\s+)?tasks?$/i
  ],
  [INTENT_TYPES.SEARCH_NOTES]: [
    /^(search|find|look\s+for)\s+(note|notes)\s+(.+)$/i,
    /^(search|find)\s+(.+?)\s+(in\s+)?notes?$/i
  ],

  // ==================== HABIT MANAGEMENT ====================
  [INTENT_TYPES.PAUSE_HABIT]: [
    /^(pause|stop|suspend)\s+(habit\s+)?(.+)$/i,
    /^pause\s+(.+?)\s+habit$/i
  ],
  [INTENT_TYPES.PAUSE_MULTIPLE_HABITS]: [
    /^(pause|stop)\s+(multiple|several)\s+habits?$/i,
    /^pause\s+habits?\s+(.+?)\s*,\s*(.+?)$/i
  ],
  [INTENT_TYPES.RESUME_HABIT]: [
    /^(resume|restart|continue)\s+(habit\s+)?(.+)$/i,
    /^resume\s+(.+?)\s+habit$/i
  ],
  [INTENT_TYPES.ARCHIVE_HABIT]: [
    /^(archive|end)\s+(habit\s+)?(.+)$/i,
    /^archive\s+(.+?)\s+habit$/i
  ],
  [INTENT_TYPES.ARCHIVE_MULTIPLE_HABITS]: [
    /^(archive|end)\s+(multiple|several)\s+habits?$/i,
    /^archive\s+habits?\s+(.+?)\s*,\s*(.+?)$/i
  ],
  [INTENT_TYPES.UNDO_HABIT_COMPLETION]: [
    /^(undo|revert|cancel)\s+(the\s+)?completion\s+(of|for)\s+(.+?)(\s+habit)?$/i,
    /^undo\s+(.+?)\s+habit$/i
  ],

  // ==================== DELETE INTENTS ====================
  // IMPORTANT: Check bulk operations BEFORE singular operations
  [INTENT_TYPES.DELETE_ALL_TASKS]: [
    /^(delete|remove|clear)\s+all\s+(my\s+)?tasks?$/i,
    /^(delete|remove|clear)\s+all\s+(of\s+)?(my\s+)?tasks?$/i,
    /^clear\s+(all|everything|my)\s+tasks?$/i,
    /^(remove|delete)\s+everything$/i,
    /^(delete|remove)\s+tasks?\s*all$/i,  // "delete task all" or "delete tasks all"
    /^(delete|remove|clear)\s+all\s+the\s+tasks?$/i,  // "delete all the task(s)"
    /^(delete|remove|clear)\s+(the\s+)?tasks?$/i  // "delete the tasks" or "delete tasks"
  ],
  [INTENT_TYPES.DELETE_ALL_COMPLETED_TASKS]: [
    /^(delete|remove|clear)\s+all\s+completed\s+tasks?$/i,
    /^clear\s+completed\s+tasks?$/i
  ],
  [INTENT_TYPES.DELETE_ALL_TASKS_IN_WORKSPACE]: [
    /^(delete|remove|clear)\s+all\s+tasks?\s+(in|from)\s+(workspace\s+)?(.+)$/i
  ],
  [INTENT_TYPES.DELETE_MULTIPLE_TASKS]: [
    /^(delete|remove)\s+(multiple|selected|these)\s+tasks?$/i,
    /^delete\s+tasks?\s+(.+?)\s*,\s*(.+?)$/i
  ],
  [INTENT_TYPES.DELETE_TASK]: [
    /^(delete|remove|cancel)\s+(task\s+)?(?!all\s)(.+)$/i  // Negative lookahead to exclude "all"
  ],
  [INTENT_TYPES.DELETE_SUBTASK]: [
    /^(delete|remove)\s+subtask\s+(.+)$/i
  ],
  [INTENT_TYPES.DELETE_ALL_SUBTASKS]: [
    /^(delete|remove|clear)\s+all\s+subtasks?\s+(of|in|from)\s+(.+)$/i
  ],
  [INTENT_TYPES.DELETE_ALL_HABITS]: [
    /^(delete|remove|clear)\s+all\s+(my\s+)?habits?$/i,
    /^(delete|remove|clear)\s+all\s+(of\s+)?(my\s+)?habits?$/i,
    /^clear\s+(all|everything|my)\s+habits?$/i,
    /^(delete|remove|clear)\s+all\s+the\s+habits?$/i,
    /^(delete|remove|clear)\s+(the\s+)?habits?$/i
  ],
  [INTENT_TYPES.DELETE_MULTIPLE_HABITS]: [
    /^(delete|remove)\s+(multiple|selected)\s+habits?$/i
  ],
  [INTENT_TYPES.DELETE_HABIT]: [
    /^(delete|remove|stop)\s+(habit\s+)?(?!all\s)(.+)$/i,
    /^(stop\s+tracking)\s+(.+?)(\s+habit)?$/i
  ],
  [INTENT_TYPES.DELETE_ALL_NOTES]: [
    /^(delete|remove|clear)\s+all\s+(my\s+)?notes?$/i,
    /^(delete|remove|clear)\s+all\s+(of\s+)?(my\s+)?notes?$/i,
    /^clear\s+(all|everything|my)\s+notes?$/i,
    /^(delete|remove|clear)\s+all\s+the\s+notes?$/i,
    /^(delete|remove|clear)\s+(the\s+)?notes?$/i
  ],
  [INTENT_TYPES.DELETE_MULTIPLE_NOTES]: [
    /^(delete|remove)\s+(multiple|selected)\s+notes?$/i,
    /^delete\s+notes?\s+(.+?)\s*,\s*(.+?)$/i
  ],
  [INTENT_TYPES.DELETE_NOTE]: [
    /^(delete|remove)\s+(note\s+)?(?!all\s)(.+)$/i
  ],
  [INTENT_TYPES.DELETE_REMINDER]: [
    /^(delete|remove|cancel)\s+(reminder\s+)?(.+)$/i
  ],
  [INTENT_TYPES.DELETE_ALL_REMINDERS_ON_DATE]: [
    /^(delete|remove|clear)\s+all\s+reminders?\s+(on|for)\s+(.+)$/i
  ],
  [INTENT_TYPES.DELETE_WORKSPACE]: [
    /^(delete|remove)\s+(workspace\s+)?(.+)$/i
  ],

  // ==================== ARCHIVE/RESTORE OPERATIONS ====================
  [INTENT_TYPES.ARCHIVE_ALL_COMPLETED_TASKS]: [
    /^(archive|move\s+to\s+archive)\s+all\s+completed\s+tasks?$/i
  ],
  [INTENT_TYPES.RESTORE_ALL_ARCHIVED_TASKS]: [
    /^(restore|unarchive)\s+all\s+archived\s+tasks?$/i
  ],

  // ==================== WORKSPACE OPERATIONS ====================
  [INTENT_TYPES.SWITCH_WORKSPACE]: [
    /^(switch|change|go)\s+to\s+(workspace\s+)?(.+)$/i,
    /^switch\s+workspace\s+to\s+(.+)$/i
  ],

  // ==================== COMPLEX QUERIES (AI) ====================
  [INTENT_TYPES.ANALYTICS]: [
    /^(how|what)(\s+am\s+i|\s+did\s+i|\s+have\s+i)?\s+(doing|done|accomplished|progressing)$/i,
    /^(show|get|display)\s+(my\s+)?(progress|stats|statistics|analytics)$/i,
    /^(what's|what\s+is)\s+my\s+(progress|performance)$/i
  ],
  [INTENT_TYPES.SUMMARY]: [
    /^(daily|today'?s?|end\s+of\s+day)\s+(summary|recap|report|review)$/i,
    /^(summarize|recap|review)\s+(my\s+)?(day|today|progress)$/i,
    /^what\s+did\s+i\s+(do|accomplish)\s+(today)?$/i
  ],
  [INTENT_TYPES.RECOMMENDATION]: [
    /^(what\s+should\s+i|suggest|recommend|help\s+me\s+with)$/i,
    /^(motivate|encourage|inspire)\s+me$/i,
    /^give\s+me\s+(advice|tips|suggestions)$/i
  ]
};

/**
 * Classify user message intent
 */
export const classifyIntent = (message) => {
  if (!message || typeof message !== 'string') {
    return {
      type: INTENT_TYPES.UNKNOWN,
      confidence: 0,
      requiresAI: true,
      data: null
    };
  }

  const normalizedMessage = message.trim().toLowerCase();

  // Check for multi-intent (contains 'and' or multiple commands)
  if (isMultiIntent(normalizedMessage)) {
    return {
      type: INTENT_TYPES.MULTI_INTENT,
      confidence: 0.9,
      requiresAI: true,
      data: { intents: splitMultiIntent(normalizedMessage) }
    };
  }

  // Try to match against patterns
  for (const [intentType, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      const match = normalizedMessage.match(pattern);
      if (match) {
        const data = extractIntentData(intentType, match, normalizedMessage);
        const requiresAI = [
          INTENT_TYPES.ANALYTICS,
          INTENT_TYPES.SUMMARY,
          INTENT_TYPES.RECOMMENDATION
        ].includes(intentType);

        return {
          type: intentType,
          confidence: 0.95,
          requiresAI,
          data
        };
      }
    }
  }

  // No pattern matched - requires AI processing
  return {
    type: INTENT_TYPES.UNKNOWN,
    confidence: 0,
    requiresAI: true,
    data: null
  };
};

/**
 * Check if message contains multiple intents
 */
const isMultiIntent = (message) => {
  const multiIntentIndicators = [
    ' and ',
    ' then ',
    ' also ',
    ' plus ',
    ';',
    ','
  ];

  return multiIntentIndicators.some(indicator => message.includes(indicator));
};

/**
 * Split multi-intent message
 */
const splitMultiIntent = (message) => {
  // Split by common separators
  const parts = message.split(/\s+(and|then|also|plus)\s+|[;,]/i)
    .filter(part => part && !['and', 'then', 'also', 'plus'].includes(part.trim()));

  return parts.map(part => part.trim());
};

/**
 * Extract relevant data from matched pattern
 */
const extractIntentData = (intentType, match, fullMessage) => {
  switch (intentType) {
    // ==================== COMPLETION INTENTS ====================
    case INTENT_TYPES.COMPLETE_HABIT:
    case INTENT_TYPES.COMPLETE_TASK:
    case INTENT_TYPES.COMPLETE_SUBTASK:
      const itemName = match[2] || match[1];
      return { name: itemName?.trim() };

    // ==================== CREATION INTENTS ====================
    case INTENT_TYPES.CREATE_HABIT:
      const habitName = match[4] || match[2];
      return { name: habitName?.trim() };

    case INTENT_TYPES.CREATE_TASK:
      const taskName = match[4] || match[3] || match[2];
      return { name: taskName?.trim() };

    case INTENT_TYPES.CREATE_TASK_IN_WORKSPACE:
      return {
        taskName: match[3]?.trim(),
        workspaceName: match[6]?.trim()
      };

    case INTENT_TYPES.CREATE_NOTE:
      const noteName = match[4] || match[2];
      return { name: noteName?.trim() };

    case INTENT_TYPES.CREATE_WORKSPACE:
      const workspaceText = match[2] || match[1] || '';
      return { name: workspaceText.trim() };

    case INTENT_TYPES.CREATE_SUBTASK:
      return {
        subtaskName: match[2]?.trim(),
        taskName: match[4]?.trim()
      };

    case INTENT_TYPES.CREATE_MULTIPLE_SUBTASKS:
      return {
        taskName: match[4]?.trim(),
        subtaskNames: fullMessage.match(/,/g) ? fullMessage.split(',').map(s => s.trim()) : []
      };

    case INTENT_TYPES.CREATE_REMINDER:
      const reminderText = match[4] || match[2];
      return { name: reminderText?.trim() };

    // ==================== UPDATE/RENAME INTENTS ====================
    case INTENT_TYPES.REOPEN_TASK:
    case INTENT_TYPES.PAUSE_HABIT:
    case INTENT_TYPES.RESUME_HABIT:
    case INTENT_TYPES.ARCHIVE_HABIT:
      return { name: match[3]?.trim() || match[1]?.trim() };

    case INTENT_TYPES.RENAME_TASK:
      return {
        oldName: match[3]?.trim() || match[1]?.trim(),
        newName: match[4]?.trim() || match[3]?.trim()
      };

    case INTENT_TYPES.RENAME_SUBTASK:
      return {
        oldName: match[2]?.trim(),
        newName: match[3]?.trim()
      };

    case INTENT_TYPES.UPDATE_TASK_DUE_DATE:
      return {
        taskName: match[4]?.trim() || match[2]?.trim(),
        newDueDate: match[5]?.trim() || match[3]?.trim()
      };

    case INTENT_TYPES.UPDATE_NOTE:
      return { name: match[3]?.trim() || match[1]?.trim() };

    case INTENT_TYPES.UPDATE_REMINDER_TIME:
      return {
        reminderName: match[5]?.trim() || match[1]?.trim(),
        newTime: match[6]?.trim() || match[2]?.trim()
      };

    // ==================== MOVE/DUPLICATE/RESTORE INTENTS ====================
    case INTENT_TYPES.MOVE_TASK_TO_WORKSPACE:
      return {
        taskName: match[3]?.trim() || match[1]?.trim(),
        targetWorkspace: match[5]?.trim() || match[3]?.trim()
      };

    case INTENT_TYPES.DUPLICATE_TASK:
    case INTENT_TYPES.RESTORE_TASK_FROM_TRASH:
      return { name: match[3]?.trim() || match[1]?.trim() };

    // ==================== SEARCH INTENTS ====================
    case INTENT_TYPES.SEARCH_TASKS:
    case INTENT_TYPES.SEARCH_NOTES:
      return { keyword: match[3]?.trim() || match[2]?.trim() };

    // ==================== DELETE INTENTS ====================
    case INTENT_TYPES.DELETE_HABIT:
    case INTENT_TYPES.DELETE_TASK:
    case INTENT_TYPES.DELETE_NOTE:
    case INTENT_TYPES.DELETE_SUBTASK:
    case INTENT_TYPES.DELETE_REMINDER:
    case INTENT_TYPES.DELETE_WORKSPACE:
      return { name: match[3]?.trim() || match[2]?.trim() };

    case INTENT_TYPES.DELETE_ALL_REMINDERS_ON_DATE:
      return { date: match[3]?.trim() };

    // ==================== BATCH OPERATIONS ====================
    case INTENT_TYPES.COMPLETE_MULTIPLE_TASKS_BY_NAME:
    case INTENT_TYPES.DELETE_MULTIPLE_TASKS:
    case INTENT_TYPES.DELETE_MULTIPLE_NOTES:
    case INTENT_TYPES.COMPLETE_MULTIPLE_HABITS_TODAY:
      // Extract multiple items from comma-separated list
      const items = fullMessage.split(/\s+and\s+|\s*,\s*/i)
        .filter(item => item && !/(complete|delete|mark|finish|tasks?|habits?|notes?)/i.test(item))
        .map(item => item.trim());
      return { items, requiresConfirmation: true };

    case INTENT_TYPES.COMPLETE_ALL_TASKS_DUE_TODAY:
    case INTENT_TYPES.COMPLETE_ALL_OVERDUE_TASKS:
    case INTENT_TYPES.COMPLETE_ALL_TASKS:
    case INTENT_TYPES.DELETE_ALL_COMPLETED_TASKS:
    case INTENT_TYPES.DELETE_ALL_TASKS:
    case INTENT_TYPES.DELETE_ALL_SUBTASKS:
    case INTENT_TYPES.ARCHIVE_ALL_COMPLETED_TASKS:
    case INTENT_TYPES.RESTORE_ALL_ARCHIVED_TASKS:
    case INTENT_TYPES.RESTORE_ALL_TRASHED_TASKS:
    case INTENT_TYPES.PAUSE_MULTIPLE_HABITS:
    case INTENT_TYPES.ARCHIVE_MULTIPLE_HABITS:
    case INTENT_TYPES.DELETE_MULTIPLE_HABITS:
      return { requiresConfirmation: true };

    case INTENT_TYPES.DELETE_ALL_TASKS_IN_WORKSPACE:
      return {
        workspaceName: match[4]?.trim(),
        requiresConfirmation: true
      };

    case INTENT_TYPES.COMPLETE_ALL_SUBTASKS:
      return {
        taskName: match[3]?.trim() || match[1]?.trim(),
        requiresConfirmation: true
      };

    case INTENT_TYPES.UNDO_HABIT_COMPLETION:
      return { name: match[4]?.trim() || match[1]?.trim() };

    // ==================== WORKSPACE OPERATIONS ====================
    case INTENT_TYPES.SWITCH_WORKSPACE:
      return { workspaceName: match[3]?.trim() || match[1]?.trim() };

    // ==================== LIST INTENTS ====================
    case INTENT_TYPES.LIST_SUBTASKS:
      return { taskName: match[3]?.trim() || match[1]?.trim() };

    case INTENT_TYPES.LIST_TASKS:
    case INTENT_TYPES.LIST_TODAY_TASKS:
    case INTENT_TYPES.LIST_OVERDUE_TASKS:
    case INTENT_TYPES.LIST_COMPLETED_TASKS:
    case INTENT_TYPES.LIST_HABITS:
    case INTENT_TYPES.LIST_TODAY_HABITS:
    case INTENT_TYPES.LIST_NOTES:
    case INTENT_TYPES.LIST_WORKSPACES:
    case INTENT_TYPES.LIST_REMINDERS:
      return extractFiltersAndWorkspace(fullMessage);

    default:
      return null;
  }
};

/**
 * Extract filters and workspace from list queries
 */
const extractFiltersAndWorkspace = (message) => {
  const result = {};

  // Check for status filters
  if (/\b(pending|incomplete|not\s+done)\b/i.test(message)) {
    result.status = 'pending';
  } else if (/\b(complete|completed|done|finished)\b/i.test(message)) {
    result.status = 'completed';
  } else if (/\b(overdue|late)\b/i.test(message)) {
    result.status = 'overdue';
  }

  // Check for priority filters
  if (/\b(high|urgent|important)\s+priority\b/i.test(message)) {
    result.priority = 'high';
  } else if (/\b(medium)\s+priority\b/i.test(message)) {
    result.priority = 'medium';
  } else if (/\b(low)\s+priority\b/i.test(message)) {
    result.priority = 'low';
  }

  // Check for time filters
  if (/\b(today|today'?s)\b/i.test(message)) {
    result.timeframe = 'today';
  } else if (/\b(tomorrow)\b/i.test(message)) {
    result.timeframe = 'tomorrow';
  } else if (/\b(this\s+week|week)\b/i.test(message)) {
    result.timeframe = 'week';
  }

  // Extract workspace name
  const workspaceMatch = message.match(/(?:in|from|of)\s+(?:workspace\s+)?["']?([^"'\s]+)["']?/i);
  if (workspaceMatch) {
    result.workspace = workspaceMatch[1].trim();
  }

  return Object.keys(result).length > 0 ? result : null;
};

/**
 * Get confidence level description
 */
export const getConfidenceLevel = (confidence) => {
  if (confidence >= 0.9) return 'high';
  if (confidence >= 0.7) return 'medium';
  if (confidence >= 0.5) return 'low';
  return 'none';
};

/**
 * Determine if query should be routed to AI
 */
export const shouldUseAI = (classification) => {
  // Always use AI for these cases
  if (classification.requiresAI) return true;
  if (classification.confidence < 0.8) return true;
  if (classification.type === INTENT_TYPES.UNKNOWN) return true;

  // Use direct database for high-confidence simple queries
  return false;
};

export default {
  classifyIntent,
  getConfidenceLevel,
  shouldUseAI,
  INTENT_TYPES
};