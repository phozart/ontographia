// components/spaces/blueprint/tools/RICEScoring.js
// RICE Scoring - Reach × Impact × Confidence ÷ Effort

import { useState, useCallback, useMemo } from 'react';
import { useBlueprint, BPS_STAGE_INFO } from '../BlueprintContext';

// MUI Icons
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const IMPACT_OPTIONS = [
  { value: 3, label: 'Massive', description: '3× - Game changer' },
  { value: 2, label: 'High', description: '2× - Significant improvement' },
  { value: 1, label: 'Medium', description: '1× - Notable improvement' },
  { value: 0.5, label: 'Low', description: '0.5× - Minor improvement' },
  { value: 0.25, label: 'Minimal', description: '0.25× - Barely noticeable' },
];

const CONFIDENCE_OPTIONS = [
  { value: 100, label: 'High', description: '100% - Data-backed' },
  { value: 80, label: 'Medium', description: '80% - Good evidence' },
  { value: 50, label: 'Low', description: '50% - Some evidence' },
  { value: 20, label: 'Moonshot', description: '20% - Just a guess' },
];

const EFFORT_OPTIONS = [
  { value: 0.5, label: 'XS', description: '0.5 person-month' },
  { value: 1, label: 'S', description: '1 person-month' },
  { value: 2, label: 'M', description: '2 person-months' },
  { value: 3, label: 'L', description: '3 person-months' },
  { value: 5, label: 'XL', description: '5+ person-months' },
];

