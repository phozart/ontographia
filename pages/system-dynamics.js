// pages/system-dynamics.js
// System Dynamics Studio - Causal Loop Diagrams & Stock-Flow Diagrams
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../components/AuthContext';
import { useDomains } from '../components/DomainContext';
import { useNotifications } from '../components/NotificationContext';
import { usePresence, PresenceIndicator } from '../components/PresenceContext';
import { SYSTEM_DYNAMICS_TEMPLATES, TemplatePickerModal } from '../components/DiagramTemplates';
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
import LoopIcon from '@mui/icons-material/Loop';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import LabelIcon from '@mui/icons-material/Label';
import ScienceIcon from '@mui/icons-material/Science';
import HistoryIcon from '@mui/icons-material/History';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SettingsIcon from '@mui/icons-material/Settings';

// Import new SD components (EPIC 1 & 2)
import {
  SDLayers,
  useSDLayers,
  SDMiniMap,
  SDLoopInspector,
  detectFeedbackLoops,
  SDVisualFilters,
  useVisualFilters,
  SDCognitiveMarkers,
  useCognitiveMarkers,
  MarkerSelector,
  SDSubsystemHighlight,
  useSubsystemHighlight,
  getSubsystemStyles,
  SDModelHealth,
  useModelHealth,
  // EPIC 3-7 components
  SDAutoLayout,
  useAutoLayout,
  SDFormulaEditor,
  SDPresentationMode,
  getPresentationStyles,
  SDDomainTags,
  useDomainTags,
  SDAnnotations,
  useAnnotations,
  AnnotationToolbar,
  AnnotationStyleEditor,
  SDInsightMarkers,
  useInsightMarkers,
  InsightMarkerPanel,
  SDStoryBuilder,
  useStoryBuilder,
  SDSimulationConfig,
  useSimulationConfig,
  SDVersioning,
  useVersioning,
  // Right Toolbar
  SDRightToolbar,
  useRightToolbar,
} from '../components/sd';

const CytoscapeComponent = dynamic(() => import('react-cytoscapejs'), { ssr: false });

