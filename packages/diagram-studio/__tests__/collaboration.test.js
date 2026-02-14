/**
 * Collaboration Tests
 * Tests for Yjs schema and collaboration utilities
 */

import * as Y from 'yjs';
import {
  createBoardDocument,
  addElementToDoc,
  updateElementInDoc,
  removeElementFromDoc,
  addConnectionToDoc,
  addLayerToDoc,
  addFrameToDoc,
  addGroupToDoc,
  updateSettingsInDoc,
  moveInZOrder,
  getElementsFromDoc,
  getConnectionsFromDoc,
  getZOrderFromDoc,
  getSettingsFromDoc,
  initializeDocFromBoard,
  exportDocToBoard,
  objectToYMap,
  yMapToObject,
} from '../src/collaboration/yjs-schema.js';

describe('Yjs Schema', () => {
  describe('createBoardDocument', () => {
    it('should create a Y.Doc with all required structures', () => {
      const doc = createBoardDocument();

      expect(doc).toBeInstanceOf(Y.Doc);
      expect(doc.getMap('elements')).toBeInstanceOf(Y.Map);
      expect(doc.getMap('connections')).toBeInstanceOf(Y.Map);
      expect(doc.getArray('layers')).toBeInstanceOf(Y.Array);
      expect(doc.getMap('frames')).toBeInstanceOf(Y.Map);
      expect(doc.getMap('groups')).toBeInstanceOf(Y.Map);
      expect(doc.getArray('zOrder')).toBeInstanceOf(Y.Array);
      expect(doc.getMap('settings')).toBeInstanceOf(Y.Map);

      doc.destroy();
    });
  });

  describe('Element Operations', () => {
    let doc;

    beforeEach(() => {
      doc = createBoardDocument();
    });

    afterEach(() => {
      doc.destroy();
    });

    it('should add an element to the document', () => {
      const element = {
        id: 'elem-1',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        size: { width: 100, height: 50 },
        label: 'Test Element',
      };

      addElementToDoc(doc, element);

      const elements = getElementsFromDoc(doc);
      expect(elements).toHaveLength(1);
      expect(elements[0].id).toBe('elem-1');
      expect(elements[0].type).toBe('rectangle');
      expect(elements[0].label).toBe('Test Element');

      const zOrder = getZOrderFromDoc(doc);
      expect(zOrder).toContain('elem-1');
    });

    it('should update an element in the document', () => {
      const element = {
        id: 'elem-1',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        size: { width: 100, height: 50 },
        label: 'Original',
      };

      addElementToDoc(doc, element);
      updateElementInDoc(doc, 'elem-1', {
        label: 'Updated',
        position: { x: 200, y: 200 },
      });

      const elements = getElementsFromDoc(doc);
      expect(elements[0].label).toBe('Updated');
      expect(elements[0].position.x).toBe(200);
    });

    it('should remove an element from the document', () => {
      addElementToDoc(doc, { id: 'elem-1', type: 'rect' });
      addElementToDoc(doc, { id: 'elem-2', type: 'rect' });

      removeElementFromDoc(doc, 'elem-1');

      const elements = getElementsFromDoc(doc);
      expect(elements).toHaveLength(1);
      expect(elements[0].id).toBe('elem-2');

      const zOrder = getZOrderFromDoc(doc);
      expect(zOrder).not.toContain('elem-1');
      expect(zOrder).toContain('elem-2');
    });
  });

  describe('Connection Operations', () => {
    let doc;

    beforeEach(() => {
      doc = createBoardDocument();
    });

    afterEach(() => {
      doc.destroy();
    });

    it('should add a connection to the document', () => {
      const connection = {
        id: 'conn-1',
        sourceId: 'elem-1',
        targetId: 'elem-2',
        type: 'arrow',
      };

      addConnectionToDoc(doc, connection);

      const connections = getConnectionsFromDoc(doc);
      expect(connections).toHaveLength(1);
      expect(connections[0].id).toBe('conn-1');
      expect(connections[0].sourceId).toBe('elem-1');
    });
  });

  describe('Z-Order Operations', () => {
    let doc;

    beforeEach(() => {
      doc = createBoardDocument();
      addElementToDoc(doc, { id: 'a', type: 'rect' });
      addElementToDoc(doc, { id: 'b', type: 'rect' });
      addElementToDoc(doc, { id: 'c', type: 'rect' });
    });

    afterEach(() => {
      doc.destroy();
    });

    it('should move element to front', () => {
      moveInZOrder(doc, 'a', 'front');
      const zOrder = getZOrderFromDoc(doc);
      expect(zOrder[zOrder.length - 1]).toBe('a');
    });

    it('should move element to back', () => {
      moveInZOrder(doc, 'c', 'back');
      const zOrder = getZOrderFromDoc(doc);
      expect(zOrder[0]).toBe('c');
    });

    it('should move element forward', () => {
      moveInZOrder(doc, 'a', 'forward');
      const zOrder = getZOrderFromDoc(doc);
      expect(zOrder.indexOf('a')).toBe(1);
    });

    it('should move element backward', () => {
      moveInZOrder(doc, 'c', 'backward');
      const zOrder = getZOrderFromDoc(doc);
      expect(zOrder.indexOf('c')).toBe(1);
    });
  });

  describe('Settings Operations', () => {
    let doc;

    beforeEach(() => {
      doc = createBoardDocument();
    });

    afterEach(() => {
      doc.destroy();
    });

    it('should update settings', () => {
      updateSettingsInDoc(doc, {
        gridEnabled: true,
        gridSize: 20,
        backgroundColor: '#f0f0f0',
      });

      const settings = getSettingsFromDoc(doc);
      expect(settings.gridEnabled).toBe(true);
      expect(settings.gridSize).toBe(20);
      expect(settings.backgroundColor).toBe('#f0f0f0');
    });
  });

  describe('Bulk Operations', () => {
    let doc;

    beforeEach(() => {
      doc = createBoardDocument();
    });

    afterEach(() => {
      doc.destroy();
    });

    it('should initialize document from board data', () => {
      const boardData = {
        elements: [
          { id: 'e1', type: 'rect', position: { x: 0, y: 0 }, size: { width: 100, height: 50 } },
          { id: 'e2', type: 'circle', position: { x: 200, y: 100 }, size: { width: 80, height: 80 } },
        ],
        connections: [
          { id: 'c1', sourceId: 'e1', targetId: 'e2', type: 'arrow' },
        ],
        layers: [
          { id: 'layer-1', name: 'Main', visible: true },
        ],
        zOrder: ['e1', 'e2'],
        settings: {
          gridEnabled: true,
          gridSize: 10,
        },
      };

      initializeDocFromBoard(doc, boardData);

      const elements = getElementsFromDoc(doc);
      expect(elements).toHaveLength(2);

      const connections = getConnectionsFromDoc(doc);
      expect(connections).toHaveLength(1);

      const zOrder = getZOrderFromDoc(doc);
      expect(zOrder).toEqual(['e1', 'e2']);

      const settings = getSettingsFromDoc(doc);
      expect(settings.gridEnabled).toBe(true);
    });

    it('should export document to board data', () => {
      addElementToDoc(doc, {
        id: 'e1',
        type: 'rect',
        position: { x: 0, y: 0 },
      });
      addConnectionToDoc(doc, {
        id: 'c1',
        sourceId: 'e1',
        targetId: 'e2',
      });
      updateSettingsInDoc(doc, { gridEnabled: true });

      const boardData = exportDocToBoard(doc);

      expect(boardData.elements).toHaveLength(1);
      expect(boardData.connections).toHaveLength(1);
      expect(boardData.settings.gridEnabled).toBe(true);
      expect(boardData.zOrder).toContain('e1');
    });
  });

  describe('Conversion Utilities', () => {
    it('should convert object to Y.Map and back within a document', () => {
      const doc = new Y.Doc();
      const original = {
        name: 'Test',
        value: 42,
        nested: {
          a: 1,
          b: 2,
        },
        array: [1, 2, 3],
      };

      // Add the map to a document so it can be properly accessed
      const testMap = doc.getMap('test');
      Object.entries(original).forEach(([key, value]) => {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          testMap.set(key, objectToYMap(value));
        } else if (Array.isArray(value)) {
          const yArr = new Y.Array();
          yArr.push(value);
          testMap.set(key, yArr);
        } else {
          testMap.set(key, value);
        }
      });

      const result = yMapToObject(testMap);
      expect(result.name).toBe('Test');
      expect(result.value).toBe(42);
      expect(result.nested.a).toBe(1);
      expect(result.array).toEqual([1, 2, 3]);

      doc.destroy();
    });
  });
});

