import { useEffect, useMemo, useState } from 'react';
import { LogoSpinner } from '../components/Logo';

const palettes = [
  { id: 'pastel-sunset', name: 'Pastel Sunset', colors: ['#fdeac2', '#f7c7d9', '#dec9f7', '#c7e9fb', '#d7f3c2'] },
  { id: 'pastel-sea', name: 'Pastel Sea', colors: ['#e3edff', '#d8f5f9', '#e7ddff', '#fde3e8', '#dff7e7'] },
  { id: 'soft-neon', name: 'Soft Neon', colors: ['#fbe0e0', '#fde9d6', '#fdf3c9', '#e6f7ce', '#d4f5f9'] },
  { id: 'mint-latte', name: 'Mint Latte', colors: ['#fef6e8', '#fdf0d4', '#ecf6dc', '#dff6eb', '#e5f3fc'] },
];

export default function SettingsPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState(palettes[0]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadTypes();
  }, []);

  async function loadTypes() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/node-types');
      if (!res.ok) {
        setError(`Failed to load node types (${res.status})`);
        setTypes([]);
        return;
      }
      const data = await res.json();
      setTypes(data);
    } catch (e) {
      console.error(e);
      setError('Unexpected error loading node types');
    } finally {
      setLoading(false);
    }
  }

  const previewTypes = useMemo(() => types.slice(0, 5), [types]);

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
        const res = await fetch(`/api/node-types/${encodeURIComponent(t.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: t.name,
            label: t.label,
            description: t.description,
            layer: t.layer,
            color,
            icon: t.icon,
            domain: t.domain,
            shape: t.shape,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Failed to update ${t.name}`);
        }
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

  return (
    <div className="page-container">
      <h2>Settings</h2>
      <p>Pick a pastel theme to quickly set default colours for your node types. Individual node colours still override the type colour.</p>

      {error && <p className="error-msg">{error}</p>}
      {message && <p className="chip" style={{ border: '1px solid #22c55e', background: '#ecfdf3' }}>{message}</p>}

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', maxWidth: 840 }}>
        {palettes.map(p => (
          <button
            key={p.id}
            className={`card ${selectedPalette.id === p.id ? 'pill--active' : ''}`}
            onClick={() => setSelectedPalette(p)}
            style={{ textAlign: 'left', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{p.name}</strong>
              {selectedPalette.id === p.id && <span style={{ fontSize: 12, color: '#16a34a' }}>Selected</span>}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {p.colors.map(c => (
                <span key={c} style={{ width: 26, height: 26, borderRadius: 6, background: c, border: '1px solid #e5e7eb' }} />
              ))}
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="btn" onClick={applyPalette} disabled={saving || loading}>
          {saving ? 'Applying...' : 'Apply palette to node types'}
        </button>
        <button className="btn-secondary" onClick={loadTypes} disabled={loading}>Reload node types</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <p style={{ marginBottom: 6, color: '#6b7280' }}>Preview on first few types:</p>
        {loading ? (
          <LogoSpinner label="Loading node types..." />
        ) : previewTypes.length === 0 ? (
          <p>No node types found.</p>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {previewTypes.map((t, idx) => (
              <div key={t.id} className="card" style={{ padding: 10, minWidth: 160 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 6, background: t.color || '#e5e7eb', border: '1px solid #cbd5e1' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: 13 }}>{t.name}</strong>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Color: {t.color || 'none'}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Will become: {selectedPalette.colors[idx % selectedPalette.colors.length]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
