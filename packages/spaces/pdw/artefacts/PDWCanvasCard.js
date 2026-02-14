// components/pdw/artefacts/PDWCanvasCard.js
// Card component for PDW canvas types (Lean Canvas, Empathy Map, etc.)
// Displays canvas summary and quick access to edit

import { useState, useMemo } from 'react';
import { usePDW } from '../PDWContext';

// MUI Icons
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TimelineIcon from '@mui/icons-material/Timeline';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import GroupsIcon from '@mui/icons-material/Groups';
import GridOnIcon from '@mui/icons-material/GridOn';
import CalculateIcon from '@mui/icons-material/Calculate';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import MapIcon from '@mui/icons-material/Map';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BiotechIcon from '@mui/icons-material/Biotech';
import VerifiedIcon from '@mui/icons-material/Verified';
import CompareIcon from '@mui/icons-material/Compare';
import GridViewIcon from '@mui/icons-material/GridView';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import ExtensionIcon from '@mui/icons-material/Extension';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Icon mapping for canvases
const CANVAS_ICON_MAP = {
  ViewModule: ViewModuleIcon,
  Dashboard: DashboardIcon,
  Favorite: FavoriteIcon,
  Timeline: TimelineIcon,
  Person: PersonIcon,
  Work: WorkIcon,
  Groups: GroupsIcon,
  GridOn: GridOnIcon,
  Calculate: CalculateIcon,
  ViewColumn: ViewColumnIcon,
  ShowChart: ShowChartIcon,
  Map: MapIcon,
  Assignment: AssignmentIcon,
  School: AssignmentIcon,
  Biotech: BiotechIcon,
  Verified: VerifiedIcon,
  Compare: CompareIcon,
  GridView: GridViewIcon,
  Architecture: ArchitectureIcon,
  ViewKanban: ViewKanbanIcon,
  Extension: ExtensionIcon,
  AccountTree: AccountTreeIcon,
};

// Get completion percentage for a canvas
function getCanvasCompletion(artefact, typeDef) {
  if (!typeDef?.fields) return 0;

  const cf = artefact.custom_fields || {};
  const fields = Object.keys(typeDef.fields).filter(k => k !== 'name');
  if (fields.length === 0) return 100;

  const filledFields = fields.filter(key => {
    const value = cf[key];
    if (value === undefined || value === null || value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  });

  return Math.round((filledFields.length / fields.length) * 100);
}

// Canvas preview component - shows key fields
function CanvasPreview({ artefact, typeDef }) {
  const cf = artefact.custom_fields || {};

  // Get first few filled fields for preview
  const previewFields = Object.entries(typeDef?.fields || {})
    .filter(([key, field]) => key !== 'name' && cf[key])
    .slice(0, 3);

  if (previewFields.length === 0) {
    return (
      <div className="pdw-canvas-preview pdw-canvas-preview--empty">
        <span>Click to start filling out this canvas</span>
      </div>
    );
  }

  return (
    <div className="pdw-canvas-preview">
      {previewFields.map(([key, field]) => {
        const value = cf[key];
        const displayValue = Array.isArray(value)
          ? value.slice(0, 3).join(', ') + (value.length > 3 ? '...' : '')
          : typeof value === 'string'
            ? value.slice(0, 60) + (value.length > 60 ? '...' : '')
            : String(value);

        return (
          <div key={key} className="pdw-canvas-preview__field">
            <span className="pdw-canvas-preview__label">{field.label}</span>
            <span className="pdw-canvas-preview__value">{displayValue}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function PDWCanvasCard({
  artefact,
  onSelect,
  onEdit,
  onDelete,
  onExpand,
  selected = false,
}) {
  const { getTypeDefinition, getTypeColor } = usePDW();
  const [menuOpen, setMenuOpen] = useState(false);

  const typeDef = useMemo(() => getTypeDefinition(artefact.artefact_type), [artefact.artefact_type, getTypeDefinition]);
  const color = useMemo(() => getTypeColor(artefact.artefact_type), [artefact.artefact_type, getTypeColor]);
  const completion = useMemo(() => getCanvasCompletion(artefact, typeDef), [artefact, typeDef]);

  const Icon = CANVAS_ICON_MAP[typeDef?.icon] || ViewModuleIcon;
  const layoutType = typeDef?.layout || 'default';

  const handleCardClick = () => {
    if (onSelect) onSelect(artefact);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleExpand = (e) => {
    e.stopPropagation();
    if (onExpand) onExpand(artefact);
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

  return (
    <div
      className={`pdw-canvas-card ${selected ? 'pdw-canvas-card--selected' : ''}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="pdw-canvas-card__header" style={{ backgroundColor: color }}>
        <div className="pdw-canvas-card__type">
          <Icon fontSize="small" />
          <span>{typeDef?.name || 'Canvas'}</span>
        </div>
        <div className="pdw-canvas-card__actions">
          <button className="pdw-canvas-card__expand-btn" onClick={handleExpand} title="Expand canvas">
            <OpenInFullIcon fontSize="small" />
          </button>
          <button className="pdw-canvas-card__menu-btn" onClick={handleMenuClick}>
            <MoreVertIcon fontSize="small" />
          </button>
          {menuOpen && (
            <div className="pdw-canvas-card__menu">
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

      {/* Title */}
      <div className="pdw-canvas-card__title-row">
        <h4 className="pdw-canvas-card__title">{artefact.name}</h4>
      </div>

      {/* Preview */}
      <CanvasPreview artefact={artefact} typeDef={typeDef} />

      {/* Footer with completion */}
      <div className="pdw-canvas-card__footer">
        <div className="pdw-canvas-card__completion">
          <div className="pdw-canvas-card__completion-bar">
            <div
              className="pdw-canvas-card__completion-fill"
              style={{
                width: `${completion}%`,
                backgroundColor: completion === 100 ? '#22c55e' : completion > 50 ? '#f59e0b' : color
              }}
            />
          </div>
          <span className="pdw-canvas-card__completion-text">{completion}% complete</span>
        </div>
        <span className="pdw-canvas-card__meta">
          {new Date(artefact.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
