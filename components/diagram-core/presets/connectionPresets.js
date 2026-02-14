// components/diagram-core/presets/connectionPresets.js
// Connection configuration presets

// === CONNECTION TYPE DEFINITIONS ===

const CLD_CONNECTIONS = [
  {
    id: 'positive',
    name: 'Positive (+)',
    description: 'Reinforcing relationship - same direction',
    color: '#10b981',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowEnd: 'arrow',
    polarity: '+',
    labelDefault: '+',
    style: 'arc',
    curvature: 0.25,
  },
  {
    id: 'negative',
    name: 'Negative (-)',
    description: 'Balancing relationship - opposite direction',
    color: '#ef4444',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowEnd: 'arrow',
    polarity: '-',
    labelDefault: '-',
    style: 'arc',
    curvature: 0.25,
  },
  {
    id: 'delayed',
    name: 'Delayed',
    description: 'Relationship with time delay',
    color: '#6b7280',
    strokeWidth: 2,
    strokeStyle: 'dashed',
    arrowEnd: 'arrow',
    labelDefault: '||',
    style: 'arc',
    curvature: 0.25,
  },
];

const STOCK_FLOW_CONNECTIONS = [
  {
    id: 'flow',
    name: 'Flow',
    description: 'Material/resource flow between stocks',
    color: '#3b82f6',
    strokeWidth: 4,
    strokeStyle: 'solid',
    arrowEnd: 'arrow',
    animated: true,
  },
  {
    id: 'info-link',
    name: 'Information Link',
    description: 'Information dependency',
    color: '#9ca3af',
    strokeWidth: 1,
    strokeStyle: 'dashed',
    arrowEnd: 'arrow',
  },
];

const SIMPLE_CONNECTIONS = [
  {
    id: 'arrow',
    name: 'Arrow',
    color: '#374151',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowEnd: 'arrow',
  },
  {
    id: 'line',
    name: 'Line',
    color: '#374151',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowEnd: 'none',
  },
  {
    id: 'dashed',
    name: 'Dashed',
    color: '#6b7280',
    strokeWidth: 2,
    strokeStyle: 'dashed',
    arrowEnd: 'arrow',
  },
];

const SYSTEMS_MAP_CONNECTIONS = [
  {
    id: 'influences',
    name: 'Influences',
    description: 'Positive influence or dependency',
    color: '#10b981',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowEnd: 'arrow',
    polarity: '+',
  },
  {
    id: 'inhibits',
    name: 'Inhibits',
    description: 'Negative or blocking influence',
    color: '#ef4444',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowEnd: 'arrow',
    polarity: '-',
  },
  {
    id: 'informs',
    name: 'Informs',
    description: 'Information or data flow',
    color: '#6b7280',
    strokeWidth: 2,
    strokeStyle: 'dashed',
    arrowEnd: 'arrow',
  },
  {
    id: 'relates',
    name: 'Relates To',
    description: 'General relationship',
    color: '#3b82f6',
    strokeWidth: 2,
    strokeStyle: 'dotted',
    arrowEnd: 'none',
  },
];

const PROCESS_CONNECTIONS = [
  {
    id: 'sequence',
    name: 'Sequence Flow',
    description: 'Normal flow between activities',
    color: '#374151',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowEnd: 'arrow',
  },
  {
    id: 'conditional',
    name: 'Conditional Flow',
    description: 'Flow with condition',
    color: '#f59e0b',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowStart: 'diamond',
    arrowEnd: 'arrow',
  },
  {
    id: 'message',
    name: 'Message Flow',
    description: 'Communication between participants',
    color: '#3b82f6',
    strokeWidth: 2,
    strokeStyle: 'dashed',
    arrowStart: 'circle',
    arrowEnd: 'arrow',
  },
];

const UML_CONNECTIONS = [
  {
    id: 'association',
    name: 'Association',
    description: 'Basic association',
    color: '#374151',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowEnd: 'none',
  },
  {
    id: 'directed-association',
    name: 'Directed Association',
    description: 'Navigable association',
    color: '#374151',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowEnd: 'openArrow',
  },
  {
    id: 'inheritance',
    name: 'Inheritance',
    description: 'Generalization (extends)',
    color: '#374151',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowEnd: 'triangle',
  },
  {
    id: 'realization',
    name: 'Realization',
    description: 'Interface implementation',
    color: '#374151',
    strokeWidth: 2,
    strokeStyle: 'dashed',
    arrowEnd: 'triangle',
  },
  {
    id: 'dependency',
    name: 'Dependency',
    description: 'Depends on',
    color: '#6b7280',
    strokeWidth: 2,
    strokeStyle: 'dashed',
    arrowEnd: 'openArrow',
  },
  {
    id: 'aggregation',
    name: 'Aggregation',
    description: 'Has-a (weak ownership)',
    color: '#374151',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowStart: 'hollowDiamond',
    arrowEnd: 'none',
  },
  {
    id: 'composition',
    name: 'Composition',
    description: 'Contains (strong ownership)',
    color: '#374151',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowStart: 'diamond',
    arrowEnd: 'none',
  },
];

