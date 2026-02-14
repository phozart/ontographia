// components/spaces/analysis/data/LogicalModel.js
// Table/document structure editor with visual schema view
// Manages LogicalDataModel artefacts with metadata.columns

import { useState, useMemo, useCallback, useRef } from 'react';
import { useAnalysis } from '../AnalysisContext';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ViewListIcon from '@mui/icons-material/ViewList';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import KeyIcon from '@mui/icons-material/Key';
import LinkIcon from '@mui/icons-material/Link';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TransformIcon from '@mui/icons-material/Transform';
import TableChartIcon from '@mui/icons-material/TableChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const DATA_TYPES = [
  'VARCHAR', 'INTEGER', 'BOOLEAN', 'TIMESTAMP', 'UUID', 'JSONB',
  'TEXT', 'NUMERIC', 'DATE', 'ARRAY', 'BIGINT', 'SMALLINT', 'REAL',
  'DOUBLE PRECISION', 'BYTEA', 'INTERVAL'
];

const STORAGE_TYPES = ['Relational Table', 'Document', 'Key-Value', 'Graph', 'Column Family', 'Time Series', 'View'];

const TABLE_BOX_WIDTH = 220;
const TABLE_HEADER_HEIGHT = 32;
const COLUMN_ROW_HEIGHT = 22;
const TABLE_PADDING = 8;

