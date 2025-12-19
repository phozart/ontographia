// lib/np-types.js
// Type definitions for Negotiation & Persuasion Sensemaking Studio
// A structured thinking tool for interpersonal and business interactions

// ============ SITUATION TYPES ============
export const NP_SITUATION_TYPES = [
  { id: 'negotiation', name: 'Negotiation', description: 'A discussion to reach a mutually acceptable agreement', icon: '🤝' },
  { id: 'persuasion', name: 'Persuasion', description: 'Attempting to change someone\'s mind or gain support', icon: '💬' },
  { id: 'influence', name: 'Influence', description: 'Shaping decisions without direct negotiation', icon: '🌊' },
  { id: 'conflict', name: 'Conflict', description: 'Managing disagreement or opposition', icon: '⚡' },
  { id: 'collaboration', name: 'Collaboration', description: 'Working together toward a shared goal', icon: '🤲' },
  { id: 'unknown', name: 'Unsure', description: 'Still figuring out what kind of interaction this is', icon: '❓' },
];

// ============ ELEMENT TYPES ============
export const NP_ELEMENT_TYPES = [
  // Context Elements - Grounding the situation
  {
    id: 'situation',
    name: 'Situation',
    category: 'context',
    description: 'The overall context and circumstances',
    color: '#6366f1',
    icon: '🎯',
    fields: {
      name: { type: 'text', required: true, helpText: 'Brief name for this situation' },
      description: { type: 'textarea', helpText: 'Describe the situation in your own words' },
      stakes: { type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], helpText: 'What\'s at stake?' },
      timeframe: { type: 'text', helpText: 'When does this need to be resolved?' },
      history: { type: 'textarea', helpText: 'Any relevant history or context?' },
    },
    guidance: {
      whenToUse: ['Starting a new interaction analysis', 'Capturing the "big picture"'],
      questions: ['What is actually happening here?', 'Why is this happening now?', 'Who initiated this?'],
    }
  },
  {
    id: 'stakeholder',
    name: 'Stakeholder',
    category: 'context',
    description: 'A person or group involved in or affected by the situation',
    color: '#8b5cf6',
    icon: '👤',
    fields: {
      name: { type: 'text', required: true, helpText: 'Name or role of this person/group' },
      role: { type: 'text', helpText: 'Their role in this situation' },
      influence: { type: 'select', options: ['Low', 'Medium', 'High'], helpText: 'How much influence do they have?' },
      disposition: { type: 'select', options: ['Supporter', 'Neutral', 'Skeptic', 'Opponent', 'Unknown'], helpText: 'Current stance toward your goal' },
      relationship: { type: 'text', helpText: 'Your relationship with this person' },
    },
    guidance: {
      whenToUse: ['Mapping who is involved', 'Understanding the decision-making landscape'],
      questions: ['Who can say yes?', 'Who can say no?', 'Who influences the decision-maker?'],
    }
  },
  {
    id: 'trigger',
    name: 'Trigger',
    category: 'context',
    description: 'What caused or initiated this situation',
    color: '#f59e0b',
    icon: '⚡',
    fields: {
      description: { type: 'textarea', required: true, helpText: 'What triggered this situation?' },
      timing: { type: 'text', helpText: 'When did this happen?' },
      controllable: { type: 'select', options: ['Yes', 'Partially', 'No'], helpText: 'Could this have been prevented?' },
    },
    guidance: {
      whenToUse: ['Understanding why this is happening now', 'Identifying root causes'],
      questions: ['Why now?', 'What changed?', 'Was this triggered by you or someone else?'],
    }
  },

  // Perspective Elements - Understanding viewpoints
  {
    id: 'position',
    name: 'Position',
    category: 'perspective',
    description: 'A stated stance or demand - what someone says they want',
    color: '#ef4444',
    icon: '📍',
    fields: {
      content: { type: 'textarea', required: true, helpText: 'What is being said or demanded?' },
      party: { type: 'select', options: ['Mine', 'Theirs', 'Third Party'], required: true },
      firmness: { type: 'select', options: ['Flexible', 'Negotiable', 'Firm', 'Non-negotiable'], helpText: 'How fixed is this position?' },
      stated_reason: { type: 'textarea', helpText: 'What reason is given for this position?' },
    },
    guidance: {
      whenToUse: ['Capturing what someone is explicitly asking for', 'Documenting stated demands'],
      questions: ['What exactly are they asking for?', 'Is this their opening position or final offer?'],
      warning: 'Positions are not interests - dig deeper to find the underlying need',
    }
  },
  {
    id: 'interest',
    name: 'Interest',
    category: 'perspective',
    description: 'An underlying need, desire, or concern behind a position',
    color: '#22c55e',
    icon: '💚',
    fields: {
      content: { type: 'textarea', required: true, helpText: 'What do they actually need or care about?' },
      party: { type: 'select', options: ['Mine', 'Theirs', 'Shared'], required: true },
      importance: { type: 'select', options: ['Nice to have', 'Important', 'Critical'], helpText: 'How important is this interest?' },
      evidence: { type: 'textarea', helpText: 'What makes you think this is an interest?' },
      confidence: { type: 'select', options: ['Guess', 'Assumption', 'Likely', 'Known'], helpText: 'How confident are you?' },
    },
    guidance: {
      whenToUse: ['Understanding WHY someone wants something', 'Finding common ground'],
      questions: ['Why do they want this?', 'What would satisfying this position give them?', 'What are they really trying to achieve?'],
      tip: 'Shared interests are the foundation of win-win solutions',
    }
  },
  {
    id: 'constraint',
    name: 'Constraint',
    category: 'perspective',
    description: 'A limitation, restriction, or boundary that affects options',
    color: '#64748b',
    icon: '🚧',
    fields: {
      content: { type: 'textarea', required: true, helpText: 'What is the constraint?' },
      party: { type: 'select', options: ['Mine', 'Theirs', 'External'], required: true },
      type: { type: 'select', options: ['Budget', 'Time', 'Authority', 'Policy', 'Technical', 'Legal', 'Personal', 'Other'], helpText: 'Type of constraint' },
      flexibility: { type: 'select', options: ['Flexible', 'Somewhat flexible', 'Rigid'], helpText: 'Can this be changed?' },
      real: { type: 'select', options: ['Verified', 'Claimed', 'Suspected'], helpText: 'Is this constraint real or just stated?' },
    },
    guidance: {
      whenToUse: ['Understanding limitations', 'Identifying what\'s truly fixed vs flexible'],
      questions: ['Is this a real constraint or a negotiating tactic?', 'Who set this constraint?', 'Can it be changed?'],
    }
  },
  {
    id: 'emotional_driver',
    name: 'Emotional Driver',
    category: 'perspective',
    description: 'An emotional factor influencing the situation',
    color: '#ec4899',
    icon: '💭',
    fields: {
      emotion: { type: 'select', options: ['Fear', 'Anger', 'Frustration', 'Pride', 'Anxiety', 'Hope', 'Excitement', 'Distrust', 'Other'], required: true },
      party: { type: 'select', options: ['Mine', 'Theirs'], required: true },
      source: { type: 'textarea', helpText: 'What\'s causing this emotion?' },
      impact: { type: 'textarea', helpText: 'How is this emotion affecting the situation?' },
      confidence: { type: 'select', options: ['Guess', 'Likely', 'Observed'], helpText: 'How sure are you about this?' },
    },
    guidance: {
      whenToUse: ['Understanding emotional undercurrents', 'Identifying potential blockers'],
      questions: ['What emotions are driving behavior?', 'Is there fear or anxiety that needs addressing?'],
      tip: 'Acknowledging emotions (without agreeing) can defuse tension',
    }
  },
  {
    id: 'frame',
    name: 'Frame',
    category: 'perspective',
    description: 'How someone sees or interprets the situation',
    color: '#06b6d4',
    icon: '🖼️',
    fields: {
      party: { type: 'select', options: ['Mine', 'Theirs'], required: true },
      description: { type: 'textarea', required: true, helpText: 'How does this party see the situation?' },
      metaphor: { type: 'text', helpText: 'If this were a metaphor, it would be...' },
      assumptions: { type: 'textarea', helpText: 'What assumptions underlie this frame?' },
    },
    guidance: {
      whenToUse: ['Detecting frame clashes', 'Understanding different perspectives'],
      questions: ['How do they see this situation?', 'What metaphor describes their view?', 'Why might they see it differently than you?'],
      tip: 'Frame clashes are often the root of persistent disagreement',
    }
  },

  // Assessment Elements - Analyzing the situation
  {
    id: 'batna',
    name: 'BATNA',
    category: 'assessment',
    description: 'Best Alternative To Negotiated Agreement - your backup plan',
    color: '#14b8a6',
    icon: '🛡️',
    fields: {
      party: { type: 'select', options: ['Mine', 'Theirs'], required: true },
      description: { type: 'textarea', required: true, helpText: 'What is the best alternative if no agreement is reached?' },
      quality: { type: 'select', options: ['Poor', 'Acceptable', 'Good', 'Excellent'], helpText: 'How good is this alternative?' },
      certainty: { type: 'select', options: ['Uncertain', 'Likely', 'Definite'], helpText: 'How certain is this alternative?' },
      actions_to_improve: { type: 'textarea', helpText: 'What could improve this BATNA?' },
    },
    guidance: {
      whenToUse: ['Understanding negotiating power', 'Deciding whether to accept a deal'],
      questions: ['What happens if we walk away?', 'What\'s our Plan B?', 'What\'s their Plan B?'],
      tip: 'A strong BATNA gives you negotiating power. Improve yours and understand theirs.',
    }
  },
  {
    id: 'zopa_hypothesis',
    name: 'ZOPA Hypothesis',
    category: 'assessment',
    description: 'Zone of Possible Agreement - where both parties might agree',
    color: '#84cc16',
    icon: '🎯',
    fields: {
      dimension: { type: 'text', required: true, helpText: 'What dimension? (e.g., price, timeline, scope)' },
      my_range: { type: 'text', helpText: 'Your acceptable range (min-max)' },
      their_range: { type: 'text', helpText: 'Their likely acceptable range (guess)' },
      overlap: { type: 'select', options: ['Clear overlap', 'Possible overlap', 'No overlap', 'Unknown'], helpText: 'Do the ranges overlap?' },
      notes: { type: 'textarea', helpText: 'Additional thoughts on this dimension' },
    },
    guidance: {
      whenToUse: ['Identifying where agreement is possible', 'Preparing for negotiation'],
      questions: ['What\'s the minimum you\'d accept?', 'What\'s the maximum they\'d offer?', 'Is there space in between?'],
      tip: 'If there\'s no ZOPA, no deal is possible unless something changes',
    }
  },
  {
    id: 'leverage_factor',
    name: 'Leverage Factor',
    category: 'assessment',
    description: 'Something that gives power or advantage in the situation',
    color: '#f97316',
    icon: '⚖️',
    fields: {
      description: { type: 'textarea', required: true, helpText: 'What is this source of leverage?' },
      holder: { type: 'select', options: ['Me', 'Them', 'Neither'], required: true },
      strength: { type: 'select', options: ['Weak', 'Moderate', 'Strong'], helpText: 'How significant is this leverage?' },
      type: { type: 'select', options: ['Information', 'Alternatives', 'Time', 'Resources', 'Relationship', 'Authority', 'Expertise', 'Other'] },
      how_to_use: { type: 'textarea', helpText: 'How could this leverage be used?' },
    },
    guidance: {
      whenToUse: ['Understanding power dynamics', 'Preparing strategy'],
      questions: ['Who has more to lose?', 'Who can wait longer?', 'Who has more alternatives?'],
    }
  },
  {
    id: 'concession',
    name: 'Concession',
    category: 'assessment',
    description: 'Something that could be given up or traded',
    color: '#a855f7',
    icon: '🔄',
    fields: {
      item: { type: 'text', required: true, helpText: 'What is the potential concession?' },
      giver: { type: 'select', options: ['Me', 'Them'], required: true },
      cost_to_giver: { type: 'select', options: ['Low', 'Medium', 'High'], helpText: 'How costly is this to give?' },
      value_to_receiver: { type: 'select', options: ['Low', 'Medium', 'High'], helpText: 'How valuable is this to receive?' },
      tradeable_for: { type: 'textarea', helpText: 'What could this be traded for?' },
    },
    guidance: {
      whenToUse: ['Planning trades', 'Finding asymmetric value opportunities'],
      questions: ['What\'s easy for me to give but valuable to them?', 'What might they give easily that I value?'],
      tip: 'The best trades are where both sides give something low-cost and receive something high-value',
    }
  },

  // Preparation Elements - Getting ready
  {
    id: 'red_line',
    name: 'Red Line',
    category: 'preparation',
    description: 'A non-negotiable boundary or walk-away point',
    color: '#dc2626',
    icon: '🚫',
    fields: {
      description: { type: 'textarea', required: true, helpText: 'What is absolutely non-negotiable?' },
      rationale: { type: 'textarea', helpText: 'Why is this a red line?' },
      consequence: { type: 'textarea', helpText: 'What happens if this line is crossed?' },
    },
    guidance: {
      whenToUse: ['Defining boundaries before entering a negotiation', 'Protecting core interests'],
      questions: ['What would make you walk away?', 'What can\'t you compromise on?'],
      warning: 'Be sure your red lines are truly non-negotiable - don\'t bluff',
    }
  },
  {
    id: 'assumption',
    name: 'Assumption',
    category: 'preparation',
    description: 'Something you believe to be true but haven\'t verified',
    color: '#fbbf24',
    icon: '❓',
    fields: {
      content: { type: 'textarea', required: true, helpText: 'What are you assuming?' },
      risk_if_wrong: { type: 'select', options: ['Low', 'Medium', 'High'], helpText: 'What if this assumption is wrong?' },
      how_to_test: { type: 'textarea', helpText: 'How could you verify this?' },
      tested: { type: 'select', options: ['Not yet', 'Partially', 'Verified', 'Disproven'], helpText: 'Have you tested this?' },
    },
    guidance: {
      whenToUse: ['Checking your thinking', 'Identifying blind spots'],
      questions: ['What am I taking for granted?', 'What if I\'m wrong about this?'],
      tip: 'Untested assumptions are a major source of negotiation failures',
    }
  },
  {
    id: 'question',
    name: 'Question to Ask',
    category: 'preparation',
    description: 'A question to ask to gather information or test assumptions',
    color: '#3b82f6',
    icon: '❔',
    fields: {
      question: { type: 'textarea', required: true, helpText: 'What do you want to ask?' },
      purpose: { type: 'textarea', helpText: 'Why do you want to know this?' },
      ask_of: { type: 'text', helpText: 'Who should you ask?' },
      timing: { type: 'select', options: ['Early', 'Middle', 'Late', 'If needed'], helpText: 'When to ask this?' },
      type: { type: 'select', options: ['Open (exploratory)', 'Closed (confirming)', 'Probing', 'Hypothetical'] },
    },
    guidance: {
      whenToUse: ['Preparing for conversations', 'Planning information gathering'],
      questions: ['What do you need to know that you don\'t know?', 'What assumptions need testing?'],
      tip: 'Open questions reveal more than closed ones',
    }
  },
  {
    id: 'reflection',
    name: 'Reflection',
    category: 'preparation',
    description: 'A personal insight, realization, or note to self',
    color: '#6b7280',
    icon: '💡',
    fields: {
      content: { type: 'textarea', required: true, helpText: 'What did you realize or want to remember?' },
      trigger: { type: 'text', helpText: 'What prompted this reflection?' },
      action: { type: 'textarea', helpText: 'Any action to take based on this?' },
    },
    guidance: {
      whenToUse: ['Capturing insights', 'Processing your thoughts'],
      questions: ['What have you learned?', 'What would you do differently?'],
    }
  },
];

