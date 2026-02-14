// components/spaces/blueprint/views/OverviewDashboard.js
// Blueprint Studio overview dashboard - knowledge-first approach
// Shows capabilities and structure even when empty

import { useMemo } from 'react';
import { useBlueprint, formatCurrency, BPS_STAGE_INFO, BPS_HORIZONS } from '../BlueprintContext';
import InitiativeCard from '../initiative/InitiativeCard';
import { StageProgress } from '../initiative/StageIndicator';

// MUI Icons
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExploreIcon from '@mui/icons-material/Explore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import TimelineIcon from '@mui/icons-material/Timeline';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import StorefrontIcon from '@mui/icons-material/Storefront';
import GroupsIcon from '@mui/icons-material/Groups';
import PublicIcon from '@mui/icons-material/Public';
import GavelIcon from '@mui/icons-material/Gavel';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

// Capability definitions for empty state exploration
const CAPABILITIES = {
  pipeline: {
    title: 'Pipeline Management',
    description: 'Track initiatives from idea to approval through structured stages',
    views: [
      { id: 'overview', icon: ViewKanbanIcon, name: 'Initiatives', desc: 'Browse and manage strategic initiatives' },
      { id: 'pipeline', icon: TimelineIcon, name: 'Pipeline View', desc: 'Kanban-style stage progression' },
      { id: 'health', icon: AnalyticsIcon, name: 'Funnel Health', desc: 'Conversion rates and bottlenecks' },
    ],
  },
  stages: {
    title: 'Stage-Gate Process',
    description: 'Structured validation from initial idea to business case approval',
    views: [
      { id: 'discovery', icon: LightbulbIcon, name: 'Discovery', desc: 'Capture, explore & assess ideas' },
      { id: 'case', icon: DescriptionIcon, name: 'Business Case', desc: 'Financial and strategic justification' },
      { id: 'approval', icon: CheckCircleIcon, name: 'Approval', desc: 'Gate decision and sign-off' },
    ],
  },
  market: {
    title: 'Market Intelligence',
    description: 'Research and analysis tools to validate market opportunity',
    views: [
      { id: 'market', icon: TrendingUpIcon, name: 'Market Overview', desc: 'Consolidated market insights' },
      { id: 'tamsam', icon: StorefrontIcon, name: 'TAM/SAM/SOM', desc: 'Market sizing analysis' },
      { id: 'competitors', icon: GroupsIcon, name: 'Competitors', desc: 'Competitive landscape mapping' },
      { id: 'pestle', icon: PublicIcon, name: 'PESTLE', desc: 'Macro-environment analysis' },
    ],
  },
  governance: {
    title: 'Governance & Control',
    description: 'SLA tracking, risk monitoring, and kill criteria enforcement',
    views: [
      { id: 'gates', icon: GavelIcon, name: 'Stage Gates', desc: 'Gate criteria and decisions' },
      { id: 'sla', icon: TimelineIcon, name: 'SLA Tracker', desc: 'Time-in-stage monitoring' },
      { id: 'risk', icon: WarningIcon, name: 'At Risk', desc: 'Initiatives requiring attention' },
    ],
  },
};

