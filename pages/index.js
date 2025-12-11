import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import BrandPoster from '../components/BrandPoster';

// Demo data for the interactive graph
const demoNodes = [
  { id: 'customer', label: 'Customer', type: 'Entity', color: '#3b82f6' },
  { id: 'order', label: 'Order', type: 'Process', color: '#10b981' },
  { id: 'product', label: 'Product', type: 'Entity', color: '#8b5cf6' },
  { id: 'payment', label: 'Payment', type: 'Process', color: '#f59e0b' },
  { id: 'shipping', label: 'Shipping', type: 'Process', color: '#ec4899' },
  { id: 'inventory', label: 'Inventory', type: 'System', color: '#06b6d4' },
];

const demoEdges = [
  { source: 'customer', target: 'order', label: 'places' },
  { source: 'order', target: 'product', label: 'contains' },
  { source: 'order', target: 'payment', label: 'requires' },
  { source: 'order', target: 'shipping', label: 'triggers' },
  { source: 'product', target: 'inventory', label: 'tracked in' },
  { source: 'shipping', target: 'customer', label: 'delivered to' },
];

const outcomes = [
  { title: 'Shared language', text: 'Clear terms for concepts, rules, and processes.' },
  { title: 'Faster onboarding', text: 'Navigable context that shortens ramp-up time.' },
  { title: 'Lower risk', text: 'Reduce ambiguity, divergence, and rework.' },
  { title: 'Traceable decisions', text: 'Link choices back to the conceptual map.' },
];

const steps = [
  { title: 'Capture', text: 'Define core concepts, relationships, and attributes.' },
  { title: 'Navigate', text: 'Explore the graph visually, highlight neighbors.' },
  { title: 'Connect', text: 'Link documentation and rules to the model.' },
  { title: 'Govern', text: 'Adjust types and constraints as needs evolve.' },
];

