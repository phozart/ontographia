// pages/api/admin/page-permissions.js
// API for managing user page permissions

import { pageRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const { userId, path } = req.query;

  try {
    // GET - Get permissions for a user or all permissions
    if (req.method === 'GET') {
      if (userId) {
        const result = await pageRepository.getUserAccessiblePages(userId);
        if (!result) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(result);
      } else {
        const pages = await pageRepository.findAllPages({ activeOnly: true });
        return res.status(200).json(pages);
      }
    }

    // POST - Grant or revoke page access for a user
    if (req.method === 'POST') {
      const { user_id, page_path, can_access, granted_by } = req.body;

      if (!user_id || !page_path) {
        return res.status(400).json({ error: 'user_id and page_path are required' });
      }

      const result = await pageRepository.setUserPageAccess(
        user_id,
        page_path,
        can_access,
        granted_by
      );

      return res.status(200).json(result);
    }

    // PUT - Bulk update permissions for a user
    if (req.method === 'PUT') {
      const { user_id, permissions, granted_by } = req.body;

      if (!user_id || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ error: 'user_id and permissions array are required' });
      }

      const result = await pageRepository.bulkUpdateUserPermissions(
        user_id,
        permissions,
        granted_by
      );

      return res.status(200).json(result);
    }

    // DELETE - Remove explicit permission (fall back to default role)
    if (req.method === 'DELETE') {
      const { user_id, page_path } = req.query;

      if (!user_id || !page_path) {
        return res.status(400).json({ error: 'user_id and page_path query params are required' });
      }

      const deleted = await pageRepository.removeUserPageAccess(user_id, page_path);

      if (!deleted) {
        return res.status(404).json({ error: 'Permission not found' });
      }

      return res.status(200).json({ success: true, deleted });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Page permissions API error:', err);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
