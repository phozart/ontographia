// lib/blueprint-types.js
// Blueprint Studio type definitions - Initiative stages, scoring, and governance

// ============================================================================
// INITIATIVE STAGES
// ============================================================================

export const BPS_STAGES = ['idea', 'explore', 'assess', 'case', 'approval', 'approved', 'declined'];

export const BPS_STAGE_INFO = {
  idea: {
    id: 'idea',
    name: 'Idea',
    description: 'Capture the spark - quick idea documentation',
    icon: 'Lightbulb',
    color: '#C9A227', // warm amber/gold
    order: 1,
  },
  explore: {
    id: 'explore',
    name: 'Explore',
    description: 'Understand the opportunity - market research and validation',
    icon: 'Explore',
    color: '#5B8A6A', // sage green
    order: 2,
  },
  assess: {
    id: 'assess',
    name: 'Assess',
    description: 'Evaluate fit and viability - scoring and analysis',
    icon: 'Assessment',
    color: '#6366f1', // indigo - evaluation phase
    order: 3,
  },
  case: {
    id: 'case',
    name: 'Case',
    description: 'Build the justification - full business case',
    icon: 'Description',
    color: '#0284c7', // sky blue - business/formal
    order: 4,
  },
  approval: {
    id: 'approval',
    name: 'Approval',
    description: 'Ready for gate review - pending decision',
    icon: 'Gavel',
    color: '#059669', // emerald - decision gate
    order: 5,
  },
  approved: {
    id: 'approved',
    name: 'Approved',
    description: 'Ready for investment - approved for delivery',
    icon: 'CheckCircle',
    color: '#059669', // emerald - success
    order: 6,
  },
  declined: {
    id: 'declined',
    name: 'Declined',
    description: 'Not proceeding - declined or killed',
    icon: 'Cancel',
    color: '#A54D4D', // muted red
    order: 7,
  },
};

// ============================================================================
// HORIZON CLASSIFICATION
// ============================================================================

export const BPS_HORIZONS = {
  h1: {
    id: 'h1',
    name: 'H1 - Core',
    description: 'Existing market, existing capability',
    portfolioTarget: 70,
    riskTolerance: 'low',
  },
  h2: {
    id: 'h2',
    name: 'H2 - Adjacent',
    description: 'New market OR new capability',
    portfolioTarget: 20,
    riskTolerance: 'medium',
  },
  h3: {
    id: 'h3',
    name: 'H3 - Transform',
    description: 'New market AND new capability',
    portfolioTarget: 10,
    riskTolerance: 'high',
  },
};

// ============================================================================
// SCORING CRITERIA
// ============================================================================

export const BPS_SCORING_CRITERIA = {
  strategic_fit: {
    id: 'strategic_fit',
    name: 'Strategic Fit',
    description: 'Alignment with company strategy and goals',
    weight: 0.25,
    maxScore: 5,
  },
  market_potential: {
    id: 'market_potential',
    name: 'Market Potential',
    description: 'Size and growth of the addressable market',
    weight: 0.25,
    maxScore: 5,
  },
  feasibility: {
    id: 'feasibility',
    name: 'Feasibility',
    description: 'Technical and operational ability to deliver',
    weight: 0.20,
    maxScore: 5,
  },
  competitive_position: {
    id: 'competitive_position',
    name: 'Competitive Position',
    description: 'Ability to compete and differentiate',
    weight: 0.15,
    maxScore: 5,
  },
  risk_level: {
    id: 'risk_level',
    name: 'Risk Level',
    description: 'Level of risk (inverted - lower risk = higher score)',
    weight: 0.15,
    maxScore: 5,
  },
};

// ============================================================================
// RECOMMENDATION OPTIONS
// ============================================================================

export const BPS_RECOMMENDATIONS = {
  proceed: {
    id: 'proceed',
    name: 'Proceed',
    description: 'Move to next stage',
    color: '#5B8A6A',
  },
  pivot: {
    id: 'pivot',
    name: 'Pivot',
    description: 'Adjust approach and continue',
    color: '#C9A227',
  },
  stop: {
    id: 'stop',
    name: 'Stop',
    description: 'Do not proceed',
    color: '#A54D4D',
  },
  more_info: {
    id: 'more_info',
    name: 'More Info',
    description: 'Gather more information before deciding',
    color: '#47453F',
  },
};

// ============================================================================
// GATE DECISION TYPES
// ============================================================================

export const BPS_GATE_DECISIONS = {
  approved: {
    id: 'approved',
    name: 'Go',
    description: 'Advance to next stage',
    color: '#5B8A6A',
  },
  conditional_go: {
    id: 'conditional_go',
    name: 'Conditional Go',
    description: 'Advance but must meet conditions before next gate',
    color: '#47453F',
  },
  hold: {
    id: 'hold',
    name: 'Hold',
    description: 'Pause — revisit when conditions change',
    color: '#C9A227',
  },
  recycle: {
    id: 'recycle',
    name: 'Recycle',
    description: 'Send back to a previous stage for rework',
    color: '#8B7355',
  },
  declined: {
    id: 'declined',
    name: 'Kill',
    description: 'Terminate initiative',
    color: '#A54D4D',
  },
};

// ============================================================================
// GATE CRITERIA
// ============================================================================

/**
 * Gate criteria that must be met to advance from each stage
 * Each stage has a list of criteria descriptions
 */
