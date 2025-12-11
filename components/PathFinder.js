// components/PathFinder.js
// Path finding between nodes in the graph
import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Slider,
  Collapse,
} from '@mui/material';
import RouteIcon from '@mui/icons-material/Route';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function PathFinder({
  cy,
  nodes = [],
  visible = false,
  onClose,
  onPathFound
}) {
  const [sourceNode, setSourceNode] = useState(null);
  const [targetNode, setTargetNode] = useState(null);
  const [maxHops, setMaxHops] = useState(5);
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [algorithm, setAlgorithm] = useState('shortest');

  // Node options for autocomplete
  const nodeOptions = nodes.map(n => ({
    id: n.id,
    label: n.name || n.label || n.id,
    type: n.typeName || n.type || '',
    color: n.color || n.typeColor || '#6366f1',
  }));

  // Swap source and target
  const handleSwap = useCallback(() => {
    const temp = sourceNode;
    setSourceNode(targetNode);
    setTargetNode(temp);
  }, [sourceNode, targetNode]);

  // Find paths using BFS
  const findPaths = useCallback(async () => {
    if (!cy || !sourceNode || !targetNode) return;

    setIsSearching(true);
    setPaths([]);
    setSelectedPath(null);

    try {
      const source = cy.$id(sourceNode.id);
      const target = cy.$id(targetNode.id);

      if (source.empty() || target.empty()) {
        console.error('Source or target node not found in graph');
        return;
      }

      let foundPaths = [];

      if (algorithm === 'shortest') {
        // Use Dijkstra for shortest path
        const dijkstra = cy.elements().dijkstra({
          root: source,
          weight: () => 1,
          directed: false,
        });

        const pathToTarget = dijkstra.pathTo(target);
        if (pathToTarget.length > 0) {
          foundPaths.push({
            id: 'shortest',
            nodes: pathToTarget.nodes().map(n => ({
              id: n.id(),
              label: n.data('label') || n.id(),
              color: n.data('color'),
            })),
            edges: pathToTarget.edges().map(e => ({
              id: e.id(),
              label: e.data('label'),
              source: e.source().id(),
              target: e.target().id(),
            })),
            length: pathToTarget.nodes().length - 1,
          });
        }
      } else {
        // Find all paths up to maxHops using BFS
        const allPaths = findAllPaths(cy, sourceNode.id, targetNode.id, maxHops);
        foundPaths = allPaths.map((path, idx) => ({
          id: `path-${idx}`,
          nodes: path.nodes,
          edges: path.edges,
          length: path.nodes.length - 1,
        }));
      }

      setPaths(foundPaths);

      // Highlight the first path if found
      if (foundPaths.length > 0) {
        setSelectedPath(foundPaths[0]);
        highlightPath(cy, foundPaths[0]);
        if (onPathFound) onPathFound(foundPaths);
      }
    } catch (error) {
      console.error('Error finding paths:', error);
    } finally {
      setIsSearching(false);
    }
  }, [cy, sourceNode, targetNode, maxHops, algorithm, onPathFound]);

  // Find all paths using DFS with max depth
  function findAllPaths(cy, sourceId, targetId, maxDepth) {
    const paths = [];
    const visited = new Set();

    function dfs(currentId, path, edgePath, depth) {
      if (depth > maxDepth) return;
      if (currentId === targetId) {
        paths.push({
          nodes: [...path],
          edges: [...edgePath],
        });
        return;
      }

      visited.add(currentId);
      const current = cy.$id(currentId);
      const neighbors = current.neighborhood('node');

      neighbors.forEach(neighbor => {
        const neighborId = neighbor.id();
        if (!visited.has(neighborId)) {
          const edge = current.edgesWith(neighbor).first();
          const nodeInfo = {
            id: neighborId,
            label: neighbor.data('label') || neighborId,
            color: neighbor.data('color'),
          };
          const edgeInfo = edge ? {
            id: edge.id(),
            label: edge.data('label'),
            source: edge.source().id(),
            target: edge.target().id(),
          } : null;

          dfs(
            neighborId,
            [...path, nodeInfo],
            edgeInfo ? [...edgePath, edgeInfo] : edgePath,
            depth + 1
          );
        }
      });

      visited.delete(currentId);
    }

    const startNode = cy.$id(sourceId);
    const startInfo = {
      id: sourceId,
      label: startNode.data('label') || sourceId,
      color: startNode.data('color'),
    };
    dfs(sourceId, [startInfo], [], 0);

    // Sort by path length
    return paths.sort((a, b) => a.nodes.length - b.nodes.length).slice(0, 10);
  }

  // Highlight a path in the graph
  function highlightPath(cy, path) {
    // Clear previous highlighting
    cy.elements().removeClass('path-highlight path-node path-edge dimmed');

    if (!path) return;

    // Dim all elements
    cy.elements().addClass('dimmed');

    // Highlight path nodes
    path.nodes.forEach(node => {
      const ele = cy.$id(node.id);
      if (ele.nonempty()) {
        ele.removeClass('dimmed').addClass('path-highlight path-node');
      }
    });

    // Highlight path edges
    path.edges.forEach(edge => {
      const ele = cy.$id(edge.id);
      if (ele.nonempty()) {
        ele.removeClass('dimmed').addClass('path-highlight path-edge');
      }
    });
  }

  // Clear path highlighting
  const clearHighlight = useCallback(() => {
    if (cy) {
      cy.elements().removeClass('path-highlight path-node path-edge dimmed');
    }
    setSelectedPath(null);
  }, [cy]);

  // Handle close
  const handleClose = useCallback(() => {
    clearHighlight();
    setPaths([]);
    setSourceNode(null);
    setTargetNode(null);
    if (onClose) onClose();
  }, [clearHighlight, onClose]);

  // Select a path
  const handleSelectPath = useCallback((path) => {
    setSelectedPath(path);
    highlightPath(cy, path);
  }, [cy]);

  // Clear all when nodes change
  useEffect(() => {
    clearHighlight();
    setPaths([]);
  }, [sourceNode, targetNode, clearHighlight]);

  if (!visible) return null;

  return (
    <Paper
      className="path-finder-panel"
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 340,
        maxHeight: 'calc(100vh - 200px)',
        overflow: 'auto',
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
        <RouteIcon sx={{ color: 'var(--accent)', fontSize: 20 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
          Path Finder
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {/* Source Node */}
        <Autocomplete
          size="small"
          options={nodeOptions}
          value={sourceNode}
          onChange={(_, val) => setSourceNode(val)}
          getOptionLabel={opt => opt?.label || ''}
          isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: option.color }} />
              <span>{option.label}</span>
              {option.type && (
                <Typography variant="caption" color="text.secondary">({option.type})</Typography>
              )}
            </Box>
          )}
          renderInput={(params) => (
            <TextField {...params} label="From node" placeholder="Select source..." />
          )}
          sx={{ mb: 1 }}
        />

        {/* Swap button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }}>
          <Tooltip title="Swap source and target">
            <IconButton size="small" onClick={handleSwap} disabled={!sourceNode && !targetNode}>
              <SwapHorizIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Target Node */}
        <Autocomplete
          size="small"
          options={nodeOptions.filter(n => n.id !== sourceNode?.id)}
          value={targetNode}
          onChange={(_, val) => setTargetNode(val)}
          getOptionLabel={opt => opt?.label || ''}
          isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
          renderOption={(props, option) => (
            <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: option.color }} />
              <span>{option.label}</span>
              {option.type && (
                <Typography variant="caption" color="text.secondary">({option.type})</Typography>
              )}
            </Box>
          )}
          renderInput={(params) => (
            <TextField {...params} label="To node" placeholder="Select target..." />
          )}
          sx={{ mb: 2 }}
        />

        {/* Advanced options */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 1 }}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--text-muted)' }}>
            Advanced Options
          </Typography>
          {showAdvanced ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </Box>
        <Collapse in={showAdvanced}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" gutterBottom>Max hops: {maxHops}</Typography>
            <Slider
              value={maxHops}
              onChange={(_, val) => setMaxHops(val)}
              min={1}
              max={10}
              step={1}
              marks
              size="small"
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                label="Shortest"
                size="small"
                variant={algorithm === 'shortest' ? 'filled' : 'outlined'}
                onClick={() => setAlgorithm('shortest')}
                color={algorithm === 'shortest' ? 'primary' : 'default'}
              />
              <Chip
                label="All paths"
                size="small"
                variant={algorithm === 'all' ? 'filled' : 'outlined'}
                onClick={() => setAlgorithm('all')}
                color={algorithm === 'all' ? 'primary' : 'default'}
              />
            </Stack>
          </Box>
        </Collapse>

        {/* Find button */}
        <Button
          variant="contained"
          fullWidth
          onClick={findPaths}
          disabled={!sourceNode || !targetNode || isSearching}
          startIcon={<RouteIcon />}
        >
          {isSearching ? 'Searching...' : 'Find Path'}
        </Button>

        {/* Results */}
        {paths.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'var(--text-muted)' }}>
              {paths.length} path{paths.length > 1 ? 's' : ''} found
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {paths.map((path, idx) => (
                <Paper
                  key={path.id}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    border: selectedPath?.id === path.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 1,
                    '&:hover': { borderColor: 'var(--accent)' },
                  }}
                  onClick={() => handleSelectPath(path)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Path {idx + 1}
                    </Typography>
                    <Chip label={`${path.length} hop${path.length > 1 ? 's' : ''}`} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    {path.nodes.map((node, i) => (
                      <Box key={node.id} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={node.label}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 10,
                            bgcolor: node.color,
                            color: 'white',
                          }}
                        />
                        {i < path.nodes.length - 1 && (
                          <Typography variant="caption" sx={{ mx: 0.5, color: 'var(--text-muted)' }}>→</Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        {paths.length === 0 && sourceNode && targetNode && !isSearching && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            No paths found between these nodes
          </Typography>
        )}

        {/* Clear button */}
        {(paths.length > 0 || selectedPath) && (
          <Button
            variant="outlined"
            fullWidth
            onClick={clearHighlight}
            sx={{ mt: 1 }}
          >
            Clear Highlighting
          </Button>
        )}
      </Box>
    </Paper>
  );
}
