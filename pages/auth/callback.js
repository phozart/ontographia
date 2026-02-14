// pages/auth/callback.js
// OAuth callback handler page
// This page handles the OAuth redirect and extracts the token from the URL fragment

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * OAuth Callback Page
 * Handles the redirect from OAuth providers and extracts the access token
 */
export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    // Check for error in query params
    const { error, success, returnUrl = '/' } = router.query;

    if (error) {
      setStatus('error');
      setMessage(error);
      return;
    }

    // Check for success flag
    if (success === 'true') {
      // Extract token from URL fragment (after #)
      const hash = window.location.hash;
      const tokenMatch = hash.match(/token=([^&]+)/);

      if (tokenMatch) {
        const accessToken = tokenMatch[1];

        // Store token in localStorage for the app to use
        try {
          localStorage.setItem('accessToken', accessToken);
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');

          // Clear the hash from URL for security
          window.history.replaceState(null, '', window.location.pathname + window.location.search);

          // Redirect to return URL
          setTimeout(() => {
            router.push(returnUrl);
          }, 1000);
        } catch (err) {
          console.error('Failed to store token:', err);
          setStatus('error');
          setMessage('Failed to save authentication. Please try again.');
        }
      } else {
        setStatus('error');
        setMessage('No authentication token received. Please try again.');
      }
    }
  }, [router.query, router]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        maxWidth: '400px',
        textAlign: 'center',
        padding: '40px',
        borderRadius: '8px',
        backgroundColor: status === 'error' ? '#fef2f2' : status === 'success' ? '#f0fdf4' : '#f9fafb',
        border: `1px solid ${status === 'error' ? '#fecaca' : status === 'success' ? '#bbf7d0' : '#e5e7eb'}`,
      }}>
        {status === 'processing' && (
          <div style={{ marginBottom: '16px' }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              style={{ animation: 'spin 1s linear infinite' }}
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {status === 'success' && (
          <div style={{ marginBottom: '16px', color: '#16a34a' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
        )}

        {status === 'error' && (
          <div style={{ marginBottom: '16px', color: '#dc2626' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
        )}

        <h1 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '8px',
          color: status === 'error' ? '#991b1b' : status === 'success' ? '#166534' : '#111827',
        }}>
          {status === 'processing' ? 'Authenticating' : status === 'success' ? 'Success' : 'Authentication Failed'}
        </h1>

        <p style={{
          color: status === 'error' ? '#b91c1c' : status === 'success' ? '#15803d' : '#6b7280',
          marginBottom: '20px',
        }}>
          {message}
        </p>

        {status === 'error' && (
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Back to Login
          </button>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
