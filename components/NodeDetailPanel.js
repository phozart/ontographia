// components/NodeDetailPanel.js
import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Collapse,
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttributeEditor from './AttributeEditor';
import RelationshipFormDialog from './RelationshipFormDialog';
import { useDomains } from './DomainContext';

// Utility to calculate contrasting text color
function getContrastColor(hexColor) {
  if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Shape preview SVG paths
const shapePreview = {
  ellipse: <ellipse cx="24" cy="16" rx="20" ry="12" />,
  rectangle: <rect x="4" y="4" width="40" height="24" />,
  'round-rectangle': <rect x="4" y="4" width="40" height="24" rx="6" />,
  diamond: <polygon points="24,2 46,16 24,30 2,16" />,
  triangle: <polygon points="24,2 46,30 2,30" />,
  hexagon: <polygon points="12,4 36,4 46,16 36,28 12,28 2,16" />,
  star: <polygon points="24,2 28,12 40,12 30,20 34,30 24,24 14,30 18,20 8,12 20,12" />,
  tag: <polygon points="4,4 36,4 46,16 36,28 4,28" />,
  vee: <polygon points="2,4 24,16 46,4 24,28" />,
};

export default function NodeDetailPanel({
  selectedNode,
  selectedEdge,
  onDataChanged,
  onClearSelection,
  onHide,
  createSignal = 0,
  editSignal = 0,
  relationshipSignal = 0,
  canEdit = true,
}) {
  const [formName, setFormName] = useState('');
  const [formLayer, setFormLayer] = useState('');
  const [formTypeId, setFormTypeId] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [formAttributes, setFormAttributes] = useState({});
  const [formColor, setFormColor] = useState('');
  const [colorCleared, setColorCleared] = useState(false);
  const [formShape, setFormShape] = useState('');
  const [shapeCleared, setShapeCleared] = useState(false);
  const [highlightColor, setHighlightColor] = useState('');
  const [lastCreateSignal, setLastCreateSignal] = useState(0);
  const [lastEditSignal, setLastEditSignal] = useState(0);
  const [lastRelationshipSignal, setLastRelationshipSignal] = useState(0);

  const [nodeTypes, setNodeTypes] = useState([]);
  const [allNodes, setAllNodes] = useState([]);
  const [rels, setRels] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [relationshipDialogOpen, setRelationshipDialogOpen] = useState(false);
  const [relationshipToEdit, setRelationshipToEdit] = useState(null);
  const [attributesExpanded, setAttributesExpanded] = useState(true);
  const [relationsExpanded, setRelationsExpanded] = useState(true);
  const { activeDomain, activeDomainObj } = useDomains();

  useEffect(() => {
    loadNodeTypes();
    loadAllNodes();
  }, [activeDomain, activeDomainObj]);

  useEffect(() => {
    setErrorMsg('');
    if (selectedNode && selectedNode.data && selectedNode.data.raw) {
      const raw = selectedNode.data.raw;
      setFormName(raw.name || '');
      setFormLayer(raw.layer || '');
      setFormTypeId(raw.typeId || '');
      setFormDescription(raw.description || '');
      setFormIcon(raw.icon || '');
      setFormWeight(raw.weight === null || raw.weight === undefined ? '' : String(raw.weight));
      setFormAttributes(raw.attributes || {});
      setFormColor(raw.color || '');
      setColorCleared(false);
      setFormShape(raw.shape || '');
      setShapeCleared(false);
      setHighlightColor(raw.color || '');
      loadRelationshipsForNode(raw.id);
    } else {
      resetForm();
      setRels([]);
      setEditOpen(false);
      setRelationshipToEdit(null);
      setRelationshipDialogOpen(false);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (createSignal > lastCreateSignal) {
      resetForm();
      setCreateOpen(true);
      setEditOpen(false);
      setRelationshipDialogOpen(false);
      setRelationshipToEdit(null);
      setFormTypeId(nodeTypes[0]?.id || '');
      setLastCreateSignal(createSignal);
    }
  }, [createSignal, lastCreateSignal, nodeTypes]);

  useEffect(() => {
    if (editSignal > lastEditSignal) {
      setEditOpen(true);
      setLastEditSignal(editSignal);
    }
  }, [editSignal, lastEditSignal]);

  useEffect(() => {
    if (relationshipSignal > lastRelationshipSignal) {
      setRelationshipToEdit(null);
      setRelationshipDialogOpen(true);
      setLastRelationshipSignal(relationshipSignal);
    }
  }, [relationshipSignal, lastRelationshipSignal]);

  function resetForm() {
    setFormName('');
    setFormLayer('');
    setFormTypeId('');
    setFormDescription('');
    setFormIcon('');
    setFormWeight('');
    setFormAttributes({});
    setFormColor('');
    setColorCleared(false);
    setFormShape('');
    setShapeCleared(false);
    setHighlightColor('');
  }

  async function loadNodeTypes() {
    try {
      const qs = activeDomain
        ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
        : '';
      const res = await fetch(`/api/node-types${qs}`);
      if (!res.ok) return;
      const data = await res.json();
      setNodeTypes(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadAllNodes() {
    try {
      const qs = activeDomain
        ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
        : '';
      const res = await fetch(`/api/nodes${qs}`);
      if (!res.ok) return;
      const data = await res.json();
      setAllNodes(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadRelationshipsForNode(nodeId) {
    try {
      const domainPart = activeDomain
        ? `&domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
        : '';
      const res = await fetch(`/api/relationships?nodeId=${encodeURIComponent(nodeId)}${domainPart}`);
      if (!res.ok) return;
      const data = await res.json();
      const normalized = Array.isArray(data)
        ? data.map(rel => {
            const isOutgoing = rel.direction === 'out';
            const sourceId = rel.sourceId || (isOutgoing ? nodeId : rel.otherNodeId);
            const targetId = rel.targetId || (isOutgoing ? rel.otherNodeId : nodeId);
            return { ...rel, sourceId, targetId };
          })
        : [];
      setRels(normalized);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreateNode(e) {
    e.preventDefault();
    setErrorMsg('');
    if (!formName || !formTypeId) {
      setErrorMsg('Name and type are required.');
      return;
    }
    try {
      const res = await fetch('/api/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          typeId: formTypeId,
          layer: formLayer || undefined,
          description: formDescription || undefined,
          icon: formIcon || undefined,
          color: colorCleared ? null : formColor || undefined,
          shape: shapeCleared ? null : formShape || undefined,
          weight: formWeight === '' ? undefined : isNaN(parseFloat(formWeight)) ? undefined : parseFloat(formWeight),
          attributes: formAttributes,
          domain: activeDomain || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Failed to create node');
        return;
      }
      setCreateOpen(false);
      resetForm();
      if (onDataChanged) onDataChanged();
      loadAllNodes();
    } catch (e) {
      console.error(e);
      setErrorMsg('Unexpected error creating node');
    }
  }

  async function handleUpdateNode(e) {
    e.preventDefault();
    setErrorMsg('');
    if (!selectedNode || !formName) {
      setErrorMsg('Name is required.');
      return;
    }
    try {
      const res = await fetch(`/api/nodes/${encodeURIComponent(selectedNode.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          layer: formLayer || undefined,
          description: formDescription || undefined,
          icon: formIcon || undefined,
          color: colorCleared ? null : formColor || undefined,
          shape: shapeCleared ? null : formShape || undefined,
          weight: formWeight === '' ? undefined : isNaN(parseFloat(formWeight)) ? undefined : parseFloat(formWeight),
          attributes: formAttributes,
          domain: activeDomain || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Failed to update node');
        return;
      }
      setEditOpen(false);
      if (onDataChanged) onDataChanged();
      loadAllNodes();
    } catch (e) {
      console.error(e);
      setErrorMsg('Unexpected error updating node');
    }
  }

  async function handleDeleteNode() {
    if (!selectedNode) return;
    setErrorMsg('');
    const ok = window.confirm('Delete this node and its relationships?');
    if (!ok) return;
    try {
      const res = await fetch(`/api/nodes/${encodeURIComponent(selectedNode.id)}`, { method: 'DELETE' });
      if (res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Failed to delete node');
        return;
      }
      if (onClearSelection) onClearSelection();
      if (onDataChanged) onDataChanged();
      loadAllNodes();
      setRels([]);
    } catch (e) {
      console.error(e);
      setErrorMsg('Unexpected error deleting node');
    }
  }

  async function handleQuickColorSave(e) {
    e.preventDefault();
    if (!selectedNode || !selectedNode.id) return;
    try {
      const res = await fetch(`/api/nodes/${encodeURIComponent(selectedNode.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName || selectedNode.data?.raw?.name || 'Node', color: highlightColor || formColor }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Failed to update color');
        return;
      }
      setColorPickerOpen(false);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error(err);
      setErrorMsg('Unexpected error updating color');
    }
  }

  function typeSuggestionKeys(typeId) {
    const keys = new Set();
    (allNodes || []).forEach(n => {
      if (typeId && n.typeId !== typeId) return;
      if (n.attributes) Object.keys(n.attributes).forEach(k => keys.add(k));
    });
    return Array.from(keys).sort();
  }

  async function handleDeleteRelationship(relId) {
    setErrorMsg('');
    const ok = window.confirm('Delete this relationship?');
    if (!ok) return;
    try {
      const res = await fetch(`/api/relationships/${encodeURIComponent(relId)}`, { method: 'DELETE' });
      if (res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Failed to delete relationship');
        return;
      }
      if (onDataChanged) onDataChanged();
      if (selectedNode?.data?.raw?.id) loadRelationshipsForNode(selectedNode.data.raw.id);
    } catch (e) {
      console.error(e);
      setErrorMsg('Unexpected error deleting relationship');
    }
  }

  function getNodeTypeInfo(typeId) {
    return nodeTypes.find(t => t.id === typeId) || {};
  }

  function renderNodePreview() {
    if (!selectedNode?.data?.raw) return null;
    const raw = selectedNode.data.raw;
    const typeInfo = getNodeTypeInfo(raw.typeId);
    const nodeColor = raw.color || typeInfo.color || '#00d4aa';
    const nodeShape = raw.shape || typeInfo.shape || 'ellipse';
    const ShapeSvg = shapePreview[nodeShape] || shapePreview.ellipse;

    return (
      <Box className="node-preview-card">
        <Box className="node-preview-visual" sx={{ backgroundColor: nodeColor + '15' }}>
          <svg viewBox="0 0 48 32" width="36" height="24">
            <g fill={nodeColor} stroke={nodeColor} strokeWidth="1">
              {ShapeSvg}
            </g>
          </svg>
        </Box>
        <Box className="node-preview-info" sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" className="node-preview-name" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {raw.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
            <Chip
              label={raw.typeName || typeInfo.name || 'Unknown'}
              size="small"
              sx={{ backgroundColor: nodeColor, color: getContrastColor(nodeColor), fontWeight: 500, height: 20, fontSize: 11 }}
            />
            {raw.layer && (
              <Chip label={raw.layer} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
            )}
          </Box>
        </Box>
        {canEdit && (
          <Box className="node-preview-actions" sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Tooltip title="Edit" placement="left">
              <IconButton size="small" onClick={() => setEditOpen(true)} sx={{ padding: '4px' }}>
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Color" placement="left">
              <IconButton size="small" onClick={() => setColorPickerOpen(true)} sx={{ padding: '4px' }}>
                <ColorLensIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" placement="left">
              <IconButton size="small" color="error" onClick={handleDeleteNode} sx={{ padding: '4px' }}>
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    );
  }

  function renderNodeDetails() {
    if (!selectedNode?.data?.raw) return null;
    const raw = selectedNode.data.raw;

    return (
      <Box className="node-details-section">
        {raw.description && (
          <Box className="detail-item">
            <Typography variant="caption" color="text.secondary">Description</Typography>
            <Typography variant="body2">{raw.description}</Typography>
          </Box>
        )}
        <Box className="detail-row">
          <Box className="detail-item">
            <Typography variant="caption" color="text.secondary">Weight</Typography>
            <Typography variant="body2">{raw.weight ?? '-'}</Typography>
          </Box>
          <Box className="detail-item">
            <Typography variant="caption" color="text.secondary">ID</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11 }}>{raw.id}</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  function renderAttributes() {
    const raw = selectedNode?.data?.raw;
    if (!raw) return null;
    const attrs = raw.attributes || {};
    const attrEntries = Object.entries(attrs);

    return (
      <Box className="collapsible-section">
        <Box
          className="section-header"
          onClick={() => setAttributesExpanded(!attributesExpanded)}
        >
          <Typography variant="subtitle2">
            Attributes {attrEntries.length > 0 && `(${attrEntries.length})`}
          </Typography>
          {attributesExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </Box>
        <Collapse in={attributesExpanded}>
          <Box className="section-content">
            {attrEntries.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No attributes</Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {attrEntries.map(([k, v]) => (
                  <Chip
                    key={k}
                    label={<><strong>{k}:</strong> {String(v)}</>}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Collapse>
      </Box>
    );
  }

  function renderRelationships() {
    if (!selectedNode?.data?.raw) return null;
    const selectedId = selectedNode.data.raw.id;

    return (
      <Box className="collapsible-section">
        <Box
          className="section-header"
          onClick={() => setRelationsExpanded(!relationsExpanded)}
        >
          <Typography variant="subtitle2">
            Relationships ({rels.length})
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {canEdit && (
              <Tooltip title="Add relationship">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRelationshipToEdit(null);
                    setRelationshipDialogOpen(true);
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {relationsExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </Box>
        </Box>
        <Collapse in={relationsExpanded}>
          <Box className="section-content relationships-list">
            {rels.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No relationships</Typography>
            ) : (
              <Stack spacing={1}>
                {rels.map(rel => {
                  const isOutgoing = rel.sourceId === selectedId || rel.direction === 'out';
                  const otherNodeId = isOutgoing ? rel.targetId : rel.sourceId;
                  const otherNode = allNodes.find(n => n.id === otherNodeId);
                  const otherLabel = rel.otherNodeName || (otherNode ? otherNode.name : 'Unknown');
                  const otherType = otherNode?.typeName || '';

                  return (
                    <Box key={rel.id || `${rel.sourceId}-${rel.type}-${rel.targetId}`} className="relationship-card">
                      <Box className="relationship-visual">
                        {isOutgoing ? (
                          <ArrowForwardIcon fontSize="small" className="rel-arrow outgoing" />
                        ) : (
                          <ArrowBackIcon fontSize="small" className="rel-arrow incoming" />
                        )}
                      </Box>
                      <Box className="relationship-info">
                        <Typography variant="body2" className="rel-type">{rel.type}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isOutgoing ? 'to' : 'from'} <strong>{otherLabel}</strong>
                          {otherType && ` (${otherType})`}
                        </Typography>
                      </Box>
                      {canEdit && (
                        <Box className="relationship-actions">
                          <IconButton
                            size="small"
                            onClick={() => {
                              const sourceId = isOutgoing ? selectedId : rel.otherNodeId || rel.sourceId;
                              const targetId = isOutgoing ? rel.otherNodeId || rel.targetId : selectedId;
                              setRelationshipToEdit({ ...rel, sourceId, targetId });
                              setRelationshipDialogOpen(true);
                            }}
                          >
                            <EditIcon fontSize="inherit" />
                          </IconButton>
                          {rel.id && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteRelationship(rel.id)}
                            >
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          )}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Collapse>
      </Box>
    );
  }

  function renderEmptyState() {
    return (
      <Box className="empty-state">
        <Box className="empty-state-icon">
          <svg viewBox="0 0 48 48" width="64" height="64">
            <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="24" cy="24" r="4" fill="var(--text-secondary)" />
          </svg>
        </Box>
        <Typography variant="body1" color="text.secondary">No node selected</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click a node in the graph or create a new one
        </Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setCreateOpen(true);
              resetForm();
              setFormTypeId(nodeTypes[0]?.id || '');
            }}
          >
            Create Node
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box className="node-detail-panel">
      <Box className="panel-header">
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Details</Typography>
        {onHide && (
          <IconButton size="small" onClick={onHide} aria-label="Hide details">
            <span style={{ fontSize: 16 }}>&times;</span>
          </IconButton>
        )}
      </Box>

      {errorMsg && <Box className="error-banner">{errorMsg}</Box>}

      {selectedNode?.data?.raw ? (
        <Box className="panel-content">
          {renderNodePreview()}
          <Divider sx={{ my: 1.5 }} />
          {renderNodeDetails()}
          {renderAttributes()}
          {renderRelationships()}
        </Box>
      ) : (
        renderEmptyState()
      )}

      <RelationshipFormDialog
        open={relationshipDialogOpen}
        relationship={relationshipToEdit}
        initialSourceId={selectedNode?.data?.raw?.id}
        onClose={() => {
          setRelationshipDialogOpen(false);
          setRelationshipToEdit(null);
        }}
        onSaved={() => {
          setRelationshipDialogOpen(false);
          setRelationshipToEdit(null);
          if (selectedNode?.data?.raw?.id) loadRelationshipsForNode(selectedNode.data.raw.id);
          if (onDataChanged) onDataChanged();
        }}
      />

      {/* Create Node Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Node</DialogTitle>
        <form onSubmit={handleCreateNode}>
          <DialogContent dividers>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={formTypeId} onChange={e => setFormTypeId(e.target.value)}>
                {nodeTypes.map(t => (
                  <MenuItem key={t.id} value={t.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: t.color || '#888' }} />
                      {t.name} {t.layer && `(${t.layer})`}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth margin="dense" label="Name" value={formName} onChange={e => setFormName(e.target.value)} required />
            <TextField fullWidth margin="dense" label="Layer (optional)" value={formLayer} onChange={e => setFormLayer(e.target.value)} />
            <TextField fullWidth margin="dense" label="Description" value={formDescription} onChange={e => setFormDescription(e.target.value)} multiline rows={2} />
            <TextField fullWidth margin="dense" label="Weight" type="number" value={formWeight} onChange={e => setFormWeight(e.target.value)} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Attributes</Typography>
              <AttributeEditor attributes={formAttributes} onChange={setFormAttributes} suggestionKeys={typeSuggestionKeys(formTypeId)} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <TextField
                fullWidth
                margin="dense"
                label="Color"
                type="color"
                value={formColor || '#00d4aa'}
                onChange={e => { setFormColor(e.target.value); setColorCleared(false); }}
                sx={{ flex: '0 0 80px' }}
              />
              <TextField
                fullWidth
                margin="dense"
                value={formColor || 'Inherit from type'}
                InputProps={{ readOnly: true }}
              />
              <Button variant="outlined" size="small" onClick={() => { setFormColor(''); setColorCleared(true); }}>
                Reset
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!canEdit}>Create</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Node Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Node</DialogTitle>
        <form onSubmit={handleUpdateNode}>
          <DialogContent dividers>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={formTypeId} onChange={e => setFormTypeId(e.target.value)}>
                {nodeTypes.map(t => (
                  <MenuItem key={t.id} value={t.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: t.color || '#888' }} />
                      {t.name} {t.layer && `(${t.layer})`}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth margin="dense" label="Name" value={formName} onChange={e => setFormName(e.target.value)} required />
            <TextField fullWidth margin="dense" label="Layer" value={formLayer} onChange={e => setFormLayer(e.target.value)} />
            <TextField fullWidth margin="dense" label="Description" value={formDescription} onChange={e => setFormDescription(e.target.value)} multiline rows={2} />
            <TextField fullWidth margin="dense" label="Weight" type="number" value={formWeight} onChange={e => setFormWeight(e.target.value)} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <TextField
                fullWidth
                margin="dense"
                label="Color"
                type="color"
                value={formColor || '#00d4aa'}
                onChange={e => { setFormColor(e.target.value); setColorCleared(false); }}
                sx={{ flex: '0 0 80px' }}
              />
              <TextField
                fullWidth
                margin="dense"
                value={formColor || 'Inherit from type'}
                InputProps={{ readOnly: true }}
              />
              <Button variant="outlined" size="small" onClick={() => { setFormColor(''); setColorCleared(true); }}>
                Reset
              </Button>
            </Box>
            <TextField
              select
              fullWidth
              margin="dense"
              label="Shape"
              value={formShape}
              onChange={e => { setFormShape(e.target.value); setShapeCleared(false); }}
              SelectProps={{ native: true, displayEmpty: true }}
              InputLabelProps={{ shrink: true }}
            >
              <option value="">Inherit from type</option>
              <optgroup label="Basic Shapes">
                <option value="ellipse">Ellipse (Circle)</option>
                <option value="rectangle">Rectangle</option>
                <option value="round-rectangle">Rounded Rectangle</option>
                <option value="cut-rectangle">Cut Rectangle</option>
                <option value="barrel">Barrel</option>
              </optgroup>
              <optgroup label="Polygons">
                <option value="triangle">Triangle</option>
                <option value="diamond">Diamond</option>
                <option value="pentagon">Pentagon</option>
                <option value="hexagon">Hexagon</option>
                <option value="heptagon">Heptagon</option>
                <option value="octagon">Octagon</option>
                <option value="concave-hexagon">Concave Hexagon</option>
              </optgroup>
              <optgroup label="Special">
                <option value="star">Star</option>
                <option value="tag">Tag</option>
                <option value="round-tag">Round Tag</option>
                <option value="vee">Vee (Arrow)</option>
                <option value="rhomboid">Rhomboid</option>
                <option value="bottom-round-rectangle">Bottom Rounded</option>
              </optgroup>
            </TextField>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Attributes</Typography>
              <AttributeEditor attributes={formAttributes} onChange={setFormAttributes} suggestionKeys={typeSuggestionKeys(formTypeId || selectedNode?.data?.raw?.typeId)} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!canEdit}>Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Color Picker Dialog */}
      <Dialog open={colorPickerOpen} onClose={() => setColorPickerOpen(false)} maxWidth="xs">
        <DialogTitle>Highlight Color</DialogTitle>
        <form onSubmit={handleQuickColorSave}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <input
                type="color"
                value={highlightColor || '#00d4aa'}
                onChange={e => { setHighlightColor(e.target.value); setFormColor(e.target.value); }}
                style={{ width: 100, height: 100, border: 'none', cursor: 'pointer', borderRadius: 8 }}
              />
              <TextField
                size="small"
                value={highlightColor || '#00d4aa'}
                onChange={e => { setHighlightColor(e.target.value); setFormColor(e.target.value); }}
                sx={{ width: 120 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setColorPickerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!canEdit}>Apply</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
