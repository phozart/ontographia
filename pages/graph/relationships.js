import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import RelationshipTable from '../../components/RelationshipTable';
import RelationshipFormDialog from '../../components/RelationshipFormDialog';

export default function RelationshipsPage() {
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

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
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Connections</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage relationships between nodes
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)} sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
          New Connection
        </Button>
      </Box>

      <RelationshipTable onChanged={() => setReloadKey(k => k + 1)} reloadKey={reloadKey} hideCreate />

      <RelationshipFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          setReloadKey(k => k + 1);
        }}
      />
    </Box>
  );
}
