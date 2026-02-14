/**
 * useOfflineMode Hook
 * React integration for offline mode and sync
 */

import { useState, useEffect, useCallback, useRef, useContext, createContext } from 'react';
import { OfflineManager, CONFLICT_STRATEGIES, CHANGE_TYPES } from '../offline/OfflineManager.js';

/**
 * Offline context for providing manager across components
 */
const OfflineContext = createContext(null);

/**
 * Offline provider component
 */
export function OfflineProvider({ children, options = {} }) {
  const [manager, setManager] = useState(null);
  const [status, setStatus] = useState({
    isOnline: true,
    isInitialized: false,
    syncInProgress: false,
    pendingCount: 0,
  });

  useEffect(() => {
    const offlineManager = new OfflineManager({
      ...options,
      onStatusChange: (newStatus) => {
        setStatus((prev) => ({ ...prev, ...newStatus }));
      },
      onSyncComplete: (results) => {
        setStatus((prev) => ({ ...prev, syncInProgress: false }));
        options.onSyncComplete?.(results);
      },
    });

    offlineManager.initialize().then(() => {
      setManager(offlineManager);
      setStatus((prev) => ({
        ...prev,
        isInitialized: true,
        isOnline: offlineManager.isOnline,
      }));
    });

    return () => {
      offlineManager.destroy();
    };
  }, []);

  const contextValue = {
    manager,
    status,
    setStatus,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
}

/**
 * Hook to access offline context
 */
export function useOfflineContext() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOfflineContext must be used within an OfflineProvider');
  }
  return context;
}

/**
 * Main offline mode hook
 */
export function useOfflineMode(boardId) {
  const { manager, status, setStatus } = useOfflineContext();
  const [pendingChanges, setPendingChanges] = useState([]);
  const [conflicts, setConflicts] = useState([]);

  // Load pending changes
  useEffect(() => {
    if (!manager || !boardId) return;

    const loadPending = async () => {
      const changes = await manager.getPendingChanges(boardId);
      setPendingChanges(changes);
      setStatus((prev) => ({ ...prev, pendingCount: changes.length }));
    };

    loadPending();

    const unsubscribe = manager.addListener((event) => {
      if (event.type === 'change_queued' && event.change.boardId === boardId) {
        loadPending();
      }
      if (event.type === 'sync_complete') {
        loadPending();
        if (event.results.conflicts.length > 0) {
          setConflicts(event.results.conflicts);
        }
      }
    });

    return unsubscribe;
  }, [manager, boardId]);

  /**
   * Queue a change for offline sync
   */
  const queueChange = useCallback(
    async (changeType, data) => {
      if (!manager || !boardId) return null;
      return manager.queueChange(boardId, changeType, data);
    },
    [manager, boardId]
  );

  /**
   * Queue element addition
   */
  const queueAddElement = useCallback(
    (element) => queueChange(CHANGE_TYPES.ADD_ELEMENT, { element }),
    [queueChange]
  );

  /**
   * Queue element update
   */
  const queueUpdateElement = useCallback(
    (elementId, updates) =>
      queueChange(CHANGE_TYPES.UPDATE_ELEMENT, { elementId, updates }),
    [queueChange]
  );

  /**
   * Queue element deletion
   */
  const queueDeleteElement = useCallback(
    (elementId) => queueChange(CHANGE_TYPES.DELETE_ELEMENT, { elementId }),
    [queueChange]
  );

  /**
   * Queue connection addition
   */
  const queueAddConnection = useCallback(
    (connection) => queueChange(CHANGE_TYPES.ADD_CONNECTION, { connection }),
    [queueChange]
  );

  /**
   * Queue connection update
   */
  const queueUpdateConnection = useCallback(
    (connectionId, updates) =>
      queueChange(CHANGE_TYPES.UPDATE_CONNECTION, { connectionId, updates }),
    [queueChange]
  );

  /**
   * Queue connection deletion
   */
  const queueDeleteConnection = useCallback(
    (connectionId) =>
      queueChange(CHANGE_TYPES.DELETE_CONNECTION, { connectionId }),
    [queueChange]
  );

  /**
   * Force sync now
   */
  const syncNow = useCallback(async () => {
    if (!manager) return null;
    setStatus((prev) => ({ ...prev, syncInProgress: true }));
    return manager.syncPendingChanges();
  }, [manager]);

  /**
   * Resolve a conflict
   */
  const resolveConflict = useCallback(
    async (conflict, resolution) => {
      setConflicts((prev) => prev.filter((c) => c.id !== conflict.id));
      // Apply resolution...
      return { resolved: true, conflict, resolution };
    },
    []
  );

  /**
   * Dismiss all conflicts
   */
  const dismissConflicts = useCallback(() => {
    setConflicts([]);
  }, []);

  return {
    // Status
    isOnline: status.isOnline,
    isInitialized: status.isInitialized,
    syncInProgress: status.syncInProgress,
    pendingCount: pendingChanges.length,
    pendingChanges,
    conflicts,

    // Actions
    queueChange,
    queueAddElement,
    queueUpdateElement,
    queueDeleteElement,
    queueAddConnection,
    queueUpdateConnection,
    queueDeleteConnection,
    syncNow,
    resolveConflict,
    dismissConflicts,
  };
}

