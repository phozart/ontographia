// components/pdw/PDWWorkspace.js
// Product Design Workspace - Uses WorkspaceLayout pattern

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from './PDWWorkspace.module.css';
import { usePDW } from './PDWContext';
import { useDomains } from '../../DomainContext';

// Shared UI components
import { WorkspaceLayout, Breadcrumb, BreadcrumbSeparator, Breadcrumbs } from '../../ui';

// View components
import OverviewDashboard from './views/OverviewDashboard';
import DiscoveryBoard from './views/DiscoveryBoard';
import IdeationBoard from './views/IdeationBoard';
import ValidationBoard from './views/ValidationBoard';
import CanvasView from './views/CanvasView';
import CanvasLibrary from './views/CanvasLibrary';
import LearningLog from './views/LearningLog';
import DecisionTrail from './views/DecisionTrail';

// Artefact components
import PDWArtefactModal from './artefacts/PDWArtefactModal';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import ScienceIcon from '@mui/icons-material/Science';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import SchoolIcon from '@mui/icons-material/School';
import GavelIcon from '@mui/icons-material/Gavel';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InsightsIcon from '@mui/icons-material/Insights';
import DesignServicesIcon from '@mui/icons-material/DesignServices';

// View groups configuration
const VIEW_GROUPS = [
  {
    id: 'discovery',
    name: 'Discovery',
    color: '#f59e0b',
    views: [
      { id: 'discovery', name: 'Discovery Board', icon: SearchIcon, color: '#f59e0b' },
    ]
  },
  {
    id: 'ideation',
    name: 'Ideation',
    color: '#8b5cf6',
    views: [
      { id: 'ideation', name: 'Ideation Board', icon: EmojiObjectsIcon, color: '#8b5cf6' },
    ]
  },
  {
    id: 'validation',
    name: 'Validation',
    color: '#10b981',
    views: [
      { id: 'validation', name: 'Experiments', icon: ScienceIcon, color: '#10b981' },
    ]
  },
  {
    id: 'frameworks',
    name: 'Frameworks & Canvases',
    color: '#3b82f6',
    views: [
      { id: 'canvas-library', name: 'Canvas Library', icon: LibraryBooksIcon, color: '#6366f1' },
      { id: 'my-canvases', name: 'My Canvases', icon: CollectionsBookmarkIcon, color: '#3b82f6' },
    ]
  },
  {
    id: 'outcomes',
    name: 'Outcomes',
    color: '#06b6d4',
    views: [
      { id: 'learning', name: 'Learning Log', icon: SchoolIcon, color: '#06b6d4' },
      { id: 'decisions', name: 'Decision Trail', icon: GavelIcon, color: '#14b8a6' },
    ]
  },
];

// View info for breadcrumbs
const VIEW_INFO = {
  'overview': { name: 'Overview', group: null },
  'discovery': { name: 'Discovery Board', group: 'Discovery' },
  'ideation': { name: 'Ideation Board', group: 'Ideation' },
  'validation': { name: 'Experiments', group: 'Validation' },
  'canvas-library': { name: 'Canvas Library', group: 'Frameworks & Canvases' },
  'my-canvases': { name: 'My Canvases', group: 'Frameworks & Canvases' },
  'learning': { name: 'Learning Log', group: 'Outcomes' },
  'decisions': { name: 'Decision Trail', group: 'Outcomes' },
};

