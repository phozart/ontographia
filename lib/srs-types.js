// lib/srs-types.js
// Strategic Reasoning Suite - Type definitions, constants, and helpers

// ============================================================================
// SPACE DEFINITIONS
// ============================================================================

export const SRS_SPACES = {
  questions: {
    id: 'questions',
    name: 'Questions Space',
    shortName: 'Questions',
    icon: 'HelpOutline',
    color: '#3b82f6',
    description: 'Surface and mature the questions that matter',
    purpose: 'Capture what you need to understand before you can decide',
    entryPrompt: 'What questions are keeping you up at night?',
    order: 1,
  },
  frames: {
    id: 'frames',
    name: 'Problem Framing',
    shortName: 'Frames',
    icon: 'CropFree',
    color: '#8b5cf6',
    description: 'Define and reframe the problem space',
    purpose: 'Shape how you see the situation before jumping to solutions',
    entryPrompt: 'How would you describe the situation you\'re facing?',
    order: 2,
  },
  parallel: {
    id: 'parallel',
    name: 'Parallel States',
    shortName: 'States',
    icon: 'CallSplit',
    color: '#f59e0b',
    description: 'Explore multiple possible futures simultaneously',
    purpose: 'Hold contradictory possibilities without premature resolution',
    entryPrompt: 'What different futures could unfold from here?',
    order: 3,
  },
  systems: {
    id: 'systems',
    name: 'Systems Thinking',
    shortName: 'Systems',
    icon: 'AccountTree',
    color: '#10b981',
    description: 'Map causes, effects, and feedback loops',
    purpose: 'Understand how parts interact to create emergent behavior',
    entryPrompt: 'What factors influence this situation?',
    order: 4,
  },
  perspectives: {
    id: 'perspectives',
    name: 'Perspectives',
    shortName: 'Perspectives',
    icon: 'Visibility',
    color: '#ec4899',
    description: 'See through different stakeholder eyes',
    purpose: 'Understand how others experience the same situation',
    entryPrompt: 'Who else is affected by or involved in this?',
    order: 5,
  },
  decisions: {
    id: 'decisions',
    name: 'Decision Readiness',
    shortName: 'Decisions',
    icon: 'Gavel',
    color: '#ef4444',
    description: 'Assess readiness to commit and act',
    purpose: 'Know when you\'re ready to decide vs. need more reasoning',
    entryPrompt: 'What decisions are you facing?',
    order: 6,
  },
};

export const SPACE_ORDER = ['questions', 'frames', 'parallel', 'systems', 'perspectives', 'decisions'];

// ============================================================================
// QUESTIONS SPACE
// ============================================================================

export const QUESTION_TYPES = {
  clarifying: {
    id: 'clarifying',
    name: 'Clarifying',
    description: 'Seeking to understand what is',
    color: '#3b82f6',
    icon: 'Search',
    examples: ['What exactly happened?', 'Who was involved?', 'When did this start?'],
  },
  causal: {
    id: 'causal',
    name: 'Causal',
    description: 'Understanding why things happen',
    color: '#10b981',
    icon: 'Timeline',
    examples: ['Why did this occur?', 'What caused this change?', 'What triggered this?'],
  },
  evaluative: {
    id: 'evaluative',
    name: 'Evaluative',
    description: 'Assessing value and importance',
    color: '#f59e0b',
    icon: 'Balance',
    examples: ['Is this good or bad?', 'How important is this?', 'What are the tradeoffs?'],
  },
  hypothetical: {
    id: 'hypothetical',
    name: 'Hypothetical',
    description: 'Exploring possibilities',
    color: '#8b5cf6',
    icon: 'Lightbulb',
    examples: ['What if we tried...?', 'What would happen if...?', 'Could we...?'],
  },
  strategic: {
    id: 'strategic',
    name: 'Strategic',
    description: 'Planning and direction',
    color: '#ef4444',
    icon: 'Flag',
    examples: ['What should we do?', 'How do we proceed?', 'What\'s the best path forward?'],
  },
};

export const QUESTION_MATURITY = {
  surfaced: {
    id: 'surfaced',
    name: 'Surfaced',
    description: 'Question identified but not yet explored',
    color: '#9ca3af',
    order: 1,
  },
  exploring: {
    id: 'exploring',
    name: 'Exploring',
    description: 'Actively gathering information and perspectives',
    color: '#f59e0b',
    order: 2,
  },
  clarified: {
    id: 'clarified',
    name: 'Clarified',
    description: 'Question refined with good understanding',
    color: '#3b82f6',
    order: 3,
  },
  answered: {
    id: 'answered',
    name: 'Answered',
    description: 'Sufficient understanding reached for now',
    color: '#10b981',
    order: 4,
  },
  parked: {
    id: 'parked',
    name: 'Parked',
    description: 'Set aside - not relevant now or cannot answer yet',
    color: '#6b7280',
    order: 5,
  },
};

// ============================================================================
// PROBLEM FRAMING SPACE
// ============================================================================

export const FRAME_TYPES = {
  situation: {
    id: 'situation',
    name: 'Situation',
    description: 'Current state description',
    color: '#3b82f6',
    prompts: ['What is happening?', 'What do we observe?'],
  },
  complication: {
    id: 'complication',
    name: 'Complication',
    description: 'What makes this problematic',
    color: '#ef4444',
    prompts: ['Why is this a problem?', 'What tension exists?'],
  },
  implication: {
    id: 'implication',
    name: 'Implication',
    description: 'What happens if unaddressed',
    color: '#f59e0b',
    prompts: ['What\'s at stake?', 'What happens if we do nothing?'],
  },
  position: {
    id: 'position',
    name: 'Position',
    description: 'Our stance or hypothesis',
    color: '#10b981',
    prompts: ['What do we believe?', 'What\'s our working hypothesis?'],
  },
  action: {
    id: 'action',
    name: 'Action',
    description: 'What we propose to do',
    color: '#8b5cf6',
    prompts: ['What should we do?', 'What\'s the recommended path?'],
  },
  boundary: {
    id: 'boundary',
    name: 'Boundary',
    description: 'What\'s in and out of scope',
    color: '#6b7280',
    prompts: ['What are we NOT addressing?', 'What constraints exist?'],
  },
};