// ============ ELEMENT TYPE LOOKUP ============
export const NP_ELEMENT_TYPE_MAP = Object.fromEntries(
  NP_ELEMENT_TYPES.map(t => [t.id, t])
);

// ============ ELEMENT CATEGORIES ============
export const NP_ELEMENT_CATEGORIES = {
  context: {
    name: 'Context',
    description: 'Ground the situation before analyzing',
    color: '#6366f1',
    icon: '🎯',
    order: 1,
  },
  perspective: {
    name: 'Perspectives',
    description: 'Understand different viewpoints',
    color: '#22c55e',
    icon: '👁️',
    order: 2,
  },
  assessment: {
    name: 'Assessment',
    description: 'Analyze power, options, and opportunities',
    color: '#f97316',
    icon: '⚖️',
    order: 3,
  },
  preparation: {
    name: 'Preparation',
    description: 'Get ready for the interaction',
    color: '#3b82f6',
    icon: '📋',
    order: 4,
  },
};

// ============ REFLECTIVE PROMPTS ============
// Triggered based on patterns in the user's analysis
export const NP_REFLECTIVE_PROMPTS = {
  // Pattern-triggered prompts
  allTheirPerspective: {
    pattern: 'All perspective elements are about the other party',
    prompt: 'You\'ve focused on their perspective. What about yours? What do YOU actually want and need?',
  },
  noInterests: {
    pattern: 'Positions exist but no interests documented',
    prompt: 'You have positions but no interests. What\'s behind these positions? Why do you/they want this?',
  },
  noBATNA: {
    pattern: 'No BATNA documented',
    prompt: 'What\'s your Plan B if this doesn\'t work out? Understanding your alternatives affects your power.',
  },
  highConfidenceNoEvidence: {
    pattern: 'High confidence assumptions without evidence',
    prompt: 'You seem certain about their perspective. What\'s that confidence based on? Have you verified this?',
  },
  manyRedLines: {
    pattern: 'More than 3 red lines',
    prompt: 'You have many non-negotiables. Are they all truly red lines, or are some just preferences?',
  },
  noSharedInterests: {
    pattern: 'No shared interests identified',
    prompt: 'You haven\'t found any shared interests yet. What might you both want or value?',
  },
  allNegative: {
    pattern: 'Only negative emotions documented',
    prompt: 'The emotional landscape looks challenging. Are there any positive emotions or hopes involved?',
  },
  frameClash: {
    pattern: 'Frames from both parties documented with different descriptions',
    prompt: 'You may have identified a frame clash. How might you bridge these different ways of seeing the situation?',
  },
  noQuestions: {
    pattern: 'Assessment complete but no questions prepared',
    prompt: 'You\'ve analyzed the situation but haven\'t prepared questions to ask. What do you still need to learn?',
  },
  onlyOneStakeholder: {
    pattern: 'Only one or two stakeholders identified',
    prompt: 'Are there other people who influence this situation? Decision influencers? Gatekeepers? Allies?',
  },
};

