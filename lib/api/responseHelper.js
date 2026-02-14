// lib/api/responseHelper.js
// Standard API response format helpers for Ontographia
// Task X-001: Define standard API response format

/**
 * Error codes for standardized error responses
 * @readonly
 * @enum {string}
 */
export const ERROR_CODES = Object.freeze({
  // Authentication & Authorization (4xx)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_VALUE: 'INVALID_VALUE',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  GONE: 'GONE',

  // Business logic errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',
  DEPENDENCY_ERROR: 'DEPENDENCY_ERROR',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',

  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Method errors
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
});

/**
 * HTTP status code mapping for error codes
 */
const ERROR_STATUS_MAP = {
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.TOKEN_EXPIRED]: 401,
  [ERROR_CODES.INVALID_CREDENTIALS]: 401,
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.METHOD_NOT_ALLOWED]: 405,
  [ERROR_CODES.ALREADY_EXISTS]: 409,
  [ERROR_CODES.CONFLICT]: 409,
  [ERROR_CODES.GONE]: 410,
  [ERROR_CODES.VALIDATION_ERROR]: 400,
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 400,
  [ERROR_CODES.INVALID_FORMAT]: 400,
  [ERROR_CODES.INVALID_VALUE]: 400,
  [ERROR_CODES.BUSINESS_RULE_VIOLATION]: 422,
  [ERROR_CODES.INVALID_STATE_TRANSITION]: 422,
  [ERROR_CODES.DEPENDENCY_ERROR]: 422,
  [ERROR_CODES.QUOTA_EXCEEDED]: 429,
  [ERROR_CODES.INTERNAL_ERROR]: 500,
  [ERROR_CODES.DATABASE_ERROR]: 500,
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: 502,
  [ERROR_CODES.TIMEOUT]: 504,
  [ERROR_CODES.NOT_IMPLEMENTED]: 501,
};

/**
 * Standard success response format
 * @typedef {Object} SuccessResponse
 * @property {boolean} success - Always true for success responses
 * @property {*} data - The response data
 * @property {Object} [meta] - Optional metadata (timestamps, etc.)
 */

/**
 * Standard error response format
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for error responses
 * @property {Object} error - Error details
 * @property {string} error.code - Error code from ERROR_CODES
 * @property {string} error.message - Human-readable error message
 * @property {Object} [error.details] - Additional error details
 * @property {Array} [error.fields] - Field-specific validation errors
 */

/**
 * Standard paginated response format
 * @typedef {Object} PaginatedResponse
 * @property {boolean} success - Always true for success responses
 * @property {Array} data - Array of items
 * @property {Object} pagination - Pagination metadata
 * @property {number} pagination.total - Total number of items
 * @property {number} pagination.limit - Items per page
 * @property {number} pagination.offset - Current offset
 * @property {boolean} pagination.hasMore - Whether more items exist
 */

/**
 * Send a success response
 * @param {Object} res - Next.js response object
 * @param {*} data - Response data
 * @param {number} [status=200] - HTTP status code
 * @param {Object} [meta] - Optional metadata
 * @returns {void}
 */
export function success(res, data, status = 200, meta = null) {
  const response = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = {
      timestamp: new Date().toISOString(),
      ...meta,
    };
  }

  return res.status(status).json(response);
}

/**
 * Send a created response (201)
 * @param {Object} res - Next.js response object
 * @param {*} data - Created resource data
 * @param {Object} [meta] - Optional metadata
 * @returns {void}
 */
export function created(res, data, meta = null) {
  return success(res, data, 201, meta);
}

/**
 * Send a no content response (204)
 * @param {Object} res - Next.js response object
 * @returns {void}
 */
export function noContent(res) {
  return res.status(204).end();
}

/**
 * Send an error response
 * @param {Object} res - Next.js response object
 * @param {string} code - Error code from ERROR_CODES
 * @param {string} message - Human-readable error message
 * @param {Object} [options] - Additional options
 * @param {Object} [options.details] - Additional error details
 * @param {Array} [options.fields] - Field-specific validation errors
 * @param {number} [options.status] - Override HTTP status code
 * @returns {void}
 */
export function error(res, code, message, options = {}) {
  const { details, fields, status } = options;
  const httpStatus = status || ERROR_STATUS_MAP[code] || 500;

  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  if (fields && fields.length > 0) {
    response.error.fields = fields;
  }

  return res.status(httpStatus).json(response);
}

/**
 * Send a validation error response
 * @param {Object} res - Next.js response object
 * @param {string} message - Error message
 * @param {Array<{field: string, message: string, code?: string}>} [fields] - Field errors
 * @returns {void}
 */
