// components/portfolio/StackRank.js
// Stack Rank - Ordered priority list with drag-drop reordering
// "If we can only do 5, which 5?"

import { useState, useCallback, useMemo } from 'react';
import { usePortfolio } from './PortfolioContext';
import { ViewHeader, ContentArea, Button } from '../../ui';

// MUI Icons
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

import {
  INVESTMENT_HORIZONS,
  PORTFOLIO_STAGES,
  TSHIRT_SIZES,
} from '../../../lib/portfolio-types';

// Scoring models
const SCORING_MODELS = {
  manual: { id: 'manual', name: 'Manual Rank', description: 'Drag to reorder' },
  wsjf: { id: 'wsjf', name: 'WSJF Score', description: 'Weighted Shortest Job First' },
  rice: { id: 'rice', name: 'RICE Score', description: 'Reach × Impact × Confidence / Effort' },
};

// Calculate WSJF score
function calculateWSJF(initiative) {
  const scoring = initiative.custom_fields?.scoring;
  if (!scoring) return 0;

  const businessValue = scoring.business_value || 1;
  const timeCriticality = scoring.time_criticality || 1;
  const riskReduction = scoring.risk_reduction || 1;
  const jobSize = TSHIRT_SIZES[scoring.job_size]?.multiplier || 1;

  return (businessValue + timeCriticality + riskReduction) / jobSize;
}

// Calculate RICE score
function calculateRICE(initiative) {
  const scoring = initiative.custom_fields?.scoring;
  if (!scoring) return 0;

  const reach = scoring.reach || 1;
  const impact = scoring.impact || 1;
  const confidence = (scoring.confidence_pct || 50) / 100;
  const effort = scoring.effort || 1;

  return (reach * impact * confidence) / effort;
}

// Stack rank item
function StackRankItem({
  initiative,
  rank,
  isAboveCutLine,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onClick,
  scoringModel,
}) {
  const horizon = INVESTMENT_HORIZONS[initiative.custom_fields?.time_horizon];
  const stage = PORTFOLIO_STAGES[initiative.custom_fields?.stage];
  const size = TSHIRT_SIZES[initiative.custom_fields?.size];

  // Calculate score based on model
  const score = useMemo(() => {
    if (scoringModel === 'wsjf') return calculateWSJF(initiative);
    if (scoringModel === 'rice') return calculateRICE(initiative);
    return initiative.custom_fields?.manual_rank || rank;
  }, [initiative, scoringModel, rank]);

  return (
    <div
      className={`stackrank-item ${isDragging ? 'stackrank-item--dragging' : ''} ${
        isAboveCutLine ? 'stackrank-item--above-cut' : 'stackrank-item--below-cut'
      }`}
      draggable={scoringModel === 'manual'}
      onDragStart={(e) => onDragStart(e, initiative.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, initiative.id)}
      onClick={() => onClick?.(initiative)}
    >
      <div className="stackrank-item__drag">
        <DragIndicatorIcon fontSize="small" />
      </div>
      <div className="stackrank-item__rank">
        {rank}
      </div>
      <div className="stackrank-item__content">
        <div className="stackrank-item__name">{initiative.name}</div>
        <div className="stackrank-item__meta">
          <span className="stackrank-item__horizon" style={{ background: horizon?.color }}>
            {horizon?.shortName || 'H?'}
          </span>
          <span className="stackrank-item__stage" style={{ color: stage?.color }}>
            {stage?.name}
          </span>
          {size && (
            <span className="stackrank-item__size">{size.name}</span>
          )}
        </div>
      </div>
      <div className="stackrank-item__score">
        <span className="stackrank-item__score-value">
          {typeof score === 'number' ? score.toFixed(1) : score}
        </span>
        <span className="stackrank-item__score-label">
          {scoringModel === 'wsjf' ? 'WSJF' : scoringModel === 'rice' ? 'RICE' : '#'}
        </span>
      </div>
      <div className="stackrank-item__status">
        {isAboveCutLine ? (
          <CheckCircleIcon style={{ color: '#10b981' }} fontSize="small" />
        ) : (
          <WarningIcon style={{ color: '#f59e0b' }} fontSize="small" />
        )}
      </div>
    </div>
  );
}

