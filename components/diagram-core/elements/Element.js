// components/diagram-core/elements/Element.js
// Element wrapper component with shape rendering

import { useState, useRef, useCallback, useEffect } from 'react';
import { snapToGrid as snapValueToGrid } from '../utils/helpers';
import { calculateAlignmentGuides } from '../utils/alignmentGuides';

// Calculate the closest point on element edge to a given position
function calculateEdgeSnapPoint(mousePos, elementBounds, threshold = 30) {
  const { x, y, width, height } = elementBounds;
  const edges = [
    { edge: 'top', x1: x, y1: y, x2: x + width, y2: y },
    { edge: 'right', x1: x + width, y1: y, x2: x + width, y2: y + height },
    { edge: 'bottom', x1: x, y1: y + height, x2: x + width, y2: y + height },
    { edge: 'left', x1: x, y1: y, x2: x, y2: y + height },
  ];

  let closestPoint = null;
  let minDistance = Infinity;

  for (const { edge, x1, y1, x2, y2 } of edges) {
    // Find closest point on this edge segment
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) continue;

    // Project mouse position onto line segment
    const t = Math.max(0, Math.min(1,
      ((mousePos.x - x1) * dx + (mousePos.y - y1) * dy) / (length * length)
    ));

    const snapX = x1 + t * dx;
    const snapY = y1 + t * dy;

    const distance = Math.sqrt(
      Math.pow(mousePos.x - snapX, 2) + Math.pow(mousePos.y - snapY, 2)
    );

    if (distance < minDistance && distance <= threshold) {
      minDistance = distance;
      closestPoint = {
        edge,
        position: { x: snapX, y: snapY },
        offset: t, // 0-1 position along edge
        distance,
      };
    }
  }

  return closestPoint;
}

