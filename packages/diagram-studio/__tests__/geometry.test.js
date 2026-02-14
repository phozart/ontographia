/**
 * Tests for geometry utilities
 */

import {
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
} from '../src/utils/geometry.js';

describe('Geometry Utilities', () => {
  describe('distance', () => {
    it('should calculate distance between two points', () => {
      expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
      expect(distance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
      expect(distance({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(1);
    });
  });

  describe('midpoint', () => {
    it('should calculate midpoint between two points', () => {
      expect(midpoint({ x: 0, y: 0 }, { x: 10, y: 10 })).toEqual({ x: 5, y: 5 });
      expect(midpoint({ x: -5, y: 5 }, { x: 5, y: -5 })).toEqual({ x: 0, y: 0 });
    });
  });

  describe('pointInRect', () => {
    const rect = { x: 0, y: 0, width: 100, height: 100 };

    it('should return true for points inside rectangle', () => {
      expect(pointInRect({ x: 50, y: 50 }, rect)).toBe(true);
      expect(pointInRect({ x: 0, y: 0 }, rect)).toBe(true);
      expect(pointInRect({ x: 100, y: 100 }, rect)).toBe(true);
    });

    it('should return false for points outside rectangle', () => {
      expect(pointInRect({ x: -1, y: 50 }, rect)).toBe(false);
      expect(pointInRect({ x: 50, y: 101 }, rect)).toBe(false);
    });
  });

  describe('rectsIntersect', () => {
    it('should return true for overlapping rectangles', () => {
      const r1 = { x: 0, y: 0, width: 100, height: 100 };
      const r2 = { x: 50, y: 50, width: 100, height: 100 };
      expect(rectsIntersect(r1, r2)).toBe(true);
    });

    it('should return false for non-overlapping rectangles', () => {
      const r1 = { x: 0, y: 0, width: 100, height: 100 };
      const r2 = { x: 200, y: 200, width: 100, height: 100 };
      expect(rectsIntersect(r1, r2)).toBe(false);
    });

    it('should return true for touching rectangles', () => {
      const r1 = { x: 0, y: 0, width: 100, height: 100 };
      const r2 = { x: 100, y: 0, width: 100, height: 100 };
      expect(rectsIntersect(r1, r2)).toBe(true);
    });
  });

  describe('rectContains', () => {
    it('should return true when first rect contains second', () => {
      const outer = { x: 0, y: 0, width: 200, height: 200 };
      const inner = { x: 50, y: 50, width: 50, height: 50 };
      expect(rectContains(outer, inner)).toBe(true);
    });

    it('should return false when first rect does not contain second', () => {
      const r1 = { x: 0, y: 0, width: 100, height: 100 };
      const r2 = { x: 50, y: 50, width: 100, height: 100 };
      expect(rectContains(r1, r2)).toBe(false);
    });
  });

  describe('boundingBox', () => {
    it('should calculate bounding box of multiple rectangles', () => {
      const rects = [
        { x: 0, y: 0, width: 50, height: 50 },
        { x: 100, y: 100, width: 50, height: 50 },
      ];
      expect(boundingBox(rects)).toEqual({ x: 0, y: 0, width: 150, height: 150 });
    });

    it('should return zero rect for empty array', () => {
      expect(boundingBox([])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });

    it('should handle single rectangle', () => {
      const rects = [{ x: 10, y: 20, width: 30, height: 40 }];
      expect(boundingBox(rects)).toEqual({ x: 10, y: 20, width: 30, height: 40 });
    });
  });

  describe('snapToGrid', () => {
    it('should snap point to nearest grid intersection', () => {
      expect(snapToGrid({ x: 12, y: 18 }, 20)).toEqual({ x: 20, y: 20 });
      expect(snapToGrid({ x: 8, y: 3 }, 20)).toEqual({ x: 0, y: 0 });
      expect(snapToGrid({ x: 25, y: 35 }, 10)).toEqual({ x: 30, y: 40 });
    });
  });

  describe('getPortPosition', () => {
    const bounds = { x: 100, y: 100, width: 100, height: 50 };

    it('should return correct position for each port', () => {
      expect(getPortPosition(bounds, 'top')).toEqual({ x: 150, y: 100 });
      expect(getPortPosition(bounds, 'right')).toEqual({ x: 200, y: 125 });
      expect(getPortPosition(bounds, 'bottom')).toEqual({ x: 150, y: 150 });
      expect(getPortPosition(bounds, 'left')).toEqual({ x: 100, y: 125 });
      expect(getPortPosition(bounds, 'center')).toEqual({ x: 150, y: 125 });
    });
  });

  describe('findClosestPort', () => {
    const bounds = { x: 100, y: 100, width: 100, height: 100 };

    it('should find closest port to a point', () => {
      expect(findClosestPort(bounds, { x: 150, y: 50 })).toBe('top');
      expect(findClosestPort(bounds, { x: 250, y: 150 })).toBe('right');
      expect(findClosestPort(bounds, { x: 150, y: 250 })).toBe('bottom');
      expect(findClosestPort(bounds, { x: 50, y: 150 })).toBe('left');
    });
  });

  describe('rotatePoint', () => {
    it('should rotate point around center', () => {
      const point = { x: 100, y: 0 };
      const center = { x: 0, y: 0 };

      const rotated90 = rotatePoint(point, center, 90);
      expect(rotated90.x).toBeCloseTo(0, 10);
      expect(rotated90.y).toBeCloseTo(100, 10);

      const rotated180 = rotatePoint(point, center, 180);
      expect(rotated180.x).toBeCloseTo(-100, 10);
      expect(rotated180.y).toBeCloseTo(0, 10);
    });

    it('should return same point for 0 degree rotation', () => {
      const point = { x: 50, y: 50 };
      const center = { x: 0, y: 0 };
      const rotated = rotatePoint(point, center, 0);

      expect(rotated.x).toBeCloseTo(50, 10);
      expect(rotated.y).toBeCloseTo(50, 10);
    });
  });

  describe('angleBetween', () => {
    it('should calculate angle between two points', () => {
      expect(angleBetween({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(0);
      expect(angleBetween({ x: 0, y: 0 }, { x: 0, y: 1 })).toBe(90);
      expect(angleBetween({ x: 0, y: 0 }, { x: -1, y: 0 })).toBe(180);
      expect(angleBetween({ x: 0, y: 0 }, { x: 0, y: -1 })).toBe(-90);
    });
  });

  describe('normalizeAngle', () => {
    it('should normalize angle to 0-360 range', () => {
      expect(normalizeAngle(0)).toBe(0);
      expect(normalizeAngle(360)).toBe(0);
      expect(normalizeAngle(450)).toBe(90);
      expect(normalizeAngle(-90)).toBe(270);
      expect(normalizeAngle(-450)).toBe(270);
    });
  });

  describe('lerp', () => {
    it('should linearly interpolate between two values', () => {
      expect(lerp(0, 100, 0)).toBe(0);
      expect(lerp(0, 100, 1)).toBe(100);
      expect(lerp(0, 100, 0.5)).toBe(50);
      expect(lerp(10, 20, 0.25)).toBe(12.5);
    });
  });

  describe('lerpPoint', () => {
    it('should linearly interpolate between two points', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 100, y: 100 };

      expect(lerpPoint(p1, p2, 0)).toEqual({ x: 0, y: 0 });
      expect(lerpPoint(p1, p2, 1)).toEqual({ x: 100, y: 100 });
      expect(lerpPoint(p1, p2, 0.5)).toEqual({ x: 50, y: 50 });
    });
  });

  describe('clamp', () => {
    it('should clamp value between min and max', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('getRotatedBounds', () => {
    it('should return same bounds for 0 rotation', () => {
      const bounds = { x: 0, y: 0, width: 100, height: 50 };
      expect(getRotatedBounds(bounds, 0)).toEqual(bounds);
    });

    it('should return larger bounds for rotated rectangle', () => {
      const bounds = { x: 0, y: 0, width: 100, height: 50 };
      const rotated = getRotatedBounds(bounds, 45);

      // Rotated bounds should be larger
      expect(rotated.width).toBeGreaterThan(bounds.width);
      expect(rotated.height).toBeGreaterThan(bounds.height);
    });
  });
});