// Navigator component - uses CSS module for consistent styling
function PDWNavigator({ activeView, onViewChange, stats, onCreateClick, collapsed, onToggleCollapse }) {
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
    discovery: stats?.discovery || 0,
    ideation: stats?.ideation || 0,
    validation: stats?.validation || 0,
    'canvas-library': 0, // Library doesn't show count - it's a creation view
    'my-canvases': stats?.canvases || 0,
    learning: stats?.learning || 0,
    decisions: stats?.decisions || 0,
  }), [stats]);

  return (
    <nav className={styles.navigator}>
      {/* Header */}
      <div className={styles.navHeader}>
        <div className={styles.navHeaderTitle}>
          <DesignServicesIcon className={styles.navHeaderIcon} />
          <span>Product Design</span>
        </div>
      </div>

      {/* Home/Overview Button */}
      <div className={styles.navHome}>
        <button
          className={`${styles.navHomeBtn} ${activeView === 'overview' ? styles.active : ''}`}
          onClick={() => onViewChange('overview')}
        >
          <DashboardIcon fontSize="small" />
          <span>Overview</span>
          {stats?.total > 0 && <span className={styles.navCount}>{stats.total}</span>}
        </button>
      </div>

      {/* Grouped Views */}
      <div className={styles.navViewsGrouped}>
        {VIEW_GROUPS.map(group => {
          const hasActiveView = group.views.some(v => v.id === activeView);
          const groupCount = group.views.reduce((sum, v) => sum + (viewCounts[v.id] || 0), 0);

          return (
            <div key={group.id} className={styles.navGroup}>
              <button
                className={`${styles.navGroupHeader} ${hasActiveView ? styles.hasActive : ''}`}
                onClick={() => toggleGroup(group.id)}
              >
                {expandedGroups[group.id] ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                <span className={styles.groupName}>{group.name}</span>
                {groupCount > 0 && <span className={styles.groupCount}>{groupCount}</span>}
              </button>
              {expandedGroups[group.id] && (
                <div className={styles.navGroupViews}>
                  {group.views.map(v => {
                    const Icon = v.icon;
                    const count = viewCounts[v.id] || 0;
                    return (
                      <button
                        key={v.id}
                        className={`${styles.navViewBtn} ${activeView === v.id ? styles.active : ''}`}
                        onClick={() => onViewChange(v.id)}
                      >
                        <Icon fontSize="small" />
                        <span>{v.name}</span>
                        {count > 0 && <span className={styles.navCount}>{count}</span>}
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
      <div className={styles.navFooter}>
        <button className={styles.navCreateBtn} onClick={onCreateClick}>
          <AddIcon fontSize="small" />
          <span>New Artefact</span>
        </button>
      </div>
    </nav>
  );
}

// Create artefact type selector modal
function CreateTypeSelector({ isOpen, onClose, onSelectType, typeDefs }) {
  if (!isOpen) return null;

  const categories = {
    discovery: { name: 'Discovery', icon: SearchIcon, color: '#f59e0b', types: ['pdw_opportunity', 'pdw_problem', 'pdw_insight'] },
    ideation: { name: 'Ideation', icon: EmojiObjectsIcon, color: '#8b5cf6', types: ['pdw_idea', 'pdw_concept', 'pdw_hypothesis'] },
    validation: { name: 'Validation', icon: ScienceIcon, color: '#10b981', types: ['pdw_experiment', 'pdw_assumption', 'pdw_learning'] },
    business: { name: 'Business', icon: InsightsIcon, color: '#3b82f6', types: ['pdw_value_proposition', 'pdw_business_model', 'pdw_decision'] },
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="pdw-type-selector" onClick={(e) => e.stopPropagation()}>
        <div className="pdw-type-selector__header">
          <h3>Create New Artefact</h3>
          <button className="pdw-type-selector__close" onClick={onClose}>×</button>
        </div>
        <div className="pdw-type-selector__content">
          {Object.entries(categories).map(([catId, category]) => {
            const Icon = category.icon;
            return (
              <div key={catId} className="pdw-type-selector__category">
                <h4 style={{ color: category.color }}>
                  <Icon fontSize="small" style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  {category.name}
                </h4>
                <div className="pdw-type-selector__types">
                  {category.types.map(typeId => {
                    const typeDef = typeDefs?.[typeId];
                    if (!typeDef) return null;
                    return (
                      <button
                        key={typeId}
                        className="pdw-type-selector__type"
                        onClick={() => onSelectType(typeId)}
                        style={{ borderColor: typeDef.color }}
                      >
                        <span className="pdw-type-selector__type-dot" style={{ backgroundColor: typeDef.color }} />
                        <span className="pdw-type-selector__type-name">{typeDef.name}</span>
                        <span className="pdw-type-selector__type-desc">{typeDef.description}</span>
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
export default function PDWWorkspace() {
  const router = useRouter();
  const { activeDomain } = useDomains();

  const {
    artefacts,
    loading,
    error,
    saving,
    activeView: contextActiveView,
    setActiveView: setContextActiveView,
    selectedId,
    setSelectedId,
    refreshData,
    createArtefact,
    updateArtefact,
    deleteArtefact,
    PDW_TYPE_DEFS,
    PDW_STAGES,
  } = usePDW();

  // Local view state for URL sync
  const [activeView, setActiveViewState] = useState('overview');
  const [urlInitialized, setUrlInitialized] = useState(false);

  // Modal state
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showArtefactModal, setShowArtefactModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [modalType, setModalType] = useState(null);
  const [editingArtefact, setEditingArtefact] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Set active view and update URL
  const setActiveView = useCallback((viewId) => {
    setActiveViewState(viewId);
    setContextActiveView(viewId);
    // Update URL with view parameter
    const url = new URL(window.location.href);
    if (viewId === 'overview') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', viewId);
    }
    router.replace(url.pathname + url.search, undefined, { shallow: true });
  }, [router, setContextActiveView]);

  // Initialize view from URL on mount
  useEffect(() => {
    if (!router.isReady || urlInitialized) return;

    const viewFromUrl = router.query.view;
    if (viewFromUrl && typeof viewFromUrl === 'string') {
      // Validate the view exists
      const isValidView = VIEW_GROUPS.some(g =>
        g.views?.some(v => v.id === viewFromUrl)
      ) || viewFromUrl === 'overview';

      if (isValidView) {
        setActiveViewState(viewFromUrl);
        setContextActiveView(viewFromUrl);
      }
    }
    setUrlInitialized(true);
  }, [router.isReady, router.query.view, urlInitialized, setContextActiveView]);

  // Calculate stats for navigator
  const navStats = useMemo(() => {
    const discoveryTypes = ['pdw_opportunity', 'pdw_problem', 'pdw_insight'];
    const ideationTypes = ['pdw_idea', 'pdw_concept', 'pdw_hypothesis'];
    const validationTypes = ['pdw_experiment', 'pdw_assumption'];
    const learningTypes = ['pdw_learning'];
    const decisionTypes = ['pdw_decision'];

    return {
      total: artefacts.length,
      discovery: artefacts.filter(a => discoveryTypes.includes(a.artefact_type)).length,
      ideation: artefacts.filter(a => ideationTypes.includes(a.artefact_type)).length,
      validation: artefacts.filter(a => validationTypes.includes(a.artefact_type)).length,
      canvases: artefacts.filter(a => a.artefact_type?.includes('canvas') || a.artefact_type?.includes('map')).length,
      learning: artefacts.filter(a => learningTypes.includes(a.artefact_type)).length,
      decisions: artefacts.filter(a => decisionTypes.includes(a.artefact_type)).length,
    };
  }, [artefacts]);

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
    // Handle type-based navigation (when user clicks on an artefact type)
    if (viewOrStage === 'type' && type) {
      // Map artefact types to views
      const typeViewMap = {
        pdw_opportunity: 'discovery',
        pdw_problem: 'discovery',
        pdw_insight: 'discovery',
        pdw_idea: 'ideation',
        pdw_concept: 'ideation',
        pdw_hypothesis: 'ideation',
        pdw_experiment: 'validation',
        pdw_assumption: 'validation',
        pdw_learning: 'learning',
        pdw_decision: 'decisions',
      };
      setActiveView(typeViewMap[type] || 'overview');
    } else if (PDW_STAGES?.[viewOrStage]) {
      // Handle stage-based navigation
      const stageViewMap = {
        discover: 'discovery',
        ideate: 'ideation',
        validate: 'validation',
        learn: 'learning',
        decide: 'decisions',
      };
      setActiveView(stageViewMap[viewOrStage] || 'overview');
    } else {
      // Direct view navigation
      setActiveView(viewOrStage);
    }
  }, [setActiveView, PDW_STAGES]);

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
      case 'discovery':
        return <DiscoveryBoard {...viewProps} />;
      case 'ideation':
        return <IdeationBoard {...viewProps} />;
      case 'validation':
        return <ValidationBoard {...viewProps} />;
      case 'canvas-library':
        return (
          <CanvasLibrary
            onCreateCanvas={handleCreateArtefact}
            onNavigateToCanvas={() => setActiveView('my-canvases')}
          />
        );
      case 'my-canvases':
        return (
          <CanvasView
            onSelectCanvas={handleSelectArtefact}
            onEditCanvas={handleEditArtefact}
            onDeleteCanvas={handleDeleteArtefact}
            onCreateCanvas={handleCreateArtefact}
          />
        );
      case 'learning':
        return (
          <LearningLog
            onSelectLearning={handleSelectArtefact}
            onEditLearning={handleEditArtefact}
            onDeleteLearning={handleDeleteArtefact}
            onCreateLearning={handleCreateArtefact}
          />
        );
      case 'decisions':
        return (
          <DecisionTrail
            onSelectDecision={handleSelectArtefact}
            onEditDecision={handleEditArtefact}
            onDeleteDecision={handleDeleteArtefact}
            onCreateDecision={handleCreateArtefact}
          />
        );
      case 'overview':
      default:
        return (
          <OverviewDashboard
            onNavigate={handleNavigate}
            onSelectArtefact={handleSelectArtefact}
            onCreateArtefact={handleCreateClick}
          />
        );
    }
  };

  // Dynamic page title
  const pageTitle = useMemo(() => {
    if (activeView === 'overview') return 'Product Design | Ontographia';
    if (currentViewInfo?.name) return `${currentViewInfo.name} - Product Design | Ontographia`;
    return 'Product Design | Ontographia';
  }, [activeView, currentViewInfo]);

  // Build breadcrumbs for current view
  const breadcrumbsContent = activeView !== 'overview' ? (
    <Breadcrumbs>
      <Breadcrumb icon={DashboardIcon} label="Overview" onClick={() => setActiveView('overview')} />
      {currentViewInfo.group && (
        <>
          <BreadcrumbSeparator />
          <Breadcrumb label={currentViewInfo.group} />
        </>
      )}
      <BreadcrumbSeparator />
      <Breadcrumb label={currentViewInfo.name} active />
    </Breadcrumbs>
  ) : null;

  // Build modals
  const modalsContent = (
    <>
      {/* Create type selector modal */}
      <CreateTypeSelector
        isOpen={showTypeSelector}
        onClose={() => setShowTypeSelector(false)}
        onSelectType={handleSelectType}
        typeDefs={PDW_TYPE_DEFS}
      />

      {/* Artefact create/edit modal */}
      <PDWArtefactModal
        isOpen={showArtefactModal}
        onClose={handleCloseModal}
        artefact={modalMode === 'edit' ? editingArtefact : null}
        type={modalType}
      />

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="pdw-delete-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Artefact?</h3>
            <p>Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.</p>
            <div className="pdw-delete-confirm__actions">
              <button className="btn btn--secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn--danger" onClick={confirmDelete} disabled={saving}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <WorkspaceLayout
        navigator={
          <PDWNavigator
            activeView={activeView}
            onViewChange={setActiveView}
            stats={navStats}
            onCreateClick={handleCreateClick}
          />
        }
        breadcrumbs={breadcrumbsContent}
        error={error}
        noProject={!activeDomain}
        noSelectionTitle="No Domain Selected"
        noSelectionMessage="Select a domain to start working."
        modals={modalsContent}
      >
        {renderView()}
      </WorkspaceLayout>
    </>
  );
}
