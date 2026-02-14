// components/pds/PDSWorkspace.js
// Project Design Workspace - Main workspace component

import { useCallback, useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { usePDS } from './PDSContext';
import { useProjects } from '../../ProjectContext';
import { useDomains } from '../../DomainContext';
import { buildSpaceUrl } from '../../../lib/urlUtils';

// Shared UI components
import { WorkspaceLayout, Breadcrumb, BreadcrumbSeparator, Breadcrumbs, ConfirmModal } from '@/components/ui';
import DeleteIcon from '@mui/icons-material/Delete';

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
import CrossStageView from './views/CrossStageView';

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
import PDSGuidedModal from './artefacts/PDSGuidedModal';
import CreateTypeSelector from './CreateTypeSelector';
import GuidancePanel from './shared/GuidancePanel';
import OnboardingWizard, { useOnboardingStatus } from './shared/OnboardingWizard';
import { AchievementProvider } from './shared/Achievements';
import { useCommandPalette, KeyboardShortcutsPanel, useKeyboardShortcuts } from './shared/CommandPalette';

// Shared components
import CreateProjectModal from '../../shared/CreateProjectModal';

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
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  return {
    onboarding: {
      isOpen: onboardingOpen,
      open: () => setOnboardingOpen(true),
      close: () => setOnboardingOpen(false),
    },
    createProject: {
      isOpen: createProjectOpen,
      open: () => setCreateProjectOpen(true),
      close: () => setCreateProjectOpen(false),
    },
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
    shortcuts: {
      isOpen: shortcutsOpen,
      open: () => setShortcutsOpen(true),
      close: () => setShortcutsOpen(false),
    },
  };
}

