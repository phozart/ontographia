// pages/api/auth/login.js
// Authentication API endpoint with JWT tokens

import { userRepository } from '../../../lib/repositories';
import {
  signToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  withRateLimit,
} from '../../../lib/auth';

/**
 * Login handler
 * POST /api/auth/login
 * Body: { username: string, password: string } or { email: string, password: string }
 * Returns: { user, accessToken, expiresIn }
 */
async function loginHandler(req, res) {
  // Ensure seed admin exists
  try {
    await userRepository.ensureSeedAdmin();
  } catch (err) {
    console.error('Seed admin failed', err);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, password } = req.body || {};

  // Allow login with either username or email
  const identifier = username || email;

  if (!identifier || !password) {
    return res.status(400).json({
      error: 'Username/email and password are required',
      code: 'MISSING_CREDENTIALS',
    });
  }

  try {
    // Try to find user by username first, then by email
    let user = null;

    if (username) {
      user = await userRepository.verifyUser(username, password);
    }

    if (!user && email) {
      // Find by email and verify password manually
      const userByEmail = await userRepository.findByEmail(email);
      if (userByEmail) {
        const { comparePasswordSync } = await import('../../../lib/auth/passwords');
        const passwordHash = await userRepository.getPasswordHash(userByEmail.id);
        if (passwordHash && comparePasswordSync(password, passwordHash)) {
          await userRepository.recordLogin(userByEmail.username);
          user = await userRepository.findById(userByEmail.id);
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate access token (short-lived, 15 minutes)
    const accessToken = signToken(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      { expiresIn: '15m' }
    );

    // Generate refresh token (long-lived, 7 days)
    const { token: refreshToken, tokenId, expiresAt } = generateRefreshToken(user.id);

    // Save refresh token to database for validation
    await userRepository.saveRefreshToken(user.id, tokenId, expiresAt);

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(res, refreshToken, expiresAt);

    // Return user info and access token
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        personalDomainId: user.personalDomainId,
        settings: user.settings,
      },
      accessToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
      tokenType: 'Bearer',
    });
  } catch (err) {
    console.error('Login handler error', err);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'SERVER_ERROR',
    });
  }
}

// Apply rate limiting: 10 attempts per minute per IP
export default withRateLimit(loginHandler, { maxRequests: 10 });
