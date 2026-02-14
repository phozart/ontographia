// pages/api/auth/logout.js
// Logout API endpoint

import { userRepository } from '../../../lib/repositories';
import {
  verifyRefreshToken,
  getRefreshTokenFromCookies,
  clearRefreshTokenCookie,
} from '../../../lib/auth';

/**
 * Logout handler
 * POST /api/auth/logout
 * Clears refresh token cookie and invalidates token in database
 * Optional query param: ?all=true to logout from all devices
 */
export default async function logoutHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { all } = req.query;
  const logoutAll = all === 'true';

  // Get refresh token from cookie
  const refreshToken = getRefreshTokenFromCookies(req);

  // Always clear the cookie, even if token is invalid
  clearRefreshTokenCookie(res);

  if (!refreshToken) {
    // No token, but still a successful logout
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  try {
    // Verify the refresh token to get user ID
    const result = verifyRefreshToken(refreshToken);

    if (result.valid && result.userId) {
      const { userId, tokenId } = result;

      if (logoutAll) {
        // Invalidate all refresh tokens for this user
        await userRepository.invalidateAllRefreshTokens(userId);
      } else {
        // Invalidate only this specific token
        await userRepository.invalidateRefreshToken(userId, tokenId);
      }
    }

    return res.status(200).json({
      success: true,
      message: logoutAll ? 'Logged out from all devices' : 'Logged out successfully',
    });
  } catch (err) {
    console.error('Logout error:', err);
    // Still return success since cookie is cleared
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}
