/**
 * PDS Type Definitions - Project Design Workspace
 *
 * A reasoning-led environment for project thinking and delivery guidance.
 * Integrates PMBOK tools and PRINCE2 governance patterns without exposing jargon.
 *
 * @module lib/pds-types
 */

// =============================================================================
// STAGES (5 Core Spaces)
// =============================================================================

export const PDS_STAGES = {
  INTENT: 'intent',
  STRUCTURE: 'structure',
  UNCERTAINTY: 'uncertainty',
  CONTROL: 'control',
  LEARNING: 'learning',
};

export const PDS_STAGE_INFO = {
  [PDS_STAGES.INTENT]: {
    id: 'intent',
    name: 'Intent & Governance',
    shortName: 'Intent',
    description: 'Define why this project exists and who is accountable',
    keyQuestions: [
      'What outcome justifies this investment?',
      'Who can stop it?',
      'What does success look like?',
    ],
    color: '#6366f1', // indigo
    icon: 'Target',
  },
  [PDS_STAGES.STRUCTURE]: {
    id: 'structure',
    name: 'Structure & Planning',
    shortName: 'Structure',
    description: 'Organize work breakdown and dependencies',
    keyQuestions: [
      'What must happen in what order?',
      'What\'s the critical path?',
      'Who delivers what?',
    ],
    color: '#3b82f6', // blue
    icon: 'AccountTree',
  },
  [PDS_STAGES.UNCERTAINTY]: {
    id: 'uncertainty',
    name: 'Risk & Uncertainty',
    shortName: 'Uncertainty',
    description: 'Surface and address what could go wrong',
    keyQuestions: [
      'What assumptions are we making?',
      'What could derail us?',
      'How do we respond?',
    ],
    color: '#f59e0b', // amber
    icon: 'Warning',
  },
  [PDS_STAGES.CONTROL]: {
    id: 'control',
    name: 'Execution & Control',
    shortName: 'Control',
    description: 'Track progress and adapt',
    keyQuestions: [
      'Are we on track?',
      'What\'s changing?',
      'What needs escalation?',
    ],
    color: '#22c55e', // green
    icon: 'Speed',
  },
  [PDS_STAGES.LEARNING]: {
    id: 'learning',
    name: 'Learning & Evolution',
    shortName: 'Learning',
    description: 'Capture insights and close the loop',
    keyQuestions: [
      'What did we learn?',
      'Would we do this again?',
      'What should others know?',
    ],
    color: '#8b5cf6', // violet
    icon: 'School',
  },
};

// =============================================================================
// PROJECT STATUS & HEALTH
// =============================================================================

export const PDS_PROJECT_STATUS = {
  DRAFT: 'draft',
  INITIATING: 'initiating',
  PLANNING: 'planning',
  EXECUTING: 'executing',
  MONITORING: 'monitoring',
  CLOSING: 'closing',
  CLOSED: 'closed',
  ON_HOLD: 'on_hold',
  CANCELLED: 'cancelled',
};

export const PDS_PROJECT_HEALTH = {
  GREEN: 'green',
  AMBER: 'amber',
  RED: 'red',
  UNKNOWN: 'unknown',
};

export const PDS_STATUS_INFO = {
  [PDS_PROJECT_STATUS.DRAFT]: { label: 'Draft', color: '#6b7280' },
  [PDS_PROJECT_STATUS.INITIATING]: { label: 'Initiating', color: '#6366f1' },
  [PDS_PROJECT_STATUS.PLANNING]: { label: 'Planning', color: '#3b82f6' },
  [PDS_PROJECT_STATUS.EXECUTING]: { label: 'Executing', color: '#22c55e' },
  [PDS_PROJECT_STATUS.MONITORING]: { label: 'Monitoring', color: '#f59e0b' },
  [PDS_PROJECT_STATUS.CLOSING]: { label: 'Closing', color: '#8b5cf6' },
  [PDS_PROJECT_STATUS.CLOSED]: { label: 'Closed', color: '#64748b' },
  [PDS_PROJECT_STATUS.ON_HOLD]: { label: 'On Hold', color: '#f97316' },
  [PDS_PROJECT_STATUS.CANCELLED]: { label: 'Cancelled', color: '#ef4444' },
};

export const PDS_HEALTH_INFO = {
  [PDS_PROJECT_HEALTH.GREEN]: { label: 'On Track', color: '#22c55e', icon: 'CheckCircle' },
  [PDS_PROJECT_HEALTH.AMBER]: { label: 'At Risk', color: '#f59e0b', icon: 'Warning' },
  [PDS_PROJECT_HEALTH.RED]: { label: 'Off Track', color: '#ef4444', icon: 'Error' },
  [PDS_PROJECT_HEALTH.UNKNOWN]: { label: 'Unknown', color: '#6b7280', icon: 'Help' },
};

// =============================================================================
// ARTEFACT TYPE DEFINITIONS
// =============================================================================

/**
 * All PDS artefact types with their schemas and metadata
 */
