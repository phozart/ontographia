// lib/auth/AuthContext.js
// React context for authentication state management
// Provides auth state to the entire application

import { createContext, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

/**
 * Authentication state shape
 * @typedef {Object} AuthState
 * @property {Object|null} user - Current user object or null
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {boolean} isLoading - Loading state during auth check
 * @property {string|null} error - Auth error message
 * @property {string|null} accessToken - Current access token
 * @property {number|null} tokenExpiresAt - Token expiration timestamp
 */

/**
 * Initial auth state
 */
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  accessToken: null,
  tokenExpiresAt: null,
};

/**
 * Auth action types
 */
export const AUTH_ACTIONS = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_ERROR: 'AUTH_ERROR',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_REFRESH: 'AUTH_REFRESH',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
};

/**
 * Auth reducer for managing authentication state
 * @param {AuthState} state - Current state
 * @param {Object} action - Action object
 * @returns {AuthState} New state
 */
export function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        accessToken: action.payload.accessToken || state.accessToken,
        tokenExpiresAt: action.payload.expiresAt || state.tokenExpiresAt,
      };

    case AUTH_ACTIONS.AUTH_ERROR:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
        accessToken: null,
        tokenExpiresAt: null,
      };

    case AUTH_ACTIONS.AUTH_LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.AUTH_REFRESH:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        tokenExpiresAt: action.payload.expiresAt,
        user: action.payload.user || state.user,
        error: null,
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

/**
 * AuthContext - React context for auth state
 * @type {React.Context<{state: AuthState, dispatch: Function}>}
 */
export const AuthContext = createContext({
  state: initialState,
  dispatch: () => {},
});

/**
 * Token storage utilities
 * Access tokens are stored in memory only for security
 * Refresh tokens are handled via httpOnly cookies on the server
 */
const TOKEN_STORAGE_KEY = 'ontographia_auth';

/**
 * Save minimal auth state to localStorage (not tokens)
 * @param {Object} data - Auth data to persist
 */
function persistAuthState(data) {
  if (typeof window === 'undefined') return;
  try {
    // Only persist non-sensitive data
    const persistData = {
      userId: data.user?.id,
      username: data.user?.username,
      role: data.user?.role,
      personalDomainId: data.user?.personalDomainId,
      // Don't persist tokens - they come from httpOnly cookies or memory
    };
    window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(persistData));
  } catch (err) {
    console.error('[Auth] Failed to persist auth state:', err);
  }
}

/**
 * Load persisted auth state from localStorage
 * @returns {Object|null} Persisted auth data or null
 */
function loadPersistedAuthState() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('[Auth] Failed to load persisted auth state:', err);
  }
  return null;
}

/**
 * Clear persisted auth state
 */
function clearPersistedAuthState() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (err) {
    console.error('[Auth] Failed to clear persisted auth state:', err);
  }
}

/**
 * AuthProvider - Provider component for authentication context
 *
 * Features:
 * - Manages auth state with useReducer
 * - Auto-checks authentication on mount via /api/auth/me
 * - Handles token refresh automatically
 * - Persists minimal auth state to localStorage
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement}
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const refreshTimeoutRef = useRef(null);
  const isRefreshingRef = useRef(false);

  /**
   * Schedule token refresh before expiry
   * Refreshes 1 minute before token expires
   */
  const scheduleTokenRefresh = useCallback((expiresAt) => {
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    if (!expiresAt) return;

    const now = Date.now();
    const refreshTime = expiresAt - 60000; // 1 minute before expiry
    const delay = refreshTime - now;

    if (delay > 0) {
      refreshTimeoutRef.current = setTimeout(async () => {
        if (!isRefreshingRef.current) {
          isRefreshingRef.current = true;
          try {
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include', // Include httpOnly cookies
            });

            if (response.ok) {
              const data = await response.json();
              const newExpiresAt = Date.now() + (data.expiresIn * 1000);

              dispatch({
                type: AUTH_ACTIONS.AUTH_REFRESH,
                payload: {
                  accessToken: data.accessToken,
                  expiresAt: newExpiresAt,
                  user: data.user,
                },
              });

              // Schedule next refresh
              scheduleTokenRefresh(newExpiresAt);
            } else {
              // Refresh failed - log out
              console.warn('[Auth] Token refresh failed, logging out');
              dispatch({ type: AUTH_ACTIONS.AUTH_LOGOUT });
              clearPersistedAuthState();
            }
          } catch (err) {
            console.error('[Auth] Token refresh error:', err);
          } finally {
            isRefreshingRef.current = false;
          }
        }
      }, delay);
    }
  }, []);

  /**
   * Check authentication status on mount
   * Validates existing session via /api/auth/me
   */
  useEffect(() => {
    async function checkAuth() {
      // First, check for persisted state
      const persisted = loadPersistedAuthState();

      try {
        // Try to get current user from API
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();

          dispatch({
            type: AUTH_ACTIONS.AUTH_SUCCESS,
            payload: {
              user: data.user,
              accessToken: null, // Will be refreshed if needed
              expiresAt: null,
            },
          });

          // Persist auth state
          persistAuthState({ user: data.user });

          // Try to refresh token to get a fresh access token
          try {
            const refreshResponse = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include',
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              const expiresAt = Date.now() + (refreshData.expiresIn * 1000);

              dispatch({
                type: AUTH_ACTIONS.AUTH_REFRESH,
                payload: {
                  accessToken: refreshData.accessToken,
                  expiresAt,
                  user: refreshData.user,
                },
              });

              scheduleTokenRefresh(expiresAt);
            }
          } catch (refreshErr) {
            console.warn('[Auth] Initial token refresh failed:', refreshErr);
          }
        } else if (response.status === 401) {
          // Not authenticated
          dispatch({ type: AUTH_ACTIONS.AUTH_LOGOUT });
          clearPersistedAuthState();
        } else {
          // Other error
          dispatch({
            type: AUTH_ACTIONS.AUTH_ERROR,
            payload: { error: 'Failed to verify authentication' },
          });
        }
      } catch (err) {
        console.error('[Auth] Auth check failed:', err);

        // If we have persisted state, use it temporarily
        if (persisted?.userId) {
          dispatch({
            type: AUTH_ACTIONS.SET_USER,
            payload: {
              user: {
                id: persisted.userId,
                username: persisted.username,
                role: persisted.role,
                personalDomainId: persisted.personalDomainId,
              },
            },
          });
        } else {
          dispatch({
            type: AUTH_ACTIONS.AUTH_ERROR,
            payload: { error: 'Network error during auth check' },
          });
        }
      }
    }

    checkAuth();

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [scheduleTokenRefresh]);

  /**
   * Context value with state and dispatch
   */
  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      // Expose helper to schedule refresh (used by useAuth hook)
      scheduleTokenRefresh,
      // Expose persistence helpers
      persistAuthState,
      clearPersistedAuthState,
    }),
    [state, scheduleTokenRefresh]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