export const FRAME_ELEMENT_TYPES = {
  statement: { id: 'statement', name: 'Statement', icon: 'Notes' },
  evidence: { id: 'evidence', name: 'Evidence', icon: 'Description' },
  assumption: { id: 'assumption', name: 'Assumption', icon: 'Psychology' },
  constraint: { id: 'constraint', name: 'Constraint', icon: 'Block' },
  question: { id: 'question', name: 'Question', icon: 'Help' },
};

// ============================================================================
// PARALLEL STATES SPACE
// ============================================================================

export const STATE_TYPES = {
  possible: {
    id: 'possible',
    name: 'Possible',
    description: 'Could happen',
    color: '#3b82f6',
  },
  probable: {
    id: 'probable',
    name: 'Probable',
    description: 'Likely to happen',
    color: '#f59e0b',
  },
  preferred: {
    id: 'preferred',
    name: 'Preferred',
    description: 'What we want to happen',
    color: '#10b981',
  },
  feared: {
    id: 'feared',
    name: 'Feared',
    description: 'What we hope doesn\'t happen',
    color: '#ef4444',
  },
  wildcard: {
    id: 'wildcard',
    name: 'Wildcard',
    description: 'Unexpected scenario',
    color: '#8b5cf6',
  },
};

export const STATE_CONFIDENCE_LEVELS = {
  very_low: { id: 'very_low', name: 'Very Low', value: 0.1, color: '#ef4444' },
  low: { id: 'low', name: 'Low', value: 0.3, color: '#f59e0b' },
  medium: { id: 'medium', name: 'Medium', value: 0.5, color: '#eab308' },
  high: { id: 'high', name: 'High', value: 0.7, color: '#84cc16' },
  very_high: { id: 'very_high', name: 'Very High', value: 0.9, color: '#10b981' },
};

// ============================================================================
// SYSTEMS THINKING SPACE
// ============================================================================

export const SYSTEM_NODE_TYPES = {
  variable: {
    id: 'variable',
    name: 'Variable',
    description: 'Something that can increase or decrease',
    color: '#3b82f6',
    icon: 'TrendingUp',
    examples: ['Customer satisfaction', 'Revenue', 'Employee morale'],
  },
  stock: {
    id: 'stock',
    name: 'Stock',
    description: 'Accumulation that changes over time',
    color: '#10b981',
    icon: 'Inventory',
    examples: ['Inventory level', 'Customer base', 'Technical debt'],
  },
  flow: {
    id: 'flow',
    name: 'Flow',
    description: 'Rate of change into or out of a stock',
    color: '#f59e0b',
    icon: 'Sync',
    examples: ['Sales rate', 'Hiring rate', 'Bug fix rate'],
  },
  external: {
    id: 'external',
    name: 'External Factor',
    description: 'Outside force we can\'t control',
    color: '#6b7280',
    icon: 'Public',
    examples: ['Market conditions', 'Regulations', 'Competitor actions'],
  },
  lever: {
    id: 'lever',
    name: 'Lever',
    description: 'Something we can influence directly',
    color: '#8b5cf6',
    icon: 'Tune',
    examples: ['Pricing', 'Hiring decisions', 'Marketing spend'],
  },
};

export const CAUSAL_POLARITIES = {
  positive: {
    id: 'positive',
    name: 'Same Direction (+)',
    shortName: '+',
    description: 'When A increases, B increases (and vice versa)',
    color: '#10b981',
    examples: ['More marketing → More leads', 'Higher quality → Higher satisfaction'],
  },
  negative: {
    id: 'negative',
    name: 'Opposite Direction (−)',
    shortName: '−',
    description: 'When A increases, B decreases (and vice versa)',
    color: '#ef4444',
    examples: ['Higher price → Lower demand', 'More automation → Less manual work'],
  },
};

export const TIME_DELAYS = {
  immediate: { id: 'immediate', name: 'Immediate', description: 'Days', icon: 'FlashOn' },
  short: { id: 'short', name: 'Short', description: 'Weeks', icon: 'Schedule' },
  medium: { id: 'medium', name: 'Medium', description: 'Months', icon: 'DateRange' },
  long: { id: 'long', name: 'Long', description: 'Years', icon: 'Event' },
};

export const LOOP_TYPES = {
  reinforcing: {
    id: 'reinforcing',
    name: 'Reinforcing (R)',
    shortName: 'R',
    description: 'Amplifies change - virtuous or vicious cycle',
    color: '#10b981',
    examples: ['Growth spiral', 'Death spiral', 'Success breeds success'],
  },
  balancing: {
    id: 'balancing',
    name: 'Balancing (B)',
    shortName: 'B',
    description: 'Counteracts change - seeks equilibrium',
    color: '#3b82f6',
    examples: ['Thermostat', 'Market correction', 'Burnout recovery'],
  },
};

// ============================================================================
// PERSPECTIVES SPACE
// ============================================================================

export const PERSPECTIVE_TYPES = {
  stakeholder: {
    id: 'stakeholder',
    name: 'Stakeholder',
    description: 'Person or group with interest in the outcome',
    color: '#3b82f6',
    icon: 'Person',
  },
  role: {
    id: 'role',
    name: 'Role',
    description: 'Functional perspective (e.g., Finance, Legal)',
    color: '#10b981',
    icon: 'Badge',
  },
  archetype: {
    id: 'archetype',
    name: 'Archetype',
    description: 'Thinking style (e.g., Skeptic, Optimist)',
    color: '#8b5cf6',
    icon: 'Psychology',
  },
  temporal: {
    id: 'temporal',
    name: 'Temporal',
    description: 'Time-based view (e.g., Future self, Past self)',
    color: '#f59e0b',
    icon: 'AccessTime',
  },
  external: {
    id: 'external',
    name: 'External',
    description: 'Outside observer (e.g., Competitor, Regulator)',
    color: '#ef4444',
    icon: 'Public',
  },
};

