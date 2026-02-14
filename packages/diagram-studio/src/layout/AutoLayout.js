/**
 * AutoLayout
 * Automatic layout algorithms for organizing elements on the canvas
 */

/**
 * Layout algorithm types
 */
export const LAYOUT_TYPES = {
  GRID: 'grid',
  TREE: 'tree',
  RADIAL: 'radial',
  FORCE: 'force',
  HIERARCHICAL: 'hierarchical',
  CIRCULAR: 'circular',
  HORIZONTAL_FLOW: 'horizontal_flow',
  VERTICAL_FLOW: 'vertical_flow',
  ORGANIC: 'organic',
};

/**
 * Layout direction options
 */
export const LAYOUT_DIRECTION = {
  TOP_DOWN: 'top-down',
  BOTTOM_UP: 'bottom-up',
  LEFT_RIGHT: 'left-right',
  RIGHT_LEFT: 'right-left',
};

/**
 * Default layout options
 */
const DEFAULT_OPTIONS = {
  padding: 50,
  spacing: { x: 100, y: 80 },
  nodeSize: { width: 200, height: 100 },
  direction: LAYOUT_DIRECTION.TOP_DOWN,
  animate: true,
  animationDuration: 300,
  centerResult: true,
};

/**
 * Grid layout - arrange elements in a grid pattern
 */
export function gridLayout(elements, options = {}) {
  const {
    columns = Math.ceil(Math.sqrt(elements.length)),
    spacing = DEFAULT_OPTIONS.spacing,
    padding = DEFAULT_OPTIONS.padding,
    startX = padding,
    startY = padding,
  } = options;

  const positions = {};
  const elementList = Array.isArray(elements) ? elements : Object.values(elements);

  elementList.forEach((element, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;

    const width = element.size?.width || DEFAULT_OPTIONS.nodeSize.width;
    const height = element.size?.height || DEFAULT_OPTIONS.nodeSize.height;

    positions[element.id] = {
      x: startX + col * (width + spacing.x),
      y: startY + row * (height + spacing.y),
    };
  });

  return positions;
}

/**
 * Build adjacency list from connections
 */
function buildAdjacencyList(elements, connections) {
  const adjacency = {};
  const elementMap = {};

  const elementList = Array.isArray(elements) ? elements : Object.values(elements);
  const connectionList = Array.isArray(connections) ? connections : Object.values(connections);

  elementList.forEach((el) => {
    adjacency[el.id] = { parents: [], children: [] };
    elementMap[el.id] = el;
  });

  connectionList.forEach((conn) => {
    if (adjacency[conn.source] && adjacency[conn.target]) {
      adjacency[conn.source].children.push(conn.target);
      adjacency[conn.target].parents.push(conn.source);
    }
  });

  return { adjacency, elementMap };
}

/**
 * Find root nodes (nodes with no parents)
 */
function findRoots(adjacency) {
  return Object.entries(adjacency)
    .filter(([_, adj]) => adj.parents.length === 0)
    .map(([id]) => id);
}

/**
 * Tree layout - arrange elements in a tree structure
 */
