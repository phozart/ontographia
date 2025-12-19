// components/portfolio/PortfolioWorkspace.js
// Portfolio Studio - Where we decide what deserves a project
// Investment choices, trade-offs, and commitment gates

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePortfolio } from './PortfolioContext';
import { useDomains } from '../DomainContext';
import PortfolioNavigator from './PortfolioNavigator';
import PortfolioModal from './PortfolioModal';
import PortfolioLearn from './PortfolioLearn';
// New prioritization components
import PriorityMatrix from './PriorityMatrix';
import StackRank from './StackRank';
import ScoringPanel from './ScoringPanel';
import DependencyMap from './DependencyMap';
import BudgetEnvelopes from './BudgetEnvelopes';
import DecisionTimeline from './DecisionTimeline';
import CommitteeReview from './CommitteeReview';

// Shared UI components
import {
  WorkspaceLayout,
  ViewHeader,
  EmptyState,
  QuickStart,
  Card,
  ContentArea,
  Button,
} from '../ui';

// MUI Icons
import FlagIcon from '@mui/icons-material/Flag';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BalanceIcon from '@mui/icons-material/Balance';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GavelIcon from '@mui/icons-material/Gavel';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SpeedIcon from '@mui/icons-material/Speed';
import DonutSmallIcon from '@mui/icons-material/DonutSmall';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  PORTFOLIO_STAGES,
  INVESTMENT_HORIZONS,
  CONFIDENCE_LEVELS,
  TSHIRT_SIZES,
} from '../../lib/portfolio-types';

// ============ STAGE ICON MAPPING ============
const STAGE_ICONS = {
  discover: TrendingUpIcon,
  evaluate: AutoGraphIcon,
  decide: BalanceIcon,
  commit: PlaylistAddCheckIcon,
};

