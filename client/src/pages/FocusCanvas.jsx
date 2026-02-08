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
   ⟁  DOMAIN       : PAGE COMPONENTS

   ⟁  PURPOSE      : Implement complete page views and layouts

   ⟁  WHY          : Organized application navigation and structure

   ⟁  WHAT         : Full page React components with routing

   ⟁  TECH STACK   : React • Redux • Vite
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/frontend/pages.md

   ⟁  USAGE RULES  : Manage routing • Handle data • User experience

        "Pages rendered. Navigation smooth. User journey optimized."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { useState, useEffect, useRef, useCallback } from 'react';
import React from 'react';
/* eslint-disable react-hooks/exhaustive-deps */
import * as fabric from 'fabric';
import {
  FaMousePointer,
  FaPen,
  FaSquare,
  FaCircle,
  FaFont,
  FaStickyNote,
  FaShapes,
  FaUndo,
  FaRedo,
  FaDownload,
  FaShare,
  FaCog,
  FaTrash,
  FaArrowRight,
  FaMinus,
  FaHighlighter,
  FaExpand,
  FaTh,
  FaMoon,
  FaSun,
  FaGem,
  FaStar,
  FaHeart,
  FaLink,
  FaHandPaper,
  FaTimes,
  FaPlus,
  FaSave,
  FaMagic,
  FaEraser,
  FaDatabase,
  FaFileAlt,
  FaCloud
} from 'react-icons/fa';
import {
  createCanvas as createCanvasAPI,
  getCanvases as getCanvasesAPI,
  updateCanvas as updateCanvasAPI,
  deleteCanvas as deleteCanvasAPI
} from '../services/canvasService';
/* Custom Shape Icons */
const ShapeDiamond = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2L2 12l10 10 10-10L12 2z" /></svg>
);
const ShapeParallelogram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M5 19h14l4-14H9L5 19z" /></svg>
);
const ShapeTriangle = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2L2 22h20L12 2z" /></svg>
);
const ShapeHexagon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" /></svg>
);
const ShapeOctagon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z" /></svg>
);
const ShapePentagon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2l9.51 6.91-3.63 11.18h-11.76l-3.63-11.18L12 2z" /></svg>
);

