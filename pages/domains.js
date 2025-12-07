import { useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography, TextField, Button, Chip, Divider } from '@mui/material';
import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';

export default function DomainsPage() {
  const { role, user } = useAuth();
  const isAdmin = role === 'admin';
  const { accessibleDomains, activeDomain, addDomain, setActiveDomain, shareDomain, removeShare } = useDomains();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [shareInputs, setShareInputs] = useState({});

  const sortedAccessible = useMemo(
    () => [...accessibleDomains].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [accessibleDomains]
  );

  function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    addDomain({ name: name.trim(), notes: notes.trim() });
    setName('');
    setNotes('');
  }

  function canShare(domain) {
    if (!domain) return false;
    if (isAdmin) return true;
    return domain.owner === user;
  }

  function handleShare(domain) {
    const target = (shareInputs[domain.id] || '').trim();
    if (!target) return;
    shareDomain(domain.id, target);
    setShareInputs(prev => ({ ...prev, [domain.id]: '' }));
  }

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Domains (workspaces)
      </Typography>
      <Typography variant="body1" sx={{ color: 'var(--text-muted)', mb: 3, lineHeight: 1.6 }}>
        Domains are workspaces for your semantic model. Admins can access every domain. Editors can create their own and
        share them with others. Viewers see only the domains they have been granted. Nodes and node types are scoped to
        the currently active domain.
      </Typography>

      <Paper
        component="form"
        onSubmit={handleCreate}
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid var(--border)',
          borderRadius: 3,
          background: 'linear-gradient(160deg, var(--panel), var(--bg))',
          boxShadow: 'var(--shadow)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Create a domain
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 2 }}>
          Domains are stored locally for now. Hook this page up to your API to persist and manage membership.
        </Typography>
        <Stack spacing={2}>
          <TextField label="Domain name" value={name} onChange={e => setName(e.target.value)} required />
          <TextField
            label="Notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            multiline
            minRows={2}
            placeholder="What goes in this workspace?"
          />
          <Button variant="contained" type="submit" disabled={!name.trim()}>
            Add domain
          </Button>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {sortedAccessible.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
            No domains available yet. Create one above or ask an admin to share access.
          </Typography>
        ) : (
          sortedAccessible.map(d => (
            <Paper
              key={d.id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid var(--border)',
                background: activeDomain === d.id ? 'var(--accent-soft)' : 'var(--panel)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1} alignItems="start">
                <div>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {d.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 1 }}>
                    Owner: {d.owner || '—'}
                  </Typography>
                </div>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button
                    size="small"
                    variant={activeDomain === d.id ? 'contained' : 'outlined'}
                    onClick={() => setActiveDomain(d.id)}
                  >
                    {activeDomain === d.id ? 'Active' : 'Make active'}
                  </Button>
                </Stack>
              </Stack>

              {d.notes && (
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', mt: 1 }}>
                  {d.notes}
                </Typography>
              )}

              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Shared with
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                {(d.sharedWith || []).length === 0 && (
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                    Not shared yet.
                  </Typography>
                )}
                {(d.sharedWith || []).map(u => (
                  <Chip
                    key={u}
                    label={u === '*admin*' ? 'Admins' : u}
                    onDelete={canShare(d) && u !== '*admin*' ? () => removeShare(d.id, u) : undefined}
                    sx={{
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)',
                    }}
                  />
                ))}
              </Stack>
              {canShare(d) && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" sx={{ mt: 1.5 }}>
                  <TextField
                    label="Share with user"
                    size="small"
                    value={shareInputs[d.id] || ''}
                    onChange={e => setShareInputs(prev => ({ ...prev, [d.id]: e.target.value }))}
                    sx={{ minWidth: 220 }}
                  />
                  <Button size="small" variant="contained" onClick={() => handleShare(d)} disabled={!shareInputs[d.id]}>
                    Add access
                  </Button>
                </Stack>
              )}
            </Paper>
          ))
        )}
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mt: 3,
          borderRadius: 3,
          border: '1px dashed var(--border)',
          background: 'var(--bg)',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Next steps (needs backend wiring)
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <li>Persist domains and memberships in your database.</li>
          <li>Use the active domain to scope node types, nodes, and creation forms.</li>
          <li>Let admins grant access to any domain; owners can share theirs.</li>
          <li>Expose a quick domain switcher in the header (already available) so users stay in their workspace.</li>
        </ul>
      </Paper>
    </Box>
  );
}
