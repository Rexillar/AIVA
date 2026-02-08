/**
 * HistoryEngine - Intent-based Undo/Redo
 * 
 * Architecture Principles:
 * 1. Records intents, not state snapshots (memory efficient)
 * 2. Undo = apply inverse intent
 * 3. Redo = reapply original intent
 * 4. Supports batched operations as single undo/redo unit
 * 5. Maintains history stack with configurable limits
 */

import { IntentTypes } from './StateEngine';

export class HistoryEngine {
    constructor(stateEngine, options = {}) {
        this.stateEngine = stateEngine;

        // Configuration
        this.maxHistorySize = options.maxHistorySize || 100;
        this.enableCompression = options.enableCompression !== false;

        // History stacks
        this.undoStack = [];
        this.redoStack = [];

        // Track if we're currently undoing/redoing (prevent recording)
        this.isUndoing = false;
        this.isRedoing = false;

        // Listen to state changes
        this.stateEngine.on('stateChanged', this.handleStateChange.bind(this));
    }

    /**
     * Handle state change from StateEngine
     */
    handleStateChange(event) {
        // Don't record during undo/redo
        if (this.isUndoing || this.isRedoing) {
            return;
        }

        const { intent, intents, batch } = event;

        // Record the intent(s)
        if (batch && intents) {
            this.recordBatch(intents);
        } else if (intent) {
            this.recordIntent(intent);
        }
    }

