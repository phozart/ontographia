// components/diagram-studio/packs/CLDPack.js
// Causal Loop Diagram pack for system dynamics

// ============ STENCILS ============

const stencils = [
  // Variables
  {
    id: 'variable',
    name: 'Variable',
    description: 'A system variable that can change over time',
    group: 'Variables',
    shape: 'rect',
    icon: 'V',
    color: '#3b82f6',
    defaultSize: { width: 140, height: 50 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'variableType', label: 'Type', type: 'select', options: [
        { value: 'state', label: 'State Variable' },
        { value: 'rate', label: 'Rate Variable' },
        { value: 'auxiliary', label: 'Auxiliary' },
        { value: 'exogenous', label: 'Exogenous' },
      ]},
      { id: 'units', label: 'Units', type: 'text' },
    ],
  },

  // Stocks (accumulators)
  {
    id: 'stock',
    name: 'Stock',
    description: 'An accumulator that changes over time (level/state)',
    group: 'Stocks & Flows',
    shape: 'rect',
    icon: '▭',
    color: '#22c55e',
    defaultSize: { width: 100, height: 60 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'initialValue', label: 'Initial Value', type: 'number' },
      { id: 'units', label: 'Units', type: 'text' },
    ],
  },

  // Flow (rate of change)
  {
    id: 'flow',
    name: 'Flow',
    description: 'Rate of change into or out of a stock',
    group: 'Stocks & Flows',
    shape: 'rect',
    icon: '⋈',
    color: '#f59e0b',
    defaultSize: { width: 80, height: 40 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'flowType', label: 'Flow Type', type: 'select', options: [
        { value: 'inflow', label: 'Inflow' },
        { value: 'outflow', label: 'Outflow' },
        { value: 'biflow', label: 'Biflow' },
      ]},
      { id: 'equation', label: 'Equation', type: 'textarea' },
    ],
  },

  // Cloud (source/sink)
  {
    id: 'cloud',
    name: 'Source/Sink',
    description: 'External source or sink (outside system boundary)',
    group: 'Stocks & Flows',
    shape: 'ellipse',
    icon: '☁',
    color: '#94a3b8',
    defaultSize: { width: 60, height: 40 },
    ports: [
      { id: 'right', position: 'right' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },

  // Loop Markers
  {
    id: 'reinforcing-loop',
    name: 'Reinforcing Loop',
    description: 'Marker for reinforcing (R) feedback loop',
    group: 'Loop Markers',
    shape: 'circle',
    icon: 'R',
    color: '#ef4444',
    defaultSize: { width: 50, height: 50 },
    ports: [],
    isContainer: false,
    properties: [
      { id: 'loopName', label: 'Loop Name', type: 'text' },
      { id: 'loopNumber', label: 'Loop Number', type: 'text' },
    ],
  },
  {
    id: 'balancing-loop',
    name: 'Balancing Loop',
    description: 'Marker for balancing (B) feedback loop',
    group: 'Loop Markers',
    shape: 'circle',
    icon: 'B',
    color: '#3b82f6',
    defaultSize: { width: 50, height: 50 },
    ports: [],
    isContainer: false,
    properties: [
      { id: 'loopName', label: 'Loop Name', type: 'text' },
      { id: 'loopNumber', label: 'Loop Number', type: 'text' },
    ],
  },

  // Auxiliary elements
  {
    id: 'constant',
    name: 'Constant',
    description: 'A fixed value that does not change',
    group: 'Auxiliary',
    shape: 'diamond',
    icon: 'C',
    color: '#8b5cf6',
    defaultSize: { width: 50, height: 50 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'value', label: 'Value', type: 'number' },
      { id: 'units', label: 'Units', type: 'text' },
    ],
  },
  {
    id: 'table-function',
    name: 'Table Function',
    description: 'Lookup table for non-linear relationships',
    group: 'Auxiliary',
    shape: 'rect',
    icon: '📈',
    color: '#06b6d4',
    defaultSize: { width: 80, height: 50 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'tableData', label: 'Table Data', type: 'textarea' },
    ],
  },

  // Annotations
  {
    id: 'system-boundary',
    name: 'System Boundary',
    description: 'Boundary defining the system scope',
    group: 'Annotations',
    shape: 'rect',
    icon: '⬜',
    color: '#e5e7eb',
    defaultSize: { width: 400, height: 300 },
    ports: [],
    isContainer: true,
    properties: [
      { id: 'boundaryName', label: 'Boundary Name', type: 'text' },
    ],
  },
  {
    id: 'annotation',
    name: 'Annotation',
    description: 'Text annotation or note',
    group: 'Annotations',
    shape: 'rect',
    icon: '📝',
    color: '#fef3c7',
    defaultSize: { width: 150, height: 60 },
    ports: [],
    isContainer: false,
  },
];

