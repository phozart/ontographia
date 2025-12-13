// components/dwd/artefacts/DWDArtefactCard.js
// Generic card component for all DWD artefact types

import { useMemo } from 'react';
import { useDWD } from '../DWDContext';

// MUI Icons
import WarningIcon from '@mui/icons-material/Warning';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import TuneIcon from '@mui/icons-material/Tune';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FlagIcon from '@mui/icons-material/Flag';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import StarIcon from '@mui/icons-material/Star';
import FolderIcon from '@mui/icons-material/Folder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ICON_MAP = {
  'dwd_case': FolderIcon,
  'dwd_work_item': AssignmentIcon,
  'dwd_actor': PersonIcon,
  'dwd_signal': WarningIcon,
  'dwd_adjustment': TuneIcon,
  'dwd_learning': LightbulbIcon,
  'dwd_outcome': FlagIcon,
  'dwd_coordination_pattern': SwapHorizIcon,
  'dwd_capability': StarIcon,
};

export default function DWDArtefactCard({
  artefact,
  onSelect,
  onEdit,
  onDelete,
  compact = false,
  showActions = true,
}) {
  const { getTypeDefinition, getRelated, DWD_TYPE_DEFS } = useDWD();

  const typeDef = useMemo(() => {
    return getTypeDefinition(artefact.artefact_type) || DWD_TYPE_DEFS[artefact.artefact_type];
  }, [artefact.artefact_type, getTypeDefinition, DWD_TYPE_DEFS]);

  const relationships = useMemo(() => {
    return getRelated(artefact.id);
  }, [getRelated, artefact.id]);

  const customFields = artefact.custom_fields || {};

  const Icon = ICON_MAP[artefact.artefact_type] || AssignmentIcon;

  // Get status badge info based on type
  const statusBadge = useMemo(() => {
    if (artefact.artefact_type === 'dwd_case') {
      const status = customFields.case_status || 'draft';
      const colors = {
        draft: '#9ca3af',
        active: '#3b82f6',
        observed: '#f59e0b',
        stabilised: '#10b981',
        archived: '#6b7280',
      };
      return { label: status, color: colors[status] || '#9ca3af' };
    }
    if (artefact.artefact_type === 'dwd_adjustment') {
      const status = customFields.adjustment_status || 'proposed';
      const colors = {
        proposed: '#9ca3af',
        trying: '#f59e0b',
        adopted: '#10b981',
        reverted: '#ef4444',
      };
      return { label: status, color: colors[status] || '#9ca3af' };
    }
    if (artefact.artefact_type === 'dwd_signal') {
      const impact = customFields.impact || 'medium';
      const colors = {
        low: '#10b981',
        medium: '#f59e0b',
        high: '#ef4444',
      };
      return { label: `${impact} impact`, color: colors[impact] || '#f59e0b' };
    }
    if (artefact.artefact_type === 'dwd_work_item') {
      const state = customFields.item_state || 'open';
      const colors = {
        open: '#3b82f6',
        in_review: '#f59e0b',
        waiting: '#eab308',
        blocked: '#ef4444',
        resolved: '#10b981',
        reopened: '#8b5cf6',
      };
      return { label: state.replace('_', ' '), color: colors[state] || '#3b82f6' };
    }
    return null;
  }, [artefact.artefact_type, customFields]);

  // Get secondary indicator based on type
  const secondaryBadge = useMemo(() => {
    if (artefact.artefact_type === 'dwd_work_item') {
      const volatility = customFields.volatility || 'medium';
      const colors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
      return { label: `${volatility} volatility`, color: colors[volatility] };
    }
    if (artefact.artefact_type === 'dwd_signal') {
      const signalType = customFields.signal_type || 'other';
      return { label: signalType.replace('_', ' '), color: typeDef?.color || '#ef4444' };
    }
    if (artefact.artefact_type === 'dwd_actor') {
      const actorType = customFields.actor_type || 'person';
      return { label: actorType, color: typeDef?.color || '#8b5cf6' };
    }
    if (artefact.artefact_type === 'dwd_adjustment') {
      const reversibility = customFields.adjustment_reversibility || 'medium';
      const colors = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };
      return { label: `${reversibility} to reverse`, color: colors[reversibility] };
    }
    return null;
  }, [artefact.artefact_type, customFields, typeDef]);

  if (compact) {
    return (
      <div
        className="dwd-card dwd-card--compact"
        onClick={() => onSelect?.(artefact)}
        style={{ borderLeftColor: typeDef?.color || '#6b7280' }}
      >
        <Icon fontSize="small" style={{ color: typeDef?.color }} />
        <span className="dwd-card__name">{artefact.name}</span>
        {statusBadge && (
          <span className="dwd-card__badge" style={{ backgroundColor: statusBadge.color }}>
            {statusBadge.label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="dwd-card"
      onClick={() => onSelect?.(artefact)}
      style={{ borderLeftColor: typeDef?.color || '#6b7280' }}
    >
      <div className="dwd-card__header">
        <div className="dwd-card__icon" style={{ backgroundColor: `${typeDef?.color}15` }}>
          <Icon fontSize="small" style={{ color: typeDef?.color }} />
        </div>
        <div className="dwd-card__title">
          <span className="dwd-card__type">{typeDef?.name || artefact.artefact_type}</span>
          <h4 className="dwd-card__name">{artefact.name}</h4>
        </div>
        {showActions && (
          <div className="dwd-card__actions">
            <button
              className="dwd-card__action-btn"
              onClick={(e) => { e.stopPropagation(); onEdit?.(artefact); }}
              title="Edit"
            >
              <EditIcon fontSize="small" />
            </button>
            <button
              className="dwd-card__action-btn dwd-card__action-btn--danger"
              onClick={(e) => { e.stopPropagation(); onDelete?.(artefact); }}
              title="Delete"
            >
              <DeleteIcon fontSize="small" />
            </button>
          </div>
        )}
      </div>

      {artefact.description && (
        <p className="dwd-card__description">{artefact.description}</p>
      )}

      {customFields.summary && (
        <p className="dwd-card__summary">{customFields.summary}</p>
      )}

      <div className="dwd-card__badges">
        {statusBadge && (
          <span className="dwd-card__badge" style={{ backgroundColor: statusBadge.color }}>
            {statusBadge.label}
          </span>
        )}
        {secondaryBadge && (
          <span className="dwd-card__badge dwd-card__badge--outline" style={{ borderColor: secondaryBadge.color, color: secondaryBadge.color }}>
            {secondaryBadge.label}
          </span>
        )}
      </div>

      {relationships.length > 0 && (
        <div className="dwd-card__footer">
          <span className="dwd-card__rel-count">
            {relationships.length} relationship{relationships.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
