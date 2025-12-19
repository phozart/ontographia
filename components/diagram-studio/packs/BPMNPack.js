// components/diagram-studio/packs/BPMNPack.js
// BPMN 2.0 Business Process Model and Notation Pack

// ============ STENCILS ============

const stencils = [
  // ==================== START EVENTS ====================
  {
    id: 'start-event',
    name: 'Start Event',
    description: 'Starting point of a process',
    group: 'Start Events',
    shape: 'circle',
    icon: '○',
    color: '#22c55e',
    defaultSize: { width: 36, height: 36 },
    ports: [
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
    ],
    isContainer: false,
  },
  {
    id: 'start-message',
    name: 'Message Start',
    description: 'Process starts when message is received',
    group: 'Start Events',
    shape: 'circle',
    icon: '✉',
    color: '#22c55e',
    defaultSize: { width: 36, height: 36 },
    ports: [
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
    ],
    isContainer: false,
  },
  {
    id: 'start-timer',
    name: 'Timer Start',
    description: 'Process starts at specific time/interval',
    group: 'Start Events',
    shape: 'circle',
    icon: '⏱',
    color: '#22c55e',
    defaultSize: { width: 36, height: 36 },
    ports: [
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
    ],
    isContainer: false,
    properties: [
      { id: 'timerType', label: 'Timer Type', type: 'select', options: [
        { value: 'date', label: 'Specific Date' },
        { value: 'duration', label: 'Duration' },
        { value: 'cycle', label: 'Cycle' },
      ]},
      { id: 'timerValue', label: 'Timer Value', type: 'text' },
    ],
  },
  {
    id: 'start-signal',
    name: 'Signal Start',
    description: 'Process starts when signal is received',
    group: 'Start Events',
    shape: 'circle',
    icon: '△',
    color: '#22c55e',
    defaultSize: { width: 36, height: 36 },
    ports: [
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
    ],
    isContainer: false,
  },

  // ==================== INTERMEDIATE EVENTS ====================
  {
    id: 'intermediate-event',
    name: 'Intermediate Event',
    description: 'Event occurring during process execution',
    group: 'Intermediate Events',
    shape: 'circle',
    icon: '◎',
    color: '#f59e0b',
    defaultSize: { width: 36, height: 36 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },
  {
    id: 'intermediate-timer',
    name: 'Timer Intermediate',
    description: 'Wait for specific time',
    group: 'Intermediate Events',
    shape: 'circle',
    icon: '⏱',
    color: '#f59e0b',
    defaultSize: { width: 36, height: 36 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },
  {
    id: 'intermediate-message',
    name: 'Message Intermediate',
    description: 'Send or receive message',
    group: 'Intermediate Events',
    shape: 'circle',
    icon: '✉',
    color: '#f59e0b',
    defaultSize: { width: 36, height: 36 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'direction', label: 'Direction', type: 'select', options: [
        { value: 'catch', label: 'Catch (Receive)' },
        { value: 'throw', label: 'Throw (Send)' },
      ]},
    ],
  },
  {
    id: 'intermediate-error',
    name: 'Error Boundary',
    description: 'Catch error on activity boundary',
    group: 'Intermediate Events',
    shape: 'circle',
    icon: '⚡',
    color: '#ef4444',
    defaultSize: { width: 36, height: 36 },
    ports: [
      { id: 'bottom', position: 'bottom' },
    ],
    isContainer: false,
  },

  // ==================== END EVENTS ====================
  {
    id: 'end-event',
    name: 'End Event',
    description: 'End point of a process path',
    group: 'End Events',
    shape: 'circle',
    icon: '●',
    color: '#ef4444',
    defaultSize: { width: 36, height: 36 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },
  {
    id: 'end-message',
    name: 'Message End',
    description: 'Send message at process end',
    group: 'End Events',
    shape: 'circle',
    icon: '✉',
    color: '#ef4444',
    defaultSize: { width: 36, height: 36 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },
  {
    id: 'end-error',
    name: 'Error End',
    description: 'End process with error',
    group: 'End Events',
    shape: 'circle',
    icon: '⚡',
    color: '#ef4444',
    defaultSize: { width: 36, height: 36 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },
  {
    id: 'end-terminate',
    name: 'Terminate End',
    description: 'Terminate all process instances',
    group: 'End Events',
    shape: 'circle',
    icon: '◉',
    color: '#ef4444',
    defaultSize: { width: 36, height: 36 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },

  // ==================== ACTIVITIES ====================
  {
    id: 'task',
    name: 'Task',
    description: 'Atomic activity in a process',
    group: 'Activities',
    shape: 'rect',
    icon: '▭',
    color: '#3b82f6',
    defaultSize: { width: 120, height: 70 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'taskType', label: 'Task Type', type: 'select', options: [
        { value: 'none', label: 'Abstract Task' },
        { value: 'user', label: 'User Task' },
        { value: 'service', label: 'Service Task' },
        { value: 'script', label: 'Script Task' },
        { value: 'send', label: 'Send Task' },
        { value: 'receive', label: 'Receive Task' },
        { value: 'manual', label: 'Manual Task' },
        { value: 'business-rule', label: 'Business Rule Task' },
      ]},
    ],
  },
  {
    id: 'subprocess',
    name: 'Sub-Process',
    description: 'Activity that contains other activities',
    group: 'Activities',
    shape: 'rect',
    icon: '⊞',
    color: '#8b5cf6',
    defaultSize: { width: 200, height: 150 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: true,
    properties: [
      { id: 'expanded', label: 'Expanded', type: 'boolean' },
      { id: 'triggeredByEvent', label: 'Triggered By Event', type: 'boolean' },
    ],
  },
  {
    id: 'call-activity',
    name: 'Call Activity',
    description: 'Reference to external process or task',
    group: 'Activities',
    shape: 'rect',
    icon: '→',
    color: '#06b6d4',
    defaultSize: { width: 120, height: 70 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'calledElement', label: 'Called Element', type: 'text' },
    ],
  },

  // ==================== GATEWAYS ====================
  {
    id: 'exclusive-gateway',
    name: 'Exclusive Gateway',
    description: 'XOR - Only one path is taken',
    group: 'Gateways',
    shape: 'diamond',
    icon: '✕',
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
  {
    id: 'parallel-gateway',
    name: 'Parallel Gateway',
    description: 'AND - All paths are taken',
    group: 'Gateways',
    shape: 'diamond',
    icon: '+',
    color: '#22c55e',
    defaultSize: { width: 50, height: 50 },
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
    name: 'Inclusive Gateway',
    description: 'OR - One or more paths taken',
    group: 'Gateways',
    shape: 'diamond',
    icon: '○',
    color: '#8b5cf6',
    defaultSize: { width: 50, height: 50 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },
  {
    id: 'event-gateway',
    name: 'Event-based Gateway',
    description: 'Wait for one of multiple events',
    group: 'Gateways',
    shape: 'diamond',
    icon: '◇',
    color: '#06b6d4',
    defaultSize: { width: 50, height: 50 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },

  // ==================== SWIMLANES ====================
  {
    id: 'pool',
    name: 'Pool',
    description: 'Participant in a collaboration',
    group: 'Swimlanes',
    shape: 'rect',
    icon: '▯',
    color: '#374151',
    defaultSize: { width: 600, height: 300 },
    ports: [],
    isContainer: true,
    properties: [
      { id: 'participant', label: 'Participant', type: 'text' },
      { id: 'isExecutable', label: 'Executable', type: 'boolean' },
    ],
  },
  {
    id: 'lane',
    name: 'Lane',
    description: 'Sub-partition within a pool',
    group: 'Swimlanes',
    shape: 'rect',
    icon: '▯',
    color: '#e5e7eb',
    defaultSize: { width: 580, height: 150 },
    ports: [],
    isContainer: true,
    properties: [
      { id: 'role', label: 'Role/Department', type: 'text' },
    ],
  },

  // ==================== DATA ====================
  {
    id: 'data-object',
    name: 'Data Object',
    description: 'Data used or produced by activities',
    group: 'Data',
    shape: 'rect',
    icon: '📄',
    color: '#6b7280',
    defaultSize: { width: 40, height: 50 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'bottom', position: 'bottom' },
    ],
    isContainer: false,
    properties: [
      { id: 'dataState', label: 'State', type: 'text' },
      { id: 'isCollection', label: 'Collection', type: 'boolean' },
    ],
  },
  {
    id: 'data-store',
    name: 'Data Store',
    description: 'Persistent data storage',
    group: 'Data',
    shape: 'rect',
    icon: '🗄',
    color: '#6b7280',
    defaultSize: { width: 60, height: 50 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'bottom', position: 'bottom' },
    ],
    isContainer: false,
    properties: [
      { id: 'storeName', label: 'Store Name', type: 'text' },
    ],
  },
  {
    id: 'data-input',
    name: 'Data Input',
    description: 'External data input to the process',
    group: 'Data',
    shape: 'rect',
    icon: '→📄',
    color: '#22c55e',
    defaultSize: { width: 40, height: 50 },
    ports: [
      { id: 'right', position: 'right' },
    ],
    isContainer: false,
  },
  {
    id: 'data-output',
    name: 'Data Output',
    description: 'Data output from the process',
    group: 'Data',
    shape: 'rect',
    icon: '📄→',
    color: '#3b82f6',
    defaultSize: { width: 40, height: 50 },
    ports: [
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },

  // ==================== ARTIFACTS ====================
  {
    id: 'annotation',
    name: 'Text Annotation',
    description: 'Additional information or documentation',
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
    defaultSize: { width: 250, height: 180 },
    ports: [],
    isContainer: true,
    properties: [
      { id: 'category', label: 'Category', type: 'text' },
    ],
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
    id: 'default-flow',
    name: 'Default Flow',
    description: 'Default path from gateway',
    style: 'solid',
    arrowStart: 'slash',
    arrowEnd: 'arrow',
    color: '#374151',
  },
  {
    id: 'conditional-flow',
    name: 'Conditional Flow',
    description: 'Flow based on condition',
    style: 'solid',
    arrowStart: 'diamond-empty',
    arrowEnd: 'arrow',
    color: '#374151',
  },
  {
    id: 'message-flow',
    name: 'Message Flow',
    description: 'Message between participants',
    style: 'dashed',
    arrowStart: 'circle',
    arrowEnd: 'arrow',
    color: '#6b7280',
  },
  {
    id: 'association',
    name: 'Association',
    description: 'Link to artifacts',
    style: 'dotted',
    arrowStart: 'none',
    arrowEnd: 'none',
    color: '#9ca3af',
  },
  {
    id: 'data-association',
    name: 'Data Association',
    description: 'Data flow to/from activities',
    style: 'dotted',
    arrowStart: 'none',
    arrowEnd: 'arrow',
    color: '#6b7280',
  },
];

// ============ TEMPLATES ============

const templates = [
  {
    id: 'blank',
    name: 'Blank BPMN Diagram',
    description: 'Empty BPMN diagram',
    thumbnail: null,
    elements: [],
    connections: [],
  },
  {
    id: 'simple-process',
    name: 'Simple Process',
    description: 'Basic start-task-end process',
    thumbnail: null,
    elements: [
      { id: 'start', type: 'start-event', label: '', x: 50, y: 100, size: { width: 36, height: 36 } },
      { id: 't1', type: 'task', label: 'Task 1', x: 150, y: 83, size: { width: 120, height: 70 } },
      { id: 't2', type: 'task', label: 'Task 2', x: 330, y: 83, size: { width: 120, height: 70 } },
      { id: 'end', type: 'end-event', label: '', x: 520, y: 100, size: { width: 36, height: 36 } },
    ],
    connections: [
      { id: 'f1', sourceId: 'start', targetId: 't1', type: 'sequence-flow' },
      { id: 'f2', sourceId: 't1', targetId: 't2', type: 'sequence-flow' },
      { id: 'f3', sourceId: 't2', targetId: 'end', type: 'sequence-flow' },
    ],
  },
  {
    id: 'decision-process',
    name: 'Decision Process',
    description: 'Process with exclusive gateway',
    thumbnail: null,
    elements: [
      { id: 'start', type: 'start-event', label: '', x: 50, y: 150, size: { width: 36, height: 36 } },
      { id: 't1', type: 'task', label: 'Evaluate', x: 150, y: 133, size: { width: 120, height: 70 } },
      { id: 'gw', type: 'exclusive-gateway', label: '', x: 340, y: 143, size: { width: 50, height: 50 } },
      { id: 't2', type: 'task', label: 'Approve', x: 450, y: 50, size: { width: 120, height: 70 } },
      { id: 't3', type: 'task', label: 'Reject', x: 450, y: 220, size: { width: 120, height: 70 } },
      { id: 'end1', type: 'end-event', label: '', x: 630, y: 68, size: { width: 36, height: 36 } },
      { id: 'end2', type: 'end-event', label: '', x: 630, y: 238, size: { width: 36, height: 36 } },
    ],
    connections: [
      { id: 'f1', sourceId: 'start', targetId: 't1', type: 'sequence-flow' },
      { id: 'f2', sourceId: 't1', targetId: 'gw', type: 'sequence-flow' },
      { id: 'f3', sourceId: 'gw', targetId: 't2', type: 'sequence-flow', label: 'Yes' },
      { id: 'f4', sourceId: 'gw', targetId: 't3', type: 'sequence-flow', label: 'No' },
      { id: 'f5', sourceId: 't2', targetId: 'end1', type: 'sequence-flow' },
      { id: 'f6', sourceId: 't3', targetId: 'end2', type: 'sequence-flow' },
    ],
  },
];

// ============ CUSTOM RENDERERS ============

// Start Event Renderer
function StartEventRenderer({ element, stencil }) {
  const eventType = element.type.replace('start-', '');
  const icons = {
    event: null,
    message: '✉',
    timer: '⏱',
    signal: '△',
  };

  return (
    <svg width="100%" height="100%" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="white" stroke="#22c55e" strokeWidth="2" />
      {icons[eventType] && (
        <text x="18" y="23" textAnchor="middle" fontSize="14" fill="#22c55e">
          {icons[eventType]}
        </text>
      )}
    </svg>
  );
}

// Intermediate Event Renderer
function IntermediateEventRenderer({ element, stencil }) {
  const eventType = element.type.replace('intermediate-', '');
  const icons = {
    event: null,
    timer: '⏱',
    message: '✉',
    error: '⚡',
  };
  const color = element.type === 'intermediate-error' ? '#ef4444' : '#f59e0b';

  return (
    <svg width="100%" height="100%" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="white" stroke={color} strokeWidth="2" />
      <circle cx="18" cy="18" r="12" fill="none" stroke={color} strokeWidth="2" />
      {icons[eventType] && (
        <text x="18" y="23" textAnchor="middle" fontSize="12" fill={color}>
          {icons[eventType]}
        </text>
      )}
    </svg>
  );
}

// End Event Renderer
function EndEventRenderer({ element, stencil }) {
  const eventType = element.type.replace('end-', '');
  const icons = {
    event: null,
    message: '✉',
    error: '⚡',
    terminate: '●',
  };

  return (
    <svg width="100%" height="100%" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="white" stroke="#ef4444" strokeWidth="3" />
      {eventType === 'terminate' ? (
        <circle cx="18" cy="18" r="10" fill="#ef4444" />
      ) : icons[eventType] ? (
        <text x="18" y="23" textAnchor="middle" fontSize="14" fill="#ef4444">
          {icons[eventType]}
        </text>
      ) : null}
    </svg>
  );
}

// Task Renderer
function TaskRenderer({ element, stencil }) {
  const taskType = element.data?.taskType || 'none';
  const color = element.color || stencil?.color || '#3b82f6';

  const icons = {
    none: null,
    user: '👤',
    service: '⚙️',
    script: '📜',
    send: '📤',
    receive: '📥',
    manual: '✋',
    'business-rule': '📋',
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'white',
      border: `2px solid ${color}`,
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {icons[taskType] && (
        <div style={{
          position: 'absolute',
          top: 4,
          left: 6,
          fontSize: 14,
        }}>
          {icons[taskType]}
        </div>
      )}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        fontSize: 12,
        fontWeight: 500,
        textAlign: 'center',
      }}>
        {element.label || 'Task'}
      </div>
    </div>
  );
}

// Sub-Process Renderer
function SubProcessRenderer({ element, stencil }) {
  const color = element.color || stencil?.color || '#8b5cf6';
  const expanded = element.data?.expanded !== false;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'white',
      border: `2px solid ${color}`,
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Header with label */}
      <div style={{
        padding: '6px 10px',
        fontSize: 12,
        fontWeight: 600,
        borderBottom: expanded ? `1px solid ${color}` : 'none',
      }}>
        {element.label || 'Sub-Process'}
      </div>
      {/* Expand/collapse marker */}
      <div style={{
        position: 'absolute',
        bottom: 4,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 14,
        height: 14,
        border: `1px solid ${color}`,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        color,
      }}>
        {expanded ? '−' : '+'}
      </div>
    </div>
  );
}

// Gateway Renderer
function GatewayRenderer({ element, stencil }) {
  const gatewayType = element.type.replace('-gateway', '');
  const colors = {
    exclusive: '#f59e0b',
    parallel: '#22c55e',
    inclusive: '#8b5cf6',
    event: '#06b6d4',
  };
  const color = colors[gatewayType] || '#f59e0b';

  const markers = {
    exclusive: '✕',
    parallel: '+',
    inclusive: '○',
    event: '◇',
  };

  return (
    <svg width="100%" height="100%" viewBox="0 0 50 50">
      <polygon
        points="25,2 48,25 25,48 2,25"
        fill="white"
        stroke={color}
        strokeWidth="2"
      />
      <text x="25" y="30" textAnchor="middle" fontSize="18" fontWeight="bold" fill={color}>
        {markers[gatewayType]}
      </text>
    </svg>
  );
}

// Pool Renderer
function PoolRenderer({ element, stencil }) {
  const color = element.color || stencil?.color || '#374151';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      border: `2px solid ${color}`,
      display: 'flex',
      position: 'relative',
    }}>
      {/* Vertical label area */}
      <div style={{
        width: 30,
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        transform: 'rotate(180deg)',
        color: 'white',
        fontSize: 12,
        fontWeight: 600,
        padding: '10px 0',
      }}>
        {element.label || element.data?.participant || 'Pool'}
      </div>
      {/* Content area */}
      <div style={{ flex: 1 }} />
    </div>
  );
}

