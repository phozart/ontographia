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

export const SPACES = {
  // Main Flow Studios (new consolidated studios)
  blueprint: {
    code: 'blueprint',
    name: 'Blueprint Studio',
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
    description: 'Requirements, architecture decisions, and UX design',
    defaultView: 'projects',
    views: ['projects', 'requirements', 'stories', 'architecture', 'data', 'design', 'testing', 'stakeholders', 'trace'],
    icon: 'Assignment',
    color: '#0284c7', // sky blue
    requiresDomain: true,
    requiresProject: true,
  },
  enterprise: {
    code: 'enterprise',
    name: 'Enterprise Studio',
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
    description: 'Go-to-market strategy, messaging, and launch readiness',
    defaultView: 'overview',
    views: ['overview', 'strategy', 'messaging', 'launch', 'campaigns', 'enablement', 'metrics'],
    icon: 'Rocket',
    color: '#dc2626', // red
    requiresDomain: true,
    requiresProject: false,
  },

  // Thinking Tools
  mindlab: {
    code: 'mindlab',
    name: 'Mind Lab',
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
    description: 'Model feedback loops and system behavior',
    defaultView: 'canvas',
    views: ['canvas', 'loops', 'analysis'],
    icon: 'Loop',
    color: '#78716c',
    requiresDomain: true,
    requiresProject: false,
  },
  // Delivery & Requirements
  ba: {
    code: 'ba',
    name: 'Business Analysis',
    description: 'Capture and trace requirements end-to-end',
    defaultView: 'repository',
    views: ['repository', 'kanban', 'documents', 'trace', 'story-map'],
    icon: 'Assignment',
    color: '#475569',
    requiresDomain: true,
    requiresProject: true,
  },
  pdw: {
    code: 'pdw',
    name: 'Product Design',
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
  // Learning & Work Design
  als: {
    code: 'als',
    name: 'Learning Studio',
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
    description: 'Diagnose work structure and patterns',
    defaultView: 'landscape',
    views: ['landscape', 'actors', 'patterns', 'experiments', 'adjustments'],
    icon: 'Build',
    color: '#6366f1',
    requiresDomain: true,
    requiresProject: true,
  },

  // Diagram Studio (standalone)
  diagram: {
    code: 'diagram',
    name: 'Diagram Studio',
    description: 'Visual diagramming workspace',
    defaultView: 'canvas',
    views: ['canvas'],
    icon: 'Draw',
    color: '#6366f1',
    requiresDomain: true,
    requiresProject: false,
  },

  // Knowledge Studio
  ks: {
    code: 'ks',
    name: 'Knowledge Studio',
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
 * Group spaces by category
 * IMPORTANT: Each space should appear in only one primary category to avoid duplicates
 * @returns {Object}
 */
export function getSpacesByCategory() {
  return {
    // Primary categories (used for menu structure)
    'Main Flow': ['blueprint', 'analysis', 'pds', 'enterprise', 'gtm'],
    'Thinking Tools': ['mindlab', 'sd', 'dwd', 'als'],
    'Infrastructure': ['diagram', 'ks'],
  };
}

export default SPACES;
