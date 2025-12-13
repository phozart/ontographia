// components/ba/blocks/ArtefactTableBlock.js
// Filtered table of artefacts block

import { useMemo } from 'react';
import { useArtefacts, ARTEFACT_TYPES, ARTEFACT_STATUS, PRIORITY } from '../../ArtefactContext';

const AVAILABLE_COLUMNS = [
  { id: 'name', name: 'Name' },
  { id: 'type', name: 'Type' },
  { id: 'status', name: 'Status' },
  { id: 'priority', name: 'Priority' },
  { id: 'description', name: 'Description' },
];

export default function ArtefactTableBlock({ content, onChange, onDelete, isEditing, onSelectArtefact }) {
  const { filter = {}, columns = ['name', 'status', 'priority'] } = content || {};
  const { artefacts } = useArtefacts();

  // Filter artefacts
  const filteredArtefacts = useMemo(() => {
    return artefacts.filter((a) => {
      if (filter.type && a.artefactType !== filter.type) return false;
      if (filter.status && a.status !== filter.status) return false;
      return true;
    });
  }, [artefacts, filter]);

  const handleFilterChange = (key, value) => {
    onChange({
      ...content,
      filter: { ...filter, [key]: value || null },
    });
  };

  const handleColumnToggle = (colId) => {
    const newColumns = columns.includes(colId)
      ? columns.filter((c) => c !== colId)
      : [...columns, colId];
    if (newColumns.length > 0) {
      onChange({ ...content, columns: newColumns });
    }
  };

  const renderCellValue = (artefact, column) => {
    switch (column) {
      case 'name':
        return artefact.name;
      case 'type':
        const typeDef = ARTEFACT_TYPES[artefact.artefactType];
        return (
          <span className="type-badge" style={{ backgroundColor: typeDef?.color }}>
            {typeDef?.icon}
          </span>
        );
      case 'status':
        const statusDef = ARTEFACT_STATUS[artefact.status];
        return (
          <span className="status-badge" style={{ color: statusDef?.color }}>
            {statusDef?.name}
          </span>
        );
      case 'priority':
        const priorDef = PRIORITY[artefact.priority];
        return (
          <span className="priority-badge" style={{ color: priorDef?.color }}>
            {artefact.priority}
          </span>
        );
      case 'description':
        return artefact.description?.slice(0, 50) + (artefact.description?.length > 50 ? '...' : '') || '-';
      default:
        return '-';
    }
  };

  if (!isEditing) {
    return (
      <div className="block-artefact-table-view">
        {filteredArtefacts.length === 0 ? (
          <div className="empty-table">No artefacts match the filter</div>
        ) : (
          <table className="artefact-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{AVAILABLE_COLUMNS.find((c) => c.id === col)?.name || col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredArtefacts.map((a) => (
                <tr
                  key={a.id}
                  className="artefact-row"
                  onClick={() => onSelectArtefact?.(a)}
                >
                  {columns.map((col) => (
                    <td key={col}>{renderCellValue(a, col)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="table-footer">
          {filteredArtefacts.length} artefact{filteredArtefacts.length !== 1 ? 's' : ''}
        </div>
      </div>
    );
  }

  return (
    <div className="block-artefact-table-edit">
      <div className="filter-section">
        <h5>Filters</h5>
        <div className="filter-row">
          <label>Type:</label>
          <select
            value={filter.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            {Object.entries(ARTEFACT_TYPES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-row">
          <label>Status:</label>
          <select
            value={filter.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {Object.entries(ARTEFACT_STATUS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="columns-section">
        <h5>Columns</h5>
        <div className="column-toggles">
          {AVAILABLE_COLUMNS.map((col) => (
            <label key={col.id} className="column-toggle">
              <input
                type="checkbox"
                checked={columns.includes(col.id)}
                onChange={() => handleColumnToggle(col.id)}
              />
              {col.name}
            </label>
          ))}
        </div>
      </div>

      <div className="preview-section">
        <h5>Preview ({filteredArtefacts.length} items)</h5>
        <table className="preview-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{AVAILABLE_COLUMNS.find((c) => c.id === col)?.name || col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredArtefacts.slice(0, 3).map((a) => (
              <tr key={a.id}>
                {columns.map((col) => (
                  <td key={col}>{renderCellValue(a, col)}</td>
                ))}
              </tr>
            ))}
            {filteredArtefacts.length > 3 && (
              <tr>
                <td colSpan={columns.length} className="more-rows">
                  + {filteredArtefacts.length - 3} more...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
