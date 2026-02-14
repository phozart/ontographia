// components/diagram-studio/packs/MindMapPack.js
// Mind Map pack for hierarchical idea mapping

// ============ STENCILS ============

const stencils = [
  // Central Topic
  {
    id: 'central-topic',
    name: 'Central Topic',
    description: 'Main topic at the center of the mind map',
    group: 'Topics',
    shape: 'ellipse',
    icon: '◉',
    color: '#3b82f6',
    defaultSize: { width: 160, height: 80 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'priority', label: 'Priority', type: 'select', options: [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ]},
    ],
  },

  // Main Branch
  {
    id: 'main-topic',
    name: 'Main Topic',
    description: 'Primary branch from central topic',
    group: 'Topics',
    shape: 'rect',
    icon: '◆',
    color: '#22c55e',
    defaultSize: { width: 140, height: 50 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'priority', label: 'Priority', type: 'select', options: [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ]},
      { id: 'status', label: 'Status', type: 'select', options: [
        { value: 'open', label: 'Open' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'done', label: 'Done' },
      ]},
    ],
  },

  // Sub-topic
  {
    id: 'sub-topic',
    name: 'Sub-topic',
    description: 'Secondary branch topic',
    group: 'Topics',
    shape: 'rect',
    icon: '◇',
    color: '#f59e0b',
    defaultSize: { width: 120, height: 40 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
    properties: [
      { id: 'status', label: 'Status', type: 'select', options: [
        { value: 'open', label: 'Open' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'done', label: 'Done' },
      ]},
    ],
  },

  // Floating Topic
  {
    id: 'floating-topic',
    name: 'Floating Topic',
    description: 'Unconnected idea or note',
    group: 'Topics',
    shape: 'rect',
    icon: '○',
    color: '#8b5cf6',
    defaultSize: { width: 100, height: 35 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },

  // Colored Topics
  {
    id: 'topic-red',
    name: 'Red Topic',
    description: 'Red colored topic',
    group: 'Colored',
    shape: 'rect',
    icon: '●',
    color: '#ef4444',
    defaultSize: { width: 120, height: 40 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },
  {
    id: 'topic-blue',
    name: 'Blue Topic',
    description: 'Blue colored topic',
    group: 'Colored',
    shape: 'rect',
    icon: '●',
    color: '#3b82f6',
    defaultSize: { width: 120, height: 40 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },
  {
    id: 'topic-green',
    name: 'Green Topic',
    description: 'Green colored topic',
    group: 'Colored',
    shape: 'rect',
    icon: '●',
    color: '#22c55e',
    defaultSize: { width: 120, height: 40 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },
  {
    id: 'topic-purple',
    name: 'Purple Topic',
    description: 'Purple colored topic',
    group: 'Colored',
    shape: 'rect',
    icon: '●',
    color: '#8b5cf6',
    defaultSize: { width: 120, height: 40 },
    ports: [
      { id: 'top', position: 'top' },
      { id: 'right', position: 'right' },
      { id: 'bottom', position: 'bottom' },
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },

  // Special Elements
  {
    id: 'callout',
    name: 'Callout',
    description: 'Callout note attached to a topic',
    group: 'Special',
    shape: 'rect',
    icon: '💬',
    color: '#fef3c7',
    defaultSize: { width: 140, height: 60 },
    ports: [
      { id: 'left', position: 'left' },
    ],
    isContainer: false,
  },
  {
    id: 'image',
    name: 'Image',
    description: 'Image placeholder',
    group: 'Special',
    shape: 'rect',
    icon: '🖼',
    color: '#e5e7eb',
    defaultSize: { width: 100, height: 80 },
    ports: [],
    isContainer: false,
    properties: [
      { id: 'imageUrl', label: 'Image URL', type: 'text' },
    ],
  },
  {
    id: 'link',
    name: 'Link',
    description: 'External link reference',
    group: 'Special',
    shape: 'rect',
    icon: '🔗',
    color: '#dbeafe',
    defaultSize: { width: 120, height: 40 },
    ports: [],
    isContainer: false,
    properties: [
      { id: 'url', label: 'URL', type: 'text' },
    ],
  },

  // Boundaries
  {
    id: 'boundary',
    name: 'Boundary',
    description: 'Group boundary around topics',
    group: 'Grouping',
    shape: 'rect',
    icon: '⬜',
    color: '#f3f4f6',
    defaultSize: { width: 250, height: 200 },
    ports: [],
    isContainer: true,
  },
  {
    id: 'summary',
    name: 'Summary',
    description: 'Summary bracket for multiple topics',
    group: 'Grouping',
    shape: 'rect',
    icon: '⊏',
    color: '#e5e7eb',
    defaultSize: { width: 30, height: 100 },
    ports: [
      { id: 'right', position: 'right' },
    ],
    isContainer: false,
  },
];

// ============ CONNECTION TYPES ============

const connectionTypes = [
  {
    id: 'branch',
    name: 'Branch',
    description: 'Standard mind map branch connection',
    style: 'solid',
    arrowStart: 'none',
    arrowEnd: 'none',
    color: '#374151',
    curved: true,
  },
  {
    id: 'arrow-branch',
    name: 'Arrow Branch',
    description: 'Branch with directional arrow',
    style: 'solid',
    arrowStart: 'none',
    arrowEnd: 'arrow',
    color: '#374151',
    curved: true,
  },
  {
    id: 'dashed-branch',
    name: 'Dashed Branch',
    description: 'Dashed connection for related topics',
    style: 'dashed',
    arrowStart: 'none',
    arrowEnd: 'none',
    color: '#6b7280',
    curved: true,
  },
  {
    id: 'relationship',
    name: 'Relationship',
    description: 'Cross-branch relationship',
    style: 'dashed',
    arrowStart: 'none',
    arrowEnd: 'arrow',
    color: '#ef4444',
    curved: true,
  },
  {
    id: 'callout-link',
    name: 'Callout Link',
    description: 'Link to callout note',
    style: 'dotted',
    arrowStart: 'none',
    arrowEnd: 'none',
    color: '#9ca3af',
  },
];

// ============ VALIDATORS ============

const validators = [
  {
    id: 'has-central-topic',
    name: 'Has Central Topic',
    description: 'Mind map should have a central topic',
    level: 'warn',
    validate: (elements) => {
      const hasCentral = elements.some(el => el.type === 'central-topic');
      if (!hasCentral) {
        return { message: 'Mind map should have a central topic' };
      }
      return null;
    },
  },
  {
    id: 'topics-connected',
    name: 'Topics Connected',
    description: 'All topics should be connected (except floating)',
    level: 'info',
    validate: (elements, connections) => {
      const topics = elements.filter(
        el => el.type !== 'floating-topic' &&
              el.type !== 'boundary' &&
              el.type !== 'callout' &&
              el.type !== 'summary'
      );
      const issues = [];

      for (const topic of topics) {
        const isConnected = connections.some(
          c => c.sourceId === topic.id || c.targetId === topic.id
        );
        if (!isConnected && topic.type !== 'central-topic') {
          issues.push({
            elementId: topic.id,
            message: `Topic "${topic.label || topic.id}" is not connected to the map`,
          });
        }
      }
      return issues.length > 0 ? issues : null;
    },
  },
  {
    id: 'topics-have-labels',
    name: 'Topics Have Labels',
    description: 'All topics should have labels',
    level: 'warn',
    validate: (elements) => {
      const unlabeled = elements.filter(
        el => (el.type.includes('topic') || el.type === 'central-topic') &&
              !el.label?.trim()
      );
      if (unlabeled.length > 0) {
        return unlabeled.map(el => ({
          elementId: el.id,
          message: 'Topic has no label',
        }));
      }
      return null;
    },
  },
];

// ============ TEMPLATES ============

const templates = [
  {
    id: 'blank',
    name: 'Blank Mind Map',
    description: 'Empty mind map with central topic',
    thumbnail: null,
    elements: [
      { id: 'center', type: 'central-topic', label: 'Main Topic', x: 400, y: 250, size: { width: 160, height: 80 } },
    ],
    connections: [],
  },
  {
    id: 'project-planning',
    name: 'Project Planning',
    description: 'Project planning mind map template',
    thumbnail: null,
    elements: [
      { id: 'center', type: 'central-topic', label: 'Project Name', x: 400, y: 250, size: { width: 160, height: 80 } },
      { id: 'm1', type: 'main-topic', label: 'Goals', x: 150, y: 100, size: { width: 120, height: 45 }, color: '#22c55e' },
      { id: 'm2', type: 'main-topic', label: 'Timeline', x: 650, y: 100, size: { width: 120, height: 45 }, color: '#3b82f6' },
      { id: 'm3', type: 'main-topic', label: 'Resources', x: 150, y: 400, size: { width: 120, height: 45 }, color: '#f59e0b' },
      { id: 'm4', type: 'main-topic', label: 'Risks', x: 650, y: 400, size: { width: 120, height: 45 }, color: '#ef4444' },
      { id: 's1', type: 'sub-topic', label: 'Goal 1', x: 30, y: 50, size: { width: 100, height: 35 } },
      { id: 's2', type: 'sub-topic', label: 'Goal 2', x: 30, y: 100, size: { width: 100, height: 35 } },
      { id: 's3', type: 'sub-topic', label: 'Phase 1', x: 780, y: 50, size: { width: 100, height: 35 } },
      { id: 's4', type: 'sub-topic', label: 'Phase 2', x: 780, y: 100, size: { width: 100, height: 35 } },
    ],
    connections: [
      { id: 'c1', sourceId: 'center', targetId: 'm1', type: 'branch' },
      { id: 'c2', sourceId: 'center', targetId: 'm2', type: 'branch' },
      { id: 'c3', sourceId: 'center', targetId: 'm3', type: 'branch' },
      { id: 'c4', sourceId: 'center', targetId: 'm4', type: 'branch' },
      { id: 'c5', sourceId: 'm1', targetId: 's1', type: 'branch' },
      { id: 'c6', sourceId: 'm1', targetId: 's2', type: 'branch' },
      { id: 'c7', sourceId: 'm2', targetId: 's3', type: 'branch' },
      { id: 'c8', sourceId: 'm2', targetId: 's4', type: 'branch' },
    ],
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    description: 'Brainstorming session template',
    thumbnail: null,
    elements: [
      { id: 'center', type: 'central-topic', label: 'Topic', x: 400, y: 250, size: { width: 140, height: 70 } },
      { id: 'm1', type: 'main-topic', label: 'Idea 1', x: 200, y: 150, size: { width: 100, height: 40 } },
      { id: 'm2', type: 'main-topic', label: 'Idea 2', x: 600, y: 150, size: { width: 100, height: 40 } },
      { id: 'm3', type: 'main-topic', label: 'Idea 3', x: 200, y: 350, size: { width: 100, height: 40 } },
      { id: 'm4', type: 'main-topic', label: 'Idea 4', x: 600, y: 350, size: { width: 100, height: 40 } },
    ],
    connections: [
      { id: 'c1', sourceId: 'center', targetId: 'm1', type: 'branch' },
      { id: 'c2', sourceId: 'center', targetId: 'm2', type: 'branch' },
      { id: 'c3', sourceId: 'center', targetId: 'm3', type: 'branch' },
      { id: 'c4', sourceId: 'center', targetId: 'm4', type: 'branch' },
    ],
  },
  {
    id: 'decision-tree',
    name: 'Decision Tree',
    description: 'Simple decision tree structure',
    thumbnail: null,
    elements: [
      { id: 'root', type: 'central-topic', label: 'Decision', x: 400, y: 50, size: { width: 140, height: 60 } },
      { id: 'o1', type: 'main-topic', label: 'Option A', x: 200, y: 180, size: { width: 120, height: 45 } },
      { id: 'o2', type: 'main-topic', label: 'Option B', x: 600, y: 180, size: { width: 120, height: 45 } },
      { id: 'r1', type: 'sub-topic', label: 'Outcome A1', x: 100, y: 300, size: { width: 100, height: 35 } },
      { id: 'r2', type: 'sub-topic', label: 'Outcome A2', x: 250, y: 300, size: { width: 100, height: 35 } },
      { id: 'r3', type: 'sub-topic', label: 'Outcome B1', x: 500, y: 300, size: { width: 100, height: 35 } },
      { id: 'r4', type: 'sub-topic', label: 'Outcome B2', x: 650, y: 300, size: { width: 100, height: 35 } },
    ],
    connections: [
      { id: 'c1', sourceId: 'root', targetId: 'o1', type: 'arrow-branch' },
      { id: 'c2', sourceId: 'root', targetId: 'o2', type: 'arrow-branch' },
      { id: 'c3', sourceId: 'o1', targetId: 'r1', type: 'arrow-branch' },
      { id: 'c4', sourceId: 'o1', targetId: 'r2', type: 'arrow-branch' },
      { id: 'c5', sourceId: 'o2', targetId: 'r3', type: 'arrow-branch' },
      { id: 'c6', sourceId: 'o2', targetId: 'r4', type: 'arrow-branch' },
    ],
  },
];

// ============ NODE PROPERTIES ============

const nodeProperties = [
  { id: 'notes', label: 'Notes', type: 'textarea' },
  { id: 'tags', label: 'Tags', type: 'list' },
  { id: 'dueDate', label: 'Due Date', type: 'text' },
  { id: 'assignee', label: 'Assignee', type: 'text' },
];

// ============ PACK EXPORT ============

const MindMapPack = {
  id: 'mind-map',
  name: 'Mind Map',
  description: 'Hierarchical mind maps for idea organization',
  icon: '🧠',
  stencils,
  connectionTypes,
  validators,
  templates,
  nodeProperties,
};

export default MindMapPack;
export { stencils, connectionTypes, validators, templates, nodeProperties };
