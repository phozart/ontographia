/**
 * Knowledge Graph Metamodel Registry
 *
 * Defines what node types and relationship types each studio contributes
 * to the knowledge graph. This is the single source of truth for understanding
 * how studios map to graph structure.
 *
 * Usage:
 *   import { getStudioNodeTypes, getStudioRelationships, getGlobalMetamodel } from '@/lib/kg-metamodel';
 *
 * @module lib/kg-metamodel
 */

/**
 * Node type definitions per studio.
 * Each entry maps a type ID to its display metadata.
 */
export const STUDIO_NODE_TYPES = {
  blueprint: {
    blueprint_initiative: {
      label: 'Initiative',
      description: 'Strategic initiative tracked through stage-gate process',
      icon: 'Lightbulb',
      color: '#059669',
      layer: 'strategy',
    },
    blueprint_product_idea: {
      label: 'Product Idea',
      description: 'Specific product idea within an initiative',
      icon: 'Lightbulb',
      color: '#059669',
      layer: 'strategy',
    },
  },

  analysis: {
    BusinessRequirement: {
      label: 'Business Requirement',
      description: 'High-level business need',
      icon: 'Assignment',
      color: '#0284c7',
      layer: 'requirements',
      prefix: 'BR',
    },
    StakeholderRequirement: {
      label: 'Stakeholder Requirement',
      description: 'Need from a specific stakeholder group',
      icon: 'Assignment',
      color: '#0284c7',
      layer: 'requirements',
      prefix: 'SR',
    },
    SolutionRequirement: {
      label: 'Solution Requirement',
      description: 'Functional or technical requirement',
      icon: 'Assignment',
      color: '#0284c7',
      layer: 'requirements',
      prefix: 'FR',
    },
    NonFunctionalRequirement: {
      label: 'Non-Functional Requirement',
      description: 'Quality attribute or constraint',
      icon: 'Assignment',
      color: '#0284c7',
      layer: 'requirements',
      prefix: 'NFR',
    },
    BusinessRule: {
      label: 'Business Rule',
      description: 'Constraint or policy governing behavior',
      icon: 'Gavel',
      color: '#0284c7',
      layer: 'requirements',
      prefix: 'BRL',
    },
    UseCase: {
      label: 'Use Case',
      description: 'Actor-goal interaction scenario',
      icon: 'Assignment',
      color: '#0284c7',
      layer: 'requirements',
      prefix: 'UC',
    },
    Epic: {
      label: 'Epic',
      description: 'Large body of work decomposed into features',
      icon: 'Assignment',
      color: '#0284c7',
      layer: 'stories',
      prefix: 'E',
    },
    Feature: {
      label: 'Feature',
      description: 'Deliverable capability',
      icon: 'Assignment',
      color: '#0284c7',
      layer: 'stories',
      prefix: 'F',
    },
    UserStory: {
      label: 'User Story',
      description: 'User-focused requirement',
      icon: 'Assignment',
      color: '#0284c7',
      layer: 'stories',
      prefix: 'US',
    },
    ADR: {
      label: 'Architecture Decision',
      description: 'Architecture Decision Record',
      icon: 'Architecture',
      color: '#0284c7',
      layer: 'architecture',
      prefix: 'ADR',
    },
    Component: {
      label: 'Component',
      description: 'System or software component',
      icon: 'Category',
      color: '#0284c7',
      layer: 'architecture',
      prefix: 'CMP',
    },
    DataEntity: {
      label: 'Data Entity',
      description: 'Business or logical data entity',
      icon: 'Storage',
      color: '#0284c7',
      layer: 'data',
      prefix: 'DE',
    },
    DataContract: {
      label: 'Data Contract',
      description: 'Agreement on data structure and quality',
      icon: 'Storage',
      color: '#0284c7',
      layer: 'data',
      prefix: 'DC',
    },
    APIContract: {
      label: 'API Contract',
      description: 'Interface specification',
      icon: 'Api',
      color: '#0284c7',
      layer: 'data',
      prefix: 'API',
    },
    Persona: {
      label: 'Persona',
      description: 'User archetype',
      icon: 'Person',
      color: '#0284c7',
      layer: 'design',
      prefix: 'PER',
    },
    UserJourney: {
      label: 'User Journey',
      description: 'End-to-end user experience path',
      icon: 'Timeline',
      color: '#0284c7',
      layer: 'design',
      prefix: 'UJ',
    },
    TestCase: {
      label: 'Test Case',
      description: 'Verification scenario',
      icon: 'CheckCircle',
      color: '#0284c7',
      layer: 'testing',
      prefix: 'TC',
    },
    Stakeholder: {
      label: 'Stakeholder',
      description: 'Person or group with interest in the project',
      icon: 'People',
      color: '#0284c7',
      layer: 'stakeholders',
      prefix: 'STK',
    },
    analysis_project: {
      label: 'Analysis Project',
      description: 'Project container for analysis artefacts',
      icon: 'Folder',
      color: '#0284c7',
      layer: 'project',
    },
  },

  enterprise: {
    ea_capability: {
      label: 'Capability',
      description: 'Business capability',
      icon: 'Category',
      color: '#6366f1',
      layer: 'business',
    },
    ea_process: {
      label: 'Business Process',
      description: 'End-to-end business process',
      icon: 'AccountTree',
      color: '#6366f1',
      layer: 'business',
    },
    ea_application: {
      label: 'Application',
      description: 'Software application or system',
      icon: 'Apps',
      color: '#6366f1',
      layer: 'application',
    },
    ea_service: {
      label: 'Service',
      description: 'Business or technical service',
      icon: 'Cloud',
      color: '#6366f1',
      layer: 'application',
    },
    ea_data_entity: {
      label: 'Data Entity',
      description: 'Enterprise data entity',
      icon: 'Storage',
      color: '#6366f1',
      layer: 'data',
    },
    ea_technology: {
      label: 'Technology',
      description: 'Technology component or platform',
      icon: 'Memory',
      color: '#6366f1',
      layer: 'technology',
    },
    ea_organization_unit: {
      label: 'Organization Unit',
      description: 'Organizational entity',
      icon: 'Business',
      color: '#6366f1',
      layer: 'organization',
    },
    ea_role: {
      label: 'Role',
      description: 'Business or IT role',
      icon: 'Person',
      color: '#6366f1',
      layer: 'organization',
    },
    ea_value_stream: {
      label: 'Value Stream',
      description: 'End-to-end value delivery flow',
      icon: 'Timeline',
      color: '#6366f1',
      layer: 'business',
    },
    ea_decision_record: {
      label: 'Decision Record',
      description: 'EA architecture decision',
      icon: 'Gavel',
      color: '#6366f1',
      layer: 'governance',
    },
  },

  dwd: {
    dwd_case: {
      label: 'Work Situation',
      description: 'Concrete work situation under analysis',
      icon: 'Folder',
      color: '#6366f1',
      layer: 'diagnose',
    },
    dwd_work_item: {
      label: 'Work Item',
      description: 'Unit of work within a situation',
      icon: 'Task',
      color: '#6366f1',
      layer: 'diagnose',
    },
    dwd_actor: {
      label: 'Actor',
      description: 'Person, team, or system performing work',
      icon: 'Person',
      color: '#6366f1',
      layer: 'diagnose',
    },
    dwd_outcome: {
      label: 'Outcome',
      description: 'Result or effect of work',
      icon: 'Flag',
      color: '#6366f1',
      layer: 'diagnose',
    },
    dwd_signal: {
      label: 'Signal',
      description: 'Tension or problem indicator',
      icon: 'Warning',
      color: '#6366f1',
      layer: 'diagnose',
    },
    dwd_adjustment: {
      label: 'Adjustment',
      description: 'Change to work structure',
      icon: 'Build',
      color: '#6366f1',
      layer: 'design',
    },
    dwd_learning: {
      label: 'Learning',
      description: 'Insight from work analysis',
      icon: 'School',
      color: '#6366f1',
      layer: 'learn',
    },
  },

  pds: {
    pds_project: {
      label: 'Project',
      description: 'Project delivery container',
      icon: 'AccountTree',
      color: '#0d9488',
      layer: 'project',
    },
    pds_deliverable: {
      label: 'Deliverable',
      description: 'Project output or milestone',
      icon: 'Flag',
      color: '#0d9488',
      layer: 'planning',
    },
    pds_work_package: {
      label: 'Work Package',
      description: 'Decomposed unit of project work',
      icon: 'Assignment',
      color: '#0d9488',
      layer: 'planning',
    },
    pds_risk: {
      label: 'Risk',
      description: 'Project risk entry',
      icon: 'Warning',
      color: '#0d9488',
      layer: 'governance',
    },
    pds_assumption: {
      label: 'Assumption',
      description: 'Project planning assumption',
      icon: 'Help',
      color: '#0d9488',
      layer: 'governance',
    },
    pds_lesson: {
      label: 'Lesson Learned',
      description: 'Captured project learning',
      icon: 'School',
      color: '#0d9488',
      layer: 'learning',
    },
  },

  sd: {
    sd_variable: {
      label: 'Variable',
      description: 'System dynamics stock or flow variable',
      icon: 'Functions',
      color: '#78716c',
      layer: 'modeling',
    },
    sd_feedback_loop: {
      label: 'Feedback Loop',
      description: 'Reinforcing or balancing loop',
      icon: 'Loop',
      color: '#78716c',
      layer: 'modeling',
    },
  },

  ks: {
    // Knowledge Studio manages user-defined types — no fixed metamodel
  },
};

