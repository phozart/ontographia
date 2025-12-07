import { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Stack
} from '@mui/material';
import { useDomains } from './DomainContext';

export default function RelationshipFormDialog({
  open,
  onClose,
  onSaved,
  relationship,
  initialSourceId,
  initialTargetId
}) {
  const [nodes, setNodes] = useState([]);
  const [types, setTypes] = useState([]);
  const [relTypes, setRelTypes] = useState([]);
  const [sourceType, setSourceType] = useState(null);
  const [targetType, setTargetType] = useState(null);
  const [sourceNode, setSourceNode] = useState(null);
  const [targetNode, setTargetNode] = useState(null);
  const [relType, setRelType] = useState(null);
  const [editingRel, setEditingRel] = useState(null);
  const { activeDomain, activeDomainObj } = useDomains();

  function withLabel(node) {
    if (!node) return null;
    return { ...node, label: `${node.name} (${node.typeName || 'Unassigned'})` };
  }

  useEffect(() => {
    if (open) {
      loadNodes();
      loadTypes();
      loadRelTypes();
    }
  }, [open, activeDomain, activeDomainObj]);

  useEffect(() => {
    if (
      !open ||
      !Array.isArray(nodes) ||
      nodes.length === 0 ||
      !Array.isArray(types) ||
      !Array.isArray(relTypes)
    )
      return;

    if (relationship) {
      const src = nodes.find(n => n.id === relationship.sourceId) || null;
      const tgt = nodes.find(n => n.id === relationship.targetId) || null;
      const srcType = src ? types.find(t => t.id === src.typeId) || null : null;
      const tgtType = tgt ? types.find(t => t.id === tgt.typeId) || null : null;
      const relMatch =
        relTypes.find(rt => rt.name === relationship.type || rt.label === relationship.type) ||
        (relationship.type
          ? { id: relationship.type, name: relationship.type, label: relationship.type }
          : null);
      setEditingRel(relationship);
      setSourceNode(withLabel(src));
      setTargetNode(withLabel(tgt));
      setSourceType(srcType ? { ...srcType, label: srcType.name } : null);
      setTargetType(tgtType ? { ...tgtType, label: tgtType.name } : null);
      setRelType(relMatch);
      return;
    }

    const initialSource = nodes.find(n => n.id === initialSourceId) || null;
    const initialTarget = nodes.find(n => n.id === initialTargetId) || null;
    const initialSourceType = initialSource ? types.find(t => t.id === initialSource.typeId) || null : null;
    const initialTargetType = initialTarget ? types.find(t => t.id === initialTarget.typeId) || null : null;

    setEditingRel(null);
    setRelType(null);
    setSourceNode(withLabel(initialSource));
    setTargetNode(withLabel(initialTarget));
    setSourceType(initialSourceType ? { ...initialSourceType, label: initialSourceType.name } : null);
    setTargetType(initialTargetType ? { ...initialTargetType, label: initialTargetType.name } : null);
  }, [open, relationship, nodes, types, relTypes, initialSourceId, initialTargetId]);

  useEffect(() => {
    if (!relationship && !relType && relTypes.length) {
      setRelType({
        ...relTypes[0],
        optionLabel: relTypes[0].label || relTypes[0].name,
      });
    }
  }, [relTypes, relationship, relType]);

  async function loadNodes() {
    const qs = activeDomain
      ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
      : '';
    const res = await fetch(`/api/nodes${qs}`);
    if (!res.ok) return;
    const data = await res.json();
    setNodes(data);
  }

  async function loadTypes() {
    const qs = activeDomain
      ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
      : '';
    const res = await fetch(`/api/node-types${qs}`);
    if (!res.ok) return;
    const data = await res.json();
    setTypes(data);
  }

  async function loadRelTypes() {
    const res = await fetch('/api/relationship-types');
    if (!res.ok) return;
    const data = await res.json();
    setRelTypes(data);
  }

  const typeOptions = useMemo(
    () => (Array.isArray(types) ? types : []).map(t => ({ ...t, label: t.name })),
    [types]
  );

  const sourceOptions = useMemo(
    () =>
      (Array.isArray(nodes) ? nodes : [])
        .filter(n => !sourceType || n.typeId === sourceType.id)
        .map(n => ({ ...n, label: `${n.name} (${n.typeName || 'Unassigned'})` })),
    [nodes, sourceType]
  );

  const targetOptions = useMemo(
    () =>
      (Array.isArray(nodes) ? nodes : [])
        .filter(n => !targetType || n.typeId === targetType.id)
        .map(n => ({ ...n, label: `${n.name} (${n.typeName || 'Unassigned'})` })),
    [nodes, targetType]
  );

  const relTypeOptions = useMemo(
    () =>
      (Array.isArray(relTypes) ? relTypes : []).map(rt => ({
        ...rt,
        optionLabel: rt.label || rt.name || 'Relationship',
      })),
    [relTypes]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (!sourceNode || !targetNode || !relType) return;
    const typeValue = relType.name || relType.label || '';
    if (!typeValue) return;
    const payload = { sourceId: sourceNode.id, targetId: targetNode.id, type: typeValue };
    const url = editingRel?.id ? `/api/relationships/${encodeURIComponent(editingRel.id)}` : '/api/relationships';
    const method = editingRel?.id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      if (onSaved) onSaved();
      reset();
    } else {
      console.error(await res.json().catch(() => ({})));
    }
  }

  function reset() {
    setSourceType(null);
    setTargetType(null);
    setSourceNode(null);
    setTargetNode(null);
    setRelType(null);
    setEditingRel(null);
  }

  function handleClose() {
    reset();
    if (onClose) onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{editingRel ? 'Edit relationship' : 'Create relationship'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Autocomplete
              options={typeOptions}
              value={sourceType}
              getOptionLabel={opt => opt?.label || ''}
              isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
              onChange={(_, val) => {
                setSourceType(val);
                setSourceNode(null);
              }}
              renderInput={params => <TextField {...params} label="Source type" size="small" />}
            />
            <Autocomplete
              options={sourceOptions}
              value={sourceNode}
              getOptionLabel={opt => opt?.label || ''}
              isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
              onChange={(_, val) => setSourceNode(val)}
              renderInput={params => <TextField {...params} label="Source node" size="small" />}
            />
            <Autocomplete
              options={relTypeOptions}
              value={relType}
              getOptionLabel={opt => opt?.optionLabel || ''}
              isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
              onChange={(_, val) => setRelType(val)}
              renderInput={params => <TextField {...params} label="Relationship type" size="small" />}
            />
            <Autocomplete
              options={typeOptions}
              value={targetType}
              getOptionLabel={opt => opt?.label || ''}
              isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
              onChange={(_, val) => {
                setTargetType(val);
                setTargetNode(null);
              }}
              renderInput={params => <TextField {...params} label="Target type" size="small" />}
            />
            <Autocomplete
              options={targetOptions}
              value={targetNode}
              getOptionLabel={opt => opt?.label || ''}
              isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
              onChange={(_, val) => setTargetNode(val)}
              renderInput={params => <TextField {...params} label="Target node" size="small" />}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">{editingRel ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
