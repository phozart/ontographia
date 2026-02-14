/**
 * EA Validation Engine for ArchiMate
 *
 * Implements:
 * - EN-090: Relationship validation engine (validate source-target pairs)
 * - EN-091: Element deletion cascade check (prevent orphan relationships)
 *
 * Based on ArchiMate 3.1 specification relationship validity rules
 */

// ============================================================================
// ELEMENT CATEGORIES BY ASPECT
// ============================================================================

/**
 * Element types grouped by aspect (used for relationship validation)
 */
export const ELEMENT_ASPECTS = {
  // Active structure elements (actors, roles, components)
  activeStructure: [
    // Strategy
    'Resource',
    // Business
    'BusinessActor', 'BusinessRole', 'BusinessCollaboration', 'BusinessInterface',
    // Application
    'ApplicationComponent', 'ApplicationCollaboration', 'ApplicationInterface',
    // Technology
    'Node', 'Device', 'SystemSoftware', 'TechnologyCollaboration', 'TechnologyInterface',
    'Path', 'CommunicationNetwork',
    // Physical
    'Facility', 'Equipment', 'DistributionNetwork',
  ],

  // Behavior elements (processes, functions, events, services)
  behavior: [
    // Strategy
    'Capability', 'ValueStream', 'CourseOfAction',
    // Business
    'BusinessProcess', 'BusinessFunction', 'BusinessInteraction', 'BusinessEvent', 'BusinessService',
    // Application
    'ApplicationFunction', 'ApplicationInteraction', 'ApplicationProcess', 'ApplicationEvent', 'ApplicationService',
    // Technology
    'TechnologyFunction', 'TechnologyProcess', 'TechnologyInteraction', 'TechnologyEvent', 'TechnologyService',
  ],

  // Passive structure elements (objects, data)
  passiveStructure: [
    // Business
    'BusinessObject', 'Contract', 'Representation', 'Product',
    // Application
    'DataObject',
    // Technology
    'Artifact',
    // Physical
    'Material',
  ],

  // Motivation elements
  motivation: [
    'Stakeholder', 'Driver', 'Assessment', 'Goal', 'Outcome', 'Principle',
    'Requirement', 'Constraint', 'Meaning', 'Value',
  ],

  // Implementation & Migration elements
  implementationMigration: [
    'WorkPackage', 'Deliverable', 'ImplementationEvent', 'Plateau', 'Gap',
  ],

  // Composite elements
  composite: [
    'Location', 'Grouping',
  ],
};

/**
 * All element types by layer
 */
export const ELEMENTS_BY_LAYER = {
  strategy: ['Resource', 'Capability', 'ValueStream', 'CourseOfAction'],
  business: [
    'BusinessActor', 'BusinessRole', 'BusinessCollaboration', 'BusinessInterface',
    'BusinessProcess', 'BusinessFunction', 'BusinessInteraction', 'BusinessEvent', 'BusinessService',
    'BusinessObject', 'Contract', 'Representation', 'Product',
  ],
  application: [
    'ApplicationComponent', 'ApplicationCollaboration', 'ApplicationInterface',
    'ApplicationFunction', 'ApplicationInteraction', 'ApplicationProcess', 'ApplicationEvent', 'ApplicationService',
    'DataObject',
  ],
  technology: [
    'Node', 'Device', 'SystemSoftware', 'TechnologyCollaboration', 'TechnologyInterface',
    'Path', 'CommunicationNetwork',
    'TechnologyFunction', 'TechnologyProcess', 'TechnologyInteraction', 'TechnologyEvent', 'TechnologyService',
    'Artifact',
  ],
  physical: ['Facility', 'Equipment', 'DistributionNetwork', 'Material'],
  motivation: [
    'Stakeholder', 'Driver', 'Assessment', 'Goal', 'Outcome', 'Principle',
    'Requirement', 'Constraint', 'Meaning', 'Value',
  ],
  implementation: ['WorkPackage', 'Deliverable', 'ImplementationEvent', 'Plateau', 'Gap'],
  composite: ['Location', 'Grouping'],
};

