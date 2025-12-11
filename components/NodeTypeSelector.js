// components/NodeTypeSelector.js
import { useState, useEffect, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';

export default function NodeTypeSelector({
  open,
  position,
  nodeTypes = [],
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

  const filteredTypes = nodeTypes.filter(t => {
    const name = (t.label || t.name || '').toLowerCase();
    return name.includes(filter.toLowerCase());
  });

  // Calculate popup position to stay within viewport
  const style = {
    position: 'absolute',
    left: position?.x ?? 100,
    top: position?.y ?? 100,
    zIndex: 1000,
  };

  return (
    <div ref={containerRef} className="type-selector-popup" style={style}>
      <div className="type-selector-header">
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Select Node Type</h4>
      </div>
      <div className="type-selector-search">
        <SearchIcon fontSize="small" style={{ color: 'var(--text-muted)' }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search types..."
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
              className="type-swatch"
              style={{
                backgroundColor: t.color || '#9ca3af',
                borderRadius: t.shape === 'diamond' ? '2px' : t.shape === 'rectangle' ? '4px' : '50%',
              }}
            />
            <span className="type-selector-label">{t.label || t.name}</span>
            {t.layer && (
              <span className="type-selector-layer">{t.layer}</span>
            )}
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