export default function StackRank({ onSelectItem }) {
  const { initiatives, updateArtefact } = usePortfolio();

  // State
  const [scoringModel, setScoringModel] = useState('manual');
  const [cutLinePosition, setCutLinePosition] = useState(5);
  const [draggedId, setDraggedId] = useState(null);
  const [filterStage, setFilterStage] = useState('all');
  const [filterHorizon, setFilterHorizon] = useState('all');

  // Filter initiatives
  const filteredInitiatives = useMemo(() => {
    return initiatives.filter(i => {
      if (filterStage !== 'all' && i.custom_fields?.stage !== filterStage) return false;
      if (filterHorizon !== 'all' && i.custom_fields?.time_horizon !== filterHorizon) return false;
      return true;
    });
  }, [initiatives, filterStage, filterHorizon]);

  // Sort initiatives based on scoring model
  const sortedInitiatives = useMemo(() => {
    const sorted = [...filteredInitiatives];

    if (scoringModel === 'wsjf') {
      sorted.sort((a, b) => calculateWSJF(b) - calculateWSJF(a));
    } else if (scoringModel === 'rice') {
      sorted.sort((a, b) => calculateRICE(b) - calculateRICE(a));
    } else {
      // Manual: sort by manual_rank, then by creation date
      sorted.sort((a, b) => {
        const rankA = a.custom_fields?.manual_rank ?? Infinity;
        const rankB = b.custom_fields?.manual_rank ?? Infinity;
        if (rankA !== rankB) return rankA - rankB;
        return new Date(a.created_at) - new Date(b.created_at);
      });
    }

    return sorted;
  }, [filteredInitiatives, scoringModel]);

  // Drag handlers
  const handleDragStart = useCallback((e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    // Find positions
    const draggedIndex = sortedInitiatives.findIndex(i => i.id === draggedId);
    const targetIndex = sortedInitiatives.findIndex(i => i.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      return;
    }

    // Reorder and update ranks
    const newOrder = [...sortedInitiatives];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    // Update manual_rank for all affected items
    if (updateArtefact) {
      for (let i = 0; i < newOrder.length; i++) {
        const initiative = newOrder[i];
        if (initiative.custom_fields?.manual_rank !== i + 1) {
          await updateArtefact(initiative.id, {
            custom_fields: {
              ...initiative.custom_fields,
              manual_rank: i + 1,
            },
          });
        }
      }
    }

    setDraggedId(null);
  }, [draggedId, sortedInitiatives, updateArtefact]);

  // Cut line drag
  const handleCutLineDrag = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleCutLineDragOver = useCallback((e, index) => {
    e.preventDefault();
    setCutLinePosition(index + 1);
  }, []);

  // Stats
  const aboveCutCount = Math.min(cutLinePosition, sortedInitiatives.length);
  const belowCutCount = Math.max(0, sortedInitiatives.length - cutLinePosition);

  return (
    <>
      <ViewHeader
        icon={FormatListNumberedIcon}
        iconColor="#8b5cf6"
        title="Stack Rank"
        description="Ordered priority list - if we can only do some, which ones?"
        count={sortedInitiatives.length}
      />
      <ContentArea>
        {/* Toolbar */}
        <div className="stackrank-toolbar">
          <div className="stackrank-toolbar__left">
            {/* Scoring Model */}
            <div className="stackrank-toolbar__group">
              <label>Sort by:</label>
              <select
                value={scoringModel}
                onChange={(e) => setScoringModel(e.target.value)}
                className="stackrank-toolbar__select"
              >
                {Object.values(SCORING_MODELS).map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filters */}
            <div className="stackrank-toolbar__group">
              <label>Stage:</label>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="stackrank-toolbar__select"
              >
                <option value="all">All Stages</option>
                {Object.values(PORTFOLIO_STAGES).map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
            </div>

            <div className="stackrank-toolbar__group">
              <label>Horizon:</label>
              <select
                value={filterHorizon}
                onChange={(e) => setFilterHorizon(e.target.value)}
                className="stackrank-toolbar__select"
              >
                <option value="all">All Horizons</option>
                {Object.values(INVESTMENT_HORIZONS).map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="stackrank-toolbar__right">
            {/* Cut Line Control */}
            <div className="stackrank-toolbar__group">
              <ContentCutIcon fontSize="small" style={{ color: '#ef4444' }} />
              <label>Cut at:</label>
              <input
                type="number"
                min={0}
                max={sortedInitiatives.length}
                value={cutLinePosition}
                onChange={(e) => setCutLinePosition(Math.max(0, parseInt(e.target.value) || 0))}
                className="stackrank-toolbar__input"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="stackrank-summary">
          <div className="stackrank-summary__item stackrank-summary__item--above">
            <CheckCircleIcon fontSize="small" style={{ color: '#10b981' }} />
            <span>{aboveCutCount} above cut line</span>
          </div>
          <div className="stackrank-summary__item stackrank-summary__item--below">
            <WarningIcon fontSize="small" style={{ color: '#f59e0b' }} />
            <span>{belowCutCount} below cut line</span>
          </div>
        </div>

        {/* Stack Rank List */}
        {sortedInitiatives.length === 0 ? (
          <div className="stackrank-empty">
            <RocketLaunchIcon style={{ fontSize: 48, color: '#6b7280', marginBottom: 16 }} />
            <h3>No Initiatives to Rank</h3>
            <p>Create initiatives to start prioritizing them.</p>
          </div>
        ) : (
          <div className="stackrank-list">
            {sortedInitiatives.map((initiative, index) => (
              <div key={initiative.id}>
                <StackRankItem
                  initiative={initiative}
                  rank={index + 1}
                  isAboveCutLine={index < cutLinePosition}
                  isDragging={draggedId === initiative.id}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={onSelectItem}
                  scoringModel={scoringModel}
                />
                {/* Cut Line */}
                {index + 1 === cutLinePosition && index < sortedInitiatives.length - 1 && (
                  <div
                    className="stackrank-cutline"
                    draggable
                    onDrag={handleCutLineDrag}
                    onDragOver={(e) => handleCutLineDragOver(e, index)}
                  >
                    <div className="stackrank-cutline__line" />
                    <span className="stackrank-cutline__label">
                      <ContentCutIcon fontSize="small" />
                      Cut Line
                    </span>
                    <div className="stackrank-cutline__line" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ContentArea>
    </>
  );
}
