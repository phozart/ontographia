// components/auth/LoginForm.js
// Login form component with email/password and OAuth support

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/useAuth';
import styles from './AuthForms.module.css';

/**
 * OAuth provider button configuration
 */
const OAUTH_PROVIDERS = {
  google: {
    name: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
  },
  github: {
    name: 'GitHub',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
};

/**
 * LoginForm - Email/password login with OAuth options
 *
 * @param {Object} props
 * @param {string} [props.returnUrl] - URL to redirect after login
 * @param {Function} [props.onSuccess] - Callback on successful login
 * @param {Function} [props.onError] - Callback on login error
 * @param {boolean} [props.showRegisterLink=true] - Show link to register page
 * @param {boolean} [props.showOAuth=true] - Show OAuth login buttons
 * @returns {React.ReactElement}
 */
export function LoginForm({
  returnUrl,
  onSuccess,
  onError,
  showRegisterLink = true,
  showOAuth = true,
}) {
  const router = useRouter();
  const { login, loginWithProvider, isLoading, error: authError, clearError } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Local error state for form validation
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OAuth providers state
  const [availableProviders, setAvailableProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Get return URL from query params if not provided
  const redirectUrl = returnUrl || router.query.returnUrl || '/';

  // Fetch available OAuth providers
  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch('/api/auth/providers');
        if (res.ok) {
          const data = await res.json();
          setAvailableProviders(data.providers || []);
        }
      } catch (err) {
        console.error('[LoginForm] Failed to fetch OAuth providers:', err);
      } finally {
        setLoadingProviders(false);
      }
    }

    if (showOAuth) {
      fetchProviders();
    } else {
      setLoadingProviders(false);
    }
  }, [showOAuth]);

  // Clear errors when inputs change
  useEffect(() => {
    if (formError) setFormError('');
    if (authError) clearError();
  }, [email, password]);

  /**
   * Validate form inputs
   */
  const validateForm = useCallback(() => {
    if (!email.trim()) {
      setFormError('Email is required');
      return false;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) && !email.includes('@')) {
      // Allow username login (no @ required) or valid email
      if (email.length < 3) {
        setFormError('Username must be at least 3 characters');
        return false;
      }
    }

    if (!password) {
      setFormError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }

    return true;
  }, [email, password]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError('');

    try {
      const result = await login(email, password, { rememberMe });

      if (onSuccess) {
        onSuccess(result);
      }

      // Redirect to intended destination
      router.push(redirectUrl);
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setFormError(errorMessage);

      if (onError) {
        onError(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, rememberMe, login, router, redirectUrl, onSuccess, onError, validateForm]);

  /**
   * Handle OAuth login
   */
  const handleOAuthLogin = useCallback((provider) => {
    loginWithProvider(provider, { returnUrl: redirectUrl });
  }, [loginWithProvider, redirectUrl]);

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Combined error display
  const displayError = formError || authError;

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>Welcome back</h1>
        <p className={styles.formSubtitle}>Sign in to your account</p>
      </div>

      {/* OAuth Buttons */}
      {showOAuth && availableProviders.length > 0 && (
        <>
          <div className={styles.oauthButtons}>
            {availableProviders.map((provider) => {
              const config = OAUTH_PROVIDERS[provider.id];
              if (!config) return null;

              return (
                <button
                  key={provider.id}
                  type="button"
                  className={styles.oauthButton}
                  onClick={() => handleOAuthLogin(provider.id)}
                  disabled={isSubmitting || isLoading}
                >
                  <span className={styles.oauthIcon}>{config.icon}</span>
                  <span>Continue with {config.name}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerText}>or continue with email</span>
          </div>
        </>
      )}

      {/* Error Display */}
      {displayError && (
        <div className={styles.errorAlert}>
          <svg
            className={styles.errorIcon}
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{displayError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email or Username
          </label>
          <input
            id="email"
            type="text"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="username"
            autoFocus
            disabled={isSubmitting || isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <Link href="/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isSubmitting || isLoading}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={togglePasswordVisibility}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting || isLoading}
            />
            <span>Remember me for 30 days</span>
          </label>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <span className={styles.spinner} />
              <span>Signing in...</span>
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Register Link */}
      {showRegisterLink && (
        <p className={styles.formFooter}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className={styles.formLink}>
            Create one
          </Link>
        </p>
      )}
    </div>
  );
}

export default LoginForm;
