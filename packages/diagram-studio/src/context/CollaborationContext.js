/**
 * CollaborationContext
 * Real-time collaboration state management using Yjs
 */

import React, { createContext, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { createPresence, generateUserColor } from '../types/collaboration.js';

/**
 * @typedef {Object} CollaborationState
 * @property {boolean} isConnected - WebSocket connection status
 * @property {boolean} isSyncing - Currently syncing changes
 * @property {Presence[]} presence - Active collaborators
 * @property {Comment[]} comments - Board comments
 * @property {number} pendingChanges - Unsaved changes count
 * @property {string|null} lastSyncedAt - Last sync timestamp
 * @property {string|null} error - Error message
 * @property {string|null} roomId - Current room/board ID
 */

const initialState = {
  isConnected: false,
  isSyncing: false,
  presence: [],
  comments: [],
  pendingChanges: 0,
  lastSyncedAt: null,
  error: null,
  roomId: null,
};

/**
 * Collaboration reducer
 */
function collaborationReducer(state, action) {
  switch (action.type) {
    case 'CONNECT':
      return {
        ...state,
        isConnected: true,
        error: null,
        roomId: action.payload.roomId,
      };

    case 'DISCONNECT':
      return {
        ...state,
        isConnected: false,
        presence: [],
        roomId: null,
      };

    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };

    case 'SYNC_COMPLETE':
      return {
        ...state,
        isSyncing: false,
        pendingChanges: 0,
        lastSyncedAt: new Date().toISOString(),
      };

    case 'INCREMENT_PENDING':
      return { ...state, pendingChanges: state.pendingChanges + 1 };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    // Presence updates
    case 'UPDATE_PRESENCE':
      return {
        ...state,
        presence: action.payload,
      };

    case 'ADD_PRESENCE': {
      const existing = state.presence.find((p) => p.odId === action.payload.odId);
      if (existing) {
        return {
          ...state,
          presence: state.presence.map((p) =>
            p.odId === action.payload.odId ? { ...p, ...action.payload } : p
          ),
        };
      }
      return {
        ...state,
        presence: [...state.presence, action.payload],
      };
    }

    case 'REMOVE_PRESENCE':
      return {
        ...state,
        presence: state.presence.filter((p) => p.odId !== action.payload),
      };

    case 'UPDATE_USER_PRESENCE': {
      const { odId, updates } = action.payload;
      return {
        ...state,
        presence: state.presence.map((p) =>
          p.odId === odId ? { ...p, ...updates, lastActiveAt: Date.now() } : p
        ),
      };
    }

    // Comments
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload };

    case 'ADD_COMMENT':
      return { ...state, comments: [...state.comments, action.payload] };

    case 'UPDATE_COMMENT':
      return {
        ...state,
        comments: state.comments.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      };

    case 'DELETE_COMMENT':
      return {
        ...state,
        comments: state.comments.filter((c) => c.id !== action.payload),
      };

    case 'RESOLVE_COMMENT':
      return {
        ...state,
        comments: state.comments.map((c) =>
          c.id === action.payload.id
            ? {
                ...c,
                resolved: true,
                resolvedBy: action.payload.userId,
                resolvedAt: new Date().toISOString(),
              }
            : c
        ),
      };

    case 'UNRESOLVE_COMMENT':
      return {
        ...state,
        comments: state.comments.map((c) =>
          c.id === action.payload
            ? { ...c, resolved: false, resolvedBy: null, resolvedAt: null }
            : c
        ),
      };

    default:
      return state;
  }
}

/**
 * Collaboration context
 */
export const CollaborationContext = createContext(null);

/**
 * CollaborationProvider component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.boardId - Board ID to connect to
 * @param {Object} props.user - Current user
 * @param {string} props.wsUrl - WebSocket server URL
 * @param {boolean} props.autoConnect - Auto-connect on mount
 */
