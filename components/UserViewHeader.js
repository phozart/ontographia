import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export default function UserViewHeader({
  nodeTypes,
  selectedType,
  onSelectType,
  nodeQuery,
  onNodeQueryChange,
  filteredNodes,
  direction,
  onDirectionChange,
  loading,
  onRefresh,
  selectedNodeId,
  onExpandAll,
  onCollapseAll,
  onShowAll,
  crumbs,
  onCrumbHome,
  onCrumbSelect,
  onInfo,
}) {
  return (
    <div className="user-filters">
      <div className="user-filters__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ margin: 0 }}>Semantic Model Browser</h2>
          <Tooltip title="What is this page?">
            <IconButton size="small" onClick={onInfo} aria-label="Semantic Model Browser info">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        {selectedNodeId && (
          <button className="chip-toggle" onClick={onShowAll}>
            Clear focus
          </button>
        )}
      </div>
      <div className="user-filters__grid">
        <div className="form-group">
          <label>Node type</label>
          <select value={selectedType} onChange={e => onSelectType(e.target.value)}>
            <option value="">All types</option>
            {nodeTypes.map(t => (
              <option key={t.id || t.name || t.label} value={t.id || t.name || t.label}>
                {t.label || t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Node</label>
          <input
            list="node-options"
            value={nodeQuery}
            placeholder="Search node"
            onChange={e => onNodeQueryChange(e.target.value)}
          />
          <datalist id="node-options">
            {filteredNodes.map(n => (
              <option key={n.id} value={n.label || n.name}>
                {n.name}
              </option>
            ))}
          </datalist>
        </div>
        <div className="form-group">
          <label>Direction</label>
          <select value={direction} onChange={e => onDirectionChange(e.target.value)}>
            <option value="out">Top-down</option>
            <option value="in">Bottom-up</option>
          </select>
        </div>
        <div className="user-filters__actions">
          <button className="btn-secondary" onClick={onRefresh} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          
        </div>
      </div>
      {crumbs && crumbs.length > 0 && (
        <div className="user-filters__crumbs">
          <button className="btn-small" onClick={onCrumbHome}>
            Home
          </button>
          {crumbs.map((c, idx) => (
            <button
              key={c.id}
              className="chip-toggle"
              onClick={() => onCrumbSelect(c, idx)}
            >
              {c.name || 'Node'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
