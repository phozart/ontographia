/**
 * useCollaboration Hook
 * Provides access to real-time collaboration features
 */

import { useContext, useCallback, useMemo, useEffect, useRef } from 'react';
import { CollaborationContext } from '../context/CollaborationContext.js';

/**
 * Hook to access collaboration state and actions
 * @returns {Object} Collaboration context value
 */
export function useCollaboration() {
  const context = useContext(CollaborationContext);

  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }

  return context;
}

/**
 * Hook for tracking remote presence (cursors, selections)
 * @returns {Object} Presence information
 */
export function usePresence() {
  const { state, updatePresence } = useCollaboration();

  const collaborators = useMemo(
    () => state.presence || [],
    [state.presence]
  );

  const activeCollaborators = useMemo(
    () => collaborators.filter((p) => p.isActive),
    [collaborators]
  );

  const updateCursor = useCallback(
    (cursor) => {
      updatePresence({ cursor });
    },
    [updatePresence]
  );

  const updateSelection = useCallback(
    (selectedIds) => {
      updatePresence({ selectedIds });
    },
    [updatePresence]
  );

  const updateViewport = useCallback(
    (viewport) => {
      updatePresence({ viewport });
    },
    [updatePresence]
  );

  return {
    collaborators,
    activeCollaborators,
    collaboratorCount: activeCollaborators.length,
    updateCursor,
    updateSelection,
    updateViewport,
  };
}

/**
 * Hook for remote cursor tracking with throttling
 * @param {number} throttleMs - Throttle interval in milliseconds
 * @returns {Function} Throttled cursor update function
 */
export function useRemoteCursor(throttleMs = 50) {
  const { updatePresence } = useCollaboration();
  const lastUpdateRef = useRef(0);
  const pendingCursorRef = useRef(null);
  const timeoutRef = useRef(null);

  const updateCursor = useCallback(
    (cursor) => {
      const now = Date.now();
      const elapsed = now - lastUpdateRef.current;

      if (elapsed >= throttleMs) {
        // Enough time has passed, update immediately
        lastUpdateRef.current = now;
        updatePresence({ cursor });
        pendingCursorRef.current = null;
      } else {
        // Throttle: queue the update
        pendingCursorRef.current = cursor;

        if (!timeoutRef.current) {
          timeoutRef.current = setTimeout(() => {
            if (pendingCursorRef.current) {
              lastUpdateRef.current = Date.now();
              updatePresence({ cursor: pendingCursorRef.current });
              pendingCursorRef.current = null;
            }
            timeoutRef.current = null;
          }, throttleMs - elapsed);
        }
      }
    },
    [updatePresence, throttleMs]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return updateCursor;
}

/**
 * Hook for connection status
 * @returns {Object} Connection state
 */
export function useConnectionStatus() {
  const { state, connect, disconnect } = useCollaboration();

  return {
    isConnected: state.isConnected,
    isSyncing: state.isSyncing,
    pendingChanges: state.pendingChanges,
    lastSyncedAt: state.lastSyncedAt,
    error: state.error,
    connect,
    disconnect,
  };
}

/**
 * Hook for comments functionality
 * @param {string} boardId - Board ID
 * @returns {Object} Comments state and actions
 */
export function useComments(boardId) {
  const { state, addComment, updateComment, deleteComment, resolveComment } = useCollaboration();

  const comments = useMemo(
    () => state.comments || [],
    [state.comments]
  );

  const unresolvedComments = useMemo(
    () => comments.filter((c) => !c.resolved),
    [comments]
  );

  const getCommentsForElement = useCallback(
    (elementId) =>
      comments.filter(
        (c) => c.anchorType === 'element' && c.anchorElementId === elementId
      ),
    [comments]
  );

  const getCommentsAtPosition = useCallback(
    (x, y, radius = 50) =>
      comments.filter((c) => {
        if (c.anchorType !== 'position' || !c.anchorPosition) return false;
        const dx = c.anchorPosition.x - x;
        const dy = c.anchorPosition.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= radius;
      }),
    [comments]
  );

  return {
    comments,
    unresolvedComments,
    unresolvedCount: unresolvedComments.length,
    getCommentsForElement,
    getCommentsAtPosition,
    addComment,
    updateComment,
    deleteComment,
    resolveComment,
  };
}

/**
 * Hook for detecting concurrent edits on same element
 * @param {string} elementId - Element ID to watch
 * @returns {Object} Concurrent edit information
 */
export function useConcurrentEdit(elementId) {
  const { state } = useCollaboration();

  const editingUsers = useMemo(() => {
    if (!elementId || !state.presence) return [];

    return state.presence.filter(
      (p) => p.selectedIds?.includes(elementId)
    );
  }, [elementId, state.presence]);

  return {
    hasOtherEditors: editingUsers.length > 0,
    editingUsers,
  };
}

export default useCollaboration;
