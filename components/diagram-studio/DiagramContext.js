// components/diagram-studio/DiagramContext.js
// State management for DiagramStudio component

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useDomains } from '../DomainContext';

// ============ CONTEXT ============

const DiagramContext = createContext({
  // Diagram data
  diagram: null,
  elements: [],
  connections: [],
  layers: [],
  groups: [],

  // UI state
  viewport: { x: 0, y: 0, scale: 1 },
  selection: { nodeIds: [], connectionIds: [] },
  activePack: 'process-flow',
  activeTool: 'select',
  showGrid: true,

  // History (undo/redo)
  canUndo: false,
  canRedo: false,

  // Save status
  saveStatus: { dirty: false, saving: false, lastSaved: null },

  // Loading state
  loading: false,
  error: null,

  // Actions
  setDiagram: () => {},
  setElements: () => {},
  setConnections: () => {},
  setViewport: () => {},
  setSelection: () => {},
  setActivePack: () => {},
  setActiveTool: () => {},
  setShowGrid: () => {},

  // Element operations
  addElement: () => {},
  updateElement: () => {},
  removeElement: () => {},

  // Connection operations
  addConnection: () => {},
  updateConnection: () => {},
  removeConnection: () => {},

  // Layer operations
  addLayer: () => {},
  updateLayer: () => {},
  removeLayer: () => {},
  reorderLayers: () => {},

  // Group operations
  groupElements: () => {},
  ungroupElements: () => {},

  // History operations
  undo: () => {},
  redo: () => {},
  recordHistory: () => {},

  // Persistence
  saveDiagram: () => {},
  loadDiagram: () => {},
  createDiagram: () => {},
});

// ============ HISTORY MANAGEMENT ============

const MAX_HISTORY_SIZE = 50;

function createHistorySnapshot(elements, connections) {
  return {
    elements: JSON.parse(JSON.stringify(elements)),
    connections: JSON.parse(JSON.stringify(connections)),
    timestamp: Date.now(),
  };
}

// ============ PROVIDER ============

// Default layer
const DEFAULT_LAYER = { id: 'default', name: 'Default', visible: true, locked: false, order: 0 };