// ============ CONVERSATION DIAGNOSTIC ============
// Questions to help determine what kind of interaction this is
export const NP_DIAGNOSTIC_QUESTIONS = [
  {
    id: 'goal_type',
    question: 'What are you trying to achieve?',
    options: [
      { value: 'agreement', label: 'Reach an agreement or deal', suggests: 'negotiation' },
      { value: 'approval', label: 'Get approval or support for something', suggests: 'persuasion' },
      { value: 'change_behavior', label: 'Change how someone behaves', suggests: 'influence' },
      { value: 'resolve_conflict', label: 'Resolve a disagreement or conflict', suggests: 'conflict' },
      { value: 'build_relationship', label: 'Build or improve a relationship', suggests: 'collaboration' },
    ],
  },
  {
    id: 'power_dynamic',
    question: 'What\'s the power dynamic?',
    options: [
      { value: 'equal', label: 'Roughly equal power', suggests: 'negotiation' },
      { value: 'they_have_more', label: 'They have more power', suggests: 'persuasion' },
      { value: 'i_have_more', label: 'I have more power', suggests: 'influence' },
      { value: 'complex', label: 'It\'s complicated', suggests: 'unknown' },
    ],
  },
  {
    id: 'relationship',
    question: 'What\'s your relationship with the other party?',
    options: [
      { value: 'ongoing', label: 'Ongoing relationship that matters', suggests: 'collaboration' },
      { value: 'one_time', label: 'One-time or transactional', suggests: 'negotiation' },
      { value: 'adversarial', label: 'Currently adversarial', suggests: 'conflict' },
      { value: 'unknown', label: 'Don\'t know them well', suggests: 'persuasion' },
    ],
  },
  {
    id: 'outcome_dependency',
    question: 'How dependent are outcomes?',
    options: [
      { value: 'interdependent', label: 'We need each other to succeed', suggests: 'collaboration' },
      { value: 'zero_sum', label: 'If one wins, the other loses', suggests: 'negotiation' },
      { value: 'one_sided', label: 'Only one side needs something', suggests: 'persuasion' },
      { value: 'unclear', label: 'Not sure yet', suggests: 'unknown' },
    ],
  },
];

