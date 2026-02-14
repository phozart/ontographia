// components/spaces/ea/EACanvas.js
// EA Diagram Canvas with pan, zoom, selection, and ArchiMate element support
// Simplified canvas optimized for enterprise architecture modeling

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
  memo,
} from 'react';
import { EA_LAYERS, EA_ELEMENT_TYPE_MAP } from '../../../lib/ea-types';
import { validateRelationship, getValidRelationshipTypes } from '../../../lib/ea-validation';

// ============ CONSTANTS ============

const CANVAS_CONFIG = {
  minZoom: 0.25,
  maxZoom: 3,
  defaultZoom: 1,
  zoomStep: 0.1,
  gridSize: 20,
  snapThreshold: 10,
  padding: 50,
};

// ============ GRID COMPONENT ============

const Grid = memo(function Grid({ zoom, pan, gridSize = 20, visible = true }) {
  if (!visible) return null;

  const scaledSize = gridSize * zoom;
  const offsetX = pan.x % scaledSize;
  const offsetY = pan.y % scaledSize;

  return (
    <svg
      className="ea-canvas__grid"
      width="100%"
      height="100%"
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    >
      <defs>
        <pattern
          id="ea-grid-dots"
          x={offsetX}
          y={offsetY}
          width={scaledSize}
          height={scaledSize}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={scaledSize / 2} cy={scaledSize / 2} r={1} fill="#E2E0DB" />
        </pattern>
        <pattern
          id="ea-grid-major"
          x={offsetX}
          y={offsetY}
          width={scaledSize * 5}
          height={scaledSize * 5}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={scaledSize * 2.5} cy={scaledSize * 2.5} r={1.5} fill="#D4D2CC" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ea-grid-dots)" />
      <rect width="100%" height="100%" fill="url(#ea-grid-major)" />
    </svg>
  );
});

// ============ ELEMENT NODE COMPONENT ============

const EAElementNode = memo(function EAElementNode({
  element,
  zoom,
  isSelected,
  isDragging,
  onMouseDown,
  onDoubleClick,
}) {
  const typeConfig = EA_ELEMENT_TYPE_MAP[element.type] || {};
  const layerConfig = EA_LAYERS[typeConfig.layer] || {};
  const color = element.color || typeConfig.color || layerConfig.color || '#6b7280';

  return (
    <g
      className={`ea-element ${isSelected ? 'ea-element--selected' : ''} ${isDragging ? 'ea-element--dragging' : ''}`}
      transform={`translate(${element.x}, ${element.y})`}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Element shape */}
      <rect
        x={0}
        y={0}
        width={element.width || 120}
        height={element.height || 60}
        rx={4}
        fill={`${color}20`}
        stroke={isSelected ? '#1F1E1B' : color}
        strokeWidth={isSelected ? 2 : 1.5}
      />

      {/* Layer indicator */}
      <rect
        x={0}
        y={0}
        width={4}
        height={element.height || 60}
        rx={2}
        fill={color}
      />

      {/* Element name */}
      <text
        x={(element.width || 120) / 2}
        y={(element.height || 60) / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="ea-element__label"
        style={{
          fontSize: Math.min(12 / zoom, 12),
          fill: '#1F1E1B',
          pointerEvents: 'none',
        }}
      >
        {element.name || element.type}
      </text>

      {/* Type badge */}
      <text
        x={(element.width || 120) / 2}
        y={(element.height || 60) - 8}
        textAnchor="middle"
        className="ea-element__type"
        style={{
          fontSize: Math.min(9 / zoom, 9),
          fill: '#9C9A94',
          pointerEvents: 'none',
        }}
      >
        {typeConfig.name || element.type}
      </text>

      {/* Resize handles when selected */}
      {isSelected && (
        <>
          <rect x={-4} y={-4} width={8} height={8} fill="#47453F" rx={2} className="ea-element__handle" />
          <rect x={(element.width || 120) - 4} y={-4} width={8} height={8} fill="#47453F" rx={2} className="ea-element__handle" />
          <rect x={-4} y={(element.height || 60) - 4} width={8} height={8} fill="#47453F" rx={2} className="ea-element__handle" />
          <rect x={(element.width || 120) - 4} y={(element.height || 60) - 4} width={8} height={8} fill="#47453F" rx={2} className="ea-element__handle" />
        </>
      )}
    </g>
  );
});

