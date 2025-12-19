// components/diagram-studio/packs/ProcessFlowPack.js
// BPMN-style process flow diagram pack

// ============ STENCILS ============

const stencils = [
  // Events
  {
    id: 'start-event',
    name: 'Start',
    description: 'Start event - beginning of the process',
    group: 'Events',
    shape: 'circle',
    icon: '▶',
    color: '#22c55e',
    defaultSize: { width: 50, height: 50 },
    ports: [
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
    ],
    isContainer: false,
  },
  {
    id: 'end-event',
    name: 'End',
    description: 'End event - termination of the process',
    group: 'Events',
    shape: 'circle',
    icon: '⬤',
    color: '#ef4444',
    defaultSize: { width: 50, height: 50 },
    ports: [
      { id: 'left', position: 'left' },
      { id: 'top', position: 'top' },
    ],
    isContainer: false,
  },
  {
    id: 'intermediate-event',
    name: 'Intermediate',
    description: 'Intermediate event - something that happens during the process',
    group: 'Events',
    shape: 'circle',
    icon: '◎',
    color: '#f59e0b',
    defaultSize: { width: 50, height: 50 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },

  // Activities
  {
    id: 'task',
    name: 'Task',
    description: 'A unit of work to be performed',
    group: 'Activities',
    shape: 'rect',
    icon: '☐',
    color: '#3b82f6',
    defaultSize: { width: 140, height: 70 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'assignee', label: 'Assignee', type: 'text' },
      { id: 'duration', label: 'Duration', type: 'text' },
      { id: 'taskType', label: 'Task Type', type: 'select', options: [
        { value: 'manual', label: 'Manual' },
        { value: 'automated', label: 'Automated' },
        { value: 'user', label: 'User Task' },
        { value: 'service', label: 'Service Task' },
      ]},
    ],
  },
  {
    id: 'subprocess',
    name: 'Subprocess',
    description: 'A compound activity that references another process',
    group: 'Activities',
    shape: 'rect',
    icon: '⊞',
    color: '#8b5cf6',
    defaultSize: { width: 160, height: 80 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: true,
    properties: [
      { id: 'linkedProcess', label: 'Linked Process', type: 'text' },
      { id: 'collapsed', label: 'Collapsed', type: 'boolean' },
    ],
  },

  // Gateways
  {
    id: 'exclusive-gateway',
    name: 'Decision',
    description: 'Exclusive gateway - only one path can be taken',
    group: 'Gateways',
    shape: 'diamond',
    icon: '◇',
    color: '#f59e0b',
    defaultSize: { width: 60, height: 60 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'condition', label: 'Condition', type: 'text' },
    ],
  },
  {
    id: 'parallel-gateway',
    name: 'Parallel',
    description: 'Parallel gateway - all paths are taken simultaneously',
    group: 'Gateways',
    shape: 'diamond',
    icon: '+',
    color: '#06b6d4',
    defaultSize: { width: 60, height: 60 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },
  {
    id: 'inclusive-gateway',
    name: 'Inclusive',
    description: 'Inclusive gateway - one or more paths can be taken',
    group: 'Gateways',
    shape: 'diamond',
    icon: '○',
    color: '#ec4899',
    defaultSize: { width: 60, height: 60 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },

  // Swimlanes
  {
    id: 'pool',
    name: 'Pool',
    description: 'A container for a single process',
    group: 'Swimlanes',
    shape: 'rect',
    icon: '▭',
    color: '#64748b',
    defaultSize: { width: 600, height: 300 },
    ports: [],
    isContainer: true,
    properties: [
      { id: 'participant', label: 'Participant', type: 'text' },
    ],
  },
  {
    id: 'lane',
    name: 'Lane',
    description: 'A sub-partition within a pool',
    group: 'Swimlanes',
    shape: 'rect',
    icon: '▬',
    color: '#94a3b8',
    defaultSize: { width: 500, height: 150 },
    ports: [],
    isContainer: true,
    properties: [
      { id: 'role', label: 'Role/Department', type: 'text' },
    ],
  },

  // Data
  {
    id: 'data-object',
    name: 'Data Object',
    description: 'Information that flows through the process',
    group: 'Data',
    shape: 'rect',
    icon: '📄',
    color: '#6b7280',
    defaultSize: { width: 50, height: 65 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'dataType', label: 'Data Type', type: 'text' },
      { id: 'state', label: 'State', type: 'text' },
    ],
  },
  {
    id: 'data-store',
    name: 'Data Store',
    description: 'A place to store data',
    group: 'Data',
    shape: 'rect',
    icon: '🗄',
    color: '#6b7280',
    defaultSize: { width: 70, height: 60 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'storeName', label: 'Store Name', type: 'text' },
    ],
  },

  // Annotations
  {
    id: 'annotation',
    name: 'Annotation',
    description: 'Additional text annotation',
    group: 'Artifacts',
    shape: 'rect',
    icon: '📝',
    color: '#9ca3af',
    defaultSize: { width: 150, height: 60 },
    ports: [
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },
  {
    id: 'group',
    name: 'Group',
    description: 'Visual grouping of elements',
    group: 'Artifacts',
    shape: 'rect',
    icon: '⬜',
    color: '#d1d5db',
    defaultSize: { width: 200, height: 150 },
    ports: [],
    isContainer: true,
  },
];

// ============ CONNECTION TYPES ============

const connectionTypes = [
  {
    id: 'sequence-flow',
    name: 'Sequence Flow',
    description: 'Normal flow between activities',
    style: 'solid',
    arrowStart: 'none',
    arrowEnd: 'arrow',
    color: '#374151',
  },
  {
    id: 'conditional-flow',
    name: 'Conditional Flow',
    description: 'Flow with a condition',
    style: 'solid',
    arrowStart: 'diamond',
    arrowEnd: 'arrow',
    color: '#f59e0b',
  },
  {
    id: 'default-flow',
    name: 'Default Flow',
    description: 'Default path from a gateway',
    style: 'solid',
    arrowStart: 'none',
    arrowEnd: 'arrow',
    color: '#374151',
    marker: 'slash',
  },
  {
    id: 'message-flow',
    name: 'Message Flow',
    description: 'Communication between pools',
    style: 'dashed',
    arrowStart: 'circle',
    arrowEnd: 'arrow',
    color: '#3b82f6',
  },
  {
    id: 'association',
    name: 'Association',
    description: 'Association with data or annotations',
    style: 'dotted',
    arrowStart: 'none',
    arrowEnd: 'none',
    color: '#9ca3af',
  },
];

// ============ VALIDATORS ============

const validators = [
  {
    id: 'has-start',
    name: 'Has Start Event',
    description: 'Process should have at least one start event',
    level: 'error',
    validate: (elements) => {
      const hasStart = elements.some(el => el.type === 'start-event');
      return hasStart ? null : { message: 'Process must have a start event' };
    },
  },
  {
    id: 'has-end',
    name: 'Has End Event',
    description: 'Process should have at least one end event',
    level: 'error',
    validate: (elements) => {
      const hasEnd = elements.some(el => el.type === 'end-event');
      return hasEnd ? null : { message: 'Process must have an end event' };
    },
  },
  {
    id: 'decision-has-outputs',
    name: 'Decision Has Multiple Outputs',
    description: 'Decision gateways should have at least 2 outgoing flows',
    level: 'warn',
    validate: (elements, connections) => {
      const decisions = elements.filter(el => el.type === 'exclusive-gateway');
      const issues = [];
      for (const dec of decisions) {
        const outgoing = connections.filter(c => c.sourceId === dec.id);
        if (outgoing.length < 2) {
          issues.push({
            elementId: dec.id,
            message: `Decision "${dec.label || dec.id}" should have at least 2 outgoing flows`,
          });
        }
      }
      return issues.length > 0 ? issues : null;
    },
  },
  {
    id: 'no-orphan-tasks',
    name: 'No Orphan Tasks',
    description: 'All tasks should be connected',
    level: 'warn',
    validate: (elements, connections) => {
      const tasks = elements.filter(el => el.type === 'task' || el.type === 'subprocess');
      const issues = [];
      for (const task of tasks) {
        const hasConnection = connections.some(
          c => c.sourceId === task.id || c.targetId === task.id
        );
        if (!hasConnection) {
          issues.push({
            elementId: task.id,
            message: `Task "${task.label || task.id}" is not connected`,
          });
        }
      }
      return issues.length > 0 ? issues : null;
    },
  },
];

// ============ TEMPLATES ============

const templates = [
  {
    id: 'blank',
    name: 'Blank Process',
    description: 'Empty process flow diagram',
    thumbnail: null,
    elements: [],
    connections: [],
  },
  {
    id: 'simple-flow',
    name: 'Simple Flow',
    description: 'Basic start-task-end flow',
    thumbnail: null,
    elements: [
      { id: 'start1', type: 'start-event', label: 'Start', x: 100, y: 150, size: { width: 50, height: 50 } },
      { id: 'task1', type: 'task', label: 'Process Task', x: 200, y: 135, size: { width: 140, height: 70 } },
      { id: 'end1', type: 'end-event', label: 'End', x: 400, y: 150, size: { width: 50, height: 50 } },
    ],
    connections: [
      { id: 'conn1', sourceId: 'start1', targetId: 'task1', sourcePort: 'right', targetPort: 'left', type: 'sequence-flow' },
      { id: 'conn2', sourceId: 'task1', targetId: 'end1', sourcePort: 'right', targetPort: 'left', type: 'sequence-flow' },
    ],
  },
  {
    id: 'approval-workflow',
    name: 'Approval Workflow',
    description: 'Process with decision point for approval',
    thumbnail: null,
    elements: [
      { id: 'start1', type: 'start-event', label: 'Start', x: 50, y: 150, size: { width: 50, height: 50 } },
      { id: 'task1', type: 'task', label: 'Submit Request', x: 150, y: 135, size: { width: 140, height: 70 } },
      { id: 'task2', type: 'task', label: 'Review Request', x: 340, y: 135, size: { width: 140, height: 70 } },
      { id: 'dec1', type: 'exclusive-gateway', label: 'Approved?', x: 530, y: 145, size: { width: 60, height: 60 } },
      { id: 'task3', type: 'task', label: 'Process Approved', x: 650, y: 50, size: { width: 140, height: 70 } },
      { id: 'task4', type: 'task', label: 'Handle Rejection', x: 650, y: 220, size: { width: 140, height: 70 } },
      { id: 'end1', type: 'end-event', label: 'End', x: 850, y: 150, size: { width: 50, height: 50 } },
    ],
    connections: [
      { id: 'conn1', sourceId: 'start1', targetId: 'task1', sourcePort: 'right', targetPort: 'left', type: 'sequence-flow' },
      { id: 'conn2', sourceId: 'task1', targetId: 'task2', sourcePort: 'right', targetPort: 'left', type: 'sequence-flow' },
      { id: 'conn3', sourceId: 'task2', targetId: 'dec1', sourcePort: 'right', targetPort: 'left', type: 'sequence-flow' },
      { id: 'conn4', sourceId: 'dec1', targetId: 'task3', sourcePort: 'top', targetPort: 'left', type: 'conditional-flow', label: 'Yes' },
      { id: 'conn5', sourceId: 'dec1', targetId: 'task4', sourcePort: 'bottom', targetPort: 'left', type: 'conditional-flow', label: 'No' },
      { id: 'conn6', sourceId: 'task3', targetId: 'end1', sourcePort: 'right', targetPort: 'top', type: 'sequence-flow' },
      { id: 'conn7', sourceId: 'task4', targetId: 'end1', sourcePort: 'right', targetPort: 'bottom', type: 'sequence-flow' },
    ],
  },
  {
    id: 'swimlane-process',
    name: 'Swimlane Process',
    description: 'Process with multiple roles/departments',
    thumbnail: null,
    elements: [
      { id: 'pool1', type: 'pool', label: 'Order Process', x: 20, y: 20, size: { width: 800, height: 400 } },
      { id: 'lane1', type: 'lane', label: 'Customer', x: 40, y: 40, size: { width: 760, height: 130 } },
      { id: 'lane2', type: 'lane', label: 'Sales', x: 40, y: 180, size: { width: 760, height: 130 } },
      { id: 'lane3', type: 'lane', label: 'Warehouse', x: 40, y: 320, size: { width: 760, height: 80 } },
      { id: 'start1', type: 'start-event', label: 'Order Received', x: 80, y: 85, size: { width: 50, height: 50 } },
      { id: 'task1', type: 'task', label: 'Place Order', x: 180, y: 70, size: { width: 120, height: 60 } },
      { id: 'task2', type: 'task', label: 'Process Order', x: 180, y: 210, size: { width: 120, height: 60 } },
      { id: 'task3', type: 'task', label: 'Ship Order', x: 380, y: 330, size: { width: 120, height: 60 } },
      { id: 'end1', type: 'end-event', label: 'Complete', x: 700, y: 85, size: { width: 50, height: 50 } },
    ],
    connections: [
      { id: 'conn1', sourceId: 'start1', targetId: 'task1', sourcePort: 'right', targetPort: 'left', type: 'sequence-flow' },
      { id: 'conn2', sourceId: 'task1', targetId: 'task2', sourcePort: 'bottom', targetPort: 'top', type: 'sequence-flow' },
      { id: 'conn3', sourceId: 'task2', targetId: 'task3', sourcePort: 'bottom', targetPort: 'top', type: 'sequence-flow' },
      { id: 'conn4', sourceId: 'task3', targetId: 'end1', sourcePort: 'right', targetPort: 'bottom', type: 'sequence-flow' },
    ],
  },
];

// ============ NODE PROPERTIES ============

const nodeProperties = [
  { id: 'documentation', label: 'Documentation', type: 'textarea' },
  { id: 'performers', label: 'Performers', type: 'list' },
  { id: 'inputData', label: 'Input Data', type: 'list' },
  { id: 'outputData', label: 'Output Data', type: 'list' },
];

// ============ VISUAL RENDERERS ============

// Start Event (green circle with play icon)
function StartEventNode({ element, stencil }) {
  const { width, height } = element.size || stencil?.defaultSize || { width: 50, height: 50 };
  const color = element.color || stencil?.color || '#22c55e';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id={`glow-${element.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={color} floodOpacity="0.3" />
          </filter>
        </defs>
        <circle
          cx={width / 2}
          cy={height / 2}
          r={Math.min(width, height) / 2 - 4}
          fill="white"
          stroke={color}
          strokeWidth="3"
          filter={`url(#glow-${element.id})`}
        />
        {/* Play triangle */}
        <path
          d={`M ${width / 2 - 6} ${height / 2 - 8} L ${width / 2 + 8} ${height / 2} L ${width / 2 - 6} ${height / 2 + 8} Z`}
          fill={color}
        />
      </svg>
    </div>
  );
}

// End Event (red circle with stop square)
function EndEventNode({ element, stencil }) {
  const { width, height } = element.size || stencil?.defaultSize || { width: 50, height: 50 };
  const color = element.color || stencil?.color || '#ef4444';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle
          cx={width / 2}
          cy={height / 2}
          r={Math.min(width, height) / 2 - 4}
          fill="white"
          stroke={color}
          strokeWidth="4"
        />
        {/* Stop square */}
        <rect
          x={width / 2 - 8}
          y={height / 2 - 8}
          width="16"
          height="16"
          fill={color}
          rx="2"
        />
      </svg>
    </div>
  );
}

// Intermediate Event (double circle)
function IntermediateEventNode({ element, stencil }) {
  const { width, height } = element.size || stencil?.defaultSize || { width: 50, height: 50 };
  const color = element.color || stencil?.color || '#f59e0b';
  const r = Math.min(width, height) / 2 - 4;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle
          cx={width / 2}
          cy={height / 2}
          r={r}
          fill="white"
          stroke={color}
          strokeWidth="2"
        />
        <circle
          cx={width / 2}
          cy={height / 2}
          r={r - 4}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

// Task (rounded rectangle with icon based on type)
function TaskNode({ element, stencil, isSelected }) {
  const label = element.label || element.name || '';
  const { width, height } = element.size || stencil?.defaultSize || { width: 140, height: 70 };
  const color = element.color || stencil?.color || '#3b82f6';
  const taskType = element.data?.taskType || 'manual';

  const getTaskIcon = () => {
    switch (taskType) {
      case 'user':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <circle cx="12" cy="7" r="4" />
            <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
          </svg>
        );
      case 'service':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      case 'automated':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id={`task-shadow-${element.id}`} x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1" />
          </filter>
        </defs>
        <rect
          x="2"
          y="2"
          width={width - 4}
          height={height - 4}
          rx="8"
          fill="white"
          stroke={color}
          strokeWidth="2"
          filter={`url(#task-shadow-${element.id})`}
        />
      </svg>

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px',
        boxSizing: 'border-box',
      }}>
        {/* Task type icon */}
        <div style={{ position: 'absolute', top: 6, left: 8 }}>
          {getTaskIcon()}
        </div>

        {/* Label */}
        <div style={{
          fontSize: 12,
          fontWeight: 500,
          color: '#1f2937',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// Subprocess (task with + marker)
function SubprocessNode({ element, stencil }) {
  const label = element.label || element.name || '';
  const { width, height } = element.size || stencil?.defaultSize || { width: 160, height: 80 };
  const color = element.color || stencil?.color || '#8b5cf6';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <rect
          x="2"
          y="2"
          width={width - 4}
          height={height - 4}
          rx="8"
          fill="white"
          stroke={color}
          strokeWidth="2"
        />
        {/* Subprocess marker (box with +) */}
        <rect
          x={width / 2 - 8}
          y={height - 18}
          width="16"
          height="14"
          fill="white"
          stroke={color}
          strokeWidth="1.5"
          rx="2"
        />
        <line x1={width / 2} y1={height - 16} x2={width / 2} y2={height - 6} stroke={color} strokeWidth="1.5" />
        <line x1={width / 2 - 5} y1={height - 11} x2={width / 2 + 5} y2={height - 11} stroke={color} strokeWidth="1.5" />
      </svg>

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: '20px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          fontSize: 12,
          fontWeight: 500,
          color: '#1f2937',
          textAlign: 'center',
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// Gateway (diamond shape with internal marker)
function GatewayNode({ element, stencil, gatewayType }) {
  const { width, height } = element.size || stencil?.defaultSize || { width: 60, height: 60 };
  const color = element.color || stencil?.color || '#f59e0b';
  const cx = width / 2;
  const cy = height / 2;

  const getMarker = () => {
    switch (gatewayType) {
      case 'exclusive':
        return (
          <>
            <line x1={cx - 8} y1={cy - 8} x2={cx + 8} y2={cy + 8} stroke={color} strokeWidth="3" />
            <line x1={cx + 8} y1={cy - 8} x2={cx - 8} y2={cy + 8} stroke={color} strokeWidth="3" />
          </>
        );
      case 'parallel':
        return (
          <>
            <line x1={cx} y1={cy - 10} x2={cx} y2={cy + 10} stroke={color} strokeWidth="3" />
            <line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} stroke={color} strokeWidth="3" />
          </>
        );
      case 'inclusive':
        return (
          <circle cx={cx} cy={cy} r="8" fill="none" stroke={color} strokeWidth="3" />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <polygon
          points={`${cx},4 ${width - 4},${cy} ${cx},${height - 4} 4,${cy}`}
          fill="white"
          stroke={color}
          strokeWidth="2"
        />
        {getMarker()}
      </svg>
    </div>
  );
}

// Pool/Lane (swimlane container)
function SwimLaneNode({ element, stencil, isPool }) {
  const label = element.label || element.name || '';
  const { width, height } = element.size || stencil?.defaultSize || { width: 600, height: 300 };
  const color = element.color || stencil?.color || '#64748b';
  const headerWidth = 30;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <rect
          x="1"
          y="1"
          width={width - 2}
          height={height - 2}
          fill="white"
          fillOpacity="0.5"
          stroke={color}
          strokeWidth={isPool ? "2" : "1"}
          rx="4"
        />
        {/* Header section */}
        <rect
          x="1"
          y="1"
          width={headerWidth}
          height={height - 2}
          fill={color}
          fillOpacity="0.15"
          rx="4"
        />
        <line x1={headerWidth} y1="1" x2={headerWidth} y2={height - 1} stroke={color} strokeWidth="1" />
      </svg>

      {/* Vertical label */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: headerWidth,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          transform: 'rotate(-90deg)',
          whiteSpace: 'nowrap',
          fontSize: 12,
          fontWeight: 600,
          color: '#374151',
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}

// Data Object (document shape)
function DataObjectNode({ element, stencil }) {
  const label = element.label || element.name || '';
  const { width, height } = element.size || stencil?.defaultSize || { width: 50, height: 65 };
  const color = element.color || stencil?.color || '#6b7280';
  const fold = 10;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <path
          d={`M 2 2 L ${width - fold - 2} 2 L ${width - 2} ${fold + 2} L ${width - 2} ${height - 2} L 2 ${height - 2} Z`}
          fill="white"
          stroke={color}
          strokeWidth="1.5"
        />
        <path
          d={`M ${width - fold - 2} 2 L ${width - fold - 2} ${fold + 2} L ${width - 2} ${fold + 2}`}
          fill={color}
          fillOpacity="0.2"
          stroke={color}
          strokeWidth="1"
        />
      </svg>

      <div style={{
        position: 'absolute',
        bottom: 4,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 9,
        color: '#374151',
      }}>
        {label}
      </div>
    </div>
  );
}

// Data Store (cylinder)
function DataStoreNode({ element, stencil }) {
  const label = element.label || element.name || '';
  const { width, height } = element.size || stencil?.defaultSize || { width: 70, height: 60 };
  const color = element.color || stencil?.color || '#6b7280';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <path
          d={`M 2 12 Q 2 2 ${width / 2} 2 Q ${width - 2} 2 ${width - 2} 12 L ${width - 2} ${height - 12} Q ${width - 2} ${height - 2} ${width / 2} ${height - 2} Q 2 ${height - 2} 2 ${height - 12} Z`}
          fill="white"
          stroke={color}
          strokeWidth="1.5"
        />
        <ellipse
          cx={width / 2}
          cy="12"
          rx={width / 2 - 2}
          ry="10"
          fill="white"
          stroke={color}
          strokeWidth="1.5"
        />
      </svg>

      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 10,
        color: '#374151',
      }}>
        {label}
      </div>
    </div>
  );
}

// Annotation (bracket with text)
function AnnotationNode({ element }) {
  const label = element.label || '';
  const { width, height } = element.size || { width: 150, height: 60 };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <path
          d={`M 10 2 L 2 2 L 2 ${height - 2} L 10 ${height - 2}`}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="1.5"
        />
      </svg>

      <div style={{
        position: 'absolute',
        left: 14,
        top: 0,
        bottom: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        fontSize: 11,
        color: '#6b7280',
        fontStyle: 'italic',
      }}>
        {label}
      </div>
    </div>
  );
}

// Group (dashed rectangle)
function GroupNode({ element }) {
  const label = element.label || '';
  const { width, height } = element.size || { width: 200, height: 150 };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
        <rect
          x="2"
          y="2"
          width={width - 4}
          height={height - 4}
          fill="none"
          stroke="#d1d5db"
          strokeWidth="2"
          strokeDasharray="8 4"
          rx="8"
        />
      </svg>

      {label && (
        <div style={{
          position: 'absolute',
          top: -10,
          left: 12,
          background: 'white',
          padding: '0 6px',
          fontSize: 11,
          color: '#6b7280',
          fontWeight: 500,
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

// Main render function
function renderNode(element, stencil, isSelected) {
  const type = element.type;

  switch (type) {
    case 'start-event':
      return <StartEventNode element={element} stencil={stencil} />;
    case 'end-event':
      return <EndEventNode element={element} stencil={stencil} />;
    case 'intermediate-event':
      return <IntermediateEventNode element={element} stencil={stencil} />;
    case 'task':
      return <TaskNode element={element} stencil={stencil} isSelected={isSelected} />;
    case 'subprocess':
      return <SubprocessNode element={element} stencil={stencil} />;
    case 'exclusive-gateway':
      return <GatewayNode element={element} stencil={stencil} gatewayType="exclusive" />;
    case 'parallel-gateway':
      return <GatewayNode element={element} stencil={stencil} gatewayType="parallel" />;
    case 'inclusive-gateway':
      return <GatewayNode element={element} stencil={stencil} gatewayType="inclusive" />;
    case 'pool':
      return <SwimLaneNode element={element} stencil={stencil} isPool={true} />;
    case 'lane':
      return <SwimLaneNode element={element} stencil={stencil} isPool={false} />;
    case 'data-object':
      return <DataObjectNode element={element} stencil={stencil} />;
    case 'data-store':
      return <DataStoreNode element={element} stencil={stencil} />;
    case 'annotation':
      return <AnnotationNode element={element} />;
    case 'group':
      return <GroupNode element={element} />;
    default:
      return null;
  }
}

// ============ PACK EXPORT ============

const ProcessFlowPack = {
  id: 'process-flow',
  name: 'Process Flow',
  description: 'BPMN-style process flow diagrams with swimlanes',
  icon: '📊',
  stencils,
  connectionTypes,
  validators,
  templates,
  nodeProperties,
  renderNode,
};

export default ProcessFlowPack;
export { stencils, connectionTypes, validators, templates, nodeProperties, renderNode };