// ============ COLUMN EDITOR ============
function ColumnEditor({ columns, onChange, allModels, modelId }) {
  const [editingIdx, setEditingIdx] = useState(null);
  const [newCol, setNewCol] = useState({
    name: '', dataType: 'VARCHAR', nullable: true,
    primaryKey: false, foreignKey: null, description: '', defaultValue: ''
  });

  const addColumn = () => {
    if (!newCol.name.trim()) return;
    onChange([...columns, { ...newCol, name: newCol.name.trim() }]);
    setNewCol({
      name: '', dataType: 'VARCHAR', nullable: true,
      primaryKey: false, foreignKey: null, description: '', defaultValue: ''
    });
  };

  const removeColumn = (idx) => {
    onChange(columns.filter((_, i) => i !== idx));
  };

  const moveColumn = (idx, dir) => {
    const newCols = [...columns];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= newCols.length) return;
    [newCols[idx], newCols[targetIdx]] = [newCols[targetIdx], newCols[idx]];
    onChange(newCols);
  };

  const updateColumn = (idx, field, value) => {
    onChange(columns.map((col, i) =>
      i === idx ? { ...col, [field]: value } : col
    ));
  };

  // Other models for FK references
  const fkOptions = useMemo(() => {
    return allModels
      .filter(m => m.id !== modelId)
      .flatMap(m => (m.metadata?.columns || []).map(c => ({
        label: `${m.name}.${c.name}`,
        value: `${m.id}:${c.name}`,
        modelName: m.name,
        colName: c.name,
      })));
  }, [allModels, modelId]);

  return (
    <div className="column-editor">
      {/* Column list */}
      <div className="column-list">
        <div className="col-header-row">
          <span className="col-h" style={{ width: 24 }}></span>
          <span className="col-h" style={{ flex: 1 }}>Name</span>
          <span className="col-h" style={{ width: 110 }}>Type</span>
          <span className="col-h" style={{ width: 32 }} title="Primary Key">PK</span>
          <span className="col-h" style={{ width: 32 }} title="Nullable">NL</span>
          <span className="col-h" style={{ width: 32 }} title="Foreign Key">FK</span>
          <span className="col-h" style={{ width: 60 }}></span>
        </div>

        {columns.map((col, i) => (
          <div key={i} className={`col-row ${editingIdx === i ? 'editing' : ''}`}>
            <span className="col-order">{i + 1}</span>

            {editingIdx === i ? (
              <>
                <input
                  className="col-input" style={{ flex: 1 }}
                  value={col.name}
                  onChange={e => updateColumn(i, 'name', e.target.value)}
                />
                <select
                  className="col-select" style={{ width: 110 }}
                  value={col.dataType}
                  onChange={e => updateColumn(i, 'dataType', e.target.value)}
                >
                  {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </>
            ) : (
              <>
                <span className="col-name" style={{ flex: 1 }}>
                  {col.primaryKey && <KeyIcon style={{ fontSize: 12, color: '#C9A227', marginRight: 2 }} />}
                  {col.name}
                </span>
                <span className="col-type" style={{ width: 110 }}>{col.dataType}</span>
              </>
            )}

            <span className="col-toggle" style={{ width: 32 }}>
              <input
                type="checkbox" checked={col.primaryKey}
                onChange={e => updateColumn(i, 'primaryKey', e.target.checked)}
                title="Primary Key"
              />
            </span>
            <span className="col-toggle" style={{ width: 32 }}>
              <input
                type="checkbox" checked={col.nullable}
                onChange={e => updateColumn(i, 'nullable', e.target.checked)}
                title="Nullable"
              />
            </span>
            <span className="col-toggle" style={{ width: 32 }}>
              {col.foreignKey ? (
                <LinkIcon style={{ fontSize: 14, color: '#14b8a6' }} titleAccess="Has FK" />
              ) : (
                <span style={{ color: '#E2E0DB' }}>-</span>
              )}
            </span>
            <span className="col-actions" style={{ width: 60 }}>
              <button onClick={() => setEditingIdx(editingIdx === i ? null : i)} title="Edit">
                <EditIcon style={{ fontSize: 14 }} />
              </button>
              <button onClick={() => moveColumn(i, -1)} title="Move up" disabled={i === 0}>
                <ArrowUpwardIcon style={{ fontSize: 14 }} />
              </button>
              <button onClick={() => removeColumn(i)} title="Remove">
                <DeleteIcon style={{ fontSize: 14 }} />
              </button>
            </span>
          </div>
        ))}

        {columns.length === 0 && (
          <div className="col-empty">No columns defined. Add columns below.</div>
        )}
      </div>

      {/* Expanded edit for selected column */}
      {editingIdx !== null && columns[editingIdx] && (
        <div className="col-detail-edit">
          <div className="col-detail-row">
            <div className="col-detail-field">
              <label>Description</label>
              <input
                type="text"
                value={columns[editingIdx].description || ''}
                onChange={e => updateColumn(editingIdx, 'description', e.target.value)}
                placeholder="Column description..."
              />
            </div>
            <div className="col-detail-field">
              <label>Default Value</label>
              <input
                type="text"
                value={columns[editingIdx].defaultValue || ''}
                onChange={e => updateColumn(editingIdx, 'defaultValue', e.target.value)}
                placeholder="e.g., NOW(), 0, true"
              />
            </div>
          </div>
          <div className="col-detail-row">
            <div className="col-detail-field" style={{ flex: 1 }}>
              <label>Foreign Key Reference</label>
              <select
                value={columns[editingIdx].foreignKey || ''}
                onChange={e => updateColumn(editingIdx, 'foreignKey', e.target.value || null)}
              >
                <option value="">None</option>
                {fkOptions.map(fk => (
                  <option key={fk.value} value={fk.value}>{fk.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn-close-edit" onClick={() => setEditingIdx(null)}>
            Done Editing Column
          </button>
        </div>
      )}

      {/* Add new column */}
      <div className="add-column-form">
        <input
          type="text" value={newCol.name}
          onChange={e => setNewCol(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Column name"
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColumn())}
          className="col-input"
          style={{ flex: 1 }}
        />
        <select
          value={newCol.dataType}
          onChange={e => setNewCol(prev => ({ ...prev, dataType: e.target.value }))}
          className="col-select"
        >
          {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="btn-add-col" onClick={addColumn}>
          <AddIcon style={{ fontSize: 16 }} /> Add
        </button>
      </div>

      <style jsx>{`
        .column-editor { font-size: 12px; }
        .column-list {
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .col-header-row {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 8px;
          background: #F0EFEC;
          border-bottom: 1px solid #E2E0DB;
        }
        .col-h {
          font-size: 10px;
          color: #9C9A94;
          font-weight: 600;
          text-transform: uppercase;
          text-align: center;
        }
        .col-row {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-bottom: 1px solid #F0EFEC;
          transition: background 100ms ease-out;
        }
        .col-row:hover { background: #F0EFEC; }
        .col-row.editing { background: #F0EFEC; border-left: 2px solid #47453F; }
        .col-order {
          width: 24px;
          text-align: center;
          color: #9C9A94;
          font-size: 10px;
        }
        .col-name {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #1F1E1B;
          font-weight: 500;
        }
        .col-type { color: #9C9A94; font-size: 11px; }
        .col-toggle { text-align: center; }
        .col-toggle input[type="checkbox"] {
          width: 14px;
          height: 14px;
          accent-color: #47453F;
        }
        .col-actions {
          display: flex;
          gap: 2px;
        }
        .col-actions button {
          background: none;
          border: none;
          padding: 2px;
          cursor: pointer;
          color: #9C9A94;
          border-radius: 2px;
        }
        .col-actions button:hover { color: #1F1E1B; background: #E2E0DB; }
        .col-actions button:disabled { opacity: 0.3; cursor: not-allowed; }
        .col-input {
          padding: 3px 6px;
          border: 1px solid #E2E0DB;
          border-radius: 3px;
          font-size: 12px;
          color: #1F1E1B;
          background: #FDFCFA;
          font-family: inherit;
        }
        .col-select {
          padding: 3px 4px;
          border: 1px solid #E2E0DB;
          border-radius: 3px;
          font-size: 11px;
          color: #1F1E1B;
          background: #FDFCFA;
        }
        .col-empty {
          padding: 20px;
          text-align: center;
          color: #9C9A94;
          font-style: italic;
        }
        .col-detail-edit {
          background: #F0EFEC;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 12px;
        }
        .col-detail-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .col-detail-field {
          flex: 1;
        }
        .col-detail-field label {
          display: block;
          font-size: 10px;
          color: #9C9A94;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .col-detail-field input,
        .col-detail-field select {
          width: 100%;
          padding: 4px 8px;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 12px;
          background: #FDFCFA;
          font-family: inherit;
        }
        .btn-close-edit {
          padding: 4px 10px;
          background: #47453F;
          color: #F0EFEC;
          border: none;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
        }
        .btn-close-edit:hover { background: #35332F; }
        .add-column-form {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .btn-add-col {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 4px 10px;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 12px;
          color: #1F1E1B;
          cursor: pointer;
          white-space: nowrap;
        }
        .btn-add-col:hover { background: #E2E0DB; }
      `}</style>
    </div>
  );
}

// ============ MODEL CARD (LIST VIEW) ============
function ModelCard({ model, isExpanded, onToggle, onEdit, onDelete, allModels }) {
  const { updateArtefact } = useAnalysis();
  const columns = model.metadata?.columns || [];
  const storageType = model.metadata?.storage_type || 'Relational Table';
  const pkCols = columns.filter(c => c.primaryKey);
  const fkCols = columns.filter(c => c.foreignKey);

  const handleColumnsChange = (newColumns) => {
    updateArtefact(model.id, {
      metadata: { ...model.metadata, columns: newColumns }
    });
  };

  return (
    <div className={`model-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="model-header" onClick={onToggle}>
        <span className="expand-icon">
          {isExpanded
            ? <ExpandMoreIcon style={{ fontSize: 18 }} />
            : <ChevronRightIcon style={{ fontSize: 18 }} />
          }
        </span>
        <span className="model-icon">
          <TableChartIcon style={{ fontSize: 16, color: '#0d9488' }} />
        </span>
        <span className="model-name">{model.name}</span>
        <span className="model-type-badge">{storageType}</span>
        <span className="model-col-count">{columns.length} cols</span>
        {pkCols.length > 0 && (
          <span className="model-pk-badge" title={`PK: ${pkCols.map(c => c.name).join(', ')}`}>
            <KeyIcon style={{ fontSize: 12 }} /> {pkCols.length}
          </span>
        )}
        {fkCols.length > 0 && (
          <span className="model-fk-badge" title={`FK: ${fkCols.map(c => c.name).join(', ')}`}>
            <LinkIcon style={{ fontSize: 12 }} /> {fkCols.length}
          </span>
        )}
        <span className="model-actions">
          <button onClick={(e) => { e.stopPropagation(); onEdit(model); }} title="Edit">
            <EditIcon style={{ fontSize: 16 }} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(model); }} title="Delete">
            <DeleteIcon style={{ fontSize: 16 }} />
          </button>
        </span>
      </div>

      {isExpanded && (
        <div className="model-body">
          {model.description && (
            <p className="model-description">{model.description}</p>
          )}
          <ColumnEditor
            columns={columns}
            onChange={handleColumnsChange}
            allModels={allModels}
            modelId={model.id}
          />
        </div>
      )}

      <style jsx>{`
        .model-card {
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          background: #FDFCFA;
          transition: box-shadow 120ms ease-out;
        }
        .model-card:hover {
          box-shadow: 0 2px 8px rgba(31, 30, 27, 0.06);
        }
        .model-card.expanded {
          border-color: #47453F;
        }
        .model-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          cursor: pointer;
          user-select: none;
        }
        .model-header:hover { background: #F0EFEC; }
        .expand-icon { color: #9C9A94; display: flex; }
        .model-icon { display: flex; }
        .model-name {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: #1F1E1B;
        }
        .model-type-badge {
          padding: 2px 8px;
          background: #F0EFEC;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 10px;
          color: #5C5A54;
        }
        .model-col-count {
          font-size: 11px;
          color: #9C9A94;
        }
        .model-pk-badge, .model-fk-badge {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }
        .model-pk-badge { background: #fef3c7; color: #92400e; }
        .model-fk-badge { background: #ccfbf1; color: #0f766e; }
        .model-actions {
          display: flex;
          gap: 4px;
        }
        .model-actions button {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #9C9A94;
          border-radius: 4px;
        }
        .model-actions button:hover { color: #1F1E1B; background: #E2E0DB; }
        .model-body {
          padding: 0 16px 16px;
          border-top: 1px solid #E2E0DB;
        }
        .model-description {
          font-size: 13px;
          color: #5C5A54;
          margin: 12px 0;
        }
      `}</style>
    </div>
  );
}

// ============ VISUAL SCHEMA DIAGRAM ============
function SchemaDiagram({ models }) {
  const positions = useMemo(() => {
    const pos = {};
    const cols = Math.max(2, Math.ceil(Math.sqrt(models.length)));
    models.forEach((m, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      pos[m.id] = {
        x: col * (TABLE_BOX_WIDTH + 60) + 40,
        y: row * 240 + 40,
      };
    });
    return pos;
  }, [models]);

  // Collect FK relationships
  const fkLinks = useMemo(() => {
    const links = [];
    models.forEach(m => {
      (m.metadata?.columns || []).forEach(col => {
        if (col.foreignKey) {
          const [targetModelId] = col.foreignKey.split(':');
          const targetModel = models.find(tm => tm.id === targetModelId);
          if (targetModel && positions[m.id] && positions[targetModelId]) {
            links.push({
              from: m.id,
              to: targetModelId,
              fromCol: col.name,
              toCol: col.foreignKey.split(':')[1],
            });
          }
        }
      });
    });
    return links;
  }, [models, positions]);

  const totalW = Math.max(800, (Math.ceil(Math.sqrt(models.length)) + 1) * (TABLE_BOX_WIDTH + 60));
  const totalH = Math.max(400, (Math.ceil(models.length / Math.ceil(Math.sqrt(models.length))) + 1) * 240);

  if (models.length === 0) {
    return (
      <div className="schema-empty">
        <p>No logical data models to visualize. Add models in the list view first.</p>
      </div>
    );
  }

  return (
    <div className="schema-diagram">
      <svg viewBox={`0 0 ${totalW} ${totalH}`} className="schema-svg">
        {/* FK lines */}
        {fkLinks.map((link, i) => {
          const from = positions[link.from];
          const to = positions[link.to];
          if (!from || !to) return null;

          const x1 = from.x + TABLE_BOX_WIDTH;
          const y1 = from.y + TABLE_HEADER_HEIGHT + 10;
          const x2 = to.x;
          const y2 = to.y + TABLE_HEADER_HEIGHT + 10;
          const midX = (x1 + x2) / 2;

          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                fill="none" stroke="#14b8a6" strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <circle cx={x2} cy={y2} r={4} fill="#14b8a6" />
            </g>
          );
        })}

        {/* Table boxes */}
        {models.map(m => {
          const pos = positions[m.id];
          if (!pos) return null;
          const columns = m.metadata?.columns || [];
          const height = TABLE_HEADER_HEIGHT + columns.length * COLUMN_ROW_HEIGHT + TABLE_PADDING;

          return (
            <g key={m.id} transform={`translate(${pos.x}, ${pos.y})`}>
              <rect
                x={2} y={2}
                width={TABLE_BOX_WIDTH} height={height}
                rx={4} fill="rgba(31,30,27,0.06)"
              />
              <rect
                width={TABLE_BOX_WIDTH} height={height}
                rx={4} fill="#FDFCFA" stroke="#0d9488" strokeWidth="1.5"
              />
              <rect
                width={TABLE_BOX_WIDTH} height={TABLE_HEADER_HEIGHT}
                rx={4} fill="#0d9488"
              />
              <rect
                y={TABLE_HEADER_HEIGHT - 4}
                width={TABLE_BOX_WIDTH} height={4} fill="#0d9488"
              />
              <text
                x={TABLE_BOX_WIDTH / 2} y={TABLE_HEADER_HEIGHT / 2 + 1}
                textAnchor="middle" dominantBaseline="middle"
                fill="#FDFCFA" fontSize="12" fontWeight="600" fontFamily="inherit"
              >
                {m.name?.length > 24 ? m.name.substring(0, 24) + '...' : m.name}
              </text>
              {columns.map((col, ci) => {
                const rowY = TABLE_HEADER_HEIGHT + 4 + ci * COLUMN_ROW_HEIGHT;
                return (
                  <g key={ci}>
                    {ci > 0 && (
                      <line
                        x1={4} x2={TABLE_BOX_WIDTH - 4}
                        y1={rowY} y2={rowY}
                        stroke="#F0EFEC" strokeWidth="0.5"
                      />
                    )}
                    <text
                      x={8} y={rowY + COLUMN_ROW_HEIGHT / 2 + 1}
                      dominantBaseline="middle"
                      fontSize="10" fontFamily="inherit"
                      fill={col.primaryKey ? '#92400e' : '#1F1E1B'}
                      fontWeight={col.primaryKey ? '600' : '400'}
                    >
                      {col.primaryKey ? '\u{1F511} ' : ''}{col.name}
                    </text>
                    <text
                      x={TABLE_BOX_WIDTH - 8}
                      y={rowY + COLUMN_ROW_HEIGHT / 2 + 1}
                      textAnchor="end" dominantBaseline="middle"
                      fontSize="9" fontFamily="inherit" fill="#9C9A94"
                    >
                      {col.dataType}{col.nullable ? '?' : ''}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      <style jsx>{`
        .schema-diagram {
          flex: 1;
          overflow: auto;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
        }
        .schema-svg {
          width: 100%;
          min-height: 400px;
        }
        .schema-empty {
          padding: 40px;
          text-align: center;
          color: #9C9A94;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

// ============ CREATE / EDIT MODEL MODAL ============
function ModelFormModal({ model, onSave, onClose, conceptualEntities }) {
  const [name, setName] = useState(model?.name || '');
  const [description, setDescription] = useState(model?.description || '');
  const [storageType, setStorageType] = useState(model?.metadata?.storage_type || 'Relational Table');
  const [linkedCE, setLinkedCE] = useState(model?.metadata?.linked_ce || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      description,
      metadata: {
        ...(model?.metadata || {}),
        storage_type: storageType,
        linked_ce: linkedCE,
        columns: model?.metadata?.columns || [],
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="model-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{model?.id ? 'Edit Model' : 'Create Logical Data Model'}</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text" value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., users, order_items, product_catalog"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Purpose and contents of this model..."
              rows={2}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Storage Type</label>
              <select value={storageType} onChange={e => setStorageType(e.target.value)}>
                {STORAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Derived from CE</label>
              <select value={linkedCE} onChange={e => setLinkedCE(e.target.value)}>
                <option value="">None</option>
                {conceptualEntities.map(ce => (
                  <option key={ce.id} value={ce.id}>{ce.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={!name.trim()}>
              {model?.id ? 'Save Changes' : 'Create Model'}
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
        .model-form-modal {
          background: #FDFCFA;
          border-radius: 4px;
          width: 480px;
          box-shadow: 0 8px 24px rgba(31, 30, 27, 0.2);
        }
        .modal-header {
          padding: 16px 20px;
          border-bottom: 1px solid #E2E0DB;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .modal-header h3 { margin: 0; font-size: 16px; color: #1F1E1B; }
        .close-btn {
          background: none; border: none; font-size: 20px;
          color: #9C9A94; cursor: pointer;
        }
        .close-btn:hover { color: #1F1E1B; }
        form { padding: 20px; }
        .form-group { margin-bottom: 16px; }
        .form-group label {
          display: block; font-size: 12px; color: #5C5A54;
          font-weight: 600; margin-bottom: 4px;
        }
        .form-group input, .form-group textarea, .form-group select {
          width: 100%; padding: 8px 10px;
          border: 1px solid #E2E0DB; border-radius: 4px;
          font-size: 13px; color: #1F1E1B; background: #FDFCFA;
          font-family: inherit;
        }
        .form-group textarea { resize: vertical; }
        .form-row { display: flex; gap: 12px; }
        .form-row .form-group { flex: 1; }
        .modal-footer {
          display: flex; gap: 8px; justify-content: flex-end;
          padding-top: 8px; border-top: 1px solid #E2E0DB;
        }
        .btn-secondary {
          padding: 8px 16px; background: #F0EFEC; color: #1F1E1B;
          border: 1px solid #E2E0DB; border-radius: 4px; font-size: 13px; cursor: pointer;
        }
        .btn-secondary:hover { background: #E2E0DB; }
        .btn-primary {
          padding: 8px 16px; background: #47453F; color: #F0EFEC;
          border: none; border-radius: 4px; font-size: 13px; cursor: pointer;
        }
        .btn-primary:hover { background: #35332F; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

// ============ MAIN LOGICAL MODEL COMPONENT ============
export default function LogicalModel() {
  const {
    getArtefactsByType, createArtefact, updateArtefact, deleteArtefact,
    createRelationship
  } = useAnalysis();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'diagram'
  const [expandedId, setExpandedId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);

  const models = useMemo(() => getArtefactsByType('LogicalDataModel'), [getArtefactsByType]);
  const conceptualEntities = useMemo(() => getArtefactsByType('ConceptualEntity'), [getArtefactsByType]);

  const handleCreate = () => {
    setEditingModel(null);
    setShowFormModal(true);
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    setShowFormModal(true);
  };

  const handleDelete = async (model) => {
    if (!confirm(`Delete model "${model.name}" and all its columns?`)) return;
    await deleteArtefact(model.id);
  };

  const handleSave = async (data) => {
    if (editingModel?.id) {
      await updateArtefact(editingModel.id, data);
    } else {
      await createArtefact('LogicalDataModel', data);
    }
    setShowFormModal(false);
    setEditingModel(null);
  };

  // Generate LDM from conceptual entity
  const handleGenerateFromCE = async (ce) => {
    const attrs = ce.metadata?.attributes || [];
    const keyAttrsStr = ce.metadata?.key_attributes || ce.description || '';
    const columns = attrs.map(attr => ({
      name: attr.name?.toLowerCase().replace(/\s+/g, '_') || 'column',
      dataType: attr.type || 'VARCHAR',
      nullable: !attr.required,
      primaryKey: false,
      foreignKey: null,
      description: attr.description || '',
      defaultValue: '',
    }));

    // Add an id column if none exist as PK
    if (columns.length === 0 || !columns.some(c => c.primaryKey)) {
      columns.unshift({
        name: 'id',
        dataType: 'UUID',
        nullable: false,
        primaryKey: true,
        foreignKey: null,
        description: 'Primary key',
        defaultValue: 'gen_random_uuid()',
      });
    }

    const newModel = await createArtefact('LogicalDataModel', {
      name: ce.name?.toLowerCase().replace(/\s+/g, '_') + 's',
      description: `Derived from conceptual entity: ${ce.name}`,
      metadata: {
        storage_type: 'Relational Table',
        linked_ce: ce.id,
        columns,
      }
    });

    // Create relationship back to CE
    if (newModel?.id) {
      await createRelationship({
        from: newModel.id,
        to: ce.id,
        type: 'derived_from',
        name: 'derived from',
      });
    }
  };

  return (
    <div className="logical-model">
      {/* Toolbar */}
      <div className="lm-toolbar">
        <div className="toolbar-left">
          <button className="btn-primary" onClick={handleCreate}>
            <AddIcon style={{ fontSize: 16 }} />
            <span>Add Model</span>
          </button>

          {conceptualEntities.length > 0 && (
            <div className="generate-dropdown">
              <button className="tool-btn">
                <TransformIcon style={{ fontSize: 16 }} />
                <span>Generate from CE</span>
              </button>
              <div className="dropdown-menu">
                {conceptualEntities.map(ce => (
                  <button key={ce.id} onClick={() => handleGenerateFromCE(ce)}>
                    {ce.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="toolbar-right">
          <div className="view-toggle">
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <ViewListIcon style={{ fontSize: 18 }} />
            </button>
            <button
              className={viewMode === 'diagram' ? 'active' : ''}
              onClick={() => setViewMode('diagram')}
              title="Schema diagram"
            >
              <AccountTreeIcon style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="lm-content">
        {models.length === 0 ? (
          <div className="lm-empty-state">
            <TableChartIcon style={{ fontSize: 56, color: '#E2E0DB' }} />
            <h3>No Logical Data Models</h3>
            <p>Define table and document structures for your data architecture.</p>
            <div className="empty-actions">
              <button className="btn-primary" onClick={handleCreate}>
                <AddIcon style={{ fontSize: 16 }} />
                Create First Model
              </button>
              {conceptualEntities.length > 0 && (
                <button className="btn-secondary" onClick={() => handleGenerateFromCE(conceptualEntities[0])}>
                  <TransformIcon style={{ fontSize: 16 }} />
                  Generate from "{conceptualEntities[0].name}"
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="model-list">
            {models.map(model => (
              <ModelCard
                key={model.id}
                model={model}
                isExpanded={expandedId === model.id}
                onToggle={() => setExpandedId(expandedId === model.id ? null : model.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                allModels={models}
              />
            ))}
          </div>
        ) : (
          <SchemaDiagram models={models} />
        )}
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <ModelFormModal
          model={editingModel}
          onSave={handleSave}
          onClose={() => { setShowFormModal(false); setEditingModel(null); }}
          conceptualEntities={conceptualEntities}
        />
      )}

      <style jsx>{`
        .logical-model {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #FDFCFA;
        }
        .lm-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          border-bottom: 1px solid #E2E0DB;
          background: #F0EFEC;
          flex-shrink: 0;
        }
        .toolbar-left, .toolbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: #47453F;
          color: #F0EFEC;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 120ms ease-out;
          white-space: nowrap;
        }
        .btn-primary:hover { background: #35332F; transform: translateY(-1px); }
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: #FDFCFA;
          color: #1F1E1B;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
        }
        .btn-secondary:hover { background: #E2E0DB; }
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
        }
        .tool-btn:hover { background: #E2E0DB; }
        .generate-dropdown {
          position: relative;
        }
        .generate-dropdown:hover .dropdown-menu {
          display: flex;
        }
        .dropdown-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(31, 30, 27, 0.12);
          flex-direction: column;
          min-width: 180px;
          z-index: 10;
          margin-top: 2px;
        }
        .dropdown-menu button {
          padding: 8px 12px;
          background: none;
          border: none;
          text-align: left;
          font-size: 13px;
          color: #1F1E1B;
          cursor: pointer;
        }
        .dropdown-menu button:hover { background: #F0EFEC; }
        .view-toggle {
          display: flex;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          overflow: hidden;
        }
        .view-toggle button {
          padding: 4px 8px;
          background: #FDFCFA;
          border: none;
          border-right: 1px solid #E2E0DB;
          color: #9C9A94;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .view-toggle button:last-child { border-right: none; }
        .view-toggle button.active { background: #47453F; color: #F0EFEC; }
        .lm-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .lm-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 12px;
        }
        .lm-empty-state h3 {
          margin: 0;
          font-size: 18px;
          color: #1F1E1B;
        }
        .lm-empty-state p {
          margin: 0;
          font-size: 14px;
          color: #9C9A94;
          text-align: center;
        }
        .empty-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .model-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}

export { ColumnEditor, ModelCard, SchemaDiagram, ModelFormModal };
