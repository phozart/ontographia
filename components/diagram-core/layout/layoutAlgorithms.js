// components/diagram-core/layout/layoutAlgorithms.js
// Auto-layout algorithms for DiagramCore

/**
 * Build an adjacency list from connections
 */
function buildAdjacencyList(connections) {
  const adj = {};
  const inDegree = {};

  for (const conn of connections) {
    if (!adj[conn.from]) adj[conn.from] = [];
    adj[conn.from].push(conn.to);

    if (!inDegree[conn.from]) inDegree[conn.from] = 0;
    if (!inDegree[conn.to]) inDegree[conn.to] = 0;
    inDegree[conn.to]++;
  }

  return { adj, inDegree };
}

/**
 * Hierarchical Layout - arranges nodes in layers based on dependencies
 * Good for flowcharts and process diagrams
 *
 * @param {Array} elements - Array of element objects
 * @param {Array} connections - Array of connection objects
 * @param {Object} options - Layout options
 * @returns {Array} - Array of { id, x, y } position updates
 */
export function hierarchicalLayout(elements, connections, options = {}) {
  const {
    direction = 'TB', // TB (top-bottom), LR (left-right), BT, RL
    layerSpacing = 120,
    nodeSpacing = 80,
    startX = 50,
    startY = 50,
  } = options;

  if (elements.length === 0) return [];

  const { adj, inDegree } = buildAdjacencyList(connections);

  // Assign layers using topological sort with Kahn's algorithm
  const layers = [];
  const nodeLayer = {};
  const queue = [];

  // Find root nodes (no incoming edges)
  for (const el of elements) {
    if ((inDegree[el.id] || 0) === 0) {
      queue.push(el.id);
      nodeLayer[el.id] = 0;
    }
  }

  // Handle disconnected nodes
  for (const el of elements) {
    if (nodeLayer[el.id] === undefined && !connections.some(c => c.to === el.id)) {
      queue.push(el.id);
      nodeLayer[el.id] = 0;
    }
  }

  // BFS to assign layers
  while (queue.length > 0) {
    const nodeId = queue.shift();
    const layer = nodeLayer[nodeId];

    if (!layers[layer]) layers[layer] = [];
    layers[layer].push(nodeId);

    for (const neighbor of (adj[nodeId] || [])) {
      if (nodeLayer[neighbor] === undefined) {
        nodeLayer[neighbor] = layer + 1;
        queue.push(neighbor);
      }
    }
  }

  // Handle remaining disconnected nodes
  for (const el of elements) {
    if (nodeLayer[el.id] === undefined) {
      if (!layers[0]) layers[0] = [];
      layers[0].push(el.id);
    }
  }

  // Calculate positions
  const positions = [];
  const isVertical = direction === 'TB' || direction === 'BT';
  const isReverse = direction === 'BT' || direction === 'RL';

  for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
    const layer = layers[layerIdx];
    const actualLayerIdx = isReverse ? layers.length - 1 - layerIdx : layerIdx;

    for (let nodeIdx = 0; nodeIdx < layer.length; nodeIdx++) {
      const nodeId = layer[nodeIdx];
      const element = elements.find(el => el.id === nodeId);
      if (!element) continue;

      let x, y;
      if (isVertical) {
        x = startX + nodeIdx * nodeSpacing;
        y = startY + actualLayerIdx * layerSpacing;
      } else {
        x = startX + actualLayerIdx * layerSpacing;
        y = startY + nodeIdx * nodeSpacing;
      }

      positions.push({ id: nodeId, x, y });
    }
  }

  return positions;
}

/**
 * Circular Layout - arranges nodes in a circle
 * Good for causal loop diagrams and showing relationships
 *
 * @param {Array} elements - Array of element objects
 * @param {Array} connections - Array of connection objects
 * @param {Object} options - Layout options
 * @returns {Array} - Array of { id, x, y } position updates
 */
export function circularLayout(elements, connections, options = {}) {
  const {
    centerX = 400,
    centerY = 300,
    radius = 200,
    startAngle = -Math.PI / 2, // Start from top
  } = options;

  if (elements.length === 0) return [];

  const angleStep = (2 * Math.PI) / elements.length;
  const positions = [];

  // Optionally optimize node order to minimize edge crossings
  // For now, use original order
  const orderedElements = [...elements];

  orderedElements.forEach((el, i) => {
    const angle = startAngle + i * angleStep;
    const x = centerX + radius * Math.cos(angle) - el.width / 2;
    const y = centerY + radius * Math.sin(angle) - el.height / 2;

    positions.push({ id: el.id, x, y });
  });

  return positions;
}

/**
 * Force-Directed Layout - spring simulation for organic arrangement
 * Good for complex networks and exploration
 *
 * @param {Array} elements - Array of element objects
 * @param {Array} connections - Array of connection objects
 * @param {Object} options - Layout options
 * @returns {Array} - Array of { id, x, y } position updates
 */
