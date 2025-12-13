// components/sd/index.js
// System Dynamics Components Export

// EPIC 1.6 - Canvas Layers
export { default as SDLayers, useSDLayers, LAYER_TYPES } from './SDLayers';

// EPIC 1.8 - Mini Map
export { default as SDMiniMap } from './SDMiniMap';

// EPIC 2.4 - Loop Inspector
export { default as SDLoopInspector, detectFeedbackLoops } from './SDLoopInspector';

// EPIC 2.6 - Visual Filters
export { default as SDVisualFilters, useVisualFilters, VISUAL_FILTERS } from './SDVisualFilters';

// EPIC 2.7 - Cognitive Markers
export {
  default as SDCognitiveMarkers,
  useCognitiveMarkers,
  MarkerSelector,
  MarkerBadges,
  COGNITIVE_MARKERS
} from './SDCognitiveMarkers';

// EPIC 2.8 - Subsystem Highlighting
export {
  default as SDSubsystemHighlight,
  useSubsystemHighlight,
  analyzeSubsystem,
  getSubsystemStyles
} from './SDSubsystemHighlight';

// EPIC 2.9 - Model Health
export {
  default as SDModelHealth,
  useModelHealth,
  validateModel,
  ISSUE_SEVERITY,
  ISSUE_TYPES
} from './SDModelHealth';

// EPIC 3.6 - Auto Layout
export {
  default as SDAutoLayout,
  useAutoLayout,
  tidyLayout,
  alignElements,
  distributeElements
} from './SDAutoLayout';

// EPIC 3.8 - Formula Editor
export {
  default as SDFormulaEditor,
  validateFormula,
  FORMULA_FUNCTIONS,
  FORMULA_OPERATORS
} from './SDFormulaEditor';

// EPIC 3.11 & 5.5 - Presentation Mode
export {
  default as SDPresentationMode,
  getPresentationStyles
} from './SDPresentationMode';

// EPIC 4.1-4.8 - Domain Tags
export {
  default as SDDomainTags,
  useDomainTags,
  DomainTagInput,
} from './SDDomainTags';

// EPIC 5.1 - Annotations
export {
  default as SDAnnotations,
  useAnnotations,
  AnnotationToolbar,
  AnnotationStyleEditor,
  AnnotationElement,
  createAnnotation,
  ANNOTATION_TYPES,
  COLOR_PRESETS
} from './SDAnnotations';

// EPIC 5.2-5.3 - Insight Markers & Archetypes
export {
  default as SDInsightMarkers,
  useInsightMarkers,
  InsightMarkerPanel,
  InsightBadge,
  detectArchetypes,
  createInsightMarker,
  INSIGHT_TYPES,
  SYSTEM_ARCHETYPES
} from './SDInsightMarkers';

// EPIC 5.4-5.5 - Story Builder
export {
  default as SDStoryBuilder,
  useStoryBuilder,
  StoryStepEditor,
  createStoryStep,
  HIGHLIGHT_MODES
} from './SDStoryBuilder';

// EPIC 6.1-6.4 - Simulation Config
export {
  default as SDSimulationConfig,
  useSimulationConfig,
  validateSimulationReadiness,
  generateSimulationExport,
  TIME_UNITS,
  INTEGRATION_METHODS,
  DEFAULT_SIM_CONFIG
} from './SDSimulationConfig';

// EPIC 7.1-7.3 - Versioning & Scenarios
export {
  default as SDVersioning,
  useVersioning,
  VersionHistoryPanel,
  ScenarioPanel,
  createVersion,
  createScenario,
  compareVersions
} from './SDVersioning';

// EPIC 9.1-9.2 - Command Palette & Keyboard Shortcuts
export {
  default as SDCommandPalette,
  useKeyboardShortcuts,
  ShortcutsCheatSheet,
  COMMANDS,
  COMMAND_CATEGORIES
} from './SDCommandPalette';

// EPIC 9.4 - Context Menus
export {
  default as SDContextMenu,
  useContextMenu,
  MENU_ITEM_TYPES,
  CONTEXT_TYPES,
  MENU_CONFIGS,
  createMenuItem,
  extendMenu
} from './SDContextMenu';

// EPIC 9.5 - Declutter Controls
export {
  default as SDDeclutter,
  useDeclutter,
  DeclutterProvider,
  DeclutterToolbar,
  getVisibilityStyle,
  DECLUTTER_OPTIONS,
  DECLUTTER_PRESETS
} from './SDDeclutter';

// EPIC 9.6-9.7 - Onboarding & Templates
export {
  default as SDOnboarding,
  useOnboarding,
  OnboardingProvider,
  NewModelWizard,
  MicroHint,
  ElementTooltip,
  STARTER_TEMPLATES,
  MICRO_HINTS,
  TOOLTIPS
} from './SDOnboarding';

// EPIC 9.8-9.10 - Performance & Accessibility
export {
  default as SDPerformance,
  usePerformance,
  PerformanceProvider,
  PerformanceIndicator,
  ErrorBoundary,
  RecoveryModal,
  useDebounce,
  useVirtualization,
  PERFORMANCE_THRESHOLDS,
  PERFORMANCE_SETTINGS,
  ACCESSIBILITY_SETTINGS,
  ERROR_TYPES
} from './SDPerformance';

// EPIC 10.1-10.2 - Quantum States & Observations
export {
  default as SDQuantumStates,
  useQuantumStates,
  QuantumProvider,
  SuperpositionBadge,
  ObservationMarker,
  COLLAPSE_RULES
} from './SDQuantumStates';

// EPIC 10.3-10.7 - Quantum Elements
export {
  default as SDQuantumElements,
  useQuantumElements,
  QuantumElementsProvider,
  ObserverEffectBadge,
  UncertaintyFieldVisual,
  TemporalBadge,
  EntanglementLink,
  ObserverEffectEditor,
  UncertaintyFieldEditor,
  UNCERTAINTY_LEVELS,
  TEMPORAL_BEHAVIORS,
  ENTANGLEMENT_STRENGTH
} from './SDQuantumElements';

// EPIC 10.8-10.12 - Quantum Overlay
export {
  default as SDQuantumOverlay,
  useQuantumOverlay,
  QuantumOverlayProvider,
  QuantumOverlayVisual,
  QuantumToggleButton,
  QUANTUM_INSIGHT_TYPES,
  EXPERIMENT_FRAMINGS
} from './SDQuantumOverlay';

// Right Toolbar
export {
  default as SDRightToolbar,
  useRightToolbar
} from './SDRightToolbar';