export function treeLayout(elements, connections, options = {}) {
  const {
    spacing = DEFAULT_OPTIONS.spacing,
    direction = DEFAULT_OPTIONS.direction,
    padding = DEFAULT_OPTIONS.padding,
  } = options;

  const { adjacency, elementMap } = buildAdjacencyList(elements, connections);
  const positions = {};
  const visited = new Set();

  const roots = findRoots(adjacency);
  if (roots.length === 0 && Object.keys(adjacency).length > 0) {
    // If no roots, use first element
    roots.push(Object.keys(adjacency)[0]);
  }

  const isHorizontal =
    direction === LAYOUT_DIRECTION.LEFT_RIGHT ||
    direction === LAYOUT_DIRECTION.RIGHT_LEFT;

  const isReversed =
    direction === LAYOUT_DIRECTION.BOTTOM_UP ||
    direction === LAYOUT_DIRECTION.RIGHT_LEFT;

  let currentX = padding;

  function layoutSubtree(nodeId, depth) {
    if (visited.has(nodeId)) return { width: 0, height: 0 };
    visited.add(nodeId);

    const element = elementMap[nodeId];
    const nodeWidth = element?.size?.width || DEFAULT_OPTIONS.nodeSize.width;
    const nodeHeight = element?.size?.height || DEFAULT_OPTIONS.nodeSize.height;

    const children = adjacency[nodeId]?.children || [];
    const unvisitedChildren = children.filter((c) => !visited.has(c));

    if (unvisitedChildren.length === 0) {
      // Leaf node
      const x = isHorizontal ? depth * (nodeWidth + spacing.x) : currentX;
      const y = isHorizontal ? currentX : depth * (nodeHeight + spacing.y);

      positions[nodeId] = { x: x + padding, y: y + padding };
      currentX += isHorizontal ? nodeHeight + spacing.y : nodeWidth + spacing.x;

      return { width: nodeWidth, height: nodeHeight };
    }

    // Layout children first
    const childResults = unvisitedChildren.map((childId) =>
      layoutSubtree(childId, depth + 1)
    );

    const childPositions = unvisitedChildren.map((id) => positions[id]);
    const minChildPos = Math.min(
      ...childPositions.map((p) => (isHorizontal ? p.y : p.x))
    );
    const maxChildPos = Math.max(
      ...childPositions.map((p, i) =>
        isHorizontal
          ? p.y + (elementMap[unvisitedChildren[i]]?.size?.height || DEFAULT_OPTIONS.nodeSize.height)
          : p.x + (elementMap[unvisitedChildren[i]]?.size?.width || DEFAULT_OPTIONS.nodeSize.width)
      )
    );

    // Center parent over children
    const centerPos = (minChildPos + maxChildPos) / 2;

    if (isHorizontal) {
      positions[nodeId] = {
        x: depth * (nodeWidth + spacing.x) + padding,
        y: centerPos - nodeHeight / 2,
      };
    } else {
      positions[nodeId] = {
        x: centerPos - nodeWidth / 2,
        y: depth * (nodeHeight + spacing.y) + padding,
      };
    }

    return {
      width: maxChildPos - minChildPos + nodeWidth,
      height: maxChildPos - minChildPos + nodeHeight,
    };
  }

  roots.forEach((rootId) => layoutSubtree(rootId, 0));

  // Handle reverse direction
  if (isReversed) {
    const allPos = Object.values(positions);
    const maxCoord = isHorizontal
      ? Math.max(...allPos.map((p) => p.x))
      : Math.max(...allPos.map((p) => p.y));

    Object.keys(positions).forEach((id) => {
      if (isHorizontal) {
        positions[id].x = maxCoord - positions[id].x + padding * 2;
      } else {
        positions[id].y = maxCoord - positions[id].y + padding * 2;
      }
    });
  }

  return positions;
}

/**
 * Radial layout - arrange elements in concentric circles
 */
export function radialLayout(elements, connections, options = {}) {
  const {
    centerX = 500,
    centerY = 500,
    radiusStep = 150,
    startAngle = -Math.PI / 2,
  } = options;

  const { adjacency, elementMap } = buildAdjacencyList(elements, connections);
  const positions = {};
  const visited = new Set();

  const roots = findRoots(adjacency);
  if (roots.length === 0 && Object.keys(adjacency).length > 0) {
    roots.push(Object.keys(adjacency)[0]);
  }

  // BFS to determine levels
  const levels = {};
  const queue = roots.map((id) => ({ id, level: 0 }));
  roots.forEach((id) => (levels[id] = 0));

  while (queue.length > 0) {
    const { id, level } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);

    const children = adjacency[id]?.children || [];
    children.forEach((childId) => {
      if (!levels.hasOwnProperty(childId)) {
        levels[childId] = level + 1;
        queue.push({ id: childId, level: level + 1 });
      }
    });
  }

  // Group by level
  const levelGroups = {};
  Object.entries(levels).forEach(([id, level]) => {
    if (!levelGroups[level]) levelGroups[level] = [];
    levelGroups[level].push(id);
  });

  // Position elements
  Object.entries(levelGroups).forEach(([level, ids]) => {
    const radius = parseInt(level) * radiusStep;
    const angleStep = (2 * Math.PI) / ids.length;

    ids.forEach((id, index) => {
      const angle = startAngle + index * angleStep;
      const element = elementMap[id];
      const width = element?.size?.width || DEFAULT_OPTIONS.nodeSize.width;
      const height = element?.size?.height || DEFAULT_OPTIONS.nodeSize.height;

      positions[id] = {
        x: centerX + radius * Math.cos(angle) - width / 2,
        y: centerY + radius * Math.sin(angle) - height / 2,
      };
    });
  });

  return positions;
}

/**
 * Force-directed layout - physics simulation for organic layouts
 */
