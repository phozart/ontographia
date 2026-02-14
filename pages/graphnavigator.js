// pages/graphnavigator.js
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import nextDynamic from 'next/dynamic';
import NodeDetailPanel from '../components/NodeDetailPanel';
import CommandPalette from '../components/CommandPalette';
import { useFilter } from '../components/FilterContext';
import { useAuth } from '../components/AuthContext';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
const TooltipWrapper = ({ title, children }) => (
  <Tooltip title={title}>
    <span className="toolbar-tooltip-span">{children}</span>
  </Tooltip>
);
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SettingsIcon from '@mui/icons-material/Settings';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RouteIcon from '@mui/icons-material/Route';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { LogoSpinner } from '../components/Logo';
import { useDomains } from '../components/DomainContext';
import BulkImportExport from '../components/BulkImportExport';
import PathFinder from '../components/PathFinder';

const GraphView = nextDynamic(() => import('../components/GraphView'), {
  ssr: false,
});

// Colors for node types (teal, blue, amber, rose, red, orange, yellow, green, cyan, slate)
const TYPE_COLORS = [
  '#00d4aa', '#0ea5e9', '#f59e0b', '#f472b6', '#ef4444',
  '#f97316', '#84cc16', '#22c55e', '#06b6d4', '#64748b',
];