export const BPS_GATE_CRITERIA = {
  idea: [
    'Problem statement is clearly defined',
    'Target customer segment identified',
    'Basic value proposition articulated',
    'Sponsor or champion identified',
  ],
  explore: [
    'Market research completed (TAM/SAM/SOM)',
    'Competitive landscape analyzed',
    'Customer validation interviews conducted (min 5)',
    'Technical feasibility assessed',
    'Initial risk assessment documented',
  ],
  assess: [
    'Strategic fit score meets threshold (≥3/5)',
    'Financial projections completed',
    'Resource requirements defined',
    'Key assumptions documented and validated',
    'Go-to-market strategy outlined',
  ],
  case: [
    'Business case document completed',
    'Investment request quantified',
    'Executive sponsor confirmed',
    'Implementation roadmap defined',
    'Success metrics and KPIs defined',
    'Risk mitigation plan in place',
  ],
  approved: [], // Terminal stage - no further gates
  declined: [], // Terminal stage - no further gates
};

// ============================================================================
// KILL CRITERIA
// ============================================================================

/**
 * Kill criteria split into must-meet (binary knockout) and should-meet (warning).
 * Based on anti-escalation research: Staw (1976), Sleesman et al. (2012), Heath (1995).
 *
 * must_meet: Auto-kill recommendation if any fail. Binary pass/fail.
 * should_meet: Warning flags. Score-based, contribute to risk assessment.
 */
export const BPS_KILL_CRITERIA = {
  must_meet: [
    {
      id: 'strategic_fit_critical',
      name: 'Strategic Alignment',
      description: 'Strategic fit score must be ≥ 2/5',
      check: (initiative) => (initiative.assess_data?.strategic_fit?.score || 0) >= 2,
      failMessage: 'Strategic fit score is below minimum threshold (< 2/5)',
    },
    {
      id: 'market_minimum',
      name: 'Minimum Market Size',
      description: 'Serviceable Obtainable Market (SOM) must be ≥ $1M',
      check: (initiative) => (initiative.explore_data?.market_sizing?.som || 0) >= 1000000,
      failMessage: 'Market too small — SOM below $1M',
    },
    {
      id: 'legal_compliance',
      name: 'Legal/Regulatory Feasibility',
      description: 'No unresolvable legal or regulatory barriers',
      check: (initiative) => initiative.explore_data?.legal_feasible !== false,
      failMessage: 'Unresolvable legal or regulatory barriers identified',
    },
  ],
  should_meet: [
    {
      id: 'sponsor_required',
      name: 'Sponsor Identified',
      description: 'Sponsor should be identified by Case stage',
      check: (initiative) => {
        if (initiative.stage !== 'case' && initiative.stage !== 'approval') return true;
        return !!initiative.sponsor_id;
      },
      severity: 'medium',
      warnMessage: 'No sponsor identified — initiatives without executive sponsorship have 3x higher failure rate',
    },
    {
      id: 'overall_score_threshold',
      name: 'Minimum Overall Score',
      description: 'Overall score should be ≥ 50%',
      check: (initiative) => (initiative.assess_data?.overall_score || 0) >= 50,
      severity: 'medium',
      warnMessage: 'Overall score below 50% — review and address scoring gaps',
    },
    {
      id: 'sla_compliance',
      name: 'SLA Compliance',
      description: 'Stage SLA should not be breached',
      check: (initiative) => initiative.governance_data?.sla_status !== 'breached',
      severity: 'low',
      warnMessage: 'Stage SLA breached — consider expediting or recycling',
    },
    {
      id: 'assumption_validation',
      name: 'Key Assumptions Tested',
      description: 'At least 3 key assumptions should be validated by Assess stage',
      check: (initiative) => {
        if (initiative.stage === 'idea' || initiative.stage === 'explore') return true;
        const tested = initiative.explore_data?.assumptions_tested || 0;
        return tested >= 3;
      },
      severity: 'medium',
      warnMessage: 'Fewer than 3 key assumptions validated — increases uncertainty',
    },
  ],
};

/**
 * Evaluate kill criteria for an initiative.
 * Returns { mustMeetFails, shouldMeetWarns, recommendation }
 *
 * @param {Object} initiative - The initiative to check
 * @returns {Object} Kill criteria evaluation result
 */
export function evaluateKillCriteria(initiative) {
  const mustMeetFails = BPS_KILL_CRITERIA.must_meet
    .filter(c => !c.check(initiative))
    .map(c => ({ id: c.id, name: c.name, message: c.failMessage }));

  const shouldMeetWarns = BPS_KILL_CRITERIA.should_meet
    .filter(c => !c.check(initiative))
    .map(c => ({ id: c.id, name: c.name, message: c.warnMessage, severity: c.severity }));

  let recommendation = 'proceed';
  if (mustMeetFails.length > 0) {
    recommendation = 'kill';
  } else if (shouldMeetWarns.filter(w => w.severity === 'medium').length >= 2) {
    recommendation = 'review';
  }

  return { mustMeetFails, shouldMeetWarns, recommendation };
}

// ============================================================================
// KILL CLASSIFICATION & POST-MORTEM
// ============================================================================

/**
 * Kill classifications for post-mortem analysis.
 * Each killed initiative should be classified to build the learning library.
 */
export const BPS_KILL_CLASSIFICATIONS = [
  { id: 'wrong_timing', name: 'Wrong Timing', description: 'Market or technology not ready yet' },
  { id: 'wrong_market', name: 'Wrong Market', description: 'Insufficient demand or market too small' },
  { id: 'wrong_approach', name: 'Wrong Approach', description: 'Solution approach was flawed' },
  { id: 'wrong_team', name: 'Wrong Team', description: 'Insufficient capability or bandwidth' },
  { id: 'wrong_economics', name: 'Wrong Economics', description: 'Unit economics don\'t work' },
  { id: 'regulatory_blocked', name: 'Regulatory Blocked', description: 'Legal or regulatory barriers' },
  { id: 'competitive_preemption', name: 'Competitive Preemption', description: 'Competitor moved first' },
  { id: 'strategic_shift', name: 'Strategic Shift', description: 'Company strategy changed' },
];

