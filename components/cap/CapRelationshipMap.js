/**
 * CapRelationshipMap - Auto-generated visualization with drag support
 *
 * Creates a visual map showing:
 * - Capabilities (with hierarchy)
 * - Value Streams (linked to capabilities)
 * - Initiatives (linked to gaps/capabilities)
 * - Dependencies and enabling relationships
 *
 * @component
 * @module components/cap/CapRelationshipMap
 */

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useCap, CAP_MATURITY_LEVELS, CAP_TYPE_DEFS } from './CapContext';

// Icons (for empty state)
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';

// Node dimensions by type
const NODE_SIZES = {
  cap_capability: { width: 180, height: 70 },
  cap_capability_group: { width: 200, height: 50 },
  cap_value_stream: { width: 200, height: 60 },
  cap_initiative: { width: 160, height: 55 },
  cap_gap: { width: 140, height: 50 },
  default: { width: 160, height: 60 },
};

const LEVEL_GAP = 140;
const NODE_GAP = 40;

// Colors for relationship types
const RELATIONSHIP_COLORS = {
  parent: '#6366f1',      // Indigo - hierarchy
  depends_on: '#f59e0b',  // Amber - dependencies
  enables: '#10b981',     // Emerald - enabling
  value_stream: '#8b5cf6', // Purple - value stream
  initiative: '#ef4444',   // Red - initiative
};

// Node type colors
const TYPE_COLORS = {
  cap_capability: '#6366f1',
  cap_capability_group: '#7c3aed',
  cap_value_stream: '#0d9488',
  cap_initiative: '#10b981',
  cap_gap: '#dc2626',
};

/**
 * Get maturity color
 */
const getMaturityColor = (maturity) => {
  const level = CAP_MATURITY_LEVELS.find(l => l.id === maturity);
  return level?.color || '#9ca3af';
};

/**
 * Calculate initial layout positions
 */
function calculateInitialLayout(artefacts) {
  const positions = {};
  const levels = {};
  const children = {};

  // Separate artefact types
  const capabilities = artefacts.filter(a => a.artefact_type === 'cap_capability' || a.artefact_type === 'cap_capability_group');
  const valueStreams = artefacts.filter(a => a.artefact_type === 'cap_value_stream');
  const initiatives = artefacts.filter(a => a.artefact_type === 'cap_initiative' || a.artefact_type === 'cap_gap');

  // Build parent-child map for capabilities
  capabilities.forEach(a => {
    const parentId = a.custom_fields?.parent_id;
    if (parentId) {
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(a.id);
    }
  });

  // Find root capabilities (no parent)
  const roots = capabilities.filter(a => !a.custom_fields?.parent_id);

  // Assign levels using BFS for capabilities
  function assignLevels(nodeId, level) {
    if (!levels[level]) levels[level] = [];
    levels[level].push(nodeId);

    const nodeChildren = children[nodeId] || [];
    nodeChildren.forEach(childId => {
      assignLevels(childId, level + 1);
    });
  }

  roots.forEach(root => assignLevels(root.id, 0));

  // Add orphan capabilities
  capabilities.forEach(a => {
    const inAnyLevel = Object.values(levels).flat().includes(a.id);
    if (!inAnyLevel) {
      if (!levels[0]) levels[0] = [];
      levels[0].push(a.id);
    }
  });

  // Calculate positions for capabilities
  const levelKeys = Object.keys(levels).map(Number).sort((a, b) => a - b);
  const maxNodesInLevel = Math.max(...levelKeys.map(l => levels[l]?.length || 0), 1);
  const capabilityWidth = (maxNodesInLevel * (NODE_SIZES.cap_capability.width + NODE_GAP));

  levelKeys.forEach(level => {
    const nodesInLevel = levels[level] || [];
    const nodeWidth = NODE_SIZES.cap_capability.width;
    const levelWidth = nodesInLevel.length * (nodeWidth + NODE_GAP) - NODE_GAP;
    const startX = (capabilityWidth - levelWidth) / 2;

    nodesInLevel.forEach((nodeId, i) => {
      positions[nodeId] = {
        x: startX + i * (nodeWidth + NODE_GAP) + 60,
        y: level * LEVEL_GAP + 60,
      };
    });
  });

  // Position value streams on the right side
  const maxCapY = Math.max(...Object.values(positions).map(p => p.y), 60);
  valueStreams.forEach((vs, i) => {
    positions[vs.id] = {
      x: capabilityWidth + 100,
      y: 60 + i * (NODE_SIZES.cap_value_stream.height + NODE_GAP),
    };
  });

  // Position initiatives below value streams or on the right
  const maxVsY = valueStreams.length > 0
    ? Math.max(...valueStreams.map((_, i) => 60 + i * (NODE_SIZES.cap_value_stream.height + NODE_GAP)))
    : 60;

  initiatives.forEach((init, i) => {
    positions[init.id] = {
      x: capabilityWidth + 100,
      y: maxVsY + 100 + i * (NODE_SIZES.cap_initiative.height + NODE_GAP),
    };
  });

  const allPositions = Object.values(positions);
  const totalWidth = Math.max(...allPositions.map(p => p.x + 200), 800);
  const totalHeight = Math.max(...allPositions.map(p => p.y + 100), 400);

  return { positions, totalWidth, totalHeight };
}

