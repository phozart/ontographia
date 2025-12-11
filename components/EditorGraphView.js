// components/EditorGraphView.js
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useFilter } from './FilterContext';
import { useDomains } from './DomainContext';

const layoutPresets = {
  breadthfirst: { name: 'breadthfirst', directed: true, padding: 60, spacingFactor: 1.25 },
  cose: { name: 'cose', animate: false, padding: 60, nodeRepulsion: 12000, idealEdgeLength: 140 },
  concentric: { name: 'concentric', padding: 60, startAngle: Math.PI, sweep: Math.PI, minNodeSpacing: 45 },
  preset: { name: 'preset' },
};

export default function EditorGraphView({
  onNodeClick,
  onEdgeClick,
  onClearSelection,
  reloadKey,
  editorMode = 'select',
  onCanvasClick,
  onNodeConnectionClick,
  connectionState = null,
  highlightedNodeIds = [],
  focusNodeId = null,
}) {
  const cyRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [layoutName, setLayoutName] = useState('breadthfirst');
  const { typeFilters } = useFilter();
  const containerRef = useRef(null);
  const initialFitDoneRef = useRef(false);
  const baseSizesRef = useRef(new Map());
  const [themeDark, setThemeDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.dataset.theme === 'dark';
  });
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
          position: n.x != null && n.y != null ? { x: n.x, y: n.y } : undefined,
          classes: [`layer-${(n.layer || 'Unassigned').replace(/\s+/g, '')}`],
        };
        const iconVal = sanitizeIcon(n.icon || n.typeIcon);
        if (iconVal) {
          data.data.icon = iconVal;
        }
        return data;
      });

      const cyEdges = scopedRels.map((r, idx) => ({
        data: {
          id: r.id || `edge-${idx}`,
          source: r.sourceId,
          target: r.targetId,
          label: r.type,
        },
      }));

      // Use preset layout if nodes have positions
      const hasPositions = cyNodes.some(n => n.position);
      if (hasPositions) {
        setLayoutName('preset');
      }

      setElements([...cyNodes, ...cyEdges]);
    } catch (e) {
      console.error('Error loading graph', e);
    }
  }

  function layerColor(layer) {
    switch (layer) {
      case 'Physical': return '#bfdbfe';
      case 'Information': return '#bbf7d0';
      case 'Systems': return '#e9d5ff';
      case 'Rules': return '#fed7aa';
      case 'Governance': return '#fee2e2';
      default: return '#e5e7eb';
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

  function computeFontSize(n) {
    const size = computeSize(n);
    return Math.max(12, Math.min(20, Math.round(size / 7)));
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
          cursor: editorMode === 'draw-connection' ? 'pointer' : 'grab',
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
        selector: 'node.connection-source',
        style: {
          'border-color': '#3b82f6',
          'border-width': 6,
          'border-style': 'solid',
          'overlay-color': '#3b82f6',
          'overlay-opacity': 0.15,
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
          'curve-style': 'bezier',
          label: 'data(label)',
          'font-size': 11,
          'text-rotation': 'autorotate',
          color: themeDark ? '#f8fafc' : '#111827',
          'text-background-color': themeDark ? '#1f2430' : '#ffffff',
          'text-background-opacity': 0.9,
          'text-background-padding': '2px 3px',
          'text-outline-width': 0,
        },
      },
    ],
    [themeDark, editorMode]
  );

  const handleCyReady = useCallback((cy) => {
    cyRef.current = cy;
    cy.userPanningEnabled(true);
    cy.userZoomingEnabled(true);
    cy.boxSelectionEnabled(false);

    // Node click handler
    cy.on('tap', 'node', evt => {
      const data = evt.target.data();
      const nodeInfo = { id: data.id, data: { raw: data.raw || data } };

      if (editorMode === 'draw-connection' && onNodeConnectionClick) {
        // In connection mode, handle as connection click
        onNodeConnectionClick(nodeInfo);
      } else if (onNodeClick) {
        onNodeClick(nodeInfo);
      }
    });

    // Edge click handler
    cy.on('tap', 'edge', evt => {
      if (onEdgeClick) onEdgeClick(evt.target.data());
    });

    // Canvas click handler (for creating nodes)
    cy.on('tap', evt => {
      if (evt.target === cy) {
        if (editorMode === 'draw-node' && onCanvasClick) {
          const position = evt.position || evt.cyPosition;
          // Convert to screen coordinates for popup positioning
          const pan = cy.pan();
          const zoom = cy.zoom();
          const containerRect = containerRef.current?.getBoundingClientRect();
          const screenX = (position.x * zoom + pan.x) + (containerRect?.left || 0);
          const screenY = (position.y * zoom + pan.y) + (containerRect?.top || 0);
          onCanvasClick({
            canvasPosition: position,
            screenPosition: { x: screenX, y: screenY },
          });
        } else if (onClearSelection) {
          onClearSelection();
        }
      }
    });

    // Drag to connect - using mouse events
    let dragConnectionSource = null;

    cy.on('mousedown', 'node', evt => {
      if (editorMode === 'draw-connection') {
        dragConnectionSource = evt.target;
        evt.target.grabify(false); // Prevent dragging the node
      }
    });

    cy.on('mouseup', 'node', evt => {
      if (editorMode === 'draw-connection' && dragConnectionSource && dragConnectionSource !== evt.target) {
        const sourceData = dragConnectionSource.data();
        const targetData = evt.target.data();
        if (onNodeConnectionClick) {
          // Simulate two clicks: first source, then target
          onNodeConnectionClick({ id: sourceData.id, data: { raw: sourceData.raw || sourceData } }, true);
          setTimeout(() => {
            onNodeConnectionClick({ id: targetData.id, data: { raw: targetData.raw || targetData } });
          }, 50);
        }
      }
      if (dragConnectionSource) {
        dragConnectionSource.grabify(true);
        dragConnectionSource = null;
      }
    });

    cy.on('mouseup', evt => {
      if (evt.target === cy && dragConnectionSource) {
        dragConnectionSource.grabify(true);
        dragConnectionSource = null;
      }
    });

    // Node drag end - save position
    cy.on('dragfree', 'node', async evt => {
      if (editorMode === 'select') {
        const node = evt.target;
        const pos = node.position();
        const data = node.data();
        try {
          await fetch(`/api/nodes/${encodeURIComponent(data.id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: data.raw?.name || data.label || 'Node',
              x: pos.x,
              y: pos.y,
            }),
          });
        } catch (err) {
          console.error('Failed to save node position', err);
        }
      }
    });
  }, [editorMode, onNodeClick, onEdgeClick, onClearSelection, onCanvasClick, onNodeConnectionClick]);

  // Update connection source highlighting
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes().removeClass('connection-source');
    if (connectionState?.sourceId) {
      const sourceNode = cy.$id(String(connectionState.sourceId));
      if (sourceNode && sourceNode.nonempty()) {
        sourceNode.addClass('connection-source');
      }
    }
  }, [connectionState]);

  // Highlight nodes when prop changes
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

  // Run layout when elements or layout selection change
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || cy.destroyed?.() || cy.elements().length === 0) return;
    const layout = cy.layout(layoutPresets[layoutName] || layoutPresets.breadthfirst);
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

  // Update node grabbable state based on editor mode
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes().forEach(node => {
      if (editorMode === 'draw-connection') {
        node.grabify(false);
      } else {
        node.grabify(true);
      }
    });
  }, [editorMode, elements]);

  const getCursor = () => {
    switch (editorMode) {
      case 'draw-node': return 'crosshair';
      case 'draw-connection': return 'pointer';
      default: return 'default';
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', cursor: getCursor() }}
      tabIndex={0}
      onClick={() => containerRef.current?.focus()}
    >
      <CytoscapeComponent
        elements={elements}
        layout={layoutPresets[layoutName]}
        stylesheet={stylesheet}
        style={{ width: '100%', height: '100%' }}
        minZoom={0.2}
        maxZoom={2}
        cy={handleCyReady}
        panningEnabled
        userPanningEnabled
        userZoomingEnabled
      />
    </div>
  );
}