export function validationError(res, message, fields = []) {
  return error(res, ERROR_CODES.VALIDATION_ERROR, message, { fields });
}

/**
 * Send a not found error response
 * @param {Object} res - Next.js response object
 * @param {string} [resource='Resource'] - Resource type that wasn't found
 * @param {string} [id] - Resource ID
 * @returns {void}
 */
export function notFound(res, resource = 'Resource', id = null) {
  const message = id
    ? `${resource} with ID '${id}' not found`
    : `${resource} not found`;
  return error(res, ERROR_CODES.NOT_FOUND, message);
}

/**
 * Send an unauthorized error response
 * @param {Object} res - Next.js response object
 * @param {string} [message='Authentication required'] - Error message
 * @returns {void}
 */
export function unauthorized(res, message = 'Authentication required') {
  return error(res, ERROR_CODES.UNAUTHORIZED, message);
}

/**
 * Send a forbidden error response
 * @param {Object} res - Next.js response object
 * @param {string} [message='Permission denied'] - Error message
 * @returns {void}
 */
export function forbidden(res, message = 'Permission denied') {
  return error(res, ERROR_CODES.FORBIDDEN, message);
}

/**
 * Send a method not allowed error response
 * @param {Object} res - Next.js response object
 * @param {string[]} [allowedMethods] - List of allowed methods
 * @returns {void}
 */
export function methodNotAllowed(res, allowedMethods = []) {
  const details = allowedMethods.length > 0
    ? { allowed: allowedMethods }
    : undefined;
  return error(res, ERROR_CODES.METHOD_NOT_ALLOWED, 'Method not allowed', { details });
}

/**
 * Send a conflict error response
 * @param {Object} res - Next.js response object
 * @param {string} message - Error message
 * @param {Object} [details] - Additional details
 * @returns {void}
 */
export function conflict(res, message, details = null) {
  return error(res, ERROR_CODES.CONFLICT, message, { details });
}

/**
 * Send an internal server error response
 * @param {Object} res - Next.js response object
 * @param {string} [message='Internal server error'] - Error message
 * @param {Error} [err] - Original error (details included in development only)
 * @returns {void}
 */
export function serverError(res, message = 'Internal server error', err = null) {
  const details = process.env.NODE_ENV === 'development' && err
    ? { stack: err.stack, originalMessage: err.message }
    : undefined;
  return error(res, ERROR_CODES.INTERNAL_ERROR, message, { details });
}

/**
 * Send a paginated response
 * @param {Object} res - Next.js response object
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination info
 * @param {number} pagination.total - Total number of items
 * @param {number} pagination.limit - Items per page
 * @param {number} pagination.offset - Current offset
 * @param {Object} [meta] - Optional additional metadata
 * @returns {void}
 */
export function paginated(res, data, pagination, meta = null) {
  const { total, limit, offset } = pagination;
  const hasMore = offset + data.length < total;

  const response = {
    success: true,
    data,
    pagination: {
      total,
      limit,
      offset,
      hasMore,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
    },
  };

  if (meta) {
    response.meta = {
      timestamp: new Date().toISOString(),
      ...meta,
    };
  }

  return res.status(200).json(response);
}

/**
 * Create a standardized API handler with common patterns
 * @param {Object} handlers - HTTP method handlers
 * @param {Function} [handlers.GET] - GET handler
 * @param {Function} [handlers.POST] - POST handler
 * @param {Function} [handlers.PUT] - PUT handler
 * @param {Function} [handlers.PATCH] - PATCH handler
 * @param {Function} [handlers.DELETE] - DELETE handler
 * @returns {Function} Next.js API handler
 */
export function createHandler(handlers) {
  return async function handler(req, res) {
    const method = req.method;
    const handlerFn = handlers[method];

    if (!handlerFn) {
      const allowedMethods = Object.keys(handlers);
      return methodNotAllowed(res, allowedMethods);
    }

    try {
      await handlerFn(req, res);
    } catch (err) {
      console.error(`[API Error] ${method} ${req.url}:`, err);
      return serverError(res, 'An unexpected error occurred', err);
    }
  };
}

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {string[]} requiredFields - List of required field names
 * @returns {{valid: boolean, errors: Array<{field: string, message: string}>}}
 */
export function validateRequired(body, requiredFields) {
  const errors = [];

  for (const field of requiredFields) {
    const value = body[field];
    if (value === undefined || value === null || value === '') {
      errors.push({
        field,
        message: `${field} is required`,
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  ERROR_CODES,
  success,
  created,
  noContent,
  error,
  validationError,
  notFound,
  unauthorized,
  forbidden,
  methodNotAllowed,
  conflict,
  serverError,
  paginated,
  createHandler,
  validateRequired,
};
