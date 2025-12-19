/**
 * MenuConfigContext - Context provider for menu configuration state
 *
 * Provides the admin-managed menu structure to all components.
 * Menu configuration is managed exclusively by admins via /admin/menu-config.
 *
 * @module components/MenuConfigContext
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

const MenuConfigContext = createContext(null);

/**
 * Icon name to component mapping
 * These are used to render icons from string names stored in the database
 */
export const ICON_MAP = {
  // Navigation icons
  HomeIcon: 'HomeIcon',
  DashboardIcon: 'DashboardIcon',
  AppsIcon: 'AppsIcon',
  LockIcon: 'LockIcon',
  // Knowledge icons
  HubIcon: 'HubIcon',
  // Workspace icons
  CategoryIcon: 'CategoryIcon',
  MiscellaneousServicesIcon: 'MiscellaneousServicesIcon',
  FlagIcon: 'FlagIcon',
  GavelIcon: 'GavelIcon',
  ShieldIcon: 'ShieldIcon',
  LightbulbIcon: 'LightbulbIcon',
  AssignmentIcon: 'AssignmentIcon',
  ArchitectureIcon: 'ArchitectureIcon',
  GridViewIcon: 'GridViewIcon',
  ChangeCircleIcon: 'ChangeCircleIcon',
  // Reasoning icons
  LoopIcon: 'LoopIcon',
  BuildIcon: 'BuildIcon',
  HandshakeIcon: 'HandshakeIcon',
  PsychologyIcon: 'PsychologyIcon',
  SchoolIcon: 'SchoolIcon',
  AutoStoriesIcon: 'AutoStoriesIcon',
  AutoGraphIcon: 'AutoGraphIcon',
};

/**
 * MenuConfigProvider component
 * Provides read-only menu configuration to all components.
 * Configuration is managed by admins via the admin page.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function MenuConfigProvider({ children }) {
  const { user, role } = useAuth();

  // State
  const [config, setConfig] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auth headers for API calls
  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    'x-user': user || '',
    'x-role': role || '',
  }), [user, role]);

  // Fetch menu configuration (default config only)
  const fetchConfig = useCallback(async () => {
    if (!user) {
      // Not logged in - use empty config
      setConfig(null);
      setAvailableItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/user/menu-config', {
        headers: authHeaders,
      });

      if (!res.ok) {
        throw new Error('Failed to fetch menu configuration');
      }

      const data = await res.json();
      setConfig(data.config);
      setAvailableItems(data.availableItems || []);
      setVersion(data.version || 0);
    } catch (err) {
      console.error('[MenuConfigContext] Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, authHeaders]);

  // Initial load
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Get menu item details from available items
  const getItemDetails = useCallback((itemKey) => {
    return availableItems.find(item => item.key === itemKey);
  }, [availableItems]);

  const value = useMemo(() => ({
    // State (read-only for non-admins)
    config,
    availableItems,
    version,
    loading,
    error,

    // Actions
    fetchConfig,
    getItemDetails,
  }), [
    config, availableItems, version, loading, error,
    fetchConfig, getItemDetails,
  ]);

  return (
    <MenuConfigContext.Provider value={value}>
      {children}
    </MenuConfigContext.Provider>
  );
}

/**
 * Hook to use menu configuration context
 * @returns {Object} Menu config context value
 * @throws {Error} If used outside of MenuConfigProvider
 */
export function useMenuConfig() {
  const context = useContext(MenuConfigContext);
  if (!context) {
    throw new Error('useMenuConfig must be used within MenuConfigProvider');
  }
  return context;
}

export default MenuConfigContext;