export default function Element({
  element,
  stencil,
  selected,
  editable,
  gridConfig,
  snapToGrid = true, // Whether to snap to grid (controlled by parent)
  zoom = 1,
  connecting,
  connectMousePos, // Mouse position during connection mode (canvas coordinates)
  otherElements = [], // Other elements for alignment guide calculation
  selectedIds = [], // IDs of all selected elements (for multi-drag)
  onClick,
  onDrag,
  onResize,
  onStartConnection,
  onEdgeSnap, // Callback when edge snap point changes
  onAlignmentGuides, // Callback when alignment guides change during drag
  onAddConnected,
  onUpdate,
  onDelete,
}) {
  const { id, x, y, width, height, label, color, data } = element;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [magneticSnapPoint, setMagneticSnapPoint] = useState(null);
  const dragStart = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0, elementX: 0, elementY: 0, direction: '' });

  // Calculate magnetic snap point when in connection target mode
  const isConnectTarget = connecting && connecting.fromId !== id;

  useEffect(() => {
    if (isConnectTarget && connectMousePos) {
      const snapPoint = calculateEdgeSnapPoint(
        connectMousePos,
        { x, y, width, height },
        40 // Threshold in canvas pixels
      );
      setMagneticSnapPoint(snapPoint);

      // Notify parent of snap point for connection preview
      if (onEdgeSnap) {
        onEdgeSnap(snapPoint);
      }
    } else {
      setMagneticSnapPoint(null);
      if (onEdgeSnap) {
        onEdgeSnap(null);
      }
    }
  }, [isConnectTarget, connectMousePos, x, y, width, height, onEdgeSnap]);

  // Get shape from stencil or element
  const shape = stencil?.shape || element.shape || 'rect';
  const elementColor = color || stencil?.color || '#3b82f6';
  const borderRadius = stencil?.borderRadius || element.borderRadius || 8;

  // Style properties with fallbacks: element -> stencil -> defaults
  const fillStyle = element.fillStyle || stencil?.fillStyle || 'solid'; // 'solid', 'none', 'filled'
  const borderStyle = element.borderStyle || stencil?.borderStyle || stencil?.strokeStyle || 'solid'; // 'solid', 'dashed', 'dotted', 'none'
  const borderWidth = element.borderWidth ?? stencil?.borderWidth ?? stencil?.strokeWidth ?? 2;
  const borderColor = element.borderColor || stencil?.borderColor || elementColor;

  // === DRAG HANDLERS ===

  const handleMouseDown = useCallback((e) => {
    if (!editable || e.button !== 0) return;
    if (isEditing) return;

    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: x,
      elementY: y,
      lastX: x,
      lastY: y,
    };

    // Check if this is part of a multi-selection
    const isMultiDrag = selected && selectedIds.length > 1;

    const handleMouseMove = (e) => {
      // Account for zoom level when calculating delta
      const totalDx = (e.clientX - dragStart.current.x) / zoom;
      const totalDy = (e.clientY - dragStart.current.y) / zoom;

      let newX = dragStart.current.elementX + totalDx;
      let newY = dragStart.current.elementY + totalDy;

      // For multi-drag, skip alignment guides (too complex)
      if (!isMultiDrag && otherElements.length > 0 && onAlignmentGuides) {
        const draggedBounds = { x: newX, y: newY, width, height };
        // Exclude all selected elements from alignment calculation
        const nonSelectedElements = otherElements.filter(el => !selectedIds.includes(el.id));
        const { guides, snapX, snapY } = calculateAlignmentGuides(
          draggedBounds,
          nonSelectedElements,
          8 // threshold
        );

        // Apply alignment snapping (takes priority over grid)
        if (snapX !== null) newX = snapX;
        if (snapY !== null) newY = snapY;

        // Report guides to parent for rendering
        onAlignmentGuides(guides);
      }

      // Grid snapping (only for single element drag)
      if (!isMultiDrag && snapToGrid) {
        const snapThreshold = gridConfig?.snapThreshold || 10;
        const gridSize = gridConfig?.size || 20;

        // Only grid snap if not alignment snapped
        const nonSelectedElements = otherElements.filter(el => !selectedIds.includes(el.id));
        const alignX = nonSelectedElements.length > 0 && calculateAlignmentGuides(
          { x: newX, y: newY, width, height },
          nonSelectedElements,
          8
        ).snapX !== null;

        const alignY = nonSelectedElements.length > 0 && calculateAlignmentGuides(
          { x: newX, y: newY, width, height },
          nonSelectedElements,
          8
        ).snapY !== null;

        if (!alignX) newX = snapValueToGrid(newX, gridSize, snapThreshold);
        if (!alignY) newY = snapValueToGrid(newY, gridSize, snapThreshold);
      }

      // For multi-drag, pass incremental delta values so parent can move all selected elements
      if (isMultiDrag) {
        // Calculate incremental delta since last frame
        const incrementalDx = newX - dragStart.current.lastX;
        const incrementalDy = newY - dragStart.current.lastY;
        dragStart.current.lastX = newX;
        dragStart.current.lastY = newY;

        onDrag(Math.max(0, newX), Math.max(0, newY), incrementalDx, incrementalDy);
      } else {
        onDrag(Math.max(0, newX), Math.max(0, newY));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Clear alignment guides
      if (onAlignmentGuides) {
        onAlignmentGuides({ horizontal: [], vertical: [] });
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [editable, isEditing, selected, selectedIds, x, y, width, height, id, zoom, gridConfig, snapToGrid, otherElements, onDrag, onAlignmentGuides]);

  // === RESIZE HANDLERS ===

  const handleResizeStart = useCallback((e, direction) => {
    if (!editable || !onResize) return;
    e.stopPropagation();
    e.preventDefault();

    setIsResizing(true);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width,
      height,
      elementX: x,
      elementY: y,
      direction,
    };

    const handleMouseMove = (e) => {
      const { x: startX, y: startY, width: startWidth, height: startHeight, elementX, elementY, direction } = resizeStart.current;
      // Account for zoom level
      const dx = (e.clientX - startX) / zoom;
      const dy = (e.clientY - startY) / zoom;

      const minWidth = 60;
      const minHeight = 40;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = elementX;
      let newY = elementY;

      // Handle horizontal resizing
      if (direction.includes('e')) {
        newWidth = Math.max(minWidth, startWidth + dx);
      }
      if (direction.includes('w')) {
        const widthDelta = dx;
        const potentialWidth = startWidth - widthDelta;
        if (potentialWidth >= minWidth) {
          newWidth = potentialWidth;
          newX = elementX + widthDelta;
        } else {
          newWidth = minWidth;
          newX = elementX + startWidth - minWidth;
        }
      }

      // Handle vertical resizing
      if (direction.includes('s')) {
        newHeight = Math.max(minHeight, startHeight + dy);
      }
      if (direction.includes('n')) {
        const heightDelta = dy;
        const potentialHeight = startHeight - heightDelta;
        if (potentialHeight >= minHeight) {
          newHeight = potentialHeight;
          newY = elementY + heightDelta;
        } else {
          newHeight = minHeight;
          newY = elementY + startHeight - minHeight;
        }
      }

      // Grid snapping
      if (snapToGrid) {
        const gridSize = gridConfig?.size || 20;
        newWidth = Math.round(newWidth / gridSize) * gridSize;
        newHeight = Math.round(newHeight / gridSize) * gridSize;
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      onResize(Math.max(0, newX), Math.max(0, newY), newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [editable, onResize, x, y, width, height, zoom, gridConfig, snapToGrid]);

  // === LABEL EDITING ===

  const handleDoubleClick = useCallback((e) => {
    if (!editable) return;
    e.stopPropagation();
    setIsEditing(true);
  }, [editable]);

  const handleLabelChange = useCallback((e) => {
    onUpdate({ label: e.target.value });
  }, [onUpdate]);

  const handleLabelBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleLabelKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, []);

  // === SHAPE RENDERING ===

  const renderShape = () => {
    // Determine fill based on fillStyle
    let fill;
    switch (fillStyle) {
      case 'none':
      case 'transparent':
        fill = 'none';
        break;
      case 'filled':
        fill = elementColor;
        break;
      case 'solid':
      default:
        fill = 'white';
        break;
    }

    // Determine stroke based on borderStyle
    const hasStroke = borderStyle !== 'none';
    const strokeDasharray = borderStyle === 'dashed' ? '8 4' : borderStyle === 'dotted' ? '3 3' : undefined;

    const shapeProps = {
      fill,
      stroke: hasStroke ? borderColor : 'none',
      strokeWidth: hasStroke ? borderWidth : 0,
      strokeDasharray,
    };

    switch (shape) {
      case 'circle':
        // Use ellipse to support both circle and oval shapes based on dimensions
        return (
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            <ellipse
              cx={width / 2}
              cy={height / 2}
              rx={width / 2 - 2}
              ry={height / 2 - 2}
              {...shapeProps}
            />
          </svg>
        );

      case 'diamond':
        const cx = width / 2;
        const cy = height / 2;
        return (
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            <polygon
              points={`${cx},4 ${width - 4},${cy} ${cx},${height - 4} 4,${cy}`}
              {...shapeProps}
            />
          </svg>
        );

      case 'ellipse':
        return (
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            <ellipse
              cx={width / 2}
              cy={height / 2}
              rx={width / 2 - 4}
              ry={height / 2 - 4}
              {...shapeProps}
            />
          </svg>
        );

      case 'hexagon':
        const hw = width / 2;
        const hh = height / 2;
        const inset = width * 0.25;
        return (
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            <polygon
              points={`${inset},4 ${width - inset},4 ${width - 4},${hh} ${width - inset},${height - 4} ${inset},${height - 4} 4,${hh}`}
              {...shapeProps}
            />
          </svg>
        );

      case 'cloud':
        return (
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            <ellipse
              cx={width * 0.3}
              cy={height * 0.6}
              rx={width * 0.25}
              ry={height * 0.35}
              {...shapeProps}
            />
            <ellipse
              cx={width * 0.5}
              cy={height * 0.4}
              rx={width * 0.3}
              ry={height * 0.35}
              {...shapeProps}
            />
            <ellipse
              cx={width * 0.7}
              cy={height * 0.6}
              rx={width * 0.25}
              ry={height * 0.35}
              {...shapeProps}
            />
          </svg>
        );

      case 'flow':
        // Flow shape (like a valve)
        return (
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            <polygon
              points={`0,${height / 2} ${width * 0.3},0 ${width * 0.7},0 ${width},${height / 2} ${width * 0.7},${height} ${width * 0.3},${height}`}
              {...shapeProps}
            />
          </svg>
        );

      case 'sticky':
        // Sticky notes always use the element color as fill
        return (
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            <rect
              x="2"
              y="2"
              width={width - 4}
              height={height - 4}
              rx="2"
              fill={fillStyle === 'none' ? 'none' : elementColor}
              opacity="0.9"
              stroke={hasStroke ? borderColor : 'none'}
              strokeWidth={hasStroke ? borderWidth : 0}
              strokeDasharray={strokeDasharray}
            />
            {/* Fold corner */}
            {fillStyle !== 'none' && (
              <polygon
                points={`${width - 12},2 ${width - 2},2 ${width - 2},12`}
                fill="rgba(0,0,0,0.1)"
              />
            )}
          </svg>
        );

      case 'rounded-rect':
        return (
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            <rect
              x="2"
              y="2"
              width={width - 4}
              height={height - 4}
              rx={borderRadius}
              {...shapeProps}
            />
          </svg>
        );

      case 'text':
        return null; // Text-only, no shape

      case 'uml-class':
        // UML Class with compartments
        const stereotype = stencil?.stereotype || '';
        const hasAttributes = element.data?.attributes;
        const hasMethods = element.data?.methods;
        const headerHeight = stereotype ? 45 : 30;
        const compartmentY1 = headerHeight;
        const compartmentY2 = hasAttributes ? headerHeight + Math.max(30, height * 0.35) : headerHeight;

        return (
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Main rectangle */}
            <rect
              x="2"
              y="2"
              width={width - 4}
              height={height - 4}
              rx="0"
              {...shapeProps}
            />
            {/* Compartment lines */}
            {(hasAttributes || hasMethods) && (
              <line x1="2" y1={compartmentY1} x2={width - 2} y2={compartmentY1} stroke={borderColor} strokeWidth={hasStroke ? 1 : 0} />
            )}
            {hasMethods && (
              <line x1="2" y1={compartmentY2} x2={width - 2} y2={compartmentY2} stroke={borderColor} strokeWidth={hasStroke ? 1 : 0} />
            )}
          </svg>
        );

      case 'uml-package':
        // UML Package with tab
        const tabWidth = Math.min(80, width * 0.4);
        const tabHeight = 20;
        return (
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Tab */}
            <rect
              x="2"
              y="2"
              width={tabWidth}
              height={tabHeight}
              rx="0"
              {...shapeProps}
            />
            {/* Main body */}
            <rect
              x="2"
              y={tabHeight + 2}
              width={width - 4}
              height={height - tabHeight - 4}
              rx="0"
              {...shapeProps}
            />
          </svg>
        );

      case 'uml-component':
        // UML Component with interface connectors
        const connSize = 8;
        return (
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Main rectangle */}
            <rect
              x="10"
              y="2"
              width={width - 14}
              height={height - 4}
              rx="0"
              {...shapeProps}
            />
            {/* Left interface rectangles */}
            <rect
              x="2"
              y={height * 0.25 - connSize / 2}
              width={connSize}
              height={connSize}
              {...shapeProps}
            />
            <rect
              x="2"
              y={height * 0.65 - connSize / 2}
              width={connSize}
              height={connSize}
              {...shapeProps}
            />
          </svg>
        );

      case 'uml-actor':
        // UML Actor (stick figure)
        const headRadius = Math.min(width, height) * 0.15;
        const bodyTop = headRadius * 2 + 4;
        const bodyMid = height * 0.5;
        const armY = bodyTop + (bodyMid - bodyTop) * 0.3;
        const legBottom = height - 4;
        return (
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Head */}
            <circle
              cx={width / 2}
              cy={headRadius + 4}
              r={headRadius}
              {...shapeProps}
            />
            {/* Body */}
            <line
              x1={width / 2}
              y1={bodyTop}
              x2={width / 2}
              y2={bodyMid}
              stroke={hasStroke ? borderColor : 'none'}
              strokeWidth={borderWidth}
            />
            {/* Arms */}
            <line
              x1={4}
              y1={armY}
              x2={width - 4}
              y2={armY}
              stroke={hasStroke ? borderColor : 'none'}
              strokeWidth={borderWidth}
            />
            {/* Left leg */}
            <line
              x1={width / 2}
              y1={bodyMid}
              x2={8}
              y2={legBottom}
              stroke={hasStroke ? borderColor : 'none'}
              strokeWidth={borderWidth}
            />
            {/* Right leg */}
            <line
              x1={width / 2}
              y1={bodyMid}
              x2={width - 8}
              y2={legBottom}
              stroke={hasStroke ? borderColor : 'none'}
              strokeWidth={borderWidth}
            />
          </svg>
        );

      case 'uml-note':
        // UML Note with folded corner
        const foldSize = 12;
        return (
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            <path
              d={`M 2 2 L ${width - foldSize - 2} 2 L ${width - 2} ${foldSize + 2} L ${width - 2} ${height - 2} L 2 ${height - 2} Z`}
              {...shapeProps}
            />
            {/* Fold */}
            <path
              d={`M ${width - foldSize - 2} 2 L ${width - foldSize - 2} ${foldSize + 2} L ${width - 2} ${foldSize + 2}`}
              fill="none"
              stroke={hasStroke ? borderColor : 'none'}
              strokeWidth={borderWidth}
            />
          </svg>
        );

      case 'rect':
      default:
        return (
          <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            <rect
              x="2"
              y="2"
              width={width - 4}
              height={height - 4}
              rx={4}
              {...shapeProps}
            />
          </svg>
        );
    }
  };

  // === CONNECTION PORTS ===

  const ports = stencil?.ports || ['top', 'right', 'bottom', 'left'];

  const renderPorts = () => {
    if (!editable) return null;
    if (!selected && !isHovered) return null;

    return ports.map(port => {
      let portX, portY;
      switch (port) {
        case 'top':
          portX = width / 2;
          portY = 0;
          break;
        case 'right':
          portX = width;
          portY = height / 2;
          break;
        case 'bottom':
          portX = width / 2;
          portY = height;
          break;
        case 'left':
          portX = 0;
          portY = height / 2;
          break;
        default:
          return null;
      }

      return (
        <div
          key={port}
          className={`dc-element-port dc-port-${port}`}
          style={{
            left: portX - 6,
            top: portY - 6,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onStartConnection(port);
          }}
        />
      );
    });
  };

  // === RESIZE HANDLES ===

  const renderResizeHandles = () => {
    if (!selected || !editable || !onResize) return null;

    const handles = [
      { dir: 'n', style: { top: -4, left: '50%', marginLeft: -4, width: 8, height: 8, cursor: 'ns-resize' } },
      { dir: 's', style: { bottom: -4, left: '50%', marginLeft: -4, width: 8, height: 8, cursor: 'ns-resize' } },
      { dir: 'e', style: { right: -4, top: '50%', marginTop: -4, width: 8, height: 8, cursor: 'ew-resize' } },
      { dir: 'w', style: { left: -4, top: '50%', marginTop: -4, width: 8, height: 8, cursor: 'ew-resize' } },
      { dir: 'nw', style: { top: -5, left: -5, width: 10, height: 10, cursor: 'nwse-resize' } },
      { dir: 'ne', style: { top: -5, right: -5, width: 10, height: 10, cursor: 'nesw-resize' } },
      { dir: 'sw', style: { bottom: -5, left: -5, width: 10, height: 10, cursor: 'nesw-resize' } },
      { dir: 'se', style: { bottom: -5, right: -5, width: 10, height: 10, cursor: 'nwse-resize' } },
    ];

    return handles.map(({ dir, style }) => (
      <div
        key={dir}
        className={`dc-resize-handle dc-resize-${dir}`}
        style={{
          position: 'absolute',
          background: '#fff',
          border: `2px solid ${elementColor}`,
          borderRadius: 2,
          zIndex: 20,
          ...style,
        }}
        onMouseDown={(e) => handleResizeStart(e, dir)}
      />
    ));
  };

  // === ADD CONNECTED BUTTONS ===

  const renderAddButtons = () => {
    if (!editable || !onAddConnected) return null;
    if (!selected && !isHovered) return null;

    const buttons = [
      { dir: 'right', style: { right: -28, top: '50%', marginTop: -10 } },
      { dir: 'bottom', style: { bottom: -28, left: '50%', marginLeft: -10 } },
    ];

    return buttons.map(({ dir, style }) => (
      <button
        key={dir}
        className={`dc-add-button dc-add-${dir}`}
        style={{
          position: 'absolute',
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: `2px solid ${elementColor}`,
          background: '#fff',
          color: elementColor,
          fontSize: 14,
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 15,
          ...style,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onAddConnected(dir);
        }}
        title={`Add connected element (${dir})`}
      >
        +
      </button>
    ));
  };

  // === MAGNETIC SNAP INDICATOR ===

  const renderMagneticSnapIndicator = () => {
    if (!magneticSnapPoint) return null;

    // Convert canvas position to element-relative position
    const snapX = magneticSnapPoint.position.x - x;
    const snapY = magneticSnapPoint.position.y - y;

    return (
      <div
        className="dc-magnetic-snap-indicator"
        style={{
          position: 'absolute',
          left: snapX - 8,
          top: snapY - 8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#3b82f6',
          boxShadow: '0 0 12px 4px rgba(59, 130, 246, 0.6)',
          border: '2px solid white',
          pointerEvents: 'none',
          zIndex: 100,
          animation: 'dc-magnetic-pulse 1s ease-in-out infinite',
        }}
      />
    );
  };

  // === RENDER ===

  const isSticky = shape === 'sticky';
  const textColor = isSticky ? '#1f2937' : '#1f2937';

  // Connection mode classes
  const isConnectingSource = connecting?.fromId === id;
  const hasActiveSnapPoint = magneticSnapPoint !== null;

  return (
    <div
      className={`dc-element ${selected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''} ${isHovered ? 'hovered' : ''} ${isConnectingSource ? 'connecting-source' : ''} ${isConnectTarget ? 'connect-target' : ''} ${hasActiveSnapPoint ? 'has-snap-point' : ''}`}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        cursor: editable ? (isResizing ? 'default' : isDragging ? 'grabbing' : 'grab') : 'default',
        borderRadius: shape === 'circle' ? '50%' : borderRadius,
      }}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Shape */}
      {renderShape()}

      {/* Label */}
      <div
        className="dc-element-label"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center',
          padding: '8px',
          color: element.fontColor || stencil?.fontColor || textColor,
          fontSize: element.fontSize || stencil?.fontSize || 13,
          fontWeight: element.fontWeight || stencil?.fontWeight || 500,
          fontStyle: element.fontStyle || stencil?.fontStyle || 'normal',
          fontFamily: element.fontFamily || stencil?.fontFamily || 'inherit',
          textAlign: element.textAlign || 'center',
          textDecoration: element.textDecoration || 'none',
          overflow: 'hidden',
          pointerEvents: isEditing ? 'auto' : 'none',
        }}
      >
        {isEditing ? (
          <input
            type="text"
            value={label || ''}
            onChange={handleLabelChange}
            onBlur={handleLabelBlur}
            onKeyDown={handleLabelKeyDown}
            autoFocus
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              textAlign: 'center',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              color: 'inherit',
              outline: 'none',
            }}
          />
        ) : (
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}>
            {label}
          </span>
        )}
      </div>

      {/* Connection ports */}
      {renderPorts()}

      {/* Magnetic snap indicator */}
      {renderMagneticSnapIndicator()}

      {/* Resize handles */}
      {renderResizeHandles()}

      {/* Add connected buttons */}
      {renderAddButtons()}

      {/* Stencil icon (if any) */}
      {stencil?.icon && !isSticky && selected && (
        <div
          className="dc-element-icon"
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            fontSize: 14,
            color: elementColor,
            opacity: 0.7,
          }}
        >
          {typeof stencil.icon === 'string' ? stencil.icon : <stencil.icon />}
        </div>
      )}
    </div>
  );
}
