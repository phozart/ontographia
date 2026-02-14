// pages/api/auth/oauth/[provider].js
// OAuth authentication handler for Google and GitHub

import { userRepository } from '../../../../lib/repositories';
import {
  signToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  isProviderConfigured,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  fetchUserProfile,
  generateOAuthState,
  storeOAuthState,
  verifyOAuthState,
  OAUTH_PROVIDERS,
} from '../../../../lib/auth';

/**
 * OAuth handler
 * GET /api/auth/oauth/[provider] - Start OAuth flow
 * GET /api/auth/oauth/[provider]?code=xxx&state=xxx - OAuth callback
 */
export default async function oauthHandler(req, res) {
  const { provider } = req.query;

  // Validate provider
  if (!OAUTH_PROVIDERS[provider]) {
    return res.status(400).json({
      error: `Unknown OAuth provider: ${provider}`,
      code: 'UNKNOWN_PROVIDER',
      supported: Object.keys(OAUTH_PROVIDERS),
    });
  }

  // Check if provider is configured
  if (!isProviderConfigured(provider)) {
    return res.status(503).json({
      error: `OAuth provider ${provider} is not configured`,
      code: 'PROVIDER_NOT_CONFIGURED',
    });
  }

  const { code, state, error, error_description } = req.query;

  // Handle OAuth error callback
  if (error) {
    console.error(`OAuth error from ${provider}:`, error, error_description);
    return redirectWithError(res, error_description || error);
  }

  // Handle OAuth callback (has code and state)
  if (code && state) {
    return handleOAuthCallback(req, res, provider, code, state);
  }

  // Start OAuth flow (no code)
  return startOAuthFlow(req, res, provider);
}

/**
 * Start OAuth flow by redirecting to provider
 */
function startOAuthFlow(req, res, provider) {
  // Generate CSRF state
  const state = generateOAuthState();

  // Store state for verification
  const returnUrl = req.query.returnUrl || '/';
  storeOAuthState(state, { returnUrl });

  // Get authorization URL
  const authUrl = getAuthorizationUrl(provider, state);

  // Redirect to OAuth provider
  return res.redirect(authUrl);
}

/**
 * Handle OAuth callback after user authorizes
 */
async function handleOAuthCallback(req, res, provider, code, state) {
  try {
    // Verify state (CSRF protection)
    const stateData = verifyOAuthState(state);
    if (!stateData) {
      return redirectWithError(res, 'Invalid or expired OAuth state');
    }

    const { returnUrl = '/' } = stateData;

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(provider, code);

    if (!tokens.access_token) {
      console.error('No access token in OAuth response:', tokens);
      return redirectWithError(res, 'Failed to get access token');
    }

    // Fetch user profile from OAuth provider
    const profile = await fetchUserProfile(provider, tokens.access_token);

    if (!profile || !profile.providerId) {
      return redirectWithError(res, 'Failed to get user profile');
    }

    // Find or create user in our database
    const { user, created } = await userRepository.findOrCreateOAuthUser(provider, profile);

    if (!user) {
      return redirectWithError(res, 'Failed to create user account');
    }

    // Generate access token
    const accessToken = signToken(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      { expiresIn: '15m' }
    );

    // Generate refresh token
    const { token: refreshToken, tokenId, expiresAt } = generateRefreshToken(user.id);

    // Save refresh token
    await userRepository.saveRefreshToken(user.id, tokenId, expiresAt);

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken, expiresAt);

    // Redirect to app with success
    // We pass the access token via a short-lived fragment for the frontend to pick up
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = new URL('/auth/callback', baseUrl);
    successUrl.searchParams.set('success', 'true');
    successUrl.searchParams.set('returnUrl', returnUrl);
    // Token is passed as fragment (not sent to server on subsequent requests)
    const redirectUrl = `${successUrl.toString()}#token=${accessToken}`;

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('OAuth callback error:', err);
    return redirectWithError(res, err.message || 'OAuth authentication failed');
  }
}

/**
 * Redirect to error page with error message
 */
function redirectWithError(res, message) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const errorUrl = new URL('/auth/callback', baseUrl);
  errorUrl.searchParams.set('error', message);
  return res.redirect(errorUrl.toString());
}
