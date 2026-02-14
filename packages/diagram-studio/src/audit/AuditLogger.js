/**
 * AuditLogger
 * Comprehensive audit logging for board activities
 */

/**
 * Audit event categories
 */
export const AUDIT_CATEGORIES = {
  BOARD: 'board',
  ELEMENT: 'element',
  CONNECTION: 'connection',
  COLLABORATION: 'collaboration',
  SHARING: 'sharing',
  EXPORT: 'export',
  SECURITY: 'security',
  SYSTEM: 'system',
};

/**
 * Audit event types
 */
export const AUDIT_EVENTS = {
  // Board events
  BOARD_CREATED: 'board.created',
  BOARD_OPENED: 'board.opened',
  BOARD_CLOSED: 'board.closed',
  BOARD_RENAMED: 'board.renamed',
  BOARD_DELETED: 'board.deleted',
  BOARD_DUPLICATED: 'board.duplicated',
  BOARD_RESTORED: 'board.restored',

  // Element events
  ELEMENT_CREATED: 'element.created',
  ELEMENT_UPDATED: 'element.updated',
  ELEMENT_DELETED: 'element.deleted',
  ELEMENT_MOVED: 'element.moved',
  ELEMENT_RESIZED: 'element.resized',
  ELEMENT_STYLED: 'element.styled',
  ELEMENT_LOCKED: 'element.locked',
  ELEMENT_UNLOCKED: 'element.unlocked',

  // Connection events
  CONNECTION_CREATED: 'connection.created',
  CONNECTION_UPDATED: 'connection.updated',
  CONNECTION_DELETED: 'connection.deleted',

  // Collaboration events
  USER_JOINED: 'collab.user_joined',
  USER_LEFT: 'collab.user_left',
  CURSOR_MOVED: 'collab.cursor_moved',
  SELECTION_CHANGED: 'collab.selection_changed',
  COMMENT_ADDED: 'collab.comment_added',
  COMMENT_EDITED: 'collab.comment_edited',
  COMMENT_DELETED: 'collab.comment_deleted',
  COMMENT_RESOLVED: 'collab.comment_resolved',

  // Sharing events
  SHARE_LINK_CREATED: 'sharing.link_created',
  SHARE_LINK_REVOKED: 'sharing.link_revoked',
  SHARE_LINK_ACCESSED: 'sharing.link_accessed',
  MEMBER_INVITED: 'sharing.member_invited',
  MEMBER_REMOVED: 'sharing.member_removed',
  ROLE_CHANGED: 'sharing.role_changed',

  // Export events
  BOARD_EXPORTED: 'export.board',
  FRAME_EXPORTED: 'export.frame',
  EMBED_CREATED: 'export.embed_created',

  // Security events
  LOGIN_SUCCESS: 'security.login_success',
  LOGIN_FAILED: 'security.login_failed',
  PERMISSION_DENIED: 'security.permission_denied',
  PASSWORD_ATTEMPT: 'security.password_attempt',

  // System events
  SYNC_COMPLETED: 'system.sync_completed',
  SYNC_FAILED: 'system.sync_failed',
  CONFLICT_DETECTED: 'system.conflict_detected',
  CONFLICT_RESOLVED: 'system.conflict_resolved',
  VERSION_CREATED: 'system.version_created',
  VERSION_RESTORED: 'system.version_restored',
};

/**
 * Severity levels
 */
export const SEVERITY = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  CRITICAL: 'critical',
};

/**
 * Create an audit entry
 */
export function createAuditEntry(event, data = {}) {
  const {
    userId,
    boardId,
    workspaceId,
    targetId,
    targetType,
    details = {},
    severity = SEVERITY.INFO,
    metadata = {},
  } = data;

  const entry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    event,
    category: getEventCategory(event),
    severity,
    timestamp: new Date().toISOString(),
    userId,
    boardId,
    workspaceId,
    target: targetId ? { id: targetId, type: targetType } : null,
    details,
    metadata: {
      ...metadata,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      url: typeof window !== 'undefined' ? window.location.href : null,
    },
  };

  return entry;
}

/**
 * Get category from event type
 */
function getEventCategory(event) {
  const prefix = event.split('.')[0];
  const categoryMap = {
    board: AUDIT_CATEGORIES.BOARD,
    element: AUDIT_CATEGORIES.ELEMENT,
    connection: AUDIT_CATEGORIES.CONNECTION,
    collab: AUDIT_CATEGORIES.COLLABORATION,
    sharing: AUDIT_CATEGORIES.SHARING,
    export: AUDIT_CATEGORIES.EXPORT,
    security: AUDIT_CATEGORIES.SECURITY,
    system: AUDIT_CATEGORIES.SYSTEM,
  };
  return categoryMap[prefix] || AUDIT_CATEGORIES.SYSTEM;
}