// ============ GUIDED WORKFLOWS ============
// Step-by-step processes for common scenarios
export const NP_WORKFLOWS = {
  prepareForNegotiation: {
    name: 'Prepare for a Negotiation',
    description: 'Systematically prepare for an upcoming negotiation',
    steps: [
      { title: 'Define the Situation', elements: ['situation', 'stakeholder'], prompt: 'What is this negotiation about? Who\'s involved?' },
      { title: 'Understand Interests', elements: ['position', 'interest'], prompt: 'What do both sides want? Why?' },
      { title: 'Assess Power', elements: ['batna', 'leverage_factor'], prompt: 'What are the alternatives? Who has more power?' },
      { title: 'Find the Zone', elements: ['zopa_hypothesis', 'concession'], prompt: 'Where might agreement be possible? What could be traded?' },
      { title: 'Set Boundaries', elements: ['red_line', 'assumption'], prompt: 'What won\'t you accept? What are you assuming?' },
      { title: 'Prepare Questions', elements: ['question'], prompt: 'What do you need to ask? What do you need to learn?' },
    ],
  },
  makePitch: {
    name: 'Prepare a Persuasive Pitch',
    description: 'Structure your thinking before trying to persuade someone',
    steps: [
      { title: 'Know Your Audience', elements: ['stakeholder', 'frame'], prompt: 'Who are you persuading? How do they see the world?' },
      { title: 'Understand Their Interests', elements: ['interest', 'constraint'], prompt: 'What do they care about? What limits them?' },
      { title: 'Anticipate Objections', elements: ['position', 'assumption'], prompt: 'What will they push back on? What assumptions are you making?' },
      { title: 'Find Emotional Hooks', elements: ['emotional_driver'], prompt: 'What emotions are in play? What will resonate?' },
      { title: 'Prepare for Questions', elements: ['question'], prompt: 'What will they ask? How will you respond?' },
    ],
  },
  resolveConflict: {
    name: 'Work Through a Conflict',
    description: 'Understand and address a difficult situation',
    steps: [
      { title: 'Ground the Situation', elements: ['situation', 'trigger'], prompt: 'What happened? What triggered this?' },
      { title: 'Map Perspectives', elements: ['frame', 'emotional_driver'], prompt: 'How does each side see this? What emotions are involved?' },
      { title: 'Find Underlying Interests', elements: ['interest', 'position'], prompt: 'Beyond positions, what do people actually need?' },
      { title: 'Identify Common Ground', elements: ['interest'], prompt: 'What do both sides want? Where is there overlap?' },
      { title: 'Plan Next Steps', elements: ['question', 'reflection'], prompt: 'What needs to happen? What have you learned?' },
    ],
  },
};

