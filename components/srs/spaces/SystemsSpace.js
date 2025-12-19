// components/srs/spaces/SystemsSpace.js
// Systems Space - Map causal relationships and feedback loops

import { useState, useCallback, useMemo } from 'react';
import { useSRS, SYSTEM_NODE_TYPES, CAUSAL_POLARITIES, SRS_SPACES, CONNECTION_TYPES } from '../SRSContext';
import { CanvasNode, CanvasConnection } from '../canvas';

// MUI Icons
import LoopIcon from '@mui/icons-material/Loop';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import StorageIcon from '@mui/icons-material/Storage';
import AdjustIcon from '@mui/icons-material/Adjust';
import StreamIcon from '@mui/icons-material/Stream';
import LinkIcon from '@mui/icons-material/Link';

const TYPE_ICONS = {
  variable: SwapVertIcon,
  stock: StorageIcon,
  flow: StreamIcon,
  delay: AdjustIcon,
  external: AdjustIcon,
};

const POLARITY_CONFIG = {
  positive: { icon: TrendingUpIcon, label: '+', color: '#10b981', description: 'Same direction' },
  negative: { icon: TrendingDownIcon, label: '−', color: '#ef4444', description: 'Opposite direction' },
};

export default function SystemsSpace() {
  const {
    elements,
    connections,
    createSystemNode,
    updateElement,
    deleteElement,
    selectElement,
    selectedElementId,
    createConnection,
    deleteConnection,
  } = useSRS();

  const nodes = elements.system_nodes || [];
  const systemConnections = useMemo(() => {
    return connections.filter(c => c.connection_type === 'causal_link');
  }, [connections]);

  // Local UI state
  const [filter, setFilter] = useState({ type: 'all' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(null);

  // Filter nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (filter.type !== 'all' && n.node_type !== filter.type) return false;
      return true;
    });
  }, [nodes, filter]);

  // Count feedback loops (simplified heuristic)
  const stats = useMemo(() => {
    const reinforcingCount = systemConnections.filter(c => c.metadata?.polarity === 'positive').length;
    const balancingCount = systemConnections.filter(c => c.metadata?.polarity === 'negative').length;
    return { reinforcing: reinforcingCount, balancing: balancingCount, total: nodes.length };
  }, [nodes, systemConnections]);

  // Handle position change
  const handlePositionChange = useCallback(async (id, x, y) => {
    await updateElement('system_nodes', 'system_node', id, { canvas_x: x, canvas_y: y });
  }, [updateElement]);

  // Handle delete
  const handleDelete = useCallback(async (id) => {
    await deleteElement('system_nodes', 'system_node', id);
  }, [deleteElement]);

  // Handle edit
  const handleEdit = useCallback((id) => {
    setEditingId(id);
  }, []);

  // Handle node click in connection mode
  const handleNodeClick = useCallback((id) => {
    if (!connectionMode) {
      selectElement(id);
      return;
    }

    if (!connectionStart) {
      setConnectionStart(id);
    } else if (connectionStart !== id) {
      // Prepare connection
      setPendingConnection({
        from_element_id: connectionStart,
        to_element_id: id,
        from_space: 'systems',
        to_space: 'systems',
      });
      setShowConnectionModal(true);
    }
  }, [connectionMode, connectionStart, selectElement]);

  // Handle connection creation
  const handleCreateConnection = useCallback(async (polarity) => {
    if (!pendingConnection) return;

    await createConnection({
      ...pendingConnection,
      connection_type: 'causal_link',
      metadata: { polarity },
    });

    setConnectionStart(null);
    setPendingConnection(null);
    setShowConnectionModal(false);
    setConnectionMode(false);
  }, [pendingConnection, createConnection]);

  // Cancel connection mode
  const handleCancelConnection = useCallback(() => {
    setConnectionStart(null);
    setPendingConnection(null);
    setShowConnectionModal(false);
    setConnectionMode(false);
  }, []);

  // Get node by ID for connections
  const getNodeById = useCallback((id) => {
    return nodes.find(n => n.id === id);
  }, [nodes]);

  return (
    <div className="srs-space srs-space--systems">
      {/* Toolbar */}
      <div className="srs-space-toolbar">
        <button
          className="srs-btn srs-btn--primary"
          onClick={() => setShowCreateModal(true)}
        >
          <AddIcon fontSize="small" />
          Add Element
        </button>

        <button
          className={`srs-btn ${connectionMode ? 'srs-btn--active' : 'srs-btn--secondary'}`}
          onClick={() => {
            setConnectionMode(!connectionMode);
            setConnectionStart(null);
          }}
        >
          <LinkIcon fontSize="small" />
          {connectionMode ? (connectionStart ? 'Select Target...' : 'Select Source...') : 'Connect'}
        </button>

        <div className="srs-toolbar-filters">
          <div className="srs-filter-group">
            <FilterListIcon fontSize="small" />
            <select
              value={filter.type}
              onChange={(e) => setFilter(f => ({ ...f, type: e.target.value }))}
            >
              <option value="all">All Types</option>
              {Object.entries(SYSTEM_NODE_TYPES).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="srs-toolbar-stats">
          <span>{stats.total} elements</span>
          <span className="srs-stat-divider">|</span>
          <span style={{ color: '#10b981' }}>
            {stats.reinforcing} reinforcing
          </span>
          <span className="srs-stat-divider">|</span>
          <span style={{ color: '#ef4444' }}>
            {stats.balancing} balancing
          </span>
        </div>
      </div>

      {/* Connection Modal */}
      {showConnectionModal && pendingConnection && (
        <div className="srs-modal-overlay" onClick={handleCancelConnection}>
          <div className="srs-modal srs-modal--small" onClick={(e) => e.stopPropagation()}>
            <h3>Create Causal Link</h3>
            <p className="srs-modal-hint">
              From: <strong>{getNodeById(pendingConnection.from_element_id)?.name}</strong>
              <br />
              To: <strong>{getNodeById(pendingConnection.to_element_id)?.name}</strong>
            </p>

            <div className="srs-polarity-options">
              <button
                className="srs-polarity-btn srs-polarity-btn--positive"
                onClick={() => handleCreateConnection('positive')}
              >
                <TrendingUpIcon />
                <span>Positive (+)</span>
                <small>Same direction: when A increases, B increases</small>
              </button>

              <button
                className="srs-polarity-btn srs-polarity-btn--negative"
                onClick={() => handleCreateConnection('negative')}
              >
                <TrendingDownIcon />
                <span>Negative (−)</span>
                <small>Opposite direction: when A increases, B decreases</small>
              </button>
            </div>

            <div className="srs-modal-actions">
              <button className="srs-btn srs-btn--secondary" onClick={handleCancelConnection}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <NodeCreateModal
          onSave={async (data) => {
            await createSystemNode({
              ...data,
              canvas_x: 100 + Math.random() * 400,
              canvas_y: 100 + Math.random() * 300,
            });
            setShowCreateModal(false);
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Canvas with System Nodes and Connections */}
      {filteredNodes.length === 0 ? (
        <div className="srs-space__empty srs-space__empty--guided">
          <div className="srs-empty__header">
            <div className="srs-empty__phase-badge" style={{ backgroundColor: '#ef4444' }}>
              Analyze Phase • Step 2
            </div>
            <LoopIcon style={{ fontSize: 48, color: SRS_SPACES.systems.color }} />
            <h2>Map the System</h2>
            <p className="srs-empty__purpose">
              Situations are shaped by interconnected forces. Map the variables and their causal
              relationships to see feedback loops that drive behavior over time.
            </p>
          </div>

          <div className="srs-empty__guidance">
            <h3>How to Build a Systems Map</h3>
            <p>Start with key variables, then connect them with causal links.</p>

            <div className="srs-empty__prompts">
              <div className="srs-empty__prompt-group">
                <h4>1. Identify Variables</h4>
                <ul>
                  <li>What quantities matter here?</li>
                  <li>What goes up and down?</li>
                  <li>e.g., "Customer satisfaction", "Team morale", "Technical debt"</li>
                </ul>
              </div>
              <div className="srs-empty__prompt-group">
                <h4>2. Add Causal Links</h4>
                <ul>
                  <li><strong>+</strong> When A increases, B increases</li>
                  <li><strong>−</strong> When A increases, B decreases</li>
                  <li>Use the Connect button to draw links</li>
                </ul>
              </div>
              <div className="srs-empty__prompt-group">
                <h4>3. Find Loops</h4>
                <ul>
                  <li><strong>Reinforcing:</strong> Amplifies change (growth or collapse)</li>
                  <li><strong>Balancing:</strong> Resists change (stability or stagnation)</li>
                  <li>These loops explain system behavior</li>
                </ul>
              </div>
            </div>

            <div className="srs-empty__maturity-hint">
              <strong>Systems thinking:</strong> Understanding the structure helps you find leverage points for intervention.
            </div>
          </div>

          <button
            className="srs-btn srs-btn--primary srs-btn--lg"
            onClick={() => setShowCreateModal(true)}
          >
            <AddIcon fontSize="small" />
            Add Your First Element
          </button>

          <div className="srs-empty__next-step">
            <span>Next:</span> After mapping systems, move to <strong>Perspectives</strong> to see this
            situation through different stakeholder eyes.
          </div>
        </div>
      ) : (
        <>
          {/* Render connections */}
          <svg className="srs-connections-layer">
            {systemConnections.map(conn => {
              const fromNode = getNodeById(conn.from_element_id);
              const toNode = getNodeById(conn.to_element_id);
              if (!fromNode || !toNode) return null;

              const polarityConfig = POLARITY_CONFIG[conn.metadata?.polarity] || POLARITY_CONFIG.positive;

              return (
                <CanvasConnection
                  key={conn.id}
                  id={conn.id}
                  fromX={(fromNode.canvas_x || 100) + 140}
                  fromY={(fromNode.canvas_y || 100) + 40}
                  toX={(toNode.canvas_x || 100) + 140}
                  toY={(toNode.canvas_y || 100) + 40}
                  color={polarityConfig.color}
                  label={polarityConfig.label}
                  onDelete={() => deleteConnection(conn.id)}
                />
              );
            })}
          </svg>

          {/* Render nodes */}
          {filteredNodes.map(node => {
            const typeConfig = SYSTEM_NODE_TYPES[node.node_type] || SYSTEM_NODE_TYPES.variable;
            const TypeIcon = TYPE_ICONS[node.node_type] || SwapVertIcon;

            return (
              <CanvasNode
                key={node.id}
                id={node.id}
                type="system_node"
                x={node.canvas_x || 100}
                y={node.canvas_y || 100}
                width={280}
                color={typeConfig.color}
                icon={TypeIcon}
                title={node.name}
                subtitle={typeConfig.name}
                selected={selectedElementId === node.id}
                highlighted={connectionMode && connectionStart === node.id}
                onSelect={handleNodeClick}
                onPositionChange={handlePositionChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
              >
                <div className="srs-system-node-content">
                  {editingId === node.id ? (
                    <NodeEditor
                      node={node}
                      onSave={async (updates) => {
                        await updateElement('system_nodes', 'system_node', node.id, updates);
                        setEditingId(null);
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      {node.description && (
                        <p className="srs-system-node-description">{node.description}</p>
                      )}

                      {node.current_level && (
                        <div className="srs-system-node-level">
                          <span className="srs-level-label">Current:</span>
                          <span className="srs-level-value">{node.current_level}</span>
                        </div>
                      )}

                      {node.trend && (
                        <div className="srs-system-node-trend">
                          {node.trend === 'increasing' && <TrendingUpIcon style={{ color: '#10b981' }} fontSize="small" />}
                          {node.trend === 'decreasing' && <TrendingDownIcon style={{ color: '#ef4444' }} fontSize="small" />}
                          {node.trend === 'stable' && <span style={{ color: '#6b7280' }}>→ Stable</span>}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CanvasNode>
            );
          })}
        </>
      )}

      {/* Legend */}
      <div className="srs-legend">
        <span className="srs-legend-title">Elements:</span>
        {Object.entries(SYSTEM_NODE_TYPES).map(([key, config]) => (
          <span key={key} className="srs-legend-item">
            <span
              className="srs-legend-dot"
              style={{ backgroundColor: config.color }}
            />
            {config.name}
          </span>
        ))}
        <span className="srs-legend-divider">|</span>
        <span className="srs-legend-title">Links:</span>
        <span className="srs-legend-item">
          <TrendingUpIcon fontSize="small" style={{ color: '#10b981' }} />
          Reinforcing (+)
        </span>
        <span className="srs-legend-item">
          <TrendingDownIcon fontSize="small" style={{ color: '#ef4444' }} />
          Balancing (−)
        </span>
      </div>
    </div>
  );
}

// Node Create Modal
function NodeCreateModal({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [nodeType, setNodeType] = useState('variable');
  const [description, setDescription] = useState('');
  const [currentLevel, setCurrentLevel] = useState('');
  const [trend, setTrend] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      node_type: nodeType,
      description: description.trim() || null,
      current_level: currentLevel.trim() || null,
      trend: trend || null,
    });
  };

  return (
    <div className="srs-modal-overlay" onClick={onCancel}>
      <div className="srs-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add System Element</h3>
        <p className="srs-modal-hint">
          What variable, stock, or factor plays a role in this system?
        </p>

        <div className="srs-form-group">
          <label>Type</label>
          <select value={nodeType} onChange={(e) => setNodeType(e.target.value)}>
            {Object.entries(SYSTEM_NODE_TYPES).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>
        </div>

        <div className="srs-form-group">
          <label>Name</label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Customer Satisfaction, Inventory Level..."
          />
        </div>

        <div className="srs-form-group">
          <label>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="How does this element behave? What affects it?"
            rows={2}
          />
        </div>

        <div className="srs-form-row">
          <div className="srs-form-group">
            <label>Current Level (optional)</label>
            <input
              type="text"
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value)}
              placeholder="High, Low, 50%..."
            />
          </div>

          <div className="srs-form-group">
            <label>Trend (optional)</label>
            <select value={trend} onChange={(e) => setTrend(e.target.value)}>
              <option value="">Not specified</option>
              <option value="increasing">Increasing</option>
              <option value="decreasing">Decreasing</option>
              <option value="stable">Stable</option>
            </select>
          </div>
        </div>

        <div className="srs-modal-actions">
          <button className="srs-btn srs-btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="srs-btn srs-btn--primary"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Add Element
          </button>
        </div>
      </div>
    </div>
  );
}

// Node Editor Component
function NodeEditor({ node, onSave, onCancel }) {
  const [name, setName] = useState(node.name || '');
  const [nodeType, setNodeType] = useState(node.node_type || 'variable');
  const [description, setDescription] = useState(node.description || '');
  const [currentLevel, setCurrentLevel] = useState(node.current_level || '');
  const [trend, setTrend] = useState(node.trend || '');

  const handleSave = () => {
    onSave({
      name,
      node_type: nodeType,
      description: description || null,
      current_level: currentLevel || null,
      trend: trend || null,
    });
  };

  return (
    <div className="srs-system-node-editor">
      <div className="srs-form-group">
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="srs-form-group">
        <label>Type</label>
        <select value={nodeType} onChange={(e) => setNodeType(e.target.value)}>
          {Object.entries(SYSTEM_NODE_TYPES).map(([key, config]) => (
            <option key={key} value={key}>{config.name}</option>
          ))}
        </select>
      </div>

      <div className="srs-form-group">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="srs-form-group">
        <label>Current Level</label>
        <input
          type="text"
          value={currentLevel}
          onChange={(e) => setCurrentLevel(e.target.value)}
        />
      </div>

      <div className="srs-form-group">
        <label>Trend</label>
        <select value={trend} onChange={(e) => setTrend(e.target.value)}>
          <option value="">Not specified</option>
          <option value="increasing">Increasing</option>
          <option value="decreasing">Decreasing</option>
          <option value="stable">Stable</option>
        </select>
      </div>

      <div className="srs-editor-actions">
        <button className="srs-btn srs-btn--secondary srs-btn--sm" onClick={onCancel}>
          Cancel
        </button>
        <button className="srs-btn srs-btn--primary srs-btn--sm" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}
