/**
 * StateEngine - Single Source of Truth for Canvas State
 * 
 * Architecture Principles:
 * 1. All state is stored as plain JSON (serializable)
 * 2. State mutations happen ONLY through intents
 * 3. Intents are validated before application
 * 4. State changes emit events for observers
 * 5. State is always consistent and valid
 */

import { EventEmitter } from 'events';
import { validateIntent, validateState } from './validators';
import { generateId } from '../utils/idGenerator';

/**
 * Intent Schema
 * All state mutations must be expressed as intents
 */
export const IntentTypes = {
    // Shape Operations
    SHAPE_CREATE: 'shape.create',
    SHAPE_UPDATE: 'shape.update',
    SHAPE_DELETE: 'shape.delete',
    SHAPE_TRANSFORM: 'shape.transform',

    // Selection Operations
    SELECTION_SET: 'selection.set',
    SELECTION_CLEAR: 'selection.clear',
    SELECTION_ADD: 'selection.add',
    SELECTION_REMOVE: 'selection.remove',

    // Layer Operations
    LAYER_REORDER: 'layer.reorder',
    LAYER_GROUP: 'layer.group',
    LAYER_UNGROUP: 'layer.ungroup',

    // Style Operations
    STYLE_UPDATE: 'style.update',
    STYLE_APPLY_PRESET: 'style.applyPreset',

    // Canvas Operations
    CANVAS_PAN: 'canvas.pan',
    CANVAS_ZOOM: 'canvas.zoom',
    CANVAS_RESIZE: 'canvas.resize',

    // Tool Operations
    TOOL_ACTIVATE: 'tool.activate',
    TOOL_DEACTIVATE: 'tool.deactivate',

    // Batch Operations
    BATCH_START: 'batch.start',
    BATCH_COMMIT: 'batch.commit',
    BATCH_ROLLBACK: 'batch.rollback',
};

/**
 * State Schema
 */
const createInitialState = () => ({
    // Core Canvas State
    canvas: {
        width: 1920,
        height: 1080,
        backgroundColor: '#ffffff',
        viewportTransform: [1, 0, 0, 1, 0, 0], // [scaleX, skewY, skewX, scaleY, translateX, translateY]
    },

    // All shapes indexed by ID
    shapes: {},

    // Shape rendering order (z-index)
    shapeOrder: [],

    // Current selection
    selection: {
        activeShapeIds: [],
        mode: 'single', // 'single' | 'multiple' | 'group'
    },

    // Active tool state
    tool: {
        active: null,
        config: {},
    },

    // Metadata
    metadata: {
        version: '1.0.0',
        createdAt: Date.now(),
        modifiedAt: Date.now(),
    },
});

/**
 * StateEngine Class
 */
export class StateEngine extends EventEmitter {
    constructor(initialState = null) {
        super();

        this.state = initialState || createInitialState();
        this.batchMode = false;
        this.batchIntents = [];
        this.listeners = new Set();

        // Validate initial state
        this._validateState();
    }

    /**
     * Get current state (immutable)
     */
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Get specific state slice
     */
    getStateSlice(path) {
        const parts = path.split('.');
        let current = this.state;

        for (const part of parts) {
            if (current === undefined || current === null) return undefined;
            current = current[part];
        }

        return JSON.parse(JSON.stringify(current));
    }

    /**
     * Apply an intent to mutate state
     */
    applyIntent(intent) {
        // Validate intent structure
        const validation = validateIntent(intent);
        if (!validation.valid) {
            throw new Error(`Invalid intent: ${validation.error}`);
        }

        // If in batch mode, queue the intent
        if (this.batchMode) {
            this.batchIntents.push(intent);
            return { success: true, batched: true };
        }

        // Apply the intent
        const result = this._executeIntent(intent);

        // Validate resulting state
        this._validateState();

        // Update metadata
        this.state.metadata.modifiedAt = Date.now();

        // Emit state change event
        this.emit('stateChanged', {
            intent,
            state: this.getState(),
            timestamp: Date.now(),
        });

        return result;
    }

    /**
     * Apply multiple intents atomically
     */
    applyIntents(intents) {
        this.startBatch();

        try {
            for (const intent of intents) {
                this.applyIntent(intent);
            }
            return this.commitBatch();
        } catch (error) {
            this.rollbackBatch();
            throw error;
        }
    }