export const PERSPECTIVE_ARCHETYPES = [
  { id: 'devil_advocate', name: 'Devil\'s Advocate', description: 'Challenges assumptions', icon: 'Gavel' },
  { id: 'optimist', name: 'Optimist', description: 'Sees opportunities', icon: 'WbSunny' },
  { id: 'pessimist', name: 'Pessimist', description: 'Identifies risks', icon: 'Cloud' },
  { id: 'pragmatist', name: 'Pragmatist', description: 'Focuses on what\'s achievable', icon: 'Build' },
  { id: 'visionary', name: 'Visionary', description: 'Thinks long-term', icon: 'Explore' },
  { id: 'analyst', name: 'Analyst', description: 'Wants data and evidence', icon: 'Analytics' },
  { id: 'customer', name: 'Customer', description: 'End-user perspective', icon: 'SupportAgent' },
  { id: 'competitor', name: 'Competitor', description: 'How rivals might respond', icon: 'Sports' },
];

// ============================================================================
// DECISION READINESS SPACE
// ============================================================================

export const REVERSIBILITY_LEVELS = {
  easily_reversible: {
    id: 'easily_reversible',
    name: 'Easily Reversible',
    description: 'Can undo with minimal cost',
    color: '#10b981',
    riskFactor: 0.2,
    guidance: 'Low stakes - can experiment and iterate',
  },
  reversible_with_cost: {
    id: 'reversible_with_cost',
    name: 'Reversible with Cost',
    description: 'Can undo but with significant effort or expense',
    color: '#f59e0b',
    riskFactor: 0.5,
    guidance: 'Moderate stakes - worth more analysis',
  },
  difficult_to_reverse: {
    id: 'difficult_to_reverse',
    name: 'Difficult to Reverse',
    description: 'Very hard to undo once committed',
    color: '#ef4444',
    riskFactor: 0.8,
    guidance: 'High stakes - need high confidence',
  },
  irreversible: {
    id: 'irreversible',
    name: 'Irreversible',
    description: 'Cannot be undone',
    color: '#7f1d1d',
    riskFactor: 1.0,
    guidance: 'One-way door - ensure thorough reasoning',
  },
};

export const DECISION_OUTCOMES = {
  proceed: {
    id: 'proceed',
    name: 'Proceed',
    description: 'Decision made, moving forward',
    color: '#10b981',
    icon: 'PlayArrow',
  },
  defer: {
    id: 'defer',
    name: 'Defer',
    description: 'Not ready to decide, need more information',
    color: '#f59e0b',
    icon: 'Pause',
  },
  decline: {
    id: 'decline',
    name: 'Decline',
    description: 'Decided not to proceed',
    color: '#ef4444',
    icon: 'Close',
  },
  escalate: {
    id: 'escalate',
    name: 'Escalate',
    description: 'Needs higher authority or broader input',
    color: '#8b5cf6',
    icon: 'ArrowUpward',
  },
  split: {
    id: 'split',
    name: 'Split',
    description: 'Breaking into smaller decisions',
    color: '#3b82f6',
    icon: 'CallSplit',
  },
};

export const READINESS_THRESHOLDS = {
  not_ready: { min: 0, max: 0.3, label: 'Not Ready', color: '#ef4444', guidance: 'Significant gaps in understanding' },
  needs_work: { min: 0.3, max: 0.5, label: 'Needs Work', color: '#f59e0b', guidance: 'Some important unknowns remain' },
  approaching: { min: 0.5, max: 0.7, label: 'Approaching', color: '#eab308', guidance: 'Getting closer, address key gaps' },
  ready: { min: 0.7, max: 0.85, label: 'Ready', color: '#84cc16', guidance: 'Reasonable confidence to proceed' },
  high_confidence: { min: 0.85, max: 1.0, label: 'High Confidence', color: '#10b981', guidance: 'Strong foundation for decision' },
};

// ============================================================================
// CROSS-SPACE CONNECTIONS
// ============================================================================

export const CONNECTION_TYPES = {
  informs: {
    id: 'informs',
    name: 'Informs',
    description: 'This element provides input to another',
    color: '#3b82f6',
  },
  contradicts: {
    id: 'contradicts',
    name: 'Contradicts',
    description: 'These elements are in tension',
    color: '#ef4444',
  },
  supports: {
    id: 'supports',
    name: 'Supports',
    description: 'This element strengthens another',
    color: '#10b981',
  },
  derived_from: {
    id: 'derived_from',
    name: 'Derived From',
    description: 'This element was created from another',
    color: '#8b5cf6',
  },
  raises: {
    id: 'raises',
    name: 'Raises',
    description: 'This element surfaces a new question or issue',
    color: '#f59e0b',
  },
  resolves: {
    id: 'resolves',
    name: 'Resolves',
    description: 'This element addresses or answers another',
    color: '#06b6d4',
  },
};

// ============================================================================
// COACHING SYSTEM
// ============================================================================

