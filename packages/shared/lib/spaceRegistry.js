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
  // Enterprise & Architecture
  ea: {
    code: 'ea',
    name: 'Enterprise Architecture',
    description: 'Map capabilities, applications, and processes',
    defaultView: 'elements',
    views: ['elements', 'decisions', 'standards', 'heatmap', 'roadmap', 'integration'],
    icon: 'Architecture',
    color: '#475569',
    requiresDomain: true,
    requiresProject: false,
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
  // Reasoning & Thinking (removed: srs, mms, np, philosophy)

  // Operations & Governance
  bsm: {
    code: 'bsm',
    name: 'Service Management',
    description: 'Service catalog and dependencies',
    defaultView: 'catalog',
    views: ['catalog', 'levels', 'consumers', 'dependencies'],
    icon: 'MiscellaneousServices',
    color: '#3b82f6',
    requiresDomain: true,
    requiresProject: false,
  },
  perf: {
    code: 'perf',
    name: 'Performance Studio',
    description: 'OKRs, KPIs, and metrics',
    defaultView: 'dashboard',
    views: ['dashboard', 'okrs', 'kpis', 'metrics'],
    icon: 'Flag',
    color: '#059669',
    requiresDomain: true,
    requiresProject: true,
  },
  gov: {
    code: 'gov',
    name: 'Governance Studio',
    description: 'Decision rights and policies',
    defaultView: 'decisions',
    views: ['decisions', 'forums', 'policies', 'escalations'],
    icon: 'Gavel',
    color: '#8b5cf6',
    requiresDomain: true,
    requiresProject: true,
  },
  risk: {
    code: 'risk',
    name: 'Risk Studio',
    description: 'Risk register and treatments',
    defaultView: 'register',
    views: ['register', 'matrix', 'treatments', 'dashboard'],
    icon: 'Shield',
    color: '#dc2626',
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
 * @returns {Object}
 */
export function getSpacesByCategory() {
  return {
    'Enterprise & Architecture': ['ea', 'sd'],
    'Delivery & Requirements': ['ba', 'pdw', 'pds'],
    'Operations & Governance': ['bsm', 'perf', 'gov', 'risk', 'cm'],
    'Learning & Work Design': ['als', 'dwd'],
    'Tools': ['diagram'],
  };
}

export default SPACES;
