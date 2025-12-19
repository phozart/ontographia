// Mental Models & Sensemaking Studio - Guidance System
// Provides contextual prompts, pattern-based suggestions, and self-guiding features

import { MMS_LENSES, MMS_ELEMENT_TYPES } from './mms-types';

/**
 * Pattern-based guidance suggestions
 * These are computed from the current state of elements and situation
 */
export const MMS_GUIDANCE_PATTERNS = {
  noAlternatives: {
    id: 'noAlternatives',
    priority: 1,
    condition: (elements) => {
      const frames = elements.filter(e => e.element_type === 'frame');
      const alternatives = elements.filter(e => e.element_type === 'alternative');
      return frames.length > 0 && alternatives.length === 0;
    },
    message: 'You have frames but no alternatives. Consider challenging your assumptions.',
    detail: 'Every frame has a flip side. What would change if the opposite were true?',
    action: { label: 'Add Alternative', type: 'alternative' },
    suggestedLens: 'counterfactual'
  },

  noBoundaries: {
    id: 'noBoundaries',
    priority: 2,
    condition: (elements) => {
      const frames = elements.filter(e => e.element_type === 'frame');
      const boundaries = elements.filter(e => e.element_type === 'boundary');
      return frames.length >= 2 && boundaries.length === 0;
    },
    message: 'No boundaries captured yet. Where might your frames break down?',
    detail: 'Understanding where a model stops working is as important as where it applies.',
    action: { label: 'Add Boundary', type: 'boundary' },
    suggestedLens: 'scenarios'
  },

  lowEvidence: {
    id: 'lowEvidence',
    priority: 3,
    condition: (elements) => {
      const frames = elements.filter(e => e.element_type === 'frame');
      const evidence = elements.filter(e => e.element_type === 'evidence');
      return frames.length > 2 && evidence.length < 1;
    },
    message: 'Multiple frames but no evidence. What grounds these beliefs?',
    detail: 'Anchor your thinking to observable reality. What supports or contradicts these frames?',
    action: { label: 'Add Evidence', type: 'evidence' }
  },

  noImplications: {
    id: 'noImplications',
    priority: 2,
    condition: (elements) => {
      const frames = elements.filter(e => e.element_type === 'frame');
      const implications = elements.filter(e => e.element_type === 'implication');
      return frames.length >= 1 && implications.length === 0;
    },
    message: 'What are the consequences? Add implications to explore what follows.',
    detail: 'If these frames hold, what happens next? What improves or worsens?',
    action: { label: 'Add Implication', type: 'implication' },
    suggestedLens: 'trade-offs'
  },

  manyThoughtsNoFrames: {
    id: 'manyThoughtsNoFrames',
    priority: 1,
    condition: (elements) => {
      const thoughts = elements.filter(e => e.element_type === 'thought');
      const frames = elements.filter(e => e.element_type === 'frame');
      return thoughts.length >= 4 && frames.length === 0;
    },
    message: 'Many thoughts captured. Can you name the underlying frame or model?',
    detail: 'Look for patterns in your thoughts. What mental model connects them?',
    action: { label: 'Add Frame', type: 'frame' },
    suggestedLens: 'mental-models'
  },

  allAssumptions: {
    id: 'allAssumptions',
    priority: 2,
    condition: (elements) => {
      const thoughts = elements.filter(e => e.element_type === 'thought');
      const assumptions = thoughts.filter(e =>
        e.confidence === 'assumption' || e.confidence === 'guess' ||
        (e.properties?.subtype === 'assumption')
      );
      return thoughts.length >= 3 && assumptions.length === thoughts.length;
    },
    message: 'All your thoughts are assumptions. What do you actually know?',
    detail: 'Distinguish between what you know and what you\'re guessing.',
    action: { label: 'Add Evidence', type: 'evidence' }
  },

  experienceTrigger: {
    id: 'experienceTrigger',
    priority: 3,
    condition: (elements, situation) => {
      const keywords = ['confusing', 'frustrating', 'trust', 'effort', 'unclear', 'complaints', 'friction', 'user', 'customer', 'experience'];
      const text = ((situation?.description || '') + ' ' + elements.map(e => e.content || '').join(' ')).toLowerCase();
      return keywords.some(k => text.includes(k));
    },
    message: 'This situation involves perception and experience.',
    detail: 'Consider switching to the Experience Lens to explore how this feels from outside.',
    action: { label: 'Switch to Experience', lens: 'experience' },
    suggestedLens: 'experience'
  },

  conflictingFrames: {
    id: 'conflictingFrames',
    priority: 1,
    condition: (elements, situation, relationships) => {
      const challengeRels = (relationships || []).filter(r =>
        r.relationship_type === 'challenges' || r.relationship_type === 'refutes'
      );
      return challengeRels.length >= 2;
    },
    message: 'Conflicting views detected. This is good - explore the tension.',
    detail: 'Disagreement often reveals important nuances. What makes each perspective valid?',
    action: { label: 'Map Trade-offs', lens: 'trade-offs' },
    suggestedLens: 'trade-offs'
  },

  singlePerspective: {
    id: 'singlePerspective',
    priority: 3,
    condition: (elements) => {
      const thoughts = elements.filter(e => e.element_type === 'thought');
      const selfSourced = thoughts.filter(e => !e.source || e.source === 'self');
      return thoughts.length >= 5 && selfSourced.length === thoughts.length;
    },
    message: 'All thoughts from your own perspective. What would others say?',
    detail: 'Seek out different viewpoints. What would a critic, an expert, or a newcomer see?',
    action: { label: 'Add Alternative Perspective', type: 'thought' }
  }
};

