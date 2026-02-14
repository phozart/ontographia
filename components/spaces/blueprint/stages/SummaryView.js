// components/spaces/blueprint/stages/SummaryView.js
// Summary view showing validated product ideas ready for business case
// Part of the Decision section - shows ideas that passed assessment

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useBlueprint, BPS_STAGE_INFO } from '../BlueprintContext';

// MUI Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ExploreIcon from '@mui/icons-material/Explore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';

// Stage configuration
const STAGE_CONFIG = {
  idea: { label: 'Idea', color: '#D1A73A', icon: LightbulbIcon },
  explore: { label: 'Explore', color: '#5B8A6A', icon: ExploreIcon },
  assess: { label: 'Assess', color: '#6B5B95', icon: AssessmentIcon },
  case: { label: 'Case', color: '#0284c7', icon: DescriptionIcon },
};

// Recommendation configuration
const RECOMMENDATION_CONFIG = {
  proceed: { label: 'Proceed', color: '#5B8A6A', icon: ThumbUpIcon, includeInCase: true },
  iterate: { label: 'Iterate', color: '#C9A227', icon: HelpOutlineIcon, includeInCase: false },
  pivot: { label: 'Pivot', color: '#C9A227', icon: HelpOutlineIcon, includeInCase: false },
  park: { label: 'Park', color: '#9C9A94', icon: PauseCircleIcon, includeInCase: false },
  kill: { label: 'Kill', color: '#A54D4D', icon: CancelIcon, includeInCase: false },
};

