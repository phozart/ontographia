// components/UndoRedoContext.js
// Undo/Redo system for graph operations
import { createContext, useContext, useState, useCallback, useRef } from 'react';

const UndoRedoContext = createContext(null);

const MAX_HISTORY = 50;

export function UndoRedoProvider({ children }) {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const isUndoingRef = useRef(false);

  // Record an action that can be undone
  const recordAction = useCallback((action) => {
    if (isUndoingRef.current) return;

    setUndoStack(prev => {
      const newStack = [...prev, action];
      // Keep only last MAX_HISTORY items
      if (newStack.length > MAX_HISTORY) {
        return newStack.slice(-MAX_HISTORY);
      }
      return newStack;
    });
    // Clear redo stack when new action is recorded
    setRedoStack([]);
  }, []);

  // Undo the last action
  const undo = useCallback(async () => {
    if (undoStack.length === 0) return false;

    isUndoingRef.current = true;
    const action = undoStack[undoStack.length - 1];

    try {
      // Execute the undo operation
      if (action.undo) {
        await action.undo();
      }

      // Move action to redo stack
      setUndoStack(prev => prev.slice(0, -1));
      setRedoStack(prev => [...prev, action]);

      return true;
    } catch (error) {
      console.error('Undo failed:', error);
      return false;
    } finally {
      isUndoingRef.current = false;
    }
  }, [undoStack]);

  // Redo the last undone action
  const redo = useCallback(async () => {
    if (redoStack.length === 0) return false;

    isUndoingRef.current = true;
    const action = redoStack[redoStack.length - 1];

    try {
      // Execute the redo operation
      if (action.redo) {
        await action.redo();
      }

      // Move action back to undo stack
      setRedoStack(prev => prev.slice(0, -1));
      setUndoStack(prev => [...prev, action]);

      return true;
    } catch (error) {
      console.error('Redo failed:', error);
      return false;
    } finally {
      isUndoingRef.current = false;
    }
  }, [redoStack]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  // Get the description of what will be undone/redone
  const getUndoDescription = useCallback(() => {
    if (undoStack.length === 0) return null;
    return undoStack[undoStack.length - 1].description || 'Last action';
  }, [undoStack]);

  const getRedoDescription = useCallback(() => {
    if (redoStack.length === 0) return null;
    return redoStack[redoStack.length - 1].description || 'Last undone action';
  }, [redoStack]);

  const value = {
    recordAction,
    undo,
    redo,
    clearHistory,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    undoCount: undoStack.length,
    redoCount: redoStack.length,
    getUndoDescription,
    getRedoDescription,
  };

  return (
    <UndoRedoContext.Provider value={value}>
      {children}
    </UndoRedoContext.Provider>
  );
}

export function useUndoRedo() {
  const context = useContext(UndoRedoContext);
  if (!context) {
    // Return a no-op version if not wrapped in provider
    return {
      recordAction: () => {},
      undo: () => false,
      redo: () => false,
      clearHistory: () => {},
      canUndo: false,
      canRedo: false,
      undoCount: 0,
      redoCount: 0,
      getUndoDescription: () => null,
      getRedoDescription: () => null,
    };
  }
  return context;
}

// Helper hook for creating undoable actions
export function useUndoableAction() {
  const { recordAction } = useUndoRedo();

  return useCallback((description, doAction, undoAction) => {
    return {
      execute: async () => {
        const result = await doAction();
        recordAction({
          description,
          undo: undoAction,
          redo: doAction,
          timestamp: Date.now(),
        });
        return result;
      }
    };
  }, [recordAction]);
}

// Action creators for common operations
export const ActionTypes = {
  CREATE_NODE: 'CREATE_NODE',
  DELETE_NODE: 'DELETE_NODE',
  UPDATE_NODE: 'UPDATE_NODE',
  CREATE_RELATIONSHIP: 'CREATE_RELATIONSHIP',
  DELETE_RELATIONSHIP: 'DELETE_RELATIONSHIP',
  UPDATE_RELATIONSHIP: 'UPDATE_RELATIONSHIP',
  MOVE_NODE: 'MOVE_NODE',
  BULK_DELETE: 'BULK_DELETE',
};

export function createNodeAction(nodeData, deleteCallback) {
  return {
    type: ActionTypes.CREATE_NODE,
    description: `Create node "${nodeData.name}"`,
    data: nodeData,
    undo: deleteCallback,
    redo: async () => {
      // Will be set when action is recorded
    },
  };
}

export function deleteNodeAction(nodeId, nodeName, restoreCallback) {
  return {
    type: ActionTypes.DELETE_NODE,
    description: `Delete node "${nodeName}"`,
    data: { nodeId },
    undo: restoreCallback,
    redo: async () => {
      await fetch(`/api/nodes/${encodeURIComponent(nodeId)}`, { method: 'DELETE' });
    },
  };
}

export function updateNodeAction(nodeId, oldData, newData, revertCallback) {
  return {
    type: ActionTypes.UPDATE_NODE,
    description: `Update node "${newData.name || oldData.name}"`,
    data: { nodeId, oldData, newData },
    undo: revertCallback,
    redo: async () => {
      await fetch(`/api/nodes/${encodeURIComponent(nodeId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
    },
  };
}
