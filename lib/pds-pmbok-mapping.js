// lib/pds-pmbok-mapping.js
// PMBOK/PRINCE2 Framework Mapping for Project Design Workspace
// Maps PDS concepts to underlying framework elements without exposing jargon

/**
 * PMBOK Knowledge Areas mapped to PDS Stages
 * The mapping helps ensure comprehensive coverage while using accessible language
 */
export const PMBOK_TO_PDS_MAPPING = {
  // PMBOK Integration Management
  integration: {
    pdsStage: 'intent',
    pdsTypes: ['pds_project', 'pds_business_case', 'pds_governance_gate'],
    description: 'Unifying all project elements',
    userFriendlyName: 'Project Integration',
  },

  // PMBOK Scope Management
  scope: {
    pdsStage: 'structure',
    pdsTypes: ['pds_deliverable', 'pds_work_package'],
    description: 'Defining what the project will deliver',
    userFriendlyName: 'Project Scope',
  },

  // PMBOK Schedule Management
  schedule: {
    pdsStage: 'structure',
    pdsTypes: ['pds_milestone', 'pds_dependency'],
    description: 'Planning when things happen',
    userFriendlyName: 'Timeline Planning',
  },

  // PMBOK Cost Management
  cost: {
    pdsStage: 'intent',
    pdsTypes: ['pds_business_case', 'pds_resource_need'],
    description: 'Managing project investment',
    userFriendlyName: 'Budget & Resources',
  },

  // PMBOK Quality Management
  quality: {
    pdsStage: 'control',
    pdsTypes: ['pds_success_measure', 'pds_status_update'],
    description: 'Ensuring deliverables meet standards',
    userFriendlyName: 'Quality Assurance',
  },

  // PMBOK Resource Management
  resource: {
    pdsStage: 'structure',
    pdsTypes: ['pds_resource_need', 'pds_work_package'],
    description: 'Organizing people and capabilities',
    userFriendlyName: 'Team & Resources',
  },

  // PMBOK Communications Management
  communications: {
    pdsStage: 'intent',
    pdsTypes: ['pds_stakeholder', 'pds_status_update'],
    description: 'Keeping everyone informed',
    userFriendlyName: 'Communications',
  },

  // PMBOK Risk Management
  risk: {
    pdsStage: 'uncertainty',
    pdsTypes: ['pds_risk', 'pds_assumption', 'pds_issue', 'pds_contingency'],
    description: 'Managing uncertainty and threats',
    userFriendlyName: 'Risk & Issues',
  },

  // PMBOK Procurement Management
  procurement: {
    pdsStage: 'structure',
    pdsTypes: ['pds_resource_need', 'pds_constraint'],
    description: 'Obtaining external resources',
    userFriendlyName: 'Procurement',
  },

  // PMBOK Stakeholder Management
  stakeholder: {
    pdsStage: 'intent',
    pdsTypes: ['pds_stakeholder', 'pds_governance_gate'],
    description: 'Engaging interested parties',
    userFriendlyName: 'Stakeholder Engagement',
  },
};

/**
 * PRINCE2 Themes mapped to PDS elements
 */
