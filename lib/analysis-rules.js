// lib/analysis-rules.js
// Analysis Studio business rules and hierarchy definitions
// Task AN-024: Define requirement hierarchy rules
// See also: lib/analysis-types.js for full type definitions and metamodel

/**
 * ============================================================================
 * REQUIREMENT HIERARCHY RULES
 * ============================================================================
 * Requirements can be organized hierarchically. These rules define the
 * structure, depth limits, and numbering conventions.
 */

/**
 * Maximum hierarchy depth for requirements
 * Level 0 = Root requirement
 * Level 1 = First child
 * ...
 * Level 4 = Maximum nesting (5 total levels)
 */
export const MAX_HIERARCHY_DEPTH = 5;

/**
 * Numbering style options for requirements
 * @readonly
 * @enum {string}
 */
export const NUMBERING_STYLE = Object.freeze({
  SEQUENTIAL: 'sequential',     // BR-001, BR-002, BR-003
  HIERARCHICAL: 'hierarchical', // BR-1, BR-1.1, BR-1.1.1
  OUTLINE: 'outline',           // 1, 1.1, 1.1.1
  MIXED: 'mixed'                // BR-1, BR-1a, BR-1a.i
});

/**
 * Default numbering style per artefact type
 */
export const DEFAULT_NUMBERING_STYLE = {
  // Requirements
  BusinessRequirement: NUMBERING_STYLE.HIERARCHICAL,
  StakeholderRequirement: NUMBERING_STYLE.HIERARCHICAL,
  SolutionRequirement: NUMBERING_STYLE.HIERARCHICAL,
  FunctionalRequirement: NUMBERING_STYLE.HIERARCHICAL,
  NonFunctionalRequirement: NUMBERING_STYLE.SEQUENTIAL,
  QualityAttribute: NUMBERING_STYLE.SEQUENTIAL,
  BusinessRule: NUMBERING_STYLE.SEQUENTIAL,
  UseCase: NUMBERING_STYLE.SEQUENTIAL,
  // Stories
  Epic: NUMBERING_STYLE.SEQUENTIAL,
  Feature: NUMBERING_STYLE.SEQUENTIAL,
  UserStory: NUMBERING_STYLE.SEQUENTIAL,
  // System Architecture
  ADR: NUMBERING_STYLE.SEQUENTIAL,
  Component: NUMBERING_STYLE.SEQUENTIAL,
  TechnologyChoice: NUMBERING_STYLE.SEQUENTIAL,
  IntegrationPattern: NUMBERING_STYLE.SEQUENTIAL,
  ThreatModel: NUMBERING_STYLE.SEQUENTIAL,
  InfrastructureView: NUMBERING_STYLE.SEQUENTIAL,
  // Data Architecture
  ConceptualEntity: NUMBERING_STYLE.SEQUENTIAL,
  LogicalDataModel: NUMBERING_STYLE.SEQUENTIAL,
  DataFlow: NUMBERING_STYLE.SEQUENTIAL,
  DataContract: NUMBERING_STYLE.SEQUENTIAL,
  DataDictionaryEntry: NUMBERING_STYLE.SEQUENTIAL,
  DataQualityRule: NUMBERING_STYLE.SEQUENTIAL,
  DataClassification: NUMBERING_STYLE.SEQUENTIAL,
  DataLineage: NUMBERING_STYLE.SEQUENTIAL,
  // UX/UI Design
  Persona: NUMBERING_STYLE.SEQUENTIAL,
  Journey: NUMBERING_STYLE.SEQUENTIAL,
  Wireframe: NUMBERING_STYLE.SEQUENTIAL,
  DesignDecision: NUMBERING_STYLE.SEQUENTIAL,
  ResearchFinding: NUMBERING_STYLE.SEQUENTIAL,
  EmpathyMap: NUMBERING_STYLE.SEQUENTIAL,
  ServiceBlueprint: NUMBERING_STYLE.SEQUENTIAL,
  InformationArchitecture: NUMBERING_STYLE.SEQUENTIAL,
  InteractionFlow: NUMBERING_STYLE.SEQUENTIAL,
  // Testing
  TestCase: NUMBERING_STYLE.SEQUENTIAL,
  TestSuite: NUMBERING_STYLE.SEQUENTIAL,
  UsabilityTest: NUMBERING_STYLE.SEQUENTIAL,
  AccessibilityAudit: NUMBERING_STYLE.SEQUENTIAL,
  // Cross-Cutting
  Stakeholder: NUMBERING_STYLE.SEQUENTIAL,
  ReviewRecord: NUMBERING_STYLE.SEQUENTIAL,
};

