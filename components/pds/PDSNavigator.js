// components/pds/PDSNavigator.js
// Project Design Workspace Navigator - Sidebar navigation component

import { useMemo } from 'react';
import { Navigator, NavGroup, NavItem } from '../ui';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import FlagIcon from '@mui/icons-material/Flag';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import WarningIcon from '@mui/icons-material/Warning';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SchoolIcon from '@mui/icons-material/School';
import TimelineIcon from '@mui/icons-material/Timeline';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BugReportIcon from '@mui/icons-material/BugReport';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import AssessmentIcon from '@mui/icons-material/Assessment';

// View info for breadcrumbs and navigation
export const VIEW_INFO = {
  overview: { name: 'Overview', group: null, icon: DashboardIcon },
  intent: { name: 'Intent & Governance', group: 'Spaces', icon: FlagIcon },
  structure: { name: 'Structure & Planning', group: 'Spaces', icon: AccountTreeIcon },
  risk: { name: 'Risk & Uncertainty', group: 'Spaces', icon: WarningIcon },
  execution: { name: 'Execution & Control', group: 'Spaces', icon: PlayCircleIcon },
  learning: { name: 'Learning & Evolution', group: 'Spaces', icon: SchoolIcon },
  timeline: { name: 'Project Timeline', group: 'Views', icon: TimelineIcon },
  stakeholders: { name: 'Stakeholder Matrix', group: 'Tools', icon: PeopleIcon },
  risks: { name: 'Risk Heat Map', group: 'Tools', icon: WarningIcon },
  dependencies: { name: 'Dependency Graph', group: 'Tools', icon: AccountTreeIcon },
  wbs: { name: 'Work Breakdown', group: 'Tools', icon: AssignmentIcon },
  assumptions: { name: 'Assumption Board', group: 'Tools', icon: LightbulbIcon },
  raid: { name: 'RAID Log', group: 'Tools', icon: BugReportIcon },
  progress: { name: 'Progress Dashboard', group: 'Tools', icon: AssessmentIcon },
  changes: { name: 'Change Log', group: 'Tools', icon: ChangeCircleIcon },
  lessons: { name: 'Lessons Library', group: 'Tools', icon: SchoolIcon },
};

export default function PDSNavigator({
  activeView,
  onViewChange,
  stats = {},
  onCreateClick,
  onToolsClick,
  activePdsProject,
  onOpenExport,
}) {
  // Calculate badge counts for each section
  const badges = useMemo(() => ({
    stakeholders: stats.stakeholders || 0,
    deliverables: stats.deliverables || 0,
    milestones: stats.milestones || 0,
    risks: stats.risks || 0,
    issues: stats.issues || 0,
    assumptions: stats.assumptions || 0,
    changes: stats.changes || 0,
    lessons: stats.lessons || 0,
    total: stats.total || 0,
  }), [stats]);

  // Determine if we have an active project
  const hasProject = !!activePdsProject;

  return (
    <Navigator>
      {/* Project selector */}
      <div className="navigator-project-selector">
        {activePdsProject ? (
          <div className="navigator-project-active">
            <AssignmentIcon fontSize="small" />
            <span className="navigator-project-name">{activePdsProject.name || activePdsProject.title}</span>
          </div>
        ) : (
          <div className="navigator-project-empty">
            <span>No project selected</span>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="navigator-actions">
        <button
          className="navigator-action-btn navigator-action-btn--primary"
          onClick={onCreateClick}
          disabled={!hasProject}
          title={hasProject ? 'Create new artefact' : 'Select a project first'}
        >
          <AddIcon fontSize="small" />
          <span>Create</span>
        </button>
        <button
          className="navigator-action-btn"
          onClick={onToolsClick}
          disabled={!hasProject}
          title="Open tools palette"
        >
          <BuildIcon fontSize="small" />
          <span>Tools</span>
        </button>
      </div>

      {/* Overview */}
      <NavGroup name="Dashboard">
        <NavItem
          icon={DashboardIcon}
          label="Overview"
          active={activeView === 'overview'}
          onClick={() => onViewChange('overview')}
          count={badges.total > 0 ? badges.total : undefined}
        />
        <NavItem
          icon={TimelineIcon}
          label="Timeline"
          active={activeView === 'timeline'}
          onClick={() => onViewChange('timeline')}
        />
      </NavGroup>

      {/* 5 Core Spaces */}
      <NavGroup name="Spaces" defaultExpanded>
        <NavItem
          icon={FlagIcon}
          label="Intent & Governance"
          active={activeView === 'intent'}
          onClick={() => onViewChange('intent')}
          count={badges.stakeholders > 0 ? badges.stakeholders : undefined}
        />
        <NavItem
          icon={AccountTreeIcon}
          label="Structure & Planning"
          active={activeView === 'structure'}
          onClick={() => onViewChange('structure')}
          count={badges.deliverables > 0 ? badges.deliverables : undefined}
        />
        <NavItem
          icon={WarningIcon}
          label="Risk & Uncertainty"
          active={activeView === 'risk'}
          onClick={() => onViewChange('risk')}
          count={badges.risks > 0 ? badges.risks : undefined}
        />
        <NavItem
          icon={PlayCircleIcon}
          label="Execution & Control"
          active={activeView === 'execution'}
          onClick={() => onViewChange('execution')}
          count={badges.issues > 0 ? badges.issues : undefined}
        />
        <NavItem
          icon={SchoolIcon}
          label="Learning & Evolution"
          active={activeView === 'learning'}
          onClick={() => onViewChange('learning')}
          count={badges.lessons > 0 ? badges.lessons : undefined}
        />
      </NavGroup>

      {/* Visual Tools */}
      <NavGroup name="Tools" defaultExpanded={false}>
        <NavItem
          icon={PeopleIcon}
          label="Stakeholder Matrix"
          active={activeView === 'stakeholders'}
          onClick={() => onViewChange('stakeholders')}
        />
        <NavItem
          icon={WarningIcon}
          label="Risk Heat Map"
          active={activeView === 'risks'}
          onClick={() => onViewChange('risks')}
        />
        <NavItem
          icon={AccountTreeIcon}
          label="Dependencies"
          active={activeView === 'dependencies'}
          onClick={() => onViewChange('dependencies')}
        />
        <NavItem
          icon={AssignmentIcon}
          label="WBS Tree"
          active={activeView === 'wbs'}
          onClick={() => onViewChange('wbs')}
        />
        <NavItem
          icon={LightbulbIcon}
          label="Assumptions"
          active={activeView === 'assumptions'}
          onClick={() => onViewChange('assumptions')}
        />
        <NavItem
          icon={BugReportIcon}
          label="RAID Log"
          active={activeView === 'raid'}
          onClick={() => onViewChange('raid')}
        />
        <NavItem
          icon={AssessmentIcon}
          label="Progress"
          active={activeView === 'progress'}
          onClick={() => onViewChange('progress')}
        />
        <NavItem
          icon={SchoolIcon}
          label="Lessons Library"
          active={activeView === 'lessons'}
          onClick={() => onViewChange('lessons')}
        />
      </NavGroup>

      {/* Export */}
      {hasProject && onOpenExport && (
        <div className="navigator-footer">
          <button
            className="navigator-export-btn"
            onClick={onOpenExport}
            title="Generate project report"
          >
            <AssessmentIcon fontSize="small" />
            <span>Export Report</span>
          </button>
        </div>
      )}
    </Navigator>
  );
}
