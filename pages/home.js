import { Box, Typography, Paper, Grid, Button, Chip, Stack } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';
import BrandPoster from '../components/BrandPoster';
import ExploreIcon from '@mui/icons-material/Explore';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TimelineIcon from '@mui/icons-material/Timeline';
import SourceIcon from '@mui/icons-material/Source';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';

export default function HomePage() {
  const { role } = useAuth();
  const canEdit = role === 'admin' || role === 'editor';

  const features = [
    {
      title: 'Semantic Model Browser',
      description: 'View node types, drill into linked nodes, and inspect attributes and metadata without clutter.',
      href: '/semanticmodelbrowser',
      icon: <ExploreIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
      badge: 'Explore',
    },
    {
      title: 'Graph Navigator',
      description: 'Search nodes, highlight neighbors, and see relationships visually. Ideal for quick impact checks.',
      href: '/graphnavigator',
      icon: <AccountTreeIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      badge: 'Navigate',
      featured: true,
    },
    {
      title: 'Flow Designer',
      description: 'Create flowcharts and diagrams with drag-and-drop. Import your designs to the knowledge graph when ready.',
      href: '/flow-designer',
      icon: <TimelineIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      badge: 'Design',
    },
    {
      title: 'Diagram Workspace',
      description: 'Build flowcharts, causal loops, and mindmaps in a sandbox before importing to the graph.',
      href: '/diagram-workspace',
      icon: <AccountTreeIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
      badge: 'Create',
    },
  ];

  const managementFeatures = [
    {
      title: 'Nodes',
      description: 'Create, edit, and manage nodes in your knowledge graph.',
      href: '/nodes',
      icon: <SourceIcon sx={{ fontSize: 24 }} />,
      color: '#3b82f6',
    },
    {
      title: 'Connections',
      description: 'Define relationships between nodes.',
      href: '/relationships',
      icon: <DeviceHubIcon sx={{ fontSize: 24 }} />,
      color: '#10b981',
    },
    {
      title: 'Node Types',
      description: 'Define the types of nodes in your model.',
      href: '/node-types',
      icon: <CategoryIcon sx={{ fontSize: 24 }} />,
      color: '#8b5cf6',
    },
    {
      title: 'Connection Types',
      description: 'Define relationship types between nodes.',
      href: '/relationship-types',
      icon: <DeviceHubIcon sx={{ fontSize: 24 }} />,
      color: '#f59e0b',
    },
    {
      title: 'Domains',
      description: 'Manage workspaces and domain scoping.',
      href: '/domains',
      icon: <FolderSpecialIcon sx={{ fontSize: 24 }} />,
      color: '#06b6d4',
    },
    {
      title: 'Settings',
      description: 'Configure colors, themes, and preferences.',
      href: '/settings',
      icon: <SettingsIcon sx={{ fontSize: 24 }} />,
      color: '#64748b',
    },
  ];

  return (
    <Box className="page-container" sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <BrandPoster width={280} />
        </Box>
        <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', borderBottom: '1px solid var(--border)', mb: 3 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5, color: 'var(--text)' }}>
          Knowledge Graph Studio
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-muted)', maxWidth: 600, mx: 'auto', lineHeight: 1.7 }}>
          Explore the semantic model, navigate relationships, and understand your domain structure.
          Design diagrams and manage your knowledge graph with powerful visual tools.
        </Typography>
      </Box>

      {/* Main Features Grid */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'var(--text)' }}>
        Explore & Design
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={3} key={feature.href}>
            <Paper
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 3,
                border: feature.featured ? '2px solid var(--accent)' : '1px solid var(--border)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 'var(--shadow)',
                  borderColor: 'var(--accent)',
                },
              }}
              component={Link}
              href={feature.href}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: 2,
                  background: feature.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', flexShrink: 0
                }}>
                  {feature.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Chip
                    label={feature.badge}
                    size="small"
                    sx={{
                      height: 20, fontSize: 10, fontWeight: 600,
                      bgcolor: 'var(--bg)', color: 'var(--text-muted)'
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: 'var(--text)' }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5, flex: 1 }}>
                {feature.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Management Section */}
      {canEdit && (
        <>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'var(--text)' }}>
            Manage Your Model
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {managementFeatures.map((feature) => (
              <Grid item xs={12} sm={6} md={4} key={feature.href}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    '&:hover': {
                      borderColor: feature.color,
                      boxShadow: 'var(--shadow)',
                    },
                  }}
                  component={Link}
                  href={feature.href}
                >
                  <Box sx={{
                    width: 40, height: 40, borderRadius: 1.5,
                    bgcolor: feature.color + '15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: feature.color, flexShrink: 0
                  }}>
                    {feature.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--text)' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', display: 'block' }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Quick Actions */}
      <Paper sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, var(--panel), var(--bg))',
        border: '1px solid var(--border)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--text)' }}>
              Ready to explore?
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
              Start by browsing the graph or creating new nodes and connections.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              component={Link}
              href="/graphnavigator"
              sx={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                '&:hover': { background: 'linear-gradient(135deg, #2563eb, #1e40af)' },
              }}
            >
              Open Graph Navigator
            </Button>
            {canEdit && (
              <Button
                variant="outlined"
                component={Link}
                href="/nodes"
              >
                Manage Nodes
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