/**
 * Empty state guidance for each lens
 */
export const MMS_EMPTY_STATE_GUIDANCE = {
  'mental-models': {
    title: 'Start Exploring Mental Models',
    icon: '🧠',
    description: 'Mental models are the invisible frameworks shaping how you interpret this situation.',
    steps: [
      { action: 'Add a Thought', detail: 'What do you believe is true here?' },
      { action: 'Create a Frame', detail: 'Name the mental model you\'re using' },
      { action: 'Question it', detail: 'What assumptions underlie this?' }
    ],
    quickStart: [
      { label: 'I believe...', type: 'thought', subtype: 'belief' },
      { label: 'I\'m assuming...', type: 'thought', subtype: 'assumption' },
      { label: 'The way I see it...', type: 'frame', subtype: 'perspective' }
    ]
  },

  'counterfactual': {
    title: 'Challenge Your Thinking',
    icon: '🔄',
    description: 'Counterfactuals reveal blind spots by exploring what else could be true.',
    steps: [
      { action: 'Pick a Frame', detail: 'Choose a belief or model you hold strongly' },
      { action: 'Flip it', detail: 'What if the opposite were true?' },
      { action: 'Explore', detail: 'What would change? What stays the same?' }
    ],
    quickStart: [
      { label: 'What if instead...', type: 'alternative' },
      { label: 'A critic would say...', type: 'alternative' },
      { label: 'The opposite view...', type: 'alternative' }
    ]
  },

  'trade-offs': {
    title: 'Map Trade-offs',
    icon: '⚖️',
    description: 'Every choice has consequences. Make the tensions visible.',
    steps: [
      { action: 'State the choice', detail: 'What decision or path are you considering?' },
      { action: 'What improves?', detail: 'Add implications for what gets better' },
      { action: 'What worsens?', detail: 'Be honest about what you sacrifice' }
    ],
    quickStart: [
      { label: 'If we do this, then...', type: 'implication' },
      { label: 'We gain...', type: 'implication' },
      { label: 'We sacrifice...', type: 'implication' }
    ]
  },

  'scenarios': {
    title: 'Explore Future Scenarios',
    icon: '🔮',
    description: 'The future is uncertain. Prepare for multiple possibilities.',
    steps: [
      { action: 'Create scenarios', detail: 'Define 2-4 plausible futures' },
      { action: 'Set boundaries', detail: 'Under what conditions would each occur?' },
      { action: 'Map implications', detail: 'What follows from each scenario?' }
    ],
    quickStart: [
      { label: 'Best case...', type: 'frame', subtype: 'perspective' },
      { label: 'Worst case...', type: 'frame', subtype: 'perspective' },
      { label: 'Most likely...', type: 'frame', subtype: 'perspective' }
    ]
  },

  'patterns': {
    title: 'Find Patterns & Analogies',
    icon: '🔗',
    description: 'Connect this situation to past experience and known patterns.',
    steps: [
      { action: 'Recall', detail: 'Where have you seen this before?' },
      { action: 'Name the pattern', detail: 'What does this resemble?' },
      { action: 'Test the fit', detail: 'Where does the analogy break?' }
    ],
    quickStart: [
      { label: 'This is like...', type: 'frame', subtype: 'narrative' },
      { label: 'The pattern here is...', type: 'frame', subtype: 'heuristic' },
      { label: 'But it breaks when...', type: 'boundary' }
    ]
  },

  'experience': {
    title: 'Map the Experience',
    icon: '👁️',
    description: 'Step outside your own perspective. How does this feel to others?',
    steps: [
      { action: 'Walk through it', detail: 'Add steps in the experience journey' },
      { action: 'Note friction', detail: 'Where is there effort, confusion, or frustration?' },
      { action: 'Find the peak', detail: 'Which moment shapes the lasting impression?' }
    ],
    quickStart: [
      { label: 'First, they...', type: 'thought', subtype: 'experience-step' },
      { label: 'Then, they feel...', type: 'thought', subtype: 'observation' },
      { label: 'The frustrating part is...', type: 'thought', subtype: 'concern' }
    ]
  }
};

