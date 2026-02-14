// components/sd/SDSubsystemHighlight.js
// EPIC 2.8 - Quick Subsystem Highlighting (Upstream/Downstream)
import { useState, useCallback, useMemo, useEffect } from 'react';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ClearIcon from '@mui/icons-material/Clear';

// Subsystem analysis utilities
export function analyzeSubsystem(elementId, elements, connections) {
  if (!elementId || !elements?.length) {
    return { upstream: [], downstream: [], paths: { upstream: [], downstream: [] } };
  }

  const adjacencyForward = new Map(); // source -> targets
  const adjacencyBackward = new Map(); // target -> sources

  connections.forEach(conn => {
    if (!adjacencyForward.has(conn.source)) {
      adjacencyForward.set(conn.source, []);
    }
    adjacencyForward.get(conn.source).push({
      nodeId: conn.target,
      connectionId: conn.id,
    });

    if (!adjacencyBackward.has(conn.target)) {
      adjacencyBackward.set(conn.target, []);
    }
    adjacencyBackward.get(conn.target).push({
      nodeId: conn.source,
      connectionId: conn.id,
    });
  });

  // Find all upstream nodes (predecessors)
  const upstream = new Set();
  const upstreamConnections = new Set();
  const upstreamPaths = [];

  function findUpstream(nodeId, currentPath = []) {
    const sources = adjacencyBackward.get(nodeId) || [];
    sources.forEach(({ nodeId: sourceId, connectionId }) => {
      if (!upstream.has(sourceId)) {
        upstream.add(sourceId);
        upstreamConnections.add(connectionId);

        const newPath = [...currentPath, { nodeId: sourceId, connectionId }];
        upstreamPaths.push(newPath);

        findUpstream(sourceId, newPath);
      }
    });
  }

  // Find all downstream nodes (successors)
  const downstream = new Set();
  const downstreamConnections = new Set();
  const downstreamPaths = [];

  function findDownstream(nodeId, currentPath = []) {
    const targets = adjacencyForward.get(nodeId) || [];
    targets.forEach(({ nodeId: targetId, connectionId }) => {
      if (!downstream.has(targetId)) {
        downstream.add(targetId);
        downstreamConnections.add(connectionId);

        const newPath = [...currentPath, { nodeId: targetId, connectionId }];
        downstreamPaths.push(newPath);

        findDownstream(targetId, newPath);
      }
    });
  }

  findUpstream(elementId);
  findDownstream(elementId);

  return {
    upstream: Array.from(upstream),
    downstream: Array.from(downstream),
    upstreamConnections: Array.from(upstreamConnections),
    downstreamConnections: Array.from(downstreamConnections),
    paths: {
      upstream: upstreamPaths,
      downstream: downstreamPaths,
    },
  };
}

// Hook for subsystem highlighting
export function useSubsystemHighlight(elements, connections, cyRef) {
  const [highlightEnabled, setHighlightEnabled] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showUpstream, setShowUpstream] = useState(true);
  const [showDownstream, setShowDownstream] = useState(true);

  // Compute subsystem data when selection changes
  const subsystemData = useMemo(() => {
    if (!highlightEnabled || !selectedNodeId) {
      return { upstream: [], downstream: [], upstreamConnections: [], downstreamConnections: [] };
    }
    return analyzeSubsystem(selectedNodeId, elements, connections);
  }, [highlightEnabled, selectedNodeId, elements, connections]);

  // Apply highlighting to Cytoscape
  const applyHighlighting = useCallback(() => {
    const cy = cyRef?.current;
    if (!cy) return;

    // Remove previous highlighting
    cy.elements().removeClass('upstream-node downstream-node upstream-edge downstream-edge dimmed-node dimmed-edge');

    if (!highlightEnabled || !selectedNodeId) return;

    // Dim all elements first
    cy.elements().addClass('dimmed-node');
    cy.edges().addClass('dimmed-edge');

    // Highlight the selected node
    const selectedNode = cy.getElementById(selectedNodeId);
    if (selectedNode) {
      selectedNode.removeClass('dimmed-node');
    }

    // Highlight upstream
    if (showUpstream) {
      subsystemData.upstream.forEach(nodeId => {
        cy.getElementById(nodeId).removeClass('dimmed-node').addClass('upstream-node');
      });
      subsystemData.upstreamConnections.forEach(edgeId => {
        cy.getElementById(edgeId).removeClass('dimmed-edge').addClass('upstream-edge');
      });
    }

    // Highlight downstream
    if (showDownstream) {
      subsystemData.downstream.forEach(nodeId => {
        cy.getElementById(nodeId).removeClass('dimmed-node').addClass('downstream-node');
      });
      subsystemData.downstreamConnections.forEach(edgeId => {
        cy.getElementById(edgeId).removeClass('dimmed-edge').addClass('downstream-edge');
      });
    }
  }, [cyRef, highlightEnabled, selectedNodeId, showUpstream, showDownstream, subsystemData]);

  // Clear all highlighting
  const clearHighlighting = useCallback(() => {
    const cy = cyRef?.current;
    if (cy) {
      cy.elements().removeClass('upstream-node downstream-node upstream-edge downstream-edge dimmed-node dimmed-edge');
    }
    setSelectedNodeId(null);
  }, [cyRef]);

  // Update highlighting when dependencies change
  useEffect(() => {
    applyHighlighting();
  }, [applyHighlighting]);

  // Clean up on unmount or when disabled
  useEffect(() => {
    if (!highlightEnabled) {
      clearHighlighting();
    }
    return () => {
      const cy = cyRef?.current;
      if (cy) {
        cy.elements().removeClass('upstream-node downstream-node upstream-edge downstream-edge dimmed-node dimmed-edge');
      }
    };
  }, [highlightEnabled, cyRef, clearHighlighting]);

  return {
    highlightEnabled,
    setHighlightEnabled,
    selectedNodeId,
    setSelectedNodeId,
    showUpstream,
    setShowUpstream,
    showDownstream,
    setShowDownstream,
    subsystemData,
    clearHighlighting,
    applyHighlighting,
  };
}

