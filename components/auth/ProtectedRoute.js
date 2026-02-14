// components/auth/ProtectedRoute.js
// Protected route component and HOC for route-level authentication

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth/useAuth';

/**
 * Loading spinner component
 * Shows during authentication check
 */
function AuthLoadingSpinner() {
  return (
    <div className="auth-loading">
      <div className="auth-loading-spinner" />
      <p className="auth-loading-text">Verifying authentication...</p>
      <style jsx>{`
        .auth-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--bg, #f5f7fa);
        }

        .auth-loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border, #e5e7eb);
          border-top-color: var(--accent, #3b82f6);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .auth-loading-text {
          margin-top: 16px;
          font-size: 14px;
          color: var(--text-muted, #6b7280);
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Unauthorized access component
 * Shows when user lacks required permissions
 */
function UnauthorizedAccess({ message, onGoBack }) {
  return (
    <div className="auth-unauthorized">
      <div className="auth-unauthorized-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      </div>
      <h1 className="auth-unauthorized-title">Access Denied</h1>
      <p className="auth-unauthorized-message">
        {message || 'You do not have permission to access this page.'}
      </p>
      <button className="auth-unauthorized-btn" onClick={onGoBack}>
        Go Back
      </button>
      <style jsx>{`
        .auth-unauthorized {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px;
          background: var(--bg, #f5f7fa);
          text-align: center;
        }

        .auth-unauthorized-icon {
          color: var(--text-muted, #6b7280);
          margin-bottom: 24px;
        }

        .auth-unauthorized-title {
          margin: 0 0 12px 0;
          font-size: 24px;
          font-weight: 600;
          color: var(--text, #1f2937);
        }

        .auth-unauthorized-message {
          margin: 0 0 24px 0;
          font-size: 16px;
          color: var(--text-muted, #6b7280);
          max-width: 400px;
        }

        .auth-unauthorized-btn {
          padding: 12px 24px;
          background: var(--accent, #3b82f6);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .auth-unauthorized-btn:hover {
          background: var(--accent-dark, #2563eb);
        }
      `}</style>
    </div>
  );
}

/**
 * ProtectedRoute - Wrapper component for protected routes
 *
 * Redirects to login if not authenticated.
 * Shows loading state during auth check.
 * Optionally checks for specific permissions.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected content
 * @param {string} [props.requiredPermission] - Required permission to access
 * @param {string} [props.requiredRole] - Minimum required role
 * @param {string} [props.redirectTo='/login'] - Redirect path when not authenticated
 * @param {string} [props.unauthorizedRedirect] - Redirect path when lacking permission
 * @param {Function} [props.onUnauthorized] - Callback when access is denied
 * @param {React.ReactNode} [props.loadingComponent] - Custom loading component
 * @param {React.ReactNode} [props.unauthorizedComponent] - Custom unauthorized component
 * @returns {React.ReactElement}
 *
 * @example
 * // Basic protection
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 *
 * @example
 * // With permission check
 * <ProtectedRoute requiredPermission="admin:manage">
 *   <AdminPage />
 * </ProtectedRoute>
 *
 * @example
 * // With role check
 * <ProtectedRoute requiredRole="editor">
 *   <EditorPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  redirectTo = '/login',
  unauthorizedRedirect,
  onUnauthorized,
  loadingComponent,
  unauthorizedComponent,
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();

  /**
   * Handle going back or to home
   */
  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router]);

  /**
   * Check permissions and handle redirects
   */
  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      // Store intended destination for redirect after login
      const returnUrl = router.asPath;
      const loginUrl = returnUrl !== '/'
        ? `${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`
        : redirectTo;

      router.replace(loginUrl);
      return;
    }

    // Check required permission
    if (requiredPermission && !hasPermission(requiredPermission)) {
      if (onUnauthorized) {
        onUnauthorized({ type: 'permission', required: requiredPermission });
      }

      if (unauthorizedRedirect) {
        router.replace(unauthorizedRedirect);
      }
      return;
    }

    // Check required role
    if (requiredRole && !hasRole(requiredRole)) {
      if (onUnauthorized) {
        onUnauthorized({ type: 'role', required: requiredRole });
      }

      if (unauthorizedRedirect) {
        router.replace(unauthorizedRedirect);
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    requiredPermission,
    requiredRole,
    hasPermission,
    hasRole,
    router,
    redirectTo,
    unauthorizedRedirect,
    onUnauthorized,
  ]);

  // Show loading state
  if (isLoading) {
    return loadingComponent || <AuthLoadingSpinner />;
  }

  // Not authenticated - will be redirected
  if (!isAuthenticated) {
    return loadingComponent || <AuthLoadingSpinner />;
  }

  // Check permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    if (unauthorizedComponent) {
      return unauthorizedComponent;
    }
    if (!unauthorizedRedirect) {
      return (
        <UnauthorizedAccess
          message={`You need the "${requiredPermission}" permission to access this page.`}
          onGoBack={handleGoBack}
        />
      );
    }
    return loadingComponent || <AuthLoadingSpinner />;
  }

  // Check role
  if (requiredRole && !hasRole(requiredRole)) {
    if (unauthorizedComponent) {
      return unauthorizedComponent;
    }
    if (!unauthorizedRedirect) {
      return (
        <UnauthorizedAccess
          message={`You need at least "${requiredRole}" role to access this page.`}
          onGoBack={handleGoBack}
        />
      );
    }
    return loadingComponent || <AuthLoadingSpinner />;
  }

  // Authorized - render children
  return children;
}

/**
 * withProtectedRoute - Higher-Order Component for protected pages
 *
 * Wraps a page component with authentication protection.
 * Useful for pages where you want to apply protection at the component level.
 *
 * @param {React.ComponentType} WrappedComponent - Component to protect
 * @param {Object} [options] - Protection options
 * @param {string} [options.requiredPermission] - Required permission
 * @param {string} [options.requiredRole] - Required role
 * @param {string} [options.redirectTo='/login'] - Login redirect path
 * @returns {React.ComponentType} Protected component
 *
 * @example
 * // Protect a page component
 * function AdminPage() {
 *   return <div>Admin content</div>;
 * }
 *
 * export default withProtectedRoute(AdminPage, {
 *   requiredRole: 'admin',
 * });
 */
export function withProtectedRoute(WrappedComponent, options = {}) {
  const { requiredPermission, requiredRole, redirectTo = '/login' } = options;

  function ProtectedComponent(props) {
    return (
      <ProtectedRoute
        requiredPermission={requiredPermission}
        requiredRole={requiredRole}
        redirectTo={redirectTo}
      >
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  }

  // Copy display name for debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ProtectedComponent.displayName = `withProtectedRoute(${displayName})`;

  // Copy getInitialProps if it exists
  if (WrappedComponent.getInitialProps) {
    ProtectedComponent.getInitialProps = WrappedComponent.getInitialProps;
  }

  // Copy getLayout if it exists (Next.js layout pattern)
  if (WrappedComponent.getLayout) {
    ProtectedComponent.getLayout = WrappedComponent.getLayout;
  }

  return ProtectedComponent;
}

/**
 * useRequireAuth - Hook version of protected route logic
 *
 * Use this hook in components that need to check auth
 * without the wrapper component pattern.
 *
 * @param {Object} [options] - Options
 * @param {string} [options.requiredPermission] - Required permission
 * @param {string} [options.requiredRole] - Required role
 * @param {string} [options.redirectTo='/login'] - Redirect on unauthenticated
 * @returns {Object} Auth check result
 *
 * @example
 * function MyComponent() {
 *   const { isAuthorized, isChecking } = useRequireAuth({
 *     requiredRole: 'editor',
 *   });
 *
 *   if (isChecking) return <Loading />;
 *   if (!isAuthorized) return null; // Will redirect
 *
 *   return <div>Protected content</div>;
 * }
 */
export function useRequireAuth(options = {}) {
  const { requiredPermission, requiredRole, redirectTo = '/login' } = options;
  const router = useRouter();
  const { user, isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const returnUrl = router.asPath;
      const loginUrl = returnUrl !== '/'
        ? `${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`
        : redirectTo;
      router.replace(loginUrl);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  // Calculate authorization
  let isAuthorized = isAuthenticated;

  if (isAuthorized && requiredPermission) {
    isAuthorized = hasPermission(requiredPermission);
  }

  if (isAuthorized && requiredRole) {
    isAuthorized = hasRole(requiredRole);
  }

  return {
    user,
    isChecking: isLoading,
    isAuthenticated,
    isAuthorized,
    missingPermission: requiredPermission && !hasPermission(requiredPermission) ? requiredPermission : null,
    missingRole: requiredRole && !hasRole(requiredRole) ? requiredRole : null,
  };
}

export default ProtectedRoute;
