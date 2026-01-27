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

   ⟁  SYSTEM LAYER : FRONTEND CORE
   ⟁  DOMAIN       : API SERVICES

   ⟁  PURPOSE      : Handle client-server communication

   ⟁  WHY          : Reliable API integration and error handling

   ⟁  WHAT         : HTTP client and API request management

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/components.md

   ⟁  USAGE RULES  : Handle errors • Retry logic • Authentication

        "APIs called. Data fetched. Communication reliable."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

export const AMBIGUITY_STATES = {
  IDLE: 'idle',
  AWAITING_CONFIRMATION: 'awaiting_confirmation',
  AWAITING_CLARIFICATION: 'awaiting_clarification'
};

/**
 * Represents an ambiguous choice point in conversation
 */
class AmbiguityState {
  constructor(questionId, question, options, context = {}) {
    this.questionId = questionId;
    this.question = question;
    this.options = options; // [{id, label, description, icon, action}]
    this.context = context; // Original assistant message, workspace info, etc.
    this.selectedOption = null;
    this.createdAt = Date.now();
    this.expiresAt = Date.now() + (10 * 60 * 1000); // 10 minute timeout
  }

  isExpired() {
    return Date.now() > this.expiresAt;
  }

  isValidOption(optionId) {
    return this.options.some(opt => opt.id === optionId);
  }

  /**
   * Check if input is ambiguous (like "yes", "ok", "no", etc.)
   */
  static isAmbiguousInput(input) {
    const ambiguousPatterns = [
      /^(yes|y|ok|okay|sure|sure thing|yep|yeah|yup|uh-huh|uh huh)$/i,
      /^(no|nope|nah|nay)$/i,
      /^(maybe|perhaps|i don't know|dunno|idk|unsure)$/i,
      /^(either|both|all|any|depends)$/i,
      /^(first|second|third|option|choice|number|1st|2nd|3rd)$/i,
      /^(one|two|three|four|five)$/i
    ];
    
    return ambiguousPatterns.some(pattern => pattern.test(input.trim()));
  }

  toJSON() {
    return {
      questionId: this.questionId,
      question: this.question,
      options: this.options,
      context: this.context,
      selectedOption: this.selectedOption,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt
    };
  }

  static fromJSON(data) {
    const state = new AmbiguityState(
      data.questionId,
      data.question,
      data.options,
      data.context
    );
    state.selectedOption = data.selectedOption;
    state.createdAt = data.createdAt;
    state.expiresAt = data.expiresAt;
    return state;
  }
}

/**
 * Ambiguity State Manager
 * Handles tracking and validation of ambiguous conversation states
 */
class AmbiguityStateManager {
  constructor() {
    this.currentState = null;
    this.stateHistory = [];
    this.maxHistorySize = 50;
  }

  /**
   * Enter ambiguous state with options
   */
  enterAmbiguityState(question, options, context = {}) {
    const questionId = `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentState = new AmbiguityState(
      questionId,
      question,
      options,
      context
    );
    
    this.stateHistory.push(this.currentState);
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }

    return {
      state: AMBIGUITY_STATES.AWAITING_CONFIRMATION,
      ambiguity: {
        questionId,
        question,
        options,
        context
      }
    };
  }

  /**
   * Process user selection in ambiguous state
   */
  processSelection(optionId) {
    if (!this.currentState || this.currentState.isExpired()) {
      return {
        valid: false,
        message: 'Question has expired. Please ask again.'
      };
    }

    if (!this.currentState.isValidOption(optionId)) {
      return {
        valid: false,
        message: `Invalid option selected.`
      };
    }

    const selectedOption = this.currentState.options.find(opt => opt.id === optionId);
    this.currentState.selectedOption = optionId;

    return {
      valid: true,
      selectedOption,
      context: this.currentState.context
    };
  }

  /**
   * Try to process natural language input in ambiguous state
   */
  processNaturalInput(input) {
    if (!this.currentState || this.currentState.isExpired()) {
      return {
        type: 'state_expired',
        message: 'Previous question has expired. Please ask again.'
      };
    }

    // Check if input is ambiguous
    if (AmbiguityState.isAmbiguousInput(input)) {
      return {
        type: 'ambiguous',
        message: `I'm not sure which option you meant. Please select one explicitly.`,
        requiresDialog: true
      };
    }

    // Try exact match with option IDs or labels
    const cleanInput = input.trim().toLowerCase();
    const matchedOption = this.currentState.options.find(opt => 
      opt.id.toLowerCase() === cleanInput ||
      opt.label.toLowerCase().includes(cleanInput) ||
      cleanInput.includes(opt.label.toLowerCase())
    );
    
    if (matchedOption) {
      this.currentState.selectedOption = matchedOption.id;
      return {
        type: 'matched',
        selectedOption: matchedOption,
        context: this.currentState.context
      };
    }

    // Input doesn't match any option
    return {
      type: 'no_match',
      message: `I don't recognize that option. Please select from the options above.`,
      requiresDialog: true
    };
  }

  clearAmbiguityState() {
    this.currentState = null;
  }

  isLocked() {
    return this.currentState !== null && !this.currentState.isExpired();
  }

  getCurrentState() {
    if (!this.currentState) return null;
    
    return {
      questionId: this.currentState.questionId,
      question: this.currentState.question,
      options: this.currentState.options,
      context: this.currentState.context,
      isExpired: this.currentState.isExpired(),
      createdAt: this.currentState.createdAt,
      expiresAt: this.currentState.expiresAt
    };
  }

  reset() {
    this.currentState = null;
    this.stateHistory = [];
  }

  toJSON() {
    return {
      currentState: this.currentState ? this.currentState.toJSON() : null,
      stateHistory: this.stateHistory.map(s => s.toJSON())
    };
  }

  static fromJSON(data) {
    const manager = new AmbiguityStateManager();
    if (data.currentState) {
      manager.currentState = AmbiguityState.fromJSON(data.currentState);
    }
    manager.stateHistory = (data.stateHistory || []).map(s => AmbiguityState.fromJSON(s));
    return manager;
  }
}

// Singleton instance
let globalAmbiguityManager = new AmbiguityStateManager();

export const getAmbiguityManager = () => globalAmbiguityManager;
export const setAmbiguityManager = (manager) => { globalAmbiguityManager = manager; };
export const resetAmbiguityManager = () => { globalAmbiguityManager = new AmbiguityStateManager(); };
export const createAmbiguityStateManager = () => new AmbiguityStateManager();

export { AmbiguityStateManager, AmbiguityState };
