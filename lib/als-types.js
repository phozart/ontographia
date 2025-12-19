// lib/als-types.js - Type definitions for Academic Learning Studio

// Learning Modes - cognitive intentions, not activities
export const ALS_LEARNING_MODES = {
  exploration: {
    id: 'exploration',
    name: 'Exploration',
    icon: '🔍',
    color: '#6366f1',
    description: 'First exposure to new material',
    prompts: [
      'What is this about?',
      'What seems important here?',
      'What vocabulary is new?'
    ],
    signals: ['I got an overview', 'I identified key topics', 'I have questions now']
  },
  conceptual: {
    id: 'conceptual',
    name: 'Conceptual Understanding',
    icon: '💡',
    color: '#8b5cf6',
    description: 'Grasping core ideas and relationships',
    prompts: [
      'What is the main idea?',
      'How does this connect to what I know?',
      'Why does this matter?'
    ],
    signals: ['I can explain in my own words', 'I see the structure', 'The logic makes sense']
  },
  analytical: {
    id: 'analytical',
    name: 'Analytical Comparison',
    icon: '⚖️',
    color: '#ec4899',
    description: 'Comparing, contrasting, and examining relationships',
    prompts: [
      'How does this differ from alternatives?',
      'What are the strengths and weaknesses?',
      'What assumptions underlie this?'
    ],
    signals: ['I can compare viewpoints', 'I see trade-offs', 'I understand distinctions']
  },
  critical: {
    id: 'critical',
    name: 'Critical Evaluation',
    icon: '🎯',
    color: '#f59e0b',
    description: 'Questioning, challenging, and evaluating',
    prompts: [
      'Is this argument valid?',
      'What evidence supports this?',
      'What are the limitations?'
    ],
    signals: ['I can critique this', 'I identified weaknesses', 'I formed my own view']
  },
  memorisation: {
    id: 'memorisation',
    name: 'Memorisation',
    icon: '🧠',
    color: '#ef4444',
    description: 'Committing facts, terms, or procedures to memory',
    prompts: [
      'What do I need to recall exactly?',
      'What patterns help me remember?',
      'Have I tested myself?'
    ],
    signals: ['I can recall without looking', 'I know the key facts', 'I can reproduce this']
  },
  synthesis: {
    id: 'synthesis',
    name: 'Synthesis',
    icon: '✍️',
    color: '#22c55e',
    description: 'Writing, explaining, or integrating knowledge',
    prompts: [
      'How would I explain this to someone?',
      'What connects these ideas?',
      'How does this fit the bigger picture?'
    ],
    signals: ['I can write about this', 'I integrated multiple sources', 'I created something new']
  },
  application: {
    id: 'application',
    name: 'Application & Transfer',
    icon: '🔧',
    color: '#3b82f6',
    description: 'Applying knowledge to new problems or contexts',
    prompts: [
      'How would I use this in practice?',
      'What problems can this solve?',
      'Where else does this apply?'
    ],
    signals: ['I can apply to new cases', 'I solved problems with this', 'I see practical uses']
  }
};

// Understanding Signals - qualitative reflections on understanding level
export const ALS_UNDERSTANDING_SIGNALS = {
  clear: {
    id: 'clear',
    label: 'Clear Understanding',
    icon: '✅',
    color: '#22c55e',
    description: 'I can explain this in my own words'
  },
  partial: {
    id: 'partial',
    label: 'Partial Understanding',
    icon: '🔶',
    color: '#f59e0b',
    description: 'I recognise the structure but not all details'
  },
  confused: {
    id: 'confused',
    label: 'Confused',
    icon: '❓',
    color: '#ef4444',
    description: 'I feel confused about the core idea'
  },
  memorised: {
    id: 'memorised',
    label: 'Memorised Only',
    icon: '📝',
    color: '#8b5cf6',
    description: 'I can recall but may not fully understand'
  },
  applicable: {
    id: 'applicable',
    label: 'Can Apply',
    icon: '🎯',
    color: '#3b82f6',
    description: 'I can apply this to new examples'
  }
};

// Reflection/Insight Types
export const ALS_INSIGHT_TYPES = {
  breakthrough: {
    id: 'breakthrough',
    label: 'Breakthrough',
    icon: '💡',
    description: 'Something finally clicked'
  },
  confusion: {
    id: 'confusion',
    label: 'Confusion',
    icon: '🤔',
    description: 'Something remains unclear'
  },
  strategy_shift: {
    id: 'strategy_shift',
    label: 'Strategy Shift',
    icon: '🔄',
    description: 'Need to change my approach'
  },
  connection: {
    id: 'connection',
    label: 'Connection',
    icon: '🔗',
    description: 'Found link to other knowledge'
  },
  question: {
    id: 'question',
    label: 'New Question',
    icon: '❓',
    description: 'Discovered a new question to explore'
  }
};

// Situation Status
export const ALS_SITUATION_STATUS = {
  active: {
    id: 'active',
    label: 'Active',
    color: '#22c55e',
    description: 'Currently studying'
  },
  paused: {
    id: 'paused',
    label: 'Paused',
    color: '#f59e0b',
    description: 'Temporarily on hold'
  },
  completed: {
    id: 'completed',
    label: 'Completed',
    color: '#3b82f6',
    description: 'Learning objective achieved'
  },
  archived: {
    id: 'archived',
    label: 'Archived',
    color: '#6b7280',
    description: 'No longer active'
  }
};

// Default session durations (in minutes) for quick selection
export const ALS_SESSION_DURATIONS = [
  { value: 15, label: '15 min' },
  { value: 25, label: '25 min (Pomodoro)' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 0, label: 'No timer' }
];

// Format duration for display
export function formatDuration(minutes) {
  if (!minutes) return '-';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Format time elapsed for timer display
export function formatTimeElapsed(seconds) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