/**
 * Valid parent-child relationships for requirements
 * Key = parent type, Value = allowed child types
 */
export const VALID_HIERARCHY = {
  // Requirements
  BusinessRequirement: ['BusinessRequirement', 'StakeholderRequirement', 'SolutionRequirement'],
  StakeholderRequirement: ['StakeholderRequirement', 'SolutionRequirement'],
  SolutionRequirement: ['SolutionRequirement'],
  NonFunctionalRequirement: [],
  QualityAttribute: [],
  BusinessRule: [],
  UseCase: ['UseCase'], // Sub-use cases
  // Stories
  Epic: ['Feature', 'UserStory'],
  Feature: ['UserStory'],
  UserStory: [],
  // System Architecture
  ADR: [],
  Component: [],
  TechnologyChoice: [],
  IntegrationPattern: [],
  ThreatModel: [],
  InfrastructureView: [],
  // Data Architecture
  ConceptualEntity: [],
  LogicalDataModel: [],
  DataFlow: [],
  DataContract: [],
  DataDictionaryEntry: [],
  DataQualityRule: [],
  DataClassification: [],
  DataLineage: [],
  // UX/UI Design
  Persona: [],
  Journey: [],
  Wireframe: [],
  DesignDecision: [],
  ResearchFinding: [],
  EmpathyMap: [],
  ServiceBlueprint: [],
  InformationArchitecture: [],
  InteractionFlow: [],
  // Testing
  TestCase: [],
  TestSuite: ['TestCase'], // Suites contain test cases hierarchically
  UsabilityTest: [],
  AccessibilityAudit: [],
  // Cross-Cutting
  Stakeholder: [],
  ReviewRecord: [],
};

/**
 * Generate hierarchical reference number
 * @param {string} prefix - Artefact type prefix (e.g., 'BR')
 * @param {string|null} parentRef - Parent's reference number (e.g., 'BR-1')
 * @param {number} childIndex - Zero-based index of this child among siblings
 * @param {string} style - Numbering style
 * @returns {string} Generated reference number
 *
 * @example
 * generateHierarchicalRef('BR', null, 0, 'hierarchical') // => 'BR-1'
 * generateHierarchicalRef('BR', 'BR-1', 0, 'hierarchical') // => 'BR-1.1'
 * generateHierarchicalRef('BR', 'BR-1.1', 2, 'hierarchical') // => 'BR-1.1.3'
 */
export function generateHierarchicalRef(prefix, parentRef, childIndex, style = NUMBERING_STYLE.HIERARCHICAL) {
  const num = childIndex + 1;

  switch (style) {
    case NUMBERING_STYLE.SEQUENTIAL:
      return `${prefix}-${String(num).padStart(3, '0')}`;

    case NUMBERING_STYLE.HIERARCHICAL:
      if (!parentRef) {
        return `${prefix}-${num}`;
      }
      return `${parentRef}.${num}`;

    case NUMBERING_STYLE.OUTLINE:
      if (!parentRef) {
        return String(num);
      }
      return `${parentRef}.${num}`;

    case NUMBERING_STYLE.MIXED:
      if (!parentRef) {
        return `${prefix}-${num}`;
      }
      // Alternate between letters and numbers at each level
      const parts = parentRef.replace(`${prefix}-`, '').split('.');
      const depth = parts.length;
      if (depth % 2 === 1) {
        // Use letter
        return `${parentRef}.${String.fromCharCode(96 + num)}`; // a, b, c...
      } else {
        // Use roman numeral for third level, then numbers
        if (depth === 2) {
          return `${parentRef}.${toRomanNumeral(num).toLowerCase()}`;
        }
        return `${parentRef}.${num}`;
      }

    default:
      return `${prefix}-${String(num).padStart(3, '0')}`;
  }
}

/**
 * Convert number to roman numeral
 * @param {number} num - Number to convert
 * @returns {string} Roman numeral
 */
function toRomanNumeral(num) {
  const romanNumerals = [
    ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
    ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
    ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
  ];
  let result = '';
  for (const [letter, value] of romanNumerals) {
    while (num >= value) {
      result += letter;
      num -= value;
    }
  }
  return result;
}

/**
 * Parse hierarchical reference to extract depth
 * @param {string} ref - Reference number (e.g., 'BR-1.2.3')
 * @returns {number} Depth (0-based)
 */
export function getRefDepth(ref) {
  if (!ref) return 0;
  // Count dots to determine depth
  const dotCount = (ref.match(/\./g) || []).length;
  return dotCount;
}