/**
 * Relationship types per studio.
 * Each entry maps a relationship ID to its definition.
 */
export const STUDIO_RELATIONSHIP_TYPES = {
  blueprint: {
    initiative_contains_idea: {
      label: 'Contains',
      inverse: 'Belongs To',
      source: 'blueprint_initiative',
      target: 'blueprint_product_idea',
    },
    addresses_capability: {
      label: 'Addresses Capability',
      inverse: 'Addressed By Initiative',
      source: 'blueprint_initiative',
      target: 'ea_capability',
      crossStudio: true,
    },
  },

  analysis: {
    DERIVED_FROM: { label: 'Derived From', inverse: 'Derives', category: 'traceability' },
    REALIZES: { label: 'Realizes', inverse: 'Realized By', category: 'traceability' },
    SATISFIES: { label: 'Satisfies', inverse: 'Satisfied By', category: 'verification' },
    REFINES: { label: 'Refines', inverse: 'Refined By', category: 'analysis' },
    VALIDATES: { label: 'Validates', inverse: 'Validated By', category: 'verification' },
    CONFLICTS_WITH: { label: 'Conflicts With', inverse: 'Conflicts With', category: 'analysis' },
  },

  enterprise: {
    AGGREGATES: { label: 'Aggregates', inverse: 'Part Of', category: 'composition' },
    USES: { label: 'Uses', inverse: 'Used By', category: 'dependency' },
    SERVES: { label: 'Serves', inverse: 'Served By', category: 'service' },
    FLOWS_TO: { label: 'Flows To', inverse: 'Flows From', category: 'flow' },
    ACCESSES: { label: 'Accesses', inverse: 'Accessed By', category: 'data' },
    ASSIGNED_TO: { label: 'Assigned To', inverse: 'Assigned From', category: 'allocation' },
    ENABLES: { label: 'Enables', inverse: 'Enabled By', category: 'capability' },
    OWNS: { label: 'Owns', inverse: 'Owned By', category: 'governance' },
  },

  dwd: {
    case_involves_work_item: { label: 'Involves', inverse: 'Part Of Case', source: 'dwd_case', target: 'dwd_work_item' },
    case_involves_actor: { label: 'Involves', inverse: 'Participates In', source: 'dwd_case', target: 'dwd_actor' },
    case_has_outcome: { label: 'Produces', inverse: 'Produced By', source: 'dwd_case', target: 'dwd_outcome' },
    case_has_signal: { label: 'Has Signal', inverse: 'Signals In', source: 'dwd_case', target: 'dwd_signal' },
    case_has_adjustment: { label: 'Adjusted By', inverse: 'Adjusts', source: 'dwd_case', target: 'dwd_adjustment' },
    actor_has_capability: { label: 'Has Capability', inverse: 'Capability Of', source: 'dwd_actor', target: 'dwd_capability' },
    signal_affects_work_item: { label: 'Affects', inverse: 'Affected By', source: 'dwd_signal', target: 'dwd_work_item' },
  },

  pds: {
    informed_by: { label: 'Informed By', inverse: 'Informs', category: 'traceability' },
    triggers: { label: 'Triggers', inverse: 'Triggered By', category: 'sequence' },
    implements: { label: 'Implements', inverse: 'Implemented By', category: 'delivery' },
    enables: { label: 'Enables', inverse: 'Enabled By', category: 'dependency' },
  },

  sd: {
    CAUSES: { label: 'Causes', inverse: 'Caused By', category: 'causality' },
    REINFORCES: { label: 'Reinforces', inverse: 'Reinforced By', category: 'feedback' },
    BALANCES: { label: 'Balances', inverse: 'Balanced By', category: 'feedback' },
  },
};

