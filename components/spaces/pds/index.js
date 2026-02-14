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

// Types and guidance (from lib/)
// Note: These re-exports are available for consumers that import from this package.
// The actual type definitions live in lib/pds-types.js, lib/pds-guidance.js
// Import directly from those paths if needed.
