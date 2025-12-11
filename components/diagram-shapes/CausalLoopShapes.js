// components/diagram-shapes/CausalLoopShapes.js

export const causalLoopNodeTypes = [
  {
    id: 'variable',
    label: 'Variable',
    shape: 'ellipse',
    color: '#6366f1',
    description: 'A system variable that can increase or decrease',
  },
  {
    id: 'stock',
    label: 'Stock',
    shape: 'rectangle',
    color: '#0ea5e9',
    description: 'An accumulation or level',
  },
  {
    id: 'flow',
    label: 'Flow',
    shape: 'round-rectangle',
    color: '#14b8a6',
    description: 'A rate of change',
  },
];

export const causalLoopEdgeTypes = [
  {
    id: 'positive',
    label: 'Positive (+)',
    polarity: '+',
    style: {
      'line-style': 'solid',
      'line-color': '#22c55e',
      'target-arrow-color': '#22c55e',
      'target-arrow-shape': 'triangle',
      'source-arrow-shape': 'none',
    },
  },
  {
    id: 'negative',
    label: 'Negative (-)',
    polarity: '-',
    style: {
      'line-style': 'dashed',
      'line-color': '#ef4444',
      'target-arrow-color': '#ef4444',
      'target-arrow-shape': 'triangle',
      'source-arrow-shape': 'none',
    },
  },
  {
    id: 'delayed-positive',
    label: 'Delayed Positive',
    polarity: '+',
    delayed: true,
    style: {
      'line-style': 'dotted',
      'line-color': '#22c55e',
      'target-arrow-color': '#22c55e',
      'target-arrow-shape': 'triangle',
      width: 3,
    },
  },
  {
    id: 'delayed-negative',
    label: 'Delayed Negative',
    polarity: '-',
    delayed: true,
    style: {
      'line-style': 'dotted',
      'line-color': '#ef4444',
      'target-arrow-color': '#ef4444',
      'target-arrow-shape': 'triangle',
      width: 3,
    },
  },
];

export const causalLoopStylesheet = [
  {
    selector: 'node[nodeType="variable"]',
    style: {
      'background-color': '#6366f1',
      shape: 'ellipse',
    },
  },
  {
    selector: 'node[nodeType="stock"]',
    style: {
      'background-color': '#0ea5e9',
      shape: 'rectangle',
    },
  },
  {
    selector: 'node[nodeType="flow"]',
    style: {
      'background-color': '#14b8a6',
      shape: 'round-rectangle',
    },
  },
  {
    selector: 'edge[edgeType="positive"]',
    style: {
      'line-style': 'solid',
      'line-color': '#22c55e',
      'target-arrow-color': '#22c55e',
    },
  },
  {
    selector: 'edge[edgeType="negative"]',
    style: {
      'line-style': 'dashed',
      'line-color': '#ef4444',
      'target-arrow-color': '#ef4444',
    },
  },
  {
    selector: 'edge[edgeType="delayed-positive"]',
    style: {
      'line-style': 'dotted',
      'line-color': '#22c55e',
      'target-arrow-color': '#22c55e',
      width: 3,
    },
  },
  {
    selector: 'edge[edgeType="delayed-negative"]',
    style: {
      'line-style': 'dotted',
      'line-color': '#ef4444',
      'target-arrow-color': '#ef4444',
      width: 3,
    },
  },
];

export const causalLoopLayout = {
  name: 'circle',
  padding: 60,
  avoidOverlap: true,
  nodeDimensionsIncludeLabels: true,
};

// Feedback loop indicators
export const loopTypes = {
  reinforcing: { label: 'R', description: 'Reinforcing loop - amplifies change' },
  balancing: { label: 'B', description: 'Balancing loop - stabilizes the system' },
};
