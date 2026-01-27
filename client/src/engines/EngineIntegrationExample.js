/**
 * Engine Integration Example
 * 
 * This file demonstrates how to integrate the new engine architecture
 * into FocusCanvas.jsx
 * 
 * MIGRATION STEPS:
 * 1. Initialize engines in component mount
 * 2. Replace direct Fabric mutations with intent emissions
 * 3. Remove manual state management code
 * 4. Connect UI controls to emit intents
 */

import { fabric } from 'fabric';
import StateEngine, { IntentTypes } from './engines/StateEngine';
import CanvasAdapter from './engines/CanvasAdapter';
import HistoryEngine from './engines/HistoryEngine';
import { initSessionId } from './utils/idGenerator';

/**
 * Example: Initialize engines in FocusCanvas component
 */
export function initializeEngines(canvasElement) {
    // Initialize session ID
    initSessionId();

    // Create Fabric canvas
    const fabricCanvas = new fabric.Canvas(canvasElement, {
        width: 1920,
        height: 1080,
        backgroundColor: '#ffffff',
    });

    // Create StateEngine (source of truth)
    const stateEngine = new StateEngine();

    // Create CanvasAdapter (Fabric ↔ State bridge)
    const canvasAdapter = new CanvasAdapter(fabricCanvas, stateEngine);

    // Create HistoryEngine (undo/redo)
    const historyEngine = new HistoryEngine(stateEngine);

    return {
        fabricCanvas,
        stateEngine,
        canvasAdapter,
        historyEngine,
    };
}

/**
 * Example: Create a rectangle (OLD vs NEW)
 */

// ❌ OLD WAY: Direct Fabric mutation
function createRectangleOld(fabricCanvas) {
    const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 200,
        height: 150,
        fill: '#3498db',
    });

    fabricCanvas.add(rect);
    fabricCanvas.renderAll();
}

// ✅ NEW WAY: Emit intent to StateEngine
function createRectangleNew(stateEngine) {
    stateEngine.applyIntent({
        type: IntentTypes.SHAPE_CREATE,
        payload: {
            shapeType: 'rect',
            properties: {
                left: 100,
                top: 100,
                width: 200,
                height: 150,
                fill: '#3498db',
                stroke: null,
                strokeWidth: 0,
            },
        },
    });

    // That's it! CanvasAdapter automatically updates Fabric
    // HistoryEngine automatically records for undo/redo
}

/**
 * Example: Update shape properties (OLD vs NEW)
 */

// ❌ OLD WAY: Direct Fabric mutation
function updateShapeOld(fabricCanvas, fabricObject) {
    fabricObject.set({
        fill: '#e74c3c',
        stroke: '#c0392b',
        strokeWidth: 2,
    });

    fabricCanvas.renderAll();
}

// ✅ NEW WAY: Emit intent to StateEngine
function updateShapeNew(stateEngine, shapeId) {
    stateEngine.applyIntent({
        type: IntentTypes.STYLE_UPDATE,
        payload: {
            shapeId,
            style: {
                fill: '#e74c3c',
                stroke: '#c0392b',
                strokeWidth: 2,
            },
        },
    });
}

/**
 * Example: Delete shape (OLD vs NEW)
 */

// ❌ OLD WAY: Direct Fabric mutation
function deleteShapeOld(fabricCanvas, fabricObject) {
    fabricCanvas.remove(fabricObject);
    fabricCanvas.renderAll();
}

// ✅ NEW WAY: Emit intent to StateEngine
function deleteShapeNew(stateEngine, shapeId) {
    stateEngine.applyIntent({
        type: IntentTypes.SHAPE_DELETE,
        payload: {
            shapeId,
        },
    });
}

/**
 * Example: Undo/Redo (OLD vs NEW)
 */

// ❌ OLD WAY: Manual state snapshots
let stateHistory = [];
let historyIndex = -1;

function saveStateOld(fabricCanvas) {
    const json = fabricCanvas.toJSON();
    stateHistory = stateHistory.slice(0, historyIndex + 1);
    stateHistory.push(json);
    historyIndex++;
}

function undoOld(fabricCanvas) {
    if (historyIndex > 0) {
        historyIndex--;
        fabricCanvas.loadFromJSON(stateHistory[historyIndex], () => {
            fabricCanvas.renderAll();
        });
    }
}

