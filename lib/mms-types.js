// Mental Models & Sensemaking Studio - Type Definitions

/**
 * Element Types for the Sensemaking Studio
 * Each type represents a different kind of thinking artifact
 */
export const MMS_ELEMENT_TYPES = {
  thought: {
    id: 'thought',
    name: 'Thought',
    icon: '💭',
    color: '#6366f1',
    description: 'A basic unit of thinking',
    subtypes: [
      { id: 'idea', label: 'Idea', description: 'A new concept or possibility' },
      { id: 'observation', label: 'Observation', description: 'Something noticed or perceived' },
      { id: 'assumption', label: 'Assumption', description: 'Something taken for granted' },
      { id: 'belief', label: 'Belief', description: 'A conviction held to be true' },
      { id: 'concern', label: 'Concern', description: 'A worry or source of unease' },
      { id: 'option', label: 'Option', description: 'A possible choice or alternative' },
      { id: 'question', label: 'Question', description: 'Something to be explored or answered' },
      { id: 'experience-step', label: 'Experience Step', description: 'A moment in a lived experience' }
    ],
    fields: {
      content: { type: 'textarea', required: true, placeholder: 'What are you thinking?' },
      subtype: { type: 'select', label: 'Type of thought', options: 'subtypes' },
      confidence: { type: 'select', label: 'How certain?', options: ['known', 'likely', 'assumption', 'guess'] },
      source: { type: 'select', label: 'Source', options: ['self', 'other', 'implicit', 'observed'] }
    }
  },

  frame: {
    id: 'frame',
    name: 'Frame',
    icon: '🖼️',
    color: '#8b5cf6',
    description: 'A way of interpreting the situation',
    subtypes: [
      { id: 'mental_model', label: 'Mental Model', description: 'An internal representation of how something works' },
      { id: 'narrative', label: 'Narrative', description: 'A story or explanation being told' },
      { id: 'heuristic', label: 'Heuristic', description: 'A rule of thumb or shortcut' },
      { id: 'bias_hypothesis', label: 'Bias Hypothesis', description: 'A suspected cognitive bias at play' },
      { id: 'perspective', label: 'Perspective', description: 'A particular viewpoint or angle' }
    ],
    fields: {
      content: { type: 'text', required: true, placeholder: 'Name this frame', label: 'Frame Label' },
      description: { type: 'textarea', placeholder: 'Describe how this frame shapes thinking...' },
      frameType: { type: 'select', label: 'Frame type', options: 'subtypes' },
      confidence: { type: 'select', label: 'Confidence', options: ['known', 'likely', 'assumption', 'guess'] }
    }
  },

  alternative: {
    id: 'alternative',
    name: 'Alternative',
    icon: '🔄',
    color: '#ec4899',
    description: 'A competing frame or interpretation',
    fields: {
      content: { type: 'textarea', required: true, placeholder: 'What if instead...', label: 'Alternative view' },
      whatItChanges: { type: 'textarea', placeholder: 'What would improve?', label: 'What improves' },
      whatItWorsens: { type: 'textarea', placeholder: 'What would worsen?', label: 'What worsens' }
    }
  },

  implication: {
    id: 'implication',
    name: 'Implication',
    icon: '➡️',
    color: '#f59e0b',
    description: 'A consequence if a frame or thought holds',
    fields: {
      content: { type: 'textarea', required: true, placeholder: 'If this is true, then...', label: 'Consequence' },
      impact: { type: 'select', label: 'Impact level', options: ['low', 'medium', 'high'] },
      reversibility: { type: 'select', label: 'How reversible?', options: ['easy', 'medium', 'hard'] }
    }
  },

  boundary: {
    id: 'boundary',
    name: 'Boundary',
    icon: '🚧',
    color: '#ef4444',
    description: 'Where a frame stops applying',
    fields: {
      content: { type: 'textarea', required: true, placeholder: 'This frame breaks when...', label: 'Boundary condition' },
      importance: { type: 'select', label: 'How important?', options: ['low', 'medium', 'high'] }
    }
  },

  evidence: {
    id: 'evidence',
    name: 'Evidence',
    icon: '📎',
    color: '#22c55e',
    description: 'Anchors thinking to reality',
    fields: {
      content: { type: 'textarea', required: true, placeholder: 'What supports or refutes this?', label: 'Evidence' },
      link: { type: 'text', placeholder: 'URL or reference (optional)', label: 'Source link' },
      supports: { type: 'boolean', label: 'Supports the frame?' },
      strength: { type: 'select', label: 'Evidence strength', options: ['low', 'medium', 'high'] }
    }
  }
};

