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
import CategoryIcon from '@mui/icons-material/Category';
import { LogoSpinner } from '../../components/Logo';
import { useDomains } from '../../components/DomainContext';

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

const shapeOptions = {
  'Basic Shapes': ['ellipse', 'rectangle', 'round-rectangle', 'cut-rectangle', 'barrel'],
  'Polygons': ['triangle', 'diamond', 'pentagon', 'hexagon', 'heptagon', 'octagon', 'concave-hexagon'],
  'Special': ['star', 'tag', 'round-tag', 'vee', 'rhomboid', 'bottom-round-rectangle'],
};

const shapeLabels = {
  'ellipse': 'Ellipse',
  'rectangle': 'Rectangle',
  'round-rectangle': 'Rounded',
  'cut-rectangle': 'Cut Rectangle',
  'barrel': 'Barrel',
  'triangle': 'Triangle',
  'diamond': 'Diamond',
  'pentagon': 'Pentagon',
  'hexagon': 'Hexagon',
  'heptagon': 'Heptagon',
  'octagon': 'Octagon',
  'concave-hexagon': 'Concave Hex',
  'star': 'Star',
  'tag': 'Tag',
  'round-tag': 'Round Tag',
  'vee': 'Vee',
  'rhomboid': 'Rhomboid',
  'bottom-round-rectangle': 'Bottom Rounded',
};

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
    color: '#8b5cf6',
    icon: '',
    domain: 'core',
    shape: 'ellipse'
  });
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
      const res = await fetch(`/api/node-types${qs}`);
      if (!res.ok) {
        setErrorMsg(`Failed to load node types (${res.status})`);
        setTypes([]);
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
      color: '#8b5cf6',
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
      color: t.color || '#8b5cf6',
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

  return (
    <Box className="page-container">
      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{
          width: 48, height: 48, borderRadius: 2,
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <CategoryIcon sx={{ color: 'white', fontSize: 28 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Node Types</Typography>
          <Typography variant="body2" color="text.secondary">
            {types.length} types defined
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
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
          <LogoSpinner label="Loading node types..." />
        </Box>
      )}

      {!loading && types.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary">No node types found. Create one to get started.</Typography>
        </Paper>
      )}

      {!loading && types.length > 0 && (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {types.map(t => (
            <Paper
              key={t.id}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid var(--border)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: t.color || 'var(--accent)',
                  boxShadow: 'var(--shadow)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: 2,
                  bgcolor: t.color || '#888',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Typography sx={{ color: getContrastColor(t.color || '#888'), fontWeight: 700, fontSize: 18 }}>
                    {(t.name || '?')[0].toUpperCase()}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{t.name}</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                    {t.layer && <Chip label={t.layer} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
                    <Chip label={t.shape || 'ellipse'} size="small" sx={{ height: 20, fontSize: 10, bgcolor: 'var(--bg)' }} />
                  </Stack>
                  {t.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                      {t.description}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(t)}>
                      <EditIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => deleteType(t.id)}>
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, pt: 1.5, borderTop: '1px solid var(--border)' }}>
                <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: t.color || '#888' }} />
                <Typography variant="caption" color="text.secondary">{t.color || 'No color'}</Typography>
                <Box sx={{ flex: 1 }} />
                <Chip label={t.domain || 'core'} size="small" sx={{ height: 18, fontSize: 10 }} />
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>{editingId ? 'Edit Node Type' : 'Create Node Type'}</DialogTitle>
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
              placeholder="Display label (optional)"
            />
            <TextField
              fullWidth
              margin="dense"
              label="Layer"
              value={form.layer}
              onChange={e => setForm(prev => ({ ...prev, layer: e.target.value }))}
              placeholder="Physical / Information / Systems / Rules / Governance"
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
                  value={form.color}
                  onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                  style={{ width: 40, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }}
                />
                <TextField
                  size="small"
                  label="Color"
                  value={form.color}
                  onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
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
                sx={{ flex: 1 }}
              >
                {Object.entries(shapeOptions).map(([group, shapes]) => (
                  <optgroup key={group} label={group}>
                    {shapes.map(opt => (
                      <option key={opt} value={opt}>{shapeLabels[opt] || opt}</option>
                    ))}
                  </optgroup>
                ))}
              </TextField>
            </Stack>
            <TextField
              fullWidth
              margin="dense"
              label="Icon"
              value={form.icon}
              onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))}
              placeholder="Icon URL or name (optional)"
            />
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