/**
 * Post-mortem data structure template.
 * Used when killing an initiative to capture structured learnings.
 */
export const BPS_POSTMORTEM_TEMPLATE = {
  classification: null,       // One of BPS_KILL_CLASSIFICATIONS ids
  hypotheses_tested: [],      // Array of { hypothesis, result, learning }
  key_findings: [],           // Array of strings
  market_conditions: '',      // Free text describing market state at kill time
  investment_spent: 0,        // Total investment up to kill point
  retrieval_triggers: [],     // Array of { condition, description } — when to revisit
  lessons_for_future: [],     // Array of strings
  blameless: true,            // Flag to enforce blameless framing
};

// ============================================================================
// SLA CONFIGURATION
// ============================================================================

export const BPS_STAGE_SLAS = {
  idea: { hours: 48, name: '48 hours', autoPass: true },
  explore: { hours: 168, name: '1 week', autoPass: false }, // 7 days
  assess: { hours: 336, name: '2 weeks', autoPass: false }, // 14 days
  case: { hours: 336, name: '2 weeks', autoPass: false }, // 14 days
};

// ============================================================================
// SCALABLE PROCESS TRACKS (Cooper's 5th Generation Stage-Gate)
// ============================================================================

/**
 * Three tracks based on horizon/risk classification:
 * - Full: 5 stages, 5 gates — for H3 transformational initiatives
 * - XPress: 3 stages, 3 gates — for H2 adjacent initiatives
 * - Lite: 2 stages, 2 gates — for H1 core improvements
 */
export const BPS_TRACKS = {
  full: {
    id: 'full',
    name: 'Full Stage-Gate',
    description: 'All 5 stages and gates — for high-risk/transformational initiatives',
    stages: ['idea', 'explore', 'assess', 'case', 'approval'],
    recommendedFor: 'h3',
    slaMultiplier: 1.0,
    evidenceLevel: 'comprehensive',
  },
  xpress: {
    id: 'xpress',
    name: 'Stage-Gate XPress',
    description: '3 stages — for moderate-risk/adjacent initiatives',
    stages: ['idea', 'assess', 'approval'],
    recommendedFor: 'h2',
    slaMultiplier: 0.7,
    evidenceLevel: 'moderate',
  },
  lite: {
    id: 'lite',
    name: 'Stage-Gate Lite',
    description: '2 stages — for low-risk/incremental improvements',
    stages: ['idea', 'approval'],
    recommendedFor: 'h1',
    slaMultiplier: 0.5,
    evidenceLevel: 'minimal',
  },
};

/**
 * Recommend a track based on horizon classification
 * @param {string} horizon - 'h1', 'h2', or 'h3'
 * @returns {string} Track ID
 */
export function recommendTrack(horizon) {
  switch (horizon) {
    case 'h1': return 'lite';
    case 'h2': return 'xpress';
    case 'h3': return 'full';
    default: return 'full'; // Default to full when uncertain
  }
}

/**
 * Get the stages for a given track
 * @param {string} trackId - 'full', 'xpress', or 'lite'
 * @returns {string[]} Ordered array of stage IDs
 */
export function getTrackStages(trackId) {
  return BPS_TRACKS[trackId]?.stages || BPS_TRACKS.full.stages;
}

/**
 * Get gate criteria filtered by track
 * Full track gets all criteria, XPress gets a subset, Lite gets minimal
 */
export function getTrackGateCriteria(trackId, stage) {
  const allCriteria = BPS_GATE_CRITERIA[stage] || [];
  const track = BPS_TRACKS[trackId];
  if (!track) return allCriteria;

  switch (track.evidenceLevel) {
    case 'minimal':
      return allCriteria.slice(0, 2); // First 2 criteria only
    case 'moderate':
      return allCriteria.slice(0, Math.ceil(allCriteria.length * 0.6));
    case 'comprehensive':
    default:
      return allCriteria;
  }
}

/**
 * Get SLA hours adjusted for track
 */
export function getTrackSLA(trackId, stage) {
  const baseSLA = BPS_STAGE_SLAS[stage];
  if (!baseSLA) return null;
  const track = BPS_TRACKS[trackId];
  if (!track) return baseSLA;

  return {
    ...baseSLA,
    hours: Math.round(baseSLA.hours * track.slaMultiplier),
  };
}

// ============================================================================
// INVESTMENT THRESHOLDS
// ============================================================================

export const BPS_INVESTMENT_THRESHOLDS = {
  idea: { max: 0, typical: 'Submitter time' },
  explore: { max: 5000, typical: '1-2 weeks research' },
  assess: { max: 10000, typical: '1 week analysis' },
  case: { max: 50000, typical: '2-4 weeks detailed work' },
  approved: { max: null, typical: 'Per business case' },
};

// ============================================================================
// IDEA SOURCES
// ============================================================================

export const BPS_IDEA_SOURCES = [
  { id: 'customer_feedback', name: 'Customer Feedback' },
  { id: 'market_research', name: 'Market Research' },
  { id: 'competitor_analysis', name: 'Competitor Analysis' },
  { id: 'internal_innovation', name: 'Internal Innovation' },
  { id: 'strategic_planning', name: 'Strategic Planning' },
  { id: 'technology_opportunity', name: 'Technology Opportunity' },
  { id: 'regulatory_requirement', name: 'Regulatory Requirement' },
  { id: 'partner_opportunity', name: 'Partner Opportunity' },
  { id: 'other', name: 'Other' },
];

// ============================================================================
// STAGE-APPROPRIATE METRICS (Three-Layer Innovation Accounting — Toma & Gons)
// ============================================================================

