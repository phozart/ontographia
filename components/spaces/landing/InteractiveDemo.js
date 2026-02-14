// components/landing/InteractiveDemo.js
// Interactive graph demo for landing page

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';

// Demo data
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

export default function InteractiveDemo() {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [connectedNodes, setConnectedNodes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cy = null;
    let mounted = true;

    import('cytoscape').then(({ default: cytoscape }) => {
      // Check if still mounted and container exists
      if (!mounted || !containerRef.current) return;

      cy = cytoscape({
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

        cy.elements().removeClass('highlighted dimmed');

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
      mounted = false;
      if (cy) {
        cy.destroy();
        cyRef.current = null;
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
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.2);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  }, []);

  const handleFit = useCallback(() => {
    if (cyRef.current) cyRef.current.fit(50);
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

        <Box ref={containerRef} sx={{ width: '100%', height: { xs: 350, md: 450 } }} />

        <Box sx={{ position: 'absolute', bottom: 12, left: 12, right: 12, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'var(--text-muted)', bgcolor: 'var(--bg)', px: 2, py: 0.5, borderRadius: 1 }}>
            Click a node to explore its relationships. Drag nodes to rearrange.
          </Typography>
        </Box>
      </Paper>

      {/* Node Explorer Panel */}
      <NodeExplorer
        selectedNode={selectedNode}
        connectedNodes={connectedNodes}
        demoNodes={demoNodes}
      />
    </Box>
  );
}

function NodeExplorer({ selectedNode, connectedNodes, demoNodes }) {
  return (
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
  );
}
