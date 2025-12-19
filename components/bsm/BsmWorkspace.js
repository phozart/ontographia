/**
 * BsmWorkspace - Main workspace layout for Business Service Management Studio
 *
 * Uses the same layout pattern as RequirementsStudio for consistency.
 *
 * @component
 * @module components/bsm/BsmWorkspace
 */

import { useState, useMemo, useCallback } from 'react';
import { useBsm, BSM_WORKSPACE_MODULES } from './BsmContext';
import BsmListView from './BsmListView';
import BsmMapView from './BsmMapView';
import BsmArtefactModal from './BsmArtefactModal';

// Shared UI components
import { WorkspaceLayout, Breadcrumb, BreadcrumbSeparator, Breadcrumbs } from '../ui';

// Icons
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupIcon from '@mui/icons-material/Group';
import LinkIcon from '@mui/icons-material/Link';
import ViewListIcon from '@mui/icons-material/ViewList';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const MODULE_ICONS = {
  catalog: MiscellaneousServicesIcon,
  levels: SpeedIcon,
  consumers: GroupIcon,
  dependencies: LinkIcon,
};

const MODULE_COLORS = {
  catalog: '#3b82f6',
  levels: '#8b5cf6',
  consumers: '#22c55e',
  dependencies: '#f59e0b',
};

// View definitions per module
const MODULE_VIEWS = {
  catalog: [
    { id: 'list', name: 'Service Catalog', icon: ViewListIcon },
    { id: 'map', name: 'Service Map', icon: AccountTreeIcon },
  ],
  levels: [
    { id: 'list', name: 'Service Levels', icon: ViewListIcon },
  ],
  consumers: [
    { id: 'list', name: 'Consumers', icon: ViewListIcon },
  ],
  dependencies: [
    { id: 'map', name: 'Dependency Map', icon: AccountTreeIcon },
    { id: 'list', name: 'List View', icon: ViewListIcon },
  ],
};

/**
 * Navigator Component - Sidebar navigation
 */