export default function HomePage() {
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
      <Hero />

      {/* Interactive Demo Section */}
      <Box
        component="section"
        className="reveal"
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          px: { xs: 2, md: 4 },
          py: { xs: 4, md: 6 },
        }}
      >
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
            See How It Works
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)', maxWidth: 600, mx: 'auto' }}>
            Click on nodes to explore relationships. Drag to rearrange. This is what semantic modeling looks like.
          </Typography>
        </Box>

        <InteractiveDemo />
      </Box>

      {/* Steps Section */}
      <Box
        component="section"
        className="reveal"
        sx={{
          maxWidth: '1100px',
          mx: 'auto',
          px: { xs: 3, md: 6 },
          py: { xs: 5, md: 7 },
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
          How Ontographia Works
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
                }}
              >
                <Box sx={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][idx]}, ${['#1d4ed8', '#059669', '#7c3aed', '#d97706'][idx]})`,
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
      </Box>

      {/* Outcomes Section */}
      <Box
        component="section"
        className="reveal"
        sx={{
          maxWidth: '900px',
          mx: 'auto',
          px: { xs: 3, md: 6 },
          py: { xs: 5, md: 7 },
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, textAlign: 'center' }}>
          What You Get
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
      </Box>

      {/* CTA Section */}
      <Box
        component="section"
        className="reveal"
        sx={{
          maxWidth: '800px',
          mx: 'auto',
          px: { xs: 3, md: 6 },
          py: { xs: 5, md: 7 },
          textAlign: 'center',
        }}
      >
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, var(--panel), var(--bg))',
            border: '1px solid var(--border)',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Ready to map your knowledge?
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)', mb: 3 }}>
            Log in to explore the full studio with your own data.
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
            Log in to explore
          </Button>
        </Paper>
      </Box>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: translateY(40px) scale(0.9); }
          60% { transform: translateY(-8px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes logoBreath {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          25% { transform: scale(1.03) rotate(-0.5deg); }
          50% { transform: scale(1.06) rotate(0deg); opacity: 0.95; }
          75% { transform: scale(1.03) rotate(0.5deg); }
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

function Hero() {
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

function InteractiveDemo() {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [connectedNodes, setConnectedNodes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    import('cytoscape').then(({ default: cytoscape }) => {
      const cy = cytoscape({
        container: containerRef.current,
        elements: [
          ...demoNodes.map(n => ({
            data: { id: n.id, label: n.label, type: n.type, color: n.color },
          })),
          ...demoEdges.map((e, i) => ({
            data: { id: `e${i}`, source: e.source, target: e.target, label: e.label },
          })),
        ],
        style: [
          {
            selector: 'node',
            style: {
              'background-color': 'data(color)',
              label: 'data(label)',
              color: '#333',
              'text-valign': 'bottom',
              'text-margin-y': 8,
              'font-size': 12,
              'font-weight': 600,
              width: 50,
              height: 50,
              'border-width': 3,
              'border-color': '#fff',
              'text-outline-color': '#fff',
              'text-outline-width': 2,
            },
          },
          {
            selector: 'node:selected',
            style: {
              'border-width': 4,
              'border-color': '#1d4ed8',
              width: 60,
              height: 60,
            },
          },
          {
            selector: 'node.highlighted',
            style: {
              'border-width': 3,
              'border-color': '#f59e0b',
            },
          },
          {
            selector: 'node.dimmed',
            style: {
              opacity: 0.3,
            },
          },
          {
            selector: 'edge',
            style: {
              width: 2,
              'line-color': '#94a3b8',
              'target-arrow-color': '#94a3b8',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              label: 'data(label)',
              'font-size': 10,
              'text-rotation': 'autorotate',
              'text-margin-y': -10,
              color: '#64748b',
            },
          },
          {
            selector: 'edge.highlighted',
            style: {
              'line-color': '#f59e0b',
              'target-arrow-color': '#f59e0b',
              width: 3,
            },
          },
          {
            selector: 'edge.dimmed',
            style: {
              opacity: 0.2,
            },
          },
        ],
        layout: {
          name: 'cose',
          padding: 50,
          nodeRepulsion: 8000,
          idealEdgeLength: 100,
          animate: true,
        },
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
      });

      cy.on('tap', 'node', (evt) => {
        const node = evt.target;
        const nodeData = node.data();

        // Reset all
        cy.elements().removeClass('highlighted dimmed');

        // Get connected nodes
        const neighborhood = node.neighborhood();
        const connectedEdges = neighborhood.edges();
        const connectedNodesList = neighborhood.nodes().map(n => ({
          id: n.id(),
          label: n.data('label'),
          type: n.data('type'),
          color: n.data('color'),
          relationship: connectedEdges.filter(e =>
            e.source().id() === n.id() || e.target().id() === n.id()
          ).map(e => e.data('label'))[0] || '',
        }));

        // Highlight connected
        node.select();
        neighborhood.addClass('highlighted');
        cy.elements().not(neighborhood).not(node).addClass('dimmed');

        setSelectedNode({
          id: nodeData.id,
          label: nodeData.label,
          type: nodeData.type,
          color: nodeData.color,
        });
        setConnectedNodes(connectedNodesList);
      });

      cy.on('tap', (evt) => {
        if (evt.target === cy) {
          cy.elements().removeClass('highlighted dimmed selected');
          setSelectedNode(null);
          setConnectedNodes([]);
        }
      });

      cyRef.current = cy;
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, []);

  const handleReset = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.elements().removeClass('highlighted dimmed selected');
      cyRef.current.layout({ name: 'cose', padding: 50, nodeRepulsion: 8000, animate: true }).run();
      setSelectedNode(null);
      setConnectedNodes([]);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    }
  }, []);

  const handleFit = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.fit(50);
    }
  }, []);

  const handleAutoPlay = useCallback(() => {
    if (!cyRef.current || isPlaying) return;
    setIsPlaying(true);

    const nodes = cyRef.current.nodes();
    let index = 0;

    const interval = setInterval(() => {
      if (index >= nodes.length) {
        clearInterval(interval);
        setIsPlaying(false);
        cyRef.current.elements().removeClass('highlighted dimmed selected');
        setSelectedNode(null);
        setConnectedNodes([]);
        return;
      }

      nodes[index].emit('tap');
      index++;
    }, 1500);
  }, [isPlaying]);

  return (
    <Box id="demo" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
      {/* Graph Canvas */}
      <Paper
        sx={{
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          background: 'var(--panel)',
        }}
      >
        {/* Toolbar */}
        <Box sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
          display: 'flex',
          gap: 0.5,
          background: 'var(--bg)',
          borderRadius: 2,
          p: 0.5,
          border: '1px solid var(--border)',
        }}>
          <Tooltip title="Auto-play tour">
            <IconButton size="small" onClick={handleAutoPlay} disabled={isPlaying}>
              <PlayArrowIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset layout">
            <IconButton size="small" onClick={handleReset}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="Zoom in">
            <IconButton size="small" onClick={handleZoomIn}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom out">
            <IconButton size="small" onClick={handleZoomOut}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fit to view">
            <IconButton size="small" onClick={handleFit}>
              <FitScreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          ref={containerRef}
          sx={{
            width: '100%',
            height: { xs: 350, md: 450 },
          }}
        />

        {/* Hint */}
        <Box sx={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          right: 12,
          textAlign: 'center',
        }}>
          <Typography variant="caption" sx={{ color: 'var(--text-muted)', bgcolor: 'var(--bg)', px: 2, py: 0.5, borderRadius: 1 }}>
            Click a node to explore its relationships. Drag nodes to rearrange.
          </Typography>
        </Box>
      </Paper>

      {/* Node Explorer Panel */}
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: '1px solid var(--border)',
          background: 'var(--panel)',
          height: { xs: 'auto', md: 450 },
          overflow: 'auto',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Node Explorer
        </Typography>

        {selectedNode ? (
          <>
            {/* Selected Node */}
            <Box sx={{
              p: 2,
              borderRadius: 2,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              mb: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Box sx={{
                  width: 32, height: 32, borderRadius: '50%',
                  bgcolor: selectedNode.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: 14,
                }}>
                  {selectedNode.label[0]}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {selectedNode.label}
                  </Typography>
                  <Chip
                    label={selectedNode.type}
                    size="small"
                    sx={{ height: 18, fontSize: 10, bgcolor: selectedNode.color, color: 'white' }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Connected Nodes */}
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--text-muted)', display: 'block', mb: 1 }}>
              CONNECTED TO ({connectedNodes.length})
            </Typography>
            <Stack spacing={1}>
              {connectedNodes.map(node => (
                <Box
                  key={node.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{
                    width: 24, height: 24, borderRadius: '50%',
                    bgcolor: node.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 600, fontSize: 11,
                  }}>
                    {node.label[0]}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                      {node.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                      {node.relationship}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, color: 'var(--text-muted)' }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: '50%',
              border: '2px dashed var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2,
            }}>
              <Typography variant="h5">?</Typography>
            </Box>
            <Typography variant="body2">
              Click a node in the graph to see its details and connections
            </Typography>
          </Box>
        )}

        {/* Legend */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid var(--border)' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--text-muted)', display: 'block', mb: 1 }}>
            NODE TYPES
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {[...new Set(demoNodes.map(n => n.type))].map(type => {
              const node = demoNodes.find(n => n.type === type);
              return (
                <Chip
                  key={type}
                  label={type}
                  size="small"
                  sx={{ height: 22, fontSize: 11, bgcolor: node?.color, color: 'white' }}
                />
              );
            })}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
