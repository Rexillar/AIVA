/**
 * Validators for StateEngine
 * Ensures intents and state are always valid
 */

import { IntentTypes } from './StateEngine';

/**
 * Validate intent structure and payload
 */
export function validateIntent(intent) {
    if (!intent || typeof intent !== 'object') {
        return { valid: false, error: 'Intent must be an object' };
    }

    if (!intent.type || typeof intent.type !== 'string') {
        return { valid: false, error: 'Intent must have a type string' };
    }

    if (!Object.values(IntentTypes).includes(intent.type)) {
        return { valid: false, error: `Unknown intent type: ${intent.type}` };
    }

    if (!intent.payload || typeof intent.payload !== 'object') {
        return { valid: false, error: 'Intent must have a payload object' };
    }

    // Validate payload based on intent type
    return validateIntentPayload(intent.type, intent.payload);
}

/**
 * Validate intent payload based on type
 */
function validateIntentPayload(type, payload) {
    switch (type) {
        case IntentTypes.SHAPE_CREATE:
            if (!payload.shapeType) {
                return { valid: false, error: 'SHAPE_CREATE requires shapeType' };
            }
            if (!payload.properties || typeof payload.properties !== 'object') {
                return { valid: false, error: 'SHAPE_CREATE requires properties object' };
            }
            return { valid: true };

        case IntentTypes.SHAPE_UPDATE:
        case IntentTypes.SHAPE_DELETE:
        case IntentTypes.SHAPE_TRANSFORM:
            if (!payload.shapeId) {
                return { valid: false, error: `${type} requires shapeId` };
            }
            return { valid: true };

        case IntentTypes.SELECTION_SET:
            if (!Array.isArray(payload.shapeIds)) {
                return { valid: false, error: 'SELECTION_SET requires shapeIds array' };
            }
            return { valid: true };

        case IntentTypes.SELECTION_ADD:
        case IntentTypes.SELECTION_REMOVE:
            if (!payload.shapeId) {
                return { valid: false, error: `${type} requires shapeId` };
            }
            return { valid: true };

        case IntentTypes.LAYER_REORDER:
            if (!payload.shapeId || typeof payload.newIndex !== 'number') {
                return { valid: false, error: 'LAYER_REORDER requires shapeId and newIndex' };
            }
            return { valid: true };

        case IntentTypes.LAYER_GROUP:
            if (!Array.isArray(payload.shapeIds) || payload.shapeIds.length === 0) {
                return { valid: false, error: 'LAYER_GROUP requires non-empty shapeIds array' };
            }
            return { valid: true };

        case IntentTypes.LAYER_UNGROUP:
            if (!payload.groupId) {
                return { valid: false, error: 'LAYER_UNGROUP requires groupId' };
            }
            return { valid: true };

        case IntentTypes.STYLE_UPDATE:
            if (!payload.shapeId || !payload.style) {
                return { valid: false, error: 'STYLE_UPDATE requires shapeId and style' };
            }
            return { valid: true };

        case IntentTypes.CANVAS_PAN:
            if (typeof payload.deltaX !== 'number' || typeof payload.deltaY !== 'number') {
                return { valid: false, error: 'CANVAS_PAN requires deltaX and deltaY numbers' };
            }
            return { valid: true };

        case IntentTypes.CANVAS_ZOOM:
            if (typeof payload.scale !== 'number') {
                return { valid: false, error: 'CANVAS_ZOOM requires scale number' };
            }
            return { valid: true };

        case IntentTypes.CANVAS_RESIZE:
            if (typeof payload.width !== 'number' || typeof payload.height !== 'number') {
                return { valid: false, error: 'CANVAS_RESIZE requires width and height numbers' };
            }
            return { valid: true };

        case IntentTypes.TOOL_ACTIVATE:
            if (!payload.toolName) {
                return { valid: false, error: 'TOOL_ACTIVATE requires toolName' };
            }
            return { valid: true };

        case IntentTypes.SELECTION_CLEAR:
        case IntentTypes.TOOL_DEACTIVATE:
            return { valid: true };

        default:
            return { valid: false, error: `No validator for intent type: ${type}` };
    }
}

/**
 * Validate entire state structure
 */
