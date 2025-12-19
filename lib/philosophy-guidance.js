// Philosophical & Critical Thinking Studio - Guidance System
// Provides contextual prompts, pattern-based suggestions, and self-guiding features

import { PHIL_LENSES, PHIL_ELEMENT_TYPES } from './philosophy-types';

/**
 * Pattern-based guidance suggestions
 * Computed from the current state of elements and inquiry
 */
export const PHIL_GUIDANCE_PATTERNS = {
  noConcepts: {
    id: 'noConcepts',
    priority: 1,
    condition: (elements) => {
      const claims = elements.filter(e => e.elementType === 'claim');
      const concepts = elements.filter(e => e.elementType === 'concept');
      return claims.length > 0 && concepts.length === 0;
    },
    message: 'You have claims but no defined concepts. What key terms need clarification?',
    detail: 'Clear thinking requires clear concepts. Define the terms you\'re using.',
    action: { label: 'Add Concept', type: 'concept' },
    suggestedLens: 'concept-clarification'
  },

  noArguments: {
    id: 'noArguments',
    priority: 1,
    condition: (elements) => {
      const claims = elements.filter(e => e.elementType === 'claim');
      const arguments_ = elements.filter(e => e.elementType === 'argument');
      return claims.length >= 2 && arguments_.length === 0;
    },
    message: 'Multiple claims but no structured arguments. How do these claims support each other?',
    detail: 'An argument connects premises to conclusions. Make the reasoning explicit.',
    action: { label: 'Add Argument', type: 'argument' },
    suggestedLens: 'argument-examination'
  },

  noCounterarguments: {
    id: 'noCounterarguments',
    priority: 2,
    condition: (elements) => {
      const arguments_ = elements.filter(e => e.elementType === 'argument');
      const counterarguments = elements.filter(e => e.elementType === 'counterargument');
      return arguments_.length > 0 && counterarguments.length === 0;
    },
    message: 'Arguments present but no challenges. What would a critic say?',
    detail: 'Test your arguments by finding the strongest objections.',
    action: { label: 'Add Counterargument', type: 'counterargument' },
    suggestedLens: 'counter-perspective'
  },

  noImplications: {
    id: 'noImplications',
    priority: 2,
    condition: (elements) => {
      const claims = elements.filter(e => e.elementType === 'claim');
      const implications = elements.filter(e => e.elementType === 'implication');
      return claims.length >= 2 && implications.length === 0;
    },
    message: 'What follows from these claims? Explore the implications.',
    detail: 'Trace the consequences - ethical, practical, and conceptual.',
    action: { label: 'Add Implication', type: 'implication' },
    suggestedLens: 'ethical-reasoning'
  },

  allDescriptive: {
    id: 'allDescriptive',
    priority: 2,
    condition: (elements) => {
      const claims = elements.filter(e => e.elementType === 'claim');
      const descriptive = claims.filter(e => e.subtype === 'descriptive' || !e.subtype);
      return claims.length >= 3 && descriptive.length === claims.length;
    },
    message: 'All claims are descriptive. Are there normative questions here?',
    detail: 'Philosophy often involves claims about what ought to be, not just what is.',
    action: { label: 'Add Normative Claim', type: 'claim' }
  },

  noBoundaries: {
    id: 'noBoundaries',
    priority: 3,
    condition: (elements) => {
      const concepts = elements.filter(e => e.elementType === 'concept');
      const claims = elements.filter(e => e.elementType === 'claim');
      const boundaries = elements.filter(e => e.elementType === 'boundary');
      return (concepts.length + claims.length) >= 3 && boundaries.length === 0;
    },
    message: 'No boundaries identified. Where do these concepts or claims stop applying?',
    detail: 'Understanding limits is as important as understanding scope.',
    action: { label: 'Add Boundary', type: 'boundary' },
    suggestedLens: 'limit-testing'
  },

  singlePerspective: {
    id: 'singlePerspective',
    priority: 2,
    condition: (elements) => {
      const perspectives = elements.filter(e => e.elementType === 'perspective');
      const claims = elements.filter(e => e.elementType === 'claim');
      return claims.length >= 4 && perspectives.length <= 1;
    },
    message: 'Consider multiple perspectives. How would different traditions approach this?',
    detail: 'Utilitarian, deontological, virtue ethics - what would each say?',
    action: { label: 'Add Perspective', type: 'perspective' },
    suggestedLens: 'counter-perspective'
  },

  hiddenAssumptions: {
    id: 'hiddenAssumptions',
    priority: 1,
    condition: (elements) => {
      const arguments_ = elements.filter(e => e.elementType === 'argument');
      const claims = elements.filter(e => e.elementType === 'claim');
      // Look for arguments with very few supporting claims
      return arguments_.length > 0 && claims.length < arguments_.length * 2;
    },
    message: 'Your arguments may have hidden assumptions. What\'s taken for granted?',
    detail: 'Most arguments rely on unstated premises. Make them explicit.',
    action: { label: 'Surface Assumption', type: 'claim' },
    suggestedLens: 'assumptions'
  },

  questionWithoutClaims: {
    id: 'questionWithoutClaims',
    priority: 1,
    condition: (elements) => {
      const questions = elements.filter(e => e.elementType === 'question');
      const claims = elements.filter(e => e.elementType === 'claim');
      return questions.length > 0 && claims.length === 0;
    },
    message: 'You have questions but no claims. What positions are possible?',
    detail: 'Start articulating possible answers, even tentative ones.',
    action: { label: 'Add Claim', type: 'claim' }
  }
};