/**
 * Different metrics per stage. Early stages focus on learning velocity;
 * later stages focus on financial evidence.
 *
 * Three layers:
 * - Tactical (product teams): learning metrics, experiment velocity
 * - Managerial (innovation managers): conversion rates, pipeline health
 * - Strategic (executives): portfolio ROI, investment allocation
 */
export const BPS_STAGE_METRICS = {
  idea: {
    required: [
      { id: 'problem_clarity', name: 'Problem Clarity', type: 'rating', scale: 5, description: 'How well-defined is the problem?' },
      { id: 'sponsor_identified', name: 'Sponsor Identified', type: 'boolean', description: 'Has an executive sponsor been identified?' },
    ],
    optional: [
      { id: 'source_strength', name: 'Source Strength', type: 'rating', scale: 5, description: 'How strong is the evidence that triggered this idea?' },
    ],
    layer: 'tactical',
  },
  explore: {
    required: [
      { id: 'customer_interviews', name: 'Customer Interviews', type: 'count', target: 5, description: 'Number of customer interviews conducted' },
      { id: 'assumptions_tested', name: 'Assumptions Tested', type: 'count', target: 3, description: 'Number of key assumptions validated or invalidated' },
      { id: 'learning_velocity', name: 'Learning Velocity', type: 'calculated', description: 'Assumptions tested per week' },
    ],
    optional: [
      { id: 'tam_range', name: 'TAM Range', type: 'currency_range', description: 'Total Addressable Market estimate range' },
      { id: 'sam_range', name: 'SAM Range', type: 'currency_range', description: 'Serviceable Addressable Market range' },
      { id: 'som_range', name: 'SOM Range', type: 'currency_range', description: 'Serviceable Obtainable Market range' },
    ],
    layer: 'tactical',
  },
  assess: {
    required: [
      { id: 'willingness_to_pay', name: 'Willingness to Pay', type: 'evidence', description: 'Evidence that customers will pay (surveys, LOIs, pre-orders)' },
      { id: 'prototype_feedback', name: 'Prototype/MVP Feedback', type: 'rating', scale: 5, description: 'User feedback score on prototype or MVP' },
      { id: 'feasibility_confidence', name: 'Feasibility Confidence', type: 'percentage', description: 'Team confidence in technical feasibility (0-100%)' },
    ],
    optional: [
      { id: 'strategic_fit_score', name: 'Strategic Fit', type: 'rating', scale: 5, description: 'Alignment with company strategy' },
      { id: 'market_score', name: 'Market Score', type: 'rating', scale: 5, description: 'Market attractiveness assessment' },
    ],
    layer: 'managerial',
  },
  case: {
    required: [
      { id: 'npv_range', name: 'NPV Range', type: 'currency_range', description: 'Net Present Value (P10/P50/P90)' },
      { id: 'unit_economics', name: 'Unit Economics', type: 'object', description: 'CAC, LTV, gross margin per unit' },
      { id: 'pilot_data', name: 'Pilot/MVP Data', type: 'evidence', description: 'Results from pilot or MVP launch' },
    ],
    optional: [
      { id: 'irr', name: 'IRR', type: 'percentage', description: 'Internal Rate of Return' },
      { id: 'payback_months', name: 'Payback Period', type: 'count', description: 'Months to break even' },
      { id: 'bcr', name: 'Benefit-Cost Ratio', type: 'number', description: 'Total benefits / total costs' },
    ],
    layer: 'managerial',
  },
  approval: {
    required: [
      { id: 'aggregate_score', name: 'Aggregate Weighted Score', type: 'percentage', description: 'Overall weighted score across all dimensions' },
    ],
    optional: [
      { id: 'risk_adjusted_value', name: 'Risk-Adjusted Expected Value', type: 'currency', description: 'NPV x probability of success' },
      { id: 'portfolio_fit', name: 'Portfolio Fit', type: 'rating', scale: 5, description: 'How well this fits the current portfolio balance' },
    ],
    layer: 'strategic',
  },
};

/**
 * Get metrics for a specific stage
 * @param {string} stage - Stage ID
 * @returns {Object} { required, optional, layer }
 */
export function getStageMetrics(stage) {
  return BPS_STAGE_METRICS[stage] || { required: [], optional: [], layer: 'tactical' };
}

/**
 * Check if all required metrics for a stage are populated
 * @param {string} stage - Stage ID
 * @param {Object} stageData - The stage-specific data object
 * @returns {Object} { complete, missing, progress }
 */
export function checkMetricCompleteness(stage, stageData) {
  const metrics = BPS_STAGE_METRICS[stage];
  if (!metrics) return { complete: true, missing: [], progress: 100 };

  const missing = metrics.required.filter(m => {
    const value = stageData?.[m.id];
    if (value === undefined || value === null || value === '') return true;
    if (m.type === 'boolean') return false; // false is a valid answer
    if (m.type === 'count' && value === 0) return true;
    return false;
  });

  const total = metrics.required.length;
  const completed = total - missing.length;

  return {
    complete: missing.length === 0,
    missing: missing.map(m => ({ id: m.id, name: m.name })),
    progress: total > 0 ? Math.round((completed / total) * 100) : 100,
  };
}

// ============================================================================
// PESTLE CATEGORIES
// ============================================================================

