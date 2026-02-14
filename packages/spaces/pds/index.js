// @ontographia/space-pds
// Project Design Studio - Space package

// Main exports for dynamic router
export { PDSProvider as Provider, usePDS } from './PDSContext';
export { default as Workspace } from './PDSWorkspace';

// Named exports for specific imports
export { PDSProvider, usePDS as useSpace } from './PDSContext';
export { default as PDSWorkspace } from './PDSWorkspace';
export { default as PDSNavigator } from './PDSNavigator';
export { default as ToolsPalette } from './ToolsPalette';
export { default as CrossStudioLinker } from './CrossStudioLinker';
export { default as CreateTypeSelector } from './CreateTypeSelector';

// Types and guidance
export * from './pds-types';
export * from './pds-guidance';
export * from './pds-tools';