// ✅ NEW WAY: Automatic intent-based history
function undoNew(historyEngine) {
    historyEngine.undo();
    // That's it! Automatically applies inverse intents
}

function redoNew(historyEngine) {
    historyEngine.redo();
    // Automatically reapplies original intents
}

/**
 * Example: Batch operations (multiple shapes at once)
 */
function createMultipleShapesNew(stateEngine) {
    const intents = [
        {
            type: IntentTypes.SHAPE_CREATE,
            payload: {
                shapeType: 'rect',
                properties: { left: 100, top: 100, width: 100, height: 100, fill: '#3498db' },
            },
        },
        {
            type: IntentTypes.SHAPE_CREATE,
            payload: {
                shapeType: 'circle',
                properties: { left: 300, top: 100, radius: 50, fill: '#e74c3c' },
            },
        },
        {
            type: IntentTypes.SHAPE_CREATE,
            payload: {
                shapeType: 'triangle',
                properties: { left: 500, top: 100, width: 100, height: 100, fill: '#2ecc71' },
            },
        },
    ];

    // Apply all intents atomically
    stateEngine.applyIntents(intents);

    // HistoryEngine treats this as ONE undo/redo operation
}

/**
 * Example: Listen to state changes
 */
function setupStateListener(stateEngine) {
    stateEngine.on('stateChanged', (event) => {
        console.log('State changed:', event);

        // Update UI (e.g., layer panel, properties panel)
        updateLayerPanel(event.state);
        updatePropertiesPanel(event.state);

        // Save to localStorage/server
        saveToBackend(event.state);
    });
}

/**
 * Example: Export/Import state (for save/load)
 */
function saveProject(stateEngine) {
    const json = stateEngine.exportState();

    // Save to file or server
    localStorage.setItem('focuscanvas-project', json);

    return json;
}

function loadProject(stateEngine, json) {
    stateEngine.importState(json);

    // CanvasAdapter automatically rebuilds Fabric canvas
}

/**
 * Example: Tool integration
 */
function activatePenTool(stateEngine) {
    stateEngine.applyIntent({
        type: IntentTypes.TOOL_ACTIVATE,
        payload: {
            toolName: 'pen',
            config: {
                strokeWidth: 2,
                strokeColor: '#000000',
            },
        },
    });
}

/**
 * Example: Get current state for UI
 */
function getCurrentSelection(stateEngine) {
    const selection = stateEngine.getStateSlice('selection');
    return selection.activeShapeIds;
}

function getShapeProperties(stateEngine, shapeId) {
    const shape = stateEngine.getStateSlice(`shapes.${shapeId}`);
    return shape;
}

/**
 * MIGRATION CHECKLIST FOR FocusCanvas.jsx:
 * 
 * 1. ✅ Add engine initialization in useEffect
 * 2. ⬜ Replace addRect() to use IntentTypes.SHAPE_CREATE
 * 3. ⬜ Replace addCircle() to use IntentTypes.SHAPE_CREATE
 * 4. ⬜ Replace addTriangle() to use IntentTypes.SHAPE_CREATE
 * 5. ⬜ Replace addLine() to use IntentTypes.SHAPE_CREATE
 * 6. ⬜ Replace deleteSelected() to use IntentTypes.SHAPE_DELETE
 * 7. ⬜ Replace color/style updates to use IntentTypes.STYLE_UPDATE
 * 8. ⬜ Replace undo/redo with historyEngine.undo()/redo()
 * 9. ⬜ Replace manual selection tracking with StateEngine selection
 * 10. ⬜ Replace save/load with stateEngine.exportState()/importState()
 * 11. ⬜ Remove all direct fabricCanvas.add/remove calls
 * 12. ⬜ Remove manual state management code
 * 13. ⬜ Connect layer panel to state.shapeOrder
 * 14. ⬜ Connect properties panel to state.shapes[selectedId]
 */

// Placeholder functions (implement based on your UI)
function updateLayerPanel(state) {
    // Update layer panel UI with state.shapeOrder
}

function updatePropertiesPanel(state) {
    // Update properties panel UI with selected shape properties
}

function saveToBackend(state) {
    // Auto-save to server
}

export {
    createRectangleNew,
    updateShapeNew,
    deleteShapeNew,
    undoNew,
    redoNew,
    createMultipleShapesNew,
    setupStateListener,
    saveProject,
    loadProject,
    activatePenTool,
    getCurrentSelection,
    getShapeProperties,
};