const Canvas = () => {
  // Multi-canvas state - now loaded from API
  const [canvases, setCanvases] = useState([]);
  const [activeCanvasId, setActiveCanvasId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [lastSaved, setLastSaved] = useState(null);

  // Canvas-specific state
  const [activeTool, setActiveTool] = useState('select');
  const [zoom, setZoom] = useState(100);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [selectedShape, setSelectedShape] = useState('rectangle');
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [connections, setConnections] = useState([]);
  const [connectionMode, setConnectionMode] = useState('directional'); // 'directional' or 'bidirectional'
  const [contextMenu, setContextMenu] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [frames, setFrames] = useState([]);
  const [isCreatingFrame, setIsCreatingFrame] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedObjects, setSelectedObjects] = useState([]);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Refs for stable canvas management
  const canvasRef = useRef(null);
  const containerRef = useRef(null); // Ref for the outer container that determines available space
  const fabricCanvas = useRef(null);
  const gridRef = useRef(null);
  const hasLoadedCanvases = useRef(false);
  const saveTimeoutRef = useRef(null);
  const autoSaveIntervalRef = useRef(null);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#FFFF00', '#00FFFF'
  ];

  // Auto-layout helper: Find optimal position for new node
  const findOptimalPosition = useCallback((width = 180, height = 80) => {
    if (!fabricCanvas.current) return { x: 100, y: 100 };

    const objects = fabricCanvas.current.getObjects().filter(obj =>
      obj !== gridRef.current && obj.selectable !== false
    );

    // If canvas is empty, start at center
    if (objects.length === 0) {
      return {
        x: fabricCanvas.current.width / 2,
        y: fabricCanvas.current.height / 2
      };
    }

    // Calculate grid-based positioning
    const gridSize = 220; // Space between nodes
    const startX = 150;
    const startY = 150;
    const maxColumns = Math.floor((fabricCanvas.current.width - 200) / gridSize);

    // Try positions in a grid pattern
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < maxColumns; col++) {
        const x = startX + col * gridSize;
        const y = startY + row * gridSize;

        // Check if this position overlaps with any existing object
        const overlaps = objects.some(obj => {
          const objBounds = obj.getBoundingRect();
          const margin = 40; // Minimum spacing between objects

          return (
            x + width / 2 + margin > objBounds.left &&
            x - width / 2 - margin < objBounds.left + objBounds.width &&
            y + height / 2 + margin > objBounds.top &&
            y - height / 2 - margin < objBounds.top + objBounds.height
          );
        });

        if (!overlaps) {
          return { x, y };
        }
      }
    }

    // Fallback: position to the right of the last object
    const lastObject = objects[objects.length - 1];
    const lastBounds = lastObject.getBoundingRect();
    return {
      x: lastBounds.left + lastBounds.width + gridSize,
      y: lastBounds.top
    };
  }, []);

  // Snap to grid function
  const snapToGridValue = useCallback((value) => {
    if (!snapToGrid) return value;
    const gridSize = 20;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid]);

  // Draw infinite grid background (like Eraser.io) - PERFECT VERSION
  const drawGrid = useCallback((canvas) => {
    if (!canvas || !showGrid) return;

    const gridSize = 20;

    // Remove existing grid
    if (gridRef.current) {
      try {
        canvas.remove(gridRef.current);
      } catch (error) {
        console.warn('Could not remove existing grid:', error);
      }
    }

    // Get viewport transform to calculate visible area
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    const zoom = canvas.getZoom();

    // Calculate the visible area with extra padding for smooth panning
    const padding = 2000;
    const left = (-vpt[4] / zoom) - padding;
    const top = (-vpt[5] / zoom) - padding;
    const width = (canvas.width / zoom) + (padding * 2);
    const height = (canvas.height / zoom) + (padding * 2);

    // Snap to grid to avoid misalignment
    const startX = Math.floor(left / gridSize) * gridSize;
    const startY = Math.floor(top / gridSize) * gridSize;
    const endX = startX + width + gridSize;
    const endY = startY + height + gridSize;

    const gridLines = [];
    // More visible grid like Eraser.io
    const strokeColor = isDarkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.15)';
    const strokeWidth = 1 / zoom; // Keep lines crisp at any zoom level

    // Draw vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      gridLines.push(new fabric.Line([x, startY, x, endY], {
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        selectable: false,
        evented: false,
      }));
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      gridLines.push(new fabric.Line([startX, y, endX, y], {
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        selectable: false,
        evented: false,
      }));
    }

    const gridGroup = new fabric.Group(gridLines, {
      selectable: false,
      evented: false,
      hoverCursor: 'default',
      hasControls: false,
      hasBorders: false,
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      excludeFromExport: true,
    });

    canvas.add(gridGroup);
    if (typeof canvas.sendToBack === 'function') {
      canvas.sendToBack(gridGroup);
    }
    gridRef.current = gridGroup;
  }, [showGrid, isDarkMode]);

  // Zoom functions with real-time, low-latency updates
  const zoomIn = useCallback(() => {
    if (!fabricCanvas.current) return;

    const newZoom = Math.min(zoom + 10, 500); // Max 500%
    setZoom(newZoom);

    const zoomLevel = newZoom / 100;
    const center = fabricCanvas.current.getCenter();

    // Use zoomToPoint for smooth, centered zooming
    fabricCanvas.current.zoomToPoint(
      { x: center.left, y: center.top },
      zoomLevel
    );
  }, [zoom]);

  const zoomOut = useCallback(() => {
    if (!fabricCanvas.current) return;

    const newZoom = Math.max(zoom - 10, 10); // Min 10%
    setZoom(newZoom);

    const zoomLevel = newZoom / 100;
    const center = fabricCanvas.current.getCenter();

    // Use zoomToPoint for smooth, centered zooming
    fabricCanvas.current.zoomToPoint(
      { x: center.left, y: center.top },
      zoomLevel
    );
  }, [zoom]);

  const fitToScreen = useCallback(() => {
    if (!fabricCanvas.current) return;
    fabricCanvas.current.setZoom(1);
    fabricCanvas.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
    setZoom(100);
  }, []);

  // Multi-canvas functions
  const createNewCanvas = useCallback(async () => {
    try {
      const canvasNumber = canvases.length + 1;
      const response = await createCanvasAPI({
        name: `Canvas ${canvasNumber}`,
        data: null
      });

      if (response.success) {
        setCanvases(prev => [...prev, response.data]);
        setActiveCanvasId(response.data._id);
      }
    } catch (error) {
      console.error('Error creating new canvas:', error);
    }
  }, [canvases]);

  const switchCanvas = useCallback(async (canvasId) => {
    if (canvasId === activeCanvasId) return;

    try {
      // Save current canvas data
      if (fabricCanvas.current && activeCanvasId) {
        setSaving(true);
        const currentCanvasData = fabricCanvas.current.toJSON();
        await updateCanvasAPI(activeCanvasId, { data: currentCanvasData });
        setCanvases(prev => prev.map(c =>
          c._id === activeCanvasId ? { ...c, data: currentCanvasData } : c
        ));
      }

      // Switch to new canvas
      setActiveCanvasId(canvasId);

      // Load canvas data for the new canvas
      const targetCanvas = canvases.find(c => c._id === canvasId);
      if (targetCanvas && targetCanvas.data && fabricCanvas.current) {
        fabricCanvas.current.loadFromJSON(targetCanvas.data, () => {
          if (fabricCanvas.current) {
            fabricCanvas.current.renderAll();
          }
        });
      } else if (fabricCanvas.current) {
        // Clear canvas for new/empty canvas
        try {
          fabricCanvas.current.clear();
          if (typeof drawGrid === 'function') {
            drawGrid(fabricCanvas.current);
          }
          fabricCanvas.current.renderAll();
        } catch (error) {
          console.warn('Error clearing canvas:', error);
        }
      }
    } catch (error) {
      console.error('Error switching canvas:', error);
    } finally {
      setSaving(false);
    }
  }, [activeCanvasId, canvases, drawGrid]);

  const closeCanvas = useCallback(async (canvasId) => {
    if (canvases.length <= 1) return; // Don't close the last canvas

    try {
      await deleteCanvasAPI(canvasId);
      setCanvases(prev => prev.filter(c => c._id !== canvasId));

      if (activeCanvasId === canvasId) {
        const remainingCanvases = canvases.filter(c => c._id !== canvasId);
        if (remainingCanvases.length > 0) {
          setActiveCanvasId(remainingCanvases[0]._id);
        }
      }
    } catch (error) {
      console.error('Error deleting canvas:', error);
    }
  }, [canvases, activeCanvasId]);

  // Initialize Fabric.js canvas
  useEffect(() => {
    // Guard: ensure canvas element exists
    if (!canvasRef.current) return;

    // Dispose any existing instance (hot reload safety)
    if (fabricCanvas.current) {
      try {
        fabricCanvas.current.dispose();
      } catch (error) {
        console.warn('Error disposing existing canvas:', error);
      }
      fabricCanvas.current = null;
    }

    const canvasElement = canvasRef.current;
    const parentElement = canvasElement.parentElement;

    if (!parentElement) return;

    // Get actual dimensions after layout
    const width = parentElement.offsetWidth || window.innerWidth - 320;
    const height = parentElement.offsetHeight || window.innerHeight - 64;

    // Initialize Fabric canvas once
    const canvas = new fabric.Canvas(canvasElement, {
      width: width,
      height: height,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
      selection: true,
      allowTouchScrolling: true,
    });

    // Store in ref for component-wide access
    fabricCanvas.current = canvas;

    // Set up canvas properties
    canvas.isDrawingMode = false;

    // Enable smooth animations for object transformations
    fabric.Object.prototype.set({
      borderColor: 'rgba(0, 120, 255, 0.8)',
      cornerColor: 'rgba(0, 120, 255, 0.9)',
      cornerSize: 12,
      transparentCorners: false,
      cornerStyle: 'circle',
      borderDashArray: [5, 5],
      padding: 8,
    });

    // Add animation easing for smoother transformations
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (obj) {
        obj.set({
          opacity: 0.8, // Slight transparency while moving
        });
        canvas.renderAll();
      }
    });

    canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (obj) {
        // Smooth transition back to full opacity
        obj.animate('opacity', 1, {
          duration: 200,
          onChange: canvas.renderAll.bind(canvas),
          easing: fabric.util.ease.easeOutCubic,
        });

        // Auto-resize frames when contained objects are modified
        frames.forEach(frame => {
          if (frame.metadata && frame.metadata.type === 'frame' && frame.metadata.autoResize) {
            updateFrameSize(frame);
          }
        });
      }
    });

    // Animate object scaling
    canvas.on('object:scaling', (e) => {
      const obj = e.target;
      if (obj && obj.shadow) {
        // Enhance shadow during scaling for depth effect
        obj.set({
          shadow: {
            ...obj.shadow,
            blur: 20,
            offsetY: 5,
          }
        });
        canvas.renderAll();
      }
    });

    // Enable pan and zoom with mouse wheel
    canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 4) zoom = 4;
      if (zoom < 0.25) zoom = 0.25;
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      setZoom(Math.round(zoom * 100));
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Pan functionality with Space key support (like Eraser.io)
    let isPanning = false;
    let lastPosX, lastPosY;
    let isSpacePressed = false;

    // Space key for temporary panning (prevent page scroll)
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !isSpacePressed && !e.repeat) {
        // Prevent page scroll when Space is pressed
        e.preventDefault();
        e.stopPropagation();

        isSpacePressed = true;
        canvas.defaultCursor = 'grab';
        canvas.hoverCursor = 'grab';

        // Disable selection while space is pressed
        canvas.selection = false;
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        isSpacePressed = false;
        isPanning = false;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'move';
        canvas.selection = true;
      }
    };

    // Prevent default Space key behavior globally
    const preventSpaceScroll = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', preventSpaceScroll); // Prevent page scroll

    canvas.on('mouse:down', (opt) => {
      // Prevent grid selection
      if (opt.target && gridRef.current && opt.target === gridRef.current) {
        opt.target = null;
        canvas.discardActiveObject();
        canvas.renderAll();
        return;
      }

      // Enable panning with Space+drag, Alt+drag, or pan tool
      if (isSpacePressed || (activeTool === 'select' && opt.e.altKey) || activeTool === 'pan') {
        isPanning = true;
        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
        canvas.selection = false;
        canvas.defaultCursor = 'grabbing';
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (isPanning) {
        const deltaX = opt.e.clientX - lastPosX;
        const deltaY = opt.e.clientY - lastPosY;

        // Infinite panning - no boundaries
        canvas.relativePan({ x: deltaX, y: deltaY });

        lastPosX = opt.e.clientX;
        lastPosY = opt.e.clientY;
      }
    });

    canvas.on('mouse:up', () => {
      if (isPanning) {
        isPanning = false;
        if (isSpacePressed) {
          canvas.defaultCursor = 'grab';
        } else {
          canvas.defaultCursor = 'default';
          canvas.selection = true;
        }
      }
    });

    // Add hover effects for better UX
    canvas.on('mouse:over', (e) => {
      if (e.target && e.target !== gridRef.current && e.target.type !== 'line') {
        e.target.set({
          shadow: {
            color: 'rgba(0, 120, 255, 0.5)',
            blur: 20,
            offsetX: 0,
            offsetY: 4,
          },
          strokeWidth: (e.target.strokeWidth || 2) + 1,
        });
        canvas.renderAll();
      }
    });

    canvas.on('mouse:out', (e) => {
      if (e.target && e.target !== gridRef.current && !canvas.getActiveObject()) {
        e.target.set({
          shadow: {
            color: 'rgba(0, 0, 0, 0.3)',
            blur: 10,
            offsetX: 0,
            offsetY: 2,
          },
          strokeWidth: e.target.strokeWidth > 2 ? e.target.strokeWidth - 1 : 2,
        });
        canvas.renderAll();
      }
    });

    // Enhanced selection highlighting
    canvas.on('selection:created', (e) => {
      const selected = e.selected || [e.target];
      setSelectedObjects(selected.filter(obj => obj && obj !== gridRef.current));
      selected.forEach(obj => {
        if (obj && obj !== gridRef.current) {
          obj.set({
            shadow: {
              color: 'rgba(0, 120, 255, 0.6)',
              blur: 25,
              offsetX: 0,
              offsetY: 5,
            },
            strokeWidth: (obj.strokeWidth || 2) + 1,
          });
        }
      });
      canvas.renderAll();
    });

    canvas.on('selection:updated', (e) => {
      // Reset previous selection
      if (e.deselected) {
        e.deselected.forEach(obj => {
          if (obj && obj !== gridRef.current) {
            obj.set({
              shadow: {
                color: 'rgba(0, 0, 0, 0.3)',
                blur: 10,
                offsetX: 0,
                offsetY: 2,
              },
              strokeWidth: obj.strokeWidth > 2 ? obj.strokeWidth - 1 : 2,
            });
          }
        });
      }
      // Highlight new selection
      const selected = e.selected || [e.target];
      setSelectedObjects(selected.filter(obj => obj && obj !== gridRef.current));
      selected.forEach(obj => {
        if (obj && obj !== gridRef.current) {
          obj.set({
            shadow: {
              color: 'rgba(0, 120, 255, 0.6)',
              blur: 25,
              offsetX: 0,
              offsetY: 5,
            },
            strokeWidth: (obj.strokeWidth || 2) + 1,
          });
        }
      });
      canvas.renderAll();
    });

    canvas.on('selection:cleared', (e) => {
      setSelectedObjects([]);
      if (e.deselected) {
        e.deselected.forEach(obj => {
          if (obj && obj !== gridRef.current) {
            obj.set({
              shadow: {
                color: 'rgba(0, 0, 0, 0.3)',
                blur: 10,
                offsetX: 0,
                offsetY: 2,
              },
              strokeWidth: obj.strokeWidth > 2 ? obj.strokeWidth - 1 : 2,
            });
          }
        });
        canvas.renderAll();
      }
    });

    // Handle window resize
    // Handle resizing using ResizeObserver for accurate sizing (fixes static height issue)
    const resizeObserver = new ResizeObserver((entries) => {
      if (!fabricCanvas.current || fabricCanvas.current.disposed) return;

      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        fabricCanvas.current.setDimensions({
          width: width,
          height: height,
        });
      }
    });

    if (parentElement) {
      resizeObserver.observe(parentElement);
    }

    // Mouse wheel zoom support (with Ctrl/Cmd key)
    const handleMouseWheel = (opt) => {
      const evt = opt.e;

      // Only zoom if Ctrl or Cmd key is pressed
      if (evt.ctrlKey || evt.metaKey) {
        evt.preventDefault();
        evt.stopPropagation();

        const delta = evt.deltaY;
        let newZoom = zoom;

        if (delta < 0) {
          // Scroll up = zoom in
          newZoom = Math.min(zoom + 5, 500);
        } else {
          // Scroll down = zoom out
          newZoom = Math.max(zoom - 5, 10);
        }

        setZoom(newZoom);

        const zoomLevel = newZoom / 100;
        const point = { x: evt.offsetX, y: evt.offsetY };

        fabricCanvas.current.zoomToPoint(point, zoomLevel);
      }
    };

    fabricCanvas.current.on('mouse:wheel', handleMouseWheel);

    // Update grid on viewport changes (pan/zoom) for infinite grid effect
    let gridUpdateTimeout;
    const updateGridOnViewportChange = () => {
      clearTimeout(gridUpdateTimeout);
      gridUpdateTimeout = setTimeout(() => {
        if (fabricCanvas.current && !fabricCanvas.current.disposed && showGrid) {
          drawGrid(fabricCanvas.current);
        }
      }, 100); // Debounce to avoid excessive redraws
    };

    fabricCanvas.current.on('after:render', updateGridOnViewportChange);

    // Draw grid after canvas is initialized
    if (showGrid) {
      requestAnimationFrame(() => {
        if (fabricCanvas.current && !fabricCanvas.current.disposed) {
          drawGrid(fabricCanvas.current);
        }
      });
    }

    // Cleanup function: dispose canvas and remove listeners
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', preventSpaceScroll);

      if (fabricCanvas.current && !fabricCanvas.current.disposed) {
        try {
          fabricCanvas.current.dispose();
        } catch (error) {
          console.warn('Error disposing canvas:', error);
        }
      }
      fabricCanvas.current = null;
    };
  }, []); // Initialize once on mount

  // Update canvas background and grid when theme changes
  useEffect(() => {
    if (fabricCanvas.current && !fabricCanvas.current.disposed && typeof fabricCanvas.current.setBackgroundColor === 'function') {
      try {
        fabricCanvas.current.setBackgroundColor(isDarkMode ? '#1a1a1a' : '#ffffff', () => {
          if (fabricCanvas.current && !fabricCanvas.current.disposed && typeof fabricCanvas.current.renderAll === 'function') {
            fabricCanvas.current.renderAll();
          }
        });
        if (typeof drawGrid === 'function') {
          drawGrid(fabricCanvas.current);
        }
      } catch (error) {
        console.warn('Error updating canvas theme:', error);
      }
    }
  }, [isDarkMode, drawGrid]);

  // Load canvases from API on component mount
  useEffect(() => {
    // Prevent multiple simultaneous calls (React StrictMode protection)
    if (hasLoadedCanvases.current) return;
    hasLoadedCanvases.current = true;

    const loadCanvases = async () => {
      try {
        setLoading(true);
        const response = await getCanvasesAPI();
        if (response.success && response.data.length > 0) {
          setCanvases(response.data);
          setActiveCanvasId(response.data[0]._id);
        } else if (response.success && response.data.length === 0) {
          // Only create default canvas if API succeeded but returned empty array
          try {
            const canvasNumber = 1;
            const newCanvasResponse = await createCanvasAPI({
              name: `Canvas ${canvasNumber}`,
              data: null
            });

            if (newCanvasResponse.success) {
              setCanvases([newCanvasResponse.data]);
              setActiveCanvasId(newCanvasResponse.data._id);
            }
          } catch (createError) {
            console.error('Error creating default canvas:', createError);
            // Set empty state instead of retrying
            setCanvases([]);
          }
        }
      } catch (error) {
        console.error('Error loading canvases:', error);
        // Don't attempt to create canvas if initial load failed
        // This prevents cascading API calls when rate limited
        setCanvases([]);

        // Check if it's a rate limit error
        if (error.message && error.message.includes('429')) {
          console.warn('Rate limit hit. Please wait before refreshing.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCanvases();
  }, []); // Empty dependency array - run only once on mount

  // Load canvas data when active canvas changes
  useEffect(() => {
    if (fabricCanvas.current && !fabricCanvas.current.disposed && activeCanvasId && !loading) {
      const activeCanvasData = canvases.find(c => c._id === activeCanvasId)?.data;
      if (activeCanvasData) {
        try {
          fabricCanvas.current.loadFromJSON(activeCanvasData, () => {
            // After loading, ensure frames are at the back and non-selectable
            const objects = fabricCanvas.current.getObjects();
            objects.forEach(obj => {
              if (obj.metadata && obj.metadata.type === 'frame') {
                fabricCanvas.current.sendToBack(obj);
                obj.set({
                  selectable: false,
                  hasControls: false,
                  evented: false
                });
              }
            });
            if (fabricCanvas.current && !fabricCanvas.current.disposed && typeof fabricCanvas.current.renderAll === 'function') {
              fabricCanvas.current.renderAll();
            }
          });
        } catch (error) {
          console.warn('Error loading canvas data:', error);
        }
      } else {
        // Clear canvas for new/empty canvas
        try {
          if (fabricCanvas.current && !fabricCanvas.current.disposed && typeof fabricCanvas.current.clear === 'function') {
            fabricCanvas.current.clear();
            if (typeof drawGrid === 'function') {
              drawGrid(fabricCanvas.current);
            }
            if (fabricCanvas.current && !fabricCanvas.current.disposed && typeof fabricCanvas.current.renderAll === 'function') {
              fabricCanvas.current.renderAll();
            }
          }
        } catch (error) {
          console.warn('Error clearing canvas:', error);
        }
      }
    }
  }, [activeCanvasId, canvases, drawGrid, loading]);

  // Update grid when showGrid setting changes
  useEffect(() => {
    if (fabricCanvas.current && !fabricCanvas.current.disposed && typeof drawGrid === 'function') {
      try {
        drawGrid(fabricCanvas.current);
      } catch (error) {
        console.warn('Error updating grid:', error);
      }
    }
  }, [showGrid, drawGrid]);

  // Debounced save function with retry logic
  const debouncedSave = useCallback(async (canvasData, retryCount = 0) => {
    if (!activeCanvasId) return;

    setSaveStatus('saving');

    try {
      await updateCanvasAPI(activeCanvasId, { data: canvasData });
      setSaveStatus('saved');
      setLastSaved(new Date());
      console.log('Canvas saved successfully');
    } catch (error) {
      console.error('Error saving canvas:', error);

      // Retry logic - retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Retrying save in ${delay}ms (attempt ${retryCount + 1}/3)`);
        setTimeout(() => {
          debouncedSave(canvasData, retryCount + 1);
        }, delay);
      } else {
        setSaveStatus('error');
        console.error('Failed to save canvas after 3 attempts');
      }
    }
  }, [activeCanvasId]);

  const saveToHistory = useCallback(async () => {
    if (!fabricCanvas.current || fabricCanvas.current.disposed || typeof fabricCanvas.current.toJSON !== 'function') return;

    try {
      const currentState = fabricCanvas.current.toJSON();
      const currentStateString = JSON.stringify(currentState);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce the API save - wait 2 seconds before saving
      saveTimeoutRef.current = setTimeout(() => {
        debouncedSave(currentState);
      }, 2000);

      // Save to canvases state immediately for UI responsiveness
      setCanvases(prev => prev.map(c =>
        c._id === activeCanvasId ? { ...c, data: currentState } : c
      ));

      // Save to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(currentStateString);

      // Limit history to 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex(newHistory.length - 1);
      }

      setHistory(newHistory);
    } catch (error) {
      console.warn('Error saving to history:', error);
    }
  }, [history, historyIndex, activeCanvasId, debouncedSave]);

  // Auto-save interval - save every 30 seconds
  useEffect(() => {
    if (activeCanvasId && fabricCanvas.current) {
      // Clear any existing auto-save interval before starting a new one
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }

      autoSaveIntervalRef.current = setInterval(() => {
        if (fabricCanvas.current && !fabricCanvas.current.disposed) {
          const currentState = fabricCanvas.current.toJSON();
          debouncedSave(currentState);
        }
      }, 30000); // 30 seconds
    }
  }, [activeCanvasId, debouncedSave]);

  // Cleanup timeouts and intervals on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0 && fabricCanvas.current && !fabricCanvas.current.disposed && typeof fabricCanvas.current.loadFromJSON === 'function') {
      try {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        fabricCanvas.current.loadFromJSON(history[newIndex], () => {
          if (fabricCanvas.current && !fabricCanvas.current.disposed && typeof fabricCanvas.current.renderAll === 'function') {
            fabricCanvas.current.renderAll();
          }
        });
      } catch (error) {
        console.warn('Error undoing:', error);
      }
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1 && fabricCanvas.current && !fabricCanvas.current.disposed && typeof fabricCanvas.current.loadFromJSON === 'function') {
      try {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        fabricCanvas.current.loadFromJSON(history[newIndex], () => {
          if (fabricCanvas.current && !fabricCanvas.current.disposed && typeof fabricCanvas.current.renderAll === 'function') {
            fabricCanvas.current.renderAll();
          }
        });
      } catch (error) {
        console.warn('Error redoing:', error);
      }
    }
  }, [history, historyIndex]);

  const addText = useCallback(() => {
    if (!fabricCanvas.current) return;
    const text = new fabric.IText('Click to edit', {
      left: 100,
      top: 100,
      fontSize: 16,
      fill: isDarkMode ? '#e0e0e0' : '#333333',
      fontFamily: 'Inter, system-ui, sans-serif',
      shadow: {
        color: 'rgba(0, 0, 0, 0.2)',
        blur: 3,
        offsetX: 0,
        offsetY: 1,
      },
    });
    fabricCanvas.current.add(text);
    fabricCanvas.current.setActiveObject(text);
    saveToHistory();
  }, [saveToHistory, isDarkMode]);

  // Helper function for smooth shape creation animation
  const animateShapeCreation = useCallback((shape) => {
    if (!fabricCanvas.current || !shape) {
      console.warn('Canvas or shape not available for creation');
      return;
    }

    // Set shape to full scale and opacity immediately (no animation for now to fix rendering)
    shape.set({
      scaleX: 1,
      scaleY: 1,
      opacity: 1
    });

    // Add shape to canvas
    fabricCanvas.current.add(shape);

    // Ensure shape is above grid
    if (gridRef.current && typeof fabricCanvas.current.sendToBack === 'function') {
      try {
        fabricCanvas.current.sendToBack(gridRef.current);
      } catch (error) {
        console.warn('Could not send grid to back:', error);
      }
    }

    // Force render
    fabricCanvas.current.renderAll();

    // Set as active object
    try {
      fabricCanvas.current.setActiveObject(shape);
      fabricCanvas.current.renderAll();
      console.log('Shape created successfully, total objects:', fabricCanvas.current.getObjects().length);
    } catch (error) {
      console.warn('Error setting active object:', error);
    }
  }, []);

  const addStickyNote = useCallback(() => {
    if (!fabricCanvas.current) return;
    const sticky = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 120,
      fill: isDarkMode ? '#3a3a2a' : '#FFF9C4',
      stroke: isDarkMode ? '#555544' : '#F9A825',
      strokeWidth: 2,
      rx: 8,
      ry: 8,
      shadow: {
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 3,
      },
    });
    const text = new fabric.IText('Note: Click to edit', {
      left: 110,
      top: 115,
      fontSize: 14,
      fill: isDarkMode ? '#e0e0c0' : '#424242',
      fontFamily: 'Inter, system-ui, sans-serif',
      width: 180,
    });
    const group = new fabric.Group([sticky, text], {
      left: 100,
      top: 100,
      metadata: {
        type: 'sticky_note',
        nodeId: `note_${Date.now()}`,
      },
    });
    animateShapeCreation(group);
    saveToHistory();
  }, [saveToHistory, isDarkMode, animateShapeCreation]);

  const deleteSelected = useCallback(() => {
    if (!fabricCanvas.current) return;
    const activeObjects = fabricCanvas.current.getActiveObjects();
    if (activeObjects && activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        fabricCanvas.current.remove(obj);
      });
      fabricCanvas.current.discardActiveObject();
      setSelectedObjects([]);
      saveToHistory();
    }
  }, [saveToHistory]);

  // Keyboard shortcuts

  const addRectangleAt = useCallback((x, y) => {
    if (!fabricCanvas.current) {
      console.warn('Canvas not initialized');
      return;
    }

    // Use auto-layout if no position specified, otherwise use provided position
    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(180, 80)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;

    console.log('Creating rectangle at:', snappedX, snappedY);

    // Eraser.io style rectangle with rounded corners and shadow
    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      width: 180,
      height: 80,
      fill: selectedColor,
      stroke: isDarkMode ? '#444444' : '#555555',
      strokeWidth: 2,
      rx: 8,
      ry: 8,
      originX: 'center',
      originY: 'center',
      shadow: {
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 2,
      },
    });

    const text = new fabric.IText('Process Node', {
      left: 0,
      top: 0,
      fontSize: 14,
      fill: isDarkMode ? '#e0e0e0' : '#333333',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      width: 160,
    });

    const group = new fabric.Group([rect, text], {
      left: snappedX,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      // Store metadata for Eraser.io-like functionality
      metadata: {
        type: 'rectangle',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, isDarkMode, findOptimalPosition, animateShapeCreation]);

  const addArrow = useCallback((x, y, arrowType = 'straight') => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(120, 40)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;

    let arrowGroup;

    if (arrowType === 'straight') {
      // Enhanced straight arrow with better styling
      const shaft = new fabric.Line([0, 0, 100, 0], {
        stroke: selectedColor,
        strokeWidth: 4,
        fill: '',
        strokeLineCap: 'round',
        shadow: {
          color: 'rgba(0, 0, 0, 0.3)',
          blur: 8,
          offsetX: 0,
          offsetY: 2,
        },
      });

      // Better arrowhead with more defined shape
      const arrowhead = new fabric.Polygon([
        { x: 85, y: -8 },
        { x: 100, y: 0 },
        { x: 85, y: 8 }
      ], {
        fill: selectedColor,
        stroke: selectedColor,
        strokeWidth: 1,
        shadow: {
          color: 'rgba(0, 0, 0, 0.3)',
          blur: 8,
          offsetX: 0,
          offsetY: 2,
        },
      });

      arrowGroup = new fabric.Group([shaft, arrowhead], {
        left: snappedX - 50,
        top: snappedY,
        originX: 'center',
        originY: 'center',
        metadata: {
          type: 'arrow',
          arrowType: 'straight',
          nodeId: `arrow_${Date.now()}`,
        },
      });

    } else if (arrowType === 'curved') {
      // Curved arrow with smooth bezier curve
      const path = new fabric.Path('M 0 0 Q 50 -30 100 0', {
        stroke: selectedColor,
        strokeWidth: 4,
        fill: '',
        strokeLineCap: 'round',
        shadow: {
          color: 'rgba(0, 0, 0, 0.3)',
          blur: 8,
          offsetX: 0,
          offsetY: 2,
        },
      });

      // Curved arrowhead positioned at the end of the curve
      const arrowhead = new fabric.Polygon([
        { x: 85, y: -8 },
        { x: 100, y: 0 },
        { x: 85, y: 8 }
      ], {
        fill: selectedColor,
        stroke: selectedColor,
        strokeWidth: 1,
        left: 85,
        top: -4,
        angle: 0,
        shadow: {
          color: 'rgba(0, 0, 0, 0.3)',
          blur: 8,
          offsetX: 0,
          offsetY: 2,
        },
      });

      arrowGroup = new fabric.Group([path, arrowhead], {
        left: snappedX - 50,
        top: snappedY,
        originX: 'center',
        originY: 'center',
        metadata: {
          type: 'arrow',
          arrowType: 'curved',
          nodeId: `arrow_${Date.now()}`,
        },
      });

    } else if (arrowType === 'elbow') {
      // L-shaped elbow arrow
      const horizontalLine = new fabric.Line([0, 0, 60, 0], {
        stroke: selectedColor,
        strokeWidth: 4,
        fill: '',
        strokeLineCap: 'round',
        shadow: {
          color: 'rgba(0, 0, 0, 0.3)',
          blur: 8,
          offsetX: 0,
          offsetY: 2,
        },
      });

      const verticalLine = new fabric.Line([60, 0, 60, -40], {
        stroke: selectedColor,
        strokeWidth: 4,
        fill: '',
        strokeLineCap: 'round',
        shadow: {
          color: 'rgba(0, 0, 0, 0.3)',
          blur: 8,
          offsetX: 0,
          offsetY: 2,
        },
      });

      const arrowhead = new fabric.Polygon([
        { x: 52, y: -32 },
        { x: 68, y: -40 },
        { x: 52, y: -48 }
      ], {
        fill: selectedColor,
        stroke: selectedColor,
        strokeWidth: 1,
        shadow: {
          color: 'rgba(0, 0, 0, 0.3)',
          blur: 8,
          offsetX: 0,
          offsetY: 2,
        },
      });

      arrowGroup = new fabric.Group([horizontalLine, verticalLine, arrowhead], {
        left: snappedX - 30,
        top: snappedY + 20,
        originX: 'center',
        originY: 'center',
        metadata: {
          type: 'arrow',
          arrowType: 'elbow',
          nodeId: `arrow_${Date.now()}`,
        },
      });
    }

    animateShapeCreation(arrowGroup);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, findOptimalPosition, animateShapeCreation]);

  const addLine = useCallback((x, y) => {
    if (!fabricCanvas.current) return;
    const line = new fabric.Line([x - 60, y, x + 60, y], {
      stroke: selectedColor,
      strokeWidth: 3,
      fill: '',
      shadow: {
        color: 'rgba(0, 0, 0, 0.2)',
        blur: 5,
        offsetX: 0,
        offsetY: 1,
      },
    });
    fabricCanvas.current.add(line);
    fabricCanvas.current.setActiveObject(line);
    saveToHistory();
  }, [selectedColor, saveToHistory]);

  const addDiamondAt = useCallback((x, y) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(100, 100)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;
    const diamond = new fabric.Polygon([
      { x: 0, y: -50 },
      { x: 50, y: 0 },
      { x: 0, y: 50 },
      { x: -50, y: 0 }
    ], {
      fill: selectedColor,
      stroke: isDarkMode ? '#444444' : '#555555',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      shadow: {
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 2,
      },
    });

    const text = new fabric.IText('Decision', {
      left: 0,
      top: 0,
      fontSize: 14,
      fill: isDarkMode ? '#e0e0e0' : '#333333',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      width: 80,
    });

    const group = new fabric.Group([diamond, text], {
      left: snappedX,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      metadata: {
        type: 'diamond',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, isDarkMode, findOptimalPosition, animateShapeCreation]);

  const addEllipseAt = useCallback((x, y) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(180, 80)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;
    const ellipse = new fabric.Ellipse({
      left: 0,
      top: 0,
      rx: 90,
      ry: 40,
      fill: selectedColor,
      stroke: isDarkMode ? '#444444' : '#555555',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      shadow: {
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 2,
      },
    });

    const text = new fabric.IText('Event', {
      left: 0,
      top: 0,
      fontSize: 14,
      fill: isDarkMode ? '#e0e0e0' : '#333333',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      width: 140,
    });

    const group = new fabric.Group([ellipse, text], {
      left: snappedX,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      metadata: {
        type: 'ellipse',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, isDarkMode, findOptimalPosition, animateShapeCreation]);

  const addStarAt = useCallback((x, y) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(100, 100)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;
    const star = new fabric.Polygon([
      { x: 0, y: -50 },
      { x: 15, y: -15 },
      { x: 50, y: -15 },
      { x: 20, y: 10 },
      { x: 30, y: 40 },
      { x: 0, y: 20 },
      { x: -30, y: 40 },
      { x: -20, y: 10 },
      { x: -50, y: -15 },
      { x: -15, y: -15 }
    ], {
      fill: selectedColor,
      stroke: isDarkMode ? '#444444' : '#555555',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      shadow: {
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 2,
      },
    });

    const text = new fabric.IText('Star', {
      left: 0,
      top: 0,
      fontSize: 12,
      fill: isDarkMode ? '#e0e0e0' : '#333333',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      width: 60,
    });

    const group = new fabric.Group([star, text], {
      left: snappedX,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      metadata: {
        type: 'star',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, isDarkMode, findOptimalPosition, animateShapeCreation]);

  const addHeartAt = useCallback((x, y) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(80, 80)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;
    const heart = new fabric.Path('M 0 20 C 0 10, 10 0, 20 0 C 30 0, 40 10, 40 20 C 40 30, 20 50, 20 50 C 20 50, 0 30, 0 20 Z', {
      left: 0,
      top: 0,
      fill: selectedColor,
      stroke: isDarkMode ? '#444444' : '#555555',
      strokeWidth: 2,
      scaleX: 1.5,
      scaleY: 1.5,
      originX: 'center',
      originY: 'center',
      shadow: {
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 2,
      },
    });

    const text = new fabric.IText('Heart', {
      left: 0,
      top: 0,
      fontSize: 12,
      fill: isDarkMode ? '#e0e0e0' : '#333333',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      width: 60,
    });

    const group = new fabric.Group([heart, text], {
      left: snappedX,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      metadata: {
        type: 'heart',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, isDarkMode, findOptimalPosition, animateShapeCreation]);

  const addCircleAt = useCallback((x, y) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(100, 100)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;
    const circle = new fabric.Circle({
      left: 0,
      top: 0,
      radius: 50,
      fill: selectedColor,
      stroke: isDarkMode ? '#444444' : '#555555',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      shadow: {
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 2,
      },
    });

    const text = new fabric.IText('Start/End', {
      left: 0,
      top: 0,
      fontSize: 14,
      fill: isDarkMode ? '#e0e0e0' : '#333333',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      width: 80,
    });

    const group = new fabric.Group([circle, text], {
      left: snappedX,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      metadata: {
        type: 'circle',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, isDarkMode, findOptimalPosition, animateShapeCreation]);
  // Frame/Container creation with auto-resize capability
  const addParallelogramAt = useCallback((x, y) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(180, 80)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;

    // Create parallelogram using polygon
    const parallelogram = new fabric.Polygon([
      { x: -80, y: -35 },
      { x: 80, y: -35 },
      { x: 60, y: 35 },
      { x: -60, y: 35 }
    ], {
      left: 0,
      top: 0,
      fill: selectedColor,
      stroke: isDarkMode ? '#444444' : '#555555',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      shadow: {
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 2,
      },
    });

    const text = new fabric.IText('Data', {
      left: 0,
      top: 0,
      fontSize: 14,
      fill: isDarkMode ? '#e0e0e0' : '#333333',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      width: 140,
    });

    const group = new fabric.Group([parallelogram, text], {
      left: snappedX,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      metadata: {
        type: 'parallelogram',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, isDarkMode, findOptimalPosition, animateShapeCreation]);

  const addCylinderAt = useCallback((x, y) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(120, 80)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;

    // Create cylinder using ellipse and rectangle
    const topEllipse = new fabric.Ellipse({
      left: 0,
      top: -30,
      rx: 50,
      ry: 15,
      fill: selectedColor,
      stroke: isDarkMode ? '#444444' : '#555555',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
    });

    const bottomEllipse = new fabric.Ellipse({
      left: 0,
      top: 30,
      rx: 50,
      ry: 15,
      fill: selectedColor,
      stroke: isDarkMode ? '#444444' : '#555555',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
    });

    const middleRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: 100,
      height: 60,
      fill: selectedColor,
      stroke: isDarkMode ? '#444444' : '#555555',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
    });

    const text = new fabric.IText('Database', {
      left: 0,
      top: 0,
      fontSize: 12,
      fill: isDarkMode ? '#e0e0e0' : '#333333',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      width: 80,
    });

    const group = new fabric.Group([middleRect, topEllipse, bottomEllipse, text], {
      left: snappedX,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      metadata: {
        type: 'cylinder',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, isDarkMode, findOptimalPosition, animateShapeCreation]);

  const addDocumentAt = useCallback((x, y) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(140, 180)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;

    // Create document shape
    const document = new fabric.Polygon([
      { x: -60, y: -80 },
      { x: 60, y: -80 },
      { x: 60, y: 80 },
      { x: -60, y: 80 }
    ], {
      left: 0,
      top: 0,
      fill: selectedColor,
      stroke: isDarkMode ? '#444444' : '#555555',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      shadow: {
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 2,
      },
    });

    // Add fold line
    const foldLine = new fabric.Line([-20, -80, -20, -60], {
      stroke: isDarkMode ? '#666666' : '#999999',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
    });

    const text = new fabric.IText('Document', {
      left: 0,
      top: 0,
      fontSize: 14,
      fill: isDarkMode ? '#e0e0e0' : '#333333',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      width: 100,
    });

    const group = new fabric.Group([document, foldLine, text], {
      left: snappedX,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      metadata: {
        type: 'document',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, isDarkMode, findOptimalPosition, animateShapeCreation]);

  // Container shapes
  const addRoundedRectAt = useCallback((x, y) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(200, 120)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;

    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      width: 200,
      height: 120,
      fill: 'rgba(255, 255, 255, 0.1)',
      stroke: selectedColor,
      strokeWidth: 3,
      rx: 15,
      ry: 15,
      originX: 'center',
      originY: 'center',
      shadow: {
        color: 'rgba(0, 0, 0, 0.2)',
        blur: 15,
        offsetX: 0,
        offsetY: 3,
      },
    });

    const text = new fabric.IText('Container', {
      left: 0,
      top: 0,
      fontSize: 16,
      fill: isDarkMode ? '#e0e0e0' : '#333333',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 600,
      width: 160,
    });

    const group = new fabric.Group([rect, text], {
      left: snappedX,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      metadata: {
        type: 'rounded-rect',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, isDarkMode, findOptimalPosition, animateShapeCreation]);

  const addHexagonAt = useCallback((x, y) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(140, 120)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;

    // Create hexagon
    const hexagon = new fabric.Polygon([
      { x: 0, y: -50 },
      { x: 43, y: -25 },
      { x: 43, y: 25 },
      { x: 0, y: 50 },
      { x: -43, y: 25 },
      { x: -43, y: -25 }
    ], {
      left: 0,
      top: 0,
      fill: selectedColor,
      stroke: isDarkMode ? '#444444' : '#555555',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      shadow: {
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 2,
      },
    });

    const text = new fabric.IText('Hexagon', {
      left: 0,
      top: 0,
      fontSize: 14,
      fill: isDarkMode ? '#e0e0e0' : '#333333',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      width: 100,
    });

    const group = new fabric.Group([hexagon, text], {
      left: snappedX,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      metadata: {
        type: 'hexagon',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, isDarkMode, findOptimalPosition, animateShapeCreation]);

  // Symbol shapes
  const addTriangleAt = useCallback((x, y) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(120, 100)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;

    const triangle = new fabric.Triangle({
      left: 0,
      top: 0,
      width: 120,
      height: 100,
      fill: selectedColor,
      stroke: isDarkMode ? '#444444' : '#555555',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      shadow: {
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 2,
      },
    });

    const text = new fabric.IText('Triangle', {
      left: 0,
      top: 0,
      fontSize: 12,
      fill: isDarkMode ? '#e0e0e0' : '#333333',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      width: 80,
    });

    const group = new fabric.Group([triangle, text], {
      left: snappedX,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      metadata: {
        type: 'triangle',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, isDarkMode, findOptimalPosition, animateShapeCreation]);

  const addPentagonAt = useCallback((x, y) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(120, 120)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;

    // Create pentagon
    const pentagon = new fabric.Polygon([
      { x: 0, y: -50 },
      { x: 47, y: -15 },
      { x: 29, y: 41 },
      { x: -29, y: 41 },
      { x: -47, y: -15 }
    ], {
      left: 0,
      top: 0,
      fill: selectedColor,
      stroke: isDarkMode ? '#444444' : '#555555',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      shadow: {
        color: 'rgba(0, 0, 0, 0.3)',
        blur: 10,
        offsetX: 0,
        offsetY: 2,
      },
    });

    const text = new fabric.IText('Pentagon', {
      left: 0,
      top: 0,
      fontSize: 12,
      fill: isDarkMode ? '#e0e0e0' : '#333333',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      width: 80,
    });

    const group = new fabric.Group([pentagon, text], {
      left: snappedX,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      metadata: {
        type: 'pentagon',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, isDarkMode, findOptimalPosition, animateShapeCreation]);

  // Connector shapes
  const addCurvedArrowAt = useCallback((x, y) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(200, 100)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;

    // Create curved line
    const path = new fabric.Path('M 0 0 Q 100 50 200 0', {
      left: 0,
      top: 0,
      stroke: selectedColor,
      strokeWidth: 3,
      fill: '',
      originX: 'left',
      originY: 'center',
      shadow: {
        color: 'rgba(0, 0, 0, 0.2)',
        blur: 5,
        offsetX: 0,
        offsetY: 1,
      },
    });

    // Create arrowhead
    const triangle = new fabric.Triangle({
      width: 12,
      height: 12,
      fill: selectedColor,
      left: 190,
      top: -6,
      angle: 90,
      originX: 'center',
      originY: 'center',
    });

    const group = new fabric.Group([path, triangle], {
      left: snappedX - 100,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      metadata: {
        type: 'curved-arrow',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, findOptimalPosition, animateShapeCreation]);

  const addBidirectionalAt = useCallback((x, y) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(200, 40)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    const snappedX = position.x;
    const snappedY = position.y;

    // Create line
    const line = new fabric.Line([0, 0, 200, 0], {
      stroke: selectedColor,
      strokeWidth: 3,
      fill: '',
      shadow: {
        color: 'rgba(0, 0, 0, 0.2)',
        blur: 5,
        offsetX: 0,
        offsetY: 1,
      },
    });

    // Create left arrowhead
    const leftTriangle = new fabric.Triangle({
      width: 12,
      height: 12,
      fill: selectedColor,
      left: 6,
      top: -6,
      angle: -90,
    });

    // Create right arrowhead
    const rightTriangle = new fabric.Triangle({
      width: 12,
      height: 12,
      fill: selectedColor,
      left: 194,
      top: -6,
      angle: 90,
    });

    const group = new fabric.Group([line, leftTriangle, rightTriangle], {
      left: snappedX - 100,
      top: snappedY,
      originX: 'center',
      originY: 'center',
      metadata: {
        type: 'bidirectional',
        nodeId: `node_${Date.now()}`,
        connections: [],
      },
    });

    animateShapeCreation(group);
    saveToHistory();
  }, [selectedColor, saveToHistory, snapToGridValue, findOptimalPosition, animateShapeCreation]);

  const createFrame = useCallback((x, y, width = 400, height = 300) => {
    if (!fabricCanvas.current) return;

    const position = (x === undefined || y === undefined)
      ? findOptimalPosition(width, height)
      : { x: snapToGridValue(x), y: snapToGridValue(y) };

    // Create frame background
    const frameRect = new fabric.Rect({
      left: position.x - width / 2,
      top: position.y - height / 2,
      width: width,
      height: height,
      fill: isDarkMode ? 'rgba(42, 42, 42, 0.3)' : 'rgba(255, 255, 255, 0.3)',
      stroke: isDarkMode ? '#666666' : '#cccccc',
      strokeWidth: 2,
      strokeDashArray: [10, 5],
      rx: 12,
      ry: 12,
      selectable: true,
      hasControls: true,
      shadow: {
        color: 'rgba(0, 0, 0, 0.1)',
        blur: 15,
        offsetX: 0,
        offsetY: 3,
      },
    });

    // Create frame label
    const frameLabel = new fabric.IText('Frame', {
      left: position.x - width / 2 + 15,
      top: position.y - height / 2 + 10,
      fontSize: 14,
      fill: isDarkMode ? '#e0e0e0' : '#666666',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 600,
      selectable: false,
      evented: false,
    });

    // Group frame elements
    const frame = new fabric.Group([frameRect, frameLabel], {
      left: position.x - width / 2,
      top: position.y - height / 2,
      selectable: false, // Make frames non-selectable by default
      hasControls: false,
      evented: false, // Don't respond to events by default
      metadata: {
        type: 'frame',
        frameId: `frame_${Date.now()}`,
        containedObjects: [],
        autoResize: true,
      },
    });

    fabricCanvas.current.add(frame);

    // Send frames to the back (lowest z-index) as background elements
    fabricCanvas.current.sendToBack(frame);

    // Don't set frame as active immediately to keep it in background
    // fabricCanvas.current.setActiveObject(frame);

    // Store frame reference
    setFrames(prev => [...prev, frame]);
    saveToHistory();

    return frame;
  }, [isDarkMode, findOptimalPosition, snapToGridValue, saveToHistory]);

  // Check if object is inside frame
  const isObjectInsideFrame = useCallback((obj, frame) => {
    const objBounds = obj.getBoundingRect();
    const frameBounds = frame.getBoundingRect();

    return (
      objBounds.left >= frameBounds.left &&
      objBounds.top >= frameBounds.top &&
      objBounds.left + objBounds.width <= frameBounds.left + frameBounds.width &&
      objBounds.top + objBounds.height <= frameBounds.top + frameBounds.height
    );
  }, []);

  // Auto-resize frame based on contained objects
  const updateFrameSize = useCallback((frame) => {
    if (!frame || !frame.metadata || frame.metadata.type !== 'frame') return;
    if (!frame.metadata.autoResize) return;

    const objects = fabricCanvas.current.getObjects().filter(obj =>
      obj !== frame &&
      obj !== gridRef.current &&
      obj.selectable !== false &&
      isObjectInsideFrame(obj, frame)
    );

    if (objects.length === 0) return;

    // Calculate bounding box of all contained objects
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      minX = Math.min(minX, bounds.left);
      minY = Math.min(minY, bounds.top);
      maxX = Math.max(maxX, bounds.left + bounds.width);
      maxY = Math.max(maxY, bounds.top + bounds.height);
    });

    // Add padding
    const padding = 40;
    const newLeft = minX - padding;
    const newTop = minY - padding;
    const newWidth = maxX - minX + padding * 2;
    const newHeight = maxY - minY + padding * 2;

    // Update frame size
    const frameRect = frame.getObjects()[0];
    frameRect.set({
      left: newLeft,
      top: newTop,
      width: newWidth,
      height: newHeight,
    });

    frame.set({
      left: newLeft,
      top: newTop,
    });

    fabricCanvas.current.renderAll();
  }, [isObjectInsideFrame]);

  // Layer/Z-index management functions
  const bringToFront = useCallback(() => {
    const activeObject = fabricCanvas.current?.getActiveObject();
    if (activeObject && fabricCanvas.current) {
      if (typeof fabricCanvas.current.bringToFront === 'function') {
        try {
          fabricCanvas.current.bringToFront(activeObject);
        } catch (error) {
          console.warn('Error bringing object to front:', error);
        }
      }
      fabricCanvas.current.renderAll();
      saveToHistory();
    }
  }, [saveToHistory]);

  const sendToBack = useCallback(() => {
    const activeObject = fabricCanvas.current?.getActiveObject();
    if (activeObject && fabricCanvas.current) {
      if (typeof fabricCanvas.current.sendToBack === 'function') {
        try {
          fabricCanvas.current.sendToBack(activeObject);
          // Keep grid at the back
          if (gridRef.current) {
            fabricCanvas.current.sendToBack(gridRef.current);
          }
        } catch (error) {
          console.warn('Error sending objects to back:', error);
        }
      }
      fabricCanvas.current.renderAll();
      saveToHistory();
    }
  }, [saveToHistory]);

  const bringForward = useCallback(() => {
    const activeObject = fabricCanvas.current?.getActiveObject();
    if (activeObject && fabricCanvas.current) {
      if (typeof fabricCanvas.current.bringForward === 'function') {
        try {
          fabricCanvas.current.bringForward(activeObject);
        } catch (error) {
          console.warn('Error bringing object forward:', error);
        }
      }
      fabricCanvas.current.renderAll();
      saveToHistory();
    }
  }, [saveToHistory]);

  const sendBackward = useCallback(() => {
    const activeObject = fabricCanvas.current?.getActiveObject();
    if (activeObject && fabricCanvas.current) {
      if (typeof fabricCanvas.current.sendBackward === 'function') {
        try {
          fabricCanvas.current.sendBackward(activeObject);
        } catch (error) {
          console.warn('Error sending object backward:', error);
        }
      }
      fabricCanvas.current.renderAll();
      saveToHistory();
    }
  }, [saveToHistory]);

  // Enhanced multi-select operations
  const groupSelected = useCallback(() => {
    const activeObject = fabricCanvas.current?.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;

    const group = activeObject.toGroup();
    group.set({
      metadata: {
        type: 'group',
        groupId: `group_${Date.now()}`,
      }
    });
    fabricCanvas.current.setActiveObject(group);
    fabricCanvas.current.renderAll();
    saveToHistory();
  }, [saveToHistory]);

  const ungroupSelected = useCallback(() => {
    const activeObject = fabricCanvas.current?.getActiveObject();
    if (!activeObject || activeObject.type !== 'group') return;

    activeObject.toActiveSelection();
    fabricCanvas.current.renderAll();
    saveToHistory();
  }, [saveToHistory]);

  const alignLeft = useCallback(() => {
    const activeObject = fabricCanvas.current?.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;

    const objects = activeObject.getObjects();
    const minLeft = Math.min(...objects.map(obj => obj.left));

    objects.forEach(obj => {
      obj.set({ left: minLeft });
      obj.setCoords();
    });

    fabricCanvas.current.renderAll();
    saveToHistory();
  }, [saveToHistory]);

  const alignCenter = useCallback(() => {
    const activeObject = fabricCanvas.current?.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;

    const objects = activeObject.getObjects();
    const avgLeft = objects.reduce((sum, obj) => sum + obj.left, 0) / objects.length;

    objects.forEach(obj => {
      obj.set({ left: avgLeft });
      obj.setCoords();
    });

    fabricCanvas.current.renderAll();
    saveToHistory();
  }, [saveToHistory]);

  const alignRight = useCallback(() => {
    const activeObject = fabricCanvas.current?.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;

    const objects = activeObject.getObjects();
    const maxLeft = Math.max(...objects.map(obj => obj.left));

    objects.forEach(obj => {
      obj.set({ left: maxLeft });
      obj.setCoords();
    });

    fabricCanvas.current.renderAll();
    saveToHistory();
  }, [saveToHistory]);

  const distributeHorizontally = useCallback(() => {
    const activeObject = fabricCanvas.current?.getActiveObject();
    if (!activeObject || activeObject.type !== 'activeSelection') return;

    const objects = activeObject.getObjects().sort((a, b) => a.left - b.left);
    if (objects.length < 3) return;

    const first = objects[0];
    const last = objects[objects.length - 1];
    const spacing = (last.left - first.left) / (objects.length - 1);

    objects.forEach((obj, index) => {
      obj.set({ left: first.left + spacing * index });
      obj.setCoords();
    });

    fabricCanvas.current.renderAll();
    saveToHistory();
  }, [saveToHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              redo();
            } else {
              e.preventDefault();
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 's':
            e.preventDefault();
            saveToHistory();
            break;
          default:
            break;
        }
      } else {
        switch (e.key.toLowerCase()) {
          case 'v':
            e.preventDefault();
            setActiveTool('select');
            break;
          case 'p':
            e.preventDefault();
            setActiveTool('pen');
            break;
          case 'h':
            e.preventDefault();
            setActiveTool('highlighter');
            break;
          case 'c':
            e.preventDefault();
            setActiveTool('connect');
            break;
          case 'r':
            e.preventDefault();
            setActiveTool('shape');
            break;
          case 't':
            e.preventDefault();
            addText();
            break;
          case 'n':
            e.preventDefault();
            addStickyNote();
            break;
          case 'f':
            e.preventDefault();
            setActiveTool('frame');
            break;
          case 'g':
            e.preventDefault();
            groupSelected();
            break;
          case '[':
            e.preventDefault();
            sendBackward();
            break;
          case ']':
            e.preventDefault();
            bringForward();
            break;
          case 'delete':
          case 'backspace':
            e.preventDefault();
            deleteSelected();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, addText, addStickyNote, deleteSelected, saveToHistory, groupSelected, sendBackward, bringForward]);

  // AI Diagram Generation Preparation
  const prepareForAIGeneration = useCallback(() => {
    if (!fabricCanvas.current) return null;

    const objects = fabricCanvas.current.getObjects().filter(obj =>
      obj !== gridRef.current && obj.selectable !== false
    );

    // Extract diagram structure for AI processing
    const diagramData = {
      nodes: [],
      connections: [],
      frames: [],
      metadata: {
        canvasSize: {
          width: fabricCanvas.current.width,
          height: fabricCanvas.current.height,
        },
        theme: isDarkMode ? 'dark' : 'light',
        zoom: zoom,
      }
    };

    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      const baseData = {
        id: obj.metadata?.nodeId || obj.metadata?.frameId || `obj_${Date.now()}_${Math.random()}`,
        type: obj.metadata?.type || obj.type,
        position: { x: bounds.left, y: bounds.top },
        size: { width: bounds.width, height: bounds.height },
        style: {
          fill: obj.fill,
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth,
        }
      };

      // Extract text content if available
      if (obj.type === 'group') {
        const textObj = obj.getObjects().find(o => o.type === 'i-text' || o.type === 'text');
        if (textObj) {
          baseData.text = textObj.text;
        }
      } else if (obj.type === 'i-text' || obj.type === 'text') {
        baseData.text = obj.text;
      }

      // Categorize by type
      if (obj.metadata?.type === 'frame') {
        diagramData.frames.push(baseData);
      } else if (obj.metadata?.type === 'arrow' || obj.type === 'path') {
        diagramData.connections.push(baseData);
      } else {
        diagramData.nodes.push(baseData);
      }
    });

    return diagramData;
  }, [isDarkMode, zoom]);

  // Generate diagram from AI prompt
  const generateFromPrompt = useCallback(async (prompt) => {
    // Prepare current canvas context for AI
    const currentDiagramData = prepareForAIGeneration();

    // This would integrate with an AI service
    // For now, return the structure that AI would use
    const aiContext = {
      prompt: prompt,
      currentDiagram: currentDiagramData,
      suggestions: {
        // AI would populate this with diagram suggestions
        nodeTypes: ['rectangle', 'circle', 'diamond', 'ellipse'],
        layoutSuggestions: 'hierarchical', // or 'circular', 'grid', etc.
        colorScheme: isDarkMode ? 'dark' : 'light',
      }
    };

    console.log('AI Generation Context:', aiContext);
    return aiContext;
  }, [prepareForAIGeneration, isDarkMode]);

  // Apply AI-generated diagram
  const applyAIDiagram = useCallback((aiDiagram) => {
    if (!fabricCanvas.current || !aiDiagram) return;

    // Clear current canvas
    fabricCanvas.current.clear();
    if (showGrid) drawGrid(fabricCanvas.current);

    // Create nodes from AI suggestions
    aiDiagram.nodes?.forEach(node => {
      switch (node.type) {
        case 'rectangle':
          addRectangleAt(node.position.x, node.position.y);
          break;
        case 'circle':
          addCircleAt(node.position.x, node.position.y);
          break;
        case 'diamond':
          addDiamondAt(node.position.x, node.position.y);
          break;
        case 'ellipse':
          addEllipseAt(node.position.x, node.position.y);
          break;
        default:
          break;
      }
    });

    // Create connections from AI suggestions
    aiDiagram.connections?.forEach(conn => {
      if (conn.from && conn.to) {
        // Would create connections between specified nodes
        console.log('Creating connection:', conn);
      }
    });

    saveToHistory();
  }, [showGrid, drawGrid, addRectangleAt, addCircleAt, addDiamondAt, addEllipseAt, saveToHistory]);

  const updateConnectionVisual = useCallback((connection) => {
    if (!fabricCanvas.current) return;

    // Remove existing visual if it exists
    if (connection.fabricObject) {
      fabricCanvas.current.remove(connection.fabricObject);
    }

    const fromShape = connection.fromShape;
    const toShape = connection.toShape;

    if (!fromShape || !toShape) return;

    // Use getBoundingRect to get accurate position including transformations
    const fromBounds = fromShape.getBoundingRect();
    const toBounds = toShape.getBoundingRect();

    // Calculate connection points (center of shapes)
    const fromPoint = {
      x: fromBounds.left + fromBounds.width / 2,
      y: fromBounds.top + fromBounds.height / 2
    };
    const toPoint = {
      x: toBounds.left + toBounds.width / 2,
      y: toBounds.top + toBounds.height / 2
    };

    // Calculate angle for arrowhead
    const angle = Math.atan2(toPoint.y - fromPoint.y, toPoint.x - fromPoint.x);

    // Calculate distance
    const distance = Math.sqrt(
      Math.pow(toPoint.x - fromPoint.x, 2) +
      Math.pow(toPoint.y - fromPoint.y, 2)
    );

    // Adjust end point to be at edge of shape (not center)
    const arrowOffset = 15; // Distance from shape edge
    const adjustedToPoint = {
      x: toPoint.x - arrowOffset * Math.cos(angle),
      y: toPoint.y - arrowOffset * Math.sin(angle)
    };

    // Adjust start point to be at edge of shape
    const adjustedFromPoint = {
      x: fromPoint.x + arrowOffset * Math.cos(angle),
      y: fromPoint.y + arrowOffset * Math.sin(angle)
    };

    // Create arrow line
    const arrow = new fabric.Path(
      `M ${adjustedFromPoint.x} ${adjustedFromPoint.y} L ${adjustedToPoint.x} ${adjustedToPoint.y}`,
      {
        stroke: '#007bff',
        strokeWidth: 2,
        fill: '',
        selectable: false,
        hasControls: false,
        evented: false,
      }
    );

    const objects = [arrow];

    // Add arrowhead for directional
    if (connection.mode === 'directional') {
      const arrowhead = new fabric.Triangle({
        width: 12,
        height: 12,
        fill: '#007bff',
        left: adjustedToPoint.x,
        top: adjustedToPoint.y,
        angle: (angle * 180) / Math.PI + 90, // +90 to orient triangle correctly
        originX: 'center',
        originY: 'center',
        selectable: false,
        hasControls: false,
        evented: false,
      });
      objects.push(arrowhead);
    } else if (connection.mode === 'bidirectional') {
      // Add arrowheads in both directions
      const arrowhead1 = new fabric.Triangle({
        width: 10,
        height: 10,
        fill: '#007bff',
        left: adjustedToPoint.x,
        top: adjustedToPoint.y,
        angle: (angle * 180) / Math.PI + 90,
        originX: 'center',
        originY: 'center',
        selectable: false,
        hasControls: false,
        evented: false,
      });

      const arrowhead2 = new fabric.Triangle({
        width: 10,
        height: 10,
        fill: '#007bff',
        left: adjustedFromPoint.x,
        top: adjustedFromPoint.y,
        angle: (angle * 180) / Math.PI - 90, // Opposite direction
        originX: 'center',
        originY: 'center',
        selectable: false,
        hasControls: false,
        evented: false,
      });

      objects.push(arrowhead1, arrowhead2);
    }

    const connectionGroup = new fabric.Group(objects, {
      selectable: false,
      hasControls: false,
      evented: false,
      metadata: {
        type: 'connection',
        connectionId: connection.id
      }
    });

    connection.fabricObject = connectionGroup;
    fabricCanvas.current.add(connectionGroup);

    // Send connections to back (with safety check)
    if (fabricCanvas.current && typeof fabricCanvas.current.sendToBack === 'function') {
      fabricCanvas.current.sendToBack(connectionGroup);
    }
  }, []);

  // Persistent connection functions
  const createPersistentConnection = useCallback((fromShape, toShape, mode = 'directional') => {
    const connectionId = `conn_${Date.now()}_${Math.random()}`;

    // Store connection data
    const connectionData = {
      id: connectionId,
      fromId: fromShape.metadata?.nodeId,
      toId: toShape.metadata?.nodeId,
      mode: mode,
      fromShape: fromShape,
      toShape: toShape,
      fabricObject: null // Will be set when created
    };

    setConnections(prev => [...prev, connectionData]);

    // Create the visual connection
    updateConnectionVisual(connectionData);

    return connectionData;
  }, [updateConnectionVisual]);

  const updateAllConnections = useCallback(() => {
    connections.forEach(conn => updateConnectionVisual(conn));
    if (fabricCanvas.current) fabricCanvas.current.renderAll();
  }, [connections, updateConnectionVisual]);

  // Handle tool changes
  useEffect(() => {
    if (!fabricCanvas.current || fabricCanvas.current.disposed || typeof fabricCanvas.current.off !== 'function') return;

    try {
      // Remove existing event listeners
      fabricCanvas.current.off('mouse:down');
      fabricCanvas.current.off('selection:created');

      // Reset all modes
      fabricCanvas.current.isDrawingMode = false;
      fabricCanvas.current.selection = true;

      switch (activeTool) {
        case 'select': {
          fabricCanvas.current.selection = true;
          fabricCanvas.current.defaultCursor = 'default';

          // Restore selectability for objects (use stored _prevSelectable when available)
          const objects = fabricCanvas.current.getObjects();
          objects.forEach(obj => {
            if (obj.metadata && obj.metadata.type === 'frame') {
              obj.set({
                selectable: false,
                hasControls: false,
                evented: false
              });
            } else if (obj !== gridRef.current) {
              const prev = obj.metadata && typeof obj.metadata._prevSelectable !== 'undefined' ? obj.metadata._prevSelectable : true;
              obj.set({
                selectable: prev,
                evented: true
              });
              if (obj.metadata && typeof obj.metadata._prevSelectable !== 'undefined') {
                delete obj.metadata._prevSelectable;
              }
            }
          });
          break;
        }
        case 'pen':
          // Always update brush settings to match current color and size
          fabricCanvas.current.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas.current);
          fabricCanvas.current.freeDrawingBrush.width = brushSize;
          fabricCanvas.current.freeDrawingBrush.color = selectedColor;
          fabricCanvas.current.isDrawingMode = true;
          fabricCanvas.current.defaultCursor = 'crosshair';
          break;
        case 'highlighter':
          // Highlighter is like pen but with different opacity and wider brush
          fabricCanvas.current.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas.current);
          fabricCanvas.current.freeDrawingBrush.width = brushSize * 3; // Wider for highlighter
          fabricCanvas.current.freeDrawingBrush.color = selectedColor + '40'; // Add transparency
          fabricCanvas.current.isDrawingMode = true;
          fabricCanvas.current.defaultCursor = 'crosshair';
          break;
        case 'eraser':
          fabricCanvas.current.selection = false;
          fabricCanvas.current.defaultCursor = 'crosshair';
          fabricCanvas.current.on('mouse:down', (options) => {
            const target = options.target;
            if (target) {
              // Remove the object from canvas
              fabricCanvas.current.remove(target);
              saveToHistory();
              fabricCanvas.current.renderAll();
            }
          });
          break;
        case 'shape':
          fabricCanvas.current.selection = false;
          fabricCanvas.current.defaultCursor = 'crosshair';
          // Shape placement is now handled by drag and drop
          break;
        case 'connect': {
          fabricCanvas.current.selection = false;
          fabricCanvas.current.defaultCursor = 'crosshair';

          // Prevent regular selection while still allowing target detection.
          // We mark shapes non-selectable but keep them evented so options.target is available.
          try {
            fabricCanvas.current.getObjects().forEach(obj => {
              if (obj === gridRef.current) return;
              // Keep frames and visual connections non-evented
              if (obj.metadata && (obj.metadata.type === 'frame' || obj.metadata.type === 'connection')) {
                obj.set({ selectable: false, evented: false });
              } else {
                // store previous selectable state for later restoration
                if (!obj.metadata) obj.metadata = {};
                obj.metadata._prevSelectable = obj.selectable;
                obj.set({ selectable: false, evented: true });
              }
            });
          } catch (err) {
            // ignore
          }

          // Single mouse down handler for connect mode. We discard any active selection
          // to avoid flicker, then use options.target for connection start/end.
          const handleConnectMouseDown = (options) => {
            if (!fabricCanvas.current) return;
            fabricCanvas.current.discardActiveObject();
            fabricCanvas.current.renderAll();

            const target = options && options.target;

            // If clicking empty area and connection is started, cancel it
            if (!target && connectionStart) {
              // Reset highlight on start
              try {
                connectionStart.set('stroke', '#000000');
                connectionStart.set('strokeWidth', 2);
              } catch (e) {
                console.warn('Could not reset highlight', e);
              }
              setConnectionStart(null);
              fabricCanvas.current.renderAll();
              return;
            }

            // only allow connecting shape groups (nodes)
            if (target && target.type === 'group' && target.metadata && target.metadata.type !== 'frame' && target.metadata.type !== 'connection') {
              if (!connectionStart) {
                setConnectionStart(target);
                // visual highlight with thicker stroke for better visibility
                try {
                  target.set('stroke', '#007bff');
                  target.set('strokeWidth', 4);
                } catch (e) {
                  console.warn('Could not highlight target', e);
                }
                fabricCanvas.current.renderAll();
              } else if (connectionStart !== target) {
                createPersistentConnection(connectionStart, target, connectionMode);

                // Reset highlight on start
                try {
                  connectionStart.set('stroke', '#000000');
                  connectionStart.set('strokeWidth', 2);
                } catch (e) {
                  console.warn('Could not reset highlight', e);
                }
                setConnectionStart(null);
                saveToHistory();
                fabricCanvas.current.renderAll();
              }
            }
          };

          fabricCanvas.current.on('mouse:down', handleConnectMouseDown);
          break;
        }
        case 'frame': {
          fabricCanvas.current.selection = true; // Allow selection
          fabricCanvas.current.defaultCursor = 'crosshair';

          // Make all frames selectable when frame tool is active
          const objects = fabricCanvas.current.getObjects();
          objects.forEach(obj => {
            if (obj.metadata && obj.metadata.type === 'frame') {
              obj.set({
                selectable: true,
                hasControls: true,
                evented: true
              });
            }
          });

          fabricCanvas.current.on('mouse:down', (options) => {
            const target = options.target;
            if (target && target.metadata && target.metadata.type === 'frame') {
              // Frame clicked - allow editing
              return;
            } else {
              // Empty area clicked - create new frame
              const pointer = fabricCanvas.current.getPointer(options.e);
              createFrame(pointer.x, pointer.y);
              setActiveTool('select'); // Return to select tool after creating frame
            }
          });
          break;
        }
        default: {
          fabricCanvas.current.selection = true;
          fabricCanvas.current.defaultCursor = 'default';

          // Make frames non-selectable when not using frame tool and restore other objects
          const objects = fabricCanvas.current.getObjects();
          objects.forEach(obj => {
            if (obj.metadata && obj.metadata.type === 'frame') {
              obj.set({
                selectable: false,
                hasControls: false,
                evented: false
              });
            } else if (obj !== gridRef.current) {
              const prev = obj.metadata && typeof obj.metadata._prevSelectable !== 'undefined' ? obj.metadata._prevSelectable : true;
              obj.set({ selectable: prev, evented: true });
              if (obj.metadata && typeof obj.metadata._prevSelectable !== 'undefined') {
                delete obj.metadata._prevSelectable;
              }
            }
          });
        }
      }

      if (fabricCanvas.current && !fabricCanvas.current.disposed && typeof fabricCanvas.current.renderAll === 'function') {
        fabricCanvas.current.renderAll();
      }
    } catch (error) {
      console.warn('Error handling tool change:', error);
    }
  }, [activeTool, selectedShape, addRectangleAt, addCircleAt, addEllipseAt, addDiamondAt, addStarAt, addHeartAt, addArrow, addLine, addParallelogramAt, brushSize, selectedColor, connectionStart, saveToHistory, createFrame, connectionMode, createPersistentConnection]);

  // Update brush settings when color or size changes (for pen/highlighter tools)
  useEffect(() => {
    if (!fabricCanvas.current || !fabricCanvas.current.freeDrawingBrush) return;

    // Only update if we're in drawing mode (pen or highlighter active)
    if (fabricCanvas.current.isDrawingMode) {
      if (activeTool === 'pen') {
        fabricCanvas.current.freeDrawingBrush.width = brushSize;
        fabricCanvas.current.freeDrawingBrush.color = selectedColor;
      } else if (activeTool === 'highlighter') {
        fabricCanvas.current.freeDrawingBrush.width = brushSize * 3;
        fabricCanvas.current.freeDrawingBrush.color = selectedColor + '40'; // Add transparency
      }
    }
  }, [brushSize, selectedColor, activeTool]);

  // Handle connection updates when objects move
  useEffect(() => {
    if (!fabricCanvas.current) return;

    const handleObjectMoving = () => {
      // Update connections in real-time as objects move
      updateAllConnections();
    };

    const handleObjectModified = (e) => {
      const obj = e.target;
      // If a frame was modified, ensure it stays at the back
      if (obj && obj.metadata && obj.metadata.type === 'frame') {
        setTimeout(() => {
          if (fabricCanvas.current && typeof fabricCanvas.current.sendToBack === 'function') {
            fabricCanvas.current.sendToBack(obj);
            fabricCanvas.current.renderAll();
          }
        }, 0);
      }
    };

    const handleSelectionCreated = (e) => {
      const obj = e.target;
      // If a frame is selected, allow editing but keep it at back
      if (obj && obj.metadata && obj.metadata.type === 'frame') {
        // Keep frame at back even when selected
        setTimeout(() => {
          if (fabricCanvas.current && typeof fabricCanvas.current.sendToBack === 'function') {
            fabricCanvas.current.sendToBack(obj);
            fabricCanvas.current.renderAll();
          }
        }, 0);
      }
    };

    const handleObjectRemoved = (e) => {
      const removedObject = e.target;
      if (removedObject && removedObject.metadata?.nodeId) {
        // Remove connections involving this object
        setConnections(prev => {
          const filtered = prev.filter(conn =>
            conn.fromId !== removedObject.metadata.nodeId &&
            conn.toId !== removedObject.metadata.nodeId
          );
          // Remove visual connections
          filtered.forEach(conn => {
            if (conn.fabricObject && fabricCanvas.current) {
              fabricCanvas.current.remove(conn.fabricObject);
            }
          });
          return filtered;
        });
      }
    };

    fabricCanvas.current.on('object:moving', handleObjectMoving);
    fabricCanvas.current.on('object:scaling', handleObjectMoving);
    fabricCanvas.current.on('object:removed', handleObjectRemoved);
    fabricCanvas.current.on('object:modified', handleObjectModified);
    fabricCanvas.current.on('selection:created', handleSelectionCreated);

    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.off('object:moving', handleObjectMoving);
        fabricCanvas.current.off('object:scaling', handleObjectMoving);
        fabricCanvas.current.off('object:removed', handleObjectRemoved);
        fabricCanvas.current.off('object:modified', handleObjectModified);
        fabricCanvas.current.off('selection:created', handleSelectionCreated);
      }
      clearTimeout(window.connectionUpdateTimeout);
    };
  }, [updateAllConnections]);

  // Handle double-click to edit text in shapes
  useEffect(() => {
    if (!fabricCanvas.current) return;

    const handleDoubleClick = (options) => {
      const target = options.target;
      if (target && target.type === 'group') {
        // Find the text object in the group
        const textObject = target.getObjects().find(obj => obj.type === 'i-text' || obj.type === 'text');
        if (textObject) {
          // Enter text editing mode
          textObject.enterEditing();
          textObject.selectAll();
          fabricCanvas.current.setActiveObject(textObject);
          fabricCanvas.current.renderAll();
        }
      }
    };

    fabricCanvas.current.on('mouse:dblclick', handleDoubleClick);

    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.off('mouse:dblclick', handleDoubleClick);
      }
    };
  }, []);

  const duplicateObject = useCallback(async (obj) => {
    if (!fabricCanvas.current || !obj) return;
    try {
      const cloned = await obj.clone();
      cloned.set({
        left: obj.left + 20,
        top: obj.top + 20,
      });
      fabricCanvas.current.add(cloned);
      fabricCanvas.current.setActiveObject(cloned);
      saveToHistory();
    } catch (error) {
      console.warn('Error duplicating object:', error);
      // Fallback for older Fabric.js versions
      obj.clone((cloned) => {
        cloned.set({
          left: obj.left + 20,
          top: obj.top + 20,
        });
        fabricCanvas.current.add(cloned);
        fabricCanvas.current.setActiveObject(cloned);
        saveToHistory();
      });
    }
  }, [saveToHistory]);

  // Handle right-click context menu
  useEffect(() => {
    if (!fabricCanvas.current) return;

    const handleContextMenu = (options) => {
      options.e.preventDefault();
      const pointer = fabricCanvas.current.getPointer(options.e);
      const target = options.target;

      // Don't show context menu for grid or non-selectable objects
      if (target && target.canvas === fabricCanvas.current && (!gridRef.current || target !== gridRef.current) && target.selectable !== false) {
        const isMultiSelect = target.type === 'activeSelection';
        const menuItems = [
          { label: 'Duplicate', action: () => duplicateObject(target) },
          { label: 'Delete', action: () => deleteSelected() },
          { label: '---', separator: true },
          { label: 'Bring to Front', action: () => bringToFront() },
          { label: 'Bring Forward', action: () => bringForward() },
          { label: 'Send Backward', action: () => sendBackward() },
          { label: 'Send to Back', action: () => sendToBack() },
        ];

        // Add alignment options for multi-select
        if (isMultiSelect) {
          menuItems.push(
            { label: '---', separator: true },
            { label: 'Align Left', action: () => alignLeft() },
            { label: 'Align Center', action: () => alignCenter() },
            { label: 'Align Right', action: () => alignRight() },
            { label: '---', separator: true },
            { label: 'Distribute Horizontally', action: () => distributeHorizontally() }
          );
        }

        menuItems.push(
          { label: '---', separator: true },
          { label: 'Group', action: () => groupSelected() },
          { label: 'Ungroup', action: () => ungroupSelected() }
        );

        setContextMenu({
          x: pointer.x,
          y: pointer.y,
          target: target,
          items: menuItems
        });
      }
    };

    const handleCanvasClick = () => {
      setContextMenu(null);
    };

    fabricCanvas.current.on('mouse:down', handleCanvasClick);
    fabricCanvas.current.on('contextmenu', handleContextMenu);

    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.off('mouse:down', handleCanvasClick);
        fabricCanvas.current.off('contextmenu', handleContextMenu);
      }
    };
  }, [deleteSelected, duplicateObject, bringToFront, bringForward, sendBackward, sendToBack, groupSelected, ungroupSelected, alignLeft, alignCenter, alignRight, distributeHorizontally]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close export menu if clicking outside
      if (showExportMenu && !e.target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
      // Close settings menu if clicking outside
      if (showSettingsMenu && !e.target.closest('.settings-menu-container')) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu, showSettingsMenu]);

  const exportCanvas = (format = 'png') => {
    if (!fabricCanvas.current) return;

    const currentCanvas = canvases.find(c => c._id === activeCanvasId);
    const canvasName = currentCanvas ? currentCanvas.name.replace(/\s+/g, '_').toLowerCase() : 'canvas';

    if (format === 'png') {
      const dataURL = fabricCanvas.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2, // Higher resolution
      });
      const link = document.createElement('a');
      link.download = `${canvasName}.${format}`;
      link.href = dataURL;
      link.click();
    } else if (format === 'svg') {
      const svg = fabricCanvas.current.toSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${canvasName}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      // Export as PDF with high quality
      const dataURL = fabricCanvas.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
      });

      // Create a temporary link to trigger download
      // In production, you'd want to use a library like jsPDF for better PDF generation
      const link = document.createElement('a');
      link.download = `${canvasName}.pdf`;
      link.href = dataURL;
      link.click();
    } else if (format === 'json') {
      // Export as AIVA-native format (JSON) with metadata
      const canvasData = {
        version: '1.0',
        name: currentCanvas?.name || 'Canvas',
        created: new Date().toISOString(),
        canvas: fabricCanvas.current.toJSON(),
        metadata: {
          zoom,
          isDarkMode,
          showGrid,
        }
      };
      const blob = new Blob([JSON.stringify(canvasData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${canvasName}.aiva`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const importCanvas = (file) => {
    if (!fabricCanvas.current || !file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const canvasData = JSON.parse(e.target.result);
        fabricCanvas.current.loadFromJSON(canvasData, () => {
          fabricCanvas.current.renderAll();
          saveToHistory();
        });
      } catch (error) {
        console.error('Error importing canvas:', error);
        alert('Error importing file. Please make sure it\'s a valid AIVA canvas file.');
      }
    };
    reader.readAsText(file);
  };

  const tools = [
    { id: 'select', icon: FaMousePointer, label: 'Select', shortcut: 'V', action: () => setActiveTool('select') },
    { id: 'pan', icon: FaHandPaper, label: 'Pan', shortcut: 'Space', action: () => setActiveTool('pan') },
    { id: 'pen', icon: FaPen, label: 'Pen', shortcut: 'P', action: () => setActiveTool('pen') },
    { id: 'highlighter', icon: FaHighlighter, label: 'Highlighter', shortcut: 'H', action: () => setActiveTool('highlighter') },
    { id: 'eraser', icon: FaEraser, label: 'Eraser', shortcut: 'E', action: () => setActiveTool('eraser') },
    { id: 'shape', icon: FaShapes, label: 'Shapes', shortcut: 'S', action: () => { setActiveTool('shape'); setShowShapeMenu(!showShapeMenu); } },
    { id: 'connect', icon: FaLink, label: 'Connect', shortcut: 'C', action: () => setActiveTool('connect') },
    { id: 'frame', icon: FaTh, label: 'Frame', shortcut: 'F', action: () => setActiveTool('frame') },
    { id: 'text', icon: FaFont, label: 'Text', shortcut: 'T', action: addText },
    { id: 'sticky', icon: FaStickyNote, label: 'Sticky Note', shortcut: 'N', action: addStickyNote },
  ];

  // Enhanced shape categories with professional flowchart and diagram shapes
  const shapeCategories = {
    flowchart: [
      { id: 'rectangle', icon: FaSquare, label: 'Process', action: () => setSelectedShape('rectangle') },
      { id: 'circle', icon: FaCircle, label: 'Start/End', action: () => setSelectedShape('circle') },
      { id: 'diamond', icon: ShapeDiamond, label: 'Decision', action: () => setSelectedShape('diamond') },
      { id: 'parallelogram', icon: ShapeParallelogram, label: 'Data', action: () => setSelectedShape('parallelogram') },
      { id: 'cylinder', icon: FaDatabase, label: 'Database', action: () => setSelectedShape('cylinder') },
      { id: 'document', icon: FaFileAlt, label: 'Document', action: () => setSelectedShape('document') },
    ],
    containers: [
      { id: 'rounded-rect', icon: FaSquare, label: 'Container', action: () => setSelectedShape('rounded-rect') },
      { id: 'hexagon', icon: ShapeHexagon, label: 'Hexagon', action: () => setSelectedShape('hexagon') },
      { id: 'octagon', icon: ShapeOctagon, label: 'Octagon', action: () => setSelectedShape('octagon') },
      { id: 'cloud', icon: FaCloud, label: 'Cloud', action: () => setSelectedShape('cloud') },
    ],
    symbols: [
      { id: 'star', icon: FaStar, label: 'Star', action: () => setSelectedShape('star') },
      { id: 'heart', icon: FaHeart, label: 'Heart', action: () => setSelectedShape('heart') },
      { id: 'triangle', icon: ShapeTriangle, label: 'Triangle', action: () => setSelectedShape('triangle') },
      { id: 'pentagon', icon: ShapePentagon, label: 'Pentagon', action: () => setSelectedShape('pentagon') },
    ],
    connectors: [
      { id: 'arrow', icon: FaArrowRight, label: 'Straight Arrow', action: () => setSelectedShape('arrow') },
      { id: 'line', icon: FaMinus, label: 'Line', action: () => setSelectedShape('line') },
      { id: 'curved-arrow', icon: FaArrowRight, label: 'Curved Arrow', action: () => setSelectedShape('curved-arrow') },
      { id: 'bidirectional', icon: FaArrowRight, label: 'Bidirectional', action: () => setSelectedShape('bidirectional') },
      { id: 'elbow-arrow', icon: FaArrowRight, label: 'Elbow Arrow', action: () => setSelectedShape('elbow-arrow') },
    ]
  };

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Left Sidebar - Tools */}
      <div className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={tool.action}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${activeTool === tool.id
              ? 'bg-blue-500 text-white shadow-lg scale-105'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
              }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <tool.icon className={`w-5 h-5 transition-transform ${activeTool === tool.id ? '' : 'group-hover:scale-110'}`} />
          </button>
        ))}

        {/* Connection Mode Selector */}
        {activeTool === 'connect' && (
          <div className="mt-4 space-y-2">
            <button
              onClick={() => setConnectionMode('directional')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${connectionMode === 'directional'
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
                }`}
              title="Directional Arrow"
            >
              <FaArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setConnectionMode('bidirectional')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative ${connectionMode === 'bidirectional'
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
                }`}
              title="Bidirectional Arrow"
            >
              <div className="flex">
                <FaArrowRight className="w-3 h-3 -mr-1" />
                <FaArrowRight className="w-3 h-3 rotate-180" />
              </div>
            </button>
          </div>
        )}

        {/* Shape Tools - Enhanced dropdown menu */}

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Tabs */}
        <div className="h-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 space-x-1">
          {canvases.map((canvasTab) => (
            <div key={canvasTab._id} className="flex items-center">
              <button
                onClick={() => switchCanvas(canvasTab._id)}
                className={`px-3 py-1 text-sm rounded-t-md border-t border-l border-r flex items-center space-x-2 ${activeCanvasId === canvasTab._id
                  ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                  : 'bg-gray-50 dark:bg-gray-800 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <span>{canvasTab.name}</span>
              </button>
              {canvases.length > 1 && (
                <button
                  onClick={() => closeCanvas(canvasTab._id)}
                  className="ml-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                  title="Close canvas"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={createNewCanvas}
            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md ml-2"
            title="New canvas"
          >
            <FaPlus className="w-4 h-4" />
          </button>
        </div>
        {/* Top Toolbar */}
        <div className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
          {/* Left side - Tools and controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">

              <button onClick={undo} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Undo (Ctrl+Z)">
                <FaUndo className="w-4 h-4" />
              </button>
              <button onClick={redo} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Redo (Ctrl+Y)">
                <FaRedo className="w-4 h-4" />
              </button>
              <button
                onClick={saveToHistory}
                className={`p-2 rounded flex items-center space-x-2 ${saveStatus === 'saving' ? 'text-yellow-600 dark:text-yellow-400' :
                  saveStatus === 'error' ? 'text-red-600 dark:text-red-400' :
                    'text-green-600 dark:text-green-400'
                  } hover:bg-gray-100 dark:hover:bg-gray-700`}
                title={`Save (Ctrl+S) - ${saveStatus === 'saving' ? 'Saving...' :
                  saveStatus === 'error' ? 'Save failed - click to retry' :
                    lastSaved ? 'Last saved: ' + lastSaved.toLocaleTimeString() : 'Saved'
                  }`}
              >
                <FaSave className={`w-4 h-4 ${saveStatus === 'saving' ? 'animate-pulse' : ''}`} />
                {saveStatus === 'saving' && <span className="text-xs">Saving...</span>}
                {saveStatus === 'error' && <span className="text-xs">Failed</span>}
              </button>
              <button onClick={deleteSelected} className={`p-2 rounded ${selectedObjects.length > 0 ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'}`} title="Delete Selected" disabled={selectedObjects.length === 0}>
                <FaTrash className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={zoomOut}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                -
              </button>
              <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
              <button
                onClick={zoomIn}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                +
              </button>
              <button
                onClick={fitToScreen}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Fit to Screen"
              >
                <FaExpand className="w-3 h-3" />
              </button>
            </div>

            {/* Brush Size */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Size:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-16"
              />
              <span className="text-sm font-medium min-w-[20px]">{brushSize}</span>
            </div>
          </div>

          {/* Center - Page title */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Canvas</h1>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded transition-colors ${showGrid ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="Toggle Grid"
            >
              <FaTh className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAIDialog(true)}
              className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded"
              title="AI Diagram Generation"
            >
              <FaMagic className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
            </button>
            <div className="relative export-menu-container">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Export"
              >
                <FaDownload className="w-4 h-4" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => {
                      exportCanvas('png');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Export as PNG
                  </button>
                  <button
                    onClick={() => {
                      exportCanvas('svg');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Export as SVG
                  </button>
                  <button
                    onClick={() => {
                      exportCanvas('pdf');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => {
                      exportCanvas('json');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    Export as AIVA
                  </button>
                </div>
              )}
            </div>
            <label className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer" title="Import AIVA file">
              <FaShare className="w-4 h-4" />
              <input
                type="file"
                accept=".aiva,.json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    importCanvas(file);
                  }
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>
            <div className="relative settings-menu-container">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Settings"
              >
                <FaCog className="w-4 h-4" />
              </button>
              {showSettingsMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50 min-w-[200px]">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Canvas Settings</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowGrid(!showGrid);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-between"
                  >
                    <span>Show Grid</span>
                    <span className={showGrid ? 'text-blue-600' : 'text-gray-400'}>
                      {showGrid ? '✓' : '○'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setSnapToGrid(!snapToGrid);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-between"
                  >
                    <span>Snap to Grid</span>
                    <span className={snapToGrid ? 'text-blue-600' : 'text-gray-400'}>
                      {snapToGrid ? '✓' : '○'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setConnectionMode(connectionMode === 'directional' ? 'bidirectional' : 'directional');
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-between"
                  >
                    <span>Connection Mode</span>
                    <span className="text-xs text-gray-500">{connectionMode}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-white dark:bg-gray-900">
          {/* Canvas Container - Stable, always rendered */}
          <div
            className="absolute inset-0"
            onDrop={(e) => {
              e.preventDefault();
              const shapeType = e.dataTransfer.getData('shape');
              if (shapeType && fabricCanvas.current) {
                const pointer = fabricCanvas.current.getPointer({ clientX: e.clientX, clientY: e.clientY });

                switch (shapeType) {
                  case 'rectangle':
                    addRectangleAt(pointer.x, pointer.y);
                    break;
                  case 'circle':
                    addCircleAt(pointer.x, pointer.y);
                    break;
                  case 'ellipse':
                    addEllipseAt(pointer.x, pointer.y);
                    break;
                  case 'diamond':
                    addDiamondAt(pointer.x, pointer.y);
                    break;
                  case 'parallelogram':
                    addParallelogramAt(pointer.x, pointer.y);
                    break;
                  case 'cylinder':
                    addCylinderAt(pointer.x, pointer.y);
                    break;
                  case 'document':
                    addDocumentAt(pointer.x, pointer.y);
                    break;
                  case 'rounded-rect':
                    addRoundedRectAt(pointer.x, pointer.y);
                    break;
                  case 'hexagon':
                    addHexagonAt(pointer.x, pointer.y);
                    break;
                  case 'star':
                    addStarAt(pointer.x, pointer.y);
                    break;
                  case 'heart':
                    addHeartAt(pointer.x, pointer.y);
                    break;
                  case 'triangle':
                    addTriangleAt(pointer.x, pointer.y);
                    break;
                  case 'pentagon':
                    addPentagonAt(pointer.x, pointer.y);
                    break;
                  case 'arrow':
                    addArrow(pointer.x, pointer.y);
                    break;
                  case 'line':
                    addLine(pointer.x, pointer.y);
                    break;
                  case 'curved-arrow':
                    addCurvedArrowAt(pointer.x, pointer.y);
                    break;
                  case 'bidirectional':
                    addBidirectionalAt(pointer.x, pointer.y);
                    break;
                }
                setShowShapeMenu(false);
              }
            }}
            onDragOver={(e) => {
              e.preventDefault(); // Allow drop
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                cursor: activeTool === 'pen' ? 'crosshair' : activeTool === 'select' ? 'default' : 'crosshair'
              }}
            />
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 pointer-events-none">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading canvas...</p>
              </div>
            </div>
          )}

          {/* Welcome Overlay (shown when canvas is empty) */}
          {fabricCanvas.current && fabricCanvas.current.getObjects().length === 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-6xl mb-6">🎨</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Canvas</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                Start creating your visual workspace. Use the tools on the left to add shapes, text, and more.
              </p>
            </div>
          )}

          {/* Context Menu */}
          {contextMenu && (
            <div
              className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50"
              style={{
                left: contextMenu.x,
                top: contextMenu.y,
              }}
            >
              {contextMenu.items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* AI Diagram Generation Dialog */}
          {showAIDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI Diagram Generation
                  </h3>
                  <button
                    onClick={() => {
                      setShowAIDialog(false);
                      setAiPrompt('');
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Describe your diagram
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g., Create a flowchart showing a user login process with authentication steps..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                    rows="4"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowAIDialog(false);
                      setAiPrompt('');
                    }}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (aiPrompt.trim()) {
                        const aiContext = await generateFromPrompt(aiPrompt);
                        console.log('Generated AI context:', aiContext);

                        // In a real implementation, this would call an AI service
                        // and apply the generated diagram structure:
                        // const aiResponse = await callAIService(aiContext);
                        // applyAIDiagram(aiResponse);

                        // Store references for future AI integration
                        window.__aiDiagramHandler = applyAIDiagram;

                        setShowAIDialog(false);
                        setAiPrompt('');
                      }
                    }}
                    disabled={!aiPrompt.trim()}
                    className="px-4 py-2 text-sm bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Properties & Shapes */}
      <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {showShapeMenu ? 'Shapes' : 'Properties'}
          </h3>
          {showShapeMenu && (
            <button
              onClick={() => setShowShapeMenu(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Close Shapes"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          {showShapeMenu ? (
            <div className="space-y-6 pb-4">
              {Object.entries(shapeCategories).map(([category, shapes]) => (
                <div key={category}>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-1 capitalize">
                    {category}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {shapes.map((shape) => (
                      <button
                        key={shape.id}
                        draggable="true"
                        onDragStart={(e) => {
                          e.dataTransfer.setData('shape', shape.id);
                          setSelectedShape(shape.id);
                        }}
                        onClick={() => {
                          shape.action();
                          // Keep menu open for standard sidebar behavior
                        }}
                        className={`group relative w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${selectedShape === shape.id
                          ? 'bg-blue-500 text-white shadow-lg scale-105'
                          : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md hover:scale-105'
                          }`}
                        title={shape.label}
                      >
                        <div className="w-5 h-5 mb-1 flex items-center justify-center">
                          {typeof shape.icon === 'function' ? shape.icon() : <shape.icon className="w-full h-full" />}
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight truncate w-full px-1">{shape.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-gray-800 dark:border-white' : 'border-gray-300'
                        }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Active Tool Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Active Tool
                </label>
                <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {activeTool}
                </div>
              </div>

              {/* Canvas Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Canvas Info
                </label>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Objects: {fabricCanvas.current ? fabricCanvas.current.getObjects().length : 0}<br />
                  Zoom: {zoom}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;