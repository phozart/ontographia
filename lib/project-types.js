/**
 * Project Studio Type Definitions
 *
 * Defines the Project lifecycle stages, data models, and integrated Change Management.
 * Following the specification in program/projects/STUDIO-PDS.md
 *
 * @module lib/project-types
 */

// =============================================================================
// PROJECT STAGES (Lifecycle)
// =============================================================================

export const PROJECT_STAGES = {
  INITIATION: 'initiation',
  PLANNING: 'planning',
  EXECUTION: 'execution',
  CLOSING: 'closing',
  CLOSED: 'closed',
};

export const PROJECT_STAGE_INFO = {
  [PROJECT_STAGES.INITIATION]: {
    id: 'initiation',
    name: 'Initiation',
    shortName: 'Init',
    description: 'Define project charter, objectives, and stakeholders',
    order: 1,
    keyActivities: [
      'Define project objectives and success criteria',
      'Identify stakeholders and sponsor',
      'Create project charter',
      'Establish governance structure',
    ],
    color: '#6366f1', // indigo
    icon: 'PlayCircle',
  },
  [PROJECT_STAGES.PLANNING]: {
    id: 'planning',
    name: 'Planning',
    shortName: 'Plan',
    description: 'Create WBS, schedule, resource plan, and baselines',
    order: 2,
    keyActivities: [
      'Develop work breakdown structure',
      'Create schedule and milestones',
      'Plan resources and budget',
      'Identify risks and mitigation strategies',
      'Establish change management approach',
    ],
    color: '#3b82f6', // blue
    icon: 'Assignment',
  },
  [PROJECT_STAGES.EXECUTION]: {
    id: 'execution',
    name: 'Execution',
    shortName: 'Exec',
    description: 'Deliver work packages and manage progress',
    order: 3,
    keyActivities: [
      'Execute work packages',
      'Track progress against baselines',
      'Manage stakeholder communications',
      'Address issues and risks',
      'Process change requests',
    ],
    color: '#22c55e', // green
    icon: 'RocketLaunch',
  },
  [PROJECT_STAGES.CLOSING]: {
    id: 'closing',
    name: 'Closing',
    shortName: 'Close',
    description: 'Complete handover and capture lessons learned',
    order: 4,
    keyActivities: [
      'Complete deliverable acceptance',
      'Conduct lessons learned',
      'Handover to operations',
      'Establish benefits baseline',
      'Archive project documentation',
    ],
    color: '#8b5cf6', // violet
    icon: 'CheckCircle',
  },
  [PROJECT_STAGES.CLOSED]: {
    id: 'closed',
    name: 'Closed',
    shortName: 'Done',
    description: 'Project complete and archived',
    order: 5,
    keyActivities: [
      'Benefits tracking active in Enterprise Studio',
      'Documentation archived',
      'Resources released',
    ],
    color: '#64748b', // slate
    icon: 'Archive',
  },
};

// =============================================================================
// PROJECT HEALTH & STATUS
// =============================================================================

export const PROJECT_HEALTH = {
  GREEN: 'green',
  AMBER: 'amber',
  RED: 'red',
};

export const PROJECT_HEALTH_INFO = {
  [PROJECT_HEALTH.GREEN]: {
    id: 'green',
    name: 'On Track',
    description: 'Project is progressing as planned',
    color: '#22c55e',
    icon: 'CheckCircle',
  },
  [PROJECT_HEALTH.AMBER]: {
    id: 'amber',
    name: 'At Risk',
    description: 'Some concerns that need attention',
    color: '#f59e0b',
    icon: 'Warning',
  },
  [PROJECT_HEALTH.RED]: {
    id: 'red',
    name: 'Off Track',
    description: 'Significant issues requiring escalation',
    color: '#ef4444',
    icon: 'Error',
  },
};

export const PROJECT_APPROACH = {
  WATERFALL: 'waterfall',
  AGILE: 'agile',
  HYBRID: 'hybrid',
};

export const REPORTING_FREQUENCY = {
  WEEKLY: 'weekly',
  FORTNIGHTLY: 'fortnightly',
  MONTHLY: 'monthly',
};

// =============================================================================
// RAID TYPES
// =============================================================================

