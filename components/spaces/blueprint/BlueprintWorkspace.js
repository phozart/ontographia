// components/spaces/blueprint/BlueprintWorkspace.js
// Blueprint Studio main workspace - initiative lifecycle management

import { useCallback, useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useBlueprint } from './BlueprintContext';
import { useProjects } from '../../ProjectContext';
import { useDomains } from '../../DomainContext';
import { useAuth } from '../../AuthContext';
import { buildSpaceUrl } from '../../../lib/urlUtils';

// Shared UI components
import { WorkspaceLayout, Breadcrumb, BreadcrumbSeparator, Breadcrumbs, ConfirmModal, BacklinksSidebar, BacklinksButton, LifecycleBar } from '@/components/ui';
import { DomainDashboard } from '../../shared/DomainDashboard';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// Blueprint components
import BlueprintNavigator, { VIEW_INFO } from './BlueprintNavigator';

// Section tabs for Level 2 horizontal navigation
// These appear in the secondary horizontal bar, NOT the sidebar
const SECTION_TABS = [
  { id: 'overview', name: 'Overview' },
  { id: 'ideation', name: 'Ideation' },
  { id: 'market', name: 'Market' },
  { id: 'decision', name: 'Decision' },
  { id: 'governance', name: 'Governance' },
  { id: 'tools', name: 'Tools' },
];

// View components
import OverviewDashboard from './views/OverviewDashboard';
import IdeasBoard from './views/IdeasBoard';
import PipelineView from './views/PipelineView';
import FunnelHealth from './views/FunnelHealth';
import OpportunityCanvas from './views/OpportunityCanvas';
import InitiativeForm from './views/InitiativeForm';

// Stage views
import IdeaCapture from './stages/IdeaCapture';
import DiscoveryView from './stages/DiscoveryView';
import ExploreView from './stages/ExploreView';
import AssessView from './stages/AssessView';
import SummaryView from './stages/SummaryView';
import BusinessCaseStudio from './decision/BusinessCaseStudio';
import ApprovalStudio from './decision/ApprovalStudio';

// Market views
import MarketOverview from './market/MarketOverview';
import TamSamSom from './market/TamSamSom';
import CompetitorAnalysis from './market/CompetitorAnalysis';
import CustomerSegments from './market/CustomerSegments';
import PortersFiveForces from './market/PortersFiveForces';
import PESTLECanvas from './market/PESTLECanvas';

// Governance views
import { StageGatesView, SLADashboardView, AtRiskView, PLRComparison, ReviewerAssignment } from './governance';

// Additional views
import KilledIdeasLibrary from './views/KilledIdeasLibrary';
import InnovationAccounting from './views/InnovationAccounting';
import FunnelAnalytics from './views/FunnelAnalytics';

// Tools views
import {
  ToolsLibrary,
  ValuePropCanvas,
  LeanCanvas,
  SWOTCanvas,
  AssumptionCanvas,
  RICEScoring,
  PriorityMatrix,
  WeightedScoring,
  InitiativeCompare,
} from './tools';

// Shared components
import GuidancePanel from './shared/GuidancePanel';
import InitiativeModal from './initiative/InitiativeModal';

// AI Design Wizard
import { AIDesignWizard } from './ai-design';

// AI Coach Panel
import AICoachPanel from './shared/AICoachPanel';

// Export Manager
import ExportManager from './shared/ExportManager';

// Product Idea Modal
import { QuickIdeaCapture } from './initiative/ProductIdeaModal';

// Shared project modal
import CreateProjectModal from '../../shared/CreateProjectModal';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DownloadIcon from '@mui/icons-material/Download';

