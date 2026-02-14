// components/diagram-core/analysis/loopDetection.js
// Feedback loop detection algorithm for causal loop diagrams

/**
 * Build an adjacency list from connections
 * @param {Array} connections - Array of connection objects
 * @returns {Object} - Adjacency list mapping element IDs to connected element IDs
 */
function buildAdjacencyList(connections) {
  const adj = {};

  for (const conn of connections) {
    if (!adj[conn.from]) adj[conn.from] = [];
    adj[conn.from].push({
      to: conn.to,
      connectionId: conn.id,
      polarity: conn.polarity || (conn.type === 'negative' ? '-' : conn.type === 'positive' ? '+' : null),
    });
  }

  return adj;
}

/**
 * Get the connections that form a specific loop
 * @param {Array} nodeIds - Node IDs in the loop (in order)
 * @param {Array} connections - All connections
 * @returns {Array} - Connections that form the loop
 */
function getLoopConnections(nodeIds, connections) {
  const loopConnections = [];

  for (let i = 0; i < nodeIds.length; i++) {
    const from = nodeIds[i];
    const to = nodeIds[(i + 1) % nodeIds.length];

    const conn = connections.find(c => c.from === from && c.to === to);
    if (conn) {
      loopConnections.push(conn);
    }
  }

  return loopConnections;
}

/**
 * Calculate the polarity of a loop based on its connections
 * @param {Array} loopConnections - Connections forming the loop
 * @returns {string} - 'R' for reinforcing, 'B' for balancing
 */
function calculateLoopPolarity(loopConnections) {
  let negativeCount = 0;

  for (const conn of loopConnections) {
    const polarity = conn.polarity || (conn.type === 'negative' ? '-' : conn.type === 'positive' ? '+' : null);
    if (polarity === '-') {
      negativeCount++;
    }
  }

  // Even number of negative links = reinforcing (R)
  // Odd number of negative links = balancing (B)
  return negativeCount % 2 === 0 ? 'R' : 'B';
}

/**
 * Generate a unique ID for a loop (independent of starting node)
 * @param {Array} nodeIds - Node IDs in the loop
 * @returns {string} - Canonical loop ID
 */
function getCanonicalLoopId(nodeIds) {
  // Normalize: start from smallest ID and go in direction that gives lexicographically smallest sequence
  const minIdx = nodeIds.indexOf(Math.min(...nodeIds.map(id => parseInt(id.replace(/\D/g, '')) || id)));

  // Try both directions
  const forward = [...nodeIds.slice(minIdx), ...nodeIds.slice(0, minIdx)];
  const backward = [forward[0], ...forward.slice(1).reverse()];

  const forwardStr = forward.join('-');
  const backwardStr = backward.join('-');

  return forwardStr < backwardStr ? forwardStr : backwardStr;
}

/**
 * Detect all feedback loops in a diagram
 * @param {Array} elements - Array of element objects
 * @param {Array} connections - Array of connection objects
 * @returns {Array} - Array of loop objects
 */
export function detectFeedbackLoops(elements, connections) {
  const loops = [];
  const seen = new Set();
  const adjacency = buildAdjacencyList(connections);

  // DFS with cycle detection (Johnson's algorithm simplified)
  function findCycles(startNode, currentNode, path, visited) {
    if (path.length > 1 && currentNode === startNode) {
      // Found a cycle back to start
      const loopNodes = [...path];
      const canonicalId = getCanonicalLoopId(loopNodes);

      if (!seen.has(canonicalId)) {
        seen.add(canonicalId);
        const loopConnections = getLoopConnections(loopNodes, connections);
        const polarity = calculateLoopPolarity(loopConnections);

        loops.push({
          id: `loop-${loops.length + 1}`,
          nodeIds: loopNodes,
          connectionIds: loopConnections.map(c => c.id),
          type: polarity,
          size: loopNodes.length,
        });
      }
      return;
    }

    // Limit path length to prevent excessive computation
    if (path.length > 10) return;

    const neighbors = adjacency[currentNode] || [];
    for (const { to } of neighbors) {
      // Skip if already in path (except if returning to start)
      if (path.includes(to) && to !== startNode) continue;

      findCycles(startNode, to, [...path, to], visited);
    }
  }

  // Start DFS from each node to find all cycles
  const nodeIds = elements.map(el => el.id);
  for (const startNode of nodeIds) {
    findCycles(startNode, startNode, [startNode], new Set());
  }

  // Sort loops by size (smaller loops first) then by type
  loops.sort((a, b) => {
    if (a.size !== b.size) return a.size - b.size;
    return a.type.localeCompare(b.type);
  });

  // Assign sequential labels (R1, R2, B1, B2, etc.)
  const typeCounts = { R: 0, B: 0 };
  loops.forEach(loop => {
    typeCounts[loop.type]++;
    loop.label = `${loop.type}${typeCounts[loop.type]}`;
  });

  return loops;
}

/**
 * Get elements involved in a specific loop
 * @param {Object} loop - Loop object
 * @param {Array} elements - All elements
 * @returns {Array} - Elements in the loop
 */
export function getLoopElements(loop, elements) {
  return loop.nodeIds.map(id => elements.find(el => el.id === id)).filter(Boolean);
}

/**
 * Get the center point of a loop (for label positioning)
 * @param {Object} loop - Loop object
 * @param {Array} elements - All elements
 * @returns {Object} - { x, y } center point
 */
export function getLoopCenter(loop, elements) {
  const loopElements = getLoopElements(loop, elements);

  if (loopElements.length === 0) return { x: 0, y: 0 };

  const sumX = loopElements.reduce((sum, el) => sum + el.x + el.width / 2, 0);
  const sumY = loopElements.reduce((sum, el) => sum + el.y + el.height / 2, 0);

  return {
    x: sumX / loopElements.length,
    y: sumY / loopElements.length,
  };
}

/**
 * Get description of loop behavior
 * @param {Object} loop - Loop object
 * @returns {string} - Description
 */
export function getLoopDescription(loop) {
  if (loop.type === 'R') {
    return 'Reinforcing loop - amplifies change (growth or decline)';
  } else {
    return 'Balancing loop - seeks equilibrium (stabilizing)';
  }
}

export default detectFeedbackLoops;