export const BPS_PESTLE_CATEGORIES = {
  political: {
    id: 'political',
    name: 'Political',
    description: 'Government policies, regulations, political stability',
    icon: 'AccountBalance',
  },
  economic: {
    id: 'economic',
    name: 'Economic',
    description: 'Economic growth, exchange rates, inflation',
    icon: 'TrendingUp',
  },
  social: {
    id: 'social',
    name: 'Social',
    description: 'Demographics, culture, lifestyle trends',
    icon: 'People',
  },
  technological: {
    id: 'technological',
    name: 'Technological',
    description: 'Innovation, automation, R&D activity',
    icon: 'Memory',
  },
  legal: {
    id: 'legal',
    name: 'Legal',
    description: 'Laws, regulations, compliance requirements',
    icon: 'Gavel',
  },
  environmental: {
    id: 'environmental',
    name: 'Environmental',
    description: 'Climate, sustainability, ecological factors',
    icon: 'Nature',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate overall score from individual criteria scores
 */
export function calculateOverallScore(assess) {
  if (!assess) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  Object.entries(BPS_SCORING_CRITERIA).forEach(([key, criteria]) => {
    const score = assess[key]?.score;
    if (typeof score === 'number') {
      weightedSum += score * criteria.weight;
      totalWeight += criteria.weight;
    }
  });

  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 20); // Convert to percentage (0-100)
}

/**
 * Calculate SLA status for an initiative
 */
export function calculateSLAStatus(initiative, now = new Date()) {
  const stage = initiative.status;
  const sla = BPS_STAGE_SLAS[stage];
  if (!sla) return 'ok';

  const stageEntry = initiative.governance?.stage_history?.find(h => h.stage === stage);
  if (!stageEntry?.entered) return 'ok';

  const hoursSince = (now - new Date(stageEntry.entered)) / (1000 * 60 * 60);

  if (hoursSince > sla.hours * 2) return 'breached';
  if (hoursSince > sla.hours) return 'at_risk';
  return 'on_track';
}

/**
 * Check all kill criteria for an initiative.
 * Returns the full evaluation from evaluateKillCriteria for backward compatibility.
 * Callers that previously received an array of triggered criteria should migrate
 * to evaluateKillCriteria() which returns { mustMeetFails, shouldMeetWarns, recommendation }.
 *
 * @param {Object} initiative - The initiative to check
 * @returns {Object} Kill criteria evaluation result
 */
export function checkKillCriteria(initiative) {
  return evaluateKillCriteria(initiative);
}

/**
 * Get next stage for an initiative
 */
export function getNextStage(currentStage, trackId = 'full') {
  const stages = getTrackStages(trackId);
  // Append 'approved' as the final destination if not already present
  const stageOrder = stages.includes('approved') ? stages : [...stages, 'approved'];
  const currentIndex = stageOrder.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === stageOrder.length - 1) return null;
  return stageOrder[currentIndex + 1];
}

/**
 * Get previous stage for an initiative
 */
export function getPreviousStage(currentStage, trackId = 'full') {
  const stages = getTrackStages(trackId);
  const stageOrder = stages.includes('approved') ? stages : [...stages, 'approved'];
  const currentIndex = stageOrder.indexOf(currentStage);
  if (currentIndex <= 0) return null;
  return stageOrder[currentIndex - 1];
}

/**
 * Check if initiative can advance to next stage
 */
export function canAdvanceStage(initiative) {
  const stage = initiative.status;

  switch (stage) {
    case 'idea':
      // Must have description and problem statement
      return !!(initiative.idea?.description && initiative.idea?.problem_statement);
    case 'explore':
      // Must have market sizing
      return !!(initiative.explore?.market_sizing?.tam);
    case 'assess':
      // Must have scoring complete
      return !!(initiative.assess?.overall_score >= 0);
    case 'case':
      // Must have business case with financials
      return !!(initiative.case?.financials?.npv !== undefined);
    default:
      return false;
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(value, currency = 'USD') {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate NPV from cash flows
 */
export function calculateNPV(cashFlows, discountRate = 0.1) {
  return cashFlows.reduce((npv, cashFlow, year) => {
    return npv + cashFlow / Math.pow(1 + discountRate, year);
  }, 0);
}

/**
 * Calculate IRR from cash flows (Newton-Raphson method)
 */
export function calculateIRR(cashFlows, guess = 0.1, maxIterations = 100, tolerance = 0.00001) {
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivative = 0;

    for (let j = 0; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + rate, j);
      derivative -= j * cashFlows[j] / Math.pow(1 + rate, j + 1);
    }

    const newRate = rate - npv / derivative;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100; // Return as percentage
    }

    rate = newRate;
  }

  return null; // Failed to converge
}

/**
 * Calculate payback period in months
 */
export function calculatePayback(initialInvestment, monthlyBenefit) {
  if (monthlyBenefit <= 0) return null;
  return Math.ceil(initialInvestment / monthlyBenefit);
}

/**
 * Calculate benefit-cost ratio
 */
export function calculateBCR(totalBenefits, totalCosts) {
  if (totalCosts <= 0) return null;
  return totalBenefits / totalCosts;
}

/**
 * Calculate NPV for three scenarios (Base/Optimistic/Pessimistic)
 * Returns P10/P50/P90 percentile estimates.
 *
 * @param {Object} scenarios - { base: number[], optimistic: number[], pessimistic: number[] }
 * @param {number} discountRate - Discount rate (e.g., 0.1 for 10%)
 * @returns {Object} { base, optimistic, pessimistic, p10, p50, p90 }
 */
export function calculateNPVRange(scenarios, discountRate = 0.1) {
  const baseNPV = calculateNPV(scenarios.base || [], discountRate);
  const optimisticNPV = calculateNPV(scenarios.optimistic || [], discountRate);
  const pessimisticNPV = calculateNPV(scenarios.pessimistic || [], discountRate);

  // Simple triangular distribution approximation for P10/P50/P90
  const sorted = [pessimisticNPV, baseNPV, optimisticNPV].sort((a, b) => a - b);
  const p10 = sorted[0] + (sorted[1] - sorted[0]) * 0.1;
  const p50 = sorted[1]; // Median ≈ base case
  const p90 = sorted[1] + (sorted[2] - sorted[1]) * 0.9;

  return {
    base: Math.round(baseNPV),
    optimistic: Math.round(optimisticNPV),
    pessimistic: Math.round(pessimisticNPV),
    p10: Math.round(p10),
    p50: Math.round(p50),
    p90: Math.round(p90),
  };
}

