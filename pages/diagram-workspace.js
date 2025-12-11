// pages/diagram-workspace.js
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';

// Available colors for nodes
const COLORS = [
  { id: 'teal', value: '#008a7a', name: 'Teal' },
  { id: 'blue', value: '#3b82f6', name: 'Blue' },
  { id: 'purple', value: '#8b5cf6', name: 'Purple' },
  { id: 'pink', value: '#ec4899', name: 'Pink' },
  { id: 'red', value: '#ef4444', name: 'Red' },
  { id: 'orange', value: '#f97316', name: 'Orange' },
  { id: 'yellow', value: '#eab308', name: 'Yellow' },
  { id: 'green', value: '#22c55e', name: 'Green' },
  { id: 'gray', value: '#6b7280', name: 'Gray' },
];

// Shape types
const SHAPES = [
  { id: 'rectangle', name: 'Rectangle', icon: '▭' },
  { id: 'circle', name: 'Circle', icon: '○' },
  { id: 'diamond', name: 'Diamond', icon: '◇' },
];

// Generate unique ID
const generateId = () => `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateConnectionId = () => `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const STORAGE_KEY = 'ontographia-diagrams-v2';

export default function DiagramWorkspacePage() {
  const { role } = useAuth();
  const { activeDomain } = useDomains();
  const canvasRef = useRef(null);

  // Diagram list state
  const [diagrams, setDiagrams] = useState([]);
  const [activeDiagramId, setActiveDiagramId] = useState(null);

  // Current diagram state
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [diagramName, setDiagramName] = useState('Untitled Diagram');

  // Editor state
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [activeTool, setActiveTool] = useState('select');
  const [activeColor, setActiveColor] = useState(COLORS[0].value);
  const [lineType, setLineType] = useState('curved');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [connectingDirection, setConnectingDirection] = useState(null);

  // UI state
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newDiagramName, setNewDiagramName] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [nodeTypesForImport, setNodeTypesForImport] = useState([]);
  const [typeMapping, setTypeMapping] = useState({});

  // Pan and zoom state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState(null); // { x, y, type, nodeId?, connectionId? }

  // Load diagrams from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDiagrams(parsed);
        if (parsed.length > 0) {
          loadDiagram(parsed[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load diagrams', e);
    }
  }, []);

  // Save current diagram
  const saveDiagram = useCallback(() => {
    if (!activeDiagramId) return;

    const updatedDiagram = {
      id: activeDiagramId,
      name: diagramName,
      nodes,
      connections,
      updatedAt: Date.now(),
    };

    setDiagrams(prev => {
      const updated = prev.map(d => d.id === activeDiagramId ? updatedDiagram : d);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [activeDiagramId, diagramName, nodes, connections]);

  // Auto-save on changes
  useEffect(() => {
    if (activeDiagramId) {
      const timeout = setTimeout(saveDiagram, 500);
      return () => clearTimeout(timeout);
    }
  }, [nodes, connections, diagramName, saveDiagram]);

  // Load a diagram
  const loadDiagram = (diagram) => {
    setActiveDiagramId(diagram.id);
    setDiagramName(diagram.name);
    setNodes(diagram.nodes || []);
    setConnections(diagram.connections || []);
    setSelectedNode(null);
    setSelectedConnection(null);
  };

  // Create new diagram
  const createNewDiagram = () => {
    const newDiagram = {
      id: generateId(),
      name: newDiagramName || 'Untitled Diagram',
      nodes: [],
      connections: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setDiagrams(prev => {
      const updated = [...prev, newDiagram];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    loadDiagram(newDiagram);
    setShowNewDialog(false);
    setNewDiagramName('');
  };

  // Delete diagram
  const deleteDiagram = (id) => {
    if (!confirm('Are you sure you want to delete this diagram?')) return;

    setDiagrams(prev => {
      const updated = prev.filter(d => d.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      if (activeDiagramId === id) {
        if (updated.length > 0) {
          loadDiagram(updated[0]);
        } else {
          setActiveDiagramId(null);
          setNodes([]);
          setConnections([]);
          setDiagramName('');
        }
      }

      return updated;
    });
  };

  // Handle canvas click to add new node
  const handleCanvasClick = useCallback((e) => {
    if (activeTool === 'select' || isDragging) return;
    if (connectingFrom) {
      setConnectingFrom(null);
      setConnectingDirection(null);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (['rectangle', 'circle', 'diamond'].includes(activeTool)) {
      const newNode = {
        id: generateId(),
        type: activeTool,
        x: x - (activeTool === 'rectangle' ? 60 : 40),
        y: y - (activeTool === 'rectangle' ? 30 : 40),
        width: activeTool === 'rectangle' ? 120 : 80,
        height: activeTool === 'rectangle' ? 60 : 80,
        text: 'New Node',
        color: activeColor,
      };
      setNodes(prev => [...prev, newNode]);
      setSelectedNode(newNode.id);
      setActiveTool('select');
    }
  }, [activeTool, activeColor, isDragging, connectingFrom]);

  // Handle node click
  const handleNodeClick = useCallback((e, nodeId) => {
    e.stopPropagation();

    if (connectingFrom && connectingFrom !== nodeId) {
      const newConnection = {
        id: generateConnectionId(),
        from: connectingFrom,
        to: nodeId,
        fromDirection: connectingDirection,
        toDirection: 'left',
        color: activeColor,
        type: lineType,
      };
      setConnections(prev => [...prev, newConnection]);
      setConnectingFrom(null);
      setConnectingDirection(null);
    } else {
      setSelectedNode(nodeId);
      setSelectedConnection(null);
    }
  }, [connectingFrom, connectingDirection, activeColor, lineType]);

  // Handle node drag start
  const handleNodeDragStart = useCallback((e, nodeId) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y,
    });
    setIsDragging(true);
    setSelectedNode(nodeId);
  }, [nodes]);

  // Handle node drag
  const handleNodeDrag = useCallback((e) => {
    if (!isDragging || !selectedNode) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setNodes(prev => prev.map(node =>
      node.id === selectedNode
        ? { ...node, x: Math.max(0, x), y: Math.max(0, y) }
        : node
    ));
  }, [isDragging, selectedNode, dragOffset]);

  // Handle node drag end
  const handleNodeDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add connected node via + button
  const handleAddConnectedNode = useCallback((e, fromNodeId, direction) => {
    e.stopPropagation();

    const fromNode = nodes.find(n => n.id === fromNodeId);
    if (!fromNode) return;

    let x, y;
    const offset = 150;

    switch (direction) {
      case 'top':
        x = fromNode.x;
        y = fromNode.y - offset;
        break;
      case 'right':
        x = fromNode.x + fromNode.width + offset - 60;
        y = fromNode.y;
        break;
      case 'bottom':
        x = fromNode.x;
        y = fromNode.y + fromNode.height + offset - 30;
        break;
      case 'left':
        x = fromNode.x - offset - 60;
        y = fromNode.y;
        break;
      default:
        x = fromNode.x + offset;
        y = fromNode.y;
    }

    const newNode = {
      id: generateId(),
      type: fromNode.type,
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: fromNode.width,
      height: fromNode.height,
      text: 'New Node',
      color: fromNode.color,
    };

    const newConnection = {
      id: generateConnectionId(),
      from: fromNodeId,
      to: newNode.id,
      fromDirection: direction,
      toDirection: direction === 'right' ? 'left' : direction === 'left' ? 'right' : direction === 'top' ? 'bottom' : 'top',
      color: fromNode.color,
      type: lineType,
    };

    setNodes(prev => [...prev, newNode]);
    setConnections(prev => [...prev, newConnection]);
    setSelectedNode(newNode.id);
  }, [nodes, lineType]);

  // Update selected node
  const updateSelectedNode = useCallback((updates) => {
    if (!selectedNode) return;
    setNodes(prev => prev.map(node =>
      node.id === selectedNode ? { ...node, ...updates } : node
    ));
  }, [selectedNode]);

  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    setNodes(prev => prev.filter(n => n.id !== selectedNode));
    setConnections(prev => prev.filter(c => c.from !== selectedNode && c.to !== selectedNode));
    setSelectedNode(null);
  }, [selectedNode]);

  // Delete selected connection
  const deleteSelectedConnection = useCallback(() => {
    if (!selectedConnection) return;
    setConnections(prev => prev.filter(c => c.id !== selectedConnection));
    setSelectedConnection(null);
  }, [selectedConnection]);

  // Handle connection click
  const handleConnectionClick = useCallback((e, connectionId) => {
    e.stopPropagation();
    setSelectedConnection(connectionId);
    setSelectedNode(null);
  }, []);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      setNodes([]);
      setConnections([]);
      setSelectedNode(null);
      setSelectedConnection(null);
    }
  }, []);

  // Load template
  const loadTemplate = useCallback((template) => {
    let newNodes = [];
    let newConnections = [];
    const baseX = 200;
    const baseY = 150;

    if (template === 'flowchart') {
      newNodes = [
        { id: 'fc-1', type: 'rectangle', x: baseX, y: baseY, width: 120, height: 60, text: 'Start', color: '#22c55e' },
        { id: 'fc-2', type: 'rectangle', x: baseX, y: baseY + 120, width: 120, height: 60, text: 'Process', color: '#3b82f6' },
        { id: 'fc-3', type: 'diamond', x: baseX + 20, y: baseY + 240, width: 80, height: 80, text: 'Decision', color: '#f97316' },
        { id: 'fc-4', type: 'rectangle', x: baseX - 150, y: baseY + 380, width: 120, height: 60, text: 'Option A', color: '#8b5cf6' },
        { id: 'fc-5', type: 'rectangle', x: baseX + 150, y: baseY + 380, width: 120, height: 60, text: 'Option B', color: '#ec4899' },
        { id: 'fc-6', type: 'rectangle', x: baseX, y: baseY + 500, width: 120, height: 60, text: 'End', color: '#ef4444' },
      ];
      newConnections = [
        { id: 'fcc-1', from: 'fc-1', to: 'fc-2', fromDirection: 'bottom', toDirection: 'top', color: '#6b7280', type: 'straight' },
        { id: 'fcc-2', from: 'fc-2', to: 'fc-3', fromDirection: 'bottom', toDirection: 'top', color: '#6b7280', type: 'straight' },
        { id: 'fcc-3', from: 'fc-3', to: 'fc-4', fromDirection: 'left', toDirection: 'top', color: '#6b7280', type: 'curved' },
        { id: 'fcc-4', from: 'fc-3', to: 'fc-5', fromDirection: 'right', toDirection: 'top', color: '#6b7280', type: 'curved' },
        { id: 'fcc-5', from: 'fc-4', to: 'fc-6', fromDirection: 'bottom', toDirection: 'left', color: '#6b7280', type: 'curved' },
        { id: 'fcc-6', from: 'fc-5', to: 'fc-6', fromDirection: 'bottom', toDirection: 'right', color: '#6b7280', type: 'curved' },
      ];
    } else if (template === 'mindmap') {
      newNodes = [
        { id: 'mm-1', type: 'circle', x: baseX + 100, y: baseY + 100, width: 100, height: 100, text: 'Main Idea', color: '#008a7a' },
        { id: 'mm-2', type: 'rectangle', x: baseX - 80, y: baseY - 30, width: 100, height: 50, text: 'Topic 1', color: '#3b82f6' },
        { id: 'mm-3', type: 'rectangle', x: baseX + 280, y: baseY - 30, width: 100, height: 50, text: 'Topic 2', color: '#8b5cf6' },
        { id: 'mm-4', type: 'rectangle', x: baseX - 80, y: baseY + 230, width: 100, height: 50, text: 'Topic 3', color: '#22c55e' },
        { id: 'mm-5', type: 'rectangle', x: baseX + 280, y: baseY + 230, width: 100, height: 50, text: 'Topic 4', color: '#f97316' },
      ];
      newConnections = [
        { id: 'mmc-1', from: 'mm-1', to: 'mm-2', fromDirection: 'left', toDirection: 'right', color: '#3b82f6', type: 'curved' },
        { id: 'mmc-2', from: 'mm-1', to: 'mm-3', fromDirection: 'right', toDirection: 'left', color: '#8b5cf6', type: 'curved' },
        { id: 'mmc-3', from: 'mm-1', to: 'mm-4', fromDirection: 'left', toDirection: 'right', color: '#22c55e', type: 'curved' },
        { id: 'mmc-4', from: 'mm-1', to: 'mm-5', fromDirection: 'right', toDirection: 'left', color: '#f97316', type: 'curved' },
      ];
    } else if (template === 'causal') {
      newNodes = [
        { id: 'cl-1', type: 'circle', x: baseX, y: baseY + 100, width: 90, height: 90, text: 'Variable A', color: '#3b82f6' },
        { id: 'cl-2', type: 'circle', x: baseX + 200, y: baseY, width: 90, height: 90, text: 'Variable B', color: '#22c55e' },
        { id: 'cl-3', type: 'circle', x: baseX + 400, y: baseY + 100, width: 90, height: 90, text: 'Variable C', color: '#f97316' },
        { id: 'cl-4', type: 'circle', x: baseX + 200, y: baseY + 200, width: 90, height: 90, text: 'Variable D', color: '#8b5cf6' },
      ];
      newConnections = [
        { id: 'clc-1', from: 'cl-1', to: 'cl-2', fromDirection: 'right', toDirection: 'left', color: '#22c55e', type: 'curved' },
        { id: 'clc-2', from: 'cl-2', to: 'cl-3', fromDirection: 'right', toDirection: 'left', color: '#22c55e', type: 'curved' },
        { id: 'clc-3', from: 'cl-3', to: 'cl-4', fromDirection: 'bottom', toDirection: 'right', color: '#ef4444', type: 'curved' },
        { id: 'clc-4', from: 'cl-4', to: 'cl-1', fromDirection: 'left', toDirection: 'bottom', color: '#ef4444', type: 'curved' },
      ];
    }

    setNodes(newNodes);
    setConnections(newConnections);
    setSelectedNode(null);
    setSelectedConnection(null);
  }, []);

  // Get connection path
  const getConnectionPath = useCallback((connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    if (!fromNode || !toNode) return '';

    const getPoint = (node, direction) => {
      const centerX = node.x + node.width / 2;
      const centerY = node.y + node.height / 2;

      switch (direction) {
        case 'top': return { x: centerX, y: node.y };
        case 'right': return { x: node.x + node.width, y: centerY };
        case 'bottom': return { x: centerX, y: node.y + node.height };
        case 'left': return { x: node.x, y: centerY };
        default: return { x: centerX, y: centerY };
      }
    };

    const from = getPoint(fromNode, connection.fromDirection);
    const to = getPoint(toNode, connection.toDirection);

    if (connection.type === 'straight') {
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    } else {
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      let cp1x, cp1y, cp2x, cp2y;

      if (connection.fromDirection === 'left' || connection.fromDirection === 'right') {
        cp1x = midX;
        cp1y = from.y;
        cp2x = midX;
        cp2y = to.y;
      } else {
        cp1x = from.x;
        cp1y = midY;
        cp2x = to.x;
        cp2y = midY;
      }

      return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
    }
  }, [nodes]);

  // Import to Neo4j
  const handleImport = async () => {
    try {
      const typesRes = await fetch('/api/node-types');
      const nodeTypes = typesRes.ok ? await typesRes.json() : [];
      setNodeTypesForImport(nodeTypes);

      // Initialize mapping
      const initialMapping = {};
      const shapeTypes = [...new Set(nodes.map(n => n.type))];
      shapeTypes.forEach(shape => {
        if (nodeTypes.length > 0) {
          initialMapping[shape] = nodeTypes[0].id;
        }
      });
      setTypeMapping(initialMapping);
      setShowImportDialog(true);
    } catch (e) {
      console.error('Failed to fetch types', e);
      alert('Failed to fetch node types. Please try again.');
    }
  };

  const executeImport = async () => {
    try {
      const nodeIdMap = new Map();

      for (const node of nodes) {
        const typeId = typeMapping[node.type];
        if (!typeId) {
          alert(`No type mapping for shape: ${node.type}`);
          return;
        }

        const res = await fetch('/api/nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            typeId,
            name: node.text,
            x: node.x,
            y: node.y,
            color: node.color,
            domain: activeDomain || undefined,
          }),
        });

        if (res.ok) {
          const { id } = await res.json();
          nodeIdMap.set(node.id, id);
        }
      }

      for (const conn of connections) {
        const sourceId = nodeIdMap.get(conn.from);
        const targetId = nodeIdMap.get(conn.to);

        if (sourceId && targetId) {
          await fetch('/api/relationships', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceId,
              targetId,
              type: 'CONNECTS_TO',
            }),
          });
        }
      }

      alert(`Successfully imported ${nodeIdMap.size} nodes to the knowledge graph!`);
      setShowImportDialog(false);
    } catch (e) {
      console.error('Import failed', e);
      alert('Failed to import. Please try again.');
    }
  };

  // Export diagram as JSON
  const exportDiagram = () => {
    const data = { name: diagramName, nodes, connections };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagramName || 'diagram'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleNodeDrag);
      window.addEventListener('mouseup', handleNodeDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleNodeDrag);
        window.removeEventListener('mouseup', handleNodeDragEnd);
      };
    }
  }, [isDragging, handleNodeDrag, handleNodeDragEnd]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          deleteSelectedNode();
        } else if (selectedConnection) {
          e.preventDefault();
          deleteSelectedConnection();
        }
      }
      if (e.key === 'Escape') {
        setSelectedNode(null);
        setSelectedConnection(null);
        setConnectingFrom(null);
        setActiveTool('select');
        setContextMenu(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedConnection, deleteSelectedNode, deleteSelectedConnection]);

  // Canvas panning with mouse drag (click and drag directly on canvas)
  const handleCanvasMouseDown = useCallback((e) => {
    // Only start pan if clicking directly on canvas (not on a node)
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-content')) {
      if (activeTool === 'select') {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
        e.preventDefault();
      }
    }
    // Close context menu on any click
    setContextMenu(null);
  }, [activeTool, panOffset]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [isPanning, panStart]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Wheel handler for zoom (pinch-to-zoom on trackpad) and pan (two-finger scroll)
  const handleWheel = useCallback((e) => {
    e.preventDefault();

    // Check if it's a pinch gesture (zoom) - typically has ctrlKey on trackpads
    if (e.ctrlKey) {
      // Pinch-to-zoom
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.max(0.3, Math.min(3, z + delta)));
    } else {
      // Two-finger scroll = pan
      setPanOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, []);

  // Attach wheel event with passive: false for preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Context menu handler
  const handleContextMenu = useCallback((e, type = 'canvas', nodeId = null, connectionId = null) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = canvasRef.current.getBoundingClientRect();
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      screenX: e.clientX,
      screenY: e.clientY,
      type, // 'canvas', 'node', or 'connection'
      nodeId,
      connectionId,
    });
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Zoom controls
  const zoomIn = useCallback(() => setZoom(z => Math.min(z + 0.2, 3)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - 0.2, 0.3)), []);
  const resetView = useCallback(() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }, []);

  const selectedNodeData = nodes.find(n => n.id === selectedNode);
  const selectedConnectionData = connections.find(c => c.id === selectedConnection);

  return (
    <div className="diagram-editor-container">
      {/* Left Sidebar - Diagrams List */}
      <div className="diagram-editor-sidebar">
        <div className="sidebar-header">
          <h3>Diagrams</h3>
          <button className="btn-small" onClick={() => setShowNewDialog(true)}>+ New</button>
        </div>

        <div className="diagram-list">
          {diagrams.map(d => (
            <div
              key={d.id}
              className={`diagram-list-item ${activeDiagramId === d.id ? 'active' : ''}`}
              onClick={() => loadDiagram(d)}
            >
              <span className="diagram-name">{d.name}</span>
              <button
                className="diagram-delete-btn"
                onClick={(e) => { e.stopPropagation(); deleteDiagram(d.id); }}
                title="Delete"
              >
                ×
              </button>
            </div>
          ))}
          {diagrams.length === 0 && (
            <div className="diagram-empty">
              <p>No diagrams yet</p>
              <button className="btn" onClick={() => setShowNewDialog(true)}>Create your first diagram</button>
            </div>
          )}
        </div>

        {/* Templates */}
        <div className="sidebar-section">
          <h4>Templates</h4>
          <div className="template-grid">
            <button className="template-btn" onClick={() => loadTemplate('flowchart')}>
              <span className="template-icon">📊</span>
              <span>Flowchart</span>
            </button>
            <button className="template-btn" onClick={() => loadTemplate('mindmap')}>
              <span className="template-icon">🧠</span>
              <span>Mind Map</span>
            </button>
            <button className="template-btn" onClick={() => loadTemplate('causal')}>
              <span className="template-icon">🔄</span>
              <span>Causal Loop</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="diagram-editor-main">
        {/* Toolbar */}
        <div className="diagram-toolbar">
          <div className="toolbar-group">
            <span className="toolbar-label">Tools</span>
            <button
              className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
              onClick={() => setActiveTool('select')}
              title="Select (V)"
            >
              ↖
            </button>
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Shapes</span>
            <button
              className={`tool-btn ${activeTool === 'rectangle' ? 'active' : ''}`}
              onClick={() => setActiveTool('rectangle')}
              title="Rectangle"
            >
              ▭
            </button>
            <button
              className={`tool-btn ${activeTool === 'circle' ? 'active' : ''}`}
              onClick={() => setActiveTool('circle')}
              title="Circle"
            >
              ○
            </button>
            <button
              className={`tool-btn ${activeTool === 'diamond' ? 'active' : ''}`}
              onClick={() => setActiveTool('diamond')}
              title="Diamond"
            >
              ◇
            </button>
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Color</span>
            {COLORS.slice(0, 6).map(color => (
              <button
                key={color.id}
                className={`color-btn ${activeColor === color.value ? 'active' : ''}`}
                style={{ background: color.value }}
                onClick={() => setActiveColor(color.value)}
                title={color.name}
              />
            ))}
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Lines</span>
            <button
              className={`tool-btn ${lineType === 'straight' ? 'active' : ''}`}
              onClick={() => setLineType('straight')}
              title="Straight lines"
            >
              ─
            </button>
            <button
              className={`tool-btn ${lineType === 'curved' ? 'active' : ''}`}
              onClick={() => setLineType('curved')}
              title="Curved lines"
            >
              ⌒
            </button>
          </div>

          <div className="toolbar-group" style={{ marginLeft: 'auto', borderRight: 'none' }}>
            <button className="btn-secondary" onClick={clearCanvas}>Clear</button>
            <button className="btn-secondary" onClick={exportDiagram}>Export</button>
            <button className="btn" onClick={handleImport}>Import to Graph</button>
          </div>
        </div>

        {/* Diagram Name */}
        {activeDiagramId && (
          <div className="diagram-name-bar">
            <input
              type="text"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              className="diagram-name-input"
              placeholder="Diagram name"
            />
          </div>
        )}

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="diagram-canvas"
          onClick={handleCanvasClick}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onContextMenu={(e) => handleContextMenu(e, 'canvas')}
          style={{ cursor: isPanning ? 'grabbing' : activeTool !== 'select' ? 'crosshair' : 'grab', overflow: 'hidden' }}
        >
          {/* Zoom controls */}
          <div className="zoom-controls diagram-zoom-controls">
            <button onClick={zoomIn} title="Zoom in">+</button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button onClick={zoomOut} title="Zoom out">−</button>
            <button onClick={resetView} title="Reset view" style={{ fontSize: 12 }}>⟲</button>
          </div>

          {/* Zoomable/pannable content wrapper */}
          <div
            className="canvas-content"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          >
          {/* SVG for connections */}
          <svg className="connections-svg">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
            {connections.map(conn => (
              <path
                key={conn.id}
                d={getConnectionPath(conn)}
                className={`connection-line ${selectedConnection === conn.id ? 'selected' : ''}`}
                stroke={conn.color}
                markerEnd="url(#arrowhead)"
                onClick={(e) => handleConnectionClick(e, conn.id)}
                onContextMenu={(e) => handleContextMenu(e, 'connection', null, conn.id)}
              />
            ))}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className={`diagram-node ${node.type} ${selectedNode === node.id ? 'selected' : ''}`}
              style={{
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
                borderColor: node.color,
                boxShadow: selectedNode === node.id ? `0 0 0 3px ${node.color}40` : undefined,
              }}
              onClick={(e) => handleNodeClick(e, node.id)}
              onMouseDown={(e) => handleNodeDragStart(e, node.id)}
              onContextMenu={(e) => handleContextMenu(e, 'node', node.id)}
            >
              <div className="node-content">
                {selectedNode === node.id ? (
                  <input
                    type="text"
                    className="node-input"
                    value={node.text}
                    onChange={(e) => updateSelectedNode({ text: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  node.text
                )}
              </div>

              {/* Connection handles */}
              <div className="connection-handle top" onClick={(e) => handleAddConnectedNode(e, node.id, 'top')}>+</div>
              <div className="connection-handle right" onClick={(e) => handleAddConnectedNode(e, node.id, 'right')}>+</div>
              <div className="connection-handle bottom" onClick={(e) => handleAddConnectedNode(e, node.id, 'bottom')}>+</div>
              <div className="connection-handle left" onClick={(e) => handleAddConnectedNode(e, node.id, 'left')}>+</div>
            </div>
          ))}

          {/* Empty state */}
          {nodes.length === 0 && activeDiagramId && (
            <div className="empty-canvas">
              <div className="empty-icon">📐</div>
              <div className="empty-title">Start creating your diagram</div>
              <div className="empty-hint">Select a shape from the toolbar and click on the canvas, or choose a template</div>
            </div>
          )}

          {/* No diagram selected */}
          {!activeDiagramId && (
            <div className="empty-canvas">
              <div className="empty-icon">📊</div>
              <div className="empty-title">No diagram selected</div>
              <div className="empty-hint">Create a new diagram or select one from the sidebar</div>
              <button className="btn" onClick={() => setShowNewDialog(true)}>Create New Diagram</button>
            </div>
          )}

          {/* Help text */}
          {nodes.length > 0 && (
            <div className="help-text">
              Tip: Click the + buttons on nodes to quickly add connected nodes. Drag canvas to pan, scroll to pan, pinch to zoom.
            </div>
          )}
          </div>{/* End canvas-content */}

          {/* Context Menu */}
          {contextMenu && (
            <div
              className="context-menu"
              style={{
                left: contextMenu.x,
                top: contextMenu.y,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {contextMenu.type === 'canvas' && (
                <>
                  <button onClick={() => { setActiveTool('rectangle'); setContextMenu(null); }}>
                    <span className="context-icon">▭</span> Add Rectangle
                  </button>
                  <button onClick={() => { setActiveTool('circle'); setContextMenu(null); }}>
                    <span className="context-icon">○</span> Add Circle
                  </button>
                  <button onClick={() => { setActiveTool('diamond'); setContextMenu(null); }}>
                    <span className="context-icon">◇</span> Add Diamond
                  </button>
                  <div className="context-divider" />
                  <button onClick={() => { loadTemplate('flowchart'); setContextMenu(null); }}>
                    <span className="context-icon">📊</span> Flowchart Template
                  </button>
                  <button onClick={() => { loadTemplate('mindmap'); setContextMenu(null); }}>
                    <span className="context-icon">🧠</span> Mind Map Template
                  </button>
                  <button onClick={() => { loadTemplate('causal'); setContextMenu(null); }}>
                    <span className="context-icon">🔄</span> Causal Loop Template
                  </button>
                  <div className="context-divider" />
                  <button onClick={() => { resetView(); setContextMenu(null); }}>
                    <span className="context-icon">⟲</span> Reset View
                  </button>
                </>
              )}
              {contextMenu.type === 'node' && (
                <>
                  <button onClick={() => { setSelectedNode(contextMenu.nodeId); setContextMenu(null); }}>
                    <span className="context-icon">✎</span> Edit Node
                  </button>
                  <button onClick={() => { handleAddConnectedNode({ stopPropagation: () => {} }, contextMenu.nodeId, 'right'); setContextMenu(null); }}>
                    <span className="context-icon">+</span> Add Connected Node
                  </button>
                  <button onClick={() => { updateSelectedNode({ color: activeColor }); setContextMenu(null); }}>
                    <span className="context-icon">🎨</span> Apply Current Color
                  </button>
                  <div className="context-divider" />
                  <button onClick={() => {
                    setNodes(prev => prev.map(n => n.id === contextMenu.nodeId ? { ...n } : n).concat({
                      ...nodes.find(n => n.id === contextMenu.nodeId),
                      id: generateId(),
                      x: (nodes.find(n => n.id === contextMenu.nodeId)?.x || 0) + 20,
                      y: (nodes.find(n => n.id === contextMenu.nodeId)?.y || 0) + 20,
                    }));
                    setContextMenu(null);
                  }}>
                    <span className="context-icon">⎘</span> Duplicate
                  </button>
                  <button className="context-danger" onClick={() => {
                    setNodes(prev => prev.filter(n => n.id !== contextMenu.nodeId));
                    setConnections(prev => prev.filter(c => c.from !== contextMenu.nodeId && c.to !== contextMenu.nodeId));
                    setContextMenu(null);
                  }}>
                    <span className="context-icon">🗑</span> Delete
                  </button>
                </>
              )}
              {contextMenu.type === 'connection' && (
                <>
                  <button onClick={() => { setSelectedConnection(contextMenu.connectionId); setContextMenu(null); }}>
                    <span className="context-icon">✎</span> Edit Connection
                  </button>
                  <button onClick={() => {
                    setConnections(prev => prev.map(c => c.id === contextMenu.connectionId ? { ...c, type: c.type === 'curved' ? 'straight' : 'curved' } : c));
                    setContextMenu(null);
                  }}>
                    <span className="context-icon">⌒</span> Toggle Curve
                  </button>
                  <div className="context-divider" />
                  <button className="context-danger" onClick={() => {
                    setConnections(prev => prev.filter(c => c.id !== contextMenu.connectionId));
                    setContextMenu(null);
                  }}>
                    <span className="context-icon">🗑</span> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div className="diagram-editor-properties">
        <h4 className="panel-title">
          {selectedNodeData ? 'Node Properties' : selectedConnectionData ? 'Connection Properties' : 'Properties'}
        </h4>

        {selectedNodeData ? (
          <>
            <div className="panel-section">
              <label className="panel-label">Label</label>
              <input
                type="text"
                className="panel-input"
                value={selectedNodeData.text}
                onChange={(e) => updateSelectedNode({ text: e.target.value })}
              />
            </div>

            <div className="panel-section">
              <label className="panel-label">Shape</label>
              <div className="shape-picker">
                {SHAPES.map(shape => (
                  <button
                    key={shape.id}
                    className={`shape-option ${selectedNodeData.type === shape.id ? 'active' : ''}`}
                    onClick={() => updateSelectedNode({ type: shape.id })}
                    title={shape.name}
                  >
                    {shape.icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="panel-section">
              <label className="panel-label">Color</label>
              <div className="color-picker">
                {COLORS.map(color => (
                  <button
                    key={color.id}
                    className={`color-btn ${selectedNodeData.color === color.value ? 'active' : ''}`}
                    style={{ background: color.value }}
                    onClick={() => updateSelectedNode({ color: color.value })}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="panel-section">
              <button className="btn-danger" onClick={deleteSelectedNode}>Delete Node</button>
            </div>
          </>
        ) : selectedConnectionData ? (
          <>
            <div className="panel-section">
              <label className="panel-label">Line Type</label>
              <div className="shape-picker">
                <button
                  className={`shape-option ${selectedConnectionData.type === 'straight' ? 'active' : ''}`}
                  onClick={() => setConnections(prev => prev.map(c => c.id === selectedConnection ? { ...c, type: 'straight' } : c))}
                >
                  ─
                </button>
                <button
                  className={`shape-option ${selectedConnectionData.type === 'curved' ? 'active' : ''}`}
                  onClick={() => setConnections(prev => prev.map(c => c.id === selectedConnection ? { ...c, type: 'curved' } : c))}
                >
                  ⌒
                </button>
              </div>
            </div>

            <div className="panel-section">
              <label className="panel-label">Color</label>
              <div className="color-picker">
                {COLORS.map(color => (
                  <button
                    key={color.id}
                    className={`color-btn ${selectedConnectionData.color === color.value ? 'active' : ''}`}
                    style={{ background: color.value }}
                    onClick={() => setConnections(prev => prev.map(c => c.id === selectedConnection ? { ...c, color: color.value } : c))}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="panel-section">
              <button className="btn-danger" onClick={deleteSelectedConnection}>Delete Connection</button>
            </div>
          </>
        ) : (
          <p className="panel-hint">Select a node or connection to edit its properties</p>
        )}

        {/* Elements List */}
        <div className="panel-section" style={{ marginTop: 24 }}>
          <label className="panel-label">Elements ({nodes.length})</label>
          <div className="element-list">
            {nodes.map(node => (
              <div
                key={node.id}
                className={`element-item ${selectedNode === node.id ? 'active' : ''}`}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="element-icon" style={{ background: node.color, borderRadius: node.type === 'circle' ? '50%' : node.type === 'diamond' ? '2px' : '4px' }} />
                <span>{node.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Diagram Dialog */}
      {showNewDialog && (
        <div className="modal-backdrop" onClick={() => setShowNewDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>New Diagram</h3>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={newDiagramName}
                onChange={(e) => setNewDiagramName(e.target.value)}
                placeholder="My Diagram"
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowNewDialog(false)}>Cancel</button>
              <button className="btn" onClick={createNewDiagram}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="modal-backdrop" onClick={() => setShowImportDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Import to Knowledge Graph</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
              Map diagram shapes to node types:
            </p>
            {[...new Set(nodes.map(n => n.type))].map(shape => (
              <div key={shape} className="form-group">
                <label style={{ textTransform: 'capitalize' }}>{shape}</label>
                <select
                  value={typeMapping[shape] || ''}
                  onChange={(e) => setTypeMapping(prev => ({ ...prev, [shape]: e.target.value }))}
                >
                  <option value="">Select type...</option>
                  {nodeTypesForImport.map(t => (
                    <option key={t.id} value={t.id}>{t.label || t.name}</option>
                  ))}
                </select>
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowImportDialog(false)}>Cancel</button>
              <button className="btn" onClick={executeImport}>Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
