// components/trace/TraceGraph.js
// React Flow-based graph visualization for trace exploration

import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Space color mapping
const SPACE_COLORS = {
  ba: '#3b82f6',      // Blue
  ea: '#8b5cf6',      // Purple
  cap: '#14b8a6',     // Teal
  pds: '#10b981',     // Green
  srs: '#6366f1',     // Indigo
  portfolio: '#06b6d4', // Cyan
  pdw: '#f59e0b',     // Amber
  dwd: '#f43f5e',     // Rose
  sd: '#f97316',      // Orange
  perf: '#34d399',    // Emerald
  cm: '#8b5cf6',      // Violet
  ks: '#64748b',      // Slate
};

// Space labels
const SPACE_LABELS = {
  ba: 'Business Analysis',
  ea: 'Enterprise Architecture',
  cap: 'Organisation',
  pds: 'Project Design',
  srs: 'Strategic Reasoning',
  portfolio: 'Portfolio',
  pdw: 'Product Design',
  dwd: 'Work Design',
  sd: 'System Dynamics',
  perf: 'Performance',
  cm: 'Change Management',
  ks: 'Knowledge',
};

/**
 * Custom node component for trace graph
 */
function TraceNode({ data, selected }) {
  const { name, type, space, isSource, status, onClick } = data;
  const color = SPACE_COLORS[space] || '#6b7280';

  return (
    <div
      className={`trace-node ${isSource ? 'trace-node--source' : ''} ${selected ? 'trace-node--selected' : ''}`}
      style={{
        '--node-color': color,
        '--node-color-light': `${color}20`,
      }}
      onClick={onClick}
    >
      <div className="trace-node__header">
        <span className="trace-node__space">{SPACE_LABELS[space] || space}</span>
        {status && <span className={`trace-node__status trace-node__status--${status.toLowerCase()}`}>{status}</span>}
      </div>
      <div className="trace-node__name">{name}</div>
      <div className="trace-node__type">{type}</div>
      {isSource && <div className="trace-node__badge">Source</div>}
    </div>
  );
}

// Register custom node types
const nodeTypes = {
  traceNode: TraceNode,
};

/**
 * Convert API trace data to React Flow format
 */
function convertToFlowData(traceData, sourceId, onNodeClick) {
  if (!traceData) return { nodes: [], edges: [] };

  const { nodes: apiNodes, edges: apiEdges } = traceData;

  // Group nodes by depth for layered layout
  const nodesByDepth = {};
  apiNodes.forEach(node => {
    const depth = node.depth || 0;
    if (!nodesByDepth[depth]) nodesByDepth[depth] = [];
    nodesByDepth[depth].push(node);
  });

  // Calculate positions with horizontal layout (source on left)
  const HORIZONTAL_SPACING = 280;
  const VERTICAL_SPACING = 120;
  const nodePositions = new Map();

  Object.entries(nodesByDepth).forEach(([depth, depthNodes]) => {
    const d = parseInt(depth, 10);
    const totalHeight = depthNodes.length * VERTICAL_SPACING;
    const startY = -totalHeight / 2;

    depthNodes.forEach((node, index) => {
      nodePositions.set(node.id, {
        x: d * HORIZONTAL_SPACING,
        y: startY + index * VERTICAL_SPACING,
      });
    });
  });

  // Convert nodes
  const flowNodes = apiNodes.map(node => {
    const pos = nodePositions.get(node.id) || { x: 0, y: 0 };
    return {
      id: node.id,
      type: 'traceNode',
      position: pos,
      data: {
        ...node,
        isSource: node.id === sourceId,
        onClick: () => onNodeClick && onNodeClick(node),
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
  });

  // Convert edges
  const flowEdges = apiEdges.map(edge => ({
    id: edge.id || `${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    label: edge.type,
    type: 'smoothstep',
    animated: edge.direction === 'downstream',
    style: {
      stroke: edge.direction === 'upstream' ? '#94a3b8' : '#6366f1',
      strokeWidth: 2,
    },
    labelStyle: {
      fontSize: 10,
      fontWeight: 500,
      fill: '#64748b',
    },
    labelBgStyle: {
      fill: 'white',
      fillOpacity: 0.9,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: edge.direction === 'upstream' ? '#94a3b8' : '#6366f1',
      width: 16,
      height: 16,
    },
  }));

  return { nodes: flowNodes, edges: flowEdges };
}

/**
 * TraceGraph component
 */
export default function TraceGraph({
  traceData,
  sourceId,
  onNodeClick,
  onNodeDoubleClick,
  loading = false,
  direction = 'both',
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert trace data when it changes
  useEffect(() => {
    if (!traceData) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { nodes: flowNodes, edges: flowEdges } = convertToFlowData(
      traceData,
      sourceId,
      onNodeClick
    );

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [traceData, sourceId, onNodeClick, setNodes, setEdges]);

  // Handle node double click for re-centering
  const handleNodeDoubleClick = useCallback((event, node) => {
    if (onNodeDoubleClick && node.data) {
      onNodeDoubleClick(node.data);
    }
  }, [onNodeDoubleClick]);

  // MiniMap node color
  const nodeColor = useCallback((node) => {
    const space = node.data?.space || 'ba';
    return SPACE_COLORS[space] || '#6b7280';
  }, []);

  // Empty state
  if (!traceData && !loading) {
    return (
      <div className="trace-graph-empty">
        <div className="trace-graph-empty__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <h3>Select an Artefact</h3>
        <p>Search for an artefact to explore its trace connections across all spaces.</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="trace-graph-loading">
        <div className="trace-graph-loading__spinner" />
        <p>Tracing connections...</p>
      </div>
    );
  }

  // No connections found
  if (traceData && nodes.length <= 1) {
    return (
      <div className="trace-graph-empty">
        <div className="trace-graph-empty__icon" style={{ opacity: 0.5 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h3>No Connections Found</h3>
        <p>This artefact has no {direction === 'both' ? '' : direction} relationships to trace.</p>
      </div>
    );
  }

  return (
    <div className="trace-graph">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={handleNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={nodeColor}
          nodeStrokeWidth={3}
          zoomable
          pannable
          style={{
            backgroundColor: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 8,
          }}
        />
      </ReactFlow>

      {/* Legend */}
      <div className="trace-graph__legend">
        <div className="trace-graph__legend-title">Spaces</div>
        <div className="trace-graph__legend-items">
          {Object.entries(SPACE_COLORS).slice(0, 6).map(([space, color]) => (
            <div key={space} className="trace-graph__legend-item">
              <span
                className="trace-graph__legend-dot"
                style={{ backgroundColor: color }}
              />
              <span>{SPACE_LABELS[space] || space}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
