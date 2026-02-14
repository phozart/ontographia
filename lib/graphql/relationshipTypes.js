// lib/graphql/relationshipTypes.js
// Relationship Type Registry for Ontographia Knowledge Graph
// KG-002: Relationship Type Registry

/**
 * Relationship types registry with metadata
 * Each type defines:
 * - label: Display name for the relationship
 * - inverse: Label when traversed in reverse direction
 * - spaces: Array of spaces where this relationship is valid (* means all)
 * - category: Grouping for UI display
 * - description: Explanation of the relationship semantics
 */
export const RELATIONSHIP_TYPES = Object.freeze({
  // ============ Requirements Relationships (BA space) ============
  DERIVED_FROM: {
    label: 'Derived From',
    inverse: 'Derives',
    spaces: ['ba'],
    category: 'traceability',
    description: 'Requirement derived from a higher-level requirement or business need',
  },
  REALIZES: {
    label: 'Realizes',
    inverse: 'Realized By',
    spaces: ['ba', 'ea'],
    category: 'traceability',
    description: 'Solution element that implements a requirement or capability',
  },
  SATISFIES: {
    label: 'Satisfies',
    inverse: 'Satisfied By',
    spaces: ['ba'],
    category: 'traceability',
    description: 'Requirement that fulfills a stakeholder need',
  },
  REFINES: {
    label: 'Refines',
    inverse: 'Refined By',
    spaces: ['ba'],
    category: 'traceability',
    description: 'Detailed requirement that elaborates on a higher-level one',
  },
  VALIDATES: {
    label: 'Validates',
    inverse: 'Validated By',
    spaces: ['ba'],
    category: 'verification',
    description: 'Test or verification that confirms a requirement',
  },
  CONFLICTS_WITH: {
    label: 'Conflicts With',
    inverse: 'Conflicts With',
    spaces: ['ba'],
    category: 'analysis',
    description: 'Requirements that cannot both be satisfied',
  },

  // ============ EA / Architecture Relationships ============
  AGGREGATES: {
    label: 'Aggregates',
    inverse: 'Part Of',
    spaces: ['ea', 'cap'],
    category: 'composition',
    description: 'Parent-child containment relationship',
  },
  USES: {
    label: 'Uses',
    inverse: 'Used By',
    spaces: ['ea'],
    category: 'dependency',
    description: 'Element that uses or consumes another element',
  },
  SERVES: {
    label: 'Serves',
    inverse: 'Served By',
    spaces: ['ea', 'cap'],
    category: 'service',
    description: 'Element that provides service to another',
  },
  FLOWS_TO: {
    label: 'Flows To',
    inverse: 'Flows From',
    spaces: ['ea'],
    category: 'flow',
    description: 'Data or information flow between elements',
  },
  ACCESSES: {
    label: 'Accesses',
    inverse: 'Accessed By',
    spaces: ['ea'],
    category: 'data',
    description: 'Element that reads or writes data',
  },
  ASSIGNED_TO: {
    label: 'Assigned To',
    inverse: 'Assigned From',
    spaces: ['ea'],
    category: 'allocation',
    description: 'Work or responsibility allocation',
  },
  INFLUENCES: {
    label: 'Influences',
    inverse: 'Influenced By',
    spaces: ['ea', 'sd'],
    category: 'impact',
    description: 'Indirect effect or influence relationship',
  },
  SPECIALIZES: {
    label: 'Specializes',
    inverse: 'Generalized By',
    spaces: ['ea'],
    category: 'inheritance',
    description: 'Specific variant of a general element',
  },

  // ============ Capability / Organization Relationships ============
  ENABLES: {
    label: 'Enables',
    inverse: 'Enabled By',
    spaces: ['cap', 'ea'],
    category: 'capability',
    description: 'Element that enables a capability or outcome',
  },
  OWNS: {
    label: 'Owns',
    inverse: 'Owned By',
    spaces: ['cap'],
    category: 'governance',
    description: 'Ownership or accountability relationship',
  },
  MEASURES: {
    label: 'Measures',
    inverse: 'Measured By',
    spaces: ['cap', 'perf'],
    category: 'metrics',
    description: 'KPI or metric that measures performance',
  },

  // ============ Project / Portfolio Relationships ============
  PRECEDES: {
    label: 'Precedes',
    inverse: 'Follows',
    spaces: ['pds', 'portfolio'],
    category: 'sequence',
    description: 'Temporal dependency - must complete before',
  },
  DELIVERS: {
    label: 'Delivers',
    inverse: 'Delivered By',
    spaces: ['pds', 'portfolio'],
    category: 'delivery',
    description: 'Project or initiative that produces a deliverable',
  },
  MITIGATES: {
    label: 'Mitigates',
    inverse: 'Mitigated By',
    spaces: ['pds', 'risk'],
    category: 'risk',
    description: 'Control or action that reduces risk',
  },
  FUNDS: {
    label: 'Funds',
    inverse: 'Funded By',
    spaces: ['portfolio'],
    category: 'financial',
    description: 'Budget allocation relationship',
  },

  // ============ Cross-Space / Universal Relationships ============
  SUPPORTS: {
    label: 'Supports',
    inverse: 'Supported By',
    spaces: ['*'],
    category: 'cross-space',
    description: 'General support or contribution relationship',
  },
  DEPENDS_ON: {
    label: 'Depends On',
    inverse: 'Dependency Of',
    spaces: ['*'],
    category: 'cross-space',
    description: 'Hard dependency that must be satisfied',
  },
  TRACES_TO: {
    label: 'Traces To',
    inverse: 'Traced From',
    spaces: ['*'],
    category: 'cross-space',
    description: 'Traceability link across spaces',
  },
  RELATED_TO: {
    label: 'Related To',
    inverse: 'Related To',
    spaces: ['*'],
    category: 'cross-space',
    description: 'General association or reference',
  },
  IMPLEMENTS: {
    label: 'Implements',
    inverse: 'Implemented By',
    spaces: ['*'],
    category: 'cross-space',
    description: 'Technical implementation of a concept',
  },

  // ============ Causality / System Dynamics Relationships ============
  EXPLAINS: {
    label: 'Explains',
    inverse: 'Explained By',
    spaces: ['sd', 'ea'],
    category: 'reasoning',
    description: 'Causal or conceptual explanation',
  },
  CHALLENGES: {
    label: 'Challenges',
    inverse: 'Challenged By',
    spaces: ['ba', 'ea'],
    category: 'reasoning',
    description: 'Questioning or contradicting element',
  },
  IMPLIES: {
    label: 'Implies',
    inverse: 'Implied By',
    spaces: ['sd', 'ba'],
    category: 'reasoning',
    description: 'Logical implication or consequence',
  },
  CAUSES: {
    label: 'Causes',
    inverse: 'Caused By',
    spaces: ['sd'],
    category: 'causality',
    description: 'Direct causal relationship',
  },
  REINFORCES: {
    label: 'Reinforces',
    inverse: 'Reinforced By',
    spaces: ['sd'],
    category: 'feedback',
    description: 'Positive feedback loop contribution',
  },
  BALANCES: {
    label: 'Balances',
    inverse: 'Balanced By',
    spaces: ['sd'],
    category: 'feedback',
    description: 'Negative feedback loop contribution',
  },

  // ============ Dynamic Work Design Relationships ============
  PERFORMS: {
    label: 'Performs',
    inverse: 'Performed By',
    spaces: ['dwd'],
    category: 'work',
    description: 'Actor that performs work item',
  },
  PRODUCES: {
    label: 'Produces',
    inverse: 'Produced By',
    spaces: ['dwd'],
    category: 'work',
    description: 'Work that produces an output',
  },
  CONSUMES: {
    label: 'Consumes',
    inverse: 'Consumed By',
    spaces: ['dwd'],
    category: 'work',
    description: 'Work that requires an input',
  },
});

