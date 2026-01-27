/**
 * QUICK START GUIDE
 * How to integrate StateEngine into FocusCanvas.jsx in 5 minutes
 */

// ==================== STEP 1: Import Engines ====================

import { fabric } from 'fabric';
import StateEngine, { IntentTypes } from './engines/StateEngine';
import CanvasAdapter from './engines/CanvasAdapter';
import HistoryEngine from './engines/HistoryEngine';
import { initSessionId } from './utils/idGenerator';

// ==================== STEP 2: Initialize in useEffect ====================

const FocusCanvas = () => {
    const canvasRef = useRef(null);
    const [engines, setEngines] = useState(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize session ID (once per app load)
        initSessionId();

        // Create Fabric canvas
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: '#ffffff',
        });

        // Create StateEngine (source of truth)
        const stateEngine = new StateEngine();

        // Create CanvasAdapter (Fabric ↔ State bridge)
        const canvasAdapter = new CanvasAdapter(fabricCanvas, stateEngine);

        // Create HistoryEngine (undo/redo)
        const historyEngine = new HistoryEngine(stateEngine);

        // Store engines
        setEngines({
            fabricCanvas,
            stateEngine,
            canvasAdapter,
            historyEngine,
        });

        // Listen to state changes (optional - for UI updates)
        stateEngine.on('stateChanged', (event) => {
            console.log('State changed:', event);
            // Update layer panel, properties panel, etc.
        });

        // Cleanup
        return () => {
            canvasAdapter.destroy();
            historyEngine.destroy();
            fabricCanvas.dispose();
        };
    }, []);

    // ==================== STEP 3: Replace Shape Creation Functions ====================

    // ❌ OLD: addRect function
    const addRectOLD = () => {
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            width: 200,
            height: 150,
            fill: '#3498db',
        });
        fabricCanvas.add(rect);
        fabricCanvas.renderAll();
    };

    // ✅ NEW: addRect function
    const addRect = () => {
        if (!engines) return;

        engines.stateEngine.applyIntent({
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
    };

    // ✅ NEW: addCircle function
    const addCircle = () => {
        if (!engines) return;

        engines.stateEngine.applyIntent({
            type: IntentTypes.SHAPE_CREATE,
            payload: {
                shapeType: 'circle',
                properties: {
                    left: 200,
                    top: 200,
                    radius: 50,
                    fill: '#e74c3c',
                    stroke: null,
                    strokeWidth: 0,
                },
            },
        });
    };

    // ✅ NEW: addTriangle function
    const addTriangle = () => {
        if (!engines) return;

        engines.stateEngine.applyIntent({
            type: IntentTypes.SHAPE_CREATE,
            payload: {
                shapeType: 'triangle',
                properties: {
                    left: 300,
                    top: 300,
                    width: 100,
                    height: 100,
                    fill: '#2ecc71',
                    stroke: null,
                    strokeWidth: 0,
                },
            },
        });
    };

    // ✅ NEW: addLine function
    const addLine = () => {
        if (!engines) return;

        engines.stateEngine.applyIntent({
            type: IntentTypes.SHAPE_CREATE,
            payload: {
                shapeType: 'line',
                properties: {
                    points: [50, 50, 200, 200],
                    stroke: '#000000',
                    strokeWidth: 2,
                },
            },
        });
    };

    // ==================== STEP 4: Replace Delete Function ====================

    // ❌ OLD: deleteSelected function
    const deleteSelectedOLD = () => {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            fabricCanvas.remove(activeObject);
            fabricCanvas.renderAll();
        }
    };

    // ✅ NEW: deleteSelected function
    const deleteSelected = () => {
        if (!engines) return;

        const state = engines.stateEngine.getState();
        const selectedIds = state.selection.activeShapeIds;

        if (selectedIds.length === 0) return;

        // Delete all selected shapes
        const intents = selectedIds.map(shapeId => ({
            type: IntentTypes.SHAPE_DELETE,
            payload: { shapeId },
        }));

        engines.stateEngine.applyIntents(intents);
    };

    // ==================== STEP 5: Replace Undo/Redo ====================

    // ❌ OLD: Manual undo/redo
    const [stateHistory, setStateHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const undoOLD = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            fabricCanvas.loadFromJSON(stateHistory[newIndex], () => {
                fabricCanvas.renderAll();
                setHistoryIndex(newIndex);
            });
        }
    };

    // ✅ NEW: Undo/Redo
    const undo = () => {
        if (!engines) return;
        engines.historyEngine.undo();
    };

    const redo = () => {
        if (!engines) return;
        engines.historyEngine.redo();
    };

    // ==================== STEP 6: Replace Style Updates ====================

    // ❌ OLD: Change fill color
    const changeFillColorOLD = (color) => {
        const activeObject = fabricCanvas.getActiveObject();
        if (activeObject) {
            activeObject.set('fill', color);
            fabricCanvas.renderAll();
        }
    };

    // ✅ NEW: Change fill color
    const changeFillColor = (color) => {
        if (!engines) return;

        const state = engines.stateEngine.getState();
        const selectedIds = state.selection.activeShapeIds;

        if (selectedIds.length === 0) return;

        // Update all selected shapes
        const intents = selectedIds.map(shapeId => ({
            type: IntentTypes.STYLE_UPDATE,
            payload: {
                shapeId,
                style: { fill: color },
            },
        }));

        engines.stateEngine.applyIntents(intents);
    };

    // ✅ NEW: Change stroke
    const changeStroke = (color, width) => {
        if (!engines) return;

        const state = engines.stateEngine.getState();
        const selectedIds = state.selection.activeShapeIds;

        if (selectedIds.length === 0) return;

        const intents = selectedIds.map(shapeId => ({
            type: IntentTypes.STYLE_UPDATE,
            payload: {
                shapeId,
                style: {
                    stroke: color,
                    strokeWidth: width,
                },
            },
        }));

        engines.stateEngine.applyIntents(intents);
    };

    // ==================== STEP 7: Save/Load Project ====================

    // ✅ NEW: Save project
    const saveProject = () => {
        if (!engines) return;

        const json = engines.stateEngine.exportState();

        // Save to localStorage
        localStorage.setItem('focuscanvas-project', json);

        // Or download as file
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'focuscanvas-project.json';
        a.click();
    };

    // ✅ NEW: Load project
    const loadProject = (json) => {
        if (!engines) return;

        engines.stateEngine.importState(json);
        // CanvasAdapter automatically rebuilds Fabric canvas!
    };

    // ==================== STEP 8: Get State for UI ====================

    // ✅ Get current selection
    const getSelectedShapes = () => {
        if (!engines) return [];

        const state = engines.stateEngine.getState();
        return state.selection.activeShapeIds.map(id => state.shapes[id]);
    };

    // ✅ Get all shapes for layer panel
    const getAllShapes = () => {
        if (!engines) return [];

        const state = engines.stateEngine.getState();
        return state.shapeOrder.map(id => state.shapes[id]);
    };

    // ✅ Get shape properties for properties panel
    const getShapeProperties = (shapeId) => {
        if (!engines) return null;

        return engines.stateEngine.getStateSlice(`shapes.${shapeId}`);
    };

    // ==================== STEP 9: Keyboard Shortcuts ====================

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!engines) return;

            // Ctrl+Z / Cmd+Z - Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                engines.historyEngine.undo();
            }

            // Ctrl+Shift+Z / Cmd+Shift+Z - Redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                engines.historyEngine.redo();
            }

            // Delete / Backspace - Delete selected
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                deleteSelected();
            }

            // Ctrl+S / Cmd+S - Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveProject();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [engines]);

    // ==================== STEP 10: Render UI ====================

    return (
        <div className="focus-canvas">
            {/* Toolbar */}
            <div className="toolbar">
                <button onClick={addRect}>Rectangle</button>
                <button onClick={addCircle}>Circle</button>
                <button onClick={addTriangle}>Triangle</button>
                <button onClick={addLine}>Line</button>
                <button onClick={deleteSelected}>Delete</button>
                <button onClick={undo} disabled={!engines?.historyEngine.canUndo()}>
                    Undo
                </button>
                <button onClick={redo} disabled={!engines?.historyEngine.canRedo()}>
                    Redo
                </button>
                <button onClick={saveProject}>Save</button>
            </div>

            {/* Canvas */}
            <canvas ref={canvasRef} />

            {/* Layer Panel (optional) */}
            <div className="layer-panel">
                {getAllShapes().map(shape => (
                    <div key={shape.id} className="layer-item">
                        {shape.type} - {shape.id}
                    </div>
                ))}
            </div>

            {/* Properties Panel (optional) */}
            <div className="properties-panel">
                {getSelectedShapes().map(shape => (
                    <div key={shape.id}>
                        <h3>Properties</h3>
                        <div>Type: {shape.type}</div>
                        <div>Fill: {shape.fill}</div>
                        <div>Stroke: {shape.stroke}</div>
                        {/* Add more properties as needed */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FocusCanvas;

// ==================== DONE! ====================
// That's it! You've successfully integrated the StateEngine architecture.
//
// Benefits you now have:
// ✅ Single source of truth (StateEngine)
// ✅ Automatic undo/redo
// ✅ Easy save/load
// ✅ Real-time ready
// ✅ Deterministic state
// ✅ Easy to debug
//
// Next steps:
// 1. Test all functions
// 2. Add more shape types
// 3. Add more tools
// 4. Implement CRDTEngine for real-time collaboration
