// components/landing/Hero.js
// Hero section for landing page

import Link from 'next/link';
import { Box, Button, Typography, Chip, Stack } from '@mui/material';
import BrandPoster from '../BrandPoster';

export default function Hero() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: theme =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(140deg,#1f2430,#2a3241)'
            : 'linear-gradient(140deg,#ffffff,#eef2f7)',
        borderRadius: '0 0 28px 28px',
        mb: 5,
        boxShadow: 'var(--shadow)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1100px',
          mx: 'auto',
          px: { xs: 3, md: 6 },
          py: { xs: 5, md: 8 },
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }} className="hero-logo">
          <BrandPoster width={240} color="var(--text)" />
        </Box>
        <Chip
          label="Knowledge Graph Studio"
          sx={{
            mb: 2,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: 'var(--panel)',
            border: '1px solid var(--border)',
          }}
        />
        <Typography variant="h2" component="h1" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 2 }}>
          A living map of your knowledge
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: 16, md: 18 },
            lineHeight: 1.7,
            color: 'var(--text-muted)',
            maxWidth: 700,
            mx: 'auto',
            mb: 4,
          }}
        >
          Ontographia is a semantic modeling and graph navigation studio. Align concepts,
          surface relationships, and keep meaning intact as your organization evolves.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          <Button
            component={Link}
            href="/login"
            variant="contained"
            size="large"
            sx={{
              borderRadius: 999,
              px: 4,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              '&:hover': { background: 'linear-gradient(135deg, #2563eb, #1e40af)' },
            }}
          >
            Log in to explore
          </Button>
          <Button
            component="a"
            href="#demo"
            variant="outlined"
            size="large"
            sx={{ borderRadius: 999, px: 4, fontWeight: 600 }}
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#demo')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Try the demo
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