/**
 * Build edges from relationships
 */
function buildEdges(artefacts, positions) {
  const edges = [];
  const artefactMap = {};
  artefacts.forEach(a => { artefactMap[a.id] = a; });

  artefacts.forEach(a => {
    // Parent edge (capabilities)
    const parentId = a.custom_fields?.parent_id;
    if (parentId && positions[parentId] && positions[a.id]) {
      edges.push({
        id: `parent-${parentId}-${a.id}`,
        from: parentId,
        to: a.id,
        type: 'parent',
        label: 'contains',
      });
    }

    // Depends on edges
    const dependsOn = a.custom_fields?.depends_on || [];
    dependsOn.forEach(depId => {
      if (positions[depId] && positions[a.id]) {
        edges.push({
          id: `depends-${a.id}-${depId}`,
          from: a.id,
          to: depId,
          type: 'depends_on',
          label: 'depends on',
        });
      }
    });

    // Enables edges
    const enables = a.custom_fields?.enables || [];
    enables.forEach(enabledId => {
      if (positions[enabledId] && positions[a.id]) {
        edges.push({
          id: `enables-${a.id}-${enabledId}`,
          from: a.id,
          to: enabledId,
          type: 'enables',
          label: 'enables',
        });
      }
    });

    // Value stream edges
    const valueStreams = a.custom_fields?.value_streams || [];
    valueStreams.forEach(vsId => {
      if (positions[vsId] && positions[a.id]) {
        edges.push({
          id: `vs-${a.id}-${vsId}`,
          from: a.id,
          to: vsId,
          type: 'value_stream',
          label: 'supports',
        });
      }
    });

    // Initiative -> capability edges (target_capabilities)
    const targetCaps = a.custom_fields?.target_capabilities || [];
    targetCaps.forEach(capId => {
      if (positions[capId] && positions[a.id]) {
        edges.push({
          id: `init-${a.id}-${capId}`,
          from: a.id,
          to: capId,
          type: 'initiative',
          label: 'develops',
        });
      }
    });
  });

  return edges;
}

/**
 * Draggable SVG Node Component
 */
function MapNode({ artefact, position, onClick, isSelected, onDragStart, onDrag, onDragEnd, isDragging }) {
  const nodeSize = NODE_SIZES[artefact.artefact_type] || NODE_SIZES.default;
  const maturity = artefact.custom_fields?.maturity;
  const maturityColor = getMaturityColor(maturity);
  const typeColor = TYPE_COLORS[artefact.artefact_type] || '#6366f1';
  const typeDef = CAP_TYPE_DEFS[artefact.artefact_type];

  const handleMouseDown = (e) => {
    e.stopPropagation();
    onDragStart?.(artefact.id, e);
  };

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Background */}
      <rect
        width={nodeSize.width}
        height={nodeSize.height}
        rx={8}
        fill="var(--panel)"
        stroke={isSelected ? 'var(--accent)' : typeColor}
        strokeWidth={isSelected ? 2 : 1}
        opacity={isDragging ? 0.8 : 1}
      />

      {/* Type color indicator */}
      <rect
        x={0}
        y={0}
        width={4}
        height={nodeSize.height}
        rx={2}
        fill={artefact.artefact_type === 'cap_capability' ? maturityColor : typeColor}
      />

      {/* Type badge */}
      <rect
        x={10}
        y={6}
        width={Math.min((typeDef?.name?.length || 8) * 6 + 8, nodeSize.width - 20)}
        height={16}
        rx={4}
        fill={`${typeColor}20`}
      />
      <text
        x={14}
        y={17}
        fontSize={9}
        fill={typeColor}
        fontWeight={500}
      >
        {typeDef?.name || artefact.artefact_type}
      </text>

      {/* Name */}
      <text
        x={10}
        y={38}
        fontSize={12}
        fontWeight={500}
        fill="var(--text)"
      >
        {artefact.name?.length > 22 ? artefact.name.slice(0, 20) + '...' : artefact.name}
      </text>

      {/* Additional info based on type */}
      {artefact.artefact_type === 'cap_capability' && maturity && (
        <text
          x={10}
          y={54}
          fontSize={9}
          fill={maturityColor}
        >
          {CAP_MATURITY_LEVELS.find(l => l.id === maturity)?.label || maturity}
        </text>
      )}
      {artefact.artefact_type === 'cap_value_stream' && artefact.custom_fields?.outcome && (
        <text
          x={10}
          y={52}
          fontSize={9}
          fill="var(--text-muted)"
        >
          → {artefact.custom_fields.outcome.slice(0, 25)}...
        </text>
      )}

      {/* Click target (invisible, for edit) */}
      <rect
        width={nodeSize.width}
        height={nodeSize.height}
        fill="transparent"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(artefact);
        }}
      />
    </g>
  );
}

