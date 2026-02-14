// components/spaces/analysis/index.js
// Analysis Studio - Main exports
// Consolidates BA (Business Analysis) + Architecture + UX/UI Design

// Context and Provider
export {
  default as AnalysisContext,
  AnalysisProvider,
  useAnalysis,
  ANALYSIS_PROJECT_TYPE,
  ANALYSIS_ARTEFACT_TYPES,
  ANALYSIS_STATUS,
  ANALYSIS_MODULES,
  COMPLETENESS_RULES
} from './AnalysisContext';

// Main Workspace
export { default as AnalysisWorkspace } from './AnalysisWorkspace';

// Navigation
export { default as AnalysisNavigator } from './AnalysisNavigator';

// Project Components
export { default as AnalysisProjectModal } from './project/AnalysisProjectModal';

// Views
export { default as OverviewDashboard } from './views/OverviewDashboard';
export { default as StudioHome } from './views/StudioHome';

// Requirements Module Components
export { default as RequirementsTree } from './requirements/RequirementsTree';
export { default as AcceptanceCriteria } from './requirements/AcceptanceCriteria';

// Architecture Module Components
export { default as C4ModelView } from './architecture/C4ModelView';

// Data Module Components
export { default as ConceptualModel } from './data/ConceptualModel';

// Testing Module Components
export { default as TestCaseEditor } from './testing/TestCaseEditor';

// Design Module Components
export { default as PersonaGallery } from './design/PersonaGallery';
export { default as JourneyMap } from './design/JourneyMap';
export { default as WireframeGallery } from './design/WireframeGallery';
export { default as ResearchBoard } from './design/ResearchBoard';

// Shared Components
export { default as GuidancePanel } from './shared/GuidancePanel';
export { default as ArtefactModal } from './shared/ArtefactModal';

// Re-export existing BA components for compatibility
// These are reused, not rewritten
export {
  default as StakeholderRegister,
  StakeholderCard,
  PowerInterestGrid,
  StakeholderTable,
  StakeholderFormModal,
  INFLUENCE_LEVELS,
  INTEREST_LEVELS,
  QUADRANTS
} from '../ba/StakeholderRegister';

export {
  default as TraceabilityPanel,
  TraceItem,
  ImpactAnalysis,
  TraceabilityMatrix
} from '../ba/TraceabilityPanel';

// Re-export BA concepts for requirements module
export {
  BA_CONCEPTS,
  DECOMPOSITION_PATHS,
  CONTEXTUAL_TIPS,
  validateArtefact,
  getCreationGuidance,
  getDecompositionSuggestions
} from '../ba/BAContext';

// Re-export EA ADR components for architecture module
export { default as ADRList } from '../ea/views/ADRList';
export { default as ADRForm } from '../ea/views/ADRForm';
