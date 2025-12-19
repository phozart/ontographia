// lib/portfolio-types.js
// Portfolio Studio - Artefact Type Definitions
// "This is where we decide what deserves a project."

// ============ PORTFOLIO STAGES ============
// The journey from strategic intent to committed project
export const PORTFOLIO_STAGES = {
  discover: {
    id: 'discover',
    name: 'Discover',
    description: 'Exploring potential investments',
    color: '#8b5cf6',
    order: 1,
  },
  evaluate: {
    id: 'evaluate',
    name: 'Evaluate',
    description: 'Assessing value, risk, and fit',
    color: '#3b82f6',
    order: 2,
  },
  decide: {
    id: 'decide',
    name: 'Decide',
    description: 'Making investment choices',
    color: '#f59e0b',
    order: 3,
  },
  commit: {
    id: 'commit',
    name: 'Commit',
    description: 'Approved for project creation',
    color: '#10b981',
    order: 4,
  },
};

// ============ INVESTMENT HORIZONS ============
// McKinsey Three Horizons for portfolio balance
export const INVESTMENT_HORIZONS = {
  run: {
    id: 'run',
    name: 'Run',
    shortName: 'H1',
    description: 'Maintain and optimize current operations',
    color: '#10b981',
    examples: ['Bug fixes', 'Performance improvements', 'Compliance updates'],
  },
  grow: {
    id: 'grow',
    name: 'Grow',
    shortName: 'H2',
    description: 'Extend and expand existing capabilities',
    color: '#3b82f6',
    examples: ['New features', 'Market expansion', 'Process improvements'],
  },
  transform: {
    id: 'transform',
    name: 'Transform',
    shortName: 'H3',
    description: 'Create new value and future capabilities',
    color: '#8b5cf6',
    examples: ['New products', 'New business models', 'Strategic pivots'],
  },
};

// ============ CONFIDENCE LEVELS ============
// How certain are we about value and feasibility?
export const CONFIDENCE_LEVELS = {
  hypothesis: {
    id: 'hypothesis',
    name: 'Hypothesis',
    description: 'Untested assumption',
    color: '#ef4444',
    score: 1,
  },
  explored: {
    id: 'explored',
    name: 'Explored',
    description: 'Initial research done',
    color: '#f59e0b',
    score: 2,
  },
  validated: {
    id: 'validated',
    name: 'Validated',
    description: 'Evidence supports this',
    color: '#3b82f6',
    score: 3,
  },
  proven: {
    id: 'proven',
    name: 'Proven',
    description: 'High confidence based on data',
    color: '#10b981',
    score: 4,
  },
};

// ============ T-SHIRT SIZING ============
// Rough complexity/effort estimation
export const TSHIRT_SIZES = {
  xs: { id: 'xs', name: 'XS', description: 'Days of effort', color: '#10b981' },
  s: { id: 's', name: 'S', description: 'Weeks of effort', color: '#22c55e' },
  m: { id: 'm', name: 'M', description: '1-2 months', color: '#f59e0b' },
  l: { id: 'l', name: 'L', description: 'Quarter', color: '#f97316' },
  xl: { id: 'xl', name: 'XL', description: 'Multiple quarters', color: '#ef4444' },
};

