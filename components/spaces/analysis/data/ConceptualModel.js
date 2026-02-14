// components/spaces/analysis/data/ConceptualModel.js
// Entity-Relationship diagram builder using pure SVG
// Renders ConceptualEntity artefacts as draggable boxes with crow's foot relationship lines

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useAnalysis } from '../AnalysisContext';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

// Entity type colors
const ENTITY_TYPE_COLORS = {
  Master: '#14b8a6',
  Transactional: '#0d9488',
  Reference: '#0f766e',
  Lookup: '#115e59',
};

const ENTITY_TYPE_OPTIONS = ['Master', 'Transactional', 'Reference', 'Lookup'];

const CARDINALITY_OPTIONS = [
  { value: '1:1', label: 'One to One' },
  { value: '1:N', label: 'One to Many' },
  { value: 'N:1', label: 'Many to One' },
  { value: 'N:M', label: 'Many to Many' },
];

const ENTITY_WIDTH = 200;
const ENTITY_HEADER_HEIGHT = 36;
const ATTRIBUTE_ROW_HEIGHT = 24;
const ENTITY_MIN_HEIGHT = 80;
const ENTITY_PADDING = 12;

// ============ CROW'S FOOT MARKERS ============
function CrowsFootMarkers() {
  return (
    <defs>
      {/* One marker (single line) */}
      <marker id="cf-one" viewBox="0 0 12 12" refX="12" refY="6"
        markerWidth="12" markerHeight="12" orient="auto-start-reverse">
        <line x1="12" y1="2" x2="12" y2="10" stroke="#5C5A54" strokeWidth="2" />
      </marker>
      {/* Many marker (crow's foot) */}
      <marker id="cf-many" viewBox="0 0 16 16" refX="16" refY="8"
        markerWidth="16" markerHeight="16" orient="auto-start-reverse">
        <line x1="0" y1="8" x2="16" y2="2" stroke="#5C5A54" strokeWidth="1.5" />
        <line x1="0" y1="8" x2="16" y2="8" stroke="#5C5A54" strokeWidth="1.5" />
        <line x1="0" y1="8" x2="16" y2="14" stroke="#5C5A54" strokeWidth="1.5" />
      </marker>
    </defs>
  );
}

// ============ SVG ENTITY BOX ============
function EntityBox({ entity, x, y, isSelected, onSelect, onDragStart }) {
  const attributes = entity.metadata?.attributes || [];
  const entityType = entity.metadata?.entityType || 'Master';
  const borderColor = isSelected ? '#47453F' : (ENTITY_TYPE_COLORS[entityType] || '#14b8a6');
  const height = Math.max(
    ENTITY_MIN_HEIGHT,
    ENTITY_HEADER_HEIGHT + attributes.length * ATTRIBUTE_ROW_HEIGHT + ENTITY_PADDING
  );

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onSelect(entity);
    onDragStart(entity.id, e);
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseDown={handleMouseDown}
      style={{ cursor: 'grab' }}
    >
      {/* Shadow */}
      <rect
        x={2} y={2}
        width={ENTITY_WIDTH} height={height}
        rx={4} ry={4}
        fill="rgba(31, 30, 27, 0.08)"
      />
      {/* Body */}
      <rect
        width={ENTITY_WIDTH} height={height}
        rx={4} ry={4}
        fill="#FDFCFA"
        stroke={borderColor}
        strokeWidth={isSelected ? 2 : 1.5}
      />
      {/* Header */}
      <rect
        width={ENTITY_WIDTH} height={ENTITY_HEADER_HEIGHT}
        rx={4} ry={4}
        fill={borderColor}
      />
      {/* Fill bottom corners of header */}
      <rect
        y={ENTITY_HEADER_HEIGHT - 4}
        width={ENTITY_WIDTH} height={4}
        fill={borderColor}
      />
      {/* Header text */}
      <text
        x={ENTITY_WIDTH / 2} y={ENTITY_HEADER_HEIGHT / 2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        fill="#FDFCFA" fontSize="13" fontWeight="600"
        fontFamily="inherit"
      >
        {entity.name?.length > 22 ? entity.name.substring(0, 22) + '...' : entity.name}
      </text>
      {/* Type badge */}
      <text
        x={ENTITY_WIDTH - 8} y={ENTITY_HEADER_HEIGHT + 14}
        textAnchor="end" fill="#9C9A94" fontSize="9"
        fontFamily="inherit"
      >
        {entityType}
      </text>
      {/* Attributes */}
      {attributes.map((attr, i) => {
        const attrY = ENTITY_HEADER_HEIGHT + 24 + i * ATTRIBUTE_ROW_HEIGHT;
        return (
          <g key={i}>
            <text
              x={12} y={attrY}
              fill="#1F1E1B" fontSize="11" fontFamily="inherit"
              dominantBaseline="middle"
            >
              {attr.required ? '\u2022 ' : '  '}
              <tspan fontWeight={attr.required ? '600' : '400'}>
                {attr.name}
              </tspan>
            </text>
            <text
              x={ENTITY_WIDTH - 12} y={attrY}
              textAnchor="end" fill="#9C9A94" fontSize="10"
              fontFamily="inherit" dominantBaseline="middle"
            >
              {attr.type || ''}
            </text>
          </g>
        );
      })}
      {attributes.length === 0 && (
        <text
          x={ENTITY_WIDTH / 2} y={ENTITY_HEADER_HEIGHT + 24}
          textAnchor="middle" fill="#9C9A94" fontSize="11"
          fontFamily="inherit" fontStyle="italic"
        >
          No attributes defined
        </text>
      )}
      {/* Selection indicator */}
      {isSelected && (
        <rect
          x={-3} y={-3}
          width={ENTITY_WIDTH + 6} height={height + 6}
          rx={6} ry={6}
          fill="none"
          stroke="#47453F"
          strokeWidth="1"
          strokeDasharray="4 2"
          opacity={0.5}
        />
      )}
    </g>
  );
}