// Lane Renderer
function LaneRenderer({ element, stencil }) {
  const color = element.color || stencil?.color || '#e5e7eb';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      border: `1px solid ${color}`,
      display: 'flex',
      position: 'relative',
    }}>
      {/* Vertical label area */}
      <div style={{
        width: 30,
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        transform: 'rotate(180deg)',
        fontSize: 11,
        fontWeight: 500,
        padding: '8px 0',
      }}>
        {element.label || element.data?.role || 'Lane'}
      </div>
      {/* Content area */}
      <div style={{ flex: 1 }} />
    </div>
  );
}

// Data Object Renderer
function DataObjectRenderer({ element, stencil }) {
  const isCollection = element.data?.isCollection;

  return (
    <svg width="100%" height="100%" viewBox="0 0 40 50">
      {/* Document shape */}
      <path
        d="M 5 5 L 28 5 L 35 12 L 35 45 L 5 45 Z"
        fill="white"
        stroke="#6b7280"
        strokeWidth="2"
      />
      {/* Fold corner */}
      <path
        d="M 28 5 L 28 12 L 35 12"
        fill="none"
        stroke="#6b7280"
        strokeWidth="2"
      />
      {/* Collection marker */}
      {isCollection && (
        <g transform="translate(15, 38)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#6b7280" strokeWidth="1.5" />
          <line x1="5" y1="0" x2="5" y2="5" stroke="#6b7280" strokeWidth="1.5" />
          <line x1="10" y1="0" x2="10" y2="5" stroke="#6b7280" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
}

// Data Store Renderer
function DataStoreRenderer({ element, stencil }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 60 50">
      {/* Cylinder top */}
      <ellipse cx="30" cy="10" rx="25" ry="8" fill="white" stroke="#6b7280" strokeWidth="2" />
      {/* Cylinder body */}
      <path
        d="M 5 10 L 5 40 Q 5 48, 30 48 Q 55 48, 55 40 L 55 10"
        fill="white"
        stroke="#6b7280"
        strokeWidth="2"
      />
      {/* Cylinder bottom */}
      <ellipse cx="30" cy="40" rx="25" ry="8" fill="none" stroke="#6b7280" strokeWidth="2" />
    </svg>
  );
}

// Main render function
function renderNode(element, stencil, isSelected) {
  const type = element.type;

  // Start events
  if (type.startsWith('start-')) {
    return <StartEventRenderer element={element} stencil={stencil} />;
  }

  // Intermediate events
  if (type.startsWith('intermediate-')) {
    return <IntermediateEventRenderer element={element} stencil={stencil} />;
  }

  // End events
  if (type.startsWith('end-')) {
    return <EndEventRenderer element={element} stencil={stencil} />;
  }

  // Gateways
  if (type.endsWith('-gateway')) {
    return <GatewayRenderer element={element} stencil={stencil} />;
  }

  switch (type) {
    case 'task':
      return <TaskRenderer element={element} stencil={stencil} />;
    case 'subprocess':
      return <SubProcessRenderer element={element} stencil={stencil} />;
    case 'pool':
      return <PoolRenderer element={element} stencil={stencil} />;
    case 'lane':
      return <LaneRenderer element={element} stencil={stencil} />;
    case 'data-object':
    case 'data-input':
    case 'data-output':
      return <DataObjectRenderer element={element} stencil={stencil} />;
    case 'data-store':
      return <DataStoreRenderer element={element} stencil={stencil} />;
    default:
      return null;
  }
}

// ============ PACK EXPORT ============

const BPMNPack = {
  id: 'bpmn',
  name: 'BPMN 2.0',
  description: 'Business Process Model and Notation diagrams',
  icon: '🔄',
  stencils,
  connectionTypes,
  templates,
  renderNode,
};

export default BPMNPack;
export { stencils, connectionTypes, templates };