// ============ JOURNAL ENTRY TYPES ============
export const NP_JOURNAL_TYPES = [
  { id: 'before', name: 'Before', description: 'Notes before the interaction', icon: '📝' },
  { id: 'during', name: 'During', description: 'Notes during (if possible)', icon: '✏️' },
  { id: 'after', name: 'After', description: 'Reflection after the interaction', icon: '🔍' },
  { id: 'insight', name: 'Insight', description: 'A realization or learning', icon: '💡' },
];

// ============ PARTY TYPES ============
export const NP_PARTIES = [
  { id: 'mine', name: 'Mine', description: 'My perspective, interests, or actions' },
  { id: 'theirs', name: 'Theirs', description: 'Their perspective, interests, or actions' },
  { id: 'shared', name: 'Shared', description: 'Something both parties have in common' },
  { id: 'external', name: 'External', description: 'External factors affecting both parties' },
];

// ============ CONFIDENCE LEVELS ============
export const NP_CONFIDENCE_LEVELS = [
  { id: 'guess', name: 'Guess', description: 'Pure speculation', color: '#fecaca' },
  { id: 'assumption', name: 'Assumption', description: 'Belief without verification', color: '#fef08a' },
  { id: 'likely', name: 'Likely', description: 'Strong evidence or reasoning', color: '#bef264' },
  { id: 'known', name: 'Known', description: 'Verified or directly communicated', color: '#86efac' },
];

