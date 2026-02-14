// lib/spaceRegistry.js
// Central registry of all spaces and their configurations

/**
 * Space configuration
 * @typedef {Object} SpaceConfig
 * @property {string} code - Short code for URL (e.g., 'ea', 'ba')
 * @property {string} name - Display name
 * @property {string} description - Short description
 * @property {string} defaultView - Default view when entering space
 * @property {string[]} views - Available views in this space
 * @property {string} icon - MUI icon name
 * @property {string} color - Theme color
 * @property {boolean} requiresDomain - Whether domain context is required
 * @property {boolean} requiresProject - Whether project context is required
 */

/**
 * Studio categories for navigation grouping
 */
export const STUDIO_CATEGORIES = {
  strategy: {
    id: 'strategy',
    name: 'Strategy & Innovation',
    description: 'From ideas to investment decisions and market launch',
    order: 1,
  },
  analysis: {
    id: 'analysis',
    name: 'Analysis & Design',
    description: 'Requirements, architecture, and product discovery',
    order: 2,
  },
  modeling: {
    id: 'modeling',
    name: 'Modeling & Architecture',
    description: 'Knowledge graph, diagrams, and system models',
    order: 3,
  },
  delivery: {
    id: 'delivery',
    name: 'Ways of Working',
    description: 'Project delivery and work design',
    order: 4,
  },
  personal: {
    id: 'personal',
    name: 'Personal Tools',
    description: 'Personal learning and reasoning workspaces',
    order: 5,
    collapsed: true,
  },
};

export const SPACES = {
  // Strategy & Innovation
  blueprint: {
    code: 'blueprint',
    name: 'Blueprint Studio',
    category: 'strategy',
    description: 'Ideas to investment decisions through stage-gate process',
    defaultView: 'overview',
    views: [
      // Form views (create/edit initiative)
      'new', 'edit',
      // Overview section (portfolio level)
      'overview', 'initiatives', 'dashboard',
      // Ideation section - Product Ideas discovery (initiative-scoped)
      'pipeline', 'health', 'discovery', 'idea', 'explore', 'assess',
      // Market section (initiative-scoped)
      'market', 'tamsam', 'competitors', 'pestle', 'segments',
      // Decision section - Business Case & Approval (initiative-level)
      'summary', 'case', 'approval',
      // Governance section (initiative-scoped)
      'gates', 'sla', 'risk',
      // Tools section (mixed scope)
      'tools', 'value-prop', 'lean', 'assumptions', 'swot', 'rice', 'matrix', 'weighted', 'compare',
    ],
    icon: 'Lightbulb',
    color: '#059669', // emerald
    requiresDomain: true,
    requiresProject: true,
  },
  analysis: {
    code: 'analysis',
    name: 'Analysis Studio',
    category: 'analysis',
    description: 'Requirements, architecture decisions, traceability, and UX design',
    defaultView: 'projects',
    views: [
      // Core discipline views
      'projects', 'requirements', 'stories', 'architecture', 'data', 'design', 'testing', 'stakeholders', 'trace',
      // BA views (merged from Business Analysis studio)
      'repository', 'kanban', 'documents', 'story-map',
    ],
    icon: 'Assignment',
    color: '#0284c7', // sky blue
    requiresDomain: true,
    requiresProject: true,
  },
  enterprise: {
    code: 'enterprise',
    name: 'Enterprise Studio',
    category: 'modeling',
    description: 'Capabilities, applications, technology, governance, and value',
    defaultView: 'dashboard',
    views: ['dashboard', 'capabilities', 'services', 'products', 'applications', 'technology', 'governance', 'risk', 'value', 'organisation', 'data'],
    icon: 'Architecture',
    color: '#6366f1', // indigo
    requiresDomain: true,
    requiresProject: false,
  },
  gtm: {
    code: 'gtm',
    name: 'GTM Studio',
    category: 'strategy',
    description: 'Go-to-market strategy, messaging, and launch readiness',
    defaultView: 'overview',
    views: ['overview', 'strategy', 'messaging', 'launch', 'campaigns', 'enablement', 'metrics'],
    icon: 'Rocket',
    color: '#dc2626', // red
    requiresDomain: true,
    requiresProject: false,
  },

  // Personal Tools
  mindlab: {
    code: 'mindlab',
    name: 'Mind Lab',
    category: 'personal',
    description: 'Personal thinking workspace for reasoning, sensemaking, and reflection',
    defaultView: 'reasoning',
    views: ['reasoning', 'sensemaking', 'philosophy', 'negotiation'],
    icon: 'Psychology',
    color: '#8b5cf6',
    requiresDomain: false,
    requiresProject: false,
    isPersonal: true,
    customUrl: '/app/thinking',
  },
  sd: {
    code: 'sd',
    name: 'System Dynamics',
    category: 'modeling',
    description: 'Model feedback loops and system behavior',
    defaultView: 'canvas',
    views: ['canvas', 'loops', 'analysis'],
    icon: 'Loop',
    color: '#78716c',
    requiresDomain: true,
    requiresProject: false,
  },
  // Analysis & Design
  ba: {
    code: 'ba',
    name: 'Business Analysis',
    category: 'analysis',
    description: 'Capture and trace requirements end-to-end',
    defaultView: 'repository',
    views: ['repository', 'kanban', 'documents', 'trace', 'story-map'],
    icon: 'Assignment',
    color: '#475569',
    requiresDomain: true,
    requiresProject: true,
    deprecated: true,          // Merged into Analysis Studio
    redirectTo: 'analysis',    // Redirect target space
    hidden: true,              // Hide from navigation
  },
  pdw: {
    code: 'pdw',
    name: 'Product Design',
    category: 'analysis',
    description: 'Discovery before commitment',
    defaultView: 'discovery',
    views: ['discovery', 'canvas', 'validation', 'decisions', 'learning'],
    icon: 'Lightbulb',
    color: '#64748b',
    requiresDomain: true,
    requiresProject: false,
  },
  pds: {
    code: 'pds',
    name: 'Project Design',
    category: 'delivery',
    description: 'Plan and manage project delivery',
    defaultView: 'overview',
    views: [
      // Main views
      'overview', 'timeline', 'story',
      // Stage views
      'intent', 'structure', 'risk', 'execution', 'learning',
      // Tool views
      'stakeholders', 'risks', 'dependencies', 'wbs',
      'assumptions', 'raid', 'progress', 'lessons',
    ],
    icon: 'AccountTree',
    color: '#0d9488',
    requiresDomain: true,
    requiresProject: true,
  },
  als: {
    code: 'als',
    name: 'Learning Studio',
    category: 'personal',
    description: 'Academic learning and meta-cognition',
    defaultView: 'sessions',
    views: ['sessions', 'reflections', 'progress'],
    icon: 'School',
    color: '#10b981',
    requiresDomain: true,
    requiresProject: false,
  },
  dwd: {
    code: 'dwd',
    name: 'Dynamic Work Design',
    category: 'delivery',
    description: 'Diagnose work structure and patterns',
    defaultView: 'landscape',
    views: ['landscape', 'actors', 'patterns', 'experiments', 'adjustments'],
    icon: 'Build',
    color: '#6366f1',
    requiresDomain: true,
    requiresProject: true,
  },

  // Modeling & Architecture
  diagram: {
    code: 'diagram',
    name: 'Diagram Studio',
    category: 'modeling',
    description: 'Visual diagramming workspace',
    defaultView: 'canvas',
    views: ['canvas'],
    icon: 'Draw',
    color: '#6366f1',
    requiresDomain: true,
    requiresProject: false,
  },

  perf: {
    code: 'perf',
    name: 'Performance Studio',
    category: 'strategy',
    description: 'OKR management, KPI tracking, and performance monitoring',
    defaultView: 'dashboard',
    views: ['dashboard', 'objectives', 'kpis', 'scorecard', 'list'],
    icon: 'Speed',
    color: '#d97706',
    requiresDomain: true,
    requiresProject: false,
  },

  ks: {
    code: 'ks',
    name: 'Knowledge Studio',
    category: 'modeling',
    description: 'Explore and manage the knowledge graph',
    defaultView: 'navigator',
    views: ['overview', 'navigator', 'browser', 'nodes', 'node-types', 'relationships', 'relationship-types'],
    icon: 'Hub',
    color: '#6366f1',
    requiresDomain: true,
    requiresProject: false,
  },

};