export const RISK_STATUS = {
  OPEN: 'open',
  MITIGATED: 'mitigated',
  OCCURRED: 'occurred',
  CLOSED: 'closed',
};

export const RISK_PROBABILITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const RISK_IMPACT = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const ISSUE_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated',
};

export const ISSUE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const DEPENDENCY_TYPE = {
  FINISH_TO_START: 'finish_to_start',
  START_TO_START: 'start_to_start',
  FINISH_TO_FINISH: 'finish_to_finish',
  START_TO_FINISH: 'start_to_finish',
};

export const DEPENDENCY_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  BLOCKED: 'blocked',
};

// =============================================================================
// CHANGE MANAGEMENT TYPES
// =============================================================================

export const CHANGE_SCOPE = {
  ORGANISATION: 'organisation',
  DEPARTMENT: 'department',
  TEAM: 'team',
  INDIVIDUAL: 'individual',
};

export const CHANGE_MAGNITUDE = {
  TRANSFORMATIONAL: 'transformational',
  SIGNIFICANT: 'significant',
  INCREMENTAL: 'incremental',
};

export const READINESS_LEVEL = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const IMPACT_LEVEL = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const COMMUNICATION_STATUS = {
  PLANNED: 'planned',
  SENT: 'sent',
  CANCELLED: 'cancelled',
};

export const GO_LIVE_RECOMMENDATION = {
  GO: 'go',
  NO_GO: 'no_go',
  CONDITIONAL: 'conditional',
};

// =============================================================================
// ARTEFACT TYPE DEFINITIONS
// =============================================================================

