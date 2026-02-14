// components/diagram-core/DiagramCore.js
// Main DiagramCore component - reusable diagramming canvas

import { useRef, useCallback, useEffect, useMemo, forwardRef, useImperativeHandle, useState } from 'react';
import { DiagramCoreProvider, useDiagramCore } from './DiagramCoreContext';
import { GRID_PRESETS, mergeGridConfig } from './presets/gridPresets';
import { STENCIL_PRESETS, createStencilConfig } from './presets/stencilPresets';
import { CONNECTION_PRESETS, createConnectionConfig } from './presets/connectionPresets';
import { getBoundingBox, snapToGrid as snapValueToGrid, generateConnectionPath } from './utils/helpers';
import Grid from './canvas/Grid';
import Element from './elements/Element';
import Connection from './connections/Connection';
import ConnectionTypeSelector from './connections/ConnectionTypeSelector';
import RadialTypeSelector from './connections/RadialTypeSelector';
import Palette from './palette/Palette';
import PropertiesPanel from './properties/PropertiesPanel';
import ZoomControls from './canvas/ZoomControls';
import Minimap from './canvas/Minimap';

// === MAIN COMPONENT ===

const DiagramCore = forwardRef(function DiagramCore({
  // Identity
  diagramId,

  // Configuration
  grid = 'default',
  stencils = 'basic',
  connections = 'simple',
  canvas = {},
  propertiesPanel = true,
  palette,
  minimap,
  zoomControls,

  // Data
  elements: controlledElements,
  defaultElements = [],
  defaultConnections = [],

  // Callbacks
  onChange,
  onElementsChange,
  onConnectionsChange,
  onElementCreate,
  onElementUpdate,
  onElementDelete,
  onConnectionCreate,
  onSelectionChange,

  // Styling
  className = '',
  style = {},
}, ref) {
  // Resolve configurations
  const gridConfig = useMemo(() => {
    if (grid === false) return { visible: false };
    if (typeof grid === 'string') return GRID_PRESETS[grid] || GRID_PRESETS.default;
    return mergeGridConfig('default', grid);
  }, [grid]);

  const stencilConfig = useMemo(() => {
    let config;
    if (typeof stencils === 'string') {
      config = STENCIL_PRESETS[stencils] || STENCIL_PRESETS.basic;
    } else {
      config = createStencilConfig(stencils);
    }
    // Apply palette prop overrides
    if (palette !== undefined) {
      config = {
        ...config,
        showPalette: palette.enabled ?? palette !== false,
        palettePosition: palette.position || config.palettePosition || 'left',
      };
    }
    return config;
  }, [stencils, palette]);

  const connectionConfig = useMemo(() => {
    if (typeof connections === 'string') return CONNECTION_PRESETS[connections] || CONNECTION_PRESETS.simple;
    return createConnectionConfig(connections);
  }, [connections]);

  const canvasConfig = useMemo(() => ({
    width: canvas.width || 'auto',
    height: canvas.height || 'auto',
    minWidth: canvas.minWidth || 800,
    minHeight: canvas.minHeight || 600,
    padding: canvas.padding || 50,
    pannable: canvas.pannable ?? true,
    zoomable: canvas.zoomable ?? true,
    minZoom: canvas.minZoom || 0.1,
    maxZoom: canvas.maxZoom || 3,
    defaultZoom: canvas.defaultZoom || 1,
    zoomStep: canvas.zoomStep || 0.1,
    selectable: canvas.selectable ?? true,
    multiSelect: canvas.multiSelect ?? true,
    editable: canvas.editable ?? true,
    deletable: canvas.deletable ?? true,
    // Apply minimap and zoomControls prop overrides
    showMinimap: minimap?.enabled ?? canvas.showMinimap ?? false,
    showZoomControls: zoomControls?.enabled ?? canvas.showZoomControls ?? true,
    zoomControlsPosition: zoomControls?.position || canvas.zoomControlsPosition || 'bottom-right',
    minimapPosition: minimap?.position || canvas.minimapPosition || 'bottom-right',
  }), [canvas, minimap, zoomControls]);

  const propertiesPanelConfig = useMemo(() => {
    if (propertiesPanel === false) return { visible: false };
    if (propertiesPanel === true) return { visible: true, position: 'right', width: 280 };
    // Handle object with 'enabled' key
    return {
      visible: propertiesPanel.enabled ?? true,
      position: propertiesPanel.position || 'right',
      width: propertiesPanel.width || 280,
      ...propertiesPanel,
    };
  }, [propertiesPanel]);

  return (
    <DiagramCoreProvider
      defaultElements={controlledElements || defaultElements}
      defaultConnections={defaultConnections}
      stencilConfig={stencilConfig}
      gridConfig={gridConfig}
      connectionConfig={connectionConfig}
      canvasConfig={canvasConfig}
      onChange={onChange}
      onElementsChange={onElementsChange}
      onConnectionsChange={onConnectionsChange}
      onElementCreate={onElementCreate}
      onElementUpdate={onElementUpdate}
      onElementDelete={onElementDelete}
      onConnectionCreate={onConnectionCreate}
      onSelectionChange={onSelectionChange}
    >
      <DiagramCoreInner
        ref={ref}
        gridConfig={gridConfig}
        stencilConfig={stencilConfig}
        connectionConfig={connectionConfig}
        canvasConfig={canvasConfig}
        propertiesPanelConfig={propertiesPanelConfig}
        className={className}
        style={style}
      />
    </DiagramCoreProvider>
  );
});

// === INNER COMPONENT ===

