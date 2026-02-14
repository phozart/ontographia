// components/np/views/index.js
// Export all N&P views

export { default as SituationCanvas } from './SituationCanvas';
export { default as PerspectiveMapper } from './PerspectiveMapper';
export { default as InterestPositionMap } from './InterestPositionMap';
export { default as ZOPASketch } from './ZOPASketch';
export { default as PreparationJournal } from './PreparationJournal';
export { default as ConversationReview } from './ConversationReview';
export { default as GuidancePanel } from './GuidancePanel';

export const NP_VIEWS = [
  {
    id: 'situation',
    name: 'Situation Canvas',
    description: 'Ground the situation before diving into tactics',
    component: 'SituationCanvas',
    icon: '🎯'
  },
  {
    id: 'perspective',
    name: 'Perspective Mapper',
    description: 'Map your perspective vs theirs (known vs assumed)',
    component: 'PerspectiveMapper',
    icon: '👁️'
  },
  {
    id: 'interests',
    name: 'Interest-Position Map',
    description: 'Distinguish positions from underlying interests',
    component: 'InterestPositionMap',
    icon: '💡'
  },
  {
    id: 'zopa',
    name: 'ZOPA Sketch',
    description: 'Map the zone of possible agreement',
    component: 'ZOPASketch',
    icon: '🤝'
  },
  {
    id: 'journal',
    name: 'Preparation Journal',
    description: 'Document preparation and reflections',
    component: 'PreparationJournal',
    icon: '📓'
  },
  {
    id: 'conversation',
    name: 'Conversation Review',
    description: 'Analyze conversation turns post-hoc',
    component: 'ConversationReview',
    icon: '💬'
  }
];