/**
 * Cross-studio (universal) relationship types valid in all spaces.
 */
export const UNIVERSAL_RELATIONSHIP_TYPES = {
  TRACES_TO: { label: 'Traces To', inverse: 'Traced From', category: 'cross-space' },
  DEPENDS_ON: { label: 'Depends On', inverse: 'Dependency Of', category: 'cross-space' },
  SUPPORTS: { label: 'Supports', inverse: 'Supported By', category: 'cross-space' },
  RELATED_TO: { label: 'Related To', inverse: 'Related To', category: 'cross-space' },
  IMPLEMENTS: { label: 'Implements', inverse: 'Implemented By', category: 'cross-space' },
};

// ── Query Functions ────────────────────────────────────────────────

/**
 * Get all node types contributed by a studio
 * @param {string} studioCode - e.g. 'blueprint', 'analysis', 'ea'
 * @returns {Object} Map of typeId → type definition
 */
export function getStudioNodeTypes(studioCode) {
  return STUDIO_NODE_TYPES[studioCode] || {};
}

/**
 * Get all relationship types contributed by a studio
 * @param {string} studioCode
 * @returns {Object} Map of relId → relationship definition
 */
export function getStudioRelationships(studioCode) {
  return STUDIO_RELATIONSHIP_TYPES[studioCode] || {};
}