/**
 * Lenses - Different modes of thinking
 * Each lens highlights certain element types and provides contextual prompts
 */
export const MMS_LENSES = {
  'mental-models': {
    id: 'mental-models',
    name: 'Mental Models',
    shortName: 'Models',
    icon: '🧠',
    color: '#6366f1',
    description: 'Surface implicit assumptions and dominant narratives',
    focusElements: ['thought', 'frame'],
    highlightSubtypes: ['assumption', 'belief', 'mental_model'],
    prompts: [
      { text: 'What are we assuming is fixed?', type: 'assumption' },
      { text: 'What feels obvious but isn\'t proven?', type: 'assumption' },
      { text: 'What belief is shaping these decisions?', type: 'belief' },
      { text: 'What model are we unconsciously using?', type: 'mental_model' }
    ],
    emptyStateGuide: {
      title: 'Start Exploring Mental Models',
      description: 'Mental models are the invisible frameworks shaping your thinking.',
      steps: [
        'Add a Thought about what you believe is true in this situation',
        'Create a Frame to name the mental model you\'re using',
        'Ask: What assumptions underlie this?'
      ]
    }
  },

  'counterfactual': {
    id: 'counterfactual',
    name: 'Counterfactual',
    shortName: 'Opposite',
    icon: '🔄',
    color: '#ec4899',
    description: 'Challenge dominant frames by exploring opposites',
    focusElements: ['frame', 'alternative'],
    prompts: [
      { text: 'If the opposite were true, what changes?', type: 'alternative' },
      { text: 'What are we optimising for without noticing?', type: 'thought' },
      { text: 'What would a critic say?', type: 'alternative' },
      { text: 'What if our core assumption is wrong?', type: 'alternative' }
    ],
    emptyStateGuide: {
      title: 'Challenge Your Thinking',
      description: 'Counterfactuals help you see beyond your current perspective.',
      steps: [
        'Identify a Frame or belief you hold strongly',
        'Add an Alternative exploring the opposite view',
        'Consider what would change if that alternative were true'
      ]
    }
  },

  'trade-offs': {
    id: 'trade-offs',
    name: 'Trade-offs',
    shortName: 'Trade-offs',
    icon: '⚖️',
    color: '#f59e0b',
    description: 'Explore unavoidable dilemmas and tensions',
    focusElements: ['implication', 'alternative'],
    prompts: [
      { text: 'What improves if this holds?', type: 'implication' },
      { text: 'What necessarily worsens?', type: 'implication' },
      { text: 'What tension cannot be resolved?', type: 'thought' },
      { text: 'What are we sacrificing?', type: 'implication' }
    ],
    emptyStateGuide: {
      title: 'Map Trade-offs',
      description: 'Every choice has consequences. Make them visible.',
      steps: [
        'Pick a Frame or decision you\'re considering',
        'Add Implications: what improves and what worsens',
        'Look for patterns in what you\'re consistently sacrificing'
      ]
    }
  },

  'scenarios': {
    id: 'scenarios',
    name: 'Scenarios',
    shortName: 'Futures',
    icon: '🔮',
    color: '#14b8a6',
    description: 'Hold multiple plausible futures simultaneously',
    focusElements: ['frame', 'implication', 'boundary'],
    prompts: [
      { text: 'What if this assumption fails?', type: 'boundary' },
      { text: 'What changes under a different future?', type: 'implication' },
      { text: 'What signals would tell us which scenario is emerging?', type: 'evidence' },
      { text: 'What\'s the worst realistic case?', type: 'frame' }
    ],
    views: ['matrix', 'clusters'],
    emptyStateGuide: {
      title: 'Explore Future Scenarios',
      description: 'The future is uncertain. Prepare for multiple possibilities.',
      steps: [
        'Create Frames for 2-4 plausible futures',
        'Add Boundaries: under what conditions would each occur?',
        'Map Implications for each scenario'
      ]
    }
  },

  'patterns': {
    id: 'patterns',
    name: 'Patterns',
    shortName: 'Analogies',
    icon: '🔗',
    color: '#0ea5e9',
    description: 'Learning transfer - "this resembles..."',
    focusElements: ['frame', 'boundary'],
    prompts: [
      { text: 'Where have we seen this before?', type: 'frame' },
      { text: 'What pattern does this resemble?', type: 'frame' },
      { text: 'Where does the analogy break?', type: 'boundary' },
      { text: 'What can we learn from similar situations?', type: 'thought' }
    ],
    emptyStateGuide: {
      title: 'Find Patterns & Analogies',
      description: 'Connect this situation to past experience and known patterns.',
      steps: [
        'Add a Frame naming a pattern this resembles',
        'Add Boundaries where the analogy breaks down',
        'Note what this pattern taught you before'
      ]
    }
  },

  'experience': {
    id: 'experience',
    name: 'Experience',
    shortName: 'Experience',
    icon: '👁️',
    color: '#8b5cf6',
    description: 'Shift from internal logic to external lived experience',
    focusElements: ['thought'],
    highlightSubtypes: ['experience-step', 'observation'],
    prompts: [
      { text: 'How does this feel from the outside?', type: 'observation' },
      { text: 'What effort does this create?', type: 'observation' },
      { text: 'Where might trust be gained or lost?', type: 'concern' },
      { text: 'Which moment shapes the lasting impression?', type: 'experience-step' }
    ],
    triggerKeywords: ['confusing', 'frustrating', 'trust', 'effort', 'unclear', 'complaints', 'friction'],
    suggestText: 'This situation involves perception and experience. Consider the Experience Lens.',
    views: ['timeline'],
    emptyStateGuide: {
      title: 'Map the Experience',
      description: 'Step outside your own perspective. How does this feel to others?',
      steps: [
        'Add Experience Steps for key moments in the journey',
        'Note Observations about effort, friction, and trust',
        'Identify which moment shapes the lasting impression'
      ]
    }
  }
};

