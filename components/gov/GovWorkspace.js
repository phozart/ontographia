/**
 * GovWorkspace - Main workspace layout for Governance & Decision Design Studio
 *
 * Uses the same layout pattern as other studios for consistency.
 *
 * @component
 * @module components/gov/GovWorkspace
 */

import { useState, useMemo, useCallback } from 'react';
import { useGov, GOV_WORKSPACE_MODULES } from './GovContext';
import GovListView from './GovListView';
import GovDecisionMatrix from './GovDecisionMatrix';
import GovArtefactModal from './GovArtefactModal';
import GovGuidancePanel from './GovGuidancePanel';
import GovDashboard from './GovDashboard';

// Shared UI components
import { WorkspaceLayout, Breadcrumb, BreadcrumbSeparator, Breadcrumbs } from '../ui';

// Icons
import GavelIcon from '@mui/icons-material/Gavel';
import GroupsIcon from '@mui/icons-material/Groups';
import PolicyIcon from '@mui/icons-material/Policy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import AddIcon from '@mui/icons-material/Add';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

const MODULE_ICONS = {
  foundations: StarIcon,
  rights: GavelIcon,
  forums: GroupsIcon,
  policies: PolicyIcon,
  escalations: TrendingUpIcon,
};

const MODULE_COLORS = {
  foundations: '#7c3aed',
  rights: '#8b5cf6',
  forums: '#059669',
  policies: '#f59e0b',
  escalations: '#ef4444',
};

// View definitions per module
const MODULE_VIEWS = {
  foundations: [
    { id: 'list', name: 'List View', icon: ViewListIcon },
  ],
  rights: [
    { id: 'matrix', name: 'Decision Matrix', icon: GridViewIcon },
    { id: 'list', name: 'List View', icon: ViewListIcon },
  ],
  forums: [
    { id: 'structure', name: 'Structure View', icon: AccountTreeIcon },
    { id: 'list', name: 'List View', icon: ViewListIcon },
  ],
  policies: [
    { id: 'hierarchy', name: 'Policy Hierarchy', icon: AccountTreeIcon },
    { id: 'list', name: 'List View', icon: ViewListIcon },
  ],
  escalations: [
    { id: 'list', name: 'List View', icon: ViewListIcon },
  ],
};

/**
 * Navigator Component - Sidebar navigation
 */
function Navigator({ activeModule, activeView, onModuleChange, onViewChange, artefactCounts, onCreate }) {
  const [expandedGroups, setExpandedGroups] = useState({ foundations: true });

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
        {Object.entries(GOV_WORKSPACE_MODULES).map(([moduleId, module]) => {
          const Icon = MODULE_ICONS[moduleId] || StarIcon;
          const color = MODULE_COLORS[moduleId] || '#6366f1';
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
 * GovWorkspace Component
 */
export default function GovWorkspace() {
  const {
    artefacts,
    governanceStructure,
    policyHierarchy,
    decisionMatrix,
    loading,
    error,
    activeModule,
    setActiveModule,
    activeView,
    setActiveView,
    selectedId,
    setSelectedId,
    getArtefactsByModule,
    GOV_TYPE_DEFS,
  } = useGov();

  const [showModal, setShowModal] = useState(false);
  const [editingArtefact, setEditingArtefact] = useState(null);

  // Get current module config
  const currentModule = GOV_WORKSPACE_MODULES[activeModule];
  const moduleArtefacts = activeModule !== 'overview' ? getArtefactsByModule(activeModule) : [];

  // Calculate artefact counts per module
  const artefactCounts = useMemo(() => {
    const counts = {};
    Object.keys(GOV_WORKSPACE_MODULES).forEach(moduleId => {
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
      ...GOV_TYPE_DEFS[typeId],
    }));
  }, [currentModule, GOV_TYPE_DEFS]);

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
        <GovDashboard
          onNavigate={handleModuleChange}
          onCreate={handleCreate}
        />
      );
    }

    return (
      <div className="gov-view-container">
        {activeView === 'list' && (
          <GovListView
            artefacts={moduleArtefacts}
            onSelect={setSelectedId}
            onEdit={handleEdit}
            onCreate={handleCreate}
            selectedId={selectedId}
            moduleId={activeModule}
          />
        )}
        {activeView === 'matrix' && (
          <GovDecisionMatrix
            matrix={decisionMatrix}
            onSelect={setSelectedId}
            onEdit={handleEdit}
            onCreate={handleCreate}
          />
        )}
        {activeView === 'structure' && (
          <GovListView
            artefacts={moduleArtefacts}
            onSelect={setSelectedId}
            onEdit={handleEdit}
            onCreate={handleCreate}
            selectedId={selectedId}
            moduleId={activeModule}
            viewMode="structure"
            structure={governanceStructure}
          />
        )}
        {activeView === 'hierarchy' && (
          <GovListView
            artefacts={moduleArtefacts}
            onSelect={setSelectedId}
            onEdit={handleEdit}
            onCreate={handleCreate}
            selectedId={selectedId}
            moduleId={activeModule}
            viewMode="hierarchy"
            hierarchy={policyHierarchy}
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
    <GovArtefactModal
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