/**
 * SVG Edge Component
 */
function MapEdge({ edge, positions }) {
  const fromPos = positions[edge.from];
  const toPos = positions[edge.to];

  if (!fromPos || !toPos) return null;

  const fromSize = NODE_SIZES.cap_capability;
  const toSize = NODE_SIZES.cap_capability;

  // Calculate connection points
  const fromCenterX = fromPos.x + fromSize.width / 2;
  const fromCenterY = fromPos.y + fromSize.height / 2;
  const toCenterX = toPos.x + toSize.width / 2;
  const toCenterY = toPos.y + toSize.height / 2;

  // Determine best connection points based on relative positions
  let startX, startY, endX, endY;

  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;

  if (Math.abs(dy) > Math.abs(dx)) {
    // Vertical connection
    if (dy > 0) {
      startX = fromCenterX;
      startY = fromPos.y + fromSize.height;
      endX = toCenterX;
      endY = toPos.y;
    } else {
      startX = fromCenterX;
      startY = fromPos.y;
      endX = toCenterX;
      endY = toPos.y + toSize.height;
    }
  } else {
    // Horizontal connection
    if (dx > 0) {
      startX = fromPos.x + fromSize.width;
      startY = fromCenterY;
      endX = toPos.x;
      endY = toCenterY;
    } else {
      startX = fromPos.x;
      startY = fromCenterY;
      endX = toPos.x + toSize.width;
      endY = toCenterY;
    }
  }

  const color = RELATIONSHIP_COLORS[edge.type] || '#6b7280';

  // Bezier curve
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const path = Math.abs(dx) > Math.abs(dy)
    ? `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`
    : `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

  const markerId = `arrow-${edge.type}-${edge.id}`;

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={5}
          markerHeight={5}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={edge.type === 'parent' ? 2 : 1.5}
        strokeDasharray={edge.type === 'depends_on' ? '5,3' : undefined}
        markerEnd={`url(#${markerId})`}
        opacity={0.7}
      />
    </g>
  );
}

/**
 * Legend Component
 */
