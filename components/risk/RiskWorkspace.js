/**
 * Risk Workspace Component
 *
 * Main workspace layout for the Risk & Resilience Studio.
 */

import { useState, useMemo } from 'react';
import { useRisk } from './RiskContext';
import RiskDashboard from './RiskDashboard';
import RiskListView from './RiskListView';
import RiskArtefactModal from './RiskArtefactModal';
import RiskGuidancePanel from './RiskGuidancePanel';

// Shared UI components
import { WorkspaceLayout, Breadcrumb, BreadcrumbSeparator, Breadcrumbs } from '../ui';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { RISK_TYPE_DEFS, RISK_GROUPS } from '../../lib/risk-types';

const GROUP_ICONS = {
  risks: WarningIcon,
  scenarios: TimelineIcon,
  resilience: ShieldIcon,
  assessments: AssessmentIcon,
};

const TYPE_ICONS = {
  risk_risk: WarningIcon,
  risk_control: SecurityIcon,
  risk_resilience: ShieldIcon,
  risk_scenario: TimelineIcon,
  risk_assessment: AssessmentIcon,
};

export default function RiskWorkspace() {
  const { artefacts, loading, error, deleteArtefact } = useRisk();
  const [view, setView] = useState('dashboard');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedArtefact, setSelectedArtefact] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [editArtefact, setEditArtefact] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(['risks', 'scenarios', 'resilience', 'assessments']);
  const [showGuidance, setShowGuidance] = useState(false);

  // Count artefacts by type
  const typeCounts = useMemo(() => {
    const counts = {};
    Object.keys(RISK_TYPE_DEFS).forEach(type => {
      counts[type] = artefacts.filter(a => a.type === type).length;
    });
    return counts;
  }, [artefacts]);

  // Toggle group expansion
  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev =>
      prev.includes(groupKey)
        ? prev.filter(g => g !== groupKey)
        : [...prev, groupKey]
    );
  };

  // Handle navigation
  const handleNavigate = (type, viewType) => {
    setSelectedType(type);
    setView(viewType || 'list');
  };

  // Handle create
  const handleCreate = (type) => {
    setModalType(type || selectedType || 'risk_risk');
    setEditArtefact(null);
  };

  // Handle edit
  const handleEdit = (artefact) => {
    setModalType(artefact.type);
    setEditArtefact(artefact);
  };

  // Handle delete
  const handleDelete = async (artefact) => {
    if (window.confirm(`Delete "${artefact.name}"? This cannot be undone.`)) {
      await deleteArtefact(artefact.id);
    }
  };

  // Handle select
  const handleSelect = (artefact) => {
    setSelectedArtefact(artefact);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalType(null);
    setEditArtefact(null);
  };

  // Navigator component
  const RiskNavigator = () => (
    <nav className="navigator">
      {/* Home/Dashboard button */}
      <div className="nav-home">
        <button
          className={`nav-home-btn ${view === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setView('dashboard'); setSelectedType(null); }}
        >
          <DashboardIcon fontSize="small" />
          <span>Overview</span>
        </button>
      </div>

      {/* Module Groups */}
      <div className="nav-views-grouped">
        {Object.entries(RISK_GROUPS).map(([groupKey, group]) => {
          const GroupIcon = GROUP_ICONS[groupKey] || WarningIcon;
          const isExpanded = expandedGroups.includes(groupKey);
          const groupCount = group.types.reduce((sum, type) => sum + (typeCounts[type] || 0), 0);
          const hasActive = group.types.includes(selectedType);

          return (
            <div key={groupKey} className="nav-group">
              <button
                className={`nav-group-header ${hasActive ? 'has-active' : ''}`}
                onClick={() => toggleGroup(groupKey)}
                style={{ borderLeftColor: hasActive ? group.color : 'transparent' }}
              >
                {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                <span className="group-name">{group.label}</span>
                <span className="group-count">{groupCount}</span>
              </button>

              {isExpanded && (
                <div className="nav-group-views">
                  {group.types.map(type => {
                    const typeDef = RISK_TYPE_DEFS[type];
                    const TypeIcon = TYPE_ICONS[type] || WarningIcon;
                    const isActive = selectedType === type && view === 'list';

                    return (
                      <button
                        key={type}
                        className={`nav-view-btn ${isActive ? 'active' : ''}`}
                        onClick={() => handleNavigate(type, 'list')}
                      >
                        <TypeIcon fontSize="small" style={{ color: typeDef?.color }} />
                        <span>{typeDef?.label}</span>
                        <span className="view-count">{typeCounts[type] || 0}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer with Create Button */}
      <div className="nav-footer">
        <button className="nav-create-btn" onClick={() => handleCreate()}>
          <AddIcon fontSize="small" />
          <span>New Artefact</span>
        </button>
      </div>
    </nav>
  );

  // Build breadcrumbs
  const breadcrumbsContent = view !== 'dashboard' ? (
    <Breadcrumbs>
      <Breadcrumb
        icon={DashboardIcon}
        label="Overview"
        onClick={() => { setView('dashboard'); setSelectedType(null); }}
      />
      {selectedType && (
        <>
          <BreadcrumbSeparator />
          <Breadcrumb label={RISK_TYPE_DEFS[selectedType]?.label || 'Artefacts'} active />
        </>
      )}
    </Breadcrumbs>
  ) : null;

  // Render main content
  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading Risk & Resilience Studio...</p>
        </div>
      );
    }

    return (
      <div className="studio-content">
        <div className="studio-content__main">
          {view === 'dashboard' && (
            <RiskDashboard
              onNavigate={handleNavigate}
              onCreateArtefact={handleCreate}
            />
          )}

          {view === 'list' && selectedType && (
            <RiskListView
              type={selectedType}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreate}
            />
          )}
        </div>

        {/* Guidance Panel Toggle */}
        <button
          className={`guidance-toggle ${showGuidance ? 'active' : ''}`}
          onClick={() => setShowGuidance(!showGuidance)}
          title="Toggle guidance panel"
        >
          <HelpOutlineIcon fontSize="small" />
        </button>

        {/* Guidance Sidebar */}
        {showGuidance && (
          <aside className="studio-content__guidance">
            <RiskGuidancePanel type={selectedType} view={view} />
          </aside>
        )}

        <style jsx>{`
          .studio-content {
            flex: 1;
            display: flex;
            overflow: hidden;
            position: relative;
          }

          .studio-content__main {
            flex: 1;
            overflow-y: auto;
          }

          .guidance-toggle {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--panel);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text-muted);
            cursor: pointer;
            z-index: 10;
            transition: background 0.2s, color 0.2s;
          }

          .guidance-toggle:hover,
          .guidance-toggle.active {
            background: var(--accent-soft);
            color: var(--accent);
            border-color: var(--accent);
          }

          .studio-content__guidance {
            width: 300px;
            background: var(--panel);
            border-left: 1px solid var(--border);
            overflow-y: auto;
            flex-shrink: 0;
          }

          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
            color: var(--text-muted);
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border);
            border-top-color: var(--accent);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  };

  // Modal content
  const modalsContent = modalType ? (
    <RiskArtefactModal
      type={modalType}
      artefact={editArtefact}
      onClose={handleCloseModal}
      onSave={handleCloseModal}
    />
  ) : null;

  return (
    <WorkspaceLayout
      navigator={<RiskNavigator />}
      breadcrumbs={breadcrumbsContent}
      error={error}
      modals={modalsContent}
    >
      {renderMainContent()}
    </WorkspaceLayout>
  );
}
