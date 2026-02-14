// components/diagram-core/DiagramCoreContext.js
// State management for DiagramCore

import { createContext, useContext, useReducer, useCallback, useMemo, useRef } from 'react';
import { generateId, snapToGrid, autoPosition } from './utils/helpers';

// === CONTEXT ===

const DiagramCoreContext = createContext(null);

// === ACTIONS ===

const ACTIONS = {
  SET_ELEMENTS: 'SET_ELEMENTS',
  ADD_ELEMENT: 'ADD_ELEMENT',
  UPDATE_ELEMENT: 'UPDATE_ELEMENT',
  DELETE_ELEMENT: 'DELETE_ELEMENT',
  DELETE_ELEMENTS: 'DELETE_ELEMENTS',

  SET_CONNECTIONS: 'SET_CONNECTIONS',
  ADD_CONNECTION: 'ADD_CONNECTION',
  UPDATE_CONNECTION: 'UPDATE_CONNECTION',
  DELETE_CONNECTION: 'DELETE_CONNECTION',

  SELECT: 'SELECT',
  SELECT_MULTIPLE: 'SELECT_MULTIPLE',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  SELECT_ALL: 'SELECT_ALL',

  SET_PAN: 'SET_PAN',
  SET_ZOOM: 'SET_ZOOM',
  SET_VIEW: 'SET_VIEW',

  PUSH_HISTORY: 'PUSH_HISTORY',
  UNDO: 'UNDO',
  REDO: 'REDO',

  SET_CONNECTING: 'SET_CONNECTING',
  SET_DRAGGING: 'SET_DRAGGING',
  SET_PENDING_STENCIL: 'SET_PENDING_STENCIL',
};

// === REDUCER ===

function diagramReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_ELEMENTS:
      return { ...state, elements: action.payload };

    case ACTIONS.ADD_ELEMENT:
      return {
        ...state,
        elements: [...state.elements, action.payload],
        selectedIds: [action.payload.id],
      };

    case ACTIONS.UPDATE_ELEMENT:
      return {
        ...state,
        elements: state.elements.map(el =>
          el.id === action.payload.id
            ? { ...el, ...action.payload.updates }
            : el
        ),
      };

    case ACTIONS.DELETE_ELEMENT:
      return {
        ...state,
        elements: state.elements.filter(el => el.id !== action.payload),
        connections: state.connections.filter(
          c => c.from !== action.payload && c.to !== action.payload
        ),
        selectedIds: state.selectedIds.filter(id => id !== action.payload),
      };

    case ACTIONS.DELETE_ELEMENTS:
      const idsToDelete = new Set(action.payload);
      return {
        ...state,
        elements: state.elements.filter(el => !idsToDelete.has(el.id)),
        connections: state.connections.filter(
          c => !idsToDelete.has(c.from) && !idsToDelete.has(c.to)
        ),
        selectedIds: state.selectedIds.filter(id => !idsToDelete.has(id)),
      };

    case ACTIONS.SET_CONNECTIONS:
      return { ...state, connections: action.payload };

    case ACTIONS.ADD_CONNECTION:
      return {
        ...state,
        connections: [...state.connections, action.payload],
      };

    case ACTIONS.UPDATE_CONNECTION:
      return {
        ...state,
        connections: state.connections.map(c =>
          c.id === action.payload.id
            ? { ...c, ...action.payload.updates }
            : c
        ),
      };

    case ACTIONS.DELETE_CONNECTION:
      return {
        ...state,
        connections: state.connections.filter(c => c.id !== action.payload),
      };

    case ACTIONS.SELECT:
      return { ...state, selectedIds: [action.payload] };

    case ACTIONS.SELECT_MULTIPLE:
      return { ...state, selectedIds: action.payload };

    case ACTIONS.CLEAR_SELECTION:
      return { ...state, selectedIds: [] };

    case ACTIONS.SELECT_ALL:
      return { ...state, selectedIds: state.elements.map(el => el.id) };

    case ACTIONS.SET_PAN:
      return { ...state, pan: action.payload };

    case ACTIONS.SET_ZOOM:
      return { ...state, zoom: action.payload };

    case ACTIONS.SET_VIEW:
      return {
        ...state,
        pan: action.payload.pan ?? state.pan,
        zoom: action.payload.zoom ?? state.zoom,
      };

    case ACTIONS.PUSH_HISTORY:
      return {
        ...state,
        history: [...state.history.slice(0, state.historyIndex + 1), action.payload],
        historyIndex: state.historyIndex + 1,
      };

    case ACTIONS.UNDO:
      if (state.historyIndex <= 0) return state;
      const prevState = state.history[state.historyIndex - 1];
      return {
        ...state,
        elements: prevState.elements,
        connections: prevState.connections,
        historyIndex: state.historyIndex - 1,
      };

    case ACTIONS.REDO:
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextState = state.history[state.historyIndex + 1];
      return {
        ...state,
        elements: nextState.elements,
        connections: nextState.connections,
        historyIndex: state.historyIndex + 1,
      };

    case ACTIONS.SET_CONNECTING:
      return { ...state, connecting: action.payload };

    case ACTIONS.SET_DRAGGING:
      return { ...state, dragging: action.payload };

    case ACTIONS.SET_PENDING_STENCIL:
      return { ...state, pendingStencil: action.payload };

    default:
      return state;
  }
}

