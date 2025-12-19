// lib/cm-types.js
// Change Management type definitions and utilities

// ============ CHANGE TYPES ============
export const CM_CHANGE_TYPES = {
  TRANSFORMATIONAL: 'transformational',
  INCREMENTAL: 'incremental',
  REGULATORY: 'regulatory',
  BEHAVIOURAL: 'behavioural',
  TECHNICAL: 'technical',
};

export const CM_CHANGE_TYPE_DEFS = {
  transformational: {
    name: 'Transformational',
    description: 'Fundamental shift in how work is done, culture, or identity',
    complexityScore: 3,
    color: '#dc2626',
  },
  incremental: {
    name: 'Incremental',
    description: 'Enhancement to existing processes or tools',
    complexityScore: 1,
    color: '#22c55e',
  },
  regulatory: {
    name: 'Regulatory/Compliance',
    description: 'Externally mandated change',
    complexityScore: 2,
    color: '#3b82f6',
  },
  behavioural: {
    name: 'Behavioural',
    description: 'Change in habits, practices, or ways of working',
    complexityScore: 2,
    color: '#f59e0b',
  },
  technical: {
    name: 'Technical',
    description: 'System or tool change with limited process impact',
    complexityScore: 1,
    color: '#8b5cf6',
  },
};

// ============ ARTEFACT TYPES ============
export const CM_ARTEFACT_TYPES = [
  'cm_context',           // Change context/initiative
  'cm_stakeholder_group', // Stakeholder group
  'cm_pct_assessment',    // PCT assessment
  'cm_impact_assessment', // Impact assessment
  'cm_risk',             // Risk/resistance factor
  'cm_adoption_signal',  // Adoption signal/metric
];

