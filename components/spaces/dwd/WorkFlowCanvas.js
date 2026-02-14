// components/dwd/WorkFlowCanvas.js
// Visual ReactFlow canvas for Dynamic Work Design
// Shows actors, work items, and coordination patterns

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useDWD } from './DWDContext';
import ActorNode from './nodes/ActorNode';
import WorkItemNode from './nodes/WorkItemNode';

// MUI Icons
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import GroupIcon from '@mui/icons-material/Group';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SyncIcon from '@mui/icons-material/Sync';
import UpdateIcon from '@mui/icons-material/Update';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MapIcon from '@mui/icons-material/Map';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Custom node types
const nodeTypes = {
  actor: ActorNode,
  workItem: WorkItemNode,
};

// Edge styles for different coordination patterns
const COORDINATION_STYLES = {
  handover: { stroke: '#f59e0b', strokeWidth: 2, label: 'handover' },
  collaboration: { stroke: '#8b5cf6', strokeWidth: 3, strokeDasharray: '5,5', label: 'collaboration' },
  escalation: { stroke: '#ef4444', strokeWidth: 2, label: 'escalation' },
  synchronisation: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '2,2', label: 'sync' },
  async_update: { stroke: '#6b7280', strokeWidth: 1.5, strokeDasharray: '8,4', label: 'async' },
};

// Signal colors
const SIGNAL_COLORS = {
  waiting: '#eab308',
  rework: '#ef4444',
  overload: '#dc2626',
  conflicting_priorities: '#8b5cf6',
  decision_latency: '#f59e0b',
  quality_drift: '#6366f1',
};

const VOLATILITY_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

const AUTHORITY_COLORS = {
  low: '#ef4444',
  medium: '#f59e0b',
  high: '#10b981',
};