/**
 * Empty state guidance for each lens
 */
export const PHIL_EMPTY_STATE_GUIDANCE = {
  'concept-clarification': {
    title: 'Clarify Your Concepts',
    icon: 'C',
    description: 'Good philosophy starts with clear concepts. Ambiguity is the enemy of understanding.',
    steps: [
      { action: 'Identify a key term', detail: 'What concept is central to your question?' },
      { action: 'Define it provisionally', detail: 'What do you currently mean by this?' },
      { action: 'Test the definition', detail: 'What does it include or exclude?' }
    ],
    quickStart: [
      { label: 'The key concept is...', type: 'concept' },
      { label: 'I mean by this...', type: 'concept' },
      { label: 'Others might define it as...', type: 'concept' }
    ]
  },

  'argument-examination': {
    title: 'Examine Arguments',
    icon: 'A',
    description: 'Break down reasoning into premises and conclusions. Test the logical structure.',
    steps: [
      { action: 'State a claim', detail: 'What is being asserted?' },
      { action: 'Identify premises', detail: 'What reasons support this claim?' },
      { action: 'Check validity', detail: 'Does the conclusion follow?' }
    ],
    quickStart: [
      { label: 'The claim is...', type: 'claim' },
      { label: 'Because...', type: 'argument' },
      { label: 'This assumes...', type: 'claim' }
    ]
  },

  'assumptions': {
    title: 'Surface Hidden Assumptions',
    icon: '...',
    description: 'Every argument rests on unstated foundations. Bring them to light.',
    steps: [
      { action: 'Find what\'s taken for granted', detail: 'What must be true for this to work?' },
      { action: 'Classify it', detail: 'Is this empirical or normative?' },
      { action: 'Question it', detail: 'What if this assumption is wrong?' }
    ],
    quickStart: [
      { label: 'This assumes...', type: 'claim' },
      { label: 'It takes for granted that...', type: 'claim' },
      { label: 'A skeptic would reject...', type: 'claim' }
    ]
  },

  'counter-perspective': {
    title: 'Challenge Your Thinking',
    icon: '<>',
    description: 'The strongest philosophy survives the strongest objections. Find them.',
    steps: [
      { action: 'Find the strongest objection', detail: 'What would a critic say?' },
      { action: 'Give it a fair hearing', detail: 'Interpret it charitably' },
      { action: 'Respond or revise', detail: 'What survives the challenge?' }
    ],
    quickStart: [
      { label: 'A critic would object...', type: 'counterargument' },
      { label: 'From a different perspective...', type: 'perspective' },
      { label: 'This fails if...', type: 'counterargument' }
    ]
  },

  'ethical-reasoning': {
    title: 'Reason About Ethics',
    icon: 'E',
    description: 'Make value conflicts and moral implications visible.',
    steps: [
      { action: 'Identify values at stake', detail: 'What matters here?' },
      { action: 'Find the tensions', detail: 'Which values conflict?' },
      { action: 'Consider implications', detail: 'Who is affected and how?' }
    ],
    quickStart: [
      { label: 'The ethical question is...', type: 'question' },
      { label: 'The values in tension are...', type: 'claim' },
      { label: 'This affects...', type: 'implication' }
    ]
  },

  'limit-testing': {
    title: 'Test the Limits',
    icon: '!?',
    description: 'Every concept and argument has boundaries. Find where they break down.',
    steps: [
      { action: 'Push to extremes', detail: 'What if this applied universally?' },
      { action: 'Find edge cases', detail: 'Where does intuition conflict with logic?' },
      { action: 'Mark the boundary', detail: 'Where exactly does it break?' }
    ],
    quickStart: [
      { label: 'This breaks when...', type: 'boundary' },
      { label: 'The edge case is...', type: 'boundary' },
      { label: 'Applied universally...', type: 'implication' }
    ]
  }
};