export default function RICEScoring() {
  const { initiatives, updateInitiative } = useBlueprint();
  const [hasChanges, setHasChanges] = useState(false);
  const [localScores, setLocalScores] = useState({});
  const [showInfo, setShowInfo] = useState(false);

  // Get active initiatives (not approved/declined)
  const activeInitiatives = useMemo(() => {
    return initiatives.filter(i => !['approved', 'declined'].includes(i.status));
  }, [initiatives]);

  // Calculate RICE scores
  const scoredInitiatives = useMemo(() => {
    return activeInitiatives.map(init => {
      const scores = localScores[init.id] || init.riceScores || {
        reach: 1000,
        impact: 1,
        confidence: 50,
        effort: 2,
      };

      // RICE = Reach × Impact × Confidence / Effort
      const riceScore = (scores.reach * scores.impact * (scores.confidence / 100)) / scores.effort;

      return {
        ...init,
        scores,
        riceScore: Math.round(riceScore),
      };
    }).sort((a, b) => b.riceScore - a.riceScore);
  }, [activeInitiatives, localScores]);

  const handleScoreChange = useCallback((initId, field, value) => {
    setLocalScores(prev => ({
      ...prev,
      [initId]: {
        ...(prev[initId] || initiatives.find(i => i.id === initId)?.riceScores || {}),
        [field]: parseFloat(value),
      },
    }));
    setHasChanges(true);
  }, [initiatives]);

  const handleSaveAll = useCallback(async () => {
    try {
      await Promise.all(
        Object.entries(localScores).map(([initId, scores]) =>
          updateInitiative(initId, { riceScores: scores })
        )
      );
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save scores:', error);
    }
  }, [localScores, updateInitiative]);

  return (
    <div className="rice-scoring">
      <div className="canvas-header">
        <div className="canvas-header-left">
          <AnalyticsIcon />
          <div>
            <h2>RICE Scoring</h2>
            <p>Prioritize initiatives using Reach × Impact × Confidence ÷ Effort</p>
          </div>
        </div>
        <div className="canvas-header-right">
          <button
            className="btn btn-icon"
            onClick={() => setShowInfo(!showInfo)}
            title="Show formula info"
          >
            <InfoIcon />
          </button>
          {hasChanges && (
            <button className="btn btn-primary" onClick={handleSaveAll}>
              <SaveIcon fontSize="small" />
              Save All Scores
            </button>
          )}
        </div>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="rice-info">
          <h4>RICE Scoring Formula</h4>
          <div className="rice-formula">
            RICE Score = (Reach × Impact × Confidence%) ÷ Effort
          </div>
          <div className="rice-factors">
            <div className="rice-factor">
              <strong>Reach</strong>
              <p>How many people will this impact per quarter?</p>
            </div>
            <div className="rice-factor">
              <strong>Impact</strong>
              <p>How much will this move the needle? (0.25× to 3×)</p>
            </div>
            <div className="rice-factor">
              <strong>Confidence</strong>
              <p>How confident are you in these estimates? (20% to 100%)</p>
            </div>
            <div className="rice-factor">
              <strong>Effort</strong>
              <p>How many person-months to complete?</p>
            </div>
          </div>
        </div>
      )}

      {/* Scoring table */}
      <div className="rice-table-container">
        <table className="rice-table">
          <thead>
            <tr>
              <th className="rice-th-rank">#</th>
              <th className="rice-th-initiative">Initiative</th>
              <th className="rice-th-stage">Stage</th>
              <th className="rice-th-score">
                Reach
                <span className="rice-th-hint">people/qtr</span>
              </th>
              <th className="rice-th-score">
                Impact
                <span className="rice-th-hint">multiplier</span>
              </th>
              <th className="rice-th-score">
                Confidence
                <span className="rice-th-hint">%</span>
              </th>
              <th className="rice-th-score">
                Effort
                <span className="rice-th-hint">person-mo</span>
              </th>
              <th className="rice-th-total">RICE Score</th>
            </tr>
          </thead>
          <tbody>
            {scoredInitiatives.map((init, index) => {
              const prevScore = index > 0 ? scoredInitiatives[index - 1].riceScore : null;
              const nextScore = index < scoredInitiatives.length - 1 ? scoredInitiatives[index + 1].riceScore : null;
              const stageInfo = BPS_STAGE_INFO[init.status] || {};

              return (
                <tr key={init.id} className="rice-row">
                  <td className="rice-td-rank">
                    <span className="rice-rank">{index + 1}</span>
                  </td>
                  <td className="rice-td-initiative">
                    <span className="rice-init-id">{init.display_id}</span>
                    <span className="rice-init-name">{init.name}</span>
                  </td>
                  <td className="rice-td-stage">
                    <span
                      className="rice-stage-badge"
                      style={{ backgroundColor: stageInfo.color }}
                    >
                      {stageInfo.name}
                    </span>
                  </td>
                  <td className="rice-td-score">
                    <input
                      type="number"
                      className="rice-input"
                      value={init.scores.reach}
                      onChange={(e) => handleScoreChange(init.id, 'reach', e.target.value)}
                      min="0"
                      step="100"
                    />
                  </td>
                  <td className="rice-td-score">
                    <select
                      className="rice-select"
                      value={init.scores.impact}
                      onChange={(e) => handleScoreChange(init.id, 'impact', e.target.value)}
                    >
                      {IMPACT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} ({opt.value}×)
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="rice-td-score">
                    <select
                      className="rice-select"
                      value={init.scores.confidence}
                      onChange={(e) => handleScoreChange(init.id, 'confidence', e.target.value)}
                    >
                      {CONFIDENCE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} ({opt.value}%)
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="rice-td-score">
                    <select
                      className="rice-select"
                      value={init.scores.effort}
                      onChange={(e) => handleScoreChange(init.id, 'effort', e.target.value)}
                    >
                      {EFFORT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} ({opt.description})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="rice-td-total">
                    <div className="rice-total">
                      <span className="rice-total-value">{init.riceScore}</span>
                      {prevScore && init.riceScore < prevScore && (
                        <TrendingDownIcon className="rice-trend rice-trend--down" />
                      )}
                      {nextScore && init.riceScore > nextScore && (
                        <TrendingUpIcon className="rice-trend rice-trend--up" />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {activeInitiatives.length === 0 && (
        <div className="rice-empty">
          <AnalyticsIcon />
          <h3>No Active Initiatives</h3>
          <p>Create some initiatives to start scoring them</p>
        </div>
      )}
    </div>
  );
}