/**
 * Get space configuration by code
 * @param {string} code
 * @returns {SpaceConfig|null}
 */
export function getSpace(code) {
  return SPACES[code] || null;
}

/**
 * Get all spaces as array
 * @returns {SpaceConfig[]}
 */
export function getAllSpaces() {
  return Object.values(SPACES);
}

/**
 * Check if a view is valid for a space
 * @param {string} spaceCode
 * @param {string} viewCode
 * @returns {boolean}
 */
export function isValidView(spaceCode, viewCode) {
  const space = getSpace(spaceCode);
  return space ? space.views.includes(viewCode) : false;
}

/**
 * Get default view for a space
 * @param {string} spaceCode
 * @returns {string|null}
 */
export function getDefaultView(spaceCode) {
  const space = getSpace(spaceCode);
  return space ? space.defaultView : null;
}

/**
 * Group spaces by category using the category field on each space
 * @returns {Array<{category: Object, spaces: SpaceConfig[]}>}
 */
export function getSpacesByCategory() {
  const grouped = {};

  for (const space of Object.values(SPACES)) {
    if (space.hidden) continue; // Skip hidden/deprecated spaces
    const catId = space.category || 'other';
    if (!grouped[catId]) {
      grouped[catId] = [];
    }
    grouped[catId].push(space);
  }

  return Object.entries(STUDIO_CATEGORIES)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([catId, category]) => ({
      category,
      spaces: grouped[catId] || [],
    }))
    .filter(g => g.spaces.length > 0);
}

/**
 * Legacy flat grouping (for backwards compatibility)
 * @returns {Object}
 */
export function getSpacesByCategoryFlat() {
  const result = {};
  for (const { category, spaces } of getSpacesByCategory()) {
    result[category.name] = spaces.map(s => s.code);
  }
  return result;
}

export default SPACES;