// ============================================================================
// RELATIONSHIP VALIDITY MATRIX
// ============================================================================

/**
 * ArchiMate relationship validity rules
 *
 * Key patterns:
 * - Structural relationships (composition, aggregation) between same-type elements
 * - Assignment links active structure to behavior
 * - Realization links behavior/structure to more abstract concepts
 * - Serving provides functionality
 * - Access links behavior to passive structure
 * - Influence between motivation elements
 * - Triggering/Flow between behavior elements
 * - Specialization within same element category
 */

const ALL_ELEMENTS = [
  ...ELEMENTS_BY_LAYER.strategy,
  ...ELEMENTS_BY_LAYER.business,
  ...ELEMENTS_BY_LAYER.application,
  ...ELEMENTS_BY_LAYER.technology,
  ...ELEMENTS_BY_LAYER.physical,
  ...ELEMENTS_BY_LAYER.motivation,
  ...ELEMENTS_BY_LAYER.implementation,
  ...ELEMENTS_BY_LAYER.composite,
];

/**
 * Relationship validity rules
 * Each entry defines valid source and target types for a relationship
 */
export const RELATIONSHIP_VALIDITY = {
  composition: {
    description: 'Element consists of other elements (strong containment)',
    // Composition is valid within the same aspect/category
    validPairs: [
      // Active structure can compose other active structure of same layer
      { from: ELEMENT_ASPECTS.activeStructure, to: ELEMENT_ASPECTS.activeStructure },
      // Behavior can compose other behavior of same layer
      { from: ELEMENT_ASPECTS.behavior, to: ELEMENT_ASPECTS.behavior },
      // Passive structure can compose other passive structure
      { from: ELEMENT_ASPECTS.passiveStructure, to: ELEMENT_ASPECTS.passiveStructure },
      // Motivation elements can compose
      { from: ELEMENT_ASPECTS.motivation, to: ELEMENT_ASPECTS.motivation },
      // Composite elements
      { from: ['Grouping'], to: ALL_ELEMENTS },
      { from: ['Location'], to: ELEMENT_ASPECTS.activeStructure },
    ],
  },

  aggregation: {
    description: 'Element groups other elements (weak containment)',
    // Aggregation follows similar rules to composition but is looser
    validPairs: [
      { from: ELEMENT_ASPECTS.activeStructure, to: ELEMENT_ASPECTS.activeStructure },
      { from: ELEMENT_ASPECTS.behavior, to: ELEMENT_ASPECTS.behavior },
      { from: ELEMENT_ASPECTS.passiveStructure, to: ELEMENT_ASPECTS.passiveStructure },
      { from: ELEMENT_ASPECTS.motivation, to: ELEMENT_ASPECTS.motivation },
      { from: ['Grouping'], to: ALL_ELEMENTS },
      { from: ['Plateau'], to: ALL_ELEMENTS },
    ],
  },

  assignment: {
    description: 'Active structure performs/executes behavior',
    validPairs: [
      // Business layer
      { from: ['BusinessActor', 'BusinessRole', 'BusinessCollaboration'],
        to: ['BusinessProcess', 'BusinessFunction', 'BusinessInteraction', 'BusinessEvent'] },
      // Application layer
      { from: ['ApplicationComponent', 'ApplicationCollaboration'],
        to: ['ApplicationFunction', 'ApplicationProcess', 'ApplicationInteraction', 'ApplicationEvent'] },
      // Technology layer
      { from: ['Node', 'Device', 'SystemSoftware', 'TechnologyCollaboration'],
        to: ['TechnologyFunction', 'TechnologyProcess', 'TechnologyInteraction', 'TechnologyEvent'] },
      // Deployment (tech to app)
      { from: ['Node', 'Device', 'SystemSoftware'], to: ['ApplicationComponent', 'DataObject', 'Artifact'] },
      // Physical layer
      { from: ['Facility', 'Equipment'], to: ['Node', 'Device', 'Material'] },
    ],
  },

  realization: {
    description: 'More concrete element realizes more abstract element',
    validPairs: [
      // Behavior realizes service
      { from: ['BusinessProcess', 'BusinessFunction', 'BusinessInteraction'], to: ['BusinessService'] },
      { from: ['ApplicationFunction', 'ApplicationProcess', 'ApplicationInteraction'], to: ['ApplicationService'] },
      { from: ['TechnologyFunction', 'TechnologyProcess', 'TechnologyInteraction'], to: ['TechnologyService'] },
      // Structure realizes passive structure
      { from: ['ApplicationComponent'], to: ['DataObject'] },
      { from: ['Artifact'], to: ['DataObject'] },
      // Core layer realizes strategy
      { from: ELEMENTS_BY_LAYER.business, to: ['Capability', 'CourseOfAction'] },
      { from: ELEMENTS_BY_LAYER.application, to: ['Capability'] },
      // Motivation realization
      { from: ['CourseOfAction'], to: ['Goal', 'Requirement'] },
      { from: ELEMENT_ASPECTS.behavior, to: ['Requirement'] },
      // Implementation realization
      { from: ['WorkPackage'], to: ['Deliverable'] },
      { from: ['Deliverable'], to: ELEMENT_ASPECTS.behavior.concat(ELEMENT_ASPECTS.passiveStructure) },
      // Plateau realization
      { from: ['Plateau'], to: ALL_ELEMENTS },
    ],
  },

  serving: {
    description: 'Element provides functionality to another',
    validPairs: [
      // Services serve other elements
      { from: ['BusinessService'], to: ['BusinessActor', 'BusinessRole', 'BusinessProcess', 'BusinessFunction', 'BusinessInteraction'] },
      { from: ['ApplicationService'], to: ['BusinessProcess', 'BusinessFunction', 'ApplicationComponent', 'ApplicationFunction', 'ApplicationProcess'] },
      { from: ['TechnologyService'], to: ['ApplicationComponent', 'ApplicationFunction', 'Node', 'TechnologyFunction'] },
      // Components serving
      { from: ['ApplicationComponent'], to: ['ApplicationComponent', 'BusinessProcess', 'BusinessFunction'] },
      { from: ['Node', 'Device', 'SystemSoftware'], to: ['ApplicationComponent', 'Node'] },
      // Interface serving
      { from: ['BusinessInterface', 'ApplicationInterface', 'TechnologyInterface'], to: ALL_ELEMENTS },
    ],
  },

  access: {
    description: 'Behavior accesses (reads/writes) passive structure',
    validPairs: [
      // Business behavior accesses business objects
      { from: ['BusinessProcess', 'BusinessFunction', 'BusinessInteraction', 'BusinessEvent', 'BusinessService'],
        to: ['BusinessObject', 'Contract', 'Representation'] },
      // Application behavior accesses data
      { from: ['ApplicationFunction', 'ApplicationProcess', 'ApplicationInteraction', 'ApplicationEvent', 'ApplicationService'],
        to: ['DataObject'] },
      // Technology behavior accesses artifacts
      { from: ['TechnologyFunction', 'TechnologyProcess', 'TechnologyInteraction', 'TechnologyEvent', 'TechnologyService'],
        to: ['Artifact'] },
    ],
  },

  influence: {
    description: 'Element affects another (typically in motivation layer)',
    validPairs: [
      // Motivation elements influence each other
      { from: ELEMENT_ASPECTS.motivation, to: ELEMENT_ASPECTS.motivation },
      // Requirements influence core elements
      { from: ['Requirement', 'Constraint', 'Principle'], to: ALL_ELEMENTS },
      // Drivers influence goals
      { from: ['Driver'], to: ['Goal', 'Assessment', 'Principle'] },
      // Assessment influences
      { from: ['Assessment'], to: ['Goal', 'Driver', 'Principle', 'Requirement'] },
    ],
  },

  triggering: {
    description: 'Element initiates another (control flow)',
    validPairs: [
      // Events trigger behavior
      { from: ['BusinessEvent'], to: ['BusinessProcess', 'BusinessFunction', 'BusinessInteraction'] },
      { from: ['ApplicationEvent'], to: ['ApplicationProcess', 'ApplicationFunction', 'ApplicationInteraction'] },
      { from: ['TechnologyEvent'], to: ['TechnologyProcess', 'TechnologyFunction', 'TechnologyInteraction'] },
      { from: ['ImplementationEvent'], to: ['WorkPackage'] },
      // Behavior triggers behavior
      { from: ['BusinessProcess', 'BusinessFunction', 'BusinessInteraction'],
        to: ['BusinessProcess', 'BusinessFunction', 'BusinessInteraction', 'BusinessEvent'] },
      { from: ['ApplicationProcess', 'ApplicationFunction', 'ApplicationInteraction'],
        to: ['ApplicationProcess', 'ApplicationFunction', 'ApplicationInteraction', 'ApplicationEvent'] },
      { from: ['TechnologyProcess', 'TechnologyFunction', 'TechnologyInteraction'],
        to: ['TechnologyProcess', 'TechnologyFunction', 'TechnologyInteraction', 'TechnologyEvent'] },
      // Capability/Value Stream triggering
      { from: ['Capability'], to: ['Capability'] },
      { from: ['ValueStream'], to: ['ValueStream', 'Capability'] },
    ],
  },

  flow: {
    description: 'Transfer of data/material between elements',
    validPairs: [
      // Data flow between behavior
      { from: ELEMENT_ASPECTS.behavior, to: ELEMENT_ASPECTS.behavior },
      // Flow through passive structure
      { from: ELEMENT_ASPECTS.passiveStructure, to: ELEMENT_ASPECTS.behavior },
      { from: ELEMENT_ASPECTS.behavior, to: ELEMENT_ASPECTS.passiveStructure },
    ],
  },

  specialization: {
    description: 'Element is a more specific form of another',
    validPairs: [
      // Same type specialization (inheritance)
      ...ALL_ELEMENTS.map(type => ({ from: [type], to: [type] })),
    ],
  },

  association: {
    description: 'Unspecified relationship (use sparingly)',
    // Association is valid between any elements
    validPairs: [
      { from: ALL_ELEMENTS, to: ALL_ELEMENTS },
    ],
  },
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if a relationship type is valid between two element types
 * @param {string} relationshipType - The relationship type (e.g., 'composition', 'serving')
 * @param {string} sourceType - The source element type
 * @param {string} targetType - The target element type
 * @returns {{valid: boolean, reason?: string}}
 */
export function validateRelationship(relationshipType, sourceType, targetType) {
  const rules = RELATIONSHIP_VALIDITY[relationshipType];

  if (!rules) {
    return {
      valid: false,
      reason: `Unknown relationship type: ${relationshipType}`,
    };
  }

  // Check if source and target types exist
  if (!ALL_ELEMENTS.includes(sourceType)) {
    return {
      valid: false,
      reason: `Unknown source element type: ${sourceType}`,
    };
  }

  if (!ALL_ELEMENTS.includes(targetType)) {
    return {
      valid: false,
      reason: `Unknown target element type: ${targetType}`,
    };
  }

  // Check validity against rules
  for (const pair of rules.validPairs) {
    const sourceMatches = pair.from.includes(sourceType);
    const targetMatches = pair.to.includes(targetType);

    if (sourceMatches && targetMatches) {
      return { valid: true };
    }
  }

  return {
    valid: false,
    reason: `${relationshipType} relationship is not valid from ${sourceType} to ${targetType}`,
  };
}

/**
 * Get all valid relationship types between two element types
 * @param {string} sourceType - The source element type
 * @param {string} targetType - The target element type
 * @returns {string[]} Array of valid relationship type IDs
 */
export function getValidRelationshipTypes(sourceType, targetType) {
  const validTypes = [];

  for (const [relType, rules] of Object.entries(RELATIONSHIP_VALIDITY)) {
    for (const pair of rules.validPairs) {
      if (pair.from.includes(sourceType) && pair.to.includes(targetType)) {
        validTypes.push(relType);
        break; // Found a match, no need to check more pairs for this type
      }
    }
  }

  return validTypes;
}

/**
 * Get suggested relationship types for a source element type
 * @param {string} sourceType - The source element type
 * @returns {{relationshipType: string, targetTypes: string[]}[]}
 */
export function getSuggestedRelationships(sourceType) {
  const suggestions = [];

  for (const [relType, rules] of Object.entries(RELATIONSHIP_VALIDITY)) {
    const targetTypes = new Set();

    for (const pair of rules.validPairs) {
      if (pair.from.includes(sourceType)) {
        pair.to.forEach(t => targetTypes.add(t));
      }
    }

    if (targetTypes.size > 0) {
      suggestions.push({
        relationshipType: relType,
        targetTypes: Array.from(targetTypes),
      });
    }
  }

  return suggestions;
}

// ============================================================================
// CASCADE DELETE FUNCTIONS
// ============================================================================

/**
 * Check what would be affected by deleting an element
 * @param {string} elementId - The element ID to delete
 * @param {Array} relationships - Array of relationship objects with source_id and target_id
 * @returns {{canDelete: boolean, affectedRelationships: Array, warning?: string}}
 */
export function checkDeleteImpact(elementId, relationships) {
  const affectedRelationships = relationships.filter(
    rel => rel.source_id === elementId || rel.target_id === elementId
  );

  if (affectedRelationships.length === 0) {
    return {
      canDelete: true,
      affectedRelationships: [],
    };
  }

  return {
    canDelete: true, // We allow delete but warn about impact
    affectedRelationships,
    warning: `Deleting this element will remove ${affectedRelationships.length} relationship(s)`,
  };
}

/**
 * Get all elements that depend on a given element (through relationships)
 * @param {string} elementId - The element ID to check
 * @param {Array} elements - Array of all elements
 * @param {Array} relationships - Array of all relationships
 * @returns {Array} Elements that depend on the given element
 */
export function getDependentElements(elementId, elements, relationships) {
  const dependentIds = new Set();

  // Find elements connected through composition/aggregation where this is the "whole"
  const structuralRels = relationships.filter(
    rel => rel.source_id === elementId &&
           ['composition', 'aggregation'].includes(rel.relationship_type)
  );

  structuralRels.forEach(rel => dependentIds.add(rel.target_id));

  // Find elements that this element realizes (they might become orphaned)
  const realizationRels = relationships.filter(
    rel => rel.source_id === elementId && rel.relationship_type === 'realization'
  );

  realizationRels.forEach(rel => {
    // Check if target has other realizers
    const otherRealizers = relationships.filter(
      r => r.target_id === rel.target_id &&
           r.relationship_type === 'realization' &&
           r.source_id !== elementId
    );
    if (otherRealizers.length === 0) {
      dependentIds.add(rel.target_id);
    }
  });

  return elements.filter(el => dependentIds.has(el.id));
}

/**
 * Perform cascade delete analysis for an element
 * Returns all elements and relationships that would be affected
 * @param {string} elementId - The element ID to analyze
 * @param {Array} elements - Array of all elements
 * @param {Array} relationships - Array of all relationships
 * @param {Object} options - Options for cascade behavior
 * @returns {{
 *   element: Object,
 *   directRelationships: Array,
 *   cascadeElements: Array,
 *   cascadeRelationships: Array,
 *   warnings: string[]
 * }}
 */
export function analyzeCascadeDelete(elementId, elements, relationships, options = {}) {
  const element = elements.find(el => el.id === elementId);
  if (!element) {
    return {
      error: `Element ${elementId} not found`,
    };
  }

  const warnings = [];

  // Direct relationships
  const directRelationships = relationships.filter(
    rel => rel.source_id === elementId || rel.target_id === elementId
  );

  // Cascade elements (if configured)
  let cascadeElements = [];
  let cascadeRelationships = [];

  if (options.cascadeComposition) {
    // Find elements composed by this element
    const composedRels = relationships.filter(
      rel => rel.source_id === elementId && rel.relationship_type === 'composition'
    );

    const composedIds = composedRels.map(rel => rel.target_id);
    cascadeElements = elements.filter(el => composedIds.includes(el.id));

    // Get relationships of cascade elements
    cascadeRelationships = relationships.filter(
      rel => composedIds.includes(rel.source_id) || composedIds.includes(rel.target_id)
    );

    if (cascadeElements.length > 0) {
      warnings.push(`Cascade delete will also remove ${cascadeElements.length} composed element(s)`);
    }
  }

  // Check for orphaned services (services only realized by this element)
  const realizedServices = relationships.filter(
    rel => rel.source_id === elementId && rel.relationship_type === 'realization'
  );

  for (const rel of realizedServices) {
    const otherRealizers = relationships.filter(
      r => r.target_id === rel.target_id &&
           r.relationship_type === 'realization' &&
           r.source_id !== elementId
    );
    if (otherRealizers.length === 0) {
      const service = elements.find(el => el.id === rel.target_id);
      if (service) {
        warnings.push(`Service "${service.name}" will have no realizers after deletion`);
      }
    }
  }

  return {
    element,
    directRelationships,
    cascadeElements,
    cascadeRelationships,
    warnings,
    summary: {
      directRelationshipCount: directRelationships.length,
      cascadeElementCount: cascadeElements.length,
      cascadeRelationshipCount: cascadeRelationships.length,
      hasWarnings: warnings.length > 0,
    },
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the layer of an element type
 * @param {string} elementType - The element type
 * @returns {string|null} The layer name or null if not found
 */
export function getElementLayer(elementType) {
  for (const [layer, types] of Object.entries(ELEMENTS_BY_LAYER)) {
    if (types.includes(elementType)) {
      return layer;
    }
  }
  return null;
}

/**
 * Get the aspect of an element type
 * @param {string} elementType - The element type
 * @returns {string|null} The aspect name or null if not found
 */
export function getElementAspect(elementType) {
  for (const [aspect, types] of Object.entries(ELEMENT_ASPECTS)) {
    if (types.includes(elementType)) {
      return aspect;
    }
  }
  return null;
}

/**
 * Check if two elements are in the same layer
 * @param {string} type1 - First element type
 * @param {string} type2 - Second element type
 * @returns {boolean}
 */
export function areSameLayer(type1, type2) {
  const layer1 = getElementLayer(type1);
  const layer2 = getElementLayer(type2);
  return layer1 !== null && layer1 === layer2;
}

/**
 * Check if two elements are in the same aspect
 * @param {string} type1 - First element type
 * @param {string} type2 - Second element type
 * @returns {boolean}
 */
export function areSameAspect(type1, type2) {
  const aspect1 = getElementAspect(type1);
  const aspect2 = getElementAspect(type2);
  return aspect1 !== null && aspect1 === aspect2;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Constants
  ELEMENT_ASPECTS,
  ELEMENTS_BY_LAYER,
  RELATIONSHIP_VALIDITY,

  // Validation
  validateRelationship,
  getValidRelationshipTypes,
  getSuggestedRelationships,

  // Cascade delete
  checkDeleteImpact,
  getDependentElements,
  analyzeCascadeDelete,

  // Helpers
  getElementLayer,
  getElementAspect,
  areSameLayer,
  areSameAspect,
};
