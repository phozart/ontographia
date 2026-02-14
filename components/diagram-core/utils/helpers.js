// components/diagram-core/utils/helpers.js
// Utility functions for DiagramCore

// Generate unique IDs
export function generateId(prefix = 'el') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
}

// Snap value to grid
export function snapToGrid(value, gridSize, threshold = 10) {
  const remainder = value % gridSize;
  if (remainder < threshold) {
    return value - remainder;
  }
  if (gridSize - remainder < threshold) {
    return value + (gridSize - remainder);
  }
  return value;
}

// Calculate bezier curve control points
// curveDirection: 1 = curve left/up, -1 = curve right/down, 0 = auto
export function getBezierControlPoints(from, to, style = 'bezier', curvature = 0.3, curveDirection = 0) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (style === 'straight') {
    return { cp1: from, cp2: to };
  }

  if (style === 'orthogonal') {
    const midX = from.x + dx / 2;
    return {
      cp1: { x: midX, y: from.y },
      cp2: { x: midX, y: to.y },
    };
  }

  if (style === 'arc') {
    // Arc/bow style - curves perpendicular to the line
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    // Calculate perpendicular offset
    const angle = Math.atan2(dy, dx);

    // Determine curve direction:
    // - If curveDirection is specified (1 or -1), use it
    // - Otherwise, auto-determine based on connection direction for consistent look
    let direction = curveDirection;
    if (direction === 0) {
      // Auto: curve outward based on the dominant direction
      // For mostly horizontal lines, curve upward; for mostly vertical, curve right
      // This creates a more natural-looking causal loop
      if (Math.abs(dx) > Math.abs(dy)) {
        // Mostly horizontal - curve based on left-to-right vs right-to-left
        direction = dx > 0 ? 1 : -1;
      } else {
        // Mostly vertical - curve based on top-to-bottom vs bottom-to-top
        direction = dy > 0 ? 1 : -1;
      }
    }

    const perpAngle = angle + (Math.PI / 2) * direction;
    const arcOffset = distance * curvature;

    // Single control point for quadratic curve creates arc
    const cpX = midX + Math.cos(perpAngle) * arcOffset;
    const cpY = midY + Math.sin(perpAngle) * arcOffset;

    return {
      cp1: { x: cpX, y: cpY },
      cp2: { x: cpX, y: cpY }, // Same point for arc
      isArc: true,
    };
  }

  // Bezier curve
  const offset = Math.min(distance * curvature, 100);
  return {
    cp1: { x: from.x + offset, y: from.y },
    cp2: { x: to.x - offset, y: to.y },
  };
}

// Generate orthogonal path with rounded corners from waypoints
function generateRoundedOrthogonalPath(waypoints, radius = 8) {
  if (waypoints.length < 2) return '';
  if (waypoints.length === 2) {
    return `M ${waypoints[0].x} ${waypoints[0].y} L ${waypoints[1].x} ${waypoints[1].y}`;
  }

  let path = `M ${waypoints[0].x} ${waypoints[0].y}`;

  for (let i = 1; i < waypoints.length - 1; i++) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    const next = waypoints[i + 1];

    // Calculate distances to adjacent points
    const distToPrev = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
    const distToNext = Math.sqrt(Math.pow(next.x - curr.x, 2) + Math.pow(next.y - curr.y, 2));

    // Adjust radius if segments are too short
    const maxRadius = Math.min(radius, distToPrev / 2, distToNext / 2);

    if (maxRadius < 2) {
      // Too short for rounding, use sharp corner
      path += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    // Calculate direction vectors
    const dirFromPrev = {
      x: (curr.x - prev.x) / distToPrev,
      y: (curr.y - prev.y) / distToPrev,
    };
    const dirToNext = {
      x: (next.x - curr.x) / distToNext,
      y: (next.y - curr.y) / distToNext,
    };

    // Calculate points where the curve starts and ends
    const curveStart = {
      x: curr.x - dirFromPrev.x * maxRadius,
      y: curr.y - dirFromPrev.y * maxRadius,
    };
    const curveEnd = {
      x: curr.x + dirToNext.x * maxRadius,
      y: curr.y + dirToNext.y * maxRadius,
    };

    // Line to curve start, then quadratic bezier with corner as control point
    path += ` L ${curveStart.x} ${curveStart.y}`;
    path += ` Q ${curr.x} ${curr.y}, ${curveEnd.x} ${curveEnd.y}`;
  }

  // Line to final point
  const last = waypoints[waypoints.length - 1];
  path += ` L ${last.x} ${last.y}`;

  return path;
}

