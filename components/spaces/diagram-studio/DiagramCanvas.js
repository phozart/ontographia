// components/diagram-studio/DiagramCanvas.js
// Core canvas engine for DiagramStudio
// Handles rendering, pan/zoom, selection, drag, and connections

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useDiagram, useDiagramSelection, useDiagramViewport } from './DiagramContext';
import {
  applyLayoutConstraints,
  findContainingZone,
  getZones,
  isValidHierarchyConnection,
} from './LayoutEngine';
import Minimap from './Minimap';

// ============ CONSTANTS ============

const GRID_SIZE = 20;
const SNAP_THRESHOLD = 10;
const GUIDE_SNAP_THRESHOLD = 8; // Threshold for snapping to alignment guides
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;

// ============ HELPER FUNCTIONS ============

function snapToGrid(value, gridSize = GRID_SIZE) {
  return Math.round(value / gridSize) * gridSize;
}

function getPortPosition(element, portId, packRegistry) {
  const pack = packRegistry?.get?.(element.packId);
  const stencil = pack?.stencils?.find(s => s.id === element.type);
  const size = element.size || stencil?.defaultSize || { width: 120, height: 60 };

  const cx = element.x + size.width / 2;
  const cy = element.y + size.height / 2;

  switch (portId) {
    case 'top': return { x: cx, y: element.y };
    case 'bottom': return { x: cx, y: element.y + size.height };
    case 'left': return { x: element.x, y: cy };
    case 'right': return { x: element.x + size.width, y: cy };
    case 'center': return { x: cx, y: cy };
    default: return { x: cx, y: cy };
  }
}

function getConnectionPath(sourcePos, targetPos, sourcePort, targetPort, lineStyle = 'curved', obstacles = []) {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;

  // Straight line
  if (lineStyle === 'straight') {
    return `M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}`;
  }

  // Arc line
  if (lineStyle === 'arc') {
    const dist = Math.sqrt(dx * dx + dy * dy);
    const arcRadius = dist * 0.5;
    return `M ${sourcePos.x} ${sourcePos.y} A ${arcRadius} ${arcRadius} 0 0 1 ${targetPos.x} ${targetPos.y}`;
  }

  // Step line (orthogonal/right-angle) - smart routing with obstacle avoidance
  if (lineStyle === 'step') {
    return getOrthogonalPath(sourcePos, targetPos, sourcePort, targetPort, obstacles);
  }

  // Curved (default) - bezier based on port directions with smart routing
  return getCurvedPath(sourcePos, targetPos, sourcePort, targetPort);
}

// Smart orthogonal routing that respects port directions
function getOrthogonalPath(sourcePos, targetPos, sourcePort, targetPort, obstacles = []) {
  const offset = 40; // Routing offset distance
  const padding = 20; // Padding around obstacles

  // Determine direction vectors for ports
  const sourceDir = getPortDirection(sourcePort);
  const targetDir = getPortDirection(targetPort);

  // Calculate exit and entry points with offset
  const exitX = sourcePos.x + sourceDir.x * offset;
  const exitY = sourcePos.y + sourceDir.y * offset;
  const entryX = targetPos.x + targetDir.x * offset;
  const entryY = targetPos.y + targetDir.y * offset;

  // Build path segments based on port combinations
  let waypoints = [];

  // Same axis - need to route around
  if (sourcePort === 'bottom' && targetPort === 'bottom') {
    const midY = Math.max(exitY, entryY) + offset;
    waypoints = [
      { x: sourcePos.x, y: midY },
      { x: targetPos.x, y: midY },
    ];
  } else if (sourcePort === 'top' && targetPort === 'top') {
    const midY = Math.min(exitY, entryY) - offset;
    waypoints = [
      { x: sourcePos.x, y: midY },
      { x: targetPos.x, y: midY },
    ];
  } else if (sourcePort === 'right' && targetPort === 'right') {
    const midX = Math.max(exitX, entryX) + offset;
    waypoints = [
      { x: midX, y: sourcePos.y },
      { x: midX, y: targetPos.y },
    ];
  } else if (sourcePort === 'left' && targetPort === 'left') {
    const midX = Math.min(exitX, entryX) - offset;
    waypoints = [
      { x: midX, y: sourcePos.y },
      { x: midX, y: targetPos.y },
    ];
  }
  // Opposite ports - simple routing
  else if ((sourcePort === 'bottom' && targetPort === 'top') ||
           (sourcePort === 'top' && targetPort === 'bottom')) {
    const midY = (sourcePos.y + targetPos.y) / 2;
    waypoints = [
      { x: sourcePos.x, y: midY },
      { x: targetPos.x, y: midY },
    ];
  } else if ((sourcePort === 'right' && targetPort === 'left') ||
             (sourcePort === 'left' && targetPort === 'right')) {
    const midX = (sourcePos.x + targetPos.x) / 2;
    waypoints = [
      { x: midX, y: sourcePos.y },
      { x: midX, y: targetPos.y },
    ];
  }
  // Perpendicular ports - L-shaped routing
  else if ((sourcePort === 'bottom' || sourcePort === 'top') &&
           (targetPort === 'left' || targetPort === 'right')) {
    // Vertical from source, then horizontal to target
    waypoints = [{ x: sourcePos.x, y: targetPos.y }];
  } else if ((sourcePort === 'left' || sourcePort === 'right') &&
             (targetPort === 'bottom' || targetPort === 'top')) {
    // Horizontal from source, then vertical to target
    waypoints = [{ x: targetPos.x, y: sourcePos.y }];
  }
  // Fallback - simple step
  else {
    const midX = (sourcePos.x + targetPos.x) / 2;
    waypoints = [
      { x: midX, y: sourcePos.y },
      { x: midX, y: targetPos.y },
    ];
  }

  // Check for obstacle collisions and adjust waypoints if needed
  if (obstacles.length > 0) {
    waypoints = avoidObstacles(sourcePos, targetPos, waypoints, obstacles, padding);
  }

  // Build the path string
  let path = `M ${sourcePos.x} ${sourcePos.y}`;
  waypoints.forEach(wp => {
    path += ` L ${wp.x} ${wp.y}`;
  });
  path += ` L ${targetPos.x} ${targetPos.y}`;

  return path;
}

// Check if a line segment intersects with a rectangle (with padding)
function lineIntersectsRect(x1, y1, x2, y2, rect, padding = 0) {
  const left = rect.x - padding;
  const right = rect.x + rect.width + padding;
  const top = rect.y - padding;
  const bottom = rect.y + rect.height + padding;

  // Check if line is completely outside rectangle bounds
  if ((x1 < left && x2 < left) || (x1 > right && x2 > right)) return false;
  if ((y1 < top && y2 < top) || (y1 > bottom && y2 > bottom)) return false;

  // Check for horizontal line
  if (y1 === y2) {
    return y1 >= top && y1 <= bottom &&
           Math.max(Math.min(x1, x2), left) <= Math.min(Math.max(x1, x2), right);
  }

  // Check for vertical line
  if (x1 === x2) {
    return x1 >= left && x1 <= right &&
           Math.max(Math.min(y1, y2), top) <= Math.min(Math.max(y1, y2), bottom);
  }

  // General case - check intersections with all four sides
  const slope = (y2 - y1) / (x2 - x1);
  const intercept = y1 - slope * x1;

  // Check intersection with left edge
  const yAtLeft = slope * left + intercept;
  if (yAtLeft >= top && yAtLeft <= bottom &&
      left >= Math.min(x1, x2) && left <= Math.max(x1, x2)) return true;

  // Check intersection with right edge
  const yAtRight = slope * right + intercept;
  if (yAtRight >= top && yAtRight <= bottom &&
      right >= Math.min(x1, x2) && right <= Math.max(x1, x2)) return true;

  // Check intersection with top edge
  const xAtTop = (top - intercept) / slope;
  if (xAtTop >= left && xAtTop <= right &&
      top >= Math.min(y1, y2) && top <= Math.max(y1, y2)) return true;

  // Check intersection with bottom edge
  const xAtBottom = (bottom - intercept) / slope;
  if (xAtBottom >= left && xAtBottom <= right &&
      bottom >= Math.min(y1, y2) && bottom <= Math.max(y1, y2)) return true;

  return false;
}

// Avoid obstacles by adjusting waypoints
function avoidObstacles(sourcePos, targetPos, waypoints, obstacles, padding) {
  const allPoints = [sourcePos, ...waypoints, targetPos];
  const result = [];

  for (let i = 0; i < allPoints.length - 1; i++) {
    const p1 = allPoints[i];
    const p2 = allPoints[i + 1];

    // Check if this segment intersects any obstacle
    let intersectingObstacle = null;
    for (const obstacle of obstacles) {
      if (lineIntersectsRect(p1.x, p1.y, p2.x, p2.y, obstacle, padding)) {
        intersectingObstacle = obstacle;
        break;
      }
    }

    if (i > 0) {
      result.push(p1);
    }

    if (intersectingObstacle) {
      // Calculate routing around the obstacle
      const obs = intersectingObstacle;
      const obsCenterX = obs.x + obs.width / 2;
      const obsCenterY = obs.y + obs.height / 2;

      // Determine which side to go around
      const goLeft = p1.x < obsCenterX && p2.x < obsCenterX;
      const goRight = p1.x > obsCenterX && p2.x > obsCenterX;
      const goTop = p1.y < obsCenterY && p2.y < obsCenterY;
      const goBottom = p1.y > obsCenterY && p2.y > obsCenterY;

      // For horizontal movement, go above or below
      if (Math.abs(p2.x - p1.x) > Math.abs(p2.y - p1.y)) {
        const routeY = goTop ? obs.y - padding - 10 :
                       goBottom ? obs.y + obs.height + padding + 10 :
                       (p1.y < obsCenterY ? obs.y - padding - 10 : obs.y + obs.height + padding + 10);

        result.push({ x: p1.x, y: routeY });
        result.push({ x: p2.x, y: routeY });
      }
      // For vertical movement, go left or right
      else {
        const routeX = goLeft ? obs.x - padding - 10 :
                       goRight ? obs.x + obs.width + padding + 10 :
                       (p1.x < obsCenterX ? obs.x - padding - 10 : obs.x + obs.width + padding + 10);

        result.push({ x: routeX, y: p1.y });
        result.push({ x: routeX, y: p2.y });
      }
    }
  }

  return result;
}

// Get direction vector for a port
function getPortDirection(port) {
  switch (port) {
    case 'top': return { x: 0, y: -1 };
    case 'bottom': return { x: 0, y: 1 };
    case 'left': return { x: -1, y: 0 };
    case 'right': return { x: 1, y: 0 };
    default: return { x: 0, y: 0 };
  }
}

// Smart curved routing
function getCurvedPath(sourcePos, targetPos, sourcePort, targetPort) {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const offset = Math.min(80, Math.abs(dx) / 2, Math.abs(dy) / 2) || 40;

  // Get control point offsets based on port directions
  const sourceDir = getPortDirection(sourcePort);
  const targetDir = getPortDirection(targetPort);

  // Control points extend in the direction of the port
  const cp1x = sourcePos.x + sourceDir.x * offset;
  const cp1y = sourcePos.y + sourceDir.y * offset;
  const cp2x = targetPos.x + targetDir.x * offset;
  const cp2y = targetPos.y + targetDir.y * offset;

  return `M ${sourcePos.x} ${sourcePos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetPos.x} ${targetPos.y}`;
}

