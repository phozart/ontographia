// components/ea/views/index.js
// Export all EA view components

// Dashboard (Aggregation Hub)
export { default as EADashboard } from './EADashboard';

export { default as CapabilityHeatmap } from './CapabilityHeatmap';
export { default as ApplicationPortfolio } from './ApplicationPortfolio';
export { default as IntegrationMap } from './IntegrationMap';
export { default as TechnologyStack } from './TechnologyStack';
export { default as ValueStreamMap } from './ValueStreamMap';
export { default as ValueStreamEditor } from './ValueStreamEditor';
export { default as ValueStreamMetrics } from './ValueStreamMetrics';
export { default as GapAnalysis } from './GapAnalysis';
export { default as Roadmap } from './Roadmap';
export { default as TraceabilityMatrix } from './TraceabilityMatrix';
export { default as LayeredView } from './LayeredView';
export { default as OrganizationCapabilityView } from './OrganizationCapabilityView';

// ADR (Architecture Decision Records) components
export { default as ADRList } from './ADRList';
export { default as ADRDetail } from './ADRDetail';
export { default as ADRForm } from './ADRForm';

// Cross-Space (Aggregation Hub) components
export { default as CrossSpaceView } from './CrossSpaceView';

// EA-PDS Integration
export { default as EAProjectsView } from './EAProjectsView';

// EA-Blueprint Integration
export { default as BlueprintLink } from './BlueprintLink';

// View metadata for navigation
export const EA_VIEWS = [
  {
    id: 'dashboard',
    name: 'EA Dashboard',
    description: 'Aggregated metrics from connected spaces (CAP, BA, Portfolio, PDS, PERF)',
    icon: 'dashboard',
    component: 'EADashboard',
    category: 'Core'
  },
  {
    id: 'layered-view',
    name: 'Layered View',
    description: 'Classic ArchiMate 3-layer diagram: Business - Application - Technology',
    icon: 'layers',
    component: 'LayeredView',
    category: 'Core'
  },
  {
    id: 'organization-capability',
    name: 'Organization & Capability',
    description: 'Who is responsible for what capabilities',
    icon: '👥',
    component: 'OrganizationCapabilityView',
    category: 'Core'
  },
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
  },
  {
    id: 'adrs',
    name: 'Architecture Decisions',
    description: 'Document and track Architecture Decision Records (ADRs)',
    icon: '⚖️',
    component: 'ADRList',
    category: 'Governance'
  },
  {
    id: 'cross-space',
    name: 'Cross-Space Relationships',
    description: 'View and manage connections between artefacts across different spaces',
    icon: '🔗',
    component: 'CrossSpaceView',
    category: 'Integration'
  },
  {
    id: 'pds-projects',
    name: 'PDS Projects',
    description: 'View and link Project Design Studio projects to EA elements',
    icon: 'folder',
    component: 'EAProjectsView',
    category: 'Integration'
  }
];

// Group views by category
export const EA_VIEW_CATEGORIES = {
  Core: EA_VIEWS.filter(v => v.category === 'Core'),
  Strategy: EA_VIEWS.filter(v => v.category === 'Strategy'),
  Business: EA_VIEWS.filter(v => v.category === 'Business'),
  Application: EA_VIEWS.filter(v => v.category === 'Application'),
  Technology: EA_VIEWS.filter(v => v.category === 'Technology'),
  Implementation: EA_VIEWS.filter(v => v.category === 'Implementation'),
  Analysis: EA_VIEWS.filter(v => v.category === 'Analysis'),
  Governance: EA_VIEWS.filter(v => v.category === 'Governance'),
  Integration: EA_VIEWS.filter(v => v.category === 'Integration')
};
