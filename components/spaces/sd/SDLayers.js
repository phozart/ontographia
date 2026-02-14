// components/sd/SDLayers.js
// EPIC 1.6 - Canvas Layers (Structural, Data/metrics, Annotation)
import { useState, useCallback } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LayersIcon from '@mui/icons-material/Layers';

// Layer definitions
export const LAYER_TYPES = {
  structural: {
    id: 'structural',
    name: 'Structural',
    description: 'Nodes and links (core model)',
    icon: '⬡',
    defaultVisible: true,
  },
  data: {
    id: 'data',
    name: 'Data/Metrics',
    description: 'Values, formulas, and metrics overlay',
    icon: '📊',
    defaultVisible: true,
  },
  annotation: {
    id: 'annotation',
    name: 'Annotations',
    description: 'Notes, callouts, and highlights',
    icon: '📝',
    defaultVisible: true,
  },
};

// Hook for managing layer visibility
export function useSDLayers() {
  const [layerVisibility, setLayerVisibility] = useState({
    structural: true,
    data: true,
    annotation: true,
  });

  const toggleLayer = useCallback((layerId) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  }, []);

  const setLayerVisible = useCallback((layerId, visible) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerId]: visible,
    }));
  }, []);

  const showAllLayers = useCallback(() => {
    setLayerVisibility({
      structural: true,
      data: true,
      annotation: true,
    });
  }, []);

  const hideAllLayers = useCallback(() => {
    setLayerVisibility({
      structural: false,
      data: false,
      annotation: false,
    });
  }, []);

  // Get which layer an element belongs to based on its type
  const getElementLayer = useCallback((element) => {
    if (!element) return 'structural';

    const annotationTypes = ['note', 'callout', 'highlight', 'divider'];
    const dataTypes = ['metric', 'formula_display', 'value_label'];

    if (annotationTypes.includes(element.type)) return 'annotation';
    if (dataTypes.includes(element.type) || element.showMetrics) return 'data';
    return 'structural';
  }, []);

  // Check if an element should be visible based on layer settings
  const isElementVisible = useCallback((element) => {
    const layer = getElementLayer(element);
    return layerVisibility[layer];
  }, [layerVisibility, getElementLayer]);

  return {
    layerVisibility,
    toggleLayer,
    setLayerVisible,
    showAllLayers,
    hideAllLayers,
    getElementLayer,
    isElementVisible,
  };
}

// Layer controls panel component
export default function SDLayers({
  layerVisibility,
  onToggleLayer,
  onShowAll,
  onHideAll,
  collapsed = false,
  onToggleCollapse,
}) {
  return (
    <div className="sd-layers">
      <div className="layers-header" onClick={onToggleCollapse}>
        <LayersIcon fontSize="small" />
        <span className="layers-title">Layers</span>
        <div className="layers-actions">
          <button
            className="layers-action-btn"
            onClick={(e) => { e.stopPropagation(); onShowAll?.(); }}
            title="Show all layers"
          >
            <VisibilityIcon fontSize="small" />
          </button>
          <button
            className="layers-action-btn"
            onClick={(e) => { e.stopPropagation(); onHideAll?.(); }}
            title="Hide all layers"
          >
            <VisibilityOffIcon fontSize="small" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="layers-list">
          {Object.values(LAYER_TYPES).map(layer => (
            <div
              key={layer.id}
              className={`layer-item ${layerVisibility[layer.id] ? 'visible' : 'hidden'}`}
              onClick={() => onToggleLayer?.(layer.id)}
            >
              <span className="layer-icon">{layer.icon}</span>
              <span className="layer-name">{layer.name}</span>
              <span className="layer-visibility">
                {layerVisibility[layer.id] ? (
                  <VisibilityIcon fontSize="small" />
                ) : (
                  <VisibilityOffIcon fontSize="small" />
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .sd-layers {
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          overflow: hidden;
        }

        .layers-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg);
          cursor: pointer;
          user-select: none;
        }

        .layers-title {
          flex: 1;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .layers-actions {
          display: flex;
          gap: 4px;
        }

        .layers-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }

        .layers-action-btn:hover {
          background: var(--border);
          color: var(--text);
        }

        .layers-list {
          display: flex;
          flex-direction: column;
        }

        .layer-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s;
          border-top: 1px solid var(--border);
        }

        .layer-item:hover {
          background: var(--bg);
        }

        .layer-item.hidden {
          opacity: 0.5;
        }

        .layer-icon {
          font-size: 14px;
          width: 20px;
          text-align: center;
        }

        .layer-name {
          flex: 1;
          font-size: 13px;
          color: var(--text);
        }

        .layer-visibility {
          display: flex;
          align-items: center;
          color: var(--text-muted);
        }

        .layer-item.visible .layer-visibility {
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}