// Calculate snap guides for alignment with other elements
function calculateSnapGuides(draggingEl, allElements, packRegistry, threshold = GUIDE_SNAP_THRESHOLD) {
  const guides = { horizontal: [], vertical: [] };
  let snapX = null;
  let snapY = null;

  // Get dragging element size
  const dragPack = packRegistry?.get?.(draggingEl.packId);
  const dragStencil = dragPack?.stencils?.find(s => s.id === draggingEl.type);
  const dragSize = draggingEl.size || dragStencil?.defaultSize || { width: 120, height: 60 };

  // Dragging element edges and center
  const dragLeft = draggingEl.x;
  const dragRight = draggingEl.x + dragSize.width;
  const dragCenterX = draggingEl.x + dragSize.width / 2;
  const dragTop = draggingEl.y;
  const dragBottom = draggingEl.y + dragSize.height;
  const dragCenterY = draggingEl.y + dragSize.height / 2;

  // Check against other elements
  allElements.forEach(el => {
    if (el.id === draggingEl.id) return;

    const pack = packRegistry?.get?.(el.packId);
    const stencil = pack?.stencils?.find(s => s.id === el.type);
    const size = el.size || stencil?.defaultSize || { width: 120, height: 60 };

    // Target element edges and center
    const targetLeft = el.x;
    const targetRight = el.x + size.width;
    const targetCenterX = el.x + size.width / 2;
    const targetTop = el.y;
    const targetBottom = el.y + size.height;
    const targetCenterY = el.y + size.height / 2;

    // Vertical guides (align X positions)
    // Left-to-left
    if (Math.abs(dragLeft - targetLeft) < threshold) {
      guides.vertical.push({ x: targetLeft, y1: Math.min(dragTop, targetTop), y2: Math.max(dragBottom, targetBottom), type: 'edge' });
      if (snapX === null) snapX = targetLeft - dragLeft;
    }
    // Right-to-right
    if (Math.abs(dragRight - targetRight) < threshold) {
      guides.vertical.push({ x: targetRight, y1: Math.min(dragTop, targetTop), y2: Math.max(dragBottom, targetBottom), type: 'edge' });
      if (snapX === null) snapX = targetRight - dragRight;
    }
    // Left-to-right
    if (Math.abs(dragLeft - targetRight) < threshold) {
      guides.vertical.push({ x: targetRight, y1: Math.min(dragTop, targetTop), y2: Math.max(dragBottom, targetBottom), type: 'edge' });
      if (snapX === null) snapX = targetRight - dragLeft;
    }
    // Right-to-left
    if (Math.abs(dragRight - targetLeft) < threshold) {
      guides.vertical.push({ x: targetLeft, y1: Math.min(dragTop, targetTop), y2: Math.max(dragBottom, targetBottom), type: 'edge' });
      if (snapX === null) snapX = targetLeft - dragRight;
    }
    // Center-to-center (X)
    if (Math.abs(dragCenterX - targetCenterX) < threshold) {
      guides.vertical.push({ x: targetCenterX, y1: Math.min(dragTop, targetTop), y2: Math.max(dragBottom, targetBottom), type: 'center' });
      if (snapX === null) snapX = targetCenterX - dragCenterX;
    }

    // Horizontal guides (align Y positions)
    // Top-to-top
    if (Math.abs(dragTop - targetTop) < threshold) {
      guides.horizontal.push({ y: targetTop, x1: Math.min(dragLeft, targetLeft), x2: Math.max(dragRight, targetRight), type: 'edge' });
      if (snapY === null) snapY = targetTop - dragTop;
    }
    // Bottom-to-bottom
    if (Math.abs(dragBottom - targetBottom) < threshold) {
      guides.horizontal.push({ y: targetBottom, x1: Math.min(dragLeft, targetLeft), x2: Math.max(dragRight, targetRight), type: 'edge' });
      if (snapY === null) snapY = targetBottom - dragBottom;
    }
    // Top-to-bottom
    if (Math.abs(dragTop - targetBottom) < threshold) {
      guides.horizontal.push({ y: targetBottom, x1: Math.min(dragLeft, targetLeft), x2: Math.max(dragRight, targetRight), type: 'edge' });
      if (snapY === null) snapY = targetBottom - dragTop;
    }
    // Bottom-to-top
    if (Math.abs(dragBottom - targetTop) < threshold) {
      guides.horizontal.push({ y: targetTop, x1: Math.min(dragLeft, targetLeft), x2: Math.max(dragRight, targetRight), type: 'edge' });
      if (snapY === null) snapY = targetTop - dragBottom;
    }
    // Center-to-center (Y)
    if (Math.abs(dragCenterY - targetCenterY) < threshold) {
      guides.horizontal.push({ y: targetCenterY, x1: Math.min(dragLeft, targetLeft), x2: Math.max(dragRight, targetRight), type: 'center' });
      if (snapY === null) snapY = targetCenterY - dragCenterY;
    }
  });

  return { guides, snapX, snapY };
}

// ============ ARROW MARKER ============

function ArrowMarker({ id, color = 'var(--text-muted)' }) {
  return (
    <marker
      id={id}
      markerWidth="10"
      markerHeight="7"
      refX="9"
      refY="3.5"
      orient="auto"
    >
      <polygon points="0 0, 10 3.5, 0 7" fill={color} />
    </marker>
  );
}

// ============ CONNECTION TOOLBAR ============