function MapLegend({ showTypes }) {
  return (
    <div className="map-legend">
      {showTypes && (
        <>
          <div className="legend-section">
            <span className="legend-title">Types</span>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: TYPE_COLORS.cap_capability }} />
              <span>Capability</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: TYPE_COLORS.cap_value_stream }} />
              <span>Value Stream</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: TYPE_COLORS.cap_initiative }} />
              <span>Initiative</span>
            </div>
          </div>
          <div className="legend-divider" />
        </>
      )}
      <div className="legend-section">
        <span className="legend-title">Relationships</span>
        <div className="legend-item">
          <svg width={24} height={12}>
            <line x1={0} y1={6} x2={24} y2={6} stroke={RELATIONSHIP_COLORS.parent} strokeWidth={2} />
          </svg>
          <span>Hierarchy</span>
        </div>
        <div className="legend-item">
          <svg width={24} height={12}>
            <line x1={0} y1={6} x2={24} y2={6} stroke={RELATIONSHIP_COLORS.depends_on} strokeWidth={1.5} strokeDasharray="5,3" />
          </svg>
          <span>Depends on</span>
        </div>
        <div className="legend-item">
          <svg width={24} height={12}>
            <line x1={0} y1={6} x2={24} y2={6} stroke={RELATIONSHIP_COLORS.enables} strokeWidth={1.5} />
          </svg>
          <span>Enables</span>
        </div>
        <div className="legend-item">
          <svg width={24} height={12}>
            <line x1={0} y1={6} x2={24} y2={6} stroke={RELATIONSHIP_COLORS.value_stream} strokeWidth={1.5} />
          </svg>
          <span>Supports</span>
        </div>
      </div>

      <style jsx>{`
        .map-legend {
          position: absolute;
          bottom: 16px;
          left: 16px;
          display: flex;
          gap: 12px;
          padding: 10px 14px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 10px;
          color: var(--text-muted);
        }

        .legend-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .legend-title {
          font-weight: 600;
          color: var(--text);
          margin-bottom: 2px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-divider {
          width: 1px;
          background: var(--border);
        }
      `}</style>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ moduleId, onCreate }) {
  return (
    <div className="map-empty-state">
      <div className="empty-icon">
        <AccountTreeIcon style={{ fontSize: 48 }} />
      </div>
      <h3>No Items to Map</h3>
      <p>Create capabilities and define relationships to see your model.</p>

      <div className="empty-steps">
        <div className="empty-step"><span className="step-num">1</span><span>Create capabilities</span></div>
        <div className="empty-step"><span className="step-num">2</span><span>Set Parent, Depends On, Enables</span></div>
        <div className="empty-step"><span className="step-num">3</span><span>Drag nodes to arrange</span></div>
      </div>

      {onCreate && (
        <button className="empty-create-btn" onClick={() => onCreate(null)}>
          <AddIcon fontSize="small" />
          <span>Create First Item</span>
        </button>
      )}

      <style jsx>{`
        .map-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
        }

        .empty-icon {
          color: var(--text-muted);
          opacity: 0.5;
          margin-bottom: 16px;
        }

        h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
        }

        p {
          margin: 0 0 24px 0;
          color: var(--text-muted);
        }

        .empty-steps {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
          text-align: left;
        }

        .empty-step {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text);
        }

        .step-num {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 11px;
          font-weight: 600;
          border-radius: 50%;
        }

        .empty-create-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .empty-create-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

/**
 * CapRelationshipMap Component
 */
export default function CapRelationshipMap({
  artefacts = [],
  moduleId = 'capabilities',
  onNodeClick,
  onCreateClick,
}) {
  const { valueStreams, initiatives, gaps } = useCap();
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // Combine all relevant artefacts for unified view
  const allArtefacts = useMemo(() => {
    // For capabilities module, show capabilities + linked value streams + initiatives
    if (moduleId === 'capabilities') {
      return [...artefacts, ...valueStreams, ...initiatives, ...gaps];
    }
    return artefacts;
  }, [artefacts, valueStreams, initiatives, gaps, moduleId]);

  // Node positions (persisted for dragging)
  const [nodePositions, setNodePositions] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // View state
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 });
  const [zoom, setZoom] = useState(1);

  // Calculate initial layout
  const { positions: initialPositions, totalWidth, totalHeight } = useMemo(() => {
    if (allArtefacts.length === 0) {
      return { positions: {}, totalWidth: 1200, totalHeight: 800 };
    }
    return calculateInitialLayout(allArtefacts);
  }, [allArtefacts]);

  // Initialize positions if not set
  useEffect(() => {
    if (Object.keys(nodePositions).length === 0 && Object.keys(initialPositions).length > 0) {
      setNodePositions(initialPositions);
    }
    // Add new nodes that don't have positions
    const newPositions = { ...nodePositions };
    let hasNew = false;
    allArtefacts.forEach(a => {
      if (!newPositions[a.id] && initialPositions[a.id]) {
        newPositions[a.id] = initialPositions[a.id];
        hasNew = true;
      }
    });
    if (hasNew) {
      setNodePositions(newPositions);
    }
  }, [initialPositions, nodePositions, allArtefacts]);

  // Build edges
  const edges = useMemo(() => {
    return buildEdges(allArtefacts, nodePositions);
  }, [allArtefacts, nodePositions]);

  // Handle node click
  const handleNodeClick = useCallback((artefact) => {
    setSelectedId(artefact.id);
    onNodeClick?.(artefact);
  }, [onNodeClick]);

  // Drag handlers
  const handleDragStart = useCallback((nodeId, e) => {
    const pos = nodePositions[nodeId];
    if (!pos) return;

    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const scale = svgRect.width / viewBox.width;
    const mouseX = (e.clientX - svgRect.left) / scale + viewBox.x;
    const mouseY = (e.clientY - svgRect.top) / scale + viewBox.y;

    setDraggingId(nodeId);
    setDragOffset({
      x: mouseX - pos.x,
      y: mouseY - pos.y,
    });
  }, [nodePositions, viewBox]);

  const handleMouseMove = useCallback((e) => {
    if (!draggingId) return;

    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const scale = svgRect.width / viewBox.width;
    const mouseX = (e.clientX - svgRect.left) / scale + viewBox.x;
    const mouseY = (e.clientY - svgRect.top) / scale + viewBox.y;

    setNodePositions(prev => ({
      ...prev,
      [draggingId]: {
        x: mouseX - dragOffset.x,
        y: mouseY - dragOffset.y,
      },
    }));
  }, [draggingId, dragOffset, viewBox]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
  }, []);

  // Pan handler
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handlePanStart = (e) => {
    if (e.target.tagName === 'svg' || e.target.tagName === 'rect') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePan = (e) => {
    if (isPanning && !draggingId) {
      const svgRect = svgRef.current?.getBoundingClientRect();
      if (!svgRect) return;

      const scale = svgRect.width / viewBox.width;
      const dx = (e.clientX - panStart.x) / scale;
      const dy = (e.clientY - panStart.y) / scale;

      setViewBox(prev => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy,
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
    setViewBox(prev => ({
      ...prev,
      width: prev.width / 1.2,
      height: prev.height / 1.2,
    }));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
    setViewBox(prev => ({
      ...prev,
      width: prev.width * 1.2,
      height: prev.height * 1.2,
    }));
  };

  const handleFitToView = () => {
    setViewBox({
      x: 0,
      y: 0,
      width: Math.max(totalWidth + 100, 1200),
      height: Math.max(totalHeight + 100, 800),
    });
    setZoom(1);
  };

  // Empty state
  if (allArtefacts.length === 0) {
    return <EmptyState moduleId={moduleId} onCreate={onCreateClick} />;
  }

  const hasRelationships = edges.length > 0;
  const showMultipleTypes = valueStreams.length > 0 || initiatives.length > 0;

  return (
    <div className="cap-relationship-map" ref={containerRef}>
      {/* Toolbar */}
      <div className="map-toolbar">
        <button onClick={handleZoomIn} title="Zoom in">
          <ZoomInIcon fontSize="small" />
        </button>
        <button onClick={handleZoomOut} title="Zoom out">
          <ZoomOutIcon fontSize="small" />
        </button>
        <button onClick={handleFitToView} title="Fit to view">
          <CenterFocusStrongIcon fontSize="small" />
        </button>
        <span className="toolbar-hint">Drag nodes to reposition</span>
      </div>

      {/* Hint when no relationships */}
      {!hasRelationships && (
        <div className="map-hint">
          <strong>No relationships yet.</strong> Click a node to edit and add relationships.
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handlePanStart}
        onMouseMove={(e) => { handlePan(e); handleMouseMove(e); }}
        onMouseUp={() => { handlePanEnd(); handleMouseUp(); }}
        onMouseLeave={() => { handlePanEnd(); handleMouseUp(); }}
        style={{ cursor: draggingId ? 'grabbing' : isPanning ? 'grabbing' : 'default' }}
      >
        {/* Grid pattern */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect x={viewBox.x - 1000} y={viewBox.y - 1000} width={viewBox.width + 2000} height={viewBox.height + 2000} fill="url(#grid)" />

        {/* Edges */}
        <g className="edges">
          {edges.map(edge => (
            <MapEdge
              key={edge.id}
              edge={edge}
              positions={nodePositions}
            />
          ))}
        </g>

        {/* Nodes */}
        <g className="nodes">
          {allArtefacts.map(artefact => (
            nodePositions[artefact.id] && (
              <MapNode
                key={artefact.id}
                artefact={artefact}
                position={nodePositions[artefact.id]}
                onClick={handleNodeClick}
                isSelected={selectedId === artefact.id}
                onDragStart={handleDragStart}
                isDragging={draggingId === artefact.id}
              />
            )
          ))}
        </g>
      </svg>

      {/* Legend */}
      <MapLegend showTypes={showMultipleTypes} />

      <style jsx>{`
        .cap-relationship-map {
          flex: 1;
          position: relative;
          background: var(--bg);
          overflow: hidden;
        }

        .map-toolbar {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          gap: 4px;
          padding: 4px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          z-index: 10;
        }

        .map-toolbar button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 4px;
        }

        .map-toolbar button:hover {
          background: var(--bg);
          color: var(--text);
        }

        .toolbar-hint {
          display: flex;
          align-items: center;
          padding: 0 8px;
          font-size: 11px;
          color: var(--text-muted);
          border-left: 1px solid var(--border);
          margin-left: 4px;
        }

        .map-hint {
          position: absolute;
          top: 16px;
          left: 16px;
          padding: 10px 14px;
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          font-size: 12px;
          color: #92400e;
          max-width: 300px;
          z-index: 10;
        }

        svg {
          display: block;
        }
      `}</style>
    </div>
  );
}
