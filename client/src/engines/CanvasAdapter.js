/**
 * CanvasAdapter - One-way projection from StateEngine to Fabric.js
 * 
 * Architecture Principles:
 * 1. StateEngine is the source of truth
 * 2. Fabric canvas is a VIEW of the state (read-only projection)
 * 3. User interactions on Fabric emit intents to StateEngine
 * 4. StateEngine changes trigger Fabric updates
 * 5. Never mutate Fabric directly - always go through StateEngine
 */

import { fabric } from 'fabric';

export class CanvasAdapter {
    constructor(fabricCanvas, stateEngine) {
        this.fabricCanvas = fabricCanvas;
        this.stateEngine = stateEngine;

        // Map of state shape IDs to Fabric objects
        this.shapeMap = new Map();

        // Track if we're currently syncing (prevent feedback loops)
        this.syncing = false;

        // Listen to state changes
        this.stateEngine.on('stateChanged', this.handleStateChange.bind(this));

        // Setup Fabric event listeners
        this.setupFabricListeners();

        // Initial sync
        this.fullSync();
    }

    /**
     * Full sync: rebuild entire Fabric canvas from state
     */
    fullSync() {
        this.syncing = true;

        try {
            // Clear Fabric canvas
            this.fabricCanvas.clear();
            this.shapeMap.clear();

            const state = this.stateEngine.getState();

            // Set canvas properties
            this.fabricCanvas.setWidth(state.canvas.width);
            this.fabricCanvas.setHeight(state.canvas.height);
            this.fabricCanvas.setBackgroundColor(state.canvas.backgroundColor, () => {
                this.fabricCanvas.renderAll();
            });
            this.fabricCanvas.setViewportTransform(state.canvas.viewportTransform);

            // Create Fabric objects in render order
            for (const shapeId of state.shapeOrder) {
                const shape = state.shapes[shapeId];
                if (shape) {
                    this.createFabricObject(shape);
                }
            }

            // Sync selection
            this.syncSelection(state.selection);

            this.fabricCanvas.renderAll();
        } finally {
            this.syncing = false;
        }
    }

    /**
     * Handle state change from StateEngine
     */
    handleStateChange(event) {
        if (this.syncing) return;

        this.syncing = true;

        try {
            const { intent, state } = event;

            // Handle batch updates
            if (event.batch) {
                this.fullSync();
                return;
            }

            // Handle individual intents
            if (intent) {
                this.handleIntent(intent, state);
            }

            this.fabricCanvas.renderAll();
        } finally {
            this.syncing = false;
        }
    }

    /**
     * Handle individual intent
     */
    handleIntent(intent, state) {
        const { type, payload } = intent;

        switch (type) {
            case 'shape.create':
                this.handleShapeCreate(state, payload);
                break;

            case 'shape.update':
                this.handleShapeUpdate(state, payload);
                break;

            case 'shape.delete':
                this.handleShapeDelete(payload);
                break;

            case 'shape.transform':
                this.handleShapeTransform(state, payload);
                break;

            case 'selection.set':
            case 'selection.clear':
            case 'selection.add':
            case 'selection.remove':
                this.syncSelection(state.selection);
                break;

            case 'layer.reorder':
                this.handleLayerReorder(state);
                break;

            case 'layer.group':
            case 'layer.ungroup':
                this.fullSync(); // Groups require full rebuild
                break;

            case 'style.update':
                this.handleStyleUpdate(state, payload);
                break;

            case 'canvas.pan':
            case 'canvas.zoom':
                this.fabricCanvas.setViewportTransform(state.canvas.viewportTransform);
                break;

            case 'canvas.resize':
                this.fabricCanvas.setWidth(state.canvas.width);
                this.fabricCanvas.setHeight(state.canvas.height);
                break;

            default:
                // Unknown intent, do full sync to be safe
                this.fullSync();
        }
    }