// ============ ARTEFACT TYPES ============
export const PORTFOLIO_ARTEFACT_TYPES = {
  // Investment Theme - Strategic container for initiatives
  portfolio_theme: {
    id: 'portfolio_theme',
    name: 'Investment Theme',
    namePlural: 'Investment Themes',
    description: 'A strategic focus area that groups related initiatives',
    icon: 'FlagIcon',
    color: '#8b5cf6',
    stage: null, // Themes span all stages
    fields: {
      name: { type: 'text', required: true, label: 'Theme Name', placeholder: 'e.g., Customer Experience Simplification' },
      description: { type: 'textarea', required: true, label: 'Strategic Intent', placeholder: 'Why is this theme important now?' },
      strategic_driver: { type: 'text', required: false, label: 'Strategic Driver', placeholder: 'What strategy or goal drives this?' },
      time_horizon: { type: 'select', required: true, label: 'Investment Horizon', options: Object.values(INVESTMENT_HORIZONS).map(h => ({ value: h.id, label: h.name })) },
      target_outcomes: { type: 'textarea', required: false, label: 'Target Outcomes', placeholder: 'What does success look like?' },
      budget_allocation: { type: 'select', required: false, label: 'Budget Priority', options: [
        { value: 'high', label: 'High Priority' },
        { value: 'medium', label: 'Medium Priority' },
        { value: 'low', label: 'Low Priority' },
      ]},
      owner: { type: 'text', required: false, label: 'Theme Owner', placeholder: 'Who is accountable?' },
      status: { type: 'select', required: true, label: 'Status', options: [
        { value: 'active', label: 'Active' },
        { value: 'paused', label: 'Paused' },
        { value: 'completed', label: 'Completed' },
        { value: 'retired', label: 'Retired' },
      ]},
    },
    guidance: {
      title: 'Investment Themes',
      description: 'Themes represent persistent strategic bets. They prevent project sprawl by grouping related initiatives under a common purpose.',
      tips: [
        'A good theme answers "What are we investing in and why?"',
        'Themes should be stable for 6-12 months minimum',
        'Each theme should have clear success criteria',
      ],
      questions: [
        'What strategic goal does this theme support?',
        'How will we know if this theme is successful?',
        'What would make us retire this theme?',
      ],
    },
  },

  // Portfolio Initiative - Decision-ready investment candidate
  portfolio_initiative: {
    id: 'portfolio_initiative',
    name: 'Portfolio Initiative',
    namePlural: 'Portfolio Initiatives',
    description: 'A potential investment being evaluated for project creation',
    icon: 'RocketLaunchIcon',
    color: '#3b82f6',
    stage: 'discover',
    fields: {
      name: { type: 'text', required: true, label: 'Initiative Name', placeholder: 'e.g., Mobile App Refresh' },
      description: { type: 'textarea', required: true, label: 'Description', placeholder: 'What is this initiative about?' },
      theme_id: { type: 'relation', required: false, label: 'Investment Theme', relationType: 'portfolio_theme' },
      value_hypothesis: { type: 'textarea', required: true, label: 'Value Hypothesis', placeholder: 'We believe that [action] will result in [outcome] because [rationale]' },
      target_outcome: { type: 'textarea', required: false, label: 'Target Outcome', placeholder: 'What measurable outcome are we trying to achieve?' },
      time_horizon: { type: 'select', required: true, label: 'Investment Horizon', options: Object.values(INVESTMENT_HORIZONS).map(h => ({ value: h.id, label: `${h.name} - ${h.description}` })) },
      confidence: { type: 'select', required: true, label: 'Confidence Level', options: Object.values(CONFIDENCE_LEVELS).map(c => ({ value: c.id, label: `${c.name} - ${c.description}` })) },
      size: { type: 'select', required: true, label: 'Rough Size', options: Object.values(TSHIRT_SIZES).map(s => ({ value: s.id, label: `${s.name} - ${s.description}` })) },
      risk_level: { type: 'select', required: true, label: 'Risk Level', options: [
        { value: 'low', label: 'Low - Well understood' },
        { value: 'medium', label: 'Medium - Some uncertainty' },
        { value: 'high', label: 'High - Significant unknowns' },
      ]},
      stage: { type: 'select', required: true, label: 'Stage', options: Object.values(PORTFOLIO_STAGES).map(s => ({ value: s.id, label: s.name })) },
      sponsor: { type: 'text', required: false, label: 'Sponsor', placeholder: 'Who is championing this?' },
      linked_capabilities: { type: 'multirelation', required: false, label: 'Linked Capabilities', relationType: 'capability' },
      linked_products: { type: 'multirelation', required: false, label: 'Linked Products', relationType: 'pdw_product' },
    },
    guidance: {
      title: 'Portfolio Initiatives',
      description: 'An initiative is NOT a project yet. It represents a potential investment being evaluated. Only after approval does it become a project.',
      tips: [
        'Start with a clear value hypothesis',
        'Be honest about confidence levels',
        'Link to capabilities and products to show strategic alignment',
        'Size and risk help with portfolio balancing',
      ],
      questions: [
        'Why are we considering this now?',
        'What outcome are we trying to move?',
        'What are we NOT doing because of this?',
        'What level of certainty do we have?',
      ],
    },
  },

  // Trade-off Analysis - Comparative evaluation
  portfolio_tradeoff: {
    id: 'portfolio_tradeoff',
    name: 'Trade-off Analysis',
    namePlural: 'Trade-off Analyses',
    description: 'A structured comparison of initiatives to support decision-making',
    icon: 'BalanceIcon',
    color: '#f59e0b',
    stage: 'evaluate',
    fields: {
      name: { type: 'text', required: true, label: 'Analysis Name', placeholder: 'e.g., Q2 Investment Prioritization' },
      description: { type: 'textarea', required: false, label: 'Context', placeholder: 'What decision are we trying to make?' },
      initiatives: { type: 'multirelation', required: true, label: 'Initiatives Being Compared', relationType: 'portfolio_initiative' },
      criteria: { type: 'json', required: false, label: 'Evaluation Criteria', default: [] },
      recommendation: { type: 'textarea', required: false, label: 'Recommendation', placeholder: 'Based on this analysis, we recommend...' },
      status: { type: 'select', required: true, label: 'Status', options: [
        { value: 'draft', label: 'Draft' },
        { value: 'in_review', label: 'In Review' },
        { value: 'decided', label: 'Decided' },
      ]},
    },
    guidance: {
      title: 'Trade-off Analysis',
      description: 'Trade-offs make choices visible and discussable. The goal is not to find the "right answer" but to have better conversations about investment choices.',
      tips: [
        'Compare like with like - similar size or horizon',
        'Be explicit about what criteria matter',
        'Document the reasoning, not just the decision',
      ],
      questions: [
        'What criteria matter most for this decision?',
        'What would change our recommendation?',
        'Who needs to be part of this decision?',
      ],
    },
  },

  // Dependency - Cross-initiative or external dependency
  portfolio_dependency: {
    id: 'portfolio_dependency',
    name: 'Dependency',
    namePlural: 'Dependencies',
    description: 'A constraint or dependency that affects portfolio planning',
    icon: 'LinkIcon',
    color: '#64748b',
    stage: null,
    fields: {
      name: { type: 'text', required: true, label: 'Dependency Name', placeholder: 'e.g., API Platform Upgrade' },
      description: { type: 'textarea', required: true, label: 'Description', placeholder: 'What is this dependency and why does it matter?' },
      dependency_type: { type: 'select', required: true, label: 'Type', options: [
        { value: 'initiative', label: 'Initiative Dependency' },
        { value: 'capability', label: 'Capability Bottleneck' },
        { value: 'resource', label: 'Resource Constraint' },
        { value: 'external', label: 'External Dependency' },
        { value: 'technical', label: 'Technical Constraint' },
      ]},
      severity: { type: 'select', required: true, label: 'Severity', options: [
        { value: 'blocking', label: 'Blocking - Cannot proceed without' },
        { value: 'high', label: 'High - Significantly impacts' },
        { value: 'medium', label: 'Medium - Affects timing/scope' },
        { value: 'low', label: 'Low - Minor impact' },
      ]},
      from_initiative: { type: 'relation', required: false, label: 'From Initiative', relationType: 'portfolio_initiative' },
      to_initiative: { type: 'relation', required: false, label: 'To Initiative', relationType: 'portfolio_initiative' },
      mitigation: { type: 'textarea', required: false, label: 'Mitigation Strategy', placeholder: 'How can we address this dependency?' },
      status: { type: 'select', required: true, label: 'Status', options: [
        { value: 'identified', label: 'Identified' },
        { value: 'being_addressed', label: 'Being Addressed' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'accepted', label: 'Accepted (living with it)' },
      ]},
    },
    guidance: {
      title: 'Dependencies',
      description: 'Dependencies prevent accidental overcommitment. Map them early to avoid surprises and enable better sequencing decisions.',
      tips: [
        'Be explicit about blocking vs. nice-to-have dependencies',
        'Consider capability and resource bottlenecks, not just technical',
        'Document mitigation strategies even if not yet actioned',
      ],
      questions: [
        'What would happen if this dependency is not addressed?',
        'Who owns resolving this dependency?',
        'What is the earliest we can resolve it?',
      ],
    },
  },

  // Decision Record - Institutional memory
  portfolio_decision: {
    id: 'portfolio_decision',
    name: 'Decision Record',
    namePlural: 'Decision Records',
    description: 'A record of a significant portfolio decision for institutional learning',
    icon: 'GavelIcon',
    color: '#10b981',
    stage: 'decide',
    fields: {
      name: { type: 'text', required: true, label: 'Decision Title', placeholder: 'e.g., Approved Mobile App Initiative for Q2' },
      decision_date: { type: 'date', required: true, label: 'Decision Date' },
      decision_type: { type: 'select', required: true, label: 'Decision Type', options: [
        { value: 'approve', label: 'Approve - Create Project' },
        { value: 'defer', label: 'Defer - Reconsider Later' },
        { value: 'split', label: 'Split - Break into Parts' },
        { value: 'drop', label: 'Drop - Not Pursuing' },
        { value: 'pivot', label: 'Pivot - Change Direction' },
      ]},
      initiative: { type: 'relation', required: false, label: 'Related Initiative', relationType: 'portfolio_initiative' },
      decision_summary: { type: 'textarea', required: true, label: 'What Was Decided', placeholder: 'Clearly state the decision made' },
      rationale: { type: 'textarea', required: true, label: 'Why This Decision', placeholder: 'What reasoning led to this decision?' },
      alternatives_considered: { type: 'textarea', required: false, label: 'Alternatives Considered', placeholder: 'What other options were evaluated?' },
      assumptions: { type: 'textarea', required: false, label: 'Key Assumptions', placeholder: 'What assumptions is this decision based on?' },
      reconsider_triggers: { type: 'textarea', required: false, label: 'Reconsideration Triggers', placeholder: 'What would cause us to revisit this decision?' },
      decision_makers: { type: 'text', required: false, label: 'Decision Makers', placeholder: 'Who made or approved this decision?' },
    },
    guidance: {
      title: 'Decision Records',
      description: 'Decision records create institutional memory. They help future teams understand not just what was decided, but WHY.',
      tips: [
        'Record decisions soon after they are made',
        'Be honest about assumptions - they may change',
        'Include what was NOT chosen and why',
        'Reconsideration triggers help future teams know when to revisit',
      ],
      questions: [
        'Will someone new understand why we made this choice?',
        'What would invalidate this decision?',
        'What did we learn from alternatives?',
      ],
    },
  },

  // Risk - Portfolio-level risk
  portfolio_risk: {
    id: 'portfolio_risk',
    name: 'Portfolio Risk',
    namePlural: 'Portfolio Risks',
    description: 'A risk that affects the portfolio or multiple initiatives',
    icon: 'WarningIcon',
    color: '#ef4444',
    stage: null,
    fields: {
      name: { type: 'text', required: true, label: 'Risk Name', placeholder: 'e.g., Key vendor discontinuing support' },
      description: { type: 'textarea', required: true, label: 'Description', placeholder: 'Describe the risk and its potential impact' },
      category: { type: 'select', required: true, label: 'Category', options: [
        { value: 'strategic', label: 'Strategic - Affects direction' },
        { value: 'execution', label: 'Execution - Affects delivery' },
        { value: 'resource', label: 'Resource - Capacity/skills' },
        { value: 'technology', label: 'Technology - Technical risks' },
        { value: 'market', label: 'Market - External factors' },
        { value: 'dependency', label: 'Dependency - Third party' },
      ]},
      likelihood: { type: 'select', required: true, label: 'Likelihood', options: [
        { value: 'rare', label: 'Rare' },
        { value: 'unlikely', label: 'Unlikely' },
        { value: 'possible', label: 'Possible' },
        { value: 'likely', label: 'Likely' },
        { value: 'almost_certain', label: 'Almost Certain' },
      ]},
      impact: { type: 'select', required: true, label: 'Impact', options: [
        { value: 'negligible', label: 'Negligible' },
        { value: 'minor', label: 'Minor' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'major', label: 'Major' },
        { value: 'severe', label: 'Severe' },
      ]},
      affected_initiatives: { type: 'multirelation', required: false, label: 'Affected Initiatives', relationType: 'portfolio_initiative' },
      mitigation: { type: 'textarea', required: false, label: 'Mitigation Strategy', placeholder: 'How can we reduce this risk?' },
      owner: { type: 'text', required: false, label: 'Risk Owner', placeholder: 'Who is monitoring this?' },
      status: { type: 'select', required: true, label: 'Status', options: [
        { value: 'open', label: 'Open' },
        { value: 'mitigating', label: 'Mitigating' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'closed', label: 'Closed' },
      ]},
    },
    guidance: {
      title: 'Portfolio Risks',
      description: 'Portfolio risks affect multiple initiatives or the overall portfolio health. Tracking them separately enables better resource allocation.',
      tips: [
        'Focus on risks that span initiatives',
        'Be realistic about likelihood and impact',
        'Consider concentration risks (too much in one area)',
      ],
      questions: [
        'How would this risk affect our portfolio balance?',
        'Should we reduce exposure to this risk?',
        'What early warning signs should we watch for?',
      ],
    },
  },
};