describe('CRDT Sync', () => {
  it('should merge concurrent changes', () => {
    const doc1 = createBoardDocument();
    const doc2 = createBoardDocument();

    // Add element to doc1
    addElementToDoc(doc1, { id: 'e1', type: 'rect', position: { x: 0, y: 0 } });

    // Sync doc1 to doc2
    const state1 = Y.encodeStateAsUpdate(doc1);
    Y.applyUpdate(doc2, state1);

    // Both docs should have the element
    expect(getElementsFromDoc(doc2)).toHaveLength(1);

    // Make concurrent changes
    updateElementInDoc(doc1, 'e1', { label: 'From Doc1' });
    addElementToDoc(doc2, { id: 'e2', type: 'circle', position: { x: 100, y: 100 } });

    // Sync both ways
    const update1 = Y.encodeStateAsUpdate(doc1);
    const update2 = Y.encodeStateAsUpdate(doc2);

    Y.applyUpdate(doc1, update2);
    Y.applyUpdate(doc2, update1);

    // Both docs should have merged state
    const elements1 = getElementsFromDoc(doc1);
    const elements2 = getElementsFromDoc(doc2);

    expect(elements1).toHaveLength(2);
    expect(elements2).toHaveLength(2);

    doc1.destroy();
    doc2.destroy();
  });

  it('should handle offline sync scenarios', () => {
    const doc1 = createBoardDocument();
    const doc2 = createBoardDocument();

    // Initial shared state
    addElementToDoc(doc1, { id: 'e1', type: 'rect' });
    Y.applyUpdate(doc2, Y.encodeStateAsUpdate(doc1));

    // Simulate offline editing on doc2
    updateElementInDoc(doc2, 'e1', { label: 'Offline edit 1' });
    updateElementInDoc(doc2, 'e1', { label: 'Offline edit 2' });
    addElementToDoc(doc2, { id: 'e2', type: 'circle' });

    // Meanwhile, doc1 also edits
    updateElementInDoc(doc1, 'e1', { position: { x: 500, y: 500 } });

    // When doc2 comes online, sync
    const offlineUpdates = Y.encodeStateAsUpdate(doc2);
    const onlineUpdates = Y.encodeStateAsUpdate(doc1);

    Y.applyUpdate(doc1, offlineUpdates);
    Y.applyUpdate(doc2, onlineUpdates);

    // Both should have both changes
    const elements1 = getElementsFromDoc(doc1);
    const elements2 = getElementsFromDoc(doc2);

    expect(elements1).toHaveLength(2);
    expect(elements2).toHaveLength(2);

    // Labels should match (last writer wins for concurrent primitive updates)
    expect(elements1.find(e => e.id === 'e1').label).toBe(elements2.find(e => e.id === 'e1').label);

    doc1.destroy();
    doc2.destroy();
  });
});
