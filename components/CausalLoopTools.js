// components/CausalLoopTools.js
// Causal Loop Diagram tools for Systems Thinking
import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
} from '@mui/material';
import LoopIcon from '@mui/icons-material/Loop';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BalanceIcon from '@mui/icons-material/Balance';
import CloseIcon from '@mui/icons-material/Close';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import TimelineIcon from '@mui/icons-material/Timeline';

// System Archetypes library
const systemArchetypes = [
  {
    id: 'limits-to-growth',
    name: 'Limits to Growth',
    description: 'A reinforcing process is set in motion to produce a desired result, but it creates secondary effects that eventually slow down the growth.',
    structure: {
      variables: ['Growing Action', 'Results', 'Limiting Condition', 'Slowing Action'],
      loops: [
        { type: 'R', variables: ['Growing Action', 'Results'], label: 'Growth Engine' },
        { type: 'B', variables: ['Results', 'Limiting Condition', 'Slowing Action', 'Results'], label: 'Limiting Process' },
      ],
    },
    leverage: 'Focus on removing or weakening the limiting condition rather than pushing harder on the growth engine.',
  },
  {
    id: 'shifting-the-burden',
    name: 'Shifting the Burden',
    description: 'A short-term solution is used to correct a problem, with immediate positive results. But over time, the side effects of the fix reduce the ability to apply fundamental solutions.',
    structure: {
      variables: ['Problem Symptom', 'Quick Fix', 'Side Effect', 'Fundamental Solution', 'Root Cause'],
      loops: [
        { type: 'B', variables: ['Problem Symptom', 'Quick Fix', 'Problem Symptom'], label: 'Symptomatic Solution' },
        { type: 'B', variables: ['Problem Symptom', 'Fundamental Solution', 'Root Cause', 'Problem Symptom'], label: 'Fundamental Solution' },
        { type: 'R', variables: ['Quick Fix', 'Side Effect', 'Fundamental Solution'], label: 'Addiction' },
      ],
    },
    leverage: 'Focus on strengthening the fundamental solution while using the symptomatic solution only for temporary relief.',
  },
  {
    id: 'fixes-that-fail',
    name: 'Fixes that Fail',
    description: 'A fix, effective in the short term, creates unintended long-term consequences that may require even more of the same fix.',
    structure: {
      variables: ['Problem', 'Fix', 'Unintended Consequences'],
      loops: [
        { type: 'B', variables: ['Problem', 'Fix', 'Problem'], label: 'Quick Fix' },
        { type: 'R', variables: ['Fix', 'Unintended Consequences', 'Problem'], label: 'Unintended Consequences' },
      ],
    },
    leverage: 'Maintain focus on the long-term consequences of the fix. Consider whether the cure is worse than the disease.',
  },
  {
    id: 'success-to-successful',
    name: 'Success to the Successful',
    description: 'Two activities compete for limited support or resources. The more successful one becomes, the more support it gains, starving the other.',
    structure: {
      variables: ['Activity A', 'Success A', 'Resources to A', 'Activity B', 'Success B', 'Resources to B'],
      loops: [
        { type: 'R', variables: ['Activity A', 'Success A', 'Resources to A', 'Activity A'], label: 'A Growth' },
        { type: 'R', variables: ['Activity B', 'Success B', 'Resources to B', 'Activity B'], label: 'B Decline' },
      ],
    },
    leverage: 'Decouple the competition or provide equitable support mechanisms.',
  },
  {
    id: 'tragedy-of-commons',
    name: 'Tragedy of the Commons',
    description: 'Individuals use a commonly available but limited resource solely on the basis of individual need. Eventually the resource is depleted.',
    structure: {
      variables: ['Individual Activity', 'Individual Gains', 'Total Activity', 'Resource Limit', 'Gain per Activity'],
      loops: [
        { type: 'R', variables: ['Individual Activity', 'Individual Gains', 'Individual Activity'], label: 'Individual Benefit' },
        { type: 'B', variables: ['Total Activity', 'Resource Limit', 'Gain per Activity', 'Individual Gains'], label: 'Resource Depletion' },
      ],
    },
    leverage: 'Create institutions or incentives that align individual and collective interests.',
  },
  {
    id: 'escalation',
    name: 'Escalation',
    description: 'Two parties perceive their well-being as depending on a relative advantage over the other. When one gets ahead, the other feels threatened and acts more aggressively to reestablish advantage.',
    structure: {
      variables: ['A\'s Action', 'B\'s Relative Position', 'B\'s Action', 'A\'s Relative Position'],
      loops: [
        { type: 'R', variables: ['A\'s Action', 'B\'s Relative Position', 'B\'s Action', 'A\'s Relative Position', 'A\'s Action'], label: 'Arms Race' },
      ],
    },
    leverage: 'Find a way for both sides to "win" or achieve their aims. De-escalate by unilateral action.',
  },
];