export const PDS_ARTEFACT_TYPES = {
  // -------------------------------------------------------------------------
  // Stage 1: Intent & Governance
  // -------------------------------------------------------------------------

  pds_project: {
    id: 'pds_project',
    name: 'Project',
    description: 'Central entity representing the project being designed',
    stage: PDS_STAGES.INTENT,
    icon: 'Folder',
    color: '#6366f1',
    fields: {
      title: { type: 'string', required: true, label: 'Project Title' },
      vision: { type: 'text', required: true, label: 'Vision Statement', hint: 'What future state does this project create?' },
      success_criteria: { type: 'array', itemType: 'string', label: 'Success Criteria', hint: 'How will we know the project succeeded?' },
      srs_decision_id: { type: 'reference', refType: 'srs_decision', label: 'Originating Decision', hint: 'Link to the SRS decision that initiated this project' },
      status: { type: 'enum', options: Object.values(PDS_PROJECT_STATUS), default: 'draft', label: 'Status' },
      health: { type: 'enum', options: Object.values(PDS_PROJECT_HEALTH), default: 'unknown', label: 'Health' },
      start_date: { type: 'date', label: 'Start Date' },
      target_end_date: { type: 'date', label: 'Target End Date' },
      budget: { type: 'number', label: 'Budget', hint: 'Estimated total budget' },
      sponsor: { type: 'string', label: 'Sponsor', hint: 'Executive sponsor accountable for the project' },
    },
  },

  pds_stakeholder: {
    id: 'pds_stakeholder',
    name: 'Stakeholder',
    description: 'Interested party who affects or is affected by the project',
    stage: PDS_STAGES.INTENT,
    icon: 'Person',
    color: '#8b5cf6',
    fields: {
      name: { type: 'string', required: true, label: 'Name' },
      role: { type: 'string', label: 'Role/Title' },
      organization: { type: 'string', label: 'Organization' },
      influence: { type: 'enum', options: ['low', 'medium', 'high'], default: 'medium', label: 'Influence', hint: 'Power to affect project outcomes' },
      interest: { type: 'enum', options: ['low', 'medium', 'high'], default: 'medium', label: 'Interest', hint: 'Level of concern about project outcomes' },
      engagement_strategy: { type: 'enum', options: ['monitor', 'keep_informed', 'keep_satisfied', 'manage_closely'], label: 'Engagement Strategy' },
      expectations: { type: 'array', itemType: 'string', label: 'Expectations', hint: 'What does this stakeholder expect from the project?' },
      concerns: { type: 'array', itemType: 'string', label: 'Concerns', hint: 'What worries this stakeholder?' },
      communication_preference: { type: 'string', label: 'Communication Preference', hint: 'How and when to communicate' },
    },
  },

  pds_governance_gate: {
    id: 'pds_governance_gate',
    name: 'Governance Gate',
    description: 'Decision checkpoint requiring authority approval to proceed',
    stage: PDS_STAGES.INTENT,
    icon: 'Gavel',
    color: '#6366f1',
    fields: {
      name: { type: 'string', required: true, label: 'Gate Name' },
      description: { type: 'text', label: 'Description' },
      criteria: { type: 'array', itemType: 'string', required: true, label: 'Pass Criteria', hint: 'What must be true to pass this gate?' },
      authority: { type: 'string', required: true, label: 'Decision Authority', hint: 'Who has the power to approve?' },
      scheduled_date: { type: 'date', label: 'Scheduled Date' },
      actual_date: { type: 'date', label: 'Actual Date' },
      outcome: { type: 'enum', options: ['pending', 'approved', 'approved_with_conditions', 'rejected', 'deferred'], default: 'pending', label: 'Outcome' },
      conditions: { type: 'array', itemType: 'string', label: 'Conditions', hint: 'Conditions attached to approval' },
      notes: { type: 'text', label: 'Decision Notes' },
    },
  },

  pds_business_case: {
    id: 'pds_business_case',
    name: 'Business Case',
    description: 'Justification for the project investment',
    stage: PDS_STAGES.INTENT,
    icon: 'Assessment',
    color: '#22c55e',
    fields: {
      title: { type: 'string', required: true, label: 'Title' },
      problem_statement: { type: 'text', required: true, label: 'Problem Statement', hint: 'What problem does this project solve?' },
      benefits: { type: 'array', itemType: 'object', schema: { description: 'string', value: 'number', type: 'enum:tangible,intangible', timeframe: 'string' }, label: 'Expected Benefits' },
      costs: { type: 'array', itemType: 'object', schema: { category: 'string', amount: 'number', recurring: 'boolean' }, label: 'Costs' },
      roi_analysis: { type: 'text', label: 'ROI Analysis' },
      alternatives_considered: { type: 'array', itemType: 'object', schema: { option: 'string', pros: 'string', cons: 'string', rejected_reason: 'string' }, label: 'Alternatives Considered' },
      recommendation: { type: 'text', label: 'Recommendation' },
      status: { type: 'enum', options: ['draft', 'submitted', 'approved', 'rejected'], default: 'draft', label: 'Status' },
    },
  },

  pds_success_measure: {
    id: 'pds_success_measure',
    name: 'Success Measure',
    description: 'KPI or OKR to track project success',
    stage: PDS_STAGES.INTENT,
    icon: 'TrendingUp',
    color: '#10b981',
    fields: {
      name: { type: 'string', required: true, label: 'Measure Name' },
      description: { type: 'text', label: 'Description' },
      metric: { type: 'string', required: true, label: 'Metric', hint: 'What are we measuring?' },
      baseline: { type: 'string', label: 'Baseline', hint: 'Current/starting value' },
      target: { type: 'string', required: true, label: 'Target', hint: 'Target value to achieve' },
      current: { type: 'string', label: 'Current Value' },
      measurement_method: { type: 'text', label: 'Measurement Method', hint: 'How will this be measured?' },
      review_frequency: { type: 'enum', options: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly'], label: 'Review Frequency' },
      owner: { type: 'string', label: 'Owner' },
      status: { type: 'enum', options: ['not_started', 'on_track', 'at_risk', 'achieved', 'missed'], default: 'not_started', label: 'Status' },
    },
  },

  // -------------------------------------------------------------------------
  // Stage 2: Structure & Planning
  // -------------------------------------------------------------------------

  pds_deliverable: {
    id: 'pds_deliverable',
    name: 'Deliverable',
    description: 'Tangible output or result produced by the project',
    stage: PDS_STAGES.STRUCTURE,
    icon: 'Inventory',
    color: '#3b82f6',
    fields: {
      name: { type: 'string', required: true, label: 'Deliverable Name' },
      description: { type: 'text', label: 'Description' },
      acceptance_criteria: { type: 'array', itemType: 'string', label: 'Acceptance Criteria', hint: 'How will we know this is complete?' },
      owner: { type: 'string', label: 'Owner' },
      planned_start: { type: 'date', label: 'Planned Start' },
      planned_end: { type: 'date', label: 'Planned End' },
      actual_start: { type: 'date', label: 'Actual Start' },
      actual_end: { type: 'date', label: 'Actual End' },
      progress: { type: 'number', min: 0, max: 100, default: 0, label: 'Progress %' },
      status: { type: 'enum', options: ['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'], default: 'not_started', label: 'Status' },
      priority: { type: 'enum', options: ['low', 'medium', 'high', 'critical'], default: 'medium', label: 'Priority' },
      is_critical_path: { type: 'boolean', default: false, label: 'On Critical Path' },
    },
  },

  pds_milestone: {
    id: 'pds_milestone',
    name: 'Milestone',
    description: 'Key checkpoint marking significant progress',
    stage: PDS_STAGES.STRUCTURE,
    icon: 'Flag',
    color: '#f59e0b',
    fields: {
      name: { type: 'string', required: true, label: 'Milestone Name' },
      description: { type: 'text', label: 'Description' },
      planned_date: { type: 'date', required: true, label: 'Planned Date' },
      actual_date: { type: 'date', label: 'Actual Date' },
      success_criteria: { type: 'text', label: 'Success Criteria', hint: 'What must be true at this milestone?' },
      status: { type: 'enum', options: ['upcoming', 'at_risk', 'achieved', 'missed', 'cancelled'], default: 'upcoming', label: 'Status' },
      is_governance_gate: { type: 'boolean', default: false, label: 'Governance Gate' },
    },
  },

  pds_work_package: {
    id: 'pds_work_package',
    name: 'Work Package',
    description: 'Group of related activities assigned to a team',
    stage: PDS_STAGES.STRUCTURE,
    icon: 'WorkOutline',
    color: '#0ea5e9',
    fields: {
      name: { type: 'string', required: true, label: 'Work Package Name' },
      description: { type: 'text', label: 'Description' },
      owner: { type: 'string', required: true, label: 'Owner' },
      effort_estimate: { type: 'string', label: 'Effort Estimate', hint: 'e.g., 40 hours, 2 sprints' },
      duration_estimate: { type: 'string', label: 'Duration Estimate', hint: 'e.g., 2 weeks' },
      planned_start: { type: 'date', label: 'Planned Start' },
      planned_end: { type: 'date', label: 'Planned End' },
      status: { type: 'enum', options: ['not_started', 'in_progress', 'completed', 'cancelled'], default: 'not_started', label: 'Status' },
      progress: { type: 'number', min: 0, max: 100, default: 0, label: 'Progress %' },
    },
  },

  pds_dependency: {
    id: 'pds_dependency',
    name: 'Dependency',
    description: 'Relationship between deliverables or work items',
    stage: PDS_STAGES.STRUCTURE,
    icon: 'Link',
    color: '#64748b',
    fields: {
      name: { type: 'string', required: true, label: 'Dependency Name' },
      description: { type: 'text', label: 'Description' },
      type: { type: 'enum', options: ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'], default: 'finish_to_start', label: 'Type' },
      lag: { type: 'string', label: 'Lag', hint: 'Time between dependent items, e.g., +2 days' },
      criticality: { type: 'enum', options: ['low', 'medium', 'high', 'critical'], default: 'medium', label: 'Criticality' },
      mitigation: { type: 'text', label: 'Mitigation', hint: 'How to reduce dependency risk' },
      status: { type: 'enum', options: ['active', 'resolved', 'blocked'], default: 'active', label: 'Status' },
      external: { type: 'boolean', default: false, label: 'External Dependency', hint: 'Outside project control' },
    },
  },

  pds_resource_need: {
    id: 'pds_resource_need',
    name: 'Resource Need',
    description: 'Capability or resource required for the project',
    stage: PDS_STAGES.STRUCTURE,
    icon: 'Groups',
    color: '#8b5cf6',
    fields: {
      skill: { type: 'string', required: true, label: 'Skill/Resource Type' },
      description: { type: 'text', label: 'Description' },
      quantity: { type: 'number', default: 1, label: 'Quantity' },
      timing: { type: 'string', label: 'Timing', hint: 'When is this needed?' },
      duration: { type: 'string', label: 'Duration', hint: 'How long is this needed?' },
      source: { type: 'enum', options: ['internal', 'external', 'contractor', 'tbd'], default: 'tbd', label: 'Source' },
      cost_rate: { type: 'string', label: 'Cost Rate' },
      availability: { type: 'enum', options: ['confirmed', 'tentative', 'needed', 'unavailable'], default: 'needed', label: 'Availability' },
      assigned_to: { type: 'string', label: 'Assigned To' },
    },
  },

  // -------------------------------------------------------------------------
  // Stage 3: Risk & Uncertainty
  // -------------------------------------------------------------------------

  pds_risk: {
    id: 'pds_risk',
    name: 'Risk',
    description: 'Uncertain event that could affect project objectives',
    stage: PDS_STAGES.UNCERTAINTY,
    icon: 'Warning',
    color: '#ef4444',
    fields: {
      title: { type: 'string', required: true, label: 'Risk Title' },
      description: { type: 'text', label: 'Description' },
      category: { type: 'enum', options: ['technical', 'schedule', 'cost', 'resource', 'scope', 'quality', 'external', 'organizational'], label: 'Category' },
      probability: { type: 'enum', options: ['very_low', 'low', 'medium', 'high', 'very_high'], default: 'medium', label: 'Probability' },
      impact: { type: 'enum', options: ['very_low', 'low', 'medium', 'high', 'very_high'], default: 'medium', label: 'Impact' },
      exposure: { type: 'enum', options: ['low', 'moderate', 'high', 'critical'], label: 'Exposure', hint: 'Calculated from probability × impact' },
      response_strategy: { type: 'enum', options: ['avoid', 'mitigate', 'transfer', 'accept', 'exploit', 'enhance', 'share'], label: 'Response Strategy' },
      response_actions: { type: 'text', label: 'Response Actions' },
      owner: { type: 'string', label: 'Risk Owner' },
      triggers: { type: 'array', itemType: 'string', label: 'Triggers', hint: 'Warning signs that risk is materializing' },
      status: { type: 'enum', options: ['identified', 'analyzing', 'mitigating', 'monitoring', 'closed', 'occurred'], default: 'identified', label: 'Status' },
      is_opportunity: { type: 'boolean', default: false, label: 'Opportunity', hint: 'Positive risk to exploit' },
    },
  },

  pds_assumption: {
    id: 'pds_assumption',
    name: 'Assumption',
    description: 'Belief taken as true without proof',
    stage: PDS_STAGES.UNCERTAINTY,
    icon: 'Psychology',
    color: '#f59e0b',
    fields: {
      statement: { type: 'string', required: true, label: 'Assumption Statement' },
      basis: { type: 'text', label: 'Basis', hint: 'Why do we believe this?' },
      validation_method: { type: 'text', label: 'Validation Method', hint: 'How will we test this assumption?' },
      confidence: { type: 'enum', options: ['low', 'medium', 'high'], default: 'medium', label: 'Confidence' },
      impact_if_wrong: { type: 'text', label: 'Impact if Wrong', hint: 'What happens if this assumption is invalid?' },
      check_date: { type: 'date', label: 'Check By Date' },
      status: { type: 'enum', options: ['unvalidated', 'testing', 'validated', 'invalidated'], default: 'unvalidated', label: 'Status' },
      owner: { type: 'string', label: 'Owner' },
    },
  },

  pds_issue: {
    id: 'pds_issue',
    name: 'Issue',
    description: 'Current problem that needs resolution',
    stage: PDS_STAGES.UNCERTAINTY,
    icon: 'Error',
    color: '#ef4444',
    fields: {
      title: { type: 'string', required: true, label: 'Issue Title' },
      description: { type: 'text', label: 'Description' },
      category: { type: 'enum', options: ['technical', 'resource', 'scope', 'communication', 'external', 'other'], label: 'Category' },
      impact: { type: 'enum', options: ['low', 'medium', 'high', 'critical'], default: 'medium', label: 'Impact' },
      urgency: { type: 'enum', options: ['low', 'medium', 'high', 'critical'], default: 'medium', label: 'Urgency' },
      owner: { type: 'string', label: 'Owner' },
      raised_date: { type: 'date', label: 'Raised Date' },
      target_resolution_date: { type: 'date', label: 'Target Resolution Date' },
      actual_resolution_date: { type: 'date', label: 'Actual Resolution Date' },
      resolution: { type: 'text', label: 'Resolution' },
      status: { type: 'enum', options: ['open', 'in_progress', 'escalated', 'resolved', 'closed'], default: 'open', label: 'Status' },
      escalated_to: { type: 'string', label: 'Escalated To' },
    },
  },

  pds_constraint: {
    id: 'pds_constraint',
    name: 'Constraint',
    description: 'Boundary condition limiting project options',
    stage: PDS_STAGES.UNCERTAINTY,
    icon: 'Block',
    color: '#64748b',
    fields: {
      type: { type: 'enum', options: ['time', 'cost', 'scope', 'resource', 'quality', 'regulatory', 'technical', 'organizational'], required: true, label: 'Type' },
      description: { type: 'text', required: true, label: 'Description' },
      source: { type: 'string', label: 'Source', hint: 'Where does this constraint come from?' },
      flexibility: { type: 'enum', options: ['fixed', 'negotiable', 'flexible'], default: 'fixed', label: 'Flexibility' },
      workaround: { type: 'text', label: 'Workaround', hint: 'How can we work within this constraint?' },
      impact: { type: 'text', label: 'Impact', hint: 'How does this affect the project?' },
    },
  },

  pds_contingency: {
    id: 'pds_contingency',
    name: 'Contingency Plan',
    description: 'Backup plan if a risk materializes',
    stage: PDS_STAGES.UNCERTAINTY,
    icon: 'Restore',
    color: '#0ea5e9',
    fields: {
      name: { type: 'string', required: true, label: 'Plan Name' },
      description: { type: 'text', label: 'Description' },
      trigger: { type: 'text', required: true, label: 'Trigger', hint: 'What activates this plan?' },
      response_actions: { type: 'array', itemType: 'string', label: 'Response Actions' },
      owner: { type: 'string', label: 'Owner' },
      resources_needed: { type: 'text', label: 'Resources Needed' },
      activation_criteria: { type: 'text', label: 'Activation Criteria' },
      status: { type: 'enum', options: ['ready', 'activated', 'completed', 'cancelled'], default: 'ready', label: 'Status' },
    },
  },

  // -------------------------------------------------------------------------
  // Stage 4: Execution & Control
  // -------------------------------------------------------------------------

  pds_status_update: {
    id: 'pds_status_update',
    name: 'Status Update',
    description: 'Point-in-time snapshot of project health',
    stage: PDS_STAGES.CONTROL,
    icon: 'Assessment',
    color: '#22c55e',
    fields: {
      date: { type: 'date', required: true, label: 'Report Date' },
      period: { type: 'string', label: 'Reporting Period' },
      overall_status: { type: 'enum', options: Object.values(PDS_PROJECT_HEALTH), default: 'unknown', label: 'Overall Status' },
      schedule_status: { type: 'enum', options: Object.values(PDS_PROJECT_HEALTH), default: 'unknown', label: 'Schedule Status' },
      budget_status: { type: 'enum', options: Object.values(PDS_PROJECT_HEALTH), default: 'unknown', label: 'Budget Status' },
      quality_status: { type: 'enum', options: Object.values(PDS_PROJECT_HEALTH), default: 'unknown', label: 'Quality Status' },
      scope_status: { type: 'enum', options: Object.values(PDS_PROJECT_HEALTH), default: 'unknown', label: 'Scope Status' },
      highlights: { type: 'array', itemType: 'string', label: 'Highlights', hint: 'Key achievements this period' },
      concerns: { type: 'array', itemType: 'string', label: 'Concerns', hint: 'Issues requiring attention' },
      next_steps: { type: 'array', itemType: 'string', label: 'Next Steps' },
      summary: { type: 'text', label: 'Summary' },
    },
  },

  pds_change_request: {
    id: 'pds_change_request',
    name: 'Change Request',
    description: 'Proposed modification to project scope, schedule, or budget',
    stage: PDS_STAGES.CONTROL,
    icon: 'SwapHoriz',
    color: '#f59e0b',
    fields: {
      title: { type: 'string', required: true, label: 'Title' },
      description: { type: 'text', required: true, label: 'Description' },
      requestor: { type: 'string', label: 'Requestor' },
      request_date: { type: 'date', label: 'Request Date' },
      category: { type: 'enum', options: ['scope', 'schedule', 'budget', 'quality', 'resource', 'other'], label: 'Category' },
      priority: { type: 'enum', options: ['low', 'medium', 'high', 'critical'], default: 'medium', label: 'Priority' },
      impact_analysis: { type: 'text', label: 'Impact Analysis', hint: 'How does this affect scope, schedule, budget, quality?' },
      scope_impact: { type: 'text', label: 'Scope Impact' },
      schedule_impact: { type: 'text', label: 'Schedule Impact' },
      cost_impact: { type: 'string', label: 'Cost Impact' },
      decision: { type: 'enum', options: ['pending', 'approved', 'rejected', 'deferred', 'more_info_needed'], default: 'pending', label: 'Decision' },
      decision_date: { type: 'date', label: 'Decision Date' },
      decision_rationale: { type: 'text', label: 'Decision Rationale' },
      decided_by: { type: 'string', label: 'Decided By' },
    },
  },

  pds_decision: {
    id: 'pds_decision',
    name: 'Project Decision',
    description: 'Significant choice made during project execution',
    stage: PDS_STAGES.CONTROL,
    icon: 'Gavel',
    color: '#6366f1',
    fields: {
      title: { type: 'string', required: true, label: 'Decision Title' },
      context: { type: 'text', label: 'Context', hint: 'What situation required this decision?' },
      options: { type: 'array', itemType: 'object', schema: { option: 'string', pros: 'string', cons: 'string' }, label: 'Options Considered' },
      chosen_option: { type: 'string', label: 'Chosen Option' },
      rationale: { type: 'text', label: 'Rationale', hint: 'Why was this option chosen?' },
      impact: { type: 'text', label: 'Impact' },
      reversibility: { type: 'enum', options: ['easily_reversible', 'reversible_with_cost', 'difficult_to_reverse', 'irreversible'], label: 'Reversibility' },
      decision_date: { type: 'date', label: 'Decision Date' },
      decided_by: { type: 'string', label: 'Decided By' },
      status: { type: 'enum', options: ['pending', 'decided', 'implemented', 'reversed'], default: 'pending', label: 'Status' },
    },
  },

  pds_exception: {
    id: 'pds_exception',
    name: 'Exception',
    description: 'Deviation from planned tolerances requiring escalation',
    stage: PDS_STAGES.CONTROL,
    icon: 'ReportProblem',
    color: '#ef4444',
    fields: {
      title: { type: 'string', required: true, label: 'Exception Title' },
      type: { type: 'enum', options: ['schedule', 'cost', 'scope', 'quality', 'risk', 'benefit'], required: true, label: 'Type' },
      description: { type: 'text', required: true, label: 'Description' },
      cause: { type: 'text', label: 'Cause' },
      impact: { type: 'text', label: 'Impact' },
      options: { type: 'array', itemType: 'object', schema: { option: 'string', impact: 'string', recommendation: 'boolean' }, label: 'Options' },
      corrective_action: { type: 'text', label: 'Corrective Action' },
      escalated_to: { type: 'string', label: 'Escalated To' },
      escalation_date: { type: 'date', label: 'Escalation Date' },
      resolution_date: { type: 'date', label: 'Resolution Date' },
      status: { type: 'enum', options: ['identified', 'escalated', 'resolved', 'closed'], default: 'identified', label: 'Status' },
    },
  },

  pds_progress_measure: {
    id: 'pds_progress_measure',
    name: 'Progress Measure',
    description: 'Actual vs planned tracking point',
    stage: PDS_STAGES.CONTROL,
    icon: 'ShowChart',
    color: '#3b82f6',
    fields: {
      date: { type: 'date', required: true, label: 'Date' },
      metric: { type: 'string', required: true, label: 'Metric', hint: 'What is being measured?' },
      planned_value: { type: 'string', required: true, label: 'Planned Value' },
      actual_value: { type: 'string', required: true, label: 'Actual Value' },
      variance: { type: 'string', label: 'Variance' },
      variance_percent: { type: 'number', label: 'Variance %' },
      trend: { type: 'enum', options: ['improving', 'stable', 'declining'], label: 'Trend' },
      notes: { type: 'text', label: 'Notes' },
    },
  },

  // -------------------------------------------------------------------------
  // Stage 5: Learning & Evolution
  // -------------------------------------------------------------------------

  pds_lesson: {
    id: 'pds_lesson',
    name: 'Lesson Learned',
    description: 'Insight captured from project experience',
    stage: PDS_STAGES.LEARNING,
    icon: 'Lightbulb',
    color: '#8b5cf6',
    fields: {
      title: { type: 'string', required: true, label: 'Title' },
      context: { type: 'text', label: 'Context', hint: 'What was happening?' },
      what_happened: { type: 'text', required: true, label: 'What Happened' },
      insight: { type: 'text', required: true, label: 'Insight', hint: 'What did we learn?' },
      recommendation: { type: 'text', label: 'Recommendation', hint: 'What should others do differently?' },
      category: { type: 'enum', options: ['planning', 'execution', 'communication', 'risk', 'stakeholder', 'technical', 'process', 'other'], label: 'Category' },
      applicability: { type: 'array', itemType: 'string', label: 'Applicability', hint: 'What types of projects can use this?' },
      source_phase: { type: 'enum', options: Object.values(PDS_STAGES), label: 'Source Phase' },
      wisdom_score: { type: 'number', min: 0, max: 100, default: 0, label: 'Wisdom Score', hint: 'How valuable/reusable is this lesson?' },
    },
  },

  pds_retrospective: {
    id: 'pds_retrospective',
    name: 'Retrospective',
    description: 'Structured reflection session',
    stage: PDS_STAGES.LEARNING,
    icon: 'History',
    color: '#0ea5e9',
    fields: {
      title: { type: 'string', required: true, label: 'Title' },
      date: { type: 'date', required: true, label: 'Date' },
      scope: { type: 'string', label: 'Scope', hint: 'What period/phase is being reviewed?' },
      participants: { type: 'array', itemType: 'string', label: 'Participants' },
      went_well: { type: 'array', itemType: 'string', label: 'What Went Well' },
      challenges: { type: 'array', itemType: 'string', label: 'Challenges' },
      improvements: { type: 'array', itemType: 'string', label: 'Improvements', hint: 'What could we do better?' },
      actions: { type: 'array', itemType: 'object', schema: { action: 'string', owner: 'string', due_date: 'date' }, label: 'Actions' },
      facilitator: { type: 'string', label: 'Facilitator' },
    },
  },

  pds_benefit_realization: {
    id: 'pds_benefit_realization',
    name: 'Benefit Realization',
    description: 'Tracking of expected benefits vs actual',
    stage: PDS_STAGES.LEARNING,
    icon: 'Stars',
    color: '#22c55e',
    fields: {
      benefit_name: { type: 'string', required: true, label: 'Benefit Name' },
      description: { type: 'text', label: 'Description' },
      measurement_date: { type: 'date', required: true, label: 'Measurement Date' },
      expected_value: { type: 'string', required: true, label: 'Expected Value' },
      actual_value: { type: 'string', required: true, label: 'Actual Value' },
      variance: { type: 'string', label: 'Variance' },
      variance_explanation: { type: 'text', label: 'Variance Explanation' },
      status: { type: 'enum', options: ['not_yet_realized', 'partially_realized', 'fully_realized', 'exceeded', 'not_realized'], default: 'not_yet_realized', label: 'Status' },
      realization_date: { type: 'date', label: 'Realization Date' },
    },
  },

  pds_closure_item: {
    id: 'pds_closure_item',
    name: 'Closure Item',
    description: 'Handover, archive, or closure task',
    stage: PDS_STAGES.LEARNING,
    icon: 'CheckCircle',
    color: '#64748b',
    fields: {
      title: { type: 'string', required: true, label: 'Title' },
      type: { type: 'enum', options: ['handover', 'archive', 'documentation', 'release', 'decommission', 'celebration', 'other'], required: true, label: 'Type' },
      description: { type: 'text', label: 'Description' },
      owner: { type: 'string', label: 'Owner' },
      target_date: { type: 'date', label: 'Target Date' },
      completion_date: { type: 'date', label: 'Completion Date' },
      status: { type: 'enum', options: ['pending', 'in_progress', 'completed', 'not_required'], default: 'pending', label: 'Status' },
      notes: { type: 'text', label: 'Notes' },
    },
  },
};

// =============================================================================
// RELATIONSHIP TYPES
// =============================================================================

export const PDS_RELATIONSHIP_TYPES = {
  // SRS Integration
  originated_from: {
    id: 'originated_from',
    name: 'Originated From',
    description: 'Project originated from an SRS decision',
    fromType: 'pds_project',
    toType: 'srs_decision',
  },

  // Governance
  governs: {
    id: 'governs',
    name: 'Governs',
    description: 'Governance gate controls project progress',
    fromType: 'pds_governance_gate',
    toType: 'pds_project',
  },

  // Stakeholder
  stakeholder_of: {
    id: 'stakeholder_of',
    name: 'Stakeholder Of',
    description: 'Stakeholder has interest in project',
    fromType: 'pds_stakeholder',
    toType: 'pds_project',
  },

  // Work Structure
  delivers: {
    id: 'delivers',
    name: 'Delivers',
    description: 'Work package produces deliverable',
    fromType: 'pds_work_package',
    toType: 'pds_deliverable',
  },

  depends_on: {
    id: 'depends_on',
    name: 'Depends On',
    description: 'Deliverable depends on another deliverable',
    fromType: 'pds_deliverable',
    toType: 'pds_deliverable',
  },

  milestone_includes: {
    id: 'milestone_includes',
    name: 'Includes',
    description: 'Milestone includes deliverable',
    fromType: 'pds_milestone',
    toType: 'pds_deliverable',
  },

  // Risk & Uncertainty
  mitigates: {
    id: 'mitigates',
    name: 'Mitigates',
    description: 'Contingency plan addresses risk',
    fromType: 'pds_contingency',
    toType: 'pds_risk',
  },

  validates: {
    id: 'validates',
    name: 'Validates',
    description: 'Assumption validates/invalidates risk',
    fromType: 'pds_assumption',
    toType: 'pds_risk',
  },

  raised_from: {
    id: 'raised_from',
    name: 'Raised From',
    description: 'Issue arose from risk materializing',
    fromType: 'pds_issue',
    toType: 'pds_risk',
  },

  // Control
  changes: {
    id: 'changes',
    name: 'Changes',
    description: 'Change request affects deliverable',
    fromType: 'pds_change_request',
    toType: 'pds_deliverable',
  },

  // Learning
  informs: {
    id: 'informs',
    name: 'Informs',
    description: 'Lesson informs work package approach',
    fromType: 'pds_lesson',
    toType: 'pds_work_package',
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get artefact types for a specific stage
 */
export function getArtefactTypesByStage(stage) {
  return Object.values(PDS_ARTEFACT_TYPES).filter(t => t.stage === stage);
}

/**
 * Get all artefact type IDs
 */
export function getAllArtefactTypeIds() {
  return Object.keys(PDS_ARTEFACT_TYPES);
}

/**
 * Get stage info for an artefact type
 */
export function getStageForType(typeId) {
  const type = PDS_ARTEFACT_TYPES[typeId];
  return type ? PDS_STAGE_INFO[type.stage] : null;
}

/**
 * Calculate risk exposure from probability and impact
 */
export function calculateRiskExposure(probability, impact) {
  const probValues = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 };
  const impactValues = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 };

  const score = (probValues[probability] || 3) * (impactValues[impact] || 3);

  if (score <= 4) return 'low';
  if (score <= 9) return 'moderate';
  if (score <= 16) return 'high';
  return 'critical';
}

/**
 * Get stakeholder engagement strategy from influence and interest
 */
export function getEngagementStrategy(influence, interest) {
  if (influence === 'high' && interest === 'high') return 'manage_closely';
  if (influence === 'high' && interest !== 'high') return 'keep_satisfied';
  if (influence !== 'high' && interest === 'high') return 'keep_informed';
  return 'monitor';
}

/**
 * Validate SRS decision readiness for project creation
 */
export function validateSRSReadiness(decision) {
  if (!decision) {
    return { valid: false, reason: 'No SRS decision linked' };
  }

  if (decision.status !== 'decided') {
    return { valid: false, reason: 'Decision must be in "decided" status' };
  }

  const readinessScore = decision.custom_fields?.readiness_score || 0;
  if (readinessScore < 70) {
    return { valid: false, reason: `Readiness score (${readinessScore}%) must be at least 70%` };
  }

  const alternativesCount = decision.custom_fields?.alternatives?.length || 0;
  if (alternativesCount < 3) {
    return { valid: false, reason: `At least 3 alternatives required (found ${alternativesCount})` };
  }

  return { valid: true };
}

/**
 * Get default values for an artefact type
 */
export function getDefaultValues(typeId) {
  const type = PDS_ARTEFACT_TYPES[typeId];
  if (!type) return {};

  const defaults = {};
  Object.entries(type.fields).forEach(([key, field]) => {
    if (field.default !== undefined) {
      defaults[key] = field.default;
    }
  });

  return defaults;
}

// ============ ADDITIONAL EXPORTS FOR PDSContext ============

/**
 * All PDS artefact type IDs as an array
 */
export const PDS_ALL_TYPES = Object.keys(PDS_ARTEFACT_TYPES);

/**
 * Alias for PDS_ARTEFACT_TYPES for backwards compatibility
 */
export const PDS_TYPE_DEFS = PDS_ARTEFACT_TYPES;

/**
 * Generic status values used across PDS types
 */
export const PDS_STATUS_VALUES = {
  draft: { label: 'Draft', color: '#94a3b8' },
  pending: { label: 'Pending', color: '#f59e0b' },
  in_progress: { label: 'In Progress', color: '#3b82f6' },
  in_review: { label: 'In Review', color: '#8b5cf6' },
  approved: { label: 'Approved', color: '#10b981' },
  completed: { label: 'Completed', color: '#10b981' },
  rejected: { label: 'Rejected', color: '#ef4444' },
  on_hold: { label: 'On Hold', color: '#6b7280' },
};

/**
 * Risk probability levels
 */
export const PDS_RISK_PROBABILITY = {
  very_low: { label: 'Very Low', value: 1, color: '#22c55e' },
  low: { label: 'Low', value: 2, color: '#84cc16' },
  medium: { label: 'Medium', value: 3, color: '#f59e0b' },
  high: { label: 'High', value: 4, color: '#f97316' },
  very_high: { label: 'Very High', value: 5, color: '#ef4444' },
};

/**
 * Risk impact levels
 */
export const PDS_RISK_IMPACT = {
  negligible: { label: 'Negligible', value: 1, color: '#22c55e' },
  minor: { label: 'Minor', value: 2, color: '#84cc16' },
  moderate: { label: 'Moderate', value: 3, color: '#f59e0b' },
  major: { label: 'Major', value: 4, color: '#f97316' },
  severe: { label: 'Severe', value: 5, color: '#ef4444' },
};

/**
 * Stakeholder influence levels
 */
export const PDS_STAKEHOLDER_INFLUENCE = {
  low: { label: 'Low', value: 1 },
  medium: { label: 'Medium', value: 2 },
  high: { label: 'High', value: 3 },
};

/**
 * Stakeholder interest levels
 */
export const PDS_STAKEHOLDER_INTEREST = {
  low: { label: 'Low', value: 1 },
  medium: { label: 'Medium', value: 2 },
  high: { label: 'High', value: 3 },
};

/**
 * Change request priority levels
 */
export const PDS_CHANGE_PRIORITY = {
  low: { label: 'Low', color: '#22c55e' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#f97316' },
  critical: { label: 'Critical', color: '#ef4444' },
};

/**
 * Confidence levels for assumptions
 */
export const PDS_CONFIDENCE_LEVELS = {
  known: { label: 'Known', color: '#10b981', value: 5 },
  likely: { label: 'Likely', color: '#22c55e', value: 4 },
  assumption: { label: 'Assumption', color: '#f59e0b', value: 3 },
  guess: { label: 'Guess', color: '#f97316', value: 2 },
  unknown: { label: 'Unknown', color: '#94a3b8', value: 1 },
};

/**
 * Get type definition by ID
 * @param {string} typeId - The type ID (e.g., 'pds_risk')
 * @returns {object|null} Type definition or null
 */
export function getTypeDefinition(typeId) {
  return PDS_ARTEFACT_TYPES[typeId] || null;
}

/**
 * Check if a type ID is a PDS type
 * @param {string} typeId - The type ID to check
 * @returns {boolean}
 */
export function isPDSType(typeId) {
  return typeId && typeId.startsWith('pds_');
}

/**
 * Get the color for a type
 * @param {string} typeId - The type ID
 * @returns {string} Hex color code
 */
export function getTypeColor(typeId) {
  const type = PDS_ARTEFACT_TYPES[typeId];
  if (type) return type.color || '#64748b';

  // Fallback colors by stage
  const stage = getStageForType(typeId);
  const stageColors = {
    intent: '#8b5cf6',
    structure: '#3b82f6',
    uncertainty: '#f59e0b',
    control: '#10b981',
    learning: '#06b6d4',
  };
  return stageColors[stage] || '#64748b';
}

/**
 * Calculate overall project health from artefacts
 * @param {object[]} artefacts - Array of project artefacts
 * @returns {string} Health status: 'green', 'amber', 'red'
 */
export function calculateProjectHealth(artefacts) {
  if (!artefacts || artefacts.length === 0) return 'amber';

  const risks = artefacts.filter(a => a.artefact_type === 'pds_risk');
  const issues = artefacts.filter(a => a.artefact_type === 'pds_issue');

  // Check for high-exposure risks or critical issues
  const highRisks = risks.filter(r => {
    const exposure = calculateRiskExposure(
      r.custom_fields?.probability,
      r.custom_fields?.impact
    );
    return exposure === 'critical' || exposure === 'very_high';
  });

  const criticalIssues = issues.filter(i =>
    i.custom_fields?.urgency === 'critical' ||
    i.custom_fields?.impact === 'major' ||
    i.custom_fields?.impact === 'severe'
  );

  if (highRisks.length > 2 || criticalIssues.length > 0) return 'red';
  if (highRisks.length > 0 || risks.length > 5) return 'amber';
  return 'green';
}
