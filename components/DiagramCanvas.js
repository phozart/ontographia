// components/DiagramCanvas.js
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

import {
  flowchartNodeTypes,
  flowchartEdgeTypes,
  flowchartStylesheet,
  flowchartDefaultLayout,
} from './diagram-shapes/FlowchartShapes';
import {
  causalLoopNodeTypes,
  causalLoopEdgeTypes,
  causalLoopStylesheet,
  causalLoopLayout,
} from './diagram-shapes/CausalLoopShapes';
import {
  mindmapNodeTypes,
  mindmapEdgeTypes,
  mindmapStylesheet,
  mindmapLayout,
  getBranchColor,
} from './diagram-shapes/MindmapShapes';

const diagramConfigs = {
  flowchart: {
    nodeTypes: flowchartNodeTypes,
    edgeTypes: flowchartEdgeTypes,
    extraStyles: flowchartStylesheet,
    layout: flowchartDefaultLayout,
  },
  'causal-loop': {
    nodeTypes: causalLoopNodeTypes,
    edgeTypes: causalLoopEdgeTypes,
    extraStyles: causalLoopStylesheet,
    layout: causalLoopLayout,
  },
  mindmap: {
    nodeTypes: mindmapNodeTypes,
    edgeTypes: mindmapEdgeTypes,
    extraStyles: mindmapStylesheet,
    layout: mindmapLayout,
  },
};

