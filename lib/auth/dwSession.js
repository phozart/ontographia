// lib/auth/dwSession.js
// Shared helpers for DW API routes that use NextAuth sessions.

import { getServerSession } from 'next-auth';
import { authOptions } from '../../pages/api/auth/[...nextauth]';

const BYPASS_ENABLED = String(process.env.DW_AUTH_BYPASS || '').toLowerCase() === 'true';

const BYPASS_USER = {
  id: 'dw-bypass-user',
  username: 'dw-bypass',
  email: 'dw-bypass@example.com',
  role: 'admin',
  bypass: true,
};

/**
 * Get the DW user from session or return the bypass user if enabled.
 * @returns {Promise<Object|null>}
 */
export async function getDwUser(req, res) {
  if (BYPASS_ENABLED) {
    return BYPASS_USER;
  }

  const session = await getServerSession(req, res, authOptions);
  return session?.user || null;
}

/**
 * Ensure a DW user is present; otherwise respond 401.
 * @returns {Promise<Object|null>} user or null if responded
 */
export async function requireDwUser(req, res) {
  const user = await getDwUser(req, res);
  if (!user?.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
}