/**
 * Contextual prompts based on current lens and element selection
 */
export function getContextualPrompts(lens, selectedElement, elements) {
  const lensConfig = MMS_LENSES[lens];
  if (!lensConfig) return [];

  const prompts = [...(lensConfig.prompts || [])];

  // Add element-specific prompts
  if (selectedElement) {
    const elementType = selectedElement.element_type;

    if (elementType === 'thought') {
      prompts.push({ text: 'Is this an assumption or a fact?', type: 'thought' });
      prompts.push({ text: 'Where did this thought come from?', type: 'thought' });
    }

    if (elementType === 'frame') {
      prompts.push({ text: 'What does this frame make you notice?', type: 'thought' });
      prompts.push({ text: 'What does this frame hide?', type: 'boundary' });
      prompts.push({ text: 'What\'s the opposite frame?', type: 'alternative' });
    }

    if (elementType === 'alternative') {
      prompts.push({ text: 'What evidence supports this alternative?', type: 'evidence' });
      prompts.push({ text: 'What would need to be true for this to be right?', type: 'thought' });
    }
  }

  // Add pattern-based prompts
  const thoughts = elements.filter(e => e.element_type === 'thought');
  const frames = elements.filter(e => e.element_type === 'frame');

  if (thoughts.length > 0 && frames.length === 0) {
    prompts.push({ text: 'What pattern connects these thoughts?', type: 'frame' });
  }

  return prompts.slice(0, 6); // Limit to 6 prompts
}

/**
 * Get active guidance suggestions based on current state
 */
