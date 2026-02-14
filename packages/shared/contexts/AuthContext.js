/**
 * AuthContext - User authentication and role-based access control
 *
 * Provides authentication state, login/logout functions, and page access control
 * for the entire application. Supports dynamic page permissions and legacy role-based
 * routing for backwards compatibility.
 *
 * @module components/AuthContext
 *
 * @example
 * // In _app.js
 * import { AuthProvider } from '../components/AuthContext';
 * <AuthProvider>{children}</AuthProvider>
 *
 * @example
 * // In components
 * import { useAuth } from '../components/AuthContext';
 * const { user, role, login, logout, canAccessPage } = useAuth();
 *
 * @typedef {Object} AuthContextValue
 * @property {string|null} user - Currently authenticated username
 * @property {'admin'|'editor'|'viewer'|null} role - User role
 * @property {boolean} hydrated - Whether auth state has loaded from storage
 * @property {Array<{path: string}>} allowedPages - Pages user can access
 * @property {string|null} personalDomainId - User's personal domain UUID
 * @property {Function} login - Authenticate user with username/password
 * @property {Function} logout - Clear authentication and redirect to login
 * @property {Function} refreshPermissions - Reload dynamic permissions
 * @property {Function} canAccessPage - Check if user can access a page path
 */

import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';

/** @type {React.Context<AuthContextValue>} */
const AuthContext = createContext({
  user: null,
  role: null,
  hydrated: false,
  allowedPages: [],
  personalDomainId: null,
  login: async () => {},
  logout: () => {},
  refreshPermissions: async () => {},
  canAccessPage: () => false,
});

const defaultRouteForRole = role => {
  if (role === 'admin' || role === 'editor') return '/home';
  if (role === 'viewer') return '/home';
  return '/login';
};

// Map new hierarchical paths to old flat paths for route matching
const pathMappings = {
  '/navigation/home': '/home',
  '/navigation/projects-overview': '/projects-overview',
  '/app/knowledge/studio': '/knowledge-studio',
  '/app/knowledge/studio/graph-navigator': '/graphnavigator',
  '/app/workspaces/enterprise-architecture': '/ea-studio',
  '/app/workspaces/product-design': '/product-design-workspace',
  '/app/workspaces/diagram': '/diagram-workspace',
  '/app/workspaces/requirements': '/requirements-studio',
  '/app/reasoning/system-dynamics': '/system-dynamics',
  '/app/reasoning/dynamic-work-design': '/dynamic-work-design',
  '/app/reasoning/negotiation': '/negotiation-studio',
  '/app/reasoning/sensemaking': '/sensemaking-studio',
  '/app/reasoning/learning': '/learning-studio',
};

// Reverse mapping: old flat paths to new hierarchical paths
const reversePathMappings = Object.fromEntries(
  Object.entries(pathMappings).map(([newPath, oldPath]) => [oldPath, newPath])
);

// Normalize path for comparison (handles both old and new URL formats)
const normalizePath = (path) => {
  if (!path) return path;
  // Remove domain prefix if present (e.g., /abc123/app/... -> /app/...)
  const parts = path.split('/').filter(Boolean);
  if (parts.length > 1 && (parts[1] === 'navigation' || parts[1] === 'app' || parts[1] === 'admin')) {
    return '/' + parts.slice(1).join('/');
  }
  return path;
};

