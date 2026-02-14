// components/srs/spaces/SystemsSpace.js
// Systems Space - Map causal relationships and feedback loops using DiagramCore

import { useState, useCallback, useMemo, useRef } from 'react';
import { useSRS, SYSTEM_NODE_TYPES } from '../SRSContext';
import DiagramCore from '../../../diagram-core/DiagramCore';
import SpaceEmptyState from '../components/SpaceEmptyState';
import SystemsWizard from '../components/SystemsWizard';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

// Helper to parse metadata from description field (stored as JSON string)
function parseConnectionMetadata(conn) {
  if (conn.metadata) return conn.metadata;
  // Try description first (database column), then note (legacy/API param)
  const metaStr = conn.description || conn.note;
  if (!metaStr) return {};
  try {
    return JSON.parse(metaStr);
  } catch {
    return {};
  }
}

// Custom stencils matching SRS system node types
const SYSTEMS_STENCILS = [
  {
    id: 'variable',
    name: 'Variable',
    description: 'Something that can increase or decrease',
    group: 'System Elements',
    shape: 'rounded-rect',
    color: SYSTEM_NODE_TYPES.variable.color,
    defaultSize: { width: 160, height: 60 },
    borderRadius: 8,
    ports: ['top', 'right', 'bottom', 'left'],
    properties: [
      { id: 'description', label: 'Description', type: 'textarea' },
      { id: 'current_level', label: 'Current Level', type: 'text' },
      { id: 'trend', label: 'Trend', type: 'select', options: [
        { value: '', label: 'Not specified' },
        { value: 'increasing', label: 'Increasing' },
        { value: 'decreasing', label: 'Decreasing' },
        { value: 'stable', label: 'Stable' },
      ]},
    ],
  },
  {
    id: 'stock',
    name: 'Stock',
    description: 'Accumulation that changes over time',
    group: 'System Elements',
    shape: 'rect',
    color: SYSTEM_NODE_TYPES.stock.color,
    defaultSize: { width: 140, height: 80 },
    strokeWidth: 3,
    ports: ['top', 'right', 'bottom', 'left'],
    properties: [
      { id: 'description', label: 'Description', type: 'textarea' },
      { id: 'current_level', label: 'Current Level', type: 'text' },
    ],
  },
  {
    id: 'flow',
    name: 'Flow',
    description: 'Rate of change into or out of a stock',
    group: 'System Elements',
    shape: 'flow',
    color: SYSTEM_NODE_TYPES.flow.color,
    defaultSize: { width: 120, height: 50 },
    ports: ['left', 'right'],
    properties: [
      { id: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    id: 'external',
    name: 'External Factor',
    description: 'Outside force we cannot control',
    group: 'Context',
    shape: 'rounded-rect',
    color: SYSTEM_NODE_TYPES.external.color,
    defaultSize: { width: 150, height: 55 },
    strokeStyle: 'dashed',
    borderRadius: 6,
    ports: ['top', 'right', 'bottom', 'left'],
    properties: [
      { id: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    id: 'lever',
    name: 'Lever',
    description: 'Something we can influence directly',
    group: 'Context',
    shape: 'diamond',
    color: SYSTEM_NODE_TYPES.lever.color,
    defaultSize: { width: 140, height: 70 },
    ports: ['top', 'right', 'bottom', 'left'],
    properties: [
      { id: 'description', label: 'Description', type: 'textarea' },
    ],
  },
];

// Custom connection types for causal relationships
const CAUSAL_CONNECTIONS = [
  {
    id: 'positive',
    name: 'Reinforcing (+)',
    description: 'Same direction - when A increases, B increases',
    color: '#10b981',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowEnd: 'arrow',
    polarity: '+',
    labelDefault: '+',
    style: 'arc',
    curvature: 0.25,
  },
  {
    id: 'negative',
    name: 'Balancing (-)',
    description: 'Opposite direction - when A increases, B decreases',
    color: '#ef4444',
    strokeWidth: 2,
    strokeStyle: 'solid',
    arrowEnd: 'arrow',
    polarity: '-',
    labelDefault: '-',
    style: 'arc',
    curvature: 0.25,
  },
  {
    id: 'delayed',
    name: 'Delayed Effect',
    description: 'Relationship with time delay',
    color: '#6b7280',
    strokeWidth: 2,
    strokeStyle: 'dashed',
    arrowEnd: 'arrow',
    labelDefault: '||',
    style: 'arc',
    curvature: 0.25,
  },
];

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

  const diagramRef = useRef(null);
  const nodes = elements.systemNodes || [];

  const systemConnections = useMemo(() => {
    return connections.filter(c => c.connection_type === 'causal_link');
  }, [connections]);

  // Local UI state
  const [filter, setFilter] = useState({ type: 'all' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  // Key for forcing DiagramCore re-initialization when SRS data changes
  // This ensures DiagramCore always uses SRS IDs
  const diagramKey = useMemo(() => {
    const nodeIds = nodes.map(n => n.id).sort().join(',');
    const connIds = systemConnections.map(c => c.id).sort().join(',');
    return `${nodeIds}|${connIds}`;
  }, [nodes, systemConnections]);

  // Count feedback relationships
  const stats = useMemo(() => {
    const reinforcingCount = systemConnections.filter(c => {
      const meta = parseConnectionMetadata(c);
      return meta.polarity === 'positive';
    }).length;
    const balancingCount = systemConnections.filter(c => {
      const meta = parseConnectionMetadata(c);
      return meta.polarity === 'negative';
    }).length;
    return { reinforcing: reinforcingCount, balancing: balancingCount, total: nodes.length };
  }, [nodes, systemConnections]);

  // Convert SRS nodes to DiagramCore elements
  const diagramElements = useMemo(() => {
    const cols = 4; // Number of columns for grid layout
    const spacingX = 220; // Horizontal spacing between elements
    const spacingY = 140; // Vertical spacing between elements
    const startX = 100;
    const startY = 100;

    return nodes
      .filter(n => filter.type === 'all' || n.node_type === filter.type)
      .map((node, index) => {
        // Calculate default grid position for elements without saved positions
        const defaultX = startX + (index % cols) * spacingX;
        const defaultY = startY + Math.floor(index / cols) * spacingY;

        return {
          id: node.id.toString(),
          type: node.node_type || 'variable',
          x: node.canvas_x ?? defaultX,
          y: node.canvas_y ?? defaultY,
          width: 160,
          height: 60,
          label: node.name,
          data: {
            description: node.description,
            current_level: node.current_level,
            trend: node.trend,
            originalNode: node,
          },
        };
      });
  }, [nodes, filter]);

  // Convert SRS connections to DiagramCore connections
  const diagramConnections = useMemo(() => {
    return systemConnections.map(conn => {
      const meta = parseConnectionMetadata(conn);
      return {
        id: conn.id.toString(),
        from: conn.from_element_id.toString(),
        to: conn.to_element_id.toString(),
        type: meta.polarity || 'positive',
        label: meta.polarity === 'positive' ? '+' : meta.polarity === 'negative' ? '-' : '',
        data: {
          delay: meta.delay,
          originalConnection: conn,
        },
      };
    });
  }, [systemConnections]);

  // Handle element creation from DiagramCore
  const handleElementCreate = useCallback(async (element) => {
    const newNode = await createSystemNode({
      name: element.label || 'New Element',
      node_type: element.type || 'variable',
      description: element.data?.description || null,
      current_level: element.data?.current_level || null,
      trend: element.data?.trend || null,
      canvas_x: element.x,
      canvas_y: element.y,
    });
    return newNode?.id?.toString();
  }, [createSystemNode]);

  // Handle element update from DiagramCore
  const handleElementUpdate = useCallback(async (elementId, changes) => {
    const updates = {};
    if (changes.x !== undefined) updates.canvas_x = changes.x;
    if (changes.y !== undefined) updates.canvas_y = changes.y;
    if (changes.label !== undefined) updates.name = changes.label;
    if (changes.type !== undefined) updates.node_type = changes.type;
    if (changes.data?.description !== undefined) updates.description = changes.data.description;
    if (changes.data?.current_level !== undefined) updates.current_level = changes.data.current_level;
    if (changes.data?.trend !== undefined) updates.trend = changes.data.trend;

    if (Object.keys(updates).length > 0) {
      await updateElement('systems', 'node', parseInt(elementId), updates);
    }
  }, [updateElement]);

  // Handle element deletion from DiagramCore
  const handleElementDelete = useCallback(async (elementId) => {
    await deleteElement('systems', 'node', parseInt(elementId));
  }, [deleteElement]);

  // Handle connection creation from DiagramCore
  const handleConnectionCreate = useCallback(async (connection) => {
    // Parse IDs - they should be SRS numeric IDs after re-mount
    const fromId = parseInt(connection.from);
    const toId = parseInt(connection.to);

    // Validate IDs are valid numbers (not NaN from parsing DiagramCore temp IDs)
    if (isNaN(fromId) || isNaN(toId)) {
      console.warn('Invalid connection IDs, skipping creation:', connection.from, connection.to);
      return;
    }

    // createConnection signature: (fromId, fromType, toId, toType, connectionType, note)
    // Store polarity metadata in the note field as JSON
    const metadata = {
      polarity: connection.type || 'positive',
      delay: connection.data?.delay,
    };

    await createConnection(
      fromId,
      'system_node',
      toId,
      'system_node',
      'causal_link',
      JSON.stringify(metadata)
    );
  }, [createConnection]);

  // Handle selection change from DiagramCore
  const handleSelectionChange = useCallback((selection) => {
    if (selection.elements?.length > 0) {
      selectElement(parseInt(selection.elements[0]));
    } else {
      selectElement(null);
    }
  }, [selectElement]);

  // Handle changes from DiagramCore (for connections deletion, etc.)
  const handleConnectionsChange = useCallback((newConnections, change) => {
    if (change?.type === 'delete' && change.id) {
      deleteConnection(parseInt(change.id));
    }
  }, [deleteConnection]);

  // Stencil configuration
  const stencilConfig = useMemo(() => ({
    stencils: SYSTEMS_STENCILS,
    showPalette: true,
    palettePosition: 'left',
    groupBy: 'group',
    searchable: false,
    allowDrag: true,
    allowClick: true,
  }), []);

  // Connection configuration
  const connectionConfig = useMemo(() => ({
    types: CAUSAL_CONNECTIONS,
    defaultType: 'positive',
    style: 'arc',
    curvature: 0.25,
    showLabels: true,
    showTypeSelector: true,
    labelPosition: 'center',
    editableLabels: false,
    mode: 'edge',
    highlightOnHover: true,
    highlightConnected: true,
  }), []);

  // Show empty state if no nodes
  if (nodes.length === 0 && !showCreateModal && !showWizard) {
    return (
      <div className="srs-space srs-space--systems">
        <div className="srs-space-toolbar">
          <button
            className="srs-btn srs-btn--primary"
            onClick={() => setShowWizard(true)}
          >
            <AutoFixHighIcon fontSize="small" />
            Build Guided
          </button>
          <button
            className="srs-btn srs-btn--secondary"
            onClick={() => setShowCreateModal(true)}
          >
            <AddIcon fontSize="small" />
            Add Manually
          </button>
        </div>
        <div className="srs-space__scroll-wrapper">
          <div className="srs-empty-state srs-empty-state--systems">
            <div className="srs-empty-icon">
              <AutoFixHighIcon style={{ fontSize: 48 }} />
            </div>
            <h3>Map Your System</h3>
            <p>
              Understand how different factors influence each other.
              Discover reinforcing and balancing feedback loops.
            </p>
            <div className="srs-empty-actions">
              <button
                className="srs-btn srs-btn--primary srs-btn--large"
                onClick={() => setShowWizard(true)}
              >
                <AutoFixHighIcon fontSize="small" />
                Build with Guided Wizard
              </button>
              <p className="srs-empty-hint">
                The wizard will help you identify variables and their relationships step by step.
              </p>
              <button
                className="srs-btn srs-btn--ghost"
                onClick={() => setShowCreateModal(true)}
              >
                Or start from scratch
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show wizard modal
  if (showWizard) {
    return (
      <>
        <div className="wizard-backdrop" onClick={() => setShowWizard(false)} />
        <SystemsWizard
          onComplete={() => setShowWizard(false)}
          onCancel={() => setShowWizard(false)}
        />
      </>
    );
  }

  return (
    <div className="srs-space srs-space--systems srs-space--diagram">
      {/* Wizard modal when open */}
      {showWizard && (
        <>
          <div className="wizard-backdrop" onClick={() => setShowWizard(false)} />
          <SystemsWizard
            onComplete={() => setShowWizard(false)}
            onCancel={() => setShowWizard(false)}
          />
        </>
      )}

      {/* Toolbar */}
      <div className="srs-space-toolbar">
        <div className="srs-toolbar-actions">
          <button
            className="srs-btn srs-btn--secondary"
            onClick={() => setShowWizard(true)}
            title="Add more elements with the guided wizard"
          >
            <AutoFixHighIcon fontSize="small" />
            Build Guided
          </button>
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
            <TrendingUpIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: 2 }} />
            {stats.reinforcing} reinforcing
          </span>
          <span className="srs-stat-divider">|</span>
          <span style={{ color: '#ef4444' }}>
            <TrendingDownIcon fontSize="small" style={{ verticalAlign: 'middle', marginRight: 2 }} />
            {stats.balancing} balancing
          </span>
        </div>
      </div>

      {/* DiagramCore Canvas */}
      <div className="srs-diagram-container">
        <DiagramCore
          key={diagramKey}
          ref={diagramRef}
          diagramId="srs-systems-map"
          grid="dots"
          stencils={stencilConfig}
          connections={connectionConfig}
          canvas={{
            width: 'auto',
            height: 'auto',
            minWidth: 1200,
            minHeight: 800,
            pannable: true,
            zoomable: true,
            editable: true,
            deletable: true,
            showMinimap: false,
            showZoomControls: true,
            zoomControlsPosition: 'bottom-right',
          }}
          palette={{ enabled: true, position: 'left' }}
          propertiesPanel={{ enabled: true, position: 'right' }}
          defaultElements={diagramElements}
          defaultConnections={diagramConnections}
          onElementCreate={handleElementCreate}
          onElementUpdate={handleElementUpdate}
          onElementDelete={handleElementDelete}
          onConnectionCreate={handleConnectionCreate}
          onConnectionsChange={handleConnectionsChange}
          onSelectionChange={handleSelectionChange}
          className="srs-systems-diagram"
        />
      </div>

      {/* Legend */}
      <div className="srs-legend srs-legend--bottom">
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
          Balancing (-)
        </span>
      </div>
    </div>
  );
}
