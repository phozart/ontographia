/**
 * ProjectWorkspace.js
 *
 * Main workspace component for Project Studio.
 * Manages views for project lifecycle, planning, RAID, change management, and closure.
 */

import { useCallback, useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useProjectStudio, ProjectStudioProvider } from './ProjectContext';
import { useProjects } from '../../ProjectContext';
import { useDomains } from '../../DomainContext';
import { useAuth } from '../../AuthContext';
import { buildSpaceUrl } from '../../../lib/urlUtils';

// Shared UI components
import {
  WorkspaceLayout,
  Breadcrumb,
  BreadcrumbSeparator,
  Breadcrumbs,
  ConfirmModal,
} from '@/components/ui';
import { DomainDashboard } from '../../shared/DomainDashboard';

// Navigation
import ProjectNavigator, { VIEW_INFO } from './ProjectNavigator';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';

// Shared components
import CreateProjectModal from '../../shared/CreateProjectModal';
import GuidancePanel from './shared/GuidancePanel';

// View components
import OverviewDashboard from './OverviewDashboard';
import RAIDDashboard from './raid/RAIDDashboard';
import RiskRegister from './raid/RiskRegister';
import IssueLog from './raid/IssueLog';
import DependencyMap from './raid/DependencyMap';
import DecisionLog from './raid/DecisionLog';
import WBSTree from './planning/WBSTree';
import ScheduleView from './planning/ScheduleView';
import MilestoneList from './planning/MilestoneList';
import ResourceAllocation from './planning/ResourceAllocation';
import BudgetTracker from './planning/BudgetTracker';
import ChangeOverview from './change/ChangeOverview';
import ImpactAssessment from './change/ImpactAssessment';
import StakeholderEngagement from './change/StakeholderEngagement';
import CommunicationsPlan from './change/CommunicationsPlan';
import TrainingPlan from './change/TrainingPlan';
import ReadinessAssessment from './change/ReadinessAssessment';
import StatusReport from './status/StatusReport';
import LessonsLearned from './closure/LessonsLearned';
import HandoverChecklist from './closure/HandoverChecklist';
import BenefitsBaseline from './closure/BenefitsBaseline';
import PortfolioDashboard from './portfolio/PortfolioDashboard';
import StageView from './StageView';
import ProjectModal from './project/ProjectModal';
import CreateTypeSelector from './project/CreateTypeSelector';

// Custom hook for modal state management
function useProjectModals() {
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);
  const [artefactModalOpen, setArtefactModalOpen] = useState(false);
  const [artefactModalType, setArtefactModalType] = useState(null);
  const [artefactModalArtefact, setArtefactModalArtefact] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmArtefact, setDeleteConfirmArtefact] = useState(null);
  const [guidancePanelOpen, setGuidancePanelOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  return {
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
    guidancePanel: {
      isOpen: guidancePanelOpen,
      open: () => setGuidancePanelOpen(true),
      close: () => setGuidancePanelOpen(false),
      toggle: () => setGuidancePanelOpen(prev => !prev),
    },
  };
}

// Dashboard config for Project Studio
const PROJECT_DASHBOARD_CONFIG = {
  title: 'Project Studio',
  subtitle: 'Manage projects across this domain',
  projectLabel: 'Projects',
  projectLabelSingular: 'Project',
  emptyIcon: '&#128197;',
  emptyTitle: 'No Projects Yet',
  emptyMessage: 'Create your first project to start tracking work, risks, and milestones.',
  displayIdField: 'display_id',
  statusField: 'status',
  countField: 'artefact_count',
  countLabel: 'items',
  showProgress: true,
};

