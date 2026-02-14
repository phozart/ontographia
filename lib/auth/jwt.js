// lib/auth/jwt.js
// JWT token utilities for access and refresh tokens
// Uses native Node.js crypto for HMAC-based JWT signing

import crypto from 'crypto';

/**
 * Get JWT secret from environment
 * @returns {string} JWT secret
 * @throws {Error} If JWT_SECRET is not configured
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

/**
 * Get refresh token secret (derived from JWT_SECRET)
 * @returns {string} Refresh token secret
 */
function getRefreshSecret() {
  return getJwtSecret() + ':refresh';
}

/**
 * Parse duration string to milliseconds
 * @param {string} duration - Duration string (e.g., '15m', '7d', '1h')
 * @returns {number} Duration in milliseconds
 */
function parseDuration(duration) {
  if (typeof duration === 'number') {
    return duration;
  }

  const match = duration.match(/^(\d+)([smhdw])$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers = {
    s: 1000,                    // seconds
    m: 60 * 1000,               // minutes
    h: 60 * 60 * 1000,          // hours
    d: 24 * 60 * 60 * 1000,     // days
    w: 7 * 24 * 60 * 60 * 1000, // weeks
  };

  return value * multipliers[unit];
}

/**
 * Base64url encode a string
 * @param {string|Buffer} data - Data to encode
 * @returns {string} Base64url encoded string
 */
function base64urlEncode(data) {
  const str = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data));
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64url decode a string
 * @param {string} str - Base64url encoded string
 * @returns {Buffer} Decoded buffer
 */
function base64urlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = 4 - (base64.length % 4);
  const padded = padding < 4 ? base64 + '='.repeat(padding) : base64;
  return Buffer.from(padded, 'base64');
}

/**
 * Create HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} Base64url encoded signature
 */
function createSignature(data, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  return base64urlEncode(hmac.digest());
}

/**
 * Sign a JWT token
 * @param {Object} payload - Token payload
 * @param {Object} [options] - Token options
 * @param {string} [options.expiresIn='15m'] - Token expiration (e.g., '15m', '7d')
 * @param {string} [options.issuer='ontographia'] - Token issuer
 * @param {string} [options.audience] - Token audience
 * @returns {string} Signed JWT token
 */
export function signToken(payload, options = {}) {
  const {
    expiresIn = process.env.JWT_EXPIRES_IN || '15m',
    issuer = 'ontographia',
    audience,
  } = options;

  const secret = getJwtSecret();
  const now = Math.floor(Date.now() / 1000);
  const expMs = parseDuration(expiresIn);
  const exp = now + Math.floor(expMs / 1000);

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const tokenPayload = {
    ...payload,
    iat: now,
    exp,
    iss: issuer,
  };

  if (audience) {
    tokenPayload.aud = audience;
  }

  const encodedHeader = base64urlEncode(header);
  const encodedPayload = base64urlEncode(tokenPayload);
  const signature = createSignature(`${encodedHeader}.${encodedPayload}`, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @param {Object} [options] - Verification options
 * @param {string} [options.issuer='ontographia'] - Expected issuer
 * @param {string} [options.audience] - Expected audience
 * @returns {{ valid: boolean, payload?: Object, error?: string }} Verification result
 */
export function verifyToken(token, options = {}) {
  const {
    issuer = 'ontographia',
    audience,
  } = options;

  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token is required' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Invalid token format' };
  }

  const [encodedHeader, encodedPayload, signature] = parts;

  try {
    const secret = getJwtSecret();

    // Verify signature
    const expectedSignature = createSignature(`${encodedHeader}.${encodedPayload}`, secret);
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' };
    }

    // Decode payload
    const payload = JSON.parse(base64urlDecode(encodedPayload).toString());

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Token has expired' };
    }

    // Check issuer
    if (issuer && payload.iss !== issuer) {
      return { valid: false, error: 'Invalid token issuer' };
    }

    // Check audience if specified
    if (audience && payload.aud !== audience) {
      return { valid: false, error: 'Invalid token audience' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Failed to decode token' };
  }
}

/**
 * Generate a refresh token for a user
 * @param {string} userId - User ID
 * @param {Object} [options] - Token options
 * @param {string} [options.expiresIn='7d'] - Token expiration
 * @returns {{ token: string, expiresAt: Date }} Refresh token and expiration
 */
export function generateRefreshToken(userId, options = {}) {
  const { expiresIn = '7d' } = options;

  const secret = getRefreshSecret();
  const now = Math.floor(Date.now() / 1000);
  const expMs = parseDuration(expiresIn);
  const exp = now + Math.floor(expMs / 1000);

  // Generate a random token ID for revocation tracking
  const tokenId = crypto.randomBytes(16).toString('hex');

  const payload = {
    sub: userId,
    jti: tokenId,
    type: 'refresh',
    iat: now,
    exp,
  };

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const encodedHeader = base64urlEncode(header);
  const encodedPayload = base64urlEncode(payload);
  const signature = createSignature(`${encodedHeader}.${encodedPayload}`, secret);

  const token = `${encodedHeader}.${encodedPayload}.${signature}`;
  const expiresAt = new Date(exp * 1000);

  return { token, tokenId, expiresAt };
}

/**
 * Verify a refresh token
 * @param {string} token - Refresh token to verify
 * @returns {{ valid: boolean, userId?: string, tokenId?: string, error?: string }} Verification result
 */
export function verifyRefreshToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Refresh token is required' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Invalid refresh token format' };
  }

  const [encodedHeader, encodedPayload, signature] = parts;

  try {
    const secret = getRefreshSecret();

    // Verify signature
    const expectedSignature = createSignature(`${encodedHeader}.${encodedPayload}`, secret);
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid refresh token signature' };
    }

    // Decode payload
    const payload = JSON.parse(base64urlDecode(encodedPayload).toString());

    // Check token type
    if (payload.type !== 'refresh') {
      return { valid: false, error: 'Invalid token type' };
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Refresh token has expired' };
    }

    return {
      valid: true,
      userId: payload.sub,
      tokenId: payload.jti,
    };
  } catch (err) {
    return { valid: false, error: 'Failed to decode refresh token' };
  }
}

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null if not found
 */
export function extractBearerToken(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Generate a secure random token (for password reset, email verification, etc.)
 * @param {number} [length=32] - Token length in bytes
 * @returns {string} Hex-encoded random token
 */
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}