// Generate unique comment ID
const generateCommentId = () => `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Element type definitions for CLD
const CLD_ELEMENTS = {
  variable: {
    id: 'variable',
    name: 'Variable',
    description: 'A system variable that can increase or decrease',
    shape: 'ellipse',
    color: '#6366f1',
    icon: 'V',
  },
};

// Element type definitions for Stock & Flow
const STOCK_FLOW_ELEMENTS = {
  stock: {
    id: 'stock',
    name: 'Stock',
    description: 'Accumulation - level that persists over time',
    shape: 'rectangle',
    color: '#8b5cf6',
    icon: '▭',
  },
  flow: {
    id: 'flow',
    name: 'Flow',
    description: 'Rate of change - fills or drains stocks',
    shape: 'round-rectangle',
    color: '#10b981',
    icon: '⟿',
  },
  converter: {
    id: 'converter',
    name: 'Aux',
    description: 'Auxiliary variable - transforms information',
    shape: 'ellipse',
    color: '#f59e0b',
    icon: '◯',
  },
  cloud: {
    id: 'cloud',
    name: 'Cloud',
    description: 'Source/Sink - boundary of system',
    shape: 'ellipse',
    color: '#94a3b8',
    icon: '☁',
  },
  parameter: {
    id: 'parameter',
    name: 'Param',
    description: 'Constant or parameter that defines formulas',
    shape: 'round-rectangle',
    color: '#f97316',
    icon: 'π',
  },
  note: {
    id: 'note',
    name: 'Note',
    description: 'Annotation text or comment',
    shape: 'round-rectangle',
    color: '#facc15',
    icon: '✎',
  },
};

// Connection types for CLD
const CLD_CONNECTIONS = {
  positive: {
    id: 'positive',
    name: 'Positive',
    description: 'Same direction change - when A increases, B increases',
    color: '#22c55e',
    lineStyle: 'solid',
    label: '+',
    polaritySymbol: '+',
    icon: '→+',
  },
  negative: {
    id: 'negative',
    name: 'Negative',
    description: 'Opposite direction change - when A increases, B decreases',
    color: '#ef4444',
    lineStyle: 'dashed',
    label: '-',
    polaritySymbol: '-',
    icon: '→−',
  },
};

// Connection types for Stock & Flow
const STOCK_FLOW_CONNECTIONS = {
  flow_pipe: {
    id: 'flow_pipe',
    name: 'Flow',
    description: 'Material flow between stock and flow',
    color: '#8b5cf6',
    lineStyle: 'solid',
    width: 4,
    icon: '⇒',
  },
  connector: {
    id: 'connector',
    name: 'Info Link',
    description: 'Information link - influences but does not transfer material',
    color: '#6b7280',
    lineStyle: 'dashed',
    width: 2,
    icon: '⟶',
  },
};

// Diagram mode definitions
const DIAGRAM_MODES = {
  cld: { id: 'cld', name: 'Causal Loop', description: 'Build causal loop diagrams' },
  stockFlow: { id: 'stockFlow', name: 'Stock & Flow', description: 'Build stock-flow diagrams' },
};

const ELEMENT_GROUPS = [
  { id: 'cld', title: 'CLD Variables', items: CLD_ELEMENTS, mode: 'cld' },
  { id: 'stock-flow', title: 'Stock-Flow', items: STOCK_FLOW_ELEMENTS, mode: 'stockFlow' },
];

const CONNECTION_GROUPS = [
  { id: 'cld', title: 'Causal Links', items: CLD_CONNECTIONS, mode: 'cld' },
  { id: 'stock-flow', title: 'S&F Connectors', items: STOCK_FLOW_CONNECTIONS, mode: 'stockFlow' },
];

const ALL_ELEMENTS = { ...CLD_ELEMENTS, ...STOCK_FLOW_ELEMENTS };
const ALL_CONNECTIONS = { ...CLD_CONNECTIONS, ...STOCK_FLOW_CONNECTIONS };
const ANCHOR_OPTIONS = ['auto', 'top', 'right', 'bottom', 'left'];
const ELEMENT_SHORTCUTS = {
  c: 'variable',
  v: 'variable',
  s: 'stock',
  f: 'flow',
  a: 'converter',
  p: 'parameter',
  t: 'note',
  k: 'cloud',
};
const ELEMENT_SHORTCUT_LABELS = {
  variable: 'C',
  stock: 'S',
  flow: 'F',
  converter: 'A',
  parameter: 'P',
  note: 'T',
  cloud: 'K',
};
const CONNECTION_SHORTCUTS = {
  p: 'positive',  // P for Plus/Positive
  '+': 'positive', // + key
  o: 'positive',   // Legacy
  m: 'negative',   // M for Minus/Negative
  '-': 'negative', // - key
  n: 'negative',   // Legacy
  l: 'flow_pipe',
  x: 'connector',
};
const CONNECTION_SHORTCUT_LABELS = {
  positive: 'P',
  negative: 'M',
  flow_pipe: 'L',
  connector: 'X',
};
const FONT_OPTIONS = ['Inter', 'Roboto', 'Arial', 'Georgia', 'Courier New'];
const CONTEXT_MENU_TYPES = ['variable', 'stock', 'flow', 'converter', 'parameter', 'note'];

const getCurveConfig = (mode, distance) => {
  if (mode === 'straight') {
    return {
      curveStyle: 'straight',
      controlPointDistances: [],
      controlPointWeights: [],
      curveDistance: 0,
    };
  }
  const style = mode === 'bezier' ? 'bezier' : 'unbundled-bezier';
  const distances = style === 'unbundled-bezier' ? [distance, -distance] : [];
  return {
    curveStyle: style,
    controlPointDistances: distances,
    controlPointWeights: distances.length ? [0.35, 0.65] : [],
    curveDistance: style === 'unbundled-bezier' ? distance : 0,
    sourceEndpoint: 'auto',
    targetEndpoint: 'auto',
  };
};

// Generate unique ID
const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Get default size for element type
const getDefaultSize = (type) => {
  const sizes = {
    variable: { width: 100, height: 50 },
    stock: { width: 100, height: 60 },
    flow: { width: 80, height: 40 },
    converter: { width: 60, height: 60 },
    cloud: { width: 70, height: 50 },
    parameter: { width: 90, height: 40 },
    note: { width: 140, height: 50 },
  };
  return sizes[type] || { width: 80, height: 50 };
};

export default function SystemDynamicsStudio() {
  const { user, role } = useAuth();
  const { activeDomain } = useDomains();
  const { notifyMentions } = useNotifications();
  const { joinPage, leavePage } = usePresence();
  const cyRef = useRef(null);
  const containerRef = useRef(null);

  // Diagram state
  const [elements, setElements] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);

  // Tool state
  const [activeTool, setActiveTool] = useState('select'); // 'select', 'add-element', 'add-connection'
  const [activeElementType, setActiveElementType] = useState(null);
  const [activeConnectionType, setActiveConnectionType] = useState(null);
  const [connectionSource, setConnectionSource] = useState(null);
  const [curveMode, setCurveMode] = useState('bow'); // 'bow', 'bezier', 'straight'
  const [curveDistance, setCurveDistance] = useState(80);
  const [diagramMode, setDiagramMode] = useState('cld'); // 'cld' or 'stockFlow'
  const [quickConnectMode, setQuickConnectMode] = useState(false); // Fast connection drawing
  const [toolboxCollapsed, setToolboxCollapsed] = useState({ elements: false, connections: false, advanced: true });

  // UI state
  const [diagramId, setDiagramId] = useState(null);
  const [diagramName, setDiagramName] = useState('Untitled Diagram');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedDiagrams, setSavedDiagrams] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);

  // Inline editing state
  const [editingElement, setEditingElement] = useState(null); // { id, label, position }
  const inlineInputRef = useRef(null);

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Theme
  const [themeDark, setThemeDark] = useState(false);
  const [pathBuilding, setPathBuilding] = useState(false);
  const [pathNodes, setPathNodes] = useState([]);
  const [pathConnectionIds, setPathConnectionIds] = useState([]);
  const [storyText, setStoryText] = useState('');
  const [scenarioName, setScenarioName] = useState('Current scenario');
  const [scenarioNotes, setScenarioNotes] = useState('');
  const [contextMenu, setContextMenu] = useState(null);

  // Comments state
  const [comments, setComments] = useState([]);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  // Template state
  const [showTemplatesPicker, setShowTemplatesPicker] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Clipboard for copy/paste
  const [clipboard, setClipboard] = useState(null);

  // New EPIC 1 & 2 component states
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showLoopInspector, setShowLoopInspector] = useState(false);
  const [showModelHealth, setShowModelHealth] = useState(false);
  const [layersCollapsed, setLayersCollapsed] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);
  const [markersCollapsed, setMarkersCollapsed] = useState(true);
  const [subsystemCollapsed, setSubsystemCollapsed] = useState(true);

  // New EPIC 3-7 component states
  const [showAutoLayout, setShowAutoLayout] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);
  const [showDomainTags, setShowDomainTags] = useState(false);
  const [showStoryBuilder, setShowStoryBuilder] = useState(false);
  const [showSimulationConfig, setShowSimulationConfig] = useState(false);
  const [showVersioning, setShowVersioning] = useState(false);
  const [showInsightMarkers, setShowInsightMarkers] = useState(false);
  const [annotationToolActive, setAnnotationToolActive] = useState(null);
  const [editingAnnotationId, setEditingAnnotationId] = useState(null);

  // Right Toolbar state
  const {
    isOpen: toolbarOpen,
    activeTab: toolbarTab,
    toggle: toggleToolbar,
    open: openToolbar,
    close: closeToolbar,
    changeTab: setToolbarTab,
    setIsOpen: setToolbarOpen,
  } = useRightToolbar(null);

  // Use custom hooks from sd components
  const {
    layerVisibility,
    toggleLayer,
    showAllLayers,
    hideAllLayers,
    isElementVisible,
  } = useSDLayers();

  const {
    filters: visualFilters,
    toggleFilter: toggleVisualFilter,
    resetFilters: resetVisualFilters,
  } = useVisualFilters();

  // EPIC 3-7 hooks
  const {
    applyTidyLayout,
    applyAlignment,
    applyDistribution,
  } = useAutoLayout(elements, connections, setElements, cyRef, () => saveToHistory());

  const {
    domainTags,
    setDomainTags,
    availableTags,
    addTagToElement,
    removeTagFromElement,
    createTag,
    deleteTag,
    getTagsForElement,
    filterByTag,
    clearTagFilter,
    activeTagFilter,
  } = useDomainTags([]);

  const {
    annotations,
    setAnnotations,
    selectedAnnotationId,
    setSelectedAnnotationId,
    selectedAnnotation,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    updateAnnotationStyle,
    moveAnnotation,
    resizeAnnotation,
  } = useAnnotations([]);

  const {
    insightMarkers,
    setInsightMarkers,
    selectedInsightId,
    setSelectedInsightId,
    addInsightMarker,
    deleteInsightMarker,
    getMarkersForElement,
  } = useInsightMarkers([]);

  const {
    storySteps,
    setStorySteps,
    selectedStepId,
    setSelectedStepId,
    editingStepId,
    setEditingStepId,
    addStep: addStoryStep,
    updateStep: updateStoryStep,
    deleteStep: deleteStoryStep,
    duplicateStep: duplicateStoryStep,
    reorderSteps,
  } = useStoryBuilder([]);

  const {
    config: simConfig,
    updateConfig: updateSimConfig,
    resetConfig: resetSimConfig,
  } = useSimulationConfig();

  const {
    versions,
    scenarios,
    activeScenarioId,
    activeScenario,
    saveVersion,
    deleteVersion,
    restoreVersion,
    updateVersion,
    toggleBookmark,
    createNewScenario,
    deleteScenario,
    updateScenario,
    activateScenario,
    deactivateScenario,
  } = useVersioning([], []);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.entries(visualFilters).filter(([key, val]) => {
      if (key === 'showPolarity' || key === 'showDelays') return !val;
      return val;
    }).length;
  }, [visualFilters]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setThemeDark(document.documentElement.dataset.theme === 'dark');
      const observer = new MutationObserver(() => {
        setThemeDark(document.documentElement.dataset.theme === 'dark');
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      return () => observer.disconnect();
    }
  }, []);

  // Presence tracking
  useEffect(() => {
    joinPage('system-dynamics', diagramId);
    return () => leavePage();
  }, [joinPage, leavePage, diagramId]);

  const elementMap = useMemo(() => {
    const map = new Map();
    elements.forEach(el => map.set(el.id, el));
    return map;
  }, [elements]);

  const { flowWarnings, invalidFlowEdgeIds } = useMemo(() => {
    const warnings = [];

    const invalidEdges = new Set();



    const markInvalid = (conn, message) => {

      invalidEdges.add(conn.id);

      warnings.push(message);

    };



    connections.forEach(conn => {

      if (conn.type === 'flow_pipe') {

        const sourceType = elementMap.get(conn.source)?.type;

        const targetType = elementMap.get(conn.target)?.type;

        if (!(sourceType === 'stock' || targetType === 'stock')) {

          markInvalid(conn, `Flow link "${conn.label || conn.id}" should connect to a stock node.`);

        }

      }

    });



    const flows = elements.filter(el => el.type === 'flow');

    flows.forEach(flow => {

      const connectedFlowPipes = connections.filter(conn =>

        conn.type === 'flow_pipe' && (conn.source === flow.id || conn.target === flow.id)

      );



      const touchesStock = connectedFlowPipes.some(conn =>

        (conn.source === flow.id && elementMap.get(conn.target)?.type === 'stock') ||

        (conn.target === flow.id && elementMap.get(conn.source)?.type === 'stock')

      );



      if (!touchesStock) {

        connectedFlowPipes.forEach(conn => invalidEdges.add(conn.id));

        warnings.push(`Flow "${flow.label || flow.name}" needs at least one stock connection.`);

      }



      if (connectedFlowPipes.length === 0) {

        warnings.push(`Flow "${flow.label || flow.name}" has no flow pipes yet.`);

      }

    });



    return { flowWarnings: [...new Set(warnings)], invalidFlowEdgeIds: invalidEdges };
  }, [connections, elements]);


  // Get current element/connection list for Cytoscape
  // Convert elements to Cytoscape format
  const cyElements = useMemo(() => {
    const pathNodeSet = new Set(pathNodes.map(node => node.id));
    const pathEdgeSet = new Set(pathConnectionIds);

    const nodes = elements.map(el => {
      const nodeClasses = [el.type];
      if (pathNodeSet.has(el.id)) nodeClasses.push('path-node');
      return {
        data: {
          id: el.id,
          label: el.label || el.name,
          type: el.type,
          ...el,
        },
        position: el.position || { x: 200, y: 200 },
        classes: nodeClasses.filter(Boolean),
      };
    });

    const edges = connections.map(conn => {
      const hasDelay = !!conn.properties?.hasDelay;
      const labelParts = [];
      if (conn.label) labelParts.push(conn.label);
      if (conn.polaritySymbol) labelParts.push(conn.polaritySymbol);
      const autoLabel = labelParts.join(' ');
      const baseLabel = (conn.displayLabel && conn.displayLabel.trim()) || autoLabel;
      const displayLabel = hasDelay ? `${baseLabel}${baseLabel ? ' ' : ''}⏱` : baseLabel;

      const edgeClasses = [conn.type];
      if (pathEdgeSet.has(conn.id)) edgeClasses.push('path-edge');
      if (invalidFlowEdgeIds.has(conn.id)) edgeClasses.push('invalid-flow');
      if (hasDelay) edgeClasses.push('delay-edge');

      // Determine curve style and control points with safe defaults
      const curveStyle = conn.curveStyle || 'bezier';
      let controlPointDistances = [];
      let controlPointWeights = [];

      // Only set control points for unbundled-bezier, and ensure they have valid values
      if (curveStyle === 'unbundled-bezier') {
        controlPointDistances = Array.isArray(conn.controlPointDistances) && conn.controlPointDistances.length > 0
          ? conn.controlPointDistances
          : [40, -40];
        controlPointWeights = Array.isArray(conn.controlPointWeights) && conn.controlPointWeights.length > 0
          ? conn.controlPointWeights
          : [0.35, 0.65];
      }

      return {
        data: {
          id: conn.id,
          source: conn.source,
          target: conn.target,
          label: conn.label || '',
          displayLabel,
          type: conn.type,
          curveStyle,
          controlPointDistances,
          controlPointWeights,
          polaritySymbol: conn.polaritySymbol || '',
          hasDelay,
        },
        classes: edgeClasses.filter(Boolean),
      };
    });

    return [...nodes, ...edges];
  }, [elements, connections, pathNodes, pathConnectionIds, invalidFlowEdgeIds]);

  // Cytoscape stylesheet
  const equationHint = useMemo(() => {
    if (!selectedElement) return '';
    const getLabel = (id) => {
      const el = elementMap.get(id);
      return el ? (el.label || el.name) : null;
    };

    const label = selectedElement.label || selectedElement.name || 'Element';
    if (selectedElement.type === 'stock') {
      const incoming = connections
        .filter(conn => conn.type === 'flow_pipe' && conn.target === selectedElement.id)
        .map(conn => getLabel(conn.source))
        .filter(Boolean);
      const outgoing = connections
        .filter(conn => conn.type === 'flow_pipe' && conn.source === selectedElement.id)
        .map(conn => getLabel(conn.target))
        .filter(Boolean);
      const inflow = incoming.length ? incoming.join(' + ') : 'inflows';
      const outflow = outgoing.length ? outgoing.join(' + ') : 'outflows';
      return `d${label}/dt = ${inflow} - ${outflow}`;
    }

    if (selectedElement.type === 'flow') {
      const fromStocks = connections
        .filter(conn => conn.type === 'flow_pipe' && conn.source === selectedElement.id && elementMap.get(conn.target)?.type === 'stock')
        .map(conn => getLabel(conn.target))
        .filter(Boolean);
      const toStocks = connections
        .filter(conn => conn.type === 'flow_pipe' && conn.target === selectedElement.id && elementMap.get(conn.source)?.type === 'stock')
        .map(conn => getLabel(conn.source))
        .filter(Boolean);
      const fromLabel = fromStocks.length ? fromStocks.join(', ') : 'a stock';
      const toLabel = toStocks.length ? toStocks.join(', ') : 'a stock';
      return `Flow ${label} moves from ${fromLabel} to ${toLabel}.`;
    }

    return '';
  }, [selectedElement, connections, elementMap]);

  const stylesheet = useMemo(() => {
    // Build dynamic styles for elements with custom properties
    const dynamicNodeStyles = elements
      .filter(el => el.bgColor || el.opacity !== undefined || el.hideBorder || el.width || el.height || el.fontSize || el.fontWeight || el.fontStyle || el.textColor)
      .map(el => ({
        selector: `node[id="${el.id}"]`,
        style: {
          ...(el.bgColor ? { 'background-color': el.bgColor } : {}),
          ...(el.opacity !== undefined ? { 'background-opacity': el.opacity / 100 } : {}),
          ...(el.hideBorder ? { 'border-width': 0 } : {}),
          ...(el.width ? { width: el.width } : {}),
          ...(el.height ? { height: el.height } : {}),
          ...(el.fontSize ? { 'font-size': el.fontSize } : {}),
          ...(el.fontWeight ? { 'font-weight': el.fontWeight } : {}),
          ...(el.fontStyle ? { 'font-style': el.fontStyle } : {}),
          ...(el.fontFamily ? { 'font-family': el.fontFamily } : {}),
          ...(el.textColor ? { 'color': el.textColor } : {}),
        },
      }));

    const baseStyles = [
      // Base node style
      {
        selector: 'node',
        style: {
          label: 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': 12,
          'font-weight': 500,
          color: themeDark ? '#e5e7eb' : '#1f2937',
          'text-wrap': 'wrap',
          'text-max-width': 80,
          width: 80,
          height: 50,
          'border-width': 2,
          'font-family': 'Inter, system-ui',
          'transition-property': 'background-color, border-color, width, height, background-opacity, border-width',
          'transition-duration': '0.2s',
        },
      },
      // Selected node
      {
        selector: 'node:selected',
        style: {
          'border-color': '#6366f1',
          'border-width': 3,
          'shadow-blur': 10,
          'shadow-color': '#6366f1',
          'shadow-opacity': 0.5,
        },
      },
      // CLD Variable - borderless and transparent by default
      {
        selector: 'node.variable',
        style: {
          shape: 'ellipse',
          'background-color': 'transparent',
          'background-opacity': 0,
          'border-width': 0,
          width: 100,
          height: 50,
          color: themeDark ? '#e5e7eb' : '#1f2937',
        },
      },
      // Stock
      {
        selector: 'node.stock',
        style: {
          shape: 'rectangle',
          'background-color': themeDark ? '#a78bfa' : '#8b5cf6',
          'border-color': themeDark ? '#8b5cf6' : '#7c3aed',
          width: 100,
          height: 60,
        },
      },
      // Flow
      {
        selector: 'node.flow',
        style: {
          shape: 'round-rectangle',
          'background-color': themeDark ? '#34d399' : '#10b981',
          'border-color': themeDark ? '#10b981' : '#059669',
          width: 80,
          height: 40,
        },
      },
      // Converter
      {
        selector: 'node.converter',
        style: {
          shape: 'ellipse',
          'background-color': themeDark ? '#fbbf24' : '#f59e0b',
          'border-color': themeDark ? '#f59e0b' : '#d97706',
          width: 60,
          height: 60,
        },
      },
      // Cloud
      {
        selector: 'node.cloud',
        style: {
          shape: 'ellipse',
          'background-color': themeDark ? '#cbd5e1' : '#94a3b8',
          'border-color': themeDark ? '#94a3b8' : '#64748b',
          'border-style': 'dashed',
          width: 70,
          height: 50,
          'background-opacity': 0.5,
        },
      },
      // Path node highlight
      {
        selector: 'node.path-node',
        style: {
          'border-color': '#f97316',
          'border-width': 4,
          'shadow-blur': 12,
          'shadow-color': '#f97316',
          'shadow-opacity': 0.45,
        },
      },
      // Base edge style
      {
        selector: 'edge',
        style: {
          width: 2,
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'arrow-scale': 1.2,
          'line-color': themeDark ? '#9ca3af' : '#6b7280',
          'target-arrow-color': themeDark ? '#9ca3af' : '#6b7280',
          label: 'data(displayLabel)',
          'font-size': 14,
          'font-weight': 700,
          'text-background-color': themeDark ? '#1f2937' : '#ffffff',
          'text-background-opacity': 0.9,
          'text-background-padding': '3px',
        },
      },
      // Straight edges
      {
        selector: 'edge[curveStyle="straight"]',
        style: {
          'curve-style': 'straight',
        },
      },
      // Unbundled bezier edges
      {
        selector: 'edge[curveStyle="unbundled-bezier"]',
        style: {
          'curve-style': 'unbundled-bezier',
          'control-point-distances': 'data(controlPointDistances)',
          'control-point-weights': 'data(controlPointWeights)',
        },
      },
      {
        selector: 'edge.path-edge',
        style: {
          'line-color': themeDark ? '#a5b4fc' : '#6366f1',
          'target-arrow-color': themeDark ? '#a5b4fc' : '#6366f1',
          width: 4,
        },
      },
      {
        selector: 'edge.invalid-flow',
        style: {
          'line-color': '#f87171',
          'target-arrow-color': '#f87171',
          'line-style': 'dotted',
          width: 3,
        },
      },
      {
        selector: 'edge.delay-edge',
        style: {
          'line-color': '#f97316',
          'line-style': 'dashed',
          'line-dash-pattern': [6, 3],
          'target-arrow-color': '#f97316',
          'text-margin-y': -8,
        },
      },
      // Selected edge
      {
        selector: 'edge:selected',
        style: {
          width: 4,
          'line-color': '#6366f1',
          'target-arrow-color': '#6366f1',
        },
      },
      // Positive causal link
      {
        selector: 'edge.positive',
        style: {
          'line-color': '#22c55e',
          'target-arrow-color': '#22c55e',
          color: '#22c55e',
        },
      },
      // Negative causal link
      {
        selector: 'edge.negative',
        style: {
          'line-color': '#ef4444',
          'target-arrow-color': '#ef4444',
          'line-style': 'dashed',
          color: '#ef4444',
        },
      },
      // Flow pipe
      {
        selector: 'edge.flow_pipe',
        style: {
          width: 5,
          'line-color': '#8b5cf6',
          'target-arrow-color': '#8b5cf6',
          'target-arrow-shape': 'triangle',
        },
      },
      // Connector (information link)
      {
        selector: 'edge.connector',
        style: {
          width: 2,
          'line-style': 'dashed',
          'line-color': '#6b7280',
          'target-arrow-color': '#6b7280',
          'target-arrow-shape': 'vee',
        },
      },
    ];

    return [...baseStyles, ...dynamicNodeStyles];
  }, [themeDark, elements]);

  // Save to history
  const saveToHistory = useCallback(() => {
    const state = { elements: [...elements], connections: [...connections] };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setIsDirty(true);
  }, [elements, connections, history, historyIndex]);

  const createElement = useCallback((type, position = { x: 200, y: 200 }) => {
    const typeConfig = ALL_ELEMENTS[type];
    if (!typeConfig) return null;

    const newElement = {
      id: generateId(),
      type,
      label: typeConfig.name,
      name: typeConfig.name,
      position: { x: position.x, y: position.y },
      properties: {},
    };

    setElements(prev => [...prev, newElement]);
    saveToHistory();
    return newElement;
  }, [saveToHistory]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setElements(prevState.elements);
      setConnections(prevState.connections);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setElements(nextState.elements);
      setConnections(nextState.connections);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Handle canvas click for adding elements
  const handleCanvasClick = useCallback((evt) => {
    if (activeTool === 'add-element' && activeElementType) {
      const pos = evt.position || evt.renderedPosition;
      createElement(activeElementType, { x: pos.x, y: pos.y });
      setActiveTool('select');
      setActiveElementType(null);
    }
  }, [activeTool, activeElementType, createElement]);

  // Handle node click for connections
  const handleNodeClick = useCallback((evt) => {
    const nodeId = evt.target.id();

    if (activeTool === 'add-connection' && activeConnectionType) {
      if (!connectionSource) {
        setConnectionSource(nodeId);
        evt.target.addClass('connection-source');
      } else if (connectionSource !== nodeId) {
      const typeConfig = ALL_CONNECTIONS[activeConnectionType];

        const curveConfig = getCurveConfig(curveMode, curveDistance);
        const newConnection = {
          id: generateId(),
          type: activeConnectionType,
          source: connectionSource,
          target: nodeId,
          label: typeConfig.label || '',
          properties: {},
          ...curveConfig,
          curvePreset: 'auto',
          polaritySymbol: typeConfig.polaritySymbol || '',
          displayLabel: `${typeConfig.label || ''}${typeConfig.polaritySymbol ? ` ${typeConfig.polaritySymbol}` : ''}`,
        };

        setConnections(prev => [...prev, newConnection]);
        saveToHistory();

        // Clear connection selection state
        const cy = cyRef.current;
        if (cy) {
          cy.nodes().removeClass('connection-source');
        }
        setConnectionSource(null);
        setActiveTool('select');
        setActiveConnectionType(null);
      }
    } else {
      setSelectedElement(elements.find(el => el.id === nodeId) || null);
      setSelectedConnection(null);
      if (pathBuilding && buildPathFromRef.current) {
        buildPathFromRef.current(nodeId);
      }
    }
  }, [activeTool, activeConnectionType, connectionSource, elements, saveToHistory, pathBuilding]);

  // Handle edge click
  const handleEdgeClick = useCallback((evt) => {
    const edgeId = evt.target.id();
    setSelectedConnection(connections.find(c => c.id === edgeId) || null);
    setSelectedElement(null);
  }, [connections]);

  // Store refs to handlers to avoid stale closures
  const handleCanvasClickRef = useRef(handleCanvasClick);
  const handleNodeClickRef = useRef(handleNodeClick);
  const handleEdgeClickRef = useRef(handleEdgeClick);
  const buildPathFromRef = useRef(null);

  // Keep refs updated
  useEffect(() => {
    handleCanvasClickRef.current = handleCanvasClick;
  }, [handleCanvasClick]);

  useEffect(() => {
    handleNodeClickRef.current = handleNodeClick;
  }, [handleNodeClick]);

  useEffect(() => {
    handleEdgeClickRef.current = handleEdgeClick;
  }, [handleEdgeClick]);

  // Initialize Cytoscape - only runs once
  const handleCyReady = useCallback((cy) => {
    if (cyRef.current === cy) return; // Already initialized
    cyRef.current = cy;

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        handleCanvasClickRef.current(evt);
        setSelectedElement(null);
        setSelectedConnection(null);
      }
    });

    cy.on('cxttap', (evt) => {
      if (evt.target === cy) {
        const pos = evt.position || evt.renderedPosition;
        setContextMenu({
          position: { x: pos.x, y: pos.y },
          renderedPosition: evt.renderedPosition,
        });
      } else {
        setContextMenu(null);
      }
    });

    cy.on('tap', () => {
      setContextMenu(null);
    });

    cy.on('tap', 'node', (evt) => handleNodeClickRef.current(evt));
    cy.on('tap', 'edge', (evt) => handleEdgeClickRef.current(evt));

    // Double-click to edit label inline
    cy.on('dbltap', 'node', (evt) => {
      const node = evt.target;
      const nodeId = node.id();
      const renderedPos = node.renderedPosition();
      const label = node.data('label') || '';

      setEditingElement({
        id: nodeId,
        label: label,
        position: { x: renderedPos.x, y: renderedPos.y },
      });
    });

    // Update element positions when dragged
    cy.on('dragfree', 'node', (evt) => {
      const nodeId = evt.target.id();
      const newPos = evt.target.position();
      setElements(prev => prev.map(el =>
        el.id === nodeId ? { ...el, position: { x: newPos.x, y: newPos.y } } : el
      ));
      setIsDirty(true);
    });
  }, []);

  // Delete selected element
  const deleteSelected = useCallback(() => {
    if (selectedElement) {
      setElements(prev => prev.filter(el => el.id !== selectedElement.id));
      setConnections(prev => prev.filter(c => c.source !== selectedElement.id && c.target !== selectedElement.id));
      setSelectedElement(null);
      saveToHistory();
    } else if (selectedConnection) {
      setConnections(prev => prev.filter(c => c.id !== selectedConnection.id));
      setSelectedConnection(null);
      saveToHistory();
    }
  }, [selectedElement, selectedConnection, saveToHistory]);

  // Copy selected element
  const copySelected = useCallback(() => {
    if (!selectedElement) return;
    setClipboard({
      type: 'node',
      data: { ...selectedElement },
    });
  }, [selectedElement]);

  // Paste from clipboard
  const pasteElement = useCallback(() => {
    if (!clipboard || clipboard.type !== 'node') return;

    const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newElement = {
      ...clipboard.data,
      id: newId,
      label: `${clipboard.data.label || clipboard.data.type} (copy)`,
      x: clipboard.data.x + 30,
      y: clipboard.data.y + 30,
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
    saveToHistory();
  }, [clipboard, saveToHistory]);

  // Update element properties
  const updateElement = useCallback((id, updates) => {
    setElements(prev => prev.map(el =>
      el.id === id ? { ...el, ...updates } : el
    ));
    if (selectedElement?.id === id) {
      setSelectedElement(prev => ({ ...prev, ...updates }));
    }
    setIsDirty(true);
  }, [selectedElement]);

  // Update connection properties
  const updateConnection = useCallback((id, updates) => {
    setConnections(prev => prev.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
    if (selectedConnection?.id === id) {
      const merged = { ...selectedConnection, ...updates };
      if (updates.label || updates.polaritySymbol) {
        merged.displayLabel = `${merged.label || ''}${merged.polaritySymbol ? ` ${merged.polaritySymbol}` : ''}`;
      }
      setSelectedConnection(merged);
    }
    setIsDirty(true);
  }, [selectedConnection]);

  useEffect(() => {
    setConnections(prev => prev.map(conn => {
      if (conn.curvePreset === 'custom') return conn;
      const updated = { ...conn, ...getCurveConfig(curveMode, curveDistance), curvePreset: 'auto' };
      updated.displayLabel = `${updated.label || ''}${updated.polaritySymbol ? ` ${updated.polaritySymbol}` : ''}`;
      return updated;
    }));
  }, [curveMode, curveDistance]);

  // Save inline label edit
  const saveInlineEdit = useCallback(() => {
    if (editingElement) {
      updateElement(editingElement.id, { label: editingElement.label });
      setEditingElement(null);
    }
  }, [editingElement, updateElement]);

  // Cancel inline edit
  const cancelInlineEdit = useCallback(() => {
    setEditingElement(null);
  }, []);

  // Load diagrams list
  const loadDiagramsList = useCallback(async () => {
    if (!user || !role) return;
    try {
      const type = 'system-dynamics';
      const res = await fetch(`/api/diagrams?type=${type}`, {
        headers: { 'x-user': user, 'x-role': role },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedDiagrams(data);
      }
    } catch (err) {
      console.error('Failed to load diagrams', err);
    }
  }, [user, role]);

  // Save diagram
  const saveDiagram = useCallback(async (options = {}) => {
    try {
      const type = 'system-dynamics';
      const payload = {
        type,
        name: diagramName,
        elements,
        connections,
        settings: {
          scenarioName,
          scenarioNotes,
        },
        domainId: activeDomain || null,
      };

      const url = diagramId ? `/api/diagrams/${diagramId}` : '/api/diagrams';
      const method = diagramId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user': user,
          'x-role': role,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setDiagramId(data.id);
        setIsDirty(false);
        setShowSaveModal(false);
        if (!options.auto) {
          alert('Diagram saved successfully!');
        }
      } else {
        const err = await res.json();
        if (!options.auto) {
          alert(`Failed to save: ${err.error}`);
        }
      }
    } catch (err) {
      console.error('Failed to save diagram', err);
      alert('Failed to save diagram');
    }
  }, [diagramName, elements, connections, diagramId, activeDomain, scenarioName, scenarioNotes, user, role]);

  // Auto-save to localStorage for instant persistence (works even without login)
  useEffect(() => {
    if (elements.length === 0 && connections.length === 0) return;
    const autoSaveData = {
      elements,
      connections,
      diagramName,
      diagramId,
      diagramMode,
      scenarioName,
      scenarioNotes,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem('sd-autosave', JSON.stringify(autoSaveData));
      if (diagramId) {
        localStorage.setItem('sd-last-diagram-id', diagramId);
      }
    } catch (e) {
      console.warn('Failed to auto-save to localStorage', e);
    }
  }, [elements, connections, diagramName, diagramId, diagramMode, scenarioName, scenarioNotes]);

  // Auto-restore from localStorage on mount
  useEffect(() => {
    const restoreFromLocalStorage = () => {
      try {
        const saved = localStorage.getItem('sd-autosave');
        if (saved) {
          const data = JSON.parse(saved);
          if (data.elements?.length > 0 || data.connections?.length > 0) {
            setElements(data.elements || []);
            setConnections(data.connections || []);
            setDiagramName(data.diagramName || 'Untitled Diagram');
            setDiagramId(data.diagramId || null);
            setDiagramMode(data.diagramMode || 'cld');
            setScenarioName(data.scenarioName || 'Current scenario');
            setScenarioNotes(data.scenarioNotes || '');
            setHistory([{ elements: data.elements || [], connections: data.connections || [] }]);
            setHistoryIndex(0);
            setIsDirty(false);
            return true;
          }
        }
      } catch (e) {
        console.warn('Failed to restore from localStorage', e);
      }
      return false;
    };

    // Try to load last diagram from API first, fallback to localStorage
    const loadLastDiagram = async () => {
      if (!user || !role) {
        restoreFromLocalStorage();
        return;
      }

      const lastDiagramId = localStorage.getItem('sd-last-diagram-id');
      if (lastDiagramId) {
        try {
          const res = await fetch(`/api/diagrams/${lastDiagramId}`, {
            headers: { 'x-user': user, 'x-role': role },
          });
          if (res.ok) {
            const data = await res.json();
            setDiagramId(data.id);
            setDiagramName(data.name);
            setElements(data.elements || []);
            setConnections(data.connections || []);
            const settings = data.settings || {};
            setScenarioName(settings.scenarioName || 'Current scenario');
            setScenarioNotes(settings.scenarioNotes || '');
            setHistory([{ elements: data.elements || [], connections: data.connections || [] }]);
            setHistoryIndex(0);
            setIsDirty(false);
            return;
          }
        } catch (e) {
          console.warn('Failed to load last diagram from API', e);
        }
      }
      // Fallback to localStorage if API fails or no lastDiagramId
      restoreFromLocalStorage();
    };

    loadLastDiagram();
  }, [user, role]); // Only run on mount and when user/role changes

  // Auto-save to API whenever elements/connections change
  useEffect(() => {
    if (!user || !role) return undefined;
    if (!isDirty) return undefined;
    const timer = setTimeout(() => {
      if (!isDirty) return;
      saveDiagram({ auto: true });
    }, 1500);
    return () => clearTimeout(timer);
  }, [elements, connections, diagramName, isDirty, saveDiagram, user, role]);

  // Load diagram
  const loadDiagram = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/diagrams/${id}`, {
        headers: { 'x-user': user, 'x-role': role },
      });
      if (res.ok) {
        const data = await res.json();
        setDiagramId(data.id);
        setDiagramName(data.name);
        setElements(data.elements || []);
        const normalizedConnections = (data.connections || []).map(conn => ({
          ...conn,
          curvePreset: conn.curvePreset || 'auto',
        }));
        setConnections(normalizedConnections);
        const settings = data.settings || {};
        setScenarioName(settings.scenarioName || 'Current scenario');
        setScenarioNotes(settings.scenarioNotes || '');
        setPathNodes([]);
        setPathConnectionIds([]);
        setStoryText('');
        setPathBuilding(false);
        setIsDirty(false);
        setShowLoadModal(false);
        setHistory([{ elements: data.elements || [], connections: data.connections || [] }]);
        setHistoryIndex(0);
        // Store last diagram ID for auto-restore
        localStorage.setItem('sd-last-diagram-id', data.id);
      }
    } catch (err) {
      console.error('Failed to load diagram', err);
    }
  }, [user, role]);

  // Delete diagram
  const deleteDiagram = useCallback(async (id) => {
    if (!confirm('Delete this diagram?')) return;
    try {
      const res = await fetch(`/api/diagrams/${id}`, {
        method: 'DELETE',
        headers: { 'x-user': user, 'x-role': role },
      });
      if (res.ok) {
        loadDiagramsList();
        if (diagramId === id) {
          setDiagramId(null);
          setDiagramName('Untitled Diagram');
          setElements([]);
          setConnections([]);
        }
      }
    } catch (err) {
      console.error('Failed to delete diagram', err);
    }
  }, [diagramId, loadDiagramsList, user, role]);

  // Export as PNG
  const exportPNG = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const png = cy.png({ output: 'blob', bg: themeDark ? '#1f2937' : '#ffffff', scale: 2, full: true });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(png);
    link.download = `${diagramName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [diagramName, themeDark]);

  // Export as SVG
  const exportSVG = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const svg = cy.svg({ scale: 1, full: true, bg: themeDark ? '#1f2937' : '#ffffff' });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${diagramName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.svg`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [diagramName, themeDark]);

  // New diagram
  const newDiagram = useCallback((template = null) => {
    if (isDirty && !confirm('You have unsaved changes. Create a new diagram anyway?')) return;

    let initialElements = [];
    let initialConnections = [];

    // Apply template if provided
    if (template && template.elements?.length > 0) {
      const idMap = {};
      initialElements = template.elements.map(el => {
        const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        idMap[el.id] = newId;
        return {
          id: newId,
          type: el.type,
          label: el.label || el.type,
          x: el.x,
          y: el.y,
          width: el.width || 100,
          height: el.height || 50,
        };
      });

      if (template.connections?.length > 0) {
        initialConnections = template.connections.map(conn => ({
          id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          source: idMap[conn.source] || conn.source,
          target: idMap[conn.target] || conn.target,
          type: conn.type || 'positive',
          label: conn.label || '',
        }));
      }
    }

    setDiagramId(null);
    setDiagramName(template ? template.name : 'Untitled Diagram');
    setElements(initialElements);
    setConnections(initialConnections);
    setHistory([]);
    setHistoryIndex(-1);
    setIsDirty(false);
    setSelectedElement(null);
    setSelectedConnection(null);
    setScenarioName('Current scenario');
    setScenarioNotes('');
    setPathNodes([]);
    setPathConnectionIds([]);
    setStoryText('');
    setPathBuilding(false);
    setSelectedTemplate(null);
  }, [isDirty]);

  // Handle template selection
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowTemplatesPicker(false);
    newDiagram(template);
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
    notifyMentions(text, currentUserName, 'System Dynamics', '/system-dynamics');
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

      const key = e.key.toLowerCase();

      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        setShowSaveModal(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && key === 'c') {
        e.preventDefault();
        copySelected();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && key === 'v') {
        e.preventDefault();
        pasteElement();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
        return;
      }

      if (e.key === 'Escape') {
        setActiveTool('select');
        setActiveElementType(null);
        setActiveConnectionType(null);
        setConnectionSource(null);
        setQuickConnectMode(false);
        if (cyRef.current) {
          cyRef.current.nodes().removeClass('connection-source');
        }
        return;
      }

      // Mode-aware shortcuts: In CLD mode, P/M are for connections; in Stock-Flow, P is for parameter
      // Check connection shortcuts FIRST for CLD mode
      if (diagramMode === 'cld') {
        // CLD-specific: P for positive, M for negative
        if (key === 'p' || key === '+') {
          e.preventDefault();
          setActiveTool('add-connection');
          setActiveConnectionType('positive');
          setActiveElementType(null);
          setConnectionSource(null);
          return;
        }
        if (key === 'm' || key === '-' || key === 'n') {
          e.preventDefault();
          setActiveTool('add-connection');
          setActiveConnectionType('negative');
          setActiveElementType(null);
          setConnectionSource(null);
          return;
        }
        // V/C for variable in CLD mode
        if (key === 'v' || key === 'c') {
          e.preventDefault();
          setActiveTool('add-element');
          setActiveElementType('variable');
          setActiveConnectionType(null);
          return;
        }
      } else {
        // Stock-Flow mode: use standard element shortcuts
        const elementShortcut = ELEMENT_SHORTCUTS[key];
        if (elementShortcut) {
          e.preventDefault();
          setActiveTool('add-element');
          setActiveElementType(elementShortcut);
          setActiveConnectionType(null);
          return;
        }
        // Stock-Flow connection shortcuts (L for flow_pipe, X for connector)
        if (key === 'l') {
          e.preventDefault();
          setActiveTool('add-connection');
          setActiveConnectionType('flow_pipe');
          setActiveElementType(null);
          setConnectionSource(null);
          return;
        }
        if (key === 'x') {
          e.preventDefault();
          setActiveTool('add-connection');
          setActiveConnectionType('connector');
          setActiveElementType(null);
          setConnectionSource(null);
          return;
        }
      }

      if (key === 'q') {
        e.preventDefault();
        setActiveTool('select');
        setActiveElementType(null);
        setActiveConnectionType(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteSelected, copySelected, pasteElement, diagramMode]);

  // Detect feedback loops using the improved algorithm from SDLoopInspector
  const loops = useMemo(() => {
    return detectFeedbackLoops(elements, connections);
  }, [elements, connections]);

  // Model health validation
  const {
    issues: modelHealthIssues,
    errorCount: healthErrorCount,
    warningCount: healthWarningCount,
    infoCount: healthInfoCount,
    isHealthy: modelIsHealthy,
  } = useModelHealth(elements, connections, loops);

  // Subsystem highlight state for selected node
  const [subsystemSelectedNodeId, setSubsystemSelectedNodeId] = useState(null);
  const [subsystemHighlightEnabled, setSubsystemHighlightEnabled] = useState(false);
  const [showUpstream, setShowUpstream] = useState(true);
  const [showDownstream, setShowDownstream] = useState(true);

  // Cognitive markers
  const [showCognitiveMarkers, setShowCognitiveMarkers] = useState(true);

  const adjacency = useMemo(() => {
    const map = new Map();
    connections.forEach(conn => {
      if (!map.has(conn.source)) map.set(conn.source, []);
      map.get(conn.source).push(conn);
    });
    return map;
  }, [connections]);

  const buildPathFrom = useCallback((startId) => {
    const visited = new Set();
    const path = [];
    const connPath = [];

    const dfs = (nodeId) => {
      if (visited.has(nodeId) || path.length > 6) return;
      visited.add(nodeId);
      path.push(nodeId);
      const outgoing = adjacency.get(nodeId) || [];
      const next = outgoing.find(conn => conn.source === nodeId);
      if (!next) return;
      connPath.push(next.id);
      dfs(next.target);
    };

    dfs(startId);

    const nodes = path.map(id => elements.find(el => el.id === id)).filter(Boolean);
    setPathNodes(nodes);
    setPathConnectionIds(connPath);
    if (nodes.length === 0) {
      setStoryText('');
    } else {
      setStoryText(nodes.map((node, idx) => `${idx === 0 ? 'Start at' : 'Then'} ${node.label || node.name}`).join(' ➜ '));
    }
  }, [adjacency, elements]);

  // Keep buildPathFromRef updated
  useEffect(() => {
    buildPathFromRef.current = buildPathFrom;
  }, [buildPathFrom]);

  const contextMenuStyle = contextMenu
    ? {
        left: (contextMenu.renderedPosition?.x ?? 0) + 10,
        top: (contextMenu.renderedPosition?.y ?? 0) + 10,
      }
    : null;

  return (
    <div className="system-dynamics-studio">
      {/* Header - Streamlined */}
      <div className="sd-header">
        <div className="sd-header-left">
          <div className="sd-logo">
            <LoopIcon fontSize="small" />
            <span>SD Studio</span>
          </div>
          <div className="sd-divider" />
          <input
            type="text"
            className="sd-name-input"
            value={diagramName}
            onChange={e => { setDiagramName(e.target.value); setIsDirty(true); }}
            placeholder="Diagram name..."
          />
          {isDirty && <span className="unsaved-indicator" title="Unsaved changes">●</span>}
        </div>

        <div className="sd-header-center">
          {/* Diagram Mode Toggle */}
          <div className="sd-mode-toggle">
            <button
              className={`mode-btn ${diagramMode === 'cld' ? 'active' : ''}`}
              onClick={() => setDiagramMode('cld')}
              title="Causal Loop Diagram mode"
            >
              CLD
            </button>
            <button
              className={`mode-btn ${diagramMode === 'stockFlow' ? 'active' : ''}`}
              onClick={() => setDiagramMode('stockFlow')}
              title="Stock & Flow Diagram mode"
            >
              S&F
            </button>
          </div>
        </div>

        <div className="sd-header-right">
          {/* File Operations */}
          <div className="sd-btn-group" title="File operations">
            <button className="sd-btn" onClick={() => setShowTemplatesPicker(true)} title="New Diagram (Ctrl+N)">
              <AddIcon fontSize="small" />
            </button>
            <button className="sd-btn" onClick={() => { loadDiagramsList(); setShowLoadModal(true); }} title="Open (Ctrl+O)">
              <FolderOpenIcon fontSize="small" />
            </button>
            <button className="sd-btn" onClick={() => setShowSaveModal(true)} title="Save (Ctrl+S)">
              <SaveIcon fontSize="small" />
            </button>
          </div>
          <div className="sd-divider" />

          {/* Edit Operations */}
          <div className="sd-btn-group" title="Edit">
            <button className="sd-btn" onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
              <UndoIcon fontSize="small" />
            </button>
            <button className="sd-btn" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Shift+Z)">
              <RedoIcon fontSize="small" />
            </button>
          </div>
          <div className="sd-divider" />

          {/* Analysis Tools */}
          <div className="sd-btn-group" title="Analysis">
            <button
              className={`sd-btn ${toolbarOpen && toolbarTab === 'loops' ? 'active' : ''}`}
              onClick={() => openToolbar('loops')}
              title="Loop Inspector - Detect feedback loops"
              style={{ position: 'relative' }}
            >
              <LoopIcon fontSize="small" />
              {loops.length > 0 && <span className="tool-badge blue">{loops.length}</span>}
            </button>
            <button
              className={`sd-btn ${toolbarOpen && toolbarTab === 'health' ? 'active' : ''}`}
              onClick={() => openToolbar('health')}
              title="Model Health - Check diagram validity"
              style={{ position: 'relative' }}
            >
              <HealthAndSafetyIcon fontSize="small" />
              {!modelIsHealthy && <span className="tool-badge orange">{healthErrorCount + healthWarningCount}</span>}
            </button>
            <button
              className={`sd-btn ${toolbarOpen && toolbarTab === 'insights' ? 'active' : ''}`}
              onClick={() => openToolbar('insights')}
              title="System Archetypes & Insights"
            >
              <ScienceIcon fontSize="small" />
            </button>
          </div>
          <div className="sd-divider" />

          {/* View & Layout */}
          <div className="sd-btn-group" title="Layout & View">
            <button
              className={`sd-btn ${toolbarOpen && toolbarTab === 'layout' ? 'active' : ''}`}
              onClick={() => openToolbar('layout')}
              title="Auto Layout"
            >
              <AutoFixHighIcon fontSize="small" />
            </button>
            <button
              className={`sd-btn ${toolbarOpen && toolbarTab === 'story' ? 'active' : ''}`}
              onClick={() => openToolbar('story')}
              title="Story Builder"
            >
              <AutoStoriesIcon fontSize="small" />
            </button>
            <button
              className="sd-btn"
              onClick={() => setShowPresentationMode(true)}
              title="Presentation Mode"
            >
              <SlideshowIcon fontSize="small" />
            </button>
          </div>
          <div className="sd-divider" />

          {/* Export & Share */}
          <div className="sd-btn-group" title="Export">
            <button className="sd-btn" onClick={exportPNG} title="Export as PNG">
              <ImageIcon fontSize="small" />
            </button>
            <button
              className={`sd-btn ${showCommentsPanel ? 'active' : ''}`}
              onClick={() => setShowCommentsPanel(!showCommentsPanel)}
              title="Comments & Collaboration"
              style={{ position: 'relative' }}
            >
              <ChatBubbleOutlineIcon fontSize="small" />
              {comments.length > 0 && <span className="tool-badge red">{comments.length}</span>}
            </button>
          </div>

          {/* More Tools Dropdown */}
          <div className="sd-btn-group">
            <button
              className={`sd-btn ${toolbarOpen && ['tags', 'simulation', 'versions'].includes(toolbarTab) ? 'active' : ''}`}
              onClick={() => openToolbar(toolbarTab === 'tags' ? 'simulation' : toolbarTab === 'simulation' ? 'versions' : 'tags')}
              title="More tools: Tags, Simulation, Versions"
            >
              <SettingsIcon fontSize="small" />
            </button>
          </div>

          <PresenceIndicator />
        </div>
      </div>

      <div className="sd-main">
        {/* Professional Toolbox - Redesigned */}
        <div className="sd-toolbox">
          {/* Primary Tools */}
          <div className="toolbox-primary">
            <button
              className={`primary-tool-btn ${activeTool === 'select' ? 'active' : ''}`}
              onClick={() => { setActiveTool('select'); setActiveElementType(null); setActiveConnectionType(null); setConnectionSource(null); }}
              title="Select & Edit (Q)"
            >
              <span className="primary-tool-icon">↖</span>
              <span>Select</span>
            </button>
            <button
              className={`primary-tool-btn quick-connect ${quickConnectMode ? 'active' : ''}`}
              onClick={() => {
                setQuickConnectMode(!quickConnectMode);
                if (!quickConnectMode) {
                  setActiveTool('add-connection');
                  setActiveConnectionType(diagramMode === 'cld' ? 'positive' : 'flow_pipe');
                }
              }}
              title="Quick Connect Mode - Rapidly draw connections (hold Shift)"
            >
              <span className="primary-tool-icon">⚡</span>
              <span>Quick</span>
            </button>
          </div>

          {/* Element Palette - Grid Layout */}
          <div className="toolbox-section">
            <div
              className="toolbox-header collapsible"
              onClick={() => setToolboxCollapsed(prev => ({ ...prev, elements: !prev.elements }))}
            >
              <span className="toolbox-title">Elements</span>
              <span className={`collapse-icon ${toolboxCollapsed.elements ? 'collapsed' : ''}`}>▼</span>
            </div>
            {!toolboxCollapsed.elements && (
              <div className="element-palette">
                {/* CLD Elements */}
                {(diagramMode === 'cld' || diagramMode === 'stockFlow') && (
                  <div className="palette-group">
                    {diagramMode === 'cld' && <div className="palette-label">Variables</div>}
                    {diagramMode === 'stockFlow' && <div className="palette-label">Stock-Flow</div>}
                    <div className="palette-grid">
                      {diagramMode === 'cld' ? (
                        Object.values(CLD_ELEMENTS).map(type => (
                          <button
                            key={type.id}
                            className={`palette-btn ${activeTool === 'add-element' && activeElementType === type.id ? 'active' : ''}`}
                            onClick={() => { setActiveTool('add-element'); setActiveElementType(type.id); setActiveConnectionType(null); }}
                            title={`${type.description} (${ELEMENT_SHORTCUT_LABELS[type.id] || ''})`}
                            draggable="true"
                            onDragStart={(e) => e.dataTransfer.setData('elementType', type.id)}
                          >
                            <span className="palette-icon" style={{ backgroundColor: type.color }}>{type.icon}</span>
                            <span className="palette-name">{type.name}</span>
                            {ELEMENT_SHORTCUT_LABELS[type.id] && (
                              <span className="palette-shortcut">{ELEMENT_SHORTCUT_LABELS[type.id]}</span>
                            )}
                          </button>
                        ))
                      ) : (
                        Object.values(STOCK_FLOW_ELEMENTS).map(type => (
                          <button
                            key={type.id}
                            className={`palette-btn ${activeTool === 'add-element' && activeElementType === type.id ? 'active' : ''}`}
                            onClick={() => { setActiveTool('add-element'); setActiveElementType(type.id); setActiveConnectionType(null); }}
                            title={`${type.description} (${ELEMENT_SHORTCUT_LABELS[type.id] || ''})`}
                            draggable="true"
                            onDragStart={(e) => e.dataTransfer.setData('elementType', type.id)}
                          >
                            <span className="palette-icon" style={{ backgroundColor: type.color }}>{type.icon}</span>
                            <span className="palette-name">{type.name}</span>
                            {ELEMENT_SHORTCUT_LABELS[type.id] && (
                              <span className="palette-shortcut">{ELEMENT_SHORTCUT_LABELS[type.id]}</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Connection Palette */}
          <div className="toolbox-section">
            <div
              className="toolbox-header collapsible"
              onClick={() => setToolboxCollapsed(prev => ({ ...prev, connections: !prev.connections }))}
            >
              <span className="toolbox-title">Connections</span>
              <span className={`collapse-icon ${toolboxCollapsed.connections ? 'collapsed' : ''}`}>▼</span>
            </div>
            {!toolboxCollapsed.connections && (
              <div className="connection-palette">
                {diagramMode === 'cld' ? (
                  <div className="connection-grid">
                    {Object.values(CLD_CONNECTIONS).map(type => (
                      <button
                        key={type.id}
                        className={`connection-palette-btn ${activeTool === 'add-connection' && activeConnectionType === type.id ? 'active' : ''}`}
                        onClick={() => { setActiveTool('add-connection'); setActiveConnectionType(type.id); setActiveElementType(null); setConnectionSource(null); }}
                        title={type.description}
                        style={{ '--conn-color': type.color }}
                      >
                        <span className="conn-preview" style={{ borderColor: type.color, borderStyle: type.lineStyle }}>
                          <span className="conn-arrow" style={{ borderColor: type.color }}></span>
                        </span>
                        <span className="conn-label">{type.name}</span>
                        <span className="conn-symbol" style={{ color: type.color }}>{type.polaritySymbol}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="connection-grid">
                    {Object.values(STOCK_FLOW_CONNECTIONS).map(type => (
                      <button
                        key={type.id}
                        className={`connection-palette-btn ${activeTool === 'add-connection' && activeConnectionType === type.id ? 'active' : ''}`}
                        onClick={() => { setActiveTool('add-connection'); setActiveConnectionType(type.id); setActiveElementType(null); setConnectionSource(null); }}
                        title={type.description}
                        style={{ '--conn-color': type.color }}
                      >
                        <span className="conn-preview" style={{ borderColor: type.color, borderStyle: type.lineStyle, borderWidth: type.width > 3 ? '3px' : '2px' }}>
                          <span className="conn-arrow" style={{ borderColor: type.color }}></span>
                        </span>
                        <span className="conn-label">{type.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Curve Style - Compact */}
                <div className="curve-controls">
                  <div className="curve-btns">
                    <button className={`curve-btn ${curveMode === 'bow' ? 'active' : ''}`} onClick={() => setCurveMode('bow')} title="Curved">⌒</button>
                    <button className={`curve-btn ${curveMode === 'bezier' ? 'active' : ''}`} onClick={() => setCurveMode('bezier')} title="Smooth">∿</button>
                    <button className={`curve-btn ${curveMode === 'straight' ? 'active' : ''}`} onClick={() => setCurveMode('straight')} title="Straight">—</button>
                  </div>
                  {curveMode === 'bow' && (
                    <input
                      type="range"
                      min="20"
                      max="180"
                      step="5"
                      value={curveDistance}
                      onChange={e => setCurveDistance(parseInt(e.target.value, 10))}
                      className="curve-range"
                      title={`Curve: ${curveDistance}px`}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Detected Loops Summary */}
          {loops.length > 0 && (
            <div className="toolbox-section loops-summary">
              <div className="toolbox-header">
                <span className="toolbox-title">Feedback Loops</span>
                <span className="loop-count">{loops.length}</span>
              </div>
              <div className="loops-preview">
                {loops.slice(0, 3).map((loop, idx) => (
                  <div
                    key={idx}
                    className={`loop-chip ${loop.type === 'R' ? 'reinforcing' : 'balancing'}`}
                    onClick={() => {
                      openToolbar('loops');
                      const cy = cyRef.current;
                      if (cy) {
                        cy.elements().removeClass('path-node path-edge');
                        loop.nodeIds.forEach(id => cy.getElementById(id).addClass('path-node'));
                        loop.connectionIds?.forEach(id => cy.getElementById(id).addClass('path-edge'));
                      }
                    }}
                    title={`Click to highlight ${loop.type === 'R' ? 'Reinforcing' : 'Balancing'} loop`}
                  >
                    <span className="loop-type-badge">{loop.type}{idx + 1}</span>
                  </div>
                ))}
                {loops.length > 3 && (
                  <button className="more-loops-btn" onClick={() => openToolbar('loops')}>
                    +{loops.length - 3} more
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Flow Warnings */}
          {flowWarnings.length > 0 && (
            <div className="toolbox-section warnings-section">
              <div className="warning-header">
                <span>⚠️ Validation</span>
                <span className="warning-count">{flowWarnings.length}</span>
              </div>
              {flowWarnings.slice(0, 2).map((warning, idx) => (
                <div key={idx} className="warning-item">{warning}</div>
              ))}
            </div>
          )}

          {/* Advanced Options - Collapsible */}
          <div className="toolbox-section">
            <div
              className="toolbox-header collapsible"
              onClick={() => setToolboxCollapsed(prev => ({ ...prev, advanced: !prev.advanced }))}
            >
              <span className="toolbox-title">Advanced</span>
              <span className={`collapse-icon ${toolboxCollapsed.advanced ? 'collapsed' : ''}`}>▼</span>
            </div>
            {!toolboxCollapsed.advanced && (
              <div className="advanced-options">
                {/* Layers */}
                <SDLayers
                  layerVisibility={layerVisibility}
                  onToggleLayer={toggleLayer}
                  onShowAll={showAllLayers}
                  onHideAll={hideAllLayers}
                  collapsed={layersCollapsed}
                  onToggleCollapse={() => setLayersCollapsed(!layersCollapsed)}
                />

                {/* Visual Filters */}
                <SDVisualFilters
                  filters={visualFilters}
                  onToggleFilter={toggleVisualFilter}
                  onResetFilters={resetVisualFilters}
                  activeFiltersCount={activeFiltersCount}
                  collapsed={filtersCollapsed}
                  onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
                />

                {/* Cognitive Markers */}
                <SDCognitiveMarkers
                  showMarkers={showCognitiveMarkers}
                  onToggleShowMarkers={setShowCognitiveMarkers}
                  collapsed={markersCollapsed}
                  onToggleCollapse={() => setMarkersCollapsed(!markersCollapsed)}
                />

                {/* Subsystem Highlighting */}
                <SDSubsystemHighlight
                  highlightEnabled={subsystemHighlightEnabled}
                  onToggleHighlight={setSubsystemHighlightEnabled}
                  showUpstream={showUpstream}
                  onToggleUpstream={setShowUpstream}
                  showDownstream={showDownstream}
                  onToggleDownstream={setShowDownstream}
                  subsystemData={{ upstream: [], downstream: [] }}
                  selectedNodeLabel={selectedElement?.label || selectedElement?.name}
                  onClear={() => { setSubsystemHighlightEnabled(false); setSubsystemSelectedNodeId(null); }}
                  collapsed={subsystemCollapsed}
                  onToggleCollapse={() => setSubsystemCollapsed(!subsystemCollapsed)}
                />
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="toolbox-shortcuts">
            <div className="shortcuts-hint">
              <span className="shortcut-key">V</span> Variable
              <span className="shortcut-key">P</span> Positive (+)
              <span className="shortcut-key">M</span> Negative (−)
              <span className="shortcut-key">Q</span> Select
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="sd-canvas" ref={containerRef}>
        {/* Connection Drawing Indicator */}
        {connectionSource && (
          <div className="connection-indicator">
            <div className="connection-indicator-content">
              <span className="indicator-icon">🔗</span>
              <span className="indicator-text">
                <strong>Drawing connection</strong> from {elementMap.get(connectionSource)?.label || 'node'}
              </span>
              <span className="indicator-hint">Click target node or press <kbd>ESC</kbd> to cancel</span>
            </div>
          </div>
        )}

        {/* Quick Connect Mode Indicator */}
        {quickConnectMode && !connectionSource && (
          <div className="quick-mode-indicator">
            <span>⚡ Quick Connect Mode</span>
            <span className="quick-hint">Click nodes to connect them rapidly</span>
          </div>
        )}

        {/* Enhanced Context Menu */}
        {contextMenu && (
          <div className="context-menu" style={contextMenuStyle}>
            <div className="context-menu-section">
              <div className="context-menu-header">Add Element</div>
              <div className="context-menu-grid">
                {(diagramMode === 'cld' ? ['variable'] : ['stock', 'flow', 'converter', 'cloud', 'parameter']).map(type => (
                  <button
                    key={type}
                    className="context-menu-item"
                    onClick={() => {
                      createElement(type, contextMenu.position);
                      setContextMenu(null);
                    }}
                  >
                    <span className="context-menu-icon" style={{ backgroundColor: ALL_ELEMENTS[type]?.color }}>{ALL_ELEMENTS[type]?.icon}</span>
                    <span>{ALL_ELEMENTS[type]?.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="context-menu-divider" />
            <div className="context-menu-section">
              <div className="context-menu-header">Quick Actions</div>
              <button className="context-menu-action" onClick={() => { cyRef.current?.fit(cyRef.current.nodes(), 50); setContextMenu(null); }}>
                Fit to view
              </button>
              <button className="context-menu-action" onClick={() => { applyTidyLayout(); setContextMenu(null); }}>
                Auto-layout
              </button>
            </div>
          </div>
        )}

        {/* Inline label editing overlay */}
          {editingElement && (
            <div
              className="inline-edit-overlay"
              style={{
                left: editingElement.position.x,
                top: editingElement.position.y,
              }}
            >
              <input
                ref={inlineInputRef}
                type="text"
                value={editingElement.label}
                onChange={e => setEditingElement(prev => ({ ...prev, label: e.target.value }))}
                onBlur={saveInlineEdit}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    saveInlineEdit();
                  } else if (e.key === 'Escape') {
                    cancelInlineEdit();
                  }
                }}
                autoFocus
                className="inline-edit-input"
              />
            </div>
          )}

          <CytoscapeComponent
            elements={cyElements}
            stylesheet={stylesheet}
            style={{ width: '100%', height: '100%' }}
            cy={handleCyReady}
            minZoom={0.3}
            maxZoom={3}
            wheelSensitivity={0.3}
          />

          {/* Zoom controls */}
          <div className="sd-zoom-controls">
            <button onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)} title="Zoom In">
              <ZoomInIcon fontSize="small" />
            </button>
            <button onClick={() => cyRef.current?.zoom(cyRef.current.zoom() / 1.2)} title="Zoom Out">
              <ZoomOutIcon fontSize="small" />
            </button>
            <button onClick={() => cyRef.current?.fit(cyRef.current.nodes(), 50)} title="Fit to View">
              <CenterFocusStrongIcon fontSize="small" />
            </button>
          </div>

          {/* EPIC 1.8 - Mini Map */}
          <SDMiniMap
            elements={elements}
            connections={connections}
            cyRef={cyRef}
            isCollapsed={!showMiniMap}
            onToggle={() => setShowMiniMap(!showMiniMap)}
          />

          {/* Right Toolbar with all tools */}
          <SDRightToolbar
            isOpen={toolbarOpen}
            onToggle={toggleToolbar}
            activeTab={toolbarTab}
            onTabChange={setToolbarTab}
            badges={{
              loops: loops.length || undefined,
              health: !modelIsHealthy ? (healthErrorCount + healthWarningCount) : undefined,
            }}
          >
            {/* Loop Inspector */}
            {toolbarTab === 'loops' && (
              <SDLoopInspector
                elements={elements}
                connections={connections}
                loops={loops}
                onLoopClick={(loop) => {
                  const cy = cyRef.current;
                  if (cy) {
                    cy.elements().removeClass('path-node path-edge');
                    loop.nodeIds.forEach(id => cy.getElementById(id).addClass('path-node'));
                    loop.connectionIds?.forEach(id => cy.getElementById(id).addClass('path-edge'));
                  }
                }}
                onLoopHover={(loop) => {
                  const cy = cyRef.current;
                  if (!cy) return;
                  if (loop) {
                    cy.elements().addClass('dimmed-node dimmed-edge');
                    loop.nodeIds.forEach(id => cy.getElementById(id).removeClass('dimmed-node'));
                    loop.connectionIds?.forEach(id => cy.getElementById(id).removeClass('dimmed-edge'));
                  } else {
                    cy.elements().removeClass('dimmed-node dimmed-edge');
                  }
                }}
                onLoopNarrativeChange={() => {}}
                cyRef={cyRef}
                isOpen={true}
                onClose={closeToolbar}
                embedded={true}
              />
            )}

            {/* Model Health */}
            {toolbarTab === 'health' && (
              <SDModelHealth
                issues={modelHealthIssues}
                errorCount={healthErrorCount}
                warningCount={healthWarningCount}
                infoCount={healthInfoCount}
                isHealthy={modelIsHealthy}
                onIssueClick={(elementId) => {
                  const el = elements.find(e => e.id === elementId);
                  if (el) {
                    setSelectedElement(el);
                    setSelectedConnection(null);
                  }
                }}
                onRefresh={() => {}}
                isOpen={true}
                onClose={closeToolbar}
                cyRef={cyRef}
                embedded={true}
              />
            )}

            {/* Auto Layout */}
            {toolbarTab === 'layout' && (
              <SDAutoLayout
                selectedIds={selectedElement ? [selectedElement.id] : []}
                onTidyLayout={applyTidyLayout}
                onAlign={applyAlignment}
                onDistribute={applyDistribution}
              />
            )}

            {/* Story Builder */}
            {toolbarTab === 'story' && (
              <SDStoryBuilder
                storySteps={storySteps}
                selectedStepId={selectedStepId}
                onSelectStep={setSelectedStepId}
                onAddStep={addStoryStep}
                onUpdateStep={updateStoryStep}
                onDeleteStep={deleteStoryStep}
                onDuplicateStep={duplicateStoryStep}
                onReorderSteps={reorderSteps}
                onStartPresentation={() => setShowPresentationMode(true)}
                editingStepId={editingStepId}
                onEditStep={setEditingStepId}
                elements={elements}
                loops={loops}
              />
            )}

            {/* Domain Tags */}
            {toolbarTab === 'tags' && (
              <SDDomainTags
                tags={availableTags}
                elementTags={domainTags}
                selectedElementId={selectedElement?.id}
                onAddTagToElement={addTagToElement}
                onRemoveTagFromElement={removeTagFromElement}
                onCreateTag={createTag}
                onDeleteTag={deleteTag}
                onFilterByTag={filterByTag}
                onClearFilter={clearTagFilter}
                activeFilter={activeTagFilter}
              />
            )}

            {/* Insights & Archetypes */}
            {toolbarTab === 'insights' && (
              <>
                <SDInsightMarkers
                  loops={loops}
                  elements={elements}
                  connections={connections}
                  onHighlightElements={(ids) => {
                    ids.forEach(id => {
                      cyRef.current?.getElementById(id)?.addClass('highlighted');
                    });
                  }}
                  onHighlightLoops={(loopIds) => {}}
                />
                <InsightMarkerPanel
                  insightMarkers={insightMarkers}
                  selectedInsightId={selectedInsightId}
                  onSelectInsight={setSelectedInsightId}
                  onDeleteInsight={deleteInsightMarker}
                  elements={elements}
                />
              </>
            )}

            {/* Simulation Config */}
            {toolbarTab === 'simulation' && (
              <SDSimulationConfig
                config={simConfig}
                onUpdateConfig={updateSimConfig}
                elements={elements}
                connections={connections}
                onExport={(model) => {
                  const json = JSON.stringify(model, null, 2);
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${diagramName.replace(/\s+/g, '_')}_simulation.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              />
            )}

            {/* Version Control */}
            {toolbarTab === 'versions' && (
              <SDVersioning
                versions={versions}
                scenarios={scenarios}
                activeScenarioId={activeScenarioId}
                currentModel={{ elements, connections, loops, config: simConfig }}
                onSaveVersion={(model, options) => saveVersion(model, options)}
                onRestoreVersion={(versionId) => {
                  const snapshot = restoreVersion(versionId);
                  if (snapshot) {
                    setElements(snapshot.elements || []);
                    setConnections(snapshot.connections || []);
                  }
                }}
                onDeleteVersion={deleteVersion}
                onUpdateVersion={updateVersion}
                onToggleBookmark={toggleBookmark}
                onCreateScenario={(options) => createNewScenario({ elements, connections }, options)}
                onDeleteScenario={deleteScenario}
                onUpdateScenario={updateScenario}
                onActivateScenario={activateScenario}
                onDeactivateScenario={deactivateScenario}
              />
            )}
          </SDRightToolbar>
        </div>

        {/* Presentation Mode Overlay */}
        <SDPresentationMode
          isOpen={showPresentationMode}
          onClose={() => setShowPresentationMode(false)}
          diagramName={diagramName}
          storySteps={storySteps}
          loops={loops}
          elements={elements}
          cyRef={cyRef}
          themeDark={themeDark}
        />

        {/* Properties Panel - Redesigned for better UX */}
        {showPropertiesPanel && (selectedElement || selectedConnection) && (
          <div className="sd-properties">
            <div className="properties-header">
              <div className="properties-title-row">
                <span className="properties-icon" style={{ backgroundColor: selectedElement ? ALL_ELEMENTS[selectedElement.type]?.color : '#6b7280' }}>
                  {selectedElement ? ALL_ELEMENTS[selectedElement.type]?.icon : '→'}
                </span>
                <div className="properties-title-info">
                  <span className="properties-title">{selectedElement ? (selectedElement.label || 'Element') : 'Connection'}</span>
                  <span className="properties-type">{selectedElement ? ALL_ELEMENTS[selectedElement.type]?.name : ALL_CONNECTIONS[selectedConnection?.type]?.name}</span>
                </div>
              </div>
              <button className="properties-close" onClick={() => setShowPropertiesPanel(false)}>
                <CloseIcon fontSize="small" />
              </button>
            </div>

            {selectedElement && (
              <div className="properties-content">
                {/* Primary Section - Label */}
                <div className="prop-section">
                  <div className="prop-group">
                    <label>Label</label>
                    <input
                      type="text"
                      value={selectedElement.label || ''}
                      onChange={e => updateElement(selectedElement.id, { label: e.target.value })}
                      placeholder="Enter label..."
                      className="prop-input-primary"
                    />
                  </div>
                </div>

                {/* Appearance Section */}
                <div className="prop-section">
                  <div className="prop-section-header">Appearance</div>
                  <div className="prop-row">
                    <div className="prop-group compact">
                      <label>Fill</label>
                      <div className="color-compact">
                        <input
                          type="color"
                          value={selectedElement.bgColor || ALL_ELEMENTS[selectedElement.type]?.color || '#3b82f6'}
                          onChange={e => updateElement(selectedElement.id, { bgColor: e.target.value })}
                          className="color-input"
                        />
                        <span className="color-label">{(selectedElement.bgColor || ALL_ELEMENTS[selectedElement.type]?.color || '#3b82f6').toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="prop-group compact">
                      <label>Opacity</label>
                      <div className="opacity-compact">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedElement.opacity ?? 100}
                          onChange={e => updateElement(selectedElement.id, { opacity: parseInt(e.target.value) })}
                          className="opacity-slider"
                        />
                        <span className="opacity-val">{selectedElement.opacity ?? 100}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="prop-row">
                    <div className="prop-group compact">
                      <label>Width</label>
                      <input
                        type="number"
                        min="30"
                        max="300"
                        value={selectedElement.width || getDefaultSize(selectedElement.type).width}
                        onChange={e => updateElement(selectedElement.id, { width: parseInt(e.target.value) || 80 })}
                        className="prop-input-sm"
                      />
                    </div>
                    <div className="prop-group compact">
                      <label>Height</label>
                      <input
                        type="number"
                        min="20"
                        max="200"
                        value={selectedElement.height || getDefaultSize(selectedElement.type).height}
                        onChange={e => updateElement(selectedElement.id, { height: parseInt(e.target.value) || 50 })}
                        className="prop-input-sm"
                      />
                    </div>
                  </div>
                  <div className="prop-toggle-row">
                    <label className="prop-toggle">
                      <input
                        type="checkbox"
                        checked={selectedElement.hideBorder || false}
                        onChange={e => updateElement(selectedElement.id, { hideBorder: e.target.checked })}
                      />
                      <span className="toggle-switch"></span>
                      <span>Borderless (CLD style)</span>
                    </label>
                  </div>
                </div>

                {/* Typography Section */}
                <div className="prop-section">
                  <div className="prop-section-header">Typography</div>
                  <div className="typography-controls">
                    <select
                      value={selectedElement.fontSize || 12}
                      onChange={e => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                      className="typo-select"
                      title="Font Size"
                    >
                      {[8, 10, 11, 12, 14, 16, 18, 20, 24].map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <div className="typo-btn-group">
                      <button
                        className={`typo-btn ${selectedElement.fontWeight === 'bold' ? 'active' : ''}`}
                        onClick={() => updateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                        title="Bold"
                      >
                        B
                      </button>
                      <button
                        className={`typo-btn ${selectedElement.fontStyle === 'italic' ? 'active' : ''}`}
                        onClick={() => updateElement(selectedElement.id, { fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                        title="Italic"
                      >
                        I
                      </button>
                    </div>
                    <input
                      type="color"
                      value={selectedElement.textColor || (themeDark ? '#e5e7eb' : '#1f2937')}
                      onChange={e => updateElement(selectedElement.id, { textColor: e.target.value })}
                      className="color-input-sm"
                      title="Text Color"
                    />
                  </div>
                </div>

                {/* Stock/Flow Specific Section */}
                {(selectedElement.type === 'stock' || selectedElement.type === 'flow') && (
                  <div className="prop-section">
                    <div className="prop-section-header">
                      {selectedElement.type === 'stock' ? 'Stock Properties' : 'Flow Properties'}
                    </div>
                    {selectedElement.type === 'stock' && (
                      <div className="prop-group">
                        <label>Initial Value</label>
                        <input
                          type="number"
                          value={selectedElement.properties?.initialValue || 0}
                          onChange={e => updateElement(selectedElement.id, {
                            properties: { ...selectedElement.properties, initialValue: parseFloat(e.target.value) || 0 }
                          })}
                          className="prop-input-primary"
                        />
                      </div>
                    )}
                    {equationHint && (
                      <div className="equation-preview">
                        <span className="equation-label">Equation:</span>
                        <code>{equationHint}</code>
                      </div>
                    )}
                    <div className="prop-group">
                      <label>Formula</label>
                      <textarea
                        value={selectedElement.properties?.equation || ''}
                        onChange={e => updateElement(selectedElement.id, {
                          properties: { ...selectedElement.properties, equation: e.target.value }
                        })}
                        rows={2}
                        placeholder="e.g., inflow - outflow"
                        className="prop-textarea"
                      />
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                <div className="prop-section">
                  <div className="prop-section-header">Notes</div>
                  <textarea
                    value={selectedElement.properties?.notes || ''}
                    onChange={e => updateElement(selectedElement.id, {
                      properties: { ...selectedElement.properties, notes: e.target.value }
                    })}
                    rows={2}
                    placeholder="Add notes about this element..."
                    className="prop-textarea"
                  />
                </div>

                {/* Cognitive Markers */}
                {showCognitiveMarkers && selectedElement.type !== 'note' && (
                  <div className="prop-section">
                    <MarkerSelector
                      elementId={selectedElement.id}
                      currentMarkers={selectedElement.cognitiveMarkers || []}
                      onToggleMarker={(elId, markerId) => {
                        const markers = selectedElement.cognitiveMarkers || [];
                        if (markers.includes(markerId)) {
                          updateElement(elId, { cognitiveMarkers: markers.filter(m => m !== markerId) });
                        } else {
                          updateElement(elId, { cognitiveMarkers: [...markers, markerId] });
                        }
                      }}
                      onClearMarkers={(elId) => updateElement(elId, { cognitiveMarkers: [] })}
                    />
                  </div>
                )}

                {/* Delete Button */}
                <div className="prop-actions">
                  <button className="delete-btn" onClick={deleteSelected}>
                    <DeleteIcon fontSize="small" /> Delete
                  </button>
                </div>
              </div>
            )}

            {/* Connection Properties - Legacy kept for now with better styling */}
            {selectedConnection && !selectedElement && (
              <div className="properties-content">
                <div className="prop-section">
                  <div className="prop-group">
                    <label>Type</label>
                    <select
                      value={selectedConnection.type}
                      onChange={e => updateConnection(selectedConnection.id, { type: e.target.value, label: ALL_CONNECTIONS[e.target.value]?.label || '' })}
                      className="prop-select"
                    >
                      {Object.values(ALL_CONNECTIONS).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {(selectedConnection.type === 'positive' || selectedConnection.type === 'negative') && (
                    <div className="prop-group">
                      <label>Polarity</label>
                      <div className="polarity-btns">
                        {['+', '-', ''].map(symbol => (
                          <button
                            key={symbol || 'none'}
                            className={`polarity-btn ${selectedConnection.polaritySymbol === symbol ? 'active' : ''}`}
                            onClick={() => updateConnection(selectedConnection.id, {
                              polaritySymbol: symbol,
                              displayLabel: `${selectedConnection.label || ''}${symbol ? ` ${symbol}` : ''}`,
                            })}
                            style={{ color: symbol === '+' ? '#22c55e' : symbol === '-' ? '#ef4444' : 'inherit' }}
                          >
                            {symbol || 'None'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="prop-toggle-row">
                    <label className="prop-toggle">
                      <input
                        type="checkbox"
                        checked={selectedConnection.properties?.hasDelay || false}
                        onChange={e => updateConnection(selectedConnection.id, {
                          properties: { ...selectedConnection.properties, hasDelay: e.target.checked }
                        })}
                      />
                      <span className="toggle-switch"></span>
                      <span>Has delay</span>
                    </label>
                  </div>
                </div>

                <div className="prop-section">
                  <div className="prop-section-header">Endpoints</div>
                  <div className="prop-row">
                    <div className="prop-group compact">
                      <label>From</label>
                      <select
                        value={selectedConnection.source}
                        onChange={e => updateConnection(selectedConnection.id, { source: e.target.value })}
                        className="prop-select-sm"
                      >
                        {elements.map(el => (
                          <option key={el.id} value={el.id}>{el.label || el.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="prop-group compact">
                      <label>To</label>
                      <select
                        value={selectedConnection.target}
                        onChange={e => updateConnection(selectedConnection.id, { target: e.target.value })}
                        className="prop-select-sm"
                      >
                        {elements.map(el => (
                          <option key={el.id} value={el.id}>{el.label || el.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="prop-actions">
                  <button className="delete-btn" onClick={deleteSelected}>
                    <DeleteIcon fontSize="small" /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-backdrop" onClick={() => setShowSaveModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Save Diagram</h3>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={diagramName}
                onChange={e => setDiagramName(e.target.value)}
                placeholder="Enter diagram name..."
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowSaveModal(false)}>Cancel</button>
              <button className="btn" onClick={saveDiagram}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Template picker modal */}
      <TemplatePickerModal
        isOpen={showTemplatesPicker}
        onClose={() => setShowTemplatesPicker(false)}
        onSelect={handleTemplateSelect}
        templates={SYSTEM_DYNAMICS_TEMPLATES}
        title="Choose a System Dynamics Template"
      />

      {/* Load Modal */}
      {showLoadModal && (
        <div className="modal-backdrop" onClick={() => setShowLoadModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <h3>Open Diagram</h3>
            {savedDiagrams.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>
                No saved diagrams yet.
              </p>
            ) : (
              <div className="diagram-list">
                {savedDiagrams.map(d => (
                  <div key={d.id} className="diagram-item">
                    <div className="diagram-info" onClick={() => loadDiagram(d.id)}>
                      <div className="diagram-name">{d.name}</div>
                      <div className="diagram-meta">
                        {d.type === 'cld' ? 'Causal Loop' : 'Stock & Flow'} •
                        {new Date(d.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button className="btn-icon btn-danger-icon" onClick={() => deleteDiagram(d.id)} title="Delete">
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowLoadModal(false)}>Close</button>
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
        /* ============================================
           SYSTEM DYNAMICS STUDIO - Professional CLD Tool
           ============================================ */

        .system-dynamics-studio {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ============================================
           HEADER - Streamlined Professional Look
           ============================================ */
        .sd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          padding-right: 180px;
          background: var(--panel);
          border-bottom: 1px solid var(--border);
          gap: 12px;
          box-sizing: border-box;
          min-height: 52px;
        }

        .sd-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .sd-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 700;
          color: var(--accent);
          white-space: nowrap;
        }

        .sd-header-center {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }

        .sd-mode-toggle {
          display: flex;
          background: var(--bg);
          border-radius: 8px;
          padding: 3px;
          border: 1px solid var(--border);
        }

        .mode-btn {
          padding: 6px 16px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .mode-btn:hover {
          color: var(--text);
        }

        .mode-btn.active {
          background: var(--accent);
          color: white;
          box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
        }

        .sd-name-input {
          padding: 6px 12px;
          border: 1px solid transparent;
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 14px;
          font-weight: 500;
          width: 180px;
          transition: all 0.15s ease;
        }

        .sd-name-input:hover {
          border-color: var(--border);
        }

        .sd-name-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        .unsaved-indicator {
          color: #f59e0b;
          font-size: 12px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .sd-header-right {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-right: 80px;
          flex-wrap: nowrap;
        }

        .sd-btn-group {
          display: flex;
          background: var(--bg);
          border-radius: 8px;
          padding: 2px;
          border: 1px solid var(--border);
        }

        .sd-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
        }

        .sd-btn:hover:not(:disabled) {
          background: var(--border);
          color: var(--text);
        }

        .sd-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .sd-btn.active {
          background: var(--accent-soft);
          color: var(--accent);
        }

        .tool-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          font-size: 9px;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          color: white;
        }

        .tool-badge.blue { background: #3b82f6; }
        .tool-badge.orange { background: #f59e0b; }
        .tool-badge.red { background: #ef4444; }
        .tool-badge.green { background: #22c55e; }

        .sd-divider {
          width: 1px;
          height: 20px;
          background: var(--border);
          margin: 0 4px;
        }

        /* ============================================
           MAIN LAYOUT
           ============================================ */
        .sd-main {
          display: flex;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        /* ============================================
           TOOLBOX - Professional Element Palette
           ============================================ */
        .sd-toolbox {
          width: 200px;
          min-width: 200px;
          background: var(--panel);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex-shrink: 0;
        }

        .toolbox-primary {
          display: flex;
          gap: 4px;
          padding: 12px;
          border-bottom: 1px solid var(--border);
        }

        .primary-tool-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 8px;
          border: 2px solid var(--border);
          border-radius: 10px;
          background: var(--bg);
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .primary-tool-btn:hover {
          border-color: var(--accent);
          color: var(--text);
        }

        .primary-tool-btn.active {
          border-color: var(--accent);
          background: var(--accent-soft);
          color: var(--accent);
        }

        .primary-tool-btn.quick-connect.active {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .primary-tool-icon {
          font-size: 18px;
        }

        .toolbox-section {
          border-bottom: 1px solid var(--border);
        }

        .toolbox-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        .toolbox-header.collapsible {
          cursor: pointer;
          user-select: none;
        }

        .toolbox-header.collapsible:hover {
          background: var(--bg);
        }

        .collapse-icon {
          font-size: 8px;
          transition: transform 0.2s ease;
        }

        .collapse-icon.collapsed {
          transform: rotate(-90deg);
        }

        .toolbox-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
        }

        /* Element Palette */
        .element-palette {
          padding: 8px 12px 12px;
        }

        .palette-group {
          margin-bottom: 8px;
        }

        .palette-label {
          font-size: 10px;
          color: var(--text-muted);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .palette-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4px;
        }

        .palette-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border: 1px solid transparent;
          border-radius: 8px;
          background: var(--bg);
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .palette-btn:hover {
          border-color: var(--border);
          transform: translateX(2px);
        }

        .palette-btn.active {
          border-color: var(--accent);
          background: var(--accent-soft);
          color: var(--accent);
        }

        .palette-btn:active {
          transform: scale(0.98);
        }

        .palette-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .palette-name {
          flex: 1;
          font-weight: 500;
        }

        .palette-shortcut {
          font-size: 9px;
          font-weight: 700;
          padding: 2px 5px;
          background: var(--border);
          border-radius: 4px;
          color: var(--text-muted);
        }

        .palette-btn.active .palette-shortcut {
          background: var(--accent);
          color: white;
        }

        /* Connection Palette */
        .connection-palette {
          padding: 8px 12px 12px;
        }

        .connection-grid {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 10px;
        }

        .connection-palette-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border: 1px solid transparent;
          border-radius: 8px;
          background: var(--bg);
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .connection-palette-btn:hover {
          border-color: var(--conn-color, var(--border));
        }

        .connection-palette-btn.active {
          border-color: var(--conn-color);
          background: color-mix(in srgb, var(--conn-color) 10%, transparent);
        }

        .conn-preview {
          width: 28px;
          height: 0;
          border-bottom: 2px solid;
          position: relative;
          flex-shrink: 0;
        }

        .conn-arrow {
          position: absolute;
          right: -2px;
          top: -4px;
          width: 0;
          height: 0;
          border-left: 6px solid;
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
        }

        .conn-label {
          flex: 1;
          font-weight: 500;
        }

        .conn-symbol {
          font-size: 16px;
          font-weight: 700;
        }

        /* Curve Controls */
        .curve-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: var(--bg);
          border-radius: 8px;
        }

        .curve-btns {
          display: flex;
          gap: 2px;
        }

        .curve-btn {
          width: 28px;
          height: 28px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: transparent;
          color: var(--text-muted);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .curve-btn:hover {
          background: var(--panel);
          color: var(--text);
        }

        .curve-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .curve-range {
          flex: 1;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--border);
          border-radius: 2px;
        }

        .curve-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: var(--accent);
          border-radius: 50%;
          cursor: pointer;
        }

        /* Loops Summary */
        .loops-summary {
          padding-bottom: 0;
        }

        .loop-count {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 6px;
          background: var(--accent);
          color: white;
          border-radius: 10px;
        }

        .loops-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 8px 12px 12px;
        }

        .loop-chip {
          display: flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .loop-chip.reinforcing {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .loop-chip.balancing {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .loop-chip:hover {
          transform: scale(1.05);
        }

        .loop-type-badge {
          font-weight: 700;
        }

        .more-loops-btn {
          padding: 4px 10px;
          border: 1px dashed var(--border);
          border-radius: 12px;
          background: transparent;
          color: var(--text-muted);
          font-size: 11px;
          cursor: pointer;
        }

        .more-loops-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        /* Warnings */
        .warnings-section {
          padding: 8px 12px 12px;
        }

        .warning-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .warning-count {
          font-size: 10px;
          padding: 2px 6px;
          background: #f59e0b;
          color: white;
          border-radius: 10px;
        }

        .warning-item {
          font-size: 11px;
          padding: 6px 8px;
          background: rgba(245, 158, 11, 0.1);
          border-left: 3px solid #f59e0b;
          border-radius: 0 6px 6px 0;
          margin-bottom: 4px;
          color: var(--text);
        }

        /* Advanced Options */
        .advanced-options {
          padding: 8px 12px 12px;
        }

        /* Keyboard Shortcuts */
        .toolbox-shortcuts {
          margin-top: auto;
          padding: 12px;
          background: var(--bg);
          border-top: 1px solid var(--border);
        }

        .shortcuts-hint {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          font-size: 10px;
          color: var(--text-muted);
          align-items: center;
        }

        .shortcut-key {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          font-family: monospace;
        }

        /* Legacy tool-btn styles kept for compatibility */
        .tool-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 10px;
          border: 1px solid transparent;
          border-radius: 6px;
          background: transparent;
          color: var(--text);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .tool-btn:hover {
          background: var(--bg);
          border-color: var(--border);
        }

        .tool-btn.active {
          background: var(--accent-soft);
          border-color: var(--accent);
          color: var(--accent);
        }

        .tool-label {
          flex: 1;
        }

        .tool-shortcut {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 5px;
          background: var(--border);
          border-radius: 3px;
          color: var(--text-muted);
        }

        .tool-btn.active .tool-shortcut {
          background: var(--accent);
          color: white;
        }

        .curve-mode-controls {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }

        .curve-mode-btn {
          flex: 1;
          border: 1px solid var(--border);
          background: transparent;
          border-radius: 6px;
          padding: 6px 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .curve-mode-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .curve-slider {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .curve-slider input {
          flex: 1;
        }

        .path-story {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--panel);
        }

        .story-text {
          font-size: 12px;
          color: var(--text-muted);
          min-height: 40px;
        }

        .path-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .path-pill {
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid var(--border);
          font-size: 12px;
          background: var(--bg);
        }

        .path-clear {
          font-size: 12px;
        }

        .flow-warning-grid {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .flow-warning {
          padding: 8px 10px;
          border-radius: 6px;
          background: rgba(14, 165, 233, 0.08);
          border: 1px solid rgba(14, 165, 233, 0.5);
          font-size: 12px;
          color: #0f172a;
        }

        .scenario-input,
        .scenario-notes {
          width: 100%;
          padding: 8px 10px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          font-size: 13px;
          margin-top: 4px;
        }

        .scenario-notes {
          resize: vertical;
          min-height: 70px;
        }

        .btn {
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--panel);
          color: var(--text);
          padding: 8px 14px;
          cursor: pointer;
        }

        .btn-secondary {
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 6px 12px;
          background: var(--bg);
          color: var(--text);
          cursor: pointer;
        }

        .btn-secondary:hover {
          background: var(--border);
        }

        .equation-hint {
          padding: 8px 10px;
          border-radius: 6px;
          border: 1px dashed var(--accent);
          background: var(--accent-soft);
          font-size: 12px;
          color: var(--text);
          line-height: 1.4;
        }

        .anchor-select {
          width: 100%;
          padding: 6px 8px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
        }

        .polarity-controls {
          display: flex;
          gap: 6px;
        }

        .polarity-btn {
          flex: 1;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text);
          font-weight: 600;
          padding: 6px 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .polarity-btn.active {
          background: var(--accent-soft);
          border-color: var(--accent);
          color: var(--accent);
        }

        .element-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 18px;
          border-radius: 4px;
          color: white;
          font-size: 11px;
          font-weight: bold;
          flex-shrink: 0;
        }

        .connection-icon {
          width: 20px;
          height: 0;
          border-bottom: 2px solid;
          flex-shrink: 0;
        }

        .loop-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .loop-indicator.reinforcing {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .loop-indicator.balancing {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .loop-type {
          font-weight: 700;
          font-size: 14px;
        }

        .sd-canvas {
          flex: 1;
          position: relative;
          background: var(--bg);
        }

        /* EPIC 3-7 Floating Panels */
        .sd-floating-panel {
          position: absolute;
          z-index: 100;
          max-height: calc(100% - 40px);
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border-radius: 8px;
        }

        .auto-layout-panel {
          top: 20px;
          right: 20px;
          width: 280px;
        }

        .story-builder-panel {
          top: 20px;
          right: 20px;
          width: 350px;
        }

        .domain-tags-panel {
          top: 20px;
          right: 20px;
          width: 300px;
        }

        .insight-markers-panel {
          top: 20px;
          right: 20px;
          width: 360px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .simulation-config-panel {
          top: 20px;
          right: 20px;
          width: 380px;
        }

        .versioning-panel {
          top: 20px;
          right: 20px;
          width: 360px;
        }

        /* ============================================
           CONNECTION INDICATORS - Professional UX
           ============================================ */
        .connection-indicator {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
        }

        .connection-indicator-content {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          background: linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%);
          color: white;
          border-radius: 24px;
          font-size: 13px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .indicator-icon {
          font-size: 16px;
        }

        .indicator-text {
          font-weight: 500;
        }

        .indicator-text strong {
          font-weight: 700;
        }

        .indicator-hint {
          font-size: 11px;
          opacity: 0.85;
          padding-left: 10px;
          border-left: 1px solid rgba(255,255,255,0.3);
        }

        .indicator-hint kbd {
          display: inline-block;
          padding: 2px 6px;
          background: rgba(255,255,255,0.2);
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }

        .quick-mode-indicator {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
          z-index: 100;
        }

        .quick-hint {
          font-size: 11px;
          opacity: 0.85;
          font-weight: 400;
        }

        /* ============================================
           CONTEXT MENU - Enhanced Design
           ============================================ */
        .context-menu {
          position: absolute;
          min-width: 220px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 8px;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.25);
          z-index: 20;
        }

        .context-menu-header {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .context-menu-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
        }

        .context-menu-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border-radius: 6px;
          border: 1px solid transparent;
          background: var(--bg);
          font-size: 12px;
          color: var(--text);
          cursor: pointer;
        }

        .context-menu-item:hover {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .context-menu-icon {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          color: white;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .context-menu-section {
          margin-bottom: 8px;
        }

        .context-menu-divider {
          height: 1px;
          background: var(--border);
          margin: 8px 0;
        }

        .context-menu-action {
          width: 100%;
          padding: 8px 10px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: var(--text);
          font-size: 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .context-menu-action:hover {
          background: var(--bg);
        }

        /* ============================================
           ZOOM CONTROLS
           ============================================ */
        .sd-zoom-controls {
          position: absolute;
          bottom: 16px;
          left: 16px;
          display: flex;
          gap: 4px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 4px;
        }

        .sd-zoom-controls button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: var(--text);
          cursor: pointer;
        }

        .sd-zoom-controls button:hover {
          background: var(--bg);
        }

        .inline-edit-overlay {
          position: absolute;
          transform: translate(-50%, -50%);
          z-index: 100;
        }

        .inline-edit-input {
          padding: 6px 10px;
          border: 2px solid var(--accent);
          border-radius: 6px;
          background: var(--panel);
          color: var(--text);
          font-size: 13px;
          font-weight: 500;
          text-align: center;
          min-width: 100px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .inline-edit-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px var(--accent-soft), 0 4px 12px rgba(0,0,0,0.15);
        }

        /* ============================================
           PROPERTIES PANEL - Redesigned
           ============================================ */
        .sd-properties {
          width: 280px;
          background: var(--panel);
          border-left: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          box-shadow: -4px 0 12px rgba(0, 0, 0, 0.05);
        }

        .properties-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
        }

        .properties-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .properties-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: 600;
        }

        .properties-title-info {
          display: flex;
          flex-direction: column;
        }

        .properties-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.2;
        }

        .properties-type {
          font-size: 11px;
          color: var(--text-muted);
        }

        .properties-close {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .properties-close:hover {
          background: var(--border);
          color: var(--text);
        }

        .properties-content {
          padding: 0;
          overflow-y: auto;
          flex: 1;
        }

        .prop-section {
          padding: 14px;
          border-bottom: 1px solid var(--border);
        }

        .prop-section-header {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .prop-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .prop-group {
          margin-bottom: 12px;
        }

        .prop-group.compact {
          flex: 1;
          margin-bottom: 0;
        }

        .prop-group label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .prop-group input,
        .prop-group textarea,
        .prop-group select {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 13px;
          transition: all 0.15s ease;
        }

        .prop-group input:focus,
        .prop-group textarea:focus,
        .prop-group select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        .prop-input-primary {
          font-size: 14px !important;
          font-weight: 500;
        }

        .prop-input-sm {
          padding: 6px 8px !important;
          font-size: 12px !important;
        }

        .prop-select {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 13px;
        }

        .prop-select-sm {
          padding: 6px 8px;
          font-size: 12px;
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
        }

        .prop-textarea {
          resize: vertical;
          min-height: 50px;
          font-size: 12px !important;
        }

        .color-compact {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .color-label {
          font-size: 10px;
          font-family: monospace;
          color: var(--text-muted);
        }

        .opacity-compact {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .opacity-val {
          font-size: 11px;
          color: var(--text-muted);
          min-width: 32px;
        }

        .prop-toggle-row {
          margin-top: 8px;
        }

        .prop-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 12px;
          color: var(--text);
        }

        .prop-toggle input {
          display: none;
        }

        .toggle-switch {
          width: 34px;
          height: 18px;
          background: var(--border);
          border-radius: 9px;
          position: relative;
          transition: all 0.2s ease;
        }

        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 14px;
          height: 14px;
          background: white;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .prop-toggle input:checked + .toggle-switch {
          background: var(--accent);
        }

        .prop-toggle input:checked + .toggle-switch::after {
          left: 18px;
        }

        .typography-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .typo-select {
          width: 55px;
          padding: 6px 4px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 12px;
          text-align: center;
        }

        .typo-btn-group {
          display: flex;
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow: hidden;
        }

        .typo-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: var(--bg);
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .typo-btn:first-child {
          border-right: 1px solid var(--border);
        }

        .typo-btn:hover {
          background: var(--border);
          color: var(--text);
        }

        .typo-btn.active {
          background: var(--accent);
          color: white;
        }

        .color-input-sm {
          width: 28px;
          height: 28px;
          padding: 2px;
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          background: var(--bg);
        }

        .equation-preview {
          padding: 8px 10px;
          background: var(--accent-soft);
          border-radius: 6px;
          border: 1px dashed var(--accent);
          margin-bottom: 10px;
          font-size: 11px;
        }

        .equation-label {
          color: var(--text-muted);
          margin-right: 6px;
        }

        .equation-preview code {
          font-family: monospace;
          color: var(--accent);
          font-weight: 500;
        }

        .polarity-btns {
          display: flex;
          gap: 4px;
        }

        .polarity-btn {
          flex: 1;
          padding: 8px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .polarity-btn:hover {
          border-color: var(--accent);
        }

        .polarity-btn.active {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .prop-actions {
          padding: 14px;
          border-top: 1px solid var(--border);
        }

        .delete-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 10px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.05);
          color: #ef4444;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: #ef4444;
        }

        /* Legacy styles kept for compatibility */
        .prop-value {
          padding: 8px 10px;
          background: var(--bg);
          border-radius: 6px;
          font-size: 13px;
          color: var(--text);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px !important;
          color: var(--text) !important;
          cursor: pointer;
        }

        .checkbox-label input {
          width: auto;
        }

        .color-picker-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .color-input {
          width: 32px;
          height: 32px;
          padding: 2px;
          border: 1px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          background: var(--bg);
        }

        .color-text {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          color: var(--text);
          font-size: 13px;
          font-family: monospace;
        }

        .color-input.small {
          width: 28px;
          height: 28px;
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

        .font-family-select {
          width: 120px;
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

        .slider-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .opacity-slider {
          flex: 1;
          height: 6px;
          -webkit-appearance: none;
          appearance: none;
          background: var(--border);
          border-radius: 3px;
          cursor: pointer;
        }

        .opacity-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: var(--accent);
          border-radius: 50%;
          cursor: pointer;
        }

        .opacity-value {
          font-size: 12px;
          color: var(--text-muted);
          min-width: 40px;
          text-align: right;
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
          margin: 0;
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
          font-size: 12px;
        }

        .diagram-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .diagram-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .diagram-item:hover {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .diagram-info {
          flex: 1;
        }

        .diagram-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .diagram-meta {
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

        .loop-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #3b82f6;
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

        .health-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #f59e0b;
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

        .sd-btn.active {
          background: var(--accent-soft);
          border-color: var(--accent);
          color: var(--accent);
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

export async function getServerSideProps() {
  return { props: {} };
}
