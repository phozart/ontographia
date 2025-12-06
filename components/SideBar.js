import { useEffect, useState } from 'react';
import { useFilter } from './FilterContext';

export default function Sidebar({ collapsed = false, onToggle }) {
  const [types, setTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [typeOpen, setTypeOpen] = useState(true);
  const { setTypeFilters } = useFilter();

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    setTypeFilters(selectedTypes);
  }, [selectedTypes, setTypeFilters]);

  async function loadTypes() {
    try {
      const res = await fetch('/api/node-types');
      if (!res.ok) return;
      const data = await res.json();
      setTypes(data);
    } catch (e) {
      console.error('Failed to load node types', e);
    }
  }

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <button className="sidebar-toggle" type="button" onClick={onToggle} aria-label="Toggle filters">
        {collapsed ? '>' : '<'}
      </button>
      {!collapsed && (
        <div className="sidebar-content">
          <h3>Filters</h3>
          <div className="filter-section">
            <button
              type="button"
              className="filter-header"
              onClick={() => setTypeOpen(v => !v)}
              aria-expanded={typeOpen}
            >
              <span>Node types</span>
              <span className="filter-chevron">{typeOpen ? 'v' : '>'}</span>
            </button>
            {typeOpen && (
              <>
                <div className="type-list">
                  {types.map(t => {
                    const active = selectedTypes.includes(t.id);
                    return (
                      <label key={t.id} className="type-option">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => {
                            setSelectedTypes(prev =>
                              prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id]
                            );
                          }}
                        />
                        <span className="pill-dot" style={{ background: t.color || '#9ca3af' }} />
                        <span>{t.name}</span>
                      </label>
                    );
                  })}
                  {types.length === 0 && <div className="muted">No types yet</div>}
                </div>
                {selectedTypes.length > 0 && (
                  <div className="selected-chips">
                    {selectedTypes.map(id => {
                      const match = types.find(t => t.id === id);
                      return (
                        <span key={id} className="chip">
                          {match ? match.name : id}
                          <button
                            type="button"
                            className="chip-remove"
                            onClick={() => setSelectedTypes(prev => prev.filter(x => x !== id))}
                            aria-label="Remove"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                    <button type="button" className="link" onClick={() => setSelectedTypes([])}>
                      Clear
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