export function forceDirectedLayout(elements, connections, options = {}) {
  const {
    iterations = 100,
    repulsion = 5000,
    attraction = 0.01,
    damping = 0.9,
    centerForce = 0.001,
    centerX = 400,
    centerY = 300,
    minDistance = 50,
  } = options;

  if (elements.length === 0) return [];

  // Initialize positions and velocities
  const nodes = elements.map(el => ({
    id: el.id,
    x: el.x + el.width / 2,
    y: el.y + el.height / 2,
    width: el.width,
    height: el.height,
    vx: 0,
    vy: 0,
  }));

  // Build connection map for O(1) lookup
  const connected = new Set();
  for (const conn of connections) {
    connected.add(`${conn.from}-${conn.to}`);
    connected.add(`${conn.to}-${conn.from}`);
  }

  // Run simulation
  for (let iter = 0; iter < iterations; iter++) {
    // Calculate forces
    for (let i = 0; i < nodes.length; i++) {
      let fx = 0;
      let fy = 0;

      // Repulsion from other nodes
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;

        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), minDistance);

        const force = repulsion / (dist * dist);
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      }

      // Attraction from connected nodes
      for (const conn of connections) {
        let other = null;
        if (conn.from === nodes[i].id) {
          other = nodes.find(n => n.id === conn.to);
        } else if (conn.to === nodes[i].id) {
          other = nodes.find(n => n.id === conn.from);
        }

        if (other) {
          const dx = other.x - nodes[i].x;
          const dy = other.y - nodes[i].y;
          fx += dx * attraction;
          fy += dy * attraction;
        }
      }

      // Center attraction
      fx += (centerX - nodes[i].x) * centerForce;
      fy += (centerY - nodes[i].y) * centerForce;

      // Update velocity with damping
      nodes[i].vx = (nodes[i].vx + fx) * damping;
      nodes[i].vy = (nodes[i].vy + fy) * damping;
    }

    // Update positions
    for (const node of nodes) {
      node.x += node.vx;
      node.y += node.vy;
    }
  }

  // Convert back to top-left positions
  return nodes.map(node => ({
    id: node.id,
    x: Math.max(0, node.x - node.width / 2),
    y: Math.max(0, node.y - node.height / 2),
  }));
}

/**
 * Grid Layout - arranges nodes in a grid
 * Good for matrices and structured data
 *
 * @param {Array} elements - Array of element objects
 * @param {Array} connections - Array of connection objects
 * @param {Object} options - Layout options
 * @returns {Array} - Array of { id, x, y } position updates
 */
export function gridLayout(elements, connections, options = {}) {
  const {
    columns = Math.ceil(Math.sqrt(elements.length)),
    cellWidth = 160,
    cellHeight = 100,
    startX = 50,
    startY = 50,
    padding = 20,
  } = options;

  const positions = [];

  elements.forEach((el, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);

    positions.push({
      id: el.id,
      x: startX + col * (cellWidth + padding),
      y: startY + row * (cellHeight + padding),
    });
  });

  return positions;
}

/**
 * Tree Layout - arranges nodes in a tree structure
 * Good for hierarchies and org charts
 *
 * @param {Array} elements - Array of element objects
 * @param {Array} connections - Array of connection objects
 * @param {Object} options - Layout options
 * @returns {Array} - Array of { id, x, y } position updates
 */
export function treeLayout(elements, connections, options = {}) {
  const {
    direction = 'TB',
    levelSpacing = 120,
    siblingSpacing = 40,
    startX = 400,
    startY = 50,
  } = options;

  if (elements.length === 0) return [];

  // Build parent-child relationships
  const children = {};
  const hasParent = new Set();

  for (const conn of connections) {
    if (!children[conn.from]) children[conn.from] = [];
    children[conn.from].push(conn.to);
    hasParent.add(conn.to);
  }

  // Find roots
  const roots = elements.filter(el => !hasParent.has(el.id)).map(el => el.id);
  if (roots.length === 0 && elements.length > 0) {
    roots.push(elements[0].id);
  }

  // Calculate subtree widths
  const widths = {};
  function calculateWidth(nodeId) {
    const nodeChildren = children[nodeId] || [];
    if (nodeChildren.length === 0) {
      widths[nodeId] = 1;
    } else {
      widths[nodeId] = nodeChildren.reduce((sum, child) => sum + calculateWidth(child), 0);
    }
    return widths[nodeId];
  }

  roots.forEach(root => calculateWidth(root));

  // Position nodes
  const positions = [];
  const nodeElement = {};
  elements.forEach(el => nodeElement[el.id] = el);

  function positionNode(nodeId, level, offset) {
    const element = nodeElement[nodeId];
    if (!element) return offset;

    const nodeChildren = children[nodeId] || [];
    const nodeWidth = widths[nodeId] || 1;

    let childOffset = offset;
    for (const child of nodeChildren) {
      childOffset = positionNode(child, level + 1, childOffset);
    }

    const centerOffset = offset + (nodeWidth * siblingSpacing) / 2;

    const isVertical = direction === 'TB' || direction === 'BT';
    const isReverse = direction === 'BT' || direction === 'RL';
    const levelPos = isReverse ? -level * levelSpacing : level * levelSpacing;

    positions.push({
      id: nodeId,
      x: isVertical ? startX + centerOffset - element.width / 2 : startX + levelPos,
      y: isVertical ? startY + levelPos : startY + centerOffset - element.height / 2,
    });

    return offset + nodeWidth * siblingSpacing;
  }

  let rootOffset = 0;
  for (const root of roots) {
    rootOffset = positionNode(root, 0, rootOffset);
  }

  return positions;
}

export default {
  hierarchical: hierarchicalLayout,
  circular: circularLayout,
  force: forceDirectedLayout,
  grid: gridLayout,
  tree: treeLayout,
};