export function getGuidanceSuggestions(elements, situation, relationships) {
  const suggestions = [];

  for (const pattern of Object.values(MMS_GUIDANCE_PATTERNS)) {
    if (pattern.condition(elements, situation, relationships)) {
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

  // Sort by priority (lower = more important)
  return suggestions.sort((a, b) => a.priority - b.priority);
}

/**
 * Get empty state guidance for a lens
 */
export function getEmptyStateGuidance(lensId) {
  return MMS_EMPTY_STATE_GUIDANCE[lensId] || MMS_EMPTY_STATE_GUIDANCE['mental-models'];
}

/**
 * Get thinking quality indicators
 */
export function getThinkingQuality(elements, relationships) {
  const metrics = {
    diversity: 0,
    depth: 0,
    grounding: 0,
    challenge: 0
  };

  const thoughts = elements.filter(e => e.element_type === 'thought');
  const frames = elements.filter(e => e.element_type === 'frame');
  const alternatives = elements.filter(e => e.element_type === 'alternative');
  const evidence = elements.filter(e => e.element_type === 'evidence');
  const boundaries = elements.filter(e => e.element_type === 'boundary');
  const implications = elements.filter(e => e.element_type === 'implication');

  // Diversity: variety of element types used
  const typesUsed = new Set(elements.map(e => e.element_type)).size;
  metrics.diversity = Math.min(100, (typesUsed / 6) * 100);

  // Depth: relationships and implications
  const relCount = (relationships || []).length;
  const implCount = implications.length;
  metrics.depth = Math.min(100, ((relCount + implCount) / Math.max(elements.length, 1)) * 50);

  // Grounding: evidence and known facts
  const knownCount = elements.filter(e => e.confidence === 'known').length;
  metrics.grounding = Math.min(100, ((evidence.length + knownCount) / Math.max(elements.length, 1)) * 100);

  // Challenge: alternatives and boundaries
  metrics.challenge = Math.min(100, ((alternatives.length + boundaries.length) / Math.max(frames.length, 1)) * 100);

  return {
    ...metrics,
    overall: Math.round((metrics.diversity + metrics.depth + metrics.grounding + metrics.challenge) / 4)
  };
}

/**
 * Suggest next actions based on current state
 */
export function suggestNextActions(elements, lens, situation) {
  const actions = [];
  const elementCounts = {};

  for (const el of elements) {
    elementCounts[el.element_type] = (elementCounts[el.element_type] || 0) + 1;
  }

  const lensConfig = MMS_LENSES[lens];
  if (!lensConfig) return actions;

  // Suggest focus elements for current lens
  for (const focusType of lensConfig.focusElements || []) {
    if ((elementCounts[focusType] || 0) === 0) {
      const typeConfig = MMS_ELEMENT_TYPES[focusType];
      actions.push({
        type: 'add',
        elementType: focusType,
        label: `Add ${typeConfig?.name || focusType}`,
        description: typeConfig?.description,
        priority: 1
      });
    }
  }

  // Generic suggestions based on what's missing
  if (!elementCounts.frame && elementCounts.thought >= 2) {
    actions.push({
      type: 'add',
      elementType: 'frame',
      label: 'Name the pattern',
      description: 'Group your thoughts into a frame or mental model',
      priority: 2
    });
  }

  if (elementCounts.frame >= 1 && !elementCounts.alternative) {
    actions.push({
      type: 'add',
      elementType: 'alternative',
      label: 'Challenge your frame',
      description: 'What if the opposite were true?',
      priority: 2
    });
  }

  if (elementCounts.frame >= 2 && !elementCounts.implication) {
    actions.push({
      type: 'add',
      elementType: 'implication',
      label: 'Explore consequences',
      description: 'What follows from these frames?',
      priority: 2
    });
  }

  // Lens switching suggestions
  const suggestions = getGuidanceSuggestions(elements, situation, []);
  for (const s of suggestions) {
    if (s.suggestedLens && s.suggestedLens !== lens) {
      actions.push({
        type: 'switch-lens',
        lens: s.suggestedLens,
        label: `Try ${MMS_LENSES[s.suggestedLens]?.name}`,
        description: s.message,
        priority: 3
      });
    }
  }

  return actions.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/**
 * Learning tips that appear occasionally
 */
export const MMS_LEARNING_TIPS = [
  {
    id: 'tip-assumptions',
    title: 'Spotting Assumptions',
    content: 'Assumptions hide in phrases like "obviously", "of course", "everyone knows". When you notice these, add them as explicit assumptions.',
    elementTypes: ['thought']
  },
  {
    id: 'tip-frames',
    title: 'Naming Frames',
    content: 'A frame is like a lens. It highlights some things and hides others. Try naming your frame with "The X model" or "The Y perspective".',
    elementTypes: ['frame']
  },
  {
    id: 'tip-alternatives',
    title: 'Finding Alternatives',
    content: 'Ask: "What would someone who completely disagrees with me say?" Their view might reveal what you\'re missing.',
    elementTypes: ['alternative']
  },
  {
    id: 'tip-evidence',
    title: 'Grounding in Evidence',
    content: 'Evidence anchors thinking to reality. Ask: "What would convince a skeptic?" and "What would I see if this were true?"',
    elementTypes: ['evidence']
  },
  {
    id: 'tip-boundaries',
    title: 'Finding Boundaries',
    content: 'Every model breaks down somewhere. Ask: "Under what conditions would this stop being true?"',
    elementTypes: ['boundary']
  },
  {
    id: 'tip-implications',
    title: 'Tracing Implications',
    content: 'Follow the thread: "If this is true, then what? And then what?" Keep going until you find something surprising.',
    elementTypes: ['implication']
  }
];

/**
 * Get a relevant learning tip for the current context
 */
export function getLearningTip(recentElementType, shownTips = []) {
  const relevantTips = MMS_LEARNING_TIPS.filter(tip =>
    !shownTips.includes(tip.id) &&
    (!recentElementType || tip.elementTypes.includes(recentElementType))
  );

  if (relevantTips.length === 0) return null;
  return relevantTips[Math.floor(Math.random() * relevantTips.length)];
}