/**
 * Monte Carlo NPV simulation.
 * Runs N iterations with random values between pessimistic and optimistic scenarios.
 *
 * @param {Object} scenarios - { base: number[], optimistic: number[], pessimistic: number[] }
 * @param {number} discountRate - Discount rate
 * @param {number} iterations - Number of simulation runs (default 1000)
 * @returns {Object} { mean, median, stdDev, p10, p50, p90, distribution }
 */
export function monteCarloNPV(scenarios, discountRate = 0.1, iterations = 1000) {
  const base = scenarios.base || [];
  const optimistic = scenarios.optimistic || base;
  const pessimistic = scenarios.pessimistic || base;
  const years = Math.max(base.length, optimistic.length, pessimistic.length);

  const results = [];

  for (let i = 0; i < iterations; i++) {
    const cashFlows = [];
    for (let y = 0; y < years; y++) {
      const low = pessimistic[y] || 0;
      const high = optimistic[y] || 0;
      // Triangular distribution using base as mode
      const mode = base[y] || (low + high) / 2;
      cashFlows.push(triangularRandom(low, mode, high));
    }
    results.push(calculateNPV(cashFlows, discountRate));
  }

  results.sort((a, b) => a - b);

  const mean = results.reduce((a, b) => a + b, 0) / results.length;
  const median = results[Math.floor(results.length / 2)];
  const variance = results.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / results.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean: Math.round(mean),
    median: Math.round(median),
    stdDev: Math.round(stdDev),
    p10: Math.round(results[Math.floor(results.length * 0.1)]),
    p50: Math.round(results[Math.floor(results.length * 0.5)]),
    p90: Math.round(results[Math.floor(results.length * 0.9)]),
    min: Math.round(results[0]),
    max: Math.round(results[results.length - 1]),
    iterations,
  };
}

/**
 * Generate a random value from a triangular distribution
 * @param {number} low - Minimum value
 * @param {number} mode - Most likely value
 * @param {number} high - Maximum value
 * @returns {number}
 */
function triangularRandom(low, mode, high) {
  if (high <= low) return mode;
  const u = Math.random();
  const fc = (mode - low) / (high - low);
  if (u < fc) {
    return low + Math.sqrt(u * (high - low) * (mode - low));
  }
  return high - Math.sqrt((1 - u) * (high - low) * (high - mode));
}

/**
 * Sensitivity analysis — calculate how NPV changes when each input varies by ±percentage.
 * Returns data suitable for a tornado diagram.
 *
 * @param {number[]} baseCashFlows - Base case cash flows
 * @param {number} discountRate - Base discount rate
 * @param {number} variationPct - Variation percentage (e.g., 0.2 for ±20%)
 * @returns {Array<Object>} Array of { variable, baseNPV, lowNPV, highNPV, impact } sorted by impact
 */
export function sensitivityAnalysis(baseCashFlows, discountRate = 0.1, variationPct = 0.2) {
  const baseNPV = calculateNPV(baseCashFlows, discountRate);
  const results = [];

  // Vary each year's cash flow
  baseCashFlows.forEach((_, yearIndex) => {
    if (yearIndex === 0) return; // Skip initial investment for revenue sensitivity

    const lowFlows = [...baseCashFlows];
    const highFlows = [...baseCashFlows];
    lowFlows[yearIndex] = baseCashFlows[yearIndex] * (1 - variationPct);
    highFlows[yearIndex] = baseCashFlows[yearIndex] * (1 + variationPct);

    const lowNPV = calculateNPV(lowFlows, discountRate);
    const highNPV = calculateNPV(highFlows, discountRate);

    results.push({
      variable: `Year ${yearIndex} Revenue`,
      baseValue: baseCashFlows[yearIndex],
      baseNPV: Math.round(baseNPV),
      lowNPV: Math.round(lowNPV),
      highNPV: Math.round(highNPV),
      impact: Math.round(Math.abs(highNPV - lowNPV)),
    });
  });

  // Vary discount rate
  const lowDiscountNPV = calculateNPV(baseCashFlows, discountRate * (1 - variationPct));
  const highDiscountNPV = calculateNPV(baseCashFlows, discountRate * (1 + variationPct));
  results.push({
    variable: 'Discount Rate',
    baseValue: discountRate,
    baseNPV: Math.round(baseNPV),
    lowNPV: Math.round(highDiscountNPV), // Higher rate = lower NPV
    highNPV: Math.round(lowDiscountNPV),
    impact: Math.round(Math.abs(lowDiscountNPV - highDiscountNPV)),
  });

  // Vary initial investment (year 0)
  if (baseCashFlows.length > 0) {
    const lowInvestFlows = [...baseCashFlows];
    const highInvestFlows = [...baseCashFlows];
    lowInvestFlows[0] = baseCashFlows[0] * (1 + variationPct); // More negative = worse
    highInvestFlows[0] = baseCashFlows[0] * (1 - variationPct); // Less negative = better

    results.push({
      variable: 'Initial Investment',
      baseValue: baseCashFlows[0],
      baseNPV: Math.round(baseNPV),
      lowNPV: Math.round(calculateNPV(lowInvestFlows, discountRate)),
      highNPV: Math.round(calculateNPV(highInvestFlows, discountRate)),
      impact: Math.round(Math.abs(calculateNPV(highInvestFlows, discountRate) - calculateNPV(lowInvestFlows, discountRate))),
    });
  }

  // Sort by impact (highest first) for tornado diagram
  return results.sort((a, b) => b.impact - a.impact);
}

