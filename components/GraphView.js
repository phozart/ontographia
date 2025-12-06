// components/GraphView.js
import { useEffect, useMemo, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useFilter } from './FilterContext';

const layoutPresets = {
  breadthfirst: { name: 'breadthfirst', directed: true, padding: 60, spacingFactor: 1.25 },
  cose: { name: 'cose', animate: false, padding: 60, nodeRepulsion: 12000, idealEdgeLength: 140 },
  concentric: { name: 'concentric', padding: 60, startAngle: Math.PI, sweep: Math.PI, minNodeSpacing: 45 },
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
}) {
  const cyRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [layoutName, setLayoutName] = useState('breadthfirst');
  const { typeFilters } = useFilter();
  const [resizeState, setResizeState] = useState(null);
  const containerRef = useRef(null);
  const initialFitDoneRef = useRef(false);
  const baseSizesRef = useRef(new Map());
  const [themeDark, setThemeDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.dataset.theme === 'dark';
  });

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
  }, [reloadKey, typeFilters, themeDark]);

  async function loadGraph() {
    try {
      initialFitDoneRef.current = false;

      const query =
        typeFilters && typeFilters.length
          ? `?typeIds=${encodeURIComponent(typeFilters.join(','))}`
          : '';
      const [nodesRes, relsRes] = await Promise.all([
        fetch(`/api/nodes${query}`),
        fetch('/api/relationships'),
      ]);
      if (!nodesRes.ok || !relsRes.ok) {
        console.error('Failed to load graph data', nodesRes.status, relsRes.status);
        return;
      }
      const domainNodes = await nodesRes.json();
      const rels = await relsRes.json();

      const cyNodes = (Array.isArray(domainNodes) ? domainNodes : []).map(n => {
        const baseColor = n.color || n.typeColor || layerColor(n.layer);
        const color = themeDark ? darkenForDarkMode(baseColor) : baseColor;
        const data = {
          data: {
            id: n.id,
            label: n.name,
            layer: n.layer || 'Unassigned',
            color,
            shape: n.shape || n.typeShape || 'ellipse',
            raw: n,
            weight:
              typeof n.weight === 'number'
                ? n.weight
                : isNaN(parseFloat(n.weight))
                  ? 1
                : parseFloat(n.weight),
            size: computeSize(n),
            textWidth: computeTextWidth(n),
            fontSize: computeFontSize(n),
            textColor: computeTextColor(color),
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

      const nodeIds = new Set((Array.isArray(domainNodes) ? domainNodes : []).map(n => n.id));
      const cyEdges = (Array.isArray(rels) ? rels : [])
        .filter(r => nodeIds.has(r.sourceId) && nodeIds.has(r.targetId))
        .map((r, idx) => ({
          data: {
            id: r.id || `edge-${idx}`,
            source: r.sourceId,
            target: r.targetId,
            label: r.type,
          },
        }));

      setElements([...cyNodes, ...cyEdges]);
    } catch (e) {
      console.error('Error loading graph', e);
    }
  }

  function layerColor(layer) {
    switch (layer) {
      case 'Physical':
        return '#bfdbfe';
      case 'Information':
        return '#bbf7d0';
      case 'Systems':
        return '#e9d5ff';
      case 'Rules':
        return '#fed7aa';
      case 'Governance':
        return '#fee2e2';
      default:
        return '#e5e7eb';
    }
  }

  function computeSize(n) {
    const rawWeight =
      typeof n.weight === 'number'
        ? n.weight
        : isNaN(parseFloat(n.weight))
          ? 1
          : parseFloat(n.weight);
    const clamped = Math.max(0, Math.min(rawWeight, 5));
    return Math.max(80, Math.min(180, 90 + clamped * 18));
  }

  function computeTextWidth(n) {
    const size = computeSize(n);
    return Math.max(70, Math.min(160, size * 0.7));
  }

  function computeTextWidthFromSize(size) {
    return Math.max(70, Math.min(160, size * 0.7));
  }

  function computeFontSize(n) {
    const size = computeSize(n);
    return Math.max(12, Math.min(20, Math.round(size / 7)));
  }

  function computeFontSizeFromSize(size) {
    return Math.max(12, Math.min(20, Math.round(size / 7)));
  }

  function sizeToWeight(size) {
    const w = (size - 90) / 18;
    return Math.max(0, Math.min(5, isNaN(w) ? 0 : w));
  }

  function hexToRgb(hex) {
    if (!hex) return { r: 255, g: 255, b: 255 };
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

  function darkenForDarkMode(hex) {
    const { r, g, b } = hexToRgb(hex);
    const factor = 0.55;
    const blend = 25;
    const dr = Math.max(0, Math.min(255, Math.round(r * factor + blend)));
    const dg = Math.max(0, Math.min(255, Math.round(g * factor + blend)));
    const db = Math.max(0, Math.min(255, Math.round(b * factor + blend)));
    return `rgb(${dr}, ${dg}, ${db})`;
  }

  function computeTextColor(bg) {
    const { r, g, b } = hexToRgb(bg);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#0f172a' : '#f8fafc';
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

  const stylesheet = useMemo(
    () => [
      {
        selector: 'node',
        style: {
          'background-color': 'data(color)',
          'border-width': 0,
          label: 'data(label)',
          color: 'data(textColor)',
          'font-size': 'data(fontSize)',
          'text-valign': 'center',
          'text-halign': 'center',
          'text-wrap': 'wrap',
          'text-max-width': 'data(textWidth)',
          'text-outline-width': 0,
          padding: '6px',
          shape: 'data(shape)',
          width: 'data(size)',
          height: 'data(size)',
          cursor: 'crosshair',
        },
      },
      {
        selector: 'node[icon]',
        style: {
          'background-image': 'data(icon)',
          'background-fit': 'cover',
          'background-opacity': 1,
        },
      },
      {
        selector: 'node:selected',
        style: {
          'border-color': '#111827',
          'border-width': 6,
          'border-style': 'solid',
          'overlay-color': '#111827',
          'overlay-opacity': 0.05,
        },
      },
      {
        selector: 'node.highlighted',
        style: {
          'border-color': '#4f46e5',
          'border-width': 8,
          'border-style': 'double',
          'overlay-color': '#4f46e5',
          'overlay-opacity': 0.08,
        },
      },
      {
        selector: 'edge',
        style: {
          width: 2.2,
          'line-color': '#6b7280',
          'target-arrow-color': '#6b7280',
          'target-arrow-shape': 'triangle',
          'source-arrow-color': '#6b7280',
          'source-arrow-shape': 'circle',
          'source-arrow-fill': 'filled',
          'source-arrow-size': 6,
          'curve-style': 'bezier',
          label: 'data(label)',
          'font-size': 11,
          'text-rotation': 'autorotate',
          color: themeDark ? '#e5e7eb' : '#111827',
          'text-background-opacity': 0,
          'text-outline-width': 0,
        },
      },

    ],
    [themeDark]
  );

  function handleCyReady(cy) {
    cyRef.current = cy;
    cy.userPanningEnabled(true);
    cy.userZoomingEnabled(true);
    cy.boxSelectionEnabled(false);
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
    cy.on('drag', 'node', evt => {
      const pos = evt.target.position();
      const neighbors = evt.target.neighborhood('node');
      neighbors.forEach(n => {
        if (n.grabbed()) return;
        const np = n.position();
        const dx = pos.x - np.x;
        const dy = pos.y - np.y;
        const nx = np.x + dx * 0.05;
        const ny = np.y + dy * 0.05;
        n.animate({ position: { x: nx, y: ny } }, { duration: 160, easing: 'ease-out', queue: false });
      });
    });

    // Background double-click disabled; use keyboard shortcut instead
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

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return undefined;

    function onMouseDown(evt) {
      if (evt.target?.group?.() !== 'nodes') return;
      if (!evt.originalEvent?.altKey) return; // Alt+drag to resize
      evt.preventDefault();
      const node = evt.target;
      const center = node.position();
      const currentSize = node.data('size') || computeSize(node.data('raw') || {});
      cy.userPanningEnabled(false);
      const wasGrabbable = node.grabbable();
      node.grabify(false); // prevent node drag during resize
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
      const center = node.position(); // live center in case layout/pan changes
      const dx = evt.position.x - center.x;
      const dy = evt.position.y - center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const delta = dist - startRadius;
      const newSize = Math.max(60, Math.min(200, startSize + delta * 2)); // adjust relative to starting radius
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

  // Highlight nodes when prop changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    // reset sizes and classes
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
          ele.data('size', currentSize * 1.5);
          ele.addClass('highlighted');
          ele.select();
        }
      });
    }
  }, [highlightedNodeIds]);

  // Focus a node when requested
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !focusNodeId) return;
    const ele = cy.$id(String(focusNodeId));
    if (ele && ele.nonempty()) {
      ele.select();
      cy.animate(
        {
          center: { eles: ele },
          zoom: Math.min(1.2, Math.max(0.4, cy.zoom())),
        },
        { duration: 350, easing: 'ease-out' }
      );
    }
  }, [focusNodeId]);

  function playIntroAnimation() {
    const cy = cyRef.current;
    if (!cy) return;
    cy.nodes().forEach(node => {
      const pos = node.position();
      const dx = (Math.random() - 0.5) * 18;
      const dy = (Math.random() - 0.5) * 18;
      node.position({ x: pos.x + dx, y: pos.y + dy });
      node.animate({ position: pos }, { duration: 520, easing: 'ease-out-cubic' });
    });
  }

  // Run layout when elements or layout selection change
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || cy.elements().length === 0) return;
    const layout = cy.layout(layoutPresets[layoutName] || layoutPresets.breadthfirst);
    layout.run();
    layout.once('layoutstop', () => {
      if (!initialFitDoneRef.current) {
        cy.fit(cy.nodes(), 60);
        initialFitDoneRef.current = true;
      }
      playIntroAnimation();
    });
  }, [elements, layoutName]);

  return (
    <div
      ref={containerRef}
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
      <CytoscapeComponent
        elements={elements}
        layout={layoutPresets[layoutName]}
        stylesheet={stylesheet}
        style={{ width: '100%', height: '100%' }}
        minZoom={0.2}
        maxZoom={2}
        cy={handleCyReady}
        onTap={event => {
          if (event.target === cyRef.current && onClearSelection) {
            onClearSelection();
          }
        }}
        panningEnabled
        userPanningEnabled
        userZoomingEnabled
      />
    </div>
  );
}
