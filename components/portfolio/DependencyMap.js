// components/portfolio/DependencyMap.js
// Dependency Map - Visual graph showing initiative dependencies
// Using Cytoscape for consistent in-house visualization

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { usePortfolio } from './PortfolioContext';
import { ViewHeader, ContentArea, Button } from '../ui';

// MUI Icons
import HubIcon from '@mui/icons-material/Hub';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';

import {
  INVESTMENT_HORIZONS,
  PORTFOLIO_STAGES,
} from '../../lib/portfolio-types';

// Edge colors based on dependency status
const EDGE_COLORS = {
  resolved: '#10b981',
  being_addressed: '#f59e0b',
  identified: '#3b82f6',
  accepted: '#6b7280',
};

// Cytoscape stylesheet
const cytoscapeStylesheet = [
  // Initiative nodes
  {
    selector: 'node[type="initiative"]',
    style: {
      'background-color': '#ffffff',
      'border-width': 3,
      'border-color': 'data(horizonColor)',
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': '11px',
      'font-weight': '600',
      'text-wrap': 'wrap',
      'text-max-width': '120px',
      'width': 140,
      'height': 60,
      'shape': 'round-rectangle',
      'padding': '10px',
      'color': '#1e293b',
    },
  },
  // External dependency nodes
  {
    selector: 'node[type="external"]',
    style: {
      'background-color': '#f1f5f9',
      'border-width': 2,
      'border-color': '#64748b',
      'border-style': 'dashed',
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': '10px',
      'text-wrap': 'wrap',
      'text-max-width': '100px',
      'width': 120,
      'height': 50,
      'shape': 'round-rectangle',
      'color': '#64748b',
    },
  },
  // Selected state
  {
    selector: 'node:selected',
    style: {
      'border-color': '#3b82f6',
      'border-width': 4,
      'box-shadow': '0 0 0 4px rgba(59, 130, 246, 0.3)',
    },
  },
  // Edges
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': 'data(edgeColor)',
      'target-arrow-color': 'data(edgeColor)',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'arrow-scale': 1.2,
    },
  },
  // Blocking edges
  {
    selector: 'edge[severity="blocking"]',
    style: {
      'width': 3,
      'line-style': 'solid',
      'label': 'blocking',
      'font-size': '9px',
      'text-background-color': '#ffffff',
      'text-background-opacity': 0.9,
      'text-background-padding': '2px',
      'color': '#ef4444',
    },
  },
  // Non-blocking edges
  {
    selector: 'edge[severity="medium"], edge[severity="low"]',
    style: {
      'line-style': 'dashed',
    },
  },
  // Resolved edges
  {
    selector: 'edge[status="resolved"]',
    style: {
      'opacity': 0.5,
    },
  },
];

// Layout options
const LAYOUTS = {
  cose: {
    name: 'cose',
    animate: true,
    animationDuration: 500,
    nodeRepulsion: 8000,
    idealEdgeLength: 150,
    padding: 50,
  },
  breadthfirst: {
    name: 'breadthfirst',
    directed: true,
    padding: 50,
    spacingFactor: 1.5,
    animate: true,
    animationDuration: 500,
  },
  circle: {
    name: 'circle',
    padding: 50,
    animate: true,
    animationDuration: 500,
  },
  grid: {
    name: 'grid',
    padding: 50,
    animate: true,
    animationDuration: 500,
    avoidOverlap: true,
  },
};

