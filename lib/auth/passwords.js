// lib/auth/passwords.js
// Password hashing utilities using bcryptjs

import bcrypt from 'bcryptjs';

/**
 * Get the number of bcrypt salt rounds from environment
 * @returns {number} Salt rounds (default: 10)
 */
function getSaltRounds() {
  const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);
  return isNaN(rounds) ? 10 : rounds;
}

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const saltRounds = getSaltRounds();
  return bcrypt.hash(password, saltRounds);
}

/**
 * Hash a password synchronously using bcrypt
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
export function hashPasswordSync(password) {
  const saltRounds = getSaltRounds();
  return bcrypt.hashSync(password, saltRounds);
}

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Bcrypt hash to compare against
 * @returns {Promise<boolean>} True if password matches
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Compare a password with a hash synchronously
 * @param {string} password - Plain text password
 * @param {string} hash - Bcrypt hash to compare against
 * @returns {boolean} True if password matches
 */
export function comparePasswordSync(password, hash) {
  return bcrypt.compareSync(password, hash);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}
