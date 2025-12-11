// components/diagram-shapes/MindmapShapes.js

export const mindmapNodeTypes = [
  {
    id: 'central',
    label: 'Central Idea',
    shape: 'ellipse',
    color: '#f97316',
    size: 140,
    fontSize: 18,
    description: 'The main topic or central idea',
  },
  {
    id: 'main',
    label: 'Main Branch',
    shape: 'round-rectangle',
    color: '#3b82f6',
    size: 100,
    fontSize: 14,
    description: 'Primary branches from the central idea',
  },
  {
    id: 'sub',
    label: 'Sub Branch',
    shape: 'round-rectangle',
    color: '#8b5cf6',
    size: 80,
    fontSize: 12,
    description: 'Secondary branches with supporting details',
  },
  {
    id: 'detail',
    label: 'Detail',
    shape: 'ellipse',
    color: '#94a3b8',
    size: 60,
    fontSize: 11,
    description: 'Specific details or notes',
  },
];

export const mindmapEdgeTypes = [
  {
    id: 'branch',
    label: 'Branch',
    style: {
      'line-style': 'solid',
      'target-arrow-shape': 'none',
      'curve-style': 'unbundled-bezier',
      width: 3,
    },
  },
  {
    id: 'association',
    label: 'Association',
    style: {
      'line-style': 'dashed',
      'target-arrow-shape': 'none',
      'line-color': '#9ca3af',
      width: 1,
    },
  },
];

export const mindmapStylesheet = [
  {
    selector: 'node[nodeType="central"]',
    style: {
      'background-color': '#f97316',
      shape: 'ellipse',
      width: 140,
      height: 140,
      'font-size': 18,
      'font-weight': 'bold',
    },
  },
  {
    selector: 'node[nodeType="main"]',
    style: {
      'background-color': '#3b82f6',
      shape: 'round-rectangle',
      width: 100,
      height: 60,
      'font-size': 14,
      'font-weight': 600,
    },
  },
  {
    selector: 'node[nodeType="sub"]',
    style: {
      'background-color': '#8b5cf6',
      shape: 'round-rectangle',
      width: 80,
      height: 50,
      'font-size': 12,
    },
  },
  {
    selector: 'node[nodeType="detail"]',
    style: {
      'background-color': '#94a3b8',
      shape: 'ellipse',
      width: 60,
      height: 40,
      'font-size': 11,
    },
  },
  {
    selector: 'edge[edgeType="branch"]',
    style: {
      'curve-style': 'unbundled-bezier',
      'target-arrow-shape': 'none',
      width: 3,
    },
  },
  {
    selector: 'edge[edgeType="association"]',
    style: {
      'line-style': 'dashed',
      'line-color': '#9ca3af',
      'target-arrow-shape': 'none',
      width: 1,
    },
  },
];

export const mindmapLayout = {
  name: 'breadthfirst',
  directed: true,
  padding: 60,
  spacingFactor: 1.8,
  circle: false,
  roots: '[nodeType="central"]',
};

// Color palette for branches (each main branch can have a distinct color)
export const branchColors = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f97316', // orange
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#eab308', // yellow
];

export function getBranchColor(index) {
  return branchColors[index % branchColors.length];
}
