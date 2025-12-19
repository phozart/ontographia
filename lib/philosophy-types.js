// Philosophical & Critical Thinking Studio - Type Definitions

/**
 * Element Types for the Philosophy Studio
 * Based on the shared sensemaking model with philosophy-specific interpretations
 */
export const PHIL_ELEMENT_TYPES = {
  question: {
    id: 'question',
    name: 'Philosophical Question',
    icon: '?',
    color: '#6366f1',
    description: 'A question that requires reasoning, not factual lookup',
    fields: {
      content: { type: 'textarea', required: true, placeholder: 'What is the question?', label: 'Question' },
      whyItMatters: { type: 'textarea', placeholder: 'Why does this question matter?', label: 'Why it matters' },
      scope: { type: 'text', placeholder: 'Context or domain (optional)', label: 'Scope' }
    },
    examples: [
      'What is freedom?',
      'Is efficiency a moral value?',
      'When is authority legitimate?'
    ]
  },

  concept: {
    id: 'concept',
    name: 'Concept',
    icon: 'C',
    color: '#8b5cf6',
    description: 'A term that requires clarification',
    fields: {
      content: { type: 'text', required: true, placeholder: 'Concept name', label: 'Concept' },
      workingDefinition: { type: 'textarea', placeholder: 'Your current understanding...', label: 'Working Definition' },
      alternativeDefinitions: { type: 'textarea', placeholder: 'How might others define this?', label: 'Alternative Definitions' },
      ambiguityNotes: { type: 'textarea', placeholder: 'What is unclear or contested?', label: 'Ambiguity Notes' },
      confidence: { type: 'select', label: 'Confidence in definition', options: ['tentative', 'working', 'stable', 'contested'] }
    }
  },

  claim: {
    id: 'claim',
    name: 'Claim',
    icon: '!',
    color: '#ec4899',
    description: 'A statement asserted as true or defended',
    subtypes: [
      { id: 'descriptive', label: 'Descriptive', description: 'Claims about how things are' },
      { id: 'normative', label: 'Normative', description: 'Claims about how things ought to be' },
      { id: 'evaluative', label: 'Evaluative', description: 'Claims about value or worth' }
    ],
    fields: {
      content: { type: 'textarea', required: true, placeholder: 'State the claim...', label: 'Claim' },
      claimType: { type: 'select', label: 'Claim type', options: 'subtypes' },
      confidence: { type: 'select', label: 'Confidence', options: ['tentative', 'defended', 'strong', 'certain'] },
      source: { type: 'select', label: 'Source', options: ['self', 'author', 'tradition', 'implicit'] }
    }
  },

  argument: {
    id: 'argument',
    name: 'Argument',
    icon: 'A',
    color: '#f59e0b',
    description: 'A structured relationship between claims',
    subtypes: [
      { id: 'deductive', label: 'Deductive', description: 'Conclusion necessarily follows from premises' },
      { id: 'inductive', label: 'Inductive', description: 'Conclusion probably follows from premises' },
      { id: 'abductive', label: 'Abductive', description: 'Best explanation for the evidence' }
    ],
    fields: {
      content: { type: 'text', required: true, placeholder: 'Name this argument', label: 'Argument Name' },
      premises: { type: 'textarea', required: true, placeholder: 'List the premises (one per line)', label: 'Premises' },
      conclusion: { type: 'textarea', required: true, placeholder: 'What follows from the premises?', label: 'Conclusion' },
      reasoningType: { type: 'select', label: 'Reasoning type', options: 'subtypes' }
    }
  },

  counterargument: {
    id: 'counterargument',
    name: 'Counterargument',
    icon: 'X',
    color: '#ef4444',
    description: 'A challenge to an argument',
    subtypes: [
      { id: 'validity', label: 'Validity Challenge', description: 'The conclusion does not follow' },
      { id: 'soundness', label: 'Soundness Challenge', description: 'A premise is false' },
      { id: 'assumption', label: 'Hidden Assumption', description: 'There is an unstated premise' },
      { id: 'scope', label: 'Scope Limitation', description: 'The argument applies more narrowly than claimed' }
    ],
    fields: {
      content: { type: 'textarea', required: true, placeholder: 'What is the challenge?', label: 'Challenge' },
      challengeType: { type: 'select', label: 'Challenge type', options: 'subtypes' },
      targetDescription: { type: 'text', placeholder: 'What is being challenged?', label: 'Target' }
    }
  },

  implication: {
    id: 'implication',
    name: 'Implication',
    icon: '>',
    color: '#22c55e',
    description: 'What follows if a claim or argument is accepted',
    subtypes: [
      { id: 'ethical', label: 'Ethical', description: 'Moral consequences' },
      { id: 'social', label: 'Social', description: 'Effects on society' },
      { id: 'practical', label: 'Practical', description: 'Real-world effects' },
      { id: 'conceptual', label: 'Conceptual', description: 'Logical entailments' }
    ],
    fields: {
      content: { type: 'textarea', required: true, placeholder: 'If this is accepted, then...', label: 'Implication' },
      implicationType: { type: 'select', label: 'Type', options: 'subtypes' },
      impact: { type: 'select', label: 'Impact', options: ['low', 'medium', 'high'] }
    }
  },

  boundary: {
    id: 'boundary',
    name: 'Boundary / Limit',
    icon: '|',
    color: '#64748b',
    description: 'Where a concept, claim, or argument stops applying',
    fields: {
      content: { type: 'textarea', required: true, placeholder: 'Where does this stop applying?', label: 'Boundary' },
      whyItMatters: { type: 'textarea', placeholder: 'Why is this limit important?', label: 'Importance' }
    }
  },

  perspective: {
    id: 'perspective',
    name: 'Perspective',
    icon: 'P',
    color: '#0ea5e9',
    description: 'A philosophical stance or viewpoint',
    fields: {
      content: { type: 'text', required: true, placeholder: 'Name this perspective', label: 'Perspective' },
      coreCommitments: { type: 'textarea', placeholder: 'What are its core commitments?', label: 'Core Commitments' },
      whatItPrioritises: { type: 'textarea', placeholder: 'What does this view emphasize?', label: 'Prioritises' },
      whatItDownplays: { type: 'textarea', placeholder: 'What does this view neglect?', label: 'Downplays' }
    },
    examples: [
      'Utilitarian',
      'Deontological',
      'Liberal',
      'Communitarian',
      'Existential'
    ]
  }
};