/**
 * Contextual prompts based on current lens and element selection
 */
export function getContextualPrompts(lens, selectedElement, elements) {
  const lensConfig = PHIL_LENSES[lens];
  if (!lensConfig) return [];

  const prompts = [...(lensConfig.prompts || [])];

  // Add element-specific prompts
  if (selectedElement) {
    const elementType = selectedElement.elementType;

    if (elementType === 'concept') {
      prompts.push({ text: 'What does this definition exclude?', type: 'concept' });
      prompts.push({ text: 'How would an opponent define this differently?', type: 'concept' });
    }

    if (elementType === 'claim') {
      prompts.push({ text: 'Is this descriptive, normative, or evaluative?', type: 'claim' });
      prompts.push({ text: 'What evidence would support this?', type: 'claim' });
      prompts.push({ text: 'What assumption underlies this?', type: 'claim' });
    }

    if (elementType === 'argument') {
      prompts.push({ text: 'Are all premises stated?', type: 'claim' });
      prompts.push({ text: 'Does the conclusion follow necessarily?', type: 'counterargument' });
      prompts.push({ text: 'What\'s the weakest premise?', type: 'counterargument' });
    }

    if (elementType === 'counterargument') {
      prompts.push({ text: 'How would the original argument respond?', type: 'claim' });
      prompts.push({ text: 'Does this challenge validity or soundness?', type: 'counterargument' });
    }
  }

  return prompts.slice(0, 6);
}

/**
 * Get active guidance suggestions based on current state
 */
export function getGuidanceSuggestions(elements, inquiry, relationships) {
  const suggestions = [];

  for (const pattern of Object.values(PHIL_GUIDANCE_PATTERNS)) {
    if (pattern.condition(elements, inquiry, relationships)) {
      suggestions.push({
        id: pattern.id,
        priority: pattern.priority,
        message: pattern.message,
        detail: pattern.detail,
        action: pattern.action,
        suggestedLens: pattern.suggestedLens
      });
    }
  }

  return suggestions.sort((a, b) => a.priority - b.priority);
}

/**
 * Get empty state guidance for a lens
 */
export function getEmptyStateGuidance(lensId) {
  return PHIL_EMPTY_STATE_GUIDANCE[lensId] || PHIL_EMPTY_STATE_GUIDANCE['concept-clarification'];
}

/**
 * Get reasoning quality indicators (non-judgmental, just informative)
 */
export function getReasoningQuality(elements, relationships) {
  const metrics = {
    conceptualClarity: 0,
    argumentStructure: 0,
    criticalChallenge: 0,
    implicationAwareness: 0
  };

  const concepts = elements.filter(e => e.elementType === 'concept');
  const claims = elements.filter(e => e.elementType === 'claim');
  const arguments_ = elements.filter(e => e.elementType === 'argument');
  const counterarguments = elements.filter(e => e.elementType === 'counterargument');
  const implications = elements.filter(e => e.elementType === 'implication');
  const boundaries = elements.filter(e => e.elementType === 'boundary');

  // Conceptual clarity: concepts defined relative to claims
  if (claims.length > 0) {
    metrics.conceptualClarity = Math.min(100, (concepts.length / Math.ceil(claims.length / 2)) * 50);
  }

  // Argument structure: arguments with relationships
  const argRelCount = (relationships || []).filter(r =>
    r.relationshipType === 'supports' || r.relationshipType === 'assumes'
  ).length;
  metrics.argumentStructure = Math.min(100, ((arguments_.length + argRelCount) / Math.max(claims.length, 1)) * 50);

  // Critical challenge: counterarguments and alternative perspectives
  metrics.criticalChallenge = Math.min(100, ((counterarguments.length + boundaries.length) / Math.max(arguments_.length, claims.length, 1)) * 80);

  // Implication awareness: implications explored
  metrics.implicationAwareness = Math.min(100, (implications.length / Math.max(claims.length, 1)) * 100);

  return {
    ...metrics,
    overall: Math.round((metrics.conceptualClarity + metrics.argumentStructure + metrics.criticalChallenge + metrics.implicationAwareness) / 4)
  };
}