    /**
     * Create Fabric object from state shape
     */
    createFabricObject(shape) {
        let fabricObj;

        switch (shape.type) {
            case 'rect':
                fabricObj = new fabric.Rect({
                    left: shape.left,
                    top: shape.top,
                    width: shape.width,
                    height: shape.height,
                    fill: shape.fill,
                    stroke: shape.stroke,
                    strokeWidth: shape.strokeWidth,
                    angle: shape.angle || 0,
                    scaleX: shape.scaleX || 1,
                    scaleY: shape.scaleY || 1,
                    rx: shape.rx || 0,
                    ry: shape.ry || 0,
                });
                break;

            case 'circle':
                fabricObj = new fabric.Circle({
                    left: shape.left,
                    top: shape.top,
                    radius: shape.radius,
                    fill: shape.fill,
                    stroke: shape.stroke,
                    strokeWidth: shape.strokeWidth,
                    angle: shape.angle || 0,
                    scaleX: shape.scaleX || 1,
                    scaleY: shape.scaleY || 1,
                });
                break;

            case 'ellipse':
                fabricObj = new fabric.Ellipse({
                    left: shape.left,
                    top: shape.top,
                    rx: shape.rx,
                    ry: shape.ry,
                    fill: shape.fill,
                    stroke: shape.stroke,
                    strokeWidth: shape.strokeWidth,
                    angle: shape.angle || 0,
                    scaleX: shape.scaleX || 1,
                    scaleY: shape.scaleY || 1,
                });
                break;

            case 'triangle':
                fabricObj = new fabric.Triangle({
                    left: shape.left,
                    top: shape.top,
                    width: shape.width,
                    height: shape.height,
                    fill: shape.fill,
                    stroke: shape.stroke,
                    strokeWidth: shape.strokeWidth,
                    angle: shape.angle || 0,
                    scaleX: shape.scaleX || 1,
                    scaleY: shape.scaleY || 1,
                });
                break;

            case 'line':
                fabricObj = new fabric.Line(shape.points, {
                    stroke: shape.stroke,
                    strokeWidth: shape.strokeWidth,
                    angle: shape.angle || 0,
                    scaleX: shape.scaleX || 1,
                    scaleY: shape.scaleY || 1,
                });
                break;

            case 'polygon':
                fabricObj = new fabric.Polygon(shape.points, {
                    left: shape.left,
                    top: shape.top,
                    fill: shape.fill,
                    stroke: shape.stroke,
                    strokeWidth: shape.strokeWidth,
                    angle: shape.angle || 0,
                    scaleX: shape.scaleX || 1,
                    scaleY: shape.scaleY || 1,
                });
                break;

            case 'path':
                fabricObj = new fabric.Path(shape.path, {
                    left: shape.left,
                    top: shape.top,
                    fill: shape.fill,
                    stroke: shape.stroke,
                    strokeWidth: shape.strokeWidth,
                    angle: shape.angle || 0,
                    scaleX: shape.scaleX || 1,
                    scaleY: shape.scaleY || 1,
                });
                break;

            case 'text':
                fabricObj = new fabric.Text(shape.text, {
                    left: shape.left,
                    top: shape.top,
                    fontSize: shape.fontSize,
                    fontFamily: shape.fontFamily,
                    fill: shape.fill,
                    angle: shape.angle || 0,
                    scaleX: shape.scaleX || 1,
                    scaleY: shape.scaleY || 1,
                });
                break;

            case 'image':
                // Images need async loading
                fabric.Image.fromURL(shape.src, (img) => {
                    img.set({
                        left: shape.left,
                        top: shape.top,
                        angle: shape.angle || 0,
                        scaleX: shape.scaleX || 1,
                        scaleY: shape.scaleY || 1,
                    });
                    img.stateId = shape.id;
                    this.shapeMap.set(shape.id, img);
                    this.fabricCanvas.add(img);
                    this.fabricCanvas.renderAll();
                });
                return; // Early return for async

            case 'group': {
                // Create group from children
                const children = shape.children
                    .map(childId => this.shapeMap.get(childId))
                    .filter(Boolean);

                fabricObj = new fabric.Group(children, {
                    left: shape.left,
                    top: shape.top,
                    angle: shape.angle || 0,
                    scaleX: shape.scaleX || 1,
                    scaleY: shape.scaleY || 1,
                });
                break;
            }

            default:
                console.warn(`Unknown shape type: ${shape.type}`);
                return;
        }

        if (fabricObj) {
            // Store state ID on Fabric object
            fabricObj.stateId = shape.id;

            // Add to map and canvas
            this.shapeMap.set(shape.id, fabricObj);
            this.fabricCanvas.add(fabricObj);
        }
    }

    /**
     * Handle shape creation
     */
    handleShapeCreate(state, payload) {
        const shape = state.shapes[payload.shapeId || payload.id];
        if (shape) {
            this.createFabricObject(shape);
        }
    }

