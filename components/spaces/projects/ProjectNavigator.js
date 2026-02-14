/**
 * ProjectNavigator.js
 *
 * Navigation component for Project Studio.
 * Shows project lifecycle stages and navigation sections.
 */

import { useMemo, useState, useRef, useEffect } from 'react';
import { Navigator, NavGroup, NavItem } from '@/components/ui';
import {
  PROJECT_STAGES,
  PROJECT_STAGE_INFO,
} from '../../../lib/project-types';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArchiveIcon from '@mui/icons-material/Archive';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FlagIcon from '@mui/icons-material/Flag';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LinkIcon from '@mui/icons-material/Link';
import GavelIcon from '@mui/icons-material/Gavel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CampaignIcon from '@mui/icons-material/Campaign';
import SchoolIcon from '@mui/icons-material/School';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ViewListIcon from '@mui/icons-material/ViewList';

// Stage icons mapping
const STAGE_ICONS = {
  [PROJECT_STAGES.INITIATION]: PlayCircleIcon,
  [PROJECT_STAGES.PLANNING]: AssignmentIcon,
  [PROJECT_STAGES.EXECUTION]: RocketLaunchIcon,
  [PROJECT_STAGES.CLOSING]: CheckCircleIcon,
  [PROJECT_STAGES.CLOSED]: ArchiveIcon,
};

// View definitions for breadcrumbs and navigation
export const VIEW_INFO = {
  // Overview
  overview: { name: 'Overview', group: null, icon: DashboardIcon },

  // Lifecycle stages
  initiation: { name: 'Initiation', group: 'Lifecycle', icon: PlayCircleIcon },
  planning: { name: 'Planning', group: 'Lifecycle', icon: AssignmentIcon },
  execution: { name: 'Execution', group: 'Lifecycle', icon: RocketLaunchIcon },
  closing: { name: 'Closing', group: 'Lifecycle', icon: CheckCircleIcon },

  // Planning views
  wbs: { name: 'Work Breakdown', group: 'Planning', icon: AccountTreeIcon },
  schedule: { name: 'Schedule', group: 'Planning', icon: TimelineIcon },
  milestones: { name: 'Milestones', group: 'Planning', icon: FlagIcon },
  resources: { name: 'Resources', group: 'Planning', icon: PeopleIcon },
  budget: { name: 'Budget', group: 'Planning', icon: AttachMoneyIcon },

  // RAID views
  raid: { name: 'RAID Dashboard', group: 'RAID', icon: AssessmentIcon },
  risks: { name: 'Risks', group: 'RAID', icon: WarningIcon },
  assumptions: { name: 'Assumptions', group: 'RAID', icon: PsychologyIcon },
  issues: { name: 'Issues', group: 'RAID', icon: ErrorIcon },
  dependencies: { name: 'Dependencies', group: 'RAID', icon: LinkIcon },
  decisions: { name: 'Decisions', group: 'RAID', icon: GavelIcon },

  // Change Management views
  change: { name: 'Change Overview', group: 'Change', icon: SwapHorizIcon },
  impact: { name: 'Impact Assessment', group: 'Change', icon: AssessmentIcon },
  stakeholders: { name: 'Stakeholders', group: 'Change', icon: PeopleIcon },
  communications: { name: 'Communications', group: 'Change', icon: CampaignIcon },
  training: { name: 'Training', group: 'Change', icon: SchoolIcon },
  readiness: { name: 'Readiness', group: 'Change', icon: CheckCircleIcon },

  // Status & Closure views
  status: { name: 'Status Report', group: 'Status', icon: AssessmentIcon },
  lessons: { name: 'Lessons Learned', group: 'Closure', icon: LightbulbIcon },
  handover: { name: 'Handover', group: 'Closure', icon: SwapHorizIcon },
  benefits: { name: 'Benefits', group: 'Closure', icon: TrendingUpIcon },

  // Portfolio view
  portfolio: { name: 'Portfolio', group: null, icon: ViewListIcon },
};

