import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Typography,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { LogoSpinner } from '../components/Logo';
import { useDomains } from '../components/DomainContext';

const shapeOptions = ['ellipse', 'round-rectangle', 'rectangle', 'diamond', 'hexagon'];

export default function NodeTypesPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    label: '',
    description: '',
    layer: '',
    color: '#888888',
    icon: '',
    domain: 'core',
    shape: 'ellipse'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const { activeDomain, accessibleDomains, activeDomainObj } = useDomains();

  useEffect(() => {
    loadTypes();
  }, [activeDomain, activeDomainObj]);

  async function loadTypes() {
    setLoading(true);
    setErrorMsg('');
    try {
      const qs = activeDomain
        ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
        : '';
      const res = await fetch(`/api/node-types${qs}`);
      if (!res.ok) {
        setErrorMsg(`Failed to load node types (${res.status})`);
        setTypes([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setTypes(data);
    } catch (e) {
      console.error(e);
      setErrorMsg('Unexpected error loading node types');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm({
      name: '',
      label: '',
      description: '',
      layer: '',
      color: '#888888',
      icon: '',
      domain: activeDomainObj?.name || activeDomain || 'core',
      shape: 'ellipse'
    });
    setDialogOpen(true);
  }

  function openEdit(t) {
    setEditingId(t.id);
    setForm({
      name: t.name || '',
      label: t.label || '',
      description: t.description || '',
      layer: t.layer || '',
      color: t.color || '#888888',
      icon: t.icon || '',
      domain: t.domain || activeDomainObj?.name || 'core',
      shape: t.shape || 'ellipse'
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setErrorMsg('');
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name) {
      setErrorMsg('Name is required');
      return;
    }
    const payload = {
      ...form,
      domain: activeDomainObj?.name || activeDomain || form.domain || 'core',
    };
    const url = editingId ? `/api/node-types/${encodeURIComponent(editingId)}` : '/api/node-types';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Failed to save node type');
        return;
      }
      closeDialog();
      await loadTypes();
    } catch (e) {
      console.error(e);
      setErrorMsg('Unexpected error saving node type');
    }
  }

  async function deleteType(id) {
    const ok = window.confirm('Delete this node type? It must have no nodes using it.');
    if (!ok) return;
    setErrorMsg('');
    try {
      const res = await fetch(`/api/node-types/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.status === 204) {
        loadTypes();
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Failed to delete node type');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Unexpected error deleting node type');
    }
  }

  const rows = useMemo(() => types || [], [types]);

  return (
    <Box className="page-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Node Types</Typography>
        <Button variant="contained" onClick={openCreate}>+ New type</Button>
      </Box>
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
          <LogoSpinner label="Loading node types..." />
        </div>
      )}
      {!loading && rows.length === 0 && <p>No node types found.</p>}

      {!loading && rows.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Label</TableCell>
                <TableCell>Layer</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Shape</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Icon</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.label}</TableCell>
                  <TableCell>{t.layer}</TableCell>
                  <TableCell>{t.domain || 'core'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span
                        style={{
                          display: 'inline-block',
                          width: 14,
                          height: 14,
                          borderRadius: 999,
                          backgroundColor: t.color || '#e5e7eb',
                          border: '1px solid #9ca3af',
                        }}
                      />
                      {t.color}
                    </Stack>
                  </TableCell>
                  <TableCell>{t.shape || 'ellipse'}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell>{t.icon}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(t)} aria-label="Edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => deleteType(t.id)} aria-label="Delete">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? 'Edit node type' : 'Create node type'}</DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent dividers>
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
              label="Label"
              value={form.label}
              onChange={e => setForm(prev => ({ ...prev, label: e.target.value }))}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Layer"
              value={form.layer}
              onChange={e => setForm(prev => ({ ...prev, layer: e.target.value }))}
              placeholder="Physical/Information/Systems/Rules/Governance"
            />
            <TextField
              fullWidth
              margin="dense"
              label="Domain"
              select
              value={form.domain}
              SelectProps={{ native: true }}
              helperText="Tied to your active domain"
              disabled
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <TextField
                label="Color"
                type="color"
                value={form.color}
                onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                sx={{ width: 100 }}
              />
              <TextField
                label="Color hex"
                value={form.color}
                onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                sx={{ flex: 1 }}
              />
            </Box>
            <TextField
              select
              fullWidth
              margin="dense"
              label="Default shape"
              value={form.shape}
              onChange={e => setForm(prev => ({ ...prev, shape: e.target.value }))}
              SelectProps={{ native: true }}
            >
              {shapeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </TextField>
            <TextField
              fullWidth
              margin="dense"
              label="Description"
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Icon"
              value={form.icon}
              onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))}
              placeholder="e.g. dot, event, system"
            />
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