export function forceLayout(elements, connections, options = {}) {
  const {
    iterations = 100,
    repulsion = 5000,
    attraction = 0.1,
    damping = 0.9,
    centerX = 500,
    centerY = 500,
  } = options;

  const elementList = Array.isArray(elements) ? elements : Object.values(elements);
  const connectionList = Array.isArray(connections) ? connections : Object.values(connections);

  // Initialize positions and velocities
  const nodes = elementList.map((el) => ({
    id: el.id,
    x: el.position?.x || centerX + (Math.random() - 0.5) * 200,
    y: el.position?.y || centerY + (Math.random() - 0.5) * 200,
    vx: 0,
    vy: 0,
    width: el.size?.width || DEFAULT_OPTIONS.nodeSize.width,
    height: el.size?.height || DEFAULT_OPTIONS.nodeSize.height,
  }));

  const nodeMap = {};
  nodes.forEach((n) => (nodeMap[n.id] = n));

  // Build edge list
  const edges = connectionList
    .filter((c) => nodeMap[c.source] && nodeMap[c.target])
    .map((c) => ({ source: nodeMap[c.source], target: nodeMap[c.target] }));

  // Run simulation
  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];

        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        n1.vx -= fx;
        n1.vy -= fy;
        n2.vx += fx;
        n2.vy += fy;
      }
    }

    // Attraction along edges
    edges.forEach((edge) => {
      const dx = edge.target.x - edge.source.x;
      const dy = edge.target.y - edge.source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      const force = dist * attraction;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      edge.source.vx += fx;
      edge.source.vy += fy;
      edge.target.vx -= fx;
      edge.target.vy -= fy;
    });

    // Center gravity
    nodes.forEach((node) => {
      node.vx += (centerX - node.x) * 0.01;
      node.vy += (centerY - node.y) * 0.01;
    });

    // Apply velocities with damping
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;
      node.vx *= damping;
      node.vy *= damping;
    });
  }

  // Convert to positions object
  const positions = {};
  nodes.forEach((node) => {
    positions[node.id] = { x: node.x, y: node.y };
  });

  return positions;
}

/**
 * Hierarchical layout - layer-based arrangement
 */
export function hierarchicalLayout(elements, connections, options = {}) {
  const {
    spacing = DEFAULT_OPTIONS.spacing,
    direction = DEFAULT_OPTIONS.direction,
    padding = DEFAULT_OPTIONS.padding,
    layerSpacing = 150,
  } = options;

  const { adjacency, elementMap } = buildAdjacencyList(elements, connections);
  const positions = {};

  const isHorizontal =
    direction === LAYOUT_DIRECTION.LEFT_RIGHT ||
    direction === LAYOUT_DIRECTION.RIGHT_LEFT;

  // Assign layers using longest path
  const layers = {};
  const visited = new Set();

  function assignLayer(nodeId, layer) {
    if (visited.has(nodeId)) {
      layers[nodeId] = Math.max(layers[nodeId] || 0, layer);
      return;
    }
    visited.add(nodeId);
    layers[nodeId] = layer;

    const children = adjacency[nodeId]?.children || [];
    children.forEach((childId) => assignLayer(childId, layer + 1));
  }

  const roots = findRoots(adjacency);
  if (roots.length === 0 && Object.keys(adjacency).length > 0) {
    roots.push(Object.keys(adjacency)[0]);
  }

  roots.forEach((rootId) => assignLayer(rootId, 0));

  // Handle unvisited nodes
  Object.keys(adjacency).forEach((id) => {
    if (!layers.hasOwnProperty(id)) {
      layers[id] = 0;
    }
  });

  // Group by layer
  const layerGroups = {};
  Object.entries(layers).forEach(([id, layer]) => {
    if (!layerGroups[layer]) layerGroups[layer] = [];
    layerGroups[layer].push(id);
  });

  // Position elements
  Object.entries(layerGroups).forEach(([layer, ids]) => {
    const layerNum = parseInt(layer);

    ids.forEach((id, index) => {
      const element = elementMap[id];
      const width = element?.size?.width || DEFAULT_OPTIONS.nodeSize.width;
      const height = element?.size?.height || DEFAULT_OPTIONS.nodeSize.height;

      if (isHorizontal) {
        positions[id] = {
          x: padding + layerNum * layerSpacing,
          y: padding + index * (height + spacing.y),
        };
      } else {
        positions[id] = {
          x: padding + index * (width + spacing.x),
          y: padding + layerNum * layerSpacing,
        };
      }
    });
  });

  return positions;
}

/**
 * Circular layout - arrange in a circle
 */
export function circularLayout(elements, options = {}) {
  const {
    centerX = 500,
    centerY = 500,
    radius = 300,
    startAngle = -Math.PI / 2,
  } = options;

  const elementList = Array.isArray(elements) ? elements : Object.values(elements);
  const positions = {};
  const angleStep = (2 * Math.PI) / elementList.length;

  elementList.forEach((element, index) => {
    const angle = startAngle + index * angleStep;
    const width = element.size?.width || DEFAULT_OPTIONS.nodeSize.width;
    const height = element.size?.height || DEFAULT_OPTIONS.nodeSize.height;

    positions[element.id] = {
      x: centerX + radius * Math.cos(angle) - width / 2,
      y: centerY + radius * Math.sin(angle) - height / 2,
    };
  });

  return positions;
}

