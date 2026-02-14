/**
 * PerfWorkspace - Main workspace for Performance and Outcomes Studio
 *
 * Features visual tools for OKR management, KPI tracking, and performance monitoring.
 * Includes interactive dashboards, tree views, and guided thinking tools.
 *
 * @module components/perf/PerfWorkspace
 */

import { useState } from 'react';
import FlagIcon from '@mui/icons-material/Flag';
import SpeedIcon from '@mui/icons-material/Speed';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { usePerf, PERF_WORKSPACE_MODULES } from './PerfContext';
import PerfDashboard from './PerfDashboard';
import PerfOkrTreeView from './PerfOkrTreeView';
import PerfKpiScorecard from './PerfKpiScorecard';
import PerfListView from './PerfListView';
import PerfArtefactModal from './PerfArtefactModal';

// Shared UI components
import { WorkspaceLayout, Breadcrumb, BreadcrumbSeparator, Breadcrumbs } from '@/components/ui';

const MODULE_ICONS = {
  strategy: FlagIcon,
  measurement: SpeedIcon,
  tracking: AssessmentIcon,
  outcomes: EmojiEventsIcon,
};

const VIEW_OPTIONS = {
  strategy: [
    { id: 'tree', label: 'OKR Tree', icon: AccountTreeIcon },
    { id: 'list', label: 'List', icon: TrendingUpIcon },
  ],
  measurement: [
    { id: 'scorecard', label: 'Scorecard', icon: DashboardIcon },
    { id: 'list', label: 'List', icon: TrendingUpIcon },
  ],
  tracking: [
    { id: 'list', label: 'List', icon: TrendingUpIcon },
  ],
  outcomes: [
    { id: 'list', label: 'List', icon: TrendingUpIcon },
  ],
};

/**
 * PerfWorkspace Component
 */
export default function PerfWorkspace() {
  const {
    stats,
    loading,
    refreshAll,
    fetchObjectiveHierarchy,
    fetchKpiTree,
  } = usePerf();

  const [activeModule, setActiveModule] = useState('overview');
  const [activeView, setActiveView] = useState('dashboard');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState(null);
  const [editingArtefact, setEditingArtefact] = useState(null);

  // Handle module change
  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
    if (moduleId === 'overview') {
      setActiveView('dashboard');
    } else {
      const views = VIEW_OPTIONS[moduleId] || [];
      setActiveView(views[0]?.id || 'list');
    }
  };

  // Handle create action
  const handleCreate = (type) => {
    setCreateType(type);
    setEditingArtefact(null);
    setCreateModalOpen(true);
  };

  // Handle edit action
  const handleEdit = (artefact) => {
    setEditingArtefact(artefact);
    setCreateType(artefact.artefact_type);
    setCreateModalOpen(true);
  };

  // Render active view
  const renderView = () => {
    if (activeModule === 'overview') {
      return <PerfDashboard onNavigate={handleModuleChange} onCreate={handleCreate} />;
    }

    if (activeModule === 'strategy') {
      if (activeView === 'tree') {
        return <PerfOkrTreeView onEdit={handleEdit} onCreate={handleCreate} />;
      }
      return <PerfListView moduleId="strategy" onEdit={handleEdit} onCreate={handleCreate} />;
    }

    if (activeModule === 'measurement') {
      if (activeView === 'scorecard') {
        return <PerfKpiScorecard onEdit={handleEdit} onCreate={handleCreate} />;
      }
      return <PerfListView moduleId="measurement" onEdit={handleEdit} onCreate={handleCreate} />;
    }

    return <PerfListView moduleId={activeModule} onEdit={handleEdit} onCreate={handleCreate} />;
  };

  // Navigator component
  const PerfNavigator = () => (
    <nav className="navigator">
      {/* Home/Dashboard Button */}
      <div className="nav-home">
        <button
          className={`nav-home-btn ${activeModule === 'overview' ? 'active' : ''}`}
          onClick={() => handleModuleChange('overview')}
        >
          <DashboardIcon fontSize="small" />
          <span>Overview</span>
        </button>
      </div>

      {/* Module Groups */}
      <div className="nav-views-grouped">
        {Object.entries(PERF_WORKSPACE_MODULES).map(([moduleId, module]) => {
          const Icon = MODULE_ICONS[moduleId] || FlagIcon;
          const isActive = activeModule === moduleId;
          const count = stats?.countsByType
            ? module.types.reduce((sum, t) => sum + (stats.countsByType[t] || 0), 0)
            : 0;

          return (
            <div key={moduleId} className="nav-group">
              <button
                className={`nav-group-header ${isActive ? 'has-active' : ''}`}
                onClick={() => handleModuleChange(moduleId)}
                style={{ borderLeftColor: isActive ? module.color || 'var(--accent)' : 'transparent' }}
              >
                {isActive ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                <span className="group-name">{module.name}</span>
                <span className="group-count">{count}</span>
              </button>

              {isActive && VIEW_OPTIONS[moduleId]?.length > 0 && (
                <div className="nav-group-views">
                  {VIEW_OPTIONS[moduleId].map(view => {
                    const ViewIcon = view.icon;
                    return (
                      <button
                        key={view.id}
                        className={`nav-view-btn ${activeView === view.id ? 'active' : ''}`}
                        onClick={() => setActiveView(view.id)}
                      >
                        <ViewIcon fontSize="small" />
                        <span>{view.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Button */}
      <div className="nav-footer">
        <button
          className="nav-create-btn"
          onClick={() => {
            const module = PERF_WORKSPACE_MODULES[activeModule];
            if (module?.types?.length) {
              handleCreate(module.types[0]);
            } else {
              handleCreate('perf_objective');
            }
          }}
        >
          <AddIcon fontSize="small" />
          <span>New Artefact</span>
        </button>
      </div>
    </nav>
  );

  // Build breadcrumbs
  const breadcrumbsContent = activeModule !== 'overview' ? (
    <Breadcrumbs>
      <Breadcrumb
        icon={DashboardIcon}
        label="Overview"
        onClick={() => handleModuleChange('overview')}
      />
      <BreadcrumbSeparator />
      <Breadcrumb label={PERF_WORKSPACE_MODULES[activeModule]?.name} />
      <BreadcrumbSeparator />
      <Breadcrumb
        label={VIEW_OPTIONS[activeModule]?.find(v => v.id === activeView)?.label || 'List'}
        active
      />
    </Breadcrumbs>
  ) : null;

  // Modal content
  const modalsContent = createModalOpen ? (
    <PerfArtefactModal
      open={createModalOpen}
      onClose={() => {
        setCreateModalOpen(false);
        setEditingArtefact(null);
        setCreateType(null);
      }}
      artefactType={createType}
      artefact={editingArtefact}
    />
  ) : null;

  return (
    <WorkspaceLayout
      navigator={<PerfNavigator />}
      breadcrumbs={breadcrumbsContent}
      modals={modalsContent}
    >
      <div className="studio-content">
        {renderView()}
      </div>

      <style jsx>{`
        .studio-content {
          flex: 1;
          overflow: auto;
        }
      `}</style>
    </WorkspaceLayout>
  );
}
