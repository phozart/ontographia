/**
 * Governance & Decision Design Type Definitions
 *
 * Defines artefact types, stages, relationships, and helper functions
 * for the Governance & Decision Design Studio.
 *
 * @module lib/gov-types
 */

// ============================================================================
// ARTEFACT TYPE DEFINITIONS
// ============================================================================

/**
 * Governance artefact type definitions
 * @type {Object.<string, {name: string, plural: string, description: string, color: string, icon: string, fields: Object}>}
 */
export const GOV_TYPE_DEFS = {
  gov_decision_type: {
    name: 'Decision Type',
    plural: 'Decision Types',
    description: 'Category or classification of decisions that need to be made',
    color: '#6366f1',
    icon: 'Category',
    fields: {
      scope: { type: 'select', options: ['strategic', 'tactical', 'operational'], label: 'Scope' },
      frequency: { type: 'select', options: ['one-time', 'recurring', 'continuous'], label: 'Frequency' },
      impact_level: { type: 'select', options: ['high', 'medium', 'low'], label: 'Impact Level' },
      typical_timeframe: { type: 'text', label: 'Typical Timeframe' },
      examples: { type: 'textarea', label: 'Examples' },
    },
  },

  gov_decision_right: {
    name: 'Decision Right',
    plural: 'Decision Rights',
    description: 'Assignment of authority to make specific types of decisions',
    color: '#8b5cf6',
    icon: 'Gavel',
    fields: {
      role_or_forum: { type: 'text', label: 'Role/Forum' },
      right_type: { type: 'select', options: ['decide', 'approve', 'recommend', 'inform', 'consult'], label: 'Right Type' },
      scope: { type: 'text', label: 'Decision Scope' },
      constraints: { type: 'textarea', label: 'Constraints/Limits' },
      delegation_allowed: { type: 'boolean', label: 'Delegation Allowed' },
      escalation_trigger: { type: 'textarea', label: 'Escalation Triggers' },
    },
  },

  gov_forum: {
    name: 'Governance Forum',
    plural: 'Governance Forums',
    description: 'Governance body or committee that convenes to make decisions',
    color: '#059669',
    icon: 'Groups',
    fields: {
      forum_type: { type: 'select', options: ['board', 'committee', 'council', 'working_group', 'review_board'], label: 'Forum Type' },
      cadence: { type: 'select', options: ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'annual', 'ad-hoc'], label: 'Meeting Cadence' },
      chair: { type: 'text', label: 'Chair/Lead' },
      members: { type: 'textarea', label: 'Members' },
      quorum: { type: 'text', label: 'Quorum Requirements' },
      charter: { type: 'textarea', label: 'Charter/Purpose' },
      authority_level: { type: 'select', options: ['binding', 'advisory', 'informational'], label: 'Authority Level' },
    },
  },

  gov_policy: {
    name: 'Policy',
    plural: 'Policies',
    description: 'Formal policy, standard, or guideline that governs behavior',
    color: '#f59e0b',
    icon: 'Policy',
    fields: {
      policy_type: { type: 'select', options: ['policy', 'standard', 'guideline', 'procedure', 'principle'], label: 'Type' },
      status: { type: 'select', options: ['draft', 'review', 'approved', 'retired'], label: 'Status' },
      owner: { type: 'text', label: 'Owner' },
      effective_date: { type: 'date', label: 'Effective Date' },
      review_date: { type: 'date', label: 'Next Review Date' },
      compliance_required: { type: 'boolean', label: 'Compliance Required' },
      enforcement: { type: 'select', options: ['mandatory', 'recommended', 'optional'], label: 'Enforcement' },
      exceptions_process: { type: 'textarea', label: 'Exceptions Process' },
    },
  },

  gov_escalation: {
    name: 'Escalation Path',
    plural: 'Escalation Paths',
    description: 'Defined path for escalating decisions or issues',
    color: '#ef4444',
    icon: 'TrendingUp',
    fields: {
      trigger_conditions: { type: 'textarea', label: 'Trigger Conditions' },
      from_level: { type: 'text', label: 'From Level/Role' },
      to_level: { type: 'text', label: 'To Level/Role' },
      time_limit: { type: 'text', label: 'Time Limit' },
      notification_required: { type: 'boolean', label: 'Notification Required' },
      documentation_required: { type: 'boolean', label: 'Documentation Required' },
    },
  },

  gov_accountability: {
    name: 'Accountability',
    plural: 'Accountabilities',
    description: 'RACI-style assignment of responsibilities',
    color: '#0891b2',
    icon: 'AccountBox',
    fields: {
      role: { type: 'text', label: 'Role' },
      responsibility_type: { type: 'select', options: ['responsible', 'accountable', 'consulted', 'informed'], label: 'RACI Type' },
      scope: { type: 'textarea', label: 'Scope/Domain' },
      deliverables: { type: 'textarea', label: 'Key Deliverables' },
      metrics: { type: 'textarea', label: 'Success Metrics' },
    },
  },

  gov_principle: {
    name: 'Governance Principle',
    plural: 'Governance Principles',
    description: 'Foundational principle that guides governance design',
    color: '#7c3aed',
    icon: 'Star',
    fields: {
      category: { type: 'select', options: ['decision_making', 'accountability', 'transparency', 'efficiency', 'compliance'], label: 'Category' },
      rationale: { type: 'textarea', label: 'Rationale' },
      implications: { type: 'textarea', label: 'Implications' },
      examples: { type: 'textarea', label: 'Examples in Practice' },
    },
  },
};

