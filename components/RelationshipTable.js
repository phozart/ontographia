import { useEffect, useState, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  Button,
  Box,
  Stack,
  Typography,
  IconButton,
  Paper,
  Chip,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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
  const [relTypeFilter, setRelTypeFilter] = useState(null);
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

  function getNodeInfo(id) {
    return nodes.find(node => node.id === id);
  }

  const typeOptions = useMemo(
    () => (Array.isArray(types) ? types : []).map(t => ({ id: t.id, label: t.name, color: t.color })),
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
    let filtered = Array.isArray(rels) ? rels : [];
    if (relTypeFilter) {
      filtered = filtered.filter(r => r.type === relTypeFilter.name);
    }
    return filtered.map(r => ({
      ...r,
      id: r.id || `${r.sourceId}-${r.type}-${r.targetId}`,
      sourceLabel: nodeLabel(r.sourceId),
      targetLabel: nodeLabel(r.targetId),
      sourceNode: getNodeInfo(r.sourceId),
      targetNode: getNodeInfo(r.targetId),
      relTypeInfo: relTypes.find(rt => rt.name === r.type),
    }));
  }, [rels, nodes, relTypes, relTypeFilter]);

  const columns = useMemo(
    () => [
      {
        field: 'sourceLabel',
        headerName: 'Source',
        flex: 1,
        minWidth: 180,
        renderCell: params => {
          const sourceInfo = params.row.sourceNode;
          const color = sourceInfo?.color || types.find(t => t.id === sourceInfo?.typeId)?.color || '#3b82f6';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 10, height: 10, borderRadius: '50%',
                bgcolor: color, flexShrink: 0
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {sourceInfo?.name || params.row.sourceId}
              </Typography>
            </Box>
          );
        }
      },
      {
        field: 'type',
        headerName: 'Connection',
        width: 180,
        renderCell: params => {
          const relTypeInfo = params.row.relTypeInfo;
          const color = relTypeInfo?.color || '#9ca3af';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 24, height: 3, borderRadius: 2, bgcolor: color }} />
              <ArrowForwardIcon sx={{ fontSize: 14, color }} />
              <Chip
                label={params.value}
                size="small"
                sx={{
                  bgcolor: color + '20',
                  color: color,
                  fontWeight: 500,
                  fontSize: 11,
                  height: 22
                }}
              />
            </Box>
          );
        }
      },
      {
        field: 'targetLabel',
        headerName: 'Target',
        flex: 1,
        minWidth: 180,
        renderCell: params => {
          const targetInfo = params.row.targetNode;
          const color = targetInfo?.color || types.find(t => t.id === targetInfo?.typeId)?.color || '#10b981';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 10, height: 10, borderRadius: '50%',
                bgcolor: color, flexShrink: 0
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {targetInfo?.name || params.row.targetId}
              </Typography>
            </Box>
          );
        }
      },
      {
        field: 'actions',
        headerName: '',
        width: 100,
        sortable: false,
        filterable: false,
        renderCell: params => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => openEdit(params.row)}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            {params.row.id && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(params.row.id)}
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [types, relTypes]
  );

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FilterListIcon sx={{ color: 'text.secondary' }} />
        <Autocomplete
          size="small"
          sx={{ width: 280 }}
          options={relTypeOptions}
          value={relTypeFilter}
          getOptionLabel={opt => opt?.optionLabel || ''}
          isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
          onChange={(_, val) => setRelTypeFilter(val)}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 3, borderRadius: 2, bgcolor: option.color || '#9ca3af' }} />
              {option.optionLabel}
            </Box>
          )}
          renderInput={(params) => <TextField {...params} label="Filter by type" placeholder="All types" />}
        />
        {relTypeFilter && (
          <Chip
            label={`Showing: ${relTypeFilter.optionLabel}`}
            onDelete={() => setRelTypeFilter(null)}
            size="small"
            sx={{ bgcolor: (relTypeFilter.color || '#9ca3af') + '20', color: relTypeFilter.color || '#9ca3af' }}
          />
        )}
        <Box sx={{ flex: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {rows.length} connections
        </Typography>
      </Paper>

      {!hideCreate && (
        <Paper sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Quick Create</Typography>
          <Box component="form" onSubmit={handleCreate}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end">
              <Autocomplete
                size="small"
                sx={{ flex: 1, minWidth: 180 }}
                options={typeOptions}
                value={sourceType}
                getOptionLabel={opt => opt?.label || ''}
                isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                onChange={(_, val) => {
                  setSourceType(val);
                  setSourceNode(null);
                }}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: option.color || '#888' }} />
                    {option.label}
                  </Box>
                )}
                renderInput={(params) => <TextField {...params} label="Source type" />}
              />
              <Autocomplete
                size="small"
                sx={{ flex: 1.5, minWidth: 200 }}
                options={sourceOptions}
                value={sourceNode}
                getOptionLabel={opt => opt?.label || ''}
                isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                onChange={(_, val) => setSourceNode(val)}
                renderInput={(params) => <TextField {...params} label="Source node" />}
              />
              <ArrowForwardIcon sx={{ color: 'text.secondary', mx: 1 }} />
              <Autocomplete
                size="small"
                sx={{ flex: 1.2, minWidth: 160 }}
                options={relTypeOptions}
                value={type}
                getOptionLabel={opt => opt?.optionLabel || ''}
                isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                onChange={(_, val) => setType(val)}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 3, borderRadius: 2, bgcolor: option.color || '#9ca3af' }} />
                    {option.optionLabel}
                  </Box>
                )}
                renderInput={params => <TextField {...params} label="Type" />}
              />
              <ArrowForwardIcon sx={{ color: 'text.secondary', mx: 1 }} />
              <Autocomplete
                size="small"
                sx={{ flex: 1, minWidth: 180 }}
                options={typeOptions}
                value={targetType}
                getOptionLabel={opt => opt?.label || ''}
                isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                onChange={(_, val) => {
                  setTargetType(val);
                  setTargetNode(null);
                }}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: option.color || '#888' }} />
                    {option.label}
                  </Box>
                )}
                renderInput={(params) => <TextField {...params} label="Target type" />}
              />
              <Autocomplete
                size="small"
                sx={{ flex: 1.5, minWidth: 200 }}
                options={targetOptions}
                value={targetNode}
                getOptionLabel={opt => opt?.label || ''}
                isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                onChange={(_, val) => setTargetNode(val)}
                renderInput={(params) => <TextField {...params} label="Target node" />}
              />
              <Button variant="contained" type="submit" sx={{ height: 40 }}>Create</Button>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Data Grid */}
      <Paper
        sx={{
          height: 'calc(100vh - 380px)',
          minHeight: 400,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 'var(--shadow)',
        }}
      >
        <DataGrid
          rows={rows}
          getRowId={row => row.id}
          columns={columns}
          density="comfortable"
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 300 },
            },
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'var(--bg)',
              borderBottom: '1px solid var(--border)',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid var(--border)',
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: 'var(--accent-soft)',
            },
          }}
        />
      </Paper>

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
