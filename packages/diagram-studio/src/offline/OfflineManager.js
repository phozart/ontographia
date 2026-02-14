/**
 * OfflineManager
 * Handles offline storage, sync queue, and conflict resolution
 */

/**
 * IndexedDB database name and version
 */
const DB_NAME = 'diagram-studio-offline';
const DB_VERSION = 1;

/**
 * Store names
 */
const STORES = {
  BOARDS: 'boards',
  PENDING_CHANGES: 'pending_changes',
  SYNC_METADATA: 'sync_metadata',
};

/**
 * Open IndexedDB database
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Boards store - cached board data
      if (!db.objectStoreNames.contains(STORES.BOARDS)) {
        const boardStore = db.createObjectStore(STORES.BOARDS, { keyPath: 'id' });
        boardStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Pending changes store - changes made while offline
      if (!db.objectStoreNames.contains(STORES.PENDING_CHANGES)) {
        const changesStore = db.createObjectStore(STORES.PENDING_CHANGES, {
          keyPath: 'id',
          autoIncrement: true,
        });
        changesStore.createIndex('boardId', 'boardId', { unique: false });
        changesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Sync metadata store
      if (!db.objectStoreNames.contains(STORES.SYNC_METADATA)) {
        db.createObjectStore(STORES.SYNC_METADATA, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Conflict resolution strategies
 */
export const CONFLICT_STRATEGIES = {
  LOCAL_WINS: 'local_wins',
  REMOTE_WINS: 'remote_wins',
  MERGE: 'merge',
  MANUAL: 'manual',
};

/**
 * Change types for tracking
 */
export const CHANGE_TYPES = {
  ADD_ELEMENT: 'add_element',
  UPDATE_ELEMENT: 'update_element',
  DELETE_ELEMENT: 'delete_element',
  ADD_CONNECTION: 'add_connection',
  UPDATE_CONNECTION: 'update_connection',
  DELETE_CONNECTION: 'delete_connection',
  ADD_FRAME: 'add_frame',
  UPDATE_FRAME: 'update_frame',
  DELETE_FRAME: 'delete_frame',
  UPDATE_SETTINGS: 'update_settings',
};

/**
 * OfflineManager class
 */
export class OfflineManager {
  constructor(options = {}) {
    this.db = null;
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.syncInProgress = false;
    this.conflictStrategy = options.conflictStrategy || CONFLICT_STRATEGIES.MERGE;
    this.onConflict = options.onConflict || null;
    this.onSyncComplete = options.onSyncComplete || null;
    this.onStatusChange = options.onStatusChange || null;
    this.listeners = new Set();

    // Bind event handlers
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
  }

  /**
   * Initialize the offline manager
   */
  async initialize() {
    this.db = await openDatabase();

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }

