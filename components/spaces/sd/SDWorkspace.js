/**
 * SDWorkspace - System Dynamics Workspace
 *
 * Main workspace component for System Dynamics modeling and simulation.
 * Wraps the SystemDynamicsWorkspace in the shared WorkspaceLayout.
 */

import { useState, useCallback } from 'react';
import { useProjects } from '../../ProjectContext';
import { WorkspaceLayout, Breadcrumb, BreadcrumbSeparator, Breadcrumbs } from '@/components/ui';

// MUI Icons
import LoopIcon from '@mui/icons-material/Loop';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ScienceIcon from '@mui/icons-material/Science';
import SettingsIcon from '@mui/icons-material/Settings';

// Import the full SystemDynamicsWorkspace content
import SystemDynamicsStudio from './SystemDynamicsWorkspace';

// ============ NAVIGATION STRUCTURE ============

// Design system colors from DESIGN-SYSTEM.md
const NAV_GROUPS = [
  {
    id: 'modeling',
    name: 'Modeling',
    color: '#47453F', // graphite accent
    views: [
      { id: 'canvas', name: 'Model Canvas', icon: EditIcon },
      { id: 'cld', name: 'Causal Loops (CLD)', icon: LoopIcon },
      { id: 'stock-flow', name: 'Stock & Flow', icon: AccountTreeIcon },
    ],
  },
  {
    id: 'analysis',
    name: 'Analysis',
    color: '#5B8A6A', // success semantic
    views: [
      { id: 'loops', name: 'Loop Analysis', icon: LoopIcon },
      { id: 'simulation', name: 'Simulation', icon: ScienceIcon },
      { id: 'scenarios', name: 'Scenarios', icon: TimelineIcon },
    ],
  },
  {
    id: 'learning',
    name: 'Learning',
    color: '#6B7A8F', // info semantic
    views: [
      { id: 'learn', name: 'Learning Center', icon: SchoolIcon },
      { id: 'examples', name: 'Examples Library', icon: LibraryBooksIcon },
      { id: 'framework', name: 'Thinking Framework', icon: PsychologyIcon },
    ],
  },
];

// ============ NAVIGATOR COMPONENT ============