// Loop detection algorithm
function detectLoops(cy, maxLoopSize = 10) {
  const loops = [];
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(nodeId, path, edgePath) {
    if (recursionStack.has(nodeId)) {
      // Found a loop - extract it
      const loopStartIndex = path.indexOf(nodeId);
      if (loopStartIndex !== -1) {
        const loopNodes = path.slice(loopStartIndex);
        const loopEdges = edgePath.slice(loopStartIndex);

        // Calculate loop type (R = Reinforcing, B = Balancing)
        // Count negative edges - odd = Balancing, even = Reinforcing
        const negativeCount = loopEdges.filter(e => e.polarity === '-').length;
        const loopType = negativeCount % 2 === 0 ? 'R' : 'B';

        const loopId = loopNodes.sort().join('-');
        if (!loops.find(l => l.id === loopId)) {
          loops.push({
            id: loopId,
            type: loopType,
            nodes: loopNodes.map(id => {
              const node = cy.$id(id);
              return {
                id,
                label: node.data('label') || id,
                color: node.data('color'),
              };
            }),
            edges: loopEdges,
            size: loopNodes.length,
          });
        }
      }
      return;
    }

    if (path.length > maxLoopSize) return;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const node = cy.$id(nodeId);
    const outEdges = node.outgoers('edge');

    outEdges.forEach(edge => {
      const targetId = edge.target().id();
      const edgeInfo = {
        id: edge.id(),
        label: edge.data('label'),
        polarity: edge.data('polarity') || '+',
        source: nodeId,
        target: targetId,
      };
      dfs(targetId, [...path, nodeId], [...edgePath, edgeInfo]);
    });

    // Also check undirected connections
    const neighbors = node.neighborhood('node');
    neighbors.forEach(neighbor => {
      const neighborId = neighbor.id();
      if (!outEdges.targets().some(t => t.id() === neighborId)) {
        const edge = node.edgesWith(neighbor).first();
        if (edge) {
          const edgeInfo = {
            id: edge.id(),
            label: edge.data('label'),
            polarity: edge.data('polarity') || '+',
            source: nodeId,
            target: neighborId,
          };
          dfs(neighborId, [...path, nodeId], [...edgePath, edgeInfo]);
        }
      }
    });

    recursionStack.delete(nodeId);
  }

  // Start DFS from each node
  cy.nodes().forEach(node => {
    visited.clear();
    recursionStack.clear();
    dfs(node.id(), [], []);
  });

  // Sort by size and return unique loops
  return loops.sort((a, b) => a.size - b.size);
}

// Highlight a loop in the graph
function highlightLoop(cy, loop) {
  cy.elements().removeClass('loop-highlight loop-node loop-edge dimmed');

  if (!loop) return;

  cy.elements().addClass('dimmed');

  loop.nodes.forEach(node => {
    const ele = cy.$id(node.id);
    if (ele.nonempty()) {
      ele.removeClass('dimmed').addClass('loop-highlight loop-node');
    }
  });

  loop.edges.forEach(edge => {
    const ele = cy.$id(edge.id);
    if (ele.nonempty()) {
      ele.removeClass('dimmed').addClass('loop-highlight loop-edge');
    }
  });
}

