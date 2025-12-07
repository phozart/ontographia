import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LoopIcon from '@mui/icons-material/Loop';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export default function UserViewHeader({
  nodeTypes,
  selectedType,
  onSelectType,
  layers = [],
  selectedLayer = '',
  onSelectLayer,
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
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={onRefresh} disabled={loading} aria-label="Refresh">
                <LoopIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="What is this page?">
            <IconButton size="small" onClick={onInfo} aria-label="Semantic Model Browser info">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {selectedNodeId && (
            <Tooltip title="Clear focus">
              <IconButton size="small" onClick={onShowAll} aria-label="Clear focus">
                <HighlightOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="user-filters__grid">
        <div className="form-group">
          <label>Layer</label>
          <input
            list="layer-options"
            value={selectedLayer}
            placeholder="Any layer"
            onChange={e => onSelectLayer(e.target.value)}
          />
          <datalist id="layer-options">
            {layers.map(layer => (
              <option key={layer} value={layer}>
                {layer}
              </option>
            ))}
          </datalist>
        </div>
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
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label>Direction</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <Tooltip title="Top-down">
              <IconButton
                size="small"
                onClick={() => onDirectionChange('out')}
                sx={{
                  border: '1px solid var(--border)',
                  background: direction === 'out' ? 'var(--nav-active-bg)' : 'var(--panel)',
                  color: direction === 'out' ? 'var(--nav-active-color)' : 'var(--text)',
                }}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Bottom-up">
              <IconButton
                size="small"
                onClick={() => onDirectionChange('in')}
                sx={{
                  border: '1px solid var(--border)',
                  background: direction === 'in' ? 'var(--nav-active-bg)' : 'var(--panel)',
                  color: direction === 'in' ? 'var(--nav-active-color)' : 'var(--text)',
                }}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
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