export default function PDSWorkspace({ view: urlView, domainId: urlDomainId, projectId: urlProjectId }) {
  const router = useRouter();
  const { projects, activeProject, setActiveProject, findByDisplayId } = useProjects();
  const { activeDomainObj } = useDomains();

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
    PDS_STAGE_INFO,
    stats,
  } = usePDS();

  // Centralized modal state
  const modals = usePDSModals();

  // Check onboarding status for first-time users
  const { shouldShow: shouldShowOnboarding, markTriggered: markOnboardingTriggered } = useOnboardingStatus();

  // Show onboarding for first-time users when they have an active project
  useEffect(() => {
    if (shouldShowOnboarding && activeProject && !modals.onboarding.isOpen) {
      // Delay slightly to let the workspace render first
      const timer = setTimeout(() => {
        markOnboardingTriggered(); // Mark as triggered to prevent re-opening
        modals.onboarding.open();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowOnboarding, activeProject, modals.onboarding, markOnboardingTriggered]);

  // Command palette execution handler
  const handleCommandExecute = useCallback((action) => {
    if (!action) return;

    switch (action.type) {
      case 'create':
        if (action.artefactType) {
          modals.artefactModal.open(action.artefactType, 'create');
        }
        break;
      case 'navigate':
        if (action.view) {
          setActiveView(action.view);
        }
        break;
      case 'action':
        switch (action.actionId) {
          case 'help':
            modals.guidancePanel.open();
            break;
          case 'shortcuts':
            modals.shortcuts.open();
            break;
          case 'achievements':
            // TODO: Open achievements panel when built
            break;
        }
        break;
    }
  }, [modals, setActiveView]);

  // Command palette hook
  const { CommandPaletteComponent } = useCommandPalette(handleCommandExecute);

  // Keyboard shortcuts hook
  useKeyboardShortcuts({
    onCreateArtefact: modals.typeSelector.open,
    onToggleHelp: modals.guidancePanel.toggle,
    onNavigate: setActiveView,
    disabled: !activeProject,
  });

  // Sync view from URL prop
  useEffect(() => {
    if (urlView && urlView !== activeView) {
      const validViews = [
        'overview', 'intent', 'structure', 'risk', 'execution', 'learning',
        'timeline', 'story', 'stakeholders', 'risks', 'dependencies', 'wbs',
        'assumptions', 'raid', 'progress', 'lessons'
      ];
      if (validViews.includes(urlView)) {
        setActiveView(urlView);
      }
    }
  }, [urlView, activeView, setActiveView]);

  // Sync project from URL parameter (PRJ-0001 format)
  useEffect(() => {
    if (!urlProjectId || !projects.length) return;

    // Check if URL project matches current active project
    const activeDisplayId = activeProject?.displayId || activeProject?.display_id;
    if (activeDisplayId === urlProjectId) return;

    // Find project by display ID and set it active
    const project = findByDisplayId(urlProjectId);
    if (project && project.id !== activeProject?.id) {
      setActiveProject(project.id);
    }
  }, [urlProjectId, projects, activeProject, findByDisplayId, setActiveProject]);

  // Update URL with domain/project IDs when they become available but aren't in URL
  useEffect(() => {
    if (!router.isReady) return;

    const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;
    const projectDisplayId = activeProject?.displayId || activeProject?.display_id;

    // Only update if we have domain and project but URL doesn't have them
    if (domainDisplayId && projectDisplayId && !urlProjectId) {
      const newUrl = buildSpaceUrl('pds', activeView || 'overview', domainDisplayId, projectDisplayId);
      // Only navigate if URL is different to avoid "hard navigate to same URL" error
      const currentPath = router.asPath.split('?')[0];
      if (newUrl !== currentPath) {
        router.replace(newUrl, undefined, { shallow: true });
      }
    }
  }, [router.isReady, activeDomainObj, activeProject, urlProjectId, activeView, router]);

  // Update URL when view changes (preserving domain and project context)
  const handleViewChange = useCallback((newView) => {
    setActiveView(newView);

    // Build URL with domain and project display IDs if available
    const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;
    const projectDisplayId = activeProject?.displayId || activeProject?.display_id;
    const currentPath = router.asPath.split('?')[0];

    if (domainDisplayId && projectDisplayId) {
      // Use full hierarchical URL with domain and project
      const newUrl = buildSpaceUrl('pds', newView, domainDisplayId, projectDisplayId);
      // Only navigate if URL is different to avoid "hard navigate to same URL" error
      if (newUrl !== currentPath) {
        router.replace(newUrl, undefined, { shallow: true });
      }
    } else {
      // Fallback to query param approach
      const url = new URL(window.location.href);
      if (newView === 'overview') {
        url.searchParams.delete('view');
      } else {
        url.searchParams.set('view', newView);
      }
      const targetUrl = url.pathname + url.search;
      if (targetUrl !== router.asPath) {
        router.replace(targetUrl, undefined, { shallow: true });
      }
    }
  }, [setActiveView, router, activeDomainObj, activeProject]);

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

  // Handle main project selection - updates both state and URL
  const handleMainProjectSelect = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Set active project
    setActiveProject(projectId);

    // Update URL with project display ID
    const projectDisplayId = project.displayId || project.display_id;
    const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;

    if (projectDisplayId && domainDisplayId) {
      const newUrl = buildSpaceUrl('pds', activeView || 'overview', domainDisplayId, projectDisplayId);
      // Only navigate if URL is different to avoid "hard navigate to same URL" error
      const currentPath = router.asPath.split('?')[0];
      if (newUrl !== currentPath) {
        router.replace(newUrl, undefined, { shallow: true });
      }
    }
  }, [projects, setActiveProject, activeDomainObj, activeView, router]);

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
      story: CrossStageView,
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
        stages={PDS_STAGE_INFO}
      />

      {/* Artefact create/edit modal - Guided wizard with learning step */}
      <PDSGuidedModal
        isOpen={modals.artefactModal.isOpen}
        onClose={modals.artefactModal.close}
        artefact={modals.artefactModal.artefact}
        type={modals.artefactModal.type}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={modals.deleteConfirm.isOpen}
        onClose={modals.deleteConfirm.close}
        onConfirm={confirmDelete}
        title="Delete Artefact?"
        message={`Are you sure you want to delete "${modals.deleteConfirm.artefact?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={saving}
        icon={DeleteIcon}
      />

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

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={modals.createProject.isOpen}
        onClose={modals.createProject.close}
      />

      {/* Onboarding Wizard */}
      <OnboardingWizard
        isOpen={modals.onboarding.isOpen}
        onClose={modals.onboarding.close}
        onComplete={modals.onboarding.close}
        onNavigateToStage={handleViewChange}
      />

      {/* Command Palette (Cmd+K) */}
      {CommandPaletteComponent}

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel
        isOpen={modals.shortcuts.isOpen}
        onClose={modals.shortcuts.close}
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

  // Get stage completion for achievements
  const stageCompletionData = useMemo(() => {
    if (!stats) return {};
    return {
      intent: stats.intentCompletion || 0,
      structure: stats.structureCompletion || 0,
      uncertainty: stats.uncertaintyCompletion || 0,
      control: stats.controlCompletion || 0,
      learning: stats.learningCompletion || 0,
    };
  }, [stats]);

  return (
    <AchievementProvider artefacts={artefacts} stageCompletion={stageCompletionData}>
      <WorkspaceLayout
        navigator={
          <PDSNavigator
            activeView={activeView}
            onViewChange={handleViewChange}
            stats={navStats}
            onCreateClick={modals.typeSelector.open}
            onToolsClick={modals.toolsPalette.open}
            activePdsProject={activePdsProject}
            // Project selection props
            projects={projects}
            activeProject={activeProject}
            onSelectProject={handleMainProjectSelect}
            onCreateProject={modals.createProject.open}
          />
        }
        breadcrumbs={breadcrumbsContent}
        actions={actionsContent}
        error={error}
        noProject={!activeProject}
        onCreateProject={modals.createProject.open}
        modals={modalsContent}
      >
        {renderView()}
      </WorkspaceLayout>
    </AchievementProvider>
  );
}
