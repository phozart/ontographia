// pages/index.js
// Landing page with hero and interactive demo

import Link from 'next/link';
import { useEffect } from 'react';
import { Box, Button, Grid, Paper, Typography, Chip, Divider } from '@mui/material';
import { useAuth } from '../components/AuthContext';
import { Hero, InteractiveDemo } from '../components/landing';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LoopIcon from '@mui/icons-material/Loop';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HubIcon from '@mui/icons-material/Hub';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HandshakeIcon from '@mui/icons-material/Handshake';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import BlockIcon from '@mui/icons-material/Block';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Studios organized by purpose
const studioCategories = [
  {
    category: 'Enterprise & Architecture',
    description: 'Map your organization, capabilities, and technology landscape',
    studios: [
      {
        title: 'Enterprise Architecture',
        subtitle: 'Map capabilities, applications, and processes',
        href: '/ea-studio',
        icon: <ArchitectureIcon sx={{ fontSize: 28 }} />,
        color: '#475569',
      },
      {
        title: 'Knowledge Studio',
        subtitle: 'Navigate and manage your knowledge graph',
        href: '/knowledge-studio',
        icon: <HubIcon sx={{ fontSize: 28 }} />,
        color: '#64748b',
      },
      {
        title: 'System Dynamics',
        subtitle: 'Model feedback loops and system behavior',
        href: '/system-dynamics',
        icon: <LoopIcon sx={{ fontSize: 28 }} />,
        color: '#78716c',
      },
    ],
  },
  {
    category: 'Delivery & Requirements',
    description: 'From business needs to user stories with full traceability',
    studios: [
      {
        title: 'Requirements Studio',
        subtitle: 'Capture and trace requirements end-to-end',
        href: '/requirements-studio',
        icon: <AssignmentIcon sx={{ fontSize: 28 }} />,
        color: '#475569',
      },
      {
        title: 'Product Design',
        subtitle: 'Discovery before commitment - frame problems first',
        href: '/product-design-workspace',
        icon: <LightbulbIcon sx={{ fontSize: 28 }} />,
        color: '#64748b',
      },
      {
        title: 'Portfolio Studio',
        subtitle: 'Prioritize investments with visual tools',
        href: '/portfolio-studio',
        icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
        color: '#78716c',
      },
    ],
  },
  {
    category: 'Reasoning & Thinking',
    description: 'Structured approaches to complex problems and decisions',
    studios: [
      {
        title: 'Sensemaking Studio',
        subtitle: 'Mental models and structured analysis',
        href: '/sensemaking-studio',
        icon: <PsychologyIcon sx={{ fontSize: 28 }} />,
        color: '#475569',
      },
      {
        title: 'Negotiation Studio',
        subtitle: 'Prepare for negotiations systematically',
        href: '/negotiation-studio',
        icon: <HandshakeIcon sx={{ fontSize: 28 }} />,
        color: '#64748b',
      },
      {
        title: 'Philosophy Studio',
        subtitle: 'Examine arguments and assumptions',
        href: '/philosophy-studio',
        icon: <AutoStoriesIcon sx={{ fontSize: 28 }} />,
        color: '#78716c',
      },
    ],
  },
];

// The logical journey through Ontographia
const journeySteps = [
  {
    phase: '1. Understand',
    title: 'Map the landscape',
    description: 'Start with Enterprise Architecture to capture capabilities, applications, and how they connect. This becomes the foundation everything else references.',
    studios: ['Enterprise Architecture', 'Knowledge Studio'],
  },
  {
    phase: '2. Design',
    title: 'Frame the work',
    description: 'Use Product Design to explore ideas before committing. Surface assumptions, document learning, then move viable ideas to Requirements Studio.',
    studios: ['Product Design', 'Requirements Studio'],
  },
  {
    phase: '3. Prioritize',
    title: 'Decide what matters',
    description: 'Portfolio Studio helps you score initiatives, visualize trade-offs, and get committee alignment on what to invest in.',
    studios: ['Portfolio Studio'],
  },
  {
    phase: '4. Analyze',
    title: 'Think it through',
    description: 'For complex decisions, use System Dynamics for feedback loops, Sensemaking for structured analysis, or Philosophy Studio for rigorous argument examination.',
    studios: ['System Dynamics', 'Sensemaking', 'Philosophy Studio'],
  },
];

// What Ontographia is NOT
const notList = [
  { title: 'Not a document repository', text: 'Documents die in folders. We capture knowledge as connected, queryable concepts.' },
  { title: 'Not a project management tool', text: 'We complement Jira/Azure DevOps - we handle the "why" and "what", they handle the "when" and "who".' },
  { title: 'Not a diagramming tool', text: 'Diagrams are outputs, not the source. The graph is the truth; diagrams visualize it.' },
  { title: 'Not an AI replacement', text: 'We structure human knowledge. AI can help, but the thinking is yours.' },
];

