// lib/als-guidance.js - Guidance system for Academic Learning Studio

import { ALS_LEARNING_MODES } from './als-types';

// Pre-session prompts to help choose learning mode
export const ALS_PRE_SESSION_PROMPTS = [
  {
    id: 'intention',
    question: 'What kind of understanding are you aiming for?',
    detail: 'Is this exploration, deep understanding, or memorisation?'
  },
  {
    id: 'focus',
    question: 'What question do you want to answer?',
    detail: 'Having a clear focus improves learning outcomes'
  },
  {
    id: 'readiness',
    question: 'Are you building on prior knowledge or starting fresh?',
    detail: 'This helps choose the right learning mode'
  }
];

// During-session prompts (minimal, optional)
export const ALS_DURING_SESSION_PROMPTS = [
  {
    id: 'alignment',
    question: 'Still aligned with your learning intention?',
    showAfterMinutes: 20
  },
  {
    id: 'mode-check',
    question: 'Is this mode still serving your goal?',
    showAfterMinutes: 30
  }
];

// Post-session reflection prompts
export const ALS_POST_SESSION_PROMPTS = {
  whatClicked: {
    id: 'what-clicked',
    label: 'What clicked?',
    placeholder: 'What made sense or became clear?',
    examples: ['The relationship between X and Y', 'Why this concept matters', 'The core principle']
  },
  whatConfused: {
    id: 'what-confused',
    label: 'What confused you?',
    placeholder: 'What remains unclear or difficult?',
    examples: ['The terminology', 'Why this follows from that', 'How to apply this']
  },
  modeAppropriate: {
    id: 'mode-appropriate',
    label: 'Was the learning mode appropriate?',
    options: [
      { value: true, label: 'Yes, it helped' },
      { value: false, label: 'No, should try different approach' }
    ]
  },
  nextAdjustment: {
    id: 'next-adjustment',
    label: 'What would you do differently?',
    placeholder: 'Adjustments for next session...',
    examples: ['Focus on understanding before memorising', 'Take more notes', 'Find better examples']
  }
};

// Pattern-based suggestions computed from session history
export const ALS_GUIDANCE_PATTERNS = {
  // Too much memorisation without understanding
  memoryWithoutUnderstanding: {
    id: 'memory-without-understanding',
    condition: (sessions) => {
      const recent = sessions.slice(-5);
      const memSessions = recent.filter(s => s.learningMode === 'memorisation');
      const conceptSessions = recent.filter(s => s.learningMode === 'conceptual');
      return memSessions.length >= 3 && conceptSessions.length === 0;
    },
    message: 'You often memorise before understanding. Is that intentional?',
    suggestion: 'Consider a conceptual understanding session first',
    suggestedMode: 'conceptual'
  },

  // Persistent confusion
  persistentConfusion: {
    id: 'persistent-confusion',
    condition: (sessions) => {
      const recent = sessions.slice(-4);
      const confused = recent.filter(s => s.understandingSignal === 'confused');
      return confused.length >= 2;
    },
    message: 'Confusion persists across sessions.',
    suggestion: 'Try a different learning mode or break down the topic',
    suggestedMode: 'exploration'
  },

  // All reading, no synthesis
  noSynthesis: {
    id: 'no-synthesis',
    condition: (sessions) => {
      const recent = sessions.slice(-6);
      const synthesisSessions = recent.filter(s => s.learningMode === 'synthesis');
      return recent.length >= 4 && synthesisSessions.length === 0;
    },
    message: 'Several sessions focus on reading. Synthesis might help now.',
    suggestion: 'Try explaining what you learned in your own words',
    suggestedMode: 'synthesis'
  },

  // Good progress - encourage application
  readyForApplication: {
    id: 'ready-for-application',
    condition: (sessions) => {
      const recent = sessions.slice(-3);
      const clearSessions = recent.filter(s => s.understandingSignal === 'clear');
      return clearSessions.length >= 2;
    },
    message: 'Good understanding achieved!',
    suggestion: 'Consider applying this knowledge to solidify learning',
    suggestedMode: 'application'
  },

  // Skipping reflection
  noReflections: {
    id: 'no-reflections',
    condition: (sessions, reflections) => {
      const recentSessions = sessions.slice(-4);
      const sessionIds = recentSessions.map(s => s.id);
      const recentReflections = reflections.filter(r => sessionIds.includes(r.sessionId));
      return recentSessions.length >= 3 && recentReflections.length === 0;
    },
    message: 'Reflections help improve learning strategy.',
    suggestion: 'Take a moment to reflect on recent sessions'
  }
};

