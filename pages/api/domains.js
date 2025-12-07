import { query } from '../../lib/pg';
import crypto from 'crypto';

function getUserFromReq(req) {
  const user = req.headers['x-user'];
  const role = req.headers['x-role'];
  if (!user || !role) return null;
  return { user, role };
}

async function fetchDomainsForUser(user, role) {
  if (role === 'admin') {
    const res = await query(
      `
      SELECT d.*,
             COALESCE(array_agg(dm.user_id) FILTER (WHERE dm.user_id IS NOT NULL), '{}') AS shared_with
      FROM domains d
      LEFT JOIN domain_members dm ON dm.domain_id = d.id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `,
      []
    );
    return res.rows.map(r => ({
      id: r.id,
      name: r.name,
      notes: r.notes,
      owner: r.owner,
      sharedWith: r.shared_with || [],
    }));
  }

  const res = await query(
    `
    SELECT d.*,
           COALESCE(array_agg(dm2.user_id) FILTER (WHERE dm2.user_id IS NOT NULL), '{}') AS shared_with
    FROM domains d
    LEFT JOIN domain_members dm ON dm.domain_id = d.id
    LEFT JOIN domain_members dm2 ON dm2.domain_id = d.id
    WHERE d.owner = $1 OR dm.user_id = $1
    GROUP BY d.id
    ORDER BY d.created_at DESC
    `,
    [user]
  );
  return res.rows.map(r => ({
    id: r.id,
    name: r.name,
    notes: r.notes,
    owner: r.owner,
    sharedWith: r.shared_with || [],
  }));
}

export default async function handler(req, res) {
  const ctx = getUserFromReq(req);
  if (!ctx) return res.status(401).json({ error: 'Missing user/role headers' });
  const { user, role } = ctx;

  try {
    if (req.method === 'GET') {
      const domains = await fetchDomainsForUser(user, role);
      return res.status(200).json(domains);
    }

    if (req.method === 'POST') {
      const { name, notes } = req.body || {};
      if (!name) return res.status(400).json({ error: 'name is required' });
      const id = crypto.randomUUID();
      await query('BEGIN');
      await query(
        `INSERT INTO domains (id, name, notes, owner) VALUES ($1, $2, $3, $4)`,
        [id, name, notes || '', user]
      );
      await query(
        `INSERT INTO domain_members (domain_id, user_id, role) VALUES ($1, $2, 'owner') ON CONFLICT DO NOTHING`,
        [id, user]
      );
      await query('COMMIT');
      const domains = await fetchDomainsForUser(user, role);
      const created = domains.find(d => d.id === id);
      return res.status(201).json(created || { id, name, notes, owner: user, sharedWith: [] });
    }

    if (req.method === 'PATCH') {
      const { domainId, action, targetUser, targetRole = 'viewer' } = req.body || {};
      if (!domainId || !action) return res.status(400).json({ error: 'domainId and action are required' });

      const domRes = await query('SELECT * FROM domains WHERE id = $1', [domainId]);
      const domain = domRes.rows[0];
      if (!domain) return res.status(404).json({ error: 'Domain not found' });
      const isOwner = domain.owner === user || role === 'admin';
      if (!isOwner) return res.status(403).json({ error: 'Not allowed' });

      if (action === 'share') {
        if (!targetUser) return res.status(400).json({ error: 'targetUser required' });
        await query(
          `INSERT INTO domain_members (domain_id, user_id, role)
           VALUES ($1, $2, $3)
           ON CONFLICT (domain_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
          [domainId, targetUser, targetRole]
        );
      } else if (action === 'unshare') {
        if (!targetUser) return res.status(400).json({ error: 'targetUser required' });
        await query(
          `DELETE FROM domain_members WHERE domain_id = $1 AND user_id = $2`,
          [domainId, targetUser]
        );
      } else {
        return res.status(400).json({ error: 'Unknown action' });
      }

      const domains = await fetchDomainsForUser(user, role);
      const updated = domains.find(d => d.id === domainId);
      return res.status(200).json(updated || null);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Domains API error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