/**
 * Calculate cumulative cash flow for break-even chart
 * @param {number[]} cashFlows - Annual cash flows
 * @returns {Array<Object>} Array of { year, cashFlow, cumulative, breakEven }
 */
export function cumulativeCashFlow(cashFlows) {
  let cumulative = 0;
  let breakEvenYear = null;

  return cashFlows.map((cashFlow, year) => {
    const prevCumulative = cumulative;
    cumulative += cashFlow;

    if (breakEvenYear === null && prevCumulative < 0 && cumulative >= 0) {
      breakEvenYear = year;
    }

    return {
      year,
      cashFlow: Math.round(cashFlow),
      cumulative: Math.round(cumulative),
      breakEven: breakEvenYear === year,
    };
  });
}

/**
 * Generate initiative ID
 */
export function generateInitiativeId(sequence) {
  return `BPS-${String(sequence).padStart(3, '0')}`;
}

/**
 * Get stage color
 */
export function getStageColor(stage) {
  return BPS_STAGE_INFO[stage]?.color || '#9C9A94';
}

/**
 * Get stage icon name
 */
export function getStageIcon(stage) {
  return BPS_STAGE_INFO[stage]?.icon || 'Circle';
}

/**
 * Check if stage is terminal
 */
export function isTerminalStage(stage) {
  return stage === 'approved' || stage === 'declined' || stage === 'hold';
}

/**
 * Get funnel metrics from initiatives
 */
export function calculateFunnelMetrics(initiatives) {
  const byStage = {};
  BPS_STAGES.forEach(stage => {
    byStage[stage] = initiatives.filter(i => i.status === stage).length;
  });

  const total = initiatives.length;
  const active = total - (byStage.approved || 0) - (byStage.declined || 0);

  // Calculate conversion rates
  const conversions = {};
  const stageOrder = ['idea', 'explore', 'assess', 'case', 'approved'];
  for (let i = 0; i < stageOrder.length - 1; i++) {
    const from = stageOrder[i];
    const to = stageOrder[i + 1];
    const fromCount = initiatives.filter(init => {
      const history = init.governance?.stage_history || [];
      return history.some(h => h.stage === from);
    }).length;
    const toCount = initiatives.filter(init => {
      const history = init.governance?.stage_history || [];
      return history.some(h => h.stage === to);
    }).length;
    conversions[`${from}_to_${to}`] = fromCount > 0 ? Math.round((toCount / fromCount) * 100) : 0;
  }

  return {
    byStage,
    total,
    active,
    conversions,
  };
}

// ============================================================================
// REVIEWER CONFIDENCE & CALIBRATION
// ============================================================================

/**
 * Reviewer confidence levels alongside scoring.
 * Each reviewer provides a confidence rating (1-5) per scoring dimension.
 * Divergence in confidence signals uncertainty that needs attention.
 */
export const BPS_CONFIDENCE_LEVELS = [
  { value: 1, label: 'Very Low', description: 'Guessing — no data to support score' },
  { value: 2, label: 'Low', description: 'Some intuition but little evidence' },
  { value: 3, label: 'Moderate', description: 'Reasonable evidence, some gaps' },
  { value: 4, label: 'High', description: 'Strong evidence supports this score' },
  { value: 5, label: 'Very High', description: 'Definitive evidence — high certainty' },
];

/**
 * Behavioral anchors for scoring dimensions.
 * Maps dimension x level -> behavioral description to reduce scoring bias.
 */
export const BPS_SCORE_ANCHORS = {
  strategic_fit: {
    low: 'Tangential to current strategy and core business',
    medium: 'Aligned with strategy but not a top priority',
    high: 'Directly supports strategic objectives and core mission',
  },
  market_potential: {
    low: 'Niche market with limited growth potential (<$10M TAM)',
    medium: 'Moderate market with steady growth ($10M-$100M TAM)',
    high: 'Large, growing market with significant opportunity (>$100M TAM)',
  },
  feasibility: {
    low: 'Requires significant new capabilities or unproven technology',
    medium: 'Achievable with moderate effort and existing capabilities',
    high: 'Straightforward execution leveraging existing strengths',
  },
  competitive_position: {
    low: 'Easily replicable solution with many competitors',
    medium: 'Some differentiation but competitors could match within 12 months',
    high: 'Strong moat with defensible IP, network effects, or unique capability',
  },
  risk_level: {
    low: 'Negative or marginal returns with high uncertainty',
    medium: 'Acceptable returns with moderate confidence',
    high: 'Strong returns with high confidence and multiple revenue streams',
  },
};

/**
 * Detect divergence in reviewer scores.
 * High divergence signals disagreement that may need resolution.
 *
 * @param {Array<{score: number, confidence: number}>} reviews - Array of reviewer scores for one dimension
 * @returns {Object} { mean, stdDev, divergent, maxSpread }
 */