    /**
     * Start batch mode
     */
    startBatch() {
        this.batchMode = true;
        this.batchIntents = [];
        this.batchSnapshot = JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Commit batch
     */
    commitBatch() {
        if (!this.batchMode) {
            throw new Error('Not in batch mode');
        }

        const intents = [...this.batchIntents];
        this.batchMode = false;
        this.batchIntents = [];
        delete this.batchSnapshot;

        // Emit single state change for entire batch
        this.emit('stateChanged', {
            intents,
            state: this.getState(),
            timestamp: Date.now(),
            batch: true,
        });

        return { success: true, intentCount: intents.length };
    }

    /**
     * Rollback batch
     */
    rollbackBatch() {
        if (!this.batchMode) {
            throw new Error('Not in batch mode');
        }

        this.state = this.batchSnapshot;
        this.batchMode = false;
        this.batchIntents = [];
        delete this.batchSnapshot;

        return { success: true, rolledBack: true };
    }

    /**
     * Execute a single intent (internal)
     */
    _executeIntent(intent) {
        const { type, payload } = intent;

        switch (type) {
            // Shape Operations
            case IntentTypes.SHAPE_CREATE:
                return this._handleShapeCreate(payload);

            case IntentTypes.SHAPE_UPDATE:
                return this._handleShapeUpdate(payload);

            case IntentTypes.SHAPE_DELETE:
                return this._handleShapeDelete(payload);

            case IntentTypes.SHAPE_TRANSFORM:
                return this._handleShapeTransform(payload);

            // Selection Operations
            case IntentTypes.SELECTION_SET:
                return this._handleSelectionSet(payload);

            case IntentTypes.SELECTION_CLEAR:
                return this._handleSelectionClear(payload);

            case IntentTypes.SELECTION_ADD:
                return this._handleSelectionAdd(payload);

            case IntentTypes.SELECTION_REMOVE:
                return this._handleSelectionRemove(payload);

            // Layer Operations
            case IntentTypes.LAYER_REORDER:
                return this._handleLayerReorder(payload);

            case IntentTypes.LAYER_GROUP:
                return this._handleLayerGroup(payload);

            case IntentTypes.LAYER_UNGROUP:
                return this._handleLayerUngroup(payload);

            // Style Operations
            case IntentTypes.STYLE_UPDATE:
                return this._handleStyleUpdate(payload);

            // Canvas Operations
            case IntentTypes.CANVAS_PAN:
                return this._handleCanvasPan(payload);

            case IntentTypes.CANVAS_ZOOM:
                return this._handleCanvasZoom(payload);

            case IntentTypes.CANVAS_RESIZE:
                return this._handleCanvasResize(payload);

            // Tool Operations
            case IntentTypes.TOOL_ACTIVATE:
                return this._handleToolActivate(payload);

            case IntentTypes.TOOL_DEACTIVATE:
                return this._handleToolDeactivate(payload);

            default:
                throw new Error(`Unknown intent type: ${type}`);
        }
    }

    // ==================== Intent Handlers ====================

    _handleShapeCreate(payload) {
        const { shapeType, properties } = payload;
        const id = payload.id || generateId('shape');

        // Create shape object
        const shape = {
            id,
            type: shapeType,
            ...properties,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
        };

        // Add to shapes
        this.state.shapes[id] = shape;

        // Add to render order (top)
        this.state.shapeOrder.push(id);

        return { success: true, shapeId: id };
    }

    _handleShapeUpdate(payload) {
        const { shapeId, properties } = payload;

        if (!this.state.shapes[shapeId]) {
            throw new Error(`Shape not found: ${shapeId}`);
        }

        // Update properties
        this.state.shapes[shapeId] = {
            ...this.state.shapes[shapeId],
            ...properties,
            modifiedAt: Date.now(),
        };

        return { success: true, shapeId };
    }

    _handleShapeDelete(payload) {
        const { shapeId } = payload;

        if (!this.state.shapes[shapeId]) {
            throw new Error(`Shape not found: ${shapeId}`);
        }

        // Remove from shapes
        delete this.state.shapes[shapeId];

        // Remove from render order
        this.state.shapeOrder = this.state.shapeOrder.filter(id => id !== shapeId);

        // Remove from selection if present
        this.state.selection.activeShapeIds = this.state.selection.activeShapeIds.filter(
            id => id !== shapeId
        );

        return { success: true, shapeId };
    }

    _handleShapeTransform(payload) {
        const { shapeId, transform } = payload;

        if (!this.state.shapes[shapeId]) {
            throw new Error(`Shape not found: ${shapeId}`);
        }

        const shape = this.state.shapes[shapeId];

        // Apply transform
        this.state.shapes[shapeId] = {
            ...shape,
            left: transform.left ?? shape.left,
            top: transform.top ?? shape.top,
            scaleX: transform.scaleX ?? shape.scaleX,
            scaleY: transform.scaleY ?? shape.scaleY,
            angle: transform.angle ?? shape.angle,
            modifiedAt: Date.now(),
        };

        return { success: true, shapeId };
    }

    _handleSelectionSet(payload) {
        const { shapeIds } = payload;

        // Validate all shapes exist
        for (const id of shapeIds) {
            if (!this.state.shapes[id]) {
                throw new Error(`Shape not found: ${id}`);
            }
        }

        this.state.selection.activeShapeIds = [...shapeIds];
        this.state.selection.mode = shapeIds.length > 1 ? 'multiple' : 'single';

        return { success: true, count: shapeIds.length };
    }

    _handleSelectionClear() {
        this.state.selection.activeShapeIds = [];
        this.state.selection.mode = 'single';

        return { success: true };
    }

    _handleSelectionAdd(payload) {
        const { shapeId } = payload;

        if (!this.state.shapes[shapeId]) {
            throw new Error(`Shape not found: ${shapeId}`);
        }

        if (!this.state.selection.activeShapeIds.includes(shapeId)) {
            this.state.selection.activeShapeIds.push(shapeId);
            this.state.selection.mode = this.state.selection.activeShapeIds.length > 1 ? 'multiple' : 'single';
        }

        return { success: true, shapeId };
    }

    _handleSelectionRemove(payload) {
        const { shapeId } = payload;

        this.state.selection.activeShapeIds = this.state.selection.activeShapeIds.filter(
            id => id !== shapeId
        );
        this.state.selection.mode = this.state.selection.activeShapeIds.length > 1 ? 'multiple' : 'single';

        return { success: true, shapeId };
    }

    _handleLayerReorder(payload) {
        const { shapeId, newIndex } = payload;

        if (!this.state.shapes[shapeId]) {
            throw new Error(`Shape not found: ${shapeId}`);
        }

        // Remove from current position
        this.state.shapeOrder = this.state.shapeOrder.filter(id => id !== shapeId);

        // Insert at new position
        this.state.shapeOrder.splice(newIndex, 0, shapeId);

        return { success: true, shapeId, newIndex };
    }

    _handleLayerGroup(payload) {
        const { shapeIds, groupId } = payload;
        const id = groupId || generateId('group');

        // Validate all shapes exist
        for (const shapeId of shapeIds) {
            if (!this.state.shapes[shapeId]) {
                throw new Error(`Shape not found: ${shapeId}`);
            }
        }

        // Create group shape
        const group = {
            id,
            type: 'group',
            children: [...shapeIds],
            createdAt: Date.now(),
            modifiedAt: Date.now(),
        };

        this.state.shapes[id] = group;

        // Remove children from render order
        this.state.shapeOrder = this.state.shapeOrder.filter(
            shapeId => !shapeIds.includes(shapeId)
        );

        // Add group to render order
        this.state.shapeOrder.push(id);

        return { success: true, groupId: id };
    }

    _handleLayerUngroup(payload) {
        const { groupId } = payload;

        const group = this.state.shapes[groupId];
        if (!group || group.type !== 'group') {
            throw new Error(`Group not found: ${groupId}`);
        }

        const children = [...group.children];

        // Remove group
        delete this.state.shapes[groupId];

        // Remove group from render order
        const groupIndex = this.state.shapeOrder.indexOf(groupId);
        this.state.shapeOrder.splice(groupIndex, 1);

        // Add children back to render order
        this.state.shapeOrder.splice(groupIndex, 0, ...children);

        return { success: true, groupId, children };
    }

    _handleStyleUpdate(payload) {
        const { shapeId, style } = payload;

        if (!this.state.shapes[shapeId]) {
            throw new Error(`Shape not found: ${shapeId}`);
        }

        this.state.shapes[shapeId] = {
            ...this.state.shapes[shapeId],
            ...style,
            modifiedAt: Date.now(),
        };

        return { success: true, shapeId };
    }

    _handleCanvasPan(payload) {
        const { deltaX, deltaY } = payload;

        const vt = this.state.canvas.viewportTransform;
        vt[4] += deltaX;
        vt[5] += deltaY;

        return { success: true };
    }

    _handleCanvasZoom(payload) {
        const { scale, point } = payload;

        const vt = this.state.canvas.viewportTransform;
        const currentScale = vt[0];

        if (point) {
            // Zoom to point
            const { x, y } = point;
            vt[4] = x - (x - vt[4]) * (scale / currentScale);
            vt[5] = y - (y - vt[5]) * (scale / currentScale);
        }

        vt[0] = scale;
        vt[3] = scale;

        return { success: true, scale };
    }

    _handleCanvasResize(payload) {
        const { width, height } = payload;

        this.state.canvas.width = width;
        this.state.canvas.height = height;

        return { success: true, width, height };
    }

    _handleToolActivate(payload) {
        const { toolName, config } = payload;

        this.state.tool.active = toolName;
        this.state.tool.config = config || {};

        return { success: true, toolName };
    }

    _handleToolDeactivate() {
        this.state.tool.active = null;
        this.state.tool.config = {};

        return { success: true };
    }

    // ==================== Validation ====================

    _validateState() {
        const validation = validateState(this.state);
        if (!validation.valid) {
            throw new Error(`Invalid state: ${validation.error}`);
        }
    }

    // ==================== Serialization ====================

    /**
     * Export state as JSON
     */
    exportState() {
        return JSON.stringify(this.state, null, 2);
    }

    /**
     * Import state from JSON
     */
    importState(jsonState) {
        const newState = typeof jsonState === 'string' ? JSON.parse(jsonState) : jsonState;

        // Validate new state
        const validation = validateState(newState);
        if (!validation.valid) {
            throw new Error(`Invalid imported state: ${validation.error}`);
        }

        const oldState = this.state;
        this.state = newState;

        this.emit('stateChanged', {
            intent: { type: 'state.import' },
            state: this.getState(),
            timestamp: Date.now(),
        });

        return { success: true, oldState };
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.state = createInitialState();

        this.emit('stateChanged', {
            intent: { type: 'state.reset' },
            state: this.getState(),
            timestamp: Date.now(),
        });

        return { success: true };
    }
}

export default StateEngine;
