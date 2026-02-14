/**
 * Diagram Studio - Utilities Index
 * Re-exports all utility functions
 */

export {
  distance,
  midpoint,
  pointInRect,
  rectsIntersect,
  rectContains,
  boundingBox,
  snapToGrid,
  getPortPosition,
  findClosestPort,
  rotatePoint,
  angleBetween,
  normalizeAngle,
  lerp,
  lerpPoint,
  clamp,
  getRotatedBounds,
} from './geometry.js';

export {
  ROUTE_TYPES,
  straightPath,
  curvedPath,
  orthogonalPath,
  elbowPath,
  generateConnectionPath,
  getPointOnPath,
  getArrowPoints,
  getArrowMarker,
} from './routing.js';