// ============ CONNECTION TYPES ============

const connectionTypes = [
  {
    id: 'positive-link',
    name: 'Positive Link (+)',
    description: 'Same-direction causal link: when A increases, B increases',
    style: 'solid',
    arrowStart: 'none',
    arrowEnd: 'arrow',
    color: '#22c55e',
    labelPosition: 'center',
    defaultLabel: '+',
  },
  {
    id: 'negative-link',
    name: 'Negative Link (-)',
    description: 'Opposite-direction causal link: when A increases, B decreases',
    style: 'solid',
    arrowStart: 'none',
    arrowEnd: 'arrow',
    color: '#ef4444',
    labelPosition: 'center',
    defaultLabel: '-',
  },
  {
    id: 'delayed-positive',
    name: 'Delayed Positive (+//)',
    description: 'Positive link with time delay',
    style: 'dashed',
    arrowStart: 'none',
    arrowEnd: 'arrow',
    color: '#22c55e',
    labelPosition: 'center',
    defaultLabel: '+//',
  },
  {
    id: 'delayed-negative',
    name: 'Delayed Negative (-//)',
    description: 'Negative link with time delay',
    style: 'dashed',
    arrowStart: 'none',
    arrowEnd: 'arrow',
    color: '#ef4444',
    labelPosition: 'center',
    defaultLabel: '-//',
  },
  {
    id: 'flow-pipe',
    name: 'Flow Pipe',
    description: 'Physical flow connection',
    style: 'solid',
    arrowStart: 'none',
    arrowEnd: 'arrow',
    color: '#3b82f6',
    strokeWidth: 3,
  },
  {
    id: 'information-link',
    name: 'Information Link',
    description: 'Information flow (no physical transfer)',
    style: 'dotted',
    arrowStart: 'none',
    arrowEnd: 'arrow',
    color: '#6b7280',
  },
];

// ============ VALIDATORS ============

const validators = [
  {
    id: 'has-feedback-loop',
    name: 'Has Feedback Loop',
    description: 'CLD should contain at least one feedback loop',
    level: 'info',
    validate: (elements, connections) => {
      // Simple check: look for cycles in the graph
      const hasLoop = detectCycle(elements, connections);
      if (!hasLoop) {
        return { message: 'No feedback loops detected. Consider adding reinforcing or balancing loops.' };
      }
      return null;
    },
  },
  {
    id: 'polarity-marked',
    name: 'All Links Have Polarity',
    description: 'All causal links should have + or - polarity marked',
    level: 'warn',
    validate: (elements, connections) => {
      const unmarked = connections.filter(
        c => !c.type?.includes('positive') && !c.type?.includes('negative') && c.type !== 'flow-pipe'
      );
      if (unmarked.length > 0) {
        return unmarked.map(c => ({
          elementId: c.id,
          message: `Connection from "${findLabel(elements, c.sourceId)}" to "${findLabel(elements, c.targetId)}" needs polarity`,
        }));
      }
      return null;
    },
  },
  {
    id: 'loop-markers-present',
    name: 'Loop Markers Present',
    description: 'Feedback loops should have R or B markers',
    level: 'info',
    validate: (elements) => {
      const hasLoopMarker = elements.some(
        el => el.type === 'reinforcing-loop' || el.type === 'balancing-loop'
      );
      if (!hasLoopMarker) {
        return { message: 'Consider adding loop markers (R or B) to identify feedback loops' };
      }
      return null;
    },
  },
];

// ============ TEMPLATES ============