/**
 * Lenses - Different modes of philosophical thinking
 */
export const PHIL_LENSES = {
  'concept-clarification': {
    id: 'concept-clarification',
    name: 'Concept Clarification',
    shortName: 'Concepts',
    icon: 'C',
    color: '#8b5cf6',
    description: 'Reduce ambiguity and distinguish similar ideas',
    focusElements: ['concept', 'question'],
    prompts: [
      { text: 'What do we mean by this term?', type: 'concept' },
      { text: 'What does this definition include or exclude?', type: 'concept' },
      { text: 'How might others define this differently?', type: 'concept' },
      { text: 'What related concepts need distinction?', type: 'concept' }
    ],
    emptyStateGuide: {
      title: 'Clarify Your Concepts',
      description: 'Good philosophy starts with clear concepts.',
      steps: [
        'Identify a key term in your question',
        'Add a Concept and define it provisionally',
        'Note alternative definitions and ambiguities'
      ]
    }
  },

  'argument-examination': {
    id: 'argument-examination',
    name: 'Argument Examination',
    shortName: 'Arguments',
    icon: 'A',
    color: '#f59e0b',
    description: 'Analyse the structure and strength of reasoning',
    focusElements: ['argument', 'claim', 'counterargument'],
    prompts: [
      { text: 'What is being claimed?', type: 'claim' },
      { text: 'What must be true for this to hold?', type: 'claim' },
      { text: 'Does the conclusion follow from the premises?', type: 'argument' },
      { text: 'What is the strongest objection?', type: 'counterargument' }
    ],
    views: ['argument-map'],
    emptyStateGuide: {
      title: 'Examine Arguments',
      description: 'Break down reasoning into its components.',
      steps: [
        'Add a Claim that is being defended',
        'Create an Argument with premises and conclusion',
        'Consider counterarguments and challenges'
      ]
    }
  },

  'assumptions': {
    id: 'assumptions',
    name: 'Assumptions & Presuppositions',
    shortName: 'Assumptions',
    icon: '...',
    color: '#6366f1',
    description: 'Surface hidden foundations',
    focusElements: ['claim', 'argument', 'boundary'],
    prompts: [
      { text: 'What is taken for granted here?', type: 'claim' },
      { text: 'What would someone disagreeing reject first?', type: 'claim' },
      { text: 'Is this assumption empirical or normative?', type: 'claim' },
      { text: 'What unstated premise makes this work?', type: 'claim' }
    ],
    emptyStateGuide: {
      title: 'Surface Hidden Assumptions',
      description: 'Every argument rests on unspoken foundations.',
      steps: [
        'Examine an existing argument or claim',
        'Ask: what must be assumed for this to work?',
        'Add Claims for each hidden assumption'
      ]
    }
  },

  'counter-perspective': {
    id: 'counter-perspective',
    name: 'Counter-Perspective',
    shortName: 'Opposite',
    icon: '<>',
    color: '#ec4899',
    description: 'Test robustness through opposition',
    focusElements: ['counterargument', 'perspective', 'claim'],
    prompts: [
      { text: 'What would a critic say?', type: 'counterargument' },
      { text: 'What is the strongest opposing view?', type: 'perspective' },
      { text: 'What survives this challenge?', type: 'claim' },
      { text: 'How would an opponent interpret this?', type: 'counterargument' }
    ],
    emptyStateGuide: {
      title: 'Challenge Your Thinking',
      description: 'Seek the strongest objection, not the weakest.',
      steps: [
        'Take an argument or claim you hold',
        'Add the strongest Counterargument you can imagine',
        'Consider alternative Perspectives that oppose yours'
      ]
    }
  },

  'ethical-reasoning': {
    id: 'ethical-reasoning',
    name: 'Ethical Reasoning',
    shortName: 'Ethics',
    icon: 'E',
    color: '#22c55e',
    description: 'Explore value conflicts and moral implications',
    focusElements: ['claim', 'implication', 'perspective'],
    highlightSubtypes: ['normative', 'evaluative', 'ethical'],
    prompts: [
      { text: 'Who is affected by this?', type: 'implication' },
      { text: 'What values are in tension?', type: 'claim' },
      { text: 'What trade-off is unavoidable?', type: 'implication' },
      { text: 'What would each ethical tradition say?', type: 'perspective' }
    ],
    views: ['value-tension-map'],
    emptyStateGuide: {
      title: 'Reason About Ethics',
      description: 'Make value conflicts and moral implications visible.',
      steps: [
        'Identify the normative Claims at stake',
        'Map the Implications for different stakeholders',
        'Consider multiple ethical Perspectives'
      ]
    }
  },

  'limit-testing': {
    id: 'limit-testing',
    name: 'Limit Testing',
    shortName: 'Limits',
    icon: '!?',
    color: '#ef4444',
    description: 'Test coherence through edge cases',
    focusElements: ['boundary', 'implication', 'counterargument'],
    prompts: [
      { text: 'What happens if this principle is applied universally?', type: 'implication' },
      { text: 'At what point does this break down?', type: 'boundary' },
      { text: 'What is the edge case that tests this?', type: 'boundary' },
      { text: 'Where does the analogy fail?', type: 'boundary' }
    ],
    emptyStateGuide: {
      title: 'Test the Limits',
      description: 'Every concept and argument has boundaries.',
      steps: [
        'Take a claim or principle',
        'Push it to extreme cases',
        'Add Boundaries where it breaks down'
      ]
    }
  }
};