    /**
     * Handle shape update
     */
    handleShapeUpdate(state, payload) {
        const fabricObj = this.shapeMap.get(payload.shapeId);
        const shape = state.shapes[payload.shapeId];

        if (fabricObj && shape) {
            // Update properties
            fabricObj.set(payload.properties);
        }
    }

    /**
     * Handle shape deletion
     */
    handleShapeDelete(payload) {
        const fabricObj = this.shapeMap.get(payload.shapeId);

        if (fabricObj) {
            this.fabricCanvas.remove(fabricObj);
            this.shapeMap.delete(payload.shapeId);
        }
    }

    /**
     * Handle shape transform
     */
    handleShapeTransform(state, payload) {
        const fabricObj = this.shapeMap.get(payload.shapeId);
        const shape = state.shapes[payload.shapeId];

        if (fabricObj && shape) {
            fabricObj.set({
                left: shape.left,
                top: shape.top,
                scaleX: shape.scaleX,
                scaleY: shape.scaleY,
                angle: shape.angle,
            });
            fabricObj.setCoords();
        }
    }

    /**
     * Handle style update
     */
    handleStyleUpdate(state, payload) {
        const fabricObj = this.shapeMap.get(payload.shapeId);
        const shape = state.shapes[payload.shapeId];

        if (fabricObj && shape) {
            fabricObj.set(payload.style);
        }
    }

    /**
     * Handle layer reorder
     */
    handleLayerReorder(state) {
        // Rebuild z-order based on state.shapeOrder
        const objects = [];

        for (const shapeId of state.shapeOrder) {
            const fabricObj = this.shapeMap.get(shapeId);
            if (fabricObj) {
                objects.push(fabricObj);
            }
        }

        this.fabricCanvas._objects = objects;
    }

    /**
     * Sync selection state
     */
    syncSelection(selection) {
        this.fabricCanvas.discardActiveObject();

        if (selection.activeShapeIds.length === 0) {
            return;
        }

        const fabricObjects = selection.activeShapeIds
            .map(id => this.shapeMap.get(id))
            .filter(Boolean);

        if (fabricObjects.length === 1) {
            this.fabricCanvas.setActiveObject(fabricObjects[0]);
        } else if (fabricObjects.length > 1) {
            const activeSelection = new fabric.ActiveSelection(fabricObjects, {
                canvas: this.fabricCanvas,
            });
            this.fabricCanvas.setActiveObject(activeSelection);
        }
    }

    /**
     * Setup Fabric event listeners to emit intents
     */
    setupFabricListeners() {
        // Object modified (transform, move, etc.)
        this.fabricCanvas.on('object:modified', (e) => {
            if (this.syncing) return;

            const fabricObj = e.target;
            if (!fabricObj.stateId) return;

            this.stateEngine.applyIntent({
                type: 'shape.transform',
                payload: {
                    shapeId: fabricObj.stateId,
                    transform: {
                        left: fabricObj.left,
                        top: fabricObj.top,
                        scaleX: fabricObj.scaleX,
                        scaleY: fabricObj.scaleY,
                        angle: fabricObj.angle,
                    },
                },
            });
        });

        // Selection changed
        this.fabricCanvas.on('selection:created', (e) => {
            if (this.syncing) return;

            const shapeIds = this.getSelectedShapeIds(e.selected);
            this.stateEngine.applyIntent({
                type: 'selection.set',
                payload: { shapeIds },
            });
        });

        this.fabricCanvas.on('selection:updated', (e) => {
            if (this.syncing) return;

            const shapeIds = this.getSelectedShapeIds(e.selected);
            this.stateEngine.applyIntent({
                type: 'selection.set',
                payload: { shapeIds },
            });
        });

        this.fabricCanvas.on('selection:cleared', () => {
            if (this.syncing) return;

            this.stateEngine.applyIntent({
                type: 'selection.clear',
                payload: {},
            });
        });
    }

    /**
     * Get state IDs from selected Fabric objects
     */
    getSelectedShapeIds(selected) {
        if (!selected) return [];
        return selected.map(obj => obj.stateId).filter(Boolean);
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stateEngine.removeAllListeners('stateChanged');
        this.fabricCanvas.off('object:modified');
        this.fabricCanvas.off('selection:created');
        this.fabricCanvas.off('selection:updated');
        this.fabricCanvas.off('selection:cleared');
        this.shapeMap.clear();
    }
}

export default CanvasAdapter;
