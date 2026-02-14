// components/pdw/artefacts/PDWArtefactCard.js
// Generic card component for PDW artefacts
// Renders based on type definition from pdw-types.js

import { useState, useMemo } from 'react';
import { usePDW } from '../PDWContext';

// MUI Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import CategoryIcon from '@mui/icons-material/Category';
import ScienceIcon from '@mui/icons-material/Science';
import BiotechIcon from '@mui/icons-material/Biotech';
import WarningIcon from '@mui/icons-material/Warning';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import GavelIcon from '@mui/icons-material/Gavel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Icon mapping
const ICON_MAP = {
  TrendingUp: TrendingUpIcon,
  ReportProblem: ReportProblemIcon,
  Lightbulb: LightbulbIcon,
  EmojiObjects: EmojiObjectsIcon,
  Category: CategoryIcon,
  Science: ScienceIcon,
  Biotech: BiotechIcon,
  Warning: WarningIcon,
  School: SchoolIcon,
  Verified: VerifiedIcon,
  BusinessCenter: BusinessCenterIcon,
  Gavel: GavelIcon,
};

// Status badge component
function PDWStatusBadge({ status }) {
  const statusColors = {
    draft: { bg: '#64748b', text: '#fff' },
    in_progress: { bg: '#3b82f6', text: '#fff' },
    in_review: { bg: '#f59e0b', text: '#fff' },
    validated: { bg: '#22c55e', text: '#fff' },
    invalidated: { bg: '#ef4444', text: '#fff' },
    on_hold: { bg: '#6b7280', text: '#fff' },
    archived: { bg: '#9ca3af', text: '#fff' },
  };

  const statusLabels = {
    draft: 'Draft',
    in_progress: 'In Progress',
    in_review: 'In Review',
    validated: 'Validated',
    invalidated: 'Invalidated',
    on_hold: 'On Hold',
    archived: 'Archived',
  };

  const colors = statusColors[status] || statusColors.draft;
  const label = statusLabels[status] || status;

  return (
    <span
      className="pdw-status-badge"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {label}
    </span>
  );
}

// Main card component
export default function PDWArtefactCard({
  artefact,
  onSelect,
  onEdit,
  onDelete,
  selected = false,
  compact = false,
  showRelationships = true,
}) {
  const { getTypeDefinition, getRelated, getTypeColor, getArtefact } = usePDW();
  const [menuOpen, setMenuOpen] = useState(false);

  const typeDef = useMemo(() => getTypeDefinition(artefact.artefact_type), [artefact.artefact_type, getTypeDefinition]);
  const color = useMemo(() => getTypeColor(artefact.artefact_type), [artefact.artefact_type, getTypeColor]);
  const relationships = useMemo(() => getRelated(artefact.id), [artefact.id, getRelated]);

  const Icon = ICON_MAP[typeDef?.icon] || CategoryIcon;
  const pdwStatus = artefact.custom_fields?.pdw_status || 'draft';

  // Get key field value for preview
  const getPreviewValue = () => {
    const cf = artefact.custom_fields || {};
    // Check for common preview fields based on type
    if (cf.belief) return cf.belief;
    if (cf.value_proposition) return cf.value_proposition;
    if (cf.who) return `Who: ${cf.who}`;
    if (cf.source) return `Source: ${cf.source}`;
    if (cf.method) return `Method: ${cf.method}`;
    if (cf.decision_type) return `Decision: ${cf.decision_type}`;
    return artefact.description?.slice(0, 100) || null;
  };

  const previewValue = getPreviewValue();

  // Get confidence/progress indicator if available
  const confidence = artefact.custom_fields?.confidence;
  const riskLevel = artefact.custom_fields?.risk_level;
  const outcome = artefact.custom_fields?.outcome;

  const handleCardClick = () => {
    if (onSelect) onSelect(artefact);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onEdit) onEdit(artefact);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onDelete) onDelete(artefact);
  };

  if (compact) {
    return (
      <div
        className={`pdw-card pdw-card--compact ${selected ? 'pdw-card--selected' : ''}`}
        onClick={handleCardClick}
        style={{ borderLeftColor: color }}
      >
        <Icon className="pdw-card__icon" style={{ color }} fontSize="small" />
        <span className="pdw-card__name">{artefact.name}</span>
        <PDWStatusBadge status={pdwStatus} />
      </div>
    );
  }

  return (
    <div
      className={`pdw-card ${selected ? 'pdw-card--selected' : ''}`}
      onClick={handleCardClick}
      style={{ borderTopColor: color }}
    >
      {/* Header */}
      <div className="pdw-card__header">
        <div className="pdw-card__type" style={{ backgroundColor: color }}>
          <Icon fontSize="small" />
          <span>{typeDef?.name || artefact.artefact_type}</span>
        </div>
        <div className="pdw-card__actions">
          <PDWStatusBadge status={pdwStatus} />
          <button className="pdw-card__menu-btn" onClick={handleMenuClick}>
            <MoreVertIcon fontSize="small" />
          </button>
          {menuOpen && (
            <div className="pdw-card__menu">
              <button onClick={handleEdit}>
                <EditIcon fontSize="small" /> Edit
              </button>
              <button onClick={handleDelete} className="danger">
                <DeleteIcon fontSize="small" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="pdw-card__body">
        <h4 className="pdw-card__title">{artefact.name}</h4>
        {previewValue && (
          <p className="pdw-card__preview">{previewValue}</p>
        )}
      </div>

      {/* Indicators */}
      {(confidence !== undefined || riskLevel || outcome) && (
        <div className="pdw-card__indicators">
          {confidence !== undefined && (
            <div className="pdw-indicator">
              <span className="pdw-indicator__label">Confidence</span>
              <div className="pdw-indicator__bar">
                <div
                  className="pdw-indicator__fill"
                  style={{
                    width: `${confidence}%`,
                    backgroundColor: confidence > 70 ? '#22c55e' : confidence > 40 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <span className="pdw-indicator__value">{confidence}%</span>
            </div>
          )}
          {riskLevel && (
            <span className={`pdw-risk-badge pdw-risk-badge--${riskLevel.toLowerCase()}`}>
              {riskLevel} Risk
            </span>
          )}
          {outcome && (
            <span className={`pdw-outcome-badge pdw-outcome-badge--${outcome.toLowerCase().replace(' ', '-')}`}>
              {outcome}
            </span>
          )}
        </div>
      )}

      {/* Relationships */}
      {showRelationships && relationships.length > 0 && (
        <div className="pdw-card__relationships">
          <LinkIcon fontSize="small" />
          <span>{relationships.length} linked</span>
        </div>
      )}

      {/* Footer */}
      <div className="pdw-card__footer">
        <span className="pdw-card__meta">
          {artefact.owner_username || 'Unassigned'}
        </span>
        <span className="pdw-card__meta">
          {new Date(artefact.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

// Export status badge for reuse
export { PDWStatusBadge };
