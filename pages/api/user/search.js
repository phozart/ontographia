// pages/api/user/search.js
// User search API for autocomplete functionality

import { query } from '../../../lib/pg';
import { getUserFromRequest } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, domainId, limit = 10 } = req.query;

  // Require at least 2 characters for search
  if (!q || q.length < 2) {
    return res.status(200).json({ users: [] });
  }

  try {
    let sql;
    let params;

    if (domainId) {
      // If domainId provided, search only users in that domain
      sql = `
        SELECT DISTINCT u.id, u.username, u.email
        FROM users u
        INNER JOIN domain_members dm ON dm.user_id = u.id
        WHERE dm.domain_id = $1
          AND u.id != $2
          AND (u.username ILIKE $3 OR u.email ILIKE $3)
        ORDER BY u.username ASC
        LIMIT $4
      `;
      params = [domainId, user, `%${q}%`, parseInt(limit, 10)];
    } else {
      // Search all users (for admins or when no domain context)
      sql = `
        SELECT id, username, email
        FROM users
        WHERE id != $1
          AND (username ILIKE $2 OR email ILIKE $2)
        ORDER BY username ASC
        LIMIT $3
      `;
      params = [user, `%${q}%`, parseInt(limit, 10)];
    }

    const result = await query(sql, params);

    // Return users without sensitive data
    const users = result.rows.map(u => ({
      id: u.id,
      username: u.username,
      // Only show email partially for privacy
      email: u.email ? `${u.email.split('@')[0].substring(0, 3)}***@${u.email.split('@')[1]}` : null,
    }));

    return res.status(200).json({ users });
  } catch (err) {
    console.error('Error searching users:', err);
    return res.status(500).json({ error: 'Failed to search users' });
  }
}