export default function GraphNavigatorPage({ showToolbar = true }) {
  const router = useRouter();
  const { user, role } = useAuth();
  const readOnly = role !== 'admin';

  // Detect embed mode from URL query parameter
  const isEmbedded = router.query.embed === 'true';

  // Auth headers for API calls
  const getAuthHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);
  const { typeFilters, setTypeFilters } = useFilter();

  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createSignal, setCreateSignal] = useState(0);
  const [editSignal, setEditSignal] = useState(0);
  const [relationshipSignal, setRelationshipSignal] = useState(0);
  const [nodeTypes, setNodeTypes] = useState([]);
  const [relationshipTypes, setRelationshipTypes] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [rels, setRels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [nodeQuery, setNodeQuery] = useState('');
  const [highlightedIds, setHighlightedIds] = useState([]);
  const [focusNodeId, setFocusNodeId] = useState(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { activeDomain, activeDomainObj } = useDomains();

  // Global keyboard shortcut for command palette
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // New state for enhanced features
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [showTypeManager, setShowTypeManager] = useState(false);
  const [typeManagerTab, setTypeManagerTab] = useState('node-types');
  const [contextMenu, setContextMenu] = useState(null); // { type, position, target }

  // Quick create form state
  const [quickCreateForm, setQuickCreateForm] = useState({
    name: '',
    typeId: '',
    description: '',
  });

  // Type management form state
  const [newNodeTypeForm, setNewNodeTypeForm] = useState({ name: '', label: '', color: '#00d4aa', shape: 'ellipse', description: '' });
  const [newRelTypeForm, setNewRelTypeForm] = useState({ name: '', label: '', description: '' });
  const [editingNodeType, setEditingNodeType] = useState(null);
  const [editingRelType, setEditingRelType] = useState(null);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showPathFinder, setShowPathFinder] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const cyRef = useRef(null);

  const domainMatch = useMemo(() => {
    const activeName = activeDomainObj?.name;
    const active = activeDomain;
    return (entity) => {
      // No active domain filter - accept all
      if (!active) return true;
      if (!entity) return false;
      const val =
        entity.domain ??
        entity.domainId ??
        entity.domainName ??
        entity.workspace ??
        entity.workspaceId;
      // If node has no domain, accept it (server already filtered)
      if (val === undefined || val === null) return true;
      return String(val) === String(active) || (activeName && String(val) === String(activeName));
    };
  }, [activeDomain, activeDomainObj?.name]);

  function handleNodeClick(node) {
    setSelectedNode(node);
    setSelectedEdge(null);
    setDetailsOpen(true);
    setContextMenu(null);
  }

  function handleEdgeClick(edge) {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setDetailsOpen(false);
    setContextMenu(null);
  }

  function handleDataChanged() {
    setReloadKey(k => k + 1);
    loadData();
  }

  function clearSelection() {
    setSelectedNode(null);
    setSelectedEdge(null);
    setDetailsOpen(false);
    setContextMenu(null);
  }

  // Context menu handler
  function handleContextMenu({ type, position, target }) {
    setContextMenu({ type, position, target });
  }

  // Close context menu
  function closeContextMenu() {
    setContextMenu(null);
  }

  // Context menu actions
  function handleContextMenuAction(action) {
    const cy = cyRef.current;
    closeContextMenu();

    switch (action) {
      case 'create-node':
        setQuickCreateOpen(true);
        setQuickCreateForm(prev => ({ ...prev, typeId: nodeTypes[0]?.id || '' }));
        break;
      case 'zoom-in':
        if (cy) cy.zoom({ level: cy.zoom() * 1.3, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
        break;
      case 'zoom-out':
        if (cy) cy.zoom({ level: cy.zoom() / 1.3, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
        break;
      case 'fit-view':
        if (cy) cy.fit(cy.nodes(), 60);
        break;
      case 'run-layout':
        if (cy) cy.layout({ name: 'cose', animate: true, animationDuration: 500 }).run();
        break;
      case 'refresh':
        setReloadKey(k => k + 1);
        break;
      case 'edit-node':
        if (contextMenu?.target) {
          setSelectedNode(contextMenu.target);
          setSelectedEdge(null);
          setDetailsOpen(true);
          setEditSignal(s => s + 1);
        }
        break;
      case 'delete-node':
        if (contextMenu?.target?.id) {
          if (confirm('Delete this node and all its relationships?')) {
            fetch(`/api/nodes/${encodeURIComponent(contextMenu.target.id)}`, { method: 'DELETE', headers: getAuthHeaders() })
              .then(res => {
                if (res.ok) {
                  handleDataChanged();
                  clearSelection();
                } else {
                  alert('Failed to delete node');
                }
              })
              .catch(() => alert('Failed to delete node'));
          }
        }
        break;
      case 'add-relationship':
        if (contextMenu?.target) {
          setSelectedNode(contextMenu.target);
          setSelectedEdge(null);
          setDetailsOpen(true);
          setRelationshipSignal(s => s + 1);
        }
        break;
      case 'focus-node':
        if (contextMenu?.target?.id) {
          setFocusNodeId(contextMenu.target.id);
          setHighlightedIds([contextMenu.target.id]);
        }
        break;
      case 'select-node':
        if (contextMenu?.target) {
          setSelectedNode(contextMenu.target);
          setSelectedEdge(null);
          setDetailsOpen(true);
        }
        break;
      case 'edit-edge':
        if (contextMenu?.target) {
          setSelectedEdge(contextMenu.target);
          setSelectedNode(null);
          setDetailsOpen(true);
        }
        break;
      case 'delete-edge':
        if (contextMenu?.target?.id) {
          if (confirm('Delete this relationship?')) {
            fetch(`/api/relationships/${encodeURIComponent(contextMenu.target.id)}`, { method: 'DELETE', headers: getAuthHeaders() })
              .then(res => {
                if (res.ok) {
                  handleDataChanged();
                  clearSelection();
                } else {
                  alert('Failed to delete relationship');
                }
              })
              .catch(() => alert('Failed to delete relationship'));
          }
        }
        break;
      case 'manage-types':
        setShowTypeManager(true);
        break;
      case 'import-export':
        setShowImportExport(true);
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    if (!typeFilters || typeFilters.length === 0) {
      clearSelection();
    }
  }, [typeFilters]);

  // Close context menu on ESC key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && contextMenu) {
        closeContextMenu();
      }
    }
    if (contextMenu) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [contextMenu]);

  // Close more menu dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (moreMenuOpen && !e.target.closest('.dropdown-container')) {
        setMoreMenuOpen(false);
      }
    }
    if (moreMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [moreMenuOpen]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = activeDomain
        ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
        : '';
      const [nodesRes, relsRes, typesRes, relTypesRes] = await Promise.all([
        fetch(`/api/nodes${qs}`),
        fetch(`/api/relationships${qs}`),
        fetch(`/api/node-types${qs}`),
        fetch(`/api/relationship-types${qs}`),
      ]);
      const [nodesData, relsData, typesData, relTypesData] = await Promise.all([
        nodesRes.ok ? nodesRes.json() : [],
        relsRes.ok ? relsRes.json() : [],
        typesRes.ok ? typesRes.json() : [],
        relTypesRes.ok ? relTypesRes.json() : [],
      ]);
      setNodeTypes(typesData || []);
      setRelationshipTypes(relTypesData || []);
      // Server already filters by domain, use returned data directly
      const scopedNodes = nodesData || [];
      console.log('[GraphNav] Loaded nodes:', { count: scopedNodes.length, sample: scopedNodes[0] });
      const scopedIds = new Set(scopedNodes.map(n => n.id));
      const scopedRels = (relsData || []).filter(
        r => scopedIds.has(r.sourceId) && scopedIds.has(r.targetId)
      );
      setNodes(scopedNodes);
      setRels(scopedRels);
    } catch (e) {
      console.error('Failed to load graph data', e);
    } finally {
      setLoading(false);
    }
  }, [activeDomain, activeDomainObj, domainMatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for messages from parent window (for toolbar integration)
  useEffect(() => {
    function handleMessage(event) {
      const action = event.data?.action;
      if (!action) return;

      switch (action) {
        case 'createNode':
          setQuickCreateOpen(true);
          setQuickCreateForm(prev => ({ ...prev, typeId: nodeTypes[0]?.id || '' }));
          break;
        case 'manageSchema':
          setShowTypeManager(true);
          break;
        case 'importExport':
          setShowImportExport(true);
          break;
        case 'createRelationship':
          // Open relationship creation mode
          setDetailsOpen(true);
          setRelationshipSignal(s => s + 1);
          break;
        case 'pathFinder':
          setShowPathFinder(true);
          break;
        case 'toggleFilter':
          // Toggle the filter panel visibility
          setShowFilter(prev => !prev);
          break;
        default:
          break;
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [nodeTypes]);

  const adjacency = useMemo(() => {
    const map = new Map();
    rels.forEach(r => {
      if (!map.has(r.sourceId)) map.set(r.sourceId, new Set());
      if (!map.has(r.targetId)) map.set(r.targetId, new Set());
      map.get(r.sourceId).add(r.targetId);
      map.get(r.targetId).add(r.sourceId);
    });
    return map;
  }, [rels]);

  const filteredNodes = useMemo(() => {
    const byType = selectedType
      ? nodes.filter(n => (n.typeId || n.typeName || n.typeLabel) === selectedType)
      : nodes;
    if (!nodeQuery) return byType;
    const q = nodeQuery.toLowerCase();
    return byType.filter(n => (n.label || n.name || '').toLowerCase().includes(q));
  }, [nodes, selectedType, nodeQuery]);

  const suggestions = useMemo(() => {
    const list = filteredNodes.slice(0, 30).map(n => {
      const neighbors = Array.from(adjacency.get(n.id) || []).slice(0, 3);
      const neighborNames = neighbors
        .map(id => nodes.find(x => x.id === id))
        .filter(Boolean)
        .map(x => x.label || x.name);
      const nodeType = nodeTypes.find(t => t.id === n.typeId);
      return {
        id: n.id,
        label: n.label || n.name,
        typeName: nodeType?.label || nodeType?.name || n.typeName,
        typeColor: nodeType?.color || n.color || '#6b7280',
        neighbors: neighborNames,
      };
    });
    return list;
  }, [filteredNodes, adjacency, nodes, nodeTypes]);

  const handleTypeChange = val => {
    setSelectedType(val);
    setTypeFilters(val ? [val] : []);
    setFocusNodeId(null);
    setHighlightedIds([]);
  };

  const handleSelectSuggestion = item => {
    if (!item) return;
    setNodeQuery(item.label);
    setFocusNodeId(item.id);
    setHighlightedIds([item.id]);
    setSuggestionsOpen(false);
    const found = nodes.find(n => n.id === item.id) || null;
    setSelectedNode(found ? { id: found.id, data: { raw: found } } : null);
    setSelectedEdge(null);
    setDetailsOpen(true);
  };

  // Quick create node handler
  const handleQuickCreate = async (e) => {
    e.preventDefault();
    if (!quickCreateForm.name || !quickCreateForm.typeId) {
      alert('Please enter a name and select a type');
      return;
    }

    try {
      const res = await fetch('/api/nodes', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: quickCreateForm.name,
          typeId: quickCreateForm.typeId,
          description: quickCreateForm.description || undefined,
          domain: activeDomain || undefined,
        }),
      });

      if (res.ok) {
        const newNode = await res.json();
        setQuickCreateOpen(false);
        setQuickCreateForm({ name: '', typeId: '', description: '' });
        handleDataChanged();
        // Select the new node
        setTimeout(() => {
          setFocusNodeId(newNode.id);
          setHighlightedIds([newNode.id]);
        }, 300);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to create node');
      }
    } catch (e) {
      console.error('Failed to create node', e);
      alert('Failed to create node');
    }
  };

  // Node type CRUD
  const createNodeType = async () => {
    if (!newNodeTypeForm.name.trim()) return;

    try {
      const res = await fetch('/api/node-types', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newNodeTypeForm.name.trim(),
          label: newNodeTypeForm.label.trim() || newNodeTypeForm.name.trim(),
          color: newNodeTypeForm.color,
          shape: newNodeTypeForm.shape,
          description: newNodeTypeForm.description,
          domain: activeDomain || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNodeTypes(prev => [...prev, data]);
        setNewNodeTypeForm({ name: '', label: '', color: TYPE_COLORS[nodeTypes.length % TYPE_COLORS.length], shape: 'ellipse', description: '' });
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to create node type');
      }
    } catch (e) {
      console.error('Failed to create node type', e);
    }
  };

  const updateNodeType = async () => {
    if (!editingNodeType) return;

    try {
      const res = await fetch(`/api/node-types/${encodeURIComponent(editingNodeType.id)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editingNodeType.name,
          label: editingNodeType.label,
          color: editingNodeType.color,
          shape: editingNodeType.shape,
          description: editingNodeType.description,
        }),
      });

      if (res.ok) {
        setNodeTypes(prev => prev.map(t => t.id === editingNodeType.id ? { ...t, ...editingNodeType } : t));
        setEditingNodeType(null);
        handleDataChanged();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to update node type');
      }
    } catch (e) {
      console.error('Failed to update node type', e);
    }
  };

  const deleteNodeType = async (typeId) => {
    if (!confirm('Delete this node type? Nodes using this type will not be deleted.')) return;

    try {
      const res = await fetch(`/api/node-types/${encodeURIComponent(typeId)}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        setNodeTypes(prev => prev.filter(t => t.id !== typeId));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to delete node type');
      }
    } catch (e) {
      console.error('Failed to delete node type', e);
    }
  };

  // Relationship type CRUD
  const createRelType = async () => {
    if (!newRelTypeForm.name.trim()) return;

    try {
      const res = await fetch('/api/relationship-types', {
        method: 'POST',
        headers: getAuthHeaders(),
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
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to create relationship type');
      }
    } catch (e) {
      console.error('Failed to create relationship type', e);
    }
  };

  const updateRelType = async () => {
    if (!editingRelType) return;

    try {
      const res = await fetch(`/api/relationship-types/${encodeURIComponent(editingRelType.id)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
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
  };

  const deleteRelType = async (typeId) => {
    if (!confirm('Delete this relationship type?')) return;

    try {
      const res = await fetch(`/api/relationship-types/${encodeURIComponent(typeId)}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        setRelationshipTypes(prev => prev.filter(t => t.id !== typeId));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to delete relationship type');
      }
    } catch (e) {
      console.error('Failed to delete relationship type', e);
    }
  };

  return (
    <div className="studio-container">
      <div className="studio-graph">
        {/* Structural Toolbar (Level 1 Elevation - Docked) - hidden when embedded */}
        {showToolbar && !isEmbedded && (
        <div className="graph-nav-toolbar glass elevation-1 compact">
          {/* Quick Actions - Simplified */}
          <div className="toolbar-section">
            <div className="toolbar-buttons">
              {!readOnly && (
                <>
                  <TooltipWrapper title="Create Node (N)">
                    <span className="toolbar-tooltip-span">
                      <button
                        className="toolbar-btn primary"
                        onClick={() => {
                          setQuickCreateOpen(true);
                          setQuickCreateForm(prev => ({ ...prev, typeId: nodeTypes[0]?.id || '' }));
                        }}
                      >
                        <AddIcon fontSize="small" /> Node
                      </button>
                    </span>
                  </TooltipWrapper>
                  <Tooltip title="Add Relationship">
                    <span className="toolbar-tooltip-span">
                      <button
                        className="toolbar-btn"
                        onClick={() => {
                          setDetailsOpen(true);
                          setRelationshipSignal(s => s + 1);
                        }}
                        disabled={!selectedNode}
                      >
                        <AccountTreeIcon fontSize="small" /> Link
                      </button>
                    </span>
                  </Tooltip>
                </>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="toolbar-section" style={{ flex: 1 }}>
            <span className="toolbar-section-label">Filter</span>
            <div style={{ display: 'flex', gap: 8, flex: 1 }}>
              <select
                className="toolbar-select"
                value={selectedType}
                onChange={e => handleTypeChange(e.target.value)}
              >
                <option value="">All types ({nodeTypes.length})</option>
                {nodeTypes.map(t => (
                  <option key={t.id || t.name || t.label} value={t.id || t.name || t.label}>
                    {t.label || t.name}
                  </option>
                ))}
              </select>
              <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                <input
                  type="text"
                  className="toolbar-input"
                  value={nodeQuery}
                  placeholder="Search nodes..."
                  onChange={e => {
                    setNodeQuery(e.target.value);
                    setSuggestionsOpen(true);
                  }}
                  onFocus={() => setSuggestionsOpen(true)}
                  onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
                />
                {suggestionsOpen && suggestions.length > 0 && (
                  <div className="search-suggestions">
                    {suggestions.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        className="suggestion-item"
                        onMouseDown={e => {
                          e.preventDefault();
                          handleSelectSuggestion(s);
                        }}
                      >
                        <span
                          className="suggestion-dot"
                          style={{ background: s.typeColor }}
                        />
                        <div className="suggestion-content">
                          <strong>{s.label}</strong>
                          <span className="suggestion-type">{s.typeName}</span>
                        </div>
                        {s.neighbors.length > 0 && (
                          <span className="suggestion-neighbors">
                            → {s.neighbors.slice(0, 2).join(', ')}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="toolbar-section">
            <div className="toolbar-buttons">
              <Tooltip title="Refresh">
                <span className="toolbar-tooltip-span">
                  <button className="toolbar-btn" onClick={() => setReloadKey(k => k + 1)} disabled={loading}>
                    {loading ? '...' : '↻'}
                  </button>
                </span>
              </Tooltip>
              <Tooltip title="Clear filters">
                <span className="toolbar-tooltip-span">
                  <button
                    className="toolbar-btn"
                    onClick={() => {
                      setSelectedType('');
                      setTypeFilters([]);
                      setNodeQuery('');
                      setHighlightedIds([]);
                      setFocusNodeId(null);
                    }}
                  >
                    ✕
                  </button>
                </span>
              </Tooltip>
              {/* More Menu Dropdown */}
              <div className="dropdown-container">
                <Tooltip title="More options">
                  <span className="toolbar-tooltip-span">
                    <IconButton
                      size="small"
                      onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                      sx={{ color: 'var(--text)' }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                {moreMenuOpen && (
                  <div className="dropdown-menu glass elevation-2">
                    <button className="dropdown-item" onClick={() => { setShowTypeManager(true); setMoreMenuOpen(false); }}>
                      <span className="dropdown-icon">◉</span>
                      Manage Types
                    </button>
                    <button className="dropdown-item" onClick={() => { setShowImportExport(true); setMoreMenuOpen(false); }}>
                      <span className="dropdown-icon">↔</span>
                      Import / Export
                    </button>
                    <button className="dropdown-item" onClick={() => { setShowPathFinder(true); setMoreMenuOpen(false); }}>
                      <span className="dropdown-icon">⤳</span>
                      Find Path
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item" onClick={() => { setInfoOpen(true); setMoreMenuOpen(false); }}>
                      <span className="dropdown-icon">?</span>
                      Help & Shortcuts
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LogoSpinner size={24} />
            </div>
          )}
        </div>
        )}

        {/* Collapsible Type Legend - shows when toolbar visible OR when embedded */}
        {(showToolbar || isEmbedded) && nodeTypes.length > 0 && (
          <div className={`type-legend glass elevation-1 ${legendExpanded ? 'expanded' : 'collapsed'} ${isEmbedded ? 'embedded' : ''}`}>
            <button
              className="legend-toggle"
              onClick={() => setLegendExpanded(!legendExpanded)}
              title={legendExpanded ? 'Collapse types' : 'Expand types'}
            >
              <span className="legend-toggle-icon">{legendExpanded ? '◀' : '▶'}</span>
              <span className="legend-toggle-label">Types ({nodeTypes.length})</span>
            </button>
            {legendExpanded && (
              <div className="legend-items">
                {nodeTypes.map(t => (
                  <button
                    key={t.id}
                    className={`legend-item ${selectedType === t.id ? 'active' : ''}`}
                    onClick={() => handleTypeChange(selectedType === t.id ? '' : t.id)}
                  >
                    <span className="legend-dot" style={{ background: t.color || '#6b7280' }} />
                    <span className="legend-label">{t.label || t.name}</span>
                    <span className="legend-count">
                      {nodes.filter(n => n.typeId === t.id).length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Graph View */}
        <div className="studio-graph-canvas">
          <GraphView
            readOnly={readOnly}
            reloadKey={reloadKey}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onClearSelection={clearSelection}
            highlightedNodeIds={highlightedIds}
            focusNodeId={focusNodeId}
            onNewNodeShortcut={() => {
              setQuickCreateOpen(true);
              setQuickCreateForm(prev => ({ ...prev, typeId: nodeTypes[0]?.id || '' }));
            }}
            onCreateNodeRequest={() => {
              setQuickCreateOpen(true);
              setQuickCreateForm(prev => ({ ...prev, typeId: nodeTypes[0]?.id || '' }));
            }}
            onEditNodeRequest={node => {
              setDetailsOpen(true);
              setSelectedNode(node);
              setSelectedEdge(null);
              setEditSignal(s => s + 1);
            }}
            onCreateRelationshipRequest={() => {
              setDetailsOpen(true);
              setRelationshipSignal(s => s + 1);
            }}
            onContextMenu={handleContextMenu}
            onCyReady={(cy) => { cyRef.current = cy; }}
          />
        </div>

        {/* Canvas Empty State - Onboarding affordance */}
        {!loading && nodes.length === 0 && (
          <div className="canvas-empty-state">
            <div className="empty-state-visual">
              <div className="empty-state-ring ring-1" />
              <div className="empty-state-ring ring-2" />
              <div className="empty-state-ring ring-3" />
              <div className="empty-state-center">
                <span className="empty-state-icon">◎</span>
              </div>
            </div>
            <div className="empty-state-content">
              <h2 className="empty-state-title">Start your knowledge graph</h2>
              <p className="empty-state-desc">
                {nodeTypes.length === 0
                  ? 'First, define a node type to organize your concepts'
                  : 'Add nodes and connect them to build your graph'
                }
              </p>
              {!readOnly && (
                <div className="empty-state-actions">
                  {nodeTypes.length === 0 ? (
                    <button
                      className="empty-state-btn primary"
                      onClick={() => setShowTypeManager(true)}
                    >
                      <span className="btn-icon">+</span>
                      Create Node Type
                    </button>
                  ) : (
                    <>
                      <button
                        className="empty-state-btn primary"
                        onClick={() => {
                          setQuickCreateOpen(true);
                          setQuickCreateForm(prev => ({ ...prev, typeId: nodeTypes[0]?.id || '' }));
                        }}
                      >
                        <span className="btn-icon">+</span>
                        Add First Node
                        <kbd className="btn-kbd">N</kbd>
                      </button>
                      <button
                        className="empty-state-btn secondary"
                        onClick={() => setShowImportExport(true)}
                      >
                        Import Data
                      </button>
                    </>
                  )}
                </div>
              )}
              {readOnly && (
                <p className="empty-state-hint">
                  This graph is empty. Ask an admin to add content.
                </p>
              )}
            </div>
            <div className="empty-state-hint-row">
              <span className="hint-text">Or press</span>
              <kbd className="hint-kbd">N</kbd>
              <span className="hint-text">to create a node, or</span>
              <kbd className="hint-kbd">⌘K</kbd>
              <span className="hint-text">for commands</span>
            </div>
          </div>
        )}
      </div>

      {/* Side Panel (Level 1 Elevation - Structural Docked) */}
      {detailsOpen && (
        <div className="studio-sidepanel glass elevation-1">
          <NodeDetailPanel
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onDataChanged={handleDataChanged}
            onClearSelection={clearSelection}
            onHide={() => setDetailsOpen(false)}
            createSignal={createSignal}
            editSignal={editSignal}
            relationshipSignal={relationshipSignal}
            canEdit={!readOnly}
          />
        </div>
      )}

      {/* Quick Create Modal (Level 3 Elevation - Contextual) */}
      {quickCreateOpen && (
        <div className="modal-backdrop" onClick={() => setQuickCreateOpen(false)}>
          <div className="modal glass elevation-3 quick-create-modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Create Node</h3>
            <form onSubmit={handleQuickCreate}>
              <div className="form-group">
                <label>Node Type *</label>
                <div className="type-grid">
                  {nodeTypes.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`type-option ${quickCreateForm.typeId === t.id ? 'selected' : ''}`}
                      onClick={() => setQuickCreateForm(prev => ({ ...prev, typeId: t.id }))}
                    >
                      <span className="type-dot" style={{ background: t.color || '#6b7280' }} />
                      <span>{t.label || t.name}</span>
                    </button>
                  ))}
                  {nodeTypes.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center' }}>
                      No types defined.{' '}
                      <button
                        type="button"
                        className="link"
                        onClick={() => { setQuickCreateOpen(false); setShowTypeManager(true); }}
                      >
                        Create one first
                      </button>
                    </p>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={quickCreateForm.name}
                  onChange={e => setQuickCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter node name..."
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  rows={2}
                  value={quickCreateForm.description}
                  onChange={e => setQuickCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setQuickCreateOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={!quickCreateForm.name || !quickCreateForm.typeId}
                >
                  Create Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Type Manager Modal (Level 3 Elevation - Contextual) */}
      {showTypeManager && (
        <div className="modal-backdrop" onClick={() => setShowTypeManager(false)}>
          <div className="modal glass elevation-3 modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <h3 style={{ marginTop: 0 }}>Manage Schema</h3>

            <div className="type-tabs">
              <button
                className={`type-tab ${typeManagerTab === 'node-types' ? 'active' : ''}`}
                onClick={() => setTypeManagerTab('node-types')}
              >
                Node Types ({nodeTypes.length})
              </button>
              <button
                className={`type-tab ${typeManagerTab === 'rel-types' ? 'active' : ''}`}
                onClick={() => setTypeManagerTab('rel-types')}
              >
                Relationship Types ({relationshipTypes.length})
              </button>
            </div>

            {typeManagerTab === 'node-types' && (
              <div className="type-manager-content">
                {/* Add new node type form */}
                <div className="add-type-form">
                  <input
                    type="text"
                    placeholder="Type name (e.g., BusinessProcess)"
                    value={newNodeTypeForm.name}
                    onChange={e => setNewNodeTypeForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Display label"
                    value={newNodeTypeForm.label}
                    onChange={e => setNewNodeTypeForm(prev => ({ ...prev, label: e.target.value }))}
                  />
                  <input
                    type="color"
                    value={newNodeTypeForm.color}
                    onChange={e => setNewNodeTypeForm(prev => ({ ...prev, color: e.target.value }))}
                    style={{ width: 50, padding: 2 }}
                  />
                  <select
                    value={newNodeTypeForm.shape}
                    onChange={e => setNewNodeTypeForm(prev => ({ ...prev, shape: e.target.value }))}
                    style={{ minWidth: 100 }}
                  >
                    <optgroup label="Basic">
                      <option value="ellipse">Ellipse</option>
                      <option value="rectangle">Rectangle</option>
                      <option value="round-rectangle">Rounded</option>
                    </optgroup>
                    <optgroup label="Polygons">
                      <option value="triangle">Triangle</option>
                      <option value="diamond">Diamond</option>
                      <option value="hexagon">Hexagon</option>
                      <option value="octagon">Octagon</option>
                    </optgroup>
                    <optgroup label="Special">
                      <option value="star">Star</option>
                      <option value="tag">Tag</option>
                      <option value="vee">Vee</option>
                    </optgroup>
                  </select>
                  <button
                    className="btn"
                    onClick={createNodeType}
                    disabled={!newNodeTypeForm.name.trim()}
                  >
                    Add
                  </button>
                </div>

                {/* Existing node types */}
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
                              onChange={e => setEditingNodeType(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <input
                              type="text"
                              placeholder="Label"
                              value={editingNodeType.label}
                              onChange={e => setEditingNodeType(prev => ({ ...prev, label: e.target.value }))}
                            />
                            <input
                              type="color"
                              value={editingNodeType.color || '#00d4aa'}
                              onChange={e => setEditingNodeType(prev => ({ ...prev, color: e.target.value }))}
                              style={{ width: 50 }}
                            />
                            <select
                              value={editingNodeType.shape || 'ellipse'}
                              onChange={e => setEditingNodeType(prev => ({ ...prev, shape: e.target.value }))}
                              style={{ minWidth: 90 }}
                            >
                              <option value="ellipse">Ellipse</option>
                              <option value="rectangle">Rectangle</option>
                              <option value="round-rectangle">Rounded</option>
                              <option value="triangle">Triangle</option>
                              <option value="diamond">Diamond</option>
                              <option value="hexagon">Hexagon</option>
                              <option value="octagon">Octagon</option>
                              <option value="star">Star</option>
                              <option value="tag">Tag</option>
                              <option value="vee">Vee</option>
                            </select>
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
                            <div className="type-meta">
                              {nodes.filter(n => n.typeId === t.id).length} nodes
                            </div>
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
                      No node types yet. Add one above to get started.
                    </p>
                  )}
                </div>
              </div>
            )}

            {typeManagerTab === 'rel-types' && (
              <div className="type-manager-content">
                {/* Add new relationship type form */}
                <div className="add-type-form">
                  <input
                    type="text"
                    placeholder="Type name (e.g., RELATES_TO)"
                    value={newRelTypeForm.name}
                    onChange={e => setNewRelTypeForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Display label"
                    value={newRelTypeForm.label}
                    onChange={e => setNewRelTypeForm(prev => ({ ...prev, label: e.target.value }))}
                  />
                  <button
                    className="btn"
                    onClick={createRelType}
                    disabled={!newRelTypeForm.name.trim()}
                  >
                    Add
                  </button>
                </div>

                {/* Existing relationship types */}
                <div className="type-list">
                  {relationshipTypes.map(t => (
                    <div key={t.id} className="type-item">
                      {editingRelType?.id === t.id ? (
                        <div className="type-edit-form">
                          <div className="form-row">
                            <input
                              type="text"
                              placeholder="Name"
                              value={editingRelType.name}
                              onChange={e => setEditingRelType(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <input
                              type="text"
                              placeholder="Label"
                              value={editingRelType.label}
                              onChange={e => setEditingRelType(prev => ({ ...prev, label: e.target.value }))}
                            />
                          </div>
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
                      No relationship types yet. Add one above to get started.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn" onClick={() => setShowTypeManager(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import/Export Modal */}
      <BulkImportExport
        visible={showImportExport}
        onClose={() => setShowImportExport(false)}
        nodes={nodes}
        relationships={rels}
        nodeTypes={nodeTypes}
        relationshipTypes={relationshipTypes}
        activeDomain={activeDomain}
        onDataChanged={handleDataChanged}
      />

      {/* Path Finder */}
      <PathFinder
        cy={cyRef.current}
        nodes={nodes}
        visible={showPathFinder}
        onClose={() => setShowPathFinder(false)}
        onPathFound={(path) => {
          // Optionally highlight the path nodes
          if (path && path.length > 0 && path[0].nodes) {
            setHighlightedIds(path[0].nodes.map(n => n.id));
          }
        }}
      />

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="context-menu-backdrop"
            onClick={closeContextMenu}
            onContextMenu={(e) => { e.preventDefault(); closeContextMenu(); }}
          />
          <div
            className="context-menu glass elevation-3"
            style={{
              position: 'fixed',
              left: contextMenu.position.x,
              top: contextMenu.position.y,
              zIndex: 9999,
            }}
          >
            {/* Background menu */}
            {contextMenu.type === 'background' && (
              <>
                {!readOnly && (
                  <>
                    <button className="context-menu-item" onClick={() => handleContextMenuAction('create-node')}>
                      <span className="context-menu-icon">+</span>
                      <span>New Node</span>
                      <span className="context-menu-shortcut">N</span>
                    </button>
                    <div className="context-menu-divider" />
                  </>
                )}
                <button className="context-menu-item" onClick={() => handleContextMenuAction('zoom-in')}>
                  <span className="context-menu-icon">+</span>
                  <span>Zoom In</span>
                </button>
                <button className="context-menu-item" onClick={() => handleContextMenuAction('zoom-out')}>
                  <span className="context-menu-icon">−</span>
                  <span>Zoom Out</span>
                </button>
                <button className="context-menu-item" onClick={() => handleContextMenuAction('fit-view')}>
                  <span className="context-menu-icon">⊡</span>
                  <span>Fit to View</span>
                </button>
                <div className="context-menu-divider" />
                <button className="context-menu-item" onClick={() => handleContextMenuAction('run-layout')}>
                  <span className="context-menu-icon">◎</span>
                  <span>Run Layout</span>
                </button>
                <button className="context-menu-item" onClick={() => handleContextMenuAction('refresh')}>
                  <span className="context-menu-icon">↻</span>
                  <span>Refresh</span>
                </button>
                {!readOnly && (
                  <>
                    <div className="context-menu-divider" />
                    <button className="context-menu-item" onClick={() => handleContextMenuAction('manage-types')}>
                      <span className="context-menu-icon">⚙</span>
                      <span>Manage Types</span>
                    </button>
                    <button className="context-menu-item" onClick={() => handleContextMenuAction('import-export')}>
                      <span className="context-menu-icon">↕</span>
                      <span>Import / Export</span>
                    </button>
                  </>
                )}
              </>
            )}

            {/* Node menu */}
            {contextMenu.type === 'node' && (
              <>
                <button className="context-menu-item" onClick={() => handleContextMenuAction('select-node')}>
                  <span className="context-menu-icon">◉</span>
                  <span>View Details</span>
                </button>
                <button className="context-menu-item" onClick={() => handleContextMenuAction('focus-node')}>
                  <span className="context-menu-icon">◎</span>
                  <span>Focus on Node</span>
                </button>
                {!readOnly && (
                  <>
                    <div className="context-menu-divider" />
                    <button className="context-menu-item" onClick={() => handleContextMenuAction('edit-node')}>
                      <span className="context-menu-icon">✎</span>
                      <span>Edit Node</span>
                    </button>
                    <button className="context-menu-item" onClick={() => handleContextMenuAction('add-relationship')}>
                      <span className="context-menu-icon">→</span>
                      <span>Add Relationship</span>
                    </button>
                    <div className="context-menu-divider" />
                    <button className="context-menu-item context-menu-item-danger" onClick={() => handleContextMenuAction('delete-node')}>
                      <span className="context-menu-icon">×</span>
                      <span>Delete Node</span>
                    </button>
                  </>
                )}
              </>
            )}

            {/* Edge menu */}
            {contextMenu.type === 'edge' && (
              <>
                <button className="context-menu-item" onClick={() => handleContextMenuAction('edit-edge')}>
                  <span className="context-menu-icon">◉</span>
                  <span>View Details</span>
                </button>
                {!readOnly && (
                  <>
                    <div className="context-menu-divider" />
                    <button className="context-menu-item context-menu-item-danger" onClick={() => handleContextMenuAction('delete-edge')}>
                      <span className="context-menu-icon">×</span>
                      <span>Delete Relationship</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Help Modal (Level 3 Elevation - Contextual) */}
      {infoOpen && (
        <div className="modal-backdrop" onClick={() => setInfoOpen(false)}>
          <div className="modal glass elevation-3" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Graph Navigator Guide</h3>
            <div className="help-sections">
              <div className="help-section">
                <h4>Navigation</h4>
                <ul>
                  <li><strong>Pan:</strong> Click and drag on empty space</li>
                  <li><strong>Zoom:</strong> Scroll wheel or pinch gesture</li>
                  <li><strong>Select node:</strong> Click on any node</li>
                  <li><strong>Search:</strong> Type in the search box to find nodes</li>
                </ul>
              </div>
              <div className="help-section">
                <h4>Creating</h4>
                <ul>
                  <li><strong>New node:</strong> Press <kbd>N</kbd> or click the + button</li>
                  <li><strong>New link:</strong> Select a node, then click "Link" button</li>
                  <li><strong>Manage types:</strong> Click "Types" to add/edit node and relationship types</li>
                </ul>
              </div>
              <div className="help-section">
                <h4>Editing</h4>
                <ul>
                  <li><strong>Edit node:</strong> Double-click a node or select and click "Edit"</li>
                  <li><strong>Resize node:</strong> Alt+drag on a node to change its weight/size</li>
                  <li><strong>Delete:</strong> Select a node/link and use the Delete button</li>
                </ul>
              </div>
              <div className="help-section">
                <h4>Filtering</h4>
                <ul>
                  <li>Click a type in the legend to filter by that type</li>
                  <li>Use the dropdown to select a specific node type</li>
                  <li>Combine type filter with search for precise results</li>
                </ul>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: 12 }}>
              <button className="btn" type="button" onClick={() => setInfoOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple FAB - Opens Command Palette (Level 2 Elevation) - hide when embedded */}
      {!isEmbedded && (
        <div className="fab-container">
          <Tooltip title="Commands (⌘K)" placement="left">
            <button
              className="fab-main glass elevation-2-glow"
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Open command palette"
            >
              <span className="fab-icon" style={{ fontSize: '20px', fontWeight: 600 }}>⌘</span>
            </button>
          </Tooltip>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onCreateNode={() => {
          setQuickCreateOpen(true);
          setQuickCreateForm(prev => ({ ...prev, typeId: nodeTypes[0]?.id || '' }));
        }}
        onCreateRelationship={() => {
          if (selectedNode) {
            setDetailsOpen(true);
            setRelationshipSignal(s => s + 1);
          }
        }}
        nodes={nodes}
        nodeTypes={nodeTypes}
        recentNodes={nodes.slice(0, 10)}
      />
    </div>
  );
}

// Force server render (avoid static prerender issues)
export async function getServerSideProps() {
  return { props: {} };
}