const DiagramCoreInner = forwardRef(function DiagramCoreInner({
  gridConfig,
  stencilConfig,
  connectionConfig,
  canvasConfig,
  propertiesPanelConfig,
  className,
  style,
}, ref) {
  const {
    elements,
    connections,
    selectedIds,
    pan,
    zoom,
    connecting,
    createElement,
    createElements,
    updateElement,
    deleteElement,
    deleteElements,
    bringToFront,
    sendToBack,
    createConnection,
    updateConnection,
    deleteConnection,
    select,
    selectMultiple,
    clearSelection,
    selectAll,
    toggleSelect,
    setPan,
    setZoom,
    zoomTo,
    zoomToFit,
    panTo,
    undo,
    redo,
    canUndo,
    canRedo,
    setConnecting,
    pendingStencil,
    setPendingStencil,
    toJSON,
    fromJSON,
    getElement,
  } = useDiagramCore();

  const canvasRef = useRef(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  // Constrain pan to prevent scrolling beyond workable area
  const constrainPan = useCallback((newPan) => {
    const padding = canvasConfig.padding || 50;
    const maxPanX = padding; // Don't show empty space on the left
    const maxPanY = padding; // Don't show empty space on the top

    // Get canvas dimensions for minimum pan calculation
    const canvasWidth = canvasRef.current?.clientWidth || 800;
    const canvasHeight = canvasRef.current?.clientHeight || 600;

    // Calculate content bounds from elements
    let contentRight = canvasConfig.minWidth || 800;
    let contentBottom = canvasConfig.minHeight || 600;

    if (elements.length > 0) {
      elements.forEach(el => {
        contentRight = Math.max(contentRight, el.x + el.width + padding);
        contentBottom = Math.max(contentBottom, el.y + el.height + padding);
      });
    }

    // Minimum pan (don't show too much empty space on right/bottom)
    const minPanX = Math.min(maxPanX, canvasWidth - contentRight * zoom);
    const minPanY = Math.min(maxPanY, canvasHeight - contentBottom * zoom);

    return {
      x: Math.max(minPanX, Math.min(maxPanX, newPan.x)),
      y: Math.max(minPanY, Math.min(maxPanY, newPan.y)),
    };
  }, [canvasConfig.padding, canvasConfig.minWidth, canvasConfig.minHeight, elements, zoom]);

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);

  // Connection line mouse position
  const [connectMousePos, setConnectMousePos] = useState(null);

  // Connection type selector state
  const [connectionSelector, setConnectionSelector] = useState(null);

  // Track magnetic snap points from elements (for connection preview snapping)
  const [activeSnapPoint, setActiveSnapPoint] = useState(null);

  // Box selection (marquee) state
  const [marquee, setMarquee] = useState(null);
  const marqueeStartRef = useRef(null);

  // Alignment guides state
  const [alignmentGuides, setAlignmentGuides] = useState({ horizontal: [], vertical: [] });

  // Drag-and-drop state for palette items
  const [dropPreview, setDropPreview] = useState(null);

  // Clipboard state for copy/paste
  const clipboardRef = useRef(null);

  // Snap to grid toggle state (defaults to grid config setting)
  const [snapToGrid, setSnapToGrid] = useState(gridConfig?.snap ?? true);

  // Placement mode state (for click-to-place and drag-to-size)
  const [placementDrag, setPlacementDrag] = useState(null); // { startX, startY, currentX, currentY }

  // === ZOOM TO FIT ===
  // Custom implementation that accounts for actual canvas dimensions
  const handleZoomToFit = useCallback(() => {
    if (!canvasRef.current || elements.length === 0) {
      // No elements - just reset view
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }

    // Get actual canvas dimensions
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const padding = 60; // Padding around elements

    // Get bounding box of all elements
    const bounds = getBoundingBox(elements);
    if (!bounds || bounds.width === 0 || bounds.height === 0) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }

    // Calculate zoom to fit
    const scaleX = (canvasRect.width - padding * 2) / bounds.width;
    const scaleY = (canvasRect.height - padding * 2) / bounds.height;
    const newZoom = Math.min(scaleX, scaleY, canvasConfig.maxZoom || 3);
    const clampedZoom = Math.max(canvasConfig.minZoom || 0.1, Math.min(newZoom, 1.5)); // Cap at 1.5x

    // Calculate pan to center elements
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const newPanX = (canvasRect.width / 2) - (centerX * clampedZoom);
    const newPanY = (canvasRect.height / 2) - (centerY * clampedZoom);

    setZoom(clampedZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [elements, canvasConfig, setPan, setZoom]);

  // === IMPERATIVE API ===

  useImperativeHandle(ref, () => ({
    // Element operations
    createElement,
    createElements,
    updateElement,
    deleteElement,
    deleteElements,
    getElement,
    getElements: () => elements,

    // Connection operations
    createConnection,
    updateConnection,
    deleteConnection,
    getConnections: () => connections,

    // Selection
    select,
    selectMultiple,
    selectAll,
    clearSelection,
    getSelected: () => selectedIds,

    // View control
    zoomTo,
    zoomToFit: handleZoomToFit,
    panTo,
    getZoom: () => zoom,
    getPan: () => pan,

    // History
    undo,
    redo,
    canUndo: () => canUndo,
    canRedo: () => canRedo,

    // Data
    toJSON,
    fromJSON,

    // DOM
    getCanvasElement: () => canvasRef.current,
  }), [
    elements, connections, selectedIds, zoom, pan, canUndo, canRedo,
    createElement, createElements, updateElement, deleteElement, deleteElements, getElement,
    createConnection, updateConnection, deleteConnection,
    select, selectMultiple, selectAll, clearSelection,
    zoomTo, handleZoomToFit, panTo, undo, redo, toJSON, fromJSON,
  ]);

  // === CANVAS INTERACTIONS ===

  const handleCanvasMouseDown = useCallback((e) => {
    if (e.target !== canvasRef.current && !e.target.classList.contains('dc-canvas-content')) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - pan.x) / zoom;
    const canvasY = (e.clientY - rect.top - pan.y) / zoom;

    // Placement mode - left click starts element placement
    if (pendingStencil && e.button === 0) {
      e.preventDefault();
      // Start placement drag to track sizing
      setPlacementDrag({
        startX: canvasX,
        startY: canvasY,
        currentX: canvasX,
        currentY: canvasY,
      });
      return;
    }

    // Shift+left-drag for marquee selection
    if (e.button === 0 && e.shiftKey && canvasConfig.multiSelect) {
      e.preventDefault();
      marqueeStartRef.current = { x: canvasX, y: canvasY, shiftKey: true };
      setMarquee({
        startX: canvasX,
        startY: canvasY,
        currentX: canvasX,
        currentY: canvasY,
      });
      return;
    }

    // Left-drag (without shift) or middle button or alt+left for panning
    if (canvasConfig.pannable && (e.button === 1 || e.button === 0)) {
      isPanning.current = true;
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      e.preventDefault();

      // Clear selection on left-click (but not if we're just panning with middle button)
      if (e.button === 0 && canvasConfig.selectable) {
        clearSelection();
      }
      return;
    }
  }, [pan, zoom, canvasConfig, clearSelection, pendingStencil]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (isPanning.current) {
      const newPan = {
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      };
      setPan(constrainPan(newPan));
    }

    // Update placement drag sizing
    if (placementDrag && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - pan.x) / zoom;
      const canvasY = (e.clientY - rect.top - pan.y) / zoom;

      setPlacementDrag(prev => ({
        ...prev,
        currentX: canvasX,
        currentY: canvasY,
      }));
    }

    // Update marquee selection
    if (marquee && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - pan.x) / zoom;
      const canvasY = (e.clientY - rect.top - pan.y) / zoom;

      setMarquee(prev => ({
        ...prev,
        currentX: canvasX,
        currentY: canvasY,
      }));
    }

    // Track mouse for connection line
    if (connecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setConnectMousePos({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      });
    }
  }, [setPan, constrainPan, connecting, marquee, placementDrag, pan, zoom]);

  const handleCanvasMouseUp = useCallback(() => {
    isPanning.current = false;

    // Complete element placement
    if (placementDrag && pendingStencil) {
      const minX = Math.min(placementDrag.startX, placementDrag.currentX);
      const minY = Math.min(placementDrag.startY, placementDrag.currentY);
      const dragWidth = Math.abs(placementDrag.currentX - placementDrag.startX);
      const dragHeight = Math.abs(placementDrag.currentY - placementDrag.startY);

      // Determine if this was a click (small drag) or a drag-to-size
      const isClick = dragWidth < 10 && dragHeight < 10;

      // Get default size from stencil
      const defaultWidth = pendingStencil.defaultSize?.width || 120;
      const defaultHeight = pendingStencil.defaultSize?.height || 60;

      // Calculate final position and size
      let finalX, finalY, finalWidth, finalHeight;

      if (isClick) {
        // Single click - center element at click position with default size
        finalX = placementDrag.startX - defaultWidth / 2;
        finalY = placementDrag.startY - defaultHeight / 2;
        finalWidth = defaultWidth;
        finalHeight = defaultHeight;
      } else {
        // Drag-to-size - use dragged bounds
        finalX = minX;
        finalY = minY;
        // Ensure minimum size
        finalWidth = Math.max(dragWidth, 40);
        finalHeight = Math.max(dragHeight, 30);
      }

      // Apply grid snapping
      if (snapToGrid) {
        const gridSize = gridConfig?.size || 20;
        finalX = Math.round(finalX / gridSize) * gridSize;
        finalY = Math.round(finalY / gridSize) * gridSize;
        if (!isClick) {
          finalWidth = Math.round(finalWidth / gridSize) * gridSize;
          finalHeight = Math.round(finalHeight / gridSize) * gridSize;
        }
      }

      // Create the element - pass x/y and width/height directly (not nested objects)
      createElement({
        type: pendingStencil.id,
        x: Math.max(0, finalX),
        y: Math.max(0, finalY),
        width: finalWidth,
        height: finalHeight,
        label: pendingStencil.name || 'New Element',
      });

      // Clear placement state
      setPlacementDrag(null);
      setPendingStencil(null);
      return;
    }

    // Complete marquee selection
    if (marquee) {
      const minX = Math.min(marquee.startX, marquee.currentX);
      const maxX = Math.max(marquee.startX, marquee.currentX);
      const minY = Math.min(marquee.startY, marquee.currentY);
      const maxY = Math.max(marquee.startY, marquee.currentY);

      // Only select if marquee has meaningful size
      const marqueeWidth = maxX - minX;
      const marqueeHeight = maxY - minY;

      if (marqueeWidth > 5 || marqueeHeight > 5) {
        // Find elements within marquee bounds
        const selectedElements = elements.filter(el => {
          // Element must be fully inside the marquee
          return el.x >= minX &&
                 el.y >= minY &&
                 el.x + el.width <= maxX &&
                 el.y + el.height <= maxY;
        });

        if (selectedElements.length > 0) {
          const ids = selectedElements.map(el => el.id);
          if (marqueeStartRef.current?.shiftKey) {
            // Additive selection
            selectMultiple([...selectedIds, ...ids]);
          } else {
            selectMultiple(ids);
          }
        }
      }

      setMarquee(null);
      marqueeStartRef.current = null;
    }

    // Connection completion is handled by the global mouseup effect
  }, [marquee, elements, selectedIds, selectMultiple, placementDrag, pendingStencil, snapToGrid, gridConfig, createElement, setPendingStencil]);

  // Wheel for zoom/pan
  const handleWheel = useCallback((e) => {
    e.preventDefault();

    if (e.ctrlKey && canvasConfig.zoomable) {
      // Pinch zoom
      const delta = e.deltaY > 0 ? -canvasConfig.zoomStep : canvasConfig.zoomStep;
      setZoom(zoom + delta);
    } else if (canvasConfig.pannable) {
      // Pan
      setPan({
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY,
      });
    }
  }, [zoom, pan, canvasConfig, setZoom, setPan]);

  // Attach wheel listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Ref to track connection state for immediate mouseup handling
  const connectingRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    connectingRef.current = connecting;
  }, [connecting]);

  // Global mouseup handler for drag-to-connect completion
  // This is always attached and checks the ref for current connection state
  useEffect(() => {
    const handleGlobalMouseUp = (e) => {
      const currentConnecting = connectingRef.current;
      if (!currentConnecting?.isDragging) return;
      if (!canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;

      // Find target element under cursor
      const targetEl = elements.find(el => {
        return mouseX >= el.x && mouseX <= el.x + el.width &&
               mouseY >= el.y && mouseY <= el.y + el.height;
      });

      if (targetEl && targetEl.id !== currentConnecting.fromId) {
        // Show connection type selector if multiple types available
        const hasMultipleTypes = connectionConfig.types && connectionConfig.types.length > 1;
        const showSelector = connectionConfig.showTypeSelector !== false && hasMultipleTypes;

        if (showSelector) {
          setConnectionSelector({
            fromId: currentConnecting.fromId,
            toId: targetEl.id,
            snapPoint: activeSnapPoint?.elementId === targetEl.id ? activeSnapPoint : null,
            position: {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            },
          });
        } else {
          // Create connection directly
          createConnection(currentConnecting.fromId, targetEl.id, connectionConfig.defaultType);
        }
      }

      // Always clear connection state (update ref synchronously)
      connectingRef.current = null;
      setConnecting(null);
      setConnectMousePos(null);
      setActiveSnapPoint(null);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [elements, connectionConfig, pan, zoom, createConnection, activeSnapPoint, setConnecting]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if typing (except Escape)
      if ((e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && e.key !== 'Escape') return;

      const isMod = e.ctrlKey || e.metaKey;

      // Delete selected elements
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvasConfig.deletable) {
        e.preventDefault();
        if (selectedIds.length > 0) {
          deleteElements(selectedIds);
        }
      }

      // Select all
      if (isMod && e.key === 'a' && canvasConfig.multiSelect) {
        e.preventDefault();
        selectAll();
      }

      // Undo
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo
      if (isMod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }

      // Escape - clear selection and cancel modes
      if (e.key === 'Escape') {
        clearSelection();
        connectingRef.current = null;
        setConnecting(null);
        setConnectMousePos(null);
        setActiveSnapPoint(null);
        setMarquee(null);
        // Cancel placement mode
        setPendingStencil(null);
        setPlacementDrag(null);
      }

      // Arrow key nudge for selected elements
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedIds.length > 0) {
        e.preventDefault();
        const nudgeAmount = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -nudgeAmount : e.key === 'ArrowRight' ? nudgeAmount : 0;
        const dy = e.key === 'ArrowUp' ? -nudgeAmount : e.key === 'ArrowDown' ? nudgeAmount : 0;

        selectedIds.forEach(id => {
          const el = elements.find(el => el.id === id);
          if (el) {
            updateElement(id, { x: Math.max(0, el.x + dx), y: Math.max(0, el.y + dy) });
          }
        });
      }

      // Copy (Cmd+C)
      if (isMod && e.key === 'c' && selectedIds.length > 0) {
        e.preventDefault();
        const selectedElements = elements.filter(el => selectedIds.includes(el.id));
        const selectedConnections = connections.filter(
          conn => selectedIds.includes(conn.from) && selectedIds.includes(conn.to)
        );
        clipboardRef.current = {
          elements: selectedElements.map(el => ({ ...el })),
          connections: selectedConnections.map(conn => ({ ...conn })),
        };
        // Also try to copy to system clipboard
        try {
          navigator.clipboard.writeText(JSON.stringify(clipboardRef.current, null, 2));
        } catch (err) {
          // Ignore clipboard errors
        }
      }

      // Cut (Cmd+X)
      if (isMod && e.key === 'x' && selectedIds.length > 0) {
        e.preventDefault();
        const selectedElements = elements.filter(el => selectedIds.includes(el.id));
        const selectedConnections = connections.filter(
          conn => selectedIds.includes(conn.from) && selectedIds.includes(conn.to)
        );
        clipboardRef.current = {
          elements: selectedElements.map(el => ({ ...el })),
          connections: selectedConnections.map(conn => ({ ...conn })),
        };
        // Delete the selected elements
        deleteElements(selectedIds);
      }

      // Paste (Cmd+V)
      if (isMod && e.key === 'v' && clipboardRef.current) {
        e.preventDefault();
        const { elements: clipElements, connections: clipConnections } = clipboardRef.current;
        if (clipElements && clipElements.length > 0) {
          // Create ID mapping for pasted elements
          const idMap = {};
          const pastedIds = [];

          // Paste elements with offset
          clipElements.forEach(el => {
            const newId = createElement({
              ...el,
              id: undefined,
              x: el.x + 30,
              y: el.y + 30,
            });
            if (newId) {
              idMap[el.id] = newId;
              pastedIds.push(newId);
            }
          });

          // Paste connections with updated IDs
          clipConnections?.forEach(conn => {
            if (idMap[conn.from] && idMap[conn.to]) {
              createConnection(idMap[conn.from], idMap[conn.to], conn.type);
            }
          });

          // Select pasted elements
          if (pastedIds.length > 0) {
            selectMultiple(pastedIds);
          }

          // Update clipboard with new positions for subsequent pastes
          clipboardRef.current = {
            elements: clipElements.map(el => ({ ...el, x: el.x + 30, y: el.y + 30 })),
            connections: clipConnections,
          };
        }
      }

      // Duplicate (Cmd+D)
      if (isMod && e.key === 'd' && selectedIds.length > 0) {
        e.preventDefault();
        const selectedElements = elements.filter(el => selectedIds.includes(el.id));
        const selectedConnections = connections.filter(
          conn => selectedIds.includes(conn.from) && selectedIds.includes(conn.to)
        );

        const idMap = {};
        const pastedIds = [];

        selectedElements.forEach(el => {
          const newId = createElement({
            ...el,
            id: undefined,
            x: el.x + 20,
            y: el.y + 20,
          });
          if (newId) {
            idMap[el.id] = newId;
            pastedIds.push(newId);
          }
        });

        // Duplicate connections too
        selectedConnections.forEach(conn => {
          if (idMap[conn.from] && idMap[conn.to]) {
            createConnection(idMap[conn.from], idMap[conn.to], conn.type);
          }
        });

        // Select duplicated elements
        if (pastedIds.length > 0) {
          selectMultiple(pastedIds);
        }
      }

      // Zoom controls
      if (isMod && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom(zoom + canvasConfig.zoomStep);
      }
      if (isMod && e.key === '-') {
        e.preventDefault();
        setZoom(zoom - canvasConfig.zoomStep);
      }
      if (isMod && e.key === '0') {
        e.preventDefault();
        handleZoomToFit();
      }

      // Toggle grid snap (G key)
      if (e.key === 'g' && !isMod) {
        e.preventDefault();
        setSnapToGrid(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, elements, connections, canvasConfig, deleteElements, selectAll, undo, redo, clearSelection, setConnecting, setConnectMousePos, updateElement, createElement, createConnection, selectMultiple, zoom, setZoom, handleZoomToFit, setSnapToGrid, setPendingStencil]);

  // === ELEMENT HANDLERS ===

  const handleElementClick = useCallback((e, elementId) => {
    e.stopPropagation();

    // Drag-to-connect is handled by global mouseup effect
    // This handles click-only selection
    if (connecting && !connecting.isDragging) {
      // Legacy click-click connection mode (if not using drag)
      if (connecting.fromId !== elementId) {
        const hasMultipleTypes = connectionConfig.types && connectionConfig.types.length > 1;
        const showSelector = connectionConfig.showTypeSelector !== false && hasMultipleTypes;

        if (showSelector && canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          setConnectionSelector({
            fromId: connecting.fromId,
            toId: elementId,
            snapPoint: activeSnapPoint?.elementId === elementId ? activeSnapPoint : null,
            position: {
              x: (e.clientX - rect.left),
              y: (e.clientY - rect.top),
            },
          });
        } else {
          createConnection(connecting.fromId, elementId, connectionConfig.defaultType);
        }
      }
      connectingRef.current = null;
      setConnecting(null);
      setConnectMousePos(null);
      setActiveSnapPoint(null);
    } else if (!connecting) {
      // Normal selection handling
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        toggleSelect(elementId);
      } else {
        select(elementId);
      }
    }
  }, [connecting, connectionConfig, createConnection, setConnecting, toggleSelect, select, activeSnapPoint]);

  // Handle connection type selection
  const handleConnectionTypeSelect = useCallback((selection) => {
    if (connectionSelector) {
      const { fromId, toId } = connectionSelector;
      // Create connection with selected type and style
      const connId = createConnection(fromId, toId, selection.type);
      // Update connection with style if different from default
      if (connId && selection.style) {
        updateConnection(connId, { style: selection.style });
      }
    }
    setConnectionSelector(null);
  }, [connectionSelector, createConnection, updateConnection]);

  const handleConnectionSelectorCancel = useCallback(() => {
    setConnectionSelector(null);
  }, []);

  const handleElementDrag = useCallback((elementId, newX, newY, dx, dy) => {
    // If this element is selected and there are other selected elements, move them all
    if (selectedIds.includes(elementId) && selectedIds.length > 1 && dx !== undefined) {
      // Move all selected elements by the same delta
      selectedIds.forEach(id => {
        const el = elements.find(e => e.id === id);
        if (el) {
          updateElement(id, {
            x: Math.max(0, el.x + dx),
            y: Math.max(0, el.y + dy),
          });
        }
      });
    } else {
      // Single element drag
      updateElement(elementId, { x: newX, y: newY });
    }
  }, [updateElement, selectedIds, elements]);

  const handleElementResize = useCallback((elementId, newX, newY, newWidth, newHeight) => {
    updateElement(elementId, { x: newX, y: newY, width: newWidth, height: newHeight });
  }, [updateElement]);

  const handleStartConnection = useCallback((fromId, port) => {
    const newConnecting = { fromId, port, isDragging: true };
    // Update ref synchronously to avoid race condition with quick mouseup
    connectingRef.current = newConnecting;
    setConnecting(newConnecting);
  }, [setConnecting]);

  // Handle edge snap point updates from elements
  const handleEdgeSnap = useCallback((elementId, snapPoint) => {
    if (snapPoint) {
      setActiveSnapPoint({ elementId, ...snapPoint });
    } else if (activeSnapPoint?.elementId === elementId) {
      setActiveSnapPoint(null);
    }
  }, [activeSnapPoint]);

  // === ADD CONNECTED ELEMENT ===

  const handleAddConnected = useCallback((fromId, direction) => {
    const fromElement = elements.find(el => el.id === fromId);
    if (!fromElement) return;

    // Calculate position for new element based on direction
    const spacing = 40;
    const defaultStencil = stencilConfig.stencils?.[0];
    const newWidth = defaultStencil?.defaultSize?.width || 120;
    const newHeight = defaultStencil?.defaultSize?.height || 60;

    let newX, newY;
    if (direction === 'right') {
      newX = fromElement.x + fromElement.width + spacing;
      newY = fromElement.y + (fromElement.height - newHeight) / 2;
    } else if (direction === 'bottom') {
      newX = fromElement.x + (fromElement.width - newWidth) / 2;
      newY = fromElement.y + fromElement.height + spacing;
    } else if (direction === 'left') {
      newX = fromElement.x - newWidth - spacing;
      newY = fromElement.y + (fromElement.height - newHeight) / 2;
    } else {
      newX = fromElement.x + (fromElement.width - newWidth) / 2;
      newY = fromElement.y - newHeight - spacing;
    }

    // Grid snapping
    if (gridConfig?.snap) {
      newX = snapValueToGrid(newX, gridConfig.size || 20, gridConfig.snapThreshold || 10);
      newY = snapValueToGrid(newY, gridConfig.size || 20, gridConfig.snapThreshold || 10);
    }

    // Create new element
    const newId = createElement({
      type: fromElement.type,
      position: { x: Math.max(0, newX), y: Math.max(0, newY) },
      label: 'New Element',
    });

    // Create connection
    if (newId) {
      createConnection(fromId, newId, connectionConfig.defaultType);
    }
  }, [elements, stencilConfig, gridConfig, connectionConfig, createElement, createConnection]);

  // === CONTEXT MENU ===

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    if (!canvasConfig.editable) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Find if clicking on an element
    const elementEl = e.target.closest('.dc-element');
    const connectionEl = e.target.closest('.dc-connection-group');

    let menuItems = [];
    let targetId = null;
    let targetType = null;

    if (elementEl) {
      // Element context menu
      const elementId = elements.find(el => {
        const elLeft = el.x * zoom + pan.x;
        const elTop = el.y * zoom + pan.y;
        const elRight = elLeft + el.width * zoom;
        const elBottom = elTop + el.height * zoom;
        return e.clientX >= rect.left + elLeft &&
               e.clientX <= rect.left + elRight &&
               e.clientY >= rect.top + elTop &&
               e.clientY <= rect.top + elBottom;
      })?.id || selectedIds[0];

      targetId = elementId;
      targetType = 'element';

      menuItems = [
        { label: 'Edit Label', action: 'edit-label', icon: '✏️' },
        { label: 'Duplicate', action: 'duplicate', icon: '📋' },
        { type: 'divider' },
        { label: 'Bring to Front', action: 'bring-front', icon: '⬆️' },
        { label: 'Send to Back', action: 'send-back', icon: '⬇️' },
        { type: 'divider' },
        { label: 'Delete', action: 'delete', icon: '🗑️', danger: true },
      ];
    } else if (connectionEl) {
      // Connection context menu
      targetId = connectionEl.dataset?.connectionId;
      targetType = 'connection';

      menuItems = [
        { label: 'Edit Label', action: 'edit-connection-label', icon: '✏️' },
        { type: 'divider' },
        { label: 'Delete Connection', action: 'delete-connection', icon: '🗑️', danger: true },
      ];
    } else {
      // Canvas context menu
      targetType = 'canvas';

      menuItems = [
        { label: 'Select All', action: 'select-all', icon: '☑️' },
        { type: 'divider' },
        { label: 'Fit to View', action: 'fit-view', icon: '🔍' },
        { label: 'Reset Zoom', action: 'reset-zoom', icon: '↺' },
      ];
    }

    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      items: menuItems,
      targetId,
      targetType,
    });
  }, [canvasConfig.editable, elements, selectedIds, pan, zoom]);

  const handleContextMenuAction = useCallback((action) => {
    const { targetId, targetType } = contextMenu || {};
    setContextMenu(null);

    switch (action) {
      case 'edit-label':
        if (targetId) {
          select(targetId);
          // Trigger edit mode - handled by double-click in Element
        }
        break;
      case 'duplicate':
        if (targetId) {
          const element = elements.find(el => el.id === targetId);
          if (element) {
            createElement({
              ...element,
              id: undefined,
              x: element.x + 20,
              y: element.y + 20,
              label: `${element.label} (copy)`,
            });
          }
        }
        break;
      case 'bring-front':
        if (targetId) {
          bringToFront(targetId);
        }
        break;
      case 'send-back':
        if (targetId) {
          sendToBack(targetId);
        }
        break;
      case 'delete':
        if (targetId) {
          deleteElement(targetId);
        }
        break;
      case 'delete-connection':
        if (targetId) {
          deleteConnection(targetId);
        }
        break;
      case 'select-all':
        selectAll();
        break;
      case 'fit-view':
        handleZoomToFit();
        break;
      case 'reset-zoom':
        setZoom(1);
        setPan({ x: 0, y: 0 });
        break;
      default:
        break;
    }
  }, [contextMenu, elements, createElement, deleteElement, deleteConnection, selectAll, select, handleZoomToFit, setZoom, setPan]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // === CANVAS DOUBLE CLICK ===

  const handleCanvasDoubleClick = useCallback((e) => {
    if (!canvasConfig.editable) return;
    if (e.target !== canvasRef.current && !e.target.classList.contains('dc-canvas-content')) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Create default element
    const defaultStencil = stencilConfig.stencils?.[0];
    if (defaultStencil) {
      createElement({
        type: defaultStencil.id,
        position: { x, y },
      });
    }
  }, [canvasConfig, pan, zoom, stencilConfig, createElement]);

  // === DRAG AND DROP FROM PALETTE ===

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Show drop preview
    setDropPreview({ x, y });
  }, [pan, zoom]);

  const handleDragLeave = useCallback((e) => {
    // Only clear if leaving the canvas entirely
    if (!canvasRef.current?.contains(e.relatedTarget)) {
      setDropPreview(null);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDropPreview(null);

    if (!canvasConfig.editable || !canvasRef.current) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));

      if (data.type === 'stencil') {
        const rect = canvasRef.current.getBoundingClientRect();
        let x = (e.clientX - rect.left - pan.x) / zoom;
        let y = (e.clientY - rect.top - pan.y) / zoom;

        // Get stencil info for sizing
        const stencil = stencilConfig.stencils?.find(s => s.id === data.stencilId);
        const width = stencil?.defaultSize?.width || 120;
        const height = stencil?.defaultSize?.height || 60;

        // Center the element on the drop position
        x -= width / 2;
        y -= height / 2;

        // Grid snapping
        if (snapToGrid) {
          const gridSize = gridConfig?.size || 20;
          x = Math.round(x / gridSize) * gridSize;
          y = Math.round(y / gridSize) * gridSize;
        }

        createElement({
          type: data.stencilId,
          position: { x: Math.max(0, x), y: Math.max(0, y) },
          label: stencil?.name || 'New Element',
        });
      }
    } catch (err) {
      // Ignore invalid drop data
    }
  }, [canvasConfig, pan, zoom, stencilConfig, gridConfig, snapToGrid, createElement]);

  // === RENDER ===

  const showPalette = stencilConfig.showPalette !== false;
  const showProperties = propertiesPanelConfig.visible !== false;

  return (
    <div
      className={`dc-container ${className}`}
      style={{
        ...style,
        '--dc-bg': gridConfig.backgroundColor || '#ffffff',
      }}
    >
      {/* Left Palette */}
      {showPalette && stencilConfig.palettePosition !== 'right' && (
        <Palette
          stencilConfig={stencilConfig}
          position="left"
        />
      )}

      {/* Canvas Area */}
      <div className="dc-canvas-wrapper">
        <div
          ref={canvasRef}
          className="dc-canvas"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onDoubleClick={handleCanvasDoubleClick}
          onContextMenu={handleContextMenu}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            cursor: pendingStencil ? 'crosshair' : (isPanning.current ? 'grabbing' : 'grab'),
            background: gridConfig.backgroundColor,
          }}
        >
          {/* Grid */}
          {gridConfig.visible && (
            <Grid config={gridConfig} pan={pan} zoom={zoom} />
          )}

          {/* Transformable content */}
          <div
            className="dc-canvas-content"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {/* Connections SVG layer */}
            <svg className="dc-connections-layer">
              <defs>
                {/* Arrow markers for different types */}
                {connectionConfig.types?.map(type => (
                  <marker
                    key={type.id}
                    id={`arrow-${type.id}`}
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={type.color || '#374151'} />
                  </marker>
                ))}
              </defs>

              {connections.map(conn => (
                <Connection
                  key={conn.id}
                  connection={conn}
                  elements={elements}
                  config={connectionConfig}
                  selected={selectedIds.includes(conn.id)}
                  zoom={zoom}
                  onSelect={() => select(conn.id)}
                  onUpdate={(updates) => updateConnection(conn.id, updates)}
                  onDelete={() => deleteConnection(conn.id)}
                />
              ))}

              {/* Alignment guides */}
              {(alignmentGuides.horizontal.length > 0 || alignmentGuides.vertical.length > 0) && (
                <g className="dc-alignment-guides">
                  {alignmentGuides.vertical.map((guide, i) => (
                    <line
                      key={`v-${i}`}
                      x1={guide.x}
                      y1={-10000}
                      x2={guide.x}
                      y2={10000}
                      stroke="#3b82f6"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.6"
                    />
                  ))}
                  {alignmentGuides.horizontal.map((guide, i) => (
                    <line
                      key={`h-${i}`}
                      x1={-10000}
                      y1={guide.y}
                      x2={10000}
                      y2={guide.y}
                      stroke="#3b82f6"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.6"
                    />
                  ))}
                </g>
              )}

              {/* Temporary connection line while drawing */}
              {connecting && connectMousePos && (() => {
                const fromEl = elements.find(el => el.id === connecting.fromId);
                if (!fromEl) return null;

                // Calculate source port position
                const port = connecting.port || 'right';
                let x1, y1;
                switch (port) {
                  case 'top':
                    x1 = fromEl.x + fromEl.width / 2;
                    y1 = fromEl.y;
                    break;
                  case 'bottom':
                    x1 = fromEl.x + fromEl.width / 2;
                    y1 = fromEl.y + fromEl.height;
                    break;
                  case 'left':
                    x1 = fromEl.x;
                    y1 = fromEl.y + fromEl.height / 2;
                    break;
                  case 'right':
                  default:
                    x1 = fromEl.x + fromEl.width;
                    y1 = fromEl.y + fromEl.height / 2;
                    break;
                }

                // Use snap point if available, otherwise mouse position
                const targetPos = activeSnapPoint?.position || connectMousePos;
                const isSnapping = !!activeSnapPoint;

                // Generate curved path matching the connection style
                const connectionStyle = connectionConfig.style || 'bezier';
                const curvature = connectionConfig.curvature ?? 0.25;
                const fromPos = { x: x1, y: y1 };
                const previewPath = generateConnectionPath(fromPos, targetPos, connectionStyle, curvature);

                return (
                  <g className="dc-connection-preview">
                    {/* Arrow marker for preview */}
                    <defs>
                      <marker
                        id="preview-arrow"
                        viewBox="0 0 10 10"
                        refX="9"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                      </marker>
                    </defs>
                    {/* Curved preview path */}
                    <path
                      className={`dc-temp-connection ${isSnapping ? 'snapping' : ''}`}
                      d={previewPath}
                      stroke="#3b82f6"
                      strokeWidth={isSnapping ? 2.5 : 2}
                      strokeDasharray={isSnapping ? "none" : "6 4"}
                      fill="none"
                      opacity={isSnapping ? 1 : 0.7}
                      markerEnd="url(#preview-arrow)"
                    />
                  </g>
                );
              })()}
            </svg>

            {/* Elements (rendered after SVG connections layer, so they appear on top) */}
            {elements.map(element => (
              <Element
                key={element.id}
                element={element}
                stencil={stencilConfig.stencils?.find(s => s.id === element.type)}
                selected={selectedIds.includes(element.id)}
                editable={canvasConfig.editable}
                gridConfig={gridConfig}
                snapToGrid={snapToGrid}
                zoom={zoom}
                connecting={connecting}
                connectMousePos={connectMousePos}
                otherElements={elements}
                selectedIds={selectedIds}
                onClick={(e) => handleElementClick(e, element.id)}
                onDrag={(x, y, dx, dy) => handleElementDrag(element.id, x, y, dx, dy)}
                onResize={(x, y, w, h) => handleElementResize(element.id, x, y, w, h)}
                onStartConnection={(port) => handleStartConnection(element.id, port)}
                onEdgeSnap={(snapPoint) => handleEdgeSnap(element.id, snapPoint)}
                onAlignmentGuides={setAlignmentGuides}
                onAddConnected={(dir) => handleAddConnected(element.id, dir)}
                onUpdate={(updates) => updateElement(element.id, updates)}
                onDelete={() => deleteElement(element.id)}
              />
            ))}

            {/* Arrowhead overlay layer - rendered after elements so arrows appear on top */}
            <svg className="dc-arrowheads-layer">
              {connections.map(conn => (
                <Connection
                  key={`arrows-${conn.id}`}
                  connection={conn}
                  elements={elements}
                  config={connectionConfig}
                  selected={selectedIds.includes(conn.id)}
                  zoom={zoom}
                  arrowsOnly={true}
                />
              ))}
            </svg>

            {/* Marquee selection rectangle */}
            {marquee && (
              <div
                className="dc-marquee"
                style={{
                  position: 'absolute',
                  left: Math.min(marquee.startX, marquee.currentX),
                  top: Math.min(marquee.startY, marquee.currentY),
                  width: Math.abs(marquee.currentX - marquee.startX),
                  height: Math.abs(marquee.currentY - marquee.startY),
                  border: '2px dashed #3b82f6',
                  background: 'rgba(59, 130, 246, 0.1)',
                  pointerEvents: 'none',
                  zIndex: 1000,
                }}
              />
            )}

            {/* Drop preview for drag-and-drop */}
            {dropPreview && (
              <div
                className="dc-drop-preview"
                style={{
                  position: 'absolute',
                  left: dropPreview.x - 60,
                  top: dropPreview.y - 30,
                  width: 120,
                  height: 60,
                  border: '2px dashed #10b981',
                  borderRadius: 8,
                  background: 'rgba(16, 185, 129, 0.1)',
                  pointerEvents: 'none',
                  zIndex: 1000,
                }}
              />
            )}

            {/* Placement preview for click-to-place/drag-to-size */}
            {placementDrag && pendingStencil && (() => {
              const minX = Math.min(placementDrag.startX, placementDrag.currentX);
              const minY = Math.min(placementDrag.startY, placementDrag.currentY);
              const dragWidth = Math.abs(placementDrag.currentX - placementDrag.startX);
              const dragHeight = Math.abs(placementDrag.currentY - placementDrag.startY);
              const isClick = dragWidth < 10 && dragHeight < 10;
              const defaultWidth = pendingStencil.defaultSize?.width || 120;
              const defaultHeight = pendingStencil.defaultSize?.height || 60;
              const color = pendingStencil.color || '#3b82f6';

              // Show either default size centered at click, or dragged bounds
              const previewX = isClick ? placementDrag.startX - defaultWidth / 2 : minX;
              const previewY = isClick ? placementDrag.startY - defaultHeight / 2 : minY;
              const previewWidth = isClick ? defaultWidth : Math.max(dragWidth, 40);
              const previewHeight = isClick ? defaultHeight : Math.max(dragHeight, 30);

              return (
                <div
                  className="dc-placement-preview"
                  style={{
                    position: 'absolute',
                    left: previewX,
                    top: previewY,
                    width: previewWidth,
                    height: previewHeight,
                    border: `2px dashed ${color}`,
                    borderRadius: pendingStencil.shape === 'circle' ? '50%' : 8,
                    background: `${color}20`,
                    pointerEvents: 'none',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: color,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {!isClick && `${Math.round(previewWidth)} × ${Math.round(previewHeight)}`}
                </div>
              );
            })()}
          </div>

          {/* Zoom Controls */}
          {canvasConfig.showZoomControls && (
            <ZoomControls
              zoom={zoom}
              onZoomIn={() => setZoom(zoom + canvasConfig.zoomStep)}
              onZoomOut={() => setZoom(zoom - canvasConfig.zoomStep)}
              onReset={handleZoomToFit}
              position={canvasConfig.zoomControlsPosition}
              snapToGrid={snapToGrid}
              onSnapToggle={() => setSnapToGrid(prev => !prev)}
            />
          )}

          {/* Minimap */}
          {canvasConfig.showMinimap && (
            <Minimap
              elements={elements}
              pan={pan}
              zoom={zoom}
              position={canvasConfig.minimapPosition}
              onPan={setPan}
            />
          )}

          {/* Empty state */}
          {elements.length === 0 && (
            <div className="dc-empty-state">
              <div className="dc-empty-icon">📐</div>
              <div className="dc-empty-title">Start creating your diagram</div>
              <div className="dc-empty-hint">
                {showPalette
                  ? 'Drag elements from the palette or double-click to add'
                  : 'Double-click to add elements'}
              </div>
            </div>
          )}

          {/* Context Menu */}
          {contextMenu && (
            <div
              className="dc-context-menu"
              style={{
                position: 'absolute',
                left: contextMenu.x,
                top: contextMenu.y,
                zIndex: 1000,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {contextMenu.items.map((item, idx) =>
                item.type === 'divider' ? (
                  <div key={idx} className="dc-context-menu-divider" />
                ) : (
                  <button
                    key={idx}
                    className={`dc-context-menu-item ${item.danger ? 'danger' : ''}`}
                    onClick={() => handleContextMenuAction(item.action)}
                  >
                    <span className="dc-context-menu-icon">{item.icon}</span>
                    <span className="dc-context-menu-label">{item.label}</span>
                  </button>
                )
              )}
            </div>
          )}

          {/* Connection Type Selector - Radial Menu */}
          {connectionSelector && (
            <RadialTypeSelector
              position={connectionSelector.position}
              types={connectionConfig.types}
              defaultType={connectionConfig.defaultType}
              onSelect={handleConnectionTypeSelect}
              onCancel={handleConnectionSelectorCancel}
            />
          )}
        </div>
      </div>

      {/* Right Palette (if configured) */}
      {showPalette && stencilConfig.palettePosition === 'right' && (
        <Palette
          stencilConfig={stencilConfig}
          position="right"
        />
      )}

      {/* Properties Panel */}
      {showProperties && selectedIds.length > 0 && (
        <PropertiesPanel
          config={propertiesPanelConfig}
          stencilConfig={stencilConfig}
          connectionConfig={connectionConfig}
        />
      )}
    </div>
  );
});

export default DiagramCore;
