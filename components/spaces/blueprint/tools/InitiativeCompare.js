// components/spaces/blueprint/tools/InitiativeCompare.js
// Side-by-side initiative comparison

import { useState, useMemo } from 'react';
import { useBlueprint, BPS_STAGE_INFO, BPS_STAGE_SLAS } from '../BlueprintContext';

// MUI Icons
import CompareIcon from '@mui/icons-material/Compare';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const COMPARISON_FIELDS = [
  { id: 'stage', name: 'Current Stage', type: 'stage' },
  { id: 'daysInStage', name: 'Days in Stage', type: 'number' },
  { id: 'score', name: 'Overall Score', type: 'score' },
  { id: 'riceScore', name: 'RICE Score', type: 'number' },
  { id: 'priorityQuadrant', name: 'Priority Quadrant', type: 'text' },
  { id: 'targetMarket', name: 'Target Market', type: 'text' },
  { id: 'estimatedRevenue', name: 'Est. Revenue', type: 'currency' },
  { id: 'estimatedCost', name: 'Est. Cost', type: 'currency' },
  { id: 'roi', name: 'Est. ROI', type: 'percent' },
  { id: 'confidence', name: 'Confidence', type: 'percent' },
  { id: 'killCriteria', name: 'Kill Criteria Met', type: 'boolean' },
];

