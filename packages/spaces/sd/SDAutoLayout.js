// components/sd/SDAutoLayout.js
// EPIC 3.6 - Stock & Flow Layout Engine
import { useCallback } from 'react';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AlignHorizontalLeftIcon from '@mui/icons-material/AlignHorizontalLeft';
import AlignHorizontalCenterIcon from '@mui/icons-material/AlignHorizontalCenter';
import AlignVerticalTopIcon from '@mui/icons-material/AlignVerticalTop';
import VerticalDistributeIcon from '@mui/icons-material/ViewModule';

// Layout algorithms
export function tidyLayout(elements, connections, options = {}) {
  const { spacing = 150, direction = 'horizontal' } = options;

  if (elements.length === 0) return elements;

  // Build adjacency for flow relationships
  const adjacency = new Map();
  const reverseAdjacency = new Map();

  connections.forEach(conn => {
    if (!adjacency.has(conn.source)) adjacency.set(conn.source, []);
    adjacency.get(conn.source).push(conn.target);

    if (!reverseAdjacency.has(conn.target)) reverseAdjacency.set(conn.target, []);
    reverseAdjacency.get(conn.target).push(conn.source);
  });

  // Find root nodes (stocks with no inflows, or nodes with no incoming connections)
  const roots = elements.filter(el => {
    const incoming = reverseAdjacency.get(el.id) || [];
    return incoming.length === 0 || el.type === 'stock';
  });

  // BFS to assign layers
  const layers = new Map();
  const visited = new Set();
  const queue = roots.map(r => ({ id: r.id, layer: 0 }));

  while (queue.length > 0) {
    const { id, layer } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    layers.set(id, Math.max(layers.get(id) || 0, layer));

    const neighbors = adjacency.get(id) || [];
    neighbors.forEach(neighborId => {
      if (!visited.has(neighborId)) {
        queue.push({ id: neighborId, layer: layer + 1 });
      }
    });
  }

  // Handle unvisited nodes
  elements.forEach(el => {
    if (!layers.has(el.id)) {
      layers.set(el.id, 0);
    }
  });

  // Group elements by layer
  const layerGroups = new Map();
  elements.forEach(el => {
    const layer = layers.get(el.id);
    if (!layerGroups.has(layer)) layerGroups.set(layer, []);
    layerGroups.get(layer).push(el);
  });

  // Assign positions
  const result = elements.map(el => {
    const layer = layers.get(el.id);
    const group = layerGroups.get(layer);
    const indexInLayer = group.indexOf(el);
    const layerSize = group.length;

    let x, y;
    if (direction === 'horizontal') {
      x = layer * spacing + 200;
      y = (indexInLayer - (layerSize - 1) / 2) * (spacing * 0.8) + 300;
    } else {
      x = (indexInLayer - (layerSize - 1) / 2) * (spacing * 0.8) + 400;
      y = layer * spacing + 200;
    }

    return {
      ...el,
      position: { x, y },
    };
  });

  return result;
}

// Align elements
export function alignElements(elements, alignment) {
  if (elements.length < 2) return elements;

  const positions = elements.map(el => el.position || { x: 0, y: 0 });

  let targetValue;
  switch (alignment) {
    case 'left':
      targetValue = Math.min(...positions.map(p => p.x));
      return elements.map(el => ({
        ...el,
        position: { ...el.position, x: targetValue },
      }));
    case 'right':
      targetValue = Math.max(...positions.map(p => p.x));
      return elements.map(el => ({
        ...el,
        position: { ...el.position, x: targetValue },
      }));
    case 'center-h':
      targetValue = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
      return elements.map(el => ({
        ...el,
        position: { ...el.position, x: targetValue },
      }));
    case 'top':
      targetValue = Math.min(...positions.map(p => p.y));
      return elements.map(el => ({
        ...el,
        position: { ...el.position, y: targetValue },
      }));
    case 'bottom':
      targetValue = Math.max(...positions.map(p => p.y));
      return elements.map(el => ({
        ...el,
        position: { ...el.position, y: targetValue },
      }));
    case 'center-v':
      targetValue = positions.reduce((sum, p) => sum + p.y, 0) / positions.length;
      return elements.map(el => ({
        ...el,
        position: { ...el.position, y: targetValue },
      }));
    default:
      return elements;
  }
}

