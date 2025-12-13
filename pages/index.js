// pages/index.js
// Landing page with hero and interactive demo

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Grid, Paper, Typography, Chip } from '@mui/material';
import { useAuth } from '../components/AuthContext';
import { Hero, InteractiveDemo } from '../components/landing';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LoopIcon from '@mui/icons-material/Loop';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import DashboardIcon from '@mui/icons-material/Dashboard';

// The story of what Ontographia does
const storyPoints = [
  {
    title: 'The Problem',
    subtitle: 'Organizations struggle with knowledge fragmentation',
    text: 'Architecture decisions live in documents nobody reads. Requirements get lost between teams. Knowledge walks out the door when people leave. Sound familiar?',
  },
  {
    title: 'The Solution',
    subtitle: 'A living knowledge graph that connects everything',
    text: 'Ontographia captures your enterprise knowledge as connected concepts - not isolated documents. Every capability, requirement, decision, and system is linked, searchable, and traceable.',
  },
  {
    title: 'The Outcome',
    subtitle: 'Clarity, continuity, and confidence',
    text: 'New team members onboard faster. Impact analysis becomes instant. Decisions are traceable. Your organization\'s knowledge becomes a permanent, evolving asset.',
  },
];

// Who benefits from Ontographia
const personas = [
  {
    title: 'Enterprise Architects',
    icon: <ArchitectureIcon sx={{ fontSize: 32 }} />,
    color: '#0ea5e9',
    benefits: ['Map business capabilities', 'Connect applications to processes', 'Analyze change impact'],
    cta: 'Start with EA Studio',
    href: '/ea-studio',
  },
  {
    title: 'Business Analysts',
    icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
    color: '#10b981',
    benefits: ['Capture requirements properly', 'Trace to delivery', 'Ensure coverage'],
    cta: 'Start with BA Workspace',
    href: '/requirements-studio',
  },
  {
    title: 'Systems Thinkers',
    icon: <LoopIcon sx={{ fontSize: 32 }} />,
    color: '#f59e0b',
    benefits: ['Model feedback loops', 'Understand dynamics', 'Communicate systems'],
    cta: 'Start with System Dynamics',
    href: '/system-dynamics',
  },
];

const outcomes = [
  { title: 'Shared language', text: 'Clear terms for concepts, rules, and processes across teams.' },
  { title: 'Faster onboarding', text: 'Navigable context that cuts ramp-up time from weeks to days.' },
  { title: 'Lower risk', text: 'Traceable requirements reduce ambiguity, divergence, and rework.' },
  { title: 'Living documentation', text: 'Your architecture evolves with your business, not in stale documents.' },
];