    return this;
  }

  /**
   * Cleanup
   */
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    if (this.db) {
      this.db.close();
    }
  }

  /**
   * Handle coming online
   */
  async handleOnline() {
    this.isOnline = true;
    this.onStatusChange?.({ isOnline: true });
    this.notifyListeners({ type: 'online' });

    // Attempt to sync pending changes
    await this.syncPendingChanges();
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    this.isOnline = false;
    this.onStatusChange?.({ isOnline: false });
    this.notifyListeners({ type: 'offline' });
  }

  /**
   * Add a listener for offline events
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event) {
    this.listeners.forEach((cb) => cb(event));
  }

  /**
   * Save board to offline storage
   */
  async saveBoard(board) {
    const tx = this.db.transaction(STORES.BOARDS, 'readwrite');
    const store = tx.objectStore(STORES.BOARDS);

    const boardData = {
      ...board,
      cachedAt: new Date().toISOString(),
    };

    await new Promise((resolve, reject) => {
      const request = store.put(boardData);
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });

    return boardData;
  }

  /**
   * Get board from offline storage
   */
  async getBoard(boardId) {
    const tx = this.db.transaction(STORES.BOARDS, 'readonly');
    const store = tx.objectStore(STORES.BOARDS);

    return new Promise((resolve, reject) => {
      const request = store.get(boardId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all cached boards
   */
  async getAllBoards() {
    const tx = this.db.transaction(STORES.BOARDS, 'readonly');
    const store = tx.objectStore(STORES.BOARDS);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Queue a change for later sync
   */
  async queueChange(boardId, changeType, data) {
    const tx = this.db.transaction(STORES.PENDING_CHANGES, 'readwrite');
    const store = tx.objectStore(STORES.PENDING_CHANGES);

    const change = {
      boardId,
      type: changeType,
      data,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    await new Promise((resolve, reject) => {
      const request = store.add(change);
      request.onsuccess = () => {
        change.id = request.result;
        resolve(change);
      };
      request.onerror = () => reject(request.error);
    });

    this.notifyListeners({ type: 'change_queued', change });

    // If online, try to sync immediately
    if (this.isOnline) {
      this.syncPendingChanges();
    }

    return change;
  }

  /**
   * Get pending changes for a board
   */
  async getPendingChanges(boardId) {
    const tx = this.db.transaction(STORES.PENDING_CHANGES, 'readonly');
    const store = tx.objectStore(STORES.PENDING_CHANGES);
    const index = store.index('boardId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(boardId);
      request.onsuccess = () => resolve(request.result.filter((c) => !c.synced));
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending changes
   */
  async getAllPendingChanges() {
    const tx = this.db.transaction(STORES.PENDING_CHANGES, 'readonly');
    const store = tx.objectStore(STORES.PENDING_CHANGES);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result.filter((c) => !c.synced));
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark changes as synced
   */
  async markChangesSynced(changeIds) {
    const tx = this.db.transaction(STORES.PENDING_CHANGES, 'readwrite');
    const store = tx.objectStore(STORES.PENDING_CHANGES);

    for (const id of changeIds) {
      await new Promise((resolve, reject) => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          const change = getRequest.result;
          if (change) {
            change.synced = true;
            change.syncedAt = new Date().toISOString();
            const putRequest = store.put(change);
            putRequest.onsuccess = resolve;
            putRequest.onerror = () => reject(putRequest.error);
          } else {
            resolve();
          }
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    }
  }

  /**
   * Clear synced changes older than a certain age
   */
  async clearOldChanges(maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
    const tx = this.db.transaction(STORES.PENDING_CHANGES, 'readwrite');
    const store = tx.objectStore(STORES.PENDING_CHANGES);
    const cutoff = new Date(Date.now() - maxAgeMs).toISOString();

    const allChanges = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    for (const change of allChanges) {
      if (change.synced && change.syncedAt < cutoff) {
        await new Promise((resolve, reject) => {
          const request = store.delete(change.id);
          request.onsuccess = resolve;
          request.onerror = () => reject(request.error);
        });
      }
    }
  }

  /**
   * Sync pending changes to server
   */
  async syncPendingChanges() {
    if (this.syncInProgress || !this.isOnline) {
      return { synced: 0, failed: 0, conflicts: [] };
    }

    this.syncInProgress = true;
    this.notifyListeners({ type: 'sync_start' });

    const results = {
      synced: 0,
      failed: 0,
      conflicts: [],
    };

    try {
      const pendingChanges = await this.getAllPendingChanges();

      // Group changes by board
      const changesByBoard = {};
      pendingChanges.forEach((change) => {
        if (!changesByBoard[change.boardId]) {
          changesByBoard[change.boardId] = [];
        }
        changesByBoard[change.boardId].push(change);
      });

      // Sync each board's changes
      for (const [boardId, changes] of Object.entries(changesByBoard)) {
        try {
          const syncResult = await this.syncBoardChanges(boardId, changes);
          results.synced += syncResult.synced;
          results.failed += syncResult.failed;
          results.conflicts.push(...syncResult.conflicts);
        } catch (error) {
          console.error(`Failed to sync board ${boardId}:`, error);
          results.failed += changes.length;
        }
      }

      this.onSyncComplete?.(results);
      this.notifyListeners({ type: 'sync_complete', results });
    } finally {
      this.syncInProgress = false;
    }

    return results;
  }

  /**
   * Sync changes for a specific board
   */
  async syncBoardChanges(boardId, changes) {
    const results = { synced: 0, failed: 0, conflicts: [] };

    try {
      // Send changes to server
      const response = await fetch(`/api/boards/${boardId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changes: changes.map((c) => ({
            type: c.type,
            data: c.data,
            timestamp: c.timestamp,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      const result = await response.json();

      // Handle conflicts
      if (result.conflicts && result.conflicts.length > 0) {
        for (const conflict of result.conflicts) {
          const resolution = await this.resolveConflict(conflict);
          if (resolution.resolved) {
            results.synced++;
          } else {
            results.conflicts.push(conflict);
          }
        }
      }

      // Mark successful changes as synced
      const syncedIds = changes
        .filter((c) => !result.conflicts?.some((conf) => conf.changeId === c.id))
        .map((c) => c.id);

      await this.markChangesSynced(syncedIds);
      results.synced += syncedIds.length;
    } catch (error) {
      console.error('Sync error:', error);
      results.failed = changes.length;
    }

    return results;
  }

  /**
   * Resolve a conflict
   */
  async resolveConflict(conflict) {
    const strategy = this.conflictStrategy;

    switch (strategy) {
      case CONFLICT_STRATEGIES.LOCAL_WINS:
        // Force local changes
        return { resolved: true, action: 'force_local' };

      case CONFLICT_STRATEGIES.REMOTE_WINS:
        // Accept remote changes, discard local
        return { resolved: true, action: 'accept_remote' };

      case CONFLICT_STRATEGIES.MERGE:
        // Attempt automatic merge
        return this.attemptMerge(conflict);

      case CONFLICT_STRATEGIES.MANUAL:
        // Call the conflict handler
        if (this.onConflict) {
          return await this.onConflict(conflict);
        }
        return { resolved: false, action: 'manual_required' };

      default:
        return { resolved: false, action: 'unknown_strategy' };
    }
  }

  /**
   * Attempt to automatically merge conflicting changes
   */
  attemptMerge(conflict) {
    const { localChange, remoteChange } = conflict;

    // If changes are to different properties, merge them
    if (localChange.type === 'update_element' && remoteChange.type === 'update_element') {
      const localProps = Object.keys(localChange.data.updates || {});
      const remoteProps = Object.keys(remoteChange.data.updates || {});

      const overlap = localProps.filter((p) => remoteProps.includes(p));

      if (overlap.length === 0) {
        // No overlapping properties, safe to merge
        return {
          resolved: true,
          action: 'merged',
          mergedData: {
            ...remoteChange.data.updates,
            ...localChange.data.updates,
          },
        };
      }
    }

    // Can't auto-merge, use timestamp-based resolution
    const localTime = new Date(localChange.timestamp).getTime();
    const remoteTime = new Date(remoteChange.timestamp).getTime();

    if (localTime > remoteTime) {
      return { resolved: true, action: 'local_newer' };
    } else {
      return { resolved: true, action: 'remote_newer' };
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    const pendingChanges = await this.getAllPendingChanges();

    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      pendingCount: pendingChanges.length,
      oldestPending: pendingChanges.length > 0
        ? pendingChanges.reduce((oldest, c) =>
            c.timestamp < oldest.timestamp ? c : oldest
          ).timestamp
        : null,
    };
  }
}

/**
 * Create a singleton instance
 */
let instance = null;

export function getOfflineManager(options) {
  if (!instance) {
    instance = new OfflineManager(options);
  }
  return instance;
}

export default OfflineManager;