function SDNavigator({ activeView, onViewChange, diagramMode, onModeChange }) {
  const [expandedGroups, setExpandedGroups] = useState({ modeling: true });

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <nav className="sd-navigator">
      {/* Header */}
      <div className="nav-header">
        <div className="nav-header-title">
          <LoopIcon className="nav-header-icon" />
          <span>System Dynamics</span>
        </div>
      </div>

      {/* Diagram Mode Toggle */}
      <div className="nav-mode-toggle">
        <button
          className={`mode-btn ${diagramMode === 'cld' ? 'active' : ''}`}
          onClick={() => onModeChange('cld')}
          title="Causal Loop Diagram mode"
        >
          CLD
        </button>
        <button
          className={`mode-btn ${diagramMode === 'stockFlow' ? 'active' : ''}`}
          onClick={() => onModeChange('stockFlow')}
          title="Stock & Flow Diagram mode"
        >
          S&F
        </button>
      </div>

      {/* Home Button */}
      <div className="nav-home">
        <button
          className={`nav-home-btn ${activeView === 'canvas' ? 'active' : ''}`}
          onClick={() => onViewChange('canvas')}
        >
          <DashboardIcon fontSize="small" />
          <span>Overview</span>
        </button>
      </div>

      {/* Grouped Navigation */}
      <div className="nav-views-grouped">
        {NAV_GROUPS.map(group => (
          <div key={group.id} className="nav-group">
            <button
              className={`nav-group-header ${expandedGroups[group.id] ? 'expanded' : ''}`}
              onClick={() => toggleGroup(group.id)}
              style={{ borderLeftColor: group.color }}
            >
              <span className="chevron">{expandedGroups[group.id] ? '\u25BC' : '\u25B6'}</span>
              <span className="group-name">{group.name}</span>
              <span className="group-count">{group.views.length}</span>
            </button>
            {expandedGroups[group.id] && (
              <div className="nav-group-views">
                {group.views.map(view => {
                  const Icon = view.icon;
                  return (
                    <button
                      key={view.id}
                      className={`nav-view-btn ${activeView === view.id ? 'active' : ''}`}
                      onClick={() => onViewChange(view.id)}
                    >
                      <Icon fontSize="small" />
                      <span>{view.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="nav-footer">
        <button
          className={`nav-view-btn ${activeView === 'settings' ? 'active' : ''}`}
          onClick={() => onViewChange('settings')}
        >
          <SettingsIcon fontSize="small" />
          <span>Settings</span>
        </button>
      </div>
    </nav>
  );
}

// ============ MAIN SD WORKSPACE COMPONENT ============

export default function SDWorkspace() {
  const { activeProject } = useProjects();
  const [activeView, setActiveView] = useState('canvas');
  const [diagramMode, setDiagramMode] = useState('cld');
  const [error, setError] = useState(null);

  // Handle view navigation
  const handleViewChange = useCallback((view) => {
    setActiveView(view);
  }, []);

  // Handle diagram mode change
  const handleModeChange = useCallback((mode) => {
    setDiagramMode(mode);
  }, []);

  // Get view info for breadcrumbs
  const getViewInfo = () => {
    if (activeView === 'canvas') return { name: 'Model Canvas', group: null };
    for (const group of NAV_GROUPS) {
      const view = group.views.find(v => v.id === activeView);
      if (view) return { name: view.name, group: group.name };
    }
    return { name: activeView, group: null };
  };

  const viewInfo = getViewInfo();

  // Build breadcrumbs
  const breadcrumbsContent = activeView !== 'canvas' ? (
    <Breadcrumbs>
      <Breadcrumb
        icon={DashboardIcon}
        label="Canvas"
        onClick={() => setActiveView('canvas')}
      />
      {viewInfo.group && (
        <>
          <BreadcrumbSeparator />
          <Breadcrumb label={viewInfo.group} />
        </>
      )}
      <BreadcrumbSeparator />
      <Breadcrumb label={viewInfo.name} active />
    </Breadcrumbs>
  ) : null;

  // The main canvas view uses the full SystemDynamicsStudio
  // Other views can be simpler or redirect to specific features
  const renderContent = () => {
    switch (activeView) {
      case 'canvas':
      case 'cld':
      case 'stock-flow':
        // The full studio handles all modeling views internally
        return <SystemDynamicsStudio />;

      case 'loops':
        return (
          <div className="sd-view-placeholder">
            <h2>Loop Analysis</h2>
            <p>Open the Canvas view to use the Loop Inspector tool.</p>
          </div>
        );

      case 'simulation':
        return (
          <div className="sd-view-placeholder">
            <h2>Simulation</h2>
            <p>Open the Canvas view to configure and run simulations.</p>
          </div>
        );

      case 'scenarios':
        return (
          <div className="sd-view-placeholder">
            <h2>Scenarios</h2>
            <p>Open the Canvas view to manage scenarios and versions.</p>
          </div>
        );

      case 'learn':
        return (
          <div className="sd-view-placeholder">
            <h2>Learning Center</h2>
            <p>Systems Thinking education and tutorials.</p>
          </div>
        );

      case 'examples':
        return (
          <div className="sd-view-placeholder">
            <h2>Examples Library</h2>
            <p>Browse worked examples of system dynamics models.</p>
          </div>
        );

      case 'framework':
        return (
          <div className="sd-view-placeholder">
            <h2>Thinking Framework</h2>
            <p>Mental models and systems thinking reference.</p>
          </div>
        );

      case 'settings':
        return (
          <div className="sd-view-placeholder">
            <h2>Settings</h2>
            <p>Configure System Dynamics workspace preferences.</p>
          </div>
        );

      default:
        return <SystemDynamicsStudio />;
    }
  };

  // For the canvas view, we want the full studio to take over the entire space
  // For other views, we use the standard WorkspaceLayout
  if (activeView === 'canvas' || activeView === 'cld' || activeView === 'stock-flow') {
    // Render the full studio without the navigator wrapper
    // The studio has its own header and toolbox
    return <SystemDynamicsStudio />;
  }

  return (
    <WorkspaceLayout
      navigator={
        <SDNavigator
          activeView={activeView}
          onViewChange={handleViewChange}
          diagramMode={diagramMode}
          onModeChange={handleModeChange}
        />
      }
      breadcrumbs={breadcrumbsContent}
      error={error}
      noProject={!activeProject}
      noSelectionTitle="No Project Selected"
      noSelectionMessage="Please select a project to access System Dynamics Studio."
    >
      {renderContent()}
    </WorkspaceLayout>
  );
}

// Also export the raw studio for direct use
export { default as SystemDynamicsStudio } from './SystemDynamicsWorkspace';