// ============================================================================
// WORKSPACE STAGES/MODULES
// ============================================================================

/**
 * Governance workspace stages - organized workflow areas
 */
export const GOV_STAGES = {
  foundations: {
    name: 'Foundations',
    description: 'Establish governance principles and decision types',
    types: ['gov_principle', 'gov_decision_type'],
    order: 1,
  },
  rights: {
    name: 'Decision Rights',
    description: 'Define who can make what decisions',
    types: ['gov_decision_right', 'gov_accountability'],
    order: 2,
  },
  forums: {
    name: 'Forums & Bodies',
    description: 'Design governance forums and committees',
    types: ['gov_forum'],
    order: 3,
  },
  policies: {
    name: 'Policies & Standards',
    description: 'Create policies, standards, and guidelines',
    types: ['gov_policy'],
    order: 4,
  },
  escalations: {
    name: 'Escalation Design',
    description: 'Define escalation paths and triggers',
    types: ['gov_escalation'],
    order: 5,
  },
};

/**
 * Workspace module definitions for navigator
 */
export const GOV_WORKSPACE_MODULES = {
  foundations: {
    name: 'Foundations',
    description: 'Governance principles and decision types',
    types: ['gov_principle', 'gov_decision_type'],
  },
  rights: {
    name: 'Decision Rights',
    description: 'Decision authority and accountability matrix',
    types: ['gov_decision_right', 'gov_accountability'],
  },
  forums: {
    name: 'Forums',
    description: 'Governance bodies and committees',
    types: ['gov_forum'],
  },
  policies: {
    name: 'Policies',
    description: 'Policies, standards, and guidelines',
    types: ['gov_policy'],
  },
  escalations: {
    name: 'Escalations',
    description: 'Escalation paths and triggers',
    types: ['gov_escalation'],
  },
};

// ============================================================================
// RELATIONSHIP TYPES
// ============================================================================

/**
 * Governance relationship types
 */
export const GOV_RELATIONSHIP_TYPES = {
  governs: {
    name: 'Governs',
    description: 'Forum/policy governs a decision type',
    sourceTypes: ['gov_forum', 'gov_policy'],
    targetTypes: ['gov_decision_type', 'gov_decision_right'],
  },
  escalates_to: {
    name: 'Escalates To',
    description: 'Decision escalates to another level',
    sourceTypes: ['gov_decision_right', 'gov_forum'],
    targetTypes: ['gov_decision_right', 'gov_forum'],
  },
  has_authority: {
    name: 'Has Authority',
    description: 'Role/forum has decision authority',
    sourceTypes: ['gov_forum', 'gov_accountability'],
    targetTypes: ['gov_decision_right'],
  },
  enforces: {
    name: 'Enforces',
    description: 'Forum enforces a policy',
    sourceTypes: ['gov_forum'],
    targetTypes: ['gov_policy'],
  },
  parent_policy: {
    name: 'Parent Policy',
    description: 'Policy derives from parent policy',
    sourceTypes: ['gov_policy'],
    targetTypes: ['gov_policy'],
  },
  reports_to: {
    name: 'Reports To',
    description: 'Forum reports to another forum',
    sourceTypes: ['gov_forum'],
    targetTypes: ['gov_forum'],
  },
  implements_principle: {
    name: 'Implements Principle',
    description: 'Implements a governance principle',
    sourceTypes: ['gov_policy', 'gov_forum', 'gov_decision_right'],
    targetTypes: ['gov_principle'],
  },
};

// ============================================================================
// ENUMS AND OPTIONS
// ============================================================================

/**
 * Decision scope levels
 */