export function CollaborationProvider({
  children,
  boardId,
  user,
  wsUrl = process.env.NEXT_PUBLIC_COLLAB_WS_URL || 'ws://localhost:4000',
  autoConnect = true,
}) {
  const [state, dispatch] = useReducer(collaborationReducer, initialState);
  const wsRef = useRef(null);
  const docRef = useRef(null);
  const awarenessRef = useRef(null);

  /**
   * Connect to collaboration server
   */
  const connect = useCallback(async () => {
    if (!boardId || !user) {
      dispatch({ type: 'SET_ERROR', payload: 'Missing boardId or user' });
      return;
    }

    try {
      // Dynamic import of yjs modules
      const Y = await import('yjs');
      const { WebsocketProvider } = await import('y-websocket');

      // Create Yjs document
      const doc = new Y.Doc();
      docRef.current = doc;

      // Connect WebSocket provider
      const provider = new WebsocketProvider(wsUrl, `board-${boardId}`, doc);
      wsRef.current = provider;

      // Set up awareness (presence)
      const awareness = provider.awareness;
      awarenessRef.current = awareness;

      // Set local user presence
      awareness.setLocalState({
        odId: user.id,
        odName: user.name,
        color: user.color || generateUserColor(user.id),
        cursor: null,
        selectedIds: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        isActive: true,
        lastActiveAt: Date.now(),
      });

      // Listen for awareness changes
      awareness.on('change', () => {
        const states = Array.from(awareness.getStates().values());
        dispatch({ type: 'UPDATE_PRESENCE', payload: states });
      });

      // Listen for connection status
      provider.on('status', ({ status }) => {
        if (status === 'connected') {
          dispatch({ type: 'CONNECT', payload: { roomId: boardId } });
        } else if (status === 'disconnected') {
          dispatch({ type: 'DISCONNECT' });
        }
      });

      // Listen for sync status
      provider.on('sync', (isSynced) => {
        if (isSynced) {
          dispatch({ type: 'SYNC_COMPLETE' });
        } else {
          dispatch({ type: 'SET_SYNCING', payload: true });
        }
      });
    } catch (error) {
      console.error('Failed to connect to collaboration server:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [boardId, user, wsUrl]);

  /**
   * Disconnect from collaboration server
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.destroy();
      wsRef.current = null;
    }
    if (docRef.current) {
      docRef.current.destroy();
      docRef.current = null;
    }
    awarenessRef.current = null;
    dispatch({ type: 'DISCONNECT' });
  }, []);

  /**
   * Update local presence
   */
  const updatePresence = useCallback((updates) => {
    if (awarenessRef.current) {
      const currentState = awarenessRef.current.getLocalState() || {};
      awarenessRef.current.setLocalState({
        ...currentState,
        ...updates,
        lastActiveAt: Date.now(),
      });
    }
  }, []);

  /**
   * Get Yjs document for external use
   */
  const getDocument = useCallback(() => docRef.current, []);

  /**
   * Comment operations
   */
  const addComment = useCallback(
    async (content, anchor = {}) => {
      const comment = {
        id: crypto.randomUUID(),
        boardId,
        parentId: anchor.parentId || null,
        userId: user.id,
        user: { id: user.id, name: user.name, avatar: user.avatar },
        content,
        anchorType: anchor.elementId ? 'element' : 'position',
        anchorElementId: anchor.elementId || null,
        anchorPosition: anchor.position || null,
        resolved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_COMMENT', payload: comment });

      // TODO: Sync to server
      return comment;
    },
    [boardId, user]
  );

  const updateComment = useCallback((id, updates) => {
    dispatch({
      type: 'UPDATE_COMMENT',
      payload: { id, updates: { ...updates, updatedAt: new Date().toISOString() } },
    });
    // TODO: Sync to server
  }, []);

  const deleteComment = useCallback((id) => {
    dispatch({ type: 'DELETE_COMMENT', payload: id });
    // TODO: Sync to server
  }, []);

  const resolveComment = useCallback(
    (id) => {
      dispatch({ type: 'RESOLVE_COMMENT', payload: { id, userId: user.id } });
      // TODO: Sync to server
    },
    [user]
  );

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && boardId && user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, boardId, user, connect, disconnect]);

  // Context value
  const value = useMemo(
    () => ({
      state,
      dispatch,
      connect,
      disconnect,
      updatePresence,
      getDocument,
      addComment,
      updateComment,
      deleteComment,
      resolveComment,
    }),
    [
      state,
      connect,
      disconnect,
      updatePresence,
      getDocument,
      addComment,
      updateComment,
      deleteComment,
      resolveComment,
    ]
  );

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

export default CollaborationContext;
