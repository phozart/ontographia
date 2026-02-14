// pages/api/auth/refresh.js
// Token refresh API endpoint

import { userRepository } from '../../../lib/repositories';
import {
  signToken,
  verifyRefreshToken,
  generateRefreshToken,
  getRefreshTokenFromCookies,
  setRefreshTokenCookie,
  withRateLimit,
} from '../../../lib/auth';

/**
 * Token refresh handler
 * POST /api/auth/refresh
 * Uses refresh token from httpOnly cookie
 * Returns: { accessToken, expiresIn }
 */
async function refreshHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get refresh token from cookie
  const refreshToken = getRefreshTokenFromCookies(req);

  if (!refreshToken) {
    return res.status(401).json({
      error: 'No refresh token provided',
      code: 'NO_REFRESH_TOKEN',
    });
  }

  // Verify the refresh token
  const result = verifyRefreshToken(refreshToken);

  if (!result.valid) {
    return res.status(401).json({
      error: result.error || 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN',
    });
  }

  const { userId, tokenId } = result;

  try {
    // Validate token exists in database and hasn't been revoked
    const isValid = await userRepository.validateRefreshToken(userId, tokenId);

    if (!isValid) {
      return res.status(401).json({
        error: 'Refresh token has been revoked',
        code: 'TOKEN_REVOKED',
      });
    }

    // Get fresh user data
    const user = await userRepository.findById(userId);

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Generate new access token
    const accessToken = signToken(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      { expiresIn: '15m' }
    );

    // Optionally rotate refresh token (more secure but can cause issues with concurrent requests)
    // For simplicity, we'll keep the same refresh token
    // Uncomment below to enable refresh token rotation:
    /*
    // Invalidate old token
    await userRepository.invalidateRefreshToken(userId, tokenId);

    // Generate new refresh token
    const { token: newRefreshToken, tokenId: newTokenId, expiresAt } = generateRefreshToken(userId);

    // Save new token
    await userRepository.saveRefreshToken(userId, newTokenId, expiresAt);

    // Set new cookie
    setRefreshTokenCookie(res, newRefreshToken, expiresAt);
    */

    return res.status(200).json({
      accessToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
      tokenType: 'Bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    return res.status(500).json({
      error: 'Failed to refresh token',
      code: 'SERVER_ERROR',
    });
  }
}

// Apply rate limiting: 30 refreshes per minute per IP
export default withRateLimit(refreshHandler, { maxRequests: 30 });