/**
 * Views - Different ways to visualize the same thinking
 */
export const MMS_VIEWS = {
  'canvas': {
    id: 'canvas',
    name: 'Thinking Canvas',
    icon: '🎨',
    description: 'Free-form mind map style',
    isDefault: true
  },
  'clusters': {
    id: 'clusters',
    name: 'Clustered View',
    icon: '🗂️',
    description: 'Elements grouped by type'
  },
  'matrix': {
    id: 'matrix',
    name: '2×2 Matrix',
    icon: '📊',
    description: 'User-defined axes for comparison',
    config: {
      axisX: { label: 'X Axis', options: ['impact', 'certainty', 'urgency', 'effort'] },
      axisY: { label: 'Y Axis', options: ['impact', 'certainty', 'urgency', 'effort'] }
    }
  },
  'table': {
    id: 'table',
    name: 'Comparison Table',
    icon: '📋',
    description: 'Tabular comparison of frames'
  },
  'timeline': {
    id: 'timeline',
    name: 'Timeline',
    icon: '📅',
    description: 'Linear sequence of thoughts',
    requiresLens: 'experience'
  }
};

/**
 * Relationship types between elements
 */
export const MMS_RELATIONSHIP_TYPES = {
  explains: {
    id: 'explains',
    label: 'explains',
    description: 'One element explains or clarifies another',
    icon: '💡',
    validPairs: [
      ['frame', 'thought'],
      ['thought', 'thought'],
      ['evidence', 'frame']
    ]
  },
  challenges: {
    id: 'challenges',
    label: 'challenges',
    description: 'One element challenges or contradicts another',
    icon: '⚡',
    validPairs: [
      ['alternative', 'frame'],
      ['evidence', 'frame'],
      ['thought', 'frame'],
      ['boundary', 'frame']
    ]
  },
  implies: {
    id: 'implies',
    label: 'implies',
    description: 'One element leads to or suggests another',
    icon: '➡️',
    validPairs: [
      ['frame', 'implication'],
      ['thought', 'implication'],
      ['implication', 'implication']
    ]
  },
  has_boundary: {
    id: 'has_boundary',
    label: 'has boundary',
    description: 'Defines where an element stops applying',
    icon: '🚧',
    validPairs: [
      ['frame', 'boundary'],
      ['thought', 'boundary']
    ]
  },
  supports: {
    id: 'supports',
    label: 'supports',
    description: 'One element provides support for another',
    icon: '✓',
    validPairs: [
      ['evidence', 'frame'],
      ['evidence', 'thought'],
      ['thought', 'frame']
    ]
  },
  refutes: {
    id: 'refutes',
    label: 'refutes',
    description: 'One element contradicts or disproves another',
    icon: '✗',
    validPairs: [
      ['evidence', 'frame'],
      ['evidence', 'thought'],
      ['alternative', 'frame']
    ]
  },
  relates_to: {
    id: 'relates_to',
    label: 'relates to',
    description: 'General connection between elements',
    icon: '↔️',
    validPairs: 'any'
  },
  derives_from: {
    id: 'derives_from',
    label: 'derives from',
    description: 'One element is derived from another',
    icon: '⤵️',
    validPairs: [
      ['thought', 'frame'],
      ['implication', 'frame'],
      ['alternative', 'frame']
    ]
  }
};

