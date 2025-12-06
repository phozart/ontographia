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
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttributeEditor from './AttributeEditor';

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
  }, []);

  async function loadTypes() {
    const res = await fetch('/api/node-types');
    if (!res.ok) return;
    const data = await res.json();
    setTypes(data);
  }

  async function loadNodes() {
    const res = await fetch('/api/nodes');
    if (!res.ok) return;
    const data = await res.json();
    setNodes(data);
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
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
      {
        field: 'typeName',
        headerName: 'Type',
        flex: 1,
        minWidth: 140,
        valueGetter: params => params?.row?.typeName || params?.row?.typeLabel || params?.row?.typeId || '',
      },
      { field: 'layer', headerName: 'Layer', flex: 0.6, minWidth: 100 },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1.2,
        minWidth: 200,
      },
      {
        field: 'icon',
        headerName: 'Icon',
        width: 90,
        renderCell: params =>
          params.value ? (
            <img
              src={params.value}
              alt=""
              style={{ width: 24, height: 24, objectFit: 'contain' }}
            />
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>—</span>
          ),
        sortable: false,
        filterable: false,
      },
      {
        field: 'shape',
        headerName: 'Shape',
        width: 130,
        valueGetter: params =>
          (params && params.row && (params.row.shape || params.row.typeShape)) ? (params.row.shape || params.row.typeShape) : 'inherit',
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: params => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={() => openEdit(params.row)} aria-label="Edit">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id)}
              aria-label="Delete"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [typeFilter]
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Nodes</Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
        <Autocomplete
          size="small"
          sx={{ width: 260 }}
          options={types.map(t => ({ ...t, label: t.name }))}
          value={typeFilter}
          onChange={(_, val) => setTypeFilter(val)}
          renderInput={(params) => <TextField {...params} label="Filter by type" />}
        />
        <Button variant="contained" onClick={openCreate}>+ New node</Button>
      </Box>

      <Box
        sx={{
          height: 'calc(100vh - 260px)',
          width: '100%',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
          borderRadius: 2,
          overflow: 'hidden',
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
        />
      </Box>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit node' : 'Create node'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Autocomplete
              options={types.map(t => ({ ...t, label: t.name }))}
              value={form.type}
              onChange={(_, val) => setForm(prev => ({ ...prev, type: val }))}
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
              label="Layer (optional)"
              value={form.layer}
              onChange={e => setForm(prev => ({ ...prev, layer: e.target.value }))}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Description (optional)"
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Icon URL (optional)"
              value={form.icon}
              onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Color (optional)"
              type="color"
              value={form.color || '#8b5cf6'}
              onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
            />
            <TextField
              select
              fullWidth
              margin="dense"
              label="Shape (optional)"
              value={form.shape}
              onChange={e => setForm(prev => ({ ...prev, shape: e.target.value }))}
              SelectProps={{ native: true }}
              helperText="Choose a shape or leave blank to inherit the type default"
            >
              <option value="">Inherit type default</option>
              <option value="ellipse">ellipse</option>
              <option value="round-rectangle">round-rectangle</option>
              <option value="rectangle">rectangle</option>
              <option value="diamond">diamond</option>
              <option value="hexagon">hexagon</option>
            </TextField>
            <TextField
              fullWidth
              margin="dense"
              label="Weight (optional)"
              type="number"
              value={form.weight}
              onChange={e => setForm(prev => ({ ...prev, weight: e.target.value }))}
            />
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2">Attributes</Typography>
              <AttributeEditor
                attributes={form.attributes}
                onChange={attrs => setForm(prev => ({ ...prev, attributes: attrs }))}
                suggestionKeys={attrSuggestions}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained">{editingId ? 'Save' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
