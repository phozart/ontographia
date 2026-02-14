// pages/api/auth/providers.js
// Get available OAuth providers

import { getAvailableProviders, OAUTH_PROVIDERS } from '../../../lib/auth';

/**
 * Get available authentication providers
 * GET /api/auth/providers
 * Returns list of configured OAuth providers
 */
export default function providersHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get configured providers
  const availableProviders = getAvailableProviders();

  // Build provider info
  const providers = availableProviders.map((provider) => ({
    id: provider,
    name: getProviderName(provider),
    authUrl: `/api/auth/oauth/${provider}`,
  }));

  return res.status(200).json({
    providers,
    // Always include email/password
    emailPassword: true,
  });
}

/**
 * Get display name for OAuth provider
 */
function getProviderName(provider) {
  const names = {
    google: 'Google',
    github: 'GitHub',
  };
  return names[provider] || provider;
}