function ConnectionToolbar({ connection, onUpdate, onDelete, onAddWaypoint, onClearWaypoints }) {
  const lineStyles = [
    { id: 'curved', label: 'Curved', icon: '⌒' },
    { id: 'straight', label: 'Straight', icon: '—' },
    { id: 'step', label: 'Step', icon: '⌐' },
    { id: 'arc', label: 'Arc', icon: '↷' },
  ];

  const strokeWidths = [
    { value: 1, label: 'Thin' },
    { value: 2, label: 'Normal' },
    { value: 3, label: 'Thick' },
  ];

  const arrowTypes = [
    { id: 'arrow', label: 'Arrow', show: true },
    { id: 'none', label: 'No Arrow', show: false },
  ];

  return (
    <div className="ds-connection-toolbar">
      {/* Line Style */}
      <div className="ds-conn-toolbar-group">
        <span className="ds-conn-toolbar-label">Style</span>
        <div className="ds-conn-toolbar-buttons">
          {lineStyles.map(style => (
            <button
              key={style.id}
              className={`ds-conn-toolbar-btn ${connection.lineStyle === style.id ? 'active' : ''}`}
              onClick={() => onUpdate({ lineStyle: style.id })}
              title={style.label}
            >
              {style.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="ds-conn-toolbar-divider" />

      {/* Stroke Width */}
      <div className="ds-conn-toolbar-group">
        <span className="ds-conn-toolbar-label">Width</span>
        <div className="ds-conn-toolbar-buttons">
          {strokeWidths.map(sw => (
            <button
              key={sw.value}
              className={`ds-conn-toolbar-btn ${(connection.strokeWidth || 2) === sw.value ? 'active' : ''}`}
              onClick={() => onUpdate({ strokeWidth: sw.value })}
              title={sw.label}
            >
              <span style={{
                display: 'inline-block',
                width: 16,
                height: sw.value + 1,
                background: 'currentColor',
                borderRadius: 1,
              }} />
            </button>
          ))}
        </div>
      </div>

      <div className="ds-conn-toolbar-divider" />

      {/* Dashed/Solid */}
      <div className="ds-conn-toolbar-group">
        <div className="ds-conn-toolbar-buttons">
          <button
            className={`ds-conn-toolbar-btn ${!connection.dashed ? 'active' : ''}`}
            onClick={() => onUpdate({ dashed: false })}
            title="Solid"
          >
            ━
          </button>
          <button
            className={`ds-conn-toolbar-btn ${connection.dashed ? 'active' : ''}`}
            onClick={() => onUpdate({ dashed: true })}
            title="Dashed"
          >
            ┅
          </button>
        </div>
      </div>

      <div className="ds-conn-toolbar-divider" />

      {/* Arrow */}
      <div className="ds-conn-toolbar-group">
        <div className="ds-conn-toolbar-buttons">
          <button
            className={`ds-conn-toolbar-btn ${connection.showArrow !== false ? 'active' : ''}`}
            onClick={() => onUpdate({ showArrow: true })}
            title="Show Arrow"
          >
            →
          </button>
          <button
            className={`ds-conn-toolbar-btn ${connection.showArrow === false ? 'active' : ''}`}
            onClick={() => onUpdate({ showArrow: false })}
            title="No Arrow"
          >
            ○
          </button>
        </div>
      </div>

      <div className="ds-conn-toolbar-divider" />

      {/* Waypoints */}
      <div className="ds-conn-toolbar-group">
        <div className="ds-conn-toolbar-buttons">
          <button
            className="ds-conn-toolbar-btn"
            onClick={onAddWaypoint}
            title="Add Waypoint"
          >
            📍
          </button>
          {connection.waypoints?.length > 0 && (
            <button
              className="ds-conn-toolbar-btn"
              onClick={onClearWaypoints}
              title="Clear Waypoints"
            >
              🧹
            </button>
          )}
        </div>
      </div>

      <div className="ds-conn-toolbar-divider" />

      {/* Delete */}
      <button
        className="ds-conn-toolbar-btn ds-conn-toolbar-btn--danger"
        onClick={onDelete}
        title="Delete Connection"
      >
        🗑️
      </button>
    </div>
  );
}

// ============ ALIGNMENT TOOLBAR ============

function AlignmentToolbar({ selectedElements, onAlign, onDistribute, onMatchSize }) {
  if (selectedElements.length < 2) return null;

  return (
    <div className="ds-alignment-toolbar">
      {/* Horizontal Alignment */}
      <div className="ds-align-toolbar-group">
        <span className="ds-align-toolbar-label">Align</span>
        <div className="ds-align-toolbar-buttons">
          <button
            className="ds-align-toolbar-btn"
            onClick={() => onAlign('left')}
            title="Align Left"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="2" height="14" />
              <rect x="5" y="3" width="8" height="4" />
              <rect x="5" y="9" width="6" height="4" />
            </svg>
          </button>
          <button
            className="ds-align-toolbar-btn"
            onClick={() => onAlign('center-h')}
            title="Align Center (Horizontal)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="7" y="1" width="2" height="14" />
              <rect x="3" y="3" width="10" height="4" />
              <rect x="4" y="9" width="8" height="4" />
            </svg>
          </button>
          <button
            className="ds-align-toolbar-btn"
            onClick={() => onAlign('right')}
            title="Align Right"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="13" y="1" width="2" height="14" />
              <rect x="3" y="3" width="8" height="4" />
              <rect x="5" y="9" width="6" height="4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="ds-align-toolbar-divider" />

      {/* Vertical Alignment */}
      <div className="ds-align-toolbar-group">
        <div className="ds-align-toolbar-buttons">
          <button
            className="ds-align-toolbar-btn"
            onClick={() => onAlign('top')}
            title="Align Top"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="14" height="2" />
              <rect x="3" y="5" width="4" height="8" />
              <rect x="9" y="5" width="4" height="6" />
            </svg>
          </button>
          <button
            className="ds-align-toolbar-btn"
            onClick={() => onAlign('center-v')}
            title="Align Middle (Vertical)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="7" width="14" height="2" />
              <rect x="3" y="3" width="4" height="10" />
              <rect x="9" y="4" width="4" height="8" />
            </svg>
          </button>
          <button
            className="ds-align-toolbar-btn"
            onClick={() => onAlign('bottom')}
            title="Align Bottom"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="13" width="14" height="2" />
              <rect x="3" y="3" width="4" height="8" />
              <rect x="9" y="5" width="4" height="6" />
            </svg>
          </button>
        </div>
      </div>

      {selectedElements.length >= 3 && (
        <>
          <div className="ds-align-toolbar-divider" />

          {/* Distribute */}
          <div className="ds-align-toolbar-group">
            <span className="ds-align-toolbar-label">Distribute</span>
            <div className="ds-align-toolbar-buttons">
              <button
                className="ds-align-toolbar-btn"
                onClick={() => onDistribute('horizontal')}
                title="Distribute Horizontally"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="1" y="4" width="3" height="8" />
                  <rect x="6.5" y="4" width="3" height="8" />
                  <rect x="12" y="4" width="3" height="8" />
                </svg>
              </button>
              <button
                className="ds-align-toolbar-btn"
                onClick={() => onDistribute('vertical')}
                title="Distribute Vertically"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="4" y="1" width="8" height="3" />
                  <rect x="4" y="6.5" width="8" height="3" />
                  <rect x="4" y="12" width="8" height="3" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      <div className="ds-align-toolbar-divider" />

      {/* Match Size */}
      <div className="ds-align-toolbar-group">
        <span className="ds-align-toolbar-label">Size</span>
        <div className="ds-align-toolbar-buttons">
          <button
            className="ds-align-toolbar-btn"
            onClick={() => onMatchSize('width')}
            title="Match Width"
          >
            ↔
          </button>
          <button
            className="ds-align-toolbar-btn"
            onClick={() => onMatchSize('height')}
            title="Match Height"
          >
            ↕
          </button>
          <button
            className="ds-align-toolbar-btn"
            onClick={() => onMatchSize('both')}
            title="Match Both"
          >
            ⬚
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ CONNECTION COMPONENT ============

function Connection({
  connection,
  elements,
  isSelected,
  onSelect,
  onDoubleClick,
  onWaypointDrag,
  packRegistry,
  readOnly,
  isEditingLabel,
  onLabelChange,
  onEditingDone,
}) {
  const source = elements.find(e => e.id === connection.sourceId);
  const target = elements.find(e => e.id === connection.targetId);
  const [localLabel, setLocalLabel] = useState(connection.label || '');
  const inputRef = useRef(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingLabel && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingLabel]);

  // Update local label when connection changes
  useEffect(() => {
    setLocalLabel(connection.label || '');
  }, [connection.label]);

  if (!source || !target) return null;

  const sourcePort = connection.sourcePort || 'bottom';
  const targetPort = connection.targetPort || 'top';
  const lineStyle = connection.lineStyle || 'curved';
  const strokeWidth = connection.strokeWidth || 2;
  const dashed = connection.dashed || false;
  const showArrow = connection.showArrow !== false;
  const color = connection.color || 'var(--text-muted)';
  const waypoints = connection.waypoints || [];

  const sourcePos = getPortPosition(source, sourcePort, packRegistry);
  const targetPos = getPortPosition(target, targetPort, packRegistry);

  // Compute obstacles (all elements except source and target) for step line routing
  const obstacles = useMemo(() => {
    if (lineStyle !== 'step') return [];
    return elements
      .filter(el => el.id !== connection.sourceId && el.id !== connection.targetId)
      .map(el => {
        const pack = packRegistry?.get?.(el.packId);
        const stencil = pack?.stencils?.find(s => s.id === el.type);
        const size = el.size || stencil?.defaultSize || { width: 120, height: 60 };
        return {
          x: el.x,
          y: el.y,
          width: size.width,
          height: size.height,
        };
      });
  }, [elements, connection.sourceId, connection.targetId, lineStyle, packRegistry]);

  // Generate path with waypoints support
  const path = getConnectionPathWithWaypoints(sourcePos, targetPos, waypoints, sourcePort, targetPort, lineStyle, obstacles);

  // Label position - at midpoint or at specified waypoint
  const labelPos = getLabelPosition(sourcePos, targetPos, waypoints);

  const strokeColor = isSelected ? 'var(--accent)' : color;
  const finalStrokeWidth = isSelected ? strokeWidth + 1 : strokeWidth;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onLabelChange?.(connection.id, localLabel);
      onEditingDone?.(connection.id, false);
    } else if (e.key === 'Escape') {
      setLocalLabel(connection.label || '');
      onEditingDone?.(connection.id, false);
    }
  };

  const handleBlur = () => {
    onLabelChange?.(connection.id, localLabel);
    onEditingDone?.(connection.id, false);
  };

  return (
    <g
      className={`ds-connection-group ${isSelected ? 'selected' : ''}`}
      data-connection-id={connection.id}
    >
      {/* Invisible wider path for easier clicking */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(connection);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!readOnly) {
            onDoubleClick?.(connection, e);
          }
        }}
      />
      {/* Visible path */}
      <path
        className={`ds-connection ${isSelected ? 'selected' : ''}`}
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={finalStrokeWidth}
        strokeDasharray={dashed ? '8,4' : undefined}
        markerEnd={showArrow ? `url(#arrow-${isSelected ? 'selected' : 'default'})` : undefined}
      />

      {/* Waypoint handles when selected */}
      {isSelected && !readOnly && waypoints.map((wp, idx) => (
        <circle
          key={idx}
          cx={wp.x}
          cy={wp.y}
          r="6"
          fill="var(--bg)"
          stroke="var(--accent)"
          strokeWidth="2"
          style={{ cursor: 'move' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onWaypointDrag?.(connection.id, idx, e);
          }}
        />
      ))}

      {/* Add waypoint hint circles on path when selected */}
      {isSelected && !readOnly && waypoints.length === 0 && (
        <circle
          cx={labelPos.x}
          cy={labelPos.y + 25}
          r="5"
          fill="var(--border)"
          stroke="var(--text-muted)"
          strokeWidth="1"
          style={{ cursor: 'pointer', opacity: 0.5 }}
          onClick={(e) => {
            e.stopPropagation();
            // Add a waypoint at this position
            const newWaypoint = { x: labelPos.x, y: labelPos.y + 25 };
            onLabelChange?.(connection.id, connection.label, [newWaypoint]);
          }}
        >
          <title>Click to add waypoint</title>
        </circle>
      )}

      {/* Label */}
      {isEditingLabel ? (
        <foreignObject
          x={labelPos.x - 60}
          y={labelPos.y - 15}
          width="120"
          height="30"
        >
          <input
            ref={inputRef}
            type="text"
            value={localLabel}
            onChange={(e) => setLocalLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()}
            placeholder="Enter label..."
            style={{
              width: '100%',
              height: '100%',
              textAlign: 'center',
              fontSize: 12,
              border: '2px solid var(--accent)',
              borderRadius: 4,
              background: 'var(--bg)',
              color: 'var(--text)',
              outline: 'none',
            }}
          />
        </foreignObject>
      ) : (
        connection.label && (
          <g style={{ cursor: readOnly ? 'default' : 'pointer' }}>
            <rect
              className="ds-connection-label-bg"
              x={labelPos.x - Math.max(24, connection.label.length * 4)}
              y={labelPos.y - 10}
              width={Math.max(48, connection.label.length * 8)}
              height="20"
              rx="4"
            />
            <text
              className="ds-connection-label"
              x={labelPos.x}
              y={labelPos.y + 4}
              textAnchor="middle"
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (!readOnly) {
                  onDoubleClick?.(connection, e);
                }
              }}
            >
              {connection.label}
            </text>
          </g>
        )
      )}

      {/* Show "double-click to add label" hint when selected and no label */}
      {isSelected && !connection.label && !isEditingLabel && !readOnly && (
        <g
          style={{ cursor: 'pointer', opacity: 0.6 }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onDoubleClick?.(connection, e);
          }}
        >
          <rect
            x={labelPos.x - 50}
            y={labelPos.y - 10}
            width="100"
            height="20"
            rx="4"
            fill="var(--bg-surface)"
            stroke="var(--border)"
            strokeDasharray="3,3"
          />
          <text
            x={labelPos.x}
            y={labelPos.y + 4}
            textAnchor="middle"
            fontSize="10"
            fill="var(--text-muted)"
          >
            Double-click to label
          </text>
        </g>
      )}
    </g>
  );
}

// Helper to get path with waypoints
function getConnectionPathWithWaypoints(sourcePos, targetPos, waypoints, sourcePort, targetPort, lineStyle, obstacles = []) {
  if (waypoints.length === 0) {
    return getConnectionPath(sourcePos, targetPos, sourcePort, targetPort, lineStyle, obstacles);
  }

  // Build path through waypoints
  if (lineStyle === 'straight') {
    let path = `M ${sourcePos.x} ${sourcePos.y}`;
    waypoints.forEach(wp => {
      path += ` L ${wp.x} ${wp.y}`;
    });
    path += ` L ${targetPos.x} ${targetPos.y}`;
    return path;
  }

  // Step path through waypoints
  if (lineStyle === 'step') {
    let path = `M ${sourcePos.x} ${sourcePos.y}`;
    waypoints.forEach(wp => {
      path += ` L ${wp.x} ${wp.y}`;
    });
    path += ` L ${targetPos.x} ${targetPos.y}`;
    return path;
  }

  // Curved path through waypoints
  const points = [sourcePos, ...waypoints, targetPos];
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    if (lineStyle === 'curved' && next) {
      // Quadratic curve
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      path += ` Q ${curr.x} ${curr.y}, ${(curr.x + next.x) / 2} ${(curr.y + next.y) / 2}`;
    } else {
      // Final segment
      const cpX = (prev.x + curr.x) / 2;
      path += ` Q ${cpX} ${prev.y}, ${curr.x} ${curr.y}`;
    }
  }

  return path;
}

// Helper to get label position
function getLabelPosition(sourcePos, targetPos, waypoints) {
  if (waypoints.length === 0) {
    return {
      x: (sourcePos.x + targetPos.x) / 2,
      y: (sourcePos.y + targetPos.y) / 2 - 15,
    };
  }

  // Put label at middle waypoint or between waypoints
  const midIdx = Math.floor(waypoints.length / 2);
  if (waypoints.length % 2 === 1) {
    return { x: waypoints[midIdx].x, y: waypoints[midIdx].y - 15 };
  }

  const wp1 = waypoints[midIdx - 1];
  const wp2 = waypoints[midIdx];
  return {
    x: (wp1.x + wp2.x) / 2,
    y: (wp1.y + wp2.y) / 2 - 15,
  };
}

// ============ NODE COMPONENT ============

