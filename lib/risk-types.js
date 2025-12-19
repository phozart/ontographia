/**
 * Risk and Resilience Type Definitions
 *
 * Defines artefact types, stages, and guidance for the Risk & Resilience Studio.
 *
 * @module risk-types
 */

/**
 * Risk artefact type definitions
 * @type {Object.<string, {label: string, icon: string, color: string, description: string, fields: string[]}>}
 */
export const RISK_TYPE_DEFS = {
  risk_risk: {
    label: 'Risk',
    icon: 'Warning',
    color: '#ef4444',
    description: 'A potential event or condition that could have negative impact on objectives',
    fields: ['name', 'description', 'category', 'likelihood', 'impact', 'status', 'owner'],
  },
  risk_control: {
    label: 'Control',
    icon: 'Security',
    color: '#22c55e',
    description: 'A measure that modifies risk - can be preventive, detective, or corrective',
    fields: ['name', 'description', 'type', 'effectiveness', 'status', 'owner'],
  },
  risk_scenario: {
    label: 'Scenario',
    icon: 'Timeline',
    color: '#f59e0b',
    description: 'A plausible future situation describing how risks might materialize',
    fields: ['name', 'description', 'trigger', 'likelihood', 'impact', 'timeframe'],
  },
  risk_resilience: {
    label: 'Resilience Measure',
    icon: 'Shield',
    color: '#3b82f6',
    description: 'Capability to anticipate, prepare for, respond to, and adapt to change',
    fields: ['name', 'description', 'type', 'capability', 'maturity', 'status'],
  },
  risk_assessment: {
    label: 'Assessment',
    icon: 'Assessment',
    color: '#8b5cf6',
    description: 'A formal evaluation of risks, controls, and resilience measures',
    fields: ['name', 'description', 'scope', 'methodology', 'date', 'status'],
  },
};

/**
 * Risk categories for classification
 */
export const RISK_CATEGORIES = {
  strategic: { label: 'Strategic', color: '#6366f1', description: 'Risks affecting strategic objectives' },
  operational: { label: 'Operational', color: '#f59e0b', description: 'Risks affecting operations' },
  financial: { label: 'Financial', color: '#22c55e', description: 'Risks affecting financial performance' },
  compliance: { label: 'Compliance', color: '#ef4444', description: 'Regulatory and legal risks' },
  technology: { label: 'Technology', color: '#3b82f6', description: 'IT and technology risks' },
  reputational: { label: 'Reputational', color: '#8b5cf6', description: 'Brand and reputation risks' },
  external: { label: 'External', color: '#0891b2', description: 'Market and environmental risks' },
};

/**
 * Risk likelihood levels
 */
export const RISK_LIKELIHOOD = {
  rare: { label: 'Rare', value: 1, color: '#22c55e', description: 'Unlikely to occur' },
  unlikely: { label: 'Unlikely', value: 2, color: '#84cc16', description: 'Could occur but not expected' },
  possible: { label: 'Possible', value: 3, color: '#f59e0b', description: 'Might occur' },
  likely: { label: 'Likely', value: 4, color: '#f97316', description: 'Will probably occur' },
  almost_certain: { label: 'Almost Certain', value: 5, color: '#ef4444', description: 'Expected to occur' },
};

/**
 * Risk impact levels
 */
export const RISK_IMPACT = {
  insignificant: { label: 'Insignificant', value: 1, color: '#22c55e', description: 'Minimal impact' },
  minor: { label: 'Minor', value: 2, color: '#84cc16', description: 'Some impact but manageable' },
  moderate: { label: 'Moderate', value: 3, color: '#f59e0b', description: 'Significant but contained' },
  major: { label: 'Major', value: 4, color: '#f97316', description: 'Severe impact' },
  catastrophic: { label: 'Catastrophic', value: 5, color: '#ef4444', description: 'Critical business impact' },
};

/**
 * Control types
 */
export const CONTROL_TYPES = {
  preventive: { label: 'Preventive', color: '#22c55e', description: 'Prevents risk from occurring' },
  detective: { label: 'Detective', color: '#f59e0b', description: 'Detects when risk occurs' },
  corrective: { label: 'Corrective', color: '#3b82f6', description: 'Corrects after risk occurs' },
  directive: { label: 'Directive', color: '#8b5cf6', description: 'Directs behavior to prevent risk' },
};

/**
 * Control effectiveness ratings
 */
