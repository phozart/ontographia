// components/diagram-core/presets/stencilPresets.js
// Stencil configuration presets for common diagram types

// === STENCIL DEFINITIONS ===

// Causal Loop Diagram stencils
const CLD_STENCILS = [
  {
    id: 'variable',
    name: 'Variable',
    description: 'A factor in the system',
    group: 'Elements',
    shape: 'rect',
    color: '#3b82f6',
    defaultSize: { width: 140, height: 50 },
    ports: ['top', 'right', 'bottom', 'left'],
    properties: [
      { id: 'description', label: 'Description', type: 'textarea' },
    ],
  },
];

// Stock & Flow stencils
const STOCK_FLOW_STENCILS = [
  {
    id: 'stock',
    name: 'Stock',
    description: 'Accumulation - things that accumulate over time',
    group: 'Stocks',
    shape: 'rect',
    color: '#3b82f6',
    defaultSize: { width: 120, height: 80 },
    strokeWidth: 3,
    ports: ['top', 'right', 'bottom', 'left'],
    properties: [
      { id: 'initialValue', label: 'Initial Value', type: 'number', defaultValue: 0 },
      { id: 'unit', label: 'Unit', type: 'text', placeholder: 'e.g., people, dollars' },
    ],
  },
  {
    id: 'flow',
    name: 'Flow',
    description: 'Rate of change - things that flow in/out of stocks',
    group: 'Flows',
    shape: 'flow',
    color: '#10b981',
    defaultSize: { width: 100, height: 40 },
    ports: ['left', 'right'],
    properties: [
      { id: 'equation', label: 'Equation', type: 'text', placeholder: 'e.g., Stock * rate' },
      { id: 'unit', label: 'Unit', type: 'text', placeholder: 'e.g., people/year' },
    ],
  },
  {
    id: 'auxiliary',
    name: 'Auxiliary',
    description: 'Helper variable for calculations',
    group: 'Variables',
    shape: 'circle',
    color: '#8b5cf6',
    defaultSize: { width: 60, height: 60 },
    ports: ['top', 'right', 'bottom', 'left'],
    properties: [
      { id: 'equation', label: 'Equation', type: 'text' },
    ],
  },
  {
    id: 'constant',
    name: 'Constant',
    description: 'Fixed value parameter',
    group: 'Variables',
    shape: 'diamond',
    color: '#f59e0b',
    defaultSize: { width: 50, height: 50 },
    ports: ['top', 'right', 'bottom', 'left'],
    properties: [
      { id: 'value', label: 'Value', type: 'number', defaultValue: 1 },
    ],
  },
  {
    id: 'cloud',
    name: 'Source/Sink',
    description: 'External source or sink (infinite capacity)',
    group: 'Boundaries',
    shape: 'cloud',
    color: '#6b7280',
    defaultSize: { width: 80, height: 50 },
    ports: ['right', 'left'],
  },
];

// Mind Map stencils
const MIND_MAP_STENCILS = [
  {
    id: 'central',
    name: 'Central Topic',
    group: 'Topics',
    shape: 'rounded-rect',
    color: '#3b82f6',
    defaultSize: { width: 160, height: 80 },
    fontSize: 16,
    fontWeight: 'bold',
  },
  {
    id: 'branch',
    name: 'Main Branch',
    group: 'Topics',
    shape: 'rounded-rect',
    color: '#10b981',
    defaultSize: { width: 140, height: 50 },
    fontSize: 14,
  },
  {
    id: 'sub-branch',
    name: 'Sub Branch',
    group: 'Topics',
    shape: 'rounded-rect',
    color: '#8b5cf6',
    defaultSize: { width: 120, height: 40 },
    fontSize: 12,
  },
  {
    id: 'note',
    name: 'Note',
    group: 'Annotations',
    shape: 'sticky',
    color: '#fbbf24',
    defaultSize: { width: 100, height: 80 },
    fontSize: 11,
  },
];

// Basic shapes for general use
const BASIC_STENCILS = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    group: 'Shapes',
    shape: 'rect',
    color: '#3b82f6',
    defaultSize: { width: 120, height: 80 },
  },
  {
    id: 'rounded-rectangle',
    name: 'Rounded Rectangle',
    group: 'Shapes',
    shape: 'rounded-rect',
    color: '#10b981',
    defaultSize: { width: 120, height: 80 },
    borderRadius: 12,
  },
  {
    id: 'circle',
    name: 'Circle',
    group: 'Shapes',
    shape: 'circle',
    color: '#8b5cf6',
    defaultSize: { width: 80, height: 80 },
  },
  {
    id: 'diamond',
    name: 'Diamond',
    group: 'Shapes',
    shape: 'diamond',
    color: '#f59e0b',
    defaultSize: { width: 80, height: 80 },
  },
  {
    id: 'ellipse',
    name: 'Ellipse',
    group: 'Shapes',
    shape: 'ellipse',
    color: '#ec4899',
    defaultSize: { width: 120, height: 60 },
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    group: 'Shapes',
    shape: 'hexagon',
    color: '#06b6d4',
    defaultSize: { width: 100, height: 86 },
  },
  {
    id: 'text-box',
    name: 'Text Box',
    group: 'Text',
    shape: 'text',
    color: 'transparent',
    defaultSize: { width: 150, height: 40 },
    fontSize: 14,
  },
];

