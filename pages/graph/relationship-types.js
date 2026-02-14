import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  IconButton,
  Typography,
  Stack,
  Chip,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { LogoSpinner } from '../../components/Logo';
import { useDomains } from '../../components/DomainContext';

// Utility to detect UUID strings (hide from UI)
function isUUID(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export default function RelationshipTypesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', label: '', description: '', color: '#9ca3af', domain: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const { activeDomain, activeDomainObj } = useDomains();

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
      const res = await fetch(`/api/relationship-types${qs}`);
      if (!res.ok) {
        setErrorMsg(`Failed to load relationship types (${res.status})`);
        setRows([]);
        return;
      }
      const data = await res.json();
      const domains = [activeDomain, activeDomainObj?.name].filter(Boolean).map(String);
      const filtered = domains.length
        ? data.filter(rt => domains.includes(String(rt.domain || 'core')))
        : data;
      setRows(filtered);
    } catch (e) {
      console.error(e);
      setErrorMsg('Unexpected error loading relationship types');
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
      color: '#9ca3af',
      domain: activeDomainObj?.name || activeDomain || 'core',
    });
    setDialogOpen(true);
  }

  function openEdit(rt) {
    setEditingId(rt.id);
    setForm({
      name: rt.name || '',
      label: rt.label || '',
      description: rt.description || '',
      color: rt.color || '#9ca3af',
      domain: rt.domain || activeDomainObj?.name || activeDomain || 'core',
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
    const url = editingId ? `/api/relationship-types/${encodeURIComponent(editingId)}` : '/api/relationship-types';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{
          width: 48, height: 48, borderRadius: 2,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <DeviceHubIcon sx={{ color: 'white', fontSize: 28 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Connection Types</Typography>
          <Typography variant="body2" color="text.secondary">
            {rows.length} relationship types defined
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
          New Type
        </Button>
      </Box>

      {errorMsg && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
          <Typography color="error">{errorMsg}</Typography>
        </Paper>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <LogoSpinner label="Loading relationship types..." />
        </Box>
      )}

      {!loading && rows.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary">No relationship types found. Create one to get started.</Typography>
        </Paper>
      )}

      {!loading && rows.length > 0 && (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {rows.map(r => (
            <Paper
              key={r.id}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid var(--border)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: r.color || 'var(--accent)',
                  boxShadow: 'var(--shadow)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: 2,
                  bgcolor: 'var(--bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, position: 'relative'
                }}>
                  <Box sx={{
                    width: 32, height: 4, borderRadius: 2,
                    bgcolor: r.color || '#9ca3af',
                    position: 'absolute'
                  }} />
                  <ArrowForwardIcon sx={{
                    position: 'absolute', right: 2,
                    color: r.color || '#9ca3af', fontSize: 16
                  }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{r.name}</Typography>
                  {r.label && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                      Label: {r.label}
                    </Typography>
                  )}
                  {r.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, mt: 0.5 }}>
                      {r.description}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(r)}>
                      <EditIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(r.id)}>
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, pt: 1.5, borderTop: '1px solid var(--border)' }}>
                <Box sx={{ width: 24, height: 4, borderRadius: 2, bgcolor: r.color || '#9ca3af' }} />
                <Typography variant="caption" color="text.secondary">{r.color || '#9ca3af'}</Typography>
                <Box sx={{ flex: 1 }} />
                <Chip label={isUUID(r.domain) ? 'domain' : (r.domain || 'core')} size="small" sx={{ height: 18, fontSize: 10 }} />
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>{editingId ? 'Edit Connection Type' : 'Create Connection Type'}</DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent dividers>
            <TextField
              fullWidth
              margin="dense"
              label="Name"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="e.g., CONNECTS_TO, DEPENDS_ON"
            />
            <TextField
              fullWidth
              margin="dense"
              label="Label"
              value={form.label}
              onChange={e => setForm(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Display label (optional)"
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <input
                type="color"
                value={form.color}
                onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                style={{ width: 40, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }}
              />
              <TextField
                size="small"
                label="Color"
                value={form.color}
                onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                sx={{ width: 120 }}
              />
              <Box sx={{ flex: 1 }} />
              <Box sx={{ width: 60, height: 4, borderRadius: 2, bgcolor: form.color }} />
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
