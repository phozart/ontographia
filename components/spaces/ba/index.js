// components/spaces/ba/index.js
// Business Analysis Studio - Component exports

// Context and main workspace
export { BAProvider, useBA } from './BAContext';
export { default as BAWorkspace } from './BAWorkspace';
export { default as RequirementsStudio } from './RequirementsStudio';

// Project management
export {
  ProjectSelector,
  ProjectCreationModal,
  ProjectDashboard,
  ProjectSettingsModal,
} from './ProjectManager';

// Views
export { default as ArtefactView } from './ArtefactView';
export { default as ArtefactDetailPanel } from './ArtefactDetailPanel';
export { default as TraceView } from './TraceView';
export { default as TraceabilityPanel } from './TraceabilityPanel';
export { default as KanbanBoard } from './KanbanBoard';
export { default as EnhancedKanban } from './EnhancedKanban';
export { default as StoryMapView } from './StoryMapView';
export { default as DocumentView } from './DocumentView';
export { default as DocumentList } from './DocumentList';
export { default as DocumentEditor } from './DocumentEditor';

// Tools
export { default as DiagramEditor } from './DiagramEditor';
export { default as ContextDiagram } from './ContextDiagram';
export { default as ContextDiagramBuilder } from './ContextDiagramBuilder';
export { default as UseCaseDiagram } from './UseCaseDiagram';
export { default as ProcessComparison } from './ProcessComparison';
export { default as GapAnalysis } from './GapAnalysis';
export { default as DataDictionary } from './DataDictionary';
export { default as BusinessRulesCatalog } from './BusinessRulesCatalog';
export { default as StakeholderRegister } from './StakeholderRegister';
export { default as StakeholderMapView } from './StakeholderMapView';
export { default as RACIMatrix } from './RACIMatrix';
export { default as BABOKTraceMatrix } from './BABOKTraceMatrix';
export { default as StrategyMap } from './StrategyMap';

// UI Components
export { default as GuidedCreateModal } from './GuidedCreateModal';
export { default as RequirementCard } from './RequirementCard';
export { default as RequirementManager } from './RequirementManager';
export { default as RepositoryTree } from './RepositoryTree';
export { default as ViewpointSelector } from './ViewpointSelector';
export { default as HelpPanel } from './HelpPanel';
