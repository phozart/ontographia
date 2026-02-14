/**
 * Geometry Utilities
 * Common geometric calculations for diagram operations
 */

/**
 * Calculate distance between two points
 * @param {{x: number, y: number}} p1
 * @param {{x: number, y: number}} p2
 * @returns {number}
 */
export function distance(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate midpoint between two points
 * @param {{x: number, y: number}} p1
 * @param {{x: number, y: number}} p2
 * @returns {{x: number, y: number}}
 */
export function midpoint(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

/**
 * Check if a point is inside a rectangle
 * @param {{x: number, y: number}} point
 * @param {{x: number, y: number, width: number, height: number}} rect
 * @returns {boolean}
 */
export function pointInRect(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Check if two rectangles intersect
 * @param {{x: number, y: number, width: number, height: number}} r1
 * @param {{x: number, y: number, width: number, height: number}} r2
 * @returns {boolean}
 */
export function rectsIntersect(r1, r2) {
  return !(
    r1.x + r1.width < r2.x ||
    r2.x + r2.width < r1.x ||
    r1.y + r1.height < r2.y ||
    r2.y + r2.height < r1.y
  );
}

/**
 * Check if r1 completely contains r2
 * @param {{x: number, y: number, width: number, height: number}} r1
 * @param {{x: number, y: number, width: number, height: number}} r2
 * @returns {boolean}
 */
export function rectContains(r1, r2) {
  return (
    r1.x <= r2.x &&
    r1.y <= r2.y &&
    r1.x + r1.width >= r2.x + r2.width &&
    r1.y + r1.height >= r2.y + r2.height
  );
}

/**
 * Calculate bounding box of multiple rectangles
 * @param {{x: number, y: number, width: number, height: number}[]} rects
 * @returns {{x: number, y: number, width: number, height: number}}
 */
export function boundingBox(rects) {
  if (rects.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  rects.forEach((rect) => {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Snap a point to a grid
 * @param {{x: number, y: number}} point
 * @param {number} gridSize
 * @returns {{x: number, y: number}}
 */
export function snapToGrid(point, gridSize) {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

/**
 * Calculate port position on an element
 * @param {{x: number, y: number, width: number, height: number}} bounds
 * @param {'top'|'right'|'bottom'|'left'|'center'} position
 * @returns {{x: number, y: number}}
 */
export function getPortPosition(bounds, position) {
  switch (position) {
    case 'top':
      return { x: bounds.x + bounds.width / 2, y: bounds.y };
    case 'right':
      return { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 };
    case 'bottom':
      return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height };
    case 'left':
      return { x: bounds.x, y: bounds.y + bounds.height / 2 };
    case 'center':
    default:
      return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  }
}

/**
 * Find the closest port on an element to a given point
 * @param {{x: number, y: number, width: number, height: number}} bounds
 * @param {{x: number, y: number}} point
 * @returns {'top'|'right'|'bottom'|'left'}
 */
export function findClosestPort(bounds, point) {
  const ports = ['top', 'right', 'bottom', 'left'];
  let closestPort = 'right';
  let closestDistance = Infinity;

  ports.forEach((port) => {
    const portPos = getPortPosition(bounds, port);
    const dist = distance(portPos, point);
    if (dist < closestDistance) {
      closestDistance = dist;
      closestPort = port;
    }
  });

  return closestPort;
}

/**
 * Rotate a point around a center point
 * @param {{x: number, y: number}} point
 * @param {{x: number, y: number}} center
 * @param {number} angleDeg - Angle in degrees
 * @returns {{x: number, y: number}}
 */
export function rotatePoint(point, center, angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

/**
 * Calculate angle between two points (in degrees)
 * @param {{x: number, y: number}} p1
 * @param {{x: number, y: number}} p2
 * @returns {number}
 */
export function angleBetween(p1, p2) {
  return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
}

/**
 * Normalize an angle to 0-360 range
 * @param {number} angle
 * @returns {number}
 */
export function normalizeAngle(angle) {
  angle = angle % 360;
  if (angle < 0) angle += 360;
  return angle;
}

/**
 * Lerp (linear interpolation) between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Lerp between two points
 * @param {{x: number, y: number}} p1
 * @param {{x: number, y: number}} p2
 * @param {number} t - Interpolation factor (0-1)
 * @returns {{x: number, y: number}}
 */
export function lerpPoint(p1, p2, t) {
  return {
    x: lerp(p1.x, p2.x, t),
    y: lerp(p1.y, p2.y, t),
  };
}

/**
 * Clamp a value between min and max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate element bounds including rotation
 * @param {{x: number, y: number, width: number, height: number}} bounds
 * @param {number} rotation - Rotation in degrees
 * @returns {{x: number, y: number, width: number, height: number}}
 */
export function getRotatedBounds(bounds, rotation) {
  if (!rotation) return bounds;

  const center = {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };

  const corners = [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { x: bounds.x, y: bounds.y + bounds.height },
  ];

  const rotatedCorners = corners.map((c) => rotatePoint(c, center, rotation));

  const xs = rotatedCorners.map((c) => c.x);
  const ys = rotatedCorners.map((c) => c.y);

  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}