export default function ProjectNavigator({
  activeView,
  onViewChange,
  stats = {},
  currentStage,
  onCreateClick,
  // Project selection props
  projects = [],
  activeProject,
  onSelectProject,
  onCreateProject,
}) {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProjectDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine if we have an active project
  const hasProject = !!activeProject;

  // Calculate badges for sections
  const badges = useMemo(() => ({
    risks: stats.openRisks || 0,
    issues: stats.openIssues || 0,
    assumptions: stats.activeAssumptions || 0,
    dependencies: stats.activeDependencies || 0,
    raid: stats.raidTotal || 0,
    total: stats.total || 0,
  }), [stats]);

  return (
    <Navigator>
      {/* Project selector dropdown */}
      <div className="navigator-project-selector" ref={dropdownRef}>
        <button
          className="navigator-project-btn"
          onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
        >
          <FolderIcon fontSize="small" />
          <span className="navigator-project-name">
            {activeProject?.name || 'Select Project'}
          </span>
          <ExpandMoreIcon
            fontSize="small"
            className={`navigator-project-expand ${isProjectDropdownOpen ? 'open' : ''}`}
          />
        </button>

        {isProjectDropdownOpen && (
          <div className="navigator-project-dropdown">
            <div className="navigator-project-dropdown-header">
              <span>Projects</span>
              {onCreateProject && (
                <button
                  className="navigator-project-dropdown-add"
                  onClick={() => {
                    onCreateProject();
                    setIsProjectDropdownOpen(false);
                  }}
                  title="Create new project"
                >
                  <AddIcon fontSize="small" />
                </button>
              )}
            </div>

            <div className="navigator-project-dropdown-list">
              {projects.length === 0 ? (
                <div className="navigator-project-dropdown-empty">
                  No projects yet. Create one to get started.
                </div>
              ) : (
                projects.map(project => (
                  <button
                    key={project.id}
                    className={`navigator-project-dropdown-item ${project.id === activeProject?.id ? 'active' : ''}`}
                    onClick={() => {
                      onSelectProject?.(project.id);
                      setIsProjectDropdownOpen(false);
                    }}
                  >
                    <FolderIcon fontSize="small" />
                    <span className="item-name">{project.name}</span>
                    {project.id === activeProject?.id && (
                      <CheckCircleIcon fontSize="small" className="item-check" />
                    )}
                  </button>
                ))
              )}
            </div>
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
          icon={ViewListIcon}
          label="Portfolio"
          active={activeView === 'portfolio'}
          onClick={() => onViewChange('portfolio')}
        />
      </NavGroup>

      {/* Project Lifecycle */}
      <NavGroup name="Lifecycle" defaultExpanded>
        {Object.entries(PROJECT_STAGE_INFO).map(([stageId, stage]) => {
          const StageIcon = STAGE_ICONS[stageId];
          const isCurrentStage = currentStage?.id === stageId;
          return (
            <NavItem
              key={stageId}
              icon={StageIcon}
              label={stage.name}
              active={activeView === stageId}
              onClick={() => onViewChange(stageId)}
              badge={isCurrentStage ? 'Current' : undefined}
            />
          );
        })}
      </NavGroup>

      {/* Planning */}
      <NavGroup name="Planning" defaultExpanded={false}>
        <NavItem
          icon={AccountTreeIcon}
          label="Work Breakdown"
          active={activeView === 'wbs'}
          onClick={() => onViewChange('wbs')}
        />
        <NavItem
          icon={TimelineIcon}
          label="Schedule"
          active={activeView === 'schedule'}
          onClick={() => onViewChange('schedule')}
        />
        <NavItem
          icon={FlagIcon}
          label="Milestones"
          active={activeView === 'milestones'}
          onClick={() => onViewChange('milestones')}
        />
        <NavItem
          icon={PeopleIcon}
          label="Resources"
          active={activeView === 'resources'}
          onClick={() => onViewChange('resources')}
        />
        <NavItem
          icon={AttachMoneyIcon}
          label="Budget"
          active={activeView === 'budget'}
          onClick={() => onViewChange('budget')}
        />
      </NavGroup>

      {/* RAID */}
      <NavGroup name="RAID" defaultExpanded>
        <NavItem
          icon={AssessmentIcon}
          label="RAID Dashboard"
          active={activeView === 'raid'}
          onClick={() => onViewChange('raid')}
          count={badges.raid > 0 ? badges.raid : undefined}
        />
        <NavItem
          icon={WarningIcon}
          label="Risks"
          active={activeView === 'risks'}
          onClick={() => onViewChange('risks')}
          count={badges.risks > 0 ? badges.risks : undefined}
        />
        <NavItem
          icon={PsychologyIcon}
          label="Assumptions"
          active={activeView === 'assumptions'}
          onClick={() => onViewChange('assumptions')}
          count={badges.assumptions > 0 ? badges.assumptions : undefined}
        />
        <NavItem
          icon={ErrorIcon}
          label="Issues"
          active={activeView === 'issues'}
          onClick={() => onViewChange('issues')}
          count={badges.issues > 0 ? badges.issues : undefined}
        />
        <NavItem
          icon={LinkIcon}
          label="Dependencies"
          active={activeView === 'dependencies'}
          onClick={() => onViewChange('dependencies')}
          count={badges.dependencies > 0 ? badges.dependencies : undefined}
        />
        <NavItem
          icon={GavelIcon}
          label="Decisions"
          active={activeView === 'decisions'}
          onClick={() => onViewChange('decisions')}
        />
      </NavGroup>

      {/* Change Management */}
      <NavGroup name="Change Management" defaultExpanded={false}>
        <NavItem
          icon={SwapHorizIcon}
          label="Change Overview"
          active={activeView === 'change'}
          onClick={() => onViewChange('change')}
        />
        <NavItem
          icon={AssessmentIcon}
          label="Impact Assessment"
          active={activeView === 'impact'}
          onClick={() => onViewChange('impact')}
        />
        <NavItem
          icon={PeopleIcon}
          label="Stakeholders"
          active={activeView === 'stakeholders'}
          onClick={() => onViewChange('stakeholders')}
        />
        <NavItem
          icon={CampaignIcon}
          label="Communications"
          active={activeView === 'communications'}
          onClick={() => onViewChange('communications')}
        />
        <NavItem
          icon={SchoolIcon}
          label="Training"
          active={activeView === 'training'}
          onClick={() => onViewChange('training')}
        />
        <NavItem
          icon={CheckCircleIcon}
          label="Readiness"
          active={activeView === 'readiness'}
          onClick={() => onViewChange('readiness')}
        />
      </NavGroup>

      {/* Status & Closure */}
      <NavGroup name="Status & Closure" defaultExpanded={false}>
        <NavItem
          icon={AssessmentIcon}
          label="Status Report"
          active={activeView === 'status'}
          onClick={() => onViewChange('status')}
        />
        <NavItem
          icon={LightbulbIcon}
          label="Lessons Learned"
          active={activeView === 'lessons'}
          onClick={() => onViewChange('lessons')}
        />
        <NavItem
          icon={SwapHorizIcon}
          label="Handover"
          active={activeView === 'handover'}
          onClick={() => onViewChange('handover')}
        />
        <NavItem
          icon={TrendingUpIcon}
          label="Benefits"
          active={activeView === 'benefits'}
          onClick={() => onViewChange('benefits')}
        />
      </NavGroup>
    </Navigator>
  );
}