/**
 * Audit logger class
 */
export class AuditLogger {
  constructor(options = {}) {
    this.options = {
      batchSize: options.batchSize || 50,
      flushInterval: options.flushInterval || 5000,
      endpoint: options.endpoint || '/api/audit',
      enabled: options.enabled !== false,
      localStorageKey: options.localStorageKey || 'diagram-studio-audit-buffer',
      onLog: options.onLog || null,
      onFlush: options.onFlush || null,
      onError: options.onError || null,
      filter: options.filter || null,
    };

    this.buffer = [];
    this.flushTimer = null;
    this.sessionId = this.generateSessionId();

    if (this.options.enabled) {
      this.startFlushTimer();
      this.loadBufferFromStorage();
    }
  }

  /**
   * Generate a session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * Start the flush timer
   */
  startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.options.flushInterval);
  }

  /**
   * Stop the flush timer
   */
  stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Load buffer from local storage
   */
  loadBufferFromStorage() {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.options.localStorageKey);
      if (stored) {
        const entries = JSON.parse(stored);
        this.buffer = [...entries, ...this.buffer];
      }
    } catch (error) {
      console.error('Failed to load audit buffer:', error);
    }
  }

  /**
   * Save buffer to local storage
   */
  saveBufferToStorage() {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(
        this.options.localStorageKey,
        JSON.stringify(this.buffer)
      );
    } catch (error) {
      console.error('Failed to save audit buffer:', error);
    }
  }

  /**
   * Log an audit event
   */
  log(event, data = {}) {
    if (!this.options.enabled) return null;

    const entry = createAuditEntry(event, {
      ...data,
      metadata: {
        ...data.metadata,
        sessionId: this.sessionId,
      },
    });

    // Apply filter if provided
    if (this.options.filter && !this.options.filter(entry)) {
      return null;
    }

    this.buffer.push(entry);
    this.options.onLog?.(entry);

    // Save to storage
    this.saveBufferToStorage();

    // Flush if buffer is full
    if (this.buffer.length >= this.options.batchSize) {
      this.flush();
    }

    return entry;
  }

  /**
   * Flush buffer to server
   */
  async flush() {
    if (this.buffer.length === 0) return;

    const entries = [...this.buffer];
    this.buffer = [];

    // Clear storage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.options.localStorageKey);
    }

    try {
      const response = await fetch(this.options.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      });

      if (!response.ok) {
        throw new Error(`Audit flush failed: ${response.status}`);
      }

      this.options.onFlush?.(entries);
    } catch (error) {
      console.error('Audit flush error:', error);
      this.options.onError?.(error, entries);

      // Re-add failed entries to buffer
      this.buffer = [...entries, ...this.buffer];
      this.saveBufferToStorage();
    }
  }

  /**
   * Convenience methods for common events
   */

  // Board events
  boardCreated(boardId, userId, details = {}) {
    return this.log(AUDIT_EVENTS.BOARD_CREATED, { boardId, userId, details });
  }

  boardOpened(boardId, userId) {
    return this.log(AUDIT_EVENTS.BOARD_OPENED, { boardId, userId });
  }

  boardClosed(boardId, userId) {
    return this.log(AUDIT_EVENTS.BOARD_CLOSED, { boardId, userId });
  }

  // Element events
  elementCreated(boardId, userId, elementId, elementType) {
    return this.log(AUDIT_EVENTS.ELEMENT_CREATED, {
      boardId,
      userId,
      targetId: elementId,
      targetType: elementType,
    });
  }

  elementUpdated(boardId, userId, elementId, changes) {
    return this.log(AUDIT_EVENTS.ELEMENT_UPDATED, {
      boardId,
      userId,
      targetId: elementId,
      details: { changes },
    });
  }

  elementDeleted(boardId, userId, elementId) {
    return this.log(AUDIT_EVENTS.ELEMENT_DELETED, {
      boardId,
      userId,
      targetId: elementId,
    });
  }

  // Collaboration events
  userJoined(boardId, userId) {
    return this.log(AUDIT_EVENTS.USER_JOINED, { boardId, userId });
  }

  userLeft(boardId, userId) {
    return this.log(AUDIT_EVENTS.USER_LEFT, { boardId, userId });
  }

  commentAdded(boardId, userId, commentId, elementId) {
    return this.log(AUDIT_EVENTS.COMMENT_ADDED, {
      boardId,
      userId,
      targetId: commentId,
      details: { elementId },
    });
  }

  // Sharing events
  shareLinkCreated(boardId, userId, linkId, linkType) {
    return this.log(AUDIT_EVENTS.SHARE_LINK_CREATED, {
      boardId,
      userId,
      targetId: linkId,
      details: { linkType },
    });
  }

  shareLinkAccessed(boardId, linkId, accessInfo) {
    return this.log(AUDIT_EVENTS.SHARE_LINK_ACCESSED, {
      boardId,
      targetId: linkId,
      details: accessInfo,
    });
  }

  // Export events
  boardExported(boardId, userId, format) {
    return this.log(AUDIT_EVENTS.BOARD_EXPORTED, {
      boardId,
      userId,
      details: { format },
    });
  }

  // Security events
  permissionDenied(boardId, userId, action) {
    return this.log(AUDIT_EVENTS.PERMISSION_DENIED, {
      boardId,
      userId,
      details: { action },
      severity: SEVERITY.WARN,
    });
  }

  /**
   * Destroy the logger
   */
  destroy() {
    this.stopFlushTimer();
    this.flush(); // Final flush
  }
}