/**
 * Validate if a hierarchy move is allowed
 * @param {Object} artefact - The artefact being moved
 * @param {Object|null} newParent - The proposed new parent (null for root)
 * @param {Object[]} allArtefacts - All artefacts in the project
 * @returns {{valid: boolean, error?: string}}
 */
export function validateHierarchyMove(artefact, newParent, allArtefacts) {
  // Rule 1: Cannot be own parent
  if (newParent && artefact.id === newParent.id) {
    return { valid: false, error: 'An artefact cannot be its own parent' };
  }

  // Rule 2: Cannot be descendant of itself (prevent cycles)
  if (newParent) {
    const descendants = getDescendants(artefact.id, allArtefacts);
    if (descendants.some(d => d.id === newParent.id)) {
      return { valid: false, error: 'Cannot move an artefact under its own descendant' };
    }
  }

  // Rule 3: Check valid parent-child type
  if (newParent) {
    const allowedChildren = VALID_HIERARCHY[newParent.artefactType] || [];
    if (!allowedChildren.includes(artefact.artefactType)) {
      return {
        valid: false,
        error: `${artefact.artefactType} cannot be a child of ${newParent.artefactType}`
      };
    }
  }

  // Rule 4: Check depth limit
  const newDepth = newParent ? getArtefactDepth(newParent, allArtefacts) + 1 : 0;
  const subtreeDepth = getSubtreeDepth(artefact, allArtefacts);
  if (newDepth + subtreeDepth >= MAX_HIERARCHY_DEPTH) {
    return {
      valid: false,
      error: `Move would exceed maximum hierarchy depth of ${MAX_HIERARCHY_DEPTH}`
    };
  }

  return { valid: true };
}

/**
 * Get all descendants of an artefact
 * @param {string} artefactId - Artefact ID
 * @param {Object[]} allArtefacts - All artefacts
 * @returns {Object[]} Descendant artefacts
 */
export function getDescendants(artefactId, allArtefacts) {
  const descendants = [];
  const children = allArtefacts.filter(a => a.parent_id === artefactId);

  for (const child of children) {
    descendants.push(child);
    descendants.push(...getDescendants(child.id, allArtefacts));
  }

  return descendants;
}

/**
 * Get depth of an artefact in the hierarchy
 * @param {Object} artefact - The artefact
 * @param {Object[]} allArtefacts - All artefacts
 * @returns {number} Depth (0 = root)
 */
export function getArtefactDepth(artefact, allArtefacts) {
  let depth = 0;
  let current = artefact;

  while (current.parent_id) {
    depth++;
    current = allArtefacts.find(a => a.id === current.parent_id);
    if (!current) break;
  }

  return depth;
}

/**
 * Get maximum depth of subtree under an artefact
 * @param {Object} artefact - Root of subtree
 * @param {Object[]} allArtefacts - All artefacts
 * @returns {number} Maximum subtree depth
 */
export function getSubtreeDepth(artefact, allArtefacts) {
  const children = allArtefacts.filter(a => a.parent_id === artefact.id);
  if (children.length === 0) return 0;

  return 1 + Math.max(...children.map(c => getSubtreeDepth(c, allArtefacts)));
}

/**
 * ============================================================================
 * STATUS TRANSITION RULES
 * ============================================================================
 */

/**
 * Valid status transitions for analysis artefacts
 */
export const STATUS_TRANSITIONS = {
  Draft: ['In Analysis', 'On Hold'],
  'In Analysis': ['In Review', 'Draft', 'On Hold'],
  'In Review': ['Approved', 'In Analysis', 'On Hold'],
  Approved: ['Completed', 'In Review'], // Can be sent back for review
  'On Hold': ['Draft', 'In Analysis', 'In Review'], // Resume to previous state
  Completed: [] // Terminal state
};

/**
 * Check if a status transition is valid
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - Proposed new status
 * @returns {boolean}
 */
