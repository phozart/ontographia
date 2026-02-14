// components/ba/DiagramEditor.js
// Diagram editor component for BA Workspace
// Fixed: Uses refs for event handlers to prevent stale closure issues

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../../AuthContext';
import { useDomains } from '../../DomainContext';
import { useProjects } from '../../ProjectContext';

// Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import MouseIcon from '@mui/icons-material/Mouse';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const CytoscapeComponent = dynamic(() => import('react-cytoscapejs'), { ssr: false });

// ============ ELEMENT DEFINITIONS ============
const REQUIREMENTS_ELEMENTS = {
  businessReq: { id: 'businessReq', name: 'Business Req', shape: 'round-rectangle', color: '#f97316', icon: 'BR', category: 'requirements' },
  stakeholderReq: { id: 'stakeholderReq', name: 'Stakeholder Req', shape: 'round-rectangle', color: '#fb923c', icon: 'SR', category: 'requirements' },
  functionalReq: { id: 'functionalReq', name: 'Functional Req', shape: 'rectangle', color: '#22c55e', icon: 'FR', category: 'requirements' },
  nonFunctionalReq: { id: 'nonFunctionalReq', name: 'Non-Functional', shape: 'rectangle', color: '#4ade80', icon: 'NF', category: 'requirements' },
  assumption: { id: 'assumption', name: 'Assumption', shape: 'diamond', color: '#fcd34d', icon: 'AS', category: 'requirements' },
  constraint: { id: 'constraint', name: 'Constraint', shape: 'octagon', color: '#f87171', icon: 'CN', category: 'requirements' },
};

const USE_CASE_ELEMENTS = {
  actor: { id: 'actor', name: 'Actor', shape: 'ellipse', color: '#fbbf24', icon: 'A', category: 'usecase' },
  useCase: { id: 'useCase', name: 'Use Case', shape: 'ellipse', color: '#60a5fa', icon: 'UC', category: 'usecase' },
  systemBoundary: { id: 'systemBoundary', name: 'System', shape: 'rectangle', color: '#e2e8f0', icon: 'SB', category: 'usecase' },
};

const BPMN_ELEMENTS = {
  startEvent: { id: 'startEvent', name: 'Start', shape: 'ellipse', color: '#22c55e', icon: 'S', category: 'bpmn' },
  endEvent: { id: 'endEvent', name: 'End', shape: 'ellipse', color: '#ef4444', icon: 'E', category: 'bpmn' },
  task: { id: 'task', name: 'Task', shape: 'round-rectangle', color: '#60a5fa', icon: 'T', category: 'bpmn' },
  gateway: { id: 'gateway', name: 'Gateway', shape: 'diamond', color: '#fbbf24', icon: 'X', category: 'bpmn' },
};

const ALL_ELEMENTS = { ...REQUIREMENTS_ELEMENTS, ...USE_CASE_ELEMENTS, ...BPMN_ELEMENTS };

// ============ RELATIONSHIP TYPES ============
const RELATIONSHIP_TYPES = {
  association: { id: 'association', name: 'Association', style: 'solid', color: '#64748b', targetArrow: 'none', sourceArrow: 'none' },
  trace: { id: 'trace', name: 'Trace', style: 'dashed', color: '#f97316', targetArrow: 'triangle', sourceArrow: 'none', label: '<<trace>>' },
  dependency: { id: 'dependency', name: 'Dependency', style: 'dashed', color: '#64748b', targetArrow: 'triangle', sourceArrow: 'none' },
  include: { id: 'include', name: 'Include', style: 'dashed', color: '#3b82f6', targetArrow: 'triangle', sourceArrow: 'none', label: '<<include>>' },
  sequenceFlow: { id: 'sequenceFlow', name: 'Sequence', style: 'solid', color: '#1e293b', targetArrow: 'triangle', sourceArrow: 'none' },
};

// Helper functions
function darkenColor(hex) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - 40);
  const g = Math.max(0, ((num >> 8) & 0x00FF) - 40);
  const b = Math.max(0, (num & 0x0000FF) - 40);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