// ============ RELATIONSHIP LINE ============
function RelationshipLine({ rel, fromPos, toPos, isActive }) {
  if (!fromPos || !toPos) return null;

  const cardinality = rel.metadata?.cardinality || '1:N';
  const label = rel.metadata?.label || rel.name || '';
  const [srcCard, tgtCard] = cardinality.split(':');

  // Compute connection points (center of entity sides)
  const fromCx = fromPos.x + ENTITY_WIDTH / 2;
  const fromCy = fromPos.y + fromPos.height / 2;
  const toCx = toPos.x + ENTITY_WIDTH / 2;
  const toCy = toPos.y + toPos.height / 2;

  // Determine which sides to connect
  let x1, y1, x2, y2;
  const dx = toCx - fromCx;
  const dy = toCy - fromCy;

  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    if (dx > 0) {
      x1 = fromPos.x + ENTITY_WIDTH;
      y1 = fromCy;
      x2 = toPos.x;
      y2 = toCy;
    } else {
      x1 = fromPos.x;
      y1 = fromCy;
      x2 = toPos.x + ENTITY_WIDTH;
      y2 = toCy;
    }
  } else {
    // Vertical connection
    if (dy > 0) {
      x1 = fromCx;
      y1 = fromPos.y + fromPos.height;
      x2 = toCx;
      y2 = toPos.y;
    } else {
      x1 = fromCx;
      y1 = fromPos.y;
      x2 = toCx;
      y2 = toPos.y + toPos.height;
    }
  }

  // Midpoint for label
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  // Source marker
  const srcMarker = srcCard === 'N' || srcCard === 'M' ? 'url(#cf-many)' : 'url(#cf-one)';
  const tgtMarker = tgtCard === 'N' || tgtCard === 'M' ? 'url(#cf-many)' : 'url(#cf-one)';

  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={isActive ? '#47453F' : '#9C9A94'}
        strokeWidth={isActive ? 2 : 1.5}
        markerStart={srcMarker}
        markerEnd={tgtMarker}
      />
      {label && (
        <>
          <rect
            x={mx - label.length * 3.2} y={my - 9}
            width={label.length * 6.4 + 8} height={16}
            rx={3} fill="#FDFCFA" stroke="#E2E0DB" strokeWidth="0.5"
          />
          <text
            x={mx} y={my}
            textAnchor="middle" dominantBaseline="middle"
            fill="#5C5A54" fontSize="10" fontFamily="inherit"
          >
            {label}
          </text>
        </>
      )}
    </g>
  );
}

