// pages/api/auth/me.js
// Current user API endpoint

import { userRepository } from '../../../lib/repositories';
import { withAuth } from '../../../lib/auth';

/**
 * Get current user handler
 * GET /api/auth/me
 * Requires authentication
 * Returns: { user }
 */
async function meHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // User is attached by withAuth middleware
    const { user } = req;

    // Get fresh user data from database
    const freshUser = await userRepository.findById(user.id);

    if (!freshUser) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Get user settings
    const settings = await userRepository.getUserSettings(user.id);

    return res.status(200).json({
      user: {
        id: freshUser.id,
        username: freshUser.username,
        email: freshUser.email,
        role: freshUser.role,
        personalDomainId: freshUser.personalDomainId,
        createdAt: freshUser.createdAt,
        lastLoginAt: freshUser.lastLoginAt,
        loginCount: freshUser.loginCount,
        settings,
        oauthProvider: freshUser.oauthProvider,
      },
    });
  } catch (err) {
    console.error('Get current user error:', err);
    return res.status(500).json({
      error: 'Failed to get user info',
      code: 'SERVER_ERROR',
    });
  }
}

// Require authentication
export default withAuth(meHandler);
