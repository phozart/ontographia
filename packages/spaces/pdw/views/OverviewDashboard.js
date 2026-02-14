// components/pdw/views/OverviewDashboard.js
// Overview dashboard showing stage progress, stats, and recent activity

import { useMemo, useCallback } from 'react';
import { usePDW } from '../PDWContext';

// Shared UI Components
import {
  ViewHeader,
  Card,
  SummaryBar,
  SummaryItem,
} from '../../../ui';

// MUI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExploreIcon from '@mui/icons-material/Explore';

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

// Stats card component
function StatsCard({ title, value, icon: Icon, color, subtitle, onClick }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 20,
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 12,
        border: '1px solid var(--border)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      onClick={onClick}
      onMouseEnter={(e) => onClick && (e.currentTarget.style.borderColor = color)}
      onMouseLeave={(e) => onClick && (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon style={{ color, fontSize: 24 }} />
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color, marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// Stage progress card
function StageCard({ stage, health, onNavigate }) {
  const percentage = Math.round(health.score * 100);
  const statusColors = {
    empty: '#94a3b8',
    started: '#f59e0b',
    partial: '#3b82f6',
    progressing: '#22c55e',
    complete: '#10b981',
  };

  return (
    <div
      style={{
        padding: 16,
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 12,
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${stage.color}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={() => onNavigate(stage.id)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>{stage.name}</h4>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-secondary)',
          padding: '2px 8px',
          borderRadius: 12,
        }}>
          {health.total || 0} items
        </span>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
        {stage.description}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          flex: 1,
          height: 6,
          borderRadius: 3,
          backgroundColor: 'var(--bg-secondary)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            borderRadius: 3,
            backgroundColor: statusColors[health.status] || stage.color,
            transition: 'width 0.3s ease',
          }} />
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 65, textAlign: 'right' }}>
          {health.validated || 0}/{health.total || 0} done
        </span>
      </div>
    </div>
  );
}

// Type count card for the types grid
function TypeCard({ type, typeDef, count, onNavigate }) {
  const Icon = TYPE_ICONS[type] || CategoryIcon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 8,
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${typeDef?.color || '#64748b'}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={() => onNavigate('type', type)}
    >
      <Icon style={{ color: typeDef?.color || '#64748b' }} fontSize="small" />
      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{typeDef?.name || type}</span>
      <span style={{
        marginLeft: 'auto',
        fontWeight: 700,
        fontSize: '1rem',
        color: count > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
      }}>
        {count}
      </span>
    </div>
  );
}

