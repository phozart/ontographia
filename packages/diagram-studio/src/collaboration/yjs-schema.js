/**
 * Yjs Document Schema for Diagram Studio
 * Defines the CRDT structure for real-time collaboration
 */

import * as Y from 'yjs';

/**
 * Create a new board document with the standard schema
 * @returns {Y.Doc}
 */
export function createBoardDocument() {
  const doc = new Y.Doc();

  // Initialize all top-level structures
  doc.getMap('elements');     // Element ID -> Y.Map (element data)
  doc.getMap('connections');  // Connection ID -> Y.Map (connection data)
  doc.getArray('layers');     // Array of Y.Map (layer data)
  doc.getMap('frames');       // Frame ID -> Y.Map (frame data)
  doc.getMap('groups');       // Group ID -> Y.Map (group data)
  doc.getArray('zOrder');     // Array of element IDs in z-order
  doc.getMap('settings');     // Board settings

  return doc;
}

/**
 * Add an element to the Yjs document
 * @param {Y.Doc} doc
 * @param {Object} element
 */
export function addElementToDoc(doc, element) {
  const elements = doc.getMap('elements');
  const yElement = new Y.Map();

  // Set all properties
  Object.entries(element).forEach(([key, value]) => {
    if (key === 'label' && typeof value === 'string') {
      // Use Y.Text for collaborative text editing
      const yText = new Y.Text();
      yText.insert(0, value);
      yElement.set(key, yText);
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Convert nested objects to Y.Map
      yElement.set(key, objectToYMap(value));
    } else if (Array.isArray(value)) {
      // Convert arrays to Y.Array
      yElement.set(key, arrayToYArray(value));
    } else {
      yElement.set(key, value);
    }
  });

  elements.set(element.id, yElement);

  // Add to z-order
  const zOrder = doc.getArray('zOrder');
  zOrder.push([element.id]);
}

/**
 * Update an element in the Yjs document
 * @param {Y.Doc} doc
 * @param {string} elementId
 * @param {Object} updates
 */
export function updateElementInDoc(doc, elementId, updates) {
  const elements = doc.getMap('elements');
  const yElement = elements.get(elementId);

  if (!yElement) {
    console.warn(`Element ${elementId} not found in document`);
    return;
  }

  doc.transact(() => {
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'label' && typeof value === 'string') {
        const yText = yElement.get('label');
        if (yText instanceof Y.Text) {
          yText.delete(0, yText.length);
          yText.insert(0, value);
        } else {
          const newYText = new Y.Text();
          newYText.insert(0, value);
          yElement.set('label', newYText);
        }
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        const existingMap = yElement.get(key);
        if (existingMap instanceof Y.Map) {
          // Merge updates into existing map
          mergeIntoYMap(existingMap, value);
        } else {
          yElement.set(key, objectToYMap(value));
        }
      } else {
        yElement.set(key, value);
      }
    });
  });
}

/**
 * Remove an element from the Yjs document
 * @param {Y.Doc} doc
 * @param {string} elementId
 */
export function removeElementFromDoc(doc, elementId) {
  doc.transact(() => {
    const elements = doc.getMap('elements');
    elements.delete(elementId);

    // Remove from z-order
    const zOrder = doc.getArray('zOrder');
    const index = zOrder.toArray().indexOf(elementId);
    if (index !== -1) {
      zOrder.delete(index, 1);
    }

    // Remove from any groups
    const groups = doc.getMap('groups');
    groups.forEach((yGroup) => {
      const childIds = yGroup.get('childIds');
      if (childIds instanceof Y.Array) {
        const idx = childIds.toArray().indexOf(elementId);
        if (idx !== -1) {
          childIds.delete(idx, 1);
        }
      }
    });
  });
}

/**
 * Add a connection to the Yjs document
 * @param {Y.Doc} doc
 * @param {Object} connection
 */
export function addConnectionToDoc(doc, connection) {
  const connections = doc.getMap('connections');
  const yConnection = objectToYMap(connection);
  connections.set(connection.id, yConnection);
}

/**
 * Update a connection in the Yjs document
 * @param {Y.Doc} doc
 * @param {string} connectionId
 * @param {Object} updates
 */
export function updateConnectionInDoc(doc, connectionId, updates) {
  const connections = doc.getMap('connections');
  const yConnection = connections.get(connectionId);

  if (!yConnection) {
    console.warn(`Connection ${connectionId} not found in document`);
    return;
  }

  doc.transact(() => {
    mergeIntoYMap(yConnection, updates);
  });
}

/**
 * Remove a connection from the Yjs document
 * @param {Y.Doc} doc
 * @param {string} connectionId
 */
export function removeConnectionFromDoc(doc, connectionId) {
  const connections = doc.getMap('connections');
  connections.delete(connectionId);
}

/**
 * Add a layer to the Yjs document
 * @param {Y.Doc} doc
 * @param {Object} layer
 * @param {number} [index] - Optional position to insert
 */