export const PROJECT_ARTEFACT_TYPES = {
  // -------------------------------------------------------------------------
  // Core Project Artefact
  // -------------------------------------------------------------------------
  project: {
    id: 'project',
    name: 'Project',
    description: 'Container for all delivery work',
    idPrefix: 'PRJ',
    icon: 'Folder',
    color: '#6366f1',
    fields: {
      name: { type: 'string', required: true, label: 'Project Name' },
      status: {
        type: 'enum',
        options: Object.values(PROJECT_STAGES),
        default: PROJECT_STAGES.INITIATION,
        label: 'Status',
      },
      // Links
      initiative_id: { type: 'reference', refType: 'initiative', label: 'Initiative', hint: 'Upstream Blueprint initiative' },
      analysis_project_ids: { type: 'array', itemType: 'reference', refType: 'analysis_project', label: 'Analysis Projects' },
      // Definition
      objective: { type: 'text', label: 'Objective' },
      in_scope: { type: 'array', itemType: 'string', label: 'In Scope' },
      out_scope: { type: 'array', itemType: 'string', label: 'Out of Scope' },
      assumptions: { type: 'array', itemType: 'string', label: 'Assumptions' },
      constraints: { type: 'array', itemType: 'string', label: 'Constraints' },
      success_criteria: { type: 'array', itemType: 'string', label: 'Success Criteria' },
      business_case_summary: { type: 'text', label: 'Business Case Summary' },
      // Planning
      approach: { type: 'enum', options: Object.values(PROJECT_APPROACH), default: PROJECT_APPROACH.HYBRID, label: 'Approach' },
      start_date: { type: 'date', label: 'Start Date' },
      end_date: { type: 'date', label: 'End Date' },
      baseline_end: { type: 'date', label: 'Baseline End Date' },
      budget_allocated: { type: 'number', label: 'Budget Allocated' },
      budget_spent: { type: 'number', label: 'Budget Spent' },
      budget_forecast: { type: 'number', label: 'Budget Forecast' },
      // Execution
      current_phase: { type: 'string', label: 'Current Phase' },
      percent_complete: { type: 'number', min: 0, max: 100, default: 0, label: 'Percent Complete' },
      health: { type: 'enum', options: Object.values(PROJECT_HEALTH), default: PROJECT_HEALTH.GREEN, label: 'Health' },
      status_summary: { type: 'text', label: 'Status Summary' },
      last_status_date: { type: 'date', label: 'Last Status Date' },
      // Governance
      sponsor: { type: 'string', label: 'Sponsor' },
      project_manager: { type: 'string', label: 'Project Manager' },
      steering_committee: { type: 'array', itemType: 'string', label: 'Steering Committee' },
      reporting_frequency: { type: 'enum', options: Object.values(REPORTING_FREQUENCY), default: REPORTING_FREQUENCY.WEEKLY, label: 'Reporting Frequency' },
    },
  },

  // -------------------------------------------------------------------------
  // Planning Artefacts
  // -------------------------------------------------------------------------
  phase: {
    id: 'phase',
    name: 'Phase',
    description: 'Major phase of project delivery',
    idPrefix: 'PH',
    stage: PROJECT_STAGES.PLANNING,
    icon: 'Segment',
    color: '#3b82f6',
    fields: {
      name: { type: 'string', required: true, label: 'Phase Name' },
      description: { type: 'text', label: 'Description' },
      order: { type: 'number', label: 'Order' },
      start_date: { type: 'date', label: 'Start Date' },
      end_date: { type: 'date', label: 'End Date' },
      status: { type: 'enum', options: ['not_started', 'in_progress', 'completed'], default: 'not_started', label: 'Status' },
    },
  },

  milestone: {
    id: 'milestone',
    name: 'Milestone',
    description: 'Key checkpoint marking significant progress',
    idPrefix: 'MS',
    stage: PROJECT_STAGES.PLANNING,
    icon: 'Flag',
    color: '#f59e0b',
    fields: {
      name: { type: 'string', required: true, label: 'Milestone Name' },
      description: { type: 'text', label: 'Description' },
      planned_date: { type: 'date', required: true, label: 'Planned Date' },
      actual_date: { type: 'date', label: 'Actual Date' },
      status: { type: 'enum', options: ['upcoming', 'at_risk', 'achieved', 'missed'], default: 'upcoming', label: 'Status' },
      is_governance_gate: { type: 'boolean', default: false, label: 'Governance Gate' },
    },
  },

  wbs_item: {
    id: 'wbs_item',
    name: 'WBS Item',
    description: 'Work breakdown structure element',
    idPrefix: 'WBS',
    stage: PROJECT_STAGES.PLANNING,
    icon: 'AccountTree',
    color: '#3b82f6',
    fields: {
      name: { type: 'string', required: true, label: 'Name' },
      description: { type: 'text', label: 'Description' },
      parent_id: { type: 'reference', refType: 'wbs_item', label: 'Parent Item' },
      level: { type: 'number', default: 1, label: 'Level' },
      wbs_code: { type: 'string', label: 'WBS Code', hint: 'e.g., 1.2.3' },
      owner: { type: 'string', label: 'Owner' },
      planned_start: { type: 'date', label: 'Planned Start' },
      planned_end: { type: 'date', label: 'Planned End' },
      actual_start: { type: 'date', label: 'Actual Start' },
      actual_end: { type: 'date', label: 'Actual End' },
      progress: { type: 'number', min: 0, max: 100, default: 0, label: 'Progress %' },
      status: { type: 'enum', options: ['not_started', 'in_progress', 'completed', 'cancelled'], default: 'not_started', label: 'Status' },
    },
  },

  resource: {
    id: 'resource',
    name: 'Resource',
    description: 'Project resource allocation',
    idPrefix: 'RES',
    stage: PROJECT_STAGES.PLANNING,
    icon: 'Person',
    color: '#8b5cf6',
    fields: {
      name: { type: 'string', required: true, label: 'Resource Name' },
      role: { type: 'string', label: 'Role' },
      type: { type: 'enum', options: ['internal', 'external', 'contractor'], label: 'Type' },
      allocation_percent: { type: 'number', min: 0, max: 100, label: 'Allocation %' },
      start_date: { type: 'date', label: 'Start Date' },
      end_date: { type: 'date', label: 'End Date' },
      cost_rate: { type: 'number', label: 'Cost Rate' },
    },
  },

  // -------------------------------------------------------------------------
  // RAID Artefacts
  // -------------------------------------------------------------------------
  risk: {
    id: 'risk',
    name: 'Risk',
    description: 'Potential event that could affect project',
    idPrefix: 'RISK',
    stage: PROJECT_STAGES.EXECUTION,
    icon: 'Warning',
    color: '#ef4444',
    fields: {
      description: { type: 'text', required: true, label: 'Description' },
      category: { type: 'string', label: 'Category' },
      probability: { type: 'enum', options: Object.values(RISK_PROBABILITY), default: RISK_PROBABILITY.MEDIUM, label: 'Probability' },
      impact: { type: 'enum', options: Object.values(RISK_IMPACT), default: RISK_IMPACT.MEDIUM, label: 'Impact' },
      score: { type: 'number', label: 'Score', hint: 'Probability × Impact' },
      mitigation: { type: 'text', label: 'Mitigation' },
      contingency: { type: 'text', label: 'Contingency' },
      owner: { type: 'string', label: 'Owner' },
      review_date: { type: 'date', label: 'Review Date' },
      triggers: { type: 'array', itemType: 'string', label: 'Triggers' },
      status: { type: 'enum', options: Object.values(RISK_STATUS), default: RISK_STATUS.OPEN, label: 'Status' },
    },
  },

  assumption: {
    id: 'assumption',
    name: 'Assumption',
    description: 'Belief taken as true without proof',
    idPrefix: 'ASMP',
    stage: PROJECT_STAGES.EXECUTION,
    icon: 'Psychology',
    color: '#f59e0b',
    fields: {
      statement: { type: 'text', required: true, label: 'Statement' },
      basis: { type: 'text', label: 'Basis' },
      validation_method: { type: 'text', label: 'Validation Method' },
      owner: { type: 'string', label: 'Owner' },
      check_date: { type: 'date', label: 'Check By Date' },
      status: { type: 'enum', options: ['unvalidated', 'validated', 'invalidated'], default: 'unvalidated', label: 'Status' },
    },
  },

  issue: {
    id: 'issue',
    name: 'Issue',
    description: 'Current problem requiring resolution',
    idPrefix: 'ISS',
    stage: PROJECT_STAGES.EXECUTION,
    icon: 'Error',
    color: '#ef4444',
    fields: {
      description: { type: 'text', required: true, label: 'Description' },
      impact: { type: 'text', label: 'Impact' },
      resolution: { type: 'text', label: 'Resolution' },
      owner: { type: 'string', label: 'Owner' },
      raised_date: { type: 'date', label: 'Raised Date' },
      target_date: { type: 'date', label: 'Target Resolution Date' },
      resolved_date: { type: 'date', label: 'Resolved Date' },
      priority: { type: 'enum', options: Object.values(ISSUE_PRIORITY), default: ISSUE_PRIORITY.MEDIUM, label: 'Priority' },
      status: { type: 'enum', options: Object.values(ISSUE_STATUS), default: ISSUE_STATUS.OPEN, label: 'Status' },
    },
  },

  dependency: {
    id: 'dependency',
    name: 'Dependency',
    description: 'Relationship constraint between work items',
    idPrefix: 'DEP',
    stage: PROJECT_STAGES.EXECUTION,
    icon: 'Link',
    color: '#64748b',
    fields: {
      description: { type: 'text', required: true, label: 'Description' },
      type: { type: 'enum', options: Object.values(DEPENDENCY_TYPE), default: DEPENDENCY_TYPE.FINISH_TO_START, label: 'Type' },
      from_item: { type: 'string', label: 'From Item' },
      to_item: { type: 'string', label: 'To Item' },
      external: { type: 'boolean', default: false, label: 'External Dependency' },
      owner: { type: 'string', label: 'Owner' },
      status: { type: 'enum', options: Object.values(DEPENDENCY_STATUS), default: DEPENDENCY_STATUS.ACTIVE, label: 'Status' },
    },
  },

  decision: {
    id: 'decision',
    name: 'Decision',
    description: 'Significant choice made during project',
    idPrefix: 'DEC',
    stage: PROJECT_STAGES.EXECUTION,
    icon: 'Gavel',
    color: '#6366f1',
    fields: {
      title: { type: 'string', required: true, label: 'Title' },
      context: { type: 'text', label: 'Context' },
      options_considered: { type: 'array', itemType: 'string', label: 'Options Considered' },
      chosen_option: { type: 'string', label: 'Chosen Option' },
      rationale: { type: 'text', label: 'Rationale' },
      decided_by: { type: 'string', label: 'Decided By' },
      decision_date: { type: 'date', label: 'Decision Date' },
      impact: { type: 'text', label: 'Impact' },
    },
  },

  // -------------------------------------------------------------------------
  // Change Management Artefacts
  // -------------------------------------------------------------------------
  impact_assessment: {
    id: 'impact_assessment',
    name: 'Impact Assessment',
    description: 'What changes for whom',
    idPrefix: 'IMP',
    stage: PROJECT_STAGES.EXECUTION,
    icon: 'Assessment',
    color: '#8b5cf6',
    fields: {
      scope: { type: 'enum', options: Object.values(CHANGE_SCOPE), label: 'Scope' },
      change_magnitude: { type: 'enum', options: Object.values(CHANGE_MAGNITUDE), label: 'Change Magnitude' },
      change_readiness: { type: 'enum', options: Object.values(READINESS_LEVEL), label: 'Change Readiness' },
      impacts: { type: 'array', itemType: 'object', label: 'Impacts', hint: 'Area, current state, future state, level, affected groups, mitigation' },
    },
  },

  stakeholder_engagement: {
    id: 'stakeholder_engagement',
    name: 'Stakeholder Engagement',
    description: 'Stakeholder engagement plan item',
    idPrefix: 'STK',
    stage: PROJECT_STAGES.EXECUTION,
    icon: 'People',
    color: '#3b82f6',
    fields: {
      stakeholder_name: { type: 'string', required: true, label: 'Stakeholder Name' },
      role: { type: 'string', label: 'Role' },
      influence: { type: 'enum', options: Object.values(IMPACT_LEVEL), label: 'Influence' },
      interest: { type: 'enum', options: Object.values(IMPACT_LEVEL), label: 'Interest' },
      engagement_strategy: { type: 'text', label: 'Engagement Strategy' },
      current_support: { type: 'enum', options: ['resistant', 'neutral', 'supportive', 'champion'], label: 'Current Support' },
      target_support: { type: 'enum', options: ['neutral', 'supportive', 'champion'], label: 'Target Support' },
    },
  },

  communication: {
    id: 'communication',
    name: 'Communication',
    description: 'Planned communication activity',
    idPrefix: 'COMM',
    stage: PROJECT_STAGES.EXECUTION,
    icon: 'Email',
    color: '#22c55e',
    fields: {
      audience: { type: 'string', required: true, label: 'Audience' },
      message: { type: 'text', required: true, label: 'Message' },
      channel: { type: 'string', label: 'Channel' },
      frequency: { type: 'string', label: 'Frequency' },
      owner: { type: 'string', label: 'Owner' },
      scheduled_date: { type: 'date', label: 'Scheduled Date' },
      actual_date: { type: 'date', label: 'Actual Date' },
      status: { type: 'enum', options: Object.values(COMMUNICATION_STATUS), default: COMMUNICATION_STATUS.PLANNED, label: 'Status' },
    },
  },

  training_item: {
    id: 'training_item',
    name: 'Training Item',
    description: 'Training or skill development activity',
    idPrefix: 'TRN',
    stage: PROJECT_STAGES.EXECUTION,
    icon: 'School',
    color: '#f59e0b',
    fields: {
      title: { type: 'string', required: true, label: 'Title' },
      description: { type: 'text', label: 'Description' },
      target_audience: { type: 'string', label: 'Target Audience' },
      delivery_method: { type: 'enum', options: ['in_person', 'virtual', 'self_paced', 'hybrid'], label: 'Delivery Method' },
      duration: { type: 'string', label: 'Duration' },
      scheduled_date: { type: 'date', label: 'Scheduled Date' },
      completed_date: { type: 'date', label: 'Completed Date' },
      status: { type: 'enum', options: ['planned', 'in_progress', 'completed', 'cancelled'], default: 'planned', label: 'Status' },
    },
  },

  readiness_assessment: {
    id: 'readiness_assessment',
    name: 'Readiness Assessment',
    description: 'Go-live readiness evaluation',
    idPrefix: 'RDY',
    stage: PROJECT_STAGES.CLOSING,
    icon: 'CheckCircle',
    color: '#22c55e',
    fields: {
      assessment_date: { type: 'date', required: true, label: 'Assessment Date' },
      overall_readiness: { type: 'number', min: 0, max: 100, label: 'Overall Readiness %' },
      technical_readiness: { type: 'number', min: 0, max: 100, label: 'Technical Readiness %' },
      process_readiness: { type: 'number', min: 0, max: 100, label: 'Process Readiness %' },
      people_readiness: { type: 'number', min: 0, max: 100, label: 'People Readiness %' },
      organisation_readiness: { type: 'number', min: 0, max: 100, label: 'Organisation Readiness %' },
      recommendation: { type: 'enum', options: Object.values(GO_LIVE_RECOMMENDATION), label: 'Recommendation' },
      conditions: { type: 'array', itemType: 'string', label: 'Conditions' },
    },
  },

  // -------------------------------------------------------------------------
  // Status & Closure Artefacts
  // -------------------------------------------------------------------------
  status_report: {
    id: 'status_report',
    name: 'Status Report',
    description: 'Point-in-time project status',
    idPrefix: 'RPT',
    stage: PROJECT_STAGES.EXECUTION,
    icon: 'Assessment',
    color: '#22c55e',
    fields: {
      report_date: { type: 'date', required: true, label: 'Report Date' },
      period: { type: 'string', label: 'Reporting Period' },
      overall_health: { type: 'enum', options: Object.values(PROJECT_HEALTH), label: 'Overall Health' },
      schedule_health: { type: 'enum', options: Object.values(PROJECT_HEALTH), label: 'Schedule Health' },
      budget_health: { type: 'enum', options: Object.values(PROJECT_HEALTH), label: 'Budget Health' },
      scope_health: { type: 'enum', options: Object.values(PROJECT_HEALTH), label: 'Scope Health' },
      highlights: { type: 'array', itemType: 'string', label: 'Highlights' },
      concerns: { type: 'array', itemType: 'string', label: 'Concerns' },
      next_steps: { type: 'array', itemType: 'string', label: 'Next Steps' },
      summary: { type: 'text', label: 'Summary' },
    },
  },

  lesson_learned: {
    id: 'lesson_learned',
    name: 'Lesson Learned',
    description: 'Insight captured from project experience',
    idPrefix: 'LES',
    stage: PROJECT_STAGES.CLOSING,
    icon: 'Lightbulb',
    color: '#8b5cf6',
    fields: {
      title: { type: 'string', required: true, label: 'Title' },
      context: { type: 'text', label: 'Context' },
      what_happened: { type: 'text', label: 'What Happened' },
      insight: { type: 'text', required: true, label: 'Insight' },
      recommendation: { type: 'text', label: 'Recommendation' },
      category: { type: 'enum', options: ['planning', 'execution', 'communication', 'risk', 'stakeholder', 'technical', 'process'], label: 'Category' },
    },
  },

  handover_item: {
    id: 'handover_item',
    name: 'Handover Item',
    description: 'Item to be handed over to operations',
    idPrefix: 'HND',
    stage: PROJECT_STAGES.CLOSING,
    icon: 'SwapHoriz',
    color: '#64748b',
    fields: {
      title: { type: 'string', required: true, label: 'Title' },
      description: { type: 'text', label: 'Description' },
      recipient: { type: 'string', label: 'Recipient' },
      handover_date: { type: 'date', label: 'Handover Date' },
      documentation: { type: 'text', label: 'Documentation' },
      status: { type: 'enum', options: ['pending', 'in_progress', 'completed'], default: 'pending', label: 'Status' },
    },
  },

  benefit: {
    id: 'benefit',
    name: 'Benefit',
    description: 'Expected benefit for tracking in Enterprise Studio',
    idPrefix: 'BEN',
    stage: PROJECT_STAGES.CLOSING,
    icon: 'TrendingUp',
    color: '#22c55e',
    fields: {
      name: { type: 'string', required: true, label: 'Benefit Name' },
      description: { type: 'text', label: 'Description' },
      type: { type: 'enum', options: ['financial', 'operational', 'strategic', 'compliance'], label: 'Type' },
      baseline_value: { type: 'string', label: 'Baseline Value' },
      target_value: { type: 'string', label: 'Target Value' },
      measurement_method: { type: 'text', label: 'Measurement Method' },
      owner: { type: 'string', label: 'Owner' },
      realization_date: { type: 'date', label: 'Expected Realization Date' },
    },
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get artefact types for a specific project stage
 */
export function getArtefactTypesByStage(stageId) {
  return Object.values(PROJECT_ARTEFACT_TYPES).filter(t => t.stage === stageId);
}

/**
 * Get type definition by ID
 */
export function getTypeDefinition(typeId) {
  return PROJECT_ARTEFACT_TYPES[typeId] || null;
}

/**
 * Check if a type ID is a Project type
 */
export function isProjectType(typeId) {
  return !!PROJECT_ARTEFACT_TYPES[typeId];
}

/**
 * Get the color for a type
 */
export function getTypeColor(typeId) {
  const type = PROJECT_ARTEFACT_TYPES[typeId];
  return type?.color || '#64748b';
}

/**
 * Get the icon for a type
 */
export function getTypeIcon(typeId) {
  const type = PROJECT_ARTEFACT_TYPES[typeId];
  return type?.icon || 'Description';
}

/**
 * Calculate risk score from probability and impact
 */
export function calculateRiskScore(probability, impact) {
  const probValues = { low: 1, medium: 2, high: 3 };
  const impactValues = { low: 1, medium: 2, high: 3 };
  return (probValues[probability] || 2) * (impactValues[impact] || 2);
}

/**
 * Get risk exposure level from score
 */
export function getRiskExposure(score) {
  if (score <= 2) return 'low';
  if (score <= 4) return 'medium';
  if (score <= 6) return 'high';
  return 'critical';
}

/**
 * Calculate project health from artefacts
 */
export function calculateProjectHealth(artefacts) {
  if (!artefacts || artefacts.length === 0) return PROJECT_HEALTH.AMBER;

  const risks = artefacts.filter(a => a.artefact_type === 'risk' && a.status === RISK_STATUS.OPEN);
  const issues = artefacts.filter(a => a.artefact_type === 'issue' && a.status === ISSUE_STATUS.OPEN);

  const highRisks = risks.filter(r =>
    r.custom_fields?.probability === RISK_PROBABILITY.HIGH &&
    r.custom_fields?.impact === RISK_IMPACT.HIGH
  );

  const criticalIssues = issues.filter(i =>
    i.custom_fields?.priority === ISSUE_PRIORITY.CRITICAL
  );

  if (highRisks.length > 2 || criticalIssues.length > 0) return PROJECT_HEALTH.RED;
  if (highRisks.length > 0 || risks.length > 5) return PROJECT_HEALTH.AMBER;
  return PROJECT_HEALTH.GREEN;
}

/**
 * Get stage completion percentage
 */
export function calculateStageCompletion(artefacts, stageId) {
  const stageTypes = getArtefactTypesByStage(stageId);
  const stageTypeIds = stageTypes.map(t => t.id);
  const stageArtefacts = artefacts.filter(a => stageTypeIds.includes(a.artefact_type));

  if (stageArtefacts.length === 0) return 0;

  const completed = stageArtefacts.filter(a =>
    a.status === 'completed' || a.custom_fields?.status === 'completed'
  ).length;

  return Math.round((completed / stageArtefacts.length) * 100);
}

/**
 * Get next stage in project lifecycle
 */
export function getNextStage(currentStage) {
  const stageOrder = [
    PROJECT_STAGES.INITIATION,
    PROJECT_STAGES.PLANNING,
    PROJECT_STAGES.EXECUTION,
    PROJECT_STAGES.CLOSING,
    PROJECT_STAGES.CLOSED,
  ];

  const currentIndex = stageOrder.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === stageOrder.length - 1) return null;
  return stageOrder[currentIndex + 1];
}

/**
 * Get previous stage in project lifecycle
 */
export function getPreviousStage(currentStage) {
  const stageOrder = [
    PROJECT_STAGES.INITIATION,
    PROJECT_STAGES.PLANNING,
    PROJECT_STAGES.EXECUTION,
    PROJECT_STAGES.CLOSING,
    PROJECT_STAGES.CLOSED,
  ];

  const currentIndex = stageOrder.indexOf(currentStage);
  if (currentIndex <= 0) return null;
  return stageOrder[currentIndex - 1];
}

// =============================================================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// =============================================================================

export const PROJECT_TYPE_DEFS = PROJECT_ARTEFACT_TYPES;
export const PROJECT_ALL_TYPES = Object.keys(PROJECT_ARTEFACT_TYPES);
