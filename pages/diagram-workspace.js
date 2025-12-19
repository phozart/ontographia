// pages/diagram-workspace.js
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';
import GuidancePanel, { GuidanceToggle } from '../components/GuidancePanel';
import { DIAGRAM_GUIDANCE } from '../lib/studio-guidance';

// Generate unique comment ID
const generateCommentId = () => `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

// Mindmap node types
const SHAPES = [
  { id: 'central', name: 'Central Topic', icon: '⬤', width: 160, height: 80, defaultColor: '#008a7a' },
  { id: 'branch', name: 'Main Branch', icon: '◼', width: 120, height: 50, defaultColor: '#3b82f6' },
  { id: 'sub', name: 'Sub-Branch', icon: '▪', width: 100, height: 40, defaultColor: '#8b5cf6' },
  { id: 'note', name: 'Note', icon: '📝', width: 120, height: 60, defaultColor: '#f97316' },
];

// Generate unique label ID
const generateLabelId = () => `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Generate unique ID
const generateId = () => `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateConnectionId = () => `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const STORAGE_KEY = 'ontographia-diagrams-v2';

export default function DiagramWorkspacePage() {
  const { role, user } = useAuth();
  const { activeDomain } = useDomains();
  const canvasRef = useRef(null);

  // Diagram list state
  const [diagrams, setDiagrams] = useState([]);
  const [activeDiagramId, setActiveDiagramId] = useState(null);

  // Current diagram state
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [labels, setLabels] = useState([]);
  const [comments, setComments] = useState([]);
  const [diagramName, setDiagramName] = useState('Untitled Diagram');
  const [selectedLabel, setSelectedLabel] = useState(null);

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
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showGuidance, setShowGuidance] = useState(false);

  // Pan and zoom state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState(null); // { x, y, type, nodeId?, connectionId? }

  // Load diagrams from localStorage and restore last active diagram
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDiagrams(parsed);
        // Try to load last active diagram
        const lastActiveId = localStorage.getItem('diagram-workspace-last-active');
        const lastActive = lastActiveId ? parsed.find(d => d.id === lastActiveId) : null;
        if (lastActive) {
          loadDiagram(lastActive);
        } else if (parsed.length > 0) {
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
      labels,
      comments,
      updatedAt: Date.now(),
    };

    setDiagrams(prev => {
      const updated = prev.map(d => d.id === activeDiagramId ? updatedDiagram : d);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [activeDiagramId, diagramName, nodes, connections, labels, comments]);

  // Auto-save on changes
  useEffect(() => {
    if (activeDiagramId) {
      const timeout = setTimeout(saveDiagram, 500);
      return () => clearTimeout(timeout);
    }
  }, [nodes, connections, labels, comments, diagramName, saveDiagram]);

  // Load a diagram
  const loadDiagram = (diagram) => {
    setActiveDiagramId(diagram.id);
    setDiagramName(diagram.name);
    setNodes(diagram.nodes || []);
    setConnections(diagram.connections || []);
    setLabels(diagram.labels || []);
    setComments(diagram.comments || []);
    setSelectedNode(null);
    setSelectedConnection(null);
    setSelectedLabel(null);
    // Remember last active diagram
    localStorage.setItem('diagram-workspace-last-active', diagram.id);
  };

  // Create new diagram
  const createNewDiagram = () => {
    const newDiagram = {
      id: generateId(),
      name: newDiagramName || 'Untitled Diagram',
      nodes: [],
      connections: [],
      labels: [],
      comments: [],
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

  // Handle canvas click to add new node or text label
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

    // Handle text tool - creates a text annotation
    if (activeTool === 'text') {
      const newLabel = {
        id: generateLabelId(),
        x,
        y,
        text: 'Text label',
        fontSize: 14,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: activeColor || '#6b7280',
      };
      setLabels(prev => [...prev, newLabel]);
      setSelectedLabel(newLabel.id);
      setSelectedNode(null);
      setSelectedConnection(null);
      setActiveTool('select');
      return;
    }

    const shapeDef = SHAPES.find(s => s.id === activeTool);
    if (shapeDef) {
      const newNode = {
        id: generateId(),
        type: activeTool,
        x: x - shapeDef.width / 2,
        y: y - shapeDef.height / 2,
        width: shapeDef.width,
        height: shapeDef.height,
        text: shapeDef.name,
        color: activeColor || shapeDef.defaultColor,
      };
      setNodes(prev => [...prev, newNode]);
      setSelectedNode(newNode.id);
      setSelectedLabel(null);
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
    setSelectedLabel(null);
  }, []);

  // Handle label click
  const handleLabelClick = useCallback((e, labelId) => {
    e.stopPropagation();
    setSelectedLabel(labelId);
    setSelectedNode(null);
    setSelectedConnection(null);
  }, []);

  // Update selected label
  const updateSelectedLabel = useCallback((updates) => {
    if (!selectedLabel) return;
    setLabels(prev => prev.map(label =>
      label.id === selectedLabel ? { ...label, ...updates } : label
    ));
  }, [selectedLabel]);

  // Delete selected label
  const deleteSelectedLabel = useCallback(() => {
    if (!selectedLabel) return;
    setLabels(prev => prev.filter(l => l.id !== selectedLabel));
    setSelectedLabel(null);
  }, [selectedLabel]);

  // Handle label drag
  const [draggingLabel, setDraggingLabel] = useState(null);
  const [labelDragOffset, setLabelDragOffset] = useState({ x: 0, y: 0 });

  const handleLabelDragStart = useCallback((e, labelId) => {
    e.stopPropagation();
    const label = labels.find(l => l.id === labelId);
    if (!label) return;

    const rect = canvasRef.current.getBoundingClientRect();
    setLabelDragOffset({
      x: e.clientX - rect.left - label.x,
      y: e.clientY - rect.top - label.y,
    });
    setDraggingLabel(labelId);
    setSelectedLabel(labelId);
  }, [labels]);

  const handleLabelDrag = useCallback((e) => {
    if (!draggingLabel) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - labelDragOffset.x;
    const y = e.clientY - rect.top - labelDragOffset.y;

    setLabels(prev => prev.map(label =>
      label.id === draggingLabel
        ? { ...label, x: Math.max(0, x), y: Math.max(0, y) }
        : label
    ));
  }, [draggingLabel, labelDragOffset]);

  const handleLabelDragEnd = useCallback(() => {
    setDraggingLabel(null);
  }, []);

  // Attach label drag listeners
  useEffect(() => {
    if (draggingLabel) {
      window.addEventListener('mousemove', handleLabelDrag);
      window.addEventListener('mouseup', handleLabelDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleLabelDrag);
        window.removeEventListener('mouseup', handleLabelDragEnd);
      };
    }
  }, [draggingLabel, handleLabelDrag, handleLabelDragEnd]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      setNodes([]);
      setConnections([]);
      setLabels([]);
      setSelectedNode(null);
      setSelectedConnection(null);
      setSelectedLabel(null);
    }
  }, []);

  // Get current user info for comments
  const currentUserName = user?.name || user?.email || 'Anonymous';

  // Add a new comment
  const addComment = useCallback((text, parentId = null) => {
    if (!text.trim()) return;

    const newComment = {
      id: generateCommentId(),
      text: text.trim(),
      author: currentUserName,
      createdAt: Date.now(),
      parentId,
      resolved: false,
    };

    setComments(prev => [...prev, newComment]);
    setNewCommentText('');
    setReplyingTo(null);
  }, [currentUserName]);

  // Delete a comment
  const deleteComment = useCallback((commentId) => {
    setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId));
  }, []);

  // Toggle comment resolved
  const toggleResolveComment = useCallback((commentId) => {
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, resolved: !c.resolved } : c
    ));
  }, []);

  // Parse @mentions in comment text
  const parseCommentText = useCallback((text) => {
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'mention', content: match[1] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts;
  }, []);

  // Get top-level comments and their replies
  const organizedComments = useMemo(() => {
    const topLevel = comments.filter(c => !c.parentId);
    return topLevel.map(comment => ({
      ...comment,
      replies: comments.filter(c => c.parentId === comment.id)
    }));
  }, [comments]);

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  // Load template - Mindmap focused templates
  const loadTemplate = useCallback((template) => {
    let newNodes = [];
    let newConnections = [];
    const baseX = 300;
    const baseY = 200;

    if (template === 'radial') {
      // Radial mindmap - central topic with branches radiating outward
      newNodes = [
        { id: 'rm-1', type: 'central', x: baseX, y: baseY, width: 160, height: 80, text: 'Central Topic', color: '#008a7a' },
        { id: 'rm-2', type: 'branch', x: baseX - 200, y: baseY - 80, width: 120, height: 50, text: 'Branch 1', color: '#3b82f6' },
        { id: 'rm-3', type: 'branch', x: baseX + 200, y: baseY - 80, width: 120, height: 50, text: 'Branch 2', color: '#8b5cf6' },
        { id: 'rm-4', type: 'branch', x: baseX - 200, y: baseY + 100, width: 120, height: 50, text: 'Branch 3', color: '#22c55e' },
        { id: 'rm-5', type: 'branch', x: baseX + 200, y: baseY + 100, width: 120, height: 50, text: 'Branch 4', color: '#f97316' },
        { id: 'rm-6', type: 'sub', x: baseX - 340, y: baseY - 120, width: 100, height: 40, text: 'Sub 1.1', color: '#3b82f6' },
        { id: 'rm-7', type: 'sub', x: baseX - 340, y: baseY - 60, width: 100, height: 40, text: 'Sub 1.2', color: '#3b82f6' },
        { id: 'rm-8', type: 'sub', x: baseX + 340, y: baseY - 120, width: 100, height: 40, text: 'Sub 2.1', color: '#8b5cf6' },
      ];
      newConnections = [
        { id: 'rmc-1', from: 'rm-1', to: 'rm-2', fromDirection: 'left', toDirection: 'right', color: '#3b82f6', type: 'curved' },
        { id: 'rmc-2', from: 'rm-1', to: 'rm-3', fromDirection: 'right', toDirection: 'left', color: '#8b5cf6', type: 'curved' },
        { id: 'rmc-3', from: 'rm-1', to: 'rm-4', fromDirection: 'left', toDirection: 'right', color: '#22c55e', type: 'curved' },
        { id: 'rmc-4', from: 'rm-1', to: 'rm-5', fromDirection: 'right', toDirection: 'left', color: '#f97316', type: 'curved' },
        { id: 'rmc-5', from: 'rm-2', to: 'rm-6', fromDirection: 'left', toDirection: 'right', color: '#3b82f6', type: 'curved' },
        { id: 'rmc-6', from: 'rm-2', to: 'rm-7', fromDirection: 'left', toDirection: 'right', color: '#3b82f6', type: 'curved' },
        { id: 'rmc-7', from: 'rm-3', to: 'rm-8', fromDirection: 'right', toDirection: 'left', color: '#8b5cf6', type: 'curved' },
      ];
    } else if (template === 'hierarchical') {
      // Hierarchical mindmap - top-down tree structure
      newNodes = [
        { id: 'hm-1', type: 'central', x: baseX, y: baseY - 100, width: 160, height: 80, text: 'Main Topic', color: '#008a7a' },
        { id: 'hm-2', type: 'branch', x: baseX - 180, y: baseY + 30, width: 120, height: 50, text: 'Category A', color: '#3b82f6' },
        { id: 'hm-3', type: 'branch', x: baseX + 60, y: baseY + 30, width: 120, height: 50, text: 'Category B', color: '#8b5cf6' },
        { id: 'hm-4', type: 'sub', x: baseX - 260, y: baseY + 130, width: 100, height: 40, text: 'Item A.1', color: '#3b82f6' },
        { id: 'hm-5', type: 'sub', x: baseX - 140, y: baseY + 130, width: 100, height: 40, text: 'Item A.2', color: '#3b82f6' },
        { id: 'hm-6', type: 'sub', x: baseX + 20, y: baseY + 130, width: 100, height: 40, text: 'Item B.1', color: '#8b5cf6' },
        { id: 'hm-7', type: 'sub', x: baseX + 140, y: baseY + 130, width: 100, height: 40, text: 'Item B.2', color: '#8b5cf6' },
        { id: 'hm-8', type: 'note', x: baseX + 260, y: baseY - 100, width: 120, height: 60, text: 'Notes here...', color: '#f97316' },
      ];
      newConnections = [
        { id: 'hmc-1', from: 'hm-1', to: 'hm-2', fromDirection: 'bottom', toDirection: 'top', color: '#3b82f6', type: 'curved' },
        { id: 'hmc-2', from: 'hm-1', to: 'hm-3', fromDirection: 'bottom', toDirection: 'top', color: '#8b5cf6', type: 'curved' },
        { id: 'hmc-3', from: 'hm-2', to: 'hm-4', fromDirection: 'bottom', toDirection: 'top', color: '#3b82f6', type: 'curved' },
        { id: 'hmc-4', from: 'hm-2', to: 'hm-5', fromDirection: 'bottom', toDirection: 'top', color: '#3b82f6', type: 'curved' },
        { id: 'hmc-5', from: 'hm-3', to: 'hm-6', fromDirection: 'bottom', toDirection: 'top', color: '#8b5cf6', type: 'curved' },
        { id: 'hmc-6', from: 'hm-3', to: 'hm-7', fromDirection: 'bottom', toDirection: 'top', color: '#8b5cf6', type: 'curved' },
      ];
    } else if (template === 'brainstorm') {
      // Brainstorm - free-form with notes
      newNodes = [
        { id: 'bs-1', type: 'central', x: baseX, y: baseY, width: 160, height: 80, text: 'Problem Statement', color: '#008a7a' },
        { id: 'bs-2', type: 'branch', x: baseX - 250, y: baseY - 50, width: 120, height: 50, text: 'Idea 1', color: '#3b82f6' },
        { id: 'bs-3', type: 'branch', x: baseX + 230, y: baseY - 80, width: 120, height: 50, text: 'Idea 2', color: '#8b5cf6' },
        { id: 'bs-4', type: 'branch', x: baseX - 220, y: baseY + 100, width: 120, height: 50, text: 'Idea 3', color: '#22c55e' },
        { id: 'bs-5', type: 'branch', x: baseX + 200, y: baseY + 120, width: 120, height: 50, text: 'Idea 4', color: '#ec4899' },
        { id: 'bs-6', type: 'note', x: baseX - 380, y: baseY - 100, width: 120, height: 60, text: 'Research needed', color: '#f97316' },
        { id: 'bs-7', type: 'note', x: baseX + 360, y: baseY - 30, width: 120, height: 60, text: 'Priority: High', color: '#ef4444' },
        { id: 'bs-8', type: 'sub', x: baseX - 350, y: baseY + 50, width: 100, height: 40, text: 'Detail 3.1', color: '#22c55e' },
      ];
      newConnections = [
        { id: 'bsc-1', from: 'bs-1', to: 'bs-2', fromDirection: 'left', toDirection: 'right', color: '#3b82f6', type: 'curved' },
        { id: 'bsc-2', from: 'bs-1', to: 'bs-3', fromDirection: 'right', toDirection: 'left', color: '#8b5cf6', type: 'curved' },
        { id: 'bsc-3', from: 'bs-1', to: 'bs-4', fromDirection: 'left', toDirection: 'right', color: '#22c55e', type: 'curved' },
        { id: 'bsc-4', from: 'bs-1', to: 'bs-5', fromDirection: 'right', toDirection: 'left', color: '#ec4899', type: 'curved' },
        { id: 'bsc-5', from: 'bs-2', to: 'bs-6', fromDirection: 'left', toDirection: 'right', color: '#f97316', type: 'curved' },
        { id: 'bsc-6', from: 'bs-3', to: 'bs-7', fromDirection: 'right', toDirection: 'left', color: '#ef4444', type: 'curved' },
        { id: 'bsc-7', from: 'bs-4', to: 'bs-8', fromDirection: 'left', toDirection: 'right', color: '#22c55e', type: 'curved' },
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
      // Skip if typing in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Ctrl/Cmd+S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDiagram();
        return;
      }

      // Delete/Backspace = Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedNode) {
          deleteSelectedNode();
        } else if (selectedConnection) {
          deleteSelectedConnection();
        } else if (selectedLabel) {
          deleteSelectedLabel();
        }
        return;
      }

      // Escape = Deselect
      if (e.key === 'Escape') {
        setSelectedNode(null);
        setSelectedConnection(null);
        setSelectedLabel(null);
        setConnectingFrom(null);
        setActiveTool('select');
        setContextMenu(null);
        return;
      }

      // Tool shortcuts (lowercase keys only when not holding Ctrl/Cmd)
      if (!e.ctrlKey && !e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'v') { setActiveTool('select'); return; }
        if (key === 't') { setActiveTool('text'); return; }
        if (key === 'c') { setActiveTool('central'); return; }
        if (key === 'b') { setActiveTool('branch'); return; }
        if (key === 's') { setActiveTool('sub'); return; }
        if (key === 'n') { setActiveTool('note'); return; }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedConnection, selectedLabel, deleteSelectedNode, deleteSelectedConnection, deleteSelectedLabel, saveDiagram]);

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
  const selectedLabelData = labels.find(l => l.id === selectedLabel);

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
          <h4>Mindmap Templates</h4>
          <div className="template-grid">
            <button className="template-btn" onClick={() => loadTemplate('radial')}>
              <span className="template-icon">🎯</span>
              <span>Radial</span>
            </button>
            <button className="template-btn" onClick={() => loadTemplate('hierarchical')}>
              <span className="template-icon">🌲</span>
              <span>Hierarchical</span>
            </button>
            <button className="template-btn" onClick={() => loadTemplate('brainstorm')}>
              <span className="template-icon">💡</span>
              <span>Brainstorm</span>
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
            <button
              className={`tool-btn ${activeTool === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTool('text')}
              title="Text Label (T)"
            >
              T
            </button>
          </div>

          <div className="toolbar-group">
            <span className="toolbar-label">Mindmap</span>
            {SHAPES.map(shape => (
              <button
                key={shape.id}
                className={`tool-btn ${activeTool === shape.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTool(shape.id);
                  setActiveColor(shape.defaultColor);
                }}
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

          <div className="toolbar-group" style={{ marginLeft: 'auto', borderRight: 'none' }}>
            <button
              className={`tool-btn ${showCommentsPanel ? 'active' : ''}`}
              onClick={() => setShowCommentsPanel(!showCommentsPanel)}
              title="Toggle comments"
              style={{ position: 'relative' }}
            >
              💬
              {comments.length > 0 && (
                <span className="comment-badge">{comments.length}</span>
              )}
            </button>
            <GuidanceToggle
              active={showGuidance}
              onClick={() => setShowGuidance(!showGuidance)}
            />
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

          {/* Text Labels */}
          {labels.map(label => (
            <div
              key={label.id}
              className={`diagram-label ${selectedLabel === label.id ? 'selected' : ''}`}
              style={{
                left: label.x,
                top: label.y,
                fontSize: label.fontSize,
                fontWeight: label.fontWeight,
                fontStyle: label.fontStyle,
                color: label.color,
              }}
              onClick={(e) => handleLabelClick(e, label.id)}
              onMouseDown={(e) => handleLabelDragStart(e, label.id)}
            >
              {selectedLabel === label.id ? (
                <input
                  type="text"
                  className="label-input"
                  value={label.text}
                  onChange={(e) => updateSelectedLabel({ text: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  autoFocus
                  style={{
                    fontSize: label.fontSize,
                    fontWeight: label.fontWeight,
                    fontStyle: label.fontStyle,
                    color: label.color,
                  }}
                />
              ) : (
                label.text
              )}
            </div>
          ))}

          {/* Empty state */}
          {nodes.length === 0 && labels.length === 0 && activeDiagramId && (
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
          {(nodes.length > 0 || labels.length > 0) && (
            <div className="help-text">
              Tip: Click the + buttons on nodes to quickly add connected nodes. Use T to add text labels. Drag canvas to pan, scroll to pan, pinch to zoom.
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
                  <button onClick={() => { setActiveTool('central'); setContextMenu(null); }}>
                    <span className="context-icon">⬤</span> Add Central Topic
                  </button>
                  <button onClick={() => { setActiveTool('branch'); setContextMenu(null); }}>
                    <span className="context-icon">◼</span> Add Main Branch
                  </button>
                  <button onClick={() => { setActiveTool('sub'); setContextMenu(null); }}>
                    <span className="context-icon">▪</span> Add Sub-Branch
                  </button>
                  <button onClick={() => { setActiveTool('note'); setContextMenu(null); }}>
                    <span className="context-icon">📝</span> Add Note
                  </button>
                  <div className="context-divider" />
                  <button onClick={() => { loadTemplate('radial'); setContextMenu(null); }}>
                    <span className="context-icon">🎯</span> Radial Template
                  </button>
                  <button onClick={() => { loadTemplate('hierarchical'); setContextMenu(null); }}>
                    <span className="context-icon">🌲</span> Hierarchical Template
                  </button>
                  <button onClick={() => { loadTemplate('brainstorm'); setContextMenu(null); }}>
                    <span className="context-icon">💡</span> Brainstorm Template
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
          {selectedNodeData ? 'Node Properties' : selectedConnectionData ? 'Connection Properties' : selectedLabelData ? 'Text Label Properties' : 'Properties'}
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
              <label className="panel-label">Size</label>
              <div className="size-controls">
                <div className="size-input-group">
                  <label>W</label>
                  <input
                    type="number"
                    min="40"
                    max="300"
                    value={selectedNodeData.width || 100}
                    onChange={e => updateSelectedNode({ width: parseInt(e.target.value) || 100 })}
                  />
                </div>
                <span className="size-separator">×</span>
                <div className="size-input-group">
                  <label>H</label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    value={selectedNodeData.height || 60}
                    onChange={e => updateSelectedNode({ height: parseInt(e.target.value) || 60 })}
                  />
                </div>
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
        ) : selectedLabelData ? (
          <>
            <div className="panel-section">
              <label className="panel-label">Text</label>
              <input
                type="text"
                className="panel-input"
                value={selectedLabelData.text}
                onChange={(e) => updateSelectedLabel({ text: e.target.value })}
              />
            </div>

            <div className="panel-section">
              <label className="panel-label">Font Size</label>
              <select
                className="panel-select"
                value={selectedLabelData.fontSize}
                onChange={(e) => updateSelectedLabel({ fontSize: parseInt(e.target.value) })}
              >
                <option value="10">10px</option>
                <option value="12">12px</option>
                <option value="14">14px</option>
                <option value="16">16px</option>
                <option value="18">18px</option>
                <option value="20">20px</option>
                <option value="24">24px</option>
                <option value="28">28px</option>
                <option value="32">32px</option>
              </select>
            </div>

            <div className="panel-section">
              <label className="panel-label">Style</label>
              <div className="shape-picker">
                <button
                  className={`shape-option ${selectedLabelData.fontWeight === 'bold' ? 'active' : ''}`}
                  onClick={() => updateSelectedLabel({ fontWeight: selectedLabelData.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  title="Bold"
                >
                  B
                </button>
                <button
                  className={`shape-option ${selectedLabelData.fontStyle === 'italic' ? 'active' : ''}`}
                  onClick={() => updateSelectedLabel({ fontStyle: selectedLabelData.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  title="Italic"
                  style={{ fontStyle: 'italic' }}
                >
                  I
                </button>
              </div>
            </div>

            <div className="panel-section">
              <label className="panel-label">Color</label>
              <div className="color-picker">
                {COLORS.map(color => (
                  <button
                    key={color.id}
                    className={`color-btn ${selectedLabelData.color === color.value ? 'active' : ''}`}
                    style={{ background: color.value }}
                    onClick={() => updateSelectedLabel({ color: color.value })}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="panel-section">
              <button className="btn-danger" onClick={deleteSelectedLabel}>Delete Label</button>
            </div>
          </>
        ) : (
          <p className="panel-hint">Select a node, connection, or text label to edit its properties</p>
        )}

        {/* Elements List */}
        <div className="panel-section" style={{ marginTop: 24 }}>
          <label className="panel-label">Elements ({nodes.length + labels.length})</label>
          <div className="element-list">
            {nodes.map(node => (
              <div
                key={node.id}
                className={`element-item ${selectedNode === node.id ? 'active' : ''}`}
                onClick={() => { setSelectedNode(node.id); setSelectedLabel(null); }}
              >
                <div className="element-icon" style={{
                  background: node.color,
                  borderRadius: node.type === 'central' ? '8px' : node.type === 'note' ? '4px 12px 4px 12px' : '4px',
                  width: node.type === 'central' ? '18px' : node.type === 'sub' ? '10px' : '14px',
                  height: node.type === 'central' ? '12px' : node.type === 'sub' ? '8px' : '10px',
                }} />
                <span>{node.text}</span>
              </div>
            ))}
            {labels.map(label => (
              <div
                key={label.id}
                className={`element-item ${selectedLabel === label.id ? 'active' : ''}`}
                onClick={() => { setSelectedLabel(label.id); setSelectedNode(null); }}
              >
                <div className="element-icon element-icon-text" style={{ color: label.color }}>
                  T
                </div>
                <span>{label.text}</span>
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

      {/* Comments Panel */}
      {showCommentsPanel && (
        <div className="comments-panel">
          <div className="comments-header">
            <h4>Comments</h4>
            <button className="comments-close" onClick={() => setShowCommentsPanel(false)}>×</button>
          </div>

          <div className="comments-list">
            {organizedComments.length === 0 ? (
              <div className="comments-empty">
                <span className="comments-empty-icon">💬</span>
                <p>No comments yet</p>
                <p className="comments-empty-hint">Add a comment to start a discussion</p>
              </div>
            ) : (
              organizedComments.map(comment => (
                <div key={comment.id} className={`comment-thread ${comment.resolved ? 'resolved' : ''}`}>
                  <div className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-time">{formatTime(comment.createdAt)}</span>
                    </div>
                    <div className="comment-body">
                      {parseCommentText(comment.text).map((part, i) =>
                        part.type === 'mention' ? (
                          <span key={i} className="comment-mention">@{part.content}</span>
                        ) : (
                          <span key={i}>{part.content}</span>
                        )
                      )}
                    </div>
                    <div className="comment-actions">
                      <button onClick={() => setReplyingTo(comment.id)}>Reply</button>
                      <button onClick={() => toggleResolveComment(comment.id)}>
                        {comment.resolved ? 'Reopen' : 'Resolve'}
                      </button>
                      <button onClick={() => deleteComment(comment.id)}>Delete</button>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="comment-reply">
                      <div className="comment-header">
                        <span className="comment-author">{reply.author}</span>
                        <span className="comment-time">{formatTime(reply.createdAt)}</span>
                      </div>
                      <div className="comment-body">
                        {parseCommentText(reply.text).map((part, i) =>
                          part.type === 'mention' ? (
                            <span key={i} className="comment-mention">@{part.content}</span>
                          ) : (
                            <span key={i}>{part.content}</span>
                          )
                        )}
                      </div>
                      <div className="comment-actions">
                        <button onClick={() => deleteComment(reply.id)}>Delete</button>
                      </div>
                    </div>
                  ))}

                  {/* Reply input */}
                  {replyingTo === comment.id && (
                    <div className="comment-reply-input">
                      <input
                        type="text"
                        placeholder="Write a reply... Use @name to mention"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newCommentText.trim()) {
                            addComment(newCommentText, comment.id);
                          }
                          if (e.key === 'Escape') {
                            setReplyingTo(null);
                            setNewCommentText('');
                          }
                        }}
                        autoFocus
                      />
                      <div className="comment-reply-actions">
                        <button className="btn-small" onClick={() => { setReplyingTo(null); setNewCommentText(''); }}>Cancel</button>
                        <button className="btn-small btn" onClick={() => addComment(newCommentText, comment.id)}>Reply</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* New comment input */}
          <div className="comment-input-container">
            <input
              type="text"
              className="comment-input"
              placeholder="Add a comment... Use @name to tag users"
              value={replyingTo ? '' : newCommentText}
              onChange={(e) => !replyingTo && setNewCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCommentText.trim() && !replyingTo) {
                  addComment(newCommentText);
                }
              }}
              disabled={!!replyingTo}
            />
            <button
              className="btn comment-submit"
              onClick={() => addComment(newCommentText)}
              disabled={!newCommentText.trim() || !!replyingTo}
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Guidance Panel */}
      {showGuidance && (
        <div className="diagram-guidance-panel" style={{
          width: 320,
          minWidth: 320,
          height: '100%',
          borderLeft: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <GuidancePanel
            title="Diagram Guide"
            guidance={DIAGRAM_GUIDANCE}
            activeView="default"
            onClose={() => setShowGuidance(false)}
          />
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
