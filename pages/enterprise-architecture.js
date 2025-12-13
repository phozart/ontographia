// pages/enterprise-architecture.js
// Enterprise Architecture Canvas - ArchiMate-style diagrams
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';
import { useNotifications } from '../components/NotificationContext';
import { usePresence, PresenceIndicator } from '../components/PresenceContext';
import { EA_TEMPLATES, TemplatePickerModal } from '../components/DiagramTemplates';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import AppsIcon from '@mui/icons-material/Apps';
import StorageIcon from '@mui/icons-material/Storage';
import LayersIcon from '@mui/icons-material/Layers';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const CytoscapeComponent = dynamic(() => import('react-cytoscapejs'), { ssr: false });

// Generate unique comment ID
const generateCommentId = () => `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============ BUSINESS LAYER ELEMENTS (Yellow/Orange) ============
const BUSINESS_ELEMENTS = {
  businessActor: {
    id: 'businessActor',
    name: 'Business Actor',
    description: 'An organizational entity capable of performing behavior',
    shape: 'ellipse',
    color: '#fbbf24',
    icon: 'BA',
    layer: 'business',
  },
  businessRole: {
    id: 'businessRole',
    name: 'Business Role',
    description: 'Responsibility for performing specific behavior',
    shape: 'ellipse',
    color: '#f59e0b',
    icon: 'BR',
    layer: 'business',
  },
  businessProcess: {
    id: 'businessProcess',
    name: 'Business Process',
    description: 'A sequence of business behaviors that achieves a specific outcome',
    shape: 'round-rectangle',
    color: '#fcd34d',
    icon: 'BP',
    layer: 'business',
  },
  businessFunction: {
    id: 'businessFunction',
    name: 'Business Function',
    description: 'A collection of business behavior based on chosen criteria',
    shape: 'round-rectangle',
    color: '#fde68a',
    icon: 'BF',
    layer: 'business',
  },
  businessService: {
    id: 'businessService',
    name: 'Business Service',
    description: 'Explicitly defined exposed business behavior',
    shape: 'round-rectangle',
    color: '#fef3c7',
    icon: 'BS',
    layer: 'business',
  },
  businessObject: {
    id: 'businessObject',
    name: 'Business Object',
    description: 'A concept used within a particular business domain',
    shape: 'rectangle',
    color: '#fef9c3',
    icon: 'BO',
    layer: 'business',
  },
};

// ============ APPLICATION LAYER ELEMENTS (Blue) ============
const APPLICATION_ELEMENTS = {
  applicationComponent: {
    id: 'applicationComponent',
    name: 'Application Component',
    description: 'An encapsulation of application functionality',
    shape: 'rectangle',
    color: '#3b82f6',
    icon: 'AC',
    layer: 'application',
  },
  applicationService: {
    id: 'applicationService',
    name: 'Application Service',
    description: 'Explicitly defined exposed application behavior',
    shape: 'round-rectangle',
    color: '#60a5fa',
    icon: 'AS',
    layer: 'application',
  },
  applicationInterface: {
    id: 'applicationInterface',
    name: 'Application Interface',
    description: 'A point of access where application services are made available',
    shape: 'rectangle',
    color: '#93c5fd',
    icon: 'AI',
    layer: 'application',
  },
  dataObject: {
    id: 'dataObject',
    name: 'Data Object',
    description: 'Data structured for automated processing',
    shape: 'rectangle',
    color: '#bfdbfe',
    icon: 'DO',
    layer: 'application',
  },
  applicationFunction: {
    id: 'applicationFunction',
    name: 'Application Function',
    description: 'Automated behavior that can be performed by an application component',
    shape: 'round-rectangle',
    color: '#dbeafe',
    icon: 'AF',
    layer: 'application',
  },
};

// ============ TECHNOLOGY LAYER ELEMENTS (Green) ============
const TECHNOLOGY_ELEMENTS = {
  node: {
    id: 'node',
    name: 'Node',
    description: 'A computational or physical resource that hosts or manipulates artifacts',
    shape: 'rectangle',
    color: '#10b981',
    icon: 'N',
    layer: 'technology',
  },
  device: {
    id: 'device',
    name: 'Device',
    description: 'A physical IT resource upon which system software and artifacts may be deployed',
    shape: 'rectangle',
    color: '#34d399',
    icon: 'D',
    layer: 'technology',
  },
  systemSoftware: {
    id: 'systemSoftware',
    name: 'System Software',
    description: 'Software that provides or contributes to an environment for running other software',
    shape: 'rectangle',
    color: '#6ee7b7',
    icon: 'SS',
    layer: 'technology',
  },
  technologyService: {
    id: 'technologyService',
    name: 'Technology Service',
    description: 'Explicitly defined exposed technology behavior',
    shape: 'round-rectangle',
    color: '#a7f3d0',
    icon: 'TS',
    layer: 'technology',
  },
  artifact: {
    id: 'artifact',
    name: 'Artifact',
    description: 'A piece of data that is used or produced in a software development process',
    shape: 'rectangle',
    color: '#d1fae5',
    icon: 'A',
    layer: 'technology',
  },
  communicationNetwork: {
    id: 'communicationNetwork',
    name: 'Communication Network',
    description: 'A set of structures that connects nodes for transmission and routing of data',
    shape: 'round-rectangle',
    color: '#ecfdf5',
    icon: 'CN',
    layer: 'technology',
  },
};

// All elements combined
const ALL_ELEMENTS = {
  ...BUSINESS_ELEMENTS,
  ...APPLICATION_ELEMENTS,
  ...TECHNOLOGY_ELEMENTS,
};

// ============ RELATIONSHIP TYPES ============
const RELATIONSHIP_TYPES = {
  composition: {
    id: 'composition',
    name: 'Composition',
    description: 'Indicates that an element consists of other elements',
    style: 'solid',
    color: '#64748b',
    targetArrow: 'diamond',
    sourceArrow: 'none',
  },
  aggregation: {
    id: 'aggregation',
    name: 'Aggregation',
    description: 'Indicates that an element combines other elements',
    style: 'solid',
    color: '#64748b',
    targetArrow: 'diamond-outline',
    sourceArrow: 'none',
  },
  assignment: {
    id: 'assignment',
    name: 'Assignment',
    description: 'Links active elements with units of behavior',
    style: 'solid',
    color: '#64748b',
    targetArrow: 'circle',
    sourceArrow: 'none',
  },
  realization: {
    id: 'realization',
    name: 'Realization',
    description: 'Indicates that an entity plays a role in the creation of another',
    style: 'dashed',
    color: '#64748b',
    targetArrow: 'triangle',
    sourceArrow: 'none',
  },
  serving: {
    id: 'serving',
    name: 'Serving',
    description: 'Model that an element provides its functionality to another',
    style: 'solid',
    color: '#64748b',
    targetArrow: 'triangle',
    sourceArrow: 'none',
  },
  access: {
    id: 'access',
    name: 'Access',
    description: 'Model the access of behavioral elements to business/data objects',
    style: 'dashed',
    color: '#64748b',
    targetArrow: 'vee',
    sourceArrow: 'none',
  },
  flow: {
    id: 'flow',
    name: 'Flow',
    description: 'Transfer from one element to another',
    style: 'solid',
    color: '#3b82f6',
    targetArrow: 'triangle',
    sourceArrow: 'none',
  },
  triggering: {
    id: 'triggering',
    name: 'Triggering',
    description: 'Indicates causal relationship between behavior elements',
    style: 'solid',
    color: '#8b5cf6',
    targetArrow: 'triangle-backcurve',
    sourceArrow: 'none',
  },
  association: {
    id: 'association',
    name: 'Association',
    description: 'Model a relationship between objects that is not covered by another',
    style: 'solid',
    color: '#94a3b8',
    targetArrow: 'none',
    sourceArrow: 'none',
  },
};

// ============ CYTOSCAPE STYLESHEET ============
function getCytoscapeStylesheet() {
  const baseNodeStyle = {
    'background-color': 'data(color)',
    'border-width': 2,
    'border-color': 'data(borderColor)',
    'label': 'data(label)',
    'text-valign': 'center',
    'text-halign': 'center',
    'font-size': 'data(fontSize)',
    'font-weight': 'data(fontWeight)',
    'font-style': 'data(fontStyle)',
    'color': 'data(textColor)',
    'text-wrap': 'wrap',
    'text-max-width': '90px',
    'width': 'data(width)',
    'height': 'data(height)',
    'text-margin-y': 0,
  };

  return [
    // Default node style
    {
      selector: 'node',
      style: {
        ...baseNodeStyle,
        'shape': 'data(shape)',
      },
    },
    // Business layer nodes
    {
      selector: 'node[layer="business"]',
      style: {
        'border-color': '#d97706',
      },
    },
    // Application layer nodes
    {
      selector: 'node[layer="application"]',
      style: {
        'border-color': '#2563eb',
      },
    },
    // Technology layer nodes
    {
      selector: 'node[layer="technology"]',
      style: {
        'border-color': '#059669',
      },
    },
    // Selected node
    {
      selector: 'node:selected',
      style: {
        'border-width': 3,
        'border-color': '#7c3aed',
        'box-shadow': '0 0 0 4px rgba(124, 58, 237, 0.3)',
      },
    },
    // Default edge style
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': 'data(color)',
        'target-arrow-color': 'data(color)',
        'source-arrow-color': 'data(color)',
        'target-arrow-shape': 'data(targetArrow)',
        'source-arrow-shape': 'data(sourceArrow)',
        'curve-style': 'bezier',
        'arrow-scale': 1.2,
        'label': 'data(label)',
        'font-size': 10,
        'text-rotation': 'autorotate',
        'text-margin-y': -10,
        'color': '#64748b',
      },
    },
    // Dashed edge
    {
      selector: 'edge[lineStyle="dashed"]',
      style: {
        'line-style': 'dashed',
        'line-dash-pattern': [6, 3],
      },
    },
    // Selected edge
    {
      selector: 'edge:selected',
      style: {
        'width': 3,
        'line-color': '#7c3aed',
        'target-arrow-color': '#7c3aed',
        'source-arrow-color': '#7c3aed',
      },
    },
    // Preview elements
    {
      selector: '.preview',
      style: {
        'opacity': 0.5,
        'border-style': 'dashed',
      },
    },
  ];
}

export default function EnterpriseArchitecture() {
  const { user, role } = useAuth();
  const { activeDomain } = useDomains();
  const { notifyMentions } = useNotifications();
  const { joinPage, leavePage } = usePresence();
  const cyRef = useRef(null);

  // State
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedElementType, setSelectedElementType] = useState(null);
  const [selectedRelType, setSelectedRelType] = useState('serving');
  const [connectionSource, setConnectionSource] = useState(null);
  const [activeLayer, setActiveLayer] = useState('all'); // 'all', 'business', 'application', 'technology'

  // Diagram management
  const [diagrams, setDiagrams] = useState([]);
  const [currentDiagram, setCurrentDiagram] = useState(null);
  const [diagramName, setDiagramName] = useState('Untitled EA Diagram');
  const [showDiagramList, setShowDiagramList] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showTemplatesPicker, setShowTemplatesPicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [newDiagramName, setNewDiagramName] = useState('');

  // Properties panel
  const [showProperties, setShowProperties] = useState(true);
  const [editLabel, setEditLabel] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  // Clipboard for copy/paste
  const [clipboard, setClipboard] = useState(null);

  // Fetch diagrams on load
  useEffect(() => {
    if (user) {
      fetchDiagrams();
    }
  }, [user, role, activeDomain]);

  // Presence tracking
  useEffect(() => {
    joinPage('enterprise-architecture', currentDiagram?.id);
    return () => leavePage();
  }, [joinPage, leavePage, currentDiagram?.id]);

  const fetchDiagrams = async () => {
    try {
      const params = new URLSearchParams({ type: 'ea' });
      if (activeDomain) params.append('domain_id', activeDomain);
      const res = await fetch(`/api/diagrams?${params}`, {
        headers: { 'x-user': user, 'x-role': role },
      });
      if (res.ok) {
        const data = await res.json();
        setDiagrams(data);
      }
    } catch (err) {
      console.error('Failed to fetch diagrams:', err);
    }
  };

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
            borderColor: elDef.color || '#64748b',
            shape: elDef.shape || 'rectangle',
            layer: elDef.layer || 'business',
            // Size properties
            width: el.data.width || 100,
            height: el.data.height || 60,
            // Text styling properties
            fontSize: el.data.fontSize || 11,
            fontWeight: el.data.fontWeight || 500,
            fontStyle: el.data.fontStyle || 'normal',
            textColor: el.data.textColor || '#1e293b',
          },
          position: el.position,
          classes: el.classes || '',
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
          },
          classes: el.classes || '',
        };
      }
    });
  }, [elements]);

  // History management
  const pushHistory = useCallback((newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.stringify(newElements));
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

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

  // Element creation
  const createNode = useCallback((elementType, position) => {
    const elDef = ALL_ELEMENTS[elementType];
    if (!elDef) return;

    const newNode = {
      group: 'nodes',
      data: {
        id: `node-${Date.now()}`,
        label: elDef.name,
        elementType: elementType,
        description: '',
      },
      position: position,
    };

    const newElements = [...elements, newNode];
    setElements(newElements);
    pushHistory(newElements);
    setSelectedTool('select');
  }, [elements, pushHistory]);

  const createEdge = useCallback((sourceId, targetId, relType) => {
    const relDef = RELATIONSHIP_TYPES[relType];
    if (!relDef) return;

    const newEdge = {
      group: 'edges',
      data: {
        id: `edge-${Date.now()}`,
        source: sourceId,
        target: targetId,
        relType: relType,
        label: '',
      },
    };

    const newElements = [...elements, newEdge];
    setElements(newElements);
    pushHistory(newElements);
  }, [elements, pushHistory]);

  // Delete selected element
  const deleteSelected = useCallback(() => {
    if (!selectedElement) return;

    const newElements = elements.filter(el => {
      if (el.data.id === selectedElement) return false;
      if (el.group === 'edges' && (el.data.source === selectedElement || el.data.target === selectedElement)) return false;
      return true;
    });

    setElements(newElements);
    pushHistory(newElements);
    setSelectedElement(null);
  }, [elements, selectedElement, pushHistory]);

  // Copy selected element
  const copySelected = useCallback(() => {
    if (!selectedElement) return;
    const el = elements.find(e => e.data.id === selectedElement);
    if (el && el.group === 'nodes') {
      setClipboard({
        type: 'node',
        data: { ...el.data },
        position: el.position ? { ...el.position } : { x: 100, y: 100 },
      });
    }
  }, [elements, selectedElement]);

  // Paste from clipboard
  const pasteElement = useCallback(() => {
    if (!clipboard || clipboard.type !== 'node') return;

    const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newElement = {
      group: 'nodes',
      data: {
        ...clipboard.data,
        id: newId,
        label: `${clipboard.data.label || clipboard.data.type} (copy)`,
      },
      position: {
        x: clipboard.position.x + 30,
        y: clipboard.position.y + 30,
      },
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    pushHistory(newElements);
    setSelectedElement(newId);
  }, [clipboard, elements, pushHistory]);

  // Save diagram
  const saveDiagram = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const nodes = elements.filter(el => el.group === 'nodes');
      const connections = elements.filter(el => el.group === 'edges');

      const body = {
        type: 'ea',
        name: diagramName,
        description: '',
        elements: nodes,
        connections: connections,
        settings: { activeLayer },
        domainId: activeDomain || null,
      };

      let res;
      if (currentDiagram) {
        res = await fetch(`/api/diagrams/${currentDiagram}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user': user,
            'x-role': role,
          },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/diagrams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user': user,
            'x-role': role,
          },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        const saved = await res.json();
        setCurrentDiagram(saved.id);
        fetchDiagrams();
      }
    } catch (err) {
      console.error('Failed to save diagram:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Load diagram
  const loadDiagram = async (id) => {
    try {
      const res = await fetch(`/api/diagrams/${id}`, {
        headers: { 'x-user': user, 'x-role': role },
      });
      if (res.ok) {
        const diagram = await res.json();
        const loadedElements = [
          ...(diagram.elements || []),
          ...(diagram.connections || []),
        ];
        setElements(loadedElements);
        setDiagramName(diagram.name);
        setCurrentDiagram(diagram.id);
        setHistory([JSON.stringify(loadedElements)]);
        setHistoryIndex(0);
        setShowDiagramList(false);
        if (diagram.settings?.activeLayer) {
          setActiveLayer(diagram.settings.activeLayer);
        }
      }
    } catch (err) {
      console.error('Failed to load diagram:', err);
    }
  };

  // Create new diagram from template
  const createNewDiagram = () => {
    if (!newDiagramName.trim()) return;

    // Apply template if selected
    let initialElements = [];
    if (selectedTemplate && selectedTemplate.elements?.length > 0) {
      initialElements = selectedTemplate.elements.map(el => ({
        id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: el.type,
        label: el.label,
        x: el.x,
        y: el.y,
        width: el.width || 120,
        height: el.height || 60,
      }));

      // Map old IDs to new IDs for connections
      const idMap = {};
      selectedTemplate.elements.forEach((el, idx) => {
        idMap[el.id] = initialElements[idx].id;
      });

      // Add connections if template has them
      if (selectedTemplate.connections?.length > 0) {
        selectedTemplate.connections.forEach(conn => {
          if (idMap[conn.source] && idMap[conn.target]) {
            initialElements.push({
              id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'edge',
              source: idMap[conn.source],
              target: idMap[conn.target],
              relType: conn.type || 'serving',
            });
          }
        });
      }
    }

    setElements(initialElements);
    setDiagramName(newDiagramName.trim());
    setCurrentDiagram(null);
    setHistory([JSON.stringify(initialElements)]);
    setHistoryIndex(0);
    setShowNewDialog(false);
    setShowTemplatesPicker(false);
    setSelectedTemplate(null);
    setNewDiagramName('');
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowTemplatesPicker(false);
    setShowNewDialog(true);
    if (template.id !== 'blank') {
      setNewDiagramName(template.name);
    }
  };

  // Export as image
  const exportImage = (format = 'png') => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    const dataUrl = format === 'svg'
      ? cy.svg({ full: true, scale: 2 })
      : cy.png({ full: true, scale: 2, bg: 'white' });

    if (format === 'svg') {
      const blob = new Blob([dataUrl], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${diagramName}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${diagramName}.png`;
      a.click();
    }
  };

  // Cytoscape event handlers
  const handleCyReady = useCallback((cy) => {
    cyRef.current = cy;

    cy.on('tap', 'node', (e) => {
      const node = e.target;
      if (selectedTool === 'connect') {
        if (!connectionSource) {
          setConnectionSource(node.id());
        } else {
          if (connectionSource !== node.id()) {
            createEdge(connectionSource, node.id(), selectedRelType);
          }
          setConnectionSource(null);
        }
      } else {
        setSelectedElement(node.id());
        const el = elements.find(el => el.data.id === node.id());
        if (el) {
          setEditLabel(el.data.label || '');
          setEditDescription(el.data.description || '');
        }
      }
    });

    cy.on('tap', 'edge', (e) => {
      const edge = e.target;
      setSelectedElement(edge.id());
      const el = elements.find(el => el.data.id === edge.id());
      if (el) {
        setEditLabel(el.data.label || '');
        setEditDescription('');
      }
    });

    cy.on('tap', (e) => {
      if (e.target === cy) {
        if (selectedTool === 'add' && selectedElementType) {
          createNode(selectedElementType, e.position);
        } else {
          setSelectedElement(null);
          setConnectionSource(null);
        }
      }
    });

    cy.on('dragfree', 'node', (e) => {
      const node = e.target;
      const newElements = elements.map(el => {
        if (el.data.id === node.id()) {
          return { ...el, position: node.position() };
        }
        return el;
      });
      setElements(newElements);
    });
  }, [selectedTool, selectedElementType, connectionSource, selectedRelType, elements, createNode, createEdge]);

  // Update element properties
  const updateSelectedElement = useCallback(() => {
    if (!selectedElement) return;

    const newElements = elements.map(el => {
      if (el.data.id === selectedElement) {
        return {
          ...el,
          data: {
            ...el.data,
            label: editLabel,
            description: editDescription,
          },
        };
      }
      return el;
    });

    setElements(newElements);
    pushHistory(newElements);
  }, [selectedElement, elements, editLabel, editDescription, pushHistory]);

  // Update element data (for text styling etc)
  const updateElementData = useCallback((dataUpdates) => {
    if (!selectedElement) return;

    const newElements = elements.map(el => {
      if (el.data.id === selectedElement) {
        return {
          ...el,
          data: {
            ...el.data,
            ...dataUpdates,
          },
        };
      }
      return el;
    });

    setElements(newElements);
    pushHistory(newElements);
  }, [selectedElement, elements, pushHistory]);

  // Filter elements by layer
  const getElementsByLayer = (layer) => {
    if (layer === 'business') return BUSINESS_ELEMENTS;
    if (layer === 'application') return APPLICATION_ELEMENTS;
    if (layer === 'technology') return TECHNOLOGY_ELEMENTS;
    return ALL_ELEMENTS;
  };

  // Get current user info for comments
  const currentUserName = user || 'Anonymous';

  // Add a new comment
  const addComment = useCallback((text, parentId = null) => {
    if (!text.trim()) return;

    const newComment = {
      id: generateCommentId(),
      text: text.trim(),
      author: currentUserName,
      createdAt: Date.now(),
      parentId,
      resolved: false,
    };

    setComments(prev => [...prev, newComment]);
    setNewCommentText('');
    setReplyingTo(null);

    // Notify mentioned users
    notifyMentions(text, currentUserName, 'EA Canvas', '/enterprise-architecture');
  }, [currentUserName, notifyMentions]);

  // Delete a comment
  const deleteComment = useCallback((commentId) => {
    setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId));
  }, []);

  // Toggle comment resolved
  const toggleResolveComment = useCallback((commentId) => {
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, resolved: !c.resolved } : c
    ));
  }, []);

  // Parse @mentions in comment text
  const parseCommentText = useCallback((text) => {
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'mention', content: match[1] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts;
  }, []);

  // Get top-level comments and their replies
  const organizedComments = useMemo(() => {
    const topLevel = comments.filter(c => !c.parentId);
    return topLevel.map(comment => ({
      ...comment,
      replies: comments.filter(c => c.parentId === comment.id)
    }));
  }, [comments]);

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDiagram();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === 'Escape') {
        setSelectedTool('select');
        setConnectionSource(null);
        setSelectedElementType(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copySelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        pasteElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveDiagram, deleteSelected, copySelected, pasteElement]);

  if (!user) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <BusinessIcon style={{ fontSize: 48, color: 'var(--accent)', marginBottom: 16 }} />
          <h2>Enterprise Architecture Canvas</h2>
          <p style={{ color: 'var(--text-muted)' }}>Please log in to create and manage EA diagrams.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="diagram-studio">
      {/* Toolbar */}
      <div className="diagram-toolbar">
        <div className="toolbar-group">
          <button
            className={`toolbar-btn ${selectedTool === 'select' ? 'active' : ''}`}
            onClick={() => { setSelectedTool('select'); setSelectedElementType(null); }}
            title="Select (Esc)"
          >
            Select
          </button>
          <button
            className={`toolbar-btn ${selectedTool === 'connect' ? 'active' : ''}`}
            onClick={() => { setSelectedTool('connect'); setSelectedElementType(null); }}
            title="Connect elements"
          >
            Connect
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Layer tabs */}
        <div className="toolbar-group">
          <button
            className={`toolbar-btn ${activeLayer === 'all' ? 'active' : ''}`}
            onClick={() => setActiveLayer('all')}
            title="All Layers"
          >
            <LayersIcon fontSize="small" /> All
          </button>
          <button
            className={`toolbar-btn ${activeLayer === 'business' ? 'active' : ''}`}
            onClick={() => setActiveLayer('business')}
            title="Business Layer"
            style={{ color: activeLayer === 'business' ? '#d97706' : undefined }}
          >
            <BusinessIcon fontSize="small" /> Business
          </button>
          <button
            className={`toolbar-btn ${activeLayer === 'application' ? 'active' : ''}`}
            onClick={() => setActiveLayer('application')}
            title="Application Layer"
            style={{ color: activeLayer === 'application' ? '#2563eb' : undefined }}
          >
            <AppsIcon fontSize="small" /> Application
          </button>
          <button
            className={`toolbar-btn ${activeLayer === 'technology' ? 'active' : ''}`}
            onClick={() => setActiveLayer('technology')}
            title="Technology Layer"
            style={{ color: activeLayer === 'technology' ? '#059669' : undefined }}
          >
            <StorageIcon fontSize="small" /> Technology
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
            <UndoIcon fontSize="small" />
          </button>
          <button className="toolbar-btn" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Shift+Z)">
            <RedoIcon fontSize="small" />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)} title="Zoom In">
            <ZoomInIcon fontSize="small" />
          </button>
          <button className="toolbar-btn" onClick={() => cyRef.current?.zoom(cyRef.current.zoom() / 1.2)} title="Zoom Out">
            <ZoomOutIcon fontSize="small" />
          </button>
          <button className="toolbar-btn" onClick={() => cyRef.current?.fit(undefined, 50)} title="Fit to View">
            <CenterFocusStrongIcon fontSize="small" />
          </button>
        </div>

        <div className="toolbar-spacer" />

        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={() => setShowTemplatesPicker(true)} title="New Diagram">
            <AddIcon fontSize="small" /> New
          </button>
          <button className="toolbar-btn" onClick={() => setShowDiagramList(true)} title="Open Diagram">
            <FolderOpenIcon fontSize="small" /> Open
          </button>
          <button className="toolbar-btn" onClick={saveDiagram} disabled={isSaving} title="Save (Ctrl+S)">
            <SaveIcon fontSize="small" /> {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={() => exportImage('png')} title="Export PNG">
            <ImageIcon fontSize="small" /> PNG
          </button>
          <button className="toolbar-btn" onClick={() => exportImage('svg')} title="Export SVG">
            SVG
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            className={`toolbar-btn ${showCommentsPanel ? 'active' : ''}`}
            onClick={() => setShowCommentsPanel(!showCommentsPanel)}
            title="Toggle comments"
            style={{ position: 'relative' }}
          >
            <ChatBubbleOutlineIcon fontSize="small" />
            {comments.length > 0 && (
              <span className="comment-badge">{comments.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="diagram-body">
        {/* Left toolbox */}
        <div className="diagram-toolbox">
          <div className="toolbox-section">
            <div className="toolbox-title">
              {activeLayer === 'all' ? 'All Elements' : `${activeLayer.charAt(0).toUpperCase() + activeLayer.slice(1)} Layer`}
            </div>
            {Object.values(getElementsByLayer(activeLayer)).map(el => (
              <button
                key={el.id}
                className={`toolbox-item ${selectedTool === 'add' && selectedElementType === el.id ? 'active' : ''}`}
                onClick={() => { setSelectedTool('add'); setSelectedElementType(el.id); }}
                title={el.description}
                style={{ borderLeftColor: el.color }}
              >
                <span className="toolbox-icon" style={{ background: el.color }}>{el.icon}</span>
                <span className="toolbox-label">{el.name}</span>
              </button>
            ))}
          </div>

          <div className="toolbox-section">
            <div className="toolbox-title">Relationships</div>
            {Object.values(RELATIONSHIP_TYPES).map(rel => (
              <button
                key={rel.id}
                className={`toolbox-item ${selectedRelType === rel.id ? 'selected-rel' : ''}`}
                onClick={() => setSelectedRelType(rel.id)}
                title={rel.description}
              >
                <span className="toolbox-rel-line" style={{
                  borderStyle: rel.style,
                  borderColor: rel.color,
                }} />
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
            <PresenceIndicator />
            {connectionSource && (
              <span className="connection-hint">
                Click target element to complete connection
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

        {/* Right panel - Properties */}
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
                  const typeDef = isNode
                    ? ALL_ELEMENTS[el.data.elementType]
                    : RELATIONSHIP_TYPES[el.data.relType];

                  return (
                    <>
                      <div className="prop-group">
                        <label className="prop-label">Type</label>
                        <div className="prop-value" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 10px',
                          background: 'var(--input-bg)',
                          borderRadius: 6,
                        }}>
                          {isNode && (
                            <span style={{
                              width: 20,
                              height: 20,
                              borderRadius: 4,
                              background: typeDef?.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#1e293b',
                            }}>
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
                          placeholder="Enter label..."
                        />
                      </div>

                      {/* Text Styling Controls */}
                      <div className="prop-group">
                        <label className="prop-label">Text Style</label>
                        <div className="text-style-controls">
                          <select
                            value={el.data.fontSize || 12}
                            onChange={e => updateElementData({ fontSize: parseInt(e.target.value) })}
                            className="font-size-select"
                            title="Font Size"
                          >
                            {[8, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                              <option key={size} value={size}>{size}px</option>
                            ))}
                          </select>
                          <button
                            className={`text-style-btn ${el.data.fontWeight === 'bold' ? 'active' : ''}`}
                            onClick={() => updateElementData({ fontWeight: el.data.fontWeight === 'bold' ? 'normal' : 'bold' })}
                            title="Bold"
                          >
                            <strong>B</strong>
                          </button>
                          <button
                            className={`text-style-btn ${el.data.fontStyle === 'italic' ? 'active' : ''}`}
                            onClick={() => updateElementData({ fontStyle: el.data.fontStyle === 'italic' ? 'normal' : 'italic' })}
                            title="Italic"
                          >
                            <em>I</em>
                          </button>
                          <input
                            type="color"
                            value={el.data.textColor || '#000000'}
                            onChange={e => updateElementData({ textColor: e.target.value })}
                            className="color-input small"
                            title="Text Color"
                          />
                        </div>
                      </div>

                      {isNode && (
                        <div className="prop-group">
                          <label className="prop-label">Background Color</label>
                          <div className="color-picker-row">
                            <input
                              type="color"
                              value={el.data.color || typeDef?.color || '#fef3c7'}
                              onChange={e => updateElementData({ color: e.target.value })}
                              className="color-input"
                            />
                            <input
                              type="text"
                              value={el.data.color || typeDef?.color || '#fef3c7'}
                              onChange={e => updateElementData({ color: e.target.value })}
                              className="color-text"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                      )}

                      {isNode && (
                        <div className="prop-group">
                          <label className="prop-label">Size</label>
                          <div className="size-controls">
                            <div className="size-input-group">
                              <label>W</label>
                              <input
                                type="number"
                                min="40"
                                max="300"
                                value={el.data.width || 100}
                                onChange={e => updateElementData({ width: parseInt(e.target.value) || 100 })}
                              />
                            </div>
                            <span className="size-separator">×</span>
                            <div className="size-input-group">
                              <label>H</label>
                              <input
                                type="number"
                                min="30"
                                max="200"
                                value={el.data.height || 60}
                                onChange={e => updateElementData({ height: parseInt(e.target.value) || 60 })}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {isNode && (
                        <div className="prop-group">
                          <label className="prop-label">Description</label>
                          <textarea
                            className="prop-textarea"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            onBlur={updateSelectedElement}
                            placeholder="Enter description..."
                            rows={3}
                          />
                        </div>
                      )}

                      {isNode && typeDef && (
                        <div className="prop-group">
                          <label className="prop-label">Layer</label>
                          <div className="prop-value" style={{
                            padding: '6px 10px',
                            background: typeDef.layer === 'business' ? '#fef3c7' :
                                       typeDef.layer === 'application' ? '#dbeafe' : '#d1fae5',
                            color: typeDef.layer === 'business' ? '#92400e' :
                                   typeDef.layer === 'application' ? '#1e40af' : '#065f46',
                            borderRadius: 6,
                            fontWeight: 500,
                            fontSize: 12,
                          }}>
                            {typeDef.layer.charAt(0).toUpperCase() + typeDef.layer.slice(1)}
                          </div>
                        </div>
                      )}

                      <div className="prop-group">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={deleteSelected}
                          style={{ width: '100%' }}
                        >
                          <DeleteIcon fontSize="small" /> Delete Element
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="properties-empty">
                <p>Select an element to view its properties</p>
                <p className="hint">Click on canvas to add elements when a tool is selected</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Diagram list modal */}
      {showDiagramList && (
        <div className="modal-backdrop" onClick={() => setShowDiagramList(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <h3 style={{ marginTop: 0 }}>Open EA Diagram</h3>
            {diagrams.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No EA diagrams found. Create a new one to get started.</p>
            ) : (
              <div className="diagram-list">
                {diagrams.map(d => (
                  <button
                    key={d.id}
                    className="diagram-list-item"
                    onClick={() => loadDiagram(d.id)}
                  >
                    <BusinessIcon style={{ color: 'var(--accent)' }} />
                    <div className="diagram-list-info">
                      <span className="diagram-list-name">{d.name}</span>
                      <span className="diagram-list-date">
                        {new Date(d.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowDiagramList(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Template picker modal */}
      <TemplatePickerModal
        isOpen={showTemplatesPicker}
        onClose={() => setShowTemplatesPicker(false)}
        onSelect={handleTemplateSelect}
        templates={EA_TEMPLATES}
        title="New EA Diagram - Choose Template"
      />

      {/* New diagram dialog */}
      {showNewDialog && (
        <div className="modal-backdrop" onClick={() => setShowNewDialog(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h3 style={{ marginTop: 0 }}>New EA Diagram</h3>
            {selectedTemplate && selectedTemplate.id !== 'blank' && (
              <div style={{ marginBottom: 16, padding: '10px 12px', background: 'var(--accent-soft)', borderRadius: 8, fontSize: 13 }}>
                <strong>Template:</strong> {selectedTemplate.name}
              </div>
            )}
            <div className="form-group">
              <label>Diagram Name</label>
              <input
                type="text"
                className="form-input"
                value={newDiagramName}
                onChange={(e) => setNewDiagramName(e.target.value)}
                placeholder="Enter diagram name..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && createNewDiagram()}
              />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => { setShowNewDialog(false); setSelectedTemplate(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={createNewDiagram} disabled={!newDiagramName.trim()}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Panel */}
      {showCommentsPanel && (
        <div className="comments-panel">
          <div className="comments-header">
            <h4>Comments</h4>
            <button className="comments-close" onClick={() => setShowCommentsPanel(false)}>×</button>
          </div>

          <div className="comments-list">
            {organizedComments.length === 0 ? (
              <div className="comments-empty">
                <span className="comments-empty-icon">💬</span>
                <p>No comments yet</p>
                <p className="comments-empty-hint">Add a comment to start a discussion</p>
              </div>
            ) : (
              organizedComments.map(comment => (
                <div key={comment.id} className={`comment-thread ${comment.resolved ? 'resolved' : ''}`}>
                  <div className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-time">{formatTime(comment.createdAt)}</span>
                    </div>
                    <div className="comment-body">
                      {parseCommentText(comment.text).map((part, i) =>
                        part.type === 'mention' ? (
                          <span key={i} className="comment-mention">@{part.content}</span>
                        ) : (
                          <span key={i}>{part.content}</span>
                        )
                      )}
                    </div>
                    <div className="comment-actions">
                      <button onClick={() => setReplyingTo(comment.id)}>Reply</button>
                      <button onClick={() => toggleResolveComment(comment.id)}>
                        {comment.resolved ? 'Reopen' : 'Resolve'}
                      </button>
                      <button onClick={() => deleteComment(comment.id)}>Delete</button>
                    </div>
                  </div>

                  {/* Replies */}
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="comment-reply">
                      <div className="comment-header">
                        <span className="comment-author">{reply.author}</span>
                        <span className="comment-time">{formatTime(reply.createdAt)}</span>
                      </div>
                      <div className="comment-body">
                        {parseCommentText(reply.text).map((part, i) =>
                          part.type === 'mention' ? (
                            <span key={i} className="comment-mention">@{part.content}</span>
                          ) : (
                            <span key={i}>{part.content}</span>
                          )
                        )}
                      </div>
                      <div className="comment-actions">
                        <button onClick={() => deleteComment(reply.id)}>Delete</button>
                      </div>
                    </div>
                  ))}

                  {/* Reply input */}
                  {replyingTo === comment.id && (
                    <div className="comment-reply-input">
                      <input
                        type="text"
                        placeholder="Write a reply... Use @name to mention"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newCommentText.trim()) {
                            addComment(newCommentText, comment.id);
                          }
                          if (e.key === 'Escape') {
                            setReplyingTo(null);
                            setNewCommentText('');
                          }
                        }}
                        autoFocus
                      />
                      <div className="comment-reply-actions">
                        <button className="btn-small" onClick={() => { setReplyingTo(null); setNewCommentText(''); }}>Cancel</button>
                        <button className="btn-small btn" onClick={() => addComment(newCommentText, comment.id)}>Reply</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* New comment input */}
          <div className="comment-input-container">
            <input
              type="text"
              className="comment-input"
              placeholder="Add a comment... Use @name to tag users"
              value={replyingTo ? '' : newCommentText}
              onChange={(e) => !replyingTo && setNewCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCommentText.trim() && !replyingTo) {
                  addComment(newCommentText);
                }
              }}
              disabled={!!replyingTo}
            />
            <button
              className="btn comment-submit"
              onClick={() => addComment(newCommentText)}
              disabled={!newCommentText.trim() || !!replyingTo}
            >
              Post
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .diagram-studio {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 60px);
          background: var(--bg);
        }

        .diagram-toolbar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--panel);
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
        }

        .toolbar-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.15s ease;
        }

        .toolbar-btn:hover:not(:disabled) {
          background: var(--accent-soft);
          border-color: var(--accent);
        }

        .toolbar-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .toolbar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: var(--border);
          margin: 0 4px;
        }

        .toolbar-spacer {
          flex: 1;
        }

        .diagram-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .diagram-toolbox {
          width: 220px;
          min-width: 220px;
          background: var(--panel);
          border-right: 1px solid var(--border);
          overflow-y: auto;
          padding: 12px 0;
        }

        .toolbox-section {
          padding: 0 12px;
          margin-bottom: 16px;
        }

        .toolbox-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          padding: 8px 0;
          margin-bottom: 4px;
        }

        .toolbox-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 10px;
          border: none;
          border-left: 3px solid transparent;
          background: transparent;
          color: var(--text);
          border-radius: 0 6px 6px 0;
          cursor: pointer;
          font-size: 12px;
          text-align: left;
          transition: all 0.15s ease;
        }

        .toolbox-item:hover {
          background: var(--accent-soft);
        }

        .toolbox-item.active {
          background: var(--accent);
          color: white;
        }

        .toolbox-item.selected-rel {
          background: var(--accent-soft);
          border-left-color: var(--accent);
        }

        .toolbox-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          color: #1e293b;
        }

        .toolbox-rel-line {
          width: 24px;
          height: 0;
          border-top-width: 2px;
        }

        .toolbox-label {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .diagram-canvas {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .canvas-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--panel);
        }

        .diagram-title-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          outline: none;
        }

        .connection-hint {
          font-size: 12px;
          color: var(--accent);
          padding: 4px 12px;
          background: var(--accent-soft);
          border-radius: 999px;
        }

        .canvas-container {
          flex: 1;
          position: relative;
        }

        .diagram-properties {
          width: 280px;
          min-width: 280px;
          background: var(--panel);
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
        }

        .properties-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          font-weight: 600;
        }

        .icon-btn-sm {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          border-radius: 6px;
          cursor: pointer;
        }

        .icon-btn-sm:hover {
          background: var(--accent-soft);
          color: var(--text);
        }

        .properties-content {
          padding: 16px;
          overflow-y: auto;
        }

        .properties-empty {
          padding: 24px 16px;
          text-align: center;
          color: var(--text-muted);
        }

        .properties-empty .hint {
          font-size: 12px;
          margin-top: 8px;
        }

        .prop-group {
          margin-bottom: 16px;
        }

        .prop-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .prop-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--input-bg);
          color: var(--text);
          font-size: 13px;
        }

        .prop-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .prop-textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--input-bg);
          color: var(--text);
          font-size: 13px;
          resize: vertical;
          min-height: 60px;
        }

        .prop-textarea:focus {
          outline: none;
          border-color: var(--accent);
        }

        .text-style-controls {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .font-size-select {
          width: 70px;
          padding: 6px 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 12px;
        }

        .text-style-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          cursor: pointer;
          font-size: 14px;
          transition: all 0.15s ease;
        }

        .text-style-btn:hover {
          background: var(--accent-soft);
          border-color: var(--accent);
        }

        .text-style-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .color-input {
          width: 40px;
          height: 32px;
          padding: 2px;
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          background: var(--bg);
        }

        .color-input.small {
          width: 28px;
          height: 28px;
        }

        .color-picker-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .color-text {
          flex: 1;
          padding: 6px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 13px;
          font-family: monospace;
        }

        .size-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .size-input-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .size-input-group label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .size-input-group input {
          width: 60px;
          padding: 6px 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 13px;
        }

        .size-separator {
          color: var(--text-muted);
          font-size: 14px;
        }

        .btn-sm {
          padding: 8px 12px;
          font-size: 13px;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .diagram-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 300px;
          overflow-y: auto;
        }

        .diagram-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .diagram-list-item:hover {
          background: var(--accent-soft);
          border-color: var(--accent);
        }

        .diagram-list-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .diagram-list-name {
          font-weight: 500;
          color: var(--text);
        }

        .diagram-list-date {
          font-size: 12px;
          color: var(--text-muted);
        }

        .comment-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 600;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        .comments-panel {
          position: fixed;
          right: 16px;
          top: 130px;
          width: 340px;
          max-height: calc(100vh - 180px);
          background: var(--panel);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          z-index: 100;
          border: 1px solid var(--border);
        }

        .comments-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
        }

        .comments-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .comments-close {
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 20px;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .comments-close:hover {
          background: var(--accent-soft);
          color: var(--text);
        }

        .comments-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

        .comments-empty {
          text-align: center;
          padding: 32px 16px;
          color: var(--text-muted);
        }

        .comments-empty-icon {
          font-size: 32px;
          display: block;
          margin-bottom: 8px;
        }

        .comments-empty p {
          margin: 4px 0;
        }

        .comments-empty-hint {
          font-size: 12px;
        }

        .comment-thread {
          margin-bottom: 16px;
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .comment-thread.resolved {
          opacity: 0.6;
        }

        .comment-item {
          padding: 12px;
          background: var(--bg);
        }

        .comment-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .comment-author {
          font-weight: 600;
          font-size: 13px;
          color: var(--text);
        }

        .comment-time {
          font-size: 11px;
          color: var(--text-muted);
        }

        .comment-body {
          font-size: 13px;
          line-height: 1.5;
          color: var(--text);
          margin-bottom: 8px;
        }

        .comment-mention {
          color: var(--accent);
          font-weight: 500;
          background: var(--accent-soft);
          padding: 1px 4px;
          border-radius: 4px;
        }

        .comment-actions {
          display: flex;
          gap: 8px;
        }

        .comment-actions button {
          padding: 4px 8px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          border-radius: 4px;
        }

        .comment-actions button:hover {
          background: var(--accent-soft);
          color: var(--text);
        }

        .comment-reply {
          padding: 10px 12px 10px 24px;
          background: var(--panel);
          border-top: 1px solid var(--border);
        }

        .comment-reply-input {
          padding: 10px 12px;
          background: var(--panel);
          border-top: 1px solid var(--border);
        }

        .comment-reply-input input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 13px;
          margin-bottom: 8px;
        }

        .comment-reply-input input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .comment-reply-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .comment-input-container {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid var(--border);
          background: var(--bg);
        }

        .comment-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--panel);
          color: var(--text);
          font-size: 13px;
        }

        .comment-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .comment-input:disabled {
          opacity: 0.5;
        }

        .comment-submit {
          padding: 8px 16px;
        }

        .comment-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-small {
          padding: 6px 12px;
          font-size: 12px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          border-radius: 6px;
          cursor: pointer;
        }

        .btn-small.btn {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .btn-small:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}