// Recent activity item
function ActivityItem({ artefact, typeDef, onClick }) {
  const Icon = TYPE_ICONS[artefact.artefact_type] || CategoryIcon;
  const timeAgo = getTimeAgo(artefact.updated_at);
  const status = artefact.custom_fields?.pdw_status || 'draft';

  const statusColors = {
    draft: '#64748b',
    in_progress: '#3b82f6',
    in_review: '#f59e0b',
    validated: '#22c55e',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
      onClick={() => onClick(artefact)}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: `${typeDef?.color || '#64748b'}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon style={{ color: typeDef?.color || '#64748b', fontSize: 16 }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 500,
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {artefact.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {typeDef?.name} • {timeAgo}
        </div>
      </div>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: statusColors[status] || '#64748b',
      }} />
    </div>
  );
}

// Quick action button
function QuickActionButton({ icon: Icon, label, color, onClick }) {
  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.2s ease',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.backgroundColor = `${color}10`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
      }}
    >
      <Icon style={{ color, fontSize: 18 }} />
      {label}
    </button>
  );
}

// Experiment results widget
function ExperimentResultsWidget({ results }) {
  const total = results.validated + results.invalidated + results.running;
  if (total === 0) return null;

  return (
    <div style={{
      padding: 16,
      backgroundColor: 'var(--bg-primary)',
      borderRadius: 12,
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <BiotechIcon style={{ color: '#10b981' }} />
        <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>Experiment Results</h4>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{results.validated}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Validated</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{results.invalidated}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invalidated</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{results.running}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Running</div>
        </div>
      </div>
    </div>
  );
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
      .slice(0, 6);
  }, [artefacts]);

  // Build inline stats for header
  const headerStats = useMemo(() => [
    { value: dashboardStats.total, label: 'Total', icon: ViewModuleIcon, color: '#3b82f6' },
    { value: dashboardStats.validated, label: 'Validated', icon: CheckCircleIcon, color: '#22c55e' },
    { value: dashboardStats.inProgress, label: 'In Progress', icon: PlayCircleIcon, color: '#f59e0b' },
  ], [dashboardStats]);

  const handleNavigate = useCallback((target, param) => {
    if (onNavigate) onNavigate(target, param);
  }, [onNavigate]);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <ViewHeader
        icon={DashboardIcon}
        iconColor="#6366f1"
        title="Product Discovery"
        stats={dashboardStats.total > 0 ? headerStats : undefined}
        createLabel="New Artefact"
        onCreate={() => onCreateArtefact && onCreateArtefact()}
      />

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 16px' }}>
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
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
              `${Math.round((dashboardStats.validated / dashboardStats.total) * 100)}% complete` : undefined}
          />
          <StatsCard
            title="In Progress"
            value={dashboardStats.inProgress}
            icon={PlayCircleIcon}
            color="#f59e0b"
          />
          <StatsCard
            title="High Risk"
            value={dashboardStats.highRiskAssumptions}
            icon={WarningIcon}
            color="#ef4444"
            subtitle={dashboardStats.highRiskAssumptions > 0 ? 'Need validation' : undefined}
          />
        </div>

        {/* Discovery Stages */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 600 }}>Discovery Stages</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 12,
          }}>
            {Object.values(PDW_STAGES).map(stage => (
              <StageCard
                key={stage.id}
                stage={stage}
                health={stageHealthMap[stage.id]}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        </div>

        {/* Two column layout for types and activity */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 24,
        }}>
          {/* Artefacts by Type */}
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 600 }}>Artefacts by Type</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 8,
            }}>
              {Object.entries(PDW_TYPE_DEFS)
                .filter(([type]) => !type.includes('canvas'))
                .map(([type, typeDef]) => (
                  <TypeCard
                    key={type}
                    type={type}
                    typeDef={typeDef}
                    count={typeCounts[type] || 0}
                    onNavigate={handleNavigate}
                  />
                ))}
            </div>
          </div>

          {/* Right column: Activity + Experiments */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Recent Activity */}
            <div style={{
              padding: 16,
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.9375rem', fontWeight: 600 }}>Recent Activity</h4>
              {recentArtefacts.length === 0 ? (
                <div style={{
                  padding: 24,
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}>
                  <ExploreIcon style={{ fontSize: 32, opacity: 0.5, marginBottom: 8 }} />
                  <p style={{ margin: '0 0 12px', fontSize: '0.875rem' }}>No artefacts yet</p>
                  <button
                    onClick={() => onCreateArtefact && onCreateArtefact()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '6px 12px',
                      backgroundColor: '#6366f1',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <AddIcon fontSize="small" />
                    Create First Artefact
                  </button>
                </div>
              ) : (
                <div>
                  {recentArtefacts.map(artefact => (
                    <ActivityItem
                      key={artefact.id}
                      artefact={artefact}
                      typeDef={getTypeDefinition(artefact.artefact_type)}
                      onClick={(a) => onSelectArtefact && onSelectArtefact(a)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Experiment Results */}
            <ExperimentResultsWidget results={dashboardStats.experimentResults} />
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 600 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <QuickActionButton
              icon={TrendingUpIcon}
              label="New Opportunity"
              color="#8b5cf6"
              onClick={() => onCreateArtefact && onCreateArtefact('pdw_opportunity')}
            />
            <QuickActionButton
              icon={ReportProblemIcon}
              label="New Problem"
              color="#ef4444"
              onClick={() => onCreateArtefact && onCreateArtefact('pdw_problem')}
            />
            <QuickActionButton
              icon={EmojiObjectsIcon}
              label="New Idea"
              color="#3b82f6"
              onClick={() => onCreateArtefact && onCreateArtefact('pdw_idea')}
            />
            <QuickActionButton
              icon={ScienceIcon}
              label="New Hypothesis"
              color="#f59e0b"
              onClick={() => onCreateArtefact && onCreateArtefact('pdw_hypothesis')}
            />
            <QuickActionButton
              icon={BiotechIcon}
              label="New Experiment"
              color="#10b981"
              onClick={() => onCreateArtefact && onCreateArtefact('pdw_experiment')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
