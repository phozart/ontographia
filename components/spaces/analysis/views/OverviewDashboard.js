// components/spaces/analysis/views/OverviewDashboard.js
// Analysis Project Overview Dashboard - Summary view with navigation to modules

import { useMemo } from 'react';
import { useAnalysis, ANALYSIS_MODULES, ANALYSIS_ARTEFACT_TYPES, ANALYSIS_STATUS } from '../AnalysisContext';

// MUI Icons
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import PaletteIcon from '@mui/icons-material/Palette';
import GroupIcon from '@mui/icons-material/Group';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TimelineIcon from '@mui/icons-material/Timeline';

// Module icons
const MODULE_ICONS = {
  requirements: AssignmentIcon,
  stories: DescriptionIcon,
  architecture: ArchitectureIcon,
  design: PaletteIcon,
  stakeholders: GroupIcon,
  traceability: AccountTreeIcon
};

// ============ STAT CARD ============
function StatCard({ title, value, subtitle, icon: Icon, color, onClick }) {
  return (
    <div className="stat-card" onClick={onClick} style={{ '--stat-color': color }}>
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <Icon style={{ color: 'white' }} />
      </div>
      <div className="stat-content">
        <span className="stat-value">{value}</span>
        <span className="stat-title">{title}</span>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}

// ============ MODULE CARD ============
function ModuleCard({ moduleId, module, artefactCount, onClick }) {
  const Icon = MODULE_ICONS[moduleId] || AssignmentIcon;

  return (
    <div className="module-card" onClick={() => onClick(moduleId)}>
      <div className="module-card-header">
        <span className="module-icon" style={{ backgroundColor: module.color }}>
          <Icon style={{ color: 'white', fontSize: 20 }} />
        </span>
        <h3>{module.name}</h3>
      </div>

      <p className="module-description">{module.description}</p>

      <div className="module-card-footer">
        <span className="module-count">{artefactCount} artefacts</span>
        <ArrowForwardIcon fontSize="small" />
      </div>
    </div>
  );
}

// ============ COMPLETENESS RING ============
function CompletenessRing({ score }) {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="completeness-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="var(--border)"
          strokeWidth="10"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke={getColor()}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="completeness-value">
        <span className="score">{score}%</span>
        <span className="label">Complete</span>
      </div>
    </div>
  );
}