export const GOV_DECISION_SCOPE = {
  strategic: { name: 'Strategic', description: 'Long-term direction and goals', color: '#ef4444' },
  tactical: { name: 'Tactical', description: 'Medium-term plans and initiatives', color: '#f59e0b' },
  operational: { name: 'Operational', description: 'Day-to-day operations', color: '#22c55e' },
};

/**
 * RACI types for accountability
 */
export const GOV_RACI_TYPES = {
  responsible: { name: 'Responsible (R)', description: 'Does the work', color: '#6366f1' },
  accountable: { name: 'Accountable (A)', description: 'Ultimately answerable', color: '#ef4444' },
  consulted: { name: 'Consulted (C)', description: 'Provides input', color: '#f59e0b' },
  informed: { name: 'Informed (I)', description: 'Kept updated', color: '#22c55e' },
};

/**
 * Forum authority levels
 */
export const GOV_AUTHORITY_LEVELS = {
  binding: { name: 'Binding', description: 'Decisions are final and must be followed', color: '#ef4444' },
  advisory: { name: 'Advisory', description: 'Provides recommendations', color: '#f59e0b' },
  informational: { name: 'Informational', description: 'For awareness only', color: '#22c55e' },
};

/**
 * Policy status values
 */
export const GOV_POLICY_STATUS = {
  draft: { name: 'Draft', description: 'Under development', color: '#9ca3af' },
  review: { name: 'In Review', description: 'Being reviewed', color: '#f59e0b' },
  approved: { name: 'Approved', description: 'Active and enforced', color: '#22c55e' },
  retired: { name: 'Retired', description: 'No longer active', color: '#ef4444' },
};

// ============================================================================
// GUIDANCE CONTENT
// ============================================================================

/**
 * Contextual guidance for governance design
 */
export const GOV_GUIDANCE = {
  foundations: {
    title: 'Governance Foundations',
    overview: 'Start by establishing the principles that will guide all governance decisions.',
    tips: [
      'Define 5-7 core governance principles',
      'Categorize decision types by scope and frequency',
      'Consider impact levels for different decisions',
      'Document rationale for each principle',
    ],
    questions: [
      'What principles should guide how decisions are made?',
      'What types of decisions does your organization make?',
      'How do decision types vary by scope (strategic vs operational)?',
    ],
  },
  rights: {
    title: 'Decision Rights Design',
    overview: 'Clearly define who can make what decisions and under what constraints.',
    tips: [
      'Use RACI model for clarity',
      'Define decision rights at appropriate levels',
      'Document constraints and escalation triggers',
      'Consider delegation rules',
    ],
    questions: [
      'Who should be accountable for each decision type?',
      'What constraints should limit decision authority?',
      'When should decisions be escalated?',
    ],
  },
  forums: {
    title: 'Governance Forums',
    overview: 'Design the bodies and committees that will exercise decision rights.',
    tips: [
      'Define clear charters for each forum',
      'Establish appropriate cadence',
      'Document quorum requirements',
      'Clarify authority levels (binding vs advisory)',
    ],
    questions: [
      'What governance bodies are needed?',
      'How often should each forum meet?',
      'What is the relationship between forums?',
    ],
  },
  policies: {
    title: 'Policy Framework',
    overview: 'Create the policies, standards, and guidelines that formalize governance.',
    tips: [
      'Establish policy hierarchy (policy > standard > guideline)',
      'Define ownership and review cycles',
      'Document exceptions processes',
      'Consider compliance requirements',
    ],
    questions: [
      'What policies are needed to support governance?',
      'How will policies be enforced?',
      'What is the process for policy exceptions?',
    ],
  },
  escalations: {
    title: 'Escalation Design',
    overview: 'Define clear paths for escalating decisions and issues.',
    tips: [
      'Define clear trigger conditions',
      'Document time limits for escalation',
      'Specify notification requirements',
      'Create escalation matrices',
    ],
    questions: [
      'When should decisions be escalated?',
      'What is the escalation path for different decision types?',
      'How quickly must escalations be addressed?',
    ],
  },
};

// ============================================================================
// WIZARD STEPS
// ============================================================================

/**
 * Wizard step definitions for each artefact type
 */
