import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import BrandPoster from '../components/BrandPoster';

const steps = [
  {
    title: 'Capture',
    text: 'Define the core concepts, relationships, and attributes that describe your domain.',
  },
  {
    title: 'Navigate',
    text: 'Explore the graph visually, highlight neighbors, and understand structure at a glance.',
  },
  {
    title: 'Connect',
    text: 'Keep documentation, rules, and rationale linked to the model so context is never lost.',
  },
  {
    title: 'Govern & evolve',
    text: 'Adjust types, templates, and constraints with clear guard rails as your landscape changes.',
  },
];

const capabilityCards = [
  {
    title: 'Model with confidence',
    text: 'Design concepts, relationships, and attributes in one studio. Keep vocabulary consistent and navigable across teams and contexts.',
  },
  {
    title: 'Visual graph navigation',
    text: 'Traverse nodes, spotlight neighbors, and see structure at a glance. Ideal for discovery, storytelling, and impact checks.',
  },
  {
    title: 'Governance built in',
    text: 'Control types, templates, and evolution rules. Editors and admins stay aligned without adding friction to change.',
  },
];

const useCaseTeasers = [
  'Knowledge portals for complex domains',
  'Data catalogs and semantic glossaries',
  'Change and impact analysis for projects',
  'Architecture and operating model clarity',
  'Audit-ready context for compliance teams',
];

const outcomes = [
  { title: 'Shared language', text: 'Clear terms for concepts, rules, and processes.' },
  { title: 'Faster onboarding', text: 'Navigable context that shortens ramp-up time.' },
  { title: 'Lower risk', text: 'Reduce ambiguity, divergence, and rework.' },
  { title: 'Traceable decisions', text: 'Link choices back to the conceptual map.' },
];

