// components/sd/SDCognitiveMarkers.js
// EPIC 2.7 - CLD Cognitive Markers
import { useState, useCallback } from 'react';
import LabelIcon from '@mui/icons-material/Label';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TuneIcon from '@mui/icons-material/Tune';
import PublicIcon from '@mui/icons-material/Public';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import BlockIcon from '@mui/icons-material/Block';
import WarningIcon from '@mui/icons-material/Warning';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';

// Cognitive marker definitions
export const COGNITIVE_MARKERS = {
  indicator: {
    id: 'indicator',
    name: 'Indicator',
    description: 'A variable that measures system performance',
    icon: '📊',
    color: '#3b82f6',
    symbol: 'I',
  },
  decision: {
    id: 'decision',
    name: 'Decision Lever',
    description: 'A variable that can be directly controlled',
    icon: '🎛️',
    color: '#8b5cf6',
    symbol: 'D',
  },
  external: {
    id: 'external',
    name: 'External Driver',
    description: 'A variable influenced by external factors',
    icon: '🌍',
    color: '#10b981',
    symbol: 'E',
  },
  kpi: {
    id: 'kpi',
    name: 'KPI',
    description: 'Key Performance Indicator',
    icon: '🎯',
    color: '#f59e0b',
    symbol: 'K',
  },
  constraint: {
    id: 'constraint',
    name: 'Constraint',
    description: 'A limiting factor in the system',
    icon: '🚧',
    color: '#ef4444',
    symbol: 'C',
  },
  risk: {
    id: 'risk',
    name: 'Risk / Bottleneck',
    description: 'A potential risk or bottleneck',
    icon: '⚠️',
    color: '#f97316',
    symbol: 'R',
  },
  leverage: {
    id: 'leverage',
    name: 'Key Leverage Point',
    description: 'A high-impact intervention point',
    icon: '⭐',
    color: '#eab308',
    symbol: 'L',
  },
};

// Hook for managing cognitive markers on elements
export function useCognitiveMarkers(elements, onUpdateElement) {
  const [showMarkers, setShowMarkers] = useState(true);

  const addMarker = useCallback((elementId, markerId) => {
    const element = elements?.find(el => el.id === elementId);
    if (!element) return;

    const markers = element.cognitiveMarkers || [];
    if (!markers.includes(markerId)) {
      onUpdateElement?.(elementId, {
        cognitiveMarkers: [...markers, markerId],
      });
    }
  }, [elements, onUpdateElement]);

  const removeMarker = useCallback((elementId, markerId) => {
    const element = elements?.find(el => el.id === elementId);
    if (!element) return;

    const markers = element.cognitiveMarkers || [];
    onUpdateElement?.(elementId, {
      cognitiveMarkers: markers.filter(m => m !== markerId),
    });
  }, [elements, onUpdateElement]);

  const toggleMarker = useCallback((elementId, markerId) => {
    const element = elements?.find(el => el.id === elementId);
    if (!element) return;

    const markers = element.cognitiveMarkers || [];
    if (markers.includes(markerId)) {
      removeMarker(elementId, markerId);
    } else {
      addMarker(elementId, markerId);
    }
  }, [elements, addMarker, removeMarker]);

  const clearMarkers = useCallback((elementId) => {
    onUpdateElement?.(elementId, { cognitiveMarkers: [] });
  }, [onUpdateElement]);

  const getElementMarkers = useCallback((elementId) => {
    const element = elements?.find(el => el.id === elementId);
    return element?.cognitiveMarkers || [];
  }, [elements]);

  const getMarkerInfo = useCallback((markerId) => {
    return COGNITIVE_MARKERS[markerId];
  }, []);

  return {
    showMarkers,
    setShowMarkers,
    addMarker,
    removeMarker,
    toggleMarker,
    clearMarkers,
    getElementMarkers,
    getMarkerInfo,
  };
}