/**
 * Views - Different ways to visualize philosophical thinking
 */
export const PHIL_VIEWS = {
  'canvas': {
    id: 'canvas',
    name: 'Reasoning Canvas',
    icon: 'R',
    description: 'Free-form concept map',
    isDefault: true
  },
  'argument-map': {
    id: 'argument-map',
    name: 'Argument Map',
    icon: 'A',
    description: 'Premises leading to conclusions',
    requiresLens: 'argument-examination'
  },
  'concept-map': {
    id: 'concept-map',
    name: 'Concept Map',
    icon: 'C',
    description: 'Concepts and their relationships'
  },
  'implication-list': {
    id: 'implication-list',
    name: 'Implications',
    icon: '>',
    description: 'What follows from what'
  },
  'narrative': {
    id: 'narrative',
    name: 'Narrative View',
    icon: 'N',
    description: 'Linear explanation of reasoning'
  }
};

/**
 * Relationship types between philosophical elements
 */
export const PHIL_RELATIONSHIP_TYPES = {
  defines: {
    id: 'defines',
    label: 'defines',
    description: 'One element defines or clarifies another',
    icon: '=',
    validPairs: [
      ['concept', 'concept'],
      ['claim', 'concept']
    ]
  },
  supports: {
    id: 'supports',
    label: 'supports',
    description: 'One element provides support for another',
    icon: '+',
    validPairs: [
      ['claim', 'claim'],
      ['argument', 'claim'],
      ['claim', 'argument']
    ]
  },
  challenges: {
    id: 'challenges',
    label: 'challenges',
    description: 'One element challenges another',
    icon: 'x',
    validPairs: [
      ['counterargument', 'argument'],
      ['counterargument', 'claim'],
      ['claim', 'claim'],
      ['boundary', 'claim']
    ]
  },
  implies: {
    id: 'implies',
    label: 'implies',
    description: 'One element logically entails another',
    icon: '>',
    validPairs: [
      ['claim', 'implication'],
      ['argument', 'implication'],
      ['implication', 'implication']
    ]
  },
  assumes: {
    id: 'assumes',
    label: 'assumes',
    description: 'One element presupposes another',
    icon: '...',
    validPairs: [
      ['argument', 'claim'],
      ['claim', 'claim'],
      ['claim', 'concept']
    ]
  },
  uses: {
    id: 'uses',
    label: 'uses concept',
    description: 'One element employs a concept',
    icon: 'U',
    validPairs: [
      ['claim', 'concept'],
      ['argument', 'concept'],
      ['question', 'concept']
    ]
  },
  limits: {
    id: 'limits',
    label: 'is limited by',
    description: 'A boundary constrains an element',
    icon: '|',
    validPairs: [
      ['claim', 'boundary'],
      ['argument', 'boundary'],
      ['concept', 'boundary']
    ]
  },
  addresses: {
    id: 'addresses',
    label: 'addresses',
    description: 'One element responds to a question',
    icon: '?',
    validPairs: [
      ['claim', 'question'],
      ['argument', 'question'],
      ['perspective', 'question']
    ]
  },
  relates_to: {
    id: 'relates_to',
    label: 'relates to',
    description: 'General connection between elements',
    icon: '-',
    validPairs: 'any'
  }
};