// ============ HELPER FUNCTIONS ============
export function getElementsByCategory(category) {
  return NP_ELEMENT_TYPES.filter(t => t.category === category);
}

export function getElementTypeDefinition(typeId) {
  return NP_ELEMENT_TYPE_MAP[typeId];
}

export function getCategoryElements() {
  return Object.entries(NP_ELEMENT_CATEGORIES).map(([id, cat]) => ({
    ...cat,
    id,
    elements: getElementsByCategory(id),
  }));
}

// Analyze elements and return relevant reflective prompts
export function getReflectivePrompts(elements, relationships = []) {
  const prompts = [];

  if (!elements || elements.length === 0) return prompts;

  // Count elements by party
  const myElements = elements.filter(e => e.party === 'mine');
  const theirElements = elements.filter(e => e.party === 'theirs');
  const sharedElements = elements.filter(e => e.party === 'shared');

  // Count by type
  const positions = elements.filter(e => e.element_type === 'position');
  const interests = elements.filter(e => e.element_type === 'interest');
  const batnas = elements.filter(e => e.element_type === 'batna');
  const redLines = elements.filter(e => e.element_type === 'red_line');
  const questions = elements.filter(e => e.element_type === 'question');
  const stakeholders = elements.filter(e => e.element_type === 'stakeholder');
  const frames = elements.filter(e => e.element_type === 'frame');
  const emotionalDrivers = elements.filter(e => e.element_type === 'emotional_driver');

  // Check patterns and add relevant prompts

  // All focus on their perspective
  if (theirElements.length > 0 && myElements.length === 0) {
    prompts.push(NP_REFLECTIVE_PROMPTS.allTheirPerspective);
  }

  // Positions but no interests
  if (positions.length > 0 && interests.length === 0) {
    prompts.push(NP_REFLECTIVE_PROMPTS.noInterests);
  }

  // No BATNA
  if (batnas.length === 0 && elements.length >= 3) {
    prompts.push(NP_REFLECTIVE_PROMPTS.noBATNA);
  }

  // High confidence without evidence
  const highConfidenceNoEvidence = elements.filter(
    e => (e.confidence === 'known' || e.confidence === 'likely') && !e.evidence
  );
  if (highConfidenceNoEvidence.length >= 2) {
    prompts.push(NP_REFLECTIVE_PROMPTS.highConfidenceNoEvidence);
  }

  // Too many red lines
  if (redLines.length > 3) {
    prompts.push(NP_REFLECTIVE_PROMPTS.manyRedLines);
  }

  // No shared interests
  if (sharedElements.length === 0 && elements.length >= 5) {
    prompts.push(NP_REFLECTIVE_PROMPTS.noSharedInterests);
  }

  // Only negative emotions
  const negativeEmotions = emotionalDrivers.filter(e =>
    e.content?.toLowerCase().includes('fear') ||
    e.content?.toLowerCase().includes('anger') ||
    e.content?.toLowerCase().includes('frustrat') ||
    e.content?.toLowerCase().includes('anxious')
  );
  if (negativeEmotions.length > 0 && negativeEmotions.length === emotionalDrivers.length) {
    prompts.push(NP_REFLECTIVE_PROMPTS.allNegative);
  }

  // Frame clash detection
  const myFrames = frames.filter(f => f.party === 'mine');
  const theirFrames = frames.filter(f => f.party === 'theirs');
  if (myFrames.length > 0 && theirFrames.length > 0) {
    prompts.push(NP_REFLECTIVE_PROMPTS.frameClash);
  }

  // No questions prepared
  if (elements.length >= 5 && questions.length === 0) {
    prompts.push(NP_REFLECTIVE_PROMPTS.noQuestions);
  }

  // Only one stakeholder
  if (stakeholders.length > 0 && stakeholders.length <= 2) {
    prompts.push(NP_REFLECTIVE_PROMPTS.onlyOneStakeholder);
  }

  return prompts;
}