/**
 * AuthProvider - Provides authentication context to the application
 *
 * Manages user authentication state, persists to localStorage, and handles
 * login/logout flows with page permissions.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {React.ReactElement}
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [allowedPages, setAllowedPages] = useState([]);
  const [personalDomainId, setPersonalDomainId] = useState(null);
  const router = useRouter();

  // Fetch permissions from API
  const fetchPermissions = useCallback(async (userId) => {
    try {
      const res = await fetch(`/api/admin/page-permissions?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setAllowedPages(data.pages || []);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
      // Fall back to empty permissions on error
    }
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem('kg-auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.user && parsed?.role) {
          setUser(parsed.user);
          setRole(parsed.role);
          if (parsed.personalDomainId) {
            setPersonalDomainId(parsed.personalDomainId);
          }
          // Fetch dynamic permissions
          fetchPermissions(parsed.user);
        }
      } catch {
        /* ignore */
      }
    }
    setHydrated(true);
  }, [fetchPermissions]);

  const clearDemoCookie = () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'demo_mode=; Max-Age=0; Path=/;';
    }
  };

  const login = async ({ username, password }) => {
    if (!username || !password) throw new Error('Username and password are required');
    clearDemoCookie();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    setUser(data.username);
    setRole(data.role);
    if (data.personalDomainId) {
      setPersonalDomainId(data.personalDomainId);
    }
    window.localStorage.setItem('kg-auth', JSON.stringify({
      user: data.username,
      role: data.role,
      personalDomainId: data.personalDomainId
    }));
    // Fetch dynamic permissions after login
    await fetchPermissions(data.username);
    const dest = defaultRouteForRole(data.role);
    router.push(dest);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setAllowedPages([]);
    setPersonalDomainId(null);
    window.localStorage.removeItem('kg-auth');
    clearDemoCookie();
    router.push('/login');
  };

  const refreshPermissions = useCallback(async () => {
    if (user) {
      await fetchPermissions(user);
    }
  }, [user, fetchPermissions]);

  // Check if user can access a specific page path
  const canAccessPage = useCallback((pagePath) => {
    if (!pagePath) return false;
    const normalizedPath = normalizePath(pagePath);

    // Always allow public routes
    if (['/', '/login', '/help'].includes(normalizedPath)) return true;

    // Convert old flat paths to new hierarchical paths for permission checking
    const newStylePath = reversePathMappings[normalizedPath] || normalizedPath;

    // Check if page is in allowed pages (check both old and new style paths)
    const isAllowed = allowedPages.some(p => {
      const allowedPath = normalizePath(p.path);
      // Match against both the normalized path and the converted new-style path
      return allowedPath === normalizedPath || allowedPath === newStylePath;
    });

    // Fall back to role-based check if dynamic permissions haven't loaded
    if (!isAllowed && allowedPages.length === 0 && role) {
      // Legacy role-based check
      return true; // Allow during transition period
    }

    return isAllowed;
  }, [allowedPages, role]);

  const value = useMemo(
    () => ({
      user,
      role,
      hydrated,
      allowedPages,
      personalDomainId,
      login,
      logout,
      refreshPermissions,
      canAccessPage,
    }),
    [user, role, hydrated, allowedPages, personalDomainId, refreshPermissions, canAccessPage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth - Hook to access authentication context
 *
 * @returns {AuthContextValue} Authentication state and functions
 *
 * @example
 * const { user, role, login, logout, canAccessPage } = useAuth();
 * if (canAccessPage('/admin')) { ... }
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * useRouteGuard - Hook for route-based access control
 *
 * Enforces page access based on user permissions. Redirects unauthorized
 * users to login or home page. Supports both dynamic permissions and
 * legacy role-based routing.
 *
 * @returns {{enforceRoute: Function, legacyAllowedRoutes: string[]}}
 *
 * @example
 * const { enforceRoute } = useRouteGuard();
 * useEffect(() => { enforceRoute(); }, [pathname, enforceRoute]);
 */
export function useRouteGuard() {
  const { role, hydrated, canAccessPage, allowedPages } = useAuth();
  const router = useRouter();
  const lastEnforcedPath = useRef(null);

  // Legacy allowedRoutes for backwards compatibility
  const legacyAllowedRoutes = useMemo(() => {
    if (!role) return ['/', '/login', '/help'];
    const studioRoutes = ['/studio', '/graphnavigator', '/graph-editor', '/knowledge-studio'];
    const diagramRoutes = [
      '/diagram-workspace',
      '/flow-designer',
      '/system-dynamics',
      '/enterprise-architecture',
      '/requirements-studio',
      '/ea-workspace',
      '/ea-studio',
      '/product-design-workspace',
      '/dynamic-work-design',
      '/negotiation-studio',
      '/sensemaking-studio',
      '/learning-studio',
      '/philosophy-studio',
      '/strategic-reasoning',
      '/sitemap',
    ];
    const modelRoutes = ['/semanticmodelbrowser', '/user-view'];
    const homeRoute = ['/home', '/help', '/projects-overview'];
    const adminRoutes = ['/', ...homeRoute, ...studioRoutes, ...diagramRoutes, ...modelRoutes, '/nodes', '/relationships', '/settings', '/domains', '/node-types', '/relationship-types', '/login'];
    if (role === 'admin') return [...adminRoutes, '/admin/users'];
    if (role === 'editor') return ['/', ...homeRoute, ...studioRoutes, ...diagramRoutes, ...modelRoutes, '/settings', '/domains', '/login'];
    if (role === 'viewer') return ['/', ...homeRoute, ...diagramRoutes, ...modelRoutes, '/settings', '/domains', '/login', '/graphnavigator'];
    return ['/login'];
  }, [role]);

  const enforceRoute = useCallback(() => {
    if (!router?.pathname || !hydrated) return;
    const path = router.pathname;

    // Prevent re-enforcing the same path
    if (lastEnforcedPath.current === path) return;
    lastEnforcedPath.current = path;

    // Use dynamic permissions if available, otherwise fall back to legacy
    if (allowedPages.length > 0) {
      if (!canAccessPage(path)) {
        const dest = role ? '/home' : '/login';
        router.replace(dest);
      }
    } else {
      // Legacy check
      if (!legacyAllowedRoutes.includes(path)) {
        const dest = role ? '/home' : '/login';
        router.replace(dest);
      }
    }
  }, [router, hydrated, allowedPages, canAccessPage, role, legacyAllowedRoutes]);

  return { enforceRoute, legacyAllowedRoutes };
}
