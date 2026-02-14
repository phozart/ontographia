// lib/api/errorResponse.js
// Consistent error response utility for API routes
// Masks error details in production, preserves them in development

const isProd = process.env.NODE_ENV === 'production';

/**
 * Send a consistent error response.
 * In production, only the generic message is sent to the client.
 * In development, error details are included for debugging.
 *
 * @param {object} res - Next.js response object
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} message - Public-facing error message
 * @param {Error|string} [err] - The actual error (logged server-side, hidden from client in production)
 */
export function errorResponse(res, statusCode, message, err) {
  if (err) {
    console.error(`[API ${statusCode}] ${message}:`, err);
  }

  const body = { error: message };

  if (!isProd && err) {
    body.details = typeof err === 'string' ? err : err.message;
  }

  return res.status(statusCode).json(body);
}