// SRS Systems Map stencils
const SYSTEMS_MAP_STENCILS = [
  {
    id: 'system-element',
    name: 'System Element',
    description: 'A component or factor in the system',
    group: 'Elements',
    shape: 'rounded-rect',
    color: '#3b82f6',
    defaultSize: { width: 180, height: 80 },
    borderRadius: 8,
    properties: [
      { id: 'description', label: 'Description', type: 'textarea' },
      { id: 'impact', label: 'Impact Level', type: 'select', options: [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ]},
    ],
  },
  {
    id: 'external-factor',
    name: 'External Factor',
    description: 'External influence on the system',
    group: 'Elements',
    shape: 'rounded-rect',
    color: '#6b7280',
    defaultSize: { width: 160, height: 60 },
    strokeStyle: 'dashed',
  },
];

// UML Class Diagram stencils
const UML_STENCILS = [
  {
    id: 'uml-class',
    name: 'Class',
    description: 'UML Class with attributes and methods',
    group: 'Classes',
    shape: 'uml-class',
    color: '#3b82f6',
    defaultSize: { width: 180, height: 120 },
    ports: ['top', 'right', 'bottom', 'left'],
    properties: [
      { id: 'attributes', label: 'Attributes', type: 'textarea', placeholder: '+ name: String\n- id: int' },
      { id: 'methods', label: 'Methods', type: 'textarea', placeholder: '+ getName(): String\n+ setName(name)' },
    ],
  },
  {
    id: 'uml-interface',
    name: 'Interface',
    description: 'UML Interface',
    group: 'Classes',
    shape: 'uml-class',
    color: '#10b981',
    defaultSize: { width: 180, height: 100 },
    stereotype: '«interface»',
    ports: ['top', 'right', 'bottom', 'left'],
    properties: [
      { id: 'methods', label: 'Methods', type: 'textarea', placeholder: '+ operation(): Type' },
    ],
  },
  {
    id: 'uml-abstract',
    name: 'Abstract Class',
    description: 'UML Abstract Class',
    group: 'Classes',
    shape: 'uml-class',
    color: '#8b5cf6',
    defaultSize: { width: 180, height: 120 },
    stereotype: '«abstract»',
    fontStyle: 'italic',
    ports: ['top', 'right', 'bottom', 'left'],
    properties: [
      { id: 'attributes', label: 'Attributes', type: 'textarea' },
      { id: 'methods', label: 'Methods', type: 'textarea' },
    ],
  },
  {
    id: 'uml-enum',
    name: 'Enumeration',
    description: 'UML Enumeration',
    group: 'Classes',
    shape: 'uml-class',
    color: '#f59e0b',
    defaultSize: { width: 140, height: 100 },
    stereotype: '«enumeration»',
    ports: ['top', 'right', 'bottom', 'left'],
    properties: [
      { id: 'values', label: 'Values', type: 'textarea', placeholder: 'VALUE1\nVALUE2\nVALUE3' },
    ],
  },
  {
    id: 'uml-package',
    name: 'Package',
    description: 'UML Package',
    group: 'Structure',
    shape: 'uml-package',
    color: '#6b7280',
    defaultSize: { width: 200, height: 150 },
    fillStyle: 'none',
    borderStyle: 'solid',
    ports: ['top', 'right', 'bottom', 'left'],
  },
  {
    id: 'uml-component',
    name: 'Component',
    description: 'UML Component',
    group: 'Structure',
    shape: 'uml-component',
    color: '#06b6d4',
    defaultSize: { width: 160, height: 80 },
    ports: ['top', 'right', 'bottom', 'left'],
  },
  {
    id: 'uml-actor',
    name: 'Actor',
    description: 'UML Actor (stick figure)',
    group: 'Use Case',
    shape: 'uml-actor',
    color: '#374151',
    defaultSize: { width: 60, height: 100 },
    ports: ['top', 'right', 'bottom', 'left'],
  },
  {
    id: 'uml-usecase',
    name: 'Use Case',
    description: 'UML Use Case',
    group: 'Use Case',
    shape: 'ellipse',
    color: '#3b82f6',
    defaultSize: { width: 140, height: 70 },
    ports: ['top', 'right', 'bottom', 'left'],
  },
  {
    id: 'uml-note',
    name: 'Note',
    description: 'UML Note/Comment',
    group: 'Annotations',
    shape: 'uml-note',
    color: '#fbbf24',
    defaultSize: { width: 140, height: 80 },
    fillStyle: 'filled',
    ports: ['top', 'right', 'bottom', 'left'],
  },
  {
    id: 'uml-object',
    name: 'Object',
    description: 'UML Object instance',
    group: 'Objects',
    shape: 'uml-class',
    color: '#ec4899',
    defaultSize: { width: 160, height: 60 },
    underlineName: true,
    ports: ['top', 'right', 'bottom', 'left'],
  },
];

