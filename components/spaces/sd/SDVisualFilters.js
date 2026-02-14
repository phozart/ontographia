// components/sd/SDVisualFilters.js
// EPIC 2.6 - Polarity Toggles & Visual Filters
import { useState, useCallback } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LoopIcon from '@mui/icons-material/Loop';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Filter definitions
export const VISUAL_FILTERS = {
  showPolarity: {
    id: 'showPolarity',
    name: 'Polarity Labels',
    description: 'Show +/- on causal links',
    icon: '±',
    defaultValue: true,
  },
  showDelays: {
    id: 'showDelays',
    name: 'Delay Icons',
    description: 'Show delay indicators on links',
    icon: '⏱',
    defaultValue: true,
  },
  highlightPositive: {
    id: 'highlightPositive',
    name: 'Highlight Positive Links',
    description: 'Emphasize positive causal links',
    icon: '+',
    defaultValue: false,
  },
  highlightNegative: {
    id: 'highlightNegative',
    name: 'Highlight Negative Links',
    description: 'Emphasize negative causal links',
    icon: '-',
    defaultValue: false,
  },
  highlightReinforcing: {
    id: 'highlightReinforcing',
    name: 'Reinforcing Loops Only',
    description: 'Show only reinforcing loop paths',
    icon: 'R',
    defaultValue: false,
  },
  highlightBalancing: {
    id: 'highlightBalancing',
    name: 'Balancing Loops Only',
    description: 'Show only balancing loop paths',
    icon: 'B',
    defaultValue: false,
  },
  showConnectedOnly: {
    id: 'showConnectedOnly',
    name: 'Connected to Selection',
    description: 'Highlight only links connected to selected node',
    icon: '⟷',
    defaultValue: false,
  },
};

// Hook for managing visual filters
export function useVisualFilters() {
  const [filters, setFilters] = useState({
    showPolarity: true,
    showDelays: true,
    highlightPositive: false,
    highlightNegative: false,
    highlightReinforcing: false,
    highlightBalancing: false,
    showConnectedOnly: false,
  });

  const toggleFilter = useCallback((filterId) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: !prev[filterId],
    }));
  }, []);

  const setFilter = useCallback((filterId, value) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      showPolarity: true,
      showDelays: true,
      highlightPositive: false,
      highlightNegative: false,
      highlightReinforcing: false,
      highlightBalancing: false,
      showConnectedOnly: false,
    });
  }, []);

  // Apply filter logic to determine if element/connection should be highlighted
  const getFilteredStyle = useCallback((element, connections, selectedId, loops) => {
    const styles = {
      opacity: 1,
      highlighted: false,
      dimmed: false,
    };

    // Connection-specific filtering
    if (element.source && element.target) {
      // This is a connection
      if (filters.highlightPositive && element.type === 'positive') {
        styles.highlighted = true;
      }
      if (filters.highlightNegative && element.type === 'negative') {
        styles.highlighted = true;
      }

      // Show connected only filter
      if (filters.showConnectedOnly && selectedId) {
        if (element.source !== selectedId && element.target !== selectedId) {
          styles.dimmed = true;
          styles.opacity = 0.2;
        } else {
          styles.highlighted = true;
        }
      }

      // Loop highlighting
      if (filters.highlightReinforcing || filters.highlightBalancing) {
        let isInTargetLoop = false;
        loops?.forEach(loop => {
          if (loop.connectionIds?.includes(element.id)) {
            if ((filters.highlightReinforcing && loop.type === 'R') ||
                (filters.highlightBalancing && loop.type === 'B')) {
              isInTargetLoop = true;
            }
          }
        });
        if (!isInTargetLoop) {
          styles.dimmed = true;
          styles.opacity = 0.2;
        } else {
          styles.highlighted = true;
        }
      }

      // Polarity visibility
      if (!filters.showPolarity) {
        styles.hidePolarity = true;
      }

      // Delay visibility
      if (!filters.showDelays) {
        styles.hideDelay = true;
      }
    } else {
      // This is a node
      if (filters.showConnectedOnly && selectedId && element.id !== selectedId) {
        const isConnected = connections?.some(
          c => c.source === element.id || c.target === element.id
        ) && connections?.some(
          c => (c.source === element.id && c.target === selectedId) ||
               (c.target === element.id && c.source === selectedId)
        );
        if (!isConnected) {
          styles.dimmed = true;
          styles.opacity = 0.3;
        }
      }

      // Loop node highlighting
      if (filters.highlightReinforcing || filters.highlightBalancing) {
        let isInTargetLoop = false;
        loops?.forEach(loop => {
          if (loop.nodeIds?.includes(element.id)) {
            if ((filters.highlightReinforcing && loop.type === 'R') ||
                (filters.highlightBalancing && loop.type === 'B')) {
              isInTargetLoop = true;
            }
          }
        });
        if (!isInTargetLoop) {
          styles.dimmed = true;
          styles.opacity = 0.3;
        }
      }
    }

    return styles;
  }, [filters]);

  return {
    filters,
    toggleFilter,
    setFilter,
    resetFilters,
    getFilteredStyle,
  };
}

