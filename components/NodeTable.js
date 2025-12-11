import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Paper,
  Chip,
  Stack,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SourceIcon from '@mui/icons-material/Source';
import AttributeEditor from './AttributeEditor';
import { useDomains } from './DomainContext';

// Utility to calculate contrasting text color
function getContrastColor(hexColor) {
  if (!hexColor || !hexColor.startsWith('#')) return '#000000';
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export default function NodeTable() {
  const [types, setTypes] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [typeFilter, setTypeFilter] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: null,
    layer: '',
    description: '',
    icon: '',
    weight: '',
    color: '',
    attributes: {},
    shape: '',
  });
  const { activeDomain, activeDomainObj } = useDomains();

  const attrSuggestions = useMemo(() => {
    const acc = {};
    nodes.forEach(n => {
      if (n.attributes) {
        Object.keys(n.attributes).forEach(k => (acc[k] = true));
      }
    });
    return Object.keys(acc);
  }, [nodes]);

  useEffect(() => {
    loadTypes();
    loadNodes();
  }, [activeDomain, activeDomainObj]);

  async function loadTypes() {
    const qs = activeDomain
      ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
      : '';
    const res = await fetch(`/api/node-types${qs}`);
    if (!res.ok) return;
    const data = await res.json();
    setTypes(data);
  }

  async function loadNodes() {
    const qs = activeDomain
      ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
      : '';
    const res = await fetch(`/api/nodes${qs}`);
    if (!res.ok) return;
    const data = await res.json();
    const domains = [activeDomain, activeDomainObj?.name].filter(Boolean).map(String);
    const filtered = domains.length
      ? data.filter(n => domains.includes(String(n.domain || '')))
      : data;
    setNodes(filtered);
  }

  function openCreate() {
    setEditingId(null);
    setForm({
      name: '',
      type: typeFilter || null,
      layer: '',
      description: '',
      icon: '',
      weight: '',
      attributes: {},
      shape: '',
    });
    setDialogOpen(true);
  }

  function openEdit(node) {
    setEditingId(node.id);
    setForm({
      name: node.name || '',
      type: types.find(t => t.id === node.typeId) || null,
      layer: node.layer || '',
      description: node.description || '',
      icon: node.icon || '',
      weight: node.weight === null || node.weight === undefined ? '' : String(node.weight),
      color: node.color || '',
      attributes: node.attributes || {},
      shape: node.shape || '',
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.type) return;
    const payload = {
      name: form.name,
      typeId: form.type.id,
      layer: form.layer || undefined,
      description: form.description || undefined,
      icon: form.icon || undefined,
      color: form.color || undefined,
      weight:
        form.weight === ''
          ? undefined
          : isNaN(parseFloat(form.weight))
            ? undefined
            : parseFloat(form.weight),
      attributes: form.attributes || {},
      shape: form.shape === '' ? null : form.shape,
      domain: activeDomain || undefined,
    };

    const url = editingId ? `/api/nodes/${encodeURIComponent(editingId)}` : '/api/nodes';
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      closeDialog();
      loadNodes();
    } else {
      console.error(await res.json().catch(() => ({})));
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm('Delete this node?');
    if (!ok) return;
    const res = await fetch(`/api/nodes/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.status === 204) {
      loadNodes();
    } else {
      console.error(await res.json().catch(() => ({})));
    }
  }

  const filteredNodes = nodes.filter(n => !typeFilter || n.typeId === typeFilter.id);

  const columns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        minWidth: 180,
        renderCell: params => {
          const typeInfo = types.find(t => t.id === params.row.typeId);
          const color = params.row.color || typeInfo?.color || '#8b5cf6';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 10, height: 10, borderRadius: '50%',
                bgcolor: color, flexShrink: 0
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{params.value}</Typography>
            </Box>
          );
        }
      },
      {
        field: 'typeName',
        headerName: 'Type',
        width: 150,
        renderCell: params => {
          const typeInfo = types.find(t => t.id === params.row.typeId);
          const color = typeInfo?.color || '#888';
          return (
            <Chip
              label={params.row.typeName || params.row.typeLabel || 'Unknown'}
              size="small"
              sx={{
                bgcolor: color,
                color: getContrastColor(color),
                fontWeight: 500,
                fontSize: 11
              }}
            />
          );
        }
      },
      {
        field: 'layer',
        headerName: 'Layer',
        width: 120,
        renderCell: params => params.value ? (
          <Chip label={params.value} size="small" variant="outlined" sx={{ fontSize: 11 }} />
        ) : <Typography variant="caption" color="text.secondary">-</Typography>
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1.2,
        minWidth: 200,
        renderCell: params => (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>
            {params.value || '-'}
          </Typography>
        )
      },
      {
        field: 'shape',
        headerName: 'Shape',
        width: 110,
        renderCell: params => (
          <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
            {params.row.shape || params.row.typeShape || 'inherit'}
          </Typography>
        )
      },
      {
        field: 'weight',
        headerName: 'Weight',
        width: 80,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => (
          <Typography variant="body2">
            {params.row.weight ?? '-'}
          </Typography>
        )
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
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => handleDelete(params.row.id)} color="error">
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [types, typeFilter]
  );

  return (
    <Box className="page-container">
      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{
          width: 48, height: 48, borderRadius: 2,
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <SourceIcon sx={{ color: 'white', fontSize: 28 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Nodes</Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredNodes.length} nodes {typeFilter && `of type "${typeFilter.name}"`}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New Node
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FilterListIcon sx={{ color: 'text.secondary' }} />
        <Autocomplete
          size="small"
          sx={{ width: 280 }}
          options={types.map(t => ({ ...t, label: t.name }))}
          value={typeFilter}
          onChange={(_, val) => setTypeFilter(val)}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: option.color || '#888' }} />
              {option.name}
            </Box>
          )}
          renderInput={(params) => <TextField {...params} label="Filter by type" placeholder="All types" />}
        />
        {typeFilter && (
          <Chip
            label={`Showing: ${typeFilter.name}`}
            onDelete={() => setTypeFilter(null)}
            size="small"
            sx={{ bgcolor: (typeFilter.color || '#888') + '20', color: typeFilter.color || '#888' }}
          />
        )}
      </Paper>

      {/* Data Grid */}
      <Paper
        sx={{
          height: 'calc(100vh - 300px)',
          minHeight: 400,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 'var(--shadow)',
        }}
      >
        <DataGrid
          rows={Array.isArray(filteredNodes) ? filteredNodes : []}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingId ? 'Edit Node' : 'Create Node'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Autocomplete
              options={types.map(t => ({ ...t, label: t.name }))}
              value={form.type}
              onChange={(_, val) => setForm(prev => ({ ...prev, type: val }))}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: option.color || '#888' }} />
                  {option.name} {option.layer && <Typography variant="caption" color="text.secondary">({option.layer})</Typography>}
                </Box>
              )}
              renderInput={(params) => <TextField {...params} label="Type" margin="dense" required />}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Name"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <TextField
              fullWidth
              margin="dense"
              label="Layer"
              value={form.layer}
              onChange={e => setForm(prev => ({ ...prev, layer: e.target.value }))}
              placeholder="Optional - inherits from type"
            />
            <TextField
              fullWidth
              margin="dense"
              label="Description"
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={2}
            />
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input
                  type="color"
                  value={form.color || '#8b5cf6'}
                  onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                  style={{ width: 40, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                />
                <TextField
                  size="small"
                  label="Color"
                  value={form.color}
                  onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="Inherit"
                  sx={{ width: 100 }}
                />
              </Box>
              <TextField
                select
                size="small"
                label="Shape"
                value={form.shape}
                onChange={e => setForm(prev => ({ ...prev, shape: e.target.value }))}
                SelectProps={{ native: true }}
                sx={{ width: 140 }}
              >
                <option value="">Inherit</option>
                <option value="ellipse">Ellipse</option>
                <option value="round-rectangle">Rounded</option>
                <option value="rectangle">Rectangle</option>
                <option value="diamond">Diamond</option>
                <option value="hexagon">Hexagon</option>
                <option value="triangle">Triangle</option>
                <option value="star">Star</option>
              </TextField>
              <TextField
                size="small"
                label="Weight"
                type="number"
                value={form.weight}
                onChange={e => setForm(prev => ({ ...prev, weight: e.target.value }))}
                sx={{ width: 100 }}
              />
            </Stack>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Attributes</Typography>
              <AttributeEditor
                attributes={form.attributes}
                onChange={attrs => setForm(prev => ({ ...prev, attributes: attrs }))}
                suggestionKeys={attrSuggestions}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained">{editingId ? 'Save' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
