// lib/auth/oauth.js
// OAuth utilities for Google and GitHub authentication

import crypto from 'crypto';

/**
 * Supported OAuth providers
 */
export const OAUTH_PROVIDERS = {
  google: 'google',
  github: 'github',
};

/**
 * OAuth provider configurations
 */
const providerConfigs = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scopes: ['openid', 'email', 'profile'],
    getClientId: () => process.env.GOOGLE_CLIENT_ID,
    getClientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    emailUrl: 'https://api.github.com/user/emails',
    scopes: ['user:email'],
    getClientId: () => process.env.GITHUB_CLIENT_ID,
    getClientSecret: () => process.env.GITHUB_CLIENT_SECRET,
  },
};

/**
 * Get OAuth callback URL
 * @param {string} provider - OAuth provider
 * @returns {string} Callback URL
 */
function getCallbackUrl(provider) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/api/auth/oauth/${provider}`;
}

/**
 * Generate a random state parameter for CSRF protection
 * @returns {string} Random state string
 */
export function generateOAuthState() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Check if an OAuth provider is configured
 * @param {string} provider - OAuth provider name
 * @returns {boolean} True if provider is configured
 */
export function isProviderConfigured(provider) {
  const config = providerConfigs[provider];
  if (!config) return false;

  const clientId = config.getClientId();
  const clientSecret = config.getClientSecret();

  return Boolean(clientId && clientSecret);
}

/**
 * Get available OAuth providers
 * @returns {string[]} List of configured provider names
 */
export function getAvailableProviders() {
  return Object.keys(providerConfigs).filter(isProviderConfigured);
}

/**
 * Build OAuth authorization URL
 * @param {string} provider - OAuth provider
 * @param {string} state - CSRF state parameter
 * @returns {string} Authorization URL
 */
export function getAuthorizationUrl(provider, state) {
  const config = providerConfigs[provider];
  if (!config) {
    throw new Error(`Unknown OAuth provider: ${provider}`);
  }

  const clientId = config.getClientId();
  if (!clientId) {
    throw new Error(`OAuth provider ${provider} is not configured`);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getCallbackUrl(provider),
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
  });

  // Provider-specific parameters
  if (provider === 'google') {
    params.set('access_type', 'offline');
    params.set('prompt', 'consent');
  }

  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 * @param {string} provider - OAuth provider
 * @param {string} code - Authorization code
 * @returns {Promise<Object>} Token response
 */
export async function exchangeCodeForTokens(provider, code) {
  const config = providerConfigs[provider];
  if (!config) {
    throw new Error(`Unknown OAuth provider: ${provider}`);
  }

  const clientId = config.getClientId();
  const clientSecret = config.getClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error(`OAuth provider ${provider} is not configured`);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: getCallbackUrl(provider),
    grant_type: 'authorization_code',
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
  };

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers,
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  return response.json();
}

/**
 * Fetch user profile from OAuth provider
 * @param {string} provider - OAuth provider
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<Object>} User profile
 */
export async function fetchUserProfile(provider, accessToken) {
  const config = providerConfigs[provider];
  if (!config) {
    throw new Error(`Unknown OAuth provider: ${provider}`);
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  };

  // For GitHub, also use token in header
  if (provider === 'github') {
    headers['X-GitHub-Api-Version'] = '2022-11-28';
  }

  const response = await fetch(config.userInfoUrl, { headers });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch user profile: ${error}`);
  }

  const profile = await response.json();

  // GitHub may not include email in profile, fetch separately
  if (provider === 'github' && !profile.email && config.emailUrl) {
    try {
      const emailResponse = await fetch(config.emailUrl, { headers });
      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e) => e.primary && e.verified);
        if (primaryEmail) {
          profile.email = primaryEmail.email;
        }
      }
    } catch (err) {
      console.error('[OAuth] Failed to fetch GitHub email:', err);
    }
  }

  return normalizeProfile(provider, profile);
}

/**
 * Normalize user profile from different OAuth providers
 * @param {string} provider - OAuth provider
 * @param {Object} profile - Raw profile from provider
 * @returns {Object} Normalized profile
 */
function normalizeProfile(provider, profile) {
  switch (provider) {
    case 'google':
      return {
        provider,
        providerId: profile.sub,
        email: profile.email,
        emailVerified: profile.email_verified,
        name: profile.name,
        firstName: profile.given_name,
        lastName: profile.family_name,
        picture: profile.picture,
        locale: profile.locale,
        raw: profile,
      };

    case 'github':
      return {
        provider,
        providerId: String(profile.id),
        email: profile.email,
        emailVerified: Boolean(profile.email),
        name: profile.name || profile.login,
        username: profile.login,
        picture: profile.avatar_url,
        profileUrl: profile.html_url,
        raw: profile,
      };

    default:
      return {
        provider,
        providerId: profile.id || profile.sub,
        email: profile.email,
        name: profile.name,
        raw: profile,
      };
  }
}

/**
 * Generate a username from OAuth profile
 * @param {Object} profile - Normalized OAuth profile
 * @returns {string} Generated username
 */
export function generateUsername(profile) {
  // Try to use existing username (GitHub)
  if (profile.username) {
    return profile.username;
  }

  // Generate from email
  if (profile.email) {
    const emailPart = profile.email.split('@')[0];
    // Remove special characters and truncate
    return emailPart.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
  }

  // Generate from name
  if (profile.name) {
    return profile.name.replace(/\s+/g, '').toLowerCase().slice(0, 20);
  }

  // Fallback to provider ID
  return `${profile.provider}_${profile.providerId.slice(0, 8)}`;
}

/**
 * OAuth state storage (in-memory, use Redis in production)
 */
const stateStore = new Map();
const STATE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Store OAuth state for verification
 * @param {string} state - State parameter
 * @param {Object} data - Additional data to store
 */
export function storeOAuthState(state, data = {}) {
  stateStore.set(state, {
    ...data,
    createdAt: Date.now(),
  });

  // Clean up expired states
  for (const [key, value] of stateStore.entries()) {
    if (Date.now() - value.createdAt > STATE_TTL) {
      stateStore.delete(key);
    }
  }
}

/**
 * Verify and consume OAuth state
 * @param {string} state - State parameter to verify
 * @returns {Object|null} Stored data or null if invalid
 */
export function verifyOAuthState(state) {
  const data = stateStore.get(state);

  if (!data) {
    return null;
  }

  // Check expiration
  if (Date.now() - data.createdAt > STATE_TTL) {
    stateStore.delete(state);
    return null;
  }

  // Consume state (one-time use)
  stateStore.delete(state);

  return data;
}
