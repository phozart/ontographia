// lib/auth/useAuth.js
// Custom hook for consuming AuthContext with auth methods

import { useCallback, useContext, useRef } from 'react';
import { AuthContext, AUTH_ACTIONS } from './AuthContext';

/**
 * Token refresh configuration
 */
const REFRESH_THRESHOLD_MS = 60 * 1000; // Refresh 1 minute before expiry
const MIN_REFRESH_INTERVAL_MS = 5 * 1000; // Don't refresh more than every 5 seconds

/**
 * useAuth - Custom hook for authentication operations
 *
 * Provides access to auth state and methods for:
 * - Login with email/password
 * - Register new account
 * - Logout
 * - Token refresh
 * - OAuth login redirect
 *
 * @returns {Object} Auth state and methods
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * // Login
 * await login('user@example.com', 'password');
 *
 * // Logout
 * logout();
 *
 * // OAuth
 * loginWithProvider('google');
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { state, dispatch, scheduleTokenRefresh, persistAuthState, clearPersistedAuthState } = context;
  const lastRefreshRef = useRef(0);
  const refreshPromiseRef = useRef(null);

  /**
   * Login with email/password
   * @param {string} email - User email or username
   * @param {string} password - User password
   * @param {Object} [options] - Login options
   * @param {boolean} [options.rememberMe=false] - Extend session duration
   * @returns {Promise<Object>} Login result with user data
   */
  const login = useCallback(async (email, password, options = {}) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in request
        body: JSON.stringify({
          email,
          password,
          rememberMe: options.rememberMe || false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        dispatch({
          type: AUTH_ACTIONS.AUTH_ERROR,
          payload: { error: data.error || 'Login failed' },
        });
        throw new Error(data.error || 'Login failed');
      }

      const expiresAt = Date.now() + (data.expiresIn * 1000);

      dispatch({
        type: AUTH_ACTIONS.AUTH_SUCCESS,
        payload: {
          user: data.user,
          accessToken: data.accessToken,
          expiresAt,
        },
      });

      // Persist auth state
      persistAuthState({ user: data.user });

      // Schedule token refresh
      scheduleTokenRefresh(expiresAt);

      return { user: data.user };
    } catch (err) {
      // Re-throw if already dispatched error
      if (err.message) {
        throw err;
      }

      dispatch({
        type: AUTH_ACTIONS.AUTH_ERROR,
        payload: { error: 'Network error during login' },
      });
      throw new Error('Network error during login');
    }
  }, [dispatch, scheduleTokenRefresh, persistAuthState]);

  /**
   * Register a new account
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User display name
   * @param {Object} [options] - Registration options
   * @returns {Promise<Object>} Registration result
   */
  const register = useCallback(async (email, password, name, options = {}) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_START });

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          name,
          username: options.username || email.split('@')[0],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        dispatch({
          type: AUTH_ACTIONS.AUTH_ERROR,
          payload: { error: data.error || 'Registration failed' },
        });
        throw new Error(data.error || 'Registration failed');
      }

      // If registration returns tokens (auto-login)
      if (data.accessToken) {
        const expiresAt = Date.now() + (data.expiresIn * 1000);

        dispatch({
          type: AUTH_ACTIONS.AUTH_SUCCESS,
          payload: {
            user: data.user,
            accessToken: data.accessToken,
            expiresAt,
          },
        });

        persistAuthState({ user: data.user });
        scheduleTokenRefresh(expiresAt);

        return { user: data.user, autoLogin: true };
      }

      // Registration without auto-login
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { user: data.user, autoLogin: false };
    } catch (err) {
      if (err.message) {
        throw err;
      }

      dispatch({
        type: AUTH_ACTIONS.AUTH_ERROR,
        payload: { error: 'Network error during registration' },
      });
      throw new Error('Network error during registration');
    }
  }, [dispatch, scheduleTokenRefresh, persistAuthState]);

  /**
   * Logout current user
   * Clears local state and calls server to invalidate refresh token
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    try {
      // Call server to clear refresh token cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('[Auth] Logout API call failed:', err);
      // Continue with local logout even if API fails
    }

    // Clear local state
    dispatch({ type: AUTH_ACTIONS.AUTH_LOGOUT });
    clearPersistedAuthState();

    // Clear demo mode cookie if set
    if (typeof document !== 'undefined') {
      document.cookie = 'demo_mode=; Max-Age=0; Path=/;';
    }
  }, [dispatch, clearPersistedAuthState]);

  /**
   * Refresh the access token
   * Uses refresh token from httpOnly cookie
   * @returns {Promise<Object>} New token data
   */
  const refreshToken = useCallback(async () => {
    // Prevent concurrent refresh requests
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    // Rate limit refresh attempts
    const now = Date.now();
    if (now - lastRefreshRef.current < MIN_REFRESH_INTERVAL_MS) {
      return { accessToken: state.accessToken };
    }

    lastRefreshRef.current = now;

    refreshPromiseRef.current = (async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          // Refresh failed - user needs to re-login
          dispatch({ type: AUTH_ACTIONS.AUTH_LOGOUT });
          clearPersistedAuthState();
          throw new Error(data.error || 'Token refresh failed');
        }

        const expiresAt = Date.now() + (data.expiresIn * 1000);

        dispatch({
          type: AUTH_ACTIONS.AUTH_REFRESH,
          payload: {
            accessToken: data.accessToken,
            expiresAt,
            user: data.user,
          },
        });

        // Schedule next refresh
        scheduleTokenRefresh(expiresAt);

        return {
          accessToken: data.accessToken,
          expiresAt,
        };
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [state.accessToken, dispatch, scheduleTokenRefresh, clearPersistedAuthState]);

  /**
   * Initiate OAuth login with a provider
   * Redirects to OAuth provider's authorization page
   * @param {string} provider - OAuth provider ('google' or 'github')
   * @param {Object} [options] - OAuth options
   * @param {string} [options.returnUrl] - URL to return to after OAuth
   */
  const loginWithProvider = useCallback((provider, options = {}) => {
    const { returnUrl } = options;

    // Build OAuth URL
    let oauthUrl = `/api/auth/oauth/${provider}`;

    // Add return URL if specified
    if (returnUrl) {
      oauthUrl += `?returnUrl=${encodeURIComponent(returnUrl)}`;
    }

    // Redirect to OAuth endpoint
    window.location.href = oauthUrl;
  }, []);

  /**
   * Get a valid access token, refreshing if necessary
   * Use this before making authenticated API calls
   * @returns {Promise<string|null>} Valid access token or null
   */
  const getAccessToken = useCallback(async () => {
    // Not authenticated
    if (!state.isAuthenticated) {
      return null;
    }

    // Check if token is expired or about to expire
    const now = Date.now();
    if (state.tokenExpiresAt && state.tokenExpiresAt - now < REFRESH_THRESHOLD_MS) {
      try {
        const result = await refreshToken();
        return result.accessToken;
      } catch (err) {
        console.error('[Auth] Failed to refresh token:', err);
        return null;
      }
    }

    return state.accessToken;
  }, [state.isAuthenticated, state.accessToken, state.tokenExpiresAt, refreshToken]);

  /**
   * Clear any auth error
   */
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, [dispatch]);

  /**
   * Check if user has a specific permission
   * @param {string} permission - Permission to check
   * @param {Object} [context] - Permission context (domainId, projectId)
   * @returns {boolean} Whether user has permission
   */
  const hasPermission = useCallback((permission, context = {}) => {
    if (!state.user) return false;

    // Admin has all permissions
    if (state.user.role === 'admin' || state.user.systemRole === 'super_admin') {
      return true;
    }

    // For now, use basic role-based checks
    // TODO: Integrate with full RBAC system
    const rolePermissions = {
      admin: ['*'],
      editor: ['read', 'write', 'create'],
      viewer: ['read'],
    };

    const userPermissions = rolePermissions[state.user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }, [state.user]);

  /**
   * Check if user has at least the specified role level
   * @param {string} requiredRole - Minimum required role
   * @returns {boolean} Whether user meets role requirement
   */
  const hasRole = useCallback((requiredRole) => {
    if (!state.user?.role) return false;

    const roleHierarchy = ['viewer', 'editor', 'admin'];
    const userLevel = roleHierarchy.indexOf(state.user.role);
    const requiredLevel = roleHierarchy.indexOf(requiredRole);

    return userLevel >= requiredLevel;
  }, [state.user]);

  return {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    accessToken: state.accessToken,

    // Auth methods
    login,
    register,
    logout,
    refreshToken,
    loginWithProvider,
    getAccessToken,
    clearError,

    // Permission helpers
    hasPermission,
    hasRole,
  };
}

export default useAuth;
