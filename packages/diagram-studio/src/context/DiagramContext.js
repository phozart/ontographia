/**
 * DiagramContext
 * Central state management for diagram operations
 */

import React, { createContext, useReducer, useCallback, useMemo } from 'react';
import { DEFAULT_BOARD_SETTINGS, createLayer } from '../types/diagram.js';

/**
 * @typedef {Object} DiagramState
 * @property {Object.<string, Element>} elements - Map of elements by ID
 * @property {Object.<string, Connection>} connections - Map of connections by ID
 * @property {Object.<string, Layer>} layers - Map of layers by ID
 * @property {Object.<string, Frame>} frames - Map of frames by ID
 * @property {Object.<string, Group>} groups - Map of groups by ID
 * @property {string[]} zOrder - Array of element IDs in z-order
 * @property {string[]} selectedIds - Currently selected element IDs
 * @property {BoardSettings} settings - Board settings
 * @property {Viewport} viewport - Current viewport state
 * @property {string} currentTool - Active tool mode
 * @property {string} currentLayerId - Active layer ID
 * @property {boolean} isLoading - Loading state
 * @property {Object[]} history - Undo history
 * @property {number} historyIndex - Current position in history
 * @property {Object} clipboard - Copied elements
 */

/**
 * Initial diagram state
 */
const initialState = {
  elements: {},
  connections: {},
  layers: {},
  frames: {},
  groups: {},
  zOrder: [],
  selectedIds: [],
  settings: DEFAULT_BOARD_SETTINGS,
  viewport: { x: 0, y: 0, zoom: 1 },
  currentTool: 'select',
  currentLayerId: 'default',
  isLoading: false,
  history: [],
  historyIndex: -1,
  clipboard: null,
};

/**
 * Diagram reducer for state updates
 */