export default function CausalLoopTools({
  cy,
  visible = false,
  onClose,
  onApplyArchetype,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [loops, setLoops] = useState([]);
  const [selectedLoop, setSelectedLoop] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState(null);

  // Detect feedback loops
  const handleDetectLoops = useCallback(() => {
    if (!cy) return;

    setIsDetecting(true);
    setLoops([]);
    setSelectedLoop(null);

    // Use setTimeout to not block UI
    setTimeout(() => {
      try {
        const detectedLoops = detectLoops(cy);
        setLoops(detectedLoops);
      } catch (error) {
        console.error('Error detecting loops:', error);
      } finally {
        setIsDetecting(false);
      }
    }, 100);
  }, [cy]);

  // Select and highlight a loop
  const handleSelectLoop = useCallback((loop) => {
    setSelectedLoop(loop);
    highlightLoop(cy, loop);
  }, [cy]);

  // Clear loop highlighting
  const handleClearHighlight = useCallback(() => {
    if (cy) {
      cy.elements().removeClass('loop-highlight loop-node loop-edge dimmed');
    }
    setSelectedLoop(null);
  }, [cy]);

  // Count loop types
  const loopCounts = useMemo(() => {
    const reinforcing = loops.filter(l => l.type === 'R').length;
    const balancing = loops.filter(l => l.type === 'B').length;
    return { reinforcing, balancing, total: loops.length };
  }, [loops]);

  // Close handler
  const handleClose = useCallback(() => {
    handleClearHighlight();
    if (onClose) onClose();
  }, [handleClearHighlight, onClose]);

  if (!visible) return null;

  return (
    <Paper
      className="causal-loop-tools"
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        width: 380,
        maxHeight: 'calc(100vh - 200px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 100,
      }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 2,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <LoopIcon sx={{ color: '#10b981', fontSize: 20 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
          Systems Thinking Tools
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{ borderBottom: '1px solid var(--border)', minHeight: 40 }}
      >
        <Tab
          icon={<AnalyticsIcon sx={{ fontSize: 16 }} />}
          label="Loops"
          sx={{ minHeight: 40, fontSize: 12 }}
        />
        <Tab
          icon={<LibraryBooksIcon sx={{ fontSize: 16 }} />}
          label="Archetypes"
          sx={{ minHeight: 40, fontSize: 12 }}
        />
        <Tab
          icon={<TimelineIcon sx={{ fontSize: 16 }} />}
          label="Polarity"
          sx={{ minHeight: 40, fontSize: 12 }}
        />
      </Tabs>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Loop Detection Tab */}
        {activeTab === 0 && (
          <>
            <Button
              variant="contained"
              fullWidth
              onClick={handleDetectLoops}
              disabled={isDetecting}
              startIcon={<AutorenewIcon />}
              sx={{ mb: 2 }}
            >
              {isDetecting ? 'Detecting...' : 'Detect Feedback Loops'}
            </Button>

            {loops.length > 0 && (
              <>
                {/* Loop summary */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<AutorenewIcon />}
                    label={`${loopCounts.reinforcing} Reinforcing`}
                    size="small"
                    sx={{ bgcolor: '#dcfce7', color: '#15803d' }}
                  />
                  <Chip
                    icon={<BalanceIcon />}
                    label={`${loopCounts.balancing} Balancing`}
                    size="small"
                    sx={{ bgcolor: '#dbeafe', color: '#1d4ed8' }}
                  />
                </Box>

                {/* Loop list */}
                <Stack spacing={1}>
                  {loops.map((loop, idx) => (
                    <Paper
                      key={loop.id}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        border: selectedLoop?.id === loop.id
                          ? `2px solid ${loop.type === 'R' ? '#10b981' : '#3b82f6'}`
                          : '1px solid var(--border)',
                        borderRadius: 1,
                        '&:hover': { borderColor: loop.type === 'R' ? '#10b981' : '#3b82f6' },
                      }}
                      onClick={() => handleSelectLoop(loop)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={loop.type === 'R' ? 'R' : 'B'}
                          size="small"
                          sx={{
                            width: 24,
                            height: 24,
                            fontWeight: 700,
                            bgcolor: loop.type === 'R' ? '#10b981' : '#3b82f6',
                            color: 'white',
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                          {loop.type === 'R' ? 'Reinforcing' : 'Balancing'} Loop {idx + 1}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {loop.size} nodes
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {loop.nodes.map((node, i) => (
                          <Box key={node.id} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip
                              label={node.label}
                              size="small"
                              sx={{ height: 20, fontSize: 10 }}
                            />
                            {i < loop.nodes.length - 1 && (
                              <Typography variant="caption" sx={{ mx: 0.5 }}>
                                {loop.edges[i]?.polarity === '-' ? '−' : '+'}→
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  ))}
                </Stack>

                {selectedLoop && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleClearHighlight}
                    sx={{ mt: 2 }}
                  >
                    Clear Highlighting
                  </Button>
                )}
              </>
            )}

            {loops.length === 0 && !isDetecting && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Click "Detect Feedback Loops" to analyze the graph for reinforcing and balancing loops.
              </Typography>
            )}
          </>
        )}

        {/* Archetypes Tab */}
        {activeTab === 1 && (
          <Stack spacing={1}>
            {systemArchetypes.map(archetype => (
              <Paper
                key={archetype.id}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: selectedArchetype?.id === archetype.id
                    ? '2px solid var(--accent)'
                    : '1px solid var(--border)',
                  borderRadius: 1,
                  '&:hover': { borderColor: 'var(--accent)' },
                }}
                onClick={() => setSelectedArchetype(
                  selectedArchetype?.id === archetype.id ? null : archetype
                )}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {archetype.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  {archetype.description}
                </Typography>

                {selectedArchetype?.id === archetype.id && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                      Structure:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {archetype.structure.loops.map((loop, i) => (
                        <Chip
                          key={i}
                          label={`${loop.type}: ${loop.label}`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 10,
                            bgcolor: loop.type === 'R' ? '#dcfce7' : '#dbeafe',
                            color: loop.type === 'R' ? '#15803d' : '#1d4ed8',
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                      Leverage Point:
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {archetype.leverage}
                    </Typography>
                    {onApplyArchetype && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onApplyArchetype(archetype)}
                        sx={{ mt: 1 }}
                      >
                        Apply to Graph
                      </Button>
                    )}
                  </>
                )}
              </Paper>
            ))}
          </Stack>
        )}

        {/* Polarity Tab */}
        {activeTab === 2 && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add polarity (+/-) to relationships to indicate causal direction:
            </Typography>
            <Stack spacing={2}>
              <Paper sx={{ p: 2, border: '1px solid var(--border)', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    icon={<AddIcon />}
                    label="Positive (+)"
                    size="small"
                    sx={{ bgcolor: '#dcfce7', color: '#15803d' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  When A increases, B increases (same direction). When A decreases, B decreases.
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, border: '1px solid var(--border)', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    icon={<RemoveIcon />}
                    label="Negative (−)"
                    size="small"
                    sx={{ bgcolor: '#fee2e2', color: '#dc2626' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  When A increases, B decreases (opposite direction). When A decreases, B increases.
                </Typography>
              </Paper>
              <Divider />
              <Typography variant="caption" color="text.secondary">
                <strong>Tip:</strong> To set polarity, edit a relationship and set its "polarity" attribute to "+" or "-".
                Loop type is determined by counting negative edges:
                <br />• Even negatives = <strong>Reinforcing (R)</strong>
                <br />• Odd negatives = <strong>Balancing (B)</strong>
              </Typography>
            </Stack>
          </>
        )}
      </Box>
    </Paper>
  );
}

export { detectLoops, highlightLoop, systemArchetypes };