export function validateState(state) {
    if (!state || typeof state !== 'object') {
        return { valid: false, error: 'State must be an object' };
    }

    // Validate canvas
    if (!state.canvas || typeof state.canvas !== 'object') {
        return { valid: false, error: 'State must have canvas object' };
    }

    if (typeof state.canvas.width !== 'number' || typeof state.canvas.height !== 'number') {
        return { valid: false, error: 'Canvas must have width and height numbers' };
    }

    if (!Array.isArray(state.canvas.viewportTransform) || state.canvas.viewportTransform.length !== 6) {
        return { valid: false, error: 'Canvas must have viewportTransform array of length 6' };
    }

    // Validate shapes
    if (!state.shapes || typeof state.shapes !== 'object') {
        return { valid: false, error: 'State must have shapes object' };
    }

    // Validate shapeOrder
    if (!Array.isArray(state.shapeOrder)) {
        return { valid: false, error: 'State must have shapeOrder array' };
    }

    // Ensure all shapes in shapeOrder exist
    for (const shapeId of state.shapeOrder) {
        if (!state.shapes[shapeId]) {
            return { valid: false, error: `Shape in shapeOrder not found: ${shapeId}` };
        }
    }

    // Ensure all non-group shapes are in shapeOrder
    for (const [shapeId, shape] of Object.entries(state.shapes)) {
        if (shape.type !== 'group' && !state.shapeOrder.includes(shapeId)) {
            // Groups can contain shapes not in shapeOrder
            const isInGroup = Object.values(state.shapes).some(
                s => s.type === 'group' && s.children && s.children.includes(shapeId)
            );

            if (!isInGroup) {
                return { valid: false, error: `Shape not in shapeOrder or group: ${shapeId}` };
            }
        }
    }

    // Validate selection
    if (!state.selection || typeof state.selection !== 'object') {
        return { valid: false, error: 'State must have selection object' };
    }

    if (!Array.isArray(state.selection.activeShapeIds)) {
        return { valid: false, error: 'Selection must have activeShapeIds array' };
    }

    // Ensure all selected shapes exist
    for (const shapeId of state.selection.activeShapeIds) {
        if (!state.shapes[shapeId]) {
            return { valid: false, error: `Selected shape not found: ${shapeId}` };
        }
    }

    // Validate tool
    if (!state.tool || typeof state.tool !== 'object') {
        return { valid: false, error: 'State must have tool object' };
    }

    // Validate metadata
    if (!state.metadata || typeof state.metadata !== 'object') {
        return { valid: false, error: 'State must have metadata object' };
    }

    return { valid: true };
}

/**
 * Validate shape object
 */
export function validateShape(shape) {
    if (!shape || typeof shape !== 'object') {
        return { valid: false, error: 'Shape must be an object' };
    }

    if (!shape.id || typeof shape.id !== 'string') {
        return { valid: false, error: 'Shape must have id string' };
    }

    if (!shape.type || typeof shape.type !== 'string') {
        return { valid: false, error: 'Shape must have type string' };
    }

    // Type-specific validation
    switch (shape.type) {
        case 'rect':
        case 'circle':
        case 'ellipse':
        case 'triangle':
        case 'polygon':
            if (typeof shape.left !== 'number' || typeof shape.top !== 'number') {
                return { valid: false, error: 'Shape must have left and top numbers' };
            }
            break;

        case 'line':
        case 'arrow':
            if (!Array.isArray(shape.points) || shape.points.length < 4) {
                return { valid: false, error: 'Line/Arrow must have points array with at least 4 values' };
            }
            break;

        case 'path':
            if (!shape.path || typeof shape.path !== 'string') {
                return { valid: false, error: 'Path must have path string' };
            }
            break;

        case 'text':
            if (!shape.text || typeof shape.text !== 'string') {
                return { valid: false, error: 'Text must have text string' };
            }
            break;

        case 'image':
            if (!shape.src || typeof shape.src !== 'string') {
                return { valid: false, error: 'Image must have src string' };
            }
            break;

        case 'group':
            if (!Array.isArray(shape.children)) {
                return { valid: false, error: 'Group must have children array' };
            }
            break;
    }

    return { valid: true };
}