/**
 * Get all relationship types as an array
 */
export function getAllRelationshipTypes() {
  return Object.entries(RELATIONSHIP_TYPES).map(([key, value]) => ({
    id: key,
    ...value,
  }));
}

/**
 * Get relationship types valid for a specific space
 * @param {string} space - Space identifier (e.g., 'ba', 'ea', 'cap')
 * @returns {Array} Array of valid relationship types for the space
 */
export function getRelationshipTypesForSpace(space) {
  return getAllRelationshipTypes().filter(
    (type) => type.spaces.includes('*') || type.spaces.includes(space)
  );
}

/**
 * Get relationship types by category
 * @param {string} category - Category name
 * @returns {Array} Array of relationship types in the category
 */
export function getRelationshipTypesByCategory(category) {
  return getAllRelationshipTypes().filter((type) => type.category === category);
}

/**
 * Get unique categories
 * @returns {Array} Array of unique category names
 */
export function getCategories() {
  const categories = new Set();
  Object.values(RELATIONSHIP_TYPES).forEach((type) => {
    categories.add(type.category);
  });
  return Array.from(categories).sort();
}

/**
 * Check if a relationship type is valid between two spaces
 * @param {string} relationshipType - The relationship type key
 * @param {string} fromSpace - Source space
 * @param {string} toSpace - Target space
 * @returns {boolean} Whether the relationship is valid
 */
export function isValidRelationship(relationshipType, fromSpace, toSpace) {
  const type = RELATIONSHIP_TYPES[relationshipType];
  if (!type) return false;

  // Universal relationships are always valid
  if (type.spaces.includes('*')) return true;

  // Check if at least one of the spaces is in the allowed list
  return type.spaces.includes(fromSpace) || type.spaces.includes(toSpace);
}

/**
 * Get the inverse label for a relationship type
 * @param {string} relationshipType - The relationship type key
 * @returns {string|null} The inverse label or null if not found
 */
export function getInverseLabel(relationshipType) {
  const type = RELATIONSHIP_TYPES[relationshipType];
  return type ? type.inverse : null;
}

/**
 * Validate a relationship type exists
 * @param {string} relationshipType - The relationship type key
 * @returns {boolean} Whether the type exists
 */
export function isValidRelationshipType(relationshipType) {
  return relationshipType in RELATIONSHIP_TYPES;
}

export default RELATIONSHIP_TYPES;