export const PRINCE2_TO_PDS_MAPPING = {
  // Business Case Theme
  businessCase: {
    pdsStage: 'intent',
    pdsTypes: ['pds_business_case', 'pds_success_measure', 'pds_benefit_realization'],
    purpose: 'Continuous business justification',
    questions: [
      'Is this project still worthwhile?',
      'Are the expected benefits still achievable?',
    ],
  },

  // Organization Theme
  organization: {
    pdsStage: 'intent',
    pdsTypes: ['pds_stakeholder', 'pds_governance_gate'],
    purpose: 'Define accountability and authority',
    questions: [
      'Who has authority to approve changes?',
      'Who is accountable for delivery?',
    ],
  },

  // Quality Theme
  quality: {
    pdsStage: 'structure',
    pdsTypes: ['pds_deliverable', 'pds_success_measure'],
    purpose: 'Define and verify quality criteria',
    questions: [
      'How will we know if a deliverable is acceptable?',
      'What standards must we meet?',
    ],
  },

  // Plans Theme
  plans: {
    pdsStage: 'structure',
    pdsTypes: ['pds_milestone', 'pds_deliverable', 'pds_work_package', 'pds_dependency'],
    purpose: 'Define how, when, and by whom',
    questions: [
      'What must happen in what order?',
      'Who will do what and when?',
    ],
  },

  // Risk Theme
  risk: {
    pdsStage: 'uncertainty',
    pdsTypes: ['pds_risk', 'pds_assumption', 'pds_contingency'],
    purpose: 'Identify and manage uncertainty',
    questions: [
      'What could prevent success?',
      'What assumptions are we making?',
    ],
  },

  // Change Theme
  change: {
    pdsStage: 'control',
    pdsTypes: ['pds_change_request', 'pds_decision', 'pds_exception'],
    purpose: 'Control and adapt to changes',
    questions: [
      'How will we handle change requests?',
      'What triggers escalation?',
    ],
  },

  // Progress Theme
  progress: {
    pdsStage: 'control',
    pdsTypes: ['pds_status_update', 'pds_progress_measure', 'pds_exception'],
    purpose: 'Monitor and compare against plan',
    questions: [
      'Are we on track?',
      'What needs attention?',
    ],
  },
};

/**
 * Cross-studio relationship mappings
 * Defines how PDS artefacts can link to other studio artefacts
 */
export const CROSS_STUDIO_RELATIONSHIPS = {
  // DWD -> PDS
  dwd_to_pds: [
    {
      fromType: 'dwd_case',
      toType: 'pds_deliverable',
      relationshipType: 'informed_by',
      description: 'Deliverable informed by work design case',
      required: false,
    },
    {
      fromType: 'dwd_adjustment',
      toType: 'pds_change_request',
      relationshipType: 'triggers',
      description: 'Work adjustment triggers change request',
      required: false,
    },
  ],

  // BA -> PDS
  ba_to_pds: [
    {
      fromType: 'requirement',
      toType: 'pds_deliverable',
      relationshipType: 'implements',
      description: 'Deliverable implements requirement',
      required: false,
    },
    {
      fromType: 'stakeholder',
      toType: 'pds_stakeholder',
      relationshipType: 'references',
      description: 'PDS stakeholder references BA stakeholder',
      required: false,
    },
  ],

  // EA -> PDS
  ea_to_pds: [
    {
      fromType: 'capability',
      toType: 'pds_deliverable',
      relationshipType: 'enables',
      description: 'Deliverable enables capability',
      required: false,
    },
    {
      fromType: 'component',
      toType: 'pds_work_package',
      relationshipType: 'relates_to',
      description: 'Work package relates to component',
      required: false,
    },
  ],
};

/**
 * Get suggested artefacts to create based on project stage
 * @param {string} stage - Current project stage
 * @param {Array} existingArtefacts - Already created artefacts
 * @returns {Array} Suggested artefact types to create
 */
