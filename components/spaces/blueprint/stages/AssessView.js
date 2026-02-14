// components/spaces/blueprint/stages/AssessView.js
// Assess stage view - scoring and evaluation of product ideas within an initiative

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useBlueprint, BPS_SCORING_CRITERIA, BPS_HORIZONS, BPS_RECOMMENDATIONS, BPS_STAGE_INFO } from '../BlueprintContext';
import ProductIdeaCard from '../initiative/ProductIdeaCard';
import InitiativeContextBanner from '../shared/InitiativeContextBanner';
import InitiativeSelector from '../shared/InitiativeSelector';

// MUI Icons
import AssessmentIcon from '@mui/icons-material/Assessment';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import LockIcon from '@mui/icons-material/Lock';

const VIEW_STAGE = 'assess';

export default function AssessView({
  onSelectInitiative,
  onEditInitiative,
  onDeleteInitiative,
  onNavigate,
  onAdvanceStage,
}) {
  const {
    activeInitiative,
    productIdeas,
    fetchProductIdeas,
    loadingProductIdeas,
    advanceProductIdeaStage,
    updateProductIdeaScoring,
    canAdvanceStage,
    updateScoring,
    updateInitiative,
    saving,
  } = useBlueprint();

  // Stage locking: read-only if initiative has advanced past this stage
  const isLocked = useMemo(() => {
    if (!activeInitiative) return false;
    const currentOrder = BPS_STAGE_INFO[activeInitiative.stage]?.order || 0;
    const viewOrder = BPS_STAGE_INFO[VIEW_STAGE]?.order || 0;
    return currentOrder > viewOrder;
  }, [activeInitiative]);

  // Filter product ideas to 'assess' stage for this initiative
  const ideasInStage = useMemo(() => {
    if (!activeInitiative) return [];
    return productIdeas.filter(pi =>
      pi.initiative_id === activeInitiative.id &&
      pi.stage === 'assess'
    );
  }, [productIdeas, activeInitiative]);

  // All product ideas for this initiative (for stage progress summary)
  const allIdeasForInitiative = useMemo(() => {
    if (!activeInitiative) return [];
    return productIdeas.filter(pi => pi.initiative_id === activeInitiative.id);
  }, [productIdeas, activeInitiative]);

  // Stage distribution for this initiative
  const stageCounts = useMemo(() => {
    const counts = {};
    allIdeasForInitiative.forEach(pi => {
      const stage = pi.stage || 'idea';
      counts[stage] = (counts[stage] || 0) + 1;
    });
    return counts;
  }, [allIdeasForInitiative]);

  // Stats for ideas in assess stage
  const stats = useMemo(() => ({
    total: ideasInStage.length,
    scored: ideasInStage.filter(i => i.scoring?.overall_score !== undefined).length,
    highScore: ideasInStage.filter(i => (i.scoring?.overall_score || 0) >= 70).length,
    lowScore: ideasInStage.filter(i => (i.scoring?.overall_score || 0) < 50 && i.scoring?.overall_score !== undefined).length,
  }), [ideasInStage]);

  // Selected product idea for scoring
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const selectedIdea = useMemo(() =>
    ideasInStage.find(i => i.id === selectedIdeaId),
    [ideasInStage, selectedIdeaId]
  );

  // Fetch product ideas when initiative changes
  useEffect(() => {
    if (activeInitiative?.id) {
      fetchProductIdeas();
    }
  }, [activeInitiative?.id, fetchProductIdeas]);

  const handleBack = useCallback(() => {
    onNavigate?.('overview');
  }, [onNavigate]);

  const handleAdvance = useCallback(async (productIdea) => {
    await advanceProductIdeaStage(productIdea.id);
  }, [advanceProductIdeaStage]);

  const handleProductIdeaClick = useCallback((productIdea) => {
    setSelectedIdeaId(productIdea.id);
  }, []);

  const handleInitiativeSelect = useCallback((initiative) => {
    if (initiative) {
      onSelectInitiative?.(initiative);
    }
  }, [onSelectInitiative]);

  // No initiative selected - show stage header with selector
  if (!activeInitiative) {
    return (
      <div className="stage-view assess-view">
        <div className="stage-view-header">
          <div className="stage-view-header-left">
            <AssessmentIcon
              className="stage-view-icon"
              style={{ color: BPS_STAGE_INFO.assess?.color || '#6366f1' }}
            />
            <div>
              <h1 className="stage-view-title">Assess Stage</h1>
              <p className="stage-view-subtitle">
                Select an initiative to score and evaluate its product ideas
              </p>
            </div>
          </div>
          <div className="stage-view-header-right">
            <InitiativeSelector
              onSelect={handleInitiativeSelect}
              placeholder="Select initiative..."
            />
          </div>
        </div>

        <div className="stage-view-content">
          <div className="stage-view-select-prompt">
            <div className="stage-view-select-prompt-icon">
              <AssessmentIcon />
            </div>
            <h3>Select an Initiative</h3>
            <p>Use the selector above to choose an initiative, then assess and score its product ideas.</p>
            <button className="btn btn-secondary" onClick={handleBack}>
              Or go to Initiative Board
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stage-view assess-view">
      {/* Initiative Context Banner */}
      <InitiativeContextBanner
        initiative={activeInitiative}
        onBack={handleBack}
      />

      {/* Stage Header */}
      <div className="stage-view-header">
        <div className="stage-view-header-left">
          <AssessmentIcon
            className="stage-view-icon"
            style={{ color: BPS_STAGE_INFO.assess?.color || '#6366f1' }}
          />
          <div>
            <h1 className="stage-view-title">Assess Stage</h1>
            <p className="stage-view-subtitle">
              Evaluate fit and viability • {ideasInStage.length} idea{ideasInStage.length !== 1 ? 's' : ''} to score
            </p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="stage-view-stats">
        <div className="stage-view-stat">
          <span className="stage-view-stat-value">{stats.total}</span>
          <span className="stage-view-stat-label">In Assessment</span>
        </div>
        <div className="stage-view-stat">
          <StarIcon fontSize="small" />
          <span className="stage-view-stat-value">{stats.scored}</span>
          <span className="stage-view-stat-label">Scored</span>
        </div>
        <div className="stage-view-stat">
          <span className="stage-view-stat-value stage-view-stat-value--success">
            {stats.highScore}
          </span>
          <span className="stage-view-stat-label">High Score (70%+)</span>
        </div>
        <div className="stage-view-stat">
          <span className="stage-view-stat-value stage-view-stat-value--danger">
            {stats.lowScore}
          </span>
          <span className="stage-view-stat-label">Low Score (&lt;50%)</span>
        </div>
      </div>

      {/* Stage Progress Summary */}
      {allIdeasForInitiative.length > 0 && (
        <div className="stage-progress-summary">
          {['idea', 'explore', 'assess', 'case', 'approval'].map(stage => {
            const count = stageCounts[stage] || 0;
            const isCurrentStage = stage === 'assess';
            return (
              <button
                key={stage}
                className={`stage-progress-item ${isCurrentStage ? 'active' : ''}`}
                onClick={() => onNavigate?.(stage)}
                style={{ '--stage-color': BPS_STAGE_INFO[stage]?.color }}
              >
                <span className="stage-progress-count">{count}</span>
                <span className="stage-progress-name">{BPS_STAGE_INFO[stage]?.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main content - split view for scoring */}
      <div className="stage-view-split">
        {/* Product ideas list */}
        <div className="stage-view-list">
          {loadingProductIdeas ? (
            <div className="stage-view-loading">Loading product ideas...</div>
          ) : ideasInStage.length === 0 ? (
            <div className="stage-view-empty">
              <AssessmentIcon className="stage-view-empty-icon" />
              <h3>No product ideas in assess stage</h3>
              <p>Advance product ideas from the Explore stage to begin assessment.</p>
              <button className="btn btn-secondary" onClick={() => onNavigate?.('explore')}>
                Go to Explore Stage
              </button>
            </div>
          ) : (
            <div className="product-idea-list">
              {ideasInStage.map(productIdea => (
                <ProductIdeaCard
                  key={productIdea.id}
                  productIdea={productIdea}
                  onClick={handleProductIdeaClick}
                  onAdvance={handleAdvance}
                  compact
                  selected={selectedIdeaId === productIdea.id}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel for scoring */}
        <div className="stage-view-detail">
          {selectedIdea ? (
            <AssessDetailPanel
              productIdea={selectedIdea}
              onUpdateScoring={updateProductIdeaScoring}
              onAdvance={() => handleAdvance(selectedIdea)}
              saving={saving}
            />
          ) : ideasInStage.length > 0 ? (
            <div className="stage-view-detail-empty">
              <p>Select a product idea to score</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Stage guidance */}
      <div className="stage-view-guidance">
        <h4>Assess Stage</h4>
        <p>Score product ideas against key criteria:</p>
        <ul>
          <li>Strategic fit and alignment</li>
          <li>Market potential and size</li>
          <li>Technical feasibility</li>
          <li>Competitive positioning</li>
          <li>Risk assessment</li>
        </ul>
        <p>Ideas scoring 70%+ are strong candidates for business case development.</p>
      </div>
    </div>
  );
}

// Scoring detail panel for product ideas
function AssessDetailPanel({ productIdea, onUpdateScoring, onAdvance, saving }) {
  const [scores, setScores] = useState(() => {
    const initial = {};
    Object.keys(BPS_SCORING_CRITERIA).forEach(key => {
      initial[key] = {
        score: productIdea.scoring?.[key]?.score || 0,
        rationale: productIdea.scoring?.[key]?.rationale || '',
      };
    });
    return initial;
  });

  const [horizon, setHorizon] = useState(productIdea.scoring?.horizon || '');
  const [recommendation, setRecommendation] = useState(productIdea.scoring?.recommendation || '');

  // Sync when productIdea changes
  useEffect(() => {
    const newScores = {};
    Object.keys(BPS_SCORING_CRITERIA).forEach(key => {
      newScores[key] = {
        score: productIdea.scoring?.[key]?.score || 0,
        rationale: productIdea.scoring?.[key]?.rationale || '',
      };
    });
    setScores(newScores);
    setHorizon(productIdea.scoring?.horizon || '');
    setRecommendation(productIdea.scoring?.recommendation || '');
  }, [productIdea.id]);

  // Calculate overall score
  const overallScore = useMemo(() => {
    let totalWeight = 0;
    let weightedSum = 0;

    Object.entries(BPS_SCORING_CRITERIA).forEach(([key, criteria]) => {
      const score = scores[key]?.score || 0;
      weightedSum += score * criteria.weight;
      totalWeight += criteria.weight;
    });

    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 20) : 0;
  }, [scores]);

  const handleScoreChange = useCallback((key, field, value) => {
    setScores(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }, []);

  const handleSave = useCallback(async () => {
    await onUpdateScoring(productIdea.id, {
      ...scores,
      overall_score: overallScore,
      horizon,
      recommendation,
    });
  }, [productIdea.id, scores, overallScore, horizon, recommendation, onUpdateScoring]);

  const canAdvance = overallScore > 0;

  return (
    <div className="assess-detail-panel">
      <div className="assess-detail-header">
        <div>
          <span className="assess-detail-id">{productIdea.product_idea_id}</span>
          <h2>{productIdea.name}</h2>
          {productIdea.tagline && (
            <p className="assess-detail-tagline">{productIdea.tagline}</p>
          )}
        </div>
        <div className="assess-detail-score-badge">
          <span className="assess-detail-score-value">{overallScore}%</span>
          <span className="assess-detail-score-label">Overall</span>
        </div>
      </div>

      {/* Product idea type and risk profile */}
      {(productIdea.technology_posture || productIdea.risk_profile) && (
        <div className="assess-detail-meta">
          {productIdea.technology_posture && (
            <span className="assess-detail-tag">{productIdea.technology_posture.replace(/_/g, ' ')}</span>
          )}
          {productIdea.risk_profile && (
            <span className="assess-detail-tag">{productIdea.risk_profile.replace(/_/g, ' ')}</span>
          )}
        </div>
      )}

      {/* Scoring grid */}
      <div className="assess-scoring-grid">
        {Object.entries(BPS_SCORING_CRITERIA).map(([key, criteria]) => (
          <div key={key} className="assess-score-item">
            <div className="assess-score-header">
              <span className="assess-score-name">{criteria.name}</span>
              <span className="assess-score-weight">({(criteria.weight * 100).toFixed(0)}%)</span>
            </div>
            <p className="assess-score-description">{criteria.description}</p>

            {/* Score slider */}
            <div className="assess-score-slider">
              <input
                type="range"
                min="0"
                max={criteria.maxScore}
                value={scores[key]?.score || 0}
                onChange={(e) => handleScoreChange(key, 'score', parseInt(e.target.value))}
              />
              <span className="assess-score-value">
                {scores[key]?.score || 0}/{criteria.maxScore}
              </span>
            </div>

            {/* Rationale */}
            <textarea
              className="assess-score-rationale"
              placeholder="Rationale (optional)"
              value={scores[key]?.rationale || ''}
              onChange={(e) => handleScoreChange(key, 'rationale', e.target.value)}
              rows={2}
            />
          </div>
        ))}
      </div>

      {/* Horizon selection */}
      <div className="assess-field">
        <label>Innovation Horizon</label>
        <select value={horizon} onChange={(e) => setHorizon(e.target.value)}>
          <option value="">Select horizon...</option>
          {Object.entries(BPS_HORIZONS).map(([id, h]) => (
            <option key={id} value={id}>{h.name} - {h.description}</option>
          ))}
        </select>
      </div>

      {/* Recommendation */}
      <div className="assess-field">
        <label>Recommendation</label>
        <div className="assess-recommendation-buttons">
          {Object.entries(BPS_RECOMMENDATIONS).map(([id, rec]) => (
            <button
              key={id}
              className={`assess-recommendation-btn ${recommendation === id ? 'selected' : ''}`}
              style={{ borderColor: rec.color, color: recommendation === id ? '#fff' : rec.color, backgroundColor: recommendation === id ? rec.color : 'transparent' }}
              onClick={() => setRecommendation(id)}
            >
              {rec.name}
            </button>
          ))}
        </div>
      </div>

      {/* Score interpretation */}
      <div className="assess-interpretation">
        {overallScore >= 70 && (
          <div className="assess-interpretation-item assess-interpretation-item--success">
            <CheckCircleIcon fontSize="small" />
            <span>Strong candidate - recommend proceeding to business case</span>
          </div>
        )}
        {overallScore >= 50 && overallScore < 70 && (
          <div className="assess-interpretation-item assess-interpretation-item--warning">
            <WarningIcon fontSize="small" />
            <span>Moderate score - consider improvements or additional validation</span>
          </div>
        )}
        {overallScore < 50 && overallScore > 0 && (
          <div className="assess-interpretation-item assess-interpretation-item--danger">
            <WarningIcon fontSize="small" />
            <span>Low score - meets kill criteria, recommend declining</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="assess-detail-actions">
        <button className="btn btn-secondary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Scores'}
        </button>
        <button
          className="btn btn-primary"
          onClick={onAdvance}
          disabled={!canAdvance}
          title={canAdvance ? 'Advance to Business Case' : 'Complete scoring first'}
        >
          Advance to Case Stage
        </button>
      </div>
    </div>
  );
}
