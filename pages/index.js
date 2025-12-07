import Link from 'next/link';
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
} from '@mui/material';

const steps = [
  'Define your semantic concepts and relationships.',
  'Connect events, messages, processes, KPIs, and documentation.',
  'Explore and analyze dependencies across the graph.',
  'Govern and evolve your domain knowledge continuously.',
];

const capabilityCards = [
  {
    title: 'Semantic Model Browser',
    text: 'View node types, drill into linked nodes, and inspect metadata without clutter. Understand your domain from a structured and consistent perspective.',
  },
  {
    title: 'Graph Navigator',
    text: 'Search nodes, highlight neighbors, and explore connections visually. Ideal for impact checks, exploration, and storytelling.',
  },
  {
    title: 'Govern and Evolve',
    text: 'Define node types, relationship rules, attributes, and settings. Editors and admins can evolve the model while keeping it consistent.',
  },
];

const useCaseTeasers = [
  'Data governance & semantic catalogs',
  'Change impact analysis',
  'KPI alignment and business rules clarity',
  'Knowledge management across complex domains',
];

const outcomes = [
  'Aligned vocabulary for data, rules, and processes',
  'Fewer blind spots during change impact analysis',
  'Clearer ownership of KPIs, events, and messages',
  'Documentation that stays linked to the model',
];

export default function HomePage() {
  return (
    <Box sx={{ pb: 6 }}>
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
          mb: 7,
          boxShadow: 'var(--shadow)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 80% 10%, rgba(31,58,138,0.12), transparent 40%), radial-gradient(circle at 15% 80%, rgba(31,58,138,0.08), transparent 36%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '1200px',
            mx: 'auto',
            px: { xs: 3, md: 6 },
            py: { xs: 8, md: 11 },
            display: 'grid',
            gap: { xs: 6, md: 8 },
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
            alignItems: 'center',
          }}
        >
          <Stack spacing={3.2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                label="Knowledge Graph Studio"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid var(--border)',
                  color: 'var(--accent)',
                  boxShadow: 'var(--shadow)',
                }}
              />
              <Chip
                label="Live demo ready"
                sx={{
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  fontWeight: 700,
                }}
              />
            </Stack>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 800, lineHeight: 1.1, maxWidth: 680 }}>
              Turn information into understanding
            </Typography>
            <Typography variant="body1" sx={{ fontSize: 18, lineHeight: 1.7, color: 'var(--text-muted)', maxWidth: 720 }}>
              Ontographia helps teams structure complexity, reveal hidden relationships, and build a living semantic
              model of their organisation. Model concepts, traverse graphs, and keep meaning intact as systems change.
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                component={Link}
                href="/demo"
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 999,
                  px: 3.4,
                  boxShadow: 'var(--shadow)',
                  fontWeight: 700,
                }}
              >
                Try the Demo
              </Button>
            </Stack>
            <Grid container spacing={1.5} sx={{ maxWidth: 780 }}>
              {outcomes.map(item => (
                <Grid item xs={12} sm={6} key={item}>
                  <Paper
                    elevation={0}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.3,
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid var(--border)',
                      background: 'rgba(255,255,255,0.9)',
                      boxShadow: 'var(--shadow)',
                    }}
                  >
                    <Box
                      sx={{
                        mt: '4px',
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                      {item}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--text)' }}>
              Who uses Ontographia
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2.2, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <span>• Data governance leaders aligning catalogs with processes</span>
              <span>• Domain architects mapping events, messages, and rules</span>
              <span>• Ops and product teams coordinating change impact analysis</span>
              <span>• Knowledge managers keeping documentation connected to reality</span>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 3 }}>
              <Chip label="Semantic clarity" sx={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700 }} />
              <Chip label="Navigable graph" sx={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700 }} />
              <Chip label="Continuous governance" sx={{ background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700 }} />
            </Stack>
          </Paper>
        </Box>
      </Box>

      <Section
        title="Organizations Don’t Lack Data — They Lack Meaning"
        kicker="Modern organisations capture information everywhere: systems, documents, spreadsheets, tribal knowledge, and disconnected teams. The result is fragmentation. Processes lose their context. Rules drift. KPIs contradict each other. Change becomes risky and slow. What is missing isn’t storage. What is missing is structure — a shared semantic foundation."
      />

      <Section
        title="Ontographia Creates a Living Semantic Model"
        kicker="Ontographia unifies concepts, events, rules, processes, and documentation into a single interconnected graph. You can browse the model, navigate relationships visually, and manage the underlying structure with clarity and confidence."
      />

      <Section title="Key Capabilities">
        <Grid container spacing={3}>
          {capabilityCards.map(card => (
            <Grid item xs={12} md={4} key={card.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid var(--border)',
                  background: 'var(--panel)',
                  boxShadow: 'var(--shadow)',
                  height: '100%',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
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

      <Section title="How It Works">
        <Grid container spacing={2}>
          {steps.map((step, idx) => (
            <Grid item xs={12} md={6} key={step}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2.5,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-alt)',
                  boxShadow: 'var(--shadow)',
                  height: '100%',
                }}
              >
                <Typography variant="overline" sx={{ letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                  Step {idx + 1}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  {step}
                </Typography>
                {idx === 0 && (
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                    Establish a common vocabulary so every team speaks the same language.
                  </Typography>
                )}
                {idx === 1 && (
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                    Bring signals from systems, documents, and processes into the model without losing meaning.
                  </Typography>
                )}
                {idx === 2 && (
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                    Traverse relationships to see dependencies, identify impact, and surface blind spots.
                  </Typography>
                )}
                {idx === 3 && (
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                    Govern templates, rules, and attributes so the model evolves with discipline.
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section
        title="Where Ontographia Helps"
        actions={
          <Button component={Link} href="/use-cases" variant="outlined">
            View Use Cases
          </Button>
        }
      >
        <Grid container spacing={2}>
          {useCaseTeasers.map(item => (
            <Grid item xs={12} md={6} key={item}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid var(--border)',
                  background: 'var(--panel)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {item}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section
        title="Ready to See Ontographia in Action?"
        align="center"
        actions={
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Button component={Link} href="/demo" size="large" variant="contained" sx={{ borderRadius: 999 }}>
              Try the Demo
            </Button>
          </Stack>
        }
      />
    </Box>
  );
}

function Section({ title, kicker, align = 'center', actions, children }) {
  return (
    <Box
      component="section"
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
          <Typography variant="body1" sx={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
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