/**
 * Audit trail viewer component
 */
export function AuditTrail({
  entries,
  onLoadMore,
  hasMore,
  isLoading,
  className = '',
}) {
  const getEventIcon = (category) => {
    const icons = {
      [AUDIT_CATEGORIES.BOARD]: '📋',
      [AUDIT_CATEGORIES.ELEMENT]: '🔷',
      [AUDIT_CATEGORIES.CONNECTION]: '🔗',
      [AUDIT_CATEGORIES.COLLABORATION]: '👥',
      [AUDIT_CATEGORIES.SHARING]: '🔓',
      [AUDIT_CATEGORIES.EXPORT]: '📤',
      [AUDIT_CATEGORIES.SECURITY]: '🔐',
      [AUDIT_CATEGORIES.SYSTEM]: '⚙️',
    };
    return icons[category] || '📝';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      [SEVERITY.DEBUG]: '#9E9E9E',
      [SEVERITY.INFO]: '#2196F3',
      [SEVERITY.WARN]: '#FF9800',
      [SEVERITY.ERROR]: '#F44336',
      [SEVERITY.CRITICAL]: '#D32F2F',
    };
    return colors[severity] || '#666';
  };

  const formatEvent = (event) => {
    return event.replace(/\./g, ' ').replace(/_/g, ' ');
  };

  return (
    <div className={`audit-trail ${className}`}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Audit Trail</h3>
        <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '13px' }}>
          {entries.length} events
        </p>
      </div>

      <div
        style={{
          maxHeight: '400px',
          overflow: 'auto',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        {entries.map((entry) => (
          <div
            key={entry.id}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '18px' }}>
              {getEventIcon(entry.category)}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: '13px',
                    textTransform: 'capitalize',
                  }}
                >
                  {formatEvent(entry.event)}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#999',
                    flexShrink: 0,
                    marginLeft: '8px',
                  }}
                >
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px',
                }}
              >
                {entry.userId && <span>User: {entry.userId}</span>}
                {entry.target && (
                  <span style={{ marginLeft: '8px' }}>
                    {entry.target.type}: {entry.target.id}
                  </span>
                )}
              </div>
              {Object.keys(entry.details || {}).length > 0 && (
                <div
                  style={{
                    fontSize: '11px',
                    color: '#999',
                    marginTop: '4px',
                    fontFamily: 'monospace',
                  }}
                >
                  {JSON.stringify(entry.details)}
                </div>
              )}
            </div>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: getSeverityColor(entry.severity),
                flexShrink: 0,
                marginTop: '6px',
              }}
            />
          </div>
        ))}

        {hasMore && (
          <div style={{ padding: '12px', textAlign: 'center' }}>
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: isLoading ? 'wait' : 'pointer',
              }}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for using audit logger
 */
export function useAuditLogger(options = {}) {
  const [logger] = useState(() => new AuditLogger(options));

  // Cleanup on unmount
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      logger.flush();
    });
  }

  return logger;
}

// Singleton instance
let instance = null;

/**
 * Get or create singleton audit logger
 */
export function getAuditLogger(options) {
  if (!instance) {
    instance = new AuditLogger(options);
  }
  return instance;
}

export default AuditLogger;
