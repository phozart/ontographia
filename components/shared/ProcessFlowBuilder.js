// components/shared/ProcessFlowBuilder.js
// Reusable Process Flow Builder with branching support
// Can be used for process comparison, change flows, diagrams, etc.

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

// MUI Icons
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import MergeIcon from '@mui/icons-material/Merge';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import ComputerIcon from '@mui/icons-material/Computer';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import GridOnIcon from '@mui/icons-material/GridOn';
import LinkIcon from '@mui/icons-material/Link';

// ============ NODE TYPES ============
export const NODE_TYPES = {
  start: {
    id: 'start',
    name: 'Start',
    icon: PlayArrowIcon,
    color: '#22c55e',
    shape: 'circle',
    ports: { out: ['bottom'] },
  },
  end: {
    id: 'end',
    name: 'End',
    icon: StopIcon,
    color: '#ef4444',
    shape: 'circle',
    ports: { in: ['top'] },
  },
  task: {
    id: 'task',
    name: 'Task',
    icon: null,
    color: '#3b82f6',
    shape: 'rectangle',
    ports: { in: ['top'], out: ['bottom'] },
  },
  decision: {
    id: 'decision',
    name: 'Decision',
    icon: CallSplitIcon,
    color: '#f59e0b',
    shape: 'diamond',
    ports: { in: ['top'], out: ['bottom', 'left', 'right'] },
  },
  gateway: {
    id: 'gateway',
    name: 'Gateway',
    icon: MergeIcon,
    color: '#f59e0b',
    shape: 'diamond',
    ports: { in: ['top', 'left', 'right'], out: ['bottom'] },
  },
  subprocess: {
    id: 'subprocess',
    name: 'Sub-Process',
    icon: AccountTreeIcon,
    color: '#8b5cf6',
    shape: 'rectangle-double',
    ports: { in: ['top'], out: ['bottom'] },
  },
  manual: {
    id: 'manual',
    name: 'Manual Task',
    icon: PersonIcon,
    color: '#6b7280',
    shape: 'rectangle',
    ports: { in: ['top'], out: ['bottom'] },
  },
  automated: {
    id: 'automated',
    name: 'Automated',
    icon: ComputerIcon,
    color: '#06b6d4',
    shape: 'rectangle',
    ports: { in: ['top'], out: ['bottom'] },
  },
  system: {
    id: 'system',
    name: 'System',
    icon: SettingsIcon,
    color: '#0ea5e9',
    shape: 'rectangle',
    ports: { in: ['top'], out: ['bottom'] },
  },
};

// ============ NODE DIMENSIONS ============
const NODE_SIZES = {
  circle: { width: 60, height: 60 },
  diamond: { width: 80, height: 80 },
  rectangle: { width: 160, height: 60 },
  'rectangle-double': { width: 160, height: 60 },
};

// ============ PORT POSITIONS ============
const getPortPosition = (node, port, nodeType) => {
  const size = NODE_SIZES[nodeType.shape] || NODE_SIZES.rectangle;
  const cx = node.x + size.width / 2;
  const cy = node.y + size.height / 2;

  switch (port) {
    case 'top':
      return { x: cx, y: node.y };
    case 'bottom':
      return { x: cx, y: node.y + size.height };
    case 'left':
      return { x: node.x, y: cy };
    case 'right':
      return { x: node.x + size.width, y: cy };
    default:
      return { x: cx, y: cy };
  }
};