// === INITIAL STATE ===

function createInitialState(defaultElements = [], defaultConnections = []) {
  return {
    elements: defaultElements,
    connections: defaultConnections,
    selectedIds: [],
    pan: { x: 0, y: 0 },
    zoom: 1,
    history: [{ elements: defaultElements, connections: defaultConnections }],
    historyIndex: 0,
    connecting: null,
    dragging: null,
    pendingStencil: null, // Stencil waiting to be placed on canvas
  };
}

// === PROVIDER ===

export function DiagramCoreProvider({
  children,
  defaultElements = [],
  defaultConnections = [],
  stencilConfig,
  gridConfig,
  connectionConfig,
  canvasConfig,
  onChange,
  onElementsChange,
  onConnectionsChange,
  onElementCreate,
  onElementUpdate,
  onElementDelete,
  onConnectionCreate,
  onSelectionChange,
}) {
  const [state, dispatch] = useReducer(
    diagramReducer,
    createInitialState(defaultElements, defaultConnections)
  );

  // Notify on changes
  const prevSelectionRef = useRef(state.selectedIds);
  if (prevSelectionRef.current !== state.selectedIds) {
    prevSelectionRef.current = state.selectedIds;
    onSelectionChange?.(state.selectedIds);
  }

  // === HISTORY ACTIONS (defined early as needed by element/connection actions) ===

  const pushHistory = useCallback(() => {
    dispatch({
      type: ACTIONS.PUSH_HISTORY,
      payload: { elements: state.elements, connections: state.connections },
    });
  }, [state.elements, state.connections]);

  // === ELEMENT ACTIONS ===

  const createElement = useCallback((options) => {
    const stencil = stencilConfig?.stencils?.find(s => s.id === options.type);
    const size = options.size || stencil?.defaultSize || { width: 120, height: 60 };

    let position = options.position;
    if (!position) {
      position = autoPosition(state.elements, stencil || {}, canvasConfig);
    }

    // Apply grid snapping
    if (gridConfig?.snap) {
      position.x = snapToGrid(position.x, gridConfig.size || 20, gridConfig.snapThreshold || 10);
      position.y = snapToGrid(position.y, gridConfig.size || 20, gridConfig.snapThreshold || 10);
    }

    // Generate ID first (ensure we don't use undefined from options)
    const newId = options.id || generateId('el');

    // Build element - spread options first so explicit properties override
    const element = {
      ...options,
      id: newId, // Ensure valid ID (override any undefined from spread)
      type: options.type,
      x: options.x ?? position.x,
      y: options.y ?? position.y,
      width: options.width ?? size.width,
      height: options.height ?? size.height,
      label: options.label || stencil?.name || 'New Element',
      color: options.color || stencil?.color || '#3b82f6',
      data: options.data || {},
    };

    dispatch({ type: ACTIONS.ADD_ELEMENT, payload: element });
    pushHistory();
    onElementCreate?.(element);
    const newElements = state.elements.concat(element);
    onElementsChange?.(newElements);
    onChange?.(newElements, state.connections);

    return element.id;
  }, [state.elements, state.connections, stencilConfig, gridConfig, canvasConfig, pushHistory, onChange, onElementsChange, onElementCreate]);

  const createElements = useCallback((elementConfigs) => {
    return elementConfigs.map(config => createElement(config));
  }, [createElement]);

  const updateElement = useCallback((id, updates) => {
    dispatch({ type: ACTIONS.UPDATE_ELEMENT, payload: { id, updates } });

    const element = state.elements.find(el => el.id === id);
    if (element) {
      const updated = { ...element, ...updates };
      const newElements = state.elements.map(el => el.id === id ? updated : el);
      onElementUpdate?.(id, updates);
      onElementsChange?.(newElements);
      onChange?.(newElements, state.connections);
    }
  }, [state.elements, state.connections, onChange, onElementsChange, onElementUpdate]);

  const deleteElement = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_ELEMENT, payload: id });
    pushHistory();
    onElementDelete?.(id);
    const newElements = state.elements.filter(el => el.id !== id);
    const newConnections = state.connections.filter(c => c.from !== id && c.to !== id);
    onElementsChange?.(newElements);
    onConnectionsChange?.(newConnections);
    onChange?.(newElements, newConnections);
  }, [state.elements, state.connections, pushHistory, onChange, onElementsChange, onConnectionsChange, onElementDelete]);

  const deleteElements = useCallback((ids) => {
    dispatch({ type: ACTIONS.DELETE_ELEMENTS, payload: ids });
    pushHistory();
    ids.forEach(id => onElementDelete?.(id));
  }, [pushHistory, onElementDelete]);

  // === Z-ORDERING ACTIONS ===

  const bringToFront = useCallback((id) => {
    const element = state.elements.find(el => el.id === id);
    if (!element) return;

    // Move element to end of array (renders on top)
    const newElements = [
      ...state.elements.filter(el => el.id !== id),
      element,
    ];
    dispatch({ type: ACTIONS.SET_ELEMENTS, payload: newElements });
    pushHistory();
    onElementsChange?.(newElements);
    onChange?.(newElements, state.connections);
  }, [state.elements, state.connections, pushHistory, onChange, onElementsChange]);

  const sendToBack = useCallback((id) => {
    const element = state.elements.find(el => el.id === id);
    if (!element) return;

    // Move element to beginning of array (renders behind)
    const newElements = [
      element,
      ...state.elements.filter(el => el.id !== id),
    ];
    dispatch({ type: ACTIONS.SET_ELEMENTS, payload: newElements });
    pushHistory();
    onElementsChange?.(newElements);
    onChange?.(newElements, state.connections);
  }, [state.elements, state.connections, pushHistory, onChange, onElementsChange]);

  // === CONNECTION ACTIONS ===

  const createConnection = useCallback((from, to, type) => {
    const connectionType = type || connectionConfig?.defaultType || 'arrow';
    const typeConfig = connectionConfig?.types?.find(t => t.id === connectionType);

    // Validate connection
    if (connectionConfig?.validateConnection) {
      const fromEl = state.elements.find(el => el.id === from);
      const toEl = state.elements.find(el => el.id === to);
      const valid = connectionConfig.validateConnection(fromEl, toEl, connectionType);
      if (!valid) return null;
    }

    const connection = {
      id: generateId('conn'),
      from,
      to,
      type: connectionType,
      color: typeConfig?.color || '#374151',
      strokeWidth: typeConfig?.strokeWidth || 2,
      strokeStyle: typeConfig?.strokeStyle || 'solid',
      label: typeConfig?.labelDefault || '',
    };

    dispatch({ type: ACTIONS.ADD_CONNECTION, payload: connection });
    pushHistory();
    onConnectionCreate?.(connection);
    const newConnections = state.connections.concat(connection);
    onConnectionsChange?.(newConnections);
    onChange?.(state.elements, newConnections);

    return connection.id;
  }, [state.elements, state.connections, connectionConfig, pushHistory, onChange, onConnectionsChange, onConnectionCreate]);

  const updateConnection = useCallback((id, updates) => {
    dispatch({ type: ACTIONS.UPDATE_CONNECTION, payload: { id, updates } });
  }, []);

  const deleteConnection = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_CONNECTION, payload: id });
    pushHistory();
  }, [pushHistory]);

  // === SELECTION ACTIONS ===

  const select = useCallback((id) => {
    dispatch({ type: ACTIONS.SELECT, payload: id });
  }, []);

  const selectMultiple = useCallback((ids) => {
    dispatch({ type: ACTIONS.SELECT_MULTIPLE, payload: ids });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_SELECTION });
  }, []);

  const selectAll = useCallback(() => {
    dispatch({ type: ACTIONS.SELECT_ALL });
  }, []);

  const toggleSelect = useCallback((id) => {
    if (state.selectedIds.includes(id)) {
      dispatch({
        type: ACTIONS.SELECT_MULTIPLE,
        payload: state.selectedIds.filter(sid => sid !== id),
      });
    } else {
      dispatch({
        type: ACTIONS.SELECT_MULTIPLE,
        payload: [...state.selectedIds, id],
      });
    }
  }, [state.selectedIds]);

  // === VIEW ACTIONS ===

  const setPan = useCallback((pan) => {
    dispatch({ type: ACTIONS.SET_PAN, payload: pan });
  }, []);

  const setZoom = useCallback((zoom) => {
    const clampedZoom = Math.max(
      canvasConfig?.minZoom || 0.1,
      Math.min(canvasConfig?.maxZoom || 3, zoom)
    );
    dispatch({ type: ACTIONS.SET_ZOOM, payload: clampedZoom });
  }, [canvasConfig]);

  const zoomTo = useCallback((level) => {
    setZoom(level);
  }, [setZoom]);

  const zoomToFit = useCallback(() => {
    // TODO: Calculate bounds and fit
    dispatch({ type: ACTIONS.SET_VIEW, payload: { pan: { x: 0, y: 0 }, zoom: 1 } });
  }, []);

  const panTo = useCallback((x, y) => {
    dispatch({ type: ACTIONS.SET_PAN, payload: { x, y } });
  }, []);

  // === HISTORY ACTIONS ===

  const undo = useCallback(() => {
    dispatch({ type: ACTIONS.UNDO });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: ACTIONS.REDO });
  }, []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  // === INTERACTION STATE ===

  const setConnecting = useCallback((connecting) => {
    dispatch({ type: ACTIONS.SET_CONNECTING, payload: connecting });
  }, []);

  const setDragging = useCallback((dragging) => {
    dispatch({ type: ACTIONS.SET_DRAGGING, payload: dragging });
  }, []);

  const setPendingStencil = useCallback((stencil) => {
    dispatch({ type: ACTIONS.SET_PENDING_STENCIL, payload: stencil });
  }, []);

  // === DATA EXPORT ===

  const toJSON = useCallback(() => {
    return {
      elements: state.elements,
      connections: state.connections,
    };
  }, [state.elements, state.connections]);

  const fromJSON = useCallback((data) => {
    dispatch({ type: ACTIONS.SET_ELEMENTS, payload: data.elements || [] });
    dispatch({ type: ACTIONS.SET_CONNECTIONS, payload: data.connections || [] });
  }, []);

  // === CONTEXT VALUE ===

  const value = useMemo(() => ({
    // State
    elements: state.elements,
    connections: state.connections,
    selectedIds: state.selectedIds,
    pan: state.pan,
    zoom: state.zoom,
    connecting: state.connecting,
    dragging: state.dragging,
    pendingStencil: state.pendingStencil,

    // Config
    stencilConfig,
    gridConfig,
    connectionConfig,
    canvasConfig,

    // Element actions
    createElement,
    createElements,
    updateElement,
    deleteElement,
    deleteElements,
    bringToFront,
    sendToBack,
    getElement: (id) => state.elements.find(el => el.id === id),

    // Connection actions
    createConnection,
    updateConnection,
    deleteConnection,
    getConnection: (id) => state.connections.find(c => c.id === id),

    // Selection actions
    select,
    selectMultiple,
    clearSelection,
    selectAll,
    toggleSelect,
    isSelected: (id) => state.selectedIds.includes(id),
    getSelectedElements: () => state.elements.filter(el => state.selectedIds.includes(el.id)),

    // View actions
    setPan,
    setZoom,
    zoomTo,
    zoomToFit,
    panTo,

    // History
    undo,
    redo,
    canUndo,
    canRedo,

    // Interaction state
    setConnecting,
    setDragging,
    setPendingStencil,

    // Data
    toJSON,
    fromJSON,
  }), [
    state,
    stencilConfig,
    gridConfig,
    connectionConfig,
    canvasConfig,
    createElement,
    createElements,
    updateElement,
    deleteElement,
    deleteElements,
    createConnection,
    updateConnection,
    deleteConnection,
    select,
    selectMultiple,
    clearSelection,
    selectAll,
    toggleSelect,
    setPan,
    setZoom,
    zoomTo,
    zoomToFit,
    panTo,
    undo,
    redo,
    canUndo,
    canRedo,
    setConnecting,
    setDragging,
    setPendingStencil,
    toJSON,
    fromJSON,
  ]);

  return (
    <DiagramCoreContext.Provider value={value}>
      {children}
    </DiagramCoreContext.Provider>
  );
}

// === HOOK ===

export function useDiagramCore() {
  const context = useContext(DiagramCoreContext);
  if (!context) {
    throw new Error('useDiagramCore must be used within a DiagramCoreProvider');
  }
  return context;
}

export default DiagramCoreContext;