// Distribute elements evenly
export function distributeElements(elements, direction = 'horizontal') {
  if (elements.length < 3) return elements;

  const sorted = [...elements].sort((a, b) => {
    const posA = a.position || { x: 0, y: 0 };
    const posB = b.position || { x: 0, y: 0 };
    return direction === 'horizontal' ? posA.x - posB.x : posA.y - posB.y;
  });

  const first = sorted[0].position || { x: 0, y: 0 };
  const last = sorted[sorted.length - 1].position || { x: 0, y: 0 };
  const spacing = direction === 'horizontal'
    ? (last.x - first.x) / (sorted.length - 1)
    : (last.y - first.y) / (sorted.length - 1);

  return sorted.map((el, idx) => ({
    ...el,
    position: {
      ...el.position,
      [direction === 'horizontal' ? 'x' : 'y']:
        (direction === 'horizontal' ? first.x : first.y) + spacing * idx,
    },
  }));
}

// Hook for layout operations
export function useAutoLayout(elements, connections, setElements, cyRef, saveToHistory) {
  const applyTidyLayout = useCallback((selectedIds = null, options = {}) => {
    const targetElements = selectedIds
      ? elements.filter(el => selectedIds.includes(el.id))
      : elements;

    const tidied = tidyLayout(targetElements, connections, options);

    if (selectedIds) {
      // Update only selected elements
      setElements(prev =>
        prev.map(el => {
          const updated = tidied.find(t => t.id === el.id);
          return updated || el;
        })
      );
    } else {
      setElements(tidied);
    }

    // Update Cytoscape positions
    const cy = cyRef?.current;
    if (cy) {
      tidied.forEach(el => {
        const node = cy.getElementById(el.id);
        if (node) {
          node.position(el.position);
        }
      });
    }

    saveToHistory?.();
  }, [elements, connections, setElements, cyRef, saveToHistory]);

  const applyAlignment = useCallback((selectedIds, alignment) => {
    if (!selectedIds || selectedIds.length < 2) return;

    const targetElements = elements.filter(el => selectedIds.includes(el.id));
    const aligned = alignElements(targetElements, alignment);

    setElements(prev =>
      prev.map(el => {
        const updated = aligned.find(a => a.id === el.id);
        return updated || el;
      })
    );

    // Update Cytoscape positions
    const cy = cyRef?.current;
    if (cy) {
      aligned.forEach(el => {
        const node = cy.getElementById(el.id);
        if (node) {
          node.position(el.position);
        }
      });
    }

    saveToHistory?.();
  }, [elements, setElements, cyRef, saveToHistory]);

  const applyDistribution = useCallback((selectedIds, direction) => {
    if (!selectedIds || selectedIds.length < 3) return;

    const targetElements = elements.filter(el => selectedIds.includes(el.id));
    const distributed = distributeElements(targetElements, direction);

    setElements(prev =>
      prev.map(el => {
        const updated = distributed.find(d => d.id === el.id);
        return updated || el;
      })
    );

    // Update Cytoscape positions
    const cy = cyRef?.current;
    if (cy) {
      distributed.forEach(el => {
        const node = cy.getElementById(el.id);
        if (node) {
          node.position(el.position);
        }
      });
    }

    saveToHistory?.();
  }, [elements, setElements, cyRef, saveToHistory]);

  return {
    applyTidyLayout,
    applyAlignment,
    applyDistribution,
  };
}