// === CONNECTION PRESETS ===

export const CONNECTION_PRESETS = {
  // Causal Loop Diagram connections
  causalLoop: {
    types: CLD_CONNECTIONS,
    defaultType: 'positive',
    style: 'arc',
    curvature: 0.25,
    showLabels: true,
    showTypeSelector: true,
    labelPosition: 'center',
    editableLabels: true,
    mode: 'edge',
    highlightOnHover: true,
    highlightConnected: true,
  },

  // Stock & Flow connections
  stockFlow: {
    types: STOCK_FLOW_CONNECTIONS,
    defaultType: 'flow',
    style: 'orthogonal',
    showLabels: false,
    showTypeSelector: true,
    mode: 'port',
    validateConnection: (from, to, type) => {
      // Flows should connect to/from stocks
      if (type === 'flow') {
        return from.type === 'stock' || to.type === 'stock' ||
               from.type === 'cloud' || to.type === 'cloud';
      }
      return true;
    },
  },

  // Simple arrows
  simple: {
    types: SIMPLE_CONNECTIONS,
    defaultType: 'arrow',
    style: 'bezier',
    showLabels: false,
    showTypeSelector: true,
    mode: 'edge',
  },

  // Systems Map
  systemsMap: {
    types: SYSTEMS_MAP_CONNECTIONS,
    defaultType: 'influences',
    style: 'arc',
    curvature: 0.2,
    showLabels: true,
    showTypeSelector: true,
    labelPosition: 'center',
    editableLabels: true,
    mode: 'edge',
    highlightOnHover: true,
  },

  // Process Flow
  processFlow: {
    types: PROCESS_CONNECTIONS,
    defaultType: 'sequence',
    style: 'orthogonal',
    showLabels: true,
    showTypeSelector: true,
    labelPosition: 'center',
    editableLabels: true,
    mode: 'port',
  },

  // Mind Map (simple curves)
  mindMap: {
    types: [
      { id: 'branch', name: 'Branch', color: '#3b82f6', strokeWidth: 2, arrowEnd: 'none' },
    ],
    defaultType: 'branch',
    style: 'bezier',
    showLabels: false,
    mode: 'edge',
  },

  // UML Class Diagram
  uml: {
    types: UML_CONNECTIONS,
    defaultType: 'association',
    style: 'bezier',
    curvature: 0.2,
    showLabels: true,
    showTypeSelector: true,
    labelPosition: 'center',
    editableLabels: true,
    mode: 'edge',
    highlightOnHover: true,
  },

  // No connections allowed
  none: {
    types: [],
    enabled: false,
  },
};

// Helper to create connection config
export function createConnectionConfig(options) {
  const preset = typeof options === 'string' ? CONNECTION_PRESETS[options] : null;
  if (preset) return preset;

  return {
    types: options.types || SIMPLE_CONNECTIONS,
    defaultType: options.defaultType || options.types?.[0]?.id || 'arrow',
    style: options.style || 'bezier',
    curvature: options.curvature ?? 0.3,
    showLabels: options.showLabels ?? false,
    showTypeSelector: options.showTypeSelector ?? true,
    labelPosition: options.labelPosition || 'center',
    editableLabels: options.editableLabels ?? false,
    mode: options.mode || 'edge',
    highlightOnHover: options.highlightOnHover ?? true,
    highlightConnected: options.highlightConnected ?? false,
    validateConnection: options.validateConnection || (() => true),
  };
}

// Export individual connection sets
export {
  CLD_CONNECTIONS,
  STOCK_FLOW_CONNECTIONS,
  SIMPLE_CONNECTIONS,
  SYSTEMS_MAP_CONNECTIONS,
  PROCESS_CONNECTIONS,
  UML_CONNECTIONS,
};

export default CONNECTION_PRESETS;
