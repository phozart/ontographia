/**
 * ForceGraph - Node-edge network visualization
 *
 * Reusable component for displaying force-directed graphs
 * with nodes and edges.
 *
 * @module components/ui/ForceGraph
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styles from './ui.module.css';

/**
 * Simple force simulation
 * Note: For production, consider using d3-force for better performance
 */
function useForceSimulation(nodes, edges, width, height) {
  const [positions, setPositions] = useState({});

  useEffect(() => {
    if (nodes.length === 0) {
      setPositions({});
      return;
    }

    // Initialize positions randomly
    const initialPositions = {};
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      initialPositions[node.id] = {
        x: width / 2 + radius * Math.cos(angle) + (Math.random() - 0.5) * 50,
        y: height / 2 + radius * Math.sin(angle) + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
      };
    });

    // Simple force simulation
    const simulate = () => {
      const newPositions = { ...initialPositions };
      const iterations = 50;
      const alpha = 0.3;

      for (let iter = 0; iter < iterations; iter++) {
        // Repulsion between all nodes
        nodes.forEach(node1 => {
          nodes.forEach(node2 => {
            if (node1.id === node2.id) return;

            const p1 = newPositions[node1.id];
            const p2 = newPositions[node2.id];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 500 / (dist * dist);

            p1.x -= (dx / dist) * force * alpha;
            p1.y -= (dy / dist) * force * alpha;
            p2.x += (dx / dist) * force * alpha;
            p2.y += (dy / dist) * force * alpha;
          });
        });

        // Attraction along edges
        edges.forEach(edge => {
          const source = newPositions[edge.source];
          const target = newPositions[edge.target];
          if (!source || !target) return;

          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 100) * 0.01;

          source.x += (dx / dist) * force * alpha;
          source.y += (dy / dist) * force * alpha;
          target.x -= (dx / dist) * force * alpha;
          target.y -= (dy / dist) * force * alpha;
        });

        // Center gravity
        const centerX = width / 2;
        const centerY = height / 2;
        nodes.forEach(node => {
          const p = newPositions[node.id];
          p.x += (centerX - p.x) * 0.01 * alpha;
          p.y += (centerY - p.y) * 0.01 * alpha;

          // Keep within bounds
          p.x = Math.max(50, Math.min(width - 50, p.x));
          p.y = Math.max(50, Math.min(height - 50, p.y));
        });
      }

      setPositions(newPositions);
    };

    simulate();
  }, [nodes, edges, width, height]);

  return positions;
}

/**
 * ForceGraph Component
 *
 * @param {Array} nodes - Node definitions: { id, label, color, size, type, data }
 * @param {Array} edges - Edge definitions: { source, target, label, color, style }
 * @param {number} width - Graph width
 * @param {number} height - Graph height
 * @param {function} onNodeClick - Handler when node clicked
 * @param {function} onEdgeClick - Handler when edge clicked
 * @param {function} renderNode - Custom node renderer
 * @param {boolean} showLabels - Show node labels
 * @param {boolean} showEdgeLabels - Show edge labels
 */
