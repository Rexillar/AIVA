# FocusCanvas Engine Architecture

## 🎯 Overview

This directory contains the **distributed real-time architecture engine** for FocusCanvas. The engine transforms FocusCanvas from a monolithic Fabric.js wrapper into a scalable, collaborative canvas with:

- ✅ **Single Source of Truth** - All state in JSON
- ✅ **Intent-Based Mutations** - No direct Fabric manipulation
- ✅ **Automatic Undo/Redo** - Intent-based history
- ✅ **Real-Time Ready** - CRDT-compatible architecture
- ✅ **Deterministic Replay** - Session recording/debugging
- ✅ **Type Safety** - Validated intents and state

---

## 📁 Architecture Components

### 1. **StateEngine.js** - Single Source of Truth

The core state management engine. All canvas state lives here as plain JSON.

**Key Features:**
- Intent-based mutations (no direct state access)
- Automatic validation
- Event emission for observers
- Batch operations
- State serialization/deserialization

**Example:**
```javascript
import StateEngine, { IntentTypes } from './engines/StateEngine';

const stateEngine = new StateEngine();

// Create a rectangle
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
    },
  },
});

// Get current state
const state = stateEngine.getState();
console.log(state.shapes); // All shapes
```

---

### 2. **CanvasAdapter.js** - Fabric.js Bridge

One-way projection from StateEngine to Fabric.js. Fabric is a **read-only view** of the state.

**Key Features:**
- Automatic Fabric sync on state changes
- User interactions emit intents (not direct mutations)
- Prevents feedback loops
- Efficient incremental updates

**Data Flow:**
```
User Action → Fabric Event → Intent → StateEngine → State Change → CanvasAdapter → Fabric Update
```

**Example:**
```javascript
import CanvasAdapter from './engines/CanvasAdapter';

const adapter = new CanvasAdapter(fabricCanvas, stateEngine);

// That's it! Adapter handles everything:
// - State changes → Fabric updates
// - Fabric interactions → Intent emissions
```

---

### 3. **HistoryEngine.js** - Undo/Redo

Intent-based undo/redo system. Records intents, not state snapshots.

**Key Features:**
- Memory efficient (intents vs snapshots)
- Automatic inverse intent generation
- Batch operation support
- Configurable history limits

**Example:**
```javascript
import HistoryEngine from './engines/HistoryEngine';

const historyEngine = new HistoryEngine(stateEngine);

// Undo/Redo
historyEngine.undo(); // Applies inverse intent
historyEngine.redo(); // Reapplies original intent

// Check availability
if (historyEngine.canUndo()) {
  historyEngine.undo();
}
```

---

### 4. **validators.js** - Intent & State Validation

Ensures all intents and state are valid before application.

**Key Features:**
- Intent schema validation
- State consistency checks
- Shape-specific validation
- Detailed error messages

---

### 5. **EngineIntegrationExample.js** - Migration Guide

Complete examples showing OLD vs NEW patterns for migrating FocusCanvas.

---

## 🔄 Data Flow Architecture

### Before (Monolithic)
```
UI → Fabric.js (mutate directly) → Manual state sync → Manual undo/redo
```

**Problems:**
- State scattered across UI and Fabric
- No single source of truth
- Undo/redo is fragile
- Can't support real-time collaboration
- Hard to debug

### After (Engine Architecture)
```
UI → Intent → StateEngine → State Change Event
                ↓
         CanvasAdapter → Fabric.js (read-only view)
                ↓
         HistoryEngine → Undo/Redo
                ↓
         CRDTEngine → Real-Time Sync (future)
```

**Benefits:**
- ✅ Single source of truth (StateEngine)
- ✅ Deterministic state mutations
- ✅ Automatic undo/redo
- ✅ Real-time ready
- ✅ Easy to debug (replay intents)
- ✅ Testable (pure functions)

---

## 🚀 Quick Start

### 1. Initialize Engines

```javascript
import { initializeEngines } from './engines/EngineIntegrationExample';

// In your component
const { fabricCanvas, stateEngine, canvasAdapter, historyEngine } = 
  initializeEngines(canvasElementRef.current);
```

### 2. Create Shapes (Intent-Based)

```javascript
// ❌ OLD: Direct Fabric mutation
fabricCanvas.add(new fabric.Rect({ ... }));

// ✅ NEW: Emit intent
stateEngine.applyIntent({
  type: IntentTypes.SHAPE_CREATE,
  payload: {
    shapeType: 'rect',
    properties: { left: 100, top: 100, width: 200, height: 150, fill: '#3498db' },
  },
});
```

### 3. Update Shapes

```javascript
// ❌ OLD: Direct Fabric mutation
fabricObject.set({ fill: '#e74c3c' });
fabricCanvas.renderAll();

// ✅ NEW: Emit intent
stateEngine.applyIntent({
  type: IntentTypes.STYLE_UPDATE,
  payload: {
    shapeId: 'shape_123',
    style: { fill: '#e74c3c' },
  },
});
```

### 4. Delete Shapes

```javascript
// ❌ OLD: Direct Fabric mutation
fabricCanvas.remove(fabricObject);

// ✅ NEW: Emit intent
stateEngine.applyIntent({
  type: IntentTypes.SHAPE_DELETE,
  payload: { shapeId: 'shape_123' },
});
```