// Custom hook for modal state management
function useBlueprintModals() {
  const [initiativeModalOpen, setInitiativeModalOpen] = useState(false);
  const [initiativeModalInitiative, setInitiativeModalInitiative] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmInitiative, setDeleteConfirmInitiative] = useState(null);
  const [guidancePanelOpen, setGuidancePanelOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [aiWizardOpen, setAiWizardOpen] = useState(false);
  const [aiWizardInitiative, setAiWizardInitiative] = useState(null);
  const [quickIdeaOpen, setQuickIdeaOpen] = useState(false);
  const [aiCoachOpen, setAiCoachOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  return {
    createProject: {
      isOpen: createProjectOpen,
      open: () => setCreateProjectOpen(true),
      close: () => setCreateProjectOpen(false),
    },
    initiativeModal: {
      isOpen: initiativeModalOpen,
      initiative: initiativeModalInitiative,
      open: (initiative = null) => {
        setInitiativeModalInitiative(initiative);
        setInitiativeModalOpen(true);
      },
      close: () => {
        setInitiativeModalOpen(false);
        setInitiativeModalInitiative(null);
      },
    },
    deleteConfirm: {
      isOpen: deleteConfirmOpen,
      initiative: deleteConfirmInitiative,
      open: (initiative) => {
        setDeleteConfirmInitiative(initiative);
        setDeleteConfirmOpen(true);
      },
      close: () => {
        setDeleteConfirmOpen(false);
        setDeleteConfirmInitiative(null);
      },
    },
    guidancePanel: {
      isOpen: guidancePanelOpen,
      open: () => setGuidancePanelOpen(true),
      close: () => setGuidancePanelOpen(false),
      toggle: () => setGuidancePanelOpen(prev => !prev),
    },
    aiWizard: {
      isOpen: aiWizardOpen,
      initiative: aiWizardInitiative,
      open: (initiative = null) => {
        setAiWizardInitiative(initiative);
        setAiWizardOpen(true);
      },
      close: () => {
        setAiWizardOpen(false);
        setAiWizardInitiative(null);
      },
    },
    quickIdea: {
      isOpen: quickIdeaOpen,
      open: () => setQuickIdeaOpen(true),
      close: () => setQuickIdeaOpen(false),
    },
    aiCoach: {
      isOpen: aiCoachOpen,
      open: () => setAiCoachOpen(true),
      close: () => setAiCoachOpen(false),
      toggle: () => setAiCoachOpen(prev => !prev),
    },
    exportManager: {
      isOpen: exportOpen,
      open: () => setExportOpen(true),
      close: () => setExportOpen(false),
    },
  };
}

// Dashboard config for Blueprint Studio
const BLUEPRINT_DASHBOARD_CONFIG = {
  title: 'Blueprint Studio',
  subtitle: 'Manage innovation initiatives and ideas across this domain',
  projectLabel: 'Initiatives',
  projectLabelSingular: 'Initiative',
  emptyIcon: '&#128161;',
  emptyTitle: 'No Initiatives Yet',
  emptyMessage: 'Start by creating an initiative to capture and develop new ideas.',
  displayIdField: 'initiative_id',
  statusField: 'stage',
  countField: 'artefact_count',
  countLabel: 'items',
  showProgress: false,
};

export default function BlueprintWorkspace({ view: urlView, domainId: urlDomainId, projectId: urlProjectId, initiativeId: urlInitiativeId }) {
  const router = useRouter();
  const { projects, activeProject, setActiveProject, findByDisplayId } = useProjects();
  const { activeDomainObj, activeDomain } = useDomains();
  const { user, role } = useAuth();

  // Auth headers for API calls
  const authHeaders = useMemo(() => ({
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  const {
    initiatives,
    activeInitiative,
    setActiveInitiative,
    error,
    saving,
    activeView,
    setActiveView,
    setSelectedId,
    fetchInitiatives,
    fetchProductIdeas,
    createInitiative,
    updateInitiative,
    deleteInitiative,
    advanceStage,
    declineInitiative,
    stageCounts,
  } = useBlueprint();

  // Centralized modal state
  const modals = useBlueprintModals();

  // Backlinks state
  const [showBacklinks, setShowBacklinks] = useState(false);

  // Domain-level dashboard state
  const [domainInitiatives, setDomainInitiatives] = useState([]);
  const [domainStats, setDomainStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  // Fetch domain-level data when no project is selected
  useEffect(() => {
    if (activeProject || !activeDomain) return;

    const fetchDomainData = async () => {
      setDashboardLoading(true);
      setDashboardError(null);

      try {
        // Fetch initiatives and stats in parallel
        const [initiativesRes, statsRes] = await Promise.all([
          fetch(`/api/blueprint/initiatives?domainId=${activeDomain}`, { headers: authHeaders }),
          fetch(`/api/blueprint/stats?domainId=${activeDomain}`, { headers: authHeaders }),
        ]);

        if (!initiativesRes.ok) {
          const errData = await initiativesRes.json().catch(() => ({}));
          throw new Error(errData.error || `Initiatives: ${initiativesRes.status}`);
        }
        if (!statsRes.ok) {
          const errData = await statsRes.json().catch(() => ({}));
          throw new Error(errData.error || `Statistics: ${statsRes.status}`);
        }

        const initiativesData = await initiativesRes.json();
        const statsData = await statsRes.json();

        setDomainInitiatives(initiativesData.initiatives || []);
        setDomainStats(statsData);
      } catch (err) {
        console.error('Error fetching domain data:', err);
        setDashboardError(err.message);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDomainData();
  }, [activeProject, activeDomain, authHeaders]);

  // Sync view from URL prop - only runs when urlView changes externally
  // Only react to urlView changes (not activeView) to avoid fighting with internal navigation
  useEffect(() => {
    if (urlView) {
      const validViews = Object.keys(VIEW_INFO);
      if (validViews.includes(urlView)) {
        setActiveView(urlView);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlView]);

  // Sync project from URL parameter (PRJ-0001 format)
  useEffect(() => {
    if (!urlProjectId || !projects.length) return;

    const activeDisplayId = activeProject?.displayId || activeProject?.display_id;
    if (activeDisplayId === urlProjectId) return;

    const project = findByDisplayId(urlProjectId);
    if (project && project.id !== activeProject?.id) {
      setActiveProject(project.id);
    }
  }, [urlProjectId, projects, activeProject, findByDisplayId, setActiveProject]);

  // Sync initiative from URL parameter (INI-0001 format)
  useEffect(() => {
    if (!urlInitiativeId || !initiatives.length) return;

    const activeDisplayId = activeInitiative?.display_id;
    if (activeDisplayId === urlInitiativeId) return;

    const initiative = initiatives.find(i => i.display_id === urlInitiativeId);
    if (initiative && initiative.id !== activeInitiative?.id) {
      setActiveInitiative(initiative);
      setSelectedId(initiative.id);
    }
  }, [urlInitiativeId, initiatives, activeInitiative, setActiveInitiative, setSelectedId]);

  // Update URL with domain/project IDs when they become available
  useEffect(() => {
    if (!router.isReady) return;

    const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;
    const projectDisplayId = activeProject?.displayId || activeProject?.display_id;
    const initiativeDisplayId = activeInitiative?.display_id;

    if (domainDisplayId && projectDisplayId && !urlProjectId) {
      // Always include initiative ID if one is selected (for shareable URLs)
      const newUrl = buildSpaceUrl('blueprint', activeView || 'overview', domainDisplayId, projectDisplayId, initiativeDisplayId || null);
      // Only navigate if URL is different to avoid "hard navigate to same URL" error
      const currentPath = router.asPath.split('?')[0];
      if (newUrl !== currentPath) {
        router.replace(newUrl, undefined, { shallow: true });
      }
    }
  }, [router.isReady, activeDomainObj, activeProject, activeInitiative, urlProjectId, activeView, router]);

  // Update URL when view changes — always use path-based URLs
  const handleViewChange = useCallback((newView) => {
    setActiveView(newView);

    const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;
    const projectDisplayId = activeProject?.displayId || activeProject?.display_id;
    const initiativeDisplayId = activeInitiative?.display_id;
    const currentPath = router.asPath.split('?')[0];

    // Always build a path-based URL (never use query params — they cause sync conflicts)
    const newUrl = buildSpaceUrl('blueprint', newView, domainDisplayId || null, projectDisplayId || null, initiativeDisplayId || null);

    if (newUrl !== currentPath) {
      router.replace(newUrl, undefined, { shallow: true });
    }
  }, [setActiveView, router, activeDomainObj, activeProject, activeInitiative]);

  // Form mode state (for full-page form instead of modal)
  const [formMode, setFormMode] = useState(null); // null | 'create' | 'edit'
  const [formInitiative, setFormInitiative] = useState(null);

  // Sync form mode from URL (new/edit views)
  useEffect(() => {
    if (urlView === 'new') {
      setFormMode('create');
      setFormInitiative(null);
    } else if (urlView === 'edit' && activeInitiative) {
      setFormMode('edit');
      setFormInitiative(activeInitiative);
    } else if (formMode && urlView !== 'new' && urlView !== 'edit') {
      // URL changed away from form views, clear form mode
      setFormMode(null);
      setFormInitiative(null);
    }
  }, [urlView, activeInitiative, formMode]);

  // Handlers
  const handleCreateInitiative = useCallback(() => {
    // Navigate to /blueprint/new URL
    const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;
    if (domainDisplayId) {
      const newUrl = buildSpaceUrl('blueprint', 'new', domainDisplayId);
      router.push(newUrl);
    } else {
      // Fallback if no domain
      setFormInitiative(null);
      setFormMode('create');
    }
  }, [activeDomainObj, router]);

  const handleEditInitiative = useCallback((initiative) => {
    // Navigate to /blueprint/edit URL with initiative ID
    const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;
    const initiativeDisplayId = initiative?.display_id || initiative?.initiative_id;
    if (domainDisplayId && initiativeDisplayId) {
      const newUrl = buildSpaceUrl('blueprint', 'edit', domainDisplayId, null, initiativeDisplayId);
      router.push(newUrl);
    } else {
      // Fallback
      setFormInitiative(initiative);
      setFormMode('edit');
    }
  }, [activeDomainObj, router]);

  const handleFormCancel = useCallback(() => {
    // Navigate back to overview
    const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;
    const projectDisplayId = activeProject?.displayId || activeProject?.display_id;
    if (domainDisplayId) {
      const newUrl = buildSpaceUrl('blueprint', 'overview', domainDisplayId, projectDisplayId);
      router.push(newUrl);
    } else {
      setFormMode(null);
      setFormInitiative(null);
    }
  }, [activeDomainObj, activeProject, router]);

  const handleFormSaved = useCallback(() => {
    // Navigate back to overview after save
    const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;
    const projectDisplayId = activeProject?.displayId || activeProject?.display_id;
    fetchInitiatives();
    if (domainDisplayId) {
      const newUrl = buildSpaceUrl('blueprint', 'overview', domainDisplayId, projectDisplayId);
      router.push(newUrl);
    } else {
      setFormMode(null);
      setFormInitiative(null);
    }
  }, [activeDomainObj, activeProject, fetchInitiatives, router]);

  const handleSelectInitiative = useCallback((initiative) => {
    setActiveInitiative(initiative);
    setSelectedId(initiative.id);

    // If initiative has a project, set it as active
    let projectForUrl = activeProject;
    if (initiative.project_id && (!activeProject || activeProject.id !== initiative.project_id)) {
      const project = projects.find(p => p.id === initiative.project_id);
      if (project) {
        setActiveProject(project.id);
        projectForUrl = project;
      }
    }

    // Determine target view - if on a non-initiative view, go to discovery
    // Views that don't show initiative details should redirect to discovery
    const nonInitiativeViews = ['overview', 'dashboard', 'pipeline', 'health', 'risk', 'tools', 'rice', 'ai-design'];
    const targetView = nonInitiativeViews.includes(activeView) ? 'discovery' : activeView;
    setActiveView(targetView);

    // Update URL with initiative ID
    const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;
    const projectDisplayId = projectForUrl?.displayId || projectForUrl?.display_id;
    const initiativeDisplayId = initiative?.display_id || initiative?.initiative_id || initiative?.displayId;

    if (domainDisplayId && initiativeDisplayId) {
      const newUrl = buildSpaceUrl('blueprint', targetView, domainDisplayId, projectDisplayId || null, initiativeDisplayId);
      const currentPath = router.asPath.split('?')[0];
      if (newUrl !== currentPath) {
        router.replace(newUrl, undefined, { shallow: true });
      }
    }
  }, [setActiveInitiative, setSelectedId, activeDomainObj, activeProject, projects, setActiveProject, activeView, setActiveView, router]);

  const handleDeleteInitiative = useCallback((initiative) => {
    modals.deleteConfirm.open(initiative);
  }, [modals]);

  const confirmDelete = useCallback(async () => {
    if (modals.deleteConfirm.initiative) {
      await deleteInitiative(modals.deleteConfirm.initiative.id);
      modals.deleteConfirm.close();
    }
  }, [modals.deleteConfirm, deleteInitiative]);

  // Handle navigation - optionally accepts initiative to ensure URL includes it
  const handleNavigate = useCallback((view, initiative = null) => {
    // If initiative is provided, use it for URL building directly
    // This avoids race condition where activeInitiative state hasn't updated yet
    if (initiative) {
      // Set both the view and the active initiative
      setActiveView(view);
      setActiveInitiative(initiative);
      setSelectedId(initiative.id);

      // If initiative has a project, set it as active
      let projectForUrl = activeProject;
      if (initiative.project_id && (!activeProject || activeProject.id !== initiative.project_id)) {
        const project = projects.find(p => p.id === initiative.project_id);
        if (project) {
          setActiveProject(project.id);
          projectForUrl = project;
        }
      }

      const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;
      const projectDisplayId = projectForUrl?.displayId || projectForUrl?.display_id;
      const initiativeDisplayId = initiative.display_id || initiative.initiative_id || initiative.displayId;
      const currentPath = router.asPath.split('?')[0];

      if (domainDisplayId && initiativeDisplayId) {
        const newUrl = buildSpaceUrl('blueprint', view, domainDisplayId, projectDisplayId || null, initiativeDisplayId);
        if (newUrl !== currentPath) {
          router.replace(newUrl, undefined, { shallow: true });
        }
      }
    } else {
      handleViewChange(view);
    }
  }, [setActiveView, setActiveInitiative, setSelectedId, handleViewChange, activeDomainObj, activeProject, projects, setActiveProject, router]);

  const handleMainProjectSelect = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setActiveProject(projectId);

    const projectDisplayId = project.displayId || project.display_id;
    const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;

    if (projectDisplayId && domainDisplayId) {
      const newUrl = buildSpaceUrl('blueprint', activeView || 'overview', domainDisplayId, projectDisplayId);
      // Only navigate if URL is different to avoid "hard navigate to same URL" error
      const currentPath = router.asPath.split('?')[0];
      if (newUrl !== currentPath) {
        router.replace(newUrl, undefined, { shallow: true });
      }
    }
  }, [projects, setActiveProject, activeDomainObj, activeView, router]);

  // Get current view info for breadcrumbs
  const currentViewInfo = VIEW_INFO[activeView] || { name: activeView, group: null };

  // Handler for AI Design wizard
  const handleAIDesign = useCallback((initiative = null) => {
    modals.aiWizard.open(initiative);
  }, [modals.aiWizard]);

  // Get selected idea from URL query param
  const selectedIdeaFromUrl = router.query?.idea || null;

  // Standard props passed to all views
  const viewProps = {
    onSelectInitiative: handleSelectInitiative,
    onEditInitiative: handleEditInitiative,
    onDeleteInitiative: handleDeleteInitiative,
    onCreateInitiative: handleCreateInitiative,
    onNavigate: handleNavigate,
    onAdvanceStage: advanceStage,
    onDeclineInitiative: declineInitiative,
    onOpenAIWizard: handleAIDesign,
    domainInitiatives,
    hasActiveProject: !!activeProject,
    selectedIdeaFromUrl, // Pass idea ID from URL query for auto-selection
  };

  // Check if current view requires an initiative
  const viewRequiresInitiative = VIEW_INFO[activeView]?.requiresInitiative ?? false;
  const hasActiveInitiative = !!activeInitiative;

  // Redirect to Ideas Board if initiative required but not selected
  // Delayed slightly to allow batched state updates (initiative + view) to settle
  useEffect(() => {
    if (!viewRequiresInitiative || hasActiveInitiative || !router.isReady) return;

    const timer = setTimeout(() => {
      // Re-check after delay — initiative may have been set in the same batch
      if (viewRequiresInitiative && !hasActiveInitiative) {
        console.log(`View "${activeView}" requires initiative. Redirecting to Ideas Board.`);
        handleViewChange('overview');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [activeView, viewRequiresInitiative, hasActiveInitiative, router.isReady, handleViewChange]);

  // Render current view
  const renderView = () => {
    // Show full-page form when in form mode or on new/edit URLs
    if (formMode || activeView === 'new' || activeView === 'edit') {
      return (
        <InitiativeForm
          initiative={formInitiative}
          onCancel={handleFormCancel}
          onSaved={handleFormSaved}
        />
      );
    }

    // If view requires initiative but none selected, show prompt to select
    if (viewRequiresInitiative && !hasActiveInitiative) {
      return (
        <div className="blueprint-no-initiative-view">
          <div className="no-initiative-content">
            <ViewKanbanIcon className="no-initiative-icon" />
            <h2>Select an Initiative</h2>
            <p>This view requires an initiative. Select one below or go to Initiatives to create one.</p>
            {initiatives.length > 0 ? (
              <div className="no-initiative-list">
                {initiatives.slice(0, 5).map(ini => (
                  <button
                    key={ini.id}
                    className="no-initiative-item"
                    onClick={() => handleSelectInitiative(ini)}
                  >
                    <span className="no-initiative-item-id">{ini.display_id}</span>
                    <span className="no-initiative-item-name">{ini.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleCreateInitiative}
              >
                Create Initiative
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => handleViewChange('overview')}
              style={{ marginTop: 8 }}
            >
              Go to Initiatives
            </button>
          </div>
        </div>
      );
    }

    const ViewComponent = {
      // Overview section (portfolio level)
      overview: IdeasBoard,  // Initiative Board is now the default overview
      initiatives: IdeasBoard, // Alias for overview
      ideas: IdeasBoard, // Legacy alias
      dashboard: OverviewDashboard,
      // Discovery section (initiative-scoped) - combined view for idea/explore/assess
      pipeline: PipelineView,
      health: FunnelHealth,
      discovery: DiscoveryView,
      idea: DiscoveryView,
      explore: DiscoveryView,
      assess: DiscoveryView,
      // Decision section
      summary: SummaryView,
      case: BusinessCaseStudio,
      approval: ApprovalStudio,
      approved: ApprovalStudio, // Alias for funnel navigation
      // Market section (initiative-scoped)
      market: MarketOverview,
      tamsam: TamSamSom,
      competitors: CompetitorAnalysis,
      segments: CustomerSegments,
      porters: PortersFiveForces,
      pestle: PESTLECanvas,
      // Governance section (initiative-scoped)
      gates: StageGatesView,
      sla: SLADashboardView,
      risk: AtRiskView,
      plr: PLRComparison,
      killed: KilledIdeasLibrary,
      accounting: InnovationAccounting,
      funnel: FunnelAnalytics,
      reviewers: ReviewerAssignment,
      // Tools section (mixed scope)
      tools: ToolsLibrary,
      'value-prop': ValuePropCanvas,
      lean: LeanCanvas,
      assumptions: AssumptionCanvas,
      swot: SWOTCanvas,
      rice: RICEScoring,
      matrix: PriorityMatrix,
      weighted: WeightedScoring,
      compare: InitiativeCompare,
    }[activeView];

    if (ViewComponent) {
      return <ViewComponent {...viewProps} />;
    }

    return (
      <div className="blueprint-placeholder-view">
        <h2>{currentViewInfo.name}</h2>
        <p>This view is coming soon.</p>
      </div>
    );
  };

  // Build breadcrumbs - always show except on form views
  const isFormView = activeView === 'new' || activeView === 'edit';
  const breadcrumbsContent = !isFormView ? (
    <Breadcrumbs>
      <Breadcrumb
        icon={DashboardIcon}
        label="Initiatives"
        onClick={activeView !== 'overview' ? () => handleViewChange('overview') : undefined}
        active={activeView === 'overview'}
      />
      {activeView !== 'overview' && currentViewInfo.group && (
        <>
          <BreadcrumbSeparator />
          <Breadcrumb label={currentViewInfo.group} />
        </>
      )}
      {activeView !== 'overview' && (
        <>
          <BreadcrumbSeparator />
          <Breadcrumb label={currentViewInfo.name} active={!activeInitiative} />
        </>
      )}
      {activeInitiative && (
        <>
          <BreadcrumbSeparator />
          <Breadcrumb
            icon={FolderIcon}
            label={`${activeInitiative.display_id}: ${activeInitiative.name}`}
            active
          />
        </>
      )}
    </Breadcrumbs>
  ) : null;

  // Build modals
  const modalsContent = (
    <>
      {/* Initiative create/edit modal */}
      <InitiativeModal
        isOpen={modals.initiativeModal.isOpen}
        onClose={modals.initiativeModal.close}
        initiative={modals.initiativeModal.initiative}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={modals.deleteConfirm.isOpen}
        onClose={modals.deleteConfirm.close}
        onConfirm={confirmDelete}
        title="Delete Initiative?"
        message={`Are you sure you want to delete "${modals.deleteConfirm.initiative?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={saving}
        icon={DeleteIcon}
      />

      {/* Guidance Panel */}
      <GuidancePanel
        isOpen={modals.guidancePanel.isOpen}
        onClose={modals.guidancePanel.close}
        currentView={activeView}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={modals.createProject.isOpen}
        onClose={modals.createProject.close}
      />

      {/* AI Design Wizard */}
      <AIDesignWizard
        isOpen={modals.aiWizard.isOpen}
        onClose={modals.aiWizard.close}
        initiative={modals.aiWizard.initiative}
      />

      {/* Quick Idea Capture (for stage views) */}
      <QuickIdeaCapture
        isOpen={modals.quickIdea.isOpen}
        onClose={modals.quickIdea.close}
        initiativeId={activeInitiative?.id}
        onSaved={fetchProductIdeas}
      />

      {/* AI Coach Panel */}
      <AICoachPanel
        isOpen={modals.aiCoach.isOpen}
        onClose={modals.aiCoach.close}
      />

      {/* Export Manager */}
      <ExportManager
        isOpen={modals.exportManager.isOpen}
        onClose={modals.exportManager.close}
      />
    </>
  );

  // Toolbar actions
  const actionsContent = (
    <div style={{ display: 'flex', gap: 6 }}>
      <BacklinksButton
        entityId={activeInitiative ? `artefact_${activeInitiative.id}` : null}
        isOpen={showBacklinks}
        onClick={() => setShowBacklinks(!showBacklinks)}
      />
      <button
        className="btn btn-sm btn-secondary"
        onClick={modals.exportManager.open}
        title="Export"
      >
        <DownloadIcon fontSize="small" />
        Export
      </button>
      <button
        className={`btn btn-sm ${modals.aiCoach.isOpen ? 'btn-primary' : 'btn-secondary'}`}
        onClick={modals.aiCoach.toggle}
        title="AI Coach"
      >
        <AutoAwesomeIcon fontSize="small" />
        AI Coach
      </button>
    </div>
  );

  // Build dashboard stats from domain stats
  const dashboardStats = useMemo(() => {
    if (!domainStats) return [];
    const summary = domainStats.summary || {};
    const byStage = domainStats.byStage || {};

    return [
      { label: 'Total', value: summary.total || 0, icon: '&#128161;' },
      { label: 'Active', value: summary.active || 0, icon: '&#9889;' },
      { label: 'In Idea', value: byStage.idea || 0, icon: '&#128308;' },
      { label: 'Exploring', value: byStage.explore || 0, icon: '&#128269;' },
      { label: 'Approved', value: summary.approved || 0, subtext: `${summary.successRate || 0}% success rate`, icon: '&#9989;' },
    ];
  }, [domainStats]);

  // Quick actions for dashboard
  const dashboardQuickActions = useMemo(() => [
    {
      label: 'View Pipeline',
      icon: <ViewKanbanIcon fontSize="small" />,
      onClick: () => handleViewChange('pipeline'),
    },
    {
      label: 'Funnel Health',
      icon: <TrendingUpIcon fontSize="small" />,
      onClick: () => handleViewChange('health'),
    },
  ], [handleViewChange]);

  // Handler to select an initiative from dashboard
  const handleDashboardSelectInitiative = useCallback((initiative) => {
    // First, we need to associate with a project if available
    if (initiative.project_id) {
      const project = projects.find(p => p.id === initiative.project_id);
      if (project) {
        setActiveProject(project.id);
      }
    }
    // Set the initiative as active
    setActiveInitiative(initiative);
    setSelectedId(initiative.id);
    // Navigate to overview with initiative ID in URL (use handleNavigate to ensure URL includes initiative)
    handleNavigate('overview', initiative);
  }, [projects, setActiveProject, setActiveInitiative, setSelectedId, handleNavigate]);

  // Map views to sections for navigation
  const getActiveSection = () => {
    // Overview section (portfolio level): initiative board, dashboard
    if (['overview', 'initiatives', 'dashboard'].includes(activeView)) return 'overview';
    // Ideation section (initiative-scoped): pipeline, funnel health, discovery (combined)
    if (['pipeline', 'health', 'discovery', 'idea', 'explore', 'assess'].includes(activeView)) return 'ideation';
    // Market section (initiative-scoped)
    if (['market', 'tamsam', 'competitors', 'segments', 'porters', 'pestle'].includes(activeView)) return 'market';
    // Decision section (initiative-scoped): business case, approval
    if (['summary', 'case', 'approval'].includes(activeView)) return 'decision';
    // Governance section (initiative-scoped)
    if (['gates', 'sla', 'risk'].includes(activeView)) return 'governance';
    // Tools section (mixed scope)
    if (['tools', 'value-prop', 'lean', 'assumptions', 'swot', 'rice', 'matrix', 'weighted', 'compare', 'ai-design'].includes(activeView)) return 'tools';
    return 'overview';
  };

  const activeSection = getActiveSection();

  // Handle section tab changes
  const handleSectionChange = useCallback((sectionId) => {
    // Navigate to the default view for each section
    const sectionDefaults = {
      overview: 'overview',
      ideation: 'pipeline', // Pipeline view shows initiative's stage journey
      market: 'market',
      decision: 'summary', // Summary shows validated ideas ready for business case
      governance: 'gates',
      tools: 'tools', // Tools library as default
    };
    handleViewChange(sectionDefaults[sectionId] || 'overview');
  }, [handleViewChange]);

  // Hide navigator and tabs on form views for a cleaner experience
  const hideChrome = isFormView;

  return (
    <WorkspaceLayout
      views={hideChrome ? [] : SECTION_TABS}
      activeView={activeSection}
      onViewChange={handleSectionChange}
      navigator={hideChrome ? null : (
        <BlueprintNavigator
          activeSection={activeSection}
          activeView={activeView}
          onViewChange={handleViewChange}
          onCreateClick={handleCreateInitiative}
          onOpenAIWizard={handleAIDesign}
          hasActiveInitiative={hasActiveInitiative}
          activeInitiative={activeInitiative}
          projects={projects}
          activeProject={activeProject}
          onSelectProject={handleMainProjectSelect}
          onCreateProject={modals.createProject.open}
        />
      )}
      breadcrumbs={hideChrome ? null : breadcrumbsContent}
      actions={actionsContent}
      error={error}
      modals={modalsContent}
      rightPanel={showBacklinks && activeInitiative ? (
        <BacklinksSidebar
          entityId={`artefact_${activeInitiative.id}`}
          onClose={() => setShowBacklinks(false)}
        />
      ) : null}
    >
      {activeInitiative && (
        <LifecycleBar artefactId={activeInitiative.id} compact={false} />
      )}
      {renderView()}

      {/* Floating Action Button - only show on overview section views */}
      {/* Ideation, market, governance, and tools sections don't need the create initiative FAB */}
      {!hideChrome && ['overview', 'initiatives', 'dashboard'].includes(activeView) && (
        <button
          className="blueprint-fab"
          onClick={handleCreateInitiative}
          title="Create new initiative"
        >
          <AddIcon />
        </button>
      )}
    </WorkspaceLayout>
  );
}