export default function InitiativeCompare() {
  const { initiatives } = useBlueprint();
  const [selectedIds, setSelectedIds] = useState([]);

  // Get active initiatives
  const activeInitiatives = useMemo(() => {
    return initiatives.filter(i => !['declined'].includes(i.status));
  }, [initiatives]);

  // Get selected initiatives
  const selectedInitiatives = useMemo(() => {
    return selectedIds.map(id => initiatives.find(i => i.id === id)).filter(Boolean);
  }, [selectedIds, initiatives]);

  const handleAddInitiative = (initId) => {
    if (selectedIds.includes(initId)) return;
    if (selectedIds.length >= 4) return; // Max 4 comparisons
    setSelectedIds(prev => [...prev, initId]);
  };

  const handleRemoveInitiative = (initId) => {
    setSelectedIds(prev => prev.filter(id => id !== initId));
  };

  const getFieldValue = (init, field) => {
    switch (field.id) {
      case 'stage':
        return init.status;
      case 'daysInStage': {
        const stageEntry = init.stageHistory?.find(h => h.stage === init.status);
        const enteredAt = stageEntry?.entered_at
          ? new Date(stageEntry.entered_at)
          : new Date(init.created_at);
        return Math.round((new Date() - enteredAt) / (1000 * 60 * 60 * 24));
      }
      case 'score':
        return init.scoring?.overall || init.score || 0;
      case 'riceScore':
        return init.riceScore || init.riceScores ? calculateRICE(init.riceScores) : null;
      case 'priorityQuadrant':
        return formatQuadrant(init.priorityQuadrant);
      case 'targetMarket':
        return init.targetMarket || init.market?.targetSegment || '—';
      case 'estimatedRevenue':
        return init.financials?.revenue || init.estimatedRevenue || null;
      case 'estimatedCost':
        return init.financials?.cost || init.estimatedCost || null;
      case 'roi': {
        const revenue = init.financials?.revenue || init.estimatedRevenue || 0;
        const cost = init.financials?.cost || init.estimatedCost || 1;
        return cost > 0 ? Math.round(((revenue - cost) / cost) * 100) : null;
      }
      case 'confidence':
        return init.confidence || init.riceScores?.confidence || null;
      case 'killCriteria':
        return init.killCriteriaMet?.length > 0;
      default:
        return init[field.id] || '—';
    }
  };

  const renderFieldValue = (value, field, allValues) => {
    if (value === null || value === undefined) return <span className="compare-empty">—</span>;

    switch (field.type) {
      case 'stage': {
        const stageInfo = BPS_STAGE_INFO[value] || {};
        return (
          <span
            className="compare-stage-badge"
            style={{ backgroundColor: stageInfo.color }}
          >
            {stageInfo.name || value}
          </span>
        );
      }
      case 'number': {
        const max = Math.max(...allValues.filter(v => v !== null));
        const isMax = value === max && allValues.filter(v => v === max).length === 1;
        return (
          <span className={`compare-number ${isMax ? 'compare-number--best' : ''}`}>
            {value.toLocaleString()}
          </span>
        );
      }
      case 'score': {
        const max = Math.max(...allValues.filter(v => v !== null));
        const isMax = value === max && allValues.filter(v => v === max).length === 1;
        return (
          <div className={`compare-score ${isMax ? 'compare-score--best' : ''}`}>
            <span className="compare-score-value">{value}</span>
            <div className="compare-score-bar">
              <div className="compare-score-fill" style={{ width: `${value}%` }} />
            </div>
          </div>
        );
      }
      case 'currency':
        return (
          <span className="compare-currency">
            ${(value / 1000).toFixed(0)}k
          </span>
        );
      case 'percent': {
        const max = Math.max(...allValues.filter(v => v !== null));
        const isMax = value === max && allValues.filter(v => v === max).length === 1;
        return (
          <span className={`compare-percent ${isMax ? 'compare-percent--best' : ''}`}>
            {value}%
          </span>
        );
      }
      case 'boolean':
        return value ? (
          <span className="compare-bool compare-bool--negative">
            <CancelIcon fontSize="small" /> Yes
          </span>
        ) : (
          <span className="compare-bool compare-bool--positive">
            <CheckCircleIcon fontSize="small" /> No
          </span>
        );
      default:
        return <span>{value}</span>;
    }
  };

  return (
    <div className="initiative-compare">
      <div className="canvas-header">
        <div className="canvas-header-left">
          <CompareIcon />
          <div>
            <h2>Initiative Compare</h2>
            <p>Side-by-side comparison of up to 4 initiatives</p>
          </div>
        </div>
      </div>

      {/* Initiative selector */}
      <div className="compare-selector">
        <h3>Select Initiatives to Compare</h3>
        <div className="compare-selector-list">
          {activeInitiatives.map(init => {
            const isSelected = selectedIds.includes(init.id);
            const stageInfo = BPS_STAGE_INFO[init.status] || {};

            return (
              <button
                key={init.id}
                className={`compare-selector-item ${isSelected ? 'selected' : ''}`}
                onClick={() => isSelected ? handleRemoveInitiative(init.id) : handleAddInitiative(init.id)}
                disabled={!isSelected && selectedIds.length >= 4}
              >
                <span
                  className="compare-selector-stage"
                  style={{ backgroundColor: stageInfo.color }}
                />
                <span className="compare-selector-id">{init.display_id}</span>
                <span className="compare-selector-name">{init.name}</span>
                {isSelected && <CloseIcon fontSize="small" />}
                {!isSelected && <AddIcon fontSize="small" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison table */}
      {selectedInitiatives.length > 0 ? (
        <div className="compare-table-container">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="compare-th-field">Attribute</th>
                {selectedInitiatives.map(init => {
                  const stageInfo = BPS_STAGE_INFO[init.status] || {};
                  return (
                    <th key={init.id} className="compare-th-initiative">
                      <button
                        className="compare-remove"
                        onClick={() => handleRemoveInitiative(init.id)}
                      >
                        <CloseIcon fontSize="small" />
                      </button>
                      <span className="compare-th-id">{init.display_id}</span>
                      <span className="compare-th-name">{init.name}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_FIELDS.map(field => {
                const values = selectedInitiatives.map(init => getFieldValue(init, field));

                return (
                  <tr key={field.id} className="compare-row">
                    <td className="compare-td-field">
                      <span>{field.name}</span>
                    </td>
                    {selectedInitiatives.map((init, idx) => (
                      <td key={init.id} className="compare-td-value">
                        {renderFieldValue(values[idx], field, values)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="compare-empty-state">
          <CompareIcon />
          <h3>Select Initiatives to Compare</h3>
          <p>Choose 2-4 initiatives from the list above to see them side by side</p>
        </div>
      )}
    </div>
  );
}

// Helper functions
function calculateRICE(scores) {
  if (!scores) return null;
  const { reach = 0, impact = 1, confidence = 50, effort = 1 } = scores;
  return Math.round((reach * impact * (confidence / 100)) / effort);
}

function formatQuadrant(quadrant) {
  const names = {
    'quick-wins': 'Quick Wins',
    'big-bets': 'Big Bets',
    'fill-ins': 'Fill-Ins',
    'money-pit': 'Money Pit',
  };
  return names[quadrant] || '—';
}
