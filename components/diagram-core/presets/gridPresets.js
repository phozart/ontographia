// components/diagram-core/presets/gridPresets.js
// Grid configuration presets

export const GRID_PRESETS = {
  // Standard grid with subtle lines
  default: {
    visible: true,
    type: 'lines',
    size: 20,
    majorEvery: 5,
    color: 'rgba(0, 0, 0, 0.05)',
    majorColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    snap: true,
    snapThreshold: 10,
    opacity: 1,
    lineWidth: 1,
  },

  // Dot grid - minimal and clean
  dots: {
    visible: true,
    type: 'dots',
    size: 20,
    color: 'rgba(0, 0, 0, 0.2)',
    backgroundColor: '#ffffff',
    snap: true,
    snapThreshold: 10,
    dotSize: 2,
  },

  // Cross grid - engineering style
  crosses: {
    visible: true,
    type: 'crosses',
    size: 30,
    color: 'rgba(0, 0, 0, 0.15)',
    backgroundColor: '#ffffff',
    snap: true,
    snapThreshold: 15,
    crossSize: 6,
  },

  // Blueprint style - dark blue background
  blueprint: {
    visible: true,
    type: 'lines',
    size: 25,
    majorEvery: 4,
    color: 'rgba(59, 130, 246, 0.2)',
    majorColor: 'rgba(59, 130, 246, 0.4)',
    backgroundColor: '#1e3a5f',
    snap: true,
    snapThreshold: 12,
    lineWidth: 1,
  },

  // Minimal - sparse dots
  minimal: {
    visible: true,
    type: 'dots',
    size: 40,
    color: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fafafa',
    snap: false,
    dotSize: 1,
  },

  // System Dynamics style
  systemDynamics: {
    visible: true,
    type: 'lines',
    size: 30,
    majorEvery: 4,
    color: 'rgba(99, 102, 241, 0.08)',
    majorColor: 'rgba(99, 102, 241, 0.15)',
    backgroundColor: '#fefefe',
    snap: true,
    snapThreshold: 15,
    lineWidth: 1,
  },

  // Causal Loop style
  causalLoop: {
    visible: true,
    type: 'dots',
    size: 25,
    color: 'rgba(16, 185, 129, 0.2)',
    backgroundColor: '#f8fffe',
    snap: true,
    snapThreshold: 12,
    dotSize: 2,
  },

  // Dark theme
  dark: {
    visible: true,
    type: 'lines',
    size: 20,
    majorEvery: 5,
    color: 'rgba(255, 255, 255, 0.05)',
    majorColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#1a1a2e',
    snap: true,
    snapThreshold: 10,
    lineWidth: 1,
  },

  // No grid
  none: {
    visible: false,
    backgroundColor: '#ffffff',
    snap: false,
  },

  // Whiteboard style - very subtle
  whiteboard: {
    visible: true,
    type: 'dots',
    size: 30,
    color: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: '#fffef8',
    snap: false,
    dotSize: 1.5,
  },
};

// Helper to merge custom config with a preset
export function mergeGridConfig(preset, customConfig) {
  const baseConfig = typeof preset === 'string' ? GRID_PRESETS[preset] : preset;
  return { ...baseConfig, ...customConfig };
}

export default GRID_PRESETS;
