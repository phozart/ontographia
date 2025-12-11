import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  TextField,
  Divider,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LogoSpinner } from '../components/Logo';
import { useDomains } from '../components/DomainContext';

// Pre-defined color palettes
const palettes = [
  { id: 'pastel-sunset', name: 'Pastel Sunset', colors: ['#fdeac2', '#f7c7d9', '#dec9f7', '#c7e9fb', '#d7f3c2'] },
  { id: 'pastel-sea', name: 'Pastel Sea', colors: ['#e3edff', '#d8f5f9', '#e7ddff', '#fde3e8', '#dff7e7'] },
  { id: 'soft-neon', name: 'Soft Neon', colors: ['#fbe0e0', '#fde9d6', '#fdf3c9', '#e6f7ce', '#d4f5f9'] },
  { id: 'mint-latte', name: 'Mint Latte', colors: ['#fef6e8', '#fdf0d4', '#ecf6dc', '#dff6eb', '#e5f3fc'] },
  { id: 'vibrant', name: 'Vibrant', colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'] },
  { id: 'ocean', name: 'Ocean Blues', colors: ['#0ea5e9', '#06b6d4', '#14b8a6', '#0d9488', '#0891b2'] },
  { id: 'forest', name: 'Forest', colors: ['#166534', '#15803d', '#22c55e', '#84cc16', '#a3e635'] },
  { id: 'berry', name: 'Berry Mix', colors: ['#be185d', '#db2777', '#ec4899', '#f472b6', '#a855f7'] },
  { id: 'earth', name: 'Earth Tones', colors: ['#78350f', '#92400e', '#b45309', '#d97706', '#ca8a04'] },
  { id: 'monochrome', name: 'Monochrome', colors: ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8'] },
];

// Custom single colors
const quickColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
];

export default function SettingsPage() {
  const [types, setTypes] = useState([]);
  const [relationshipTypes, setRelationshipTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState(palettes[0]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [customColors, setCustomColors] = useState({});
  const { activeDomain, activeDomainObj } = useDomains();

  useEffect(() => {
    loadTypes();
    loadRelationshipTypes();
  }, [activeDomain, activeDomainObj]);

  async function loadTypes() {
    setLoading(true);
    setError('');
    try {
      const qs = activeDomain
        ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
        : '';
      const res = await fetch(`/api/node-types${qs}`);
      if (!res.ok) {
        setError(`Failed to load node types (${res.status})`);
        setTypes([]);
        return;
      }
      const data = await res.json();
      setTypes(data);
      // Initialize custom colors
      const colors = {};
      data.forEach(t => { colors[t.id] = t.color || '#888888'; });
      setCustomColors(colors);
    } catch (e) {
      console.error(e);
      setError('Unexpected error loading node types');
    } finally {
      setLoading(false);
    }
  }

  async function loadRelationshipTypes() {
    try {
      const qs = activeDomain
        ? `?domain=${encodeURIComponent(activeDomain)}&domainName=${encodeURIComponent(activeDomainObj?.name || '')}`
        : '';
      const res = await fetch(`/api/relationship-types${qs}`);
      if (res.ok) {
        const data = await res.json();
        setRelationshipTypes(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function applyPalette() {
    if (!selectedPalette || !selectedPalette.colors.length) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const paletteColors = selectedPalette.colors;
      for (let i = 0; i < types.length; i++) {
        const t = types[i];
        const color = paletteColors[i % paletteColors.length];
        await updateTypeColor(t, color);
      }
      setMessage(`Applied "${selectedPalette.name}" to ${types.length} node types.`);
      loadTypes();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to apply palette');
    } finally {
      setSaving(false);
    }
  }

  async function updateTypeColor(type, color) {
    const res = await fetch(`/api/node-types/${encodeURIComponent(type.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: type.name,
        label: type.label,
        description: type.description,
        layer: type.layer,
        color,
        icon: type.icon,
        domain: type.domain,
        shape: type.shape,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update ${type.name}`);
    }
  }

  async function saveCustomColor(typeId) {
    const type = types.find(t => t.id === typeId);
    if (!type) return;
    setSaving(true);
    try {
      await updateTypeColor(type, customColors[typeId]);
      setMessage(`Updated color for "${type.name}"`);
      loadTypes();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveAllCustomColors() {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      for (const type of types) {
        if (customColors[type.id] !== type.color) {
          await updateTypeColor(type, customColors[type.id]);
        }
      }
      setMessage('All colors saved successfully');
      loadTypes();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box className="page-container" sx={{ maxWidth: 1000, mx: 'auto' }}>
      {/* Page Header */}
      <Box className="page-header" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box className="page-icon" sx={{
            width: 48, height: 48, borderRadius: 2,
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <PaletteIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Settings</Typography>
            <Typography variant="body2" color="text.secondary">
              Customize colors, themes, and appearance
            </Typography>
          </Box>
        </Box>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
      {message && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <Typography sx={{ color: '#15803d' }}>{message}</Typography>
        </Paper>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: '1px solid var(--border)' }}>
          <Tab label="Color Palettes" icon={<AutoAwesomeIcon />} iconPosition="start" />
          <Tab label="Individual Colors" icon={<ColorLensIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab: Color Palettes */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Quick Apply Palette
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a color palette and apply it to all your node types at once. Colors cycle through the palette.
          </Typography>

          <Box sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            mb: 3
          }}>
            {palettes.map(p => (
              <Paper
                key={p.id}
                onClick={() => setSelectedPalette(p)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: selectedPalette.id === p.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'var(--accent)',
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadow)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{p.name}</Typography>
                  {selectedPalette.id === p.id && (
                    <CheckCircleIcon sx={{ color: 'var(--accent)', fontSize: 18 }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {p.colors.map((c, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        bgcolor: c,
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>

          <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
            <Button
              variant="contained"
              onClick={applyPalette}
              disabled={saving || loading}
              startIcon={<AutoAwesomeIcon />}
            >
              {saving ? 'Applying...' : 'Apply to All Node Types'}
            </Button>
            <Button
              variant="outlined"
              onClick={loadTypes}
              disabled={loading}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </Stack>

          {/* Preview */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Preview</Typography>
          {loading ? (
            <LogoSpinner label="Loading..." />
          ) : types.length === 0 ? (
            <Typography color="text.secondary">No node types found</Typography>
          ) : (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {types.slice(0, 10).map((t, idx) => (
                <Paper key={t.id} sx={{ p: 1.5, borderRadius: 2, minWidth: 140 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Box sx={{
                      width: 16, height: 16, borderRadius: 1,
                      bgcolor: t.color || '#e5e7eb',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{t.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 16, height: 16, borderRadius: 1,
                      bgcolor: selectedPalette.colors[idx % selectedPalette.colors.length],
                      border: '1px solid rgba(0,0,0,0.1)'
                    }} />
                    <Typography variant="caption" color="text.secondary">
                      Will become
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Tab: Individual Colors */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Node Type Colors
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Set colors for each node type individually
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={saveAllCustomColors}
              disabled={saving}
            >
              Save All Changes
            </Button>
          </Box>

          {/* Quick color picker */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Quick Colors</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {quickColors.map(c => (
                <Tooltip key={c} title={c}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      bgcolor: c,
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      '&:hover': {
                        border: '2px solid var(--text)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => {
                      // Copy to clipboard
                      navigator.clipboard?.writeText(c);
                      setMessage(`Copied ${c} to clipboard`);
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Paper>

          {loading ? (
            <LogoSpinner label="Loading node types..." />
          ) : types.length === 0 ? (
            <Typography color="text.secondary">No node types found</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {types.map(t => (
                <Paper
                  key={t.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    border: '1px solid var(--border)'
                  }}
                >
                  <Box sx={{
                    width: 40, height: 40, borderRadius: 2,
                    bgcolor: customColors[t.id] || '#888',
                    flexShrink: 0
                  }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{t.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.layer || 'No layer'} | {t.shape || 'ellipse'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="color"
                      value={customColors[t.id] || '#888888'}
                      onChange={e => setCustomColors(prev => ({ ...prev, [t.id]: e.target.value }))}
                      style={{
                        width: 40, height: 32, border: 'none',
                        borderRadius: 4, cursor: 'pointer',
                        background: 'transparent'
                      }}
                    />
                    <TextField
                      size="small"
                      value={customColors[t.id] || ''}
                      onChange={e => setCustomColors(prev => ({ ...prev, [t.id]: e.target.value }))}
                      sx={{ width: 100 }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => saveCustomColor(t.id)}
                      disabled={saving || customColors[t.id] === t.color}
                    >
                      Save
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          {relationshipTypes.length > 0 && (
            <>
              <Divider sx={{ my: 4 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Relationship Type Colors
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {relationshipTypes.map(rt => (
                  <Paper
                    key={rt.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      border: '1px solid var(--border)'
                    }}
                  >
                    <Box sx={{
                      width: 40, height: 4, borderRadius: 2,
                      bgcolor: rt.color || '#9ca3af',
                      flexShrink: 0
                    }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{rt.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {rt.description || 'No description'}
                      </Typography>
                    </Box>
                    <Chip label={rt.color || '#9ca3af'} size="small" />
                  </Paper>
                ))}
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