export function isValidStatusTransition(fromStatus, toStatus) {
  const allowed = STATUS_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

/**
 * ============================================================================
 * RELATIONSHIP RULES
 * ============================================================================
 */

/**
 * Valid relationship types between artefact types
 * Format: { fromType: { toType: [relationshipTypes] } }
 *
 * NOTE: The canonical metamodel is in lib/analysis-types.js (ANALYSIS_METAMODEL).
 * This object is kept for backward compatibility with existing validation functions.
 * For new code, prefer importing from analysis-types.js directly.
 */
export const VALID_RELATIONSHIPS = {
  // ── Requirements → Other Disciplines ───────────────────────────────────────
  BusinessRequirement: {
    StakeholderRequirement: ['decomposes_to', 'traces_to'],
    SolutionRequirement: ['traces_to'],
    NonFunctionalRequirement: ['includes'],
    UserStory: ['traces_to'],
    BusinessRule: ['governed_by'],
    ADR: ['informs'],
    QualityAttribute: ['quantified_by'],
    TestCase: ['verified_by'],
    Stakeholder: ['owned_by'],
  },
  StakeholderRequirement: {
    SolutionRequirement: ['decomposes_to', 'traces_to'],
    UserStory: ['traces_to'],
    Persona: ['associated_with'],
    TestCase: ['verified_by'],
  },
  SolutionRequirement: {
    UserStory: ['implemented_by'],
    Component: ['realized_by'],
    ADR: ['drives'],
    LogicalDataModel: ['specifies_data'],
    TestCase: ['verified_by'],
  },
  NonFunctionalRequirement: {
    QualityAttribute: ['quantifies'],
    Component: ['constrains'],
    TestCase: ['verified_by'],
  },
  BusinessRule: {
    SolutionRequirement: ['constrains'],
    Component: ['enforced_by'],
    TestCase: ['verified_by'],
  },
  UseCase: {
    UserStory: ['implemented_by'],
    Wireframe: ['visualized_by'],
    Persona: ['involves'],
    InteractionFlow: ['detailed_by'],
    TestCase: ['verified_by'],
  },

  // ── Stories → Other Disciplines ────────────────────────────────────────────
  Epic: {
    Feature: ['contains'],
    UserStory: ['contains'],
    Component: ['touches'],
  },
  Feature: {
    UserStory: ['contains'],
    Component: ['touches'],
    TestSuite: ['tested_by'],
  },
  UserStory: {
    ADR: ['informs'],
    Component: ['touches'],
    Wireframe: ['visualized_by'],
    TestCase: ['verified_by'],
    DataDictionaryEntry: ['uses_data'],
  },

  // ── Architecture → Other Disciplines ───────────────────────────────────────
  ADR: {
    Component: ['affects'],
    TechnologyChoice: ['selects'],
    QualityAttribute: ['addresses'],
  },
  Component: {
    DataContract: ['consumes', 'produces'],
    IntegrationPattern: ['connects_via'],
    ThreatModel: ['threatened_by'],
    InfrastructureView: ['deployed_on'],
    DataFlow: ['participates_in'],
  },
  QualityAttribute: {
    ADR: ['drives'],
    Component: ['constrains'],
    TestCase: ['verified_by'],
  },
  ThreatModel: {
    QualityAttribute: ['threatens'],
    ADR: ['mitigated_by'],
    Component: ['targets'],
  },
  IntegrationPattern: {
    Component: ['connects'],
    DataContract: ['governed_by'],
    DataFlow: ['implements'],
  },
  TechnologyChoice: {
    Component: ['used_by'],
  },
  InfrastructureView: {
    Component: ['hosts'],
  },

  // ── Data Architecture → Other Disciplines ──────────────────────────────────
  ConceptualEntity: {
    LogicalDataModel: ['implemented_by'],
    DataDictionaryEntry: ['defined_by'],
    ConceptualEntity: ['relates_to'],
  },
  LogicalDataModel: {
    DataDictionaryEntry: ['contains_element'],
    DataContract: ['governed_by'],
    Component: ['stored_in'],
  },
  DataFlow: {
    Component: ['connects'],
    DataContract: ['governed_by'],
    LogicalDataModel: ['moves_data_from'],
  },
  DataContract: {
    LogicalDataModel: ['defines_schema'],
    DataQualityRule: ['enforces'],
    DataDictionaryEntry: ['references'],
  },
  DataDictionaryEntry: {
    DataClassification: ['classified_as'],
    DataQualityRule: ['validated_by'],
    Wireframe: ['displayed_on'],
  },
  DataQualityRule: {
    LogicalDataModel: ['applies_to'],
  },
  DataClassification: {
    LogicalDataModel: ['applies_to'],
    ConceptualEntity: ['classifies'],
  },
  DataLineage: {
    DataFlow: ['composed_of'],
    ConceptualEntity: ['tracks'],
    Component: ['passes_through'],
  },

  // ── UX/UI Design → Other Disciplines ───────────────────────────────────────
  Persona: {
    Journey: ['experiences'],
    UserStory: ['benefits_from'],
    EmpathyMap: ['profiled_in'],
  },
  Journey: {
    Wireframe: ['includes'],
    UserStory: ['contains_step'],
    ServiceBlueprint: ['detailed_by'],
    DataFlow: ['produces'],
    UsabilityTest: ['tested_by'],
  },
  Wireframe: {
    DataDictionaryEntry: ['displays'],
    InteractionFlow: ['part_of'],
    AccessibilityAudit: ['audited_by'],
  },
  DesignDecision: {
    Wireframe: ['affects'],
    Journey: ['affects'],
    ADR: ['related_to'],
  },
  ResearchFinding: {
    Persona: ['informs'],
    Journey: ['informs'],
    DesignDecision: ['supports'],
  },
  EmpathyMap: {
    Persona: ['profiles'],
    ResearchFinding: ['synthesizes'],
  },
  ServiceBlueprint: {
    Component: ['implemented_by'],
    Wireframe: ['frontstage_includes'],
    Journey: ['extends'],
  },
  InformationArchitecture: {
    Wireframe: ['implemented_by'],
    DataDictionaryEntry: ['displays'],
    ConceptualEntity: ['navigates_to'],
  },
  InteractionFlow: {
    Wireframe: ['transitions_between'],
    UserStory: ['implements'],
    UseCase: ['details'],
  },

  // ── Testing → Other Disciplines ────────────────────────────────────────────
  TestCase: {
    SolutionRequirement: ['verifies'],
    UserStory: ['verifies'],
    Component: ['exercises'],
    DataContract: ['validates'],
  },
  TestSuite: {
    TestCase: ['contains'],
    Feature: ['covers'],
  },
  UsabilityTest: {
    Journey: ['tests'],
    Wireframe: ['evaluates'],
    ResearchFinding: ['produces'],
  },
  AccessibilityAudit: {
    Wireframe: ['audits'],
    SolutionRequirement: ['generates_requirement'],
  },

  // ── Cross-Cutting → Other Disciplines ──────────────────────────────────────
  Stakeholder: {
    BusinessRequirement: ['owns'],
    ReviewRecord: ['participates_in'],
  },
  ReviewRecord: {
    // ReviewRecords link to any artefact type — validated separately
  },
};

/**
 * Validate if a relationship is allowed
 * @param {string} fromType - Source artefact type
 * @param {string} toType - Target artefact type
 * @param {string} relationshipType - Relationship type
 * @returns {{valid: boolean, error?: string}}
 */
export function validateRelationship(fromType, toType, relationshipType) {
  const fromRules = VALID_RELATIONSHIPS[fromType];
  if (!fromRules) {
    return { valid: false, error: `No relationship rules defined for ${fromType}` };
  }

  const toRules = fromRules[toType];
  if (!toRules) {
    return { valid: false, error: `${fromType} cannot have relationships to ${toType}` };
  }

  if (!toRules.includes(relationshipType)) {
    return {
      valid: false,
      error: `Relationship type '${relationshipType}' is not valid between ${fromType} and ${toType}. ` +
             `Valid types: ${toRules.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * ============================================================================
 * COMPLETENESS RULES
 * ============================================================================
 */

/**
 * Required fields per status for requirements
 */
export const REQUIRED_FIELDS_BY_STATUS = {
  Draft: ['name'],
  'In Analysis': ['name', 'description', 'priority'],
  'In Review': ['name', 'description', 'priority', 'acceptance_criteria'],
  Approved: ['name', 'description', 'priority', 'acceptance_criteria', 'owner'],
  Completed: ['name', 'description', 'priority', 'acceptance_criteria', 'owner', 'verified_by'],
};

/**
 * Validate artefact has required fields for its status
 * @param {Object} artefact - The artefact to validate
 * @returns {{valid: boolean, missingFields: string[]}}
 */
export function validateRequiredFields(artefact) {
  const requiredFields = REQUIRED_FIELDS_BY_STATUS[artefact.status] || ['name'];
  const missingFields = [];

  for (const field of requiredFields) {
    const value = artefact[field];
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

export default {
  MAX_HIERARCHY_DEPTH,
  NUMBERING_STYLE,
  DEFAULT_NUMBERING_STYLE,
  VALID_HIERARCHY,
  STATUS_TRANSITIONS,
  VALID_RELATIONSHIPS,
  REQUIRED_FIELDS_BY_STATUS,
  generateHierarchicalRef,
  getRefDepth,
  validateHierarchyMove,
  getDescendants,
  getArtefactDepth,
  getSubtreeDepth,
  isValidStatusTransition,
  validateRelationship,
  validateRequiredFields,
};