export default function DiagramCanvas({
  diagram,
  diagramType = 'flowchart',
  editorMode = 'select',
  onDiagramChange,
  onNodeSelect,
  onEdgeSelect,
  connectionState = null,
  onCanvasClick,
  onNodeConnectionClick,
}) {
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const [themeDark, setThemeDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.dataset.theme === 'dark';
  });

  const config = diagramConfigs[diagramType] || diagramConfigs.flowchart;

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const target = document.documentElement;
    const observer = new MutationObserver(() => {
      setThemeDark(target.dataset.theme === 'dark');
    });
    observer.observe(target, { attributes: true, attributeFilter: ['data-theme'] });
    setThemeDark(target.dataset.theme === 'dark');
    return () => observer.disconnect();
  }, []);

  // Convert diagram data to Cytoscape elements
  const elements = useMemo(() => {
    if (!diagram) return [];

    const nodes = (diagram.nodes || []).map(n => ({
      data: {
        id: n.id,
        label: n.label,
        nodeType: n.nodeType || n.type,
        color: n.color,
        ...n.data,
      },
      position: n.x != null && n.y != null ? { x: n.x, y: n.y } : undefined,
      classes: n.nodeType ? [`node-${n.nodeType}`] : [],
    }));

    const edges = (diagram.edges || []).map(e => ({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label || '',
        edgeType: e.edgeType || e.type,
        ...e.data,
      },
      classes: e.edgeType ? [`edge-${e.edgeType}`] : [],
    }));

    return [...nodes, ...edges];
  }, [diagram]);

  // Build stylesheet
  const stylesheet = useMemo(() => {
    const baseStyles = [
      {
        selector: 'node',
        style: {
          'background-color': 'data(color)',
          label: 'data(label)',
          color: themeDark ? '#f8fafc' : '#0f172a',
          'font-size': 13,
          'text-valign': 'center',
          'text-halign': 'center',
          'text-wrap': 'wrap',
          'text-max-width': 80,
          width: 90,
          height: 60,
          padding: '6px',
          cursor: editorMode === 'draw-connection' ? 'pointer' : 'grab',
        },
      },
      {
        selector: 'node:selected',
        style: {
          'border-color': '#3b82f6',
          'border-width': 4,
          'border-style': 'solid',
        },
      },
      {
        selector: 'node.connection-source',
        style: {
          'border-color': '#3b82f6',
          'border-width': 4,
          'border-style': 'solid',
          'overlay-color': '#3b82f6',
          'overlay-opacity': 0.15,
        },
      },
      {
        selector: 'edge',
        style: {
          width: 2,
          'line-color': '#6b7280',
          'target-arrow-color': '#6b7280',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          label: 'data(label)',
          'font-size': 11,
          'text-rotation': 'autorotate',
          color: themeDark ? '#f8fafc' : '#111827',
          'text-background-color': themeDark ? '#1f2430' : '#ffffff',
          'text-background-opacity': 0.9,
          'text-background-padding': '2px',
        },
      },
      {
        selector: 'edge:selected',
        style: {
          'line-color': '#3b82f6',
          'target-arrow-color': '#3b82f6',
          width: 3,
        },
      },
    ];

    return [...baseStyles, ...(config.extraStyles || [])];
  }, [themeDark, editorMode, config]);

  // Handle Cytoscape ready
  const handleCyReady = useCallback((cy) => {
    cyRef.current = cy;
    cy.userPanningEnabled(true);
    cy.userZoomingEnabled(true);

    // Node click
    cy.on('tap', 'node', evt => {
      const data = evt.target.data();
      if (editorMode === 'draw-connection' && onNodeConnectionClick) {
        onNodeConnectionClick({ id: data.id, data });
      } else if (onNodeSelect) {
        onNodeSelect({ id: data.id, data });
      }
    });

    // Edge click
    cy.on('tap', 'edge', evt => {
      if (onEdgeSelect) {
        onEdgeSelect(evt.target.data());
      }
    });

    // Canvas click for node creation
    cy.on('tap', evt => {
      if (evt.target === cy) {
        if (editorMode === 'draw-node' && onCanvasClick) {
          const position = evt.position || evt.cyPosition;
          const containerRect = containerRef.current?.getBoundingClientRect();
          const pan = cy.pan();
          const zoom = cy.zoom();
          const screenX = (position.x * zoom + pan.x) + (containerRect?.left || 0);
          const screenY = (position.y * zoom + pan.y) + (containerRect?.top || 0);
          onCanvasClick({
            canvasPosition: position,
            screenPosition: { x: screenX, y: screenY },
          });
        }
      }
    });

    // Node drag end - update diagram
    cy.on('dragfree', 'node', evt => {
      if (editorMode === 'select' && onDiagramChange && diagram) {
        const nodeId = evt.target.id();
        const pos = evt.target.position();
        const updatedNodes = diagram.nodes.map(n =>
          n.id === nodeId ? { ...n, x: pos.x, y: pos.y } : n
        );
        onDiagramChange({ ...diagram, nodes: updatedNodes });
      }
    });
  }, [editorMode, onNodeSelect, onEdgeSelect, onCanvasClick, onNodeConnectionClick, onDiagramChange, diagram]);

  // Update connection source highlighting
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes().removeClass('connection-source');
    if (connectionState?.sourceId) {
      const sourceNode = cy.$id(String(connectionState.sourceId));
      if (sourceNode && sourceNode.nonempty()) {
        sourceNode.addClass('connection-source');
      }
    }
  }, [connectionState]);

  // Run layout when diagram changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || elements.length === 0) return;

    // Only run layout if nodes don't have positions
    const hasPositions = elements.some(el => el.position);
    if (!hasPositions) {
      const layout = cy.layout(config.layout);
      layout.run();
    }
  }, [elements, config]);

  // Update node grabbable state based on editor mode
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes().forEach(node => {
      if (editorMode === 'draw-connection') {
        node.grabify(false);
      } else {
        node.grabify(true);
      }
    });
  }, [editorMode, elements]);

  const getCursor = () => {
    switch (editorMode) {
      case 'draw-node': return 'crosshair';
      case 'draw-connection': return 'pointer';
      default: return 'default';
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', cursor: getCursor() }}
    >
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        style={{ width: '100%', height: '100%' }}
        minZoom={0.2}
        maxZoom={3}
        cy={handleCyReady}
        panningEnabled
        userPanningEnabled
        userZoomingEnabled
      />
    </div>
  );
}

// Export configs for external use
export { diagramConfigs };