// Generate SVG path for connection
// curveDirection: 1 = curve left/up, -1 = curve right/down, 0 = auto
// fromEdge/toEdge: optional edge info ('top', 'right', 'bottom', 'left') for smarter routing
export function generateConnectionPath(from, to, style = 'bezier', curvature = 0.3, curveDirection = 0, fromEdge = null, toEdge = null) {
  if (style === 'straight') {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  if (style === 'orthogonal') {
    // Generate orthogonal path with rounded corners
    const stubLength = 30; // How far to go straight out from element before turning
    const cornerRadius = 8; // Radius for rounded corners
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Determine exit direction from source (use provided edge or auto-detect)
    let exitDir = fromEdge || (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top'));
    // Determine entry direction to target (use provided edge or auto-detect)
    let entryDir = toEdge || (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'left' : 'right') : (dy > 0 ? 'top' : 'bottom'));

    // Calculate stub points (perpendicular exit/entry)
    let stubFrom, stubTo;
    switch (exitDir) {
      case 'top': stubFrom = { x: from.x, y: from.y - stubLength }; break;
      case 'bottom': stubFrom = { x: from.x, y: from.y + stubLength }; break;
      case 'left': stubFrom = { x: from.x - stubLength, y: from.y }; break;
      case 'right': stubFrom = { x: from.x + stubLength, y: from.y }; break;
      default: stubFrom = { x: from.x, y: from.y };
    }
    switch (entryDir) {
      case 'top': stubTo = { x: to.x, y: to.y - stubLength }; break;
      case 'bottom': stubTo = { x: to.x, y: to.y + stubLength }; break;
      case 'left': stubTo = { x: to.x - stubLength, y: to.y }; break;
      case 'right': stubTo = { x: to.x + stubLength, y: to.y }; break;
      default: stubTo = { x: to.x, y: to.y };
    }

    // Build waypoints array
    const exitVertical = exitDir === 'top' || exitDir === 'bottom';
    const entryVertical = entryDir === 'top' || entryDir === 'bottom';
    const waypoints = [from, stubFrom];

    if (exitVertical && entryVertical) {
      const midY = (stubFrom.y + stubTo.y) / 2;
      waypoints.push({ x: stubFrom.x, y: midY });
      waypoints.push({ x: stubTo.x, y: midY });
    } else if (!exitVertical && !entryVertical) {
      const midX = (stubFrom.x + stubTo.x) / 2;
      waypoints.push({ x: midX, y: stubFrom.y });
      waypoints.push({ x: midX, y: stubTo.y });
    } else {
      if (exitVertical) {
        waypoints.push({ x: stubFrom.x, y: stubTo.y });
      } else {
        waypoints.push({ x: stubTo.x, y: stubFrom.y });
      }
    }

    waypoints.push(stubTo);
    waypoints.push(to);

    // Generate path with rounded corners
    return generateRoundedOrthogonalPath(waypoints, cornerRadius);
  }

  const controlPoints = getBezierControlPoints(from, to, style, curvature, curveDirection);
  const { cp1, cp2, isArc } = controlPoints;

  if (isArc || style === 'arc') {
    // Quadratic bezier for smooth arc
    return `M ${from.x} ${from.y} Q ${cp1.x} ${cp1.y}, ${to.x} ${to.y}`;
  }

  return `M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`;
}

// Calculate orthogonal waypoints for a connection (can be modified by user)
// customWaypoints: array of middle waypoints (everything between from and to)
export function calculateOrthogonalWaypoints(from, to, fromEdge = null, toEdge = null, customWaypoints = null) {
  // If custom waypoints provided, rebuild full path with from/to
  if (customWaypoints && customWaypoints.length > 0) {
    // Custom waypoints are the middle points - add from at start and to at end
    return [from, ...customWaypoints, to];
  }

  const stubLength = 30;
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  let exitDir = fromEdge || (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top'));
  let entryDir = toEdge || (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'left' : 'right') : (dy > 0 ? 'top' : 'bottom'));

  let stubFrom, stubTo;
  switch (exitDir) {
    case 'top': stubFrom = { x: from.x, y: from.y - stubLength }; break;
    case 'bottom': stubFrom = { x: from.x, y: from.y + stubLength }; break;
    case 'left': stubFrom = { x: from.x - stubLength, y: from.y }; break;
    case 'right': stubFrom = { x: from.x + stubLength, y: from.y }; break;
    default: stubFrom = { x: from.x, y: from.y };
  }
  switch (entryDir) {
    case 'top': stubTo = { x: to.x, y: to.y - stubLength }; break;
    case 'bottom': stubTo = { x: to.x, y: to.y + stubLength }; break;
    case 'left': stubTo = { x: to.x - stubLength, y: to.y }; break;
    case 'right': stubTo = { x: to.x + stubLength, y: to.y }; break;
    default: stubTo = { x: to.x, y: to.y };
  }

  const exitVertical = exitDir === 'top' || exitDir === 'bottom';
  const entryVertical = entryDir === 'top' || entryDir === 'bottom';
  const waypoints = [from, stubFrom];

  if (exitVertical && entryVertical) {
    const midY = (stubFrom.y + stubTo.y) / 2;
    waypoints.push({ x: stubFrom.x, y: midY });
    waypoints.push({ x: stubTo.x, y: midY });
  } else if (!exitVertical && !entryVertical) {
    const midX = (stubFrom.x + stubTo.x) / 2;
    waypoints.push({ x: midX, y: stubFrom.y });
    waypoints.push({ x: midX, y: stubTo.y });
  } else {
    if (exitVertical) {
      waypoints.push({ x: stubFrom.x, y: stubTo.y });
    } else {
      waypoints.push({ x: stubTo.x, y: stubFrom.y });
    }
  }

  waypoints.push(stubTo);
  waypoints.push(to);
  return waypoints;
}

// Generate path from custom waypoints (with rounded corners)
export function generatePathFromWaypoints(waypoints, cornerRadius = 8) {
  return generateRoundedOrthogonalPath(waypoints, cornerRadius);
}

// Get port position on element
// portId can be:
// - string: 'top', 'right', 'bottom', 'left', 'center' (midpoint)
// - object: { edge: 'top'|'right'|'bottom'|'left', offset: 0-1 } (percentage along edge)
// - object: { x: number, y: number } (absolute position, clamped to element bounds)
export function getPortPosition(element, portId) {
  const { x, y, width, height } = element;
  const cx = x + width / 2;
  const cy = y + height / 2;

  // Handle object-based port positions
  if (typeof portId === 'object' && portId !== null) {
    // Edge + offset format
    if (portId.edge && portId.offset !== undefined) {
      const offset = Math.max(0, Math.min(1, portId.offset)); // Clamp to 0-1
      switch (portId.edge) {
        case 'top':
          return { x: x + width * offset, y, edge: 'top' };
        case 'right':
          return { x: x + width, y: y + height * offset, edge: 'right' };
        case 'bottom':
          return { x: x + width * offset, y: y + height, edge: 'bottom' };
        case 'left':
          return { x, y: y + height * offset, edge: 'left' };
        default:
          return { x: cx, y: cy, edge: 'center' };
      }
    }
    // Absolute position format - find nearest edge point
    if (portId.x !== undefined && portId.y !== undefined) {
      return getEdgePointFromPosition(element, portId);
    }
  }

  // Named port positions (midpoints)
  switch (portId) {
    case 'top':
      return { x: cx, y, edge: 'top' };
    case 'right':
      return { x: x + width, y: cy, edge: 'right' };
    case 'bottom':
      return { x: cx, y: y + height, edge: 'bottom' };
    case 'left':
      return { x, y: cy, edge: 'left' };
    case 'center':
      return { x: cx, y: cy, edge: 'center' };
    default:
      return { x: cx, y: cy, edge: 'center' };
  }
}

// Offset a port position outward from the element edge (for marker visibility)
// Always offsets perpendicular to the edge for consistent arrow visibility
export function offsetPortPosition(pos, targetPos, offset = 15) {
  // Always offset perpendicular to the element edge
  // This ensures arrows are visible regardless of the curve direction
  if (pos.edge) {
    switch (pos.edge) {
      case 'top': return { ...pos, y: pos.y - offset };
      case 'right': return { ...pos, x: pos.x + offset };
      case 'bottom': return { ...pos, y: pos.y + offset };
      case 'left': return { ...pos, x: pos.x - offset };
    }
  }

  // Fallback: offset along line direction if no edge info
  const dx = pos.x - targetPos.x;
  const dy = pos.y - targetPos.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  if (len === 0) return pos;

  return {
    x: pos.x + (dx / len) * offset,
    y: pos.y + (dy / len) * offset,
  };
}

// Get the nearest point on element edge from an arbitrary position
export function getEdgePointFromPosition(element, point) {
  const { x, y, width, height } = element;
  const cx = x + width / 2;
  const cy = y + height / 2;

  // Calculate angle from center to point
  const dx = point.x - cx;
  const dy = point.y - cy;
  const angle = Math.atan2(dy, dx);

  // Determine which edge to intersect based on angle
  const aspectRatio = width / height;
  const normalizedAngle = Math.abs(Math.atan(dy / (dx || 0.001)));
  const diagonalAngle = Math.atan(1 / aspectRatio);

  let edgeX, edgeY;

  if (normalizedAngle < diagonalAngle) {
    // Intersects left or right edge
    if (dx >= 0) {
      // Right edge
      edgeX = x + width;
      edgeY = cy + (width / 2) * Math.tan(angle);
    } else {
      // Left edge
      edgeX = x;
      edgeY = cy - (width / 2) * Math.tan(angle);
    }
  } else {
    // Intersects top or bottom edge
    if (dy >= 0) {
      // Bottom edge
      edgeY = y + height;
      edgeX = cx + (height / 2) / Math.tan(angle);
    } else {
      // Top edge
      edgeY = y;
      edgeX = cx - (height / 2) / Math.tan(angle);
    }
  }

  // Clamp to element bounds
  edgeX = Math.max(x, Math.min(x + width, edgeX));
  edgeY = Math.max(y, Math.min(y + height, edgeY));

  return { x: edgeX, y: edgeY };
}

// Find nearest port to a point
export function findNearestPort(element, point, ports = ['top', 'right', 'bottom', 'left']) {
  let nearestPort = ports[0];
  let minDistance = Infinity;

  ports.forEach(portId => {
    const portPos = getPortPosition(element, portId);
    const dist = Math.sqrt(
      Math.pow(portPos.x - point.x, 2) +
      Math.pow(portPos.y - point.y, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearestPort = portId;
    }
  });

  return nearestPort;
}

// Get element bounds
export function getElementBounds(element) {
  return {
    left: element.x,
    top: element.y,
    right: element.x + (element.width || element.size?.width || 100),
    bottom: element.y + (element.height || element.size?.height || 50),
    width: element.width || element.size?.width || 100,
    height: element.height || element.size?.height || 50,
  };
}

// Check if point is inside element
export function isPointInElement(point, element) {
  const bounds = getElementBounds(element);
  return (
    point.x >= bounds.left &&
    point.x <= bounds.right &&
    point.y >= bounds.top &&
    point.y <= bounds.bottom
  );
}

// Calculate bounding box for multiple elements
export function getBoundingBox(elements) {
  if (!elements.length) return null;

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  elements.forEach(el => {
    const bounds = getElementBounds(el);
    minX = Math.min(minX, bounds.left);
    minY = Math.min(minY, bounds.top);
    maxX = Math.max(maxX, bounds.right);
    maxY = Math.max(maxY, bounds.bottom);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// Auto-position new element
export function autoPosition(elements, stencil, canvasConfig, offset = { x: 100, y: 100 }) {
  const size = stencil?.defaultSize || { width: 120, height: 60 };

  // Find empty spot
  if (!elements || elements.length === 0) {
    return {
      x: offset.x,
      y: offset.y,
    };
  }

  // Get canvas width - handle 'auto' or missing values
  let canvasWidth = canvasConfig?.width;
  if (!canvasWidth || canvasWidth === 'auto' || typeof canvasWidth !== 'number') {
    canvasWidth = canvasConfig?.minWidth || 800;
  }

  // Grid-based placement
  const cellWidth = size.width + 40;
  const cellHeight = size.height + 40;
  const cols = Math.max(1, Math.floor(canvasWidth / cellWidth));
  const row = Math.floor(elements.length / cols);
  const col = elements.length % cols;

  return {
    x: offset.x + col * cellWidth,
    y: offset.y + row * cellHeight,
  };
}

// Check if a line segment intersects with a rectangle (with padding)
export function lineIntersectsRect(p1, p2, rect, padding = 10) {
  const left = rect.x - padding;
  const top = rect.y - padding;
  const right = rect.x + rect.width + padding;
  const bottom = rect.y + rect.height + padding;

  // Check if line endpoints are both on one side of the rectangle
  if ((p1.x < left && p2.x < left) || (p1.x > right && p2.x > right)) return false;
  if ((p1.y < top && p2.y < top) || (p1.y > bottom && p2.y > bottom)) return false;

  // Check if line crosses the rectangle edges
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  // Parametric line: p1 + t * (p2 - p1), t in [0, 1]
  let tMin = 0;
  let tMax = 1;

  // Check against each edge
  if (dx !== 0) {
    const t1 = (left - p1.x) / dx;
    const t2 = (right - p1.x) / dx;
    const tEnter = Math.min(t1, t2);
    const tExit = Math.max(t1, t2);
    tMin = Math.max(tMin, tEnter);
    tMax = Math.min(tMax, tExit);
  } else if (p1.x < left || p1.x > right) {
    return false;
  }

  if (dy !== 0) {
    const t1 = (top - p1.y) / dy;
    const t2 = (bottom - p1.y) / dy;
    const tEnter = Math.min(t1, t2);
    const tExit = Math.max(t1, t2);
    tMin = Math.max(tMin, tEnter);
    tMax = Math.min(tMax, tExit);
  } else if (p1.y < top || p1.y > bottom) {
    return false;
  }

  return tMin <= tMax;
}

// Find obstacles between two points (excluding source and target elements)
export function findObstacles(from, to, elements, excludeIds = []) {
  const obstacles = [];
  if (!elements || !Array.isArray(elements)) return obstacles;

  const padding = 15;

  for (const el of elements) {
    if (!el || !el.id) continue;
    if (excludeIds.includes(el.id)) continue;

    const rect = {
      x: el.x || 0,
      y: el.y || 0,
      width: el.width || 100,
      height: el.height || 50,
    };

    if (lineIntersectsRect(from, to, rect, padding)) {
      obstacles.push({ ...el, ...rect });
    }
  }

  return obstacles;
}

// Generate orthogonal path around obstacles
export function generateRoutedPath(from, to, obstacles, style = 'orthogonal') {
  if (obstacles.length === 0) {
    return null; // No routing needed
  }

  const padding = 20;

  // Sort obstacles by distance from start
  obstacles.sort((a, b) => {
    const distA = Math.sqrt(Math.pow(a.x - from.x, 2) + Math.pow(a.y - from.y, 2));
    const distB = Math.sqrt(Math.pow(b.x - from.x, 2) + Math.pow(b.y - from.y, 2));
    return distA - distB;
  });

  // Calculate waypoints around obstacles
  const waypoints = [from];
  let current = from;

  for (const obstacle of obstacles) {
    const rect = {
      left: obstacle.x - padding,
      top: obstacle.y - padding,
      right: obstacle.x + obstacle.width + padding,
      bottom: obstacle.y + obstacle.height + padding,
    };

    // Determine best side to go around
    const toTarget = { x: to.x - current.x, y: to.y - current.y };
    const toCenterX = obstacle.x + obstacle.width / 2 - current.x;
    const toCenterY = obstacle.y + obstacle.height / 2 - current.y;

    // Choose horizontal or vertical routing based on path direction
    const goHorizontal = Math.abs(toTarget.x) > Math.abs(toTarget.y);

    if (goHorizontal) {
      // Route vertically around obstacle
      const goAbove = current.y < obstacle.y + obstacle.height / 2;
      const routeY = goAbove ? rect.top : rect.bottom;

      // First waypoint: move to obstacle edge vertically
      waypoints.push({ x: current.x, y: routeY });
      // Second waypoint: move past obstacle horizontally
      const exitX = toTarget.x > 0 ? rect.right : rect.left;
      waypoints.push({ x: exitX, y: routeY });
      current = { x: exitX, y: routeY };
    } else {
      // Route horizontally around obstacle
      const goLeft = current.x < obstacle.x + obstacle.width / 2;
      const routeX = goLeft ? rect.left : rect.right;

      // First waypoint: move to obstacle edge horizontally
      waypoints.push({ x: routeX, y: current.y });
      // Second waypoint: move past obstacle vertically
      const exitY = toTarget.y > 0 ? rect.bottom : rect.top;
      waypoints.push({ x: routeX, y: exitY });
      current = { x: routeX, y: exitY };
    }
  }

  waypoints.push(to);

  // Generate path based on style
  if (style === 'orthogonal') {
    return generateOrthogonalPathFromWaypoints(waypoints);
  } else {
    return generateSmoothPathFromWaypoints(waypoints);
  }
}

// Generate orthogonal SVG path from waypoints
function generateOrthogonalPathFromWaypoints(waypoints) {
  if (waypoints.length < 2) return null;

  let path = `M ${waypoints[0].x} ${waypoints[0].y}`;
  for (let i = 1; i < waypoints.length; i++) {
    path += ` L ${waypoints[i].x} ${waypoints[i].y}`;
  }
  return path;
}

// Generate smooth curved path from waypoints
function generateSmoothPathFromWaypoints(waypoints) {
  if (waypoints.length < 2) return null;
  if (waypoints.length === 2) {
    const [from, to] = waypoints;
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }

  // Use quadratic bezier curves for smooth corners
  let path = `M ${waypoints[0].x} ${waypoints[0].y}`;

  for (let i = 1; i < waypoints.length - 1; i++) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    const next = waypoints[i + 1];

    // Calculate corner radius (smaller of half-distances)
    const distToPrev = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
    const distToNext = Math.sqrt(Math.pow(next.x - curr.x, 2) + Math.pow(next.y - curr.y, 2));
    const radius = Math.min(20, distToPrev / 2, distToNext / 2);

    // Calculate points before and after the corner
    const toPrev = { x: (prev.x - curr.x) / distToPrev, y: (prev.y - curr.y) / distToPrev };
    const toNext = { x: (next.x - curr.x) / distToNext, y: (next.y - curr.y) / distToNext };

    const beforeCorner = { x: curr.x + toPrev.x * radius, y: curr.y + toPrev.y * radius };
    const afterCorner = { x: curr.x + toNext.x * radius, y: curr.y + toNext.y * radius };

    path += ` L ${beforeCorner.x} ${beforeCorner.y}`;
    path += ` Q ${curr.x} ${curr.y}, ${afterCorner.x} ${afterCorner.y}`;
  }

  // Final segment
  const last = waypoints[waypoints.length - 1];
  path += ` L ${last.x} ${last.y}`;

  return path;
}

// Enhanced path generation with auto-routing
export function generateRoutedConnectionPath(from, to, elements, excludeIds, style = 'bezier', curvature = 0.3) {
  // Safety checks - fallback to regular path if inputs are invalid
  if (!from || !to || !elements || !Array.isArray(elements)) {
    return generateConnectionPath(from, to, style, curvature);
  }

  // Only apply routing for non-straight styles
  if (style === 'straight') {
    return generateConnectionPath(from, to, style, curvature);
  }

  try {
    // Find obstacles in the path
    const obstacles = findObstacles(from, to, elements, excludeIds || []);

    if (obstacles.length === 0) {
      // No obstacles, use regular path
      return generateConnectionPath(from, to, style, curvature);
    }

    // Generate routed path
    const routedPath = generateRoutedPath(from, to, obstacles, style);
    if (routedPath) {
      return routedPath;
    }
  } catch (e) {
    // On any error, fallback to regular path
    console.warn('Auto-routing failed, using direct path:', e);
  }

  // Fallback to regular path
  return generateConnectionPath(from, to, style, curvature);
}

// Color utilities
export function hexToRgba(hex, alpha = 1) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
}

// Lighten/darken color
export function adjustColor(hex, amount) {
  const clamp = (val) => Math.min(255, Math.max(0, val));

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  const r = clamp(parseInt(result[1], 16) + amount);
  const g = clamp(parseInt(result[2], 16) + amount);
  const b = clamp(parseInt(result[3], 16) + amount);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default {
  generateId,
  snapToGrid,
  getBezierControlPoints,
  generateConnectionPath,
  generateRoutedConnectionPath,
  getPortPosition,
  offsetPortPosition,
  getEdgePointFromPosition,
  findNearestPort,
  getElementBounds,
  isPointInElement,
  getBoundingBox,
  autoPosition,
  lineIntersectsRect,
  findObstacles,
  generateRoutedPath,
  hexToRgba,
  adjustColor,
};