function Node({
  element,
  isSelected,
  isDragging,
  onSelect,
  onDragStart,
  onConnectStart,
  onConnectEnd,
  onLabelChange,
  onQuickCreate,
  packRegistry,
  readOnly,
  renderNode,
  isConnectMode,
  isConnecting,
  isEditingLabel,
  onEditingLabelDone,
  activePack,
}) {
  const pack = packRegistry?.get?.(element.packId);
  const stencil = pack?.stencils?.find(s => s.id === element.type);
  const size = element.size || stencil?.defaultSize || { width: 120, height: 60 };
  const [isHovered, setIsHovered] = useState(false);
  const [localLabel, setLocalLabel] = useState(element.label || element.name || '');
  const inputRef = useRef(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingLabel && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingLabel]);

  // Update local label when element changes
  useEffect(() => {
    setLocalLabel(element.label || element.name || '');
  }, [element.label, element.name]);

  const handleMouseDown = (e) => {
    if (readOnly || isEditingLabel) return;

    // Check if clicking on a resize handle - let it bubble to canvas for resize handling
    if (e.target.closest('.ds-resize-handle')) {
      return; // Don't stop propagation, let canvas handle resize
    }

    e.stopPropagation();

    // In connect mode, start a connection
    if (isConnectMode && !isConnecting) {
      onConnectStart?.(element, e);
      return;
    }

    onSelect?.(element.id);
    onDragStart?.(e, element);
  };

  const handleMouseUp = (e) => {
    // Complete connection if in connecting state
    if (isConnecting) {
      onConnectEnd?.(element, e);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isConnectMode && !isEditingLabel) {
      // Pass shift key state for multi-select toggle
      onSelect?.(element.id, e.shiftKey);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!readOnly && !isConnectMode) {
      onEditingLabelDone?.(element.id, true); // Start editing
    }
  };

  const handleLabelKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onLabelChange?.(element.id, localLabel);
      onEditingLabelDone?.(element.id, false);
    } else if (e.key === 'Escape') {
      setLocalLabel(element.label || element.name || '');
      onEditingLabelDone?.(element.id, false);
    }
  };

  const handleLabelBlur = () => {
    onLabelChange?.(element.id, localLabel);
    onEditingLabelDone?.(element.id, false);
  };

  // Default node rendering
  const shape = stencil?.shape || 'rect';
  const color = element.color || stencil?.color || '#3b82f6';
  const fontSize = element.fontSize || 13;
  const fontWeight = element.fontWeight || 'normal';
  const textAlign = element.textAlign || 'center';

  // Show ports when: selected, hovered (any mode), in connect mode, or connecting
  // This allows users to click on specific ports to start/end connections
  const showPorts = !readOnly && (isSelected || isHovered || isConnectMode || isConnecting);

  // Show quick-create buttons when hovered or selected (not in connect mode)
  const showQuickCreate = !readOnly && !isConnectMode && (isSelected || isHovered) && !isEditingLabel && !isConnecting;

  const labelContent = isEditingLabel ? (
    <input
      ref={inputRef}
      type="text"
      className="ds-node-label-input"
      value={localLabel}
      onChange={(e) => setLocalLabel(e.target.value)}
      onKeyDown={handleLabelKeyDown}
      onBlur={handleLabelBlur}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        fontSize,
        fontWeight,
        textAlign,
        width: '100%',
        border: 'none',
        background: 'rgba(255,255,255,0.9)',
        outline: '2px solid var(--accent)',
        borderRadius: 4,
        padding: '2px 4px',
      }}
    />
  ) : (
    <span
      className="ds-node-label"
      style={{ fontSize, fontWeight, textAlign }}
    >
      {element.label || element.name || 'Untitled'}
    </span>
  );

  // Check if using custom renderer
  const hasCustomRenderer = pack?.renderNode || renderNode;

  return (
    <div
      className={`ds-node ds-node-${shape} ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isConnectMode ? 'connect-mode' : ''} ${hasCustomRenderer ? 'ds-node-custom-render' : ''}`}
      data-node-id={element.id}
      style={{
        left: element.x,
        top: element.y,
        width: size.width,
        height: size.height,
        opacity: element.opacity || 1,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="ds-node-content"
        style={hasCustomRenderer ? {
          // Custom renderer handles its own styling - no background/border
          background: 'transparent',
          border: 'none',
          padding: 0,
        } : {
          borderColor: isSelected ? 'var(--accent)' : color,
          backgroundColor: element.backgroundColor || 'var(--panel)',
        }}
      >
        {/* Use pack's custom renderer if available */}
        {pack?.renderNode ? (
          pack.renderNode(element, stencil, isSelected)
        ) : renderNode ? (
          renderNode(element, stencil, isSelected)
        ) : shape === 'diamond' ? (
          <div className="ds-node-inner">
            {labelContent}
          </div>
        ) : (
          labelContent
        )}
        {/* Editing overlay for custom rendered nodes */}
        {isEditingLabel && hasCustomRenderer && (
          <div
            className="ds-node-edit-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 6,
              padding: 8,
              zIndex: 10,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="ds-node-label-input"
              value={localLabel}
              onChange={(e) => setLocalLabel(e.target.value)}
              onKeyDown={handleLabelKeyDown}
              onBlur={handleLabelBlur}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                fontSize: 14,
                fontWeight: 500,
                textAlign: 'center',
                width: '90%',
                border: '1px solid var(--border)',
                background: 'white',
                outline: '2px solid var(--accent)',
                borderRadius: 4,
                padding: '6px 8px',
              }}
            />
          </div>
        )}
      </div>
      {/* Ports */}
      {showPorts && renderPorts(element, stencil)}

      {/* Quick-create buttons (+) */}
      {showQuickCreate && (
        <>
          <button
            className="ds-quick-create ds-quick-create-right"
            title="Create connected node to the right"
            onClick={(e) => {
              e.stopPropagation();
              onQuickCreate?.(element, 'right');
            }}
          >
            +
          </button>
          <button
            className="ds-quick-create ds-quick-create-bottom"
            title="Create connected node below"
            onClick={(e) => {
              e.stopPropagation();
              onQuickCreate?.(element, 'bottom');
            }}
          >
            +
          </button>
          <button
            className="ds-quick-create ds-quick-create-left"
            title="Create connected node to the left"
            onClick={(e) => {
              e.stopPropagation();
              onQuickCreate?.(element, 'left');
            }}
          >
            +
          </button>
          <button
            className="ds-quick-create ds-quick-create-top"
            title="Create connected node above"
            onClick={(e) => {
              e.stopPropagation();
              onQuickCreate?.(element, 'top');
            }}
          >
            +
          </button>
        </>
      )}

      {/* Resize handles */}
      {isSelected && !readOnly && !isConnectMode && (
        <>
          <div className="ds-resize-handle ds-resize-e" data-resize="e" data-element-id={element.id} />
          <div className="ds-resize-handle ds-resize-s" data-resize="s" data-element-id={element.id} />
          <div className="ds-resize-handle ds-resize-se" data-resize="se" data-element-id={element.id} />
          <div className="ds-resize-handle ds-resize-w" data-resize="w" data-element-id={element.id} />
          <div className="ds-resize-handle ds-resize-n" data-resize="n" data-element-id={element.id} />
          <div className="ds-resize-handle ds-resize-nw" data-resize="nw" data-element-id={element.id} />
          <div className="ds-resize-handle ds-resize-ne" data-resize="ne" data-element-id={element.id} />
          <div className="ds-resize-handle ds-resize-sw" data-resize="sw" data-element-id={element.id} />
        </>
      )}
    </div>
  );
}

function renderPorts(element, stencil) {
  const ports = stencil?.ports || ['top', 'bottom', 'left', 'right'];

  return ports.map(port => {
    // Handle both string ports and object ports { id: 'top', position: 'top' }
    const portId = typeof port === 'object' ? port.id : port;
    return (
      <div
        key={portId}
        className={`ds-port ds-port-${portId}`}
        data-port={portId}
        data-element-id={element.id}
      />
    );
  });
}

// ============ GRID COMPONENT ============

function Grid({ showGrid }) {
  if (!showGrid) return null;

  return (
    <svg className="ds-grid" width="100%" height="100%">
      <defs>
        <pattern id="ds-grid-small" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
          <path
            d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
            fill="none"
            stroke="var(--border)"
            strokeWidth="0.5"
            opacity="0.3"
          />
        </pattern>
        <pattern id="ds-grid-large" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse">
          <rect width={GRID_SIZE * 5} height={GRID_SIZE * 5} fill="url(#ds-grid-small)" />
          <path
            d={`M ${GRID_SIZE * 5} 0 L 0 0 0 ${GRID_SIZE * 5}`}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            opacity="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ds-grid-large)" />
    </svg>
  );
}

// ============ MAIN CANVAS COMPONENT ============

