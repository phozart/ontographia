// components/spaces/blueprint/shared/ScoringPanel.js
// Reusable scoring interface for initiative assessment

import { useState, useMemo, useCallback } from 'react';
import { BPS_SCORING_CRITERIA, BPS_RECOMMENDATIONS, BPS_SCORE_ANCHORS } from '../BlueprintContext';
import { calculateOverallScore, BPS_CONFIDENCE_LEVELS } from '../../../../lib/blueprint-types';

// MUI Icons
import AssessmentIcon from '@mui/icons-material/Assessment';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function ScoringPanel({
  initialScores = {},
  onSave,
  onScoresChange,
  saving = false,
  readOnly = false,
  showRecommendation = true,
  compact = false,
}) {
  const [scores, setScores] = useState(() => {
    const initial = {};
    Object.keys(BPS_SCORING_CRITERIA).forEach(key => {
      initial[key] = initialScores[key] ?? 50;
    });
    return initial;
  });

  const [expandedCriteria, setExpandedCriteria] = useState({});

  // Track which criteria the user has actively scored (changed from default)
  const [touchedCriteria, setTouchedCriteria] = useState(() => {
    // Pre-mark criteria that had non-default initial scores as touched
    const touched = {};
    Object.keys(BPS_SCORING_CRITERIA).forEach(key => {
      if (initialScores[key] !== undefined) {
        touched[key] = true;
      }
    });
    return touched;
  });

  const scoringComplete = useMemo(
    () => Object.keys(BPS_SCORING_CRITERIA).every(k => touchedCriteria[k]),
    [touchedCriteria]
  );

  // Shuffle criterion order once per mount to reduce order bias
  const shuffledCriteria = useMemo(() => {
    const entries = Object.entries(BPS_SCORING_CRITERIA);
    // Fisher-Yates shuffle (stable per mount, not per render)
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }
    return entries;
  }, []); // Empty deps = shuffle once per mount

  const [rationales, setRationales] = useState(() =>
    initialScores.rationales || {}
  );
  const [confidences, setConfidences] = useState(() =>
    initialScores.confidences || {}
  );

  // Calculate overall score
  const overallScore = useMemo(
    () => calculateOverallScore(scores),
    [scores]
  );

  // Determine recommendation
  const recommendation = useMemo(() => {
    if (overallScore >= 70) return 'proceed';
    if (overallScore >= 50) return 'conditional';
    if (overallScore >= 30) return 'pivot';
    return 'stop';
  }, [overallScore]);

  const handleScoreChange = useCallback((criterion, value) => {
    const newScores = { ...scores, [criterion]: value };
    setScores(newScores);
    setTouchedCriteria(prev => ({ ...prev, [criterion]: true }));
    onScoresChange?.(newScores, calculateOverallScore(newScores));
  }, [scores, onScoresChange]);

  const handleRationaleChange = useCallback((criterion, value) => {
    setRationales(prev => ({ ...prev, [criterion]: value }));
  }, []);

  const handleConfidenceChange = useCallback((criterion, value) => {
    setConfidences(prev => ({ ...prev, [criterion]: value }));
  }, []);

  const handleSave = useCallback(() => {
    onSave?.({
      criteria: scores,
      overall_score: overallScore,
      recommendation,
      rationales,
      confidences,
    });
  }, [scores, overallScore, recommendation, rationales, confidences, onSave]);

  const toggleCriteriaExpanded = useCallback((criterion) => {
    setExpandedCriteria(prev => ({
      ...prev,
      [criterion]: !prev[criterion],
    }));
  }, []);

  const getScoreColor = (score) => {
    if (score >= 70) return '#5B8A6A';
    if (score >= 50) return '#C9A227';
    if (score >= 30) return '#E67E22';
    return '#A54D4D';
  };

  return (
    <div className={`scoring-panel ${compact ? 'scoring-panel--compact' : ''}`}>
      <div className="scoring-panel-header">
        <AssessmentIcon />
        <h3>Strategic Assessment</h3>
      </div>

      {/* Overall Score */}
      <div className="scoring-panel-overall">
        <div
          className="scoring-panel-overall-score"
          style={{ borderColor: scoringComplete ? getScoreColor(overallScore) : '#9C9A94' }}
        >
          <span
            className="scoring-panel-overall-value"
            style={{ color: scoringComplete ? getScoreColor(overallScore) : '#9C9A94' }}
          >
            {scoringComplete ? overallScore : '--'}
          </span>
          <span className="scoring-panel-overall-label">
            {scoringComplete ? 'Overall Score' : 'Score all criteria to see result'}
          </span>
        </div>

        {showRecommendation && scoringComplete && (
          <div
            className="scoring-panel-recommendation"
            style={{
              backgroundColor: BPS_RECOMMENDATIONS[recommendation]?.color + '15',
              borderColor: BPS_RECOMMENDATIONS[recommendation]?.color,
            }}
          >
            <span
              className="scoring-panel-recommendation-label"
              style={{ color: BPS_RECOMMENDATIONS[recommendation]?.color }}
            >
              {BPS_RECOMMENDATIONS[recommendation]?.name}
            </span>
            <span className="scoring-panel-recommendation-description">
              {BPS_RECOMMENDATIONS[recommendation]?.description}
            </span>
          </div>
        )}
      </div>

      {/* Criteria */}
      <div className="scoring-panel-criteria">
        {shuffledCriteria.map(([key, criterion]) => {
          const score = scores[key];
          const expanded = expandedCriteria[key];

          return (
            <div key={key} className="scoring-panel-criterion">
              <div
                className="scoring-panel-criterion-header"
                onClick={() => !readOnly && toggleCriteriaExpanded(key)}
              >
                <div className="scoring-panel-criterion-info">
                  <span className="scoring-panel-criterion-name">{criterion.name}</span>
                  <span className="scoring-panel-criterion-weight">
                    Weight: {Math.round(criterion.weight * 100)}%
                  </span>
                </div>
                <div className="scoring-panel-criterion-score">
                  <span
                    className="scoring-panel-criterion-value"
                    style={{ color: getScoreColor(score) }}
                  >
                    {score}
                  </span>
                  {!readOnly && (
                    <button className="scoring-panel-criterion-expand">
                      {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </button>
                  )}
                </div>
              </div>

              {!compact && (
                <div className="scoring-panel-criterion-bar">
                  <div
                    className="scoring-panel-criterion-fill"
                    style={{
                      width: `${score}%`,
                      backgroundColor: getScoreColor(score),
                    }}
                  />
                </div>
              )}

              {!readOnly && (
                <>
                  <input
                    type="range"
                    className="scoring-panel-slider"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => handleScoreChange(key, parseInt(e.target.value, 10))}
                    disabled={readOnly}
                    style={{
                      '--slider-color': getScoreColor(score),
                    }}
                  />

                  {expanded && (
                    <div className="scoring-panel-criterion-details">
                      <p className="scoring-panel-criterion-description">
                        {criterion.description}
                      </p>

                      {BPS_SCORE_ANCHORS[key] ? (
                        <div className="scoring-panel-criterion-anchors">
                          <div className="scoring-panel-anchor">
                            <span className="scoring-panel-anchor-range" style={{ color: '#A54D4D' }}>0-30:</span>
                            <span className="scoring-panel-anchor-desc">{BPS_SCORE_ANCHORS[key].low}</span>
                          </div>
                          <div className="scoring-panel-anchor">
                            <span className="scoring-panel-anchor-range" style={{ color: '#C9A227' }}>30-70:</span>
                            <span className="scoring-panel-anchor-desc">{BPS_SCORE_ANCHORS[key].medium}</span>
                          </div>
                          <div className="scoring-panel-anchor">
                            <span className="scoring-panel-anchor-range" style={{ color: '#5B8A6A' }}>70-100:</span>
                            <span className="scoring-panel-anchor-desc">{BPS_SCORE_ANCHORS[key].high}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="scoring-panel-criterion-scale">
                          <div className="scoring-panel-scale-item">
                            <span className="scoring-panel-scale-range">0-30:</span>
                            <span className="scoring-panel-scale-desc">Low/Weak</span>
                          </div>
                          <div className="scoring-panel-scale-item">
                            <span className="scoring-panel-scale-range">30-50:</span>
                            <span className="scoring-panel-scale-desc">Below Average</span>
                          </div>
                          <div className="scoring-panel-scale-item">
                            <span className="scoring-panel-scale-range">50-70:</span>
                            <span className="scoring-panel-scale-desc">Average/Acceptable</span>
                          </div>
                          <div className="scoring-panel-scale-item">
                            <span className="scoring-panel-scale-range">70-100:</span>
                            <span className="scoring-panel-scale-desc">Strong/Excellent</span>
                          </div>
                        </div>
                      )}

                      {/* Confidence slider */}
                      <div className="scoring-panel-confidence">
                        <label>
                          Confidence: <strong>{confidences[key] || 3}/5</strong>
                          {BPS_CONFIDENCE_LEVELS && (
                            <span className="scoring-panel-confidence-desc">
                              {' '}— {BPS_CONFIDENCE_LEVELS[confidences[key] || 3]?.description || 'Moderate confidence'}
                            </span>
                          )}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={confidences[key] || 3}
                          onChange={(e) => handleConfidenceChange(key, parseInt(e.target.value, 10))}
                          className="scoring-panel-confidence-slider"
                        />
                        <div className="scoring-panel-confidence-labels">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>

                      <div className="scoring-panel-rationale">
                        <label>Rationale (optional)</label>
                        <textarea
                          className="form-textarea"
                          value={rationales[key] || ''}
                          onChange={(e) => handleRationaleChange(key, e.target.value)}
                          placeholder="Why did you give this score?"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Score Legend */}
      <div className="scoring-panel-legend">
        <InfoIcon fontSize="small" />
        <div className="scoring-panel-legend-items">
          <span className="scoring-panel-legend-item" style={{ color: '#A54D4D' }}>0-30: Stop</span>
          <span className="scoring-panel-legend-item" style={{ color: '#E67E22' }}>30-50: Pivot</span>
          <span className="scoring-panel-legend-item" style={{ color: '#C9A227' }}>50-70: Conditional</span>
          <span className="scoring-panel-legend-item" style={{ color: '#5B8A6A' }}>70-100: Proceed</span>
        </div>
      </div>

      {/* Save Button */}
      {!readOnly && onSave && (
        <div className="scoring-panel-actions">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <SaveIcon fontSize="small" />
            {saving ? 'Saving...' : 'Save Assessment'}
          </button>
        </div>
      )}
    </div>
  );
}
