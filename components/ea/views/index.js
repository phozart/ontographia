// components/ea/views/index.js
// Export all EA view components

export { default as CapabilityHeatmap } from './CapabilityHeatmap';
export { default as ApplicationPortfolio } from './ApplicationPortfolio';
export { default as IntegrationMap } from './IntegrationMap';
export { default as TechnologyStack } from './TechnologyStack';
export { default as ValueStreamMap } from './ValueStreamMap';
export { default as GapAnalysis } from './GapAnalysis';
export { default as Roadmap } from './Roadmap';
export { default as TraceabilityMatrix } from './TraceabilityMatrix';

// View metadata for navigation
export const EA_VIEWS = [
  {
    id: 'capability-heatmap',
    name: 'Capability Heatmap',
    description: 'Visualize capabilities by maturity or strategic importance',
    icon: '🎨',
    component: 'CapabilityHeatmap',
    category: 'Strategy'
  },
  {
    id: 'application-portfolio',
    name: 'Application Portfolio (TIME)',
    description: 'Classify applications: Tolerate, Invest, Migrate, Eliminate',
    icon: '📊',
    component: 'ApplicationPortfolio',
    category: 'Application'
  },
  {
    id: 'integration-map',
    name: 'Integration Map',
    description: 'Visualize application integrations and dependencies',
    icon: '🔗',
    component: 'IntegrationMap',
    category: 'Application'
  },
  {
    id: 'technology-stack',
    name: 'Technology Stack',
    description: 'Layered view of technology infrastructure',
    icon: '📚',
    component: 'TechnologyStack',
    category: 'Technology'
  },
  {
    id: 'value-stream-map',
    name: 'Value Stream Map',
    description: 'End-to-end value delivery visualization',
    icon: '🌊',
    component: 'ValueStreamMap',
    category: 'Business'
  },
  {
    id: 'gap-analysis',
    name: 'Gap Analysis',
    description: 'Compare baseline vs target architecture',
    icon: '🔍',
    component: 'GapAnalysis',
    category: 'Implementation'
  },
  {
    id: 'roadmap',
    name: 'Architecture Roadmap',
    description: 'Timeline view of work packages and plateaus',
    icon: '🗺️',
    component: 'Roadmap',
    category: 'Implementation'
  },
  {
    id: 'traceability-matrix',
    name: 'Traceability Matrix',
    description: 'Cross-layer dependency relationships',
    icon: '📋',
    component: 'TraceabilityMatrix',
    category: 'Analysis'
  }
];

// Group views by category
export const EA_VIEW_CATEGORIES = {
  Strategy: EA_VIEWS.filter(v => v.category === 'Strategy'),
  Business: EA_VIEWS.filter(v => v.category === 'Business'),
  Application: EA_VIEWS.filter(v => v.category === 'Application'),
  Technology: EA_VIEWS.filter(v => v.category === 'Technology'),
  Implementation: EA_VIEWS.filter(v => v.category === 'Implementation'),
  Analysis: EA_VIEWS.filter(v => v.category === 'Analysis')
};
