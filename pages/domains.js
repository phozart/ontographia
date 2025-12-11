import { useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography, TextField, Button, Chip, Divider, IconButton, Tooltip } from '@mui/material';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShareIcon from '@mui/icons-material/Share';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';

export default function DomainsPage() {
  const { role, user } = useAuth();
  const isAdmin = role === 'admin';
  const { accessibleDomains, activeDomain, addDomain, setActiveDomain, shareDomain, removeShare } = useDomains();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [shareInputs, setShareInputs] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);

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
    setShowCreateForm(false);
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
    <Box className="page-container">
      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{
          width: 48, height: 48, borderRadius: 2,
          background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <FolderSpecialIcon sx={{ color: 'white', fontSize: 28 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Domains</Typography>
          <Typography variant="body2" color="text.secondary">
            {sortedAccessible.length} workspaces available
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          New Domain
        </Button>
      </Box>

      {/* Info Banner */}
      <Paper sx={{
        p: 2, mb: 3, borderRadius: 2,
        bgcolor: 'var(--accent-soft)',
        border: '1px solid var(--border)'
      }}>
        <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
          Domains are workspaces for your semantic model. Admins can access every domain.
          Editors can create their own and share them with others. Nodes and types are scoped to the active domain.
        </Typography>
      </Paper>

      {/* Create Form */}
      {showCreateForm && (
        <Paper
          component="form"
          onSubmit={handleCreate}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: '1px solid var(--border)',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Create New Domain
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Domain name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              size="small"
              placeholder="e.g., My Project, Sales Model"
            />
            <TextField
              label="Notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              multiline
              rows={2}
              size="small"
              placeholder="What goes in this workspace?"
            />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" type="submit" disabled={!name.trim()}>
                Create Domain
              </Button>
              <Button variant="outlined" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Domains Grid */}
      {sortedAccessible.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary">
            No domains available yet. Create one to get started.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
          {sortedAccessible.map(d => (
            <Paper
              key={d.id}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: activeDomain === d.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: 'var(--shadow)',
                  borderColor: activeDomain === d.id ? 'var(--accent)' : '#06b6d4',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: 2,
                  bgcolor: activeDomain === d.id ? '#06b6d4' : 'var(--bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {activeDomain === d.id ? (
                    <CheckCircleIcon sx={{ color: 'white', fontSize: 24 }} />
                  ) : (
                    <FolderSpecialIcon sx={{ color: '#06b6d4', fontSize: 24 }} />
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {d.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                    Owner: {d.owner || 'System'}
                  </Typography>
                  {d.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, mt: 0.5 }}>
                      {d.notes}
                    </Typography>
                  )}
                </Box>
                <Button
                  size="small"
                  variant={activeDomain === d.id ? 'contained' : 'outlined'}
                  onClick={() => setActiveDomain(d.id)}
                  sx={{
                    minWidth: 80,
                    ...(activeDomain === d.id && {
                      bgcolor: '#06b6d4',
                      '&:hover': { bgcolor: '#0891b2' }
                    })
                  }}
                >
                  {activeDomain === d.id ? 'Active' : 'Activate'}
                </Button>
              </Box>

              {/* Sharing Section */}
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid var(--border)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ShareIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Shared with
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1.5 }}>
                  {(d.sharedWith || []).length === 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Not shared yet
                    </Typography>
                  )}
                  {(d.sharedWith || []).map(u => (
                    <Chip
                      key={u}
                      label={u === '*admin*' ? 'Admins' : u}
                      size="small"
                      onDelete={canShare(d) && u !== '*admin*' ? () => removeShare(d.id, u) : undefined}
                      sx={{
                        height: 22,
                        fontSize: 11,
                        bgcolor: 'var(--bg)',
                        border: '1px solid var(--border)',
                      }}
                    />
                  ))}
                </Stack>
                {canShare(d) && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      size="small"
                      placeholder="Username to share with"
                      value={shareInputs[d.id] || ''}
                      onChange={e => setShareInputs(prev => ({ ...prev, [d.id]: e.target.value }))}
                      sx={{ flex: 1 }}
                      InputProps={{ sx: { height: 32, fontSize: 13 } }}
                    />
                    <Tooltip title="Add access">
                      <IconButton
                        size="small"
                        onClick={() => handleShare(d)}
                        disabled={!shareInputs[d.id]}
                        sx={{
                          bgcolor: 'var(--bg)',
                          border: '1px solid var(--border)',
                          '&:hover': { bgcolor: '#06b6d4', color: 'white' }
                        }}
                      >
                        <PersonAddIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Next Steps Info */}
      <Paper
        sx={{
          p: 2,
          mt: 3,
          borderRadius: 2,
          border: '1px dashed var(--border)',
          bgcolor: 'var(--bg)',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'var(--text-muted)' }}>
          Implementation Notes
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--text-muted)', lineHeight: 1.6, display: 'block' }}>
          Domains are stored locally for now. Connect this page to your backend API to persist
          domains and manage membership across sessions. Use the domain switcher in the header
          to quickly change your active workspace.
        </Typography>
      </Paper>
    </Box>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