export default function SDVisualFilters({
  filters,
  onToggleFilter,
  onResetFilters,
  activeFiltersCount = 0,
  collapsed = false,
  onToggleCollapse,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const basicFilters = ['showPolarity', 'showDelays'];
  const highlightFilters = ['highlightPositive', 'highlightNegative'];
  const loopFilters = ['highlightReinforcing', 'highlightBalancing'];
  const advancedFilters = ['showConnectedOnly'];

  return (
    <div className="sd-visual-filters">
      <div className="filters-header" onClick={onToggleCollapse}>
        <FilterListIcon fontSize="small" />
        <span className="filters-title">Visual Filters</span>
        {activeFiltersCount > 0 && (
          <span className="filter-badge">{activeFiltersCount}</span>
        )}
      </div>

      {!collapsed && (
        <div className="filters-content">
          {/* Display Options */}
          <div className="filter-section">
            <div className="section-title">Display</div>
            {basicFilters.map(filterId => (
              <label key={filterId} className="filter-toggle">
                <input
                  type="checkbox"
                  checked={filters[filterId]}
                  onChange={() => onToggleFilter?.(filterId)}
                />
                <span className="filter-icon">{VISUAL_FILTERS[filterId].icon}</span>
                <span className="filter-name">{VISUAL_FILTERS[filterId].name}</span>
              </label>
            ))}
          </div>

          {/* Polarity Highlighting */}
          <div className="filter-section">
            <div className="section-title">Highlight by Polarity</div>
            <div className="filter-row">
              {highlightFilters.map(filterId => (
                <button
                  key={filterId}
                  className={`polarity-filter-btn ${filterId.includes('Positive') ? 'positive' : 'negative'} ${filters[filterId] ? 'active' : ''}`}
                  onClick={() => onToggleFilter?.(filterId)}
                  title={VISUAL_FILTERS[filterId].description}
                >
                  {filterId.includes('Positive') ? (
                    <AddIcon fontSize="small" />
                  ) : (
                    <RemoveIcon fontSize="small" />
                  )}
                  <span>{filterId.includes('Positive') ? 'Positive' : 'Negative'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loop Highlighting */}
          <div className="filter-section">
            <div className="section-title">Highlight by Loop Type</div>
            <div className="filter-row">
              {loopFilters.map(filterId => (
                <button
                  key={filterId}
                  className={`loop-filter-btn ${filterId.includes('Reinforcing') ? 'reinforcing' : 'balancing'} ${filters[filterId] ? 'active' : ''}`}
                  onClick={() => onToggleFilter?.(filterId)}
                  title={VISUAL_FILTERS[filterId].description}
                >
                  <LoopIcon fontSize="small" />
                  <span>{filterId.includes('Reinforcing') ? 'R' : 'B'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="filter-section">
            <button
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '− Advanced' : '+ Advanced'}
            </button>

            {showAdvanced && (
              <div className="advanced-filters">
                {advancedFilters.map(filterId => (
                  <label key={filterId} className="filter-toggle">
                    <input
                      type="checkbox"
                      checked={filters[filterId]}
                      onChange={() => onToggleFilter?.(filterId)}
                    />
                    <span className="filter-name">{VISUAL_FILTERS[filterId].name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Reset */}
          {activeFiltersCount > 0 && (
            <button className="reset-filters-btn" onClick={onResetFilters}>
              Reset all filters
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .sd-visual-filters {
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          overflow: hidden;
        }

        .filters-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg);
          cursor: pointer;
          user-select: none;
        }

        .filters-title {
          flex: 1;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .filter-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: var(--accent);
          color: white;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 600;
        }

        .filters-content {
          padding: 10px 12px;
        }

        .filter-section {
          margin-bottom: 12px;
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          cursor: pointer;
        }

        .filter-toggle input {
          width: 16px;
          height: 16px;
          accent-color: var(--accent);
        }

        .filter-icon {
          font-size: 12px;
          width: 18px;
          text-align: center;
        }

        .filter-name {
          font-size: 13px;
          color: var(--text);
        }

        .filter-row {
          display: flex;
          gap: 6px;
        }

        .polarity-filter-btn, .loop-filter-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: transparent;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .polarity-filter-btn.positive:hover,
        .polarity-filter-btn.positive.active {
          border-color: #22c55e;
          color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }

        .polarity-filter-btn.negative:hover,
        .polarity-filter-btn.negative.active {
          border-color: #ef4444;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .loop-filter-btn.reinforcing:hover,
        .loop-filter-btn.reinforcing.active {
          border-color: #3b82f6;
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }

        .loop-filter-btn.balancing:hover,
        .loop-filter-btn.balancing.active {
          border-color: #ef4444;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .advanced-toggle {
          width: 100%;
          padding: 6px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          text-align: left;
        }

        .advanced-toggle:hover {
          color: var(--text);
        }

        .advanced-filters {
          padding-top: 8px;
        }

        .reset-filters-btn {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: transparent;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-filters-btn:hover {
          background: var(--bg);
          color: var(--text);
        }
      `}</style>
    </div>
  );
}