function ProjectWorkspaceInner({ view: urlView, domainId: urlDomainId, projectId: urlProjectId }) {
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
    artefacts,
    activeView,
    setActiveView,
    selectedArtefact,
    setSelectedArtefact,
    deleteArtefact,
    error,
    saving,
    stats,
    currentStage,
    PROJECT_ARTEFACT_TYPES,
  } = useProjectStudio();

  // Centralized modal state
  const modals = useProjectModals();

  // Domain-level dashboard state
  const [domainOverview, setDomainOverview] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  // Fetch domain-level data when no project is selected
  useEffect(() => {
    if (activeProject || !activeDomain) return;

    const fetchDomainData = async () => {
      setDashboardLoading(true);
      setDashboardError(null);

      try {
        const res = await fetch(`/api/projects/overview?domainId=${activeDomain}`, { headers: authHeaders });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Overview: ${res.status}`);
        }
        const data = await res.json();
        setDomainOverview(data);
      } catch (err) {
        console.error('Error fetching domain data:', err);
        setDashboardError(err.message);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDomainData();
  }, [activeProject, activeDomain, authHeaders]);

  // Sync view from URL prop
  useEffect(() => {
    if (urlView && urlView !== activeView) {
      const validViews = Object.keys(VIEW_INFO);
      if (validViews.includes(urlView)) {
        setActiveView(urlView);
      }
    }
  }, [urlView, activeView, setActiveView]);

  // Sync project from URL parameter
  useEffect(() => {
    if (!urlProjectId || !projects.length) return;

    const activeDisplayId = activeProject?.displayId || activeProject?.display_id;
    if (activeDisplayId === urlProjectId) return;

    const project = findByDisplayId(urlProjectId);
    if (project && project.id !== activeProject?.id) {
      setActiveProject(project.id);
    }
  }, [urlProjectId, projects, activeProject, findByDisplayId, setActiveProject]);

  // Update URL when view changes
  const handleViewChange = useCallback((newView) => {
    setActiveView(newView);

    const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;
    const projectDisplayId = activeProject?.displayId || activeProject?.display_id;

    if (domainDisplayId && projectDisplayId) {
      const newUrl = buildSpaceUrl('projects', newView, domainDisplayId, projectDisplayId);
      // Only navigate if URL is different to avoid "hard navigate to same URL" error
      const currentPath = router.asPath.split('?')[0];
      if (newUrl !== currentPath) {
        router.replace(newUrl, undefined, { shallow: true });
      }
    }
  }, [setActiveView, router, activeDomainObj, activeProject]);

  // Get current view info for breadcrumbs
  const currentViewInfo = VIEW_INFO[activeView] || { name: activeView, group: null };

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
    setSelectedArtefact(artefact);
  }, [setSelectedArtefact]);

  const handleDeleteArtefact = useCallback((artefact) => {
    modals.deleteConfirm.open(artefact);
  }, [modals]);

  const confirmDelete = useCallback(async () => {
    if (modals.deleteConfirm.artefact) {
      await deleteArtefact(modals.deleteConfirm.artefact.id);
      modals.deleteConfirm.close();
    }
  }, [modals.deleteConfirm, deleteArtefact]);

  const handleMainProjectSelect = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setActiveProject(projectId);

    const projectDisplayId = project.displayId || project.display_id;
    const domainDisplayId = activeDomainObj?.displayId || activeDomainObj?.display_id;

    if (projectDisplayId && domainDisplayId) {
      const newUrl = buildSpaceUrl('projects', activeView || 'overview', domainDisplayId, projectDisplayId);
      // Only navigate if URL is different to avoid "hard navigate to same URL" error
      const currentPath = router.asPath.split('?')[0];
      if (newUrl !== currentPath) {
        router.replace(newUrl, undefined, { shallow: true });
      }
    }
  }, [projects, setActiveProject, activeDomainObj, activeView, router]);

  // Standard props passed to all views
  const viewProps = {
    onSelectArtefact: handleSelectArtefact,
    onEditArtefact: handleEditArtefact,
    onDeleteArtefact: handleDeleteArtefact,
    onCreateArtefact: handleCreateArtefact,
    onNavigate: handleViewChange,
  };

  // Render current view
  const renderView = () => {
    // Map views to components
    const ViewComponent = {
      overview: OverviewDashboard,
      portfolio: PortfolioDashboard,

      // Lifecycle stages
      initiation: StageView,
      planning: StageView,
      execution: StageView,
      closing: StageView,

      // Planning
      wbs: WBSTree,
      schedule: ScheduleView,
      milestones: MilestoneList,
      resources: ResourceAllocation,
      budget: BudgetTracker,

      // RAID
      raid: RAIDDashboard,
      risks: RiskRegister,
      assumptions: () => <RiskRegister artefactType="assumption" {...viewProps} />,
      issues: IssueLog,
      dependencies: DependencyMap,
      decisions: DecisionLog,

      // Change Management
      change: ChangeOverview,
      impact: ImpactAssessment,
      stakeholders: StakeholderEngagement,
      communications: CommunicationsPlan,
      training: TrainingPlan,
      readiness: ReadinessAssessment,

      // Status & Closure
      status: StatusReport,
      lessons: LessonsLearned,
      handover: HandoverChecklist,
      benefits: BenefitsBaseline,
    }[activeView];

    if (ViewComponent) {
      // For stage views, pass the stage ID
      if (['initiation', 'planning', 'execution', 'closing'].includes(activeView)) {
        return <ViewComponent stageId={activeView} {...viewProps} />;
      }
      return <ViewComponent {...viewProps} />;
    }

    // Fallback for views not yet implemented
    return (
      <div className="project-placeholder-view">
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
      {activeProject && (
        <>
          <BreadcrumbSeparator />
          <Breadcrumb
            icon={FolderIcon}
            label={activeProject.name}
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
        typeDefs={PROJECT_ARTEFACT_TYPES}
        currentStage={currentStage}
      />

      {/* Artefact create/edit modal */}
      <ProjectModal
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
        message={`Are you sure you want to delete "${modals.deleteConfirm.artefact?.name || modals.deleteConfirm.artefact?.title}"? This action cannot be undone.`}
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
        currentStage={currentStage}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={modals.createProject.isOpen}
        onClose={modals.createProject.close}
      />
    </>
  );

  // Toolbar actions
  const actionsContent = (
    <>
      <button
        className="workspace-action-btn workspace-action-btn--primary"
        onClick={modals.typeSelector.open}
        disabled={!activeProject}
        title="Create new artefact"
      >
        <AddIcon fontSize="small" />
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

  // Build dashboard stats from domain overview
  const dashboardStats = useMemo(() => {
    if (!domainOverview) return [];
    const summary = domainOverview.summary || {};
    const byStatus = domainOverview.byStatus || {};

    return [
      { label: 'Total', value: summary.total || projects.length || 0, icon: '&#128197;' },
      { label: 'Active', value: byStatus.active || summary.active || 0, icon: '&#9889;' },
      { label: 'Planning', value: byStatus.planning || 0, icon: '&#128221;' },
      { label: 'RAID Items', value: summary.raidCount || 0, icon: '&#9888;' },
      { label: 'Overdue', value: summary.overdueCount || 0, subtext: 'tasks', icon: '&#128308;' },
    ];
  }, [domainOverview, projects.length]);

  // Quick actions for dashboard
  const dashboardQuickActions = useMemo(() => [
    {
      label: 'Portfolio View',
      icon: <AssessmentIcon fontSize="small" />,
      onClick: () => handleViewChange('portfolio'),
    },
    {
      label: 'View Timeline',
      icon: <TimelineIcon fontSize="small" />,
      onClick: () => handleViewChange('schedule'),
    },
  ], [handleViewChange]);

  // Handler to select a project from dashboard
  const handleDashboardSelectProject = useCallback((project) => {
    setActiveProject(project.id);
    handleViewChange('overview');
  }, [setActiveProject, handleViewChange]);

  // Render domain dashboard when no project is selected
  if (!activeProject) {
    return (
      <>
        <DomainDashboard
          config={PROJECT_DASHBOARD_CONFIG}
          projects={domainOverview?.projects || projects}
          stats={dashboardStats}
          loading={dashboardLoading}
          error={dashboardError}
          onSelectProject={handleDashboardSelectProject}
          onCreateProject={modals.createProject.open}
          quickActions={dashboardQuickActions}
        />
        {modalsContent}
      </>
    );
  }

  return (
    <WorkspaceLayout
      navigator={
        <ProjectNavigator
          activeView={activeView}
          onViewChange={handleViewChange}
          stats={stats}
          currentStage={currentStage}
          onCreateClick={modals.typeSelector.open}
          projects={projects}
          activeProject={activeProject}
          onSelectProject={handleMainProjectSelect}
          onCreateProject={modals.createProject.open}
        />
      }
      breadcrumbs={breadcrumbsContent}
      actions={actionsContent}
      error={error}
      modals={modalsContent}
    >
      {renderView()}
    </WorkspaceLayout>
  );
}

export default function ProjectWorkspace(props) {
  return (
    <ProjectStudioProvider>
      <ProjectWorkspaceInner {...props} />
    </ProjectStudioProvider>
  );
}