// ============ RELATIONSHIP LINE COMPONENT ============

const EARelationshipLine = memo(function EARelationshipLine({
  relationship,
  sourceElement,
  targetElement,
  isSelected,
  onMouseDown,
  onDoubleClick,
}) {
  if (!sourceElement || !targetElement) return null;

  // Calculate line endpoints (center of each element)
  const sourceX = sourceElement.x + (sourceElement.width || 120) / 2;
  const sourceY = sourceElement.y + (sourceElement.height || 60) / 2;
  const targetX = targetElement.x + (targetElement.width || 120) / 2;
  const targetY = targetElement.y + (targetElement.height || 60) / 2;

  // Simple straight line for now
  const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

  // Get relationship style based on type
  const getStrokeDasharray = (type) => {
    switch (type) {
      case 'realization':
      case 'access':
        return '5,5';
      case 'influence':
        return '2,4';
      default:
        return 'none';
    }
  };

  return (
    <g
      className={`ea-relationship ${isSelected ? 'ea-relationship--selected' : ''}`}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      <path
        d={path}
        fill="none"
        stroke={isSelected ? '#1F1E1B' : '#6b7280'}
        strokeWidth={isSelected ? 2 : 1.5}
        strokeDasharray={getStrokeDasharray(relationship.type)}
        markerEnd="url(#ea-arrow)"
      />
      {/* Invisible wider path for easier clicking */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        style={{ cursor: 'pointer' }}
      />
    </g>
  );
});

// ============ ZOOM CONTROLS COMPONENT ============

const ZoomControls = memo(function ZoomControls({ zoom, onZoomIn, onZoomOut, onZoomFit, onZoomReset }) {
  return (
    <div className="ea-canvas__zoom-controls">
      <button onClick={onZoomOut} title="Zoom out (-)">−</button>
      <span className="ea-canvas__zoom-level">{Math.round(zoom * 100)}%</span>
      <button onClick={onZoomIn} title="Zoom in (+)">+</button>
      <button onClick={onZoomReset} title="Reset zoom (0)" className="ea-canvas__zoom-reset">1:1</button>
      <button onClick={onZoomFit} title="Fit to content (F)">Fit</button>
    </div>
  );
});

// ============ MAIN CANVAS COMPONENT ============

const EACanvas = forwardRef(function EACanvas({
  elements = [],
  relationships = [],
  selectedIds = [],
  onElementsChange,
  onRelationshipsChange,
  onSelectionChange,
  onElementCreate,
  onElementUpdate,
  onElementDelete,
  onRelationshipCreate,
  onRelationshipDelete,
  onElementDoubleClick,
  onRelationshipDoubleClick,
  showGrid = true,
  readOnly = false,
  className = '',
}, ref) {
  // State
  const [zoom, setZoom] = useState(CANVAS_CONFIG.defaultZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [marquee, setMarquee] = useState(null);

  // Refs
  const canvasRef = useRef(null);
  const svgRef = useRef(null);

  // Element lookup map
  const elementsMap = useMemo(() => {
    const map = new Map();
    elements.forEach((el) => map.set(el.id, el));
    return map;
  }, [elements]);

  // ============ COORDINATE CONVERSION ============

  const screenToCanvas = useCallback((screenX, screenY) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (screenX - rect.left - pan.x) / zoom,
      y: (screenY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  const canvasToScreen = useCallback((canvasX, canvasY) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: canvasX * zoom + pan.x + rect.left,
      y: canvasY * zoom + pan.y + rect.top,
    };
  }, [pan, zoom]);

  // ============ ZOOM FUNCTIONS ============

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + CANVAS_CONFIG.zoomStep, CANVAS_CONFIG.maxZoom));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - CANVAS_CONFIG.zoomStep, CANVAS_CONFIG.minZoom));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(CANVAS_CONFIG.defaultZoom);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleZoomFit = useCallback(() => {
    if (!canvasRef.current || elements.length === 0) {
      handleZoomReset();
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const padding = 60;

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elements.forEach((el) => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + (el.width || 120));
      maxY = Math.max(maxY, el.y + (el.height || 60));
    });

    if (minX === Infinity) {
      handleZoomReset();
      return;
    }

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // Calculate zoom to fit
    const scaleX = (rect.width - padding * 2) / contentWidth;
    const scaleY = (rect.height - padding * 2) / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, CANVAS_CONFIG.maxZoom);
    const clampedZoom = Math.max(CANVAS_CONFIG.minZoom, Math.min(newZoom, 1.5));

    // Calculate pan to center
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const newPanX = rect.width / 2 - centerX * clampedZoom;
    const newPanY = rect.height / 2 - centerY * clampedZoom;

    setZoom(clampedZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [elements, handleZoomReset]);

  // ============ SELECTION FUNCTIONS ============

  const selectElement = useCallback((id, addToSelection = false) => {
    if (addToSelection) {
      const newSelection = selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id];
      onSelectionChange?.(newSelection);
    } else {
      onSelectionChange?.([id]);
    }
  }, [selectedIds, onSelectionChange]);

  const clearSelection = useCallback(() => {
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  // ============ DRAG HANDLERS ============

  const handleElementMouseDown = useCallback((e, element) => {
    if (readOnly) return;
    e.stopPropagation();

    const isMultiSelect = e.shiftKey || e.metaKey || e.ctrlKey;
    selectElement(element.id, isMultiSelect);

    if (!isMultiSelect || selectedIds.includes(element.id)) {
      setIsDragging(true);
      setDraggedElementId(element.id);
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setDragStart({
        mouseX: canvasPos.x,
        mouseY: canvasPos.y,
        elements: elements.filter((el) =>
          selectedIds.includes(el.id) || el.id === element.id
        ).map((el) => ({ id: el.id, x: el.x, y: el.y })),
      });
    }
  }, [readOnly, selectElement, selectedIds, elements, screenToCanvas]);

  const handleCanvasMouseDown = useCallback((e) => {
    // Only handle clicks on canvas background
    if (e.target !== svgRef.current && !e.target.classList.contains('ea-canvas__background')) return;

    const canvasPos = screenToCanvas(e.clientX, e.clientY);

    // Shift+click starts marquee selection
    if (e.shiftKey) {
      setMarquee({
        startX: canvasPos.x,
        startY: canvasPos.y,
        currentX: canvasPos.x,
        currentY: canvasPos.y,
      });
      return;
    }

    // Regular click clears selection and starts panning
    clearSelection();
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [screenToCanvas, clearSelection, pan]);

  const handleMouseMove = useCallback((e) => {
    // Panning
    if (isPanning && panStart) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // Element dragging
    if (isDragging && dragStart) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const deltaX = canvasPos.x - dragStart.mouseX;
      const deltaY = canvasPos.y - dragStart.mouseY;

      const updatedElements = elements.map((el) => {
        const original = dragStart.elements.find((d) => d.id === el.id);
        if (original) {
          return {
            ...el,
            x: Math.round(original.x + deltaX),
            y: Math.round(original.y + deltaY),
          };
        }
        return el;
      });

      onElementsChange?.(updatedElements);
      return;
    }

    // Marquee selection
    if (marquee) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setMarquee((prev) => ({
        ...prev,
        currentX: canvasPos.x,
        currentY: canvasPos.y,
      }));
    }
  }, [isPanning, panStart, isDragging, dragStart, marquee, elements, screenToCanvas, onElementsChange]);

  const handleMouseUp = useCallback((e) => {
    // End marquee selection
    if (marquee) {
      const minX = Math.min(marquee.startX, marquee.currentX);
      const maxX = Math.max(marquee.startX, marquee.currentX);
      const minY = Math.min(marquee.startY, marquee.currentY);
      const maxY = Math.max(marquee.startY, marquee.currentY);

      const selected = elements
        .filter((el) => {
          const elRight = el.x + (el.width || 120);
          const elBottom = el.y + (el.height || 60);
          return el.x < maxX && elRight > minX && el.y < maxY && elBottom > minY;
        })
        .map((el) => el.id);

      if (selected.length > 0) {
        onSelectionChange?.(selected);
      }
      setMarquee(null);
    }

    // End dragging
    if (isDragging) {
      setIsDragging(false);
      setDraggedElementId(null);
      setDragStart(null);
    }

    // End panning
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
    }
  }, [marquee, isDragging, isPanning, elements, onSelectionChange]);

  // ============ WHEEL HANDLER (ZOOM) ============

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -CANVAS_CONFIG.zoomStep : CANVAS_CONFIG.zoomStep;
      setZoom((prev) => Math.max(CANVAS_CONFIG.minZoom, Math.min(prev + delta, CANVAS_CONFIG.maxZoom)));
    }
  }, []);

  // ============ DROP HANDLER ============

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (readOnly) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'ea-element') {
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        const typeConfig = EA_ELEMENT_TYPE_MAP[data.elementType] || {};

        const newElement = {
          id: `el-${Date.now()}`,
          type: data.elementType,
          name: typeConfig.name || data.elementType,
          x: Math.round(canvasPos.x - 60), // Center on drop position
          y: Math.round(canvasPos.y - 30),
          width: 120,
          height: 60,
          layer: data.layer,
        };

        onElementCreate?.(newElement);
      }
    } catch (err) {
      // Ignore invalid drops
    }
  }, [readOnly, screenToCanvas, onElementCreate]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // ============ KEYBOARD SHORTCUTS ============

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle when canvas is focused
      if (!canvasRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (!readOnly && selectedIds.length > 0) {
            e.preventDefault();
            selectedIds.forEach((id) => onElementDelete?.(id));
            clearSelection();
          }
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomReset();
          }
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomFit();
          }
          break;
        case 'Escape':
          clearSelection();
          break;
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onSelectionChange?.(elements.map((el) => el.id));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readOnly, selectedIds, elements, onElementDelete, onSelectionChange, clearSelection, handleZoomIn, handleZoomOut, handleZoomReset, handleZoomFit]);

  // ============ IMPERATIVE API ============

  useImperativeHandle(ref, () => ({
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    zoomReset: handleZoomReset,
    zoomFit: handleZoomFit,
    getZoom: () => zoom,
    getPan: () => pan,
    setZoom,
    setPan,
    screenToCanvas,
    canvasToScreen,
    selectElement,
    clearSelection,
    getSelectedIds: () => selectedIds,
    getElements: () => elements,
    getRelationships: () => relationships,
  }), [zoom, pan, selectedIds, elements, relationships, handleZoomIn, handleZoomOut, handleZoomReset, handleZoomFit, screenToCanvas, canvasToScreen, selectElement, clearSelection]);

  // ============ RENDER ============

  return (
    <div
      ref={canvasRef}
      className={`ea-canvas ${className}`}
      tabIndex={0}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Grid */}
      <Grid zoom={zoom} pan={pan} gridSize={CANVAS_CONFIG.gridSize} visible={showGrid} />

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className="ea-canvas__svg"
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          {/* Arrow marker for relationships */}
          <marker
            id="ea-arrow"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
          <marker
            id="ea-arrow-selected"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#1F1E1B" />
          </marker>
        </defs>

        {/* Transform group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Background (for click handling) */}
          <rect
            className="ea-canvas__background"
            x={-10000}
            y={-10000}
            width={20000}
            height={20000}
            fill="transparent"
          />

          {/* Relationships (rendered below elements) */}
          {relationships.map((rel) => (
            <EARelationshipLine
              key={rel.id}
              relationship={rel}
              sourceElement={elementsMap.get(rel.sourceId)}
              targetElement={elementsMap.get(rel.targetId)}
              isSelected={selectedIds.includes(rel.id)}
              onMouseDown={(e) => {
                e.stopPropagation();
                selectElement(rel.id, e.shiftKey || e.metaKey);
              }}
              onDoubleClick={() => onRelationshipDoubleClick?.(rel)}
            />
          ))}

          {/* Elements */}
          {elements.map((element) => (
            <EAElementNode
              key={element.id}
              element={element}
              zoom={zoom}
              isSelected={selectedIds.includes(element.id)}
              isDragging={draggedElementId === element.id}
              onMouseDown={(e) => handleElementMouseDown(e, element)}
              onDoubleClick={() => onElementDoubleClick?.(element)}
            />
          ))}

          {/* Marquee selection */}
          {marquee && (
            <rect
              x={Math.min(marquee.startX, marquee.currentX)}
              y={Math.min(marquee.startY, marquee.currentY)}
              width={Math.abs(marquee.currentX - marquee.startX)}
              height={Math.abs(marquee.currentY - marquee.startY)}
              fill="rgba(71, 69, 63, 0.1)"
              stroke="#47453F"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          )}
        </g>
      </svg>

      {/* Zoom controls */}
      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomFit={handleZoomFit}
        onZoomReset={handleZoomReset}
      />

      {/* Status bar */}
      <div className="ea-canvas__status">
        <span>{elements.length} elements</span>
        <span>{relationships.length} relationships</span>
        {selectedIds.length > 0 && <span>{selectedIds.length} selected</span>}
      </div>
    </div>
  );
});

