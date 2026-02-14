// lib/auth/middleware.js
// Authentication middleware for Next.js API routes

import { verifyToken, extractBearerToken } from './jwt';
import { userRepository } from '../repositories';

/**
 * Cookie name for refresh token
 */
export const REFRESH_TOKEN_COOKIE = 'ontographia_refresh_token';

/**
 * Cookie options for refresh token (httpOnly, secure in production)
 */
export function getRefreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  };
}

/**
 * Extract user from request (from JWT token)
 * @param {Object} req - Next.js request object
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserFromRequest(req) {
  // Try JWT token from Authorization header first
  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);

  if (token) {
    const result = verifyToken(token);
    if (result.valid && result.payload) {
      const { sub: userId, username, role } = result.payload;
      // Optionally fetch fresh user data from database
      if (userId) {
        try {
          const user = await userRepository.findById(userId);
          if (user) {
            return user;
          }
        } catch (err) {
          console.error('[Auth] Error fetching user:', err);
        }
      }
      // Fall back to token payload if database fetch fails
      return { id: userId, username, role };
    }
  }

  return null;
}

/**
 * Higher-order function that wraps an API handler with required authentication
 * @param {Function} handler - API route handler
 * @param {Object} [options] - Middleware options
 * @param {string[]} [options.roles] - Required roles (any of these)
 * @returns {Function} Wrapped handler
 */
export function withAuth(handler, options = {}) {
  const { roles } = options;

  return async function authHandler(req, res) {
    try {
      const user = await getUserFromRequest(req);

      if (!user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        });
      }

      // Check role if specified
      if (roles && roles.length > 0) {
        if (!roles.includes(user.role)) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            code: 'FORBIDDEN',
            required: roles,
            actual: user.role,
          });
        }
      }

      // Attach user to request for handler use
      req.user = user;

      // Call the original handler
      return handler(req, res);
    } catch (err) {
      console.error('[Auth Middleware] Error:', err);
      return res.status(500).json({
        error: 'Authentication error',
        code: 'AUTH_ERROR',
      });
    }
  };
}

/**
 * Higher-order function that wraps an API handler with optional authentication
 * Adds user to request if authenticated, but doesn't require it
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler
 */
export function withOptionalAuth(handler) {
  return async function optionalAuthHandler(req, res) {
    try {
      const user = await getUserFromRequest(req);
      req.user = user; // May be null
      return handler(req, res);
    } catch (err) {
      console.error('[Auth Middleware] Error:', err);
      // Continue without user on error
      req.user = null;
      return handler(req, res);
    }
  };
}

/**
 * Middleware for admin-only routes
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler
 */
export function withAdminAuth(handler) {
  return withAuth(handler, { roles: ['admin'] });
}

/**
 * Middleware for editor and admin routes
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler
 */
export function withEditorAuth(handler) {
  return withAuth(handler, { roles: ['admin', 'editor'] });
}

/**
 * Parse cookies from request
 * @param {Object} req - Next.js request object
 * @returns {Object} Parsed cookies
 */
export function parseCookies(req) {
  const cookies = {};
  const cookieHeader = req.headers.cookie;

  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const [name, ...valueParts] = cookie.split('=');
      const value = valueParts.join('=');
      cookies[name.trim()] = decodeURIComponent(value.trim());
    });
  }

  return cookies;
}

/**
 * Get refresh token from cookies
 * @param {Object} req - Next.js request object
 * @returns {string|null} Refresh token or null
 */
export function getRefreshTokenFromCookies(req) {
  const cookies = parseCookies(req);
  return cookies[REFRESH_TOKEN_COOKIE] || null;
}

/**
 * Set refresh token cookie on response
 * @param {Object} res - Next.js response object
 * @param {string} token - Refresh token
 * @param {Date} expiresAt - Cookie expiration date
 */
export function setRefreshTokenCookie(res, token, expiresAt) {
  const options = getRefreshCookieOptions();
  const cookieValue = [
    `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(token)}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    `Expires=${expiresAt.toUTCString()}`,
    options.httpOnly ? 'HttpOnly' : '',
    options.secure ? 'Secure' : '',
    `SameSite=${options.sameSite}`,
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', cookieValue);
}

/**
 * Clear refresh token cookie on response
 * @param {Object} res - Next.js response object
 */
export function clearRefreshTokenCookie(res) {
  const cookieValue = [
    `${REFRESH_TOKEN_COOKIE}=`,
    'Path=/',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'HttpOnly',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
    'SameSite=lax',
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', cookieValue);
}

/**
 * Simple in-memory rate limiter
 * In production, use Redis-based rate limiting
 */
const rateLimitStore = new Map();

/**
 * Rate limit configuration
 */
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000; // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 10; // 10 requests per window

/**
 * Check rate limit for an IP address
 * @param {string} ip - Client IP address
 * @param {number} [maxRequests] - Max requests in window
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export function checkRateLimit(ip, maxRequests = RATE_LIMIT_MAX) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Clean up old entries
  const entry = rateLimitStore.get(ip);
  if (entry && entry.windowStart < windowStart) {
    rateLimitStore.delete(ip);
  }

  const current = rateLimitStore.get(ip) || {
    count: 0,
    windowStart: now,
  };

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.windowStart + RATE_LIMIT_WINDOW,
    };
  }

  current.count += 1;
  rateLimitStore.set(ip, current);

  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetAt: current.windowStart + RATE_LIMIT_WINDOW,
  };
}

/**
 * Get client IP from request
 * @param {Object} req - Next.js request object
 * @returns {string} Client IP address
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Higher-order function that adds rate limiting to a handler
 * @param {Function} handler - API route handler
 * @param {Object} [options] - Rate limit options
 * @param {number} [options.maxRequests=10] - Max requests per window
 * @returns {Function} Wrapped handler
 */
export function withRateLimit(handler, options = {}) {
  const { maxRequests = RATE_LIMIT_MAX } = options;

  return async function rateLimitedHandler(req, res) {
    const ip = getClientIp(req);
    const result = checkRateLimit(ip, maxRequests);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000));

    if (!result.allowed) {
      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMITED',
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      });
    }

    return handler(req, res);
  };
}
