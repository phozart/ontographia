// lib/auth/index.js
// Main authentication module exports

// React Auth Context and Hook
export { AuthContext, AuthProvider, AUTH_ACTIONS, authReducer } from './AuthContext';
export { useAuth } from './useAuth';

// API Route Auth Guards
export {
  withApiAuth,
  withProjectAuth,
  withDomainAuth,
  withAdminAuth as withApiAdminAuth,
  withEditorAuth as withApiEditorAuth,
  withOptionalAuth as withApiOptionalAuth,
  composeMiddleware,
  createAuthGuard,
} from './withApiAuth';

// JWT utilities
export {
  signToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken,
  extractBearerToken,
  generateSecureToken,
} from './jwt';

// Password utilities
export {
  hashPassword,
  hashPasswordSync,
  comparePassword,
  comparePasswordSync,
  validatePasswordStrength,
  validateEmail,
} from './passwords';

// Middleware
export {
  withAuth,
  withOptionalAuth,
  withAdminAuth,
  withEditorAuth,
  withRateLimit,
  getUserFromRequest,
  getClientIp,
  checkRateLimit,
  parseCookies,
  getRefreshTokenFromCookies,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE,
} from './middleware';

// OAuth
export {
  OAUTH_PROVIDERS,
  isProviderConfigured,
  getAvailableProviders,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  fetchUserProfile,
  generateUsername,
  generateOAuthState,
  storeOAuthState,
  verifyOAuthState,
} from './oauth';

// RBAC (Role-Based Access Control)
// Re-export commonly used RBAC utilities
export {
  ROLES,
  PERMISSIONS,
  hasPermission,
  hasRole,
  can,
  canAccessSpace,
  canEditInSpace,
  withPermission,
  withRole,
  withProjectAccess,
  withDomainAccess,
} from './rbac';