const steps = [
  { title: 'Capture', text: 'Define capabilities, requirements, and decisions as connected knowledge.', color: ['#3b82f6', '#1d4ed8'] },
  { title: 'Navigate', text: 'Explore visually - see what depends on what, who owns what.', color: ['#10b981', '#059669'] },
  { title: 'Trace', text: 'Follow the thread from strategy to delivery to implementation.', color: ['#8b5cf6', '#7c3aed'] },
  { title: 'Evolve', text: 'As your business changes, your knowledge graph changes with it.', color: ['#f59e0b', '#d97706'] },
];

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [user, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.15 }
    );
    const nodes = document.querySelectorAll('.reveal');
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  // Show loading while redirecting
  if (user) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Typography>Redirecting to dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 10 }}>
      <Hero />

      {/* Story Section - The Narrative */}
      <Section className="reveal" maxWidth="900px">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            The Knowledge Problem
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)', maxWidth: 700, mx: 'auto', lineHeight: 1.7 }}>
            Every organization has a story. But too often, that story is scattered across documents,
            slides, wikis, and the minds of people who might leave tomorrow.
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {storyPoints.map((point, idx) => (
            <Grid item xs={12} md={4} key={point.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid var(--border)',
                  background: idx === 1 ? 'var(--accent-soft)' : 'var(--panel)',
                  height: '100%',
                }}
              >
                <Typography variant="overline" sx={{ color: idx === 1 ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {point.title}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'var(--text)' }}>
                  {point.subtitle}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {point.text}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* Who Is It For */}
      <Section className="reveal" maxWidth="1100px">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Chip
            label="Built for Practitioners"
            sx={{ mb: 2, fontWeight: 600, bgcolor: 'var(--accent-soft)', color: 'var(--accent)' }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Choose Your Starting Point
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)', maxWidth: 600, mx: 'auto' }}>
            Whether you're mapping capabilities, managing requirements, or modeling systems -
            there's a workspace designed for how you think.
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {personas.map((persona) => (
            <Grid item xs={12} md={4} key={persona.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid var(--border)',
                  background: 'var(--panel)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: persona.color,
                    transform: 'translateY(-4px)',
                    boxShadow: 'var(--shadow)',
                  },
                }}
              >
                <Box sx={{
                  width: 56, height: 56, borderRadius: 2,
                  background: `${persona.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: persona.color, mb: 2
                }}>
                  {persona.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {persona.title}
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2, flex: 1 }}>
                  {persona.benefits.map((b, i) => (
                    <Typography component="li" key={i} variant="body2" sx={{ color: 'var(--text-muted)', mb: 0.5 }}>
                      {b}
                    </Typography>
                  ))}
                </Box>
                <Button
                  component={Link}
                  href={persona.href}
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderColor: persona.color,
                    color: persona.color,
                    '&:hover': { background: `${persona.color}10`, borderColor: persona.color },
                  }}
                >
                  {persona.cta}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* Interactive Demo Section */}
      <Section className="reveal">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Chip
            label="Interactive Demo"
            sx={{
              mb: 2,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white',
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            See the Graph in Action
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)', maxWidth: 600, mx: 'auto' }}>
            Click on nodes to explore relationships. This is how connected knowledge works.
          </Typography>
        </Box>
        <InteractiveDemo />
      </Section>

      {/* Steps Section */}
      <Section className="reveal" maxWidth="1100px">
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, textAlign: 'center' }}>
          How It Works
        </Typography>
        <Grid container spacing={2}>
          {steps.map((step, idx) => (
            <Grid item xs={6} md={3} key={step.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid var(--border)',
                  background: 'var(--panel)',
                  height: '100%',
                  textAlign: 'center',
                }}
              >
                <Box sx={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${step.color[0]}, ${step.color[1]})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: 18, mx: 'auto', mb: 2
                }}>
                  {idx + 1}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                  {step.text}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* Outcomes Section */}
      <Section className="reveal" maxWidth="900px">
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, textAlign: 'center' }}>
          The Results
        </Typography>
        <Grid container spacing={2}>
          {outcomes.map(item => (
            <Grid item xs={12} sm={6} key={item.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid var(--border)',
                  background: 'var(--panel)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <Box sx={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: 'var(--accent)', mt: '6px', flexShrink: 0
                }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                    {item.text}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* CTA Section */}
      <Section className="reveal" maxWidth="800px">
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, var(--panel), var(--bg))',
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Ready to connect your knowledge?
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)', mb: 3 }}>
            Start building your organization's living knowledge graph today.
          </Typography>
          <Button
            component={Link}
            href="/login"
            variant="contained"
            size="large"
            sx={{
              borderRadius: 999,
              px: 4,
              py: 1.5,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              '&:hover': { background: 'linear-gradient(135deg, #2563eb, #1e40af)' },
            }}
          >
            Get Started
          </Button>
        </Paper>
      </Section>

      <style jsx global>{`
        @keyframes logoBreath {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          25% { transform: scale(1.03) rotate(-0.5deg); }
          50% { transform: scale(1.06) rotate(0deg); opacity: 0.95; }
          75% { transform: scale(1.03) rotate(0.5deg); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .reveal {
          opacity: 0;
          transform: translateY(40px) scale(0.95);
          transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .reveal.in-view {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .reveal:nth-child(1) { transition-delay: 0s; }
        .reveal:nth-child(2) { transition-delay: 0.1s; }
        .reveal:nth-child(3) { transition-delay: 0.2s; }
        .reveal:nth-child(4) { transition-delay: 0.3s; }
        .hero-logo {
          animation: logoBreath 4s ease-in-out infinite;
        }
        .hero-logo:hover {
          animation: logoPulse 0.6s ease-in-out;
        }
      `}</style>
    </Box>
  );
}

// Reusable section wrapper
function Section({ children, className, maxWidth = '1200px' }) {
  return (
    <Box
      component="section"
      className={className}
      sx={{
        maxWidth,
        mx: 'auto',
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 6 },
      }}
    >
      {children}
    </Box>
  );
}
