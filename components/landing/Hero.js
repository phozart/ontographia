// components/landing/Hero.js
// Hero section for landing page

import Link from 'next/link';
import { Box, Button, Typography, Chip, Stack } from '@mui/material';
import BrandPoster from '../BrandPoster';

export default function Hero({ user }) {
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
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            lineHeight: 1.2,
            mb: 2,
            color: 'var(--text)',
          }}
        >
          Where Work Is Understood and Remembered.
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
          A connected knowledge platform for enterprise architecture, requirements,
          portfolios, system dynamics, and structured thinking. Not another document repository -
          a living graph where everything connects.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          {user ? (
            <Button
              component={Link}
              href="/home"
              variant="contained"
              size="large"
              sx={{
                borderRadius: 999,
                px: 4,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #334155, #1e293b)',
                '&:hover': { background: 'linear-gradient(135deg, #1e293b, #0f172a)' },
              }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              component={Link}
              href="/login"
              variant="contained"
              size="large"
              sx={{
                borderRadius: 999,
                px: 4,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #334155, #1e293b)',
                '&:hover': { background: 'linear-gradient(135deg, #1e293b, #0f172a)' },
              }}
            >
              Log in to explore
            </Button>
          )}
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