// UML Connection types for class diagrams
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
    description: 'Has-a (weak)',
    color: '#374151',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowStart: 'hollowDiamond',
    arrowEnd: 'none',
  },
  {
    id: 'composition',
    name: 'Composition',
    description: 'Contains (strong)',
    color: '#374151',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowStart: 'diamond',
    arrowEnd: 'none',
  },
];

// Process Flow stencils (simplified BPMN)
const PROCESS_FLOW_STENCILS = [
  {
    id: 'start',
    name: 'Start',
    group: 'Events',
    shape: 'circle',
    color: '#22c55e',
    defaultSize: { width: 50, height: 50 },
    ports: ['right'],
  },
  {
    id: 'end',
    name: 'End',
    group: 'Events',
    shape: 'circle',
    color: '#ef4444',
    defaultSize: { width: 50, height: 50 },
    strokeWidth: 4,
    ports: ['left'],
  },
  {
    id: 'task',
    name: 'Task',
    group: 'Activities',
    shape: 'rounded-rect',
    color: '#3b82f6',
    defaultSize: { width: 140, height: 70 },
    ports: ['top', 'right', 'bottom', 'left'],
    properties: [
      { id: 'assignee', label: 'Assignee', type: 'text' },
      { id: 'duration', label: 'Duration', type: 'text' },
    ],
  },
  {
    id: 'decision',
    name: 'Decision',
    group: 'Gateways',
    shape: 'diamond',
    color: '#f59e0b',
    defaultSize: { width: 60, height: 60 },
    ports: ['top', 'right', 'bottom', 'left'],
  },
  {
    id: 'parallel',
    name: 'Parallel',
    group: 'Gateways',
    shape: 'diamond',
    color: '#06b6d4',
    defaultSize: { width: 60, height: 60 },
    icon: '+',
    ports: ['top', 'right', 'bottom', 'left'],
  },
];

// === STENCIL PRESETS ===

export const STENCIL_PRESETS = {
  // Causal Loop Diagram
  causalLoop: {
    stencils: CLD_STENCILS,
    showPalette: true,
    palettePosition: 'left',
    groupBy: 'group',
    searchable: true,
    allowDrag: true,
    allowClick: true,
  },

  // Stock and Flow (System Dynamics)
  stockFlow: {
    stencils: STOCK_FLOW_STENCILS,
    showPalette: true,
    palettePosition: 'left',
    groupBy: 'group',
    searchable: true,
  },

  // Mind Mapping
  mindMap: {
    stencils: MIND_MAP_STENCILS,
    showPalette: true,
    palettePosition: 'left',
    groupBy: 'group',
  },

  // Basic shapes
  basic: {
    stencils: BASIC_STENCILS,
    showPalette: true,
    palettePosition: 'left',
    groupBy: 'group',
  },

  // SRS Systems Map
  systemsMap: {
    stencils: SYSTEMS_MAP_STENCILS,
    showPalette: true,
    palettePosition: 'left',
    groupBy: 'group',
  },

  // Process Flow
  processFlow: {
    stencils: PROCESS_FLOW_STENCILS,
    showPalette: true,
    palettePosition: 'left',
    groupBy: 'group',
  },

  // UML Class Diagram
  uml: {
    stencils: UML_STENCILS,
    showPalette: true,
    palettePosition: 'left',
    groupBy: 'group',
    searchable: true,
  },

  // No palette (programmatic only)
  programmatic: {
    stencils: BASIC_STENCILS,
    showPalette: false,
  },
};

// Helper to create stencil config
export function createStencilConfig(options) {
  const preset = typeof options === 'string' ? STENCIL_PRESETS[options] : null;
  if (preset) return preset;

  return {
    stencils: options.stencils || [],
    showPalette: options.showPalette ?? true,
    palettePosition: options.palettePosition || 'left',
    groupBy: options.groupBy || 'group',
    searchable: options.searchable ?? true,
    allowDrag: options.allowDrag ?? true,
    allowClick: options.allowClick ?? true,
    defaultPosition: options.defaultPosition || 'center',
  };
}

// Export individual stencil sets for mixing
export {
  CLD_STENCILS,
  STOCK_FLOW_STENCILS,
  MIND_MAP_STENCILS,
  BASIC_STENCILS,
  SYSTEMS_MAP_STENCILS,
  PROCESS_FLOW_STENCILS,
  UML_STENCILS,
  UML_CONNECTIONS,
};

export default STENCIL_PRESETS;