export default function OverviewDashboard({
  onSelectInitiative,
  onEditInitiative,
  onDeleteInitiative,
  onCreateInitiative,
  onNavigate,
}) {
  const {
    initiatives,
    stageCounts,
    horizonCounts,
    funnelMetrics,
    initiativesAtRisk,
    initiativesWithKillCriteria,
    activeInitiatives,
  } = useBlueprint();

  const hasData = initiatives.length > 0;

  // Recent initiatives (last 5 created)
  const recentInitiatives = useMemo(() => {
    return [...initiatives]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [initiatives]);

  // Top initiatives by score
  const topByScore = useMemo(() => {
    return [...initiatives]
      .filter(i => i.assess?.overall_score !== undefined)
      .sort((a, b) => (b.assess?.overall_score || 0) - (a.assess?.overall_score || 0))
      .slice(0, 5);
  }, [initiatives]);

  // Funnel visualization data - always show all stages
  const funnelData = useMemo(() => {
    const stages = ['idea', 'explore', 'assess', 'case', 'approved'];
    return stages.map((stage, index) => ({
      stage,
      count: stageCounts[stage] || 0,
      name: BPS_STAGE_INFO[stage]?.name,
      color: BPS_STAGE_INFO[stage]?.color,
      description: BPS_STAGE_INFO[stage]?.description || '',
      conversion: index > 0 ? funnelMetrics.conversions[`${stages[index-1]}_to_${stage}`] : null,
    }));
  }, [stageCounts, funnelMetrics]);

  return (
    <div className="blueprint-dashboard">
      {/* Hero stats - always visible with zeros */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-stat dashboard-hero-stat--primary">
          <span className="dashboard-hero-value">{funnelMetrics.total || 0}</span>
          <span className="dashboard-hero-label">Total Initiatives</span>
        </div>
        <div className="dashboard-hero-stat">
          <span className="dashboard-hero-value">{funnelMetrics.active || 0}</span>
          <span className="dashboard-hero-label">Active</span>
        </div>
        <div className="dashboard-hero-stat dashboard-hero-stat--success">
          <CheckCircleIcon fontSize="small" />
          <span className="dashboard-hero-value">{stageCounts.approved || 0}</span>
          <span className="dashboard-hero-label">Approved</span>
        </div>
        <div className="dashboard-hero-stat dashboard-hero-stat--warning">
          <WarningIcon fontSize="small" />
          <span className="dashboard-hero-value">{initiativesAtRisk?.length || 0}</span>
          <span className="dashboard-hero-label">At Risk</span>
        </div>
      </div>

      {/* Main content grid */}
      <div className="dashboard-grid">
        {/* Innovation Funnel - always visible with all stages */}
        <div className="dashboard-card dashboard-card--wide">
          <div className="dashboard-card-header">
            <div>
              <h3>Innovation Funnel</h3>
              {!hasData && (
                <p className="dashboard-card-hint">Track initiatives through each validation stage</p>
              )}
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => onNavigate?.('pipeline')}>
              View Pipeline
              <ArrowForwardIcon fontSize="small" />
            </button>
          </div>
          <div className="funnel-visualization">
            {funnelData.map((stage, index) => (
              <div key={stage.stage} className="funnel-stage" onClick={() => onNavigate?.(stage.stage)}>
                <div
                  className={`funnel-bar ${stage.count === 0 ? 'funnel-bar--empty' : ''}`}
                  style={{
                    width: hasData
                      ? `${Math.max(20, (stage.count / Math.max(1, funnelMetrics.total)) * 100)}%`
                      : '100%',
                    backgroundColor: stage.color,
                    opacity: stage.count === 0 ? 0.4 : 1,
                  }}
                >
                  <span className="funnel-bar-label">{stage.name}</span>
                  <span className="funnel-bar-count">{stage.count}</span>
                </div>
                {index < funnelData.length - 1 && (
                  <div className="funnel-conversion">
                    <ArrowForwardIcon fontSize="small" />
                    {stage.conversion !== null && stage.conversion > 0 ? (
                      <span>{stage.conversion}%</span>
                    ) : (
                      <span className="funnel-conversion--empty">—</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Horizon Portfolio - always visible */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>Portfolio by Horizon</h3>
          </div>
          <div className="horizon-breakdown">
            {Object.entries(BPS_HORIZONS).map(([id, horizon]) => {
              const count = horizonCounts[id] || 0;
              return (
                <div key={id} className="horizon-item">
                  <div className="horizon-item-header">
                    <span className="horizon-item-name">{horizon.name}</span>
                    <span className="horizon-item-target">Target: {horizon.portfolioTarget}%</span>
                  </div>
                  <div className="horizon-item-bar">
                    <div
                      className="horizon-item-fill"
                      style={{
                        width: `${(count / Math.max(1, funnelMetrics.active || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="horizon-item-count">{count} initiatives</span>
                  {!hasData && (
                    <span className="horizon-item-desc">{horizon.description || `${horizon.timeframe} focus`}</span>
                  )}
                </div>
              );
            })}
            <div className="horizon-item horizon-item--muted">
              <span className="horizon-item-name">Unclassified</span>
              <span className="horizon-item-count">{horizonCounts.unclassified || 0}</span>
            </div>
          </div>
        </div>

        {/* Governance Status - always visible */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>
              <WarningIcon fontSize="small" className="text-warning" />
              Governance Status
            </h3>
          </div>
          <div className="dashboard-governance-status">
            <div
              className="governance-status-item"
              onClick={() => onNavigate?.('risk')}
            >
              <div className="governance-status-metric">
                <span className={`governance-status-value ${(initiativesAtRisk?.length || 0) > 0 ? 'text-warning' : 'text-success'}`}>
                  {initiativesAtRisk?.length || 0}
                </span>
                <span className="governance-status-label">At Risk</span>
              </div>
              <span className="governance-status-desc">SLA breaches or approaching deadlines</span>
            </div>
            <div
              className="governance-status-item"
              onClick={() => onNavigate?.('gates')}
            >
              <div className="governance-status-metric">
                <span className={`governance-status-value ${(initiativesWithKillCriteria?.length || 0) > 0 ? 'text-danger' : 'text-success'}`}>
                  {initiativesWithKillCriteria?.length || 0}
                </span>
                <span className="governance-status-label">Kill Criteria</span>
              </div>
              <span className="governance-status-desc">Initiatives meeting termination criteria</span>
            </div>
            <div
              className="governance-status-item"
              onClick={() => onNavigate?.('sla')}
            >
              <div className="governance-status-metric">
                <span className="governance-status-value text-muted">
                  {funnelMetrics.active || 0}
                </span>
                <span className="governance-status-label">Under SLA</span>
              </div>
              <span className="governance-status-desc">Active initiatives being tracked</span>
            </div>
          </div>
          {(initiativesAtRisk?.length > 0 || initiativesWithKillCriteria?.length > 0) && (
            <div className="dashboard-card-list">
              {initiativesAtRisk?.slice(0, 2).map(initiative => (
                <div
                  key={initiative.id}
                  className="dashboard-list-item"
                  onClick={() => onSelectInitiative?.(initiative)}
                >
                  <div className="dashboard-list-item-main">
                    <span className="dashboard-list-item-id">{initiative.display_id}</span>
                    <span className="dashboard-list-item-name">{initiative.name}</span>
                  </div>
                  <span className="dashboard-list-item-badge badge badge-warning">
                    <AccessTimeIcon fontSize="small" />
                    SLA
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Rated - always visible */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>
              <TrendingUpIcon fontSize="small" />
              Top Rated
            </h3>
            <span className="dashboard-card-count">{topByScore.length}</span>
          </div>
          {topByScore.length > 0 ? (
            <div className="dashboard-card-list">
              {topByScore.map((initiative, index) => (
                <div
                  key={initiative.id}
                  className="dashboard-list-item"
                  onClick={() => onSelectInitiative?.(initiative)}
                >
                  <div className="dashboard-list-item-rank">#{index + 1}</div>
                  <div className="dashboard-list-item-main">
                    <span className="dashboard-list-item-id">{initiative.display_id}</span>
                    <span className="dashboard-list-item-name">{initiative.name}</span>
                  </div>
                  <span className="dashboard-list-item-score">
                    {initiative.assess?.overall_score}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-card-empty-state">
              <AssessmentIcon className="empty-state-icon" />
              <p>Initiatives will appear here once assessed and scored</p>
              <button className="btn btn-sm btn-link" onClick={() => onNavigate?.('assess')}>
                View Assessment Stage
              </button>
            </div>
          )}
        </div>

        {/* Recent Initiatives - always visible */}
        <div className="dashboard-card dashboard-card--wide">
          <div className="dashboard-card-header">
            <h3>
              <LightbulbIcon fontSize="small" />
              Recent Initiatives
            </h3>
            <button className="btn btn-sm btn-primary" onClick={onCreateInitiative}>
              New Initiative
            </button>
          </div>
          {recentInitiatives.length > 0 ? (
            <div className="dashboard-initiative-grid">
              {recentInitiatives.map(initiative => (
                <InitiativeCard
                  key={initiative.id}
                  initiative={initiative}
                  compact
                  onClick={onSelectInitiative}
                  onEdit={onEditInitiative}
                  onDelete={onDeleteInitiative}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-guide">
              <div className="empty-guide-header">
                <RocketLaunchIcon className="empty-guide-icon" />
                <div>
                  <h4>Start your innovation pipeline</h4>
                  <p>Create your first initiative to begin tracking ideas through validation</p>
                </div>
              </div>
              <div className="empty-guide-steps">
                <div className="empty-guide-step">
                  <span className="step-number">1</span>
                  <span className="step-text">Capture an idea with problem statement and hypothesis</span>
                </div>
                <div className="empty-guide-step">
                  <span className="step-number">2</span>
                  <span className="step-text">Progress through Explore, Assess, and Business Case stages</span>
                </div>
                <div className="empty-guide-step">
                  <span className="step-number">3</span>
                  <span className="step-text">Get approval through stage-gate governance</span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={onCreateInitiative}>
                Create First Initiative
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Capabilities Overview - always visible, especially useful when empty */}
      <div className="dashboard-capabilities">
        <h3 className="dashboard-section-title">What You Can Do</h3>
        <div className="capabilities-grid">
          {Object.entries(CAPABILITIES).map(([key, capability]) => (
            <div key={key} className="capability-card">
              <div className="capability-header">
                <h4>{capability.title}</h4>
                <p>{capability.description}</p>
              </div>
              <div className="capability-views">
                {capability.views.map(view => {
                  const Icon = view.icon;
                  return (
                    <button
                      key={view.id}
                      className="capability-view-link"
                      onClick={() => onNavigate?.(view.id)}
                    >
                      <Icon fontSize="small" />
                      <div className="capability-view-info">
                        <span className="capability-view-name">{view.name}</span>
                        <span className="capability-view-desc">{view.desc}</span>
                      </div>
                      <ArrowForwardIcon fontSize="small" className="capability-view-arrow" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="dashboard-quick-actions">
        <button className="dashboard-quick-action" onClick={onCreateInitiative}>
          <LightbulbIcon />
          <span>Capture Idea</span>
        </button>
        <button className="dashboard-quick-action" onClick={() => onNavigate?.('overview')}>
          <ViewKanbanIcon />
          <span>Initiatives</span>
        </button>
        <button className="dashboard-quick-action" onClick={() => onNavigate?.('pipeline')}>
          <TimelineIcon />
          <span>Pipeline View</span>
        </button>
        <button className="dashboard-quick-action" onClick={() => onNavigate?.('health')}>
          <AnalyticsIcon />
          <span>Funnel Health</span>
        </button>
      </div>
    </div>
  );
}
