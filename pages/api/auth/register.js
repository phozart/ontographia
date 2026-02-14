// pages/api/auth/register.js
// User registration API endpoint

import { userRepository } from '../../../lib/repositories';
import {
  signToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  validatePasswordStrength,
  validateEmail,
  withRateLimit,
} from '../../../lib/auth';

/**
 * Registration handler
 * POST /api/auth/register
 * Body: { email: string, password: string, username?: string }
 * Returns: { user, accessToken, expiresIn }
 */
async function registerHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, username } = req.body || {};

  // Validate email
  if (!email) {
    return res.status(400).json({
      error: 'Email is required',
      code: 'EMAIL_REQUIRED',
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
      code: 'INVALID_EMAIL',
    });
  }

  // Validate password
  if (!password) {
    return res.status(400).json({
      error: 'Password is required',
      code: 'PASSWORD_REQUIRED',
    });
  }

  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      error: passwordValidation.errors.join(', '),
      code: 'WEAK_PASSWORD',
      details: passwordValidation.errors,
    });
  }

  try {
    // Check if email already exists
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        error: 'Email already registered',
        code: 'EMAIL_EXISTS',
      });
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await userRepository.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({
          error: 'Username already taken',
          code: 'USERNAME_EXISTS',
        });
      }
    }

    // Create the user
    const user = await userRepository.createUserWithEmail({
      email,
      password,
      username,
    });

    if (!user) {
      return res.status(500).json({
        error: 'Failed to create user',
        code: 'CREATE_FAILED',
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

    // Save refresh token to database
    await userRepository.saveRefreshToken(user.id, tokenId, expiresAt);

    // Set refresh token as httpOnly cookie
    setRefreshTokenCookie(res, refreshToken, expiresAt);

    // Return user info and access token
    return res.status(201).json({
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
    console.error('Registration error:', err);

    // Handle specific errors
    if (err.message === 'Email already registered') {
      return res.status(409).json({
        error: 'Email already registered',
        code: 'EMAIL_EXISTS',
      });
    }

    if (err.message === 'Username already taken') {
      return res.status(409).json({
        error: 'Username already taken',
        code: 'USERNAME_EXISTS',
      });
    }

    return res.status(500).json({
      error: 'Failed to register user',
      code: 'SERVER_ERROR',
    });
  }
}

// Apply rate limiting: 5 registrations per minute per IP
export default withRateLimit(registerHandler, { maxRequests: 5 });
