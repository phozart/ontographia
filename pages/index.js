import Link from 'next/link';
import { Box, Button, Typography, Paper, Stack } from '@mui/material';
import BrandPoster from '../components/BrandPoster';

export default function LandingPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: 'calc(100vh - 140px)',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 960,
          width: '100%',
          p: { xs: 3, md: 4 },
          textAlign: 'center',
          background: 'var(--bg-alt)',
          border: '1px solid var(--border)',
          borderRadius: 3,
          boxShadow: 'var(--shadow)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <BrandPoster width={220} />
        </Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          Ontographia
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Knowledge Graph Studio
        </Typography>
        <Stack spacing={2.5} sx={{ textAlign: 'left', mx: 'auto', maxWidth: 780 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Build a shared language for your domain
          </Typography>
          <Typography variant="body1">
            Ontographia helps you model concepts, map relationships, and keep meaning consistent as work crosses teams.
            It blends semantic modeling, graph navigation, and relationship analysis into one studio, so you can see how
            ideas connect and how changes ripple through your ecosystem.
          </Typography>
          <Typography variant="body1">
            Use it to align vocabulary, surface implicit assumptions, and make reasoning visible. Whether you are
            documenting a business process or exploring a philosophical taxonomy, Ontographia gives you a coherent
            landscape of nodes, links, and context that stays in sync as your organization evolves.
          </Typography>
          <Typography variant="body1">
            Ready to explore? Sign in to browse models, traverse graphs, and manage the knowledge that powers your work.
          </Typography>
        </Stack>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Link href="/login" passHref legacyBehavior>
            <Button variant="contained" color="primary" size="large">
              Go to Login
            </Button>
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}
