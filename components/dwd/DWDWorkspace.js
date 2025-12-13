// components/dwd/DWDWorkspace.js
// Dynamic Work Design Workspace - Main workspace component
// Uses same Navigator pattern as RequirementsStudio for consistent layout

import { useState, useCallback, useMemo } from 'react';
import { useDWD } from './DWDContext';
import { useProjects } from '../ProjectContext';

// View components
import OverviewDashboard from './views/OverviewDashboard';
import CaseBrowser from './views/CaseBrowser';
import WorkLandscape from './views/WorkLandscape';
import WorkActorFit from './views/WorkActorFit';
import AdjustmentLog from './views/AdjustmentLog';
import LearningCapture from './views/LearningCapture';

// Artefact components
import DWDArtefactModal from './artefacts/DWDArtefactModal';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import TuneIcon from '@mui/icons-material/Tune';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SearchIcon from '@mui/icons-material/Search';
import BuildIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';

// View groups configuration
const VIEW_GROUPS = [
  {
    id: 'diagnose',
    name: 'Diagnose',
    color: '#f59e0b',
    views: [
      { id: 'cases', name: 'Work Situations', icon: FolderIcon, color: '#6366f1' },
      { id: 'landscape', name: 'Work Landscape', icon: AssignmentIcon, color: '#3b82f6' },
      { id: 'actors', name: 'Work-Actor Fit', icon: PersonIcon, color: '#8b5cf6' },
    ]
  },
  {
    id: 'design',
    name: 'Design',
    color: '#8b5cf6',
    views: [
      { id: 'adjustments', name: 'Adjustments', icon: TuneIcon, color: '#10b981' },
    ]
  },
  {
    id: 'learn',
    name: 'Learn',
    color: '#10b981',
    views: [
      { id: 'learnings', name: 'Learning Capture', icon: LightbulbIcon, color: '#06b6d4' },
    ]
  },
];

// View info for breadcrumbs
const VIEW_INFO = {
  'overview': { name: 'Overview', group: null },
  'cases': { name: 'Work Situations', group: 'Diagnose' },
  'landscape': { name: 'Work Landscape', group: 'Diagnose' },
  'actors': { name: 'Work-Actor Fit', group: 'Diagnose' },
  'adjustments': { name: 'Adjustments', group: 'Design' },
  'learnings': { name: 'Learning Capture', group: 'Learn' },
};