const templates = [
  {
    id: 'blank',
    name: 'Blank CLD',
    description: 'Empty causal loop diagram',
    thumbnail: null,
    elements: [],
    connections: [],
  },
  {
    id: 'reinforcing-loop',
    name: 'Reinforcing Loop',
    description: 'Simple reinforcing feedback loop example',
    thumbnail: null,
    elements: [
      { id: 'v1', type: 'variable', label: 'Sales', x: 100, y: 100, size: { width: 140, height: 50 } },
      { id: 'v2', type: 'variable', label: 'Revenue', x: 350, y: 100, size: { width: 140, height: 50 } },
      { id: 'v3', type: 'variable', label: 'Marketing Budget', x: 350, y: 250, size: { width: 140, height: 50 } },
      { id: 'v4', type: 'variable', label: 'Brand Awareness', x: 100, y: 250, size: { width: 140, height: 50 } },
      { id: 'r1', type: 'reinforcing-loop', label: 'R1', x: 225, y: 165, size: { width: 50, height: 50 } },
    ],
    connections: [
      { id: 'c1', sourceId: 'v1', targetId: 'v2', type: 'positive-link', label: '+' },
      { id: 'c2', sourceId: 'v2', targetId: 'v3', type: 'positive-link', label: '+' },
      { id: 'c3', sourceId: 'v3', targetId: 'v4', type: 'positive-link', label: '+' },
      { id: 'c4', sourceId: 'v4', targetId: 'v1', type: 'positive-link', label: '+' },
    ],
  },
  {
    id: 'balancing-loop',
    name: 'Balancing Loop',
    description: 'Simple balancing feedback loop example',
    thumbnail: null,
    elements: [
      { id: 'v1', type: 'variable', label: 'Gap', x: 100, y: 150, size: { width: 140, height: 50 } },
      { id: 'v2', type: 'variable', label: 'Corrective Action', x: 350, y: 150, size: { width: 140, height: 50 } },
      { id: 'v3', type: 'variable', label: 'Actual State', x: 225, y: 300, size: { width: 140, height: 50 } },
      { id: 'b1', type: 'balancing-loop', label: 'B1', x: 225, y: 180, size: { width: 50, height: 50 } },
    ],
    connections: [
      { id: 'c1', sourceId: 'v1', targetId: 'v2', type: 'positive-link', label: '+' },
      { id: 'c2', sourceId: 'v2', targetId: 'v3', type: 'positive-link', label: '+' },
      { id: 'c3', sourceId: 'v3', targetId: 'v1', type: 'negative-link', label: '-' },
    ],
  },
  {
    id: 'limits-to-growth',
    name: 'Limits to Growth',
    description: 'Classic systems archetype: growth with limiting factor',
    thumbnail: null,
    elements: [
      { id: 'v1', type: 'variable', label: 'Performance', x: 200, y: 50, size: { width: 140, height: 50 } },
      { id: 'v2', type: 'variable', label: 'Effort', x: 50, y: 150, size: { width: 140, height: 50 } },
      { id: 'v3', type: 'variable', label: 'Resources', x: 350, y: 150, size: { width: 140, height: 50 } },
      { id: 'v4', type: 'variable', label: 'Resource Gap', x: 350, y: 300, size: { width: 140, height: 50 } },
      { id: 'r1', type: 'reinforcing-loop', label: 'R', x: 130, y: 90, size: { width: 40, height: 40 } },
      { id: 'b1', type: 'balancing-loop', label: 'B', x: 280, y: 200, size: { width: 40, height: 40 } },
    ],
    connections: [
      { id: 'c1', sourceId: 'v1', targetId: 'v2', type: 'positive-link', label: '+' },
      { id: 'c2', sourceId: 'v2', targetId: 'v1', type: 'positive-link', label: '+' },
      { id: 'c3', sourceId: 'v1', targetId: 'v3', type: 'negative-link', label: '-' },
      { id: 'c4', sourceId: 'v3', targetId: 'v4', type: 'negative-link', label: '-' },
      { id: 'c5', sourceId: 'v4', targetId: 'v1', type: 'negative-link', label: '-' },
    ],
  },
];

// ============ NODE PROPERTIES ============

const nodeProperties = [
  { id: 'equation', label: 'Equation', type: 'textarea' },
  { id: 'documentation', label: 'Documentation', type: 'textarea' },
  { id: 'dataSource', label: 'Data Source', type: 'text' },
];

// ============ HELPERS ============

function detectCycle(elements, connections) {
  const graph = {};
  elements.forEach(el => { graph[el.id] = []; });
  connections.forEach(c => {
    if (graph[c.sourceId]) {
      graph[c.sourceId].push(c.targetId);
    }
  });

  const visited = new Set();
  const recStack = new Set();

  function dfs(node) {
    if (recStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recStack.add(node);

    for (const neighbor of (graph[node] || [])) {
      if (dfs(neighbor)) return true;
    }

    recStack.delete(node);
    return false;
  }

  for (const node of Object.keys(graph)) {
    if (dfs(node)) return true;
  }
  return false;
}

function findLabel(elements, id) {
  const el = elements.find(e => e.id === id);
  return el?.label || el?.name || id;
}

// ============ PACK EXPORT ============

const CLDPack = {
  id: 'cld',
  name: 'Causal Loop Diagram',
  description: 'System dynamics causal loop diagrams with polarity',
  icon: '🔄',
  stencils,
  connectionTypes,
  validators,
  templates,
  nodeProperties,
};

export default CLDPack;
export { stencils, connectionTypes, validators, templates, nodeProperties };
