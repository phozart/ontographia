/**
 * useViewportCulling Hook
 * Efficiently filters elements to only render those visible in the viewport
 */

import { useMemo, useCallback } from 'react';

/**
 * Default buffer size in pixels (at scale 1) around viewport for smooth panning
 */
const DEFAULT_BUFFER = 200;

/**
 * Calculate viewport bounds with optional buffer
 */
function getViewportBounds(viewport, containerSize, buffer = DEFAULT_BUFFER) {
  const scale = viewport.zoom || viewport.scale || 1;
  const scaledBuffer = buffer / scale;

  return {
    minX: -viewport.x / scale - scaledBuffer,
    minY: -viewport.y / scale - scaledBuffer,
    maxX: -viewport.x / scale + containerSize.width / scale + scaledBuffer,
    maxY: -viewport.y / scale + containerSize.height / scale + scaledBuffer,
  };
}

/**
 * Check if an element intersects with viewport bounds
 */
function elementIntersectsViewport(element, bounds) {
  const pos = element.position || { x: 0, y: 0 };
  const size = element.size || { width: 100, height: 100 };

  return (
    pos.x + size.width >= bounds.minX &&
    pos.x <= bounds.maxX &&
    pos.y + size.height >= bounds.minY &&
    pos.y <= bounds.maxY
  );
}

/**
 * Check if a connection intersects with viewport bounds
 * Uses bounding box of source and target positions
 */
function connectionIntersectsViewport(connection, elements, bounds) {
  const source = elements[connection.sourceId];
  const target = elements[connection.targetId];

  if (!source || !target) return false;

  const sourcePos = source.position || { x: 0, y: 0 };
  const sourceSize = source.size || { width: 100, height: 100 };
  const targetPos = target.position || { x: 0, y: 0 };
  const targetSize = target.size || { width: 100, height: 100 };

  // Calculate connection bounding box
  const connBounds = {
    minX: Math.min(sourcePos.x, targetPos.x),
    minY: Math.min(sourcePos.y, targetPos.y),
    maxX: Math.max(sourcePos.x + sourceSize.width, targetPos.x + targetSize.width),
    maxY: Math.max(sourcePos.y + sourceSize.height, targetPos.y + targetSize.height),
  };

  // Check if connection bounds intersect viewport
  return (
    connBounds.maxX >= bounds.minX &&
    connBounds.minX <= bounds.maxX &&
    connBounds.maxY >= bounds.minY &&
    connBounds.minY <= bounds.maxY
  );
}

/**
 * Hook for viewport culling of elements
 * Returns only elements visible within the current viewport
 */
export function useViewportCulling(
  elements,
  viewport,
  options = {}
) {
  const {
    buffer = DEFAULT_BUFFER,
    containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1920,
    containerHeight = typeof window !== 'undefined' ? window.innerHeight : 1080,
    enabled = true,
  } = options;

  const containerSize = useMemo(
    () => ({ width: containerWidth, height: containerHeight }),
    [containerWidth, containerHeight]
  );

  const visibleElements = useMemo(() => {
    if (!enabled || !elements) {
      return Array.isArray(elements) ? elements : Object.values(elements || {});
    }

    const elementList = Array.isArray(elements) ? elements : Object.values(elements);
    const bounds = getViewportBounds(viewport, containerSize, buffer);

    return elementList.filter((element) => elementIntersectsViewport(element, bounds));
  }, [elements, viewport.x, viewport.y, viewport.zoom, viewport.scale, containerSize, buffer, enabled]);

  return visibleElements;
}

/**
 * Hook for viewport culling of connections
 */
export function useConnectionCulling(
  connections,
  elements,
  viewport,
  options = {}
) {
  const {
    buffer = DEFAULT_BUFFER,
    containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1920,
    containerHeight = typeof window !== 'undefined' ? window.innerHeight : 1080,
    enabled = true,
  } = options;

  const containerSize = useMemo(
    () => ({ width: containerWidth, height: containerHeight }),
    [containerWidth, containerHeight]
  );

  const elementMap = useMemo(() => {
    if (Array.isArray(elements)) {
      return elements.reduce((acc, el) => ({ ...acc, [el.id]: el }), {});
    }
    return elements || {};
  }, [elements]);

  const visibleConnections = useMemo(() => {
    if (!enabled || !connections) {
      return Array.isArray(connections) ? connections : Object.values(connections || {});
    }

    const connectionList = Array.isArray(connections) ? connections : Object.values(connections);
    const bounds = getViewportBounds(viewport, containerSize, buffer);

    return connectionList.filter((conn) =>
      connectionIntersectsViewport(conn, elementMap, bounds)
    );
  }, [connections, elementMap, viewport.x, viewport.y, viewport.zoom, viewport.scale, containerSize, buffer, enabled]);

  return visibleConnections;
}