export function addLayerToDoc(doc, layer, index = undefined) {
  const layers = doc.getArray('layers');
  const yLayer = objectToYMap(layer);

  if (index !== undefined && index >= 0 && index < layers.length) {
    layers.insert(index, [yLayer]);
  } else {
    layers.push([yLayer]);
  }
}

/**
 * Add a frame to the Yjs document
 * @param {Y.Doc} doc
 * @param {Object} frame
 */
export function addFrameToDoc(doc, frame) {
  const frames = doc.getMap('frames');
  const yFrame = objectToYMap(frame);
  frames.set(frame.id, yFrame);
}

/**
 * Add a group to the Yjs document
 * @param {Y.Doc} doc
 * @param {Object} group
 */
export function addGroupToDoc(doc, group) {
  const groups = doc.getMap('groups');
  const yGroup = new Y.Map();

  Object.entries(group).forEach(([key, value]) => {
    if (key === 'childIds' && Array.isArray(value)) {
      const yArray = new Y.Array();
      yArray.push(value);
      yGroup.set(key, yArray);
    } else if (value !== null && typeof value === 'object') {
      yGroup.set(key, objectToYMap(value));
    } else {
      yGroup.set(key, value);
    }
  });

  groups.set(group.id, yGroup);
}

/**
 * Update board settings in the Yjs document
 * @param {Y.Doc} doc
 * @param {Object} settings
 */
export function updateSettingsInDoc(doc, settings) {
  const ySettings = doc.getMap('settings');
  doc.transact(() => {
    Object.entries(settings).forEach(([key, value]) => {
      ySettings.set(key, value);
    });
  });
}

/**
 * Move element in z-order
 * @param {Y.Doc} doc
 * @param {string} elementId
 * @param {'front'|'back'|'forward'|'backward'|number} position
 */
export function moveInZOrder(doc, elementId, position) {
  const zOrder = doc.getArray('zOrder');
  const currentIndex = zOrder.toArray().indexOf(elementId);

  if (currentIndex === -1) return;

  doc.transact(() => {
    zOrder.delete(currentIndex, 1);

    let newIndex;
    if (position === 'front') {
      newIndex = zOrder.length;
    } else if (position === 'back') {
      newIndex = 0;
    } else if (position === 'forward') {
      newIndex = Math.min(currentIndex + 1, zOrder.length);
    } else if (position === 'backward') {
      newIndex = Math.max(currentIndex - 1, 0);
    } else if (typeof position === 'number') {
      newIndex = Math.max(0, Math.min(position, zOrder.length));
    } else {
      newIndex = currentIndex;
    }

    zOrder.insert(newIndex, [elementId]);
  });
}

// ============ Conversion Helpers ============

/**
 * Convert a plain object to Y.Map
 * @param {Object} obj
 * @returns {Y.Map}
 */
export function objectToYMap(obj) {
  const yMap = new Y.Map();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      yMap.set(key, objectToYMap(value));
    } else if (Array.isArray(value)) {
      yMap.set(key, arrayToYArray(value));
    } else {
      yMap.set(key, value);
    }
  });
  return yMap;
}

/**
 * Convert an array to Y.Array
 * @param {Array} arr
 * @returns {Y.Array}
 */
export function arrayToYArray(arr) {
  const yArray = new Y.Array();
  const items = arr.map((item) => {
    if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
      return objectToYMap(item);
    } else if (Array.isArray(item)) {
      return arrayToYArray(item);
    }
    return item;
  });
  yArray.push(items);
  return yArray;
}

/**
 * Merge updates into an existing Y.Map
 * @param {Y.Map} yMap
 * @param {Object} updates
 */
export function mergeIntoYMap(yMap, updates) {
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const existing = yMap.get(key);
      if (existing instanceof Y.Map) {
        mergeIntoYMap(existing, value);
      } else {
        yMap.set(key, objectToYMap(value));
      }
    } else if (Array.isArray(value)) {
      yMap.set(key, arrayToYArray(value));
    } else {
      yMap.set(key, value);
    }
  });
}

/**
 * Convert Y.Map to plain object
 * @param {Y.Map} yMap
 * @returns {Object}
 */
export function yMapToObject(yMap) {
  const obj = {};
  yMap.forEach((value, key) => {
    if (value instanceof Y.Map) {
      obj[key] = yMapToObject(value);
    } else if (value instanceof Y.Array) {
      obj[key] = yArrayToArray(value);
    } else if (value instanceof Y.Text) {
      obj[key] = value.toString();
    } else {
      obj[key] = value;
    }
  });
  return obj;
}

/**
 * Convert Y.Array to plain array
 * @param {Y.Array} yArray
 * @returns {Array}
 */
export function yArrayToArray(yArray) {
  return yArray.toArray().map((item) => {
    if (item instanceof Y.Map) {
      return yMapToObject(item);
    } else if (item instanceof Y.Array) {
      return yArrayToArray(item);
    } else if (item instanceof Y.Text) {
      return item.toString();
    }
    return item;
  });
}

// ============ Document Extraction ============

/**
 * Extract all elements from the document
 * @param {Y.Doc} doc
 * @returns {Object[]}
 */