// ============ OVERVIEW COMPONENT ============
function PortfolioOverview({ onNavigate, onCreateTheme, onCreateInitiative }) {
  const {
    stats,
    portfolioHealth,
    initiatives,
    themes,
    decisions,
    risks,
    getInitiativesByStage,
  } = usePortfolio();

  // Calculate actionable items
  const needsAttention = useMemo(() => {
    const items = [];
    const decideCount = stats.stageCounts?.decide || 0;
    if (decideCount > 0) {
      items.push({
        type: 'decision',
        icon: GavelIcon,
        color: '#f59e0b',
        title: `${decideCount} initiative${decideCount > 1 ? 's' : ''} awaiting decision`,
        action: () => onNavigate('pipeline', 'decide'),
        actionLabel: 'Review',
      });
    }
    const blockedDeps = initiatives.filter(i => i.custom_fields?.is_blocked).length;
    if (blockedDeps > 0) {
      items.push({
        type: 'blocked',
        icon: AccountTreeIcon,
        color: '#ef4444',
        title: `${blockedDeps} initiative${blockedDeps > 1 ? 's' : ''} blocked by dependencies`,
        action: () => onNavigate('depmap'),
        actionLabel: 'View Map',
      });
    }
    const highRisks = risks.filter(r => r.custom_fields?.impact === 'major' || r.custom_fields?.impact === 'severe').length;
    if (highRisks > 0) {
      items.push({
        type: 'risk',
        icon: WarningIcon,
        color: '#ef4444',
        title: `${highRisks} high-impact risk${highRisks > 1 ? 's' : ''} need attention`,
        action: () => onNavigate('risks'),
        actionLabel: 'View Risks',
      });
    }
    return items;
  }, [stats, initiatives, risks, onNavigate]);

  const recentDecisions = useMemo(() => {
    return decisions
      .sort((a, b) => new Date(b.custom_fields?.decision_date) - new Date(a.custom_fields?.decision_date))
      .slice(0, 3);
  }, [decisions]);

  // Getting Started view - when portfolio is empty
  if (initiatives.length === 0 && themes.length === 0) {
    return (
      <>
        <ViewHeader
          icon={LightbulbIcon}
          iconColor="#475569"
          title="Welcome to Portfolio Management"
          description="This is where organisations learn to choose, not just to do."
        />
        <ContentArea>
          <div className="overview-onboarding">
            {/* Purpose Section */}
            <Card>
              <Card.Header>
                <span style={{ fontWeight: 600 }}>Portfolio helps you answer:</span>
              </Card.Header>
              <Card.Section>
                <ul className="overview-questions">
                  <li>Why are we considering this now?</li>
                  <li>What outcome are we trying to move?</li>
                  <li>What are we NOT doing because of this?</li>
                  <li>When does this become a project?</li>
                </ul>
              </Card.Section>
            </Card>

            {/* Getting Started Steps */}
            <div className="overview-steps">
              <h3>Get Started</h3>
              <div className="overview-steps-grid">
                <Card onClick={onCreateTheme} className="overview-step-card">
                  <div className="overview-step-icon" style={{ background: 'rgba(71, 85, 105, 0.1)' }}>
                    <FlagIcon style={{ color: '#475569', fontSize: 28 }} />
                  </div>
                  <h4>1. Define Investment Themes</h4>
                  <p>Create strategic focus areas that group related initiatives</p>
                  <Button variant="secondary" size="small">Create Theme</Button>
                </Card>

                <Card onClick={onCreateInitiative} className="overview-step-card">
                  <div className="overview-step-icon" style={{ background: 'rgba(71, 85, 105, 0.1)' }}>
                    <RocketLaunchIcon style={{ color: '#64748b', fontSize: 28 }} />
                  </div>
                  <h4>2. Add Portfolio Initiatives</h4>
                  <p>Document potential investments with value hypotheses</p>
                  <Button variant="secondary" size="small">Add Initiative</Button>
                </Card>

                <Card onClick={() => onNavigate('matrix')} className="overview-step-card">
                  <div className="overview-step-icon" style={{ background: 'rgba(71, 85, 105, 0.1)' }}>
                    <BalanceIcon style={{ color: '#78716c', fontSize: 28 }} />
                  </div>
                  <h4>3. Make Trade-offs Visible</h4>
                  <p>Compare initiatives to make informed choices</p>
                  <Button variant="secondary" size="small">Prioritise</Button>
                </Card>
              </div>
            </div>

            {/* Key Concept */}
            <Card className="overview-tip">
              <Card.Header>
                <LightbulbIcon style={{ color: '#f59e0b', fontSize: 18 }} />
                <span>Key Concept</span>
              </Card.Header>
              <Card.Section>
                <p>
                  A Portfolio Initiative is <strong>NOT</strong> a project yet.
                  It represents a potential investment being evaluated.
                  Only after explicit approval does it become a project.
                </p>
              </Card.Section>
            </Card>
          </div>
        </ContentArea>
      </>
    );
  }

  // Dashboard view - when portfolio has data
  return (
    <>
      <ViewHeader
        icon={SpeedIcon}
        iconColor="#475569"
        title="Portfolio Overview"
        description="Investment health, pipeline status, and key metrics"
      />
      <ContentArea>
        <div className="overview-dashboard-v2">
          {/* Attention Banner - only if there are items needing attention */}
          {needsAttention.length > 0 && (
            <div className="overview-attention">
              <div className="overview-attention-header">
                <WarningIcon style={{ fontSize: 18, color: '#f59e0b' }} />
                <span>Needs Attention</span>
              </div>
              <div className="overview-attention-items">
                {needsAttention.map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={i} className="overview-attention-item" onClick={item.action}>
                      <ItemIcon style={{ fontSize: 18, color: item.color }} />
                      <span className="overview-attention-text">{item.title}</span>
                      <button className="overview-attention-btn">{item.actionLabel}</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="overview-grid">
            {/* Left Column - Snapshot & Pipeline */}
            <div className="overview-col">
              {/* Portfolio Snapshot */}
              <div className="overview-snapshot">
                <div className="overview-snapshot-header">
                  <h3>Portfolio Snapshot</h3>
                  <div
                    className="overview-health-badge"
                    style={{
                      background: portfolioHealth.score > 70 ? '#dcfce7' : portfolioHealth.score > 40 ? '#fef3c7' : '#fee2e2',
                      color: portfolioHealth.score > 70 ? '#166534' : portfolioHealth.score > 40 ? '#92400e' : '#991b1b',
                    }}
                  >
                    {portfolioHealth.score}% Health
                  </div>
                </div>
                <div className="overview-snapshot-grid">
                  <div className="overview-snapshot-stat" onClick={() => onNavigate('themes')}>
                    <span className="overview-snapshot-value">{stats.activeThemes}</span>
                    <span className="overview-snapshot-label">Themes</span>
                  </div>
                  <div className="overview-snapshot-stat" onClick={() => onNavigate('initiatives')}>
                    <span className="overview-snapshot-value">{stats.totalInitiatives}</span>
                    <span className="overview-snapshot-label">Initiatives</span>
                  </div>
                  <div className="overview-snapshot-stat" onClick={() => onNavigate('decisions')}>
                    <span className="overview-snapshot-value">{stats.recentDecisions}</span>
                    <span className="overview-snapshot-label">Decisions</span>
                  </div>
                  <div className="overview-snapshot-stat" onClick={() => onNavigate('risks')}>
                    <span className="overview-snapshot-value">{stats.openRisks}</span>
                    <span className="overview-snapshot-label">Risks</span>
                  </div>
                </div>
              </div>

              {/* Pipeline Flow */}
              <Card className="overview-pipeline-card">
                <Card.Header>
                  <TrendingUpIcon style={{ fontSize: 18 }} />
                  <span>Initiative Pipeline</span>
                </Card.Header>
                <Card.Section>
                  <div className="overview-pipeline-flow">
                    {Object.entries(PORTFOLIO_STAGES).map(([id, stage], idx) => {
                      const count = stats.stageCounts?.[id] || 0;
                      const StageIcon = STAGE_ICONS[id];
                      return (
                        <div key={id} className="overview-pipeline-item">
                          <div
                            className="overview-pipeline-stage-v2"
                            onClick={() => onNavigate('pipeline', id)}
                            style={{ '--stage-color': stage.color }}
                          >
                            <div className="overview-pipeline-icon-v2">
                              <StageIcon style={{ fontSize: 20, color: stage.color }} />
                            </div>
                            <div className="overview-pipeline-info">
                              <span className="overview-pipeline-count-v2">{count}</span>
                              <span className="overview-pipeline-name-v2">{stage.name}</span>
                            </div>
                          </div>
                          {idx < 3 && <ChevronRightIcon className="overview-pipeline-arrow" />}
                        </div>
                      );
                    })}
                  </div>
                </Card.Section>
              </Card>

              {/* Quick Actions */}
              <div className="overview-actions">
                <Button variant="primary" onClick={onCreateInitiative}>
                  <AddIcon fontSize="small" />
                  New Initiative
                </Button>
                <Button variant="ghost" onClick={() => onNavigate('matrix')}>
                  Priority Matrix
                </Button>
                <Button variant="ghost" onClick={() => onNavigate('scoring')}>
                  Score Initiatives
                </Button>
              </div>
            </div>

            {/* Right Column - Distribution & Activity */}
            <div className="overview-col">
              {/* Investment Horizons */}
              <Card>
                <Card.Header>
                  <DonutSmallIcon style={{ fontSize: 18 }} />
                  <span>Investment Distribution</span>
                </Card.Header>
                <Card.Section>
                  <div className="overview-horizons">
                    {Object.entries(INVESTMENT_HORIZONS).map(([id, horizon]) => {
                      const count = stats.horizonCounts?.[id] || 0;
                      const pct = stats.totalInitiatives > 0 ? (count / stats.totalInitiatives) * 100 : 0;
                      return (
                        <div key={id} className="overview-horizon-row">
                          <div className="overview-horizon-dot" style={{ background: horizon.color }} />
                          <span className="overview-horizon-name">{horizon.name}</span>
                          <div className="overview-horizon-bar-v2">
                            <div
                              className="overview-horizon-fill-v2"
                              style={{ width: `${pct}%`, background: horizon.color }}
                            />
                          </div>
                          <span className="overview-horizon-pct">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card.Section>
              </Card>

              {/* Health Issues */}
              {(portfolioHealth.issues.length > 0 || portfolioHealth.positives.length > 0) && (
                <Card>
                  <Card.Header>
                    <SpeedIcon style={{ fontSize: 18 }} />
                    <span>Health Check</span>
                  </Card.Header>
                  <Card.Section>
                    <div className="overview-health-items">
                      {portfolioHealth.issues.slice(0, 2).map((issue, i) => (
                        <div key={i} className="overview-health-row overview-health-row--issue">
                          <WarningIcon style={{ fontSize: 16, color: '#ef4444' }} />
                          <span>{issue}</span>
                        </div>
                      ))}
                      {portfolioHealth.positives.slice(0, 2).map((positive, i) => (
                        <div key={i} className="overview-health-row overview-health-row--positive">
                          <CheckCircleIcon style={{ fontSize: 16, color: '#10b981' }} />
                          <span>{positive}</span>
                        </div>
                      ))}
                    </div>
                  </Card.Section>
                </Card>
              )}

              {/* Recent Decisions */}
              {recentDecisions.length > 0 && (
                <Card>
                  <Card.Header>
                    <GavelIcon style={{ fontSize: 18 }} />
                    <span>Recent Decisions</span>
                    <button className="overview-see-all" onClick={() => onNavigate('decisions')}>
                      See all
                    </button>
                  </Card.Header>
                  <Card.Section>
                    <div className="overview-decisions">
                      {recentDecisions.map(decision => (
                        <div key={decision.id} className="overview-decision-row">
                          <span className={`overview-decision-badge overview-decision-badge--${decision.custom_fields?.decision_type}`}>
                            {decision.custom_fields?.decision_type}
                          </span>
                          <span className="overview-decision-title">{decision.name}</span>
                        </div>
                      ))}
                    </div>
                  </Card.Section>
                </Card>
              )}

              {/* Themes Quick View */}
              {themes.length > 0 && (
                <Card>
                  <Card.Header>
                    <FlagIcon style={{ fontSize: 18 }} />
                    <span>Investment Themes</span>
                    <button className="overview-see-all" onClick={() => onNavigate('themes')}>
                      See all
                    </button>
                  </Card.Header>
                  <Card.Section>
                    <div className="overview-themes">
                      {themes.slice(0, 3).map(theme => {
                        const initCount = initiatives.filter(i => i.custom_fields?.theme_id === theme.id).length;
                        return (
                          <div key={theme.id} className="overview-theme-row">
                            <span className="overview-theme-name">{theme.name}</span>
                            <span className="overview-theme-count">{initCount} initiatives</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card.Section>
                </Card>
              )}
            </div>
          </div>
        </div>
      </ContentArea>
    </>
  );
}

// ============ INITIATIVE CARD ============
function InitiativeCard({ initiative, onClick, onEdit, onDelete, onPromote, onDefer, onDrop }) {
  const horizon = INVESTMENT_HORIZONS[initiative.custom_fields?.time_horizon];
  const confidence = CONFIDENCE_LEVELS[initiative.custom_fields?.confidence];
  const size = TSHIRT_SIZES[initiative.custom_fields?.size];
  const stage = PORTFOLIO_STAGES[initiative.custom_fields?.stage];

  return (
    <Card onClick={() => onClick?.(initiative)}>
      <Card.Header>
        <span className="portfolio-card-horizon" style={{ background: horizon?.color }}>
          {horizon?.shortName || 'H?'}
        </span>
        <span className="portfolio-card-stage" style={{ color: stage?.color }}>
          {stage?.name}
        </span>
        <div className="portfolio-card-menu">
          <button
            className="portfolio-card-menu-btn"
            onClick={(e) => { e.stopPropagation(); onEdit?.(initiative); }}
            title="Edit"
          >
            <EditIcon fontSize="small" />
          </button>
          <button
            className="portfolio-card-menu-btn portfolio-card-menu-btn--delete"
            onClick={(e) => { e.stopPropagation(); onDelete?.(initiative); }}
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </Card.Header>
      <Card.Title>{initiative.name}</Card.Title>
      {initiative.description && (
        <Card.Section>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {initiative.description}
          </p>
        </Card.Section>
      )}
      <Card.Footer>
        <Card.Meta style={{ color: confidence?.color }}>
          {confidence?.name}
        </Card.Meta>
        <Card.Meta>{size?.name}</Card.Meta>
        <Card.Meta className={`portfolio-risk-level portfolio-risk-level--${initiative.custom_fields?.risk_level}`}>
          {initiative.custom_fields?.risk_level} risk
        </Card.Meta>
      </Card.Footer>
      {stage?.id === 'decide' && (
        <div className="portfolio-card-actions">
          <button
            className="portfolio-action-btn portfolio-action-btn--approve"
            onClick={(e) => { e.stopPropagation(); onPromote?.(initiative.id); }}
          >
            <CheckCircleIcon fontSize="small" />
            Approve
          </button>
          <button
            className="portfolio-action-btn portfolio-action-btn--defer"
            onClick={(e) => { e.stopPropagation(); onDefer?.(initiative.id); }}
          >
            <PauseCircleIcon fontSize="small" />
            Defer
          </button>
          <button
            className="portfolio-action-btn portfolio-action-btn--drop"
            onClick={(e) => { e.stopPropagation(); onDrop?.(initiative.id); }}
          >
            <CancelIcon fontSize="small" />
            Drop
          </button>
        </div>
      )}
    </Card>
  );
}

// ============ THEME CARD ============
function ThemeCard({ theme, onClick, onEdit, onDelete, initiativeCount }) {
  const horizon = INVESTMENT_HORIZONS[theme.custom_fields?.time_horizon];
  const isActive = theme.custom_fields?.status === 'active';

  return (
    <Card
      onClick={() => onClick?.(theme)}
      className={isActive ? '' : 'portfolio-theme-card--inactive'}
      style={{ borderLeftColor: 'var(--accent)', borderLeftWidth: 4 }}
    >
      <Card.Header>
        <FlagIcon style={{ color: 'var(--accent)' }} />
        <span className="portfolio-card-horizon" style={{ background: horizon?.color }}>
          {horizon?.name}
        </span>
        <div className="portfolio-card-menu">
          <button
            className="portfolio-card-menu-btn"
            onClick={(e) => { e.stopPropagation(); onEdit?.(theme); }}
            title="Edit"
          >
            <EditIcon fontSize="small" />
          </button>
          <button
            className="portfolio-card-menu-btn portfolio-card-menu-btn--delete"
            onClick={(e) => { e.stopPropagation(); onDelete?.(theme); }}
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </Card.Header>
      <Card.Title>{theme.name}</Card.Title>
      {theme.description && (
        <Card.Section>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {theme.description}
          </p>
        </Card.Section>
      )}
      <Card.Footer>
        <Card.Meta className={`portfolio-status portfolio-status--${theme.custom_fields?.status}`}>
          {theme.custom_fields?.status}
        </Card.Meta>
        <Card.Meta>
          {initiativeCount} initiative{initiativeCount !== 1 ? 's' : ''}
        </Card.Meta>
      </Card.Footer>
    </Card>
  );
}

// ============ MAIN WORKSPACE ============
export default function PortfolioWorkspace() {
  const { activeDomain, accessibleDomains } = useDomains();
  const {
    loading,
    error,
    themes,
    initiatives,
    decisions,
    risks,
    dependencies,
    stats,
    getInitiativesByStage,
    getInitiativesByTheme,
    createArtefact,
    deleteArtefact,
    promoteToProject,
    deferInitiative,
    dropInitiative,
  } = usePortfolio();

  // Navigation state
  const [activeSection, setActiveSection] = useState('overview');
  const [activeViewId, setActiveViewId] = useState(null);
  const [activeStageId, setActiveStageId] = useState(null);
  const [activeHelpId, setActiveHelpId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState(null);
  const [editArtefact, setEditArtefact] = useState(null);

  // Navigation handler
  const handleNavigate = useCallback((section, id) => {
    setActiveSection(section);
    setSelectedItem(null);

    if (section === 'pipeline') {
      setActiveStageId(id);
      setActiveViewId(null);
      setActiveHelpId(null);
    } else if (section === 'view') {
      setActiveViewId(id);
      setActiveStageId(null);
      setActiveHelpId(null);
    } else if (section === 'help') {
      setActiveHelpId(id || 'basics');
      setActiveStageId(null);
      setActiveViewId(null);
    } else {
      setActiveStageId(null);
      setActiveViewId(null);
      setActiveHelpId(null);
    }
  }, []);

  // Create handlers
  const handleCreateTheme = useCallback(() => {
    setCreateType('portfolio_theme');
    setShowCreateModal(true);
  }, []);

  const handleCreateInitiative = useCallback(() => {
    setCreateType('portfolio_initiative');
    setShowCreateModal(true);
  }, []);

  // Promote to project
  const handlePromote = useCallback(async (initiativeId) => {
    if (window.confirm('Approve this initiative and create a project?')) {
      await promoteToProject(initiativeId);
    }
  }, [promoteToProject]);

  // Defer initiative
  const handleDefer = useCallback(async (initiativeId) => {
    const reason = window.prompt('Why is this being deferred?');
    if (reason !== null) {
      await deferInitiative(initiativeId, reason);
    }
  }, [deferInitiative]);

  // Drop initiative
  const handleDrop = useCallback(async (initiativeId) => {
    if (window.confirm('Are you sure you want to drop this initiative?')) {
      const reason = window.prompt('Why is this being dropped?');
      await dropInitiative(initiativeId, reason || 'No longer pursuing');
    }
  }, [dropInitiative]);

  // Edit any artefact
  const handleEdit = useCallback((artefact) => {
    setEditArtefact(artefact);
    setCreateType(artefact.artefact_type);
    setShowCreateModal(true);
  }, []);

  // Delete any artefact
  const handleDelete = useCallback(async (artefact) => {
    if (window.confirm(`Delete "${artefact.name}"? This cannot be undone.`)) {
      await deleteArtefact(artefact.id);
    }
  }, [deleteArtefact]);

  // Filter initiatives by stage
  const filteredInitiatives = useMemo(() => {
    if (activeStageId) {
      return getInitiativesByStage(activeStageId);
    }
    return initiatives;
  }, [activeStageId, initiatives, getInitiativesByStage]);

  // Render view content
  const renderView = () => {
    if (loading) {
      return (
        <div className="portfolio-loading">
          <div className="portfolio-loading-spinner" />
          <p>Loading portfolio...</p>
        </div>
      );
    }

    return (
      <main className="portfolio-main">
        {/* Overview */}
        {activeSection === 'overview' && (
          <PortfolioOverview
            onNavigate={handleNavigate}
            onCreateTheme={handleCreateTheme}
            onCreateInitiative={handleCreateInitiative}
          />
        )}

        {/* Investment Themes */}
        {activeSection === 'themes' && (
          <>
            <ViewHeader
              icon={FlagIcon}
              iconColor="var(--accent)"
              title="Investment Themes"
              description="Strategic focus areas that group related initiatives"
              count={themes.length}
              createLabel="New Theme"
              onCreate={handleCreateTheme}
            />
            <ContentArea>
              {themes.length === 0 ? (
                <QuickStart
                  icon={FlagIcon}
                  iconColor="var(--accent)"
                  title="Define Your Investment Themes"
                  description="Investment Themes group related initiatives under strategic focus areas. They prevent project sprawl and help you say 'no' to misaligned work."
                  steps={[
                    'Identify 3-5 strategic priorities for your organisation',
                    'Create a theme for each priority with measurable outcomes',
                    'Use themes to filter and prioritise initiatives'
                  ]}
                  actionLabel="Create First Theme"
                  onAction={handleCreateTheme}
                  tip="Good themes are broad enough to contain multiple initiatives but specific enough to enable trade-off decisions."
                />
              ) : (
                <div className="portfolio-card-grid">
                  {themes.map(theme => (
                    <ThemeCard
                      key={theme.id}
                      theme={theme}
                      onClick={setSelectedItem}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      initiativeCount={getInitiativesByTheme(theme.id).length}
                    />
                  ))}
                </div>
              )}
            </ContentArea>
          </>
        )}

        {/* Initiatives */}
        {activeSection === 'initiatives' && (
          <>
            <ViewHeader
              icon={RocketLaunchIcon}
              iconColor="#3b82f6"
              title="Portfolio Initiatives"
              description="Potential investments being evaluated - not projects yet"
              count={initiatives.length}
              createLabel="New Initiative"
              onCreate={handleCreateInitiative}
            />
            <ContentArea>
              {initiatives.length === 0 ? (
                <QuickStart
                  icon={RocketLaunchIcon}
                  iconColor="#3b82f6"
                  title="Start Your Initiative Pipeline"
                  description="A Portfolio Initiative is NOT a project yet. It's a potential investment being evaluated through your decision process."
                  steps={[
                    'Capture ideas and opportunities as initiatives',
                    'Write a value hypothesis for each initiative',
                    'Progress through stages: Discover → Evaluate → Decide → Commit'
                  ]}
                  actionLabel="Add First Initiative"
                  onAction={handleCreateInitiative}
                  tip="Only initiatives that pass through the 'Decide' stage should become projects. This prevents premature commitments."
                />
              ) : (
                <div className="portfolio-card-grid">
                  {initiatives.map(initiative => (
                    <InitiativeCard
                      key={initiative.id}
                      initiative={initiative}
                      onClick={setSelectedItem}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onPromote={handlePromote}
                      onDefer={handleDefer}
                      onDrop={handleDrop}
                    />
                  ))}
                </div>
              )}
            </ContentArea>
          </>
        )}

        {/* Pipeline Stage */}
        {activeSection === 'pipeline' && activeStageId && (() => {
          const stage = PORTFOLIO_STAGES[activeStageId];
          const StageIcon = STAGE_ICONS[activeStageId];
          return (
            <>
              <ViewHeader
                icon={StageIcon}
                iconColor={stage.color}
                title={stage.name}
                description={stage.description}
                count={filteredInitiatives.length}
                createLabel="New Initiative"
                onCreate={handleCreateInitiative}
              />
              <ContentArea>
                {filteredInitiatives.length === 0 ? (
                  <EmptyState
                    icon={StageIcon}
                    iconColor={stage.color}
                    title={`No Initiatives in ${stage.name}`}
                    description={`Initiatives move through the pipeline: Discover → Evaluate → Decide → Commit. "${stage.name}" is where ${stage.description.toLowerCase()}.`}
                    actionLabel="Add Initiative"
                    onAction={handleCreateInitiative}
                  />
                ) : (
                  <div className="portfolio-card-grid">
                    {filteredInitiatives.map(initiative => (
                      <InitiativeCard
                        key={initiative.id}
                        initiative={initiative}
                        onClick={setSelectedItem}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onPromote={handlePromote}
                        onDefer={handleDefer}
                        onDrop={handleDrop}
                      />
                    ))}
                  </div>
                )}
              </ContentArea>
            </>
          );
        })()}

        {/* Dependencies */}
        {activeSection === 'dependencies' && (
          <>
            <ViewHeader
              icon={AccountTreeIcon}
              iconColor="#64748b"
              title="Dependencies"
              description="Constraints that affect portfolio planning"
              count={dependencies.length}
              createLabel="Add Dependency"
              onCreate={() => { setCreateType('portfolio_dependency'); setShowCreateModal(true); }}
            />
            <ContentArea>
              {dependencies.length === 0 ? (
                <QuickStart
                  icon={AccountTreeIcon}
                  iconColor="#64748b"
                  title="Make Dependencies Visible"
                  description="Dependencies are constraints that affect your portfolio. Visible dependencies prevent over-commitment and enable realistic planning."
                  steps={[
                    'Identify technical prerequisites between initiatives',
                    'Capture external dependencies (vendors, partners, regulators)',
                    'Flag blocking vs. nice-to-have dependencies'
                  ]}
                  actionLabel="Add Dependency"
                  onAction={() => { setCreateType('portfolio_dependency'); setShowCreateModal(true); }}
                  tip="Dependencies often explain why good initiatives fail. Surface them early."
                />
              ) : (
                <div className="portfolio-list-view">
                  {dependencies.map(dep => (
                    <div key={dep.id} className="portfolio-list-item" onClick={() => setSelectedItem(dep)}>
                      <span className={`portfolio-severity portfolio-severity--${dep.custom_fields?.severity}`}>
                        {dep.custom_fields?.severity}
                      </span>
                      <span className="portfolio-list-name">{dep.name}</span>
                      <span className="portfolio-list-type">{dep.custom_fields?.dependency_type}</span>
                      <span className="portfolio-list-status">{dep.custom_fields?.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </ContentArea>
          </>
        )}

        {/* Decisions */}
        {activeSection === 'decisions' && (
          <>
            <ViewHeader
              icon={GavelIcon}
              iconColor="#10b981"
              title="Decision Records"
              description="Institutional memory - what was decided and why"
              count={decisions.length}
            />
            <ContentArea>
              {decisions.length === 0 ? (
                <EmptyState
                  icon={GavelIcon}
                  iconColor="#10b981"
                  title="No Decisions Recorded Yet"
                  description="Decision records are automatically created when initiatives are approved, deferred, or dropped. They form your institutional memory - explaining not just what was decided, but why."
                  actionLabel="View Pipeline"
                  onAction={() => handleNavigate('pipeline', 'decide')}
                />
              ) : (
                <div className="portfolio-decision-cards">
                  {decisions
                    .sort((a, b) => new Date(b.custom_fields?.decision_date) - new Date(a.custom_fields?.decision_date))
                    .map(decision => (
                      <Card key={decision.id} onClick={() => setSelectedItem(decision)}>
                        <Card.Header>
                          <span className={`portfolio-decision-type portfolio-decision-type--${decision.custom_fields?.decision_type}`}>
                            {decision.custom_fields?.decision_type}
                          </span>
                          <Card.Date>
                            {new Date(decision.custom_fields?.decision_date).toLocaleDateString()}
                          </Card.Date>
                        </Card.Header>
                        <Card.Title>{decision.name}</Card.Title>
                        {decision.custom_fields?.decision_summary && (
                          <Card.Section>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                              {decision.custom_fields.decision_summary}
                            </p>
                          </Card.Section>
                        )}
                        {decision.custom_fields?.rationale && (
                          <Card.Section>
                            <strong>Rationale</strong>
                            <p>{decision.custom_fields.rationale}</p>
                          </Card.Section>
                        )}
                      </Card>
                    ))}
                </div>
              )}
            </ContentArea>
          </>
        )}

        {/* Risks */}
        {activeSection === 'risks' && (
          <>
            <ViewHeader
              icon={WarningIcon}
              iconColor="#ef4444"
              title="Portfolio Risks"
              description="Risks that affect the portfolio or multiple initiatives"
              count={risks.length}
              createLabel="Add Risk"
              onCreate={() => { setCreateType('portfolio_risk'); setShowCreateModal(true); }}
            />
            <ContentArea>
              {risks.length === 0 ? (
                <QuickStart
                  icon={WarningIcon}
                  iconColor="#ef4444"
                  title="Track Portfolio-Level Risks"
                  description="Portfolio risks affect multiple initiatives or the portfolio as a whole. Shared visibility enables coordinated responses."
                  steps={[
                    'Identify risks that span multiple initiatives',
                    'Assess likelihood and impact for each risk',
                    'Document mitigation strategies and owners'
                  ]}
                  actionLabel="Add Risk"
                  onAction={() => { setCreateType('portfolio_risk'); setShowCreateModal(true); }}
                  tip="Focus on strategic and cross-cutting risks here. Initiative-specific risks belong in project management."
                />
              ) : (
                <div className="portfolio-card-grid">
                  {risks.map(risk => (
                    <Card key={risk.id} onClick={() => setSelectedItem(risk)}>
                      <Card.Header>
                        <span className={`portfolio-risk-impact portfolio-risk-impact--${risk.custom_fields?.impact}`}>
                          {risk.custom_fields?.impact}
                        </span>
                        <span className="portfolio-risk-likelihood">
                          {risk.custom_fields?.likelihood}
                        </span>
                      </Card.Header>
                      <Card.Title>{risk.name}</Card.Title>
                      {risk.description && (
                        <Card.Section>
                          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {risk.description}
                          </p>
                        </Card.Section>
                      )}
                      <Card.Footer>
                        <Card.Meta>{risk.custom_fields?.category}</Card.Meta>
                        <Card.Meta>{risk.custom_fields?.status}</Card.Meta>
                      </Card.Footer>
                    </Card>
                  ))}
                </div>
              )}
            </ContentArea>
          </>
        )}

        {/* Priority Matrix */}
        {activeSection === 'matrix' && (
          <PriorityMatrix onSelectItem={setSelectedItem} onCreateInitiative={handleCreateInitiative} />
        )}

        {/* Stack Rank */}
        {activeSection === 'stackrank' && (
          <StackRank onSelectItem={setSelectedItem} />
        )}

        {/* Scoring Panel */}
        {activeSection === 'scoring' && (
          <ScoringPanel onSelectItem={setSelectedItem} />
        )}

        {/* Dependency Map */}
        {activeSection === 'depmap' && (
          <DependencyMap onSelectItem={setSelectedItem} />
        )}

        {/* Committee Review */}
        {activeSection === 'committee' && (
          <CommitteeReview onSelectItem={setSelectedItem} />
        )}

        {/* Budget Envelopes */}
        {activeSection === 'budget' && (
          <BudgetEnvelopes onSelectItem={setSelectedItem} />
        )}

        {/* Decision Timeline */}
        {activeSection === 'timeline' && (
          <DecisionTimeline onSelectItem={setSelectedItem} />
        )}

        {/* Learn / Help Section */}
        {activeSection === 'help' && (
          <PortfolioLearn activeHelpId={activeHelpId} />
        )}
      </main>
    );
  };

  // Modal content
  const modalsContent = (
    <PortfolioModal
      isOpen={showCreateModal}
      onClose={() => {
        setShowCreateModal(false);
        setCreateType(null);
        setEditArtefact(null);
      }}
      artefactType={createType}
      editArtefact={editArtefact}
    />
  );

  return (
    <WorkspaceLayout
      navigator={
        <PortfolioNavigator
          activeSection={activeSection}
          activeView={activeHelpId || activeViewId}
          onNavigate={handleNavigate}
          onCreateInitiative={handleCreateInitiative}
        />
      }
      error={error}
      noProject={!activeDomain}
      noSelectionTitle="No Domain Selected"
      noSelectionMessage="Select a domain from the navigation to get started with portfolio management."
      modals={modalsContent}
    >
      {renderView()}
    </WorkspaceLayout>
  );
}
