// components/ba/ContextDiagramBuilder.js
// Context Diagram Builder for BA Workspace
// Shows system boundary with actors, external systems, and data flows

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../AuthContext';
import { useDomains } from '../DomainContext';
import { useProjects } from '../ProjectContext';
import { useArtefacts, ARTEFACT_TYPES } from '../ArtefactContext';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import DevicesIcon from '@mui/icons-material/Devices';
import BusinessIcon from '@mui/icons-material/Business';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';

const CytoscapeComponent = dynamic(() => import('react-cytoscapejs'), { ssr: false });

// ============ ELEMENT DEFINITIONS ============
const CONTEXT_ELEMENTS = {
  system: {
    id: 'system',
    name: 'System',
    icon: '⬡',
    shape: 'round-rectangle',
    color: '#3b82f6',
    description: 'The system being developed',
    category: 'core',
  },
  actor: {
    id: 'actor',
    name: 'Actor',
    icon: '👤',
    shape: 'ellipse',
    color: '#22c55e',
    description: 'Human user or role',
    category: 'external',
  },
  externalSystem: {
    id: 'externalSystem',
    name: 'External System',
    icon: '🔲',
    shape: 'rectangle',
    color: '#64748b',
    description: 'External system or service',
    category: 'external',
  },
  database: {
    id: 'database',
    name: 'Database',
    icon: '🗄️',
    shape: 'barrel',
    color: '#8b5cf6',
    description: 'Data store or database',
    category: 'external',
  },
  cloud: {
    id: 'cloud',
    name: 'Cloud Service',
    icon: '☁️',
    shape: 'round-rectangle',
    color: '#06b6d4',
    description: 'Cloud or SaaS service',
    category: 'external',
  },
  organization: {
    id: 'organization',
    name: 'Organization',
    icon: '🏢',
    shape: 'round-rectangle',
    color: '#f59e0b',
    description: 'External organization or partner',
    category: 'external',
  },
};