// ============ PORTFOLIO VIEWS ============
// Different ways to visualize portfolio health
export const PORTFOLIO_VIEWS = {
  horizon_balance: {
    id: 'horizon_balance',
    name: 'Horizon Balance',
    description: 'Distribution across Run/Grow/Transform',
    icon: 'DonutSmallIcon',
  },
  value_risk_matrix: {
    id: 'value_risk_matrix',
    name: 'Value vs Risk',
    description: 'Plot initiatives by expected value and risk',
    icon: 'BubbleChartIcon',
  },
  initiative_pipeline: {
    id: 'initiative_pipeline',
    name: 'Initiative Pipeline',
    description: 'Flow from discovery to commitment',
    icon: 'TimelineIcon',
  },
  dependency_map: {
    id: 'dependency_map',
    name: 'Dependency Map',
    description: 'Cross-initiative dependencies',
    icon: 'AccountTreeIcon',
  },
  theme_allocation: {
    id: 'theme_allocation',
    name: 'Theme Allocation',
    description: 'Investment by strategic theme',
    icon: 'PieChartIcon',
  },
  confidence_tracker: {
    id: 'confidence_tracker',
    name: 'Confidence Tracker',
    description: 'Confidence levels across portfolio',
    icon: 'SpeedIcon',
  },
};