// ============ RECENT ACTIVITY ============
function RecentActivity({ artefacts }) {
  // Sort by updated date, take last 5
  const recent = useMemo(() => {
    return [...artefacts]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5);
  }, [artefacts]);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="recent-activity">
      <h3>Recent Activity</h3>
      {recent.length === 0 ? (
        <p className="no-activity">No recent activity</p>
      ) : (
        <ul className="activity-list">
          {recent.map(item => {
            const type = ANALYSIS_ARTEFACT_TYPES[item.artefactType];
            return (
              <li key={item.id}>
                <span className="activity-icon" style={{ backgroundColor: type?.color }}>
                  {type?.icon}
                </span>
                <div className="activity-content">
                  <span className="activity-name">{item.name}</span>
                  <span className="activity-type">{type?.name}</span>
                </div>
                <span className="activity-time">{formatDate(item.updatedAt)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ============ STATUS BREAKDOWN ============
function StatusBreakdown({ artefacts }) {
  const breakdown = useMemo(() => {
    const counts = {};
    artefacts.forEach(a => {
      const status = a.status || 'Draft';
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [artefacts]);

  return (
    <div className="status-breakdown">
      <h3>Status Breakdown</h3>
      <div className="status-bars">
        {Object.entries(ANALYSIS_STATUS).map(([status, config]) => {
          const count = breakdown[status] || 0;
          const total = artefacts.length || 1;
          const percentage = Math.round((count / total) * 100);

          return (
            <div key={status} className="status-bar-row">
              <div className="status-label">
                <span className="status-dot" style={{ backgroundColor: config.color }} />
                <span>{config.label}</span>
                <span className="status-count">{count}</span>
              </div>
              <div className="status-bar">
                <div
                  className="status-bar-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: config.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ COMPLETENESS CHECKLIST ============
function CompletenessChecklist({ rules }) {
  const failed = rules.filter(r => !r.passed);
  const passed = rules.filter(r => r.passed);

  return (
    <div className="completeness-checklist">
      <h3>Completeness Checklist</h3>

      {failed.length > 0 && (
        <div className="checklist-section">
          <h4 className="checklist-section-title warning">
            <WarningIcon fontSize="small" />
            To Do ({failed.length})
          </h4>
          <ul className="checklist-items">
            {failed.map(rule => (
              <li key={rule.id} className="checklist-item pending">
                <span className="item-checkbox" />
                <span className="item-message">{rule.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {passed.length > 0 && (
        <div className="checklist-section">
          <h4 className="checklist-section-title success">
            <CheckCircleIcon fontSize="small" />
            Completed ({passed.length})
          </h4>
          <ul className="checklist-items">
            {passed.map(rule => (
              <li key={rule.id} className="checklist-item done">
                <CheckCircleIcon fontSize="small" style={{ color: '#10b981' }} />
                <span className="item-message">{rule.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============ CROSS-STUDIO LINKS ============
function CrossStudioLinks({ project }) {
  return (
    <div className="cross-studio-links">
      <h3>
        <LinkIcon fontSize="small" />
        Cross-Studio Links
      </h3>

      <div className="link-sections">
        <div className="link-section">
          <h4>Upstream (Blueprint)</h4>
          {project?.linkedInitiatives?.length > 0 ? (
            <ul className="link-list">
              {project.linkedInitiatives.map(init => (
                <li key={init.id}>
                  <span className="link-prefix">INI-{init.number}</span>
                  <span className="link-name">{init.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-links">No linked initiatives</p>
          )}
        </div>

        <div className="link-section">
          <h4>Downstream (PDS)</h4>
          {project?.linkedProjects?.length > 0 ? (
            <ul className="link-list">
              {project.linkedProjects.map(proj => (
                <li key={proj.id}>
                  <span className="link-prefix">PDS-{proj.number}</span>
                  <span className="link-name">{proj.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-links">No linked projects</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ MAIN DASHBOARD ============
export default function OverviewDashboard({ onNavigate }) {
  const {
    activeAnalysisProject,
    artefacts,
    relationships,
    stats,
    calculateCompleteness,
    setActiveModule
  } = useAnalysis();

  const completeness = useMemo(() => calculateCompleteness(), [calculateCompleteness]);

  const handleModuleClick = (moduleId) => {
    setActiveModule(moduleId);
    if (onNavigate) onNavigate(moduleId);
  };

  if (!activeAnalysisProject) {
    return null; // Handled in parent component
  }

  return (
    <div className="overview-dashboard">
      {/* Project Header */}
      <div className="dashboard-header">
        <div className="project-info">
          <span className="project-prefix">AN-{activeAnalysisProject.number || '???'}</span>
          <h1>{activeAnalysisProject.name}</h1>
          {activeAnalysisProject.description && (
            <p>{activeAnalysisProject.description}</p>
          )}
        </div>

        <div className="project-status">
          <span
            className="status-badge"
            style={{
              backgroundColor: ANALYSIS_STATUS[activeAnalysisProject.status]?.color || '#6b7280'
            }}
          >
            {activeAnalysisProject.status || 'Draft'}
          </span>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="dashboard-stats">
        <StatCard
          title="Total Artefacts"
          value={stats.total}
          icon={AssignmentIcon}
          color="#6366f1"
        />
        <StatCard
          title="Requirements"
          value={stats.byModule.requirements || 0}
          icon={AssignmentIcon}
          color="#8b5cf6"
          onClick={() => handleModuleClick('requirements')}
        />
        <StatCard
          title="User Stories"
          value={stats.byModule.stories || 0}
          icon={DescriptionIcon}
          color="#06b6d4"
          onClick={() => handleModuleClick('stories')}
        />
        <StatCard
          title="Relationships"
          value={relationships.length}
          icon={AccountTreeIcon}
          color="#64748b"
          onClick={() => handleModuleClick('traceability')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-column">
          {/* Module Cards */}
          <div className="module-cards">
            <h2>Modules</h2>
            <div className="module-cards-grid">
              {Object.entries(ANALYSIS_MODULES).map(([moduleId, module]) => (
                <ModuleCard
                  key={moduleId}
                  moduleId={moduleId}
                  module={module}
                  artefactCount={stats.byModule[moduleId] || 0}
                  onClick={handleModuleClick}
                />
              ))}
            </div>
          </div>

          {/* Status Breakdown */}
          <StatusBreakdown artefacts={artefacts} />
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          {/* Completeness */}
          <div className="completeness-section">
            <h2>Analysis Completeness</h2>
            <div className="completeness-content">
              <CompletenessRing score={completeness.score} />
              <CompletenessChecklist rules={completeness.rules} />
            </div>
          </div>

          {/* Cross-Studio Links */}
          <CrossStudioLinks project={activeAnalysisProject} />

          {/* Recent Activity */}
          <RecentActivity artefacts={artefacts} />
        </div>
      </div>
    </div>
  );
}

export {
  StatCard,
  ModuleCard,
  CompletenessRing,
  RecentActivity,
  StatusBreakdown,
  CompletenessChecklist,
  CrossStudioLinks
};
