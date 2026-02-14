/**
 * NotificationBell - Header notification bell with dropdown panel
 *
 * Shows unread count badge and a dropdown of recent notifications.
 * Polls every 60 seconds for new notifications.
 *
 * @module components/shared/NotificationBell
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../AuthContext';

// --- Notification type icon SVGs (inline to avoid MUI dependency weight) ---

const ICON_SIZE = 16;

const icons = {
  gate_review_requested: (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="12" y1="18" x2="12" y2="12"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  ),
  gate_decision_made: (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="#5B8A6A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
    </svg>
  ),
  sla_warning: (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  sla_breach: (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="#A54D4D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  initiative_approved: (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="#5B8A6A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  initiative_declined: (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="#A54D4D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>
  ),
  plr_due: (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="#5C5A54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  comment_added: (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="#5C5A54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
};

// Bell icon for the header button
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

/**
 * Format a timestamp as relative time ("2m ago", "1h ago", "Yesterday", etc.)
 */
function formatRelativeTime(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return then.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const POLL_INTERVAL = 60000; // 60 seconds

export default function NotificationBell() {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const pollRef = useRef(null);

  // Fetch unread count (lightweight)
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications?unread=true&limit=1', {
        credentials: 'include',
        headers: { 'x-user': user.id || user.name || '' },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[NotificationBell] Failed to fetch unread count:', err);
    }
  }, [user]);

  // Fetch full notification list
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=20', {
        credentials: 'include',
        headers: { 'x-user': user.id || user.name || '' },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[NotificationBell] Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Poll for unread count
  useEffect(() => {
    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchUnreadCount]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [router.pathname]);

  // Mark single notification as read and navigate
  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await fetch(`/api/notifications/${notification.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'x-user': user?.id || user?.name || '',
          },
          body: JSON.stringify({ is_read: true }),
        });
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.warn('[NotificationBell] Failed to mark as read:', err);
      }
    }

    if (notification.link) {
      router.push(notification.link);
    }
    setOpen(false);
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
        headers: { 'x-user': user?.id || user?.name || '' },
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('[NotificationBell] Failed to mark all as read:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="notification-bell-wrap" ref={dropdownRef}>
      <button
        className="system-header-icon-btn notification-bell-btn"
        title="Notifications"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <span className="notification-dropdown-title">Notifications</span>
            {unreadCount > 0 && (
              <button
                className="notification-mark-all-btn"
                onClick={handleMarkAllRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-dropdown-list">
            {loading && notifications.length === 0 && (
              <div className="notification-empty">Loading...</div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="notification-empty">No notifications</div>
            )}

            {notifications.map(notification => (
              <button
                key={notification.id}
                className={`notification-item ${!notification.is_read ? 'notification-item--unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <span className="notification-item-icon">
                  {icons[notification.type] || icons.comment_added}
                </span>
                <div className="notification-item-content">
                  <span className="notification-item-title">{notification.title}</span>
                  {notification.message && (
                    <span className="notification-item-message">{notification.message}</span>
                  )}
                  <span className="notification-item-time">
                    {formatRelativeTime(notification.created_at)}
                  </span>
                </div>
                {!notification.is_read && (
                  <span className="notification-item-dot" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .notification-bell-wrap {
          position: relative;
        }

        .notification-bell-btn {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          font-size: 0.625rem;
          font-weight: 700;
          line-height: 16px;
          text-align: center;
          color: #FDFCFA;
          background: #A54D4D;
          border-radius: 8px;
          pointer-events: none;
        }

        .notification-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          width: 360px;
          max-height: 480px;
          background: #FDFCFA;
          border: 1px solid #E2E0DB;
          border-radius: 4px;
          box-shadow: 0 8px 24px rgba(31, 30, 27, 0.15), 0 2px 8px rgba(31, 30, 27, 0.08);
          z-index: 200;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .notification-dropdown-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid #E2E0DB;
          flex-shrink: 0;
        }

        .notification-dropdown-title {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #1F1E1B;
        }

        .notification-mark-all-btn {
          font-size: 0.6875rem;
          font-weight: 500;
          color: #5C5A54;
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          transition: all 100ms ease-out;
        }

        .notification-mark-all-btn:hover {
          color: #1F1E1B;
          background: #F0EFEC;
        }

        .notification-dropdown-list {
          overflow-y: auto;
          flex: 1;
          max-height: 420px;
        }

        .notification-empty {
          padding: 32px 16px;
          text-align: center;
          font-size: 0.8125rem;
          color: #9C9A94;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          width: 100%;
          padding: 10px 16px;
          background: none;
          border: none;
          border-bottom: 1px solid #F0EFEC;
          cursor: pointer;
          text-align: left;
          transition: background 100ms ease-out;
        }

        .notification-item:hover {
          background: #F0EFEC;
        }

        .notification-item--unread {
          background: rgba(91, 138, 106, 0.04);
        }

        .notification-item--unread:hover {
          background: rgba(91, 138, 106, 0.08);
        }

        .notification-item-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
        }

        .notification-item-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .notification-item-title {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #1F1E1B;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .notification-item-message {
          font-size: 0.75rem;
          color: #5C5A54;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .notification-item-time {
          font-size: 0.6875rem;
          color: #9C9A94;
          margin-top: 2px;
        }

        .notification-item-dot {
          flex-shrink: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #5B8A6A;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
}