export function detectScoreDivergence(reviews) {
  if (!reviews || reviews.length < 2) {
    return { mean: reviews?.[0]?.score || 0, stdDev: 0, divergent: false, maxSpread: 0 };
  }

  const scores = reviews.map(r => r.score);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  const maxSpread = Math.max(...scores) - Math.min(...scores);

  return {
    mean: Math.round(mean * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    divergent: stdDev > 1.0 || maxSpread >= 3,
    maxSpread,
  };
}

/**
 * Calculate confidence-weighted score.
 * Higher-confidence reviewers have more influence on the final score.
 *
 * @param {Array<{score: number, confidence: number}>} reviews
 * @returns {number} Confidence-weighted average score
 */
export function confidenceWeightedScore(reviews) {
  if (!reviews || reviews.length === 0) return 0;

  let totalWeight = 0;
  let weightedSum = 0;

  reviews.forEach(r => {
    const weight = r.confidence || 1;
    weightedSum += r.score * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;
}

// ============================================================================
// SLA ESCALATION RULES
// ============================================================================

/**
 * SLA escalation tiers with actions.
 * Progressive escalation when SLA deadlines are missed.
 */
export const BPS_SLA_ESCALATION = {
  on_track: {
    id: 'on_track',
    label: 'On Track',
    color: '#5B8A6A',
    actions: [],
  },
  at_risk: {
    id: 'at_risk',
    label: 'At Risk',
    description: 'Within 20% of SLA deadline',
    color: '#C9A227',
    actions: ['notify_owner'],
  },
  breached: {
    id: 'breached',
    label: 'Breached',
    description: 'Past SLA deadline',
    color: '#A54D4D',
    actions: ['notify_owner', 'notify_manager', 'flag_portfolio_dashboard'],
  },
  breached_2x: {
    id: 'breached_2x',
    label: 'Critical Breach',
    description: 'Past 2x SLA deadline',
    color: '#7B2D2D',
    actions: ['notify_owner', 'notify_manager', 'assign_backup_reviewer', 'flag_executive_summary'],
  },
};

/**
 * Calculate detailed SLA status with escalation tier
 * @param {Object} initiative - Initiative with governance_data
 * @param {Date} [now] - Current time (for testing)
 * @returns {Object} { tier, hoursElapsed, hoursAllowed, percentUsed }
 */
export function calculateDetailedSLA(initiative, now = new Date()) {
  const stage = initiative.stage;
  const sla = BPS_STAGE_SLAS[stage];
  if (!sla) return { tier: 'on_track', hoursElapsed: 0, hoursAllowed: 0, percentUsed: 0 };

  const stageEntry = initiative.governance_data?.stage_history?.find(h => h.stage === stage && !h.exited);
  if (!stageEntry?.entered) return { tier: 'on_track', hoursElapsed: 0, hoursAllowed: sla.hours, percentUsed: 0 };

  const hoursElapsed = (now - new Date(stageEntry.entered)) / (1000 * 60 * 60);
  const percentUsed = Math.round((hoursElapsed / sla.hours) * 100);

  let tier = 'on_track';
  if (hoursElapsed > sla.hours * 2) tier = 'breached_2x';
  else if (hoursElapsed > sla.hours) tier = 'breached';
  else if (hoursElapsed > sla.hours * 0.8) tier = 'at_risk';

  return {
    tier,
    hoursElapsed: Math.round(hoursElapsed),
    hoursAllowed: sla.hours,
    percentUsed,
    escalation: BPS_SLA_ESCALATION[tier],
  };
}

// ============================================================================
// POST-LAUNCH REVIEW (PLR)
// ============================================================================

/**
 * Post-Launch Review configuration.
 * Automatically scheduled 12 months after approval.
 * Compares projected vs actual outcomes.
 */
export const BPS_PLR_CONFIG = {
  defaultScheduleMonths: 12,
  maxScheduleMonths: 18,
  metrics: [
    { id: 'revenue', name: 'Revenue', type: 'currency', description: 'Actual revenue vs projected' },
    { id: 'cost', name: 'Development Cost', type: 'currency', description: 'Actual cost vs budgeted' },
    { id: 'adoption', name: 'Adoption Rate', type: 'percentage', description: 'Actual user/customer adoption' },
    { id: 'on_time', name: 'On-Time Delivery', type: 'boolean', description: 'Delivered within planned timeline' },
    { id: 'customer_satisfaction', name: 'Customer Satisfaction', type: 'rating', scale: 5, description: 'Post-launch satisfaction score' },
    { id: 'market_share', name: 'Market Share', type: 'percentage', description: 'Achieved market share vs target' },
  ],
};

/**
 * PLR data template (populated when the review is completed)
 */
export const BPS_PLR_TEMPLATE = {
  scheduled_date: null,
  completed_date: null,
  completed_by: null,
  projected: {},    // { revenue: X, cost: Y, adoption: Z, ... } — from business case
  actual: {},       // { revenue: X, cost: Y, adoption: Z, ... } — measured values
  variance: {},     // { revenue: { value: X, percent: Y }, ... } — computed
  lessons_learned: [],
  recommendations: [],
};

/**
 * Calculate PLR scheduled date from approval date
 * @param {string} approvalDate - ISO date string when initiative was approved
 * @param {number} [months=12] - Months after approval to schedule PLR
 * @returns {string} ISO date string for PLR
 */
export function calculatePLRDate(approvalDate, months = BPS_PLR_CONFIG.defaultScheduleMonths) {
  const date = new Date(approvalDate);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

/**
 * Calculate variance between projected and actual PLR metrics
 * @param {Object} projected - Projected values
 * @param {Object} actual - Actual values
 * @returns {Object} Variance for each metric
 */
export function calculatePLRVariance(projected, actual) {
  const variance = {};

  BPS_PLR_CONFIG.metrics.forEach(metric => {
    const proj = projected[metric.id];
    const act = actual[metric.id];

    if (proj !== undefined && act !== undefined && metric.type !== 'boolean') {
      const diff = act - proj;
      const pct = proj !== 0 ? Math.round((diff / Math.abs(proj)) * 100) : null;
      variance[metric.id] = { projected: proj, actual: act, difference: diff, percentVariance: pct };
    } else if (metric.type === 'boolean') {
      variance[metric.id] = { projected: proj, actual: act, met: act === proj };
    }
  });

  return variance;
}
