import { Box, Typography, Paper, Grid, Button, Chip, Stack } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';
import { useProjects } from '../components/ProjectContext';
import BrandPoster from '../components/BrandPoster';
import ExploreIcon from '@mui/icons-material/Explore';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TimelineIcon from '@mui/icons-material/Timeline';
import SourceIcon from '@mui/icons-material/Source';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LoopIcon from '@mui/icons-material/Loop';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolIcon from '@mui/icons-material/School';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HubIcon from '@mui/icons-material/Hub';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function HomePage() {
  const { role, user } = useAuth();
  const { activeDomainObj, accessibleDomains } = useDomains();
  const { activeProject, projects } = useProjects();
  const canEdit = role === 'admin' || role === 'editor';

  // Main workspaces - what users do most
  const mainWorkspaces = [
    {
      title: 'Knowledge Studio',
      subtitle: 'Explore your knowledge graph',
      description: 'Navigate, browse, and manage your semantic knowledge graph. Visual exploration, model browsing, and data management in one unified workspace.',
      href: '/knowledge-studio',
      icon: <HubIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
      quickStart: 'Start with Graph Navigator',
      level: 'Domain-level',
      featured: true,
    },
    {
      title: 'System Dynamics',
      subtitle: 'Model complex systems',
      description: 'Create causal loop diagrams and stock-flow models. Understand feedback loops and system behavior.',
      href: '/system-dynamics',
      icon: <LoopIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      quickStart: 'Start with a causal loop',
      level: 'Domain-level',
    },
    {
      title: 'Product Design',
      subtitle: 'Discovery before commitment',
      description: 'Explore ideas responsibly, frame problems, surface assumptions, and record learning before delivery planning.',
      href: '/product-design-workspace',
      icon: <LightbulbIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
      quickStart: 'Capture an idea and its intent',
      level: 'Domain-level or scratch',
    },
    {
      title: 'Requirements Studio',
      subtitle: 'Manage requirements',
      description: 'Capture requirements from business needs to user stories. Track traceability and ensure delivery coverage.',
      href: '/requirements-studio',
      icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      quickStart: 'Start with a Business Requirement',
      level: 'Project-level',
    },
    {
      title: 'Enterprise Architecture',
      subtitle: 'Map your enterprise',
      description: 'Define capabilities, map applications to processes, and analyze change impact. Question-based navigation guides you through EA concepts.',
      href: '/ea-studio',
      icon: <ArchitectureIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
      quickStart: 'Start by creating a Capability',
      level: 'Domain-level',
    },
    {
      title: 'Portfolio Studio',
      subtitle: 'Prioritize investments',
      description: 'Visual prioritization with Priority Matrix, Stack Rank, and WSJF/RICE scoring. Committee voting, budget envelopes, and dependency mapping.',
      href: '/portfolio-studio',
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)',
      quickStart: 'Start with Priority Matrix',
      level: 'Domain-level',
    },
  ];

  // Supporting tools
  const supportingTools = [
    {
      title: 'Diagram Workspace',
      description: 'Create flowcharts and architecture diagrams',
      href: '/diagram-workspace',
      icon: <AccountTreeIcon sx={{ fontSize: 24 }} />,
      color: '#ec4899',
    },
  ];

  // Legacy features array for backward compatibility
  const features = mainWorkspaces.map(w => ({
    title: w.title,
    description: w.description,
    href: w.href,
    icon: w.icon,
    gradient: w.gradient,
    badge: 'Workspace',
    featured: w.title === 'EA Studio',
  }));

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
      {/* Welcome Section */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
          <BrandPoster width={80} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--text)' }}>
              Welcome back{user ? `, ${user}` : ''}
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
              {activeDomainObj ? `Working in ${activeDomainObj.name}` : 'Select a domain to get started'}
              {activeProject ? ` / ${activeProject.name}` : ''}
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontStyle: 'italic',
            color: 'var(--text-muted)',
            mb: 3,
            pl: '96px',
          }}
        >
          Ontographia is the place where work is understood before it is done, and remembered after it is done.
        </Typography>

        {/* Context Warnings */}
        {!activeDomainObj && (
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #f59e0b', background: '#fef3c7' }}>
            <Typography variant="body2" sx={{ color: '#92400e' }}>
              <strong>No domain selected.</strong> Create or select a domain to start working with EA Studio or System Dynamics.
              <Button component={Link} href="/domains" size="small" sx={{ ml: 2 }}>
                Manage Domains
              </Button>
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Main Workspaces - Large Cards with Guidance */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 1 }}>
        <RocketLaunchIcon fontSize="small" /> Choose Your Workspace
      </Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {mainWorkspaces.map((workspace) => (
          <Grid item xs={12} md={4} key={workspace.href}>
            <Paper
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '1px solid var(--border)',
                overflow: 'hidden',
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
              href={workspace.href}
            >
              {/* Header */}
              <Box sx={{ p: 2.5, background: workspace.gradient, color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  {workspace.icon}
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {workspace.title}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {workspace.subtitle}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {/* Body */}
              <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 2, lineHeight: 1.6, flex: 1 }}>
                  {workspace.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Chip
                    label={workspace.level}
                    size="small"
                    sx={{ fontSize: 11, height: 22, bgcolor: 'var(--accent-soft)', color: 'var(--accent)' }}
                  />
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PlayArrowIcon fontSize="inherit" /> {workspace.quickStart}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Supporting Tools */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'var(--text)' }}>
        Explore & Analyze
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {supportingTools.map((tool) => (
          <Grid item xs={12} sm={4} key={tool.href}>
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
                  borderColor: tool.color,
                  boxShadow: 'var(--shadow)',
                },
              }}
              component={Link}
              href={tool.href}
            >
              <Box sx={{
                width: 40, height: 40, borderRadius: 1.5,
                bgcolor: tool.color + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: tool.color, flexShrink: 0
              }}>
                {tool.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--text)' }}>
                  {tool.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', display: 'block' }}>
                  {tool.description}
                </Typography>
              </Box>
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
              Ready to get started?
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
              Open a workspace to start modeling your architecture or requirements.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="contained"
              component={Link}
              href="/knowledge-studio"
              sx={{
                background: 'linear-gradient(135deg, #334155, #1e293b)',
                '&:hover': { background: 'linear-gradient(135deg, #1e293b, #0f172a)' },
              }}
            >
              Knowledge Studio
            </Button>
            <Button
              variant="contained"
              component={Link}
              href="/ea-workspace"
              sx={{
                background: 'linear-gradient(135deg, #475569, #334155)',
                '&:hover': { background: 'linear-gradient(135deg, #334155, #1e293b)' },
              }}
            >
              EA Workspace
            </Button>
            <Button
              variant="contained"
              component={Link}
              href="/portfolio-studio"
              sx={{
                background: 'linear-gradient(135deg, #475569, #334155)',
                '&:hover': { background: 'linear-gradient(135deg, #334155, #1e293b)' },
              }}
            >
              Portfolio Studio
            </Button>
            <Button
              variant="outlined"
              component={Link}
              href="/requirements-studio"
            >
              BA Workspace
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