// ============ ENTITY DETAIL PANEL ============
function EntityDetailPanel({ entity, onClose, onUpdate, onDelete, relationships, allEntities }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(entity.name || '');
  const [description, setDescription] = useState(entity.description || '');
  const [entityType, setEntityType] = useState(entity.metadata?.entityType || 'Master');
  const [attributes, setAttributes] = useState(entity.metadata?.attributes || []);
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrType, setNewAttrType] = useState('VARCHAR');

  useEffect(() => {
    setName(entity.name || '');
    setDescription(entity.description || '');
    setEntityType(entity.metadata?.entityType || 'Master');
    setAttributes(entity.metadata?.attributes || []);
    setEditing(false);
  }, [entity]);

  const linkedRelationships = useMemo(() => {
    return relationships.filter(r => r.from === entity.id || r.to === entity.id);
  }, [relationships, entity.id]);

  const handleSave = () => {
    onUpdate(entity.id, {
      name,
      description,
      metadata: {
        ...entity.metadata,
        entityType,
        attributes,
      }
    });
    setEditing(false);
  };

  const addAttribute = () => {
    if (!newAttrName.trim()) return;
    setAttributes(prev => [...prev, {
      name: newAttrName.trim(),
      type: newAttrType,
      required: false,
      description: ''
    }]);
    setNewAttrName('');
  };

  const removeAttribute = (index) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRequired = (index) => {
    setAttributes(prev => prev.map((attr, i) =>
      i === index ? { ...attr, required: !attr.required } : attr
    ));
  };

  const updateAttrDescription = (index, desc) => {
    setAttributes(prev => prev.map((attr, i) =>
      i === index ? { ...attr, description: desc } : attr
    ));
  };

  return (
    <div className="entity-detail-panel">
      <div className="detail-header">
        <div className="detail-title-row">
          <span className="detail-prefix" style={{ color: ENTITY_TYPE_COLORS[entityType] }}>
            CE-{entity.reference_number || '???'}
          </span>
          {!editing ? (
            <h3>{entity.name}</h3>
          ) : (
            <input
              type="text" value={name}
              onChange={e => setName(e.target.value)}
              className="detail-name-input"
            />
          )}
        </div>
        <div className="detail-actions-row">
          {!editing ? (
            <button className="icon-btn" onClick={() => setEditing(true)} title="Edit">
              <EditIcon fontSize="small" />
            </button>
          ) : (
            <button className="btn-primary-sm" onClick={handleSave}>Save</button>
          )}
          <button className="icon-btn danger" onClick={() => onDelete(entity.id)} title="Delete">
            <DeleteIcon fontSize="small" />
          </button>
          <button className="icon-btn" onClick={onClose} title="Close">
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="detail-body">
        {/* Type */}
        <div className="detail-field">
          <label>Entity Type</label>
          {editing ? (
            <select value={entityType} onChange={e => setEntityType(e.target.value)}>
              {ENTITY_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          ) : (
            <span className="detail-value">{entityType}</span>
          )}
        </div>

        {/* Description */}
        <div className="detail-field">
          <label>Description</label>
          {editing ? (
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Business definition of this entity..."
            />
          ) : (
            <p className="detail-value">{description || 'No description'}</p>
          )}
        </div>

        {/* Attributes */}
        <div className="detail-section">
          <h4>Attributes ({attributes.length})</h4>
          <div className="attributes-list">
            {attributes.map((attr, i) => (
              <div key={i} className="attribute-row">
                <button
                  className={`attr-required-toggle ${attr.required ? 'required' : ''}`}
                  onClick={() => editing && toggleRequired(i)}
                  title={attr.required ? 'Required' : 'Optional'}
                >
                  {attr.required ? '\u2022' : '\u25CB'}
                </button>
                <span className="attr-name">{attr.name}</span>
                <span className="attr-type">{attr.type}</span>
                {editing && (
                  <button className="attr-remove" onClick={() => removeAttribute(i)}>
                    <CloseIcon style={{ fontSize: 14 }} />
                  </button>
                )}
              </div>
            ))}
            {attributes.length === 0 && (
              <p className="empty-hint">No attributes defined</p>
            )}
          </div>

          {editing && (
            <div className="add-attribute-row">
              <input
                type="text"
                value={newAttrName}
                onChange={e => setNewAttrName(e.target.value)}
                placeholder="Attribute name"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addAttribute())}
              />
              <select value={newAttrType} onChange={e => setNewAttrType(e.target.value)}>
                {['VARCHAR', 'INTEGER', 'BOOLEAN', 'TIMESTAMP', 'UUID', 'JSONB', 'TEXT', 'NUMERIC', 'DATE'].map(t =>
                  <option key={t} value={t}>{t}</option>
                )}
              </select>
              <button className="btn-secondary-sm" onClick={addAttribute}>Add</button>
            </div>
          )}
        </div>

        {/* Linked Requirements */}
        <div className="detail-section">
          <h4>Relationships ({linkedRelationships.length})</h4>
          <div className="linked-items-list">
            {linkedRelationships.map(rel => {
              const otherEntityId = rel.from === entity.id ? rel.to : rel.from;
              const otherEntity = allEntities.find(e => e.id === otherEntityId);
              const direction = rel.from === entity.id ? 'outgoing' : 'incoming';
              return (
                <div key={rel.id} className="linked-item">
                  <span className={`link-direction ${direction}`}>
                    {direction === 'outgoing' ? '\u2192' : '\u2190'}
                  </span>
                  <span className="link-label">{rel.metadata?.label || rel.name || 'relates to'}</span>
                  <span className="link-target">{otherEntity?.name || 'Unknown'}</span>
                  <span className="link-cardinality">{rel.metadata?.cardinality || '1:N'}</span>
                </div>
              );
            })}
            {linkedRelationships.length === 0 && (
              <p className="empty-hint">No relationships yet</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .entity-detail-panel {
          width: 320px;
          background: #F0EFEC;
          border-left: 1px solid #E2E0DB;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }
        .detail-header {
          padding: 16px;
          border-bottom: 1px solid #E2E0DB;
          background: #FDFCFA;
        }
        .detail-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .detail-prefix {
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }
        .detail-title-row h3 {
          margin: 0;
          font-size: 15px;
          color: #1F1E1B;
          font-weight: 600;
        }
        .detail-name-input {
          flex: 1;
          padding: 4px 8px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 15px;
          font-weight: 600;
          color: #1F1E1B;
          background: #FDFCFA;
        }
        .detail-actions-row {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .icon-btn {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #5C5A54;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }
        .icon-btn:hover { background: #E2E0DB; }
        .icon-btn.danger:hover { color: #A54D4D; }
        .btn-primary-sm {
          padding: 4px 12px;
          background: #47453F;
          color: #F0EFEC;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }
        .btn-primary-sm:hover { background: #35332F; }
        .btn-secondary-sm {
          padding: 4px 10px;
          background: #F0EFEC;
          color: #1F1E1B;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }
        .btn-secondary-sm:hover { background: #E2E0DB; }
        .detail-body {
          padding: 16px;
          flex: 1;
          overflow-y: auto;
        }
        .detail-field {
          margin-bottom: 16px;
        }
        .detail-field label {
          display: block;
          font-size: 11px;
          color: #9C9A94;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .detail-field select,
        .detail-field input,
        .detail-field textarea {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 13px;
          color: #1F1E1B;
          background: #FDFCFA;
          font-family: inherit;
        }
        .detail-field textarea { resize: vertical; }
        .detail-value {
          font-size: 13px;
          color: #1F1E1B;
          margin: 0;
        }
        .detail-section {
          margin-bottom: 20px;
        }
        .detail-section h4 {
          font-size: 12px;
          color: #5C5A54;
          font-weight: 600;
          margin: 0 0 8px 0;
          padding-bottom: 4px;
          border-bottom: 1px solid #E2E0DB;
        }
        .attributes-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .attribute-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
        .attribute-row:hover { background: #E2E0DB; }
        .attr-required-toggle {
          background: none;
          border: none;
          font-size: 14px;
          cursor: default;
          color: #9C9A94;
          padding: 0;
          width: 14px;
          text-align: center;
        }
        .attr-required-toggle.required { color: #14b8a6; }
        .attr-name { flex: 1; color: #1F1E1B; font-weight: 500; }
        .attr-type { color: #9C9A94; font-size: 11px; }
        .attr-remove {
          background: none;
          border: none;
          cursor: pointer;
          color: #9C9A94;
          padding: 0;
          display: flex;
        }
        .attr-remove:hover { color: #A54D4D; }
        .add-attribute-row {
          display: flex;
          gap: 4px;
          margin-top: 8px;
        }
        .add-attribute-row input {
          flex: 1;
          padding: 4px 8px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 12px;
          background: #FDFCFA;
        }
        .add-attribute-row select {
          width: 100px;
          padding: 4px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 11px;
          background: #FDFCFA;
        }
        .empty-hint {
          font-size: 12px;
          color: #9C9A94;
          font-style: italic;
          margin: 4px 0;
        }
        .linked-items-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .linked-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 6px;
          border-radius: 4px;
          font-size: 12px;
        }
        .linked-item:hover { background: #E2E0DB; }
        .link-direction { font-size: 14px; color: #9C9A94; }
        .link-direction.outgoing { color: #14b8a6; }
        .link-direction.incoming { color: #0d9488; }
        .link-label { color: #5C5A54; font-style: italic; }
        .link-target { flex: 1; color: #1F1E1B; font-weight: 500; }
        .link-cardinality { color: #9C9A94; font-size: 10px; font-weight: 600; }
      `}</style>
    </div>
  );
}

// ============ ADD RELATIONSHIP MODAL ============
function AddRelationshipModal({ entities, onSave, onClose }) {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [label, setLabel] = useState('');
  const [cardinality, setCardinality] = useState('1:N');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromId || !toId || fromId === toId) return;
    onSave({ fromId, toId, label, cardinality });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rel-modal" onClick={e => e.stopPropagation()}>
        <div className="rel-modal-header">
          <h3>Add Relationship</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>From Entity</label>
            <select value={fromId} onChange={e => setFromId(e.target.value)} required>
              <option value="">Select entity...</option>
              {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Relationship Label</label>
            <input
              type="text" value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g., has, belongs to, contains"
            />
          </div>
          <div className="form-group">
            <label>Cardinality</label>
            <select value={cardinality} onChange={e => setCardinality(e.target.value)}>
              {CARDINALITY_OPTIONS.map(c =>
                <option key={c.value} value={c.value}>{c.label} ({c.value})</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label>To Entity</label>
            <select value={toId} onChange={e => setToId(e.target.value)} required>
              <option value="">Select entity...</option>
              {entities.filter(e => e.id !== fromId).map(e =>
                <option key={e.id} value={e.id}>{e.name}</option>
              )}
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={!fromId || !toId}>
              Create Relationship
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(31, 30, 27, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .rel-modal {
          background: #FDFCFA;
          border-radius: 4px;
          width: 420px;
          box-shadow: 0 8px 24px rgba(31, 30, 27, 0.2);
        }
        .rel-modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid #E2E0DB;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .rel-modal-header h3 {
          margin: 0;
          font-size: 16px;
          color: #1F1E1B;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: #9C9A94;
          cursor: pointer;
          padding: 0 4px;
        }
        .close-btn:hover { color: #1F1E1B; }
        form { padding: 20px; }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          font-size: 12px;
          color: #5C5A54;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 13px;
          color: #1F1E1B;
          background: #FDFCFA;
          font-family: inherit;
        }
        .modal-footer {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          padding-top: 8px;
          border-top: 1px solid #E2E0DB;
          margin-top: 8px;
        }
        .btn-secondary {
          padding: 8px 16px;
          background: #F0EFEC;
          color: #1F1E1B;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
        }
        .btn-secondary:hover { background: #E2E0DB; }
        .btn-primary {
          padding: 8px 16px;
          background: #47453F;
          color: #F0EFEC;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
        }
        .btn-primary:hover { background: #35332F; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

// ============ MAIN CONCEPTUAL MODEL COMPONENT ============
export default function ConceptualModel() {
  const {
    getArtefactsByType, createArtefact, updateArtefact, deleteArtefact,
    relationships, createRelationship, deleteRelationship, artefacts
  } = useAnalysis();

  const svgRef = useRef(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [viewBox, setViewBox] = useState({ x: -50, y: -50, w: 1200, h: 800 });
  const [dragging, setDragging] = useState(null);
  const [panning, setPanning] = useState(null);
  const [mode, setMode] = useState('select'); // 'select' | 'addEntity' | 'addRelation'
  const [relationSource, setRelationSource] = useState(null);
  const [showRelModal, setShowRelModal] = useState(false);

  const entities = useMemo(() => getArtefactsByType('ConceptualEntity'), [getArtefactsByType]);

  // Filter relationships for entities in this view
  const entityIds = useMemo(() => new Set(entities.map(e => e.id)), [entities]);
  const entityRelationships = useMemo(() =>
    relationships.filter(r => entityIds.has(r.from) && entityIds.has(r.to)),
    [relationships, entityIds]
  );

  // Entity positions from metadata
  const positions = useMemo(() => {
    const pos = {};
    entities.forEach(e => {
      const attrs = e.metadata?.attributes || [];
      const height = Math.max(
        ENTITY_MIN_HEIGHT,
        ENTITY_HEADER_HEIGHT + attrs.length * ATTRIBUTE_ROW_HEIGHT + ENTITY_PADDING
      );
      pos[e.id] = {
        x: e.metadata?.position?.x ?? (Object.keys(pos).length % 4) * 260 + 40,
        y: e.metadata?.position?.y ?? Math.floor(Object.keys(pos).length / 4) * 200 + 40,
        height,
      };
    });
    return pos;
  }, [entities]);

  // Add entity on canvas click
  const handleCanvasClick = useCallback(async (e) => {
    if (mode !== 'addEntity') return;

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    const x = (e.clientX - rect.left) * scaleX + viewBox.x;
    const y = (e.clientY - rect.top) * scaleY + viewBox.y;

    await createArtefact('ConceptualEntity', {
      name: `Entity ${entities.length + 1}`,
      description: '',
      metadata: {
        entityType: 'Master',
        attributes: [],
        position: { x: Math.round(x), y: Math.round(y) }
      }
    });
    setMode('select');
  }, [mode, viewBox, entities.length, createArtefact]);

  // Entity selection for relationship drawing
  const handleEntitySelect = useCallback((entity) => {
    if (mode === 'addRelation') {
      if (!relationSource) {
        setRelationSource(entity);
      } else if (entity.id !== relationSource.id) {
        // Create the relationship
        createRelationship({
          from: relationSource.id,
          to: entity.id,
          type: 'conceptual_relationship',
          name: 'relates to',
          metadata: { cardinality: '1:N', label: 'relates to' }
        });
        setRelationSource(null);
        setMode('select');
      }
    } else {
      setSelectedEntity(entity);
    }
  }, [mode, relationSource, createRelationship]);

  // Drag handling
  const handleDragStart = useCallback((entityId, e) => {
    if (mode !== 'select' && mode !== 'addRelation') return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setDragging({
      entityId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPosX: positions[entityId]?.x || 0,
      startPosY: positions[entityId]?.y || 0,
      rect,
    });
  }, [mode, positions]);

  const handleMouseMove = useCallback((e) => {
    if (dragging) {
      const scaleX = viewBox.w / dragging.rect.width;
      const scaleY = viewBox.h / dragging.rect.height;
      const dx = (e.clientX - dragging.startMouseX) * scaleX;
      const dy = (e.clientY - dragging.startMouseY) * scaleY;
      const newX = dragging.startPosX + dx;
      const newY = dragging.startPosY + dy;

      // Update position in real-time (local state via metadata update)
      const entity = entities.find(en => en.id === dragging.entityId);
      if (entity) {
        entity.metadata = {
          ...entity.metadata,
          position: { x: Math.round(newX), y: Math.round(newY) }
        };
      }
      // Force re-render
      setDragging(prev => ({ ...prev, _tick: Date.now() }));
    } else if (panning) {
      const scaleX = viewBox.w / panning.rect.width;
      const scaleY = viewBox.h / panning.rect.height;
      const dx = (e.clientX - panning.startMouseX) * scaleX;
      const dy = (e.clientY - panning.startMouseY) * scaleY;
      setViewBox({
        ...viewBox,
        x: panning.startVBX - dx,
        y: panning.startVBY - dy,
      });
    }
  }, [dragging, panning, viewBox, entities]);

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      // Persist position
      const entity = entities.find(en => en.id === dragging.entityId);
      if (entity && entity.metadata?.position) {
        updateArtefact(entity.id, {
          metadata: {
            ...entity.metadata,
            position: entity.metadata.position
          }
        });
      }
      setDragging(null);
    }
    if (panning) {
      setPanning(null);
    }
  }, [dragging, panning, entities, updateArtefact]);

  // Pan on empty space drag
  const handleSvgMouseDown = useCallback((e) => {
    if (e.target === svgRef.current || e.target.tagName === 'rect' && e.target.getAttribute('data-bg') === 'true') {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();

      if (mode === 'addEntity') {
        handleCanvasClick(e);
        return;
      }

      setPanning({
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startVBX: viewBox.x,
        startVBY: viewBox.y,
        rect,
      });
    }
  }, [mode, viewBox, handleCanvasClick]);

  // Zoom with scroll
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * viewBox.w + viewBox.x;
    const my = ((e.clientY - rect.top) / rect.height) * viewBox.h + viewBox.y;

    const newW = viewBox.w * factor;
    const newH = viewBox.h * factor;
    setViewBox({
      x: mx - (mx - viewBox.x) * factor,
      y: my - (my - viewBox.y) * factor,
      w: newW,
      h: newH,
    });
  }, [viewBox]);

  const zoomIn = () => {
    setViewBox(v => ({
      x: v.x + v.w * 0.1,
      y: v.y + v.h * 0.1,
      w: v.w * 0.8,
      h: v.h * 0.8,
    }));
  };

  const zoomOut = () => {
    setViewBox(v => ({
      x: v.x - v.w * 0.125,
      y: v.y - v.h * 0.125,
      w: v.w * 1.25,
      h: v.h * 1.25,
    }));
  };

  const fitToContent = () => {
    if (entities.length === 0) {
      setViewBox({ x: -50, y: -50, w: 1200, h: 800 });
      return;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    entities.forEach(e => {
      const pos = positions[e.id];
      if (!pos) return;
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + ENTITY_WIDTH);
      maxY = Math.max(maxY, pos.y + pos.height);
    });
    const pad = 80;
    setViewBox({
      x: minX - pad,
      y: minY - pad,
      w: maxX - minX + pad * 2,
      h: maxY - minY + pad * 2,
    });
  };

  // Auto-layout
  const autoLayout = useCallback(async () => {
    const cols = Math.max(2, Math.ceil(Math.sqrt(entities.length)));
    for (let i = 0; i < entities.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      await updateArtefact(entities[i].id, {
        metadata: {
          ...entities[i].metadata,
          position: { x: col * 260 + 40, y: row * 220 + 40 }
        }
      });
    }
    setTimeout(fitToContent, 100);
  }, [entities, updateArtefact]);

  const handleDeleteEntity = useCallback(async (id) => {
    if (!confirm('Delete this entity and all its relationships?')) return;
    await deleteArtefact(id);
    if (selectedEntity?.id === id) setSelectedEntity(null);
  }, [deleteArtefact, selectedEntity]);

  // Relationship modal save
  const handleRelModalSave = useCallback(async ({ fromId, toId, label, cardinality }) => {
    await createRelationship({
      from: fromId,
      to: toId,
      type: 'conceptual_relationship',
      name: label || 'relates to',
      metadata: { cardinality, label: label || 'relates to' }
    });
    setShowRelModal(false);
  }, [createRelationship]);

  return (
    <div className="conceptual-model">
      {/* Toolbar */}
      <div className="cm-toolbar">
        <div className="toolbar-left">
          <button
            className={`tool-btn ${mode === 'addEntity' ? 'active' : ''}`}
            onClick={() => setMode(mode === 'addEntity' ? 'select' : 'addEntity')}
            title="Click canvas to add entity"
          >
            <AddIcon fontSize="small" />
            <span>Add Entity</span>
          </button>
          <button
            className={`tool-btn ${mode === 'addRelation' ? 'active' : ''}`}
            onClick={() => {
              if (mode === 'addRelation') {
                setMode('select');
                setRelationSource(null);
              } else {
                setMode('addRelation');
                setRelationSource(null);
              }
            }}
            title="Click source then target entity"
          >
            <LinkIcon fontSize="small" />
            <span>Draw Relationship</span>
          </button>
          <div className="toolbar-divider" />
          <button
            className="tool-btn"
            onClick={() => setShowRelModal(true)}
            title="Add relationship via form"
          >
            <LinkIcon fontSize="small" />
            <span>Relationship Form</span>
          </button>
          <button className="tool-btn" onClick={autoLayout} title="Auto-layout entities">
            <AutoFixHighIcon fontSize="small" />
            <span>Auto Layout</span>
          </button>
        </div>
        <div className="toolbar-right">
          {mode === 'addRelation' && relationSource && (
            <span className="mode-hint">
              Select target entity for: <strong>{relationSource.name}</strong>
            </span>
          )}
          {mode === 'addEntity' && (
            <span className="mode-hint">Click on canvas to place entity</span>
          )}
          <button className="zoom-btn" onClick={zoomIn} title="Zoom in">
            <ZoomInIcon fontSize="small" />
          </button>
          <button className="zoom-btn" onClick={zoomOut} title="Zoom out">
            <ZoomOutIcon fontSize="small" />
          </button>
          <button className="zoom-btn" onClick={fitToContent} title="Fit to content">
            <FitScreenIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="cm-canvas-container">
        {/* SVG Canvas */}
        {entities.length === 0 && mode !== 'addEntity' ? (
          <div className="cm-empty-state">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="4" y="4" width="30" height="22" rx="3" stroke="#E2E0DB" strokeWidth="2" fill="none" />
              <rect x="46" y="4" width="30" height="22" rx="3" stroke="#E2E0DB" strokeWidth="2" fill="none" />
              <rect x="25" y="52" width="30" height="22" rx="3" stroke="#E2E0DB" strokeWidth="2" fill="none" />
              <line x1="34" y1="26" x2="34" y2="52" stroke="#E2E0DB" strokeWidth="1.5" strokeDasharray="4 2" />
              <line x1="46" y1="26" x2="46" y2="52" stroke="#E2E0DB" strokeWidth="1.5" strokeDasharray="4 2" />
            </svg>
            <h3>Conceptual Data Model</h3>
            <p>Start by adding conceptual entities to model your business domain.</p>
            <button className="btn-primary" onClick={() => setMode('addEntity')}>
              <AddIcon fontSize="small" />
              Add First Entity
            </button>
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="cm-svg"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{
              cursor: mode === 'addEntity' ? 'crosshair' :
                      mode === 'addRelation' ? 'pointer' :
                      panning ? 'grabbing' : 'default'
            }}
          >
            <CrowsFootMarkers />

            {/* Grid dots */}
            <pattern id="grid-dots" x={0} y={0} width={40} height={40} patternUnits="userSpaceOnUse">
              <circle cx={20} cy={20} r={1} fill="#E2E0DB" />
            </pattern>
            <rect
              data-bg="true"
              x={viewBox.x - 1000} y={viewBox.y - 1000}
              width={viewBox.w + 2000} height={viewBox.h + 2000}
              fill="url(#grid-dots)"
            />

            {/* Relationships */}
            {entityRelationships.map(rel => (
              <RelationshipLine
                key={rel.id}
                rel={rel}
                fromPos={positions[rel.from]}
                toPos={positions[rel.to]}
                isActive={selectedEntity && (rel.from === selectedEntity.id || rel.to === selectedEntity.id)}
              />
            ))}

            {/* Entities */}
            {entities.map(entity => {
              const pos = positions[entity.id];
              if (!pos) return null;
              return (
                <EntityBox
                  key={entity.id}
                  entity={entity}
                  x={pos.x}
                  y={pos.y}
                  isSelected={selectedEntity?.id === entity.id}
                  onSelect={handleEntitySelect}
                  onDragStart={handleDragStart}
                />
              );
            })}

            {/* Relationship drawing line */}
            {mode === 'addRelation' && relationSource && positions[relationSource.id] && (
              <circle
                cx={positions[relationSource.id].x + ENTITY_WIDTH / 2}
                cy={positions[relationSource.id].y + positions[relationSource.id].height / 2}
                r={6}
                fill="none"
                stroke="#14b8a6"
                strokeWidth={2}
                strokeDasharray="3 2"
              >
                <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
          </svg>
        )}

        {/* Detail Panel */}
        {selectedEntity && (
          <EntityDetailPanel
            entity={selectedEntity}
            onClose={() => setSelectedEntity(null)}
            onUpdate={updateArtefact}
            onDelete={handleDeleteEntity}
            relationships={entityRelationships}
            allEntities={entities}
          />
        )}
      </div>

      {/* Relationship Modal */}
      {showRelModal && (
        <AddRelationshipModal
          entities={entities}
          onSave={handleRelModalSave}
          onClose={() => setShowRelModal(false)}
        />
      )}

      <style jsx>{`
        .conceptual-model {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #FDFCFA;
        }
        .cm-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          border-bottom: 1px solid #E2E0DB;
          background: #F0EFEC;
          gap: 8px;
          flex-shrink: 0;
        }
        .toolbar-left, .toolbar-right {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: #E2E0DB;
          margin: 0 4px;
        }
        .tool-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 12px;
          color: #1F1E1B;
          cursor: pointer;
          transition: all 120ms ease-out;
          white-space: nowrap;
        }
        .tool-btn:hover {
          background: #E2E0DB;
          transform: translateY(-1px);
        }
        .tool-btn.active {
          background: #47453F;
          color: #F0EFEC;
          border-color: #47453F;
        }
        .zoom-btn {
          display: flex;
          align-items: center;
          padding: 4px;
          background: none;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          color: #5C5A54;
          cursor: pointer;
        }
        .zoom-btn:hover { background: #E2E0DB; }
        .mode-hint {
          font-size: 12px;
          color: #5C5A54;
          padding: 4px 10px;
          background: #FDFCFA;
          border: 1px dashed #E2E0DB;
          border-radius: 4px;
          margin-right: 8px;
        }
        .cm-canvas-container {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }
        .cm-svg {
          flex: 1;
          width: 100%;
          height: 100%;
          user-select: none;
        }
        .cm-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #5C5A54;
        }
        .cm-empty-state h3 {
          margin: 0;
          font-size: 18px;
          color: #1F1E1B;
          font-weight: 600;
        }
        .cm-empty-state p {
          margin: 0;
          font-size: 14px;
          color: #9C9A94;
          max-width: 380px;
          text-align: center;
        }
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #47453F;
          color: #F0EFEC;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
          transition: all 120ms ease-out;
        }
        .btn-primary:hover {
          background: #35332F;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

export { EntityBox, EntityDetailPanel, RelationshipLine, AddRelationshipModal };