export const COACHING_TRIGGERS = {
  // Questions Space
  many_unanswered: {
    id: 'many_unanswered',
    space: 'questions',
    condition: 'More than 10 questions at surfaced maturity',
    message: 'You have many open questions. Consider which are most critical to explore first.',
    suggestedAction: 'Prioritize 3-5 questions to focus on',
    severity: 'info',
  },
  all_same_type: {
    id: 'all_same_type',
    space: 'questions',
    condition: 'All questions are the same type',
    message: 'Your questions are all {type}. Different question types reveal different insights.',
    suggestedAction: 'Try adding causal or hypothetical questions',
    severity: 'suggestion',
  },
  no_strategic_questions: {
    id: 'no_strategic_questions',
    space: 'questions',
    condition: 'No strategic questions after 30 minutes',
    message: 'No "what should we do" questions yet. Are you avoiding the hard decisions?',
    suggestedAction: 'Consider what actions you\'re contemplating',
    severity: 'gentle_nudge',
  },

  // Frames Space
  no_complication: {
    id: 'no_complication',
    space: 'frames',
    condition: 'Situation defined but no complication',
    message: 'You\'ve described the situation but not why it\'s problematic. What makes this a problem?',
    suggestedAction: 'Add a complication element',
    severity: 'suggestion',
  },
  no_boundary: {
    id: 'no_boundary',
    space: 'frames',
    condition: 'Frame has no boundaries defined',
    message: 'What\'s explicitly out of scope? Boundaries help focus reasoning.',
    suggestedAction: 'Define what you\'re NOT trying to solve',
    severity: 'info',
  },
  jumping_to_action: {
    id: 'jumping_to_action',
    space: 'frames',
    condition: 'Action defined without situation/complication',
    message: 'You\'ve jumped to actions without framing the problem. Solutions without clear problems often miss the mark.',
    suggestedAction: 'Step back and define the situation first',
    severity: 'warning',
  },

  // Parallel States Space
  only_one_state: {
    id: 'only_one_state',
    space: 'parallel',
    condition: 'Only one parallel state exists',
    message: 'You\'re holding only one possibility. What other futures could unfold?',
    suggestedAction: 'Add at least one alternative scenario',
    severity: 'suggestion',
  },
  no_feared_state: {
    id: 'no_feared_state',
    space: 'parallel',
    condition: 'No feared state defined',
    message: 'No downside scenarios explored. What could go wrong?',
    suggestedAction: 'Add a feared state to stress-test your thinking',
    severity: 'info',
  },
  premature_convergence: {
    id: 'premature_convergence',
    space: 'parallel',
    condition: 'States collapsed to one very early',
    message: 'You\'ve converged quickly. Are you certain other possibilities don\'t exist?',
    suggestedAction: 'Reopen at least one alternative before committing',
    severity: 'gentle_nudge',
  },

  // Systems Space
  no_feedback_loops: {
    id: 'no_feedback_loops',
    space: 'systems',
    condition: 'Links exist but no loops identified',
    message: 'You have causal links but no feedback loops. Most real systems have circular causality.',
    suggestedAction: 'Look for chains that loop back on themselves',
    severity: 'suggestion',
  },
  all_positive_links: {
    id: 'all_positive_links',
    space: 'systems',
    condition: 'All links are positive polarity',
    message: 'All your links are positive. Real systems have opposing forces too.',
    suggestedAction: 'Consider what factors work against each other',
    severity: 'info',
  },
  no_levers: {
    id: 'no_levers',
    space: 'systems',
    condition: 'System map has no lever nodes',
    message: 'Your map has no levers - things you can directly influence. Where can you intervene?',
    suggestedAction: 'Identify which variables you can control',
    severity: 'suggestion',
  },

  // Perspectives Space
  too_few_perspectives: {
    id: 'too_few_perspectives',
    space: 'perspectives',
    condition: 'Fewer than 3 perspectives after 20 minutes',
    message: 'Only a few viewpoints explored. Who else might see this differently?',
    suggestedAction: 'Add perspectives from different stakeholder groups',
    severity: 'suggestion',
  },
  no_opposing_view: {
    id: 'no_opposing_view',
    space: 'perspectives',
    condition: 'All perspectives agree',
    message: 'Everyone agrees? That\'s suspicious. Who might push back?',
    suggestedAction: 'Add a devil\'s advocate or skeptic perspective',
    severity: 'warning',
  },
  missing_customer: {
    id: 'missing_customer',
    space: 'perspectives',
    condition: 'No customer/end-user perspective',
    message: 'No customer perspective included. How will this affect the people you serve?',
    suggestedAction: 'Add an end-user or customer viewpoint',
    severity: 'info',
  },

  // Decisions Space
  decision_without_reasoning: {
    id: 'decision_without_reasoning',
    space: 'decisions',
    condition: 'Decision created with minimal connections to other spaces',
    message: 'This decision has little connected reasoning. What\'s it based on?',
    suggestedAction: 'Link to questions answered, perspectives considered, etc.',
    severity: 'warning',
  },
  many_assumptions: {
    id: 'many_assumptions',
    space: 'decisions',
    condition: 'Decision has more than 5 untested assumptions',
    message: 'Many assumptions underlying this decision. Which are most critical to validate?',
    suggestedAction: 'Identify top 3 assumptions to test first',
    severity: 'suggestion',
  },
  low_readiness_proceed: {
    id: 'low_readiness_proceed',
    space: 'decisions',
    condition: 'Proceeding with readiness below 50%',
    message: 'Proceeding with low confidence. Is this intentional?',
    suggestedAction: 'Review what gaps remain and whether they matter',
    severity: 'warning',
  },
};

export const COACHING_SEVERITY = {
  info: { color: '#3b82f6', icon: 'Info' },
  suggestion: { color: '#8b5cf6', icon: 'Lightbulb' },
  gentle_nudge: { color: '#f59e0b', icon: 'EmojiObjects' },
  warning: { color: '#ef4444', icon: 'Warning' },
};

// ============================================================================
// SESSION CONFIGURATION
// ============================================================================

