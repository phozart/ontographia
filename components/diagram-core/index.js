// components/diagram-core/index.js
// DiagramCore - Reusable diagramming component
// See docs/diagram-studio-core-spec.md for full specification

export { default as DiagramCore } from './DiagramCore';
export { DiagramCoreProvider, useDiagramCore } from './DiagramCoreContext';

// Presets
export { GRID_PRESETS } from './presets/gridPresets';
export { STENCIL_PRESETS, createStencilConfig } from './presets/stencilPresets';
export { CONNECTION_PRESETS } from './presets/connectionPresets';

// Utilities
export { generateId } from './utils/helpers';
