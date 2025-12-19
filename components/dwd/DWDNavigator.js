// components/dwd/DWDNavigator.js
// Navigation sidebar for DWD Workspace

import { useState, useMemo } from 'react';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import TuneIcon from '@mui/icons-material/Tune';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MapIcon from '@mui/icons-material/Map';
import BalanceIcon from '@mui/icons-material/Balance';
import ScienceIcon from '@mui/icons-material/Science';
import DownloadIcon from '@mui/icons-material/Download';
import SpeedIcon from '@mui/icons-material/Speed';
import TimelineIcon from '@mui/icons-material/Timeline';
import GridOnIcon from '@mui/icons-material/GridOn';

// View groups configuration (excluding action items which are shown at top)
export const VIEW_GROUPS = [
  {
    id: 'diagnose',
    name: 'Diagnose',
    color: '#f59e0b',
    views: [
      { id: 'cases', name: 'Work Situations', icon: FolderIcon, color: '#6366f1' },
      { id: 'canvas', name: 'Work Flow Canvas', icon: MapIcon, color: '#10b981' },
      { id: 'landscape', name: 'Work Landscape', icon: AssignmentIcon, color: '#3b82f6' },
      { id: 'actors', name: 'Work-Actor Fit', icon: PersonIcon, color: '#8b5cf6' },
      { id: 'fit', name: 'Fit Analysis', icon: BalanceIcon, color: '#f59e0b' },
      { id: 'timeline', name: 'Case Timeline', icon: TimelineIcon, color: '#6366f1' },
    ]
  },
  {
    id: 'design',
    name: 'Design',
    color: '#8b5cf6',
    views: [
      { id: 'adjustments', name: 'Adjustments', icon: TuneIcon, color: '#10b981' },
      { id: 'experiments', name: 'Experiments', icon: ScienceIcon, color: '#8b5cf6' },
    ]
  },
  {
    id: 'learn',
    name: 'Learn',
    color: '#10b981',
    views: [
      { id: 'learnings', name: 'Learning Capture', icon: LightbulbIcon, color: '#06b6d4' },
      { id: 'tracematrix', name: 'Trace Matrix', icon: GridOnIcon, color: '#8b5cf6' },
      { id: 'effectiveness', name: 'Effectiveness', icon: SpeedIcon, color: '#10b981' },
    ]
  },
];

// View info for breadcrumbs
export const VIEW_INFO = {
  'overview': { name: 'Overview', group: null },
  'cases': { name: 'Work Situations', group: 'Diagnose' },
  'canvas': { name: 'Work Flow Canvas', group: 'Diagnose' },
  'landscape': { name: 'Work Landscape', group: 'Diagnose' },
  'fit': { name: 'Fit Analysis', group: 'Diagnose' },
  'timeline': { name: 'Case Timeline', group: 'Diagnose' },
  'experiments': { name: 'Experiments', group: 'Design' },
  'actors': { name: 'Work-Actor Fit', group: 'Diagnose' },
  'adjustments': { name: 'Adjustments', group: 'Design' },
  'learnings': { name: 'Learning Capture', group: 'Learn' },
  'tracematrix': { name: 'Trace Matrix', group: 'Learn' },
  'effectiveness': { name: 'Effectiveness', group: 'Learn' },
};

export default function DWDNavigator({
  activeView,
  onViewChange,
  stats,
  onCreateClick,
  activeCase,
  onOpenExport,
}) {
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

      {/* Footer Buttons */}
      <div className="navigator-footer">
        <button className="nav-create-btn" onClick={onCreateClick}>
          <AddIcon fontSize="small" />
          <span>New Artefact</span>
        </button>
        <button
          className="nav-export-btn"
          onClick={onOpenExport}
          disabled={!activeCase}
          title={activeCase ? 'Export case report' : 'Select a case first'}
        >
          <DownloadIcon fontSize="small" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
}