// Navigator component
function DWDNavigator({ activeView, onViewChange, stats, onCreateClick, activeCase }) {
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const initial = {};
    VIEW_GROUPS.forEach(g => {
      initial[g.id] = true; // Start all expanded
    });
    return initial;
  });

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Calculate counts per view
  const viewCounts = useMemo(() => ({
    cases: stats?.cases || 0,
    landscape: stats?.workItems || 0,
    actors: stats?.actors || 0,
    adjustments: stats?.adjustments || 0,
    learnings: stats?.learnings || 0,
  }), [stats]);

  return (
    <div className="navigator">
      {/* Home/Overview Button */}
      <div className="nav-home">
        <button
          className={`nav-home-btn ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => onViewChange('overview')}
        >
          <DashboardIcon fontSize="small" />
          <span>Overview</span>
          {stats?.total > 0 && <span className="nav-count">{stats.total}</span>}
        </button>
      </div>

      {/* Active Case Indicator */}
      {activeCase && (
        <div className="nav-active-case">
          <FolderIcon fontSize="small" style={{ color: '#6366f1' }} />
          <span className="nav-active-case__name">{activeCase.name}</span>
        </div>
      )}

      {/* Grouped Views */}
      <div className="nav-views-grouped">
        {VIEW_GROUPS.map(group => {
          const hasActiveView = group.views.some(v => v.id === activeView);
          const groupCount = group.views.reduce((sum, v) => sum + (viewCounts[v.id] || 0), 0);

          return (
            <div key={group.id} className={`nav-group ${hasActiveView ? 'has-active' : ''}`}>
              <button
                className={`nav-group-header ${expandedGroups[group.id] ? 'expanded' : ''} ${hasActiveView ? 'has-active' : ''}`}
                onClick={() => toggleGroup(group.id)}
                style={{ borderLeftColor: group.color }}
              >
                {expandedGroups[group.id] ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                <span className="group-name">{group.name}</span>
                {groupCount > 0 && <span className="group-count">{groupCount}</span>}
              </button>
              {expandedGroups[group.id] && (
                <div className="nav-group-views">
                  {group.views.map(v => {
                    const Icon = v.icon;
                    const count = viewCounts[v.id] || 0;
                    return (
                      <button
                        key={v.id}
                        className={`nav-view-btn ${activeView === v.id ? 'active' : ''}`}
                        onClick={() => onViewChange(v.id)}
                        style={activeView === v.id ? { borderColor: v.color, color: v.color } : {}}
                      >
                        <Icon fontSize="small" />
                        <span>{v.name}</span>
                        {count > 0 && <span className="nav-count">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Create Button */}
      <div className="navigator-footer">
        <button className="nav-create-btn" onClick={onCreateClick}>
          <AddIcon fontSize="small" />
          <span>New Artefact</span>
        </button>
      </div>
    </div>
  );
}

// Create artefact type selector modal
function CreateTypeSelector({ isOpen, onClose, onSelectType, typeDefs }) {
  if (!isOpen) return null;

  const categories = {
    diagnose: {
      name: 'Diagnose',
      icon: SearchIcon,
      color: '#f59e0b',
      types: ['dwd_case', 'dwd_work_item', 'dwd_actor', 'dwd_signal']
    },
    design: {
      name: 'Design',
      icon: BuildIcon,
      color: '#8b5cf6',
      types: ['dwd_adjustment', 'dwd_coordination_pattern']
    },
    learn: {
      name: 'Learn',
      icon: SchoolIcon,
      color: '#10b981',
      types: ['dwd_learning', 'dwd_outcome']
    },
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="dwd-type-selector" onClick={(e) => e.stopPropagation()}>
        <div className="dwd-type-selector__header">
          <h3>Create New Artefact</h3>
          <button className="dwd-type-selector__close" onClick={onClose}>×</button>
        </div>
        <div className="dwd-type-selector__content">
          {Object.entries(categories).map(([catId, category]) => {
            const Icon = category.icon;
            return (
              <div key={catId} className="dwd-type-selector__category">
                <h4 style={{ color: category.color }}>
                  <Icon fontSize="small" style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  {category.name}
                </h4>
                <div className="dwd-type-selector__types">
                  {category.types.map(typeId => {
                    const typeDef = typeDefs?.[typeId];
                    if (!typeDef) return null;
                    return (
                      <button
                        key={typeId}
                        className="dwd-type-selector__type"
                        onClick={() => onSelectType(typeId)}
                        style={{ borderColor: typeDef.color }}
                      >
                        <span className="dwd-type-selector__type-dot" style={{ backgroundColor: typeDef.color }} />
                        <span className="dwd-type-selector__type-name">{typeDef.name}</span>
                        <span className="dwd-type-selector__type-desc">{typeDef.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Main workspace component
export default function DWDWorkspace() {
  const { activeProject } = useProjects();

  const {
    artefacts,
    cases,
    stats,
    activeCase,
    setActiveCase,
    loading,
    error,
    saving,
    activeView,
    setActiveView,
    selectedId,
    setSelectedId,
    refreshData,
    createArtefact,
    updateArtefact,
    deleteArtefact,
    DWD_TYPE_DEFS,
    DWD_STAGES,
  } = useDWD();

  // Modal state
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showArtefactModal, setShowArtefactModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [modalType, setModalType] = useState(null);
  const [editingArtefact, setEditingArtefact] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Calculate stats for navigator
  const navStats = useMemo(() => {
    return {
      total: artefacts.length,
      cases: cases.length,
      workItems: artefacts.filter(a => a.artefact_type === 'dwd_work_item').length,
      actors: artefacts.filter(a => a.artefact_type === 'dwd_actor').length,
      signals: artefacts.filter(a => a.artefact_type === 'dwd_signal').length,
      adjustments: artefacts.filter(a => a.artefact_type === 'dwd_adjustment').length,
      learnings: artefacts.filter(a => a.artefact_type === 'dwd_learning').length,
    };
  }, [artefacts, cases]);

  // Handlers
  const handleCreateClick = useCallback(() => {
    setShowTypeSelector(true);
  }, []);

  const handleSelectType = useCallback((type) => {
    setShowTypeSelector(false);
    setModalType(type);
    setModalMode('create');
    setEditingArtefact(null);
    setShowArtefactModal(true);
  }, []);

  const handleCreateArtefact = useCallback((type) => {
    setModalType(type);
    setModalMode('create');
    setEditingArtefact(null);
    setShowArtefactModal(true);
  }, []);

  const handleEditArtefact = useCallback((artefact) => {
    setModalType(artefact.artefact_type);
    setModalMode('edit');
    setEditingArtefact(artefact);
    setShowArtefactModal(true);
  }, []);

  const handleSelectArtefact = useCallback((artefact) => {
    setSelectedId(artefact.id);
  }, [setSelectedId]);

  const handleDeleteArtefact = useCallback((artefact) => {
    setDeleteConfirm(artefact);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteConfirm) {
      await deleteArtefact(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, deleteArtefact]);

  const handleCloseModal = useCallback(() => {
    setShowArtefactModal(false);
    setModalType(null);
    setEditingArtefact(null);
  }, []);

  const handleNavigate = useCallback((viewOrStage, type) => {
    if (type) {
      setActiveView(viewOrStage);
    } else if (DWD_STAGES?.[viewOrStage]) {
      const stageViewMap = {
        diagnose: 'landscape',
        design: 'adjustments',
        learn: 'learnings',
      };
      setActiveView(stageViewMap[viewOrStage] || 'overview');
    } else {
      setActiveView(viewOrStage);
    }
  }, [setActiveView, DWD_STAGES]);

  const handleSelectCase = useCallback((c) => {
    setActiveCase(c);
    setActiveView('landscape');
  }, [setActiveCase, setActiveView]);

  // Get current view info for breadcrumbs
  const currentViewInfo = VIEW_INFO[activeView] || { name: activeView, group: null };

  // Render current view
  const renderView = () => {
    const viewProps = {
      onSelectArtefact: handleSelectArtefact,
      onEditArtefact: handleEditArtefact,
      onDeleteArtefact: handleDeleteArtefact,
      onCreateArtefact: handleCreateArtefact,
    };

    switch (activeView) {
      case 'cases':
        return (
          <CaseBrowser
            {...viewProps}
            onSelectCase={handleSelectCase}
          />
        );
      case 'landscape':
        return <WorkLandscape {...viewProps} />;
      case 'actors':
        return <WorkActorFit {...viewProps} />;
      case 'adjustments':
        return <AdjustmentLog {...viewProps} />;
      case 'learnings':
        return <LearningCapture {...viewProps} />;
      case 'overview':
      default:
        return (
          <OverviewDashboard
            onNavigate={handleNavigate}
            onSelectArtefact={handleSelectArtefact}
            onCreateArtefact={handleCreateClick}
            onEditArtefact={handleEditArtefact}
            onDeleteArtefact={handleDeleteArtefact}
          />
        );
    }
  };

  // No project selected
  if (!activeProject) {
    return (
      <div className="requirements-studio">
        <div className="studio-no-project">
          <FolderOpenIcon style={{ fontSize: 64, opacity: 0.3, marginBottom: 16 }} />
          <h2>No Project Selected</h2>
          <p>Select a project from the dropdown above to start working.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="requirements-studio">
      {/* Navigator - uses same CSS as RequirementsStudio */}
      <DWDNavigator
        activeView={activeView}
        onViewChange={setActiveView}
        stats={navStats}
        onCreateClick={handleCreateClick}
        activeCase={activeCase}
      />

      {/* Main content area */}
      <div className="studio-main">
        {/* Breadcrumbs */}
        {activeView !== 'overview' && (
          <div className="studio-breadcrumbs">
            <button className="breadcrumb-item" onClick={() => setActiveView('overview')}>
              <DashboardIcon fontSize="small" />
              <span>Overview</span>
            </button>
            {currentViewInfo.group && (
              <>
                <NavigateNextIcon fontSize="small" className="breadcrumb-separator" />
                <span className="breadcrumb-group">{currentViewInfo.group}</span>
              </>
            )}
            <NavigateNextIcon fontSize="small" className="breadcrumb-separator" />
            <span className="breadcrumb-current">{currentViewInfo.name}</span>
            {activeCase && (
              <>
                <NavigateNextIcon fontSize="small" className="breadcrumb-separator" />
                <span className="breadcrumb-case" style={{ color: '#6366f1' }}>
                  <FolderIcon fontSize="small" />
                  {activeCase.name}
                </span>
              </>
            )}
          </div>
        )}

        {/* View content */}
        {renderView()}
      </div>

      {/* Create type selector modal */}
      <CreateTypeSelector
        isOpen={showTypeSelector}
        onClose={() => setShowTypeSelector(false)}
        onSelectType={handleSelectType}
        typeDefs={DWD_TYPE_DEFS}
      />

      {/* Artefact create/edit modal */}
      <DWDArtefactModal
        isOpen={showArtefactModal}
        onClose={handleCloseModal}
        artefact={modalMode === 'edit' ? editingArtefact : null}
        type={modalType}
      />

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="dwd-delete-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Artefact?</h3>
            <p>Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.</p>
            <div className="dwd-delete-confirm__actions">
              <button className="btn btn--secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={confirmDelete} disabled={saving}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className="dwd-toast dwd-toast--error">
          <WarningIcon fontSize="small" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