export default function WorkFlowCanvas({
  onSelectArtefact,
  onEditArtefact,
  onCreateArtefact,
  onAssessVolatility,
}) {
  const {
    artefacts,
    relationships,
    activeCase,
    getArtefactsByType,
    updateArtefact,
    createRelationship,
    DWD_COORDINATION_PATTERN_TYPES,
  } = useDWD();

  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionType, setConnectionType] = useState('handover');
  const [showHelp, setShowHelp] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const reactFlowInstance = useRef(null);

  // Get actors and work items
  const actors = useMemo(() => getArtefactsByType('dwd_actor'), [getArtefactsByType]);
  const workItems = useMemo(() => getArtefactsByType('dwd_work_item'), [getArtefactsByType]);
  const signals = useMemo(() => getArtefactsByType('dwd_signal'), [getArtefactsByType]);
  const patterns = useMemo(() => getArtefactsByType('dwd_coordination_pattern'), [getArtefactsByType]);

  // Build node data from artefacts
  useEffect(() => {
    const newNodes = [];
    const newEdges = [];

    // Add actor nodes
    actors.forEach((actor, index) => {
      const authorityLevel = actor.custom_fields?.authority_level || 'medium';

      // Find work items related to this actor
      const actorWorkItems = relationships
        .filter(rel =>
          (rel.from_artefact_id === actor.id || rel.to_artefact_id === actor.id) &&
          rel.relationship_type?.includes('work_item')
        )
        .map(rel => {
          const itemId = rel.from_artefact_id === actor.id ? rel.to_artefact_id : rel.from_artefact_id;
          const item = workItems.find(w => w.id === itemId);
          if (!item) return null;
          const vol = item.custom_fields?.volatility || 'medium';
          return {
            id: item.id,
            name: item.name,
            volatility: vol,
            volatilityColor: VOLATILITY_COLORS[vol],
          };
        })
        .filter(Boolean);

      // Check for authority-volatility mismatch warning
      const highVolItems = actorWorkItems.filter(w => w.volatility === 'high');
      const hasWarning = authorityLevel === 'low' && highVolItems.length > 0;

      newNodes.push({
        id: actor.id,
        type: 'actor',
        position: actor.custom_fields?.canvas_position || { x: 100 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 200 },
        data: {
          name: actor.name,
          actorType: actor.custom_fields?.actor_type || 'person',
          authorityLevel,
          constraints: actor.custom_fields?.constraints,
          workItems: actorWorkItems,
          hasWarning,
          artefact: actor,
          onClick: (data) => onSelectArtefact?.(data.artefact),
          onEdit: (data) => onEditArtefact?.(data.artefact),
        },
      });
    });

    // Add work item nodes (standalone ones not shown in actors)
    workItems.forEach((item, index) => {
      const volatility = item.custom_fields?.volatility || 'medium';
      const itemState = item.custom_fields?.item_state || 'open';

      // Find signals related to this work item
      const itemSignals = relationships
        .filter(rel =>
          (rel.from_artefact_id === item.id || rel.to_artefact_id === item.id) &&
          rel.relationship_type?.includes('signal')
        )
        .map(rel => {
          const sigId = rel.from_artefact_id === item.id ? rel.to_artefact_id : rel.from_artefact_id;
          const sig = signals.find(s => s.id === sigId);
          if (!sig) return null;
          return {
            id: sig.id,
            name: sig.name,
            type: sig.custom_fields?.signal_type,
            color: SIGNAL_COLORS[sig.custom_fields?.signal_type] || '#ef4444',
          };
        })
        .filter(Boolean);

      newNodes.push({
        id: item.id,
        type: 'workItem',
        position: item.custom_fields?.canvas_position || { x: 400 + (index % 2) * 220, y: 150 + Math.floor(index / 2) * 160 },
        data: {
          name: item.name,
          description: item.description,
          itemType: item.custom_fields?.item_type || 'other',
          volatility,
          itemState,
          reversibility: item.custom_fields?.reversibility,
          signals: itemSignals,
          artefact: item,
          onClick: (data) => onSelectArtefact?.(data.artefact),
          onEdit: (data) => onEditArtefact?.(data.artefact),
          onAssessVolatility: (data) => onAssessVolatility?.(data.artefact),
        },
      });
    });

    // Add edges from coordination patterns
    patterns.forEach(pattern => {
      const patternType = pattern.custom_fields?.pattern_type || 'handover';
      const style = COORDINATION_STYLES[patternType] || COORDINATION_STYLES.handover;

      // Find related actors/items for this pattern
      const patternRels = relationships.filter(rel =>
        rel.from_artefact_id === pattern.id || rel.to_artefact_id === pattern.id
      );

      // Get source and target from relationships
      let sourceId = null;
      let targetId = null;

      patternRels.forEach(rel => {
        const otherId = rel.from_artefact_id === pattern.id ? rel.to_artefact_id : rel.from_artefact_id;
        const isActor = actors.some(a => a.id === otherId);
        const isWorkItem = workItems.some(w => w.id === otherId);

        if (isActor || isWorkItem) {
          if (!sourceId) sourceId = otherId;
          else if (!targetId) targetId = otherId;
        }
      });

      if (sourceId && targetId) {
        // Find any signals on this coordination pattern
        const patternSignals = relationships
          .filter(rel =>
            (rel.from_artefact_id === pattern.id || rel.to_artefact_id === pattern.id) &&
            signals.some(s => s.id === rel.from_artefact_id || s.id === rel.to_artefact_id)
          )
          .map(rel => {
            const sigId = rel.from_artefact_id === pattern.id ? rel.to_artefact_id : rel.from_artefact_id;
            return signals.find(s => s.id === sigId);
          })
          .filter(Boolean);

        newEdges.push({
          id: `edge-${pattern.id}`,
          source: sourceId,
          target: targetId,
          type: 'default',
          animated: patternType === 'collaboration',
          label: patternSignals.length > 0 ? `${style.label} (${patternSignals.length} signals)` : style.label,
          labelStyle: { fontSize: 10, fill: style.stroke },
          labelBgStyle: { fill: 'rgba(255,255,255,0.9)' },
          style: {
            stroke: style.stroke,
            strokeWidth: style.strokeWidth,
            strokeDasharray: style.strokeDasharray,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: style.stroke,
          },
          data: { pattern, signals: patternSignals },
        });
      }
    });

    // Add edges from actor-to-actor relationships
    relationships
      .filter(rel => rel.relationship_type === 'actor_coordinates_with')
      .forEach(rel => {
        const coordType = rel.custom_fields?.coordination_type || 'handover';
        const style = COORDINATION_STYLES[coordType] || COORDINATION_STYLES.handover;

        newEdges.push({
          id: `rel-${rel.id}`,
          source: rel.from_artefact_id,
          target: rel.to_artefact_id,
          type: 'default',
          animated: coordType === 'collaboration',
          label: style.label,
          labelStyle: { fontSize: 10, fill: style.stroke },
          style: {
            stroke: style.stroke,
            strokeWidth: style.strokeWidth,
            strokeDasharray: style.strokeDasharray,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: style.stroke,
          },
        });
      });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [actors, workItems, signals, patterns, relationships, onSelectArtefact, onEditArtefact, onAssessVolatility]);

  // Handle node drag end - save position
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);

    // Save position on drag end
    changes.forEach(change => {
      if (change.type === 'position' && change.dragging === false && change.position) {
        const node = nodes.find(n => n.id === change.id);
        if (node?.data?.artefact) {
          updateArtefact(node.data.artefact.id, {
            custom_fields: {
              ...node.data.artefact.custom_fields,
              canvas_position: change.position,
            },
          });
        }
      }
    });
  }, [nodes, onNodesChange, updateArtefact]);

  // Handle new edge connections
  const onConnect = useCallback(async (params) => {
    const style = COORDINATION_STYLES[connectionType] || COORDINATION_STYLES.handover;

    const newEdge = {
      ...params,
      id: `edge-${params.source}-${params.target}-${Date.now()}`,
      type: 'default',
      animated: connectionType === 'collaboration',
      label: style.label,
      labelStyle: { fontSize: 10, fill: style.stroke },
      style: {
        stroke: style.stroke,
        strokeWidth: style.strokeWidth,
        strokeDasharray: style.strokeDasharray,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: style.stroke,
      },
    };

    setEdges((eds) => addEdge(newEdge, eds));

    // Determine relationship type based on source and target node types
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);

    if (!sourceNode || !targetNode) return;

    // Only create database relationship for actor-to-actor connections
    // Other connections are visual only (coordination patterns should be created explicitly)
    if (sourceNode.type === 'actor' && targetNode.type === 'actor') {
      try {
        await createRelationship(
          params.source,
          params.target,
          'actor_coordinates_with',
          null
        );
      } catch (err) {
        console.warn('Could not create relationship:', err.message);
      }
    }
    // For actor-to-workItem or workItem-to-actor connections, we just keep the visual edge
    // The proper way to link these is through a coordination pattern artefact
  }, [connectionType, setEdges, createRelationship, nodes]);

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
    if (node.data?.artefact) {
      onSelectArtefact?.(node.data.artefact);
    }
  }, [onSelectArtefact]);

  // Handle edge click
  const onEdgeClick = useCallback((event, edge) => {
    if (edge.data?.pattern) {
      onSelectArtefact?.(edge.data.pattern);
    }
  }, [onSelectArtefact]);

  // Flow instance handlers
  const onInit = useCallback((instance) => {
    reactFlowInstance.current = instance;
  }, []);

  const handleZoomIn = useCallback(() => {
    reactFlowInstance.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.current?.zoomOut();
  }, []);

  const handleFitView = useCallback(() => {
    reactFlowInstance.current?.fitView({ padding: 0.2 });
  }, []);

  const handleAutoLayout = useCallback(() => {
    // Simple auto-layout: arrange actors in a row, work items below
    const actorNodes = nodes.filter(n => n.type === 'actor');
    const workItemNodes = nodes.filter(n => n.type === 'workItem');

    const updatedNodes = nodes.map((node, index) => {
      if (node.type === 'actor') {
        const actorIndex = actorNodes.findIndex(n => n.id === node.id);
        return {
          ...node,
          position: { x: 100 + actorIndex * 280, y: 100 },
        };
      } else if (node.type === 'workItem') {
        const itemIndex = workItemNodes.findIndex(n => n.id === node.id);
        return {
          ...node,
          position: { x: 150 + itemIndex * 240, y: 380 },
        };
      }
      return node;
    });

    setNodes(updatedNodes);
    setTimeout(() => handleFitView(), 100);
  }, [nodes, setNodes, handleFitView]);

  // Calculate fit warnings
  const fitWarnings = useMemo(() => {
    const warnings = [];

    actors.forEach(actor => {
      const authority = actor.custom_fields?.authority_level || 'medium';
      const actorWorkItems = relationships
        .filter(rel =>
          (rel.from_artefact_id === actor.id || rel.to_artefact_id === actor.id)
        )
        .map(rel => {
          const itemId = rel.from_artefact_id === actor.id ? rel.to_artefact_id : rel.from_artefact_id;
          return workItems.find(w => w.id === itemId);
        })
        .filter(Boolean);

      const highVolItems = actorWorkItems.filter(w => w.custom_fields?.volatility === 'high');

      if (authority === 'low' && highVolItems.length > 0) {
        warnings.push({
          type: 'authority_mismatch',
          message: `${actor.name} has low authority but handles ${highVolItems.length} high-volatility item(s)`,
          actor,
          items: highVolItems,
        });
      }
    });

    return warnings;
  }, [actors, workItems, relationships]);

  return (
    <div className="dwd-workflow-canvas" ref={reactFlowWrapper}>
      {/* Toolbar */}
      <div className="dwd-canvas-toolbar">
        <div className="dwd-canvas-toolbar__left">
          <span className="dwd-canvas-toolbar__title">
            <MapIcon fontSize="small" />
            Work Flow Canvas
          </span>
          <span className="dwd-canvas-toolbar__stats">
            {actors.length} actors | {workItems.length} work items
          </span>
          {fitWarnings.length > 0 && (
            <span className="dwd-canvas-toolbar__warning">
              <WarningAmberIcon fontSize="small" />
              {fitWarnings.length} fit issue(s)
            </span>
          )}
        </div>
        <div className="dwd-canvas-toolbar__right">
          {/* Connection type selector */}
          <div className="dwd-canvas-toolbar__connection">
            <span>Connect as:</span>
            <select
              value={connectionType}
              onChange={(e) => setConnectionType(e.target.value)}
              className="dwd-canvas-toolbar__select"
            >
              <option value="handover">Handover</option>
              <option value="collaboration">Collaboration</option>
              <option value="escalation">Escalation</option>
              <option value="synchronisation">Sync</option>
              <option value="async_update">Async</option>
            </select>
          </div>

          <div className="dwd-canvas-toolbar__divider" />

          <button
            className="dwd-canvas-toolbar__btn"
            onClick={() => onCreateArtefact?.('dwd_actor')}
            title="Add Actor"
          >
            <PersonIcon fontSize="small" />
          </button>
          <button
            className="dwd-canvas-toolbar__btn"
            onClick={() => onCreateArtefact?.('dwd_work_item')}
            title="Add Work Item"
          >
            <AssignmentIcon fontSize="small" />
          </button>

          <div className="dwd-canvas-toolbar__divider" />

          <button className="dwd-canvas-toolbar__btn" onClick={handleAutoLayout} title="Auto Layout">
            <AutoFixHighIcon fontSize="small" />
          </button>
          <button className="dwd-canvas-toolbar__btn" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOutIcon fontSize="small" />
          </button>
          <button className="dwd-canvas-toolbar__btn" onClick={handleZoomIn} title="Zoom In">
            <ZoomInIcon fontSize="small" />
          </button>
          <button className="dwd-canvas-toolbar__btn" onClick={handleFitView} title="Fit View">
            <CenterFocusStrongIcon fontSize="small" />
          </button>
          <button
            className={`dwd-canvas-toolbar__btn ${showHelp ? 'active' : ''}`}
            onClick={() => setShowHelp(!showHelp)}
            title="Help"
          >
            <HelpOutlineIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* ReactFlow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        connectionLineStyle={{ stroke: COORDINATION_STYLES[connectionType]?.stroke || '#f59e0b' }}
        defaultEdgeOptions={{
          type: 'default',
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
      >
        <Background color="#e5e7eb" gap={20} />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'actor') {
              const auth = node.data?.authorityLevel || 'medium';
              return AUTHORITY_COLORS[auth];
            }
            if (node.type === 'workItem') {
              const vol = node.data?.volatility || 'medium';
              return VOLATILITY_COLORS[vol];
            }
            return '#6b7280';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{ background: 'var(--panel)' }}
        />

        {/* Legend Panel */}
        {showLegend && (
          <Panel position="bottom-left" className="dwd-canvas-legend">
            <div className="dwd-canvas-legend__title">
              Legend
              <button onClick={() => setShowLegend(false)}>×</button>
            </div>
            <div className="dwd-canvas-legend__section">
              <strong>Volatility</strong>
              <div className="dwd-canvas-legend__items">
                <span><span className="dwd-legend-dot" style={{ background: VOLATILITY_COLORS.low }} /> Low</span>
                <span><span className="dwd-legend-dot" style={{ background: VOLATILITY_COLORS.medium }} /> Medium</span>
                <span><span className="dwd-legend-dot" style={{ background: VOLATILITY_COLORS.high }} /> High</span>
              </div>
            </div>
            <div className="dwd-canvas-legend__section">
              <strong>Coordination</strong>
              <div className="dwd-canvas-legend__items">
                <span><span className="dwd-legend-line" style={{ background: COORDINATION_STYLES.handover.stroke }} /> Handover</span>
                <span><span className="dwd-legend-line dwd-legend-line--dashed" style={{ background: COORDINATION_STYLES.collaboration.stroke }} /> Collaboration</span>
                <span><span className="dwd-legend-line" style={{ background: COORDINATION_STYLES.escalation.stroke }} /> Escalation</span>
              </div>
            </div>
          </Panel>
        )}

        {/* Fit Warnings Panel */}
        {fitWarnings.length > 0 && (
          <Panel position="top-right" className="dwd-canvas-warnings">
            <div className="dwd-canvas-warnings__title">
              <WarningAmberIcon fontSize="small" />
              Fit Issues ({fitWarnings.length})
            </div>
            {fitWarnings.slice(0, 3).map((warning, idx) => (
              <div key={idx} className="dwd-canvas-warning">
                {warning.message}
              </div>
            ))}
          </Panel>
        )}

        {/* Help Panel */}
        {showHelp && (
          <Panel position="top-left" className="dwd-canvas-help">
            <div className="dwd-canvas-help__title">
              Quick Guide
              <button onClick={() => setShowHelp(false)}>×</button>
            </div>
            <ul>
              <li><strong>Drag nodes</strong> to reposition</li>
              <li><strong>Connect</strong> by dragging from handle to handle</li>
              <li><strong>Select connection type</strong> before connecting</li>
              <li><strong>Click</strong> nodes/edges to view details</li>
              <li><strong>Click volatility badge</strong> on work items to assess</li>
            </ul>
          </Panel>
        )}
      </ReactFlow>

      {/* Empty state */}
      {actors.length === 0 && workItems.length === 0 && (
        <div className="dwd-canvas-empty">
          <MapIcon style={{ fontSize: 48, color: '#94a3b8' }} />
          <h3>Map Your Work Flow</h3>
          <p>Add actors and work items to visualize how work moves through your system.</p>
          <div className="dwd-canvas-empty__actions">
            <button className="btn btn--primary" onClick={() => onCreateArtefact?.('dwd_actor')}>
              <PersonIcon fontSize="small" /> Add Actor
            </button>
            <button className="btn btn--secondary" onClick={() => onCreateArtefact?.('dwd_work_item')}>
              <AssignmentIcon fontSize="small" /> Add Work Item
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .dwd-workflow-canvas {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg);
        }

        .dwd-canvas-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: var(--panel);
          border-bottom: 1px solid var(--border);
          gap: 16px;
          flex-wrap: wrap;
        }

        .dwd-canvas-toolbar__left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .dwd-canvas-toolbar__title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
        }

        .dwd-canvas-toolbar__stats {
          font-size: 13px;
          color: var(--text-muted);
        }

        .dwd-canvas-toolbar__warning {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #f59e0b;
          padding: 4px 10px;
          background: rgba(245, 158, 11, 0.1);
          border-radius: 12px;
        }

        .dwd-canvas-toolbar__right {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dwd-canvas-toolbar__connection {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .dwd-canvas-toolbar__select {
          padding: 5px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
        }

        .dwd-canvas-toolbar__btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .dwd-canvas-toolbar__btn:hover,
        .dwd-canvas-toolbar__btn.active {
          background: var(--bg);
          color: var(--accent);
        }

        .dwd-canvas-toolbar__divider {
          width: 1px;
          height: 20px;
          background: var(--border);
          margin: 0 4px;
        }

        .dwd-canvas-empty {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 40px;
          z-index: 10;
        }

        .dwd-canvas-empty h3 {
          margin: 16px 0 8px;
          font-size: 18px;
          color: var(--text);
        }

        .dwd-canvas-empty p {
          margin: 0 0 20px;
          color: var(--text-muted);
          max-width: 300px;
        }

        .dwd-canvas-empty__actions {
          display: flex;
          gap: 12px;
        }
      `}</style>

      <style jsx global>{`
        .dwd-canvas-legend {
          background: var(--panel) !important;
          border: 1px solid var(--border) !important;
          border-radius: 8px !important;
          padding: 12px !important;
          font-size: 11px !important;
          min-width: 160px;
        }

        .dwd-canvas-legend__title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 600;
          margin-bottom: 10px;
          color: var(--text);
        }

        .dwd-canvas-legend__title button {
          border: none;
          background: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
        }

        .dwd-canvas-legend__section {
          margin-bottom: 10px;
        }

        .dwd-canvas-legend__section:last-child {
          margin-bottom: 0;
        }

        .dwd-canvas-legend__section strong {
          display: block;
          margin-bottom: 6px;
          color: var(--text-muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dwd-canvas-legend__items {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dwd-canvas-legend__items span {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text);
        }

        .dwd-legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dwd-legend-line {
          width: 20px;
          height: 3px;
          border-radius: 2px;
        }

        .dwd-legend-line--dashed {
          background: repeating-linear-gradient(
            90deg,
            currentColor 0px,
            currentColor 4px,
            transparent 4px,
            transparent 8px
          ) !important;
        }

        .dwd-canvas-warnings {
          background: rgba(245, 158, 11, 0.1) !important;
          border: 1px solid #f59e0b !important;
          border-radius: 8px !important;
          padding: 12px !important;
          max-width: 280px;
        }

        .dwd-canvas-warnings__title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          font-size: 12px;
          color: #f59e0b;
          margin-bottom: 8px;
        }

        .dwd-canvas-warning {
          font-size: 11px;
          color: var(--text);
          padding: 6px 8px;
          background: var(--panel);
          border-radius: 4px;
          margin-bottom: 4px;
        }

        .dwd-canvas-warning:last-child {
          margin-bottom: 0;
        }

        .dwd-canvas-help {
          background: var(--panel) !important;
          border: 1px solid var(--border) !important;
          border-radius: 8px !important;
          padding: 12px !important;
          max-width: 260px;
        }

        .dwd-canvas-help__title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 10px;
          color: var(--text);
        }

        .dwd-canvas-help__title button {
          border: none;
          background: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
        }

        .dwd-canvas-help ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .dwd-canvas-help li {
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 6px;
          padding-left: 10px;
          position: relative;
        }

        .dwd-canvas-help li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--accent);
        }

        .dwd-canvas-help li strong {
          color: var(--text);
        }

        .dwd-node-handle {
          width: 8px !important;
          height: 8px !important;
          background: var(--accent) !important;
          border: 2px solid var(--panel) !important;
        }

        .react-flow__attribution {
          display: none;
        }
      `}</style>
    </div>
  );
}
