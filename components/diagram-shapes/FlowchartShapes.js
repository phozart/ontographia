// components/diagram-shapes/FlowchartShapes.js

export const flowchartNodeTypes = [
  {
    id: 'process',
    label: 'Process',
    shape: 'round-rectangle',
    color: '#60a5fa',
    description: 'A process or action step',
  },
  {
    id: 'decision',
    label: 'Decision',
    shape: 'diamond',
    color: '#fbbf24',
    description: 'A decision point with yes/no branches',
  },
  {
    id: 'terminal',
    label: 'Start/End',
    shape: 'round-rectangle',
    color: '#34d399',
    description: 'Start or end of the flow',
  },
  {
    id: 'io',
    label: 'Input/Output',
    shape: 'rhomboid',
    color: '#a78bfa',
    description: 'Data input or output',
  },
  {
    id: 'document',
    label: 'Document',
    shape: 'rectangle',
    color: '#f472b6',
    description: 'A document or report',
  },
  {
    id: 'data',
    label: 'Data',
    shape: 'barrel',
    color: '#38bdf8',
    description: 'Data storage or database',
  },
];

export const flowchartEdgeTypes = [
  {
    id: 'flow',
    label: 'Flow',
    style: {
      'line-style': 'solid',
      'target-arrow-shape': 'triangle',
    },
  },
  {
    id: 'yes',
    label: 'Yes',
    style: {
      'line-style': 'solid',
      'target-arrow-shape': 'triangle',
      'line-color': '#22c55e',
      'target-arrow-color': '#22c55e',
    },
  },
  {
    id: 'no',
    label: 'No',
    style: {
      'line-style': 'solid',
      'target-arrow-shape': 'triangle',
      'line-color': '#ef4444',
      'target-arrow-color': '#ef4444',
    },
  },
];

export const flowchartStylesheet = [
  {
    selector: 'node[nodeType="process"]',
    style: {
      'background-color': '#60a5fa',
      shape: 'round-rectangle',
    },
  },
  {
    selector: 'node[nodeType="decision"]',
    style: {
      'background-color': '#fbbf24',
      shape: 'diamond',
    },
  },
  {
    selector: 'node[nodeType="terminal"]',
    style: {
      'background-color': '#34d399',
      shape: 'round-rectangle',
      'border-width': 3,
      'border-color': '#059669',
    },
  },
  {
    selector: 'node[nodeType="io"]',
    style: {
      'background-color': '#a78bfa',
      shape: 'rhomboid',
    },
  },
  {
    selector: 'node[nodeType="document"]',
    style: {
      'background-color': '#f472b6',
      shape: 'rectangle',
    },
  },
  {
    selector: 'node[nodeType="data"]',
    style: {
      'background-color': '#38bdf8',
      shape: 'barrel',
    },
  },
];

export const flowchartLayout = {
  name: 'dagre',
  rankDir: 'TB',
  nodeSep: 50,
  rankSep: 80,
  padding: 40,
};

export const flowchartDefaultLayout = {
  name: 'breadthfirst',
  directed: true,
  padding: 60,
  spacingFactor: 1.5,
};
