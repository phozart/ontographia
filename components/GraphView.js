// components/GraphView.js
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useFilter } from './FilterContext';
import { useDomains } from './DomainContext';

// Modern layout presets with better spacing and aesthetics
const layoutPresets = {
  cose: {
    name: 'cose',
    animate: true,
    animationDuration: 500,
    animationEasing: 'ease-out',
    padding: 50,
    nodeRepulsion: 8000,
    idealEdgeLength: 100,
    edgeElasticity: 100,
    nestingFactor: 1.2,
    gravity: 80,
    numIter: 1000,
    coolingFactor: 0.95,
    minTemp: 1.0,
  },
  circle: {
    name: 'circle',
    padding: 50,
    animate: true,
    animationDuration: 500,
    animationEasing: 'ease-out',
    avoidOverlap: true,
    spacingFactor: 1.5,
  },
  grid: {
    name: 'grid',
    padding: 50,
    animate: true,
    animationDuration: 500,
    animationEasing: 'ease-out',
    avoidOverlap: true,
    spacingFactor: 1.2,
    rows: undefined,
  },
  breadthfirst: {
    name: 'breadthfirst',
    directed: true,
    padding: 50,
    spacingFactor: 1.5,
    animate: true,
    animationDuration: 500,
    animationEasing: 'ease-out',
    avoidOverlap: true,
  },
  concentric: {
    name: 'concentric',
    padding: 50,
    animate: true,
    animationDuration: 500,
    animationEasing: 'ease-out',
    minNodeSpacing: 60,
    avoidOverlap: true,
    concentric: node => node.degree(),
    levelWidth: () => 2,
  },
};