// Get additional Cytoscape styles for subsystem highlighting
export function getSubsystemStyles(themeDark = false) {
  return [
    {
      selector: 'node.upstream-node',
      style: {
        'border-color': '#3b82f6',
        'border-width': 3,
        'background-opacity': 1,
        'shadow-blur': 10,
        'shadow-color': '#3b82f6',
        'shadow-opacity': 0.4,
      },
    },
    {
      selector: 'node.downstream-node',
      style: {
        'border-color': '#10b981',
        'border-width': 3,
        'background-opacity': 1,
        'shadow-blur': 10,
        'shadow-color': '#10b981',
        'shadow-opacity': 0.4,
      },
    },
    {
      selector: 'edge.upstream-edge',
      style: {
        'line-color': '#3b82f6',
        'target-arrow-color': '#3b82f6',
        width: 3,
        opacity: 1,
      },
    },
    {
      selector: 'edge.downstream-edge',
      style: {
        'line-color': '#10b981',
        'target-arrow-color': '#10b981',
        width: 3,
        opacity: 1,
      },
    },
    {
      selector: 'node.dimmed-node',
      style: {
        opacity: 0.25,
      },
    },
    {
      selector: 'edge.dimmed-edge',
      style: {
        opacity: 0.15,
      },
    },
  ];
}

// Subsystem highlight control panel
export default function SDSubsystemHighlight({
  highlightEnabled,
  onToggleHighlight,
  showUpstream,
  onToggleUpstream,
  showDownstream,
  onToggleDownstream,
  subsystemData,
  selectedNodeLabel,
  onClear,
  collapsed = false,
  onToggleCollapse,
}) {
  const upstreamCount = subsystemData?.upstream?.length || 0;
  const downstreamCount = subsystemData?.downstream?.length || 0;

  return (
    <div className="sd-subsystem-highlight">
      <div className="highlight-header" onClick={onToggleCollapse}>
        <AccountTreeIcon fontSize="small" />
        <span className="highlight-title">Subsystem View</span>
        <label className="enable-toggle" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={highlightEnabled}
            onChange={e => onToggleHighlight?.(e.target.checked)}
          />
          <span className="toggle-label">Enable</span>
        </label>
      </div>

      {!collapsed && highlightEnabled && (
        <div className="highlight-content">
          {selectedNodeLabel ? (
            <>
              <div className="selected-node">
                <span className="label">Selected:</span>
                <span className="node-name">{selectedNodeLabel}</span>
                <button className="clear-btn" onClick={onClear} title="Clear selection">
                  <ClearIcon fontSize="small" />
                </button>
              </div>

              <div className="direction-toggles">
                <label className={`direction-toggle upstream ${showUpstream ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={showUpstream}
                    onChange={e => onToggleUpstream?.(e.target.checked)}
                  />
                  <ArrowUpwardIcon fontSize="small" />
                  <span>Upstream</span>
                  <span className="count">{upstreamCount}</span>
                </label>

                <label className={`direction-toggle downstream ${showDownstream ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={showDownstream}
                    onChange={e => onToggleDownstream?.(e.target.checked)}
                  />
                  <ArrowDownwardIcon fontSize="small" />
                  <span>Downstream</span>
                  <span className="count">{downstreamCount}</span>
                </label>
              </div>

              <div className="influence-summary">
                <div className="summary-row upstream">
                  <span className="direction-label">Influenced by:</span>
                  <span className="direction-count">{upstreamCount} variables</span>
                </div>
                <div className="summary-row downstream">
                  <span className="direction-label">Influences:</span>
                  <span className="direction-count">{downstreamCount} variables</span>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Click on a node to see its upstream and downstream connections</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .sd-subsystem-highlight {
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--panel);
          overflow: hidden;
        }

        .highlight-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg);
          cursor: pointer;
          user-select: none;
        }

        .highlight-title {
          flex: 1;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .enable-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        .enable-toggle input {
          width: 14px;
          height: 14px;
          accent-color: var(--accent);
        }

        .toggle-label {
          font-size: 11px;
          color: var(--text-muted);
        }

        .highlight-content {
          padding: 12px;
        }

        .selected-node {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          background: var(--bg);
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .selected-node .label {
          font-size: 11px;
          color: var(--text-muted);
        }

        .selected-node .node-name {
          flex: 1;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }

        .clear-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
        }

        .clear-btn:hover {
          background: var(--border);
          color: var(--text);
        }

        .direction-toggles {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .direction-toggle {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .direction-toggle input {
          display: none;
        }

        .direction-toggle.upstream.active {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .direction-toggle.downstream.active {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .direction-toggle span {
          font-size: 12px;
        }

        .direction-toggle .count {
          margin-left: auto;
          font-weight: 600;
          font-size: 11px;
          padding: 2px 6px;
          background: var(--bg);
          border-radius: 4px;
        }

        .influence-summary {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px;
          background: var(--bg);
          border-radius: 6px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .summary-row.upstream {
          color: #3b82f6;
        }

        .summary-row.downstream {
          color: #10b981;
        }

        .direction-label {
          color: var(--text-muted);
        }

        .direction-count {
          font-weight: 600;
        }

        .no-selection {
          text-align: center;
          padding: 20px 10px;
        }

        .no-selection p {
          font-size: 12px;
          color: var(--text-muted);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