export function getSuggestedArtefacts(stage, existingArtefacts = []) {
  const existingTypes = new Set(existingArtefacts.map(a => a.artefact_type));

  const suggestions = {
    intent: [
      { type: 'pds_stakeholder', priority: 'high', reason: 'Identify who cares about this project' },
      { type: 'pds_business_case', priority: 'high', reason: 'Document the justification' },
      { type: 'pds_success_measure', priority: 'medium', reason: 'Define how you will measure success' },
      { type: 'pds_governance_gate', priority: 'medium', reason: 'Establish decision checkpoints' },
    ],
    structure: [
      { type: 'pds_deliverable', priority: 'high', reason: 'Define what the project will produce' },
      { type: 'pds_milestone', priority: 'high', reason: 'Set key checkpoints' },
      { type: 'pds_work_package', priority: 'medium', reason: 'Group related activities' },
      { type: 'pds_dependency', priority: 'low', reason: 'Map relationships between deliverables' },
    ],
    uncertainty: [
      { type: 'pds_risk', priority: 'high', reason: 'Identify potential threats and opportunities' },
      { type: 'pds_assumption', priority: 'high', reason: 'Document what you believe to be true' },
      { type: 'pds_constraint', priority: 'medium', reason: 'Note boundary conditions' },
      { type: 'pds_contingency', priority: 'low', reason: 'Plan backup responses' },
    ],
    control: [
      { type: 'pds_status_update', priority: 'high', reason: 'Record current project state' },
      { type: 'pds_change_request', priority: 'medium', reason: 'Log requested changes' },
      { type: 'pds_decision', priority: 'medium', reason: 'Document key decisions' },
      { type: 'pds_issue', priority: 'high', reason: 'Track active problems' },
    ],
    learning: [
      { type: 'pds_lesson', priority: 'high', reason: 'Capture insights from experience' },
      { type: 'pds_retrospective', priority: 'medium', reason: 'Run team reflection sessions' },
      { type: 'pds_benefit_realization', priority: 'medium', reason: 'Track actual vs expected value' },
      { type: 'pds_closure_item', priority: 'low', reason: 'Document handover items' },
    ],
  };

  return (suggestions[stage] || [])
    .filter(s => !existingTypes.has(s.type))
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

/**
 * Get framework coverage report
 * Shows which PMBOK/PRINCE2 areas are addressed by current artefacts
 * @param {Array} artefacts - Project artefacts
 * @returns {Object} Coverage report
 */
export function getFrameworkCoverage(artefacts) {
  const artefactTypes = new Set(artefacts.map(a => a.artefact_type));

  const pmbokCoverage = {};
  Object.entries(PMBOK_TO_PDS_MAPPING).forEach(([area, mapping]) => {
    const coveredTypes = mapping.pdsTypes.filter(t => artefactTypes.has(t));
    pmbokCoverage[area] = {
      name: mapping.userFriendlyName,
      covered: coveredTypes.length,
      total: mapping.pdsTypes.length,
      percentage: Math.round((coveredTypes.length / mapping.pdsTypes.length) * 100),
      missingTypes: mapping.pdsTypes.filter(t => !artefactTypes.has(t)),
    };
  });

  const prince2Coverage = {};
  Object.entries(PRINCE2_TO_PDS_MAPPING).forEach(([theme, mapping]) => {
    const coveredTypes = mapping.pdsTypes.filter(t => artefactTypes.has(t));
    prince2Coverage[theme] = {
      purpose: mapping.purpose,
      covered: coveredTypes.length,
      total: mapping.pdsTypes.length,
      percentage: Math.round((coveredTypes.length / mapping.pdsTypes.length) * 100),
      missingTypes: mapping.pdsTypes.filter(t => !artefactTypes.has(t)),
    };
  });

  // Calculate overall coverage
  const totalPmbok = Object.values(pmbokCoverage).reduce((sum, c) => sum + c.total, 0);
  const coveredPmbok = Object.values(pmbokCoverage).reduce((sum, c) => sum + c.covered, 0);
  const totalPrince2 = Object.values(prince2Coverage).reduce((sum, c) => sum + c.total, 0);
  const coveredPrince2 = Object.values(prince2Coverage).reduce((sum, c) => sum + c.covered, 0);

  return {
    pmbok: pmbokCoverage,
    prince2: prince2Coverage,
    overallPmbok: Math.round((coveredPmbok / totalPmbok) * 100),
    overallPrince2: Math.round((coveredPrince2 / totalPrince2) * 100),
    artefactCount: artefacts.length,
  };
}

export default {
  PMBOK_TO_PDS_MAPPING,
  PRINCE2_TO_PDS_MAPPING,
  CROSS_STUDIO_RELATIONSHIPS,
  getSuggestedArtefacts,
  getFrameworkCoverage,
};