export const CONTROL_EFFECTIVENESS = {
  not_effective: { label: 'Not Effective', value: 0, color: '#ef4444' },
  partially_effective: { label: 'Partially Effective', value: 1, color: '#f59e0b' },
  largely_effective: { label: 'Largely Effective', value: 2, color: '#84cc16' },
  fully_effective: { label: 'Fully Effective', value: 3, color: '#22c55e' },
};

/**
 * Resilience types
 */
export const RESILIENCE_TYPES = {
  anticipate: { label: 'Anticipate', color: '#6366f1', description: 'Monitor and forecast potential disruptions' },
  prepare: { label: 'Prepare', color: '#8b5cf6', description: 'Develop response capabilities' },
  respond: { label: 'Respond', color: '#f59e0b', description: 'Act when disruption occurs' },
  adapt: { label: 'Adapt', color: '#22c55e', description: 'Learn and evolve from experience' },
};

/**
 * Maturity levels for resilience measures
 */
export const RESILIENCE_MATURITY = {
  initial: { label: 'Initial', value: 1, color: '#ef4444', description: 'Ad-hoc, reactive' },
  developing: { label: 'Developing', value: 2, color: '#f59e0b', description: 'Basic processes in place' },
  defined: { label: 'Defined', value: 3, color: '#84cc16', description: 'Standardized processes' },
  managed: { label: 'Managed', value: 4, color: '#22c55e', description: 'Measured and controlled' },
  optimizing: { label: 'Optimizing', value: 5, color: '#3b82f6', description: 'Continuous improvement' },
};

/**
 * Risk and assessment stages
 */
export const RISK_STAGES = {
  identified: { label: 'Identified', color: '#9ca3af', order: 1 },
  analyzed: { label: 'Analyzed', color: '#f59e0b', order: 2 },
  treated: { label: 'Treated', color: '#22c55e', order: 3 },
  monitored: { label: 'Monitored', color: '#3b82f6', order: 4 },
  closed: { label: 'Closed', color: '#6b7280', order: 5 },
};

/**
 * Wizard steps for creating risk artefacts
 */
export const RISK_WIZARD_STEPS = ['understand', 'define', 'review'];

/**
 * Guidance content for risk artefacts
 */
export const RISK_GUIDANCE = {
  risk_risk: {
    what: 'A risk is an uncertain event or condition that, if it occurs, has a positive or negative effect on project objectives.',
    why: 'Identifying risks allows organizations to prepare for potential problems and take proactive measures to minimize their impact.',
    examples: [
      'Data breach risk - unauthorized access to sensitive information',
      'Supply chain disruption - key supplier fails to deliver',
      'Regulatory change risk - new compliance requirements',
    ],
    prompts: [
      'What event or condition are you concerned about?',
      'What would be the impact if this risk materialized?',
      'Who is best positioned to own and monitor this risk?',
    ],
  },
  risk_control: {
    what: 'A control is a measure that modifies risk. Controls can prevent, detect, or correct issues.',
    why: 'Controls reduce the likelihood or impact of risks, ensuring the organization operates within acceptable risk tolerances.',
    examples: [
      'Access controls - authentication and authorization systems',
      'Backup systems - regular data backups and recovery testing',
      'Audit trails - logging and monitoring of activities',
    ],
    prompts: [
      'What specific risk does this control address?',
      'Is this control preventive, detective, or corrective?',
      'How will you measure the effectiveness of this control?',
    ],
  },
  risk_scenario: {
    what: 'A scenario is a plausible description of how risks might combine and unfold to create significant impact.',
    why: 'Scenarios help organizations prepare for complex situations by exploring interconnected risks and cascading effects.',
    examples: [
      'Cyber attack scenario - phishing leads to ransomware deployment',
      'Market disruption - competitor innovation makes products obsolete',
      'Pandemic scenario - workforce unavailability and supply chain issues',
    ],
    prompts: [
      'What would trigger this scenario?',
      'What sequence of events would unfold?',
      'How would this scenario affect different parts of the business?',
    ],
  },
  risk_resilience: {
    what: 'Resilience is the ability to anticipate, prepare for, respond to, and adapt to incremental change and sudden disruptions.',
    why: 'Building resilience ensures the organization can survive and thrive despite disruptions and changing conditions.',
    examples: [
      'Business continuity plan - documented recovery procedures',
      'Crisis communication - pre-defined communication protocols',
      'Diversified suppliers - multiple sources for critical inputs',
    ],
    prompts: [
      'What capability does this measure provide?',
      'Does this help you anticipate, prepare, respond, or adapt?',
      'How mature is this resilience capability currently?',
    ],
  },
  risk_assessment: {
    what: 'An assessment is a systematic process of identifying, analyzing, and evaluating risks to determine appropriate responses.',
    why: 'Regular assessments ensure the organization has an accurate, current view of its risk landscape and control effectiveness.',
    examples: [
      'Annual enterprise risk assessment',
      'Project risk assessment for new initiatives',
      'Third-party risk assessment for vendors',
    ],
    prompts: [
      'What is the scope of this assessment?',
      'What methodology will be used?',
      'Who needs to be involved in the assessment?',
    ],
  },
};

