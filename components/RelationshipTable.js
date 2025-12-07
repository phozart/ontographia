import { useEffect, useState, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  Button,
  Box,
  Stack,
  Typography,
  IconButton
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RelationshipFormDialog from './RelationshipFormDialog';
import { useDomains } from './DomainContext';

export default function RelationshipTable({ onChanged, reloadKey, hideCreate }) {
  const [nodes, setNodes] = useState([]);
  const [types, setTypes] = useState([]);
  const [relTypes, setRelTypes] = useState([]);
  const [rels, setRels] = useState([]);
  const [sourceType, setSourceType] = useState(null);
  const [targetType, setTargetType] = useState(null);
  const [sourceNode, setSourceNode] = useState(null);
  const [targetNode, setTargetNode] = useState(null);
  const [type, setType] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRel, setEditingRel] = useState(null);
  const { activeDomain, activeDomainObj } = useDomains();

  async function loadNodes() {
    const qs = activeDomain
      ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
      : '';
    const res = await fetch(`/api/nodes${qs}`);
    const data = await res.json();
    setNodes(data);
  }

  async function loadTypes() {
    const qs = activeDomain
      ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
      : '';
    const res = await fetch(`/api/node-types${qs}`);
    const data = await res.json();
    setTypes(data);
  }

  async function loadRelTypes() {
    const res = await fetch('/api/relationship-types');
    if (!res.ok) return;
    const data = await res.json();
    setRelTypes(data);
    if (!type && data.length) {
      setType({ ...data[0], optionLabel: data[0].label || data[0].name });
    }
  }

  async function loadRelationships() {
    const qs = activeDomain
      ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
      : '';
    const res = await fetch(`/api/relationships${qs}`);
    const data = await res.json();
    setRels(data);
  }

  useEffect(() => {
    loadNodes();
    loadTypes();
    loadRelationships();
    loadRelTypes();
  }, [reloadKey, activeDomain, activeDomainObj]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!sourceNode || !targetNode || !type) return;

    const res = await fetch('/api/relationships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        type: type.name || type.label || '',
        domain: activeDomain || undefined,
      })
    });

    if (res.ok) {
      setSourceNode(null);
      setTargetNode(null);
      setType(relTypeOptions[0] || null);
      loadRelationships();
      if (onChanged) onChanged();
    } else {
      console.error(await res.json());
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm('Delete this relationship?');
    if (!ok) return;

    const res = await fetch(`/api/relationships/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (res.status === 204) {
      loadRelationships();
      if (onChanged) onChanged();
    } else {
      console.error(await res.json());
    }
  }

  function nodeLabel(id) {
    const n = nodes.find(node => node.id === id);
    if (!n) return id;
    return `${n.name} (${n.typeName || 'Unassigned'})`;
  }

  const typeOptions = useMemo(
    () => (Array.isArray(types) ? types : []).map(t => ({ id: t.id, label: t.name })),
    [types]
  );
  const relTypeOptions = useMemo(
    () =>
      (Array.isArray(relTypes) ? relTypes : []).map(rt => ({
        ...rt,
        optionLabel: rt.label || rt.name || 'Relationship',
      })),
    [relTypes]
  );

  const sourceTypeId = typeof sourceType === 'string' ? sourceType : sourceType?.id || '';
  const targetTypeId = typeof targetType === 'string' ? targetType : targetType?.id || '';

  const sourceOptions = useMemo(
    () =>
      (Array.isArray(nodes) ? nodes : [])
        .filter(n => !sourceTypeId || n.typeId === sourceTypeId)
        .map(n => ({ ...n, label: `${n.name} (${n.typeName || 'Unassigned'})` })),
    [nodes, sourceTypeId]
  );

  const targetOptions = useMemo(
    () =>
      (Array.isArray(nodes) ? nodes : [])
        .filter(n => !targetTypeId || n.typeId === targetTypeId)
        .map(n => ({ ...n, label: `${n.name} (${n.typeName || 'Unassigned'})` })),
    [nodes, targetTypeId]
  );

  function openEdit(rel) {
    setEditingRel(rel);
    setEditOpen(true);
  }

  const rows = useMemo(() => {
    return (Array.isArray(rels) ? rels : []).map(r => ({
      ...r,
      id: r.id || `${r.sourceId}-${r.type}-${r.targetId}`,
      sourceLabel: nodeLabel(r.sourceId),
      targetLabel: nodeLabel(r.targetId),
    }));
  }, [rels, nodes]);

  const columns = useMemo(
    () => [
      { field: 'id', headerName: 'ID', width: 140 },
      { field: 'sourceLabel', headerName: 'Source', flex: 1, minWidth: 180 },
      { field: 'type', headerName: 'Type', width: 140 },
      { field: 'targetLabel', headerName: 'Target', flex: 1, minWidth: 180 },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 130,
        sortable: false,
        filterable: false,
        renderCell: params => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={() => openEdit(params.row)} aria-label="Edit relationship">
              <EditIcon fontSize="small" />
            </IconButton>
            {params.row.id && (
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(params.row.id)}
                aria-label="Delete relationship"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <Box>
      {!hideCreate && (
        <>
          <Typography variant="h6" gutterBottom>Create relationship</Typography>
          <Box component="form" onSubmit={handleCreate} sx={{ mb: 2 }}>
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
                renderInput={(params) => <TextField {...params} label="Source type" size="small" />}
              />
              <Autocomplete
                options={sourceOptions}
                value={sourceNode}
                getOptionLabel={opt => opt?.label || ''}
                isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                onChange={(_, val) => setSourceNode(val)}
                renderInput={(params) => <TextField {...params} label="Source node" size="small" />}
              />
              <Autocomplete
                options={relTypeOptions}
                value={type}
                getOptionLabel={opt => opt?.optionLabel || ''}
                isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                onChange={(_, val) => setType(val)}
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
                renderInput={(params) => <TextField {...params} label="Target type" size="small" />}
              />
              <Autocomplete
                options={targetOptions}
                value={targetNode}
                getOptionLabel={opt => opt?.label || ''}
                isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                onChange={(_, val) => setTargetNode(val)}
                renderInput={(params) => <TextField {...params} label="Target node" size="small" />}
              />
              <Button variant="contained" type="submit">Create</Button>
            </Stack>
          </Box>
        </>
      )}

    
      <Box
        sx={{
          height: 'calc(100vh - 240px)',
          width: '100%',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <DataGrid
          rows={rows}
          getRowId={row => row.id}
          columns={columns}
          density="compact"
          disableRowSelectionOnClick
          getRowHeight={() => 'auto'}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 300 },
            },
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              lineHeight: 1.3,
              alignItems: 'flex-start',
              py: 0.5,
            },
            '& .MuiDataGrid-row': {
              maxHeight: 'none !important',
            },
            '& .MuiDataGrid-row:nth-of-type(even)': {
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
            '& .MuiDataGrid-row:nth-of-type(odd)': {
              backgroundColor: 'rgba(0, 0, 0, 0.01)',
            },
            '[data-theme="dark"] & .MuiDataGrid-row:nth-of-type(even)': {
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
            },
            '[data-theme="dark"] & .MuiDataGrid-row:nth-of-type(odd)': {
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
            },
          }}
        />
      </Box>

      <RelationshipFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false);
          loadRelationships();
          if (onChanged) onChanged();
        }}
        relationship={editingRel}
      />
    </Box>
  );
}