/**
 * Hook for offline board caching
 */
export function useOfflineBoard(boardId) {
  const { manager, status } = useOfflineContext();
  const [cachedBoard, setCachedBoard] = useState(null);
  const [isCached, setIsCached] = useState(false);

  // Load cached board
  useEffect(() => {
    if (!manager || !boardId) return;

    const loadCached = async () => {
      const board = await manager.getBoard(boardId);
      if (board) {
        setCachedBoard(board);
        setIsCached(true);
      }
    };

    loadCached();
  }, [manager, boardId]);

  /**
   * Cache the current board state
   */
  const cacheBoard = useCallback(
    async (board) => {
      if (!manager) return null;
      const cached = await manager.saveBoard(board);
      setCachedBoard(cached);
      setIsCached(true);
      return cached;
    },
    [manager]
  );

  /**
   * Get cached board (for offline use)
   */
  const getCachedBoard = useCallback(async () => {
    if (!manager || !boardId) return null;
    return manager.getBoard(boardId);
  }, [manager, boardId]);

  return {
    cachedBoard,
    isCached,
    cacheBoard,
    getCachedBoard,
    isOnline: status.isOnline,
  };
}

/**
 * Hook for sync status indicator
 */
export function useSyncStatus() {
  const { manager, status } = useOfflineContext();
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    if (!manager) return;

    const updateStatus = async () => {
      const s = await manager.getSyncStatus();
      setSyncStatus(s);
    };

    updateStatus();

    const unsubscribe = manager.addListener(() => {
      updateStatus();
    });

    return unsubscribe;
  }, [manager]);

  return {
    ...status,
    ...syncStatus,
  };
}

/**
 * Offline status indicator component
 */
export function OfflineIndicator({ className = '' }) {
  const { isOnline, syncInProgress, pendingCount } = useSyncStatus();

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div
      className={`offline-indicator ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '13px',
        backgroundColor: isOnline ? '#FFF3E0' : '#FFEBEE',
        color: isOnline ? '#E65100' : '#C62828',
      }}
    >
      {!isOnline && (
        <>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#C62828',
            }}
          />
          <span>Offline</span>
        </>
      )}
      {syncInProgress && (
        <span>Syncing...</span>
      )}
      {pendingCount > 0 && !syncInProgress && (
        <span>{pendingCount} pending changes</span>
      )}
    </div>
  );
}

/**
 * Conflict resolver component
 */
export function ConflictResolver({
  conflicts,
  onResolve,
  onDismiss,
  className = '',
}) {
  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  const handleResolve = (conflict, strategy) => {
    onResolve?.(conflict, strategy);
  };

  return (
    <div
      className={`conflict-resolver ${className}`}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#FFF3E0',
          borderBottom: '1px solid #FFE0B2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontWeight: 500, color: '#E65100' }}>
          {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''} Detected
        </span>
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#666',
          }}
        >
          x
        </button>
      </div>

      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        {conflicts.map((conflict, index) => (
          <div
            key={conflict.id || index}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #eee',
            }}
          >
            <div style={{ marginBottom: '8px', fontSize: '14px' }}>
              <strong>{conflict.type}</strong>
              <span style={{ color: '#666', marginLeft: '8px' }}>
                {conflict.elementId || conflict.description}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleResolve(conflict, CONFLICT_STRATEGIES.LOCAL_WINS)}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  fontSize: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f5f5f5',
                  cursor: 'pointer',
                }}
              >
                Keep Mine
              </button>
              <button
                onClick={() => handleResolve(conflict, CONFLICT_STRATEGIES.REMOTE_WINS)}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  fontSize: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f5f5f5',
                  cursor: 'pointer',
                }}
              >
                Keep Theirs
              </button>
              <button
                onClick={() => handleResolve(conflict, CONFLICT_STRATEGIES.MERGE)}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  fontSize: '12px',
                  border: '1px solid #2196F3',
                  borderRadius: '4px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Merge
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Re-export types
export { CONFLICT_STRATEGIES, CHANGE_TYPES };

export default useOfflineMode;