    /**
     * Record a single intent
     */
    recordIntent(intent) {
        // Skip non-undoable intents
        if (!this.isUndoable(intent)) {
            return;
        }

        // Create history entry
        const entry = {
            type: 'single',
            intent,
            timestamp: Date.now(),
        };

        // Add to undo stack
        this.undoStack.push(entry);

        // Clear redo stack (new action invalidates redo)
        this.redoStack = [];

        // Enforce max size
        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
        }
    }

    /**
     * Record a batch of intents
     */
    recordBatch(intents) {
        // Filter to undoable intents
        const undoableIntents = intents.filter(intent => this.isUndoable(intent));

        if (undoableIntents.length === 0) {
            return;
        }

        // Create history entry
        const entry = {
            type: 'batch',
            intents: undoableIntents,
            timestamp: Date.now(),
        };

        // Add to undo stack
        this.undoStack.push(entry);

        // Clear redo stack
        this.redoStack = [];

        // Enforce max size
        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
        }
    }

    /**
     * Check if intent is undoable
     */
    isUndoable(intent) {
        const nonUndoableTypes = [
            IntentTypes.SELECTION_SET,
            IntentTypes.SELECTION_CLEAR,
            IntentTypes.SELECTION_ADD,
            IntentTypes.SELECTION_REMOVE,
            IntentTypes.TOOL_ACTIVATE,
            IntentTypes.TOOL_DEACTIVATE,
            IntentTypes.CANVAS_PAN,
            IntentTypes.CANVAS_ZOOM,
        ];

        return !nonUndoableTypes.includes(intent.type);
    }

    /**
     * Undo last action
     */
    undo() {
        if (!this.canUndo()) {
            return { success: false, reason: 'Nothing to undo' };
        }

        this.isUndoing = true;

        try {
            const entry = this.undoStack.pop();

            if (entry.type === 'single') {
                // Apply inverse intent
                const inverseIntent = this.createInverseIntent(entry.intent);
                this.stateEngine.applyIntent(inverseIntent);
            } else if (entry.type === 'batch') {
                // Apply inverse intents in reverse order
                const inverseIntents = entry.intents
                    .map(intent => this.createInverseIntent(intent))
                    .reverse();

                this.stateEngine.applyIntents(inverseIntents);
            }

            // Move to redo stack
            this.redoStack.push(entry);

            return { success: true };
        } catch (error) {
            console.error('Undo failed:', error);
            return { success: false, error: error.message };
        } finally {
            this.isUndoing = false;
        }
    }

    /**
     * Redo last undone action
     */
    redo() {
        if (!this.canRedo()) {
            return { success: false, reason: 'Nothing to redo' };
        }

        this.isRedoing = true;

        try {
            const entry = this.redoStack.pop();

            if (entry.type === 'single') {
                // Reapply original intent
                this.stateEngine.applyIntent(entry.intent);
            } else if (entry.type === 'batch') {
                // Reapply original intents
                this.stateEngine.applyIntents(entry.intents);
            }

            // Move back to undo stack
            this.undoStack.push(entry);

            return { success: true };
        } catch (error) {
            console.error('Redo failed:', error);
            return { success: false, error: error.message };
        } finally {
            this.isRedoing = false;
        }
    }

    /**
     * Create inverse intent for undo
     */
    createInverseIntent(intent) {
        const { type, payload } = intent;

        switch (type) {
            case IntentTypes.SHAPE_CREATE:
                // Inverse of create is delete
                return {
                    type: IntentTypes.SHAPE_DELETE,
                    payload: {
                        shapeId: payload.id || payload.shapeId,
                    },
                };

            case IntentTypes.SHAPE_DELETE: {
                // Inverse of delete is create
                // Need to capture original shape state
                const deletedShape = this.stateEngine.getStateSlice(`shapes.${payload.shapeId}`);
                return {
                    type: IntentTypes.SHAPE_CREATE,
                    payload: {
                        id: payload.shapeId,
                        shapeType: deletedShape.type,
                        properties: deletedShape,
                    },
                };
            }

            case IntentTypes.SHAPE_UPDATE:
            case IntentTypes.SHAPE_TRANSFORM:
            case IntentTypes.STYLE_UPDATE: {
                // Inverse is to restore previous properties
                // Capture current state before applying
                const currentShape = this.stateEngine.getStateSlice(`shapes.${payload.shapeId}`);

                // Extract only the properties that were changed
                const changedProps = {};
                const updateProps = payload.properties || payload.transform || payload.style;

                for (const key in updateProps) {
                    if (currentShape && key in currentShape) {
                        changedProps[key] = currentShape[key];
                    }
                }

                return {
                    type,
                    payload: {
                        shapeId: payload.shapeId,
                        [type === IntentTypes.SHAPE_UPDATE ? 'properties' :
                            type === IntentTypes.SHAPE_TRANSFORM ? 'transform' : 'style']: changedProps,
                    },
                };
            }

            case IntentTypes.LAYER_REORDER: {
                // Inverse is to move back to original position
                const currentIndex = this.stateEngine.getStateSlice('shapeOrder').indexOf(payload.shapeId);
                return {
                    type: IntentTypes.LAYER_REORDER,
                    payload: {
                        shapeId: payload.shapeId,
                        newIndex: currentIndex,
                    },
                };
            }

            case IntentTypes.LAYER_GROUP:
                // Inverse of group is ungroup
                return {
                    type: IntentTypes.LAYER_UNGROUP,
                    payload: {
                        groupId: payload.groupId,
                    },
                };

            case IntentTypes.LAYER_UNGROUP: {
                // Inverse of ungroup is group
                const group = this.stateEngine.getStateSlice(`shapes.${payload.groupId}`);
                return {
                    type: IntentTypes.LAYER_GROUP,
                    payload: {
                        shapeIds: group.children,
                        groupId: payload.groupId,
                    },
                };
            }

            case IntentTypes.CANVAS_RESIZE: {
                // Inverse is to restore previous size
                const currentCanvas = this.stateEngine.getStateSlice('canvas');
                return {
                    type: IntentTypes.CANVAS_RESIZE,
                    payload: {
                        width: currentCanvas.width,
                        height: currentCanvas.height,
                    },
                };
            }

            default:
                throw new Error(`Cannot create inverse for intent type: ${type}`);
        }
    }

    /**
     * Check if undo is available
     */
    canUndo() {
        return this.undoStack.length > 0;
    }

    /**
     * Check if redo is available
     */
    canRedo() {
        return this.redoStack.length > 0;
    }

    /**
     * Get undo stack size
     */
    getUndoCount() {
        return this.undoStack.length;
    }

    /**
     * Get redo stack size
     */
    getRedoCount() {
        return this.redoStack.length;
    }

    /**
     * Clear history
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }

    /**
     * Get history summary (for debugging)
     */
    getHistorySummary() {
        return {
            undoCount: this.undoStack.length,
            redoCount: this.redoStack.length,
            undoStack: this.undoStack.map(entry => ({
                type: entry.type,
                intentType: entry.type === 'single' ? entry.intent.type : 'batch',
                timestamp: entry.timestamp,
            })),
            redoStack: this.redoStack.map(entry => ({
                type: entry.type,
                intentType: entry.type === 'single' ? entry.intent.type : 'batch',
                timestamp: entry.timestamp,
            })),
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stateEngine.removeAllListeners('stateChanged');
        this.clear();
    }
}

export default HistoryEngine;