// Auto Layout Controls Component
export default function SDAutoLayout({
  selectedIds = [],
  onTidyLayout,
  onAlign,
  onDistribute,
}) {
  const hasSelection = selectedIds.length > 0;
  const canAlign = selectedIds.length >= 2;
  const canDistribute = selectedIds.length >= 3;

  return (
    <div className="sd-auto-layout">
      <div className="layout-header">
        <AutoFixHighIcon fontSize="small" />
        <span>Layout Tools</span>
      </div>

      <div className="layout-section">
        <button
          className="layout-btn primary"
          onClick={() => onTidyLayout?.(hasSelection ? selectedIds : null)}
          title={hasSelection ? 'Tidy selection' : 'Tidy entire diagram'}
        >
          <AutoFixHighIcon fontSize="small" />
          <span>{hasSelection ? 'Tidy Selection' : 'Auto Layout'}</span>
        </button>
      </div>

      <div className="layout-section">
        <div className="section-title">Align</div>
        <div className="button-row">
          <button
            className="layout-btn icon-only"
            onClick={() => onAlign?.(selectedIds, 'left')}
            disabled={!canAlign}
            title="Align left"
          >
            <AlignHorizontalLeftIcon fontSize="small" />
          </button>
          <button
            className="layout-btn icon-only"
            onClick={() => onAlign?.(selectedIds, 'center-h')}
            disabled={!canAlign}
            title="Align center horizontally"
          >
            <AlignHorizontalCenterIcon fontSize="small" />
          </button>
          <button
            className="layout-btn icon-only"
            onClick={() => onAlign?.(selectedIds, 'right')}
            disabled={!canAlign}
            title="Align right"
          >
            <AlignHorizontalLeftIcon fontSize="small" style={{ transform: 'scaleX(-1)' }} />
          </button>
        </div>
        <div className="button-row">
          <button
            className="layout-btn icon-only"
            onClick={() => onAlign?.(selectedIds, 'top')}
            disabled={!canAlign}
            title="Align top"
          >
            <AlignVerticalTopIcon fontSize="small" />
          </button>
          <button
            className="layout-btn icon-only"
            onClick={() => onAlign?.(selectedIds, 'center-v')}
            disabled={!canAlign}
            title="Align center vertically"
          >
            <AlignHorizontalCenterIcon fontSize="small" style={{ transform: 'rotate(90deg)' }} />
          </button>
          <button
            className="layout-btn icon-only"
            onClick={() => onAlign?.(selectedIds, 'bottom')}
            disabled={!canAlign}
            title="Align bottom"
          >
            <AlignVerticalTopIcon fontSize="small" style={{ transform: 'scaleY(-1)' }} />
          </button>
        </div>
      </div>

      <div className="layout-section">
        <div className="section-title">Distribute</div>
        <div className="button-row">
          <button
            className="layout-btn"
            onClick={() => onDistribute?.(selectedIds, 'horizontal')}
            disabled={!canDistribute}
            title="Distribute horizontally"
          >
            <VerticalDistributeIcon fontSize="small" />
            <span>H</span>
          </button>
          <button
            className="layout-btn"
            onClick={() => onDistribute?.(selectedIds, 'vertical')}
            disabled={!canDistribute}
            title="Distribute vertically"
          >
            <VerticalDistributeIcon fontSize="small" style={{ transform: 'rotate(90deg)' }} />
            <span>V</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .sd-auto-layout {
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          overflow: hidden;
        }

        .layout-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg);
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .layout-section {
          padding: 10px 12px;
          border-top: 1px solid var(--border);
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .button-row {
          display: flex;
          gap: 6px;
          margin-bottom: 6px;
        }

        .button-row:last-child {
          margin-bottom: 0;
        }

        .layout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .layout-btn:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
        }

        .layout-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .layout-btn.primary {
          width: 100%;
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .layout-btn.primary:hover:not(:disabled) {
          background: var(--accent-hover, var(--accent));
          opacity: 0.9;
        }

        .layout-btn.icon-only {
          flex: 1;
          padding: 8px;
        }
      `}</style>
    </div>
  );
}
