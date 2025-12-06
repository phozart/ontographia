import { Card, CardContent, CardHeader, Grid, Typography, Box, Button, Stack } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';
import BrandPoster from '../components/BrandPoster';

export default function HomePage() {
  const { role } = useAuth();
  const canEdit = role === 'admin' || role === 'editor';

  return (
    <Box sx={{ maxWidth: 1100, margin: '0 auto', width: '100%', py: 1.5 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <BrandPoster width={300} />
        <Box sx={{ width: '100%', maxWidth: 440, borderBottom: '1px solid var(--border)' }} />
      </Box>
      <Typography variant="h4" sx={{ mt: 2, mb: 1.5, fontWeight: 700 }}>
        Welcome to Ontographia Knowledge Graph Studio
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Explore the semantic model, navigate relationships, and understand your domain structure. This overview
        highlights what you can do based on your role.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader title="Browse the model" subheader="Semantic Model Browser" />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                View node types, drill into linked nodes, and inspect attributes and metadata without clutter.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Link href="/semanticmodelbrowser" passHref legacyBehavior>
                  <Button variant="contained" color="primary" size="small">Open Model Browser</Button>
                </Link>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader title="Navigate the graph" subheader="Graph Navigator" />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Search nodes, highlight neighbors, and see relationships visually. Ideal for quick impact checks.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Link href="/graphnavigator" passHref legacyBehavior>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{
                      backgroundColor: 'var(--btn)',
                      color: 'var(--btn-text)',
                      '&:hover': { backgroundColor: 'var(--btn-2)' },
                      boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                      borderColor: 'var(--btn-2)',
                      borderWidth: 1,
                      borderStyle: 'solid',
                    }}
                  >
                    Open Graph Navigator
                  </Button>
                </Link>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {canEdit && (
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader title="Manage the model" subheader="Editors & Admins" />
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Create or edit nodes and relationships. Admins can also manage users and settings.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Link href="/nodes" passHref legacyBehavior>
                    <Button variant="contained" color="primary" size="small">Nodes</Button>
                  </Link>
                  <Link href="/relationships" passHref legacyBehavior>
                    <Button variant="contained" color="primary" size="small">Relationships</Button>
                  </Link>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
