// components/diagram-core/connections/Connection.js
// Connection line between elements

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { getPortPosition, offsetPortPosition, generateConnectionPath, generateRoutedConnectionPath, findNearestPort, getBezierControlPoints, calculateOrthogonalWaypoints, generatePathFromWaypoints } from '../utils/helpers';

// Calculate the closest point on an element's edge to a given position
function calculateEdgePosition(element, mousePos) {
  const { x, y, width, height } = element;
  const edges = [
    { edge: 'top', x1: x, y1: y, x2: x + width, y2: y },
    { edge: 'right', x1: x + width, y1: y, x2: x + width, y2: y + height },
    { edge: 'bottom', x1: x, y1: y + height, x2: x + width, y2: y + height },
    { edge: 'left', x1: x, y1: y, x2: x, y2: y + height },
  ];

  let closestPoint = null;
  let minDistance = Infinity;

  for (const { edge, x1, y1, x2, y2 } of edges) {
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

    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = { edge, offset: t };
    }
  }

  return closestPoint;
}

export default function Connection({
  connection,
  elements,
  config,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  zoom = 1,
  arrowsOnly = false, // When true, only render arrowheads (for overlay layer)
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [draggingEndpoint, setDraggingEndpoint] = useState(null); // 'from' or 'to'
  const inputRef = useRef(null);
  const dragStartRef = useRef(null);
  const { id, from, to, type, color, strokeWidth, strokeStyle, label } = connection;

  // Find source and target elements
  const fromElement = elements.find(el => el.id === from);
  const toElement = elements.find(el => el.id === to);

  if (!fromElement || !toElement) return null;

  // Get connection type config
  const typeConfig = config.types?.find(t => t.id === type) || {};
  const lineColor = color || typeConfig.color || '#374151';
  const lineWidth = strokeWidth || typeConfig.strokeWidth || 2;
  const lineStyle = strokeStyle || typeConfig.strokeStyle || 'solid';

  // Endpoint markers - connection overrides type config
  const markerEnd = connection.markerEnd ?? typeConfig.arrowEnd ?? 'arrow';
  const markerStart = connection.markerStart ?? typeConfig.arrowStart ?? 'none';

  // Cardinality labels at endpoints
  const cardinalityStart = connection.cardinalityStart || '';
  const cardinalityEnd = connection.cardinalityEnd || '';

  const polarity = typeConfig.polarity;
  const animated = typeConfig.animated;
  const curvature = connection.curvature ?? typeConfig.curvature ?? 0.3;
  const connectionStyle = connection.style || typeConfig.style || config.style || 'bezier';
  // Curve direction: 1 = curve left/up, -1 = curve right/down, 0 = auto
  const curveDirection = connection.curveDirection ?? typeConfig.curveDirection ?? 0;
  // Custom control point offset (for manual curve adjustment)
  const controlPointOffset = connection.controlPointOffset || null;
  // Custom waypoints for orthogonal connections (user can drag to reposition)
  const customWaypoints = connection.waypoints || null;

  // Calculate connection points
  const fromCenter = {
    x: fromElement.x + fromElement.width / 2,
    y: fromElement.y + fromElement.height / 2,
  };
  const toCenter = {
    x: toElement.x + toElement.width / 2,
    y: toElement.y + toElement.height / 2,
  };

  // Find best ports
  const fromPort = connection.fromPort || findNearestPort(fromElement, toCenter);
  const toPort = connection.toPort || findNearestPort(toElement, fromCenter);

  // Get port positions (exact edge position)
  const fromPosExact = getPortPosition(fromElement, fromPort);
  const toPosExact = getPortPosition(toElement, toPort);

  // Use exact positions for path - markers will be adjusted via refX
  const fromPos = fromPosExact;
  const toPos = toPosExact;

  // Check if auto-routing is enabled (can be set on connection or config)
  const autoRoute = connection.autoRoute ?? config.autoRoute ?? false;

  // Calculate control points (for curve manipulation and arrow angle calculation)
  const { controlPoint, controlPoint2 } = useMemo(() => {
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;

    // If custom control point offset is set, use it
    if (controlPointOffset) {
      const cp = {
        x: midX + controlPointOffset.x,
        y: midY + controlPointOffset.y,
      };
      return { controlPoint: cp, controlPoint2: cp };
    }

    // Otherwise calculate based on style
    if (connectionStyle === 'arc' || connectionStyle === 'bezier') {
      const controlPoints = getBezierControlPoints(fromPos, toPos, connectionStyle, curvature, curveDirection);
      return {
        controlPoint: controlPoints.cp1,
        controlPoint2: controlPoints.cp2 || controlPoints.cp1, // cp2 for bezier end tangent
      };
    }

    // For straight/orthogonal, control point is at midpoint
    const mid = { x: midX, y: midY };
    return { controlPoint: mid, controlPoint2: mid };
  }, [fromPos, toPos, connectionStyle, curvature, curveDirection, controlPointOffset]);

  // Extract edge info from ports
  const fromEdge = fromPort?.edge || (typeof fromPort === 'string' ? fromPort : null);
  const toEdge = toPort?.edge || (typeof toPort === 'string' ? toPort : null);

  // Calculate waypoints for orthogonal connections (used for path and draggable handles)
  const waypoints = useMemo(() => {
    if (connectionStyle !== 'orthogonal') return null;
    return calculateOrthogonalWaypoints(fromPos, toPos, fromEdge, toEdge, customWaypoints);
  }, [connectionStyle, fromPos, toPos, fromEdge, toEdge, customWaypoints]);

  // Generate path (with optional auto-routing around obstacles)
  const path = useMemo(() => {
    if (autoRoute && elements && elements.length > 2) {
      // Use routed path to avoid other elements
      return generateRoutedConnectionPath(
        fromPos,
        toPos,
        elements,
        [from, to], // Exclude source and target elements from obstacle detection
        connectionStyle,
        curvature
      );
    }

    // If custom control point offset is set, generate custom path
    if (controlPointOffset && (connectionStyle === 'arc' || connectionStyle === 'bezier')) {
      const midX = (fromPos.x + toPos.x) / 2;
      const midY = (fromPos.y + toPos.y) / 2;
      const cpX = midX + controlPointOffset.x;
      const cpY = midY + controlPointOffset.y;

      if (connectionStyle === 'arc') {
        // Quadratic bezier with custom control point
        return `M ${fromPos.x} ${fromPos.y} Q ${cpX} ${cpY}, ${toPos.x} ${toPos.y}`;
      } else {
        // Cubic bezier - mirror control point for smooth curve
        return `M ${fromPos.x} ${fromPos.y} C ${cpX} ${cpY}, ${cpX} ${cpY}, ${toPos.x} ${toPos.y}`;
      }
    }

    // For orthogonal with waypoints, use waypoint-based path
    if (connectionStyle === 'orthogonal' && waypoints) {
      return generatePathFromWaypoints(waypoints);
    }

    // Default: use direct path with curve direction and edge info
    return generateConnectionPath(fromPos, toPos, connectionStyle, curvature, curveDirection, fromEdge, toEdge);
  }, [fromPos, toPos, elements, from, to, connectionStyle, curvature, autoRoute, curveDirection, controlPointOffset, fromEdge, toEdge, waypoints]);

  // Calculate midpoint for label (at the curve peak)
  const midpoint = useMemo(() => {
    if (connectionStyle === 'arc' || connectionStyle === 'bezier') {
      // The midpoint of a quadratic bezier at t=0.5
      const t = 0.5;
      return {
        x: (1 - t) * (1 - t) * fromPos.x + 2 * (1 - t) * t * controlPoint.x + t * t * toPos.x,
        y: (1 - t) * (1 - t) * fromPos.y + 2 * (1 - t) * t * controlPoint.y + t * t * toPos.y,
      };
    }
    return {
      x: (fromPos.x + toPos.x) / 2,
      y: (fromPos.y + toPos.y) / 2,
    };
  }, [fromPos, toPos, connectionStyle, controlPoint]);

  // Unique marker IDs for different marker types
  const markerIdPrefix = `marker-${id}`;

  // Helper to get marker ID
  const getMarkerId = (markerType, position) => {
    if (markerType === 'none') return null;
    return `${markerIdPrefix}-${markerType}-${position}`;
  };

  // Dash array based on style
  const strokeDasharray = lineStyle === 'dashed' ? '8 4' : lineStyle === 'dotted' ? '3 3' : undefined;

  // Handle double-click to edit label
  const handleLabelDoubleClick = (e) => {
    e.stopPropagation();
    if (config.editableLabels !== false) {
      setEditValue(label || polarity || typeConfig.labelDefault || '');
      setIsEditing(true);
    }
  };

  // Handle label edit complete
  const handleLabelBlur = () => {
    setIsEditing(false);
    if (onUpdate && editValue !== label) {
      onUpdate({ label: editValue });
    }
  };

  const handleLabelKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
      if (onUpdate && editValue !== label) {
        onUpdate({ label: editValue });
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle endpoint dragging
  const handleEndpointMouseDown = useCallback((endpoint, e) => {
    if (!onUpdate) return;
    e.stopPropagation();
    e.preventDefault();
    setDraggingEndpoint(endpoint);
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    const targetElement = endpoint === 'from' ? fromElement : toElement;

    const handleMouseMove = (moveEvent) => {
      // Calculate mouse position in canvas coordinates
      // We need to account for zoom and pan, but we receive the parent's coordinate system
      const rect = moveEvent.target.closest('.dc-canvas-content')?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = (moveEvent.clientX - rect.left) / zoom;
      const mouseY = (moveEvent.clientY - rect.top) / zoom;

      // Find the closest edge position on the target element
      const newPort = calculateEdgePosition(targetElement, { x: mouseX, y: mouseY });
      if (newPort) {
        const updateKey = endpoint === 'from' ? 'fromPort' : 'toPort';
        onUpdate({ [updateKey]: newPort });
      }
    };

    const handleMouseUp = () => {
      setDraggingEndpoint(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [onUpdate, fromElement, toElement, zoom]);

  // Handle double-click on endpoint to flip curve direction
  const handleEndpointDoubleClick = useCallback((e) => {
    e.stopPropagation();
    if (!onUpdate || connectionStyle !== 'arc') return;
    // Toggle curve direction: 0 -> 1 -> -1 -> 0
    const newDirection = curveDirection === 0 ? 1 : curveDirection === 1 ? -1 : 0;
    onUpdate({ curveDirection: newDirection });
  }, [onUpdate, connectionStyle, curveDirection]);

  // Handle control point dragging (for curve manipulation)
  const [draggingControlPoint, setDraggingControlPoint] = useState(false);

  const handleControlPointMouseDown = useCallback((e) => {
    if (!onUpdate) return;
    e.stopPropagation();
    e.preventDefault();
    setDraggingControlPoint(true);

    const handleMouseMove = (moveEvent) => {
      // Calculate mouse position in canvas coordinates
      const rect = moveEvent.target.closest('.dc-canvas-content')?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = (moveEvent.clientX - rect.left) / zoom;
      const mouseY = (moveEvent.clientY - rect.top) / zoom;

      // Calculate offset from midpoint
      const midX = (fromPos.x + toPos.x) / 2;
      const midY = (fromPos.y + toPos.y) / 2;

      const newOffset = {
        x: mouseX - midX,
        y: mouseY - midY,
      };

      onUpdate({ controlPointOffset: newOffset });
    };

    const handleMouseUp = () => {
      setDraggingControlPoint(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [onUpdate, fromPos, toPos, zoom]);

  // Handle double-click on control point to reset it
  const handleControlPointDoubleClick = useCallback((e) => {
    e.stopPropagation();
    if (!onUpdate) return;
    // Reset control point offset to auto
    onUpdate({ controlPointOffset: null });
  }, [onUpdate]);

  // Handle segment dragging for orthogonal connections
  // Segments are pairs of adjacent waypoints. Dragging moves both waypoints.
  // - Vertical segments (same X) → drag left/right (change X)
  // - Horizontal segments (same Y) → drag up/down (change Y)
  const [draggingSegment, setDraggingSegment] = useState(null);
  const segmentDragRef = useRef({ waypointsInserted: false, workingWaypoints: null });

  // Calculate draggable segments from waypoints
  // Waypoint structure: [from, stubFrom, mid1, ..., midN, stubTo, to]
  // All segments between stubFrom and stubTo are potentially draggable
  // - Segments 0-1 (from→stubFrom) and N-1 to N (stubTo→to) are NOT draggable
  // - All inner segments (1 to N-2) ARE draggable
  // When dragging stub-adjacent segments, new waypoints may be auto-created
  const draggableSegments = useMemo(() => {
    if (!waypoints || waypoints.length < 4) return [];

    const segments = [];
    // Make all segments between stubFrom and stubTo draggable
    // For [from(0), stubFrom(1), mid1(2), mid2(3), stubTo(4), to(5)]
    // Draggable: 1-2, 2-3, 3-4
    for (let i = 1; i < waypoints.length - 2; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const isVertical = Math.abs(p1.x - p2.x) < 1;
      const isHorizontal = Math.abs(p1.y - p2.y) < 1;

      // Only make truly horizontal or vertical segments draggable
      if (isVertical || isHorizontal) {
        // Determine if this segment is adjacent to a stub
        const isFirstInner = i === 1; // stubFrom -> first mid
        const isLastInner = i === waypoints.length - 3; // last mid -> stubTo

        segments.push({
          index: i,
          p1,
          p2,
          isVertical,
          isFirstInner,
          isLastInner,
          midX: (p1.x + p2.x) / 2,
          midY: (p1.y + p2.y) / 2,
        });
      }
    }
    return segments;
  }, [waypoints]);

  const handleSegmentMouseDown = useCallback((segmentIndex, isVertical, isFirstInner, isLastInner, e) => {
    if (!onUpdate || !waypoints) return;
    e.stopPropagation();
    e.preventDefault();
    setDraggingSegment({ index: segmentIndex, isVertical });

    // Initialize ref for tracking drag state
    segmentDragRef.current = {
      waypointsInserted: false,
      workingWaypoints: [...waypoints],
    };

    const handleMouseMove = (moveEvent) => {
      const rect = moveEvent.target.closest('.dc-canvas-content')?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = (moveEvent.clientX - rect.left) / zoom;
      const mouseY = (moveEvent.clientY - rect.top) / zoom;

      const { waypointsInserted, workingWaypoints } = segmentDragRef.current;
      let newWaypoints;

      if (!isFirstInner && !isLastInner) {
        // Pure middle segment - move both endpoints together
        // This maintains orthogonality as both points move in the same direction
        newWaypoints = workingWaypoints.map((wp, i) => {
          if (i === segmentIndex || i === segmentIndex + 1) {
            if (isVertical) {
              return { ...wp, x: mouseX };
            } else {
              return { ...wp, y: mouseY };
            }
          }
          return wp;
        });
      } else if (isFirstInner && isLastInner) {
        // Both first and last (minimal path with single middle segment)
        // Move both endpoints together
        newWaypoints = workingWaypoints.map((wp, i) => {
          if (i === segmentIndex || i === segmentIndex + 1) {
            if (isVertical) {
              return { ...wp, x: mouseX };
            } else {
              return { ...wp, y: mouseY };
            }
          }
          return wp;
        });
      } else if (isFirstInner) {
        // First inner segment (stubFrom -> mid1): stub is fixed
        // Insert intermediate waypoints to maintain orthogonality
        const stubPoint = workingWaypoints[segmentIndex]; // stubFrom
        const midPoint = workingWaypoints[segmentIndex + 1]; // mid1

        if (!waypointsInserted) {
          // On first drag, insert waypoints: stubFrom -> bend1 -> bend2 -> (rest of path)
          // bend1 continues from stub in same direction
          // bend2 turns to go toward the dragged position
          const bendY = (stubPoint.y + midPoint.y) / 2;
          const bend1 = isVertical
            ? { x: stubPoint.x, y: bendY }
            : { x: (stubPoint.x + midPoint.x) / 2, y: stubPoint.y };
          const bend2 = isVertical
            ? { x: mouseX, y: bendY }
            : { x: (stubPoint.x + midPoint.x) / 2, y: mouseY };
          const movedMid = isVertical
            ? { x: mouseX, y: midPoint.y }
            : { x: midPoint.x, y: mouseY };

          newWaypoints = [
            ...workingWaypoints.slice(0, segmentIndex + 1), // up to and including stubFrom
            bend1,
            bend2,
            movedMid,
            ...workingWaypoints.slice(segmentIndex + 2), // after mid1
          ];
          segmentDragRef.current.workingWaypoints = newWaypoints;
          segmentDragRef.current.waypointsInserted = true;
        } else {
          // Already inserted - just update the bend points
          // bend2 is at segmentIndex + 2
          // movedMid is at segmentIndex + 3
          newWaypoints = workingWaypoints.map((wp, i) => {
            if (i === segmentIndex + 2) {
              // bend2
              return isVertical ? { ...wp, x: mouseX } : { ...wp, y: mouseY };
            }
            if (i === segmentIndex + 3) {
              // movedMid
              return isVertical ? { ...wp, x: mouseX } : { ...wp, y: mouseY };
            }
            return wp;
          });
          segmentDragRef.current.workingWaypoints = newWaypoints;
        }
      } else if (isLastInner) {
        // Last inner segment (midN -> stubTo): stub is fixed
        const midPoint = workingWaypoints[segmentIndex]; // midN
        const stubPoint = workingWaypoints[segmentIndex + 1]; // stubTo

        if (!waypointsInserted) {
          const bendY = (midPoint.y + stubPoint.y) / 2;
          const movedMid = isVertical
            ? { x: mouseX, y: midPoint.y }
            : { x: midPoint.x, y: mouseY };
          const bend1 = isVertical
            ? { x: mouseX, y: bendY }
            : { x: (midPoint.x + stubPoint.x) / 2, y: mouseY };
          const bend2 = isVertical
            ? { x: stubPoint.x, y: bendY }
            : { x: (midPoint.x + stubPoint.x) / 2, y: stubPoint.y };

          newWaypoints = [
            ...workingWaypoints.slice(0, segmentIndex), // before midN
            movedMid,
            bend1,
            bend2,
            ...workingWaypoints.slice(segmentIndex + 1), // from stubTo onward
          ];
          segmentDragRef.current.workingWaypoints = newWaypoints;
          segmentDragRef.current.waypointsInserted = true;
        } else {
          // Already inserted - just update the points
          // movedMid is at segmentIndex
          // bend1 is at segmentIndex + 1
          newWaypoints = workingWaypoints.map((wp, i) => {
            if (i === segmentIndex) {
              // movedMid
              return isVertical ? { ...wp, x: mouseX } : { ...wp, y: mouseY };
            }
            if (i === segmentIndex + 1) {
              // bend1
              return isVertical ? { ...wp, x: mouseX } : { ...wp, y: mouseY };
            }
            return wp;
          });
          segmentDragRef.current.workingWaypoints = newWaypoints;
        }
      }

      // Store only the middle waypoints (excluding from and to which are element positions)
      const middleWaypoints = newWaypoints.slice(1, -1);
      onUpdate({ waypoints: middleWaypoints });
    };

    const handleMouseUp = () => {
      setDraggingSegment(null);
      segmentDragRef.current = { waypointsInserted: false, workingWaypoints: null };
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [onUpdate, waypoints, zoom]);

  // Handle double-click on segment to reset waypoints
  const handleSegmentDoubleClick = useCallback((e) => {
    e.stopPropagation();
    if (!onUpdate) return;
    onUpdate({ waypoints: null });
  }, [onUpdate]);

  // Render marker definition based on type
  const renderMarkerDef = (markerType, position) => {
    if (markerType === 'none') return null;

    const markerId = getMarkerId(markerType, position);
    const isStart = position === 'start';

    // Common marker props for better visibility
    const markerProps = {
      key: markerId,
      id: markerId,
      orient: 'auto-start-reverse',
      overflow: 'visible',
    };

    switch (markerType) {
      case 'arrow':
        return (
          <marker
            {...markerProps}
            viewBox="0 0 12 12"
            refX={isStart ? 0 : 10}
            refY="6"
            markerWidth="10"
            markerHeight="10"
          >
            <path d="M 0 0 L 12 6 L 0 12 z" fill={lineColor} />
          </marker>
        );

      case 'openArrow':
        return (
          <marker
            {...markerProps}
            viewBox="0 0 12 12"
            refX={isStart ? 0 : 10}
            refY="6"
            markerWidth="10"
            markerHeight="10"
          >
            <path d="M 0 1 L 10 6 L 0 11" fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        );

      case 'dot':
      case 'circle':
        return (
          <marker
            {...markerProps}
            viewBox="0 0 12 12"
            refX="6"
            refY="6"
            markerWidth="10"
            markerHeight="10"
          >
            <circle cx="6" cy="6" r="5" fill={lineColor} />
          </marker>
        );

      case 'hollowDot':
      case 'hollowCircle':
        return (
          <marker
            {...markerProps}
            viewBox="0 0 12 12"
            refX="6"
            refY="6"
            markerWidth="10"
            markerHeight="10"
          >
            <circle cx="6" cy="6" r="4.5" fill="white" stroke={lineColor} strokeWidth="2" />
          </marker>
        );

      case 'diamond':
        return (
          <marker
            {...markerProps}
            viewBox="0 0 16 16"
            refX="8"
            refY="8"
            markerWidth="12"
            markerHeight="12"
          >
            <path d="M 0 8 L 8 0 L 16 8 L 8 16 z" fill={lineColor} />
          </marker>
        );

      case 'hollowDiamond':
        return (
          <marker
            {...markerProps}
            viewBox="0 0 16 16"
            refX="8"
            refY="8"
            markerWidth="12"
            markerHeight="12"
          >
            <path d="M 1 8 L 8 1 L 15 8 L 8 15 z" fill="white" stroke={lineColor} strokeWidth="2" />
          </marker>
        );

      case 'triangle':
        return (
          <marker
            {...markerProps}
            viewBox="0 0 14 14"
            refX={isStart ? 0 : 12}
            refY="7"
            markerWidth="12"
            markerHeight="12"
          >
            <path d="M 0 0 L 14 7 L 0 14 z" fill="white" stroke={lineColor} strokeWidth="2" />
          </marker>
        );

      case 'bar':
        return (
          <marker
            {...markerProps}
            viewBox="0 0 6 14"
            refX="3"
            refY="7"
            markerWidth="6"
            markerHeight="14"
          >
            <line x1="3" y1="0" x2="3" y2="14" stroke={lineColor} strokeWidth="3" strokeLinecap="round" />
          </marker>
        );

      default:
        return null;
    }
  };

  // Calculate positions for cardinality labels (offset from endpoints)
  const getCardinalityPosition = (pos, centerPos, offset = 20) => {
    const dx = centerPos.x - pos.x;
    const dy = centerPos.y - pos.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return { x: pos.x, y: pos.y - offset };
    // Perpendicular offset for label
    const perpX = -dy / len * offset;
    const perpY = dx / len * offset;
    // Slight offset along the line
    const alongX = dx / len * 15;
    const alongY = dy / len * 15;
    return {
      x: pos.x + alongX + perpX,
      y: pos.y + alongY + perpY,
    };
  };

  // Use exact positions for cardinality labels (near element edge)
  const cardinalityStartPos = getCardinalityPosition(fromPosExact, toPosExact);
  const cardinalityEndPos = getCardinalityPosition(toPosExact, fromPosExact);

  // Calculate arrow angles based on path direction at endpoints
  const getArrowAngle = (from, to, isEnd) => {
    // For curved paths, use control points to determine tangent at endpoints
    if (connectionStyle === 'arc' || connectionStyle === 'bezier') {
      if (isEnd) {
        // Tangent at end: from second control point (cp2) to end point
        // For cubic bezier M from C cp1, cp2, to - end tangent is cp2 -> to
        return Math.atan2(to.y - controlPoint2.y, to.x - controlPoint2.x) * 180 / Math.PI;
      } else {
        // Tangent at start: from start to first control point (cp1)
        // For cubic bezier - start tangent is from -> cp1
        return Math.atan2(controlPoint.y - from.y, controlPoint.x - from.x) * 180 / Math.PI;
      }
    }

    // For orthogonal/straight connections, arrow should point INTO the element
    // based on which edge the connection attaches to
    if (connectionStyle === 'orthogonal' || connectionStyle === 'straight') {
      const port = isEnd ? toPort : fromPort;
      const element = isEnd ? toElement : fromElement;
      let edge = port?.edge || (typeof port === 'string' ? port : null);

      // If edge not explicitly set, determine from position
      if (!edge && element) {
        const pos = isEnd ? to : from;
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;

        // Determine which edge based on position relative to element
        const distLeft = Math.abs(pos.x - element.x);
        const distRight = Math.abs(pos.x - (element.x + element.width));
        const distTop = Math.abs(pos.y - element.y);
        const distBottom = Math.abs(pos.y - (element.y + element.height));

        const minDist = Math.min(distLeft, distRight, distTop, distBottom);
        if (minDist === distLeft) edge = 'left';
        else if (minDist === distRight) edge = 'right';
        else if (minDist === distTop) edge = 'top';
        else edge = 'bottom';
      }

      if (edge) {
        // Arrow points INTO the element (perpendicular to the edge)
        if (isEnd) {
          // End arrow points into target element
          switch (edge) {
            case 'left': return 0;      // Arrow points right (into left edge)
            case 'right': return 180;   // Arrow points left (into right edge)
            case 'top': return 90;      // Arrow points down (into top edge)
            case 'bottom': return -90;  // Arrow points up (into bottom edge)
          }
        } else {
          // Start arrow points out of source element (opposite direction)
          switch (edge) {
            case 'left': return 180;    // Arrow points left (out of left edge)
            case 'right': return 0;     // Arrow points right (out of right edge)
            case 'top': return -90;     // Arrow points up (out of top edge)
            case 'bottom': return 90;   // Arrow points down (out of bottom edge)
          }
        }
      }
    }

    // Fallback: For straight lines, use direct angle
    if (isEnd) {
      return Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
    } else {
      return Math.atan2(from.y - to.y, from.x - to.x) * 180 / Math.PI;
    }
  };

  const endArrowAngle = getArrowAngle(fromPos, toPos, true);
  const startArrowAngle = getArrowAngle(fromPos, toPos, false);

  // Arrow positions - at the element edge (arrowheads are in separate overlay layer on top of elements)
  const endArrowPos = toPos;
  const startArrowPos = fromPos;

  // Render custom arrowhead (as separate polygon, not SVG marker)
  const renderArrowhead = (pos, angle, markerType, isEnd) => {
    if (markerType === 'none') return null;

    const size = 12;
    const transform = `translate(${pos.x}, ${pos.y}) rotate(${angle})`;

    switch (markerType) {
      case 'arrow':
        // Filled arrow pointing right (will be rotated)
        // Position it so the tip is at the origin, body extends left
        return (
          <polygon
            points={`0,0 ${-size},-${size/2} ${-size},${size/2}`}
            fill={lineColor}
            transform={transform}
          />
        );
      case 'openArrow':
        return (
          <polyline
            points={`${-size},-${size/2} 0,0 ${-size},${size/2}`}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={transform}
          />
        );
      case 'triangle':
        return (
          <polygon
            points={`0,0 ${-size},-${size/2} ${-size},${size/2}`}
            fill="white"
            stroke={lineColor}
            strokeWidth="2"
            transform={transform}
          />
        );
      case 'dot':
      case 'circle':
        return (
          <circle cx={pos.x} cy={pos.y} r={size/2.5} fill={lineColor} />
        );
      case 'hollowDot':
      case 'hollowCircle':
        return (
          <circle cx={pos.x} cy={pos.y} r={size/2.5} fill="white" stroke={lineColor} strokeWidth="2" />
        );
      case 'diamond':
        const dSize = size * 0.7;
        return (
          <polygon
            points={`0,${-dSize} ${dSize},0 0,${dSize} ${-dSize},0`}
            fill={lineColor}
            transform={`translate(${pos.x}, ${pos.y})`}
          />
        );
      case 'hollowDiamond':
        const hdSize = size * 0.7;
        return (
          <polygon
            points={`0,${-hdSize} ${hdSize},0 0,${hdSize} ${-hdSize},0`}
            fill="white"
            stroke={lineColor}
            strokeWidth="2"
            transform={`translate(${pos.x}, ${pos.y})`}
          />
        );
      case 'bar':
        return (
          <line
            x1={pos.x}
            y1={pos.y - size/2}
            x2={pos.x}
            y2={pos.y + size/2}
            stroke={lineColor}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${angle}, ${pos.x}, ${pos.y})`}
          />
        );
      default:
        return null;
    }
  };

  // When arrowsOnly mode, just render the arrowheads for the overlay layer
  if (arrowsOnly) {
    return (
      <g className="dc-connection-arrows">
        {renderArrowhead(endArrowPos, endArrowAngle, markerEnd, true)}
        {renderArrowhead(startArrowPos, startArrowAngle, markerStart, false)}
      </g>
    );
  }

  return (
    <g
      className={`dc-connection ${selected ? 'selected' : ''} ${animated ? 'animated' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {/* Marker definitions - no longer used but kept for potential fallback */}
      <defs>
        {renderMarkerDef(markerStart, 'start')}
        {renderMarkerDef(markerEnd, 'end')}
      </defs>

      {/* Invisible wider path for easier selection */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        style={{ cursor: 'pointer' }}
      />

      {/* Visible connection line (arrowheads are in separate overlay layer) */}
      <path
        d={path}
        stroke={lineColor}
        strokeWidth={selected ? lineWidth + 1 : lineWidth}
        fill="none"
        strokeDasharray={strokeDasharray}
        className={animated ? 'dc-animated-path' : ''}
      />

      {/* Cardinality label at start */}
      {cardinalityStart && (
        <g transform={`translate(${cardinalityStartPos.x}, ${cardinalityStartPos.y})`}>
          <rect
            x="-16"
            y="-10"
            width="32"
            height="20"
            rx="3"
            fill="white"
            stroke={lineColor}
            strokeWidth="1"
            opacity="0.9"
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill={lineColor}
            style={{ pointerEvents: 'none' }}
          >
            {cardinalityStart}
          </text>
        </g>
      )}

      {/* Cardinality label at end */}
      {cardinalityEnd && (
        <g transform={`translate(${cardinalityEndPos.x}, ${cardinalityEndPos.y})`}>
          <rect
            x="-16"
            y="-10"
            width="32"
            height="20"
            rx="3"
            fill="white"
            stroke={lineColor}
            strokeWidth="1"
            opacity="0.9"
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill={lineColor}
            style={{ pointerEvents: 'none' }}
          >
            {cardinalityEnd}
          </text>
        </g>
      )}

      {/* Label or polarity badge */}
      {(label || polarity || (config.showLabels && typeConfig.labelDefault) || isEditing) && (
        <g
          transform={`translate(${midpoint.x}, ${midpoint.y})`}
          onDoubleClick={handleLabelDoubleClick}
          style={{ cursor: config.editableLabels !== false ? 'text' : 'default' }}
        >
          <rect
            x="-20"
            y="-12"
            width="40"
            height="24"
            rx="4"
            fill="white"
            stroke={isEditing ? '#3b82f6' : lineColor}
            strokeWidth={isEditing ? 2 : 1.5}
          />
          {isEditing ? (
            <foreignObject x="-18" y="-10" width="36" height="20">
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={handleLabelKeyDown}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: lineColor,
                  outline: 'none',
                  padding: 0,
                }}
              />
            </foreignObject>
          ) : (
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fontWeight="bold"
              fill={lineColor}
              style={{ pointerEvents: 'none' }}
            >
              {label || polarity || typeConfig.labelDefault}
            </text>
          )}
        </g>
      )}

      {/* Selection highlight - draggable endpoint handles (at exact element edge) */}
      {selected && (
        <>
          {/* Control point handle for curve manipulation */}
          {(connectionStyle === 'arc' || connectionStyle === 'bezier') && (
            <>
              {/* Guide lines from endpoints to control point */}
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={controlPoint.x}
                y2={controlPoint.y}
                stroke="#3b82f6"
                strokeWidth="1"
                strokeDasharray="4 2"
                opacity="0.5"
              />
              <line
                x1={toPos.x}
                y1={toPos.y}
                x2={controlPoint.x}
                y2={controlPoint.y}
                stroke="#3b82f6"
                strokeWidth="1"
                strokeDasharray="4 2"
                opacity="0.5"
              />
              {/* Control point handle */}
              <circle
                cx={controlPoint.x}
                cy={controlPoint.y}
                r={draggingControlPoint ? 10 : 8}
                fill={draggingControlPoint ? '#3b82f6' : 'white'}
                stroke="#3b82f6"
                strokeWidth="2"
                style={{ cursor: 'move' }}
                onMouseDown={handleControlPointMouseDown}
                onDoubleClick={handleControlPointDoubleClick}
              />
              {/* Inner dot to indicate it's a control point */}
              <circle
                cx={controlPoint.x}
                cy={controlPoint.y}
                r="3"
                fill="#3b82f6"
                style={{ pointerEvents: 'none' }}
              />
            </>
          )}

          {/* Segment handles for orthogonal connections - allows dragging ALL inner segments */}
          {connectionStyle === 'orthogonal' && draggableSegments.length > 0 && (
            <>
              {draggableSegments.map((segment) => {
                const { index, p1, p2, isVertical, isFirstInner, isLastInner, midX, midY } = segment;
                const segmentLength = isVertical
                  ? Math.abs(p2.y - p1.y)
                  : Math.abs(p2.x - p1.x);

                // Don't show handle for very short segments
                if (segmentLength < 20) return null;

                return (
                  <g key={`segment-${index}`}>
                    {/* Invisible wider hit area along the entire segment */}
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="transparent"
                      strokeWidth="16"
                      style={{ cursor: isVertical ? 'ew-resize' : 'ns-resize' }}
                      onMouseDown={(e) => handleSegmentMouseDown(index, isVertical, isFirstInner, isLastInner, e)}
                      onDoubleClick={handleSegmentDoubleClick}
                    />
                    {/* Visible handle at segment midpoint */}
                    <rect
                      x={midX - 4}
                      y={midY - 4}
                      width={8}
                      height={8}
                      rx={2}
                      fill={draggingSegment?.index === index ? '#3b82f6' : 'white'}
                      stroke="#3b82f6"
                      strokeWidth="1.5"
                      style={{ cursor: isVertical ? 'ew-resize' : 'ns-resize' }}
                      onMouseDown={(e) => handleSegmentMouseDown(index, isVertical, isFirstInner, isLastInner, e)}
                      onDoubleClick={handleSegmentDoubleClick}
                    />
                  </g>
                );
              })}
            </>
          )}

          {/* Endpoint handles */}
          <circle
            cx={fromPosExact.x}
            cy={fromPosExact.y}
            r={draggingEndpoint === 'from' ? 8 : 6}
            fill={draggingEndpoint === 'from' ? '#3b82f6' : lineColor}
            stroke="white"
            strokeWidth="2"
            style={{ cursor: 'move' }}
            onMouseDown={(e) => handleEndpointMouseDown('from', e)}
            onDoubleClick={handleEndpointDoubleClick}
          />
          <circle
            cx={toPosExact.x}
            cy={toPosExact.y}
            r={draggingEndpoint === 'to' ? 8 : 6}
            fill={draggingEndpoint === 'to' ? '#3b82f6' : lineColor}
            stroke="white"
            strokeWidth="2"
            style={{ cursor: 'move' }}
            onMouseDown={(e) => handleEndpointMouseDown('to', e)}
            onDoubleClick={handleEndpointDoubleClick}
          />
        </>
      )}
    </g>
  );
}