/**
 * Get which studio owns a given node type
 * @param {string} typeId
 * @returns {string|null} Studio code or null
 */
export function getStudioForNodeType(typeId) {
  for (const [studio, types] of Object.entries(STUDIO_NODE_TYPES)) {
    if (types[typeId]) return studio;
  }
  return null;
}

/**
 * Get the full global metamodel — all studios merged
 * @returns {{ nodeTypes: Object, relationshipTypes: Object }}
 */
export function getGlobalMetamodel() {
  const nodeTypes = {};
  const relationshipTypes = { ...UNIVERSAL_RELATIONSHIP_TYPES };

  for (const [studio, types] of Object.entries(STUDIO_NODE_TYPES)) {
    for (const [typeId, typeDef] of Object.entries(types)) {
      nodeTypes[typeId] = { ...typeDef, studio };
    }
  }

  for (const [studio, rels] of Object.entries(STUDIO_RELATIONSHIP_TYPES)) {
    for (const [relId, relDef] of Object.entries(rels)) {
      relationshipTypes[relId] = { ...relDef, studio };
    }
  }

  return { nodeTypes, relationshipTypes };
}

/**
 * Get summary statistics
 * @returns {{ studios: number, nodeTypes: number, relationshipTypes: number }}
 */
export function getMetamodelStats() {
  let nodeTypes = 0;
  let relationshipTypes = Object.keys(UNIVERSAL_RELATIONSHIP_TYPES).length;

  for (const types of Object.values(STUDIO_NODE_TYPES)) {
    nodeTypes += Object.keys(types).length;
  }
  for (const rels of Object.values(STUDIO_RELATIONSHIP_TYPES)) {
    relationshipTypes += Object.keys(rels).length;
  }

  return {
    studios: Object.keys(STUDIO_NODE_TYPES).length,
    nodeTypes,
    relationshipTypes,
  };
}