export const CM_TYPE_DEFS = {
  cm_context: {
    name: 'Change Context',
    description: 'The overarching change initiative definition',
    color: '#3b82f6',
    fields: [
      { key: 'title', label: 'Change Title', type: 'text', required: true },
      { key: 'vision', label: 'Vision Statement', type: 'textarea', required: true },
      { key: 'change_type', label: 'Change Type', type: 'select', options: Object.keys(CM_CHANGE_TYPES), required: true },
      { key: 'rationale', label: 'Rationale', type: 'textarea' },
      { key: 'sponsor', label: 'Executive Sponsor', type: 'text' },
      { key: 'timeline_start', label: 'Timeline Start', type: 'date' },
      { key: 'timeline_end', label: 'Timeline End', type: 'date' },
      { key: 'success_criteria', label: 'Success Criteria', type: 'array' },
    ],
  },
  cm_stakeholder_group: {
    name: 'Stakeholder Group',
    description: 'A group of stakeholders impacted by the change',
    color: '#10b981',
    fields: [
      { key: 'name', label: 'Group Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'size', label: 'Estimated Size', type: 'number' },
      { key: 'impact_level', label: 'Impact Level', type: 'select', options: ['high', 'medium', 'low'] },
      { key: 'influence_level', label: 'Influence Level', type: 'select', options: ['high', 'medium', 'low'] },
      { key: 'current_state', label: 'Current State', type: 'textarea' },
      { key: 'desired_state', label: 'Desired State', type: 'textarea' },
      { key: 'representative', label: 'Key Representative', type: 'text' },
    ],
  },
  cm_pct_assessment: {
    name: 'PCT Assessment',
    description: 'Purpose, Capacity, Trust assessment for a stakeholder group',
    color: '#f59e0b',
    fields: [
      { key: 'stakeholder_group_id', label: 'Stakeholder Group', type: 'reference', required: true },
      { key: 'purpose_score', label: 'Purpose Score', type: 'number', min: 1, max: 5 },
      { key: 'purpose_notes', label: 'Purpose Notes', type: 'textarea' },
      { key: 'capacity_score', label: 'Capacity Score', type: 'number', min: 1, max: 5 },
      { key: 'capacity_notes', label: 'Capacity Notes', type: 'textarea' },
      { key: 'trust_score', label: 'Trust Score', type: 'number', min: 1, max: 5 },
      { key: 'trust_notes', label: 'Trust Notes', type: 'textarea' },
      { key: 'assessed_date', label: 'Assessment Date', type: 'date' },
      { key: 'assessor', label: 'Assessor', type: 'text' },
    ],
  },
  cm_impact_assessment: {
    name: 'Impact Assessment',
    description: 'Assessment of change impact by category',
    color: '#ef4444',
    fields: [
      { key: 'stakeholder_group_id', label: 'Stakeholder Group', type: 'reference' },
      { key: 'category', label: 'Impact Category', type: 'select', options: ['process', 'technology', 'skills', 'structure', 'culture'], required: true },
      { key: 'impact_level', label: 'Impact Level', type: 'select', options: ['high', 'medium', 'low'], required: true },
      { key: 'description', label: 'Impact Description', type: 'textarea' },
      { key: 'mitigation', label: 'Mitigation Strategy', type: 'textarea' },
    ],
  },
  cm_risk: {
    name: 'Change Risk',
    description: 'Risk or resistance factor for the change',
    color: '#dc2626',
    fields: [
      { key: 'title', label: 'Risk Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'category', label: 'Category', type: 'select', options: ['resistance', 'resource', 'timeline', 'technical', 'organizational'] },
      { key: 'probability', label: 'Probability', type: 'select', options: ['high', 'medium', 'low'] },
      { key: 'impact', label: 'Impact', type: 'select', options: ['high', 'medium', 'low'] },
      { key: 'mitigation_strategy', label: 'Mitigation Strategy', type: 'textarea' },
      { key: 'owner', label: 'Risk Owner', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['identified', 'mitigating', 'resolved', 'accepted'] },
    ],
  },
  cm_adoption_signal: {
    name: 'Adoption Signal',
    description: 'Metric or indicator to track change adoption',
    color: '#22c55e',
    fields: [
      { key: 'name', label: 'Signal Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'metric_type', label: 'Metric Type', type: 'select', options: ['leading', 'lagging'] },
      { key: 'measurement_method', label: 'Measurement Method', type: 'textarea' },
      { key: 'target_value', label: 'Target Value', type: 'text' },
      { key: 'current_value', label: 'Current Value', type: 'text' },
      { key: 'frequency', label: 'Measurement Frequency', type: 'select', options: ['daily', 'weekly', 'monthly', 'quarterly'] },
    ],
  },
};

// ============ UTILITIES ============
export function isCMType(type) {
  return type && type.startsWith('cm_');
}

export function getCMTypeDef(type) {
  return CM_TYPE_DEFS[type] || null;
}

// ============ STATUS VALUES ============
export const CM_CONTEXT_STATUS = {
  DRAFT: 'draft',
  PLANNING: 'planning',
  EXECUTING: 'executing',
  STABILIZING: 'stabilizing',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
};

export const CM_ASSESSMENT_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  NEEDS_REVIEW: 'needs_review',
};

export const CM_RISK_STATUS = {
  IDENTIFIED: 'identified',
  MITIGATING: 'mitigating',
  RESOLVED: 'resolved',
  ACCEPTED: 'accepted',
};

// Map CM status to valid artefact status
export function mapCMStatusToArtefactStatus(cmStatus) {
  const mapping = {
    'draft': 'Draft',
    'planning': 'Draft',
    'executing': 'InReview',
    'stabilizing': 'InReview',
    'completed': 'Approved',
    'on_hold': 'Draft',
    'not_started': 'Draft',
    'in_progress': 'InReview',
    'needs_review': 'InReview',
    'identified': 'Draft',
    'mitigating': 'InReview',
    'resolved': 'Approved',
    'accepted': 'Approved',
  };
  return mapping[cmStatus] || 'Draft';
}
