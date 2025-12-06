import { useEffect, useState } from 'react';
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
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { LogoSpinner } from '../components/Logo';

export default function RelationshipTypesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', label: '', description: '', color: '#9ca3af' });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadTypes();
  }, []);

  async function loadTypes() {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/relationship-types');
      if (!res.ok) {
        setErrorMsg(`Failed to load relationship types (${res.status})`);
        setRows([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setRows(data);
    } catch (e) {
      console.error(e);
      setErrorMsg('Unexpected error loading relationship types');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm({ name: '', label: '', description: '', color: '#9ca3af' });
    setDialogOpen(true);
  }

  function openEdit(rt) {
    setEditingId(rt.id);
    setForm({
      name: rt.name || '',
      label: rt.label || '',
      description: rt.description || '',
      color: rt.color || '#9ca3af',
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
    const url = editingId ? `/api/relationship-types/${encodeURIComponent(editingId)}` : '/api/relationship-types';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Failed to save relationship type');
        return;
      }
      closeDialog();
      loadTypes();
    } catch (e) {
      console.error(e);
      setErrorMsg('Unexpected error saving relationship type');
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm('Delete this relationship type?');
    if (!ok) return;
    try {
      const res = await fetch(`/api/relationship-types/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.status === 204) {
        loadTypes();
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'Failed to delete relationship type');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Unexpected error deleting relationship type');
    }
  }

  return (
    <Box className="page-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Relationship Types</Typography>
        <Button variant="contained" onClick={openCreate}>+ New type</Button>
      </Box>
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
          <LogoSpinner label="Loading relationship types..." />
        </div>
      )}
      {!loading && rows.length === 0 && <p>No relationship types found.</p>}

      {!loading && rows.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Label</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Color</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.label}</TableCell>
                  <TableCell>{r.description}</TableCell>
                  <TableCell>{r.color}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(r)} aria-label="Edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(r.id)} aria-label="Delete">
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
        <DialogTitle>{editingId ? 'Edit relationship type' : 'Create relationship type'}</DialogTitle>
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
              label="Description"
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Color"
              value={form.color}
              onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
              type="color"
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