export default function HomePage() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            entry.target.classList.remove('in-view');
          }
        });
      },
      { threshold: 0.25 }
    );
    const nodes = document.querySelectorAll('.reveal');
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <Box sx={{ pb: 10 }}>
      <Hero />
      <MeaningBlock />

      <StepsSection />

      <Section title="Key Capabilities">
        <Grid container spacing={3}>
          {capabilityCards.map((card, idx) => (
            <Grid item xs={12} md={4} key={card.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid var(--border)',
                  background:
                    idx === 0
                      ? 'linear-gradient(140deg, rgba(31,58,138,0.10), var(--panel))'
                      : idx === 1
                      ? 'linear-gradient(140deg, rgba(122,162,255,0.12), var(--panel))'
                      : 'linear-gradient(140deg, rgba(55,65,81,0.10), var(--panel))',
                  boxShadow: 'var(--shadow)',
                  height: '100%',
                  display: 'grid',
                  gap: 1,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.35), transparent 45%)',
                    pointerEvents: 'none',
                  }}
                />
                <Box
                  sx={{
                    width: 36,
                    height: 6,
                    borderRadius: 12,
                    background:
                      idx === 0
                        ? 'var(--nav-active-bg)'
                        : idx === 1
                        ? '#5f7fff'
                        : '#4b5563',
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {card.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {card.text}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section title="How teams use it">
        <Grid container spacing={2}>
          {useCaseTeasers.map(item => (
            <Grid item xs={12} md={6} key={item}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px dashed var(--border)',
                  background: 'linear-gradient(160deg, var(--panel), var(--bg-alt))',
                  boxShadow: 'var(--shadow)',
                  height: '100%',
                  display: 'grid',
                  gap: 1,
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {item}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                  Map concepts, show how they connect, and keep explanations and decisions anchored to the model.
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section
        title="Ready to see Ontographia in action?"
        align="center"
        actions={
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Button
              component={Link}
              href="/demo"
              size="large"
              variant="contained"
              sx={{ borderRadius: 999, px: 3.4, boxShadow: 'var(--shadow)', fontWeight: 700 }}
            >
              Try the Demo
            </Button>
          </Stack>
        }
      />
    </Box>
  );
}

function Hero() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: theme =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(120% 120% at 15% 20%, rgba(122,162,255,0.12), transparent), linear-gradient(140deg,#1f2430,#2a3241)'
            : 'radial-gradient(120% 120% at 20% 15%, rgba(31,58,138,0.10), transparent), linear-gradient(140deg,#ffffff,#eef2f7)',
        borderRadius: '0 0 28px 28px',
        mb: 5,
        boxShadow: 'var(--shadow)',
        minHeight: { xs: 'auto', md: '70vh' },
        backgroundAttachment: 'fixed',
      }}
    >
      <BackgroundFlares />
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1200px',
          mx: 'auto',
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 7 },
          display: 'grid',
          gap: { xs: 6, md: 10 },
          gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
          alignItems: 'center',
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        <Stack spacing={3} sx={{ animation: 'fadeUp 0.8s ease both' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'center', sm: 'center' }}
            justifyContent={{ xs: 'center', md: 'flex-start' }}
          >
            <Chip
              label="Knowledge Graph Studio"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                background: 'var(--panel)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text)',
                boxShadow: 'var(--shadow)',
              }}
            />
            <Chip
              label="Live demo ready"
              sx={{
                background: 'var(--panel)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text)',
                fontWeight: 700,
              }}
            />
          </Stack>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, lineHeight: 1.05, maxWidth: 720 }}>
            A living map of your knowledge
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: 16, md: 18 },
              lineHeight: 1.65,
              color: 'var(--text-muted)',
              maxWidth: 680,
              mx: { xs: 'auto', md: 'initial' },
            }}
          >
            Ontographia is a semantic modeling and graph navigation studio. Align concepts, surface relationships, and keep
            meaning intact as your organisation changes—without losing context or speed.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            flexWrap="wrap"
            justifyContent={{ xs: 'center', md: 'flex-start' }}
          >
            <Button
              component={Link}
              href="/demo"
              variant="contained"
              size="large"
              sx={{ borderRadius: 999, px: 3.4, boxShadow: 'var(--shadow)', fontWeight: 700 }}
            >
              Try the Demo
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} flexWrap="wrap">
            <Chip
              label="Model"
              variant="outlined"
              sx={{ borderColor: 'var(--border-strong)', color: 'var(--text)', background: 'var(--panel)' }}
            />
            <Chip
              label="Navigate"
              variant="outlined"
              sx={{ borderColor: 'var(--border-strong)', color: 'var(--text)', background: 'var(--panel)' }}
            />
            <Chip
              label="Govern"
              variant="outlined"
              sx={{ borderColor: 'var(--border-strong)', color: 'var(--text)', background: 'var(--panel)' }}
            />
          </Stack>
        </Stack>

        <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          border: '1px solid var(--border-strong)',
          background: 'var(--panel)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.14)',
          backdropFilter: 'blur(8px)',
          textAlign: { xs: 'center', md: 'left' },
          display: 'grid',
          gap: 2,
          justifyItems: { xs: 'center', md: 'center' },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 30% 10%, rgba(31,58,138,0.12), transparent 55%)',
            pointerEvents: 'none',
          }}
        />
        <BrandPoster
          width={220}
          color="var(--text)"
          style={{
            filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.12))',
            animation: 'logoFloat 9s ease-in-out infinite alternate',
            zIndex: 1,
            marginBottom: 6,
            }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text)' }}>
            Who uses Ontographia
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 1.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
           
            <span>• Domain architects keeping conceptual maps coherent</span>
            <span>• Product and ops teams understanding impact and dependencies</span>
            <span>• Knowledge managers keeping documentation connected to reality</span>
            <span>• Architects and analysts tracing rationale behind change</span>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            justifyContent={{ xs: 'center', md: 'flex-start' }}
            sx={{ mt: 2 }}
          >
            <Chip
              label="Semantic clarity"
              variant="outlined"
              sx={{ background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
            />
            <Chip
              label="Navigable graph"
              variant="outlined"
              sx={{ background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
            />
            <Chip
              label="Continuous governance"
              variant="outlined"
              sx={{ background: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
            />
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

function BackgroundFlares() {
  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 80% 10%, rgba(31,58,138,0.12), transparent 40%), radial-gradient(circle at 15% 80%, rgba(31,58,138,0.08), transparent 36%)',
          pointerEvents: 'none',
          backgroundAttachment: 'fixed',
          transform: 'translateY(var(--bg-float-y, 0px)) translateX(var(--bg-float-x, 0px))',
          transition: 'transform 0.4s ease-out',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: '-25% -5% auto',
          height: '90%',
          background:
            'repeating-linear-gradient(115deg, rgba(31,58,138,0.06), rgba(31,58,138,0.06) 14px, transparent 14px, transparent 38px)',
          opacity: 0.35,
          filter: 'blur(1px)',
          pointerEvents: 'none',
          backgroundAttachment: 'fixed',
          transform: 'translateY(calc(var(--bg-float-y, 0px) * 0.4)) translateX(calc(var(--bg-float-x, 0px) * 0.4))',
          transition: 'transform 0.5s ease-out',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: '-30% 5% auto',
          width: '120%',
          height: '120%',
          opacity: 0.1,
          background:
            'radial-gradient(140px 140px at 20% 40%, rgba(31,58,138,0.28), transparent 60%), radial-gradient(160px 160px at 70% 10%, rgba(31,58,138,0.18), transparent 65%), radial-gradient(180px 180px at 80% 80%, rgba(31,58,138,0.16), transparent 70%)',
          animation: 'floatDots 16s ease-in-out infinite alternate',
          pointerEvents: 'none',
          '@keyframes floatDots': {
            from: { transform: 'translateY(0px)' },
            to: { transform: 'translateY(18px)' },
          },
        }}
      />
      <style jsx global>{`
        @keyframes logoFloat {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-10px) scale(1.01); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.in-view {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </>
  );
}

function MeaningBlock() {
  return (
    <Box
      className="reveal"
      sx={{
        maxWidth: '1100px',
        mx: 'auto',
        px: { xs: 3, md: 6 },
        py: { xs: 6, md: 8 },
        textAlign: 'center',
        display: 'grid',
        gap: 3,
      }}
    >
      <Typography variant="body1" sx={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 900, mx: 'auto' }}>
        Modern organisations capture information everywhere: systems, documents, spreadsheets, tacit know-how, and disconnected
        teams. The result is fragmentation. Processes lose their context. Rules drift. Metrics contradict each other. Change becomes
        risky and slow. What is missing isn’t storage. What is missing is structure — a shared semantic foundation.
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, mt: 3.5, mb: 4 }}>
        Organizations Don't Lack Data — They Lack Meaning
      </Typography>
      <Typography variant="body1" sx={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 880, mx: 'auto', mb: 2 }}>
        Ontographia unifies concepts, rules, documentation, and governance into one connected graph. Browse the model, navigate
        relationships visually, and manage the underlying structure with clarity and confidence.
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, mt: 2 }}>
        Ontographia Creates a Living Semantic Model
      </Typography>
      <Divider sx={{ maxWidth: 280, mx: 'auto', mt: 2, mb: 1, borderColor: 'var(--border)' }} />
      <Paper
        elevation={0}
        className="reveal"
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          border: '1px solid var(--border)',
          background: 'linear-gradient(160deg, var(--panel), var(--bg))',
          boxShadow: 'var(--shadow)',
        }}
      >
        {outcomes.map(item => (
          <Stack
            key={item.title}
            direction="row"
            spacing={1.5}
            alignItems="flex-start"
            sx={{ py: 1.25, borderBottom: '1px solid var(--border)' }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: 'var(--accent)',
                mt: '6px',
                flexShrink: 0,
              }}
            />
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text)' }}>
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-muted)', lineHeight: 1.5, mt: 0.25 }}>
                {item.text}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Paper>
    </Box>
  );
}

function Section({ title, kicker, align = 'center', actions, children }) {
  return (
    <Box
      component="section"
      className="reveal"
      sx={{
        maxWidth: '1100px',
        mx: 'auto',
        px: { xs: 3, md: 6 },
        py: { xs: 5, md: 7 },
        textAlign: align,
      }}
    >
      <Stack spacing={2} alignItems={align === 'center' ? 'center' : 'flex-start'}>
        {kicker && (
          <Typography variant="body1" sx={{ color: 'var(--text-muted)', lineHeight: 1.6, textAlign: align }}>
            {kicker}
          </Typography>
        )}
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: align }}>
          {title}
        </Typography>
        {actions && <Box>{actions}</Box>}
      </Stack>
      {children && <Box sx={{ mt: 3 }}>{children}</Box>}
    </Box>
  );
}

function StepsSection() {
  return (
    <Box
      component="section"
      className="reveal"
      sx={{
        maxWidth: '1100px',
        mx: 'auto',
        px: { xs: 3, md: 6 },
        py: { xs: 5, md: 7 },
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        How Ontographia flows
      </Typography>
      <Typography variant="body1" sx={{ color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 860, mx: 'auto', mb: 3 }}>
        A simple rhythm: capture, explore, connect, and keep it governed. Each step reinforces the next, so meaning stays coherent.
      </Typography>
      <Grid container spacing={2} alignItems="stretch">
        {steps.map((step, idx) => (
          <Grid item xs={12} md={3} key={step.title}>
            <Paper
              elevation={0}
              sx={{
                p: 2.6,
                borderRadius: 4,
                border: '1px solid var(--border)',
                background: 'linear-gradient(150deg, var(--panel), var(--bg))',
                boxShadow: 'var(--shadow)',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                animation: 'fadeUp 0.9s ease both',
                animationDelay: `${0.06 * idx}s`,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.3), transparent 45%)',
                  pointerEvents: 'none',
                }}
              />
              <Stack spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="overline" sx={{ letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                  Step {idx + 1}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, mb: 0.5 }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {step.text}
                </Typography>
          </Stack>
        </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
