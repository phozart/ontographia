// components/NotificationContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext();

const STORAGE_KEY = 'ontographia-notifications';

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
  }, [notifications]);

  // Add a new notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      read: false,
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification.id;
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Delete a notification
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Parse @mentions from text and create notifications for mentioned users
  const notifyMentions = useCallback((text, author, source, sourceUrl) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1];
      // Don't notify the author if they mention themselves
      if (username.toLowerCase() !== author.toLowerCase()) {
        mentions.push(username);
      }
    }

    // Create a notification for each unique mention
    const uniqueMentions = [...new Set(mentions)];
    uniqueMentions.forEach(username => {
      addNotification({
        type: 'mention',
        targetUser: username,
        author,
        source,
        sourceUrl,
        preview: text.length > 100 ? text.substring(0, 100) + '...' : text,
      });
    });

    return uniqueMentions;
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    unreadCount,
    notifyMentions,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
