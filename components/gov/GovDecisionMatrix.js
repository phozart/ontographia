/**
 * GovDecisionMatrix - Visual decision rights matrix
 *
 * Displays a matrix of decision types vs forums showing who has what rights.
 *
 * @component
 * @module components/gov/GovDecisionMatrix
 */

import { useState, useMemo } from 'react';
import { GOV_DECISION_SCOPE, GOV_RACI_TYPES } from './GovContext';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import GavelIcon from '@mui/icons-material/Gavel';
import GroupsIcon from '@mui/icons-material/Groups';

const RIGHT_TYPE_COLORS = {
  decide: '#ef4444',
  approve: '#f59e0b',
  recommend: '#22c55e',
  consult: '#3b82f6',
  inform: '#9ca3af',
};

const RIGHT_TYPE_ABBREV = {
  decide: 'D',
  approve: 'A',
  recommend: 'R',
  consult: 'C',
  inform: 'I',
};

/**
 * Matrix Cell Component
 */
function MatrixCell({ cell, onEdit }) {
  if (!cell) {
    return (
      <td className="matrix-cell empty">
        <button className="add-cell-btn" onClick={onEdit} title="Add decision right">
          <AddIcon fontSize="small" />
        </button>
      </td>
    );
  }

  const color = RIGHT_TYPE_COLORS[cell.rightType] || '#9ca3af';
  const abbrev = RIGHT_TYPE_ABBREV[cell.rightType] || '?';

  return (
    <td className="matrix-cell filled">
      <button
        className="cell-content"
        style={{ backgroundColor: `${color}20`, color }}
        onClick={onEdit}
        title={cell.constraints || cell.rightType}
      >
        <span className="cell-letter">{abbrev}</span>
        {cell.constraints && <InfoIcon fontSize="small" className="cell-info" />}
      </button>
    </td>
  );
}

/**
 * GovDecisionMatrix Component
 */