export const GOV_WIZARD_STEPS = {
  gov_decision_type: [
    {
      id: 'understand',
      title: 'Understand Decision Types',
      content: `
        **Decision Types** categorize the kinds of decisions your organization needs to make.

        **Why this matters:**
        - Enables consistent handling of similar decisions
        - Helps assign appropriate decision rights
        - Supports governance design

        **Examples:**
        - Strategic decisions (market entry, acquisitions)
        - Investment decisions (budget allocation, project approval)
        - Operational decisions (vendor selection, hiring)
        - Policy decisions (standards, guidelines)
      `,
    },
    { id: 'define', title: 'Define the Decision Type' },
    { id: 'review', title: 'Review & Create' },
  ],
  gov_decision_right: [
    {
      id: 'understand',
      title: 'Understand Decision Rights',
      content: `
        **Decision Rights** specify who has authority to make specific types of decisions.

        **Key concepts:**
        - **Decide**: Has final authority to make the decision
        - **Approve**: Must approve before decision is enacted
        - **Recommend**: Provides recommendation but doesn't decide
        - **Consult**: Must be consulted before decision
        - **Inform**: Must be notified of decision

        **Best practices:**
        - One person/body should be accountable
        - Decision rights should align with capability
        - Constraints prevent overreach
      `,
    },
    { id: 'define', title: 'Define the Decision Right' },
    { id: 'review', title: 'Review & Create' },
  ],
  gov_forum: [
    {
      id: 'understand',
      title: 'Understand Governance Forums',
      content: `
        **Governance Forums** are bodies that convene to make or oversee decisions.

        **Types of forums:**
        - **Board**: Highest authority, strategic oversight
        - **Committee**: Focused on specific domain
        - **Council**: Cross-functional coordination
        - **Working Group**: Tactical execution
        - **Review Board**: Quality/compliance review

        **Design considerations:**
        - Clear charter and purpose
        - Appropriate membership
        - Right cadence for decision needs
        - Defined authority level
      `,
    },
    { id: 'define', title: 'Define the Forum' },
    { id: 'review', title: 'Review & Create' },
  ],
  gov_policy: [
    {
      id: 'understand',
      title: 'Understand Policies',
      content: `
        **Policies** formalize governance expectations and requirements.

        **Policy hierarchy:**
        - **Policy**: High-level directive, mandatory
        - **Standard**: Specific requirements for compliance
        - **Guideline**: Recommended practices
        - **Procedure**: Step-by-step process

        **Good policies:**
        - Are clear and actionable
        - Have defined ownership
        - Include enforcement mechanisms
        - Have regular review cycles
      `,
    },
    { id: 'define', title: 'Define the Policy' },
    { id: 'review', title: 'Review & Create' },
  ],
  gov_escalation: [
    {
      id: 'understand',
      title: 'Understand Escalation Paths',
      content: `
        **Escalation Paths** define how decisions move up the governance hierarchy.

        **When to escalate:**
        - Decision exceeds authority limits
        - Time-sensitive and decision-maker unavailable
        - Conflict between stakeholders
        - Risk or impact threshold exceeded

        **Escalation design:**
        - Clear trigger conditions
        - Defined time limits
        - Notification requirements
        - Documentation needs
      `,
    },
    { id: 'define', title: 'Define the Escalation' },
    { id: 'review', title: 'Review & Create' },
  ],
  gov_accountability: [
    {
      id: 'understand',
      title: 'Understand Accountability',
      content: `
        **Accountability** assigns responsibility for outcomes using the RACI model.

        **RACI explained:**
        - **R**esponsible: Does the work
        - **A**ccountable: Ultimately answerable (only one per task)
        - **C**onsulted: Provides input before decision
        - **I**nformed: Notified after decision

        **Best practices:**
        - Every task needs exactly one Accountable
        - Minimize Consulted to avoid delays
        - Clear scope boundaries
        - Measurable deliverables
      `,
    },
    { id: 'define', title: 'Define the Accountability' },
    { id: 'review', title: 'Review & Create' },
  ],
  gov_principle: [
    {
      id: 'understand',
      title: 'Understand Governance Principles',
      content: `
        **Governance Principles** are foundational beliefs that guide governance design.

        **Example principles:**
        - "Decisions are made at the lowest appropriate level"
        - "All significant decisions require documented rationale"
        - "Accountability is singular; responsibility can be shared"
        - "Speed of decision-making matters as much as quality"

        **Good principles:**
        - Are memorable and actionable
        - Have clear implications
        - Guide trade-off decisions
        - Are consistently applied
      `,
    },
    { id: 'define', title: 'Define the Principle' },
    { id: 'review', title: 'Review & Create' },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a type is a governance type
 * @param {string} type - Type to check
 * @returns {boolean}
 */
export function isGovType(type) {
  return type && type.startsWith('gov_') && GOV_TYPE_DEFS[type] !== undefined;
}

/**
 * Get type definition
 * @param {string} type - Artefact type
 * @returns {Object|null}
 */
export function getTypeDefinition(type) {
  return GOV_TYPE_DEFS[type] || null;
}

/**
 * Get color for type
 * @param {string} type - Artefact type
 * @returns {string}
 */
export function getTypeColor(type) {
  return GOV_TYPE_DEFS[type]?.color || '#6366f1';
}

/**
 * Get stage for type
 * @param {string} type - Artefact type
 * @returns {string|null}
 */
export function getStageForType(type) {
  for (const [stageId, stage] of Object.entries(GOV_STAGES)) {
    if (stage.types.includes(type)) {
      return stageId;
    }
  }
  return null;
}

/**
 * Get types for stage
 * @param {string} stageId - Stage ID
 * @returns {string[]}
 */
export function getTypesForStage(stageId) {
  return GOV_STAGES[stageId]?.types || [];
}

/**
 * Calculate governance coverage metrics
 * @param {Object} artefacts - Artefacts by type
 * @returns {Object} Coverage metrics
 */
export function calculateGovernanceCoverage(artefacts) {
  const decisionTypes = artefacts.gov_decision_type || [];
  const decisionRights = artefacts.gov_decision_right || [];
  const forums = artefacts.gov_forum || [];
  const policies = artefacts.gov_policy || [];

  // How many decision types have assigned rights?
  const typesWithRights = decisionTypes.filter((dt) =>
    decisionRights.some((dr) => dr.properties?.decision_type_id === dt.id)
  ).length;

  // How many forums have charters?
  const forumsWithCharters = forums.filter(
    (f) => f.properties?.charter && f.properties.charter.length > 20
  ).length;

  // How many policies are approved?
  const approvedPolicies = policies.filter(
    (p) => p.properties?.status === 'approved'
  ).length;

  return {
    decisionTypesCovered: decisionTypes.length > 0 ? (typesWithRights / decisionTypes.length) * 100 : 0,
    forumsChartered: forums.length > 0 ? (forumsWithCharters / forums.length) * 100 : 0,
    policiesApproved: policies.length > 0 ? (approvedPolicies / policies.length) * 100 : 0,
    totalArtefacts: decisionTypes.length + decisionRights.length + forums.length + policies.length,
  };
}

/**
 * Build governance structure tree
 * @param {Array} forums - Forum artefacts
 * @param {Array} relationships - Relationship data
 * @returns {Array} Tree structure
 */
export function buildGovernanceTree(forums, relationships) {
  const forumMap = {};
  forums.forEach((f) => {
    forumMap[f.id] = { ...f, children: [] };
  });

  // Find parent-child relationships
  const reportsTo = relationships.filter((r) => r.relationship_type === 'reports_to');

  // Build tree
  const roots = [];
  forums.forEach((forum) => {
    const parentRel = reportsTo.find((r) => r.source_id === forum.id);
    if (parentRel && forumMap[parentRel.target_id]) {
      forumMap[parentRel.target_id].children.push(forumMap[forum.id]);
    } else {
      roots.push(forumMap[forum.id]);
    }
  });

  return roots;
}

/**
 * Build decision rights matrix
 * @param {Array} decisionTypes - Decision type artefacts
 * @param {Array} decisionRights - Decision right artefacts
 * @param {Array} forums - Forum artefacts
 * @returns {Object} Matrix structure
 */
export function buildDecisionRightsMatrix(decisionTypes, decisionRights, forums) {
  const matrix = {
    rows: decisionTypes.map((dt) => ({
      id: dt.id,
      name: dt.name,
      scope: dt.properties?.scope,
    })),
    columns: forums.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.properties?.forum_type,
    })),
    cells: {},
  };

  // Fill in cells based on decision rights
  decisionRights.forEach((dr) => {
    const forumName = dr.properties?.role_or_forum;
    const forum = forums.find((f) => f.name === forumName);
    if (forum) {
      const key = `${dr.properties?.decision_type_id}_${forum.id}`;
      matrix.cells[key] = {
        rightType: dr.properties?.right_type,
        constraints: dr.properties?.constraints,
      };
    }
  });

  return matrix;
}

export default {
  GOV_TYPE_DEFS,
  GOV_STAGES,
  GOV_WORKSPACE_MODULES,
  GOV_RELATIONSHIP_TYPES,
  GOV_DECISION_SCOPE,
  GOV_RACI_TYPES,
  GOV_AUTHORITY_LEVELS,
  GOV_POLICY_STATUS,
  GOV_GUIDANCE,
  GOV_WIZARD_STEPS,
  isGovType,
  getTypeDefinition,
  getTypeColor,
  getStageForType,
  getTypesForStage,
  calculateGovernanceCoverage,
  buildGovernanceTree,
  buildDecisionRightsMatrix,
};
