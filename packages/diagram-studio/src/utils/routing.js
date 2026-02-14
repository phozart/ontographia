/**
 * Connection Routing Utilities
 * Algorithms for routing connections between elements
 */

import { getPortPosition, distance } from './geometry.js';

/**
 * Route types
 */
export const ROUTE_TYPES = {
  STRAIGHT: 'straight',
  ORTHOGONAL: 'orthogonal',
  CURVED: 'curved',
  ELBOW: 'elbow',
};

/**
 * Generate a straight line path between two points
 * @param {{x: number, y: number}} start
 * @param {{x: number, y: number}} end
 * @returns {string} SVG path string
 */
export function straightPath(start, end) {
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
}

/**
 * Generate a curved (bezier) path between two points
 * @param {{x: number, y: number}} start
 * @param {{x: number, y: number}} end
 * @param {number} curvature - Curve intensity (default: 0.5)
 * @returns {string} SVG path string
 */
export function curvedPath(start, end, curvature = 0.5) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const offset = dist * curvature;

  // Control points extend horizontally from start/end
  const cp1 = { x: start.x + offset, y: start.y };
  const cp2 = { x: end.x - offset, y: end.y };

  return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
}

/**
 * Generate an orthogonal (right-angle) path between two points
 * @param {{x: number, y: number}} start
 * @param {'top'|'right'|'bottom'|'left'} startPort
 * @param {{x: number, y: number}} end
 * @param {'top'|'right'|'bottom'|'left'} endPort
 * @param {number} margin - Minimum margin from elements (default: 20)
 * @returns {string} SVG path string
 */
export function orthogonalPath(start, startPort, end, endPort, margin = 20) {
  const points = [start];

  // Determine direction based on ports
  const startDir = getPortDirection(startPort);
  const endDir = getPortDirection(endPort);

  // Calculate intermediate points
  if (startDir.dx !== 0 && endDir.dy !== 0) {
    // Horizontal start, vertical end
    const midX = startDir.dx > 0 ? Math.max(start.x + margin, end.x) : Math.min(start.x - margin, end.x);
    points.push({ x: midX, y: start.y });
    points.push({ x: midX, y: end.y });
  } else if (startDir.dy !== 0 && endDir.dx !== 0) {
    // Vertical start, horizontal end
    const midY = startDir.dy > 0 ? Math.max(start.y + margin, end.y) : Math.min(start.y - margin, end.y);
    points.push({ x: start.x, y: midY });
    points.push({ x: end.x, y: midY });
  } else if (startDir.dx !== 0 && endDir.dx !== 0) {
    // Both horizontal
    const midX = (start.x + end.x) / 2;
    points.push({ x: midX, y: start.y });
    points.push({ x: midX, y: end.y });
  } else {
    // Both vertical
    const midY = (start.y + end.y) / 2;
    points.push({ x: start.x, y: midY });
    points.push({ x: end.x, y: midY });
  }

  points.push(end);

  // Build path string
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  return path;
}

/**
 * Generate an elbow path (one bend) between two points
 * @param {{x: number, y: number}} start
 * @param {'top'|'right'|'bottom'|'left'} startPort
 * @param {{x: number, y: number}} end
 * @param {'top'|'right'|'bottom'|'left'} endPort
 * @returns {string} SVG path string
 */
export function elbowPath(start, startPort, end, endPort) {
  const startDir = getPortDirection(startPort);

  let mid;
  if (startDir.dx !== 0) {
    // Horizontal start
    mid = { x: end.x, y: start.y };
  } else {
    // Vertical start
    mid = { x: start.x, y: end.y };
  }

  return `M ${start.x} ${start.y} L ${mid.x} ${mid.y} L ${end.x} ${end.y}`;
}

/**
 * Get direction vector for a port position
 * @param {'top'|'right'|'bottom'|'left'} port
 * @returns {{dx: number, dy: number}}
 */
function getPortDirection(port) {
  switch (port) {
    case 'top':
      return { dx: 0, dy: -1 };
    case 'right':
      return { dx: 1, dy: 0 };
    case 'bottom':
      return { dx: 0, dy: 1 };
    case 'left':
      return { dx: -1, dy: 0 };
    default:
      return { dx: 1, dy: 0 };
  }
}