/**
 * Flow layout - horizontal or vertical flow
 */
export function flowLayout(elements, connections, options = {}) {
  const {
    direction = 'horizontal',
    spacing = DEFAULT_OPTIONS.spacing,
    padding = DEFAULT_OPTIONS.padding,
  } = options;

  const { adjacency, elementMap } = buildAdjacencyList(elements, connections);
  const positions = {};
  const visited = new Set();
  const isHorizontal = direction === 'horizontal';

  // Topological sort
  const sorted = [];
  const inDegree = {};

  Object.keys(adjacency).forEach((id) => {
    inDegree[id] = adjacency[id].parents.length;
  });

  const queue = Object.entries(inDegree)
    .filter(([_, deg]) => deg === 0)
    .map(([id]) => id);

  while (queue.length > 0) {
    const id = queue.shift();
    sorted.push(id);

    (adjacency[id]?.children || []).forEach((childId) => {
      inDegree[childId]--;
      if (inDegree[childId] === 0) {
        queue.push(childId);
      }
    });
  }

  // Add any remaining nodes (cycles)
  Object.keys(adjacency).forEach((id) => {
    if (!sorted.includes(id)) {
      sorted.push(id);
    }
  });

  // Position in flow order
  let currentPos = padding;

  sorted.forEach((id) => {
    const element = elementMap[id];
    const width = element?.size?.width || DEFAULT_OPTIONS.nodeSize.width;
    const height = element?.size?.height || DEFAULT_OPTIONS.nodeSize.height;

    if (isHorizontal) {
      positions[id] = { x: currentPos, y: padding };
      currentPos += width + spacing.x;
    } else {
      positions[id] = { x: padding, y: currentPos };
      currentPos += height + spacing.y;
    }
  });

  return positions;
}

/**
 * Apply layout to elements
 */
export function applyLayout(elements, positions, options = {}) {
  const { animate = false, animationDuration = 300 } = options;

  if (!animate) {
    const elementList = Array.isArray(elements) ? elements : Object.values(elements);
    return elementList.map((element) => ({
      ...element,
      position: positions[element.id] || element.position,
    }));
  }

  // Return positions for animation handling by the calling code
  return positions;
}

/**
 * Get layout function by type
 */
export function getLayoutFunction(type) {
  switch (type) {
    case LAYOUT_TYPES.GRID:
      return gridLayout;
    case LAYOUT_TYPES.TREE:
      return treeLayout;
    case LAYOUT_TYPES.RADIAL:
      return radialLayout;
    case LAYOUT_TYPES.FORCE:
      return forceLayout;
    case LAYOUT_TYPES.HIERARCHICAL:
      return hierarchicalLayout;
    case LAYOUT_TYPES.CIRCULAR:
      return circularLayout;
    case LAYOUT_TYPES.HORIZONTAL_FLOW:
      return (elements, connections, opts) =>
        flowLayout(elements, connections, { ...opts, direction: 'horizontal' });
    case LAYOUT_TYPES.VERTICAL_FLOW:
      return (elements, connections, opts) =>
        flowLayout(elements, connections, { ...opts, direction: 'vertical' });
    default:
      return gridLayout;
  }
}

/**
 * Auto-detect best layout based on graph structure
 */
export function detectBestLayout(elements, connections) {
  const elementCount = Array.isArray(elements) ? elements.length : Object.keys(elements).length;
  const connectionCount = Array.isArray(connections) ? connections.length : Object.keys(connections).length;

  if (connectionCount === 0) {
    return LAYOUT_TYPES.GRID;
  }

  const { adjacency } = buildAdjacencyList(elements, connections);
  const roots = findRoots(adjacency);

  // Check for tree structure
  const isTree =
    roots.length === 1 &&
    connectionCount === elementCount - 1;

  if (isTree) {
    return LAYOUT_TYPES.TREE;
  }

  // Check for linear flow
  const maxChildren = Math.max(
    ...Object.values(adjacency).map((adj) => adj.children.length)
  );

  if (maxChildren <= 1) {
    return LAYOUT_TYPES.HORIZONTAL_FLOW;
  }

  // Check for highly connected graph
  const density = connectionCount / (elementCount * (elementCount - 1) / 2);

  if (density > 0.5) {
    return LAYOUT_TYPES.FORCE;
  }

  // Default to hierarchical for DAG-like structures
  return LAYOUT_TYPES.HIERARCHICAL;
}

export default {
  LAYOUT_TYPES,
  LAYOUT_DIRECTION,
  gridLayout,
  treeLayout,
  radialLayout,
  forceLayout,
  hierarchicalLayout,
  circularLayout,
  flowLayout,
  applyLayout,
  getLayoutFunction,
  detectBestLayout,
};