export function DiagramProvider({ children, diagramId: initialDiagramId, defaultPack = 'process-flow', onSave: onSaveCallback }) {
  const { user, role } = useAuth();
  const { activeDomain } = useDomains();

  // Diagram data
  const [diagram, setDiagramState] = useState(null);
  const [elements, setElementsState] = useState([]);
  const [connections, setConnectionsState] = useState([]);
  const [layers, setLayersState] = useState([DEFAULT_LAYER]);
  const [groups, setGroupsState] = useState([]);

  // UI state
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [selection, setSelection] = useState({ nodeIds: [], connectionIds: [] });
  const [activePack, setActivePack] = useState(defaultPack);
  const [activeTool, setActiveTool] = useState('select');
  const [showGrid, setShowGrid] = useState(true);

  // History state
  const [historyPast, setHistoryPast] = useState([]);
  const [historyFuture, setHistoryFuture] = useState([]);

  // Save status
  const [saveStatus, setSaveStatus] = useState({ dirty: false, saving: false, lastSaved: null });

  // Loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-save timer ref
  const autoSaveTimerRef = useRef(null);
  const autoSaveIntervalMs = 30000; // 30 seconds

  // ============ HISTORY OPERATIONS ============

  const recordHistory = useCallback(() => {
    const snapshot = createHistorySnapshot(elements, connections);
    setHistoryPast(prev => {
      const newPast = [...prev, snapshot];
      if (newPast.length > MAX_HISTORY_SIZE) {
        return newPast.slice(-MAX_HISTORY_SIZE);
      }
      return newPast;
    });
    setHistoryFuture([]); // Clear redo stack on new action
    setSaveStatus(prev => ({ ...prev, dirty: true }));
  }, [elements, connections]);

  const undo = useCallback(() => {
    if (historyPast.length === 0) return;

    // Save current state to future
    const currentSnapshot = createHistorySnapshot(elements, connections);
    setHistoryFuture(prev => [currentSnapshot, ...prev]);

    // Restore previous state
    const previousSnapshot = historyPast[historyPast.length - 1];
    setHistoryPast(prev => prev.slice(0, -1));
    setElementsState(previousSnapshot.elements);
    setConnectionsState(previousSnapshot.connections);
    setSaveStatus(prev => ({ ...prev, dirty: true }));
  }, [historyPast, elements, connections]);

  const redo = useCallback(() => {
    if (historyFuture.length === 0) return;

    // Save current state to past
    const currentSnapshot = createHistorySnapshot(elements, connections);
    setHistoryPast(prev => [...prev, currentSnapshot]);

    // Restore future state
    const futureSnapshot = historyFuture[0];
    setHistoryFuture(prev => prev.slice(1));
    setElementsState(futureSnapshot.elements);
    setConnectionsState(futureSnapshot.connections);
    setSaveStatus(prev => ({ ...prev, dirty: true }));
  }, [historyFuture, elements, connections]);

  // ============ ELEMENT OPERATIONS ============

  const setElements = useCallback((newElements) => {
    recordHistory();
    setElementsState(typeof newElements === 'function' ? newElements(elements) : newElements);
  }, [elements, recordHistory]);

  const addElement = useCallback((element) => {
    recordHistory();
    const newElement = {
      id: element.id || `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...element,
    };
    setElementsState(prev => [...prev, newElement]);
    return newElement;
  }, [recordHistory]);

  const updateElement = useCallback((elementId, updates) => {
    recordHistory();
    setElementsState(prev => prev.map(el =>
      el.id === elementId
        ? { ...el, ...updates, updatedAt: new Date().toISOString() }
        : el
    ));
  }, [recordHistory]);

  const removeElement = useCallback((elementId) => {
    recordHistory();
    setElementsState(prev => prev.filter(el => el.id !== elementId));
    // Also remove connections to/from this element
    setConnectionsState(prev => prev.filter(
      conn => conn.sourceId !== elementId && conn.targetId !== elementId
    ));
    // Clear selection if removed element was selected
    setSelection(prev => ({
      nodeIds: prev.nodeIds.filter(id => id !== elementId),
      connectionIds: prev.connectionIds,
    }));
  }, [recordHistory]);

  // ============ CONNECTION OPERATIONS ============

  const setConnections = useCallback((newConnections) => {
    recordHistory();
    setConnectionsState(typeof newConnections === 'function' ? newConnections(connections) : newConnections);
  }, [connections, recordHistory]);

  const addConnection = useCallback((connection) => {
    recordHistory();
    const newConnection = {
      id: connection.id || `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...connection,
    };
    setConnectionsState(prev => [...prev, newConnection]);
    return newConnection;
  }, [recordHistory]);

  const updateConnection = useCallback((connectionId, updates) => {
    recordHistory();
    setConnectionsState(prev => prev.map(conn =>
      conn.id === connectionId
        ? { ...conn, ...updates, updatedAt: new Date().toISOString() }
        : conn
    ));
  }, [recordHistory]);

  const removeConnection = useCallback((connectionId) => {
    recordHistory();
    setConnectionsState(prev => prev.filter(conn => conn.id !== connectionId));
    // Clear selection if removed connection was selected
    setSelection(prev => ({
      nodeIds: prev.nodeIds,
      connectionIds: prev.connectionIds.filter(id => id !== connectionId),
    }));
  }, [recordHistory]);

  // ============ LAYER OPERATIONS ============

  const addLayer = useCallback((layer) => {
    recordHistory();
    const newLayer = {
      id: layer.id || `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: layer.name || `Layer ${layers.length + 1}`,
      visible: layer.visible !== false,
      locked: layer.locked || false,
      order: layers.length,
      ...layer,
    };
    setLayersState(prev => [...prev, newLayer]);
    return newLayer;
  }, [recordHistory, layers.length]);

  const updateLayer = useCallback((layerId, updates) => {
    recordHistory();
    setLayersState(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  }, [recordHistory]);

  const removeLayer = useCallback((layerId) => {
    if (layerId === 'default') return; // Cannot remove default layer
    recordHistory();
    // Move elements from deleted layer to default layer
    setElementsState(prev => prev.map(el =>
      el.layerId === layerId ? { ...el, layerId: 'default' } : el
    ));
    setLayersState(prev => prev.filter(layer => layer.id !== layerId));
  }, [recordHistory]);

  const reorderLayers = useCallback((newOrder) => {
    recordHistory();
    setLayersState(prev => {
      const layerMap = Object.fromEntries(prev.map(l => [l.id, l]));
      return newOrder.map((id, index) => ({ ...layerMap[id], order: index }));
    });
  }, [recordHistory]);

  // ============ GROUP OPERATIONS ============

  const groupElements = useCallback((elementIds) => {
    if (elementIds.length < 2) return null;
    recordHistory();

    const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get the bounding box of all elements to position the group
    const groupedElements = elements.filter(el => elementIds.includes(el.id));
    const minX = Math.min(...groupedElements.map(el => el.x));
    const minY = Math.min(...groupedElements.map(el => el.y));
    const maxX = Math.max(...groupedElements.map(el => el.x + (el.size?.width || 100)));
    const maxY = Math.max(...groupedElements.map(el => el.y + (el.size?.height || 60)));

    const newGroup = {
      id: groupId,
      name: `Group ${groups.length + 1}`,
      elementIds: [...elementIds],
      bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
      createdAt: new Date().toISOString(),
    };

    // Update elements to reference the group
    setElementsState(prev => prev.map(el =>
      elementIds.includes(el.id) ? { ...el, groupId } : el
    ));

    setGroupsState(prev => [...prev, newGroup]);
    return newGroup;
  }, [recordHistory, elements, groups.length]);

  const ungroupElements = useCallback((groupId) => {
    recordHistory();

    // Remove groupId from elements
    setElementsState(prev => prev.map(el =>
      el.groupId === groupId ? { ...el, groupId: undefined } : el
    ));

    // Remove the group
    setGroupsState(prev => prev.filter(g => g.id !== groupId));
  }, [recordHistory]);

  // ============ DIAGRAM OPERATIONS ============

  const setDiagram = useCallback((newDiagram) => {
    setDiagramState(newDiagram);
    if (newDiagram) {
      setElementsState(newDiagram.elements || []);
      setConnectionsState(newDiagram.connections || []);
      setLayersState(newDiagram.layers || [DEFAULT_LAYER]);
      setGroupsState(newDiagram.groups || []);
      setActivePack(newDiagram.type || 'process-flow');
      // Reset history when loading new diagram
      setHistoryPast([]);
      setHistoryFuture([]);
      setSaveStatus({ dirty: false, saving: false, lastSaved: newDiagram.updatedAt || null });
    }
  }, []);

  const loadDiagram = useCallback(async (diagramId) => {
    if (!user || !diagramId) return null;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/diagrams/${diagramId}`, {
        headers: { 'x-user': user, 'x-role': role || '' },
      });

      if (!res.ok) {
        throw new Error('Failed to load diagram');
      }

      const data = await res.json();
      setDiagram(data);
      return data;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, role, setDiagram]);

  const createDiagram = useCallback(async ({ name, type, description = '' }) => {
    if (!user || !activeDomain) return null;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/diagrams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user': user,
          'x-role': role || '',
        },
        body: JSON.stringify({
          name,
          type,
          description,
          domainId: activeDomain,
          elements: [],
          connections: [],
          settings: {},
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create diagram');
      }

      const data = await res.json();
      setDiagram(data);
      return data;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, role, activeDomain, setDiagram]);

  const saveDiagram = useCallback(async (force = false) => {
    if (!diagram?.id || (!saveStatus.dirty && !force)) return;

    setSaveStatus(prev => ({ ...prev, saving: true }));

    try {
      const res = await fetch(`/api/diagrams/${diagram.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user': user,
          'x-role': role || '',
        },
        body: JSON.stringify({
          ...diagram,
          elements,
          connections,
          layers,
          groups,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save diagram');
      }

      const data = await res.json();
      setDiagramState(prev => ({ ...prev, ...data }));
      setSaveStatus({ dirty: false, saving: false, lastSaved: new Date().toISOString() });

      // Call external save callback if provided
      if (onSaveCallback) {
        onSaveCallback({ elements, connections, layers, groups, diagram: data });
      }

      return data;
    } catch (e) {
      setError(e.message);
      setSaveStatus(prev => ({ ...prev, saving: false }));
      return null;
    }
  }, [diagram, elements, connections, layers, groups, saveStatus.dirty, user, role, onSaveCallback]);

  // ============ AUTO-SAVE ============

  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    // Set up new auto-save timer if we have a diagram
    if (diagram?.id && saveStatus.dirty) {
      autoSaveTimerRef.current = setInterval(() => {
        saveDiagram();
      }, autoSaveIntervalMs);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [diagram?.id, saveStatus.dirty, saveDiagram]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (saveStatus.dirty && diagram?.id) {
        saveDiagram(true);
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus.dirty, diagram?.id, saveDiagram]);

  // Auto-load diagram when initialDiagramId is provided
  useEffect(() => {
    if (initialDiagramId && user && !diagram) {
      loadDiagram(initialDiagramId);
    }
  }, [initialDiagramId, user, diagram, loadDiagram]);

  // ============ CONTEXT VALUE ============

  const value = useMemo(() => ({
    // Diagram data
    diagram,
    elements,
    connections,
    layers,
    groups,

    // UI state
    viewport,
    selection,
    activePack,
    activeTool,
    showGrid,

    // History
    canUndo: historyPast.length > 0,
    canRedo: historyFuture.length > 0,

    // Save status
    saveStatus,

    // Loading state
    loading,
    error,

    // Actions
    setDiagram,
    setElements,
    setConnections,
    setViewport,
    setSelection,
    setActivePack,
    setActiveTool,
    setShowGrid,

    // Element operations
    addElement,
    updateElement,
    removeElement,

    // Connection operations
    addConnection,
    updateConnection,
    removeConnection,

    // Layer operations
    addLayer,
    updateLayer,
    removeLayer,
    reorderLayers,

    // Group operations
    groupElements,
    ungroupElements,

    // History operations
    undo,
    redo,
    recordHistory,

    // Persistence
    saveDiagram,
    loadDiagram,
    createDiagram,
  }), [
    diagram, elements, connections, layers, groups,
    viewport, selection, activePack, activeTool, showGrid,
    historyPast.length, historyFuture.length,
    saveStatus, loading, error,
    setDiagram, setElements, setConnections,
    addElement, updateElement, removeElement,
    addConnection, updateConnection, removeConnection,
    addLayer, updateLayer, removeLayer, reorderLayers,
    groupElements, ungroupElements,
    undo, redo, recordHistory,
    saveDiagram, loadDiagram, createDiagram,
  ]);

  return (
    <DiagramContext.Provider value={value}>
      {children}
    </DiagramContext.Provider>
  );
}

// ============ HOOKS ============

export function useDiagram() {
  return useContext(DiagramContext);
}

export function useDiagramSelection() {
  const { selection, setSelection, elements, connections } = useContext(DiagramContext);

  const selectedElements = useMemo(() =>
    elements.filter(el => selection.nodeIds.includes(el.id)),
    [elements, selection.nodeIds]
  );

  const selectedConnections = useMemo(() =>
    connections.filter(conn => selection.connectionIds.includes(conn.id)),
    [connections, selection.connectionIds]
  );

  const selectElement = useCallback((elementId, addToSelection = false) => {
    setSelection(prev => ({
      nodeIds: addToSelection ? [...prev.nodeIds, elementId] : [elementId],
      connectionIds: addToSelection ? prev.connectionIds : [],
    }));
  }, [setSelection]);

  // Select multiple elements at once (for marquee selection)
  const selectElements = useCallback((elementIds, addToSelection = false) => {
    setSelection(prev => ({
      nodeIds: addToSelection
        ? [...new Set([...prev.nodeIds, ...elementIds])]
        : elementIds,
      connectionIds: addToSelection ? prev.connectionIds : [],
    }));
  }, [setSelection]);

  // Toggle element in selection (for shift+click)
  const toggleElementSelection = useCallback((elementId) => {
    setSelection(prev => {
      const isSelected = prev.nodeIds.includes(elementId);
      return {
        nodeIds: isSelected
          ? prev.nodeIds.filter(id => id !== elementId)
          : [...prev.nodeIds, elementId],
        connectionIds: prev.connectionIds,
      };
    });
  }, [setSelection]);

  // Select all elements
  const selectAll = useCallback(() => {
    setSelection({
      nodeIds: elements.map(el => el.id),
      connectionIds: connections.map(conn => conn.id),
    });
  }, [setSelection, elements, connections]);

  const selectConnection = useCallback((connectionId, addToSelection = false) => {
    setSelection(prev => ({
      nodeIds: addToSelection ? prev.nodeIds : [],
      connectionIds: addToSelection ? [...prev.connectionIds, connectionId] : [connectionId],
    }));
  }, [setSelection]);

  const clearSelection = useCallback(() => {
    setSelection({ nodeIds: [], connectionIds: [] });
  }, [setSelection]);

  const isElementSelected = useCallback((elementId) =>
    selection.nodeIds.includes(elementId),
    [selection.nodeIds]
  );

  const isConnectionSelected = useCallback((connectionId) =>
    selection.connectionIds.includes(connectionId),
    [selection.connectionIds]
  );

  return {
    selection,
    selectedElements,
    selectedConnections,
    selectElement,
    selectElements,
    toggleElementSelection,
    selectAll,
    selectConnection,
    clearSelection,
    isElementSelected,
    isConnectionSelected,
  };
}

export function useDiagramHistory() {
  const { canUndo, canRedo, undo, redo, recordHistory } = useContext(DiagramContext);
  return { canUndo, canRedo, undo, redo, recordHistory };
}

export function useDiagramViewport() {
  const { viewport, setViewport } = useContext(DiagramContext);

  const zoomIn = useCallback(() => {
    setViewport(prev => ({ ...prev, scale: Math.min(2, prev.scale * 1.2) }));
  }, [setViewport]);

  const zoomOut = useCallback(() => {
    setViewport(prev => ({ ...prev, scale: Math.max(0.25, prev.scale / 1.2) }));
  }, [setViewport]);

  const resetZoom = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1 });
  }, [setViewport]);

  const pan = useCallback((dx, dy) => {
    setViewport(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }, [setViewport]);

  return { viewport, setViewport, zoomIn, zoomOut, resetZoom, pan };
}

export default DiagramContext;