/**
 * Suggest next actions based on current state
 */
export function suggestNextActions(elements, lens, inquiry) {
  const actions = [];
  const elementCounts = {};

  for (const el of elements) {
    elementCounts[el.elementType] = (elementCounts[el.elementType] || 0) + 1;
  }

  const lensConfig = PHIL_LENSES[lens];
  if (!lensConfig) return actions;

  // Suggest focus elements for current lens
  for (const focusType of lensConfig.focusElements || []) {
    if ((elementCounts[focusType] || 0) === 0) {
      const typeConfig = PHIL_ELEMENT_TYPES[focusType];
      actions.push({
        type: 'add',
        elementType: focusType,
        label: `Add ${typeConfig?.name || focusType}`,
        description: typeConfig?.description,
        priority: 1
      });
    }
  }

  // Generic suggestions
  if (!elementCounts.concept && (elementCounts.claim || 0) >= 1) {
    actions.push({
      type: 'add',
      elementType: 'concept',
      label: 'Define key terms',
      description: 'Clarify the concepts you\'re using',
      priority: 2
    });
  }

  if ((elementCounts.argument || 0) >= 1 && !elementCounts.counterargument) {
    actions.push({
      type: 'add',
      elementType: 'counterargument',
      label: 'Challenge the argument',
      description: 'What would a critic say?',
      priority: 2
    });
  }

  // Lens switching suggestions
  const suggestions = getGuidanceSuggestions(elements, inquiry, []);
  for (const s of suggestions) {
    if (s.suggestedLens && s.suggestedLens !== lens) {
      actions.push({
        type: 'switch-lens',
        lens: s.suggestedLens,
        label: `Try ${PHIL_LENSES[s.suggestedLens]?.name}`,
        description: s.message,
        priority: 3
      });
    }
  }

  return actions.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/**
 * Philosophical thinking tips
 */
export const PHIL_LEARNING_TIPS = [
  {
    id: 'tip-concepts',
    title: 'Defining Concepts',
    content: 'A concept is clear when you can explain what it includes AND what it excludes. Ask: "Is X an instance of this concept?"',
    elementTypes: ['concept']
  },
  {
    id: 'tip-claims',
    title: 'Types of Claims',
    content: 'Descriptive claims say how things ARE. Normative claims say how things OUGHT to be. Evaluative claims assign value. Know which type you\'re making.',
    elementTypes: ['claim']
  },
  {
    id: 'tip-arguments',
    title: 'Argument Structure',
    content: 'A valid argument means: IF the premises are true, THEN the conclusion MUST be true. A sound argument is valid AND has true premises.',
    elementTypes: ['argument']
  },
  {
    id: 'tip-counterarguments',
    title: 'Charitable Interpretation',
    content: 'Always interpret opposing views in their strongest form. Defeating a weak version proves nothing.',
    elementTypes: ['counterargument']
  },
  {
    id: 'tip-assumptions',
    title: 'Finding Hidden Premises',
    content: 'Ask: "What must be true for this argument to work?" The unstated premise is often where disagreement really lies.',
    elementTypes: ['claim', 'argument']
  },
  {
    id: 'tip-boundaries',
    title: 'Testing Limits',
    content: 'Ask: "What if everyone did this?" or "What would the extreme case look like?" Edge cases reveal the true scope of your claim.',
    elementTypes: ['boundary']
  },
  {
    id: 'tip-perspectives',
    title: 'Multiple Frameworks',
    content: 'Try on different ethical lenses: What would a utilitarian say? A Kantian? A virtue ethicist? Each reveals different aspects.',
    elementTypes: ['perspective']
  }
];

/**
 * Get a relevant learning tip
 */
export function getLearningTip(recentElementType, shownTips = []) {
  const relevantTips = PHIL_LEARNING_TIPS.filter(tip =>
    !shownTips.includes(tip.id) &&
    (!recentElementType || tip.elementTypes.includes(recentElementType))
  );

  if (relevantTips.length === 0) return null;
  return relevantTips[Math.floor(Math.random() * relevantTips.length)];
}
