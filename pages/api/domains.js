// pages/api/domains.js
// Domain management API

import { domainRepository } from '../../lib/repositories';

function getUserFromReq(req) {
  const user = req.headers['x-user'];
  const role = req.headers['x-role'];
  if (!user || !role) return null;
  return { user, role };
}

export default async function handler(req, res) {
  const ctx = getUserFromReq(req);
  if (!ctx) return res.status(401).json({ error: 'Missing user/role headers' });
  const { user, role } = ctx;

  try {
    if (req.method === 'GET') {
      const domains = await domainRepository.findAccessibleByUser(user, role);
      return res.status(200).json(domains);
    }

    if (req.method === 'POST') {
      const { name } = req.body || {};
      if (!name) return res.status(400).json({ error: 'name is required' });

      try {
        const created = await domainRepository.createDomain(req.body, user);
        return res.status(201).json(created);
      } catch (err) {
        if (err.message.includes('required')) {
          return res.status(400).json({ error: err.message });
        }
        throw err;
      }
    }

    if (req.method === 'PATCH') {
      const { domainId, action, targetUser, targetRole = 'viewer' } = req.body || {};
      if (!domainId || !action) return res.status(400).json({ error: 'domainId and action are required' });

      const { isOwner, domain } = await domainRepository.checkOwnership(domainId, user, role);
      if (!domain) return res.status(404).json({ error: 'Domain not found' });
      if (!isOwner) return res.status(403).json({ error: 'Not allowed' });

      if (action === 'share') {
        if (!targetUser) return res.status(400).json({ error: 'targetUser required' });
        await domainRepository.shareDomain(domainId, targetUser, targetRole);
      } else if (action === 'unshare') {
        if (!targetUser) return res.status(400).json({ error: 'targetUser required' });
        await domainRepository.unshareDomain(domainId, targetUser);
      } else {
        return res.status(400).json({ error: 'Unknown action' });
      }

      const updated = await domainRepository.findByIdWithMembers(domainId);
      return res.status(200).json(updated);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Domains API error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