function Navigator({ activeModule, activeView, onModuleChange, onViewChange, artefactCounts, onCreate }) {
  const [expandedGroups, setExpandedGroups] = useState({ catalog: true });

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <div className="navigator">
      {/* Overview button */}
      <div className="nav-home">
        <button
          className={`nav-home-btn ${activeModule === 'overview' ? 'active' : ''}`}
          onClick={() => onModuleChange('overview')}
        >
          <DashboardIcon fontSize="small" />
          <span>Overview</span>
        </button>
      </div>

      {/* Module groups */}
      <div className="nav-views-grouped">
        {Object.entries(BSM_WORKSPACE_MODULES).map(([moduleId, module]) => {
          const Icon = MODULE_ICONS[moduleId] || MiscellaneousServicesIcon;
          const color = MODULE_COLORS[moduleId] || '#3b82f6';
          const count = artefactCounts[moduleId] || 0;
          const isExpanded = expandedGroups[moduleId];
          const isActiveModule = activeModule === moduleId;
          const views = MODULE_VIEWS[moduleId] || [];

          return (
            <div key={moduleId} className={`nav-group ${isActiveModule ? 'has-active' : ''}`}>
              <button
                className={`nav-group-header ${isExpanded ? 'expanded' : ''} ${isActiveModule ? 'has-active' : ''}`}
                onClick={() => toggleGroup(moduleId)}
                style={{ borderLeftColor: color }}
              >
                {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                <span className="group-name">{module.name}</span>
                {count > 0 && <span className="group-count">{count}</span>}
              </button>
              {isExpanded && (
                <div className="nav-group-views">
                  {views.map(view => {
                    const ViewIcon = view.icon;
                    return (
                      <button
                        key={view.id}
                        className={`nav-view-btn ${activeModule === moduleId && activeView === view.id ? 'active' : ''}`}
                        onClick={() => {
                          onModuleChange(moduleId);
                          onViewChange(view.id);
                        }}
                      >
                        <ViewIcon fontSize="small" />
                        <span>{view.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick create */}
      <div className="nav-footer">
        <button className="nav-create-btn" onClick={() => onCreate(null)}>
          <AddIcon fontSize="small" />
          <span>New Artefact</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Overview Dashboard Component
 */
function OverviewDashboard({ stats, artefactCounts, onNavigate }) {
  return (
    <div className="cap-overview">
      <div className="overview-header">
        <h2>Service Management Studio</h2>
        <p>Define, manage, and govern business services and their relationships</p>
      </div>

      <div className="overview-stats">
        <div className="stat-card">
          <span className="stat-value">{stats?.services?.total || 0}</span>
          <span className="stat-label">Services</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats?.consumers?.total || 0}</span>
          <span className="stat-label">Consumers</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats?.serviceLevels || 0}</span>
          <span className="stat-label">Service Levels</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats?.dependencies || 0}</span>
          <span className="stat-label">Dependencies</span>
        </div>
      </div>

      <div className="overview-modules">
        <h3>Modules</h3>
        <div className="module-cards">
          {Object.entries(BSM_WORKSPACE_MODULES).map(([moduleId, module]) => {
            const Icon = MODULE_ICONS[moduleId] || MiscellaneousServicesIcon;
            const color = MODULE_COLORS[moduleId] || '#3b82f6';
            const count = artefactCounts[moduleId] || 0;

            return (
              <button
                key={moduleId}
                className="module-card"
                onClick={() => onNavigate(moduleId)}
              >
                <div className="module-card-icon" style={{ backgroundColor: `${color}20`, color }}>
                  <Icon />
                </div>
                <div className="module-card-content">
                  <h4>{module.name}</h4>
                  <p>{module.description}</p>
                  <span className="module-count">{count} items</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * BsmWorkspace Component
 */
export default function BsmWorkspace() {
  const {
    artefacts,
    services,
    dependencyMap,
    stats,
    loading,
    error,
    saving,
    activeModule,
    setActiveModule,
    activeView,
    setActiveView,
    selectedId,
    setSelectedId,
    getArtefactsByModule,
    BSM_TYPE_DEFS,
  } = useBsm();

  const [showModal, setShowModal] = useState(false);
  const [editingArtefact, setEditingArtefact] = useState(null);

  // Get current module config
  const currentModule = BSM_WORKSPACE_MODULES[activeModule];
  const moduleArtefacts = activeModule !== 'overview' ? getArtefactsByModule(activeModule) : [];

  // Calculate artefact counts per module
  const artefactCounts = useMemo(() => {
    const counts = {};
    Object.keys(BSM_WORKSPACE_MODULES).forEach(moduleId => {
      counts[moduleId] = getArtefactsByModule(moduleId).length;
    });
    return counts;
  }, [artefacts, getArtefactsByModule]);

  // Handle create new
  const handleCreate = useCallback((type = null) => {
    setEditingArtefact(null);
    setShowModal(true);
  }, []);

  // Handle edit
  const handleEdit = useCallback((artefact) => {
    setEditingArtefact(artefact);
    setShowModal(true);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setEditingArtefact(null);
  }, []);

  // Get available types for current module
  const getAvailableTypes = useCallback(() => {
    if (!currentModule) return [];
    return currentModule.types.map(typeId => ({
      id: typeId,
      ...BSM_TYPE_DEFS[typeId],
    }));
  }, [currentModule, BSM_TYPE_DEFS]);

  // Handle module navigation
  const handleModuleChange = useCallback((moduleId) => {
    setActiveModule(moduleId);
    if (moduleId !== 'overview') {
      const views = MODULE_VIEWS[moduleId] || [];
      if (views.length > 0 && !views.find(v => v.id === activeView)) {
        setActiveView(views[0].id);
      }
    }
  }, [activeView, setActiveModule, setActiveView]);

  // Render main content
  const renderMainContent = () => {
    if (activeModule === 'overview') {
      return (
        <OverviewDashboard
          stats={stats}
          artefactCounts={artefactCounts}
          onNavigate={handleModuleChange}
        />
      );
    }

    return (
      <div className="cap-view-container">
        {activeView === 'list' && (
          <BsmListView
            artefacts={moduleArtefacts}
            onSelect={setSelectedId}
            onEdit={handleEdit}
            onCreate={handleCreate}
            selectedId={selectedId}
            moduleId={activeModule}
          />
        )}
        {activeView === 'map' && (
          <BsmMapView
            services={activeModule === 'catalog' ? services : moduleArtefacts}
            dependencyMap={dependencyMap}
            onSelect={setSelectedId}
            onEdit={handleEdit}
            onCreate={handleCreate}
            selectedId={selectedId}
            moduleId={activeModule}
          />
        )}
      </div>
    );
  };

  // Get view name for breadcrumbs
  const getViewName = () => {
    if (!activeModule || activeModule === 'overview') return null;
    const views = MODULE_VIEWS[activeModule] || [];
    const view = views.find(v => v.id === activeView);
    return view?.name || activeView;
  };

  // Build breadcrumbs
  const breadcrumbsContent = activeModule !== 'overview' ? (
    <Breadcrumbs>
      <Breadcrumb
        icon={DashboardIcon}
        label="Overview"
        onClick={() => handleModuleChange('overview')}
      />
      <BreadcrumbSeparator />
      <Breadcrumb label={currentModule?.name} />
      <BreadcrumbSeparator />
      <Breadcrumb label={getViewName()} active />
    </Breadcrumbs>
  ) : null;

  // Modal content
  const modalsContent = showModal ? (
    <BsmArtefactModal
      isOpen={showModal}
      onClose={handleModalClose}
      artefact={editingArtefact}
      availableTypes={getAvailableTypes()}
      defaultType={currentModule?.types?.[0]}
    />
  ) : null;

  return (
    <WorkspaceLayout
      navigator={
        <Navigator
          activeModule={activeModule}
          activeView={activeView}
          onModuleChange={handleModuleChange}
          onViewChange={setActiveView}
          artefactCounts={artefactCounts}
          onCreate={handleCreate}
        />
      }
      breadcrumbs={breadcrumbsContent}
      error={error}
      modals={modalsContent}
    >
      {renderMainContent()}
    </WorkspaceLayout>
  );
}