// ============ FLOW TYPES ============
const FLOW_TYPES = {
  dataFlow: {
    id: 'dataFlow',
    name: 'Data Flow',
    style: 'solid',
    color: '#3b82f6',
    targetArrow: 'triangle',
  },
  bidirectional: {
    id: 'bidirectional',
    name: 'Bidirectional',
    style: 'solid',
    color: '#22c55e',
    targetArrow: 'triangle',
    sourceArrow: 'triangle',
  },
  dependency: {
    id: 'dependency',
    name: 'Dependency',
    style: 'dashed',
    color: '#64748b',
    targetArrow: 'triangle',
  },
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
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 8,
      'background-color': 'data(color)',
      'border-width': 3,
      'border-color': 'data(borderColor)',
      'width': 'data(width)',
      'height': 'data(height)',
      'font-size': 12,
      'font-weight': 500,
      'color': 'var(--text)',
      'text-wrap': 'wrap',
      'text-max-width': '140px',
      'shape': 'data(shape)',
    },
  },
  {
    selector: 'node[elementType="system"]',
    style: {
      'text-valign': 'center',
      'text-halign': 'center',
      'text-margin-y': 0,
      'font-size': 14,
      'font-weight': 600,
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 4,
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
      'font-size': 11,
      'text-rotation': 'autorotate',
      'text-margin-y': -12,
      'text-background-color': 'var(--bg)',
      'text-background-opacity': 0.8,
      'text-background-padding': 3,
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

export default function ContextDiagramBuilder({
  onClose,
  initialDiagram = null,
  projectId = null,
}) {
  const { user, role } = useAuth();
  const { activeDomain } = useDomains();
  const { activeProject } = useProjects();
  const { artefacts } = useArtefacts();
  const cyRef = useRef(null);

  // State
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [diagramName, setDiagramName] = useState(initialDiagram?.name || 'Context Diagram');
  const [isSaving, setIsSaving] = useState(false);
  const [currentDiagram, setCurrentDiagram] = useState(initialDiagram);

  // Tool state
  const [activeTool, setActiveTool] = useState('select'); // select, add, connect
  const [selectedElementType, setSelectedElementType] = useState(null);
  const [selectedFlowType, setSelectedFlowType] = useState('dataFlow');
  const [connectionSource, setConnectionSource] = useState(null);

  // Properties panel
  const [editLabel, setEditLabel] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showLinkArtefact, setShowLinkArtefact] = useState(false);

  // Refs for event handlers
  const activeToolRef = useRef(activeTool);
  const selectedElementTypeRef = useRef(selectedElementType);
  const selectedFlowTypeRef = useRef(selectedFlowType);
  const connectionSourceRef = useRef(connectionSource);
  const elementsRef = useRef(elements);

  // Keep refs in sync
  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { selectedElementTypeRef.current = selectedElementType; }, [selectedElementType]);
  useEffect(() => { selectedFlowTypeRef.current = selectedFlowType; }, [selectedFlowType]);
  useEffect(() => { connectionSourceRef.current = connectionSource; }, [connectionSource]);
  useEffect(() => { elementsRef.current = elements; }, [elements]);

  // Load initial diagram
  useEffect(() => {
    if (initialDiagram?.elements) {
      setElements(initialDiagram.elements);
    } else {
      // Create default system node in center
      const defaultSystem = {
        group: 'nodes',
        data: {
          id: 'system-main',
          label: activeProject?.name || 'System',
          elementType: 'system',
          description: 'The system under development',
        },
        position: { x: 400, y: 300 },
      };
      setElements([defaultSystem]);
    }
  }, [initialDiagram, activeProject]);

  // Convert elements for Cytoscape
  const cytoscapeElements = useMemo(() => {
    return elements.map(el => {
      if (el.group === 'nodes') {
        const elDef = CONTEXT_ELEMENTS[el.data.elementType] || CONTEXT_ELEMENTS.system;
        const isSystem = el.data.elementType === 'system';
        return {
          group: 'nodes',
          data: {
            ...el.data,
            color: el.data.color || elDef.color,
            borderColor: darkenColor(el.data.color || elDef.color),
            shape: elDef.shape,
            width: isSystem ? 180 : 80,
            height: isSystem ? 120 : 80,
          },
          position: el.position,
        };
      } else {
        const flowDef = FLOW_TYPES[el.data.flowType] || FLOW_TYPES.dataFlow;
        return {
          group: 'edges',
          data: {
            ...el.data,
            color: flowDef.color,
            targetArrow: flowDef.targetArrow,
            sourceArrow: flowDef.sourceArrow || 'none',
            lineStyle: flowDef.style,
          },
        };
      }
    });
  }, [elements]);

  // Create node at position
  const createNodeAtPosition = useCallback((elementType, position) => {
    const elDef = CONTEXT_ELEMENTS[elementType];
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

    setElements(prev => [...prev, newNode]);
    setActiveTool('select');
    setSelectedElementType(null);
  }, []);

  // Create edge between nodes
  const createEdgeBetween = useCallback((sourceId, targetId, flowType) => {
    const flowDef = FLOW_TYPES[flowType];
    const newEdge = {
      group: 'edges',
      data: {
        id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        source: sourceId,
        target: targetId,
        flowType: flowType,
        label: '',
      },
    };

    setElements(prev => [...prev, newEdge]);
  }, []);

  // Handle cytoscape initialization
  const handleCyReady = useCallback((cy) => {
    cyRef.current = cy;
    cy.removeAllListeners();

    // Node tap
    cy.on('tap', 'node', (evt) => {
      evt.stopPropagation();
      const node = evt.target;
      const tool = activeToolRef.current;

      if (tool === 'connect') {
        const source = connectionSourceRef.current;
        if (!source) {
          setConnectionSource(node.id());
        } else if (source !== node.id()) {
          createEdgeBetween(source, node.id(), selectedFlowTypeRef.current);
          setConnectionSource(null);
        }
      } else {
        setSelectedElement(node.id());
        const el = elementsRef.current.find(e => e.data.id === node.id());
        if (el) {
          setEditLabel(el.data.label || '');
          setEditDescription(el.data.description || '');
        }
      }
    });

    // Edge tap
    cy.on('tap', 'edge', (evt) => {
      evt.stopPropagation();
      const tool = activeToolRef.current;
      if (tool === 'select') {
        const edge = evt.target;
        setSelectedElement(edge.id());
        const el = elementsRef.current.find(e => e.data.id === edge.id());
        if (el) setEditLabel(el.data.label || '');
      }
    });

    // Background tap
    cy.on('tap', (evt) => {
      if (evt.target !== cy) return;

      const tool = activeToolRef.current;
      const elementType = selectedElementTypeRef.current;

      if (tool === 'add' && elementType) {
        createNodeAtPosition(elementType, evt.position);
      } else if (tool === 'select') {
        setSelectedElement(null);
        setEditLabel('');
        setEditDescription('');
      } else if (tool === 'connect') {
        setConnectionSource(null);
      }
    });

    // Drag end
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

  // Delete selected
  const deleteSelected = useCallback(() => {
    if (!selectedElement) return;
    // Don't allow deleting the main system
    const el = elements.find(e => e.data.id === selectedElement);
    if (el?.data.elementType === 'system' && el?.data.id === 'system-main') {
      return; // Can't delete main system
    }

    setElements(prev => prev.filter(el =>
      el.data.id !== selectedElement &&
      el.data.source !== selectedElement &&
      el.data.target !== selectedElement
    ));
    setSelectedElement(null);
  }, [selectedElement, elements]);

  // Update selected element
  const updateSelectedElement = () => {
    if (!selectedElement) return;
    setElements(prev => prev.map(el => {
      if (el.data.id === selectedElement) {
        return { ...el, data: { ...el.data, label: editLabel, description: editDescription } };
      }
      return el;
    }));
  };

  // Link to artefact
  const linkToArtefact = (artefact) => {
    if (!selectedElement) return;
    setElements(prev => prev.map(el => {
      if (el.data.id === selectedElement) {
        return {
          ...el,
          data: {
            ...el.data,
            linkedArtefactId: artefact.id,
            linkedArtefactName: artefact.name,
            linkedArtefactType: artefact.artefactType,
          },
        };
      }
      return el;
    }));
    setShowLinkArtefact(false);
  };

  // Save diagram
  const saveDiagram = async () => {
    if (!activeProject) return;
    setIsSaving(true);
    try {
      const method = currentDiagram?.id ? 'PUT' : 'POST';
      const url = currentDiagram?.id ? `/api/diagrams/${currentDiagram.id}` : '/api/diagrams';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-user': user, 'x-role': role },
        body: JSON.stringify({
          name: diagramName,
          type: 'context',
          elements,
          domain_id: activeDomain,
          project_id: activeProject?.id || projectId,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setCurrentDiagram(saved);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    }
    setIsSaving(false);
  };

  // Export as image
  const exportImage = () => {
    if (!cyRef.current) return;
    const data = cyRef.current.png({ full: true, scale: 2, bg: '#ffffff' });
    const link = document.createElement('a');
    link.download = `${diagramName}.png`;
    link.href = data;
    link.click();
  };

  // Tool selection
  const selectTool = (tool) => {
    setActiveTool(tool);
    if (tool !== 'add') setSelectedElementType(null);
    if (tool !== 'connect') setConnectionSource(null);
  };

  const selectElementToAdd = (elementId) => {
    setActiveTool('add');
    setSelectedElementType(elementId);
    setConnectionSource(null);
  };

  // Get selected element info
  const selectedEl = elements.find(e => e.data.id === selectedElement);
  const selectedElDef = selectedEl ? CONTEXT_ELEMENTS[selectedEl.data.elementType] : null;

  return (
    <div className="context-diagram-builder">
      {/* Header */}
      <div className="diagram-builder-header">
        <div className="header-left">
          <input
            type="text"
            className="diagram-name-input"
            value={diagramName}
            onChange={(e) => setDiagramName(e.target.value)}
            placeholder="Diagram name..."
          />
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)} title="Zoom in">
            <ZoomInIcon fontSize="small" />
          </button>
          <button className="btn-icon" onClick={() => cyRef.current?.zoom(cyRef.current.zoom() / 1.2)} title="Zoom out">
            <ZoomOutIcon fontSize="small" />
          </button>
          <button className="btn-icon" onClick={() => cyRef.current?.fit(undefined, 50)} title="Fit to view">
            <CenterFocusStrongIcon fontSize="small" />
          </button>
          <div className="header-divider" />
          <button className="btn-icon" onClick={exportImage} title="Export PNG">
            <ImageIcon fontSize="small" />
          </button>
          <button className="btn-primary" onClick={saveDiagram} disabled={isSaving}>
            <SaveIcon fontSize="small" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
          {onClose && (
            <button className="btn-icon" onClick={onClose} title="Close">
              <CloseIcon fontSize="small" />
            </button>
          )}
        </div>
      </div>

      <div className="diagram-builder-body">
        {/* Left Toolbox */}
        <div className="diagram-toolbox">
          <div className="toolbox-section">
            <div className="toolbox-header">Elements</div>
            <div className="toolbox-hint">Click then click canvas to place</div>

            {Object.values(CONTEXT_ELEMENTS).filter(el => el.category === 'external').map(el => (
              <button
                key={el.id}
                className={`toolbox-item ${activeTool === 'add' && selectedElementType === el.id ? 'active' : ''}`}
                onClick={() => selectElementToAdd(el.id)}
              >
                <span className="toolbox-icon" style={{ background: el.color }}>{el.icon}</span>
                <div className="toolbox-item-info">
                  <span className="toolbox-label">{el.name}</span>
                  <span className="toolbox-desc">{el.description}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="toolbox-section">
            <div className="toolbox-header">Flows</div>
            <div className="toolbox-hint">Select flow type, then click two elements</div>

            {Object.values(FLOW_TYPES).map(flow => (
              <button
                key={flow.id}
                className={`toolbox-item flow-item ${selectedFlowType === flow.id ? 'selected' : ''}`}
                onClick={() => { setSelectedFlowType(flow.id); selectTool('connect'); }}
              >
                <span className="flow-line" style={{ borderColor: flow.color, borderStyle: flow.style }} />
                <span className="toolbox-label">{flow.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="diagram-canvas-area">
          <div className="canvas-toolbar">
            <button
              className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
              onClick={() => selectTool('select')}
            >
              Select
            </button>
            <button
              className={`tool-btn ${activeTool === 'connect' ? 'active' : ''}`}
              onClick={() => selectTool('connect')}
            >
              Connect
            </button>
            {selectedElement && (
              <>
                <div className="toolbar-divider" />
                <button className="tool-btn danger" onClick={deleteSelected}>
                  <DeleteIcon fontSize="small" />
                  Delete
                </button>
              </>
            )}

            <div className="toolbar-spacer" />

            {activeTool === 'add' && selectedElementType && (
              <span className="mode-hint">
                Click canvas to place: {CONTEXT_ELEMENTS[selectedElementType]?.name}
              </span>
            )}
            {activeTool === 'connect' && (
              <span className="mode-hint">
                {connectionSource ? 'Click target element' : 'Click source element'}
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
              minZoom={0.3}
              maxZoom={2}
            />
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className="diagram-properties">
          <div className="properties-header">
            <span>Properties</span>
          </div>

          {selectedEl ? (
            <div className="properties-content">
              <div className="prop-type-header">
                {selectedElDef && (
                  <>
                    <span className="prop-type-icon" style={{ background: selectedElDef.color }}>
                      {selectedElDef.icon}
                    </span>
                    <span className="prop-type-name">{selectedElDef.name}</span>
                  </>
                )}
              </div>

              <div className="prop-group">
                <label>Label</label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onBlur={updateSelectedElement}
                />
              </div>

              {selectedEl.group === 'nodes' && (
                <div className="prop-group">
                  <label>Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    onBlur={updateSelectedElement}
                    rows={3}
                  />
                </div>
              )}

              {/* Link to Artefact */}
              {selectedEl.group === 'nodes' && (
                <div className="prop-group">
                  <label>
                    <LinkIcon fontSize="small" style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    Linked Artefact
                  </label>
                  {selectedEl.data.linkedArtefactId ? (
                    <div className="linked-artefact-display">
                      <span className="linked-name">{selectedEl.data.linkedArtefactName}</span>
                      <span className="linked-type">{selectedEl.data.linkedArtefactType}</span>
                      <button
                        className="btn-sm"
                        onClick={() => {
                          setElements(prev => prev.map(el => {
                            if (el.data.id === selectedElement) {
                              const { linkedArtefactId, linkedArtefactName, linkedArtefactType, ...restData } = el.data;
                              return { ...el, data: restData };
                            }
                            return el;
                          }));
                        }}
                      >
                        Unlink
                      </button>
                    </div>
                  ) : (
                    <button className="btn-link-artefact" onClick={() => setShowLinkArtefact(true)}>
                      <LinkIcon fontSize="small" />
                      Link to Artefact
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="properties-empty">
              <p>Select an element to view properties</p>
              <p className="hint">The central system represents your solution. Add actors and external systems around it.</p>
            </div>
          )}
        </div>
      </div>

      {/* Link Artefact Modal */}
      {showLinkArtefact && (
        <div className="modal-overlay" onClick={() => setShowLinkArtefact(false)}>
          <div className="link-artefact-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Link to Artefact</h3>
              <button className="modal-close" onClick={() => setShowLinkArtefact(false)}>×</button>
            </div>
            <div className="artefact-list">
              {artefacts.length === 0 ? (
                <p className="empty-message">No artefacts available</p>
              ) : (
                artefacts.map(a => {
                  const typeDef = ARTEFACT_TYPES[a.artefactType];
                  return (
                    <button key={a.id} className="artefact-option" onClick={() => linkToArtefact(a)}>
                      <span className="artefact-icon" style={{ background: typeDef?.color }}>
                        {typeDef?.icon}
                      </span>
                      <div className="artefact-info">
                        <span className="artefact-name">{a.name}</span>
                        <span className="artefact-type">{typeDef?.name}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
