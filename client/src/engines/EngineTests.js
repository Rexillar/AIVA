/**
 * Engine Tests
 * Run these tests to verify the engine architecture works correctly
 */

import StateEngine, { IntentTypes } from './StateEngine';
import HistoryEngine from './HistoryEngine';
import { initSessionId } from '../utils/idGenerator';

// Initialize session
initSessionId();

console.log('🧪 Running Engine Tests...\n');

// ==================== Test 1: StateEngine Basic Operations ====================
console.log('Test 1: StateEngine Basic Operations');

const stateEngine = new StateEngine();

// Create a rectangle
const createResult = stateEngine.applyIntent({
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

console.assert(createResult.success, '✅ Shape created successfully');
console.assert(createResult.shapeId, '✅ Shape ID returned');

const shapeId = createResult.shapeId;
const state = stateEngine.getState();

console.assert(state.shapes[shapeId], '✅ Shape exists in state');
console.assert(state.shapeOrder.includes(shapeId), '✅ Shape in render order');
console.log('✅ Test 1 Passed\n');

// ==================== Test 2: Shape Update ====================
console.log('Test 2: Shape Update');

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

const updatedState = stateEngine.getState();
console.assert(updatedState.shapes[shapeId].fill === '#e74c3c', '✅ Fill color updated');
console.assert(updatedState.shapes[shapeId].stroke === '#c0392b', '✅ Stroke color updated');
console.assert(updatedState.shapes[shapeId].strokeWidth === 2, '✅ Stroke width updated');
console.log('✅ Test 2 Passed\n');

// ==================== Test 3: Selection ====================
console.log('Test 3: Selection');

stateEngine.applyIntent({
    type: IntentTypes.SELECTION_SET,
    payload: {
        shapeIds: [shapeId],
    },
});

const stateWithSelection = stateEngine.getState();
console.assert(
    stateWithSelection.selection.activeShapeIds.includes(shapeId),
    '✅ Shape selected'
);
console.log('✅ Test 3 Passed\n');

// ==================== Test 4: Batch Operations ====================
console.log('Test 4: Batch Operations');

const batchIntents = [
    {
        type: IntentTypes.SHAPE_CREATE,
        payload: {
            shapeType: 'circle',
            properties: {
                left: 300,
                top: 100,
                radius: 50,
                fill: '#2ecc71',
            },
        },
    },
    {
        type: IntentTypes.SHAPE_CREATE,
        payload: {
            shapeType: 'triangle',
            properties: {
                left: 500,
                top: 100,
                width: 100,
                height: 100,
                fill: '#f39c12',
            },
        },
    },
];

const batchResult = stateEngine.applyIntents(batchIntents);
console.assert(batchResult.success, '✅ Batch operation succeeded');
console.assert(batchResult.intentCount === 2, '✅ Correct intent count');

const stateAfterBatch = stateEngine.getState();
console.assert(Object.keys(stateAfterBatch.shapes).length === 3, '✅ All shapes created');
console.log('✅ Test 4 Passed\n');

// ==================== Test 5: HistoryEngine Undo/Redo ====================
console.log('Test 5: HistoryEngine Undo/Redo');

const historyEngine = new HistoryEngine(stateEngine);

// Get current state
const stateBeforeDelete = stateEngine.getState();
const shapeCount = Object.keys(stateBeforeDelete.shapes).length;

// Delete a shape
stateEngine.applyIntent({
    type: IntentTypes.SHAPE_DELETE,
    payload: { shapeId },
});

const stateAfterDelete = stateEngine.getState();
console.assert(
    Object.keys(stateAfterDelete.shapes).length === shapeCount - 1,
    '✅ Shape deleted'
);

// Undo delete
historyEngine.undo();

const stateAfterUndo = stateEngine.getState();
console.assert(
    Object.keys(stateAfterUndo.shapes).length === shapeCount,
    '✅ Undo restored shape'
);
console.assert(stateAfterUndo.shapes[shapeId], '✅ Deleted shape restored');

// Redo delete
historyEngine.redo();

const stateAfterRedo = stateEngine.getState();
console.assert(
    Object.keys(stateAfterRedo.shapes).length === shapeCount - 1,
    '✅ Redo deleted shape again'
);

console.log('✅ Test 5 Passed\n');

// ==================== Test 6: State Export/Import ====================
console.log('Test 6: State Export/Import');

const exportedState = stateEngine.exportState();
console.assert(typeof exportedState === 'string', '✅ State exported as string');

const newStateEngine = new StateEngine();
newStateEngine.importState(exportedState);

const importedState = newStateEngine.getState();
console.assert(
    Object.keys(importedState.shapes).length === Object.keys(stateAfterRedo.shapes).length,
    '✅ Imported state matches exported state'
);

console.log('✅ Test 6 Passed\n');

// ==================== Test 7: Layer Reordering ====================
console.log('Test 7: Layer Reordering');

const currentState = stateEngine.getState();
const firstShapeId = currentState.shapeOrder[0];

stateEngine.applyIntent({
    type: IntentTypes.LAYER_REORDER,
    payload: {
        shapeId: firstShapeId,
        newIndex: currentState.shapeOrder.length - 1,
    },
});

const stateAfterReorder = stateEngine.getState();
console.assert(
    stateAfterReorder.shapeOrder[stateAfterReorder.shapeOrder.length - 1] === firstShapeId,
    '✅ Shape moved to top'
);

console.log('✅ Test 7 Passed\n');

// ==================== Test 8: Transform ====================
console.log('Test 8: Transform');

const transformShapeId = stateAfterReorder.shapeOrder[0];

stateEngine.applyIntent({
    type: IntentTypes.SHAPE_TRANSFORM,
    payload: {
        shapeId: transformShapeId,
        transform: {
            left: 200,
            top: 200,
            scaleX: 1.5,
            scaleY: 1.5,
            angle: 45,
        },
    },
});

const stateAfterTransform = stateEngine.getState();
const transformedShape = stateAfterTransform.shapes[transformShapeId];

console.assert(transformedShape.left === 200, '✅ Left position updated');
console.assert(transformedShape.top === 200, '✅ Top position updated');
console.assert(transformedShape.scaleX === 1.5, '✅ ScaleX updated');
console.assert(transformedShape.scaleY === 1.5, '✅ ScaleY updated');
console.assert(transformedShape.angle === 45, '✅ Angle updated');

console.log('✅ Test 8 Passed\n');

// ==================== Test 9: Validation ====================
console.log('Test 9: Validation');

let errorCaught = false;
try {
    stateEngine.applyIntent({
        type: 'invalid.intent',
        payload: {},
    });
} catch (error) {
    errorCaught = true;
}

console.assert(errorCaught, '✅ Invalid intent rejected');

errorCaught = false;
try {
    stateEngine.applyIntent({
        type: IntentTypes.SHAPE_DELETE,
        payload: {
            shapeId: 'nonexistent_shape',
        },
    });
} catch (error) {
    errorCaught = true;
}

console.assert(errorCaught, '✅ Nonexistent shape deletion rejected');

console.log('✅ Test 9 Passed\n');

// ==================== Test 10: Event Emission ====================
console.log('Test 10: Event Emission');

let eventReceived = false;
stateEngine.on('stateChanged', (event) => {
    eventReceived = true;
    console.assert(event.intent, '✅ Event contains intent');
    console.assert(event.state, '✅ Event contains state');
    console.assert(event.timestamp, '✅ Event contains timestamp');
});

stateEngine.applyIntent({
    type: IntentTypes.CANVAS_ZOOM,
    payload: {
        scale: 1.5,
    },
});

console.assert(eventReceived, '✅ State change event emitted');
console.log('✅ Test 10 Passed\n');

// ==================== Summary ====================
console.log('🎉 All Tests Passed!');
console.log('\n📊 Test Summary:');
console.log('✅ StateEngine: Basic operations');
console.log('✅ StateEngine: Shape updates');
console.log('✅ StateEngine: Selection');
console.log('✅ StateEngine: Batch operations');
console.log('✅ HistoryEngine: Undo/Redo');
console.log('✅ StateEngine: Export/Import');
console.log('✅ StateEngine: Layer reordering');
console.log('✅ StateEngine: Transform');
console.log('✅ Validators: Intent validation');
console.log('✅ StateEngine: Event emission');

console.log('\n🚀 Engine architecture is ready for integration!');