export function ForceGraph({
  nodes = [],
  edges = [],
  width = 600,
  height = 400,
  onNodeClick,
  onEdgeClick,
  renderNode,
  showLabels = true,
  showEdgeLabels = false,
  className = '',
}) {
  const svgRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Run force simulation
  const positions = useForceSimulation(nodes, edges, width, height);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node.id);
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [onNodeClick]);

  const handleEdgeClick = useCallback((edge) => {
    if (onEdgeClick) {
      onEdgeClick(edge);
    }
  }, [onEdgeClick]);

  // Find connected edges for highlighting
  const connectedEdges = useMemo(() => {
    if (!hoveredNode && !selectedNode) return new Set();
    const targetId = hoveredNode || selectedNode;
    return new Set(
      edges
        .filter(e => e.source === targetId || e.target === targetId)
        .map(e => `${e.source}-${e.target}`)
    );
  }, [edges, hoveredNode, selectedNode]);

  return (
    <div className={`${styles.forceGraph} ${className}`.trim()}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Edges */}
        <g className={styles.forceGraphEdges}>
          {edges.map((edge, idx) => {
            const sourcePos = positions[edge.source];
            const targetPos = positions[edge.target];
            if (!sourcePos || !targetPos) return null;

            const edgeId = `${edge.source}-${edge.target}`;
            const isConnected = connectedEdges.has(edgeId);
            const isHovered = hoveredEdge === edgeId;

            // Calculate edge path
            const dx = targetPos.x - sourcePos.x;
            const dy = targetPos.y - sourcePos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nodeRadius = 20;

            // Adjust for node radius
            const startX = sourcePos.x + (dx / dist) * nodeRadius;
            const startY = sourcePos.y + (dy / dist) * nodeRadius;
            const endX = targetPos.x - (dx / dist) * nodeRadius;
            const endY = targetPos.y - (dy / dist) * nodeRadius;

            return (
              <g key={idx}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={edge.color || 'var(--border)'}
                  strokeWidth={isHovered || isConnected ? 2 : 1}
                  strokeDasharray={edge.style === 'dashed' ? '5,5' : undefined}
                  opacity={connectedEdges.size > 0 && !isConnected ? 0.3 : 1}
                  className={styles.forceGraphEdge}
                  onMouseEnter={() => setHoveredEdge(edgeId)}
                  onMouseLeave={() => setHoveredEdge(null)}
                  onClick={() => handleEdgeClick(edge)}
                  markerEnd="url(#forceGraphArrowhead)"
                />

                {/* Edge label */}
                {showEdgeLabels && edge.label && (
                  <text
                    x={(startX + endX) / 2}
                    y={(startY + endY) / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill="var(--text-muted)"
                    className={styles.forceGraphEdgeLabel}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="forceGraphArrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="8"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" fill="var(--border)" />
          </marker>
        </defs>

        {/* Nodes */}
        <g className={styles.forceGraphNodes}>
          {nodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;

            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode === node.id;
            const isConnected = connectedEdges.size > 0 && edges.some(
              e => (e.source === node.id || e.target === node.id) && connectedEdges.has(`${e.source}-${e.target}`)
            );
            const nodeSize = node.size || 20;
            const nodeColor = node.color || 'var(--accent)';

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className={styles.forceGraphNode}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(node)}
                opacity={connectedEdges.size > 0 && !isConnected && !isHovered ? 0.3 : 1}
                style={{ cursor: 'pointer' }}
              >
                {renderNode ? (
                  renderNode(node, { isHovered, isSelected })
                ) : (
                  <>
                    {/* Node shape */}
                    {node.type === 'diamond' ? (
                      <rect
                        x={-nodeSize / 2}
                        y={-nodeSize / 2}
                        width={nodeSize}
                        height={nodeSize}
                        transform="rotate(45)"
                        fill={nodeColor}
                        stroke={isSelected ? 'var(--text)' : 'white'}
                        strokeWidth={isSelected ? 3 : 2}
                        className={styles.forceGraphNodeShape}
                      />
                    ) : node.type === 'square' ? (
                      <rect
                        x={-nodeSize / 2}
                        y={-nodeSize / 2}
                        width={nodeSize}
                        height={nodeSize}
                        rx="4"
                        fill={nodeColor}
                        stroke={isSelected ? 'var(--text)' : 'white'}
                        strokeWidth={isSelected ? 3 : 2}
                        className={styles.forceGraphNodeShape}
                      />
                    ) : (
                      <circle
                        r={nodeSize / 2}
                        fill={nodeColor}
                        stroke={isSelected ? 'var(--text)' : 'white'}
                        strokeWidth={isSelected ? 3 : 2}
                        className={styles.forceGraphNodeShape}
                      />
                    )}

                    {/* Node icon/text */}
                    {node.icon && (
                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="12"
                        fill="white"
                      >
                        {node.icon}
                      </text>
                    )}
                  </>
                )}

                {/* Node label */}
                {showLabels && node.label && (
                  <text
                    y={nodeSize / 2 + 14}
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--text)"
                    className={styles.forceGraphNodeLabel}
                  >
                    {node.label.length > 15 ? node.label.substring(0, 15) + '...' : node.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {(hoveredNode || hoveredEdge) && (
        <div className={styles.forceGraphTooltip}>
          {hoveredNode && (() => {
            const node = nodes.find(n => n.id === hoveredNode);
            return node ? (
              <>
                <strong>{node.label}</strong>
                {node.description && <p>{node.description}</p>}
              </>
            ) : null;
          })()}
          {hoveredEdge && (() => {
            const [sourceId, targetId] = hoveredEdge.split('-');
            const sourceNode = nodes.find(n => n.id === sourceId);
            const targetNode = nodes.find(n => n.id === targetId);
            const edge = edges.find(e => e.source === sourceId && e.target === targetId);
            return (
              <>
                <strong>{sourceNode?.label} → {targetNode?.label}</strong>
                {edge?.label && <p>{edge.label}</p>}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/**
 * DependencyGraph - Pre-configured ForceGraph for dependency visualization
 */
export function DependencyGraph({
  items = [],
  dependencies = [],
  onItemClick,
  className = '',
}) {
  // Convert items to nodes
  const nodes = items.map(item => ({
    id: item.id,
    label: item.name || item.title,
    color: item.status === 'completed' ? '#22c55e' :
           item.status === 'in_progress' ? '#3b82f6' :
           item.status === 'blocked' ? '#ef4444' : '#94a3b8',
    type: item.is_critical_path ? 'diamond' : 'circle',
    size: item.is_critical_path ? 24 : 20,
    data: item,
  }));

  // Convert dependencies to edges
  const edges = dependencies.map(dep => ({
    source: dep.from_id || dep.source_id,
    target: dep.to_id || dep.target_id,
    label: dep.type,
    style: dep.criticality === 'critical' ? 'solid' : 'dashed',
  }));

  return (
    <ForceGraph
      nodes={nodes}
      edges={edges}
      onNodeClick={(node) => onItemClick?.(node.data)}
      showLabels
      showEdgeLabels={false}
      className={className}
    />
  );
}

/**
 * RelationshipGraph - Pre-configured ForceGraph for artefact relationships
 */
export function RelationshipGraph({
  artefacts = [],
  relationships = [],
  onArtefactClick,
  className = '',
}) {
  // Type colors
  const typeColors = {
    pds_stakeholder: '#8b5cf6',
    pds_deliverable: '#3b82f6',
    pds_risk: '#ef4444',
    pds_milestone: '#f59e0b',
    pds_work_package: '#0ea5e9',
    default: '#6b7280',
  };

  // Convert artefacts to nodes
  const nodes = artefacts.map(art => ({
    id: art.id,
    label: art.name || art.title,
    color: typeColors[art.artefact_type] || typeColors.default,
    type: art.artefact_type === 'pds_milestone' ? 'diamond' : 'circle',
    data: art,
  }));

  // Convert relationships to edges
  const edges = relationships.map(rel => ({
    source: rel.from_artefact_id,
    target: rel.to_artefact_id,
    label: rel.relationship_type?.replace(/_/g, ' '),
  }));

  return (
    <ForceGraph
      nodes={nodes}
      edges={edges}
      onNodeClick={(node) => onArtefactClick?.(node.data)}
      showLabels
      showEdgeLabels
      className={className}
    />
  );
}

export default ForceGraph;