/**
 * Status options for philosophical inquiries
 */
export const PHIL_INQUIRY_STATUSES = {
  exploring: { id: 'exploring', label: 'Exploring', color: '#6366f1', description: 'Initial investigation' },
  clarifying: { id: 'clarifying', label: 'Clarifying', color: '#f59e0b', description: 'Working on definitions' },
  arguing: { id: 'arguing', label: 'Arguing', color: '#22c55e', description: 'Building arguments' },
  challenging: { id: 'challenging', label: 'Challenging', color: '#ec4899', description: 'Testing robustness' },
  resolved: { id: 'resolved', label: 'Resolved', color: '#64748b', description: 'Reached a position' },
  aporia: { id: 'aporia', label: 'Aporia', color: '#ef4444', description: 'Productively stuck' }
};

/**
 * Confidence levels for claims
 */
export const PHIL_CONFIDENCE_LEVELS = {
  tentative: { id: 'tentative', label: 'Tentative', color: '#f59e0b', description: 'Working hypothesis' },
  defended: { id: 'defended', label: 'Defended', color: '#0ea5e9', description: 'Can argue for this' },
  strong: { id: 'strong', label: 'Strong', color: '#22c55e', description: 'High confidence' },
  certain: { id: 'certain', label: 'Certain', color: '#6366f1', description: 'Cannot imagine being wrong' }
};

/**
 * Reflection types for philosophy
 */
export const PHIL_REFLECTION_TYPES = {
  clarity: { id: 'clarity', label: 'Gained Clarity', icon: '!', description: 'Something became clearer' },
  confusion: { id: 'confusion', label: 'New Confusion', icon: '?', description: 'Found new puzzlement' },
  shift: { id: 'shift', label: 'Position Shift', icon: '<>', description: 'Changed my view' },
  connection: { id: 'connection', label: 'Made Connection', icon: '-', description: 'Linked ideas together' },
  question: { id: 'question', label: 'New Question', icon: '??', description: 'A deeper question emerged' }
};

// Helper functions
export function getElementType(typeId) {
  return PHIL_ELEMENT_TYPES[typeId] || null;
}

export function getLens(lensId) {
  return PHIL_LENSES[lensId] || PHIL_LENSES['concept-clarification'];
}

export function getView(viewId) {
  return PHIL_VIEWS[viewId] || PHIL_VIEWS['canvas'];
}

export function getValidRelationships(fromType, toType) {
  return Object.values(PHIL_RELATIONSHIP_TYPES).filter(rel => {
    if (rel.validPairs === 'any') return true;
    return rel.validPairs.some(([from, to]) => from === fromType && to === toType);
  });
}

export function getElementTypesArray() {
  return Object.values(PHIL_ELEMENT_TYPES);
}

export function getLensesArray() {
  return Object.values(PHIL_LENSES);
}

export function getViewsArray() {
  return Object.values(PHIL_VIEWS);
}