const getCytoscapeStylesheet = () => [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'background-color': 'data(color)',
      'border-width': 2,
      'border-color': 'data(borderColor)',
      'width': 'data(width)',
      'height': 'data(height)',
      'font-size': 11,
      'font-weight': 500,
      'color': '#1e293b',
      'text-wrap': 'wrap',
      'text-max-width': '120px',
      'shape': 'data(shape)',
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 3,
      'border-color': '#3b82f6',
    },
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': 'data(color)',
      'target-arrow-color': 'data(color)',
      'target-arrow-shape': 'data(targetArrow)',
      'source-arrow-shape': 'data(sourceArrow)',
      'curve-style': 'bezier',
      'line-style': 'data(lineStyle)',
      'label': 'data(label)',
      'font-size': 10,
      'text-rotation': 'autorotate',
      'text-margin-y': -10,
    },
  },
  {
    selector: 'edge:selected',
    style: {
      'width': 3,
      'line-color': '#3b82f6',
      'target-arrow-color': '#3b82f6',
    },
  },
];

export default function DiagramEditor() {
  const { user, role } = useAuth();
  const { activeDomain } = useDomains();
  const { activeProject } = useProjects();
  const cyRef = useRef(null);

  // State
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedTool, setSelectedTool] = useState('select'); // 'select', 'add', 'connect'
  const [selectedElementType, setSelectedElementType] = useState(null);
  const [selectedRelType, setSelectedRelType] = useState('association');
  const [connectionSource, setConnectionSource] = useState(null);
  const [activeCategory, setActiveCategory] = useState('requirements');

  // Diagram management
  const [diagrams, setDiagrams] = useState([]);
  const [currentDiagram, setCurrentDiagram] = useState(null);
  const [diagramName, setDiagramName] = useState('Untitled Diagram');
  const [showDiagramList, setShowDiagramList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Properties
  const [showProperties, setShowProperties] = useState(true);
  const [editLabel, setEditLabel] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Graph linking
  const [graphNodes, setGraphNodes] = useState([]);
  const [nodeTypes, setNodeTypes] = useState([]);
  const [showLinkBrowser, setShowLinkBrowser] = useState(false);

  // History
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // *** REFS for current state values - prevents stale closures ***
  const selectedToolRef = useRef(selectedTool);
  const selectedElementTypeRef = useRef(selectedElementType);
  const selectedRelTypeRef = useRef(selectedRelType);
  const connectionSourceRef = useRef(connectionSource);
  const elementsRef = useRef(elements);

  // Keep refs in sync with state
  useEffect(() => { selectedToolRef.current = selectedTool; }, [selectedTool]);
  useEffect(() => { selectedElementTypeRef.current = selectedElementType; }, [selectedElementType]);
  useEffect(() => { selectedRelTypeRef.current = selectedRelType; }, [selectedRelType]);
  useEffect(() => { connectionSourceRef.current = connectionSource; }, [connectionSource]);
  useEffect(() => { elementsRef.current = elements; }, [elements]);

  // Fetch diagrams
  useEffect(() => {
    if (user) fetchDiagrams();
  }, [user, activeDomain]);

  const fetchDiagrams = async () => {
    try {
      const params = new URLSearchParams({ type: 'requirements' });
      if (activeDomain) params.append('domain_id', activeDomain);
      const res = await fetch(`/api/diagrams?${params}`, {
        headers: { 'x-user': user, 'x-role': role },
      });
      if (res.ok) setDiagrams(await res.json());
    } catch (err) {
      console.error('Failed to fetch diagrams:', err);
    }
  };

  // Fetch graph nodes for linking
  useEffect(() => {
    async function loadGraphNodes() {
      try {
        const [nodesRes, typesRes] = await Promise.all([
          fetch('/api/nodes?domain=ea'),
          fetch('/api/node-types?domain=ea'),
        ]);
        if (nodesRes.ok) setGraphNodes(await nodesRes.json());
        if (typesRes.ok) {
          const types = await typesRes.json();
          setNodeTypes(types.filter(t => t.archimate || t.domain === 'ea'));
        }
      } catch (err) {
        console.error('Failed to load graph nodes:', err);
      }
    }
    loadGraphNodes();
  }, []);

  // Convert elements for Cytoscape
  const cytoscapeElements = useMemo(() => {
    return elements.map(el => {
      if (el.group === 'nodes') {
        const elDef = ALL_ELEMENTS[el.data.elementType] || {};
        return {
          group: 'nodes',
          data: {
            ...el.data,
            color: el.data.color || elDef.color || '#94a3b8',
            borderColor: darkenColor(el.data.color || elDef.color || '#94a3b8'),
            shape: elDef.shape || 'rectangle',
            width: el.data.width || 140,
            height: el.data.height || 60,
          },
          position: el.position,
        };
      } else {
        const relDef = RELATIONSHIP_TYPES[el.data.relType] || RELATIONSHIP_TYPES.association;
        return {
          group: 'edges',
          data: {
            ...el.data,
            color: relDef.color,
            targetArrow: relDef.targetArrow,
            sourceArrow: relDef.sourceArrow,
            lineStyle: relDef.style,
            label: el.data.label || relDef.label || '',
          },
        };
      }
    });
  }, [elements]);

  // History management
  const pushHistory = useCallback((newElements) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.stringify(newElements));
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(JSON.parse(history[newIndex]));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(JSON.parse(history[newIndex]));
    }
  }, [history, historyIndex]);

  // Create node at specific position
  const createNodeAtPosition = useCallback((elementType, position) => {
    const elDef = ALL_ELEMENTS[elementType];
    if (!elDef) return;

    const newNode = {
      group: 'nodes',
      data: {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        label: elDef.name,
        elementType: elementType,
        description: '',
      },
      position: { x: position.x, y: position.y },
    };

    setElements(prev => {
      const newElements = [...prev, newNode];
      pushHistory(newElements);
      return newElements;
    });

    // Switch back to select mode after placing
    setSelectedTool('select');
    setSelectedElementType(null);
  }, [pushHistory]);

  // Create edge between nodes
  const createEdgeBetween = useCallback((sourceId, targetId, relType) => {
    const newEdge = {
      group: 'edges',
      data: {
        id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        source: sourceId,
        target: targetId,
        relType: relType,
        label: '',
      },
    };

    setElements(prev => {
      const newElements = [...prev, newEdge];
      pushHistory(newElements);
      return newElements;
    });
  }, [pushHistory]);

  // Handle cytoscape initialization - set up event handlers ONCE
  const handleCyReady = useCallback((cy) => {
    cyRef.current = cy;

    // Remove any existing handlers first
    cy.removeAllListeners();

    // Handle node tap
    cy.on('tap', 'node', (evt) => {
      evt.stopPropagation();
      const node = evt.target;
      const tool = selectedToolRef.current;

      if (tool === 'connect') {
        const source = connectionSourceRef.current;
        if (!source) {
          setConnectionSource(node.id());
        } else if (source !== node.id()) {
          createEdgeBetween(source, node.id(), selectedRelTypeRef.current);
          setConnectionSource(null);
        }
      } else {
        // Select mode - just select the node
        setSelectedElement(node.id());
        const el = elementsRef.current.find(e => e.data.id === node.id());
        if (el) {
          setEditLabel(el.data.label || '');
          setEditDescription(el.data.description || '');
        }
      }
    });

    // Handle edge tap
    cy.on('tap', 'edge', (evt) => {
      evt.stopPropagation();
      const tool = selectedToolRef.current;
      if (tool === 'select') {
        const edge = evt.target;
        setSelectedElement(edge.id());
        const el = elementsRef.current.find(e => e.data.id === edge.id());
        if (el) setEditLabel(el.data.label || '');
      }
    });

    // Handle background tap - ONLY create node if in add mode
    cy.on('tap', (evt) => {
      // Only process if tapping on background (not a node/edge)
      if (evt.target !== cy) return;

      const tool = selectedToolRef.current;
      const elementType = selectedElementTypeRef.current;

      if (tool === 'add' && elementType) {
        // Create node at click position
        createNodeAtPosition(elementType, evt.position);
      } else if (tool === 'select') {
        // Just deselect
        setSelectedElement(null);
        setEditLabel('');
        setEditDescription('');
      } else if (tool === 'connect') {
        // Cancel connection
        setConnectionSource(null);
      }
    });

    // Handle drag end - save position
    cy.on('dragfree', 'node', (evt) => {
      const node = evt.target;
      const newPos = node.position();

      setElements(prev => prev.map(el => {
        if (el.data.id === node.id()) {
          return { ...el, position: { x: newPos.x, y: newPos.y } };
        }
        return el;
      }));
    });
  }, [createNodeAtPosition, createEdgeBetween]);

  // Delete selected element
  const deleteSelected = useCallback(() => {
    if (!selectedElement) return;
    setElements(prev => {
      const newElements = prev.filter(el =>
        el.data.id !== selectedElement &&
        el.data.source !== selectedElement &&
        el.data.target !== selectedElement
      );
      pushHistory(newElements);
      return newElements;
    });
    setSelectedElement(null);
  }, [selectedElement, pushHistory]);

  // Update selected element properties
  const updateSelectedElement = () => {
    if (!selectedElement) return;
    setElements(prev => prev.map(el => {
      if (el.data.id === selectedElement) {
        return { ...el, data: { ...el.data, label: editLabel, description: editDescription } };
      }
      return el;
    }));
  };

  // Link diagram element to graph node
  const linkToGraphNode = useCallback((nodeId) => {
    if (!selectedElement) return;
    const graphNode = graphNodes.find(n => n.id === nodeId);
    setElements(prev => {
      const newElements = prev.map(el => {
        if (el.data.id === selectedElement) {
          return {
            ...el,
            data: {
              ...el.data,
              linkedNodeId: nodeId,
              linkedNodeName: graphNode?.name || graphNode?.label,
              linkedNodeType: graphNode?.typeId,
            },
          };
        }
        return el;
      });
      pushHistory(newElements);
      return newElements;
    });
    setShowLinkBrowser(false);
  }, [selectedElement, graphNodes, pushHistory]);

  // Unlink diagram element from graph node
  const unlinkFromGraphNode = useCallback(() => {
    if (!selectedElement) return;
    setElements(prev => {
      const newElements = prev.map(el => {
        if (el.data.id === selectedElement) {
          const { linkedNodeId, linkedNodeName, linkedNodeType, ...restData } = el.data;
          return { ...el, data: restData };
        }
        return el;
      });
      pushHistory(newElements);
      return newElements;
    });
  }, [selectedElement, pushHistory]);

  // Save diagram
  const saveDiagram = async () => {
    if (!activeProject) return;
    setIsSaving(true);
    try {
      const method = currentDiagram ? 'PUT' : 'POST';
      const url = currentDiagram ? `/api/diagrams/${currentDiagram.id}` : '/api/diagrams';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify({
          name: diagramName,
          type: 'requirements',
          elements,
          domain_id: activeDomain,
          project_id: activeProject?.id,
        }),
      });
      if (res.ok) {
        setCurrentDiagram(await res.json());
        fetchDiagrams();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    }
    setIsSaving(false);
  };

  // Load diagram
  const loadDiagram = async (diagram) => {
    try {
      const res = await fetch(`/api/diagrams/${diagram.id}`, {
        headers: { 'x-user': user, 'x-role': role },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentDiagram(data);
        setDiagramName(data.name);
        setElements(data.elements || []);
        setHistory([JSON.stringify(data.elements || [])]);
        setHistoryIndex(0);
        setShowDiagramList(false);
      }
    } catch (err) {
      console.error('Failed to load:', err);
    }
  };

  // Export image
  const exportImage = () => {
    if (!cyRef.current) return;
    const data = cyRef.current.png({ full: true, scale: 2 });
    const link = document.createElement('a');
    link.download = `${diagramName}.png`;
    link.href = data;
    link.click();
  };

  // Get elements by category
  const getElementsByCategory = (cat) => {
    if (cat === 'all') return ALL_ELEMENTS;
    return Object.fromEntries(Object.entries(ALL_ELEMENTS).filter(([_, el]) => el.category === cat));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveDiagram(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) { e.preventDefault(); deleteSelected(); }
      if (e.key === 'Escape') {
        setSelectedTool('select');
        setSelectedElementType(null);
        setConnectionSource(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveDiagram, deleteSelected, selectedElement]);

  // Tool selection helpers
  const selectTool = (tool) => {
    setSelectedTool(tool);
    if (tool !== 'add') setSelectedElementType(null);
    if (tool !== 'connect') setConnectionSource(null);
  };

  const selectElementToAdd = (elementId) => {
    setSelectedTool('add');
    setSelectedElementType(elementId);
    setConnectionSource(null);
  };

  return (
    <div className="diagram-editor">
      {/* Toolbar */}
      <div className="diagram-editor-toolbar">
        {/* Tool selection */}
        <div className="toolbar-group tool-group">
          <button
            className={`toolbar-btn tool-btn ${selectedTool === 'select' ? 'active' : ''}`}
            onClick={() => selectTool('select')}
            title="Select tool (Esc)"
          >
            <MouseIcon fontSize="small" />
            <span>Select</span>
          </button>
          <button
            className={`toolbar-btn tool-btn ${selectedTool === 'connect' ? 'active' : ''}`}
            onClick={() => selectTool('connect')}
            title="Connect tool"
          >
            <LinearScaleIcon fontSize="small" />
            <span>Connect</span>
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Category filter */}
        <div className="toolbar-group">
          {['requirements', 'usecase', 'bpmn'].map(cat => (
            <button
              key={cat}
              className={`toolbar-btn cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'requirements' ? 'Req' : cat === 'usecase' ? 'UC' : 'BPMN'}
            </button>
          ))}
        </div>

        <div className="toolbar-divider" />

        {/* Actions */}
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={undo} disabled={historyIndex <= 0} title="Undo">
            <UndoIcon fontSize="small" />
          </button>
          <button className="toolbar-btn" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo">
            <RedoIcon fontSize="small" />
          </button>
          <button className="toolbar-btn" onClick={deleteSelected} disabled={!selectedElement} title="Delete">
            <DeleteIcon fontSize="small" />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Zoom */}
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)} title="Zoom in">
            <ZoomInIcon fontSize="small" />
          </button>
          <button className="toolbar-btn" onClick={() => cyRef.current?.zoom(cyRef.current.zoom() / 1.2)} title="Zoom out">
            <ZoomOutIcon fontSize="small" />
          </button>
          <button className="toolbar-btn" onClick={() => cyRef.current?.fit(undefined, 50)} title="Fit to view">
            <CenterFocusStrongIcon fontSize="small" />
          </button>
        </div>

        <div className="toolbar-spacer" />

        {/* File actions */}
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={() => setShowDiagramList(true)} title="Open diagram">
            <FolderOpenIcon fontSize="small" />
          </button>
          <button className="toolbar-btn" onClick={saveDiagram} disabled={isSaving || !activeProject} title="Save">
            <SaveIcon fontSize="small" />
          </button>
          <button className="toolbar-btn" onClick={exportImage} title="Export PNG">
            <ImageIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="diagram-editor-body">
        {/* Element toolbox */}
        <div className="diagram-toolbox">
          <div className="toolbox-section">
            <div className="toolbox-header">Elements</div>
            <div className="toolbox-hint">Click to select, then click canvas to place</div>
            {Object.values(getElementsByCategory(activeCategory)).map(el => (
              <button
                key={el.id}
                className={`toolbox-item ${selectedTool === 'add' && selectedElementType === el.id ? 'active' : ''}`}
                onClick={() => selectElementToAdd(el.id)}
              >
                <span className="toolbox-icon" style={{ background: el.color }}>{el.icon}</span>
                <span className="toolbox-label">{el.name}</span>
              </button>
            ))}
          </div>

          <div className="toolbox-section">
            <div className="toolbox-header">Relations</div>
            <div className="toolbox-hint">Select then click two nodes</div>
            {Object.values(RELATIONSHIP_TYPES).map(rel => (
              <button
                key={rel.id}
                className={`toolbox-item ${selectedRelType === rel.id ? 'selected-rel' : ''}`}
                onClick={() => { setSelectedRelType(rel.id); selectTool('connect'); }}
              >
                <span className="toolbox-rel-line" style={{ borderStyle: rel.style, borderColor: rel.color }} />
                <span className="toolbox-label">{rel.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="diagram-canvas">
          <div className="canvas-header">
            <input
              type="text"
              className="diagram-title-input"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              placeholder="Diagram name..."
            />
            {selectedTool === 'add' && selectedElementType && (
              <span className="mode-indicator add-mode">
                Click canvas to place: {ALL_ELEMENTS[selectedElementType]?.name}
              </span>
            )}
            {selectedTool === 'connect' && (
              <span className="mode-indicator connect-mode">
                {connectionSource ? 'Click target node' : 'Click source node'}
              </span>
            )}
          </div>
          <div className="canvas-container">
            <CytoscapeComponent
              elements={cytoscapeElements}
              stylesheet={getCytoscapeStylesheet()}
              style={{ width: '100%', height: '100%' }}
              cy={handleCyReady}
              boxSelectionEnabled={false}
              autounselectify={false}
              userZoomingEnabled={true}
              userPanningEnabled={true}
              minZoom={0.2}
              maxZoom={3}
            />
          </div>
        </div>

        {/* Properties panel */}
        {showProperties && (
          <div className="diagram-properties">
            <div className="properties-header">
              <span>Properties</span>
              <button className="icon-btn-sm" onClick={() => setShowProperties(false)}>
                <CloseIcon fontSize="small" />
              </button>
            </div>
            {selectedElement ? (
              <div className="properties-content">
                {(() => {
                  const el = elements.find(e => e.data.id === selectedElement);
                  if (!el) return null;
                  const isNode = el.group === 'nodes';
                  const typeDef = isNode ? ALL_ELEMENTS[el.data.elementType] : RELATIONSHIP_TYPES[el.data.relType];

                  return (
                    <>
                      <div className="prop-group">
                        <label className="prop-label">Type</label>
                        <div className="prop-type-display">
                          {isNode && (
                            <span className="prop-type-icon" style={{ background: typeDef?.color }}>
                              {typeDef?.icon}
                            </span>
                          )}
                          <span>{typeDef?.name || 'Unknown'}</span>
                        </div>
                      </div>
                      <div className="prop-group">
                        <label className="prop-label">Label</label>
                        <input
                          type="text"
                          className="prop-input"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          onBlur={updateSelectedElement}
                        />
                      </div>
                      {isNode && (
                        <div className="prop-group">
                          <label className="prop-label">Description</label>
                          <textarea
                            className="prop-input"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            onBlur={updateSelectedElement}
                            rows={3}
                          />
                        </div>
                      )}

                      {/* Graph Node Link Section */}
                      {isNode && (
                        <div className="prop-group prop-group-link">
                          <label className="prop-label">
                            <LinkIcon fontSize="small" style={{ marginRight: 4 }} />
                            EA Link
                          </label>
                          {el.data.linkedNodeId ? (
                            <div className="prop-linked-node">
                              <div className="linked-node-info">
                                <span className="linked-node-name">{el.data.linkedNodeName || 'Linked Node'}</span>
                                <span className="linked-node-type">{el.data.linkedNodeType}</span>
                              </div>
                              <div className="linked-node-actions">
                                <button
                                  className="icon-btn-sm"
                                  onClick={() => window.open(`/ea-workspace?node=${el.data.linkedNodeId}`, '_blank')}
                                  title="Open in EA Workspace"
                                >
                                  <OpenInNewIcon fontSize="small" />
                                </button>
                                <button
                                  className="icon-btn-sm danger"
                                  onClick={unlinkFromGraphNode}
                                  title="Remove link"
                                >
                                  <LinkOffIcon fontSize="small" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                className="btn-sm btn-outline"
                                onClick={() => setShowLinkBrowser(true)}
                              >
                                <LinkIcon fontSize="small" />
                                Link to EA Element
                              </button>
                              {showLinkBrowser && (
                                <div className="link-browser-dropdown">
                                  <div className="link-browser-header">
                                    <span>Select EA Element</span>
                                    <button className="icon-btn-sm" onClick={() => setShowLinkBrowser(false)}>
                                      <CloseIcon fontSize="small" />
                                    </button>
                                  </div>
                                  <div className="link-browser-list">
                                    {graphNodes.length === 0 ? (
                                      <div className="link-browser-empty">
                                        No EA elements found. Create elements in EA Workspace first.
                                      </div>
                                    ) : (
                                      graphNodes.slice(0, 50).map(node => {
                                        const typeDef = nodeTypes.find(t => t.id === node.typeId);
                                        return (
                                          <button
                                            key={node.id}
                                            className="link-browser-item"
                                            onClick={() => linkToGraphNode(node.id)}
                                          >
                                            <span
                                              className="link-item-color"
                                              style={{ backgroundColor: typeDef?.color || '#888' }}
                                            />
                                            <span className="link-item-name">{node.name || node.label}</span>
                                            <span className="link-item-layer">{node.layer}</span>
                                          </button>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="properties-empty">
                <p>Select an element to view properties</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Diagram list modal */}
      {showDiagramList && (
        <div className="modal-overlay" onClick={() => setShowDiagramList(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Open Diagram</h3>
              <button className="modal-close" onClick={() => setShowDiagramList(false)}>×</button>
            </div>
            <div className="diagram-list">
              {diagrams.length === 0 ? (
                <p className="empty-message">No diagrams saved yet</p>
              ) : (
                diagrams.map(d => (
                  <button key={d.id} className="diagram-list-item" onClick={() => loadDiagram(d)}>
                    <span className="diagram-name">{d.name}</span>
                    <span className="diagram-date">{new Date(d.updated_at).toLocaleDateString()}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