export default EACanvas;

// ============ STYLES ============

export const EACanvasStyles = `
/* EA Canvas Styles */

.ea-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--color-canvas, #FDFCFA);
  overflow: hidden;
  outline: none;
  user-select: none;
}

.ea-canvas:focus {
  outline: none;
}

.ea-canvas__svg {
  position: absolute;
  top: 0;
  left: 0;
}

.ea-canvas__grid {
  pointer-events: none;
}

/* Element nodes */
.ea-element {
  cursor: grab;
  transition: filter 100ms ease-out;
}

.ea-element:hover {
  filter: drop-shadow(0 2px 4px rgba(31, 30, 27, 0.15));
}

.ea-element--selected {
  filter: drop-shadow(0 2px 8px rgba(31, 30, 27, 0.2));
}

.ea-element--dragging {
  cursor: grabbing;
  opacity: 0.9;
}

.ea-element__handle {
  cursor: nwse-resize;
}

/* Relationships */
.ea-relationship {
  cursor: pointer;
}

.ea-relationship:hover path:first-child {
  stroke: #47453F;
}

/* Zoom controls */
.ea-canvas__zoom-controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: var(--color-panel, #F0EFEC);
  border: 1px solid var(--color-border, #E2E0DB);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(31, 30, 27, 0.1);
}

.ea-canvas__zoom-controls button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-text-primary, #1F1E1B);
  cursor: pointer;
  transition: background 100ms ease-out;
}

.ea-canvas__zoom-controls button:hover {
  background: var(--color-canvas, #FDFCFA);
}

.ea-canvas__zoom-level {
  min-width: 48px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary, #5C5A54);
}

.ea-canvas__zoom-reset {
  font-size: 11px !important;
  font-weight: 500;
}

/* Status bar */
.ea-canvas__status {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  gap: 16px;
  padding: 6px 12px;
  background: var(--color-panel, #F0EFEC);
  border: 1px solid var(--color-border, #E2E0DB);
  border-radius: 4px;
  font-size: 11px;
  color: var(--color-text-muted, #9C9A94);
}

.ea-canvas__status span::before {
  content: '•';
  margin-right: 6px;
  opacity: 0.5;
}

.ea-canvas__status span:first-child::before {
  display: none;
}
`;