export default function SummaryView({
  onSelectInitiative,
  onNavigate,
}) {
  const {
    activeInitiative,
    productIdeas,
    fetchProductIdeas,
    loadingProductIdeas,
    updateProductIdea,
    advanceProductIdeaStage,
  } = useBlueprint();

  const [filter, setFilter] = useState('all'); // 'all', 'proceed', 'other'
  const [selectedIdeas, setSelectedIdeas] = useState(new Set());

  // Fetch product ideas when initiative changes
  useEffect(() => {
    if (activeInitiative?.id) {
      fetchProductIdeas();
    }
  }, [activeInitiative?.id, fetchProductIdeas]);

  // Get all product ideas for this initiative
  const allIdeas = useMemo(() => {
    if (!activeInitiative) return [];
    return productIdeas.filter(pi => pi.initiative_id === activeInitiative.id);
  }, [productIdeas, activeInitiative]);

  // Ideas with "Proceed" recommendation (ready for business case)
  const proceedIdeas = useMemo(() => {
    return allIdeas.filter(pi => pi.assess_data?.recommendation === 'proceed');
  }, [allIdeas]);

  // Ideas in assess stage but with other recommendations
  const otherAssessedIdeas = useMemo(() => {
    return allIdeas.filter(pi =>
      pi.stage === 'assess' &&
      pi.assess_data?.recommendation &&
      pi.assess_data?.recommendation !== 'proceed'
    );
  }, [allIdeas]);

  // Ideas still in discovery (no recommendation yet)
  const inProgressIdeas = useMemo(() => {
    return allIdeas.filter(pi =>
      ['idea', 'explore'].includes(pi.stage) ||
      (pi.stage === 'assess' && !pi.assess_data?.recommendation)
    );
  }, [allIdeas]);

  // Ideas already in business case stage
  const inCaseIdeas = useMemo(() => {
    return allIdeas.filter(pi => pi.stage === 'case');
  }, [allIdeas]);

  // Filtered ideas based on current filter
  const filteredIdeas = useMemo(() => {
    switch (filter) {
      case 'proceed':
        return proceedIdeas;
      case 'in-case':
        return inCaseIdeas;
      case 'other':
        return otherAssessedIdeas;
      default:
        return allIdeas;
    }
  }, [filter, allIdeas, proceedIdeas, inCaseIdeas, otherAssessedIdeas]);

  const handleBack = useCallback(() => {
    onNavigate?.('overview');
  }, [onNavigate]);

  const handleViewIdea = useCallback((ideaId) => {
    onNavigate?.('discovery', { ideaId });
  }, [onNavigate]);

  const handleMoveToCase = useCallback(async (idea) => {
    try {
      await advanceProductIdeaStage(idea.id);
      fetchProductIdeas();
    } catch (err) {
      console.error('Failed to move idea to case:', err);
    }
  }, [advanceProductIdeaStage, fetchProductIdeas]);

  const handleMoveBulkToCase = useCallback(async () => {
    const ideasToMove = proceedIdeas.filter(pi =>
      selectedIdeas.has(pi.id) && pi.stage === 'assess'
    );

    for (const idea of ideasToMove) {
      try {
        await advanceProductIdeaStage(idea.id);
      } catch (err) {
        console.error(`Failed to move idea ${idea.id}:`, err);
      }
    }

    setSelectedIdeas(new Set());
    fetchProductIdeas();
  }, [selectedIdeas, proceedIdeas, advanceProductIdeaStage, fetchProductIdeas]);

  const toggleIdeaSelection = useCallback((ideaId) => {
    setSelectedIdeas(prev => {
      const next = new Set(prev);
      if (next.has(ideaId)) {
        next.delete(ideaId);
      } else {
        next.add(ideaId);
      }
      return next;
    });
  }, []);

  if (!activeInitiative) {
    return (
      <div className="summary-view summary-view--empty">
        <div className="summary-empty-state">
          <DescriptionIcon style={{ fontSize: 48, color: '#C4C2BC' }} />
          <h3>Select an Initiative</h3>
          <p>Choose an initiative to see validated product ideas ready for the business case.</p>
          <button
            className="summary-empty-btn"
            onClick={() => onNavigate?.('overview')}
          >
            View Initiatives
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: allIdeas.length,
    proceed: proceedIdeas.length,
    inCase: inCaseIdeas.length,
    inProgress: inProgressIdeas.length,
    other: otherAssessedIdeas.length,
  };

  const readyToMove = proceedIdeas.filter(pi => pi.stage === 'assess').length;

  return (
    <div className="summary-view">
      {/* Header */}
      <header className="summary-header">
        <button className="summary-back-btn" onClick={handleBack}>
          <ArrowBackIcon style={{ fontSize: 18 }} />
        </button>
        <div className="summary-header-content">
          <span className="summary-header-id">{activeInitiative.display_id}</span>
          <h1 className="summary-header-title">{activeInitiative.name}</h1>
          <p className="summary-header-desc">Review validated ideas and build the business case</p>
        </div>
      </header>

      {/* Stats Banner */}
      <div className="summary-stats-banner">
        <div className="summary-stat summary-stat--highlight">
          <span className="summary-stat-value">{stats.proceed}</span>
          <span className="summary-stat-label">Ready to Proceed</span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-value">{stats.inCase}</span>
          <span className="summary-stat-label">In Business Case</span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-value">{stats.inProgress}</span>
          <span className="summary-stat-label">In Discovery</span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-value">{stats.total}</span>
          <span className="summary-stat-label">Total Ideas</span>
        </div>
      </div>

      {/* Ready to Include Section */}
      {readyToMove > 0 && (
        <div className="summary-action-banner">
          <div className="summary-action-banner-content">
            <CheckCircleIcon style={{ fontSize: 24, color: '#5B8A6A' }} />
            <div>
              <strong>{readyToMove} idea{readyToMove !== 1 ? 's' : ''} validated and ready</strong>
              <p>These ideas have passed assessment with a "Proceed" recommendation</p>
            </div>
          </div>
          <button
            className="summary-action-banner-btn"
            onClick={() => onNavigate?.('case')}
          >
            Build Business Case <ArrowForwardIcon style={{ fontSize: 16 }} />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="summary-filters">
        <button
          className={`summary-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Ideas ({stats.total})
        </button>
        <button
          className={`summary-filter-btn summary-filter-btn--proceed ${filter === 'proceed' ? 'active' : ''}`}
          onClick={() => setFilter('proceed')}
        >
          <ThumbUpIcon style={{ fontSize: 14 }} />
          Proceed ({stats.proceed})
        </button>
        <button
          className={`summary-filter-btn ${filter === 'in-case' ? 'active' : ''}`}
          onClick={() => setFilter('in-case')}
        >
          <DescriptionIcon style={{ fontSize: 14 }} />
          In Case ({stats.inCase})
        </button>
        <button
          className={`summary-filter-btn ${filter === 'other' ? 'active' : ''}`}
          onClick={() => setFilter('other')}
        >
          Other ({stats.other})
        </button>
      </div>

      {/* Ideas List */}
      <div className="summary-ideas-list">
        {loadingProductIdeas ? (
          <div className="summary-loading">Loading ideas...</div>
        ) : filteredIdeas.length === 0 ? (
          <div className="summary-empty-list">
            <p>No ideas match this filter</p>
          </div>
        ) : (
          filteredIdeas.map(idea => {
            const stageConfig = STAGE_CONFIG[idea.stage] || STAGE_CONFIG.idea;
            const StageIcon = stageConfig.icon;
            const recommendation = idea.assess_data?.recommendation;
            const recConfig = recommendation ? RECOMMENDATION_CONFIG[recommendation] : null;
            const RecIcon = recConfig?.icon;
            const isInCase = idea.stage === 'case';
            const canMoveToCase = recommendation === 'proceed' && idea.stage === 'assess';

            // Get feasibility average if available
            const feasibility = idea.assess_data ? Math.round(
              ((idea.assess_data.feasibility_technical || 5) +
               (idea.assess_data.feasibility_market || 5) +
               (idea.assess_data.feasibility_operational || 5) +
               (idea.assess_data.feasibility_financial || 5) +
               (idea.assess_data.feasibility_time || 5)) / 5
            ) : null;

            const iceScore = idea.assess_data ?
              ((idea.assess_data.ice_impact || 5) *
               (idea.assess_data.ice_confidence || 5) *
               (idea.assess_data.ice_ease || 5)) / 25 : null;

            return (
              <div
                key={idea.id}
                className={`summary-idea-card ${isInCase ? 'in-case' : ''} ${canMoveToCase ? 'ready' : ''}`}
              >
                <div className="summary-idea-header">
                  <span
                    className="summary-idea-stage"
                    style={{ '--stage-color': stageConfig.color }}
                  >
                    <StageIcon style={{ fontSize: 14 }} />
                    {stageConfig.label}
                  </span>
                  <span className="summary-idea-id">{idea.display_id}</span>
                  {recConfig && (
                    <span
                      className="summary-idea-rec"
                      style={{ '--rec-color': recConfig.color }}
                    >
                      <RecIcon style={{ fontSize: 14 }} />
                      {recConfig.label}
                    </span>
                  )}
                </div>

                <h3 className="summary-idea-name">{idea.name}</h3>

                {idea.description && (
                  <p className="summary-idea-desc">{idea.description}</p>
                )}

                {/* Assessment metrics (if available) */}
                {(feasibility !== null || iceScore !== null) && (
                  <div className="summary-idea-metrics">
                    {feasibility !== null && (
                      <div className="summary-idea-metric">
                        <span className="summary-idea-metric-label">Feasibility</span>
                        <span
                          className="summary-idea-metric-value"
                          style={{
                            color: feasibility >= 7 ? '#5B8A6A' : feasibility >= 4 ? '#C9A227' : '#A54D4D'
                          }}
                        >
                          {feasibility}/10
                        </span>
                      </div>
                    )}
                    {iceScore !== null && (
                      <div className="summary-idea-metric">
                        <span className="summary-idea-metric-label">ICE</span>
                        <span className="summary-idea-metric-value">{iceScore.toFixed(1)}</span>
                      </div>
                    )}
                    {idea.assess_data?.recommendation_confidence && (
                      <div className="summary-idea-metric">
                        <span className="summary-idea-metric-label">Confidence</span>
                        <span className="summary-idea-metric-value" style={{ textTransform: 'capitalize' }}>
                          {idea.assess_data.recommendation_confidence}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="summary-idea-actions">
                  <button
                    className="summary-idea-action summary-idea-action--view"
                    onClick={() => handleViewIdea(idea.display_id || idea.id)}
                  >
                    View Details
                  </button>
                  {canMoveToCase && (
                    <button
                      className="summary-idea-action summary-idea-action--move"
                      onClick={() => handleMoveToCase(idea)}
                    >
                      <ArrowForwardIcon style={{ fontSize: 14 }} />
                      Add to Business Case
                    </button>
                  )}
                  {isInCase && (
                    <span className="summary-idea-in-case-badge">
                      <CheckCircleIcon style={{ fontSize: 14 }} />
                      Included in Case
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