// Marker selector component for the properties panel
export function MarkerSelector({
  elementId,
  currentMarkers = [],
  onToggleMarker,
  onClearMarkers,
}) {
  return (
    <div className="marker-selector">
      <div className="marker-header">
        <LabelIcon fontSize="small" />
        <span>Cognitive Markers</span>
        {currentMarkers.length > 0 && (
          <button className="clear-btn" onClick={() => onClearMarkers?.(elementId)}>
            Clear all
          </button>
        )}
      </div>

      <div className="marker-grid">
        {Object.values(COGNITIVE_MARKERS).map(marker => (
          <button
            key={marker.id}
            className={`marker-btn ${currentMarkers.includes(marker.id) ? 'active' : ''}`}
            onClick={() => onToggleMarker?.(elementId, marker.id)}
            title={marker.description}
            style={{
              '--marker-color': marker.color,
            }}
          >
            <span className="marker-icon">{marker.icon}</span>
            <span className="marker-name">{marker.name}</span>
          </button>
        ))}
      </div>

      {currentMarkers.length > 0 && (
        <div className="active-markers">
          <span className="active-label">Active:</span>
          {currentMarkers.map(markerId => {
            const marker = COGNITIVE_MARKERS[markerId];
            return (
              <span
                key={markerId}
                className="active-marker-tag"
                style={{ backgroundColor: `${marker.color}20`, color: marker.color }}
              >
                {marker.icon} {marker.symbol}
                <button
                  className="remove-marker"
                  onClick={() => onToggleMarker?.(elementId, markerId)}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .marker-selector {
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px;
          background: var(--bg);
        }

        .marker-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .marker-header span {
          flex: 1;
        }

        .clear-btn {
          padding: 2px 8px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          font-size: 10px;
          cursor: pointer;
        }

        .clear-btn:hover {
          background: var(--border);
          color: var(--text);
        }

        .marker-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }

        .marker-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: transparent;
          color: var(--text);
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .marker-btn:hover {
          border-color: var(--marker-color);
          background: color-mix(in srgb, var(--marker-color) 10%, transparent);
        }

        .marker-btn.active {
          border-color: var(--marker-color);
          background: color-mix(in srgb, var(--marker-color) 15%, transparent);
          color: var(--marker-color);
        }

        .marker-icon {
          font-size: 14px;
        }

        .marker-name {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .active-markers {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }

        .active-label {
          font-size: 11px;
          color: var(--text-muted);
          padding: 3px 0;
        }

        .active-marker-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .remove-marker {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          border: none;
          border-radius: 3px;
          background: transparent;
          color: inherit;
          cursor: pointer;
          font-size: 12px;
          margin-left: 2px;
        }

        .remove-marker:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

// Marker badges overlay for canvas nodes
export function MarkerBadges({ markers = [], compact = false }) {
  if (markers.length === 0) return null;

  return (
    <div className={`marker-badges ${compact ? 'compact' : ''}`}>
      {markers.slice(0, compact ? 2 : markers.length).map(markerId => {
        const marker = COGNITIVE_MARKERS[markerId];
        if (!marker) return null;

        return (
          <span
            key={markerId}
            className="marker-badge"
            style={{ backgroundColor: marker.color }}
            title={`${marker.name}: ${marker.description}`}
          >
            {compact ? marker.symbol : marker.icon}
          </span>
        );
      })}
      {compact && markers.length > 2 && (
        <span className="marker-more">+{markers.length - 2}</span>
      )}

      <style jsx>{`
        .marker-badges {
          display: flex;
          gap: 2px;
          position: absolute;
          top: -8px;
          right: -8px;
        }

        .marker-badges.compact {
          gap: 1px;
        }

        .marker-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 9px;
          font-size: 10px;
          color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .marker-badges.compact .marker-badge {
          min-width: 16px;
          height: 16px;
          font-size: 9px;
        }

        .marker-more {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 16px;
          height: 16px;
          padding: 0 3px;
          border-radius: 8px;
          background: var(--text-muted);
          color: white;
          font-size: 9px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

// Legend component showing all marker types
export default function SDCognitiveMarkers({
  showMarkers,
  onToggleShowMarkers,
  collapsed = false,
  onToggleCollapse,
}) {
  return (
    <div className="sd-cognitive-markers">
      <div className="markers-header" onClick={onToggleCollapse}>
        <LabelIcon fontSize="small" />
        <span className="markers-title">Cognitive Markers</span>
        <label className="show-toggle" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={showMarkers}
            onChange={e => onToggleShowMarkers?.(e.target.checked)}
          />
          <span className="toggle-label">Show</span>
        </label>
      </div>

      {!collapsed && (
        <div className="markers-legend">
          {Object.values(COGNITIVE_MARKERS).map(marker => (
            <div key={marker.id} className="legend-item">
              <span
                className="legend-icon"
                style={{ backgroundColor: `${marker.color}20`, color: marker.color }}
              >
                {marker.icon}
              </span>
              <span className="legend-name">{marker.name}</span>
              <span className="legend-symbol">{marker.symbol}</span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .sd-cognitive-markers {
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          overflow: hidden;
        }

        .markers-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg);
          cursor: pointer;
          user-select: none;
        }

        .markers-title {
          flex: 1;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .show-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        .show-toggle input {
          width: 14px;
          height: 14px;
          accent-color: var(--accent);
        }

        .toggle-label {
          font-size: 11px;
          color: var(--text-muted);
        }

        .markers-legend {
          padding: 8px 12px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 0;
        }

        .legend-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          font-size: 14px;
        }

        .legend-name {
          flex: 1;
          font-size: 12px;
          color: var(--text);
        }

        .legend-symbol {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          padding: 2px 6px;
          background: var(--bg);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
