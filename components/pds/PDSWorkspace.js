// components/pds/PDSWorkspace.js
// Project Design Workspace - Main workspace component

import { useCallback, useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { usePDS } from './PDSContext';
import { useProjects } from '../ProjectContext';

// Shared UI components
import { WorkspaceLayout, Breadcrumb, BreadcrumbSeparator, Breadcrumbs } from '../ui';

// Extracted components
import PDSNavigator, { VIEW_INFO } from './PDSNavigator';
import ToolsPalette from './ToolsPalette';

// View components (to be created in Phase 4)
import OverviewDashboard from './views/OverviewDashboard';
import IntentGovernance from './views/IntentGovernance';
import StructurePlanning from './views/StructurePlanning';
import RiskUncertainty from './views/RiskUncertainty';
import ExecutionControl from './views/ExecutionControl';
import LearningEvolution from './views/LearningEvolution';
import ProjectTimeline from './views/ProjectTimeline';

// Tool views (to be created in Phase 5)
import StakeholderMatrix from './tools/StakeholderMatrix';
import RiskHeatMap from './tools/RiskHeatMap';
import DependencyGraph from './tools/DependencyGraph';
import WBSTree from './tools/WBSTree';
import AssumptionBoard from './tools/AssumptionBoard';
import RAIDLog from './tools/RAIDLog';
import ProgressDashboard from './tools/ProgressDashboard';
import LessonsLibrary from './tools/LessonsLibrary';

// Artefact components (to be created in Phase 6)
import PDSArtefactModal from './artefacts/PDSArtefactModal';
import CreateTypeSelector from './CreateTypeSelector';
import GuidancePanel from './shared/GuidancePanel';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Custom hook for modal state management
function usePDSModals() {
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);
  const [artefactModalOpen, setArtefactModalOpen] = useState(false);
  const [artefactModalType, setArtefactModalType] = useState(null);
  const [artefactModalArtefact, setArtefactModalArtefact] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmArtefact, setDeleteConfirmArtefact] = useState(null);
  const [toolsPaletteOpen, setToolsPaletteOpen] = useState(false);
  const [guidancePanelOpen, setGuidancePanelOpen] = useState(false);

  return {
    typeSelector: {
      isOpen: typeSelectorOpen,
      open: () => setTypeSelectorOpen(true),
      close: () => setTypeSelectorOpen(false),
    },
    artefactModal: {
      isOpen: artefactModalOpen,
      type: artefactModalType,
      artefact: artefactModalArtefact,
      open: (type, mode = 'create', artefact = null) => {
        setArtefactModalType(type);
        setArtefactModalArtefact(mode === 'edit' ? artefact : null);
        setArtefactModalOpen(true);
      },
      close: () => {
        setArtefactModalOpen(false);
        setArtefactModalType(null);
        setArtefactModalArtefact(null);
      },
    },
    deleteConfirm: {
      isOpen: deleteConfirmOpen,
      artefact: deleteConfirmArtefact,
      open: (artefact) => {
        setDeleteConfirmArtefact(artefact);
        setDeleteConfirmOpen(true);
      },
      close: () => {
        setDeleteConfirmOpen(false);
        setDeleteConfirmArtefact(null);
      },
    },
    toolsPalette: {
      isOpen: toolsPaletteOpen,
      open: () => setToolsPaletteOpen(true),
      close: () => setToolsPaletteOpen(false),
    },
    guidancePanel: {
      isOpen: guidancePanelOpen,
      open: () => setGuidancePanelOpen(true),
      close: () => setGuidancePanelOpen(false),
      toggle: () => setGuidancePanelOpen(prev => !prev),
    },
  };
}