/**
 * Generate path for a connection
 * @param {Object} connection - Connection object
 * @param {Object} sourceElement - Source element
 * @param {Object} targetElement - Target element
 * @param {string} routeType - Type of routing
 * @returns {string} SVG path string
 */
export function generateConnectionPath(connection, sourceElement, targetElement, routeType = ROUTE_TYPES.CURVED) {
  const sourceBounds = {
    x: sourceElement.position.x,
    y: sourceElement.position.y,
    width: sourceElement.size.width,
    height: sourceElement.size.height,
  };

  const targetBounds = {
    x: targetElement.position.x,
    y: targetElement.position.y,
    width: targetElement.size.width,
    height: targetElement.size.height,
  };

  const start = getPortPosition(sourceBounds, connection.sourcePort);
  const end = getPortPosition(targetBounds, connection.targetPort);

  // If there are waypoints, use them
  if (connection.waypoints && connection.waypoints.length > 0) {
    let path = `M ${start.x} ${start.y}`;
    connection.waypoints.forEach((wp) => {
      path += ` L ${wp.x} ${wp.y}`;
    });
    path += ` L ${end.x} ${end.y}`;
    return path;
  }

  // Generate based on route type
  switch (routeType) {
    case ROUTE_TYPES.STRAIGHT:
      return straightPath(start, end);
    case ROUTE_TYPES.ORTHOGONAL:
      return orthogonalPath(start, connection.sourcePort, end, connection.targetPort);
    case ROUTE_TYPES.ELBOW:
      return elbowPath(start, connection.sourcePort, end, connection.targetPort);
    case ROUTE_TYPES.CURVED:
    default:
      return curvedPath(start, end);
  }
}

/**
 * Calculate point along a path at given percentage
 * @param {SVGPathElement} pathElement - SVG path element
 * @param {number} t - Position along path (0-1)
 * @returns {{x: number, y: number}}
 */
export function getPointOnPath(pathElement, t) {
  if (!pathElement) return { x: 0, y: 0 };

  const length = pathElement.getTotalLength();
  const point = pathElement.getPointAtLength(length * t);
  return { x: point.x, y: point.y };
}

/**
 * Calculate arrow head points
 * @param {{x: number, y: number}} tip - Arrow tip position
 * @param {{x: number, y: number}} base - Arrow base position (for direction)
 * @param {number} size - Arrow size
 * @param {number} angle - Arrow angle in degrees
 * @returns {string} SVG polygon points
 */
export function getArrowPoints(tip, base, size = 10, angle = 30) {
  const dx = tip.x - base.x;
  const dy = tip.y - base.y;
  const lineAngle = Math.atan2(dy, dx);

  const radAngle = (angle * Math.PI) / 180;

  const p1 = {
    x: tip.x - size * Math.cos(lineAngle - radAngle),
    y: tip.y - size * Math.sin(lineAngle - radAngle),
  };

  const p2 = {
    x: tip.x - size * Math.cos(lineAngle + radAngle),
    y: tip.y - size * Math.sin(lineAngle + radAngle),
  };

  return `${tip.x},${tip.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`;
}

/**
 * Get SVG marker definition for arrow type
 * @param {'none'|'arrow'|'diamond'|'diamond-filled'|'circle'|'circle-filled'} type
 * @param {string} color
 * @param {string} id
 * @returns {string} SVG marker element string
 */
export function getArrowMarker(type, color, id) {
  switch (type) {
    case 'arrow':
      return `
        <marker id="${id}" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="${color}" />
        </marker>
      `;
    case 'diamond':
      return `
        <marker id="${id}" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,5 L5,0 L10,5 L5,10 z" fill="none" stroke="${color}" stroke-width="1" />
        </marker>
      `;
    case 'diamond-filled':
      return `
        <marker id="${id}" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth">
          <path d="M0,5 L5,0 L10,5 L5,10 z" fill="${color}" />
        </marker>
      `;
    case 'circle':
      return `
        <marker id="${id}" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth">
          <circle cx="5" cy="5" r="4" fill="none" stroke="${color}" stroke-width="1" />
        </marker>
      `;
    case 'circle-filled':
      return `
        <marker id="${id}" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth">
          <circle cx="5" cy="5" r="4" fill="${color}" />
        </marker>
      `;
    default:
      return '';
  }
}