// ============ CONNECTION PATH ============
const getConnectionPath = (from, to, fromPort, toPort) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Simple curved path
  if (fromPort === 'bottom' && toPort === 'top') {
    // Vertical connection
    const midY = from.y + dy / 2;
    return `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
  } else if (fromPort === 'right' && toPort === 'top') {
    // Right to top (decision branch right)
    return `M ${from.x} ${from.y} C ${from.x + 40} ${from.y}, ${to.x} ${to.y - 40}, ${to.x} ${to.y}`;
  } else if (fromPort === 'left' && toPort === 'top') {
    // Left to top (decision branch left)
    return `M ${from.x} ${from.y} C ${from.x - 40} ${from.y}, ${to.x} ${to.y - 40}, ${to.x} ${to.y}`;
  } else if (fromPort === 'bottom' && toPort === 'left') {
    // Bottom to left (merge from right)
    return `M ${from.x} ${from.y} C ${from.x} ${from.y + 40}, ${to.x - 40} ${to.y}, ${to.x} ${to.y}`;
  } else if (fromPort === 'bottom' && toPort === 'right') {
    // Bottom to right (merge from left)
    return `M ${from.x} ${from.y} C ${from.x} ${from.y + 40}, ${to.x + 40} ${to.y}, ${to.x} ${to.y}`;
  } else {
    // Default curved path
    const midX = from.x + dx / 2;
    const midY = from.y + dy / 2;
    return `M ${from.x} ${from.y} Q ${midX} ${from.y}, ${midX} ${midY} Q ${midX} ${to.y}, ${to.x} ${to.y}`;
  }
};

// ============ ARROW MARKER ============
const ArrowMarker = ({ id = 'arrowhead', color = 'var(--text-muted)' }) => (
  <marker
    id={id}
    markerWidth="10"
    markerHeight="7"
    refX="9"
    refY="3.5"
    orient="auto"
  >
    <polygon points="0 0, 10 3.5, 0 7" fill={color} />
  </marker>
);

// ============ CONNECTION COMPONENT ============
function Connection({
  connection,
  nodes,
  isSelected,
  onSelect,
  onDelete,
  readOnly,
}) {
  const fromNode = nodes.find(n => n.id === connection.from);
  const toNode = nodes.find(n => n.id === connection.to);

  if (!fromNode || !toNode) return null;

  const fromType = NODE_TYPES[fromNode.type] || NODE_TYPES.task;
  const toType = NODE_TYPES[toNode.type] || NODE_TYPES.task;

  const fromPort = connection.fromPort || 'bottom';
  const toPort = connection.toPort || 'top';

  const from = getPortPosition(fromNode, fromPort, fromType);
  const to = getPortPosition(toNode, toPort, toType);

  const path = getConnectionPath(from, to, fromPort, toPort);

  // Label position (midpoint)
  const labelX = (from.x + to.x) / 2;
  const labelY = (from.y + to.y) / 2 - 8;

  return (
    <g className={`pfb-connection ${isSelected ? 'selected' : ''}`}>
      {/* Invisible wider path for easier clicking */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        style={{ cursor: 'pointer' }}
        onClick={() => onSelect?.(connection)}
      />
      {/* Visible path */}
      <path
        d={path}
        fill="none"
        stroke={isSelected ? 'var(--accent)' : 'var(--text-muted)'}
        strokeWidth={isSelected ? 2.5 : 2}
        markerEnd={`url(#arrowhead-${isSelected ? 'selected' : 'default'})`}
      />
      {/* Label */}
      {connection.label && (
        <g>
          <rect
            x={labelX - 20}
            y={labelY - 10}
            width="40"
            height="20"
            rx="4"
            fill="var(--bg)"
            stroke="var(--border)"
          />
          <text
            x={labelX}
            y={labelY + 4}
            textAnchor="middle"
            fill="var(--text)"
            fontSize="11"
            fontWeight="500"
          >
            {connection.label}
          </text>
        </g>
      )}
      {/* Delete button when selected */}
      {isSelected && !readOnly && (
        <g
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(connection.id);
          }}
        >
          <circle cx={labelX + 25} cy={labelY} r="10" fill="#ef4444" />
          <text
            x={labelX + 25}
            y={labelY + 4}
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
}

// ============ NODE COMPONENT ============
function FlowNode({
  node,
  isSelected,
  isDragging,
  onSelect,
  onDragStart,
  onDelete,
  readOnly,
  changeType,
}) {
  const nodeType = NODE_TYPES[node.type] || NODE_TYPES.task;
  const size = NODE_SIZES[nodeType.shape] || NODE_SIZES.rectangle;
  const Icon = nodeType.icon;

  // Change type styling
  const changeStyles = {
    added: { borderColor: '#22c55e', background: 'rgba(34, 197, 94, 0.1)' },
    removed: { borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', opacity: 0.7 },
    modified: { borderColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' },
    unchanged: { borderColor: 'var(--border)', background: 'var(--bg)' },
  };
  const changeStyle = changeStyles[changeType] || changeStyles.unchanged;

  const handleMouseDown = (e) => {
    if (readOnly) return;
    e.stopPropagation();
    onSelect?.(node);
    onDragStart?.(e, node);
  };

  const renderShape = () => {
    const baseStyle = {
      position: 'absolute',
      left: node.x,
      top: node.y,
      width: size.width,
      height: size.height,
      cursor: readOnly ? 'pointer' : 'move',
      transition: isDragging ? 'none' : 'box-shadow 0.15s ease',
      ...changeStyle,
    };

    if (nodeType.shape === 'circle') {
      return (
        <div
          className={`pfb-node pfb-node-circle ${isSelected ? 'selected' : ''}`}
          style={{
            ...baseStyle,
            borderRadius: '50%',
            border: `2px solid ${changeStyle.borderColor}`,
            backgroundColor: changeStyle.background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseDown={handleMouseDown}
          onClick={() => onSelect?.(node)}
        >
          {Icon && <Icon style={{ color: nodeType.color, fontSize: 24 }} />}
        </div>
      );
    }

    if (nodeType.shape === 'diamond') {
      return (
        <div
          className={`pfb-node pfb-node-diamond ${isSelected ? 'selected' : ''}`}
          style={{
            ...baseStyle,
            transform: 'rotate(45deg)',
            border: `2px solid ${changeStyle.borderColor}`,
            backgroundColor: changeStyle.background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseDown={handleMouseDown}
          onClick={() => onSelect?.(node)}
        >
          <div style={{ transform: 'rotate(-45deg)', textAlign: 'center' }}>
            {Icon && <Icon style={{ color: nodeType.color, fontSize: 20 }} />}
            <div className="pfb-node-name" style={{ fontSize: 10, maxWidth: 50 }}>
              {node.name}
            </div>
          </div>
        </div>
      );
    }

    // Rectangle (default)
    return (
      <div
        className={`pfb-node pfb-node-rect ${isSelected ? 'selected' : ''} ${nodeType.shape === 'rectangle-double' ? 'double-border' : ''}`}
        style={{
          ...baseStyle,
          borderRadius: 8,
          border: `2px solid ${changeStyle.borderColor}`,
          backgroundColor: changeStyle.background,
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
        onMouseDown={handleMouseDown}
        onClick={() => onSelect?.(node)}
      >
        <div className="pfb-node-header">
          {Icon && <Icon style={{ color: nodeType.color, fontSize: 16, marginRight: 6 }} />}
          <span className="pfb-node-name">{node.name}</span>
        </div>
        {node.actor && <span className="pfb-node-actor">{node.actor}</span>}
        {node.duration && <span className="pfb-node-duration">{node.duration}</span>}
      </div>
    );
  };

  return (
    <>
      {renderShape()}
      {/* Ports visualization when selected */}
      {isSelected && !readOnly && (
        <>
          {nodeType.ports?.out?.map(port => {
            const pos = getPortPosition(node, port, nodeType);
            return (
              <div
                key={`out-${port}`}
                className="pfb-port pfb-port-out"
                style={{ left: pos.x - 6, top: pos.y - 6 }}
                title={`Output: ${port}`}
              />
            );
          })}
          {nodeType.ports?.in?.map(port => {
            const pos = getPortPosition(node, port, nodeType);
            return (
              <div
                key={`in-${port}`}
                className="pfb-port pfb-port-in"
                style={{ left: pos.x - 6, top: pos.y - 6 }}
                title={`Input: ${port}`}
              />
            );
          })}
        </>
      )}
      {/* Change badge */}
      {changeType && changeType !== 'unchanged' && (
        <div
          className="pfb-change-badge"
          style={{
            position: 'absolute',
            left: node.x + size.width - 10,
            top: node.y - 8,
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: changeStyle.borderColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
          }}
        >
          {changeType === 'added' ? '+' : changeType === 'removed' ? '−' : '~'}
        </div>
      )}
    </>
  );
}

// ============ TOOLBAR ============
function Toolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onFitView,
  showGrid,
  onToggleGrid,
  onAddNode,
  onDeleteSelected,
  hasSelection,
  readOnly,
  selectedNode,
  onStartConnect,
  isConnecting,
}) {
  const [showNodeMenu, setShowNodeMenu] = useState(false);

  return (
    <div className="pfb-toolbar">
      <div className="pfb-toolbar-left">
        {!readOnly && (
          <>
            <div className="pfb-toolbar-group">
              <button
                className={`pfb-toolbar-btn ${showNodeMenu ? 'active' : ''}`}
                onClick={() => setShowNodeMenu(!showNodeMenu)}
                title="Add Node"
              >
                <AddIcon fontSize="small" />
                <span>Add Node</span>
              </button>
              {showNodeMenu && (
                <div className="pfb-node-menu">
                  {Object.entries(NODE_TYPES).map(([key, type]) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          onAddNode?.(key);
                          setShowNodeMenu(false);
                        }}
                      >
                        {Icon && <Icon style={{ color: type.color, fontSize: 18 }} />}
                        <span>{type.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedNode && (
              <div className="pfb-toolbar-group">
                <button
                  className={`pfb-toolbar-btn ${isConnecting ? 'active' : ''}`}
                  onClick={onStartConnect}
                  title="Connect to another node"
                >
                  <LinkIcon fontSize="small" />
                  <span>{isConnecting ? 'Click target...' : 'Connect'}</span>
                </button>
              </div>
            )}

            {hasSelection && (
              <button
                className="pfb-toolbar-btn danger"
                onClick={onDeleteSelected}
                title="Delete Selected"
              >
                <DeleteIcon fontSize="small" />
              </button>
            )}
          </>
        )}
      </div>

      <div className="pfb-toolbar-right">
        <button
          className={`pfb-toolbar-btn ${showGrid ? 'active' : ''}`}
          onClick={onToggleGrid}
          title="Toggle Grid"
        >
          <GridOnIcon fontSize="small" />
        </button>
        <div className="pfb-zoom-controls">
          <button onClick={onZoomOut} title="Zoom Out">
            <ZoomOutIcon fontSize="small" />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={onZoomIn} title="Zoom In">
            <ZoomInIcon fontSize="small" />
          </button>
          <button onClick={onFitView} title="Fit to View">
            <FitScreenIcon fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function ProcessFlowBuilder({
  nodes = [],
  connections = [],
  onNodesChange,
  onConnectionsChange,
  onNodeSelect,
  onConnectionSelect,
  selectedNodeId,
  selectedConnectionId,
  readOnly = false,
  showGrid: initialShowGrid = true,
  changeMap = {},
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(initialShowGrid);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectFromNode, setConnectFromNode] = useState(null);

  // Canvas dimensions
  const [canvasSize, setCanvasSize] = useState({ width: 2000, height: 1500 });

  // Calculate canvas bounds based on nodes
  useEffect(() => {
    if (nodes.length === 0) return;

    let maxX = 0;
    let maxY = 0;

    nodes.forEach(node => {
      const nodeType = NODE_TYPES[node.type] || NODE_TYPES.task;
      const size = NODE_SIZES[nodeType.shape] || NODE_SIZES.rectangle;
      maxX = Math.max(maxX, node.x + size.width + 200);
      maxY = Math.max(maxY, node.y + size.height + 200);
    });

    setCanvasSize({
      width: Math.max(2000, maxX),
      height: Math.max(1500, maxY),
    });
  }, [nodes]);

  // Handle node drag
  const handleDragStart = useCallback((e, node) => {
    if (readOnly) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    setDraggingNode(node.id);
    setDragOffset({
      x: x - node.x,
      y: y - node.y,
    });
  }, [zoom, pan, readOnly]);

  const handleMouseMove = useCallback((e) => {
    if (draggingNode && !readOnly) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom - pan.x;
      const y = (e.clientY - rect.top) / zoom - pan.y;

      // Snap to grid
      const snapSize = 10;
      const newX = Math.round((x - dragOffset.x) / snapSize) * snapSize;
      const newY = Math.round((y - dragOffset.y) / snapSize) * snapSize;

      const updatedNodes = nodes.map(n =>
        n.id === draggingNode ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) } : n
      );
      onNodesChange?.(updatedNodes);
    } else if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPan(prev => ({ x: prev.x + dx / zoom, y: prev.y + dy / zoom }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [draggingNode, dragOffset, nodes, onNodesChange, zoom, pan, isPanning, panStart, readOnly]);

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
    setIsPanning(false);
  }, []);

  // Pan handling
  const handleCanvasMouseDown = useCallback((e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('pfb-grid')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      onNodeSelect?.(null);
      onConnectionSelect?.(null);
    }
  }, [onNodeSelect, onConnectionSelect]);

  // Zoom handling
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(z => Math.min(2, Math.max(0.25, z * delta)));
    }
  }, []);

  // Add/delete node
  const handleAddNode = useCallback((type) => {
    const nodeType = NODE_TYPES[type];
    const size = NODE_SIZES[nodeType.shape] || NODE_SIZES.rectangle;

    // Find a good position (center of visible area)
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      name: nodeType.name,
      x: Math.round((canvasSize.width / 2 - pan.x) / 10) * 10,
      y: Math.round((canvasSize.height / 2 - pan.y) / 10) * 10,
    };

    onNodesChange?.([...nodes, newNode]);
    onNodeSelect?.(newNode);
  }, [nodes, onNodesChange, onNodeSelect, pan, canvasSize]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNodeId) {
      // Remove node and its connections
      onNodesChange?.(nodes.filter(n => n.id !== selectedNodeId));
      onConnectionsChange?.(connections.filter(c => c.from !== selectedNodeId && c.to !== selectedNodeId));
      onNodeSelect?.(null);
    } else if (selectedConnectionId) {
      onConnectionsChange?.(connections.filter(c => c.id !== selectedConnectionId));
      onConnectionSelect?.(null);
    }
  }, [selectedNodeId, selectedConnectionId, nodes, connections, onNodesChange, onConnectionsChange, onNodeSelect, onConnectionSelect]);

  // Connection handling
  const handleStartConnect = useCallback(() => {
    if (selectedNodeId) {
      setIsConnecting(true);
      setConnectFromNode(selectedNodeId);
    }
  }, [selectedNodeId]);

  const handleNodeClick = useCallback((node) => {
    if (isConnecting && connectFromNode && node.id !== connectFromNode) {
      // Create connection
      const fromNode = nodes.find(n => n.id === connectFromNode);
      const fromType = NODE_TYPES[fromNode?.type] || NODE_TYPES.task;

      // Determine ports based on node types
      let fromPort = 'bottom';
      let toPort = 'top';

      // For decisions, prompt for label
      let label = '';
      if (fromType.shape === 'diamond') {
        // Check existing connections from this decision
        const existingFromDecision = connections.filter(c => c.from === connectFromNode);
        if (existingFromDecision.length === 0) {
          fromPort = 'bottom';
          label = 'Yes';
        } else if (existingFromDecision.length === 1) {
          // Use a different port
          const usedPort = existingFromDecision[0].fromPort || 'bottom';
          fromPort = usedPort === 'bottom' ? 'right' : usedPort === 'right' ? 'left' : 'bottom';
          label = 'No';
        } else {
          fromPort = 'left';
        }
      }

      const newConnection = {
        id: `conn-${Date.now()}`,
        from: connectFromNode,
        to: node.id,
        fromPort,
        toPort,
        label: label || undefined,
      };

      onConnectionsChange?.([...connections, newConnection]);
      setIsConnecting(false);
      setConnectFromNode(null);
    } else {
      onNodeSelect?.(node);
    }
  }, [isConnecting, connectFromNode, nodes, connections, onConnectionsChange, onNodeSelect]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (readOnly) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          handleDeleteSelected();
        }
      }
      if (e.key === 'Escape') {
        setIsConnecting(false);
        setConnectFromNode(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteSelected, readOnly]);

  // Selected node object
  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  return (
    <div
      ref={containerRef}
      className={`pfb-container ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Toolbar
        zoom={zoom}
        onZoomIn={() => setZoom(z => Math.min(2, z + 0.1))}
        onZoomOut={() => setZoom(z => Math.max(0.25, z - 0.1))}
        onFitView={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onAddNode={handleAddNode}
        onDeleteSelected={handleDeleteSelected}
        hasSelection={!!selectedNodeId || !!selectedConnectionId}
        readOnly={readOnly}
        selectedNode={selectedNode}
        onStartConnect={handleStartConnect}
        isConnecting={isConnecting}
      />

      <div
        ref={canvasRef}
        className="pfb-canvas"
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
        style={{
          cursor: isPanning ? 'grabbing' : isConnecting ? 'crosshair' : 'grab',
        }}
      >
        <div
          className="pfb-canvas-inner"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: '0 0',
            width: canvasSize.width,
            height: canvasSize.height,
          }}
        >
          {/* Grid */}
          {showGrid && (
            <svg className="pfb-grid" width="100%" height="100%">
              <defs>
                <pattern id="grid-small" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
                </pattern>
                <pattern id="grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
                  <rect width="100" height="100" fill="url(#grid-small)" />
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-large)" />
            </svg>
          )}

          {/* Connections SVG Layer */}
          <svg className="pfb-connections" width="100%" height="100%">
            <defs>
              <ArrowMarker id="arrowhead-default" color="var(--text-muted)" />
              <ArrowMarker id="arrowhead-selected" color="var(--accent)" />
            </defs>
            {connections.map(conn => (
              <Connection
                key={conn.id}
                connection={conn}
                nodes={nodes}
                isSelected={selectedConnectionId === conn.id}
                onSelect={(c) => {
                  onConnectionSelect?.(c);
                  onNodeSelect?.(null);
                }}
                onDelete={(id) => onConnectionsChange?.(connections.filter(c => c.id !== id))}
                readOnly={readOnly}
              />
            ))}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <FlowNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              isDragging={draggingNode === node.id}
              onSelect={handleNodeClick}
              onDragStart={handleDragStart}
              onDelete={() => {
                onNodesChange?.(nodes.filter(n => n.id !== node.id));
                onConnectionsChange?.(connections.filter(c => c.from !== node.id && c.to !== node.id));
              }}
              readOnly={readOnly}
              changeType={changeMap[node.id]}
            />
          ))}
        </div>
      </div>

      {/* Connection mode indicator */}
      {isConnecting && (
        <div className="pfb-connect-hint">
          Click on a target node to create connection, or press Escape to cancel
        </div>
      )}
    </div>
  );
}

// ============ HELPER: Auto-layout ============
export function autoLayoutNodes(nodes, connections) {
  // Simple vertical layout algorithm
  // Find start nodes (no incoming connections)
  const incomingMap = new Map();
  connections.forEach(c => {
    incomingMap.set(c.to, (incomingMap.get(c.to) || 0) + 1);
  });

  const startNodes = nodes.filter(n => !incomingMap.has(n.id) || n.type === 'start');
  const visited = new Set();
  const positioned = [];

  const positionNode = (node, x, y, depth = 0) => {
    if (visited.has(node.id)) return;
    visited.add(node.id);

    const nodeType = NODE_TYPES[node.type] || NODE_TYPES.task;
    const size = NODE_SIZES[nodeType.shape] || NODE_SIZES.rectangle;

    positioned.push({ ...node, x, y });

    // Find outgoing connections
    const outgoing = connections.filter(c => c.from === node.id);
    const spacing = 200;
    const horizontalSpacing = 180;

    outgoing.forEach((conn, idx) => {
      const targetNode = nodes.find(n => n.id === conn.to);
      if (targetNode) {
        let newX = x;
        let newY = y + spacing;

        // Handle branching
        if (outgoing.length > 1) {
          const offset = (idx - (outgoing.length - 1) / 2) * horizontalSpacing;
          newX = x + offset;
        }

        positionNode(targetNode, newX, newY, depth + 1);
      }
    });
  };

  // Position from start nodes
  let startX = 400;
  startNodes.forEach((node, idx) => {
    positionNode(node, startX + idx * 300, 50);
  });

  // Position any remaining unvisited nodes
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      positionNode(node, startX + positioned.length * 200, 50);
    }
  });

  return positioned;
}
