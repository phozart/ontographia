// components/RelationshipTypeSelector.js
import { useState, useEffect, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function RelationshipTypeSelector({
  open,
  position,
  relationshipTypes = [],
  sourceNode,
  targetNode,
  onSelect,
  onCancel,
}) {
  const [filter, setFilter] = useState('');
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    setFilter('');
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onCancel();
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onCancel();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  const filteredTypes = relationshipTypes.filter(t => {
    const name = (t.label || t.name || '').toLowerCase();
    return name.includes(filter.toLowerCase());
  });

  const sourceName = sourceNode?.name || sourceNode?.label || 'Source';
  const targetName = targetNode?.name || targetNode?.label || 'Target';

  const style = {
    position: 'absolute',
    left: position?.x ?? 100,
    top: position?.y ?? 100,
    zIndex: 1000,
  };

  return (
    <div ref={containerRef} className="type-selector-popup" style={style}>
      <div className="type-selector-header">
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Select Relationship Type</h4>
      </div>

      <div className="connection-preview">
        <span className="connection-node-name">{sourceName}</span>
        <ArrowForwardIcon fontSize="small" style={{ color: 'var(--text-muted)' }} />
        <span className="connection-node-name">{targetName}</span>
      </div>

      <div className="type-selector-search">
        <SearchIcon fontSize="small" style={{ color: 'var(--text-muted)' }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search relationship types..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="type-selector-input"
        />
      </div>
      <div className="type-selector-list">
        {filteredTypes.length === 0 && (
          <div className="type-selector-empty">No matching types</div>
        )}
        {filteredTypes.map(t => (
          <button
            key={t.id || t.name}
            type="button"
            className="type-selector-item"
            onClick={() => onSelect(t)}
          >
            <span
              className="type-swatch type-swatch--edge"
              style={{ backgroundColor: t.color || '#6b7280' }}
            />
            <span className="type-selector-label">{t.label || t.name}</span>
          </button>
        ))}
      </div>
      <div className="type-selector-footer">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
