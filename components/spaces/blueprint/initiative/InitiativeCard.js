// components/spaces/blueprint/initiative/InitiativeCard.js
// Card component for displaying an initiative summary

import { useMemo } from 'react';
import { StageBadge, StageProgress } from './StageIndicator';
import {
  BPS_HORIZONS,
  calculateSLAStatus,
  checkKillCriteria,
  formatCurrency,
} from '../BlueprintContext';

// MUI Icons
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

export default function InitiativeCard({
  initiative,
  onClick,
  onEdit,
  onDelete,
  onNavigate,
  selected = false,
  compact = false,
  showActions = true,
  className = '',
}) {
  // Compute derived values
  const slaStatus = useMemo(() => calculateSLAStatus(initiative), [initiative]);
  const killCriteria = useMemo(() => checkKillCriteria(initiative), [initiative]);
  const hasKillCriteria = killCriteria.length > 0;

  const isFromEA = initiative.source === 'ea_capability_gap';

  const horizon = initiative.assess?.horizon;
  const horizonInfo = horizon ? BPS_HORIZONS[horizon] : null;

  const overallScore = initiative.assess?.overall_score;
  const marketSize = initiative.explore?.market_sizing?.som;

  // Format date
  const createdDate = initiative.created_at
    ? new Date(initiative.created_at).toLocaleDateString()
    : null;

  if (compact) {
    return (
      <div
        className={`initiative-card initiative-card--compact ${selected ? 'selected' : ''} ${className}`}
        data-stage={initiative.stage || initiative.status || 'idea'}
        onClick={() => onClick?.(initiative)}
      >
        <div className="initiative-card-header">
          <span className="initiative-card-id">{initiative.display_id || initiative.id}</span>
          <StageBadge stage={initiative.status} size="small" />
          {isFromEA && (
            <span
              className="initiative-card-source-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
                background: 'rgba(71, 69, 63, 0.1)',
                color: '#47453F',
                borderRadius: '4px',
                fontSize: '0.625rem',
                fontWeight: 500,
              }}
              title="Generated from EA capability gap"
            >
              <AccountTreeIcon style={{ fontSize: 11 }} />
              EA
            </span>
          )}
        </div>
        <h4 className="initiative-card-title">{initiative.name}</h4>
        <StageProgress currentStage={initiative.status} />
      </div>
    );
  }

  return (
    <div
      className={`initiative-card ${selected ? 'selected' : ''} ${hasKillCriteria ? 'initiative-card--kill-criteria' : ''} ${className}`}
      data-stage={initiative.stage || initiative.status || 'idea'}
      onClick={() => onClick?.(initiative)}
    >
      {/* Header */}
      <div className="initiative-card-header">
        <div className="initiative-card-header-left">
          <span className="initiative-card-id">{initiative.display_id || initiative.id}</span>
          <StageBadge stage={initiative.status} />
          {horizonInfo && (
            <span className="initiative-card-horizon">{horizonInfo.name}</span>
          )}
          {isFromEA && (
            <span
              className="initiative-card-source-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 8px',
                background: 'rgba(71, 69, 63, 0.1)',
                color: '#47453F',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontWeight: 500,
                lineHeight: 1,
              }}
              title="Generated from EA capability gap"
            >
              <AccountTreeIcon style={{ fontSize: 12 }} />
              From EA
            </span>
          )}
        </div>
        {showActions && (
          <div className="initiative-card-actions">
            <button
              className="initiative-card-action-btn"
              onClick={(e) => { e.stopPropagation(); onEdit?.(initiative); }}
              title="Edit"
            >
              <EditIcon fontSize="small" />
            </button>
            <button
              className="initiative-card-action-btn"
              onClick={(e) => { e.stopPropagation(); onNavigate?.(initiative); }}
              title="Open"
            >
              <LaunchIcon fontSize="small" />
            </button>
            <button
              className="initiative-card-action-btn initiative-card-action-btn--danger"
              onClick={(e) => { e.stopPropagation(); onDelete?.(initiative); }}
              title="Delete"
            >
              <DeleteIcon fontSize="small" />
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="initiative-card-title">{initiative.name}</h3>

      {/* Description */}
      {initiative.idea?.description && (
        <p className="initiative-card-description">
          {initiative.idea.description.length > 120
            ? `${initiative.idea.description.substring(0, 120)}...`
            : initiative.idea.description}
        </p>
      )}

      {/* Metrics row */}
      <div className="initiative-card-metrics">
        {overallScore !== undefined && (
          <div className="initiative-card-metric">
            <TrendingUpIcon fontSize="small" />
            <span>{overallScore}%</span>
          </div>
        )}
        {marketSize && (
          <div className="initiative-card-metric">
            <span className="initiative-card-metric-label">SOM</span>
            <span>{formatCurrency(marketSize)}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <StageProgress currentStage={initiative.status} />

      {/* Footer */}
      <div className="initiative-card-footer">
        {/* SLA status */}
        <div className={`initiative-card-sla initiative-card-sla--${slaStatus}`}>
          <AccessTimeIcon fontSize="small" />
          <span>
            {slaStatus === 'on_track' ? 'On Track' :
             slaStatus === 'at_risk' ? 'At Risk' : 'SLA Breached'}
          </span>
        </div>

        {/* Kill criteria warning */}
        {hasKillCriteria && (
          <div className="initiative-card-warning">
            <WarningIcon fontSize="small" />
            <span>{killCriteria.length} kill {killCriteria.length === 1 ? 'criterion' : 'criteria'}</span>
          </div>
        )}

        {/* Submitter */}
        {initiative.idea?.submitter && (
          <div className="initiative-card-submitter">
            <PersonIcon fontSize="small" />
            <span>{initiative.idea.submitter}</span>
          </div>
        )}

        {/* Date */}
        {createdDate && (
          <span className="initiative-card-date">{createdDate}</span>
        )}
      </div>
    </div>
  );
}

// List variant for table/list views
export function InitiativeRow({
  initiative,
  onClick,
  onEdit,
  onDelete,
  selected = false,
}) {
  const slaStatus = calculateSLAStatus(initiative);
  const overallScore = initiative.assess?.overall_score;

  return (
    <tr
      className={`initiative-row ${selected ? 'selected' : ''}`}
      onClick={() => onClick?.(initiative)}
    >
      <td className="initiative-row-id">{initiative.display_id || initiative.id}</td>
      <td className="initiative-row-name">
        {initiative.name}
        {initiative.source === 'ea_capability_gap' && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              marginLeft: '6px',
              padding: '1px 5px',
              background: 'rgba(71, 69, 63, 0.1)',
              color: '#47453F',
              borderRadius: '4px',
              fontSize: '0.625rem',
              fontWeight: 500,
              verticalAlign: 'middle',
            }}
            title="Generated from EA capability gap"
          >
            <AccountTreeIcon style={{ fontSize: 10 }} />
            EA
          </span>
        )}
      </td>
      <td className="initiative-row-stage">
        <StageBadge stage={initiative.status} size="small" />
      </td>
      <td className="initiative-row-score">
        {overallScore !== undefined ? `${overallScore}%` : '-'}
      </td>
      <td className={`initiative-row-sla initiative-row-sla--${slaStatus}`}>
        {slaStatus === 'on_track' ? 'On Track' :
         slaStatus === 'at_risk' ? 'At Risk' : 'Breached'}
      </td>
      <td className="initiative-row-actions">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit?.(initiative); }}
          title="Edit"
        >
          <EditIcon fontSize="small" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(initiative); }}
          title="Delete"
        >
          <DeleteIcon fontSize="small" />
        </button>
      </td>
    </tr>
  );
}
