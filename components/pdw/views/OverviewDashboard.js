// components/pdw/views/OverviewDashboard.js
// Overview dashboard showing stage progress, stats, and recent activity

import { useMemo } from 'react';
import { usePDW } from '../PDWContext';

// MUI Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import CategoryIcon from '@mui/icons-material/Category';
import ScienceIcon from '@mui/icons-material/Science';
import BiotechIcon from '@mui/icons-material/Biotech';
import WarningIcon from '@mui/icons-material/Warning';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import GavelIcon from '@mui/icons-material/Gavel';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AddIcon from '@mui/icons-material/Add';

// Icon mapping for types
const TYPE_ICONS = {
  pdw_opportunity: TrendingUpIcon,
  pdw_problem: ReportProblemIcon,
  pdw_insight: LightbulbIcon,
  pdw_idea: EmojiObjectsIcon,
  pdw_concept: CategoryIcon,
  pdw_hypothesis: ScienceIcon,
  pdw_experiment: BiotechIcon,
  pdw_assumption: WarningIcon,
  pdw_learning: SchoolIcon,
  pdw_value_proposition: VerifiedIcon,
  pdw_business_model: BusinessCenterIcon,
  pdw_decision: GavelIcon,
};

// Stage progress component
function StageProgress({ stage, health, onNavigate }) {
  const statusColors = {
    empty: '#94a3b8',
    started: '#f59e0b',
    partial: '#3b82f6',
    progressing: '#22c55e',
    complete: '#10b981',
  };

  const percentage = Math.round(health.score * 100);

  return (
    <div
      className="pdw-dashboard__stage"
      onClick={() => onNavigate(stage.id)}
    >
      <div className="pdw-dashboard__stage-header">
        <span
          className="pdw-dashboard__stage-indicator"
          style={{ backgroundColor: stage.color }}
        />
        <h4>{stage.name}</h4>
        <span className="pdw-dashboard__stage-count">
          {health.total || 0} items
        </span>
      </div>
      <p className="pdw-dashboard__stage-desc">{stage.description}</p>
      <div className="pdw-dashboard__stage-progress">
        <div className="pdw-dashboard__progress-bar">
          <div
            className="pdw-dashboard__progress-fill"
            style={{
              width: `${percentage}%`,
              backgroundColor: statusColors[health.status] || stage.color
            }}
          />
        </div>
        <span className="pdw-dashboard__progress-text">
          {health.validated || 0}/{health.total || 0} validated
        </span>
      </div>
    </div>
  );
}

// Type count card
function TypeCountCard({ type, typeDef, count, onNavigate }) {
  const Icon = TYPE_ICONS[type] || CategoryIcon;

  return (
    <div
      className="pdw-dashboard__type-card"
      onClick={() => onNavigate(type)}
      style={{ borderLeftColor: typeDef?.color || '#64748b' }}
    >
      <Icon
        className="pdw-dashboard__type-icon"
        style={{ color: typeDef?.color || '#64748b' }}
      />
      <div className="pdw-dashboard__type-info">
        <span className="pdw-dashboard__type-count">{count}</span>
        <span className="pdw-dashboard__type-name">{typeDef?.name || type}</span>
      </div>
    </div>
  );
}

// Recent activity item
function ActivityItem({ artefact, typeDef, onClick }) {
  const Icon = TYPE_ICONS[artefact.artefact_type] || CategoryIcon;
  const timeAgo = getTimeAgo(artefact.updated_at);

  return (
    <div className="pdw-dashboard__activity-item" onClick={() => onClick(artefact)}>
      <Icon
        className="pdw-dashboard__activity-icon"
        style={{ color: typeDef?.color || '#64748b' }}
        fontSize="small"
      />
      <div className="pdw-dashboard__activity-content">
        <span className="pdw-dashboard__activity-name">{artefact.name}</span>
        <span className="pdw-dashboard__activity-meta">
          {typeDef?.name} • {timeAgo}
        </span>
      </div>
    </div>
  );
}

