// pages/graph-editor.js
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';
import { LogoSpinner } from '../components/Logo';

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
  { id: 'rounded', name: 'Rounded Rectangle', icon: '▢' },
  { id: 'circle', name: 'Circle', icon: '○' },
  { id: 'diamond', name: 'Diamond', icon: '◇' },
  { id: 'hexagon', name: 'Hexagon', icon: '⬡' },
  { id: 'octagon', name: 'Octagon', icon: '⯃' },
  { id: 'parallelogram', name: 'Parallelogram', icon: '▱' },
  { id: 'cylinder', name: 'Cylinder', icon: '⌭' },
];

export default function GraphEditorPage() {
  const { role } = useAuth();
  const { activeDomain, activeDomainObj } = useDomains();
  const canvasRef = useRef(null);

  // Data state from Neo4j
  const [nodes, setNodes] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [nodeTypes, setNodeTypes] = useState([]);
  const [relationshipTypes, setRelationshipTypes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Canvas panning and zoom state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [nodesAnimating, setNodesAnimating] = useState(false);
  const [shouldAutoLayout, setShouldAutoLayout] = useState(false);

  // UI state
  const [showNodeTypeDialog, setShowNodeTypeDialog] = useState(false);
  const [pendingNodePosition, setPendingNodePosition] = useState(null);
  const [showRelTypeDialog, setShowRelTypeDialog] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(null);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Type management state
  const [showManageTypesDialog, setShowManageTypesDialog] = useState(false);
  const [typeManagementTab, setTypeManagementTab] = useState('node-types');
  const [showAddNodeTypeDialog, setShowAddNodeTypeDialog] = useState(false);
  const [showAddRelTypeDialog, setShowAddRelTypeDialog] = useState(false);
  const [newNodeTypeForm, setNewNodeTypeForm] = useState({ name: '', label: '', color: '#8b5cf6', description: '' });
  const [newRelTypeForm, setNewRelTypeForm] = useState({ name: '', label: '', description: '' });
  const [editingNodeType, setEditingNodeType] = useState(null);
  const [editingRelType, setEditingRelType] = useState(null);

  // Edit form state (for full node editing)
  const [editForm, setEditForm] = useState({
    name: '',
    layer: '',
    description: '',
    weight: '',
    color: '',
    shape: '',
    attributes: {},
  });
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  // Add relationship from panel state
  const [showAddRelPanel, setShowAddRelPanel] = useState(false);
  const [newRelTarget, setNewRelTarget] = useState('');
  const [newRelType, setNewRelType] = useState('');
  const [newRelDirection, setNewRelDirection] = useState('out'); // 'out' = selectedNode -> target, 'in' = target -> selectedNode
  const [nodeSearchResults, setNodeSearchResults] = useState([]);

  // Undo stack
  const [undoStack, setUndoStack] = useState([]);

  // Domain match helper
  const domainMatch = useMemo(() => {
    const activeName = activeDomainObj?.name;
    const active = activeDomain;
    return (entity) => {
      if (!active) return true;
      if (!entity) return false;
      const val = entity.domain ?? entity.domainId ?? entity.domainName ?? entity.workspace ?? entity.workspaceId;
      if (val === undefined || val === null) return false;
      return String(val) === String(active) || (activeName && String(val) === String(activeName));
    };
  }, [activeDomain, activeDomainObj?.name]);

  const computeDirections = (fromNode, toNode) => {
    if (!fromNode || !toNode) {
      return { fromDirection: 'right', toDirection: 'left' };
    }
    const fromCenterX = fromNode.x + fromNode.width / 2;
    const fromCenterY = fromNode.y + fromNode.height / 2;
    const toCenterX = toNode.x + toNode.width / 2;
    const toCenterY = toNode.y + toNode.height / 2;
    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle >= -45 && angle < 45) {
      return { fromDirection: 'right', toDirection: 'left' };
    }
    if (angle >= 45 && angle < 135) {
      return { fromDirection: 'bottom', toDirection: 'top' };
    }
    if (angle >= -135 && angle < -45) {
      return { fromDirection: 'top', toDirection: 'bottom' };
    }
    return { fromDirection: 'left', toDirection: 'right' };
  };

  const getEdgePoint = (node, direction) => {
    const centerX = node.x + node.width / 2;
    const centerY = node.y + node.height / 2;
    const offset = 6;
    switch (direction) {
      case 'top':
        return { x: centerX, y: node.y - offset };
      case 'bottom':
        return { x: centerX, y: node.y + node.height + offset };
      case 'left':
        return { x: node.x - offset, y: centerY };
      case 'right':
        return { x: node.x + node.width + offset, y: centerY };
      default:
        return { x: centerX, y: centerY };
    }
  };

  const autoLayout = useCallback(() => {
    if (nodes.length === 0) return;

    setNodesAnimating(true);

    const nodesByType = {};
    nodes.forEach(n => {
      const type = n.nodeTypeId || 'unknown';
      if (!nodesByType[type]) nodesByType[type] = [];
      nodesByType[type].push(n);
    });

    const typeGroups = Object.values(nodesByType);
    const spacing = { x: 180, y: 120 };
    const startX = 100;
    const startY = 100;

    const newPositions = {};
    let currentY = startY;

    typeGroups.forEach((group, groupIndex) => {
      let currentX = startX;
      group.forEach((node, nodeIndex) => {
        newPositions[node.id] = {
          x: currentX + (nodeIndex % 5) * spacing.x,
          y: currentY + Math.floor(nodeIndex / 5) * spacing.y,
        };
      });
      currentY += (Math.ceil(group.length / 5)) * spacing.y + 60;
    });

    setNodes(prev => prev.map(node => ({
      ...node,
      x: newPositions[node.id]?.x ?? node.x,
      y: newPositions[node.id]?.y ?? node.y,
    })));

    setTimeout(async () => {
      for (const node of nodes) {
        const pos = newPositions[node.id];
        if (pos) {
          try {
            await fetch(`/api/nodes/${encodeURIComponent(node.id)}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ x: pos.x, y: pos.y }),
            });
          } catch (e) {
            console.error('Failed to save position', e);
          }
        }
      }
      setNodesAnimating(false);
    }, 500);
  }, [nodes]);

  useEffect(() => {
    if (shouldAutoLayout) {
      autoLayout();
      setShouldAutoLayout(false);
    }
  }, [shouldAutoLayout, autoLayout]);

  // Load data from Neo4j
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = activeDomain
        ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
        : '';

      const [nodesRes, typesRes, relTypesRes, relsRes] = await Promise.all([
        fetch(`/api/nodes${qs}`),
        fetch(`/api/node-types${qs}`),
        fetch(`/api/relationship-types${qs}`),
        fetch(`/api/relationships${qs}`),
      ]);

      const [nodesData, typesData, relTypesData, relsData] = await Promise.all([
        nodesRes.ok ? nodesRes.json() : [],
        typesRes.ok ? typesRes.json() : [],
        relTypesRes.ok ? relTypesRes.json() : [],
        relsRes.ok ? relsRes.json() : [],
      ]);

      setNodeTypes(typesData || []);
      setRelationshipTypes(relTypesData || []);

      // Convert nodes to canvas format with positions
      const scopedNodes = (nodesData || []).filter(domainMatch);
      const canvasNodes = scopedNodes.map((n, i) => {
        const nodeType = typesData?.find(t => t.id === n.typeId || t.name === n.typeName);
        const textValue = n.name || n.label || 'Unnamed';
        const baseWidth = Math.min(140, Math.max(70, textValue.length * 6 + 40));
        const nodeHeight = n.shape === 'circle' ? baseWidth : Math.max(40, Math.min(70, baseWidth * 0.55));
        return {
          id: n.id,
          dbId: n.id,
          type: n.shape || 'rectangle',
          x: n.x ?? 100 + (i % 5) * 180,
          y: n.y ?? 100 + Math.floor(i / 5) * 120,
          width: n.shape === 'circle' ? baseWidth : baseWidth,
          height: nodeHeight,
          text: textValue,
          color: n.color || nodeType?.color || COLORS[i % COLORS.length].value,
          nodeTypeId: n.typeId,
          nodeTypeName: nodeType?.label || nodeType?.name || n.typeName,
          layer: n.layer,
          description: n.description,
          weight: n.weight,
          attributes: n.attributes || {},
          raw: n,
        };
      });
      setNodes(canvasNodes);
      const hasStoredPositions = scopedNodes.every(n => n.x != null && n.y != null);
      setShouldAutoLayout(!hasStoredPositions);

      // Convert relationships to connections
      const connections = (relsData || []).map(r => {
        const fromId = r.sourceId || r.source;
        const toId = r.targetId || r.target;
        const fromNode = canvasNodes.find(n => n.id === fromId);
        const toNode = canvasNodes.find(n => n.id === toId);
        const { fromDirection, toDirection } = computeDirections(fromNode, toNode);
        return {
          id: r.id,
          dbId: r.id,
          from: fromId,
          to: toId,
          fromDirection,
          toDirection,
          color: '#6b7280',
          type: lineType,
          label: r.type || r.label,
          raw: r,
        };
      });
      setRelationships(connections);
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  }, [activeDomain, activeDomainObj, domainMatch, lineType, setShouldAutoLayout]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter nodes
  const filteredNodes = useMemo(() => {
    let result = nodes;
    if (filterType) {
      result = result.filter(n => n.nodeTypeId === filterType || n.nodeTypeName === filterType);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => n.text.toLowerCase().includes(q));
    }
    return result;
  }, [nodes, filterType, searchQuery]);

  // Spread nodes to avoid overlap
  const spreadNodes = useCallback(() => {
    if (nodes.length === 0) return;

    setNodesAnimating(true);

    const newNodes = [...nodes];
    const padding = 40;
    const iterations = 50;

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          const a = newNodes[i];
          const b = newNodes[j];

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (a.width + b.width) / 2 + padding;

          if (dist < minDist && dist > 0) {
            const force = (minDist - dist) / 2;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            newNodes[i] = { ...newNodes[i], x: a.x - fx, y: a.y - fy };
            newNodes[j] = { ...newNodes[j], x: b.x + fx, y: b.y + fy };
          }
        }
      }
    }

    // Keep nodes in positive space
    const minX = Math.min(...newNodes.map(n => n.x));
    const minY = Math.min(...newNodes.map(n => n.y));
    const offsetX = minX < 50 ? 50 - minX : 0;
    const offsetY = minY < 50 ? 50 - minY : 0;

    const finalNodes = newNodes.map(n => ({
      ...n,
      x: n.x + offsetX,
      y: n.y + offsetY,
    }));

    setNodes(finalNodes);

    // Save positions
    setTimeout(async () => {
      for (const node of finalNodes) {
        try {
          await fetch(`/api/nodes/${encodeURIComponent(node.id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x: node.x, y: node.y }),
          });
        } catch (e) {
          console.error('Failed to save position', e);
        }
      }
      setNodesAnimating(false);
    }, 500);
  }, [nodes]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom(z => Math.min(z + 0.2, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(z => Math.max(z - 0.2, 0.3));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Handle canvas click to add new node
  const handleCanvasClick = useCallback((e) => {
    if (activeTool === 'select' || isDragging || isPanning) return;
    if (connectingFrom) {
      setConnectingFrom(null);
      setConnectingDirection(null);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - panOffset.x;
    const y = e.clientY - rect.top - panOffset.y;

    const shapeIds = SHAPES.map(s => s.id);
    if (shapeIds.includes(activeTool)) {
      setPendingNodePosition({ x: x - 60, y: y - 30 });
      setShowNodeTypeDialog(true);
    }
  }, [activeTool, isDragging, isPanning, connectingFrom, panOffset]);

  // Create node in Neo4j
  const createNode = useCallback(async (nodeTypeId) => {
    if (!pendingNodePosition) return;

    const nodeType = nodeTypes.find(t => t.id === nodeTypeId);
    const name = `New ${nodeType?.label || nodeType?.name || 'Node'}`;

    try {
      const res = await fetch('/api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typeId: nodeTypeId,
          name,
          x: pendingNodePosition.x,
          y: pendingNodePosition.y,
          color: activeColor,
          shape: activeTool,
          domain: activeDomain || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const baseWidth = Math.min(140, Math.max(70, name.length * 6 + 40));
        const newNode = {
          id: data.id,
          dbId: data.id,
          type: activeTool,
          x: pendingNodePosition.x,
          y: pendingNodePosition.y,
          width: baseWidth,
          height: activeTool === 'circle' ? baseWidth : Math.max(40, Math.min(70, baseWidth * 0.55)),
          text: name,
          color: activeColor,
          nodeTypeId,
          nodeTypeName: nodeType?.label || nodeType?.name,
          layer: '',
          description: '',
          weight: null,
          attributes: {},
        };
        setNodes(prev => [...prev, newNode]);
        setUndoStack(stack => [...stack, { type: 'create-node', id: data.id }]);
        setSelectedNode(data.id);
        setActiveTool('select');
      }
    } catch (e) {
      console.error('Failed to create node', e);
    }

    setShowNodeTypeDialog(false);
    setPendingNodePosition(null);
  }, [pendingNodePosition, nodeTypes, activeColor, activeTool, activeDomain]);

  // Handle node click
  const handleNodeClick = useCallback((e, nodeId) => {
    e.stopPropagation();

    if (connectingFrom && connectingFrom !== nodeId) {
      // Create connection
      setPendingConnection({
        from: connectingFrom,
        to: nodeId,
        fromDirection: connectingDirection,
        toDirection: 'left',
      });
      setShowRelTypeDialog(true);
      setConnectingFrom(null);
      setConnectingDirection(null);
    } else {
      setSelectedNode(nodeId);
      setSelectedConnection(null);
    }
  }, [connectingFrom, connectingDirection]);

  // Create relationship in Neo4j
  const createRelationship = useCallback(async (relTypeId) => {
    if (!pendingConnection) return;

    const relType = relationshipTypes.find(t => t.id === relTypeId);
    const typeName = relType?.name || relType?.label || 'RELATES_TO';

    try {
      const res = await fetch('/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: pendingConnection.from,
          targetId: pendingConnection.to,
          type: typeName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newRel = {
          id: data.id,
          dbId: data.id,
          from: pendingConnection.from,
          to: pendingConnection.to,
          fromDirection: pendingConnection.fromDirection || 'right',
          toDirection: pendingConnection.toDirection || 'left',
          color: '#6b7280',
          type: lineType,
          label: typeName,
        };
        setRelationships(prev => [...prev, newRel]);
        setUndoStack(stack => [...stack, { type: 'create-relationship', id: data.id }]);
      }
    } catch (e) {
      console.error('Failed to create relationship', e);
    }

    setShowRelTypeDialog(false);
    setPendingConnection(null);
  }, [pendingConnection, relationshipTypes, lineType]);

  // Handle node drag start
  const handleNodeDragStart = useCallback((e, nodeId) => {
    if (e.button === 1 || e.button === 2) return; // Only left click
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - panOffset.x - node.x,
      y: e.clientY - rect.top - panOffset.y - node.y,
    });
    setIsDragging(true);
    setSelectedNode(nodeId);
  }, [nodes, panOffset]);

  // Handle node drag
  const handleNodeDrag = useCallback((e) => {
    if (!isDragging || !selectedNode) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - panOffset.x - dragOffset.x;
    const y = e.clientY - rect.top - panOffset.y - dragOffset.y;

    setNodes(prev => prev.map(node =>
      node.id === selectedNode
        ? { ...node, x: Math.max(0, x), y: Math.max(0, y) }
        : node
    ));
  }, [isDragging, selectedNode, dragOffset, panOffset]);

  // Handle node drag end - save position to Neo4j
  const handleNodeDragEnd = useCallback(async () => {
    if (isDragging && selectedNode) {
      const node = nodes.find(n => n.id === selectedNode);
      if (node) {
        try {
          await fetch(`/api/nodes/${encodeURIComponent(node.id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ x: node.x, y: node.y }),
          });
        } catch (e) {
          console.error('Failed to save position', e);
        }
      }
    }
    setIsDragging(false);
  }, [isDragging, selectedNode, nodes]);

  // Canvas panning handlers (supports Alt+drag, middle-click, spacebar+drag)
  const handlePanStart = useCallback((e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey) || (e.button === 0 && isSpacePressed)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset, isSpacePressed]);

  const handlePanMove = useCallback((e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [isPanning, panStart]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Add connected node via + button
  const handleAddConnectedNode = useCallback((e, fromNodeId, direction) => {
    e.stopPropagation();
    setConnectingFrom(fromNodeId);
    setConnectingDirection(direction);
  }, []);

  // Open edit dialog for selected node
  const openEditDialog = useCallback(() => {
    const node = nodes.find(n => n.id === selectedNode);
    if (!node) return;

    setEditForm({
      name: node.text || '',
      layer: node.layer || '',
      description: node.description || '',
      weight: node.weight !== null && node.weight !== undefined ? String(node.weight) : '',
      color: node.color || '',
      shape: node.type || 'rectangle',
      attributes: { ...(node.attributes || {}) },
    });
    setShowEditDialog(true);
  }, [nodes, selectedNode]);

  // Handle edit form save
  const handleEditSave = useCallback(async () => {
    if (!selectedNode) return;

    const updates = {
      name: editForm.name,
      layer: editForm.layer || undefined,
      description: editForm.description || undefined,
      weight: editForm.weight === '' ? undefined : parseFloat(editForm.weight),
      color: editForm.color || undefined,
      shape: editForm.shape || undefined,
      attributes: editForm.attributes,
    };

    // Update local state
    setNodes(prev => prev.map(node =>
      node.id === selectedNode
        ? {
            ...node,
            text: editForm.name,
            layer: editForm.layer,
            description: editForm.description,
            weight: editForm.weight === '' ? null : parseFloat(editForm.weight),
            color: editForm.color,
            type: editForm.shape,
            attributes: editForm.attributes,
          }
        : node
    ));

    // Save to Neo4j
    try {
      await fetch(`/api/nodes/${encodeURIComponent(selectedNode)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.error('Failed to update node', e);
    }

    setShowEditDialog(false);
  }, [selectedNode, editForm]);

  // Add attribute to edit form
  const addAttribute = useCallback(() => {
    if (!newAttrKey.trim()) return;
    setEditForm(prev => ({
      ...prev,
      attributes: { ...prev.attributes, [newAttrKey.trim()]: newAttrValue },
    }));
    setNewAttrKey('');
    setNewAttrValue('');
  }, [newAttrKey, newAttrValue]);

  // Remove attribute from edit form
  const removeAttribute = useCallback((key) => {
    setEditForm(prev => {
      const newAttrs = { ...prev.attributes };
      delete newAttrs[key];
      return { ...prev, attributes: newAttrs };
    });
  }, []);

  // Quick update for simple properties (name, color, shape)
  const updateSelectedNode = useCallback(async (updates) => {
    if (!selectedNode) return;

    setNodes(prev => prev.map(node =>
      node.id === selectedNode ? { ...node, ...updates } : node
    ));

    // Save to Neo4j
    try {
      await fetch(`/api/nodes/${encodeURIComponent(selectedNode)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updates.text,
          color: updates.color,
          shape: updates.type,
        }),
      });
    } catch (e) {
      console.error('Failed to update node', e);
    }
  }, [selectedNode]);

  // Delete selected node
  const deleteSelectedNode = useCallback(async () => {
    if (!selectedNode) return;

    if (!confirm('Delete this node? This will also delete all connections.')) return;

    try {
      await fetch(`/api/nodes/${encodeURIComponent(selectedNode)}`, { method: 'DELETE' });
      setNodes(prev => prev.filter(n => n.id !== selectedNode));
      setRelationships(prev => prev.filter(c => c.from !== selectedNode && c.to !== selectedNode));
      setSelectedNode(null);
    } catch (e) {
      console.error('Failed to delete node', e);
    }
  }, [selectedNode]);

  // Delete selected connection
  const deleteSelectedConnection = useCallback(async () => {
    if (!selectedConnection) return;

    try {
      await fetch(`/api/relationships/${encodeURIComponent(selectedConnection)}`, { method: 'DELETE' });
      setRelationships(prev => prev.filter(c => c.id !== selectedConnection));
      setSelectedConnection(null);
    } catch (e) {
      console.error('Failed to delete relationship', e);
    }
  }, [selectedConnection]);

  // Handle connection click
  const handleConnectionClick = useCallback((e, connectionId) => {
    e.stopPropagation();
    setSelectedConnection(connectionId);
    setSelectedNode(null);
  }, []);

  // Node Type CRUD operations
  const createNodeType = useCallback(async () => {
    if (!newNodeTypeForm.name.trim()) return;

    try {
      const res = await fetch('/api/node-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newNodeTypeForm.name.trim(),
          label: newNodeTypeForm.label.trim() || newNodeTypeForm.name.trim(),
          color: newNodeTypeForm.color,
          description: newNodeTypeForm.description,
          domain: activeDomain || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNodeTypes(prev => [...prev, data]);
        setNewNodeTypeForm({ name: '', label: '', color: '#8b5cf6', description: '' });
        setShowAddNodeTypeDialog(false);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to create node type');
      }
    } catch (e) {
      console.error('Failed to create node type', e);
    }
  }, [newNodeTypeForm, activeDomain]);

  const updateNodeType = useCallback(async () => {
    if (!editingNodeType) return;

    try {
      const res = await fetch(`/api/node-types/${encodeURIComponent(editingNodeType.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingNodeType.name,
          label: editingNodeType.label,
          color: editingNodeType.color,
          description: editingNodeType.description,
        }),
      });

      if (res.ok) {
        setNodeTypes(prev => prev.map(t => t.id === editingNodeType.id ? { ...t, ...editingNodeType } : t));
        setEditingNodeType(null);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to update node type');
      }
    } catch (e) {
      console.error('Failed to update node type', e);
    }
  }, [editingNodeType]);

  const deleteNodeType = useCallback(async (typeId) => {
    if (!confirm('Delete this node type? Nodes using this type will not be deleted but will lose their type association.')) return;

    try {
      const res = await fetch(`/api/node-types/${encodeURIComponent(typeId)}`, { method: 'DELETE' });
      if (res.ok) {
        setNodeTypes(prev => prev.filter(t => t.id !== typeId));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to delete node type');
      }
    } catch (e) {
      console.error('Failed to delete node type', e);
    }
  }, []);

  // Relationship Type CRUD operations
  const createRelType = useCallback(async () => {
    if (!newRelTypeForm.name.trim()) return;

    try {
      const res = await fetch('/api/relationship-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRelTypeForm.name.trim().toUpperCase().replace(/\s+/g, '_'),
          label: newRelTypeForm.label.trim() || newRelTypeForm.name.trim(),
          description: newRelTypeForm.description,
          domain: activeDomain || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRelationshipTypes(prev => [...prev, data]);
        setNewRelTypeForm({ name: '', label: '', description: '' });
        setShowAddRelTypeDialog(false);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to create relationship type');
      }
    } catch (e) {
      console.error('Failed to create relationship type', e);
    }
  }, [newRelTypeForm, activeDomain]);

  const updateRelType = useCallback(async () => {
    if (!editingRelType) return;

    try {
      const res = await fetch(`/api/relationship-types/${encodeURIComponent(editingRelType.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingRelType.name,
          label: editingRelType.label,
          description: editingRelType.description,
        }),
      });

      if (res.ok) {
        setRelationshipTypes(prev => prev.map(t => t.id === editingRelType.id ? { ...t, ...editingRelType } : t));
        setEditingRelType(null);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to update relationship type');
      }
    } catch (e) {
      console.error('Failed to update relationship type', e);
    }
  }, [editingRelType]);

  const deleteRelType = useCallback(async (typeId) => {
    if (!confirm('Delete this relationship type? Existing relationships will not be deleted but may become orphaned.')) return;

    try {
      const res = await fetch(`/api/relationship-types/${encodeURIComponent(typeId)}`, { method: 'DELETE' });
      if (res.ok) {
        setRelationshipTypes(prev => prev.filter(t => t.id !== typeId));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to delete relationship type');
      }
    } catch (e) {
      console.error('Failed to delete relationship type', e);
    }
  }, []);

  // Undo last action
  const handleUndo = useCallback(async () => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    try {
      if (lastAction.type === 'create-node') {
        await fetch(`/api/nodes/${encodeURIComponent(lastAction.id)}`, { method: 'DELETE' });
        setNodes(prev => prev.filter(n => n.id !== lastAction.id));
        setRelationships(prev => prev.filter(c => c.from !== lastAction.id && c.to !== lastAction.id));
      } else if (lastAction.type === 'create-relationship') {
        await fetch(`/api/relationships/${encodeURIComponent(lastAction.id)}`, { method: 'DELETE' });
        setRelationships(prev => prev.filter(c => c.id !== lastAction.id));
      }
      setUndoStack(stack => stack.slice(0, -1));
    } catch (e) {
      console.error('Failed to undo', e);
    }
  }, [undoStack]);

  // Search nodes for autocomplete
  const handleNodeSearch = useCallback((query) => {
    setNewRelTarget(query);
    if (!query.trim()) {
      setNodeSearchResults([]);
      return;
    }
    const q = query.toLowerCase();
    const results = nodes
      .filter(n => n.id !== selectedNode) // Exclude currently selected node
      .filter(n =>
        (n.text || '').toLowerCase().includes(q) ||
        (n.name || '').toLowerCase().includes(q) ||
        (n.nodeTypeName || '').toLowerCase().includes(q)
      )
      .slice(0, 10);
    setNodeSearchResults(results);
  }, [nodes, selectedNode]);

  // Add relationship from panel
  const handleAddRelationshipFromPanel = useCallback(async (targetNodeId) => {
    if (!selectedNode || !targetNodeId || !newRelType) {
      alert('Please select a target node and relationship type');
      return;
    }

    const sourceId = newRelDirection === 'out' ? selectedNode : targetNodeId;
    const targetId = newRelDirection === 'out' ? targetNodeId : selectedNode;

    try {
      const res = await fetch('/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId,
          targetId,
          type: newRelType,
        }),
      });

      if (res.ok) {
        const { id } = await res.json();
        const sourceNode = nodes.find(n => n.id === sourceId);
        const targetNode = nodes.find(n => n.id === targetId);
        const relTypeObj = relationshipTypes.find(t => t.name === newRelType);

        // Determine connection points based on positions
        let fromDirection = 'right';
        let toDirection = 'left';
        if (sourceNode && targetNode) {
          if (targetNode.y < sourceNode.y - 50) { fromDirection = 'top'; toDirection = 'bottom'; }
          else if (targetNode.y > sourceNode.y + 50) { fromDirection = 'bottom'; toDirection = 'top'; }
          else if (targetNode.x < sourceNode.x) { fromDirection = 'left'; toDirection = 'right'; }
        }

        setRelationships(prev => [...prev, {
          id,
          from: sourceId,
          to: targetId,
          type: newRelType,
          label: relTypeObj?.label || newRelType,
          color: '#6b7280',
          lineType: lineType,
          fromDirection,
          toDirection,
        }]);

        // Reset form
        setShowAddRelPanel(false);
        setNewRelTarget('');
        setNewRelType('');
        setNodeSearchResults([]);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to create relationship');
      }
    } catch (e) {
      console.error('Failed to create relationship', e);
      alert('Failed to create relationship');
    }
  }, [selectedNode, newRelType, newRelDirection, nodes, relationshipTypes, lineType]);

  // Delete a specific relationship
  const handleDeleteRelationship = useCallback(async (relId) => {
    if (!confirm('Delete this relationship?')) return;

    try {
      const res = await fetch(`/api/relationships/${encodeURIComponent(relId)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setRelationships(prev => prev.filter(r => r.id !== relId));
      } else {
        alert('Failed to delete relationship');
      }
    } catch (e) {
      console.error('Failed to delete relationship', e);
    }
  }, []);

  // Get connection path with label position - dynamically calculates best connection points
  const getConnectionPath = useCallback((connection) => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    if (!fromNode || !toNode) return { path: '', labelX: 0, labelY: 0 };

    // Calculate node centers
    const fromCenterX = fromNode.x + fromNode.width / 2;
    const fromCenterY = fromNode.y + fromNode.height / 2;
    const toCenterX = toNode.x + toNode.width / 2;
    const toCenterY = toNode.y + toNode.height / 2;

    const dx = toCenterX - fromCenterX;
    const dy = toCenterY - fromCenterY;

    // Determine best exit direction from source node based on stored values or current positions
    const derived = computeDirections(fromNode, toNode);
    const fromDirection = derived.fromDirection;
    const toDirection = derived.toDirection;
    const from = getEdgePoint(fromNode, fromDirection);
    const to = getEdgePoint(toNode, toDirection);

    // Calculate midpoint for label
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    let path;
    if (connection.type === 'straight') {
      path = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    } else {
      // Create smooth bezier curves based on direction
      let cp1x, cp1y, cp2x, cp2y;
      const curveOffset = Math.min(Math.abs(dx), Math.abs(dy), 60) + 30;

      if (fromDirection === 'left' || fromDirection === 'right') {
        // Horizontal exit - curve horizontally first
        const xOffset = fromDirection === 'right' ? curveOffset : -curveOffset;
        cp1x = from.x + xOffset;
        cp1y = from.y;
        cp2x = to.x + (toDirection === 'right' ? curveOffset : toDirection === 'left' ? -curveOffset : 0);
        cp2y = to.y;
      } else {
        // Vertical exit - curve vertically first
        const yOffset = fromDirection === 'bottom' ? curveOffset : -curveOffset;
        cp1x = from.x;
        cp1y = from.y + yOffset;
        cp2x = to.x;
        cp2y = to.y + (toDirection === 'bottom' ? curveOffset : toDirection === 'top' ? -curveOffset : 0);
      }

      path = `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
    }

    return { path, labelX: midX, labelY: midY - 8 };
  }, [nodes]);

  // Event listeners for drag and pan
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

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handlePanMove);
      window.addEventListener('mouseup', handlePanEnd);
      return () => {
        window.removeEventListener('mousemove', handlePanMove);
        window.removeEventListener('mouseup', handlePanEnd);
      };
    }
  }, [isPanning, handlePanMove, handlePanEnd]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Spacebar for panning mode
      if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
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
        setShowEditDialog(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        zoomIn();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        zoomOut();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        resetZoom();
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedNode, selectedConnection, deleteSelectedNode, deleteSelectedConnection, handleUndo, zoomIn, zoomOut, resetZoom]);

  // Wheel zoom/pan (Ctrl+wheel for zoom, regular wheel for pan)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom with Ctrl+wheel
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.max(0.3, Math.min(3, z + delta)));
    } else {
      // Pan with regular wheel
      setPanOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, []);

  const selectedNodeData = nodes.find(n => n.id === selectedNode);
  const selectedConnectionData = relationships.find(c => c.id === selectedConnection);

  if (loading) {
    return (
      <div className="graph-editor-container">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LogoSpinner size={64} label="Loading graph data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="graph-editor-container">
      {/* Left Sidebar - Filters & Node List */}
      <div className="graph-editor-sidebar">
        <div className="sidebar-header">
          <h3>Graph Editor</h3>
          <button className="btn-small" onClick={loadData}>Refresh</button>
        </div>

        {/* Filters */}
        <div className="sidebar-section" style={{ marginTop: 0, borderTop: 'none', paddingTop: 0 }}>
          <h4>Filters</h4>
          <div className="form-group">
            <label>Node Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All types</option>
              {nodeTypes.map(t => (
                <option key={t.id} value={t.id}>{t.label || t.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setFilterType(''); setSearchQuery(''); }}>
              Clear
            </button>
            <button className="btn-small" onClick={() => setShowInfoDialog(true)}>
              Help
            </button>
          </div>
        </div>

        {/* Node List */}
        <div className="sidebar-section" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <h4>Nodes ({filteredNodes.length})</h4>
          <div className="element-list" style={{ flex: 1, maxHeight: 'none' }}>
            {filteredNodes.map(node => (
              <div
                key={node.id}
                className={`element-item ${selectedNode === node.id ? 'active' : ''}`}
                onClick={() => { setSelectedNode(node.id); setSelectedConnection(null); }}
              >
                <div className="element-icon" style={{ background: node.color, borderRadius: node.type === 'circle' ? '50%' : '4px' }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.text}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{node.nodeTypeName}</span>
              </div>
            ))}
            {filteredNodes.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>No nodes found</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="graph-editor-main">
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
            <span className="toolbar-label">Add Node</span>
            {SHAPES.map(shape => (
              <button
                key={shape.id}
                className={`tool-btn ${activeTool === shape.id ? 'active' : ''}`}
                onClick={() => setActiveTool(shape.id)}
                title={shape.name}
              >
                {shape.icon}
              </button>
            ))}
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

          <div className="toolbar-group">
            <span className="toolbar-label">Zoom</span>
            <button
              className="tool-btn"
              onClick={zoomOut}
              title="Zoom out (Ctrl+-)"
            >
              −
            </button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button
              className="tool-btn"
              onClick={zoomIn}
              title="Zoom in (Ctrl++)"
            >
              +
            </button>
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Layout</span>
            <button
              className="tool-btn"
              onClick={autoLayout}
              title="Auto-arrange by type"
              disabled={nodesAnimating}
            >
              ⋮⋮
            </button>
            <button
              className="tool-btn"
              onClick={spreadNodes}
              title="Spread overlapping nodes"
              disabled={nodesAnimating}
            >
              ⇔
            </button>
            <button
              className="tool-btn"
              onClick={resetZoom}
              title="Reset view (Ctrl+0)"
            >
              ⌂
            </button>
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Schema</span>
            <button
              className="tool-btn"
              onClick={() => setShowManageTypesDialog(true)}
              title="Manage node & relationship types"
            >
              ⚙
            </button>
          </div>

          <div className="toolbar-group" style={{ marginLeft: 'auto', borderRight: 'none' }}>
            <button className="btn-secondary" onClick={handleUndo} disabled={undoStack.length === 0}>
              Undo
            </button>
          </div>
        </div>

        {/* Connection State Indicator */}
        {connectingFrom && (
          <div className="connection-indicator">
            <span>Click on a target node to create a connection, or press Escape to cancel</span>
          </div>
        )}

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="diagram-canvas"
          onClick={handleCanvasClick}
          onMouseDown={handlePanStart}
          onWheel={handleWheel}
          style={{
            cursor: isSpacePressed || isPanning ? 'grabbing' : activeTool !== 'select' ? 'crosshair' : connectingFrom ? 'pointer' : 'grab',
            overflow: 'hidden',
          }}
        >
          {/* Single container for both SVG and nodes - same transform */}
          <div
            className="canvas-transform-container"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '5000px',
              height: '5000px',
              transition: nodesAnimating ? 'transform 0.3s ease' : 'none',
            }}
          >
            {/* SVG for connections */}
            <svg
              className="connections-svg"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              <defs>
                <marker id="arrowhead-graph" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                </marker>
              </defs>
              {relationships.map(conn => {
                const { path, labelX, labelY } = getConnectionPath(conn);
                return (
                  <g key={conn.id}>
                    <path
                      d={path}
                      className={`connection-line ${selectedConnection === conn.id ? 'selected' : ''}`}
                      stroke={conn.color}
                      markerEnd="url(#arrowhead-graph)"
                      onClick={(e) => handleConnectionClick(e, conn.id)}
                      style={{ pointerEvents: 'stroke' }}
                    />
                    {conn.label && (
                      <g>
                    <rect
                      x={labelX - 30}
                      y={labelY - 8}
                      width={60}
                      height={16}
                      fill="transparent"
                      rx="4"
                      style={{ pointerEvents: 'none' }}
                    />
                        <text
                          x={labelX}
                          y={labelY + 4}
                          className="connection-label-text"
                          fill="var(--text)"
                          fontSize="10"
                          fontWeight="500"
                          textAnchor="middle"
                          style={{ pointerEvents: 'none' }}
                        >
                          {conn.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {filteredNodes.map((node, index) => (
              <div
                key={node.id}
                className={`diagram-node ${node.type} ${selectedNode === node.id ? 'selected' : ''} ${connectingFrom === node.id ? 'connecting-source' : ''} ${nodesAnimating ? 'animating' : ''}`}
                style={{
                  '--node-index': index,
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  height: node.height,
                  borderColor: node.color,
                  color: node.color, // For clip-path shapes that use currentColor
                  boxShadow: selectedNode === node.id ? `0 0 0 3px ${node.color}40` : undefined,
                  transition: nodesAnimating ? 'left 0.4s ease, top 0.4s ease' : 'box-shadow 0.15s ease',
                }}
                onClick={(e) => handleNodeClick(e, node.id)}
                onMouseDown={(e) => handleNodeDragStart(e, node.id)}
              >
                <div className="node-content">
                  {node.text}
                </div>

                {/* Connection handles */}
                <div className="connection-handle top" onClick={(e) => handleAddConnectedNode(e, node.id, 'top')}>+</div>
                <div className="connection-handle right" onClick={(e) => handleAddConnectedNode(e, node.id, 'right')}>+</div>
                <div className="connection-handle bottom" onClick={(e) => handleAddConnectedNode(e, node.id, 'bottom')}>+</div>
                <div className="connection-handle left" onClick={(e) => handleAddConnectedNode(e, node.id, 'left')}>+</div>
              </div>
            ))}
          </div>{/* End canvas-transform-container */}

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="empty-canvas">
              <div className="empty-icon">🔗</div>
              <div className="empty-title">No nodes in the graph</div>
              <div className="empty-hint">Select a shape from the toolbar and click on the canvas to create your first node</div>
            </div>
          )}

          {/* Help text */}
          {nodes.length > 0 && !connectingFrom && (
            <div className="help-text">
              Tip: Scroll/drag to pan | Click + buttons to connect | Alt+drag to pan | Changes auto-save
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div className="graph-editor-properties">
        <h4 className="panel-title">
          {selectedNodeData ? 'Node Properties' : selectedConnectionData ? 'Connection Properties' : 'Properties'}
        </h4>

        {selectedNodeData ? (
          <>
            <div className="panel-section">
              <label className="panel-label">Name</label>
              <input
                type="text"
                className="panel-input"
                value={selectedNodeData.text}
                onChange={(e) => updateSelectedNode({ text: e.target.value })}
              />
            </div>

            <div className="panel-section">
              <label className="panel-label">Type</label>
              <div className="panel-value">{selectedNodeData.nodeTypeName || 'Unknown'}</div>
            </div>

            <div className="panel-section">
              <label className="panel-label">Layer</label>
              <div className="panel-value">{selectedNodeData.layer || '-'}</div>
            </div>

            <div className="panel-section">
              <label className="panel-label">Description</label>
              <div className="panel-value" style={{ fontSize: 12 }}>{selectedNodeData.description || '-'}</div>
            </div>

            <div className="panel-section">
              <label className="panel-label">Weight</label>
              <div className="panel-value">{selectedNodeData.weight ?? '-'}</div>
            </div>

            {/* Attributes */}
            {selectedNodeData.attributes && Object.keys(selectedNodeData.attributes).length > 0 && (
              <div className="panel-section">
                <label className="panel-label">Attributes</label>
                <div className="attributes-list">
                  {Object.entries(selectedNodeData.attributes).map(([key, value]) => (
                    <div key={key} className="attribute-item">
                      <span className="attr-key">{key}:</span>
                      <span className="attr-value">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            <div className="panel-section" style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={openEditDialog} style={{ flex: 1 }}>Edit All</button>
              <button className="btn-danger" onClick={deleteSelectedNode}>Delete</button>
            </div>

            {/* Connections for selected node */}
            <div className="panel-section" style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="panel-label" style={{ margin: 0 }}>
                  Connections ({relationships.filter(r => r.from === selectedNode || r.to === selectedNode).length})
                </label>
                <button
                  className="btn-small"
                  onClick={() => setShowAddRelPanel(p => !p)}
                  style={{ fontSize: 11, padding: '3px 8px' }}
                >
                  {showAddRelPanel ? '✕' : '+ Add'}
                </button>
              </div>

              {/* Add relationship panel */}
              {showAddRelPanel && (
                <div style={{
                  background: 'var(--bg-alt)',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10,
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Direction
                    </label>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className={`tool-btn ${newRelDirection === 'out' ? 'active' : ''}`}
                        onClick={() => setNewRelDirection('out')}
                        style={{ flex: 1, fontSize: 11 }}
                        title="This node → Target"
                      >
                        → Out
                      </button>
                      <button
                        className={`tool-btn ${newRelDirection === 'in' ? 'active' : ''}`}
                        onClick={() => setNewRelDirection('in')}
                        style={{ flex: 1, fontSize: 11 }}
                        title="Target → This node"
                      >
                        ← In
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Relationship Type
                    </label>
                    <select
                      value={newRelType}
                      onChange={(e) => setNewRelType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        background: 'var(--panel)',
                        color: 'var(--text)',
                        fontSize: 12,
                      }}
                    >
                      <option value="">Select type...</option>
                      {relationshipTypes.map(t => (
                        <option key={t.id || t.name} value={t.name}>
                          {t.label || t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: 8, position: 'relative' }}>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Target Node (search)
                    </label>
                    <input
                      type="text"
                      value={newRelTarget}
                      onChange={(e) => handleNodeSearch(e.target.value)}
                      placeholder="Type to search nodes..."
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 6,
                        border: '1px solid var(--border)',
                        background: 'var(--panel)',
                        color: 'var(--text)',
                        fontSize: 12,
                      }}
                    />
                    {nodeSearchResults.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'var(--panel)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        maxHeight: 150,
                        overflowY: 'auto',
                        zIndex: 100,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}>
                        {nodeSearchResults.map(n => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              handleAddRelationshipFromPanel(n.id);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              width: '100%',
                              padding: '8px 10px',
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text)',
                              fontSize: 12,
                              textAlign: 'left',
                              cursor: 'pointer',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-soft)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <span style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: n.color || '#6b7280',
                              flexShrink: 0,
                            }} />
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {n.text || n.name}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                              {n.nodeTypeName}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="element-list" style={{ maxHeight: 150 }}>
                {relationships.filter(r => r.from === selectedNode || r.to === selectedNode).map(r => {
                  const otherNodeId = r.from === selectedNode ? r.to : r.from;
                  const otherNode = nodes.find(n => n.id === otherNodeId);
                  const direction = r.from === selectedNode ? '→' : '←';
                  return (
                    <div
                      key={r.id}
                      className={`element-item ${selectedConnection === r.id ? 'active' : ''}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <div
                        style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', overflow: 'hidden' }}
                        onClick={() => { setSelectedConnection(r.id); setSelectedNode(null); }}
                      >
                        <span style={{ fontSize: 11, color: direction === '→' ? '#22c55e' : '#3b82f6' }}>{direction}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.label}</span>
                        <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {otherNode?.text || 'Unknown'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteRelationship(r.id); }}
                        title="Delete relationship"
                        style={{
                          padding: '2px 6px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: 12,
                          borderRadius: 4,
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                {relationships.filter(r => r.from === selectedNode || r.to === selectedNode).length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, padding: 8 }}>No connections yet</p>
                )}
              </div>
            </div>
          </>
        ) : selectedConnectionData ? (
          <>
            <div className="panel-section">
              <label className="panel-label">Relationship Type</label>
              <div className="panel-value">{selectedConnectionData.label || 'RELATES_TO'}</div>
            </div>

            <div className="panel-section">
              <label className="panel-label">From</label>
              <div className="panel-value">{nodes.find(n => n.id === selectedConnectionData.from)?.text || 'Unknown'}</div>
            </div>

            <div className="panel-section">
              <label className="panel-label">To</label>
              <div className="panel-value">{nodes.find(n => n.id === selectedConnectionData.to)?.text || 'Unknown'}</div>
            </div>

            <div className="panel-section">
              <label className="panel-label">Line Style</label>
              <div className="shape-picker">
                <button
                  className={`shape-option ${selectedConnectionData.type === 'straight' ? 'active' : ''}`}
                  onClick={() => setRelationships(prev => prev.map(c => c.id === selectedConnection ? { ...c, type: 'straight' } : c))}
                >
                  ─
                </button>
                <button
                  className={`shape-option ${selectedConnectionData.type === 'curved' ? 'active' : ''}`}
                  onClick={() => setRelationships(prev => prev.map(c => c.id === selectedConnection ? { ...c, type: 'curved' } : c))}
                >
                  ⌒
                </button>
              </div>
            </div>

            <div className="panel-section">
              <button className="btn-danger" onClick={deleteSelectedConnection}>Delete Connection</button>
            </div>
          </>
        ) : (
          <p className="panel-hint">Select a node or connection to edit its properties</p>
        )}
      </div>

      {/* Node Type Dialog */}
      {showNodeTypeDialog && (
        <div className="modal-backdrop" onClick={() => setShowNodeTypeDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Select Node Type</h3>
            <div className="element-list" style={{ maxHeight: 300 }}>
              {nodeTypes.map(t => (
                <div
                  key={t.id}
                  className="element-item"
                  onClick={() => createNode(t.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="element-icon" style={{ background: t.color || '#6b7280', borderRadius: 4 }} />
                  <span>{t.label || t.name}</span>
                </div>
              ))}
              {nodeTypes.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>
                  No node types defined. Create node types in Settings first.
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowNodeTypeDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Relationship Type Dialog */}
      {showRelTypeDialog && (
        <div className="modal-backdrop" onClick={() => { setShowRelTypeDialog(false); setPendingConnection(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Select Relationship Type</h3>
            <div className="element-list" style={{ maxHeight: 300 }}>
              {relationshipTypes.map(t => (
                <div
                  key={t.id}
                  className="element-item"
                  onClick={() => createRelationship(t.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="element-icon" style={{ background: t.color || '#6b7280', borderRadius: 2, width: 20, height: 4 }} />
                  <span>{t.label || t.name}</span>
                </div>
              ))}
              {relationshipTypes.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>
                  No relationship types defined. Create relationship types in Settings first.
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => { setShowRelTypeDialog(false); setPendingConnection(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Node Dialog */}
      {showEditDialog && selectedNodeData && (
        <div className="modal-backdrop" onClick={() => setShowEditDialog(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h3>Edit Node</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Layer</label>
                  <input
                    type="text"
                    value={editForm.layer}
                    onChange={(e) => setEditForm(prev => ({ ...prev, layer: e.target.value }))}
                    placeholder="e.g., Business, Application"
                  />
                </div>
                <div className="form-group">
                  <label>Weight</label>
                  <input
                    type="number"
                    value={editForm.weight}
                    onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="0-100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this node..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={editForm.color || '#8b5cf6'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
                    style={{ height: 38 }}
                  />
                </div>
                <div className="form-group">
                  <label>Shape</label>
                  <select
                    value={editForm.shape}
                    onChange={(e) => setEditForm(prev => ({ ...prev, shape: e.target.value }))}
                  >
                    {SHAPES.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attributes Section */}
              <div className="form-group">
                <label>Attributes (Key-Value Pairs)</label>
                <div className="attributes-editor">
                  {Object.entries(editForm.attributes).map(([key, value]) => (
                    <div key={key} className="attribute-row">
                      <span className="attr-key">{key}</span>
                      <input
                        type="text"
                        value={String(value)}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          attributes: { ...prev.attributes, [key]: e.target.value }
                        }))}
                      />
                      <button
                        type="button"
                        className="attr-remove"
                        onClick={() => removeAttribute(key)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="attribute-add-row">
                    <input
                      type="text"
                      placeholder="Key"
                      value={newAttrKey}
                      onChange={(e) => setNewAttrKey(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={newAttrValue}
                      onChange={(e) => setNewAttrValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addAttribute()}
                    />
                    <button type="button" className="btn-small" onClick={addAttribute}>Add</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowEditDialog(false)}>Cancel</button>
              <button className="btn" onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Help Dialog */}
      {showInfoDialog && (
        <div className="modal-backdrop" onClick={() => setShowInfoDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Graph Editor Help</h3>
            <ul style={{ paddingLeft: 18, lineHeight: 1.8, fontSize: 13 }}>
              <li><strong>Select Mode:</strong> Click nodes to view/edit details, drag to reposition.</li>
              <li><strong>Add Node:</strong> Select a shape, click on canvas, choose node type.</li>
              <li><strong>Connect Nodes:</strong> Click the + button on a node, then click another node.</li>
              <li><strong>Pan Canvas:</strong> Alt+drag or middle-click drag. Use scroll wheel.</li>
              <li><strong>Edit All:</strong> Click "Edit All" to modify layer, description, attributes.</li>
              <li><strong>Delete:</strong> Select node/connection, press Delete or use the button.</li>
              <li><strong>Undo:</strong> Ctrl+Z or click Undo to reverse last action.</li>
              <li><strong>Schema:</strong> Use the gear icon to manage node and relationship types.</li>
              <li>All changes are automatically saved to Neo4j.</li>
            </ul>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowInfoDialog(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Type Management Dialog */}
      {showManageTypesDialog && (
        <div className="modal-backdrop" onClick={() => setShowManageTypesDialog(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h3>Manage Schema</h3>
            <div className="type-tabs">
              <button
                className={`type-tab ${typeManagementTab === 'node-types' ? 'active' : ''}`}
                onClick={() => setTypeManagementTab('node-types')}
              >
                Node Types ({nodeTypes.length})
              </button>
              <button
                className={`type-tab ${typeManagementTab === 'rel-types' ? 'active' : ''}`}
                onClick={() => setTypeManagementTab('rel-types')}
              >
                Relationship Types ({relationshipTypes.length})
              </button>
            </div>

            {typeManagementTab === 'node-types' && (
              <div className="type-list">
                {nodeTypes.map(t => (
                  <div key={t.id} className="type-item">
                    {editingNodeType?.id === t.id ? (
                      <div className="type-edit-form">
                        <div className="form-row">
                          <input
                            type="text"
                            placeholder="Name"
                            value={editingNodeType.name}
                            onChange={(e) => setEditingNodeType(prev => ({ ...prev, name: e.target.value }))}
                          />
                          <input
                            type="text"
                            placeholder="Label"
                            value={editingNodeType.label}
                            onChange={(e) => setEditingNodeType(prev => ({ ...prev, label: e.target.value }))}
                          />
                        </div>
                        <div className="form-row">
                          <input
                            type="color"
                            value={editingNodeType.color || '#8b5cf6'}
                            onChange={(e) => setEditingNodeType(prev => ({ ...prev, color: e.target.value }))}
                            style={{ width: 60, height: 32 }}
                          />
                          <input
                            type="text"
                            placeholder="Description"
                            value={editingNodeType.description || ''}
                            onChange={(e) => setEditingNodeType(prev => ({ ...prev, description: e.target.value }))}
                            style={{ flex: 1 }}
                          />
                        </div>
                        <div className="type-edit-actions">
                          <button className="btn-small" onClick={updateNodeType}>Save</button>
                          <button className="btn-secondary btn-small" onClick={() => setEditingNodeType(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="type-icon" style={{ background: t.color || '#6b7280' }} />
                        <div className="type-info">
                          <div className="type-name">{t.label || t.name}</div>
                          {t.description && <div className="type-desc">{t.description}</div>}
                        </div>
                        <div className="type-actions">
                          <button className="btn-icon" title="Edit" onClick={() => setEditingNodeType({ ...t })}>✎</button>
                          <button className="btn-icon btn-danger-icon" title="Delete" onClick={() => deleteNodeType(t.id)}>×</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {nodeTypes.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                    No node types defined yet
                  </p>
                )}
                <button className="btn add-type-btn" onClick={() => setShowAddNodeTypeDialog(true)}>
                  + Add Node Type
                </button>
              </div>
            )}

            {typeManagementTab === 'rel-types' && (
              <div className="type-list">
                {relationshipTypes.map(t => (
                  <div key={t.id} className="type-item">
                    {editingRelType?.id === t.id ? (
                      <div className="type-edit-form">
                        <div className="form-row">
                          <input
                            type="text"
                            placeholder="Name (e.g. RELATES_TO)"
                            value={editingRelType.name}
                            onChange={(e) => setEditingRelType(prev => ({ ...prev, name: e.target.value }))}
                          />
                          <input
                            type="text"
                            placeholder="Label"
                            value={editingRelType.label}
                            onChange={(e) => setEditingRelType(prev => ({ ...prev, label: e.target.value }))}
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Description"
                          value={editingRelType.description || ''}
                          onChange={(e) => setEditingRelType(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <div className="type-edit-actions">
                          <button className="btn-small" onClick={updateRelType}>Save</button>
                          <button className="btn-secondary btn-small" onClick={() => setEditingRelType(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="type-rel-icon">→</div>
                        <div className="type-info">
                          <div className="type-name">{t.label || t.name}</div>
                          <div className="type-code">{t.name}</div>
                          {t.description && <div className="type-desc">{t.description}</div>}
                        </div>
                        <div className="type-actions">
                          <button className="btn-icon" title="Edit" onClick={() => setEditingRelType({ ...t })}>✎</button>
                          <button className="btn-icon btn-danger-icon" title="Delete" onClick={() => deleteRelType(t.id)}>×</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {relationshipTypes.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                    No relationship types defined yet
                  </p>
                )}
                <button className="btn add-type-btn" onClick={() => setShowAddRelTypeDialog(true)}>
                  + Add Relationship Type
                </button>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowManageTypesDialog(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Node Type Dialog */}
      {showAddNodeTypeDialog && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }} onClick={() => setShowAddNodeTypeDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Node Type</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  placeholder="e.g. BusinessProcess"
                  value={newNodeTypeForm.name}
                  onChange={(e) => setNewNodeTypeForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  placeholder="e.g. Business Process (display name)"
                  value={newNodeTypeForm.label}
                  onChange={(e) => setNewNodeTypeForm(prev => ({ ...prev, label: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    value={newNodeTypeForm.color}
                    onChange={(e) => setNewNodeTypeForm(prev => ({ ...prev, color: e.target.value }))}
                    style={{ height: 38 }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional description..."
                  value={newNodeTypeForm.description}
                  onChange={(e) => setNewNodeTypeForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddNodeTypeDialog(false)}>Cancel</button>
              <button className="btn" onClick={createNodeType} disabled={!newNodeTypeForm.name.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Relationship Type Dialog */}
      {showAddRelTypeDialog && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }} onClick={() => setShowAddRelTypeDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Relationship Type</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  placeholder="e.g. RELATES_TO, DEPENDS_ON"
                  value={newRelTypeForm.name}
                  onChange={(e) => setNewRelTypeForm(prev => ({ ...prev, name: e.target.value }))}
                />
                <small style={{ color: 'var(--text-muted)' }}>Will be converted to UPPER_CASE</small>
              </div>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  placeholder="e.g. Relates To (display name)"
                  value={newRelTypeForm.label}
                  onChange={(e) => setNewRelTypeForm(prev => ({ ...prev, label: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional description..."
                  value={newRelTypeForm.description}
                  onChange={(e) => setNewRelTypeForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddRelTypeDialog(false)}>Cancel</button>
              <button className="btn" onClick={createRelType} disabled={!newRelTypeForm.name.trim()}>Create</button>
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