### 5. Undo/Redo

```javascript
// ❌ OLD: Manual state snapshots
const json = fabricCanvas.toJSON();
stateHistory.push(json);

// ✅ NEW: Automatic
historyEngine.undo();
historyEngine.redo();
```

---

## 📋 Intent Types Reference

### Shape Operations
- `SHAPE_CREATE` - Create a new shape
- `SHAPE_UPDATE` - Update shape properties
- `SHAPE_DELETE` - Delete a shape
- `SHAPE_TRANSFORM` - Transform (move, scale, rotate)

### Selection Operations
- `SELECTION_SET` - Set selected shapes
- `SELECTION_CLEAR` - Clear selection
- `SELECTION_ADD` - Add to selection
- `SELECTION_REMOVE` - Remove from selection

### Layer Operations
- `LAYER_REORDER` - Change z-index
- `LAYER_GROUP` - Group shapes
- `LAYER_UNGROUP` - Ungroup shapes

### Style Operations
- `STYLE_UPDATE` - Update shape styles

### Canvas Operations
- `CANVAS_PAN` - Pan viewport
- `CANVAS_ZOOM` - Zoom viewport
- `CANVAS_RESIZE` - Resize canvas

### Tool Operations
- `TOOL_ACTIVATE` - Activate a tool
- `TOOL_DEACTIVATE` - Deactivate tool

---

## 🧪 Testing

### Unit Tests
```javascript
import StateEngine, { IntentTypes } from './StateEngine';

test('creates shape correctly', () => {
  const engine = new StateEngine();
  
  const result = engine.applyIntent({
    type: IntentTypes.SHAPE_CREATE,
    payload: {
      shapeType: 'rect',
      properties: { left: 100, top: 100, width: 200, height: 150 },
    },
  });
  
  expect(result.success).toBe(true);
  expect(engine.getState().shapes[result.shapeId]).toBeDefined();
});
```

### Integration Tests
```javascript
test('undo/redo works correctly', () => {
  const stateEngine = new StateEngine();
  const historyEngine = new HistoryEngine(stateEngine);
  
  // Create shape
  stateEngine.applyIntent({
    type: IntentTypes.SHAPE_CREATE,
    payload: { shapeType: 'rect', properties: { ... } },
  });
  
  const stateAfterCreate = stateEngine.getState();
  
  // Undo
  historyEngine.undo();
  
  const stateAfterUndo = stateEngine.getState();
  expect(Object.keys(stateAfterUndo.shapes).length).toBe(0);
  
  // Redo
  historyEngine.redo();
  
  const stateAfterRedo = stateEngine.getState();
  expect(stateAfterRedo).toEqual(stateAfterCreate);
});
```

---

## 🔮 Future Enhancements

### Phase 2: Real-Time Collaboration
- **CRDTEngine** - Conflict-free replicated data types
- **PresenceEngine** - Live cursors and user awareness
- **SyncEngine** - WebSocket/WebRTC synchronization

### Phase 3: Advanced Features
- **ReplayEngine** - Session recording and playback
- **ToolRegistry** - Centralized tool management
- **PluginSystem** - Extensible architecture

---

## 📚 Migration Checklist

Use this checklist when migrating FocusCanvas.jsx:

- [ ] Initialize engines in `useEffect`
- [ ] Replace `addRect()` with `SHAPE_CREATE` intent
- [ ] Replace `addCircle()` with `SHAPE_CREATE` intent
- [ ] Replace `addTriangle()` with `SHAPE_CREATE` intent
- [ ] Replace `addLine()` with `SHAPE_CREATE` intent
- [ ] Replace `deleteSelected()` with `SHAPE_DELETE` intent
- [ ] Replace color/style updates with `STYLE_UPDATE` intent
- [ ] Replace undo/redo with `historyEngine.undo()/redo()`
- [ ] Replace manual selection tracking with StateEngine
- [ ] Replace save/load with `exportState()/importState()`
- [ ] Remove all direct `fabricCanvas.add/remove` calls
- [ ] Remove manual state management code
- [ ] Connect layer panel to `state.shapeOrder`
- [ ] Connect properties panel to `state.shapes[selectedId]`

---

## 🐛 Debugging

### View Current State
```javascript
console.log(stateEngine.getState());
```

### View History
```javascript
console.log(historyEngine.getHistorySummary());
```

### Listen to State Changes
```javascript
stateEngine.on('stateChanged', (event) => {
  console.log('Intent:', event.intent);
  console.log('New State:', event.state);
});
```

### Export State for Debugging
```javascript
const json = stateEngine.exportState();
console.log(json);
```

---

## 💡 Best Practices

1. **Never mutate Fabric directly** - Always emit intents
2. **Use batch operations** - For multiple related changes
3. **Validate intents** - Let validators catch errors early
4. **Listen to state changes** - Update UI reactively
5. **Export state frequently** - For auto-save and debugging

---

## 🤝 Contributing

When adding new features:

1. Define new intent types in `StateEngine.js`
2. Add validators in `validators.js`
3. Implement intent handlers in `StateEngine.js`
4. Update `CanvasAdapter.js` if Fabric sync needed
5. Add inverse intent logic to `HistoryEngine.js`
6. Update this README

---

## 📄 License

Part of the FocusCanvas project.