// Stats card
function StatsCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="pdw-dashboard__stats-card">
      <div className="pdw-dashboard__stats-icon" style={{ backgroundColor: `${color}20` }}>
        <Icon style={{ color }} />
      </div>
      <div className="pdw-dashboard__stats-content">
        <span className="pdw-dashboard__stats-value">{value}</span>
        <span className="pdw-dashboard__stats-title">{title}</span>
        {subtitle && <span className="pdw-dashboard__stats-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}

// Helper to get time ago string
function getTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function OverviewDashboard({ onNavigate, onSelectArtefact, onCreateArtefact }) {
  const {
    artefacts,
    stats,
    loading,
    getStageHealth,
    getTypeDefinition,
    PDW_STAGES,
    PDW_TYPE_DEFS,
    getArtefactsByStatus,
  } = usePDW();

  // Calculate stats
  const dashboardStats = useMemo(() => {
    const total = artefacts.length;
    const validated = artefacts.filter(a =>
      a.custom_fields?.pdw_status === 'validated'
    ).length;
    const inProgress = artefacts.filter(a =>
      a.custom_fields?.pdw_status === 'in_progress'
    ).length;
    const drafts = artefacts.filter(a =>
      a.custom_fields?.pdw_status === 'draft' || !a.custom_fields?.pdw_status
    ).length;

    // Experiments
    const experiments = artefacts.filter(a => a.artefact_type === 'pdw_experiment');
    const experimentResults = {
      validated: experiments.filter(e => e.custom_fields?.outcome === 'Validated').length,
      invalidated: experiments.filter(e => e.custom_fields?.outcome === 'Invalidated').length,
      running: experiments.filter(e => e.custom_fields?.outcome === 'Running').length,
    };

    // High risk assumptions
    const highRiskAssumptions = artefacts.filter(a =>
      a.artefact_type === 'pdw_assumption' &&
      a.custom_fields?.risk_level === 'High' &&
      a.custom_fields?.validation_status !== 'Validated'
    ).length;

    return {
      total,
      validated,
      inProgress,
      drafts,
      experimentResults,
      highRiskAssumptions,
    };
  }, [artefacts]);

  // Get stage health
  const stageHealthMap = useMemo(() => {
    const health = {};
    Object.keys(PDW_STAGES).forEach(stageId => {
      health[stageId] = getStageHealth(stageId);
    });
    return health;
  }, [PDW_STAGES, getStageHealth]);

  // Get type counts
  const typeCounts = useMemo(() => {
    const counts = {};
    Object.keys(PDW_TYPE_DEFS).forEach(type => {
      counts[type] = artefacts.filter(a => a.artefact_type === type).length;
    });
    return counts;
  }, [artefacts, PDW_TYPE_DEFS]);

  // Get recent activity
  const recentArtefacts = useMemo(() => {
    return [...artefacts]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 8);
  }, [artefacts]);

  // Get canvases
  const canvasCount = useMemo(() => {
    return artefacts.filter(a => a.artefact_type.includes('canvas') ||
      ['pdw_empathy_map', 'pdw_customer_journey', 'pdw_persona', 'pdw_lean_canvas', 'pdw_bmc_canvas', 'pdw_vp_canvas', 'pdw_swot'].includes(a.artefact_type)
    ).length;
  }, [artefacts]);

  if (loading) {
    return (
      <div className="pdw-dashboard pdw-dashboard--loading">
        <div className="pdw-loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="pdw-dashboard">
      {/* Header */}
      <div className="pdw-dashboard__header">
        <div>
          <h2>Product Discovery Overview</h2>
          <p>Track your product discovery and validation progress</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => onCreateArtefact && onCreateArtefact()}
        >
          <AddIcon fontSize="small" />
          New Artefact
        </button>
      </div>

      {/* Top Stats */}
      <div className="pdw-dashboard__stats-grid">
        <StatsCard
          title="Total Artefacts"
          value={dashboardStats.total}
          icon={ViewModuleIcon}
          color="#3b82f6"
        />
        <StatsCard
          title="Validated"
          value={dashboardStats.validated}
          icon={CheckCircleIcon}
          color="#22c55e"
          subtitle={dashboardStats.total > 0 ?
            `${Math.round((dashboardStats.validated / dashboardStats.total) * 100)}%` : '0%'}
        />
        <StatsCard
          title="In Progress"
          value={dashboardStats.inProgress}
          icon={PlayCircleIcon}
          color="#f59e0b"
        />
        <StatsCard
          title="High Risk Assumptions"
          value={dashboardStats.highRiskAssumptions}
          icon={WarningIcon}
          color="#ef4444"
          subtitle="Need validation"
        />
      </div>

      {/* Stage Progress */}
      <div className="pdw-dashboard__section">
        <h3>Discovery Stages</h3>
        <div className="pdw-dashboard__stages-grid">
          {Object.values(PDW_STAGES).map(stage => (
            <StageProgress
              key={stage.id}
              stage={stage}
              health={stageHealthMap[stage.id]}
              onNavigate={(stageId) => onNavigate && onNavigate(stageId)}
            />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="pdw-dashboard__main-grid">
        {/* Artefact Types */}
        <div className="pdw-dashboard__section">
          <h3>Artefacts by Type</h3>
          <div className="pdw-dashboard__types-grid">
            {Object.entries(PDW_TYPE_DEFS).map(([type, typeDef]) => (
              <TypeCountCard
                key={type}
                type={type}
                typeDef={typeDef}
                count={typeCounts[type] || 0}
                onNavigate={(t) => onNavigate && onNavigate('type', t)}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="pdw-dashboard__section">
          <h3>Recent Activity</h3>
          <div className="pdw-dashboard__activity-list">
            {recentArtefacts.length === 0 ? (
              <div className="pdw-dashboard__empty">
                <p>No artefacts yet. Start by creating your first one!</p>
                <button
                  className="btn btn--secondary"
                  onClick={() => onCreateArtefact && onCreateArtefact()}
                >
                  <AddIcon fontSize="small" />
                  Create Artefact
                </button>
              </div>
            ) : (
              recentArtefacts.map(artefact => (
                <ActivityItem
                  key={artefact.id}
                  artefact={artefact}
                  typeDef={getTypeDefinition(artefact.artefact_type)}
                  onClick={(a) => onSelectArtefact && onSelectArtefact(a)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Experiment Results */}
      {dashboardStats.experimentResults && (
        <div className="pdw-dashboard__section pdw-dashboard__section--experiments">
          <h3>Experiment Results</h3>
          <div className="pdw-dashboard__experiment-stats">
            <div className="pdw-dashboard__experiment-stat pdw-dashboard__experiment-stat--validated">
              <CheckCircleIcon />
              <span className="value">{dashboardStats.experimentResults.validated}</span>
              <span className="label">Validated</span>
            </div>
            <div className="pdw-dashboard__experiment-stat pdw-dashboard__experiment-stat--invalidated">
              <ReportProblemIcon />
              <span className="value">{dashboardStats.experimentResults.invalidated}</span>
              <span className="label">Invalidated</span>
            </div>
            <div className="pdw-dashboard__experiment-stat pdw-dashboard__experiment-stat--running">
              <PlayCircleIcon />
              <span className="value">{dashboardStats.experimentResults.running}</span>
              <span className="label">Running</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="pdw-dashboard__section pdw-dashboard__section--actions">
        <h3>Quick Actions</h3>
        <div className="pdw-dashboard__quick-actions">
          <button
            className="pdw-dashboard__action-btn"
            onClick={() => onCreateArtefact && onCreateArtefact('pdw_opportunity')}
          >
            <TrendingUpIcon style={{ color: '#8b5cf6' }} />
            <span>New Opportunity</span>
          </button>
          <button
            className="pdw-dashboard__action-btn"
            onClick={() => onCreateArtefact && onCreateArtefact('pdw_problem')}
          >
            <ReportProblemIcon style={{ color: '#ef4444' }} />
            <span>New Problem</span>
          </button>
          <button
            className="pdw-dashboard__action-btn"
            onClick={() => onCreateArtefact && onCreateArtefact('pdw_hypothesis')}
          >
            <ScienceIcon style={{ color: '#f59e0b' }} />
            <span>New Hypothesis</span>
          </button>
          <button
            className="pdw-dashboard__action-btn"
            onClick={() => onCreateArtefact && onCreateArtefact('pdw_experiment')}
          >
            <BiotechIcon style={{ color: '#10b981' }} />
            <span>New Experiment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