export const SESSION_MODES = {
  solo: {
    id: 'solo',
    name: 'Solo',
    description: 'Individual reasoning session',
    icon: 'Person',
    maxParticipants: 1,
  },
  collaborative: {
    id: 'collaborative',
    name: 'Collaborative',
    description: 'Team reasoning together',
    icon: 'Group',
    maxParticipants: 10,
  },
  facilitated: {
    id: 'facilitated',
    name: 'Facilitated',
    description: 'Guided by a facilitator',
    icon: 'RecordVoiceOver',
    maxParticipants: 20,
  },
};

export const SESSION_INTENTS = {
  understand: {
    id: 'understand',
    name: 'Understand Something',
    description: 'Explore and make sense of a complex situation',
    suggestedStartSpace: 'questions',
    icon: 'Psychology',
  },
  decide: {
    id: 'decide',
    name: 'Make a Decision',
    description: 'Work through a choice or commitment',
    suggestedStartSpace: 'frames',
    icon: 'Gavel',
  },
  explain: {
    id: 'explain',
    name: 'Explain a Position',
    description: 'Build reasoning to communicate to others',
    suggestedStartSpace: 'frames',
    icon: 'Chat',
  },
  explore: {
    id: 'explore',
    name: 'Explore Possibilities',
    description: 'Think through scenarios and options',
    suggestedStartSpace: 'parallel',
    icon: 'Explore',
  },
  analyze: {
    id: 'analyze',
    name: 'Analyze a System',
    description: 'Understand how things connect and influence each other',
    suggestedStartSpace: 'systems',
    icon: 'AccountTree',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate decision readiness score based on knows/unknowns/assumptions
 */
export function calculateReadinessScore(decision) {
  if (!decision) return 0;

  const { knows = [], unknowns = [], assumptions = [], criteria = [] } = decision;

  // Base calculation
  const knowsCount = knows.length;
  const unknownsCount = unknowns.filter(u => !u.resolved).length;
  const assumptionsCount = assumptions.filter(a => !a.validated).length;
  const criteriaMetCount = criteria.filter(c => c.met).length;
  const totalCriteria = criteria.length || 1;

  // Weights
  const knowsWeight = 0.3;
  const unknownsWeight = 0.3;
  const assumptionsWeight = 0.2;
  const criteriaWeight = 0.2;

  // Calculate components
  const knowsScore = Math.min(knowsCount / 5, 1); // Max out at 5 knows
  const unknownsScore = Math.max(1 - (unknownsCount / 5), 0); // Penalty for unknowns
  const assumptionsScore = Math.max(1 - (assumptionsCount / 5), 0); // Penalty for untested assumptions
  const criteriaScore = criteriaMetCount / totalCriteria;

  const rawScore =
    (knowsScore * knowsWeight) +
    (unknownsScore * unknownsWeight) +
    (assumptionsScore * assumptionsWeight) +
    (criteriaScore * criteriaWeight);

  return Math.round(rawScore * 100) / 100;
}

/**
 * Get readiness level from score
 */
export function getReadinessLevel(score) {
  for (const [key, threshold] of Object.entries(READINESS_THRESHOLDS)) {
    if (score >= threshold.min && score < threshold.max) {
      return { key, ...threshold };
    }
  }
  return READINESS_THRESHOLDS.high_confidence;
}

/**
 * Suggest next space based on current session state
 */
export function getSuggestedNextSpace(sessionState) {
  const { currentSpace, spaceCounts = {}, timeInSpaces = {} } = sessionState;

  // If just started, suggest based on intent
  const totalElements = Object.values(spaceCounts).reduce((a, b) => a + b, 0);
  if (totalElements < 3) {
    return sessionState.intent
      ? SESSION_INTENTS[sessionState.intent]?.suggestedStartSpace
      : 'questions';
  }

  // Suggest based on gaps
  if (!spaceCounts.frames && spaceCounts.questions > 3) {
    return { space: 'frames', reason: 'You have questions but no problem frame yet' };
  }

  if (!spaceCounts.perspectives && spaceCounts.frames > 0) {
    return { space: 'perspectives', reason: 'Consider how others see this problem' };
  }

  if (!spaceCounts.systems && spaceCounts.questions > 5) {
    return { space: 'systems', reason: 'Map the causal relationships' };
  }

  if (!spaceCounts.parallel && spaceCounts.frames > 0 && !spaceCounts.decisions) {
    return { space: 'parallel', reason: 'Explore alternative futures before deciding' };
  }

  // Default flow
  const spaceOrder = ['questions', 'frames', 'parallel', 'systems', 'perspectives', 'decisions'];
  const currentIndex = spaceOrder.indexOf(currentSpace);
  if (currentIndex < spaceOrder.length - 1) {
    return { space: spaceOrder[currentIndex + 1], reason: 'Continue building your reasoning' };
  }

  return null;
}

/**
 * Detect coaching triggers based on session state
 */
export function detectCoachingTriggers(sessionState, elements) {
  const triggers = [];
  const { currentSpace, spaceCounts = {}, sessionDurationMinutes = 0 } = sessionState;

  // Questions space triggers
  if (currentSpace === 'questions') {
    const questions = elements.questions || [];
    const surfacedCount = questions.filter(q => q.maturity === 'surfaced').length;
    if (surfacedCount > 10) {
      triggers.push({ ...COACHING_TRIGGERS.many_unanswered, data: { count: surfacedCount } });
    }

    const types = [...new Set(questions.map(q => q.question_type))];
    if (types.length === 1 && questions.length > 3) {
      triggers.push({ ...COACHING_TRIGGERS.all_same_type, data: { type: types[0] } });
    }

    const hasStrategic = questions.some(q => q.question_type === 'strategic');
    if (!hasStrategic && sessionDurationMinutes > 30 && questions.length > 5) {
      triggers.push(COACHING_TRIGGERS.no_strategic_questions);
    }
  }

  // Frames space triggers
  if (currentSpace === 'frames') {
    const frames = elements.frames || [];
    const frameElements = elements.frameElements || [];

    const hasComplication = frameElements.some(e => e.frame_type === 'complication');
    const hasSituation = frameElements.some(e => e.frame_type === 'situation');
    const hasAction = frameElements.some(e => e.frame_type === 'action');

    if (hasSituation && !hasComplication && frames.length > 0) {
      triggers.push(COACHING_TRIGGERS.no_complication);
    }

    if (hasAction && !hasSituation && !hasComplication) {
      triggers.push(COACHING_TRIGGERS.jumping_to_action);
    }

    const hasBoundary = frameElements.some(e => e.frame_type === 'boundary');
    if (frames.length > 0 && !hasBoundary && frameElements.length > 3) {
      triggers.push(COACHING_TRIGGERS.no_boundary);
    }
  }

  // Parallel states triggers
  if (currentSpace === 'parallel') {
    const states = elements.parallelStates || [];
    if (states.length === 1 && sessionDurationMinutes > 10) {
      triggers.push(COACHING_TRIGGERS.only_one_state);
    }

    const hasFeared = states.some(s => s.state_type === 'feared');
    if (!hasFeared && states.length > 2) {
      triggers.push(COACHING_TRIGGERS.no_feared_state);
    }
  }

  // Systems space triggers
  if (currentSpace === 'systems') {
    const nodes = elements.systemNodes || [];
    const links = elements.causalLinks || [];
    const loops = elements.feedbackLoops || [];

    if (links.length > 3 && loops.length === 0) {
      triggers.push(COACHING_TRIGGERS.no_feedback_loops);
    }

    const allPositive = links.every(l => l.polarity === 'positive');
    if (allPositive && links.length > 3) {
      triggers.push(COACHING_TRIGGERS.all_positive_links);
    }

    const hasLevers = nodes.some(n => n.node_type === 'lever');
    if (!hasLevers && nodes.length > 5) {
      triggers.push(COACHING_TRIGGERS.no_levers);
    }
  }

  // Perspectives space triggers
  if (currentSpace === 'perspectives') {
    const perspectives = elements.perspectives || [];

    if (perspectives.length < 3 && sessionDurationMinutes > 20) {
      triggers.push(COACHING_TRIGGERS.too_few_perspectives);
    }

    const hasCustomer = perspectives.some(p =>
      p.perspective_type === 'stakeholder' &&
      p.name?.toLowerCase().includes('customer')
    );
    if (!hasCustomer && perspectives.length > 2) {
      triggers.push(COACHING_TRIGGERS.missing_customer);
    }
  }

  // Decisions space triggers
  if (currentSpace === 'decisions') {
    const decisions = elements.decisions || [];

    decisions.forEach(d => {
      const assumptions = d.assumptions || [];
      const untestedCount = assumptions.filter(a => !a.validated).length;
      if (untestedCount > 5) {
        triggers.push({ ...COACHING_TRIGGERS.many_assumptions, data: { decisionId: d.id, count: untestedCount } });
      }

      const readiness = calculateReadinessScore(d);
      if (d.outcome === 'proceed' && readiness < 0.5) {
        triggers.push({ ...COACHING_TRIGGERS.low_readiness_proceed, data: { decisionId: d.id, readiness } });
      }
    });
  }

  return triggers;
}

/**
 * Get space suggestions based on element type
 */
export function getSpaceSuggestionsForElement(elementType, currentSpace) {
  const suggestions = [];

  switch (elementType) {
    case 'question':
      if (currentSpace !== 'frames') {
        suggestions.push({ space: 'frames', reason: 'Frame this as a problem to solve' });
      }
      break;
    case 'assumption':
      suggestions.push({ space: 'questions', reason: 'Turn this into questions to explore' });
      suggestions.push({ space: 'parallel', reason: 'Create scenarios where this assumption is wrong' });
      break;
    case 'variable':
    case 'node':
      suggestions.push({ space: 'questions', reason: 'What questions does this raise?' });
      suggestions.push({ space: 'perspectives', reason: 'How do different stakeholders view this?' });
      break;
    case 'state':
      suggestions.push({ space: 'decisions', reason: 'What decisions would lead to this state?' });
      suggestions.push({ space: 'systems', reason: 'What dynamics create this outcome?' });
      break;
    default:
      break;
  }

  return suggestions;
}

/**
 * Format time duration for display
 */
export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Get color for score value
 */
export function getScoreColor(score) {
  if (score >= 0.7) return '#10b981';
  if (score >= 0.5) return '#f59e0b';
  if (score >= 0.3) return '#ef4444';
  return '#6b7280';
}

/**
 * Generate a unique element ID
 */
export function generateElementId(prefix = 'elem') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// DATABASE SCHEMA DEFINITIONS
// These define the EXACT structure of database tables.
// Any changes here should be reflected in init-srs.js and lib/pg.js
// ============================================================================

/**
 * SRS Session schema - matches srs_sessions table
 */
export const SRS_SESSION_SCHEMA = {
  tableName: 'srs_sessions',
  fields: {
    id: { type: 'serial', primary: true },
    project_id: { type: 'uuid', required: true },
    owner_id: { type: 'string', required: true },
    title: { type: 'string', required: true, maxLength: 500 },
    intent: { type: 'string', default: 'understand', enum: SESSION_INTENTS },
    mode: { type: 'string', default: 'solo', enum: SESSION_MODES },
    context: { type: 'text' },
    current_space: { type: 'string', default: 'questions' },
    status: { type: 'string', default: 'active' },
    duration_minutes: { type: 'integer', default: 0 },
    custom_fields: { type: 'jsonb', default: {} },
    created_at: { type: 'timestamp', auto: true },
    updated_at: { type: 'timestamp', auto: true },
  },
};

/**
 * SRS Questions schema - matches srs_questions table
 */
export const SRS_QUESTIONS_SCHEMA = {
  tableName: 'srs_questions',
  fields: {
    id: { type: 'serial', primary: true },
    session_id: { type: 'integer', required: true, references: 'srs_sessions' },
    content: { type: 'text', required: true },
    question_type: { type: 'string', default: 'open', enum: QUESTION_TYPES },
    maturity: { type: 'string', default: 'raw', enum: QUESTION_MATURITY },
    assumptions: { type: 'jsonb', default: [] },
    x: { type: 'real', default: 100 },
    y: { type: 'real', default: 100 },
    custom_fields: { type: 'jsonb', default: {} },
    created_at: { type: 'timestamp', auto: true },
    updated_at: { type: 'timestamp', auto: true },
  },
};

/**
 * SRS Frames schema - matches srs_frames table
 */
export const SRS_FRAMES_SCHEMA = {
  tableName: 'srs_frames',
  fields: {
    id: { type: 'serial', primary: true },
    session_id: { type: 'integer', required: true, references: 'srs_sessions' },
    name: { type: 'string', required: true, maxLength: 255 },
    description: { type: 'text' },
    elements: { type: 'jsonb', default: [] },
    challenged_elements: { type: 'jsonb', default: [] },
    frame_source: { type: 'string', maxLength: 100 },
    confidence: { type: 'string', default: 'untested' },
    x: { type: 'real', default: 100 },
    y: { type: 'real', default: 100 },
    custom_fields: { type: 'jsonb', default: {} },
    created_at: { type: 'timestamp', auto: true },
    updated_at: { type: 'timestamp', auto: true },
  },
};

/**
 * SRS Frame Elements schema - matches srs_frame_elements table
 */
export const SRS_FRAME_ELEMENTS_SCHEMA = {
  tableName: 'srs_frame_elements',
  fields: {
    id: { type: 'serial', primary: true },
    frame_id: { type: 'integer', required: true, references: 'srs_frames' },
    element_type: { type: 'string', required: true },
    content: { type: 'text', required: true },
    challenged: { type: 'boolean', default: false },
    challenge_reason: { type: 'text' },
    position_order: { type: 'integer', default: 0 },
    created_at: { type: 'timestamp', auto: true },
    updated_at: { type: 'timestamp', auto: true },
  },
};

/**
 * SRS Parallel States schema - matches srs_parallel_states table
 */
export const SRS_PARALLEL_STATES_SCHEMA = {
  tableName: 'srs_parallel_states',
  fields: {
    id: { type: 'serial', primary: true },
    session_id: { type: 'integer', required: true, references: 'srs_sessions' },
    title: { type: 'string', required: true, maxLength: 255 },
    description: { type: 'text' },
    state_type: { type: 'string', default: 'expected', enum: STATE_TYPES },
    probability: { type: 'string', default: 'medium' },
    confidence: { type: 'real', default: 0.5 },
    evidence: { type: 'jsonb', default: [] },
    implications: { type: 'jsonb', default: [] },
    is_collapsed: { type: 'boolean', default: false },
    is_ruled_out: { type: 'boolean', default: false },
    collapse_reason: { type: 'text' },
    position_order: { type: 'integer', default: 0 },
    x: { type: 'real', default: 100 },
    y: { type: 'real', default: 100 },
    custom_fields: { type: 'jsonb', default: {} },
    created_at: { type: 'timestamp', auto: true },
    updated_at: { type: 'timestamp', auto: true },
  },
};

/**
 * SRS System Nodes schema - matches srs_system_nodes table
 */
export const SRS_SYSTEM_NODES_SCHEMA = {
  tableName: 'srs_system_nodes',
  fields: {
    id: { type: 'serial', primary: true },
    session_id: { type: 'integer', required: true, references: 'srs_sessions' },
    name: { type: 'string', required: true, maxLength: 255 },
    node_type: { type: 'string', default: 'variable', enum: SYSTEM_NODE_TYPES },
    description: { type: 'text' },
    x: { type: 'real', default: 100 },
    y: { type: 'real', default: 100 },
    custom_fields: { type: 'jsonb', default: {} },
    created_at: { type: 'timestamp', auto: true },
    updated_at: { type: 'timestamp', auto: true },
  },
};

/**
 * SRS Causal Links schema - matches srs_causal_links table
 */
export const SRS_CAUSAL_LINKS_SCHEMA = {
  tableName: 'srs_causal_links',
  fields: {
    id: { type: 'serial', primary: true },
    session_id: { type: 'integer', required: true, references: 'srs_sessions' },
    from_node_id: { type: 'integer', required: true, references: 'srs_system_nodes' },
    to_node_id: { type: 'integer', required: true, references: 'srs_system_nodes' },
    polarity: { type: 'string', default: 'positive', enum: CAUSAL_POLARITIES },
    delay: { type: 'string', enum: TIME_DELAYS },
    description: { type: 'text' },
    created_at: { type: 'timestamp', auto: true },
  },
};

/**
 * SRS Feedback Loops schema - matches srs_feedback_loops table
 */
export const SRS_FEEDBACK_LOOPS_SCHEMA = {
  tableName: 'srs_feedback_loops',
  fields: {
    id: { type: 'serial', primary: true },
    session_id: { type: 'integer', required: true, references: 'srs_sessions' },
    name: { type: 'string', required: true, maxLength: 255 },
    loop_type: { type: 'string', default: 'reinforcing', enum: LOOP_TYPES },
    description: { type: 'text' },
    node_ids: { type: 'jsonb', default: [] },
    link_ids: { type: 'jsonb', default: [] },
    x: { type: 'real', default: 100 },
    y: { type: 'real', default: 100 },
    custom_fields: { type: 'jsonb', default: {} },
    created_at: { type: 'timestamp', auto: true },
    updated_at: { type: 'timestamp', auto: true },
  },
};

/**
 * SRS Perspectives schema - matches srs_perspectives table
 */
export const SRS_PERSPECTIVES_SCHEMA = {
  tableName: 'srs_perspectives',
  fields: {
    id: { type: 'serial', primary: true },
    session_id: { type: 'integer', required: true, references: 'srs_sessions' },
    stakeholder: { type: 'string', required: true, maxLength: 255 },
    viewpoint: { type: 'text' },
    interests: { type: 'jsonb', default: [] },
    concerns: { type: 'jsonb', default: [] },
    influence: { type: 'string', default: 'medium' },
    alignment: { type: 'string', default: 'neutral' },
    x: { type: 'real', default: 100 },
    y: { type: 'real', default: 100 },
    custom_fields: { type: 'jsonb', default: {} },
    created_at: { type: 'timestamp', auto: true },
    updated_at: { type: 'timestamp', auto: true },
  },
};

/**
 * SRS Decisions schema - matches srs_decisions table
 */
export const SRS_DECISIONS_SCHEMA = {
  tableName: 'srs_decisions',
  fields: {
    id: { type: 'serial', primary: true },
    session_id: { type: 'integer', required: true, references: 'srs_sessions' },
    title: { type: 'string', required: true, maxLength: 255 },
    description: { type: 'text' },
    options: { type: 'jsonb', default: [] },
    chosen_option: { type: 'integer' },
    rationale: { type: 'text' },
    readiness_score: { type: 'real', default: 0 },
    status: { type: 'string', default: 'pending' },
    reversibility: { type: 'string', default: 'reversible_with_cost', enum: REVERSIBILITY_LEVELS },
    stakes: { type: 'string', default: 'medium' },
    deadline: { type: 'timestamp' },
    outcome: { type: 'string', enum: DECISION_OUTCOMES },
    outcome_rationale: { type: 'text' },
    success_criteria: { type: 'jsonb', default: [] },
    knows: { type: 'jsonb', default: [] },
    unknowns: { type: 'jsonb', default: [] },
    x: { type: 'real', default: 100 },
    y: { type: 'real', default: 100 },
    custom_fields: { type: 'jsonb', default: {} },
    created_at: { type: 'timestamp', auto: true },
    updated_at: { type: 'timestamp', auto: true },
  },
};

/**
 * SRS Connections schema - matches srs_connections table
 */
export const SRS_CONNECTIONS_SCHEMA = {
  tableName: 'srs_connections',
  fields: {
    id: { type: 'serial', primary: true },
    session_id: { type: 'integer', required: true, references: 'srs_sessions' },
    from_space: { type: 'string', required: true },
    from_element_id: { type: 'integer', required: true },
    to_space: { type: 'string', required: true },
    to_element_id: { type: 'integer', required: true },
    connection_type: { type: 'string', default: 'related', enum: CONNECTION_TYPES },
    label: { type: 'string', maxLength: 255 },
    description: { type: 'text' },
    created_at: { type: 'timestamp', auto: true },
  },
};

/**
 * Table name to schema mapping for API validation
 */
export const TABLE_TO_SCHEMA = {
  srs_sessions: SRS_SESSION_SCHEMA,
  srs_questions: SRS_QUESTIONS_SCHEMA,
  srs_frames: SRS_FRAMES_SCHEMA,
  srs_frame_elements: SRS_FRAME_ELEMENTS_SCHEMA,
  srs_parallel_states: SRS_PARALLEL_STATES_SCHEMA,
  srs_system_nodes: SRS_SYSTEM_NODES_SCHEMA,
  srs_causal_links: SRS_CAUSAL_LINKS_SCHEMA,
  srs_feedback_loops: SRS_FEEDBACK_LOOPS_SCHEMA,
  srs_perspectives: SRS_PERSPECTIVES_SCHEMA,
  srs_decisions: SRS_DECISIONS_SCHEMA,
  srs_connections: SRS_CONNECTIONS_SCHEMA,
};

/**
 * Get default values for a schema
 * @param {Object} schema - Schema definition
 * @returns {Object} Default values object
 */
export function getSchemaDefaults(schema) {
  const defaults = {};
  for (const [field, def] of Object.entries(schema.fields)) {
    if (def.default !== undefined && !def.auto && !def.primary) {
      defaults[field] = typeof def.default === 'object'
        ? JSON.parse(JSON.stringify(def.default))
        : def.default;
    }
  }
  return defaults;
}

/**
 * Validate data against a schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Schema definition
 * @param {boolean} isCreate - Whether this is a create operation (enforces required fields)
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateAgainstSchema(data, schema, isCreate = true) {
  const errors = [];

  for (const [field, def] of Object.entries(schema.fields)) {
    // Skip auto-generated and primary key fields
    if (def.auto || def.primary) continue;

    const value = data[field];

    // Check required fields (only on create)
    if (isCreate && def.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip validation for undefined optional fields
    if (value === undefined || value === null) continue;

    // Type validation
    switch (def.type) {
      case 'string':
      case 'text':
        if (typeof value !== 'string') {
          errors.push(`${field} must be a string`);
        }
        break;
      case 'integer':
        if (!Number.isInteger(value)) {
          errors.push(`${field} must be an integer`);
        }
        break;
      case 'real':
        if (typeof value !== 'number') {
          errors.push(`${field} must be a number`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${field} must be a boolean`);
        }
        break;
      case 'jsonb':
        if (typeof value !== 'object') {
          errors.push(`${field} must be an object or array`);
        }
        break;
    }

    // Max length validation
    if (def.maxLength && typeof value === 'string' && value.length > def.maxLength) {
      errors.push(`${field} exceeds maximum length of ${def.maxLength}`);
    }

    // Enum validation
    if (def.enum && typeof value === 'string' && !Object.keys(def.enum).includes(value)) {
      errors.push(`${field} must be one of: ${Object.keys(def.enum).join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