// The story of what Ontographia does
const storyPoints = [
  {
    title: 'The Problem',
    subtitle: 'Knowledge fragmentation',
    text: 'Architecture decisions live in documents nobody reads. Requirements get lost between teams. Knowledge walks out the door when people leave.',
  },
  {
    title: 'The Solution',
    subtitle: 'Connected knowledge',
    text: 'Ontographia captures enterprise knowledge as linked concepts. Every capability, requirement, decision, and system is searchable and traceable.',
  },
  {
    title: 'The Outcome',
    subtitle: 'Organizational memory',
    text: 'New team members onboard faster. Impact analysis becomes instant. Your organization\'s knowledge becomes a permanent, evolving asset.',
  },
];

const outcomes = [
  { title: 'Shared language', text: 'Clear terms for concepts, rules, and processes across teams.' },
  { title: 'Faster onboarding', text: 'Navigable context that cuts ramp-up time from weeks to days.' },
  { title: 'Lower risk', text: 'Traceable requirements reduce ambiguity, divergence, and rework.' },
  { title: 'Living documentation', text: 'Your architecture evolves with your business, not in stale documents.' },
];

export default function LandingPage() {
  const { user } = useAuth();

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

  return (
    <Box sx={{ pb: 10 }}>
      <Hero user={user} />

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

      {/* All Studios by Category */}
      <Section className="reveal" maxWidth="1100px">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Chip
            label="9 Specialized Studios"
            sx={{ mb: 2, fontWeight: 600, bgcolor: 'var(--accent-soft)', color: 'var(--accent)' }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Purpose-Built Workspaces
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)', maxWidth: 700, mx: 'auto' }}>
            Each studio is designed for a specific type of thinking. Use them independently or together -
            they all connect through the same knowledge graph.
          </Typography>
        </Box>

        {studioCategories.map((cat, catIdx) => (
          <Box key={cat.category} sx={{ mb: catIdx < studioCategories.length - 1 ? 5 : 0 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text)' }}>
                {cat.category}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                {cat.description}
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {cat.studios.map((studio) => (
                <Grid item xs={12} sm={4} key={studio.title}>
                  <Paper
                    component={Link}
                    href={studio.href}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: '1px solid var(--border)',
                      background: 'var(--panel)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: studio.color,
                        transform: 'translateY(-2px)',
                        boxShadow: 'var(--shadow-sm)',
                      },
                    }}
                  >
                    <Box sx={{
                      width: 48, height: 48, borderRadius: 1.5, flexShrink: 0,
                      background: `${studio.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: studio.color,
                    }}>
                      {studio.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                        {studio.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                        {studio.subtitle}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Section>

      {/* The Journey - How to use it logically */}
      <Section className="reveal" maxWidth="900px">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Chip
            label="Recommended Journey"
            sx={{ mb: 2, fontWeight: 600, bgcolor: 'var(--accent-soft)', color: 'var(--accent)' }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            How Organizations Use It
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)', maxWidth: 600, mx: 'auto' }}>
            A logical progression from understanding to action. Start anywhere, but this sequence makes the most sense.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {journeySteps.map((step, idx) => (
            <Paper
              key={step.phase}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                display: 'flex',
                gap: 3,
                alignItems: 'flex-start',
              }}
            >
              <Box sx={{
                width: 60, flexShrink: 0, textAlign: 'center',
                pt: 0.5,
              }}>
                <Typography variant="overline" sx={{ color: 'var(--accent)', fontWeight: 700, display: 'block', lineHeight: 1 }}>
                  {step.phase.split('.')[0]}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                  {step.phase.split('. ')[1]}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: 'var(--text)' }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 1.5, lineHeight: 1.6 }}>
                  {step.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {step.studios.map((s) => (
                    <Chip key={s} label={s} size="small" sx={{ fontSize: 11, height: 24, bgcolor: 'var(--bg)', border: '1px solid var(--border)' }} />
                  ))}
                </Box>
              </Box>
              {idx < journeySteps.length - 1 && (
                <ArrowForwardIcon sx={{ color: 'var(--border)', alignSelf: 'center', display: { xs: 'none', md: 'block' } }} />
              )}
            </Paper>
          ))}
        </Box>
      </Section>

      {/* What We're NOT */}
      <Section className="reveal" maxWidth="900px">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Chip
            icon={<BlockIcon sx={{ fontSize: 16 }} />}
            label="Setting Expectations"
            sx={{ mb: 2, fontWeight: 600, bgcolor: 'var(--bg)', border: '1px solid var(--border)' }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            What Ontographia Is Not
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)', maxWidth: 600, mx: 'auto' }}>
            Clarity about what we don't do helps you understand what we do well.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {notList.map((item) => (
            <Grid item xs={12} sm={6} key={item.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid var(--border)',
                  background: 'var(--panel)',
                  height: '100%',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--text)', mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {item.text}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* Interactive Demo Section */}
      <Section className="reveal" id="demo">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Chip
            label="Try It Now"
            sx={{
              mb: 2,
              fontWeight: 600,
              background: 'var(--accent)',
              color: 'var(--accent-text)',
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
