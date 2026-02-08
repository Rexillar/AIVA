/**
 * ID Generator Utility
 * Generates unique, deterministic IDs for state objects
 */

let counter = 0;
let sessionId = null;

/**
 * Initialize session ID (call once on app start)
 */
export function initSessionId() {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    counter = 0;
    return sessionId;
}

/**
 * Generate a unique ID
 * Format: {prefix}_{sessionId}_{counter}
 */
export function generateId(prefix = 'obj') {
    if (!sessionId) {
        initSessionId();
    }

    counter++;
    return `${prefix}_${sessionId}_${counter}`;
}

/**
 * Generate a deterministic ID from content
 * Useful for CRDT operations
 */
export function generateDeterministicId(content, prefix = 'obj') {
    const hash = simpleHash(JSON.stringify(content));
    return `${prefix}_${hash}_${Date.now()}`;
}

/**
 * Simple hash function for deterministic IDs
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * Parse ID to extract components
 */
export function parseId(id) {
    const parts = id.split('_');
    if (parts.length < 3) {
        return null;
    }

    return {
        prefix: parts[0],
        sessionId: parts[1],
        counter: parseInt(parts[2], 10),
    };
}

/**
 * Check if ID is valid
 */
export function isValidId(id) {
    if (typeof id !== 'string') return false;
    const parsed = parseId(id);
    return parsed !== null && !isNaN(parsed.counter);
}