export default function DiagramCanvas({
  packRegistry,
  renderNode,
  profile,
  onContextMenu,
  draggingStencil,
  onDragEnd,
  className = '',
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Context
  const {
    diagram,
    elements,
    connections,
    showGrid,
    activeTool,
    activePack,
    setElements,
    addElement,
    updateElement,
    removeElement,
    addConnection,
    updateConnection,
    removeConnection,
    recordHistory,
    layers,
    groups,
    groupElements,
    ungroupElements,
  } = useDiagram();

  // Get layout settings from diagram
  const layoutSettings = diagram?.settings || {};

  const { viewport, setViewport, pan } = useDiagramViewport();
  const {
    selection,
    selectElement,
    selectElements,
    toggleElementSelection,
    selectAll,
    selectConnection,
    clearSelection,
    isElementSelected,
    isConnectionSelected,
  } = useDiagramSelection();

  // Local state
  const [draggingElement, setDraggingElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPositions, setDragStartPositions] = useState({}); // For multi-select drag
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectSource, setConnectSource] = useState(null);
  const [connectMousePos, setConnectMousePos] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 3000, height: 2000 });
  const [contextMenu, setContextMenu] = useState(null);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editingConnectionId, setEditingConnectionId] = useState(null);
  const [draggingWaypoint, setDraggingWaypoint] = useState(null); // { connectionId, waypointIndex }
  // Marquee selection state
  const [marquee, setMarquee] = useState(null); // { startX, startY, currentX, currentY }
  // Clipboard for copy/paste
  const [clipboard, setClipboard] = useState(null);
  const [resizing, setResizing] = useState(null); // { elementId, direction, startX, startY, startSize, startPos }
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [snapGuides, setSnapGuides] = useState({ horizontal: [], vertical: [] });

  // Profile settings
  const readOnly = profile?.editingPolicy?.readOnly || false;
  const canMove = profile?.editingPolicy?.canMove !== false;
  const canConnect = profile?.editingPolicy?.canConnect !== false;

  // Calculate canvas bounds based on elements
  useEffect(() => {
    if (elements.length === 0) return;

    let maxX = 0;
    let maxY = 0;

    elements.forEach(el => {
      const size = el.size || { width: 120, height: 60 };
      maxX = Math.max(maxX, el.x + size.width + 500);
      maxY = Math.max(maxY, el.y + size.height + 500);
    });

    setCanvasSize({
      width: Math.max(3000, maxX),
      height: Math.max(2000, maxY),
    });
  }, [elements]);

  // ============ DRAG HANDLING ============

  const handleDragStart = useCallback((e, element) => {
    if (readOnly || !canMove) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / viewport.scale - viewport.x;
    const y = (e.clientY - rect.top) / viewport.scale - viewport.y;

    setDraggingElement(element.id);
    setDragOffset({
      x: x - element.x,
      y: y - element.y,
    });

    // Store starting positions for all selected elements (for multi-drag)
    if (selection.nodeIds.length > 1 && selection.nodeIds.includes(element.id)) {
      const positions = {};
      elements.forEach(el => {
        if (selection.nodeIds.includes(el.id)) {
          positions[el.id] = { x: el.x, y: el.y };
        }
      });
      setDragStartPositions(positions);
    }
  }, [viewport, readOnly, canMove, selection.nodeIds, elements]);

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / viewport.scale - viewport.x;
    const y = (e.clientY - rect.top) / viewport.scale - viewport.y;

    // Track mouse position for connection line
    if (isConnecting && connectSource) {
      setConnectMousePos({ x, y });
    }

    // Handle marquee selection
    if (marquee) {
      setMarquee(prev => prev ? { ...prev, currentX: x, currentY: y } : null);
      return;
    }

    // Handle waypoint dragging
    if (draggingWaypoint) {
      const { connectionId, waypointIndex } = draggingWaypoint;
      const connection = connections.find(c => c.id === connectionId);
      if (connection) {
        const newWaypoints = [...(connection.waypoints || [])];
        newWaypoints[waypointIndex] = { x: snapToGrid(x), y: snapToGrid(y) };
        updateConnection(connectionId, { waypoints: newWaypoints });
      }
      return;
    }

    // Handle resizing with proper grid snapping
    if (resizing) {
      const { elementId, direction, startX, startY, startSize, startPos } = resizing;
      const dx = x - startX;
      const dy = y - startY;

      let newWidth = startSize.width;
      let newHeight = startSize.height;
      let newX = startPos.x;
      let newY = startPos.y;

      // Minimum size constraints
      const minWidth = 60;
      const minHeight = 40;

      // Handle each resize direction with grid snapping
      if (direction.includes('e')) {
        // East: expand width, position stays same
        const targetWidth = startSize.width + dx;
        newWidth = Math.max(minWidth, snapToGrid(targetWidth));
      }
      if (direction.includes('w')) {
        // West: expand width leftward, position moves
        const targetX = startPos.x + dx;
        const snappedX = snapToGrid(targetX);
        const widthDelta = startPos.x - snappedX;
        newWidth = Math.max(minWidth, startSize.width + widthDelta);
        // Only move X if we have room for minimum width
        if (startSize.width + widthDelta >= minWidth) {
          newX = snappedX;
        } else {
          newX = startPos.x + startSize.width - minWidth;
          newWidth = minWidth;
        }
      }
      if (direction.includes('s')) {
        // South: expand height, position stays same
        const targetHeight = startSize.height + dy;
        newHeight = Math.max(minHeight, snapToGrid(targetHeight));
      }
      if (direction.includes('n')) {
        // North: expand height upward, position moves
        const targetY = startPos.y + dy;
        const snappedY = snapToGrid(targetY);
        const heightDelta = startPos.y - snappedY;
        newHeight = Math.max(minHeight, startSize.height + heightDelta);
        // Only move Y if we have room for minimum height
        if (startSize.height + heightDelta >= minHeight) {
          newY = snappedY;
        } else {
          newY = startPos.y + startSize.height - minHeight;
          newHeight = minHeight;
        }
      }

      // Ensure final position is on grid
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);
      // Ensure final size is on grid
      newWidth = snapToGrid(newWidth);
      newHeight = snapToGrid(newHeight);

      updateElement(elementId, {
        x: Math.max(0, newX),
        y: Math.max(0, newY),
        size: { width: newWidth, height: newHeight },
      });
      return;
    }

    if (draggingElement && canMove) {
      // Snap to grid first
      let newX = snapToGrid(x - dragOffset.x);
      let newY = snapToGrid(y - dragOffset.y);

      // Get current element for snap guide calculation
      const currentElement = elements.find(el => el.id === draggingElement);
      if (currentElement) {
        // Create a temporary element at the new position to calculate snap guides
        const tempElement = { ...currentElement, x: newX, y: newY };
        const { guides, snapX, snapY } = calculateSnapGuides(tempElement, elements, packRegistry);

        // Apply snap adjustments
        if (snapX !== null) {
          newX = snapToGrid(newX + snapX);
        }
        if (snapY !== null) {
          newY = snapToGrid(newY + snapY);
        }

        // Update snap guides state for rendering
        setSnapGuides(guides);
      }

      setElements(prev => {
        // Get the element being dragged
        const element = prev.find(el => el.id === draggingElement);
        if (!element) return prev;

        // Calculate delta from original position
        const dx = newX - element.x;
        const dy = newY - element.y;

        // Create a temporary element with new position for constraint checking
        const tempElement = { ...element, x: newX, y: newY };

        // Apply layout constraints if enabled
        if (layoutSettings.constrainToZones) {
          const constrained = applyLayoutConstraints(tempElement, prev, layoutSettings);
          newX = constrained.x;
          newY = constrained.y;
        }

        // Check if we're dragging multiple selected elements
        const selectedIds = selection.nodeIds;
        const isMultiDrag = selectedIds.length > 1 && selectedIds.includes(draggingElement);

        if (isMultiDrag) {
          // Move all selected elements by the same delta
          return prev.map(el => {
            if (selectedIds.includes(el.id)) {
              const startPos = dragStartPositions[el.id];
              if (startPos) {
                return {
                  ...el,
                  x: Math.max(0, snapToGrid(startPos.x + dx)),
                  y: Math.max(0, snapToGrid(startPos.y + dy)),
                };
              }
            }
            return el;
          });
        }

        return prev.map(el =>
          el.id === draggingElement
            ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) }
            : el
        );
      });
    } else if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setViewport(prev => ({
        ...prev,
        x: prev.x + dx / prev.scale,
        y: prev.y + dy / prev.scale,
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [draggingElement, dragOffset, dragStartPositions, viewport, isPanning, panStart, canMove, isConnecting, connectSource, draggingWaypoint, resizing, marquee, selection, connections, elements, packRegistry, setElements, setViewport, updateConnection, updateElement, layoutSettings]);

  const handleMouseUp = useCallback((e) => {
    // Complete marquee selection
    if (marquee) {
      const minX = Math.min(marquee.startX, marquee.currentX);
      const maxX = Math.max(marquee.startX, marquee.currentX);
      const minY = Math.min(marquee.startY, marquee.currentY);
      const maxY = Math.max(marquee.startY, marquee.currentY);

      // Find elements that intersect with marquee rectangle
      const selectedIds = elements.filter(el => {
        const pack = packRegistry?.get?.(el.packId);
        const stencil = pack?.stencils?.find(s => s.id === el.type);
        const size = el.size || stencil?.defaultSize || { width: 120, height: 60 };

        // Check if element intersects with marquee
        return !(el.x + size.width < minX ||
                 el.x > maxX ||
                 el.y + size.height < minY ||
                 el.y > maxY);
      }).map(el => el.id);

      if (selectedIds.length > 0) {
        // If shift is held, add to existing selection
        selectElements(selectedIds, e?.shiftKey || false);
      }
      setMarquee(null);
      return;
    }

    if (draggingElement) {
      recordHistory();
      // Clear snap guides when done dragging
      setSnapGuides({ horizontal: [], vertical: [] });
    }
    if (draggingWaypoint) {
      recordHistory();
    }
    if (resizing) {
      recordHistory();
    }
    setDraggingElement(null);
    setDragStartPositions({});
    setIsPanning(false);
    setDraggingWaypoint(null);
    setResizing(null);
  }, [draggingElement, draggingWaypoint, resizing, marquee, elements, packRegistry, selectElements, recordHistory]);

  // ============ PAN HANDLING ============

  const handleCanvasMouseDown = useCallback((e) => {
    // Clear any editing state when clicking on canvas
    setEditingLabelId(null);
    setEditingConnectionId(null);

    // Check if clicking on a resize handle
    const resizeHandle = e.target.closest('.ds-resize-handle');
    if (resizeHandle && !readOnly) {
      e.stopPropagation();
      e.preventDefault();

      const direction = resizeHandle.dataset.resize;
      const elementId = resizeHandle.dataset.elementId;
      const element = elements.find(el => el.id === elementId);

      if (element) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left) / viewport.scale - viewport.x;
          const y = (e.clientY - rect.top) / viewport.scale - viewport.y;

          const pack = packRegistry?.get?.(element.packId);
          const stencil = pack?.stencils?.find(s => s.id === element.type);
          const size = element.size || stencil?.defaultSize || { width: 120, height: 60 };

          setResizing({
            elementId,
            direction,
            startX: x,
            startY: y,
            startSize: { ...size },
            startPos: { x: element.x, y: element.y },
          });
        }
      }
      return;
    }

    // Check if clicking on canvas background or space key is pressed
    if (e.target === canvasRef.current || e.target.classList.contains('ds-grid') || e.target.closest('.ds-canvas-inner') === e.target.closest('.ds-canvas')?.querySelector('.ds-canvas-inner') && !e.target.closest('.ds-node') && !e.target.closest('.ds-connection-group') || isSpacePressed) {
      if (activeTool === 'pan' || e.button === 1 || isSpacePressed) { // Middle mouse button or space key
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
      } else if (!readOnly && activeTool === 'select') {
        // Start marquee selection
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left) / viewport.scale - viewport.x;
          const y = (e.clientY - rect.top) / viewport.scale - viewport.y;
          setMarquee({ startX: x, startY: y, currentX: x, currentY: y });
          // Only clear selection if not holding shift
          if (!e.shiftKey) {
            clearSelection();
          }
        }
      } else {
        clearSelection();
      }
    }
  }, [activeTool, clearSelection, elements, viewport, readOnly, packRegistry, isSpacePressed]);

  // ============ ZOOM HANDLING ============

  // Use effect to add non-passive wheel listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // Allow zoom if allowZoom is not explicitly false
      if (profile?.uiPolicy?.allowZoom !== false) {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          e.stopPropagation();
          const delta = e.deltaY > 0 ? 0.9 : 1.1;
          setViewport(prev => ({
            ...prev,
            scale: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.scale * delta)),
          }));
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [profile, setViewport]);

  // ============ DRAG & DROP HANDLING ============

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Get drop position in canvas coordinates
    const x = (e.clientX - rect.left) / viewport.scale - viewport.x;
    const y = (e.clientY - rect.top) / viewport.scale - viewport.y;

    // Try to parse dropped data
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));

      if (data.type === 'stencil') {
        const pack = packRegistry?.get?.(data.packId || activePack);
        const stencil = pack?.stencils?.find(s => s.id === data.stencilId);

        if (stencil) {
          const snappedX = snapToGrid(x - (stencil.defaultSize?.width || 60));
          const snappedY = snapToGrid(y - (stencil.defaultSize?.height || 30));

          addElement({
            type: stencil.id,
            packId: data.packId || activePack,
            name: stencil.name,
            label: stencil.name,
            x: Math.max(0, snappedX),
            y: Math.max(0, snappedY),
            size: stencil.defaultSize || { width: 120, height: 60 },
            color: stencil.color,
          });
        }
      }
    } catch (err) {
      console.warn('Drop parse error:', err);
    }

    onDragEnd?.();
  }, [viewport, packRegistry, activePack, addElement, onDragEnd]);

  // ============ CONNECTION HANDLING ============

  const handlePortClick = useCallback((e) => {
    if (!canConnect || readOnly) return;

    const portEl = e.target.closest('.ds-port');
    if (!portEl) return;

    const elementId = portEl.dataset.elementId;
    const portId = portEl.dataset.port;

    if (!isConnecting) {
      // Start connection
      setIsConnecting(true);
      setConnectSource({ elementId, portId });
    } else {
      // Complete connection
      if (elementId !== connectSource.elementId) {
        addConnection({
          sourceId: connectSource.elementId,
          targetId: elementId,
          sourcePort: connectSource.portId,
          targetPort: portId,
        });
      }
      setIsConnecting(false);
      setConnectSource(null);
    }
  }, [isConnecting, connectSource, canConnect, readOnly, addConnection]);

  // ============ KEYBOARD SHORTCUTS ============

  // Copy selected elements to clipboard
  const handleCopy = useCallback(() => {
    if (selection.nodeIds.length === 0) return;

    const selectedEls = elements.filter(el => selection.nodeIds.includes(el.id));
    const selectedConns = connections.filter(conn =>
      selection.nodeIds.includes(conn.sourceId) && selection.nodeIds.includes(conn.targetId)
    );

    // Calculate bounds for offset on paste
    const minX = Math.min(...selectedEls.map(el => el.x));
    const minY = Math.min(...selectedEls.map(el => el.y));

    setClipboard({
      elements: selectedEls.map(el => ({ ...el, x: el.x - minX, y: el.y - minY })),
      connections: selectedConns,
      offset: { x: minX, y: minY },
    });
  }, [selection.nodeIds, elements, connections]);

  // Paste from clipboard
  const handlePaste = useCallback(() => {
    if (!clipboard || clipboard.elements.length === 0) return;

    const pasteOffset = 40; // Offset from original position
    const idMap = {}; // Map old IDs to new IDs

    // Create new elements with new IDs
    const newElements = clipboard.elements.map(el => {
      const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      idMap[el.id] = newId;
      return {
        ...el,
        id: newId,
        x: el.x + clipboard.offset.x + pasteOffset,
        y: el.y + clipboard.offset.y + pasteOffset,
      };
    });

    // Create new connections with updated IDs
    const newConnections = clipboard.connections.map(conn => ({
      ...conn,
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceId: idMap[conn.sourceId],
      targetId: idMap[conn.targetId],
    }));

    // Add elements and connections
    newElements.forEach(el => addElement(el));
    newConnections.forEach(conn => addConnection(conn));

    // Select the pasted elements
    selectElements(newElements.map(el => el.id));

    recordHistory();
  }, [clipboard, addElement, addConnection, selectElements, recordHistory]);

  // Duplicate selected elements
  const handleDuplicate = useCallback(() => {
    handleCopy();
    setTimeout(() => handlePaste(), 0);
  }, [handleCopy, handlePaste]);

  // Nudge selected elements with arrow keys
  const handleNudge = useCallback((dx, dy) => {
    if (selection.nodeIds.length === 0 || readOnly) return;

    selection.nodeIds.forEach(id => {
      const el = elements.find(e => e.id === id);
      if (el) {
        updateElement(id, {
          x: Math.max(0, snapToGrid(el.x + dx)),
          y: Math.max(0, snapToGrid(el.y + dy)),
        });
      }
    });
    recordHistory();
  }, [selection.nodeIds, elements, updateElement, readOnly, recordHistory]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space key for pan mode
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
      }

      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      // Escape - cancel current operation
      if (e.key === 'Escape') {
        setIsConnecting(false);
        setConnectSource(null);
        setConnectMousePos(null);
        setContextMenu(null);
        setMarquee(null);
        clearSelection();
      }

      // Ctrl/Cmd + A - Select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        selectAll();
      }

      // Ctrl/Cmd + C - Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !readOnly) {
        e.preventDefault();
        handleCopy();
      }

      // Ctrl/Cmd + V - Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !readOnly) {
        e.preventDefault();
        handlePaste();
      }

      // Ctrl/Cmd + D - Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !readOnly) {
        e.preventDefault();
        handleDuplicate();
      }

      // Arrow keys - Nudge selected elements
      const nudgeAmount = e.shiftKey ? GRID_SIZE * 2 : GRID_SIZE;
      if (e.key === 'ArrowLeft' && !readOnly) {
        e.preventDefault();
        handleNudge(-nudgeAmount, 0);
      }
      if (e.key === 'ArrowRight' && !readOnly) {
        e.preventDefault();
        handleNudge(nudgeAmount, 0);
      }
      if (e.key === 'ArrowUp' && !readOnly) {
        e.preventDefault();
        handleNudge(0, -nudgeAmount);
      }
      if (e.key === 'ArrowDown' && !readOnly) {
        e.preventDefault();
        handleNudge(0, nudgeAmount);
      }

      // Delete selected elements
      if ((e.key === 'Delete' || e.key === 'Backspace') && !readOnly) {
        e.preventDefault();
        // Delete selected elements using selection state
        if (selection?.nodeIds?.length > 0) {
          selection.nodeIds.forEach(id => removeElement(id));
        }
        if (selection?.connectionIds?.length > 0) {
          selection.connectionIds.forEach(id => removeConnection(id));
        }
        clearSelection();
      }

      // M - Toggle minimap
      if (e.key === 'm' || e.key === 'M') {
        setShowMinimap(prev => !prev);
      }

      // Ctrl/Cmd + G - Group selected elements
      if ((e.ctrlKey || e.metaKey) && e.key === 'g' && !e.shiftKey && !readOnly) {
        e.preventDefault();
        if (selection?.nodeIds?.length >= 2) {
          groupElements(selection.nodeIds);
        }
      }

      // Ctrl/Cmd + Shift + G - Ungroup selected elements
      if ((e.ctrlKey || e.metaKey) && e.key === 'g' && e.shiftKey && !readOnly) {
        e.preventDefault();
        const selectedWithGroups = elements.filter(el =>
          selection?.nodeIds?.includes(el.id) && el.groupId
        );
        const groupIds = [...new Set(selectedWithGroups.map(el => el.groupId))];
        groupIds.forEach(groupId => ungroupElements(groupId));
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === ' ') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [readOnly, clearSelection, selectAll, selection, elements, removeElement, removeConnection, handleCopy, handlePaste, handleDuplicate, handleNudge, groupElements, ungroupElements]);

  // ============ ALIGNMENT HANDLERS ============

  // Get selected elements with their sizes
  const getSelectedElementsWithSizes = useCallback(() => {
    return elements
      .filter(el => selection.nodeIds.includes(el.id))
      .map(el => {
        const pack = packRegistry?.get?.(el.packId);
        const stencil = pack?.stencils?.find(s => s.id === el.type);
        const size = el.size || stencil?.defaultSize || { width: 120, height: 60 };
        return { ...el, size };
      });
  }, [elements, selection.nodeIds, packRegistry]);

  // Align selected elements
  const handleAlign = useCallback((direction) => {
    const selectedEls = getSelectedElementsWithSizes();
    if (selectedEls.length < 2) return;

    let targetValue;
    switch (direction) {
      case 'left':
        targetValue = Math.min(...selectedEls.map(el => el.x));
        selectedEls.forEach(el => updateElement(el.id, { x: targetValue }));
        break;
      case 'center-h':
        const centerXs = selectedEls.map(el => el.x + el.size.width / 2);
        targetValue = (Math.min(...centerXs) + Math.max(...centerXs)) / 2;
        selectedEls.forEach(el => updateElement(el.id, { x: targetValue - el.size.width / 2 }));
        break;
      case 'right':
        targetValue = Math.max(...selectedEls.map(el => el.x + el.size.width));
        selectedEls.forEach(el => updateElement(el.id, { x: targetValue - el.size.width }));
        break;
      case 'top':
        targetValue = Math.min(...selectedEls.map(el => el.y));
        selectedEls.forEach(el => updateElement(el.id, { y: targetValue }));
        break;
      case 'center-v':
        const centerYs = selectedEls.map(el => el.y + el.size.height / 2);
        targetValue = (Math.min(...centerYs) + Math.max(...centerYs)) / 2;
        selectedEls.forEach(el => updateElement(el.id, { y: targetValue - el.size.height / 2 }));
        break;
      case 'bottom':
        targetValue = Math.max(...selectedEls.map(el => el.y + el.size.height));
        selectedEls.forEach(el => updateElement(el.id, { y: targetValue - el.size.height }));
        break;
    }
    recordHistory();
  }, [getSelectedElementsWithSizes, updateElement, recordHistory]);

  // Distribute selected elements evenly
  const handleDistribute = useCallback((direction) => {
    const selectedEls = getSelectedElementsWithSizes();
    if (selectedEls.length < 3) return;

    if (direction === 'horizontal') {
      // Sort by X position
      const sorted = [...selectedEls].sort((a, b) => a.x - b.x);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalSpace = (last.x + last.size.width) - first.x;
      const totalWidth = sorted.reduce((sum, el) => sum + el.size.width, 0);
      const gap = (totalSpace - totalWidth) / (sorted.length - 1);

      let currentX = first.x;
      sorted.forEach((el, i) => {
        if (i > 0) {
          updateElement(el.id, { x: snapToGrid(currentX) });
        }
        currentX += el.size.width + gap;
      });
    } else {
      // Sort by Y position
      const sorted = [...selectedEls].sort((a, b) => a.y - b.y);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalSpace = (last.y + last.size.height) - first.y;
      const totalHeight = sorted.reduce((sum, el) => sum + el.size.height, 0);
      const gap = (totalSpace - totalHeight) / (sorted.length - 1);

      let currentY = first.y;
      sorted.forEach((el, i) => {
        if (i > 0) {
          updateElement(el.id, { y: snapToGrid(currentY) });
        }
        currentY += el.size.height + gap;
      });
    }
    recordHistory();
  }, [getSelectedElementsWithSizes, updateElement, recordHistory]);

  // Match size of selected elements
  const handleMatchSize = useCallback((dimension) => {
    const selectedEls = getSelectedElementsWithSizes();
    if (selectedEls.length < 2) return;

    // Use the first selected element as the reference
    const reference = selectedEls[0];

    selectedEls.slice(1).forEach(el => {
      const newSize = { ...el.size };
      if (dimension === 'width' || dimension === 'both') {
        newSize.width = reference.size.width;
      }
      if (dimension === 'height' || dimension === 'both') {
        newSize.height = reference.size.height;
      }
      updateElement(el.id, { size: newSize });
    });
    recordHistory();
  }, [getSelectedElementsWithSizes, updateElement, recordHistory]);

  // ============ START CONNECTION FROM NODE ============

  const handleNodeConnectionStart = useCallback((element, e) => {
    // Check both profile and layout settings for connection permissions
    if (!canConnect || readOnly || activeTool !== 'connect') return;
    if (layoutSettings.allowConnections === false) return;

    e.stopPropagation();

    // Get center of element for connection start
    const size = element.size || { width: 120, height: 60 };
    const centerX = element.x + size.width / 2;
    const centerY = element.y + size.height / 2;

    setIsConnecting(true);
    setConnectSource({
      elementId: element.id,
      portId: 'center',
      x: centerX,
      y: centerY,
    });
    setConnectMousePos({ x: centerX, y: centerY });
  }, [canConnect, readOnly, activeTool, layoutSettings]);

  const handleNodeConnectionEnd = useCallback((targetElement, e) => {
    if (!isConnecting || !connectSource) return;

    e.stopPropagation();

    // Check if connections are allowed by layout settings
    if (layoutSettings.allowConnections === false) {
      setIsConnecting(false);
      setConnectSource(null);
      setConnectMousePos(null);
      return;
    }

    // Don't connect to self
    if (targetElement.id === connectSource.elementId) {
      setIsConnecting(false);
      setConnectSource(null);
      setConnectMousePos(null);
      return;
    }

    // Determine best ports based on relative positions
    const sourceEl = elements.find(el => el.id === connectSource.elementId);
    if (!sourceEl) return;

    // Validate hierarchy rules if defined
    if (layoutSettings.hierarchyRules) {
      const isValid = isValidHierarchyConnection(
        sourceEl.type,
        targetElement.type,
        layoutSettings.hierarchyRules
      );
      if (!isValid) {
        setIsConnecting(false);
        setConnectSource(null);
        setConnectMousePos(null);
        return;
      }
    }

    const { sourcePort, targetPort } = determineBestPorts(sourceEl, targetElement);

    addConnection({
      sourceId: connectSource.elementId,
      targetId: targetElement.id,
      sourcePort,
      targetPort,
      lineStyle: 'curved', // default
    });

    setIsConnecting(false);
    setConnectSource(null);
    setConnectMousePos(null);
  }, [isConnecting, connectSource, elements, addConnection, layoutSettings]);

  // Helper to determine best connection ports
  function determineBestPorts(source, target) {
    const sourceSize = source.size || { width: 120, height: 60 };
    const targetSize = target.size || { width: 120, height: 60 };

    const sourceCX = source.x + sourceSize.width / 2;
    const sourceCY = source.y + sourceSize.height / 2;
    const targetCX = target.x + targetSize.width / 2;
    const targetCY = target.y + targetSize.height / 2;

    const dx = targetCX - sourceCX;
    const dy = targetCY - sourceCY;

    let sourcePort, targetPort;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal connection
      sourcePort = dx > 0 ? 'right' : 'left';
      targetPort = dx > 0 ? 'left' : 'right';
    } else {
      // Vertical connection
      sourcePort = dy > 0 ? 'bottom' : 'top';
      targetPort = dy > 0 ? 'top' : 'bottom';
    }

    return { sourcePort, targetPort };
  }

  // ============ QUICK CREATE HANDLING ============

  // Helper to check if a rectangle overlaps with any existing element
  const checkOverlap = useCallback((x, y, width, height, excludeId = null) => {
    const padding = 10; // Minimum gap between elements
    for (const el of elements) {
      if (el.id === excludeId) continue;
      const elPack = packRegistry?.get?.(el.packId);
      const elStencil = elPack?.stencils?.find(s => s.id === el.type);
      const elSize = el.size || elStencil?.defaultSize || { width: 120, height: 60 };

      // Check bounding box overlap with padding
      if (
        x < el.x + elSize.width + padding &&
        x + width + padding > el.x &&
        y < el.y + elSize.height + padding &&
        y + height + padding > el.y
      ) {
        return true;
      }
    }
    return false;
  }, [elements, packRegistry]);

  // Helper to find available position
  const findAvailablePosition = useCallback((preferredX, preferredY, width, height, direction, excludeId = null) => {
    let x = preferredX;
    let y = preferredY;
    const step = GRID_SIZE * 2; // Step size for searching
    const maxAttempts = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (!checkOverlap(x, y, width, height, excludeId)) {
        return { x, y };
      }

      // Shift based on direction
      switch (direction) {
        case 'right':
          x += step;
          break;
        case 'left':
          x -= step;
          break;
        case 'bottom':
          y += step;
          break;
        case 'top':
          y -= step;
          break;
      }
    }

    // If still overlapping, try perpendicular direction
    x = preferredX;
    y = preferredY;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (!checkOverlap(x, y, width, height, excludeId)) {
        return { x, y };
      }

      // Shift perpendicular
      if (direction === 'right' || direction === 'left') {
        y += step;
      } else {
        x += step;
      }
    }

    // Return original position if no space found
    return { x: preferredX, y: preferredY };
  }, [checkOverlap]);

  const handleQuickCreate = useCallback((sourceElement, direction) => {
    const pack = packRegistry?.get?.(sourceElement.packId || activePack);
    const stencil = pack?.stencils?.find(s => s.id === sourceElement.type);
    const sourceSize = sourceElement.size || stencil?.defaultSize || { width: 120, height: 60 };
    const newSize = stencil?.defaultSize || { width: 120, height: 60 };

    const spacing = 60; // Gap between nodes

    let preferredX, preferredY;
    let sourcePort, targetPort;

    switch (direction) {
      case 'right':
        preferredX = sourceElement.x + sourceSize.width + spacing;
        preferredY = sourceElement.y + (sourceSize.height - newSize.height) / 2;
        sourcePort = 'right';
        targetPort = 'left';
        break;
      case 'left':
        preferredX = sourceElement.x - newSize.width - spacing;
        preferredY = sourceElement.y + (sourceSize.height - newSize.height) / 2;
        sourcePort = 'left';
        targetPort = 'right';
        break;
      case 'bottom':
        preferredX = sourceElement.x + (sourceSize.width - newSize.width) / 2;
        preferredY = sourceElement.y + sourceSize.height + spacing;
        sourcePort = 'bottom';
        targetPort = 'top';
        break;
      case 'top':
        preferredX = sourceElement.x + (sourceSize.width - newSize.width) / 2;
        preferredY = sourceElement.y - newSize.height - spacing;
        sourcePort = 'top';
        targetPort = 'bottom';
        break;
      default:
        return;
    }

    // Find available position that doesn't overlap
    const { x: finalX, y: finalY } = findAvailablePosition(
      preferredX,
      preferredY,
      newSize.width,
      newSize.height,
      direction,
      sourceElement.id
    );

    // Create the new element
    const newElement = addElement({
      type: sourceElement.type,
      packId: sourceElement.packId || activePack,
      name: stencil?.name || 'New Node',
      label: stencil?.name || 'New Node',
      x: Math.max(0, snapToGrid(finalX)),
      y: Math.max(0, snapToGrid(finalY)),
      size: newSize,
      color: stencil?.color || sourceElement.color,
    });

    // Create a connection from source to new element
    if (newElement?.id) {
      addConnection({
        sourceId: sourceElement.id,
        targetId: newElement.id,
        sourcePort,
        targetPort,
        lineStyle: 'curved',
      });

      // Select the new element
      selectElement(newElement.id);
      // Start editing its label
      setEditingLabelId(newElement.id);
    }
  }, [packRegistry, activePack, addElement, addConnection, selectElement, findAvailablePosition]);

  // ============ CONNECTION EDITING ============

  const handleConnectionDoubleClick = useCallback((connection, e) => {
    if (readOnly) return;
    setEditingConnectionId(connection.id);
    selectConnection(connection);
  }, [readOnly, selectConnection]);

  const handleConnectionLabelChange = useCallback((connectionId, label, waypoints) => {
    const updates = { label };
    if (waypoints !== undefined) {
      updates.waypoints = waypoints;
    }
    updateConnection(connectionId, updates);
  }, [updateConnection]);

  const handleWaypointDragStart = useCallback((connectionId, waypointIndex, e) => {
    e.stopPropagation();
    setDraggingWaypoint({ connectionId, waypointIndex });
  }, []);

  const handleAddWaypoint = useCallback((connectionId, position) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    const newWaypoints = [...(connection.waypoints || []), position];
    updateConnection(connectionId, { waypoints: newWaypoints });
  }, [connections, updateConnection]);

  const handleClearWaypoints = useCallback((connectionId) => {
    updateConnection(connectionId, { waypoints: [] });
  }, [updateConnection]);

  // ============ CONTEXT MENU ============

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX;
    const y = e.clientY;

    // Check if right-clicking on a node
    const nodeEl = e.target.closest('.ds-node');
    const connectionEl = e.target.closest('.ds-connection-group');

    let menuItems = [];

    if (nodeEl) {
      const nodeId = nodeEl.dataset?.nodeId;
      if (nodeId && !readOnly) {
        menuItems = [
          { label: 'Edit Label', action: 'edit-label', icon: '✏️' },
          { label: 'Duplicate', action: 'duplicate', icon: '📋' },
          { type: 'divider' },
          { label: 'Bring to Front', action: 'bring-front', icon: '⬆️' },
          { label: 'Send to Back', action: 'send-back', icon: '⬇️' },
          { type: 'divider' },
          { label: 'Delete', action: 'delete', icon: '🗑️', danger: true },
        ];
      }
    } else if (connectionEl) {
      const connId = connectionEl.dataset?.connectionId;
      const conn = connections.find(c => c.id === connId);
      const hasWaypoints = conn?.waypoints?.length > 0;

      if (!readOnly) {
        menuItems = [
          { label: 'Edit Label', action: 'edit-connection-label', icon: '✏️' },
          { type: 'divider' },
          { label: 'Straight Line', action: 'line-straight', icon: '—' },
          { label: 'Curved Line', action: 'line-curved', icon: '⌒' },
          { label: 'Arc Line', action: 'line-arc', icon: '↷' },
          { label: 'Step Line', action: 'line-step', icon: '⌐' },
          { type: 'divider' },
          { label: 'Thin (1px)', action: 'stroke-1', icon: '━' },
          { label: 'Normal (2px)', action: 'stroke-2', icon: '━' },
          { label: 'Thick (3px)', action: 'stroke-3', icon: '━' },
          { type: 'divider' },
          { label: 'Solid Line', action: 'solid', icon: '━' },
          { label: 'Dashed Line', action: 'dashed', icon: '┅' },
          { type: 'divider' },
          { label: 'Add Waypoint', action: 'add-waypoint', icon: '📍' },
          ...(hasWaypoints ? [{ label: 'Clear Waypoints', action: 'clear-waypoints', icon: '🧹' }] : []),
          { type: 'divider' },
          { label: 'Delete Connection', action: 'delete-connection', icon: '🗑️', danger: true },
        ];
      }
    } else {
      // Canvas background
      menuItems = [
        { label: 'Select All', action: 'select-all', icon: '☑️' },
        { label: 'Paste', action: 'paste', icon: '📋', disabled: true },
        { type: 'divider' },
        { label: 'Fit to View', action: 'fit-view', icon: '🔍' },
        { label: 'Reset Zoom', action: 'reset-zoom', icon: '↺' },
      ];
    }

    if (menuItems.length > 0) {
      setContextMenu({ x, y, items: menuItems, nodeEl, connectionEl });
    }
  }, [readOnly]);

  const handleContextMenuAction = useCallback((action, nodeEl, connectionEl) => {
    setContextMenu(null);

    const nodeId = nodeEl?.dataset?.nodeId;
    const connectionId = connectionEl?.dataset?.connectionId;

    switch (action) {
      case 'edit-label':
        if (nodeId) {
          setEditingLabelId(nodeId);
          selectElement(nodeId);
        }
        break;
      case 'delete':
        if (nodeId) {
          removeElement(nodeId);
        }
        break;
      case 'delete-connection':
        if (connectionId) {
          removeConnection(connectionId);
        }
        break;
      case 'duplicate':
        if (nodeId) {
          const element = elements.find(el => el.id === nodeId);
          if (element) {
            addElement({
              ...element,
              id: undefined,
              x: element.x + 20,
              y: element.y + 20,
              label: `${element.label || element.name} (copy)`,
            });
          }
        }
        break;
      case 'select-all':
        // Select all elements
        elements.forEach(el => selectElement(el.id, true));
        break;
      case 'fit-view':
      case 'reset-zoom':
        setViewport({ x: 0, y: 0, scale: 1 });
        break;
      case 'edit-connection-label':
        if (connectionId) {
          setEditingConnectionId(connectionId);
          const conn = connections.find(c => c.id === connectionId);
          if (conn) selectConnection(conn);
        }
        break;
      case 'line-straight':
        if (connectionId) updateConnection(connectionId, { lineStyle: 'straight' });
        break;
      case 'line-curved':
        if (connectionId) updateConnection(connectionId, { lineStyle: 'curved' });
        break;
      case 'line-arc':
        if (connectionId) updateConnection(connectionId, { lineStyle: 'arc' });
        break;
      case 'line-step':
        if (connectionId) updateConnection(connectionId, { lineStyle: 'step' });
        break;
      case 'stroke-1':
        if (connectionId) updateConnection(connectionId, { strokeWidth: 1 });
        break;
      case 'stroke-2':
        if (connectionId) updateConnection(connectionId, { strokeWidth: 2 });
        break;
      case 'stroke-3':
        if (connectionId) updateConnection(connectionId, { strokeWidth: 3 });
        break;
      case 'solid':
        if (connectionId) updateConnection(connectionId, { dashed: false });
        break;
      case 'dashed':
        if (connectionId) updateConnection(connectionId, { dashed: true });
        break;
      case 'add-waypoint':
        if (connectionId) {
          const conn = connections.find(c => c.id === connectionId);
          if (conn) {
            const sourceEl = elements.find(e => e.id === conn.sourceId);
            const targetEl = elements.find(e => e.id === conn.targetId);
            if (sourceEl && targetEl) {
              const sourceSize = sourceEl.size || { width: 120, height: 60 };
              const targetSize = targetEl.size || { width: 120, height: 60 };
              const midX = (sourceEl.x + sourceSize.width / 2 + targetEl.x + targetSize.width / 2) / 2;
              const midY = (sourceEl.y + sourceSize.height / 2 + targetEl.y + targetSize.height / 2) / 2;
              handleAddWaypoint(connectionId, { x: midX, y: midY });
            }
          }
        }
        break;
      case 'clear-waypoints':
        if (connectionId) handleClearWaypoints(connectionId);
        break;
      default:
        break;
    }
  }, [elements, connections, addElement, removeElement, removeConnection, updateConnection, selectElement, selectConnection, setViewport, handleAddWaypoint, handleClearWaypoints]);

  // ============ RENDER ============

  return (
    <div
      ref={containerRef}
      className={`ds-canvas-area ${className} ${isSpacePressed ? 'space-pan' : ''} ${isPanning ? 'panning' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        ref={canvasRef}
        className="ds-canvas"
        onMouseDown={handleCanvasMouseDown}
        onClick={handlePortClick}
        style={{
          cursor: isPanning ? 'grabbing' : isConnecting ? 'crosshair' : activeTool === 'pan' ? 'grab' : 'default',
        }}
      >
        <div
          className="ds-canvas-inner"
          style={{
            transform: `scale(${viewport.scale}) translate(${viewport.x}px, ${viewport.y}px)`,
            transformOrigin: '0 0',
            width: canvasSize.width,
            height: canvasSize.height,
          }}
        >
          {/* Grid */}
          <Grid showGrid={showGrid && profile?.uiPolicy?.showGrid !== false} />

          {/* Marquee Selection Rectangle */}
          {marquee && (
            <div
              className="ds-marquee"
              style={{
                position: 'absolute',
                left: Math.min(marquee.startX, marquee.currentX),
                top: Math.min(marquee.startY, marquee.currentY),
                width: Math.abs(marquee.currentX - marquee.startX),
                height: Math.abs(marquee.currentY - marquee.startY),
                border: '2px dashed var(--accent)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            />
          )}

          {/* Connections Layer (SVG) */}
          <svg className="ds-connections" width="100%" height="100%">
            <defs>
              <ArrowMarker id="arrow-default" color="var(--text-muted)" />
              <ArrowMarker id="arrow-selected" color="var(--accent)" />
              <ArrowMarker id="arrow-temp" color="var(--accent)" />
            </defs>
            {connections.map(conn => (
              <Connection
                key={conn.id}
                connection={conn}
                elements={elements}
                isSelected={isConnectionSelected(conn.id)}
                onSelect={selectConnection}
                onDoubleClick={handleConnectionDoubleClick}
                onWaypointDrag={handleWaypointDragStart}
                onLabelChange={handleConnectionLabelChange}
                onEditingDone={(id, editing) => setEditingConnectionId(editing ? id : null)}
                isEditingLabel={editingConnectionId === conn.id}
                packRegistry={packRegistry}
                readOnly={readOnly}
              />
            ))}
            {/* Temporary connection line while dragging */}
            {isConnecting && connectSource && connectMousePos && (
              <path
                className="ds-connection ds-connection-temp"
                d={`M ${connectSource.x} ${connectSource.y} L ${connectMousePos.x} ${connectMousePos.y}`}
                stroke="var(--accent)"
                strokeWidth="2"
                strokeDasharray="5,5"
                fill="none"
                markerEnd="url(#arrow-temp)"
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* Snap Guides */}
            {draggingElement && (
              <>
                {/* Vertical guides */}
                {snapGuides.vertical.map((guide, idx) => (
                  <line
                    key={`v-${idx}`}
                    x1={guide.x}
                    y1={guide.y1 - 20}
                    x2={guide.x}
                    y2={guide.y2 + 20}
                    stroke={guide.type === 'center' ? '#3b82f6' : '#22c55e'}
                    strokeWidth="1"
                    strokeDasharray={guide.type === 'center' ? '4,4' : 'none'}
                    style={{ pointerEvents: 'none' }}
                  />
                ))}
                {/* Horizontal guides */}
                {snapGuides.horizontal.map((guide, idx) => (
                  <line
                    key={`h-${idx}`}
                    x1={guide.x1 - 20}
                    y1={guide.y}
                    x2={guide.x2 + 20}
                    y2={guide.y}
                    stroke={guide.type === 'center' ? '#3b82f6' : '#22c55e'}
                    strokeWidth="1"
                    strokeDasharray={guide.type === 'center' ? '4,4' : 'none'}
                    style={{ pointerEvents: 'none' }}
                  />
                ))}
              </>
            )}
          </svg>

          {/* Nodes Layer */}
          {elements.map(element => (
            <Node
              key={element.id}
              element={element}
              isSelected={isElementSelected(element.id)}
              isDragging={draggingElement === element.id}
              onSelect={(id, shiftKey) => {
                if (shiftKey) {
                  toggleElementSelection(id);
                } else {
                  selectElement(id);
                }
              }}
              onDragStart={handleDragStart}
              onConnectStart={handleNodeConnectionStart}
              onConnectEnd={handleNodeConnectionEnd}
              onLabelChange={(id, label) => updateElement(id, { label })}
              onQuickCreate={handleQuickCreate}
              packRegistry={packRegistry}
              readOnly={readOnly}
              renderNode={renderNode}
              isConnectMode={activeTool === 'connect'}
              isConnecting={isConnecting}
              isEditingLabel={editingLabelId === element.id}
              onEditingLabelDone={(id, editing) => setEditingLabelId(editing ? id : null)}
              activePack={activePack}
            />
          ))}
        </div>
      </div>

      {/* Tool mode indicator */}
      {activeTool === 'connect' && !isConnecting && (
        <div className="ds-tool-hint" style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          background: 'var(--panel)',
          color: 'var(--text)',
          borderRadius: 8,
          fontSize: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--border)',
          zIndex: 100,
        }}>
          Connect Mode: Click on a node and drag to another to create a connection
        </div>
      )}

      {/* Connection in progress indicator */}
      {isConnecting && (
        <div className="ds-connect-hint" style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          background: 'var(--accent)',
          color: 'white',
          borderRadius: 20,
          fontSize: 13,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          zIndex: 100,
        }}>
          Release on target node to connect, or press Escape to cancel
        </div>
      )}

      {/* Connection Toolbar - shows when exactly one connection is selected */}
      {!readOnly && selection?.connectionIds?.length === 1 && (() => {
        const selectedConn = connections.find(c => c.id === selection.connectionIds[0]);
        if (!selectedConn) return null;

        // Calculate toolbar position based on connection midpoint
        const sourceEl = elements.find(e => e.id === selectedConn.sourceId);
        const targetEl = elements.find(e => e.id === selectedConn.targetId);
        if (!sourceEl || !targetEl) return null;

        const sourceSize = sourceEl.size || { width: 120, height: 60 };
        const targetSize = targetEl.size || { width: 120, height: 60 };
        const midX = ((sourceEl.x + sourceSize.width / 2) + (targetEl.x + targetSize.width / 2)) / 2;
        const midY = ((sourceEl.y + sourceSize.height / 2) + (targetEl.y + targetSize.height / 2)) / 2;

        // Convert to screen coordinates
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return null;

        const screenX = rect.left + (midX + viewport.x) * viewport.scale;
        const screenY = rect.top + (midY + viewport.y) * viewport.scale - 60;

        return (
          <div style={{
            position: 'fixed',
            left: screenX,
            top: Math.max(60, screenY),
            transform: 'translateX(-50%)',
            zIndex: 200,
          }}>
            <ConnectionToolbar
              connection={selectedConn}
              onUpdate={(updates) => updateConnection(selectedConn.id, updates)}
              onDelete={() => {
                removeConnection(selectedConn.id);
                clearSelection();
              }}
              onAddWaypoint={() => {
                const newWaypoints = [...(selectedConn.waypoints || []), { x: midX, y: midY }];
                updateConnection(selectedConn.id, { waypoints: newWaypoints });
              }}
              onClearWaypoints={() => {
                updateConnection(selectedConn.id, { waypoints: [] });
              }}
            />
          </div>
        );
      })()}

      {/* Alignment Toolbar - shows when multiple nodes are selected */}
      {!readOnly && selection?.nodeIds?.length >= 2 && (() => {
        const selectedEls = elements.filter(el => selection.nodeIds.includes(el.id));
        if (selectedEls.length < 2) return null;

        // Calculate center of selection for toolbar position
        const minX = Math.min(...selectedEls.map(el => el.x));
        const maxX = Math.max(...selectedEls.map(el => el.x + (el.size?.width || 120)));
        const minY = Math.min(...selectedEls.map(el => el.y));

        const centerX = (minX + maxX) / 2;
        const topY = minY - 60;

        // Convert to screen coordinates
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return null;

        const screenX = rect.left + (centerX + viewport.x) * viewport.scale;
        const screenY = rect.top + (topY + viewport.y) * viewport.scale;

        return (
          <div style={{
            position: 'fixed',
            left: screenX,
            top: Math.max(60, screenY),
            transform: 'translateX(-50%)',
            zIndex: 200,
          }}>
            <AlignmentToolbar
              selectedElements={selectedEls}
              onAlign={handleAlign}
              onDistribute={handleDistribute}
              onMatchSize={handleMatchSize}
            />
          </div>
        );
      })()}

      {/* Minimap Navigator */}
      {showMinimap && (
        <Minimap
          packRegistry={packRegistry}
          containerSize={{
            width: containerRef.current?.clientWidth || 1200,
            height: containerRef.current?.clientHeight || 800,
          }}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="ds-context-menu-backdrop"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setContextMenu(null)}
          />
          <div
            className="ds-context-menu"
            style={{
              position: 'fixed',
              left: contextMenu.x,
              top: contextMenu.y,
              zIndex: 1000,
            }}
          >
            {contextMenu.items.map((item, idx) =>
              item.type === 'divider' ? (
                <div key={idx} className="ds-context-menu-divider" />
              ) : (
                <button
                  key={idx}
                  className={`ds-context-menu-item ${item.danger ? 'danger' : ''}`}
                  onClick={() => handleContextMenuAction(item.action, contextMenu.nodeEl, contextMenu.connectionEl)}
                  disabled={item.disabled}
                >
                  <span style={{ width: 20 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ============ EXPORTS ============

export { getPortPosition, getConnectionPath, snapToGrid };