// Get active suggestions based on session history
export function getGuidanceSuggestions(sessions, reflections) {
  const suggestions = [];

  Object.values(ALS_GUIDANCE_PATTERNS).forEach(pattern => {
    try {
      if (pattern.condition(sessions, reflections)) {
        suggestions.push({
          id: pattern.id,
          message: pattern.message,
          suggestion: pattern.suggestion,
          suggestedMode: pattern.suggestedMode
        });
      }
    } catch (e) {
      // Ignore pattern errors
    }
  });

  return suggestions;
}

// Get mode-specific prompts
export function getModePrompts(modeId) {
  const mode = ALS_LEARNING_MODES[modeId];
  return mode?.prompts || [];
}

// Suggest initial mode based on situation
export function suggestInitialMode(situation) {
  const keywords = (situation.description || '').toLowerCase() + ' ' + (situation.learningObjective || '').toLowerCase();

  if (keywords.includes('exam') || keywords.includes('test') || keywords.includes('quiz')) {
    return 'memorisation';
  }
  if (keywords.includes('essay') || keywords.includes('write') || keywords.includes('explain')) {
    return 'synthesis';
  }
  if (keywords.includes('compare') || keywords.includes('analyse') || keywords.includes('contrast')) {
    return 'analytical';
  }
  if (keywords.includes('evaluate') || keywords.includes('critique') || keywords.includes('argument')) {
    return 'critical';
  }
  if (keywords.includes('apply') || keywords.includes('practice') || keywords.includes('solve')) {
    return 'application';
  }
  if (keywords.includes('understand') || keywords.includes('concept') || keywords.includes('theory')) {
    return 'conceptual';
  }

  // Default to exploration for new topics
  return 'exploration';
}

// Empty state guidance
export function getEmptyStateGuidance() {
  return {
    icon: '📚',
    title: 'Start Your Learning Journey',
    description: 'Create a learning situation to begin tracking your study sessions and reflections.',
    steps: [
      {
        action: 'Create a learning situation',
        detail: 'Define what you want to learn'
      },
      {
        action: 'Start a session',
        detail: 'Choose a learning mode and focus question'
      },
      {
        action: 'Reflect afterwards',
        detail: 'Capture what clicked and what confused you'
      }
    ],
    quickStart: [
      { label: 'New Learning Situation', action: 'create-situation' }
    ]
  };
}

// Learning tips that rotate
export const ALS_LEARNING_TIPS = [
  {
    id: 'tip-spacing',
    title: 'Spaced Practice',
    content: 'Distribute your learning over time rather than cramming. Return to material after breaks to strengthen memory.'
  },
  {
    id: 'tip-testing',
    title: 'Test Yourself',
    content: 'Active recall through self-testing is more effective than passive re-reading.'
  },
  {
    id: 'tip-interleaving',
    title: 'Mix It Up',
    content: 'Interleave different topics or problem types rather than blocking practice on one thing.'
  },
  {
    id: 'tip-elaboration',
    title: 'Elaborate',
    content: 'Explain ideas in your own words and connect new knowledge to what you already know.'
  },
  {
    id: 'tip-concrete',
    title: 'Concrete Examples',
    content: 'Abstract concepts become clearer when you find or create concrete examples.'
  },
  {
    id: 'tip-metacognition',
    title: 'Think About Thinking',
    content: 'Reflect on how you learn best. Adjust your approach based on what works.'
  },
  {
    id: 'tip-confusion',
    title: 'Embrace Confusion',
    content: 'Confusion is a signal that learning is happening. Work through it rather than avoiding it.'
  },
  {
    id: 'tip-mode-match',
    title: 'Match Your Mode',
    content: 'Different learning goals need different approaches. Understanding requires different effort than memorising.'
  }
];

// Get a random tip not recently shown
export function getLearningTip(shownTipIds = []) {
  const availableTips = ALS_LEARNING_TIPS.filter(tip => !shownTipIds.includes(tip.id));
  if (availableTips.length === 0) return ALS_LEARNING_TIPS[0];
  return availableTips[Math.floor(Math.random() * availableTips.length)];
}