export function getElementsFromDoc(doc) {
  const elements = doc.getMap('elements');
  const result = [];
  elements.forEach((yElement, id) => {
    if (yElement instanceof Y.Map) {
      result.push({ id, ...yMapToObject(yElement) });
    }
  });
  return result;
}

/**
 * Extract all connections from the document
 * @param {Y.Doc} doc
 * @returns {Object[]}
 */
export function getConnectionsFromDoc(doc) {
  const connections = doc.getMap('connections');
  const result = [];
  connections.forEach((yConnection, id) => {
    if (yConnection instanceof Y.Map) {
      result.push({ id, ...yMapToObject(yConnection) });
    }
  });
  return result;
}

/**
 * Extract all layers from the document
 * @param {Y.Doc} doc
 * @returns {Object[]}
 */
export function getLayersFromDoc(doc) {
  const layers = doc.getArray('layers');
  return layers.toArray().map((yLayer) => {
    if (yLayer instanceof Y.Map) {
      return yMapToObject(yLayer);
    }
    return yLayer;
  });
}

/**
 * Extract all frames from the document
 * @param {Y.Doc} doc
 * @returns {Object[]}
 */
export function getFramesFromDoc(doc) {
  const frames = doc.getMap('frames');
  const result = [];
  frames.forEach((yFrame, id) => {
    if (yFrame instanceof Y.Map) {
      result.push({ id, ...yMapToObject(yFrame) });
    }
  });
  return result;
}

/**
 * Extract all groups from the document
 * @param {Y.Doc} doc
 * @returns {Object[]}
 */
export function getGroupsFromDoc(doc) {
  const groups = doc.getMap('groups');
  const result = [];
  groups.forEach((yGroup, id) => {
    if (yGroup instanceof Y.Map) {
      result.push({ id, ...yMapToObject(yGroup) });
    }
  });
  return result;
}

/**
 * Get z-order from document
 * @param {Y.Doc} doc
 * @returns {string[]}
 */
export function getZOrderFromDoc(doc) {
  const zOrder = doc.getArray('zOrder');
  return zOrder.toArray();
}

/**
 * Get settings from document
 * @param {Y.Doc} doc
 * @returns {Object}
 */
export function getSettingsFromDoc(doc) {
  const settings = doc.getMap('settings');
  return yMapToObject(settings);
}

/**
 * Initialize document from plain board data
 * @param {Y.Doc} doc
 * @param {Object} boardData
 */
export function initializeDocFromBoard(doc, boardData) {
  doc.transact(() => {
    // Clear existing data
    doc.getMap('elements').clear();
    doc.getMap('connections').clear();
    doc.getArray('layers').delete(0, doc.getArray('layers').length);
    doc.getMap('frames').clear();
    doc.getMap('groups').clear();
    doc.getArray('zOrder').delete(0, doc.getArray('zOrder').length);
    doc.getMap('settings').clear();

    // Populate elements
    if (boardData.elements) {
      boardData.elements.forEach((element) => {
        addElementToDoc(doc, element);
      });
    }

    // Populate connections
    if (boardData.connections) {
      boardData.connections.forEach((connection) => {
        addConnectionToDoc(doc, connection);
      });
    }

    // Populate layers
    if (boardData.layers) {
      boardData.layers.forEach((layer) => {
        addLayerToDoc(doc, layer);
      });
    }

    // Populate frames
    if (boardData.frames) {
      boardData.frames.forEach((frame) => {
        addFrameToDoc(doc, frame);
      });
    }

    // Populate groups
    if (boardData.groups) {
      boardData.groups.forEach((group) => {
        addGroupToDoc(doc, group);
      });
    }

    // Set z-order (override auto-added from elements)
    if (boardData.zOrder) {
      const zOrder = doc.getArray('zOrder');
      // Clear the auto-populated zOrder from addElementToDoc
      if (zOrder.length > 0) {
        zOrder.delete(0, zOrder.length);
      }
      // Add the explicit order
      zOrder.push(boardData.zOrder);
    }

    // Set settings
    if (boardData.settings) {
      updateSettingsInDoc(doc, boardData.settings);
    }
  });
}

/**
 * Export document to plain board data
 * @param {Y.Doc} doc
 * @returns {Object}
 */
export function exportDocToBoard(doc) {
  return {
    elements: getElementsFromDoc(doc),
    connections: getConnectionsFromDoc(doc),
    layers: getLayersFromDoc(doc),
    frames: getFramesFromDoc(doc),
    groups: getGroupsFromDoc(doc),
    zOrder: getZOrderFromDoc(doc),
    settings: getSettingsFromDoc(doc),
  };
}

export default {
  createBoardDocument,
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
  objectToYMap,
  arrayToYArray,
  yMapToObject,
  yArrayToArray,
  getElementsFromDoc,
  getConnectionsFromDoc,
  getLayersFromDoc,
  getFramesFromDoc,
  getGroupsFromDoc,
  getZOrderFromDoc,
  getSettingsFromDoc,
  initializeDocFromBoard,
  exportDocToBoard,
};
