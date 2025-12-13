// components/PresenceContext.js
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

const PresenceContext = createContext();

const HEARTBEAT_INTERVAL = 10000; // 10 seconds

export function PresenceProvider({ children }) {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [currentDiagramId, setCurrentDiagramId] = useState(null);
  const heartbeatRef = useRef(null);

  // Send presence update
  const updatePresence = useCallback(async () => {
    if (!user || !currentPage) return;

    try {
      const res = await fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          page: currentPage,
          diagramId: currentDiagramId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveUsers(data.users || []);
      }
    } catch (err) {
      console.error('Presence update failed:', err);
    }
  }, [user, currentPage, currentDiagramId]);

  // Remove presence on unmount
  const removePresence = useCallback(async () => {
    if (!user || !currentPage) return;

    try {
      await fetch('/api/presence', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, page: currentPage }),
      });
    } catch (err) {
      console.error('Presence removal failed:', err);
    }
  }, [user, currentPage]);

  // Join a page
  const joinPage = useCallback((page, diagramId = null) => {
    setCurrentPage(page);
    setCurrentDiagramId(diagramId);
  }, []);

  // Leave current page
  const leavePage = useCallback(() => {
    removePresence();
    setCurrentPage(null);
    setCurrentDiagramId(null);
    setActiveUsers([]);
  }, [removePresence]);

  // Set up heartbeat
  useEffect(() => {
    if (currentPage && user) {
      // Initial update
      updatePresence();

      // Set up heartbeat
      heartbeatRef.current = setInterval(updatePresence, HEARTBEAT_INTERVAL);

      return () => {
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
        }
        removePresence();
      };
    }
  }, [currentPage, user, updatePresence, removePresence]);

  // Handle page unload
  useEffect(() => {
    const handleUnload = () => {
      if (user && currentPage) {
        // Use sendBeacon for reliable delivery on unload
        navigator.sendBeacon('/api/presence', JSON.stringify({
          action: 'delete',
          user,
          page: currentPage,
        }));
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [user, currentPage]);

  // Get other users (excluding current user)
  const otherUsers = activeUsers.filter(u => u.user !== user);

  const value = {
    activeUsers,
    otherUsers,
    joinPage,
    leavePage,
    currentPage,
    currentDiagramId,
  };

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
}

// Utility component to show presence indicators
export function PresenceIndicator({ className = '' }) {
  const { otherUsers } = usePresence();

  if (otherUsers.length === 0) return null;

  // Generate a consistent color from username
  const getColorFromName = (name) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16',
      '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
      '#d946ef', '#ec4899', '#f43f5e',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`presence-indicator ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    }}>
      <div style={{
        display: 'flex',
        marginRight: 6,
      }}>
        {otherUsers.slice(0, 5).map((u, idx) => (
          <div
            key={u.user}
            title={`${u.user} is viewing`}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: getColorFromName(u.user),
              color: 'white',
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--panel)',
              marginLeft: idx > 0 ? -8 : 0,
              zIndex: otherUsers.length - idx,
              textTransform: 'uppercase',
            }}
          >
            {u.user.charAt(0)}
          </div>
        ))}
      </div>
      {otherUsers.length > 5 && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          +{otherUsers.length - 5}
        </span>
      )}
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        viewing
      </span>
    </div>
  );
}