export default function DependencyMap({ onSelectItem }) {
  const {
    initiatives,
    dependencies,
    updateArtefact,
  } = usePortfolio();

  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const layoutRef = useRef(null); // Track current running layout
  const mountedRef = useRef(true); // Track mount state
  const [layoutName, setLayoutName] = useState('cose');
  const [selectedNode, setSelectedNode] = useState(null);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      // Stop any running layout first
      if (layoutRef.current) {
        try {
          layoutRef.current.stop();
        } catch (e) {
          // Layout may already be stopped
        }
        layoutRef.current = null;
      }
      // Remove event listeners and destroy cytoscape instance
      if (cyRef.current) {
        try {
          // Remove all event listeners before destroy
          cyRef.current.removeAllListeners();
          cyRef.current.destroy();
        } catch (e) {
          // Instance may already be destroyed
        }
        cyRef.current = null;
      }
    };
  }, []);

  // Count blocking dependencies per initiative
  const blockingCounts = useMemo(() => {
    const counts = {};
    dependencies.forEach(dep => {
      const toId = dep.custom_fields?.to_initiative;
      if (toId && dep.custom_fields?.severity === 'blocking' && dep.custom_fields?.status !== 'resolved') {
        counts[toId] = (counts[toId] || 0) + 1;
      }
    });
    return counts;
  }, [dependencies]);

  // Convert to Cytoscape elements
  const elements = useMemo(() => {
    const nodes = [];
    const edges = [];

    // Create nodes from initiatives
    initiatives.forEach(init => {
      const horizon = INVESTMENT_HORIZONS[init.custom_fields?.time_horizon];
      const stage = PORTFOLIO_STAGES[init.custom_fields?.stage];

      nodes.push({
        data: {
          id: init.id,
          label: init.name,
          type: 'initiative',
          horizonColor: horizon?.color || '#6b7280',
          stageColor: stage?.color || '#6b7280',
          stageName: stage?.name || 'Unknown',
          horizonName: horizon?.shortName || 'H?',
          blockingCount: blockingCounts[init.id] || 0,
          initiative: init,
        },
        position: init.custom_fields?.graph_position || undefined,
      });
    });

    // Create edges from internal dependencies
    dependencies
      .filter(dep => dep.custom_fields?.from_initiative && dep.custom_fields?.to_initiative)
      .forEach(dep => {
        const status = dep.custom_fields?.status || 'identified';
        const severity = dep.custom_fields?.severity || 'medium';

        edges.push({
          data: {
            id: `edge-${dep.id}`,
            source: dep.custom_fields.from_initiative,
            target: dep.custom_fields.to_initiative,
            edgeColor: EDGE_COLORS[status] || EDGE_COLORS.identified,
            status,
            severity,
            dependency: dep,
          },
        });
      });

    // Add external dependency nodes
    const externalDeps = dependencies.filter(
      dep => dep.custom_fields?.dependency_type === 'external' && !dep.custom_fields?.to_initiative
    );

    externalDeps.forEach(dep => {
      nodes.push({
        data: {
          id: `ext-${dep.id}`,
          label: dep.name,
          type: 'external',
          dependency: dep,
        },
        position: dep.custom_fields?.graph_position || undefined,
      });

      // Edge from external to initiative
      if (dep.custom_fields?.from_initiative) {
        const status = dep.custom_fields?.status || 'identified';
        const severity = dep.custom_fields?.severity || 'medium';

        edges.push({
          data: {
            id: `ext-edge-${dep.id}`,
            source: `ext-${dep.id}`,
            target: dep.custom_fields.from_initiative,
            edgeColor: EDGE_COLORS[status] || EDGE_COLORS.identified,
            status,
            severity,
            dependency: dep,
          },
        });
      }
    });

    return [...nodes, ...edges];
  }, [initiatives, dependencies, blockingCounts]);

  // Handle node selection
  const handleNodeClick = useCallback((nodeData) => {
    setSelectedNode(nodeData);
    if (nodeData.initiative) {
      onSelectItem?.(nodeData.initiative);
    } else if (nodeData.dependency) {
      onSelectItem?.(nodeData.dependency);
    }
  }, [onSelectItem]);

  // Save node positions on drag
  const handleNodeDragEnd = useCallback(async (nodeId, position) => {
    const cy = cyRef.current;
    if (!cy) return;

    const node = cy.getElementById(nodeId);
    const data = node.data();

    if (data.initiative) {
      await updateArtefact(data.initiative.id, {
        custom_fields: {
          ...data.initiative.custom_fields,
          graph_position: { x: position.x, y: position.y },
        },
      });
    } else if (data.dependency) {
      await updateArtefact(data.dependency.id, {
        custom_fields: {
          ...data.dependency.custom_fields,
          graph_position: { x: position.x, y: position.y },
        },
      });
    }
  }, [updateArtefact]);

  // Safe layout runner that tracks and cleans up
  const runLayout = useCallback((cy, layoutOptions) => {
    if (!cy || !mountedRef.current) return;

    // Verify cy is still valid
    try {
      if (cy.destroyed()) return;
    } catch (e) {
      return; // cy is invalid
    }

    // Stop any existing layout
    if (layoutRef.current) {
      try {
        layoutRef.current.stop();
      } catch (e) {
        // Layout may already be stopped
      }
      layoutRef.current = null;
    }

    // Create and run new layout with safety checks
    try {
      // Add stop callback to clear the ref
      const safeOptions = {
        ...layoutOptions,
        stop: () => {
          layoutRef.current = null;
        },
      };

      const layout = cy.layout(safeOptions);
      layoutRef.current = layout;
      layout.run();
    } catch (e) {
      // Cytoscape may be destroyed
      console.warn('Layout run failed:', e.message);
    }
  }, []);

  // Cytoscape ready handler
  const handleCyReady = useCallback((cy) => {
    if (!mountedRef.current) return;
    cyRef.current = cy;

    // Node click
    cy.on('tap', 'node', (evt) => {
      if (!mountedRef.current) return;
      const nodeData = evt.target.data();
      handleNodeClick(nodeData);
    });

    // Background click - deselect
    cy.on('tap', (evt) => {
      if (!mountedRef.current) return;
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    // Node drag end - save position
    cy.on('dragfree', 'node', (evt) => {
      if (!mountedRef.current) return;
      const node = evt.target;
      const pos = node.position();
      handleNodeDragEnd(node.id(), pos);
    });

    // Run initial layout
    runLayout(cy, LAYOUTS[layoutName]);
  }, [handleNodeClick, handleNodeDragEnd, layoutName, runLayout]);

  // Toolbar actions
  const handleZoomIn = useCallback(() => {
    const cy = cyRef.current;
    if (cy) cy.zoom(cy.zoom() * 1.2);
  }, []);

  const handleZoomOut = useCallback(() => {
    const cy = cyRef.current;
    if (cy) cy.zoom(cy.zoom() / 1.2);
  }, []);

  const handleFit = useCallback(() => {
    const cy = cyRef.current;
    if (cy) cy.fit(undefined, 50);
  }, []);

  const handleAutoLayout = useCallback(() => {
    const cy = cyRef.current;
    if (cy) runLayout(cy, LAYOUTS[layoutName]);
  }, [layoutName, runLayout]);

  // Statistics
  const stats = useMemo(() => {
    const total = dependencies.length;
    const blocking = dependencies.filter(d => d.custom_fields?.severity === 'blocking').length;
    const resolved = dependencies.filter(d => d.custom_fields?.status === 'resolved').length;
    return { total, blocking, resolved };
  }, [dependencies]);

  return (
    <>
      <ViewHeader
        icon={HubIcon}
        iconColor="#3b82f6"
        title="Dependency Map"
        description="Visualize how initiatives connect and depend on each other"
        count={initiatives.length}
      />
      <ContentArea noPadding>
        {/* Toolbar */}
        <div className="depmap-toolbar">
          <div className="depmap-toolbar__left">
            <div className="depmap-toolbar__stats">
              <span className="depmap-stat">
                <RocketLaunchIcon fontSize="small" style={{ color: '#3b82f6' }} />
                {initiatives.length} initiatives
              </span>
              <span className="depmap-stat">
                <LinkIcon fontSize="small" style={{ color: '#64748b' }} />
                {stats.total} dependencies
              </span>
              {stats.blocking > 0 && (
                <span className="depmap-stat depmap-stat--blocking">
                  <BlockIcon fontSize="small" style={{ color: '#ef4444' }} />
                  {stats.blocking} blocking
                </span>
              )}
              {stats.resolved > 0 && (
                <span className="depmap-stat depmap-stat--resolved">
                  <CheckCircleIcon fontSize="small" style={{ color: '#10b981' }} />
                  {stats.resolved} resolved
                </span>
              )}
            </div>
          </div>
          <div className="depmap-toolbar__right">
            <select
              value={layoutName}
              onChange={(e) => {
                setLayoutName(e.target.value);
                const cy = cyRef.current;
                if (cy) runLayout(cy, LAYOUTS[e.target.value]);
              }}
              className="depmap-toolbar__select"
            >
              <option value="cose">Force-directed</option>
              <option value="breadthfirst">Hierarchical</option>
              <option value="circle">Circle</option>
              <option value="grid">Grid</option>
            </select>
            <button className="depmap-toolbar__btn" onClick={handleAutoLayout} title="Re-layout">
              <AutoFixHighIcon fontSize="small" />
            </button>
            <div className="depmap-toolbar__divider" />
            <button className="depmap-toolbar__btn" onClick={handleZoomOut} title="Zoom out">
              <ZoomOutIcon fontSize="small" />
            </button>
            <button className="depmap-toolbar__btn" onClick={handleZoomIn} title="Zoom in">
              <ZoomInIcon fontSize="small" />
            </button>
            <button className="depmap-toolbar__btn" onClick={handleFit} title="Fit to view">
              <CenterFocusStrongIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="depmap-legend">
          <span className="depmap-legend__title">Legend:</span>
          <div className="depmap-legend__item">
            <div className="depmap-legend__line" style={{ background: EDGE_COLORS.resolved }} />
            <span>Resolved</span>
          </div>
          <div className="depmap-legend__item">
            <div className="depmap-legend__line" style={{ background: EDGE_COLORS.being_addressed }} />
            <span>In Progress</span>
          </div>
          <div className="depmap-legend__item">
            <div className="depmap-legend__line" style={{ background: EDGE_COLORS.identified }} />
            <span>Identified</span>
          </div>
          <div className="depmap-legend__item">
            <div className="depmap-legend__line depmap-legend__line--dashed" />
            <span>Low/Med Priority</span>
          </div>
        </div>

        {/* Cytoscape Canvas */}
        <div className="depmap-canvas" ref={containerRef}>
          {initiatives.length === 0 ? (
            <div className="depmap-empty">
              <RocketLaunchIcon style={{ fontSize: 48, color: '#6b7280', marginBottom: 16 }} />
              <h3>No Initiatives Yet</h3>
              <p>Create initiatives first to start mapping dependencies.</p>
            </div>
          ) : (
            <CytoscapeComponent
              elements={elements}
              stylesheet={cytoscapeStylesheet}
              cy={handleCyReady}
              style={{ width: '100%', height: '100%' }}
              wheelSensitivity={0.3}
              boxSelectionEnabled={false}
              autounselectify={false}
            />
          )}
        </div>
      </ContentArea>

      <style jsx>{`
        .depmap-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--panel);
          border-bottom: 1px solid var(--border);
        }

        .depmap-toolbar__left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .depmap-toolbar__stats {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .depmap-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .depmap-stat--blocking {
          color: #ef4444;
        }

        .depmap-stat--resolved {
          color: #10b981;
        }

        .depmap-toolbar__right {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .depmap-toolbar__select {
          padding: 6px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--panel);
          color: var(--text);
          font-size: 0.8125rem;
          cursor: pointer;
          margin-right: 8px;
        }

        .depmap-toolbar__btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .depmap-toolbar__btn:hover {
          background: var(--bg);
          color: var(--text);
        }

        .depmap-toolbar__divider {
          width: 1px;
          height: 20px;
          background: var(--border);
          margin: 0 8px;
        }

        .depmap-legend {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 16px;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          font-size: 0.75rem;
        }

        .depmap-legend__title {
          color: var(--text-muted);
          font-weight: 500;
        }

        .depmap-legend__item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
        }

        .depmap-legend__line {
          width: 24px;
          height: 3px;
          border-radius: 2px;
        }

        .depmap-legend__line--dashed {
          background: repeating-linear-gradient(
            90deg,
            #6b7280 0px,
            #6b7280 4px,
            transparent 4px,
            transparent 8px
          );
        }

        .depmap-canvas {
          flex: 1;
          min-height: 500px;
          height: calc(100vh - 280px);
          background: var(--bg);
          position: relative;
        }

        .depmap-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 400px;
          text-align: center;
          color: var(--text-muted);
        }

        .depmap-empty h3 {
          margin: 0 0 8px;
          color: var(--text);
        }

        .depmap-empty p {
          margin: 0;
        }
      `}</style>
    </>
  );
}