/**
 * Status options for situations
 */
export const MMS_SITUATION_STATUSES = {
  active: { id: 'active', label: 'Active', color: '#22c55e', description: 'Currently thinking about this' },
  resolved: { id: 'resolved', label: 'Resolved', color: '#6366f1', description: 'Reached clarity or decision' },
  parked: { id: 'parked', label: 'Parked', color: '#f59e0b', description: 'Set aside for later' },
  archived: { id: 'archived', label: 'Archived', color: '#6b7280', description: 'No longer relevant' }
};

/**
 * Confidence levels for elements
 */
export const MMS_CONFIDENCE_LEVELS = {
  known: { id: 'known', label: 'Known', color: '#22c55e', description: 'Verified fact' },
  likely: { id: 'likely', label: 'Likely', color: '#0ea5e9', description: 'Probably true' },
  assumption: { id: 'assumption', label: 'Assumption', color: '#f59e0b', description: 'Taken for granted' },
  guess: { id: 'guess', label: 'Guess', color: '#ef4444', description: 'Uncertain speculation' }
};

/**
 * Source options for thoughts
 */
export const MMS_SOURCES = {
  self: { id: 'self', label: 'My own thinking' },
  other: { id: 'other', label: 'From someone else' },
  implicit: { id: 'implicit', label: 'Implicit/unstated' },
  observed: { id: 'observed', label: 'Observed behavior' }
};

/**
 * Reflection/insight types
 */
export const MMS_INSIGHT_TYPES = {
  realization: { id: 'realization', label: 'Realization', icon: '💡', description: 'Something clicked' },
  question: { id: 'question', label: 'New Question', icon: '❓', description: 'A new question emerged' },
  shift: { id: 'shift', label: 'Perspective Shift', icon: '🔄', description: 'My view changed' },
  decision: { id: 'decision', label: 'Decision', icon: '✓', description: 'I\'ve decided something' }
};

// Helper function to get element type by ID
export function getElementType(typeId) {
  return MMS_ELEMENT_TYPES[typeId] || null;
}

// Helper function to get lens by ID
export function getLens(lensId) {
  return MMS_LENSES[lensId] || MMS_LENSES['mental-models'];
}

// Helper function to get view by ID
export function getView(viewId) {
  return MMS_VIEWS[viewId] || MMS_VIEWS['canvas'];
}

// Helper function to get valid relationship types for a pair of elements
export function getValidRelationships(fromType, toType) {
  return Object.values(MMS_RELATIONSHIP_TYPES).filter(rel => {
    if (rel.validPairs === 'any') return true;
    return rel.validPairs.some(([from, to]) => from === fromType && to === toType);
  });
}

// Helper to get all element types as array
export function getElementTypesArray() {
  return Object.values(MMS_ELEMENT_TYPES);
}

// Helper to get all lenses as array
export function getLensesArray() {
  return Object.values(MMS_LENSES);
}

// Helper to get all views as array
export function getViewsArray() {
  return Object.values(MMS_VIEWS);
}