export default function PDSWorkspace() {
  const router = useRouter();
  const { activeProject } = useProjects();

  const {
    artefacts,
    pdsProjects,
    activePdsProject,
    setActivePdsProject,
    error,
    saving,
    activeView,
    setActiveView,
    setSelectedId,
    refreshData,
    createArtefact,
    deleteArtefact,
    PDS_TYPE_DEFS,
    PDS_STAGES,
    stats,
  } = usePDS();

  // Centralized modal state
  const modals = usePDSModals();

  // Sync view state with URL query parameter
  useEffect(() => {
    const { view } = router.query;
    if (view && typeof view === 'string' && view !== activeView) {
      const validViews = [
        'overview', 'intent', 'structure', 'risk', 'execution', 'learning',
        'timeline', 'stakeholders', 'risks', 'dependencies', 'wbs',
        'assumptions', 'raid', 'progress', 'lessons'
      ];
      if (validViews.includes(view)) {
        setActiveView(view);
      }
    }
  }, [router.query, activeView, setActiveView]);

  // Update URL when view changes
  const handleViewChange = useCallback((newView) => {
    setActiveView(newView);
    const url = new URL(window.location.href);
    if (newView === 'overview') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', newView);
    }
    router.replace(url.pathname + url.search, undefined, { shallow: true });
  }, [setActiveView, router]);

  // Calculate stats for navigator
  const navStats = useMemo(() => ({
    total: artefacts.length,
    stakeholders: artefacts.filter(a => a.artefact_type === 'pds_stakeholder').length,
    deliverables: artefacts.filter(a => a.artefact_type === 'pds_deliverable').length,
    milestones: artefacts.filter(a => a.artefact_type === 'pds_milestone').length,
    risks: artefacts.filter(a => a.artefact_type === 'pds_risk').length,
    issues: artefacts.filter(a => a.artefact_type === 'pds_issue').length,
    assumptions: artefacts.filter(a => a.artefact_type === 'pds_assumption').length,
    changes: artefacts.filter(a => a.artefact_type === 'pds_change_request').length,
    lessons: artefacts.filter(a => a.artefact_type === 'pds_lesson').length,
  }), [artefacts]);

  // Handlers
  const handleSelectType = useCallback((type) => {
    modals.typeSelector.close();
    modals.artefactModal.open(type, 'create');
  }, [modals]);

  const handleCreateArtefact = useCallback((type) => {
    modals.artefactModal.open(type, 'create');
  }, [modals]);

  const handleEditArtefact = useCallback((artefact) => {
    modals.artefactModal.open(artefact.artefact_type, 'edit', artefact);
  }, [modals]);

  const handleSelectArtefact = useCallback((artefact) => {
    setSelectedId(artefact.id);
  }, [setSelectedId]);

  const handleDeleteArtefact = useCallback((artefact) => {
    modals.deleteConfirm.open(artefact);
  }, [modals]);

  const confirmDelete = useCallback(async () => {
    if (modals.deleteConfirm.artefact) {
      await deleteArtefact(modals.deleteConfirm.artefact.id);
      modals.deleteConfirm.close();
    }
  }, [modals.deleteConfirm, deleteArtefact]);

  const handleSelectTool = useCallback((tool) => {
    if (tool.viewId) {
      handleViewChange(tool.viewId);
    }
  }, [handleViewChange]);

  const handleNavigate = useCallback((viewOrStage, type) => {
    if (type) {
      handleViewChange(viewOrStage);
    } else if (PDS_STAGES?.[viewOrStage]) {
      handleViewChange(viewOrStage);
    } else {
      handleViewChange(viewOrStage);
    }
  }, [handleViewChange, PDS_STAGES]);

  const handleSelectProject = useCallback((project) => {
    setActivePdsProject(project);
    handleViewChange('overview');
  }, [setActivePdsProject, handleViewChange]);

  // Get current view info for breadcrumbs
  const currentViewInfo = VIEW_INFO[activeView] || { name: activeView, group: null };

  // Standard props passed to all views
  const viewProps = {
    onSelectArtefact: handleSelectArtefact,
    onEditArtefact: handleEditArtefact,
    onDeleteArtefact: handleDeleteArtefact,
    onCreateArtefact: handleCreateArtefact,
    onNavigate: handleNavigate,
  };

  // Render current view
  const renderView = () => {
    // Check for placeholder views during development
    const ViewComponent = {
      overview: OverviewDashboard,
      intent: IntentGovernance,
      structure: StructurePlanning,
      risk: RiskUncertainty,
      execution: ExecutionControl,
      learning: LearningEvolution,
      timeline: ProjectTimeline,
      stakeholders: StakeholderMatrix,
      risks: RiskHeatMap,
      dependencies: DependencyGraph,
      wbs: WBSTree,
      assumptions: AssumptionBoard,
      raid: RAIDLog,
      progress: ProgressDashboard,
      lessons: LessonsLibrary,
    }[activeView];

    if (ViewComponent) {
      return <ViewComponent {...viewProps} />;
    }

    // Fallback for views not yet implemented
    return (
      <div className="pds-placeholder-view">
        <h2>{currentViewInfo.name}</h2>
        <p>This view is coming soon.</p>
      </div>
    );
  };

  // Build breadcrumbs
  const breadcrumbsContent = activeView !== 'overview' ? (
    <Breadcrumbs>
      <Breadcrumb
        icon={DashboardIcon}
        label="Overview"
        onClick={() => handleViewChange('overview')}
      />
      {currentViewInfo.group && (
        <>
          <BreadcrumbSeparator />
          <Breadcrumb label={currentViewInfo.group} />
        </>
      )}
      <BreadcrumbSeparator />
      <Breadcrumb label={currentViewInfo.name} active />
      {activePdsProject && (
        <>
          <BreadcrumbSeparator />
          <Breadcrumb
            icon={FolderIcon}
            label={activePdsProject.name || activePdsProject.title}
            active
          />
        </>
      )}
    </Breadcrumbs>
  ) : null;

  // Build modals
  const modalsContent = (
    <>
      {/* Create type selector modal */}
      <CreateTypeSelector
        isOpen={modals.typeSelector.isOpen}
        onClose={modals.typeSelector.close}
        onSelectType={handleSelectType}
        typeDefs={PDS_TYPE_DEFS}
        stages={PDS_STAGES}
      />

      {/* Artefact create/edit modal */}
      <PDSArtefactModal
        isOpen={modals.artefactModal.isOpen}
        onClose={modals.artefactModal.close}
        artefact={modals.artefactModal.artefact}
        type={modals.artefactModal.type}
      />

      {/* Delete confirmation modal */}
      {modals.deleteConfirm.isOpen && (
        <div className="modal-backdrop" onClick={modals.deleteConfirm.close}>
          <div className="pds-delete-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Artefact?</h3>
            <p>
              Are you sure you want to delete "{modals.deleteConfirm.artefact?.name}"?
              This action cannot be undone.
            </p>
            <div className="pds-delete-confirm__actions">
              <button
                className="btn btn--secondary"
                onClick={modals.deleteConfirm.close}
              >
                Cancel
              </button>
              <button
                className="btn btn--danger"
                onClick={confirmDelete}
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tools Palette */}
      <ToolsPalette
        isOpen={modals.toolsPalette.isOpen}
        onClose={modals.toolsPalette.close}
        onSelectTool={handleSelectTool}
        currentStage={activeView}
      />

      {/* Guidance Panel */}
      <GuidancePanel
        isOpen={modals.guidancePanel.isOpen}
        onClose={modals.guidancePanel.close}
        currentView={activeView}
        currentStage={currentViewInfo.group === 'Spaces' ? activeView : null}
      />
    </>
  );

  // Toolbar actions
  const actionsContent = (
    <>
      <button
        className="workspace-action-btn workspace-action-btn--primary"
        onClick={modals.typeSelector.open}
        disabled={!activePdsProject}
        title="Create new artefact"
      >
        <AutoFixHighIcon fontSize="small" />
        <span>Create</span>
      </button>
      <button
        className="workspace-action-btn"
        onClick={modals.guidancePanel.toggle}
        title="Toggle guidance panel"
      >
        <HelpOutlineIcon fontSize="small" />
        <span>Guide</span>
      </button>
    </>
  );

  return (
    <WorkspaceLayout
      navigator={
        <PDSNavigator
          activeView={activeView}
          onViewChange={handleViewChange}
          stats={navStats}
          onCreateClick={modals.typeSelector.open}
          onToolsClick={modals.toolsPalette.open}
          activePdsProject={activePdsProject}
        />
      }
      breadcrumbs={breadcrumbsContent}
      actions={actionsContent}
      error={error}
      noProject={!activeProject}
      modals={modalsContent}
    >
      {renderView()}
    </WorkspaceLayout>
  );
}
