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
  Typography
} from '@mui/material';
import AttributeEditor from './AttributeEditor';
import RelationshipFormDialog from './RelationshipFormDialog';

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

  useEffect(() => {
    loadNodeTypes();
    loadAllNodes();
  }, []);

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
      const res = await fetch('/api/node-types');
      if (!res.ok) return;
      const data = await res.json();
      setNodeTypes(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadAllNodes() {
    try {
      const res = await fetch('/api/nodes');
      if (!res.ok) return;
      const data = await res.json();
      setAllNodes(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadRelationshipsForNode(nodeId) {
    try {
      const res = await fetch(`/api/relationships?nodeId=${encodeURIComponent(nodeId)}`);
      if (!res.ok) return;
      const data = await res.json();
      // Normalize per-node relationship payload to include source/target ids for downstream consumers
      const normalized = Array.isArray(data)
        ? data.map(rel => {
            const isOutgoing = rel.direction === 'out';
            const sourceId = rel.sourceId || (isOutgoing ? nodeId : rel.otherNodeId);
            const targetId = rel.targetId || (isOutgoing ? rel.otherNodeId : nodeId);
            return {
              ...rel,
              sourceId,
              targetId,
            };
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
          weight:
            formWeight === ''
              ? undefined
              : isNaN(parseFloat(formWeight))
                ? undefined
                : parseFloat(formWeight),
          attributes: formAttributes
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
          weight:
            formWeight === ''
              ? undefined
              : isNaN(parseFloat(formWeight))
                ? undefined
                : parseFloat(formWeight),
          attributes: formAttributes
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
      const res = await fetch(`/api/nodes/${encodeURIComponent(selectedNode.id)}`, {
        method: 'DELETE',
      });
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
      if (n.attributes) {
        Object.keys(n.attributes).forEach(k => keys.add(k));
      }
    });
    return Array.from(keys).sort();
  }

  function renderNodeSection() {
    if (selectedNode && selectedNode.data && selectedNode.data.raw) {
      const raw = selectedNode.data.raw;
      return (
        <>
          <h3>Node details</h3>
          {errorMsg && <p className="error-msg">{errorMsg}</p>}
          <p><strong>ID:</strong> {raw.id}</p>
          <p><strong>Name:</strong> {raw.name}</p>
          <p><strong>Type:</strong> {raw.typeName}</p>
          <p><strong>Layer:</strong> {raw.layer}</p>
          {raw.description && <p><strong>Description:</strong> {raw.description}</p>}
          <p><strong>Weight:</strong> {raw.weight ?? '-'}</p>
        {canEdit && (
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <Button variant="contained" size="small" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="contained" color="error" size="small" onClick={handleDeleteNode}>
              Delete
            </Button>
            <Button variant="outlined" size="small" onClick={() => setColorPickerOpen(true)}>
              Highlight
            </Button>
          </div>
        )}
          {raw.attributes && Object.keys(raw.attributes).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p><strong>Attributes:</strong></p>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Object.entries(raw.attributes).map(([k, v]) => (
                  <Chip key={k} label={`${k}: ${v}`} size="small" />
                ))}
              </Stack>
            </div>
          )}
        </>
      );
  }

    return (
      <>
        <h3>No node selected</h3>
        {errorMsg && <p className="error-msg">{errorMsg}</p>}
        <p>Select a node in the graph, or create a new one.</p>
        <Button
          variant="contained"
          onClick={() => {
            setCreateOpen(true);
            resetForm();
            setFormTypeId(nodeTypes[0]?.id || '');
          }}
        >
          + Create node
        </Button>
      </>
    );
  }

  function relationshipLabel(rel) {
    if (!rel) return '';
    const selectedId = selectedNode?.data?.raw?.id;
    const isOutgoing = rel.sourceId === selectedId || rel.direction === 'out';
    const otherNodeId = isOutgoing ? rel.targetId : rel.sourceId;
    const otherNode = allNodes.find(n => n.id === otherNodeId);
    const otherLabel =
      rel.otherNodeName ||
      (otherNode ? `${otherNode.name} (${otherNode.typeName || 'Unassigned'})` : otherNodeId);
            const arrow = isOutgoing ? '->' : '<-';
    return `${rel.type} ${arrow} ${otherLabel}`;
  }

  async function handleDeleteRelationship(relId) {
    setErrorMsg('');
    const ok = window.confirm('Delete this relationship?');
    if (!ok) return;
    try {
      const res = await fetch(`/api/relationships/${encodeURIComponent(relId)}`, {
        method: 'DELETE',
      });
      if (res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Failed to delete relationship');
        return;
      }
      if (onDataChanged) onDataChanged();
      if (selectedNode?.data?.raw?.id) {
        loadRelationshipsForNode(selectedNode.data.raw.id);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Unexpected error deleting relationship');
    }
  }

  function renderRelationshipSection() {
    if (!selectedNode || !selectedNode.data?.raw) return null;
    return (
      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" component="h4" sx={{ m: 0 }}>
            Relationships ({rels.length})
          </Typography>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (!canEdit) return;
              setRelationshipToEdit(null);
              setRelationshipDialogOpen(true);
            }}
            disabled={!canEdit}
          >
            Add relationship
          </Button>
        </Box>
        {rels.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No relationships yet.</Typography>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
            <Stack spacing={1}>
              {rels.map(rel => (
                <Box
                  key={rel.id || `${rel.sourceId}-${rel.type}-${rel.targetId}`}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e5e7eb', borderRadius: 1, p: 1 }}
                >
                  <Typography variant="body2">{relationshipLabel(rel)}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {canEdit && (
                      <>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            const selectedId = selectedNode?.data?.raw?.id;
                            const isOutgoing = rel.sourceId === selectedId || rel.direction === 'out';
                            const sourceId = isOutgoing ? selectedId : rel.otherNodeId || rel.sourceId;
                            const targetId = isOutgoing ? rel.otherNodeId || rel.targetId : selectedId;
                            setRelationshipToEdit({ ...rel, sourceId, targetId });
                            setRelationshipDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        {rel.id && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteRelationship(rel.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    );
  }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Details</h3>
        {onHide && (
          <button className="sidepanel-hide-btn" type="button" onClick={onHide} aria-label="Hide details">
            &#10006;
          </button>
        )}
      </div>
      {renderNodeSection()}
      {renderRelationshipSection()}
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
          if (selectedNode?.data?.raw?.id) {
            loadRelationshipsForNode(selectedNode.data.raw.id);
          }
          if (onDataChanged) onDataChanged();
        }}
      />

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create node</DialogTitle>
        <form onSubmit={handleCreateNode}>
        <DialogContent dividers>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={formTypeId}
                onChange={e => setFormTypeId(e.target.value)}
              >
                {nodeTypes.map(t => (
                  <MenuItem key={t.id} value={t.id}>{t.name} ({t.layer})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth margin="dense" label="Name" value={formName} onChange={e => setFormName(e.target.value)} />
            <TextField fullWidth margin="dense" label="Layer (optional)" value={formLayer} onChange={e => setFormLayer(e.target.value)} />
            <TextField fullWidth margin="dense" label="Description (optional)" value={formDescription} onChange={e => setFormDescription(e.target.value)} multiline rows={2} />
            <TextField fullWidth margin="dense" label="Weight (optional)" type="number" value={formWeight} onChange={e => setFormWeight(e.target.value)} />
            <Box sx={{ mt: 1 }}>
              <strong>Attributes</strong>
              <AttributeEditor
                attributes={formAttributes}
                onChange={setFormAttributes}
                suggestionKeys={typeSuggestionKeys(formTypeId)}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                margin="dense"
                label="Color (optional)"
                type="color"
                value={formColor || '#8b5cf6'}
                onChange={e => {
                  setFormColor(e.target.value);
                  setColorCleared(false);
                }}
              />
              <Button variant="outlined" size="small" onClick={() => { setFormColor(''); setColorCleared(true); }}>
                Inherit type
              </Button>
            </Box>
            {/* shape selection hidden for simplicity */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!canEdit}>Create</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit node</DialogTitle>
        <form onSubmit={handleUpdateNode}>
          <DialogContent dividers>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={formTypeId}
                onChange={e => setFormTypeId(e.target.value)}
              >
                {nodeTypes.map(t => (
                  <MenuItem key={t.id} value={t.id}>{t.name} ({t.layer})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth margin="dense" label="Name" value={formName} onChange={e => setFormName(e.target.value)} />
            <TextField fullWidth margin="dense" label="Layer" value={formLayer} onChange={e => setFormLayer(e.target.value)} />
            <TextField fullWidth margin="dense" label="Description" value={formDescription} onChange={e => setFormDescription(e.target.value)} multiline rows={2} />
            <TextField fullWidth margin="dense" label="Weight" type="number" value={formWeight} onChange={e => setFormWeight(e.target.value)} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                fullWidth
                margin="dense"
                label="Color"
                type="color"
                value={formColor || '#8b5cf6'}
                onChange={e => {
                  setFormColor(e.target.value);
                  setColorCleared(false);
                }}
              />
              <Button variant="outlined" size="small" onClick={() => { setFormColor(''); setColorCleared(true); }}>
                Inherit type
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                select
                fullWidth
                margin="dense"
                label="Shape"
                value={formShape}
                onChange={e => {
                  setFormShape(e.target.value);
                  setShapeCleared(false);
                }}
                SelectProps={{ native: true, displayEmpty: true }}
                InputLabelProps={{ shrink: true }}
              >
                <option value="">Inherit type default</option>
                <option value="ellipse">ellipse</option>
                <option value="round-rectangle">round-rectangle</option>
                <option value="rectangle">rectangle</option>
                <option value="diamond">diamond</option>
                <option value="hexagon">hexagon</option>
              </TextField>
              <Button variant="outlined" size="small" onClick={() => { setFormShape(''); setShapeCleared(true); }}>
                Inherit type
              </Button>
            </Box>
            <Box sx={{ mt: 1 }}>
              <strong>Attributes</strong>
              <AttributeEditor
                attributes={formAttributes}
                onChange={setFormAttributes}
                suggestionKeys={typeSuggestionKeys(formTypeId || selectedNode?.data?.raw?.typeId)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Close</Button>
            <Button type="submit" variant="contained" disabled={!canEdit}>Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={colorPickerOpen} onClose={() => setColorPickerOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Highlight color</DialogTitle>
        <form onSubmit={handleQuickColorSave}>
          <DialogContent dividers>
            <TextField
              fullWidth
              type="color"
              label="Node color"
              value={highlightColor || '#8b5cf6'}
              onChange={e => {
                setHighlightColor(e.target.value);
                setFormColor(e.target.value);
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setColorPickerOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!canEdit}>Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}