// ============ HELPER FUNCTIONS ============
export function getPortfolioType(typeId) {
  return PORTFOLIO_ARTEFACT_TYPES[typeId] || null;
}

export function getPortfolioStage(stageId) {
  return PORTFOLIO_STAGES[stageId] || null;
}

export function getHorizon(horizonId) {
  return INVESTMENT_HORIZONS[horizonId] || null;
}

export function getConfidenceLevel(levelId) {
  return CONFIDENCE_LEVELS[levelId] || null;
}

export function getTShirtSize(sizeId) {
  return TSHIRT_SIZES[sizeId] || null;
}

// Calculate simple WSJF-like score (Cost of Delay / Size)
export function calculatePriorityScore(initiative) {
  if (!initiative?.custom_fields) return 0;

  const confidenceScores = { hypothesis: 1, explored: 2, validated: 3, proven: 4 };
  const sizeScores = { xs: 1, s: 2, m: 3, l: 5, xl: 8 };
  const riskScores = { low: 1, medium: 2, high: 3 };
  const horizonMultiplier = { run: 1, grow: 1.5, transform: 2 };

  const confidence = confidenceScores[initiative.custom_fields.confidence] || 2;
  const size = sizeScores[initiative.custom_fields.size] || 3;
  const risk = riskScores[initiative.custom_fields.risk_level] || 2;
  const horizon = horizonMultiplier[initiative.custom_fields.time_horizon] || 1;

  // Simple formula: (confidence * horizon) / (size + risk)
  return ((confidence * horizon) / (size + risk)).toFixed(2);
}

export default PORTFOLIO_ARTEFACT_TYPES;
