// pages/flow-designer.js
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
  MarkerType,
  Handle,
  Position,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useDomains } from '../components/DomainContext';

// Custom Node Types
const ProcessNode = ({ data, selected }) => (
  <div className={`flow-node flow-node-process ${selected ? 'selected' : ''}`} style={{ borderColor: data.color || '#3b82f6' }}>
    <Handle type="target" position={Position.Top} />
    <div className="flow-node-header">
      <div className="flow-node-icon" style={{ backgroundColor: (data.color || '#3b82f6') + '20' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={data.color || '#3b82f6'}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      </div>
      <span className="flow-node-title">{data.label || 'Process'}</span>
    </div>
    {data.description && <div className="flow-node-subtitle">{data.description}</div>}
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const DecisionNode = ({ data, selected }) => (
  <div className={`flow-node flow-node-decision ${selected ? 'selected' : ''}`} style={{ borderColor: data.color || '#f59e0b' }}>
    <Handle type="target" position={Position.Top} />
    <div className="flow-node-header">
      <div className="flow-node-icon" style={{ backgroundColor: (data.color || '#f59e0b') + '20' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={data.color || '#f59e0b'}>
          <polygon points="12,2 22,12 12,22 2,12" />
        </svg>
      </div>
      <span className="flow-node-title">{data.label || 'Decision'}</span>
    </div>
    {data.description && <div className="flow-node-subtitle">{data.description}</div>}
    <Handle type="source" position={Position.Bottom} id="bottom" />
    <Handle type="source" position={Position.Right} id="right" />
    <Handle type="source" position={Position.Left} id="left" />
  </div>
);

const StartEndNode = ({ data, selected }) => (
  <div className={`flow-node flow-node-terminal ${selected ? 'selected' : ''}`} style={{ borderColor: data.color || '#10b981', borderRadius: 20 }}>
    <Handle type="target" position={Position.Top} />
    <div className="flow-node-header" style={{ justifyContent: 'center' }}>
      <span className="flow-node-title">{data.label || 'Start/End'}</span>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const DataNode = ({ data, selected }) => (
  <div className={`flow-node flow-node-data ${selected ? 'selected' : ''}`} style={{ borderColor: data.color || '#8b5cf6', transform: 'skewX(-10deg)' }}>
    <Handle type="target" position={Position.Top} />
    <div style={{ transform: 'skewX(10deg)' }}>
      <div className="flow-node-header">
        <div className="flow-node-icon" style={{ backgroundColor: (data.color || '#8b5cf6') + '20' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={data.color || '#8b5cf6'}>
            <path d="M4 4h16v16H4z" />
          </svg>
        </div>
        <span className="flow-node-title">{data.label || 'Data'}</span>
      </div>
      {data.description && <div className="flow-node-subtitle">{data.description}</div>}
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const EntityNode = ({ data, selected }) => (
  <div className={`flow-node flow-node-entity ${selected ? 'selected' : ''}`} style={{ borderColor: data.color || '#ec4899' }}>
    <Handle type="target" position={Position.Top} />
    <Handle type="target" position={Position.Left} id="left" />
    <div className="flow-node-header">
      <div className="flow-node-icon" style={{ backgroundColor: (data.color || '#ec4899') + '20' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={data.color || '#ec4899'}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
      <span className="flow-node-title">{data.label || 'Entity'}</span>
    </div>
    {data.description && <div className="flow-node-subtitle">{data.description}</div>}
    <Handle type="source" position={Position.Bottom} />
    <Handle type="source" position={Position.Right} id="right" />
  </div>
);

const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  terminal: StartEndNode,
  data: DataNode,
  entity: EntityNode,
};

// Node palette configuration
const nodePalette = [
  { type: 'process', label: 'Process', color: '#3b82f6', icon: 'rect' },
  { type: 'decision', label: 'Decision', color: '#f59e0b', icon: 'diamond' },
  { type: 'terminal', label: 'Start/End', color: '#10b981', icon: 'ellipse' },
  { type: 'data', label: 'Data', color: '#8b5cf6', icon: 'parallelogram' },
  { type: 'entity', label: 'Entity', color: '#ec4899', icon: 'circle' },
];

const paletteIcons = {
  rect: <rect x="4" y="6" width="16" height="12" rx="2" />,
  diamond: <polygon points="12,4 20,12 12,20 4,12" />,
  ellipse: <ellipse cx="12" cy="12" rx="8" ry="6" />,
  parallelogram: <polygon points="6,6 20,6 18,18 4,18" />,
  circle: <circle cx="12" cy="12" r="8" />,
};

let nodeId = 0;
const getNodeId = () => `node_${nodeId++}`;

function FlowDesignerInner() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ label: '', description: '', color: '' });
  const [diagramName, setDiagramName] = useState('Untitled Diagram');
  const [savedDiagrams, setSavedDiagrams] = useState([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { screenToFlowPosition } = useReactFlow();
  const { activeDomain, activeDomainObj } = useDomains();
  const [nodeTypes2, setNodeTypes2] = useState([]);

  // Load saved diagrams from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flow-designer-diagrams');
    if (saved) {
      try {
        setSavedDiagrams(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved diagrams', e);
      }
    }
  }, []);

  // Load node types for import
  useEffect(() => {
    async function loadNodeTypes() {
      try {
        const qs = activeDomain
          ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
          : '';
        const res = await fetch(`/api/node-types${qs}`);
        if (res.ok) {
          const data = await res.json();
          setNodeTypes2(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadNodeTypes();
  }, [activeDomain, activeDomainObj]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 },
    }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const nodeData = event.dataTransfer.getData('application/nodedata');

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const paletteItem = nodePalette.find(p => p.type === type);
      const parsedData = nodeData ? JSON.parse(nodeData) : {};

      const newNode = {
        id: getNodeId(),
        type,
        position,
        data: {
          label: parsedData.label || paletteItem?.label || 'New Node',
          color: parsedData.color || paletteItem?.color || '#3b82f6',
          description: '',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleEditNode = () => {
    if (!selectedNode) return;
    setEditForm({
      label: selectedNode.data.label || '',
      description: selectedNode.data.description || '',
      color: selectedNode.data.color || '#3b82f6',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, ...editForm } }
          : n
      )
    );
    setEditDialogOpen(false);
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  };

  const handleSaveDiagram = () => {
    const diagram = {
      id: Date.now().toString(),
      name: diagramName,
      nodes,
      edges,
      savedAt: new Date().toISOString(),
    };
    const updated = [...savedDiagrams.filter(d => d.name !== diagramName), diagram];
    setSavedDiagrams(updated);
    localStorage.setItem('flow-designer-diagrams', JSON.stringify(updated));
  };

  const handleLoadDiagram = (diagram) => {
    setDiagramName(diagram.name);
    setNodes(diagram.nodes || []);
    setEdges(diagram.edges || []);
    nodeId = Math.max(0, ...diagram.nodes.map(n => parseInt(n.id.replace('node_', '')) || 0)) + 1;
  };

  const handleExportJSON = () => {
    const data = { name: diagramName, nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagramName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setDiagramName(data.name || 'Imported Diagram');
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        nodeId = Math.max(0, ...(data.nodes || []).map(n => parseInt(n.id.replace('node_', '')) || 0)) + 1;
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleImportToNeo4j = async () => {
    if (nodes.length === 0) {
      alert('No nodes to import');
      return;
    }
    if (nodeTypes2.length === 0) {
      alert('No node types available. Create node types first.');
      return;
    }
    setImportDialogOpen(true);
  };

  const doImportToNeo4j = async (typeMapping) => {
    try {
      // Create nodes in Neo4j
      const nodeIdMap = {};
      for (const node of nodes) {
        const typeId = typeMapping[node.type] || nodeTypes2[0]?.id;
        if (!typeId) continue;

        const res = await fetch('/api/nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: node.data.label,
            typeId,
            description: node.data.description || undefined,
            color: node.data.color || undefined,
            x: node.position.x,
            y: node.position.y,
            domain: activeDomain || undefined,
          }),
        });
        if (res.ok) {
          const created = await res.json();
          nodeIdMap[node.id] = created.id;
        }
      }

      // Create relationships
      for (const edge of edges) {
        const sourceId = nodeIdMap[edge.source];
        const targetId = nodeIdMap[edge.target];
        if (!sourceId || !targetId) continue;

        await fetch('/api/relationships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceId,
            targetId,
            type: 'CONNECTS_TO',
            domain: activeDomain || undefined,
          }),
        });
      }

      alert(`Imported ${Object.keys(nodeIdMap).length} nodes and ${edges.length} relationships to Neo4j`);
      setImportDialogOpen(false);
    } catch (e) {
      console.error(e);
      alert('Failed to import to Neo4j');
    }
  };

  const onDragStart = (event, nodeType, nodeData) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/nodedata', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box className="flow-designer-page">
      <Box className="flow-designer-header">
        <Box className="flow-designer-title">
          <TextField
            size="small"
            value={diagramName}
            onChange={(e) => setDiagramName(e.target.value)}
            variant="standard"
            sx={{ minWidth: 200 }}
            inputProps={{ style: { fontSize: 18, fontWeight: 600 } }}
          />
          <Chip label="React Flow" size="small" color="primary" variant="outlined" />
        </Box>
        <Box className="flow-designer-actions">
          <Tooltip title="Save diagram">
            <Button variant="outlined" size="small" startIcon={<SaveIcon />} onClick={handleSaveDiagram}>
              Save
            </Button>
          </Tooltip>
          <Tooltip title="Export as JSON">
            <IconButton size="small" onClick={handleExportJSON}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Import JSON">
            <IconButton size="small" component="label">
              <FileUploadIcon />
              <input type="file" hidden accept=".json" onChange={handleImportJSON} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Import to Neo4j">
            <Button variant="contained" size="small" startIcon={<CloudUploadIcon />} onClick={handleImportToNeo4j}>
              Import to Graph
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Box className="flow-designer-body">
        <Box className="flow-designer-sidebar">
          <Box className="flow-sidebar-section">
            <h3>Node Palette</h3>
            <Box className="node-palette">
              {nodePalette.map((item) => (
                <div
                  key={item.type}
                  className="palette-node"
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type, item)}
                >
                  <div className="palette-node-icon" style={{ backgroundColor: item.color + '20' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={item.color}>
                      {paletteIcons[item.icon]}
                    </svg>
                  </div>
                  <span className="palette-node-label">{item.label}</span>
                </div>
              ))}
            </Box>
          </Box>

          {selectedNode && (
            <Box className="flow-sidebar-section">
              <h3>Selected Node</h3>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>{selectedNode.data.label}</strong></Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Type: {selectedNode.type}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={handleEditNode}>Edit</Button>
                <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteNode}>
                  Delete
                </Button>
              </Box>
            </Box>
          )}

          <Box className="flow-sidebar-section">
            <h3>Saved Diagrams</h3>
            {savedDiagrams.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No saved diagrams</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {savedDiagrams.map((d) => (
                  <Button
                    key={d.id}
                    variant="text"
                    size="small"
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                    onClick={() => handleLoadDiagram(d)}
                  >
                    {d.name}
                  </Button>
                ))}
              </Box>
            )}
          </Box>

          <Box className="flow-sidebar-section" sx={{ flex: 1 }}>
            <h3>Tips</h3>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
              - Drag nodes from palette to canvas<br />
              - Connect nodes by dragging from handles<br />
              - Click a node to select and edit<br />
              - Use "Import to Graph" to save to Neo4j
            </Typography>
          </Box>
        </Box>

        <Box className="flow-designer-canvas" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            defaultEdgeOptions={{
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed },
            }}
          >
            <Background gap={15} size={1} color="var(--border)" />
            <Controls />
            <MiniMap
              nodeColor={(n) => n.data?.color || '#888'}
              maskColor="rgba(0,0,0,0.1)"
            />
            <Panel position="top-right">
              <Box sx={{ background: 'var(--panel)', p: 1, borderRadius: 1, border: '1px solid var(--border)' }}>
                <Typography variant="caption" color="text.secondary">
                  Nodes: {nodes.length} | Edges: {edges.length}
                </Typography>
              </Box>
            </Panel>
          </ReactFlow>
        </Box>
      </Box>

      {/* Edit Node Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Node</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Label"
            value={editForm.label}
            onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            multiline
            rows={2}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <TextField
              type="color"
              label="Color"
              value={editForm.color}
              onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
              sx={{ width: 80 }}
            />
            <TextField
              value={editForm.color}
              onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
              sx={{ flex: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Import to Neo4j Dialog */}
      <ImportMappingDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        flowNodeTypes={[...new Set(nodes.map(n => n.type))]}
        neo4jNodeTypes={nodeTypes2}
        onImport={doImportToNeo4j}
      />
    </Box>
  );
}

// Import Mapping Dialog Component
function ImportMappingDialog({ open, onClose, flowNodeTypes, neo4jNodeTypes, onImport }) {
  const [mapping, setMapping] = useState({});

  useEffect(() => {
    // Initialize mapping with first available type
    const initial = {};
    flowNodeTypes.forEach(ft => {
      initial[ft] = neo4jNodeTypes[0]?.id || '';
    });
    setMapping(initial);
  }, [flowNodeTypes, neo4jNodeTypes]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Map Node Types</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Map flow diagram node types to your Neo4j node types:
        </Typography>
        {flowNodeTypes.map(ft => (
          <Box key={ft} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography sx={{ width: 100, textTransform: 'capitalize' }}>{ft}</Typography>
            <span>→</span>
            <TextField
              select
              size="small"
              value={mapping[ft] || ''}
              onChange={(e) => setMapping({ ...mapping, [ft]: e.target.value })}
              sx={{ flex: 1 }}
              SelectProps={{ native: true }}
            >
              {neo4jNodeTypes.map(nt => (
                <option key={nt.id} value={nt.id}>{nt.name}</option>
              ))}
            </TextField>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onImport(mapping)}>Import</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function FlowDesignerPage() {
  return (
    <Box className="page-container" sx={{ p: 0, height: '100%' }}>
      <ReactFlowProvider>
        <FlowDesignerInner />
      </ReactFlowProvider>
    </Box>
  );
}
