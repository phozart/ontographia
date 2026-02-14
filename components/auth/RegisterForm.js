// components/auth/RegisterForm.js
// Registration form component with validation and OAuth support

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
 * Password strength levels
 */
const PASSWORD_STRENGTH = {
  WEAK: { level: 1, label: 'Weak', color: '#ef4444' },
  FAIR: { level: 2, label: 'Fair', color: '#f59e0b' },
  GOOD: { level: 3, label: 'Good', color: '#10b981' },
  STRONG: { level: 4, label: 'Strong', color: '#059669' },
};

/**
 * Calculate password strength
 * @param {string} password - Password to check
 * @returns {Object} Strength info
 */
function calculatePasswordStrength(password) {
  if (!password) return null;

  let score = 0;

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character type checks
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Determine strength level
  if (score <= 2) return PASSWORD_STRENGTH.WEAK;
  if (score <= 3) return PASSWORD_STRENGTH.FAIR;
  if (score <= 5) return PASSWORD_STRENGTH.GOOD;
  return PASSWORD_STRENGTH.STRONG;
}

/**
 * RegisterForm - Account registration with validation
 *
 * @param {Object} props
 * @param {string} [props.returnUrl] - URL to redirect after registration
 * @param {Function} [props.onSuccess] - Callback on successful registration
 * @param {Function} [props.onError] - Callback on registration error
 * @param {boolean} [props.showLoginLink=true] - Show link to login page
 * @param {boolean} [props.showOAuth=true] - Show OAuth signup buttons
 * @returns {React.ReactElement}
 */
export function RegisterForm({
  returnUrl,
  onSuccess,
  onError,
  showLoginLink = true,
  showOAuth = true,
}) {
  const router = useRouter();
  const { register, loginWithProvider, isLoading, error: authError, clearError } = useAuth();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Validation state
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

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
        console.error('[RegisterForm] Failed to fetch OAuth providers:', err);
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

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  // Clear errors when inputs change
  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      setFormErrors({});
    }
    if (authError) clearError();
  }, [name, email, password, confirmPassword]);

  /**
   * Validate form inputs
   */
  const validateForm = useCallback(() => {
    const errors = {};

    // Name validation
    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength && passwordStrength.level < 2) {
      errors.password = 'Password is too weak. Add uppercase, numbers, or symbols.';
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement
    if (!agreeToTerms) {
      errors.terms = 'You must agree to the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [name, email, password, confirmPassword, agreeToTerms, passwordStrength]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await register(email, password, name);

      if (onSuccess) {
        onSuccess(result);
      }

      // Redirect to intended destination or show success
      if (result.autoLogin) {
        router.push(redirectUrl);
      } else {
        // Show success message and redirect to login
        router.push('/login?registered=true');
      }
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setFormErrors({ submit: errorMessage });

      if (onError) {
        onError(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, password, register, router, redirectUrl, onSuccess, onError, validateForm]);

  /**
   * Handle OAuth signup
   */
  const handleOAuthSignup = useCallback((provider) => {
    loginWithProvider(provider, { returnUrl: redirectUrl });
  }, [loginWithProvider, redirectUrl]);

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Combined error display
  const displayError = formErrors.submit || authError;

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>Create an account</h1>
        <p className={styles.formSubtitle}>Get started with Ontographia</p>
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
                  onClick={() => handleOAuthSignup(provider.id)}
                  disabled={isSubmitting || isLoading}
                >
                  <span className={styles.oauthIcon}>{config.icon}</span>
                  <span>Sign up with {config.name}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.divider}>
            <span className={styles.dividerText}>or sign up with email</span>
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

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Name Field */}
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Full Name
          </label>
          <input
            id="name"
            type="text"
            className={`${styles.input} ${formErrors.name ? styles.inputError : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            autoComplete="name"
            autoFocus
            disabled={isSubmitting || isLoading}
          />
          {formErrors.name && (
            <span className={styles.fieldError}>{formErrors.name}</span>
          )}
        </div>

        {/* Email Field */}
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isSubmitting || isLoading}
          />
          {formErrors.email && (
            <span className={styles.fieldError}>{formErrors.email}</span>
          )}
        </div>

        {/* Password Field */}
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <div className={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${formErrors.password ? styles.inputError : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              autoComplete="new-password"
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

          {/* Password Strength Indicator */}
          {password && passwordStrength && (
            <div className={styles.passwordStrength}>
              <div className={styles.strengthBar}>
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={styles.strengthSegment}
                    style={{
                      background:
                        level <= passwordStrength.level
                          ? passwordStrength.color
                          : 'var(--border, #e5e7eb)',
                    }}
                  />
                ))}
              </div>
              <span
                className={styles.strengthLabel}
                style={{ color: passwordStrength.color }}
              >
                {passwordStrength.label}
              </span>
            </div>
          )}

          {formErrors.password && (
            <span className={styles.fieldError}>{formErrors.password}</span>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            className={`${styles.input} ${formErrors.confirmPassword ? styles.inputError : ''}`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            autoComplete="new-password"
            disabled={isSubmitting || isLoading}
          />
          {formErrors.confirmPassword && (
            <span className={styles.fieldError}>{formErrors.confirmPassword}</span>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className={styles.checkboxGroup}>
          <label className={`${styles.checkboxLabel} ${formErrors.terms ? styles.checkboxError : ''}`}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              disabled={isSubmitting || isLoading}
            />
            <span>
              I agree to the{' '}
              <Link href="/terms" className={styles.inlineLink}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className={styles.inlineLink}>
                Privacy Policy
              </Link>
            </span>
          </label>
          {formErrors.terms && (
            <span className={styles.fieldError}>{formErrors.terms}</span>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <span className={styles.spinner} />
              <span>Creating account...</span>
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      {/* Login Link */}
      {showLoginLink && (
        <p className={styles.formFooter}>
          Already have an account?{' '}
          <Link href="/login" className={styles.formLink}>
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}

export default RegisterForm;
