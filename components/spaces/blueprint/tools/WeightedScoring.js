// components/spaces/blueprint/tools/WeightedScoring.js
// Custom weighted scoring with configurable criteria

import { useState, useCallback, useMemo } from 'react';
import { useBlueprint, BPS_STAGE_INFO } from '../BlueprintContext';

// MUI Icons
import BalanceIcon from '@mui/icons-material/Balance';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';

const DEFAULT_CRITERIA = [
  { id: 'strategic-fit', name: 'Strategic Fit', weight: 25, description: 'Alignment with company strategy' },
  { id: 'customer-impact', name: 'Customer Impact', weight: 25, description: 'Value delivered to customers' },
  { id: 'revenue-potential', name: 'Revenue Potential', weight: 20, description: 'Expected revenue contribution' },
  { id: 'feasibility', name: 'Feasibility', weight: 15, description: 'Technical and resource feasibility' },
  { id: 'time-to-market', name: 'Time to Market', weight: 15, description: 'Speed of delivery' },
];

export default function WeightedScoring() {
  const { initiatives, updateInitiative } = useBlueprint();
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [showSettings, setShowSettings] = useState(false);
  const [localScores, setLocalScores] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [newCriterion, setNewCriterion] = useState({ name: '', weight: 10, description: '' });

  // Get active initiatives
  const activeInitiatives = useMemo(() => {
    return initiatives.filter(i => !['approved', 'declined'].includes(i.status));
  }, [initiatives]);

  // Calculate total weights
  const totalWeight = useMemo(() => {
    return criteria.reduce((sum, c) => sum + c.weight, 0);
  }, [criteria]);

  // Calculate weighted scores for each initiative
  const scoredInitiatives = useMemo(() => {
    return activeInitiatives.map(init => {
      const scores = localScores[init.id] || init.weightedScores || {};

      // Calculate weighted total
      let weightedTotal = 0;
      criteria.forEach(c => {
        const score = scores[c.id] || 0;
        weightedTotal += (score * c.weight) / 100;
      });

      // Normalize to 0-100 scale
      const normalizedScore = totalWeight > 0 ? Math.round((weightedTotal / totalWeight) * 100) : 0;

      return {
        ...init,
        scores,
        weightedScore: normalizedScore,
      };
    }).sort((a, b) => b.weightedScore - a.weightedScore);
  }, [activeInitiatives, localScores, criteria, totalWeight]);

  const handleScoreChange = useCallback((initId, criterionId, value) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setLocalScores(prev => ({
      ...prev,
      [initId]: {
        ...(prev[initId] || {}),
        [criterionId]: numValue,
      },
    }));
    setHasChanges(true);
  }, []);

  const handleWeightChange = useCallback((criterionId, weight) => {
    setCriteria(prev => prev.map(c =>
      c.id === criterionId ? { ...c, weight: Math.max(0, parseInt(weight) || 0) } : c
    ));
    setHasChanges(true);
  }, []);

  const handleAddCriterion = useCallback(() => {
    if (!newCriterion.name.trim()) return;

    setCriteria(prev => [...prev, {
      ...newCriterion,
      id: `custom-${Date.now()}`,
    }]);
    setNewCriterion({ name: '', weight: 10, description: '' });
    setHasChanges(true);
  }, [newCriterion]);

  const handleRemoveCriterion = useCallback((criterionId) => {
    setCriteria(prev => prev.filter(c => c.id !== criterionId));
    setHasChanges(true);
  }, []);

  const handleSaveAll = useCallback(async () => {
    try {
      await Promise.all(
        Object.entries(localScores).map(([initId, scores]) =>
          updateInitiative(initId, { weightedScores: scores })
        )
      );
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save scores:', error);
    }
  }, [localScores, updateInitiative]);

  return (
    <div className="weighted-scoring">
      <div className="canvas-header">
        <div className="canvas-header-left">
          <BalanceIcon />
          <div>
            <h2>Weighted Scoring</h2>
            <p>Score initiatives against custom criteria with configurable weights</p>
          </div>
        </div>
        <div className="canvas-header-right">
          <button
            className={`btn btn-secondary ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
          >
            <SettingsIcon fontSize="small" />
            Criteria
          </button>
          {hasChanges && (
            <button className="btn btn-primary" onClick={handleSaveAll}>
              <SaveIcon fontSize="small" />
              Save All
            </button>
          )}
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="weighted-settings">
          <h3>Scoring Criteria</h3>
          <p className="weighted-settings-hint">
            Total weight: {totalWeight}% {totalWeight !== 100 && <span className="text-warning">(should be 100%)</span>}
          </p>

          <div className="weighted-criteria-list">
            {criteria.map(c => (
              <div key={c.id} className="weighted-criterion-config">
                <input
                  type="text"
                  className="form-input weighted-criterion-name"
                  value={c.name}
                  onChange={(e) => setCriteria(prev => prev.map(cr =>
                    cr.id === c.id ? { ...cr, name: e.target.value } : cr
                  ))}
                />
                <input
                  type="number"
                  className="form-input weighted-criterion-weight"
                  value={c.weight}
                  onChange={(e) => handleWeightChange(c.id, e.target.value)}
                  min="0"
                  max="100"
                />
                <span className="weighted-criterion-percent">%</span>
                <button
                  className="btn btn-icon btn-danger"
                  onClick={() => handleRemoveCriterion(c.id)}
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </div>
            ))}
          </div>

          <div className="weighted-add-criterion">
            <input
              type="text"
              className="form-input"
              placeholder="Criterion name"
              value={newCriterion.name}
              onChange={(e) => setNewCriterion(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="number"
              className="form-input weighted-criterion-weight"
              value={newCriterion.weight}
              onChange={(e) => setNewCriterion(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
              min="0"
              max="100"
            />
            <span className="weighted-criterion-percent">%</span>
            <button className="btn btn-secondary" onClick={handleAddCriterion}>
              <AddIcon fontSize="small" />
              Add
            </button>
          </div>
        </div>
      )}

      {/* Scoring table */}
      <div className="weighted-table-container">
        <table className="weighted-table">
          <thead>
            <tr>
              <th className="weighted-th-rank">#</th>
              <th className="weighted-th-initiative">Initiative</th>
              <th className="weighted-th-stage">Stage</th>
              {criteria.map(c => (
                <th key={c.id} className="weighted-th-criterion">
                  <span className="weighted-th-name">{c.name}</span>
                  <span className="weighted-th-weight">{c.weight}%</span>
                </th>
              ))}
              <th className="weighted-th-total">Score</th>
            </tr>
          </thead>
          <tbody>
            {scoredInitiatives.map((init, index) => {
              const stageInfo = BPS_STAGE_INFO[init.status] || {};

              return (
                <tr key={init.id} className="weighted-row">
                  <td className="weighted-td-rank">
                    <span className="weighted-rank">{index + 1}</span>
                  </td>
                  <td className="weighted-td-initiative">
                    <span className="weighted-init-id">{init.display_id}</span>
                    <span className="weighted-init-name">{init.name}</span>
                  </td>
                  <td className="weighted-td-stage">
                    <span
                      className="weighted-stage-badge"
                      style={{ backgroundColor: stageInfo.color }}
                    >
                      {stageInfo.name}
                    </span>
                  </td>
                  {criteria.map(c => (
                    <td key={c.id} className="weighted-td-score">
                      <input
                        type="number"
                        className="weighted-input"
                        value={init.scores[c.id] || ''}
                        onChange={(e) => handleScoreChange(init.id, c.id, e.target.value)}
                        min="0"
                        max="100"
                        placeholder="0"
                      />
                    </td>
                  ))}
                  <td className="weighted-td-total">
                    <div className="weighted-total">
                      <span className="weighted-total-value">{init.weightedScore}</span>
                      <div className="weighted-total-bar">
                        <div
                          className="weighted-total-fill"
                          style={{ width: `${init.weightedScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {activeInitiatives.length === 0 && (
        <div className="weighted-empty">
          <BalanceIcon />
          <h3>No Active Initiatives</h3>
          <p>Create some initiatives to start scoring them</p>
        </div>
      )}
    </div>
  );
}