/**
 * Module groupings for navigation
 */
export const RISK_GROUPS = {
  risks: {
    label: 'Risk Management',
    icon: 'Warning',
    color: '#ef4444',
    types: ['risk_risk', 'risk_control'],
  },
  scenarios: {
    label: 'Scenario Analysis',
    icon: 'Timeline',
    color: '#f59e0b',
    types: ['risk_scenario'],
  },
  resilience: {
    label: 'Resilience',
    icon: 'Shield',
    color: '#3b82f6',
    types: ['risk_resilience'],
  },
  assessments: {
    label: 'Assessments',
    icon: 'Assessment',
    color: '#8b5cf6',
    types: ['risk_assessment'],
  },
};

/**
 * Check if a type is a risk module type
 * @param {string} type - Type to check
 * @returns {boolean}
 */
export function isRiskType(type) {
  return type && typeof type === 'string' && type.startsWith('risk_');
}

/**
 * Get type definition for a risk type
 * @param {string} type - Artefact type
 * @returns {Object|null} Type definition or null if not found
 */
export function getRiskTypeDef(type) {
  return RISK_TYPE_DEFS[type] || null;
}

/**
 * Get guidance for a risk type
 * @param {string} type - Artefact type
 * @returns {Object|null} Guidance content or null if not found
 */
export function getRiskGuidance(type) {
  return RISK_GUIDANCE[type] || null;
}

/**
 * Calculate risk score from likelihood and impact
 * @param {number} likelihood - Likelihood value (1-5)
 * @param {number} impact - Impact value (1-5)
 * @returns {number} Risk score (1-25)
 */
export function calculateRiskScore(likelihood, impact) {
  return (likelihood || 1) * (impact || 1);
}

/**
 * Get risk level from score
 * @param {number} score - Risk score (1-25)
 * @returns {{label: string, color: string}}
 */
export function getRiskLevel(score) {
  if (score >= 20) return { label: 'Critical', color: '#7f1d1d' };
  if (score >= 15) return { label: 'High', color: '#ef4444' };
  if (score >= 10) return { label: 'Medium', color: '#f59e0b' };
  if (score >= 5) return { label: 'Low', color: '#84cc16' };
  return { label: 'Very Low', color: '#22c55e' };
}

/**
 * Get all risk types as array
 * @returns {string[]}
 */
export function getRiskTypes() {
  return Object.keys(RISK_TYPE_DEFS);
}

/**
 * Get category definition
 * @param {string} category - Category key
 * @returns {Object|null}
 */
export function getCategoryDef(category) {
  return RISK_CATEGORIES[category] || null;
}

/**
 * Get all categories as array of {key, ...def}
 * @returns {Array}
 */
export function getCategories() {
  return Object.entries(RISK_CATEGORIES).map(([key, def]) => ({ key, ...def }));
}

/**
 * Calculate overall risk health score
 * @param {Object} stats - Risk statistics
 * @returns {number} Health score 0-100
 */
export function calculateRiskHealth(stats) {
  if (!stats) return 0;

  const {
    totalRisks = 0,
    controlledRisks = 0,
    effectiveControls = 0,
    totalControls = 0,
    matureResilience = 0,
    totalResilience = 0,
  } = stats;

  // No risks = perfect health
  if (totalRisks === 0) return 100;

  // Weight factors
  const controlCoverage = totalRisks > 0 ? (controlledRisks / totalRisks) * 40 : 0;
  const controlEffectiveness = totalControls > 0 ? (effectiveControls / totalControls) * 35 : 0;
  const resilienceMaturity = totalResilience > 0 ? (matureResilience / totalResilience) * 25 : 0;

  return Math.round(controlCoverage + controlEffectiveness + resilienceMaturity);
}
