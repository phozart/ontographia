// components/spaces/ea/index.js
// Enterprise Architecture Studio - Component exports

export { EAProvider, useEA } from './EAContext';
export { default as GuidedEAWorkspace } from './GuidedEAWorkspace';
export { default as EANavigator } from './EANavigator';
export { default as EAGuidancePanel } from './EAGuidancePanel';
export { default as EAImportWizard } from './EAImportWizard';
export { default as HelpPanel } from './HelpPanel';
export { default as GuidanceTooltips } from './GuidanceTooltips';

// Diagram components
export { default as EAElementPalette } from './EAElementPalette';
export { default as EACanvas } from './EACanvas';
export { default as EAElementModal } from './EAElementModal';
export { default as EARelationshipModal } from './EARelationshipModal';

// Views
export * from './views';
