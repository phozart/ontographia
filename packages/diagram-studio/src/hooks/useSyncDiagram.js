/**
 * useSyncDiagram Hook
 * Bidirectional sync between Yjs CRDT and React diagram state
 */

import { useEffect, useRef, useCallback } from 'react';
import { useDiagram } from './useDiagram.js';
import { useCollaboration } from './useCollaboration.js';
import {
  getElementsFromDoc,
  getConnectionsFromDoc,
  getLayersFromDoc,
  getFramesFromDoc,
  getGroupsFromDoc,
  getZOrderFromDoc,
  getSettingsFromDoc,
  addElementToDoc,
  updateElementInDoc,
  removeElementFromDoc,
  addConnectionToDoc,
  updateConnectionInDoc,
  removeConnectionFromDoc,
  addLayerToDoc,
  addFrameToDoc,
  addGroupToDoc,
  updateSettingsInDoc,
  moveInZOrder,
} from '../collaboration/yjs-schema.js';

/**
 * Hook to synchronize diagram state with Yjs document
 * @param {Object} options
 * @param {boolean} options.enabled - Whether sync is enabled
 * @returns {Object} Sync utilities
 */
export function useSyncDiagram({ enabled = true } = {}) {
  const { state, dispatch } = useDiagram();
  const { getDocument, state: collabState } = useCollaboration();

  const isRemoteUpdate = useRef(false);
  const lastSyncedState = useRef(null);
  const observersAttached = useRef(false);

  /**
   * Sync from Yjs document to React state
   */
  const syncFromDocument = useCallback(() => {
    const doc = getDocument();
    if (!doc) return;

    isRemoteUpdate.current = true;

    const elements = getElementsFromDoc(doc);
    const connections = getConnectionsFromDoc(doc);
    const layers = getLayersFromDoc(doc);
    const frames = getFramesFromDoc(doc);
    const groups = getGroupsFromDoc(doc);
    const zOrder = getZOrderFromDoc(doc);
    const settings = getSettingsFromDoc(doc);

    // Convert arrays to maps for React state
    const elementsMap = {};
    elements.forEach((el) => {
      elementsMap[el.id] = el;
    });

    const connectionsMap = {};
    connections.forEach((conn) => {
      connectionsMap[conn.id] = conn;
    });

    const layersMap = {};
    layers.forEach((layer) => {
      layersMap[layer.id] = layer;
    });

    const framesMap = {};
    frames.forEach((frame) => {
      framesMap[frame.id] = frame;
    });

    const groupsMap = {};
    groups.forEach((group) => {
      groupsMap[group.id] = group;
    });

    dispatch({
      type: 'LOAD_STATE',
      payload: {
        elements: elementsMap,
        connections: connectionsMap,
        layers: layersMap,
        frames: framesMap,
        groups: groupsMap,
        zOrder,
        settings,
      },
    });

    lastSyncedState.current = {
      elements: elementsMap,
      connections: connectionsMap,
      layers: layersMap,
      frames: framesMap,
      groups: groupsMap,
      zOrder,
      settings,
    };

    isRemoteUpdate.current = false;
  }, [getDocument, dispatch]);

  /**
   * Attach observers to Yjs document
   */
  const attachObservers = useCallback(() => {
    const doc = getDocument();
    if (!doc || observersAttached.current) return;

    const elements = doc.getMap('elements');
    const connections = doc.getMap('connections');
    const layers = doc.getArray('layers');
    const frames = doc.getMap('frames');
    const groups = doc.getMap('groups');
    const zOrder = doc.getArray('zOrder');
    const settings = doc.getMap('settings');

    const handleDeepChange = () => {
      if (!isRemoteUpdate.current) {
        syncFromDocument();
      }
    };

    elements.observeDeep(handleDeepChange);
    connections.observeDeep(handleDeepChange);
    layers.observeDeep(handleDeepChange);
    frames.observeDeep(handleDeepChange);
    groups.observeDeep(handleDeepChange);
    zOrder.observe(handleDeepChange);
    settings.observeDeep(handleDeepChange);

    observersAttached.current = true;

    return () => {
      elements.unobserveDeep(handleDeepChange);
      connections.unobserveDeep(handleDeepChange);
      layers.unobserveDeep(handleDeepChange);
      frames.unobserveDeep(handleDeepChange);
      groups.unobserveDeep(handleDeepChange);
      zOrder.unobserve(handleDeepChange);
      settings.unobserveDeep(handleDeepChange);
      observersAttached.current = false;
    };
  }, [getDocument, syncFromDocument]);

  /**
   * Sync local changes to Yjs document
   */
  const syncToDocument = useCallback((changedKeys) => {
    const doc = getDocument();
    if (!doc || isRemoteUpdate.current) return;

    const last = lastSyncedState.current || {
      elements: {},
      connections: {},
      layers: {},
      frames: {},
      groups: {},
      zOrder: [],
      settings: {},
    };

    // Handle element changes
    if (changedKeys.includes('elements')) {
      const currentElements = state.elements;
      const previousElements = last.elements;

      // Added or updated elements
      Object.entries(currentElements).forEach(([id, element]) => {
        if (!previousElements[id]) {
          // New element
          addElementToDoc(doc, element);
        } else if (JSON.stringify(element) !== JSON.stringify(previousElements[id])) {
          // Updated element
          updateElementInDoc(doc, id, element);
        }
      });

      // Removed elements
      Object.keys(previousElements).forEach((id) => {
        if (!currentElements[id]) {
          removeElementFromDoc(doc, id);
        }
      });
    }

    // Handle connection changes
    if (changedKeys.includes('connections')) {
      const currentConnections = state.connections;
      const previousConnections = last.connections;

      Object.entries(currentConnections).forEach(([id, connection]) => {
        if (!previousConnections[id]) {
          addConnectionToDoc(doc, connection);
        } else if (JSON.stringify(connection) !== JSON.stringify(previousConnections[id])) {
          updateConnectionInDoc(doc, id, connection);
        }
      });

      Object.keys(previousConnections).forEach((id) => {
        if (!currentConnections[id]) {
          removeConnectionFromDoc(doc, id);
        }
      });
    }

    // Handle layer changes
    if (changedKeys.includes('layers')) {
      const currentLayers = Object.values(state.layers);
      const previousLayers = Object.values(last.layers);

      currentLayers.forEach((layer) => {
        const exists = previousLayers.find((l) => l.id === layer.id);
        if (!exists) {
          addLayerToDoc(doc, layer);
        }
      });
    }

    // Handle frame changes
    if (changedKeys.includes('frames')) {
      const currentFrames = state.frames;
      const previousFrames = last.frames;

      Object.entries(currentFrames).forEach(([id, frame]) => {
        if (!previousFrames[id]) {
          addFrameToDoc(doc, frame);
        }
      });
    }

    // Handle group changes
    if (changedKeys.includes('groups')) {
      const currentGroups = state.groups;
      const previousGroups = last.groups;

      Object.entries(currentGroups).forEach(([id, group]) => {
        if (!previousGroups[id]) {
          addGroupToDoc(doc, group);
        }
      });
    }

    // Handle settings changes
    if (changedKeys.includes('settings')) {
      if (JSON.stringify(state.settings) !== JSON.stringify(last.settings)) {
        updateSettingsInDoc(doc, state.settings);
      }
    }

    // Update last synced state
    lastSyncedState.current = {
      elements: { ...state.elements },
      connections: { ...state.connections },
      layers: { ...state.layers },
      frames: { ...state.frames },
      groups: { ...state.groups },
      zOrder: [...state.zOrder],
      settings: { ...state.settings },
    };
  }, [getDocument, state]);

  /**
   * Effect to attach observers when connected
   */
  useEffect(() => {
    if (!enabled || !collabState.isConnected) return;

    const cleanup = attachObservers();

    // Initial sync from document
    syncFromDocument();

    return cleanup;
  }, [enabled, collabState.isConnected, attachObservers, syncFromDocument]);

  /**
   * Effect to sync local changes to document
   */
  useEffect(() => {
    if (!enabled || !collabState.isConnected || isRemoteUpdate.current) return;

    // Determine what changed
    const changedKeys = [];
    const last = lastSyncedState.current;

    if (last) {
      if (JSON.stringify(state.elements) !== JSON.stringify(last.elements)) {
        changedKeys.push('elements');
      }
      if (JSON.stringify(state.connections) !== JSON.stringify(last.connections)) {
        changedKeys.push('connections');
      }
      if (JSON.stringify(state.layers) !== JSON.stringify(last.layers)) {
        changedKeys.push('layers');
      }
      if (JSON.stringify(state.frames) !== JSON.stringify(last.frames)) {
        changedKeys.push('frames');
      }
      if (JSON.stringify(state.groups) !== JSON.stringify(last.groups)) {
        changedKeys.push('groups');
      }
      if (JSON.stringify(state.settings) !== JSON.stringify(last.settings)) {
        changedKeys.push('settings');
      }
    }

    if (changedKeys.length > 0) {
      syncToDocument(changedKeys);
    }
  }, [
    enabled,
    collabState.isConnected,
    state.elements,
    state.connections,
    state.layers,
    state.frames,
    state.groups,
    state.settings,
    syncToDocument,
  ]);

  return {
    syncFromDocument,
    syncToDocument,
    isRemoteUpdate: isRemoteUpdate.current,
  };
}

export default useSyncDiagram;