export default function GovDecisionMatrix({ matrix, onSelect, onEdit, onCreate }) {
  const [highlightedScope, setHighlightedScope] = useState(null);

  // Group rows by scope
  const groupedRows = useMemo(() => {
    if (!matrix?.rows) return {};
    const groups = {};
    matrix.rows.forEach(row => {
      const scope = row.scope || 'unassigned';
      if (!groups[scope]) groups[scope] = [];
      groups[scope].push(row);
    });
    return groups;
  }, [matrix?.rows]);

  const scopeOrder = ['strategic', 'tactical', 'operational', 'unassigned'];

  if (!matrix || (matrix.rows?.length === 0 && matrix.columns?.length === 0)) {
    return (
      <div className="matrix-empty">
        <GavelIcon style={{ fontSize: 64, color: 'var(--text-muted)' }} />
        <h3>No Decision Rights Matrix Yet</h3>
        <p>Create decision types and forums first, then assign decision rights.</p>
        <div className="empty-actions">
          <button className="btn-primary" onClick={() => onCreate('gov_decision_type')}>
            <AddIcon fontSize="small" />
            Add Decision Type
          </button>
          <button className="btn-secondary" onClick={() => onCreate('gov_forum')}>
            <GroupsIcon fontSize="small" />
            Add Forum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="decision-matrix">
      <div className="matrix-header">
        <h3>Decision Rights Matrix</h3>
        <div className="matrix-legend">
          {Object.entries(RIGHT_TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="legend-item">
              <span className="legend-badge" style={{ backgroundColor: `${color}20`, color }}>
                {RIGHT_TYPE_ABBREV[type]}
              </span>
              <span className="legend-label">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="matrix-container">
        <table className="matrix-table">
          <thead>
            <tr>
              <th className="corner-cell">Decision Type</th>
              {matrix.columns?.map(col => (
                <th key={col.id} className="forum-header">
                  <button
                    className="header-btn"
                    onClick={() => onSelect(col.id)}
                    title={col.type || 'Forum'}
                  >
                    <GroupsIcon fontSize="small" />
                    <span>{col.name}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scopeOrder.map(scope => {
              const rows = groupedRows[scope];
              if (!rows || rows.length === 0) return null;
              const scopeDef = GOV_DECISION_SCOPE[scope] || { name: scope, color: '#9ca3af' };

              return (
                <>
                  <tr key={`scope-${scope}`} className="scope-row">
                    <td
                      colSpan={(matrix.columns?.length || 0) + 1}
                      className="scope-header"
                      style={{ borderLeftColor: scopeDef.color }}
                      onMouseEnter={() => setHighlightedScope(scope)}
                      onMouseLeave={() => setHighlightedScope(null)}
                    >
                      <span className="scope-name">{scopeDef.name}</span>
                      <span className="scope-desc">{scopeDef.description}</span>
                    </td>
                  </tr>
                  {rows.map(row => (
                    <tr
                      key={row.id}
                      className={`decision-row ${highlightedScope === scope ? 'highlighted' : ''}`}
                    >
                      <td className="decision-type-cell">
                        <button className="type-btn" onClick={() => onSelect(row.id)}>
                          {row.name}
                        </button>
                      </td>
                      {matrix.columns?.map(col => {
                        const cellKey = `${row.id}_${col.id}`;
                        const cell = matrix.cells?.[cellKey];
                        return (
                          <MatrixCell
                            key={cellKey}
                            cell={cell}
                            onEdit={() => onCreate('gov_decision_right')}
                          />
                        );
                      })}
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="matrix-footer">
        <button className="btn-add-row" onClick={() => onCreate('gov_decision_type')}>
          <AddIcon fontSize="small" />
          Add Decision Type
        </button>
        <button className="btn-add-col" onClick={() => onCreate('gov_forum')}>
          <AddIcon fontSize="small" />
          Add Forum
        </button>
      </div>

      <style jsx>{`
        .decision-matrix {
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .matrix-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .matrix-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: var(--text);
        }

        .matrix-legend {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-badge {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .legend-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .matrix-container {
          flex: 1;
          overflow: auto;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--panel);
        }

        .matrix-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }

        .corner-cell {
          position: sticky;
          left: 0;
          background: var(--panel);
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text);
          border-bottom: 1px solid var(--border);
          z-index: 2;
        }

        .forum-header {
          padding: 8px;
          text-align: center;
          border-bottom: 1px solid var(--border);
          min-width: 100px;
        }

        .header-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text);
          width: 100%;
        }

        .header-btn:hover {
          color: var(--accent);
        }

        .header-btn span {
          font-size: 0.8rem;
          font-weight: 500;
        }

        .scope-row .scope-header {
          padding: 8px 16px;
          background: var(--bg);
          border-left: 4px solid;
          font-size: 0.85rem;
        }

        .scope-name {
          font-weight: 600;
          color: var(--text);
          margin-right: 12px;
        }

        .scope-desc {
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .decision-row {
          transition: background 0.2s;
        }

        .decision-row.highlighted {
          background: var(--bg);
        }

        .decision-type-cell {
          position: sticky;
          left: 0;
          background: var(--panel);
          padding: 8px 16px;
          border-bottom: 1px solid var(--border);
          z-index: 1;
        }

        .decision-row.highlighted .decision-type-cell {
          background: var(--bg);
        }

        .type-btn {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          text-align: left;
          font-size: 0.9rem;
          color: var(--text);
        }

        .type-btn:hover {
          color: var(--accent);
        }

        .matrix-cell {
          padding: 8px;
          text-align: center;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }

        .matrix-cell.empty {
          background: var(--panel);
        }

        .add-cell-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          border: 1px dashed var(--border);
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-muted);
          opacity: 0.3;
          transition: opacity 0.2s;
          margin: 0 auto;
        }

        .matrix-cell:hover .add-cell-btn {
          opacity: 1;
        }

        .add-cell-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .cell-content {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          cursor: pointer;
          border: none;
          margin: 0 auto;
          position: relative;
        }

        .cell-content:hover {
          opacity: 0.8;
        }

        .cell-letter {
          font-weight: 700;
          font-size: 0.9rem;
        }

        .cell-info {
          position: absolute;
          top: -4px;
          right: -4px;
          font-size: 12px !important;
          opacity: 0.7;
        }

        .matrix-footer {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .btn-add-row, .btn-add-col {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--bg);
          border: 1px dashed var(--border);
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .btn-add-row:hover, .btn-add-col:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        /* Empty State */
        .matrix-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px;
          text-align: center;
          height: 100%;
        }

        .matrix-empty h3 {
          margin: 24px 0 8px;
          color: var(--text);
        }

        .matrix-empty p {
          margin: 0 0 24px;
          color: var(--text-muted);
        }

        .empty-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--panel);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-primary:hover, .btn-secondary:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
