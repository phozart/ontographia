// components/spaces/blueprint/initiative/ProductIdeaCard.js
// Card component for displaying a product idea within an initiative

import { useMemo } from 'react';
import { StageBadge, StageProgress } from './StageIndicator';
import {
  BPS_HORIZONS,
  BPS_STAGE_INFO,
  calculateSLAStatus,
  formatCurrency,
} from '../BlueprintContext';

// MUI Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// Stage colors for product ideas
const STAGE_COLORS = {
  idea: '#C9A227',
  explore: '#5B8A6A',
  assess: '#6366f1',
  case: '#0284c7',
  approval: '#059669',
  selected: '#059669',
  parked: '#9C9A94',
  declined: '#A54D4D',
};

export default function ProductIdeaCard({
  productIdea,
  onClick,
  onEdit,
  onDelete,
  onAdvance,
  onSelect,
  selected = false,
  compact = false,
  showActions = true,
  showInitiative = false,
  className = '',
}) {
  // Compute derived values
  const stage = productIdea.stage || 'idea';
  const stageInfo = BPS_STAGE_INFO[stage] || {};
  const horizon = productIdea.horizon;
  const horizonInfo = horizon ? BPS_HORIZONS[horizon] : null;

  // Scoring
  const riceScore = productIdea.rice_score;
  const scoring = productIdea.scoring || {};
  const overallScore = scoring.overall_score;

  // Market sizing from attributes
  const attrs = productIdea.attributes || {};
  const marketSize = attrs.market_size_som;

  // Status indicators
  const isSelected = productIdea.is_selected;
  const isAtRisk = productIdea.days_in_stage > 14;
  const isAIGenerated = productIdea.created_by === 'ai_import';

  // Format date
  const createdDate = productIdea.created_at
    ? new Date(productIdea.created_at).toLocaleDateString()
    : null;

  // Can advance (simplified check - real logic in context)
  const canAdvance = stage !== 'approval' && stage !== 'selected' && stage !== 'declined' && stage !== 'parked';

  if (compact) {
    return (
      <div
        className={`product-idea-card product-idea-card--compact ${selected ? 'selected' : ''} ${isSelected ? 'product-idea-card--is-selected' : ''} ${className}`}
        data-stage={stage}
        style={{ '--stage-color': STAGE_COLORS[stage] }}
        onClick={() => onClick?.(productIdea)}
      >
        <div className="product-idea-card-header">
          <span className="product-idea-card-id">{productIdea.display_id || productIdea.id}</span>
          {isAIGenerated && (
            <span className="product-idea-card-ai-badge" title="AI Generated">
              <AutoAwesomeIcon fontSize="small" />
            </span>
          )}
          {isSelected && (
            <span className="product-idea-card-selected-badge" title="Selected for execution">
              <StarIcon fontSize="small" />
            </span>
          )}
          <StageBadge stage={stage} size="small" />
        </div>
        <h4 className="product-idea-card-title">{productIdea.name}</h4>
        {riceScore !== undefined && riceScore !== null && (
          <div className="product-idea-card-rice">
            <span className="rice-label">RICE</span>
            <span className="rice-value">{riceScore.toFixed(1)}</span>
          </div>
        )}
        <StageProgress currentStage={stage} />
        {canAdvance && showActions && (
          <button
            className="product-idea-advance-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAdvance?.(productIdea);
            }}
            title="Advance to next stage"
          >
            <ArrowForwardIcon fontSize="small" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`product-idea-card ${selected ? 'selected' : ''} ${isSelected ? 'product-idea-card--is-selected' : ''} ${isAtRisk ? 'product-idea-card--at-risk' : ''} ${className}`}
      data-stage={stage}
      style={{ '--stage-color': STAGE_COLORS[stage] }}
      onClick={() => onClick?.(productIdea)}
    >
      {/* Header */}
      <div className="product-idea-card-header">
        <div className="product-idea-card-header-left">
          <span className="product-idea-card-id">{productIdea.display_id || productIdea.id}</span>
          {isAIGenerated && (
            <span className="product-idea-card-ai-badge" title="AI Generated">
              <AutoAwesomeIcon fontSize="small" />
            </span>
          )}
          {isSelected && (
            <span className="product-idea-card-selected-badge" title="Selected for execution">
              <StarIcon fontSize="small" />
            </span>
          )}
          <StageBadge stage={stage} />
          {horizonInfo && (
            <span className="product-idea-card-horizon">{horizonInfo.name}</span>
          )}
        </div>
        {showActions && (
          <div className="product-idea-card-actions">
            {canAdvance && (
              <button
                className="product-idea-card-action-btn product-idea-card-action-btn--advance"
                onClick={(e) => { e.stopPropagation(); onAdvance?.(productIdea); }}
                title="Advance stage"
              >
                <ArrowForwardIcon fontSize="small" />
              </button>
            )}
            {!isSelected && stage === 'approval' && (
              <button
                className="product-idea-card-action-btn product-idea-card-action-btn--select"
                onClick={(e) => { e.stopPropagation(); onSelect?.(productIdea); }}
                title="Select for execution"
              >
                <CheckCircleIcon fontSize="small" />
              </button>
            )}
            <button
              className="product-idea-card-action-btn"
              onClick={(e) => { e.stopPropagation(); onEdit?.(productIdea); }}
              title="Edit"
            >
              <EditIcon fontSize="small" />
            </button>
            <button
              className="product-idea-card-action-btn product-idea-card-action-btn--danger"
              onClick={(e) => { e.stopPropagation(); onDelete?.(productIdea); }}
              title="Delete"
            >
              <DeleteIcon fontSize="small" />
            </button>
          </div>
        )}
      </div>

      {/* Initiative reference */}
      {showInitiative && productIdea.initiative_display_id && (
        <div className="product-idea-card-initiative">
          <span className="initiative-ref">{productIdea.initiative_display_id}</span>
        </div>
      )}

      {/* Title */}
      <h3 className="product-idea-card-title">{productIdea.name}</h3>

      {/* Description */}
      {productIdea.description && (
        <p className="product-idea-card-description">
          {productIdea.description.length > 120
            ? `${productIdea.description.substring(0, 120)}...`
            : productIdea.description}
        </p>
      )}

      {/* Key differences if available */}
      {attrs.key_differences && (
        <div className="product-idea-card-differences">
          <span className="differences-label">Key difference:</span>
          <span className="differences-value">
            {typeof attrs.key_differences === 'string'
              ? attrs.key_differences
              : attrs.key_differences.target_customer || attrs.key_differences.go_to_market || 'Custom approach'}
          </span>
        </div>
      )}

      {/* Metrics row */}
      <div className="product-idea-card-metrics">
        {riceScore !== undefined && riceScore !== null && (
          <div className="product-idea-card-metric product-idea-card-metric--rice">
            <span className="metric-label">RICE</span>
            <span className="metric-value">{riceScore.toFixed(1)}</span>
          </div>
        )}
        {overallScore !== undefined && (
          <div className="product-idea-card-metric">
            <TrendingUpIcon fontSize="small" />
            <span>{overallScore}%</span>
          </div>
        )}
        {marketSize && (
          <div className="product-idea-card-metric">
            <span className="metric-label">SOM</span>
            <span>{formatCurrency(marketSize)}</span>
          </div>
        )}
      </div>

      {/* Pros/Cons summary */}
      {(attrs.pros?.length > 0 || attrs.cons?.length > 0) && (
        <div className="product-idea-card-proscons">
          {attrs.pros?.length > 0 && (
            <span className="proscons-item proscons-item--pro">+{attrs.pros.length} pros</span>
          )}
          {attrs.cons?.length > 0 && (
            <span className="proscons-item proscons-item--con">-{attrs.cons.length} cons</span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <StageProgress currentStage={stage} />

      {/* Footer */}
      <div className="product-idea-card-footer">
        {/* At risk warning */}
        {isAtRisk && (
          <div className="product-idea-card-warning">
            <WarningIcon fontSize="small" />
            <span>{productIdea.days_in_stage}d in stage</span>
          </div>
        )}

        {/* Date */}
        {createdDate && (
          <span className="product-idea-card-date">{createdDate}</span>
        )}
      </div>
    </div>
  );
}

// List variant for table/list views
export function ProductIdeaRow({
  productIdea,
  onClick,
  onEdit,
  onDelete,
  onAdvance,
  selected = false,
  showInitiative = false,
}) {
  const stage = productIdea.stage || 'idea';
  const riceScore = productIdea.rice_score;
  const isSelected = productIdea.is_selected;
  const isAtRisk = productIdea.days_in_stage > 14;

  return (
    <tr
      className={`product-idea-row ${selected ? 'selected' : ''} ${isSelected ? 'product-idea-row--is-selected' : ''} ${isAtRisk ? 'product-idea-row--at-risk' : ''}`}
      onClick={() => onClick?.(productIdea)}
    >
      <td className="product-idea-row-id">
        {productIdea.display_id || productIdea.id}
        {isSelected && <StarIcon fontSize="small" className="selected-icon" />}
      </td>
      {showInitiative && (
        <td className="product-idea-row-initiative">{productIdea.initiative_display_id || '-'}</td>
      )}
      <td className="product-idea-row-name">{productIdea.name}</td>
      <td className="product-idea-row-stage">
        <StageBadge stage={stage} size="small" />
      </td>
      <td className="product-idea-row-rice">
        {riceScore !== undefined && riceScore !== null ? riceScore.toFixed(1) : '-'}
      </td>
      <td className={`product-idea-row-status ${isAtRisk ? 'product-idea-row-status--at-risk' : ''}`}>
        {isAtRisk ? `${productIdea.days_in_stage}d` : 'OK'}
      </td>
      <td className="product-idea-row-actions">
        <button
          onClick={(e) => { e.stopPropagation(); onAdvance?.(productIdea); }}
          title="Advance"
          disabled={stage === 'approval' || stage === 'selected'}
        >
          <ArrowForwardIcon fontSize="small" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit?.(productIdea); }}
          title="Edit"
        >
          <EditIcon fontSize="small" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(productIdea); }}
          title="Delete"
        >
          <DeleteIcon fontSize="small" />
        </button>
      </td>
    </tr>
  );
}