/**
 * Combined hook for culling both elements and connections
 */
export function useCulling(state, viewport, options = {}) {
  const visibleElements = useViewportCulling(state.elements, viewport, options);
  const visibleConnections = useConnectionCulling(
    state.connections,
    state.elements,
    viewport,
    options
  );

  return {
    elements: visibleElements,
    connections: visibleConnections,
    stats: {
      totalElements: Object.keys(state.elements || {}).length,
      visibleElements: visibleElements.length,
      totalConnections: Object.keys(state.connections || {}).length,
      visibleConnections: visibleConnections.length,
    },
  };
}

/**
 * Spatial index for fast element lookup
 * Uses a simple grid-based approach for large boards
 */
export class SpatialIndex {
  constructor(cellSize = 500) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  /**
   * Get cell key for a position
   */
  getCellKey(x, y) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Get all cell keys an element occupies
   */
  getElementCells(element) {
    const pos = element.position || { x: 0, y: 0 };
    const size = element.size || { width: 100, height: 100 };

    const minCellX = Math.floor(pos.x / this.cellSize);
    const minCellY = Math.floor(pos.y / this.cellSize);
    const maxCellX = Math.floor((pos.x + size.width) / this.cellSize);
    const maxCellY = Math.floor((pos.y + size.height) / this.cellSize);

    const keys = [];
    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        keys.push(`${cx},${cy}`);
      }
    }
    return keys;
  }

  /**
   * Build index from elements
   */
  build(elements) {
    this.cells.clear();
    const elementList = Array.isArray(elements) ? elements : Object.values(elements || {});

    elementList.forEach((element) => {
      const cellKeys = this.getElementCells(element);
      cellKeys.forEach((key) => {
        if (!this.cells.has(key)) {
          this.cells.set(key, new Set());
        }
        this.cells.get(key).add(element.id);
      });
    });
  }

  /**
   * Query elements in a viewport region
   */
  query(bounds, elements) {
    const minCellX = Math.floor(bounds.minX / this.cellSize);
    const minCellY = Math.floor(bounds.minY / this.cellSize);
    const maxCellX = Math.floor(bounds.maxX / this.cellSize);
    const maxCellY = Math.floor(bounds.maxY / this.cellSize);

    const elementIds = new Set();

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = `${cx},${cy}`;
        const cellElements = this.cells.get(key);
        if (cellElements) {
          cellElements.forEach((id) => elementIds.add(id));
        }
      }
    }

    const elementMap = Array.isArray(elements)
      ? elements.reduce((acc, el) => ({ ...acc, [el.id]: el }), {})
      : elements;

    return Array.from(elementIds)
      .map((id) => elementMap[id])
      .filter(Boolean);
  }
}

/**
 * Hook using spatial indexing for very large boards
 */
export function useSpatialCulling(elements, viewport, options = {}) {
  const {
    cellSize = 500,
    buffer = DEFAULT_BUFFER,
    containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1920,
    containerHeight = typeof window !== 'undefined' ? window.innerHeight : 1080,
    enabled = true,
    minElementsForIndex = 100,
  } = options;

  const containerSize = useMemo(
    () => ({ width: containerWidth, height: containerHeight }),
    [containerWidth, containerHeight]
  );

  const spatialIndex = useMemo(() => {
    const elementList = Array.isArray(elements) ? elements : Object.values(elements || {});

    if (!enabled || elementList.length < minElementsForIndex) {
      return null;
    }

    const index = new SpatialIndex(cellSize);
    index.build(elements);
    return index;
  }, [elements, cellSize, enabled, minElementsForIndex]);

  const visibleElements = useMemo(() => {
    const elementList = Array.isArray(elements) ? elements : Object.values(elements || {});

    if (!enabled) {
      return elementList;
    }

    const bounds = getViewportBounds(viewport, containerSize, buffer);

    if (spatialIndex) {
      return spatialIndex.query(bounds, elements);
    }

    // Fallback to simple filtering for smaller boards
    return elementList.filter((element) => elementIntersectsViewport(element, bounds));
  }, [elements, spatialIndex, viewport.x, viewport.y, viewport.zoom, viewport.scale, containerSize, buffer, enabled]);

  return visibleElements;
}

export default useViewportCulling;
