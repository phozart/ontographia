// lib/dwd-principles.js
// MIT Dynamic Work Design Principles (Repenning/Kieffer)
// Reference: https://bigthink.com/business/the-5-core-principles-of-dynamic-work-design/

// =============================================================================
// THE 5 DYNAMIC WORK DESIGN PRINCIPLES
// =============================================================================

export const DWD_PRINCIPLES = [
  {
    id: 'solve_right_problem',
    number: 1,
    name: 'Solve the Right Problem',
    shortName: 'Right Problem',
    icon: 'Target',
    color: '#ef4444', // red - foundational
    definition: 'Formulate a problem statement isolated from any possible diagnoses',
    keyInsight: 'Before jumping to solutions, clarify the core issue without assuming what causes it. This prevents teams from treating symptoms rather than root causes.',
    diagnosticQuestions: [
      'What is the actual problem, separate from assumed causes?',
      'Are we describing symptoms or the underlying issue?',
      'Have we separated "what is happening" from "why it might be happening"?',
      'Can we state the problem without blaming a person or team?',
      'Would different people describe this problem the same way?',
    ],
    goodExamples: [
      { text: 'Customer complaints are taking 5x longer to resolve than 6 months ago', why: 'Specific, measurable, blame-free' },
      { text: 'Handover confirmations are missing in 40% of cases', why: 'Quantified, focused on structure' },
      { text: 'Decisions requiring sign-off wait an average of 3 days', why: 'Observable, measurable delay' },
      { text: 'The same issues keep recurring after we "fix" them', why: 'Pattern-focused, not incident-focused' },
    ],
    poorExamples: [
      { text: 'The team is lazy and slow', why: 'Blames people, not structure' },
      { text: 'Management doesn\'t care about us', why: 'Attribution without evidence' },
      { text: 'The process is broken', why: 'Too vague, no specific symptoms' },
      { text: 'We need better communication', why: 'Solution masquerading as problem' },
    ],
    relatedArtefacts: ['dwd_case', 'dwd_signal'],
    relatedViews: ['case_browser', 'overview'],
    checklistItems: [
      'Problem stated without naming causes',
      'No individual blamed',
      'Symptoms are observable and specific',
      'Multiple people would describe it similarly',
    ],
  },
  {
    id: 'structure_for_discovery',
    number: 2,
    name: 'Structure for Discovery',
    shortName: 'Discovery',
    icon: 'Lightbulb',
    color: '#f59e0b', // amber - learning
    definition: 'Ensure everyone knows why they\'re doing the work, how it\'s going, and is engaged in improving it',
    keyInsight: 'Problems reveal weaknesses in systems and create opportunities for improvement. Welcome visible problems rather than hiding them.',
    diagnosticQuestions: [
      'Do team members understand the purpose behind their work?',
      'How transparent is progress visibility?',
      'Are people empowered to suggest improvements?',
      'Do problems surface quickly or stay hidden?',
      'Is learning from experiments celebrated, even when they fail?',
    ],
    goodExamples: [
      { text: 'Weekly 15-min retro: what slowed us down this week?', why: 'Regular reflection built into rhythm' },
      { text: 'Anyone can flag a signal without blame', why: 'Psychological safety for surfacing issues' },
      { text: 'Learning from failed adjustments is celebrated', why: 'Failure as learning, not punishment' },
      { text: 'Team knows how their work connects to customer outcomes', why: 'Purpose is visible' },
    ],
    poorExamples: [
      { text: 'Problems are hidden to avoid looking bad', why: 'Fear prevents discovery' },
      { text: 'Only managers can suggest process changes', why: 'Discovery limited to few' },
      { text: 'No mechanism to capture learnings', why: 'Knowledge lost' },
      { text: '"That\'s just how we do things here"', why: 'Status quo unquestioned' },
    ],
    relatedArtefacts: ['dwd_outcome', 'dwd_learning'],
    relatedViews: ['learning_capture', 'adjustment_log'],
    checklistItems: [
      'Purpose of work is clear to all',
      'Progress is visible',
      'Anyone can surface problems safely',
      'Learnings are captured and shared',
    ],
  },
  {
    id: 'connect_human_chain',
    number: 3,
    name: 'Connect the Human Chain',
    shortName: 'Human Chain',
    icon: 'Link',
    color: '#8b5cf6', // purple - connection
    definition: 'Ensure the right information is transferred from one person to the next',
    keyInsight: 'Humans excel at processing uncertainty and ambiguity, particularly in face-to-face communication. Use rich channels for ambiguous work, lean channels for routine.',
    diagnosticQuestions: [
      'What information must transfer between roles?',
      'Are handoffs clear and complete?',
      'Are communication gaps creating bottlenecks?',
      'Is uncertainty handled through rich channels (conversation) or lean ones (email)?',
      'Does the receiver confirm understanding before the sender moves on?',
    ],
    goodExamples: [
      { text: 'Handover checklist ensures nothing is missed', why: 'Structured transfer of information' },
      { text: 'Complex issues discussed in person, routine updates async', why: 'Channel matches uncertainty' },
      { text: 'Receiving party confirms understanding before sender moves on', why: 'Explicit confirmation' },
      { text: 'Problems reach those best positioned to solve them quickly', why: 'Short path to resolution' },
    ],
    poorExamples: [
      { text: 'Throw it over the wall and hope', why: 'No confirmation of receipt' },
      { text: 'Long email chains for ambiguous decisions', why: 'Wrong channel for uncertainty' },
      { text: 'No confirmation that handover was received', why: 'Silent failure possible' },
      { text: 'Information stuck in someone\'s head', why: 'Knowledge not flowing' },
    ],
    relatedArtefacts: ['dwd_actor', 'dwd_coordination_pattern'],
    relatedViews: ['work_actor_fit', 'fit_analysis'],
    checklistItems: [
      'Information flows match work uncertainty',
      'Handovers have explicit confirmation',
      'Problems reach solvers quickly',
      'No "throwing over the wall"',
    ],
  },
  {
    id: 'regulate_for_flow',
    number: 4,
    name: 'Regulate for Flow',
    shortName: 'Flow',
    icon: 'Speed',
    color: '#10b981', // green - flow
    definition: 'Allow new tasks to enter only when there is available capacity',
    keyInsight: 'Controlling intake prevents congestion that paradoxically slows overall output. Pacing work creates space for reflection and genuine problem-solving.',
    diagnosticQuestions: [
      'Is work entering faster than it can be processed?',
      'How do we measure available capacity?',
      'What mechanisms limit work intake?',
      'Are we constantly firefighting instead of improving?',
      'Do people have time to think, or are they always reacting?',
    ],
    goodExamples: [
      { text: 'WIP limits prevent overload', why: 'Explicit capacity management' },
      { text: 'New work queued until current work exits', why: 'Flow-based intake' },
      { text: 'Capacity explicitly considered before accepting new work', why: 'Proactive management' },
      { text: 'Team says "not now" to protect current work', why: 'Boundaries maintained' },
    ],
    poorExamples: [
      { text: 'Say yes to everything, figure it out later', why: 'No intake control' },
      { text: 'Heroes work overtime to absorb all demand', why: 'Unsustainable, hides problems' },
      { text: 'No visibility into current workload', why: 'Can\'t manage what you can\'t see' },
      { text: 'Everything is urgent, nothing gets finished', why: 'Thrashing, no flow' },
    ],
    relatedArtefacts: ['dwd_work_item', 'dwd_signal'],
    relatedViews: ['work_landscape', 'overview'],
    checklistItems: [
      'Capacity is visible and managed',
      'Intake is controlled',
      'People have time to improve, not just react',
      'Work in progress is limited',
    ],
  },
  {
    id: 'visualize_work',
    number: 5,
    name: 'Visualize the Work',
    shortName: 'Visualize',
    icon: 'Visibility',
    color: '#3b82f6', // blue - visibility
    definition: 'Create a visual management system showing status and location of each piece of work',
    keyInsight: 'The magic isn\'t in the sticky notes—it\'s the conversations you have in front of the board about why work is (or isn\'t) moving.',
    diagnosticQuestions: [
      'Can anyone see work status at a glance?',
      'Do visuals reveal bottlenecks?',
      'Is the system updated in real-time?',
      'Do teams gather around the visual to discuss flow?',
      'Are blocked items visually distinct?',
    ],
    goodExamples: [
      { text: 'Kanban board shows all work in progress', why: 'Full visibility of flow' },
      { text: 'Blocked items visually highlighted', why: 'Problems visible immediately' },
      { text: 'Daily standup in front of the board', why: 'Visual triggers conversation' },
      { text: 'Anyone walking by can see the state of work', why: 'Transparency to all' },
    ],
    poorExamples: [
      { text: 'Work status lives in someone\'s head', why: 'Not shareable' },
      { text: 'Spreadsheet updated weekly (if at all)', why: 'Stale, not real-time' },
      { text: 'Board exists but no one looks at it', why: 'Visual without the conversation' },
      { text: 'Need to ask someone to know what\'s happening', why: 'Knowledge locked away' },
    ],
    relatedArtefacts: ['dwd_work_item', 'dwd_adjustment'],
    relatedViews: ['work_landscape', 'adjustment_log'],
    checklistItems: [
      'Work status visible at a glance',
      'Bottlenecks are obvious',
      'Board triggers regular conversation',
      'Updates happen in real-time',
    ],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a principle by ID
 */
export function getPrinciple(principleId) {
  return DWD_PRINCIPLES.find(p => p.id === principleId);
}

/**
 * Get a principle by number (1-5)
 */
export function getPrincipleByNumber(number) {
  return DWD_PRINCIPLES.find(p => p.number === number);
}

/**
 * Get all principles as select options
 */
export function getPrincipleOptions() {
  return DWD_PRINCIPLES.map(p => ({
    value: p.id,
    label: `${p.number}. ${p.name}`,
    shortLabel: p.shortName,
    color: p.color,
  }));
}

/**
 * Get principles relevant to a specific artefact type
 */
export function getPrinciplesForArtefact(artefactType) {
  return DWD_PRINCIPLES.filter(p => p.relatedArtefacts.includes(artefactType));
}

/**
 * Get principles relevant to a specific view
 */
export function getPrinciplesForView(viewId) {
  return DWD_PRINCIPLES.filter(p => p.relatedViews.includes(viewId));
}

/**
 * Calculate principle alignment score for a case
 * Returns object with scores per principle and overall score
 */
export function calculatePrincipleAlignment(caseArtefact, relatedArtefacts, relationships) {
  const scores = {};

  // Principle 1: Solve the Right Problem
  // Check: Has signals, blame-free summary, specific symptoms
  const signals = relatedArtefacts.filter(a => a.artefact_type === 'dwd_signal');
  const hasSignals = signals.length > 0;
  const hasSummary = !!caseArtefact.custom_fields?.summary;
  const summaryBlamesFree = hasSummary && !containsBlameLanguage(caseArtefact.custom_fields.summary);
  scores.solve_right_problem = {
    score: (hasSignals ? 40 : 0) + (hasSummary ? 30 : 0) + (summaryBlamesFree ? 30 : 0),
    checks: { hasSignals, hasSummary, summaryBlamesFree },
  };

  // Principle 2: Structure for Discovery
  // Check: Has outcomes defined, has learnings captured
  const outcomes = relatedArtefacts.filter(a => a.artefact_type === 'dwd_outcome');
  const learnings = relatedArtefacts.filter(a => a.artefact_type === 'dwd_learning');
  const hasOutcomes = outcomes.length > 0;
  const hasLearnings = learnings.length > 0;
  scores.structure_for_discovery = {
    score: (hasOutcomes ? 50 : 0) + (hasLearnings ? 50 : 0),
    checks: { hasOutcomes, hasLearnings },
  };

  // Principle 3: Connect the Human Chain
  // Check: Has actors, has coordination patterns
  const actors = relatedArtefacts.filter(a => a.artefact_type === 'dwd_actor');
  const patterns = relatedArtefacts.filter(a => a.artefact_type === 'dwd_coordination_pattern');
  const hasActors = actors.length > 0;
  const hasPatterns = patterns.length > 0;
  scores.connect_human_chain = {
    score: (hasActors ? 50 : 0) + (hasPatterns ? 50 : 0),
    checks: { hasActors, hasPatterns },
  };

  // Principle 4: Regulate for Flow
  // Check: Has work items with volatility assessed
  const workItems = relatedArtefacts.filter(a => a.artefact_type === 'dwd_work_item');
  const hasWorkItems = workItems.length > 0;
  const workItemsHaveVolatility = workItems.length > 0 &&
    workItems.every(w => w.custom_fields?.volatility);
  scores.regulate_for_flow = {
    score: (hasWorkItems ? 50 : 0) + (workItemsHaveVolatility ? 50 : 0),
    checks: { hasWorkItems, workItemsHaveVolatility },
  };

  // Principle 5: Visualize the Work
  // Check: Work items have state, case is active (being used)
  const workItemsHaveState = workItems.length > 0 &&
    workItems.every(w => w.custom_fields?.item_state);
  const caseIsActive = ['active', 'observed', 'stabilised'].includes(caseArtefact.custom_fields?.case_status);
  scores.visualize_work = {
    score: (workItemsHaveState ? 50 : 0) + (caseIsActive ? 50 : 0),
    checks: { workItemsHaveState, caseIsActive },
  };

  // Calculate overall score
  const principleScores = Object.values(scores).map(s => s.score);
  const overallScore = Math.round(principleScores.reduce((a, b) => a + b, 0) / principleScores.length);

  return {
    principles: scores,
    overall: overallScore,
    level: overallScore >= 80 ? 'excellent' : overallScore >= 60 ? 'good' : overallScore >= 40 ? 'fair' : 'needs_work',
  };
}

/**
 * Simple check for blame language in text
 */
function containsBlameLanguage(text) {
  if (!text) return false;
  const blamePatterns = [
    /\b(lazy|incompetent|stupid|useless|don't care|doesn't care)\b/i,
    /\b(their fault|his fault|her fault|your fault)\b/i,
    /\b(always messes up|never does|refuses to)\b/i,
  ];
  return blamePatterns.some(pattern => pattern.test(text));
}

/**
 * Get suggestions for improving principle alignment
 */
export function getPrincipleAlignmentSuggestions(alignment) {
  const suggestions = [];

  Object.entries(alignment.principles).forEach(([principleId, data]) => {
    const principle = getPrinciple(principleId);
    if (data.score < 50) {
      const missingChecks = Object.entries(data.checks)
        .filter(([, passed]) => !passed)
        .map(([check]) => check);

      suggestions.push({
        principle: principle.name,
        principleNumber: principle.number,
        score: data.score,
        suggestions: missingChecks.map(check => getSuggestionForCheck(check)),
      });
    }
  });

  return suggestions.sort((a, b) => a.score - b.score);
}

function getSuggestionForCheck(check) {
  const suggestions = {
    hasSignals: 'Add at least one signal to clarify what stress or tension you observe',
    hasSummary: 'Write a summary describing the situation in blame-free terms',
    summaryBlamesFree: 'Revise summary to focus on structure, not people',
    hasOutcomes: 'Define what success looks like for this case',
    hasLearnings: 'Capture learnings from any adjustments you\'ve tried',
    hasActors: 'Add the actors (people, teams, systems) involved',
    hasPatterns: 'Document how work coordinates between actors',
    hasWorkItems: 'Add the work items (objects of coordination) involved',
    workItemsHaveVolatility: 'Assess volatility for each work item',
    workItemsHaveState: 'Set the current state for each work item',
    caseIsActive: 'Move the case from draft to active to start working on it',
  };
  return suggestions[check] || `Address: ${check}`;
}

// =============================================================================
// PRINCIPLE ICONS MAP
// =============================================================================

export const PRINCIPLE_ICONS = {
  solve_right_problem: 'Target',
  structure_for_discovery: 'Lightbulb',
  connect_human_chain: 'Link',
  regulate_for_flow: 'Speed',
  visualize_work: 'Visibility',
};

// =============================================================================
// PRINCIPLE SUMMARY FOR QUICK REFERENCE
// =============================================================================

export const PRINCIPLES_SUMMARY = {
  title: 'The 5 Principles of Dynamic Work Design',
  subtitle: 'Based on MIT research by Repenning & Kieffer',
  source: 'https://bigthink.com/business/the-5-core-principles-of-dynamic-work-design/',
  principles: DWD_PRINCIPLES.map(p => ({
    number: p.number,
    name: p.name,
    shortName: p.shortName,
    keyQuestion: p.diagnosticQuestions[0],
    color: p.color,
  })),
};