function diagramReducer(state, action) {
  switch (action.type) {
    // Element operations
    case 'ADD_ELEMENT': {
      const { element } = action.payload;
      return {
        ...state,
        elements: { ...state.elements, [element.id]: element },
        zOrder: [...state.zOrder, element.id],
      };
    }

    case 'UPDATE_ELEMENT': {
      const { id, updates } = action.payload;
      if (!state.elements[id]) return state;
      return {
        ...state,
        elements: {
          ...state.elements,
          [id]: { ...state.elements[id], ...updates, updatedAt: new Date().toISOString() },
        },
      };
    }

    case 'DELETE_ELEMENTS': {
      const { ids } = action.payload;
      const idsSet = new Set(ids);
      const newElements = { ...state.elements };
      const newConnections = { ...state.connections };

      // Remove elements
      ids.forEach((id) => delete newElements[id]);

      // Remove connections attached to deleted elements
      Object.entries(newConnections).forEach(([connId, conn]) => {
        if (idsSet.has(conn.sourceId) || idsSet.has(conn.targetId)) {
          delete newConnections[connId];
        }
      });

      return {
        ...state,
        elements: newElements,
        connections: newConnections,
        zOrder: state.zOrder.filter((id) => !idsSet.has(id)),
        selectedIds: state.selectedIds.filter((id) => !idsSet.has(id)),
      };
    }

    case 'DELETE_SELECTED': {
      if (state.selectedIds.length === 0) return state;
      return diagramReducer(state, {
        type: 'DELETE_ELEMENTS',
        payload: { ids: state.selectedIds },
      });
    }

    case 'MOVE_ELEMENTS': {
      const { ids, delta } = action.payload;
      const newElements = { ...state.elements };
      ids.forEach((id) => {
        if (newElements[id]) {
          newElements[id] = {
            ...newElements[id],
            position: {
              x: newElements[id].position.x + delta.x,
              y: newElements[id].position.y + delta.y,
            },
            updatedAt: new Date().toISOString(),
          };
        }
      });
      return { ...state, elements: newElements };
    }

    // Connection operations
    case 'ADD_CONNECTION': {
      const { connection } = action.payload;
      return {
        ...state,
        connections: { ...state.connections, [connection.id]: connection },
      };
    }

    case 'UPDATE_CONNECTION': {
      const { id, updates } = action.payload;
      if (!state.connections[id]) return state;
      return {
        ...state,
        connections: {
          ...state.connections,
          [id]: { ...state.connections[id], ...updates, updatedAt: new Date().toISOString() },
        },
      };
    }

    case 'DELETE_CONNECTION': {
      const { id } = action.payload;
      const newConnections = { ...state.connections };
      delete newConnections[id];
      return { ...state, connections: newConnections };
    }

    // Selection operations
    case 'SELECT_ELEMENTS': {
      const { ids, additive } = action.payload;
      const newIds = additive
        ? [...new Set([...state.selectedIds, ...ids])]
        : ids;
      return { ...state, selectedIds: newIds };
    }

    case 'DESELECT_ELEMENTS': {
      const { ids } = action.payload;
      const idsSet = new Set(ids);
      return {
        ...state,
        selectedIds: state.selectedIds.filter((id) => !idsSet.has(id)),
      };
    }

    case 'SELECT_ALL': {
      return { ...state, selectedIds: Object.keys(state.elements) };
    }

    case 'CLEAR_SELECTION': {
      return { ...state, selectedIds: [] };
    }

    // Layer operations
    case 'ADD_LAYER': {
      const { layer } = action.payload;
      return {
        ...state,
        layers: { ...state.layers, [layer.id]: layer },
      };
    }

    case 'UPDATE_LAYER': {
      const { id, updates } = action.payload;
      if (!state.layers[id]) return state;
      return {
        ...state,
        layers: {
          ...state.layers,
          [id]: { ...state.layers[id], ...updates },
        },
      };
    }

    case 'SET_ACTIVE_LAYER': {
      const { id } = action.payload;
      return { ...state, currentLayerId: id };
    }

    // Frame operations
    case 'ADD_FRAME': {
      const { frame } = action.payload;
      return {
        ...state,
        frames: { ...state.frames, [frame.id]: frame },
      };
    }

    case 'UPDATE_FRAME': {
      const { id, updates } = action.payload;
      if (!state.frames[id]) return state;
      return {
        ...state,
        frames: {
          ...state.frames,
          [id]: { ...state.frames[id], ...updates },
        },
      };
    }

    case 'DELETE_FRAME': {
      const { id } = action.payload;
      const newFrames = { ...state.frames };
      delete newFrames[id];
      // Remove frame reference from elements
      const newElements = { ...state.elements };
      Object.values(newElements).forEach((el) => {
        if (el.frameId === id) {
          newElements[el.id] = { ...el, frameId: null };
        }
      });
      return { ...state, frames: newFrames, elements: newElements };
    }

    // Group operations
    case 'GROUP_SELECTED': {
      if (state.selectedIds.length < 2) return state;
      const groupId = `group-${Date.now()}`;
      const newElements = { ...state.elements };

      // Calculate bounds
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      state.selectedIds.forEach((id) => {
        const el = newElements[id];
        if (el) {
          newElements[id] = { ...el, groupId };
          minX = Math.min(minX, el.position.x);
          minY = Math.min(minY, el.position.y);
          maxX = Math.max(maxX, el.position.x + el.size.width);
          maxY = Math.max(maxY, el.position.y + el.size.height);
        }
      });

      return {
        ...state,
        elements: newElements,
        groups: {
          ...state.groups,
          [groupId]: {
            id: groupId,
            elementIds: [...state.selectedIds],
            bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
          },
        },
      };
    }

    case 'UNGROUP_SELECTED': {
      const groupIdsToRemove = new Set();
      const newElements = { ...state.elements };

      state.selectedIds.forEach((id) => {
        const el = newElements[id];
        if (el?.groupId) {
          groupIdsToRemove.add(el.groupId);
          newElements[id] = { ...el, groupId: null };
        }
      });

      const newGroups = { ...state.groups };
      groupIdsToRemove.forEach((gid) => delete newGroups[gid]);

      return { ...state, elements: newElements, groups: newGroups };
    }

    // Z-order operations
    case 'BRING_TO_FRONT': {
      const idsSet = new Set(state.selectedIds);
      const others = state.zOrder.filter((id) => !idsSet.has(id));
      return { ...state, zOrder: [...others, ...state.selectedIds] };
    }

    case 'SEND_TO_BACK': {
      const idsSet = new Set(state.selectedIds);
      const others = state.zOrder.filter((id) => !idsSet.has(id));
      return { ...state, zOrder: [...state.selectedIds, ...others] };
    }

    case 'BRING_FORWARD': {
      const newOrder = [...state.zOrder];
      state.selectedIds.forEach((id) => {
        const idx = newOrder.indexOf(id);
        if (idx >= 0 && idx < newOrder.length - 1) {
          [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
        }
      });
      return { ...state, zOrder: newOrder };
    }

    case 'SEND_BACKWARD': {
      const newOrder = [...state.zOrder];
      [...state.selectedIds].reverse().forEach((id) => {
        const idx = newOrder.indexOf(id);
        if (idx > 0) {
          [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
        }
      });
      return { ...state, zOrder: newOrder };
    }

    // Viewport operations
    case 'SET_VIEWPORT': {
      return {
        ...state,
        viewport: { ...state.viewport, ...action.payload },
      };
    }

    case 'ZOOM_TO_FIT': {
      // Calculate bounds of all elements
      if (Object.keys(state.elements).length === 0) {
        return { ...state, viewport: { x: 0, y: 0, zoom: 1 } };
      }

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      Object.values(state.elements).forEach((el) => {
        minX = Math.min(minX, el.position.x);
        minY = Math.min(minY, el.position.y);
        maxX = Math.max(maxX, el.position.x + el.size.width);
        maxY = Math.max(maxY, el.position.y + el.size.height);
      });

      const padding = 50;
      const contentWidth = maxX - minX + padding * 2;
      const contentHeight = maxY - minY + padding * 2;

      // Assume canvas size (would normally come from ref)
      const canvasWidth = 1200;
      const canvasHeight = 800;

      const zoom = Math.min(
        canvasWidth / contentWidth,
        canvasHeight / contentHeight,
        1
      );

      return {
        ...state,
        viewport: {
          x: -minX * zoom + (canvasWidth - contentWidth * zoom) / 2 + padding * zoom,
          y: -minY * zoom + (canvasHeight - contentHeight * zoom) / 2 + padding * zoom,
          zoom,
        },
      };
    }

    // Tool operations
    case 'SET_TOOL': {
      return { ...state, currentTool: action.payload };
    }

    // Settings operations
    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    }

    // Clipboard operations
    case 'COPY_SELECTED': {
      const elementsToCopy = state.selectedIds
        .map((id) => state.elements[id])
        .filter(Boolean);
      const connectionsToCopy = Object.values(state.connections).filter(
        (c) =>
          state.selectedIds.includes(c.sourceId) &&
          state.selectedIds.includes(c.targetId)
      );
      return {
        ...state,
        clipboard: { elements: elementsToCopy, connections: connectionsToCopy },
      };
    }

    case 'PASTE': {
      if (!state.clipboard) return state;

      const idMap = new Map();
      const offset = 20;
      const now = new Date().toISOString();

      // Clone elements with new IDs
      const newElements = { ...state.elements };
      const newZOrder = [...state.zOrder];
      const pastedIds = [];

      state.clipboard.elements.forEach((el) => {
        const newId = `${el.id}-copy-${Date.now()}`;
        idMap.set(el.id, newId);
        newElements[newId] = {
          ...el,
          id: newId,
          position: { x: el.position.x + offset, y: el.position.y + offset },
          createdAt: now,
          updatedAt: now,
        };
        newZOrder.push(newId);
        pastedIds.push(newId);
      });

      // Clone connections
      const newConnections = { ...state.connections };
      state.clipboard.connections.forEach((conn) => {
        const newId = `${conn.id}-copy-${Date.now()}`;
        newConnections[newId] = {
          ...conn,
          id: newId,
          sourceId: idMap.get(conn.sourceId),
          targetId: idMap.get(conn.targetId),
          createdAt: now,
          updatedAt: now,
        };
      });

      return {
        ...state,
        elements: newElements,
        connections: newConnections,
        zOrder: newZOrder,
        selectedIds: pastedIds,
      };
    }

    // Duplicate selected
    case 'DUPLICATE_SELECTED': {
      const copyAction = diagramReducer(state, { type: 'COPY_SELECTED' });
      return diagramReducer(copyAction, { type: 'PASTE' });
    }

    // Lock/unlock
    case 'TOGGLE_LOCK_SELECTED': {
      const newElements = { ...state.elements };
      state.selectedIds.forEach((id) => {
        if (newElements[id]) {
          newElements[id] = { ...newElements[id], locked: !newElements[id].locked };
        }
      });
      return { ...state, elements: newElements };
    }

    // History operations
    case 'PUSH_HISTORY': {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(action.payload);
      return {
        ...state,
        history: newHistory.slice(-50), // Keep last 50 states
        historyIndex: newHistory.length - 1,
      };
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const previousState = state.history[state.historyIndex - 1];
      return {
        ...previousState,
        history: state.history,
        historyIndex: state.historyIndex - 1,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextState = state.history[state.historyIndex + 1];
      return {
        ...nextState,
        history: state.history,
        historyIndex: state.historyIndex + 1,
      };
    }

    // Loading state
    case 'SET_LOADING': {
      return { ...state, isLoading: action.payload };
    }

    // Load full state
    case 'LOAD_STATE': {
      return { ...state, ...action.payload, isLoading: false };
    }

    // Reset state
    case 'RESET': {
      return { ...initialState };
    }

    default:
      return state;
  }
}

/**
 * Create the diagram context
 */
export const DiagramContext = createContext(null);

/**
 * DiagramProvider component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {Object} props.initialData - Initial board data
 */
export function DiagramProvider({ children, initialData = {} }) {
  const [state, dispatch] = useReducer(diagramReducer, {
    ...initialState,
    ...initialData,
    layers: initialData.layers || {
      default: createLayer({ id: 'default', name: 'Default Layer', order: 0 }),
    },
  });

  // Memoized context value
  const value = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state]
  );

  return (
    <DiagramContext.Provider value={value}>
      {children}
    </DiagramContext.Provider>
  );
}

export default DiagramContext;