export default function GraphView({
  onNodeClick,
  onEdgeClick,
  onClearSelection,
  reloadKey,
  onNewNodeShortcut,
  onCreateNodeRequest,
  onEditNodeRequest,
  onCreateRelationshipRequest,
  readOnly = false,
  highlightedNodeIds = [],
  focusNodeId = null,
  onCyReady = null,
}) {
  const cyRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [layoutName, setLayoutName] = useState('cose');
  const { typeFilters } = useFilter();
  const [resizeState, setResizeState] = useState(null);
  const containerRef = useRef(null);
  const initialFitDoneRef = useRef(false);
  const baseSizesRef = useRef(new Map());
  const [themeDark, setThemeDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.dataset.theme === 'dark';
  });
  const [showGrid, setShowGrid] = useState(true);
  const [curvedLines, setCurvedLines] = useState(true);
  const { activeDomain, activeDomainObj } = useDomains();

  const domainMatch = useMemo(() => {
    const activeName = activeDomainObj?.name;
    const active = activeDomain;
    return (entity) => {
      if (!active) return true;
      if (!entity) return false;
      const val =
        entity.domain ??
        entity.domainId ??
        entity.domainName ??
        entity.workspace ??
        entity.workspaceId;
      if (val === undefined || val === null) return false;
      return String(val) === String(active) || (activeName && String(val) === String(activeName));
    };
  }, [activeDomain, activeDomainObj?.name]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const target = document.documentElement;
    const observer = new MutationObserver(() => {
      setThemeDark(target.dataset.theme === 'dark');
    });
    observer.observe(target, { attributes: true, attributeFilter: ['data-theme'] });
    setThemeDark(target.dataset.theme === 'dark');
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadGraph();
  }, [reloadKey, typeFilters, themeDark, activeDomain, activeDomainObj]);

  // Modern color palette - more vibrant and saturated
  function getTypeColor(layer, nodeColor, typeColor) {
    // Priority: node color > type color > layer color
    if (nodeColor) return nodeColor;
    if (typeColor) return typeColor;

    const colors = {
      'Physical': '#3b82f6',      // Blue
      'Information': '#10b981',   // Emerald
      'Systems': '#8b5cf6',       // Violet
      'Rules': '#f59e0b',         // Amber
      'Governance': '#ef4444',    // Red
      'default': '#6366f1',       // Indigo
    };
    return colors[layer] || colors.default;
  }

  async function loadGraph() {
    try {
      initialFitDoneRef.current = false;

      const typeQuery =
        typeFilters && typeFilters.length
          ? `?typeIds=${encodeURIComponent(typeFilters.join(','))}`
          : '';
      const domainPart = activeDomain
        ? `${typeQuery ? '&' : '?'}domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(
            activeDomainObj?.name || ''
          )}`
        : '';
      const nodesUrl = `/api/nodes${typeQuery}${domainPart}`;
      const relUrl = `/api/relationships${
        activeDomain
          ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
          : ''
      }`;
      const [nodesRes, relsRes] = await Promise.all([
        fetch(nodesUrl),
        fetch(relUrl),
      ]);
      if (!nodesRes.ok || !relsRes.ok) {
        console.error('Failed to load graph data', nodesRes.status, relsRes.status);
        return;
      }
      const domainNodes = await nodesRes.json();
      const rels = await relsRes.json();
      const scopedNodes = (Array.isArray(domainNodes) ? domainNodes : []).filter(domainMatch);
      const scopedIds = new Set(scopedNodes.map(n => n.id));
      const scopedRels = (Array.isArray(rels) ? rels : []).filter(
        r => scopedIds.has(r.sourceId) && scopedIds.has(r.targetId)
      );

      const cyNodes = scopedNodes.map(n => {
        const baseColor = getTypeColor(n.layer, n.color, n.typeColor);
        const color = themeDark ? adjustColorForDark(baseColor) : baseColor;
        const borderColor = themeDark ? lightenColor(color, 20) : darkenColor(color, 15);

        const data = {
          data: {
            id: n.id,
            label: n.name,
            layer: n.layer || 'Unassigned',
            color,
            borderColor,
            shape: n.shape || n.typeShape || 'round-rectangle',
            raw: n,
            weight: typeof n.weight === 'number' ? n.weight : isNaN(parseFloat(n.weight)) ? 1 : parseFloat(n.weight),
            size: computeSize(n),
            textWidth: computeTextWidth(n),
            fontSize: computeFontSize(n),
            textColor: getContrastColor(color),
          },
          position: n.x && n.y ? { x: n.x, y: n.y } : undefined,
          classes: [`layer-${(n.layer || 'Unassigned').replace(/\s+/g, '')}`],
        };
        const iconVal = sanitizeIcon(n.icon || n.typeIcon);
        if (iconVal) {
          data.data.icon = iconVal;
        }
        return data;
      });

      // Create a map for quick node layer lookup
      const nodeLayerMap = new Map();
      scopedNodes.forEach(n => nodeLayerMap.set(n.id, n.layer || 'Unassigned'));

      const cyEdges = scopedRels.map((r, idx) => {
        const sourceLayer = nodeLayerMap.get(r.sourceId);
        const targetLayer = nodeLayerMap.get(r.targetId);
        const isCrossLayer = sourceLayer && targetLayer && sourceLayer !== targetLayer;
        return {
          data: {
            id: r.id || `edge-${idx}`,
            source: r.sourceId,
            target: r.targetId,
            label: r.type,
            crossLayer: isCrossLayer,
          },
          classes: isCrossLayer ? ['cross-layer'] : [],
        };
      });

      setElements([...cyNodes, ...cyEdges]);
    } catch (e) {
      console.error('Error loading graph', e);
    }
  }

  function computeSize(n) {
    const rawWeight = typeof n.weight === 'number' ? n.weight : isNaN(parseFloat(n.weight)) ? 1 : parseFloat(n.weight);
    const clamped = Math.max(0, Math.min(rawWeight, 5));
    // Slightly larger nodes for better visibility
    return Math.max(70, Math.min(160, 75 + clamped * 17));
  }

  function computeTextWidth(n) {
    const size = computeSize(n);
    return Math.max(60, Math.min(140, size * 0.85));
  }

  function computeTextWidthFromSize(size) {
    return Math.max(60, Math.min(140, size * 0.85));
  }

  function computeFontSize(n) {
    const size = computeSize(n);
    return Math.max(11, Math.min(16, Math.round(size / 6)));
  }

  function computeFontSizeFromSize(size) {
    return Math.max(11, Math.min(16, Math.round(size / 6)));
  }

  function sizeToWeight(size) {
    const w = (size - 75) / 17;
    return Math.max(0, Math.min(5, isNaN(w) ? 0 : w));
  }

  function hexToRgb(hex) {
    if (!hex) return { r: 128, g: 128, b: 128 };
    let h = hex.replace('#', '');
    if (h.length === 3) {
      h = h.split('').map(c => c + c).join('');
    }
    const num = parseInt(h, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  function adjustColorForDark(hex) {
    const { r, g, b } = hexToRgb(hex);
    // Slightly desaturate and adjust brightness for dark mode
    const factor = 0.85;
    return rgbToHex(
      r * factor + 30,
      g * factor + 30,
      b * factor + 30
    );
  }

  function lightenColor(hex, percent) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(
      r + (255 - r) * (percent / 100),
      g + (255 - g) * (percent / 100),
      b + (255 - b) * (percent / 100)
    );
  }

  function darkenColor(hex, percent) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(
      r * (1 - percent / 100),
      g * (1 - percent / 100),
      b * (1 - percent / 100)
    );
  }

  function getContrastColor(bg) {
    const { r, g, b } = hexToRgb(bg);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1e293b' : '#f8fafc';
  }

  function sanitizeIcon(icon) {
    if (!icon) return null;
    const value = String(icon).trim();
    const hasImageExt = /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(value);
    const isHttp = /^https?:\/\//i.test(value);
    const isData = value.startsWith('data:image');
    const isStaticPath = value.startsWith('/static/') || value.startsWith('/images/') || value.startsWith('/img/');
    return isHttp || isData || (isStaticPath && hasImageExt) ? value : null;
  }

  // Modern stylesheet with flowing curves and gradient effects
  const stylesheet = useMemo(
    () => [
      // Base node styling - modern with labels outside
      {
        selector: 'node',
        style: {
          'background-color': 'data(color)',
          'background-opacity': 0.95,
          'background-gradient-direction': 'to-bottom-right',
          'border-width': 2.5,
          'border-color': 'data(borderColor)',
          'border-opacity': 0.9,
          label: 'data(label)',
          color: themeDark ? '#e5e7eb' : '#1f2937',
          'font-size': 12,
          'font-family': "'Inter', system-ui, -apple-system, sans-serif",
          'font-weight': 600,
          // Labels outside the node - below
          'text-valign': 'bottom',
          'text-halign': 'center',
          'text-margin-y': 8,
          'text-wrap': 'wrap',
          'text-max-width': 120,
          // Text background for readability
          'text-background-color': themeDark ? '#1f2937' : '#ffffff',
          'text-background-opacity': 0.85,
          'text-background-padding': '4px',
          'text-background-shape': 'roundrectangle',
          padding: '10px',
          shape: 'data(shape)',
          width: 'data(size)',
          height: 'data(size)',
          // Enhanced shadow for depth
          'shadow-blur': 16,
          'shadow-color': themeDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.12)',
          'shadow-offset-x': 0,
          'shadow-offset-y': 6,
          'shadow-opacity': 1,
          // Smooth transitions
          'transition-property': 'background-color, border-color, width, height, shadow-blur, border-width',
          'transition-duration': '0.25s',
          'transition-timing-function': 'ease-out',
        },
      },
      // Nodes with icons
      {
        selector: 'node[icon]',
        style: {
          'background-image': 'data(icon)',
          'background-fit': 'cover',
          'background-opacity': 1,
        },
      },
      // Hover state - subtle glow
      {
        selector: 'node:active',
        style: {
          'shadow-blur': 24,
          'shadow-opacity': 1,
          'border-width': 3,
        },
      },
      // Selected node - prominent glow
      {
        selector: 'node:selected',
        style: {
          'border-color': themeDark ? '#a5b4fc' : '#6366f1',
          'border-width': 4,
          'shadow-blur': 32,
          'shadow-color': themeDark ? 'rgba(165, 180, 252, 0.5)' : 'rgba(99, 102, 241, 0.4)',
          'shadow-opacity': 1,
        },
      },
      // Highlighted nodes (from search) - golden glow
      {
        selector: 'node.highlighted',
        style: {
          'border-color': themeDark ? '#fcd34d' : '#f59e0b',
          'border-width': 4,
          'shadow-blur': 36,
          'shadow-color': themeDark ? 'rgba(252, 211, 77, 0.6)' : 'rgba(245, 158, 11, 0.5)',
          'shadow-opacity': 1,
        },
      },
      // Edge styling - curved or straight based on toggle
      {
        selector: 'edge',
        style: {
          width: 2,
          'line-color': themeDark ? '#6b7280' : '#94a3b8',
          'line-opacity': 0.8,
          'target-arrow-color': themeDark ? '#9ca3af' : '#64748b',
          'target-arrow-shape': 'triangle',
          'arrow-scale': 1,
          // Line style - curved or straight
          'curve-style': curvedLines ? 'unbundled-bezier' : 'bezier',
          'control-point-distances': curvedLines ? [50, -50] : [0],
          'control-point-weights': curvedLines ? [0.25, 0.75] : [0.5],
          // Edge label styling - horizontal on top of edge
          label: 'data(label)',
          'font-size': 10,
          'font-family': "'Inter', system-ui, -apple-system, sans-serif",
          'font-weight': 500,
          'text-rotation': 0,
          color: themeDark ? '#9ca3af' : '#64748b',
          'text-background-color': themeDark ? '#1f2937' : '#ffffff',
          'text-background-opacity': 0.9,
          'text-background-padding': '3px',
          'text-background-shape': 'roundrectangle',
          'text-margin-y': -12,
          // Smooth edge transitions
          'transition-property': 'line-color, width, target-arrow-color',
          'transition-duration': '0.25s',
        },
      },
      // Multiple edges between same nodes - spread them out
      {
        selector: 'edge.bezier',
        style: {
          'curve-style': 'bezier',
        },
      },
      // Selected edge - vibrant highlight
      {
        selector: 'edge:selected',
        style: {
          width: 4,
          'line-color': themeDark ? '#a5b4fc' : '#6366f1',
          'target-arrow-color': themeDark ? '#a5b4fc' : '#6366f1',
          'line-opacity': 1,
        },
      },
      // Edges connected to selected nodes - subtle highlight
      {
        selector: 'node:selected ~ edge',
        style: {
          'line-opacity': 1,
          'line-color': themeDark ? '#9ca3af' : '#94a3b8',
          width: 3,
        },
      },
      // Cross-layer edges - dashed line style
      {
        selector: 'edge.cross-layer',
        style: {
          'line-style': 'dashed',
          'line-dash-pattern': [6, 3],
          'line-color': themeDark ? '#8b5cf6' : '#7c3aed',
          'target-arrow-color': themeDark ? '#8b5cf6' : '#7c3aed',
        },
      },
      // Dimmed elements (when neighbors highlighted)
      {
        selector: '.dimmed',
        style: {
          opacity: 0.25,
        },
      },
      // Neighbor highlight
      {
        selector: '.neighbor-highlight',
        style: {
          'border-color': themeDark ? '#60a5fa' : '#3b82f6',
          'border-width': 3,
        },
      },
    ],
    [themeDark, curvedLines]
  );

  const runLayout = useCallback((name) => {
    const cy = cyRef.current;
    if (!cy || cy.elements().length === 0) return;

    const layout = cy.layout(layoutPresets[name] || layoutPresets.cose);
    layout.run();
    layout.once('layoutstop', () => {
      if (!initialFitDoneRef.current) {
        cy.fit(cy.nodes(), 60);
        initialFitDoneRef.current = true;
      }
    });
  }, []);

  function handleCyReady(cy) {
    cyRef.current = cy;
    cy.userPanningEnabled(true);
    cy.userZoomingEnabled(true);
    cy.boxSelectionEnabled(false);

    // Smoother wheel zoom
    cy.minZoom(0.2);
    cy.maxZoom(3);

    cy.on('tap', 'node', evt => {
      const data = evt.target.data();
      if (onNodeClick) onNodeClick({ id: data.id, data: { raw: data.raw || data } });
    });
    cy.on('tap', 'edge', evt => {
      if (onEdgeClick) onEdgeClick(evt.target.data());
    });
    cy.on('tap', evt => {
      if (evt.target === cy && onClearSelection) {
        onClearSelection();
      }
    });

    // Magnetic neighbor effect when dragging
    cy.on('drag', 'node', evt => {
      const pos = evt.target.position();
      const neighbors = evt.target.neighborhood('node');
      neighbors.forEach(n => {
        if (n.grabbed()) return;
        const np = n.position();
        const dx = pos.x - np.x;
        const dy = pos.y - np.y;
        const nx = np.x + dx * 0.03;
        const ny = np.y + dy * 0.03;
        n.animate({ position: { x: nx, y: ny } }, { duration: 200, easing: 'ease-out', queue: false });
      });
    });

    if (!readOnly) {
      cy.on('dbltap', 'node', evt => {
        if (evt.target?.group?.() !== 'nodes') return;
        if (onEditNodeRequest) {
          const data = evt.target.data();
          onEditNodeRequest({ id: data.id, data: { raw: data.raw || data } });
        }
      });
      cy.on('dbltap', 'edge', evt => {
        if (evt.target?.group?.() !== 'edges') return;
        if (onCreateRelationshipRequest) {
          onCreateRelationshipRequest();
        }
      });
    }
  }

  // Resize handling
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return undefined;

    function onMouseDown(evt) {
      if (evt.target?.group?.() !== 'nodes') return;
      if (!evt.originalEvent?.altKey) return;
      evt.preventDefault();
      const node = evt.target;
      const center = node.position();
      const currentSize = node.data('size') || computeSize(node.data('raw') || {});
      cy.userPanningEnabled(false);
      const wasGrabbable = node.grabbable();
      node.grabify(false);
      setResizeState({
        nodeId: node.id(),
        center,
        node,
        startSize: currentSize,
        startRadius: currentSize / 2,
        wasGrabbable,
      });
    }

    function onMouseMove(evt) {
      if (!resizeState || !resizeState.node) return;
      const { node, startSize, startRadius } = resizeState;
      const center = node.position();
      const dx = evt.position.x - center.x;
      const dy = evt.position.y - center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const delta = dist - startRadius;
      const newSize = Math.max(50, Math.min(180, startSize + delta * 2));
      node.data('size', newSize);
      node.data('textWidth', computeTextWidthFromSize(newSize));
      node.data('fontSize', computeFontSizeFromSize(newSize));
    }

    async function endResize() {
      if (!resizeState || !resizeState.node) return;
      const { node } = resizeState;
      const newSize = node.data('size');
      const newWeight = sizeToWeight(newSize);
      const raw = node.data('raw') || {};
      node.data('raw', { ...raw, weight: newWeight });
      cy.userPanningEnabled(true);
      if (resizeState?.wasGrabbable) {
        node.grabify(true);
      }
      setResizeState(null);
      try {
        await fetch(`/api/nodes/${encodeURIComponent(node.id())}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: raw.name || 'Node', weight: newWeight }),
        });
      } catch (err) {
        console.error('Failed to save resized weight', err);
      }
    }

    if (!readOnly) {
      cy.on('mousedown', 'node', onMouseDown);
      cy.on('mousemove', onMouseMove);
      cy.on('mouseup', endResize);
      cy.on('tapend', endResize);
    }

    return () => {
      cy.off('mousedown', 'node', onMouseDown);
      cy.off('mousemove', onMouseMove);
      cy.off('mouseup', endResize);
      cy.off('tapend', endResize);
      cy.userPanningEnabled(true);
    };
  }, [resizeState, readOnly]);

  // Highlight nodes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.nodes().forEach(n => {
      const id = n.id();
      if (baseSizesRef.current.has(id)) {
        n.data('size', baseSizesRef.current.get(id));
        baseSizesRef.current.delete(id);
      }
      n.removeClass('highlighted');
      n.unselect();
    });
    if (Array.isArray(highlightedNodeIds) && highlightedNodeIds.length) {
      highlightedNodeIds.forEach(id => {
        const ele = cy.$id(String(id));
        if (ele && ele.nonempty()) {
          const currentSize = ele.data('size');
          if (!baseSizesRef.current.has(ele.id())) {
            baseSizesRef.current.set(ele.id(), currentSize);
          }
          ele.data('size', currentSize * 1.3);
          ele.addClass('highlighted');
          ele.select();
        }
      });
    }
  }, [highlightedNodeIds]);

  // Focus node
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !focusNodeId) return;
    const ele = cy.$id(String(focusNodeId));
    if (ele && ele.nonempty()) {
      ele.select();
      cy.animate(
        {
          center: { eles: ele },
          zoom: Math.min(1.5, Math.max(0.5, cy.zoom())),
        },
        { duration: 400, easing: 'ease-out-cubic' }
      );
    }
  }, [focusNodeId]);

  // Run layout on elements change
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || cy.destroyed?.() || cy.elements().length === 0) return;

    const layout = cy.layout(layoutPresets[layoutName] || layoutPresets.cose);
    layout.run();
    layout.once('layoutstop', () => {
      if (cy.destroyed?.()) return;
      if (!initialFitDoneRef.current) {
        cy.fit(cy.nodes(), 60);
        initialFitDoneRef.current = true;
      }
    });
    return () => layout.stop();
  }, [elements, layoutName]);

  return (
    <div
      ref={containerRef}
      className={`graph-view-container ${showGrid ? 'with-grid' : ''}`}
      style={{ position: 'relative', width: '100%', height: '100%' }}
      tabIndex={0}
      onClick={() => containerRef.current?.focus()}
      onKeyDown={e => {
        if ((e.key === 'n' || e.key === 'N') && onNewNodeShortcut && !readOnly) {
          e.preventDefault();
          onNewNodeShortcut();
        }
      }}
    >
      {/* Layout controls */}
      <div className="graph-layout-controls">
        <span className="layout-label">Layout</span>
        <div className="layout-buttons">
          {Object.keys(layoutPresets).map(name => (
            <button
              key={name}
              className={`layout-btn ${layoutName === name ? 'active' : ''}`}
              onClick={() => {
                setLayoutName(name);
                runLayout(name);
              }}
              title={name.charAt(0).toUpperCase() + name.slice(1)}
            >
              {name === 'cose' && '◎'}
              {name === 'circle' && '○'}
              {name === 'grid' && '⊞'}
              {name === 'breadthfirst' && '⋮'}
              {name === 'concentric' && '◉'}
            </button>
          ))}
        </div>
        <div className="layout-divider" />
        <button
          className={`layout-btn ${curvedLines ? 'active' : ''}`}
          onClick={() => setCurvedLines(!curvedLines)}
          title={curvedLines ? 'Switch to straight lines' : 'Switch to curved lines'}
        >
          {curvedLines ? '⌇' : '―'}
        </button>
        <button
          className={`layout-btn ${showGrid ? 'active' : ''}`}
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle grid"
        >
          ⊟
        </button>
        <button
          className="layout-btn"
          onClick={() => {
            const cy = cyRef.current;
            if (cy) cy.fit(cy.nodes(), 60);
          }}
          title="Fit to view"
        >
          ⊡
        </button>
        <div className="layout-divider" />
        <button
          className="layout-btn"
          onClick={() => {
            const cy = cyRef.current;
            if (!cy) return;
            // Group nodes by layer
            const layers = {};
            cy.nodes().forEach(n => {
              const layer = n.data('layer') || 'Unassigned';
              if (!layers[layer]) layers[layer] = [];
              layers[layer].push(n);
            });
            const layerNames = Object.keys(layers).sort();
            const layerHeight = 200;
            const nodeSpacing = 120;
            layerNames.forEach((layer, layerIdx) => {
              const nodesInLayer = layers[layer];
              const startX = -(nodesInLayer.length - 1) * nodeSpacing / 2;
              nodesInLayer.forEach((n, nodeIdx) => {
                n.animate({
                  position: { x: startX + nodeIdx * nodeSpacing, y: layerIdx * layerHeight },
                }, { duration: 500, easing: 'ease-out' });
              });
            });
            setTimeout(() => cy.fit(cy.nodes(), 60), 600);
          }}
          title="Group by layer"
        >
          ☰
        </button>
        <div className="layout-divider" />
        <button
          className="layout-btn"
          onClick={() => {
            const cy = cyRef.current;
            if (!cy) return;
            const png = cy.png({ output: 'blob', bg: 'white', scale: 2, full: true });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(png);
            link.download = `graph-${new Date().toISOString().slice(0, 10)}.png`;
            link.click();
            URL.revokeObjectURL(link.href);
          }}
          title="Export as PNG"
        >
          📷
        </button>
        <button
          className="layout-btn"
          onClick={() => {
            const cy = cyRef.current;
            if (!cy) return;
            const svg = cy.svg({ scale: 1, full: true, bg: 'white' });
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `graph-${new Date().toISOString().slice(0, 10)}.svg`;
            link.click();
            URL.revokeObjectURL(link.href);
          }}
          title="Export as SVG"
        >
          📄
        </button>
      </div>

      <CytoscapeComponent
        elements={elements}
        layout={layoutPresets[layoutName]}
        stylesheet={stylesheet}
        style={{ width: '100%', height: '100%' }}
        minZoom={0.2}
        maxZoom={3}
        cy={handleCyReady}
        onTap={event => {
          if (event.target === cyRef.current && onClearSelection) {
            onClearSelection();
          }
        }}
        panningEnabled
        userPanningEnabled
        userZoomingEnabled
        wheelSensitivity={0.3}
      />
    </div>
  );
}
