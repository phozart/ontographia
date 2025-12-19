/**
 * User Menu Configuration API
 *
 * GET - Get the admin-managed default menu configuration
 *
 * Note: Menu configuration is admin-only. Users receive the default
 * configuration defined by admins via /admin/menu-config.
 */

import { menuRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const { method } = req;

  const user = req.headers['x-user'];
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    switch (method) {
      case 'GET': {
        // Get default configuration (admin-managed)
        const defaultConfig = await menuRepository.getDefaultConfig();

        // Also get all available menu items for reference
        const items = await menuRepository.getMenuItems();

        return res.json({
          config: defaultConfig?.config || null,
          version: defaultConfig?.version || 0,
          availableItems: items,
        });
      }

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('[API /user/menu-config]', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
